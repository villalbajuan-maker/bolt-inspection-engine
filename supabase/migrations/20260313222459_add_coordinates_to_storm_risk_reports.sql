/*\n  # Add Coordinates to Storm Risk Reports\n\n  1. Changes\n    - Add `lat` column to `storm_risk_reports` table (numeric, nullable for existing records)\n    - Add `lon` column to `storm_risk_reports` table (numeric, nullable for existing records)\n  \n  2. Purpose\n    - Store latitude and longitude coordinates for each storm risk report\n    - Enable dynamic map centering based on ZIP code location\n    - Coordinates are sourced from `florida_zip_reference` table via `get_storm_report` function\n  \n  3. Security\n    - No security changes, existing RLS policies remain in place\n*/\n\nDO $$\nBEGIN\n  IF NOT EXISTS (\n    SELECT 1 FROM information_schema.columns\n    WHERE table_name = 'storm_risk_reports' AND column_name = 'lat'\n  ) THEN\n    ALTER TABLE storm_risk_reports ADD COLUMN lat numeric;
\n  END IF;
\n\n  IF NOT EXISTS (\n    SELECT 1 FROM information_schema.columns\n    WHERE table_name = 'storm_risk_reports' AND column_name = 'lon'\n  ) THEN\n    ALTER TABLE storm_risk_reports ADD COLUMN lon numeric;
\n  END IF;
\nEND $$;
;
