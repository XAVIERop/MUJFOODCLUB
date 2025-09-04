import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Printer, Download, Share2, Copy, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ReceiptItem {
  id: string;
  name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  special_instructions?: string;
}

interface ReceiptData {
  order_id: string;
  order_number: string;
  cafe_name: string;
  customer_name: string;
  customer_phone: string;
  delivery_block: string;
  items: ReceiptItem[];
  subtotal: number;
  tax_amount: number;
  discount_amount: number;
  final_amount: number;
  payment_method: string;
  order_date: string;
  estimated_delivery: string;
  points_earned: number;
  points_redeemed: number;
}

interface ReceiptGeneratorProps {
  orderData: ReceiptData;
  onPrint?: () => void;
  onDownload?: () => void;
}

const ReceiptGenerator: React.FC<ReceiptGeneratorProps> = ({ 
  orderData, 
  onPrint, 
  onDownload 
}) => {
  const { toast } = useToast();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handlePrint = () => {
    // Generate and print receipt automatically
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      const receiptHTML = generateReceiptHTML();
      printWindow.document.write(receiptHTML);
      printWindow.document.close();
      
      // Auto-print after a short delay
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 500);
    }
    
    toast({
      title: "Receipt Printed",
      description: "Receipt has been sent to printer",
    });
  };

  const handleDownload = () => {
    if (onDownload) {
      onDownload();
    } else {
      // Generate PDF download
      const receiptContent = generateReceiptHTML();
      const blob = new Blob([receiptContent], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `receipt-${orderData.order_number}.html`;
      a.click();
      URL.revokeObjectURL(url);
    }
    
    toast({
      title: "Receipt Downloaded",
      description: "Receipt has been downloaded successfully",
    });
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: `Order Receipt - ${orderData.order_number}`,
          text: `Your order receipt for ${orderData.cafe_name}`,
          url: window.location.href
        });
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(
          `Order Receipt - ${orderData.order_number}\n${orderData.cafe_name}\nTotal: ${formatCurrency(orderData.final_amount)}`
        );
        toast({
          title: "Receipt Copied",
          description: "Receipt details copied to clipboard",
        });
      }
    } catch (error) {
      console.error('Error sharing receipt:', error);
      toast({
        title: "Share Failed",
        description: "Could not share receipt",
        variant: "destructive"
      });
    }
  };

  const generateReceiptHTML = () => {
    const isFoodCourt = orderData.cafe_name?.toLowerCase().includes('food court');
    const receiptFormat = isFoodCourt ? 'foodcourt' : 'mujfoodclub';
    
    if (receiptFormat === 'foodcourt') {
      return generateFoodCourtReceipt();
    } else {
      return generateMUJFoodClubReceipt();
    }
  };

  const generateMUJFoodClubReceipt = () => {
    const orderDate = new Date(orderData.order_date);
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
          <title>Receipt - ${orderData.order_number}</title>
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
              <span>${orderData.customer_name}</span>
            </div>
            <div class="info-row">
              <span>Phone:</span>
              <span>${orderData.customer_phone}</span>
            </div>
            <div class="info-row">
              <span>Block:</span>
              <span>${orderData.delivery_block}</span>
            </div>
          </div>
          
          <div class="items-section">
            <div class="info-row" style="font-weight: bold; margin-bottom: 8px;">
              <span>Item</span>
              <span>Qty × Price</span>
              <span>Total</span>
            </div>
            ${orderData.items.map(item => `
              <div class="item-row">
                <div class="item-name">${item.name}</div>
                <div class="item-details">${item.quantity} × ₹${item.unit_price}</div>
                <div class="item-details">₹${item.total_price}</div>
              </div>
            `).join('')}
          </div>
          
          <div class="total-section">
            <div class="info-row">
              <span>Subtotal:</span>
              <span>₹${orderData.subtotal}</span>
            </div>
            <div class="info-row">
              <span>Tax (5%):</span>
              <span>₹${orderData.tax_amount}</span>
            </div>
            <div class="info-row" style="font-size: 16px; margin-top: 8px;">
              <span>TOTAL:</span>
              <span>₹${orderData.final_amount}</span>
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

  const generateFoodCourtReceipt = () => {
    const orderDate = new Date(orderData.order_date);
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
          <title>Receipt - ${orderData.order_number}</title>
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
              <span>${orderData.customer_name} (M: ${orderData.customer_phone})</span>
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
            ${orderData.items.map(item => `
              <div class="item-row">
                <div class="item-name">${item.name}</div>
                <div class="item-details">${item.quantity}</div>
                <div class="item-details">${item.unit_price}.00</div>
                <div class="item-details">${item.total_price}.00</div>
              </div>
            `).join('')}
          </div>
          
          <div class="total-section">
            <div class="info-row">
              <span>Total Qty:</span>
              <span>${orderData.items.reduce((sum, item) => sum + item.quantity, 0)}</span>
            </div>
            <div class="info-row">
              <span>Sub Total:</span>
              <span>${orderData.subtotal}.00</span>
            </div>
            <div class="info-row">
              <span>CGST@2.5 2.5%:</span>
              <span>${(orderData.tax_amount / 2).toFixed(2)}</span>
            </div>
            <div class="info-row">
              <span>SGST@2.5 2.5%:</span>
              <span>${(orderData.tax_amount / 2).toFixed(2)}</span>
            </div>
            <div class="info-row">
              <span>Round off:</span>
              <span>+0.04</span>
            </div>
            <div class="info-row" style="font-size: 16px; margin-top: 8px;">
              <span>Grand Total:</span>
              <span>₹${orderData.final_amount}.00</span>
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

  return (
    <div className="receipt-generator print-friendly">
      <Card className="receipt-card">
        <CardHeader className="text-center pb-4">
          <CardTitle className="text-2xl font-bold text-primary">
            {orderData.cafe_name}
          </CardTitle>
          <div className="space-y-1">
            <p className="text-lg font-semibold">
              Order #{orderData.order_number}
            </p>
            <p className="text-sm text-muted-foreground">
              {formatDate(orderData.order_date)}
            </p>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Customer Information */}
          <div className="bg-muted/30 rounded-lg p-4">
            <h3 className="font-semibold mb-3 text-primary">Customer Details</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Name:</span>
                <p className="font-medium">{orderData.customer_name}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Phone:</span>
                <p className="font-medium">{orderData.customer_phone}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Delivery Block:</span>
                <p className="font-medium">Block {orderData.delivery_block}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Payment:</span>
                <Badge variant="secondary" className="capitalize">
                  {orderData.payment_method}
                </Badge>
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div>
            <h3 className="font-semibold mb-3 text-primary">Order Items</h3>
            <div className="space-y-3">
              {orderData.items.map((item, index) => (
                <div key={item.id} className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{item.quantity}x</span>
                      <span className="font-medium">{item.name}</span>
                    </div>
                    {item.special_instructions && (
                      <p className="text-sm text-muted-foreground mt-1">
                        Note: {item.special_instructions}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{formatCurrency(item.total_price)}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatCurrency(item.unit_price)} each
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Order Summary */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>{formatCurrency(orderData.subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>Tax:</span>
              <span>{formatCurrency(orderData.tax_amount)}</span>
            </div>
            <div className="flex justify-between">
              <span>Discount:</span>
              <span className="text-green-600">
                -{formatCurrency(orderData.discount_amount)}
              </span>
            </div>
            <Separator />
            <div className="flex justify-between text-lg font-bold">
              <span>Total Amount:</span>
              <span className="text-primary">{formatCurrency(orderData.final_amount)}</span>
            </div>
          </div>

          {/* Points Information */}
          {(orderData.points_earned > 0 || orderData.points_redeemed > 0) && (
            <div className="bg-blue-50 rounded-lg p-4">
              <h4 className="font-semibold text-blue-800 mb-2">Loyalty Points</h4>
              <div className="space-y-1 text-sm">
                {orderData.points_earned > 0 && (
                  <div className="flex justify-between">
                    <span>Points to Earn:</span>
                    <span className="text-green-600">+{orderData.points_earned}</span>
                  </div>
                )}
                {orderData.points_redeemed > 0 && (
                  <div className="flex justify-between">
                    <span>Points Redeemed:</span>
                    <span className="text-red-600">-{orderData.points_redeemed}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Delivery Information */}
          <div className="bg-green-50 rounded-lg p-4">
            <h4 className="font-semibold text-green-800 mb-2">Delivery Information</h4>
            <p className="text-sm text-green-700">
              Estimated delivery: {formatDate(orderData.estimated_delivery)}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3 pt-4">
            <Button onClick={handlePrint} className="flex-1">
              <Printer className="w-4 h-4 mr-2" />
              Print Receipt
            </Button>
            <Button onClick={handleDownload} variant="outline" className="flex-1">
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
            <Button onClick={handleShare} variant="outline" className="flex-1">
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
          </div>

          {/* Success Message */}
          <div className="text-center text-sm text-muted-foreground">
            <CheckCircle className="w-4 h-4 inline mr-1 text-green-500" />
            Receipt generated successfully
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReceiptGenerator;
