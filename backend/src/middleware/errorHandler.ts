/**
 * @fileoverview Global Error Handler Middleware
 * @description Centralized error handling for all Express routes.
 * Provides consistent error responses, logging, and security (hides stack traces in production).
 * 
 * @module middleware/errorHandler
 */

import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { logger } from '../config/logger';

/**
 * Global error handler middleware
 * @function errorHandler
 * @param {Error} err - The error object
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next function (not used, but required signature)
 * @returns {void} Sends error response and does not call next()
 * @description Must be the last middleware in the Express app.
 * Handles all errors thrown in routes and provides appropriate HTTP status codes.
 * 
 * Error handling priority:
 * 1. Zod validation errors → 400 Bad Request
 * 2. Authentication errors → 401 Unauthorized
 * 3. Not found errors → 404 Not Found
 * 4. All other errors → 500 Internal Server Error
 * 
 * @example
 * app.use(errorHandler); // Must be last middleware
 */
export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  // Log all errors with context for debugging
  logger.error('API Error', {
    error: err.message, // Error message
    stack: err.stack, // Stack trace for debugging
    path: req.path, // Request path
    method: req.method, // HTTP method
  });

  // Handle Zod validation errors (input validation failures)
  if (err instanceof ZodError) {
    return res.status(400).json({
      error: 'Validation Error',
      details: err.errors.map((e) => ({
        path: e.path.join('.'), // Field path (e.g., 'metadata.timestamp')
        message: e.message, // Validation error message
      })),
    });
  }

  // Handle authentication/authorization errors
  if (err.name === 'UnauthorizedError' || err.message.includes('Unauthorized')) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Invalid or missing authentication',
    });
  }

  // Handle not found errors
  if (err.message.includes('Not Found')) {
    return res.status(404).json({
      error: 'Not Found',
      message: err.message,
    });
  }

  // Default error handling for all other errors
  // Use custom statusCode if provided, otherwise default to 500
  const statusCode = (err as any).statusCode || 500;
  
  // Hide error details in production for security
  // Only show generic message to prevent information leakage
  const message = process.env.NODE_ENV === 'production'
    ? 'Internal Server Error'
    : err.message;

  res.status(statusCode).json({
    error: 'Internal Server Error',
    message,
    // Only include stack trace in development
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
}

