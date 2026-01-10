/*
  Warnings:

  - You are about to drop the column `contactEmail` on the `Job` table. All the data in the column will be lost.
  - You are about to drop the column `employmentType` on the `Job` table. All the data in the column will be lost.
  - You are about to drop the column `role` on the `Job` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "backschmiede_koelker"."JobCategory" AS ENUM ('BAECKER', 'VERKAEUFER', 'AZUBI', 'AUSHILFE', 'LOGISTIK', 'PRODUKTION', 'VERWALTUNG', 'SONSTIGES');

-- AlterTable
ALTER TABLE "backschmiede_koelker"."Job" DROP COLUMN "contactEmail",
DROP COLUMN "employmentType",
DROP COLUMN "role",
ADD COLUMN     "applyEmail" TEXT,
ADD COLUMN     "category" "backschmiede_koelker"."JobCategory" NOT NULL DEFAULT 'SONSTIGES',
ADD COLUMN     "employmentTypes" "backschmiede_koelker"."JobEmploymentType"[];

-- CreateIndex
CREATE INDEX "Job_category_idx" ON "backschmiede_koelker"."Job"("category");
