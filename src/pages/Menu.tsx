import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Minus, ShoppingCart, Clock, Star, ArrowLeft, Filter, Search, Phone, MessageCircle, FileText } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import SimpleHeader from '@/components/SimpleHeader';
import DirectPdfViewer from '@/components/DirectPdfViewer';
import SwiggyStyleHero from '@/components/SwiggyStyleHero';
import BrandSelector from '@/components/BrandSelector';
import ItemCustomizationModal from '@/components/ItemCustomizationModal';
import { isValidSlug } from '@/utils/slugUtils';
// Brand counting utility for Food Court
const getBrandItemCounts = (items: MenuItem[]): Record<string, number> => {
  const counts: Record<string, number> = {
    'all': items.length,
    'gobblers': 0,
    'momo-street': 0,
    'krispp': 0,
    'waffles-more': 0,
    'monginis': 0,
    'tata-bistro': 0
  };
  
  items.forEach(item => {
    const brand = item.category.split(' - ')[0].toLowerCase();
    const brandMap: Record<string, string> = {
      'gobblers': 'gobblers',
      'momo street': 'momo-street',
      'momo-street': 'momo-street',
      'krispp': 'krispp',
      'waffles': 'waffles-more',
      'waffles & more': 'waffles-more',
      'monginis': 'monginis',
      'tata bistro': 'tata-bistro'
    };
    
    const brandId = brandMap[brand];
    if (brandId && counts.hasOwnProperty(brandId)) {
      counts[brandId]++;
    }
  });
  
  return counts;
};

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  preparation_time: number;
  is_available: boolean;
  out_of_stock: boolean;
  is_vegetarian: boolean;
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
  selectedPortion: string; // portion ID
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

