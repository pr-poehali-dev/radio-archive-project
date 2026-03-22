import { useState, useRef } from 'react';
import { User, authUpdateProfile, uploadAvatar } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';

interface ProfilePageProps {
  user: User;
  onUpdate: (user: User) => void;
  onLogout: () => void;
}

export default function ProfilePage({ user, onUpdate, onLogout }: ProfilePageProps) {
  const [username, setUsername] = useState(user.username);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setSuccess('');
    setSaving(true);
    try {
      const updated = await authUpdateProfile(username);
      onUpdate(updated);
      setSuccess('Профиль обновлён');
    } catch (err: unknown) {
      const e = err as { data?: { error?: string } };
      setError(e?.data?.error || 'Ошибка при сохранении');
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingAvatar(true);
    setError(''); setSuccess('');
    try {
      const url = await uploadAvatar(file);
      onUpdate({ ...user, avatar_url: url });
      setSuccess('Аватар обновлён');
    } catch (err: unknown) {
      const e = err as { data?: { error?: string } };
      setError(e?.data?.error || 'Ошибка загрузки аватара');
    } finally {
      setUploadingAvatar(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const joined = new Date(user.created_at).toLocaleDateString('ru-RU', { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="p-4 md:p-8 max-w-2xl mx-auto animate-fade-in">
      <h2 className="font-oswald font-bold text-xl md:text-2xl text-foreground mb-6">Личный кабинет</h2>

      {/* Avatar */}
      <div className="flex items-center gap-4 mb-8 p-4 rounded-2xl bg-card border border-border">
        <div className="relative">
          {user.avatar_url ? (
            <img
              src={user.avatar_url}
              alt={user.username}
              className="w-20 h-20 rounded-full object-cover border-2 border-primary/30"
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center border-2 border-border">
              <Icon name="User" size={36} className="text-muted-foreground" />
            </div>
          )}
          <button
            onClick={() => fileRef.current?.click()}
            disabled={uploadingAvatar}
            className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full flex items-center justify-center bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
          >
            {uploadingAvatar ? (
              <Icon name="Loader" size={12} className="animate-spin" />
            ) : (
              <Icon name="Camera" size={12} />
            )}
          </button>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
        </div>
        <div>
          <p className="font-semibold text-foreground text-lg">{user.username}</p>
          <p className="text-sm text-muted-foreground">{user.email}</p>
          <div className="flex items-center gap-2 mt-1">
            <span
              className="text-xs px-2 py-0.5 rounded-full font-medium"
              style={{
                background: user.role === 'admin' ? 'hsl(280 70% 60% / 0.2)' : 'hsl(165 80% 50% / 0.15)',
                color: user.role === 'admin' ? 'hsl(280 70% 70%)' : 'hsl(var(--primary))',
              }}
            >
              {user.role === 'admin' ? '👑 Администратор' : '🎧 Слушатель'}
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">Зарегистрирован {joined}</p>
        </div>
      </div>

      {/* Edit form */}
      <form onSubmit={handleSave} className="space-y-4 mb-6">
        <div>
          <Label className="text-foreground">Имя пользователя</Label>
          <Input
            value={username}
            onChange={e => setUsername(e.target.value)}
            className="mt-1 bg-muted border-border text-foreground"
          />
        </div>
        <div>
          <Label className="text-muted-foreground">Email</Label>
          <Input value={user.email} disabled className="mt-1 bg-muted border-border text-muted-foreground opacity-60" />
        </div>

        {error && <p className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-md">{error}</p>}
        {success && <p className="text-sm text-primary bg-primary/10 px-3 py-2 rounded-md">{success}</p>}

        <Button type="submit" disabled={saving || username === user.username}>
          {saving ? 'Сохраняем...' : 'Сохранить изменения'}
        </Button>
      </form>

      <div className="border-t border-border pt-6">
        <Button variant="destructive" onClick={onLogout} className="flex items-center gap-2">
          <Icon name="LogOut" size={16} />
          Выйти из аккаунта
        </Button>
      </div>
    </div>
  );
}
