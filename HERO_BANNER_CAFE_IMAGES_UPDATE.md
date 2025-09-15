# 🎨 Hero Banner Cafe Images Update

## Overview
Updated the homepage hero banners to use actual cafe card images as backgrounds instead of generic backgrounds, creating a more personalized and visually appealing experience.

## Changes Made

### 1. **Dynamic Cafe Data Integration**
- Added Supabase integration to fetch real cafe data
- Added `Cafe` interface matching the database schema
- Implemented `useEffect` to fetch cafes on component mount

### 2. **Cafe Image Mapping**
- Integrated the same cafe image mapping system used in `EnhancedCafeCard`
- Maps cafe names to their respective card images (e.g., `/chatkara_card.png`, `/dialog_card.jpg`)
- Fallback to `/menu_hero.png` for cafes without specific images

### 3. **Dynamic Hero Banner Creation**
- Modified `createHeroBanners()` function to generate banners from real cafe data
- Creates cafe-specific banners for top 3 cafes by priority
- Maintains the default MUJ Food Club banner as the first banner
- Each cafe banner includes:
  - Cafe name and description
  - Real ratings and review counts
  - Cafe-specific CTA actions
  - Cafe card image as background

### 4. **Background Image Implementation**
- Updated banner container to use cafe images as CSS background images
- Added dark overlay (`rgba(0, 0, 0, 0.4)`) for text readability
- Removed the separate image placeholder section
- Applied proper background sizing (`cover`, `center`, `no-repeat`)

### 5. **Enhanced CTA Handling**
- Updated `handleCtaClick()` to handle cafe-specific navigation
- Added support for `menu_${cafeId}` action format
- Maintains existing functionality for generic actions

### 6. **Loading State**
- Added loading state while fetching cafe data
- Shows placeholder banner during data fetch
- Prevents rendering issues with empty cafe data

## Technical Implementation

### Cafe Data Fetching
```typescript
const { data, error } = await supabase
  .from('cafes')
  .select('id, name, description, image_url, rating, total_reviews, type, location, slug')
  .eq('is_active', true)
  .order('priority', { ascending: false })
  .limit(6);
```

### Background Image Styling
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

### Cafe Banner Generation
```typescript
const cafeBanners: HeroBanner[] = cafes.slice(0, 3).map((cafe, index) => ({
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
  imageUrl: getCafeCardImage(cafe.name),
  cafeId: cafe.id
}));
```

## Benefits

1. **Visual Appeal**: Each banner now showcases the actual cafe's visual identity
2. **Personalization**: Dynamic content based on real cafe data
3. **Consistency**: Uses the same image mapping system as cafe cards
4. **Performance**: Efficient data fetching with proper loading states
5. **Maintainability**: Single source of truth for cafe images

## Files Modified

- `src/components/HeroBannerSection.tsx` - Main implementation
- `HERO_BANNER_CAFE_IMAGES_UPDATE.md` - This documentation

## Testing

The implementation includes:
- Loading state handling
- Error handling for failed API calls
- Fallback images for cafes without specific images
- Proper navigation for cafe-specific CTAs

## Next Steps

1. Test with actual cafe data to ensure proper image display
2. Consider adding image optimization for better performance
3. Add transition effects between different cafe banners
4. Consider adding more dynamic content based on cafe data (e.g., popular items, special offers)
