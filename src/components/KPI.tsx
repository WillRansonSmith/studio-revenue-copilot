import type { ReactNode } from "react";

interface KPIProps {
  label: string;
  value: string | number;
  sub?: string;
  icon?: ReactNode;
}

export function KPI({ label, value, sub, icon }: KPIProps) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">{label}</p>
          <p className="mt-1 text-2xl font-semibold tabular-nums text-zinc-900 dark:text-zinc-100">
            {value}
          </p>
          {sub != null && (
            <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">{sub}</p>
          )}
        </div>
        {icon && <div className="text-zinc-400">{icon}</div>}
      </div>
    </div>
  );
}
