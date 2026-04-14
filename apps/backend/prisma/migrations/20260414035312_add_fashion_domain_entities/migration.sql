/*
  Warnings:

  - You are about to drop the column `clarityId` on the `products` table. All the data in the column will be lost.
  - You are about to drop the column `gender` on the `products` table. All the data in the column will be lost.
  - You are about to drop the column `materialId` on the `products` table. All the data in the column will be lost.
  - You are about to drop the column `stoneId` on the `products` table. All the data in the column will be lost.
  - You are about to drop the `clarities` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `materials` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `stones` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `baseCategory` to the `products` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "BaseCategory" AS ENUM ('ABAYA', 'MODEST_DRESS');

-- CreateEnum
CREATE TYPE "FitAdjustment" AS ENUM ('LOOSE', 'RELAXED', 'STRUCTURED');

-- CreateEnum
CREATE TYPE "Fabric" AS ENUM ('CHIFFON', 'CREPE', 'SATIN', 'LACE', 'JERSEY', 'NIDHA', 'LINEN', 'VELVET', 'ORGANZA', 'GEORGETTE');

-- CreateEnum
CREATE TYPE "Embellishment" AS ENUM ('EMBROIDERY', 'BEADS', 'LACE_OVERLAY', 'CRYSTAL', 'SEQUINS', 'NONE');

-- CreateEnum
CREATE TYPE "SleeveStyle" AS ENUM ('CAPE', 'KIMONO', 'FLARED', 'FITTED', 'BELL', 'BATWING');

-- CreateEnum
CREATE TYPE "Neckline" AS ENUM ('ROUND', 'V_NECK', 'BOAT', 'STAND_COLLAR', 'HOODED', 'OPEN_FRONT');

-- CreateEnum
CREATE TYPE "FitType" AS ENUM ('FLOWY', 'RELAXED', 'STRUCTURED', 'A_LINE');

-- CreateEnum
CREATE TYPE "GarmentLength" AS ENUM ('FULL_LENGTH', 'MIDI', 'KNEE_LENGTH');

-- CreateEnum
CREATE TYPE "TransparencyLayer" AS ENUM ('INNER', 'OUTER', 'CLOSED');

-- DropForeignKey
ALTER TABLE "products" DROP CONSTRAINT "products_clarityId_fkey";

-- DropForeignKey
ALTER TABLE "products" DROP CONSTRAINT "products_materialId_fkey";

-- DropForeignKey
ALTER TABLE "products" DROP CONSTRAINT "products_stoneId_fkey";

-- DropIndex
DROP INDEX "products_clarityId_idx";

-- DropIndex
DROP INDEX "products_gender_idx";

-- DropIndex
DROP INDEX "products_materialId_idx";

-- DropIndex
DROP INDEX "products_stoneId_idx";

-- AlterTable
ALTER TABLE "product_variants" ADD COLUMN     "fitAdjustment" "FitAdjustment";

-- AlterTable
ALTER TABLE "products" DROP COLUMN "clarityId",
DROP COLUMN "gender",
DROP COLUMN "materialId",
DROP COLUMN "stoneId",
ADD COLUMN     "baseCategory" "BaseCategory" NOT NULL;

-- DropTable
DROP TABLE "clarities";

-- DropTable
DROP TABLE "materials";

-- DropTable
DROP TABLE "stones";

-- DropEnum
DROP TYPE "Gender";

-- CreateTable
CREATE TABLE "fashion_attributes" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "fabric" "Fabric" NOT NULL,
    "embellishment" "Embellishment" NOT NULL DEFAULT 'NONE',
    "sleeveStyle" "SleeveStyle" NOT NULL,
    "fitType" "FitType" NOT NULL,
    "transparencyLayer" "TransparencyLayer" NOT NULL,
    "neckline" "Neckline",
    "length" "GarmentLength",
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "fashion_attributes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "occasions" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "nameEn" TEXT NOT NULL,
    "nameAr" TEXT NOT NULL,
    "descriptionEn" TEXT,
    "descriptionAr" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "position" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "occasions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_occasions" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "occasionId" TEXT NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "product_occasions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "fashion_attributes_productId_key" ON "fashion_attributes"("productId");

-- CreateIndex
CREATE INDEX "fashion_attributes_fabric_idx" ON "fashion_attributes"("fabric");

-- CreateIndex
CREATE INDEX "fashion_attributes_sleeveStyle_idx" ON "fashion_attributes"("sleeveStyle");

-- CreateIndex
CREATE INDEX "fashion_attributes_fitType_idx" ON "fashion_attributes"("fitType");

-- CreateIndex
CREATE INDEX "fashion_attributes_transparencyLayer_idx" ON "fashion_attributes"("transparencyLayer");

-- CreateIndex
CREATE UNIQUE INDEX "occasions_slug_key" ON "occasions"("slug");

-- CreateIndex
CREATE INDEX "occasions_slug_idx" ON "occasions"("slug");

-- CreateIndex
CREATE INDEX "occasions_isActive_idx" ON "occasions"("isActive");

-- CreateIndex
CREATE INDEX "occasions_position_idx" ON "occasions"("position");

-- CreateIndex
CREATE INDEX "product_occasions_productId_idx" ON "product_occasions"("productId");

-- CreateIndex
CREATE INDEX "product_occasions_occasionId_idx" ON "product_occasions"("occasionId");

-- CreateIndex
CREATE INDEX "product_occasions_position_idx" ON "product_occasions"("position");

-- CreateIndex
CREATE UNIQUE INDEX "product_occasions_productId_occasionId_key" ON "product_occasions"("productId", "occasionId");

-- CreateIndex
CREATE INDEX "products_baseCategory_idx" ON "products"("baseCategory");

-- AddForeignKey
ALTER TABLE "fashion_attributes" ADD CONSTRAINT "fashion_attributes_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_occasions" ADD CONSTRAINT "product_occasions_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_occasions" ADD CONSTRAINT "product_occasions_occasionId_fkey" FOREIGN KEY ("occasionId") REFERENCES "occasions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
