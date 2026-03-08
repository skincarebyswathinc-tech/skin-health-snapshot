import { useEffect, useState } from 'react';

interface RadarChartProps {
  metrics: { label: string; score: number }[];
  size?: number;
}

export default function RadarChart({ metrics, size = 260 }: RadarChartProps) {
  const [animate, setAnimate] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setAnimate(true), 100);
    return () => clearTimeout(t);
  }, []);

  const cx = size / 2;
  const cy = size / 2;
  const maxR = size * 0.38;
  const levels = 4;
  const count = metrics.length;
  const angleStep = (2 * Math.PI) / count;

  const getPoint = (index: number, radius: number) => {
    const angle = angleStep * index - Math.PI / 2;
    return {
      x: cx + radius * Math.cos(angle),
      y: cy + radius * Math.sin(angle),
    };
  };

  // Grid rings
  const rings = Array.from({ length: levels }, (_, i) => {
    const r = (maxR / levels) * (i + 1);
    const points = Array.from({ length: count }, (_, j) => getPoint(j, r));
    return points.map(p => `${p.x},${p.y}`).join(' ');
  });

  // Axes
  const axes = Array.from({ length: count }, (_, i) => getPoint(i, maxR));

  // Data polygon
  const dataPoints = metrics.map((m, i) => {
    const r = animate ? (m.score / 100) * maxR : 0;
    return getPoint(i, r);
  });
  const dataPolygon = dataPoints.map(p => `${p.x},${p.y}`).join(' ');

  // Label positions
  const labels = metrics.map((m, i) => {
    const p = getPoint(i, maxR + 20);
    return { ...m, x: p.x, y: p.y };
  });

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="mx-auto">
      {/* Grid rings */}
      {rings.map((pts, i) => (
        <polygon
          key={i}
          points={pts}
          fill="none"
          stroke="hsl(var(--border))"
          strokeWidth="1"
          opacity={0.6}
        />
      ))}

      {/* Axes */}
      {axes.map((p, i) => (
        <line
          key={i}
          x1={cx} y1={cy}
          x2={p.x} y2={p.y}
          stroke="hsl(var(--border))"
          strokeWidth="1"
          opacity={0.4}
        />
      ))}

      {/* Data fill */}
      <polygon
        points={dataPolygon}
        fill="hsl(var(--teal) / 0.15)"
        stroke="hsl(var(--teal))"
        strokeWidth="2"
        strokeLinejoin="round"
        style={{ transition: 'all 1s cubic-bezier(0.22, 1, 0.36, 1)' }}
      />

      {/* Data dots */}
      {dataPoints.map((p, i) => (
        <circle
          key={i}
          cx={p.x} cy={p.y}
          r="4"
          fill="hsl(var(--teal))"
          style={{ transition: 'all 1s cubic-bezier(0.22, 1, 0.36, 1)' }}
        />
      ))}

      {/* Labels */}
      {labels.map((l, i) => (
        <text
          key={i}
          x={l.x} y={l.y}
          textAnchor="middle"
          dominantBaseline="central"
          fill="hsl(var(--muted-foreground))"
          fontSize="11"
          fontFamily="inherit"
        >
          {l.label}
        </text>
      ))}
    </svg>
  );
}
