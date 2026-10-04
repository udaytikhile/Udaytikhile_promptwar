import { describe, it, expect, beforeEach } from "vitest";
import { checkRateLimit, resetRateLimitStore } from "@/lib/ratelimit";

describe("ratelimit", () => {
  beforeEach(() => {
    resetRateLimitStore();
  });

  it("allows requests under the limit", () => {
    for (let i = 0; i < 10; i++) {
      const result = checkRateLimit("127.0.0.1");
      expect(result.allowed).toBe(true);
    }
  });

  it("blocks the 11th request within the window", () => {
    for (let i = 0; i < 10; i++) {
      checkRateLimit("127.0.0.1");
    }
    const result = checkRateLimit("127.0.0.1");
    expect(result.allowed).toBe(false);
    if (!result.allowed) {
      expect(result.retryAfterMs).toBeGreaterThan(0);
    }
  });

  it("tracks different IPs independently", () => {
    for (let i = 0; i < 10; i++) {
      checkRateLimit("1.1.1.1");
    }
    const blocked = checkRateLimit("1.1.1.1");
    expect(blocked.allowed).toBe(false);

    const allowed = checkRateLimit("2.2.2.2");
    expect(allowed.allowed).toBe(true);
  });
});
