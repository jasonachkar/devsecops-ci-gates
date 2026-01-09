/**
 * @fileoverview Semgrep Scanner Integration
 * @description SAST (Static Application Security Testing) scanner using Semgrep
 * Scans for code vulnerabilities, injection flaws, and insecure patterns
 * 
 * @module scanners/semgrep
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs/promises';
import * as path from 'path';
import { logger } from '../config/logger';
import type { NormalizedFinding, SeverityLevel } from '../types';

const execAsync = promisify(exec);

interface SemgrepResult {
  results: Array<{
    check_id: string;
    path: string;
    start: { line: number };
    end: { line: number };
    extra: {
      message: string;
      severity: 'ERROR' | 'WARNING' | 'INFO';
      metadata?: {
        cwe?: string[];
        owasp?: string[];
        'security-severity'?: string;
      };
    };
  }>;
  errors: Array<{ message: string }>;
}

/**
 * Semgrep Scanner Class
 * @class SemgrepScanner
 */
export class SemgrepScanner {
  /**
   * Check if Semgrep is installed
   * @static
   * @returns {Promise<boolean>}
   */
  static async isAvailable(): Promise<boolean> {
    try {
      await execAsync('semgrep --version');
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Scan repository for security issues
   * @static
   * @async
   * @param {string} repoPath - Path to repository
   * @returns {Promise<NormalizedFinding[]>} Array of normalized findings
   */
  static async scan(repoPath: string): Promise<NormalizedFinding[]> {
    if (!(await this.isAvailable())) {
      logger.warn('Semgrep not available, skipping SAST scan');
      return [];
    }

    try {
      const outputFile = path.join('/tmp', `semgrep-${Date.now()}.json`);
      
      // Run Semgrep with auto-config and output to JSON
      // --config=auto uses Semgrep's security rules
      const command = `semgrep --config=auto --json --output=${outputFile} ${repoPath}`;

      logger.info('Running Semgrep scan', { repoPath });

      try {
        await execAsync(command, { cwd: repoPath, maxBuffer: 10 * 1024 * 1024 });
      } catch (error: any) {
        // Semgrep exits with non-zero code if findings are found, which is expected
        // Only fail if we can't read the output file
        if (!(await fs.access(outputFile).then(() => true).catch(() => false))) {
          throw error;
        }
      }

      // Read and parse results
      const output = await fs.readFile(outputFile, 'utf-8');
      const results: SemgrepResult = JSON.parse(output);

      // Clean up temp file
      await fs.unlink(outputFile).catch(() => {});

      // Normalize findings
      const findings: NormalizedFinding[] = results.results.map((result) => {
        const severity = this.mapSeverity(result.extra.severity, result.extra.metadata?.['security-severity']);
        
        return {
          tool: 'semgrep',
          category: 'sast',
          severity,
          ruleId: result.check_id,
          title: result.check_id.split('.').pop() || 'Security Issue',
          file: result.path,
          line: result.start.line,
          cwe: result.extra.metadata?.cwe?.[0],
          message: result.extra.message,
          fingerprint: this.generateFingerprint(result),
        };
      });

      logger.info('Semgrep scan completed', {
        repoPath,
        findingsCount: findings.length,
      });

      return findings;
    } catch (error) {
      logger.error('Semgrep scan failed', { error, repoPath });
      throw new Error(`Semgrep scan failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Map Semgrep severity to normalized severity
   * @private
   * @static
   * @param {string} semgrepSeverity - Semgrep severity (ERROR, WARNING, INFO)
   * @param {string|undefined} securitySeverity - Security severity from metadata
   * @returns {SeverityLevel}
   */
  private static mapSeverity(
    semgrepSeverity: string,
    securitySeverity?: string
  ): SeverityLevel {
    // Use security-severity if available, otherwise map from severity
    if (securitySeverity) {
      const normalized = securitySeverity.toLowerCase();
      if (normalized === 'critical' || normalized === 'high') return 'high';
      if (normalized === 'medium') return 'medium';
      if (normalized === 'low') return 'low';
    }

    // Map from Semgrep severity
    if (semgrepSeverity === 'ERROR') return 'high';
    if (semgrepSeverity === 'WARNING') return 'medium';
    return 'low';
  }

  /**
   * Generate fingerprint for deduplication
   * @private
   * @static
   * @param {Object} result - Semgrep result
   * @returns {string}
   */
  private static generateFingerprint(result: SemgrepResult['results'][0]): string {
    // Create unique fingerprint: check_id + path + line
    return `${result.check_id}:${result.path}:${result.start.line}`;
  }
}
