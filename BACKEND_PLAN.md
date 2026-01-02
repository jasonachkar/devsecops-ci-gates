# Backend API Architecture Plan

## Overview
This document outlines the backend architecture for transforming the DevSecOps Security Dashboard from static data to a live, production-ready system with historical tracking, real-time updates, and advanced features.

## Technology Stack

### Recommended: Node.js + Express + PostgreSQL
**Rationale:**
- Matches existing frontend stack (TypeScript, Node.js)
- PostgreSQL provides robust relational data model for security findings
- Easy integration with existing CI/CD pipeline
- Strong TypeScript support
- Excellent performance for time-series queries

### Alternative: Python + FastAPI + PostgreSQL
**Consider if:**
- You prefer Python for data processing
- Need advanced ML/AI features for security analysis
- Team has stronger Python expertise

## Database Schema

### Core Tables

```sql
-- Repositories table
CREATE TABLE repositories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  url VARCHAR(500) NOT NULL,
  provider VARCHAR(50) NOT NULL, -- 'github', 'gitlab', 'bitbucket'
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(name, provider)
);

-- Scans table (one per CI/CD run)
CREATE TABLE scans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  repository_id UUID REFERENCES repositories(id) ON DELETE CASCADE,
  branch VARCHAR(255) NOT NULL,
  commit_sha VARCHAR(40) NOT NULL,
  commit_message TEXT,
  triggered_by VARCHAR(255) NOT NULL, -- GitHub username, CI system, etc.
  status VARCHAR(50) NOT NULL, -- 'running', 'completed', 'failed'
  gate_status VARCHAR(50), -- 'passed', 'failed', 'warning'
  total_findings INTEGER DEFAULT 0,
  critical_count INTEGER DEFAULT 0,
  high_count INTEGER DEFAULT 0,
  medium_count INTEGER DEFAULT 0,
  low_count INTEGER DEFAULT 0,
  info_count INTEGER DEFAULT 0,
  started_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP,
  metadata JSONB, -- Store additional CI/CD metadata
  created_at TIMESTAMP DEFAULT NOW(),
  INDEX idx_scans_repo (repository_id),
  INDEX idx_scans_created (created_at),
  INDEX idx_scans_branch (branch)
);

-- Findings table (normalized security findings)
CREATE TABLE findings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scan_id UUID REFERENCES scans(id) ON DELETE CASCADE,
  tool VARCHAR(100) NOT NULL, -- 'codeql', 'gitleaks', 'trivy', etc.
  category VARCHAR(100), -- 'sast', 'dast', 'sca', 'iac', 'secrets'
  severity VARCHAR(20) NOT NULL, -- 'critical', 'high', 'medium', 'low', 'info'
  rule_id VARCHAR(255),
  title VARCHAR(500) NOT NULL,
  file_path TEXT,
  line_number INTEGER,
  cwe VARCHAR(20), -- CWE identifier
  cvss_score DECIMAL(3,1), -- CVSS score if available
  message TEXT,
  fingerprint VARCHAR(255), -- For deduplication
  status VARCHAR(50) DEFAULT 'open', -- 'open', 'resolved', 'false_positive', 'accepted_risk'
  resolved_at TIMESTAMP,
  resolved_by VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  INDEX idx_findings_scan (scan_id),
  INDEX idx_findings_severity (severity),
  INDEX idx_findings_tool (tool),
  INDEX idx_findings_status (status),
  INDEX idx_findings_fingerprint (fingerprint)
);

-- Historical trends (aggregated daily/weekly)
CREATE TABLE scan_trends (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  repository_id UUID REFERENCES repositories(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  total_findings INTEGER DEFAULT 0,
  critical_count INTEGER DEFAULT 0,
  high_count INTEGER DEFAULT 0,
  medium_count INTEGER DEFAULT 0,
  low_count INTEGER DEFAULT 0,
  info_count INTEGER DEFAULT 0,
  scans_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(repository_id, date),
  INDEX idx_trends_repo_date (repository_id, date)
);

-- Compliance mappings (OWASP Top 10, CWE Top 25)
CREATE TABLE compliance_mappings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  finding_id UUID REFERENCES findings(id) ON DELETE CASCADE,
  framework VARCHAR(50) NOT NULL, -- 'owasp-top10', 'cwe-top25', 'nist', 'cis'
  category VARCHAR(100) NOT NULL, -- 'A01:2021', 'CWE-79', etc.
  created_at TIMESTAMP DEFAULT NOW(),
  INDEX idx_compliance_finding (finding_id),
  INDEX idx_compliance_framework (framework)
);

-- SBOM records
CREATE TABLE sbom_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scan_id UUID REFERENCES scans(id) ON DELETE CASCADE,
  format VARCHAR(50) NOT NULL, -- 'cyclonedx', 'spdx'
  data JSONB NOT NULL, -- Full SBOM document
  created_at TIMESTAMP DEFAULT NOW(),
  INDEX idx_sbom_scan (scan_id)
);
```

