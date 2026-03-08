import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { processScan } from '@/lib/analysisEngine';

const STAGES = [
  { label: 'Preparing image...', icon: '🖼️' },
  { label: 'Aligning facial region...', icon: '📐' },
  { label: 'Reading skin signals...', icon: '🔬' },
  { label: 'Generating skin metrics...', icon: '📊' },
  { label: 'Preparing your dashboard...', icon: '✨' },
];

export default function AnalysisLoading() {
  const { scanId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stageIndex, setStageIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!scanId || !user) return;
    let cancelled = false;

    const run = async () => {
      try {
        // Fetch image URL
        const { data: scan } = await supabase
          .from('scans')
          .select('image_url')
          .eq('id', scanId)
          .single();

        if (!scan?.image_url || cancelled) return;

        // Fetch user profile for age
        const { data: profile } = await supabase
          .from('profiles')
          .select('age_range')
          .eq('user_id', user.id)
          .single();

        const userAge = parseAgeRange(profile?.age_range);

        // Run canvas-based analysis with stage callbacks
        const result = await processScan(
          scan.image_url,
          userAge,
          (stage) => {
            if (!cancelled) setStageIndex(stage);
          },
        );

        if (cancelled) return;

        // Persist results
        await supabase.from('scans').update({
          overall_score: result.overallScore,
          skin_age_estimate: result.skinAgeEstimate,
          hydration_score: result.hydrationScore,
          texture_score: result.textureScore,
          pigmentation_score: result.pigmentationScore,
          inflammation_score: result.inflammationScore,
          elasticity_score: result.elasticityScore,
          summary_text: result.summaryText,
          status: 'complete',
        }).eq('id', scanId);

        navigate(`/scan/${scanId}`, { replace: true });
      } catch (err) {
        console.error('Analysis error:', err);
        if (!cancelled) setError('Analysis could not be completed. Redirecting...');
        setTimeout(() => { if (!cancelled) navigate('/dashboard'); }, 2000);
      }
    };

    run();
    return () => { cancelled = true; };
  }, [scanId, user, navigate]);

  const progress = ((stageIndex + 1) / STAGES.length) * 100;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm text-center">
        <div className="mb-10">
          <span className="text-lg font-medium tracking-tight">
            <span className="gradient-text font-semibold">Skin</span>Pulse
          </span>
        </div>

        {/* Animated ring */}
        <div className="relative mx-auto mb-10 h-36 w-36">
          <svg width="144" height="144" className="-rotate-90">
            <circle cx="72" cy="72" r="62" fill="none" stroke="hsl(var(--border))" strokeWidth="6" />
            <circle
              cx="72" cy="72" r="62" fill="none"
              stroke="hsl(var(--teal))" strokeWidth="6"
              strokeDasharray={2 * Math.PI * 62}
              strokeDashoffset={2 * Math.PI * 62 * (1 - progress / 100)}
              strokeLinecap="round"
              style={{ transition: 'stroke-dashoffset 0.8s cubic-bezier(0.22, 1, 0.36, 1)' }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl mb-1">{STAGES[stageIndex].icon}</span>
            <span className="text-micro text-muted-foreground">{Math.round(progress)}%</span>
          </div>
        </div>

        <p className="text-card-title mb-2 fade-in" key={stageIndex}>{STAGES[stageIndex].label}</p>
        <p className="text-micro text-muted-foreground">
          {error || 'Analyzing your skin wellness snapshot'}
        </p>

        {/* Step indicators */}
        <div className="mx-auto mt-10 flex max-w-xs gap-2">
          {STAGES.map((_, i) => (
            <div
              key={i}
              className="h-1.5 flex-1 rounded-full transition-all duration-500"
              style={{
                background: i <= stageIndex ? 'hsl(var(--teal))' : 'hsl(var(--border))',
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function parseAgeRange(ageRange?: string | null): number {
  if (!ageRange) return 30;
  const match = ageRange.match(/(\d+)/);
  if (!match) return 30;
  const low = parseInt(match[1], 10);
  // Return midpoint of range
  if (ageRange.includes('+')) return low + 5;
  const match2 = ageRange.match(/(\d+)\s*-\s*(\d+)/);
  if (match2) return Math.round((parseInt(match2[1]) + parseInt(match2[2])) / 2);
  return low;
}
