-- AtoB: Add book_id and translated_es/ar/en (required for translator)
-- Migration 006

ALTER TABLE translations
  ADD COLUMN IF NOT EXISTS book_id UUID REFERENCES books(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS translated_es TEXT,
  ADD COLUMN IF NOT EXISTS translated_ar TEXT,
  ADD COLUMN IF NOT EXISTS translated_en TEXT;

CREATE INDEX IF NOT EXISTS idx_translations_book_id ON translations(book_id);
