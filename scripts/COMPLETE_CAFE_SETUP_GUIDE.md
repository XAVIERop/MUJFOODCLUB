# 🍽️ Complete Cafe Setup Guide - COOK HOUSE & MINI MEALS

## **📋 STEP-BY-STEP SETUP PROCESS**

### **STEP 1: Run Database Setup Scripts**

#### **1.1 Setup Cook House**
```sql
-- Run in Supabase Dashboard → SQL Editor
-- File: scripts/setup_cookhouse_complete.sql
```
This will:
- ✅ Create Cook House owner profile
- ✅ Assign owner to cafe_staff table
- ✅ Configure WhatsApp (+91 9116966635)
- ✅ Enable WhatsApp notifications

#### **1.2 Setup Mini Meals**
```sql
-- Run in Supabase Dashboard → SQL Editor
-- File: scripts/setup_minimeals_complete.sql
```
This will:
- ✅ Create Mini Meals owner profile
- ✅ Assign owner to cafe_staff table
- ⚠️ Configure WhatsApp (NEEDS PHONE NUMBER)
- ✅ Enable WhatsApp notifications

### **STEP 2: Create Auth Users**

#### **2.1 Cook House Owner**
1. Go to **Supabase Dashboard → Authentication → Users**
2. Click **"Add User"**
3. Enter:
   - **Email**: `cookhouse.owner@mujfoodclub.in`
   - **Password**: `CookHouse2024!@#`
   - **Email Confirm**: `true`
4. Click **"Create User"**
5. **Copy the User ID** (you'll need this)

#### **2.2 Mini Meals Owner**
1. Go to **Supabase Dashboard → Authentication → Users**
2. Click **"Add User"**
3. Enter:
   - **Email**: `minimeals.owner@mujfoodclub.in`
   - **Password**: `MiniMeals2024!@#`
   - **Email Confirm**: `true`
4. Click **"Create User"**
5. **Copy the User ID** (you'll need this)

### **STEP 3: Update Profiles with Auth User IDs**

```sql
-- Run in Supabase Dashboard → SQL Editor
-- Replace AUTH_USER_ID with actual IDs from Step 2

-- Update Cook House owner
UPDATE public.profiles 
SET id = 'AUTH_USER_ID_FROM_COOKHOUSE' -- Replace with actual ID
WHERE email = 'cookhouse.owner@mujfoodclub.in';

-- Update Mini Meals owner
UPDATE public.profiles 
SET id = 'AUTH_USER_ID_FROM_MINIMEALS' -- Replace with actual ID
WHERE email = 'minimeals.owner@mujfoodclub.in';
```

### **STEP 4: Configure Mini Meals WhatsApp**

```sql
-- Run in Supabase Dashboard → SQL Editor
-- Replace +91 XXXXXXXXXX with actual Mini Meals owner phone number

UPDATE public.cafes 
SET whatsapp_phone = '+91 XXXXXXXXXX' -- Replace with actual phone number
WHERE name = 'Mini Meals';
```

### **STEP 5: Test Setup**

#### **5.1 Verify Database Setup**
```sql
-- Run in Supabase Dashboard → SQL Editor
-- File: scripts/test_whatsapp_both_cafes.sql
```

#### **5.2 Test Login**
1. Go to `https://mujfoodclub.in/auth`
2. **Cook House Owner**:
   - Email: `cookhouse.owner@mujfoodclub.in`
   - Password: `CookHouse2024!@#`
3. **Mini Meals Owner**:
   - Email: `minimeals.owner@mujfoodclub.in`
   - Password: `MiniMeals2024!@#`

#### **5.3 Test WhatsApp Notifications**
1. Place test orders at both cafes
2. Check WhatsApp numbers for notifications:
   - **Cook House**: `+91 9116966635`
   - **Mini Meals**: `+91 [YOUR_PHONE_NUMBER]`

## **📱 EXPECTED WHATSAPP MESSAGE FORMAT**

```
🍽️ MUJ Food Club - New Order Alert!

📋 Order: #ORD-1234567890
👤 Customer: Test Customer
📱 Phone: +91 98765 43210
📍 Block: B1
💰 Total: ₹450
⏰ Time: 4:30 PM, Mon 15, 2024

📝 Items:
• Cook House Special x1 - ₹300
• Soft Drink x1 - ₹50
• Dessert x1 - ₹100

🔗 Full Dashboard: https://mujfoodclub.in/pos-dashboard
```

## **✅ COMPLETION CHECKLIST**

### **Cook House:**
- [ ] Database profile created
- [ ] Auth user created
- [ ] Profile linked to auth user
- [ ] WhatsApp configured (+91 9116966635)
- [ ] Owner can login
- [ ] WhatsApp notifications working

### **Mini Meals:**
- [ ] Database profile created
- [ ] Auth user created
- [ ] Profile linked to auth user
- [ ] WhatsApp phone number added
- [ ] Owner can login
- [ ] WhatsApp notifications working

## **🔧 TROUBLESHOOTING**

### **If Login Fails:**
1. Check if auth user was created correctly
2. Verify profile is linked to correct auth user ID
3. Check email/password spelling

### **If WhatsApp Doesn't Work:**
1. Check phone number format (+91 XXXXXXXXXX)
2. Verify whatsapp_enabled = true
3. Check browser console for errors
4. Test with Cook House first (known working number)

### **If Dashboard Doesn't Load:**
1. Check user_type = 'cafe_owner'
2. Verify cafe_id is correct
3. Check RLS policies

## **📞 SUPPORT**

If you encounter issues:
1. Check the verification queries
2. Review browser console logs
3. Test with Cook House first (fully configured)
4. Contact admin for assistance

---

**🎉 Once completed, both cafes will be fully operational with WhatsApp notifications!**
