# 🛡️ MAXIMUM SECURITY SETUP INSTRUCTIONS

## ⚠️ CRITICAL: API Key Migration

### Step 1: Add PrintNode API Keys to Supabase Edge Function Secrets

1. Go to **Supabase Dashboard** → Your Project → **Edge Functions** → **Settings**
2. Navigate to **Secrets** section
3. Add the following secrets (one by one):

```
PRINTNODE_API_KEY_DEFAULT=your-main-printnode-api-key
PRINTNODE_API_KEY_CHATKARA=1JE7Kj-YjoHCtN8-fyP1KeWtd7harHsiwsjP_b2uuaQ
PRINTNODE_API_KEY_PUNJABI_TADKA=h1eH0zGw6wni65llkoecd1a3k51uSdCWAJhYnL_De-A
PRINTNODE_API_KEY_MUNCHBOX=MBrJ7izrR8n9gTb5-RluWjjtxReJHShZA2Ay7luWnkQ
PRINTNODE_API_KEY_GRABIT=W9DlDvh1U7pzq65y6gXCyQHueRbcj5LEtGbh0DUXlkk
PRINTNODE_API_KEY_24_SEVEN_MART=your-24sevenmart-printnode-api-key
PRINTNODE_API_KEY_BANNAS_CHOWKI=oMh77mhbjVReZ0f29xihaMgtDd1IslQj0jyMyAeMhqs
PRINTNODE_API_KEY_AMOR=ok4BvG5yFrzRXfx4OZ08AVnwhhKehn4ZwoRu3O9iUXY
PRINTNODE_API_KEY_STARDOM=F9oYR_ArBi4UCBvVne7CuC7S4cGrOhZmXv2pQMvhbe0
PRINTNODE_API_KEY_PIZZA_BAKERS=lqcFxuYUnhlI4_B5q0eX30KrSZYBzAtvTCO6GzNRI0I
PRINTNODE_API_KEY_COOKHOUSE=n_Trl9Kw4OfgXa9cEQCWrg4eqytQOGwDZJr8wELH6Qc
PRINTNODE_API_KEY_FOODCOURT=TYqkDtkjFvRAfg5_zcR1nUE00Ou2zenJHG-9LpGqkkg
```

4. Also add Supabase service role key (for database access):
```
SUPABASE_URL=your-supabase-project-url
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### Step 2: Deploy the Secure PrintNode Edge Function

```bash
cd /Users/pv/MUJFOODCLUB
supabase functions deploy printnode-secure
```

### Step 3: Remove API Keys from Vercel (Frontend)

1. Go to **Vercel Dashboard** → Your Project → **Settings** → **Environment Variables**
2. **DELETE** all `VITE_PRINTNODE_*` variables:
   - VITE_PRINTNODE_API_KEY
   - VITE_CHATKARA_PRINTNODE_API_KEY
   - VITE_PUNJABI_TADKA_PRINTNODE_API_KEY
   - (etc. - all PrintNode keys)

3. **KEEP** only:
   - VITE_SUPABASE_URL
   - VITE_SUPABASE_ANON_KEY
   - VITE_GOOGLE_MAPS_API_KEY (this is OK - restrict in Google Cloud Console)

### Step 4: Update Frontend Code

The frontend code will be updated to call the Edge Function instead of using API keys directly.

---

## 🔒 Google Maps API Key Security

Even though Google Maps API key is in frontend, secure it:

1. Go to **Google Cloud Console** → **APIs & Services** → **Credentials**
2. Click on your API key
3. Under **Application restrictions**:
   - Select **HTTP referrers (web sites)**
   - Add: `https://mujfoodclub.in/*`
   - Add: `https://*.vercel.app/*` (for preview deployments)
4. Under **API restrictions**:
   - Select **Restrict key**
   - Enable only: **Maps JavaScript API**, **Places API**, **Geocoding API**
5. **Save**

---

## 🚦 Rate Limiting Setup

The Edge Function includes built-in rate limiting (60 requests/minute per IP).

To adjust:
- Edit `supabase/functions/printnode-secure/index.ts`
- Change `RATE_LIMIT_MAX` and `RATE_LIMIT_WINDOW` constants

---

## 📊 Security Monitoring

### Enable Supabase Audit Logs

Run this SQL in Supabase SQL Editor:

```sql
-- Enable audit logging for sensitive tables
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE cafes ENABLE ROW LEVEL SECURITY;

-- Create audit log table
CREATE TABLE IF NOT EXISTS security_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL,
  user_id UUID,
  ip_address TEXT,
  user_agent TEXT,
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX idx_security_audit_log_created_at ON security_audit_log(created_at DESC);
CREATE INDEX idx_security_audit_log_user_id ON security_audit_log(user_id);
CREATE INDEX idx_security_audit_log_event_type ON security_audit_log(event_type);
```

---

## ✅ Security Checklist

After implementation, verify:

- [ ] All PrintNode API keys removed from Vercel environment variables
- [ ] All PrintNode API keys added to Supabase Edge Function secrets
- [ ] `printnode-secure` Edge Function deployed
- [ ] Frontend updated to use Edge Function
- [ ] Google Maps API key restricted in Google Cloud Console
- [ ] Security headers active (check with browser DevTools → Network → Headers)
- [ ] Rate limiting working (test with multiple rapid requests)
- [ ] Audit logging enabled in database

---

## 🧪 Testing Security

### Test Rate Limiting:
```bash
# Send 70 requests rapidly (should fail after 60)
for i in {1..70}; do
  curl -X POST https://your-project.supabase.co/functions/v1/printnode-secure \
    -H "Authorization: Bearer YOUR_ANON_KEY" \
    -H "Content-Type: application/json" \
    -d '{"action":"list_printers","cafe_name":"Chatkara"}'
done
```

### Test API Key Security:
1. Open browser DevTools → Sources
2. Search for "PRINTNODE" or "API_KEY"
3. Should find NO API keys in frontend code

---

## 📞 Support

If you encounter issues:
1. Check Supabase Edge Function logs
2. Verify secrets are set correctly
3. Test Edge Function directly
4. Review browser console for errors

