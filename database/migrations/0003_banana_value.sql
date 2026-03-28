-- 0003_banana_value.sql
-- Add banana_value column as a secondary reference unit.
-- Stores how many kg of Canarian bananas 1 hour of this skill is worth.

ALTER TABLE equivalents ADD COLUMN banana_value NUMERIC(7, 2) DEFAULT NULL;

-- Backfill seed data with approximate banana values
UPDATE equivalents SET banana_value = 3.00
  WHERE LOWER(skill_name) = 'guitar lessons' AND LOWER(item_name) = 'gardening';

UPDATE equivalents SET banana_value = 1.50
  WHERE LOWER(skill_name) = 'cooking' AND LOWER(item_name) = 'cleaning';

UPDATE equivalents SET banana_value = 4.00
  WHERE LOWER(skill_name) = 'spanish tutoring' AND LOWER(item_name) = 'english tutoring';
