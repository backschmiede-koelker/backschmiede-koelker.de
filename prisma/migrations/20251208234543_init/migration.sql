-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "backschmiede_koelker";

-- CreateEnum
CREATE TYPE "backschmiede_koelker"."Role" AS ENUM ('ADMIN');

-- CreateEnum
CREATE TYPE "backschmiede_koelker"."OfferKind" AS ENUM ('RECURRING_WEEKDAY', 'ONE_DAY', 'DATE_RANGE');

-- CreateEnum
CREATE TYPE "backschmiede_koelker"."Weekday" AS ENUM ('MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY');

-- CreateEnum
CREATE TYPE "backschmiede_koelker"."Location" AS ENUM ('RECKE', 'METTINGEN');

-- CreateEnum
CREATE TYPE "backschmiede_koelker"."OfferType" AS ENUM ('GENERIC', 'PRODUCT_NEW', 'PRODUCT_DISCOUNT', 'MULTIBUY_PRICE');

-- CreateEnum
CREATE TYPE "backschmiede_koelker"."JobEmploymentType" AS ENUM ('FULL_TIME', 'PART_TIME', 'MINI_JOB', 'APPRENTICESHIP');

-- CreateEnum
CREATE TYPE "backschmiede_koelker"."JobSalaryUnit" AS ENUM ('HOUR', 'MONTH', 'YEAR');

-- CreateTable
CREATE TABLE "backschmiede_koelker"."User" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "backschmiede_koelker"."Role" NOT NULL DEFAULT 'ADMIN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "backschmiede_koelker"."Product" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "priceCents" INTEGER NOT NULL,
    "unit" TEXT NOT NULL,
    "imageUrl" TEXT,
    "tags" TEXT[],
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "backschmiede_koelker"."Offer" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "type" "backschmiede_koelker"."OfferType" NOT NULL DEFAULT 'GENERIC',
    "title" TEXT NOT NULL,
    "subtitle" TEXT,
    "imageUrl" TEXT,
    "tags" TEXT[],
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "priceCents" INTEGER,
    "originalPriceCents" INTEGER,
    "unit" TEXT,
    "kind" "backschmiede_koelker"."OfferKind" NOT NULL,
    "weekday" "backschmiede_koelker"."Weekday",
    "date" TIMESTAMP(3),
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "locations" "backschmiede_koelker"."Location"[],
    "priority" INTEGER NOT NULL DEFAULT 0,
    "minBasketCents" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Offer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "backschmiede_koelker"."OfferGeneric" (
    "offerId" TEXT NOT NULL,
    "body" TEXT,
    "ctaLabel" TEXT,
    "ctaHref" TEXT,

    CONSTRAINT "OfferGeneric_pkey" PRIMARY KEY ("offerId")
);

-- CreateTable
CREATE TABLE "backschmiede_koelker"."OfferProductNew" (
    "offerId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "highlightLabel" TEXT,

    CONSTRAINT "OfferProductNew_pkey" PRIMARY KEY ("offerId")
);

-- CreateTable
CREATE TABLE "backschmiede_koelker"."OfferProductDiscount" (
    "offerId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "priceCents" INTEGER NOT NULL,
    "originalPriceCents" INTEGER,
    "unit" TEXT,

    CONSTRAINT "OfferProductDiscount_pkey" PRIMARY KEY ("offerId")
);

-- CreateTable
CREATE TABLE "backschmiede_koelker"."OfferMultibuyPrice" (
    "offerId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "packQty" INTEGER NOT NULL,
    "packPriceCents" INTEGER NOT NULL,
    "comparePackQty" INTEGER,
    "comparePriceCents" INTEGER,
    "unit" TEXT,

    CONSTRAINT "OfferMultibuyPrice_pkey" PRIMARY KEY ("offerId")
);

-- CreateTable
CREATE TABLE "backschmiede_koelker"."ContentBlock" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ContentBlock_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "backschmiede_koelker"."Pageview" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "path" TEXT NOT NULL,
    "referrerHost" TEXT,
    "utmSource" TEXT,
    "utmMedium" TEXT,
    "utmCampaign" TEXT,
    "lang" TEXT,
    "device" TEXT,
    "browser" TEXT,
    "country" TEXT,
    "sessionId" TEXT,
    "ipHash" TEXT,
    "isBot" BOOLEAN NOT NULL DEFAULT false,
    "isAdmin" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Pageview_pkey" PRIMARY KEY ("id")
);

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

-- CreateTable
CREATE TABLE "backschmiede_koelker"."Job" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "role" TEXT,
    "teaser" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "responsibilities" TEXT[],
    "qualifications" TEXT[],
    "benefits" TEXT[],
    "employmentType" "backschmiede_koelker"."JobEmploymentType" NOT NULL,
    "workloadNote" TEXT,
    "locations" "backschmiede_koelker"."Location"[],
    "shift" TEXT,
    "salaryMinCents" INTEGER,
    "salaryMaxCents" INTEGER,
    "salaryUnit" "backschmiede_koelker"."JobSalaryUnit",
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "startsAt" TIMESTAMP(3),
    "startsAsap" BOOLEAN NOT NULL DEFAULT true,
    "datePosted" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "validThrough" TIMESTAMP(3),
    "contactEmail" TEXT,
    "contactPhone" TEXT,
    "applyUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Job_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "backschmiede_koelker"."User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "Product_slug_key" ON "backschmiede_koelker"."Product"("slug");

