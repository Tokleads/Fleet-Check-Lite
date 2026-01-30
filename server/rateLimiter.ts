/**
 * Rate Limiting Middleware
 * Protects API endpoints from abuse and DDoS attacks
 */

import rateLimit from 'express-rate-limit';
import slowDown from 'express-slow-down';
import type { Request } from 'express';

/**
 * Key generator for rate limiting
 * Uses IP address + user ID (if authenticated) for more accurate tracking
 */
const keyGenerator = (req: Request): string => {
  const userId = (req as any).user?.id;
  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  return userId ? `user-${userId}` : `ip-${ip}`;
};

/**
 * Standard rate limiter for general API endpoints
 * 100 requests per 15 minutes per user/IP
 */
export const standardLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: 'Too many requests from this IP/user, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator,
});

/**
 * Strict rate limiter for authentication endpoints
 * 5 requests per 15 minutes per IP (prevents brute force)
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  message: 'Too many authentication attempts, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Don't count successful logins
  keyGenerator: (req: Request) => {
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    return `auth-${ip}`;
  },
});

/**
 * File upload rate limiter
 * 20 uploads per hour per user
 */
export const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20,
  message: 'Too many file uploads, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator,
});

/**
 * Report generation rate limiter
 * 10 reports per hour per user (reports are resource-intensive)
 */
export const reportLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10,
  message: 'Too many report generation requests, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator,
});

/**
 * GPS location update rate limiter
 * 720 updates per hour per driver (1 every 5 minutes max)
 */
export const gpsLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 720,
  message: 'Too many GPS updates, please slow down.',
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator,
});

/**
 * Notification broadcast rate limiter
 * 5 broadcasts per hour per company (prevents spam)
 */
export const broadcastLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  message: 'Too many broadcast notifications, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: Request) => {
    const companyId = (req as any).user?.companyId;
    return companyId ? `company-${companyId}` : keyGenerator(req);
  },
});

/**
 * Speed limiter for general API endpoints
 * Slows down responses after 50 requests in 15 minutes
 * Adds 500ms delay per request after threshold
 */
export const speedLimiter = slowDown({
  windowMs: 15 * 60 * 1000, // 15 minutes
  delayAfter: 50,
  delayMs: () => 500, // 500ms delay per request
  maxDelayMs: 5000, // Maximum 5 seconds delay
  keyGenerator,
});

/**
 * Aggressive rate limiter for public endpoints (no auth required)
 * 30 requests per 15 minutes per IP
 */
export const publicLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30,
  message: 'Too many requests, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: Request) => {
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    return `public-${ip}`;
  },
});

/**
 * Lenient rate limiter for read-only operations
 * 200 requests per 15 minutes per user
 */
export const readLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  message: 'Too many requests, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator,
});

/**
 * Strict rate limiter for write operations
 * 50 requests per 15 minutes per user
 */
export const writeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50,
  message: 'Too many write requests, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator,
});
