# 🔧 Hero Banner Cafe Images Fix

## Issue Identified
The hero banners were showing generic background images instead of cafe-specific images due to:
1. **Database Connection Issues**: 500 errors from Supabase due to RLS policy infinite recursion
2. **Incorrect Query Method**: HeroBannerSection was using direct table queries instead of the working RPC function

## Root Cause Analysis

### Database Issue
- **Error**: `infinite recursion detected in policy for relation "cafe_staff"`
- **Impact**: Direct table queries to `cafes` table were failing
- **Solution**: Use the working `get_cafes_ordered()` RPC function

### Query Method Issue
- **Problem**: HeroBannerSection was using `.from('cafes')` which triggered the RLS recursion
- **Solution**: Switch to `.rpc('get_cafes_ordered')` which works correctly

## Fixes Implemented

### 1. **Updated Database Query Method**
```typescript
// Before (causing 500 errors)
const { data, error } = await supabase
  .from('cafes')
  .select('id, name, description, image_url, rating, total_reviews, type, location, slug')
  .eq('is_active', true)
  .order('priority', { ascending: false })
  .limit(6);

// After (working solution)
const { data, error } = await supabase
  .rpc('get_cafes_ordered');
```

### 2. **Added Fallback Query**
```typescript
if (error) {
  console.error('Error fetching cafes:', error);
  // Fallback to direct table query if RPC fails
  const { data: fallbackData, error: fallbackError } = await supabase
    .from('cafes')
    .select('id, name, description, image_url, rating, total_reviews, type, location, slug')
    .eq('is_active', true)
    .order('priority', { ascending: true })
    .limit(6);
}
```

### 3. **Enhanced Debug Logging**
- Added logging for successful cafe fetching
- Added logging for banner creation process
- Added logging for current banner display
- Added logging for image URL resolution

### 4. **Updated Interface**
```typescript
interface Cafe {
  id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  rating: number | null;
  total_reviews: number | null;
  type: string;
  location: string;
  slug?: string | null;
  priority?: number | null;
  accepting_orders?: boolean;
}
```

## Test Results

### Database Connection Test
```bash
📊 Test 1: Direct table query
❌ Direct query error: infinite recursion detected in policy for relation "cafe_staff"

📊 Test 2: RPC function
✅ RPC query success: 21 cafes
First cafe: CHATKARA

📊 Test 3: Check total cafes
❌ Count query error: infinite recursion detected in policy for relation "cafe_staff"
```

### Expected Behavior
1. **RPC Function Works**: Returns 21 cafes successfully
2. **Cafe Images Load**: Each banner should show the respective cafe's card image
3. **Dynamic Content**: Banners rotate between MUJ Food Club and top 3 cafes
4. **Proper Navigation**: CTAs link to correct cafe menus

## Implementation Details

### Cafe Image Mapping
The system uses the same image mapping as `EnhancedCafeCard`:
- **Chatkara**: `/chatkara_card.png`
- **Dialog**: `/dialog_card.jpg`
- **Cook House**: `/cookhouse_card.png`
- **Food Court**: `/foodcourt_card.jpg`
- **Havmor**: `/havmor_card.jpg`
- **Fallback**: `/menu_hero.png`

### Banner Generation
```typescript
const cafeBanners: HeroBanner[] = cafes.slice(0, 3).map((cafe, index) => {
  const imageUrl = getCafeCardImage(cafe.name);
  console.log(`HeroBannerSection: Creating banner for ${cafe.name} with image: ${imageUrl}`);
  
  return {
    id: `cafe-${cafe.id}`,
    title: `Discover ${cafe.name}`,
    subtitle: cafe.description || `${cafe.name} - ${cafe.type}`,
    description: `Experience the best of ${cafe.name}. ${cafe.description || 'Delicious food, great atmosphere, perfect for students.'}`,
    ctaText: 'Order Now',
    ctaAction: `menu_${cafe.slug || cafe.id}`,
    backgroundColor: `bg-gradient-to-r from-blue-600 to-purple-700`,
    textColor: 'text-white',
    rating: cafe.rating || 4.5,
    ratingCount: cafe.total_reviews || 100,
    features: ['Fresh Food', 'Fast Service', 'Great Prices'],
    imageUrl: imageUrl,
    cafeId: cafe.id
  };
});
```

### Background Image Implementation
```typescript
style={{
  backgroundImage: currentBanner.imageUrl 
    ? `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url(${currentBanner.imageUrl})`
    : undefined,
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  backgroundRepeat: 'no-repeat'
}}
```

## Files Modified

- `src/components/HeroBannerSection.tsx` - Main implementation fixes
- `HERO_BANNER_CAFE_IMAGES_FIX.md` - This documentation

## Status

✅ **Database Connection**: Fixed using RPC function  
✅ **Cafe Data Fetching**: Working (21 cafes returned)  
✅ **Image Mapping**: Implemented with fallbacks  
✅ **Background Images**: CSS background implementation  
✅ **Debug Logging**: Added comprehensive logging  
✅ **Error Handling**: Added fallback queries  

## Next Steps

1. **Monitor Console**: Check browser console for debug messages
2. **Verify Images**: Ensure cafe card images are loading correctly
3. **Test Navigation**: Verify CTAs navigate to correct cafe menus
4. **Performance**: Monitor for any performance issues with image loading

The hero banners should now display cafe-specific images as backgrounds instead of generic images! 🎉
