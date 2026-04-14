-- CreateEnum
CREATE TYPE "FormType" AS ENUM ('CONTACT', 'NEWSLETTER', 'CUSTOM_ORDER');

-- CreateEnum
CREATE TYPE "FormStatus" AS ENUM ('PENDING', 'REVIEWED', 'RESOLVED', 'SPAM');

-- CreateEnum
CREATE TYPE "CustomFieldType" AS ENUM ('TEXT', 'TEXTAREA', 'NUMBER', 'FILE');

-- CreateTable
CREATE TABLE "product_options" (
    "id" TEXT NOT NULL,
    "nameEn" TEXT NOT NULL,
    "nameAr" TEXT NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,
    "productId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "product_options_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_option_values" (
    "id" TEXT NOT NULL,
    "valueEn" TEXT NOT NULL,
    "valueAr" TEXT NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,
    "optionId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "product_option_values_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pages" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "titleEn" TEXT NOT NULL,
    "titleAr" TEXT NOT NULL,
    "contentEn" TEXT NOT NULL,
    "contentAr" TEXT NOT NULL,
    "metaTitleEn" TEXT,
    "metaTitleAr" TEXT,
    "metaDescriptionEn" TEXT,
    "metaDescriptionAr" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "position" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "policies" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "titleEn" TEXT NOT NULL,
    "titleAr" TEXT NOT NULL,
    "contentEn" TEXT NOT NULL,
    "contentAr" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "policies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "form_submissions" (
    "id" TEXT NOT NULL,
    "type" "FormType" NOT NULL DEFAULT 'CONTACT',
    "status" "FormStatus" NOT NULL DEFAULT 'PENDING',
    "payload" JSONB NOT NULL,
    "userId" TEXT,
    "adminNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "form_submissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_custom_fields" (
    "id" TEXT NOT NULL,
    "type" "CustomFieldType" NOT NULL DEFAULT 'TEXT',
    "labelEn" TEXT NOT NULL,
    "labelAr" TEXT NOT NULL,
    "placeholderEn" TEXT,
    "placeholderAr" TEXT,
    "isRequired" BOOLEAN NOT NULL DEFAULT false,
    "productId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "product_custom_fields_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_ProductOptionValueToProductVariant" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ProductOptionValueToProductVariant_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "product_options_productId_idx" ON "product_options"("productId");

-- CreateIndex
CREATE UNIQUE INDEX "product_options_productId_nameEn_key" ON "product_options"("productId", "nameEn");

-- CreateIndex
CREATE INDEX "product_option_values_optionId_idx" ON "product_option_values"("optionId");

-- CreateIndex
CREATE UNIQUE INDEX "product_option_values_optionId_valueEn_key" ON "product_option_values"("optionId", "valueEn");

-- CreateIndex
CREATE UNIQUE INDEX "pages_slug_key" ON "pages"("slug");

-- CreateIndex
CREATE INDEX "pages_slug_idx" ON "pages"("slug");

-- CreateIndex
CREATE INDEX "pages_isActive_idx" ON "pages"("isActive");

-- CreateIndex
CREATE INDEX "pages_position_idx" ON "pages"("position");

-- CreateIndex
CREATE UNIQUE INDEX "policies_slug_key" ON "policies"("slug");

-- CreateIndex
CREATE INDEX "policies_slug_idx" ON "policies"("slug");

-- CreateIndex
CREATE INDEX "form_submissions_type_idx" ON "form_submissions"("type");

-- CreateIndex
CREATE INDEX "form_submissions_status_idx" ON "form_submissions"("status");

-- CreateIndex
CREATE INDEX "form_submissions_userId_idx" ON "form_submissions"("userId");

-- CreateIndex
CREATE INDEX "product_custom_fields_productId_idx" ON "product_custom_fields"("productId");

-- CreateIndex
CREATE INDEX "_ProductOptionValueToProductVariant_B_index" ON "_ProductOptionValueToProductVariant"("B");

-- AddForeignKey
ALTER TABLE "product_options" ADD CONSTRAINT "product_options_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_option_values" ADD CONSTRAINT "product_option_values_optionId_fkey" FOREIGN KEY ("optionId") REFERENCES "product_options"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "form_submissions" ADD CONSTRAINT "form_submissions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_custom_fields" ADD CONSTRAINT "product_custom_fields_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProductOptionValueToProductVariant" ADD CONSTRAINT "_ProductOptionValueToProductVariant_A_fkey" FOREIGN KEY ("A") REFERENCES "product_option_values"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProductOptionValueToProductVariant" ADD CONSTRAINT "_ProductOptionValueToProductVariant_B_fkey" FOREIGN KEY ("B") REFERENCES "product_variants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
