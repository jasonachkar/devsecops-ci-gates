/**
 * @fileoverview OWASP Top 10 Mapper Service
 * @description Maps security findings to OWASP Top 10 2021 categories
 * 
 * @module services/owaspMapper
 */

import { logger } from '../config/logger';

/**
 * OWASP Top 10 2021 Categories
 */
export const OWASP_TOP_10_2021 = {
  'A01:2021': 'Broken Access Control',
  'A02:2021': 'Cryptographic Failures',
  'A03:2021': 'Injection',
  'A04:2021': 'Insecure Design',
  'A05:2021': 'Security Misconfiguration',
  'A06:2021': 'Vulnerable and Outdated Components',
  'A07:2021': 'Identification and Authentication Failures',
  'A08:2021': 'Software and Data Integrity Failures',
  'A09:2021': 'Security Logging and Monitoring Failures',
  'A10:2021': 'Server-Side Request Forgery (SSRF)',
} as const;

/**
 * CWE to OWASP Top 10 Mapping
 * Based on MITRE's CWE Top 25 and OWASP Top 10 correlation
 */
const CWE_TO_OWASP: Record<string, string[]> = {
  // Injection (A03)
  'CWE-79': ['A03:2021'], // XSS
  'CWE-89': ['A03:2021'], // SQL Injection
  'CWE-78': ['A03:2021'], // OS Command Injection
  'CWE-20': ['A03:2021'], // Improper Input Validation
  'CWE-74': ['A03:2021'], // Injection (generic)
  'CWE-117': ['A03:2021'], // Log Injection
  
  // Broken Access Control (A01)
  'CWE-284': ['A01:2021'], // Improper Access Control
  'CWE-285': ['A01:2021'], // Improper Authorization
  'CWE-352': ['A01:2021'], // CSRF
  'CWE-639': ['A01:2021'], // Authorization Bypass
  
  // Cryptographic Failures (A02)
  'CWE-327': ['A02:2021'], // Weak Crypto Algorithm
  'CWE-326': ['A02:2021'], // Inadequate Encryption Strength
  'CWE-295': ['A02:2021'], // Improper Certificate Validation
  'CWE-798': ['A02:2021'], // Hard-coded Credentials
  
  // Vulnerable Components (A06)
  'CWE-1104': ['A06:2021'], // Use of Unmaintained Third-Party Components
  
  // Security Misconfiguration (A05)
  'CWE-16': ['A05:2021'], // Configuration
  'CWE-200': ['A05:2021'], // Exposure of Sensitive Information
  'CWE-209': ['A05:2021'], // Information Exposure
  
  // Identification and Authentication Failures (A07)
  'CWE-287': ['A07:2021'], // Improper Authentication
  'CWE-306': ['A07:2021'], // Missing Authentication
  'CWE-521': ['A07:2021'], // Weak Password Requirements
  'CWE-308': ['A07:2021'], // Use of Single-factor Authentication
  
  // Software and Data Integrity Failures (A08)
  'CWE-345': ['A08:2021'], // Insufficient Verification
  'CWE-494': ['A08:2021'], // Download of Code Without Integrity Check
  'CWE-502': ['A08:2021'], // Deserialization of Untrusted Data
  
  // Security Logging and Monitoring Failures (A09)
  'CWE-778': ['A09:2021'], // Insufficient Logging
  
  // Server-Side Request Forgery (A10)
  'CWE-918': ['A10:2021'], // SSRF
};

/**
 * Tool-specific rule to OWASP mapping
 */
const TOOL_RULE_TO_OWASP: Record<string, Record<string, string[]>> = {
  semgrep: {
    'python.lang.security.insecure-temp-file': ['A05:2021'],
    'python.lang.security.audit.hardcoded-password': ['A02:2021'],
    'python.lang.security.audit.sql_injection': ['A03:2021'],
    'javascript.lang.security.audit.xss': ['A03:2021'],
    'java.lang.security.audit.insecure-deserialization': ['A08:2021'],
  },
  gitleaks: {
    'aws-access-key': ['A02:2021'],
    'private-key': ['A02:2021'],
    'api-key': ['A02:2021'],
  },
  trivy: {
    // Vulnerable components are A06
    'vulnerability': ['A06:2021'],
    // Misconfigurations are A05
    'misconfiguration': ['A05:2021'],
  },
};

/**
 * OWASP Mapper Service
 * @class OWASPMapper
 */
export class OWASPMapper {
  /**
   * Map finding to OWASP Top 10 categories
   * @static
   * @param {string|undefined} cwe - CWE identifier
   * @param {string} tool - Tool name
   * @param {string|undefined} ruleId - Tool-specific rule ID
   * @returns {string[]} Array of OWASP Top 10 categories
   */
  static mapToOWASP(
    cwe?: string,
    tool?: string,
    ruleId?: string
  ): string[] {
    const categories: Set<string> = new Set();

    // Try CWE mapping first (most accurate)
    if (cwe) {
      const normalizedCWE = cwe.toUpperCase().trim();
      const owaspCategories = CWE_TO_OWASP[normalizedCWE];
      if (owaspCategories) {
        owaspCategories.forEach((cat) => categories.add(cat));
      }
    }

    // Fallback to tool-specific rule mapping
    if (tool && ruleId && TOOL_RULE_TO_OWASP[tool]) {
      const toolRules = TOOL_RULE_TO_OWASP[tool];
      for (const [pattern, cats] of Object.entries(toolRules)) {
        if (ruleId.includes(pattern) || ruleId.match(new RegExp(pattern))) {
          cats.forEach((cat) => categories.add(cat));
        }
      }
    }

    // Default to A04 (Insecure Design) if no mapping found
    if (categories.size === 0) {
      categories.add('A04:2021');
    }

    return Array.from(categories);
  }

  /**
   * Get OWASP category description
   * @static
   * @param {string} category - OWASP category ID (e.g., A01:2021)
   * @returns {string} Category description
   */
  static getCategoryDescription(category: string): string {
    return OWASP_TOP_10_2021[category as keyof typeof OWASP_TOP_10_2021] || 'Unknown';
  }
}
