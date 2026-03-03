-- ==========================================
-- Fix Permissions & RLS for Payments
-- Allow authenticated users and service_role to access tables
-- ==========================================

-- 1. Grant broad permissions on the schema and all tables
-- This ensures service_role (backend) and authenticated (frontend) have access
GRANT USAGE ON SCHEMA liauthority TO authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA liauthority TO authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA liauthority TO authenticated, service_role;

-- Ensure future tables also get these permissions
ALTER DEFAULT PRIVILEGES IN SCHEMA liauthority GRANT ALL ON TABLES TO authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA liauthority GRANT ALL ON SEQUENCES TO authenticated, service_role;

DO $$ 
BEGIN
    -- 2. Create policy for authenticated users to SELECT active gateways
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Authenticated users can see active gateways' AND tablename = 'payment_gateways') THEN
        CREATE POLICY "Authenticated users can see active gateways" ON liauthority.payment_gateways 
            FOR SELECT 
            TO authenticated
            USING (is_active = true);
    END IF;

    -- 3. FIX: Replace direct auth.users lookups with auth.jwt() metadata
    -- This avoids "permission denied" errors for non-admin users
    
    -- Admins can manage payment gateways
    DROP POLICY IF EXISTS "Admins can manage payment gateways" ON liauthority.payment_gateways;
    CREATE POLICY "Admins can manage payment gateways" ON liauthority.payment_gateways
        FOR ALL
        TO authenticated
        USING ((auth.jwt() -> 'app_metadata' ->> 'is_admin')::boolean = true);

    -- Admins can manage coupons
    DROP POLICY IF EXISTS "Admins can manage coupons" ON liauthority.coupons;
    CREATE POLICY "Admins can manage coupons" ON liauthority.coupons
        FOR ALL
        TO authenticated
        USING ((auth.jwt() -> 'app_metadata' ->> 'is_admin')::boolean = true);

    -- Admins can view all transactions
    DROP POLICY IF EXISTS "Admins can view all transactions" ON liauthority.transactions;
    CREATE POLICY "Admins can view all transactions" ON liauthority.transactions
        FOR SELECT
        TO authenticated
        USING ((auth.jwt() -> 'app_metadata' ->> 'is_admin')::boolean = true);

END $$;
