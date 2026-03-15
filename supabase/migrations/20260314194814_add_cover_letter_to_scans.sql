/*
  # Add cover_letter column to scans table

  ## Summary
  Adds an optional cover_letter column to store the AI-generated cover letter text.
  When a cover letter is generated for a scan, it is saved here so it can be
  displayed immediately on subsequent views without calling the AI again.

  ## Changes
  - `scans.cover_letter` (text, nullable) — stores the generated cover letter text
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'scans' AND column_name = 'cover_letter'
  ) THEN
    ALTER TABLE scans ADD COLUMN cover_letter text;
  END IF;
END $$;
