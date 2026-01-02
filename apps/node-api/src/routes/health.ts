/**
 * Health Check Route
 *
 * Provides health check endpoints for monitoring and load balancers.
 */

import { Router, Request, Response } from 'express';

const router = Router();

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  uptime: number;
  version: string;
  checks: {
    [key: string]: {
      status: 'pass' | 'fail';
      message?: string;
    };
  };
}

/**
 * Basic health check
 */
router.get('/', (req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
  });
});

/**
 * Detailed health check
 */
router.get('/detailed', (req: Request, res: Response) => {
  const health: HealthStatus = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: '1.0.0',
    checks: {
      memory: {
        status: 'pass',
        message: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB used`,
      },
      process: {
        status: 'pass',
        message: `PID ${process.pid}`,
      },
    },
  };

  res.json(health);
});

/**
 * Readiness check (for Kubernetes)
 */
router.get('/ready', (req: Request, res: Response) => {
  // In a real application, check database connections, etc.
  const isReady = true;

  if (isReady) {
    res.json({ status: 'ready' });
  } else {
    res.status(503).json({ status: 'not ready' });
  }
});

/**
 * Liveness check (for Kubernetes)
 */
router.get('/live', (req: Request, res: Response) => {
  res.json({ status: 'alive' });
});

export { router as healthRouter };
