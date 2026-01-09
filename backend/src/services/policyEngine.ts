/**
 * @fileoverview Security Gate Policy Engine
 * @description Configurable security gate rules for CI/CD pipelines
 * 
 * @module services/policyEngine
 */

import type { ScanSummary, GateStatus } from '../types';

export interface SecurityGatePolicy {
  // Block gates
  blockOnCritical: boolean;
  blockOnHigh: boolean;
  blockOnMedium: boolean;
  blockOnLow: boolean;

  // Threshold-based gates
  maxCritical: number;
  maxHigh: number;
  maxMedium: number;
  maxLow: number;

  // Tool-specific policies
  toolPolicies?: {
    [tool: string]: {
      blockOnAny?: boolean;
      maxFindings?: number;
    };
  };
}

/**
 * Default security gate policy
 */
export const DEFAULT_POLICY: SecurityGatePolicy = {
  blockOnCritical: true,
  blockOnHigh: true,
  blockOnMedium: false,
  blockOnLow: false,
  maxCritical: 0,
  maxHigh: 0,
  maxMedium: 50,
  maxLow: 100,
};

/**
 * Policy Engine Service
 * @class PolicyEngine
 */
export class PolicyEngine {
  /**
   * Evaluate scan results against policy
   * @static
   * @param {ScanSummary} summary - Scan summary
   * @param {SecurityGatePolicy} policy - Security gate policy
   * @returns {{status: GateStatus, reason: string}} Gate evaluation result
   */
  static evaluateGate(
    summary: ScanSummary,
    policy: SecurityGatePolicy = DEFAULT_POLICY
  ): { status: GateStatus; reason: string } {
    const { bySeverity } = summary;

    // Check block flags
    if (policy.blockOnCritical && bySeverity.critical > 0) {
      return {
        status: 'failed',
        reason: `Gate failed: ${bySeverity.critical} critical finding(s) detected (blocking enabled)`,
      };
    }

    if (policy.blockOnHigh && bySeverity.high > 0) {
      return {
        status: 'failed',
        reason: `Gate failed: ${bySeverity.high} high severity finding(s) detected (blocking enabled)`,
      };
    }

    if (policy.blockOnMedium && bySeverity.medium > 0) {
      return {
        status: 'failed',
        reason: `Gate failed: ${bySeverity.medium} medium severity finding(s) detected (blocking enabled)`,
      };
    }

    if (policy.blockOnLow && bySeverity.low > 0) {
      return {
        status: 'failed',
        reason: `Gate failed: ${bySeverity.low} low severity finding(s) detected (blocking enabled)`,
      };
    }

    // Check thresholds
    if (bySeverity.critical > policy.maxCritical) {
      return {
        status: 'failed',
        reason: `Gate failed: ${bySeverity.critical} critical finding(s) exceeds threshold of ${policy.maxCritical}`,
      };
    }

    if (bySeverity.high > policy.maxHigh) {
      return {
        status: 'failed',
        reason: `Gate failed: ${bySeverity.high} high severity finding(s) exceeds threshold of ${policy.maxHigh}`,
      };
    }

    if (bySeverity.medium > policy.maxMedium) {
      return {
        status: 'warning',
        reason: `Gate warning: ${bySeverity.medium} medium severity finding(s) exceeds threshold of ${policy.maxMedium}`,
      };
    }

    if (bySeverity.low > policy.maxLow) {
      return {
        status: 'warning',
        reason: `Gate warning: ${bySeverity.low} low severity finding(s) exceeds threshold of ${policy.maxLow}`,
      };
    }

    // Check tool-specific policies
    if (policy.toolPolicies) {
      for (const [tool, toolPolicy] of Object.entries(policy.toolPolicies)) {
        const toolCount = summary.byTool[tool] || 0;

        if (toolPolicy.blockOnAny && toolCount > 0) {
          return {
            status: 'failed',
            reason: `Gate failed: ${toolCount} finding(s) from ${tool} (blocking enabled for this tool)`,
          };
        }

        if (toolPolicy.maxFindings !== undefined && toolCount > toolPolicy.maxFindings) {
          return {
            status: 'failed',
            reason: `Gate failed: ${toolCount} finding(s) from ${tool} exceeds threshold of ${toolPolicy.maxFindings}`,
          };
        }
      }
    }

    // All checks passed
    return {
      status: 'passed',
      reason: 'All security gate checks passed',
    };
  }

  /**
   * Get policy from environment or database
   * @static
   * @returns {Promise<SecurityGatePolicy>}
   */
  static async getPolicy(): Promise<SecurityGatePolicy> {
    // For now, return default policy
    // In production, this could fetch from database or configuration service
    return DEFAULT_POLICY;
  }

  /**
   * Create custom policy
   * @static
   * @param {Partial<SecurityGatePolicy>} overrides - Policy overrides
   * @returns {SecurityGatePolicy}
   */
  static createPolicy(overrides: Partial<SecurityGatePolicy>): SecurityGatePolicy {
    return {
      ...DEFAULT_POLICY,
      ...overrides,
    };
  }
}
