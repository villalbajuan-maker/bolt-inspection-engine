/*
  # Add evidence snapshot to storm risk reports

  1. Changes
    - Add `evidence_snapshot` jsonb column to `storm_risk_reports`

  2. Purpose
    - Persist the regional evidence shown in the report at generation time
    - Avoid relying on live news lookups every time a report is reopened
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'storm_risk_reports'
      AND column_name = 'evidence_snapshot'
  ) THEN
    ALTER TABLE storm_risk_reports ADD COLUMN evidence_snapshot jsonb;
  END IF;
END $$;
