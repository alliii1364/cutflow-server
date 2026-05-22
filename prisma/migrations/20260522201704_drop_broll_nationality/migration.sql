-- Nationality filter was discarded in the UI. Drop the column and its index
-- from broll_items; existing nationality values (19 rows) are dropped.

DROP INDEX "broll_items_nationality_idx";

ALTER TABLE "broll_items" DROP COLUMN "nationality";