## API Endpoints

### REST API Structure

```
Base URL: /api/v1
```

#### Scans
- `GET /api/v1/scans` - List all scans (with pagination, filtering)
- `GET /api/v1/scans/:id` - Get specific scan details
- `GET /api/v1/scans/latest` - Get latest scan for repository
- `POST /api/v1/scans` - Create new scan (from CI/CD)
- `GET /api/v1/scans/:id/findings` - Get findings for a scan

#### Findings
- `GET /api/v1/findings` - List findings (with advanced filtering)
- `GET /api/v1/findings/:id` - Get specific finding
- `PATCH /api/v1/findings/:id` - Update finding status (resolve, mark false positive)
- `GET /api/v1/findings/trends` - Get finding trends over time

#### Trends & Analytics
- `GET /api/v1/trends` - Get historical trends
- `GET /api/v1/trends/comparison` - Compare two time periods
- `GET /api/v1/analytics/summary` - Get aggregated analytics

#### Compliance
- `GET /api/v1/compliance/owasp-top10` - OWASP Top 10 scorecard
- `GET /api/v1/compliance/cwe-top25` - CWE Top 25 scorecard
- `GET /api/v1/compliance/scorecard` - Overall compliance scorecard

#### SBOM
- `GET /api/v1/sbom/:scanId` - Get SBOM for a scan
- `POST /api/v1/sbom` - Upload SBOM document

#### Repositories
- `GET /api/v1/repositories` - List repositories
- `POST /api/v1/repositories` - Register new repository
- `GET /api/v1/repositories/:id` - Get repository details

### WebSocket Events

```
ws://api.example.com/ws
```

Events:
- `scan:started` - New scan started
- `scan:progress` - Scan progress update
- `scan:completed` - Scan completed
- `finding:new` - New finding detected
- `finding:updated` - Finding status changed

## Implementation Phases

### Phase 1: Basic API (Week 1-2)
1. Set up Express server with TypeScript
2. PostgreSQL database setup
3. Basic CRUD endpoints for scans and findings
4. CI/CD integration to POST scan results

### Phase 2: Historical Tracking (Week 3)
1. Implement scan_trends aggregation
2. Time-series queries for charts
3. Comparison endpoints

### Phase 3: Real-time Updates (Week 4)
1. WebSocket server setup
2. Event broadcasting
3. Frontend WebSocket client integration

### Phase 4: Advanced Features (Week 5-6)
1. Compliance scorecard logic
2. SBOM storage and retrieval
3. Finding deduplication
4. Advanced filtering and search

### Phase 5: Production Ready (Week 7-8)
1. Authentication/Authorization
2. Rate limiting
3. Caching (Redis)
4. Monitoring and logging
5. API documentation (OpenAPI/Swagger)

## CI/CD Integration

### Update GitHub Actions Workflow

Add step to `gate-evaluation` job:

```yaml
- name: Upload scan results to API
  if: always()
  run: |
    curl -X POST ${{ secrets.API_URL }}/api/v1/scans \
      -H "Authorization: Bearer ${{ secrets.API_TOKEN }}" \
      -H "Content-Type: application/json" \
      -d @${{ env.REPORTS_DIR }}/normalized.json
```

## Deployment Options

### Option 1: Railway (Recommended for MVP)
- Easy PostgreSQL setup
- Automatic deployments
- Free tier available
- Simple environment variables

### Option 2: Vercel + Supabase
- Vercel for API (serverless functions)
- Supabase for PostgreSQL
- Excellent developer experience
- Generous free tier

### Option 3: AWS/Azure/GCP
- Full control and scalability
- More complex setup
- Better for production at scale
- Cost-effective at scale

## Security Considerations

1. **Authentication**: JWT tokens or API keys
2. **Rate Limiting**: Prevent abuse
3. **Input Validation**: Sanitize all inputs
4. **SQL Injection**: Use parameterized queries
5. **CORS**: Configure properly for frontend domain
6. **HTTPS**: Always use encrypted connections

## Next Steps

1. Choose deployment platform
2. Set up database
3. Create initial API structure
4. Update CI/CD pipeline
5. Update frontend to use API
6. Add WebSocket support
7. Implement compliance features

