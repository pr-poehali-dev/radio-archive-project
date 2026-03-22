import { useState, useEffect, useCallback } from 'react';
import { Station } from '@/data/stations';

export interface HistoryEntry {
  station: Station;
  playedAt: Date;
  duration: number;
}

export function useHistory() {
  const [history, setHistory] = useState<HistoryEntry[]>(() => {
    try {
      const saved = localStorage.getItem('radio_history');
      if (saved) {
        return JSON.parse(saved).map((e: HistoryEntry & { playedAt: string }) => ({
          ...e,
          playedAt: new Date(e.playedAt),
        }));
      }
    } catch (e) { console.warn(e); }
    return [];
  });

  useEffect(() => {
    localStorage.setItem('radio_history', JSON.stringify(history));
  }, [history]);

  const addEntry = useCallback((station: Station) => {
    setHistory(h => {
      const entry: HistoryEntry = { station, playedAt: new Date(), duration: 0 };
      return [entry, ...h].slice(0, 100);
    });
  }, []);

  const clearHistory = useCallback(() => setHistory([]), []);

  return { history, addEntry, clearHistory };
}