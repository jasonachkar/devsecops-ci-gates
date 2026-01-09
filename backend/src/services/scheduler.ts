/**
 * @fileoverview Scheduler Service
 * @description Background job scheduler using node-cron for scheduled scans
 * 
 * @module services/scheduler
 */

import * as cron from 'node-cron';
import { logger } from '../config/logger';
import { ScheduledScanService, type ScheduleType } from './scheduledScanService';
import { prisma } from '../config/database';

type CronJob = cron.ScheduledTask;

/**
 * Scheduler Service
 * @class Scheduler
 */
export class Scheduler {
  private static jobs: Map<string, CronJob> = new Map();
  private static isInitialized = false;

  /**
   * Initialize scheduler and load all enabled schedules
   * @static
   * @async
   */
  static async initialize() {
    if (this.isInitialized) {
      logger.warn('Scheduler already initialized');
      return;
    }

    logger.info('Initializing scheduler...');

    try {
      // Load all enabled schedules
      const schedules = await ScheduledScanService.getAllSchedules(true);

      logger.info(`Loading ${schedules.length} scheduled scans`);

      for (const schedule of schedules) {
        this.scheduleJob(schedule.id, schedule.scheduleType as ScheduleType, schedule.scheduleConfig as any);
      }

      this.isInitialized = true;
      logger.info('Scheduler initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize scheduler', { error });
      throw error;
    }
  }

  /**
   * Schedule a job for a scheduled scan
   * @static
   * @param {string} scheduleId - Schedule UUID
   * @param {ScheduleType} scheduleType - Schedule type
   * @param {any} config - Schedule configuration
   */
  static scheduleJob(scheduleId: string, scheduleType: ScheduleType, config: any) {
    // Remove existing job if present
    this.unscheduleJob(scheduleId);

    if (scheduleType === 'manual') {
      logger.debug(`Schedule ${scheduleId} is manual, skipping cron job creation`);
      return;
    }

    // Generate cron expression based on schedule type
    const cronExpression = this.generateCronExpression(scheduleType, config);

    if (!cronExpression) {
      logger.warn(`Invalid cron expression for schedule ${scheduleId}`);
      return;
    }

    logger.info(`Scheduling job for ${scheduleId}`, {
      scheduleType,
      cronExpression,
    });

    try {
      const job = cron.schedule(
        cronExpression,
        async () => {
          logger.info(`Executing scheduled scan: ${scheduleId}`);
          try {
            await ScheduledScanService.executeScheduledScan(scheduleId);
          } catch (error) {
            logger.error(`Failed to execute scheduled scan ${scheduleId}`, {
              error: error instanceof Error ? error.message : String(error),
            });
          }
        },
        {
          scheduled: true,
          timezone: config.timezone || 'UTC',
        }
      );

      this.jobs.set(scheduleId, job);
      logger.info(`Scheduled job created for ${scheduleId}`);
    } catch (error) {
      logger.error(`Failed to create cron job for schedule ${scheduleId}`, { error });
    }
  }

  /**
   * Unschedule a job
   * @static
   * @param {string} scheduleId - Schedule UUID
   */
  static unscheduleJob(scheduleId: string) {
    const job = this.jobs.get(scheduleId);
    if (job) {
      job.stop();
      this.jobs.delete(scheduleId);
      logger.info(`Unscheduled job for ${scheduleId}`);
    }
  }

  /**
   * Generate cron expression from schedule type and config
   * @private
   * @static
   * @param {ScheduleType} scheduleType - Schedule type
   * @param {any} config - Schedule configuration
   * @returns {string | null}
   */
  private static generateCronExpression(scheduleType: ScheduleType, config: any): string | null {
    const minute = config.minute ?? 0;
    const hour = config.hour ?? 2;

    switch (scheduleType) {
      case 'daily':
        // Run daily at specified hour:minute
        // Format: minute hour * * *
        return `${minute} ${hour} * * *`;

      case 'weekly':
        // Run weekly on specified day at hour:minute
        // Format: minute hour * * dayOfWeek (0-6, Sunday = 0)
        const dayOfWeek = config.dayOfWeek ?? 1; // Default to Monday
        return `${minute} ${hour} * * ${dayOfWeek}`;

      case 'monthly':
        // Run monthly on specified day at hour:minute
        // Format: minute hour dayOfMonth * *
        const dayOfMonth = config.dayOfMonth ?? 1;
        return `${minute} ${hour} ${dayOfMonth} * *`;

      default:
        return null;
    }
  }

  /**
   * Reload all schedules (useful after creating/updating schedules)
   * @static
   * @async
   */
  static async reload() {
    logger.info('Reloading scheduler...');

    // Stop all existing jobs
    for (const scheduleId of this.jobs.keys()) {
      this.unscheduleJob(scheduleId);
    }

    // Reinitialize
    await this.initialize();
  }

  /**
   * Get all active jobs
   * @static
   * @returns {string[]} Array of schedule IDs with active jobs
   */
  static getActiveJobs(): string[] {
    return Array.from(this.jobs.keys());
  }

  /**
   * Shutdown scheduler gracefully
   * @static
   */
  static shutdown() {
    logger.info('Shutting down scheduler...');

    for (const [scheduleId, job] of this.jobs.entries()) {
      job.stop();
      logger.debug(`Stopped job for schedule ${scheduleId}`);
    }

    this.jobs.clear();
    this.isInitialized = false;

    logger.info('Scheduler shut down');
  }

  /**
   * Process overdue scheduled scans (scans that should have run but didn't)
   * @static
   * @async
   */
  static async processOverdueScans() {
    logger.info('Checking for overdue scheduled scans...');

    const now = new Date();
    const overdueSchedules = await prisma.scheduledScan.findMany({
      where: {
        isEnabled: true,
        nextRunAt: {
          lte: now,
          not: null,
        },
        scheduleType: {
          not: 'manual',
        },
      },
      include: {
        repository: true,
      },
    });

    if (overdueSchedules.length === 0) {
      logger.debug('No overdue scheduled scans found');
      return;
    }

    logger.info(`Found ${overdueSchedules.length} overdue scheduled scans`);

    for (const schedule of overdueSchedules) {
      try {
        logger.info(`Processing overdue scan: ${schedule.id}`);
        await ScheduledScanService.executeScheduledScan(schedule.id);
      } catch (error) {
        logger.error(`Failed to process overdue scan ${schedule.id}`, {
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }
  }
}
