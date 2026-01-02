import { Router } from 'express';
import { ScanController } from '../controllers/scanController';
import { authenticateApiKey, authenticateJWT } from '../middleware/auth';
import { apiLimiter, ingestionLimiter } from '../middleware/rateLimit';

const router = Router();

/**
 * Scan routes
 * POST /api/v1/scans - Create scan (CI/CD integration, uses API key)
 * GET /api/v1/scans - List scans (requires JWT)
 * GET /api/v1/scans/:id - Get scan by ID (requires JWT)
 * GET /api/v1/scans/latest - Get latest scan (requires JWT)
 */

// CI/CD ingestion endpoint (API key auth)
router.post(
  '/',
  ingestionLimiter,
  authenticateApiKey,
  ScanController.createScan
);

// All other endpoints require JWT authentication
router.use(authenticateJWT);

router.get('/', apiLimiter, ScanController.listScans);
router.get('/latest', apiLimiter, ScanController.getLatestScan);
router.get('/:id', apiLimiter, ScanController.getScan);

export default router;


