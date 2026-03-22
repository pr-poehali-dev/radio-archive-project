interface WaveAnimationProps {
  isPlaying: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export default function WaveAnimation({ isPlaying, size = 'md' }: WaveAnimationProps) {
  const heights = ['40%', '70%', '100%', '60%', '85%'];
  const sizeMap = { sm: 'h-4 gap-[2px]', md: 'h-6 gap-[3px]', lg: 'h-8 gap-1' };
  const barWidth = size === 'lg' ? 'w-1' : 'w-[3px]';

  return (
    <div className={`flex items-end ${sizeMap[size]}`}>
      {heights.map((h, i) => (
        <div
          key={i}
          className={`${barWidth} rounded-full bg-primary`}
          style={{
            height: isPlaying ? h : '25%',
            animation: isPlaying ? `wave 0.8s ease-in-out infinite` : 'none',
            animationDelay: `${i * 0.1}s`,
            transition: 'height 0.3s ease',
          }}
        />
      ))}
    </div>
  );
}
