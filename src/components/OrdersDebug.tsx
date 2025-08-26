import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

const OrdersDebug = () => {
  const { user } = useAuth();
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const runDebugTest = async () => {
    setLoading(true);
    const info: any = {};

    try {
      // Test 1: Check user
      info.user = {
        id: user?.id,
        email: user?.email
      };

      // Test 2: Check cafe staff record
      const { data: staffData, error: staffError } = await supabase
        .from('cafe_staff')
        .select('*')
        .eq('user_id', user?.id);

      info.cafeStaff = {
        data: staffData,
        error: staffError
      };

      // Test 3: Get cafe ID
      if (staffData && staffData.length > 0) {
        const cafeId = staffData[0].cafe_id;
        info.cafeId = cafeId;

        // Test 4: Try to fetch orders
        const { data: ordersData, error: ordersError } = await supabase
          .from('orders')
          .select('*')
          .eq('cafe_id', cafeId)
          .limit(5);

        info.orders = {
          data: ordersData,
          error: ordersError,
          count: ordersData?.length || 0
        };

        // Test 5: Try the full query with joins
        const { data: fullData, error: fullError } = await supabase
          .from('orders')
          .select(`
            *,
            user:profiles(full_name, phone, block, email)
          `)
          .eq('cafe_id', cafeId)
          .limit(3);

        info.fullQuery = {
          data: fullData,
          error: fullError,
          count: fullData?.length || 0
        };
      }

    } catch (error) {
      info.error = error;
    }

    setDebugInfo(info);
    setLoading(false);
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Orders Debug Panel
          <Button onClick={runDebugTest} disabled={loading}>
            {loading ? 'Testing...' : 'Run Debug Test'}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {debugInfo && (
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">User Info:</h4>
              <pre className="text-xs bg-gray-100 p-2 rounded">
                {JSON.stringify(debugInfo.user, null, 2)}
              </pre>
            </div>

            <div>
              <h4 className="font-medium mb-2">Cafe Staff:</h4>
              <pre className="text-xs bg-gray-100 p-2 rounded">
                {JSON.stringify(debugInfo.cafeStaff, null, 2)}
              </pre>
            </div>

            {debugInfo.cafeId && (
              <>
                <div>
                  <h4 className="font-medium mb-2">Cafe ID:</h4>
                  <pre className="text-xs bg-gray-100 p-2 rounded">
                    {debugInfo.cafeId}
                  </pre>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Simple Orders Query:</h4>
                  <pre className="text-xs bg-gray-100 p-2 rounded">
                    {JSON.stringify(debugInfo.orders, null, 2)}
                  </pre>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Full Query with Joins:</h4>
                  <pre className="text-xs bg-gray-100 p-2 rounded">
                    {JSON.stringify(debugInfo.fullQuery, null, 2)}
                  </pre>
                </div>
              </>
            )}

            {debugInfo.error && (
              <div>
                <h4 className="font-medium mb-2 text-red-600">Error:</h4>
                <pre className="text-xs bg-red-50 p-2 rounded text-red-600">
                  {JSON.stringify(debugInfo.error, null, 2)}
                </pre>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default OrdersDebug;
