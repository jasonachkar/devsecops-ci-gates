import { Router } from 'express';
import { ScanController } from '../controllers/scanController';
import { authenticateApiKey, authenticateJWT } from '../middleware/auth';
import { apiLimiter, ingestionLimiter } from '../middleware/rateLimit';

const router = Router();

/**
 * Scan routes
 * POST /api/v1/scans - Create scan (CI/CD integration, uses API key)
 * GET /api/v1/scans - List scans (public for MVP - TODO: add authentication)
 * GET /api/v1/scans/:id - Get scan by ID (public for MVP - TODO: add authentication)
 * GET /api/v1/scans/latest - Get latest scan (public for MVP - TODO: add authentication)
 */

// CI/CD ingestion endpoint (API key auth)
router.post(
  '/',
  ingestionLimiter,
  authenticateApiKey,
  ScanController.createScan
);

// GET endpoints temporarily public for MVP
router.get('/', apiLimiter, ScanController.listScans);
router.get('/latest', apiLimiter, ScanController.getLatestScan);
router.get('/:id', apiLimiter, ScanController.getScan);

export default router;


