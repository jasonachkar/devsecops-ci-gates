/**
 * @fileoverview Home Page - Main Security Dashboard
 * @description Primary dashboard page displaying security scan results, metrics,
 * charts, and compliance information. Provides comprehensive overview of security posture.
 * 
 * @module pages/HomePage
 */

import { useEffect } from 'react';
import { Shield, AlertTriangle, AlertOctagon, AlertCircle, Info, BarChart3, RefreshCw, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { FindingsTable } from '../components/findings/FindingsTable';
import { ToolDistributionChart } from '../components/charts/ToolDistributionChart';
import { SeverityBreakdownChart } from '../components/charts/SeverityBreakdownChart';
import { Sparkline } from '../components/charts/Sparkline';
import { ComplianceScorecard } from '../components/compliance/ComplianceScorecard';
import { TrendAnalysis } from '../components/analytics/TrendAnalysis';
import { statusIcons } from '../config/icons';
import { useChartColors } from '../hooks/useChartColors';
import { useScanStore } from '../store/scanStore';
import { useLocation } from 'react-router-dom';
import { generateRiskSummary } from '../utils/riskSummary';
import { generateTrendData } from '../utils/chartData';
import { cn } from '../utils/cn';

/**
 * Security gate thresholds
 * @constant
 * @description Maximum allowed findings per severity level before gate fails.
 * Used to determine if CI/CD pipeline should pass or fail.
 */
const thresholds = {
  critical: 0, // Zero tolerance for critical findings
  high: 0, // Zero tolerance for high findings
  medium: 5, // Allow up to 5 medium findings
  low: 20, // Allow up to 20 low findings
};

/**
 * Framer Motion animation variants for container
 * @constant
 * @description Defines entrance animation for the entire page.
 * Uses stagger effect to animate children sequentially.
 */
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05, // Delay between each child animation (50ms)
      delayChildren: 0.1, // Initial delay before starting animations
    },
  },
};

/**
 * Framer Motion animation variants for cards
 * @constant
 * @description Defines entrance animation for individual cards.
 * Subtle fade-in with slight upward movement.
 */
const cardVariants = {
  hidden: { opacity: 0, y: 10 }, // Start slightly below and invisible
  visible: {
    opacity: 1,
    y: 0, // End at normal position
    transition: {
      duration: 0.2, // Quick animation (200ms)
    },
  },
};

/**
 * Home Page Component
 * @component
 * @returns {JSX.Element} Main security dashboard page
 * @description Main dashboard displaying:
 * - Scan metadata and summary
 * - KPI cards with severity breakdowns
 * - Interactive charts (severity breakdown, tool distribution)
 * - Top risk issues
 * - Risk summary
 * - Findings table with filtering
 * - Compliance scorecard
 * - Historical trends
 */
