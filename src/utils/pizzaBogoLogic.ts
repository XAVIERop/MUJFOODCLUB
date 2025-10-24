// Pizza Bakers BOGO (Buy One Get One) Logic
// When a Large pizza is added, automatically add the corresponding Regular pizza for FREE

interface MenuItem {
  id: string;
  name: string;
  price: number;
  category: string;
  description: string;
  is_available: boolean;
  preparation_time: number;
  cafe_id: string;
}

interface CartItem {
  item: MenuItem;
  quantity: number;
  notes: string;
}

/**
 * Check if the cafe is Pizza Bakers
 */
export function isPizzaBakersCafe(cafeName?: string): boolean {
  return cafeName?.toLowerCase().includes('pizza bakers') || false;
}

/**
 * Check if an item is a Large pizza (Large 12")
 */
export function isLargePizza(item: MenuItem): boolean {
  return item.name.includes('(Large 12")');
}

/**
 * Check if an item is a Regular pizza (Regular 7")
 */
export function isRegularPizza(item: MenuItem): boolean {
  return item.name.includes('(Regular 7")');
}

/**
 * Extract base name from pizza name (remove size suffix)
 * Example: "Margherita Cheese (Large 12")" -> "Margherita Cheese"
 */
export function getPizzaBaseName(pizzaName: string): string {
  return pizzaName
    .replace(/\s*\(Large\s+12"\)/, '')
    .replace(/\s*\(Regular\s+7"\)/, '')
    .replace(/\s*\(Medium\s+10"\)/, '')
    .trim();
}

/**
 * Find the corresponding Regular pizza for a Large pizza
 */
export function findCorrespondingRegularPizza(
  largePizza: MenuItem,
  allMenuItems: MenuItem[]
): MenuItem | null {
  const baseName = getPizzaBaseName(largePizza.name);
  
  return allMenuItems.find(item => 
    getPizzaBaseName(item.name) === baseName && 
    isRegularPizza(item)
  ) || null;
}

/**
 * Create a FREE Regular pizza item for BOGO
 */
export function createFreeRegularPizza(regularPizza: MenuItem): MenuItem {
  return {
    ...regularPizza,
    price: 0, // FREE
    name: `FREE ${regularPizza.name}`, // Mark as FREE
    description: `FREE ${regularPizza.description} (BOGO Offer)`
  };
}

/**
 * Check if an item is a FREE BOGO item
 */
export function isFreeBogoItem(item: MenuItem): boolean {
  return item.name.startsWith('FREE ') && item.price === 0;
}

/**
 * Get the original item name from a FREE BOGO item
 */
export function getOriginalNameFromFreeBogo(freeItem: MenuItem): string {
  return freeItem.name.replace('FREE ', '');
}

/**
 * Apply BOGO logic to cart items
 * This function should be called whenever the cart changes
 */
export function applyPizzaBogoLogic(
  cart: { [key: string]: CartItem },
  allMenuItems: MenuItem[],
  cafeName?: string
): { [key: string]: CartItem } {
  console.log('🍕 BOGO Logic Debug:', {
    cafeName,
    isPizzaBakers: isPizzaBakersCafe(cafeName),
    cartItems: Object.keys(cart).length,
    menuItemsCount: allMenuItems.length
  });

  // Only apply BOGO logic for Pizza Bakers
  if (!isPizzaBakersCafe(cafeName)) {
    console.log('🍕 Not Pizza Bakers, skipping BOGO logic');
    return cart;
  }

  const newCart = { ...cart };
  const freeItemsToRemove: string[] = [];
  const freeItemsToAdd: { [key: string]: CartItem } = {};

  // Process each cart item
  Object.entries(cart).forEach(([itemId, cartItem]) => {
    const item = cartItem.item;

    console.log('🍕 Processing cart item:', {
      itemId,
      itemName: item.name,
      isFreeBogo: isFreeBogoItem(item),
      isLargePizza: isLargePizza(item)
    });

    // Skip if it's already a FREE BOGO item
    if (isFreeBogoItem(item)) {
      console.log('🍕 Skipping FREE BOGO item:', item.name);
      return;
    }

    // If it's a Large pizza, add corresponding FREE Regular pizza
    if (isLargePizza(item)) {
      console.log('🍕 Found Large pizza:', item.name);
      const correspondingRegular = findCorrespondingRegularPizza(item, allMenuItems);
      
      if (correspondingRegular) {
        console.log('🍕 Found corresponding Regular pizza:', correspondingRegular.name);
        const freeRegularPizza = createFreeRegularPizza(correspondingRegular);
        const freeItemId = `free_${correspondingRegular.id}`;
        
        // Add FREE Regular pizza with same quantity as Large pizza
        freeItemsToAdd[freeItemId] = {
          item: freeRegularPizza,
          quantity: cartItem.quantity,
          notes: `FREE with ${item.name} (BOGO)`
        };
        console.log('🍕 Added FREE Regular pizza to cart:', freeRegularPizza.name);
      } else {
        console.log('🍕 No corresponding Regular pizza found for:', item.name);
      }
    }
  });

  // Remove existing FREE items that are no longer needed
  Object.entries(cart).forEach(([itemId, cartItem]) => {
    if (isFreeBogoItem(cartItem.item)) {
      const originalName = getOriginalNameFromFreeBogo(cartItem.item);
      const baseName = getPizzaBaseName(originalName);
      
      // Check if there's still a Large pizza with the same base name
      const hasMatchingLargePizza = Object.values(cart).some(cartItem => 
        isLargePizza(cartItem.item) && 
        getPizzaBaseName(cartItem.item.name) === baseName
      );
      
      if (!hasMatchingLargePizza) {
        freeItemsToRemove.push(itemId);
      }
    }
  });

  // Remove FREE items that are no longer needed
  freeItemsToRemove.forEach(itemId => {
    delete newCart[itemId];
  });

  // Add new FREE items
  Object.entries(freeItemsToAdd).forEach(([itemId, cartItem]) => {
    newCart[itemId] = cartItem;
  });

  return newCart;
}

/**
 * Get BOGO discount amount for display
 */
export function getBogoDiscountAmount(cart: { [key: string]: CartItem }): number {
  return Object.values(cart)
    .filter(cartItem => isFreeBogoItem(cartItem.item))
    .reduce((total, cartItem) => {
      // Calculate what the original price would have been
      const originalName = getOriginalNameFromFreeBogo(cartItem.item);
      const originalPrice = cartItem.item.price; // This should be 0 for FREE items
      // We need to get the actual price from the menu items
      // For now, we'll return 0 since FREE items have price 0
      return total + (originalPrice * cartItem.quantity);
    }, 0);
}
