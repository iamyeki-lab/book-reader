-- AtoB: Static glossary items per book (term -> ar, type) for extract_glossary.py
-- Migration 023

CREATE TABLE IF NOT EXISTS glossary_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  book_id UUID NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  term TEXT NOT NULL,
  ar TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'Term',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(book_id, term)
);

CREATE INDEX IF NOT EXISTS idx_glossary_items_book_id ON glossary_items(book_id);
CREATE INDEX IF NOT EXISTS idx_glossary_items_type ON glossary_items(book_id, type);

CREATE TRIGGER glossary_items_updated_at
  BEFORE UPDATE ON glossary_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE glossary_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "glossary_items_select" ON glossary_items FOR SELECT USING (true);
CREATE POLICY "glossary_items_insert" ON glossary_items FOR INSERT WITH CHECK (true);
CREATE POLICY "glossary_items_update" ON glossary_items FOR UPDATE USING (true);
CREATE POLICY "glossary_items_delete" ON glossary_items FOR DELETE USING (true);

COMMENT ON TABLE glossary_items IS 'Static extraction: English term -> Arabic (transliteration for names), type=Name|Sect|Rank|Artifact';
