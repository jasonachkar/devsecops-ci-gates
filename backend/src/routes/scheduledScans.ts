/**
 * @fileoverview Scheduled Scans Routes
 * @description API routes for managing scheduled repository scans
 * 
 * @module routes/scheduledScans
 */

import { Router } from 'express';
import { ScheduledScanController } from '../controllers/scheduledScanController';
import { authenticateJWT } from '../middleware/auth';
import { apiLimiter } from '../middleware/rateLimit';

const router = Router();

/**
 * Scheduled scan routes
 * All routes require JWT authentication
 */

// Apply JWT authentication to all routes
router.use(authenticateJWT);

/**
 * @route GET /api/v1/scheduled-scans
 * @description List all scheduled scans
 * @access Private (requires JWT)
 */
router.get('/', apiLimiter, ScheduledScanController.listSchedules);

/**
 * @route GET /api/v1/scheduled-scans/:id
 * @description Get scheduled scan by ID
 * @access Private (requires JWT)
 */
router.get('/:id', apiLimiter, ScheduledScanController.getSchedule);

/**
 * @route POST /api/v1/scheduled-scans
 * @description Create new scheduled scan
 * @access Private (requires JWT)
 */
router.post('/', apiLimiter, ScheduledScanController.createSchedule);

/**
 * @route PATCH /api/v1/scheduled-scans/:id
 * @description Update scheduled scan
 * @access Private (requires JWT)
 */
router.patch('/:id', apiLimiter, ScheduledScanController.updateSchedule);

/**
 * @route DELETE /api/v1/scheduled-scans/:id
 * @description Delete scheduled scan
 * @access Private (requires JWT)
 */
router.delete('/:id', apiLimiter, ScheduledScanController.deleteSchedule);

/**
 * @route POST /api/v1/scheduled-scans/:id/trigger
 * @description Manually trigger a scheduled scan
 * @access Private (requires JWT)
 */
router.post('/:id/trigger', apiLimiter, ScheduledScanController.triggerScan);

export default router;
