/*
  Warnings:

  - You are about to drop the column `active` on the `Offer` table. All the data in the column will be lost.
  - You are about to drop the column `endAt` on the `Offer` table. All the data in the column will be lost.
  - You are about to drop the column `startAt` on the `Offer` table. All the data in the column will be lost.
  - You are about to drop the column `available` on the `Product` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[slug]` on the table `Product` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `endDate` to the `Offer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `startDate` to the `Offer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `slug` to the `Product` table without a default value. This is not possible if the table is not empty.
  - Added the required column `unit` to the `Product` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "backschmiede_koelker"."Role" AS ENUM ('ADMIN');

-- AlterTable
ALTER TABLE "backschmiede_koelker"."Offer" DROP COLUMN "active",
DROP COLUMN "endAt",
DROP COLUMN "startAt",
ADD COLUMN     "endDate" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "imageUrl" TEXT,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "priceCents" INTEGER,
ADD COLUMN     "startDate" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "tags" TEXT[],
ADD COLUMN     "unit" TEXT;

-- AlterTable
ALTER TABLE "backschmiede_koelker"."Product" DROP COLUMN "available",
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "slug" TEXT NOT NULL,
ADD COLUMN     "tags" TEXT[],
ADD COLUMN     "unit" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "backschmiede_koelker"."User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "backschmiede_koelker"."Role" NOT NULL DEFAULT 'ADMIN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
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

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "backschmiede_koelker"."User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "ContentBlock_slug_key" ON "backschmiede_koelker"."ContentBlock"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Product_slug_key" ON "backschmiede_koelker"."Product"("slug");
