import { useState } from 'react';
import { Station, GENRES } from '@/data/stations';
import StationCard from '@/components/StationCard';
import Icon from '@/components/ui/icon';

interface StationsPageProps {
  currentStation: Station | null;
  isPlaying: boolean;
  favorites: Station[];
  onPlay: (s: Station) => void;
  onToggleFavorite: (s: Station) => void;
  stations: Station[];
}

export default function StationsPage({ currentStation, isPlaying, favorites, onPlay, onToggleFavorite, stations }: StationsPageProps) {
  const [activeGenre, setActiveGenre] = useState('all');
  const [search, setSearch] = useState('');
  const [view, setView] = useState<'grid' | 'list'>('list');

  const filtered = stations.filter(s => {
    const matchGenre = activeGenre === 'all' || s.genre === activeGenre;
    const q = search.toLowerCase();
    const matchSearch = !q || s.name.toLowerCase().includes(q) || s.description.toLowerCase().includes(q) || s.tags.some(t => t.toLowerCase().includes(q));
    return matchGenre && matchSearch;
  });

  return (
    <div className="p-4 md:p-8 animate-fade-in">
      <div className="flex items-center justify-between mb-4 md:mb-6">
        <div>
          <h2 className="font-oswald font-bold text-xl md:text-2xl text-foreground mb-1">Радиостанции</h2>
          <p className="text-muted-foreground text-xs md:text-sm">{stations.length} станций из разных стран мира</p>
        </div>
        <div className="flex gap-1 p-1 rounded-lg bg-card border border-border">
          <button
            onClick={() => setView('list')}
            className={`p-1.5 rounded-md transition-colors ${view === 'list' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}
          ><Icon name="List" size={16} /></button>
          <button
            onClick={() => setView('grid')}
            className={`p-1.5 rounded-md transition-colors ${view === 'grid' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}
          ><Icon name="LayoutGrid" size={16} /></button>
        </div>
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
      ) : view === 'list' ? (
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
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {filtered.map(station => (
            <StationGridCard
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

function StationGridCard({ station, isActive, isPlaying, isFavorite, onPlay, onToggleFavorite }: {
  station: Station; isActive: boolean; isPlaying: boolean; isFavorite: boolean;
  onPlay: (s: Station) => void; onToggleFavorite: (s: Station) => void;
}) {
  return (
    <div
      className="group rounded-2xl p-3 cursor-pointer transition-all hover:scale-[1.03]"
      style={{
        background: isActive ? 'linear-gradient(135deg,hsl(165 80% 50%/0.12),hsl(165 80% 50%/0.05))' : 'hsl(var(--card))',
        border: `1px solid ${isActive ? 'hsl(165 80% 50%/0.35)' : 'hsl(var(--border))'}`,
      }}
      onClick={() => onPlay(station)}
    >
      <div className="aspect-square rounded-xl flex items-center justify-center text-4xl mb-2 overflow-hidden"
        style={{ background: 'hsl(220 15% 14%)' }}>
        {station.logo.startsWith('http') ? (
          <img src={station.logo} alt={station.name} className="w-full h-full object-cover" />
        ) : station.logo}
      </div>
      <p className="text-xs font-semibold text-foreground truncate mb-0.5">{station.name}</p>
      <p className="text-[10px] text-muted-foreground truncate">{station.genre}</p>
      <div className="flex items-center justify-between mt-2">
        <button
          onClick={e => { e.stopPropagation(); onToggleFavorite(station); }}
          className="w-6 h-6 rounded-md flex items-center justify-center hover:bg-secondary transition-colors"
        >
          <Icon name="Heart" size={12} className={isFavorite ? 'fill-current text-red-400' : 'text-muted-foreground'} />
        </button>
        {isActive && isPlaying && (
          <div className="flex gap-0.5 items-end h-3">
            {[1,2,3].map(i => (
              <div key={i} className="w-0.5 bg-primary rounded-full animate-pulse" style={{ height: `${6 + i * 2}px`, animationDelay: `${i * 0.15}s` }} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
