/**
 * Client-side CSV parser for studio session data.
 * No Node.js APIs — safe for browser / Next.js client components.
 */

import type { ClassSession } from "./data";

const REQUIRED_COLUMNS = [
  "date",
  "classType",
  "instructor",
  "timeSlot",
  "capacity",
  "booked",
  "attended",
  "cancellations",
  "waitlist",
  "price",
] as const;

const VALID_TIME_SLOTS = new Set([
  "morning",
  "lunch",
  "afternoon",
  "afterwork",
  "evening",
  "weekend",
]);

const VALID_CLASS_TYPES = new Set(["yoga", "pilates", "barre", "cycle"]);

export interface ParseResult {
  sessions: ClassSession[];
  skipped: number;
  /** Non-empty only when the file is fundamentally unparseable (e.g. missing columns). */
  errors: string[];
}

function parseNum(val: string): number {
  const n = parseFloat(val.trim());
  return isNaN(n) ? NaN : n;
}

/** Split a single CSV line respecting double-quoted fields. */
function splitLine(line: string): string[] {
  const cells: string[] = [];
  let cur = "";
  let inQuote = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      inQuote = !inQuote;
    } else if (ch === "," && !inQuote) {
      cells.push(cur.trim());
      cur = "";
    } else {
      cur += ch;
    }
  }
  cells.push(cur.trim());
  return cells;
}

export function parseCSV(text: string): ParseResult {
  const lines = text.trim().split(/\r?\n/);

  if (lines.length < 2) {
    return { sessions: [], skipped: 0, errors: ["CSV file is empty or has no data rows."] };
  }

  // Parse header (case-insensitive)
  const rawHeaders = splitLine(lines[0]).map((h) => h.toLowerCase().trim());

  // Check required columns
  const missingCols = REQUIRED_COLUMNS.filter(
    (col) => !rawHeaders.includes(col.toLowerCase()),
  );
  if (missingCols.length > 0) {
    return {
      sessions: [],
      skipped: 0,
      errors: [`Missing required columns: ${missingCols.join(", ")}`],
    };
  }

  // Build column index map
  const idx: Record<string, number> = {};
  for (const col of REQUIRED_COLUMNS) {
    idx[col] = rawHeaders.indexOf(col.toLowerCase());
  }

  const sessions: ClassSession[] = [];
  let skipped = 0;

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    try {
      const cells = splitLine(line);

      const date = cells[idx.date]?.trim() ?? "";
      const classTypeRaw = cells[idx.classType]?.trim().toLowerCase() ?? "";
      const instructor = cells[idx.instructor]?.trim() ?? "";
      const timeSlotRaw = cells[idx.timeSlot]?.trim().toLowerCase() ?? "";
      let capacity = Math.round(parseNum(cells[idx.capacity] ?? ""));
      let booked = Math.round(parseNum(cells[idx.booked] ?? ""));
      let attended = Math.round(parseNum(cells[idx.attended] ?? ""));
      let cancellations = Math.round(parseNum(cells[idx.cancellations] ?? ""));
      let waitlist = Math.round(parseNum(cells[idx.waitlist] ?? ""));
      const price = parseNum(cells[idx.price] ?? "");

      // Validate basics — drop the row if fundamentally wrong
      if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) { skipped++; continue; }
      if (!VALID_CLASS_TYPES.has(classTypeRaw)) { skipped++; continue; }
      if (!instructor) { skipped++; continue; }
      if (!VALID_TIME_SLOTS.has(timeSlotRaw)) { skipped++; continue; }
      if (
        isNaN(capacity) || isNaN(booked) || isNaN(attended) ||
        isNaN(cancellations) || isNaN(waitlist) || isNaN(price)
      ) { skipped++; continue; }
      if (capacity <= 0 || price <= 0) { skipped++; continue; }

      // Auto-fix logical constraints (small issues, not drops)
      booked = Math.min(Math.max(0, booked), capacity);
      attended = Math.min(Math.max(0, attended), booked);
      cancellations = Math.min(Math.max(0, cancellations), booked);
      // waitlist valid only when booked == capacity
      waitlist = booked >= capacity ? (waitlist === 1 ? 1 : 0) : 0;

      // revenue = price * attended (derived, not from CSV)
      const revenue = price * attended;

      sessions.push({
        id: `csv-${i}`,
        date,
        instructorId: `csv-${instructor.toLowerCase().replace(/\s+/g, "-")}`,
        instructorName: instructor,
        classType: classTypeRaw as ClassSession["classType"],
        timeSlot: timeSlotRaw as ClassSession["timeSlot"],
        basePrice: price,
        actualPrice: price,
        capacity,
        booked,
        attended,
        cancellations,
        revenue,
        bookingLeadTimeDays: 0,
      });
    } catch {
      skipped++;
    }
  }

  return { sessions, skipped, errors: [] };
}
