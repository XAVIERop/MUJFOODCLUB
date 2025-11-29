// Copy and paste this ENTIRE block into browser console
// This test works without import.meta

(async function testAisensyWhatsApp() {
  console.log('🧪 Testing Aisensy WhatsApp via Edge Function...');
  
  // Method 1: Try to get Supabase URL from window or global scope
  // Method 2: Check if there's a way to access it from the app
  // Method 3: You'll need to manually enter your Supabase URL and key
  
  // Get Supabase URL - try multiple methods
  let supabaseUrl = null;
  let supabaseAnonKey = null;
  
  // Try to find it in the app's environment
  if (window.__SUPABASE_URL__) {
    supabaseUrl = window.__SUPABASE_URL__;
  }
  if (window.__SUPABASE_ANON_KEY__) {
    supabaseAnonKey = window.__SUPABASE_ANON_KEY__;
  }
  
  // If not found, you need to provide them manually
  if (!supabaseUrl || !supabaseAnonKey) {
    console.log('⚠️ Supabase config not found automatically.');
    console.log('📋 Please provide your Supabase URL and Anon Key:');
    console.log('   1. Go to your Supabase dashboard');
    console.log('   2. Go to Settings > API');
    console.log('   3. Copy "Project URL" and "anon public" key');
    console.log('');
    console.log('Then run:');
    console.log('   testAisensyWithConfig("YOUR_SUPABASE_URL", "YOUR_ANON_KEY")');
    
    // Make a function that accepts config
    window.testAisensyWithConfig = async function(url, key) {
      return await sendTestMessage(url, key);
    };
    
    return;
  }
  
  return await sendTestMessage(supabaseUrl, supabaseAnonKey);
  
  async function sendTestMessage(supabaseUrl, supabaseAnonKey) {
    const testPhone = '+919625851220';
    const cleanNumber = testPhone.replace(/[^0-9]/g, '');
    const testMessage = `🧪 *Test Message from MUJ Food Club*

This is a test to verify Aisensy WhatsApp integration.

✅ If you receive this, it's working!

Time: ${new Date().toLocaleString('en-IN')}`;
    
    const edgeFunctionUrl = `${supabaseUrl}/functions/v1/send-whatsapp`;
    
    console.log('📡 Calling Edge Function:', edgeFunctionUrl);
    console.log('📱 Phone Number:', cleanNumber);
    console.log('📝 Message Length:', testMessage.length);
    
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
      console.log('📱 Full Response:', JSON.stringify(responseData, null, 2));
      
      if (response.ok && responseData.success) {
        console.log('✅ SUCCESS! Message sent via Aisensy');
        console.log('📱 Check WhatsApp on:', testPhone);
        if (responseData.endpoint) {
          console.log('📡 Working endpoint:', responseData.endpoint);
        }
        return { success: true, ...responseData };
      } else {
        console.error('❌ FAILED:', responseData.error || 'Unknown error');
        console.log('💡 Troubleshooting:');
        if (response.status === 404) {
          console.log('   - Edge Function not deployed. Deploy it first.');
        } else if (response.status === 401) {
          console.log('   - Authentication failed. Check Supabase credentials.');
        } else if (response.status === 500) {
          console.log('   - Edge Function error. Check Supabase logs.');
        }
        return { success: false, error: responseData.error };
      }
    } catch (error) {
      console.error('❌ Network Error:', error);
      console.log('💡 This might be:');
      console.log('   - Edge Function not deployed');
      console.log('   - Wrong Supabase URL');
      console.log('   - Network connectivity issue');
      return { success: false, error: error.message };
    }
  }
})();

