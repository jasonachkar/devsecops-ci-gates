import { useEffect, useState } from 'react';
import { useScanStore } from '../store/scanStore';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { MetricCard } from '../components/dashboard/MetricCard';
import { format } from 'date-fns';

export default function HomePage() {
  const { currentScan, loading, error, loadScan } = useScanStore();
  const [debugInfo, setDebugInfo] = useState<string>('');

  useEffect(() => {
    console.log('HomePage: Loading scan data...');
    setDebugInfo('Loading...');
    loadScan('embedded')
      .then(() => {
        console.log('HomePage: Embedded data loaded');
        setDebugInfo('Embedded loaded');
      })
      .catch((err) => {
        console.log('HomePage: Embedded failed, trying file:', err);
        setDebugInfo(`Embedded failed: ${err.message}, trying file...`);
        return loadScan('file');
      })
      .then(() => {
        console.log('HomePage: File data loaded');
        setDebugInfo('File loaded');
      })
      .catch((err) => {
        console.error('HomePage: File load failed:', err);
        setDebugInfo(`File failed: ${err.message}`);
      });
  }, [loadScan]);

  // Debug info
  useEffect(() => {
    console.log('HomePage State:', { loading, error, hasData: !!currentScan, debugInfo });
    if (currentScan) {
      console.log('HomePage Data:', {
        total: currentScan.summary.total,
        findings: currentScan.findings.length,
        metadata: currentScan.metadata,
      });
    }
  }, [loading, error, currentScan, debugInfo]);

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8" style={{ backgroundColor: '#0D1117', color: '#F0F6FC' }}>
        <div className="space-y-4">
          <div className="h-8 w-48 rounded" style={{ backgroundColor: '#161B22' }} />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 rounded" style={{ backgroundColor: '#161B22' }} />
            ))}
          </div>
          <div className="text-sm" style={{ color: '#8B949E' }}>Loading... {debugInfo}</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8" style={{ backgroundColor: '#0D1117', color: '#F0F6FC' }}>
        <Card>
          <CardContent className="py-8 text-center">
            <p className="mb-2 font-semibold" style={{ color: '#F0F6FC' }}>Error loading data</p>
            <p className="mb-4 text-sm" style={{ color: '#8B949E' }}>{error}</p>
            <p className="mb-4 text-xs" style={{ color: '#6E7681' }}>Debug: {debugInfo}</p>
            <button
              onClick={() => loadScan('file')}
              className="px-4 py-2 rounded-md transition-colors"
              style={{ backgroundColor: '#58A6FF', color: '#FFFFFF' }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#4A9EFF'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#58A6FF'}
            >
              Retry
            </button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!currentScan) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8" style={{ backgroundColor: '#0D1117', color: '#F0F6FC' }}>
        <Card>
          <CardContent className="py-8 text-center">
            <p className="mb-2 font-semibold" style={{ color: '#F0F6FC' }}>No scan data available</p>
            <p className="mb-4 text-sm" style={{ color: '#8B949E' }}>Click the button below to load data</p>
            <p className="mb-4 text-xs" style={{ color: '#6E7681' }}>Debug: {debugInfo}</p>
            <button
              onClick={() => loadScan('file')}
              className="px-4 py-2 rounded-md transition-colors"
              style={{ backgroundColor: '#58A6FF', color: '#FFFFFF' }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#4A9EFF'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#58A6FF'}
            >
              Load Data
            </button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { metadata, summary, findings } = currentScan;

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8" style={{ backgroundColor: '#0D1117', minHeight: '100vh' }}>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-2xl font-semibold mb-2" style={{ color: '#F0F6FC' }}>Security Dashboard</h2>
          <div className="flex flex-wrap items-center gap-4 text-sm" style={{ color: '#8B949E' }}>
            <span>{metadata.repository}</span>
            <span>•</span>
            <span>{metadata.branch}</span>
            <span>•</span>
            <span>{format(new Date(metadata.timestamp), 'MMM d, yyyy HH:mm')}</span>
          </div>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            title="Total Findings"
            value={summary.total}
          />
          <MetricCard
            title="Critical"
            value={summary.bySeverity.critical}
            subtitle={`${summary.bySeverity.high} high, ${summary.bySeverity.medium} medium`}
          />
          <MetricCard
            title="Tools"
            value={Object.keys(summary.byTool).length}
            subtitle={Object.keys(summary.byTool).join(', ')}
          />
          <MetricCard
            title="Status"
            value={summary.bySeverity.critical === 0 && summary.bySeverity.high === 0 ? 'Passed' : 'Failed'}
            subtitle={summary.bySeverity.critical === 0 && summary.bySeverity.high === 0 ? 'All checks passed' : 'Issues found'}
          />
        </div>

        {/* Severity Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Severity Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {(['critical', 'high', 'medium', 'low', 'info'] as const).map((severity) => {
                const count = summary.bySeverity[severity];
                if (count === 0) return null;
                
                const variants = {
                  critical: 'error' as const,
                  high: 'error' as const,
                  medium: 'warning' as const,
                  low: 'info' as const,
                  info: 'default' as const,
                };

                const colors = {
                  critical: '#F85149',
                  high: '#F85149',
                  medium: '#F59E0B',
                  low: '#58A6FF',
                  info: '#6E7681',
                };

                return (
                  <div key={severity} className="flex items-center justify-between">
                    <span className="text-sm capitalize" style={{ color: '#8B949E' }}>{severity}</span>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <div className="w-24 sm:w-32 h-2 rounded-full overflow-hidden" style={{ backgroundColor: '#21262D' }}>
                        <div
                          className="h-full"
                          style={{ 
                            width: `${(count / summary.total) * 100}%`,
                            backgroundColor: colors[severity]
                          }}
                        />
                      </div>
                      <Badge variant={variants[severity]}>{count}</Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Findings Table */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Findings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr style={{ borderBottom: '1px solid #30363D' }}>
                    <th className="px-2 sm:px-4 py-3 text-left text-xs font-semibold uppercase" style={{ color: '#8B949E' }}>Severity</th>
                    <th className="px-2 sm:px-4 py-3 text-left text-xs font-semibold uppercase" style={{ color: '#8B949E' }}>Issue</th>
                    <th className="px-2 sm:px-4 py-3 text-left text-xs font-semibold uppercase hidden sm:table-cell" style={{ color: '#8B949E' }}>Tool</th>
                    <th className="px-2 sm:px-4 py-3 text-left text-xs font-semibold uppercase" style={{ color: '#8B949E' }}>File</th>
                  </tr>
                </thead>
                <tbody>
                  {findings.slice(0, 10).map((finding, index) => {
                    const variants = {
                      critical: 'error' as const,
                      high: 'error' as const,
                      medium: 'warning' as const,
                      low: 'info' as const,
                      info: 'default' as const,
                    };

                    return (
                      <tr 
                        key={index} 
                        style={{ borderBottom: '1px solid #30363D' }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(33, 38, 45, 0.5)'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                      >
                        <td className="px-2 sm:px-4 py-3">
                          <Badge variant={variants[finding.severity]}>{finding.severity}</Badge>
                        </td>
                        <td className="px-2 sm:px-4 py-3 min-w-0">
                          <div className="text-sm break-words" style={{ color: '#F0F6FC' }}>{finding.title}</div>
                          <div className="text-xs mt-1 line-clamp-1" style={{ color: '#6E7681' }}>{finding.message}</div>
                        </td>
                        <td className="px-2 sm:px-4 py-3 text-sm hidden sm:table-cell" style={{ color: '#8B949E' }}>{finding.tool}</td>
                        <td className="px-2 sm:px-4 py-3 min-w-0">
                          <div className="text-sm font-mono truncate" style={{ color: '#8B949E' }}>{finding.file}</div>
                          {finding.line && (
                            <div className="text-xs" style={{ color: '#6E7681' }}>Line {finding.line}</div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
