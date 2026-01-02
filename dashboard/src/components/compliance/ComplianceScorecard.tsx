import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { apiClient } from '../../services/api';
import { AlertCircle, CheckCircle2, XCircle, Shield } from 'lucide-react';

interface ComplianceScorecardProps {
  repositoryId?: string;
  scanId?: string;
}

interface OwaspCategory {
  category: string;
  categoryCode: string;
  total: number;
  bySeverity: {
    critical: number;
    high: number;
    medium: number;
    low: number;
    info: number;
  };
  findings: any[];
}

interface ComplianceData {
  framework: string;
  totalFindings: number;
  criticalFindings: number;
  scorecard: OwaspCategory[];
  complianceScore: number;
}

export function ComplianceScorecard({ repositoryId, scanId }: ComplianceScorecardProps) {
  const [owaspData, setOwaspData] = useState<ComplianceData | null>(null);
  const [cweData, setCweData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFramework, setActiveFramework] = useState<'owasp' | 'cwe'>('owasp');

  useEffect(() => {
    loadComplianceData();
  }, [repositoryId, scanId]);

  const loadComplianceData = async () => {
    setLoading(true);
    setError(null);

    try {
      const [owaspResponse, cweResponse] = await Promise.all([
        apiClient.getOwaspTop10({ repositoryId, scanId }),
        apiClient.getCweTop25({ repositoryId, scanId }),
      ]);

      if (owaspResponse.success) {
        setOwaspData(owaspResponse.data);
      }
      if (cweResponse.success) {
        setCweData(cweResponse.data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load compliance data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8 text-center text-dark-text-secondary">
          Loading compliance data...
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="text-semantic-error-text mb-2">{error}</div>
          <button
            onClick={loadComplianceData}
            className="text-sm text-dark-text-secondary hover:text-dark-text-primary"
          >
            Retry
          </button>
        </CardContent>
      </Card>
    );
  }

  const data = activeFramework === 'owasp' ? owaspData : cweData;

  if (!data) {
    return null;
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'text-semantic-error-text';
      case 'high':
        return 'text-orange-400';
      case 'medium':
        return 'text-semantic-warning-text';
      case 'low':
        return 'text-blue-400';
      default:
        return 'text-dark-text-secondary';
    }
  };

  const getComplianceStatus = (score: number) => {
    if (score >= 90) return { status: 'excellent', icon: CheckCircle2, color: 'text-semantic-success-text' };
    if (score >= 70) return { status: 'good', icon: Shield, color: 'text-blue-400' };
    if (score >= 50) return { status: 'fair', icon: AlertCircle, color: 'text-semantic-warning-text' };
    return { status: 'poor', icon: XCircle, color: 'text-semantic-error-text' };
  };

  const complianceStatus = 'complianceScore' in data
    ? getComplianceStatus(data.complianceScore)
    : { status: 'unknown', icon: Shield, color: 'text-dark-text-secondary' };

  const StatusIcon = complianceStatus.icon;

  return (
    <div className="space-y-6">
      {/* Framework Selector */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => setActiveFramework('owasp')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeFramework === 'owasp'
              ? 'bg-dark-bg-elevated text-dark-text-primary border border-dark-border-accent'
              : 'text-dark-text-secondary hover:text-dark-text-primary'
          }`}
        >
          OWASP Top 10 2021
        </button>
        <button
          onClick={() => setActiveFramework('cwe')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeFramework === 'cwe'
              ? 'bg-dark-bg-elevated text-dark-text-primary border border-dark-border-accent'
              : 'text-dark-text-secondary hover:text-dark-text-primary'
          }`}
        >
          CWE Top 25
        </button>
      </div>

      {/* Overall Score */}
      {'complianceScore' in data && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Overall Compliance Score</CardTitle>
              <div className="flex items-center gap-3">
                <StatusIcon className={`h-6 w-6 ${complianceStatus.color}`} />
                <div className="text-right">
                  <div className={`text-3xl font-bold ${complianceStatus.color}`}>
                    {data.complianceScore}
                  </div>
                  <div className="text-xs text-dark-text-secondary uppercase">
                    {complianceStatus.status}
                  </div>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <div className="text-sm text-dark-text-secondary mb-1">Total Findings</div>
                <div className="text-2xl font-bold text-dark-text-primary">
                  {data.totalFindings}
                </div>
              </div>
              {'criticalFindings' in data && (
                <div>
                  <div className="text-sm text-dark-text-secondary mb-1">Critical</div>
                  <div className="text-2xl font-bold text-semantic-error-text">
                    {data.criticalFindings}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Scorecard Categories */}
      <Card>
        <CardHeader>
          <CardTitle>{data.framework} Categories</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {'scorecard' in data && data.scorecard.map((category: any, index: number) => {
              const hasFindings = category.total > 0;
              const severity = category.bySeverity?.critical > 0 || category.bySeverity?.high > 0
                ? 'high'
                : category.bySeverity?.medium > 0
                ? 'medium'
                : 'low';

              return (
                <div
                  key={index}
                  className={`p-4 rounded-xl border transition-all ${
                    hasFindings
                      ? 'border-dark-border-accent bg-dark-bg-elevated/50'
                      : 'border-dark-border-primary bg-dark-bg-secondary/50'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {hasFindings ? (
                          <XCircle className="h-4 w-4 text-semantic-error-text" />
                        ) : (
                          <CheckCircle2 className="h-4 w-4 text-semantic-success-text" />
                        )}
                        <h3 className="font-semibold text-dark-text-primary">
                          {category.category || category.cwe}
                        </h3>
                      </div>
                      {category.categoryCode && (
                        <div className="text-xs text-dark-text-secondary font-mono">
                          {category.categoryCode}
                        </div>
                      )}
                    </div>
                    <Badge
                      status={hasFindings ? (severity === 'high' ? 'failed' : 'warning') : 'passed'}
                      size="sm"
                    >
                      {category.total} {category.total === 1 ? 'finding' : 'findings'}
                    </Badge>
                  </div>

                  {hasFindings && category.bySeverity && (
                    <div className="flex items-center gap-4 text-sm">
                      {category.bySeverity.critical > 0 && (
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 rounded-full bg-semantic-error-text" />
                          <span className={getSeverityColor('critical')}>
                            {category.bySeverity.critical} Critical
                          </span>
                        </div>
                      )}
                      {category.bySeverity.high > 0 && (
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 rounded-full bg-orange-400" />
                          <span className={getSeverityColor('high')}>
                            {category.bySeverity.high} High
                          </span>
                        </div>
                      )}
                      {category.bySeverity.medium > 0 && (
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 rounded-full bg-semantic-warning-text" />
                          <span className={getSeverityColor('medium')}>
                            {category.bySeverity.medium} Medium
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


