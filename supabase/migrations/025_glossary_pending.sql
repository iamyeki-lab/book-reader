-- AtoB: 表二 - 按章节进度收集的新术语（每 N 章或每章扫描写入），后台可编辑后合并到表一（glossaries）
-- Migration 025

CREATE TABLE IF NOT EXISTS glossary_pending (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  book_id UUID NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  content JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(book_id)
);

CREATE INDEX IF NOT EXISTS idx_glossary_pending_book_id ON glossary_pending(book_id);

CREATE TRIGGER glossary_pending_updated_at
  BEFORE UPDATE ON glossary_pending
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE glossary_pending ENABLE ROW LEVEL SECURITY;

CREATE POLICY "glossary_pending_select" ON glossary_pending FOR SELECT USING (true);
CREATE POLICY "glossary_pending_insert" ON glossary_pending FOR INSERT WITH CHECK (true);
CREATE POLICY "glossary_pending_update" ON glossary_pending FOR UPDATE USING (true);
CREATE POLICY "glossary_pending_delete" ON glossary_pending FOR DELETE USING (true);

COMMENT ON TABLE glossary_pending IS '表二：新术语暂存，与 glossaries（表一）同结构 content；后台可编辑后合并到表一';
