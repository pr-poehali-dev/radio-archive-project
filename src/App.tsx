import { useState } from 'react';
import { usePlayer } from '@/hooks/usePlayer';
import { useFavorites } from '@/hooks/useFavorites';
import { useHistory } from '@/hooks/useHistory';
import { Station } from '@/data/stations';

import Sidebar from '@/components/Sidebar';
import Player from '@/components/Player';
import MobileTopBar from '@/components/MobileTopBar';
import MobileBottomNav from '@/components/MobileBottomNav';

import HomePage from '@/pages/HomePage';
import StationsPage from '@/pages/StationsPage';
import GenresPage from '@/pages/GenresPage';
import FavoritesPage from '@/pages/FavoritesPage';
import HistoryPage from '@/pages/HistoryPage';
import StatsPage from '@/pages/StatsPage';
import AboutPage from '@/pages/AboutPage';
import ContactsPage from '@/pages/ContactsPage';
import SupportPage from '@/pages/SupportPage';

type Page = 'home' | 'stations' | 'genres' | 'favorites' | 'history' | 'stats' | 'about' | 'contacts' | 'support';

export default function App() {
  const [page, setPage] = useState<Page>('home');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const player = usePlayer();
  const { favorites, toggle: toggleFavorite } = useFavorites();
  const { history, addEntry, clearHistory } = useHistory();

  const handlePlay = (station: Station) => {
    player.play(station);
    addEntry(station);
  };

  const pageProps = {
    currentStation: player.currentStation,
    isPlaying: player.isPlaying,
    favorites,
    onPlay: handlePlay,
    onToggleFavorite: toggleFavorite,
  };

  const handleNavigate = (p: string) => {
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
      default:          return <HomePage {...pageProps} onNavigate={handleNavigate} />;
    }
  };

  const hasPlayer = !!player.currentStation;

  // On mobile: bottom nav (52px) + optional player (76px) + gap
  // On desktop: optional player only
  const mobileBottomOffset = hasPlayer ? 76 + 52 + 8 : 52 + 8;
  const desktopBottomOffset = hasPlayer ? 88 : 0;

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar (desktop only) */}
      <Sidebar
        currentPage={page}
        onNavigate={setPage}
        favoritesCount={favorites.length}
        historyCount={history.length}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(v => !v)}
        mobileOpen={mobileMenuOpen}
        onMobileClose={() => setMobileMenuOpen(false)}
      />

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* Mobile top bar */}
        <MobileTopBar
          currentPage={page}
          onMenuOpen={() => setMobileMenuOpen(true)}
          currentStation={player.currentStation}
          isPlaying={player.isPlaying}
        />

        {/* Page content
            mobile: bottom-nav(52) + player(76) + gap = ~136px
            desktop: player(88) + gap = ~104px (via md:pb-24 ~96px) */}
        <main
          className="flex-1 overflow-y-auto md:pb-28"
          style={{ paddingBottom: `${mobileBottomOffset}px` }}
        >
          {renderPage()}
        </main>
      </div>

      {/* Player */}
      <Player player={player} sidebarCollapsed={sidebarCollapsed} />

      {/* Mobile bottom nav */}
      <MobileBottomNav
        currentPage={page}
        onNavigate={setPage}
        favoritesCount={favorites.length}
        hasPlayer={hasPlayer}
      />
    </div>
  );
}