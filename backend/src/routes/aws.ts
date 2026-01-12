import { Router } from 'express';
import { SecurityHubService } from '../services/aws/securityHubService';
import { CloudTrailService } from '../services/aws/cloudTrailService';
import { IamAnalysisService } from '../services/aws/iamAnalysisService';
import { authenticateJWT, requireRole } from '../middleware/auth';
import { apiLimiter } from '../middleware/rateLimit';
import { env } from '../config/env';

const router = Router();

/**
 * AWS routes
 * Public for MVP (TODO: add authentication and role requirements)
 */

// Temporarily public for MVP
// router.use(authenticateJWT);
// router.use(requireRole('admin', 'engineer'));

const securityHubService = new SecurityHubService();
const cloudTrailService = new CloudTrailService();
const iamAnalysisService = new IamAnalysisService();

/**
 * POST /api/v1/aws/securityhub/sync
 * Manually trigger Security Hub sync
 */
router.post('/securityhub/sync', apiLimiter, async (req, res, next) => {
  try {
    if (!env.AWS_SECURITY_HUB_ENABLED) {
      return res.status(503).json({
        error: 'Service Unavailable',
        message: 'AWS Security Hub is not enabled',
      });
    }

    const { awsAccountId } = req.body;

    const result = await securityHubService.syncFindings(awsAccountId);

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/v1/aws/securityhub/findings
 * Get Security Hub findings from database
 */
router.get('/securityhub/findings', apiLimiter, async (req, res, next) => {
  try {
    const {
      severity,
      status,
      awsAccountId,
      limit = 50,
      offset = 0,
    } = req.query;

    const result = await securityHubService.getFindings({
      severity: severity as any,
      status: status as string,
      awsAccountId: awsAccountId as string,
      limit: Number(limit),
      offset: Number(offset),
    });

    res.json({
      success: true,
      data: result.findings,
      pagination: {
        total: result.total,
        limit: result.limit,
        offset: result.offset,
        hasMore: result.offset + result.limit < result.total,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/v1/aws/cloudtrail/analyze
 * Analyze CloudTrail events for suspicious activity
 */
router.post('/cloudtrail/analyze', apiLimiter, async (req, res, next) => {
  try {
    const { startTime, endTime, eventName, username, awsAccountId } = req.body;

    const result = await cloudTrailService.analyzeEvents({
      startTime: startTime ? new Date(startTime) : undefined,
      endTime: endTime ? new Date(endTime) : undefined,
      eventName,
      username,
      awsAccountId,
    });

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/v1/aws/cloudtrail/recent
 * Get recent security events from CloudTrail
 */
router.get('/cloudtrail/recent', apiLimiter, async (req, res, next) => {
  try {
    const hours = Number(req.query.hours) || 24;

    const result = await cloudTrailService.getRecentSecurityEvents(hours);

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/v1/aws/iam/analyze
 * Analyze IAM policies for over-permissions
 */
router.post('/iam/analyze', apiLimiter, async (req, res, next) => {
  try {
    const result = await iamAnalysisService.analyzePolicies();

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
});

export default router;

