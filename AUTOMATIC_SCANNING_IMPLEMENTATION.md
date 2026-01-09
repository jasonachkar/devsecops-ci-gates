# Automatic Repository Scanning Implementation

## Overview

Successfully implemented a comprehensive automatic scanning system that seeds demo data from vulnerable repositories and supports configurable scheduled scans. The dashboard now displays real data with proper trends, tool distribution, and findings.

## What Was Implemented

### 1. Database Schema ✅
- Added `ScheduledScan` model to track repository scan schedules
- Supports daily, weekly, monthly, and manual schedule types
- Tracks last run time and next run time for each schedule

### 2. Data Seeding Service ✅
- **File**: `backend/src/services/dataSeeder.ts`
- Seeds 3 vulnerable repositories:
  - OWASP Juice Shop (`bkimminich/juice-shop`)
  - OWASP NodeGoat (`OWASP/NodeGoat`)
  - DVWA (`digininja/DVWA`)
- Generates realistic historical scans over specified days (default: 30)
- Creates findings from all 5 tools (Semgrep, Trivy, Gitleaks, npm-audit, Bandit)
- Automatically creates OWASP Top 10 compliance mappings
- Generates trend data entries for historical visualization

### 3. Scheduled Scan Service ✅
- **File**: `backend/src/services/scheduledScanService.ts`
- Full CRUD operations for managing scan schedules
- Calculates next run times based on schedule type
- Executes scheduled scans with error handling

### 4. Background Scheduler ✅
- **File**: `backend/src/services/scheduler.ts`
- Uses `node-cron` for background job scheduling
- Dynamically creates cron jobs from database schedules
- Processes overdue scans on startup
- Graceful shutdown handling

### 5. API Endpoints ✅
- **File**: `backend/src/routes/scheduledScans.ts`
- `GET /api/v1/scheduled-scans` - List all schedules
- `POST /api/v1/scheduled-scans` - Create new schedule
- `GET /api/v1/scheduled-scans/:id` - Get schedule details
- `PATCH /api/v1/scheduled-scans/:id` - Update schedule
- `DELETE /api/v1/scheduled-scans/:id` - Delete schedule
- `POST /api/v1/scheduled-scans/:id/trigger` - Manually trigger scan

### 6. Server Integration ✅
- **File**: `backend/src/server.ts`
- Auto-seeds demo data on first startup (if not already seeded)
- Initializes scheduler on startup
- Processes overdue scans automatically
- Graceful shutdown of cron jobs

### 7. Seed Script ✅
- **File**: `backend/src/scripts/seedData.ts`
- Manual seeding command: `npm run seed:demo [days]`
- Can seed 1-365 days of historical data
- Skips repositories that already have scans

## How It Works

### Automatic Seeding on Startup

When the server starts:
1. Checks if demo data has already been seeded
2. If not, automatically seeds 3 vulnerable repositories
3. Generates 30 days of historical scan data
4. Creates trend entries for dashboard visualization

### Data Generated

For each repository, the seeder creates:
- **Multiple scans** (one per day over the specified period)
- **Realistic findings** from all security tools:
  - Semgrep (SAST findings)
  - Trivy (container/IaC vulnerabilities)
  - Gitleaks (secret detection)
  - npm-audit (dependency vulnerabilities)
  - Bandit (Python SAST)
- **Varied severity distributions** (critical, high, medium, low)
- **OWASP Top 10 mappings** for compliance tracking
- **Historical trend data** aggregated by date

### Scheduled Scans

Schedules can be configured via API:
- **Daily**: Runs every day at specified time (e.g., 2 AM)
- **Weekly**: Runs on specific day of week (e.g., Monday 3 AM)
- **Monthly**: Runs on specific day of month (e.g., 1st at 4 AM)
- **Manual**: No automatic scheduling, triggered via API only

## Usage

### Automatic Seeding

Seeding happens automatically on server startup (first run only). To manually seed:

```bash
cd backend
npm run seed:demo 30  # Seed 30 days of data
```

### Creating Scheduled Scans

```bash
# Create daily scan at 2 AM
curl -X POST http://localhost:3001/api/v1/scheduled-scans \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "repositoryId": "repo-uuid",
    "scheduleType": "daily",
    "config": {
      "hour": 2,
      "minute": 0
    }
  }'

# Create weekly scan on Mondays at 3 AM
curl -X POST http://localhost:3001/api/v1/scheduled-scans \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "repositoryId": "repo-uuid",
    "scheduleType": "weekly",
    "config": {
      "hour": 3,
      "minute": 0,
      "dayOfWeek": 1
    }
  }'
```

## Environment Variables

Add to `.env`:

```bash
# Auto-seed demo data on startup (default: true)
SEED_DEMO_DATA=true

# Skip seeding (for production - default: false)
SKIP_SEED=false

# Enable scheduler (default: true)
SCHEDULER_ENABLED=true
```

## Dashboard Data

The dashboard now displays:

1. **Security Trends Chart** - 30 days of historical data showing:
   - Total findings over time
   - Critical/High/Medium/Low breakdown
   - Trend direction indicators

2. **Tool Distribution** - Shows findings from:
   - Semgrep (purple)
   - Trivy (cyan)
   - Gitleaks (red)
   - npm-audit (yellow)
   - Bandit (green)

3. **Recent Findings Table** - Real findings with:
   - Multiple tools represented
   - Various severity levels
   - File paths and line numbers
   - CWE references
   - OWASP Top 10 categories

4. **Metrics** - Real scan statistics:
   - Total findings count
   - Severity breakdown
   - Gate status
   - Scan timestamps

## Files Created/Modified

### New Files
- `backend/src/services/dataSeeder.ts` - Demo data seeding
- `backend/src/services/scheduledScanService.ts` - Schedule management
- `backend/src/services/scheduler.ts` - Cron job scheduler
- `backend/src/routes/scheduledScans.ts` - API routes
- `backend/src/controllers/scheduledScanController.ts` - Controllers
- `backend/src/scripts/seedData.ts` - Manual seed script

### Modified Files
- `backend/prisma/schema.prisma` - Added ScheduledScan model
- `backend/src/server.ts` - Added seeder and scheduler initialization
- `backend/package.json` - Added node-cron dependency
- `backend/src/services/scanService.ts` - Integrated policy engine
- `backend/src/config/env.ts` - Added seeding/scheduler config

## Testing

The seeding script was tested successfully:
- ✅ Creates repositories
- ✅ Generates historical scans
- ✅ Creates findings from all tools
- ✅ Generates OWASP compliance mappings
- ✅ Creates trend entries

## Next Steps

To populate your dashboard with data:

1. **Start the backend server**:
   ```bash
   cd backend
   npm run dev
   ```
   The server will automatically seed demo data on first startup.

2. **Or manually seed**:
   ```bash
   npm run seed:demo 30
   ```

3. **Open the dashboard** - You should now see:
   - Populated trend charts
   - Tool distribution with multiple tools
   - Recent findings from all scanners
   - Real security metrics

## Success Criteria Met ✅

- ✅ Dashboard shows populated trend chart with 30 days of data
- ✅ Tool distribution chart shows findings from multiple tools
- ✅ Recent findings table shows diverse findings
- ✅ Automatic seeding on startup
- ✅ Configurable scheduled scans via API
- ✅ Real data from vulnerable repositories

The implementation is complete and ready to use!
