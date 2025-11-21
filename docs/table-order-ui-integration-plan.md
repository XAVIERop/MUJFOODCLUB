# Table Order UI Integration Plan

## Goal
Make `/table-order/:cafeSlug/:tableNumber` use the same menu UI as `/menu/:cafeId`

## Current State
- **MenuModern.tsx**: Uses `ModernMenuLayout` component with collapsible categories, search, filters
- **TableOrder.tsx**: Simple flat list of items with basic "Add" buttons

## ModernMenuLayout Component Analysis
Located: `src/components/ModernMenuLayout.tsx`

### Props Required:
```typescript
{
  // Search and filters
  searchQuery: string
  onSearchChange: (query: string) => void
  categories: string[]
  selectedCategory: string
  onCategoryChange: (category: string) => void
  selectedBrand?: string
  onBrandChange?: (brand: string) => void
  
  // Menu items
  menuItems: any[]
  onAddToCart: (item: any, selectedPortion?: string) => void
  onRemoveFromCart: (item: any) => void
  getCartQuantity: (itemId: string) => number
  
  // Cart
  cart: any
  getTotalAmount: () => number
  getCartItemCount: () => number
  onCheckout: () => void
  
  // Cafe info
  cafe: any
  
  // Favorites (optional)
  onToggleFavorite?: (itemId: string) => void
  isFavorite?: (itemId: string) => boolean
}
```

### Features:
- Image header with cafe photo
- Back button, call button, favorite button
- Search bar
- Category filters (all, veg, non-veg, + menu categories)
- Collapsible category sections
- Item cards with +/- buttons
- Promotional banners
- Floating cart button (mobile)

## Implementation Steps

### 1. Update TableOrder.tsx State
Add missing state for ModernMenuLayout:
- `searchQuery`
- `selectedCategory`
- `categories` (derived from menuItems)

### 2. Adapt Cart Functions
ModernMenuLayout expects:
- `onAddToCart(item, selectedPortion)`
- `onRemoveFromCart(item)`
- `getCartQuantity(itemId)`
- `getTotalAmount()`
- `getCartItemCount()`

Current TableOrder has:
- `addToCart(item)`
- `removeFromCart(itemId)`
- `getTotalAmount()`
- `getTotalItems()`

Need to adapt these to match ModernMenuLayout's interface.

### 3. Handle Checkout Differently
- ModernMenuLayout's `onCheckout` navigates to `/checkout`
- TableOrder should show inline checkout form instead
- Solution: Override checkout behavior or add a flag

### 4. Guest Form Placement
Options:
A. Keep guest form inline below menu (current)
B. Show guest form in a modal/drawer
C. Show guest form in a sticky bottom section

Recommendation: **Sticky bottom section** with guest form + cart summary

### 5. Remove Unnecessary Features
For table orders, we don't need:
- Favorites functionality
- Call button (already at table)
- Some promotional banners (optional)

## Detailed Changes

### TableOrder.tsx Changes:
1. Import `ModernMenuLayout`
2. Add search/filter state
3. Adapt cart functions to match interface
4. Create custom checkout handler
5. Render guest form separately (not in ModernMenuLayout)
6. Pass all required props to ModernMenuLayout

### Layout Structure:
```
<div>
  <Header />
  
  <ModernMenuLayout
    // All menu display + cart management
    onCheckout={handleShowGuestForm}
  />
  
  {/* Sticky bottom section */}
  <GuestCheckoutForm
    visible={showGuestForm}
    cart={cart}
    onSubmit={handlePlaceOrder}
  />
</div>
```

## Testing Checklist
- [ ] Menu displays with collapsible categories
- [ ] Search works
- [ ] Filters work (all/veg/non-veg)
- [ ] Add/remove items updates cart
- [ ] Cart count shows correctly
- [ ] Guest form appears when clicking checkout
- [ ] Order placement works
- [ ] Success screen shows
- [ ] Regular menu page still works

## Potential Issues
1. **Cart state management**: ModernMenuLayout expects global cart context, TableOrder uses local state
   - Solution: Keep local state but adapt interface
   
2. **Checkout flow**: Different between regular menu and table order
   - Solution: Custom `onCheckout` handler
   
3. **Menu item format**: Might need to transform data structure
   - Solution: Ensure MenuItem interface matches

4. **Grouped items**: ModernMenuLayout supports portion sizes, TableOrder doesn't need this
   - Solution: Pass ungrouped items, handle portions if needed

