/**
 * Progress Tracking & Lifestyle Correlation Engine
 * Analyzes relationships between lifestyle habits and skin metrics.
 */

export interface LifestyleLog {
  id: string;
  date: string;
  sleep_hours: number | null;
  water_intake_liters: number | null;
  stress_level: number | null;
  diet_quality: number | null;
  exercise_minutes: number | null;
  sugar_intake_level: string | null;
  dairy_intake_level: string | null;
  notes: string | null;
}

export interface SkinProgressEntry {
  date: string;
  skin_score: number | null;
  hydration_score: number | null;
  texture_score: number | null;
  pigmentation_score: number | null;
  inflammation_score: number | null;
  elasticity_score: number | null;
}

export interface CorrelationInsight {
  habit: string;
  metric: string;
  direction: 'positive' | 'negative';
  averageDifference: number;
  message: string;
}

export interface WeeklyInsight {
  type: 'improvement' | 'decline' | 'correlation' | 'tip';
  message: string;
}

export interface ProgressSummary {
  scoreChange: number | null;
  scanCount: number;
  streakDays: number;
  nextScanMessage: string;
  improvements: string[];
  badges: Badge[];
  weeklyInsights: WeeklyInsight[];
  correlations: CorrelationInsight[];
}

export interface Badge {
  id: string;
  label: string;
  icon: string;
  earned: boolean;
}

// ─── Correlation Engine ───

function levelToNumber(level: string | null): number {
  if (!level) return 2;
  const l = level.toLowerCase();
  if (l === 'low') return 1;
  if (l === 'high') return 3;
  return 2;
}

export function computeCorrelations(
  logs: LifestyleLog[],
  progress: SkinProgressEntry[],
): CorrelationInsight[] {
  if (logs.length < 3 || progress.length < 2) return [];

  const insights: CorrelationInsight[] = [];
  const progressByDate = new Map(progress.map(p => [p.date, p]));

  // Helper: split logs by threshold and compare average metric
  function analyzeHabit(
    habitName: string,
    getValue: (l: LifestyleLog) => number | null,
    threshold: number,
    metricName: string,
    getMetric: (p: SkinProgressEntry) => number | null,
  ) {
    const high: number[] = [];
    const low: number[] = [];

    for (const log of logs) {
      const val = getValue(log);
      if (val === null) continue;
      // Find closest scan within 3 days
      const scan = findClosestScan(log.date, progress, 3);
      if (!scan) continue;
      const metric = getMetric(scan);
      if (metric === null) continue;

      if (val >= threshold) high.push(metric);
      else low.push(metric);
    }

    if (high.length >= 2 && low.length >= 2) {
      const avgHigh = high.reduce((a, b) => a + b, 0) / high.length;
      const avgLow = low.reduce((a, b) => a + b, 0) / low.length;
      const diff = Math.round(avgHigh - avgLow);

      if (Math.abs(diff) >= 4) {
        const direction = diff > 0 ? 'positive' as const : 'negative' as const;
        const betterWorse = diff > 0 ? 'higher' : 'lower';
        insights.push({
          habit: habitName,
          metric: metricName,
          direction,
          averageDifference: diff,
          message: `Your ${metricName.toLowerCase()} score is on average ${Math.abs(diff)} points ${betterWorse} on days with ${diff > 0 ? 'higher' : 'lower'} ${habitName.toLowerCase()}.`,
        });
      }
    }
  }

  const metrics: [string, (p: SkinProgressEntry) => number | null][] = [
    ['Hydration', p => p.hydration_score],
    ['Texture', p => p.texture_score],
    ['Inflammation', p => p.inflammation_score],
    ['Pigmentation', p => p.pigmentation_score],
    ['Elasticity', p => p.elasticity_score],
  ];

  for (const [metricName, getMetric] of metrics) {
    analyzeHabit('Water intake', l => l.water_intake_liters, 2, metricName, getMetric);
    analyzeHabit('Sleep', l => l.sleep_hours, 7, metricName, getMetric);
    analyzeHabit('Diet quality', l => l.diet_quality, 4, metricName, getMetric);
    analyzeHabit('Exercise', l => l.exercise_minutes, 30, metricName, getMetric);
    // Inverse: high stress / sugar = worse
    analyzeHabit('Low stress', l => l.stress_level ? 6 - l.stress_level : null, 4, metricName, getMetric);
    analyzeHabit('Low sugar', l => 4 - levelToNumber(l.sugar_intake_level), 2, metricName, getMetric);
  }

  // Deduplicate: keep strongest per metric
  const best = new Map<string, CorrelationInsight>();
  for (const ins of insights) {
    const key = ins.metric;
    if (!best.has(key) || Math.abs(ins.averageDifference) > Math.abs(best.get(key)!.averageDifference)) {
      best.set(key, ins);
    }
  }

  return Array.from(best.values()).slice(0, 5);
}

function findClosestScan(dateStr: string, progress: SkinProgressEntry[], withinDays: number): SkinProgressEntry | null {
  const target = new Date(dateStr).getTime();
  let closest: SkinProgressEntry | null = null;
  let closestDist = Infinity;

  for (const p of progress) {
    const dist = Math.abs(new Date(p.date).getTime() - target);
    const days = dist / (1000 * 60 * 60 * 24);
    if (days <= withinDays && dist < closestDist) {
      closestDist = dist;
      closest = p;
    }
  }
  return closest;
}

