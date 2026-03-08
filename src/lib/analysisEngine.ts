// ─────────────────────────────────────────────────────────────
// SkinPulse Phase 1 — Canvas-Based Skin Analysis Engine
// ─────────────────────────────────────────────────────────────
// Uses HTML Canvas pixel analysis to extract visual signals from
// a selfie and produce five skin wellness metrics.
// Designed as a drop-in module — replace internals with real AI later.
// ─────────────────────────────────────────────────────────────

import { alignFace } from './faceAlignmentEngine';

const ANALYSIS_SIZE = 512;

// ── Public interface ────────────────────────────────────────

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

export interface VisualSignals {
  brightnessVariance: number;
  brightnessMean: number;
  rednessIntensity: number;
  textureContrast: number;
  pixelRoughness: number;
  pigmentationSpread: number;
}

export type StageCallback = (stage: number, label: string) => void;

// ── Main entry point ────────────────────────────────────────

export async function processScan(
  imageUrl: string,
  userAge: number = 30,
  onStage?: StageCallback,
): Promise<SkinAnalysisResult> {
  // Stage 1 — Image Preparation
  onStage?.(0, 'Preparing image...');
  const normalizedCanvas = await prepareImage(imageUrl);

  // Stage 2 — Face Region Normalization
  onStage?.(1, 'Aligning facial region...');
  const faceCanvas = extractFaceRegion(normalizedCanvas);

  // Stage 3 — Signal Extraction
  onStage?.(2, 'Reading skin signals...');
  const signals = analyzeSignals(faceCanvas);

  // Stage 4 — Metric Scoring
  onStage?.(3, 'Generating skin metrics...');
  const metrics = calculateMetrics(signals);

  // Stage 5 — Overall Score
  const overallScore = computeOverallScore(metrics);

  // Stage 6 — Skin Age
  const skinAgeEstimate = estimateSkinAge(overallScore, userAge);

  // Stage 7 — Insights
  onStage?.(4, 'Preparing your dashboard...');
  const summaryText = generateInsights({ ...metrics, overallScore });

  return {
    ...metrics,
    overallScore,
    skinAgeEstimate,
    summaryText,
  };
}

// ── Stage 1: Image Preparation ──────────────────────────────

async function prepareImage(imageUrl: string): Promise<HTMLCanvasElement> {
  const img = await loadImage(imageUrl);
  const canvas = document.createElement('canvas');
  canvas.width = ANALYSIS_SIZE;
  canvas.height = ANALYSIS_SIZE;
  const ctx = canvas.getContext('2d')!;

  // Center-crop to square, maintaining aspect ratio
  const srcSize = Math.min(img.width, img.height);
  const sx = (img.width - srcSize) / 2;
  const sy = (img.height - srcSize) / 2;

  ctx.drawImage(img, sx, sy, srcSize, srcSize, 0, 0, ANALYSIS_SIZE, ANALYSIS_SIZE);

  // Normalize brightness range
  normalizeBrightness(ctx, ANALYSIS_SIZE, ANALYSIS_SIZE);

  return canvas;
}

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => {
      // Retry without crossOrigin for data URIs
      const img2 = new Image();
      img2.onload = () => resolve(img2);
      img2.onerror = reject;
      img2.src = url;
    };
    img.src = url;
  });
}

function normalizeBrightness(ctx: CanvasRenderingContext2D, w: number, h: number): void {
  const imageData = ctx.getImageData(0, 0, w, h);
  const d = imageData.data;

  let minL = 255, maxL = 0;
  for (let i = 0; i < d.length; i += 4) {
    const l = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
    if (l < minL) minL = l;
    if (l > maxL) maxL = l;
  }

  const range = maxL - minL || 1;
  for (let i = 0; i < d.length; i += 4) {
    d[i] = ((d[i] - minL) / range) * 255;
    d[i + 1] = ((d[i + 1] - minL) / range) * 255;
    d[i + 2] = ((d[i + 2] - minL) / range) * 255;
  }

  ctx.putImageData(imageData, 0, 0);
}

// ── Stage 2: Face Region Normalization ──────────────────────

function extractFaceRegion(source: HTMLCanvasElement): HTMLCanvasElement {
  const cropSize = Math.round(ANALYSIS_SIZE * FACE_CROP_RATIO);
  const offset = Math.round((ANALYSIS_SIZE - cropSize) / 2);

  const canvas = document.createElement('canvas');
  canvas.width = cropSize;
  canvas.height = cropSize;
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(source, offset, offset, cropSize, cropSize, 0, 0, cropSize, cropSize);
  return canvas;
}

// ── Stage 3: Visual Signal Extraction ───────────────────────

