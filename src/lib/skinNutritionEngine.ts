// ─────────────────────────────────────────────────────────────
// SkinPulse — Skin Nutrition Recommendation Engine
// ─────────────────────────────────────────────────────────────

export interface SkinMetricsInput {
  hydrationScore: number;
  pigmentationScore: number;
  inflammationScore: number;
  elasticityScore: number;
  textureScore?: number;
}

export interface FoodItem {
  name: string;
  emoji: string;
  benefit: string;
}

export interface NutritionCategory {
  key: string;
  title: string;
  description: string;
  icon: string;
  priority: number; // lower score = higher priority
  foods: FoodItem[];
}

const FOOD_DATABASE: Record<string, { foods: FoodItem[]; title: string; icon: string; descLow: string; descOk: string }> = {
  inflammation: {
    title: 'Anti-Inflammatory',
    icon: '🔥',
    descLow: 'Your inflammation signals are elevated. These foods contain compounds that may help calm skin redness.',
    descOk: 'Inflammation is well-managed. These foods help maintain calm, balanced skin.',
    foods: [
      { name: 'Turmeric', emoji: '🟡', benefit: 'Curcumin reduces inflammatory markers' },
      { name: 'Green Tea', emoji: '🍵', benefit: 'EGCG antioxidants soothe redness' },
      { name: 'Blueberries', emoji: '🫐', benefit: 'Anthocyanins fight oxidative stress' },
      { name: 'Salmon', emoji: '🐟', benefit: 'Omega-3 fatty acids reduce inflammation' },
      { name: 'Ginger', emoji: '🫚', benefit: 'Gingerols have anti-inflammatory properties' },
      { name: 'Leafy Greens', emoji: '🥬', benefit: 'Vitamins A, C, K support skin healing' },
      { name: 'Cherries', emoji: '🍒', benefit: 'Natural anti-inflammatory compounds' },
      { name: 'Extra Virgin Olive Oil', emoji: '🫒', benefit: 'Oleocanthal mimics anti-inflammatory effects' },
    ],
  },
  hydration: {
    title: 'Hydration Boosters',
    icon: '💧',
    descLow: 'Dehydration signals detected. These foods are rich in healthy fats and water content to support skin moisture.',
    descOk: 'Hydration looks good. Keep it up with moisture-rich foods.',
    foods: [
      { name: 'Avocado', emoji: '🥑', benefit: 'Healthy fats strengthen moisture barrier' },
      { name: 'Walnuts', emoji: '🥜', benefit: 'Omega-3 and omega-6 support skin lipids' },
      { name: 'Chia Seeds', emoji: '🌱', benefit: 'Absorb water and deliver omega-3s' },
      { name: 'Cucumber', emoji: '🥒', benefit: '96% water with silica for skin elasticity' },
      { name: 'Watermelon', emoji: '🍉', benefit: 'High water content with lycopene' },
      { name: 'Coconut Water', emoji: '🥥', benefit: 'Natural electrolytes for cellular hydration' },
      { name: 'Sweet Potato', emoji: '🍠', benefit: 'Beta-carotene supports moisture retention' },
      { name: 'Flaxseeds', emoji: '🌾', benefit: 'Alpha-linolenic acid for skin barrier' },
    ],
  },
  pigmentation: {
    title: 'Tone & Clarity',
    icon: '✨',
    descLow: 'Uneven tone detected. These foods provide antioxidants and vitamins that support even skin pigmentation.',
    descOk: 'Skin tone appears even. These foods help maintain clarity.',
    foods: [
      { name: 'Citrus Fruits', emoji: '🍊', benefit: 'Vitamin C inhibits excess melanin production' },
      { name: 'Tomatoes', emoji: '🍅', benefit: 'Lycopene provides natural UV protection' },
      { name: 'Bell Peppers', emoji: '🫑', benefit: 'High in vitamin C for brightening' },
      { name: 'Papaya', emoji: '🥭', benefit: 'Papain enzyme supports cell turnover' },
      { name: 'Pomegranate', emoji: '🍎', benefit: 'Ellagic acid helps regulate pigmentation' },
      { name: 'Dark Chocolate', emoji: '🍫', benefit: 'Flavonoids protect against UV damage' },
      { name: 'Broccoli', emoji: '🥦', benefit: 'Sulforaphane supports detoxification' },
      { name: 'Kiwi', emoji: '🥝', benefit: 'Dense vitamin C and E combination' },
    ],
  },
  elasticity: {
    title: 'Firmness & Elasticity',
    icon: '🧬',
    descLow: 'Elasticity could improve. These foods support collagen production and skin structure.',
    descOk: 'Elasticity is strong. Maintain it with collagen-supporting nutrition.',
    foods: [
      { name: 'Bone Broth', emoji: '🍲', benefit: 'Natural collagen and amino acids' },
      { name: 'Eggs', emoji: '🥚', benefit: 'Proline and lysine for collagen synthesis' },
      { name: 'Berries', emoji: '🍓', benefit: 'Vitamin C essential for collagen production' },
      { name: 'Garlic', emoji: '🧄', benefit: 'Sulfur compounds support connective tissue' },
      { name: 'Soy Products', emoji: '🫘', benefit: 'Genistein stimulates collagen production' },
      { name: 'Almonds', emoji: '🌰', benefit: 'Vitamin E protects collagen from damage' },
      { name: 'Spinach', emoji: '🥗', benefit: 'Iron and vitamin A for skin renewal' },
      { name: 'Oysters', emoji: '🦪', benefit: 'Zinc supports collagen structure' },
    ],
  },
};

export function generateNutritionRecommendations(
  metrics: SkinMetricsInput,
): NutritionCategory[] {
  const categories: NutritionCategory[] = [];

  const mappings: Array<{ key: string; score: number }> = [
    { key: 'inflammation', score: metrics.inflammationScore },
    { key: 'hydration', score: metrics.hydrationScore },
    { key: 'pigmentation', score: metrics.pigmentationScore },
    { key: 'elasticity', score: metrics.elasticityScore },
  ];

  for (const { key, score } of mappings) {
    const db = FOOD_DATABASE[key];
    const isLow = score < 70;

    // Show top foods based on severity
    const foodCount = score < 50 ? 6 : score < 70 ? 4 : 3;

    categories.push({
      key,
      title: db.title,
      description: isLow ? db.descLow : db.descOk,
      icon: db.icon,
      priority: score,
      foods: db.foods.slice(0, foodCount),
    });
  }

  // Sort by priority — lowest scores (worst metrics) first
  categories.sort((a, b) => a.priority - b.priority);

  return categories;
}
