-- Rename column + index, preserving existing data.
DROP INDEX "broll_items_skin_idx";

ALTER TABLE "broll_items" RENAME COLUMN "skin" TO "ethnicity";

CREATE INDEX "broll_items_ethnicity_idx" ON "broll_items"("ethnicity");
