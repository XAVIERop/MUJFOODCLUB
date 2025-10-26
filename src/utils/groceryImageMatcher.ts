// src/utils/groceryImageMatcher.ts
// Direct mapping for grocery product images

import { getImageUrl } from './imageSource';

// No more manual mapping - using exact name matching only

/**
 * Get the ImageKit URL for a grocery product
 * Only shows images for products with EXACT matching names in ImageKit
 * Everything else falls back to default image
 */
export function getGroceryProductImage(productName: string): string {
  // Try exact product name match with common extensions
  const extensions = ['webp', 'jpg', 'jpeg', 'png', 'avif'];
  
  for (const ext of extensions) {
    const fileName = `${productName}.${ext}`;
    const testUrl = getImageUrl(`/Grocery/Products/${fileName}`);
    
    if (testUrl) {
      console.log(`✅ Found exact match for: ${productName} -> ${fileName}`);
      return testUrl;
    }
  }
  
  // No exact match found - use default fallback
  console.log(`❌ No exact match found for: ${productName} - using default fallback`);
  return '/menu_hero.png';
}