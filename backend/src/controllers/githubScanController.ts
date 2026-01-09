/**
 * @fileoverview GitHub Scan Controller
 * @description Handles HTTP requests for GitHub repository scanning
 * 
 * @module controllers/githubScanController
 */

import { Request, Response } from 'express';
import { logger } from '../config/logger';
import { ScannerService } from '../services/scanner';
import { ScanService } from '../services/scanService';
import { RepositoryService } from '../services/repositoryService';
import { GitHubService } from '../services/github';
import { z } from 'zod';

const scanGitHubRepoSchema = z.object({
  repository: z.string().min(1, 'Repository identifier is required'),
  triggeredBy: z.string().optional().default('manual'),
});

/**
 * GitHub Scan Controller
 * @class GitHubScanController
 */
export class GitHubScanController {
  /**
   * Scan a GitHub repository
   * @static
   * @async
   * @route POST /api/v1/github/scan
   * @access Private (requires JWT)
   */
  static async scanRepository(req: Request, res: Response) {
    try {
      // Validate request body
      const body = scanGitHubRepoSchema.parse(req.body);
      const { repository, triggeredBy } = body;

      logger.info('GitHub repository scan requested', { repository, triggeredBy });

      // Parse repository identifier
      const repoInfo = GitHubService.parseRepository(repository);
      if (!repoInfo) {
        return res.status(400).json({
          error: 'Invalid repository identifier',
          message: 'Use format: owner/repo or full GitHub URL',
        });
      }

      // Fetch repository metadata to ensure it exists
      try {
        await GitHubService.getRepositoryMetadata(repoInfo.owner, repoInfo.repo);
      } catch (error: any) {
        if (error.message.includes('not found')) {
          return res.status(404).json({
            error: 'Repository not found',
            message: error.message,
          });
        }
        throw error;
      }

      // Get or create repository record
      const repoRecord = await RepositoryService.getOrCreateRepository({
        name: repoInfo.repo,
        url: `https://github.com/${repoInfo.owner}/${repoInfo.repo}`,
        provider: 'github',
      });

      // Run security scan
      logger.info('Starting security scan', { repositoryId: repoRecord.id });
      const scanPayload = await ScannerService.scanGitHubRepository(repository, triggeredBy);

      // Store scan results in database
      const scan = await ScanService.createScan(scanPayload, repoRecord.id);

      logger.info('GitHub scan completed', {
        scanId: scan.id,
        repositoryId: repoRecord.id,
        totalFindings: scan.totalFindings,
        gateStatus: scan.gateStatus,
      });

      // Return scan results
      return res.status(201).json({
        success: true,
        data: {
          scan: {
            id: scan.id,
            repositoryId: repoRecord.id,
            status: scan.status,
            gateStatus: scan.gateStatus,
            totalFindings: scan.totalFindings,
            criticalCount: scan.criticalCount,
            highCount: scan.highCount,
            mediumCount: scan.mediumCount,
            lowCount: scan.lowCount,
            infoCount: scan.infoCount,
            startedAt: scan.startedAt,
            completedAt: scan.completedAt,
          },
          repository: {
            id: repoRecord.id,
            name: repoRecord.name,
            url: repoRecord.url,
          },
        },
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: 'Validation error',
          details: error.errors,
        });
      }

      logger.error('GitHub scan failed', { error });
      return res.status(500).json({
        error: 'Scan failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Get repository metadata without scanning
   * @static
   * @async
   * @route GET /api/v1/github/repository/:owner/:repo
   * @access Private (requires JWT)
   */
  static async getRepositoryInfo(req: Request, res: Response) {
    try {
      const { owner, repo } = req.params;

      if (!owner || !repo) {
        return res.status(400).json({
          error: 'Owner and repo parameters are required',
        });
      }

      const metadata = await GitHubService.getRepositoryMetadata(owner, repo);
      const commitHistory = await GitHubService.getCommitHistory(owner, repo, metadata.defaultBranch, 10);

      return res.json({
        success: true,
        data: {
          repository: metadata,
          recentCommits: commitHistory,
        },
      });
    } catch (error: any) {
      logger.error('Failed to fetch repository info', { error });
      
      if (error.message.includes('not found')) {
        return res.status(404).json({
          error: 'Repository not found',
          message: error.message,
        });
      }

      return res.status(500).json({
        error: 'Failed to fetch repository info',
        message: error.message,
      });
    }
  }
}
