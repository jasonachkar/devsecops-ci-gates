/**
 * @fileoverview Bandit Scanner Integration
 * @description Python SAST scanner for Python-specific security issues
 * 
 * @module scanners/bandit
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs/promises';
import * as path from 'path';
import { logger } from '../config/logger';
import type { NormalizedFinding, SeverityLevel } from '../types';

const execAsync = promisify(exec);

interface BanditResult {
  errors: Array<{ filename: string; reason: string }>;
  generated_at: string;
  metrics: {
    _totals: {
      SEVERITY: {
        UNDEFINED: number;
        LOW: number;
        MEDIUM: number;
        HIGH: number;
      };
    };
  };
  results: Array<{
    check_id: string;
    check_name: string;
    issue_severity: string;
    issue_confidence: string;
    issue_cwe?: {
      id: number;
      link: string;
    };
    issue_text: string;
    line_number: number;
    line_range: number[];
    test_id: string;
    test_name: string;
    filename: string;
    more_info: string;
  }>;
}

/**
 * Bandit Scanner Class
 * @class BanditScanner
 */
export class BanditScanner {
  /**
   * Check if Bandit is installed and Python files exist
   * @static
   * @param {string} repoPath - Path to repository
   * @returns {Promise<boolean>}
   */
  static async isAvailable(repoPath: string): Promise<boolean> {
    try {
      await execAsync('bandit --version');
      
      // Check if there are Python files
      const pyFiles = await this.findPythonFiles(repoPath);
      return pyFiles.length > 0;
    } catch {
      return false;
    }
  }

  /**
   * Find Python files in repository
   * @private
   * @static
   * @param {string} repoPath - Path to repository
   * @returns {Promise<string[]>}
   */
  private static async findPythonFiles(repoPath: string): Promise<string[]> {
    try {
      const { stdout } = await execAsync(
        `find ${repoPath} -name "*.py" -type f 2>/dev/null | head -10`
      );
      return stdout.trim().split('\n').filter(Boolean);
    } catch {
      return [];
    }
  }

  /**
   * Scan Python files for security issues
   * @static
   * @async
   * @param {string} repoPath - Path to repository
   * @returns {Promise<NormalizedFinding[]>} Array of normalized findings
   */
  static async scan(repoPath: string): Promise<NormalizedFinding[]> {
    if (!(await this.isAvailable(repoPath))) {
      logger.debug('Bandit/Python files not found, skipping Python SAST scan');
      return [];
    }

    try {
      const outputFile = path.join('/tmp', `bandit-${Date.now()}.json`);

      // Run Bandit with JSON output
      // -r for recursive, -f json for JSON output
      // Skip tests by default, but can be configured
      const command = `cd ${repoPath} && bandit -r . -f json -o ${outputFile} -ll -i || true`;

      logger.info('Running Bandit scan', { repoPath });

      // Bandit may exit with non-zero if issues found
      await execAsync(command, { maxBuffer: 10 * 1024 * 1024 });

      // Read results
      const output = await fs.readFile(outputFile, 'utf-8');
      await fs.unlink(outputFile).catch(() => {});

      // Parse JSON
      let results: BanditResult;
      try {
        results = JSON.parse(output);
      } catch (parseError) {
        logger.warn('Failed to parse Bandit output', { repoPath });
        return [];
      }

      // Normalize findings
      const findings: NormalizedFinding[] = results.results.map((result) => {
        const severity = this.mapSeverity(result.issue_severity, result.issue_confidence);
        const cwe = result.issue_cwe ? `CWE-${result.issue_cwe.id}` : undefined;

        return {
          tool: 'bandit',
          category: 'sast',
          severity,
          ruleId: result.test_id,
          title: result.test_name,
          file: result.filename,
          line: result.line_number,
          cwe,
          message: result.issue_text,
          fingerprint: `bandit:${result.filename}:${result.test_id}:${result.line_number}`,
        };
      });

      logger.info('Bandit scan completed', {
        repoPath,
        findingsCount: findings.length,
      });

      return findings;
    } catch (error) {
      logger.error('Bandit scan failed', { error, repoPath });
      // Don't throw - Python scan failures shouldn't block other scans
      return [];
    }
  }

  /**
   * Map Bandit severity and confidence to normalized severity
   * @private
   * @static
   * @param {string} severity - Bandit severity (LOW, MEDIUM, HIGH)
   * @param {string} confidence - Bandit confidence (LOW, MEDIUM, HIGH)
   * @returns {SeverityLevel}
   */
  private static mapSeverity(
    severity: string,
    confidence: string
  ): SeverityLevel {
    const sev = severity.toLowerCase();
    const conf = confidence.toLowerCase();

    // High severity with high confidence = critical
    if (sev === 'high' && conf === 'high') return 'critical';
    if (sev === 'high') return 'high';
    if (sev === 'medium' && conf === 'high') return 'high';
    if (sev === 'medium') return 'medium';
    if (sev === 'low' && conf === 'high') return 'medium';
    return 'low';
  }
}
