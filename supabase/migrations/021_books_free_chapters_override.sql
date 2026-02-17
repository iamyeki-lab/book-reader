-- AtoB: 按书覆盖免费章数（可选，NULL 表示使用全局 site_settings）
-- Migration 021（须在 022 purchase_chapter RPC 之前执行）

ALTER TABLE books ADD COLUMN IF NOT EXISTS free_chapters_override INT NULL;
COMMENT ON COLUMN books.free_chapters_override IS 'Override free chapters for this book; NULL = use site_settings free_chapters_count';
