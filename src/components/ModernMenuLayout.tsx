import React, { useState, useEffect, useMemo } from 'react';
import { Search, Filter, Heart, ShoppingCart, MapPin, Clock, Star, Plus, Minus, ChevronDown, ChevronUp, ArrowLeft, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import PromotionalBanner from '@/components/PromotionalBanner';
import { promotionalBannerService, PromotionalBannerData } from '@/services/promotionalBannerService';
import FloatingMenuButton from '@/components/FloatingMenuButton';
import { useFavorites } from '@/hooks/useFavorites';
import { getCafeScope } from '@/utils/residencyUtils';

interface ModernMenuLayoutProps {
  // Search and filters
  searchQuery: string;
  onSearchChange: (query: string) => void;
  categories: string[];
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  selectedBrand?: string;
  onBrandChange?: (brand: string) => void;
  
  // Menu items
  menuItems: any[];
  onAddToCart: (item: any, selectedPortion?: string) => void;
  onRemoveFromCart: (item: any) => void;
  getCartQuantity: (itemId: string) => number;
  
  // Cart
  cart: any;
  getTotalAmount: () => number;
  getCartItemCount: () => number;
  onCheckout: () => void;
  
  // Cafe info
  cafe: any;
  
  // Favorites
  onToggleFavorite?: (itemId: string) => void;
  isFavorite?: (itemId: string) => boolean;
}

const ModernMenuLayout: React.FC<ModernMenuLayoutProps> = ({
  searchQuery,
  onSearchChange,
  categories,
  selectedCategory,
  onCategoryChange,
  selectedBrand = 'all',
  onBrandChange,
  menuItems,
  onAddToCart,
  onRemoveFromCart,
  getCartQuantity,
  cart,
  getTotalAmount,
  getCartItemCount,
  onCheckout,
  cafe,
  onToggleFavorite,
  isFavorite
}) => {
  // Add favorites functionality
  const { toggleFavorite, isFavorite: isCafeFavorite } = useFavorites();
  const cafeScope = getCafeScope(cafe);
  const scopeBadgeLabel = cafeScope === 'off_campus' ? 'Outside Delivery' : 'GHS Only';
  const scopeBadgeClasses =
    cafeScope === 'off_campus'
      ? 'bg-emerald-100/90 text-emerald-800 border border-emerald-200'
      : 'bg-purple-100/90 text-purple-800 border border-purple-200';
  
  // Add call and favorite handlers
  const handleCall = (phone: string) => {
    if (window.confirm(`Do you want to call ${cafe?.name} at ${phone}?`)) {
      window.open(`tel:${phone}`, '_blank');
    }
  };

  const handleFavoriteToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (cafe?.id) {
      toggleFavorite(cafe.id);
    }
  };

  // Temporary compatibility shim: if any legacy JSX still references
  // handleAddPastaClick, route it to the standard onAddToCart handler.
  const handleAddPastaClick = (item: any, selectedPortion?: string) => {
    onAddToCart(item, selectedPortion);
  };
  
  // showCart state removed - using floating cart on mobile instead
  const [promotionalBanners, setPromotionalBanners] = useState<PromotionalBannerData[]>([]);

  // Calculate category counts for floating menu
  const getCategoryCounts = () => {
    const counts: { name: string; count: number }[] = [];
    
    // All items count
    counts.push({ name: 'all', count: menuItems.length });
    
    // Veg count
    const vegCount = menuItems.filter(item => item.is_vegetarian).length;
    counts.push({ name: 'veg', count: vegCount });
    
    // Non-veg count
    const nonVegCount = menuItems.filter(item => !item.is_vegetarian).length;
    counts.push({ name: 'non-veg', count: nonVegCount });
    
    // Menu categories count
    const categoryMap = new Map<string, number>();
    menuItems.forEach(item => {
      const category = item.category;
      categoryMap.set(category, (categoryMap.get(category) || 0) + 1);
    });
    
    categoryMap.forEach((count, category) => {
      counts.push({ name: category, count });
    });
    
    return counts;
  };

  // Auto-show cart logic removed - using floating cart on mobile instead

  // Load promotional banners
  useEffect(() => {
    const loadBanners = async () => {
      try {
        console.log('Loading promotional banners for cafe:', cafe?.id);
        
        // Try to load from database first
        const banners = await promotionalBannerService.getActiveBanners(cafe?.id);
        console.log('Database banners:', banners);
        
        if (banners.length > 0) {
          setPromotionalBanners(banners);
        } else {
          // Fallback to default banners for demo
          const defaultBanners = promotionalBannerService.getDefaultBanners();
          console.log('Using default banners:', defaultBanners);
          setPromotionalBanners(defaultBanners);
        }
      } catch (error) {
        console.error('Error loading promotional banners:', error);
        // Fallback to default banners
        const defaultBanners = promotionalBannerService.getDefaultBanners();
        console.log('Error fallback - using default banners:', defaultBanners);
        setPromotionalBanners(defaultBanners);
      }
    };

    loadBanners();
  }, [cafe?.id]);

  // Get cafe image for header background
  const getCafeHeaderImage = () => {
    // First, try to use the database image_url if available
    if (cafe?.image_url) {
      return cafe.image_url;
    }
    
    const cafeImages: { [key: string]: string } = {
      'CHATKARA': '/chatkara_card.png',
      'COOK HOUSE': '/cookhouse_card.png',
      'FOOD COURT': '/foodcourt_card.jpg',
      'Mini Meals': '/minimeals_cardhome.png',
      'Punjabi Tadka': '/punjabitadka_card.jpg',
      'Munch Box': '/munchbox_card.png',
      'Dev Sweets & Snacks': '/devsweets_card.png',
      'Taste of India': '/tasteofindia_card.jpg',
      'Havmor': '/havmor_card.jpg',
      'Pizza Bakers': '/pizz.png',
      'Stardom': '/stardom_card.webp',
      'Waffle Fit & Fresh': '/wafflefitnfresh_card.jpeg',
      'The Crazy Chef': '/crazychef_logo.png',
      'Zero Degree Cafe': '/zerodegreecafe_logo.jpg',
      'Zaika Restaurant': '/zaika_logo.png',
      'Italian Oven': '/italianoven_logo.png',
      'The Waffle Co': '/thewaffleco.png',
      'Soya Chaap Corner': '/chatkara_logo.jpg',
      'Tea Tradition': '/teatradition_card.jpeg',
      'China Town': '/china_card.png',
      'Let\'s Go Live': '/letsgolive_card.jpg',
      'BG The Food Cart': 'https://ik.imagekit.io/foodclub/Cafe/Food%20Cart/Food%20Cart.jpg?updatedAt=1763167203799',
      'Banna\'s Chowki': 'https://ik.imagekit.io/foodclub/Cafe/Banna\'s%20Chowki/Banna.jpg?updatedAt=1763167090456',
      'Koko\'ro': 'https://ik.imagekit.io/foodclub/Cafe/Koko\'ro/Koko\'ro.jpeg?updatedAt=1763167147690'
    };

    if (cafe?.name && cafeImages[cafe.name]) {
      return cafeImages[cafe.name];
    }
    
    // Try partial matches for variations in naming
    const cafeNameLower = cafe?.name?.toLowerCase() || '';
    for (const [cafeKey, imagePath] of Object.entries(cafeImages)) {
      if (cafeNameLower.includes(cafeKey.toLowerCase()) || cafeKey.toLowerCase().includes(cafeNameLower)) {
        return imagePath;
      }
    }

    // Fallback to default cafe image
    return '/chatkara_logo.jpg';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50">
      {/* Image Header Section - Like Kichi Coffee Design */}
      <div className="relative h-64 md:h-80 overflow-hidden">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url(${getCafeHeaderImage()})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        />
        
        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-black/40" />
        
        {/* Content Overlay */}
        <div className="relative z-10 h-full flex flex-col justify-between p-6">
          {/* Top Row - Back Button, Call Button, and Favorite Button */}
          <div className="flex items-center justify-between">
            <button 
              onClick={() => window.history.back()}
              className="bg-white/20 backdrop-blur-sm rounded-full p-2 hover:bg-white/30 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
            
            {/* Favorite Button */}
            <button 
              onClick={handleFavoriteToggle}
              className={`backdrop-blur-sm rounded-full p-2 transition-colors ${
                isCafeFavorite(cafe?.id)
                  ? 'bg-red-500/80 hover:bg-red-500 text-white'
                  : 'bg-white/20 hover:bg-white/30 text-white'
              }`}
            >
              <Heart className={`w-5 h-5 ${isCafeFavorite(cafe?.id) ? 'fill-current' : ''}`} />
            </button>
          </div>
          
          {/* Bottom Row - Cafe Info */}
          <div className="space-y-3">
            <h1 className="text-3xl md:text-4xl font-bold text-white drop-shadow-lg">
              {cafe?.name}
            </h1>
            <div className="flex items-center gap-1 text-white/90">
              <MapPin className="w-4 h-4" />
              <span className="text-sm">{cafe?.location}</span>
            </div>
            <div className="flex items-center gap-4 flex-wrap">
              {/* Rating - Temporarily Hidden */}
              {/* <div className="flex items-center gap-1 bg-white/20 backdrop-blur-sm rounded-full px-3 py-1">
                <Star className="w-4 h-4 text-yellow-400 fill-current" />
                <span className="text-sm font-medium text-white">
                  {cafe?.average_rating ? cafe.average_rating.toFixed(1) : '4.5'} ({cafe?.total_ratings || 1256} Reviews)
                </span>
              </div> */}
              <div
                className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold shadow-sm backdrop-blur-sm ${scopeBadgeClasses}`}
              >
                {scopeBadgeLabel}
              </div>
              
              {/* Call Button - Same for Mobile and Desktop */}
              {cafe?.phone && (
                <button 
                  onClick={() => handleCall(cafe.phone)}
                  className="bg-white/20 backdrop-blur-sm hover:bg-orange-50 text-white rounded-full px-6 py-3 flex items-center gap-2 shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  <Phone className="w-4 h-4" />
                  <span className="text-sm font-medium">Call</span>
                </button>
              )}
            </div>
          </div>
        </div>
        
        {/* Curved Bottom Edge */}
        <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-white to-transparent" />
      </div>

      {/* Cafe Closed Banner */}
      {cafe?.accepting_orders === false && (
        <div className="bg-red-50 border-b-2 border-red-300 px-4 py-3 -mt-2 relative z-20">
          <div className="flex items-center gap-3 text-center justify-center">
            <div className="w-5 h-5 rounded-full bg-red-500 flex-shrink-0 flex items-center justify-center">
              <span className="text-white text-xs font-bold">!</span>
            </div>
            <p className="text-sm font-semibold text-red-800">
              This cafe is currently not accepting orders. Browse the menu but items cannot be added to cart.
            </p>
          </div>
        </div>
      )}

      {/* Dev Sweets Ordering Notice Banner */}
      {cafe?.name && (cafe.name.toLowerCase().includes('dev') && cafe.name.toLowerCase().includes('sweet')) && (
        <div className="bg-blue-50 border-b-2 border-blue-200 px-4 py-3 -mt-2 relative z-20">
          <div className="flex items-center gap-3 text-center justify-center">
            <Phone className="w-5 h-5 text-blue-600 flex-shrink-0" />
            <p className="text-sm font-semibold text-blue-800">
              Cafe accepting orders on call only. Please call to place your order.
            </p>
          </div>
        </div>
      )}

      {/* Search and Filter Section */}
      <div className="bg-white px-4 py-4 -mt-2 relative z-20">

          {/* Search Bar */}
          <div className="relative mb-4">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-orange-500 w-5 h-5 z-10" />
            <Input
              type="text"
              placeholder="What would you like to eat?"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-12 pr-4 py-3 text-lg border-2 border-orange-200 focus:border-orange-400 rounded-xl bg-white/80 backdrop-blur-sm shadow-sm"
            />
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 hover:bg-orange-100 rounded-lg"
            >
              <Filter className="w-4 h-4 text-gray-500" />
            </Button>
          </div>

          {/* Brand Filter - Only for Food Court */}
          {cafe?.name === 'FOOD COURT' && onBrandChange && (
            <div className="mb-4">
              <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
                {[
                  { id: 'all', name: 'All Brands' },
                  { id: 'gobblers', name: 'GOBBLERS' },
                  { id: 'krispp', name: 'KRISPP' },
                  { id: 'momo-street', name: 'MOMO STREET' },
                  { id: 'waffles-more', name: 'WAFFLES & MORE' }
                ].map((brand) => (
                  <Button
                    key={brand.id}
                    variant={selectedBrand === brand.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => onBrandChange(brand.id)}
                    className={cn(
                      "whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-all duration-200",
                      selectedBrand === brand.id
                        ? "bg-blue-500 text-white shadow-md hover:bg-blue-600"
                        : "bg-white text-gray-600 border-blue-200 hover:bg-blue-50 hover:border-blue-300"
                    )}
                  >
                    {brand.name}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Category Filter Chips */}
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => onCategoryChange(category)}
                className={cn(
                  "whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-all duration-200",
                  selectedCategory === category
                    ? "bg-orange-500 text-white shadow-md hover:bg-orange-600"
                    : "bg-white text-gray-600 border-orange-200 hover:bg-orange-50 hover:border-orange-300"
                )}
              >
                {category}
              </Button>
            ))}
          </div>
        </div>

      <div className="container mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* Main Content Area */}
          <div className="flex-1">
            {/* Promotional Banner - HIDDEN FOR NOW */}
            {false && promotionalBanners.length > 0 && (
              <PromotionalBanner 
                banners={promotionalBanners}
                onDismiss={(bannerId) => {
                  setPromotionalBanners(prev => 
                    prev.filter(banner => banner.id !== bannerId)
                  );
                }}
              />
            )}
            
            {/* Debug: Show banner count - HIDDEN */}
            {false && process.env.NODE_ENV === 'development' && (
              <div className="mb-4 p-2 bg-blue-100 text-blue-800 text-sm rounded">
                Debug: {promotionalBanners.length} promotional banners loaded
              </div>
            )}


            {/* Menu Items - Grouped by Category */}
            <MenuCategorySections
              menuItems={menuItems}
              onAddToCart={onAddToCart}
              onRemoveFromCart={onRemoveFromCart}
              getCartQuantity={getCartQuantity}
              onToggleFavorite={onToggleFavorite}
              isFavorite={isFavorite}
              selectedCategory={selectedCategory}
              cafe={cafe}
            />
          </div>

          {/* Floating Cart Panel - Hidden on mobile, shown on desktop, hidden for Dev Sweets */}
          {cafe?.name && !(cafe.name.toLowerCase().includes('dev') && cafe.name.toLowerCase().includes('sweet')) && (
            <div className="hidden lg:block w-80">
              <ModernCartPanel
                cart={cart}
                getTotalAmount={getTotalAmount}
                getCartItemCount={getCartItemCount}
                onCheckout={onCheckout}
                onRemoveFromCart={onRemoveFromCart}
                cafe={cafe}
              />
            </div>
          )}
        </div>
      </div>

      {/* Mobile Cart Button - Removed, replaced with floating cart in App.tsx */}

      {/* Floating Menu Button - Hidden for Dev Sweets */}
      {cafe?.name && !(cafe.name.toLowerCase().includes('dev') && cafe.name.toLowerCase().includes('sweet')) && (
        <FloatingMenuButton
          categories={getCategoryCounts()}
          selectedCategory={selectedCategory}
          onCategorySelect={onCategoryChange}
          totalItems={menuItems.length}
        />
      )}

      {/* Bottom Spacing for Mobile Navigation */}
      <div className="h-32 pb-safe lg:hidden"></div>
    </div>
  );
};

// Menu Category Sections Component (Swiggy-style)
const MenuCategorySections: React.FC<{
  menuItems: any[];
  onAddToCart: (item: any, selectedPortion?: string) => void;
  onRemoveFromCart: (item: any) => void;
  getCartQuantity: (itemId: string) => number;
  onToggleFavorite?: (itemId: string) => void;
  isFavorite?: (itemId: string) => boolean;
  selectedCategory: string;
  cafe?: any;
}> = ({ menuItems, onAddToCart, onRemoveFromCart, getCartQuantity, onToggleFavorite, isFavorite, selectedCategory, cafe }) => {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  // Group menu items by category
  const groupedItems = menuItems.reduce((acc, item) => {
    const category = item.category;
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(item);
    return acc;
  }, {} as Record<string, any[]>);

  // Sort items within each category alphabetically by baseName
  Object.keys(groupedItems).forEach(category => {
    groupedItems[category].sort((a, b) => {
      const nameA = (a.baseName || a.name || '').toLowerCase();
      const nameB = (b.baseName || b.name || '').toLowerCase();
      return nameA.localeCompare(nameB);
    });
  });

  // Convert to array and sort by category name
  const sortedCategories = Object.entries(groupedItems).sort(([a], [b]) => a.localeCompare(b));

  // Toggle category expansion
  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(category)) {
        newSet.delete(category);
      } else {
        newSet.add(category);
      }
      return newSet;
    });
  };

  // Scroll to category section
  const scrollToCategory = (category: string) => {
    const categoryElement = document.querySelector(`[data-category="${category}"]`);
    if (categoryElement) {
      categoryElement.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start' // This ensures it scrolls to the TOP of the category section
      });
    }
  };

  // Auto-expand and scroll to category when selected
  useEffect(() => {
    if (selectedCategory && selectedCategory !== 'all' && selectedCategory !== 'veg' && selectedCategory !== 'non-veg') {
      // Expand the category if it's not already expanded
      setExpandedCategories(prev => {
        if (!prev.has(selectedCategory)) {
          const newSet = new Set(prev);
          newSet.add(selectedCategory);
          return newSet;
        }
        return prev;
      });
      
      // Scroll to the category section
      setTimeout(() => {
        scrollToCategory(selectedCategory);
      }, 100); // Small delay to ensure the category is expanded first
    }
  }, [selectedCategory]);

  return (
    <div className="space-y-4">
      {sortedCategories.map(([category, items]) => {
        const isExpanded = expandedCategories.has(category);
        const itemCount = (items as any[]).length;

        return (
          <div key={category} data-category={category} className="bg-white rounded-lg border border-orange-100 shadow-sm">
            {/* Category Header */}
            <button
              onClick={() => toggleCategory(category)}
              className="w-full flex items-center justify-between p-4 hover:bg-orange-50 transition-colors duration-200 rounded-t-lg"
            >
              <div className="flex items-center gap-3">
                <h3 className="text-lg font-semibold text-gray-900">
                  {category}
                </h3>
                <Badge className="bg-orange-100 text-orange-700 text-xs px-2 py-1">
                  {itemCount}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">
                  {isExpanded ? 'Hide' : 'Show'}
                </span>
                {isExpanded ? (
                  <ChevronUp className="w-5 h-5 text-gray-400" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                )}
              </div>
            </button>

            {/* Category Items */}
            {isExpanded && (
              <div className="border-t border-orange-100 p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {(items as any[]).map((item, index) => (
                    <ModernFoodCard
                      key={item.baseName || item.id || index}
                      item={item}
                      onAddToCart={onAddToCart}
                      onRemoveFromCart={onRemoveFromCart}
                      getCartQuantity={getCartQuantity}
                      onToggleFavorite={onToggleFavorite}
                      isFavorite={isFavorite}
                      cafe={cafe}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

// Modern Food Card Component with Size Selector
const ModernFoodCard: React.FC<{
  item: any;
  onAddToCart: (item: any, selectedPortion?: string) => void;
  onRemoveFromCart: (item: any) => void;
  getCartQuantity: (itemId: string) => number;
  onToggleFavorite?: (itemId: string) => void;
  isFavorite?: (itemId: string) => boolean;
  cafe?: any;
}> = ({ item, onAddToCart, onRemoveFromCart, getCartQuantity, onToggleFavorite, isFavorite, cafe }) => {
  const [selectedSize, setSelectedSize] = useState<string>('');

  // Dedupe portions by size name (e.g., multiple "Half" variants) keeping the cheapest
  const uniquePortions = useMemo(() => {
    if (!item.portions || item.portions.length === 0) return [] as any[];
    const map = new Map<string, any>();
    for (const p of item.portions) {
      const key = (p.name || '').toLowerCase().trim();
      const existing = map.get(key);
      if (!existing) {
        map.set(key, p);
      } else {
        // Keep the cheaper available option for the same size name
        const pick = (() => {
          if (existing.out_of_stock && !p.out_of_stock) return p;
          if (!existing.out_of_stock && p.out_of_stock) return existing;
          return (p.price ?? Number.MAX_SAFE_INTEGER) < (existing.price ?? Number.MAX_SAFE_INTEGER)
            ? p
            : existing;
        })();
        map.set(key, pick);
      }
    }
    return Array.from(map.values());
  }, [item.portions]);
  
  // Initialize selected size to the first available portion
  useEffect(() => {
    if (uniquePortions.length > 0 && !selectedSize) {
      setSelectedSize(uniquePortions[0].id);
    }
  }, [uniquePortions, selectedSize]);

  const selectedPortion = (item.portions || []).find((p: any) => p.id === selectedSize) || uniquePortions[0];
  const cartQuantity = getCartQuantity(selectedPortion?.id || item.id);
  const hasMultipleSizes = uniquePortions && uniquePortions.length > 1;

  const isOutOfStock = item.out_of_stock || (selectedPortion && selectedPortion.out_of_stock);
  
  // Check if this is Dev Sweets cafe (no online ordering)
  const isDevSweets = cafe?.name && (cafe.name.toLowerCase().includes('dev') && cafe.name.toLowerCase().includes('sweet'));
  
  // Debug logging for out-of-stock items
  if (item.out_of_stock || (selectedPortion && selectedPortion.out_of_stock)) {
    console.log('🔍 Out of Stock Item:', {
      itemName: item.baseName || item.name,
      itemOutOfStock: item.out_of_stock,
      selectedPortionOutOfStock: selectedPortion?.out_of_stock,
      isOutOfStock
    });
  }

  return (
    <Card className={`group bg-white border border-orange-100 shadow-sm hover:shadow-md transition-all duration-300 ${isOutOfStock ? 'opacity-60' : ''}`}>
      <CardContent className="p-4">
        {/* Food Details Header */}
        <div className="flex items-start justify-between mb-3">
          <div className={`flex-1 ${item.category === 'Thali' ? 'min-h-[120px]' : ''}`}>
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-gray-900 text-lg">
                {item.baseName || item.name}
              </h3>
              {isOutOfStock && (
                <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full font-medium">
                  Out of Stock
                </span>
              )}
            </div>
            <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
              {item.description}
            </p>
          </div>
          
          {/* Favorite Button */}
          {onToggleFavorite && (
            <Button
              variant="ghost"
              size="sm"
              className="w-8 h-8 p-0 hover:bg-orange-50 rounded-full"
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite(item.id);
              }}
            >
              <Heart 
                className={cn(
                  "w-4 h-4",
                  isFavorite?.(item.id) ? "text-red-500 fill-current" : "text-gray-400"
                )} 
              />
            </Button>
          )}
        </div>

        {/* Size Selector - Only show if multiple sizes available */}
        {hasMultipleSizes && (
          <div className="mb-3">
            <div className="flex flex-wrap gap-2">
              {uniquePortions.map((portion: any) => {
                const isPortionOutOfStock = portion.out_of_stock;
                return (
                  <Button
                    key={portion.id}
                    variant={selectedSize === portion.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => !isPortionOutOfStock && setSelectedSize(portion.id)}
                    disabled={isPortionOutOfStock}
                    className={cn(
                      "text-xs px-2 py-1 rounded-full transition-all duration-200 flex-shrink-0",
                      isPortionOutOfStock
                        ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                        : selectedSize === portion.id
                        ? "bg-orange-100 text-orange-700 border border-orange-300 shadow-sm"
                        : "bg-white text-gray-600 border-orange-200 hover:bg-orange-50"
                    )}
                  >
                    {portion.name} - ₹{portion.price} {isPortionOutOfStock && "(Out of Stock)"}
                  </Button>
                );
              })}
            </div>
          </div>
        )}
        
        {/* Price and Controls */}
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-xl font-bold text-gray-900">
              ₹{selectedPortion?.price || item.price}
            </span>
          </div>
          
          {/* Quantity Controls */}
          <div className="flex items-center gap-2">
            {isOutOfStock ? (
              <Button
                disabled
                className="bg-gray-300 text-gray-500 px-6 py-2 rounded-full text-sm font-medium cursor-not-allowed"
              >
                Out of Stock
              </Button>
            ) : cartQuantity > 0 ? (
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-8 h-8 p-0 rounded-full border-orange-200 hover:bg-orange-50"
                  onClick={() => {
                    // Create a cart item structure for removal
                    const cartItem = {
                      item: {
                        id: selectedPortion?.id || item.id,
                        name: item.baseName || item.name,
                        description: item.description,
                        price: selectedPortion?.price || item.price,
                        category: item.category,
                        preparation_time: item.preparation_time,
                        is_available: !selectedPortion?.out_of_stock && !item.out_of_stock
                      },
                      selectedPortion: selectedPortion?.id || item.id,
                      quantity: cartQuantity,
                      notes: ''
                    };
                    onRemoveFromCart(cartItem);
                  }}
                >
                  <Minus className="w-3 h-3" />
                </Button>
                <span className="text-sm font-medium w-6 text-center">
                  {cartQuantity}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-8 h-8 p-0 rounded-full border-orange-200 hover:bg-orange-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={() => cafe?.accepting_orders !== false && onAddToCart(item, selectedSize || uniquePortions[0]?.id)}
                  disabled={cafe?.accepting_orders === false}
                >
                  <Plus className="w-3 h-3" />
                </Button>
              </div>
            ) : isDevSweets ? (
              <Badge className="bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium">
                📞 Call to Order
              </Badge>
            ) : cafe?.accepting_orders === false ? (
              <Badge className="bg-gray-100 text-gray-600 px-4 py-2 rounded-full text-sm font-medium border border-gray-300">
                Closed
              </Badge>
            ) : (
              <Button
                onClick={() => onAddToCart(item, selectedSize || uniquePortions[0]?.id)}
                className="bg-white hover:bg-orange-50 text-orange-600 border-2 border-orange-500 px-6 py-2 rounded-full text-sm font-medium shadow-sm"
              >
                Add
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Modern Cart Panel Component
const ModernCartPanel: React.FC<{
  cart: any;
  getTotalAmount: () => number;
  getCartItemCount: () => number;
  onCheckout: () => void;
  onRemoveFromCart: (item: any) => void;
  cafe: any;
}> = ({ cart, getTotalAmount, getCartItemCount, onCheckout, onRemoveFromCart, cafe }) => {
  const cartItems = Object.values(cart);
  const deliveryFee = 10;
  const minimumOrder = 89;

  return (
    <div className="bg-white rounded-xl shadow-lg border border-orange-100 sticky top-24">
      {/* Cart Header */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">My Cart</h3>
        </div>
        
        {/* Cart Cafe Info */}
        {cartItems.length > 0 && (
          <div className="mt-2 p-2 bg-orange-50 rounded-lg border border-orange-200">
            <div className="flex items-center gap-2 text-sm">
              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
              <span className="text-orange-700 font-medium">
                Items from {(cartItems[0] as any)?.item?.cafe_name || 'Previous Cafe'}
              </span>
            </div>
            {(cartItems[0] as any)?.item?.cafe_name !== cafe?.name && (
              <p className="text-xs text-orange-600 mt-1">
                Checkout will be for {(cartItems[0] as any)?.item?.cafe_name || 'Previous Cafe'}
              </p>
            )}
          </div>
        )}
        
        {/* Delivery Info removed as per UX decision to avoid noise in cart panel */}
      </div>

      {/* Cart Items */}
      <div className="p-4 max-h-96 overflow-y-auto">
        {cartItems.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-2">🛒</div>
            <p className="text-gray-500 text-sm">Your cart is empty</p>
          </div>
        ) : (
          <div className="space-y-3">
       {cartItems.map((cartItem: any, index) => {
         const isFreeBogoItem = (cartItem.item.baseName || cartItem.item.name).startsWith('FREE ') && (cartItem.item.price || cartItem.item.portions?.[0]?.price) === 0;
         
         return (
           <div 
             key={index} 
             className={`flex items-center gap-3 p-3 rounded-lg ${
               isFreeBogoItem 
                 ? 'bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 shadow-sm' 
                 : 'bg-gray-50'
             }`}
           >
             <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-gradient-to-br from-orange-100 to-red-100">
               <span className="text-lg">🍽️</span>
             </div>
             <div className="flex-1 min-w-0">
               <div className="flex items-center gap-2">
                 <h4 className={`text-sm font-medium line-clamp-1 ${
                   isFreeBogoItem ? 'text-green-800' : 'text-gray-900'
                 }`}>
                   {cartItem.item.baseName || cartItem.item.name}
                 </h4>
                 {/* Removed FREE BOGO Badge */}
               </div>
               <p className="text-xs text-gray-500">Qty: {cartItem.quantity}</p>
             </div>
             <div className="text-right">
               <p className={`text-sm font-medium ${
                 isFreeBogoItem ? 'text-green-600' : 'text-gray-900'
               }`}>
                 {isFreeBogoItem ? 'FREE' : `₹${(cartItem.item.price || cartItem.item.portions?.[0]?.price) * cartItem.quantity}`}
               </p>
               <Button
                 variant="ghost"
                 size="sm"
                 onClick={() => onRemoveFromCart(cartItem)}
                 className="text-red-500 hover:text-red-600 p-1 h-auto"
               >
                 Remove
               </Button>
             </div>
           </div>
         );
       })}
          </div>
        )}
      </div>

      {/* Cart Summary */}
      {cartItems.length > 0 && (
        <div className="p-4 border-t border-gray-100">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Sub Total</span>
              <span className="font-medium">₹{getTotalAmount()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Delivery Fee</span>
              <span className="font-medium">
                {getTotalAmount() >= minimumOrder ? "Free" : `₹${deliveryFee}`}
              </span>
            </div>
            <div className="flex justify-between text-base font-bold border-t border-gray-100 pt-2">
              <span>Total</span>
              <span>₹{getTotalAmount() + (getTotalAmount() >= minimumOrder ? 0 : deliveryFee)}</span>
            </div>
          </div>
          
          <Button
            onClick={onCheckout}
            className="w-full mt-4 bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-lg font-medium"
          >
            Checkout
          </Button>
        </div>
      )}
    </div>
  );
};

export default ModernMenuLayout;



