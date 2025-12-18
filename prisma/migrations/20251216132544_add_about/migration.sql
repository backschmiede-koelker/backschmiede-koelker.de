-- CreateEnum
CREATE TYPE "backschmiede_koelker"."AboutBlockType" AS ENUM ('HERO', 'STORY', 'VALUES', 'STATS', 'TIMELINE', 'TEAM', 'GALLERY', 'CTA', 'FAQ', 'CUSTOM_TEXT');

-- CreateEnum
CREATE TYPE "backschmiede_koelker"."AboutPersonKind" AS ENUM ('OWNER', 'MANAGER', 'TEAM_MEMBER');

-- CreateTable
CREATE TABLE "backschmiede_koelker"."AboutPerson" (
    "id" TEXT NOT NULL,
    "kind" "backschmiede_koelker"."AboutPersonKind" NOT NULL DEFAULT 'TEAM_MEMBER',
    "name" TEXT NOT NULL,
    "roleLabel" TEXT,
    "shortBio" TEXT,
    "longBio" TEXT,
    "avatarUrl" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "instagramHandle" TEXT,
    "isShownOnAbout" BOOLEAN NOT NULL DEFAULT true,
    "isShownInHero" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AboutPerson_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "backschmiede_koelker"."AboutBlock" (
    "id" TEXT NOT NULL,
    "type" "backschmiede_koelker"."AboutBlockType" NOT NULL DEFAULT 'STORY',
    "slug" TEXT NOT NULL,
    "title" TEXT,
    "subtitle" TEXT,
    "body" TEXT,
    "imageUrl" TEXT,
    "items" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AboutBlock_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AboutPerson_isShownOnAbout_sortOrder_idx" ON "backschmiede_koelker"."AboutPerson"("isShownOnAbout", "sortOrder");

-- CreateIndex
CREATE INDEX "AboutPerson_isShownInHero_idx" ON "backschmiede_koelker"."AboutPerson"("isShownInHero");

-- CreateIndex
CREATE UNIQUE INDEX "AboutBlock_slug_key" ON "backschmiede_koelker"."AboutBlock"("slug");

-- CreateIndex
CREATE INDEX "AboutBlock_isActive_sortOrder_idx" ON "backschmiede_koelker"."AboutBlock"("isActive", "sortOrder");
