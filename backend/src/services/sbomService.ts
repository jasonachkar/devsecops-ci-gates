/**
 * @fileoverview SBOM Service - Software Bill of Materials management
 * @description Handles SBOM generation, storage, and retrieval.
 * Supports CycloneDX and SPDX formats.
 * 
 * @module services/sbomService
 */

import { prisma } from '../config/database';
import { logger } from '../config/logger';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs/promises';
import * as path from 'path';

const execAsync = promisify(exec);

/**
 * SBOM Service Class
 * @class SbomService
 * @description Provides static methods for SBOM management
 */
export class SbomService {
  /**
   * Generate SBOM using Syft
   * @static
   * @async
   * @param {string} scanId - Scan UUID
   * @param {string} repositoryPath - Path to repository
   * @param {string} [format='cyclonedx-json'] - SBOM format (cyclonedx-json, spdx-json)
   * @returns {Promise<Object>} SBOM data
   */
  static async generateSbom(
    scanId: string,
    repositoryPath: string,
    format: string = 'cyclonedx-json'
  ) {
    try {
      // Check if syft is available
      try {
        await execAsync('which syft');
      } catch {
        throw new Error('Syft is not installed. Install from https://github.com/anchore/syft');
      }

      // Generate SBOM using Syft
      const outputFile = path.join('/tmp', `sbom-${scanId}-${Date.now()}.json`);
      const command = `syft ${repositoryPath} -o ${format} -q > ${outputFile}`;

      logger.info('Generating SBOM', { scanId, repositoryPath, format });

      await execAsync(command);

      // Read generated SBOM
      const sbomData = await fs.readFile(outputFile, 'utf-8');
      const parsed = JSON.parse(sbomData);

      // Store in database
      const record = await prisma.sbomRecord.create({
        data: {
          scanId,
          format: format === 'cyclonedx-json' ? 'cyclonedx' : 'spdx',
          data: parsed,
        },
      });

      // Clean up temp file
      await fs.unlink(outputFile).catch(() => {});

      logger.info('SBOM generated and stored', {
        scanId,
        sbomId: record.id,
        format,
      });

      return record;
    } catch (error) {
      logger.error('Failed to generate SBOM', { error, scanId });
      throw error;
    }
  }

  /**
   * Get SBOM records for a scan
   * @static
   * @async
   * @param {string} scanId - Scan UUID
   * @param {string} [format] - Filter by format
   * @returns {Promise<SbomRecord[]>} SBOM records
   */
  static async getSbomRecords(scanId: string, format?: string) {
    const where: any = { scanId };
    if (format) {
      where.format = format;
    }

    return prisma.sbomRecord.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Get SBOM by ID
   * @static
   * @async
   * @param {string} sbomId - SBOM record UUID
   * @returns {Promise<SbomRecord | null>} SBOM record
   */
  static async getSbomById(sbomId: string) {
    return prisma.sbomRecord.findUnique({
      where: { id: sbomId },
      include: {
        scan: {
          include: {
            repository: true,
          },
        },
      },
    });
  }

  /**
   * Extract vulnerabilities from SBOM
   * @static
   * @async
   * @param {string} sbomId - SBOM record UUID
   * @returns {Promise<Object>} Vulnerability summary
   */
  static async analyzeVulnerabilities(sbomId: string) {
    const sbom = await prisma.sbomRecord.findUnique({
      where: { id: sbomId },
    });

    if (!sbom) {
      throw new Error('SBOM not found');
    }

    // Parse SBOM data and extract components
    const components = (sbom.data as any).components || [];
    
    // Count components by type
    const byType: Record<string, number> = {};
    components.forEach((comp: any) => {
      const type = comp.type || 'unknown';
      byType[type] = (byType[type] || 0) + 1;
    });

    return {
      totalComponents: components.length,
      byType,
      format: sbom.format,
      generatedAt: sbom.createdAt,
    };
  }
}


