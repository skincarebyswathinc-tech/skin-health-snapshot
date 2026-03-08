import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import AppLayout from '@/components/AppLayout';
import PageHeader from '@/components/PageHeader';
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
  const [profile, setProfile] = useState<Profile | null>(null);
  const [latestScan, setLatestScan] = useState<Scan | null>(null);
  const [recentScans, setRecentScans] = useState<Scan[]>([]);
  const [onboardingComplete, setOnboardingComplete] = useState<boolean | null>(null);

  useEffect(() => {
    if (!user) return;

    // Check onboarding
    supabase.from('app_preferences').select('onboarding_complete').eq('user_id', user.id).single()
      .then(({ data }) => {
        setOnboardingComplete(data?.onboarding_complete ?? false);
        if (data && !data.onboarding_complete) navigate('/onboarding');
      });

    // Load profile
    supabase.from('profiles').select('first_name').eq('user_id', user.id).single()
      .then(({ data }) => setProfile(data));

    // Load scans
    supabase.from('scans').select('id, created_at, overall_score, image_url')
      .eq('user_id', user.id).eq('status', 'complete')
      .order('created_at', { ascending: false }).limit(5)
      .then(({ data }) => {
        if (data && data.length > 0) {
          setLatestScan(data[0]);
          setRecentScans(data);
        }
      });
  }, [user, navigate]);

  if (onboardingComplete === null) {
    return <div className="flex min-h-screen items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-2 border-muted border-t-primary" /></div>;
  }

  return (
    <AppLayout onSignOut={signOut}>
      <div className="page-container">
        <PageHeader
          title={`Welcome${profile?.first_name ? `, ${profile.first_name}` : ''}`}
          subtitle="Your skin wellness overview"
        />

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {/* Score Card */}
          <div className="glass-card-hover flex flex-col items-center gap-4 sm:col-span-1 fade-in stagger-1">
            {latestScan ? (
              <>
                <ScoreRing score={latestScan.overall_score} size={140} />
                <div className="text-center">
                  <p className="text-sm font-medium">Overall Score</p>
                  <p className="text-xs text-muted-foreground">Latest scan</p>
                </div>
              </>
            ) : (
              <div className="py-4 text-center">
                <div className="mx-auto mb-3 flex h-20 w-20 items-center justify-center rounded-full" style={{ background: 'hsl(var(--muted))' }}>
                  <span className="text-2xl text-muted-foreground">?</span>
                </div>
                <p className="text-sm text-muted-foreground">No scans yet</p>
              </div>
            )}
          </div>

          {/* New Scan CTA */}
          <div className="glass-card-hover flex flex-col items-center justify-center gap-4 text-center fade-in stagger-2">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl" style={{ background: 'hsl(var(--teal-light))' }}>
              <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="hsl(var(--teal))" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" /><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" /></svg>
            </div>
            <div>
              <p className="mb-1 font-medium">New Scan</p>
              <p className="text-xs text-muted-foreground">Upload a photo for analysis</p>
            </div>
            <button onClick={() => navigate('/scan/new')} className="btn-primary text-sm">Start Scan</button>
          </div>

          {/* Quick Links */}
          <div className="glass-card fade-in stagger-3">
            <p className="mb-4 text-sm font-medium">Quick Access</p>
            <div className="space-y-2">
              <button onClick={() => navigate('/history')} className="btn-ghost w-full justify-start text-sm">📊 Scan History</button>
              <button onClick={() => navigate('/settings')} className="btn-ghost w-full justify-start text-sm">⚙️ Settings</button>
            </div>
            <div className="mt-4 rounded-xl p-3" style={{ background: 'hsl(var(--lavender-light))' }}>
              <p className="text-xs font-medium" style={{ color: 'hsl(var(--accent-foreground))' }}>Progress Tracking</p>
              <p className="text-xs text-muted-foreground">Coming soon — track trends over time</p>
            </div>
          </div>
        </div>

        {/* Recent Scans */}
        <div className="mt-8 fade-in stagger-4">
          <h2 className="mb-4 text-xl font-light">Recent Scans</h2>
          {recentScans.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {recentScans.map(scan => (
                <button key={scan.id} onClick={() => navigate(`/scan/${scan.id}`)} className="glass-card-hover text-left">
                  <div className="flex items-center gap-4">
                    <ScoreRing score={scan.overall_score} size={50} strokeWidth={4} />
                    <div>
                      <p className="text-sm font-medium">Score: {scan.overall_score}</p>
                      <p className="text-xs text-muted-foreground">{new Date(scan.created_at).toLocaleDateString()}</p>
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

        {/* Recommendations Placeholder */}
        <div className="mt-8 glass-card fade-in stagger-5">
          <h2 className="mb-2 text-lg font-light">Personalized Insights</h2>
          <p className="text-sm text-muted-foreground">Complete your first scan to receive personalized wellness recommendations.</p>
        </div>
      </div>
    </AppLayout>
  );
}
