import { useState } from 'react';
import { usePlayer } from '@/hooks/usePlayer';
import { useFavorites } from '@/hooks/useFavorites';
import { useHistory } from '@/hooks/useHistory';
import { Station } from '@/data/stations';

import Sidebar from '@/components/Sidebar';
import Player from '@/components/Player';

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

  const renderPage = () => {
    switch (page) {
      case 'home': return <HomePage {...pageProps} onNavigate={(p: string) => setPage(p as Page)} />;
      case 'stations': return <StationsPage {...pageProps} />;
      case 'genres': return <GenresPage {...pageProps} />;
      case 'favorites': return <FavoritesPage {...pageProps} />;
      case 'history': return <HistoryPage history={history} onClear={clearHistory} onPlay={handlePlay} />;
      case 'stats': return <StatsPage history={history} />;
      case 'about': return <AboutPage />;
      case 'contacts': return <ContactsPage />;
      case 'support': return <SupportPage />;
      default: return <HomePage {...pageProps} onNavigate={(p: string) => setPage(p as Page)} />;
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar
        currentPage={page}
        onNavigate={setPage}
        favoritesCount={favorites.length}
        historyCount={history.length}
      />
      <main
        className="flex-1 overflow-y-auto"
        style={{ paddingBottom: player.currentStation ? '100px' : '0' }}
      >
        {renderPage()}
      </main>
      <Player player={player} />
    </div>
  );
}
