import { useState, useRef, useEffect, useCallback } from 'react';
import { Station } from '@/data/stations';

export interface PlayerState {
  currentStation: Station | null;
  isPlaying: boolean;
  volume: number;
  isMuted: boolean;
  isLoading: boolean;
  error: string | null;
}

export function usePlayer() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [state, setState] = useState<PlayerState>({
    currentStation: null,
    isPlaying: false,
    volume: 0.7,
    isMuted: false,
    isLoading: false,
    error: null,
  });

  useEffect(() => {
    audioRef.current = new Audio();
    audioRef.current.volume = 0.7;

    audioRef.current.addEventListener('playing', () => {
      setState(s => ({ ...s, isPlaying: true, isLoading: false, error: null }));
    });

    audioRef.current.addEventListener('waiting', () => {
      setState(s => ({ ...s, isLoading: true }));
    });

    audioRef.current.addEventListener('error', () => {
      setState(s => ({ ...s, isLoading: false, isPlaying: false, error: 'Ошибка потока' }));
    });

    audioRef.current.addEventListener('pause', () => {
      setState(s => ({ ...s, isPlaying: false }));
    });

    return () => {
      audioRef.current?.pause();
    };
  }, []);

  const play = useCallback((station: Station) => {
    if (!audioRef.current) return;

    if (state.currentStation?.id === station.id && state.isPlaying) {
      audioRef.current.pause();
      return;
    }

    setState(s => ({ ...s, currentStation: station, isLoading: true, error: null }));
    audioRef.current.src = station.streamUrl;
    audioRef.current.play().catch(() => {
      setState(s => ({ ...s, isLoading: false, error: 'Не удалось воспроизвести' }));
    });
  }, [state.currentStation?.id, state.isPlaying]);

  const togglePlay = useCallback(() => {
    if (!audioRef.current) return;
    if (state.isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(() => {});
    }
  }, [state.isPlaying]);

  const setVolume = useCallback((vol: number) => {
    if (!audioRef.current) return;
    audioRef.current.volume = vol;
    setState(s => ({ ...s, volume: vol, isMuted: vol === 0 }));
  }, []);

  const toggleMute = useCallback(() => {
    if (!audioRef.current) return;
    if (state.isMuted) {
      audioRef.current.volume = state.volume || 0.7;
      setState(s => ({ ...s, isMuted: false }));
    } else {
      audioRef.current.volume = 0;
      setState(s => ({ ...s, isMuted: true }));
    }
  }, [state.isMuted, state.volume]);

  const stop = useCallback(() => {
    if (!audioRef.current) return;
    audioRef.current.pause();
    audioRef.current.src = '';
    setState(s => ({ ...s, isPlaying: false, currentStation: null, isLoading: false }));
  }, []);

  return { ...state, play, togglePlay, setVolume, toggleMute, stop };
}
