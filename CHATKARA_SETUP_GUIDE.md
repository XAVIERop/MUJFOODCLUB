# 🏪 Chatkara Cafe Owner Setup Guide

## 📋 **Step-by-Step Setup**

### **Step 1: Create Auth User in Supabase Dashboard**

1. Go to **Supabase Dashboard → Authentication → Users**
2. Click **"Add User"**
3. Fill in the details:
   - **Email**: `chatkara.owner@mujfoodclub.in`
   - **Password**: `Chatkara1203!@#`
   - **Email Confirm**: ✅ **Check this box**
4. Click **"Create User"**
5. **Copy the User ID** (you'll need this)

### **Step 2: Run the Complete Setup Script**

1. Go to **Supabase Dashboard → SQL Editor**
2. Copy and paste the contents of `scripts/setup_chatkara_owner_complete.sql`
3. Click **"Run"**

This script will:
- ✅ Check if Chatkara cafe exists (create if not)
- ✅ Verify the auth user was created
- ✅ Create the profile with proper associations
- ✅ Verify everything is set up correctly

### **Step 3: Test the Account**

1. Go to your app's login page
2. Try logging in with:
   - **Email**: `chatkara.owner@mujfoodclub.in`
   - **Password**: `Chatkara1203!@#`
3. Verify you can access the cafe dashboard

## 🔍 **What the Script Does**

### **Creates Chatkara Cafe (if needed):**
```sql
INSERT INTO public.cafes (
  name: 'Chatkara',
  type: 'Cafe',
  description: 'Delicious snacks and beverages',
  location: 'MUJ Campus',
  phone: '+91-9876543210',
  hours: '8:00 AM - 10:00 PM',
  image_url: 'chatkara_logo.jpg',
  is_active: true
);
```

### **Creates Profile:**
```sql
INSERT INTO public.profiles (
  id: [auth_user_id],
  email: 'chatkara.owner@mujfoodclub.in',
  full_name: 'Chatkara Cafe Owner',
  user_type: 'cafe_owner',
  cafe_id: [chatkara_cafe_id],
  loyalty_points: 0,
  loyalty_tier: 'foodie',
  total_orders: 0,
  total_spent: 0,
  qr_code: 'CAFE_CHATKARA_OWNER_[user_id]'
);
```

## ✅ **Expected Results**

After running the script, you should see:
- ✅ Chatkara cafe exists in database
- ✅ Auth user created and confirmed
- ✅ Profile created with `user_type = 'cafe_owner'`
- ✅ Profile linked to Chatkara cafe
- ✅ Ready to login and access cafe dashboard

## 🧪 **Testing Checklist**

- [ ] Auth user created in Supabase Dashboard
- [ ] Script runs without errors
- [ ] Can login with `chatkara.owner@mujfoodclub.in`
- [ ] Profile loads with `user_type = 'cafe_owner'`
- [ ] Cafe dashboard is accessible
- [ ] Can see Chatkara-specific data

## 🚨 **If Something Goes Wrong**

### **Error: "User already exists"**
- The auth user was already created
- Continue to Step 2

### **Error: "Profile already exists"**
- The profile was already created
- Check if you can login

### **Error: "Cafe not found"**
- The script will create the cafe automatically
- This is normal if it's the first time

## 📞 **Need Help?**

If you encounter any issues:
1. Check the script output for error messages
2. Verify the auth user was created correctly
3. Make sure you're using the correct email format
4. Check that the password meets requirements

---

**Status**: ⏳ **Ready to Execute**  
**Next Action**: Run `setup_chatkara_owner_complete.sql` in Supabase Dashboard  
**Expected Result**: Fully functional Chatkara cafe owner account
