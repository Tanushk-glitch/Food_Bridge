-- CreateTable
CREATE TABLE "OtpCode" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "intent" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "profile" JSONB,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OtpCode_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "OtpCode_expires_at_idx" ON "OtpCode"("expires_at");

-- CreateIndex
CREATE UNIQUE INDEX "OtpCode_email_role_intent_key" ON "OtpCode"("email", "role", "intent");
