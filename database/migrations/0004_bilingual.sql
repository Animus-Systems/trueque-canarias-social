-- 0004_bilingual.sql
-- Add bilingual columns for skill_name, item_name, and description.
-- Existing data (English) is copied to _en columns.

ALTER TABLE equivalents
  ADD COLUMN skill_name_en TEXT,
  ADD COLUMN skill_name_es TEXT,
  ADD COLUMN item_name_en TEXT,
  ADD COLUMN item_name_es TEXT,
  ADD COLUMN description_en TEXT,
  ADD COLUMN description_es TEXT;

-- Bilingual columns start NULL. They are populated by the translation
-- service when new entries are submitted. Existing entries are translated
-- lazily when the next submission triggers a background translation pass.

-- Add trigram indexes for bilingual search
CREATE INDEX idx_equivalents_skill_name_en_trgm ON equivalents USING gin (skill_name_en gin_trgm_ops);
CREATE INDEX idx_equivalents_skill_name_es_trgm ON equivalents USING gin (skill_name_es gin_trgm_ops);
CREATE INDEX idx_equivalents_item_name_en_trgm ON equivalents USING gin (item_name_en gin_trgm_ops);
CREATE INDEX idx_equivalents_item_name_es_trgm ON equivalents USING gin (item_name_es gin_trgm_ops);
