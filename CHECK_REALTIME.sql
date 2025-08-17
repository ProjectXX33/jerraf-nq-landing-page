-- =====================================================
-- CHECK AND FIX REAL-TIME SETUP
-- =====================================================

-- 1. Check if tables exist and have data
SELECT 'admin_settings table:' as info, COUNT(*) as count FROM admin_settings;
SELECT setting_key, setting_value FROM admin_settings;

-- 2. Make sure real-time is enabled for admin_settings
ALTER PUBLICATION supabase_realtime DROP TABLE admin_settings;
ALTER PUBLICATION supabase_realtime ADD TABLE admin_settings;

-- 3. Check if the growth_system_enabled setting exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM admin_settings WHERE setting_key = 'growth_system_enabled') THEN
        INSERT INTO admin_settings (setting_key, setting_value, updated_by) 
        VALUES ('growth_system_enabled', 'true'::jsonb, 'system');
    END IF;
END $$;

-- 4. Verify the setup
SELECT 'Real-time setup complete!' as status,
       setting_key,
       setting_value,
       updated_at
FROM admin_settings 
WHERE setting_key = 'growth_system_enabled';
