/**
 * @fileoverview Gitleaks Scanner Integration
 * @description Secret detection scanner for finding API keys, passwords, tokens in code
 * 
 * @module scanners/gitleaks
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs/promises';
import * as path from 'path';
import { logger } from '../config/logger';
import type { NormalizedFinding, SeverityLevel } from '../types';

const execAsync = promisify(exec);

interface GitleaksResult {
  findings: Array<{
    Description: string;
    StartLine: number;
    EndLine: number;
    StartColumn: number;
    EndColumn: number;
    Match: string;
    Secret: string;
    File: string;
    Commit: string;
    Entropy: number;
    Author: string;
    Email: string;
    Date: string;
    Message: string;
    Tags: string[];
    RuleID: string;
  }>;
}

/**
 * Gitleaks Scanner Class
 * @class GitleaksScanner
 */
export class GitleaksScanner {
  /**
   * Check if Gitleaks is installed
   * @static
   * @returns {Promise<boolean>}
   */
  static async isAvailable(): Promise<boolean> {
    try {
      await execAsync('gitleaks version');
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Scan repository for secrets
   * @static
   * @async
   * @param {string} repoPath - Path to repository
   * @returns {Promise<NormalizedFinding[]>} Array of normalized findings
   */
  static async scan(repoPath: string): Promise<NormalizedFinding[]> {
    if (!(await this.isAvailable())) {
      logger.warn('Gitleaks not available, skipping secret detection');
      return [];
    }

    try {
      const outputFile = path.join('/tmp', `gitleaks-${Date.now()}.json`);

      // Gitleaks detect with JSON output
      // --no-git to scan filesystem without git history
      // --source . to scan current directory
      const command = `gitleaks detect --source ${repoPath} --no-git --report-path ${outputFile} --report-format json`;

      logger.info('Running Gitleaks scan', { repoPath });

      try {
        await execAsync(command, { maxBuffer: 10 * 1024 * 1024 });
      } catch (error: any) {
        // Gitleaks exits with non-zero code if secrets found, which is expected
        if (!(await fs.access(outputFile).then(() => true).catch(() => false))) {
          // If no output file and command failed, return empty results
          return [];
        }
      }

      // Read results
      const output = await fs.readFile(outputFile, 'utf-8');
      const results: GitleaksResult = JSON.parse(output);
      await fs.unlink(outputFile).catch(() => {});

      // Normalize findings
      const findings: NormalizedFinding[] = results.findings.map((finding) => {
        // Secrets are always high or critical severity
        const severity: SeverityLevel = 
          finding.Entropy > 8 || this.isHighRiskSecret(finding.RuleID) ? 'critical' : 'high';

        return {
          tool: 'gitleaks',
          category: 'secrets',
          severity,
          ruleId: finding.RuleID,
          title: `Exposed ${finding.Description}`,
          file: finding.File,
          line: finding.StartLine,
          message: `Secret detected: ${finding.Description}. This ${finding.Match.substring(0, 50)}... should not be committed to version control.`,
          fingerprint: `gitleaks:${finding.File}:${finding.RuleID}:${finding.StartLine}`,
        };
      });

      logger.info('Gitleaks scan completed', {
        repoPath,
        findingsCount: findings.length,
      });

      return findings;
    } catch (error) {
      logger.error('Gitleaks scan failed', { error, repoPath });
      // Don't throw - secret detection failures shouldn't block scans
      return [];
    }
  }

  /**
   * Determine if secret type is high risk
   * @private
   * @static
   * @param {string} ruleId - Gitleaks rule ID
   * @returns {boolean}
   */
  private static isHighRiskSecret(ruleId: string): boolean {
    const highRiskRules = [
      'aws-access-key',
      'aws-secret-access-key',
      'private-key',
      'github-pat',
      'slack-token',
      'azure-client-secret',
      'google-api-key',
    ];
    return highRiskRules.some(rule => ruleId.toLowerCase().includes(rule));
  }
}
