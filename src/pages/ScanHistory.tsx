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
  image_url: string | null;
  hydration_score: number;
  texture_score: number;
  pigmentation_score: number;
  inflammation_score: number;
  elasticity_score: number;
}

export default function ScanHistory() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [scans, setScans] = useState<Scan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    supabase.from('scans').select('id, created_at, overall_score, image_url, hydration_score, texture_score, pigmentation_score, inflammation_score, elasticity_score')
      .eq('user_id', user.id).eq('status', 'complete')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setScans(data || []);
        setLoading(false);
      });
  }, [user]);

  const metricPill = (label: string, score: number) => (
    <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-micro" style={{ background: 'hsl(var(--muted))' }}>
      {label} <strong>{score}</strong>
    </span>
  );

  return (
    <AppLayout onSignOut={signOut}>
      <div className="page-container">
        <PageHeader title="Scan History" subtitle="Track your skin wellness over time" />

        {loading ? (
          <div className="flex justify-center py-20"><div className="h-8 w-8 spin-slow rounded-full border-2 border-muted border-t-primary" /></div>
        ) : scans.length === 0 ? (
          <EmptyState
            title="No scans yet"
            description="Upload your first skin scan to start tracking your skin health."
            action={{ label: 'Start Your First Scan', href: '/scan/new' }}
          />
        ) : (
          <div className="space-y-4">
            {scans.map((scan, i) => (
              <button
                key={scan.id}
                onClick={() => navigate(`/scan/${scan.id}`)}
                className={`glass-card-hover w-full text-left fade-in stagger-${Math.min(i + 1, 5)}`}
              >
                <div className="flex items-center gap-5">
                  <ScoreRing score={scan.overall_score} size={56} strokeWidth={4} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <p className="text-card-title">Score: {scan.overall_score}</p>
                      <p className="text-micro text-muted-foreground">
                        {new Date(scan.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {metricPill('💧', scan.hydration_score)}
                      {metricPill('✨', scan.texture_score)}
                      {metricPill('🎨', scan.pigmentation_score)}
                      {metricPill('🔥', scan.inflammation_score)}
                      {metricPill('🧬', scan.elasticity_score)}
                    </div>
                  </div>
                  <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="hsl(var(--muted-foreground))" strokeWidth="1.5" className="shrink-0"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
