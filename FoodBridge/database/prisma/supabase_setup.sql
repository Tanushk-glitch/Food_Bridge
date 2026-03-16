-- Supabase setup SQL (generated)
-- Paste this into Supabase SQL Editor and run.
-- Source: database/prisma/migrations/*/migration.sql

-- NOTE: If any statement fails, stop and share the error message.


-- ============================================================
-- Migration: 20260315124622_init
-- ============================================================

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "location" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Donation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "foodType" TEXT NOT NULL,
    "quantity" TEXT NOT NULL,
    "expiryTime" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'POSTED',
    "donorId" TEXT NOT NULL,
    "ngoId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Donation_donorId_fkey" FOREIGN KEY ("donorId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Donation_ngoId_fkey" FOREIGN KEY ("ngoId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");



-- ============================================================
-- Migration: 20260316125616_add_user_credentials
-- ============================================================

-- AlterTable
ALTER TABLE "User" ADD COLUMN "organizationName" TEXT;
ALTER TABLE "User" ADD COLUMN "passwordHash" TEXT;
ALTER TABLE "User" ADD COLUMN "passwordSalt" TEXT;
ALTER TABLE "User" ADD COLUMN "phone" TEXT;



-- ============================================================
-- Migration: 20260316152000_admin_system
-- ============================================================

-- Extend existing User table to support admin controls & bcrypt passwords.
ALTER TABLE "User" ADD COLUMN "city" TEXT;
ALTER TABLE "User" ADD COLUMN "verified" BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE "User" ADD COLUMN "status" TEXT NOT NULL DEFAULT 'active';
ALTER TABLE "User" ADD COLUMN "password_hash" TEXT;

-- Extend existing Donation table for admin monitoring.
ALTER TABLE "Donation" ADD COLUMN "food_title" TEXT;
ALTER TABLE "Donation" ADD COLUMN "pickup_status" TEXT;
ALTER TABLE "Donation" ADD COLUMN "location_lat" DOUBLE PRECISION;
ALTER TABLE "Donation" ADD COLUMN "location_lng" DOUBLE PRECISION;

-- Reports / incidents.
CREATE TABLE "Report" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "donation_id" TEXT NOT NULL,
  "reported_by" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'open',
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Report_donation_id_fkey" FOREIGN KEY ("donation_id") REFERENCES "Donation" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "Report_reported_by_fkey" FOREIGN KEY ("reported_by") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE INDEX "Report_status_idx" ON "Report"("status");

-- Activity logs.
CREATE TABLE "ActivityLog" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "type" TEXT NOT NULL,
  "message" TEXT NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX "ActivityLog_created_at_idx" ON "ActivityLog"("created_at");

-- Admin notifications.
CREATE TABLE "Notification" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "title" TEXT NOT NULL,
  "message" TEXT NOT NULL,
  "target_role" TEXT NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX "Notification_created_at_idx" ON "Notification"("created_at");



-- ============================================================
-- Migration: 20260316171950_postgres_sync
-- ============================================================

/*
  Warnings:

  - The `status` column on the `Report` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `status` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Changed the type of `target_role` on the `Notification` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `role` on the `User` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'DONOR', 'NGO', 'DELIVERY');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('active', 'suspended');

-- CreateEnum
CREATE TYPE "ReportStatus" AS ENUM ('open', 'reviewing', 'resolved');

-- CreateEnum
CREATE TYPE "NotificationTargetRole" AS ENUM ('DONOR', 'NGO', 'DELIVERY', 'ALL');

-- DropIndex
DROP INDEX "ActivityLog_created_at_idx";

-- DropIndex
DROP INDEX "Notification_created_at_idx";

-- DropIndex
DROP INDEX "Report_status_idx";

-- AlterTable
ALTER TABLE "Notification" DROP COLUMN "target_role",
ADD COLUMN     "target_role" "NotificationTargetRole" NOT NULL;

-- AlterTable
ALTER TABLE "Report" DROP COLUMN "status",
ADD COLUMN     "status" "ReportStatus" NOT NULL DEFAULT 'open';

-- AlterTable
ALTER TABLE "User" DROP COLUMN "role",
ADD COLUMN     "role" "UserRole" NOT NULL,
DROP COLUMN "status",
ADD COLUMN     "status" "UserStatus" NOT NULL DEFAULT 'active';


