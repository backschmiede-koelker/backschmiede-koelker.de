-- DropIndex
DROP INDEX "backschmiede_koelker"."Job_isActive_datePosted_idx";

-- AlterTable
ALTER TABLE "backschmiede_koelker"."Job" ADD COLUMN     "priority" INTEGER NOT NULL DEFAULT 0;

-- CreateIndex
CREATE INDEX "Job_isActive_priority_title_idx" ON "backschmiede_koelker"."Job"("isActive", "priority", "title");

-- CreateIndex
CREATE INDEX "Job_priority_title_idx" ON "backschmiede_koelker"."Job"("priority", "title");
