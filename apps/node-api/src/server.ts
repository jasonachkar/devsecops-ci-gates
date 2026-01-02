/**
 * DevSecOps Sample Node.js API
 *
 * This is a sample Express API that demonstrates various security patterns
 * and intentionally includes some security anti-patterns for testing
 * security scanners.
 *
 * SECURITY NOTE: This code is for demonstration purposes only.
 * Some patterns here are intentionally insecure to trigger security scans.
 */

import express, { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import { healthRouter } from './routes/health';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// ============================================================================
// Security Middleware (Good Practices)
// ============================================================================

// Helmet for security headers
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  credentials: true,
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
});
app.use('/api/', limiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ============================================================================
// Routes
// ============================================================================

app.use('/health', healthRouter);

// Root endpoint
app.get('/', (req: Request, res: Response) => {
  res.json({
    service: 'DevSecOps Sample API',
    version: '1.0.0',
    status: 'running',
    timestamp: new Date().toISOString(),
  });
});

// ============================================================================
// INTENTIONAL SECURITY ISSUES (For Testing Scanners)
// ============================================================================

/**
 * SECURITY ISSUE: Hardcoded secret (should trigger Gitleaks/SAST)
 * Fix: Use environment variables and secret management
 */
const HARDCODED_API_KEY = 'sk-1234567890abcdef1234567890abcdef'; // Intentionally bad

/**
 * SECURITY ISSUE: SQL Injection vulnerability (should trigger SAST)
 * Fix: Use parameterized queries
 */
app.get('/api/users/:id', (req: Request, res: Response) => {
  const userId = req.params.id;

  // VULNERABLE: SQL injection (demonstration only - no actual DB)
  const query = `SELECT * FROM users WHERE id = '${userId}'`; // Bad: String concatenation

  // In a real app, this would execute against a database
  // For demo purposes, just return the vulnerable query
  res.json({
    warning: 'This endpoint demonstrates SQL injection vulnerability',
    vulnerableQuery: query,
    fix: 'Use parameterized queries or ORM',
  });
});

/**
 * SECURITY ISSUE: Command injection vulnerability (should trigger SAST)
 * Fix: Validate and sanitize input, avoid shell execution
 */
app.post('/api/execute', (req: Request, res: Response) => {
  const { command } = req.body;

  // VULNERABLE: Command injection (demonstration only)
  // const exec = require('child_process').exec;
  // exec(command, callback); // Never do this!

  res.json({
    warning: 'This endpoint demonstrates command injection vulnerability',
    receivedCommand: command,
    fix: 'Validate input and use safe APIs instead of shell execution',
  });
});

/**
 * SECURITY ISSUE: Weak JWT secret (should trigger SAST)
 * Fix: Use strong, randomly generated secrets from environment
 */
app.post('/api/auth/login', (req: Request, res: Response) => {
  const { username, password } = req.body;

  // Simplified auth (demonstration only)
  if (username && password) {
    // VULNERABLE: Weak secret
    const token = jwt.sign(
      { username, role: 'user' },
      'secret123', // Bad: Weak secret
      { expiresIn: '1h' }
    );

    res.json({ token });
  } else {
    res.status(400).json({ error: 'Username and password required' });
  }
});

/**
 * SECURITY ISSUE: Insufficient input validation (should trigger SAST)
 * Fix: Validate and sanitize all user inputs
 */
app.post('/api/profile', (req: Request, res: Response) => {
  const { email, age, bio } = req.body;

  // VULNERABLE: No input validation
  // Should validate email format, age range, bio length, etc.

  res.json({
    warning: 'This endpoint lacks input validation',
    received: { email, age, bio },
    fix: 'Implement comprehensive input validation',
  });
});

/**
 * SECURITY ISSUE: Sensitive data exposure (should trigger SAST)
 * Fix: Never log or return sensitive information
 */
app.get('/api/debug/config', (req: Request, res: Response) => {
  // VULNERABLE: Exposing sensitive configuration
  res.json({
    warning: 'This endpoint exposes sensitive configuration',
    config: {
      database: process.env.DATABASE_URL || 'postgresql://user:pass@localhost/db',
      apiKey: HARDCODED_API_KEY,
      jwtSecret: 'secret123',
    },
    fix: 'Never expose sensitive configuration',
  });
});

// ============================================================================
// Error Handling
// ============================================================================

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: 'Not Found',
    path: req.path,
  });
});

// Global error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Error:', err);

  // SECURITY ISSUE: Exposing stack traces in production (should trigger SAST)
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message,
    stack: err.stack, // Bad: Exposes internal details
  });
});

// ============================================================================
// Server Startup
// ============================================================================

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`   Health check: http://localhost:${PORT}/health`);
    console.log();
    console.log('⚠️  WARNING: This API contains intentional security vulnerabilities');
    console.log('   for demonstration purposes. DO NOT use in production!');
  });
}

export default app;
