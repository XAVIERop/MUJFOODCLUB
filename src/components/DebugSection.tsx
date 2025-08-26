import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

const DebugSection = () => {
  const { user, profile } = useAuth();
  const [testResults, setTestResults] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [showDebug, setShowDebug] = useState(false);

  const runTests = async () => {
    setLoading(true);
    const results: any = {};

    try {
      // Test 1: Check if order_notifications table exists
      const { data: notifications, error: notificationsError } = await supabase
        .from('order_notifications')
        .select('*')
        .limit(1);
      
      results.notificationsTable = {
        exists: !notificationsError,
        error: notificationsError?.message
      };

      // Test 2: Check if orders table has new columns
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select('status_updated_at, points_credited, accepted_at, preparing_at, out_for_delivery_at, completed_at')
        .limit(1);
      
      results.ordersColumns = {
        exists: !ordersError,
        error: ordersError?.message,
        hasColumns: orders && orders.length > 0
      };

      // Test 3: Check user profile
      results.userProfile = {
        hasUser: !!user,
        hasProfile: !!profile,
        profileData: profile
      };

      // Test 4: Check if we can create a test notification
      if (user && profile) {
        const { data: testOrder, error: orderError } = await supabase
          .from('orders')
          .select('id, cafe_id')
          .eq('user_id', user.id)
          .limit(1);

        if (testOrder && testOrder.length > 0) {
          const { error: notificationError } = await supabase
            .from('order_notifications')
            .insert({
              order_id: testOrder[0].id,
              cafe_id: testOrder[0].cafe_id,
              user_id: user.id,
              notification_type: 'test',
              message: 'Test notification'
            });

          results.notificationCreation = {
            success: !notificationError,
            error: notificationError?.message
          };
        } else {
          results.notificationCreation = {
            success: false,
            error: 'No orders found for testing'
          };
        }
      }

    } catch (error) {
      results.generalError = error;
    }

    setTestResults(results);
    setLoading(false);
  };

  // Only show debug section if user is logged in
  if (!user) return null;

  return (
    <section className="py-8 bg-muted/50">
      <div className="container mx-auto px-4">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">🔧 Debug Panel</CardTitle>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowDebug(!showDebug)}
              >
                {showDebug ? 'Hide' : 'Show'} Debug
              </Button>
            </div>
          </CardHeader>
          {showDebug && (
            <CardContent className="space-y-4">
              <Button onClick={runTests} disabled={loading} className="w-full">
                {loading ? 'Running Tests...' : '🔍 Test Database Features'}
              </Button>

              {Object.keys(testResults).length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Test Results:</h3>
                  
                  {Object.entries(testResults).map(([testName, result]: [string, any]) => (
                    <div key={testName} className="p-4 border rounded-lg">
                      <h4 className="font-medium mb-2 flex items-center gap-2">
                        {testName.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                        {result.exists || result.success ? (
                          <Badge variant="default" className="text-xs">✅ Working</Badge>
                        ) : (
                          <Badge variant="destructive" className="text-xs">❌ Error</Badge>
                        )}
                      </h4>
                      <pre className="text-sm bg-muted p-2 rounded overflow-auto max-h-32">
                        {JSON.stringify(result, null, 2)}
                      </pre>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">What to check:</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Look for "My Orders" in the header dropdown menu</li>
                  <li>• Check if notification bell appears in header</li>
                  <li>• Try visiting /orders to see order tracking</li>
                  <li>• If tests fail, apply the database migration</li>
                </ul>
              </div>
            </CardContent>
          )}
        </Card>
      </div>
    </section>
  );
};

export default DebugSection;
