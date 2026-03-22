import { Station } from '@/data/stations';
import StationCard from '@/components/StationCard';
import Icon from '@/components/ui/icon';

interface FavoritesPageProps {
  currentStation: Station | null;
  isPlaying: boolean;
  favorites: Station[];
  onPlay: (s: Station) => void;
  onToggleFavorite: (s: Station) => void;
}

export default function FavoritesPage({ currentStation, isPlaying, favorites, onPlay, onToggleFavorite }: FavoritesPageProps) {
  return (
    <div className="p-4 md:p-8 animate-fade-in">
      <div className="mb-4 md:mb-6">
        <h2 className="font-oswald font-bold text-xl md:text-2xl text-foreground mb-1">Избранное</h2>
        <p className="text-muted-foreground text-xs md:text-sm">
          {favorites.length > 0 ? `${favorites.length} сохранённых станций` : 'Пусто пока'}
        </p>
      </div>

      {favorites.length === 0 ? (
        <div
          className="rounded-2xl md:rounded-3xl p-10 md:p-16 text-center"
          style={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
        >
          <div className="text-5xl md:text-6xl mb-3 md:mb-4">💫</div>
          <h3 className="font-oswald font-semibold text-lg md:text-xl text-foreground mb-2">Добавьте любимые станции</h3>
          <p className="text-muted-foreground text-xs md:text-sm max-w-xs mx-auto">
            Нажмите на ❤️ в карточке любой станции, чтобы добавить её в избранное
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {favorites.map(station => (
            <StationCard
              key={station.id}
              station={station}
              isActive={currentStation?.id === station.id}
              isPlaying={currentStation?.id === station.id && isPlaying}
              isFavorite
              onPlay={onPlay}
              onToggleFavorite={onToggleFavorite}
            />
          ))}
        </div>
      )}
    </div>
  );
}