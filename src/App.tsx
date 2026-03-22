import { useState } from 'react';
import { usePlayer } from '@/hooks/usePlayer';
import { useFavorites } from '@/hooks/useFavorites';
import { useHistory } from '@/hooks/useHistory';
import { useAuth } from '@/hooks/useAuth';
import { useStations } from '@/hooks/useStations';
import { Station } from '@/data/stations';
import { User } from '@/lib/api';

import Sidebar from '@/components/Sidebar';
import Player from '@/components/Player';
import MobileTopBar from '@/components/MobileTopBar';
import MobileBottomNav from '@/components/MobileBottomNav';
import AuthModal from '@/components/AuthModal';

import HomePage from '@/pages/HomePage';
import StationsPage from '@/pages/StationsPage';
import GenresPage from '@/pages/GenresPage';
import FavoritesPage from '@/pages/FavoritesPage';
import HistoryPage from '@/pages/HistoryPage';
import StatsPage from '@/pages/StatsPage';
import AboutPage from '@/pages/AboutPage';
import ContactsPage from '@/pages/ContactsPage';
import SupportPage from '@/pages/SupportPage';
import ProfilePage from '@/pages/ProfilePage';
import AdminPage from '@/pages/AdminPage';

type Page = 'home' | 'stations' | 'genres' | 'favorites' | 'history' | 'stats' | 'about' | 'contacts' | 'support' | 'profile' | 'admin';

export default function App() {
  const [page, setPage] = useState<Page>('home');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);

  const auth = useAuth();
  const { stations, reload: reloadStations } = useStations();
  const player = usePlayer();
  const { favorites, toggle: toggleFavorite } = useFavorites();
  const { history, addEntry, clearHistory } = useHistory();

  const handlePlay = (station: Station) => {
    player.play(station);
    addEntry(station);
  };

  const handleAuthUpdate = (user: User) => {
    auth.refresh();
    // force re-read
    void user;
  };

  const pageProps = {
    currentStation: player.currentStation,
    isPlaying: player.isPlaying,
    favorites,
    onPlay: handlePlay,
    onToggleFavorite: toggleFavorite,
    stations,
  };

  const handleNavigate = (p: string) => {
    if (p === 'profile' && !auth.user) {
      setAuthOpen(true);
      return;
    }
    if (p === 'admin' && !auth.isAdmin) return;
    setPage(p as Page);
    setMobileMenuOpen(false);
  };

  const renderPage = () => {
    switch (page) {
      case 'home':      return <HomePage {...pageProps} onNavigate={handleNavigate} />;
      case 'stations':  return <StationsPage {...pageProps} />;
      case 'genres':    return <GenresPage {...pageProps} />;
      case 'favorites': return <FavoritesPage {...pageProps} />;
      case 'history':   return <HistoryPage history={history} onClear={clearHistory} onPlay={handlePlay} />;
      case 'stats':     return <StatsPage history={history} />;
      case 'about':     return <AboutPage />;
      case 'contacts':  return <ContactsPage />;
      case 'support':   return <SupportPage />;
      case 'profile':
        return auth.user ? (
          <ProfilePage
            user={auth.user}
            onUpdate={handleAuthUpdate}
            onLogout={async () => { await auth.logout(); setPage('home'); }}
          />
        ) : <HomePage {...pageProps} onNavigate={handleNavigate} />;
      case 'admin':
        return auth.isAdmin && auth.user ? (
          <AdminPage currentUserId={auth.user.id} />
        ) : <HomePage {...pageProps} onNavigate={handleNavigate} />;
      default:          return <HomePage {...pageProps} onNavigate={handleNavigate} />;
    }
  };

  const hasPlayer = !!player.currentStation;
  const mobileBottomOffset = hasPlayer ? 76 + 52 + 8 : 52 + 8;

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar
        currentPage={page}
        onNavigate={p => handleNavigate(p)}
        favoritesCount={favorites.length}
        historyCount={history.length}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(v => !v)}
        mobileOpen={mobileMenuOpen}
        onMobileClose={() => setMobileMenuOpen(false)}
        user={auth.user}
        onAuthOpen={() => setAuthOpen(true)}
      />

      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        <MobileTopBar
          currentPage={page}
          onMenuOpen={() => setMobileMenuOpen(true)}
          currentStation={player.currentStation}
          isPlaying={player.isPlaying}
        />

        <main
          className="flex-1 overflow-y-auto md:pb-28"
          style={{ paddingBottom: `${mobileBottomOffset}px` }}
        >
          {renderPage()}
        </main>
      </div>

      <Player player={player} sidebarCollapsed={sidebarCollapsed} />

      <MobileBottomNav
        currentPage={page}
        onNavigate={p => handleNavigate(p)}
        favoritesCount={favorites.length}
        hasPlayer={hasPlayer}
      />

      <AuthModal
        open={authOpen}
        onClose={() => setAuthOpen(false)}
        onLogin={auth.login}
        onRegister={auth.register}
      />
    </div>
  );
}
