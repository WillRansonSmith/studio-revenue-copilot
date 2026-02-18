"use client";

/** Simple SVG bar chart: label + value pairs, no extra deps. */
interface SimpleChartProps {
  title: string;
  data: { label: string; value: number }[];
  valueFormat?: (n: number) => string;
  maxBars?: number;
}

export function SimpleChart({
  title,
  data,
  valueFormat = (n) => n.toLocaleString(),
  maxBars = 8,
}: SimpleChartProps) {
  const slice = data.slice(0, maxBars);
  const max = Math.max(1, ...slice.map((d) => d.value));
  const w = 200;
  const h = 120;
  const barH = 10;
  const gap = 4;

  return (
    <div className="rounded-xl border border-zinc-200/80 bg-white p-5 shadow-sm dark:border-zinc-700/80 dark:bg-zinc-900">
      <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
        {title}
      </p>
      <svg width="100%" viewBox={`0 0 ${w} ${h}`} className="min-h-[120px]">
        {slice.map((d, i) => {
          const barW = (d.value / max) * (w - 60);
          const y = 8 + i * (barH + gap);
          return (
            <g key={d.label}>
              <text x="0" y={y + barH - 2} className="fill-zinc-500 text-[10px] dark:fill-zinc-400">
                {d.label.length > 10 ? d.label.slice(0, 10) + "…" : d.label}
              </text>
              <rect
                x="52"
                y={y}
                width={barW}
                height={barH}
                rx="3"
                className="fill-emerald-500 dark:fill-emerald-500"
              />
              <text
                x={56 + barW}
                y={y + barH - 2}
                className="fill-zinc-500 text-[10px] font-medium dark:fill-zinc-400"
              >
                {valueFormat(d.value)}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
