# Quick Test - Copy & Paste This in Browser Console

## Step 1: Get Your Supabase URL

In browser console, type:
```javascript
import.meta.env.VITE_SUPABASE_URL
```
Copy the result (it should look like `https://xxxxx.supabase.co`)

## Step 2: Get Your Supabase Anon Key

In browser console, type:
```javascript
import.meta.env.VITE_SUPABASE_ANON_KEY
```
Copy the result

## Step 3: Run This Test (Replace YOUR_SUPABASE_URL and YOUR_ANON_KEY)

```javascript
(async function() {
  const supabaseUrl = 'YOUR_SUPABASE_URL'; // Replace with value from Step 1
  const supabaseAnonKey = 'YOUR_ANON_KEY'; // Replace with value from Step 2
  const testPhone = '+919625851220';
  const cleanNumber = testPhone.replace(/[^0-9]/g, '');
  
  const testMessage = `🧪 Test from MUJ Food Club\n\nTime: ${new Date().toLocaleString('en-IN')}`;
  
  console.log('📡 Testing Edge Function:', `${supabaseUrl}/functions/v1/send-whatsapp`);
  
  try {
    const response = await fetch(`${supabaseUrl}/functions/v1/send-whatsapp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseAnonKey}`,
        'apikey': supabaseAnonKey,
      },
      body: JSON.stringify({ phoneNumber: cleanNumber, message: testMessage })
    });
    
    const result = await response.json();
    console.log('✅ Status:', response.status);
    console.log('✅ Response:', result);
    
    if (response.ok && result.success) {
      console.log('🎉 SUCCESS! Check WhatsApp for message');
    } else {
      console.error('❌ FAILED:', result.error);
    }
  } catch (error) {
    console.error('❌ Error:', error);
  }
})();
```

## If Edge Function Not Deployed Yet

If you get a 404 error, the Edge Function hasn't been deployed. You need to:

1. Deploy the Edge Function first (see DEPLOY_AISENSY_EDGE_FUNCTION.md)
2. Or test by placing a real order - it will show the same error if not deployed

