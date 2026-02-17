-- AtoB: Add chapter_key, target_script, original_zh to translations
-- Migration 003 (original_zh stores English source for EN->AR)

ALTER TABLE translations
  ADD COLUMN IF NOT EXISTS chapter_key TEXT,
  ADD COLUMN IF NOT EXISTS target_script TEXT,
  ADD COLUMN IF NOT EXISTS original_zh TEXT;
