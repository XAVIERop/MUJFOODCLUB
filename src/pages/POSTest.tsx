import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import ReceiptGenerator from '@/components/ReceiptGenerator';
import PaymentProcessor from '@/components/PaymentProcessor';
import SalesDashboard from '@/components/SalesDashboard';
import Header from '@/components/Header';

const POSTest = () => {
  const [activeTab, setActiveTab] = useState('receipt');

  // Mock data for testing
  const mockReceiptData = {
    order_id: 'test-order-123',
    order_number: 'TEST001',
    cafe_name: 'Test Cafe',
    customer_name: 'John Doe',
    customer_phone: '+91 98765 43210',
    delivery_block: 'B1',
    items: [
      {
        id: 'item-1',
        name: 'Cappuccino',
        quantity: 2,
        unit_price: 80,
        total_price: 160,
        special_instructions: 'Extra hot, no sugar'
      },
      {
        id: 'item-2',
        name: 'Grilled Sandwich',
        quantity: 1,
        unit_price: 120,
        total_price: 120,
        special_instructions: 'Veg only'
      }
    ],
    subtotal: 280,
    tax_amount: 14,
    discount_amount: 20,
    final_amount: 274,
    payment_method: 'cod',
    order_date: new Date().toISOString(),
    estimated_delivery: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
    points_earned: 27,
    points_redeemed: 0
  };

  const mockPaymentData = {
    items: mockReceiptData.items,
    subtotal: mockReceiptData.subtotal,
    tax_amount: mockReceiptData.tax_amount,
    discount_amount: mockReceiptData.discount_amount,
    final_amount: mockReceiptData.final_amount,
    customer_phone: mockReceiptData.customer_phone,
    customer_name: mockReceiptData.customer_name,
    delivery_block: mockReceiptData.delivery_block
  };

  const handlePaymentComplete = (result: any) => {
    console.log('Payment completed:', result);
    alert(`Payment ${result.success ? 'successful' : 'failed'}: ${result.payment_method}`);
  };

  const handlePaymentCancel = () => {
    console.log('Payment cancelled');
    alert('Payment cancelled');
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">🧪 POS System Test Page</h1>
          <p className="text-muted-foreground">
            Test all POS components to ensure they work correctly
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="receipt">Receipt Generator</TabsTrigger>
            <TabsTrigger value="payment">Payment Processor</TabsTrigger>
            <TabsTrigger value="dashboard">Sales Dashboard</TabsTrigger>
          </TabsList>

          <TabsContent value="receipt" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  🧾 Receipt Generator Test
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Test receipt generation, printing, downloading, and sharing
                </p>
              </CardHeader>
              <CardContent>
                <ReceiptGenerator 
                  orderData={mockReceiptData}
                  onPrint={() => alert('Print function called - check console for details')}
                  onDownload={() => alert('Download function called - check console for details')}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payment" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  💳 Payment Processor Test
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Test different payment methods and processing
                </p>
              </CardHeader>
              <CardContent>
                <PaymentProcessor
                  paymentData={mockPaymentData}
                  onPaymentComplete={handlePaymentComplete}
                  onCancel={handlePaymentCancel}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="dashboard" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  📊 Sales Dashboard Test
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Test sales analytics and reporting features
                </p>
              </CardHeader>
              <CardContent>
                <SalesDashboard cafeId="test-cafe-123" />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Test Results Summary */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>🧪 Test Results Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">✅</div>
                  <div className="text-sm text-green-600">Receipt Generator</div>
                  <div className="text-xs text-muted-foreground">Ready for testing</div>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">✅</div>
                  <div className="text-sm text-blue-600">Payment Processor</div>
                  <div className="text-xs text-muted-foreground">Ready for testing</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">✅</div>
                  <div className="text-sm text-purple-600">Sales Dashboard</div>
                  <div className="text-xs text-muted-foreground">Ready for testing</div>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <h4 className="font-semibold">Testing Checklist:</h4>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>✅ <strong>Receipt Generator:</strong> Test print, download, and share functions</li>
                  <li>✅ <strong>Payment Processor:</strong> Test all payment methods and validation</li>
                  <li>✅ <strong>Sales Dashboard:</strong> Test analytics display and export functionality</li>
                  <li>✅ <strong>Integration:</strong> Verify components work together</li>
                  <li>✅ <strong>Responsiveness:</strong> Test on different screen sizes</li>
                </ul>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-800 mb-2">🧪 How to Test:</h4>
                <ol className="text-sm text-blue-700 space-y-1">
                  <li>1. <strong>Receipt Tab:</strong> Test print, download, and share buttons</li>
                  <li>2. <strong>Payment Tab:</strong> Try different payment methods and validation</li>
                  <li>3. <strong>Dashboard Tab:</strong> Check analytics display and export</li>
                  <li>4. <strong>Console:</strong> Check browser console for any errors</li>
                  <li>5. <strong>Responsiveness:</strong> Resize browser window to test mobile</li>
                </ol>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default POSTest;
