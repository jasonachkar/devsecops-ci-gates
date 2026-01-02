/**
 * @fileoverview Rate Limiting Middleware
 * @description Provides rate limiting for different endpoint types.
 * Prevents API abuse, brute force attacks, and resource exhaustion.
 * 
 * @module middleware/rateLimit
 */

import rateLimit from 'express-rate-limit';
import { Request, Response } from 'express';

/**
 * General API rate limiter
 * @constant {RateLimitRequestHandler}
 * @description Applied to most API endpoints to prevent abuse.
 * Allows 100 requests per 15 minutes per IP address.
 * 
 * @example
 * router.get('/scans', apiLimiter, getScans);
 */
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes time window
  max: 100, // Maximum 100 requests per window per IP
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false, // Don't use deprecated `X-RateLimit-*` headers
});

/**
 * Strict rate limiter for authentication endpoints
 * @constant {RateLimitRequestHandler}
 * @description More restrictive limit for login/auth endpoints.
 * Prevents brute force attacks by limiting to 5 attempts per 15 minutes.
 * 
 * @example
 * router.post('/auth/login', authLimiter, login);
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes time window
  max: 5, // Maximum 5 requests per window per IP (very restrictive)
  message: 'Too many authentication attempts, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * CI/CD ingestion rate limiter
 * @constant {RateLimitRequestHandler}
 * @description More lenient rate limit for automated CI/CD systems.
 * Uses API key as identifier instead of IP (allows multiple CI systems).
 * Allows 10 scan submissions per minute per API key.
 * 
 * @example
 * router.post('/scans', ingestionLimiter, createScan);
 */
export const ingestionLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute time window (shorter for CI/CD)
  max: 10, // Maximum 10 requests per minute per API key
  message: 'Too many scan submissions, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  /**
   * Custom key generator for rate limiting
   * Uses API key if present (for CI/CD), otherwise falls back to IP
   * This allows multiple CI systems to use different API keys
   * @param {Request} req - Express request object
   * @returns {string} Key for rate limiting (API key or IP address)
   */
  keyGenerator: (req: Request) => {
    // Prefer API key over IP for CI/CD systems
    // This allows multiple CI systems to have separate rate limits
    return (req.headers['x-api-key'] as string) || req.ip || 'unknown';
  },
});

