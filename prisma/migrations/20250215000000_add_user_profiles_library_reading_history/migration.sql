-- Prisma Migration: User Profiles, Library, Reading History
-- 仅新增表，不修改已存在的 books/chapters/translations

-- CreateTable: user_profiles (id 对应 auth.users(id))
CREATE TABLE "user_profiles" (
    "id" UUID NOT NULL,
    "nickname" TEXT DEFAULT '',
    "avatar_url" TEXT,
    "bio" TEXT DEFAULT '',
    "cultivation_rank" TEXT NOT NULL DEFAULT 'Mortal',
    "experience_points" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable: library (User <-> Book 多对多)
CREATE TABLE "library" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "book_id" UUID NOT NULL,
    "added_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "library_pkey" PRIMARY KEY ("id")
);

-- CreateTable: reading_history (User + Book 唯一)
CREATE TABLE "reading_history" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "book_id" UUID NOT NULL,
    "last_chapter_id" UUID,
    "progress_percentage" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "last_read_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reading_history_pkey" PRIMARY KEY ("id")
);

-- Unique constraints
CREATE UNIQUE INDEX "library_user_id_book_id_key" ON "library"("user_id", "book_id");
CREATE UNIQUE INDEX "reading_history_user_id_book_id_key" ON "reading_history"("user_id", "book_id");

-- Indexes
CREATE INDEX "library_user_id_idx" ON "library"("user_id");
CREATE INDEX "library_book_id_idx" ON "library"("book_id");
CREATE INDEX "reading_history_user_id_idx" ON "reading_history"("user_id");
CREATE INDEX "reading_history_book_id_idx" ON "reading_history"("book_id");

-- Foreign Keys (library)
ALTER TABLE "library" ADD CONSTRAINT "library_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "library" ADD CONSTRAINT "library_book_id_fkey" FOREIGN KEY ("book_id") REFERENCES "books"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Foreign Keys (reading_history)
ALTER TABLE "reading_history" ADD CONSTRAINT "reading_history_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "reading_history" ADD CONSTRAINT "reading_history_book_id_fkey" FOREIGN KEY ("book_id") REFERENCES "books"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "reading_history" ADD CONSTRAINT "reading_history_last_chapter_id_fkey" FOREIGN KEY ("last_chapter_id") REFERENCES "chapters"("id") ON DELETE SET NULL ON UPDATE CASCADE;
