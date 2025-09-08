-- AlterTable
ALTER TABLE "backschmiede_koelker"."Offer" ADD COLUMN     "minBasketCents" INTEGER;

-- CreateIndex
CREATE INDEX "Offer_minBasketCents_idx" ON "backschmiede_koelker"."Offer"("minBasketCents");
