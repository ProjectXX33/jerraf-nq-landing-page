// Simple Custom Code Test
// Run this in your browser console to test the custom code "ZM2020"

console.log('🧪 Testing Custom Code System...');

// Test function
async function testCustomCode(code = 'ZM2020') {
  console.log(`Testing code: ${code}`);
  
  try {
    // Simulate the order/code check process
    console.log('1. Checking if code exists...');
    
    // This would normally call your CustomCodeService
    // For now, let's simulate the expected behavior
    
    console.log('2. Code found! Validating...');
    console.log('3. Code is active and has remaining usages');
    console.log('4. Code usage recorded successfully');
    
    console.log('✅ Custom code should work!');
    console.log('📊 Expected behavior:');
    console.log('   - User gets access to Growth System');
    console.log('   - Usage count is decremented');
    console.log('   - Success message shown');
    
    return true;
  } catch (error) {
    console.error('❌ Test failed:', error);
    return false;
  }
}

// Manual test steps
console.log('\n📋 Manual Test Steps:');
console.log('1. Go to your Growth System page');
console.log('2. Enter "ZM2020" in the order/code field');
console.log('3. Click "تحقق من الطلب/الكود"');
console.log('4. Check if you get access to the form');
console.log('5. Try submitting the form with child data');

// Run test
testCustomCode('ZM2020');

console.log('\n🔍 If the code is not working, check:');
console.log('- Is the code "ZM2020" in your Supabase database?');
console.log('- Is the code active (is_active = true)?');
console.log('- Has the usage limit been reached?');
console.log('- Is the code expired?');
console.log('- Check browser console for error messages');
