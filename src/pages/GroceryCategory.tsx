import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Filter, ShoppingCart, Plus, Minus, ArrowLeft } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useCart } from '@/hooks/useCart';

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
  const { addToCart, removeFromCart, getCartItemCount } = useCart();
  
  const [items, setItems] = useState<GroceryItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<GroceryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBrand, setSelectedBrand] = useState<string>('all');
  const [brands, setBrands] = useState<string[]>([]);

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
        else if (name.includes('CREX')) brand = 'Crex';
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

  const handleAddToCart = (item: GroceryItem) => {
    addToCart(item, 1);
  };

  const handleRemoveFromCart = (itemId: string) => {
    removeFromCart(itemId);
  };

  const getCategoryTitle = () => {
    const titles: { [key: string]: string } = {
      'CHIPS': 'Chips & Snacks',
      'COLDDRINK': 'Cold Drinks',
      'BEVERAGES': 'Beverages',
      'CAKES': 'Cakes & Desserts',
      'SNACKS': 'Snacks'
    };
    return titles[categoryId || ''] || categoryId || 'Category';
  };

  const getCategoryIcon = () => {
    const icons: { [key: string]: string } = {
      'CHIPS': '🍟',
      'COLDDRINK': '🥤',
      'BEVERAGES': '🧃',
      'CAKES': '🍰',
      'SNACKS': '🍿'
    };
    return icons[categoryId || ''] || '🛒';
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
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <span className="text-2xl">{getCategoryIcon()}</span>
                  {getCategoryTitle()}
                </h1>
                <p className="text-sm text-gray-600">{filteredItems.length} items available</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5 text-gray-600" />
              <span className="text-sm text-gray-600">Cart</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search items..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            {/* Brand Filter */}
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <select
                value={selectedBrand}
                onChange={(e) => setSelectedBrand(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="all">All Brands</option>
                {brands.map(brand => (
                  <option key={brand} value={brand}>{brand}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Items Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {filteredItems.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No items found</h3>
            <p className="text-gray-600">Try adjusting your search or filter criteria</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredItems.map((item) => {
              const cartCount = getCartItemCount(item.id);
              const isOutOfStock = item.out_of_stock || !item.is_available;
              
              return (
                <Card 
                  key={item.id}
                  className={`group cursor-pointer hover:shadow-lg transition-all duration-300 border-0 shadow-md hover:scale-105 ${
                    isOutOfStock ? 'opacity-60' : ''
                  }`}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg font-bold text-gray-900 line-clamp-2 group-hover:text-orange-600 transition-colors">
                          {item.name}
                        </CardTitle>
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">{item.description}</p>
                      </div>
                      {item.brand && item.brand !== 'Other' && (
                        <Badge variant="outline" className="ml-2 text-xs">
                          {item.brand}
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pt-0">
                    <div className="flex items-center justify-between mb-4">
                      <div className="text-2xl font-bold text-orange-600">
                        ₹{item.price.toFixed(2)}
                      </div>
                      {isOutOfStock && (
                        <Badge variant="destructive" className="text-xs">
                          Out of Stock
                        </Badge>
                      )}
                    </div>
                    
                    {isOutOfStock ? (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full"
                        disabled
                      >
                        Out of Stock
                      </Button>
                    ) : cartCount > 0 ? (
                      <div className="flex items-center justify-between">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRemoveFromCart(item.id)}
                          className="h-8 w-8 p-0"
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="text-sm font-medium">{cartCount}</span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleAddToCart(item)}
                          className="h-8 w-8 p-0"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <Button 
                        variant="default" 
                        size="sm" 
                        className="w-full bg-orange-500 hover:bg-orange-600"
                        onClick={() => handleAddToCart(item)}
                      >
                        Add to Cart
                      </Button>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default GroceryCategory;
