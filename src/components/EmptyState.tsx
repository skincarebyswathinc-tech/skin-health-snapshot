interface EmptyStateProps {
  title: string;
  description: string;
  action?: { label: string; href: string };
}

export default function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="glass-card flex flex-col items-center justify-center py-20 text-center">
      <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl" style={{ background: 'hsl(var(--teal-light))' }}>
        <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="hsl(var(--teal))" strokeWidth="1.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
      </div>
      <h3 className="text-section-title mb-2">{title}</h3>
      <p className="mb-8 max-w-sm text-body text-muted-foreground">{description}</p>
      {action && (
        <a href={action.href} className="btn-primary">{action.label}</a>
      )}
    </div>
  );
}
