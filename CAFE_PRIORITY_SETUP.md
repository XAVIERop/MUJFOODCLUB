# Cafe Priority System Setup

This document explains how to implement the cafe priority system to ensure Chatkara appears first and Food Court appears second on both the homepage and in the "all cafes" section.

## What This System Does

The priority system ensures that:
1. **Chatkara** appears first (Priority 1)
2. **Food Court** appears second (Priority 2)  
3. All other cafes are ordered by rating, then by name
4. The ordering is consistent across homepage, cafe grid, and all cafes page

## Implementation Steps

### Step 1: Run the SQL Script

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Navigate to **SQL Editor**
3. Copy and paste the contents of `scripts/add_cafe_priority_system.sql`
4. Click **Run** to execute the script

### Step 2: Verify the Implementation

After running the SQL script, you can verify it worked by:

1. Going to **Table Editor** → **cafes**
2. Check that a new `priority` column exists
3. Verify that:
   - Chatkara has `priority = 1`
   - Food Court has `priority = 2`
   - All other cafes have `priority = 999`

### Step 3: Test the Function

In the SQL Editor, run:
```sql
SELECT * FROM get_cafes_ordered() LIMIT 5;
```

You should see:
1. Chatkara (Priority 1)
2. Food Court (Priority 2)
3. Other cafes ordered by rating

## How It Works

### Database Function: `get_cafes_ordered()`

This function returns cafes in the correct order:
1. **Priority ASC** - Featured cafes first (1, 2, 3...)
2. **Rating DESC** - Higher rated cafes next
3. **Total Ratings DESC** - More popular cafes next
4. **Name ASC** - Alphabetical fallback

### Frontend Changes

The following components now use the priority-based ordering:
- `src/pages/Index.tsx` - Homepage
- `src/components/CafeGrid.tsx` - Featured cafe grid
- `src/pages/Cafes.tsx` - All cafes page
- `src/components/CafeIconGrid.tsx` - Cafe icon grid
- `src/components/HeroSection.tsx` - Search functionality

## Customizing Priorities

To change cafe priorities, update the `priority` column in the `cafes` table:

```sql
-- Set a cafe to priority 3 (third position)
UPDATE public.cafes 
SET priority = 3 
WHERE name = 'Cafe Name';

-- Set a cafe to priority 4 (fourth position)
UPDATE public.cafes 
SET priority = 4 
WHERE name = 'Another Cafe';
```

## Troubleshooting

### If cafes don't appear in the right order:

1. Check that the `priority` column exists
2. Verify the `get_cafes_ordered()` function exists
3. Check browser console for any errors
4. Ensure the frontend is calling the RPC function correctly

### If you get database errors:

1. Make sure you have the correct permissions
2. Check that the cafes table exists
3. Verify the function syntax is correct

## Testing

Use the test script `scripts/test_cafe_priority.js` to verify everything is working:

1. Update the Supabase credentials in the script
2. Run: `node scripts/test_cafe_priority.js`
3. Check the output for any errors

## Expected Result

After implementation:
- **Homepage**: Chatkara first, Food Court second, then others by rating
- **All Cafes**: Same ordering as homepage
- **Search**: Cafes appear in priority order
- **Consistent**: Same ordering across all pages

## Revenue Impact

This system supports your pricing structure:
- **Priority 1**: Chatkara (₹8000/month)
- **Priority 2**: Food Court (₹7500/month)  
- **Priority 3**: Third featured cafe (₹7000/month)
- **Priority 4**: Fourth featured cafe (₹6500/month)
- **Priority 5**: Fifth featured cafe (₹6000/month)
- **Others**: Standard pricing based on features
