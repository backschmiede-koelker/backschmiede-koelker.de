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
