import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { useSubscription, trackEvent } from '@/hooks/useSubscription';
import AppLayout from '@/components/AppLayout';
import PageHeader from '@/components/PageHeader';
import ScoreRing from '@/components/ScoreRing';
import MetricTile from '@/components/MetricTile';
import RadarChart from '@/components/RadarChart';
import ShareCard from '@/components/ShareCard';
import SkinReport from '@/components/SkinReport';
import PremiumGate from '@/components/PremiumGate';
import SkinHeatmap from '@/components/SkinHeatmap';
import NutritionPanel from '@/components/NutritionPanel';

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

function getSummaryLabel(score: number): string {
  if (score >= 85) return 'Excellent skin health';
  if (score >= 70) return 'Healthy with mild signals';
  if (score >= 55) return 'Moderate — room for improvement';
  return 'Needs focused attention';
}

export default function ScanDetail() {
  const { scanId } = useParams();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { isPremium } = useSubscription();
  const [scan, setScan] = useState<ScanData | null>(null);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState('');

  useEffect(() => {
    if (!scanId || !user) return;
    Promise.all([
      supabase.from('scans').select('*').eq('id', scanId).eq('user_id', user.id).single(),
      supabase.from('profiles').select('first_name').eq('user_id', user.id).single(),
    ]).then(([{ data }, { data: profile }]) => {
      if (data && data.status === 'complete') setScan(data as ScanData);
      else if (data && data.status === 'analyzing') navigate(`/scan/analyzing/${scanId}`, { replace: true });
      setUserName(profile?.first_name || 'User');
      setLoading(false);
    });
  }, [scanId, user, navigate]);

  if (loading) return <div className="flex min-h-screen items-center justify-center"><div className="h-8 w-8 spin-slow rounded-full border-2 border-muted border-t-primary" /></div>;
  if (!scan) return <div className="flex min-h-screen items-center justify-center text-muted-foreground">Scan not found</div>;

  const metrics = [
    { label: 'Hydration', score: scan.hydration_score },
    { label: 'Texture', score: scan.texture_score },
    { label: 'Pigmentation', score: scan.pigmentation_score },
    { label: 'Inflammation', score: scan.inflammation_score },
    { label: 'Elasticity', score: scan.elasticity_score },
  ];

  const dateStr = new Date(scan.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <AppLayout onSignOut={signOut}>
      <div className="page-container">
        <PageHeader title="Scan Results" subtitle={dateStr} />

        {/* Premium badge */}
        {isPremium && (
          <div className="mb-4 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-micro font-medium" style={{ background: 'hsl(var(--teal-light))', color: 'hsl(var(--teal))' }}>
            👑 Premium Member
          </div>
        )}

        {/* Top Section: Score + Skin Age + Image */}
        <div className="mb-8 grid gap-6 lg:grid-cols-3">
          <div className="glass-panel flex flex-col items-center gap-4 py-8 fade-in stagger-1">
            <ScoreRing score={scan.overall_score} size={180} strokeWidth={12} />
            <div className="text-center">
              <p className="text-card-title">Skin Health Score</p>
              <p className="text-micro text-muted-foreground mt-1">{getSummaryLabel(scan.overall_score)}</p>
            </div>
          </div>

          <div className="flex flex-col gap-6 lg:col-span-2 fade-in stagger-2">
            <div className="glass-card flex items-center gap-5">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl" style={{ background: 'hsl(var(--lavender-light))' }}>
                <span className="text-xl">🧬</span>
              </div>
              <div>
                <p className="text-micro text-muted-foreground">Estimated Skin Age</p>
                <p className="text-[28px] font-semibold leading-none">{scan.skin_age_estimate} <span className="text-sm font-normal text-muted-foreground">years</span></p>
              </div>
            </div>

            {scan.image_url && (
              <div className="glass-card overflow-hidden">
                <div className="mb-3 flex items-center gap-2">
                  <span className="text-micro font-medium text-muted-foreground uppercase tracking-wider">Scan Preview</span>
                  <span className="text-micro text-muted-foreground">· {new Date(scan.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                </div>
                <img src={scan.image_url} alt="Skin scan" className="mx-auto max-h-48 rounded-xl object-contain" />
              </div>
            )}
          </div>
        </div>

        {/* Skin Heatmap */}
        {scan.image_url && (
          <div className="mb-8 fade-in stagger-3">
            <SkinHeatmap
              imageUrl={scan.image_url}
              inflammationScore={scan.inflammation_score}
              pigmentationScore={scan.pigmentation_score}
              hydrationScore={scan.hydration_score}
            />
          </div>
        )}


        <div className="mb-8 glass-panel fade-in stagger-3">
          <h2 className="text-section-title mb-4">Metric Overview</h2>
          <div className="flex justify-center">
            <RadarChart metrics={metrics} size={280} />
          </div>
        </div>

        {/* Metric Cards */}
        <div className="mb-8 fade-in stagger-4">
          <h2 className="text-section-title mb-5">Metric Breakdown</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {metrics.map(m => (
              <MetricTile key={m.label} label={m.label} score={m.score} />
            ))}
          </div>
        </div>

        {/* Nutrition Recommendations */}
        <div className="mb-8 fade-in stagger-5">
          <NutritionPanel
            metrics={{
              hydrationScore: scan.hydration_score,
              pigmentationScore: scan.pigmentation_score,
              inflammationScore: scan.inflammation_score,
              elasticityScore: scan.elasticity_score,
            }}
          />
        </div>

        {/* Summary */}
        <div className="mb-8 glass-panel fade-in stagger-5">
          <h2 className="text-section-title mb-3">Summary Insights</h2>
          <p className="text-body text-muted-foreground leading-relaxed">{scan.summary_text}</p>
        </div>

        {/* Report Download — premium gated */}
        <div className="mb-8 fade-in stagger-5">
          <PremiumGate isPremium={isPremium} message="Upgrade to Premium to download skin reports">
            <div className="glass-card flex items-center justify-between">
              <div>
                <p className="text-card-title">Skin Report</p>
                <p className="text-micro text-muted-foreground">Download a detailed PDF of your results</p>
              </div>
              <SkinReport scan={scan} userName={userName} />
            </div>
          </PremiumGate>
        </div>

        {/* Share Card */}
        <div className="mb-8 fade-in stagger-6">
          <ShareCard score={scan.overall_score} skinAge={scan.skin_age_estimate} date={dateStr} />
        </div>

        {/* Disclaimer */}
        <div className="mb-8 rounded-2xl p-5 text-center" style={{ background: 'hsl(var(--lavender-light))' }}>
          <p className="text-micro text-muted-foreground">
            ℹ️ These results are general wellness insights. They are not a medical diagnosis. Please consult a dermatologist for professional advice.
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-4 fade-in stagger-6">
          <button onClick={() => navigate('/dashboard')} className="btn-secondary flex-1">Back to Dashboard</button>
          <button onClick={() => navigate('/scan/new')} className="btn-primary flex-1">New Scan</button>
        </div>
      </div>
    </AppLayout>
  );
}
