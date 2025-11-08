import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Star, Plus, Minus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/hooks/useAuth';
import { getImageUrl } from '@/utils/imageSource';
import { getGroceryProductImage } from '@/utils/groceryImageMatcher';
import { CafeSwitchDialog } from '@/components/CafeSwitchDialog';

interface GroceryCategory {
  id: string;
  name: string;
  description: string;
  image: string;
  item_count: number;
  icon: string;
}

interface GroceryItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  is_available: boolean;
  out_of_stock: boolean;
  image_url: string;
}

const Grocery: React.FC = () => {
  const [categories, setCategories] = useState<GroceryCategory[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<GroceryItem[]>([]);
  const [allProducts, setAllProducts] = useState<GroceryItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  // Removed banner carousel state - using static banner
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToCart, removeFromCart, cart, setCafe, getItemCount, getTotalAmount, cafe, clearCart } = useCart();
  const [grabitCafe, setGrabitCafe] = useState<any | null>(null);
  
  // Dialog state
  const [showCafeSwitchDialog, setShowCafeSwitchDialog] = useState(false);
  const [pendingItem, setPendingItem] = useState<GroceryItem | null>(null);

  // Static banner image - ImageKit URL
  const bannerImage = 'https://ik.imagekit.io/foodclub/Grocery/Banners/Fc%20grocery%20web%20banneers-04.jpg?updatedAt=1761650212610';

  useEffect(() => {
    fetchCategories();
  }, []);

  // Removed auto-slide functionality - using static banner

  const fetchCategories = async () => {
    try {
      setLoading(true);
      
      // Get Grabit cafe ID
      const { data: cafeData, error: cafeError } = await supabase
        .from('cafes')
            .select('*')
            .eq('slug', 'grabit')
        .single();
      
      if (cafeError || !cafeData) {
            console.error('Cafe not found:', cafeError);
        return;
      }
      
      // Store Grabit cafe data for comparison
      setGrabitCafe(cafeData);
      
      // Only set cafe context if cart is empty or cart is already from Grabit
      // This prevents overwriting the cafe context when cart has items from another cafe
      const cartItems = Object.values(cart);
      if (cartItems.length === 0) {
        // Cart is empty, safe to set cafe context
        setCafe(cafeData);
        console.log('✅ Grocery: Set cafe context to:', cafeData.name);
      } else {
        // Check if cart is from Grabit
        const firstCartItem = cartItems[0];
        const cartCafeId = firstCartItem?.item?.cafe_id;
        const cartCafeName = firstCartItem?.item?.cafe_name;
        const cartCafeSlug = firstCartItem?.item?.cafe_slug;
        const cartIsGrabit = isGrabitCafe(cartCafeId, cartCafeName, cartCafeSlug);
        
        if (cartIsGrabit) {
          // Cart is already from Grabit, safe to set cafe context
          setCafe(cafeData);
          console.log('✅ Grocery: Cart is from Grabit, set cafe context to:', cafeData.name);
        } else {
          // Cart has items from different cafe, don't overwrite cafe context
          // This allows the detection logic to work properly
          console.log('⚠️ Grocery: Cart has items from different cafe, not overwriting cafe context');
        }
      }
      
      // Get categories with item counts
      const { data: categoryData, error: categoryError } = await supabase
        .from('menu_items')
        .select('category')
        .eq('cafe_id', cafeData.id)
        .eq('is_available', true);
      
      if (categoryError) {
        console.error('Error fetching categories:', categoryError);
        return;
      }
      
      // Count items per category
      const categoryCounts = categoryData.reduce((acc: any, item: any) => {
        acc[item.category] = (acc[item.category] || 0) + 1;
        return acc;
      }, {});

      // Define category details with ImageKit banner images
      const categoryDetails: GroceryCategory[] = [
        {
          id: 'CHIPS',
          name: 'Chips & Snacks',
          description: 'Crispy chips, wafers, and crunchy snacks',
          image: 'https://ik.imagekit.io/foodclub/Grocery/Banners/Fc%20grocery%20web%20banneers-01.jpg?updatedAt=1761650212314',
          item_count: (categoryCounts.CHIPS || 0) + (categoryCounts.SNACKS || 0),
          icon: '🍟'
        },
        {
          id: 'DRINKS',
          name: 'Drinks',
          description: 'All beverages - soft drinks, juices, energy drinks',
          image: 'https://ik.imagekit.io/foodclub/Grocery/Banners/Fc%20grocery%20web%20banneers-02.jpg?updatedAt=1761650212313',
          item_count: (categoryCounts.DRINKS || 0) + (categoryCounts.COLDDRINK || 0) + (categoryCounts.BEVERAGES || 0) + (categoryCounts.JUICES || 0) + (categoryCounts.ENERGYDRINK || 0) + (categoryCounts.MILKDRINK || 0) + (categoryCounts.SPARKLINGWATER || 0),
          icon: '🥤'
        },
        {
          id: 'CAKES',
          name: 'Cakes & Desserts',
          description: 'Sweet treats and baked goods',
          image: 'https://ik.imagekit.io/foodclub/Grocery/Banners/Fc%20grocery%20web%20banneers-03.jpg?updatedAt=1761650212166',
          item_count: categoryCounts.CAKES || 0,
          icon: '🍰'
        },
        {
          id: 'INSTANTFOOD',
          name: 'Instant Food',
          description: 'Quick and delicious instant noodles',
          image: 'https://ik.imagekit.io/foodclub/Grocery/Banners/Fc%20grocery%20web%20banneers-04.jpg?updatedAt=1761650212610',
          item_count: categoryCounts.INSTANTFOOD || 0,
          icon: '🍜'
        }
      ];

      setCategories(categoryDetails);

          // Fetch all products for search
          const { data: allProductsData, error: allProductsError } = await supabase
            .from('menu_items')
            .select('*')
            .eq('cafe_id', cafeData.id)
            .eq('is_available', true)
            .order('name');
          
          if (allProductsError) {
            console.error('Error fetching all products:', allProductsError);
            return;
          }
          
          setAllProducts(allProductsData || []);
          
          // Use full product list for featured sections so homepage can display every item
          setFeaturedProducts(allProductsData || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
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
      console.log('✅ Grocery: Set cafe context to Grabit before adding item');
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

  // Filter products based on search query
  const filteredProducts = searchQuery.trim() 
    ? allProducts.filter(item => 
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : featuredProducts;

  // Get dropdown suggestions (limit to 5 items)
  const dropdownSuggestions = searchQuery.trim() && searchQuery.length >= 2
    ? allProducts
        .filter(item => 
          item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.description.toLowerCase().includes(searchQuery.toLowerCase())
        )
        .slice(0, 5)
    : [];

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    setShowDropdown(value.trim().length >= 2);
  };

  const handleSuggestionClick = (item: GroceryItem) => {
    setSearchQuery(item.name);
    setShowDropdown(false);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowDropdown(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading grocery categories...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white grocery-font pt-16 pb-20 lg:pb-0">
      <Header />

      {/* Search Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="max-w-5xl mx-auto">
            <form onSubmit={handleSearchSubmit} className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
              type="text"
                placeholder="Search all grocery items..."
                className="block w-full pl-10 pr-3 py-3 border-2 border-gray-400 rounded-xl leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm shadow-sm"
              value={searchQuery}
                onChange={handleSearchChange}
                onFocus={() => setShowDropdown(searchQuery.trim().length >= 2)}
                onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
              />
              
              {/* Dropdown Suggestions */}
              {showDropdown && dropdownSuggestions.length > 0 && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                  {dropdownSuggestions.map((item) => {
                    const productImage = getGroceryProductImage(item.name, item.image_url);
                    return (
                      <div
                        key={item.id}
                        className="px-4 py-3 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors"
                      >
                        <div
                          className="flex items-center gap-3 cursor-pointer"
                          onMouseDown={(e) => {
                            e.preventDefault();
                            handleSuggestionClick(item);
                          }}
                        >
                          {productImage && (
                            <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                              <img
                                src={productImage}
                                alt={item.name}
                                className="w-6 h-6 object-contain"
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none';
                                  e.currentTarget.parentElement?.classList.add('hidden');
                                }}
                              />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {item.name}
                            </p>
                            <p className="text-xs text-gray-500 truncate">
                              {item.description}
                            </p>
                          </div>
                          <div className="text-sm font-semibold text-orange-600">
                            ₹{item.price.toFixed(2)}
                          </div>
                          <Button
                            size="sm"
                            className="ml-3"
                            onMouseDown={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleAddToCart(item);
                            }}
                          >
                            Add
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </form>
          </div>
        </div>

      {/* Static Hero Banner - Blinkit Style, Image size matches actual image */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-4">
        <div className="relative rounded-xl overflow-hidden shadow-lg">
          <img
            src={bannerImage}
            alt="Grocery Banner"
            className="w-full h-auto"
            onError={(e) => {
              e.currentTarget.src = bannerImage;
            }}
          />
        </div>
      </div>

        {/* Categories Grid - Simple Buttons */}
        <div id="categories" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-12">
          <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:gap-4 lg:max-w-3xl lg:mx-auto">
          {categories.map((category) => {
            const isInstantFood = category.id === 'INSTANTFOOD';
            
            return (
              <button
                key={category.id}
                onClick={() => navigate(`/grabit/category/${category.id}`)}
                className="group cursor-pointer hover:shadow-lg transition-all duration-300 bg-white rounded-xl overflow-hidden shadow-md border border-gray-200 hover:scale-105 active:scale-95 w-full"
              >
                <img
                  src={isInstantFood ? 'https://ik.imagekit.io/foodclub/Grocery/Banners/WhatsApp%20Image%202025-11-07%20at%209.37.13%20PM.jpeg?updatedAt=1762598359844' : category.image}
                  alt={category.name}
                  className="w-full h-auto object-cover min-h-[160px]"
                  onError={(e) => {
                    e.currentTarget.src = category.image;
                  }}
                />
              </button>
            );
          })}
        </div>

        {/* Featured Products / Search Results Section */}
        <div className="mt-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {searchQuery.trim() ? (
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Search Results</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Found {filteredProducts.length} items for "{searchQuery}"
              </p>
            </div>
          ) : (
            <div className="text-center mb-12">
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">Discover our most popular items</p>
            </div>
          )}
          
          {/* Featured Products - Show chips/snacks above banner, or all if searching */}
          {(() => {
            // Determine which items to show
            let itemsToShow: GroceryItem[] = [];
            
            if (searchQuery.trim()) {
              // When searching, show all filtered results
              itemsToShow = filteredProducts;
            } else {
              // When not searching, filter for chips/snacks items only (for display above banner)
              // Search through all products to get chips items, not just first 50
              const chipsItems = allProducts.filter(item => {
                const cat = (item.category || '').toUpperCase();
                return cat === 'CHIPS' || cat === 'SNACKS' || cat.includes('CHIP') || cat.includes('SNACK');
              });
              
              // If chips found, use them all, otherwise fallback to full featured products
              itemsToShow = chipsItems.length > 0 ? chipsItems : featuredProducts;
            }
            
            if (itemsToShow.length === 0) {
              return null;
            }
            
            return (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {itemsToShow.map((item) => {
                  const cartCount = cart[item.id]?.quantity || 0;
                  const isOutOfStock = item.out_of_stock || !item.is_available;
                  const productImage = getGroceryProductImage(item.name, item.image_url);
                  
                  return (
                <div 
                  key={item.id}
                  className={`bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 flex flex-col ${
                    isOutOfStock ? 'opacity-60' : ''
                  }`}
                >
                  {/* Product Image - Blinkit Style */}
                  {productImage && (
                    <div className="w-full aspect-square flex items-center justify-center bg-white p-4 mb-2">
                      <img
                        src={productImage}
                        alt={item.name}
                        className="w-full h-full object-contain max-w-full max-h-full"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          e.currentTarget.parentElement?.classList.add('hidden');
                        }}
                      />
                    </div>
                  )}
                  
                  {/* Product Info */}
                  <div className={`px-3 pb-3 flex flex-col flex-grow ${productImage ? '' : 'pt-4'}`}>
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
            );
          })()}

          {/* Show "No items found" message only when searching and no results */}
          {searchQuery.trim() && filteredProducts.length === 0 && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No items found</h3>
              <p className="text-gray-600 mb-4">Try searching with different keywords</p>
              <Button 
                onClick={() => setSearchQuery('')}
                className="bg-orange-500 hover:bg-orange-600 text-white"
              >
                Clear Search
              </Button>
            </div>
          )}

          {/* Promotional Banners - Only show when not searching */}
          {!searchQuery.trim() && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 my-16">
            {/* Drinks & Beverages Banner */}
            <div className="relative bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="p-8 relative z-10">
                <h3 className="text-3xl font-bold text-gray-900 mb-2">Drinks & Beverages</h3>
                <p className="text-xl text-blue-600 font-semibold mb-6">Fresh & Refreshing Drinks</p>
                <Button 
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
                  onClick={() => navigate('/grabit/category/DRINKS')}
                >
                  Shop Now
                </Button>
              </div>
              <div className="absolute top-4 right-4 w-32 h-32 bg-blue-200 rounded-full opacity-20"></div>
              <div className="absolute bottom-4 right-4 text-6xl opacity-20">🥤</div>
            </div>

            {/* Chips & Snacks Banner */}
            <div className="relative bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="p-8 relative z-10">
                <h3 className="text-3xl font-bold text-gray-900 mb-2">Chips & Snacks</h3>
                <p className="text-xl text-orange-600 font-semibold mb-6">Crispy & Delicious Snacks</p>
                <Button 
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
                  onClick={() => navigate('/grabit/category/CHIPS')}
                >
                  Shop Now
                </Button>
              </div>
              <div className="absolute top-4 right-4 w-32 h-32 bg-orange-200 rounded-full opacity-20"></div>
              <div className="absolute bottom-4 right-4 text-6xl opacity-20">🍟</div>
            </div>
                      </div>
                    )}

          {/* More Featured Products - Only show when not searching */}
          {!searchQuery.trim() && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {(() => {
              // Filter for drinks items only (for display below banner)
              // Search through all products to get drinks items, not just first 50
              // Limit to 10 items (2 rows with 5 columns on xl screens)
              const drinksItems = allProducts.filter(item => {
                const cat = (item.category || '').toUpperCase();
                return cat === 'DRINKS' || 
                       cat === 'COLDDRINK' || 
                       cat === 'BEVERAGES' || 
                       cat === 'JUICES' || 
                       cat === 'ENERGYDRINK' || 
                       cat === 'MILKDRINK' || 
                       cat === 'SPARKLINGWATER' ||
                       cat.includes('DRINK') ||
                       cat.includes('BEVERAGE') ||
                       cat.includes('JUICE');
              });
              
              return drinksItems.map((item) => {
                const cartCount = cart[item.id]?.quantity || 0;
                const isOutOfStock = item.out_of_stock || !item.is_available;
                const productImage = getGroceryProductImage(item.name, item.image_url);
                
                return (
                <div 
                  key={item.id}
                  className={`bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 flex flex-col ${
                    isOutOfStock ? 'opacity-60' : ''
                  }`}
                >
                  {/* Product Image - Blinkit Style */}
                  {productImage && (
                    <div className="w-full aspect-square flex items-center justify-center bg-white p-4 mb-2">
                      <img
                        src={productImage}
                        alt={item.name}
                        className="w-full h-full object-contain max-w-full max-h-full"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          e.currentTarget.parentElement?.classList.add('hidden');
                        }}
                      />
                    </div>
                  )}

                  {/* Product Info */}
                  <div className={`px-3 pb-3 flex flex-col flex-grow ${productImage ? '' : 'pt-4'}`}>
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
              });
            })()}
          </div>
          )}
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

      {/* Footer Section */}
      <div className="bg-gray-50 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Ready to Shop?</h3>
            <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
              Browse our categories above or explore our featured products to find exactly what you need.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-8 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
                onClick={() => navigate('/grabit/category/CHIPS')}
              >
                <span className="mr-2">🍟</span>
                Shop Chips & Snacks
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                className="border-orange-500 text-orange-600 hover:bg-orange-50 font-semibold px-8 py-3 rounded-full"
                onClick={() => navigate('/grabit/category/DRINKS')}
              >
                <span className="mr-2">🥤</span>
                Shop Drinks
              </Button>
            </div>
          </div>
        </div>
      </div>
      
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

export default Grocery;
