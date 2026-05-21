-- AlterTable
ALTER TABLE "broll_items" ADD COLUMN "gender" TEXT;
ALTER TABLE "broll_items" ADD COLUMN "skin" TEXT;
ALTER TABLE "broll_items" ADD COLUMN "age" INTEGER;
ALTER TABLE "broll_items" ADD COLUMN "nationality" TEXT;

-- CreateIndex
CREATE INDEX "broll_items_gender_idx" ON "broll_items"("gender");
CREATE INDEX "broll_items_skin_idx" ON "broll_items"("skin");
CREATE INDEX "broll_items_nationality_idx" ON "broll_items"("nationality");
CREATE INDEX "broll_items_age_idx" ON "broll_items"("age");
