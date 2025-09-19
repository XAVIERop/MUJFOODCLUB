# Regenerate TypeScript Types After Rewards Cleanup

After running the database cleanup script, you need to regenerate the TypeScript types to remove the rewards-related references.

## Steps:

1. **Run the database cleanup script first:**
   ```sql
   -- Run scripts/complete_rewards_cleanup.sql in Supabase SQL Editor
   ```

2. **Regenerate TypeScript types:**
   ```bash
   # In your project root
   npx supabase gen types typescript --project-id YOUR_PROJECT_ID > src/integrations/supabase/types.ts
   ```

3. **Or use the Supabase CLI:**
   ```bash
   supabase gen types typescript --local > src/integrations/supabase/types.ts
   ```

4. **Verify the types file:**
   - Check that rewards-related tables are removed
   - Check that rewards-related columns are removed from profiles
   - Check that only core enums remain
   - Check that points_earned and points_credited remain in orders table

## What should be removed from types:
- `loyalty_transactions` table
- `tier_maintenance` table  
- `user_bonuses` table
- `maintenance_periods` table
- `loyalty_points`, `loyalty_tier`, `tier_expiry_date`, etc. from profiles
- `loyalty_tier` enum
- Rewards-related functions

## What should remain:
- Core tables: `profiles`, `orders`, `order_items`, `menu_items`, `cafes`, `cafe_staff`, `order_notifications`
- `points_earned` and `points_credited` in orders table (for compatibility)
- Core enums: `order_status`, `order_type`, etc.
