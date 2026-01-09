/**
 * GitHub Scanner Page
 * Scan any GitHub repository for security vulnerabilities
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { githubApi } from '../../../shared/api/services/github';
import { Card, CardContent, CardHeader, CardTitle } from '../../../shared/components/ui/Card';
import { Button } from '../../../shared/components/ui/Button';
import { Input } from '../../../shared/components/ui/Input';
import { Badge } from '../../../shared/components/ui/Badge';
import { 
  Search, 
  Github, 
  Shield, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle,
  Loader2,
  ExternalLink,
  ArrowRight
} from 'lucide-react';
import { cn } from '../../../shared/lib/utils';

export function GitHubScannerPage() {
  const navigate = useNavigate();
  const [repository, setRepository] = useState('');
  const [error, setError] = useState<string | null>(null);

  const scanMutation = useMutation({
    mutationFn: (repo: string) => 
      githubApi.scanRepository(repo, 'manual'),
    onSuccess: (data) => {
      // Navigate to dashboard with the new scan
      if (data.data?.scan?.repositoryId) {
        navigate(`/?repositoryId=${data.data.scan.repositoryId}&scanId=${data.data.scan.id}`);
      }
    },
    onError: (err: any) => {
      setError(err.message || 'Failed to scan repository');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!repository.trim()) {
      setError('Please enter a repository URL or owner/repo');
      return;
    }

    scanMutation.mutate(repository.trim());
  };

  const parseRepositoryInput = (input: string): string => {
    // Handle various formats:
    // - https://github.com/owner/repo
    // - git@github.com:owner/repo.git
    // - owner/repo
    const trimmed = input.trim();
    
    // If it's already owner/repo format, return as-is
    if (/^[\w-]+\/[\w.-]+$/.test(trimmed)) {
      return trimmed;
    }
    
    // Try to extract from URL
    const urlMatch = trimmed.match(/github\.com[/:]([\w-]+)\/([\w.-]+)/);
    if (urlMatch) {
      return `${urlMatch[1]}/${urlMatch[2].replace(/\.git$/, '')}`;
    }
    
    return trimmed;
  };

  const handleQuickScan = (repo: string) => {
    setRepository(repo);
    setError(null);
    scanMutation.mutate(parseRepositoryInput(repo));
  };

  return (
    <div className="min-h-screen bg-bg-primary p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="animate-fade-in-up">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-info/10 rounded-xl">
              <Github className="w-6 h-6 text-info" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-text-primary">GitHub Repository Scanner</h1>
              <p className="text-text-secondary mt-1">
                Scan any public GitHub repository for security vulnerabilities
              </p>
            </div>
          </div>
        </div>

        {/* Scan Form */}
        <Card className="animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="w-5 h-5" />
              Scan Repository
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Repository URL or owner/repo"
                placeholder="e.g., facebook/react or https://github.com/facebook/react"
                value={repository}
                onChange={(e) => setRepository(e.target.value)}
                error={error || undefined}
                disabled={scanMutation.isPending}
              />

              <div className="flex gap-3">
                <Button
                  type="submit"
                  disabled={scanMutation.isPending || !repository.trim()}
                  className="flex-1"
                  glow
                >
                  {scanMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Scanning...
                    </>
                  ) : (
                    <>
                      <Shield className="w-4 h-4 mr-2" />
                      Start Scan
                    </>
                  )}
                </Button>
              </div>

              {scanMutation.isSuccess && scanMutation.data?.data && (
                <div className="mt-4 p-4 bg-success/10 border border-success/20 rounded-xl">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-success mt-0.5" />
                    <div className="flex-1">
                      <p className="font-medium text-success mb-2">Scan completed successfully!</p>
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-sm">
                        <div>
                          <p className="text-text-tertiary">Total</p>
                          <p className="font-semibold text-text-primary">
                            {scanMutation.data.data.scan.totalFindings}
                          </p>
                        </div>
                        <div>
                          <p className="text-text-tertiary">Critical</p>
                          <p className="font-semibold text-error">
                            {scanMutation.data.data.scan.criticalCount}
                          </p>
                        </div>
                        <div>
                          <p className="text-text-tertiary">High</p>
                          <p className="font-semibold text-warning">
                            {scanMutation.data.data.scan.highCount}
                          </p>
                        </div>
                        <div>
                          <p className="text-text-tertiary">Medium</p>
                          <p className="font-semibold text-text-primary">
                            {scanMutation.data.data.scan.mediumCount}
                          </p>
                        </div>
                        <div>
                          <p className="text-text-tertiary">Low</p>
                          <p className="font-semibold text-text-secondary">
                            {scanMutation.data.data.scan.lowCount}
                          </p>
                        </div>
                      </div>
                      <div className="mt-3 flex items-center gap-2">
                        <Badge
                          variant={
                            scanMutation.data.data.scan.gateStatus === 'passed'
                              ? 'success'
                              : scanMutation.data.data.scan.gateStatus === 'warning'
                              ? 'warning'
                              : 'error'
                          }
                        >
                          {scanMutation.data.data.scan.gateStatus === 'passed' && (
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                          )}
                          {scanMutation.data.data.scan.gateStatus === 'warning' && (
                            <AlertTriangle className="w-3 h-3 mr-1" />
                          )}
                          {scanMutation.data.data.scan.gateStatus === 'failed' && (
                            <XCircle className="w-3 h-3 mr-1" />
                          )}
                          Gate: {scanMutation.data.data.scan.gateStatus}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            if (scanMutation.data?.data?.scan?.repositoryId) {
                              navigate(`/?repositoryId=${scanMutation.data.data.scan.repositoryId}&scanId=${scanMutation.data.data.scan.id}`);
                            }
                          }}
                        >
                          View Results
                          <ArrowRight className="w-4 h-4 ml-1" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </form>
          </CardContent>
        </Card>

        {/* Quick Scan Examples */}
        <Card className="animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          <CardHeader>
            <CardTitle>Popular Repositories to Test</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                { name: 'React', repo: 'facebook/react', description: 'Popular JavaScript library' },
                { name: 'Node.js', repo: 'nodejs/node', description: 'JavaScript runtime' },
                { name: 'Next.js', repo: 'vercel/next.js', description: 'React framework' },
                { name: 'Express', repo: 'expressjs/express', description: 'Web framework' },
              ].map((item) => (
                <button
                  key={item.repo}
                  onClick={() => handleQuickScan(item.repo)}
                  disabled={scanMutation.isPending}
                  className={cn(
                    'p-4 rounded-xl border border-border bg-bg-secondary',
                    'hover:bg-bg-elevated hover:border-border-accent/30',
                    'transition-all duration-200 text-left',
                    'disabled:opacity-50 disabled:cursor-not-allowed'
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <h3 className="font-semibold text-text-primary">{item.name}</h3>
                      <p className="text-sm text-text-secondary mt-1">{item.description}</p>
                      <p className="text-xs text-text-tertiary mt-2 font-mono">{item.repo}</p>
                    </div>
                    <ExternalLink className="w-4 h-4 text-text-tertiary flex-shrink-0" />
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card className="animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              What Gets Scanned?
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { tool: 'Semgrep', desc: 'Code vulnerabilities and injection flaws' },
                { tool: 'Trivy', desc: 'Container and IaC misconfigurations' },
                { tool: 'Gitleaks', desc: 'Exposed secrets and credentials' },
                { tool: 'npm audit', desc: 'Dependency vulnerabilities (if applicable)' },
                { tool: 'Bandit', desc: 'Python security issues (if applicable)' },
              ].map((item) => (
                <div key={item.tool} className="flex items-start gap-3 p-3 rounded-lg bg-bg-secondary">
                  <div className="p-1.5 bg-info/10 rounded-lg">
                    <Shield className="w-4 h-4 text-info" />
                  </div>
                  <div>
                    <p className="font-medium text-text-primary">{item.tool}</p>
                    <p className="text-sm text-text-secondary mt-0.5">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
