import Icon from '@/components/ui/icon';
import WaveAnimation from '@/components/WaveAnimation';
import { Station, formatListeners } from '@/data/stations';

interface StationCardProps {
  station: Station;
  isActive: boolean;
  isPlaying: boolean;
  isFavorite: boolean;
  onPlay: (s: Station) => void;
  onToggleFavorite: (s: Station) => void;
}

export default function StationCard({
  station, isActive, isPlaying, isFavorite, onPlay, onToggleFavorite,
}: StationCardProps) {
  return (
    <div
      className="group relative rounded-2xl p-4 transition-all duration-300 cursor-pointer hover:scale-[1.02]"
      style={{
        background: isActive
          ? 'linear-gradient(135deg, hsl(165 80% 50% / 0.12) 0%, hsl(165 80% 50% / 0.05) 100%)'
          : 'hsl(var(--card))',
        border: `1px solid ${isActive ? 'hsl(165 80% 50% / 0.35)' : 'hsl(var(--border))'}`,
        boxShadow: isActive ? '0 0 20px hsl(165 80% 50% / 0.08)' : 'none',
      }}
      onClick={() => onPlay(station)}
    >
      <div className="flex items-start gap-3">
        {/* Logo */}
        <div
          className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
          style={{ background: 'hsl(220 15% 14%)' }}
        >
          {station.logo}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-foreground text-sm truncate">{station.name}</h3>
            {isActive && isPlaying && <WaveAnimation isPlaying size="sm" />}
          </div>
          <p className="text-xs text-muted-foreground mb-2 line-clamp-2">{station.description}</p>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Icon name="Users" size={10} />
              {formatListeners(station.listeners)}
            </span>
            <span className="flex items-center gap-1">
              <Icon name="Globe" size={10} />
              {station.country}
            </span>
            <span
              className="px-2 py-0.5 rounded-full text-[10px] font-medium"
              style={{ background: 'hsl(165 80% 50% / 0.15)', color: 'hsl(var(--primary))' }}
            >
              {station.bitrate}kbps
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2 flex-shrink-0">
          <button
            onClick={e => { e.stopPropagation(); onToggleFavorite(station); }}
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors hover:bg-secondary"
          >
            <Icon
              name="Heart"
              size={15}
              className={isFavorite ? 'fill-current text-red-400' : 'text-muted-foreground'}
            />
          </button>
          <button
            onClick={e => { e.stopPropagation(); onPlay(station); }}
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:scale-110"
            style={{
              background: isActive && isPlaying ? 'hsl(var(--primary))' : 'hsl(220 15% 14%)',
              color: isActive && isPlaying ? 'hsl(var(--primary-foreground))' : 'hsl(var(--muted-foreground))',
            }}
          >
            <Icon name={isActive && isPlaying ? 'Pause' : 'Play'} size={14} />
          </button>
        </div>
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-1 mt-3">
        {station.tags.slice(0, 3).map(tag => (
          <span
            key={tag}
            className="text-[10px] px-2 py-0.5 rounded-full"
            style={{ background: 'hsl(220 15% 14%)', color: 'hsl(var(--muted-foreground))' }}
          >
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}
