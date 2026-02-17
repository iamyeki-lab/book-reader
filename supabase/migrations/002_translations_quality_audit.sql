-- AtoB: Add quality_score and audit_report_zh to translations
-- Migration 002

ALTER TABLE translations
  ADD COLUMN IF NOT EXISTS quality_score INT,
  ADD COLUMN IF NOT EXISTS audit_report_zh TEXT;
