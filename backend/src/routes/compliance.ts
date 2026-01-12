import { Router } from 'express';
import { ComplianceService } from '../services/complianceService';
import { authenticateJWT } from '../middleware/auth';
import { apiLimiter } from '../middleware/rateLimit';

const router = Router();

/**
 * Compliance routes
 * Public for MVP (TODO: add authentication)
 */

// Temporarily public for MVP
// router.use(authenticateJWT);

/**
 * GET /api/v1/compliance/owasp-top10
 * Get OWASP Top 10 scorecard
 */
router.get('/owasp-top10', apiLimiter, async (req, res, next) => {
  try {
    const { repositoryId, scanId } = req.query;

    const scorecard = await ComplianceService.getOwaspTop10Scorecard(
      repositoryId as string | undefined,
      scanId as string | undefined
    );

    res.json({
      success: true,
      data: scorecard,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/v1/compliance/cwe-top25
 * Get CWE Top 25 scorecard
 */
router.get('/cwe-top25', apiLimiter, async (req, res, next) => {
  try {
    const { repositoryId, scanId } = req.query;

    const scorecard = await ComplianceService.getCweTop25Scorecard(
      repositoryId as string | undefined,
      scanId as string | undefined
    );

    res.json({
      success: true,
      data: scorecard,
    });
  } catch (error) {
    next(error);
  }
});

export default router;


