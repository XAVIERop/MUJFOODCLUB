import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useCart } from '@/hooks/useCart';
import { supabase } from '@/integrations/supabase/client';
import ModernMenuLayout from '@/components/ModernMenuLayout';
import ItemCustomizationModal from '@/components/ItemCustomizationModal';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
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
  image_url?: string | null;
}

const MenuModern = () => {
  const { cafeIdentifier } = useParams<{ cafeIdentifier?: string }>();
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { toast } = useToast();
  
  // Handle /bannaschowki route - set identifier to 'bannaschowki' if path is /bannaschowki
  const actualIdentifier = window.location.pathname === '/bannaschowki' ? 'bannaschowki' : cafeIdentifier;
  
  const [cafe, setCafe] = useState<Cafe | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [groupedMenuItems, setGroupedMenuItems] = useState<GroupedMenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { cart, setCart, setCafe: setGlobalCafe, clearCart, setMenuItems: setGlobalMenuItems, addToCart: addToGlobalCart, removeFromCart: removeFromGlobalCart, getTotalAmount: getGlobalTotalAmount, getItemCount: getGlobalItemCount } = useCart();
  
  // Popup state (feature branch)
  const [isCustomizationModalOpen, setIsCustomizationModalOpen] = useState(false);
  const [selectedItemForCustomization, setSelectedItemForCustomization] = useState<GroupedMenuItem | null>(null);
  const [pendingPortionId, setPendingPortionId] = useState<string | undefined>(undefined);
  
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
    if (!actualIdentifier) return null;
    
    // Special handling for /bannaschowki route
    if (actualIdentifier === 'bannaschowki') {
      const { data, error } = await supabase
        .from('cafes')
        .select('id')
        .or('slug.eq.bannaschowki,name.ilike.%banna%chowki%')
        .single();
      
      if (error || !data) {
        // Fallback to hardcoded ID if query fails
        return '956b3ff2-4311-4227-b955-9d4144c3406d';
      }
      return data.id;
    }
    
    if (isUUID(actualIdentifier)) {
      return actualIdentifier;
    } else {
      // It's a slug, query the database
      const { data, error } = await supabase
        .from('cafes')
        .select('id')
        .eq('slug', actualIdentifier)
        .single();
      
      if (error || !data) return null;
      return data.id;
    }
  };

  // Group menu items by base name and portion
  const groupMenuItems = (items: MenuItem[]): GroupedMenuItem[] => {
    const isMiniMeals = cafe?.name?.toLowerCase().includes('mini meals');
    const grouped = items.reduce((acc, item) => {
      // Extract base name by removing (Half), (Full), (Veg), (Non-veg), (Chicken), (Mutton), (Regular), (Medium), (Dry), and (Gravy) suffixes
      let baseName = item.name;
      let portionType = 'Full'; // default
      let hasVariant = false;

      // Special handling for Mexican: combined Paneer/Chicken variants in various positions
      // Case A: suffix form "- Paneer / Chicken"
      const paneerChickenSuffix = /(\s*-\s*)?Paneer\s*\/\s*Chicken\s*$/i;
      // Case B: infix form like "Chili Garlic Paneer / Chicken Taco" or "Paneer Tikka / Chicken Tikka Taco"
      const paneerChickenInfix = /(.*?)(?:\bPaneer\b)\s*\/\s*(?:\bChicken\b)(.*)/i;
      if (/mexican/i.test(item.category) && (paneerChickenSuffix.test(item.name) || paneerChickenInfix.test(item.name))) {
        if (paneerChickenSuffix.test(item.name)) {
          baseName = item.name.replace(paneerChickenSuffix, '').trim();
        } else {
          // Remove the specific protein tokens around the slash, keep prefix and suffix words
          const m = item.name.match(paneerChickenInfix);
          if (m) {
            const pre = (m[1] || '').trim();
            const post = (m[2] || '').trim();
            baseName = `${pre} ${post}`.replace(/\s+/g, ' ').trim();
          }
        }
        hasVariant = true;
        const key = baseName;
        if (!acc[key]) {
          acc[key] = {
            baseName,
            category: item.category,
            description: item.description,
            preparation_time: item.preparation_time,
            is_vegetarian: item.is_vegetarian,
            portions: []
          };
        }
        // Push two synthetic portions for Paneer and Chicken using the same price
        acc[key].portions.push({
          id: `${item.id}-paneer`,
          name: 'Paneer',
          price: item.price,
          is_available: item.is_available,
          out_of_stock: item.out_of_stock
        });
        acc[key].portions.push({
          id: `${item.id}-chicken`,
          name: 'Chicken',
          price: item.price,
          is_available: item.is_available,
          out_of_stock: item.out_of_stock
        });
        return acc;
      }
      
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
      } else if (item.name.includes(' (Large)')) {
        baseName = item.name.replace(' (Large)', '');
        portionType = 'Large';
        hasVariant = true;
      } else if (item.name.includes(' (X. Large)')) {
        baseName = item.name.replace(' (X. Large)', '');
        portionType = 'X. Large';
        hasVariant = true;
      } else if (item.name.includes(' (Reg)')) {
        baseName = item.name.replace(' (Reg)', '');
        portionType = 'Regular';
        hasVariant = true;
      } else if (item.name.includes(' (Med)')) {
        baseName = item.name.replace(' (Med)', '');
        portionType = 'Medium';
        hasVariant = true;
      } else if (item.name.match(/\s*\(R\)\s*$/)) {
        // Match "(R)" at the end (for Regular size) - for beverages like "Coke (R)"
        baseName = item.name.replace(/\s*\(R\)\s*$/, '');
        portionType = 'Regular';
        hasVariant = true;
      } else if (item.name.match(/\s*\(M\)\s*$/)) {
        // Match "(M)" at the end (for Medium size) - for beverages like "Coke (M)"
        baseName = item.name.replace(/\s*\(M\)\s*$/, '');
        portionType = 'Medium';
        hasVariant = true;
      } else if (item.name.match(/\s*\(L\)\s*$/)) {
        // Match "(L)" at the end (for Large size) - for beverages like "Coke (L)"
        baseName = item.name.replace(/\s*\(L\)\s*$/, '');
        portionType = 'Large';
        hasVariant = true;
      } else if (item.name.endsWith(' - Veg')) {
        baseName = item.name.replace(' - Veg', '');
        portionType = 'Veg';
        hasVariant = true;
      } else if (item.name.endsWith(' - Chicken')) {
        baseName = item.name.replace(' - Chicken', '');
        portionType = 'Chicken';
        hasVariant = true;
      } else if (item.name.endsWith(' - Non-veg')) {
        baseName = item.name.replace(' - Non-veg', '');
        portionType = 'Non-veg';
        hasVariant = true;
      } else if (item.name.includes(' (Single Stuffing)')) {
        baseName = item.name.replace(' (Single Stuffing)', '');
        portionType = 'Single Stuffing';
        hasVariant = true;
      } else if (item.name.includes(' (Double Stuffing)')) {
        baseName = item.name.replace(' (Double Stuffing)', '');
        portionType = 'Double Stuffing';
        hasVariant = true;
      }
      
      // Special handling for Mini Meals rolls: if no stuffing variant detected and it's a roll/chaap,
      // create synthetic Single and Double stuffing portions
      if (isMiniMeals && !hasVariant && (
        item.category?.toLowerCase().includes('roll') || 
        item.category?.toLowerCase().includes('chaap') ||
        item.name.toLowerCase().includes('roll') ||
        item.name.toLowerCase().includes('chaap')
      )) {
        baseName = item.name;
        hasVariant = true;
        const key = baseName;
        if (!acc[key]) {
          acc[key] = {
            baseName,
            category: item.category,
            description: item.description,
            preparation_time: item.preparation_time,
            is_vegetarian: item.is_vegetarian,
            portions: []
          };
        }
        // Add Single Stuffing (current price) and Double Stuffing (price difference based on item price)
        // Pattern: <100: +30, 100-130: +40, >130: +40-50
        let priceDiff = 30;
        if (item.price >= 100 && item.price <= 130) {
          priceDiff = 40;
        } else if (item.price > 130) {
          priceDiff = 40; // Most items use +40, adjust to +50 only for very high prices if needed
          if (item.price > 150) priceDiff = 50;
        }
        const doublePrice = Math.round(item.price + priceDiff);
        acc[key].portions.push({
          id: item.id,
          name: 'Single Stuffing',
          price: item.price,
          is_available: item.is_available,
          out_of_stock: item.out_of_stock
        });
        acc[key].portions.push({
          id: `${item.id}-double`,
          name: 'Double Stuffing',
          price: doublePrice,
          is_available: item.is_available,
          out_of_stock: item.out_of_stock
        });
        return acc;
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
    
    // Sort portions by price (Single Stuffing first, then Double Stuffing, then Half, Full, Veg, Non-veg, Chicken, Mutton, Regular, Medium, Large, X. Large, Dry, Gravy)
    Object.values(grouped).forEach(item => {
      item.portions.sort((a, b) => {
        // First sort by type priority, then by price
        const typeOrder = { 'Single Stuffing': 1, 'Double Stuffing': 2, 'Half': 3, 'Full': 4, 'Veg': 5, 'Non-veg': 6, 'Chicken': 7, 'Mutton': 8, 'Regular': 9, 'Medium': 10, 'Large': 11, 'X. Large': 12, 'Dry': 13, 'Gravy': 14, 'Plain': 15, 'Butter': 16, 'Roasted': 17, 'Fried': 18 };
        const aOrder = typeOrder[a.name as keyof typeof typeOrder] || 20;
        const bOrder = typeOrder[b.name as keyof typeof typeOrder] || 20;
        
        if (aOrder !== bOrder) {
          return aOrder - bOrder;
        }
        return a.price - b.price;
      });
    });
    
    const groupedArray = Object.values(grouped);
    // Special-case split for combined names like "Cheesy Corn / Baked Pasta"
    // Only for Let's Go Live pasta items
    if (isLetsGoLive) {
      const expanded: GroupedMenuItem[] = [] as any;
      for (const gi of groupedArray) {
        if (/pasta/i.test(gi.category) && gi.baseName.includes(' / ')) {
          const parts = gi.baseName.split(' / ').map(p => p.trim()).filter(Boolean);
          if (parts.length === 2) {
            expanded.push({ ...gi, baseName: parts[0] });
            expanded.push({ ...gi, baseName: parts[1] });
            continue;
          }
        }
        expanded.push(gi);
      }
      // Also split Mexican combined names like "Italian / Mexican Taco" into two items
      const expandedMex: GroupedMenuItem[] = [] as any;
      for (const gi of expanded) {
        if (/mexican/i.test(gi.category) && gi.baseName.includes(' / ')) {
          const parts = gi.baseName.split(' / ').map(p => p.replace(/\s*Taco$/i, '').trim()).filter(Boolean);
          if (parts.length === 2) {
            expandedMex.push({ ...gi, baseName: `${parts[0]} Taco` });
            expandedMex.push({ ...gi, baseName: `${parts[1]} Taco` });
            continue;
          }
        }
        expandedMex.push(gi);
      }

      // For beverages in Let's Go Live, restrict to the official list
      const allowedBeveragePatterns = [
        /^Lemonade(?!\s*\()/i,
        /^Iced Tea(?!\s*\()/i,
        /^Fresh Lime Soda/i,
        /^Masala Nimbu Soda/i,
        /^Mojito/i,
        /^Cold Coffee/i,
        /^Hazelnut Cold Coffee/i,
        /^Coffee Frappe/i,
        /^Chocolate Frappe/i,
        /^Mango(?!.*Pasta)/i,
        /^Strawberry(?!.*Pasta)/i,
        /^Blueberry/i,
        /^Verr?y Berry/i,
        /^Black Currant/i,
        /^Chocolate Shake/i,
        /^Oreo/i,
        /^Chocolate Hazelnut/i,
        /^Fruit Punch/i,
        /^Brownie Shake/i,
        /^Frappe - Coffee/i,
        /^Frappe - Chocolate/i
      ];
      const isAllowedBeverage = (name: string) => allowedBeveragePatterns.some(p => p.test(name));

      const beveragesFiltered = expandedMex.map(it => ({ ...it })) as GroupedMenuItem[];
      for (let i = beveragesFiltered.length - 1; i >= 0; i--) {
        const gi = beveragesFiltered[i];
        if (/beverage/i.test(gi.category)) {
          if (!isAllowedBeverage(gi.baseName)) {
            beveragesFiltered.splice(i, 1);
          }
        }
      }
      // Collapse sizes for ALL beverages (keep only the cheapest e.g., Regular)
      beveragesFiltered.forEach(gi => {
        if (/beverage/i.test(gi.category) && gi.portions && gi.portions.length > 0) {
          const cheapest = [...gi.portions].sort((a, b) => a.price - b.price)[0];
          gi.portions = [cheapest];
        }
      });
      return beveragesFiltered;
    }
    return groupedArray;
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
        
        console.log('📸 Cafe data fetched:', {
          name: cafeData.name,
          image_url: cafeData.image_url,
          has_image: !!cafeData.image_url
        });
        
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

    if (actualIdentifier) {
      fetchData();
    }
  }, [actualIdentifier, navigate, toast]);

  // Helper function to check if a cafe is Grabit
  const isGrabitCafe = (cafeId: string | null, cafeName: string | null, cafeSlug?: string | null) => {
    if (!cafeId && !cafeName && !cafeSlug) return false;
    const name = cafeName?.toLowerCase() || '';
    const slug = cafeSlug?.toLowerCase() || '';
    return name.includes('grabit') || slug === 'grabit';
  };

  // Helper function to check if cart has items from different cafe (including Grabit detection)
  const hasItemsFromDifferentCafe = (currentCafeId: string, currentCafeName?: string | null, currentCafeSlug?: string | null) => {
    const cartItems = Object.values(cart);
    if (cartItems.length === 0) return false;
    
    // Get the first cart item's cafe info
    const firstCartItem = cartItems[0];
    const cartCafeId = firstCartItem.item.cafe_id;
    const cartCafeName = firstCartItem.item.cafe_name;
    const cartCafeSlug = firstCartItem.item.cafe_slug;
    
    // Check if cart is from Grabit
    const cartIsGrabit = isGrabitCafe(cartCafeId, cartCafeName, cartCafeSlug);
    const currentIsGrabit = isGrabitCafe(currentCafeId, currentCafeName, currentCafeSlug);
    
    // If both are Grabit or both are not Grabit, check by cafe_id
    if (cartIsGrabit && currentIsGrabit) {
      return false; // Both are Grabit, same cafe
    }
    if (!cartIsGrabit && !currentIsGrabit) {
      // Both are regular cafes, check by cafe_id
      return cartCafeId && cartCafeId !== currentCafeId;
    }
    
    // One is Grabit and one is not - different cafes
    return true;
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

  // Helpers
  const isLetsGoLive = cafe?.name === "Let's Go Live";
  const isPastaItem = (item: GroupedMenuItem) => (item.category || '').toLowerCase().includes('pasta');

  // Cart functions (wrapped to open popup for Let's Go Live pastas)
  const addToCart = (item: GroupedMenuItem, selectedPortion?: string) => {
    if (isLetsGoLive && isPastaItem(item)) {
      setSelectedItemForCustomization(item);
      setPendingPortionId(selectedPortion);
      setIsCustomizationModalOpen(true);
      return;
    }
    const portionId = selectedPortion || item.portions[0]?.id;
    if (!portionId || !cafe) return;

    // Check if cart has items from different cafe (including Grabit detection)
    if (hasItemsFromDifferentCafe(cafe.id, cafe.name, cafe.slug)) {
      console.log('🔄 Cafe mismatch detected, showing dialog');
      setPendingItem({ item, selectedPortion });
      setShowCafeSwitchDialog(true);
      return;
    }

    // Proceed with normal add to cart
    addItemToCart(item, selectedPortion);
  };

  // Handle customized pasta add-to-cart (modal confirm)
  const handlePastaAddToCart = (item: GroupedMenuItem, selectedPortion: string, selectedAddOns: string[], quantity: number, notes: string) => {
    const portionId = selectedPortion || item.portions[0]?.id;
    if (!portionId || !cafe) return;

    const portion = item.portions.find(p => p.id === portionId);
    if (!portion) return;

    let fullName = item.baseName;
    if (portion.name === 'Regular') {
      fullName = `${item.baseName} (Regular 7")`;
    } else if (portion.name === 'Medium') {
      fullName = `${item.baseName} (Medium 10")`;
    } else if (portion.name === 'Large') {
      fullName = `${item.baseName} (Large 12")`;
    }

    const addOnNote = selectedAddOns.length > 0 ? `Add-ons: ${selectedAddOns.join(', ')}` : '';
    const combinedNotes = [addOnNote, notes].filter(Boolean).join(' | ');

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

    addToGlobalCart(menuItem, quantity, combinedNotes);
    setIsCustomizationModalOpen(false);
    setSelectedItemForCustomization(null);
    setPendingPortionId(undefined);
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
    // Use the portion name to determine the full item name with size/stuffing
    let fullName = item.baseName;
    if (portion.name === 'Single Stuffing') {
      fullName = `${item.baseName} (Single Stuffing)`;
    } else if (portion.name === 'Double Stuffing') {
      fullName = `${item.baseName} (Double Stuffing)`;
    } else if (portion.name === 'Regular') {
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
    // Get the cafe that the cart items belong to
    const cartCafeId = getCartCafeId();
    const cartCafeName = getCartCafeName();
    
    // Check if this is Banna's Chowki (allows guest ordering for dine-in)
    const isBannasChowki = cartCafeName?.toLowerCase().includes('banna') ||
                           cafe?.name?.toLowerCase().includes('banna') ||
                           cafe?.slug === 'bannaschowki' ||
                           actualIdentifier === 'bannaschowki';
    
    // Allow unauthenticated users to proceed to checkout only for Banna's Chowki
    // (they can place guest orders for dine-in)
    if (!user && !isBannasChowki) {
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
    
    // REMOVED: Menu category filtering - now we show all categories and scroll to selected one
    // The scroll behavior is handled in MenuCategorySections component
    
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
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 pt-16 pb-24 lg:pb-8">
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
  if (!actualIdentifier) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 pt-16 pb-24 lg:pb-8">
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
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 pt-16 pb-24 lg:pb-8">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <p className="text-center text-gray-600">Cafe not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-16 pb-24 lg:pb-8">
      {/* Header now visible on both mobile and desktop */}
      <Header />
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

      {/* Pasta Customization Modal - feature branch only */}
      <ItemCustomizationModal
        isOpen={isCustomizationModalOpen}
        onClose={() => { setIsCustomizationModalOpen(false); setSelectedItemForCustomization(null); setPendingPortionId(undefined); }}
        item={selectedItemForCustomization}
        addOns={[]}
        onAddToCart={handlePastaAddToCart}
      />
      
      {/* Footer - Desktop only (mobile has bottom nav) */}
      <div className="hidden lg:block">
        <Footer />
      </div>
    </div>
  );
};

export default MenuModern;



