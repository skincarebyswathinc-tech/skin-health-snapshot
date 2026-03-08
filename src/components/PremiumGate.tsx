import { useNavigate } from 'react-router-dom';

interface PremiumGateProps {
  children: React.ReactNode;
  isPremium: boolean;
  message?: string;
}

export default function PremiumGate({ children, isPremium, message }: PremiumGateProps) {
  const navigate = useNavigate();

  if (isPremium) return <>{children}</>;

  return (
    <div className="relative">
      <div className="pointer-events-none select-none opacity-30 blur-[2px]">
        {children}
      </div>
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 rounded-[20px]" style={{ background: 'hsl(var(--background) / 0.8)', backdropFilter: 'blur(4px)' }}>
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl" style={{ background: 'hsl(var(--lavender-light))' }}>
          <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="hsl(var(--accent))" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
          </svg>
        </div>
        <p className="text-card-title text-center px-4">{message || 'Upgrade to Premium to unlock this feature'}</p>
        <button onClick={() => navigate('/upgrade')} className="btn-primary text-sm">Upgrade Now</button>
      </div>
    </div>
  );
}
