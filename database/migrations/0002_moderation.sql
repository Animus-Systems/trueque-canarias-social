-- 0002_moderation.sql
-- Phase 4: Moderation & Quality Controls
--
-- Adds moderation columns to equivalents, creates equivalent_flags and
-- moderation_log tables, and adds indexes for rate-limit queries.

-- Add moderation columns to equivalents
ALTER TABLE equivalents
  ADD COLUMN moderated_by UUID REFERENCES app_sessions(id) ON DELETE SET NULL,
  ADD COLUMN moderated_at TIMESTAMPTZ,
  ADD COLUMN rejection_reason TEXT,
  ADD COLUMN flagged_count INTEGER NOT NULL DEFAULT 0 CHECK (flagged_count >= 0);

-- Equivalent flags (one per session per equivalent)
CREATE TABLE equivalent_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  equivalent_id UUID NOT NULL REFERENCES equivalents(id) ON DELETE CASCADE,
  session_id UUID NOT NULL REFERENCES app_sessions(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (equivalent_id, session_id)
);

-- Moderation audit log
CREATE TABLE moderation_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  equivalent_id UUID NOT NULL REFERENCES equivalents(id) ON DELETE CASCADE,
  performed_by UUID REFERENCES app_sessions(id) ON DELETE SET NULL,
  action TEXT NOT NULL CHECK (action IN ('approved', 'rejected', 'auto_rejected')),
  previous_status TEXT NOT NULL,
  new_status TEXT NOT NULL,
  reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for moderation queue
CREATE INDEX idx_equivalents_status_created_at ON equivalents (status, created_at DESC);

-- Indexes for flag queries and rate-limit checks
CREATE INDEX idx_equivalent_flags_equivalent_id ON equivalent_flags (equivalent_id);
CREATE INDEX idx_equivalent_flags_session_created ON equivalent_flags (session_id, created_at DESC);

-- Index for vote rate-limit checks
CREATE INDEX idx_feedback_votes_session_created ON feedback_votes (session_id, created_at DESC);

-- Index for moderation log lookups
CREATE INDEX idx_moderation_log_equivalent ON moderation_log (equivalent_id, created_at DESC);

-- Backfill: mark existing approved equivalents as moderated at creation time
UPDATE equivalents SET moderated_at = created_at WHERE status = 'approved';
