/**
 * In-memory IP-based rate limiter.
 * Note: on serverless (Vercel), each instance has its own memory,
 * so this is per-instance, not global.
 */

interface RateEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateEntry>();

const WINDOW_MS = 60_000; // 1 minute
const MAX_REQUESTS = 10;

/** Cleanup old entries periodically */
function cleanup(): void {
  const now = Date.now();
  for (const [key, entry] of store) {
    if (now > entry.resetAt) {
      store.delete(key);
    }
  }
}

// Cleanup every 5 minutes
if (typeof setInterval !== "undefined") {
  setInterval(cleanup, 5 * 60_000);
}

/**
 * Check if a request from this IP is allowed.
 * Returns { allowed: true } or { allowed: false, retryAfterMs }.
 */
export function checkRateLimit(ip: string): { allowed: true } | { allowed: false; retryAfterMs: number } {
  const now = Date.now();
  const entry = store.get(ip);

  if (!entry || now > entry.resetAt) {
    store.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return { allowed: true };
  }

  if (entry.count >= MAX_REQUESTS) {
    return { allowed: false, retryAfterMs: entry.resetAt - now };
  }

  entry.count += 1;
  return { allowed: true };
}

/** Reset store — used in tests */
export function resetRateLimitStore(): void {
  store.clear();
}
