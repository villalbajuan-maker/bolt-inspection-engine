/*
  # Disaster Shield - Complete Database Schema

  ## Overview
  This migration creates all tables required for the Disaster Shield microapp including:
  - ZIP code risk mapping
  - Inspection booking requests
  - Conversion analytics tracking

  ## New Tables
  
  ### 1. `zip_risk_map`
  Stores comprehensive risk assessment data for ZIP codes across Florida
  - `id` (uuid, primary key) - Unique identifier
  - `zip_code` (text, unique, indexed) - 5-digit ZIP code
  - `hurricane_risk_score` (integer) - Hurricane risk level (0-100)
  - `flood_risk_score` (integer) - Flood risk level (0-100)
  - `coastal_exposure_score` (integer) - Coastal proximity risk (0-100)
  - `insurance_claim_risk` (text) - Risk category: Low, Moderate, High, Severe
  - `overall_risk_score` (integer) - Computed overall risk (0-100)
  - `region` (text) - Geographic region identifier
  - `created_at` (timestamptz) - Record creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### 2. `inspection_requests`
  Stores all inspection booking submissions from the conversion flow
  - `id` (uuid, primary key) - Unique booking identifier
  - `full_name` (text) - Customer full name
  - `address` (text) - Property street address
  - `city` (text) - Property city
  - `zip` (text, indexed) - Property ZIP code
  - `phone` (text) - Contact phone number
  - `email` (text) - Contact email address
  - `preferred_date` (date) - Requested inspection date
  - `preferred_time_window` (text) - Time window preference
  - `inspection_type` (text) - Type of inspection requested
  - `source` (text) - Traffic source tracking
  - `status` (text) - Booking status (pending, confirmed, completed, cancelled)
  - `created_at` (timestamptz) - Booking submission timestamp

  ### 3. `conversion_events`
  Analytics tracking for user behavior and conversion funnel
  - `id` (uuid, primary key) - Event identifier
  - `event_type` (text, indexed) - Event name (risk_checked, video_watched, inspection_booked)
  - `zip_entered` (text) - ZIP code if applicable
  - `inspection_booked` (boolean) - Conversion flag
  - `session_id` (text) - Browser session identifier
  - `user_agent` (text) - Browser user agent string
  - `timestamp` (timestamptz, indexed) - Event occurrence time

  ## Security
  - RLS enabled on all tables
  - Public read access for zip_risk_map (educational data)
  - Public insert access for inspection_requests and conversion_events (conversion flow)
  - Authenticated admin access for all operations

  ## Indexes
  - ZIP code lookups optimized with indexes
  - Event type and timestamp indexed for analytics queries
*/

-- Create zip_risk_map table
CREATE TABLE IF NOT EXISTS zip_risk_map (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  zip_code text UNIQUE NOT NULL,
  hurricane_risk_score integer NOT NULL DEFAULT 0,
  flood_risk_score integer NOT NULL DEFAULT 0,
  coastal_exposure_score integer NOT NULL DEFAULT 0,
  insurance_claim_risk text NOT NULL DEFAULT 'Moderate',
  overall_risk_score integer NOT NULL DEFAULT 0,
  region text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create index on zip_code for fast lookups
CREATE INDEX IF NOT EXISTS idx_zip_risk_map_zip_code ON zip_risk_map(zip_code);

-- Create inspection_requests table
CREATE TABLE IF NOT EXISTS inspection_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  address text NOT NULL,
  city text NOT NULL,
  zip text NOT NULL,
  phone text NOT NULL,
  email text NOT NULL,
  preferred_date date NOT NULL,
  preferred_time_window text NOT NULL,
  inspection_type text NOT NULL,
  source text DEFAULT 'conversion_microapp',
  status text DEFAULT 'pending',
  created_at timestamptz DEFAULT now()
);

-- Create index on zip for analytics
CREATE INDEX IF NOT EXISTS idx_inspection_requests_zip ON inspection_requests(zip);

-- Create index on created_at for reporting
CREATE INDEX IF NOT EXISTS idx_inspection_requests_created_at ON inspection_requests(created_at);

-- Create conversion_events table
CREATE TABLE IF NOT EXISTS conversion_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type text NOT NULL,
  zip_entered text DEFAULT '',
  inspection_booked boolean DEFAULT false,
  session_id text DEFAULT '',
  user_agent text DEFAULT '',
  timestamp timestamptz DEFAULT now()
);

-- Create indexes for analytics queries
CREATE INDEX IF NOT EXISTS idx_conversion_events_event_type ON conversion_events(event_type);
CREATE INDEX IF NOT EXISTS idx_conversion_events_timestamp ON conversion_events(timestamp);

-- Enable Row Level Security
ALTER TABLE zip_risk_map ENABLE ROW LEVEL SECURITY;
ALTER TABLE inspection_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversion_events ENABLE ROW LEVEL SECURITY;

-- RLS Policies for zip_risk_map (public read access for educational data)
CREATE POLICY "Public users can read ZIP risk data"
  ON zip_risk_map
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert ZIP risk data"
  ON zip_risk_map
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update ZIP risk data"
  ON zip_risk_map
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- RLS Policies for inspection_requests (public insert for conversion flow)
CREATE POLICY "Anyone can submit inspection requests"
  ON inspection_requests
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can read inspection requests"
  ON inspection_requests
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can update inspection requests"
  ON inspection_requests
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- RLS Policies for conversion_events (public insert for analytics)
CREATE POLICY "Anyone can track conversion events"
  ON conversion_events
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can read conversion events"
  ON conversion_events
  FOR SELECT
  TO authenticated
  USING (true);