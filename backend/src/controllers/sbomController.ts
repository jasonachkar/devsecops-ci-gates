/**
 * @fileoverview SBOM Controller - Request handlers for SBOM endpoints
 * @description Handles HTTP requests for SBOM operations.
 * 
 * @module controllers/sbomController
 */

import { Response } from 'express';
import { SbomService } from '../services/sbomService';
import { logger } from '../config/logger';
import type { AuthRequest } from '../middleware/auth';

/**
 * SBOM Controller Class
 * @class SbomController
 */
export class SbomController {
  /**
   * Generate SBOM for a scan
   * @route POST /api/v1/sbom/generate
   */
  static async generateSbom(req: AuthRequest, res: Response) {
    try {
      const { scanId, repositoryPath, format } = req.body;

      if (!scanId || !repositoryPath) {
        return res.status(400).json({
          error: 'Missing required fields',
          message: 'scanId and repositoryPath are required',
        });
      }

      const sbom = await SbomService.generateSbom(
        scanId,
        repositoryPath,
        format || 'cyclonedx-json'
      );

      res.status(201).json({
        success: true,
        data: sbom,
      });
    } catch (error) {
      logger.error('Failed to generate SBOM', { error });
      throw error;
    }
  }

  /**
   * Get SBOM records for a scan
   * @route GET /api/v1/sbom
   */
  static async getSbomRecords(req: AuthRequest, res: Response) {
    try {
      const { scanId, format } = req.query;

      if (!scanId) {
        return res.status(400).json({
          error: 'Missing required parameter',
          message: 'scanId is required',
        });
      }

      const records = await SbomService.getSbomRecords(
        scanId as string,
        format as string
      );

      res.json({
        success: true,
        data: records,
      });
    } catch (error) {
      logger.error('Failed to get SBOM records', { error });
      throw error;
    }
  }

  /**
   * Get SBOM by ID
   * @route GET /api/v1/sbom/:id
   */
  static async getSbomById(req: AuthRequest, res: Response) {
    try {
      const sbom = await SbomService.getSbomById(req.params.id);

      if (!sbom) {
        return res.status(404).json({
          error: 'Not Found',
          message: 'SBOM record not found',
        });
      }

      res.json({
        success: true,
        data: sbom,
      });
    } catch (error) {
      logger.error('Failed to get SBOM', { error });
      throw error;
    }
  }

  /**
   * Analyze vulnerabilities from SBOM
   * @route GET /api/v1/sbom/:id/vulnerabilities
   */
  static async analyzeVulnerabilities(req: AuthRequest, res: Response) {
    try {
      const analysis = await SbomService.analyzeVulnerabilities(req.params.id);

      res.json({
        success: true,
        data: analysis,
      });
    } catch (error) {
      logger.error('Failed to analyze SBOM vulnerabilities', { error });
      throw error;
    }
  }
}


