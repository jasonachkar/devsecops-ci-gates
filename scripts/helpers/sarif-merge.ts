#!/usr/bin/env ts-node
/**
 * SARIF Merge Utility
 *
 * Merges multiple SARIF files into a single consolidated SARIF file.
 * Useful for uploading a single SARIF file to GitHub Security tab.
 *
 * Usage:
 *   ts-node sarif-merge.ts --input "*.sarif" --output merged.sarif
 */

import * as fs from 'fs';
import * as path from 'path';
import { glob } from 'glob';

interface SarifLog {
  version: string;
  $schema?: string;
  runs: SarifRun[];
}

interface SarifRun {
  tool: {
    driver: {
      name: string;
      version?: string;
      informationUri?: string;
      rules?: any[];
    };
  };
  results: any[];
  [key: string]: any;
}

class SarifMerger {
  /**
   * Merge multiple SARIF files into one
   */
  static merge(sarifFiles: string[]): SarifLog {
    const mergedRuns: SarifRun[] = [];

    for (const filePath of sarifFiles) {
      if (!fs.existsSync(filePath)) {
        console.warn(`⚠️  File not found: ${filePath}`);
        continue;
      }

      try {
        const content = fs.readFileSync(filePath, 'utf-8');
        const sarif: SarifLog = JSON.parse(content);

        // Add all runs from this SARIF file
        if (sarif.runs && Array.isArray(sarif.runs)) {
          mergedRuns.push(...sarif.runs);
          console.log(`✓ Merged ${sarif.runs.length} run(s) from ${path.basename(filePath)}`);
        }
      } catch (error) {
        console.error(`❌ Error reading ${filePath}:`, error);
      }
    }

    // Create merged SARIF
    const merged: SarifLog = {
      version: '2.1.0',
      $schema: 'https://raw.githubusercontent.com/oasis-tcs/sarif-spec/master/Schemata/sarif-schema-2.1.0.json',
      runs: mergedRuns,
    };

    return merged;
  }
}

// ============================================================================
// Main Execution
// ============================================================================

async function main() {
  const args = process.argv.slice(2);
  const inputPattern = args.find(a => a.startsWith('--input='))?.split('=')[1];
  const outputPath = args.find(a => a.startsWith('--output='))?.split('=')[1];

  if (!inputPattern || !outputPath) {
    console.error('Usage: ts-node sarif-merge.ts --input="*.sarif" --output=merged.sarif');
    process.exit(1);
  }

  try {
    // Find all matching SARIF files
    const files = await glob(inputPattern);

    if (files.length === 0) {
      console.warn('⚠️  No SARIF files found matching pattern:', inputPattern);
      process.exit(0);
    }

    console.log(`Found ${files.length} SARIF file(s) to merge`);

    // Merge
    const merged = SarifMerger.merge(files);

    // Write output
    fs.writeFileSync(outputPath, JSON.stringify(merged, null, 2));
    console.log(`✅ Merged SARIF written to: ${outputPath}`);
    console.log(`   Total runs: ${merged.runs.length}`);
  } catch (error) {
    console.error('❌ Failed to merge SARIF files:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

export { SarifMerger };
