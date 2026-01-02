/**
 * API Type Definitions
 * Matches backend API response structures
 */

export type SeverityLevel = 'critical' | 'high' | 'medium' | 'low' | 'info';
export type ScanStatus = 'running' | 'completed' | 'failed';
export type GateStatus = 'passed' | 'failed' | 'warning';
export type FindingStatus = 'open' | 'resolved' | 'false_positive' | 'accepted_risk';

export interface Repository {
  id: string;
  name: string;
  url: string;
  provider: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Scan {
  id: string;
  repositoryId: string;
  repository?: Repository;
  branch: string;
  commitSha: string;
  commitMessage?: string;
  triggeredBy: string;
  status: ScanStatus;
  gateStatus: GateStatus | null;
  totalFindings: number;
  criticalCount: number;
  highCount: number;
  mediumCount: number;
  lowCount: number;
  infoCount: number;
  startedAt: string;
  completedAt: string | null;
  metadata?: any;
  createdAt: string;
}

export interface Finding {
  id: string;
  scanId: string;
  tool: string;
  category?: string;
  severity: SeverityLevel;
  ruleId?: string;
  title: string;
  filePath?: string;
  lineNumber?: number;
  cwe?: string;
  cvssScore?: number;
  message?: string;
  fingerprint?: string;
  status: FindingStatus;
  assignedTo?: string;
  resolvedAt?: string | null;
  resolvedBy?: string | null;
  metadata?: any;
  createdAt: string;
  updatedAt: string;
}

export interface TrendDataPoint {
  date: string;
  total: number;
  critical: number;
  high: number;
  medium: number;
  low: number;
}

export interface ComplianceScore {
  category: string;
  score: number;
  total: number;
  passed: number;
  failed: number;
  findings: number;
}

export interface PaginationParams {
  limit?: number;
  offset?: number;
}

export interface PaginationMeta {
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

