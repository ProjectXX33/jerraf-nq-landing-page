// Test script for Custom Code System
// Run this in your browser console to test the custom code functionality

async function testCustomCode(code = 'ZM2020') {
  console.log('🧪 Testing Custom Code System...');
  console.log('Code to test:', code);
  
  try {
    // Test 1: Check if code exists
    console.log('\n📋 Test 1: Checking if code exists...');
    const response = await fetch('/api/test-custom-code', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'check',
        code: code
      })
    });
    
    if (response.ok) {
      const result = await response.json();
      console.log('✅ Code check result:', result);
    } else {
      console.log('❌ Code check failed:', response.status);
    }
    
    // Test 2: Try to use the code
    console.log('\n🔑 Test 2: Trying to use the code...');
    const useResponse = await fetch('/api/test-custom-code', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'use',
        code: code,
        customerEmail: 'test@example.com',
        customerName: 'Test User'
      })
    });
    
    if (useResponse.ok) {
      const useResult = await useResponse.json();
      console.log('✅ Code usage result:', useResult);
    } else {
      console.log('❌ Code usage failed:', useResponse.status);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Alternative: Direct Supabase test (if you have access)
async function testCustomCodeDirect(code = 'ZM2020') {
  console.log('🧪 Testing Custom Code System (Direct)...');
  
  // This requires the Supabase client to be available
  if (typeof supabase === 'undefined') {
    console.log('❌ Supabase client not available');
    return;
  }
  
  try {
    // Check if code exists
    const { data, error } = await supabase
      .from('custom_codes')
      .select('*')
      .eq('code', code.toUpperCase())
      .single();
    
    if (error) {
      console.log('❌ Error checking code:', error);
      return;
    }
    
    console.log('✅ Found code:', data);
    
    // Check if code is valid
    const isValid = data.is_active && 
                   (data.expires_at === null || new Date(data.expires_at) > new Date()) &&
                   data.current_usage < data.max_usage;
    
    console.log('✅ Code is valid:', isValid);
    console.log('📊 Usage:', `${data.current_usage}/${data.max_usage}`);
    
  } catch (error) {
    console.error('❌ Direct test failed:', error);
  }
}

// Run tests
console.log('🚀 Starting Custom Code Tests...');
console.log('Run testCustomCode("ZM2020") to test your specific code');
console.log('Run testCustomCodeDirect("ZM2020") for direct Supabase test');

// Auto-run test if code is provided
if (typeof window !== 'undefined' && window.location.search.includes('test=')) {
  const urlParams = new URLSearchParams(window.location.search);
  const testCode = urlParams.get('test');
  if (testCode) {
    console.log(`🧪 Auto-testing code: ${testCode}`);
    testCustomCode(testCode);
  }
}
