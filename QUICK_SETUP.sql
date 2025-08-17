-- =====================================================
-- QUICK SETUP - Essential tables for Growth System Real-time
-- =====================================================

-- 1. Admin Settings Table (for global Growth System control)
CREATE TABLE admin_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  setting_key TEXT UNIQUE NOT NULL,
  setting_value JSONB NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_by TEXT DEFAULT 'system'
);

-- Insert default admin settings
INSERT INTO admin_settings (setting_key, setting_value, updated_by) VALUES
('growth_system_enabled', 'true'::jsonb, 'system');

-- 2. Admin Sessions Table (for admin login/logout tracking)
CREATE TABLE admin_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_token TEXT UNIQUE NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  login_timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  logout_timestamp TIMESTAMP WITH TIME ZONE NULL,
  session_duration INTEGER DEFAULT 86400000, -- 24 hours in milliseconds
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. System Activity Log (for admin monitoring)
CREATE TABLE system_activity_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  activity_type TEXT NOT NULL, -- 'growth_toggle', 'customer_block', 'admin_login', etc.
  description TEXT NOT NULL,
  metadata JSONB NULL,
  performed_by TEXT DEFAULT 'system',
  ip_address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- INDEXES for better performance
-- =====================================================

CREATE INDEX idx_admin_settings_key ON admin_settings(setting_key);
CREATE INDEX idx_admin_sessions_active ON admin_sessions(is_active, login_timestamp);
CREATE INDEX idx_activity_log_type ON system_activity_log(activity_type, created_at);

-- =====================================================
-- ROW LEVEL SECURITY (RLS) Policies
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE admin_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_activity_log ENABLE ROW LEVEL SECURITY;

-- Policy for admin_settings (allow read for everyone, write for authenticated)
CREATE POLICY "Allow read access to admin_settings" ON admin_settings
  FOR SELECT USING (true);

CREATE POLICY "Allow write access to admin_settings for authenticated users" ON admin_settings
  FOR ALL USING (auth.role() = 'authenticated');

-- Policy for admin_sessions (allow all for now)
CREATE POLICY "Allow access to admin_sessions" ON admin_sessions
  FOR ALL USING (true);

-- Policy for system_activity_log (allow insert for everyone, read for authenticated)
CREATE POLICY "Allow insert to system_activity_log" ON system_activity_log
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow read access to system_activity_log for authenticated users" ON system_activity_log
  FOR SELECT USING (auth.role() = 'authenticated');

-- =====================================================
-- REAL-TIME SUBSCRIPTIONS
-- =====================================================

-- Enable real-time for tables that need live updates
ALTER PUBLICATION supabase_realtime ADD TABLE admin_settings;

-- =====================================================
-- FUNCTIONS AND TRIGGERS
-- =====================================================

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers to automatically update updated_at
CREATE TRIGGER update_admin_settings_updated_at BEFORE UPDATE ON admin_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to log system activities
CREATE OR REPLACE FUNCTION log_growth_system_toggle()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.setting_key = 'growth_system_enabled' AND OLD.setting_value != NEW.setting_value THEN
        INSERT INTO system_activity_log (activity_type, description, metadata, performed_by)
        VALUES (
            'growth_system_toggle',
            CASE 
                WHEN NEW.setting_value::boolean = true THEN 'Growth System enabled'
                ELSE 'Growth System disabled'
            END,
            jsonb_build_object(
                'previous_value', OLD.setting_value,
                'new_value', NEW.setting_value
            ),
            NEW.updated_by
        );
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for growth system toggle logging
CREATE TRIGGER log_growth_system_toggle_trigger
    AFTER UPDATE ON admin_settings
    FOR EACH ROW EXECUTE FUNCTION log_growth_system_toggle();

-- =====================================================
-- VERIFICATION QUERY
-- =====================================================

-- Run this to verify everything was created successfully
SELECT 'Tables created successfully!' as status,
       (SELECT COUNT(*) FROM admin_settings) as admin_settings_count,
       (SELECT setting_value FROM admin_settings WHERE setting_key = 'growth_system_enabled') as growth_system_status;
