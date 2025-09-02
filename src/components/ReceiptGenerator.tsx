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
    if (onPrint) {
      onPrint();
    } else {
      window.print();
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
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Receipt - ${orderData.order_number}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 10px; }
            .item { display: flex; justify-content: space-between; margin: 5px 0; }
            .total { border-top: 1px solid #000; margin-top: 10px; padding-top: 10px; }
            .footer { text-align: center; margin-top: 20px; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h2>${orderData.cafe_name}</h2>
            <p>Order #${orderData.order_number}</p>
            <p>${formatDate(orderData.order_date)}</p>
          </div>
          
          <div class="customer-info">
            <p><strong>Customer:</strong> ${orderData.customer_name}</p>
            <p><strong>Phone:</strong> ${orderData.customer_phone}</p>
            <p><strong>Delivery:</strong> Block ${orderData.delivery_block}</p>
          </div>
          
          <div class="items">
            ${orderData.items.map(item => `
              <div class="item">
                <span>${item.quantity}x ${item.name}</span>
                <span>${formatCurrency(item.total_price)}</span>
              </div>
            `).join('')}
          </div>
          
          <div class="total">
            <div class="item">
              <span>Subtotal:</span>
              <span>${formatCurrency(orderData.subtotal)}</span>
            </div>
            <div class="item">
              <span>Tax:</span>
              <span>${formatCurrency(orderData.tax_amount)}</span>
            </div>
            <div class="item">
              <span>Discount:</span>
              <span>${formatCurrency(orderData.discount_amount)}</span>
            </div>
            <div class="item">
              <span><strong>Total:</strong></span>
              <span><strong>${formatCurrency(orderData.final_amount)}</strong></span>
            </div>
          </div>
          
          <div class="footer">
            <p>Payment: ${orderData.payment_method.toUpperCase()}</p>
            <p>Points Earned: ${orderData.points_earned}</p>
            <p>Thank you for your order!</p>
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
