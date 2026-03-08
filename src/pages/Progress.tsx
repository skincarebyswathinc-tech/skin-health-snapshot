import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { useSubscription } from '@/hooks/useSubscription';
import AppLayout from '@/components/AppLayout';
import ProgressLineChart from '@/components/ProgressLineChart';
import MetricSparkline from '@/components/MetricSparkline';
import HabitInsightCard from '@/components/HabitInsightCard';
import WeeklySummaryCard from '@/components/WeeklySummaryCard';
import BadgeCard from '@/components/BadgeCard';
import EmptyState from '@/components/EmptyState';
import PremiumGate from '@/components/PremiumGate';
import {
  generateProgressSummary,
  type LifestyleLog,
  type SkinProgressEntry,
  type ProgressSummary,
} from '@/lib/progressEngine';

export default function Progress() {
  const { user, signOut } = useAuth();
  const { isPremium } = useSubscription();
  const [progress, setProgress] = useState<SkinProgressEntry[]>([]);
  const [logs, setLogs] = useState<LifestyleLog[]>([]);
  const [summary, setSummary] = useState<ProgressSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    Promise.all([
      supabase
        .from('scans')
        .select('created_at, overall_score, hydration_score, texture_score, pigmentation_score, inflammation_score, elasticity_score')
        .eq('user_id', user.id)
        .eq('status', 'complete')
        .order('created_at', { ascending: true })
        .limit(50),
      supabase
        .from('lifestyle_logs')
        .select('id, date, sleep_hours, water_intake_liters, stress_level, diet_quality, exercise_minutes, sugar_intake_level, dairy_intake_level, notes')
        .eq('user_id', user.id)
        .order('date', { ascending: true })
        .limit(100),
    ]).then(([scansRes, logsRes]) => {
      const scans: SkinProgressEntry[] = (scansRes.data || []).map(s => ({
        date: s.created_at.split('T')[0],
        skin_score: s.overall_score,
        hydration_score: s.hydration_score,
        texture_score: s.texture_score,
        pigmentation_score: s.pigmentation_score,
        inflammation_score: s.inflammation_score,
        elasticity_score: s.elasticity_score,
      }));
      const lifeLogs: LifestyleLog[] = (logsRes.data || []).map(l => ({
        id: l.id,
        date: l.date,
        sleep_hours: l.sleep_hours,
        water_intake_liters: l.water_intake_liters,
        stress_level: l.stress_level,
        diet_quality: l.diet_quality,
        exercise_minutes: l.exercise_minutes,
        sugar_intake_level: l.sugar_intake_level,
        dairy_intake_level: l.dairy_intake_level,
        notes: l.notes,
      }));

      setProgress(scans);
      setLogs(lifeLogs);
      setSummary(generateProgressSummary(scans, lifeLogs));
      setLoading(false);
    });
  }, [user]);

  if (loading) {
    return (
      <AppLayout onSignOut={signOut}>
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="h-8 w-8 spin-slow rounded-full border-2 border-muted border-t-primary" />
        </div>
      </AppLayout>
    );
  }

  if (progress.length === 0) {
    return (
      <AppLayout onSignOut={signOut}>
        <div className="page-container">
          <div className="section-header fade-in">
            <h1 className="text-page-title">Skin Progress</h1>
            <p>Track your skin improvement over time.</p>
          </div>
          <EmptyState
            title="No progress data yet"
            description="Complete your first scan and start logging daily habits to see your skin progress."
            action={{ label: 'Start Your First Scan', href: '/scan/new' }}
          />
        </div>
      </AppLayout>
    );
  }

  const timelineData = progress
    .filter(p => p.skin_score != null)
    .map(p => ({
      label: new Date(p.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      value: p.skin_score!,
    }));

  const metricKeys = [
    { key: 'hydration_score' as const, label: 'Hydration', color: 'hsl(var(--teal))' },
    { key: 'texture_score' as const, label: 'Texture', color: 'hsl(var(--lavender))' },
    { key: 'pigmentation_score' as const, label: 'Pigmentation', color: 'hsl(var(--rose))' },
    { key: 'inflammation_score' as const, label: 'Inflammation', color: 'hsl(var(--destructive))' },
    { key: 'elasticity_score' as const, label: 'Elasticity', color: 'hsl(var(--accent))' },
  ];

  return (
    <AppLayout onSignOut={signOut}>
      <div className="page-container">
        <div className="section-header fade-in">
          <h1 className="text-page-title">Skin Progress</h1>
          <p>Track your skin improvement over time.</p>
        </div>

        {/* Summary stats */}
        {summary && (
          <div className="grid gap-4 sm:grid-cols-3 mb-8 fade-in stagger-1">
            <div className="glass-card-metric text-center">
              <p className="text-micro text-muted-foreground">Score Change</p>
              <p className="text-page-title" style={{ color: summary.scoreChange != null && summary.scoreChange >= 0 ? 'hsl(var(--teal))' : 'hsl(var(--destructive))' }}>
                {summary.scoreChange != null ? (summary.scoreChange >= 0 ? `+${summary.scoreChange}` : summary.scoreChange) : '—'}
              </p>
            </div>
            <div className="glass-card-metric text-center">
              <p className="text-micro text-muted-foreground">Total Scans</p>
              <p className="text-page-title">{summary.scanCount}</p>
            </div>
            <div className="glass-card-metric text-center">
              <p className="text-micro text-muted-foreground">Journal Streak</p>
              <p className="text-page-title">{summary.streakDays} days</p>
            </div>
          </div>
        )}

        {/* Next scan recommendation */}
        {summary && (
          <div className="glass-card mb-8 flex items-center gap-3 fade-in stagger-2">
            <span className="text-lg">📅</span>
            <p className="text-body text-muted-foreground">{summary.nextScanMessage}</p>
          </div>
        )}

        {/* Score Timeline */}
        {timelineData.length > 0 && (
          <div className="glass-panel mb-8 fade-in stagger-2">
            <h2 className="text-section-title mb-4">Overall Score Trend</h2>
            <ProgressLineChart data={timelineData} height={220} />
          </div>
        )}

        {/* Metric Sparklines — full analytics premium gated */}
        <PremiumGate isPremium={isPremium} message="Upgrade to Premium to unlock full progress analytics">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-8 fade-in stagger-3">
            {metricKeys.map(({ key, label, color }) => {
              const values = progress.map(p => p[key]).filter((v): v is number => v != null);
              const current = values.length > 0 ? values[values.length - 1] : 0;
              return (
                <MetricSparkline key={key} values={values} label={label} currentValue={current} color={color} />
              );
            })}
          </div>
        </PremiumGate>

        {/* Badges */}
        {summary && summary.badges.some(b => b.earned) && (
          <div className="mb-8 fade-in stagger-4">
            <BadgeCard badges={summary.badges} />
          </div>
        )}

        {/* Weekly Insights */}
        {summary && summary.weeklyInsights.length > 0 && (
          <div className="mb-8 fade-in stagger-4">
            <WeeklySummaryCard insights={summary.weeklyInsights} />
          </div>
        )}

        {/* Habit Correlations — premium gated */}
        {summary && summary.correlations.length > 0 && (
          <PremiumGate isPremium={isPremium} message="Upgrade to Premium to see habit correlations">
            <div className="fade-in stagger-5">
              <h2 className="text-section-title mb-4">Habit Correlations</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {summary.correlations.map((c, i) => (
                  <HabitInsightCard key={i} insight={c} />
                ))}
              </div>
              <p className="text-micro text-muted-foreground mt-4">
                Insights are observational correlations and not medical conclusions.
              </p>
            </div>
          </PremiumGate>
        )}

        {/* Improvements */}
        {summary && summary.improvements.length > 0 && (
          <div className="glass-panel mt-8 fade-in stagger-5">
            <h3 className="text-section-title mb-3">Improvements</h3>
            <ul className="space-y-2">
              {summary.improvements.map((imp, i) => (
                <li key={i} className="flex items-center gap-2 text-body text-muted-foreground">
                  <span style={{ color: 'hsl(var(--teal))' }}>✓</span> {imp}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
