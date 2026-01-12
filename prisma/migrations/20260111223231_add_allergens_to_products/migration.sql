-- CreateEnum
CREATE TYPE "backschmiede_koelker"."Allergen" AS ENUM ('GLUTEN', 'CRUSTACEANS', 'EGGS', 'FISH', 'PEANUTS', 'SOY', 'MILK', 'NUTS', 'CELERY', 'MUSTARD', 'SESAME', 'SULPHITES', 'LUPIN', 'MOLLUSCS');

-- AlterTable
ALTER TABLE "backschmiede_koelker"."Product" ADD COLUMN     "allergens" "backschmiede_koelker"."Allergen"[] DEFAULT ARRAY[]::"backschmiede_koelker"."Allergen"[];
