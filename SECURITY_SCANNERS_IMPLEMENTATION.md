# Security Scanners Implementation

This document describes the production-grade security scanning capabilities that have been integrated into the DevSecOps platform.

## Overview

The platform now includes real security scanning tools that analyze code for vulnerabilities, secrets, misconfigurations, and compliance issues. All findings are normalized, enriched with CVE/CWE data, and mapped to OWASP Top 10 categories.

## Implemented Scanners

### 1. Semgrep (SAST)
- **Purpose**: Static Application Security Testing
- **Scans for**: Code vulnerabilities, injection flaws, insecure patterns
- **Location**: `backend/src/scanners/semgrep.ts`
- **Requirements**: `semgrep` CLI tool installed (`pip install semgrep`)

### 2. Trivy (Container/IaC Scanner)
- **Purpose**: Multi-purpose vulnerability scanner
- **Scans for**: 
  - Container image vulnerabilities
  - Infrastructure as Code misconfigurations (Terraform, Kubernetes, Dockerfile)
  - Dependency vulnerabilities
- **Location**: `backend/src/scanners/trivy.ts`
- **Requirements**: `trivy` CLI tool installed

### 3. Gitleaks (Secret Detection)
- **Purpose**: Detect secrets and credentials in code
- **Scans for**: API keys, passwords, tokens, private keys
- **Location**: `backend/src/scanners/gitleaks.ts`
- **Requirements**: `gitleaks` CLI tool installed

### 4. npm audit (Dependency Scanning)
- **Purpose**: Scan npm packages for known CVEs
- **Scans for**: Vulnerabilities in `package.json` dependencies
- **Location**: `backend/src/scanners/npmAudit.ts`
- **Requirements**: `npm` and `package.json` present

### 5. Bandit (Python SAST)
- **Purpose**: Python-specific security scanning
- **Scans for**: Python security issues, insecure functions, weak cryptography
- **Location**: `backend/src/scanners/bandit.ts`
- **Requirements**: `bandit` CLI tool installed (`pip install bandit`) and Python files present

## Core Services

### Scanner Orchestrator (`backend/src/services/scanner.ts`)
- Coordinates all security scanners
- Runs scans in parallel for better performance
- Normalizes findings from all tools
- Handles GitHub repository cloning and cleanup

### GitHub Integration (`backend/src/services/github.ts`)
- Fetches repository metadata via GitHub API
- Clones repositories for scanning
- Retrieves commit history
- Supports both public and private repositories (with token)

### CVE Lookup Service (`backend/src/services/cveLookup.ts`)
- Enriches findings with CVE data from NVD API
- Provides CVSS scores and severity information
- Supports batch lookups with rate limiting

### OWASP Mapper (`backend/src/services/owaspMapper.ts`)
- Maps findings to OWASP Top 10 2021 categories
- Uses CWE-to-OWASP mappings
- Tool-specific rule mappings
- Automatic compliance categorization

### Policy Engine (`backend/src/services/policyEngine.ts`)
- Configurable security gate rules
- Threshold-based blocking (e.g., block on >5 critical findings)
- Tool-specific policies
- Integration with CI/CD gates

## API Endpoints

### GitHub Repository Scanning

#### POST `/api/v1/github/scan`
Scan a GitHub repository for security issues.

**Request Body:**
```json
{
  "repository": "owner/repo",
  "triggeredBy": "manual"
}
```

**Response:**
```json
{
  "success": true,
  "scan": {
    "id": "uuid",
    "repositoryId": "uuid",
    "status": "completed",
    "gateStatus": "passed",
    "totalFindings": 15,
    "criticalCount": 0,
    "highCount": 2,
    "mediumCount": 8,
    "lowCount": 5,
    "infoCount": 0,
    "startedAt": "2024-01-01T00:00:00Z",
    "completedAt": "2024-01-01T00:05:00Z"
  },
  "repository": {
    "id": "uuid",
    "name": "repo",
    "url": "https://github.com/owner/repo"
  }
}
```

#### GET `/api/v1/github/repository/:owner/:repo`
Get repository metadata without scanning.

**Response:**
```json
{
  "success": true,
  "repository": {
    "name": "repo",
    "fullName": "owner/repo",
    "description": "Repository description",
    "url": "https://github.com/owner/repo",
    "cloneUrl": "https://github.com/owner/repo.git",
    "defaultBranch": "main",
    "language": "TypeScript",
    "stars": 1234,
    "forks": 56,
    "isPrivate": false
  },
  "recentCommits": [...]
}
```

