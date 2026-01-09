-- CreateTable
CREATE TABLE "backschmiede_koelker"."Event" (
    "id" TEXT NOT NULL,
    "caption" TEXT NOT NULL,
    "description" TEXT,
    "imageUrl" TEXT,
    "startsAt" TIMESTAMP(3) NOT NULL,
    "endsAt" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Event_isActive_startsAt_idx" ON "backschmiede_koelker"."Event"("isActive", "startsAt");

-- CreateIndex
CREATE INDEX "Event_startsAt_idx" ON "backschmiede_koelker"."Event"("startsAt");

-- CreateIndex
CREATE INDEX "Event_caption_idx" ON "backschmiede_koelker"."Event"("caption");
