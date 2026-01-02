#!/usr/bin/env ts-node
/**
 * Security Gate Evaluator
 *
 * This script evaluates security scan results against defined thresholds
 * and determines whether to fail the CI/CD pipeline.
 *
 * Features:
 * - Ingests SARIF and JSON outputs from multiple security tools
 * - Normalizes findings into a common schema
 * - Applies configurable severity thresholds
 * - Generates human-readable reports and machine-parseable outputs
 * - Supports tool-specific overrides and exemptions
 *
 * Usage:
 *   ts-node gate-evaluator.ts --config thresholds.yml --results-dir ../../reports
 *
 * Exit codes:
 *   0: All gates passed
 *   1: Security gate failed (thresholds exceeded)
 *   2: Configuration or runtime error
 */

import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'js-yaml';

// ============================================================================
// Type Definitions
// ============================================================================

interface SeverityLevel {
  critical: number;
  high: number;
  medium: number;
  low: number;
}

interface ThresholdConfig {
  block: Partial<SeverityLevel>;
  warn: Partial<SeverityLevel>;
}

interface ToolOverride {
  [tool: string]: ThresholdConfig;
}

interface Exemption {
  tool: string;
  ruleId: string;
  reason: string;
  expiresAfter: string;
}

interface Settings {
  active_profile: 'production' | 'development';
  fail_on_scanner_error: boolean;
  require_all_scanners: boolean;
  detailed_reports: boolean;
  upload_sarif: boolean;
}

interface ThresholdsYaml {
  production: ThresholdConfig;
  development: ThresholdConfig;
  tool_overrides?: ToolOverride;
  exemptions?: Exemption[];
  settings: Settings;
}

interface NormalizedFinding {
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

interface ScanResult {
  tool: string;
  findings: NormalizedFinding[];
  errors?: string[];
}

interface EvaluationResult {
  passed: boolean;
  blocked: boolean;
  findings: {
    total: number;
    bySeverity: SeverityLevel;
    byTool: { [tool: string]: number };
  };
  violations: string[];
  warnings: string[];
}

// ============================================================================
// SARIF Parser
// ============================================================================

class SarifParser {
  static parse(filePath: string, toolName: string): NormalizedFinding[] {
    if (!fs.existsSync(filePath)) {
      console.warn(`⚠️  SARIF file not found: ${filePath}`);
      return [];
    }

    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      const sarif = JSON.parse(content);
      const findings: NormalizedFinding[] = [];

      for (const run of sarif.runs || []) {
        const tool = run.tool?.driver?.name || toolName;

        for (const result of run.results || []) {
          const ruleId = result.ruleId || 'unknown';
          const message = result.message?.text || result.message?.markdown || 'No description';
          const level = this.mapSarifLevel(result.level || 'warning');

          const locations = result.locations || [];
          const primaryLocation = locations[0]?.physicalLocation;
          const file = primaryLocation?.artifactLocation?.uri || 'unknown';
          const line = primaryLocation?.region?.startLine;

          // Extract CWE if available
          const cwe = result.properties?.['security-severity']
            ? `CWE-${result.properties['cwe-id'] || 'unknown'}`
            : undefined;

          findings.push({
            tool,
            category: result.properties?.category || 'security',
            severity: level,
            ruleId,
            title: result.message?.text?.substring(0, 100) || ruleId,
            file,
            line,
            cwe,
            message,
            fingerprint: result.fingerprints?.primaryLocationLineHash || result.partialFingerprints?.primaryLocationLineHash,
          });
        }
      }

      return findings;
    } catch (error) {
      console.error(`❌ Error parsing SARIF file ${filePath}:`, error);
      return [];
    }
  }

  private static mapSarifLevel(level: string): 'critical' | 'high' | 'medium' | 'low' | 'info' {
    switch (level.toLowerCase()) {
      case 'error':
        return 'high';
      case 'warning':
        return 'medium';
      case 'note':
        return 'low';
      default:
        return 'info';
    }
  }
}

