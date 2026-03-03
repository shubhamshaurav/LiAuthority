-- ==========================================
-- LiAuthority: Phase 1 - Foundation & Database
-- Enhanced Schema for Plans, Onboarding, and Content
-- ==========================================

-- 1. Create Plans Table
CREATE TABLE IF NOT EXISTS liauthority.plans (
    id TEXT PRIMARY KEY, -- 'FREE', 'PRO', 'GROWTH'
    name TEXT NOT NULL,
    price_monthly NUMERIC DEFAULT 0,
    post_limit_per_month INTEGER,
    voice_profiles_limit INTEGER,
    has_auto_scheduling BOOLEAN DEFAULT FALSE,
    has_calendar_builder BOOLEAN DEFAULT FALSE,
    has_approval_workflow BOOLEAN DEFAULT FALSE,
    has_dual_safety_layer BOOLEAN DEFAULT FALSE,
    features JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert Default Plans
INSERT INTO liauthority.plans (id, name, price_monthly, post_limit_per_month, voice_profiles_limit, has_auto_scheduling, has_calendar_builder, has_approval_workflow, has_dual_safety_layer)
VALUES 
('FREE', 'Free', 0, 25, 1, FALSE, FALSE, FALSE, FALSE),
('PRO', 'Pro', 10, -1, 3, FALSE, TRUE, FALSE, FALSE), -- -1 indicates unlimited
('GROWTH', 'Growth', 20, -1, 10, TRUE, TRUE, TRUE, TRUE)
ON CONFLICT (id) DO UPDATE SET
    price_monthly = EXCLUDED.price_monthly,
    post_limit_per_month = EXCLUDED.post_limit_per_month,
    voice_profiles_limit = EXCLUDED.voice_profiles_limit,
    has_auto_scheduling = EXCLUDED.has_auto_scheduling,
    has_calendar_builder = EXCLUDED.has_calendar_builder,
    has_approval_workflow = EXCLUDED.has_approval_workflow,
    has_dual_safety_layer = EXCLUDED.has_dual_safety_layer;

-- 2. Update User Profiles
ALTER TABLE liauthority.user_profiles 
ADD COLUMN IF NOT EXISTS onboarded BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS onboarding_step INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS onboarding_data JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS current_plan_id TEXT REFERENCES liauthority.plans(id) DEFAULT 'FREE',
ADD COLUMN IF NOT EXISTS linkedin_url TEXT,
ADD COLUMN IF NOT EXISTS job_title TEXT,
ADD COLUMN IF NOT EXISTS bio TEXT;

-- 3. Voice Profiles (Personalization)
CREATE TABLE IF NOT EXISTS liauthority.voice_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    sample_posts TEXT[] DEFAULT '{}',
    tone_instructions TEXT,
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Posts Table
CREATE TABLE IF NOT EXISTS liauthority.posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    source_url TEXT,
    source_type TEXT, -- 'url', 'idea', 'repurpose'
    status TEXT DEFAULT 'draft', -- 'draft', 'scheduled', 'published'
    generated_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'
);

-- 5. Webhooks Configuration (Admin-managed)
CREATE TABLE IF NOT EXISTS liauthority.webhooks (
    id TEXT PRIMARY KEY, -- 'post_generator', 'voice_refiner', etc.
    url TEXT NOT NULL,
    active BOOLEAN DEFAULT TRUE,
    secret_key TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Scheduled Posts & Calendar
CREATE TABLE IF NOT EXISTS liauthority.scheduled_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID REFERENCES liauthority.posts(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    scheduled_for TIMESTAMPTZ NOT NULL,
    is_auto_scheduled BOOLEAN DEFAULT FALSE,
    approval_status TEXT DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- Permissions & RLS
-- ==========================================

-- Enable RLS on all tables
ALTER TABLE liauthority.plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE liauthority.voice_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE liauthority.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE liauthority.webhooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE liauthority.scheduled_posts ENABLE ROW LEVEL SECURITY;

-- Grant Permissions to Authenticated Users
GRANT USAGE ON SCHEMA liauthority TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA liauthority TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA liauthority TO authenticated;

-- Policies
DO $$ 
BEGIN
    -- Plans: Public read
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public read for plans' AND tablename = 'plans') THEN
        CREATE POLICY "Public read for plans" ON liauthority.plans FOR SELECT USING (true);
    END IF;

    -- Voice Profiles: Users can manage own
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can manage own voice profiles' AND tablename = 'voice_profiles') THEN
        CREATE POLICY "Users can manage own voice profiles" ON liauthority.voice_profiles FOR ALL USING (auth.uid() = user_id);
    END IF;

    -- Posts: Users can manage own
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can manage own posts' AND tablename = 'posts') THEN
        CREATE POLICY "Users can manage own posts" ON liauthority.posts FOR ALL USING (auth.uid() = user_id);
    END IF;

    -- Scheduled Posts: Users can manage own
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can manage own scheduled posts' AND tablename = 'scheduled_posts') THEN
        CREATE POLICY "Users can manage own scheduled posts" ON liauthority.scheduled_posts FOR ALL USING (auth.uid() = user_id);
    END IF;

    -- Admin Webhook access
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins can manage webhooks' AND tablename = 'webhooks') THEN
        CREATE POLICY "Admins can manage webhooks" ON liauthority.webhooks
            USING (EXISTS (SELECT 1 FROM auth.users WHERE auth.users.id = auth.uid() AND (auth.users.raw_app_meta_data->>'is_admin')::boolean = true));
    END IF;
END $$;
