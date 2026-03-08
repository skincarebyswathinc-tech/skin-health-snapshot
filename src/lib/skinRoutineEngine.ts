// ─────────────────────────────────────────────────────────────
// SkinPulse — AI Skincare Routine Generator
// ─────────────────────────────────────────────────────────────
// Generates personalized morning, evening, and weekly routines
// based on skin metrics and user profile data.
// ─────────────────────────────────────────────────────────────

export interface RoutineMetrics {
  hydrationScore: number;
  pigmentationScore: number;
  inflammationScore: number;
  elasticityScore: number;
  textureScore: number;
}

export interface UserProfile {
  skinType?: string | null;
  skinConcerns?: string[] | null;
  ageRange?: string | null;
}

export interface RoutineStep {
  id: string;
  order: number;
  name: string;
  product: string;
  description: string;
  icon: string;
  duration?: string;
  priority: 'essential' | 'recommended' | 'optional';
}

export interface RoutineSection {
  key: string;
  title: string;
  subtitle: string;
  icon: string;
  steps: RoutineStep[];
}

// ── Product Database ────────────────────────────────────────

interface ProductEntry {
  name: string;
  product: string;
  description: string;
  icon: string;
  duration?: string;
  triggers: {
    metric?: keyof RoutineMetrics;
    threshold?: 'low' | 'high';
    skinTypes?: string[];
    concerns?: string[];
    always?: boolean;
  };
}

const MORNING_PRODUCTS: ProductEntry[] = [
  {
    name: 'Gentle Cleanser',
    product: 'Mild gel or cream cleanser',
    description: 'Start with a gentle cleanse to remove overnight buildup without stripping moisture.',
    icon: '🫧',
    duration: '1 min',
    triggers: { always: true },
  },
  {
    name: 'Hydrating Toner',
    product: 'Hyaluronic acid toner',
    description: 'Prep skin and boost hydration levels before serums.',
    icon: '💧',
    triggers: { metric: 'hydrationScore', threshold: 'low' },
  },
  {
    name: 'Vitamin C Serum',
    product: 'L-ascorbic acid 10-20%',
    description: 'Brightens skin, fights free radicals, and helps even out pigmentation.',
    icon: '🍊',
    triggers: { metric: 'pigmentationScore', threshold: 'low' },
  },
  {
    name: 'Niacinamide Serum',
    product: 'Niacinamide 5-10%',
    description: 'Reduces redness, minimizes pores, and strengthens the skin barrier.',
    icon: '🧪',
    triggers: { metric: 'inflammationScore', threshold: 'low' },
  },
  {
    name: 'Antioxidant Serum',
    product: 'Vitamin E + Ferulic acid',
    description: 'Protects against environmental damage and supports skin repair.',
    icon: '🛡️',
    triggers: { metric: 'elasticityScore', threshold: 'low' },
  },
  {
    name: 'Lightweight Moisturizer',
    product: 'Oil-free gel moisturizer',
    description: 'Lock in hydration without heaviness. Choose gel for oily, cream for dry skin.',
    icon: '🧴',
    triggers: { always: true },
  },
  {
    name: 'Eye Cream',
    product: 'Peptide eye cream',
    description: 'Target the delicate under-eye area to reduce puffiness and fine lines.',
    icon: '👁️',
    triggers: { concerns: ['aging', 'dark circles', 'fine lines'] },
  },
  {
    name: 'Sunscreen SPF 30+',
    product: 'Broad-spectrum SPF 30-50',
    description: 'Essential final step. Protects against UV damage, premature aging, and pigmentation.',
    icon: '☀️',
    duration: 'Reapply every 2h',
    triggers: { always: true },
  },
];

const EVENING_PRODUCTS: ProductEntry[] = [
  {
    name: 'Oil Cleanser',
    product: 'Cleansing oil or micellar water',
    description: 'First cleanse to dissolve sunscreen, makeup, and excess oil.',
    icon: '🫧',
    duration: '1 min',
    triggers: { always: true },
  },
  {
    name: 'Water-Based Cleanser',
    product: 'Gentle foaming cleanser',
    description: 'Second cleanse to remove remaining impurities for a fresh canvas.',
    icon: '🧼',
    triggers: { skinTypes: ['oily', 'combination'] },
  },
  {
    name: 'Exfoliating Toner',
    product: 'BHA/AHA toner (2-3x per week)',
    description: 'Gently dissolves dead skin cells for smoother texture. Alternate nights.',
    icon: '✨',
    triggers: { metric: 'textureScore', threshold: 'low' },
  },
  {
    name: 'Retinol Serum',
    product: 'Retinol 0.25-0.5%',
    description: 'Boosts cell turnover, improves texture, and supports collagen production.',
    icon: '🌙',
    triggers: { metric: 'elasticityScore', threshold: 'low' },
  },
  {
    name: 'Hydrating Serum',
    product: 'Hyaluronic acid + ceramides',
    description: 'Deep hydration layer to restore moisture barrier overnight.',
    icon: '💧',
    triggers: { metric: 'hydrationScore', threshold: 'low' },
  },
  {
    name: 'Calming Serum',
    product: 'Centella asiatica or aloe vera',
    description: 'Soothes inflammation and redness while repairing the skin barrier.',
    icon: '🌿',
    triggers: { metric: 'inflammationScore', threshold: 'low' },
  },
  {
    name: 'Brightening Treatment',
    product: 'Alpha arbutin or tranexamic acid',
    description: 'Targets dark spots and uneven tone while you sleep.',
    icon: '💫',
    triggers: { metric: 'pigmentationScore', threshold: 'low' },
  },
  {
    name: 'Rich Night Cream',
    product: 'Peptide-rich night moisturizer',
    description: 'Nourishing overnight moisturizer to support skin repair during sleep.',
    icon: '🧴',
    triggers: { always: true },
  },
  {
    name: 'Facial Oil',
    product: 'Rosehip or squalane oil',
    description: 'Seal in all active layers with a nourishing oil for intense overnight repair.',
    icon: '🫒',
    triggers: { skinTypes: ['dry', 'normal'], metric: 'hydrationScore', threshold: 'low' },
  },
];

