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
  sidebarCollapsed?: boolean;
}

export default function Player({ player, sidebarCollapsed }: PlayerProps) {
  const [showVolume, setShowVolume] = useState(false);

  if (!player.currentStation) return null;

  const { currentStation, isPlaying, isLoading, volume, isMuted } = player;

  return (
    <div
      className="fixed bottom-0 z-50 animate-slide-up"
      style={{
        // On desktop: offset left by sidebar width
        left: 0,
        right: 0,
      }}
    >
      {/* Desktop offset wrapper */}
      <div
        className="hidden md:block transition-all duration-300"
        style={{ paddingLeft: sidebarCollapsed ? '64px' : '240px' }}
      >
        <PlayerInner
          currentStation={currentStation}
          isPlaying={isPlaying}
          isLoading={isLoading}
          volume={volume}
          isMuted={isMuted}
          showVolume={showVolume}
          setShowVolume={setShowVolume}
          player={player}
          mobile={false}
        />
      </div>

      {/* Mobile player */}
      <div className="md:hidden">
        <PlayerInner
          currentStation={currentStation}
          isPlaying={isPlaying}
          isLoading={isLoading}
          volume={volume}
          isMuted={isMuted}
          showVolume={showVolume}
          setShowVolume={setShowVolume}
          player={player}
          mobile
        />
      </div>
    </div>
  );
}

interface PlayerInnerProps {
  currentStation: NonNullable<PlayerState['currentStation']>;
  isPlaying: boolean;
  isLoading: boolean;
  volume: number;
  isMuted: boolean;
  showVolume: boolean;
  setShowVolume: (v: boolean | ((prev: boolean) => boolean)) => void;
  player: PlayerState & { togglePlay: () => void; setVolume: (v: number) => void; toggleMute: () => void; stop: () => void };
  mobile: boolean;
}

function PlayerInner({ currentStation, isPlaying, isLoading, volume, isMuted, showVolume, setShowVolume, player, mobile }: PlayerInnerProps) {
  return (
    <div
      className="mx-3 mb-3 rounded-2xl overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, hsl(220 20% 10%) 0%, hsl(220 18% 8%) 100%)',
        border: '1px solid hsl(165 80% 50% / 0.25)',
        boxShadow: '0 -4px 40px hsl(165 80% 50% / 0.1), 0 20px 60px hsl(0 0% 0% / 0.5)',
      }}
    >
      <div className={`flex items-center gap-3 ${mobile ? 'px-3 py-3' : 'px-5 py-3.5'}`}>
        {/* Logo */}
        <div
          className={`rounded-xl flex items-center justify-center text-xl flex-shrink-0 relative ${mobile ? 'w-10 h-10' : 'w-11 h-11'}`}
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
          <div className="flex items-center gap-1.5">
            <p className={`font-semibold text-foreground truncate ${mobile ? 'text-xs' : 'text-sm'}`}>
              {currentStation.name}
            </p>
            {isLoading && (
              <span className="text-[10px] text-muted-foreground animate-pulse flex-shrink-0">буфер...</span>
            )}
          </div>
          {!mobile && (
            <p className="text-xs text-muted-foreground truncate">{currentStation.description}</p>
          )}
          {mobile && (
            <p className="text-[10px] text-muted-foreground truncate">{currentStation.genre} · {currentStation.country}</p>
          )}
        </div>

        {/* Wave — hidden on mobile to save space */}
        {!mobile && (
          <div className="flex-shrink-0">
            <WaveAnimation isPlaying={isPlaying && !isLoading} size="sm" />
          </div>
        )}

        {/* Controls */}
        <div className={`flex items-center flex-shrink-0 ${mobile ? 'gap-1.5' : 'gap-2'}`}>
          {/* Volume — only desktop */}
          {!mobile && (
            <div className="relative">
              <button
                onClick={() => setShowVolume(v => !v)}
                className="w-8 h-8 rounded-xl flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                style={{ background: 'hsl(220 15% 14%)' }}
              >
                <Icon
                  name={isMuted || volume === 0 ? 'VolumeX' : volume < 0.5 ? 'Volume1' : 'Volume2'}
                  size={15}
                />
              </button>
              {showVolume && (
                <div
                  className="absolute bottom-11 right-0 p-3 rounded-xl"
                  style={{ background: 'hsl(220 20% 12%)', border: '1px solid hsl(var(--border))' }}
                >
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={isMuted ? 0 : volume}
                    onChange={e => player.setVolume(parseFloat(e.target.value))}
                    className="accent-primary cursor-pointer"
                    style={{ writingMode: 'vertical-lr', direction: 'rtl', width: '20px', height: '80px' }}
                  />
                </div>
              )}
            </div>
          )}

          {/* Play/Pause */}
          <button
            onClick={player.togglePlay}
            disabled={isLoading}
            className={`rounded-xl flex items-center justify-center transition-all hover:scale-105 active:scale-95 disabled:opacity-50 ${mobile ? 'w-10 h-10' : 'w-11 h-11'}`}
            style={{
              background: 'hsl(var(--primary))',
              color: 'hsl(var(--primary-foreground))',
              boxShadow: '0 0 20px hsl(165 80% 50% / 0.3)',
            }}
          >
            {isLoading ? (
              <Icon name="Loader2" size={mobile ? 17 : 19} className="animate-spin" />
            ) : isPlaying ? (
              <Icon name="Pause" size={mobile ? 17 : 19} />
            ) : (
              <Icon name="Play" size={mobile ? 17 : 19} />
            )}
          </button>

          {/* Stop */}
          <button
            onClick={player.stop}
            className={`rounded-xl flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors ${mobile ? 'w-8 h-8' : 'w-8 h-8'}`}
            style={{ background: 'hsl(220 15% 14%)' }}
          >
            <Icon name="Square" size={14} />
          </button>
        </div>
      </div>

      {/* Scan line */}
      <div className="h-px bg-border overflow-hidden">
        {isPlaying && (
          <div
            className="h-full"
            style={{
              background: 'linear-gradient(90deg, transparent, hsl(var(--primary)), transparent)',
              animation: 'scan 3s linear infinite',
              width: '60%',
            }}
          />
        )}
      </div>
    </div>
  );
}
