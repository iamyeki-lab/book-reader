-- AtoB: Books description by language
-- Migration 012

ALTER TABLE books
  ADD COLUMN IF NOT EXISTS description_en TEXT,
  ADD COLUMN IF NOT EXISTS description_es TEXT,
  ADD COLUMN IF NOT EXISTS description_ar TEXT;
