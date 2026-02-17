-- AtoB: Glossaries per book (JSON: names, terms, titles, systems, consistency_notes)
-- Migration 013

CREATE TABLE IF NOT EXISTS glossaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  book_id UUID NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  content JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(book_id)
);

CREATE INDEX IF NOT EXISTS idx_glossaries_book_id ON glossaries(book_id);

CREATE TRIGGER glossaries_updated_at
  BEFORE UPDATE ON glossaries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE glossaries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "glossaries_select_policy" ON glossaries FOR SELECT USING (true);
CREATE POLICY "glossaries_insert_policy" ON glossaries FOR INSERT WITH CHECK (true);
CREATE POLICY "glossaries_update_policy" ON glossaries FOR UPDATE USING (true);
CREATE POLICY "glossaries_delete_policy" ON glossaries FOR DELETE USING (true);
