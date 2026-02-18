import type { ReactNode } from "react";

interface KPIProps {
  label: string;
  value: string | number;
  sub?: string;
  icon?: ReactNode;
}

export function KPI({ label, value, sub, icon }: KPIProps) {
  return (
    <div className="rounded-xl border border-zinc-200/80 bg-white p-5 shadow-sm transition-shadow hover:shadow-md dark:border-zinc-700/80 dark:bg-zinc-900">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            {label}
          </p>
          <p className="mt-2 text-2xl font-bold tabular-nums text-zinc-900 dark:text-zinc-100">
            {value}
          </p>
          {sub != null && (
            <p className="mt-1 text-xs text-zinc-400 dark:text-zinc-500">{sub}</p>
          )}
        </div>
        {icon && (
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
