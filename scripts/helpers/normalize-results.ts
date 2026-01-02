#!/usr/bin/env ts-node
/**
 * Normalize Security Results
 *
 * Converts various security tool outputs into a normalized JSON format
 * for consumption by the gate evaluator.
 *
 * Usage:
 *   ts-node normalize-results.ts --results-dir ../../reports --output normalized.json
 */

import * as fs from 'fs';
import * as path from 'path';
import { SarifParser, JsonParser, NormalizedFinding } from '../gates/gate-evaluator';

interface NormalizedOutput {
  metadata: {
    timestamp: string;
    repository: string;
    branch: string;
    commit: string;
    triggeredBy: string;
  };
  findings: NormalizedFinding[];
}

class ResultNormalizer {
  private resultsDir: string;

  constructor(resultsDir: string) {
    this.resultsDir = resultsDir;
  }

  /**
   * Normalize all available security scan results
   */
  normalize(): NormalizedFinding[] {
    const allFindings: NormalizedFinding[] = [];

    // SARIF-based tools
    const sarifTools = [
      { file: 'codeql-results.sarif', tool: 'codeql' },
      { file: 'checkov-results.sarif', tool: 'checkov' },
      { file: 'trivy-results.sarif', tool: 'trivy' },
      { file: 'semgrep-results.sarif', tool: 'semgrep' },
    ];

    for (const { file, tool } of sarifTools) {
      const filePath = path.join(this.resultsDir, file);
      const findings = SarifParser.parse(filePath, tool);
      allFindings.push(...findings);
    }

    // JSON-based tools
    const gitleaks = JsonParser.parseGitleaks(
      path.join(this.resultsDir, 'gitleaks-report.json')
    );
    allFindings.push(...gitleaks);

    const npmAudit = JsonParser.parseNpmAudit(
      path.join(this.resultsDir, 'npm-audit.json')
    );
    allFindings.push(...npmAudit);

    const dotnetVuln = JsonParser.parseDotnetVulnerable(
      path.join(this.resultsDir, 'dotnet-vulnerable.json')
    );
    allFindings.push(...dotnetVuln);

    return allFindings;
  }

  /**
   * Create normalized output with metadata
   */
  createOutput(): NormalizedOutput {
    const findings = this.normalize();

    return {
      metadata: {
        timestamp: new Date().toISOString(),
        repository: process.env.GITHUB_REPOSITORY || 'unknown',
        branch: process.env.GITHUB_REF_NAME || 'unknown',
        commit: process.env.GITHUB_SHA || 'unknown',
        triggeredBy: process.env.GITHUB_ACTOR || 'unknown',
      },
      findings,
    };
  }
}

// ============================================================================
// Main Execution
// ============================================================================

function main() {
  const args = process.argv.slice(2);
  const resultsDir = args.find(a => a.startsWith('--results-dir='))?.split('=')[1]
    || path.join(__dirname, '../../reports');
  const outputPath = args.find(a => a.startsWith('--output='))?.split('=')[1]
    || path.join(resultsDir, 'normalized.json');

  console.log('📋 Normalizing security scan results...');

  try {
    const normalizer = new ResultNormalizer(resultsDir);
    const output = normalizer.createOutput();

    fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));

    console.log(`✅ Normalized ${output.findings.length} findings`);
    console.log(`   Output: ${outputPath}`);
  } catch (error) {
    console.error('❌ Failed to normalize results:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

export { ResultNormalizer, NormalizedOutput };