const Menu = () => {
  const { cafeIdentifier } = useParams();
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { toast } = useToast();
  
  const [cafe, setCafe] = useState<Cafe | null>(null);

  // Helper function to determine if identifier is UUID or slug
  const isUUID = (str: string): boolean => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(str);
  };

  // Get the actual cafe ID (either from UUID or by looking up slug)
  const getCafeId = async (): Promise<string | null> => {
    if (!cafeIdentifier) return null;
    
    console.log('Looking up cafe with identifier:', cafeIdentifier);
    
    if (isUUID(cafeIdentifier)) {
      console.log('Identifier is UUID, using directly');
      return cafeIdentifier;
    } else {
      console.log('Identifier is slug, looking up in database');
      // It's a slug, look up the cafe by slug
      const { data, error } = await supabase
        .from('cafes')
        .select('id, name, slug')
        .eq('slug', cafeIdentifier)
        .single();
      
      console.log('Slug lookup result:', { data, error });
      
      if (error || !data) {
        console.error('Cafe not found for slug:', cafeIdentifier, error);
        return null;
      }
      
      console.log('Found cafe:', data.name, 'with ID:', data.id);
      return data.id;
    }
  };
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [groupedMenuItems, setGroupedMenuItems] = useState<GroupedMenuItem[]>([]);
  const [cart, setCart] = useState<{[key: string]: CartItem}>({});
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedMenuCategory, setSelectedMenuCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
  const [customizationModalOpen, setCustomizationModalOpen] = useState(false);
  const [selectedItemForCustomization, setSelectedItemForCustomization] = useState<GroupedMenuItem | null>(null);

  useEffect(() => {
    if (cafeIdentifier) {
      fetchCafeData();
    } else {
      // If no cafeIdentifier, redirect to cafes page
      navigate('/cafes');
    }
  }, [cafeIdentifier, navigate]);

  // Real-time subscription for cafe rating updates
  useEffect(() => {
    if (!cafeIdentifier) return;

    const setupSubscription = async () => {
      const cafeId = await getCafeId();
      if (!cafeId) return;

      const channel = supabase
        .channel(`cafe-${cafeId}`)
        .on('postgres_changes', 
          { 
            event: 'UPDATE', 
            schema: 'public', 
            table: 'cafes',
            filter: `id=eq.${cafeId}`
          }, 
          (payload) => {
            console.log('Cafe updated:', payload.new);
            // Update cafe data when ratings change
            if (payload.new) {
              setCafe(prev => prev ? { ...prev, ...payload.new as Partial<Cafe> } : prev);
            }
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    };

    setupSubscription();
  }, [cafeIdentifier]);

  // Real-time subscription for menu items availability updates
  useEffect(() => {
    if (!cafeIdentifier) return;

    const setupMenuSubscription = async () => {
      const cafeId = await getCafeId();
      if (!cafeId) return;

      const channel = supabase
        .channel(`menu-items-${cafeId}`)
        .on('postgres_changes', 
          { 
            event: '*', // Listen to all changes (INSERT, UPDATE, DELETE)
            schema: 'public', 
            table: 'menu_items',
            filter: `cafe_id=eq.${cafeId}`
          }, 
          (payload) => {
            console.log('Menu item updated:', payload);
            // Refresh menu items when any menu item changes
            fetchMenuItems(cafeId);
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    };

    setupMenuSubscription();
  }, [cafeIdentifier]);

  // Separate function to fetch menu items (can be called independently)
  const fetchMenuItems = async (cafeId: string) => {
    try {
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
      console.error('Error fetching menu items:', error);
    }
  };

  const fetchCafeData = async () => {
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

      if (cafeError) {
        console.error('Cafe not found:', cafeError);
        toast({
          title: "Cafe Not Found",
          description: "The requested cafe does not exist or has been removed.",
          variant: "destructive"
        });
        navigate('/cafes');
        return;
      }
      
      if (!cafeData) {
        toast({
          title: "Cafe Not Found",
          description: "The requested cafe does not exist.",
          variant: "destructive"
        });
        navigate('/cafes');
        return;
      }
      
      setCafe(cafeData);

      // Fetch menu items using the separate function
      await fetchMenuItems(cafeId);
    } catch (error) {
      console.error('Error fetching cafe data:', error);
      toast({
        title: "Error",
        description: "Failed to load cafe menu. Please try again.",
        variant: "destructive"
      });
      navigate('/cafes');
    } finally {
      setLoading(false);
    }
  };

  // Function to group menu items by name and portion
  const groupMenuItems = (items: MenuItem[]): GroupedMenuItem[] => {
    console.log('Original menu items:', items);
    const grouped: { [key: string]: GroupedMenuItem } = {};
    
    items.forEach(item => {
      // Extract base name (remove portion indicators like " (Half)", " (Full)", " - Full", " - Half")
      const baseName = item.name.replace(/\s*[-\s]*\(?(Half|Full|Small|Large|Regular)\)?$/i, '').trim();
      const portionMatch = item.name.match(/\s*[-\s]*\(?(Half|Full|Small|Large|Regular)\)?$/i);
      const portionName = portionMatch ? portionMatch[1] : 'Regular';
      
      console.log(`Item: "${item.name}" -> Base: "${baseName}", Portion: "${portionName}"`);
      
      if (!grouped[baseName]) {
        grouped[baseName] = {
          baseName,
          category: item.category,
          description: item.description,
          preparation_time: item.preparation_time,
          is_vegetarian: item.is_vegetarian,
          portions: []
        };
      }
      
      // Check if this portion already exists (same name and price)
      const existingPortion = grouped[baseName].portions.find(p => 
        p.name === portionName && p.price === item.price
      );
      
      // Only add if it's a unique portion (different price or name)
      if (!existingPortion) {
        grouped[baseName].portions.push({
          id: item.id,
          name: portionName,
          price: item.price,
          is_available: item.is_available,
          out_of_stock: item.out_of_stock
        });
      }
    });
    
    console.log('Grouped menu items:', grouped);
    return Object.values(grouped);
  };

  // Function to manually refresh cafe data (useful for testing)
  const refreshCafeData = () => {
    if (cafeIdentifier) {
      fetchCafeData();
    }
  };

  const addToCart = (item: GroupedMenuItem, portionId: string) => {
    const selectedPortion = item.portions.find(p => p.id === portionId);
    
    if (!selectedPortion) {
      console.error('Selected portion not found:', portionId);
      return;
    }
    
    // Use portion ID as cart key for uniqueness
    const cartKey = portionId;
    
    setCart(prev => ({
      ...prev,
      [cartKey]: {
        item: {
          id: selectedPortion.id, // Use the portion ID
          name: `${item.baseName} (${selectedPortion.name})`,
          description: item.description,
          price: selectedPortion.price,
          category: item.category,
          preparation_time: item.preparation_time,
          is_available: selectedPortion.is_available
        },
        selectedPortion: portionId,
        quantity: (prev[cartKey]?.quantity || 0) + 1,
        notes: prev[cartKey]?.notes || ''
      }
    }));
  };

  const removeFromCart = (cartKey: string) => {
    setCart(prev => {
      const newCart = { ...prev };
      if (newCart[cartKey].quantity > 1) {
        newCart[cartKey].quantity -= 1;
      } else {
        delete newCart[cartKey];
      }
      return newCart;
    });
  };

  const updateNotes = (cartKey: string, notes: string) => {
    setCart(prev => ({
      ...prev,
      [cartKey]: {
        ...prev[cartKey],
        notes
      }
    }));
  };

  const getTotalAmount = () => {
    return Object.values(cart).reduce((total, {item, quantity}) => {
      return total + item.price * quantity;
    }, 0);
  };

  const getCartItemCount = () => {
    return Object.values(cart).reduce((total, {quantity}) => total + quantity, 0);
  };

  // Helper function to get cart quantity for a specific item portion
  const getCartQuantity = (portionId: string) => {
    return cart[portionId]?.quantity || 0;
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

    // Note: Removed accepting_orders check to allow checkout from all cafes
    // Button labels already indicate the status (Order Now vs Coming Soon)

    // Navigate to checkout with cart data
    navigate('/checkout', { 
      state: { 
        cart, 
        cafe, 
        totalAmount: getTotalAmount() 
      } 
    });
  };

  const handleOpenCustomization = (item: GroupedMenuItem) => {
    setSelectedItemForCustomization(item);
    setCustomizationModalOpen(true);
  };

  const handleAddToCartFromModal = (item: GroupedMenuItem, selectedPortion: string, selectedAddOns: string[], quantity: number, notes: string) => {
    // For now, we'll just use the selected portion (add-ons can be added later)
    addToCart(item, selectedPortion);
    
    // Update quantity if more than 1
    if (quantity > 1) {
      for (let i = 1; i < quantity; i++) {
        addToCart(item, selectedPortion);
      }
    }
    
    // Update notes
    if (notes) {
      updateNotes(selectedPortion, notes);
    }
  };

  const groupedItems = menuItems.reduce((groups, item) => {
    const category = item.category;
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(item);
    return groups;
  }, {} as {[key: string]: MenuItem[]});

  // Get unique categories for the filter
  const categories = Object.keys(groupedItems);
  
  // Filter items based on selected category (veg/non-veg), menu category, brand, and search query
  const getFilteredItems = () => {
    let filtered = groupedMenuItems;
    
    // Apply brand filter first (for Food Court)
    if (selectedBrand && cafe?.name === 'FOOD COURT') {
      filtered = filtered.filter(item => {
        const itemBrand = item.category.split(' - ')[0].toLowerCase();
        const brandMap: Record<string, string> = {
          'gobblers': 'gobblers',
          'momo street': 'momo-street',
          'momo-street': 'momo-street',
          'krispp': 'krispp',
          'waffles': 'waffles-more',
          'waffles & more': 'waffles-more',
          'monginis': 'monginis',
          'tata bistro': 'tata-bistro'
        };
        return brandMap[itemBrand] === selectedBrand;
      });
    }
    
    // Apply veg/non-veg filter
    if (selectedCategory === 'veg') {
      filtered = filtered.filter(item => item.is_vegetarian === true);
    } else if (selectedCategory === 'non-veg') {
      filtered = filtered.filter(item => item.is_vegetarian === false);
    }
    // If selectedCategory === 'all', show all items (no dietary filtering)
    
    // Apply menu category filter
    if (selectedMenuCategory !== 'all') {
      filtered = filtered.filter(item => item.category === selectedMenuCategory);
    }
    
    // Apply search filter if search query exists
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
  
  // Group filtered items by category
  const filteredItems = getFilteredItems().reduce((groups, item) => {
    const category = item.category;
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(item);
    return groups;
  }, {} as {[key: string]: GroupedMenuItem[]});

  // Early return if no cafeIdentifier
  if (!cafeIdentifier) {
    return (
      <div className="min-h-screen bg-background">
        <SimpleHeader />
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-center">
            <p className="text-muted-foreground">Redirecting to cafes...</p>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <SimpleHeader />
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading menu...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!cafe) {
    return (
      <div className="min-h-screen bg-background">
        <SimpleHeader />
        <div className="container mx-auto px-4 py-8">
          <p className="text-center text-muted-foreground">Cafe not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-16 lg:pb-0">
      <SimpleHeader />
      
      {/* Swiggy Style Hero Section */}
      <SwiggyStyleHero 
        cafe={cafe}
        onBackClick={() => navigate('/cafes')}
        onMenuClick={() => navigate(`/menu/${cafe.id}`)}
      />

      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Brand Selector for Food Court */}
        {cafe?.name === 'FOOD COURT' && (
          <BrandSelector
            selectedBrand={selectedBrand}
            onBrandSelect={setSelectedBrand}
            brandItemCounts={getBrandItemCounts(menuItems)}
          />
        )}
        
        {/* Mobile-Optimized Category System */}
        <div className="mb-6 sm:mb-8">
          {/* Desktop: Full Filter System */}
          <div className="hidden lg:block">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <Filter className="w-5 h-5 mr-2 text-primary" />
                <h3 className="text-lg font-semibold text-foreground">Filter by Category</h3>
              </div>
              
              {/* Search Bar and PDF Menu */}
              <div className="flex items-center space-x-3">
                <Search className="w-5 h-5 text-primary" />
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search menu items..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-64 px-4 py-2 pr-10 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 placeholder:text-muted-foreground text-sm"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      ✕
                    </button>
                  )}
                </div>
                {(cafe.name.toLowerCase().includes('chatkara') || cafe.name.toLowerCase().includes('cook house') || cafe.name.toLowerCase().includes('havmor') || cafe.name.toLowerCase().includes('food court')) && (
                  <DirectPdfViewer 
                    cafeName={cafe.name} 
                    menuPdfUrl={
                      cafe.name.toLowerCase().includes('chatkara') ? "/chatkaramenu.pdf" : 
                      cafe.name.toLowerCase().includes('cook house') ? "/cookhousemenu.pdf" :
                      cafe.name.toLowerCase().includes('havmor') ? "/havmormenu.pdf" :
                      cafe.name.toLowerCase().includes('food court') ? "/foodcourtmenu.pdf" : ""
                    }
                  >
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-2 text-primary border-primary hover:bg-primary hover:text-white transition-all duration-200"
                    >
                      <FileText className="w-4 h-4" />
                      PDF Menu
                    </Button>
                  </DirectPdfViewer>
                )}
              </div>
            </div>
            
            {/* Veg/Non-Veg Toggle */}
            <div className="flex items-center space-x-4 mb-4">
              <span className="text-sm font-medium text-foreground">Dietary Preference:</span>
              <div className="flex bg-muted rounded-lg p-1">
                <Button
                  variant={selectedCategory === 'all' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setSelectedCategory('all')}
                  className="text-xs"
                >
                  🌱 All
                </Button>
                <Button
                  variant={selectedCategory === 'veg' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setSelectedCategory('veg')}
                  className="text-xs"
                >
                  🥬 Veg Only
                </Button>
                <Button
                  variant={selectedCategory === 'non-veg' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setSelectedCategory('non-veg')}
                  className="text-xs"
                >
                  🍗 Non-Veg Only
                </Button>
              </div>
            </div>
            
            {/* Category Dropdown */}
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium text-foreground">Category:</span>
              <Select value={selectedMenuCategory} onValueChange={setSelectedMenuCategory}>
                <SelectTrigger className="w-64">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    All Categories ({groupedMenuItems.length})
                  </SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category} ({groupedItems[category].length})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {/* Search Status */}
            {searchQuery && (
              <div className="mt-3 text-sm text-muted-foreground">
                Searching for: <span className="font-medium text-primary">"{searchQuery}"</span>
                {Object.keys(filteredItems).length > 0 && (
                  <span className="ml-2">• Found {Object.values(filteredItems).flat().length} items</span>
                )}
              </div>
            )}
          </div>

          {/* Mobile: Search Only (Menu Button moved to floating position) */}
          <div className="lg:hidden">
            <div className="mb-4">
              {/* Search Bar - Full Width */}
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search menu items..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 placeholder:text-muted-foreground text-sm"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>
            
            {/* Mobile Search Status */}
            {searchQuery && (
              <div className="text-sm text-muted-foreground">
                Searching for: <span className="font-medium text-primary">"{searchQuery}"</span>
                {Object.keys(filteredItems).length > 0 && (
                  <span className="ml-2">• Found {Object.values(filteredItems).flat().length} items</span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* No Results Message */}
        {searchQuery && Object.keys(filteredItems).length === 0 && (
          <div className="mb-8 text-center py-12">
            <Search className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">No items found</h3>
            <p className="text-muted-foreground mb-4">
              No menu items match your search for "{searchQuery}"
            </p>
            <Button 
              variant="outline" 
              onClick={() => setSearchQuery('')}
              className="hover:bg-primary hover:text-white"
            >
              Clear Search
            </Button>
          </div>
        )}

        {/* New 2-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Column - Categories (Hidden on Mobile) */}
          <div className="hidden lg:block lg:col-span-1">
            <Card className="food-card border-0 sticky top-4">
              <CardHeader>
                <CardTitle className="text-lg">Categories</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  variant={selectedMenuCategory === 'all' ? 'default' : 'ghost'}
                  className="w-full justify-start"
                  onClick={() => setSelectedMenuCategory('all')}
                >
                  All Categories ({groupedMenuItems.length})
                </Button>
                {categories.map((category) => (
                  <Button
                    key={category}
                    variant={selectedMenuCategory === category ? 'default' : 'ghost'}
                    className="w-full justify-start"
                    onClick={() => setSelectedMenuCategory(category)}
                  >
                    {category} ({groupedItems[category].length})
                  </Button>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Menu Items (Full width on mobile, 3 per row on desktop) */}
          <div className="lg:col-span-3 col-span-1">
            {Object.entries(filteredItems).map(([category, items]) => (
              <div key={category} className="mb-8">
                <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center">
                  <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm mr-3">
                    {items.length} items
                  </span>
                  {category}
                </h2>
                
                {/* Eatsure-style 3-column grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {items.map((item) => (
                    <Card key={item.baseName} className="food-card border-0 hover:shadow-lg transition-all duration-200">
                      <CardContent className="p-4">
                        {/* Food Item Image Placeholder */}
                        <div className="w-full h-32 bg-gradient-to-br from-orange-100 to-orange-200 rounded-lg mb-3 flex items-center justify-center">
                          <span className="text-orange-600 text-sm font-medium">🍽️ Food Image</span>
                        </div>
                        
                        {/* Item Details */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-foreground line-clamp-1">
                              {item.baseName}
                            </h3>
                            {item.portions.every(p => p.out_of_stock) && (
                              <Badge variant="destructive" className="text-xs">
                                Out of Stock
                              </Badge>
                            )}
                          </div>
                          
                          <p className="text-muted-foreground text-sm line-clamp-2">
                            {item.description}
                          </p>
                          
                          
                          {/* Price and Time */}
                          <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center text-muted-foreground">
                              <Clock className="w-4 h-4 mr-1" />
                              {item.preparation_time} min
                            </div>
                            <div className="text-lg font-bold text-primary">
                              {item.portions.length === 1 
                                ? `₹${item.portions[0].price}`
                                : `₹${Math.min(...item.portions.map(p => p.price))} - ₹${Math.max(...item.portions.map(p => p.price))}`
                              }
                            </div>
                          </div>
                          
                          {/* Add to Cart Button or Quantity Selector */}
                          <div className="pt-2">
                            {item.portions.every(p => p.out_of_stock) ? (
                              <Button
                                variant="outline"
                                size="sm"
                                disabled
                                className="w-full opacity-50 cursor-not-allowed"
                              >
                                Out of Stock
                              </Button>
                            ) : item.portions.length === 1 && getCartQuantity(item.portions[0].id) > 0 ? (
                              // Show quantity selector for single-portion items in cart
                              <div className="flex items-center justify-between bg-orange-50 rounded-lg p-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => removeFromCart(item.portions[0].id)}
                                  className="h-8 w-8 p-0"
                                >
                                  <Minus className="w-4 h-4" />
                                </Button>
                                <span className="text-sm font-medium px-2">
                                  {getCartQuantity(item.portions[0].id)}
                                </span>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => addToCart(item, item.portions[0].id)}
                                  className="h-8 w-8 p-0"
                                >
                                  <Plus className="w-4 h-4" />
                                </Button>
                              </div>
                            ) : (
                              <Button
                                variant="order"
                                size="sm"
                                onClick={() => handleOpenCustomization(item)}
                                className="w-full"
                              >
                                <Plus className="w-4 h-4 mr-2" />
                                Add to Cart
                              </Button>
                            )}
                          </div>
                        </div>
                        
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Floating Menu Button - Mobile Only */}
        <div className="fixed bottom-20 left-1/2 transform -translate-x-1/2 z-40 lg:hidden">
          <Button
            onClick={() => setIsMobileMenuOpen(true)}
            className="bg-black text-white hover:bg-gray-800 px-5 py-2.5 rounded-full shadow-2xl flex items-center gap-2 text-sm font-medium"
            size="default"
          >
            <Filter className="w-4 h-4" />
            Menu
          </Button>
        </div>

        {/* Sticky Cart Button - Appears when cart has items (Mobile Optimized) */}
        {Object.keys(cart).length > 0 && (
          <div className="fixed bottom-20 right-4 sm:right-6 z-50">
            <Button 
              className="shadow-2xl px-4 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-lg font-semibold" 
              variant="hero"
              onClick={handleCheckout}
              size="default"
            >
              <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              <span className="hidden sm:inline">View Cart ({getCartItemCount()}) - ₹{getTotalAmount()}</span>
              <span className="sm:hidden">Cart ({getCartItemCount()})</span>
            </Button>
          </div>
        )}

        {/* Mobile Menu Modal */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 bg-black/50 z-50 lg:hidden">
            <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl p-4 sm:p-6 max-h-[85vh] overflow-y-auto">
              {/* Header */}
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <h3 className="text-lg sm:text-xl font-bold text-foreground">Menu Categories</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-muted-foreground hover:text-foreground p-2"
                >
                  ✕
                </Button>
              </div>

              {/* Dietary Preference Toggle */}
              <div className="mb-4 sm:mb-6">
                <h4 className="text-sm font-medium text-foreground mb-3">Dietary Preference:</h4>
                <div className="grid grid-cols-3 gap-2 bg-muted rounded-lg p-1">
                  <Button
                    variant={selectedCategory === 'all' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => {
                      setSelectedCategory('all');
                      setIsMobileMenuOpen(false);
                    }}
                    className="text-xs py-2"
                  >
                    🌱 All
                  </Button>
                  <Button
                    variant={selectedCategory === 'veg' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => {
                      setSelectedCategory('veg');
                      setIsMobileMenuOpen(false);
                    }}
                    className="text-xs py-2"
                  >
                    🥬 Veg
                  </Button>
                  <Button
                    variant={selectedCategory === 'non-veg' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => {
                      setSelectedCategory('non-veg');
                      setIsMobileMenuOpen(false);
                    }}
                    className="text-xs py-2"
                  >
                    🍗 Non-Veg
                  </Button>
                </div>
              </div>

              {/* Categories List */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-foreground mb-3">Categories:</h4>
                <Button
                  variant={selectedMenuCategory === 'all' ? 'default' : 'ghost'}
                  className="w-full justify-start text-left"
                  onClick={() => {
                    setSelectedMenuCategory('all');
                    setIsMobileMenuOpen(false);
                  }}
                >
                  <div className="flex items-center justify-between w-full">
                    <span>All Categories</span>
                    <Badge variant="secondary" className="ml-2">
                      {groupedMenuItems.length}
                    </Badge>
                  </div>
                </Button>
                
                {categories.map((category) => (
                  <Button
                    key={category}
                    variant={selectedMenuCategory === category ? 'default' : 'ghost'}
                    className="w-full justify-start text-left"
                    onClick={() => {
                      setSelectedMenuCategory(category);
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span>{category}</span>
                      <Badge variant="secondary" className="ml-2">
                        {groupedItems[category]?.length || 0}
                      </Badge>
                    </div>
                  </Button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Item Customization Modal */}
        <ItemCustomizationModal
          isOpen={customizationModalOpen}
          onClose={() => setCustomizationModalOpen(false)}
          item={selectedItemForCustomization}
          onAddToCart={handleAddToCartFromModal}
        />
      </div>
    </div>
  );
};

export default Menu;