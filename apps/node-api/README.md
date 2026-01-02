# DevSecOps Node.js API

A sample Express.js TypeScript API designed to demonstrate security scanning capabilities in a CI/CD pipeline.

## ⚠️ Important Notice

**This application contains intentional security vulnerabilities for testing purposes.**

This code is designed to trigger various security scanners including:
- SAST (CodeQL/Semgrep)
- Dependency scanning (npm audit)
- Secret scanning (Gitleaks)
- Container scanning (Trivy)

**DO NOT deploy this application to production!**

## Purpose

This API serves as a realistic test subject for the DevSecOps Security Gates pipeline, demonstrating:

1. **Security Best Practices** (what TO do):
   - Helmet for security headers
   - CORS configuration
   - Rate limiting
   - Input validation (on some endpoints)
   - Structured error handling

2. **Security Anti-Patterns** (what NOT to do - intentional for testing):
   - Hardcoded secrets
   - SQL injection vulnerabilities
   - Command injection vulnerabilities
   - Weak JWT secrets
   - Sensitive data exposure
   - Stack trace leakage

## Features

### Endpoints

- `GET /` - Service information
- `GET /health` - Basic health check
- `GET /health/detailed` - Detailed health information
- `GET /health/ready` - Kubernetes readiness probe
- `GET /health/live` - Kubernetes liveness probe

#### Vulnerable Endpoints (For Testing Only)

- `GET /api/users/:id` - SQL injection vulnerability demonstration
- `POST /api/execute` - Command injection vulnerability demonstration
- `POST /api/auth/login` - Weak secret demonstration
- `POST /api/profile` - Input validation issues
- `GET /api/debug/config` - Sensitive data exposure

## Development

### Prerequisites

- Node.js 18+ and npm 9+
- TypeScript 5.x

### Installation

```bash
npm install
```

### Running

Development mode:
```bash
npm run dev
```

Production build:
```bash
npm run build
npm start
```

### Testing

```bash
npm test
```

### Linting

```bash
npm run lint
```

## Security Scanning

### Local Scans

Run npm audit:
```bash
npm audit
```

Run with SARIF output for automation:
```bash
npm run audit
```

### Expected Scan Results

This application is designed to trigger the following types of findings:

1. **Secrets Scanning (Gitleaks)**
   - Hardcoded API keys
   - Embedded credentials

2. **SAST (CodeQL/Semgrep)**
   - SQL injection (CWE-89)
   - Command injection (CWE-78)
   - Hardcoded credentials (CWE-798)
   - Information exposure (CWE-200)
   - Weak cryptography (CWE-326)

3. **Dependency Vulnerabilities (npm audit)**
   - Varies based on dependency versions

4. **Container Scanning (Trivy)**
   - Base image vulnerabilities
   - Dependency vulnerabilities

## Docker

Build:
```bash
docker build -t devsecops-node-api .
```

Run:
```bash
docker run -p 3000:3000 devsecops-node-api
```

## Environment Variables

- `PORT` - Server port (default: 3000)
- `NODE_ENV` - Environment (development/production)
- `ALLOWED_ORIGINS` - CORS allowed origins (comma-separated)
- `DATABASE_URL` - Database connection string (if needed)

## CI/CD Integration

This application is automatically scanned by the security gates pipeline defined in `.github/workflows/security-gates.yml`.

See the main [README.md](../../README.md) for details on the security pipeline.

## License

MIT - For demonstration and testing purposes only
