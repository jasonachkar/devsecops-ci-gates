/**
 * @fileoverview Data Seeder Service
 * @description Seeds initial demo data with vulnerable repositories and historical scans
 * 
 * @module services/dataSeeder
 */

import { prisma } from '../config/database';
import { logger } from '../config/logger';
import { RepositoryService } from './repositoryService';
import { ScanService } from './scanService';
import { TrendService } from './trendService';
import type { ScanPayload, NormalizedFinding } from '../types';
import { OWASPMapper } from './owaspMapper';

interface VulnerableRepository {
  name: string;
  owner: string;
  url: string;
  description: string;
  // Expected findings profile for this repo
  expectedFindings: {
    semgrep: number;
    trivy: number;
    gitleaks: number;
    'npm-audit': number;
    bandit: number;
  };
  severityDistribution: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
}

/**
 * Known vulnerable repositories to seed
 */
const VULNERABLE_REPOSITORIES: VulnerableRepository[] = [
  {
    name: 'juice-shop',
    owner: 'bkimminich',
    url: 'https://github.com/bkimminich/juice-shop',
    description: 'OWASP Juice Shop - Modern web app vulnerabilities',
    expectedFindings: {
      semgrep: 45,
      trivy: 25,
      gitleaks: 3,
      'npm-audit': 15,
      bandit: 0,
    },
    severityDistribution: {
      critical: 8,
      high: 22,
      medium: 35,
      low: 23,
    },
  },
  {
    name: 'NodeGoat',
    owner: 'OWASP',
    url: 'https://github.com/OWASP/NodeGoat',
    description: 'OWASP Top 10 for Node.js',
    expectedFindings: {
      semgrep: 35,
      trivy: 20,
      gitleaks: 5,
      'npm-audit': 18,
      bandit: 0,
    },
    severityDistribution: {
      critical: 6,
      high: 18,
      medium: 30,
      low: 24,
    },
  },
  {
    name: 'DVWA',
    owner: 'digininja',
    url: 'https://github.com/digininja/DVWA',
    description: 'Damn Vulnerable Web Application',
    expectedFindings: {
      semgrep: 28,
      trivy: 15,
      gitleaks: 2,
      'npm-audit': 0,
      bandit: 0,
    },
    severityDistribution: {
      critical: 5,
      high: 15,
      medium: 20,
      low: 5,
    },
  },
];

/**
 * Generate realistic findings for a repository
 */
function generateFindings(
  repo: VulnerableRepository,
  tool: string,
  count: number
): NormalizedFinding[] {
  if (count === 0) return [];

  const findings: NormalizedFinding[] = [];
  const severityOrder = ['critical', 'high', 'medium', 'low', 'info'];
  
  // Distribute severities based on repo profile
  const totalExpected = Object.values(repo.severityDistribution).reduce((a, b) => a + b, 0);
  let severityIndex = 0;
  let remainingBySeverity = { ...repo.severityDistribution };

  for (let i = 0; i < count; i++) {
    // Find next available severity
    while (severityIndex < severityOrder.length && remainingBySeverity[severityOrder[severityIndex] as keyof typeof remainingBySeverity] === 0) {
      severityIndex++;
    }
    
    if (severityIndex >= severityOrder.length) {
      severityIndex = 2; // Default to medium
    }

    const severity = severityOrder[severityIndex] as 'critical' | 'high' | 'medium' | 'low' | 'info';
    
    // Reduce count for this severity
    if (remainingBySeverity[severity as keyof typeof remainingBySeverity] > 0) {
      remainingBySeverity[severity as keyof typeof remainingBySeverity]--;
    }

    // Generate finding
    const finding: NormalizedFinding = {
      tool,
      category: tool === 'semgrep' || tool === 'bandit' ? 'sast' : 
                tool === 'trivy' ? 'sca' : 
                tool === 'gitleaks' ? 'secrets' : 'sca',
      severity,
      ruleId: `${tool}-rule-${i + 1}`,
      title: `${tool} finding ${i + 1}: Security issue detected`,
      file: tool === 'npm-audit' ? 'package.json' : 
            tool === 'bandit' ? `src/file_${i}.py` :
            `src/file_${i}.js`,
      line: tool !== 'npm-audit' ? Math.floor(Math.random() * 500) + 1 : undefined,
      cwe: severity === 'critical' || severity === 'high' ? `CWE-${Math.floor(Math.random() * 900) + 100}` : undefined,
      cvss: severity === 'critical' ? 9.0 + Math.random() : 
            severity === 'high' ? 7.0 + Math.random() * 2 :
            severity === 'medium' ? 4.0 + Math.random() * 3 :
            severity === 'low' ? Math.random() * 4 : undefined,
      message: `Security vulnerability detected by ${tool}. This requires attention.`,
      fingerprint: `${repo.name}-${tool}-${i}-${Date.now()}`,
    };

    findings.push(finding);
    
    // Move to next severity periodically
    if (i % Math.ceil(count / 4) === 0 && severityIndex < severityOrder.length - 1) {
      severityIndex++;
    }
  }

  return findings;
}

