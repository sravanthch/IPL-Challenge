-- ============================================================
-- IPL 2026 Predictions App — Supabase SQL Setup
-- Run this in your Supabase SQL Editor (Dashboard → SQL Editor)
-- ============================================================

-- 1. Users table (stores PIN hashes)
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  pin_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Predictions table
CREATE TABLE IF NOT EXISTS predictions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  match_id INTEGER NOT NULL,
  user_name TEXT NOT NULL,
  predicted_winner TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(match_id, user_name)
);

-- 3. Results table (admin enters match winners here)
CREATE TABLE IF NOT EXISTS results (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  match_id INTEGER UNIQUE NOT NULL,
  winner TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- Enable Row Level Security (RLS) but allow all for anon key
-- (Security is enforced at app level via PIN)
-- ============================================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE results ENABLE ROW LEVEL SECURITY;

-- Allow public read and write for all tables (anon key access)
CREATE POLICY "Allow all on users" ON users FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on predictions" ON predictions FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on results" ON results FOR ALL TO anon USING (true) WITH CHECK (true);

-- Enable Realtime for predictions and results tables
ALTER PUBLICATION supabase_realtime ADD TABLE predictions;
ALTER PUBLICATION supabase_realtime ADD TABLE results;

-- ============================================================
-- Done! You're ready to go.
-- ============================================================
