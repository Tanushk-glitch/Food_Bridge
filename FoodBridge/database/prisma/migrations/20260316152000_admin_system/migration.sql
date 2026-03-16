-- Extend existing User table to support admin controls & bcrypt passwords.
ALTER TABLE "User" ADD COLUMN "city" TEXT;
ALTER TABLE "User" ADD COLUMN "verified" BOOLEAN NOT NULL DEFAULT 0;
ALTER TABLE "User" ADD COLUMN "status" TEXT NOT NULL DEFAULT 'active';
ALTER TABLE "User" ADD COLUMN "password_hash" TEXT;

-- Extend existing Donation table for admin monitoring.
ALTER TABLE "Donation" ADD COLUMN "food_title" TEXT;
ALTER TABLE "Donation" ADD COLUMN "pickup_status" TEXT;
ALTER TABLE "Donation" ADD COLUMN "location_lat" REAL;
ALTER TABLE "Donation" ADD COLUMN "location_lng" REAL;

-- Reports / incidents.
CREATE TABLE "Report" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "donation_id" TEXT NOT NULL,
  "reported_by" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'open',
  "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Report_donation_id_fkey" FOREIGN KEY ("donation_id") REFERENCES "Donation" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "Report_reported_by_fkey" FOREIGN KEY ("reported_by") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE INDEX "Report_status_idx" ON "Report"("status");

-- Activity logs.
CREATE TABLE "ActivityLog" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "type" TEXT NOT NULL,
  "message" TEXT NOT NULL,
  "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX "ActivityLog_created_at_idx" ON "ActivityLog"("created_at");

-- Admin notifications.
CREATE TABLE "Notification" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "title" TEXT NOT NULL,
  "message" TEXT NOT NULL,
  "target_role" TEXT NOT NULL,
  "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX "Notification_created_at_idx" ON "Notification"("created_at");
