import { useState, useEffect, useRef } from 'react';
import { User, ApiStation, getUsers, getAllStationsAdmin, createStation, updateStation, deleteStation, updateUser, deleteUser, uploadStationCover } from '@/lib/api';
import { GENRES } from '@/data/stations';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface AdminPageProps {
  currentUserId: number;
}

const EMPTY_STATION: Partial<ApiStation> = {
  name: '', genre: 'pop', country: '', language: 'RU',
  stream_url: '', logo: '📻', description: '', listeners: 0, bitrate: 128, tags: [],
};

export default function AdminPage({ currentUserId }: AdminPageProps) {
  const [tab, setTab] = useState<'stations' | 'users'>('stations');
  const [stations, setStations] = useState<ApiStation[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [stationModal, setStationModal] = useState<{ open: boolean; data: Partial<ApiStation>; id?: number }>({ open: false, data: EMPTY_STATION });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const coverRef = useRef<HTMLInputElement>(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    setLoading(true);
    Promise.all([getAllStationsAdmin(), getUsers()])
      .then(([s, u]) => { setStations(s); setUsers(u); })
      .finally(() => setLoading(false));
  }, []);

  const openCreate = () => setStationModal({ open: true, data: { ...EMPTY_STATION } });
  const openEdit = (s: ApiStation) => setStationModal({ open: true, data: { ...s, tags: s.tags || [] }, id: s.id });

  const handleSaveStation = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setSaving(true);
    try {
      const d = { ...stationModal.data };
      if (typeof d.tags === 'string') {
        d.tags = (d.tags as unknown as string).split(',').map((t: string) => t.trim()).filter(Boolean);
      }
      let saved: ApiStation;
      if (stationModal.id) {
        saved = await updateStation(stationModal.id, d);
        setStations(prev => prev.map(s => s.id === saved.id ? saved : s));
      } else {
        saved = await createStation(d);
        setStations(prev => [saved, ...prev]);
      }
      if (coverFile) {
        const url = await uploadStationCover(coverFile, saved.id);
        setStations(prev => prev.map(s => s.id === saved.id ? { ...s, cover_url: url } : s));
        setCoverFile(null);
      }
      setStationModal({ open: false, data: EMPTY_STATION });
    } catch (err: unknown) {
      const e = err as { data?: { error?: string } };
      setError(e?.data?.error || 'Ошибка при сохранении');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteStation = async (id: number) => {
    if (!confirm('Удалить станцию?')) return;
    await deleteStation(id);
    setStations(prev => prev.filter(s => s.id !== id));
  };

  const handleToggleBlock = async (u: User) => {
    const updated = await updateUser(u.id, { is_blocked: !u.is_blocked });
    setUsers(prev => prev.map(x => x.id === updated.id ? updated : x));
  };

  const handleDeleteUser = async (id: number) => {
    if (!confirm('Удалить пользователя? Это действие необратимо.')) return;
    await deleteUser(id);
    setUsers(prev => prev.filter(u => u.id !== id));
  };

  const handleToggleRole = async (u: User) => {
    const newRole = u.role === 'admin' ? 'user' : 'admin';
    const updated = await updateUser(u.id, { role: newRole });
    setUsers(prev => prev.map(x => x.id === updated.id ? updated : x));
  };

  const filteredStations = stations.filter(s =>
    !search || s.name.toLowerCase().includes(search.toLowerCase()) || s.genre.toLowerCase().includes(search.toLowerCase())
  );
  const filteredUsers = users.filter(u =>
    !search || u.username.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase())
  );

  const tagsString = Array.isArray(stationModal.data.tags) ? stationModal.data.tags.join(', ') : stationModal.data.tags || '';

  return (
    <div className="p-4 md:p-8 animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'hsl(280 70% 60% / 0.2)' }}>
          <Icon name="Shield" size={20} style={{ color: 'hsl(280 70% 70%)' }} />
        </div>
        <div>
          <h2 className="font-oswald font-bold text-xl md:text-2xl text-foreground">Панель администратора</h2>
          <p className="text-xs text-muted-foreground">Управление станциями и пользователями</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex rounded-xl bg-card border border-border p-1 mb-6 w-fit">
        {([['stations', 'Radio', 'Станции'], ['users', 'Users', 'Пользователи']] as const).map(([id, icon, label]) => (
          <button
            key={id}
            onClick={() => { setTab(id); setSearch(''); }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === id ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}
          >
            <Icon name={icon} size={15} />
            {label}
            <span className="ml-1 px-1.5 py-0.5 text-xs rounded-full bg-black/20">
              {id === 'stations' ? stations.length : users.length}
            </span>
          </button>
        ))}
      </div>

      {/* Search + Add */}
      <div className="flex gap-3 mb-4">
        <div className="relative flex-1">
          <Icon name="Search" size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={tab === 'stations' ? 'Поиск станции...' : 'Поиск пользователя...'}
            className="w-full pl-9 pr-4 py-2 text-sm rounded-xl bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary"
          />
        </div>
        {tab === 'stations' && (
          <Button onClick={openCreate} className="flex items-center gap-2 shrink-0">
            <Icon name="Plus" size={15} />
            Добавить
          </Button>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16 text-muted-foreground">
          <Icon name="Loader" size={24} className="animate-spin mr-2" />
          Загрузка...
        </div>
      ) : tab === 'stations' ? (
        /* Stations table */
        <div className="rounded-2xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-card">
                  <th className="text-left p-3 text-muted-foreground font-medium">Станция</th>
                  <th className="text-left p-3 text-muted-foreground font-medium hidden md:table-cell">Жанр</th>
                  <th className="text-left p-3 text-muted-foreground font-medium hidden md:table-cell">Слушатели</th>
                  <th className="text-left p-3 text-muted-foreground font-medium">Статус</th>
                  <th className="text-right p-3 text-muted-foreground font-medium">Действия</th>
                </tr>
              </thead>
              <tbody>
                {filteredStations.map(s => (
                  <tr key={s.id} className="border-b border-border/50 hover:bg-card/80 transition-colors">
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        {s.cover_url ? (
                          <img src={s.cover_url} alt={s.name} className="w-9 h-9 rounded-lg object-cover" />
                        ) : (
                          <div className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center text-lg">{s.logo}</div>
                        )}
                        <div>
                          <p className="font-medium text-foreground">{s.name}</p>
                          <p className="text-xs text-muted-foreground">{s.country}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-3 hidden md:table-cell">
                      <span className="text-xs px-2 py-1 rounded-full bg-secondary text-muted-foreground">{s.genre}</span>
                    </td>
                    <td className="p-3 hidden md:table-cell text-muted-foreground">{s.listeners.toLocaleString()}</td>
                    <td className="p-3">
                      <span className={`text-xs px-2 py-1 rounded-full ${s.is_active ? 'bg-primary/15 text-primary' : 'bg-destructive/15 text-destructive'}`}>
                        {s.is_active ? 'Активна' : 'Скрыта'}
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => openEdit(s)} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground">
                          <Icon name="Pencil" size={14} />
                        </button>
                        <button onClick={() => handleDeleteStation(s.id)} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-destructive/10 transition-colors text-muted-foreground hover:text-destructive">
                          <Icon name="Trash2" size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Users table */
        <div className="rounded-2xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-card">
                  <th className="text-left p-3 text-muted-foreground font-medium">Пользователь</th>
                  <th className="text-left p-3 text-muted-foreground font-medium hidden md:table-cell">Роль</th>
                  <th className="text-left p-3 text-muted-foreground font-medium">Статус</th>
                  <th className="text-left p-3 text-muted-foreground font-medium hidden lg:table-cell">Дата</th>
                  <th className="text-right p-3 text-muted-foreground font-medium">Действия</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map(u => (
                  <tr key={u.id} className="border-b border-border/50 hover:bg-card/80 transition-colors">
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        {u.avatar_url ? (
                          <img src={u.avatar_url} alt={u.username} className="w-8 h-8 rounded-full object-cover" />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                            <Icon name="User" size={14} className="text-muted-foreground" />
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-foreground">{u.username}</p>
                          <p className="text-xs text-muted-foreground">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-3 hidden md:table-cell">
                      <span className={`text-xs px-2 py-1 rounded-full ${u.role === 'admin' ? 'bg-purple-500/15 text-purple-400' : 'bg-secondary text-muted-foreground'}`}>
                        {u.role === 'admin' ? '👑 Admin' : '🎧 User'}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className={`text-xs px-2 py-1 rounded-full ${u.is_blocked ? 'bg-destructive/15 text-destructive' : 'bg-primary/15 text-primary'}`}>
                        {u.is_blocked ? 'Заблокирован' : 'Активен'}
                      </span>
                    </td>
                    <td className="p-3 hidden lg:table-cell text-xs text-muted-foreground">
                      {new Date(u.created_at).toLocaleDateString('ru-RU')}
                    </td>
                    <td className="p-3">
                      {u.id !== currentUserId && (
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleToggleRole(u)}
                            title={u.role === 'admin' ? 'Разжаловать' : 'Назначить админом'}
                            className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
                          >
                            <Icon name="Shield" size={14} />
                          </button>
                          <button
                            onClick={() => handleToggleBlock(u)}
                            title={u.is_blocked ? 'Разблокировать' : 'Заблокировать'}
                            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${u.is_blocked ? 'hover:bg-primary/10 text-muted-foreground hover:text-primary' : 'hover:bg-yellow-500/10 text-muted-foreground hover:text-yellow-400'}`}
                          >
                            <Icon name={u.is_blocked ? 'Unlock' : 'Lock'} size={14} />
                          </button>
                          <button
                            onClick={() => handleDeleteUser(u.id)}
                            className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-destructive/10 transition-colors text-muted-foreground hover:text-destructive"
                          >
                            <Icon name="Trash2" size={14} />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Station modal */}
      <Dialog open={stationModal.open} onOpenChange={v => { if (!v) setStationModal({ open: false, data: EMPTY_STATION }); }}>
        <DialogContent className="sm:max-w-lg bg-card border-border max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-foreground">
              {stationModal.id ? 'Редактировать станцию' : 'Добавить станцию'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSaveStation} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <Label className="text-foreground">Название *</Label>
                <Input value={stationModal.data.name || ''} onChange={e => setStationModal(p => ({ ...p, data: { ...p.data, name: e.target.value } }))} required className="mt-1 bg-muted border-border text-foreground" />
              </div>
              <div>
                <Label className="text-foreground">Жанр</Label>
                <select
                  value={stationModal.data.genre || 'pop'}
                  onChange={e => setStationModal(p => ({ ...p, data: { ...p.data, genre: e.target.value } }))}
                  className="w-full mt-1 px-3 py-2 rounded-md bg-muted border border-border text-foreground text-sm focus:outline-none focus:border-primary"
                >
                  {GENRES.filter(g => g.id !== 'all').map(g => (
                    <option key={g.id} value={g.id}>{g.icon} {g.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label className="text-foreground">Эмодзи-лого</Label>
                <Input value={stationModal.data.logo || '📻'} onChange={e => setStationModal(p => ({ ...p, data: { ...p.data, logo: e.target.value } }))} className="mt-1 bg-muted border-border text-foreground" />
              </div>
              <div>
                <Label className="text-foreground">Страна</Label>
                <Input value={stationModal.data.country || ''} onChange={e => setStationModal(p => ({ ...p, data: { ...p.data, country: e.target.value } }))} className="mt-1 bg-muted border-border text-foreground" />
              </div>
              <div>
                <Label className="text-foreground">Язык</Label>
                <Input value={stationModal.data.language || 'RU'} onChange={e => setStationModal(p => ({ ...p, data: { ...p.data, language: e.target.value } }))} className="mt-1 bg-muted border-border text-foreground" />
              </div>
              <div className="col-span-2">
                <Label className="text-foreground">URL потока *</Label>
                <Input value={stationModal.data.stream_url || ''} onChange={e => setStationModal(p => ({ ...p, data: { ...p.data, stream_url: e.target.value } }))} required placeholder="https://..." className="mt-1 bg-muted border-border text-foreground" />
              </div>
              <div>
                <Label className="text-foreground">Слушателей</Label>
                <Input type="number" value={stationModal.data.listeners || 0} onChange={e => setStationModal(p => ({ ...p, data: { ...p.data, listeners: Number(e.target.value) } }))} className="mt-1 bg-muted border-border text-foreground" />
              </div>
              <div>
                <Label className="text-foreground">Битрейт (kbps)</Label>
                <Input type="number" value={stationModal.data.bitrate || 128} onChange={e => setStationModal(p => ({ ...p, data: { ...p.data, bitrate: Number(e.target.value) } }))} className="mt-1 bg-muted border-border text-foreground" />
              </div>
              <div className="col-span-2">
                <Label className="text-foreground">Описание</Label>
                <Input value={stationModal.data.description || ''} onChange={e => setStationModal(p => ({ ...p, data: { ...p.data, description: e.target.value } }))} className="mt-1 bg-muted border-border text-foreground" />
              </div>
              <div className="col-span-2">
                <Label className="text-foreground">Теги (через запятую)</Label>
                <Input value={tagsString} onChange={e => setStationModal(p => ({ ...p, data: { ...p.data, tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean) } }))} placeholder="рок, хиты, танцевальная" className="mt-1 bg-muted border-border text-foreground" />
              </div>
              <div className="col-span-2">
                <Label className="text-foreground">Обложка (изображение)</Label>
                <div className="flex items-center gap-3 mt-1">
                  {(stationModal.data.cover_url || coverFile) && (
                    <img
                      src={coverFile ? URL.createObjectURL(coverFile) : stationModal.data.cover_url!}
                      alt="cover"
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                  )}
                  <button
                    type="button"
                    onClick={() => coverRef.current?.click()}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm bg-secondary text-foreground hover:bg-secondary/80 transition-colors"
                  >
                    <Icon name="Upload" size={14} />
                    {coverFile ? coverFile.name : 'Выбрать файл'}
                  </button>
                  <input ref={coverRef} type="file" accept="image/*" className="hidden" onChange={e => setCoverFile(e.target.files?.[0] || null)} />
                </div>
              </div>
              {stationModal.id && (
                <div className="col-span-2 flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="is_active"
                    checked={stationModal.data.is_active !== false}
                    onChange={e => setStationModal(p => ({ ...p, data: { ...p.data, is_active: e.target.checked } }))}
                    className="rounded"
                  />
                  <Label htmlFor="is_active" className="text-foreground cursor-pointer">Станция активна</Label>
                </div>
              )}
            </div>
            {error && <p className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-md">{error}</p>}
            <div className="flex gap-2 pt-2">
              <Button type="submit" disabled={saving} className="flex-1">
                {saving ? 'Сохраняем...' : stationModal.id ? 'Сохранить' : 'Добавить'}
              </Button>
              <Button type="button" variant="outline" onClick={() => setStationModal({ open: false, data: EMPTY_STATION })}>
                Отмена
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
