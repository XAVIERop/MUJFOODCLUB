import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Star, Plus, Minus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useCart } from '@/hooks/useCart';

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
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { addToCart, removeFromCart, cart } = useCart();

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      
      // Get 24 Seven Mart cafe ID
      const { data: cafeData, error: cafeError } = await supabase
        .from('cafes')
        .select('id, name, location, hours')
        .ilike('name', '%24 seven mart%')
        .single();
      
      if (cafeError || !cafeData) {
        console.error('Cafe not found:', cafeError);
        return;
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

      // Define category details
      const categoryDetails: GroceryCategory[] = [
        {
          id: 'CHIPS',
          name: 'Chips & Snacks',
          description: 'Crispy chips, wafers, and crunchy snacks',
          image: '/menu_hero.png',
          item_count: (categoryCounts.CHIPS || 0) + (categoryCounts.SNACKS || 0),
          icon: '🍟'
        },
        {
          id: 'DRINKS',
          name: 'Drinks',
          description: 'All beverages - soft drinks, juices, energy drinks',
          image: '/menu_hero.png',
          item_count: (categoryCounts.DRINKS || 0) + (categoryCounts.COLDDRINK || 0) + (categoryCounts.BEVERAGES || 0) + (categoryCounts.JUICES || 0) + (categoryCounts.ENERGYDRINK || 0) + (categoryCounts.MILKDRINK || 0) + (categoryCounts.SPARKLINGWATER || 0),
          icon: '🥤'
        },
        {
          id: 'CAKES',
          name: 'Cakes & Desserts',
          description: 'Sweet treats and baked goods',
          image: '/menu_hero.png',
          item_count: categoryCounts.CAKES || 0,
          icon: '🍰'
        }
      ];

      setCategories(categoryDetails);

      // Fetch featured products (limit to 20 items)
      const { data: productsData, error: productsError } = await supabase
        .from('menu_items')
        .select('*')
        .eq('cafe_id', cafeData.id)
        .eq('is_available', true)
        .order('name')
        .limit(20);
      
      if (productsError) {
        console.error('Error fetching featured products:', productsError);
        return;
      }
      
      setFeaturedProducts(productsData || []);
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
    <div className="min-h-screen bg-white">
      <Header />

      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Welcome to 24 Seven Mart
            </h1>
            <p className="text-xl md:text-2xl mb-6 text-orange-100">
              Your neighborhood grocery store - Open 24/7
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <div className="flex items-center gap-2 bg-white/20 rounded-full px-4 py-2">
                <span className="text-2xl">🛒</span>
                <span className="font-medium">Free Delivery</span>
              </div>
              <div className="flex items-center gap-2 bg-white/20 rounded-full px-4 py-2">
                <span className="text-2xl">⚡</span>
                <span className="font-medium">Fast Delivery</span>
              </div>
              <div className="flex items-center gap-2 bg-white/20 rounded-full px-4 py-2">
                <span className="text-2xl">🏪</span>
                <span className="font-medium">24/7 Open</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-1">Shop by Category</h2>
          <p className="text-gray-600 text-sm">Browse our wide selection of grocery items</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {categories.map((category) => (
            <div 
                key={category.id} 
              className="group cursor-pointer hover:shadow-lg transition-all duration-300 bg-white rounded-lg shadow-sm border border-gray-100 hover:scale-105"
              onClick={() => navigate(`/grocery/category/${category.id}`)}
            >
              {/* Product Image */}
              <div className="aspect-square p-4 flex items-center justify-center">
                <div className="text-6xl">{category.icon}</div>
                  </div>
              
              {/* Category Name */}
              <div className="p-3 text-center">
                <h3 className="text-sm font-medium text-gray-900 group-hover:text-orange-600 transition-colors">
                    {category.name}
                </h3>
                    </div>
                  </div>
            ))}
        </div>

        {/* Featured Products Section */}
        <div className="mt-12">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-1">Featured Products</h2>
            <p className="text-gray-600 text-sm">Discover our most popular items</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {featuredProducts.map((item) => {
              const cartCount = cart[item.id]?.quantity || 0;
              const isOutOfStock = item.out_of_stock || !item.is_available;
              
              return (
                <div 
                  key={item.id}
                  className={`bg-white rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200 ${
                    isOutOfStock ? 'opacity-60' : ''
                  }`}
                >
                  <div className="p-4">
                    {/* Product Name */}
                    <div className="mb-2">
                      <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 leading-tight">
                        {item.name}
                      </h3>
                    </div>
                    
                    {/* Description */}
                    <p className="text-xs text-gray-500 mb-3 line-clamp-2">
                      {item.description}
                    </p>
                    
                    {/* Price and Add Button */}
                    <div className="flex items-center justify-between">
                      <div className="text-lg font-bold text-gray-900">
                        ₹{item.price.toFixed(2)}
                      </div>
                      {isOutOfStock ? (
                        <span className="text-xs text-red-600 font-medium">
                          Out of Stock
                        </span>
                      ) : cartCount > 0 ? (
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRemoveFromCart(item.id)}
                            className="h-8 w-8 p-0 border-gray-300 hover:border-gray-400"
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span className="text-sm font-medium text-gray-900">{cartCount}</span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleAddToCart(item)}
                            className="h-8 w-8 p-0 border-gray-300 hover:border-gray-400"
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <Button
                          variant="default" 
                          size="sm"
                          className="bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-full h-8 w-8 p-0"
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
      </div>

      </div>
    </div>
  );
};

export default Grocery;
