/**
 * @fileoverview SBOM Routes
 * @description API routes for Software Bill of Materials operations
 * 
 * @module routes/sbom
 */

import { Router } from 'express';
import { SbomController } from '../controllers/sbomController';
import { authenticateJWT, authenticateApiKey } from '../middleware/auth';

const router = Router();

/**
 * POST /api/v1/sbom/generate
 * Generate SBOM for a scan
 * @access Keep API key auth for CI/CD integrations
 */
router.post('/generate', authenticateApiKey, SbomController.generateSbom);

/**
 * GET /api/v1/sbom
 * Get SBOM records for a scan
 * @access Public for MVP (TODO: add authentication)
 */
router.get('/', SbomController.getSbomRecords);

/**
 * GET /api/v1/sbom/:id
 * Get SBOM by ID
 * @access Public for MVP (TODO: add authentication)
 */
router.get('/:id', SbomController.getSbomById);

/**
 * GET /api/v1/sbom/:id/vulnerabilities
 * Analyze vulnerabilities from SBOM
 * @access Public for MVP (TODO: add authentication)
 */
router.get('/:id/vulnerabilities', SbomController.analyzeVulnerabilities);

export default router;


