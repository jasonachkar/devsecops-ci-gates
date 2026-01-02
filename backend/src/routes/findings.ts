import { Router } from 'express';
import { FindingController } from '../controllers/findingController';
import { authenticateJWT, requireRole } from '../middleware/auth';
import { apiLimiter } from '../middleware/rateLimit';

const router = Router();

/**
 * Finding routes
 * All endpoints require JWT authentication
 * Write operations require engineer or admin role
 */

router.use(authenticateJWT);

router.get('/', apiLimiter, FindingController.listFindings);
router.get('/:id', apiLimiter, FindingController.getFinding);
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


