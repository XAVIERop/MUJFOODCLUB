import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Clock, MapPin, Star } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface GroceryCategory {
  id: string;
  name: string;
  description: string;
  image: string;
  item_count: number;
  icon: string;
}

const Grocery: React.FC = () => {
  const [categories, setCategories] = useState<GroceryCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

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
          item_count: categoryCounts.CHIPS || 0,
          icon: '🍟'
        },
        {
          id: 'COLDDRINK',
          name: 'Cold Drinks',
          description: 'Refreshing beverages and soft drinks',
          image: '/menu_hero.png',
          item_count: categoryCounts.COLDDRINK || 0,
          icon: '🥤'
        },
        {
          id: 'BEVERAGES',
          name: 'Beverages',
          description: 'Healthy drinks and fruit juices',
          image: '/menu_hero.png',
          item_count: categoryCounts.BEVERAGES || 0,
          icon: '🧃'
        },
        {
          id: 'CAKES',
          name: 'Cakes & Desserts',
          description: 'Sweet treats and baked goods',
          image: '/menu_hero.png',
          item_count: categoryCounts.CAKES || 0,
          icon: '🍰'
        },
        {
          id: 'SNACKS',
          name: 'Snacks',
          description: 'Quick bites and munchies',
          image: '/menu_hero.png',
          item_count: categoryCounts.SNACKS || 0,
          icon: '🍿'
        }
      ];

      setCategories(categoryDetails);
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">24 Seven Mart</h1>
              <p className="text-sm text-gray-600">Your neighborhood grocery store</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Clock className="h-4 w-4" />
                <span>24/7 Open</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <MapPin className="h-4 w-4" />
                <span>Manipal University</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Shop by Category</h2>
          <p className="text-gray-600">Browse our wide selection of grocery items</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => (
            <Card 
              key={category.id}
              className="group cursor-pointer hover:shadow-lg transition-all duration-300 border-0 shadow-md hover:scale-105"
              onClick={() => navigate(`/grocery/category/${category.id}`)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="text-3xl">{category.icon}</div>
                    <div>
                      <CardTitle className="text-xl font-bold text-gray-900 group-hover:text-orange-600 transition-colors">
                        {category.name}
                      </CardTitle>
                      <p className="text-sm text-gray-600 mt-1">{category.description}</p>
                    </div>
                  </div>
                  <Badge variant="secondary" className="bg-orange-100 text-orange-800 font-semibold">
                    {category.item_count} items
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Star className="h-4 w-4 text-yellow-500" />
                    <span>Fresh & Quality</span>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="group-hover:bg-orange-500 group-hover:text-white group-hover:border-orange-500 transition-all duration-300"
                  >
                    Browse Items
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Stats */}
        <div className="mt-12 bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Why Choose 24 Seven Mart?</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-2xl mb-2">🛒</div>
              <h4 className="font-semibold text-gray-900">Wide Selection</h4>
              <p className="text-sm text-gray-600">Hundreds of items across all categories</p>
            </div>
            <div className="text-center">
              <div className="text-2xl mb-2">⚡</div>
              <h4 className="font-semibold text-gray-900">Quick Delivery</h4>
              <p className="text-sm text-gray-600">Fast delivery to your doorstep</p>
            </div>
            <div className="text-center">
              <div className="text-2xl mb-2">💰</div>
              <h4 className="font-semibold text-gray-900">Best Prices</h4>
              <p className="text-sm text-gray-600">Competitive prices on all items</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Grocery;
