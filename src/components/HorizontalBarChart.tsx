"use client";

interface BarDatum {
  label: string;
  value: number;
}

interface HorizontalBarChartProps {
  title: string;
  subtitle?: string;
  data: BarDatum[];
  valueFormatter?: (n: number) => string;
  maxBars?: number;
}

function toTitleCase(s: string): string {
  return s.replace(/\b\w/g, (c) => c.toUpperCase());
}

function compactUSD(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}k`;
  return `$${n}`;
}

const TICK_PCTS = [0, 25, 50, 75, 100];

export function HorizontalBarChart({
  title,
  subtitle,
  data,
  valueFormatter = compactUSD,
  maxBars = 8,
}: HorizontalBarChartProps) {
  const sorted = [...data].sort((a, b) => b.value - a.value).slice(0, maxBars);
  const max = Math.max(1, ...sorted.map((d) => d.value));

  return (
    <div className="rounded-xl border border-zinc-200/80 bg-white p-5 shadow-sm dark:border-zinc-700/80 dark:bg-zinc-900">
      <div className="mb-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
          {title}
        </p>
        {subtitle && (
          <p className="mt-0.5 text-[10px] text-zinc-400 dark:text-zinc-500">
            {subtitle}
          </p>
        )}
      </div>

      <div className="space-y-2.5">
        {sorted.map((d) => {
          const pct = (d.value / max) * 100;
          const fullValue = `$${d.value.toLocaleString()}`;
          const label = toTitleCase(d.label);

          return (
            <div
              key={d.label}
              className="grid items-center gap-3"
              style={{ gridTemplateColumns: "5.5rem 1fr 3.5rem" }}
              title={`${label}: ${fullValue}`}
            >
              {/* Label */}
              <span className="truncate text-xs font-medium text-zinc-600 dark:text-zinc-400">
                {label}
              </span>

              {/* Bar track */}
              <div className="relative h-5 w-full overflow-hidden rounded-md bg-zinc-100 dark:bg-zinc-800">
                {/* Tick marks */}
                {TICK_PCTS.map((t) => (
                  <div
                    key={t}
                    className="absolute top-0 h-full w-px bg-zinc-200/70 dark:bg-zinc-700/50"
                    style={{ left: `${t}%` }}
                  />
                ))}

                {/* Value bar */}
                <div
                  className="absolute inset-y-0 left-0 rounded-md bg-emerald-500 transition-all duration-300 dark:bg-emerald-500"
                  style={{
                    width: `${pct}%`,
                    backgroundImage:
                      "linear-gradient(to right, rgb(16 185 129), rgb(5 150 105))",
                  }}
                />
              </div>

              {/* Value */}
              <span className="text-right text-xs font-semibold tabular-nums text-zinc-700 dark:text-zinc-300">
                {valueFormatter(d.value)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
