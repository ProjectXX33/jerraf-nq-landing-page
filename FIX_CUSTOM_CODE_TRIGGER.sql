-- Fix for Custom Code Usage Trigger
-- This fixes the issue where codes can be used beyond their limit

-- Drop the existing trigger and function
DROP TRIGGER IF EXISTS validate_custom_code_usage_trigger ON custom_code_usage;
DROP FUNCTION IF EXISTS validate_custom_code_usage();

-- Create a more robust validation function
CREATE OR REPLACE FUNCTION validate_custom_code_usage()
RETURNS TRIGGER AS $$
DECLARE
    code_record RECORD;
BEGIN
    -- Get the current code state with a lock to prevent race conditions
    SELECT * INTO code_record 
    FROM custom_codes 
    WHERE id = NEW.code_id 
    FOR UPDATE;
    
    -- Check if code exists
    IF code_record IS NULL THEN
        RAISE EXCEPTION 'Custom code not found';
    END IF;
    
    -- Check if code is active
    IF NOT code_record.is_active THEN
        RAISE EXCEPTION 'Custom code is inactive';
    END IF;
    
    -- Check if code has expired
    IF code_record.expires_at IS NOT NULL AND code_record.expires_at <= NOW() THEN
        RAISE EXCEPTION 'Custom code has expired';
    END IF;
    
    -- Check if usage limit would be exceeded AFTER this usage
    IF code_record.current_usage >= code_record.max_usage THEN
        RAISE EXCEPTION 'Custom code usage limit exceeded (current: %, max: %)', 
            code_record.current_usage, code_record.max_usage;
    END IF;
    
    -- Increment usage count atomically
    UPDATE custom_codes 
    SET current_usage = current_usage + 1,
        updated_at = NOW()
    WHERE id = NEW.code_id;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Recreate the trigger
CREATE TRIGGER validate_custom_code_usage_trigger
    BEFORE INSERT ON custom_code_usage
    FOR EACH ROW EXECUTE FUNCTION validate_custom_code_usage();

-- Test the trigger (optional - you can run this to verify it works)
-- INSERT INTO custom_code_usage (code_id, customer_email, customer_name) 
-- VALUES ('your-code-id', 'test@example.com', 'Test User');
