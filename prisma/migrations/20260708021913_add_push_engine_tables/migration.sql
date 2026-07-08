-- CreateEnum
CREATE TYPE "PushTriggerType" AS ENUM ('memory_pending', 'prophecy_pending', 'reengage_d3', 'reengage_d7', 'reengage_d14', 'reengage_d30', 'habit_time');

-- CreateEnum
CREATE TYPE "PushStatus" AS ENUM ('pending', 'sent', 'skipped_dedup', 'skipped_optout');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "pushToken" TEXT;

-- CreateTable
CREATE TABLE "PushTrigger" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "triggerType" "PushTriggerType" NOT NULL,
    "relatedEntityId" TEXT,
    "scheduledAt" TIMESTAMP(3) NOT NULL,
    "sentAt" TIMESTAMP(3),
    "status" "PushStatus" NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PushTrigger_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PushLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "triggerType" "PushTriggerType" NOT NULL,
    "messageText" TEXT NOT NULL,
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "openedAt" TIMESTAMP(3),

    CONSTRAINT "PushLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PushTrigger_userId_status_scheduledAt_idx" ON "PushTrigger"("userId", "status", "scheduledAt");

-- CreateIndex
CREATE INDEX "PushLog_userId_sentAt_idx" ON "PushLog"("userId", "sentAt");

-- AddForeignKey
ALTER TABLE "PushTrigger" ADD CONSTRAINT "PushTrigger_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PushLog" ADD CONSTRAINT "PushLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
