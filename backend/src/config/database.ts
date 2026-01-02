/**
 * @fileoverview Database Configuration
 * @description Prisma Client singleton setup and connection management.
 * Ensures only one database connection pool is created and properly managed.
 * 
 * @module config/database
 */

import { PrismaClient } from '@prisma/client';

/**
 * Global Prisma client storage
 * @description Used to store Prisma instance in development to prevent
 * multiple instances during hot module reloading
 * @type {Object}
 */
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

/**
 * Prisma Client singleton instance
 * @type {PrismaClient}
 * @description Single database connection pool for the entire application.
 * In development, reuses existing instance to prevent connection pool exhaustion.
 * Logs queries in development for debugging, only errors in production.
 */
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    // Log SQL queries in development for debugging
    // Only log errors in production to reduce noise
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

// Store instance globally in development to prevent multiple instances
// This is important for Next.js and other frameworks with hot reloading
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

/**
 * Gracefully disconnect from database
 * @async
 * @function disconnectPrisma
 * @returns {Promise<void>}
 * @description Closes all database connections and cleans up connection pool.
 * Should be called during application shutdown to prevent connection leaks.
 * 
 * @example
 * process.on('SIGTERM', async () => {
 *   await disconnectPrisma();
 *   process.exit(0);
 * });
 */
export async function disconnectPrisma() {
  await prisma.$disconnect();
}

