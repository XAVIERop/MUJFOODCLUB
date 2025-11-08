// src/utils/groceryImageMatcher.ts
// Direct mapping for grocery product images

import { getImageUrl } from './imageSource';

// No more manual mapping - using exact name matching only

/**
 * Get the ImageKit URL for a grocery product
 * Only shows images for products with EXACT matching names in ImageKit
 * Everything else falls back to default image
 */
export function getGroceryProductImage(productName: string, imageUrl?: string | null): string | null {
  // First priority: use image_url from database (SQL) if it's a valid URL
  // Check if imageUrl is a non-empty string that's not a default/placeholder path
  if (imageUrl && 
      imageUrl.trim() !== '' && 
      !imageUrl.includes('/menu_hero.png') &&
      (imageUrl.startsWith('http') || imageUrl.startsWith('https'))) {
    return imageUrl;
  }
  
  // Fallback: Try exact product name match with common extensions
  const extensions = ['webp', 'jpg', 'jpeg', 'png', 'avif'];
  
  for (const ext of extensions) {
    const fileName = `${productName}.${ext}`;
    const testUrl = getImageUrl(`/Grocery/Products/${fileName}`);
    
    if (testUrl) {
      console.log(`✅ Found exact match for: ${productName} -> ${fileName}`);
      return testUrl;
    }
  }
  
  // No exact match found - return null so UI can hide image entirely
  console.log(`❌ No exact match found for: ${productName} - no image will be shown`);
  return null;
}