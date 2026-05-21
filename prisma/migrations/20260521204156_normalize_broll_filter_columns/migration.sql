-- Normalize gender/ethnicity/age/nationality on broll_items into lookup tables.
-- Existing string/int values are deduplicated into the new tables, then FKs are
-- backfilled before the old columns are dropped. No data is lost.

-- 1. Lookup tables
CREATE TABLE "genders" (
    "id"    TEXT NOT NULL,
    "value" TEXT NOT NULL,
    CONSTRAINT "genders_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "genders_value_key" ON "genders"("value");

CREATE TABLE "ethnicities" (
    "id"    TEXT NOT NULL,
    "value" TEXT NOT NULL,
    CONSTRAINT "ethnicities_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "ethnicities_value_key" ON "ethnicities"("value");

CREATE TABLE "ages" (
    "id"    TEXT NOT NULL,
    "value" INTEGER NOT NULL,
    CONSTRAINT "ages_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "ages_value_key" ON "ages"("value");

CREATE TABLE "nationalities" (
    "id"    TEXT NOT NULL,
    "value" TEXT NOT NULL,
    CONSTRAINT "nationalities_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "nationalities_value_key" ON "nationalities"("value");

-- 2. Seed lookup tables from distinct existing values
INSERT INTO "genders" ("id", "value")
  SELECT gen_random_uuid()::text, v FROM (
    SELECT DISTINCT "gender" AS v FROM "broll_items" WHERE "gender" IS NOT NULL
  ) sub;

INSERT INTO "ethnicities" ("id", "value")
  SELECT gen_random_uuid()::text, v FROM (
    SELECT DISTINCT "ethnicity" AS v FROM "broll_items" WHERE "ethnicity" IS NOT NULL
  ) sub;

INSERT INTO "ages" ("id", "value")
  SELECT gen_random_uuid()::text, v FROM (
    SELECT DISTINCT "age" AS v FROM "broll_items" WHERE "age" IS NOT NULL
  ) sub;

INSERT INTO "nationalities" ("id", "value")
  SELECT gen_random_uuid()::text, v FROM (
    SELECT DISTINCT "nationality" AS v FROM "broll_items" WHERE "nationality" IS NOT NULL
  ) sub;

-- 3. Add FK columns
ALTER TABLE "broll_items" ADD COLUMN "genderId"      TEXT;
ALTER TABLE "broll_items" ADD COLUMN "ethnicityId"   TEXT;
ALTER TABLE "broll_items" ADD COLUMN "ageId"         TEXT;
ALTER TABLE "broll_items" ADD COLUMN "nationalityId" TEXT;

-- 4. Backfill FKs from existing column values
UPDATE "broll_items" b SET "genderId"      = g."id" FROM "genders"       g WHERE g."value" = b."gender";
UPDATE "broll_items" b SET "ethnicityId"   = e."id" FROM "ethnicities"   e WHERE e."value" = b."ethnicity";
UPDATE "broll_items" b SET "ageId"         = a."id" FROM "ages"          a WHERE a."value" = b."age";
UPDATE "broll_items" b SET "nationalityId" = n."id" FROM "nationalities" n WHERE n."value" = b."nationality";

-- 5. Drop old indexes and columns
DROP INDEX "broll_items_gender_idx";
DROP INDEX "broll_items_ethnicity_idx";
DROP INDEX "broll_items_age_idx";
DROP INDEX "broll_items_nationality_idx";

ALTER TABLE "broll_items" DROP COLUMN "gender";
ALTER TABLE "broll_items" DROP COLUMN "ethnicity";
ALTER TABLE "broll_items" DROP COLUMN "age";
ALTER TABLE "broll_items" DROP COLUMN "nationality";

-- 6. Indexes on FK columns
CREATE INDEX "broll_items_genderId_idx"      ON "broll_items"("genderId");
CREATE INDEX "broll_items_ethnicityId_idx"   ON "broll_items"("ethnicityId");
CREATE INDEX "broll_items_ageId_idx"         ON "broll_items"("ageId");
CREATE INDEX "broll_items_nationalityId_idx" ON "broll_items"("nationalityId");

-- 7. Foreign key constraints
ALTER TABLE "broll_items"
  ADD CONSTRAINT "broll_items_genderId_fkey"      FOREIGN KEY ("genderId")      REFERENCES "genders"("id")       ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT "broll_items_ethnicityId_fkey"   FOREIGN KEY ("ethnicityId")   REFERENCES "ethnicities"("id")   ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT "broll_items_ageId_fkey"         FOREIGN KEY ("ageId")         REFERENCES "ages"("id")          ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT "broll_items_nationalityId_fkey" FOREIGN KEY ("nationalityId") REFERENCES "nationalities"("id") ON DELETE SET NULL ON UPDATE CASCADE;