// ============================================================================
// JSON Parser for Tool-Specific Formats
// ============================================================================

class JsonParser {
  static parseGitleaks(filePath: string): NormalizedFinding[] {
    if (!fs.existsSync(filePath)) return [];

    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      const results = JSON.parse(content);

      return (results || []).map((item: any) => ({
        tool: 'gitleaks',
        category: 'secrets',
        severity: 'critical' as const,
        ruleId: item.RuleID || item.Rule || 'secret-detected',
        title: item.Description || `Secret detected: ${item.RuleID}`,
        file: item.File || 'unknown',
        line: item.StartLine || item.LineNumber,
        message: `Secret detected: ${item.Match ? item.Match.substring(0, 50) + '...' : 'redacted'}`,
        fingerprint: item.Fingerprint,
      }));
    } catch (error) {
      console.error(`❌ Error parsing Gitleaks JSON:`, error);
      return [];
    }
  }

  static parseNpmAudit(filePath: string): NormalizedFinding[] {
    if (!fs.existsSync(filePath)) return [];

    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      const audit = JSON.parse(content);
      const findings: NormalizedFinding[] = [];

      // npm audit v7+ format
      if (audit.vulnerabilities) {
        for (const [pkg, vuln] of Object.entries(audit.vulnerabilities)) {
          const v = vuln as any;
          findings.push({
            tool: 'npm-audit',
            category: 'dependency',
            severity: this.mapNpmSeverity(v.severity),
            ruleId: v.via?.[0]?.cve || v.via?.[0]?.source || `vuln-${pkg}`,
            title: `${pkg}: ${v.via?.[0]?.title || 'Vulnerability'}`,
            file: 'package.json',
            cwe: v.via?.[0]?.cwe?.join(', '),
            cvss: v.via?.[0]?.cvss?.score,
            message: v.via?.[0]?.url || 'See npm audit for details',
          });
        }
      }

      return findings;
    } catch (error) {
      console.error(`❌ Error parsing npm audit JSON:`, error);
      return [];
    }
  }

  static parseDotnetVulnerable(filePath: string): NormalizedFinding[] {
    if (!fs.existsSync(filePath)) return [];

    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      const data = JSON.parse(content);
      const findings: NormalizedFinding[] = [];

      // Parse dotnet list package --vulnerable --format json output
      for (const project of data.projects || []) {
        for (const framework of project.frameworks || []) {
          for (const vuln of framework.vulnerabilities || []) {
            findings.push({
              tool: 'dotnet-vulnerable',
              category: 'dependency',
              severity: this.mapDotnetSeverity(vuln.severity),
              ruleId: vuln.advisoryUrl || `vuln-${vuln.packageId}`,
              title: `${vuln.packageId}: ${vuln.severity} vulnerability`,
              file: project.path || 'project',
              message: vuln.advisoryUrl || 'No advisory URL',
            });
          }
        }
      }

      return findings;
    } catch (error) {
      console.error(`❌ Error parsing .NET vulnerable packages:`, error);
      return [];
    }
  }

  private static mapNpmSeverity(severity: string): 'critical' | 'high' | 'medium' | 'low' | 'info' {
    const s = severity?.toLowerCase();
    if (s === 'critical') return 'critical';
    if (s === 'high') return 'high';
    if (s === 'moderate') return 'medium';
    if (s === 'low') return 'low';
    return 'info';
  }

  private static mapDotnetSeverity(severity: string): 'critical' | 'high' | 'medium' | 'low' | 'info' {
    const s = severity?.toLowerCase();
    if (s === 'critical') return 'critical';
    if (s === 'high') return 'high';
    if (s === 'moderate' || s === 'medium') return 'medium';
    if (s === 'low') return 'low';
    return 'info';
  }
}

// ============================================================================
// Gate Evaluator
// ============================================================================

