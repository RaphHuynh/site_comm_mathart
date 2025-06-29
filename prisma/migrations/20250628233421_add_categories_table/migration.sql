/*
  Warnings:

  - You are about to drop the column `category` on the `articles` table. All the data in the column will be lost.
  - Added the required column `category_id` to the `articles` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "categories" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "color" TEXT,
    "icon" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- Insert default categories
INSERT INTO "categories" ("name", "description", "color", "icon", "is_active", "created_at", "updated_at") VALUES
('mathematics', 'Articles sur les mathématiques', '#3B82F6', 'Calculator', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('art', 'Articles sur l''art et la créativité', '#8B5CF6', 'Palette', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('technology', 'Articles sur la technologie', '#10B981', 'Cpu', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('education', 'Articles sur l''éducation', '#F59E0B', 'GraduationCap', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('other', 'Autres sujets', '#6B7280', 'FileText', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_articles" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "excerpt" TEXT,
    "author_id" TEXT NOT NULL,
    "category_id" INTEGER NOT NULL,
    "tags" TEXT,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "articles_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "articles_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- Migrate existing articles with category mapping
INSERT INTO "new_articles" ("id", "title", "content", "excerpt", "author_id", "category_id", "tags", "published", "created_at", "updated_at")
SELECT 
    a."id",
    a."title",
    a."content",
    a."excerpt",
    a."author_id",
    CASE 
        WHEN a."category" = 'mathematics' THEN 1
        WHEN a."category" = 'art' THEN 2
        WHEN a."category" = 'technology' THEN 3
        WHEN a."category" = 'education' THEN 4
        ELSE 5
    END as "category_id",
    a."tags",
    a."published",
    a."created_at",
    a."updated_at"
FROM "articles" a;

DROP TABLE "articles";
ALTER TABLE "new_articles" RENAME TO "articles";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "categories_name_key" ON "categories"("name");
