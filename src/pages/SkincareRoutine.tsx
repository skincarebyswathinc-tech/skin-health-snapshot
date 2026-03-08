import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { generateFullRoutine, type RoutineSection, type RoutineStep } from '@/lib/skinRoutineEngine';
import AppLayout from '@/components/AppLayout';
import PageHeader from '@/components/PageHeader';

interface CompletedSteps {
  [sectionKey: string]: Set<string>;
}

export default function SkincareRoutine() {
  const { user, signOut } = useAuth();
  const [sections, setSections] = useState<RoutineSection[]>([]);
  const [completed, setCompleted] = useState<CompletedSteps>({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('morning');
  const [hasData, setHasData] = useState(true);

  useEffect(() => {
    if (!user) return;

    async function load() {
      // Fetch latest scan
      const { data: scan } = await supabase
        .from('scans')
        .select('hydration_score, texture_score, pigmentation_score, inflammation_score, elasticity_score')
        .eq('user_id', user!.id)
        .eq('status', 'complete')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      // Fetch profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('skin_type, skin_concerns, age_range')
        .eq('user_id', user!.id)
        .single();

      if (!scan) {
        setHasData(false);
        setLoading(false);
        return;
      }

      const routine = generateFullRoutine(
        {
          hydrationScore: scan.hydration_score ?? 70,
          textureScore: scan.texture_score ?? 70,
          pigmentationScore: scan.pigmentation_score ?? 70,
          inflammationScore: scan.inflammation_score ?? 70,
          elasticityScore: scan.elasticity_score ?? 70,
        },
        {
          skinType: profile?.skin_type,
          skinConcerns: profile?.skin_concerns,
          ageRange: profile?.age_range,
        },
      );

      setSections(routine);

      // Load saved completion state from localStorage
      const saved = localStorage.getItem(`routine-completed-${user!.id}-${new Date().toISOString().split('T')[0]}`);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          const restored: CompletedSteps = {};
          for (const [key, arr] of Object.entries(parsed)) {
            restored[key] = new Set(arr as string[]);
          }
          setCompleted(restored);
        } catch { /* ignore */ }
      }

      setLoading(false);
    }

    load();
  }, [user]);

  const toggleStep = (sectionKey: string, stepId: string) => {
    setCompleted(prev => {
      const next = { ...prev };
      const set = new Set(prev[sectionKey] || []);
      if (set.has(stepId)) set.delete(stepId);
      else set.add(stepId);
      next[sectionKey] = set;

      // Persist to localStorage
      const serializable: Record<string, string[]> = {};
      for (const [key, s] of Object.entries(next)) {
        serializable[key] = Array.from(s);
      }
      localStorage.setItem(
        `routine-completed-${user!.id}-${new Date().toISOString().split('T')[0]}`,
        JSON.stringify(serializable),
      );

      return next;
    });
  };

  const activeSection = sections.find(s => s.key === activeTab);
  const completedCount = activeSection
    ? (completed[activeTab]?.size || 0)
    : 0;
  const totalCount = activeSection?.steps.length || 0;
  const progressPct = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  if (loading) {
    return (
      <AppLayout onSignOut={signOut}>
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="h-8 w-8 spin-slow rounded-full border-2 border-muted border-t-primary" />
        </div>
      </AppLayout>
    );
  }

  if (!hasData) {
    return (
      <AppLayout onSignOut={signOut}>
        <div className="page-container max-w-3xl">
          <PageHeader title="Skincare Routine" subtitle="Your personalized daily skincare plan" />
          <div className="glass-panel text-center py-16">
            <span className="text-4xl mb-4 block">🧴</span>
            <p className="text-card-title mb-2">Complete a scan first</p>
            <p className="text-micro text-muted-foreground mb-5">We need your skin analysis results to generate a personalized routine.</p>
            <a href="/scan/new" className="btn-primary inline-block">Take Your First Scan</a>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout onSignOut={signOut}>
      <div className="page-container max-w-3xl">
        <PageHeader title="Skincare Routine" subtitle="Your personalized daily skincare plan" />

        {/* Tab bar */}
        <div className="mb-6 flex gap-2 rounded-2xl p-1.5 fade-in" style={{ background: 'hsl(var(--muted))' }}>
          {sections.map(section => {
            const isActive = activeTab === section.key;
            const sectionCompleted = completed[section.key]?.size || 0;
            const sectionTotal = section.steps.length;
            const allDone = sectionCompleted === sectionTotal && sectionTotal > 0;

            return (
              <button
                key={section.key}
                onClick={() => setActiveTab(section.key)}
                className="flex-1 rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-200"
                style={{
                  background: isActive ? 'hsl(var(--card))' : 'transparent',
                  color: isActive ? 'hsl(var(--foreground))' : 'hsl(var(--muted-foreground))',
                  boxShadow: isActive ? '0 2px 8px hsl(var(--foreground) / 0.06)' : 'none',
                }}
              >
                <span className="mr-1.5">{section.icon}</span>
                {section.title.replace(' Routine', '').replace(' Treatments', '')}
                {allDone && <span className="ml-1.5">✓</span>}
              </button>
            );
          })}
        </div>

        {/* Progress bar */}
        {activeSection && (
          <div className="mb-6 glass-card fade-in">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-card-title">{activeSection.title}</p>
                <p className="text-micro text-muted-foreground">{activeSection.subtitle}</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-semibold" style={{ color: 'hsl(var(--teal))' }}>
                  {completedCount}/{totalCount}
                </p>
                <p className="text-micro text-muted-foreground">completed</p>
              </div>
            </div>
            <div className="h-2 rounded-full overflow-hidden" style={{ background: 'hsl(var(--border))' }}>
              <div
                className="h-full rounded-full transition-all duration-500 ease-out"
                style={{
                  width: `${progressPct}%`,
                  background: progressPct === 100
                    ? 'hsl(150, 50%, 50%)'
                    : 'hsl(var(--teal))',
                }}
              />
            </div>
          </div>
        )}

        {/* Steps */}
        <div className="space-y-3 fade-in stagger-1">
          {activeSection?.steps.map((step) => {
            const isDone = completed[activeTab]?.has(step.id) || false;

            return (
              <button
                key={step.id}
                onClick={() => toggleStep(activeTab, step.id)}
                className="w-full text-left rounded-2xl p-4 transition-all duration-200"
                style={{
                  background: isDone ? 'hsl(var(--teal-light))' : 'hsl(var(--card))',
                  border: `1px solid ${isDone ? 'hsl(var(--teal) / 0.3)' : 'hsl(var(--border))'}`,
                  opacity: isDone ? 0.85 : 1,
                }}
              >
                <div className="flex items-start gap-4">
                  {/* Checkbox */}
                  <div
                    className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full transition-all duration-200"
                    style={{
                      background: isDone ? 'hsl(var(--teal))' : 'transparent',
                      border: isDone ? 'none' : '2px solid hsl(var(--border))',
                    }}
                  >
                    {isDone && (
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <path d="M3 7L6 10L11 4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </div>

                  {/* Icon */}
                  <span className="text-2xl shrink-0">{step.icon}</span>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p
                        className="text-card-title"
                        style={{ textDecoration: isDone ? 'line-through' : 'none' }}
                      >
                        {step.name}
                      </p>
                      <PriorityBadge priority={step.priority} />
                    </div>
                    <p className="text-micro text-muted-foreground mb-1">{step.product}</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">{step.description}</p>
                    {step.duration && (
                      <p className="mt-1.5 text-xs font-medium" style={{ color: 'hsl(var(--teal))' }}>
                        ⏱ {step.duration}
                      </p>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* All done message */}
        {progressPct === 100 && totalCount > 0 && (
          <div className="mt-6 glass-card text-center fade-in" style={{ background: 'hsl(var(--teal-light))' }}>
            <span className="text-3xl mb-2 block">🎉</span>
            <p className="text-card-title" style={{ color: 'hsl(var(--teal))' }}>
              {activeTab === 'morning' ? 'Morning' : activeTab === 'evening' ? 'Evening' : 'Weekly'} routine complete!
            </p>
            <p className="text-micro text-muted-foreground mt-1">Great job taking care of your skin today.</p>
          </div>
        )}

        {/* Disclaimer */}
        <div className="mt-8 rounded-2xl p-5 text-center" style={{ background: 'hsl(var(--lavender-light))' }}>
          <p className="text-micro text-muted-foreground">
            ℹ️ These are general skincare suggestions based on your scan results — not medical advice. Introduce new products gradually and patch-test first. Consult a dermatologist for personalized treatment plans.
          </p>
        </div>
      </div>
    </AppLayout>
  );
}

function PriorityBadge({ priority }: { priority: RoutineStep['priority'] }) {
  if (priority === 'essential') {
    return (
      <span
        className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider"
        style={{ background: 'hsl(var(--teal-light))', color: 'hsl(var(--teal))' }}
      >
        Essential
      </span>
    );
  }
  if (priority === 'optional') {
    return (
      <span
        className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider"
        style={{ background: 'hsl(var(--muted))', color: 'hsl(var(--muted-foreground))' }}
      >
        Optional
      </span>
    );
  }
  return null;
}
