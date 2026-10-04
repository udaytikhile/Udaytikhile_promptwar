import { CACHE_MAX_ENTRIES, CACHE_TTL_MS } from "./constants";

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

/** In-memory store for normalized inputs */
const store = new Map<string, CacheEntry<unknown>>();

/**
 * Normalizes input text by trimming, lowercasing, and collapsing whitespace.
 */
export function normalizeInputText(text: string): string {
  return text.trim().toLowerCase().replace(/\s+/g, " ");
}

/**
 * Generates a normalized cache key for decision analysis.
 */
export function createAnalysisCacheKey(decision: string, reasons: string): string {
  return `analysis:${normalizeInputText(decision)}:::${normalizeInputText(reasons)}`;
}

/**
 * Generates a normalized cache key for follow-up responses.
 */
export function createFollowupCacheKey(
  decision: string,
  reasons: string,
  answers: Record<string, string>
): string {
  const sortedAnswers = Object.entries(answers)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([q, a]) => `${normalizeInputText(q)}=${normalizeInputText(a)}`)
    .join("|");
  return `followup:${normalizeInputText(decision)}:::${normalizeInputText(reasons)}:::${sortedAnswers}`;
}

/**
 * Retrieves a cached item if present and not expired.
 */
export function getCachedItem<T>(key: string): T | null {
  const entry = store.get(key);
  if (!entry) return null;

  if (Date.now() > entry.expiresAt) {
    store.delete(key);
    return null;
  }

  return entry.value as T;
}

/**
 * Stores an item in the cache with size capping and TTL.
 */
export function setCachedItem<T>(key: string, value: T, ttlMs = CACHE_TTL_MS): void {
  // Prune oldest if at max capacity
  if (store.size >= CACHE_MAX_ENTRIES) {
    const oldestKey = store.keys().next().value;
    if (oldestKey) {
      store.delete(oldestKey);
    }
  }

  store.set(key, {
    value,
    expiresAt: Date.now() + ttlMs,
  });
}

/**
 * Clears the in-memory cache (primarily for tests).
 */
export function clearCache(): void {
  store.clear();
}
