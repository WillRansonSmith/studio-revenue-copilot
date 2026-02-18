/**
 * Studio Revenue Copilot — in-memory dummy data: types, generator, changelog.
 * No database; regenerate replaces the in-memory corpus.
 */

export type ClassType = "yoga" | "pilates" | "barre" | "cycle";
export type TimeSlot =
  | "morning"
  | "lunch"
  | "afternoon"
  | "afterwork"
  | "evening"
  | "weekend";

export interface Instructor {
  id: string;
  name: string;
  popularity: number; // 0–1, "star" is 1
}

export interface ClassSession {
  id: string;
  date: string; // YYYY-MM-DD
  instructorId: string;
  instructorName: string;
  classType: ClassType;
  timeSlot: TimeSlot;
  basePrice: number;
  actualPrice: number;
  capacity: number;
  booked: number;
  attended: number;
  cancellations: number;
  revenue: number;
  bookingLeadTimeDays: number; // average days between booking and session
}

export interface ChangelogEntry {
  period: string;
  metric: string;
  change: string;
  detail?: string;
}

const INSTRUCTORS: Instructor[] = [
  { id: "ins-1", name: "Jordan Lee", popularity: 1 },      // star
  { id: "ins-2", name: "Sam Rivera", popularity: 0.85 },
  { id: "ins-3", name: "Alex Chen", popularity: 0.7 },
  { id: "ins-4", name: "Morgan Taylor", popularity: 0.55 },
  { id: "ins-5", name: "Casey Kim", popularity: 0.4 },
  { id: "ins-6", name: "Riley Jones", popularity: 0.35 },
];

const CLASS_TYPES: ClassType[] = ["yoga", "pilates", "barre", "cycle"];
const TIME_SLOTS: TimeSlot[] = ["morning", "lunch", "afternoon", "afterwork", "evening", "weekend"];

// Demand multiplier by slot (after-work and morning higher)
const SLOT_DEMAND: Record<TimeSlot, number> = {
  morning: 1.15,
  lunch: 0.5,
  afternoon: 0.75,
  afterwork: 1.35,
  evening: 1.0,
  weekend: 1.1,
};

function seededRandom(seed: number) {
  const s = Math.sin(seed) * 10000;
  return s - Math.floor(s);
}

function pick<T>(arr: T[], seed: number): T {
  return arr[Math.floor(seededRandom(seed) * arr.length)];
}

/** Generate 6 months of class-session history with believable patterns. */
export function generateDummyData(seed: number): ClassSession[] {
  const sessions: ClassSession[] = [];
  const start = new Date();
  start.setMonth(start.getMonth() - 6);
  const end = new Date();
  let id = 0;
  let r = seed;

  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const dateStr = d.toISOString().slice(0, 10);
    const dayOfWeek = d.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    // Slight seasonality: higher in latter months
    const monthsFromStart = (d.getTime() - start.getTime()) / (30 * 24 * 60 * 60 * 1000);
    const seasonality = 0.9 + 0.2 * Math.min(monthsFromStart / 6, 1);

    for (let s = 0; s < TIME_SLOTS.length; s++) {
      const slot = TIME_SLOTS[s];
      const slotDemand = SLOT_DEMAND[slot];
      // Midday low unless we're willing to discount
      const isMidday = slot === "lunch" || slot === "afternoon";
      const discount = isMidday ? 0.85 : 1;

      const instructor = pick(INSTRUCTORS, r++);
      const classType = pick(CLASS_TYPES, r++);
      const basePrice = classType === "cycle" ? 28 : classType === "barre" ? 24 : 22;
      const actualPrice = Math.round(basePrice * discount * (0.95 + seededRandom(r++) * 0.1));
      const capacity = 20 + Math.floor(seededRandom(r++) * 16);

      const demandFactor = instructor.popularity * slotDemand * seasonality * (isWeekend ? 1.05 : 1);
      let fillRate = Math.min(0.98, 0.3 + demandFactor * 0.5 + seededRandom(r++) * 0.2);
      if (instructor.popularity >= 0.95) fillRate = Math.min(0.99, fillRate + 0.15);
      if (isMidday && discount < 1) fillRate = Math.min(0.85, fillRate + 0.1);

      const booked = Math.round(capacity * fillRate);
      const attended = Math.round(booked * (0.88 + seededRandom(r++) * 0.1));
      const cancellations = booked - attended;
      const revenue = attended * actualPrice;
      const bookingLeadTimeDays = Math.round(2 + seededRandom(r++) * 12);

      sessions.push({
        id: `s-${++id}`,
        date: dateStr,
        instructorId: instructor.id,
        instructorName: instructor.name,
        classType,
        timeSlot: slot,
        basePrice,
        actualPrice,
        capacity,
        booked,
        attended,
        cancellations,
        revenue,
        bookingLeadTimeDays,
      });
    }
  }

  return sessions;
}