// ─── Weekly Insights ───

export function generateWeeklyInsights(
  progress: SkinProgressEntry[],
  correlations: CorrelationInsight[],
): WeeklyInsight[] {
  const insights: WeeklyInsight[] = [];

  if (progress.length >= 2) {
    const recent = progress[progress.length - 1];
    const prev = progress[progress.length - 2];
    if (recent.skin_score != null && prev.skin_score != null) {
      const diff = recent.skin_score - prev.skin_score;
      if (diff > 0) {
        insights.push({ type: 'improvement', message: `Your skin score increased by ${diff} points since your last scan.` });
      } else if (diff < 0) {
        insights.push({ type: 'decline', message: `Your skin score decreased by ${Math.abs(diff)} points since your last scan.` });
      } else {
        insights.push({ type: 'tip', message: `Your skin score has remained stable.` });
      }
    }
  }

  // Add top correlations as insights
  for (const c of correlations.slice(0, 2)) {
    insights.push({ type: 'correlation', message: c.message });
  }

  if (insights.length === 0) {
    insights.push({ type: 'tip', message: 'Keep logging your habits and scanning to unlock personalized insights.' });
  }

  return insights;
}

// ─── Badges ───

export function computeBadges(
  progress: SkinProgressEntry[],
  logCount: number,
  journalStreak: number,
): Badge[] {
  const badges: Badge[] = [
    { id: 'first_scan', label: 'First Scan', icon: '📸', earned: progress.length >= 1 },
    { id: 'scan_streak_3', label: '3 Scan Streak', icon: '🔥', earned: progress.length >= 3 },
    { id: 'scan_streak_5', label: '5 Scan Streak', icon: '⚡', earned: progress.length >= 5 },
    { id: 'journal_7', label: '7 Day Journal', icon: '📝', earned: journalStreak >= 7 },
    { id: 'score_up_10', label: '+10 Score Jump', icon: '🚀', earned: false },
    { id: 'hydration_up', label: 'Hydration Improved', icon: '💧', earned: false },
  ];

  if (progress.length >= 2) {
    const first = progress[0];
    const last = progress[progress.length - 1];
    if (first.skin_score != null && last.skin_score != null && last.skin_score - first.skin_score >= 10) {
      badges.find(b => b.id === 'score_up_10')!.earned = true;
    }
    if (first.hydration_score != null && last.hydration_score != null && last.hydration_score - first.hydration_score >= 5) {
      badges.find(b => b.id === 'hydration_up')!.earned = true;
    }
  }

  return badges;
}

// ─── Next Scan Recommendation ───

export function getNextScanRecommendation(lastScanDate: string | null): string {
  if (!lastScanDate) return 'Take your first skin scan to start tracking.';
  const daysSince = Math.floor((Date.now() - new Date(lastScanDate).getTime()) / (1000 * 60 * 60 * 24));
  if (daysSince < 3) return 'Great job! Next scan recommended in a few days.';
  if (daysSince < 7) return 'Consider scanning again soon to track changes.';
  if (daysSince < 14) return 'A new scan would help track your progress.';
  return "It's been a while — time for your next skin scan!";
}

// ─── Progress Summary ───

export function generateProgressSummary(
  progress: SkinProgressEntry[],
  logs: LifestyleLog[],
): ProgressSummary {
  const correlations = computeCorrelations(logs, progress);
  const weeklyInsights = generateWeeklyInsights(progress, correlations);

  // Journal streak
  let streakDays = 0;
  if (logs.length > 0) {
    const sortedDates = logs.map(l => l.date).sort().reverse();
    const today = new Date().toISOString().split('T')[0];
    let current = today;
    for (const d of sortedDates) {
      if (d === current || d === getPrevDay(current)) {
        streakDays++;
        current = d;
      } else break;
    }
  }

  const badges = computeBadges(progress, logs.length, streakDays);

  let scoreChange: number | null = null;
  const improvements: string[] = [];
  if (progress.length >= 2) {
    const first = progress[0];
    const last = progress[progress.length - 1];
    if (first.skin_score != null && last.skin_score != null) {
      scoreChange = last.skin_score - first.skin_score;
    }

    const metricKeys: (keyof SkinProgressEntry)[] = ['hydration_score', 'texture_score', 'pigmentation_score', 'inflammation_score', 'elasticity_score'];
    const labels: Record<string, string> = {
      hydration_score: 'Hydration',
      texture_score: 'Texture',
      pigmentation_score: 'Pigmentation',
      inflammation_score: 'Inflammation',
      elasticity_score: 'Elasticity',
    };
    for (const key of metricKeys) {
      const f = first[key] as number | null;
      const l = last[key] as number | null;
      if (f != null && l != null && l > f) {
        improvements.push(`${labels[key]} improved by ${l - f} points.`);
      }
    }
  }

  const lastDate = progress.length > 0 ? progress[progress.length - 1].date : null;

  return {
    scoreChange,
    scanCount: progress.length,
    streakDays,
    nextScanMessage: getNextScanRecommendation(lastDate),
    improvements,
    badges,
    weeklyInsights,
    correlations,
  };
}

function getPrevDay(dateStr: string): string {
  const d = new Date(dateStr);
  d.setDate(d.getDate() - 1);
  return d.toISOString().split('T')[0];
}
