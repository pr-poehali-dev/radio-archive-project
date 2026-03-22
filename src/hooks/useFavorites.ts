import { useState, useCallback } from 'react';
import { Station } from '@/data/stations';

export function useFavorites() {
  const [favorites, setFavorites] = useState<Station[]>(() => {
    try {
      const saved = localStorage.getItem('radio_favorites');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.warn(e);
      return [];
    }
  });

  const toggle = useCallback((station: Station) => {
    setFavorites(prev => {
      const exists = prev.find(s => s.id === station.id);
      const next = exists ? prev.filter(s => s.id !== station.id) : [...prev, station];
      localStorage.setItem('radio_favorites', JSON.stringify(next));
      return next;
    });
  }, []);

  const isFavorite = useCallback(
    (id: string) => favorites.some(s => s.id === id),
    [favorites]
  );

  return { favorites, toggle, isFavorite };
}
