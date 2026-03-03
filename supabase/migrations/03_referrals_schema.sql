-- ==========================================
-- LiAuthority: Phase 4 - Referrals & Payouts
-- Database Schema for Referral Program
-- ==========================================

-- 1. Extend user_profiles with referral data
ALTER TABLE liauthority.user_profiles 
ADD COLUMN IF NOT EXISTS referral_code TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS total_earnings NUMERIC DEFAULT 0;

-- 2. Referrals Table (Track who signed up via whom)
CREATE TABLE IF NOT EXISTS liauthority.referrals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    referrer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    referred_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'pending', -- 'pending', 'active', 'converted'
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(referred_id) -- A user can only be referred once
);

-- 3. Payout Settings (Bank/UPI Details)
CREATE TABLE IF NOT EXISTS liauthority.payout_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    account_holder TEXT,
    bank_name TEXT,
    account_number TEXT,
    ifsc_code TEXT,
    upi_id TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Commissions/Earnings History
CREATE TABLE IF NOT EXISTS liauthority.commissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    referred_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    amount NUMERIC NOT NULL,
    status TEXT DEFAULT 'pending', -- 'pending', 'paid', 'cancelled'
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE liauthority.referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE liauthority.payout_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE liauthority.commissions ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own referrals" ON liauthority.referrals
    FOR SELECT USING (auth.uid() = referrer_id);

CREATE POLICY "Users can manage their own payout settings" ON liauthority.payout_settings
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own commissions" ON liauthority.commissions
    FOR SELECT USING (auth.uid() = user_id);

-- Helper Function to generate unique referral code if missing
CREATE OR REPLACE FUNCTION liauthority.get_or_create_referral_code()
RETURNS TEXT AS $$
DECLARE
    final_code TEXT;
    user_name TEXT;
BEGIN
    -- Try to get existing code
    SELECT referral_code INTO final_code FROM liauthority.user_profiles WHERE id = auth.uid();
    
    IF final_code IS NULL THEN
        -- Generate new code (based on full_name + random number)
        SELECT REPLACE(LOWER(full_name), ' ', '') INTO user_name FROM liauthority.user_profiles WHERE id = auth.uid();
        final_code := COALESCE(user_name, 'user') || floor(random() * 900 + 100)::text;
        
        UPDATE liauthority.user_profiles SET referral_code = final_code WHERE id = auth.uid();
    END IF;
    
    RETURN final_code;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
