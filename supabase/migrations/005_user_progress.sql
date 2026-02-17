-- AtoB: user_progress (optional)
-- Migration 005

CREATE TABLE IF NOT EXISTS user_progress (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  book_id UUID NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  chapter_index INT NOT NULL DEFAULT 0,
  scroll_top INT NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, book_id)
);

ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_progress_own" ON user_progress
  FOR ALL USING (auth.uid() = user_id);
