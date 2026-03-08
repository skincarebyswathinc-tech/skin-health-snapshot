// ─────────────────────────────────────────────────────────────
// SkinPulse — Canvas-Based Face Alignment Engine
// ─────────────────────────────────────────────────────────────
// Detects face region via skin-color segmentation, locates eyes
// using dark-region scanning, calculates rotation from eye axis,
// and produces a normalized, aligned face canvas for analysis.
// Zero external dependencies — pure Canvas API.
// ─────────────────────────────────────────────────────────────

export interface FaceLandmarks {
  leftEye: { x: number; y: number };
  rightEye: { x: number; y: number };
  noseCenter: { x: number; y: number };
  mouthCenter: { x: number; y: number };
  boundingBox: { x: number; y: number; w: number; h: number };
}

export interface AlignmentResult {
  canvas: HTMLCanvasElement;
  landmarks: FaceLandmarks | null;
  faceDetected: boolean;
}

const OUTPUT_SIZE = 512;

// ── Public API ──────────────────────────────────────────────

export async function alignFace(sourceCanvas: HTMLCanvasElement): Promise<AlignmentResult> {
  const w = sourceCanvas.width;
  const h = sourceCanvas.height;
  const ctx = sourceCanvas.getContext('2d')!;
  const imageData = ctx.getImageData(0, 0, w, h);

  // Step 1: Build skin probability map
  const skinMap = buildSkinMap(imageData, w, h);

  // Step 2: Find face bounding box from skin map
  const bbox = findFaceBoundingBox(skinMap, w, h);

  if (!bbox) {
    // Fallback: center crop like before
    return {
      canvas: fallbackCrop(sourceCanvas),
      landmarks: null,
      faceDetected: false,
    };
  }

  // Step 3: Detect eye regions within the face bounding box
  const eyes = detectEyes(imageData, w, h, bbox);

  // Step 4: Calculate rotation angle from eye positions
  const angle = eyes
    ? Math.atan2(eyes.rightEye.y - eyes.leftEye.y, eyes.rightEye.x - eyes.leftEye.x)
    : 0;

  // Step 5: Rotate and crop the aligned face
  const alignedCanvas = rotateAndCrop(sourceCanvas, bbox, angle);

  // Step 6: Estimate nose and mouth from proportions
  const landmarks = eyes
    ? buildLandmarks(eyes, bbox)
    : null;

  return {
    canvas: alignedCanvas,
    landmarks,
    faceDetected: true,
  };
}

// ── Skin Color Segmentation ─────────────────────────────────

function buildSkinMap(imageData: ImageData, w: number, h: number): Uint8Array {
  const d = imageData.data;
  const map = new Uint8Array(w * h);

  for (let i = 0; i < d.length; i += 4) {
    const r = d[i], g = d[i + 1], b = d[i + 2];
    if (isSkinPixel(r, g, b)) {
      map[i / 4] = 1;
    }
  }

  // Erode then dilate (morphological open) to remove noise
  return morphologicalOpen(map, w, h);
}

function isSkinPixel(r: number, g: number, b: number): boolean {
  // Multi-rule skin detection in RGB + derived YCbCr space
  // Rule 1: RGB ratios
  if (r <= 80 || g <= 30 || b <= 15) return false;
  if (r <= g || r <= b) return false;
  if (Math.abs(r - g) < 15) return false;

  // Rule 2: YCbCr thresholds
  const y = 0.299 * r + 0.587 * g + 0.114 * b;
  const cb = 128 - 0.169 * r - 0.331 * g + 0.500 * b;
  const cr = 128 + 0.500 * r - 0.419 * g - 0.081 * b;

  if (y < 60) return false;
  if (cb < 77 || cb > 127) return false;
  if (cr < 133 || cr > 173) return false;

  return true;
}

function morphologicalOpen(map: Uint8Array, w: number, h: number): Uint8Array {
  const eroded = new Uint8Array(w * h);
  const radius = 2;

  // Erode: pixel is 1 only if all neighbors in radius are 1
  for (let y = radius; y < h - radius; y++) {
    for (let x = radius; x < w - radius; x++) {
      let allSkin = true;
      outer: for (let dy = -radius; dy <= radius; dy++) {
        for (let dx = -radius; dx <= radius; dx++) {
          if (map[(y + dy) * w + (x + dx)] === 0) {
            allSkin = false;
            break outer;
          }
        }
      }
      eroded[y * w + x] = allSkin ? 1 : 0;
    }
  }

  // Dilate: pixel is 1 if any neighbor in radius is 1
  const result = new Uint8Array(w * h);
  for (let y = radius; y < h - radius; y++) {
    for (let x = radius; x < w - radius; x++) {
      let anySkin = false;
      for (let dy = -radius; dy <= radius; dy++) {
        for (let dx = -radius; dx <= radius; dx++) {
          if (eroded[(y + dy) * w + (x + dx)] === 1) {
            anySkin = true;
            break;
          }
        }
        if (anySkin) break;
      }
      result[y * w + x] = anySkin ? 1 : 0;
    }
  }

  return result;
}

