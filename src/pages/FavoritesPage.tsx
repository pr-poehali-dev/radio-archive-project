import { useState } from 'react';
import { Station, GENRES } from '@/data/stations';
import StationCard from '@/components/StationCard';
import Icon from '@/components/ui/icon';

interface FavoritesPageProps {
  currentStation: Station | null;
  isPlaying: boolean;
  favorites: Station[];
  onPlay: (s: Station) => void;
  onToggleFavorite: (s: Station) => void;
  stations: Station[];
}

export default function FavoritesPage({ currentStation, isPlaying, favorites, onPlay, onToggleFavorite }: FavoritesPageProps) {
  const [search, setSearch] = useState('');
  const [activeGenre, setActiveGenre] = useState('all');

  const filtered = favorites.filter(s => {
    const matchGenre = activeGenre === 'all' || s.genre === activeGenre;
    const q = search.toLowerCase();
    const matchSearch = !q || s.name.toLowerCase().includes(q) || s.description.toLowerCase().includes(q);
    return matchGenre && matchSearch;
  });

  const availableGenres = GENRES.filter(g => g.id === 'all' || favorites.some(s => s.genre === g.id));

  return (
    <div className="p-4 md:p-8 animate-fade-in">
      <div className="mb-4 md:mb-6">
        <h2 className="font-oswald font-bold text-xl md:text-2xl text-foreground mb-1">Избранное</h2>
        <p className="text-muted-foreground text-xs md:text-sm">
          {favorites.length > 0 ? `${favorites.length} сохранённых станций` : 'Пусто пока'}
        </p>
      </div>

      {favorites.length === 0 ? (
        <div
          className="rounded-2xl md:rounded-3xl p-10 md:p-16 text-center"
          style={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
        >
          <div className="text-5xl md:text-6xl mb-3 md:mb-4">💫</div>
          <h3 className="font-oswald font-semibold text-lg md:text-xl text-foreground mb-2">Добавьте любимые станции</h3>
          <p className="text-muted-foreground text-xs md:text-sm max-w-xs mx-auto">
            Нажмите на ❤️ в карточке любой станции, чтобы добавить её в избранное
          </p>
        </div>
      ) : (
        <>
          {/* Search */}
          <div className="relative mb-4">
            <Icon name="Search" size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Поиск в избранном..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                <Icon name="X" size={14} />
              </button>
            )}
          </div>

          {/* Genre filter */}
          <div className="flex gap-2 overflow-x-auto pb-2 mb-4" style={{ scrollbarWidth: 'none' }}>
            {availableGenres.map(g => (
              <button
                key={g.id}
                onClick={() => setActiveGenre(g.id)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all"
                style={{
                  background: activeGenre === g.id ? 'hsl(var(--primary))' : 'hsl(var(--card))',
                  color: activeGenre === g.id ? 'hsl(var(--primary-foreground))' : 'hsl(var(--muted-foreground))',
                  border: `1px solid ${activeGenre === g.id ? 'hsl(var(--primary))' : 'hsl(var(--border))'}`,
                }}
              >
                <span>{g.icon}</span>
                {g.label}
              </button>
            ))}
          </div>

          {filtered.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Icon name="Search" size={36} className="mx-auto mb-2 opacity-30" />
              <p>Ничего не найдено</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              {filtered.map(station => (
                <StationCard
                  key={station.id}
                  station={station}
                  isActive={currentStation?.id === station.id}
                  isPlaying={currentStation?.id === station.id && isPlaying}
                  isFavorite
                  onPlay={onPlay}
                  onToggleFavorite={onToggleFavorite}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
