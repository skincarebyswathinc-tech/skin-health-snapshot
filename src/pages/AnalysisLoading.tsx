import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { analyzeSkin } from '@/lib/analysisEngine';

const STAGES = [
  { label: 'Preparing image...', icon: '🖼️', duration: 1200 },
  { label: 'Aligning facial region...', icon: '📐', duration: 1500 },
  { label: 'Reading skin signals...', icon: '🔬', duration: 2000 },
  { label: 'Generating skin metrics...', icon: '📊', duration: 1500 },
  { label: 'Preparing your dashboard...', icon: '✨', duration: 1000 },
];

export default function AnalysisLoading() {
  const { scanId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stageIndex, setStageIndex] = useState(0);

  useEffect(() => {
    if (!scanId || !user) return;
    let timeout: ReturnType<typeof setTimeout>;
    let currentStage = 0;

    const advanceStage = () => {
      currentStage++;
      if (currentStage < STAGES.length) {
        setStageIndex(currentStage);
        timeout = setTimeout(advanceStage, STAGES[currentStage].duration);
      } else {
        runAnalysis();
      }
    };

    const runAnalysis = async () => {
      try {
        const { data: scan } = await supabase.from('scans').select('image_url').eq('id', scanId).single();
        if (!scan) return;
        const result = analyzeSkin(scan.image_url || scanId, user.id);
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
        console.error(err);
        navigate('/dashboard');
      }
    };

    timeout = setTimeout(advanceStage, STAGES[0].duration);
    return () => clearTimeout(timeout);
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
        <p className="text-micro text-muted-foreground">Analyzing your skin wellness snapshot</p>

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
