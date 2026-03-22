import Icon from '@/components/ui/icon';

type Page = 'home' | 'stations' | 'genres' | 'favorites' | 'history' | 'stats' | 'about' | 'contacts' | 'support' | 'profile' | 'admin';

const NAV_TABS = [
  { id: 'home' as Page,      icon: 'Radio',    label: 'Главная'  },
  { id: 'stations' as Page,  icon: 'Antenna',  label: 'Станции'  },
  { id: 'genres' as Page,    icon: 'Music2',   label: 'Жанры'    },
  { id: 'favorites' as Page, icon: 'Heart',    label: 'Избранное'},
  { id: 'stats' as Page,     icon: 'BarChart2',label: 'Статистика'},
];

interface MobileBottomNavProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
  favoritesCount: number;
  hasPlayer: boolean;
}

export default function MobileBottomNav({ currentPage, onNavigate, favoritesCount, hasPlayer }: MobileBottomNavProps) {
  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-40"
      style={{
        background: 'hsl(220 20% 7% / 0.97)',
        borderTop: '1px solid hsl(var(--border))',
        backdropFilter: 'blur(16px)',
        paddingBottom: 'env(safe-area-inset-bottom)',
        bottom: hasPlayer ? '76px' : '0',
        transition: 'bottom 0.3s ease',
      }}
    >
      <div className="flex items-stretch">
        {NAV_TABS.map(tab => {
          const active = currentPage === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onNavigate(tab.id)}
              className="flex-1 flex flex-col items-center justify-center py-2 gap-0.5 relative transition-all duration-200"
              style={{ minHeight: '52px' }}
            >
              {/* Active indicator dot */}
              {active && (
                <span
                  className="absolute top-1.5 w-1 h-1 rounded-full"
                  style={{ background: 'hsl(var(--primary))' }}
                />
              )}

              {/* Icon wrapper */}
              <div className="relative">
                <Icon
                  name={tab.icon}
                  size={20}
                  style={{ color: active ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground))' }}
                />
                {/* Favorites badge */}
                {tab.id === 'favorites' && favoritesCount > 0 && (
                  <span
                    className="absolute -top-1.5 -right-2 text-[9px] font-bold px-1 rounded-full leading-tight"
                    style={{
                      background: 'hsl(var(--primary))',
                      color: 'hsl(var(--primary-foreground))',
                      minWidth: '14px',
                      textAlign: 'center',
                    }}
                  >
                    {favoritesCount > 9 ? '9+' : favoritesCount}
                  </span>
                )}
              </div>

              <span
                className="text-[10px] font-medium leading-none"
                style={{ color: active ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground))' }}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}