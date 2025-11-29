# Deploy Aisensy WhatsApp Edge Function

## Problem
The Aisensy API doesn't allow direct browser calls due to CORS restrictions. We need to use a Supabase Edge Function to proxy the API call server-side.

## Solution
A Supabase Edge Function has been created at `supabase/functions/send-whatsapp/index.ts` that handles the Aisensy API calls server-side.

## Deployment Steps

### 1. Install Supabase CLI (if not already installed)
```bash
npm install -g supabase
```

### 2. Login to Supabase
```bash
supabase login
```

### 3. Link to your project
```bash
supabase link --project-ref your-project-ref
```
(Get your project ref from Supabase dashboard URL: `https://app.supabase.com/project/YOUR_PROJECT_REF`)

### 4. Set Environment Variables
Set these in your Supabase project dashboard under Settings > Edge Functions > Secrets:

- `AISENSY_API_KEY`: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4ZjlmYjkxNTZhZTgwMGQ1MzFhNWEzZSIsIm5hbWUiOiJGb29kIENsdWIgNzUwNSIsImFwcE5hbWUiOiJBaVNlbnN5IiwiY2xpZW50SWQiOiI2OGY5ZmI5MTU2YWU4MDBkNTMxYTVhMzkiLCJhY3RpdmVQbGFuIjoiRlJFRV9GT1JFVkVSIiwiaWF0IjoxNzYxMjEzMzI5fQ.vuy89L_rMu5jqcQpwQCcp-hlNWTh8M1psPXr5qUwu1s`
- `AISENSY_PHONE_NUMBER`: `919625851220`
- `AISENSY_API_BASE_URL`: `https://backend.aisensy.com` (optional, defaults to this)

Or set via CLI:
```bash
supabase secrets set AISENSY_API_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4ZjlmYjkxNTZhZTgwMGQ1MzFhNWEzZSIsIm5hbWUiOiJGb29kIENsdWIgNzUwNSIsImFwcE5hbWUiOiJBaVNlbnN5IiwiY2xpZW50SWQiOiI2OGY5ZmI5MTU2YWU4MDBkNTMxYTVhMzkiLCJhY3RpdmVQbGFuIjoiRlJFRV9GT1JFVkVSIiwiaWF0IjoxNzYxMjEzMzI5fQ.vuy89L_rMu5jqcQpwQCcp-hlNWTh8M1psPXr5qUwu1s"
supabase secrets set AISENSY_PHONE_NUMBER="919625851220"
supabase secrets set AISENSY_API_BASE_URL="https://backend.aisensy.com"
```

### 5. Deploy the Edge Function
```bash
supabase functions deploy send-whatsapp
```

### 6. Test the Function
After deployment, test it using the browser console script in `scripts/test_aisensy_whatsapp.js`:

```javascript
// In browser console
testAisensyViaEdgeFunction()
```

## Alternative: Manual Deployment via Supabase Dashboard

1. Go to your Supabase project dashboard
2. Navigate to Edge Functions
3. Click "Create a new function"
4. Name it `send-whatsapp`
5. Copy the content from `supabase/functions/send-whatsapp/index.ts`
6. Set the environment variables in Settings > Edge Functions > Secrets
7. Deploy

## Testing

Once deployed, the WhatsApp service will automatically use the Edge Function instead of direct API calls, avoiding CORS issues.

Test by placing a real order or using the test script in browser console.

