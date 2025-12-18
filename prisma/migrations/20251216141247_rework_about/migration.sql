/*
  Warnings:

  - You are about to drop the `AboutBlock` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "backschmiede_koelker"."AboutSectionType" AS ENUM ('HERO', 'STORY', 'VALUES', 'STATS', 'TIMELINE', 'TEAM', 'GALLERY', 'FAQ', 'CTA', 'CUSTOM_TEXT');

-- DropTable
DROP TABLE "backschmiede_koelker"."AboutBlock";

-- DropEnum
DROP TYPE "backschmiede_koelker"."AboutBlockType";

-- CreateTable
CREATE TABLE "backschmiede_koelker"."AboutSection" (
    "id" TEXT NOT NULL,
    "type" "backschmiede_koelker"."AboutSectionType" NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT,
    "subtitle" TEXT,
    "body" TEXT,
    "imageUrl" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AboutSection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "backschmiede_koelker"."AboutStatItem" (
    "id" TEXT NOT NULL,
    "sectionId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "AboutStatItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "backschmiede_koelker"."AboutValueItem" (
    "id" TEXT NOT NULL,
    "sectionId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "AboutValueItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "backschmiede_koelker"."AboutTimelineItem" (
    "id" TEXT NOT NULL,
    "sectionId" TEXT NOT NULL,
    "year" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "AboutTimelineItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "backschmiede_koelker"."AboutFaqItem" (
    "id" TEXT NOT NULL,
    "sectionId" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "AboutFaqItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "backschmiede_koelker"."AboutGalleryItem" (
    "id" TEXT NOT NULL,
    "sectionId" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "alt" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "AboutGalleryItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AboutSection_slug_key" ON "backschmiede_koelker"."AboutSection"("slug");

-- CreateIndex
CREATE INDEX "AboutSection_isActive_sortOrder_idx" ON "backschmiede_koelker"."AboutSection"("isActive", "sortOrder");

-- CreateIndex
CREATE INDEX "AboutSection_type_idx" ON "backschmiede_koelker"."AboutSection"("type");

-- CreateIndex
CREATE INDEX "AboutStatItem_sectionId_sortOrder_idx" ON "backschmiede_koelker"."AboutStatItem"("sectionId", "sortOrder");

-- CreateIndex
CREATE INDEX "AboutValueItem_sectionId_sortOrder_idx" ON "backschmiede_koelker"."AboutValueItem"("sectionId", "sortOrder");

-- CreateIndex
CREATE INDEX "AboutTimelineItem_sectionId_sortOrder_idx" ON "backschmiede_koelker"."AboutTimelineItem"("sectionId", "sortOrder");

-- CreateIndex
CREATE INDEX "AboutFaqItem_sectionId_sortOrder_idx" ON "backschmiede_koelker"."AboutFaqItem"("sectionId", "sortOrder");

-- CreateIndex
CREATE INDEX "AboutGalleryItem_sectionId_sortOrder_idx" ON "backschmiede_koelker"."AboutGalleryItem"("sectionId", "sortOrder");

-- AddForeignKey
ALTER TABLE "backschmiede_koelker"."AboutStatItem" ADD CONSTRAINT "AboutStatItem_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "backschmiede_koelker"."AboutSection"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "backschmiede_koelker"."AboutValueItem" ADD CONSTRAINT "AboutValueItem_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "backschmiede_koelker"."AboutSection"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "backschmiede_koelker"."AboutTimelineItem" ADD CONSTRAINT "AboutTimelineItem_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "backschmiede_koelker"."AboutSection"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "backschmiede_koelker"."AboutFaqItem" ADD CONSTRAINT "AboutFaqItem_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "backschmiede_koelker"."AboutSection"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "backschmiede_koelker"."AboutGalleryItem" ADD CONSTRAINT "AboutGalleryItem_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "backschmiede_koelker"."AboutSection"("id") ON DELETE CASCADE ON UPDATE CASCADE;
