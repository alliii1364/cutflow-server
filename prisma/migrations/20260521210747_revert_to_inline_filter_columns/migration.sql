-- Revert normalization: restore inline columns on broll_items and drop the
-- 4 lookup tables. Current values are copied from each lookup table back into
-- the corresponding scalar column before the FK columns and tables are dropped.

-- 1. Re-add inline columns
ALTER TABLE "broll_items" ADD COLUMN "gender"      TEXT;
ALTER TABLE "broll_items" ADD COLUMN "ethnicity"   TEXT;
ALTER TABLE "broll_items" ADD COLUMN "age"         INTEGER;
ALTER TABLE "broll_items" ADD COLUMN "nationality" TEXT;

-- 2. Copy values back from lookup tables
UPDATE "broll_items" b SET "gender"      = g."value" FROM "genders"       g WHERE g."id" = b."genderId";
UPDATE "broll_items" b SET "ethnicity"   = e."value" FROM "ethnicities"   e WHERE e."id" = b."ethnicityId";
UPDATE "broll_items" b SET "age"         = a."value" FROM "ages"          a WHERE a."id" = b."ageId";
UPDATE "broll_items" b SET "nationality" = n."value" FROM "nationalities" n WHERE n."id" = b."nationalityId";

-- 3. Drop FK constraints, indexes, columns
ALTER TABLE "broll_items"
  DROP CONSTRAINT "broll_items_genderId_fkey",
  DROP CONSTRAINT "broll_items_ethnicityId_fkey",
  DROP CONSTRAINT "broll_items_ageId_fkey",
  DROP CONSTRAINT "broll_items_nationalityId_fkey";

DROP INDEX "broll_items_genderId_idx";
DROP INDEX "broll_items_ethnicityId_idx";
DROP INDEX "broll_items_ageId_idx";
DROP INDEX "broll_items_nationalityId_idx";

ALTER TABLE "broll_items" DROP COLUMN "genderId";
ALTER TABLE "broll_items" DROP COLUMN "ethnicityId";
ALTER TABLE "broll_items" DROP COLUMN "ageId";
ALTER TABLE "broll_items" DROP COLUMN "nationalityId";

-- 4. Drop lookup tables
DROP TABLE "genders";
DROP TABLE "ethnicities";
DROP TABLE "ages";
DROP TABLE "nationalities";

-- 5. Recreate indexes on inline columns
CREATE INDEX "broll_items_gender_idx"      ON "broll_items"("gender");
CREATE INDEX "broll_items_ethnicity_idx"   ON "broll_items"("ethnicity");
CREATE INDEX "broll_items_age_idx"         ON "broll_items"("age");
CREATE INDEX "broll_items_nationality_idx" ON "broll_items"("nationality");
