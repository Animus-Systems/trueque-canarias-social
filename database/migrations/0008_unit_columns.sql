-- 0008_unit_columns.sql
-- Add offer_unit and receive_unit for multi-unit barter support.
-- Existing data defaults to 'hour' for backward compatibility.

ALTER TABLE equivalents
  ADD COLUMN offer_unit TEXT NOT NULL DEFAULT 'hour'
    CHECK (offer_unit IN ('hour', 'kg', 'unit', 'dozen', 'liter')),
  ADD COLUMN receive_unit TEXT NOT NULL DEFAULT 'hour'
    CHECK (receive_unit IN ('hour', 'kg', 'unit', 'dozen', 'liter'));

-- Widen ratio to support goods quantities (was NUMERIC(5,2), now NUMERIC(7,2))
ALTER TABLE equivalents ALTER COLUMN ratio TYPE NUMERIC(7, 2);
