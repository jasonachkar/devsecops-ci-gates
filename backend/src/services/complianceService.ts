import { prisma } from '../config/database';
import { logger } from '../config/logger';

/**
 * OWASP Top 10 2021 categories
 */
const OWASP_TOP_10 = [
  'A01:2021 - Broken Access Control',
  'A02:2021 - Cryptographic Failures',
  'A03:2021 - Injection',
  'A04:2021 - Insecure Design',
  'A05:2021 - Security Misconfiguration',
  'A06:2021 - Vulnerable and Outdated Components',
  'A07:2021 - Identification and Authentication Failures',
  'A08:2021 - Software and Data Integrity Failures',
  'A09:2021 - Security Logging and Monitoring Failures',
  'A10:2021 - Server-Side Request Forgery (SSRF)',
];

/**
 * CWE Top 25 categories (simplified mapping)
 */
const CWE_TOP_25 = [
  'CWE-79: Cross-site Scripting',
  'CWE-89: SQL Injection',
  'CWE-20: Improper Input Validation',
  'CWE-352: Cross-site Request Forgery',
  'CWE-78: OS Command Injection',
  'CWE-798: Use of Hard-coded Credentials',
  'CWE-502: Deserialization of Untrusted Data',
  'CWE-434: Unrestricted Upload of File',
  'CWE-862: Missing Authorization',
  'CWE-476: NULL Pointer Dereference',
];

/**
 * Service for compliance scorecard generation
 * Maps findings to compliance frameworks (OWASP Top 10, CWE Top 25, CIS)
 */
export class ComplianceService {
  /**
   * Get OWASP Top 10 scorecard
   */
  static async getOwaspTop10Scorecard(repositoryId?: string, scanId?: string) {
    const where: any = {};
    if (scanId) {
      where.scanId = scanId;
    } else if (repositoryId) {
      where.scan = { repositoryId };
    }

    // Get all findings with compliance mappings
    const findings = await prisma.finding.findMany({
      where,
      include: {
        complianceMappings: {
          where: { framework: 'owasp-top10' },
        },
      },
    });

    // Group by OWASP category
    const scorecard = OWASP_TOP_10.map((category) => {
      const categoryCode = category.split(' - ')[0];
      const categoryFindings = findings.filter((f) =>
        f.complianceMappings.some((m) => m.category.startsWith(categoryCode))
      );

      const bySeverity = {
        critical: categoryFindings.filter((f) => f.severity === 'critical').length,
        high: categoryFindings.filter((f) => f.severity === 'high').length,
        medium: categoryFindings.filter((f) => f.severity === 'medium').length,
        low: categoryFindings.filter((f) => f.severity === 'low').length,
        info: categoryFindings.filter((f) => f.severity === 'info').length,
      };

      return {
        category,
        categoryCode,
        total: categoryFindings.length,
        bySeverity,
        findings: categoryFindings.slice(0, 10), // Top 10 for preview
      };
    });

    const totalFindings = findings.length;
    const criticalFindings = findings.filter((f) => f.severity === 'critical').length;

    return {
      framework: 'OWASP Top 10 2021',
      totalFindings,
      criticalFindings,
      scorecard,
      complianceScore: totalFindings === 0 ? 100 : Math.max(0, 100 - (criticalFindings * 10)),
    };
  }

  /**
   * Get CWE Top 25 scorecard
   */
  static async getCweTop25Scorecard(repositoryId?: string, scanId?: string) {
    const where: any = {};
    if (scanId) {
      where.scanId = scanId;
    } else if (repositoryId) {
      where.scan = { repositoryId };
    }

    const findings = await prisma.finding.findMany({
      where: {
        ...where,
        cwe: { not: null },
      },
      include: {
        complianceMappings: {
          where: { framework: 'cwe-top25' },
        },
      },
    });

    // Group by CWE
    const scorecard = CWE_TOP_25.map((cwe) => {
      const cweCode = cwe.split(':')[0];
      const cweFindings = findings.filter(
        (f) => f.cwe === cweCode || f.complianceMappings.some((m) => m.category === cweCode)
      );

      return {
        cwe,
        cweCode,
        total: cweFindings.length,
        findings: cweFindings.slice(0, 10),
      };
    });

    return {
      framework: 'CWE Top 25',
      totalFindings: findings.length,
      scorecard,
    };
  }

  /**
   * Auto-map findings to compliance frameworks based on CWE and tool
   */
  static async mapFindingToCompliance(findingId: string, cwe?: string, tool?: string) {
    const mappings: Array<{ framework: string; category: string }> = [];

    // Map based on CWE
    if (cwe) {
      const cweCode = cwe.toUpperCase();
      
      // CWE Top 25 mapping
      if (CWE_TOP_25.some((c) => c.startsWith(cweCode))) {
        mappings.push({ framework: 'cwe-top25', category: cweCode });
      }

      // OWASP mapping based on CWE
      if (cweCode.includes('79') || cweCode.includes('XSS')) {
        mappings.push({ framework: 'owasp-top10', category: 'A03:2021' });
      }
      if (cweCode.includes('89') || cweCode.includes('SQL')) {
        mappings.push({ framework: 'owasp-top10', category: 'A03:2021' });
      }
      if (cweCode.includes('798') || cweCode.includes('CREDENTIAL')) {
        mappings.push({ framework: 'owasp-top10', category: 'A07:2021' });
      }
    }

    // Map based on tool
    if (tool) {
      if (tool === 'gitleaks') {
        mappings.push({ framework: 'owasp-top10', category: 'A07:2021' });
      }
      if (tool === 'codeql') {
        // CodeQL findings often map to multiple OWASP categories
        mappings.push({ framework: 'owasp-top10', category: 'A01:2021' });
      }
    }

    // Create compliance mappings
    if (mappings.length > 0) {
      await prisma.complianceMapping.createMany({
        data: mappings.map((m) => ({
          findingId,
          framework: m.framework,
          category: m.category,
        })),
        skipDuplicates: true,
      });
    }

    return mappings;
  }
}


