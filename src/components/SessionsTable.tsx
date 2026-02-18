"use client";

import type { ClassSession } from "@/lib/data";

interface SessionsTableProps {
  sessions: ClassSession[];
  maxRows?: number;
}

export function SessionsTable({ sessions, maxRows = 50 }: SessionsTableProps) {
  const rows = sessions.slice(0, maxRows);
  return (
    <div className="overflow-x-auto rounded-xl border border-zinc-200/80 bg-white shadow-sm dark:border-zinc-700/80 dark:bg-zinc-900">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="sticky top-0 z-10 border-b border-zinc-200 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800/90">
            <th className="whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Date</th>
            <th className="whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Instructor</th>
            <th className="whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Class</th>
            <th className="whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Slot</th>
            <th className="whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Price</th>
            <th className="whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Fill</th>
            <th className="whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Revenue</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((s, idx) => {
            const fillPct = s.capacity ? ((s.booked / s.capacity) * 100).toFixed(0) : "0";
            const fillNum = Number(fillPct);
            return (
              <tr
                key={s.id}
                className={`border-b border-zinc-100 transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-800/50 ${
                  idx % 2 === 1 ? "bg-zinc-50/50 dark:bg-zinc-800/20" : ""
                }`}
              >
                <td className="whitespace-nowrap px-4 py-2.5 text-zinc-500 dark:text-zinc-400">{s.date}</td>
                <td className="whitespace-nowrap px-4 py-2.5 font-medium text-zinc-900 dark:text-zinc-100">
                  {s.instructorName}
                </td>
                <td className="whitespace-nowrap px-4 py-2.5 capitalize text-zinc-600 dark:text-zinc-300">
                  {s.classType}
                </td>
                <td className="whitespace-nowrap px-4 py-2.5 capitalize text-zinc-500 dark:text-zinc-400">
                  {s.timeSlot}
                </td>
                <td className="whitespace-nowrap px-4 py-2.5 tabular-nums text-zinc-600 dark:text-zinc-300">
                  ${s.actualPrice}
                </td>
                <td className="whitespace-nowrap px-4 py-2.5 tabular-nums">
                  <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                    fillNum >= 85
                      ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400"
                      : fillNum >= 60
                        ? "bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400"
                        : "bg-red-50 text-red-700 dark:bg-red-950/50 dark:text-red-400"
                  }`}>
                    {fillPct}%
                  </span>
                </td>
                <td className="whitespace-nowrap px-4 py-2.5 tabular-nums font-medium text-zinc-700 dark:text-zinc-300">
                  ${s.revenue.toLocaleString()}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
