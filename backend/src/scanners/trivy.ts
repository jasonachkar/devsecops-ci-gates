/**
 * @fileoverview Trivy Scanner Integration
 * @description Multi-purpose scanner for containers, IaC, and dependencies
 * Scans Docker images, Terraform, Kubernetes manifests, and package files
 * 
 * @module scanners/trivy
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs/promises';
import * as path from 'path';
import { logger } from '../config/logger';
import type { NormalizedFinding, SeverityLevel } from '../types';

const execAsync = promisify(exec);

interface TrivyResult {
  Results: Array<{
    Target: string;
    Type: string;
    Vulnerabilities?: Array<{
      VulnerabilityID: string;
      PkgName: string;
      Severity: string;
      Title: string;
      Description: string;
      PrimaryURL: string;
      CweIDs?: string[];
      CVSS?: {
        [key: string]: {
          V3Score?: number;
        };
      };
    }>;
    Misconfigurations?: Array<{
      ID: string;
      Type: string;
      Title: string;
      Message: string;
      Severity: string;
      Status: string;
      IacMetadata?: {
        Resource: string;
        Provider: string;
        Service: string;
        StartLine?: number;
        EndLine?: number;
      };
    }>;
  }>;
}

/**
 * Trivy Scanner Class
 * @class TrivyScanner
 */
export class TrivyScanner {
  /**
   * Check if Trivy is installed
   * @static
   * @returns {Promise<boolean>}
   */
  static async isAvailable(): Promise<boolean> {
    try {
      await execAsync('trivy --version');
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Scan repository filesystem for vulnerabilities and misconfigurations
   * @static
   * @async
   * @param {string} repoPath - Path to repository
   * @returns {Promise<NormalizedFinding[]>} Array of normalized findings
   */
  static async scan(repoPath: string): Promise<NormalizedFinding[]> {
    if (!(await this.isAvailable())) {
      logger.warn('Trivy not available, skipping container/IaC scan');
      return [];
    }

    const findings: NormalizedFinding[] = [];

    try {
      // Scan for filesystem vulnerabilities (dependencies, OS packages)
      findings.push(...(await this.scanFilesystem(repoPath)));

      // Scan for IaC misconfigurations (Terraform, Kubernetes, Dockerfile)
      findings.push(...(await this.scanIaC(repoPath)));
    } catch (error) {
      logger.error('Trivy scan failed', { error, repoPath });
      throw new Error(`Trivy scan failed: ${error instanceof Error ? error.message : String(error)}`);
    }

    return findings;
  }

  /**
   * Scan filesystem for vulnerabilities
   * @private
   * @static
   * @param {string} repoPath - Path to repository
   * @returns {Promise<NormalizedFinding[]>}
   */
  private static async scanFilesystem(repoPath: string): Promise<NormalizedFinding[]> {
    const outputFile = path.join('/tmp', `trivy-fs-${Date.now()}.json`);

    try {
      const command = `trivy fs --security-checks vuln --format json --output ${outputFile} ${repoPath}`;

      logger.info('Running Trivy filesystem scan', { repoPath });

      try {
        await execAsync(command, { cwd: repoPath, maxBuffer: 10 * 1024 * 1024 });
      } catch (error: any) {
        // Trivy exits with non-zero if vulnerabilities found, which is expected
        if (!(await fs.access(outputFile).then(() => true).catch(() => false))) {
          return [];
        }
      }

      const output = await fs.readFile(outputFile, 'utf-8');
      const results: TrivyResult = JSON.parse(output);
      await fs.unlink(outputFile).catch(() => {});

      const findings: NormalizedFinding[] = [];

      for (const result of results.Results) {
        if (result.Vulnerabilities) {
          for (const vuln of result.Vulnerabilities) {
            findings.push({
              tool: 'trivy',
              category: 'sca',
              severity: this.mapSeverity(vuln.Severity),
              ruleId: vuln.VulnerabilityID,
              title: vuln.Title || vuln.VulnerabilityID,
              file: result.Target,
              cwe: vuln.CweIDs?.[0],
              cvss: this.extractCVSS(vuln.CVSS),
              message: vuln.Description,
              fingerprint: `trivy:${result.Target}:${vuln.VulnerabilityID}:${vuln.PkgName}`,
            });
          }
        }
      }

      logger.info('Trivy filesystem scan completed', {
        repoPath,
        findingsCount: findings.length,
      });

      return findings;
    } catch (error) {
      logger.error('Trivy filesystem scan failed', { error, repoPath });
      return [];
    }
  }

  /**
   * Scan for IaC misconfigurations
   * @private
   * @static
   * @param {string} repoPath - Path to repository
   * @returns {Promise<NormalizedFinding[]>}
   */
  private static async scanIaC(repoPath: string): Promise<NormalizedFinding[]> {
    const outputFile = path.join('/tmp', `trivy-iac-${Date.now()}.json`);

    try {
      const command = `trivy fs --security-checks config --format json --output ${outputFile} ${repoPath}`;

      logger.info('Running Trivy IaC scan', { repoPath });

      try {
        await execAsync(command, { cwd: repoPath, maxBuffer: 10 * 1024 * 1024 });
      } catch (error: any) {
        if (!(await fs.access(outputFile).then(() => true).catch(() => false))) {
          return [];
        }
      }

      const output = await fs.readFile(outputFile, 'utf-8');
      const results: TrivyResult = JSON.parse(output);
      await fs.unlink(outputFile).catch(() => {});

      const findings: NormalizedFinding[] = [];

      for (const result of results.Results) {
        if (result.Misconfigurations) {
          for (const misconfig of result.Misconfigurations) {
            if (misconfig.Status === 'FAIL') {
              findings.push({
                tool: 'trivy',
                category: 'iac',
                severity: this.mapSeverity(misconfig.Severity),
                ruleId: misconfig.ID,
                title: misconfig.Title,
                file: result.Target,
                line: misconfig.IacMetadata?.StartLine,
                message: misconfig.Message,
                fingerprint: `trivy-iac:${result.Target}:${misconfig.ID}:${misconfig.IacMetadata?.Resource || ''}`,
              });
            }
          }
        }
      }

      logger.info('Trivy IaC scan completed', {
        repoPath,
        findingsCount: findings.length,
      });

      return findings;
    } catch (error) {
      logger.error('Trivy IaC scan failed', { error, repoPath });
      return [];
    }
  }

  /**
   * Map Trivy severity to normalized severity
   * @private
   * @static
   * @param {string} trivySeverity - Trivy severity (CRITICAL, HIGH, MEDIUM, LOW)
   * @returns {SeverityLevel}
   */
  private static mapSeverity(trivySeverity: string): SeverityLevel {
    const normalized = trivySeverity.toLowerCase();
    if (normalized === 'critical') return 'critical';
    if (normalized === 'high') return 'high';
    if (normalized === 'medium') return 'medium';
    if (normalized === 'low') return 'low';
    return 'info';
  }

  /**
   * Extract CVSS score from Trivy CVSS data
   * @private
   * @static
   * @param {Object|undefined} cvss - CVSS data from Trivy
   * @returns {number|undefined}
   */
  private static extractCVSS(cvss?: { [key: string]: { V3Score?: number } }): number | undefined {
    if (!cvss) return undefined;
    
    // Try to get V3 score (preferred), fallback to V2
    for (const key of Object.keys(cvss)) {
      if (cvss[key].V3Score !== undefined) {
        return cvss[key].V3Score;
      }
    }
    
    return undefined;
  }
}
