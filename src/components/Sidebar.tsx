import { useEffect } from 'react';
import Icon from '@/components/ui/icon';

type Page = 'home' | 'stations' | 'genres' | 'favorites' | 'history' | 'stats' | 'about' | 'contacts' | 'support' | 'profile' | 'admin';

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
  { id: 'support', label: 'Поддержать', icon: 'Sparkles' },
];

interface SidebarProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
  favoritesCount: number;
  historyCount: number;
  collapsed: boolean;
  onToggleCollapse: () => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
  user?: { username: string; role: string; avatar_url?: string | null } | null;
  onAuthOpen?: () => void;
}

function NavButton({
  item,
  active,
  collapsed,
  badge,
  onClick,
}: {
  item: NavItem;
  active: boolean;
  collapsed: boolean;
  badge?: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      title={collapsed ? item.label : undefined}
      className="w-full flex items-center rounded-xl text-sm transition-all duration-200 group relative"
      style={{
        gap: collapsed ? '0' : '12px',
        justifyContent: collapsed ? 'center' : 'flex-start',
        padding: collapsed ? '10px' : '10px 12px',
        background: active ? 'hsl(165 80% 50% / 0.1)' : 'transparent',
        color: active ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground))',
        borderLeft: !collapsed && active ? '2px solid hsl(var(--primary))' : '2px solid transparent',
      }}
    >
      <Icon name={item.icon} size={18} className="flex-shrink-0" />
      {!collapsed && <span className="font-medium truncate">{item.label}</span>}
      {!collapsed && badge}

      {/* Tooltip on collapsed */}
      {collapsed && (
        <div
          className="absolute left-full ml-3 px-2.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50"
          style={{
            background: 'hsl(220 20% 14%)',
            border: '1px solid hsl(var(--border))',
            color: 'hsl(var(--foreground))',
          }}
        >
          {item.label}
        </div>
      )}
    </button>
  );
}

