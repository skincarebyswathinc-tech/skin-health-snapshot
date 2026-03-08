import { useState } from 'react';

interface DataPoint {
  label: string;
  value: number;
}

interface ProgressLineChartProps {
  data: DataPoint[];
  height?: number;
  color?: string;
  showDots?: boolean;
  showTooltip?: boolean;
}

export default function ProgressLineChart({
  data,
  height = 200,
  color = 'hsl(var(--teal))',
  showDots = true,
  showTooltip = true,
}: ProgressLineChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  if (data.length === 0) return null;

  const padding = { top: 20, right: 20, bottom: 30, left: 40 };
  const width = 600;
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  const values = data.map(d => d.value);
  const minVal = Math.max(0, Math.min(...values) - 10);
  const maxVal = Math.min(100, Math.max(...values) + 10);
  const range = maxVal - minVal || 1;

  const points = data.map((d, i) => ({
    x: padding.left + (data.length > 1 ? (i / (data.length - 1)) * chartW : chartW / 2),
    y: padding.top + chartH - ((d.value - minVal) / range) * chartH,
    ...d,
  }));

  // Smooth SVG path using cubic bezier
  const pathD = points.length === 1
    ? ''
    : points.reduce((acc, pt, i) => {
        if (i === 0) return `M ${pt.x} ${pt.y}`;
        const prev = points[i - 1];
        const cpx = (prev.x + pt.x) / 2;
        return `${acc} C ${cpx} ${prev.y}, ${cpx} ${pt.y}, ${pt.x} ${pt.y}`;
      }, '');

  // Gradient area
  const areaD = pathD
    ? `${pathD} L ${points[points.length - 1].x} ${padding.top + chartH} L ${points[0].x} ${padding.top + chartH} Z`
    : '';

  // Y-axis labels
  const yTicks = 5;
  const yLabels = Array.from({ length: yTicks }, (_, i) => Math.round(minVal + (range / (yTicks - 1)) * i));

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="w-full"
      style={{ maxHeight: height }}
    >
      <defs>
        <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.15" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Grid lines */}
      {yLabels.map((val, i) => {
        const y = padding.top + chartH - ((val - minVal) / range) * chartH;
        return (
          <g key={i}>
            <line x1={padding.left} y1={y} x2={width - padding.right} y2={y} stroke="hsl(var(--border))" strokeWidth="1" />
            <text x={padding.left - 8} y={y + 4} textAnchor="end" fontSize="10" fill="hsl(var(--muted-foreground))">{val}</text>
          </g>
        );
      })}

      {/* Area */}
      {areaD && <path d={areaD} fill="url(#areaGrad)" />}

      {/* Line */}
      {pathD && (
        <path d={pathD} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      )}

      {/* Dots & labels */}
      {points.map((pt, i) => (
        <g
          key={i}
          onMouseEnter={() => setHoveredIndex(i)}
          onMouseLeave={() => setHoveredIndex(null)}
          style={{ cursor: 'pointer' }}
        >
          {showDots && (
            <circle cx={pt.x} cy={pt.y} r={hoveredIndex === i ? 6 : 4} fill={color} stroke="hsl(var(--card))" strokeWidth="2">
              {hoveredIndex === i && (
                <animate attributeName="r" from="4" to="6" dur="0.15s" fill="freeze" />
              )}
            </circle>
          )}
          {/* X-axis label */}
          <text x={pt.x} y={height - 6} textAnchor="middle" fontSize="10" fill="hsl(var(--muted-foreground))">{pt.label}</text>

          {/* Tooltip */}
          {showTooltip && hoveredIndex === i && (
            <g>
              <rect x={pt.x - 30} y={pt.y - 32} width="60" height="22" rx="6" fill="hsl(var(--foreground))" opacity="0.9" />
              <text x={pt.x} y={pt.y - 17} textAnchor="middle" fontSize="11" fontWeight="600" fill="hsl(var(--background))">{pt.value}</text>
            </g>
          )}
        </g>
      ))}
    </svg>
  );
}
