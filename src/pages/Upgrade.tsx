import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription, trackEvent } from '@/hooks/useSubscription';
import AppLayout from '@/components/AppLayout';

const BENEFITS = [
  { icon: '📸', label: 'Unlimited skin scans' },
  { icon: '📊', label: 'Full progress analytics' },
  { icon: '🔬', label: 'Habit correlation insights' },
  { icon: '📄', label: 'Downloadable skin reports' },
  { icon: '💡', label: 'Advanced recommendations' },
  { icon: '🚀', label: 'Early access to new features' },
];

const FREE_FEATURES = [
  '2 scans per month',
  'Basic skin score',
  'Limited insights',
  'Limited progress history',
];

export default function Upgrade() {
  const { user, signOut } = useAuth();
  const { isPremium } = useSubscription();
  const navigate = useNavigate();

  const handleUpgrade = async (plan: string) => {
    if (user) {
      await trackEvent(user.id, 'upgrade_clicked', { plan });
    }
    // Payment integration placeholder — in production, this would redirect
    // to a Stripe checkout or similar payment provider
    alert(`Payment integration coming soon! You selected the ${plan} plan.`);
  };

  if (isPremium) {
    return (
      <AppLayout onSignOut={signOut}>
        <div className="page-container max-w-2xl">
          <div className="glass-panel text-center py-16 fade-in">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl" style={{ background: 'hsl(var(--teal-light))' }}>
              <span className="text-2xl">👑</span>
            </div>
            <h1 className="text-page-title mb-2">You're a Premium Member</h1>
            <p className="text-body text-muted-foreground mb-6">You have access to all SkinPulse features.</p>
            <button onClick={() => navigate('/dashboard')} className="btn-primary">Go to Dashboard</button>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout onSignOut={signOut}>
      <div className="page-container max-w-3xl">
        {/* Hero */}
        <div className="text-center mb-10 fade-in">
          <h1 className="text-display mb-3">Unlock Your Full<br /><span className="gradient-text">Skin Intelligence</span></h1>
          <p className="text-body text-muted-foreground max-w-md mx-auto">
            Get unlimited scans, advanced analytics, downloadable reports, and deeper insights into your skin health.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid gap-6 sm:grid-cols-2 mb-10 fade-in stagger-1">
          {/* Free */}
          <div className="glass-card">
            <p className="text-micro font-medium text-muted-foreground uppercase tracking-wider mb-2">Free</p>
            <p className="text-display mb-1">$0</p>
            <p className="text-micro text-muted-foreground mb-6">Forever free</p>
            <ul className="space-y-3 mb-6">
              {FREE_FEATURES.map(f => (
                <li key={f} className="flex items-center gap-2 text-body text-muted-foreground">
                  <span className="text-micro">✓</span> {f}
                </li>
              ))}
            </ul>
            <button className="btn-secondary w-full" disabled>Current Plan</button>
          </div>

          {/* Premium */}
          <div className="glass-panel relative overflow-hidden">
            <div className="absolute top-0 right-0 rounded-bl-2xl px-4 py-1.5 text-micro font-medium" style={{ background: 'hsl(var(--teal))', color: 'hsl(var(--primary-foreground))' }}>
              Recommended
            </div>
            <p className="text-micro font-medium uppercase tracking-wider mb-2" style={{ color: 'hsl(var(--teal))' }}>Premium</p>
            <div className="flex items-baseline gap-1 mb-1">
              <span className="text-display">$9</span>
              <span className="text-body text-muted-foreground">/month</span>
            </div>
            <p className="text-micro text-muted-foreground mb-1">or $79/year <span className="font-medium" style={{ color: 'hsl(var(--teal))' }}>save 27%</span></p>
            <div className="my-6 h-px" style={{ background: 'hsl(var(--border))' }} />
            <ul className="space-y-3 mb-6">
              {BENEFITS.map(b => (
                <li key={b.label} className="flex items-center gap-2 text-body">
                  <span>{b.icon}</span> {b.label}
                </li>
              ))}
            </ul>
            <div className="space-y-2">
              <button onClick={() => handleUpgrade('monthly')} className="btn-primary w-full">
                Start Monthly — $9/mo
              </button>
              <button onClick={() => handleUpgrade('yearly')} className="btn-secondary w-full">
                Start Yearly — $79/yr
              </button>
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div className="glass-card fade-in stagger-2">
          <h2 className="text-section-title mb-4">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {[
              { q: 'Can I cancel anytime?', a: 'Yes, you can cancel your subscription at any time. Your premium features remain active until the end of the billing period.' },
              { q: 'What happens to my data?', a: 'Your scan history and journal data are always yours, regardless of your plan.' },
              { q: 'Is this a medical tool?', a: 'No. SkinPulse provides general wellness insights only and is not a substitute for professional dermatological care.' },
            ].map(faq => (
              <div key={faq.q} className="rounded-2xl border p-5" style={{ borderColor: 'hsl(var(--border))' }}>
                <p className="text-card-title mb-1">{faq.q}</p>
                <p className="text-micro text-muted-foreground">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
