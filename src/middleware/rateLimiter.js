import rateLimit from 'express-rate-limit';
import logger from '../utils/logger.js';

/**
 * Strict rate limiter for login: 5 attempts per 15 minutes per IP.
 */
export const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too many login attempts. Please try again after 15 minutes.',
  },
  handler(req, res, _next, options) {
    logger.warn(`Rate limit exceeded for IP ${req.ip} on ${req.path}`);
    res.status(options.statusCode).json(options.message);
  },
});

/**
 * General API rate limiter: 100 requests per 15 minutes.
 */
export const apiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too many requests. Please slow down.',
  },
});

/**
 * Password reset limiter: 3 requests per hour.
 */
export const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 3,
  message: {
    success: false,
    error: 'Too many password reset requests. Try again in 1 hour.',
  },
});
