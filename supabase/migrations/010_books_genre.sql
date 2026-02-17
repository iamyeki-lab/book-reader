-- AtoB: Add genre to books (e.g. XIANXIA, ROMANCE)
-- Migration 010

ALTER TABLE books ADD COLUMN IF NOT EXISTS genre TEXT;
