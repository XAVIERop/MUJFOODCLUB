import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Filter, ShoppingCart, Plus, Minus, ArrowLeft } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useCart } from '@/hooks/useCart';
import { getImageUrl } from '@/utils/imageSource';
import { getGroceryProductImage } from '@/utils/groceryImageMatcher';

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
  const { addToCart, removeFromCart, getItemCount, cart } = useCart();
  
  const [items, setItems] = useState<GroceryItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<GroceryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBrand, setSelectedBrand] = useState<string>('all');
  const [brands, setBrands] = useState<string[]>([]);
  const [selectedBrandName, setSelectedBrandName] = useState<string>('All Brands');

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
      
      // Get 24 Seven Mart cafe ID
      const { data: cafeData, error: cafeError } = await supabase
        .from('cafes')
        .select('id, name')
        .ilike('name', '%24 seven mart%')
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
      
      // Extract brands from item names
      const extractedBrands = new Set<string>();
      const processedItems = itemsData.map((item: any) => {
        const name = item.name;
        let brand = 'Other';
        
        // Extract brand from item name
        if (name.includes('LAYS')) brand = 'Lays';
        else if (name.includes('BINGO')) brand = 'Bingo';
        else if (name.includes('CORNITOS')) brand = 'Cornitos';
        else if (name.includes('CRAX')) brand = 'Crax';
        else if (name.includes('BALAJI')) brand = 'Balaji';
        else if (name.includes('ACT2')) brand = 'Act2';
        else if (name.includes('POPZ')) brand = 'Popz';
        else if (name.includes('PEPSI')) brand = 'Pepsi';
        else if (name.includes('COKE')) brand = 'Coca Cola';
        else if (name.includes('THUMS UP')) brand = 'Thums Up';
        else if (name.includes('SPRITE')) brand = 'Sprite';
        else if (name.includes('FANTA')) brand = 'Fanta';
        else if (name.includes('MIRINDA')) brand = 'Mirinda';
        else if (name.includes('DEW')) brand = 'Mountain Dew';
        else if (name.includes('PAPERBOAT')) brand = 'Paperboat';
        else if (name.includes('WINKIES')) brand = 'Winkies';
        else if (name.includes('MONSTER')) brand = 'Monster';
        else if (name.includes('PREDATOR')) brand = 'Predator';
        
        extractedBrands.add(brand);
        
        return {
          ...item,
          brand
        };
      });

      setItems(processedItems);
      setBrands(Array.from(extractedBrands).sort());
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

  const handleAddToCart = (item: GroceryItem) => {
    addToCart(item, 1);
  };

  const handleRemoveFromCart = (itemId: string) => {
    removeFromCart(itemId);
  };

  const getCategoryTitle = () => {
    const titles: { [key: string]: string } = {
      'CHIPS': 'Chips & Snacks',
      'DRINKS': 'Drinks',
      'CAKES': 'Cakes & Desserts'
    };
    return titles[categoryId || ''] || categoryId || 'Category';
  };

  const getCategoryIcon = () => {
    const icons: { [key: string]: string } = {
      'CHIPS': '🍟',
      'DRINKS': '🥤',
      'CAKES': '🍰'
    };
    return icons[categoryId || ''] || '🛒';
  };

  const getBrandIcon = (brand: string) => {
    const icons: { [key: string]: string } = {
      'Lays': '🍟',
      'Bingo': '🥨',
      'Cornitos': '🌽',
      'Crax': '🍿',
      'Balaji': '🥔',
      'Act2': '🍿',
      'Popz': '🍫',
      'Pepsi': '🥤',
      'Coca Cola': '🥤',
      'Thums Up': '🥤',
      'Sprite': '🥤',
      'Fanta': '🥤',
      'Mirinda': '🥤',
      'Mountain Dew': '🥤',
      'Paperboat': '🧃',
      'Winkies': '🍰',
      'Monster': '⚡',
      'Predator': '⚡'
    };
    return icons[brand] || '🛒';
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/grocery')}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
                <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                  <span className="text-2xl">{getCategoryIcon()}</span>
                  {getCategoryTitle()}
                  </h1>
                <p className="text-sm text-gray-600">{filteredItems.length} items available</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <ShoppingCart className="h-5 w-5" />
              <span className="text-sm">Cart</span>
            </div>
          </div>
        </div>
      </div>

      {/* Search Bar */}
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

      {/* Two Column Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left Sidebar - Brands */}
          <div className="w-full lg:w-64 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Brands</h3>
              <div className="space-y-2">
                <button
                  onClick={() => handleBrandSelect('all', 'All Brands')}
                  className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    selectedBrand === 'all'
                      ? 'bg-orange-100 text-orange-700 border-l-4 border-orange-500'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg">🛒</span>
                    <span>All Brands</span>
                  </div>
                </button>
                {brands.map((brand) => {
                  const brandIcon = getBrandIcon(brand);
                  return (
                  <button
                      key={brand}
                      onClick={() => handleBrandSelect(brand, brand)}
                      className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        selectedBrand === brand
                          ? 'bg-orange-100 text-orange-700 border-l-4 border-orange-500'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                      <div className="flex items-center gap-3">
                        <span className="text-lg">{brandIcon}</span>
                        <span>{brand}</span>
                    </div>
                  </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Content - Products */}
          <div className="flex-1">
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                {filteredItems.length} items in {selectedBrandName}
                </h2>
              </div>

            {filteredItems.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No items found</h3>
                <p className="text-gray-600">Try adjusting your search or filter criteria</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredItems.map((item) => {
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
                    {/* Product Image */}
                        <div className="mb-3">
                          <div className="w-full h-32 bg-gray-100 rounded-lg overflow-hidden">
                            <img
                              src={getGroceryProductImage(item.name)}
                              alt={item.name}
                              className="w-full h-full object-contain"
                              onError={(e) => {
                                e.currentTarget.src = '/menu_hero.png';
                              }}
                            />
                          </div>
                        </div>
                        
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
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GroceryCategory;
