/**
 * @fileoverview Data Seeding Script
 * @description Script to manually seed demo data with vulnerable repositories
 * 
 * Usage: npm run seed:demo
 * 
 * @module scripts/seedData
 */

import 'dotenv/config';
import { DataSeeder } from '../services/dataSeeder';
import { logger } from '../config/logger';

async function main() {
  const days = process.argv[2] ? parseInt(process.argv[2], 10) : 30;

  if (isNaN(days) || days < 1 || days > 365) {
    console.error('Invalid number of days. Please provide a number between 1 and 365.');
    process.exit(1);
  }

  logger.info(`Starting data seeding with ${days} days of historical data`);

  try {
    await DataSeeder.seedVulnerableRepositories(days);
    logger.info('Data seeding completed successfully');
    process.exit(0);
  } catch (error) {
    logger.error('Data seeding failed', { error });
    process.exit(1);
  }
}

main();
