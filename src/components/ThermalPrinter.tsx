import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Printer, Download, Settings, TestTube } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  total: number;
}

interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  items: OrderItem[];
  total_amount: number;
  order_time: string;
  status: string;
  table_number?: string;
  delivery_block?: string;
}

interface ThermalPrinterProps {
  order: Order | null;
  onClose: () => void;
}

const ThermalPrinter: React.FC<ThermalPrinterProps> = ({ order, onClose }) => {
  const [printerType, setPrinterType] = useState<'browser' | 'thermal'>('browser');
  const [paperWidth, setPaperWidth] = useState<'58mm' | '80mm'>('80mm');
  const [autoPrint, setAutoPrint] = useState(true);
  const [isPrinting, setIsPrinting] = useState(false);

  const generateThermalHTML = (orderData: Order) => {
    const paperWidthClass = paperWidth === '58mm' ? 'w-[58mm]' : 'w-[80mm]';
    
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Receipt #${orderData.order_number}</title>
          <style>
            @media print {
              body { 
                width: ${paperWidth}; 
                margin: 0; 
                padding: 5mm;
                font-size: 12px; 
                font-family: 'Courier New', monospace;
                line-height: 1.2;
              }
              .no-print { display: none; }
              .page-break { page-break-after: always; }
            }
            
            body {
              font-family: 'Courier New', monospace;
              line-height: 1.2;
              color: #000;
            }
            
            .receipt-container {
              ${paperWidthClass};
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
            
            .qr-code {
              text-align: center;
              margin: 15px 0;
              font-size: 8px;
            }
          </style>
        </head>
        <body>
          <div class="receipt-container">
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
                <span>${new Date(orderData.order_time).toLocaleDateString()}</span>
              </div>
              <div class="info-row">
                <span>Time:</span>
                <span>${new Date(orderData.order_time).toLocaleTimeString()}</span>
              </div>
              <div class="info-row">
                <span>Customer:</span>
                <span>${orderData.customer_name}</span>
              </div>
              <div class="info-row">
                <span>Phone:</span>
                <span>${orderData.customer_phone}</span>
              </div>
              ${orderData.delivery_block === 'DINE_IN' && orderData.table_number ? `
              <div class="info-row">
                <span>Table:</span>
                <span>${orderData.table_number}</span>
              </div>
              ` : ''}
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
                  <div class="item-details">${item.quantity} × ₹${item.price}</div>
                  <div class="item-details">₹${item.total}</div>
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
              <div class="qr-code">
                [QR Code Placeholder]
                <br>Scan for digital receipt
              </div>
            </div>
          </div>
        </body>
      </html>
    `;
  };

  const printThermalReceipt = async () => {
    if (!order) return;
    
    setIsPrinting(true);
    
    try {
      if (printerType === 'browser') {
        // Browser-based printing
        const printWindow = window.open('', '_blank');
        if (printWindow) {
          const thermalHTML = generateThermalHTML(order);
          printWindow.document.write(thermalHTML);
          printWindow.document.close();
          
          // Auto-print if enabled
          if (autoPrint) {
            setTimeout(() => {
              printWindow.print();
              printWindow.close();
            }, 500);
          }
        }
      } else {
        // For thermal printer integration (would need backend)
        console.log('Thermal printer integration requires backend setup');
        // This would call your backend API
        // await fetch('/api/print-thermal', {
        //   method: 'POST',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify({ order, printerType, paperWidth })
        // });
      }
    } catch (error) {
      console.error('Printing failed:', error);
    } finally {
      setIsPrinting(false);
    }
  };

  const downloadReceipt = () => {
    if (!order) return;
    
    const thermalHTML = generateThermalHTML(order);
    const blob = new Blob([thermalHTML], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `receipt-${order.order_number}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const testPrint = () => {
    const testOrder: Order = {
      id: 'test',
      order_number: 'TEST001',
      customer_name: 'Test Customer',
      customer_phone: '+91 98765 43210',
      items: [
        { id: '1', name: 'Test Item 1', quantity: 2, price: 150, total: 300 },
        { id: '2', name: 'Test Item 2', quantity: 1, price: 200, total: 200 }
      ],
      total_amount: 500,
      order_time: new Date().toISOString(),
      status: 'completed'
    };
    
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      const thermalHTML = generateThermalHTML(testOrder);
      printWindow.document.write(thermalHTML);
      printWindow.document.close();
      
      if (autoPrint) {
        setTimeout(() => {
          printWindow.print();
          printWindow.close();
        }, 500);
      }
    }
  };

  if (!order) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Printer className="w-5 h-5" />
            Thermal Printer
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Select an order to print receipt</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Printer className="w-5 h-5" />
          Print Receipt - #{order.order_number}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Printer Settings */}
        <div className="space-y-4">
          <h3 className="font-semibold text-lg">Printer Settings</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="printer-type">Printer Type</Label>
              <Select value={printerType} onValueChange={(value: 'browser' | 'thermal') => setPrinterType(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="browser">Browser Print</SelectItem>
                  <SelectItem value="thermal">Thermal Printer</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="paper-width">Paper Width</Label>
              <Select value={paperWidth} onValueChange={(value: '58mm' | '80mm') => setPaperWidth(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="58mm">58mm (Narrow)</SelectItem>
                  <SelectItem value="80mm">80mm (Standard)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch
              id="auto-print"
              checked={autoPrint}
              onCheckedChange={setAutoPrint}
            />
            <Label htmlFor="auto-print">Auto-print when opened</Label>
          </div>
        </div>

        {/* Order Summary */}
        <div className="space-y-3">
          <h3 className="font-semibold text-lg">Order Summary</h3>
          <div className="bg-gray-50 p-4 rounded-lg space-y-2">
            <div className="flex justify-between">
              <span className="font-medium">Customer:</span>
              <span>{order.customer_name}</span>
            </div>
            {order.delivery_block === 'DINE_IN' && order.table_number && (
              <div className="flex justify-between">
                <span className="font-medium">Table:</span>
                <span>{order.table_number}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="font-medium">Items:</span>
              <span>{order.items.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Total:</span>
              <span className="font-bold">₹{order.total_amount}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Status:</span>
              <Badge variant={order.status === 'completed' ? 'default' : 'secondary'}>
                {order.status}
              </Badge>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3">
          <Button 
            onClick={printThermalReceipt} 
            disabled={isPrinting}
            className="flex-1"
          >
            <Printer className="w-4 h-4 mr-2" />
            {isPrinting ? 'Printing...' : 'Print Receipt'}
          </Button>
          
          <Button 
            onClick={downloadReceipt} 
            variant="outline"
            className="flex-1"
          >
            <Download className="w-4 h-4 mr-2" />
            Download HTML
          </Button>
          
          <Button 
            onClick={testPrint} 
            variant="outline"
            size="sm"
          >
            <TestTube className="w-4 h-4 mr-2" />
            Test Print
          </Button>
        </div>

        {/* Info */}
        <div className="text-sm text-muted-foreground bg-blue-50 p-3 rounded-lg">
          <p><strong>Note:</strong> For thermal printer integration, you'll need to:</p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>Install printer drivers on your system</li>
            <li>Set up a backend service for printer communication</li>
            <li>Configure printer settings (port, baud rate, etc.)</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default ThermalPrinter;