export function analyzeSignals(canvas: HTMLCanvasElement): VisualSignals {
  const ctx = canvas.getContext('2d')!;
  const w = canvas.width;
  const h = canvas.height;
  const imageData = ctx.getImageData(0, 0, w, h);
  const d = imageData.data;
  const pixelCount = w * h;

  // ─ Brightness statistics ─
  const brightness: number[] = [];
  let rSum = 0, gSum = 0, bSum = 0;

  for (let i = 0; i < d.length; i += 4) {
    const r = d[i], g = d[i + 1], b = d[i + 2];
    brightness.push(0.299 * r + 0.587 * g + 0.114 * b);
    rSum += r;
    gSum += g;
    bSum += b;
  }

  const brightnessMean = brightness.reduce((a, b) => a + b, 0) / pixelCount;
  const brightnessVariance = Math.sqrt(
    brightness.reduce((sum, v) => sum + (v - brightnessMean) ** 2, 0) / pixelCount,
  );

  // ─ Redness intensity ─
  const avgR = rSum / pixelCount;
  const avgG = gSum / pixelCount;
  const avgB = bSum / pixelCount;
  // Ratio of red dominance over green+blue
  const rednessIntensity = avgR / ((avgG + avgB) / 2 + 1);

  // ─ Texture contrast (neighbor pixel differences) ─
  let textureSum = 0;
  let textureCount = 0;
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const idx = (y * w + x);
      const center = brightness[idx];
      const right = brightness[idx + 1];
      const below = brightness[idx + w];
      textureSum += Math.abs(center - right) + Math.abs(center - below);
      textureCount += 2;
    }
  }
  const textureContrast = textureSum / textureCount;

  // ─ Pixel roughness (high-frequency change) ─
  let roughnessSum = 0;
  let roughnessCount = 0;
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const idx = y * w + x;
      const center = brightness[idx];
      const laplacian = (
        brightness[idx - 1] + brightness[idx + 1] +
        brightness[idx - w] + brightness[idx + w]
      ) / 4 - center;
      roughnessSum += Math.abs(laplacian);
      roughnessCount++;
    }
  }
  const pixelRoughness = roughnessSum / roughnessCount;

  // ─ Pigmentation spread (color standard deviation) ─
  const hueValues: number[] = [];
  for (let i = 0; i < d.length; i += 16) { // sample every 4th pixel for speed
    const r = d[i] / 255, g = d[i + 1] / 255, b = d[i + 2] / 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    const sat = max === 0 ? 0 : (max - min) / max;
    if (sat > 0.05) { // skip near-grey pixels
      let hue = 0;
      const delta = max - min;
      if (max === r) hue = ((g - b) / delta) % 6;
      else if (max === g) hue = (b - r) / delta + 2;
      else hue = (r - g) / delta + 4;
      hue *= 60;
      if (hue < 0) hue += 360;
      hueValues.push(hue);
    }
  }
  let pigmentationSpread = 0;
  if (hueValues.length > 10) {
    const meanHue = hueValues.reduce((a, b) => a + b, 0) / hueValues.length;
    pigmentationSpread = Math.sqrt(
      hueValues.reduce((sum, v) => sum + (v - meanHue) ** 2, 0) / hueValues.length,
    );
  }

  return {
    brightnessVariance,
    brightnessMean,
    rednessIntensity,
    textureContrast,
    pixelRoughness,
    pigmentationSpread,
  };
}

// ── Stage 4: Metric Scoring ─────────────────────────────────

function normalizeSignalToScore(value: number, lowBad: number, highBad: number): number {
  // Maps a signal value to 0-100 where values outside the range score lower
  const mid = (lowBad + highBad) / 2;
  const range = (highBad - lowBad) / 2 || 1;
  const distance = Math.abs(value - mid) / range;
  const raw = Math.max(0, Math.min(1, 1 - distance));
  return Math.round(raw * 60 + 40); // range 40-100
}

function invertedScore(value: number, min: number, max: number): number {
  // Higher signal = lower score (bad signal)
  const normalized = Math.max(0, Math.min(1, (value - min) / (max - min || 1)));
  return Math.round((1 - normalized) * 60 + 40); // range 40-100
}

function directScore(value: number, min: number, max: number): number {
  // Higher signal = higher score (good signal)
  const normalized = Math.max(0, Math.min(1, (value - min) / (max - min || 1)));
  return Math.round(normalized * 60 + 40); // range 40-100
}

export function calculateMetrics(signals: VisualSignals) {
  // Hydration: smooth, even brightness → low variance + low roughness = good
  const hydrationScore = Math.round(
    invertedScore(signals.brightnessVariance, 20, 80) * 0.5 +
    invertedScore(signals.pixelRoughness, 2, 15) * 0.5
  );

  // Texture: moderate contrast is good, very high roughness is bad
  const textureScore = Math.round(
    normalizeSignalToScore(signals.textureContrast, 5, 25) * 0.6 +
    invertedScore(signals.pixelRoughness, 3, 18) * 0.4
  );

  // Pigmentation: low spread = even tone = good
  const pigmentationScore = invertedScore(signals.pigmentationSpread, 10, 60);

  // Inflammation: low redness = good
  const inflammationScore = invertedScore(signals.rednessIntensity, 0.8, 1.6);

  // Elasticity: smooth texture + even brightness = good
  const elasticityScore = Math.round(
    invertedScore(signals.pixelRoughness, 2, 14) * 0.5 +
    invertedScore(signals.brightnessVariance, 20, 70) * 0.5
  );

  return {
    hydrationScore: clamp(hydrationScore, 35, 98),
    textureScore: clamp(textureScore, 35, 98),
    pigmentationScore: clamp(pigmentationScore, 35, 98),
    inflammationScore: clamp(inflammationScore, 35, 98),
    elasticityScore: clamp(elasticityScore, 35, 98),
  };
}