/**
 * Generate a scan payload with realistic data
 */
function generateScanPayload(
  repo: VulnerableRepository,
  repositoryName: string,
  daysAgo: number
): ScanPayload {
  const allFindings: NormalizedFinding[] = [];
  
  // Generate findings from each tool
  for (const [tool, count] of Object.entries(repo.expectedFindings)) {
    const toolFindings = generateFindings(repo, tool, count);
    allFindings.push(...toolFindings);
  }

  // Add some variation - some days have more findings, some less
  const variation = 0.7 + Math.random() * 0.6; // 70% to 130% of expected
  const actualCount = Math.floor(allFindings.length * variation);
  const selectedFindings = allFindings.slice(0, actualCount);

  // Calculate summary
  const bySeverity = {
    critical: selectedFindings.filter(f => f.severity === 'critical').length,
    high: selectedFindings.filter(f => f.severity === 'high').length,
    medium: selectedFindings.filter(f => f.severity === 'medium').length,
    low: selectedFindings.filter(f => f.severity === 'low').length,
    info: selectedFindings.filter(f => f.severity === 'info').length,
  };

  const byTool: Record<string, number> = {};
  for (const finding of selectedFindings) {
    byTool[finding.tool] = (byTool[finding.tool] || 0) + 1;
  }

  // Generate timestamp in the past
  const scanDate = new Date();
  scanDate.setDate(scanDate.getDate() - daysAgo);
  scanDate.setHours(2 + Math.floor(Math.random() * 4), Math.floor(Math.random() * 60), 0, 0);

  return {
    metadata: {
      timestamp: scanDate.toISOString(),
      repository: repositoryName,
      branch: 'main',
      commit: `abc${daysAgo}def${Math.random().toString(36).substring(7)}`,
      triggeredBy: 'scheduled-scan',
    },
    summary: {
      total: selectedFindings.length,
      bySeverity,
      byTool,
    },
    findings: selectedFindings,
  };
}

/**
 * Data Seeder Service
 * @class DataSeeder
 */
export class DataSeeder {
  /**
   * Check if data has already been seeded
   * @static
   * @async
   * @returns {Promise<boolean>}
   */
  static async isSeeded(): Promise<boolean> {
    const count = await prisma.repository.count({
      where: {
        name: {
          in: VULNERABLE_REPOSITORIES.map(r => r.name),
        },
      },
    });
    return count > 0;
  }

  /**
   * Seed vulnerable repositories and historical scans
   * @static
   * @async
   * @param {number} days - Number of days of historical data to generate
   * @returns {Promise<void>}
   */
  static async seedVulnerableRepositories(days: number = 30): Promise<void> {
    logger.info('Starting data seeding', { days });

    for (const repo of VULNERABLE_REPOSITORIES) {
      try {
        logger.info(`Seeding repository: ${repo.owner}/${repo.name}`);

        // Get or create repository
        const repository = await RepositoryService.getOrCreateRepository({
          name: repo.name,
          url: repo.url,
          provider: 'github',
          description: repo.description,
        });

        // Check if we already have scans for this repo
        const existingScans = await prisma.scan.count({
          where: { repositoryId: repository.id },
        });

        if (existingScans > 0) {
          logger.info(`Repository ${repo.name} already has ${existingScans} scans, skipping`);
          continue;
        }

        // Generate historical scans
        logger.info(`Generating ${days} days of historical scans for ${repo.name}`);
        const scans: string[] = [];

        for (let day = days - 1; day >= 0; day--) {
          const scanPayload = generateScanPayload(repo, `${repo.owner}/${repo.name}`, day);
          
          try {
            const scan = await ScanService.createScan(scanPayload, repository.id);
            scans.push(scan.id);
            
            if (day % 5 === 0) {
              logger.info(`Generated scan for day ${day} (${scans.length}/${days})`);
            }
          } catch (error) {
            logger.error(`Failed to create scan for day ${day}`, { error, repository: repo.name });
          }

          // Small delay to avoid overwhelming the database
          await new Promise(resolve => setTimeout(resolve, 50));
        }

        // Create trend entries
        logger.info(`Creating trend entries for ${repo.name}`);
        await this.createTrendEntries(repository.id, days);

        logger.info(`Completed seeding ${repo.name}`, { scansCreated: scans.length });
      } catch (error) {
        logger.error(`Failed to seed repository ${repo.name}`, { error });
      }
    }

    logger.info('Data seeding completed');
  }

