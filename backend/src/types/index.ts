/**
 * @fileoverview Shared TypeScript Types
 * @description Common type definitions used throughout the backend API.
 * Provides type safety and consistency across services and controllers.
 * 
 * @module types
 */

/**
 * Security finding severity levels
 * @typedef {('critical' | 'high' | 'medium' | 'low' | 'info')} SeverityLevel
 * @description Ordered from most to least severe
 */
export type SeverityLevel = 'critical' | 'high' | 'medium' | 'low' | 'info';

/**
 * Scan execution status
 * @typedef {('running' | 'completed' | 'failed')} ScanStatus
 * @description Tracks the lifecycle of a security scan
 */
export type ScanStatus = 'running' | 'completed' | 'failed';

/**
 * CI/CD gate status
 * @typedef {('passed' | 'failed' | 'warning')} GateStatus
 * @description Determines if CI/CD pipeline should pass, fail, or warn
 */
export type GateStatus = 'passed' | 'failed' | 'warning';

/**
 * Finding resolution status
 * @typedef {('open' | 'resolved' | 'false_positive' | 'accepted_risk')} FindingStatus
 * @description Tracks the lifecycle of individual security findings
 */
export type FindingStatus = 'open' | 'resolved' | 'false_positive' | 'accepted_risk';

/**
 * User role for access control
 * @typedef {('admin' | 'engineer' | 'developer' | 'viewer')} UserRole
 * @description Role-based access control levels
 * - admin: Full access
 * - engineer: Read/write findings
 * - developer: Read-only, create tickets
 * - viewer: Read-only
 */
export type UserRole = 'admin' | 'engineer' | 'developer' | 'viewer';

export interface ScanMetadata {
  timestamp: string;
  repository: string;
  branch: string;
  commit: string;
  triggeredBy: string;
}

export interface ScanSummary {
  total: number;
  bySeverity: {
    critical: number;
    high: number;
    medium: number;
    low: number;
    info: number;
  };
  byTool: Record<string, number>;
}

export interface NormalizedFinding {
  tool: string;
  category?: string;
  severity: SeverityLevel;
  ruleId?: string;
  title: string;
  file?: string;
  line?: number;
  cwe?: string;
  cvss?: number;
  message?: string;
  fingerprint?: string;
}

export interface ScanPayload {
  metadata: ScanMetadata;
  summary: ScanSummary;
  findings: NormalizedFinding[];
}

