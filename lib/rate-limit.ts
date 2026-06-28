/**
 * Lightweight in-memory rate limiter (fixed window).
 *
 * Best-effort, dependency-free throttling for low-volume abuse-prone endpoints
 * (gift redemption, anonymous gift checkout). It lives in module memory, so it
 * is per-instance and resets on cold start — it is NOT a substitute for a
 * distributed limiter (Upstash/Redis) under heavy load, but it meaningfully
 * raises the cost of brute-force and spam from a single source at near-zero
 * operational cost. Layer a network-level limiter in front for stronger
 * guarantees.
 */

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

// Opportunistic cleanup so the map can't grow without bound.
function sweep(now: number) {
  if (buckets.size < 5000) return;
  for (const [key, b] of buckets) {
    if (b.resetAt <= now) buckets.delete(key);
  }
}

export type RateLimitResult = {
  ok: boolean;
  remaining: number;
  retryAfterSeconds: number;
};

/**
 * Returns ok:false once more than `limit` calls share the same `key` within
 * `windowMs`. Caller decides what to do with a block (usually a 429).
 */
export function rateLimit(
  key: string,
  limit: number,
  windowMs: number,
): RateLimitResult {
  const now = Date.now();
  sweep(now);

  const existing = buckets.get(key);
  if (!existing || existing.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, remaining: limit - 1, retryAfterSeconds: 0 };
  }

  existing.count += 1;
  if (existing.count > limit) {
    return {
      ok: false,
      remaining: 0,
      retryAfterSeconds: Math.max(1, Math.ceil((existing.resetAt - now) / 1000)),
    };
  }
  return {
    ok: true,
    remaining: limit - existing.count,
    retryAfterSeconds: 0,
  };
}

/**
 * Best-effort client IP from standard proxy headers (Vercel sets
 * x-forwarded-for). Falls back to a constant so a missing header degrades to a
 * shared global bucket rather than no limiting at all.
 */
export function clientIp(request: Request): string {
  const xff = request.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  return request.headers.get("x-real-ip")?.trim() || "unknown";
}
