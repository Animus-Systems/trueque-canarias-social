CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TABLE IF NOT EXISTS app_sessions (
  id UUID PRIMARY KEY,
  reputation INTEGER NOT NULL DEFAULT 0 CHECK (reputation >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS equivalents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  skill_name TEXT NOT NULL,
  item_name TEXT NOT NULL,
  ratio NUMERIC(5, 2) NOT NULL CHECK (ratio > 0),
  description TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  helpful_votes INTEGER NOT NULL DEFAULT 0 CHECK (helpful_votes >= 0),
  not_helpful_votes INTEGER NOT NULL DEFAULT 0 CHECK (not_helpful_votes >= 0),
  confidence_score INTEGER GENERATED ALWAYS AS (
    CASE
      WHEN helpful_votes + not_helpful_votes = 0 THEN 50
      ELSE ROUND((helpful_votes::NUMERIC * 100) / (helpful_votes + not_helpful_votes))::INTEGER
    END
  ) STORED,
  created_by_session UUID REFERENCES app_sessions(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS feedback_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  equivalent_id UUID NOT NULL REFERENCES equivalents(id) ON DELETE CASCADE,
  session_id UUID NOT NULL REFERENCES app_sessions(id) ON DELETE CASCADE,
  vote_type TEXT NOT NULL CHECK (vote_type IN ('helpful', 'not_helpful')),
  reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (equivalent_id, session_id)
);

CREATE INDEX IF NOT EXISTS idx_equivalents_status ON equivalents(status);
CREATE INDEX IF NOT EXISTS idx_equivalents_created_by_session ON equivalents(created_by_session, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_equivalents_skill_name_trgm ON equivalents USING gin (skill_name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_equivalents_item_name_trgm ON equivalents USING gin (item_name gin_trgm_ops);

DROP TRIGGER IF EXISTS trg_app_sessions_updated_at ON app_sessions;
CREATE TRIGGER trg_app_sessions_updated_at
BEFORE UPDATE ON app_sessions
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_equivalents_updated_at ON equivalents;
CREATE TRIGGER trg_equivalents_updated_at
BEFORE UPDATE ON equivalents
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

INSERT INTO equivalents (
  skill_name,
  item_name,
  ratio,
  description,
  status,
  helpful_votes,
  not_helpful_votes
)
SELECT
  seed.skill_name,
  seed.item_name,
  seed.ratio,
  seed.description,
  'approved',
  seed.helpful_votes,
  seed.not_helpful_votes
FROM (
  VALUES
    (
      'guitar lessons',
      'gardening',
      2.00,
      'Frequent neighborhood exchange where one music lesson is traded for help maintaining a small patio garden.',
      13,
      2
    ),
    (
      'cooking',
      'cleaning',
      1.00,
      'Balanced one-to-one swap often used for meal prep and home upkeep in shared households.',
      8,
      3
    ),
    (
      'spanish tutoring',
      'english tutoring',
      1.00,
      'Language exchange with strong community consensus across local study groups.',
      19,
      1
    )
) AS seed(skill_name, item_name, ratio, description, helpful_votes, not_helpful_votes)
WHERE NOT EXISTS (
  SELECT 1
  FROM equivalents existing
  WHERE LOWER(existing.skill_name) = LOWER(seed.skill_name)
    AND LOWER(existing.item_name) = LOWER(seed.item_name)
);
