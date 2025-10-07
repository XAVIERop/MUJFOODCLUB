import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Search, Star, Plus, Heart, Filter, ArrowUpDown, ArrowLeft, Clock, MapPin, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import { useCart } from '@/hooks/useCart';
import { useToast } from '@/hooks/use-toast';
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
  const navigate = useNavigate();
  const { addToCart, setCafe, cart, removeFromCart } = useCart();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [products, setProducts] = useState<GroceryProduct[]>([]);
  const [categories, setCategories] = useState<GroceryCategory[]>([]);
  const [loading, setLoading] = useState(true);

  // Helper function to get category icon
  const getCategoryIcon = (category: string): string => {
    const iconMap: { [key: string]: string } = {
      'Snacks': '🍿',
      'Dairy': '🥛',
      'Beverages': '🥤',
      'Frozen Food': '🧊',
      'Bakery': '🍞',
      'Fruits': '🍎',
      'Vegetables': '🥬',
      'Meat': '🥩',
      'Seafood': '🐟',
      'Spices': '🌶️',
      'Grains': '🌾',
      'Oils': '🫒',
      'Sweets': '🍰',
      'Chocolates': '🍫',
      'Ice Cream': '🍦',
      'Tea': '☕',
      'Coffee': '☕',
      'Juices': '🧃',
      'Water': '💧',
      'Cereals': '🥣',
      'Biscuits': '🍪',
      'Noodles': '🍝',
      'Pasta': '🍝',
      'Rice': '🍚',
      'Atta': '🌾',
      'Dal': '🫘',
      'Masala': '🌶️',
      'Sauces': '🍅',
      'Pickles': '🥒',
      'Dry Fruits': '🥜',
      'Nuts': '🥜',
      'Seeds': '🌰',
      'Honey': '🍯',
      'Jam': '🍓',
      'Butter': '🧈',
      'Cheese': '🧀',
      'Yogurt': '🥛',
      'Milk': '🥛',
      'Eggs': '🥚',
      'Bread': '🍞',
      'Cakes': '🎂',
      'Cookies': '🍪',
      'Chips': '🍟',
      'Namkeen': '🥜',
      'Paan': '🌿',
      'Tobacco': '🚬',
      'Other': '📦'
    };
    return iconMap[category] || '📦';
  };

  // Demo data for grocery categories - Swiggy style
  const demoCategories: GroceryCategory[] = [
    { id: '1', name: 'Fresh Vegetables', icon: '🥬', image: '/fresh-vegetables.jpg', itemCount: 45 },
    { id: '2', name: 'Fresh Fruits', icon: '🍎', image: '/fresh-fruits.jpg', itemCount: 32 },
    { id: '3', name: 'Dairy, Bread and Eggs', icon: '🥛', image: '/dairy-bread.jpg', itemCount: 28 },
    { id: '4', name: 'Cereals and Breakfast', icon: '🥣', image: '/cereals.jpg', itemCount: 35 },
    { id: '5', name: 'Atta, Rice and Dal', icon: '🌾', image: '/atta-rice.jpg', itemCount: 42 },
    { id: '6', name: 'Oils and Ghee', icon: '🫒', image: '/oils-ghee.jpg', itemCount: 18 },
    { id: '7', name: 'Masalas', icon: '🌶️', image: '/masalas.jpg', itemCount: 25 },
    { id: '8', name: 'Dry Fruits and Seeds Mix', icon: '🥜', image: '/dry-fruits.jpg', itemCount: 22 },
    { id: '9', name: 'Biscuits and Cakes', icon: '🍪', image: '/biscuits-cakes.jpg', itemCount: 38 },
    { id: '10', name: 'Tea, Coffee and Milk drinks', icon: '☕', image: '/tea-coffee.jpg', itemCount: 30 },
    { id: '11', name: 'Sauces and Spreads', icon: '🍅', image: '/sauces-spreads.jpg', itemCount: 20 },
    { id: '12', name: 'Meat and Seafood', icon: '🥩', image: '/meat-seafood.jpg', itemCount: 15 }
  ];

  // Snacks & drinks categories
  const snacksCategories: GroceryCategory[] = [
    { id: '13', name: 'Cold Drinks and Juices', icon: '🥤', image: '/cold-drinks.jpg', itemCount: 25 },
    { id: '14', name: 'Ice Creams and Frozen Desserts', icon: '🍦', image: '/ice-cream.jpg', itemCount: 18 },
    { id: '15', name: 'Chips and Namkeens', icon: '🍿', image: '/chips-namkeen.jpg', itemCount: 35 },
    { id: '16', name: 'Chocolates', icon: '🍫', image: '/chocolates.jpg', itemCount: 28 },
    { id: '17', name: 'Noodles, Pasta, Vermicelli', icon: '🍝', image: '/noodles-pasta.jpg', itemCount: 22 },
    { id: '18', name: 'Frozen Food', icon: '🧊', image: '/frozen-food.jpg', itemCount: 20 },
    { id: '19', name: 'Sweet Corner', icon: '🍰', image: '/sweet-corner.jpg', itemCount: 15 },
    { id: '20', name: 'Paan Corner', icon: '🌿', image: '/paan-corner.jpg', itemCount: 12 }
  ];

  // Fetch real grocery products from database
  const fetchGroceryProducts = async () => {
    try {
      setLoading(true);
      
      // Get 24 Seven Mart cafe ID
      const { data: cafeData, error: cafeError } = await supabase
        .from('cafes')
        .select('id')
        .eq('name', '24 Seven Mart')
        .single();
      
      if (cafeError || !cafeData) {
        console.error('Error fetching 24 Seven Mart:', cafeError);
        return;
      }
      
      // Fetch menu items for 24 Seven Mart
      const { data: menuData, error: menuError } = await supabase
        .from('menu_items')
        .select('*')
        .eq('cafe_id', cafeData.id)
        .eq('is_available', true)
        .order('category', { ascending: true });
      
      if (menuError) {
        console.error('Error fetching grocery items:', menuError);
        return;
      }
      
      // Convert menu items to grocery products format
      const groceryProducts: GroceryProduct[] = (menuData || []).map(item => ({
        id: item.id,
        name: item.name,
        brand: '24 Seven Mart',
        price: item.price,
        mrp: item.price * 1.1, // 10% markup for MRP
        discount: 0,
        rating: 4.5,
        reviews: Math.floor(Math.random() * 1000) + 100,
        image: item.image_url || '/menu_hero.png',
        category: item.category,
        unit: '1 piece',
        inStock: item.is_available
      }));
      
      setProducts(groceryProducts);
      
      // Set categories from products
      const uniqueCategories = [...new Set(groceryProducts.map(p => p.category))];
      setCategories(uniqueCategories.map(cat => ({
        id: cat.toLowerCase().replace(/\s+/g, '-'),
        name: cat,
        icon: getCategoryIcon(cat),
        itemCount: groceryProducts.filter(p => p.category === cat).length
      })));
      
    } catch (error) {
      console.error('Error fetching grocery products:', error);
    } finally {
      setLoading(false);
    }
  };

  // Demo data for products (fallback)
  const demoProducts: GroceryProduct[] = [
    // Snacks
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
      name: 'Parle-G Biscuits',
      brand: 'Parle',
      price: 5,
      mrp: 5,
      discount: 0,
      rating: 4.8,
      reviews: 3200,
      image: '/parle-g.jpg',
      category: 'Snacks',
      unit: '100g',
      inStock: true
    },
    {
      id: '4',
      name: 'Kurkure Masala Munch',
      brand: 'Kurkure',
      price: 15,
      mrp: 18,
      discount: 17,
      rating: 4.2,
      reviews: 650,
      image: '/kurkure.jpg',
      category: 'Snacks',
      unit: '30g',
      inStock: true
    },
    {
      id: '5',
      name: 'Oreo Cookies',
      brand: 'Oreo',
      price: 25,
      mrp: 30,
      discount: 17,
      rating: 4.6,
      reviews: 1800,
      image: '/oreo.jpg',
      category: 'Snacks',
      unit: '100g',
      inStock: true
    },

    // Fresh/Dairy
    {
      id: '6',
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
      id: '7',
      name: 'Amul Fresh Milk',
      brand: 'Amul',
      price: 25,
      mrp: 25,
      discount: 0,
      rating: 4.5,
      reviews: 1500,
      image: '/amul-milk.jpg',
      category: 'Fresh',
      unit: '500ml',
      inStock: true
    },
    {
      id: '8',
      name: 'Britannia Bread',
      brand: 'Britannia',
      price: 30,
      mrp: 35,
      discount: 14,
      rating: 4.4,
      reviews: 950,
      image: '/britannia-bread.jpg',
      category: 'Fresh',
      unit: '400g',
      inStock: true
    },
    {
      id: '9',
      name: 'Amul Cheese Slices',
      brand: 'Amul',
      price: 45,
      mrp: 50,
      discount: 10,
      rating: 4.3,
      reviews: 750,
      image: '/amul-cheese.jpg',
      category: 'Fresh',
      unit: '100g',
      inStock: true
    },

    // Beauty & Personal Care
    {
      id: '10',
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
      id: '11',
      name: 'Head & Shoulders Shampoo',
      brand: 'Head & Shoulders',
      price: 120,
      mrp: 140,
      discount: 14,
      rating: 4.5,
      reviews: 1200,
      image: '/head-shoulders.jpg',
      category: 'Beauty',
      unit: '200ml',
      inStock: true
    },
    {
      id: '12',
      name: 'Colgate Toothpaste',
      brand: 'Colgate',
      price: 35,
      mrp: 40,
      discount: 13,
      rating: 4.6,
      reviews: 2100,
      image: '/colgate.jpg',
      category: 'Beauty',
      unit: '100g',
      inStock: true
    },
    {
      id: '13',
      name: 'Lakme Face Cream',
      brand: 'Lakme',
      price: 85,
      mrp: 100,
      discount: 15,
      rating: 4.2,
      reviews: 680,
      image: '/lakme.jpg',
      category: 'Beauty',
      unit: '50g',
      inStock: true
    },

    // Beverages
    {
      id: '14',
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
      id: '15',
      name: 'Red Bull Energy Drink',
      brand: 'Red Bull',
      price: 95,
      mrp: 100,
      discount: 5,
      rating: 4.1,
      reviews: 850,
      image: '/red-bull.jpg',
      category: 'Beverages',
      unit: '250ml',
      inStock: true
    },
    {
      id: '16',
      name: 'Tata Tea Gold',
      brand: 'Tata',
      price: 45,
      mrp: 50,
      discount: 10,
      rating: 4.7,
      reviews: 1800,
      image: '/tata-tea.jpg',
      category: 'Beverages',
      unit: '100g',
      inStock: true
    },
    {
      id: '17',
      name: 'Nescafe Coffee',
      brand: 'Nescafe',
      price: 65,
      mrp: 75,
      discount: 13,
      rating: 4.4,
      reviews: 1200,
      image: '/nescafe.jpg',
      category: 'Beverages',
      unit: '50g',
      inStock: true
    },

    // Household
    {
      id: '18',
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
    },
    {
      id: '19',
      name: 'Vim Dishwash Gel',
      brand: 'Vim',
      price: 35,
      mrp: 40,
      discount: 13,
      rating: 4.3,
      reviews: 750,
      image: '/vim.jpg',
      category: 'Household',
      unit: '250ml',
      inStock: true
    },
    {
      id: '20',
      name: 'Good Knight Mosquito Repellent',
      brand: 'Good Knight',
      price: 25,
      mrp: 30,
      discount: 17,
      rating: 4.0,
      reviews: 420,
      image: '/good-knight.jpg',
      category: 'Household',
      unit: '45ml',
      inStock: true
    },
    {
      id: '21',
      name: 'Harpic Toilet Cleaner',
      brand: 'Harpic',
      price: 55,
      mrp: 65,
      discount: 15,
      rating: 4.5,
      reviews: 680,
      image: '/harpic.jpg',
      category: 'Household',
      unit: '500ml',
      inStock: true
    }
  ];

  useEffect(() => {
    // Clear any old grocery cart data first
    setCafe(null);
    
    // Fetch real grocery products from database
    fetchGroceryProducts();
  }, []);

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.brand.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
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
        id: '90796879-9f3e-4e82-a639-d30d6095735a', // 24 Seven Mart UUID
        name: '24 Seven Mart',
        type: 'grocery',
        location: 'B1 Ground Floor, GHS',
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
    // TODO: Implement bookmark functionality
    console.log('Bookmarked:', product.name);
  };

  const handleCategoryClick = (category: GroceryCategory) => {
    // Navigate to category page
    navigate(`/grocery/category/${category.id}`, { 
      state: { 
        categoryName: category.name,
        categoryIcon: category.icon,
        itemCount: category.itemCount 
      } 
    });
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Original Header Component */}
      <Header />

      {/* Main Search Bar */}
      <div className="bg-white px-4 py-4">
        <div className="max-w-7xl mx-auto">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              type="text"
              placeholder="Search for 'Cookies'"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 pr-4 py-4 text-lg border-2 border-gray-200 rounded-xl focus:border-pink-500 w-full"
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 pb-20">
        {/* Grocery & Kitchen Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Grocery & Kitchen</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {demoCategories.map((category) => (
              <Card 
                key={category.id} 
                className="cursor-pointer hover:shadow-lg transition-all duration-200 border-0 shadow-sm"
                onClick={() => handleCategoryClick(category)}
              >
                <CardContent className="p-4 text-center">
                  <div className="w-16 h-16 mx-auto mb-3 bg-gray-100 rounded-lg flex items-center justify-center text-3xl">
                    {category.icon}
                  </div>
                  <div className="text-sm font-medium text-gray-900 text-center leading-tight">
                    {category.name}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Snacks & drinks Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Snacks & drinks</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {snacksCategories.map((category) => (
              <Card 
                key={category.id} 
                className="cursor-pointer hover:shadow-lg transition-all duration-200 border-0 shadow-sm"
                onClick={() => handleCategoryClick(category)}
              >
                <CardContent className="p-4 text-center">
                  <div className="w-16 h-16 mx-auto mb-3 bg-gray-100 rounded-lg flex items-center justify-center text-3xl">
                    {category.icon}
                  </div>
                  <div className="text-sm font-medium text-gray-900 text-center leading-tight">
                    {category.name}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Quick Picks Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Hey there, your quick picks</h2>
            <button className="text-pink-500 text-sm font-medium flex items-center">
              See All <ChevronRight className="w-4 h-4 ml-1" />
            </button>
          </div>
          
          <div className="flex space-x-4 overflow-x-auto pb-2 scrollbar-hide">
            {filteredProducts.slice(0, 8).map((product) => (
              <Card key={product.id} className="flex-shrink-0 w-48 relative overflow-hidden hover:shadow-lg transition-shadow border-0 shadow-sm">
                <CardContent className="p-0">
                  {/* Product Image */}
                  <div className="relative h-32 bg-gray-100">
                    <div className="absolute top-2 right-2">
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
                      <div className="absolute top-2 left-2">
                        <Badge className="bg-green-500 text-white text-xs">
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
      </div>

      {/* Free Delivery Banner */}
      <div className="fixed bottom-0 left-0 right-0 bg-pink-500 text-white py-3 px-4 flex items-center justify-center space-x-2">
        <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
          <div className="w-3 h-3 bg-pink-500 rounded-full"></div>
        </div>
        <span className="text-sm font-medium">FREE DELIVERY on orders above ₹99</span>
      </div>
    </div>
  );
};

export default Grocery;