// ── Face Bounding Box Detection ─────────────────────────────

function findFaceBoundingBox(
  skinMap: Uint8Array,
  w: number,
  h: number,
): { x: number; y: number; w: number; h: number } | null {
  // Find largest connected skin region using column/row density
  const colDensity = new Float32Array(w);
  const rowDensity = new Float32Array(h);

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (skinMap[y * w + x]) {
        colDensity[x]++;
        rowDensity[y]++;
      }
    }
  }

  // Normalize
  for (let x = 0; x < w; x++) colDensity[x] /= h;
  for (let y = 0; y < h; y++) rowDensity[y] /= w;

  // Find face region as contiguous high-density band
  const threshold = 0.15;
  const xBounds = findDensityBounds(colDensity, threshold);
  const yBounds = findDensityBounds(rowDensity, threshold);

  if (!xBounds || !yBounds) return null;

  const bw = xBounds.end - xBounds.start;
  const bh = yBounds.end - yBounds.start;

  // Reject if region too small or too large (not a face)
  const area = bw * bh;
  const totalArea = w * h;
  if (area < totalArea * 0.05 || area > totalArea * 0.95) return null;

  // Reject non-face aspect ratios (face is roughly 3:4 portrait)
  const aspectRatio = bw / bh;
  if (aspectRatio < 0.4 || aspectRatio > 1.8) return null;

  return {
    x: xBounds.start,
    y: yBounds.start,
    w: bw,
    h: bh,
  };
}

function findDensityBounds(
  density: Float32Array,
  threshold: number,
): { start: number; end: number } | null {
  let start = -1;
  let end = -1;
  let bestStart = -1;
  let bestEnd = -1;
  let bestLen = 0;

  for (let i = 0; i < density.length; i++) {
    if (density[i] >= threshold) {
      if (start === -1) start = i;
      end = i;
    } else {
      if (start !== -1) {
        const len = end - start;
        if (len > bestLen) {
          bestLen = len;
          bestStart = start;
          bestEnd = end;
        }
        start = -1;
      }
    }
  }
  // Check final run
  if (start !== -1) {
    const len = end - start;
    if (len > bestLen) {
      bestStart = start;
      bestEnd = end;
    }
  }

  if (bestStart === -1) return null;
  return { start: bestStart, end: bestEnd + 1 };
}

// ── Eye Detection ───────────────────────────────────────────

interface EyePair {
  leftEye: { x: number; y: number };
  rightEye: { x: number; y: number };
}

function detectEyes(
  imageData: ImageData,
  imgW: number,
  _imgH: number,
  bbox: { x: number; y: number; w: number; h: number },
): EyePair | null {
  const d = imageData.data;

  // Eyes are typically in the upper 25-45% of the face region
  const eyeTop = Math.round(bbox.y + bbox.h * 0.2);
  const eyeBottom = Math.round(bbox.y + bbox.h * 0.45);
  const eyeLeft = bbox.x;
  const eyeRight = bbox.x + bbox.w;

  if (eyeBottom <= eyeTop || eyeRight <= eyeLeft) return null;

  // Build darkness map for the eye search region
  const regionW = eyeRight - eyeLeft;
  const regionH = eyeBottom - eyeTop;
  const darknessMap = new Float32Array(regionW * regionH);

  for (let y = 0; y < regionH; y++) {
    for (let x = 0; x < regionW; x++) {
      const px = (eyeTop + y) * imgW + (eyeLeft + x);
      const idx = px * 4;
      const r = d[idx], g = d[idx + 1], b = d[idx + 2];
      // Darkness = inverse luminance, weighted toward dark features
      const lum = 0.299 * r + 0.587 * g + 0.114 * b;
      // Also boost contrast (eyes have high local contrast)
      darknessMap[y * regionW + x] = 255 - lum;
    }
  }

  // Apply gaussian-like blur to smooth noise
  const blurred = boxBlur(darknessMap, regionW, regionH, 3);

  // Split into left and right halves to find each eye
  const midX = Math.round(regionW / 2);

  const leftEyeLocal = findDarkestBlob(blurred, regionW, regionH, 0, midX);
  const rightEyeLocal = findDarkestBlob(blurred, regionW, regionH, midX, regionW);

  if (!leftEyeLocal || !rightEyeLocal) return null;

  // Convert to global image coordinates
  const leftEye = { x: eyeLeft + leftEyeLocal.x, y: eyeTop + leftEyeLocal.y };
  const rightEye = { x: eyeLeft + rightEyeLocal.x, y: eyeTop + rightEyeLocal.y };

  // Validate: eyes should be roughly symmetric and properly spaced
  const eyeDist = Math.sqrt((rightEye.x - leftEye.x) ** 2 + (rightEye.y - leftEye.y) ** 2);
  const expectedDist = bbox.w * 0.35;

  if (eyeDist < expectedDist * 0.4 || eyeDist > expectedDist * 2.5) return null;

  // Reject if angle is too extreme (> 30°)
  const angle = Math.abs(Math.atan2(rightEye.y - leftEye.y, rightEye.x - leftEye.x));
  if (angle > Math.PI / 6) return null;

  return { leftEye, rightEye };
}

