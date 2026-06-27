import { useState } from 'react';

interface Series {
  topic: string;
  values: number[];
  color: string;
}

interface LineChartProps {
  labels: string[];
  series: Series[];
  height?: number;
}

export default function LineChart({ labels, series, height = 260 }: LineChartProps) {
  const [hover, setHover] = useState<{ x: number; i: number } | null>(null);
  const width = 720;
  const padX = 44;
  const padY = 28;
  const innerW = width - padX * 2;
  const innerH = height - padY * 2;
  const max = 100;

  const xFor = (i: number) => padX + (innerW * i) / (labels.length - 1);
  const yFor = (v: number) => padY + innerH - (v / max) * innerH;

  const gridY = [0, 25, 50, 75, 100];

  return (
    <div className="w-full overflow-x-auto">
      <svg
        width={width}
        height={height}
        onMouseLeave={() => setHover(null)}
        className="min-w-full"
      >
        {/* grid */}
        {gridY.map((g) => (
          <g key={g}>
            <line
              x1={padX}
              y1={yFor(g)}
              x2={width - padX}
              y2={yFor(g)}
              stroke="#efe9dd"
              strokeWidth={1}
              strokeDasharray={g === 0 ? '0' : '4 4'}
            />
            <text x={padX - 10} y={yFor(g)} textAnchor="end" dominantBaseline="middle" className="fill-ink-faint" style={{ fontSize: 10 }}>
              {g}
            </text>
          </g>
        ))}

        {/* x labels */}
        {labels.map((l, i) => (
          <text key={i} x={xFor(i)} y={height - 8} textAnchor="middle" className="fill-ink-muted" style={{ fontSize: 11 }}>
            {l}
          </text>
        ))}

        {/* series */}
        {series.map((s) => {
          const path = s.values.map((v, i) => `${i === 0 ? 'M' : 'L'} ${xFor(i)} ${yFor(v)}`).join(' ');
          const area = `${path} L ${xFor(s.values.length - 1)} ${yFor(0)} L ${xFor(0)} ${yFor(0)} Z`;
          return (
            <g key={s.topic}>
              <path d={area} fill={s.color} opacity={0.08} />
              <path d={path} fill="none" stroke={s.color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
              {s.values.map((v, i) => (
                <circle key={i} cx={xFor(i)} cy={yFor(v)} r={3.5} fill="#fff" stroke={s.color} strokeWidth={2} />
              ))}
            </g>
          );
        })}

        {/* hover line */}
        {hover && (
          <g>
            <line x1={hover.x} y1={padY} x2={hover.x} y2={height - padY} stroke="#a8a29e" strokeWidth={1} strokeDasharray="4 4" />
            {series.map((s) => (
              <g key={s.topic}>
                <circle cx={hover.x} cy={yFor(s.values[hover.i])} r={5} fill={s.color} />
                <rect
                  x={hover.x + 8}
                  y={yFor(s.values[hover.i]) - 12}
                  width={s.topic.length * 8 + 32}
                  height={24}
                  rx={6}
                  fill="#1c1917"
                />
                <text
                  x={hover.x + 14}
                  y={yFor(s.values[hover.i])}
                  dominantBaseline="middle"
                  className="fill-paper"
                  style={{ fontSize: 11 }}
                >
                  {s.topic} {s.values[hover.i]}
                </text>
              </g>
            ))}
          </g>
        )}

        {/* hover capture */}
        {labels.map((_, i) => (
          <rect
            key={i}
            x={xFor(i) - innerW / (labels.length - 1) / 2}
            y={padY}
            width={innerW / (labels.length - 1)}
            height={innerH}
            fill="transparent"
            onMouseEnter={() => setHover({ x: xFor(i), i })}
          />
        ))}
      </svg>

      {/* legend */}
      <div className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-2 pl-11">
        {series.map((s) => (
          <div key={s.topic} className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: s.color }} />
            <span className="text-xs text-ink-soft">{s.topic}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
