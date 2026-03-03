-- ==========================================
-- LiAuthority: Contact Us & SMTP Settings
-- ==========================================

-- 1. Create System Settings Table
CREATE TABLE IF NOT EXISTS liauthority.system_settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert Template for SMTP Settings (To be filled by admin)
INSERT INTO liauthority.system_settings (key, value, description)
VALUES (
    'smtp_config', 
    '{
        "host": "smtp.gmail.com",
        "port": 587,
        "user": "your-email@gmail.com",
        "pass": "your-app-password",
        "from": "LiAuthority Support <support@liauthority.com>",
        "to": "admin@liauthority.com"
    }'::jsonb,
    'SMTP configuration for sending system emails'
) ON CONFLICT (key) DO NOTHING;

-- 2. Create Contact Submissions Table
CREATE TABLE IF NOT EXISTS liauthority.contact_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    subject TEXT,
    message TEXT NOT NULL,
    status TEXT DEFAULT 'pending', -- 'pending', 'replied', 'archived'
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE liauthority.system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE liauthority.contact_submissions ENABLE ROW LEVEL SECURITY;

-- Policies for system_settings (Admin only context needed, but for now we'll allow admin check)
CREATE POLICY "Admins can manage system settings" ON liauthority.system_settings
    USING (EXISTS (SELECT 1 FROM auth.users WHERE auth.users.id = auth.uid() AND (auth.users.raw_app_meta_data->>'is_admin')::boolean = true));

-- Policies for contact_submissions
-- Allow anybody to insert (public submissions)
CREATE POLICY "Anyone can submit contact form" ON liauthority.contact_submissions FOR INSERT WITH CHECK (true);
-- Only admins can read/update/delete
CREATE POLICY "Admins can manage contact submissions" ON liauthority.contact_submissions
    USING (EXISTS (SELECT 1 FROM auth.users WHERE auth.users.id = auth.uid() AND (auth.users.raw_app_meta_data->>'is_admin')::boolean = true));
