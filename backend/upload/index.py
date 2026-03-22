"""
Upload API: загрузка аватара пользователя или обложки радиостанции в S3.
POST /avatar          — загрузить аватар (авторизация обязательна)
POST /station-cover   — загрузить обложку станции (только admin)
"""
import json
import os
import base64
import secrets
import psycopg2
import boto3
from psycopg2.extras import RealDictCursor


def get_conn():
    return psycopg2.connect(os.environ['DATABASE_URL'])


def get_schema():
    return os.environ.get('MAIN_DB_SCHEMA', 'public')


def get_s3():
    return boto3.client(
        's3',
        endpoint_url='https://bucket.poehali.dev',
        aws_access_key_id=os.environ['AWS_ACCESS_KEY_ID'],
        aws_secret_access_key=os.environ['AWS_SECRET_ACCESS_KEY'],
    )


def extract_session(event):
    cookie = event.get('headers', {}).get('X-Cookie', '')
    for part in cookie.split(';'):
        part = part.strip()
        if part.startswith('session='):
            return part[8:]
    return event.get('headers', {}).get('X-Session-Id')


def get_session_user(cur, session_id, s):
    if not session_id:
        return None
    cur.execute(
        f"SELECT u.id, u.email, u.username, u.role, u.is_blocked "
        f"FROM {s}.sessions sess JOIN {s}.users u ON sess.user_id = u.id "
        f"WHERE sess.id = %s AND sess.expires_at > NOW()",
        (session_id,)
    )
    return cur.fetchone()


CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-User-Id, X-Auth-Token, X-Session-Id',
}

ALLOWED_TYPES = {
    'image/jpeg': 'jpg',
    'image/jpg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
    'image/gif': 'gif',
}

MAX_SIZE = 5 * 1024 * 1024  # 5MB


def handler(event: dict, context) -> dict:
    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': CORS_HEADERS, 'body': ''}

    path = event.get('path', '').rstrip('/')
    method = event.get('httpMethod', 'GET')

    if method != 'POST':
        return {'statusCode': 405, 'headers': CORS_HEADERS, 'body': json.dumps({'error': 'Method not allowed'})}

    body = {}
    if event.get('body'):
        body = json.loads(event['body'])

    s = get_schema()
    conn = get_conn()
    session_id = extract_session(event)

    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            user = get_session_user(cur, session_id, s)

        if not user:
            return {'statusCode': 401, 'headers': CORS_HEADERS, 'body': json.dumps({'error': 'Не авторизован'})}

        file_data = body.get('file_data', '')
        content_type = body.get('content_type', 'image/jpeg')

        if not file_data:
            return {'statusCode': 400, 'headers': CORS_HEADERS, 'body': json.dumps({'error': 'Файл не передан'})}

        if content_type not in ALLOWED_TYPES:
            return {'statusCode': 400, 'headers': CORS_HEADERS, 'body': json.dumps({'error': 'Недопустимый тип файла'})}

        raw_data = base64.b64decode(file_data)
        if len(raw_data) > MAX_SIZE:
            return {'statusCode': 400, 'headers': CORS_HEADERS, 'body': json.dumps({'error': 'Файл слишком большой (макс. 5MB)'})}

        ext = ALLOWED_TYPES[content_type]
        s3 = get_s3()
        access_key = os.environ['AWS_ACCESS_KEY_ID']

        # POST /avatar
        if path.endswith('/avatar') or path == '' or path == '/':
            key = f"avatars/user_{user['id']}_{secrets.token_hex(8)}.{ext}"
            s3.put_object(Bucket='files', Key=key, Body=raw_data, ContentType=content_type)
            url = f"https://cdn.poehali.dev/projects/{access_key}/bucket/{key}"

            with conn.cursor() as cur:
                cur.execute(f"UPDATE {s}.users SET avatar_url=%s, updated_at=NOW() WHERE id=%s", (url, user['id']))
            conn.commit()
            return {'statusCode': 200, 'headers': CORS_HEADERS, 'body': json.dumps({'url': url})}

        # POST /station-cover
        if path.endswith('/station-cover'):
            if user['role'] != 'admin':
                return {'statusCode': 403, 'headers': CORS_HEADERS, 'body': json.dumps({'error': 'Доступ запрещён'})}
            station_id = body.get('station_id')
            if not station_id:
                return {'statusCode': 400, 'headers': CORS_HEADERS, 'body': json.dumps({'error': 'station_id обязателен'})}

            key = f"stations/cover_{station_id}_{secrets.token_hex(8)}.{ext}"
            s3.put_object(Bucket='files', Key=key, Body=raw_data, ContentType=content_type)
            url = f"https://cdn.poehali.dev/projects/{access_key}/bucket/{key}"

            with conn.cursor() as cur:
                cur.execute(f"UPDATE {s}.stations SET cover_url=%s, updated_at=NOW() WHERE id=%s", (url, station_id))
            conn.commit()
            return {'statusCode': 200, 'headers': CORS_HEADERS, 'body': json.dumps({'url': url})}

        return {'statusCode': 404, 'headers': CORS_HEADERS, 'body': json.dumps({'error': 'Not found'})}

    finally:
        conn.close()
