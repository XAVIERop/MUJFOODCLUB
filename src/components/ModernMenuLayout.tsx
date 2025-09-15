import React, { useState, useEffect } from 'react';
import { Search, Filter, Heart, ShoppingCart, MapPin, Clock, Star, Plus, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import PromotionalBanner from '@/components/PromotionalBanner';
import { promotionalBannerService, PromotionalBannerData } from '@/services/promotionalBannerService';

interface ModernMenuLayoutProps {
  // Search and filters
  searchQuery: string;
  onSearchChange: (query: string) => void;
  categories: string[];
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  
  // Menu items
  menuItems: any[];
  onAddToCart: (item: any) => void;
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
  const [showCart, setShowCart] = useState(false);
  const [promotionalBanners, setPromotionalBanners] = useState<PromotionalBannerData[]>([]);

  // Auto-show cart on mobile when items are added
  useEffect(() => {
    if (getCartItemCount() > 0) {
      setShowCart(true);
    }
  }, [getCartItemCount()]);

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50">
      {/* Enhanced Header Section */}
      <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-orange-100 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          {/* Search Bar */}
          <div className="relative mb-4">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
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
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* Main Content Area */}
          <div className="flex-1">
            {/* Promotional Banner */}
            {promotionalBanners.length > 0 && (
              <PromotionalBanner 
                banners={promotionalBanners}
                onDismiss={(bannerId) => {
                  setPromotionalBanners(prev => 
                    prev.filter(banner => banner.id !== bannerId)
                  );
                }}
              />
            )}
            
            {/* Debug: Show banner count */}
            {process.env.NODE_ENV === 'development' && (
              <div className="mb-4 p-2 bg-blue-100 text-blue-800 text-sm rounded">
                Debug: {promotionalBanners.length} promotional banners loaded
              </div>
            )}

            {/* Cafe Info Header */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <h1 className="text-2xl font-bold text-gray-900">{cafe?.name}</h1>
                {cafe?.average_rating && (
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="text-sm font-medium text-gray-600">
                      {cafe.average_rating.toFixed(1)} ({cafe.total_ratings})
                    </span>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  <span>{cafe?.location}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>{cafe?.hours}</span>
                </div>
              </div>
            </div>

            {/* Menu Items Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {menuItems.map((item, index) => (
                <ModernFoodCard
                  key={item.id || index}
                  item={item}
                  onAddToCart={onAddToCart}
                  onRemoveFromCart={onRemoveFromCart}
                  getCartQuantity={getCartQuantity}
                  onToggleFavorite={onToggleFavorite}
                  isFavorite={isFavorite}
                />
              ))}
            </div>
          </div>

          {/* Floating Cart Panel */}
          <div className={cn(
            "lg:block w-80",
            showCart ? "block" : "hidden"
          )}>
            <ModernCartPanel
              cart={cart}
              getTotalAmount={getTotalAmount}
              getCartItemCount={getCartItemCount}
              onCheckout={onCheckout}
              onRemoveFromCart={onRemoveFromCart}
              cafe={cafe}
              onClose={() => setShowCart(false)}
            />
          </div>
        </div>
      </div>

      {/* Mobile Cart Button */}
      {getCartItemCount() > 0 && (
        <div className="lg:hidden fixed bottom-4 right-4 z-50">
          <Button
            onClick={() => setShowCart(true)}
            className="rounded-full w-14 h-14 bg-orange-500 hover:bg-orange-600 shadow-lg"
          >
            <ShoppingCart className="w-6 h-6" />
            <Badge className="absolute -top-2 -right-2 bg-red-500 text-white text-xs min-w-[20px] h-5 flex items-center justify-center rounded-full">
              {getCartItemCount()}
            </Badge>
          </Button>
        </div>
      )}
    </div>
  );
};

// Modern Food Card Component
const ModernFoodCard: React.FC<{
  item: any;
  onAddToCart: (item: any) => void;
  onRemoveFromCart: (item: any) => void;
  getCartQuantity: (itemId: string) => number;
  onToggleFavorite?: (itemId: string) => void;
  isFavorite?: (itemId: string) => boolean;
}> = ({ item, onAddToCart, onRemoveFromCart, getCartQuantity, onToggleFavorite, isFavorite }) => {
  const cartQuantity = getCartQuantity(item.portions?.[0]?.id || item.id);
  const hasImage = item.image_url || item.photo_url;

  return (
    <Card className="group bg-white border-0 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden">
      <CardContent className="p-0">
        {/* Food Image */}
        <div className="relative h-48 bg-gradient-to-br from-orange-100 to-red-100">
          {hasImage ? (
            <img
              src={item.image_url || item.photo_url}
              alt={item.baseName || item.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-6xl opacity-20">🍽️</div>
            </div>
          )}
          
          {/* Favorite Button */}
          {onToggleFavorite && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute top-3 right-3 w-8 h-8 p-0 bg-white/80 hover:bg-white rounded-full shadow-sm"
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

          {/* Vegetarian Badge */}
          {item.is_vegetarian && (
            <Badge className="absolute top-3 left-3 bg-green-500 text-white text-xs">
              Veg
            </Badge>
          )}
        </div>

        {/* Food Details */}
        <div className="p-4">
          <h3 className="font-semibold text-gray-900 mb-1 line-clamp-1">
            {item.baseName || item.name}
          </h3>
          <p className="text-sm text-gray-500 mb-2 line-clamp-2">
            {item.description}
          </p>
          
          {/* Price and Add Button */}
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-lg font-bold text-gray-900">
                ₹{item.portions?.[0]?.price || item.price}
              </span>
              {item.preparation_time && (
                <span className="text-xs text-gray-400">
                  {item.preparation_time} mins
                </span>
              )}
            </div>
            
            {/* Quantity Controls */}
            <div className="flex items-center gap-2">
              {cartQuantity > 0 ? (
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-8 h-8 p-0 rounded-full"
                    onClick={() => onRemoveFromCart(item)}
                  >
                    <Minus className="w-3 h-3" />
                  </Button>
                  <span className="text-sm font-medium w-6 text-center">
                    {cartQuantity}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-8 h-8 p-0 rounded-full"
                    onClick={() => onAddToCart(item)}
                  >
                    <Plus className="w-3 h-3" />
                  </Button>
                </div>
              ) : (
                <Button
                  onClick={() => onAddToCart(item)}
                  className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-full text-sm font-medium shadow-sm"
                >
                  Add
                </Button>
              )}
            </div>
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
  onClose: () => void;
}> = ({ cart, getTotalAmount, getCartItemCount, onCheckout, onRemoveFromCart, cafe, onClose }) => {
  const cartItems = Object.values(cart);
  const deliveryFee = 10;
  const minimumOrder = 89;

  return (
    <div className="bg-white rounded-xl shadow-lg border border-orange-100 sticky top-24">
      {/* Cart Header */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">My Orders</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="lg:hidden p-1"
          >
            ×
          </Button>
        </div>
        
        {/* Delivery Info */}
        <div className="mt-3 text-sm text-gray-600">
          <div className="flex items-center gap-1 mb-1">
            <MapPin className="w-4 h-4" />
            <span>Delivery Address</span>
          </div>
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <span>40 mins</span>
            <span>•</span>
            <span>2 kms</span>
          </div>
        </div>
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
            {cartItems.map((cartItem: any, index) => (
              <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-100 to-red-100 rounded-lg flex items-center justify-center">
                  <span className="text-lg">🍽️</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium text-gray-900 line-clamp-1">
                    {cartItem.item.baseName || cartItem.item.name}
                  </h4>
                  <p className="text-xs text-gray-500">Qty: {cartItem.quantity}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">
                    ₹{(cartItem.item.price || cartItem.item.portions?.[0]?.price) * cartItem.quantity}
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
            ))}
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
