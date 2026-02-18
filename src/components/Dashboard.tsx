"use client";

import { useEffect, useState, useCallback } from "react";
import type { ClassSession, ChangelogEntry } from "@/lib/data";
import { KPI } from "./KPI";
import { SessionsTable } from "./SessionsTable";
import { SimpleChart } from "./SimpleChart";
import { Changelog } from "./Changelog";
import { BarChart3, DollarSign, Users, TrendingUp } from "lucide-react";

interface DashboardData {
  sessions: ClassSession[];
  changelog: ChangelogEntry[];
}

export function Dashboard({
  onRegenerate,
  regenerating,
}: {
  onRegenerate: () => void;
  regenerating: boolean;
}) {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/data");
      const json = await res.json();
      setData({ sessions: json.sessions ?? [], changelog: json.changelog ?? [] });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading || !data) {
    return (
      <div className="flex min-h-[320px] items-center justify-center text-zinc-500">
        Loading…
      </div>
    );
  }

  const { sessions, changelog } = data;
  const totalRevenue = sessions.reduce((a, s) => a + s.revenue, 0);
  const totalCapacity = sessions.reduce((a, s) => a + s.capacity, 0);
  const totalBooked = sessions.reduce((a, s) => a + s.booked, 0);
  const fillRate = totalCapacity ? ((totalBooked / totalCapacity) * 100).toFixed(1) : "0";
  const totalAttended = sessions.reduce((a, s) => a + s.attended, 0);

  const revenueBySlot = Object.entries(
    sessions.reduce((acc, s) => {
      acc[s.timeSlot] = (acc[s.timeSlot] ?? 0) + s.revenue;
      return acc;
    }, {} as Record<string, number>)
  )
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value);

  const revenueByType = Object.entries(
    sessions.reduce((acc, s) => {
      acc[s.classType] = (acc[s.classType] ?? 0) + s.revenue;
      return acc;
    }, {} as Record<string, number>)
  )
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
          Studio revenue
        </h2>
        <button
          type="button"
          onClick={onRegenerate}
          disabled={regenerating}
          className="rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 shadow-sm hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
        >
          {regenerating ? "Regenerating…" : "Regenerate dummy data"}
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KPI
          label="Total revenue"
          value={`$${totalRevenue.toLocaleString()}`}
          sub={`${sessions.length} sessions`}
          icon={<DollarSign className="h-5 w-5" />}
        />
        <KPI
          label="Fill rate"
          value={`${fillRate}%`}
          sub={`${totalBooked} / ${totalCapacity} booked`}
          icon={<BarChart3 className="h-5 w-5" />}
        />
        <KPI
          label="Total attended"
          value={totalAttended.toLocaleString()}
          sub="Across all classes"
          icon={<Users className="h-5 w-5" />}
        />
        <KPI
          label="Sessions"
          value={sessions.length}
          sub="6 months"
          icon={<TrendingUp className="h-5 w-5" />}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <SimpleChart
          title="Revenue by time slot"
          data={revenueBySlot}
          valueFormat={(n) => `$${(n / 1000).toFixed(0)}k`}
        />
        <SimpleChart
          title="Revenue by class type"
          data={revenueByType}
          valueFormat={(n) => `$${(n / 1000).toFixed(0)}k`}
        />
        <Changelog entries={changelog} />
      </div>

      <div>
        <h3 className="mb-2 text-sm font-semibold text-zinc-800 dark:text-zinc-200">
          Recent sessions (sample)
        </h3>
        <SessionsTable sessions={sessions} maxRows={30} />
      </div>
    </div>
  );
}
