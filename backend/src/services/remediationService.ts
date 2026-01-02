/**
 * @fileoverview Remediation Service - Business logic for remediation ticket management
 * @description Handles creation, tracking, and management of remediation tickets.
 * Supports SLA monitoring, assignment, and integration with external issue trackers.
 * 
 * @module services/remediationService
 */

import { prisma } from '../config/database';
import { logger } from '../config/logger';

/**
 * Remediation Service Class
 * @class RemediationService
 * @description Provides static methods for managing remediation tickets
 */
export class RemediationService {
  /**
   * Create a remediation ticket for a finding
   * @static
   * @async
   * @param {Object} data - Ticket creation data
   * @param {string} data.scanId - Scan UUID
   * @param {string} [data.findingId] - Finding UUID (optional)
   * @param {string} data.title - Ticket title
   * @param {string} [data.description] - Ticket description
   * @param {string} [data.priority] - Priority level (low, medium, high, critical)
   * @param {string} [data.assignedTo] - User ID to assign ticket to
   * @param {Date} [data.dueDate] - Due date for SLA tracking
   * @param {Object} [data.metadata] - External tracker metadata (Jira, GitHub Issues, etc.)
   * @returns {Promise<RemediationTicket>} Created ticket
   */
  static async createTicket(data: {
    scanId: string;
    findingId?: string;
    title: string;
    description?: string;
    priority?: string;
    assignedTo?: string;
    dueDate?: Date;
    metadata?: any;
  }) {
    const ticket = await prisma.remediationTicket.create({
      data: {
        scanId: data.scanId,
        findingId: data.findingId,
        title: data.title,
        description: data.description,
        priority: data.priority || 'medium',
        assignedTo: data.assignedTo,
        dueDate: data.dueDate,
        metadata: data.metadata,
        status: 'open',
      },
      include: {
        finding: true,
        scan: {
          include: {
            repository: true,
          },
        },
      },
    });

    logger.info('Remediation ticket created', {
      ticketId: ticket.id,
      scanId: data.scanId,
      findingId: data.findingId,
    });

    return ticket;
  }

  /**
   * Get tickets with filtering
   * @static
   * @async
   * @param {Object} filters - Filter options
   * @returns {Promise<Object>} Tickets and pagination metadata
   */
  static async getTickets(filters: {
    scanId?: string;
    findingId?: string;
    status?: string;
    priority?: string;
    assignedTo?: string;
    limit?: number;
    offset?: number;
  }) {
    const {
      scanId,
      findingId,
      status,
      priority,
      assignedTo,
      limit = 50,
      offset = 0,
    } = filters;

    const where: any = {};
    if (scanId) where.scanId = scanId;
    if (findingId) where.findingId = findingId;
    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (assignedTo) where.assignedTo = assignedTo;

    const [tickets, total] = await Promise.all([
      prisma.remediationTicket.findMany({
        where,
        orderBy: [
          { priority: 'asc' }, // Critical first
          { createdAt: 'desc' }, // Newest first
        ],
        take: limit,
        skip: offset,
        include: {
          finding: true,
          scan: {
            include: {
              repository: true,
            },
          },
        },
      }),
      prisma.remediationTicket.count({ where }),
    ]);

    return {
      tickets,
      total,
      limit,
      offset,
    };
  }

  /**
   * Update ticket status
   * @static
   * @async
   * @param {string} ticketId - Ticket UUID
   * @param {string} status - New status
   * @param {string} [userId] - User making the update
   * @returns {Promise<RemediationTicket>} Updated ticket
   */
  static async updateStatus(
    ticketId: string,
    status: string,
    userId?: string
  ) {
    const updateData: any = {
      status,
      updatedAt: new Date(),
    };

    if (status === 'resolved' || status === 'closed') {
      updateData.resolvedAt = new Date();
    }

    const ticket = await prisma.remediationTicket.update({
      where: { id: ticketId },
      data: updateData,
      include: {
        finding: true,
        scan: {
          include: {
            repository: true,
          },
        },
      },
    });

    logger.info('Remediation ticket status updated', {
      ticketId,
      status,
      userId,
    });

    return ticket;
  }

  /**
   * Assign ticket to user
   * @static
   * @async
   * @param {string} ticketId - Ticket UUID
   * @param {string} userId - User ID to assign to
   * @returns {Promise<RemediationTicket>} Updated ticket
   */
  static async assignTicket(ticketId: string, userId: string) {
    const ticket = await prisma.remediationTicket.update({
      where: { id: ticketId },
      data: {
        assignedTo: userId,
        updatedAt: new Date(),
      },
      include: {
        finding: true,
        scan: {
          include: {
            repository: true,
          },
        },
      },
    });

    logger.info('Remediation ticket assigned', {
      ticketId,
      userId,
    });

    return ticket;
  }

  /**
   * Get tickets with SLA violations (overdue)
   * @static
   * @async
   * @param {string} [repositoryId] - Filter by repository
   * @returns {Promise<RemediationTicket[]>} Overdue tickets
   */
  static async getOverdueTickets(repositoryId?: string) {
    const where: any = {
      status: {
        in: ['open', 'in_progress'],
      },
      dueDate: {
        lt: new Date(), // Due date is in the past
      },
    };

    if (repositoryId) {
      where.scan = { repositoryId };
    }

    return prisma.remediationTicket.findMany({
      where,
      include: {
        finding: true,
        scan: {
          include: {
            repository: true,
          },
        },
      },
      orderBy: {
        dueDate: 'asc', // Most overdue first
      },
    });
  }
}


