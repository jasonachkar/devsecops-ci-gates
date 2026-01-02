# 🔐 DevSecOps Security Scan Report

**Generated:** 2025-01-15T10:30:45.123Z
**Repository:** example-org/devsecops-security-gates
**Branch:** main
**Commit:** abc123def456
**Triggered by:** dependabot[bot]

---

## 📊 Executive Summary

**Status:** ❌ FAIL 🚨

**Total Findings:** 47

| Severity | Count |
|----------|-------|
| 🔴 Critical | 3 |
| 🟠 High | 8 |
| 🟡 Medium | 18 |
| 🔵 Low | 18 |

## 🛠️ Findings by Security Tool

| Tool | Findings | Critical | High | Medium | Low |
|------|----------|----------|------|--------|-----|
| gitleaks | 2 | 2 | 0 | 0 | 0 |
| codeql | 15 | 0 | 5 | 7 | 3 |
| npm-audit | 12 | 1 | 2 | 6 | 3 |
| dotnet-vulnerable | 5 | 0 | 0 | 3 | 2 |
| checkov | 8 | 0 | 1 | 2 | 5 |
| trivy | 5 | 0 | 0 | 0 | 5 |

## 🚨 Critical Findings (Immediate Action Required)

| Tool | Rule ID | Title | File | Line |
|------|---------|-------|------|------|
| gitleaks | generic-api-key | AWS API Key detected | `apps/node-api/src/server.ts` | 42 |
| gitleaks | hardcoded-password | Hardcoded password in source | `infra/terraform/variables.tf` | 78 |
| npm-audit | CVE-2024-12345 | jsonwebtoken: Authentication bypass vulnerability | `package.json` | - |

## ⚠️ High Severity Findings

| Tool | Rule ID | Title | File | Line |
|------|---------|-------|------|------|
| codeql | js/sql-injection | Database query built from user-controlled sources | `apps/node-api/src/server.ts` | 95 |
| codeql | js/command-injection | Unsafe shell command constructed from library input | `apps/node-api/src/server.ts` | 110 |
| codeql | js/clear-text-logging | Clear-text logging of sensitive information | `apps/node-api/src/server.ts` | 165 |
| codeql | cs/web/debug-binary | Deployment of debug binary | `apps/dotnet-api/Program.cs` | 28 |
| codeql | cs/hardcoded-credentials | Hard-coded credentials | `apps/dotnet-api/Program.cs` | 35 |
| npm-audit | CVE-2024-23456 | express: Denial of Service vulnerability | `package.json` | - |
| npm-audit | CVE-2024-34567 | helmet: Security header bypass | `package.json` | - |
| checkov | CKV_AWS_23 | Security group rule allows ingress from 0.0.0.0/0 | `infra/terraform/main.tf` | 52 |

## 🟡 Medium Severity Findings

<details>
<summary>View 18 medium severity findings</summary>

