import React, { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Search, 
  Clock, 
  Receipt, 
  Plus,
  Filter,
  RefreshCw,
  Eye,
  Edit,
  CheckCircle,
  AlertCircle,
  X,
  Download
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import FoodCourtReceipt from './FoodCourtReceipt';
import SimpleReceipt from './SimpleReceipt';
import { usePrinter } from '@/hooks/usePrinter';
import { directPrinterService } from '@/services/directPrinterService';
import { useLocalPrint } from '@/hooks/useLocalPrint';
import { usePrintNode } from '@/hooks/usePrintNode';

interface OrderItem {
  id: string;
  menu_item_id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  special_instructions?: string;
  menu_item: {
    name: string;
    description: string;
  };
}

interface Order {
  id: string;
  order_number: string;
  status: 'received' | 'confirmed' | 'preparing' | 'on_the_way' | 'completed' | 'cancelled';
  total_amount: number;
  created_at: string;
  delivery_block: string;
  customer_name?: string;
  phone_number?: string;
  cafe_id: string;
  cafes?: {
    id: string;
    name: string;
    type: string;
  };
  user?: {
    full_name: string;
    phone: string | null;
    block: string;
    email: string;
  };
}

interface CompactOrderGridProps {
  orders: Order[];
  orderItems: {[key: string]: OrderItem[]};
  onOrderSelect: (order: Order) => void;
  onStatusUpdate: (orderId: string, newStatus: Order['status']) => void;
  loading?: boolean;
}

const CompactOrderGrid: React.FC<CompactOrderGridProps> = ({
  orders,
  orderItems,
  onOrderSelect,
  onStatusUpdate,
  loading = false
}) => {
  console.log('CompactOrderGrid received orderItems:', orderItems);
  const { toast } = useToast();
  const { isConnected, isPrinting, printBothReceipts } = usePrinter();
  const { isAvailable: localPrintAvailable, printReceipt: localPrintReceipt, isPrinting: localPrintPrinting } = useLocalPrint();
  const { isAvailable: printNodeAvailable, printReceipt: printNodePrintReceipt, isPrinting: printNodePrinting, printers: printNodePrinters } = usePrintNode();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<Order['status'] | 'all'>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [receiptOrder, setReceiptOrder] = useState<Order | null>(null);
  const [showSimpleReceipt, setShowSimpleReceipt] = useState(false);
  const [simpleReceiptOrder, setSimpleReceiptOrder] = useState<Order | null>(null);

  // Calculate time elapsed since order creation
  const getTimeElapsed = (createdAt: string): string => {
    const now = new Date();
    const orderTime = new Date(createdAt);
    const diffMs = now.getTime() - orderTime.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} Min`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)} Hr`;
    return `${Math.floor(diffMins / 1440)} Day`;
  };

  // Get status color and icon
  const getStatusInfo = (status: Order['status']) => {
    switch (status) {
      case 'received':
        return { color: 'bg-blue-500', icon: Clock, label: 'Received' };
      case 'confirmed':
        return { color: 'bg-green-500', icon: CheckCircle, label: 'Confirmed' };
      case 'preparing':
        return { color: 'bg-yellow-500', icon: AlertCircle, label: 'Preparing' };
      case 'on_the_way':
        return { color: 'bg-purple-500', icon: Eye, label: 'On Way' };
      case 'completed':
        return { color: 'bg-green-600', icon: CheckCircle, label: 'Completed' };
      case 'cancelled':
        return { color: 'bg-red-500', icon: X, label: 'Cancelled' };
      default:
        return { color: 'bg-gray-500', icon: Clock, label: 'Unknown' };
    }
  };

  // Filter orders based on search and status
  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      const matchesSearch = searchQuery === '' || 
        order.order_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.customer_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.delivery_block.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [orders, searchQuery, statusFilter]);

  // Group orders by status for better organization
  const ordersByStatus = useMemo(() => {
    const grouped: Record<string, Order[]> = {
      'received': [],
      'confirmed': [],
      'preparing': [],
      'on_the_way': [],
      'completed': [],
      'cancelled': []
    };
    
    filteredOrders.forEach(order => {
      grouped[order.status].push(order);
    });
    
    return grouped;
  }, [filteredOrders]);

  // Calculate grid dimensions based on order count
  const gridCols = Math.max(11, Math.ceil(Math.sqrt(filteredOrders.length)));
  const gridRows = Math.ceil(filteredOrders.length / gridCols);

  const handleOrderClick = (order: Order) => {
    setSelectedOrder(order);
    onOrderSelect(order);
  };

  const handleStatusUpdate = async (orderId: string, newStatus: Order['status']) => {
    try {
      await onStatusUpdate(orderId, newStatus);
      
      if (newStatus === 'cancelled') {
        toast({
          title: "Order Cancelled",
          description: "Order has been successfully cancelled and moved to cancelled section",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Status Updated",
          description: `Order status changed to ${newStatus.replace('_', ' ')}`,
        });
      }
    } catch (error) {
      toast({
        title: "Update Failed",
        description: "Failed to update order status",
        variant: "destructive"
      });
    }
  };

  const handlePrintReceipt = (order: Order) => {
    // Generate thermal receipt HTML
    const generateThermalHTML = (orderData: Order) => {
      const items = orderItems[orderData.id] || [];
      const isFoodCourt = orderData.cafes?.name?.toLowerCase().includes('food court') || 
                         orderData.cafes?.name === 'FOOD COURT' ||
                         orderData.cafes?.name?.toLowerCase() === 'food court';
      
      console.log('CompactOrderGrid - Full order data:', orderData);
      console.log('CompactOrderGrid - Cafe name:', orderData.cafes?.name);
      console.log('CompactOrderGrid - Is Food Court:', isFoodCourt);
      
      // Temporary alert to verify the data
      alert(`DEBUG: Cafe name: ${orderData.cafes?.name}, Is Food Court: ${isFoodCourt}`);
      
      if (isFoodCourt) {
        return generateFoodCourtReceipt(orderData, items);
      } else {
        return generateMUJFoodClubReceipt(orderData, items);
      }
    };

    const generateMUJFoodClubReceipt = (orderData: Order, items: any[]) => {
      const orderDate = new Date(orderData.created_at);
      const dateStr = orderDate.toLocaleDateString('en-GB', { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric' 
      });
      const timeStr = orderDate.toLocaleTimeString('en-GB', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });

      return `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <title>Receipt #${orderData.order_number}</title>
            <style>
              @media print {
                body { 
                  width: 80mm; 
                  margin: 0; 
                  padding: 5mm;
                  font-size: 12px; 
                  font-family: 'Courier New', monospace;
                  line-height: 1.2;
                }
                .no-print { display: none; }
              }
              
              body {
                font-family: 'Courier New', monospace;
                line-height: 1.2;
                color: #000;
                width: 80mm;
                margin: 0 auto;
                background: white;
              }
              
              .header {
                text-align: center;
                border-bottom: 1px dashed #000;
                padding-bottom: 10px;
                margin-bottom: 15px;
              }
              
              .logo {
                font-size: 18px;
                font-weight: bold;
                margin-bottom: 5px;
              }
              
              .subtitle {
                font-size: 12px;
                color: #666;
              }
              
              .order-info {
                margin-bottom: 15px;
              }
              
              .info-row {
                display: flex;
                justify-content: space-between;
                margin-bottom: 3px;
              }
              
              .items-section {
                border-bottom: 1px dashed #000;
                padding-bottom: 10px;
                margin-bottom: 15px;
              }
              
              .item-row {
                display: flex;
                justify-content: space-between;
                margin-bottom: 5px;
              }
              
              .item-name {
                flex: 1;
                margin-right: 10px;
              }
              
              .item-details {
                text-align: right;
                min-width: 80px;
              }
              
              .total-section {
                text-align: right;
                font-weight: bold;
                font-size: 14px;
              }
              
              .footer {
                text-align: center;
                margin-top: 20px;
                font-size: 10px;
                color: #666;
                border-top: 1px dashed #000;
                padding-top: 10px;
              }
            </style>
          </head>
          <body>
            <div class="header">
              <div class="logo">MUJ FOOD CLUB</div>
              <div class="subtitle">Delicious Food, Great Service</div>
              <div class="subtitle">www.mujfoodclub.in</div>
            </div>
            
            <div class="order-info">
              <div class="info-row">
                <span>Receipt #:</span>
                <span>${orderData.order_number}</span>
              </div>
              <div class="info-row">
                <span>Date:</span>
                <span>${dateStr}</span>
              </div>
              <div class="info-row">
                <span>Time:</span>
                <span>${timeStr}</span>
              </div>
              <div class="info-row">
                <span>Customer:</span>
                <span>${orderData.user?.full_name || orderData.customer_name || 'N/A'}</span>
              </div>
              <div class="info-row">
                <span>Phone:</span>
                <span>${orderData.user?.phone || orderData.phone_number || 'N/A'}</span>
              </div>
              <div class="info-row">
                <span>Block:</span>
                <span>${orderData.user?.block || orderData.delivery_block || 'N/A'}</span>
              </div>
            </div>
            
            <div class="items-section">
              <div class="info-row" style="font-weight: bold; margin-bottom: 8px;">
                <span>Item</span>
                <span>Qty × Price</span>
                <span>Total</span>
              </div>
              ${items.map(item => `
                <div class="item-row">
                  <div class="item-name">${item.menu_item.name}</div>
                  <div class="item-details">${item.quantity} × ₹${item.unit_price}</div>
                  <div class="item-details">₹${item.total_price}</div>
                </div>
              `).join('')}
            </div>
            
            <div class="total-section">
              <div class="info-row">
                <span>Subtotal:</span>
                <span>₹${orderData.total_amount}</span>
              </div>
              <div class="info-row">
                <span>Tax (5%):</span>
                <span>₹${(orderData.total_amount * 0.05).toFixed(2)}</span>
              </div>
              <div class="info-row" style="font-size: 16px; margin-top: 8px;">
                <span>TOTAL:</span>
                <span>₹${(orderData.total_amount * 1.05).toFixed(2)}</span>
              </div>
            </div>
            
            <div class="footer">
              <div>Thank you for your order!</div>
              <div>Please collect your receipt</div>
              <div>For support: support@mujfoodclub.in</div>
            </div>
          </body>
        </html>
      `;
    };

    const generateFoodCourtReceipt = (orderData: Order, items: any[]) => {
      const orderDate = new Date(orderData.created_at);
      const dateStr = orderDate.toLocaleDateString('en-GB', { 
        day: '2-digit', 
        month: '2-digit', 
        year: '2-digit' 
      });
      const timeStr = orderDate.toLocaleTimeString('en-GB', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });

      return `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <title>Receipt #${orderData.order_number}</title>
            <style>
              @media print {
                body { 
                  width: 80mm; 
                  margin: 0; 
                  padding: 5mm;
                  font-size: 12px; 
                  font-family: 'Courier New', monospace;
                  line-height: 1.2;
                }
                .no-print { display: none; }
              }
              
              body {
                font-family: 'Courier New', monospace;
                line-height: 1.2;
                color: #000;
                width: 80mm;
                margin: 0 auto;
                background: white;
              }
              
              .header {
                text-align: center;
                border-bottom: 1px dashed #000;
                padding-bottom: 10px;
                margin-bottom: 15px;
              }
              
              .logo {
                font-size: 16px;
                font-weight: bold;
                margin-bottom: 5px;
              }
              
              .subtitle {
                font-size: 10px;
                color: #666;
              }
              
              .order-info {
                margin-bottom: 15px;
              }
              
              .info-row {
                display: flex;
                justify-content: space-between;
                margin-bottom: 3px;
              }
              
              .items-section {
                border-bottom: 1px dashed #000;
                padding-bottom: 10px;
                margin-bottom: 15px;
              }
              
              .item-row {
                display: flex;
                justify-content: space-between;
                margin-bottom: 5px;
              }
              
              .item-name {
                flex: 1;
                margin-right: 10px;
              }
              
              .item-details {
                text-align: right;
                min-width: 80px;
              }
              
              .total-section {
                text-align: right;
                font-weight: bold;
                font-size: 14px;
              }
              
              .footer {
                text-align: center;
                margin-top: 20px;
                font-size: 10px;
                color: #666;
              }
            </style>
          </head>
          <body>
            <div class="header">
              <div class="logo">The Food Court Co</div>
              <div class="subtitle">(MOMO STREET, GOBBLERS, KRISPP, TATA MYBRISTO)</div>
              <div class="subtitle">GSTIN: 08ADNPG4024A1Z2</div>
            </div>
            
            <div class="order-info">
              <div class="info-row">
                <span>Name:</span>
                <span>${orderData.user?.full_name || orderData.customer_name || 'N/A'} (M: ${orderData.user?.phone || orderData.phone_number || 'N/A'})</span>
              </div>
              <div class="info-row">
                <span>Date:</span>
                <span>${dateStr}</span>
              </div>
              <div class="info-row">
                <span>Time:</span>
                <span>${timeStr}</span>
              </div>
              <div class="info-row">
                <span>Order Type:</span>
                <span>Pick Up</span>
              </div>
              <div class="info-row">
                <span>Cashier:</span>
                <span>biller</span>
              </div>
              <div class="info-row">
                <span>Bill No.:</span>
                <span>${orderData.order_number.replace(/[^\d]/g, '')}</span>
              </div>
              <div class="info-row">
                <span>Token No.:</span>
                <span>${Math.floor(Math.random() * 10) + 1}</span>
              </div>
            </div>
            
            <div class="items-section">
              <div class="info-row" style="font-weight: bold; margin-bottom: 8px;">
                <span>Item</span>
                <span>Qty.</span>
                <span>Price</span>
                <span>Amount</span>
              </div>
              ${items.map(item => `
                <div class="item-row">
                  <div class="item-name">${item.menu_item.name}</div>
                  <div class="item-details">${item.quantity}</div>
                  <div class="item-details">${item.unit_price}.00</div>
                  <div class="item-details">${item.total_price}.00</div>
                </div>
              `).join('')}
            </div>
            
            <div class="total-section">
              <div class="info-row">
                <span>Total Qty:</span>
                <span>${items.reduce((sum, item) => sum + item.quantity, 0)}</span>
              </div>
              <div class="info-row">
                <span>Sub Total:</span>
                <span>${orderData.total_amount}.00</span>
              </div>
              <div class="info-row">
                <span>CGST@2.5 2.5%:</span>
                <span>${(orderData.total_amount * 0.025).toFixed(2)}</span>
              </div>
              <div class="info-row">
                <span>SGST@2.5 2.5%:</span>
                <span>${(orderData.total_amount * 0.025).toFixed(2)}</span>
              </div>
              <div class="info-row">
                <span>Round off:</span>
                <span>+0.04</span>
              </div>
              <div class="info-row" style="font-size: 16px; margin-top: 8px;">
                <span>Grand Total:</span>
                <span>₹${(orderData.total_amount * 1.05).toFixed(2)}.00</span>
              </div>
            </div>
            
            <div class="footer">
              <div>Paid via: Other [UPI]</div>
              <div style="margin-top: 10px;">Thanks For Visit!!</div>
            </div>
          </body>
        </html>
      `;
    };

    // Print directly to local printer
    const thermalHTML = generateThermalHTML(order);
    
    // Create a hidden iframe for printing
    const iframe = document.createElement('iframe');
    iframe.style.position = 'absolute';
    iframe.style.top = '-1000px';
    iframe.style.left = '-1000px';
    iframe.style.width = '80mm';
    iframe.style.height = 'auto';
    document.body.appendChild(iframe);
    
    const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
    if (iframeDoc) {
      iframeDoc.open();
      iframeDoc.write(thermalHTML);
      iframeDoc.close();
      
      // Auto-print after a short delay
      setTimeout(() => {
        iframe.contentWindow?.print();
        document.body.removeChild(iframe);
      }, 500);
    }
    
    toast({
      title: "Printing Receipt",
      description: `Receipt for order #${order.order_number} is being printed`,
    });
  };

  // New direct print function that bypasses browser printing
  const handleDirectPrint = async (order: Order) => {
    try {
      // Get order items for this order
      const items = orderItems[order.id] || [];
      
      if (items.length === 0) {
        toast({
          title: "No Items Found",
          description: "Could not find items for this order",
          variant: "destructive",
        });
        return;
      }

      // Print KOT first
      const kotSuccess = await directPrinterService.printReceipt({
        type: 'kot',
        orderData: order,
        orderItems: items
      });

      if (kotSuccess) {
        toast({
          title: "KOT Printed",
          description: "Kitchen Order Ticket printed successfully",
          variant: "default",
        });
      }

      // Wait a moment then print customer receipt
      setTimeout(async () => {
        const customerSuccess = await directPrinterService.printReceipt({
          type: 'customer',
          orderData: order,
          orderItems: items
        });

        if (customerSuccess) {
          toast({
            title: "Customer Receipt Printed",
            description: "Customer receipt printed successfully",
            variant: "default",
          });
        } else {
          toast({
            title: "Print Failed",
            description: "Could not print customer receipt",
            variant: "destructive",
          });
        }
      }, 1000);

    } catch (error) {
      console.error('Direct print error:', error);
      toast({
        title: "Print Error",
        description: "Error printing receipts",
        variant: "destructive",
      });
    }
  };

  // Professional print function using PrintNode (primary) or local service (fallback)
  const handleProfessionalPrint = async (order: Order) => {
    try {
      // Get order items for this order
      const items = orderItems[order.id] || [];
      
      if (items.length === 0) {
        toast({
          title: "No Items Found",
          description: "Could not find items for this order",
          variant: "destructive",
        });
        return;
      }

      // Convert order data to receipt format
      const receiptData = {
        order_id: order.id,
        order_number: order.order_number,
        cafe_name: order.cafe?.name || 'Unknown Cafe',
        customer_name: order.user?.full_name || 'Walk-in Customer',
        customer_phone: order.user?.phone || order.phone_number || 'N/A',
        delivery_block: order.delivery_block || order.user?.block || 'N/A',
        items: items.map(item => ({
          id: item.id,
          name: item.menu_item?.name || 'Unknown Item',
          quantity: item.quantity,
          unit_price: item.unit_price,
          total_price: item.total_price,
          special_instructions: item.special_instructions
        })),
        subtotal: order.subtotal || 0,
        tax_amount: order.tax_amount || 0,
        discount_amount: order.discount_amount || 0,
        final_amount: order.total_amount || 0,
        payment_method: order.payment_method || 'cod',
        order_date: order.created_at,
        estimated_delivery: order.estimated_delivery || new Date().toISOString(),
        points_earned: 0,
        points_redeemed: 0
      };

      // Try PrintNode first (cloud-based, professional)
      if (printNodeAvailable && printNodePrinters.length > 0) {
        const result = await printNodePrintReceipt(receiptData);
        
        if (result.success) {
          toast({
            title: "Receipt Printed",
            description: "Professional thermal receipt sent via PrintNode",
            variant: "default",
          });
          return;
        } else {
          console.log('PrintNode failed, trying local service:', result.error);
        }
      }

      // Fallback to local print service
      if (localPrintAvailable) {
        const result = await localPrintReceipt(receiptData);
        
        if (result.success) {
          toast({
            title: "Receipt Printed",
            description: "Professional thermal receipt sent via local service",
            variant: "default",
          });
          return;
        } else {
          console.log('Local print failed, falling back to browser print:', result.error);
        }
      }

      // Final fallback to browser printing
      handlePrint(order);

    } catch (error) {
      console.error('Professional print error:', error);
      toast({
        title: "Print Error",
        description: "Error printing receipts",
        variant: "destructive",
      });
    }
  };

  const handleDownloadCancelledOrdersCSV = () => {
    try {
      const cancelledOrders = ordersByStatus.cancelled || [];
      
      if (cancelledOrders.length === 0) {
        toast({
          title: "No Cancelled Orders",
          description: "There are no cancelled orders to download",
          variant: "destructive"
        });
        return;
      }

      // Prepare CSV data
      const csvData = cancelledOrders.map(order => {
        const items = orderItems[order.id] || [];
        const itemNames = items.map(item => `${item.quantity}x ${item.menu_item.name}`).join('; ');
        
        return {
          'Order Number': order.order_number,
          'Amount': formatCurrency(order.total_amount),
          'Items': itemNames,
          'Customer Name': order.user?.full_name || order.customer_name || 'N/A',
          'Phone Number': order.user?.phone || order.phone_number || 'N/A',
          'Block': order.delivery_block,
          'Order Time': new Date(order.created_at).toLocaleString('en-IN'),
          'Cancelled Time': getTimeElapsed(order.created_at)
        };
      });

      // Convert to CSV string
      const headers = Object.keys(csvData[0]);
      const csvString = [
        headers.join(','),
        ...csvData.map(row => 
          headers.map(header => {
            const value = row[header];
            // Escape commas and quotes in CSV
            if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
              return `"${value.replace(/"/g, '""')}"`;
            }
            return value;
          }).join(',')
        )
      ].join('\n');

      // Create and download file
      const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `cancelled_orders_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: "CSV Downloaded",
        description: `Successfully downloaded ${cancelledOrders.length} cancelled orders`,
      });
    } catch (error) {
      console.error('Error downloading CSV:', error);
      toast({
        title: "Download Failed",
        description: "Failed to download cancelled orders CSV",
        variant: "destructive"
      });
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="compact-order-grid space-y-6">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-bold">Orders Overview</h2>
          <Badge variant="secondary">{filteredOrders.length} orders</Badge>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search orders..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-full sm:w-64"
            />
          </div>
          
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as Order['status'] | 'all')}
            className="px-3 py-2 border rounded-md bg-background"
          >
            <option value="all">All Status</option>
            <option value="received">Received</option>
            <option value="confirmed">Confirmed</option>
            <option value="preparing">Preparing</option>
            <option value="on_the_way">On Way</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
          
          {/* Refresh */}
          <Button variant="outline" size="sm">
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Status Summary */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-2">
        {Object.entries(ordersByStatus).map(([status, statusOrders]) => {
          const statusInfo = getStatusInfo(status as Order['status']);
          const Icon = statusInfo.icon;
          
          return (
            <div key={status} className="text-center p-2 bg-muted/30 rounded-lg">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Icon className={`w-4 h-4 ${statusInfo.color.replace('bg-', 'text-')}`} />
                <span className="text-xs font-medium">{statusInfo.label}</span>
              </div>
              <div className="text-lg font-bold">{statusOrders.length}</div>
            </div>
          );
        })}
      </div>

      {/* Orders Grid - Always Show All Sections */}
      <div className="space-y-4">
        {Object.entries(ordersByStatus).map(([status, statusOrders]) => {
          const statusInfo = getStatusInfo(status as Order['status']);
          
          return (
            <div key={status} className="space-y-3">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${statusInfo.color}`}></div>
                <h3 className="font-semibold">{statusInfo.label} Orders ({statusOrders.length})</h3>
              </div>
              
              {statusOrders.length > 0 ? (
                <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-11 lg:grid-cols-12 gap-2">
                  {statusOrders.map((order) => (
                    <Card
                      key={order.id}
                      className={`order-card cursor-pointer transition-all duration-200 hover:scale-105 ${
                        selectedOrder?.id === order.id ? 'ring-2 ring-primary' : ''
                      }`}
                      onClick={() => handleOrderClick(order)}
                    >
                      <CardContent className="p-2 text-center space-y-1">
                        {/* Time Elapsed */}
                        <div className="text-xs font-medium text-muted-foreground">
                          {getTimeElapsed(order.created_at)}
                        </div>
                        
                        {/* Order Number */}
                        <div className="text-sm font-bold">
                          {order.order_number.replace('CHA', '')}
                        </div>
                        
                        {/* Amount */}
                        <div className="text-xs font-medium text-primary">
                          {formatCurrency(order.total_amount)}
                        </div>
                        
                        {/* Status Icon */}
                        <div className="flex justify-center">
                          <div className={`w-2 h-2 rounded-full ${statusInfo.color}`}></div>
                        </div>
                        
                        {/* Quick Actions - Only Green Status Update Button */}
                        <div className="flex justify-center gap-1 mt-1">
                          {getAvailableStatuses(order.status).filter(s => s !== 'cancelled').length > 0 && (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-6 w-6 p-0 hover:bg-green-100"
                              onClick={(e) => {
                                e.stopPropagation();
                                const nextStatus = getAvailableStatuses(order.status).filter(s => s !== 'cancelled')[0];
                                handleStatusUpdate(order.id, nextStatus);
                              }}
                              title={`Mark as ${getAvailableStatuses(order.status).filter(s => s !== 'cancelled')[0]?.replace('_', ' ')}`}
                            >
                              <CheckCircle className="w-3 h-3 text-green-600" />
                            </Button>
                          )}
                          
                          {/* Print Button */}
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 w-6 p-0 hover:bg-blue-100"
                            onClick={async (e) => {
                              e.stopPropagation();
                              
                              // For now, hardcode Food Court detection based on cafe ID
                              // TODO: Fix cafe data fetching issue
                              const isFoodCourt = order.cafe_id === '3e5955ba-9b90-48ce-9d07-cc686678a10e' ||
                                                 order.cafes?.name?.toLowerCase().includes('food court') || 
                                                 order.cafes?.name === 'FOOD COURT' ||
                                                 order.cafes?.name?.toLowerCase() === 'food court';
                              
                              console.log('Receipt button clicked:', {
                                orderId: order.id,
                                cafeName: order.cafes?.name,
                                cafeId: order.cafe_id,
                                isFoodCourt: isFoodCourt,
                                isConnected: isConnected,
                                isPrinting: isPrinting
                              });
                              
                              if (isFoodCourt) {
                                // Use professional printing (PrintNode + local service fallback)
                                handleProfessionalPrint(order);
                              } else {
                                toast({
                                  title: "Receipt Printing",
                                  description: "Receipt printing for other cafes will be available soon!",
                                });
                              }
                            }}
                            title="Print Receipt (Direct Thermal - No Browser Dialog)"
                          >
                            <Receipt className="w-3 h-3 text-blue-600" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                /* Empty State for Each Section */
                <div className="text-center py-8 bg-muted/20 rounded-lg border-2 border-dashed border-muted-foreground/20">
                  <div className={`w-12 h-12 rounded-full ${statusInfo.color} mx-auto mb-3 flex items-center justify-center`}>
                    <statusInfo.icon className="w-6 h-6 text-white" />
                  </div>
                  <p className="text-muted-foreground text-sm font-medium">
                    No {statusInfo.label.toLowerCase()} orders
                  </p>
                  <p className="text-muted-foreground text-xs mt-1">
                    Orders will appear here when they reach this status
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Cancelled Orders Section with CSV Download */}
      {ordersByStatus.cancelled && ordersByStatus.cancelled.length > 0 && (
        <div className="mt-8 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <X className="w-5 h-5 text-red-600" />
              <h3 className="text-lg font-semibold text-red-800">
                Cancelled Orders ({ordersByStatus.cancelled.length})
              </h3>
            </div>
            <Button
              onClick={handleDownloadCancelledOrdersCSV}
              variant="outline"
              size="sm"
              className="border-red-300 text-red-700 hover:bg-red-100"
            >
              <Download className="w-4 h-4 mr-2" />
              Download CSV
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {ordersByStatus.cancelled.map((order) => (
              <Card key={order.id} className="border-red-200 bg-white">
                <CardContent className="p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-red-700">
                      {order.order_number}
                    </span>
                    <Badge variant="destructive" className="text-xs">
                      Cancelled
                    </Badge>
                  </div>
                  
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Amount:</span>
                      <span className="font-medium">{formatCurrency(order.total_amount)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Customer:</span>
                      <span className="font-medium">
                        {order.user?.full_name || order.customer_name || 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Phone:</span>
                      <span className="font-medium">
                        {order.user?.phone || order.phone_number || 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Cancelled:</span>
                      <span className="font-medium">{getTimeElapsed(order.created_at)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Items:</span>
                      <span className="font-medium">
                        {orderItems[order.id]?.length || 0} items
                      </span>
                    </div>
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full mt-2 text-red-600 hover:bg-red-100"
                    onClick={() => handleOrderClick(order)}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    View Details
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {filteredOrders.length === 0 && (
        <div className="text-center py-12">
          <Receipt className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">
            {searchQuery || statusFilter !== 'all' 
              ? 'No orders match your search criteria' 
              : 'No orders found'
            }
          </p>
          {(searchQuery || statusFilter !== 'all') && (
            <Button
              variant="outline"
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('all');
              }}
              className="mt-2"
            >
              Clear Filters
            </Button>
          )}
        </div>
      )}

      {/* Selected Order Details */}
      {selectedOrder && (
        <Card className="mt-6">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Order Details: {selectedOrder.order_number}</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedOrder(null)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            
            {/* Combined Order & Customer Details */}
            <div className="grid grid-cols-2 md:grid-cols-6 gap-3 text-sm">
              <div>
                <span className="text-muted-foreground">Status:</span>
                <Badge className="ml-2" variant="secondary">
                  {getStatusInfo(selectedOrder.status).label}
                </Badge>
              </div>
              <div>
                <span className="text-muted-foreground">Amount:</span>
                <span className="ml-2 font-medium">{formatCurrency(selectedOrder.total_amount)}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Block:</span>
                <span className="ml-2 font-medium">{selectedOrder.delivery_block}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Time:</span>
                <span className="ml-2 font-medium">{getTimeElapsed(selectedOrder.created_at)}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Customer:</span>
                <p className="font-medium mt-1">
                  {selectedOrder.user?.full_name || selectedOrder.customer_name || 'N/A'}
                </p>
              </div>
              <div>
                <span className="text-muted-foreground">Phone:</span>
                <p className="font-medium mt-1">
                  {(selectedOrder.user?.phone || selectedOrder.phone_number) ? (
                    <a 
                      href={`tel:${selectedOrder.user?.phone || selectedOrder.phone_number}`}
                      className="text-primary hover:underline flex items-center gap-1"
                    >
                      📞 {selectedOrder.user?.phone || selectedOrder.phone_number}
                    </a>
                  ) : (
                    'N/A'
                  )}
                </p>
              </div>
            </div>

            {/* Order Items */}
            <div className="mt-4 border-t pt-4">
              <h4 className="font-semibold mb-3 text-sm">Order Items ({orderItems[selectedOrder.id]?.length || 0} items):</h4>
              {orderItems[selectedOrder.id] && orderItems[selectedOrder.id].length > 0 ? (
                <div className="space-y-2">
                  {orderItems[selectedOrder.id].map((item) => (
                    <div key={item.id} className="flex justify-between items-center text-sm bg-muted/30 rounded-lg p-2">
                      <div className="flex-1">
                        <span className="font-medium">{item.quantity}x {item.menu_item.name}</span>
                        {item.special_instructions && (
                          <p className="text-muted-foreground text-xs mt-1">
                            Note: {item.special_instructions}
                          </p>
                        )}
                      </div>
                      <span className="font-medium text-primary">₹{item.total_price}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 text-muted-foreground">
                  <p>No items found for this order</p>
                  <p className="text-xs mt-1">Order total: {formatCurrency(selectedOrder.total_amount)}</p>
                </div>
              )}
            </div>
            
            {/* Order Actions - Only Cancel Button */}
            <div className="mt-4 border-t pt-4">
              <h4 className="font-semibold mb-3 text-sm">Order Actions:</h4>
              
              {/* Cancel Order Section */}
              {getAvailableStatuses(selectedOrder.status).includes('cancelled') && (
                <div className="flex flex-col sm:flex-row gap-3 mb-4">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-muted-foreground mb-2">
                      Cancel Order:
                    </label>
                    <Button
                      onClick={() => handleStatusUpdate(selectedOrder.id, 'cancelled')}
                      variant="destructive"
                      size="sm"
                      className="text-xs"
                    >
                      Cancel Order
                    </Button>
                  </div>
                </div>
              )}

              {/* Current Status Info */}
              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground">Current Status:</span>
                <Badge className={getStatusInfo(selectedOrder.status).color + ' text-white'}>
                  {getStatusInfo(selectedOrder.status).label}
                </Badge>
                {selectedOrder.status === 'completed' && (
                  <span className="text-green-600 text-xs">✓ Order completed successfully</span>
                )}
                {selectedOrder.status === 'cancelled' && (
                  <span className="text-red-600 text-xs">✗ Order has been cancelled</span>
                )}
              </div>

              {/* Additional Actions */}
              <div className="flex gap-2 mt-4">
                <Button variant="outline" size="sm">
                  <Eye className="w-4 h-4 mr-2" />
                  View Full Details
                </Button>
                <Button variant="outline" size="sm">
                  <Receipt className="w-4 h-4 mr-2" />
                  Print Receipt
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Simple Receipt Component */}
      {showSimpleReceipt && simpleReceiptOrder && (
        <SimpleReceipt 
          order={simpleReceiptOrder} 
          orderItems={orderItems[simpleReceiptOrder.id] || []}
          onClose={() => {
            setShowSimpleReceipt(false);
            setSimpleReceiptOrder(null);
          }}
        />
      )}
    </div>
  );
};

// Helper function to get next status
const getNextStatus = (currentStatus: Order['status']): Order['status'] => {
  switch (currentStatus) {
    case 'received': return 'confirmed';
    case 'confirmed': return 'preparing';
    case 'preparing': return 'on_the_way';
    case 'on_the_way': return 'completed';
    case 'completed': return 'completed'; // Already completed
    case 'cancelled': return 'cancelled'; // Already cancelled
    default: return currentStatus;
  }
};

// Helper function to get available status options
const getAvailableStatuses = (currentStatus: Order['status']): Order['status'][] => {
  switch (currentStatus) {
    case 'received':
      return ['confirmed', 'cancelled'];
    case 'confirmed':
      return ['preparing', 'cancelled'];
    case 'preparing':
      return ['on_the_way', 'cancelled'];
    case 'on_the_way':
      return ['completed', 'cancelled'];
    case 'completed':
      return []; // No further status changes
    case 'cancelled':
      return []; // No further status changes
    default:
      return [];
  }
};

export default CompactOrderGrid;
