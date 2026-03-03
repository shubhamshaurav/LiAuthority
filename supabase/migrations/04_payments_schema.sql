-- ==========================================
-- LiAuthority: Phase 6 - Multi-Gateway Payments
-- Database Schema for Gateways, Coupons and Transactions
-- ==========================================

-- 1. Payment Gateways Configuration
CREATE TABLE IF NOT EXISTS liauthority.payment_gateways (
    id TEXT PRIMARY KEY, -- 'cashfree', 'dodopayments'
    name TEXT NOT NULL,
    app_id TEXT, -- Explicit column for App ID / Client ID
    secret_key TEXT, -- Explicit column for Secret Key / API Key
    is_active BOOLEAN DEFAULT FALSE,
    environment TEXT DEFAULT 'sandbox', -- 'sandbox' or 'production'
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Migration for existing table (if user already ran previous version)
DO $$ 
BEGIN
    -- Add app_id if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'liauthority' AND table_name = 'payment_gateways' AND column_name = 'app_id') THEN
        ALTER TABLE liauthority.payment_gateways ADD COLUMN app_id TEXT;
    END IF;

    -- Add secret_key if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'liauthority' AND table_name = 'payment_gateways' AND column_name = 'secret_key') THEN
        ALTER TABLE liauthority.payment_gateways ADD COLUMN secret_key TEXT;
    END IF;

    -- Drop old config column if it exists
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'liauthority' AND table_name = 'payment_gateways' AND column_name = 'config') THEN
        ALTER TABLE liauthority.payment_gateways DROP COLUMN config;
    END IF;
END $$;

-- Insert Placeholders for Gateways
INSERT INTO liauthority.payment_gateways (id, name, is_active, environment)
VALUES 
('cashfree', 'Cashfree PG', FALSE, 'sandbox'),
('dodopayments', 'Dodo Payments', FALSE, 'sandbox')
ON CONFLICT (id) DO NOTHING;

-- 2. Coupon Management
CREATE TABLE IF NOT EXISTS liauthority.coupons (
    id TEXT PRIMARY KEY, -- The code itself (e.g., 'WELCOME50')
    discount_type TEXT NOT NULL, -- 'percentage', 'fixed'
    discount_value NUMERIC NOT NULL,
    min_purchase NUMERIC DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    expires_at TIMESTAMPTZ,
    usage_limit INTEGER,
    used_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Transactions Tracking
CREATE TABLE IF NOT EXISTS liauthority.transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    gateway_id TEXT REFERENCES liauthority.payment_gateways(id),
    order_id TEXT UNIQUE, -- Provider-specific ID
    amount NUMERIC NOT NULL,
    currency TEXT DEFAULT 'INR',
    status TEXT DEFAULT 'pending', -- 'pending', 'success', 'failed', 'cancelled'
    coupon_id TEXT REFERENCES liauthority.coupons(id),
    plan_id TEXT REFERENCES liauthority.plans(id),
    metadata JSONB DEFAULT '{}',
    payment_method TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Update Subscriptions Table
ALTER TABLE liauthority.subscriptions 
ADD COLUMN IF NOT EXISTS provider_name TEXT,
ADD COLUMN IF NOT EXISTS provider_subscription_id TEXT,
ADD COLUMN IF NOT EXISTS last_transaction_id UUID REFERENCES liauthority.transactions(id);

-- ==========================================
-- Permissions & RLS
-- ==========================================

-- Enable RLS
ALTER TABLE liauthority.payment_gateways ENABLE ROW LEVEL SECURITY;
ALTER TABLE liauthority.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE liauthority.transactions ENABLE ROW LEVEL SECURITY;

-- 5. Policies

DO $$ 
BEGIN
    -- Payment Gateways: ONLY Admins can see the config. Service role has bypass.
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins can manage payment gateways' AND tablename = 'payment_gateways') THEN
        CREATE POLICY "Admins can manage payment gateways" ON liauthority.payment_gateways
            FOR ALL
            TO authenticated
            USING (
                EXISTS (
                    SELECT 1 FROM auth.users 
                    WHERE auth.users.id = auth.uid() 
                    AND (auth.users.raw_app_meta_data->>'is_admin')::boolean = true
                )
            );
    END IF;

    -- Coupons: Public read (for validation), Admin manage
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Anyone can view active coupons' AND tablename = 'coupons') THEN
        CREATE POLICY "Anyone can view active coupons" ON liauthority.coupons 
            FOR SELECT 
            TO authenticated
            USING (is_active = true);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins can manage coupons' AND tablename = 'coupons') THEN
        CREATE POLICY "Admins can manage coupons" ON liauthority.coupons 
            FOR ALL
            TO authenticated
            USING (
                EXISTS (
                    SELECT 1 FROM auth.users 
                    WHERE auth.users.id = auth.uid() 
                    AND (auth.users.raw_app_meta_data->>'is_admin')::boolean = true
                )
            );
    END IF;

    -- Transactions: Users can view own, Admin all
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view own transactions' AND tablename = 'transactions') THEN
        CREATE POLICY "Users can view own transactions" ON liauthority.transactions 
            FOR SELECT 
            TO authenticated
            USING (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins can view all transactions' AND tablename = 'transactions') THEN
        CREATE POLICY "Admins can view all transactions" ON liauthority.transactions 
            FOR SELECT 
            TO authenticated
            USING (
                EXISTS (
                    SELECT 1 FROM auth.users 
                    WHERE auth.users.id = auth.uid() 
                    AND (auth.users.raw_app_meta_data->>'is_admin')::boolean = true
                )
            );
    END IF;
END $$;
