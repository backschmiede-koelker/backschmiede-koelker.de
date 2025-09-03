/*
  Warnings:

  - A unique constraint covering the columns `[slug]` on the table `Offer` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `kind` to the `Offer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `slug` to the `Offer` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "backschmiede_koelker"."OfferKind" AS ENUM ('RECURRING_WEEKDAY', 'ONE_DAY', 'DATE_RANGE');

-- CreateEnum
CREATE TYPE "backschmiede_koelker"."Weekday" AS ENUM ('MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY');

-- CreateEnum
CREATE TYPE "backschmiede_koelker"."Location" AS ENUM ('RECKE', 'METTINGEN');

-- AlterTable
ALTER TABLE "backschmiede_koelker"."Offer" ADD COLUMN     "date" TIMESTAMP(3),
ADD COLUMN     "kind" "backschmiede_koelker"."OfferKind" NOT NULL,
ADD COLUMN     "locations" "backschmiede_koelker"."Location"[],
ADD COLUMN     "priority" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "productId" TEXT,
ADD COLUMN     "slug" TEXT NOT NULL,
ADD COLUMN     "weekday" "backschmiede_koelker"."Weekday",
ALTER COLUMN "endDate" DROP NOT NULL,
ALTER COLUMN "startDate" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Offer_slug_key" ON "backschmiede_koelker"."Offer"("slug");

-- CreateIndex
CREATE INDEX "Offer_isActive_kind_idx" ON "backschmiede_koelker"."Offer"("isActive", "kind");

-- CreateIndex
CREATE INDEX "Offer_date_idx" ON "backschmiede_koelker"."Offer"("date");

-- CreateIndex
CREATE INDEX "Offer_weekday_idx" ON "backschmiede_koelker"."Offer"("weekday");

-- CreateIndex
CREATE INDEX "Offer_startDate_endDate_idx" ON "backschmiede_koelker"."Offer"("startDate", "endDate");

-- CreateIndex
CREATE INDEX "Offer_priority_createdAt_idx" ON "backschmiede_koelker"."Offer"("priority", "createdAt");

-- CreateIndex
CREATE INDEX "Product_isActive_createdAt_idx" ON "backschmiede_koelker"."Product"("isActive", "createdAt");

-- CreateIndex
CREATE INDEX "Product_name_idx" ON "backschmiede_koelker"."Product"("name");

-- AddForeignKey
ALTER TABLE "backschmiede_koelker"."Offer" ADD CONSTRAINT "Offer_productId_fkey" FOREIGN KEY ("productId") REFERENCES "backschmiede_koelker"."Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;
