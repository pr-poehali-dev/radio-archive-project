import { Station, STATIONS, GENRES, formatListeners } from '@/data/stations';
import Icon from '@/components/ui/icon';
import WaveAnimation from '@/components/WaveAnimation';

interface HomePageProps {
  currentStation: Station | null;
  isPlaying: boolean;
  onPlay: (s: Station) => void;
  onNavigate: (page: string) => void;
}

export default function HomePage({ currentStation, isPlaying, onPlay, onNavigate }: HomePageProps) {
  const topStations = [...STATIONS].sort((a, b) => b.listeners - a.listeners).slice(0, 4);
  const genreStats = GENRES.filter(g => g.id !== 'all').map(g => ({
    ...g,
    count: STATIONS.filter(s => s.genre === g.id).length,
    listeners: STATIONS.filter(s => s.genre === g.id).reduce((sum, s) => sum + s.listeners, 0),
  })).sort((a, b) => b.listeners - a.listeners).slice(0, 5);

  return (
    <div className="p-8 space-y-10 animate-fade-in">
      {/* Hero */}
      <div
        className="relative rounded-3xl overflow-hidden p-8"
        style={{
          background: 'linear-gradient(135deg, hsl(165 80% 50% / 0.08) 0%, hsl(280 70% 60% / 0.06) 100%)',
          border: '1px solid hsl(165 80% 50% / 0.15)',
        }}
      >
        <div
          className="absolute top-4 right-4 w-40 h-40 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, hsl(var(--primary)), transparent)' }}
        />
        <div className="relative">
          <div className="flex items-center gap-2 mb-3">
            <div className="flex gap-1">
              {[1,2,3].map(i => (
                <div
                  key={i}
                  className="w-2 h-2 rounded-full bg-primary animate-pulse"
                  style={{ animationDelay: `${i * 0.2}s` }}
                />
              ))}
            </div>
            <span className="text-xs text-primary font-medium uppercase tracking-widest">В эфире</span>
          </div>
          <h2 className="font-oswald text-4xl font-bold text-foreground mb-2 leading-tight">
            Слушай мир<br />
            <span className="neon-text">без границ</span>
          </h2>
          <p className="text-muted-foreground text-sm mb-6 max-w-md">
            12 радиостанций из разных стран. Поп, рок, джаз, электроника и многое другое — всё в одном месте.
          </p>
          {currentStation && isPlaying ? (
            <div className="flex items-center gap-3">
              <WaveAnimation isPlaying size="md" />
              <div>
                <p className="text-xs text-muted-foreground">Сейчас играет</p>
                <p className="font-semibold text-foreground">{currentStation.name}</p>
              </div>
            </div>
          ) : (
            <button
              onClick={() => onNavigate('stations')}
              className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all hover:scale-105 active:scale-95"
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
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Станций', value: '12', icon: 'Radio', color: 'var(--primary)' },
          { label: 'Жанров', value: '10', icon: 'Music2', color: 'hsl(280 70% 60%)' },
          { label: 'Стран', value: '6', icon: 'Globe', color: 'hsl(25 90% 55%)' },
        ].map(stat => (
          <div
            key={stat.label}
            className="rounded-2xl p-4 text-center"
            style={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
          >
            <Icon name={stat.icon} size={20} style={{ color: stat.color, margin: '0 auto 8px' }} />
            <p className="font-oswald font-bold text-2xl text-foreground">{stat.value}</p>
            <p className="text-xs text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Top stations */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-oswald font-semibold text-lg text-foreground">🔥 Топ станций</h3>
          <button
            onClick={() => onNavigate('stations')}
            className="text-xs text-primary hover:underline flex items-center gap-1"
          >
            Все <Icon name="ChevronRight" size={14} />
          </button>
        </div>
        <div className="space-y-2">
          {topStations.map((station, idx) => (
            <div
              key={station.id}
              className="flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all hover:bg-secondary group"
              onClick={() => onPlay(station)}
            >
              <span
                className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0"
                style={{
                  background: idx === 0 ? 'hsl(45 90% 50% / 0.2)' : 'hsl(220 15% 14%)',
                  color: idx === 0 ? 'hsl(45 90% 60%)' : 'hsl(var(--muted-foreground))',
                }}
              >
                {idx + 1}
              </span>
              <span className="text-xl flex-shrink-0">{station.logo}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{station.name}</p>
                <p className="text-xs text-muted-foreground">{station.country}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-xs text-muted-foreground">{formatListeners(station.listeners)}</p>
                <p className="text-[10px] text-muted-foreground">слуш.</p>
              </div>
              {currentStation?.id === station.id && isPlaying && (
                <WaveAnimation isPlaying size="sm" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Top genres */}
      <div>
        <h3 className="font-oswald font-semibold text-lg text-foreground mb-4">📊 Популярные жанры</h3>
        <div className="space-y-3">
          {genreStats.map((genre, idx) => {
            const maxListeners = genreStats[0].listeners;
            const pct = (genre.listeners / maxListeners) * 100;
            return (
              <div key={genre.id} className="flex items-center gap-3">
                <span className="text-lg w-8 flex-shrink-0">{genre.icon}</span>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-foreground">{genre.label}</span>
                    <span className="text-xs text-muted-foreground">{formatListeners(genre.listeners)}</span>
                  </div>
                  <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${pct}%`,
                        background: idx === 0
                          ? 'hsl(var(--primary))'
                          : idx === 1
                          ? 'hsl(280 70% 60%)'
                          : 'hsl(var(--muted-foreground))',
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
