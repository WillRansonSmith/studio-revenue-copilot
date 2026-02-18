/**
 * In-memory per-IP rate limiter for demo mode.
 *
 * Tracks request timestamps in two sliding windows (minute / hour).
 * Safe for single-instance serverless (Vercel), where the in-memory Map
 * is reset on cold start — an acceptable behavior for a demo safety net.
 */

interface Bucket {
  minute: number[];
  hour: number[];
}

const store = new Map<string, Bucket>();

const ONE_MINUTE = 60_000;
const ONE_HOUR = 3_600_000;

/** Remove timestamps older than the window from an array (mutates in place). */
function purge(timestamps: number[], windowMs: number, now: number): void {
  const cutoff = now - windowMs;
  // Timestamps are appended in order, so splice from the front.
  let i = 0;
  while (i < timestamps.length && timestamps[i] < cutoff) i++;
  if (i > 0) timestamps.splice(0, i);
}

export function getClientIp(req: Request): string {
  const headers = req.headers;
  const xff = headers.get("x-forwarded-for");
  if (xff) {
    const first = xff.split(",")[0].trim();
    if (first) return first;
  }
  const realIp = headers.get("x-real-ip");
  if (realIp) return realIp.trim();
  return "unknown";
}

export interface RateLimitResult {
  allowed: boolean;
  /** Which window was exceeded, if any. */
  window?: "minute" | "hour";
}

export function checkRateLimit(
  ip: string,
  maxPerMinute: number,
  maxPerHour: number,
): RateLimitResult {
  const now = Date.now();

  let bucket = store.get(ip);
  if (!bucket) {
    bucket = { minute: [], hour: [] };
    store.set(ip, bucket);
  }

  purge(bucket.minute, ONE_MINUTE, now);
  purge(bucket.hour, ONE_HOUR, now);

  if (bucket.minute.length >= maxPerMinute) {
    return { allowed: false, window: "minute" };
  }
  if (bucket.hour.length >= maxPerHour) {
    return { allowed: false, window: "hour" };
  }

  bucket.minute.push(now);
  bucket.hour.push(now);

  return { allowed: true };
}
