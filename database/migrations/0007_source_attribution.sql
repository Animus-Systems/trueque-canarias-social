-- 0007_source_attribution.sql
-- Add source attribution to equivalents.

ALTER TABLE equivalents
  ADD COLUMN source_type VARCHAR NOT NULL DEFAULT 'community'
    CHECK (source_type IN ('official', 'community', 'ai_suggested')),
  ADD COLUMN source_attribution TEXT;

CREATE INDEX idx_equivalents_source_type ON equivalents (source_type);

-- Backfill: seed data (no session) is official, user submissions are community
UPDATE equivalents SET source_type = 'official', source_attribution = 'Initial seed data'
  WHERE created_by_session IS NULL AND status = 'approved';
