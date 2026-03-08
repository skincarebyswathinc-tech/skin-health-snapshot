interface MetricSparklineProps {
  values: number[];
  label: string;
  currentValue: number;
  color?: string;
}

export default function MetricSparkline({ values, label, currentValue, color = 'hsl(var(--teal))' }: MetricSparklineProps) {
  const w = 120;
  const h = 32;
  const pad = 2;

  if (values.length < 2) {
    return (
      <div className="glass-card-metric flex items-center justify-between">
        <div>
          <p className="text-micro text-muted-foreground">{label}</p>
          <p className="text-card-title">{currentValue}</p>
        </div>
        <p className="text-micro text-muted-foreground">Need more data</p>
      </div>
    );
  }

  const min = Math.max(0, Math.min(...values) - 5);
  const max = Math.min(100, Math.max(...values) + 5);
  const range = max - min || 1;

  const points = values.map((v, i) => {
    const x = pad + (i / (values.length - 1)) * (w - pad * 2);
    const y = pad + (h - pad * 2) - ((v - min) / range) * (h - pad * 2);
    return `${x},${y}`;
  }).join(' ');

  const trend = values[values.length - 1] - values[0];
  const trendLabel = trend > 0 ? `+${trend}` : `${trend}`;
  const trendColor = trend > 0 ? 'hsl(var(--teal))' : trend < 0 ? 'hsl(var(--destructive))' : 'hsl(var(--muted-foreground))';

  return (
    <div className="glass-card-metric flex items-center justify-between gap-3">
      <div className="min-w-0">
        <p className="text-micro text-muted-foreground">{label}</p>
        <p className="text-card-title">{currentValue}</p>
        <p className="text-micro font-medium" style={{ color: trendColor }}>{trendLabel}</p>
      </div>
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="flex-shrink-0">
        <polyline points={points} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}
