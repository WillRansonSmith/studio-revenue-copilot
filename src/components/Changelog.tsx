"use client";

import type { ChangelogEntry } from "@/lib/data";

interface ChangelogProps {
  entries: ChangelogEntry[];
}

export function Changelog({ entries }: ChangelogProps) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-900">
      <h3 className="mb-3 text-sm font-semibold text-zinc-800 dark:text-zinc-200">
        Last 4 weeks
      </h3>
      <ul className="space-y-2">
        {entries.map((e, i) => (
          <li key={i} className="flex flex-wrap items-baseline gap-2 text-sm">
            <span className="font-medium text-zinc-700 dark:text-zinc-300">{e.metric}</span>
            <span className="text-zinc-600 dark:text-zinc-400">{e.change}</span>
            {e.detail && (
              <span className="text-xs text-zinc-500 dark:text-zinc-500">{e.detail}</span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