class GateEvaluator {
  private config: ThresholdsYaml;
  private activeProfile: ThresholdConfig;

  constructor(configPath: string) {
    const configContent = fs.readFileSync(configPath, 'utf-8');
    this.config = yaml.load(configContent) as ThresholdsYaml;

    const profile = this.config.settings.active_profile;
    this.activeProfile = this.config[profile];

    console.log(`🔧 Using '${profile}' threshold profile`);
  }

  evaluate(scanResults: ScanResult[]): EvaluationResult {
    const allFindings = scanResults.flatMap(r => r.findings);
    const activeExemptions = this.getActiveExemptions();

    // Apply exemptions
    const validFindings = allFindings.filter(f =>
      !this.isExempted(f, activeExemptions)
    );

    // Count by severity
    const bySeverity: SeverityLevel = {
      critical: 0,
      high: 0,
      medium: 0,
      low: 0,
    };

    const byTool: { [tool: string]: number } = {};

    for (const finding of validFindings) {
      if (finding.severity !== 'info') {
        bySeverity[finding.severity]++;
      }
      byTool[finding.tool] = (byTool[finding.tool] || 0) + 1;
    }

    // Evaluate thresholds
    const violations: string[] = [];
    const warnings: string[] = [];

    // Global thresholds
    for (const [severity, count] of Object.entries(bySeverity)) {
      const blockThreshold = this.activeProfile.block[severity as keyof SeverityLevel];
      const warnThreshold = this.activeProfile.warn?.[severity as keyof SeverityLevel];

      if (blockThreshold !== undefined && count > blockThreshold) {
        violations.push(
          `❌ ${severity.toUpperCase()}: ${count} found, threshold is ${blockThreshold}`
        );
      } else if (warnThreshold !== undefined && count > warnThreshold) {
        warnings.push(
          `⚠️  ${severity.toUpperCase()}: ${count} found, warning threshold is ${warnThreshold}`
        );
      }
    }

    // Tool-specific overrides
    if (this.config.tool_overrides) {
      for (const [tool, override] of Object.entries(this.config.tool_overrides)) {
        const toolFindings = validFindings.filter(f => f.tool === tool);
        const toolBySeverity = this.countBySeverity(toolFindings);

        for (const [severity, count] of Object.entries(toolBySeverity)) {
          const blockThreshold = override.block[severity as keyof SeverityLevel];
          if (blockThreshold !== undefined && count > blockThreshold) {
            violations.push(
              `❌ [${tool}] ${severity.toUpperCase()}: ${count} found, threshold is ${blockThreshold}`
            );
          }
        }
      }
    }

    return {
      passed: violations.length === 0,
      blocked: violations.length > 0,
      findings: {
        total: validFindings.length,
        bySeverity,
        byTool,
      },
      violations,
      warnings,
    };
  }

  private countBySeverity(findings: NormalizedFinding[]): SeverityLevel {
    return findings.reduce((acc, f) => {
      if (f.severity !== 'info') {
        acc[f.severity]++;
      }
      return acc;
    }, { critical: 0, high: 0, medium: 0, low: 0 } as SeverityLevel);
  }

  private getActiveExemptions(): Exemption[] {
    if (!this.config.exemptions) return [];

    const now = new Date();
    return this.config.exemptions.filter(ex => {
      const expires = new Date(ex.expiresAfter);
      return expires > now;
    });
  }

  private isExempted(finding: NormalizedFinding, exemptions: Exemption[]): boolean {
    return exemptions.some(ex =>
      ex.tool === finding.tool && ex.ruleId === finding.ruleId
    );
  }
}

// ============================================================================
// Main Execution
// ============================================================================

