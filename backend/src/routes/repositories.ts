/**
 * @fileoverview Repository Routes
 * @description API routes for repository management
 * 
 * @module routes/repositories
 */

import { Router } from 'express';
import { RepositoryController } from '../controllers/repositoryController';
import { authenticateJWT } from '../middleware/auth';

const router = Router();

/**
 * GET /api/v1/repositories
 * Get all repositories
 * @access Private (requires authentication)
 */
router.get('/', authenticateJWT, RepositoryController.getRepositories);

/**
 * GET /api/v1/repositories/:id
 * Get repository by ID
 * @access Private (requires authentication)
 */
router.get('/:id', authenticateJWT, RepositoryController.getRepositoryById);

export default router;


