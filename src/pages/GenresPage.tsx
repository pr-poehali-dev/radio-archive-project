import { Station, STATIONS, GENRES } from '@/data/stations';
import StationCard from '@/components/StationCard';
import Icon from '@/components/ui/icon';

interface GenresPageProps {
  currentStation: Station | null;
  isPlaying: boolean;
  favorites: Station[];
  onPlay: (s: Station) => void;
  onToggleFavorite: (s: Station) => void;
}

export default function GenresPage({ currentStation, isPlaying, favorites, onPlay, onToggleFavorite }: GenresPageProps) {
  const genres = GENRES.filter(g => g.id !== 'all').map(g => ({
    ...g,
    stations: STATIONS.filter(s => s.genre === g.id),
  })).filter(g => g.stations.length > 0);

  return (
    <div className="p-8 animate-fade-in">
      <div className="mb-6">
        <h2 className="font-oswald font-bold text-2xl text-foreground mb-1">Жанры</h2>
        <p className="text-muted-foreground text-sm">Выбери настроение — найди свою волну</p>
      </div>

      {/* Genre overview cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 mb-10">
        {genres.map((genre, idx) => (
          <a
            key={genre.id}
            href={`#genre-${genre.id}`}
            className="rounded-2xl p-4 text-center transition-all hover:scale-105 cursor-pointer block"
            style={{
              background: `hsl(${(idx * 35) % 360} 50% 15% / 0.6)`,
              border: `1px solid hsl(${(idx * 35) % 360} 50% 30% / 0.3)`,
            }}
          >
            <div className="text-3xl mb-2">{genre.icon}</div>
            <p className="text-sm font-semibold text-foreground">{genre.label}</p>
            <p className="text-xs text-muted-foreground mt-1">{genre.stations.length} ст.</p>
          </a>
        ))}
      </div>

      {/* Stations by genre */}
      <div className="space-y-10">
        {genres.map(genre => (
          <div key={genre.id} id={`genre-${genre.id}`}>
            <div className="flex items-center gap-3 mb-4">
              <span className="text-2xl">{genre.icon}</span>
              <div>
                <h3 className="font-oswald font-bold text-xl text-foreground">{genre.label}</h3>
                <p className="text-xs text-muted-foreground">{genre.stations.length} станций</p>
              </div>
            </div>
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
              {genre.stations.map(station => (
                <StationCard
                  key={station.id}
                  station={station}
                  isActive={currentStation?.id === station.id}
                  isPlaying={currentStation?.id === station.id && isPlaying}
                  isFavorite={favorites.some(f => f.id === station.id)}
                  onPlay={onPlay}
                  onToggleFavorite={onToggleFavorite}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
