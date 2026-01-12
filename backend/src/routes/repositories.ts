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
 * @access Public (temporarily for MVP - TODO: add authentication)
 */
router.get('/', RepositoryController.getRepositories);

/**
 * GET /api/v1/repositories/:id
 * Get repository by ID
 * @access Public (temporarily for MVP - TODO: add authentication)
 */
router.get('/:id', RepositoryController.getRepositoryById);

export default router;


