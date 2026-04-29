-- AlterTable
ALTER TABLE "ai_scripts" ADD COLUMN     "language" TEXT NOT NULL DEFAULT 'en',
ADD COLUMN     "sourceUrl" TEXT,
ADD COLUMN     "suggestedBrolls" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "title" TEXT;
