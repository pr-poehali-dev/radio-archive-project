import Icon from '@/components/ui/icon';
import { HistoryEntry } from '@/hooks/useHistory';

interface HistoryPageProps {
  history: HistoryEntry[];
  onClear: () => void;
  onPlay: (s: HistoryEntry['station']) => void;
}

function timeAgo(date: Date): string {
  const diff = Date.now() - date.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'только что';
  if (mins < 60) return `${mins} мин. назад`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} ч. назад`;
  return date.toLocaleDateString('ru-RU');
}

export default function HistoryPage({ history, onClear, onPlay }: HistoryPageProps) {
  return (
    <div className="p-4 md:p-8 animate-fade-in">
      <div className="flex items-center justify-between mb-4 md:mb-6">
        <div>
          <h2 className="font-oswald font-bold text-xl md:text-2xl text-foreground mb-1">История</h2>
          <p className="text-muted-foreground text-xs md:text-sm">
            {history.length > 0 ? `${history.length} прослушиваний` : 'История пуста'}
          </p>
        </div>
        {history.length > 0 && (
          <button
            onClick={onClear}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-muted-foreground hover:text-foreground transition-colors"
            style={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
          >
            <Icon name="Trash2" size={14} />
            Очистить
          </button>
        )}
      </div>

      {history.length === 0 ? (
        <div
          className="rounded-3xl p-16 text-center"
          style={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
        >
          <div className="text-6xl mb-4">📻</div>
          <h3 className="font-oswald font-semibold text-xl text-foreground mb-2">Ещё ничего не слушали</h3>
          <p className="text-muted-foreground text-sm">История появится после первого прослушивания</p>
        </div>
      ) : (
        <div className="space-y-2">
          {history.map((entry, idx) => (
            <div
              key={idx}
              className="flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all hover:bg-secondary group"
              onClick={() => onPlay(entry.station)}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                style={{ background: 'hsl(220 15% 14%)' }}
              >
                {entry.station.logo}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{entry.station.name}</p>
                <p className="text-xs text-muted-foreground">{entry.station.genre} · {entry.station.country}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-xs text-muted-foreground">{timeAgo(entry.playedAt)}</p>
              </div>
              <button className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-primary">
                <Icon name="Play" size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}