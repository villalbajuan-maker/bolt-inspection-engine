/*\n  # Add Call Recording and Status Fields\n\n  ## Overview\n  Enhances the calls table to support call recordings and more detailed call status tracking.\n\n  ## Changes\n  \n  ### 1. Add New Columns to calls table\n  - `recording_url` (text, nullable) - URL to the call recording audio file\n  - `call_status` (text, not null) - Business status of the call (answered, voicemail, no_answer)\n\n  ## Migration Strategy\n  - Uses IF NOT EXISTS checks to safely add columns\n  - Sets default value for call_status based on existing call_type data\n  - Maintains backward compatibility with existing data\n\n  ## Notes\n  - recording_url is nullable as not all calls may have recordings\n  - call_status provides clearer business semantics than call_type\n  - Existing call_type column is preserved for backward compatibility\n*/\n\n-- Add recording_url column to calls table\nDO $$\nBEGIN\n  IF NOT EXISTS (\n    SELECT 1 FROM information_schema.columns\n    WHERE table_name = 'calls' AND column_name = 'recording_url'\n  ) THEN\n    ALTER TABLE calls ADD COLUMN recording_url text;
\n  END IF;
\nEND $$;
\n\n-- Add call_status column to calls table\nDO $$\nBEGIN\n  IF NOT EXISTS (\n    SELECT 1 FROM information_schema.columns\n    WHERE table_name = 'calls' AND column_name = 'call_status'\n  ) THEN\n    ALTER TABLE calls ADD COLUMN call_status text DEFAULT 'no_answer';
\n  END IF;
\nEND $$;
\n\n-- Update existing records to set call_status based on call_type\nUPDATE calls\nSET call_status = call_type\nWHERE call_status IS NULL OR call_status = 'no_answer';
;
