import { Router } from 'express';
import { FindingController } from '../controllers/findingController';
import { authenticateJWT, requireRole } from '../middleware/auth';
import { apiLimiter } from '../middleware/rateLimit';

const router = Router();

/**
 * Finding routes
 * Read endpoints public for MVP (TODO: add authentication)
 * Write operations require engineer or admin role
 */

// Read endpoints temporarily public for MVP
router.get('/', apiLimiter, FindingController.listFindings);
router.get('/:id', apiLimiter, FindingController.getFinding);

// Write operations still require authentication
router.use(authenticateJWT);
router.patch(
  '/:id',
  apiLimiter,
  requireRole('admin', 'engineer'),
  FindingController.updateFinding
);
router.post(
  '/bulk-update',
  apiLimiter,
  requireRole('admin', 'engineer'),
  FindingController.bulkUpdate
);

export default router;


