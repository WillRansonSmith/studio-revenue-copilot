"use client";

import type { ClassSession } from "@/lib/data";

interface SessionsTableProps {
  sessions: ClassSession[];
  maxRows?: number;
}

export function SessionsTable({ sessions, maxRows = 50 }: SessionsTableProps) {
  const rows = sessions.slice(0, maxRows);
  return (
    <div className="overflow-x-auto rounded-xl border border-zinc-200 bg-white dark:border-zinc-700 dark:bg-zinc-900">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800">
            <th className="px-4 py-3 font-medium text-zinc-700 dark:text-zinc-300">Date</th>
            <th className="px-4 py-3 font-medium text-zinc-700 dark:text-zinc-300">Instructor</th>
            <th className="px-4 py-3 font-medium text-zinc-700 dark:text-zinc-300">Class</th>
            <th className="px-4 py-3 font-medium text-zinc-700 dark:text-zinc-300">Slot</th>
            <th className="px-4 py-3 font-medium text-zinc-700 dark:text-zinc-300">Price</th>
            <th className="px-4 py-3 font-medium text-zinc-700 dark:text-zinc-300">Fill</th>
            <th className="px-4 py-3 font-medium text-zinc-700 dark:text-zinc-300">Revenue</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((s) => {
            const fillPct = s.capacity ? ((s.booked / s.capacity) * 100).toFixed(0) : "0";
            return (
              <tr
                key={s.id}
                className="border-b border-zinc-100 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
              >
                <td className="px-4 py-2 text-zinc-600 dark:text-zinc-400">{s.date}</td>
                <td className="px-4 py-2 font-medium text-zinc-900 dark:text-zinc-100">
                  {s.instructorName}
                </td>
                <td className="px-4 py-2 capitalize text-zinc-700 dark:text-zinc-300">
                  {s.classType}
                </td>
                <td className="px-4 py-2 capitalize text-zinc-600 dark:text-zinc-400">
                  {s.timeSlot}
                </td>
                <td className="px-4 py-2 tabular-nums text-zinc-700 dark:text-zinc-300">
                  ${s.actualPrice}
                </td>
                <td className="px-4 py-2 tabular-nums text-zinc-700 dark:text-zinc-300">
                  {fillPct}%
                </td>
                <td className="px-4 py-2 tabular-nums text-zinc-700 dark:text-zinc-300">
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
