import React, { useState, useEffect, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useCafeStaff } from '@/hooks/useCafeStaff';
import { 
  X, 
  Plus, 
  Minus, 
  Search, 
  Loader2,
  Trash2,
  ShoppingCart
} from 'lucide-react';

interface OrderItem {
  id: string;
  menu_item_id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  special_instructions?: string;
  menu_item: {
    id: string;
    name: string;
    description?: string;
    price: number;
    category: string;
    is_vegetarian?: boolean;
  };
}

interface MenuItem {
  id: string;
  name: string;
  description?: string;
  price: number;
  category: string;
  is_vegetarian?: boolean;
  is_available: boolean;
  out_of_stock?: boolean;
}

interface Order {
  id: string;
  order_number: string;
  status: 'received' | 'confirmed' | 'preparing' | 'on_the_way' | 'completed' | 'cancelled';
  total_amount: number;
  payment_method: string;
  cafe_id: string;
}

interface EditOrderModalProps {
  order: Order | null;
  orderItems: OrderItem[];
  menuItems: MenuItem[];
  isOpen: boolean;
  onClose: () => void;
  onOrderUpdated: () => void;
  cafeId: string;
}

interface EditedOrderItem {
  id: string; // order_item.id or 'new-{menu_item_id}'
  menu_item_id: string;
  menu_item_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  isNew: boolean; // true if this is a new item being added
  originalOrderItemId?: string; // if quantity changed, keep original id
}

