import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Search, Star, Plus, Heart, ArrowLeft, Clock, Filter, ArrowUpDown } from 'lucide-react';
import Header from '@/components/Header';
import { useCart } from '@/hooks/useCart';
import { useToast } from '@/hooks/use-toast';

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
  description: string;
}

interface CategoryState {
  categoryName: string;
  categoryIcon: string;
  itemCount: number;
}

const GroceryCategory: React.FC = () => {
  const { categoryId } = useParams<{ categoryId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { addToCart, setCafe, cart, removeFromCart } = useCart();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState<GroceryProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState('All');

  const categoryState = location.state as CategoryState;

  // Demo products for different categories
  const getCategoryProducts = (categoryId: string): GroceryProduct[] => {
    const allProducts: { [key: string]: GroceryProduct[] } = {
      '4': [ // Cereals and Breakfast
        {
          id: '1',
          name: 'Saffola Muesli Choco Crunch with Flavour Pops',
          brand: 'Saffola',
          price: 355,
          mrp: 450,
          discount: 21,
          rating: 4.5,
          reviews: 1250,
          image: '/saffola-muesli.jpg',
          category: 'Cereals',
          unit: '700g',
          inStock: true,
          description: 'Crunchy chocolate-flavored breakfast muesli'
        },
        {
          id: '2',
          name: 'Kellogg\'s Muesli Fruit & Nut & Sofit Vanilla Soya Milk Combo',
          brand: 'Kellogg\'s',
          price: 203,
          mrp: 239,
          discount: 15,
          rating: 4.3,
          reviews: 890,
          image: '/kelloggs-combo.jpg',
          category: 'Cereals',
          unit: '1 combo',
          inStock: true,
          description: 'Nutritious Breakfast, Vanilla Soya Milk Combo'
        },
        {
          id: '3',
          name: 'Yogabar High Protein Muesli, Choco Almond Cranberry',
          brand: 'Yogabar',
          price: 299,
          mrp: 299,
          discount: 0,
          rating: 4.7,
          reviews: 2100,
          image: '/yogabar-muesli.jpg',
          category: 'Cereals',
          unit: '350g',
          inStock: true,
          description: 'Whopping 21g of protein per serving to power your mornings'
        },
        {
          id: '4',
          name: 'Yogabar Muesli Dark Chocolate & Cranberry',
          brand: 'Yogabar',
          price: 399,
          mrp: 399,
          discount: 0,
          rating: 4.6,
          reviews: 980,
          image: '/yogabar-dark.jpg',
          category: 'Cereals',
          unit: '700g',
          inStock: true,
          description: 'Nutritious Dark Chocolate Muesli loaded with oats, almonds & chia seeds'
        }
      ],
      '1': [ // Fresh Vegetables
        {
          id: '5',
          name: 'Fresh Bell Peppers - Mixed Colors',
          brand: 'Farm Fresh',
          price: 45,
          mrp: 60,
          discount: 25,
          rating: 4.4,
          reviews: 320,
          image: '/bell-peppers.jpg',
          category: 'Vegetables',
          unit: '500g',
          inStock: true,
          description: 'Fresh mixed color bell peppers'
        },
        {
          id: '6',
          name: 'Organic Spinach Leaves',
          brand: 'Organic Farm',
          price: 25,
          mrp: 30,
          discount: 17,
          rating: 4.6,
          reviews: 450,
          image: '/spinach.jpg',
          category: 'Vegetables',
          unit: '200g',
          inStock: true,
          description: 'Fresh organic spinach leaves'
        }
      ]
    };

    return allProducts[categoryId] || [];
  };

  // Filter options
  const filterOptions = [
    { id: 'all', name: 'All', count: 0 },
    { id: 'crazy-deals', name: 'Crazy Deals', count: 12 },
    { id: 'muesli', name: 'Muesli & Granola', count: 8 },
    { id: 'oats', name: 'Oats', count: 15 },
    { id: 'kids', name: 'Kids Cereals', count: 6 },
    { id: 'flakes', name: 'Flakes', count: 10 },
    { id: 'new', name: 'Newly Added', count: 5 }
  ];

  useEffect(() => {
    // Simulate loading
    setTimeout(() => {
      const categoryProducts = getCategoryProducts(categoryId || '');
      setProducts(categoryProducts);
      setLoading(false);
    }, 1000);
  }, [categoryId]);

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.brand.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  // Helper function to get item quantity in cart
  const getItemQuantity = (productId: string): number => {
    return cart[productId]?.quantity || 0;
  };

  // Helper function to handle quantity changes
  const handleQuantityChange = (product: GroceryProduct, change: 'add' | 'remove') => {
    try {
      // Set grocery store as the current cafe
      const groceryStore = {
        id: 'grocery-store',
        name: 'Campus Grocery Store',
        type: 'grocery',
        location: 'B1 Ground Floor',
        accepting_orders: true
      };
      
      // Set the cafe context
      setCafe(groceryStore);
      
      const cartItem = {
        id: product.id,
        name: product.name,
        price: product.price,
        description: `${product.brand} - ${product.unit}`,
        category: product.category,
        image_url: product.image,
        is_available: product.inStock
      };
      
      if (change === 'add') {
        addToCart(cartItem, 1, '');
      } else {
        removeFromCart(product.id);
      }
      
      console.log(`${change === 'add' ? 'Added to' : 'Removed from'} cart:`, product.name);
    } catch (error) {
      console.error('Error updating cart:', error);
      toast({
        title: "Error",
        description: "Failed to update cart",
        variant: "destructive",
      });
    }
  };

  const handleAddToCart = (product: GroceryProduct) => {
    handleQuantityChange(product, 'add');
  };

  const handleBookmark = (product: GroceryProduct) => {
    console.log('Bookmarked:', product.name);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Original Header Component */}
      <Header />
      
      {/* Category Header */}
      <div className="bg-white border-b border-gray-100 sticky top-16 z-10">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Left: Back button and category info */}
            <div className="flex items-center space-x-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/grocery')}
                className="p-2"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center text-lg">
                  {categoryState?.categoryIcon || '🥣'}
                </div>
                <div>
                  <h1 className="text-lg font-bold text-gray-900">
                    {categoryState?.categoryName || 'Cereals and Breakfast'}
                  </h1>
                  <p className="text-sm text-gray-500">
                    {filteredProducts.length} items
                  </p>
                </div>
              </div>
            </div>
            
            {/* Right: Search */}
            <div className="flex items-center space-x-3">
              <Search className="w-5 h-5 text-gray-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white px-4 py-4 border-b border-gray-100">
        <div className="max-w-7xl mx-auto">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              type="text"
              placeholder="Search in this category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-pink-500 w-full"
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* Left Sidebar - Filters */}
          <div className="w-64 flex-shrink-0">
            <div className="sticky top-24">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Filters</h3>
              <div className="space-y-2">
                {filterOptions.map((filter) => (
                  <button
                    key={filter.id}
                    onClick={() => setSelectedFilter(filter.id)}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                      selectedFilter === filter.id
                        ? 'bg-pink-100 text-pink-700 border-l-4 border-pink-500'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{filter.name}</span>
                      {filter.count > 0 && (
                        <span className="text-sm text-gray-500">({filter.count})</span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Content - Products */}
          <div className="flex-1">
            {/* Products Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {filteredProducts.length} items in {selectedFilter === 'all' ? 'All' : filterOptions.find(f => f.id === selectedFilter)?.name}
                </h2>
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm">
                  <ArrowUpDown className="w-4 h-4 mr-2" />
                  Sort
                </Button>
              </div>
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((product) => (
                <Card key={product.id} className="relative overflow-hidden hover:shadow-lg transition-shadow border-0 shadow-sm">
                  <CardContent className="p-0">
                    {/* Product Image */}
                    <div className="relative h-48 bg-gray-100">
                      <div className="absolute top-3 left-3">
                        <div className="bg-blue-500 text-white text-xs px-2 py-1 rounded">
                          Ad
                        </div>
                      </div>
                      <div className="absolute top-3 left-3 mt-6">
                        <div className="flex items-center space-x-1 bg-white/90 px-2 py-1 rounded text-xs">
                          <Clock className="w-3 h-3" />
                          <span>10 MINS</span>
                        </div>
                      </div>
                    <div className="absolute top-3 right-3">
                      {getItemQuantity(product.id) === 0 ? (
                        <Button
                          size="sm"
                          onClick={() => handleAddToCart(product)}
                          className="h-8 w-8 bg-pink-500 hover:bg-pink-600 text-white p-0 rounded-full"
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      ) : (
                        <div className="flex items-center bg-white rounded-full shadow-lg">
                          <Button
                            size="sm"
                            onClick={() => handleQuantityChange(product, 'remove')}
                            className="h-8 w-8 bg-gray-100 hover:bg-gray-200 text-gray-700 p-0 rounded-full"
                          >
                            <span className="text-sm font-medium">-</span>
                          </Button>
                          <span className="px-3 text-sm font-medium text-gray-700">
                            {getItemQuantity(product.id)}
                          </span>
                          <Button
                            size="sm"
                            onClick={() => handleQuantityChange(product, 'add')}
                            className="h-8 w-8 bg-pink-500 hover:bg-pink-600 text-white p-0 rounded-full"
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                      {product.discount > 0 && (
                        <div className="absolute bottom-3 left-3">
                          <Badge className="bg-green-500 text-white text-xs">
                            {product.discount}% OFF
                          </Badge>
                        </div>
                      )}
                      <div className="flex items-center justify-center h-full text-5xl">
                        {product.category === 'Cereals' && '🥣'}
                        {product.category === 'Vegetables' && '🥬'}
                      </div>
                    </div>

                    {/* Product Info */}
                    <div className="p-4">
                      <div className="text-xs text-gray-500 mb-2">{product.unit}</div>
                      <h3 className="text-sm font-medium text-gray-900 mb-2 line-clamp-2">
                        {product.name}
                      </h3>
                      <p className="text-xs text-gray-600 mb-3 line-clamp-2">
                        {product.description}
                      </p>
                      <div className="flex items-center mb-3">
                        <Star className="w-3 h-3 text-yellow-400 fill-current mr-1" />
                        <span className="text-xs text-gray-600">
                          {product.rating} ({product.reviews})
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-lg font-bold text-gray-900">₹{product.price}</span>
                          {product.mrp > product.price && (
                            <span className="text-sm text-gray-500 line-through ml-2">₹{product.mrp}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* No products message */}
            {filteredProducts.length === 0 && (
              <div className="text-center py-12">
                <div className="text-4xl mb-4">🔍</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No products found</h3>
                <p className="text-gray-600">Try adjusting your search or filters</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GroceryCategory;
