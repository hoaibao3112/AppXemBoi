-- DropIndex
DROP INDEX "Reading_userId_createdAt_idx";

-- AlterTable
ALTER TABLE "Reading" ADD COLUMN     "questionTopicTag" TEXT,
ADD COLUMN     "snoozeCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "snoozeUntil" TIMESTAMP(3),
ADD COLUMN     "verified" BOOLEAN,
ADD COLUMN     "verifiedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "accuracyPercent" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "activePactCardId" TEXT,
ADD COLUMN     "activePactExpiresAt" TIMESTAMP(3),
ADD COLUMN     "activePactTarget" TEXT,
ADD COLUMN     "badgeTier" TEXT NOT NULL DEFAULT 'fog',
ADD COLUMN     "totalCorrect" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "totalVerified" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "unlockedShards" INTEGER[] DEFAULT ARRAY[]::INTEGER[];

-- CreateIndex
CREATE INDEX "Reading_userId_verified_createdAt_idx" ON "Reading"("userId", "verified", "createdAt");
