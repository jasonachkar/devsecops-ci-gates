import { Router } from 'express';
import { TrendService } from '../services/trendService';
import { authenticateJWT } from '../middleware/auth';
import { apiLimiter } from '../middleware/rateLimit';
import { trendsQuerySchema } from '../utils/validators';

const router = Router();

/**
 * Trends routes
 * All endpoints require JWT authentication
 */

router.use(authenticateJWT);

/**
 * GET /api/v1/trends
 * Get historical trends
 */
router.get('/', apiLimiter, async (req, res, next) => {
  try {
    const validated = trendsQuerySchema.parse(req.query);
    
    const trends = await TrendService.getTrends({
      repositoryId: validated.repositoryId,
      days: validated.days,
      startDate: validated.startDate ? new Date(validated.startDate) : undefined,
      endDate: validated.endDate ? new Date(validated.endDate) : undefined,
    });

    res.json({
      success: true,
      data: trends,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/v1/trends/comparison
 * Compare two time periods
 */
router.get('/comparison', apiLimiter, async (req, res, next) => {
  try {
    const { repositoryId, period1Start, period1End, period2Start, period2End } = req.query;

    if (!repositoryId || !period1Start || !period1End || !period2Start || !period2End) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'All query parameters are required: repositoryId, period1Start, period1End, period2Start, period2End',
      });
    }

    const comparison = await TrendService.comparePeriods(
      repositoryId as string,
      new Date(period1Start as string),
      new Date(period1End as string),
      new Date(period2Start as string),
      new Date(period2End as string)
    );

    res.json({
      success: true,
      data: comparison,
    });
  } catch (error) {
    next(error);
  }
});

export default router;


