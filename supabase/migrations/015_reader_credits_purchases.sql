-- AtoB: Reader credits (书豆) and chapter purchases
-- Migration 015

-- Reader credits balance
CREATE TABLE IF NOT EXISTS reader_profiles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  credits INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER reader_profiles_updated_at
  BEFORE UPDATE ON reader_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE reader_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "reader_profiles_own" ON reader_profiles
  FOR ALL USING (auth.uid() = user_id);

-- Chapter purchases (user bought chapter with 书豆)
CREATE TABLE IF NOT EXISTS chapter_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  chapter_id UUID NOT NULL REFERENCES chapters(id) ON DELETE CASCADE,
  book_id UUID NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  credits_spent INT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, chapter_id)
);

CREATE INDEX IF NOT EXISTS idx_chapter_purchases_user ON chapter_purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_chapter_purchases_book ON chapter_purchases(book_id);

ALTER TABLE chapter_purchases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "chapter_purchases_own" ON chapter_purchases
  FOR ALL USING (auth.uid() = user_id);
