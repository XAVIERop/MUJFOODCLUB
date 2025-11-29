# Test Aisensy WhatsApp in Browser Console

## Quick Test (Copy & Paste This)

Copy and paste this entire block into your browser console:

```javascript
(async function testAisensy() {
  console.log('🧪 Testing Aisensy WhatsApp via Edge Function...');
  
  // Get Supabase config
  const supabaseUrl = import.meta.env?.VITE_SUPABASE_URL || window.location.origin.includes('localhost') 
    ? 'YOUR_SUPABASE_URL' // Replace with your actual Supabase URL
    : window.location.origin;
  const supabaseAnonKey = import.meta.env?.VITE_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY'; // Replace with your actual anon key
  
  // If using environment variables, try to get them from the app
  // Otherwise, you need to replace the values above
  
  const TEST_PHONE = '+919625851220'; // Your test number
  const cleanNumber = TEST_PHONE.replace(/[^0-9]/g, '');
  
  const testMessage = `🧪 *Test Message from MUJ Food Club*

This is a test message to verify Aisensy WhatsApp integration.

✅ If you receive this, the integration is working!

Time: ${new Date().toLocaleString('en-IN')}`;
  
  const edgeFunctionUrl = `${supabaseUrl}/functions/v1/send-whatsapp`;
  
  console.log('📡 Calling Edge Function:', edgeFunctionUrl);
  console.log('📱 Phone:', cleanNumber);
  
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
      console.log('✅ SUCCESS! Message sent');
      return { success: true, ...responseData };
    } else {
      console.error('❌ FAILED:', responseData.error);
      return { success: false, error: responseData.error };
    }
  } catch (error) {
    console.error('❌ Error:', error);
    return { success: false, error: error.message };
  }
})();
```

## Get Your Supabase Credentials

To get your Supabase URL and Anon Key:

1. Open your browser console
2. Type: `import.meta.env.VITE_SUPABASE_URL` and press Enter
3. Type: `import.meta.env.VITE_SUPABASE_ANON_KEY` and press Enter
4. Copy those values and replace `YOUR_SUPABASE_URL` and `YOUR_SUPABASE_ANON_KEY` in the test above

## Alternative: Check Network Tab

1. Open Developer Tools > Network tab
2. Place a test order or trigger WhatsApp notification
3. Look for a request to `/functions/v1/send-whatsapp`
4. Check the request/response to see what's happening

