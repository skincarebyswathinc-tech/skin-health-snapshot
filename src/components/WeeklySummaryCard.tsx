import type { WeeklyInsight } from '@/lib/progressEngine';

interface WeeklySummaryCardProps {
  insights: WeeklyInsight[];
}

const iconMap: Record<string, string> = {
  improvement: '📈',
  decline: '📉',
  correlation: '🔗',
  tip: '💡',
};

export default function WeeklySummaryCard({ insights }: WeeklySummaryCardProps) {
  if (insights.length === 0) return null;

  return (
    <div className="glass-panel">
      <h3 className="text-section-title mb-4">Weekly Insights</h3>
      <div className="space-y-3">
        {insights.map((ins, i) => (
          <div key={i} className="flex items-start gap-3">
            <span className="text-base mt-0.5">{iconMap[ins.type] || '💡'}</span>
            <p className="text-body text-muted-foreground">{ins.message}</p>
          </div>
        ))}
      </div>
      <p className="text-micro text-muted-foreground mt-4 pt-3" style={{ borderTop: '1px solid hsl(var(--border))' }}>
        Insights are observational correlations and not medical conclusions.
      </p>
    </div>
  );
}
