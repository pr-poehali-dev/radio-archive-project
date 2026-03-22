"""
Auth API: регистрация, вход, выход, получение профиля.
POST /register — регистрация
POST /login    — вход
POST /logout   — выход
GET  /         — текущий пользователь (me)
PUT  /profile  — обновление профиля
"""
import json
import os
import hashlib
import secrets
import psycopg2
from psycopg2.extras import RealDictCursor


def get_conn():
    return psycopg2.connect(os.environ['DATABASE_URL'])


def get_schema():
    return os.environ.get('MAIN_DB_SCHEMA', 'public')


def hash_password(password: str) -> str:
    salt = os.environ.get('SECRET_SALT', 'radiowave_salt_2024')
    return hashlib.sha256(f"{salt}{password}".encode()).hexdigest()


def get_session_user(conn, session_id: str, schema: str):
    if not session_id:
        return None
    with conn.cursor(cursor_factory=RealDictCursor) as cur:
        cur.execute(
            f"SELECT u.id, u.email, u.username, u.role, u.is_blocked, u.avatar_url, u.created_at "
            f"FROM {schema}.sessions s JOIN {schema}.users u ON s.user_id = u.id "
            f"WHERE s.id = %s AND s.expires_at > NOW()",
            (session_id,)
        )
        return cur.fetchone()


def extract_session(event, body):
    cookie = event.get('headers', {}).get('X-Cookie', '')
    for part in cookie.split(';'):
        part = part.strip()
        if part.startswith('session='):
            return part[8:]
    sid = event.get('headers', {}).get('X-Session-Id')
    if sid:
        return sid
    return body.get('session_id')


CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-User-Id, X-Auth-Token, X-Session-Id',
    'Access-Control-Max-Age': '86400',
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

    try:
        # POST /register
        if method == 'POST' and path.endswith('/register'):
            email = (body.get('email') or '').strip().lower()
            username = (body.get('username') or '').strip()
            password = body.get('password') or ''

            if not email or not username or not password:
                return {'statusCode': 400, 'headers': CORS_HEADERS,
                        'body': json.dumps({'error': 'Заполните все поля'})}
            if len(password) < 6:
                return {'statusCode': 400, 'headers': CORS_HEADERS,
                        'body': json.dumps({'error': 'Пароль минимум 6 символов'})}

            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                cur.execute(f"SELECT id FROM {s}.users WHERE email=%s OR username=%s", (email, username))
                if cur.fetchone():
                    return {'statusCode': 409, 'headers': CORS_HEADERS,
                            'body': json.dumps({'error': 'Email или имя уже занято'})}

                pw_hash = hash_password(password)
                cur.execute(
                    f"INSERT INTO {s}.users (email, username, password_hash) VALUES (%s, %s, %s) RETURNING id, email, username, role, avatar_url, created_at",
                    (email, username, pw_hash)
                )
                user = dict(cur.fetchone())
                user['created_at'] = str(user['created_at'])

                session_id = secrets.token_hex(32)
                cur.execute(f"INSERT INTO {s}.sessions (id, user_id) VALUES (%s, %s)", (session_id, user['id']))
            conn.commit()

            return {
                'statusCode': 200,
                'headers': {**CORS_HEADERS, 'X-Set-Cookie': f'session={session_id}; Path=/; HttpOnly; SameSite=Lax; Max-Age=2592000'},
                'body': json.dumps({'user': user, 'session_id': session_id})
            }

        # POST /login
        if method == 'POST' and path.endswith('/login'):
            email = (body.get('email') or '').strip().lower()
            password = body.get('password') or ''

            if not email or not password:
                return {'statusCode': 400, 'headers': CORS_HEADERS,
                        'body': json.dumps({'error': 'Заполните все поля'})}

            pw_hash = hash_password(password)
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                cur.execute(
                    f"SELECT id, email, username, role, is_blocked, avatar_url, created_at FROM {s}.users WHERE email=%s AND password_hash=%s",
                    (email, pw_hash)
                )
                user = cur.fetchone()
                if not user:
                    return {'statusCode': 401, 'headers': CORS_HEADERS,
                            'body': json.dumps({'error': 'Неверный email или пароль'})}
                user = dict(user)
                if user.get('is_blocked'):
                    return {'statusCode': 403, 'headers': CORS_HEADERS,
                            'body': json.dumps({'error': 'Аккаунт заблокирован'})}
                user['created_at'] = str(user['created_at'])

                session_id = secrets.token_hex(32)
                cur.execute(f"INSERT INTO {s}.sessions (id, user_id) VALUES (%s, %s)", (session_id, user['id']))
            conn.commit()

            return {
                'statusCode': 200,
                'headers': {**CORS_HEADERS, 'X-Set-Cookie': f'session={session_id}; Path=/; HttpOnly; SameSite=Lax; Max-Age=2592000'},
                'body': json.dumps({'user': user, 'session_id': session_id})
            }

        # POST /logout
        if method == 'POST' and path.endswith('/logout'):
            session_id = extract_session(event, body)
            if session_id:
                with conn.cursor() as cur:
                    cur.execute(f"UPDATE {s}.sessions SET expires_at=NOW() WHERE id=%s", (session_id,))
                conn.commit()
            return {
                'statusCode': 200,
                'headers': {**CORS_HEADERS, 'X-Set-Cookie': 'session=; Path=/; HttpOnly; Max-Age=0'},
                'body': json.dumps({'ok': True})
            }

        # GET / or GET /me — текущий пользователь
        if method == 'GET':
            session_id = extract_session(event, body)
            user = get_session_user(conn, session_id, s)
            if not user:
                return {'statusCode': 401, 'headers': CORS_HEADERS,
                        'body': json.dumps({'error': 'Не авторизован'})}
            user = dict(user)
            user['created_at'] = str(user['created_at'])
            return {'statusCode': 200, 'headers': CORS_HEADERS, 'body': json.dumps({'user': user})}

        # PUT /profile — обновление профиля
        if method == 'PUT':
            session_id = extract_session(event, body)
            user = get_session_user(conn, session_id, s)
            if not user:
                return {'statusCode': 401, 'headers': CORS_HEADERS,
                        'body': json.dumps({'error': 'Не авторизован'})}

            username = (body.get('username') or '').strip()
            if username and username != user['username']:
                with conn.cursor(cursor_factory=RealDictCursor) as cur:
                    cur.execute(f"SELECT id FROM {s}.users WHERE username=%s AND id!=%s", (username, user['id']))
                    if cur.fetchone():
                        return {'statusCode': 409, 'headers': CORS_HEADERS,
                                'body': json.dumps({'error': 'Имя уже занято'})}
                    cur.execute(f"UPDATE {s}.users SET username=%s, updated_at=NOW() WHERE id=%s", (username, user['id']))
                conn.commit()

            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                cur.execute(f"SELECT id, email, username, role, is_blocked, avatar_url, created_at FROM {s}.users WHERE id=%s", (user['id'],))
                updated = dict(cur.fetchone())
                updated['created_at'] = str(updated['created_at'])
            return {'statusCode': 200, 'headers': CORS_HEADERS, 'body': json.dumps({'user': updated})}

        return {'statusCode': 404, 'headers': CORS_HEADERS, 'body': json.dumps({'error': 'Not found'})}

    finally:
        conn.close()
