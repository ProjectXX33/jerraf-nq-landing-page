// Debug Custom Code Database State
// Run this in your browser console to check the database state

console.log('🔍 Debugging Custom Code Database State...');

// Test function to check database state
async function debugCustomCode(code = 'ZM') {
  console.log(`🔍 Checking code: ${code}`);
  
  try {
    // Import the supabase client
    const { createClient } = await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2');
    
    // You'll need to replace these with your actual Supabase credentials
    const supabaseUrl = 'YOUR_SUPABASE_URL';
    const supabaseKey = 'YOUR_SUPABASE_ANON_KEY';
    
    if (supabaseUrl === 'YOUR_SUPABASE_URL') {
      console.log('❌ Please update the Supabase credentials in this script');
      return;
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Get the custom code
    const { data: customCode, error } = await supabase
      .from('custom_codes')
      .select('*')
      .eq('code', code)
      .single();
    
    if (error) {
      console.error('❌ Error fetching custom code:', error);
      return;
    }
    
    console.log('📊 Custom Code State:', {
      code: customCode.code,
      current_usage: customCode.current_usage,
      max_usage: customCode.max_usage,
      is_active: customCode.is_active,
      expires_at: customCode.expires_at,
      can_use: customCode.current_usage < customCode.max_usage,
      remaining: customCode.max_usage - customCode.current_usage
    });
    
    // Get usage history
    const { data: usageHistory, error: usageError } = await supabase
      .from('custom_code_usage')
      .select('*')
      .eq('code_id', customCode.id)
      .order('used_at', { ascending: false });
    
    if (usageError) {
      console.error('❌ Error fetching usage history:', usageError);
      return;
    }
    
    console.log('📋 Usage History:', {
      total_uses: usageHistory.length,
      recent_uses: usageHistory.slice(0, 5).map(u => ({
        customer_email: u.customer_email,
        used_at: u.used_at
      }))
    });
    
  } catch (error) {
    console.error('❌ Exception:', error);
  }
}

// Manual test steps
console.log('\n📋 Manual Debug Steps:');
console.log('1. Update the Supabase credentials in this script');
console.log('2. Run: debugCustomCode("ZM")');
console.log('3. Check the console output for database state');

// Run test
// debugCustomCode('ZM');
