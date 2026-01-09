/**
 * @fileoverview AWS Security Hub Service
 * @description Integrates with AWS Security Hub to sync and manage security findings.
 * Maps AWS Security Hub findings to normalized format for unified dashboard display.
 * Handles pagination, severity mapping, and database storage.
 * 
 * @module services/aws/securityHubService
 */

import {
  SecurityHubClient,
  GetFindingsCommand,
  AwsSecurityFinding,
} from '@aws-sdk/client-securityhub';
import { env } from '../../config/env';
import { prisma } from '../../config/database';
import { logger } from '../../config/logger';
import type { SeverityLevel } from '../../types';

/**
 * AWS Security Hub Service Class
 * @class SecurityHubService
 * @description Manages integration with AWS Security Hub
 * Provides methods to sync findings and query stored findings
 */
export class SecurityHubService {
  /** AWS Security Hub client instance (null if not configured) */
  private client: SecurityHubClient | null = null;

  /**
   * Create Security Hub service instance
   * @constructor
   * @description Initializes AWS SDK client if credentials are configured.
   * Service is optional - app works without AWS if credentials are not provided.
   */
  constructor() {
    // Only initialize if AWS is enabled and credentials are provided
    if (env.AWS_SECURITY_HUB_ENABLED && env.AWS_ACCESS_KEY_ID && env.AWS_SECRET_ACCESS_KEY) {
      this.client = new SecurityHubClient({
        region: env.AWS_REGION, // AWS region (e.g., us-east-1)
        credentials: {
          accessKeyId: env.AWS_ACCESS_KEY_ID,
          secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
        },
      });
      logger.info('AWS Security Hub client initialized', { region: env.AWS_REGION });
    } else {
      logger.warn('AWS Security Hub disabled or credentials not configured');
    }
  }

  /**
   * Sync findings from AWS Security Hub
   * Fetches active findings and stores them in the database
   */
  async syncFindings(awsAccountId?: string) {
    if (!this.client) {
      throw new Error('AWS Security Hub is not enabled or configured');
    }

    try {
      logger.info('Starting Security Hub sync', { awsAccountId });

      const findings: AwsSecurityFinding[] = [];
      let nextToken: string | undefined;

      // Fetch all findings (paginated)
      do {
        const command = new GetFindingsCommand({
          Filters: {
            RecordState: [{ Value: 'ACTIVE', Comparison: 'EQUALS' }],
            ...(awsAccountId && {
              AwsAccountId: [{ Value: awsAccountId, Comparison: 'EQUALS' }],
            }),
          },
          MaxResults: 100,
          NextToken: nextToken,
        });

        const response = await this.client.send(command);
        if (response.Findings) {
          findings.push(...response.Findings);
        }
        nextToken = response.NextToken;
      } while (nextToken);

      logger.info(`Fetched ${findings.length} findings from Security Hub`);

      // Store findings in database
      const stored = await this.storeFindings(findings);

      return {
        total: findings.length,
        stored,
        syncedAt: new Date(),
      };
    } catch (error) {
      logger.error('Failed to sync Security Hub findings', { error });
      throw error;
    }
  }

  /**
   * Store Security Hub findings in database
   */
  private async storeFindings(findings: AwsSecurityFinding[]) {
    let stored = 0;

    for (const finding of findings) {
      try {
        if (!finding.Id) {
          logger.warn('Skipping Security Hub finding without Id');
          continue;
        }
        // Map AWS severity to our severity levels
        const severity = this.mapSeverity(finding.Severity?.Normalized || finding.Severity?.Label);

        await prisma.awsSecurityFinding.upsert({
          where: { awsFindingId: finding.Id },
          update: {
            title: finding.Title || 'Untitled Finding',
            description: finding.Description,
            severity,
            status: finding.Workflow?.Status || 'NEW',
            resourceType: finding.Resources?.[0]?.Type,
            resourceId: finding.Resources?.[0]?.Id,
            complianceStatus: finding.Compliance?.Status,
            workflowStatus: finding.Workflow?.Status,
            recordState: finding.RecordState,
            awsAccountId: finding.AwsAccountId,
            region: finding.Region,
            rawData: finding as any,
            updatedAt: new Date(),
          },
          create: {
            awsFindingId: finding.Id,
            title: finding.Title || 'Untitled Finding',
            description: finding.Description,
            severity,
            status: finding.Workflow?.Status || 'NEW',
            resourceType: finding.Resources?.[0]?.Type,
            resourceId: finding.Resources?.[0]?.Id,
            complianceStatus: finding.Compliance?.Status,
            workflowStatus: finding.Workflow?.Status,
            recordState: finding.RecordState,
            awsAccountId: finding.AwsAccountId,
            region: finding.Region,
            rawData: finding as any,
          },
        });

        stored++;
      } catch (error) {
        logger.error('Failed to store Security Hub finding', {
          findingId: finding.Id,
          error,
        });
      }
    }

    return stored;
  }

  /**
   * Map AWS Security Hub severity to normalized severity
   */
  private mapSeverity(awsSeverity?: string | number): SeverityLevel {
    if (!awsSeverity) return 'info';

    if (typeof awsSeverity === 'number') {
      if (awsSeverity >= 90) return 'critical';
      if (awsSeverity >= 70) return 'high';
      if (awsSeverity >= 40) return 'medium';
      if (awsSeverity >= 1) return 'low';
      return 'info';
    }

    const normalized = awsSeverity.toUpperCase();
    
    if (normalized === 'CRITICAL') return 'critical';
    if (normalized === 'HIGH') return 'high';
    if (normalized === 'MEDIUM') return 'medium';
    if (normalized === 'LOW') return 'low';
    
    return 'info';
  }

  /**
   * Get Security Hub findings from database with filtering
   * @async
   * @method getFindings
   * @param {Object} [filters] - Filtering and pagination options
   * @param {SeverityLevel} [filters.severity] - Filter by severity level
   * @param {string} [filters.status] - Filter by workflow status
   * @param {string} [filters.awsAccountId] - Filter by AWS account ID
   * @param {number} [filters.limit=50] - Maximum number of results
   * @param {number} [filters.offset=0] - Pagination offset
   * @returns {Promise<Object>} Object containing findings array and pagination metadata
   * @description Queries stored Security Hub findings from database.
   * Results are sorted by severity (critical first) then sync date (newest first).
   */
  async getFindings(filters?: {
    severity?: SeverityLevel;
    status?: string;
    awsAccountId?: string;
    limit?: number;
    offset?: number;
  }) {
    const {
      severity,
      status,
      awsAccountId,
      limit = 50,
      offset = 0,
    } = filters || {};

    // Build Prisma where clause dynamically
    const where: any = {};
    if (severity) where.severity = severity;
    if (status) where.status = status;
    if (awsAccountId) where.awsAccountId = awsAccountId;

    // Execute queries in parallel for performance
    const [findings, total] = await Promise.all([
      prisma.awsSecurityFinding.findMany({
        where,
        orderBy: [
          { severity: 'asc' }, // Critical first, then high, medium, low, info
          { syncedAt: 'desc' }, // Most recently synced first
        ],
        take: limit,
        skip: offset,
      }),
      prisma.awsSecurityFinding.count({ where }), // Total count for pagination
    ]);

    return {
      findings, // Array of finding records
      total, // Total count matching filters
      limit, // Applied limit
      offset, // Applied offset
    };
  }
}
