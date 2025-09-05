/*
  Warnings:

  - You are about to drop the column `productId` on the `Offer` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "backschmiede_koelker"."OfferProductRole" AS ENUM ('QUALIFIER', 'REWARD_FREE', 'REWARD_DISCOUNTED', 'BUNDLE_COMPONENT', 'CHOICE_QUALIFIER', 'CHOICE_REWARD');

-- DropForeignKey
ALTER TABLE "backschmiede_koelker"."Offer" DROP CONSTRAINT "Offer_productId_fkey";

-- AlterTable
ALTER TABLE "backschmiede_koelker"."Offer" DROP COLUMN "productId",
ADD COLUMN     "originalPriceCents" INTEGER;

-- CreateTable
CREATE TABLE "backschmiede_koelker"."OfferProduct" (
    "offerId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "role" "backschmiede_koelker"."OfferProductRole" NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "perItemPriceCents" INTEGER,

    CONSTRAINT "OfferProduct_pkey" PRIMARY KEY ("offerId","productId","role")
);

-- AddForeignKey
ALTER TABLE "backschmiede_koelker"."OfferProduct" ADD CONSTRAINT "OfferProduct_offerId_fkey" FOREIGN KEY ("offerId") REFERENCES "backschmiede_koelker"."Offer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "backschmiede_koelker"."OfferProduct" ADD CONSTRAINT "OfferProduct_productId_fkey" FOREIGN KEY ("productId") REFERENCES "backschmiede_koelker"."Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
