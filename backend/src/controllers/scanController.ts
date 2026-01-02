/**
 * @fileoverview Scan Controller - Request handlers for scan endpoints
 * @description Handles HTTP requests for scan operations (create, read, list).
 * Validates requests, calls service layer, and formats responses.
 * 
 * @module controllers/scanController
 */

import { Response } from 'express';
import { ScanService } from '../services/scanService';
import { logger } from '../config/logger';
import type { AuthRequest } from '../middleware/auth';
import { createScanSchema } from '../utils/validators';

/**
 * Scan Controller Class
 * @class ScanController
 * @description Handles all scan-related HTTP requests
 * All methods are static as controllers are stateless
 */
export class ScanController {
  /**
   * Create a new security scan from CI/CD payload
   * @static
   * @async
   * @route POST /api/v1/scans
   * @access Private (requires API key)
   * @param {AuthRequest} req - Express request with API key authentication
   * @param {Response} res - Express response object
   * @returns {Promise<void>} Sends JSON response with created scan
   * @description Endpoint for CI/CD pipelines to submit scan results.
   * Requires API key authentication. Validates payload and creates scan record.
   * Emits WebSocket event for real-time dashboard updates.
   */
  static async createScan(req: AuthRequest, res: Response) {
    try {
      const validated = createScanSchema.parse(req.body);
      const repositoryId = req.apiKey?.repositoryId;

      if (!repositoryId) {
        return res.status(400).json({
          error: 'Repository ID required',
          message: 'API key must be associated with a repository',
        });
      }

      const scan = await ScanService.createScan(validated, repositoryId);

      // Emit WebSocket event
      const io = req.app.get('io');
      if (io) {
        io.to(`repository:${repositoryId}`).emit('scan:completed', {
          scanId: scan.id,
          repositoryId,
          status: scan.status,
          gateStatus: scan.gateStatus,
          totalFindings: scan.totalFindings,
        });
      }

      res.status(201).json({
        success: true,
        data: scan,
      });
    } catch (error) {
      logger.error('Failed to create scan', { error });
      throw error;
    }
  }

  /**
   * GET /api/v1/scans
   * List scans with filtering
   */
  static async listScans(req: AuthRequest, res: Response) {
    try {
      const {
        repositoryId,
        branch,
        status,
        limit = 50,
        offset = 0,
      } = req.query;

      const result = await ScanService.listScans({
        repositoryId: repositoryId as string,
        branch: branch as string,
        status: status as string,
        limit: Number(limit),
        offset: Number(offset),
      });

      res.json({
        success: true,
        data: result.scans,
        pagination: {
          total: result.total,
          limit: result.limit,
          offset: result.offset,
          hasMore: result.offset + result.limit < result.total,
        },
      });
    } catch (error) {
      logger.error('Failed to list scans', { error });
      throw error;
    }
  }

  /**
   * GET /api/v1/scans/:id
   * Get scan by ID
   */
  static async getScan(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const scan = await ScanService.getScanById(id);

      if (!scan) {
        return res.status(404).json({
          error: 'Not Found',
          message: `Scan with ID ${id} not found`,
        });
      }

      res.json({
        success: true,
        data: scan,
      });
    } catch (error) {
      logger.error('Failed to get scan', { error });
      throw error;
    }
  }

  /**
   * GET /api/v1/scans/latest
   * Get latest scan for repository
   */
  static async getLatestScan(req: AuthRequest, res: Response) {
    try {
      const { repositoryId } = req.query;

      if (!repositoryId) {
        return res.status(400).json({
          error: 'Bad Request',
          message: 'repositoryId query parameter is required',
        });
      }

      const scan = await ScanService.getLatestScan(repositoryId as string);

      if (!scan) {
        return res.status(404).json({
          error: 'Not Found',
          message: `No scans found for repository ${repositoryId}`,
        });
      }

      res.json({
        success: true,
        data: scan,
      });
    } catch (error) {
      logger.error('Failed to get latest scan', { error });
      throw error;
    }
  }
}

