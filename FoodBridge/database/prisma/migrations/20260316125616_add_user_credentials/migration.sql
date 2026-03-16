-- AlterTable
ALTER TABLE "User" ADD COLUMN "organizationName" TEXT;
ALTER TABLE "User" ADD COLUMN "passwordHash" TEXT;
ALTER TABLE "User" ADD COLUMN "passwordSalt" TEXT;
ALTER TABLE "User" ADD COLUMN "phone" TEXT;
