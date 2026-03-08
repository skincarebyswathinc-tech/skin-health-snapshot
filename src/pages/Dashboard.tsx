import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { useSubscription } from '@/hooks/useSubscription';
import AppLayout from '@/components/AppLayout';
import ScoreRing from '@/components/ScoreRing';
import EmptyState from '@/components/EmptyState';

interface Scan {
  id: string;
  created_at: string;
  overall_score: number;
  image_url: string;
}

interface Profile {
  first_name: string | null;
}

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { isPremium, scanCount, scanLimit, canScan } = useSubscription();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [latestScan, setLatestScan] = useState<Scan | null>(null);
  const [recentScans, setRecentScans] = useState<Scan[]>([]);
  const [onboardingComplete, setOnboardingComplete] = useState<boolean | null>(null);
  const [daysSinceLastScan, setDaysSinceLastScan] = useState<number | null>(null);

  useEffect(() => {
    if (!user) return;
    supabase.from('app_preferences').select('onboarding_complete').eq('user_id', user.id).single()
      .then(({ data }) => {
        setOnboardingComplete(data?.onboarding_complete ?? false);
        if (data && !data.onboarding_complete) navigate('/onboarding');
      });
    supabase.from('profiles').select('first_name').eq('user_id', user.id).single()
      .then(({ data }) => setProfile(data));
    supabase.from('scans').select('id, created_at, overall_score, image_url')
      .eq('user_id', user.id).eq('status', 'complete')
      .order('created_at', { ascending: false }).limit(5)
      .then(({ data }) => {
        if (data && data.length > 0) {
          setLatestScan(data[0]);
          setRecentScans(data);
          const lastDate = new Date(data[0].created_at);
          setDaysSinceLastScan(Math.floor((Date.now() - lastDate.getTime()) / (1000 * 60 * 60 * 24)));
        }
      });
  }, [user, navigate]);

  if (onboardingComplete === null) {
    return <div className="flex min-h-screen items-center justify-center"><div className="h-8 w-8 spin-slow rounded-full border-2 border-muted border-t-primary" /></div>;
  }

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <AppLayout onSignOut={signOut}>
      <div className="page-container">
        {/* Welcome + Premium badge */}
        <div className="mb-8 fade-in">
          <div className="flex items-center gap-3 mb-1 flex-wrap">
            <h1 className="text-display">
              {greeting()}{profile?.first_name ? `, ${profile.first_name}` : ''}.
            </h1>
            {isPremium && (
              <span className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-micro font-medium" style={{ background: 'hsl(var(--teal-light))', color: 'hsl(var(--teal))' }}>
                👑 Premium
              </span>
            )}
          </div>
          <p className="mt-2 text-body text-muted-foreground">Your skin wellness overview</p>
        </div>

        {/* Retention messaging */}
        {daysSinceLastScan !== null && daysSinceLastScan >= 14 && (
          <div className="mb-6 rounded-2xl p-5 fade-in" style={{ background: 'hsl(var(--teal-light))' }}>
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div>
                <p className="text-card-title">It's time for your next skin scan</p>
                <p className="text-micro text-muted-foreground">Your last scan was {daysSinceLastScan} days ago. Regular scans help track progress.</p>
              </div>
              <button onClick={() => navigate('/scan/new')} className="btn-primary text-sm shrink-0">Scan Now</button>
            </div>
          </div>
        )}

        {/* Scan limit for free users */}
        {!isPremium && (
          <div className="mb-6 flex items-center justify-between rounded-2xl border p-4 fade-in" style={{ borderColor: 'hsl(var(--border))' }}>
            <div className="flex items-center gap-3">
              <span className="text-micro text-muted-foreground">
                Scans this month: <strong className="text-foreground">{scanCount}/{typeof scanLimit === 'number' ? scanLimit : '∞'}</strong>
              </span>
            </div>
            <button onClick={() => navigate('/upgrade')} className="text-micro font-medium" style={{ color: 'hsl(var(--teal))' }}>Upgrade →</button>
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Skin Score Card */}
          <div className="glass-panel flex flex-col items-center gap-5 fade-in stagger-1">
            {latestScan ? (
              <>
                <ScoreRing score={latestScan.overall_score} size={160} strokeWidth={10} />
                <div className="text-center">
                  <p className="text-card-title">Skin Health Score</p>
                  <p className="text-micro text-muted-foreground">Latest scan · {new Date(latestScan.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                </div>
                <button onClick={() => navigate(`/scan/${latestScan.id}`)} className="btn-ghost text-micro">View details →</button>
              </>
            ) : (
              <div className="py-6 text-center">
                <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-2xl" style={{ background: 'hsl(var(--muted))' }}>
                  <span className="text-2xl text-muted-foreground">?</span>
                </div>
                <p className="text-card-title mb-1">No score yet</p>
                <p className="text-micro text-muted-foreground">Take your first scan</p>
              </div>
            )}
          </div>

          {/* Quick Scan CTA */}
          <div className="glass-card-hover flex flex-col items-center justify-center gap-5 text-center fade-in stagger-2">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl" style={{ background: 'hsl(var(--teal-light))' }}>
              <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="hsl(var(--teal))" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
              </svg>
            </div>
            <div>
              <p className="text-card-title mb-1">New Scan</p>
              <p className="text-micro text-muted-foreground">Upload a photo for analysis</p>
            </div>
            <button onClick={() => navigate('/scan/new')} className="btn-primary">Start Scan</button>
          </div>

          {/* Quick Access */}
          <div className="glass-card fade-in stagger-3">
            <p className="text-card-title mb-4">Quick Access</p>
            <div className="space-y-2">
              <button onClick={() => navigate('/journal')} className="flex w-full items-center gap-3 rounded-xl p-3 text-sm transition-colors hover:bg-muted">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ background: 'hsl(var(--teal-light))' }}>📝</span>
                <span>Daily Journal</span>
              </button>
              <button onClick={() => navigate('/progress')} className="flex w-full items-center gap-3 rounded-xl p-3 text-sm transition-colors hover:bg-muted">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ background: 'hsl(var(--lavender-light))' }}>📈</span>
                <span>Skin Progress</span>
              </button>
              <button onClick={() => navigate('/referrals')} className="flex w-full items-center gap-3 rounded-xl p-3 text-sm transition-colors hover:bg-muted">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ background: 'hsl(var(--teal-light))' }}>🎁</span>
                <span>Refer Friends</span>
              </button>
              <button onClick={() => navigate('/settings')} className="flex w-full items-center gap-3 rounded-xl p-3 text-sm transition-colors hover:bg-muted">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ background: 'hsl(var(--muted))' }}>⚙️</span>
                <span>Settings</span>
              </button>
            </div>
          </div>
        </div>

        {/* Recent Scans */}
        <div className="mt-10 fade-in stagger-4">
          <h2 className="text-section-title mb-5">Recent Scans</h2>
          {recentScans.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {recentScans.map(scan => (
                <button key={scan.id} onClick={() => navigate(`/scan/${scan.id}`)} className="glass-card-hover text-left">
                  <div className="flex items-center gap-4">
                    <ScoreRing score={scan.overall_score} size={52} strokeWidth={4} />
                    <div>
                      <p className="text-card-title">Score: {scan.overall_score}</p>
                      <p className="text-micro text-muted-foreground">{new Date(scan.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <EmptyState
              title="No scans yet"
              description="Take your first skin scan to start building your wellness profile."
              action={{ label: 'Start Your First Scan', href: '/scan/new' }}
            />
          )}
        </div>

        {/* Insights */}
        <div className="mt-10 glass-panel fade-in stagger-5">
          <h2 className="text-section-title mb-2">Personalized Insights</h2>
          <p className="text-body text-muted-foreground">
            {recentScans.length > 0
              ? 'Log your daily habits in the Journal and track your progress over time.'
              : 'Complete your first scan to receive personalized wellness recommendations and track your skin health journey.'}
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <button onClick={() => navigate('/journal')} className="btn-secondary text-sm">Log Today's Habits</button>
            <button onClick={() => navigate('/progress')} className="btn-ghost text-sm">View Progress →</button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
