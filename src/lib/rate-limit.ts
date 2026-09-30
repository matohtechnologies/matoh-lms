import { NextRequest, NextResponse } from "next/server";

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

// In-memory sliding window / token bucket storage
const ipTracker = new Map<string, RateLimitRecord>();

// Periodic cleanup every 5 minutes to prevent memory leaks
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, record] of ipTracker.entries()) {
      if (now > record.resetTime) {
        ipTracker.delete(key);
      }
    }
  }, 5 * 60 * 1000);
}

export interface RateLimitOptions {
  limit?: number; // Maximum allowed requests
  windowMs?: number; // Time window in milliseconds
  identifier?: string; // Optional custom identifier prefix
}

/**
 * Extract client IP address safely from request headers
 */
export function getClientIp(req: NextRequest): string {
  const forwardedFor = req.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }
  const realIp = req.headers.get("x-real-ip");
  if (realIp) {
    return realIp.trim();
  }
  const cfConnectingIp = req.headers.get("cf-connecting-ip");
  if (cfConnectingIp) {
    return cfConnectingIp.trim();
  }
  return "127.0.0.1";
}

/**
 * Check if the request exceeds rate limits.
 * Returns null if allowed, or a 429 NextResponse if rate limit exceeded.
 */
export function checkRateLimit(
  req: NextRequest,
  options: RateLimitOptions = {}
): { isAllowed: boolean; response?: NextResponse; remaining: number; reset: number } {
  const limit = options.limit ?? 30;
  const windowMs = options.windowMs ?? 60 * 1000; // default 1 minute
  const prefix = options.identifier ?? "default";

  const clientIp = getClientIp(req);
  const key = `${prefix}:${clientIp}`;
  const now = Date.now();

  const current = ipTracker.get(key);

  if (!current || now > current.resetTime) {
    // New or expired window
    ipTracker.set(key, {
      count: 1,
      resetTime: now + windowMs,
    });
    return { isAllowed: true, remaining: limit - 1, reset: now + windowMs };
  }

  if (current.count >= limit) {
    // Limit reached
    const retryAfter = Math.ceil((current.resetTime - now) / 1000);
    const response = NextResponse.json(
      {
        error: "Terlalu banyak permintaan (Rate limit exceeded). Silakan coba lagi nanti.",
        retryAfterSeconds: retryAfter,
      },
      {
        status: 429,
        headers: {
          "Retry-After": retryAfter.toString(),
          "X-RateLimit-Limit": limit.toString(),
          "X-RateLimit-Remaining": "0",
          "X-RateLimit-Reset": Math.ceil(current.resetTime / 1000).toString(),
        },
      }
    );
    return { isAllowed: false, response, remaining: 0, reset: current.resetTime };
  }

  // Increment count
  current.count += 1;
  return {
    isAllowed: true,
    remaining: limit - current.count,
    reset: current.resetTime,
  };
}
