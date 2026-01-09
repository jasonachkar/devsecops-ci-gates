import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { apiClient } from '../services/api';
import {
  Shield,
  AlertTriangle,
  Cloud,
  RefreshCw,
  TrendingUp,
  Users,
  Lock,
} from 'lucide-react';

export function CloudSecurityPage() {
  const [securityHubFindings, setSecurityHubFindings] = useState<any[]>([]);
  const [cloudTrailAnalysis, setCloudTrailAnalysis] = useState<any>(null);
  const [iamAnalysis, setIamAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState({ hub: false, trail: false, iam: false });
  const [syncing, setSyncing] = useState(false);

  const syncSecurityHub = async () => {
    setSyncing(true);
    try {
      const response = await apiClient.syncSecurityHub();
      if (response.success) {
        loadSecurityHubFindings();
      }
    } catch (error) {
      console.error('Failed to sync Security Hub:', error);
    } finally {
      setSyncing(false);
    }
  };

  const loadSecurityHubFindings = async () => {
    setLoading((prev) => ({ ...prev, hub: true }));
    try {
      const response = await apiClient.getSecurityHubFindings({ limit: 50 });
      if (response.success) {
        setSecurityHubFindings(response.data || []);
      }
    } catch (error) {
      console.error('Failed to load Security Hub findings:', error);
    } finally {
      setLoading((prev) => ({ ...prev, hub: false }));
    }
  };

  const loadCloudTrailAnalysis = async () => {
    setLoading((prev) => ({ ...prev, trail: true }));
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001/api/v1'}/aws/cloudtrail/recent?hours=24`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        setCloudTrailAnalysis(data.data);
      }
    } catch (error) {
      console.error('Failed to load CloudTrail analysis:', error);
    } finally {
      setLoading((prev) => ({ ...prev, trail: false }));
    }
  };

  const loadIamAnalysis = async () => {
    setLoading((prev) => ({ ...prev, iam: true }));
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001/api/v1'}/aws/iam/analyze`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      if (data.success) {
        setIamAnalysis(data.data);
      }
    } catch (error) {
      console.error('Failed to load IAM analysis:', error);
    } finally {
      setLoading((prev) => ({ ...prev, iam: false }));
    }
  };

  useEffect(() => {
    loadSecurityHubFindings();
    loadCloudTrailAnalysis();
    loadIamAnalysis();
  }, []);

  const getSeverityBadge = (severity: string) => {
    const severityLower = severity.toLowerCase();
    if (severityLower === 'critical' || severityLower === 'high') {
      return 'failed';
    }
    if (severityLower === 'medium') {
      return 'warning';
    }
    return 'info';
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-dark-text-primary mb-2">
            Cloud Security Dashboard
          </h1>
          <p className="text-dark-text-secondary">
            AWS Security Hub, CloudTrail, and IAM Analysis
          </p>
        </div>
        <Button onClick={syncSecurityHub} disabled={syncing}>
          <RefreshCw className={`h-4 w-4 mr-2 ${syncing ? 'animate-spin' : ''}`} />
          {syncing ? 'Syncing...' : 'Sync Security Hub'}
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-dark-text-secondary">
                Security Hub Findings
              </CardTitle>
              <Shield className="h-5 w-5 text-blue-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-dark-text-primary mb-1">
              {securityHubFindings.length}
            </div>
            <div className="text-xs text-dark-text-secondary">
              {securityHubFindings.filter((f) => f.severity === 'CRITICAL' || f.severity === 'HIGH').length} High/Critical
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-dark-text-secondary">
                CloudTrail Risk Score
              </CardTitle>
              <TrendingUp className="h-5 w-5 text-orange-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-dark-text-primary mb-1">
              {cloudTrailAnalysis?.analysis?.riskScore || 0}
            </div>
            <div className="text-xs text-dark-text-secondary">
              {cloudTrailAnalysis?.analysis?.totalSuspicious || 0} Suspicious Events
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-dark-text-secondary">
                IAM Risk Score
              </CardTitle>
              <Lock className="h-5 w-5 text-purple-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-dark-text-primary mb-1">
              {iamAnalysis?.overall?.riskScore || 0}
            </div>
            <div className="text-xs text-dark-text-secondary">
              {iamAnalysis?.overall?.totalFindings || 0} Policy Issues
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Security Hub Findings */}
      <Card>
        <CardHeader>
          <CardTitle>AWS Security Hub Findings</CardTitle>
        </CardHeader>
        <CardContent>
          {loading.hub ? (
            <div className="p-8 text-center text-dark-text-secondary">Loading...</div>
          ) : securityHubFindings.length === 0 ? (
            <div className="p-8 text-center text-dark-text-secondary">
              No Security Hub findings. Click "Sync Security Hub" to fetch findings.
            </div>
          ) : (
            <div className="space-y-3">
              {securityHubFindings.slice(0, 10).map((finding, index) => (
                <div
                  key={index}
                  className="p-4 rounded-lg border border-dark-border-primary bg-dark-bg-secondary/50"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h3 className="font-semibold text-dark-text-primary mb-1">
                        {finding.title}
                      </h3>
                      {finding.description && (
                        <p className="text-sm text-dark-text-secondary line-clamp-2">
                          {finding.description}
                        </p>
                      )}
                    </div>
                    <Badge variant={getSeverityBadge(finding.severity)} size="sm">
                      {finding.severity}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-dark-text-secondary mt-3">
                    {finding.resourceType && (
                      <span>Resource: {finding.resourceType}</span>
                    )}
                    {finding.region && <span>Region: {finding.region}</span>}
                    {finding.awsAccountId && (
                      <span>Account: {finding.awsAccountId}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* CloudTrail Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>CloudTrail Security Analysis (Last 24 Hours)</CardTitle>
        </CardHeader>
        <CardContent>
          {loading.trail ? (
            <div className="p-8 text-center text-dark-text-secondary">Loading...</div>
          ) : cloudTrailAnalysis?.analysis ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {cloudTrailAnalysis.analysis.categories.map((category: any, index: number) => (
                  <div
                    key={index}
                    className="p-4 rounded-lg border border-dark-border-primary bg-dark-bg-secondary/50"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle
                        className={`h-4 w-4 ${
                          category.severity === 'critical' || category.severity === 'high'
                            ? 'text-semantic-error-text'
                            : 'text-semantic-warning-text'
                        }`}
                      />
                      <span className="text-sm font-medium text-dark-text-primary">
                        {category.type.replace(/_/g, ' ').toUpperCase()}
                      </span>
                    </div>
                    <div className="text-2xl font-bold text-dark-text-primary">
                      {category.count}
                    </div>
                    <div className="text-xs text-dark-text-secondary mt-1">
                      {category.description}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-dark-text-secondary">
              No CloudTrail analysis available. Ensure AWS credentials are configured.
            </div>
          )}
        </CardContent>
      </Card>

      {/* IAM Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>IAM Policy Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          {loading.iam ? (
            <div className="p-8 text-center text-dark-text-secondary">Loading...</div>
          ) : iamAnalysis ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-dark-text-primary mb-3 flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Users ({iamAnalysis.users.total})
                  </h3>
                  <div className="space-y-2">
                    {Object.entries(iamAnalysis.users.summary || {}).map(([type, count]: [string, any]) => (
                      <div
                        key={type}
                        className="flex items-center justify-between p-2 rounded border border-dark-border-primary"
                      >
                        <span className="text-sm text-dark-text-secondary">
                          {type.replace(/_/g, ' ')}
                        </span>
                        <Badge variant="warning" size="sm">
                          {count}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-dark-text-primary mb-3 flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    Roles ({iamAnalysis.roles.total})
                  </h3>
                  <div className="space-y-2">
                    {Object.entries(iamAnalysis.roles.summary || {}).map(([type, count]: [string, any]) => (
                      <div
                        key={type}
                        className="flex items-center justify-between p-2 rounded border border-dark-border-primary"
                      >
                        <span className="text-sm text-dark-text-secondary">
                          {type.replace(/_/g, ' ')}
                        </span>
                        <Badge variant="warning" size="sm">
                          {count}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-dark-text-secondary">
              No IAM analysis available. Ensure AWS credentials are configured.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
