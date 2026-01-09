/**
 * @fileoverview CVE Lookup Service
 * @description Enriches findings with CVE data from NVD API
 * 
 * @module services/cveLookup
 */

import { logger } from '../config/logger';

interface CVEData {
  id: string;
  description: string;
  cvssScore?: number;
  severity?: string;
  publishedDate?: string;
  references?: string[];
}

/**
 * CVE Lookup Service
 * @class CVELookupService
 * @description Provides CVE information lookup and enrichment
 */
export class CVELookupService {
  /**
   * Look up CVE information
   * @static
   * @async
   * @param {string} cveId - CVE identifier (e.g., CVE-2021-1234)
   * @returns {Promise<CVEData | null>} CVE data or null if not found
   */
  static async lookupCVE(cveId: string): Promise<CVEData | null> {
    try {
      // Normalize CVE ID
      const normalized = cveId.toUpperCase().trim();
      if (!normalized.startsWith('CVE-')) {
        return null;
      }

      // Use NVD API v2 (free, no API key required, rate limited)
      const apiUrl = `https://services.nvd.nist.gov/rest/json/cves/2.0?cveId=${normalized}`;

      logger.debug('Looking up CVE', { cveId: normalized });

      const response = await fetch(apiUrl, {
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        logger.warn('CVE lookup failed', { cveId: normalized, status: response.status });
        return null;
      }

      const data = (await response.json()) as any;

      if (!data.vulnerabilities || data.vulnerabilities.length === 0) {
        return null;
      }

      const vuln = data.vulnerabilities[0].cve;

      // Extract CVSS score (prefer V3, fallback to V2)
      let cvssScore: number | undefined;
      let severity: string | undefined;

      const v31Score = vuln.metrics?.cvssMetricV31?.[0]?.cvssData?.baseScore;
      const v30Score = vuln.metrics?.cvssMetricV30?.[0]?.cvssData?.baseScore;
      const v2Score = vuln.metrics?.cvssMetricV2?.[0]?.cvssData?.baseScore;

      if (typeof v31Score === 'number') {
        cvssScore = v31Score;
        severity = this.mapCVSSSeverity(v31Score);
      } else if (typeof v30Score === 'number') {
        cvssScore = v30Score;
        severity = this.mapCVSSSeverity(v30Score);
      } else if (typeof v2Score === 'number') {
        cvssScore = v2Score;
        severity = this.mapCVSSSeverity(v2Score);
      }

      return {
        id: vuln.id,
        description: vuln.descriptions?.find((d: any) => d.lang === 'en')?.value || 'No description available',
        cvssScore,
        severity,
        publishedDate: vuln.published,
        references: vuln.references?.map((ref: any) => ref.url) || [],
      };
    } catch (error) {
      logger.error('CVE lookup error', { error, cveId });
      return null;
    }
  }

  /**
   * Map CVSS score to severity
   * @private
   * @static
   * @param {number} score - CVSS score (0-10)
   * @returns {string}
   */
  private static mapCVSSSeverity(score: number): string {
    if (score >= 9.0) return 'critical';
    if (score >= 7.0) return 'high';
    if (score >= 4.0) return 'medium';
    if (score >= 0.1) return 'low';
    return 'info';
  }

  /**
   * Batch lookup multiple CVEs
   * @static
   * @async
   * @param {string[]} cveIds - Array of CVE IDs
   * @returns {Promise<Map<string, CVEData>>} Map of CVE ID to CVE data
   */
  static async batchLookup(cveIds: string[]): Promise<Map<string, CVEData>> {
    const results = new Map<string, CVEData>();

    // NVD API has rate limits, so we'll do sequential lookups with delays
    // In production, consider using API key for higher rate limits
    for (const cveId of cveIds) {
      const data = await this.lookupCVE(cveId);
      if (data) {
        results.set(cveId, data);
      }

      // Small delay to respect rate limits (6 requests per 30 seconds without API key)
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    return results;
  }
}
