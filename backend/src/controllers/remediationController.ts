/**
 * @fileoverview Remediation Controller - Request handlers for remediation endpoints
 * @description Handles HTTP requests for remediation ticket operations.
 * 
 * @module controllers/remediationController
 */

import { Response } from 'express';
import { RemediationService } from '../services/remediationService';
import { logger } from '../config/logger';
import type { AuthRequest } from '../middleware/auth';

/**
 * Remediation Controller Class
 * @class RemediationController
 */
export class RemediationController {
  /**
   * Create a remediation ticket
   * @route POST /api/v1/remediation/tickets
   */
  static async createTicket(req: AuthRequest, res: Response) {
    try {
      const ticket = await RemediationService.createTicket({
        scanId: req.body.scanId,
        findingId: req.body.findingId,
        title: req.body.title,
        description: req.body.description,
        priority: req.body.priority,
        assignedTo: req.body.assignedTo,
        dueDate: req.body.dueDate ? new Date(req.body.dueDate) : undefined,
        metadata: req.body.metadata,
      });

      res.status(201).json({
        success: true,
        data: ticket,
      });
    } catch (error) {
      logger.error('Failed to create remediation ticket', { error });
      throw error;
    }
  }

  /**
   * Get tickets with filtering
   * @route GET /api/v1/remediation/tickets
   */
  static async getTickets(req: AuthRequest, res: Response) {
    try {
      const result = await RemediationService.getTickets({
        scanId: req.query.scanId as string,
        findingId: req.query.findingId as string,
        status: req.query.status as string,
        priority: req.query.priority as string,
        assignedTo: req.query.assignedTo as string,
        limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
        offset: req.query.offset ? parseInt(req.query.offset as string) : undefined,
      });

      res.json({
        success: true,
        data: result.tickets,
        pagination: {
          total: result.total,
          limit: result.limit,
          offset: result.offset,
          hasMore: result.offset + result.tickets.length < result.total,
        },
      });
    } catch (error) {
      logger.error('Failed to get remediation tickets', { error });
      throw error;
    }
  }

  /**
   * Update ticket status
   * @route PATCH /api/v1/remediation/tickets/:id/status
   */
  static async updateStatus(req: AuthRequest, res: Response) {
    try {
      const ticket = await RemediationService.updateStatus(
        req.params.id,
        req.body.status,
        req.user?.id
      );

      res.json({
        success: true,
        data: ticket,
      });
    } catch (error) {
      logger.error('Failed to update remediation ticket status', { error });
      throw error;
    }
  }

  /**
   * Assign ticket
   * @route PATCH /api/v1/remediation/tickets/:id/assign
   */
  static async assignTicket(req: AuthRequest, res: Response) {
    try {
      const ticket = await RemediationService.assignTicket(
        req.params.id,
        req.body.userId
      );

      res.json({
        success: true,
        data: ticket,
      });
    } catch (error) {
      logger.error('Failed to assign remediation ticket', { error });
      throw error;
    }
  }

  /**
   * Get overdue tickets
   * @route GET /api/v1/remediation/tickets/overdue
   */
  static async getOverdueTickets(req: AuthRequest, res: Response) {
    try {
      const tickets = await RemediationService.getOverdueTickets(
        req.query.repositoryId as string
      );

      res.json({
        success: true,
        data: tickets,
      });
    } catch (error) {
      logger.error('Failed to get overdue tickets', { error });
      throw error;
    }
  }
}


