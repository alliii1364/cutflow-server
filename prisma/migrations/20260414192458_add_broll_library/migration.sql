-- CreateTable
CREATE TABLE "broll_categories" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "broll_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "broll_subcategories" (
    "id" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "broll_subcategories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "broll_items" (
    "id" TEXT NOT NULL,
    "subcategoryId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "s3Key" TEXT NOT NULL,
    "s3Url" TEXT NOT NULL,
    "thumbnailUrl" TEXT,
    "type" TEXT NOT NULL DEFAULT 'video',
    "isPremium" BOOLEAN NOT NULL DEFAULT false,
    "duration" INTEGER,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "broll_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "broll_items_s3Key_key" ON "broll_items"("s3Key");

-- AddForeignKey
ALTER TABLE "broll_subcategories" ADD CONSTRAINT "broll_subcategories_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "broll_categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "broll_items" ADD CONSTRAINT "broll_items_subcategoryId_fkey" FOREIGN KEY ("subcategoryId") REFERENCES "broll_subcategories"("id") ON DELETE CASCADE ON UPDATE CASCADE;
