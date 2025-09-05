# 🚀 Manual Migration Instructions

Since we can't run the automated migration script, please follow these steps to apply the cafe-specific loyalty system:

## 📋 **Step 1: Apply Database Migrations**

1. **Go to your Supabase Dashboard**
   - Visit: https://supabase.com/dashboard
   - Select your MUJFOODCLUB project

2. **Open SQL Editor**
   - Click on "SQL Editor" in the left sidebar
   - Click "New Query"

3. **Apply Migration 1: Cafe Loyalty System**
   - Copy the entire content from: `supabase/migrations/20250127000000_cafe_specific_loyalty_system.sql`
   - Paste it into the SQL Editor
   - Click "Run" to execute

4. **Apply Migration 2: Order Triggers**
   - Copy the entire content from: `supabase/migrations/20250127000001_cafe_loyalty_order_trigger.sql`
   - Paste it into the SQL Editor
   - Click "Run" to execute

## 📋 **Step 2: Initialize Existing Data**

After applying the migrations, run this query to initialize loyalty for existing users:

```sql
-- Initialize cafe loyalty for existing users
SELECT initialize_cafe_loyalty_for_existing_users();
```

## 📋 **Step 3: Test the System**

Run this query to test the new system:

```sql
-- Test loyalty level calculation
SELECT calculate_cafe_loyalty_level(3000) as level_for_3000;

-- Test discount calculation
SELECT get_cafe_loyalty_discount(2) as discount_for_level_2;

-- Check if tables were created
SELECT COUNT(*) as cafe_loyalty_points_count FROM cafe_loyalty_points;
SELECT COUNT(*) as cafe_loyalty_transactions_count FROM cafe_loyalty_transactions;
SELECT COUNT(*) as cafe_monthly_maintenance_count FROM cafe_monthly_maintenance;
```

## 📋 **Step 4: Verify Frontend**

1. **Start your development server** (if not already running):
   ```bash
   npm run dev
   ```

2. **Test the new rewards page**:
   - Visit: http://localhost:8081/rewards
   - You should see the new cafe-specific loyalty system

3. **Test checkout with loyalty**:
   - Go to any cafe menu
   - Add items to cart
   - Go to checkout
   - You should see cafe-specific loyalty discounts

## 🎯 **Expected Results**

After applying the migrations, you should see:

- ✅ New database tables created
- ✅ Functions working correctly
- ✅ Order completion triggers active
- ✅ Frontend showing cafe-specific loyalty
- ✅ Existing users have loyalty data initialized

## 🚨 **Troubleshooting**

If you encounter any issues:

1. **Check for errors in Supabase logs**
2. **Verify all functions were created successfully**
3. **Ensure RLS policies are working**
4. **Test with a sample user account**

## 📞 **Support**

If you need help with any step, let me know and I can guide you through the process!

---

**🎉 Once completed, your cafe-specific loyalty system will be fully operational!**
