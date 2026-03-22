import { useState } from 'react';
import { Station, GENRES } from '@/data/stations';
import StationCard from '@/components/StationCard';
import Icon from '@/components/ui/icon';

interface GenresPageProps {
  currentStation: Station | null;
  isPlaying: boolean;
  favorites: Station[];
  onPlay: (s: Station) => void;
  onToggleFavorite: (s: Station) => void;
  stations: Station[];
}

export default function GenresPage({ currentStation, isPlaying, favorites, onPlay, onToggleFavorite, stations }: GenresPageProps) {
  const [search, setSearch] = useState('');
  const [activeGenre, setActiveGenre] = useState<string | null>(null);

  const genres = GENRES.filter(g => g.id !== 'all').map(g => ({
    ...g,
    stations: stations.filter(s => s.genre === g.id),
  })).filter(g => g.stations.length > 0);

  const filteredGenres = genres.map(g => ({
    ...g,
    stations: g.stations.filter(s => {
      const q = search.toLowerCase();
      return !q || s.name.toLowerCase().includes(q) || s.description.toLowerCase().includes(q);
    }),
  })).filter(g => !activeGenre || g.id === activeGenre).filter(g => !search || g.stations.length > 0);

  return (
    <div className="p-4 md:p-8 animate-fade-in">
      <div className="mb-4 md:mb-6">
        <h2 className="font-oswald font-bold text-xl md:text-2xl text-foreground mb-1">Жанры</h2>
        <p className="text-muted-foreground text-xs md:text-sm">Выбери настроение — найди свою волну</p>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Icon name="Search" size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          placeholder="Поиск станции..."
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

      {/* Genre filter tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-6" style={{ scrollbarWidth: 'none' }}>
        <button
          onClick={() => setActiveGenre(null)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all"
          style={{
            background: !activeGenre ? 'hsl(var(--primary))' : 'hsl(var(--card))',
            color: !activeGenre ? 'hsl(var(--primary-foreground))' : 'hsl(var(--muted-foreground))',
            border: `1px solid ${!activeGenre ? 'hsl(var(--primary))' : 'hsl(var(--border))'}`,
          }}
        >
          🎵 Все жанры
        </button>
        {genres.map(g => (
          <button
            key={g.id}
            onClick={() => setActiveGenre(activeGenre === g.id ? null : g.id)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all"
            style={{
              background: activeGenre === g.id ? 'hsl(var(--primary))' : 'hsl(var(--card))',
              color: activeGenre === g.id ? 'hsl(var(--primary-foreground))' : 'hsl(var(--muted-foreground))',
              border: `1px solid ${activeGenre === g.id ? 'hsl(var(--primary))' : 'hsl(var(--border))'}`,
            }}
          >
            <span>{g.icon}</span>
            {g.label}
            <span className="opacity-60">({g.stations.length})</span>
          </button>
        ))}
      </div>

      {/* Genre overview grid (when no filter) */}
      {!activeGenre && !search && (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 md:gap-3 mb-8 md:mb-10">
          {genres.map((genre, idx) => (
            <button
              key={genre.id}
              onClick={() => setActiveGenre(genre.id)}
              className="rounded-xl md:rounded-2xl p-3 md:p-4 text-center transition-all hover:scale-105 cursor-pointer"
              style={{
                background: `hsl(${(idx * 35) % 360} 50% 15% / 0.6)`,
                border: `1px solid hsl(${(idx * 35) % 360} 50% 30% / 0.3)`,
              }}
            >
              <div className="text-2xl md:text-3xl mb-1.5 md:mb-2">{genre.icon}</div>
              <p className="text-xs md:text-sm font-semibold text-foreground leading-tight">{genre.label}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">{genre.stations.length} ст.</p>
            </button>
          ))}
        </div>
      )}

      <div className="space-y-8 md:space-y-10">
        {filteredGenres.map(genre => (
          <div key={genre.id} id={`genre-${genre.id}`}>
            <div className="flex items-center gap-2 md:gap-3 mb-3 md:mb-4">
              <span className="text-xl md:text-2xl">{genre.icon}</span>
              <div>
                <h3 className="font-oswald font-bold text-lg md:text-xl text-foreground">{genre.label}</h3>
                <p className="text-[10px] md:text-xs text-muted-foreground">{genre.stations.length} станций</p>
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              {genre.stations.map(station => (
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
          </div>
        ))}
      </div>
    </div>
  );
}
