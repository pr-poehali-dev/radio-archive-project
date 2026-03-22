import { useState, useEffect, useCallback } from 'react';
import { getStations, ApiStation } from '@/lib/api';
import { Station } from '@/data/stations';

export function apiStationToStation(a: ApiStation): Station {
  return {
    id: String(a.id),
    name: a.name,
    genre: a.genre,
    country: a.country,
    language: a.language,
    streamUrl: a.stream_url,
    logo: a.cover_url || a.logo,
    description: a.description,
    listeners: a.listeners,
    bitrate: a.bitrate,
    tags: a.tags || [],
  };
}

export function useStations() {
  const [stations, setStations] = useState<Station[]>([]);
  const [apiStations, setApiStations] = useState<ApiStation[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getStations();
      setApiStations(data);
      setStations(data.map(apiStationToStation));
    } catch {
      // fallback to empty
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  return { stations, apiStations, loading, reload: load };
}
