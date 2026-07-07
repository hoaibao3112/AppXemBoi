-- AlterTable
ALTER TABLE "User" ADD COLUMN     "birthDate" TIMESTAMP(3),
ADD COLUMN     "soulCard" TEXT;

-- CreateTable
CREATE TABLE "Whisper" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "clan" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Whisper_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Whisper_userId_idx" ON "Whisper"("userId");

-- CreateIndex
CREATE INDEX "ERCLog_userId_idx" ON "ERCLog"("userId");

-- CreateIndex
CREATE INDEX "Reading_userId_createdAt_idx" ON "Reading"("userId", "createdAt");

-- AddForeignKey
ALTER TABLE "Whisper" ADD CONSTRAINT "Whisper_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
