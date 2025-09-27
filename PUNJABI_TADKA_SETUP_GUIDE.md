# Punjabi Tadka Cafe Owner Setup Guide

## ✅ What's Already Done

### 1. Cafe Configuration
- **Cafe ID**: `6097276a-f9c2-4a1e-b95d-eda66b3f6cc3`
- **Cafe Name**: Punjabi Tadka
- **WhatsApp Phone**: `+91 9876543210` ✅
- **WhatsApp Enabled**: `true` ✅
- **WhatsApp Notifications**: `true` ✅

### 2. Database Setup
- Cafe record exists in database
- WhatsApp settings configured
- Ready for owner account creation

## 🔧 Manual Setup Required

### Step 1: Create Authentication Account

**Go to Supabase Dashboard → Authentication → Users → Add User**

**Account Details:**
- **Email**: `punjabitadka.owner@mujfoodclub.in`
- **Password**: `Punjabitadka@2024`
- **Email Confirmed**: ✅ (Check this box)
- **User Metadata**:
  ```json
  {
    "full_name": "Punjabi Tadka Owner",
    "cafe_name": "Punjabi Tadka"
  }
  ```

### Step 2: Add to Cafe Staff

**After the user is created, add them to cafe_staff table:**

```sql
INSERT INTO public.cafe_staff (
  user_id,
  cafe_id,
  role,
  is_active,
  created_at,
  updated_at
) VALUES (
  'USER_ID_FROM_STEP_1',
  '6097276a-f9c2-4a1e-b95d-eda66b3f6cc3',
  'owner',
  true,
  NOW(),
  NOW()
);
```

### Step 3: Verify Setup

**Check the complete setup:**

```sql
SELECT 
  p.email,
  p.full_name,
  p.user_type,
  c.name as cafe_name,
  c.whatsapp_phone,
  c.whatsapp_enabled,
  cs.role,
  cs.is_active
FROM public.profiles p
JOIN public.cafe_staff cs ON p.id = cs.user_id
JOIN public.cafes c ON cs.cafe_id = c.id
WHERE p.email = 'punjabitadka.owner@mujfoodclub.in';
```

## 📱 WhatsApp Configuration

### Current Settings
- **Phone Number**: `+91 9876543210`
- **Enabled**: `true`
- **Notifications**: `true`

### Testing WhatsApp
1. Place a test order in Punjabi Tadka
2. Check if WhatsApp message is sent to `+91 9876543210`
3. Verify message format and content

## 🔐 Login Credentials

**For Punjabi Tadka Owner:**
- **Email**: `punjabitadka.owner@mujfoodclub.in`
- **Password**: `Punjabitadka@2024`
- **Role**: Cafe Owner
- **Access**: POS Dashboard, Order Management, WhatsApp Notifications

## 📋 Complete Setup Checklist

- [x] Cafe exists in database
- [x] WhatsApp phone number set
- [x] WhatsApp enabled
- [x] WhatsApp notifications enabled
- [ ] Authentication account created
- [ ] Profile created (automatic on first login)
- [ ] Added to cafe_staff table
- [ ] Test login
- [ ] Test WhatsApp notifications

## 🚀 Next Steps

1. **Create the authentication account** in Supabase Dashboard
2. **Add to cafe_staff table** with owner role
3. **Test login** with the credentials
4. **Test WhatsApp notifications** by placing an order
5. **Verify POS dashboard access**

## 📞 Support

If you need help with any step, the setup is straightforward:
1. Create auth user in Supabase
2. Add to cafe_staff table
3. Test the complete flow

The system will automatically create the profile when they first sign in.
