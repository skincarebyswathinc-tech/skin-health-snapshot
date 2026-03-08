interface PageHeaderProps {
  title: string;
  subtitle?: string;
}

export default function PageHeader({ title, subtitle }: PageHeaderProps) {
  return (
    <div className="section-header fade-in">
      <h1 className="text-page-title">{title}</h1>
      {subtitle && <p className="mt-1.5 text-body text-muted-foreground">{subtitle}</p>}
    </div>
  );
}
