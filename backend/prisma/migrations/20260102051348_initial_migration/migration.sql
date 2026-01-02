-- CreateTable
CREATE TABLE "repositories" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "provider" TEXT NOT NULL DEFAULT 'github',
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "repositories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "scans" (
    "id" TEXT NOT NULL,
    "repositoryId" TEXT NOT NULL,
    "branch" TEXT NOT NULL,
    "commitSha" TEXT NOT NULL,
    "commitMessage" TEXT,
    "triggeredBy" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'running',
    "gateStatus" TEXT,
    "totalFindings" INTEGER NOT NULL DEFAULT 0,
    "criticalCount" INTEGER NOT NULL DEFAULT 0,
    "highCount" INTEGER NOT NULL DEFAULT 0,
    "mediumCount" INTEGER NOT NULL DEFAULT 0,
    "lowCount" INTEGER NOT NULL DEFAULT 0,
    "infoCount" INTEGER NOT NULL DEFAULT 0,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "scans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "findings" (
    "id" TEXT NOT NULL,
    "scanId" TEXT NOT NULL,
    "tool" TEXT NOT NULL,
    "category" TEXT,
    "severity" TEXT NOT NULL,
    "ruleId" TEXT,
    "title" TEXT NOT NULL,
    "filePath" TEXT,
    "lineNumber" INTEGER,
    "cwe" TEXT,
    "cvssScore" DECIMAL(3,1),
    "message" TEXT,
    "fingerprint" TEXT,
    "status" TEXT NOT NULL DEFAULT 'open',
    "assignedTo" TEXT,
    "resolvedAt" TIMESTAMP(3),
    "resolvedBy" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "findings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "scan_trends" (
    "id" TEXT NOT NULL,
    "repositoryId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "totalFindings" INTEGER NOT NULL DEFAULT 0,
    "criticalCount" INTEGER NOT NULL DEFAULT 0,
    "highCount" INTEGER NOT NULL DEFAULT 0,
    "mediumCount" INTEGER NOT NULL DEFAULT 0,
    "lowCount" INTEGER NOT NULL DEFAULT 0,
    "infoCount" INTEGER NOT NULL DEFAULT 0,
    "scansCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "scan_trends_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "compliance_mappings" (
    "id" TEXT NOT NULL,
    "findingId" TEXT NOT NULL,
    "framework" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "compliance_mappings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sbom_records" (
    "id" TEXT NOT NULL,
    "scanId" TEXT NOT NULL,
    "format" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sbom_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "remediation_tickets" (
    "id" TEXT NOT NULL,
    "scanId" TEXT NOT NULL,
    "findingId" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'open',
    "priority" TEXT NOT NULL DEFAULT 'medium',
    "assignedTo" TEXT,
    "dueDate" TIMESTAMP(3),
    "resolvedAt" TIMESTAMP(3),
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "remediation_tickets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aws_security_findings" (
    "id" TEXT NOT NULL,
    "awsFindingId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "severity" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'NEW',
    "resourceType" TEXT,
    "resourceId" TEXT,
    "complianceStatus" TEXT,
    "workflowStatus" TEXT,
    "recordState" TEXT,
    "awsAccountId" TEXT,
    "region" TEXT,
    "rawData" JSONB NOT NULL,
    "syncedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "aws_security_findings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'viewer',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "api_keys" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "repositoryId" TEXT,
    "userId" TEXT,
    "lastUsedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "api_keys_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "repositories_isActive_idx" ON "repositories"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "repositories_name_provider_key" ON "repositories"("name", "provider");

-- CreateIndex
CREATE INDEX "scans_repositoryId_idx" ON "scans"("repositoryId");

-- CreateIndex
CREATE INDEX "scans_createdAt_idx" ON "scans"("createdAt");

-- CreateIndex
CREATE INDEX "scans_branch_idx" ON "scans"("branch");

-- CreateIndex
CREATE INDEX "scans_status_idx" ON "scans"("status");

-- CreateIndex
CREATE INDEX "findings_scanId_idx" ON "findings"("scanId");

-- CreateIndex
CREATE INDEX "findings_severity_idx" ON "findings"("severity");

-- CreateIndex
CREATE INDEX "findings_tool_idx" ON "findings"("tool");

-- CreateIndex
CREATE INDEX "findings_status_idx" ON "findings"("status");

-- CreateIndex
CREATE INDEX "findings_fingerprint_idx" ON "findings"("fingerprint");

-- CreateIndex
CREATE INDEX "findings_assignedTo_idx" ON "findings"("assignedTo");

-- CreateIndex
CREATE INDEX "scan_trends_repositoryId_date_idx" ON "scan_trends"("repositoryId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "scan_trends_repositoryId_date_key" ON "scan_trends"("repositoryId", "date");

-- CreateIndex
CREATE INDEX "compliance_mappings_findingId_idx" ON "compliance_mappings"("findingId");

-- CreateIndex
CREATE INDEX "compliance_mappings_framework_idx" ON "compliance_mappings"("framework");

-- CreateIndex
CREATE INDEX "sbom_records_scanId_idx" ON "sbom_records"("scanId");

-- CreateIndex
CREATE INDEX "remediation_tickets_scanId_idx" ON "remediation_tickets"("scanId");

-- CreateIndex
CREATE INDEX "remediation_tickets_status_idx" ON "remediation_tickets"("status");

-- CreateIndex
CREATE INDEX "remediation_tickets_assignedTo_idx" ON "remediation_tickets"("assignedTo");

-- CreateIndex
CREATE UNIQUE INDEX "aws_security_findings_awsFindingId_key" ON "aws_security_findings"("awsFindingId");

-- CreateIndex
CREATE INDEX "aws_security_findings_severity_idx" ON "aws_security_findings"("severity");

-- CreateIndex
CREATE INDEX "aws_security_findings_status_idx" ON "aws_security_findings"("status");

-- CreateIndex
CREATE INDEX "aws_security_findings_awsAccountId_idx" ON "aws_security_findings"("awsAccountId");

-- CreateIndex
CREATE INDEX "aws_security_findings_syncedAt_idx" ON "aws_security_findings"("syncedAt");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_role_idx" ON "users"("role");

-- CreateIndex
CREATE UNIQUE INDEX "api_keys_key_key" ON "api_keys"("key");

-- CreateIndex
CREATE INDEX "api_keys_key_idx" ON "api_keys"("key");

-- CreateIndex
CREATE INDEX "api_keys_isActive_idx" ON "api_keys"("isActive");

-- AddForeignKey
ALTER TABLE "scans" ADD CONSTRAINT "scans_repositoryId_fkey" FOREIGN KEY ("repositoryId") REFERENCES "repositories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "findings" ADD CONSTRAINT "findings_scanId_fkey" FOREIGN KEY ("scanId") REFERENCES "scans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scan_trends" ADD CONSTRAINT "scan_trends_repositoryId_fkey" FOREIGN KEY ("repositoryId") REFERENCES "repositories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "compliance_mappings" ADD CONSTRAINT "compliance_mappings_findingId_fkey" FOREIGN KEY ("findingId") REFERENCES "findings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sbom_records" ADD CONSTRAINT "sbom_records_scanId_fkey" FOREIGN KEY ("scanId") REFERENCES "scans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "remediation_tickets" ADD CONSTRAINT "remediation_tickets_scanId_fkey" FOREIGN KEY ("scanId") REFERENCES "scans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "remediation_tickets" ADD CONSTRAINT "remediation_tickets_findingId_fkey" FOREIGN KEY ("findingId") REFERENCES "findings"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "api_keys" ADD CONSTRAINT "api_keys_repositoryId_fkey" FOREIGN KEY ("repositoryId") REFERENCES "repositories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "api_keys" ADD CONSTRAINT "api_keys_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
