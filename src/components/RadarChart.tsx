interface RadarChartProps {
  data: { label: string; value: number }[];
  size?: number;
  max?: number;
}

export default function RadarChart({ data, size = 320, max = 100 }: RadarChartProps) {
  const center = size / 2;
  const radius = size / 2 - 56;
  const n = data.length;
  const angleStep = (Math.PI * 2) / n;

  const pointAt = (i: number, r: number) => {
    const angle = -Math.PI / 2 + i * angleStep;
    return [center + r * Math.cos(angle), center + r * Math.sin(angle)];
  };

  const rings = [0.25, 0.5, 0.75, 1];

  const dataPoints = data.map((d, i) => pointAt(i, (d.value / max) * radius));
  const polygon = dataPoints.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ');

  return (
    <svg width={size} height={size} className="overflow-visible">
      <defs>
        <radialGradient id="radarFill" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#14b8a6" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#0f766e" stopOpacity="0.18" />
        </radialGradient>
      </defs>

      {/* rings */}
      {rings.map((r, idx) => {
        const pts = data.map((_, i) => pointAt(i, radius * r).map((v) => v.toFixed(1)).join(',')).join(' ');
        return (
          <polygon
            key={idx}
            points={pts}
            fill="none"
            stroke="#e7e5e4"
            strokeWidth={1}
            strokeDasharray={idx === rings.length - 1 ? '0' : '3 3'}
          />
        );
      })}

      {/* axes */}
      {data.map((_, i) => {
        const [x, y] = pointAt(i, radius);
        return <line key={i} x1={center} y1={center} x2={x} y2={y} stroke="#e7e5e4" strokeWidth={1} />;
      })}

      {/* data polygon */}
      <polygon
        points={polygon}
        fill="url(#radarFill)"
        stroke="#0f766e"
        strokeWidth={2}
        strokeLinejoin="round"
        style={{ transition: 'all 0.6s cubic-bezier(0.22,1,0.36,1)' }}
      />

      {/* data points */}
      {dataPoints.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={3.5} fill="#fff" stroke="#0f766e" strokeWidth={2} />
      ))}

      {/* labels */}
      {data.map((d, i) => {
        const [x, y] = pointAt(i, radius + 26);
        const anchor = Math.abs(x - center) < 4 ? 'middle' : x > center ? 'start' : 'end';
        return (
          <g key={i}>
            <text
              x={x}
              y={y}
              textAnchor={anchor}
              dominantBaseline="middle"
              className="fill-ink-soft"
              style={{ fontSize: 12, fontWeight: 500 }}
            >
              {d.label}
            </text>
            <text
              x={x}
              y={y + 14}
              textAnchor={anchor}
              dominantBaseline="middle"
              className="fill-teal"
              style={{ fontSize: 11, fontWeight: 600 }}
            >
              {d.value}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