function SidebarContent({
  currentPage,
  onNavigate,
  favoritesCount,
  historyCount,
  collapsed,
  onToggleCollapse,
  onClose,
  user,
  onAuthOpen,
}: Omit<SidebarProps, 'mobileOpen' | 'onMobileClose'> & { onClose?: () => void }) {
  const handleNav = (page: Page) => {
    onNavigate(page);
    onClose?.();
  };

  return (
    <div className="flex flex-col h-full">
      {/* Logo + collapse button */}
      <div
        className="flex items-center border-b border-border flex-shrink-0"
        style={{
          padding: collapsed ? '20px 12px' : '20px 16px 20px 20px',
          justifyContent: collapsed ? 'center' : 'space-between',
        }}
      >
        {!collapsed && (
          <div className="flex items-center gap-3 min-w-0">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'hsl(165 80% 50% / 0.15)', border: '1px solid hsl(165 80% 50% / 0.3)' }}
            >
              <Icon name="Radio" size={18} className="text-primary" />
            </div>
            <div className="min-w-0">
              <h1 className="font-oswald font-bold text-base text-foreground tracking-wide leading-tight">RadioWave</h1>
              <p className="text-[10px] text-muted-foreground">Онлайн радио</p>
            </div>
          </div>
        )}

        {collapsed && (
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'hsl(165 80% 50% / 0.15)', border: '1px solid hsl(165 80% 50% / 0.3)' }}
          >
            <Icon name="Radio" size={18} className="text-primary" />
          </div>
        )}

        <button
          onClick={onToggleCollapse}
          className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground transition-all hover:bg-secondary flex-shrink-0"
          style={{ marginLeft: collapsed ? 0 : 4 }}
          title={collapsed ? 'Развернуть' : 'Свернуть'}
        >
          <Icon name={collapsed ? 'ChevronRight' : 'ChevronLeft'} size={15} />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3" style={{ padding: collapsed ? '12px 8px' : '12px' }}>
        {!collapsed && (
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest px-3 mb-2">
            Навигация
          </p>
        )}
        <div className="space-y-0.5">
          {NAV_ITEMS.map(item => (
            <NavButton
              key={item.id}
              item={item}
              active={currentPage === item.id}
              collapsed={collapsed}
              onClick={() => handleNav(item.id)}
              badge={
                item.id === 'favorites' && favoritesCount > 0 ? (
                  <span
                    className="ml-auto text-[10px] px-1.5 py-0.5 rounded-full"
                    style={{ background: 'hsl(var(--primary))', color: 'hsl(var(--primary-foreground))' }}
                  >
                    {favoritesCount}
                  </span>
                ) : item.id === 'history' && historyCount > 0 ? (
                  <span
                    className="ml-auto text-[10px] px-1.5 py-0.5 rounded-full"
                    style={{ background: 'hsl(220 15% 18%)', color: 'hsl(var(--muted-foreground))' }}
                  >
                    {historyCount}
                  </span>
                ) : undefined
              }
            />
          ))}
        </div>

        <div className="my-3 border-t border-border" />

        {!collapsed && (
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest px-3 mb-2">
            Информация
          </p>
        )}
        <div className="space-y-0.5">
          {BOTTOM_ITEMS.map(item => (
            <NavButton
              key={item.id}
              item={item}
              active={currentPage === item.id}
              collapsed={collapsed}
              onClick={() => handleNav(item.id)}
              badge={
                item.id === 'support' ? (
                  <span
                    className="ml-auto text-[10px] px-1.5 py-0.5 rounded-full"
                    style={{ background: 'hsl(25 90% 55% / 0.2)', color: 'hsl(25 90% 65%)' }}
                  >
                    ❤️
                  </span>
                ) : undefined
              }
            />
          ))}
        </div>
      </nav>

      {/* User section */}
      <div className="border-t border-border flex-shrink-0 p-2">
        {user ? (
          <>
            {user.role === 'admin' && (
              <NavButton
                item={{ id: 'admin', label: 'Админ панель', icon: 'Shield' }}
                active={currentPage === 'admin'}
                collapsed={collapsed}
                onClick={() => handleNav('admin')}
              />
            )}
            <NavButton
              item={{ id: 'profile', label: user.username, icon: 'User' }}
              active={currentPage === 'profile'}
              collapsed={collapsed}
              onClick={() => handleNav('profile')}
              badge={
                !collapsed && user.avatar_url ? (
                  <img src={user.avatar_url} alt={user.username} className="ml-auto w-6 h-6 rounded-full object-cover" />
                ) : undefined
              }
            />
          </>
        ) : (
          <button
            onClick={onAuthOpen}
            className="w-full flex items-center rounded-xl text-sm transition-all duration-200 text-muted-foreground hover:text-primary hover:bg-primary/10"
            style={{
              gap: collapsed ? '0' : '12px',
              justifyContent: collapsed ? 'center' : 'flex-start',
              padding: collapsed ? '10px' : '10px 12px',
            }}
            title={collapsed ? 'Войти' : undefined}
          >
            <Icon name="LogIn" size={18} className="flex-shrink-0" />
            {!collapsed && <span className="font-medium">Войти</span>}
          </button>
        )}
      </div>
    </div>
  );
}

export default function Sidebar(props: SidebarProps) {
  const { mobileOpen, onMobileClose, collapsed, user, onAuthOpen } = props;

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onMobileClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onMobileClose]);

  return (
    <>
      {/* === DESKTOP SIDEBAR === */}
      <aside
        className="hidden md:flex flex-col flex-shrink-0 h-screen sticky top-0 transition-all duration-300"
        style={{
          width: collapsed ? '64px' : '240px',
          background: 'hsl(220 20% 7%)',
          borderRight: '1px solid hsl(var(--border))',
        }}
      >
        <SidebarContent {...props} onClose={undefined} />
      </aside>

      {/* === MOBILE DRAWER OVERLAY === */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
          onClick={onMobileClose}
        />
      )}

      {/* === MOBILE DRAWER === */}
      <aside
        className="md:hidden fixed top-0 left-0 h-full z-50 flex flex-col transition-transform duration-300"
        style={{
          width: '260px',
          background: 'hsl(220 20% 7%)',
          borderRight: '1px solid hsl(var(--border))',
          transform: mobileOpen ? 'translateX(0)' : 'translateX(-100%)',
          boxShadow: mobileOpen ? '4px 0 40px hsl(0 0% 0% / 0.5)' : 'none',
        }}
      >
        <SidebarContent
          {...props}
          collapsed={false}
          onToggleCollapse={onMobileClose}
          onClose={onMobileClose}
        />
      </aside>
    </>
  );
}