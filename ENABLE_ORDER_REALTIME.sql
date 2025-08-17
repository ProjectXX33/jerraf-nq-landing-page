-- =====================================================
-- ENABLE REAL-TIME FOR ORDER GROWTH ACCESS
-- =====================================================

-- 1. Check if order_growth_access table exists
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' AND table_name = 'order_growth_access';

-- 2. Create order_growth_access table if it doesn't exist
CREATE TABLE IF NOT EXISTS order_growth_access (
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

-- 3. Create customer_growth_access table if it doesn't exist
CREATE TABLE IF NOT EXISTS customer_growth_access (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_email TEXT UNIQUE NOT NULL,
  is_enabled BOOLEAN DEFAULT TRUE,
  blocked_reason TEXT NULL,
  admin_note TEXT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_by TEXT DEFAULT 'admin'
);

-- 4. Enable RLS on new tables
ALTER TABLE order_growth_access ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_growth_access ENABLE ROW LEVEL SECURITY;

-- 5. Create policies for order_growth_access (drop and recreate to avoid conflicts)
DROP POLICY IF EXISTS "Allow read access to order_growth_access" ON order_growth_access;
DROP POLICY IF EXISTS "Allow write access to order_growth_access for authenticated users" ON order_growth_access;

CREATE POLICY "Allow read access to order_growth_access" ON order_growth_access
  FOR SELECT USING (true);

CREATE POLICY "Allow write access to order_growth_access for authenticated users" ON order_growth_access
  FOR ALL USING (auth.role() = 'authenticated');

-- 6. Create policies for customer_growth_access (drop and recreate to avoid conflicts)
DROP POLICY IF EXISTS "Allow read access to customer_growth_access" ON customer_growth_access;
DROP POLICY IF EXISTS "Allow write access to customer_growth_access for authenticated users" ON customer_growth_access;

CREATE POLICY "Allow read access to customer_growth_access" ON customer_growth_access
  FOR SELECT USING (true);

CREATE POLICY "Allow write access to customer_growth_access for authenticated users" ON customer_growth_access
  FOR ALL USING (auth.role() = 'authenticated');

-- 7. Enable real-time for order and customer tables
ALTER PUBLICATION supabase_realtime ADD TABLE order_growth_access;
ALTER PUBLICATION supabase_realtime ADD TABLE customer_growth_access;

-- 8. Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_order_growth_order_id ON order_growth_access(order_id);
CREATE INDEX IF NOT EXISTS idx_order_growth_customer ON order_growth_access(customer_email);
CREATE INDEX IF NOT EXISTS idx_customer_growth_email ON customer_growth_access(customer_email);

-- 9. Add update triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop triggers if they exist and recreate
DROP TRIGGER IF EXISTS update_order_growth_access_updated_at ON order_growth_access;
DROP TRIGGER IF EXISTS update_customer_growth_access_updated_at ON customer_growth_access;

CREATE TRIGGER update_order_growth_access_updated_at 
  BEFORE UPDATE ON order_growth_access
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_customer_growth_access_updated_at 
  BEFORE UPDATE ON customer_growth_access
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 10. Verify real-time setup
SELECT 'Real-time enabled for:' as status;
SELECT schemaname, tablename 
FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime' 
AND tablename IN ('admin_settings', 'order_growth_access', 'customer_growth_access');
