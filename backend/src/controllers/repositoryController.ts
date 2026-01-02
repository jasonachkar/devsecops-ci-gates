/**
 * @fileoverview Repository Controller - Request handlers for repository endpoints
 * @description Handles HTTP requests for repository operations.
 * 
 * @module controllers/repositoryController
 */

import { Response } from 'express';
import { prisma } from '../config/database';
import { logger } from '../config/logger';
import type { AuthRequest } from '../middleware/auth';

/**
 * Repository Controller Class
 * @class RepositoryController
 */
export class RepositoryController {
  /**
   * Get all repositories
   * @route GET /api/v1/repositories
   */
  static async getRepositories(req: AuthRequest, res: Response) {
    try {
      const repositories = await prisma.repository.findMany({
        where: {
          isActive: true,
        },
        orderBy: {
          name: 'asc',
        },
        select: {
          id: true,
          name: true,
          url: true,
          provider: true,
          description: true,
          createdAt: true,
        },
      });

      res.json({
        success: true,
        data: repositories,
      });
    } catch (error) {
      logger.error('Failed to get repositories', { error });
      throw error;
    }
  }

  /**
   * Get repository by ID
   * @route GET /api/v1/repositories/:id
   */
  static async getRepositoryById(req: AuthRequest, res: Response) {
    try {
      const repository = await prisma.repository.findUnique({
        where: { id: req.params.id },
        include: {
          scans: {
            take: 10,
            orderBy: { createdAt: 'desc' },
          },
        },
      });

      if (!repository) {
        return res.status(404).json({
          error: 'Not Found',
          message: 'Repository not found',
        });
      }

      res.json({
        success: true,
        data: repository,
      });
    } catch (error) {
      logger.error('Failed to get repository', { error });
      throw error;
    }
  }
}


