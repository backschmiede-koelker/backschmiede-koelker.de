/*
  Warnings:

  - You are about to drop the column `description` on the `Offer` table. All the data in the column will be lost.
  - You are about to drop the `OfferProduct` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "backschmiede_koelker"."OfferType" AS ENUM ('GENERIC', 'PRODUCT_NEW', 'PRODUCT_DISCOUNT', 'MULTIBUY_PRICE');

-- DropForeignKey
ALTER TABLE "backschmiede_koelker"."OfferProduct" DROP CONSTRAINT "OfferProduct_offerId_fkey";

-- DropForeignKey
ALTER TABLE "backschmiede_koelker"."OfferProduct" DROP CONSTRAINT "OfferProduct_productId_fkey";

-- DropIndex
DROP INDEX "backschmiede_koelker"."Offer_minBasketCents_idx";

-- AlterTable
ALTER TABLE "backschmiede_koelker"."Offer" DROP COLUMN "description",
ADD COLUMN     "subtitle" TEXT,
ADD COLUMN     "type" "backschmiede_koelker"."OfferType" NOT NULL DEFAULT 'GENERIC';

-- DropTable
DROP TABLE "backschmiede_koelker"."OfferProduct";

-- DropEnum
DROP TYPE "backschmiede_koelker"."OfferProductRole";

-- CreateTable
CREATE TABLE "backschmiede_koelker"."OfferGeneric" (
    "offerId" TEXT NOT NULL,
    "body" TEXT,
    "ctaLabel" TEXT,
    "ctaHref" TEXT,

    CONSTRAINT "OfferGeneric_pkey" PRIMARY KEY ("offerId")
);

-- CreateTable
CREATE TABLE "backschmiede_koelker"."OfferProductNew" (
    "offerId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "highlightLabel" TEXT,

    CONSTRAINT "OfferProductNew_pkey" PRIMARY KEY ("offerId")
);

-- CreateTable
CREATE TABLE "backschmiede_koelker"."OfferProductDiscount" (
    "offerId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "priceCents" INTEGER NOT NULL,
    "originalPriceCents" INTEGER,
    "unit" TEXT,

    CONSTRAINT "OfferProductDiscount_pkey" PRIMARY KEY ("offerId")
);

-- CreateTable
CREATE TABLE "backschmiede_koelker"."OfferMultibuyPrice" (
    "offerId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "packQty" INTEGER NOT NULL,
    "packPriceCents" INTEGER NOT NULL,
    "comparePackQty" INTEGER,
    "comparePriceCents" INTEGER,
    "unit" TEXT,

    CONSTRAINT "OfferMultibuyPrice_pkey" PRIMARY KEY ("offerId")
);

-- AddForeignKey
ALTER TABLE "backschmiede_koelker"."OfferGeneric" ADD CONSTRAINT "OfferGeneric_offerId_fkey" FOREIGN KEY ("offerId") REFERENCES "backschmiede_koelker"."Offer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "backschmiede_koelker"."OfferProductNew" ADD CONSTRAINT "OfferProductNew_productId_fkey" FOREIGN KEY ("productId") REFERENCES "backschmiede_koelker"."Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "backschmiede_koelker"."OfferProductNew" ADD CONSTRAINT "OfferProductNew_offerId_fkey" FOREIGN KEY ("offerId") REFERENCES "backschmiede_koelker"."Offer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "backschmiede_koelker"."OfferProductDiscount" ADD CONSTRAINT "OfferProductDiscount_productId_fkey" FOREIGN KEY ("productId") REFERENCES "backschmiede_koelker"."Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "backschmiede_koelker"."OfferProductDiscount" ADD CONSTRAINT "OfferProductDiscount_offerId_fkey" FOREIGN KEY ("offerId") REFERENCES "backschmiede_koelker"."Offer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "backschmiede_koelker"."OfferMultibuyPrice" ADD CONSTRAINT "OfferMultibuyPrice_productId_fkey" FOREIGN KEY ("productId") REFERENCES "backschmiede_koelker"."Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "backschmiede_koelker"."OfferMultibuyPrice" ADD CONSTRAINT "OfferMultibuyPrice_offerId_fkey" FOREIGN KEY ("offerId") REFERENCES "backschmiede_koelker"."Offer"("id") ON DELETE CASCADE ON UPDATE CASCADE;
