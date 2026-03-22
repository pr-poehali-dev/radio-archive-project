import { useState } from 'react';
import Icon from '@/components/ui/icon';
import WaveAnimation from '@/components/WaveAnimation';
import { PlayerState } from '@/hooks/usePlayer';

interface PlayerProps {
  player: PlayerState & {
    togglePlay: () => void;
    setVolume: (v: number) => void;
    toggleMute: () => void;
    stop: () => void;
  };
}

export default function Player({ player }: PlayerProps) {
  const [showVolume, setShowVolume] = useState(false);

  if (!player.currentStation) return null;

  const { currentStation, isPlaying, isLoading, volume, isMuted } = player;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 animate-slide-up">
      <div
        className="mx-4 mb-4 rounded-2xl overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, hsl(220 20% 10%) 0%, hsl(220 18% 8%) 100%)',
          border: '1px solid hsl(165 80% 50% / 0.25)',
          boxShadow: '0 -4px 40px hsl(165 80% 50% / 0.1), 0 20px 60px hsl(0 0% 0% / 0.5)',
        }}
      >
        <div className="flex items-center gap-4 px-5 py-4">
          {/* Station logo */}
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 relative"
            style={{ background: 'hsl(220 15% 14%)' }}
          >
            {currentStation.logo}
            {isPlaying && (
              <div
                className="absolute inset-0 rounded-xl pulse-ring"
                style={{ border: '1px solid hsl(165 80% 50% / 0.4)' }}
              />
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="font-semibold text-foreground truncate text-sm">{currentStation.name}</p>
              {isLoading && (
                <span className="text-xs text-muted-foreground animate-pulse">буфер...</span>
              )}
            </div>
            <p className="text-xs text-muted-foreground truncate">{currentStation.description}</p>
          </div>

          {/* Wave */}
          <div className="flex-shrink-0">
            <WaveAnimation isPlaying={isPlaying && !isLoading} size="sm" />
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Volume */}
            <div className="relative">
              <button
                onClick={() => setShowVolume(v => !v)}
                className="w-9 h-9 rounded-xl flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                style={{ background: 'hsl(220 15% 14%)' }}
              >
                <Icon name={isMuted || volume === 0 ? 'VolumeX' : volume < 0.5 ? 'Volume1' : 'Volume2'} size={16} />
              </button>
              {showVolume && (
                <div
                  className="absolute bottom-12 right-0 p-3 rounded-xl"
                  style={{ background: 'hsl(220 20% 12%)', border: '1px solid hsl(var(--border))' }}
                >
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={isMuted ? 0 : volume}
                    onChange={e => player.setVolume(parseFloat(e.target.value))}
                    className="w-24 accent-primary cursor-pointer"
                    style={{ writingMode: 'vertical-lr', direction: 'rtl', width: '20px', height: '80px' }}
                  />
                </div>
              )}
            </div>

            {/* Play/Pause */}
            <button
              onClick={player.togglePlay}
              disabled={isLoading}
              className="w-12 h-12 rounded-xl flex items-center justify-center transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
              style={{
                background: 'hsl(var(--primary))',
                color: 'hsl(var(--primary-foreground))',
                boxShadow: '0 0 20px hsl(165 80% 50% / 0.3)',
              }}
            >
              {isLoading ? (
                <Icon name="Loader2" size={20} className="animate-spin" />
              ) : isPlaying ? (
                <Icon name="Pause" size={20} />
              ) : (
                <Icon name="Play" size={20} />
              )}
            </button>

            {/* Stop */}
            <button
              onClick={player.stop}
              className="w-9 h-9 rounded-xl flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
              style={{ background: 'hsl(220 15% 14%)' }}
            >
              <Icon name="Square" size={16} />
            </button>
          </div>
        </div>

        {/* Progress line */}
        <div className="h-px bg-border">
          {isPlaying && (
            <div
              className="h-full bg-primary"
              style={{
                animation: 'scan 3s linear infinite',
                background: 'linear-gradient(90deg, transparent, hsl(var(--primary)), transparent)',
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
