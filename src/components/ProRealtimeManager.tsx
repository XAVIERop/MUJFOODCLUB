import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useOptimizedRealtime } from '@/hooks/useSupabasePro';
import { Wifi, WifiOff, Users, Activity } from 'lucide-react';

interface ProRealtimeManagerProps {
  cafeId: string;
}

export const ProRealtimeManager = ({ cafeId }: ProRealtimeManagerProps) => {
  const { isConnected, connectionCount } = useOptimizedRealtime(cafeId);
  const [connectionHistory, setConnectionHistory] = useState<number[]>([]);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  useEffect(() => {
    // Update connection history every 30 seconds
    const interval = setInterval(() => {
      setConnectionHistory(prev => {
        const newHistory = [...prev, connectionCount];
        return newHistory.slice(-20); // Keep last 20 data points
      });
      setLastUpdate(new Date());
    }, 30000);

    return () => clearInterval(interval);
  }, [connectionCount]);

  const getConnectionStatus = () => {
    if (isConnected) {
      if (connectionCount < 100) return { status: 'excellent', color: 'green' };
      if (connectionCount < 300) return { status: 'good', color: 'blue' };
      if (connectionCount < 450) return { status: 'moderate', color: 'yellow' };
      return { status: 'high', color: 'red' };
    }
    return { status: 'disconnected', color: 'gray' };
  };

  const connectionStatus = getConnectionStatus();

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Activity className="w-5 h-5" />
            <span>Pro Real-time Status</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Connection Status */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {isConnected ? (
                <Wifi className="w-5 h-5 text-green-500" />
              ) : (
                <WifiOff className="w-5 h-5 text-red-500" />
              )}
              <span className="font-medium">
                {isConnected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
            <Badge 
              variant={connectionStatus.color === 'green' ? 'default' : 
                      connectionStatus.color === 'blue' ? 'secondary' :
                      connectionStatus.color === 'yellow' ? 'outline' : 'destructive'}
            >
              {connectionStatus.status}
            </Badge>
          </div>

          {/* Connection Count */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-blue-500" />
              <span className="font-medium">Active Connections</span>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">{connectionCount}</div>
              <div className="text-sm text-muted-foreground">
                / 500 (Pro limit)
              </div>
            </div>
          </div>

          {/* Connection Usage Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Connection Usage</span>
              <span>{Math.round((connectionCount / 500) * 100)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-300 ${
                  connectionStatus.color === 'green' ? 'bg-green-500' :
                  connectionStatus.color === 'blue' ? 'bg-blue-500' :
                  connectionStatus.color === 'yellow' ? 'bg-yellow-500' :
                  'bg-red-500'
                }`}
                style={{ width: `${Math.min((connectionCount / 500) * 100, 100)}%` }}
              ></div>
            </div>
          </div>

          {/* Connection History Chart */}
          {connectionHistory.length > 0 && (
            <div className="space-y-2">
              <div className="text-sm font-medium">Connection History (Last 10 minutes)</div>
              <div className="flex items-end space-x-1 h-20">
                {connectionHistory.map((count, index) => (
                  <div
                    key={index}
                    className="flex-1 bg-blue-200 rounded-t"
                    style={{ 
                      height: `${Math.max((count / Math.max(...connectionHistory)) * 100, 5)}%` 
                    }}
                    title={`${count} connections`}
                  ></div>
                ))}
              </div>
            </div>
          )}

          {/* Last Update */}
          <div className="text-xs text-muted-foreground">
            Last updated: {lastUpdate.toLocaleTimeString()}
          </div>

          {/* Pro Plan Benefits */}
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <div className="text-sm font-medium text-blue-900 mb-2">
              Pro Plan Benefits Active:
            </div>
            <ul className="text-xs text-blue-700 space-y-1">
              <li>• 500 concurrent connections (vs 200 on Free)</li>
              <li>• Enhanced real-time performance</li>
              <li>• Priority connection handling</li>
              <li>• Advanced monitoring tools</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