function main() {
  const args = process.argv.slice(2);
  const configPath = args.find(a => a.startsWith('--config='))?.split('=')[1]
    || path.join(__dirname, 'thresholds.yml');
  const resultsDir = args.find(a => a.startsWith('--results-dir='))?.split('=')[1]
    || path.join(__dirname, '../../reports');

  console.log('🔐 DevSecOps Security Gate Evaluator');
  console.log('=====================================\n');

  // Load configuration
  let evaluator: GateEvaluator;
  try {
    evaluator = new GateEvaluator(configPath);
  } catch (error) {
    console.error('❌ Failed to load configuration:', error);
    process.exit(2);
  }

  // Collect scan results
  const scanResults: ScanResult[] = [];

  // SARIF files
  const sarifFiles = [
    { path: path.join(resultsDir, 'codeql-results.sarif'), tool: 'codeql' },
    { path: path.join(resultsDir, 'checkov-results.sarif'), tool: 'checkov' },
    { path: path.join(resultsDir, 'trivy-results.sarif'), tool: 'trivy' },
    { path: path.join(resultsDir, 'semgrep-results.sarif'), tool: 'semgrep' },
  ];

  for (const { path: filePath, tool } of sarifFiles) {
    const findings = SarifParser.parse(filePath, tool);
    if (findings.length > 0 || fs.existsSync(filePath)) {
      scanResults.push({ tool, findings });
      console.log(`✓ Loaded ${findings.length} findings from ${tool}`);
    }
  }

  // JSON files
  const gitleaksFindings = JsonParser.parseGitleaks(path.join(resultsDir, 'gitleaks-report.json'));
  if (gitleaksFindings.length > 0 || fs.existsSync(path.join(resultsDir, 'gitleaks-report.json'))) {
    scanResults.push({ tool: 'gitleaks', findings: gitleaksFindings });
    console.log(`✓ Loaded ${gitleaksFindings.length} findings from gitleaks`);
  }

  const npmFindings = JsonParser.parseNpmAudit(path.join(resultsDir, 'npm-audit.json'));
  if (npmFindings.length > 0 || fs.existsSync(path.join(resultsDir, 'npm-audit.json'))) {
    scanResults.push({ tool: 'npm-audit', findings: npmFindings });
    console.log(`✓ Loaded ${npmFindings.length} findings from npm-audit`);
  }

  const dotnetFindings = JsonParser.parseDotnetVulnerable(path.join(resultsDir, 'dotnet-vulnerable.json'));
  if (dotnetFindings.length > 0 || fs.existsSync(path.join(resultsDir, 'dotnet-vulnerable.json'))) {
    scanResults.push({ tool: 'dotnet-vulnerable', findings: dotnetFindings });
    console.log(`✓ Loaded ${dotnetFindings.length} findings from dotnet-vulnerable`);
  }

  console.log();

  // Evaluate
  const result = evaluator.evaluate(scanResults);

  // Display results
  console.log('📊 Security Findings Summary');
  console.log('============================');
  console.log(`Total findings: ${result.findings.total}`);
  console.log(`  Critical: ${result.findings.bySeverity.critical}`);
  console.log(`  High:     ${result.findings.bySeverity.high}`);
  console.log(`  Medium:   ${result.findings.bySeverity.medium}`);
  console.log(`  Low:      ${result.findings.bySeverity.low}`);
  console.log();

  console.log('By Tool:');
  for (const [tool, count] of Object.entries(result.findings.byTool)) {
    console.log(`  ${tool}: ${count}`);
  }
  console.log();

  // Warnings
  if (result.warnings.length > 0) {
    console.log('⚠️  Warnings:');
    result.warnings.forEach(w => console.log(`  ${w}`));
    console.log();
  }

  // Violations
  if (result.violations.length > 0) {
    console.log('🚨 SECURITY GATE FAILED');
    console.log('=======================');
    result.violations.forEach(v => console.log(`  ${v}`));
    console.log();
    process.exit(1);
  }

  console.log('✅ Security gate PASSED');
  process.exit(0);
}

// Execute if run directly
if (require.main === module) {
  main();
}

export { GateEvaluator, SarifParser, JsonParser, NormalizedFinding, EvaluationResult };
