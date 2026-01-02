# Backend Setup Guide

## Quick Start

### 1. Navigate to Backend Directory
```bash
cd backend
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Set Up Environment Variables

Create a `.env` file in the `backend` directory:

**Option A: Copy from example (if it exists)**
```bash
cp .env.example .env
```

**Option B: Create manually**

Create `backend/.env` with these minimum required variables:

```env
# Server
NODE_ENV=development
PORT=3001

# Database (PostgreSQL)
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/devsecops_db

# Authentication (generate a random 32+ character string)
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters-long-for-security

# CORS (allow frontend to connect)
CORS_ORIGIN=http://localhost:5173
```

**Generate a secure JWT secret:**
```bash
# On Linux/Mac:
openssl rand -base64 32

# On Windows PowerShell:
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))
```

### 4. Set Up Database

**Option A: Using Docker (Recommended)**
```bash
# Start PostgreSQL in Docker
docker run --name devsecops-postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=devsecops_db \
  -p 5432:5432 \
  -d postgres:16
```

**Option B: Install PostgreSQL Locally**
- Install PostgreSQL 16+ from https://www.postgresql.org/download/
- Create a database named `devsecops_db`
- Update `DATABASE_URL` in `.env` with your credentials

### 5. Run Database Migrations

```bash
# Generate Prisma Client
npm run db:generate

# Run migrations to create tables
npm run db:migrate

# (Optional) Seed database with sample data
npm run db:seed
```

### 6. Start the Backend Server

```bash
# Development mode (with hot reload)
npm run dev

# Or production mode
npm run build
npm start
```

The API will be available at:
- **HTTP API**: `http://localhost:3001/api/v1`
- **WebSocket**: `ws://localhost:3001`

### 7. Verify It's Working

Open your browser or use curl:
```bash
# Health check
curl http://localhost:3001/api/v1/health

# Should return:
# {"status":"ok","timestamp":"...","version":"v1"}
```

## Troubleshooting

### Database Connection Issues

1. **Check PostgreSQL is running:**
   ```bash
   # Docker
   docker ps | grep postgres
   
   # Or check if port 5432 is in use
   ```

2. **Test database connection:**
   ```bash
   # Update DATABASE_URL in .env and try again
   ```

### Port Already in Use

If port 3001 is already in use:
1. Change `PORT` in `.env` to a different port (e.g., `3002`)
2. Update dashboard `.env` to match: `VITE_API_URL=http://localhost:3002/api/v1`

### Missing Environment Variables

The backend will show clear error messages if required variables are missing. Make sure:
- `DATABASE_URL` is set correctly
- `JWT_SECRET` is at least 32 characters
- `CORS_ORIGIN` includes your frontend URL

## Next Steps

Once the backend is running:
1. The dashboard should automatically connect
2. WebSocket status should show "Live" instead of "Offline"
3. You can start sending scan data via the API

## API Testing

You can test the API with curl or Postman:

```bash
# Health check
curl http://localhost:3001/api/v1/health

# Get repositories (requires JWT token)
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  http://localhost:3001/api/v1/repositories
```

For full API documentation, see `backend/README.md`

