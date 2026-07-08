-- CreateEnum
CREATE TYPE "CompatibilityBranch" AS ENUM ('harmony', 'tension', 'mirror', 'neutral');

-- CreateTable
CREATE TABLE "CompatibilityCheck" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "partnerName" TEXT NOT NULL,
    "partnerBirthDate" TIMESTAMP(3) NOT NULL,
    "partnerSoulCard" TEXT NOT NULL,
    "partnerClan" TEXT NOT NULL,
    "relationshipBranch" "CompatibilityBranch" NOT NULL,
    "witnessCard" TEXT NOT NULL,
    "resultText" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CompatibilityCheck_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CompatibilityCheck_userId_createdAt_idx" ON "CompatibilityCheck"("userId", "createdAt");

-- AddForeignKey
ALTER TABLE "CompatibilityCheck" ADD CONSTRAINT "CompatibilityCheck_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
