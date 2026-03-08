import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import AppLayout from '@/components/AppLayout';
import PageHeader from '@/components/PageHeader';
import ScoreRing from '@/components/ScoreRing';
import MetricTile from '@/components/MetricTile';

interface ScanData {
  id: string;
  created_at: string;
  image_url: string | null;
  overall_score: number;
  skin_age_estimate: number;
  hydration_score: number;
  texture_score: number;
  pigmentation_score: number;
  inflammation_score: number;
  elasticity_score: number;
  summary_text: string;
  status: string;
}

export default function ScanDetail() {
  const { scanId } = useParams();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [scan, setScan] = useState<ScanData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!scanId || !user) return;
    supabase.from('scans').select('*').eq('id', scanId).eq('user_id', user.id).single()
      .then(({ data }) => {
        if (data && data.status === 'complete') setScan(data as ScanData);
        else if (data && data.status === 'analyzing') navigate(`/scan/analyzing/${scanId}`, { replace: true });
        setLoading(false);
      });
  }, [scanId, user, navigate]);

  if (loading) return <div className="flex min-h-screen items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-2 border-muted border-t-primary" /></div>;
  if (!scan) return <div className="flex min-h-screen items-center justify-center text-muted-foreground">Scan not found</div>;

  const metrics = [
    { label: 'Hydration', score: scan.hydration_score },
    { label: 'Texture', score: scan.texture_score },
    { label: 'Pigmentation', score: scan.pigmentation_score },
    { label: 'Inflammation', score: scan.inflammation_score },
    { label: 'Elasticity', score: scan.elasticity_score },
  ];

  return (
    <AppLayout onSignOut={signOut}>
      <div className="page-container">
        <PageHeader title="Scan Results" subtitle={new Date(scan.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })} />

        {/* Overall Score */}
        <div className="mb-8 grid gap-6 sm:grid-cols-3">
          <div className="glass-card flex flex-col items-center gap-4 py-8 sm:col-span-1 fade-in stagger-1">
            <ScoreRing score={scan.overall_score} size={160} strokeWidth={10} />
            <div className="text-center">
              <p className="text-lg font-medium">Overall Score</p>
              <p className="text-xs text-muted-foreground">Skin wellness snapshot</p>
            </div>
          </div>

          <div className="flex flex-col gap-4 sm:col-span-2 fade-in stagger-2">
            {/* Skin Age */}
            <div className="glass-card flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl" style={{ background: 'hsl(var(--lavender-light))' }}>
                <span className="text-lg">🧬</span>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Estimated Skin Age</p>
                <p className="text-2xl font-light">{scan.skin_age_estimate} <span className="text-sm text-muted-foreground">years</span></p>
              </div>
            </div>

            {/* Image preview */}
            {scan.image_url && (
              <div className="glass-card overflow-hidden">
                <img src={scan.image_url} alt="Scan" className="mx-auto max-h-48 rounded-lg object-contain" />
              </div>
            )}
          </div>
        </div>

        {/* Metrics */}
        <div className="mb-8 fade-in stagger-3">
          <h2 className="mb-4 text-xl font-light">Metric Breakdown</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {metrics.map(m => (
              <MetricTile key={m.label} label={m.label} score={m.score} />
            ))}
          </div>
        </div>

        {/* Summary */}
        <div className="mb-8 glass-card fade-in stagger-4">
          <h2 className="mb-3 text-lg font-light">Summary Insights</h2>
          <p className="text-sm leading-relaxed text-muted-foreground">{scan.summary_text}</p>
        </div>

        {/* Disclaimer */}
        <div className="mb-8 rounded-xl p-4 text-center" style={{ background: 'hsl(var(--lavender-light))' }}>
          <p className="text-xs text-muted-foreground">
            ℹ️ These results are general wellness insights. They are not a medical diagnosis. Please consult a dermatologist for professional advice.
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3 fade-in stagger-5">
          <button onClick={() => navigate('/dashboard')} className="btn-secondary flex-1">Back to Dashboard</button>
          <button onClick={() => navigate('/scan/new')} className="btn-primary flex-1">New Scan</button>
        </div>
      </div>
    </AppLayout>
  );
}
