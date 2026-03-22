import { useState } from 'react';
import { Station, GENRES, formatListeners } from '@/data/stations';
import Icon from '@/components/ui/icon';
import WaveAnimation from '@/components/WaveAnimation';
import StationCard from '@/components/StationCard';

interface HomePageProps {
  currentStation: Station | null;
  isPlaying: boolean;
  favorites: Station[];
  onPlay: (s: Station) => void;
  onToggleFavorite: (s: Station) => void;
  onNavigate: (page: string) => void;
  stations: Station[];
}

export default function HomePage({ currentStation, isPlaying, favorites, onPlay, onToggleFavorite, onNavigate, stations }: HomePageProps) {
  const [search, setSearch] = useState('');
  const [showResults, setShowResults] = useState(false);

  const topStations = [...stations].sort((a, b) => b.listeners - a.listeners).slice(0, 4);
  const genreStats = GENRES.filter(g => g.id !== 'all').map(g => ({
    ...g,
    count: stations.filter(s => s.genre === g.id).length,
    listeners: stations.filter(s => s.genre === g.id).reduce((sum, s) => sum + s.listeners, 0),
  })).sort((a, b) => b.listeners - a.listeners).slice(0, 5);

  const searchResults = search.length >= 2
    ? stations.filter(s =>
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.genre.toLowerCase().includes(search.toLowerCase()) ||
        s.tags.some(t => t.toLowerCase().includes(search.toLowerCase()))
      ).slice(0, 6)
    : [];

  return (
    <div className="p-4 md:p-8 space-y-6 md:space-y-10 animate-fade-in">

      {/* Search bar */}
      <div className="relative">
        <Icon name="Search" size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          placeholder="Найти радиостанцию..."
          value={search}
          onChange={e => { setSearch(e.target.value); setShowResults(true); }}
          onFocus={() => setShowResults(true)}
          onBlur={() => setTimeout(() => setShowResults(false), 150)}
          className="w-full pl-12 pr-4 py-3 rounded-2xl text-sm bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
          style={{ boxShadow: '0 2px 12px hsl(0 0% 0% / 0.15)' }}
        />
        {search && (
          <button onClick={() => setSearch('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
            <Icon name="X" size={16} />
          </button>
        )}

        {/* Search dropdown */}
        {showResults && searchResults.length > 0 && (
          <div
            className="absolute top-full left-0 right-0 mt-2 rounded-2xl border border-border overflow-hidden z-30"
            style={{ background: 'hsl(220 18% 9%)', boxShadow: '0 8px 32px hsl(0 0% 0% / 0.4)' }}
          >
            {searchResults.map(s => (
              <button
                key={s.id}
                onMouseDown={() => { onPlay(s); setSearch(''); setShowResults(false); }}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-secondary transition-colors text-left"
              >
                <span className="text-xl">{s.logo}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{s.name}</p>
                  <p className="text-xs text-muted-foreground">{s.country} · {s.genre}</p>
                </div>
                <Icon name="Play" size={14} className="text-muted-foreground flex-shrink-0" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Hero */}
      <div
        className="relative rounded-2xl md:rounded-3xl overflow-hidden p-5 md:p-8"
        style={{
          background: 'linear-gradient(135deg, hsl(165 80% 50% / 0.08) 0%, hsl(280 70% 60% / 0.06) 100%)',
          border: '1px solid hsl(165 80% 50% / 0.15)',
        }}
      >
        <div
          className="absolute top-4 right-4 w-28 h-28 md:w-40 md:h-40 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, hsl(var(--primary)), transparent)' }}
        />
        <div className="relative">
          <div className="flex items-center gap-2 mb-2 md:mb-3">
            <div className="flex gap-1">
              {[1, 2, 3].map(i => (
                <div key={i} className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" style={{ animationDelay: `${i * 0.2}s` }} />
              ))}
            </div>
            <span className="text-[10px] md:text-xs text-primary font-medium uppercase tracking-widest">В эфире</span>
          </div>
          <h2 className="font-oswald text-3xl md:text-4xl font-bold text-foreground mb-2 leading-tight">
            Слушай мир<br />
            <span className="neon-text">без границ</span>
          </h2>
          <p className="text-muted-foreground text-xs md:text-sm mb-4 md:mb-6 max-w-md">
            {stations.length} радиостанций из разных стран. Поп, рок, джаз, электроника и многое другое.
          </p>
          {currentStation && isPlaying ? (
            <div className="flex items-center gap-3">
              <WaveAnimation isPlaying size="md" />
              <div>
                <p className="text-xs text-muted-foreground">Сейчас играет</p>
                <p className="font-semibold text-foreground text-sm">{currentStation.name}</p>
              </div>
            </div>
          ) : (
            <button
              onClick={() => onNavigate('stations')}
              className="flex items-center gap-2 px-4 md:px-6 py-2.5 md:py-3 rounded-xl font-semibold text-sm transition-all hover:scale-105 active:scale-95"
              style={{
                background: 'hsl(var(--primary))',
                color: 'hsl(var(--primary-foreground))',
                boxShadow: '0 0 30px hsl(165 80% 50% / 0.25)',
              }}
            >
              <Icon name="Play" size={16} />
              Начать слушать
            </button>
          )}
        </div>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Станций', value: String(stations.length), icon: 'Radio', color: 'hsl(var(--primary))' },
          { label: 'Жанров', value: String(GENRES.length - 1), icon: 'Music2', color: 'hsl(280 70% 60%)' },
          { label: 'Стран', value: String(new Set(stations.map(s => s.country)).size), icon: 'Globe', color: 'hsl(25 90% 55%)' },
        ].map(stat => (
          <div
            key={stat.label}
            className="rounded-xl md:rounded-2xl p-3 md:p-4 text-center"
            style={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
          >
            <Icon name={stat.icon} size={18} style={{ color: stat.color, margin: '0 auto 6px' }} />
            <p className="font-oswald font-bold text-xl md:text-2xl text-foreground">{stat.value}</p>
            <p className="text-[10px] md:text-xs text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Top stations grid */}
      <div>
        <div className="flex items-center justify-between mb-3 md:mb-4">
          <h3 className="font-oswald font-semibold text-base md:text-lg text-foreground">🔥 Топ станций</h3>
          <button
            onClick={() => onNavigate('stations')}
            className="text-xs text-primary hover:underline flex items-center gap-1"
          >
            Все <Icon name="ChevronRight" size={14} />
          </button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {topStations.map(station => (
            <div
              key={station.id}
              className="rounded-2xl p-3 cursor-pointer transition-all hover:scale-[1.03] group"
              style={{
                background: currentStation?.id === station.id ? 'linear-gradient(135deg,hsl(165 80% 50%/0.12),hsl(165 80% 50%/0.05))' : 'hsl(var(--card))',
                border: `1px solid ${currentStation?.id === station.id ? 'hsl(165 80% 50%/0.35)' : 'hsl(var(--border))'}`,
              }}
              onClick={() => onPlay(station)}
            >
              <div className="aspect-square rounded-xl flex items-center justify-center text-3xl mb-2"
                style={{ background: 'hsl(220 15% 14%)' }}>
                {station.logo.startsWith('http') ? (
                  <img src={station.logo} alt={station.name} className="w-full h-full rounded-xl object-cover" />
                ) : station.logo}
              </div>
              <p className="text-xs font-semibold text-foreground truncate">{station.name}</p>
              <p className="text-[10px] text-muted-foreground">{formatListeners(station.listeners)}</p>
              {currentStation?.id === station.id && isPlaying && (
                <div className="flex gap-0.5 items-end h-3 mt-1">
                  {[1,2,3].map(i => (
                    <div key={i} className="w-0.5 bg-primary rounded-full animate-pulse" style={{ height: `${6+i*2}px`, animationDelay: `${i*0.15}s` }} />
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Featured station card */}
      {topStations[0] && (
        <StationCard
          station={topStations[0]}
          isActive={currentStation?.id === topStations[0].id}
          isPlaying={currentStation?.id === topStations[0].id && isPlaying}
          isFavorite={favorites.some(f => f.id === topStations[0].id)}
          onPlay={onPlay}
          onToggleFavorite={onToggleFavorite}
        />
      )}

      {/* Top genres */}
      <div>
        <h3 className="font-oswald font-semibold text-base md:text-lg text-foreground mb-3 md:mb-4">📊 Популярные жанры</h3>
        <div className="space-y-2 md:space-y-3">
          {genreStats.map((genre, idx) => {
            const pct = genreStats[0].listeners > 0 ? (genre.listeners / genreStats[0].listeners) * 100 : 0;
            return (
              <div key={genre.id} className="flex items-center gap-2 md:gap-3">
                <span className="text-base md:text-lg w-7 flex-shrink-0">{genre.icon}</span>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs md:text-sm font-medium text-foreground">{genre.label}</span>
                    <span className="text-[10px] md:text-xs text-muted-foreground">{formatListeners(genre.listeners)}</span>
                  </div>
                  <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${pct}%`,
                        background: idx === 0 ? 'hsl(var(--primary))' : idx === 1 ? 'hsl(280 70% 60%)' : 'hsl(var(--muted-foreground))',
                      }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
