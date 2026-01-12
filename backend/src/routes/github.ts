/**
 * @fileoverview GitHub Routes
 * @description API routes for GitHub repository scanning and operations
 * 
 * @module routes/github
 */

import { Router } from 'express';
import { GitHubScanController } from '../controllers/githubScanController';
import { authenticateJWT } from '../middleware/auth';
import { apiLimiter } from '../middleware/rateLimit';

const router = Router();

/**
 * GitHub routes
 * Public for MVP (TODO: add authentication)
 */

// Temporarily public for MVP
// router.use(authenticateJWT);

/**
 * @route POST /api/v1/github/scan
 * @description Scan a GitHub repository for security issues
 * @access Private (requires JWT)
 */
router.post('/scan', apiLimiter, GitHubScanController.scanRepository);

/**
 * @route GET /api/v1/github/repository/:owner/:repo
 * @description Get repository metadata without scanning
 * @access Private (requires JWT)
 */
router.get('/repository/:owner/:repo', apiLimiter, GitHubScanController.getRepositoryInfo);

export default router;