| Tool | Rule ID | Title | File | Line |
|------|---------|-------|------|------|
| codeql | js/weak-cryptographic-algorithm | Use of a broken or weak cryptographic algorithm | `apps/node-api/src/server.ts` | 125 |
| codeql | js/missing-rate-limiting | Missing rate limiting | `apps/node-api/src/routes/health.ts` | 15 |
| codeql | js/insufficient-password-hash | Password hashing with insufficient computational effort | `apps/node-api/src/server.ts` | 138 |
| codeql | cs/web/missing-function-level-access-control | Missing function level access control | `apps/dotnet-api/Program.cs` | 85 |
| codeql | cs/web/insecure-direct-object-reference | Insecure Direct Object Reference | `apps/dotnet-api/Program.cs` | 92 |
| codeql | cs/xml/insecure-dtd-handling | Insecure DTD handling | `apps/dotnet-api/Program.cs` | 105 |
| codeql | cs/hardcoded-connection-string | Hard-coded connection string | `apps/dotnet-api/Program.cs` | 38 |
| npm-audit | CVE-2024-45678 | cors: CORS misconfiguration | `package.json` | - |
| npm-audit | GHSA-xxxx-yyyy-zzzz | dotenv: Prototype pollution | `package.json` | - |
| npm-audit | CVE-2024-56789 | jsonwebtoken: Timing attack vulnerability | `package.json` | - |
| npm-audit | CVE-2024-67890 | express-rate-limit: Rate limit bypass | `package.json` | - |
| npm-audit | CVE-2024-78901 | @types/node: Information disclosure | `package.json` | - |
| npm-audit | CVE-2024-89012 | typescript: Code injection | `package.json` | - |
| dotnet-vulnerable | CVE-2024-90123 | Microsoft.AspNetCore.OpenApi: XSS vulnerability | `DevSecOps.Template.Api.csproj` | - |
| dotnet-vulnerable | CVE-2024-01234 | Swashbuckle.AspNetCore: Information disclosure | `DevSecOps.Template.Api.csproj` | - |
| dotnet-vulnerable | GHSA-abcd-efgh-ijkl | Serilog.AspNetCore: Log injection | `DevSecOps.Template.Api.csproj` | - |
| checkov | CKV_AWS_18 | S3 Bucket does not have logging enabled | `infra/terraform/main.tf` | 135 |
| checkov | CKV_AWS_19 | Ensure all data stored in S3 is encrypted | `infra/terraform/main.tf` | 135 |

</details>

## 🔵 Low Severity Findings

<details>
<summary>View 18 low severity findings</summary>

| Tool | Rule ID | Title | File | Line |
|------|---------|-------|------|------|
| codeql | js/unused-local-variable | Unused local variable | `apps/node-api/src/server.ts` | 25 |
| codeql | js/useless-assignment-to-local | Useless assignment to local variable | `apps/node-api/src/routes/health.ts` | 32 |
| codeql | js/duplicate-switch-case | Duplicate switch case | `apps/node-api/src/server.ts` | 175 |
| npm-audit | CVE-2024-11111 | ts-node: Minor security issue | `package.json` | - |
| npm-audit | CVE-2024-22222 | @types/express: Type confusion | `package.json` | - |
| npm-audit | CVE-2024-33333 | @types/cors: Minor type issue | `package.json` | - |
| dotnet-vulnerable | CVE-2024-44444 | Serilog.Sinks.Console: Minor logging issue | `DevSecOps.Template.Api.csproj` | - |
| dotnet-vulnerable | CVE-2024-55555 | Microsoft.AspNetCore.Authentication.JwtBearer: Minor issue | `DevSecOps.Template.Api.csproj` | - |
| checkov | CKV_AWS_20 | S3 Bucket versioning is disabled | `infra/terraform/main.tf` | 135 |
| checkov | CKV_AWS_21 | S3 Bucket has an ACL defined | `infra/terraform/main.tf` | 135 |
| checkov | CKV_AWS_24 | Security group includes egress to 0.0.0.0/0 | `infra/terraform/main.tf` | 68 |
| checkov | CKV_AWS_111 | IAM policy allows full administrative access | `infra/terraform/main.tf` | 189 |
| checkov | CKV_AWS_145 | VPC flow logging is not enabled | `infra/terraform/main.tf` | 28 |
| trivy | CVE-2024-66666 | Alpine base image: Minor vulnerability | `apps/node-api/Dockerfile` | - |
| trivy | CVE-2024-77777 | Node.js: Minor version issue | `apps/node-api/Dockerfile` | - |
| trivy | CVE-2024-88888 | .NET runtime: Minor security patch available | `apps/dotnet-api/Dockerfile` | - |
| trivy | CVE-2024-99999 | Alpine: Low severity CVE | `apps/node-api/Dockerfile` | - |
| trivy | GHSA-wxyz-1234-5678 | Container: Low severity finding | `apps/dotnet-api/Dockerfile` | - |

</details>

## 💡 Recommendations

- **CRITICAL:** Address all critical findings immediately before deployment
- **HIGH:** Create remediation tickets for all high severity findings
- **MEDIUM:** Prioritize medium findings in next sprint

---
*Generated by DevSecOps Security Gates*
*For more details, check the SARIF reports in GitHub Security tab*
