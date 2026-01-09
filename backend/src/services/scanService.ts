/**
 * @fileoverview Scan Service - Business logic for security scan management
 * @description Handles creation, retrieval, and management of security scans
 * from CI/CD pipelines. Processes normalized scan results and stores them
 * in the database with proper relationships.
 * 
 * @module services/scanService
 */

import { prisma } from '../config/database';
import { logger } from '../config/logger';
import type { ScanPayload, SeverityLevel } from '../types';
import { scanPayloadSchema } from '../utils/validators';
import { PolicyEngine } from './policyEngine';
import { OWASPMapper } from './owaspMapper';

/**
 * Scan Service Class
 * @class ScanService
 * @description Provides static methods for managing security scans
 * All methods are static as this is a stateless service layer
 */
export class ScanService {
  /**
   * Create a new security scan from CI/CD payload
   * @static
   * @async
   * @param {ScanPayload} payload - Normalized scan data from CI/CD pipeline
   * @param {string} repositoryId - UUID of the repository this scan belongs to
   * @returns {Promise<Scan>} Created scan record with all findings
   * @throws {ZodError} If payload validation fails
   * @throws {PrismaError} If database operation fails
   * 
   * @example
   * const scan = await ScanService.createScan({
   *   metadata: { ... },
   *   summary: { ... },
   *   findings: [ ... ]
   * }, 'repo-uuid');
   */
  static async createScan(payload: ScanPayload, repositoryId: string) {
    // Validate payload structure and types using Zod schema
    // This ensures data integrity before database insertion
    const validated = scanPayloadSchema.parse(payload);

    // Calculate gate status using policy engine
    // Determines if scan should pass, warn, or fail CI/CD gates
    const policy = await PolicyEngine.getPolicy();
    // Ensure all required fields are present for policy evaluation
    const summary: ScanPayload['summary'] = {
      total: validated.summary.total,
      bySeverity: {
        critical: validated.summary.bySeverity.critical,
        high: validated.summary.bySeverity.high,
        medium: validated.summary.bySeverity.medium,
        low: validated.summary.bySeverity.low,
        info: validated.summary.bySeverity.info,
      },
      byTool: validated.summary.byTool || {},
    };
    const gateEvaluation = PolicyEngine.evaluateGate(summary, policy);
    const gateStatus = gateEvaluation.status;

    // Create scan record in database
    // Stores high-level scan metadata and aggregated counts
    const scan = await prisma.scan.create({
      data: {
        repositoryId, // Link to repository
        branch: validated.metadata.branch, // Git branch name
        commitSha: validated.metadata.commit, // Full commit SHA
        commitMessage: validated.metadata.commit, // Commit message (simplified)
        triggeredBy: validated.metadata.triggeredBy, // CI/CD system or user
        status: 'completed', // Scan is always completed when received
        gateStatus, // Calculated pass/warn/fail status
        totalFindings: validated.summary.total, // Total finding count
        criticalCount: validated.summary.bySeverity.critical, // Critical severity count
        highCount: validated.summary.bySeverity.high, // High severity count
        mediumCount: validated.summary.bySeverity.medium, // Medium severity count
        lowCount: validated.summary.bySeverity.low, // Low severity count
        infoCount: validated.summary.bySeverity.info, // Info severity count
        completedAt: new Date(validated.metadata.timestamp), // Scan completion timestamp
        metadata: validated.metadata as any, // Store full metadata as JSON
      },
    });

    // Create individual findings with compliance mappings
    // Only create if there are findings to avoid unnecessary DB calls
    if (validated.findings.length > 0) {
      // Create findings first to get IDs
      const findingRecords = await Promise.all(
        validated.findings.map((finding) =>
          prisma.finding.create({
            data: {
              scanId: scan.id, // Foreign key to scan
              tool: finding.tool, // Tool that found this (codeql, trivy, etc.)
              category: finding.category || null, // Category (sast, sca, etc.)
              severity: finding.severity, // Severity level (critical, high, etc.)
              ruleId: finding.ruleId || null, // Tool-specific rule identifier
              title: finding.title, // Human-readable finding title
              filePath: finding.file || null, // File path where finding was detected
              lineNumber: finding.line || null, // Line number (if applicable)
              cwe: finding.cwe || null, // CWE identifier (if applicable)
              cvssScore: finding.cvss ? finding.cvss : null, // CVSS score (0-10)
              message: finding.message || null, // Detailed finding message
              fingerprint: finding.fingerprint || null, // Unique fingerprint for deduplication
            },
          })
        )
      );

      // Create compliance mappings for OWASP Top 10
      const complianceMappings = [];
      for (let i = 0; i < validated.findings.length; i++) {
        const finding = validated.findings[i];
        const findingRecord = findingRecords[i];
        
        // Map to OWASP Top 10
        const owaspCategories = OWASPMapper.mapToOWASP(
          finding.cwe,
          finding.tool,
          finding.ruleId
        );

        for (const category of owaspCategories) {
          complianceMappings.push({
            findingId: findingRecord.id,
            framework: 'owasp-top10',
            category,
          });
        }
      }

      if (complianceMappings.length > 0) {
        await prisma.complianceMapping.createMany({
          data: complianceMappings,
        });
      }
    }

    logger.info('Scan created', {
      scanId: scan.id,
      repositoryId,
      totalFindings: validated.summary.total,
    });

    // Emit WebSocket event for real-time updates
    // Note: io is accessed via app.get('io') in controllers
    const io = (global as any).io;
    if (io) {
      io.to(`repository:${repositoryId}`).emit('scan:completed', {
        scanId: scan.id,
        repositoryId,
        status: scan.status,
        gateStatus: scan.gateStatus,
        totalFindings: scan.totalFindings,
      });
    }

    return scan;
  }