const WEEKLY_PRODUCTS: ProductEntry[] = [
  {
    name: 'Chemical Exfoliation',
    product: 'AHA/BHA peel (1-2x weekly)',
    description: 'Deeper exfoliation to remove dead cells, refine texture, and unclog pores.',
    icon: '🧬',
    duration: '10-15 min',
    triggers: { metric: 'textureScore', threshold: 'low' },
  },
  {
    name: 'Hydrating Face Mask',
    product: 'Sheet mask or gel mask',
    description: 'Intensive hydration boost. Best applied after exfoliation.',
    icon: '🎭',
    duration: '15-20 min',
    triggers: { metric: 'hydrationScore', threshold: 'low' },
  },
  {
    name: 'Clay Mask',
    product: 'Kaolin or bentonite clay',
    description: 'Draws out impurities and excess oil. Use on T-zone for combination skin.',
    icon: '🏺',
    duration: '10 min',
    triggers: { skinTypes: ['oily', 'combination'] },
  },
  {
    name: 'Anti-Inflammatory Mask',
    product: 'Calming mask with centella or oat',
    description: 'Reduces redness and irritation. Ideal after active ingredient nights.',
    icon: '🌿',
    duration: '15 min',
    triggers: { metric: 'inflammationScore', threshold: 'low' },
  },
  {
    name: 'Brightening Mask',
    product: 'Vitamin C or licorice extract mask',
    description: 'Targets pigmentation and dullness for a more radiant complexion.',
    icon: '✨',
    duration: '15 min',
    triggers: { metric: 'pigmentationScore', threshold: 'low' },
  },
  {
    name: 'Facial Massage',
    product: 'Gua sha or jade roller',
    description: 'Promotes circulation and lymphatic drainage. Reduces puffiness.',
    icon: '💆',
    duration: '5-10 min',
    triggers: { metric: 'elasticityScore', threshold: 'low' },
  },
  {
    name: 'Overnight Repair Mask',
    product: 'Sleeping mask with peptides',
    description: 'Leave-on mask for intensive overnight repair and firming.',
    icon: '🌛',
    duration: 'Overnight',
    triggers: { concerns: ['aging', 'fine lines'] },
  },
];

// ── Core Engine ─────────────────────────────────────────────

const LOW_THRESHOLD = 70;

function shouldInclude(
  entry: ProductEntry,
  metrics: RoutineMetrics,
  profile: UserProfile,
): boolean {
  const t = entry.triggers;
  if (t.always) return true;

  let match = false;

  if (t.metric && t.threshold === 'low' && metrics[t.metric] < LOW_THRESHOLD) {
    match = true;
  }
  if (t.metric && t.threshold === 'high' && metrics[t.metric] >= LOW_THRESHOLD) {
    match = true;
  }
  if (t.skinTypes && profile.skinType && t.skinTypes.includes(profile.skinType.toLowerCase())) {
    match = true;
  }
  if (t.concerns && profile.skinConcerns) {
    const userConcerns = profile.skinConcerns.map(c => c.toLowerCase());
    if (t.concerns.some(c => userConcerns.some(uc => uc.includes(c)))) {
      match = true;
    }
  }

  return match;
}

function buildSteps(
  products: ProductEntry[],
  metrics: RoutineMetrics,
  profile: UserProfile,
): RoutineStep[] {
  return products
    .filter(p => shouldInclude(p, metrics, profile))
    .map((p, i) => ({
      id: `${p.name.replace(/\s+/g, '-').toLowerCase()}-${i}`,
      order: i + 1,
      name: p.name,
      product: p.product,
      description: p.description,
      icon: p.icon,
      duration: p.duration,
      priority: p.triggers.always ? 'essential' as const : i < 5 ? 'recommended' as const : 'optional' as const,
    }));
}

export function generateMorningRoutine(metrics: RoutineMetrics, profile: UserProfile): RoutineStep[] {
  return buildSteps(MORNING_PRODUCTS, metrics, profile);
}

export function generateEveningRoutine(metrics: RoutineMetrics, profile: UserProfile): RoutineStep[] {
  return buildSteps(EVENING_PRODUCTS, metrics, profile);
}

export function generateWeeklyTreatments(metrics: RoutineMetrics, profile: UserProfile): RoutineStep[] {
  return buildSteps(WEEKLY_PRODUCTS, metrics, profile);
}

export function generateFullRoutine(
  metrics: RoutineMetrics,
  profile: UserProfile,
): RoutineSection[] {
  return [
    {
      key: 'morning',
      title: 'Morning Routine',
      subtitle: 'Protect and prepare your skin for the day',
      icon: '🌅',
      steps: generateMorningRoutine(metrics, profile),
    },
    {
      key: 'evening',
      title: 'Evening Routine',
      subtitle: 'Repair and restore while you sleep',
      icon: '🌙',
      steps: generateEveningRoutine(metrics, profile),
    },
    {
      key: 'weekly',
      title: 'Weekly Treatments',
      subtitle: 'Deeper care for long-term improvements',
      icon: '📅',
      steps: generateWeeklyTreatments(metrics, profile),
    },
  ];
}
