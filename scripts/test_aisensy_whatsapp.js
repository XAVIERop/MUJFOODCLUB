// Test script for Aisensy WhatsApp integration via Supabase Edge Function
// Run this in browser console to test

// Test phone number (replace with your test number)
const TEST_PHONE = '+919625851220'; // Replace with recipient number for testing

async function testAisensyViaEdgeFunction() {
  console.log('🧪 Testing Aisensy WhatsApp via Supabase Edge Function...');
  console.log('📱 To Number:', TEST_PHONE);
  
  // Get Supabase config from environment
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ Supabase URL or Anon Key not found in environment variables');
    console.log('   Make sure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set');
    return { success: false, error: 'Missing Supabase configuration' };
  }
  
  // Format phone number (remove + and spaces)
  const cleanNumber = TEST_PHONE.replace(/[^0-9]/g, '');
  
  // Test message
  const testMessage = `🧪 *Test Message from MUJ Food Club*

This is a test message to verify Aisensy WhatsApp integration via Edge Function.

✅ If you receive this, the integration is working!

Time: ${new Date().toLocaleString('en-IN')}`;
  
  const edgeFunctionUrl = `${supabaseUrl}/functions/v1/send-whatsapp`;
  
  console.log('📡 Calling Edge Function:', edgeFunctionUrl);
  console.log('📱 Request Body:', { phoneNumber: cleanNumber, messageLength: testMessage.length });
  
  try {
    const response = await fetch(edgeFunctionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseAnonKey}`,
        'apikey': supabaseAnonKey,
      },
      body: JSON.stringify({
        phoneNumber: cleanNumber,
        message: testMessage
      })
    });
    
    const responseData = await response.json();
    console.log('📱 Response Status:', response.status);
    console.log('📱 Response:', responseData);
    
    if (response.ok && responseData.success) {
      console.log('\n✅ SUCCESS! Message sent via Edge Function');
      console.log('📱 Message should be sent to:', TEST_PHONE);
      console.log('📡 Working endpoint:', responseData.endpoint);
      console.log('📋 Working format:', responseData.format);
      return { success: true, ...responseData };
    } else {
      console.error('\n❌ FAILED:', responseData.error || 'Unknown error');
      return { success: false, error: responseData.error };
    }
  } catch (error) {
    console.error('\n❌ Error calling Edge Function:', error);
    return { success: false, error: error.message };
  }
}

// Make it available globally in browser
if (typeof window !== 'undefined') {
  window.testAisensyViaEdgeFunction = testAisensyViaEdgeFunction;
  console.log('📋 Test function available! Run: testAisensyViaEdgeFunction()');
}

