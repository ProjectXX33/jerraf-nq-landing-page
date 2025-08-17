-- =====================================================
-- CHECK AND FIX REAL-TIME SETUP (Safe Version)
-- =====================================================

-- 1. Check what tables are already in real-time
SELECT 'Current real-time tables:' as info;
SELECT schemaname, tablename 
FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime';

-- 2. Check if our tables exist
SELECT 'Table existence check:' as info;
SELECT table_name, 
       CASE WHEN table_name IS NOT NULL THEN 'EXISTS' ELSE 'MISSING' END as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('admin_settings', 'order_growth_access', 'customer_growth_access');

-- 3. Enable RLS on tables (safe to run multiple times)
ALTER TABLE IF EXISTS admin_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS order_growth_access ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS customer_growth_access ENABLE ROW LEVEL SECURITY;

-- 4. Add tables to real-time (only if not already added)
DO $$
BEGIN
    -- Add admin_settings if not in real-time
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND tablename = 'admin_settings'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE admin_settings;
    END IF;
    
    -- Add order_growth_access if not in real-time
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND tablename = 'order_growth_access'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE order_growth_access;
    END IF;
    
    -- Add customer_growth_access if not in real-time
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND tablename = 'customer_growth_access'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE customer_growth_access;
    END IF;
END $$;

-- 5. Verify final setup
SELECT '=== FINAL VERIFICATION ===' as status;
SELECT 'Real-time enabled tables:' as info;
SELECT schemaname, tablename 
FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime'
AND tablename IN ('admin_settings', 'order_growth_access', 'customer_growth_access')
ORDER BY tablename;

-- 6. Test data in order_growth_access
SELECT 'Sample order data:' as info;
SELECT order_id, order_number, customer_email, is_growth_enabled 
FROM order_growth_access 
LIMIT 5;
