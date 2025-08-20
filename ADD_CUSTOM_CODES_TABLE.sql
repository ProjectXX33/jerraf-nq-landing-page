-- =====================================================
-- Custom Codes Table for Growth System
-- =====================================================

-- 7. Custom Codes Table (for promotional/access codes)
CREATE TABLE custom_codes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  description TEXT NOT NULL,
  max_usage INTEGER NOT NULL DEFAULT 1,
  current_usage INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  expires_at TIMESTAMP WITH TIME ZONE NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by TEXT DEFAULT 'admin',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. Custom Code Usage Log (for tracking code usage)
CREATE TABLE custom_code_usage (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code_id UUID NOT NULL REFERENCES custom_codes(id) ON DELETE CASCADE,
  customer_email TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  used_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ip_address TEXT,
  user_agent TEXT
);

-- =====================================================
-- INDEXES for Custom Codes
-- =====================================================

CREATE INDEX idx_custom_codes_code ON custom_codes(code);
CREATE INDEX idx_custom_codes_active ON custom_codes(is_active, expires_at);
CREATE INDEX idx_custom_code_usage_code_id ON custom_code_usage(code_id);
CREATE INDEX idx_custom_code_usage_customer ON custom_code_usage(customer_email);

-- =====================================================
-- ROW LEVEL SECURITY (RLS) for Custom Codes
-- =====================================================

ALTER TABLE custom_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_code_usage ENABLE ROW LEVEL SECURITY;

-- Policy for custom_codes (read for everyone, write for authenticated)
CREATE POLICY "Allow read access to custom_codes" ON custom_codes
  FOR SELECT USING (true);

CREATE POLICY "Allow write access to custom_codes for authenticated users" ON custom_codes
  FOR ALL USING (auth.role() = 'authenticated');

-- Policy for custom_code_usage (allow insert for everyone, read for authenticated)
CREATE POLICY "Allow insert to custom_code_usage" ON custom_code_usage
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow read access to custom_code_usage for authenticated users" ON custom_code_usage
  FOR SELECT USING (auth.role() = 'authenticated');

-- =====================================================
-- REAL-TIME SUBSCRIPTIONS for Custom Codes
-- =====================================================

ALTER PUBLICATION supabase_realtime ADD TABLE custom_codes;
ALTER PUBLICATION supabase_realtime ADD TABLE custom_code_usage;

-- =====================================================
-- TRIGGERS for Custom Codes
-- =====================================================

-- Trigger to update updated_at for custom_codes
CREATE TRIGGER update_custom_codes_updated_at BEFORE UPDATE ON custom_codes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to validate custom code usage
CREATE OR REPLACE FUNCTION validate_custom_code_usage()
RETURNS TRIGGER AS $$
BEGIN
    -- Check if code exists and is active
    IF NOT EXISTS (
        SELECT 1 FROM custom_codes 
        WHERE id = NEW.code_id 
        AND is_active = TRUE 
        AND (expires_at IS NULL OR expires_at > NOW())
    ) THEN
        RAISE EXCEPTION 'Invalid or expired custom code';
    END IF;
    
    -- Check if usage limit exceeded
    IF EXISTS (
        SELECT 1 FROM custom_codes 
        WHERE id = NEW.code_id 
        AND current_usage >= max_usage
    ) THEN
        RAISE EXCEPTION 'Custom code usage limit exceeded';
    END IF;
    
    -- Increment usage count
    UPDATE custom_codes 
    SET current_usage = current_usage + 1 
    WHERE id = NEW.code_id;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for custom code usage validation
CREATE TRIGGER validate_custom_code_usage_trigger
    BEFORE INSERT ON custom_code_usage
    FOR EACH ROW EXECUTE FUNCTION validate_custom_code_usage();

-- =====================================================
-- UTILITY VIEWS for Custom Codes
-- =====================================================

-- View for custom code statistics
CREATE VIEW custom_code_statistics AS
SELECT 
    COUNT(*) AS total_codes,
    COUNT(*) FILTER (WHERE is_active = TRUE) AS active_codes,
    COUNT(*) FILTER (WHERE is_active = FALSE) AS inactive_codes,
    COUNT(*) FILTER (WHERE expires_at IS NOT NULL AND expires_at < NOW()) AS expired_codes,
    SUM(max_usage) AS total_max_usage,
    SUM(current_usage) AS total_current_usage,
    COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '30 days') AS created_this_month
FROM custom_codes;

-- View for custom code usage details
CREATE VIEW custom_code_usage_details AS
SELECT 
    cc.code,
    cc.description,
    cc.max_usage,
    cc.current_usage,
    cc.is_active,
    cc.expires_at,
    ccu.customer_email,
    ccu.customer_name,
    ccu.used_at
FROM custom_codes cc
LEFT JOIN custom_code_usage ccu ON cc.id = ccu.code_id
ORDER BY ccu.used_at DESC;