export default function HomePage() {
  // Get current route location for conditional rendering
  const location = useLocation();
  
  // Get scan data and state from Zustand store
  const { currentScan, loading, error, loadScan, repositoryId } = useScanStore();
  
  // Get severity color tokens for consistent styling
  const { severityTokens } = useChartColors();
  
  // Determine if we're on trends-only view
  const showTrendsOnly = location.pathname === '/trends';

  useEffect(() => {
    loadScan('embedded').catch(() => loadScan('file'));
  }, [loadScan]);

  if (loading) {
    return (
      <div className="min-h-screen p-6">
        <div className="mx-auto max-w-[1400px] space-y-4">
          <div className="h-20 animate-pulse rounded-xl bg-dark-bg-secondary" />
          <div className="grid grid-cols-5 gap-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-28 animate-pulse rounded-lg bg-dark-bg-secondary" />
            ))}
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="h-96 animate-pulse rounded-xl bg-dark-bg-secondary" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="text-center">Error loading scan data</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-center">
            <p className="text-sm text-dark-text-secondary">{error}</p>
            <button
              onClick={() => loadScan('file')}
              className="inline-flex items-center justify-center rounded-md bg-gradient-purple px-4 py-2 text-sm font-medium text-white hover:opacity-90 transition-opacity"
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
      <div className="flex min-h-screen items-center justify-center p-6">
        <Card className="max-w-md">
          <CardHeader>
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-dark-bg-tertiary">
              <Shield className="h-6 w-6 text-dark-text-secondary" />
            </div>
            <CardTitle className="text-center">No scan data available</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-sm text-dark-text-secondary">
              Run a security scan to populate the dashboard.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Extract scan data
  const { metadata, summary, findings } = currentScan;
  
  // Check if there are any critical or high severity findings
  // Used for conditional styling and risk assessment
  const hasCriticalOrHigh = summary.bySeverity.critical > 0 || summary.bySeverity.high > 0;
  const riskSummary = generateRiskSummary(currentScan);

  const StatusIcon = hasCriticalOrHigh ? statusIcons.failed : statusIcons.passed;

  const severityConfig = [
    {
      key: 'critical',
      icon: AlertOctagon,
      label: 'Critical',
      gradient: severityTokens.critical.gradient,
      color: severityTokens.critical.color,
    },
    {
      key: 'high',
      icon: AlertTriangle,
      label: 'High',
      gradient: severityTokens.high.gradient,
      color: severityTokens.high.color,
    },
    {
      key: 'medium',
      icon: AlertCircle,
      label: 'Medium',
      gradient: severityTokens.medium.gradient,
      color: severityTokens.medium.color,
    },
    {
      key: 'low',
      icon: Info,
      label: 'Low',
      gradient: severityTokens.low.gradient,
      color: severityTokens.low.color,
    },
    {
      key: 'total',
      icon: BarChart3,
      label: 'Total',
      gradient: 'linear-gradient(135deg, #64748b 0%, #475569 100%)',
      color: '#64748b',
    },
  ];

  const topFindings = findings
    .filter((f) => f.severity === 'critical' || f.severity === 'high')
    .slice(0, 5);

  return (
    <div className="min-h-screen relative overflow-hidden">
      <motion.div
        className="relative mx-auto max-w-[1600px] px-6 py-6 space-y-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header Section */}
        <motion.div variants={cardVariants}>
          <Card className="p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 flex-1">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-purple">
                  <Shield className="h-5 w-5 text-white" />
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1.5">
                    <h1 className="text-2xl font-semibold text-dark-text-primary font-display">
                      Security Scan Dashboard
                    </h1>
                    <Badge 
                      icon={StatusIcon} 
                      status={hasCriticalOrHigh ? 'failed' : 'passed'} 
                      size="sm"
                    >
                      {hasCriticalOrHigh ? 'Failed' : 'Passed'}
                    </Badge>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-2.5 text-xs text-dark-text-secondary">
                    <span className="font-mono">{metadata.repository}</span>
                    <span className="text-dark-text-tertiary">•</span>
                    <span>{metadata.branch}</span>
                    <span className="text-dark-text-tertiary">•</span>
                    <span className="font-mono">{metadata.commit.substring(0, 8)}</span>
                    <span className="text-dark-text-tertiary">•</span>
                    <span>{format(new Date(metadata.timestamp), 'MMM d, yyyy HH:mm')}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="px-4 py-2 rounded-lg bg-dark-bg-tertiary border border-dark-border-primary">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-xl font-semibold text-dark-text-primary">{summary.total}</span>
                    <span className="text-xs text-dark-text-secondary">findings</span>
                  </div>
                </div>
                
                <button
                  onClick={() => loadScan('embedded').catch(() => loadScan('file'))}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-dark-border-primary bg-dark-bg-tertiary text-dark-text-primary hover:border-dark-border-accent hover:bg-dark-bg-elevated transition-all"
                >
                  <RefreshCw className="h-4 w-4" />
                </button>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* KPI Cards - Severity breakdown with thresholds */}
        <motion.div variants={cardVariants}>
          <div className="grid grid-cols-5 gap-3">
            {severityConfig.map((config, index) => {
              // Get count value for this severity level
              const value = config.key === 'total' 
                ? summary.total 
                : summary.bySeverity[config.key as keyof typeof summary.bySeverity];
              
              // Check if threshold is exceeded (for gate status)
              const isExceeded = config.key !== 'total' && 
                value > (thresholds[config.key as keyof typeof thresholds] || 0);
              
              // Generate trend data for sparkline chart
              const trendData = generateTrendData(value);

              return (
                <motion.div
                  key={config.key}
                  variants={cardVariants}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05, duration: 0.2 }}
                >
                  <Card
                    className={cn(
                      'p-4',
                      isExceeded && 'border-semantic-error-border'
                    )}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div
                        className="flex h-8 w-8 items-center justify-center rounded-lg"
                        style={{ background: config.gradient }}
                      >
                        <config.icon className="h-4 w-4 text-white" />
                      </div>
                      {config.key !== 'total' && (
                        <Badge
                          status={isExceeded ? 'failed' : 'passed'}
                          size="sm"
                        >
                          {isExceeded ? 'Blocked' : 'OK'}
                        </Badge>
                      )}
                    </div>

                    <div className="mb-3">
                      <div className="text-3xl font-bold text-dark-text-primary mb-0.5">
                        {value}
                      </div>
                      <div className="text-xs font-medium text-dark-text-secondary uppercase tracking-wide">
                        {config.label}
                      </div>
                    </div>

                    {trendData.length > 0 && (
                      <div className="h-8 opacity-50">
                        <Sparkline data={trendData} color={config.color} height={32} />
                      </div>
                    )}
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Main Analytics Grid */}
        <motion.div variants={cardVariants}>
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Left Column */}
            <div className="space-y-6">
              <motion.div variants={cardVariants}>
                <Card>
                  <CardHeader>
                    <CardTitle>Severity Breakdown</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <SeverityBreakdownChart data={summary.bySeverity} thresholds={thresholds} />
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div variants={cardVariants}>
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Top Risk Issues</CardTitle>
                      {topFindings.length > 0 && (
                        <Badge status="warning" size="sm">{topFindings.length} Critical</Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {topFindings.map((finding, i) => {
                        const config = severityConfig.find((c) => c.key === finding.severity);
                        const Icon = config?.icon || Info;

                        return (
                          <div
                            key={i}
                            className="flex items-start gap-3 rounded-lg border border-dark-border-primary bg-dark-bg-tertiary p-3 transition-all hover:bg-dark-bg-elevated hover:border-dark-border-accent"
                          >
                            <div
                              className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg"
                              style={{ background: config?.gradient }}
                            >
                              <Icon className="h-4 w-4 text-white" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="font-medium text-dark-text-primary mb-1 text-sm">
                                {finding.title}
                              </div>
                              <div className="text-xs text-dark-text-secondary flex items-center gap-1.5">
                                <span className="font-mono">{finding.tool}</span>
                                <span className="text-dark-text-tertiary">•</span>
                                <span className="font-mono truncate">{finding.file}</span>
                                {finding.line && (
                                  <>
                                    <span className="text-dark-text-tertiary">:</span>
                                    <span className="font-mono">{finding.line}</span>
                                  </>
                                )}
                              </div>
                            </div>
                            <Badge
                              status={finding.severity === 'critical' ? 'failed' : 'warning'}
                              size="sm"
                            >
                              {severityTokens[finding.severity].label}
                            </Badge>
                          </div>
                        );
                      })}
                      {topFindings.length === 0 && (
                        <div className="rounded-lg border border-dark-border-primary bg-dark-bg-tertiary p-8 text-center">
                          <CheckCircle className="h-8 w-8 text-semantic-success mx-auto mb-2 opacity-50" />
                          <p className="text-sm font-medium text-dark-text-primary mb-1">All Clear!</p>
                          <p className="text-xs text-dark-text-secondary">No critical or high severity findings detected.</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              <motion.div variants={cardVariants}>
                <Card>
                  <CardHeader>
                    <CardTitle>Findings by Tool</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ToolDistributionChart data={summary.byTool} />
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div variants={cardVariants}>
                <Card>
                  <CardHeader>
                    <CardTitle>Risk Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div
                      className={cn(
                        'rounded-lg border p-4',
                        riskSummary.status === 'blocked' &&
                          'border-semantic-error-border bg-semantic-error-bg',
                        riskSummary.status === 'warning' &&
                          'border-semantic-warning-border bg-semantic-warning-bg',
                        riskSummary.status === 'clear' &&
                          'border-semantic-success-border bg-semantic-success-bg'
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={cn(
                            'flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg',
                            riskSummary.status === 'blocked' && 'bg-semantic-error-bg',
                            riskSummary.status === 'warning' && 'bg-semantic-warning-bg',
                            riskSummary.status === 'clear' && 'bg-semantic-success-bg'
                          )}
                        >
                          {riskSummary.status === 'clear' ? (
                            <CheckCircle className="h-5 w-5 text-semantic-success" />
                          ) : (
                            <AlertTriangle
                              className={cn(
                                'h-5 w-5',
                                riskSummary.status === 'blocked' && 'text-semantic-error',
                                riskSummary.status === 'warning' && 'text-semantic-warning'
                              )}
                            />
                          )}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-dark-text-primary mb-2">
                            {riskSummary.message}
                          </h3>
                          <ul className="space-y-1.5 text-sm text-dark-text-secondary">
                            {riskSummary.details.map((detail, i) => (
                              <li key={i} className="flex items-start gap-2">
                                <span className="text-dark-text-tertiary mt-1">•</span>
                                <span>{detail}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Findings Table */}
        <motion.div variants={cardVariants}>
          <FindingsTable findings={findings} />
        </motion.div>

        {/* Compliance Scorecard - Only show on main page */}
        {!showTrendsOnly && (
          <motion.div variants={cardVariants}>
            <ComplianceScorecard repositoryId={repositoryId || undefined} />
          </motion.div>
        )}

        {/* Historical Trends */}
        <motion.div variants={cardVariants}>
          <TrendAnalysis repositoryId={repositoryId || undefined} days={30} />
        </motion.div>
      </motion.div>
    </div>
  );
}
