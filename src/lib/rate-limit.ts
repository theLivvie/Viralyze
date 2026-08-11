// In-memory rate limiter using a Map.
// Tracks requests per identifier (IP or userId) within a sliding window.

type RateLimitEntry = {
  count: number;
  resetAt: number;
};

const store = new Map<string, RateLimitEntry>();

// Periodically clean up expired entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store) {
    if (entry.resetAt <= now) {
      store.delete(key);
    }
  }
}, 5 * 60_000);

export interface RateLimitResult {
  allowed: boolean;
  retryAfter?: number;
}

export function rateLimit(limit: number, windowMs: number): {
  check(identifier: string): RateLimitResult;
} {
  return {
    check(identifier: string): RateLimitResult {
      const now = Date.now();
      const entry = store.get(identifier);

      if (!entry || entry.resetAt <= now) {
        // No entry or window expired — start fresh
        store.set(identifier, { count: 1, resetAt: now + windowMs });
        return { allowed: true };
      }

      if (entry.count < limit) {
        entry.count++;
        return { allowed: true };
      }

      // Rate limited
      const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
      return { allowed: false, retryAfter };
    },
  };
}
