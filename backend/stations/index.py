"""
Stations API: получение, создание, редактирование и удаление радиостанций.
GET    /       — список станций (публичный)
GET    /all    — все станции включая неактивные (admin)
GET    /{id}   — станция по id
POST   /       — создать (только admin)
PUT    /{id}   — редактировать (только admin)
DELETE /{id}   — удалить (только admin)
"""
import json
import os
import psycopg2
from psycopg2.extras import RealDictCursor


def get_conn():
    return psycopg2.connect(os.environ['DATABASE_URL'])


def get_schema():
    return os.environ.get('MAIN_DB_SCHEMA', 'public')


def get_session_user(cur, session_id: str, s: str):
    if not session_id:
        return None
    cur.execute(
        f"SELECT u.id, u.email, u.username, u.role, u.is_blocked "
        f"FROM {s}.sessions sess JOIN {s}.users u ON sess.user_id = u.id "
        f"WHERE sess.id = %s AND sess.expires_at > NOW()",
        (session_id,)
    )
    return cur.fetchone()


def extract_session(event):
    cookie = event.get('headers', {}).get('X-Cookie', '')
    for part in cookie.split(';'):
        part = part.strip()
        if part.startswith('session='):
            return part[8:]
    return event.get('headers', {}).get('X-Session-Id')


CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-User-Id, X-Auth-Token, X-Session-Id',
}


def station_to_dict(row):
    d = dict(row)
    d['created_at'] = str(d['created_at']) if d.get('created_at') else None
    d['updated_at'] = str(d['updated_at']) if d.get('updated_at') else None
    if d.get('tags') is None:
        d['tags'] = []
    return d


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
        # GET / — список всех активных станций
        if method == 'GET' and (path == '' or path == '/'):
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                cur.execute(f"SELECT * FROM {s}.stations WHERE is_active=TRUE ORDER BY listeners DESC")
                rows = [station_to_dict(r) for r in cur.fetchall()]
            return {'statusCode': 200, 'headers': CORS_HEADERS, 'body': json.dumps({'stations': rows})}

        # GET /all — все станции включая неактивные (admin)
        if method == 'GET' and path.endswith('/all'):
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                user = get_session_user(cur, session_id, s)
            if not user or user['role'] != 'admin':
                return {'statusCode': 403, 'headers': CORS_HEADERS, 'body': json.dumps({'error': 'Доступ запрещён'})}
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                cur.execute(f"SELECT * FROM {s}.stations ORDER BY id DESC")
                rows = [station_to_dict(r) for r in cur.fetchall()]
            return {'statusCode': 200, 'headers': CORS_HEADERS, 'body': json.dumps({'stations': rows})}

        # GET /{id}
        if method == 'GET':
            station_id = path.split('/')[-1]
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                cur.execute(f"SELECT * FROM {s}.stations WHERE id=%s AND is_active=TRUE", (station_id,))
                row = cur.fetchone()
            if not row:
                return {'statusCode': 404, 'headers': CORS_HEADERS, 'body': json.dumps({'error': 'Не найдено'})}
            return {'statusCode': 200, 'headers': CORS_HEADERS, 'body': json.dumps(station_to_dict(row))}

        # Для остальных методов нужна авторизация admin
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            user = get_session_user(cur, session_id, s)
        if not user or user['role'] != 'admin':
            return {'statusCode': 403, 'headers': CORS_HEADERS, 'body': json.dumps({'error': 'Доступ запрещён'})}

        # POST / — создать станцию
        if method == 'POST':
            name = body.get('name', '').strip()
            stream_url = body.get('stream_url', '').strip()
            if not name or not stream_url:
                return {'statusCode': 400, 'headers': CORS_HEADERS, 'body': json.dumps({'error': 'name и stream_url обязательны'})}

            tags = body.get('tags', [])
            if isinstance(tags, str):
                tags = [t.strip() for t in tags.split(',') if t.strip()]

            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                cur.execute(
                    f"INSERT INTO {s}.stations (name, genre, country, language, stream_url, logo, cover_url, description, listeners, bitrate, tags, created_by) "
                    f"VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s) RETURNING *",
                    (
                        name,
                        body.get('genre', 'other'),
                        body.get('country', ''),
                        body.get('language', 'RU'),
                        stream_url,
                        body.get('logo', '📻'),
                        body.get('cover_url'),
                        body.get('description', ''),
                        int(body.get('listeners', 0)),
                        int(body.get('bitrate', 128)),
                        tags,
                        user['id']
                    )
                )
                row = cur.fetchone()
            conn.commit()
            return {'statusCode': 200, 'headers': CORS_HEADERS, 'body': json.dumps(station_to_dict(row))}

        # PUT /{id} — редактировать
        if method == 'PUT':
            station_id = path.split('/')[-1]
            tags = body.get('tags', None)
            if isinstance(tags, str):
                tags = [t.strip() for t in tags.split(',') if t.strip()]

            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                cur.execute(f"SELECT id FROM {s}.stations WHERE id=%s", (station_id,))
                if not cur.fetchone():
                    return {'statusCode': 404, 'headers': CORS_HEADERS, 'body': json.dumps({'error': 'Не найдено'})}

                fields = []
                values = []
                allowed = ['name', 'genre', 'country', 'language', 'stream_url', 'logo', 'cover_url', 'description', 'listeners', 'bitrate', 'is_active']
                for f in allowed:
                    if f in body:
                        fields.append(f"{f}=%s")
                        values.append(body[f])
                if tags is not None:
                    fields.append("tags=%s")
                    values.append(tags)
                fields.append("updated_at=NOW()")
                values.append(station_id)

                cur.execute(f"UPDATE {s}.stations SET {', '.join(fields)} WHERE id=%s RETURNING *", values)
                row = cur.fetchone()
            conn.commit()
            return {'statusCode': 200, 'headers': CORS_HEADERS, 'body': json.dumps(station_to_dict(row))}

        # DELETE /{id} — деактивировать
        if method == 'DELETE':
            station_id = path.split('/')[-1]
            with conn.cursor() as cur:
                cur.execute(f"UPDATE {s}.stations SET is_active=FALSE, updated_at=NOW() WHERE id=%s", (station_id,))
            conn.commit()
            return {'statusCode': 200, 'headers': CORS_HEADERS, 'body': json.dumps({'ok': True})}

        return {'statusCode': 404, 'headers': CORS_HEADERS, 'body': json.dumps({'error': 'Not found'})}

    finally:
        conn.close()
