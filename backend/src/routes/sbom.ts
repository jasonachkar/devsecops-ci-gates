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
 * @access Private (requires authentication or API key)
 */
router.post('/generate', authenticateApiKey, SbomController.generateSbom);

/**
 * GET /api/v1/sbom
 * Get SBOM records for a scan
 * @access Private (requires authentication)
 */
router.get('/', authenticateJWT, SbomController.getSbomRecords);

/**
 * GET /api/v1/sbom/:id
 * Get SBOM by ID
 * @access Private (requires authentication)
 */
router.get('/:id', authenticateJWT, SbomController.getSbomById);

/**
 * GET /api/v1/sbom/:id/vulnerabilities
 * Analyze vulnerabilities from SBOM
 * @access Private (requires authentication)
 */
router.get('/:id/vulnerabilities', authenticateJWT, SbomController.analyzeVulnerabilities);

export default router;


