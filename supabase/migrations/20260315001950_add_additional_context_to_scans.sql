/*
  # Add additional_context column to scans

  ## Summary
  Adds an optional free-text field that captures supplementary information the user
  wants Claude to consider during fit evaluation (projects, volunteer work, publications, etc.).

  ## Changes
  - `scans` table: new nullable `additional_context` (text) column

  ## Notes
  - Column is nullable — existing rows are unaffected
  - No RLS changes required; existing session_id policies cover the new column
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'scans' AND column_name = 'additional_context'
  ) THEN
    ALTER TABLE scans ADD COLUMN additional_context text;
  END IF;
END $$;
