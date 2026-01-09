/**
 * @fileoverview Scheduled Scan Service
 * @description Manages scheduled repository scans (CRUD operations)
 * 
 * @module services/scheduledScanService
 */

import { prisma } from '../config/database';
import { logger } from '../config/logger';
import { ScannerService } from './scanner';
import { ScanService } from './scanService';

export interface ScheduleConfig {
  hour?: number; // 0-23
  minute?: number; // 0-59
  dayOfWeek?: number; // 0-6 (Sunday = 0) for weekly
  dayOfMonth?: number; // 1-31 for monthly
}

export type ScheduleType = 'daily' | 'weekly' | 'monthly' | 'manual';

/**
 * Scheduled Scan Service
 * @class ScheduledScanService
 */
export class ScheduledScanService {
  /**
   * Create a new scheduled scan
   * @static
   * @async
   * @param {string} repositoryId - Repository UUID
   * @param {ScheduleType} scheduleType - Schedule type
   * @param {ScheduleConfig} config - Schedule configuration
   * @param {string} timezone - Timezone (default: UTC)
   * @returns {Promise<ScheduledScan>}
   */
  static async createSchedule(
    repositoryId: string,
    scheduleType: ScheduleType,
    config: ScheduleConfig = {},
    timezone: string = 'UTC'
  ) {
    // Validate repository exists
    const repository = await prisma.repository.findUnique({
      where: { id: repositoryId },
    });

    if (!repository) {
      throw new Error(`Repository ${repositoryId} not found`);
    }

    // Calculate next run time
    const nextRunAt = this.calculateNextRun(scheduleType, config, timezone);

    const schedule = await prisma.scheduledScan.create({
      data: {
        repositoryId,
        scheduleType,
        scheduleConfig: config as any,
        timezone,
        isEnabled: scheduleType !== 'manual',
        nextRunAt,
      },
      include: {
        repository: true,
      },
    });

    logger.info('Scheduled scan created', {
      scheduleId: schedule.id,
      repositoryId,
      scheduleType,
      nextRunAt,
    });

    return schedule;
  }

  /**
   * Update an existing schedule
   * @static
   * @async
   * @param {string} scheduleId - Schedule UUID
   * @param {Partial<ScheduleConfig>} config - Updated configuration
   * @param {boolean} isEnabled - Enable/disable schedule
   * @returns {Promise<ScheduledScan>}
   */
  static async updateSchedule(
    scheduleId: string,
    config?: Partial<ScheduleConfig>,
    isEnabled?: boolean
  ) {
    const existing = await prisma.scheduledScan.findUnique({
      where: { id: scheduleId },
    });

    if (!existing) {
      throw new Error(`Schedule ${scheduleId} not found`);
    }

    const updateData: any = {};

    if (config !== undefined) {
      const mergedConfig = { ...(existing.scheduleConfig as ScheduleConfig), ...config };
      updateData.scheduleConfig = mergedConfig;
      updateData.nextRunAt = this.calculateNextRun(
        existing.scheduleType as ScheduleType,
        mergedConfig,
        existing.timezone
      );
    }

    if (isEnabled !== undefined) {
      updateData.isEnabled = isEnabled;
    }

    const schedule = await prisma.scheduledScan.update({
      where: { id: scheduleId },
      data: updateData,
      include: {
        repository: true,
      },
    });

    logger.info('Scheduled scan updated', { scheduleId, updates: Object.keys(updateData) });

    return schedule;
  }

  /**
   * Delete a schedule
   * @static
   * @async
   * @param {string} scheduleId - Schedule UUID
   * @returns {Promise<void>}
   */
  static async deleteSchedule(scheduleId: string) {
    await prisma.scheduledScan.delete({
      where: { id: scheduleId },
    });

    logger.info('Scheduled scan deleted', { scheduleId });
  }

  /**
   * Get all schedules
   * @static
   * @async
   * @param {boolean} enabledOnly - Only return enabled schedules
   * @returns {Promise<ScheduledScan[]>}
   */
  static async getAllSchedules(enabledOnly: boolean = false) {
    const where = enabledOnly ? { isEnabled: true } : {};

    return prisma.scheduledScan.findMany({
      where,
      include: {
        repository: true,
      },
      orderBy: { nextRunAt: 'asc' },
    });
  }

