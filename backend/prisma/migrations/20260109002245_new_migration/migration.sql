-- CreateEnum
CREATE TYPE "ScheduleType" AS ENUM ('daily', 'weekly', 'monthly', 'manual');

-- CreateTable
CREATE TABLE "scheduled_scans" (
    "id" TEXT NOT NULL,
    "repositoryId" TEXT NOT NULL,
    "scheduleType" "ScheduleType" NOT NULL,
    "scheduleConfig" JSONB NOT NULL,
    "timezone" TEXT NOT NULL DEFAULT 'UTC',
    "isEnabled" BOOLEAN NOT NULL DEFAULT true,
    "nextRunAt" TIMESTAMP(3),
    "lastRunAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "scheduled_scans_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "scheduled_scans_repositoryId_idx" ON "scheduled_scans"("repositoryId");

-- CreateIndex
CREATE INDEX "scheduled_scans_isEnabled_idx" ON "scheduled_scans"("isEnabled");

-- CreateIndex
CREATE INDEX "scheduled_scans_nextRunAt_idx" ON "scheduled_scans"("nextRunAt");

-- AddForeignKey
ALTER TABLE "scheduled_scans" ADD CONSTRAINT "scheduled_scans_repositoryId_fkey" FOREIGN KEY ("repositoryId") REFERENCES "repositories"("id") ON DELETE CASCADE ON UPDATE CASCADE;
