import { useRef, useState, useEffect, useCallback } from 'react';

type HeatmapLayer = 'inflammation' | 'pigmentation' | 'hydration';

interface SkinHeatmapProps {
  imageUrl: string;
  inflammationScore: number;
  pigmentationScore: number;
  hydrationScore: number;
}

interface LayerConfig {
  key: HeatmapLayer;
  label: string;
  color: string;
  dotColor: string;
  score: number;
}

export default function SkinHeatmap({
  imageUrl,
  inflammationScore,
  pigmentationScore,
  hydrationScore,
}: SkinHeatmapProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const [activeLayers, setActiveLayers] = useState<Set<HeatmapLayer>>(new Set());
  const [loaded, setLoaded] = useState(false);
  const [opacity, setOpacity] = useState(0);

  const layers: LayerConfig[] = [
    { key: 'inflammation', label: 'Inflammation', color: 'rgba(220, 60, 60, 0.35)', dotColor: 'hsl(0, 60%, 55%)', score: inflammationScore },
    { key: 'pigmentation', label: 'Pigmentation', color: 'rgba(220, 180, 40, 0.35)', dotColor: 'hsl(45, 75%, 50%)', score: pigmentationScore },
    { key: 'hydration', label: 'Hydration', color: 'rgba(60, 140, 220, 0.35)', dotColor: 'hsl(210, 65%, 55%)', score: hydrationScore },
  ];

  // Load image
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      imgRef.current = img;
      setLoaded(true);
    };
    img.onerror = () => {
      const img2 = new Image();
      img2.onload = () => { imgRef.current = img2; setLoaded(true); };
      img2.src = imageUrl;
    };
    img.src = imageUrl;
  }, [imageUrl]);

  // Fade in when layers toggle
  useEffect(() => {
    setOpacity(0);
    const raf = requestAnimationFrame(() => setOpacity(1));
    return () => cancelAnimationFrame(raf);
  }, [activeLayers]);

  // Draw heatmap
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const img = imgRef.current;
    if (!canvas || !img) return;

    const dpr = window.devicePixelRatio || 1;
    const displayW = canvas.clientWidth;
    const displayH = canvas.clientHeight;
    canvas.width = displayW * dpr;
    canvas.height = displayH * dpr;

    const ctx = canvas.getContext('2d')!;
    ctx.scale(dpr, dpr);

    // Draw base image
    const imgAspect = img.width / img.height;
    const canvasAspect = displayW / displayH;
    let drawW: number, drawH: number, drawX: number, drawY: number;

    if (imgAspect > canvasAspect) {
      drawH = displayH;
      drawW = displayH * imgAspect;
      drawX = (displayW - drawW) / 2;
      drawY = 0;
    } else {
      drawW = displayW;
      drawH = displayW / imgAspect;
      drawX = 0;
      drawY = (displayH - drawH) / 2;
    }

    ctx.drawImage(img, drawX, drawY, drawW, drawH);

    // Draw active heatmap layers
    if (activeLayers.size === 0) return;

    const activeLayerConfigs = layers.filter(l => activeLayers.has(l.key));

    for (const layer of activeLayerConfigs) {
      drawHeatmapLayer(ctx, displayW, displayH, drawX, drawY, drawW, drawH, layer);
    }

    // Draw healthy green overlay for areas not covered by issue layers
    if (activeLayers.size > 0) {
      drawHealthyOverlay(ctx, displayW, displayH, drawX, drawY, drawW, drawH, activeLayerConfigs);
    }
  }, [loaded, activeLayers, inflammationScore, pigmentationScore, hydrationScore]);

  useEffect(() => {
    if (loaded) draw();
  }, [loaded, draw]);

  // Also redraw on resize
  useEffect(() => {
    if (!loaded) return;
    const handleResize = () => draw();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [loaded, draw]);

  const toggleLayer = (key: HeatmapLayer) => {
    setActiveLayers(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  return (
    <div className="glass-panel">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-section-title">Skin Heatmap</h2>
        <span className="text-micro text-muted-foreground">Toggle layers below</span>
      </div>

      {/* Canvas */}
      <div
        className="relative mb-5 overflow-hidden rounded-xl"
        style={{ background: 'hsl(var(--muted))', aspectRatio: '1 / 1', maxHeight: '400px' }}
      >
        <canvas
          ref={canvasRef}
          className="h-full w-full"
          style={{
            opacity: loaded ? 1 : 0,
            transition: 'opacity 0.4s ease',
          }}
        />
        {!loaded && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-6 w-6 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: 'hsl(var(--teal))', borderTopColor: 'transparent' }} />
          </div>
        )}

        {/* Overlay fade transition */}
        {activeLayers.size > 0 && (
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              opacity: opacity,
              transition: 'opacity 0.5s ease',
            }}
          />
        )}
      </div>

      {/* Layer toggles */}
      <div className="mb-4 flex flex-wrap gap-2">
        {layers.map(layer => {
          const active = activeLayers.has(layer.key);
          const severity = 100 - layer.score;
          return (
            <button
              key={layer.key}
              onClick={() => toggleLayer(layer.key)}
              className="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all duration-200"
              style={{
                background: active ? layer.dotColor : 'hsl(var(--muted))',
                color: active ? '#fff' : 'hsl(var(--foreground))',
                opacity: active ? 1 : 0.7,
                transform: active ? 'scale(1.02)' : 'scale(1)',
              }}
            >
              <span
                className="inline-block h-3 w-3 rounded-full"
                style={{
                  background: active ? '#fff' : layer.dotColor,
                  opacity: active ? 0.8 : 1,
                }}
              />
              {layer.label}
              <span className="text-xs" style={{ opacity: 0.8 }}>
                {severity > 40 ? '⚠' : '✓'}
              </span>
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="rounded-xl p-4" style={{ background: 'hsl(var(--muted))' }}>
        <p className="text-micro font-medium text-muted-foreground mb-2 uppercase tracking-wider">Legend</p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {[
            { color: 'hsl(0, 60%, 55%)', label: 'Inflammation', desc: 'Redness signals' },
            { color: 'hsl(45, 75%, 50%)', label: 'Pigmentation', desc: 'Uneven tone' },
            { color: 'hsl(210, 65%, 55%)', label: 'Dryness', desc: 'Low hydration' },
            { color: 'hsl(150, 50%, 50%)', label: 'Healthy', desc: 'Good condition' },
          ].map(item => (
            <div key={item.label} className="flex items-start gap-2">
              <span
                className="mt-0.5 inline-block h-3 w-3 shrink-0 rounded-sm"
                style={{ background: item.color }}
              />
              <div>
                <p className="text-xs font-medium" style={{ color: 'hsl(var(--foreground))' }}>{item.label}</p>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Heatmap Drawing ─────────────────────────────────────────

function drawHeatmapLayer(
  ctx: CanvasRenderingContext2D,
  canvasW: number,
  canvasH: number,
  imgX: number,
  imgY: number,
  imgW: number,
  imgH: number,
  layer: LayerConfig,
) {
  // Severity: lower score = more intense overlay
  const severity = (100 - layer.score) / 100;
  const baseAlpha = 0.15 + severity * 0.3;

  // Generate deterministic hotspot positions based on layer type
  const hotspots = generateHotspots(layer.key, imgX, imgY, imgW, imgH, severity);

  for (const spot of hotspots) {
    const gradient = ctx.createRadialGradient(
      spot.x, spot.y, 0,
      spot.x, spot.y, spot.radius,
    );

    const [r, g, b] = layerRGB(layer.key);
    gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${baseAlpha * spot.intensity})`);
    gradient.addColorStop(0.5, `rgba(${r}, ${g}, ${b}, ${baseAlpha * spot.intensity * 0.5})`);
    gradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);

    ctx.fillStyle = gradient;
    ctx.fillRect(spot.x - spot.radius, spot.y - spot.radius, spot.radius * 2, spot.radius * 2);
  }
}

function drawHealthyOverlay(
  ctx: CanvasRenderingContext2D,
  canvasW: number,
  canvasH: number,
  imgX: number,
  imgY: number,
  imgW: number,
  imgH: number,
  activeConfigs: LayerConfig[],
) {
  // Light green tint in the center of the face (the "good" areas)
  const avgScore = activeConfigs.reduce((s, l) => s + l.score, 0) / activeConfigs.length;
  const healthAlpha = Math.max(0, (avgScore - 50) / 200);

  if (healthAlpha < 0.02) return;

  const cx = imgX + imgW * 0.5;
  const cy = imgY + imgH * 0.45;
  const r = Math.min(imgW, imgH) * 0.25;

  const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
  gradient.addColorStop(0, `rgba(80, 200, 120, ${healthAlpha})`);
  gradient.addColorStop(1, 'rgba(80, 200, 120, 0)');

  ctx.fillStyle = gradient;
  ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
}

interface Hotspot {
  x: number;
  y: number;
  radius: number;
  intensity: number;
}

function generateHotspots(
  layerKey: HeatmapLayer,
  imgX: number,
  imgY: number,
  imgW: number,
  imgH: number,
  severity: number,
): Hotspot[] {
  const spots: Hotspot[] = [];
  const baseRadius = Math.min(imgW, imgH) * 0.15;

  // Anatomical hotspot regions per layer type
  const regions: Record<HeatmapLayer, Array<{ rx: number; ry: number; size: number }>> = {
    inflammation: [
      // Cheeks, nose, forehead — common inflammation zones
      { rx: 0.3, ry: 0.5, size: 1.0 },
      { rx: 0.7, ry: 0.5, size: 1.0 },
      { rx: 0.5, ry: 0.35, size: 0.7 },
      { rx: 0.5, ry: 0.65, size: 0.5 },
      { rx: 0.35, ry: 0.3, size: 0.6 },
      { rx: 0.65, ry: 0.3, size: 0.6 },
    ],
    pigmentation: [
      // Under-eye, forehead, cheekbones
      { rx: 0.35, ry: 0.45, size: 0.8 },
      { rx: 0.65, ry: 0.45, size: 0.8 },
      { rx: 0.5, ry: 0.25, size: 0.9 },
      { rx: 0.4, ry: 0.6, size: 0.6 },
      { rx: 0.6, ry: 0.6, size: 0.6 },
    ],
    hydration: [
      // Forehead, cheeks, around mouth — common dry zones
      { rx: 0.5, ry: 0.2, size: 1.0 },
      { rx: 0.25, ry: 0.5, size: 0.8 },
      { rx: 0.75, ry: 0.5, size: 0.8 },
      { rx: 0.5, ry: 0.75, size: 0.7 },
      { rx: 0.4, ry: 0.4, size: 0.5 },
      { rx: 0.6, ry: 0.4, size: 0.5 },
    ],
  };

  const layerRegions = regions[layerKey];
  const count = Math.max(2, Math.round(layerRegions.length * severity));

  for (let i = 0; i < Math.min(count, layerRegions.length); i++) {
    const region = layerRegions[i];
    spots.push({
      x: imgX + imgW * region.rx,
      y: imgY + imgH * region.ry,
      radius: baseRadius * region.size * (0.8 + severity * 0.4),
      intensity: 0.5 + severity * 0.5 * region.size,
    });
  }

  return spots;
}

function layerRGB(key: HeatmapLayer): [number, number, number] {
  switch (key) {
    case 'inflammation': return [220, 60, 60];
    case 'pigmentation': return [220, 180, 40];
    case 'hydration': return [60, 140, 220];
  }
}
