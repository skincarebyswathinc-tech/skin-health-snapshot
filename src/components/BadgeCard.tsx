import type { Badge } from '@/lib/progressEngine';

interface BadgeCardProps {
  badges: Badge[];
}

export default function BadgeCard({ badges }: BadgeCardProps) {
  const earned = badges.filter(b => b.earned);
  const unearned = badges.filter(b => !b.earned);

  return (
    <div className="glass-card">
      <h3 className="text-card-title mb-4">Achievements</h3>
      <div className="flex flex-wrap gap-3">
        {earned.map(b => (
          <div key={b.id} className="flex items-center gap-2 rounded-2xl px-4 py-2" style={{ background: 'hsl(var(--teal-light))' }}>
            <span>{b.icon}</span>
            <span className="text-micro font-medium">{b.label}</span>
          </div>
        ))}
        {unearned.map(b => (
          <div key={b.id} className="flex items-center gap-2 rounded-2xl px-4 py-2 opacity-40" style={{ background: 'hsl(var(--muted))' }}>
            <span>{b.icon}</span>
            <span className="text-micro font-medium">{b.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
