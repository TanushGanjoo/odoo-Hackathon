-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('user', 'admin');

-- CreateEnum
CREATE TYPE "CollaboratorRole" AS ENUM ('editor', 'viewer');

-- CreateEnum
CREATE TYPE "ExpenseCategory" AS ENUM ('transport', 'stay', 'activities', 'meals', 'other');

-- CreateTable
CREATE TABLE "User" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "clerkUserId" TEXT NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "name" VARCHAR(100),
    "photoUrl" TEXT,
    "languagePref" VARCHAR(10) NOT NULL DEFAULT 'en',
    "role" "UserRole" NOT NULL DEFAULT 'user',
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "City" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "country" VARCHAR(100) NOT NULL,
    "region" VARCHAR(100),
    "costIndex" DECIMAL(5,2),
    "popularity" INTEGER NOT NULL DEFAULT 0,
    "lat" DECIMAL(9,6),
    "lng" DECIMAL(9,6),
    "imageUrl" TEXT,

    CONSTRAINT "City_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Activity" (
    "id" SERIAL NOT NULL,
    "cityId" INTEGER NOT NULL,
    "name" VARCHAR(150) NOT NULL,
    "category" VARCHAR(50),
    "description" TEXT,
    "cost" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "durationHrs" DECIMAL(4,1),
    "imageUrl" TEXT,

    CONSTRAINT "Activity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Trip" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "userId" UUID NOT NULL,
    "name" VARCHAR(150) NOT NULL,
    "description" TEXT,
    "startDate" DATE,
    "endDate" DATE,
    "coverPhoto" TEXT,
    "budgetLimit" DECIMAL(10,2),
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "shareToken" UUID NOT NULL DEFAULT gen_random_uuid(),
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Trip_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TripStop" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tripId" UUID NOT NULL,
    "cityId" INTEGER NOT NULL,
    "orderIndex" INTEGER NOT NULL,
    "startDate" DATE NOT NULL,
    "endDate" DATE NOT NULL,

    CONSTRAINT "TripStop_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "TripStop_date_check" CHECK ("endDate" >= "startDate")
);

-- CreateTable
CREATE TABLE "StopActivity" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "stopId" UUID NOT NULL,
    "activityId" INTEGER NOT NULL,
    "scheduledDate" DATE,
    "scheduledTime" TIME,
    "customCost" DECIMAL(10,2),
    "notes" TEXT,

    CONSTRAINT "StopActivity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TripExpense" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tripId" UUID NOT NULL,
    "category" "ExpenseCategory" NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "paidBy" UUID,
    "note" TEXT,

    CONSTRAINT "TripExpense_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TripCollaborator" (
    "tripId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "role" "CollaboratorRole" NOT NULL DEFAULT 'editor',

    CONSTRAINT "TripCollaborator_pkey" PRIMARY KEY ("tripId","userId")
);

-- CreateTable
CREATE TABLE "TripChecklistItem" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tripId" UUID NOT NULL,
    "item" VARCHAR(150),
    "isChecked" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "TripChecklistItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TripVersion" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tripId" UUID NOT NULL,
    "snapshotJson" JSONB NOT NULL,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TripVersion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_clerkUserId_key" ON "User"("clerkUserId");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "City_name_country_key" ON "City"("name", "country");

-- CreateIndex
CREATE INDEX "Activity_cityId_idx" ON "Activity"("cityId");

-- CreateIndex
CREATE INDEX "Activity_category_idx" ON "Activity"("category");

-- CreateIndex
CREATE UNIQUE INDEX "Trip_shareToken_key" ON "Trip"("shareToken");

-- CreateIndex
CREATE INDEX "Trip_userId_idx" ON "Trip"("userId");

-- CreateIndex
CREATE INDEX "TripStop_tripId_orderIndex_idx" ON "TripStop"("tripId", "orderIndex");

-- CreateIndex
CREATE INDEX "StopActivity_stopId_idx" ON "StopActivity"("stopId");

-- AddForeignKey
ALTER TABLE "Activity" ADD CONSTRAINT "Activity_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "City"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Trip" ADD CONSTRAINT "Trip_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TripStop" ADD CONSTRAINT "TripStop_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "Trip"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TripStop" ADD CONSTRAINT "TripStop_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "City"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StopActivity" ADD CONSTRAINT "StopActivity_stopId_fkey" FOREIGN KEY ("stopId") REFERENCES "TripStop"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StopActivity" ADD CONSTRAINT "StopActivity_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "Activity"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TripExpense" ADD CONSTRAINT "TripExpense_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "Trip"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TripExpense" ADD CONSTRAINT "TripExpense_paidBy_fkey" FOREIGN KEY ("paidBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TripCollaborator" ADD CONSTRAINT "TripCollaborator_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "Trip"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TripCollaborator" ADD CONSTRAINT "TripCollaborator_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TripChecklistItem" ADD CONSTRAINT "TripChecklistItem_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "Trip"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TripVersion" ADD CONSTRAINT "TripVersion_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "Trip"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE INDEX "City_search_idx"
ON "City"
USING GIN (
  to_tsvector('english', "name" || ' ' || "country")
);