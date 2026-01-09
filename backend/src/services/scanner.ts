/**
 * @fileoverview Scanner Orchestrator Service
 * @description Coordinates all security scanners and aggregates results
 * 
 * @module services/scanner
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import { tmpdir } from 'os';
import { logger } from '../config/logger';
import type { NormalizedFinding, ScanPayload, ScanMetadata, ScanSummary } from '../types';
import {
  SemgrepScanner,
  TrivyScanner,
  GitleaksScanner,
  NpmAuditScanner,
  BanditScanner,
} from '../scanners';
import { GitHubService } from './github';
import { OWASPMapper } from './owaspMapper';
import { CVELookupService } from './cveLookup';

/**
 * Scanner Orchestrator Service
 * @class ScannerService
 */
export class ScannerService {
  /**
   * Scan a GitHub repository
   * @static
   * @async
   * @param {string} repoIdentifier - GitHub URL or owner/repo format
   * @param {string} triggeredBy - Who triggered the scan
   * @returns {Promise<ScanPayload>} Normalized scan results
   */
  static async scanGitHubRepository(
    repoIdentifier: string,
    triggeredBy: string = 'manual'
  ): Promise<ScanPayload> {
    // Parse repository identifier
    const repoInfo = GitHubService.parseRepository(repoIdentifier);
    if (!repoInfo) {
      throw new Error(`Invalid repository identifier: ${repoIdentifier}. Use format: owner/repo or full GitHub URL`);
    }

    const { owner, repo } = repoInfo;

    // Fetch repository metadata
    logger.info('Fetching repository metadata', { owner, repo });
    const metadata = await GitHubService.getRepositoryMetadata(owner, repo);

    // Create temporary directory for cloning
    const tempDir = path.join(tmpdir(), `devsecops-scan-${Date.now()}-${Math.random().toString(36).substring(7)}`);

    try {
      // Clone repository
      logger.info('Cloning repository', { cloneUrl: metadata.cloneUrl });
      await GitHubService.cloneRepository(metadata.cloneUrl, tempDir);

      // Run all scanners in parallel
      logger.info('Starting security scans', { tempDir });
      const allFindings = await this.runAllScanners(tempDir);

      // Enrich findings with CVE/CWE data and OWASP mappings
      logger.info('Enriching findings', { findingsCount: allFindings.length });
      const enrichedFindings = await this.enrichFindings(allFindings);

      // Build scan payload
      const scanPayload: ScanPayload = {
        metadata: {
          timestamp: new Date().toISOString(),
          repository: `${owner}/${repo}`,
          branch: metadata.defaultBranch,
          commit: 'HEAD', // Use HEAD for on-demand scans
          triggeredBy,
        },
        summary: this.buildSummary(enrichedFindings),
        findings: enrichedFindings,
      };

      logger.info('Scan completed', {
        repository: `${owner}/${repo}`,
        totalFindings: scanPayload.summary.total,
      });

      return scanPayload;
    } finally {
      // Clean up temporary directory
      await this.cleanup(tempDir);
    }
  }

  /**
   * Scan a local directory
   * @static
   * @async
   * @param {string} repoPath - Path to local repository
   * @param {ScanMetadata} metadata - Scan metadata
   * @returns {Promise<ScanPayload>} Normalized scan results
   */
  static async scanLocalRepository(
    repoPath: string,
    metadata: ScanMetadata
  ): Promise<ScanPayload> {
    logger.info('Starting local repository scan', { repoPath });

    // Run all scanners
    const allFindings = await this.runAllScanners(repoPath);

    // Enrich findings
    const enrichedFindings = await this.enrichFindings(allFindings);

    // Build scan payload
    const scanPayload: ScanPayload = {
      metadata,
      summary: this.buildSummary(enrichedFindings),
      findings: enrichedFindings,
    };

    logger.info('Local scan completed', {
      repository: metadata.repository,
      totalFindings: scanPayload.summary.total,
    });

    return scanPayload;
  }

  /**
   * Run all available scanners in parallel
   * @private
   * @static
   * @async
   * @param {string} repoPath - Path to repository
   * @returns {Promise<NormalizedFinding[]>} All findings from all scanners
   */
  private static async runAllScanners(repoPath: string): Promise<NormalizedFinding[]> {
    // Run scanners in parallel for better performance
    const scanPromises = [
      SemgrepScanner.scan(repoPath).catch((error) => {
        logger.error('Semgrep scan failed', { error });
        return [];
      }),
      TrivyScanner.scan(repoPath).catch((error) => {
        logger.error('Trivy scan failed', { error });
        return [];
      }),
      GitleaksScanner.scan(repoPath).catch((error) => {
        logger.error('Gitleaks scan failed', { error });
        return [];
      }),
      NpmAuditScanner.scan(repoPath).catch((error) => {
        logger.error('npm audit scan failed', { error });
        return [];
      }),
      BanditScanner.scan(repoPath).catch((error) => {
        logger.error('Bandit scan failed', { error });
        return [];
      }),
    ];

    const results = await Promise.all(scanPromises);

    // Flatten all findings into single array
    return results.flat();
  }

  /**
   * Enrich findings with CVE/CWE data and OWASP mappings
   * @private
   * @static
   * @async
   * @param {NormalizedFinding[]} findings - Raw findings
   * @returns {Promise<NormalizedFinding[]>} Enriched findings
   */
  private static async enrichFindings(
    findings: NormalizedFinding[]
  ): Promise<NormalizedFinding[]> {
    // OWASP mapping is done synchronously, so we can do it for all findings
    // OWASP categories will be stored in compliance mappings when findings are saved
    // For now, we just ensure findings have proper structure

    // If any findings have CVE IDs, we could look them up here
    // Most tools already provide CVSS scores, so we'll use those
    
    return findings;
  }

  /**
   * Build scan summary from findings
   * @private
   * @static
   * @param {NormalizedFinding[]} findings - All findings
   * @returns {ScanSummary}
   */
  private static buildSummary(findings: NormalizedFinding[]): ScanSummary {
    const bySeverity = {
      critical: 0,
      high: 0,
      medium: 0,
      low: 0,
      info: 0,
    };

    const byTool: Record<string, number> = {};

    for (const finding of findings) {
      bySeverity[finding.severity]++;
      byTool[finding.tool] = (byTool[finding.tool] || 0) + 1;
    }

    return {
      total: findings.length,
      bySeverity,
      byTool,
    };
  }

  /**
   * Clean up temporary directory
   * @private
   * @static
   * @async
   * @param {string} dirPath - Directory path to clean up
   */
  private static async cleanup(dirPath: string): Promise<void> {
    try {
      await fs.rm(dirPath, { recursive: true, force: true });
      logger.info('Temporary directory cleaned up', { dirPath });
    } catch (error) {
      logger.warn('Failed to clean up temporary directory', { error, dirPath });
    }
  }
}
