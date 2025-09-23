import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useCart } from '@/hooks/useCart';
import { supabase } from '@/integrations/supabase/client';
import ModernMenuLayout from '@/components/ModernMenuLayout';
import SimpleHeader from '@/components/SimpleHeader';

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  preparation_time: number;
  is_vegetarian: boolean;
  is_available: boolean;
  out_of_stock: boolean;
  cafe_id: string;
}

interface GroupedMenuItem {
  baseName: string;
  category: string;
  description: string;
  preparation_time: number;
  is_vegetarian: boolean;
  portions: {
    id: string;
    name: string;
    price: number;
    is_available: boolean;
    out_of_stock: boolean;
  }[];
}

interface CartItem {
  item: {
    id: string;
    name: string;
    description: string;
    price: number;
    category: string;
    preparation_time: number;
    is_available: boolean;
  };
  selectedPortion: string;
  quantity: number;
  notes: string;
}

interface Cafe {
  id: string;
  name: string;
  type: string;
  description: string;
  location: string;
  phone: string;
  hours: string;
  accepting_orders: boolean;
  average_rating: number | null;
  total_ratings: number | null;
}

const MenuModern = () => {
  const { cafeIdentifier } = useParams();
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { toast } = useToast();
  
  const [cafe, setCafe] = useState<Cafe | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [groupedMenuItems, setGroupedMenuItems] = useState<GroupedMenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState<{[key: string]: CartItem}>({});
  const { setCart: setGlobalCart, setCafe: setGlobalCafe } = useCart();
  
  // Sync local cart and cafe with global cart context
  useEffect(() => {
    setGlobalCart(cart);
  }, [cart, setGlobalCart]);
  
  useEffect(() => {
    setGlobalCafe(cafe);
  }, [cafe, setGlobalCafe]);
  
  // Search and filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Helper function to determine if identifier is UUID or slug
  const isUUID = (str: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);

  // Helper function to get cafe ID from identifier
  const getCafeId = async (): Promise<string | null> => {
    if (!cafeIdentifier) return null;
    
    if (isUUID(cafeIdentifier)) {
      return cafeIdentifier;
    } else {
      // It's a slug, query the database
      const { data, error } = await supabase
        .from('cafes')
        .select('id')
        .eq('slug', cafeIdentifier)
        .single();
      
      if (error || !data) return null;
      return data.id;
    }
  };

  // Group menu items by base name and portion
  const groupMenuItems = (items: MenuItem[]): GroupedMenuItem[] => {
    const grouped = items.reduce((acc, item) => {
      // Extract base name by removing (Half) and (Full) suffixes
      let baseName = item.name;
      let portionType = 'Full'; // default
      
      if (item.name.includes(' (Half)')) {
        baseName = item.name.replace(' (Half)', '');
        portionType = 'Half';
      } else if (item.name.includes(' (Full)')) {
        baseName = item.name.replace(' (Full)', '');
        portionType = 'Full';
      }
      
      const key = baseName;
      if (!acc[key]) {
        acc[key] = {
          baseName: baseName,
          category: item.category,
          description: item.description,
          preparation_time: item.preparation_time,
          is_vegetarian: item.is_vegetarian,
          portions: []
        };
      }
      
      acc[key].portions.push({
        id: item.id,
        name: portionType,
        price: item.price,
        is_available: item.is_available,
        out_of_stock: item.out_of_stock
      });
      
      return acc;
    }, {} as {[key: string]: GroupedMenuItem});
    
    // Sort portions by price (Half first, then Full)
    Object.values(grouped).forEach(item => {
      item.portions.sort((a, b) => a.price - b.price);
    });
    
    return Object.values(grouped);
  };

  // Fetch cafe data and menu items
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        const cafeId = await getCafeId();
        if (!cafeId) {
          navigate('/cafes');
          return;
        }
        
        // Fetch cafe details
        const { data: cafeData, error: cafeError } = await supabase
          .from('cafes')
          .select('*')
          .eq('id', cafeId)
          .single();

        if (cafeError || !cafeData) {
          toast({
            title: "Cafe Not Found",
            description: "The requested cafe does not exist.",
            variant: "destructive"
          });
          navigate('/cafes');
          return;
        }
        
        setCafe(cafeData);

        // Fetch menu items
        const { data: menuData, error: menuError } = await supabase
          .from('menu_items')
          .select('*')
          .eq('cafe_id', cafeId)
          .eq('is_available', true)
          .order('category', { ascending: true });

        if (menuError) {
          console.error('Error fetching menu items:', menuError);
          return;
        }
        
        setMenuItems(menuData || []);
        
        // Group menu items by name and portion
        const grouped = groupMenuItems(menuData || []);
        setGroupedMenuItems(grouped);
        
      } catch (error) {
        console.error('Error fetching data:', error);
        toast({
          title: "Error",
          description: "Failed to load cafe data",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    if (cafeIdentifier) {
      fetchData();
    }
  }, [cafeIdentifier, navigate, toast]);

  // Cart functions
  const addToCart = (item: GroupedMenuItem, selectedPortion?: string) => {
    const portionId = selectedPortion || item.portions[0]?.id;
    if (!portionId) return;

    const cartKey = portionId;
    const existingItem = cart[cartKey];
    
    if (existingItem) {
      setCart(prev => ({
        ...prev,
        [cartKey]: {
          ...prev[cartKey],
          quantity: prev[cartKey].quantity + 1
        }
      }));
    } else {
      const portion = item.portions.find(p => p.id === portionId);
      if (!portion) return;

      setCart(prev => ({
        ...prev,
        [cartKey]: {
          item: {
            id: portion.id,
            name: item.baseName,
            description: item.description,
            price: portion.price,
            category: item.category,
            preparation_time: item.preparation_time,
            is_available: portion.is_available
          },
          selectedPortion: portionId,
          quantity: 1,
          notes: ''
        }
      }));
    }
  };

  const removeFromCart = (cartItem: CartItem) => {
    const cartKey = cartItem.selectedPortion;
    setCart(prev => {
      const newCart = { ...prev };
      if (newCart[cartKey]) {
        if (newCart[cartKey].quantity > 1) {
          newCart[cartKey].quantity -= 1;
        } else {
          delete newCart[cartKey];
        }
      }
      return newCart;
    });
  };

  const getTotalAmount = () => {
    return Object.values(cart).reduce((total, cartItem) => {
      return total + cartItem.item.price * cartItem.quantity;
    }, 0);
  };

  const getCartItemCount = () => {
    return Object.values(cart).reduce((total, cartItem) => total + cartItem.quantity, 0);
  };

  const getCartQuantity = (itemId: string) => {
    return cart[itemId]?.quantity || 0;
  };

  const handleCheckout = () => {
    if (!user) {
      navigate('/auth');
      return;
    }
    
    if (Object.keys(cart).length === 0) {
      toast({
        title: "Empty Cart",
        description: "Please add items to your cart before checkout",
        variant: "destructive"
      });
      return;
    }

    navigate('/checkout', { 
      state: { 
        cart, 
        cafe, 
        totalAmount: getTotalAmount() 
      } 
    });
  };

  // Filter menu items based on search and category
  const getFilteredMenuItems = () => {
    let filtered = groupedMenuItems;
    
    // Apply veg/non-veg filter
    if (selectedCategory === 'veg') {
      filtered = filtered.filter(item => item.is_vegetarian === true);
    } else if (selectedCategory === 'non-veg') {
      filtered = filtered.filter(item => item.is_vegetarian === false);
    }
    
    // Apply menu category filter (use selectedCategory for menu categories too)
    if (selectedCategory !== 'all' && selectedCategory !== 'veg' && selectedCategory !== 'non-veg') {
      filtered = filtered.filter(item => item.category === selectedCategory);
    }
    
    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(item => 
        item.baseName.toLowerCase().includes(query) || 
        item.description.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query)
      );
    }
    
    return filtered;
  };

  // Get categories for filter
  const categories = ['all', 'veg', 'non-veg', ...Array.from(new Set(groupedMenuItems.map(item => item.category)))];

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50">
        <SimpleHeader />
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading menu...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error states
  if (!cafeIdentifier) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50">
        <SimpleHeader />
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-center">
            <p className="text-gray-600">Redirecting to cafes...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!cafe) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50">
        <SimpleHeader />
        <div className="container mx-auto px-4 py-8">
          <p className="text-center text-gray-600">Cafe not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <SimpleHeader />
      <ModernMenuLayout
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        categories={categories}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        menuItems={getFilteredMenuItems()}
        onAddToCart={addToCart}
        onRemoveFromCart={removeFromCart}
        getCartQuantity={getCartQuantity}
        cart={cart}
        getTotalAmount={getTotalAmount}
        getCartItemCount={getCartItemCount}
        onCheckout={handleCheckout}
        cafe={cafe}
      />
    </div>
  );
};

export default MenuModern;
