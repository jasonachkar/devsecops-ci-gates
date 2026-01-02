/**
 * @fileoverview Main API Router
 * @description Consolidates all feature routes into a single router.
 * All routes are prefixed with /api/v1
 * 
 * @module routes/index
 */

import { Router } from 'express';
import scanRoutes from './scans';
import findingRoutes from './findings';
import trendRoutes from './trends';
import complianceRoutes from './compliance';
import awsRoutes from './aws';
import authRoutes from './auth';
import remediationRoutes from './remediation';
import sbomRoutes from './sbom';
import repositoriesRoutes from './repositories';

const router = Router();

/**
 * API v1 routes
 * All routes are prefixed with /api/v1
 */

// Authentication routes
router.use('/auth', authRoutes);

// Core security scan routes
router.use('/scans', scanRoutes);
router.use('/findings', findingRoutes);
router.use('/trends', trendRoutes);

// Compliance and standards routes
router.use('/compliance', complianceRoutes);

// AWS cloud security routes
router.use('/aws', awsRoutes);

// Remediation workflow routes
router.use('/remediation', remediationRoutes);

// SBOM (Software Bill of Materials) routes
router.use('/sbom', sbomRoutes);

// Repository management routes
router.use('/repositories', repositoriesRoutes);

/**
 * Health check endpoint
 */
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: process.env.API_VERSION || 'v1',
  });
});

export default router;

