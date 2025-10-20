import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useCart } from '@/hooks/useCart';
import { supabase } from '@/integrations/supabase/client';
import ModernMenuLayout from '@/components/ModernMenuLayout';
import Header from '@/components/Header';
import { CafeSwitchDialog } from '@/components/CafeSwitchDialog';

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
  const { cart, setCart, setCafe: setGlobalCafe, clearCart, setMenuItems: setGlobalMenuItems, addToCart: addToGlobalCart, removeFromCart: removeFromGlobalCart, getTotalAmount: getGlobalTotalAmount, getItemCount: getGlobalItemCount } = useCart();
  
  // Dialog state
  const [showCafeSwitchDialog, setShowCafeSwitchDialog] = useState(false);
  const [pendingItem, setPendingItem] = useState<{item: GroupedMenuItem, selectedPortion?: string} | null>(null);
  
  useEffect(() => {
    setGlobalCafe(cafe);
  }, [cafe, setGlobalCafe]);

  useEffect(() => {
    setGlobalMenuItems(menuItems);
  }, [menuItems, setGlobalMenuItems]);
  
  // Search and filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedBrand, setSelectedBrand] = useState('all');

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
      // Extract base name by removing (Half), (Full), (Veg), (Non-veg), (Chicken), (Mutton), (Regular), (Medium), (Dry), and (Gravy) suffixes
      let baseName = item.name;
      let portionType = 'Full'; // default
      let hasVariant = false;
      
      if (item.name.includes(' (Half)')) {
        baseName = item.name.replace(' (Half)', '');
        portionType = 'Half';
        hasVariant = true;
      } else if (item.name.includes(' (Full)')) {
        baseName = item.name.replace(' (Full)', '');
        portionType = 'Full';
        hasVariant = true;
      } else if (item.name.includes(' (Veg)')) {
        baseName = item.name.replace(' (Veg)', '');
        portionType = 'Veg';
        hasVariant = true;
      } else if (item.name.includes(' (Non-veg)')) {
        baseName = item.name.replace(' (Non-veg)', '');
        portionType = 'Non-veg';
        hasVariant = true;
      } else if (item.name.includes(' (Chicken)')) {
        baseName = item.name.replace(' (Chicken)', '');
        portionType = 'Chicken';
        hasVariant = true;
      } else if (item.name.includes(' (Mutton)')) {
        baseName = item.name.replace(' (Mutton)', '');
        portionType = 'Mutton';
        hasVariant = true;
      } else if (item.name.includes(' (Regular)')) {
        baseName = item.name.replace(' (Regular)', '');
        portionType = 'Regular';
        hasVariant = true;
      } else if (item.name.includes(' (Medium)')) {
        baseName = item.name.replace(' (Medium)', '');
        portionType = 'Medium';
        hasVariant = true;
      } else if (item.name.includes(' (Dry)')) {
        baseName = item.name.replace(' (Dry)', '');
        portionType = 'Dry';
        hasVariant = true;
      } else if (item.name.includes(' (Gravy)')) {
        baseName = item.name.replace(' (Gravy)', '');
        portionType = 'Gravy';
        hasVariant = true;
      } else if (item.name.includes(' (Plain)')) {
        baseName = item.name.replace(' (Plain)', '');
        portionType = 'Plain';
        hasVariant = true;
      } else if (item.name.includes(' (Butter)')) {
        baseName = item.name.replace(' (Butter)', '');
        portionType = 'Butter';
        hasVariant = true;
      } else if (item.name.includes(' (Roasted)')) {
        baseName = item.name.replace(' (Roasted)', '');
        portionType = 'Roasted';
        hasVariant = true;
      } else if (item.name.includes(' (Fried)')) {
        baseName = item.name.replace(' (Fried)', '');
        portionType = 'Fried';
        hasVariant = true;
      } else if (item.name.includes(' (Regular 7")')) {
        baseName = item.name.replace(' (Regular 7")', '');
        portionType = 'Regular';
        hasVariant = true;
      } else if (item.name.includes(' (Medium 10")')) {
        baseName = item.name.replace(' (Medium 10")', '');
        portionType = 'Medium';
        hasVariant = true;
      } else if (item.name.includes(' (Large 12")')) {
        baseName = item.name.replace(' (Large 12")', '');
        portionType = 'Large';
        hasVariant = true;
      }
      
      // Only group items that have variants, otherwise treat as individual items
      const key = hasVariant ? baseName : item.name;
      if (!acc[key]) {
        acc[key] = {
          baseName: hasVariant ? baseName : item.name,
          category: item.category,
          description: item.description,
          preparation_time: item.preparation_time,
          is_vegetarian: item.is_vegetarian,
          portions: []
        };
      }
      
      acc[key].portions.push({
        id: item.id,
        name: hasVariant ? portionType : 'Full',
        price: item.price,
        is_available: item.is_available,
        out_of_stock: item.out_of_stock
      });
      
      return acc;
    }, {} as {[key: string]: GroupedMenuItem});
    
    // Sort portions by price (Half first, then Full, then Veg, then Non-veg, then Chicken, then Mutton, then Regular, then Medium, then Large, then Dry, then Gravy)
    Object.values(grouped).forEach(item => {
      item.portions.sort((a, b) => {
        // First sort by type priority, then by price
        const typeOrder = { 'Half': 1, 'Full': 2, 'Veg': 3, 'Non-veg': 4, 'Chicken': 5, 'Mutton': 6, 'Regular': 7, 'Medium': 8, 'Large': 9, 'Dry': 10, 'Gravy': 11, 'Plain': 12, 'Butter': 13, 'Roasted': 14, 'Fried': 15 };
        const aOrder = typeOrder[a.name as keyof typeof typeOrder] || 15;
        const bOrder = typeOrder[b.name as keyof typeof typeOrder] || 15;
        
        if (aOrder !== bOrder) {
          return aOrder - bOrder;
        }
        return a.price - b.price;
      });
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

        // Fetch menu items (including out-of-stock items)
        const { data: menuData, error: menuError } = await supabase
          .from('menu_items')
          .select('*')
          .eq('cafe_id', cafeId)
          .order('category', { ascending: true });

        if (menuError) {
          console.error('Error fetching menu items:', menuError);
          return;
        }
        
        setMenuItems(menuData || []);
        
        // Debug logging for out-of-stock items
        const outOfStockItems = menuData?.filter(item => item.out_of_stock === true) || [];
        if (outOfStockItems.length > 0) {
          console.log('🔍 Found out-of-stock items in database:', outOfStockItems.map(item => ({
            name: item.name,
            out_of_stock: item.out_of_stock,
            is_available: item.is_available
          })));
        } else {
          console.log('✅ No out-of-stock items found in database');
        }
        
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

  // Helper function to check if cart has items from different cafe
  const hasItemsFromDifferentCafe = (currentCafeId: string) => {
    return Object.values(cart).some(cartItem => 
      cartItem.item.cafe_id && cartItem.item.cafe_id !== currentCafeId
    );
  };

  // Helper function to get current cafe name from cart
  const getCurrentCafeName = () => {
    const cartItems = Object.values(cart);
    if (cartItems.length === 0) return '';
    
    // Get the first item's cafe name (assuming all items are from same cafe)
    const firstItem = cartItems[0];
    return firstItem.item.cafe_name || 'Previous Cafe';
  };

  // Helper function to get cart's cafe ID
  const getCartCafeId = () => {
    const cartItems = Object.values(cart);
    if (cartItems.length === 0) return null;
    
    // Get the first item's cafe ID (assuming all items are from same cafe)
    const firstItem = cartItems[0];
    return firstItem.item.cafe_id || null;
  };

  // Helper function to get cart's cafe name
  const getCartCafeName = () => {
    const cartItems = Object.values(cart);
    if (cartItems.length === 0) return '';
    
    // Get the first item's cafe name (assuming all items are from same cafe)
    const firstItem = cartItems[0];
    return firstItem.item.cafe_name || '';
  };

  // Cart functions
  const addToCart = (item: GroupedMenuItem, selectedPortion?: string) => {
    const portionId = selectedPortion || item.portions[0]?.id;
    if (!portionId || !cafe) return;

    // Check if cart has items from different cafe
    if (hasItemsFromDifferentCafe(cafe.id)) {
      console.log('🔄 Cafe mismatch detected, showing dialog');
      setPendingItem({ item, selectedPortion });
      setShowCafeSwitchDialog(true);
      return;
    }

    // Proceed with normal add to cart
    addItemToCart(item, selectedPortion);
  };

  // Function to actually add item to cart
  const addItemToCart = (item: GroupedMenuItem, selectedPortion?: string) => {
    const portionId = selectedPortion || item.portions[0]?.id;
    if (!portionId || !cafe) return;

    console.log('🛒 Adding to cart:', {
      itemName: item.baseName,
      cafeName: cafe.name,
      cafeId: cafe.id,
      portionId
    });

    const portion = item.portions.find(p => p.id === portionId);
    if (!portion) return;

    // Create the menu item object for the global cart
    // Use the portion name to determine the full pizza name with size
    let fullName = item.baseName;
    if (portion.name === 'Regular') {
      fullName = `${item.baseName} (Regular 7")`;
    } else if (portion.name === 'Medium') {
      fullName = `${item.baseName} (Medium 10")`;
    } else if (portion.name === 'Large') {
      fullName = `${item.baseName} (Large 12")`;
    }

    const menuItem = {
      id: portion.id,
      name: fullName,
      description: item.description,
      price: portion.price,
      category: item.category,
      preparation_time: item.preparation_time,
      is_available: portion.is_available,
      cafe_id: cafe.id,
      cafe_name: cafe.name
    };

    // Use the global cart context which includes BOGO logic
    addToGlobalCart(menuItem, 1, '');
  };

  // Handle dialog confirmation
  const handleDialogConfirm = () => {
    if (pendingItem) {
      // Clear cart and add new item
      clearCart();
      // Add the pending item after clearing
      setTimeout(() => {
        addItemToCart(pendingItem.item, pendingItem.selectedPortion);
      }, 100);
    }
    setShowCafeSwitchDialog(false);
    setPendingItem(null);
  };

  // Handle dialog cancellation
  const handleDialogCancel = () => {
    setShowCafeSwitchDialog(false);
    setPendingItem(null);
  };

  const removeFromCart = (cartItem: CartItem) => {
    // Extract the item ID from the cart item
    const itemId = cartItem.item.id;
    // Use the global cart context which includes BOGO logic
    removeFromGlobalCart(itemId);
  };

  const getTotalAmount = () => {
    return getGlobalTotalAmount();
  };

  const getCartItemCount = () => {
    return getGlobalItemCount();
  };

  const getCartQuantity = (itemId: string) => {
    return cart[itemId]?.quantity || 0;
  };

  const handleCheckout = async () => {
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

    // Get the cafe that the cart items belong to
    const cartCafeId = getCartCafeId();
    const cartCafeName = getCartCafeName();
    
    if (!cartCafeId) {
      toast({
        title: "Invalid Cart",
        description: "Cart items don't have valid cafe information",
        variant: "destructive"
      });
      return;
    }

    console.log('🛒 Checkout - Cart belongs to cafe:', cartCafeName, 'ID:', cartCafeId);
    console.log('🛒 Checkout - Current page cafe:', cafe?.name, 'ID:', cafe?.id);

    // If cart belongs to different cafe than current page, fetch that cafe's data
    if (cartCafeId !== cafe?.id) {
      try {
        console.log('🔄 Checkout - Fetching cart cafe data...');
        const { data: cartCafeData, error: cartCafeError } = await supabase
          .from('cafes')
          .select('*')
          .eq('id', cartCafeId)
          .single();

        if (cartCafeError || !cartCafeData) {
          toast({
            title: "Cafe Not Found",
            description: "The cafe for your cart items could not be found",
            variant: "destructive"
          });
          return;
        }

        // Set the cart's cafe as the global cafe context
        console.log('✅ Checkout - Setting global cafe to cart cafe:', cartCafeData.name);
        setGlobalCafe(cartCafeData);
        
        // Small delay to ensure context is updated
        setTimeout(() => {
          navigate('/checkout');
        }, 100);
      } catch (error) {
        console.error('Error fetching cart cafe:', error);
        toast({
          title: "Error",
          description: "Failed to load cafe information",
          variant: "destructive"
        });
        return;
      }
    } else {
      // Cart belongs to current cafe, proceed normally
      console.log('✅ Checkout - Cart belongs to current cafe, proceeding normally');
      navigate('/checkout');
    }
  };

  // Filter menu items based on search, category, and brand
  const getFilteredMenuItems = () => {
    let filtered = groupedMenuItems;
    
    // Apply brand filter (only for Food Court)
    if (selectedBrand !== 'all' && cafe?.name === 'FOOD COURT') {
      filtered = filtered.filter(item => {
        const category = item.category;
        if (selectedBrand === 'gobblers') {
          return category.startsWith('GOBBLERS');
        } else if (selectedBrand === 'krispp') {
          return category.startsWith('KRISPP');
        } else if (selectedBrand === 'momo-street') {
          return category.startsWith('MOMO STREET');
        } else if (selectedBrand === 'waffles-more') {
          return category.startsWith('WAFFLES');
        }
        return true;
      });
    }
    
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

  // Get categories for filter (use original menuItems, not filtered groupedMenuItems)
  const categories = ['all', 'veg', 'non-veg', ...Array.from(new Set(menuItems.map(item => item.category)))];

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50">
        <Header />
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
        <Header />
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
        <Header />
        <div className="container mx-auto px-4 py-8">
          <p className="text-center text-gray-600">Cafe not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24 lg:pb-8">
      {/* Header hidden on mobile, shown on desktop */}
      <div className="hidden lg:block">
        <Header />
      </div>
      <ModernMenuLayout
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        categories={categories}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        selectedBrand={selectedBrand}
        onBrandChange={setSelectedBrand}
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
      
      {/* Cafe Switch Dialog */}
      <CafeSwitchDialog
        isOpen={showCafeSwitchDialog}
        onClose={handleDialogCancel}
        onConfirm={handleDialogConfirm}
        currentCafeName={getCurrentCafeName()}
        newCafeName={cafe?.name || ''}
        currentCartItems={Object.keys(cart).length}
      />
    </div>
  );
};

export default MenuModern;

