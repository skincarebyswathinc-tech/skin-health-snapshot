import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { analyzeSkin } from '@/lib/analysisEngine';

const STAGES = [
  { label: 'Preparing image...', duration: 1200 },
  { label: 'Aligning facial region...', duration: 1500 },
  { label: 'Reading visible skin markers...', duration: 2000 },
  { label: 'Evaluating hydration & texture...', duration: 1500 },
  { label: 'Generating your dashboard...', duration: 1000 },
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
        <div className="mb-8">
          <span className="text-lg font-light tracking-tight">
            <span className="gradient-text font-medium">Skin</span>Pulse
          </span>
        </div>

        {/* Animated ring */}
        <div className="relative mx-auto mb-8 h-32 w-32">
          <svg width="128" height="128" className="-rotate-90">
            <circle cx="64" cy="64" r="56" fill="none" stroke="hsl(var(--border))" strokeWidth="6" />
            <circle
              cx="64" cy="64" r="56" fill="none"
              stroke="hsl(var(--teal))" strokeWidth="6"
              strokeDasharray={2 * Math.PI * 56}
              strokeDashoffset={2 * Math.PI * 56 * (1 - progress / 100)}
              strokeLinecap="round"
              className="transition-all duration-700 ease-out"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-lg font-light text-muted-foreground">{Math.round(progress)}%</span>
          </div>
        </div>

        <p className="mb-2 font-medium fade-in" key={stageIndex}>{STAGES[stageIndex].label}</p>
        <p className="text-sm text-muted-foreground">Analyzing your skin wellness snapshot</p>

        <div className="mx-auto mt-8 h-1.5 max-w-xs overflow-hidden rounded-full" style={{ background: 'hsl(var(--border))' }}>
          <div className="h-full rounded-full transition-all duration-700 ease-out" style={{ width: `${progress}%`, background: 'hsl(var(--teal))' }} />
        </div>
      </div>
    </div>
  );
}
