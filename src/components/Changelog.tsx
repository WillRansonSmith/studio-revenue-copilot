"use client";

import type { ChangelogEntry } from "@/lib/data";

interface ChangelogProps {
  entries: ChangelogEntry[];
}

export function Changelog({ entries }: ChangelogProps) {
  return (
    <div className="rounded-xl border border-zinc-200/80 bg-white p-5 shadow-sm dark:border-zinc-700/80 dark:bg-zinc-900">
      <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
        Last 4 weeks
      </h3>
      <ul className="space-y-3">
        {entries.map((e, i) => {
          const isPositive = e.change.includes("+") || e.change.toLowerCase().includes("up");
          const isNegative = e.change.includes("-") || e.change.toLowerCase().includes("down");
          return (
            <li
              key={i}
              className="flex flex-wrap items-baseline gap-2 rounded-lg border border-zinc-100 bg-zinc-50/50 px-3 py-2 text-sm dark:border-zinc-800 dark:bg-zinc-800/30"
            >
              <span className="font-medium text-zinc-700 dark:text-zinc-300">{e.metric}</span>
              <span
                className={
                  isPositive
                    ? "font-medium text-emerald-600 dark:text-emerald-400"
                    : isNegative
                      ? "font-medium text-red-500 dark:text-red-400"
                      : "text-zinc-500 dark:text-zinc-400"
                }
              >
                {e.change}
              </span>
              {e.detail && (
                <span className="text-xs text-zinc-400 dark:text-zinc-500">{e.detail}</span>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
