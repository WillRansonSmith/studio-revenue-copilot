"use client";

import { useDataset } from "@/lib/dataset-context";
import type { ClassSession } from "@/lib/data";
import { KPI } from "./KPI";
import { SessionsTable } from "./SessionsTable";
import { HorizontalBarChart } from "./HorizontalBarChart";
import { Changelog } from "./Changelog";
import { BarChart3, DollarSign, Users, TrendingUp } from "lucide-react";

interface RevenueOpportunity {
  instructor: string;
  classType: string;
  timeSlot: string;
  fillRatePct: number;
  count: number;
  priceIncrease: number;
  annualUpside: number;
}

function computeRevenueOpportunity(sessions: ClassSession[]): RevenueOpportunity | null {
  type GroupData = { fillRates: number[]; attended: number[]; prices: number[] };
  const groups: Record<string, GroupData> = {};

  for (const s of sessions) {
    if (!s.capacity) continue;
    const key = `${s.instructorName}||${s.classType}||${s.timeSlot}`;
    if (!groups[key]) groups[key] = { fillRates: [], attended: [], prices: [] };
    groups[key].fillRates.push(s.booked / s.capacity);
    groups[key].attended.push(s.attended);
    groups[key].prices.push(s.actualPrice);
  }

  const avg = (arr: number[]) => arr.reduce((a, b) => a + b, 0) / arr.length;

  type Candidate = RevenueOpportunity & { avgFillRate: number; avgAttended: number; avgPrice: number };
  const candidates: Candidate[] = [];

  for (const [key, g] of Object.entries(groups)) {
    if (g.fillRates.length < 3) continue;
    const avgFillRate = avg(g.fillRates);
    if (avgFillRate < 0.85) continue;
    const avgAttended = avg(g.attended);
    const avgPrice = avg(g.prices);
    const priceIncrease = Math.min(3, Math.max(1, Math.round(avgPrice * 0.1)));
    const annualUpside = Math.round(priceIncrease * avgAttended * 52);
    const [instructor, classType, timeSlot] = key.split("||");
    candidates.push({
      instructor,
      classType,
      timeSlot,
      fillRatePct: Math.round(avgFillRate * 100),
      count: g.fillRates.length,
      priceIncrease,
      annualUpside,
      avgFillRate,
      avgAttended,
      avgPrice,
    });
  }

  if (candidates.length === 0) return null;

  candidates.sort((a, b) =>
    b.avgFillRate !== a.avgFillRate
      ? b.avgFillRate - a.avgFillRate
      : b.avgAttended !== a.avgAttended
        ? b.avgAttended - a.avgAttended
        : b.avgPrice - a.avgPrice,
  );

  const { avgFillRate: _f, avgAttended: _a, avgPrice: _p, ...best } = candidates[0];
  return best;
}

function formatCompactCurrency(n: number): string {
  if (n >= 1000) return `$${(n / 1000).toFixed(1)}k`;
  return `$${n.toLocaleString()}`;
}

export function Dashboard() {
  const { sessions, changelog } = useDataset();

  const totalRevenue = sessions.reduce((a, s) => a + s.revenue, 0);
  const totalCapacity = sessions.reduce((a, s) => a + s.capacity, 0);
  const totalBooked = sessions.reduce((a, s) => a + s.booked, 0);
  const fillRate = totalCapacity ? ((totalBooked / totalCapacity) * 100).toFixed(1) : "0";
  const totalAttended = sessions.reduce((a, s) => a + s.attended, 0);

  const revenueOpportunity = computeRevenueOpportunity(sessions);

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

      {revenueOpportunity ? (
        <div className="rounded-xl border border-emerald-200/80 bg-emerald-50/50 p-5 shadow-sm dark:border-emerald-800/50 dark:bg-emerald-950/20">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-xs font-medium uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                Revenue Opportunity
              </p>
              <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
                Estimated annual upside from current top pricing opportunity
              </p>
              <p className="mt-2 text-2xl font-bold tabular-nums text-emerald-700 dark:text-emerald-400">
                +{formatCompactCurrency(revenueOpportunity.annualUpside)} annually
              </p>
              <div className="mt-2 space-y-0.5">
                <p className="text-xs text-zinc-700 dark:text-zinc-300">
                  <span className="font-medium">Top opportunity:</span>{" "}
                  {revenueOpportunity.instructor} —{" "}
                  <span className="capitalize">{revenueOpportunity.classType}</span>,{" "}
                  <span className="capitalize">{revenueOpportunity.timeSlot}</span>
                </p>
                <p className="text-xs text-zinc-600 dark:text-zinc-400">
                  Suggested increase: +${revenueOpportunity.priceIncrease} per session
                </p>
                <p className="text-xs text-zinc-500 dark:text-zinc-500">
                  Based on fill rate of {revenueOpportunity.fillRatePct}% across{" "}
                  {revenueOpportunity.count} sessions
                </p>
              </div>
            </div>
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600 dark:bg-emerald-900/50 dark:text-emerald-400">
              <TrendingUp className="h-5 w-5" />
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-zinc-200/80 bg-white p-5 shadow-sm dark:border-zinc-700/80 dark:bg-zinc-900">
          <p className="text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            Revenue Opportunity
          </p>
          <p className="mt-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">
            No strong premium pricing opportunity detected in the current dataset.
          </p>
          <p className="mt-1 text-xs text-zinc-400 dark:text-zinc-500">
            Try uploading a larger dataset or reviewing underpriced peak classes.
          </p>
        </div>
      )}

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
