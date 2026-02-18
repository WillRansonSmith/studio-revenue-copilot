"use client";

import { useEffect, useState, useCallback } from "react";
import type { ClassSession, ChangelogEntry } from "@/lib/data";
import { KPI } from "./KPI";
import { SessionsTable } from "./SessionsTable";
import { HorizontalBarChart } from "./HorizontalBarChart";
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
      <div className="flex min-h-[320px] items-center justify-center">
        <div className="flex items-center gap-3 text-zinc-400">
          <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <span className="text-sm font-medium">Loading dashboard&hellip;</span>
        </div>
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
        <div>
          <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
            Overview
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            6-month performance snapshot
          </p>
        </div>
        <button
          type="button"
          onClick={onRegenerate}
          disabled={regenerating}
          className="inline-flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 shadow-sm transition-colors hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
        >
          {regenerating && (
            <svg className="h-3.5 w-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          )}
          {regenerating ? "Regenerating…" : "Regenerate dummy data"}
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KPI
          label="Total revenue"
          value={`$${totalRevenue.toLocaleString()}`}
          sub={`${sessions.length} sessions`}
          icon={<DollarSign className="h-5 w-5" />}
        />
        <KPI
          label="Fill rate"
          value={`${fillRate}%`}
          sub={`${totalBooked.toLocaleString()} / ${totalCapacity.toLocaleString()} booked`}
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
          value={sessions.length.toLocaleString()}
          sub="6-month window"
          icon={<TrendingUp className="h-5 w-5" />}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <HorizontalBarChart
          title="Revenue by time slot"
          subtitle="6-month revenue"
          data={revenueBySlot}
        />
        <HorizontalBarChart
          title="Revenue by class type"
          subtitle="6-month revenue"
          data={revenueByType}
        />
        <Changelog entries={changelog} />
      </div>

      <div>
        <h3 className="mb-3 text-sm font-semibold text-zinc-800 dark:text-zinc-200">
          Recent sessions
        </h3>
        <SessionsTable sessions={sessions} maxRows={30} />
      </div>
    </div>
  );
}
