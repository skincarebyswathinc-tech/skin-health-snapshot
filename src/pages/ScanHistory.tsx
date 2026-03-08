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

  return (
    <AppLayout onSignOut={signOut}>
      <div className="page-container">
        <PageHeader title="Scan History" subtitle="Track your skin wellness over time" />

        {loading ? (
          <div className="flex justify-center py-20"><div className="h-8 w-8 animate-spin rounded-full border-2 border-muted border-t-primary" /></div>
        ) : scans.length === 0 ? (
          <EmptyState
            title="No scans yet"
            description="Your scan history will appear here. Start your first scan to begin tracking your skin wellness."
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
                  <ScoreRing score={scan.overall_score} size={60} strokeWidth={5} />
                  <div className="flex-1">
                    <p className="font-medium">Score: {scan.overall_score}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(scan.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                    <div className="mt-2 flex gap-3 text-xs text-muted-foreground">
                      <span>💧 {scan.hydration_score}</span>
                      <span>✨ {scan.texture_score}</span>
                      <span>🎨 {scan.pigmentation_score}</span>
                      <span>🔥 {scan.inflammation_score}</span>
                      <span>🧬 {scan.elasticity_score}</span>
                    </div>
                  </div>
                  <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="hsl(var(--muted-foreground))" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
