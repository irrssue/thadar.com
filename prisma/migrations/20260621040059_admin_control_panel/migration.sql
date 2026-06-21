-- CreateEnum
CREATE TYPE "PlatformRole" AS ENUM ('USER', 'ADMIN', 'SUPER_ADMIN');

-- CreateEnum
CREATE TYPE "AccountStatus" AS ENUM ('ACTIVE', 'PENDING', 'SUSPENDED');

-- AlterTable
ALTER TABLE "Class" ADD COLUMN     "archivedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Message" ADD COLUMN     "flagReason" TEXT,
ADD COLUMN     "flagged" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "resolvedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "lastSeenAt" TIMESTAMP(3),
ADD COLUMN     "platformRole" "PlatformRole" NOT NULL DEFAULT 'USER',
ADD COLUMN     "status" "AccountStatus" NOT NULL DEFAULT 'ACTIVE';

-- CreateTable
CREATE TABLE "PlatformSetting" (
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedBy" TEXT,

    CONSTRAINT "PlatformSetting_pkey" PRIMARY KEY ("key")
);

-- CreateIndex
CREATE INDEX "Class_archivedAt_idx" ON "Class"("archivedAt");

-- CreateIndex
CREATE INDEX "Message_flagged_resolvedAt_idx" ON "Message"("flagged", "resolvedAt");

-- CreateIndex
CREATE INDEX "User_platformRole_idx" ON "User"("platformRole");

-- CreateIndex
CREATE INDEX "User_status_idx" ON "User"("status");
