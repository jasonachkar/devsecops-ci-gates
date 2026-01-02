/**
 * @fileoverview Authentication Middleware
 * @description Handles JWT token validation and API key authentication.
 * Provides middleware functions for protecting routes and extracting user context.
 * 
 * @module middleware/auth
 */

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { prisma } from '../config/database';
import { logger } from '../config/logger';

/**
 * Extended Express Request interface with authentication context
 * @interface AuthRequest
 * @extends Request
 * @description Adds user and API key information to request object
 * after successful authentication
 */
export interface AuthRequest extends Request {
  /** User information (set after JWT authentication) */
  user?: {
    id: string; // User UUID
    email: string; // User email address
    role: string; // User role (admin, engineer, developer, viewer)
  };
  /** API key information (set after API key authentication) */
  apiKey?: {
    id: string; // API key UUID
    repositoryId?: string; // Associated repository UUID (if scoped)
  };
}

/**
 * JWT Authentication Middleware
 * @async
 * @function authenticateJWT
 * @param {AuthRequest} req - Express request object
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next middleware function
 * @returns {Promise<void>} Calls next() if authentication succeeds
 * @description Validates JWT token from Authorization header.
 * Extracts user information and attaches to request object.
 * Verifies user is still active in database.
 * 
 * @example
 * router.get('/protected', authenticateJWT, (req, res) => {
 *   // req.user is now available
 *   res.json({ user: req.user });
 * });
 */
export async function authenticateJWT(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing or invalid authorization header' });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, env.JWT_SECRET) as {
      userId: string;
      email: string;
      role: string;
    };

    // Verify user still exists and is active
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, email: true, role: true, isActive: true },
    });

    if (!user || !user.isActive) {
      return res.status(401).json({ error: 'User not found or inactive' });
    }

    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
    };

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ error: 'Invalid token' });
    }
    logger.error('Authentication error', { error });
    return res.status(500).json({ error: 'Authentication failed' });
  }
}

/**
 * API Key Authentication Middleware
 * @async
 * @function authenticateApiKey
 * @param {AuthRequest} req - Express request object
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next middleware function
 * @returns {Promise<void>} Calls next() if authentication succeeds
 * @description Validates API key from X-API-Key header.
 * Used primarily for CI/CD pipeline integration.
 * Checks key validity, expiration, and updates last used timestamp.
 * 
 * @example
 * router.post('/ingest', authenticateApiKey, (req, res) => {
 *   // req.apiKey is now available
 *   // Can access req.apiKey.repositoryId for scoped operations
 * });
 */
export async function authenticateApiKey(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    // Extract API key from custom header
    const apiKey = req.headers['x-api-key'] as string;

    if (!apiKey) {
      return res.status(401).json({ error: 'Missing API key' });
    }

    // Look up API key in database
    const keyRecord = await prisma.apiKey.findUnique({
      where: { key: apiKey },
      include: { repository: true }, // Include repository for scoped operations
    });

    // Validate key exists and is active
    if (!keyRecord || !keyRecord.isActive) {
      return res.status(401).json({ error: 'Invalid or inactive API key' });
    }

    // Check if key has expired
    if (keyRecord.expiresAt && keyRecord.expiresAt < new Date()) {
      return res.status(401).json({ error: 'API key expired' });
    }

    // Update last used timestamp for audit trail
    await prisma.apiKey.update({
      where: { id: keyRecord.id },
      data: { lastUsedAt: new Date() },
    });

    // Attach API key information to request object
    req.apiKey = {
      id: keyRecord.id,
      repositoryId: keyRecord.repositoryId || undefined, // May be null for global keys
    };

    next();
  } catch (error) {
    logger.error('API key authentication error', { error });
    return res.status(500).json({ error: 'Authentication failed' });
  }
}

/**
 * Role-Based Access Control (RBAC) Middleware Factory
 * @function requireRole
 * @param {...string} allowedRoles - Roles that are allowed to access the route
 * @returns {Function} Express middleware function
 * @description Creates middleware that checks if user has one of the allowed roles.
 * Must be used after authenticateJWT middleware.
 * 
 * @example
 * // Only admins and engineers can access
 * router.delete('/findings/:id', 
 *   authenticateJWT, 
 *   requireRole('admin', 'engineer'), 
 *   deleteFinding
 * );
 */
export function requireRole(...allowedRoles: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    // Ensure user is authenticated first
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Check if user's role is in the allowed roles list
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    // User has required role, continue
    next();
  };
}

