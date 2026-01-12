/**
 * @fileoverview Environment Configuration
 * @description Validates and parses environment variables using Zod.
 * Ensures all required configuration is present and valid before application startup.
 * Provides type-safe access to environment variables throughout the application.
 * 
 * @module config/env
 */

import 'dotenv/config';
import { z } from 'zod';

// Early startup logging to debug Fly.io issues
console.log('=== ENV STARTUP DEBUG ===');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('PORT:', process.env.PORT);
console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL);
console.log('DATABASE_URL length:', process.env.DATABASE_URL?.length || 0);
console.log('JWT_SECRET exists:', !!process.env.JWT_SECRET);
console.log('JWT_SECRET length:', process.env.JWT_SECRET?.length || 0);
console.log('CORS_ORIGIN:', process.env.CORS_ORIGIN);
console.log('=========================');

/**
 * Environment variable validation schema
 * @description Defines structure and validation rules for all environment variables.
 * Uses Zod for runtime validation and type inference.
 * 
 * @constant {z.ZodObject}
 */
const envSchema = z.object({
  // Server configuration
  NODE_ENV: z.string()
    .transform(val => val.toLowerCase())
    .pipe(z.enum(['development', 'production', 'test']))
    .default('development'),
  PORT: z.string().transform(Number).pipe(z.number().int().positive()).default('3001'),
  API_VERSION: z.string().default('v1'),

  // Database configuration
  DATABASE_URL: z.string().url(), // PostgreSQL connection string

  // Authentication configuration
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'), // Minimum length for security
  JWT_EXPIRES_IN: z.string().default('7d'), // Token expiration (e.g., '7d', '24h')

  // API key for CI/CD integration (optional)
  API_KEY_CI_CD: z.string().optional(),

  // AWS configuration (optional - only needed if AWS features are enabled)
  AWS_REGION: z.string().default('us-east-1'),
  AWS_ACCESS_KEY_ID: z.string().optional(),
  AWS_SECRET_ACCESS_KEY: z.string().optional(),
  AWS_SECURITY_HUB_ENABLED: z.string().transform(val => val === 'true').default('false'), // Convert string to boolean

  // GitHub configuration (optional - improves rate limits)
  GITHUB_TOKEN: z.string().optional(),

  // CORS configuration
  CORS_ORIGIN: z.string()
    .transform(val => val.replace(/\/+$/, '')) // Remove trailing slashes
    .default('http://localhost:5173'), // Comma-separated list of allowed origins

  // Logging configuration
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),

  // Data seeding configuration
  SEED_DEMO_DATA: z.string().transform(val => val === 'true').default('true'),
  SKIP_SEED: z.string().transform(val => val === 'true').default('false'),
  SCHEDULER_ENABLED: z.string().transform(val => val === 'true').default('true'),
});

/**
 * TypeScript type inferred from Zod schema
 * @type {z.infer<typeof envSchema>}
 * @description Provides type safety for environment variables
 */
export type Env = z.infer<typeof envSchema>;

/**
 * Validated environment variables
 * @type {Env}
 * @description Contains all validated environment variables.
 * Throws error and exits process if validation fails.
 */
let env: Env;

try {
  // Parse and validate all environment variables
  env = envSchema.parse(process.env);
  console.log('✅ Environment variables validated successfully');
} catch (error) {
  // Provide helpful error messages for missing/invalid variables
  if (error instanceof z.ZodError) {
    console.error('========================================');
    console.error('❌ FATAL: Invalid environment variables:');
    console.error('========================================');
    error.errors.forEach((err) => {
      console.error(`  - ${err.path.join('.')}: ${err.message}`);
    });
    console.error('========================================');
    console.error('Please set the required environment variables in Fly.io secrets');
    console.error('Required: DATABASE_URL, JWT_SECRET (min 32 chars)');
    console.error('========================================');
    process.exit(1); // Exit with error code
  }
  throw error;
}

/**
 * Export validated environment variables
 * @type {Env}
 */
export { env };

