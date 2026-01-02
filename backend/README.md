# DevSecOps Security API

Production-ready backend API for the DevSecOps Security Dashboard.

## Features

- ✅ RESTful API with Express + TypeScript
- ✅ PostgreSQL database with Prisma ORM
- ✅ JWT authentication + API keys for CI/CD
- ✅ WebSocket support for real-time updates
- ✅ AWS Security Hub integration
- ✅ Rate limiting and security middleware
- ✅ Structured logging with Winston
- ✅ Input validation with Zod
- ✅ Docker support

## Tech Stack

- **Runtime**: Node.js 20
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL 16
- **ORM**: Prisma
- **Authentication**: JWT
- **WebSocket**: Socket.IO
- **Validation**: Zod
- **Logging**: Winston

## Quick Start

### Prerequisites

- Node.js 20+
- PostgreSQL 16+
- npm or yarn

### Local Development

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Set up environment variables**:
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Set up database**:
   ```bash
   # Generate Prisma Client
   npm run db:generate

   # Run migrations
   npm run db:migrate

   # Seed database (optional)
   npm run db:seed
   ```

4. **Start development server**:
   ```bash
   npm run dev
   ```

The API will be available at `http://localhost:3001`

### Docker Compose

```bash
docker-compose up
```

This will start:
- PostgreSQL database (port 5432)
- API server (port 3001)

## API Endpoints

### Authentication

- `POST /api/v1/auth/login` - Login and get JWT token
- `GET /api/v1/auth/me` - Get current user (requires JWT)

### Scans

- `POST /api/v1/scans` - Create scan (requires API key)
- `GET /api/v1/scans` - List scans (requires JWT)
- `GET /api/v1/scans/:id` - Get scan by ID (requires JWT)
- `GET /api/v1/scans/latest` - Get latest scan (requires JWT)

### Findings

- `GET /api/v1/findings` - List findings with filtering (requires JWT)
- `GET /api/v1/findings/:id` - Get finding by ID (requires JWT)
- `PATCH /api/v1/findings/:id` - Update finding status (requires JWT + engineer role)
- `POST /api/v1/findings/bulk-update` - Bulk update findings (requires JWT + engineer role)

### Trends

- `GET /api/v1/trends` - Get historical trends (requires JWT)
- `GET /api/v1/trends/comparison` - Compare two time periods (requires JWT)

### Compliance

- `GET /api/v1/compliance/owasp-top10` - Get OWASP Top 10 scorecard (requires JWT)
- `GET /api/v1/compliance/cwe-top25` - Get CWE Top 25 scorecard (requires JWT)

### AWS Security Hub

- `POST /api/v1/aws/securityhub/sync` - Sync Security Hub findings (requires JWT + admin/engineer)
- `GET /api/v1/aws/securityhub/findings` - Get Security Hub findings (requires JWT + admin/engineer)

## Environment Variables

See `.env.example` for all available environment variables.

Key variables:
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Secret for JWT token signing (min 32 characters)
- `API_KEY_CI_CD` - API key for CI/CD integration
- `AWS_SECURITY_HUB_ENABLED` - Enable AWS Security Hub integration
- `AWS_ACCESS_KEY_ID` - AWS access key
- `AWS_SECRET_ACCESS_KEY` - AWS secret key
- `AWS_REGION` - AWS region

## Database Schema

The database schema is defined in `prisma/schema.prisma`. Key tables:

- `repositories` - Git repositories
- `scans` - Security scan runs
- `findings` - Normalized security findings
- `scan_trends` - Historical trend data
- `compliance_mappings` - OWASP/CWE mappings
- `aws_security_findings` - AWS Security Hub findings
- `users` - User accounts
- `api_keys` - API keys for CI/CD

## WebSocket Events

The API emits WebSocket events for real-time updates:

- `scan:completed` - Emitted when a scan completes
  ```json
  {
    "scanId": "uuid",
    "repositoryId": "uuid",
    "status": "completed",
    "gateStatus": "passed",
    "totalFindings": 42
  }
  ```

## Security

- **Rate Limiting**: Applied to all endpoints
- **Input Validation**: All inputs validated with Zod
- **Authentication**: JWT for users, API keys for CI/CD
- **Authorization**: Role-based access control (RBAC)
- **Security Headers**: Helmet.js for security headers
- **CORS**: Configurable CORS policy

## Development

### Running Tests

```bash
npm test
```

### Linting

```bash
npm run lint
```

### Type Checking

```bash
npm run typecheck
```

### Database Migrations

```bash
# Create a new migration
npm run db:migrate

# Reset database (development only)
npx prisma migrate reset
```

## Production Deployment

### Docker

```bash
docker build -t devsecops-api .
docker run -p 3001:3001 --env-file .env devsecops-api
```

### Environment Setup

1. Set `NODE_ENV=production`
2. Use strong `JWT_SECRET` (min 32 characters)
3. Configure production `DATABASE_URL`
4. Set up proper CORS origins
5. Enable AWS credentials if using Security Hub

## Architecture

```
┌─────────────┐
│   CI/CD     │──POST──┐
│  Pipeline   │        │
└─────────────┘        │
                       ▼
              ┌─────────────────┐
              │   API Server     │
              │  (Express + TS)  │
              └─────────────────┘
                       │
        ┌──────────────┼──────────────┐
        │              │              │
        ▼              ▼              ▼
  ┌─────────┐   ┌──────────┐   ┌─────────┐
  │PostgreSQL│   │WebSocket  │   │  AWS    │
  │          │   │  (Socket) │   │Security │
  │          │   │           │   │  Hub    │
  └─────────┘   └──────────┘   └─────────┘
```

## License

MIT


