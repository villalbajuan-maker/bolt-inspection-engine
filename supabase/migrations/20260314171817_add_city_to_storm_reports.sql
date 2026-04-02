/*\n  # Add City Field to Storm Risk Reports\n\n  1. Changes\n    - Add `city` column to `storm_risk_reports` table\n    - This enables location-specific storm evidence display\n    - City will be derived from ZIP code coordinates via reverse geocoding\n  \n  2. Notes\n    - Nullable field as existing records won't have city data\n    - Will be populated during report generation\n*/\n\nDO $$\nBEGIN\n  IF NOT EXISTS (\n    SELECT 1 FROM information_schema.columns\n    WHERE table_name = 'storm_risk_reports' AND column_name = 'city'\n  ) THEN\n    ALTER TABLE storm_risk_reports ADD COLUMN city text;
\n  END IF;
\nEND $$;
\n;
