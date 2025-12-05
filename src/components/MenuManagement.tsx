import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { 
  Search, 
  Edit, 
  Save, 
  X, 
  Package,
  DollarSign,
  Eye,
  EyeOff,
  TrendingUp,
  Filter,
  Grid,
  List,
  RefreshCw,
  Plus,
  Trash2,
  AlertCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface MenuItem {
  id: string;
  name: string;
  description: string | null;
  price: number;
  category: string;
  is_available: boolean;
  out_of_stock: boolean;
  preparation_time: number | null;
  is_vegetarian: boolean | null;
  image_url: string | null;
  daily_stock_quantity: number | null;
  current_stock_quantity: number | null;
  last_stock_reset: string | null;
}

interface MenuManagementProps {
  cafeId: string | null;
}

const MenuManagement: React.FC<MenuManagementProps> = ({ cafeId }) => {
  const { toast } = useToast();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [availabilityFilter, setAvailabilityFilter] = useState<string>('all'); // all, available, unavailable, out_of_stock
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  
  // Editing states
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [editPrice, setEditPrice] = useState<string>('');
  const [editingStockItem, setEditingStockItem] = useState<string | null>(null);
  const [editDailyStock, setEditDailyStock] = useState<string>('');
  const [updatingItems, setUpdatingItems] = useState<Set<string>>(new Set());
  
  // Bulk selection
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  
  // Bulk actions state
  const [bulkFilterType, setBulkFilterType] = useState<'all' | 'category' | 'veg' | 'non-veg'>('all');
  const [bulkFilterCategory, setBulkFilterCategory] = useState<string>('all');
  const [showBulkConfirmDialog, setShowBulkConfirmDialog] = useState(false);
  const [pendingBulkAction, setPendingBulkAction] = useState<'out-of-stock' | 'in-stock' | null>(null);
  
  // Bulk price update state
  const [bulkPriceFilterType, setBulkPriceFilterType] = useState<'all' | 'category' | 'veg' | 'non-veg'>('all');
  const [bulkPriceFilterCategory, setBulkPriceFilterCategory] = useState<string>('all');
  const [bulkPriceUpdateType, setBulkPriceUpdateType] = useState<'percentage' | 'fixed'>('percentage');
  const [bulkPriceValue, setBulkPriceValue] = useState<string>('');
  const [showBulkPriceDialog, setShowBulkPriceDialog] = useState(false);

  // Fetch menu items
  const fetchMenuItems = async () => {
    if (!cafeId) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('menu_items')
        .select('*')
        .eq('cafe_id', cafeId)
        .order('category', { ascending: true })
        .order('name', { ascending: true });

      if (error) throw error;
      setMenuItems(data || []);
    } catch (error: any) {
      console.error('Error fetching menu items:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to fetch menu items',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMenuItems();
  }, [cafeId]);

  // Get unique categories
  const categories = useMemo(() => {
    const cats = new Set(menuItems.map(item => item.category));
    return Array.from(cats).sort();
  }, [menuItems]);

  // Get low stock items (stock ≤ 5)
  // Only items with stock tracking enabled (daily_stock_quantity !== null) can be low stock
  const lowStockItems = useMemo(() => {
    return menuItems.filter(item => 
      item.daily_stock_quantity !== null && // Stock tracking must be enabled
      item.current_stock_quantity !== null && 
      item.current_stock_quantity <= 5 && 
      item.current_stock_quantity > 0 &&
      !item.out_of_stock
    );
  }, [menuItems]);

  // Check if item is low stock
  // Only items with stock tracking enabled can be low stock
  const isLowStock = (item: MenuItem) => {
    return item.daily_stock_quantity !== null && // Stock tracking must be enabled
           item.current_stock_quantity !== null && 
           item.current_stock_quantity <= 5 && 
           item.current_stock_quantity > 0 &&
           !item.out_of_stock;
  };

  // Filter menu items
  const filteredItems = useMemo(() => {
    let filtered = menuItems;

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(item => item.category === selectedCategory);
    }

    // Filter by availability
    if (availabilityFilter === 'available') {
      filtered = filtered.filter(item => item.is_available && !item.out_of_stock);
    } else if (availabilityFilter === 'unavailable') {
      filtered = filtered.filter(item => !item.is_available);
    } else if (availabilityFilter === 'out_of_stock') {
      filtered = filtered.filter(item => item.out_of_stock);
    } else if (availabilityFilter === 'low_stock') {
      filtered = filtered.filter(item => isLowStock(item));
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query) ||
        item.description?.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [menuItems, selectedCategory, availabilityFilter, searchQuery]);

  // Toggle item availability
  const toggleAvailability = async (itemId: string, currentValue: boolean) => {
    if (!cafeId) return;
    
    setUpdatingItems(prev => new Set(prev).add(itemId));
    try {
      const { error } = await supabase
        .from('menu_items')
        .update({ is_available: !currentValue })
        .eq('id', itemId);

      if (error) throw error;

      setMenuItems(prev => prev.map(item =>
        item.id === itemId ? { ...item, is_available: !currentValue } : item
      ));

      toast({
        title: 'Success',
        description: `Item ${!currentValue ? 'enabled' : 'disabled'} successfully`,
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update availability',
        variant: 'destructive',
      });
    } finally {
      setUpdatingItems(prev => {
        const next = new Set(prev);
        next.delete(itemId);
        return next;
      });
    }
  };

  // Toggle out of stock status
  const toggleOutOfStock = async (itemId: string, currentValue: boolean) => {
    if (!cafeId) return;
    
    setUpdatingItems(prev => new Set(prev).add(itemId));
    try {
      const { error } = await supabase
        .from('menu_items')
        .update({ out_of_stock: !currentValue })
        .eq('id', itemId);

      if (error) throw error;

      setMenuItems(prev => prev.map(item =>
        item.id === itemId ? { ...item, out_of_stock: !currentValue } : item
      ));

      toast({
        title: 'Success',
        description: `Item marked as ${!currentValue ? 'out of stock' : 'in stock'}`,
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update stock status',
        variant: 'destructive',
      });
    } finally {
      setUpdatingItems(prev => {
        const next = new Set(prev);
        next.delete(itemId);
        return next;
      });
    }
  };

  // Update vegetarian status
  const updateVegetarianStatus = async (itemId: string, isVegetarian: boolean | null) => {
    if (!cafeId) return;
    
    setUpdatingItems(prev => new Set(prev).add(itemId));
    try {
      const { error } = await supabase
        .from('menu_items')
        .update({ is_vegetarian: isVegetarian })
        .eq('id', itemId);

      if (error) throw error;

      setMenuItems(prev => prev.map(item =>
        item.id === itemId ? { ...item, is_vegetarian: isVegetarian } : item
      ));

      const statusText = isVegetarian === null ? 'Not Set' : isVegetarian ? 'Vegetarian' : 'Non-Vegetarian';
      toast({
        title: 'Success',
        description: `Item marked as ${statusText}`,
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update vegetarian status',
        variant: 'destructive',
      });
    } finally {
      setUpdatingItems(prev => {
        const next = new Set(prev);
        next.delete(itemId);
        return next;
      });
    }
  };

  // Start editing price
  const startEditPrice = (item: MenuItem) => {
    setEditingItem(item.id);
    setEditPrice(item.price.toString());
  };

  // Save price edit
  const savePrice = async (itemId: string) => {
    if (!cafeId) return;
    
    const newPrice = parseFloat(editPrice);
    if (isNaN(newPrice) || newPrice < 0) {
      toast({
        title: 'Invalid Price',
        description: 'Please enter a valid positive number',
        variant: 'destructive',
      });
      return;
    }

    setUpdatingItems(prev => new Set(prev).add(itemId));
    try {
      const { error } = await supabase
        .from('menu_items')
        .update({ price: newPrice })
        .eq('id', itemId);

      if (error) throw error;

      setMenuItems(prev => prev.map(item =>
        item.id === itemId ? { ...item, price: newPrice } : item
      ));

      setEditingItem(null);
      toast({
        title: 'Success',
        description: 'Price updated successfully',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update price',
        variant: 'destructive',
      });
    } finally {
      setUpdatingItems(prev => {
        const next = new Set(prev);
        next.delete(itemId);
        return next;
      });
    }
  };

  // Cancel price edit
  const cancelEditPrice = () => {
    setEditingItem(null);
    setEditPrice('');
  };

  // Start editing daily stock
  const startEditDailyStock = (item: MenuItem) => {
    setEditingStockItem(item.id);
    setEditDailyStock(item.daily_stock_quantity?.toString() || '');
  };

  // Save daily stock
  const saveDailyStock = async (itemId: string) => {
    if (!cafeId) return;
    
    const stockValue = editDailyStock.trim() === '' ? null : parseInt(editDailyStock);
    if (stockValue !== null && (isNaN(stockValue) || stockValue < 0)) {
      toast({
        title: 'Invalid Stock',
        description: 'Please enter a valid positive number or leave empty for unlimited',
        variant: 'destructive',
      });
      return;
    }

    setUpdatingItems(prev => new Set(prev).add(itemId));
    try {
      const updateData: any = { daily_stock_quantity: stockValue };
      
      // If setting daily stock for the first time, initialize current stock
      const item = menuItems.find(m => m.id === itemId);
      if (stockValue !== null && item?.current_stock_quantity === null) {
        updateData.current_stock_quantity = stockValue;
        updateData.last_stock_reset = new Date().toISOString();
      }

      const { error } = await supabase
        .from('menu_items')
        .update(updateData)
        .eq('id', itemId);

      if (error) throw error;

      setMenuItems(prev => prev.map(item =>
        item.id === itemId ? { 
          ...item, 
          daily_stock_quantity: stockValue,
          current_stock_quantity: stockValue !== null && item.current_stock_quantity === null 
            ? stockValue 
            : item.current_stock_quantity
        } : item
      ));

      setEditingStockItem(null);
      setEditDailyStock('');
      toast({
        title: 'Success',
        description: stockValue !== null 
          ? `Daily stock set to ${stockValue}` 
          : 'Daily stock tracking disabled',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update daily stock',
        variant: 'destructive',
      });
    } finally {
      setUpdatingItems(prev => {
        const next = new Set(prev);
        next.delete(itemId);
        return next;
      });
    }
  };

  // Cancel daily stock edit
  const cancelEditDailyStock = () => {
    setEditingStockItem(null);
    setEditDailyStock('');
  };

  // Manual stock reset for a cafe
  const manualResetStock = async () => {
    if (!cafeId) return;
    
    try {
      const { error } = await supabase.rpc('manual_reset_stock', {
        p_cafe_id: cafeId
      });

      if (error) throw error;

      // Refresh menu items to get updated stock
      await fetchMenuItems();
      
      toast({
        title: 'Success',
        description: 'Stock reset successfully for all items',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to reset stock',
        variant: 'destructive',
      });
    }
  };

  // Bulk toggle availability
  const bulkToggleAvailability = async (makeAvailable: boolean) => {
    if (!cafeId || selectedItems.size === 0) return;

    setUpdatingItems(new Set(selectedItems));
    try {
      const { error } = await supabase
        .from('menu_items')
        .update({ is_available: makeAvailable })
        .in('id', Array.from(selectedItems));

      if (error) throw error;

      setMenuItems(prev => prev.map(item =>
        selectedItems.has(item.id) ? { ...item, is_available: makeAvailable } : item
      ));

      setSelectedItems(new Set());
      toast({
        title: 'Success',
        description: `Updated availability for ${selectedItems.size} item(s)`,
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update items',
        variant: 'destructive',
      });
    } finally {
      setUpdatingItems(new Set());
    }
  };

  // Get items matching bulk filter
  const getBulkFilteredItems = useMemo(() => {
    let filtered = menuItems;

    if (bulkFilterType === 'category') {
      if (bulkFilterCategory !== 'all') {
        filtered = filtered.filter(item => item.category === bulkFilterCategory);
      }
    } else if (bulkFilterType === 'veg') {
      filtered = filtered.filter(item => item.is_vegetarian === true);
    } else if (bulkFilterType === 'non-veg') {
      filtered = filtered.filter(item => item.is_vegetarian === false);
    }
    // 'all' means all items, no filtering needed

    return filtered;
  }, [menuItems, bulkFilterType, bulkFilterCategory]);

  // Handle bulk action confirmation
  const handleBulkActionClick = (action: 'out-of-stock' | 'in-stock') => {
    const count = getBulkFilteredItems.length;
    if (count === 0) {
      toast({
        title: 'No Items',
        description: 'No items match the selected filter',
        variant: 'destructive',
      });
      return;
    }
    setPendingBulkAction(action);
    setShowBulkConfirmDialog(true);
  };

  // Execute bulk stock update
  const executeBulkStockUpdate = async () => {
    if (!cafeId || !pendingBulkAction) return;

    const itemIds = getBulkFilteredItems.map(item => item.id);
    const newStockStatus = pendingBulkAction === 'out-of-stock';

    setUpdatingItems(new Set(itemIds));
    try {
      const { error } = await supabase
        .from('menu_items')
        .update({ out_of_stock: newStockStatus })
        .in('id', itemIds);

      if (error) throw error;

      setMenuItems(prev => prev.map(item =>
        itemIds.includes(item.id) ? { ...item, out_of_stock: newStockStatus } : item
      ));

      const actionText = newStockStatus ? 'out of stock' : 'in stock';
      const filterText = 
        bulkFilterType === 'all' ? 'all items' :
        bulkFilterType === 'category' ? `${bulkFilterCategory} category` :
        bulkFilterType === 'veg' ? 'vegetarian items' :
        'non-vegetarian items';

      toast({
        title: 'Success',
        description: `Marked ${itemIds.length} item(s) as ${actionText} (${filterText})`,
      });

      setShowBulkConfirmDialog(false);
      setPendingBulkAction(null);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update items',
        variant: 'destructive',
      });
    } finally {
      setUpdatingItems(new Set());
    }
  };

  // Get items matching bulk price filter
  const getBulkPriceFilteredItems = useMemo(() => {
    let filtered = menuItems;

    if (bulkPriceFilterType === 'category') {
      if (bulkPriceFilterCategory !== 'all') {
        filtered = filtered.filter(item => item.category === bulkPriceFilterCategory);
      }
    } else if (bulkPriceFilterType === 'veg') {
      filtered = filtered.filter(item => item.is_vegetarian === true);
    } else if (bulkPriceFilterType === 'non-veg') {
      filtered = filtered.filter(item => item.is_vegetarian === false);
    }

    return filtered;
  }, [menuItems, bulkPriceFilterType, bulkPriceFilterCategory]);

  // Handle bulk price update click
  const handleBulkPriceUpdateClick = () => {
    const value = parseFloat(bulkPriceValue);
    if (isNaN(value) || value === 0) {
      toast({
        title: 'Invalid Value',
        description: 'Please enter a valid number',
        variant: 'destructive',
      });
      return;
    }

    if (bulkPriceUpdateType === 'percentage' && (value <= -100 || value > 1000)) {
      toast({
        title: 'Invalid Percentage',
        description: 'Percentage must be between -100% and 1000%',
        variant: 'destructive',
      });
      return;
    }

    if (getBulkPriceFilteredItems.length === 0) {
      toast({
        title: 'No Items',
        description: 'No items match the selected filter',
        variant: 'destructive',
      });
      return;
    }

    setShowBulkPriceDialog(true);
  };

  // Execute bulk price update
  const executeBulkPriceUpdate = async () => {
    if (!cafeId) return;

    const value = parseFloat(bulkPriceValue);
    if (isNaN(value) || value === 0) return;

    const itemsToUpdate = getBulkPriceFilteredItems;
    const itemIds = itemsToUpdate.map(item => item.id);

    setUpdatingItems(new Set(itemIds));
    try {
      // Calculate new prices
      const updates = itemsToUpdate.map(item => {
        let newPrice: number;
        if (bulkPriceUpdateType === 'percentage') {
          newPrice = item.price * (1 + value / 100);
        } else {
          newPrice = item.price + value;
        }
        // Round to 2 decimal places and ensure minimum price of 1
        newPrice = Math.max(1, Math.round(newPrice * 100) / 100);
        return { id: item.id, price: newPrice };
      });

      // Update each item
      for (const update of updates) {
        const { error } = await supabase
          .from('menu_items')
          .update({ price: update.price })
          .eq('id', update.id);

        if (error) throw error;
      }

      // Update local state
      setMenuItems(prev => prev.map(item => {
        const update = updates.find(u => u.id === item.id);
        return update ? { ...item, price: update.price } : item;
      }));

      const actionText = bulkPriceUpdateType === 'percentage' 
        ? `${value > 0 ? '+' : ''}${value}%`
        : `${value > 0 ? '+' : ''}${formatCurrency(value)}`;
      const filterText = 
        bulkPriceFilterType === 'all' ? 'all items' :
        bulkPriceFilterType === 'category' ? `${bulkPriceFilterCategory} category` :
        bulkPriceFilterType === 'veg' ? 'vegetarian items' :
        'non-vegetarian items';

      toast({
        title: 'Success',
        description: `Updated prices for ${itemIds.length} item(s) by ${actionText} (${filterText})`,
      });

      setShowBulkPriceDialog(false);
      setBulkPriceValue('');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update prices',
        variant: 'destructive',
      });
    } finally {
      setUpdatingItems(new Set());
    }
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (!cafeId) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">Please select a cafe to manage menu</p>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2" />
          <p className="text-muted-foreground">Loading menu items...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Items</p>
                <p className="text-2xl font-bold">{menuItems.length}</p>
              </div>
              <Package className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Available</p>
                <p className="text-2xl font-bold text-green-600">
                  {menuItems.filter(item => item.is_available && !item.out_of_stock).length}
                </p>
              </div>
              <Eye className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Unavailable</p>
                <p className="text-2xl font-bold text-orange-600">
                  {menuItems.filter(item => !item.is_available).length}
                </p>
              </div>
              <EyeOff className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Out of Stock</p>
                <p className="text-2xl font-bold text-red-600">
                  {menuItems.filter(item => item.out_of_stock).length}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
        <Card 
          className={`${lowStockItems.length > 0 ? 'border-orange-500 bg-orange-50/50 cursor-pointer hover:bg-orange-100/50 transition-colors' : ''} ${availabilityFilter === 'low_stock' ? 'ring-2 ring-orange-500' : ''}`}
          onClick={() => {
            if (lowStockItems.length > 0) {
              setAvailabilityFilter(availabilityFilter === 'low_stock' ? 'all' : 'low_stock');
            }
          }}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Low Stock (≤5)</p>
                <p className={`text-2xl font-bold ${lowStockItems.length > 0 ? 'text-orange-600' : 'text-muted-foreground'}`}>
                  {lowStockItems.length}
                </p>
                {lowStockItems.length > 0 && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {availabilityFilter === 'low_stock' ? 'Click to show all' : 'Click to filter'}
                  </p>
                )}
              </div>
              <AlertCircle className={`h-8 w-8 ${lowStockItems.length > 0 ? 'text-orange-600' : 'text-muted-foreground'}`} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bulk Stock Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Bulk Stock Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Filter Type Selector */}
              <div className="space-y-2">
                <Label>Filter By</Label>
                <Select
                  value={bulkFilterType}
                  onValueChange={(value: 'all' | 'category' | 'veg' | 'non-veg') => {
                    setBulkFilterType(value);
                    if (value !== 'category') {
                      setBulkFilterCategory('all');
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Items</SelectItem>
                    <SelectItem value="category">By Category</SelectItem>
                    <SelectItem value="veg">🥬 All Vegetarian</SelectItem>
                    <SelectItem value="non-veg">🍗 All Non-Vegetarian</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Category Selector (only shown when filter type is 'category') */}
              {bulkFilterType === 'category' && (
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select
                    value={bulkFilterCategory}
                    onValueChange={setBulkFilterCategory}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {categories.map(cat => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Action Buttons */}
            <div className="space-y-2">
                <Label>Actions</Label>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => handleBulkActionClick('out-of-stock')}
                    disabled={getBulkFilteredItems.length === 0}
                    className="flex-1"
                  >
                    Mark Out of Stock
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleBulkActionClick('in-stock')}
                    disabled={getBulkFilteredItems.length === 0}
                    className="flex-1"
                  >
                    Mark In Stock
                  </Button>
                </div>
              </div>
            </div>

            {/* Items Count Preview */}
          <div className="text-sm text-muted-foreground bg-muted p-3 rounded-md text-center md:text-left">
              <strong>{getBulkFilteredItems.length}</strong> item(s) will be affected
              {bulkFilterType === 'category' && bulkFilterCategory !== 'all' && (
                <span> in <strong>{bulkFilterCategory}</strong> category</span>
              )}
              {bulkFilterType === 'veg' && (
                <span> (all vegetarian items)</span>
              )}
              {bulkFilterType === 'non-veg' && (
                <span> (all non-vegetarian items)</span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Price Updates */}
      <Card>
        <CardHeader>
          <CardTitle>Bulk Price Updates</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Filter Type Selector */}
              <div className="space-y-2">
                <Label>Filter By</Label>
                <Select
                  value={bulkPriceFilterType}
                  onValueChange={(value: 'all' | 'category' | 'veg' | 'non-veg') => {
                    setBulkPriceFilterType(value);
                    if (value !== 'category') {
                      setBulkPriceFilterCategory('all');
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Items</SelectItem>
                    <SelectItem value="category">By Category</SelectItem>
                    <SelectItem value="veg">🥬 All Vegetarian</SelectItem>
                    <SelectItem value="non-veg">🍗 All Non-Vegetarian</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Category Selector (only shown when filter type is 'category') */}
              {bulkPriceFilterType === 'category' && (
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select
                    value={bulkPriceFilterCategory}
                    onValueChange={setBulkPriceFilterCategory}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {categories.map(cat => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Update Type and Value */}
              <div className="space-y-2">
                <Label>Update Type</Label>
                <Select
                  value={bulkPriceUpdateType}
                  onValueChange={(value: 'percentage' | 'fixed') => setBulkPriceUpdateType(value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Percentage (%)</SelectItem>
                    <SelectItem value="fixed">Fixed Amount (₹)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>
                  {bulkPriceUpdateType === 'percentage' ? 'Percentage' : 'Amount (₹)'}
                </Label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    value={bulkPriceValue}
                    onChange={(e) => setBulkPriceValue(e.target.value)}
                    placeholder={bulkPriceUpdateType === 'percentage' ? 'e.g., 10 or -5' : 'e.g., 10 or -5'}
                    step={bulkPriceUpdateType === 'percentage' ? '0.1' : '1'}
                    className="flex-1"
                  />
                  <Button
                    onClick={handleBulkPriceUpdateClick}
                    disabled={!bulkPriceValue || getBulkPriceFilteredItems.length === 0}
                  >
                    Update Prices
                  </Button>
                </div>
              </div>
            </div>

            {/* Items Count Preview */}
            <div className="text-sm text-muted-foreground bg-muted p-3 rounded-md text-center md:text-left">
              <strong>{getBulkPriceFilteredItems.length}</strong> item(s) will be affected
              {bulkPriceFilterType === 'category' && bulkPriceFilterCategory !== 'all' && (
                <span> in <strong>{bulkPriceFilterCategory}</strong> category</span>
              )}
              {bulkPriceFilterType === 'veg' && (
                <span> (all vegetarian items)</span>
              )}
              {bulkPriceFilterType === 'non-veg' && (
                <span> (all non-vegetarian items)</span>
              )}
              {bulkPriceValue && (
                <div className="mt-2 pt-2 border-t">
                  <strong>Preview:</strong> Prices will be{' '}
                  {bulkPriceUpdateType === 'percentage' ? (
                    <>
                      {parseFloat(bulkPriceValue) > 0 ? 'increased' : 'decreased'} by{' '}
                      <strong>{Math.abs(parseFloat(bulkPriceValue))}%</strong>
                    </>
                  ) : (
                    <>
                      {parseFloat(bulkPriceValue) > 0 ? 'increased' : 'decreased'} by{' '}
                      <strong>{formatCurrency(Math.abs(parseFloat(bulkPriceValue)))}</strong>
                    </>
                  )}
                  {getBulkPriceFilteredItems.length > 0 && (
                    <div className="mt-1 text-xs">
                      Example: ₹{formatCurrency(getBulkPriceFilteredItems[0].price)} → ₹
                      {formatCurrency(
                        bulkPriceUpdateType === 'percentage'
                          ? Math.max(1, Math.round(getBulkPriceFilteredItems[0].price * (1 + parseFloat(bulkPriceValue) / 100) * 100) / 100)
                          : Math.max(1, getBulkPriceFilteredItems[0].price + parseFloat(bulkPriceValue))
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Menu Items</CardTitle>
            <div className="flex items-center gap-2">
              {lowStockItems.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={async () => {
                    if (!cafeId) return;
                    const itemIds = lowStockItems.map(item => item.id);
                    setUpdatingItems(new Set(itemIds));
                    try {
                      const { error } = await supabase
                        .from('menu_items')
                        .update({ out_of_stock: true })
                        .in('id', itemIds);

                      if (error) throw error;

                      setMenuItems(prev => prev.map(item =>
                        itemIds.includes(item.id) ? { ...item, out_of_stock: true } : item
                      ));

                      toast({
                        title: 'Success',
                        description: `Marked ${itemIds.length} low stock item(s) as out of stock`,
                      });
                    } catch (error: any) {
                      toast({
                        title: 'Error',
                        description: error.message || 'Failed to update items',
                        variant: 'destructive',
                      });
                    } finally {
                      setUpdatingItems(new Set());
                    }
                  }}
                  className="border-orange-500 text-orange-700 hover:bg-orange-50"
                  title="Mark all low stock items as out of stock"
                >
                  <AlertCircle className="h-4 w-4 mr-1" />
                  Mark Low Stock Out
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={manualResetStock}
                title="Reset stock for all items to daily quantity"
              >
                <RefreshCw className="h-4 w-4 mr-1" />
                Reset Stock
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
              >
                {viewMode === 'grid' ? <List className="h-4 w-4" /> : <Grid className="h-4 w-4" />}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={fetchMenuItems}
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search and Filters Row */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 md:gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(cat => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={availabilityFilter} onValueChange={setAvailabilityFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Items" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Items</SelectItem>
                <SelectItem value="available">Available</SelectItem>
                <SelectItem value="unavailable">Unavailable</SelectItem>
                <SelectItem value="out_of_stock">Out of Stock</SelectItem>
                <SelectItem value="low_stock">Low Stock (≤5)</SelectItem>
              </SelectContent>
            </Select>
            {selectedItems.size > 0 && (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => bulkToggleAvailability(true)}
                >
                  Enable Selected
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => bulkToggleAvailability(false)}
                >
                  Disable Selected
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedItems(new Set())}
                >
                  Clear ({selectedItems.size})
                </Button>
              </div>
            )}
          </div>

          {/* Menu Items List */}
          {filteredItems.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No menu items found</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredItems.map(item => {
                const isUpdating = updatingItems.has(item.id);
                const isSelected = selectedItems.has(item.id);
                const isEditing = editingItem === item.id;

                return (
                  <div
                    key={item.id}
                    className={`flex flex-col md:flex-row items-start md:items-center gap-3 md:gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors ${
                      isSelected ? 'bg-blue-50 border-blue-300' : ''
                    } ${!item.is_available || item.out_of_stock ? 'opacity-60' : ''} ${
                      isLowStock(item) ? 'border-orange-400 bg-orange-50/30' : ''
                    }`}
                  >
                    {/* Checkbox for bulk selection */}
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedItems(prev => new Set(prev).add(item.id));
                        } else {
                          setSelectedItems(prev => {
                            const next = new Set(prev);
                            next.delete(item.id);
                            return next;
                          });
                        }
                      }}
                      className="w-4 h-4"
                    />

                    {/* Item Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold truncate">{item.name}</h3>
                        <Badge variant="secondary" className="text-xs">
                          {item.category}
                        </Badge>
                        {item.is_vegetarian === true && (
                          <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-300">
                            🥬 Veg
                          </Badge>
                        )}
                        {item.is_vegetarian === false && (
                          <Badge variant="outline" className="text-xs bg-red-50 text-red-700 border-red-300">
                            🍗 Non-Veg
                          </Badge>
                        )}
                        {item.is_vegetarian === null && (
                          <Badge variant="outline" className="text-xs bg-gray-50 text-gray-500 border-gray-300">
                            Not Set
                          </Badge>
                        )}
                      </div>
                      {item.description && (
                        <p className="text-sm text-muted-foreground truncate mt-1">
                          {item.description}
                        </p>
                      )}
                    </div>

                    {/* Right-side controls wrapper (stack on mobile) */}
                    <div className="flex flex-col sm:flex-row sm:flex-wrap md:flex-nowrap gap-3 md:gap-4 w-full md:w-auto justify-between md:justify-end">
                      {/* Price Editing */}
                      <div className="flex items-center gap-2">
                        {isEditing ? (
                          <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            value={editPrice}
                            onChange={(e) => setEditPrice(e.target.value)}
                            className="w-24"
                            min="0"
                            step="0.01"
                            autoFocus
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                savePrice(item.id);
                              } else if (e.key === 'Escape') {
                                cancelEditPrice();
                              }
                            }}
                          />
                          <Button
                            size="sm"
                            onClick={() => savePrice(item.id)}
                            disabled={isUpdating}
                          >
                            <Save className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={cancelEditPrice}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                          </div>
                        ) : (
                          <>
                            <div className="text-right min-w-[80px]">
                              <p className="font-semibold">{formatCurrency(item.price)}</p>
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => startEditPrice(item)}
                              disabled={isUpdating}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>

                      {/* Vegetarian Status Selector */}
                      <div className="flex items-center gap-2 min-w-[140px]">
                      <Label htmlFor={`veg-${item.id}`} className="text-sm whitespace-nowrap">
                        Type:
                      </Label>
                        <Select
                        value={item.is_vegetarian === null ? 'not-set' : item.is_vegetarian ? 'veg' : 'non-veg'}
                        onValueChange={(value) => {
                          const newValue = value === 'not-set' ? null : value === 'veg';
                          updateVegetarianStatus(item.id, newValue);
                        }}
                        disabled={isUpdating}
                      >
                        <SelectTrigger id={`veg-${item.id}`} className="w-[110px] h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="veg">🥬 Veg</SelectItem>
                          <SelectItem value="non-veg">🍗 Non-Veg</SelectItem>
                          <SelectItem value="not-set">Not Set</SelectItem>
                        </SelectContent>
                        </Select>
                      </div>

                      {/* Availability Toggles */}
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                        <Label htmlFor={`available-${item.id}`} className="text-sm">
                          Available
                        </Label>
                        <Switch
                          id={`available-${item.id}`}
                          checked={item.is_available}
                          onCheckedChange={() => toggleAvailability(item.id, item.is_available)}
                          disabled={isUpdating}
                        />
                        </div>
                        <div className="flex items-center gap-2">
                        <Label htmlFor={`out-of-stock-${item.id}`} className="text-sm">
                          Out of Stock
                        </Label>
                        <Switch
                          id={`out-of-stock-${item.id}`}
                          checked={item.out_of_stock}
                          onCheckedChange={() => toggleOutOfStock(item.id, item.out_of_stock)}
                          disabled={isUpdating}
                        />
                        </div>
                      </div>

                      {/* Daily Stock Management */}
                      <div className="flex items-center gap-3 min-w-[200px]">
                      {editingStockItem === item.id ? (
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            value={editDailyStock}
                            onChange={(e) => setEditDailyStock(e.target.value)}
                            placeholder="Unlimited"
                            className="w-24"
                            min="0"
                            autoFocus
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                saveDailyStock(item.id);
                              } else if (e.key === 'Escape') {
                                cancelEditDailyStock();
                              }
                            }}
                          />
                          <Button
                            size="sm"
                            onClick={() => saveDailyStock(item.id)}
                            disabled={isUpdating}
                          >
                            <Save className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={cancelEditDailyStock}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          {item.daily_stock_quantity !== null ? (
                            <div className="text-right">
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-muted-foreground">Daily:</span>
                                <span className="text-sm font-medium">{item.daily_stock_quantity}</span>
                              </div>
                              {item.current_stock_quantity !== null && (
                                <div className={`flex items-center gap-2 ${
                                  item.current_stock_quantity <= 0 
                                    ? 'text-red-600 font-semibold' 
                                    : item.current_stock_quantity <= 5 
                                    ? 'text-orange-600' 
                                    : 'text-green-600'
                                }`}>
                                  <span className="text-xs">Current:</span>
                                  <span className="text-sm font-bold flex items-center gap-1">
                                    {item.current_stock_quantity}
                                    {isLowStock(item) && (
                                      <AlertCircle className="h-3 w-3 text-orange-600" title="Low stock warning" />
                                    )}
                                    {item.current_stock_quantity < -10 && (
                                      <Badge variant="destructive" className="ml-1 text-xs">
                                        Critical
                                      </Badge>
                                    )}
                                    {item.current_stock_quantity < 0 && item.current_stock_quantity >= -10 && (
                                      <Badge variant="outline" className="ml-1 text-xs border-orange-500 text-orange-700">
                                        Oversold
                                      </Badge>
                                    )}
                                    {isLowStock(item) && item.current_stock_quantity > 0 && (
                                      <Badge variant="outline" className="ml-1 text-xs border-orange-500 text-orange-700">
                                        Low Stock
                                      </Badge>
                                    )}
                                  </span>
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="text-xs text-muted-foreground">Unlimited</span>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => startEditDailyStock(item)}
                            disabled={isUpdating}
                            title="Edit daily stock"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Results Count */}
          <div className="text-sm text-muted-foreground text-center pt-4 border-t">
            Showing {filteredItems.length} of {menuItems.length} items
          </div>
        </CardContent>
      </Card>

      {/* Bulk Action Confirmation Dialog */}
      <Dialog open={showBulkConfirmDialog} onOpenChange={setShowBulkConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Bulk Stock Update</DialogTitle>
            <DialogDescription>
              {pendingBulkAction === 'out-of-stock' 
                ? 'Are you sure you want to mark these items as out of stock?'
                : 'Are you sure you want to mark these items as in stock?'}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="bg-muted p-4 rounded-md space-y-2">
              <p className="font-semibold">This will affect <strong className="text-primary">{getBulkFilteredItems.length}</strong> item(s):</p>
              <div className="text-sm text-muted-foreground">
                {bulkFilterType === 'all' && (
                  <p>• All menu items</p>
                )}
                {bulkFilterType === 'category' && bulkFilterCategory !== 'all' && (
                  <p>• All items in <strong>{bulkFilterCategory}</strong> category</p>
                )}
                {bulkFilterType === 'veg' && (
                  <p>• All vegetarian items</p>
                )}
                {bulkFilterType === 'non-veg' && (
                  <p>• All non-vegetarian items</p>
                )}
              </div>
              <div className="pt-2 border-t">
                <p className="text-sm">
                  <strong>Action:</strong> Mark as {pendingBulkAction === 'out-of-stock' ? 'Out of Stock' : 'In Stock'}
                </p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowBulkConfirmDialog(false);
                setPendingBulkAction(null);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={executeBulkStockUpdate}
              variant={pendingBulkAction === 'out-of-stock' ? 'destructive' : 'default'}
            >
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Price Update Confirmation Dialog */}
      <Dialog open={showBulkPriceDialog} onOpenChange={setShowBulkPriceDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Bulk Price Update</DialogTitle>
            <DialogDescription>
              Are you sure you want to update prices for these items?
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="bg-muted p-4 rounded-md space-y-2">
              <p className="font-semibold">This will affect <strong className="text-primary">{getBulkPriceFilteredItems.length}</strong> item(s):</p>
              <div className="text-sm text-muted-foreground">
                {bulkPriceFilterType === 'all' && (
                  <p>• All menu items</p>
                )}
                {bulkPriceFilterType === 'category' && bulkPriceFilterCategory !== 'all' && (
                  <p>• All items in <strong>{bulkPriceFilterCategory}</strong> category</p>
                )}
                {bulkPriceFilterType === 'veg' && (
                  <p>• All vegetarian items</p>
                )}
                {bulkPriceFilterType === 'non-veg' && (
                  <p>• All non-vegetarian items</p>
                )}
              </div>
              <div className="pt-2 border-t space-y-1">
                <p className="text-sm">
                  <strong>Update Type:</strong> {bulkPriceUpdateType === 'percentage' ? 'Percentage' : 'Fixed Amount'}
                </p>
                <p className="text-sm">
                  <strong>Value:</strong>{' '}
                  {bulkPriceUpdateType === 'percentage' ? (
                    <>{parseFloat(bulkPriceValue) > 0 ? '+' : ''}{bulkPriceValue}%</>
                  ) : (
                    <>{parseFloat(bulkPriceValue) > 0 ? '+' : ''}{formatCurrency(parseFloat(bulkPriceValue))}</>
                  )}
                </p>
                {getBulkPriceFilteredItems.length > 0 && (
                  <div className="pt-2 border-t">
                    <p className="text-xs font-semibold mb-1">Example changes:</p>
                    {getBulkPriceFilteredItems.slice(0, 3).map(item => {
                      const newPrice = bulkPriceUpdateType === 'percentage'
                        ? Math.max(1, Math.round(item.price * (1 + parseFloat(bulkPriceValue) / 100) * 100) / 100)
                        : Math.max(1, item.price + parseFloat(bulkPriceValue));
                      return (
                        <p key={item.id} className="text-xs">
                          {item.name}: {formatCurrency(item.price)} → {formatCurrency(newPrice)}
                        </p>
                      );
                    })}
                    {getBulkPriceFilteredItems.length > 3 && (
                      <p className="text-xs text-muted-foreground mt-1">
                        ...and {getBulkPriceFilteredItems.length - 3} more items
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowBulkPriceDialog(false);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={executeBulkPriceUpdate}
            >
              Confirm Update
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MenuManagement;