// In-memory store (shared by API and regenerate)
let currentSessions: ClassSession[] = generateDummyData(42);

export function getSessions(): ClassSession[] {
  return currentSessions;
}

export function regenerate(seed?: number): ClassSession[] {
  currentSessions = generateDummyData(seed ?? Date.now());
  return currentSessions;
}

/** "What happened last 4 weeks" changelog computed from current data. */
export function getChangelog(): ChangelogEntry[] {
  const sessions = getSessions();
  const now = new Date();
  const fourWeeksAgo = new Date(now);
  fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 28);
  const eightWeeksAgo = new Date(now);
  eightWeeksAgo.setDate(eightWeeksAgo.getDate() - 56);
  const recentStart = fourWeeksAgo.toISOString().slice(0, 10);
  const priorStart = eightWeeksAgo.toISOString().slice(0, 10);

  const recent = sessions.filter((s) => s.date >= recentStart);
  const older = sessions.filter((s) => s.date >= priorStart && s.date < recentStart);

  const sum = (arr: ClassSession[], key: keyof ClassSession) =>
    arr.reduce((a, s) => a + (Number(s[key]) || 0), 0);

  const recentRev = sum(recent, "revenue");
  const recentAtt = sum(recent, "attended");
  const recentCap = sum(recent, "capacity");
  const recentFill = recentCap ? (sum(recent, "booked") / recentCap) * 100 : 0;

  const olderRev = sum(older, "revenue");
  const olderAtt = sum(older, "attended");
  const olderCap = sum(older, "capacity");
  const olderFill = olderCap ? (sum(older, "booked") / olderCap) * 100 : 0;

  const revPct = olderRev ? ((recentRev - olderRev) / olderRev * 100).toFixed(1) : "—";
  const fillDelta = (recentFill - olderFill).toFixed(1);

  const entries: ChangelogEntry[] = [
    { period: "Last 4 weeks", metric: "Revenue", change: recentRev > olderRev ? `+${revPct}%` : `${revPct}%`, detail: `$${recentRev.toLocaleString()} vs prior 4w` },
    { period: "Last 4 weeks", metric: "Fill rate", change: recentFill >= olderFill ? `+${fillDelta}pp` : `${fillDelta}pp`, detail: `${recentFill.toFixed(1)}% vs ${olderFill.toFixed(1)}%` },
    { period: "Last 4 weeks", metric: "Attendance", change: recentAtt >= olderAtt ? "Up" : "Down", detail: `${recentAtt} attended` },
  ];

  const byInstructor = recent.reduce((acc, s) => {
    acc[s.instructorName] = (acc[s.instructorName] ?? 0) + s.revenue;
    return acc;
  }, {} as Record<string, number>);
  const topInstructor = Object.entries(byInstructor).sort((a, b) => b[1] - a[1])[0];
  if (topInstructor) {
    entries.push({ period: "Last 4 weeks", metric: "Top instructor (revenue)", change: topInstructor[0], detail: `$${Math.round(topInstructor[1]).toLocaleString()}` });
  }

  return entries;
}
