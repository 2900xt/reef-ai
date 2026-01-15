type RateLimitRecord = {
  count: number;
  resetAt: number;
};

const rateLimitStore = new Map<string, RateLimitRecord>();

// Clean up expired entries periodically (every 5 minutes)
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of rateLimitStore.entries()) {
    if (record.resetAt < now) {
      rateLimitStore.delete(key);
    }
  }
}, 5 * 60 * 1000);

export type RateLimitConfig = {
  /** Maximum number of requests allowed in the window */
  limit: number;
  /** Time window in seconds */
  windowSeconds: number;
};

export type RateLimitResult = {
  success: boolean;
  limit: number;
  remaining: number;
  resetAt: number;
};

/**
 * Check and update rate limit for a given identifier
 * @param identifier - Unique identifier (e.g., IP address, user ID)
 * @param endpoint - Endpoint name for namespacing
 * @param config - Rate limit configuration
 */
export function checkRateLimit(
  identifier: string,
  endpoint: string,
  config: RateLimitConfig
): RateLimitResult {
  const key = `${endpoint}:${identifier}`;
  const now = Date.now();
  const windowMs = config.windowSeconds * 1000;

  const existing = rateLimitStore.get(key);

  // If no record exists or window has expired, create new record
  if (!existing || existing.resetAt < now) {
    const resetAt = now + windowMs;
    rateLimitStore.set(key, { count: 1, resetAt });
    return {
      success: true,
      limit: config.limit,
      remaining: config.limit - 1,
      resetAt,
    };
  }

  // Check if limit exceeded
  if (existing.count >= config.limit) {
    return {
      success: false,
      limit: config.limit,
      remaining: 0,
      resetAt: existing.resetAt,
    };
  }

  // Increment count
  existing.count++;
  return {
    success: true,
    limit: config.limit,
    remaining: config.limit - existing.count,
    resetAt: existing.resetAt,
  };
}

/**
 * Get client identifier from request (IP address or user ID)
 */
export function getClientIdentifier(
  request: Request,
  userId?: string | null
): string {
  // Prefer user ID if authenticated
  if (userId) {
    return `user:${userId}`;
  }

  // Fall back to IP address
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded?.split(',')[0]?.trim() ||
             request.headers.get('x-real-ip') ||
             'unknown';

  return `ip:${ip}`;
}

// Preset configurations for different endpoint types
export const RATE_LIMITS = {
  // Expensive operations (OpenAI calls) - strict limit
  SEARCH_CREATE: { limit: 10, windowSeconds: 60 }, // 10 per minute

  // Document parsing - moderate limit
  PARSE_DOCUMENT: { limit: 20, windowSeconds: 60 }, // 20 per minute

  // Read operations - more lenient
  SEARCH_READ: { limit: 60, windowSeconds: 60 }, // 60 per minute

  // Checkout operations - prevent abuse
  CHECKOUT: { limit: 10, windowSeconds: 60 }, // 10 per minute
} as const;
