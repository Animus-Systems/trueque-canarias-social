-- 0005_drop_original_columns.sql
-- Remove redundant skill_name, item_name, description columns.
-- The _en/_es bilingual columns are now the source of truth.

-- Backfill: copy original data into _en where _en is still NULL
UPDATE equivalents SET skill_name_en = skill_name WHERE skill_name_en IS NULL;
UPDATE equivalents SET item_name_en = item_name WHERE item_name_en IS NULL;
UPDATE equivalents SET description_en = description WHERE description_en IS NULL;

-- Backfill: copy original data into _es where _es is still NULL (fallback until translated)
UPDATE equivalents SET skill_name_es = skill_name WHERE skill_name_es IS NULL;
UPDATE equivalents SET item_name_es = item_name WHERE item_name_es IS NULL;
UPDATE equivalents SET description_es = description WHERE description_es IS NULL;

-- Drop the original trigram indexes (replaced by _en/_es indexes in 0004)
DROP INDEX IF EXISTS idx_equivalents_skill_name_trgm;
DROP INDEX IF EXISTS idx_equivalents_item_name_trgm;

-- Drop the original columns
ALTER TABLE equivalents DROP COLUMN skill_name;
ALTER TABLE equivalents DROP COLUMN item_name;
ALTER TABLE equivalents DROP COLUMN description;

-- Ensure bilingual columns are NOT NULL going forward
ALTER TABLE equivalents ALTER COLUMN skill_name_en SET NOT NULL;
ALTER TABLE equivalents ALTER COLUMN item_name_en SET NOT NULL;
ALTER TABLE equivalents ALTER COLUMN description_en SET NOT NULL;
ALTER TABLE equivalents ALTER COLUMN skill_name_es SET NOT NULL;
ALTER TABLE equivalents ALTER COLUMN item_name_es SET NOT NULL;
ALTER TABLE equivalents ALTER COLUMN description_es SET NOT NULL;
