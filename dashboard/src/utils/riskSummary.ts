import type { ScanResult } from '../types/scan';

export interface RiskSummary {
  status: 'blocked' | 'warning' | 'clear';
  message: string;
  details: string[];
}

export function generateRiskSummary(scan: ScanResult): RiskSummary {
  const { summary, findings } = scan;
  const { bySeverity, byTool } = summary;

  const hasCritical = bySeverity.critical > 0;
  const hasHigh = bySeverity.high > 0;
  const hasMedium = bySeverity.medium > 0;

  // Determine overall status
  let status: RiskSummary['status'];
  let message: string;
  const details: string[] = [];

  if (hasCritical) {
    status = 'blocked';
    message = 'Deployment blocked by critical security issues';
    details.push(`${bySeverity.critical} critical ${bySeverity.critical === 1 ? 'vulnerability' : 'vulnerabilities'} must be resolved`);
  } else if (hasHigh) {
    status = 'blocked';
    message = 'Deployment blocked by high-severity issues';
    details.push(`${bySeverity.high} high-severity ${bySeverity.high === 1 ? 'issue' : 'issues'} detected`);
  } else if (hasMedium && bySeverity.medium > 5) {
    status = 'warning';
    message = 'Review recommended before deployment';
    details.push(`${bySeverity.medium} medium-severity issues require attention`);
  } else {
    status = 'clear';
    message = 'No critical security issues detected';
    if (bySeverity.medium > 0 || bySeverity.low > 0) {
      details.push('Minor issues found for future improvement');
    } else {
      details.push('All security checks passed');
    }
  }

  // Add tool-specific insights
  const topTools = Object.entries(byTool)
    .sort(([, a], [, b]) => (b as number) - (a as number))
    .slice(0, 3);

  if (topTools.length > 0 && (hasCritical || hasHigh)) {
    const topToolName = topTools[0][0];
    const topToolCount = topTools[0][1];
    details.push(`${topToolName} identified ${topToolCount} ${topToolCount === 1 ? 'issue' : 'issues'}`);
  }

  // Add category insights if available
  const categories = new Set(findings.filter((f) => f.category).map((f) => f.category));
  if (categories.size > 0 && (hasCritical || hasHigh)) {
    const categoryList = Array.from(categories).slice(0, 3).join(', ');
    details.push(`Affected areas: ${categoryList}`);
  }

  return { status, message, details };
}
