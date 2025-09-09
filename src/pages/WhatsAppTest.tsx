import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { whatsappService } from '@/services/whatsappService';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/Header';
import WhatsAppDebug from '@/components/WhatsAppDebug';

const WhatsAppTest = () => {
  const [cafeId, setCafeId] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [testMessage, setTestMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [cafes, setCafes] = useState<any[]>([]);
  const { toast } = useToast();

  React.useEffect(() => {
    fetchCafes();
  }, []);

  const fetchCafes = async () => {
    try {
      const { data, error } = await supabase
        .from('cafes')
        .select('id, name, whatsapp_phone, whatsapp_enabled, whatsapp_notifications')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setCafes(data || []);
    } catch (error) {
      console.error('Error fetching cafes:', error);
    }
  };

  const testWhatsAppNotification = async () => {
    if (!cafeId) {
      toast({
        title: "Error",
        description: "Please select a cafe",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const testOrderData = {
        id: 'test-order-id',
        order_number: 'TEST-' + Date.now(),
        customer_name: 'Test Customer',
        phone_number: phoneNumber || '+91 98765 43210',
        delivery_block: 'B1',
        total_amount: 250,
        created_at: new Date().toISOString(),
        delivery_notes: testMessage || 'Test order for WhatsApp integration',
        order_items: [
          {
            quantity: 1,
            menu_item: {
              name: 'Test Item',
              price: 250
            },
            total_price: 250
          }
        ]
      };

      console.log('🧪 Testing WhatsApp notification...');
      const success = await whatsappService.sendOrderNotification(cafeId, testOrderData);
      
      if (success) {
        toast({
          title: "Test Successful",
          description: "WhatsApp notification test completed. Check console for details.",
        });
      } else {
        toast({
          title: "Test Failed",
          description: "WhatsApp notification test failed. Check console for details.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Test error:', error);
      toast({
        title: "Test Error",
        description: "An error occurred during testing",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const testDatabaseFunction = async () => {
    if (!cafeId) {
      toast({
        title: "Error",
        description: "Please select a cafe",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const testOrderData = {
        order_number: 'DB-TEST-' + Date.now(),
        customer_name: 'Database Test Customer',
        phone_number: phoneNumber || '+91 98765 43210',
        delivery_block: 'B1',
        total_amount: 300,
        created_at: new Date().toISOString(),
        items_text: '• Database Test Item x1 - ₹300',
        delivery_notes: testMessage || 'Database function test',
        frontend_url: window.location.origin
      };

      console.log('🧪 Testing database WhatsApp function...');
      const { data, error } = await supabase
        .rpc('send_whatsapp_notification', {
          p_cafe_id: cafeId,
          p_order_data: testOrderData
        });

      if (error) {
        console.error('Database function error:', error);
        toast({
          title: "Database Test Failed",
          description: error.message,
          variant: "destructive"
        });
      } else {
        console.log('Database function result:', data);
        toast({
          title: "Database Test Successful",
          description: `Function returned: ${data}`,
        });
      }
    } catch (error) {
      console.error('Database test error:', error);
      toast({
        title: "Database Test Error",
        description: "An error occurred during database testing",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <span className="text-2xl mr-2">🧪</span>
                WhatsApp Integration Test
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Cafe Selection */}
              <div>
                <Label htmlFor="cafe-select">Select Cafe</Label>
                <select
                  id="cafe-select"
                  value={cafeId}
                  onChange={(e) => setCafeId(e.target.value)}
                  className="w-full p-2 border rounded-md mt-1"
                >
                  <option value="">Choose a cafe...</option>
                  {cafes.map(cafe => (
                    <option key={cafe.id} value={cafe.id}>
                      {cafe.name} - WhatsApp: {cafe.whatsapp_enabled ? 'Enabled' : 'Disabled'} ({cafe.whatsapp_phone || 'No phone'})
                    </option>
                  ))}
                </select>
              </div>

              {/* Phone Number */}
              <div>
                <Label htmlFor="phone">Test Phone Number (Optional)</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                />
              </div>

              {/* Test Message */}
              <div>
                <Label htmlFor="message">Test Message (Optional)</Label>
                <Textarea
                  id="message"
                  placeholder="Enter a test message for the notification..."
                  value={testMessage}
                  onChange={(e) => setTestMessage(e.target.value)}
                />
              </div>

              {/* Test Buttons */}
              <div className="flex gap-4">
                <Button
                  onClick={testWhatsAppNotification}
                  disabled={loading || !cafeId}
                  className="flex-1"
                >
                  {loading ? 'Testing...' : 'Test Frontend Service'}
                </Button>
                <Button
                  onClick={testDatabaseFunction}
                  disabled={loading || !cafeId}
                  variant="outline"
                  className="flex-1"
                >
                  {loading ? 'Testing...' : 'Test Database Function'}
                </Button>
              </div>

              {/* Instructions */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Test Instructions:</h3>
                <ol className="list-decimal list-inside space-y-1 text-sm">
                  <li>Select a cafe from the dropdown</li>
                  <li>Optionally enter a test phone number and message</li>
                  <li>Click "Test Frontend Service" to test the WhatsApp service</li>
                  <li>Click "Test Database Function" to test the database function</li>
                  <li>Check the browser console for detailed logs</li>
                  <li>Check the toast notifications for results</li>
                </ol>
              </div>

              {/* Current Cafe Status */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Current Cafe WhatsApp Status:</h3>
                <div className="space-y-2">
                  {cafes.map(cafe => (
                    <div key={cafe.id} className="flex justify-between items-center text-sm">
                      <span>{cafe.name}</span>
                      <span className={`px-2 py-1 rounded text-xs ${
                        cafe.whatsapp_enabled && cafe.whatsapp_phone 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {cafe.whatsapp_enabled && cafe.whatsapp_phone 
                          ? `✅ ${cafe.whatsapp_phone}` 
                          : '❌ Not configured'
                        }
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* WhatsApp Debug Component */}
          <WhatsAppDebug />
        </div>
      </div>
    </div>
  );
};

export default WhatsAppTest;