  /**
   * Get schedule by ID
   * @static
   * @async
   * @param {string} scheduleId - Schedule UUID
   * @returns {Promise<ScheduledScan | null>}
   */
  static async getScheduleById(scheduleId: string) {
    return prisma.scheduledScan.findUnique({
      where: { id: scheduleId },
      include: {
        repository: true,
      },
    });
  }

  /**
   * Execute a scheduled scan
   * @static
   * @async
   * @param {string} scheduleId - Schedule UUID
   * @returns {Promise<Scan>}
   */
  static async executeScheduledScan(scheduleId: string) {
    const schedule = await prisma.scheduledScan.findUnique({
      where: { id: scheduleId },
      include: {
        repository: true,
      },
    });

    if (!schedule) {
      throw new Error(`Schedule ${scheduleId} not found`);
    }

    if (!schedule.isEnabled && schedule.scheduleType !== 'manual') {
      throw new Error(`Schedule ${scheduleId} is disabled`);
    }

    logger.info('Executing scheduled scan', {
      scheduleId,
      repository: schedule.repository.name,
    });

    try {
      // Run the scan
      const scanPayload = await ScannerService.scanGitHubRepository(
        schedule.repository.url,
        'scheduled-scan'
      );

      // Store results
      const scan = await ScanService.createScan(scanPayload, schedule.repositoryId);

      // Update schedule with last run time and next run time
      const nextRunAt = this.calculateNextRun(
        schedule.scheduleType as ScheduleType,
        schedule.scheduleConfig as ScheduleConfig,
        schedule.timezone
      );

      await prisma.scheduledScan.update({
        where: { id: scheduleId },
        data: {
          lastRunAt: new Date(),
          nextRunAt,
        },
      });

      logger.info('Scheduled scan completed', {
        scheduleId,
        scanId: scan.id,
        totalFindings: scan.totalFindings,
      });

      return scan;
    } catch (error) {
      logger.error('Scheduled scan failed', {
        scheduleId,
        error: error instanceof Error ? error.message : String(error),
      });

      // Update last run time even on failure
      await prisma.scheduledScan.update({
        where: { id: scheduleId },
        data: {
          lastRunAt: new Date(),
        },
      });

      throw error;
    }
  }

  /**
   * Calculate next run time based on schedule type and config
   * @static
   * @param {ScheduleType} scheduleType - Schedule type
   * @param {ScheduleConfig} config - Schedule configuration
   * @param {string} timezone - Timezone
   * @returns {Date | null}
   */
  static calculateNextRun(
    scheduleType: ScheduleType,
    config: ScheduleConfig,
    timezone: string = 'UTC'
  ): Date | null {
    if (scheduleType === 'manual') {
      return null;
    }

    const now = new Date();
    const next = new Date(now);

    const hour = config.hour ?? 2;
    const minute = config.minute ?? 0;

    switch (scheduleType) {
      case 'daily':
        next.setHours(hour, minute, 0, 0);
        if (next <= now) {
          next.setDate(next.getDate() + 1);
        }
        break;

      case 'weekly':
        const dayOfWeek = config.dayOfWeek ?? 1; // Default to Monday
        next.setHours(hour, minute, 0, 0);
        const currentDay = next.getDay();
        const daysUntilTarget = (dayOfWeek - currentDay + 7) % 7;
        if (daysUntilTarget === 0 && next <= now) {
          next.setDate(next.getDate() + 7);
        } else {
          next.setDate(next.getDate() + daysUntilTarget);
        }
        break;

      case 'monthly':
        const dayOfMonth = config.dayOfMonth ?? 1;
        next.setHours(hour, minute, 0, 0);
        next.setDate(dayOfMonth);
        if (next <= now) {
          next.setMonth(next.getMonth() + 1);
        }
        break;

      default:
        return null;
    }

    return next;
  }
}
