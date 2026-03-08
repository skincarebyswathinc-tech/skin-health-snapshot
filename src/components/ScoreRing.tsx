import { useEffect, useState } from 'react';

interface ScoreRingProps {
  score: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
  color?: string;
  showLabel?: boolean;
}

export default function ScoreRing({ score, size = 120, strokeWidth = 8, label, color, showLabel = true }: ScoreRingProps) {
  const [animatedScore, setAnimatedScore] = useState(0);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (animatedScore / 100) * circumference;

  useEffect(() => {
    const t = setTimeout(() => setAnimatedScore(score), 50);
    return () => clearTimeout(t);
  }, [score]);

  const getColor = () => {
    if (color) return color;
    if (score >= 80) return 'hsl(var(--teal))';
    if (score >= 60) return 'hsl(var(--lavender))';
    if (score >= 40) return 'hsl(var(--rose))';
    return 'hsl(var(--destructive))';
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2} cy={size / 2} r={radius}
            fill="none"
            stroke="hsl(var(--border))"
            strokeWidth={strokeWidth}
          />
          <circle
            cx={size / 2} cy={size / 2} r={radius}
            fill="none"
            stroke={getColor()}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(0.22, 1, 0.36, 1)' }}
          />
        </svg>
        {showLabel && (
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-semibold" style={{ fontSize: size * 0.22, lineHeight: 1, color: 'hsl(var(--foreground))' }}>{score}</span>
            {size >= 100 && <span className="text-micro text-muted-foreground mt-0.5">/ 100</span>}
          </div>
        )}
      </div>
      {label && <span className="text-micro text-muted-foreground">{label}</span>}
    </div>
  );
}
