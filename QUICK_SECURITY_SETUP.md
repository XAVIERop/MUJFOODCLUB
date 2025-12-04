# 🚀 QUICK SECURITY SETUP - Step by Step

## ⚠️ IMPORTANT: Your API keys are in this file - Keep it SECRET!

**DO NOT commit this file to Git!** The API keys you added should only be in Supabase secrets.

---

## Step 1: Add API Keys to Supabase Secrets (5 minutes)

1. **Go to Supabase Dashboard:**
   - Visit: https://supabase.com/dashboard
   - Select your **Food Club** project

2. **Navigate to Edge Functions Secrets:**
   - Click **Edge Functions** in left sidebar
   - Click **Settings** (gear icon)
   - Scroll to **Secrets** section

3. **Add Each API Key:**
   Click **"Add new secret"** for each one:

   ```
   Name: PRINTNODE_API_KEY_DEFAULT
   Value: [Your main key - check Vercel env vars]
   ```

   ```
   Name: PRINTNODE_API_KEY_CHATKARA
   Value: 1JE7Kj-YjoHCtN8-fyP1KeWtd7harHsiwsjP_b2uuaQ
   ```

   ```
   Name: PRINTNODE_API_KEY_PUNJABI_TADKA
   Value: h1eH0zGw6wni65llkoecd1a3k51uSdCWAJhYnL_De-A
   ```

   ```
   Name: PRINTNODE_API_KEY_MUNCHBOX
   Value: MBrJ7izrR8n9gTb5-RluWjjtxReJHShZA2Ay7luWnkQ
   ```

   ```
   Name: PRINTNODE_API_KEY_GRABIT
   Value: W9DlDvh1U7pzq65y6gXCyQHueRbcj5LEtGbh0DUXlkk
   ```

   ```
   Name: PRINTNODE_API_KEY_24_SEVEN_MART
   Value: [Check Vercel for this one]
   ```

   ```
   Name: PRINTNODE_API_KEY_BANNAS_CHOWKI
   Value: oMh77mhbjVReZ0f29xihaMgtDd1IslQj0jyMyAeMhqs
   ```

   ```
   Name: PRINTNODE_API_KEY_AMOR
   Value: ok4BvG5yFrzRXfx4OZ08AVnwhhKehn4ZwoRu3O9iUXY
   ```

   ```
   Name: PRINTNODE_API_KEY_STARDOM
   Value: F9oYR_ArBi4UCBvVne7CuC7S4cGrOhZmXv2pQMvhbe0
   ```

   ```
   Name: PRINTNODE_API_KEY_PIZZA_BAKERS
   Value: lqcFxuYUnhlI4_B5q0eX30KrSZYBzAtvTCO6GzNRI0I
   ```

   ```
   Name: PRINTNODE_API_KEY_COOKHOUSE
   Value: n_Trl9Kw4OfgXa9cEQCWrg4eqytQOGwDZJr8wELH6Qc
   ```

   ```
   Name: PRINTNODE_API_KEY_FOODCOURT
   Value: TYqkDtkjFvRAfg5_zcR1nUE00Ou2zenJHG-9LpGqkkg
   ```

4. **Add Supabase Service Role Key:**
   - Go to **Settings** → **API** → Copy **service_role** key (NOT anon key)
   - Add as secret:
   ```
   Name: SUPABASE_SERVICE_ROLE_KEY
   Value: [Your service role key]
   ```

   ```
   Name: SUPABASE_URL
   Value: [Your Supabase project URL - e.g., https://xxxxx.supabase.co]
   ```

---

## Step 2: Deploy the Edge Function (2 minutes)

Open terminal and run:

```bash
cd /Users/pv/MUJFOODCLUB
supabase functions deploy printnode-secure
```

**If you get "not logged in" error:**
```bash
supabase login
# Then try deploy again
```

**Verify deployment:**
- Go to Supabase Dashboard → Edge Functions
- You should see `printnode-secure` in the list

---

## Step 3: Remove API Keys from Vercel (3 minutes)

1. **Go to Vercel Dashboard:**
   - Visit: https://vercel.com/dashboard
   - Select your **MUJFOODCLUB** project

2. **Go to Settings → Environment Variables**

3. **DELETE these variables** (one by one):
   - ❌ `VITE_PRINTNODE_API_KEY`
   - ❌ `VITE_CHATKARA_PRINTNODE_API_KEY`
   - ❌ `VITE_PUNJABI_TADKA_PRINTNODE_API_KEY`
   - ❌ `VITE_MUNCHBOX_PRINTNODE_API_KEY`
   - ❌ `VITE_GRABIT_PRINTNODE_API_KEY`
   - ❌ `VITE_24_SEVEN_MART_PRINTNODE_API_KEY`
   - ❌ `VITE_BANNAS_CHOWKI_PRINTNODE_API_KEY`
   - ❌ `VITE_AMOR_PRINTNODE_API_KEY`
   - ❌ `VITE_STARDOM_PRINTNODE_API_KEY`
   - ❌ `VITE_PIZZA_BAKERS_PRINTNODE_API_KEY`
   - ❌ `VITE_COOKHOUSE_PRINTNODE_API_KEY`
   - ❌ `VITE_FOODCOURT_PRINTNODE_API_KEY`
   - ❌ `VITE_SHARED_PRINTNODE_API_KEY`

4. **KEEP these** (don't delete):
   - ✅ `VITE_SUPABASE_URL`
   - ✅ `VITE_SUPABASE_ANON_KEY`
   - ✅ `VITE_GOOGLE_MAPS_API_KEY`
   - ✅ Any other non-PrintNode variables

---

## Step 4: Update Frontend Code (I'll do this)

I'll update the frontend to use the secure Edge Function instead of direct API calls.

**After I update the code:**
1. Test locally
2. Commit and push
3. Vercel will auto-deploy

---

## Step 5: Test Everything (5 minutes)

1. **Test PrintNode connection:**
   - Go to POS Dashboard
   - Check if printers show as "Connected"
   - Try printing a test receipt

2. **Verify API keys are hidden:**
   - Open browser DevTools (F12)
   - Go to Sources tab
   - Search for "PRINTNODE" or "API_KEY"
   - Should find **NO API keys** in the code

3. **Test rate limiting:**
   - Try printing multiple times rapidly
   - Should work normally
   - (Rate limit is 60/min - unlikely to hit in normal use)

---

## ✅ Checklist

- [ ] All API keys added to Supabase secrets
- [ ] Edge Function deployed successfully
- [ ] All PrintNode keys removed from Vercel
- [ ] Frontend code updated (I'll do this)
- [ ] Tested printing - works correctly
- [ ] Verified API keys not in frontend code

---

## 🆘 If Something Breaks

**Printing stops working?**
1. Check Supabase Edge Function logs
2. Verify secrets are set correctly
3. Check browser console for errors
4. Test Edge Function directly

**Can't deploy Edge Function?**
```bash
# Make sure you're logged in
supabase login

# Check your project
supabase projects list

# Link to correct project if needed
supabase link --project-ref YOUR_PROJECT_REF
```

---

## 📝 Next Steps After Setup

Once everything works:
1. Delete API keys from `SECURITY_SETUP_INSTRUCTIONS.md` (replace with placeholders)
2. Commit the security improvements
3. Set up Google Maps API key restrictions (see guide)
4. Enable database audit logging (optional)

---

**Ready? Start with Step 1!** 🚀

