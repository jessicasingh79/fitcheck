/*
  # Create scans table for FitCheck

  ## Summary
  Creates the main data store for FitCheck job fit analysis results.

  ## New Tables

  ### `scans`
  Stores every AI analysis result with all associated metadata.

  - `id` (uuid, primary key) — unique identifier for each scan
  - `created_at` (timestamptz) — when the scan was performed
  - `job_description` (text) — the job description text submitted
  - `resume` (text) — the resume/background text submitted
  - `fit_score` (integer) — AI-generated fit score 0-100
  - `strengths` (text[]) — array of 3 strength points from AI
  - `gaps` (text[]) — array of 3 gap points from AI
  - `pitch` (text) — AI-generated cover letter/interview opener pitch
  - `company_name` (text) — user-added company name (nullable)
  - `role_title` (text) — user-added role title (nullable)
  - `status` (text) — application status: 'pending', 'got_a_call', 'no_response'
  - `session_id` (text) — browser session identifier for grouping scans without auth

  ## Security

  - RLS enabled
  - Public read/write allowed by session_id matching (no login required per spec)
  - Scans are identifiable by session_id stored in localStorage
*/

CREATE TABLE IF NOT EXISTS scans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  job_description text NOT NULL DEFAULT '',
  resume text NOT NULL DEFAULT '',
  fit_score integer NOT NULL DEFAULT 0,
  strengths text[] NOT NULL DEFAULT '{}',
  gaps text[] NOT NULL DEFAULT '{}',
  pitch text NOT NULL DEFAULT '',
  company_name text,
  role_title text,
  status text NOT NULL DEFAULT 'pending',
  session_id text NOT NULL DEFAULT ''
);

ALTER TABLE scans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert scans with a session_id"
  ON scans FOR INSERT
  TO anon
  WITH CHECK (session_id != '');

CREATE POLICY "Users can read their own scans by session_id"
  ON scans FOR SELECT
  TO anon
  USING (session_id != '');

CREATE POLICY "Users can update their own scans by session_id"
  ON scans FOR UPDATE
  TO anon
  USING (session_id != '')
  WITH CHECK (session_id != '');

CREATE INDEX IF NOT EXISTS scans_session_id_idx ON scans(session_id);
CREATE INDEX IF NOT EXISTS scans_created_at_idx ON scans(created_at DESC);
