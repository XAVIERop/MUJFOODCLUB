# Cook House Queries to Re-run After Database Restore

## Main Menu Update
Run this comprehensive script that contains all Cook House menu updates:
- **File**: `update_cook_house_menu_complete.sql`
- **Size**: 18,615 bytes
- **Contains**: All menu item updates from the 12 hours of work

## Individual Updates (if needed)

### 1. Soup Variants
- **File**: `fix_cook_house_soups_only.sql`
- **Purpose**: Split Manchaw Soup and Hot'n'sour into Veg/Non-veg variants

### 2. Keema Pao Variants
- **File**: `fix_keema_pao_variants.sql`
- **Purpose**: Split into Chicken/Mutton variants

### 3. Pizza Variants
- **File**: `fix_pizza_variants.sql`
- **Purpose**: Split into Regular/Medium variants

### 4. Momos and Variants
- **File**: `fix_momos_and_variants.sql`
- **Purpose**: Split into Dry/Gravy variants

### 5. Pasta Variants
- **File**: `fix_pasta_variants.sql`
- **Purpose**: Split into Veg/Non-veg variants

### 6. Bread Variants
- **File**: `fix_breads_plain_butter_variants.sql`
- **Purpose**: Split into Plain/Butter variants

### 7. Price Updates
- **File**: `add_curd_drink.sql` - Add Curd (₹70)
- **File**: `update_soft_drink_prices.sql` - Set soft drinks to ₹20
- **File**: `update_special_naan_prices.sql` - Update Cheese Naan, etc.
- **File**: `update_curd_rice_price.sql` - Set Curd Rice to ₹210

### 8. Dal Updates
- **File**: `fix_dal_maharani_variants.sql` - Create Half/Full variants
- **File**: `move_dal_maharani_to_dal_darshan.sql` - Move to correct category

### 9. Clean Recreations
- **File**: `recreate_parathas_clean.sql` - Fix paratha duplicates
- **File**: `recreate_raita_clean.sql` - Clean raita items
- **File**: `recreate_papad_clean.sql` - Clean papad items

### 10. Veg/Non-veg Classification
- **File**: `update_veg_nonveg_classification.sql` - Classify all items
- **File**: `fix_soup_classification.sql` - Fix soup classification

## Order to Run
1. First run `update_cook_house_menu_complete.sql` (this might contain everything)
2. If not complete, run individual scripts in the order listed above
3. End with veg/non-veg classification scripts

## Notes
- All scripts are in the `/scripts/` directory
- Run them in Supabase SQL Editor
- Verify data after each major script
- The main comprehensive script might include all changes already

## Verification
After running scripts, check:
- Bread items have proper variants
- Soups are split into Veg/Non-veg
- Prices are correct
- No duplicate items exist
- Veg/Non-veg classification is accurate
