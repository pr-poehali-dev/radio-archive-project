const URLS = {
  auth: 'https://functions.poehali.dev/58f65a31-9f54-4bad-8761-ec384332e80a',
  stations: 'https://functions.poehali.dev/a4179e6d-0805-4a81-b288-5116421c0125',
  users: 'https://functions.poehali.dev/f18c8ba1-9a65-4df2-b44c-287037b99ad3',
  upload: 'https://functions.poehali.dev/f3a4647f-9a32-412e-b2f5-d7854422ca5a',
};

function getSession(): string {
  return localStorage.getItem('session_id') || '';
}

function saveSession(id: string) {
  localStorage.setItem('session_id', id);
}

function clearSession() {
  localStorage.removeItem('session_id');
}

async function request(url: string, options: RequestInit = {}) {
  const sid = getSession();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };
  if (sid) headers['X-Session-Id'] = sid;

  const res = await fetch(url, { ...options, headers });
  const text = await res.text();
  let data: unknown;
  try { data = JSON.parse(text); } catch { data = text; }
  if (!res.ok) throw { status: res.status, data };
  return data;
}

// ── Auth ──────────────────────────────────────────────────────
export async function authRegister(email: string, username: string, password: string) {
  const data = await request(URLS.auth + '/register', {
    method: 'POST',
    body: JSON.stringify({ email, username, password }),
  }) as { user: User; session_id: string };
  saveSession(data.session_id);
  return data.user;
}

export async function authLogin(email: string, password: string) {
  const data = await request(URLS.auth + '/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  }) as { user: User; session_id: string };
  saveSession(data.session_id);
  return data.user;
}

export async function authLogout() {
  const sid = getSession();
  await request(URLS.auth + '/logout', {
    method: 'POST',
    body: JSON.stringify({ session_id: sid }),
  });
  clearSession();
}

export async function authMe(): Promise<User | null> {
  if (!getSession()) return null;
  try {
    const data = await request(URLS.auth) as { user: User };
    return data.user;
  } catch {
    clearSession();
    return null;
  }
}

export async function authUpdateProfile(username: string) {
  const data = await request(URLS.auth + '/profile', {
    method: 'PUT',
    body: JSON.stringify({ username }),
  }) as { user: User };
  return data.user;
}

// ── Stations ──────────────────────────────────────────────────
export async function getStations(): Promise<ApiStation[]> {
  const data = await request(URLS.stations) as { stations: ApiStation[] };
  return data.stations;
}

export async function getAllStationsAdmin(): Promise<ApiStation[]> {
  const data = await request(URLS.stations + '/all') as { stations: ApiStation[] };
  return data.stations;
}

export async function createStation(station: Partial<ApiStation>) {
  return await request(URLS.stations, {
    method: 'POST',
    body: JSON.stringify(station),
  }) as ApiStation;
}

export async function updateStation(id: number, station: Partial<ApiStation>) {
  return await request(URLS.stations + '/' + id, {
    method: 'PUT',
    body: JSON.stringify(station),
  }) as ApiStation;
}

export async function deleteStation(id: number) {
  return await request(URLS.stations + '/' + id, { method: 'DELETE' });
}

// ── Users (admin) ─────────────────────────────────────────────
export async function getUsers(): Promise<User[]> {
  const data = await request(URLS.users) as { users: User[] };
  return data.users;
}

export async function updateUser(id: number, patch: { is_blocked?: boolean; role?: string }) {
  const data = await request(URLS.users + '/' + id, {
    method: 'PUT',
    body: JSON.stringify(patch),
  }) as { user: User };
  return data.user;
}

export async function deleteUser(id: number) {
  return await request(URLS.users + '/' + id, { method: 'DELETE' });
}

// ── Upload ────────────────────────────────────────────────────
async function toBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.split(',')[1]);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export async function uploadAvatar(file: File): Promise<string> {
  const file_data = await toBase64(file);
  const data = await request(URLS.upload + '/avatar', {
    method: 'POST',
    body: JSON.stringify({ file_data, content_type: file.type }),
  }) as { url: string };
  return data.url;
}

export async function uploadStationCover(file: File, station_id: number): Promise<string> {
  const file_data = await toBase64(file);
  const data = await request(URLS.upload + '/station-cover', {
    method: 'POST',
    body: JSON.stringify({ file_data, content_type: file.type, station_id }),
  }) as { url: string };
  return data.url;
}

// ── Types ─────────────────────────────────────────────────────
export interface User {
  id: number;
  email: string;
  username: string;
  role: 'user' | 'admin';
  is_blocked: boolean;
  avatar_url: string | null;
  created_at: string;
}

export interface ApiStation {
  id: number;
  name: string;
  genre: string;
  country: string;
  language: string;
  stream_url: string;
  logo: string;
  cover_url: string | null;
  description: string;
  listeners: number;
  bitrate: number;
  tags: string[];
  is_active: boolean;
  created_by: number | null;
  created_at: string;
  updated_at: string;
}
