import { useNavigate } from 'react-router-dom';

interface ScanLimitBannerProps {
  scanCount: number;
  scanLimit: number;
  isPremium: boolean;
}

export default function ScanLimitBanner({ scanCount, scanLimit, isPremium }: ScanLimitBannerProps) {
  const navigate = useNavigate();
  if (isPremium) return null;

  const remaining = Math.max(0, scanLimit - scanCount);
  const atLimit = remaining === 0;

  return (
    <div
      className="mb-6 rounded-2xl border p-5 fade-in"
      style={{
        background: atLimit ? 'hsl(var(--destructive) / 0.06)' : 'hsl(var(--teal-light))',
        borderColor: atLimit ? 'hsl(var(--destructive) / 0.2)' : 'hsl(var(--teal) / 0.2)',
      }}
    >
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <p className="text-card-title">
            {atLimit ? 'Monthly scan limit reached' : `${remaining} scan${remaining !== 1 ? 's' : ''} remaining this month`}
          </p>
          <p className="text-micro text-muted-foreground mt-0.5">
            {atLimit
              ? 'Upgrade to Premium for unlimited scans.'
              : `Free plan includes ${scanLimit} scans per month.`}
          </p>
        </div>
        {atLimit && (
          <button onClick={() => navigate('/upgrade')} className="btn-primary text-sm shrink-0">
            Upgrade to Premium
          </button>
        )}
      </div>
    </div>
  );
}
