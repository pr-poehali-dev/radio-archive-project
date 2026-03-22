import Icon from '@/components/ui/icon';
import WaveAnimation from '@/components/WaveAnimation';
import { Station } from '@/data/stations';

const PAGE_LABELS: Record<string, string> = {
  home: 'Главная',
  stations: 'Станции',
  genres: 'Жанры',
  favorites: 'Избранное',
  history: 'История',
  stats: 'Статистика',
  about: 'О проекте',
  contacts: 'Контакты',
  support: 'Поддержать',
};

interface MobileTopBarProps {
  currentPage: string;
  onMenuOpen: () => void;
  currentStation: Station | null;
  isPlaying: boolean;
}

export default function MobileTopBar({ currentPage, onMenuOpen, currentStation, isPlaying }: MobileTopBarProps) {
  return (
    <header
      className="md:hidden flex items-center gap-3 px-4 py-3 flex-shrink-0 sticky top-0 z-30"
      style={{
        background: 'hsl(220 20% 6% / 0.95)',
        borderBottom: '1px solid hsl(var(--border))',
        backdropFilter: 'blur(12px)',
      }}
    >
      {/* Menu button */}
      <button
        onClick={onMenuOpen}
        className="w-9 h-9 rounded-xl flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors flex-shrink-0"
        style={{ background: 'hsl(220 15% 12%)' }}
      >
        <Icon name="Menu" size={18} />
      </button>

      {/* Logo + page title */}
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: 'hsl(165 80% 50% / 0.15)', border: '1px solid hsl(165 80% 50% / 0.3)' }}
        >
          <Icon name="Radio" size={14} className="text-primary" />
        </div>
        <div className="min-w-0">
          <span className="font-oswald font-bold text-sm text-foreground tracking-wide">RadioWave</span>
          <span className="text-muted-foreground text-xs mx-1.5">·</span>
          <span className="text-xs text-muted-foreground">{PAGE_LABELS[currentPage] || ''}</span>
        </div>
      </div>

      {/* Now playing mini indicator */}
      {currentStation && (
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="text-xs text-muted-foreground hidden xs:block truncate max-w-[80px]">
            {currentStation.name}
          </span>
          <WaveAnimation isPlaying={isPlaying} size="sm" />
        </div>
      )}
    </header>
  );
}
