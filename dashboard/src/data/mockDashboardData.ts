export interface PipelineRun {
  id: string;
  repo: string;
  branch: string;
  status: 'passed' | 'failed' | 'running';
  duration: string;
  triggeredBy: string;
  timestamp: string;
}

export interface SecurityToolStatus {
  name: string;
  status: 'pass' | 'warn' | 'fail';
  lastRun: string;
  findings: number;
}

export interface TrendDataPoint {
  date: string;
  value: number;
}

export interface KpiData {
  label: string;
  value: number;
  change: number; // percentage change
  trend: number[]; // array of values for sparkline
}

export const mockPipelineRuns: PipelineRun[] = [
  {
    id: '1',
    repo: 'devsecops-api',
    branch: 'main',
    status: 'passed',
    duration: '2m 34s',
    triggeredBy: 'john.doe',
    timestamp: '2024-01-02T10:30:00Z',
  },
  {
    id: '2',
    repo: 'frontend-app',
    branch: 'feature/auth',
    status: 'failed',
    duration: '1m 45s',
    triggeredBy: 'jane.smith',
    timestamp: '2024-01-02T09:15:00Z',
  },
  {
    id: '3',
    repo: 'microservice-core',
    branch: 'main',
    status: 'passed',
    duration: '3m 12s',
    triggeredBy: 'system',
    timestamp: '2024-01-02T08:00:00Z',
  },
  {
    id: '4',
    repo: 'devsecops-api',
    branch: 'develop',
    status: 'passed',
    duration: '2m 18s',
    triggeredBy: 'bob.wilson',
    timestamp: '2024-01-01T16:45:00Z',
  },
  {
    id: '5',
    repo: 'frontend-app',
    branch: 'main',
    status: 'running',
    duration: '1m 20s',
    triggeredBy: 'system',
    timestamp: '2024-01-02T11:00:00Z',
  },
];

export const mockSecurityTools: SecurityToolStatus[] = [
  {
    name: 'CodeQL',
    status: 'pass',
    lastRun: '2024-01-02T10:30:00Z',
    findings: 0,
  },
  {
    name: 'Trivy',
    status: 'warn',
    lastRun: '2024-01-02T10:28:00Z',
    findings: 3,
  },
  {
    name: 'Checkov',
    status: 'pass',
    lastRun: '2024-01-02T10:25:00Z',
    findings: 0,
  },
  {
    name: 'Gitleaks',
    status: 'fail',
    lastRun: '2024-01-02T10:20:00Z',
    findings: 2,
  },
  {
    name: 'npm-audit',
    status: 'warn',
    lastRun: '2024-01-02T10:15:00Z',
    findings: 5,
  },
];

export const mockKpiData: KpiData[] = [
  {
    label: 'Pipelines Passed',
    value: 87,
    change: 5.2,
    trend: [82, 84, 83, 85, 86, 87, 87],
  },
  {
    label: 'Critical Vulnerabilities',
    value: 2,
    change: -33.3,
    trend: [3, 3, 2, 2, 2, 2, 2],
  },
  {
    label: 'Secrets Detected',
    value: 5,
    change: 0,
    trend: [5, 5, 5, 5, 5, 5, 5],
  },
  {
    label: 'Security Gate Failures',
    value: 3,
    change: -25.0,
    trend: [4, 4, 3, 3, 3, 3, 3],
  },
];

export const mockTrendData: TrendDataPoint[] = [
  { date: '2023-12-26', value: 45 },
  { date: '2023-12-27', value: 52 },
  { date: '2023-12-28', value: 48 },
  { date: '2023-12-29', value: 55 },
  { date: '2023-12-30', value: 50 },
  { date: '2023-12-31', value: 58 },
  { date: '2024-01-01', value: 54 },
  { date: '2024-01-02', value: 62 },
];

