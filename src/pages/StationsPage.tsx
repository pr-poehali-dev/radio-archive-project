import { useState } from 'react';
import { Station, STATIONS, GENRES } from '@/data/stations';
import StationCard from '@/components/StationCard';
import Icon from '@/components/ui/icon';

interface StationsPageProps {
  currentStation: Station | null;
  isPlaying: boolean;
  favorites: Station[];
  onPlay: (s: Station) => void;
  onToggleFavorite: (s: Station) => void;
}

export default function StationsPage({ currentStation, isPlaying, favorites, onPlay, onToggleFavorite }: StationsPageProps) {
  const [activeGenre, setActiveGenre] = useState('all');
  const [search, setSearch] = useState('');

  const filtered = STATIONS.filter(s => {
    const matchGenre = activeGenre === 'all' || s.genre === activeGenre;
    const q = search.toLowerCase();
    const matchSearch = !q || s.name.toLowerCase().includes(q) || s.description.toLowerCase().includes(q) || s.tags.some(t => t.toLowerCase().includes(q));
    return matchGenre && matchSearch;
  });

  return (
    <div className="p-4 md:p-8 animate-fade-in">
      <div className="mb-4 md:mb-6">
        <h2 className="font-oswald font-bold text-xl md:text-2xl text-foreground mb-1">Радиостанции</h2>
        <p className="text-muted-foreground text-xs md:text-sm">{STATIONS.length} станций из разных стран мира</p>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Icon name="Search" size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          placeholder="Поиск по названию, жанру или тегу..."
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
      <div className="flex gap-2 overflow-x-auto pb-2 mb-4 md:mb-6" style={{ scrollbarWidth: 'none' }}>
        {GENRES.map(g => (
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

      {(search || activeGenre !== 'all') && (
        <p className="text-xs text-muted-foreground mb-3">Найдено: {filtered.length} станций</p>
      )}

      {filtered.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <Icon name="Radio" size={48} className="mx-auto mb-3 opacity-30" />
          <p className="font-medium">Станции не найдены</p>
          <p className="text-xs mt-1">Попробуйте изменить фильтр или поиск</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {filtered.map(station => (
            <StationCard
              key={station.id}
              station={station}
              isActive={currentStation?.id === station.id}
              isPlaying={currentStation?.id === station.id && isPlaying}
              isFavorite={favorites.some(f => f.id === station.id)}
              onPlay={onPlay}
              onToggleFavorite={onToggleFavorite}
            />
          ))}
        </div>
      )}
    </div>
  );
}
