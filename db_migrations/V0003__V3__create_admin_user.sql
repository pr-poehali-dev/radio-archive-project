-- Создаём администратора: admin@radiowave.ru / admin123
-- Пароль захеширован как SHA256(radiowave_salt_2024 + admin123)
INSERT INTO users (email, username, password_hash, role)
VALUES (
  'admin@radiowave.ru',
  'admin',
  '3e4e5e9dca9b6cbed4f40a694e68c9d7c6dc9a0527f08c37649f5f92c8bc1e2a',
  'admin'
)
ON CONFLICT (email) DO NOTHING;
