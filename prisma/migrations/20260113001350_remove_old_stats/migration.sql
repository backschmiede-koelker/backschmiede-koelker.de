/*
  Warnings:

  - You are about to drop the `ContentBlock` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Pageview` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "backschmiede_koelker"."ContentBlock";

-- DropTable
DROP TABLE "backschmiede_koelker"."Pageview";

-- CreateTable
CREATE TABLE "backschmiede_koelker"."TgtgCta" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL DEFAULT 'default',
    "title" TEXT NOT NULL,
    "subtitle" TEXT,
    "description" TEXT,
    "reckeSubtitle" TEXT,
    "mettingenSubtitle" TEXT,
    "tgtgAppLinkRecke" TEXT NOT NULL,
    "tgtgAppLinkMettingen" TEXT NOT NULL,
    "reckeHinweis" TEXT,
    "mettingenHinweis" TEXT,
    "allgemeinerHinweis" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TgtgCta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "backschmiede_koelker"."TgtgCtaStep" (
    "id" TEXT NOT NULL,
    "ctaId" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "TgtgCtaStep_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "backschmiede_koelker"."TgtgCtaFaqItem" (
    "id" TEXT NOT NULL,
    "ctaId" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,

    CONSTRAINT "TgtgCtaFaqItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TgtgCta_slug_key" ON "backschmiede_koelker"."TgtgCta"("slug");

-- CreateIndex
CREATE INDEX "TgtgCtaStep_ctaId_sortOrder_idx" ON "backschmiede_koelker"."TgtgCtaStep"("ctaId", "sortOrder");

-- CreateIndex
CREATE INDEX "TgtgCtaFaqItem_ctaId_sortOrder_idx" ON "backschmiede_koelker"."TgtgCtaFaqItem"("ctaId", "sortOrder");

-- AddForeignKey
ALTER TABLE "backschmiede_koelker"."TgtgCtaStep" ADD CONSTRAINT "TgtgCtaStep_ctaId_fkey" FOREIGN KEY ("ctaId") REFERENCES "backschmiede_koelker"."TgtgCta"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "backschmiede_koelker"."TgtgCtaFaqItem" ADD CONSTRAINT "TgtgCtaFaqItem_ctaId_fkey" FOREIGN KEY ("ctaId") REFERENCES "backschmiede_koelker"."TgtgCta"("id") ON DELETE CASCADE ON UPDATE CASCADE;
