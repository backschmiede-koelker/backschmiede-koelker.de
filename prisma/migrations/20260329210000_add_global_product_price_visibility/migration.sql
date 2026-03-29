ALTER TABLE "backschmiede_koelker"."SiteSettings"
ADD COLUMN IF NOT EXISTS "productPricesVisible" BOOLEAN NOT NULL DEFAULT true;

ALTER TABLE "backschmiede_koelker"."Product"
DROP COLUMN IF EXISTS "showPrice";
