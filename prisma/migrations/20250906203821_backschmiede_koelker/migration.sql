-- CreateTable
CREATE TABLE "backschmiede_koelker"."News" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "imageUrl" TEXT,
    "tag" TEXT,
    "ctaLabel" TEXT,
    "ctaHref" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "publishedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "News_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "News_slug_key" ON "backschmiede_koelker"."News"("slug");

-- CreateIndex
CREATE INDEX "News_isActive_publishedAt_idx" ON "backschmiede_koelker"."News"("isActive", "publishedAt");

-- CreateIndex
CREATE INDEX "News_tag_idx" ON "backschmiede_koelker"."News"("tag");

-- CreateIndex
CREATE INDEX "News_title_idx" ON "backschmiede_koelker"."News"("title");
