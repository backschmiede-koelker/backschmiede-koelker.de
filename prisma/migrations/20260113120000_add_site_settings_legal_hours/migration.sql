-- CreateEnum
CREATE TYPE "backschmiede_koelker"."LegalDocType" AS ENUM ('IMPRINT', 'PRIVACY');

-- CreateEnum
CREATE TYPE "backschmiede_koelker"."LegalBlockType" AS ENUM ('PARAGRAPH', 'LIST');

-- CreateTable
CREATE TABLE "backschmiede_koelker"."SiteSettings" (
    "id" TEXT NOT NULL DEFAULT 'singleton',
    "heroBadge" TEXT NOT NULL,
    "heroTitleLine1" TEXT NOT NULL,
    "heroTitleLine2" TEXT NOT NULL,
    "heroDescription" TEXT NOT NULL,
    "heroTag1" TEXT NOT NULL,
    "heroTag2" TEXT NOT NULL,
    "heroTag3" TEXT NOT NULL,
    "heroImageMettingen" TEXT NOT NULL,
    "heroImageRecke" TEXT NOT NULL,
    "subtitleNews" TEXT,
    "subtitleOffers" TEXT,
    "subtitleHours" TEXT,
    "footerTitle" TEXT NOT NULL,
    "footerSubtitle" TEXT NOT NULL,
    "footerEmail" TEXT NOT NULL,
    "footerAddressRecke" TEXT NOT NULL,
    "footerAddressMettingen" TEXT NOT NULL,
    "footerPhoneRecke" TEXT NOT NULL,
    "footerPhoneMettingen" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SiteSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "backschmiede_koelker"."OpeningHour" (
    "id" TEXT NOT NULL,
    "location" "backschmiede_koelker"."Location" NOT NULL,
    "weekday" "backschmiede_koelker"."Weekday" NOT NULL,
    "intervals" JSONB NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OpeningHour_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "backschmiede_koelker"."OpeningException" (
    "id" TEXT NOT NULL,
    "location" "backschmiede_koelker"."Location" NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "closed" BOOLEAN NOT NULL DEFAULT false,
    "intervals" JSONB NOT NULL,
    "note" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OpeningException_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "backschmiede_koelker"."LegalSettings" (
    "id" TEXT NOT NULL DEFAULT 'singleton',
    "contactEmail" TEXT NOT NULL,
    "phoneRecke" TEXT NOT NULL,
    "phoneMettingen" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LegalSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "backschmiede_koelker"."LegalDocument" (
    "id" TEXT NOT NULL,
    "type" "backschmiede_koelker"."LegalDocType" NOT NULL,
    "title" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LegalDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "backschmiede_koelker"."LegalSection" (
    "id" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "heading" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LegalSection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "backschmiede_koelker"."LegalBlock" (
    "id" TEXT NOT NULL,
    "sectionId" TEXT NOT NULL,
    "type" "backschmiede_koelker"."LegalBlockType" NOT NULL,
    "sortOrder" INTEGER NOT NULL,
    "text" TEXT,
    "items" JSONB,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LegalBlock_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "OpeningHour_location_weekday_key" ON "backschmiede_koelker"."OpeningHour"("location", "weekday");

-- CreateIndex
CREATE UNIQUE INDEX "OpeningException_location_date_key" ON "backschmiede_koelker"."OpeningException"("location", "date");

-- CreateIndex
CREATE UNIQUE INDEX "LegalDocument_type_key" ON "backschmiede_koelker"."LegalDocument"("type");

-- CreateIndex
CREATE INDEX "LegalSection_documentId_sortOrder_idx" ON "backschmiede_koelker"."LegalSection"("documentId", "sortOrder");

-- CreateIndex
CREATE INDEX "LegalBlock_sectionId_sortOrder_idx" ON "backschmiede_koelker"."LegalBlock"("sectionId", "sortOrder");

-- AddForeignKey
ALTER TABLE "backschmiede_koelker"."LegalSection" ADD CONSTRAINT "LegalSection_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "backschmiede_koelker"."LegalDocument"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "backschmiede_koelker"."LegalBlock" ADD CONSTRAINT "LegalBlock_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "backschmiede_koelker"."LegalSection"("id") ON DELETE CASCADE ON UPDATE CASCADE;