function boxBlur(data: Float32Array, w: number, h: number, radius: number): Float32Array {
  const result = new Float32Array(w * h);
  const size = (radius * 2 + 1) ** 2;

  for (let y = radius; y < h - radius; y++) {
    for (let x = radius; x < w - radius; x++) {
      let sum = 0;
      for (let dy = -radius; dy <= radius; dy++) {
        for (let dx = -radius; dx <= radius; dx++) {
          sum += data[(y + dy) * w + (x + dx)];
        }
      }
      result[y * w + x] = sum / size;
    }
  }
  return result;
}

function findDarkestBlob(
  data: Float32Array,
  w: number,
  h: number,
  xStart: number,
  xEnd: number,
): { x: number; y: number } | null {
  // Find the center of mass of the darkest region (highest values in darkness map)
  // Use a sliding window approach
  const winSize = Math.max(5, Math.round(Math.min(w, h) * 0.1));
  let bestScore = 0;
  let bestX = 0;
  let bestY = 0;

  for (let y = winSize; y < h - winSize; y += 2) {
    for (let x = Math.max(xStart, winSize); x < Math.min(xEnd, w - winSize); x += 2) {
      let score = 0;
      for (let dy = -winSize; dy <= winSize; dy += 2) {
        for (let dx = -winSize; dx <= winSize; dx += 2) {
          score += data[(y + dy) * w + (x + dx)];
        }
      }
      if (score > bestScore) {
        bestScore = score;
        bestX = x;
        bestY = y;
      }
    }
  }

  if (bestScore === 0) return null;
  return { x: bestX, y: bestY };
}

// ── Rotation & Cropping ─────────────────────────────────────

function rotateAndCrop(
  source: HTMLCanvasElement,
  bbox: { x: number; y: number; w: number; h: number },
  angle: number,
): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = OUTPUT_SIZE;
  canvas.height = OUTPUT_SIZE;
  const ctx = canvas.getContext('2d')!;

  // Center of the face bounding box
  const cx = bbox.x + bbox.w / 2;
  const cy = bbox.y + bbox.h / 2;

  // Expand bbox slightly to include forehead and chin
  const expandY = bbox.h * 0.15;
  const expandX = bbox.w * 0.1;
  const cropW = bbox.w + expandX * 2;
  const cropH = bbox.h + expandY * 2;
  const cropSize = Math.max(cropW, cropH);

  // Scale factor to fill output
  const scale = OUTPUT_SIZE / cropSize;

  ctx.save();
  ctx.translate(OUTPUT_SIZE / 2, OUTPUT_SIZE / 2);
  ctx.rotate(-angle);
  ctx.scale(scale, scale);
  ctx.translate(-cx, -cy);
  ctx.drawImage(source, 0, 0);
  ctx.restore();

  return canvas;
}

// ── Fallback ────────────────────────────────────────────────

function fallbackCrop(source: HTMLCanvasElement): HTMLCanvasElement {
  // Center crop at 70% — matches legacy behavior
  const cropRatio = 0.70;
  const cropSize = Math.round(source.width * cropRatio);
  const offset = Math.round((source.width - cropSize) / 2);

  const canvas = document.createElement('canvas');
  canvas.width = OUTPUT_SIZE;
  canvas.height = OUTPUT_SIZE;
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(source, offset, offset, cropSize, cropSize, 0, 0, OUTPUT_SIZE, OUTPUT_SIZE);
  return canvas;
}

// ── Landmark Construction ───────────────────────────────────

function buildLandmarks(
  eyes: EyePair,
  bbox: { x: number; y: number; w: number; h: number },
): FaceLandmarks {
  const eyeMidX = (eyes.leftEye.x + eyes.rightEye.x) / 2;
  const eyeMidY = (eyes.leftEye.y + eyes.rightEye.y) / 2;

  return {
    leftEye: eyes.leftEye,
    rightEye: eyes.rightEye,
    noseCenter: {
      x: eyeMidX,
      y: eyeMidY + bbox.h * 0.2,
    },
    mouthCenter: {
      x: eyeMidX,
      y: eyeMidY + bbox.h * 0.38,
    },
    boundingBox: bbox,
  };
}
