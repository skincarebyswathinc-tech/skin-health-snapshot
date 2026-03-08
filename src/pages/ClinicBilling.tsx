import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import AppLayout from '@/components/AppLayout';
import PageHeader from '@/components/PageHeader';

const PLANS = [
  {
    id: 'starter',
    name: 'Starter',
    price: '$99',
    period: '/month',
    patients: 50,
    features: ['Up to 50 patients', 'Scan uploads', 'Progress tracking', 'Email support'],
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '$299',
    period: '/month',
    patients: 500,
    features: ['Up to 500 patients', 'Everything in Starter', 'Treatment reports', 'Priority support', 'Custom branding'],
    popular: true,
  },
];

export default function ClinicBilling() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [currentPlan, setCurrentPlan] = useState('starter');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    supabase
      .from('clinic_accounts')
      .select('subscription_plan')
      .eq('admin_user_id', user.id)
      .limit(1)
      .then(({ data }) => {
        if (data?.[0]) setCurrentPlan(data[0].subscription_plan);
        setLoading(false);
      });
  }, [user]);

  const handleSelectPlan = async (planId: string) => {
    if (!user || planId === currentPlan) return;
    // TODO: Integrate Stripe checkout here
    const maxPatients = planId === 'pro' ? 500 : 50;
    await supabase
      .from('clinic_accounts')
      .update({ subscription_plan: planId, max_patients: maxPatients })
      .eq('admin_user_id', user.id);
    setCurrentPlan(planId);
  };

  return (
    <AppLayout onSignOut={signOut}>
      <div className="page-container max-w-3xl">
        <PageHeader title="Clinic Billing" subtitle="Manage your subscription plan" />

        <div className="grid gap-6 sm:grid-cols-2 fade-in stagger-1">
          {PLANS.map((plan) => (
            <div
              key={plan.id}
              className="glass-panel relative overflow-hidden"
              style={plan.popular ? { borderColor: 'hsl(var(--primary))', borderWidth: '2px' } : {}}
            >
              {plan.popular && (
                <div className="absolute top-0 right-0 rounded-bl-xl bg-primary px-3 py-1 text-micro font-medium text-primary-foreground">
                  Popular
                </div>
              )}
              <div className="mb-4">
                <h3 className="text-card-title">{plan.name}</h3>
                <div className="mt-2">
                  <span className="text-3xl font-bold text-foreground">{plan.price}</span>
                  <span className="text-muted-foreground text-sm">{plan.period}</span>
                </div>
              </div>
              <ul className="space-y-2 mb-6">
                {plan.features.map((f, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="hsl(var(--primary))" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => handleSelectPlan(plan.id)}
                disabled={loading || currentPlan === plan.id}
                className={currentPlan === plan.id ? 'btn-secondary w-full' : 'btn-primary w-full'}
              >
                {currentPlan === plan.id ? 'Current Plan' : 'Select Plan'}
              </button>
            </div>
          ))}
        </div>

        <div className="mt-6 text-center">
          <button onClick={() => navigate('/clinic')} className="text-micro text-muted-foreground underline hover:text-foreground transition-colors">
            ← Back to Dashboard
          </button>
        </div>
      </div>
    </AppLayout>
  );
}
