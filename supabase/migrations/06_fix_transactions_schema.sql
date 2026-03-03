-- ==========================================
-- Fix Transactions Table Schema
-- ==========================================

-- 1. Change default currency from INR to USD
ALTER TABLE liauthority.transactions 
    ALTER COLUMN currency SET DEFAULT 'USD';

-- Update any existing pending transactions to USD
UPDATE liauthority.transactions 
    SET currency = 'USD' 
    WHERE status = 'pending';

-- 2. Add provider_tx_id column (Cashfree's internal order ID)
ALTER TABLE liauthority.transactions 
    ADD COLUMN IF NOT EXISTS provider_tx_id TEXT;
