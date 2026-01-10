/*
  Warnings:

  - The values [STORY] on the enum `AboutSectionType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "backschmiede_koelker"."AboutSectionType_new" AS ENUM ('HERO', 'VALUES', 'STATS', 'TIMELINE', 'TEAM', 'GALLERY', 'FAQ', 'CTA', 'CUSTOM_TEXT');
ALTER TABLE "backschmiede_koelker"."AboutSection" ALTER COLUMN "type" TYPE "backschmiede_koelker"."AboutSectionType_new" USING ("type"::text::"backschmiede_koelker"."AboutSectionType_new");
ALTER TYPE "backschmiede_koelker"."AboutSectionType" RENAME TO "AboutSectionType_old";
ALTER TYPE "backschmiede_koelker"."AboutSectionType_new" RENAME TO "AboutSectionType";
DROP TYPE "backschmiede_koelker"."AboutSectionType_old";
COMMIT;
