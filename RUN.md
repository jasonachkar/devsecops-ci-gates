# 🚀 How to Run the Project

## Quick Start (Easiest Method - Docker Compose)

This is the fastest way to get everything running:

```bash
# 1. Start all services (PostgreSQL, Backend API, Frontend)
docker-compose up

# The services will be available at:
# - Frontend Dashboard: http://localhost:5173
# - Backend API: http://localhost:3001
# - PostgreSQL: localhost:5432
```

That's it! The Docker Compose setup will:
- ✅ Start PostgreSQL database
- ✅ Run database migrations automatically
- ✅ Seed the database with test data
- ✅ Start the backend API server
- ✅ Start the frontend development server

## Manual Setup (If you prefer to run without Docker)

### Step 1: Set up PostgreSQL Database

```bash
# Install PostgreSQL (if not installed)
# macOS: brew install postgresql@16
# Ubuntu: sudo apt-get install postgresql-16

# Create database
createdb devsecops

# Or using psql:
psql -U postgres
CREATE DATABASE devsecops;
\q
```

### Step 2: Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create environment file
cat > .env << EOF
NODE_ENV=development
PORT=3001
API_VERSION=v1

# Database - Update with your PostgreSQL credentials
DATABASE_URL="postgresql://devsecops:devsecops_password@localhost:5432/devsecops?schema=public"

# Authentication - Generate a secure random string (min 32 chars)
JWT_SECRET=$(openssl rand -hex 32)
JWT_EXPIRES_IN=7d

# CORS - Allow frontend to connect
CORS_ORIGIN=http://localhost:5173

# Logging
LOG_LEVEL=info

# AWS (Optional - leave empty if not using)
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_SECURITY_HUB_ENABLED=false
EOF

# Generate Prisma Client
npm run db:generate

# Run database migrations
npm run db:migrate

# Seed database (creates test user and repository)
npm run db:seed

# Start backend server
npm run dev
```

Backend will run on `http://localhost:3001`

### Step 3: Frontend Setup

```bash
cd dashboard

# Install dependencies
npm install

# Create environment file (optional - defaults work for local dev)
cat > .env.local << EOF
VITE_API_URL=http://localhost:3001/api/v1
VITE_WS_URL=http://localhost:3001
EOF

# Start frontend development server
npm run dev
```

Frontend will run on `http://localhost:5173`

## Verify Everything Works

### 1. Check Backend Health

```bash
curl http://localhost:3001/api/v1/health
```

Should return:
```json
{
  "status": "ok",
  "timestamp": "2024-...",
  "version": "v1"
}
```

### 2. Check Frontend

Open `http://localhost:5173` in your browser. You should see the security dashboard.

### 3. Test API with Sample Data

The database seed creates a test repository. You can view it in the dashboard or query via API:

```bash
# Get repositories (requires authentication)
# First, you'd need to login to get a JWT token
# Or use the API key for CI/CD integration
```

## Default Test Credentials

After seeding, you can use:

- **Email**: `admin@example.com`
- **Password**: `password` (Note: Password hashing needs to be implemented - use API keys for now)

## Using the Dashboard

1. **Static Mode**: The dashboard will try to load embedded data first, then fall back to static JSON files
2. **API Mode**: To use live data:
   - Set a `repositoryId` in the store
   - The dashboard will fetch from the API
   - WebSocket will connect for real-time updates

## Troubleshooting

### Port Already in Use

```bash
# Check what's using port 3001
lsof -i :3001

# Or port 5173
lsof -i :5173

# Kill the process or change ports in .env
```

### Database Connection Error

```bash
# Check PostgreSQL is running
pg_isready

# Test connection
psql -U devsecops -d devsecops -h localhost

# If connection fails, check DATABASE_URL in backend/.env
```

### Frontend Can't Connect to API

1. Make sure backend is running on port 3001
2. Check `VITE_API_URL` in `dashboard/.env.local`
3. Verify CORS settings in backend allow `http://localhost:5173`

### Reset Everything

```bash
# Stop all services
docker-compose down

# Remove volumes (deletes database data)
docker-compose down -v

# Start fresh
docker-compose up
```

## Next Steps

1. **View the Dashboard**: Open http://localhost:5173
2. **Explore the API**: Check `backend/README.md` for API documentation
3. **Add Real Data**: Use the API to POST scan results from your CI/CD pipeline
4. **Configure AWS**: If you want AWS Security Hub integration, add credentials to `.env`

## Production Deployment

For production deployment, see:
- `infrastructure/README.md` for Terraform setup
- `backend/README.md` for deployment instructions
- Update all environment variables with production values
- Use a managed PostgreSQL database (RDS, etc.)
- Set up proper SSL/TLS certificates


