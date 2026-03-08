// SkinPulse Phase 1 Analysis Engine
// This module provides placeholder scoring for MVP demo/testing.
// Replace with real analysis in Phase 2.

export interface SkinAnalysisResult {
  overallScore: number;
  hydrationScore: number;
  textureScore: number;
  pigmentationScore: number;
  inflammationScore: number;
  elasticityScore: number;
  skinAgeEstimate: number;
  summaryText: string;
}

// Generate a deterministic pseudo-random number from a seed string
function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return Math.abs(hash);
}

function seededScore(seed: number, offset: number): number {
  const val = ((seed * 2654435761 + offset * 40503) % 1000) / 1000;
  return Math.round(40 + val * 55); // scores between 40-95
}

function generateSummary(scores: Omit<SkinAnalysisResult, 'summaryText'>): string {
  const { overallScore } = scores;
  const parts: string[] = [];

  if (overallScore >= 80) {
    parts.push("Your skin appears to be in excellent condition overall.");
  } else if (overallScore >= 65) {
    parts.push("Your skin shows generally healthy characteristics with some areas for improvement.");
  } else if (overallScore >= 50) {
    parts.push("Your skin analysis suggests moderate wellness levels with opportunities to enhance your routine.");
  } else {
    parts.push("Your skin may benefit from additional attention and care in several areas.");
  }

  if (scores.hydrationScore < 60) {
    parts.push("Hydration levels appear lower than optimal — consider increasing water intake and using a hydrating serum.");
  } else if (scores.hydrationScore >= 80) {
    parts.push("Hydration levels look great — your moisturizing routine seems effective.");
  }

  if (scores.textureScore < 60) {
    parts.push("Skin texture could be refined with gentle exfoliation and consistent care.");
  }

  if (scores.pigmentationScore < 60) {
    parts.push("Some uneven pigmentation was noted — daily SPF and vitamin C may help over time.");
  }

  if (scores.inflammationScore < 60) {
    parts.push("Mild signs of sensitivity or inflammation were observed — gentle, fragrance-free products may help.");
  }

  if (scores.elasticityScore >= 75) {
    parts.push("Skin elasticity appears healthy, suggesting good structural support.");
  }

  parts.push("Remember, this is a general wellness snapshot — not a medical diagnosis. Consult a dermatologist for personalized advice.");

  return parts.join(" ");
}

export function analyzeSkin(imageRef: string, userId: string): SkinAnalysisResult {
  const seed = hashCode(imageRef + userId + new Date().toDateString());
  
  const hydrationScore = seededScore(seed, 1);
  const textureScore = seededScore(seed, 2);
  const pigmentationScore = seededScore(seed, 3);
  const inflammationScore = seededScore(seed, 4);
  const elasticityScore = seededScore(seed, 5);

  const overallScore = Math.round(
    hydrationScore * 0.25 +
    textureScore * 0.20 +
    pigmentationScore * 0.20 +
    inflammationScore * 0.15 +
    elasticityScore * 0.20
  );

  const baseAge = 25;
  const ageOffset = Math.round((100 - overallScore) * 0.3);
  const skinAgeEstimate = baseAge + ageOffset;

  const scores = {
    overallScore,
    hydrationScore,
    textureScore,
    pigmentationScore,
    inflammationScore,
    elasticityScore,
    skinAgeEstimate,
  };

  return {
    ...scores,
    summaryText: generateSummary(scores),
  };
}
