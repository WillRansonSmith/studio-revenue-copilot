"use client";

import { useDataset } from "@/lib/dataset-context";
import { KPI } from "./KPI";
import { SessionsTable } from "./SessionsTable";
import { HorizontalBarChart } from "./HorizontalBarChart";
import { Changelog } from "./Changelog";
import { BarChart3, DollarSign, Users, TrendingUp } from "lucide-react";

export function Dashboard() {
  const { sessions, changelog } = useDataset();

  const totalRevenue = sessions.reduce((a, s) => a + s.revenue, 0);
  const totalCapacity = sessions.reduce((a, s) => a + s.capacity, 0);
  const totalBooked = sessions.reduce((a, s) => a + s.booked, 0);
  const fillRate = totalCapacity ? ((totalBooked / totalCapacity) * 100).toFixed(1) : "0";
  const totalAttended = sessions.reduce((a, s) => a + s.attended, 0);

  const revenueBySlot = Object.entries(
    sessions.reduce((acc, s) => {
      acc[s.timeSlot] = (acc[s.timeSlot] ?? 0) + s.revenue;
      return acc;
    }, {} as Record<string, number>),
  )
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value);

  const revenueByType = Object.entries(
    sessions.reduce((acc, s) => {
      acc[s.classType] = (acc[s.classType] ?? 0) + s.revenue;
      return acc;
    }, {} as Record<string, number>),
  )
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value);

  if (sessions.length === 0) {
    return (
      <div className="flex min-h-[320px] items-center justify-center rounded-xl border border-dashed border-zinc-300 dark:border-zinc-700">
        <p className="text-sm text-zinc-400 dark:text-zinc-500">
          No sessions loaded — upload a CSV or use dummy data.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
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
          sub="In dataset"
          icon={<TrendingUp className="h-5 w-5" />}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <HorizontalBarChart
          title="Revenue by time slot"
          subtitle="Dataset revenue"
          data={revenueBySlot}
        />
        <HorizontalBarChart
          title="Revenue by class type"
          subtitle="Dataset revenue"
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
