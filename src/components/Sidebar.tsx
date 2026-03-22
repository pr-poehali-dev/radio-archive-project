import Icon from '@/components/ui/icon';

type Page = 'home' | 'stations' | 'genres' | 'favorites' | 'history' | 'stats' | 'about' | 'contacts' | 'support';

interface NavItem {
  id: Page;
  label: string;
  icon: string;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'home', label: 'Главная', icon: 'Radio' },
  { id: 'stations', label: 'Станции', icon: 'Antenna' },
  { id: 'genres', label: 'Жанры', icon: 'Music2' },
  { id: 'favorites', label: 'Избранное', icon: 'Heart' },
  { id: 'history', label: 'История', icon: 'History' },
  { id: 'stats', label: 'Статистика', icon: 'BarChart2' },
];

const BOTTOM_ITEMS: NavItem[] = [
  { id: 'about', label: 'О проекте', icon: 'Info' },
  { id: 'contacts', label: 'Контакты', icon: 'Mail' },
  { id: 'support', label: 'Поддержать', icon: 'Heart' },
];

interface SidebarProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
  favoritesCount: number;
  historyCount: number;
}

export default function Sidebar({ currentPage, onNavigate, favoritesCount, historyCount }: SidebarProps) {
  return (
    <aside
      className="w-64 flex-shrink-0 h-screen sticky top-0 flex flex-col"
      style={{
        background: 'hsl(220 20% 7%)',
        borderRight: '1px solid hsl(var(--border))',
      }}
    >
      {/* Logo */}
      <div className="p-6 pb-4">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: 'hsl(165 80% 50% / 0.15)', border: '1px solid hsl(165 80% 50% / 0.3)' }}
          >
            <Icon name="Radio" size={20} className="text-primary" />
          </div>
          <div>
            <h1 className="font-oswald font-bold text-lg text-foreground tracking-wide">RadioWave</h1>
            <p className="text-[10px] text-muted-foreground">Онлайн радио</p>
          </div>
        </div>
      </div>

      {/* Main Nav */}
      <nav className="flex-1 px-3 py-2 overflow-y-auto">
        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest px-3 mb-2">
          Навигация
        </p>
        <div className="space-y-0.5">
          {NAV_ITEMS.map(item => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200"
              style={{
                background: currentPage === item.id ? 'hsl(165 80% 50% / 0.1)' : 'transparent',
                color: currentPage === item.id ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground))',
                borderLeft: currentPage === item.id ? '2px solid hsl(var(--primary))' : '2px solid transparent',
              }}
            >
              <Icon name={item.icon} size={17} />
              <span className="font-medium">{item.label}</span>
              {item.id === 'favorites' && favoritesCount > 0 && (
                <span
                  className="ml-auto text-[10px] px-1.5 py-0.5 rounded-full"
                  style={{ background: 'hsl(var(--primary))', color: 'hsl(var(--primary-foreground))' }}
                >
                  {favoritesCount}
                </span>
              )}
              {item.id === 'history' && historyCount > 0 && (
                <span
                  className="ml-auto text-[10px] px-1.5 py-0.5 rounded-full"
                  style={{ background: 'hsl(220 15% 18%)', color: 'hsl(var(--muted-foreground))' }}
                >
                  {historyCount}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="my-4 border-t border-border" />

        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest px-3 mb-2">
          Информация
        </p>
        <div className="space-y-0.5">
          {BOTTOM_ITEMS.map(item => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200"
              style={{
                background: currentPage === item.id ? 'hsl(165 80% 50% / 0.1)' : 'transparent',
                color: currentPage === item.id ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground))',
                borderLeft: currentPage === item.id ? '2px solid hsl(var(--primary))' : '2px solid transparent',
              }}
            >
              <Icon name={item.icon} size={17} />
              <span className="font-medium">{item.label}</span>
              {item.id === 'support' && (
                <span
                  className="ml-auto text-[10px] px-1.5 py-0.5 rounded-full"
                  style={{ background: 'hsl(25 90% 55% / 0.2)', color: 'hsl(25 90% 65%)' }}
                >
                  ❤️
                </span>
              )}
            </button>
          ))}
        </div>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-border">
        <p className="text-[10px] text-muted-foreground text-center">
          🎵 12 станций • 10 жанров
        </p>
      </div>
    </aside>
  );
}
