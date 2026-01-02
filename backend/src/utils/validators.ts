/**
 * @fileoverview Validation Schemas
 * @description Zod validation schemas for all API inputs.
 * Ensures type safety, data integrity, and prevents injection attacks.
 * 
 * @module utils/validators
 */

import { z } from 'zod';
import type { SeverityLevel, ScanStatus, GateStatus, FindingStatus } from '../types';

/**
 * Validation schemas using Zod
 * @description Ensures type safety and input validation for all API endpoints.
 * All user inputs are validated against these schemas before processing.
 */

/**
 * Severity level validation schema
 * @constant
 * @description Validates that severity is one of the allowed values
 */
export const severitySchema = z.enum(['critical', 'high', 'medium', 'low', 'info']);

export const scanStatusSchema = z.enum(['running', 'completed', 'failed']);

export const gateStatusSchema = z.enum(['passed', 'failed', 'warning']);

export const findingStatusSchema = z.enum(['open', 'resolved', 'false_positive', 'accepted_risk']);

export const scanPayloadSchema = z.object({
  metadata: z.object({
    timestamp: z.string(),
    repository: z.string(),
    branch: z.string(),
    commit: z.string(),
    triggeredBy: z.string(),
  }),
  summary: z.object({
    total: z.number().int().nonnegative(),
    bySeverity: z.object({
      critical: z.number().int().nonnegative(),
      high: z.number().int().nonnegative(),
      medium: z.number().int().nonnegative(),
      low: z.number().int().nonnegative(),
      info: z.number().int().nonnegative(),
    }),
    byTool: z.record(z.string(), z.number().int().nonnegative()),
  }),
  findings: z.array(
    z.object({
      tool: z.string(),
      category: z.string().optional(),
      severity: severitySchema,
      ruleId: z.string().optional(),
      title: z.string().min(1),
      file: z.string().optional(),
      line: z.number().int().positive().optional(),
      cwe: z.string().optional(),
      cvss: z.number().min(0).max(10).optional(),
      message: z.string().optional(),
      fingerprint: z.string().optional(),
    })
  ),
});

export const createScanSchema = scanPayloadSchema;

export const updateFindingStatusSchema = z.object({
  status: findingStatusSchema,
  assignedTo: z.string().optional(),
  resolvedBy: z.string().optional(),
});

export const findingsQuerySchema = z.object({
  repositoryId: z.string().uuid().optional(),
  scanId: z.string().uuid().optional(),
  severity: severitySchema.optional(),
  tool: z.string().optional(),
  status: findingStatusSchema.optional(),
  assignedTo: z.string().optional(),
  limit: z.string().transform(Number).pipe(z.number().int().positive().max(100)).default('50'),
  offset: z.string().transform(Number).pipe(z.number().int().nonnegative()).default('0'),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
});

export const trendsQuerySchema = z.object({
  repositoryId: z.string().uuid().optional(),
  days: z.string().transform(Number).pipe(z.number().int().positive().max(365)).default('30'),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
});

