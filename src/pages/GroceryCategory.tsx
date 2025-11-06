import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Filter, ShoppingCart, Plus, Minus, ArrowLeft } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/hooks/useAuth';
import { getImageUrl } from '@/utils/imageSource';
import { getGroceryProductImage } from '@/utils/groceryImageMatcher';
import { CafeSwitchDialog } from '@/components/CafeSwitchDialog';

interface GroceryItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  is_available: boolean;
  out_of_stock: boolean;
  image_url: string;
  brand?: string;
}

const GroceryCategory: React.FC = () => {
  const { categoryId } = useParams<{ categoryId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToCart, removeFromCart, getItemCount, getTotalAmount, cart, cafe, clearCart, setCafe } = useCart();
  
  const [items, setItems] = useState<GroceryItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<GroceryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBrand, setSelectedBrand] = useState<string>('all');
  const [brands, setBrands] = useState<string[]>([]);
  const [selectedBrandName, setSelectedBrandName] = useState<string>('All Brands');
  const [grabitCafe, setGrabitCafe] = useState<any | null>(null);
  
  // Dialog state
  const [showCafeSwitchDialog, setShowCafeSwitchDialog] = useState(false);
  const [pendingItem, setPendingItem] = useState<GroceryItem | null>(null);

  useEffect(() => {
    if (categoryId) {
      fetchItems();
    }
  }, [categoryId]);

  useEffect(() => {
    filterItems();
  }, [items, searchTerm, selectedBrand]);

  const fetchItems = async () => {
    try {
      setLoading(true);
      
      // Get Grabit cafe ID
      const { data: cafeData, error: cafeError } = await supabase
        .from('cafes')
        .select('id, name, slug')
        .eq('slug', 'grabit')
        .single();
      
      if (cafeError || !cafeData) {
        console.error('Cafe not found:', cafeError);
        return;
      }
      
      // Get items for the category
      const { data: itemsData, error: itemsError } = await supabase
        .from('menu_items')
        .select('*')
        .eq('cafe_id', cafeData.id)
        .eq('category', categoryId)
        .eq('is_available', true)
        .order('name');
      
      if (itemsError) {
        console.error('Error fetching items:', itemsError);
        return;
      }
      
      // Extract brands from item names (case-insensitive)
      const extractedBrands = new Set<string>();
      const processedItems = itemsData.map((item: any) => {
        const name = item.name.toUpperCase();
        let brand = 'Other';
        
        // Extract brand from item name (case-insensitive matching)
        if (name.includes('LAYS') || name.includes('LAY\'S')) brand = 'Lays';
        else if (name.includes('BINGO')) brand = 'Bingo';
        else if (name.includes('CORNITOS')) brand = 'Cornitos';
        else if (name.includes('CRAX')) brand = 'Crax';
        else if (name.includes('BALAJI')) brand = 'Balaji';
        else if (name.includes('ACT2') || name.includes('ACT II') || name.includes('ACT 2')) brand = 'Act II';
        else if (name.includes('POPZ')) brand = 'Popz';
        else if (name.includes('PEPSI')) brand = 'Pepsi';
        else if (name.includes('COKE') || name.includes('COCA-COLA') || name.includes('COCA COLA')) brand = 'Coca Cola';
        else if (name.includes('THUMS UP') || name.includes('THUMSUP')) brand = 'Thums Up';
        else if (name.includes('SPRITE')) brand = 'Sprite';
        else if (name.includes('FANTA')) brand = 'Fanta';
        else if (name.includes('MIRINDA')) brand = 'Mirinda';
        else if (name.includes('DEW') || name.includes('MOUNTAIN DEW')) brand = 'Mountain Dew';
        else if (name.includes('PAPERBOAT')) brand = 'Paperboat';
        else if (name.includes('WINKIES')) brand = 'Winkies';
        else if (name.includes('MONSTER')) brand = 'Monster';
        else if (name.includes('PREDATOR')) brand = 'Predator';
        else if (name.includes('CREAM BELL')) brand = 'Cream Bell';
        else if (name.includes('BRITANNIA')) brand = 'Britannia';
        else if (name.includes('CADBURY')) brand = 'Cadbury';
        else if (name.includes('AMUL')) brand = 'Amul';
        else if (name.includes('BISLERI')) brand = 'Bisleri';
        else if (name.includes('TROPICANA')) brand = 'Tropicana';
        else if (name.includes('RED BULL') || name.includes('REDBULL')) brand = 'Red Bull';
        
        extractedBrands.add(brand);
        
        return {
          ...item,
          brand
        };
      });

      setItems(processedItems);
      // Always include "Other" brand if any items have "Other" brand
      // Sort brands: "All Brands" equivalent is handled separately, then alphabetically
      const sortedBrands = Array.from(extractedBrands).sort();
      // Ensure "Other" is at the end if it exists
      const otherIndex = sortedBrands.indexOf('Other');
      if (otherIndex > -1) {
        sortedBrands.splice(otherIndex, 1);
        sortedBrands.push('Other');
      }
      setBrands(sortedBrands);
    } catch (error) {
      console.error('Error fetching items:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterItems = () => {
    let filtered = items;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by brand
    if (selectedBrand !== 'all') {
      filtered = filtered.filter(item => item.brand === selectedBrand);
    }

    setFilteredItems(filtered);
  };

  const handleBrandSelect = (brand: string, brandName: string) => {
    setSelectedBrand(brand);
    setSelectedBrandName(brandName);
  };

  // Helper function to check if a cafe is Grabit
  const isGrabitCafe = (cafeId: string | null, cafeName: string | null, cafeSlug?: string | null) => {
    if (!cafeId && !cafeName && !cafeSlug) return false;
    const name = cafeName?.toLowerCase() || '';
    const slug = cafeSlug?.toLowerCase() || '';
    return name.includes('grabit') || slug === 'grabit';
  };

  // Helper function to check if cart has items from different cafe (including Grabit detection)
  const hasItemsFromDifferentCafe = () => {
    const cartItems = Object.values(cart);
    if (cartItems.length === 0) return false;
    if (!grabitCafe) return false; // Can't check if we don't have Grabit cafe data
    
    // Check the global cafe state from cart context (this is set when items are added from a cafe)
    const cartCafeFromContext = cafe;
    
    // If cart context has a cafe, use that for comparison
    if (cartCafeFromContext && cartCafeFromContext.id) {
      const cartCafeId = cartCafeFromContext.id;
      const cartCafeName = cartCafeFromContext.name;
      const cartCafeSlug = cartCafeFromContext.slug;
      
      // Check if cart is from Grabit
      const cartIsGrabit = isGrabitCafe(cartCafeId, cartCafeName, cartCafeSlug);
      const currentIsGrabit = isGrabitCafe(grabitCafe.id, grabitCafe.name, grabitCafe.slug);
      
      // If both are Grabit, same cafe
      if (cartIsGrabit && currentIsGrabit) {
        return false;
      }
      
      // One is Grabit and one is not - different cafes
      if (cartIsGrabit !== currentIsGrabit) {
        return true;
      }
      
      // Both are regular cafes, check by cafe_id
      if (!cartIsGrabit && !currentIsGrabit) {
        return cartCafeId !== grabitCafe.id;
      }
    }
    
    // Fallback: Check first cart item's cafe info
    const firstCartItem = cartItems[0];
    if (firstCartItem && firstCartItem.item) {
      const cartCafeId = firstCartItem.item.cafe_id;
      const cartCafeName = firstCartItem.item.cafe_name;
      const cartCafeSlug = firstCartItem.item.cafe_slug;
      
      // If we have cafe_id, check if it's different from Grabit
      if (cartCafeId) {
        const cartIsGrabit = isGrabitCafe(cartCafeId, cartCafeName, cartCafeSlug);
        const currentIsGrabit = isGrabitCafe(grabitCafe.id, grabitCafe.name, grabitCafe.slug);
        
        // If one is Grabit and one is not, they're different
        if (cartIsGrabit !== currentIsGrabit) {
          return true;
        }
        
        // Both are regular cafes with different IDs
        if (!cartIsGrabit && !currentIsGrabit && cartCafeId !== grabitCafe.id) {
          return true;
        }
      }
    }
    
    // If we can't determine, assume same cafe (don't block)
    return false;
  };

  // Helper function to get current cafe name from cart
  const getCurrentCafeName = () => {
    // First check the global cafe state from cart context
    if (cafe && cafe.name) {
      return cafe.name;
    }
    
    // Fallback: Check first cart item
    const cartItems = Object.values(cart);
    if (cartItems.length === 0) return '';
    
    const firstItem = cartItems[0];
    return firstItem.item.cafe_name || 'Previous Cafe';
  };

  const handleAddToCart = (item: GroceryItem) => {
    // Check if cart has items from different cafe (including Grabit detection)
    console.log('🔍 Checking cafe mismatch:', {
      cartCafe: cafe,
      grabitCafe: grabitCafe,
      cartItems: Object.keys(cart).length,
      hasDifferentCafe: hasItemsFromDifferentCafe()
    });
    
    if (hasItemsFromDifferentCafe()) {
      console.log('🔄 Cafe mismatch detected, showing dialog');
      setPendingItem(item);
      setShowCafeSwitchDialog(true);
      return;
    }
    
    // If cart is empty or cafe context is not set to Grabit, set it now
    if (grabitCafe && (!cafe || cafe.id !== grabitCafe.id)) {
      setCafe(grabitCafe);
      console.log('✅ GroceryCategory: Set cafe context to Grabit before adding item');
    }
    
    addToCart(item, 1);
  };

  // Handle dialog confirmation
  const handleDialogConfirm = () => {
    if (pendingItem && grabitCafe) {
      clearCart();
      // Set cafe context to Grabit after clearing cart
      setCafe(grabitCafe);
      // Add the pending item after clearing
      setTimeout(() => {
        addToCart(pendingItem, 1);
      }, 100);
    }
    setShowCafeSwitchDialog(false);
    setPendingItem(null);
  };

  // Handle dialog cancellation
  const handleDialogCancel = () => {
    setShowCafeSwitchDialog(false);
    setPendingItem(null);
  };

  const handleRemoveFromCart = (itemId: string) => {
    removeFromCart(itemId);
  };

  const handleCheckout = () => {
    if (!user) {
      navigate('/auth');
      return;
    }
    
    if (Object.keys(cart).length === 0) {
      return;
    }
    
    navigate('/checkout');
  };

  const getCategoryTitle = () => {
    const titles: { [key: string]: string } = {
      'CHIPS': 'Chips & Snacks',
      'DRINKS': 'Drinks',
      'CAKES': 'Cakes & Desserts',
      'INSTANTFOOD': 'Instant Food'
    };
    return titles[categoryId || ''] || categoryId || 'Category';
  };

  const getCategoryIcon = () => {
    const icons: { [key: string]: string } = {
      'CHIPS': '🍟',
      'DRINKS': '🥤',
      'CAKES': '🍰',
      'INSTANTFOOD': '🍜'
    };
    return icons[categoryId || ''] || '🛒';
  };

  const getBrandIcon = (brand: string) => {
    // Brand logo images from ImageKit
    const brandLogos: { [key: string]: string } = {
      'Lays': 'https://ik.imagekit.io/foodclub/Grocery/Brands/Lay\'s.png?updatedAt=1762075613699',
      'Bingo': 'https://ik.imagekit.io/foodclub/Grocery/Brands/Bingo.png?updatedAt=1762075613442',
      'Cornitos': 'https://ik.imagekit.io/foodclub/Grocery/Brands/Cornitos.jpg?updatedAt=1762075614417',
      'Crax': 'https://ik.imagekit.io/foodclub/Grocery/Brands/Crax.png?updatedAt=1762075613637',
      'Balaji': 'https://ik.imagekit.io/foodclub/Grocery/Brands/Balaji%20Wafers.png?updatedAt=1762075613753',
      'Act II': 'https://ik.imagekit.io/foodclub/Grocery/Brands/ACT%20II.webp?updatedAt=1762075613316',
      'Act2': 'https://ik.imagekit.io/foodclub/Grocery/Brands/ACT%20II.webp?updatedAt=1762075613316',
      'Popz': 'https://ik.imagekit.io/foodclub/Grocery/Brands/Popz.png?updatedAt=1762075613664',
      'Pepsi': 'https://ik.imagekit.io/foodclub/Grocery/Brands/Pepsi.svg?updatedAt=1762076366842',
      'Coca Cola': 'https://ik.imagekit.io/foodclub/Grocery/Brands/Coca%20Cola.png?updatedAt=1762076367063',
      'Thums Up': 'https://ik.imagekit.io/foodclub/Grocery/Brands/Thums%20Up.svg?updatedAt=1762076366815',
      'Sprite': 'https://ik.imagekit.io/foodclub/Grocery/Brands/Sprite.svg?updatedAt=1762076366727',
      'Fanta': '🥤',
      'Mirinda': 'https://ik.imagekit.io/foodclub/Grocery/Brands/Miranda.png?updatedAt=1762076367088',
      'Mountain Dew': 'https://ik.imagekit.io/foodclub/Grocery/Brands/Mountain%20Dew.svg?updatedAt=1762076366845',
      'Paperboat': '🚢',
      'Winkies': '🎂',
      'Monster': 'https://ik.imagekit.io/foodclub/Grocery/Brands/Monster.png?updatedAt=1762076367061',
      'Predator': 'https://ik.imagekit.io/foodclub/Grocery/Brands/Predator.png?updatedAt=1762076366695',
      'Cream Bell': 'https://ik.imagekit.io/foodclub/Grocery/Brands/Cream%20Bell.png?updatedAt=1762076367262',
      'Britannia': '🍪',
      'Cadbury': '🍫',
      'Amul': '🥛',
      'Bisleri': '💧',
      'Tropicana': 'https://ik.imagekit.io/foodclub/Grocery/Brands/Tropicana.png?updatedAt=1762076366684',
      'Red Bull': '⚡',
      'Other': '🛒'
    };
    return brandLogos[brand] || '🛒';
  };
  
  const isBrandLogo = (brand: string) => {
    const icon = getBrandIcon(brand);
    return icon.startsWith('https://');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading items...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-16 pb-20 lg:pb-0">
      {/* Header - Normal scroll, not fixed */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/grabit')}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
                <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {getCategoryTitle()}
                  </h1>
                <p className="text-sm text-gray-600">{filteredItems.length} items available</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search Bar - Normal scroll, not fixed */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 border-gray-300 focus:border-orange-500 focus:ring-orange-500"
            />
          </div>
        </div>
      </div>

      {/* Two Column Layout - Blinkit Style with Brands Sidebar */}
      <div className="max-w-7xl mx-auto px-0 sm:px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-row gap-0">
          {/* Left Sidebar - Brands (Vertical List - Blinkit Style) */}
          <div className="w-20 sm:w-24 md:w-32 lg:w-64 flex-shrink-0 bg-white border-r border-gray-200">
            <div className="sticky top-20 h-[calc(100vh-5rem)] overflow-y-auto">
              <div className="p-2 sm:p-3 lg:p-4">
                <h3 className="text-xs sm:text-sm font-semibold text-gray-900 mb-2 lg:mb-4 px-1 sm:px-2 hidden sm:block">Brands</h3>
                <div className="space-y-1 sm:space-y-2">
                  <button
                    onClick={() => handleBrandSelect('all', 'All Brands')}
                    className={`w-full text-left px-1 sm:px-2 lg:px-3 py-1.5 sm:py-2 lg:py-2 rounded-md text-xs sm:text-sm font-medium transition-colors ${
                      selectedBrand === 'all'
                        ? 'bg-orange-100 text-orange-700 border-l-2 sm:border-l-4 border-orange-500'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-1 sm:gap-2 lg:gap-3">
                      <span className="text-base sm:text-lg text-center sm:text-left">🛒</span>
                      <span className="text-center sm:text-left text-[10px] sm:text-xs lg:text-sm leading-tight line-clamp-2">All Brands</span>
                    </div>
                  </button>
                  {brands.map((brand) => {
                    const brandIcon = getBrandIcon(brand);
                    const isLogo = isBrandLogo(brand);
                    return (
                    <button
                        key={brand}
                        onClick={() => handleBrandSelect(brand, brand)}
                        className={`w-full text-left px-1 sm:px-2 lg:px-3 py-1.5 sm:py-2 lg:py-2 rounded-md text-xs sm:text-sm font-medium transition-colors ${
                          selectedBrand === brand
                            ? 'bg-orange-100 text-orange-700 border-l-2 sm:border-l-4 border-orange-500'
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-1 sm:gap-2 lg:gap-3">
                          {isLogo ? (
                            <img 
                              src={brandIcon} 
                              alt={brand} 
                              className="w-5 h-5 sm:w-6 sm:h-6 object-contain flex-shrink-0"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                                const fallback = e.currentTarget.parentElement?.querySelector('.emoji-fallback');
                                if (fallback) {
                                  (fallback as HTMLElement).style.display = 'block';
                                }
                              }}
                            />
                          ) : null}
                          <span className={`emoji-fallback ${isLogo ? 'hidden' : 'block'} text-base sm:text-lg text-center sm:text-left`}>{brandIcon}</span>
                          <span className="text-center sm:text-left text-[10px] sm:text-xs lg:text-sm leading-tight line-clamp-2">{brand}</span>
                      </div>
                    </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Right Content - Products */}
          <div className="flex-1 px-2 sm:px-4 lg:px-6">
            <div className="mb-4">
              <h2 className="text-sm sm:text-base lg:text-lg font-semibold text-gray-900">
                {filteredItems.length} items {selectedBrand !== 'all' ? `in ${selectedBrandName}` : ''}
                </h2>
            </div>

              {filteredItems.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No items found</h3>
                <p className="text-gray-600">Try adjusting your search or filter criteria</p>
                        </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {filteredItems.map((item) => {
                  const cartCount = cart[item.id]?.quantity || 0;
                  const isOutOfStock = item.out_of_stock || !item.is_available;
                  
                  return (
                    <div 
                      key={item.id}
                      className={`bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 flex flex-col ${
                        isOutOfStock ? 'opacity-60' : ''
                      }`}
                    >
                      {/* Product Image - Blinkit Style */}
                      <div className="w-full aspect-square flex items-center justify-center bg-white p-4 mb-2">
                        <img
                          src={getGroceryProductImage(item.name, item.image_url)}
                          alt={item.name}
                          className="w-full h-full object-contain max-w-full max-h-full"
                          onError={(e) => {
                            e.currentTarget.src = '/menu_hero.png';
                          }}
                        />
                      </div>
                      
                      {/* Product Info */}
                      <div className="px-3 pb-3 flex flex-col flex-grow">
                        {/* Product Name */}
                        <h3 className="text-sm font-medium text-gray-900 line-clamp-2 leading-tight mb-1 min-h-[2.5rem]">
                          {item.name}
                        </h3>
                        
                        {/* Price and Add Button */}
                        <div className="flex items-center justify-between mt-auto pt-2">
                          <div className="text-base font-bold text-gray-900">
                            ₹{item.price.toFixed(2)}
                        </div>
                          {isOutOfStock ? (
                            <span className="text-xs text-red-600 font-medium px-2 py-1">
                              Out of Stock
                            </span>
                          ) : cartCount > 0 ? (
                            <div className="flex items-center gap-2">
                        <Button
                                variant="outline"
                          size="sm"
                                onClick={() => handleRemoveFromCart(item.id)}
                                className="h-8 w-8 p-0 border-gray-300 hover:border-gray-400 rounded-full"
                        >
                                <Minus className="h-4 w-4" />
                        </Button>
                              <span className="text-sm font-medium text-gray-900 min-w-[20px] text-center">{cartCount}</span>
                          <Button
                                variant="outline"
                            size="sm"
                                onClick={() => handleAddToCart(item)}
                                className="h-8 w-8 p-0 border-gray-300 hover:border-gray-400 rounded-full"
                          >
                                <Plus className="h-4 w-4" />
                          </Button>
                            </div>
                          ) : (
                          <Button
                              variant="default" 
                            size="sm"
                              className="bg-green-500 hover:bg-green-600 text-white font-medium rounded-md px-4 py-1.5 h-8 text-xs"
                              onClick={() => handleAddToCart(item)}
                          >
                              ADD
                          </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Floating Cart Bar - Desktop Only (Green Bar like Mobile) */}
      {Object.keys(cart).length > 0 && (
        <div className="hidden lg:block fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-green-600 text-white p-4 rounded-lg shadow-lg z-50 max-w-md w-full mx-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-white/20 rounded-lg px-3 py-1.5">
                <span className="font-medium text-sm">
                  {getItemCount()} {getItemCount() === 1 ? 'Item' : 'Items'} • ₹{getTotalAmount().toFixed(2)}
                </span>
              </div>
              <div className="text-sm">
                {getTotalAmount() >= 89 ? (
                  <span className="text-green-100">Free Delivery</span>
                ) : (
                  <span className="text-yellow-200">₹{(89 - getTotalAmount()).toFixed(2)} more for free delivery</span>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => {
                  if (window.confirm('Are you sure you want to remove all items from your cart?')) {
                    clearCart();
                  }
                }}
                className="p-1.5 hover:bg-white/20 rounded-full transition-colors"
                aria-label="Clear cart"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <Button
                onClick={handleCheckout}
                className="bg-white text-green-600 px-6 py-2 rounded-md font-medium text-sm hover:bg-gray-100 transition-colors"
              >
                View Cart &gt;
              </Button>
            </div>
          </div>
        </div>
      )}
      
      {/* Cafe Switch Dialog */}
      <CafeSwitchDialog
        isOpen={showCafeSwitchDialog}
        onClose={handleDialogCancel}
        onConfirm={handleDialogConfirm}
        currentCafeName={getCurrentCafeName()}
        newCafeName={grabitCafe?.name || 'Grabit'}
        currentCartItems={Object.keys(cart).length}
      />
    </div>
  );
};

export default GroceryCategory;
