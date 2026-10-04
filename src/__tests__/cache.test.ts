import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  normalizeInputText,
  createAnalysisCacheKey,
  createFollowupCacheKey,
  getCachedItem,
  setCachedItem,
  clearCache,
} from "@/lib/cache";

describe("cache", () => {
  beforeEach(() => {
    clearCache();
  });

  it("normalizes text by trimming, lowercasing, and collapsing whitespace", () => {
    expect(normalizeInputText("   Hello   WORLD  \n  here  ")).toBe("hello world here");
  });

  it("creates deterministic keys for identical inputs regardless of casing and spacing", () => {
    const key1 = createAnalysisCacheKey("Take internship", "good money");
    const key2 = createAnalysisCacheKey("  take   INTERNSHIP  ", "  GOOD  money  ");
    expect(key1).toBe(key2);
  });

  it("creates sorted deterministic followup keys", () => {
    const key1 = createFollowupCacheKey("Decision", "Reasons", { b: "2", a: "1" });
    const key2 = createFollowupCacheKey("Decision", "Reasons", { a: "1", b: "2" });
    expect(key1).toBe(key2);
  });

  it("stores and retrieves cached items", () => {
    const data = { test: 123 };
    setCachedItem("key1", data);
    expect(getCachedItem("key1")).toEqual(data);
  });

  it("returns null for non-existent key", () => {
    expect(getCachedItem("unknown")).toBeNull();
  });

  it("expires items after TTL", () => {
    vi.useFakeTimers();
    setCachedItem("temp", { val: 1 }, 1000);
    expect(getCachedItem("temp")).toEqual({ val: 1 });

    vi.advanceTimersByTime(1001);
    expect(getCachedItem("temp")).toBeNull();
    vi.useRealTimers();
  });

  it("prunes oldest items when exceeding max size", () => {
    for (let i = 0; i < 105; i++) {
      setCachedItem(`key-${i}`, { idx: i });
    }
    // Oldest item key-0 should have been pruned
    expect(getCachedItem("key-0")).toBeNull();
    expect(getCachedItem("key-104")).toEqual({ idx: 104 });
  });
});