## Usage Examples

### Scanning a Public GitHub Repository

```bash
curl -X POST http://localhost:3001/api/v1/github/scan \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "repository": "facebook/react",
    "triggeredBy": "manual"
  }'
```

### Scanning with Full URL

```bash
curl -X POST http://localhost:3001/api/v1/github/scan \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "repository": "https://github.com/owner/repo",
    "triggeredBy": "api"
  }'
```

## Configuration

### Environment Variables

Add to `.env`:

```bash
# Optional: GitHub token for higher rate limits and private repo access
GITHUB_TOKEN=ghp_your_token_here
```

### Installing Scanner Tools

#### macOS (using Homebrew)
```bash
brew install gitleaks trivy
pip install semgrep bandit
```

#### Linux
```bash
# Gitleaks
wget https://github.com/gitleaks/gitleaks/releases/latest/download/gitleaks-linux-amd64 -O /usr/local/bin/gitleaks
chmod +x /usr/local/bin/gitleaks

# Trivy
sudo apt-get install -y wget apt-transport-https gnupg lsb-release
wget -qO - https://aquasecurity.github.io/trivy-repo/deb/public.key | sudo apt-key add -
sudo apt-get update
sudo apt-get install -y trivy

# Semgrep and Bandit
pip install semgrep bandit
```

## How It Works

1. **Repository Cloning**: GitHub service clones the repository to a temporary directory
2. **Parallel Scanning**: All applicable scanners run in parallel:
   - Semgrep scans for code issues
   - Trivy scans for vulnerabilities and IaC issues
   - Gitleaks scans for secrets
   - npm audit scans dependencies (if package.json exists)
   - Bandit scans Python files (if .py files exist)
3. **Normalization**: All findings are normalized to a common format
4. **Enrichment**: Findings are enriched with:
   - OWASP Top 10 mappings
   - CVE data (when available)
   - Compliance mappings
5. **Policy Evaluation**: Security gate status is calculated using the policy engine
6. **Storage**: Results are stored in the database with compliance mappings
7. **Cleanup**: Temporary directory is removed

## Security Gate Policies

Default policy (`backend/src/services/policyEngine.ts`):
- Blocks on any critical or high severity findings
- Warns on >50 medium severity findings
- Warns on >100 low severity findings

Customize policies in the code or extend to load from database.

## Data Flow

```
GitHub Repository
  ↓
Clone to Temp Directory
  ↓
Run Scanners (Parallel)
  ├─ Semgrep → SAST Findings
  ├─ Trivy → Container/IaC Findings
  ├─ Gitleaks → Secret Findings
  ├─ npm audit → Dependency Findings
  └─ Bandit → Python Findings
  ↓
Normalize & Enrich
  ├─ OWASP Mapping
  ├─ CVE Lookup (optional)
  └─ Compliance Mapping
  ↓
Policy Evaluation
  ↓
Store in Database
  ├─ Scan Record
  ├─ Findings
  └─ Compliance Mappings
  ↓
Return Results
```

## Next Steps

To extend the platform further:

1. **Pre-scan Vulnerable Repos**: Create a script to scan OWASP Juice Shop, NodeGoat, etc. and pre-load demo data
2. **Dashboard Integration**: Add UI components to trigger scans from the dashboard
3. **CI/CD Integration**: Create GitHub Actions workflow to trigger scans on PRs
4. **Scheduled Scans**: Add cron jobs for periodic scanning
5. **Report Generation**: Add PDF/HTML report generation
6. **Remediation Suggestions**: Integrate AI for fix suggestions

## Troubleshooting

### Scanner Not Found Errors
If a scanner reports "not available", ensure the CLI tool is installed and in PATH:
```bash
which semgrep
which trivy
which gitleaks
which bandit
```

### Rate Limiting
GitHub API has rate limits. To increase:
1. Set `GITHUB_TOKEN` environment variable
2. Rate limits: 5000 requests/hour (with token) vs 60/hour (without)

### Cloning Issues
If repository cloning fails:
- Check internet connectivity
- Verify repository is public (or token has access)
- Check disk space in `/tmp`

### Scan Timeouts
Large repositories may timeout. Consider:
- Increasing timeout in `scanner.ts`
- Scanning specific directories
- Using shallow clones (already implemented)

## Performance Considerations

- Scans run in parallel for better performance
- Temporary directories are cleaned up automatically
- Large repositories may take several minutes
- Consider implementing async scan jobs for better UX
