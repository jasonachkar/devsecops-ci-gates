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
 * @access Private (requires authentication)
 */
router.post('/tickets', authenticateJWT, RemediationController.createTicket);

/**
 * GET /api/v1/remediation/tickets
 * Get tickets with filtering
 * @access Private (requires authentication)
 */
router.get('/tickets', authenticateJWT, RemediationController.getTickets);

/**
 * PATCH /api/v1/remediation/tickets/:id/status
 * Update ticket status
 * @access Private (requires authentication)
 */
router.patch('/tickets/:id/status', authenticateJWT, RemediationController.updateStatus);

/**
 * PATCH /api/v1/remediation/tickets/:id/assign
 * Assign ticket to user
 * @access Private (requires authentication, engineer or admin)
 */
router.patch('/tickets/:id/assign', authenticateJWT, requireRole('engineer', 'admin'), RemediationController.assignTicket);

/**
 * GET /api/v1/remediation/tickets/overdue
 * Get overdue tickets (SLA violations)
 * @access Private (requires authentication)
 */
router.get('/tickets/overdue', authenticateJWT, RemediationController.getOverdueTickets);

export default router;


