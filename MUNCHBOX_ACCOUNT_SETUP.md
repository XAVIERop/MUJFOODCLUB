# 🍽️ Munch Box Cafe Owner Account Setup

## **Overview**
This guide will help you create a complete cafe owner account for Munch Box with all the functionalities like other cafe accounts.

## **Current Status**
✅ **Munch Box Cafe**: Exists in database with menu items  
✅ **Account Setup**: Ready to be created  
✅ **All Features**: Will have same functionalities as other cafes  

## **Munch Box Cafe Details**

### **Cafe Information**
- **Name**: Munch Box
- **Type**: Snacks & Sweets
- **Description**: Delicious snacks, sweets and fresh juices
- **Location**: Ground Floor, GHS
- **Phone**: +91 98765 43212
- **Hours**: 9:00 AM - 12:00 AM
- **Status**: Open and accepting orders
- **Priority**: 3 (exclusive cafe)
- **Menu Items**: 3 items (Pani Puri, Fresh Juice, Gulab Jamun)

## **Step-by-Step Setup**

### **Step 1: Create Auth User in Supabase**
1. Go to **Supabase Dashboard** → **Authentication** → **Users**
2. Click **"Add User"**
3. Enter the following details:
   - **Email**: `munchbox.owner@mujfoodclub.in`
   - **Password**: `MunchBox1203!@#`
   - **Email Confirm**: `true`
4. Click **"Create User"**
5. **Copy the User ID** (you'll need this for Step 2)

### **Step 2: Create Profile in Database**
1. Go to **Supabase Dashboard** → **SQL Editor**
2. Run the following script (replace `USER_ID_FROM_AUTH` with the actual user ID):

```sql
-- Create Munch Box Cafe Owner Profile
INSERT INTO public.profiles (
  id,
  email,
  full_name,
  user_type,
  cafe_id,
  loyalty_points,
  loyalty_tier,
  total_orders,
  total_spent,
  qr_code,
  created_at,
  updated_at
) VALUES (
  'USER_ID_FROM_AUTH', -- Replace with actual user ID from Step 1
  'munchbox.owner@mujfoodclub.in',
  'Munch Box Cafe Owner',
  'cafe_owner',
  (SELECT id FROM public.cafes WHERE name = 'Munch Box' LIMIT 1),
  0,
  'foodie',
  0,
  0,
  'CAFE_MUNCHBOX_OWNER',
  NOW(),
  NOW()
);
```

### **Step 3: Verify Account Creation**
Run this verification script:

```sql
-- Verify Munch Box account
SELECT 
  p.id,
  p.email,
  p.full_name,
  p.user_type,
  p.cafe_id,
  c.name as cafe_name,
  c.accepting_orders,
  c.priority,
  c.is_exclusive
FROM public.profiles p
LEFT JOIN public.cafes c ON p.cafe_id = c.id
WHERE p.email = 'munchbox.owner@mujfoodclub.in';
```

## **Login Credentials**

### **Munch Box Cafe Owner**
- **Email**: `munchbox.owner@mujfoodclub.in`
- **Password**: `MunchBox1203!@#`
- **Cafe**: Munch Box
- **Access**: Full cafe dashboard

## **Features Available**

### **✅ Order Management**
- View all Munch Box orders
- Accept, prepare, and deliver orders
- Real-time order updates
- Order status management

### **✅ Analytics Dashboard**
- Revenue tracking
- Order statistics
- Top selling items
- Performance metrics

### **✅ Real-time Notifications**
- Sound notifications for new orders
- WhatsApp integration (if configured)
- Live order updates

### **✅ Print Integration**
- KOT (Kitchen Order Ticket) printing
- Receipt printing
- PrintNode integration

### **✅ Data Export**
- CSV export of orders
- Analytics data export
- Performance reports

### **✅ QR Scanner**
- Student verification system
- Order validation
- Customer management

## **Testing the Account**

### **Test 1: Login**
1. Go to `/auth` → **Sign In**
2. Email: `munchbox.owner@mujfoodclub.in`
3. Password: `MunchBox1203!@#`
4. **Expected**: Redirected to cafe dashboard showing "Managing: Munch Box"

### **Test 2: Dashboard Access**
1. After login, you should see:
   - Munch Box orders
   - Analytics for Munch Box only
   - Print options for Munch Box
   - All Munch Box-specific data

### **Test 3: Data Isolation**
1. Verify you only see Munch Box data
2. No access to other cafes' data
3. All features work for Munch Box only

## **Current Cafe Owner Accounts**

| Cafe | Email | Status | Priority | Exclusive |
|------|-------|--------|----------|-----------|
| Chatkara | chatkara.owner@mujfoodclub.in | ✅ Active | 1 | ✅ Yes |
| Food Court | support@mujfoodclub.in | ✅ Active | 2 | ✅ Yes |
| Munch Box | munchbox.owner@mujfoodclub.in | 🔄 Setup | 3 | ✅ Yes |
| Punjabi Tadka | - | ❌ Not Created | 4 | ✅ Yes |
| Cook House | - | ❌ Not Created | 5 | ✅ Yes |
| Havmor | - | ❌ Not Created | 6 | ✅ Yes |
| China Town | - | ❌ Not Created | 7 | ✅ Yes |

## **Security Features**

### **✅ Data Isolation**
- Each cafe owner sees only their cafe's data
- No cross-cafe access
- Secure data separation

### **✅ Role-based Access**
- Only cafe owners can access dashboard
- Student accounts cannot access cafe features
- Clear permission boundaries

### **✅ Email Validation**
- Strict domain checking (`@mujfoodclub.in`)
- Pre-created accounts only
- No self-registration for cafe owners

## **Troubleshooting**

### **Issue: Cannot Login**
- Verify auth user was created correctly
- Check email and password
- Ensure profile was created in database

### **Issue: No Data Showing**
- Verify cafe_id is correctly set in profile
- Check if Munch Box cafe exists
- Ensure accepting_orders is true

### **Issue: Access Denied**
- Verify user_type is 'cafe_owner'
- Check if profile exists
- Ensure cafe association is correct

## **Next Steps**

1. **Create the auth user** in Supabase Dashboard
2. **Run the profile creation script** with the user ID
3. **Test the login** and dashboard access
4. **Verify all features** work correctly
5. **Configure additional settings** (WhatsApp, printing, etc.)

## **Support**

If you encounter any issues:
1. Check the verification scripts
2. Review the database logs
3. Ensure all steps were followed correctly
4. Contact support if needed

---

**🎉 Once setup is complete, Munch Box will have full cafe owner functionality just like Chatkara and Food Court!**
