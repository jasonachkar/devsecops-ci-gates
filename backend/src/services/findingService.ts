/**
 * @fileoverview Finding Service - Business logic for security findings
 * @description Handles querying, filtering, and updating security findings.
 * Provides advanced filtering capabilities and bulk operations.
 * 
 * @module services/findingService
 */

import { prisma } from '../config/database';
import { logger } from '../config/logger';
import type { SeverityLevel, FindingStatus } from '../types';

/**
 * Finding Service Class
 * @class FindingService
 * @description Provides static methods for managing security findings
 * All methods are static as this is a stateless service layer
 */
export class FindingService {
  /**
   * List findings with advanced filtering
   */
  static async listFindings(filters: {
    repositoryId?: string;
    scanId?: string;
    severity?: SeverityLevel;
    tool?: string;
    status?: FindingStatus;
    assignedTo?: string;
    limit?: number;
    offset?: number;
    startDate?: string;
    endDate?: string;
  }) {
    const {
      repositoryId,
      scanId,
      severity,
      tool,
      status,
      assignedTo,
      limit = 50,
      offset = 0,
      startDate,
      endDate,
    } = filters;

    const where: any = {};

    if (scanId) {
      where.scanId = scanId;
    } else if (repositoryId) {
      where.scan = { repositoryId };
    }

    if (severity) where.severity = severity;
    if (tool) where.tool = tool;
    if (status) where.status = status;
    if (assignedTo) where.assignedTo = assignedTo;

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    const [findings, total] = await Promise.all([
      prisma.finding.findMany({
        where,
        orderBy: [
          { severity: 'asc' },
          { createdAt: 'desc' },
        ],
        take: limit,
        skip: offset,
        include: {
          scan: {
            include: {
              repository: true,
            },
          },
        },
      }),
      prisma.finding.count({ where }),
    ]);

    return {
      findings,
      total,
      limit,
      offset,
    };
  }

  /**
   * Get finding by ID
   */
  static async getFindingById(findingId: string) {
    return prisma.finding.findUnique({
      where: { id: findingId },
      include: {
        scan: {
          include: {
            repository: true,
          },
        },
        complianceMappings: true,
        remediationTickets: true,
      },
    });
  }

  /**
   * Update finding status
   */
  static async updateFindingStatus(
    findingId: string,
    status: FindingStatus,
    userId?: string,
    assignedTo?: string
  ) {
    const updateData: any = {
      status,
      updatedAt: new Date(),
    };

    if (status === 'resolved' && userId) {
      updateData.resolvedAt = new Date();
      updateData.resolvedBy = userId;
    }

    if (assignedTo !== undefined) {
      updateData.assignedTo = assignedTo || null;
    }

    const finding = await prisma.finding.update({
      where: { id: findingId },
      data: updateData,
    });

    logger.info('Finding status updated', {
      findingId,
      status,
      userId,
    });

    return finding;
  }

  /**
   * Bulk update finding statuses
   */
  static async bulkUpdateStatus(
    findingIds: string[],
    status: FindingStatus,
    userId?: string
  ) {
    const updateData: any = {
      status,
      updatedAt: new Date(),
    };

    if (status === 'resolved' && userId) {
      updateData.resolvedAt = new Date();
      updateData.resolvedBy = userId;
    }

    const result = await prisma.finding.updateMany({
      where: {
        id: { in: findingIds },
      },
      data: updateData,
    });

    logger.info('Bulk finding status updated', {
      count: result.count,
      status,
      userId,
    });

    return result;
  }
}

