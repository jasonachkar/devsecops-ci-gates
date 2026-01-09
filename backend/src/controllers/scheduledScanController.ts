/**
 * @fileoverview Scheduled Scan Controller
 * @description Handles HTTP requests for scheduled scan management
 * 
 * @module controllers/scheduledScanController
 */

import { Request, Response } from 'express';
import { logger } from '../config/logger';
import { ScheduledScanService } from '../services/scheduledScanService';
import { Scheduler } from '../services/scheduler';
import { z } from 'zod';
import type { AuthRequest } from '../middleware/auth';

const createScheduleSchema = z.object({
  repositoryId: z.string().uuid(),
  scheduleType: z.enum(['daily', 'weekly', 'monthly', 'manual']),
  config: z.object({
    hour: z.number().int().min(0).max(23).optional(),
    minute: z.number().int().min(0).max(59).optional(),
    dayOfWeek: z.number().int().min(0).max(6).optional(),
    dayOfMonth: z.number().int().min(1).max(31).optional(),
  }).optional(),
  timezone: z.string().optional().default('UTC'),
});

const updateScheduleSchema = z.object({
  config: z.object({
    hour: z.number().int().min(0).max(23).optional(),
    minute: z.number().int().min(0).max(59).optional(),
    dayOfWeek: z.number().int().min(0).max(6).optional(),
    dayOfMonth: z.number().int().min(1).max(31).optional(),
  }).optional(),
  isEnabled: z.boolean().optional(),
});

/**
 * Scheduled Scan Controller
 * @class ScheduledScanController
 */
export class ScheduledScanController {
  /**
   * List all scheduled scans
   * @static
   * @async
   * @route GET /api/v1/scheduled-scans
   * @access Private (requires JWT)
   */
  static async listSchedules(req: AuthRequest, res: Response) {
    try {
      const enabledOnly = req.query.enabled === 'true';
      const schedules = await ScheduledScanService.getAllSchedules(enabledOnly);

      return res.json({
        success: true,
        data: schedules,
      });
    } catch (error) {
      logger.error('Failed to list scheduled scans', { error });
      return res.status(500).json({
        error: 'Failed to list scheduled scans',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Get scheduled scan by ID
   * @static
   * @async
   * @route GET /api/v1/scheduled-scans/:id
   * @access Private (requires JWT)
   */
  static async getSchedule(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const schedule = await ScheduledScanService.getScheduleById(id);

      if (!schedule) {
        return res.status(404).json({
          error: 'Not Found',
          message: 'Scheduled scan not found',
        });
      }

      return res.json({
        success: true,
        data: schedule,
      });
    } catch (error) {
      logger.error('Failed to get scheduled scan', { error });
      return res.status(500).json({
        error: 'Failed to get scheduled scan',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Create new scheduled scan
   * @static
   * @async
   * @route POST /api/v1/scheduled-scans
   * @access Private (requires JWT)
   */
  static async createSchedule(req: AuthRequest, res: Response) {
    try {
      const body = createScheduleSchema.parse(req.body);
      const schedule = await ScheduledScanService.createSchedule(
        body.repositoryId,
        body.scheduleType,
        body.config,
        body.timezone
      );

      // Schedule the job if enabled
      if (schedule.isEnabled && schedule.scheduleType !== 'manual') {
        Scheduler.scheduleJob(
          schedule.id,
          schedule.scheduleType as any,
          schedule.scheduleConfig as any
        );
      }

      return res.status(201).json({
        success: true,
        data: schedule,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: 'Validation error',
          details: error.errors,
        });
      }

      logger.error('Failed to create scheduled scan', { error });
      return res.status(500).json({
        error: 'Failed to create scheduled scan',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Update scheduled scan
   * @static
   * @async
   * @route PATCH /api/v1/scheduled-scans/:id
   * @access Private (requires JWT)
   */
  static async updateSchedule(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const body = updateScheduleSchema.parse(req.body);

      const existing = await ScheduledScanService.getScheduleById(id);
      if (!existing) {
        return res.status(404).json({
          error: 'Not Found',
          message: 'Scheduled scan not found',
        });
      }

      const schedule = await ScheduledScanService.updateSchedule(
        id,
        body.config,
        body.isEnabled
      );

      // Reschedule job if needed
      if (schedule.isEnabled && schedule.scheduleType !== 'manual') {
        Scheduler.scheduleJob(
          schedule.id,
          schedule.scheduleType as any,
          schedule.scheduleConfig as any
        );
      } else {
        Scheduler.unscheduleJob(schedule.id);
      }

      return res.json({
        success: true,
        data: schedule,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: 'Validation error',
          details: error.errors,
        });
      }

      logger.error('Failed to update scheduled scan', { error });
      return res.status(500).json({
        error: 'Failed to update scheduled scan',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Delete scheduled scan
   * @static
   * @async
   * @route DELETE /api/v1/scheduled-scans/:id
   * @access Private (requires JWT)
   */
  static async deleteSchedule(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;

      await ScheduledScanService.deleteSchedule(id);
      Scheduler.unscheduleJob(id);

      return res.json({
        success: true,
        message: 'Scheduled scan deleted',
      });
    } catch (error) {
      logger.error('Failed to delete scheduled scan', { error });
      return res.status(500).json({
        error: 'Failed to delete scheduled scan',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Manually trigger a scheduled scan
   * @static
   * @async
   * @route POST /api/v1/scheduled-scans/:id/trigger
   * @access Private (requires JWT)
   */
  static async triggerScan(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;

      const scan = await ScheduledScanService.executeScheduledScan(id);

      return res.json({
        success: true,
        data: {
          scanId: scan.id,
          repositoryId: scan.repositoryId,
          status: scan.status,
          gateStatus: scan.gateStatus,
          totalFindings: scan.totalFindings,
        },
        message: 'Scan triggered successfully',
      });
    } catch (error) {
      logger.error('Failed to trigger scheduled scan', { error });
      return res.status(500).json({
        error: 'Failed to trigger scan',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
}
