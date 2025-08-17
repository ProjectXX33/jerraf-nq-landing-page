-- Add growth_system_usage table for tracking form submissions

CREATE TABLE IF NOT EXISTS growth_system_usage (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_email varchar(255) NOT NULL,
  order_number varchar(50) NOT NULL,
  child_name varchar(255) NOT NULL,
  child_age integer NOT NULL,
  child_age_unit varchar(10) NOT NULL,
  child_gender varchar(10) NOT NULL,
  child_weight numeric(5,2) NOT NULL,
  child_height numeric(5,2) NOT NULL,
  report_generated boolean DEFAULT true,
  usage_timestamp timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_growth_system_usage_customer_email ON growth_system_usage(customer_email);
CREATE INDEX IF NOT EXISTS idx_growth_system_usage_order_number ON growth_system_usage(order_number);
CREATE INDEX IF NOT EXISTS idx_growth_system_usage_timestamp ON growth_system_usage(usage_timestamp);

-- Enable RLS
ALTER TABLE growth_system_usage ENABLE ROW LEVEL SECURITY;

-- Create policies for growth_system_usage
DROP POLICY IF EXISTS "Allow read access to growth_system_usage" ON growth_system_usage;
CREATE POLICY "Allow read access to growth_system_usage" ON growth_system_usage
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow insert access to growth_system_usage" ON growth_system_usage;
CREATE POLICY "Allow insert access to growth_system_usage" ON growth_system_usage
  FOR INSERT WITH CHECK (true);

-- Add table to real-time publication (optional - only if you need real-time usage tracking)
-- ALTER PUBLICATION supabase_realtime ADD TABLE growth_system_usage;
