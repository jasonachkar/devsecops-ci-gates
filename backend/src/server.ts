/**
 * @fileoverview Main Express server entry point
 * @description Production-ready API server with WebSocket support, security middleware,
 * and comprehensive error handling. This is the core application server that handles
 * all HTTP requests and WebSocket connections.
 * 
 * @author DevSecOps Team
 * @version 1.0.0
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { env } from './config/env';
import { logger } from './config/logger';
import { errorHandler } from './middleware/errorHandler';
import { apiLimiter } from './middleware/rateLimit';
import routes from './routes';
import { disconnectPrisma } from './config/database';

/**
 * Express application instance
 * @type {express.Application}
 * @description Main Express app with all middleware and routes configured
 */
const app = express();

/**
 * HTTP server instance for WebSocket support
 * @type {import('http').Server}
 * @description Wraps Express app to enable WebSocket functionality via Socket.IO
 */
const httpServer = createServer(app);

/**
 * Socket.IO server instance
 * @type {SocketIOServer}
 * @description Handles real-time WebSocket connections for live dashboard updates
 */
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: env.CORS_ORIGIN.split(','), // Allow connections from configured origins
    methods: ['GET', 'POST'], // WebSocket methods
    credentials: true, // Allow credentials (cookies, auth headers)
  },
});

/**
 * WebSocket connection event handlers
 * @description Manages client connections, room joining/leaving for repository-specific updates
 */
io.on('connection', (socket) => {
  logger.info('WebSocket client connected', { socketId: socket.id });

  /**
   * Handle client disconnection
   * @event disconnect
   */
  socket.on('disconnect', () => {
    logger.info('WebSocket client disconnected', { socketId: socket.id });
  });

  /**
   * Join a repository-specific room for targeted updates
   * @event join:repository
   * @param {string} repositoryId - UUID of the repository to subscribe to
   */
  socket.on('join:repository', (repositoryId: string) => {
    socket.join(`repository:${repositoryId}`);
    logger.info('Client joined repository room', { socketId: socket.id, repositoryId });
  });

  /**
   * Leave a repository room
   * @event leave:repository
   * @param {string} repositoryId - UUID of the repository to unsubscribe from
   */
  socket.on('leave:repository', (repositoryId: string) => {
    socket.leave(`repository:${repositoryId}`);
    logger.info('Client left repository room', { socketId: socket.id, repositoryId });
  });
});

/**
 * Make Socket.IO instance available to routes via app.set()
 * This allows controllers to emit WebSocket events
 */
app.set('io', io);

/**
 * Security middleware - Helmet.js
 * Sets various HTTP security headers to protect against common attacks
 * - Content Security Policy (CSP) to prevent XSS
 * - X-Frame-Options to prevent clickjacking
 * - X-Content-Type-Options to prevent MIME sniffing
 * - And more...
 */
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"], // Only allow resources from same origin
      styleSrc: ["'self'", "'unsafe-inline'"], // Allow inline styles (needed for some UI libraries)
      scriptSrc: ["'self'"], // Only allow scripts from same origin
      imgSrc: ["'self'", "data:", "https:"], // Allow images from same origin, data URIs, and HTTPS
    },
  },
  crossOriginEmbedderPolicy: false, // Disabled for compatibility with some browsers
}));

/**
 * CORS (Cross-Origin Resource Sharing) configuration
 * Allows the frontend (running on different port/domain) to make requests to this API
 */
app.use(cors({
  origin: env.CORS_ORIGIN.split(','), // Allowed origins (comma-separated)
  credentials: true, // Allow cookies and auth headers
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'PUT'], // Allowed HTTP methods
  allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key'], // Allowed request headers
}));

/**
 * Body parsing middleware
 * Parses JSON and URL-encoded request bodies
 * - JSON limit: 10MB (for large scan payloads)
 * - URL-encoded: extended mode for nested objects
 */
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

/**
 * Request logging middleware
 * Logs all incoming requests for debugging and monitoring
 */
app.use((req, res, next) => {
  logger.info('Incoming request', {
    method: req.method, // HTTP method (GET, POST, etc.)
    path: req.path, // Request path
    ip: req.ip, // Client IP address
  });
  next(); // Continue to next middleware
});

/**
 * Global rate limiting middleware
 * Prevents API abuse by limiting requests per IP/API key
 * Applied to all /api routes
 */
app.use('/api', apiLimiter);

/**
 * API routes registration
 * All API endpoints are prefixed with /api/v1 (or configured version)
 * Routes are defined in ./routes/index.ts
 */
app.use(`/api/${env.API_VERSION}`, routes);

/**
 * Root endpoint - API information
 * @route GET /
 * @description Returns basic API information and status
 * @returns {Object} API metadata
 */
app.get('/', (req, res) => {
  res.json({
    name: 'DevSecOps Security API',
    version: env.API_VERSION,
    status: 'operational',
    documentation: `/api/${env.API_VERSION}/health`,
  });
});

/**
 * 404 Not Found handler
 * @description Catches all requests that don't match any route
 * Must be placed after all route definitions but before error handler
 */
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.method} ${req.path} not found`,
  });
});

/**
 * Global error handler
 * @description Catches all errors thrown in routes/middleware
 * Must be the last middleware in the chain
 */
app.use(errorHandler);

/**
 * Graceful shutdown handlers
 * @description Ensures clean shutdown on SIGTERM (Docker/Kubernetes) or SIGINT (Ctrl+C)
 * - Closes WebSocket connections
 * - Disconnects from database
 * - Exits process cleanly
 */
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully');
  io.close(); // Close all WebSocket connections
  await disconnectPrisma(); // Close database connection pool
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, shutting down gracefully');
  io.close();
  await disconnectPrisma();
  process.exit(0);
});

/**
 * Start HTTP server
 * @description Listens on configured PORT and logs startup information
 */
const server = httpServer.listen(env.PORT, () => {
  logger.info(`🚀 Server running on port ${env.PORT}`, {
    environment: env.NODE_ENV,
    apiVersion: env.API_VERSION,
  });
});

/**
 * Unhandled promise rejection handler
 * @description Catches promises that are rejected but not caught
 * Prevents application crashes from unhandled async errors
 */
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection', { reason, promise });
});

/**
 * Make Socket.IO instance globally available
 * @description Allows services to emit WebSocket events without importing server
 * Note: This is a workaround for circular dependency issues
 */
(global as any).io = io;

/**
 * Export Socket.IO instance for direct use in services
 * @type {SocketIOServer}
 */
export { io };

/**
 * Export Express app for testing
 * @type {express.Application}
 */
export default app;
