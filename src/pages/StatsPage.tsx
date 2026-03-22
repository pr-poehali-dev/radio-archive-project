import { STATIONS, GENRES, formatListeners } from '@/data/stations';
import Icon from '@/components/ui/icon';
import { HistoryEntry } from '@/hooks/useHistory';

interface StatsPageProps {
  history: HistoryEntry[];
}

export default function StatsPage({ history }: StatsPageProps) {
  const totalListeners = STATIONS.reduce((sum, s) => sum + s.listeners, 0);

  const genreListeners = GENRES.filter(g => g.id !== 'all').map(g => {
    const stations = STATIONS.filter(s => s.genre === g.id);
    return {
      ...g,
      listeners: stations.reduce((sum, s) => sum + s.listeners, 0),
      count: stations.length,
    };
  }).sort((a, b) => b.listeners - a.listeners);

  const maxListeners = genreListeners[0]?.listeners || 1;

  // History stats
  const genreHistory: Record<string, number> = {};
  history.forEach(e => {
    genreHistory[e.station.genre] = (genreHistory[e.station.genre] || 0) + 1;
  });
  const topGenreFromHistory = Object.entries(genreHistory).sort((a, b) => b[1] - a[1])[0];
  const topGenreLabel = topGenreFromHistory
    ? GENRES.find(g => g.id === topGenreFromHistory[0])?.label
    : null;

  const stationHistory: Record<string, number> = {};
  history.forEach(e => { stationHistory[e.station.id] = (stationHistory[e.station.id] || 0) + 1; });
  const topStation = Object.entries(stationHistory).sort((a, b) => b[1] - a[1])[0];
  const topStationObj = topStation ? STATIONS.find(s => s.id === topStation[0]) : null;

  const colors = [
    'hsl(165 80% 50%)', 'hsl(280 70% 60%)', 'hsl(25 90% 55%)',
    'hsl(200 80% 55%)', 'hsl(45 90% 55%)', 'hsl(330 70% 60%)',
    'hsl(120 60% 50%)', 'hsl(60 80% 55%)', 'hsl(10 80% 55%)', 'hsl(180 70% 50%)',
  ];

  return (
    <div className="p-8 animate-fade-in space-y-8">
      <div>
        <h2 className="font-oswald font-bold text-2xl text-foreground mb-1">Статистика</h2>
        <p className="text-muted-foreground text-sm">Аналитика слушателей и популярность жанров</p>
      </div>

      {/* My stats */}
      <div
        className="rounded-2xl p-6"
        style={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
      >
        <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
          <Icon name="User" size={16} className="text-primary" />
          Моя статистика
        </h3>
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Прослушиваний', value: history.length, icon: 'Headphones' },
            { label: 'Любимый жанр', value: topGenreLabel || '—', icon: 'Music2' },
            { label: 'Топ станция', value: topStationObj?.name || '—', icon: 'Star' },
          ].map(stat => (
            <div
              key={stat.label}
              className="rounded-xl p-4 text-center"
              style={{ background: 'hsl(220 15% 12%)' }}
            >
              <Icon name={stat.icon} size={20} className="text-primary mx-auto mb-2" />
              <p className="font-oswald font-bold text-lg text-foreground">{stat.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
        {history.length === 0 && (
          <p className="text-center text-xs text-muted-foreground mt-4">
            Начните слушать радио, чтобы увидеть личную статистику
          </p>
        )}
      </div>

      {/* Total listeners */}
      <div
        className="rounded-2xl p-6"
        style={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
      >
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-foreground flex items-center gap-2">
            <Icon name="Users" size={16} className="text-primary" />
            Аудитория платформы
          </h3>
          <span className="font-oswald font-bold text-2xl neon-text">{formatListeners(totalListeners)}</span>
        </div>
        <p className="text-xs text-muted-foreground">суммарная аудитория всех станций</p>
      </div>

      {/* Genres bar chart */}
      <div
        className="rounded-2xl p-6"
        style={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
      >
        <h3 className="font-semibold text-foreground mb-5 flex items-center gap-2">
          <Icon name="BarChart2" size={16} className="text-primary" />
          Топ жанров по слушателям
        </h3>
        <div className="space-y-4">
          {genreListeners.map((genre, idx) => {
            const pct = (genre.listeners / maxListeners) * 100;
            return (
              <div key={genre.id}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-base">{genre.icon}</span>
                    <span className="text-sm font-medium text-foreground">{genre.label}</span>
                    <span
                      className="text-[10px] px-1.5 py-0.5 rounded-full"
                      style={{ background: 'hsl(220 15% 14%)', color: 'hsl(var(--muted-foreground))' }}
                    >
                      {genre.count} ст.
                    </span>
                  </div>
                  <span className="text-sm font-semibold" style={{ color: colors[idx % colors.length] }}>
                    {formatListeners(genre.listeners)}
                  </span>
                </div>
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${pct}%`, background: colors[idx % colors.length] }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Top 3 stations */}
      <div
        className="rounded-2xl p-6"
        style={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
      >
        <h3 className="font-semibold text-foreground mb-5 flex items-center gap-2">
          <Icon name="Trophy" size={16} className="text-primary" />
          Топ-3 станции
        </h3>
        <div className="space-y-3">
          {[...STATIONS].sort((a, b) => b.listeners - a.listeners).slice(0, 3).map((station, idx) => (
            <div
              key={station.id}
              className="flex items-center gap-3 p-3 rounded-xl"
              style={{ background: 'hsl(220 15% 12%)' }}
            >
              <span
                className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm flex-shrink-0"
                style={{
                  background: ['hsl(45 90% 50% / 0.2)', 'hsl(220 30% 60% / 0.15)', 'hsl(25 70% 50% / 0.15)'][idx],
                  color: ['hsl(45 90% 60%)', 'hsl(220 30% 70%)', 'hsl(25 70% 60%)'][idx],
                }}
              >
                {['🥇', '🥈', '🥉'][idx]}
              </span>
              <span className="text-xl">{station.logo}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">{station.name}</p>
                <p className="text-xs text-muted-foreground">{station.country}</p>
              </div>
              <span className="text-sm font-semibold text-primary">{formatListeners(station.listeners)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
