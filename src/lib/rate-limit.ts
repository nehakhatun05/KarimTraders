import { NextRequest, NextResponse } from 'next/server';

// Simple in-memory rate limiter (use Redis in production)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Max requests per window
}

const defaultConfig: RateLimitConfig = {
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 100, // 100 requests per minute
};

// Predefined rate limit configurations for different endpoints
export const rateLimitConfigs = {
  default: defaultConfig,
  auth: { windowMs: 15 * 60 * 1000, maxRequests: 10 }, // 10 per 15 minutes for auth
  login: { windowMs: 15 * 60 * 1000, maxRequests: 5 }, // 5 per 15 minutes for login
  register: { windowMs: 60 * 60 * 1000, maxRequests: 3 }, // 3 per hour for register
  passwordReset: { windowMs: 60 * 60 * 1000, maxRequests: 3 }, // 3 per hour
  api: { windowMs: 60 * 1000, maxRequests: 60 }, // 60 per minute for general API
  search: { windowMs: 60 * 1000, maxRequests: 30 }, // 30 per minute for search
  upload: { windowMs: 60 * 1000, maxRequests: 10 }, // 10 per minute for uploads
  checkout: { windowMs: 60 * 1000, maxRequests: 20 }, // 20 per minute for checkout
  webhook: { windowMs: 60 * 1000, maxRequests: 100 }, // 100 per minute for webhooks
};

export function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  if (realIp) {
    return realIp;
  }
  
  return '127.0.0.1';
}

export function rateLimit(
  request: NextRequest,
  config: RateLimitConfig = defaultConfig
): { success: boolean; remaining: number; resetIn: number } {
  const ip = getClientIp(request);
  const key = `${ip}:${request.nextUrl.pathname}`;
  const now = Date.now();
  
  // Clean up expired entries periodically
  if (Math.random() < 0.01) {
    for (const [k, v] of rateLimitStore) {
      if (now > v.resetTime) {
        rateLimitStore.delete(k);
      }
    }
  }
  
  const entry = rateLimitStore.get(key);
  
  if (!entry || now > entry.resetTime) {
    // Create new entry
    rateLimitStore.set(key, {
      count: 1,
      resetTime: now + config.windowMs,
    });
    return { success: true, remaining: config.maxRequests - 1, resetIn: config.windowMs };
  }
  
  if (entry.count >= config.maxRequests) {
    return {
      success: false,
      remaining: 0,
      resetIn: entry.resetTime - now,
    };
  }
  
  entry.count++;
  return {
    success: true,
    remaining: config.maxRequests - entry.count,
    resetIn: entry.resetTime - now,
  };
}

export function rateLimitResponse(resetIn: number): NextResponse {
  return NextResponse.json(
    {
      error: 'Too many requests',
      message: 'Please try again later',
      retryAfter: Math.ceil(resetIn / 1000),
    },
    {
      status: 429,
      headers: {
        'Retry-After': String(Math.ceil(resetIn / 1000)),
        'X-RateLimit-Remaining': '0',
      },
    }
  );
}

// Middleware helper for API routes
export function withRateLimit(
  handler: (req: NextRequest) => Promise<NextResponse>,
  config: RateLimitConfig = rateLimitConfigs.api
) {
  return async (request: NextRequest) => {
    const result = rateLimit(request, config);
    
    if (!result.success) {
      return rateLimitResponse(result.resetIn);
    }
    
    const response = await handler(request);
    response.headers.set('X-RateLimit-Remaining', String(result.remaining));
    
    return response;
  };
}