function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}

// ── Stage 5: Overall Score ──────────────────────────────────

function computeOverallScore(metrics: ReturnType<typeof calculateMetrics>): number {
  return Math.round(
    metrics.hydrationScore * 0.2 +
    metrics.textureScore * 0.2 +
    metrics.pigmentationScore * 0.2 +
    metrics.inflammationScore * 0.2 +
    metrics.elasticityScore * 0.2
  );
}

// ── Stage 6: Skin Age Estimation ────────────────────────────

function estimateSkinAge(overallScore: number, userAge: number): number {
  if (overallScore > 85) return Math.max(18, userAge - 3);
  if (overallScore >= 70) return userAge;
  if (overallScore >= 55) return userAge + 3;
  return userAge + 6;
}

// ── Stage 7: Insight Generation ─────────────────────────────

interface InsightInput {
  hydrationScore: number;
  textureScore: number;
  pigmentationScore: number;
  inflammationScore: number;
  elasticityScore: number;
  overallScore: number;
}

export function generateInsights(input: InsightInput): string {
  const parts: string[] = [];

  // Overall opener
  if (input.overallScore >= 85) {
    parts.push('Your skin appears to be in excellent condition overall. Your wellness signals are strong across most metrics.');
  } else if (input.overallScore >= 70) {
    parts.push('Your skin shows generally healthy characteristics with some areas that could benefit from focused attention.');
  } else if (input.overallScore >= 55) {
    parts.push('Your skin analysis suggests moderate wellness levels. There are clear opportunities to improve your skincare routine.');
  } else {
    parts.push('Your skin may benefit from additional care and attention across several areas. Consider consulting a professional.');
  }

  // Metric-specific insights
  if (input.hydrationScore < 60) {
    parts.push('Mild dehydration signals detected. Increasing water intake and using omega-3 rich foods may improve skin hydration. A hydrating serum with hyaluronic acid could also help.');
  } else if (input.hydrationScore >= 80) {
    parts.push('Hydration levels look excellent — your moisturizing routine appears effective.');
  }

  if (input.textureScore < 60) {
    parts.push('Skin texture appears uneven. Gentle exfoliation with AHAs or BHAs, along with consistent moisturizing, may help refine surface smoothness.');
  } else if (input.textureScore >= 80) {
    parts.push('Skin texture is smooth and even — a sign of a well-maintained routine.');
  }

  if (input.pigmentationScore < 60) {
    parts.push('Uneven tone detected. Daily broad-spectrum SPF and antioxidant-rich skincare (vitamin C) may help support skin clarity over time.');
  } else if (input.pigmentationScore >= 80) {
    parts.push('Skin tone appears even and consistent — great pigmentation balance.');
  }

  if (input.inflammationScore < 60) {
    parts.push('Visible redness patterns detected. Anti-inflammatory ingredients like niacinamide, green tea extract, and reduced sugar intake may support calmer skin.');
  } else if (input.inflammationScore >= 80) {
    parts.push('Low inflammation signals — your skin barrier appears healthy and calm.');
  }

  if (input.elasticityScore < 60) {
    parts.push('Elasticity signals suggest the skin could benefit from collagen-supporting nutrients and retinoid-based products.');
  } else if (input.elasticityScore >= 80) {
    parts.push('Skin elasticity appears healthy, suggesting good structural support and resilience.');
  }

  parts.push('Remember, this is a general wellness snapshot — not a medical diagnosis. Consult a dermatologist for personalized advice.');

  return parts.join(' ');
}

// ── Legacy compatibility wrapper ────────────────────────────

export function analyzeSkin(imageRef: string, userId: string): SkinAnalysisResult {
  // Fallback for non-async contexts — uses deterministic hash approach
  const seed = hashCode(imageRef + userId + new Date().toDateString());
  const seeded = (offset: number) => clamp(Math.round(40 + ((seed * 2654435761 + offset * 40503) % 1000) / 1000 * 55), 35, 98);

  const metrics = {
    hydrationScore: seeded(1),
    textureScore: seeded(2),
    pigmentationScore: seeded(3),
    inflammationScore: seeded(4),
    elasticityScore: seeded(5),
  };
  const overallScore = computeOverallScore(metrics);
  const skinAgeEstimate = estimateSkinAge(overallScore, 30);

  return {
    ...metrics,
    overallScore,
    skinAgeEstimate,
    summaryText: generateInsights({ ...metrics, overallScore }),
  };
}

function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}
