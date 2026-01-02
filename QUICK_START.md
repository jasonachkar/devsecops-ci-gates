# Quick Start Guide

## 🚀 Getting Started

This guide will help you get the DevSecOps Security Dashboard running locally with the new production backend.

## Prerequisites

- Node.js 20+
- PostgreSQL 16+ (or use Docker)
- npm or yarn

## Option 1: Docker Compose (Recommended)

The easiest way to get everything running:

```bash
# Start all services
docker-compose up

# This will start:
# - PostgreSQL on port 5432
# - API server on port 3001
# - Dashboard on port 5173
```

## Option 2: Manual Setup

### 1. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit .env with your settings:
# - DATABASE_URL (PostgreSQL connection string)
# - JWT_SECRET (min 32 characters)
# - API_KEY_CI_CD (for CI/CD integration)

# Generate Prisma Client
npm run db:generate

# Run database migrations
npm run db:migrate

# Seed database (creates test user and repository)
npm run db:seed

# Start development server
npm run dev
```

Backend will be available at `http://localhost:3001`

### 2. Frontend Setup

```bash
cd dashboard

# Install dependencies
npm install

# Copy environment file (if needed)
# Create .env.local with:
# VITE_API_URL=http://localhost:3001/api/v1
# VITE_WS_URL=http://localhost:3001

# Start development server
npm run dev
```

Dashboard will be available at `http://localhost:5173`

## Testing the API

### Health Check

```bash
curl http://localhost:3001/api/v1/health
```

### Create a Test Scan (requires API key)

```bash
curl -X POST http://localhost:3001/api/v1/scans \
  -H "Content-Type: application/json" \
  -H "X-API-Key: test-api-key-for-cicd" \
  -d '{
    "metadata": {
      "timestamp": "2024-01-01T00:00:00Z",
      "repository": "test-repo",
      "branch": "main",
      "commit": "abc123",
      "triggeredBy": "test-user"
    },
    "summary": {
      "total": 5,
      "bySeverity": {
        "critical": 1,
        "high": 2,
        "medium": 1,
        "low": 1,
        "info": 0
      },
      "byTool": {
        "codeql": 3,
        "trivy": 2
      }
    },
    "findings": [
      {
        "tool": "codeql",
        "severity": "critical",
        "title": "SQL Injection",
        "file": "src/api.ts",
        "line": 42
      }
    ]
  }'
```

### Get Latest Scan (requires JWT token)

First, login to get a token:

```bash
# Login (using seeded test user)
curl -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "password"
  }'

# Use the token from response
curl http://localhost:3001/api/v1/scans/latest?repositoryId=<repository-id> \
  -H "Authorization: Bearer <your-token>"
```

## CI/CD Integration

To enable CI/CD integration, add these secrets to your GitHub repository:

1. `API_URL` - Your API endpoint (e.g., `https://api.example.com`)
2. `API_KEY_CI_CD` - API key for CI/CD (create one in the database or use the seeded key)

The GitHub Actions workflow will automatically POST scan results to your API after normalization.

## Environment Variables

### Backend (.env)

```env
# Server
NODE_ENV=development
PORT=3001
API_VERSION=v1

# Database
DATABASE_URL="postgresql://user:password@localhost:5432/devsecops?schema=public"

# Authentication
JWT_SECRET=your-super-secret-jwt-key-change-in-production-min-32-chars
JWT_EXPIRES_IN=7d

# API Keys
API_KEY_CI_CD=test-api-key-for-cicd

# AWS (Optional)
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_SECURITY_HUB_ENABLED=false

# CORS
CORS_ORIGIN=http://localhost:5173

# Logging
LOG_LEVEL=info
```

### Frontend (.env.local)

```env
VITE_API_URL=http://localhost:3001/api/v1
VITE_WS_URL=http://localhost:3001
```

## Next Steps

1. **Configure AWS Security Hub** (optional):
   - Set `AWS_SECURITY_HUB_ENABLED=true`
   - Add AWS credentials
   - Use `POST /api/v1/aws/securityhub/sync` to sync findings

2. **Update Frontend**:
   - The dashboard now supports API mode
   - Set `repositoryId` in the store to fetch from API
   - WebSocket will automatically connect for real-time updates

3. **Production Deployment**:
   - See `backend/README.md` for deployment instructions
   - Set up proper environment variables
   - Configure production database
   - Set up SSL/TLS

## Troubleshooting

### Database Connection Issues

```bash
# Check PostgreSQL is running
psql -U devsecops -d devsecops -h localhost

# Reset database (development only)
cd backend
npx prisma migrate reset
npm run db:seed
```

### API Not Responding

```bash
# Check logs
cd backend
npm run dev

# Check health endpoint
curl http://localhost:3001/api/v1/health
```

### Frontend Can't Connect

- Verify `VITE_API_URL` is correct
- Check CORS settings in backend
- Ensure backend is running

## Support

For more information:
- Backend API docs: `backend/README.md`
- Implementation status: `IMPLEMENTATION_STATUS.md`
- Architecture: See plan document


