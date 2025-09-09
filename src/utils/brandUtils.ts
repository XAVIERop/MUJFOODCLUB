// Utility functions for brand management in Food Court

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  preparation_time: number;
  is_available: boolean;
  out_of_stock: boolean;
  is_vegetarian: boolean;
}

// Brand mapping based on category prefixes
export const BRAND_CATEGORY_MAP: Record<string, string> = {
  'GOBBLERS': 'gobblers',
  'MOMO STREET': 'momo-street', 
  'MOMO-STREET': 'momo-street',
  'KRISPP': 'krispp',
  'WAFFLES': 'waffles-more',
  'WAFFLES & MORE': 'waffles-more',
  'MONGINIS': 'monginis',
  'TATA BISTRO': 'tata-bistro'
};

/**
 * Extract brand name from menu item category
 * @param category - Menu item category (e.g., "GOBBLERS - Beverages")
 * @returns Brand ID or null if not found
 */
export function extractBrandFromCategory(category: string): string | null {
  const upperCategory = category.toUpperCase();
  
  for (const [brandName, brandId] of Object.entries(BRAND_CATEGORY_MAP)) {
    if (upperCategory.startsWith(brandName)) {
      return brandId;
    }
  }
  
  return null;
}

/**
 * Filter menu items by brand
 * @param items - Array of menu items
 * @param brandId - Brand ID to filter by (null for all brands)
 * @returns Filtered menu items
 */
export function filterMenuItemsByBrand(items: MenuItem[], brandId: string | null): MenuItem[] {
  if (!brandId) {
    return items;
  }
  
  return items.filter(item => {
    const itemBrand = extractBrandFromCategory(item.category);
    return itemBrand === brandId;
  });
}

/**
 * Count menu items by brand
 * @param items - Array of menu items
 * @returns Object with brand counts
 */
export function getBrandItemCounts(items: MenuItem[]): Record<string, number> {
  const counts: Record<string, number> = {
    'all': items.length,
    'gobblers': 0,
    'momo-street': 0,
    'krispp': 0,
    'waffles-more': 0,
    'monginis': 0,
    'tata-bistro': 0
  };
  
  items.forEach(item => {
    const brand = extractBrandFromCategory(item.category);
    if (brand && counts.hasOwnProperty(brand)) {
      counts[brand]++;
    }
  });
  
  return counts;
}

/**
 * Get unique categories for a specific brand
 * @param items - Array of menu items
 * @param brandId - Brand ID
 * @returns Array of unique categories for the brand
 */
export function getBrandCategories(items: MenuItem[], brandId: string | null): string[] {
  if (!brandId) {
    // Return all unique categories
    return Array.from(new Set(items.map(item => item.category)));
  }
  
  const brandItems = filterMenuItemsByBrand(items, brandId);
  return Array.from(new Set(brandItems.map(item => item.category)));
}
