import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, Database, Bell, Users, AlertCircle, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface DebugInfo {
  recentOrders: any[];
  cafeStaff: any[];
  notifications: any[];
  activeSubscriptions: string[];
  lastOrderTime: string | null;
  subscriptionStatus: 'connected' | 'disconnected' | 'unknown';
}

const POSDashboardDebugger: React.FC<{ cafeId: string | null }> = ({ cafeId }) => {
  const [debugInfo, setDebugInfo] = useState<DebugInfo>({
    recentOrders: [],
    cafeStaff: [],
    notifications: [],
    activeSubscriptions: [],
    lastOrderTime: null,
    subscriptionStatus: 'unknown'
  });
  const [loading, setLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  const fetchDebugInfo = async () => {
    if (!cafeId) return;
    
    setLoading(true);
    try {
      console.log('🔍 POS Debugger: Fetching debug info for cafe:', cafeId);

      // Fetch recent orders
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select('id, order_number, status, created_at, cafe_id')
        .eq('cafe_id', cafeId)
        .order('created_at', { ascending: false })
        .limit(5);

      if (ordersError) {
        console.error('Error fetching orders:', ordersError);
      }

      // Fetch cafe staff
      const { data: staff, error: staffError } = await supabase
        .from('cafe_staff')
        .select(`
          user_id,
          cafe_id,
          profiles(email, full_name)
        `)
        .eq('cafe_id', cafeId);

      if (staffError) {
        console.error('Error fetching staff:', staffError);
      }

      // Fetch notifications
      const { data: notifications, error: notificationsError } = await supabase
        .from('order_notifications')
        .select('id, order_id, message, created_at, is_read')
        .eq('cafe_id', cafeId)
        .order('created_at', { ascending: false })
        .limit(5);

      if (notificationsError) {
        console.error('Error fetching notifications:', notificationsError);
      }

      // Check subscription status
      const subscriptionStatus = supabase.getChannels().length > 0 ? 'connected' : 'disconnected';

      setDebugInfo({
        recentOrders: orders || [],
        cafeStaff: staff || [],
        notifications: notifications || [],
        activeSubscriptions: supabase.getChannels().map(ch => ch.topic),
        lastOrderTime: orders && orders.length > 0 ? orders[0].created_at : null,
        subscriptionStatus
      });

      console.log('🔍 Debug info updated:', {
        ordersCount: orders?.length || 0,
        staffCount: staff?.length || 0,
        notificationsCount: notifications?.length || 0,
        subscriptionStatus
      });

    } catch (error) {
      console.error('Error fetching debug info:', error);
    } finally {
      setLoading(false);
    }
  };

  const testOrderCreation = async () => {
    if (!cafeId) return;
    
    try {
      console.log('🧪 Testing order creation...');
      
      // Create a test order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: '00000000-0000-0000-0000-000000000000', // Test user
          cafe_id: cafeId,
          order_number: `TEST-${Date.now()}`,
          total_amount: 100.00,
          delivery_block: 'A',
          status: 'received',
          estimated_delivery: new Date(Date.now() + 30 * 60 * 1000).toISOString()
        })
        .select()
        .single();

      if (orderError) {
        console.error('Test order creation failed:', orderError);
        alert(`Test order creation failed: ${orderError.message}`);
      } else {
        console.log('✅ Test order created successfully:', order);
        alert('Test order created successfully! Check if it appears in the dashboard.');
        fetchDebugInfo(); // Refresh debug info
      }
    } catch (error) {
      console.error('Test order creation error:', error);
      alert(`Test order creation error: ${error}`);
    }
  };

  const testSubscription = () => {
    console.log('🧪 Testing subscription...');
    
    const channel = supabase
      .channel('debug-test')
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'orders',
          filter: `cafe_id=eq.${cafeId}`
        }, 
        (payload) => {
          console.log('🎉 Test subscription received order:', payload.new);
          alert('Test subscription working! New order detected.');
        }
      )
      .subscribe();

    // Clean up after 10 seconds
    setTimeout(() => {
      supabase.removeChannel(channel);
      console.log('🧹 Test subscription cleaned up');
    }, 10000);

    alert('Test subscription started. Try creating an order within 10 seconds.');
  };

  useEffect(() => {
    if (cafeId && isVisible) {
      fetchDebugInfo();
    }
  }, [cafeId, isVisible]);

  if (!isVisible) {
    return (
      <Button
        onClick={() => setIsVisible(true)}
        variant="outline"
        size="sm"
        className="fixed bottom-4 right-4 z-50"
      >
        <Database className="w-4 h-4 mr-2" />
        Debug POS
      </Button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl max-h-[80vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center">
              <Database className="w-5 h-5 mr-2" />
              POS Dashboard Debugger
            </CardTitle>
            <div className="flex gap-2">
              <Button
                onClick={fetchDebugInfo}
                disabled={loading}
                size="sm"
                variant="outline"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button
                onClick={() => setIsVisible(false)}
                size="sm"
                variant="ghost"
              >
                Close
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Status Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Recent Orders</p>
                    <p className="text-2xl font-bold">{debugInfo.recentOrders.length}</p>
                  </div>
                  <Database className="w-8 h-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Cafe Staff</p>
                    <p className="text-2xl font-bold">{debugInfo.cafeStaff.length}</p>
                  </div>
                  <Users className="w-8 h-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Notifications</p>
                    <p className="text-2xl font-bold">{debugInfo.notifications.length}</p>
                  </div>
                  <Bell className="w-8 h-8 text-orange-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Subscription Status */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Subscription Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                {debugInfo.subscriptionStatus === 'connected' ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-red-500" />
                )}
                <span className="font-medium">
                  {debugInfo.subscriptionStatus === 'connected' ? 'Connected' : 'Disconnected'}
                </span>
                <Badge variant="outline">
                  {debugInfo.activeSubscriptions.length} active
                </Badge>
              </div>
              {debugInfo.activeSubscriptions.length > 0 && (
                <div className="mt-2">
                  <p className="text-sm text-muted-foreground">Active subscriptions:</p>
                  <ul className="text-xs text-muted-foreground mt-1">
                    {debugInfo.activeSubscriptions.map((sub, index) => (
                      <li key={index}>• {sub}</li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Orders */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Recent Orders</CardTitle>
            </CardHeader>
            <CardContent>
              {debugInfo.recentOrders.length === 0 ? (
                <p className="text-muted-foreground">No recent orders found</p>
              ) : (
                <div className="space-y-2">
                  {debugInfo.recentOrders.map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-2 border rounded">
                      <div>
                        <p className="font-medium">{order.order_number}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(order.created_at).toLocaleString()}
                        </p>
                      </div>
                      <Badge variant={order.status === 'received' ? 'default' : 'secondary'}>
                        {order.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Test Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Test Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Button onClick={testOrderCreation} variant="outline">
                  Create Test Order
                </Button>
                <Button onClick={testSubscription} variant="outline">
                  Test Subscription
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                Use these buttons to test if order creation and real-time updates are working properly.
              </p>
            </CardContent>
          </Card>

          {/* Debug Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Raw Debug Data</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="text-xs bg-muted p-4 rounded overflow-auto max-h-40">
                {JSON.stringify(debugInfo, null, 2)}
              </pre>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
};

export default POSDashboardDebugger;