-- CreateIndex
CREATE INDEX "Product_isActive_createdAt_idx" ON "backschmiede_koelker"."Product"("isActive", "createdAt");

-- CreateIndex
CREATE INDEX "Product_name_idx" ON "backschmiede_koelker"."Product"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Offer_slug_key" ON "backschmiede_koelker"."Offer"("slug");

-- CreateIndex
CREATE INDEX "Offer_isActive_kind_idx" ON "backschmiede_koelker"."Offer"("isActive", "kind");

-- CreateIndex
CREATE INDEX "Offer_date_idx" ON "backschmiede_koelker"."Offer"("date");

-- CreateIndex
CREATE INDEX "Offer_weekday_idx" ON "backschmiede_koelker"."Offer"("weekday");

-- CreateIndex
CREATE INDEX "Offer_startDate_endDate_idx" ON "backschmiede_koelker"."Offer"("startDate", "endDate");

-- CreateIndex
CREATE INDEX "Offer_priority_createdAt_idx" ON "backschmiede_koelker"."Offer"("priority", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "ContentBlock_slug_key" ON "backschmiede_koelker"."ContentBlock"("slug");

-- CreateIndex
CREATE INDEX "Pageview_createdAt_idx" ON "backschmiede_koelker"."Pageview"("createdAt");

-- CreateIndex
CREATE INDEX "Pageview_path_createdAt_idx" ON "backschmiede_koelker"."Pageview"("path", "createdAt");

-- CreateIndex
CREATE INDEX "Pageview_referrerHost_idx" ON "backschmiede_koelker"."Pageview"("referrerHost");

-- CreateIndex
CREATE INDEX "Pageview_utmSource_utmMedium_utmCampaign_idx" ON "backschmiede_koelker"."Pageview"("utmSource", "utmMedium", "utmCampaign");

-- CreateIndex
CREATE INDEX "Pageview_device_idx" ON "backschmiede_koelker"."Pageview"("device");

-- CreateIndex
CREATE INDEX "Pageview_browser_idx" ON "backschmiede_koelker"."Pageview"("browser");

-- CreateIndex
CREATE INDEX "Pageview_lang_idx" ON "backschmiede_koelker"."Pageview"("lang");

-- CreateIndex
CREATE UNIQUE INDEX "News_slug_key" ON "backschmiede_koelker"."News"("slug");

-- CreateIndex
CREATE INDEX "News_isActive_publishedAt_idx" ON "backschmiede_koelker"."News"("isActive", "publishedAt");

-- CreateIndex
CREATE INDEX "News_tag_idx" ON "backschmiede_koelker"."News"("tag");

-- CreateIndex
CREATE INDEX "News_title_idx" ON "backschmiede_koelker"."News"("title");

-- CreateIndex
CREATE UNIQUE INDEX "Job_slug_key" ON "backschmiede_koelker"."Job"("slug");

-- CreateIndex
CREATE INDEX "Job_isActive_datePosted_idx" ON "backschmiede_koelker"."Job"("isActive", "datePosted");

-- CreateIndex
CREATE INDEX "Job_slug_idx" ON "backschmiede_koelker"."Job"("slug");

-- CreateIndex
CREATE INDEX "Job_title_idx" ON "backschmiede_koelker"."Job"("title");

-- AddForeignKey
ALTER TABLE "backschmiede_koelker"."OfferGeneric" ADD CONSTRAINT "OfferGeneric_offerId_fkey" FOREIGN KEY ("offerId") REFERENCES "backschmiede_koelker"."Offer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "backschmiede_koelker"."OfferProductNew" ADD CONSTRAINT "OfferProductNew_productId_fkey" FOREIGN KEY ("productId") REFERENCES "backschmiede_koelker"."Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "backschmiede_koelker"."OfferProductNew" ADD CONSTRAINT "OfferProductNew_offerId_fkey" FOREIGN KEY ("offerId") REFERENCES "backschmiede_koelker"."Offer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "backschmiede_koelker"."OfferProductDiscount" ADD CONSTRAINT "OfferProductDiscount_productId_fkey" FOREIGN KEY ("productId") REFERENCES "backschmiede_koelker"."Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "backschmiede_koelker"."OfferProductDiscount" ADD CONSTRAINT "OfferProductDiscount_offerId_fkey" FOREIGN KEY ("offerId") REFERENCES "backschmiede_koelker"."Offer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "backschmiede_koelker"."OfferMultibuyPrice" ADD CONSTRAINT "OfferMultibuyPrice_productId_fkey" FOREIGN KEY ("productId") REFERENCES "backschmiede_koelker"."Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "backschmiede_koelker"."OfferMultibuyPrice" ADD CONSTRAINT "OfferMultibuyPrice_offerId_fkey" FOREIGN KEY ("offerId") REFERENCES "backschmiede_koelker"."Offer"("id") ON DELETE CASCADE ON UPDATE CASCADE;
