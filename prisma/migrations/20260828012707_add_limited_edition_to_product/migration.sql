-- AlterTable
ALTER TABLE "products" ADD COLUMN     "isLimitedEdition" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "products_isLimitedEdition_idx" ON "products"("isLimitedEdition");
