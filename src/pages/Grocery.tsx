import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Search, Star, Plus, Heart, Filter, Sort } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface GroceryProduct {
  id: string;
  name: string;
  brand: string;
  price: number;
  mrp: number;
  discount: number;
  rating: number;
  reviews: number;
  image: string;
  category: string;
  unit: string;
  inStock: boolean;
}

interface GroceryCategory {
  id: string;
  name: string;
  icon: string;
  image: string;
  itemCount: number;
}

const Grocery: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [products, setProducts] = useState<GroceryProduct[]>([]);
  const [categories, setCategories] = useState<GroceryCategory[]>([]);
  const [loading, setLoading] = useState(true);

  // Demo data for grocery categories
  const demoCategories: GroceryCategory[] = [
    { id: '1', name: 'All', icon: '🛒', image: '/grocery-all.jpg', itemCount: 150 },
    { id: '2', name: 'Fresh', icon: '🥬', image: '/grocery-fresh.jpg', itemCount: 25 },
    { id: '3', name: 'Snacks', icon: '🍪', image: '/grocery-snacks.jpg', itemCount: 40 },
    { id: '4', name: 'Beauty', icon: '💄', image: '/grocery-beauty.jpg', itemCount: 30 },
    { id: '5', name: 'Household', icon: '🧽', image: '/grocery-household.jpg', itemCount: 35 },
    { id: '6', name: 'Beverages', icon: '🥤', image: '/grocery-beverages.jpg', itemCount: 20 }
  ];

  // Demo data for products
  const demoProducts: GroceryProduct[] = [
    {
      id: '1',
      name: 'Maggi 2-Minute Noodles',
      brand: 'Maggi',
      price: 12,
      mrp: 14,
      discount: 14,
      rating: 4.5,
      reviews: 1250,
      image: '/maggi.jpg',
      category: 'Snacks',
      unit: '70g',
      inStock: true
    },
    {
      id: '2',
      name: 'Lays Classic Salted',
      brand: 'Lays',
      price: 10,
      mrp: 10,
      discount: 0,
      rating: 4.3,
      reviews: 890,
      image: '/lays.jpg',
      category: 'Snacks',
      unit: '25g',
      inStock: true
    },
    {
      id: '3',
      name: 'Amul Butter',
      brand: 'Amul',
      price: 55,
      mrp: 60,
      discount: 8,
      rating: 4.7,
      reviews: 2100,
      image: '/amul-butter.jpg',
      category: 'Fresh',
      unit: '100g',
      inStock: true
    },
    {
      id: '4',
      name: 'Dove Soap',
      brand: 'Dove',
      price: 45,
      mrp: 50,
      discount: 10,
      rating: 4.4,
      reviews: 1560,
      image: '/dove-soap.jpg',
      category: 'Beauty',
      unit: '75g',
      inStock: true
    },
    {
      id: '5',
      name: 'Coca Cola',
      brand: 'Coca Cola',
      price: 20,
      mrp: 20,
      discount: 0,
      rating: 4.2,
      reviews: 3200,
      image: '/coca-cola.jpg',
      category: 'Beverages',
      unit: '250ml',
      inStock: true
    },
    {
      id: '6',
      name: 'Tide Detergent',
      brand: 'Tide',
      price: 120,
      mrp: 140,
      discount: 14,
      rating: 4.6,
      reviews: 980,
      image: '/tide.jpg',
      category: 'Household',
      unit: '1kg',
      inStock: true
    }
  ];

  useEffect(() => {
    // Simulate loading
    setTimeout(() => {
      setCategories(demoCategories);
      setProducts(demoProducts);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.brand.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleAddToCart = (product: GroceryProduct) => {
    // TODO: Implement add to cart functionality
    console.log('Added to cart:', product.name);
  };

  const handleBookmark = (product: GroceryProduct) => {
    // TODO: Implement bookmark functionality
    console.log('Bookmarked:', product.name);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          {/* Search Bar */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              type="text"
              placeholder="Search for 'Milk', 'Bread', 'Soap'..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-3 text-lg border-2 border-gray-200 rounded-xl focus:border-green-500"
            />
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-2 top-1/2 transform -translate-y-1/2"
            >
              <Filter className="w-5 h-5 text-gray-500" />
            </Button>
          </div>

          {/* Category Tabs */}
          <div className="flex space-x-1 overflow-x-auto pb-2 scrollbar-hide">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.name)}
                className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === category.name
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <span className="mr-2">{category.icon}</span>
                {category.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Hot Deals Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Hot Deals</h2>
            <span className="text-sm text-green-600 font-medium">Upto 50% OFF</span>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {filteredProducts.slice(0, 6).map((product) => (
              <Card key={product.id} className="relative overflow-hidden hover:shadow-lg transition-shadow">
                <CardContent className="p-0">
                  {/* Product Image */}
                  <div className="relative h-32 bg-gray-100">
                    <div className="absolute top-2 left-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleBookmark(product)}
                        className="p-1 h-8 w-8 bg-white/80 hover:bg-white"
                      >
                        <Heart className="w-4 h-4 text-gray-500" />
                      </Button>
                    </div>
                    <div className="absolute top-2 right-2">
                      <Button
                        size="sm"
                        onClick={() => handleAddToCart(product)}
                        className="h-8 w-8 bg-green-500 hover:bg-green-600 text-white p-0"
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                    {product.discount > 0 && (
                      <div className="absolute top-2 left-1/2 transform -translate-x-1/2">
                        <Badge className="bg-red-500 text-white text-xs">
                          {product.discount}% OFF
                        </Badge>
                      </div>
                    )}
                    <div className="flex items-center justify-center h-full text-4xl">
                      {product.category === 'Snacks' && '🍜'}
                      {product.category === 'Fresh' && '🧈'}
                      {product.category === 'Beauty' && '🧼'}
                      {product.category === 'Beverages' && '🥤'}
                      {product.category === 'Household' && '🧽'}
                    </div>
                  </div>

                  {/* Product Info */}
                  <div className="p-3">
                    <div className="text-xs text-gray-500 mb-1">{product.unit}</div>
                    <div className="text-sm font-medium text-gray-900 mb-1 line-clamp-2">
                      {product.name}
                    </div>
                    <div className="flex items-center mb-2">
                      <Star className="w-3 h-3 text-yellow-400 fill-current mr-1" />
                      <span className="text-xs text-gray-600">
                        {product.rating} ({product.reviews})
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-sm font-bold text-gray-900">₹{product.price}</span>
                        {product.mrp > product.price && (
                          <span className="text-xs text-gray-500 line-through ml-1">₹{product.mrp}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Shop by Category */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Shop by Category</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.slice(1).map((category) => (
              <Card key={category.id} className="cursor-pointer hover:shadow-lg transition-shadow">
                <CardContent className="p-4 text-center">
                  <div className="text-4xl mb-2">{category.icon}</div>
                  <div className="text-sm font-medium text-gray-900">{category.name}</div>
                  <div className="text-xs text-gray-500">{category.itemCount} items</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* All Products */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">
              {selectedCategory === 'All' ? 'All Products' : selectedCategory}
            </h2>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm">
                <Sort className="w-4 h-4 mr-2" />
                Sort
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredProducts.map((product) => (
              <Card key={product.id} className="relative overflow-hidden hover:shadow-lg transition-shadow">
                <CardContent className="p-0">
                  {/* Product Image */}
                  <div className="relative h-40 bg-gray-100">
                    <div className="absolute top-2 left-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleBookmark(product)}
                        className="p-1 h-8 w-8 bg-white/80 hover:bg-white"
                      >
                        <Heart className="w-4 h-4 text-gray-500" />
                      </Button>
                    </div>
                    <div className="absolute top-2 right-2">
                      <Button
                        size="sm"
                        onClick={() => handleAddToCart(product)}
                        className="h-8 w-8 bg-green-500 hover:bg-green-600 text-white p-0"
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                    {product.discount > 0 && (
                      <div className="absolute top-2 left-1/2 transform -translate-x-1/2">
                        <Badge className="bg-red-500 text-white text-xs">
                          {product.discount}% OFF
                        </Badge>
                      </div>
                    )}
                    <div className="flex items-center justify-center h-full text-5xl">
                      {product.category === 'Snacks' && '🍜'}
                      {product.category === 'Fresh' && '🧈'}
                      {product.category === 'Beauty' && '🧼'}
                      {product.category === 'Beverages' && '🥤'}
                      {product.category === 'Household' && '🧽'}
                    </div>
                  </div>

                  {/* Product Info */}
                  <div className="p-4">
                    <div className="text-xs text-gray-500 mb-1">{product.unit}</div>
                    <div className="text-sm font-medium text-gray-900 mb-1 line-clamp-2">
                      {product.name}
                    </div>
                    <div className="flex items-center mb-2">
                      <Star className="w-3 h-3 text-yellow-400 fill-current mr-1" />
                      <span className="text-xs text-gray-600">
                        {product.rating} ({product.reviews})
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-sm font-bold text-gray-900">₹{product.price}</span>
                        {product.mrp > product.price && (
                          <span className="text-xs text-gray-500 line-through ml-1">₹{product.mrp}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Grocery;
