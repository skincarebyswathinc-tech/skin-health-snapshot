import { ReactNode } from 'react';

interface MetricTileProps {
  label: string;
  score: number;
  icon?: ReactNode;
}

function getScoreLabel(score: number): string {
  if (score >= 80) return 'Excellent';
  if (score >= 65) return 'Good';
  if (score >= 50) return 'Moderate';
  return 'Low';
}

function getBarColor(score: number): string {
  if (score >= 80) return 'hsl(var(--teal))';
  if (score >= 60) return 'hsl(var(--lavender))';
  if (score >= 40) return 'hsl(var(--rose))';
  return 'hsl(var(--destructive))';
}

function getLabelColor(score: number): string {
  if (score >= 80) return 'hsl(var(--teal))';
  if (score >= 60) return 'hsl(var(--lavender))';
  if (score >= 40) return 'hsl(var(--rose))';
  return 'hsl(var(--destructive))';
}

export default function MetricTile({ label, score, icon }: MetricTileProps) {
  return (
    <div className="glass-card-metric flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-micro font-medium uppercase tracking-wider text-muted-foreground">{label}</span>
        {icon}
      </div>
      <div className="flex items-end gap-2">
        <span className="text-[32px] font-semibold leading-none" style={{ color: 'hsl(var(--foreground))' }}>{score}</span>
        <span className="mb-1 text-micro text-muted-foreground">/ 100</span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full" style={{ background: 'hsl(var(--border))' }}>
        <div
          className="h-full rounded-full"
          style={{
            width: `${score}%`,
            background: getBarColor(score),
            transition: 'width 1s cubic-bezier(0.22, 1, 0.36, 1)',
          }}
        />
      </div>
      <span className="text-micro font-medium" style={{ color: getLabelColor(score) }}>{getScoreLabel(score)}</span>
    </div>
  );
}
