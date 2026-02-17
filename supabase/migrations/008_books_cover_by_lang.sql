-- AtoB: Books cover by language
-- Migration 008

ALTER TABLE books
  ADD COLUMN IF NOT EXISTS cover_url_en TEXT,
  ADD COLUMN IF NOT EXISTS cover_url_es TEXT,
  ADD COLUMN IF NOT EXISTS cover_url_ar TEXT;