  /**
   * Create trend entries for a repository
   * @private
   * @static
   * @async
   * @param {string} repositoryId - Repository UUID
   * @param {number} days - Number of days
   * @returns {Promise<void>}
   */
  private static async createTrendEntries(repositoryId: string, days: number): Promise<void> {
    // Get all scans for this repository
    const scans = await prisma.scan.findMany({
      where: { repositoryId },
      orderBy: { createdAt: 'asc' },
    });

    // Group scans by date (use completedAt or createdAt if completedAt is null)
    const scansByDate = new Map<string, typeof scans>();
    
    for (const scan of scans) {
      // Use completedAt for date grouping (more accurate for historical data)
      const scanDate = scan.completedAt ? new Date(scan.completedAt) : new Date(scan.createdAt);
      const date = scanDate.toISOString().split('T')[0];
      if (!scansByDate.has(date)) {
        scansByDate.set(date, []);
      }
      scansByDate.get(date)!.push(scan);
    }

    // Create trend entries
    for (const [dateStr, dateScans] of scansByDate.entries()) {
      const totalFindings = dateScans.reduce((sum, s) => sum + s.totalFindings, 0);
      const criticalCount = dateScans.reduce((sum, s) => sum + s.criticalCount, 0);
      const highCount = dateScans.reduce((sum, s) => sum + s.highCount, 0);
      const mediumCount = dateScans.reduce((sum, s) => sum + s.mediumCount, 0);
      const lowCount = dateScans.reduce((sum, s) => sum + s.lowCount, 0);
      const infoCount = dateScans.reduce((sum, s) => sum + s.infoCount, 0);

      try {
        // Use findFirst to check if trend exists, then upsert manually
        const trendDate = new Date(dateStr);
        const existingTrend = await prisma.scanTrend.findFirst({
          where: {
            repositoryId,
            date: trendDate,
          },
        });

        if (existingTrend) {
          await prisma.scanTrend.update({
            where: { id: existingTrend.id },
            data: {
              totalFindings,
              criticalCount,
              highCount,
              mediumCount,
              lowCount,
              infoCount,
              scansCount: dateScans.length,
            },
          });
        } else {
          await prisma.scanTrend.create({
            data: {
              repositoryId,
              date: trendDate,
              totalFindings,
              criticalCount,
              highCount,
              mediumCount,
              lowCount,
              infoCount,
              scansCount: dateScans.length,
            },
          });
        }
      } catch (error) {
        logger.error('Failed to create trend entry', { error, date: dateStr, repositoryId });
      }
    }

    logger.info(`Created ${scansByDate.size} trend entries for repository ${repositoryId}`);
  }

  /**
   * Clear all seeded data (for testing/resetting)
   * @static
   * @async
   * @returns {Promise<void>}
   */
  static async clearSeededData(): Promise<void> {
    logger.warn('Clearing all seeded data');

    // Delete in order to respect foreign key constraints
    const repoNames = VULNERABLE_REPOSITORIES.map(r => r.name);
    
    const repos = await prisma.repository.findMany({
      where: {
        name: { in: repoNames },
      },
    });

    for (const repo of repos) {
      await prisma.repository.delete({
        where: { id: repo.id },
      });
    }

    logger.info('Cleared seeded data', { repositoriesDeleted: repos.length });
  }
}
