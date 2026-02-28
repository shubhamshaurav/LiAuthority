-- ==========================================
-- LiAuthority: STEP 1 - Create Schema
-- Run this first!
-- ==========================================

CREATE SCHEMA IF NOT EXISTS liauthority;

-- ==========================================
-- LiAuthority: STEP 2 - Create Tables
-- Run this after Step 1 is successful
-- ==========================================

-- Create User Profiles Table
CREATE TABLE IF NOT EXISTS liauthority.user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create Subscriptions Table
CREATE TABLE IF NOT EXISTS liauthority.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'inactive',
  plan_id TEXT,
  current_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- LiAuthority: STEP 3 - Permissions & RLS
-- ==========================================

-- Enable RLS
ALTER TABLE liauthority.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE liauthority.subscriptions ENABLE ROW LEVEL SECURITY;

-- Basic Permissions
GRANT USAGE ON SCHEMA liauthority TO authenticated;
GRANT USAGE ON SCHEMA liauthority TO anon;
GRANT USAGE ON SCHEMA liauthority TO service_role;

GRANT ALL ON ALL TABLES IN SCHEMA liauthority TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA liauthority TO service_role;

-- ==========================================
-- LiAuthority: STEP 4 - Policies
-- ==========================================

-- Profiles Policies
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view own profile' AND tablename = 'user_profiles') THEN
        CREATE POLICY "Users can view own profile" ON liauthority.user_profiles FOR SELECT USING (auth.uid() = id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can update own profile' AND tablename = 'user_profiles') THEN
        CREATE POLICY "Users can update own profile" ON liauthority.user_profiles FOR UPDATE USING (auth.uid() = id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can insert own profile' AND tablename = 'user_profiles') THEN
        CREATE POLICY "Users can insert own profile" ON liauthority.user_profiles FOR INSERT WITH CHECK (auth.uid() = id);
    END IF;
END $$;

-- Subscriptions Policies
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view own subscription' AND tablename = 'subscriptions') THEN
        CREATE POLICY "Users can view own subscription" ON liauthority.subscriptions FOR SELECT USING (auth.uid() = user_id);
    END IF;
END $$;

