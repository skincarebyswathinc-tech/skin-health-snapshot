import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import AppLayout from '@/components/AppLayout';
import PageHeader from '@/components/PageHeader';

interface AnalyticsData {
  totalUsers: number;
  totalScans: number;
  premiumUsers: number;
  avgScore: number;
  recentEvents: { event_type: string; count: number }[];
}

export default function AdminAnalytics() {
  const { user, signOut } = useAuth();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    // Note: In production, admin access should be validated server-side.
    // This is a basic internal dashboard.
    Promise.all([
      supabase.from('profiles').select('id', { count: 'exact', head: true }),
      supabase.from('scans').select('id, overall_score').eq('status', 'complete'),
      supabase.from('subscriptions').select('id', { count: 'exact', head: true }).eq('plan_type', 'premium').eq('status', 'active'),
      supabase.from('usage_events').select('event_type').eq('user_id', user.id).order('created_at', { ascending: false }).limit(200),
    ]).then(([usersRes, scansRes, premRes, eventsRes]) => {
      const scans = scansRes.data || [];
      const avgScore = scans.length > 0
        ? Math.round(scans.reduce((sum, s) => sum + (s.overall_score || 0), 0) / scans.length)
        : 0;

      // Count events by type
      const eventCounts: Record<string, number> = {};
      (eventsRes.data || []).forEach(e => {
        eventCounts[e.event_type] = (eventCounts[e.event_type] || 0) + 1;
      });
      const recentEvents = Object.entries(eventCounts)
        .map(([event_type, count]) => ({ event_type, count }))
        .sort((a, b) => b.count - a.count);

      setData({
        totalUsers: usersRes.count || 0,
        totalScans: scans.length,
        premiumUsers: premRes.count || 0,
        avgScore,
        recentEvents,
      });
      setLoading(false);
    });
  }, [user]);

  return (
    <AppLayout onSignOut={signOut}>
      <div className="page-container max-w-3xl">
        <PageHeader title="Analytics" subtitle="Internal usage overview" />

        {loading ? (
          <div className="flex justify-center py-20"><div className="h-8 w-8 spin-slow rounded-full border-2 border-muted border-t-primary" /></div>
        ) : data && (
          <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8 fade-in stagger-1">
              {[
                { label: 'Total Users', value: data.totalUsers, icon: '👥' },
                { label: 'Total Scans', value: data.totalScans, icon: '📸' },
                { label: 'Premium Users', value: data.premiumUsers, icon: '👑' },
                { label: 'Avg Score', value: data.avgScore, icon: '📊' },
              ].map(m => (
                <div key={m.label} className="glass-card-metric text-center">
                  <span className="text-xl mb-2 block">{m.icon}</span>
                  <p className="text-page-title">{m.value}</p>
                  <p className="text-micro text-muted-foreground">{m.label}</p>
                </div>
              ))}
            </div>

            {data.recentEvents.length > 0 && (
              <div className="glass-card fade-in stagger-2">
                <h2 className="text-section-title mb-4">Your Activity</h2>
                <div className="space-y-2">
                  {data.recentEvents.map(e => (
                    <div key={e.event_type} className="flex items-center justify-between rounded-xl p-3" style={{ background: 'hsl(var(--muted))' }}>
                      <span className="text-body">{e.event_type.replace(/_/g, ' ')}</span>
                      <span className="text-card-title">{e.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </AppLayout>
  );
}
