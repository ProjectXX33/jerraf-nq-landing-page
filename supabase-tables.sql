-- =====================================================
-- NQ Argitone - Supabase Database Tables
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
('growth_system_enabled', 'true'::jsonb, 'system'),
('admin_session', '{"isLoggedIn": false, "loginTimestamp": null, "sessionDuration": 86400000}'::jsonb, 'system');

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

-- 3. Customer Growth Access Table (individual customer controls)
CREATE TABLE customer_growth_access (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_email TEXT UNIQUE NOT NULL,
  is_enabled BOOLEAN DEFAULT TRUE,
  blocked_reason TEXT NULL,
  admin_note TEXT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_by TEXT DEFAULT 'admin'
);

-- 4. Order Growth Access Table (order-based access control)
CREATE TABLE order_growth_access (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id INTEGER UNIQUE NOT NULL,
  order_number TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  is_growth_enabled BOOLEAN DEFAULT FALSE,
  usage_count INTEGER DEFAULT 0,
  max_usage INTEGER DEFAULT 1,
  enabled_at TIMESTAMP WITH TIME ZONE NULL,
  disabled_at TIMESTAMP WITH TIME ZONE NULL,
  enabled_by TEXT DEFAULT 'admin',
  notes TEXT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Growth System Usage Log (for analytics and tracking)
CREATE TABLE growth_system_usage (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_email TEXT NOT NULL,
  order_number TEXT NULL,
  child_name TEXT NOT NULL,
  child_age INTEGER NOT NULL,
  child_age_unit TEXT NOT NULL CHECK (child_age_unit IN ('months', 'years')),
  child_gender TEXT NOT NULL CHECK (child_gender IN ('male', 'female')),
  child_weight DECIMAL(5,2) NOT NULL,
  child_height DECIMAL(5,2) NOT NULL,
  report_generated BOOLEAN DEFAULT FALSE,
  usage_timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ip_address TEXT,
  user_agent TEXT
);

-- 6. System Activity Log (for admin monitoring)
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
CREATE INDEX idx_customer_growth_email ON customer_growth_access(customer_email);
CREATE INDEX idx_order_growth_order_id ON order_growth_access(order_id);
CREATE INDEX idx_order_growth_customer ON order_growth_access(customer_email);
CREATE INDEX idx_growth_usage_customer ON growth_system_usage(customer_email);
CREATE INDEX idx_growth_usage_timestamp ON growth_system_usage(usage_timestamp);
CREATE INDEX idx_activity_log_type ON system_activity_log(activity_type, created_at);

-- =====================================================
-- ROW LEVEL SECURITY (RLS) Policies
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE admin_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_growth_access ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_growth_access ENABLE ROW LEVEL SECURITY;
ALTER TABLE growth_system_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_activity_log ENABLE ROW LEVEL SECURITY;

-- Policy for admin_settings (allow read for everyone, write for authenticated)
CREATE POLICY "Allow read access to admin_settings" ON admin_settings
  FOR SELECT USING (true);

CREATE POLICY "Allow write access to admin_settings for authenticated users" ON admin_settings
  FOR ALL USING (auth.role() = 'authenticated');

-- Policy for admin_sessions (only allow access to own sessions)
CREATE POLICY "Allow access to own admin sessions" ON admin_sessions
  FOR ALL USING (true); -- We'll handle auth in application layer

-- Policy for customer_growth_access (read for everyone, write for authenticated)
CREATE POLICY "Allow read access to customer_growth_access" ON customer_growth_access
  FOR SELECT USING (true);

CREATE POLICY "Allow write access to customer_growth_access for authenticated users" ON customer_growth_access
  FOR ALL USING (auth.role() = 'authenticated');

-- Policy for order_growth_access (read for everyone, write for authenticated)
CREATE POLICY "Allow read access to order_growth_access" ON order_growth_access
  FOR SELECT USING (true);

CREATE POLICY "Allow write access to order_growth_access for authenticated users" ON order_growth_access
  FOR ALL USING (auth.role() = 'authenticated');

-- Policy for growth_system_usage (allow insert for everyone, read for authenticated)
CREATE POLICY "Allow insert to growth_system_usage" ON growth_system_usage
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow read access to growth_system_usage for authenticated users" ON growth_system_usage
  FOR SELECT USING (auth.role() = 'authenticated');

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
ALTER PUBLICATION supabase_realtime ADD TABLE admin_sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE customer_growth_access;
ALTER PUBLICATION supabase_realtime ADD TABLE order_growth_access;

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

CREATE TRIGGER update_customer_growth_access_updated_at BEFORE UPDATE ON customer_growth_access
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_order_growth_access_updated_at BEFORE UPDATE ON order_growth_access
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
-- UTILITY VIEWS
-- =====================================================

-- View for active admin sessions
CREATE VIEW active_admin_sessions AS
SELECT 
    id,
    session_token,
    login_timestamp,
    session_duration,
    (login_timestamp + INTERVAL '1 millisecond' * session_duration) AS expires_at,
    CASE 
        WHEN (login_timestamp + INTERVAL '1 millisecond' * session_duration) > NOW() 
        THEN TRUE 
        ELSE FALSE 
    END AS is_valid
FROM admin_sessions 
WHERE is_active = TRUE;

-- View for customer growth statistics
CREATE VIEW customer_growth_statistics AS
SELECT 
    COUNT(*) AS total_customers,
    COUNT(*) FILTER (WHERE is_enabled = TRUE) AS enabled_customers,
    COUNT(*) FILTER (WHERE is_enabled = FALSE) AS blocked_customers,
    COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '30 days') AS new_this_month
FROM customer_growth_access;

-- View for order growth statistics
CREATE VIEW order_growth_statistics AS
SELECT 
    COUNT(*) AS total_orders,
    COUNT(*) FILTER (WHERE is_growth_enabled = TRUE) AS enabled_orders,
    COUNT(*) FILTER (WHERE is_growth_enabled = FALSE) AS disabled_orders,
    SUM(usage_count) AS total_usage,
    COUNT(*) FILTER (WHERE enabled_at >= NOW() - INTERVAL '30 days') AS enabled_this_month
FROM order_growth_access;
