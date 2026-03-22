"""
Users admin API: список пользователей, блокировка, удаление (только admin).
GET    /         — список всех пользователей
PUT    /{id}     — обновить пользователя (block/unblock, role)
DELETE /{id}     — удалить пользователя
"""
import json
import os
import psycopg2
from psycopg2.extras import RealDictCursor


def get_conn():
    return psycopg2.connect(os.environ['DATABASE_URL'])


def get_schema():
    return os.environ.get('MAIN_DB_SCHEMA', 'public')


def extract_session(event):
    cookie = event.get('headers', {}).get('X-Cookie', '')
    for part in cookie.split(';'):
        part = part.strip()
        if part.startswith('session='):
            return part[8:]
    return event.get('headers', {}).get('X-Session-Id')


def get_admin_user(cur, session_id, s):
    if not session_id:
        return None
    cur.execute(
        f"SELECT u.id, u.role FROM {s}.sessions sess JOIN {s}.users u ON sess.user_id = u.id "
        f"WHERE sess.id = %s AND sess.expires_at > NOW()",
        (session_id,)
    )
    u = cur.fetchone()
    if u and u['role'] == 'admin':
        return u
    return None


CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-User-Id, X-Auth-Token, X-Session-Id',
}


def handler(event: dict, context) -> dict:
    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': CORS_HEADERS, 'body': ''}

    path = event.get('path', '').rstrip('/')
    method = event.get('httpMethod', 'GET')
    body = {}
    if event.get('body'):
        body = json.loads(event['body'])

    s = get_schema()
    conn = get_conn()
    session_id = extract_session(event)

    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            admin = get_admin_user(cur, session_id, s)

        if not admin:
            return {'statusCode': 403, 'headers': CORS_HEADERS, 'body': json.dumps({'error': 'Доступ запрещён'})}

        # GET / — список всех пользователей
        if method == 'GET':
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                cur.execute(f"SELECT id, email, username, role, is_blocked, avatar_url, created_at FROM {s}.users ORDER BY created_at DESC")
                rows = cur.fetchall()
            users = []
            for r in rows:
                u = dict(r)
                u['created_at'] = str(u['created_at'])
                users.append(u)
            return {'statusCode': 200, 'headers': CORS_HEADERS, 'body': json.dumps({'users': users})}

        # PUT /{id} — изменить роль или заблокировать
        if method == 'PUT':
            user_id = path.split('/')[-1]
            if str(user_id) == str(admin['id']):
                return {'statusCode': 400, 'headers': CORS_HEADERS, 'body': json.dumps({'error': 'Нельзя изменить себя'})}

            fields = []
            values = []
            if 'is_blocked' in body:
                fields.append("is_blocked=%s")
                values.append(bool(body['is_blocked']))
            if 'role' in body and body['role'] in ('user', 'admin'):
                fields.append("role=%s")
                values.append(body['role'])
            if not fields:
                return {'statusCode': 400, 'headers': CORS_HEADERS, 'body': json.dumps({'error': 'Нечего обновлять'})}
            fields.append("updated_at=NOW()")
            values.append(user_id)

            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                cur.execute(f"UPDATE {s}.users SET {', '.join(fields)} WHERE id=%s RETURNING id, email, username, role, is_blocked, avatar_url, created_at", values)
                updated = cur.fetchone()
            conn.commit()
            if not updated:
                return {'statusCode': 404, 'headers': CORS_HEADERS, 'body': json.dumps({'error': 'Пользователь не найден'})}
            updated = dict(updated)
            updated['created_at'] = str(updated['created_at'])
            return {'statusCode': 200, 'headers': CORS_HEADERS, 'body': json.dumps({'user': updated})}

        # DELETE /{id} — удалить пользователя
        if method == 'DELETE':
            user_id = path.split('/')[-1]
            if str(user_id) == str(admin['id']):
                return {'statusCode': 400, 'headers': CORS_HEADERS, 'body': json.dumps({'error': 'Нельзя удалить себя'})}
            with conn.cursor() as cur:
                cur.execute(f"UPDATE {s}.sessions SET expires_at=NOW() WHERE user_id=%s", (user_id,))
                cur.execute(f"DELETE FROM {s}.users WHERE id=%s", (user_id,))
            conn.commit()
            return {'statusCode': 200, 'headers': CORS_HEADERS, 'body': json.dumps({'ok': True})}

        return {'statusCode': 404, 'headers': CORS_HEADERS, 'body': json.dumps({'error': 'Not found'})}

    finally:
        conn.close()