const EditOrderModal: React.FC<EditOrderModalProps> = ({
  order,
  orderItems,
  menuItems,
  isOpen,
  onClose,
  onOrderUpdated,
  cafeId
}) => {
  const { toast } = useToast();
  const { staff } = useCafeStaff(cafeId);
  const [editedItems, setEditedItems] = useState<EditedOrderItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isSaving, setIsSaving] = useState(false);
  const [availableMenuItems, setAvailableMenuItems] = useState<MenuItem[]>([]);

  // Get current staff member ID for logging
  const currentStaffId = staff?.[0]?.id || null;

  // Initialize edited items from order items when modal opens
  useEffect(() => {
    if (isOpen && order && orderItems.length > 0) {
      const initialItems: EditedOrderItem[] = orderItems.map(item => ({
        id: item.id,
        menu_item_id: item.menu_item_id,
        menu_item_name: item.menu_item.name,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total_price: item.total_price,
        isNew: false,
        originalOrderItemId: item.id
      }));
      setEditedItems(initialItems);
    } else if (isOpen && order && orderItems.length === 0) {
      // Order has no items (shouldn't happen, but handle it)
      setEditedItems([]);
    }
  }, [isOpen, order, orderItems]);

  // Fetch menu items when modal opens
  useEffect(() => {
    if (isOpen && cafeId) {
      fetchMenuItems();
    }
  }, [isOpen, cafeId]);

  const fetchMenuItems = async () => {
    try {
      const { data, error } = await supabase
        .from('menu_items')
        .select('*')
        .eq('cafe_id', cafeId)
        .order('category', { ascending: true })
        .order('name', { ascending: true });

      if (error) throw error;
      setAvailableMenuItems(data || []);
    } catch (error) {
      console.error('Error fetching menu items:', error);
      toast({
        title: "Error",
        description: "Failed to load menu items",
        variant: "destructive"
      });
    }
  };

  // Validation: Only COD orders and not completed
  const canEdit = useMemo(() => {
    if (!order) return false;
    if (order.status === 'completed' || order.status === 'cancelled') return false;
    if (order.payment_method !== 'cod') return false;
    return true;
  }, [order]);

  // Filter menu items by search and category
  const filteredMenuItems = useMemo(() => {
    let filtered = availableMenuItems;

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(item => item.category === selectedCategory);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(query) ||
        item.description?.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [availableMenuItems, selectedCategory, searchQuery]);

  // Get unique categories
  const categories = useMemo(() => {
    const cats = [...new Set(availableMenuItems.map(item => item.category))];
    return cats.sort();
  }, [availableMenuItems]);

  // Calculate new total
  const newTotal = useMemo(() => {
    return editedItems.reduce((sum, item) => sum + item.total_price, 0);
  }, [editedItems]);

  // Get items that were added
  const addedItems = useMemo(() => {
    return editedItems.filter(item => item.isNew);
  }, [editedItems]);

  // Get items that were removed
  const removedItems = useMemo(() => {
    const currentItemIds = new Set(editedItems.map(item => item.originalOrderItemId || item.id));
    return orderItems.filter(item => !currentItemIds.has(item.id));
  }, [editedItems, orderItems]);

  // Get items that had quantity changed
  const changedItems = useMemo(() => {
    return editedItems.filter(item => {
      if (item.isNew) return false;
      const original = orderItems.find(oi => oi.id === item.originalOrderItemId);
      if (!original) return false;
      return original.quantity !== item.quantity || original.unit_price !== item.unit_price;
    });
  }, [editedItems, orderItems]);

  // Update quantity of an item
  const updateQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      // Remove item
      removeItem(itemId);
      return;
    }

    setEditedItems(prev => prev.map(item => {
      if (item.id === itemId) {
        const newTotalPrice = newQuantity * item.unit_price;
        return {
          ...item,
          quantity: newQuantity,
          total_price: newTotalPrice
        };
      }
      return item;
    }));
  };

  // Remove an item
  const removeItem = (itemId: string) => {
    setEditedItems(prev => prev.filter(item => item.id !== itemId));
  };

  // Add a menu item to the order
  const addMenuItem = (menuItem: MenuItem) => {
    // Check if item already exists in edited items
    const existingItem = editedItems.find(item => item.menu_item_id === menuItem.id && !item.isNew);
    
    if (existingItem) {
      // Increase quantity of existing item
      updateQuantity(existingItem.id, existingItem.quantity + 1);
    } else {
      // Add new item
      const newItem: EditedOrderItem = {
        id: `new-${menuItem.id}-${Date.now()}`,
        menu_item_id: menuItem.id,
        menu_item_name: menuItem.name,
        quantity: 1,
        unit_price: menuItem.price,
        total_price: menuItem.price,
        isNew: true
      };
      setEditedItems(prev => [...prev, newItem]);
    }
  };

  // Save changes
  const handleSave = async () => {
    if (!order || !canEdit) {
      toast({
        title: "Cannot Edit",
        description: "This order cannot be edited",
        variant: "destructive"
      });
      return;
    }

    if (editedItems.length === 0) {
      toast({
        title: "Empty Order",
        description: "Order must have at least one item",
        variant: "destructive"
      });
      return;
    }

    if (!currentStaffId) {
      toast({
        title: "Error",
        description: "Staff information not found",
        variant: "destructive"
      });
      return;
    }

    setIsSaving(true);

    try {
      const oldTotal = order.total_amount;
      const newTotalAmount = newTotal;

      // Start transaction-like operations
      // 1. Delete removed items
      const itemsToDelete = removedItems.map(item => item.id);
      if (itemsToDelete.length > 0) {
        // Log deletions
        for (const item of removedItems) {
          await supabase.from('order_edit_logs').insert({
            order_id: order.id,
            edited_by: currentStaffId,
            action: 'item_removed',
            menu_item_id: item.menu_item_id,
            menu_item_name: item.menu_item.name,
            old_quantity: item.quantity,
            new_quantity: 0,
            old_unit_price: item.unit_price,
            new_unit_price: 0,
            old_total_price: item.total_price,
            new_total_price: 0,
            old_order_total: oldTotal,
            new_order_total: newTotalAmount
          });
        }

        const { error: deleteError } = await supabase
          .from('order_items')
          .delete()
          .in('id', itemsToDelete);

        if (deleteError) throw deleteError;
      }

      // 2. Update changed items
      for (const changedItem of changedItems) {
        const original = orderItems.find(oi => oi.id === changedItem.originalOrderItemId);
        if (!original) continue;

        // Log the change
        await supabase.from('order_edit_logs').insert({
          order_id: order.id,
          edited_by: currentStaffId,
          action: original.quantity !== changedItem.quantity ? 'quantity_changed' : 'item_updated',
          menu_item_id: changedItem.menu_item_id,
          menu_item_name: changedItem.menu_item_name,
          old_quantity: original.quantity,
          new_quantity: changedItem.quantity,
          old_unit_price: original.unit_price,
          new_unit_price: changedItem.unit_price,
          old_total_price: original.total_price,
          new_total_price: changedItem.total_price,
          old_order_total: oldTotal,
          new_order_total: newTotalAmount
        });

        // Update the item
        const { error: updateError } = await supabase
          .from('order_items')
          .update({
            quantity: changedItem.quantity,
            unit_price: changedItem.unit_price,
            total_price: changedItem.total_price
          })
          .eq('id', changedItem.originalOrderItemId);

        if (updateError) throw updateError;
      }

      // 3. Add new items
      for (const newItem of addedItems) {
        // Log the addition
        await supabase.from('order_edit_logs').insert({
          order_id: order.id,
          edited_by: currentStaffId,
          action: 'item_added',
          menu_item_id: newItem.menu_item_id,
          menu_item_name: newItem.menu_item_name,
          old_quantity: 0,
          new_quantity: newItem.quantity,
          old_unit_price: 0,
          new_unit_price: newItem.unit_price,
          old_total_price: 0,
          new_total_price: newItem.total_price,
          old_order_total: oldTotal,
          new_order_total: newTotalAmount
        });

        // Insert the new item
        const { error: insertError } = await supabase
          .from('order_items')
          .insert({
            order_id: order.id,
            menu_item_id: newItem.menu_item_id,
            quantity: newItem.quantity,
            unit_price: newItem.unit_price,
            total_price: newItem.total_price
          });

        if (insertError) throw insertError;
      }

      // 4. Update order total
      const { error: orderUpdateError } = await supabase
        .from('orders')
        .update({
          total_amount: newTotalAmount,
          updated_at: new Date().toISOString()
        })
        .eq('id', order.id);

      if (orderUpdateError) throw orderUpdateError;

      toast({
        title: "Order Updated",
        description: `Order #${order.order_number} has been updated successfully`,
      });

      onOrderUpdated();
      onClose();

    } catch (error: any) {
      console.error('Error updating order:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update order",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (!order) return null;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2
    }).format(amount);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Order #{order.order_number}</DialogTitle>
          <DialogDescription>
            Add, remove, or modify items in this order. Changes will be logged.
          </DialogDescription>
        </DialogHeader>

        {!canEdit && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <p className="text-sm text-red-800">
              {order.status === 'completed' || order.status === 'cancelled'
                ? 'This order cannot be edited because it is already completed or cancelled.'
                : 'This order can only be edited if it is a COD (Cash on Delivery) order.'}
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Current Order Items */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-lg">Current Items</h3>
              <Badge variant="secondary">{editedItems.length} items</Badge>
            </div>

            <div className="space-y-2 max-h-96 overflow-y-auto border rounded-lg p-4">
              {editedItems.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-8">No items in order</p>
              ) : (
                editedItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-sm truncate">{item.menu_item_name}</p>
                        {item.isNew && (
                          <Badge variant="outline" className="text-xs">New</Badge>
                        )}
                      </div>
                      <p className="text-xs text-gray-500">
                        {formatCurrency(item.unit_price)} each
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1 border rounded">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 w-7 p-0"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-8 text-center text-sm font-medium">
                          {item.quantity}
                        </span>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 w-7 p-0"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>

                      <div className="w-20 text-right">
                        <p className="font-semibold text-sm">
                          {formatCurrency(item.total_price)}
                        </p>
                      </div>

                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 w-7 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => removeItem(item.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Order Summary */}
            <div className="border-t pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Previous Total:</span>
                <span className="text-gray-900 line-through">
                  {formatCurrency(order.total_amount)}
                </span>
              </div>
              <div className="flex justify-between text-lg font-bold">
                <span>New Total:</span>
                <span className={newTotal !== order.total_amount ? 'text-green-600' : ''}>
                  {formatCurrency(newTotal)}
                </span>
              </div>
              {newTotal !== order.total_amount && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Difference:</span>
                  <span className={newTotal > order.total_amount ? 'text-green-600' : 'text-red-600'}>
                    {newTotal > order.total_amount ? '+' : ''}
                    {formatCurrency(newTotal - order.total_amount)}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Right: Add Items */}
          {canEdit && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-lg">Add Items</h3>
              </div>

              {/* Search */}
              <div className="relative">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search menu items..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8"
                />
              </div>

              {/* Category Filter */}
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

              {/* Menu Items List */}
              <div className="space-y-2 max-h-96 overflow-y-auto border rounded-lg p-4">
                {filteredMenuItems.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-8">
                    {searchQuery ? 'No items found' : 'No menu items available'}
                  </p>
                ) : (
                  filteredMenuItems.map((menuItem) => {
                    const isOutOfStock = menuItem.out_of_stock || !menuItem.is_available;
                    const existingItem = editedItems.find(item => item.menu_item_id === menuItem.id);
                    
                    return (
                      <div
                        key={menuItem.id}
                        className={`flex items-center justify-between p-3 rounded-lg border ${
                          isOutOfStock ? 'bg-gray-100 opacity-60' : 'bg-white hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-sm truncate">{menuItem.name}</p>
                            {menuItem.is_vegetarian && (
                              <Badge variant="outline" className="text-xs">Veg</Badge>
                            )}
                            {isOutOfStock && (
                              <Badge variant="destructive" className="text-xs">Out of Stock</Badge>
                            )}
                          </div>
                          <p className="text-xs text-gray-500 truncate">
                            {menuItem.description || menuItem.category}
                          </p>
                          <p className="text-sm font-semibold mt-1">
                            {formatCurrency(menuItem.price)}
                          </p>
                        </div>

                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => addMenuItem(menuItem)}
                          disabled={isOutOfStock}
                          className="ml-2"
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          {existingItem ? `Add (${existingItem.quantity})` : 'Add'}
                        </Button>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={!canEdit || isSaving || editedItems.length === 0}
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditOrderModal;

