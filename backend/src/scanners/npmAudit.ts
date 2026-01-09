/**
 * @fileoverview npm audit Scanner Integration
 * @description Dependency vulnerability scanner for npm packages
 * Scans package.json and package-lock.json for known CVEs
 * 
 * @module scanners/npmAudit
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs/promises';
import * as path from 'path';
import { logger } from '../config/logger';
import type { NormalizedFinding, SeverityLevel } from '../types';

const execAsync = promisify(exec);

interface NpmAuditResult {
  vulnerabilities: {
    [packageName: string]: {
      name: string;
      severity: string;
      via: Array<{
        title: string;
        url: string;
        severity: string;
        cwe?: string[];
      }>;
      effects: string[];
      range: string;
      nodes: string[];
      fixAvailable: boolean | { name: string; version: string };
    };
  };
  metadata: {
    vulnerabilities: {
      info: number;
      low: number;
      moderate: number;
      high: number;
      critical: number;
      total: number;
    };
  };
}

/**
 * npm audit Scanner Class
 * @class NpmAuditScanner
 */
export class NpmAuditScanner {
  /**
   * Check if npm is available and package.json exists
   * @static
   * @param {string} repoPath - Path to repository
   * @returns {Promise<boolean>}
   */
  static async isAvailable(repoPath: string): Promise<boolean> {
    try {
      await execAsync('npm --version');
      const packageJsonPath = path.join(repoPath, 'package.json');
      await fs.access(packageJsonPath);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Scan npm dependencies for vulnerabilities
   * @static
   * @async
   * @param {string} repoPath - Path to repository
   * @returns {Promise<NormalizedFinding[]>} Array of normalized findings
   */
  static async scan(repoPath: string): Promise<NormalizedFinding[]> {
    if (!(await this.isAvailable(repoPath))) {
      logger.debug('npm/package.json not found, skipping npm audit');
      return [];
    }

    try {
      const outputFile = path.join('/tmp', `npm-audit-${Date.now()}.json`);

      // Run npm audit with JSON output
      // --audit-level=moderate to catch moderate+ issues
      // --production=false to include dev dependencies
      const command = `cd ${repoPath} && npm audit --json > ${outputFile} 2>&1 || true`;

      logger.info('Running npm audit scan', { repoPath });

      // npm audit exits with non-zero if vulnerabilities found, so we catch that
      await execAsync(command, { maxBuffer: 10 * 1024 * 1024 });

      // Read results
      const output = await fs.readFile(outputFile, 'utf-8');
      await fs.unlink(outputFile).catch(() => {});

      // Parse JSON - npm audit might output error JSON if audit fails
      let results: NpmAuditResult;
      try {
        results = JSON.parse(output);
      } catch (parseError) {
        logger.warn('Failed to parse npm audit output', { repoPath, output });
        return [];
      }

      // Check if there are vulnerabilities
      if (!results.vulnerabilities || Object.keys(results.vulnerabilities).length === 0) {
        logger.info('npm audit found no vulnerabilities', { repoPath });
        return [];
      }

      // Normalize findings
      const findings: NormalizedFinding[] = [];

      for (const [packageName, vuln] of Object.entries(results.vulnerabilities)) {
        // Get the primary vulnerability (first via entry)
        const primaryVuln = vuln.via[0];
        
        if (typeof primaryVuln === 'string') {
          // If via is a string, it's a dependency path
          continue;
        }

        const severity = this.mapSeverity(primaryVuln.severity || vuln.severity);

        findings.push({
          tool: 'npm-audit',
          category: 'sca',
          severity,
          ruleId: primaryVuln.title || packageName,
          title: `${packageName}: ${primaryVuln.title || 'Known vulnerability'}`,
          file: 'package.json',
          cwe: primaryVuln.cwe?.[0],
          message: `Vulnerability in ${packageName}${vuln.range ? ` (${vuln.range})` : ''}. ${primaryVuln.url || ''}`,
          fingerprint: `npm-audit:${packageName}:${primaryVuln.title || 'vuln'}`,
        });
      }

      logger.info('npm audit scan completed', {
        repoPath,
        findingsCount: findings.length,
      });

      return findings;
    } catch (error) {
      logger.error('npm audit scan failed', { error, repoPath });
      // Don't throw - dependency scan failures shouldn't block other scans
      return [];
    }
  }

  /**
   * Map npm audit severity to normalized severity
   * @private
   * @static
   * @param {string} npmSeverity - npm severity (critical, high, moderate, low, info)
   * @returns {SeverityLevel}
   */
  private static mapSeverity(npmSeverity: string): SeverityLevel {
    const normalized = npmSeverity.toLowerCase();
    if (normalized === 'critical') return 'critical';
    if (normalized === 'high') return 'high';
    if (normalized === 'moderate' || normalized === 'medium') return 'medium';
    if (normalized === 'low') return 'low';
    return 'info';
  }
}