  /**
   * Retrieve a scan by its unique identifier
   * @static
   * @async
   * @param {string} scanId - UUID of the scan to retrieve
   * @returns {Promise<Scan | null>} Scan record with repository and findings (limited to 100)
   * @description Includes related repository and findings data
   * Findings are limited to 100 and sorted by severity (ascending) then creation date (descending)
   */
  static async getScanById(scanId: string) {
    return prisma.scan.findUnique({
      where: { id: scanId },
      include: {
        repository: true, // Include repository details
        findings: {
          take: 100, // Limit to 100 findings for performance
          orderBy: [
            { severity: 'asc' }, // Critical first, then high, medium, low, info
            { createdAt: 'desc' }, // Most recent first within same severity
          ],
        },
      },
    });
  }

  /**
   * Get the most recent scan for a repository
   * @static
   * @async
   * @param {string} repositoryId - UUID of the repository
   * @returns {Promise<Scan | null>} Latest scan record with repository details
   * @description Useful for displaying current security status on dashboard
   */
  static async getLatestScan(repositoryId: string) {
    return prisma.scan.findFirst({
      where: { repositoryId },
      orderBy: { createdAt: 'desc' }, // Most recent first
      include: {
        repository: true, // Include repository details
      },
    });
  }

  /**
   * List scans with optional filtering and pagination
   * @static
   * @async
   * @param {Object} filters - Filtering and pagination options
   * @param {string} [filters.repositoryId] - Filter by repository UUID
   * @param {string} [filters.branch] - Filter by branch name
   * @param {string} [filters.status] - Filter by scan status (running, completed, failed)
   * @param {number} [filters.limit=50] - Maximum number of results to return
   * @param {number} [filters.offset=0] - Number of results to skip (for pagination)
   * @returns {Promise<Object>} Object containing scans array, total count, limit, and offset
   * @description Supports pagination and multiple filter criteria
   * Returns both the filtered scans and total count for pagination UI
   */
  static async listScans(filters: {
    repositoryId?: string;
    branch?: string;
    status?: string;
    limit?: number;
    offset?: number;
  }) {
    const { repositoryId, branch, status, limit = 50, offset = 0 } = filters;

    // Build Prisma where clause dynamically based on provided filters
    const where: any = {};
    if (repositoryId) where.repositoryId = repositoryId;
    if (branch) where.branch = branch;
    if (status) where.status = status;

    // Execute queries in parallel for better performance
    // One query gets the data, another gets the total count
    const [scans, total] = await Promise.all([
      prisma.scan.findMany({
        where,
        orderBy: { createdAt: 'desc' }, // Most recent first
        take: limit, // Limit results
        skip: offset, // Skip for pagination
        include: {
          repository: true, // Include repository details
        },
      }),
      prisma.scan.count({ where }), // Get total count matching filters
    ]);

    return {
      scans, // Array of scan records
      total, // Total count (for pagination)
      limit, // Applied limit
      offset, // Applied offset
    };
  }

}

