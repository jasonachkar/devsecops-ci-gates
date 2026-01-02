import { Response } from 'express';
import { FindingService } from '../services/findingService';
import { logger } from '../config/logger';
import type { AuthRequest } from '../middleware/auth';
import { findingsQuerySchema, updateFindingStatusSchema } from '../utils/validators';

/**
 * Controller for finding-related endpoints
 */
export class FindingController {
  /**
   * GET /api/v1/findings
   * List findings with advanced filtering
   */
  static async listFindings(req: AuthRequest, res: Response) {
    try {
      const validated = findingsQuerySchema.parse(req.query);

      const result = await FindingService.listFindings({
        repositoryId: validated.repositoryId,
        scanId: validated.scanId,
        severity: validated.severity,
        tool: validated.tool,
        status: validated.status,
        assignedTo: validated.assignedTo,
        limit: validated.limit,
        offset: validated.offset,
        startDate: validated.startDate,
        endDate: validated.endDate,
      });

      res.json({
        success: true,
        data: result.findings,
        pagination: {
          total: result.total,
          limit: result.limit,
          offset: result.offset,
          hasMore: result.offset + result.limit < result.total,
        },
      });
    } catch (error) {
      logger.error('Failed to list findings', { error });
      throw error;
    }
  }

  /**
   * GET /api/v1/findings/:id
   * Get finding by ID
   */
  static async getFinding(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const finding = await FindingService.getFindingById(id);

      if (!finding) {
        return res.status(404).json({
          error: 'Not Found',
          message: `Finding with ID ${id} not found`,
        });
      }

      res.json({
        success: true,
        data: finding,
      });
    } catch (error) {
      logger.error('Failed to get finding', { error });
      throw error;
    }
  }

  /**
   * PATCH /api/v1/findings/:id
   * Update finding status
   */
  static async updateFinding(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const validated = updateFindingStatusSchema.parse(req.body);

      const finding = await FindingService.updateFindingStatus(
        id,
        validated.status,
        req.user?.id,
        validated.assignedTo
      );

      res.json({
        success: true,
        data: finding,
      });
    } catch (error) {
      logger.error('Failed to update finding', { error });
      throw error;
    }
  }

  /**
   * POST /api/v1/findings/bulk-update
   * Bulk update finding statuses
   */
  static async bulkUpdate(req: AuthRequest, res: Response) {
    try {
      const { findingIds, status } = req.body;

      if (!Array.isArray(findingIds) || findingIds.length === 0) {
        return res.status(400).json({
          error: 'Bad Request',
          message: 'findingIds must be a non-empty array',
        });
      }

      const result = await FindingService.bulkUpdateStatus(
        findingIds,
        status,
        req.user?.id
      );

      res.json({
        success: true,
        data: {
          updated: result.count,
        },
      });
    } catch (error) {
      logger.error('Failed to bulk update findings', { error });
      throw error;
    }
  }
}


