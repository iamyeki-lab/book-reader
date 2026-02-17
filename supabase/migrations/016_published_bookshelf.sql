-- 书籍发布开关 + 用户书架
-- Migration 016

-- 1. 书籍发布：默认未发布，后台勾选发布后才会在前端展示
ALTER TABLE books ADD COLUMN IF NOT EXISTS published BOOLEAN NOT NULL DEFAULT false;
CREATE INDEX IF NOT EXISTS idx_books_published ON books(published) WHERE published = true;

-- 2. 用户书架：用户收藏的书籍
CREATE TABLE IF NOT EXISTS user_bookshelf (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  book_id UUID NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, book_id)
);
CREATE INDEX IF NOT EXISTS idx_user_bookshelf_user ON user_bookshelf(user_id);
CREATE INDEX IF NOT EXISTS idx_user_bookshelf_book ON user_bookshelf(book_id);

ALTER TABLE user_bookshelf ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user_bookshelf_select_own" ON user_bookshelf FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "user_bookshelf_insert_own" ON user_bookshelf FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "user_bookshelf_delete_own" ON user_bookshelf FOR DELETE USING (auth.uid() = user_id);
