/**
 * @fileoverview Logger Configuration
 * @description Winston logger setup for structured logging.
 * Provides consistent log formatting, levels, and transports across the application.
 * 
 * @module config/logger
 */

import winston from 'winston';
import fs from 'fs';
import path from 'path';

// Ensure logs directory exists in production
if (process.env.NODE_ENV === 'production') {
  const logsDir = path.join(process.cwd(), 'logs');
  if (!fs.existsSync(logsDir)) {
    try {
      fs.mkdirSync(logsDir, { recursive: true });
    } catch (err) {
      console.warn('Could not create logs directory, file logging disabled:', err);
    }
  }
}

/**
 * Winston logger instance
 * @type {winston.Logger}
 * @description Production-ready structured logger with:
 * - JSON formatting for production (machine-readable)
 * - Colorized console output for development (human-readable)
 * - File transports for production error logging
 * - Stack trace capture for errors
 * - Timestamp on all log entries
 * 
 * @example
 * logger.info('User logged in', { userId: '123', email: 'user@example.com' });
 * logger.error('Database connection failed', { error: err });
 */
export const logger = winston.createLogger({
  // Log level from environment (error, warn, info, debug)
  level: process.env.LOG_LEVEL || 'info',
  
  // Log format: timestamp + error stack traces + JSON structure
  format: winston.format.combine(
    winston.format.timestamp(), // Add timestamp to all logs
    winston.format.errors({ stack: true }), // Include stack traces for errors
    winston.format.json() // Format as JSON for structured logging
  ),
  
  // Default metadata included in all logs
  defaultMeta: { service: 'devsecops-api' },
  
  // Log transports (where logs are written)
  transports: [
    // Console transport - always enabled
    // Colorized and simple format in development, JSON in production
    new winston.transports.Console({
      format: process.env.NODE_ENV === 'development'
        ? winston.format.combine(
            winston.format.colorize(), // Color-coded log levels
            winston.format.simple() // Simple readable format
          )
        : winston.format.json(), // JSON format for log aggregation tools
    }),
    
    // File transports - only in production
    // Separate files for errors and all logs
    ...(process.env.NODE_ENV === 'production'
      ? [
          // Error log file - only errors and above
          new winston.transports.File({
            filename: 'logs/error.log',
            level: 'error',
          }),
          // Combined log file - all log levels
          new winston.transports.File({
            filename: 'logs/combined.log',
          }),
        ]
      : []),
  ],
});

