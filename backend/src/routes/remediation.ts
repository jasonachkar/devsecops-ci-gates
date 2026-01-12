/**
 * @fileoverview Remediation Routes
 * @description API routes for remediation ticket management
 * 
 * @module routes/remediation
 */

import { Router } from 'express';
import { RemediationController } from '../controllers/remediationController';
import { authenticateJWT } from '../middleware/auth';
import { requireRole } from '../middleware/auth';

const router = Router();

/**
 * POST /api/v1/remediation/tickets
 * Create a new remediation ticket
 * @access Public for MVP (TODO: add authentication)
 */
router.post('/tickets', RemediationController.createTicket);

/**
 * GET /api/v1/remediation/tickets
 * Get tickets with filtering
 * @access Public for MVP (TODO: add authentication)
 */
router.get('/tickets', RemediationController.getTickets);

/**
 * PATCH /api/v1/remediation/tickets/:id/status
 * Update ticket status
 * @access Public for MVP (TODO: add authentication)
 */
router.patch('/tickets/:id/status', RemediationController.updateStatus);

/**
 * PATCH /api/v1/remediation/tickets/:id/assign
 * Assign ticket to user
 * @access Public for MVP (TODO: add authentication, engineer or admin)
 */
router.patch('/tickets/:id/assign', RemediationController.assignTicket);

/**
 * GET /api/v1/remediation/tickets/overdue
 * Get overdue tickets (SLA violations)
 * @access Public for MVP (TODO: add authentication)
 */
router.get('/tickets/overdue', RemediationController.getOverdueTickets);

export default router;


