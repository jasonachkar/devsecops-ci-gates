/**
 * TypeScript type definitions for security scan data
 * Matches the structure from normalized.json output
 */

export interface NormalizedFinding {
  tool: string;
  category: string;
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  ruleId: string;
  title: string;
  file: string;
  line?: number;
  cwe?: string;
  cvss?: number;
  message: string;
  fingerprint?: string;
}

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

export interface ScanData {
  metadata: ScanMetadata;
  summary: ScanSummary;
  findings: NormalizedFinding[];
}

export type SeverityLevel = 'critical' | 'high' | 'medium' | 'low' | 'info';

export interface SeverityThreshold {
  critical: number;
  high: number;
  medium: number;
  low: number;
}

// Type aliases for backward compatibility
export type Finding = NormalizedFinding;
export type ScanResult = ScanData;
