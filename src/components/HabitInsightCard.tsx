import type { CorrelationInsight } from '@/lib/progressEngine';

interface HabitInsightCardProps {
  insight: CorrelationInsight;
}

export default function HabitInsightCard({ insight }: HabitInsightCardProps) {
  const isPositive = insight.direction === 'positive';

  return (
    <div className="glass-card p-5">
      <div className="flex items-start gap-3">
        <div
          className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl text-sm"
          style={{
            background: isPositive ? 'hsl(var(--teal-light))' : 'hsl(var(--destructive) / 0.1)',
          }}
        >
          {isPositive ? '↑' : '↓'}
        </div>
        <div>
          <p className="text-body font-medium" style={{ color: 'hsl(var(--foreground))' }}>
            {insight.habit} → {insight.metric}
          </p>
          <p className="text-micro text-muted-foreground mt-1">{insight.message}</p>
        </div>
      </div>
    </div>
  );
}
