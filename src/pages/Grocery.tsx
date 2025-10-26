import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Star, Plus, Minus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useCart } from '@/hooks/useCart';
import { getImageUrl } from '@/utils/imageSource';
import { getGroceryProductImage } from '@/utils/groceryImageMatcher';

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
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { addToCart, removeFromCart, cart, setCafe } = useCart();

  // Banner data
  const banners = [
    {
      id: 1,
      title: "Fresh Grocery Delivery",
      subtitle: "Get fresh groceries delivered to your doorstep",
      image: getImageUrl('/grocery/banners/fresh-delivery.jpg') || '/menu_hero.png',
      ctaText: "Shop Now",
      ctaAction: () => document.getElementById('categories')?.scrollIntoView({ behavior: 'smooth' })
    },
    {
      id: 2,
      title: "Chips & Snacks Sale",
      subtitle: "Up to 30% off on all chips and snacks",
      image: getImageUrl('/grocery/banners/chips-sale.jpg') || '/menu_hero.png',
      ctaText: "Shop Chips",
      ctaAction: () => navigate('/grocery/category/CHIPS')
    },
    {
      id: 3,
      title: "Refreshing Drinks",
      subtitle: "Cool down with our wide range of beverages",
      image: getImageUrl('/grocery/banners/drinks-promo.jpg') || '/menu_hero.png',
      ctaText: "Shop Drinks",
      ctaAction: () => navigate('/grocery/category/DRINKS')
    }
  ];

  useEffect(() => {
    fetchCategories();
  }, []);

  // Auto-slide functionality
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBannerIndex((prevIndex) => 
        prevIndex === banners.length - 1 ? 0 : prevIndex + 1
      );
    }, 5000); // Change banner every 5 seconds

    return () => clearInterval(interval);
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      
          // Get 24 Seven Mart cafe ID
          const { data: cafeData, error: cafeError } = await supabase
            .from('cafes')
            .select('*')
            .ilike('name', '%24 seven mart%')
            .single();
          
          if (cafeError || !cafeData) {
            console.error('Cafe not found:', cafeError);
            return;
          }

          // Set the cafe context for cart operations
          setCafe(cafeData);
          console.log('✅ Grocery: Set cafe context to:', cafeData.name);
      
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

      // Define category details
      const categoryDetails: GroceryCategory[] = [
        {
          id: 'CHIPS',
          name: 'Chips & Snacks',
          description: 'Crispy chips, wafers, and crunchy snacks',
          image: getImageUrl('/grocery/categories/chips-snacks.jpg') || '/menu_hero.png',
          item_count: (categoryCounts.CHIPS || 0) + (categoryCounts.SNACKS || 0),
          icon: '🍟'
        },
        {
          id: 'DRINKS',
          name: 'Drinks',
          description: 'All beverages - soft drinks, juices, energy drinks',
          image: getImageUrl('/grocery/categories/drinks.jpg') || '/menu_hero.png',
          item_count: (categoryCounts.DRINKS || 0) + (categoryCounts.COLDDRINK || 0) + (categoryCounts.BEVERAGES || 0) + (categoryCounts.JUICES || 0) + (categoryCounts.ENERGYDRINK || 0) + (categoryCounts.MILKDRINK || 0) + (categoryCounts.SPARKLINGWATER || 0),
          icon: '🥤'
        },
        {
          id: 'CAKES',
          name: 'Cakes & Desserts',
          description: 'Sweet treats and baked goods',
          image: getImageUrl('/grocery/categories/cakes-desserts.jpg') || '/menu_hero.png',
          item_count: categoryCounts.CAKES || 0,
          icon: '🍰'
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
          
          // Set featured products (first 20 items)
          setFeaturedProducts((allProductsData || []).slice(0, 20));
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (item: GroceryItem) => {
    addToCart(item, 1);
  };

  const handleRemoveFromCart = (itemId: string) => {
    removeFromCart(itemId);
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
    <div className="min-h-screen bg-white grocery-font">
      <Header />

      {/* Sliding Banner Carousel - Hidden on Mobile */}
      <div className="hidden md:block relative overflow-hidden">
        <div className="relative h-96">
          {/* Banner Images */}
          {banners.map((banner, index) => (
            <div
              key={banner.id}
              className={`absolute inset-0 transition-opacity duration-1000 ${
                index === currentBannerIndex ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <div className="relative w-full h-full">
                <img
                  src={banner.image}
                  alt={banner.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = '/menu_hero.png';
                  }}
                />
                {/* Overlay */}
                <div className="absolute inset-0 bg-black bg-opacity-40"></div>
                
                {/* Content */}
                <div className="absolute inset-0 flex items-center">
                  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
                    <div className="max-w-2xl text-white">
                      <h1 className="text-4xl md:text-6xl font-bold mb-4 leading-tight">
                        {banner.title}
                      </h1>
                      <p className="text-xl md:text-2xl mb-8 text-gray-100">
                        {banner.subtitle}
                      </p>
                      <Button 
                        size="lg" 
                        className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-8 py-4 text-lg rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
                        onClick={banner.ctaAction}
                      >
                        <ShoppingCart className="mr-2 h-5 w-5" />
                        {banner.ctaText}
                        <span className="ml-2">→</span>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          {/* Navigation Dots */}
          <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-2">
            {banners.map((_, index) => (
              <button
                key={index}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentBannerIndex 
                    ? 'bg-orange-500 scale-125' 
                    : 'bg-white bg-opacity-50 hover:bg-opacity-75'
                }`}
                onClick={() => setCurrentBannerIndex(index)}
              />
            ))}
          </div>
          
          {/* Navigation Arrows */}
          <button
            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-20 hover:bg-opacity-30 text-white p-2 rounded-full transition-all duration-300"
            onClick={() => setCurrentBannerIndex(
              currentBannerIndex === 0 ? banners.length - 1 : currentBannerIndex - 1
            )}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          <button
            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-20 hover:bg-opacity-30 text-white p-2 rounded-full transition-all duration-300"
            onClick={() => setCurrentBannerIndex(
              currentBannerIndex === banners.length - 1 ? 0 : currentBannerIndex + 1
            )}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

        {/* Search Bar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="max-w-2xl mx-auto">
            <form onSubmit={handleSearchSubmit} className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search all grocery items..."
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm"
                value={searchQuery}
                onChange={handleSearchChange}
                onFocus={() => setShowDropdown(searchQuery.trim().length >= 2)}
                onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
              />
              
              {/* Dropdown Suggestions */}
              {showDropdown && dropdownSuggestions.length > 0 && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                  {dropdownSuggestions.map((item) => (
                    <div
                      key={item.id}
                      className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                      onClick={() => handleSuggestionClick(item)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <img
                            src={getGroceryProductImage(item.name)}
                            alt={item.name}
                            className="w-6 h-6 object-contain"
                            onError={(e) => {
                              e.currentTarget.src = '/menu_hero.png';
                            }}
                          />
                        </div>
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
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </form>
          </div>
        </div>

        {/* Categories Grid */}
        <div id="categories" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Desktop Title - Hidden on Mobile */}
          <div className="hidden md:block text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Shop by Category</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">Browse our wide selection of grocery items</p>
          </div>

          {/* Mobile: 3 categories in one row, Desktop: responsive grid */}
          <div className="grid grid-cols-3 md:grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
          {categories.map((category) => (
            <div 
                key={category.id} 
              className="group cursor-pointer hover:shadow-xl transition-all duration-300 bg-white rounded-2xl shadow-lg border border-gray-100 hover:scale-105 hover:border-orange-200"
              onClick={() => navigate(`/grocery/category/${category.id}`)}
            >
              {/* Category Card */}
              <div className="p-4 md:p-8">
                {/* Category Icon */}
                <div className="flex items-center justify-center mb-3 md:mb-6">
                  <div className="w-12 h-12 md:w-20 md:h-20 bg-gradient-to-br from-orange-100 to-orange-200 rounded-xl md:rounded-2xl flex items-center justify-center group-hover:from-orange-200 group-hover:to-orange-300 transition-all duration-300">
                    <span className="text-2xl md:text-4xl group-hover:scale-110 transition-transform duration-300">
                    {category.icon}
                    </span>
                  </div>
                </div>

                {/* Category Info */}
                <div className="text-center">
                  <h3 className="text-sm md:text-xl font-bold text-gray-900 mb-1 md:mb-2 group-hover:text-orange-600 transition-colors">
                    {category.name}
                  </h3>
                  <p className="text-gray-600 mb-2 md:mb-4 text-xs md:text-sm leading-relaxed hidden md:block">
                    {category.description}
                  </p>
                  <div className="flex items-center justify-center gap-1 md:gap-2 text-orange-600 font-semibold text-xs md:text-base">
                    <span>{category.item_count}</span>
                    <span className="text-orange-400 hidden md:inline">→</span>
                  </div>
                </div>
              </div>
            </div>
            ))}
        </div>

        {/* Featured Products / Search Results Section */}
        <div className="mt-20">
          <div className="text-center mb-12">
            {searchQuery.trim() ? (
              <>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Search Results</h2>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                  Found {filteredProducts.length} items for "{searchQuery}"
                </p>
              </>
            ) : (
              <>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Featured Products</h2>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto">Discover our most popular items</p>
              </>
            )}
          </div>
          
          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.slice(0, 8).map((item) => {
              const cartCount = cart[item.id]?.quantity || 0;
              const isOutOfStock = item.out_of_stock || !item.is_available;
              
              return (
                <div 
                  key={item.id}
                  className={`bg-white rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 hover:scale-105 ${
                    isOutOfStock ? 'opacity-60' : ''
                  }`}
                >
                  <div className="p-6">
                  {/* Product Image */}
                    <div className="mb-4">
                      <div className="w-full h-32 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl overflow-hidden flex items-center justify-center">
                        <img
                          src={getGroceryProductImage(item.name)}
                          alt={item.name}
                          className="w-full h-full object-contain p-2"
                          onError={(e) => {
                            e.currentTarget.src = '/menu_hero.png';
                          }}
                        />
                      </div>
                    </div>
                    
                    {/* Product Name */}
                    <div className="mb-3">
                      <h3 className="text-base font-bold text-gray-900 line-clamp-2 leading-tight">
                        {item.name}
                      </h3>
                    </div>
                    
                    {/* Description */}
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>
                    
                    {/* Price and Add Button */}
                    <div className="flex items-center justify-between">
                      <div className="text-xl font-bold text-gray-900">
                        ₹{item.price.toFixed(2)}
                      </div>
                      {isOutOfStock ? (
                        <span className="text-sm text-red-600 font-semibold bg-red-50 px-3 py-1 rounded-full">
                          Out of Stock
                        </span>
                      ) : cartCount > 0 ? (
                        <div className="flex items-center gap-3">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRemoveFromCart(item.id)}
                            className="h-9 w-9 p-0 border-orange-300 hover:border-orange-400 hover:bg-orange-50 rounded-full"
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span className="text-lg font-bold text-gray-900 min-w-[24px] text-center">{cartCount}</span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleAddToCart(item)}
                            className="h-9 w-9 p-0 border-orange-300 hover:border-orange-400 hover:bg-orange-50 rounded-full"
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <Button
                          variant="default" 
                          size="sm"
                          className="bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-full h-9 w-9 p-0 shadow-lg hover:shadow-xl transition-all duration-300"
                          onClick={() => handleAddToCart(item)}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
            </div>
          ) : searchQuery.trim() ? (
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
          ) : null}

          {/* Promotional Banners - Only show when not searching */}
          {!searchQuery.trim() && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 my-16">
            {/* Drinks & Beverages Banner */}
            <div className="relative bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="p-8 relative z-10">
                <h3 className="text-3xl font-bold text-gray-900 mb-2">Drinks & Beverages</h3>
                <p className="text-xl text-blue-600 font-semibold mb-6">Get Upto 30% Off</p>
                <Button 
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
                  onClick={() => navigate('/grocery/category/DRINKS')}
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
                <p className="text-xl text-orange-600 font-semibold mb-6">Get Upto 25% Off</p>
                <Button 
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
                  onClick={() => navigate('/grocery/category/CHIPS')}
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {featuredProducts.slice(8).map((item) => {
              const cartCount = cart[item.id]?.quantity || 0;
              const isOutOfStock = item.out_of_stock || !item.is_available;
              
              return (
                <div 
                  key={item.id}
                  className={`bg-white rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 hover:scale-105 ${
                    isOutOfStock ? 'opacity-60' : ''
                  }`}
                >
                  <div className="p-6">
                    {/* Product Image */}
                    <div className="mb-4">
                      <div className="w-full h-32 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl overflow-hidden flex items-center justify-center">
                        <img
                          src={getGroceryProductImage(item.name)}
                          alt={item.name}
                          className="w-full h-full object-contain p-2"
                          onError={(e) => {
                            e.currentTarget.src = '/menu_hero.png';
                          }}
                        />
                    </div>
                  </div>

                    {/* Product Name */}
                    <div className="mb-3">
                      <h3 className="text-base font-bold text-gray-900 line-clamp-2 leading-tight">
                        {item.name}
                      </h3>
                    </div>
                    
                    {/* Description */}
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>
                    
                    {/* Price and Add Button */}
                    <div className="flex items-center justify-between">
                      <div className="text-xl font-bold text-gray-900">
                        ₹{item.price.toFixed(2)}
                      </div>
                      {isOutOfStock ? (
                        <span className="text-sm text-red-600 font-semibold bg-red-50 px-3 py-1 rounded-full">
                          Out of Stock
                        </span>
                      ) : cartCount > 0 ? (
                        <div className="flex items-center gap-3">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRemoveFromCart(item.id)}
                            className="h-9 w-9 p-0 border-orange-300 hover:border-orange-400 hover:bg-orange-50 rounded-full"
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span className="text-lg font-bold text-gray-900 min-w-[24px] text-center">{cartCount}</span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleAddToCart(item)}
                            className="h-9 w-9 p-0 border-orange-300 hover:border-orange-400 hover:bg-orange-50 rounded-full"
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <Button
                          variant="default" 
                          size="sm"
                          className="bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-full h-9 w-9 p-0 shadow-lg hover:shadow-xl transition-all duration-300"
                          onClick={() => handleAddToCart(item)}
                        >
                          <Plus className="h-4 w-4" />
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
                onClick={() => navigate('/grocery/category/CHIPS')}
              >
                <span className="mr-2">🍟</span>
                Shop Chips & Snacks
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                className="border-orange-500 text-orange-600 hover:bg-orange-50 font-semibold px-8 py-3 rounded-full"
                onClick={() => navigate('/grocery/category/DRINKS')}
              >
                <span className="mr-2">🥤</span>
                Shop Drinks
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Grocery;
