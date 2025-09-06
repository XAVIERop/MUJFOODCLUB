import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Activity, 
  Clock, 
  HardDrive, 
  Network, 
  AlertTriangle, 
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Minus
} from 'lucide-react';
import { usePerformanceMonitor } from '@/hooks/usePerformanceMonitor';

interface PerformanceMetrics {
  loadTime: number;
  renderTime: number;
  memoryUsage?: number;
  networkRequests: number;
  errors: number;
}

const PerformanceDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    loadTime: 0,
    renderTime: 0,
    memoryUsage: 0,
    networkRequests: 0,
    errors: 0
  });

  const [isVisible, setIsVisible] = useState(false);
  const [previousMetrics, setPreviousMetrics] = useState<PerformanceMetrics | null>(null);

  const { getMetrics, resetMetrics } = usePerformanceMonitor({
    enabled: process.env.NODE_ENV === 'development',
    logToConsole: false,
    reportInterval: 5000, // 5 seconds
    onMetricsUpdate: (newMetrics) => {
      setPreviousMetrics(metrics);
      setMetrics(newMetrics);
    }
  });

  // Toggle visibility with Ctrl+Shift+P
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.shiftKey && event.key === 'P') {
        setIsVisible(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const getTrendIcon = (current: number, previous: number | null) => {
    if (!previous) return <Minus className="w-3 h-3" />;
    if (current > previous) return <TrendingUp className="w-3 h-3 text-red-500" />;
    if (current < previous) return <TrendingDown className="w-3 h-3 text-green-500" />;
    return <Minus className="w-3 h-3 text-gray-500" />;
  };

  const getStatusColor = (value: number, thresholds: { good: number; warning: number }) => {
    if (value <= thresholds.good) return 'bg-green-500';
    if (value <= thresholds.warning) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  if (!isVisible || process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-80 max-h-96 overflow-y-auto">
      <Card className="bg-white/95 backdrop-blur-sm border-2 border-gray-200 shadow-xl">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Performance Monitor
            </CardTitle>
            <div className="flex gap-1">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setMetrics(getMetrics())}
                className="h-6 w-6 p-0"
              >
                <RefreshCw className="w-3 h-3" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={resetMetrics}
                className="h-6 w-6 p-0"
              >
                <Activity className="w-3 h-3" />
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="pt-0">
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="overview" className="text-xs">Overview</TabsTrigger>
              <TabsTrigger value="details" className="text-xs">Details</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="space-y-3 mt-3">
              {/* Load Time */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-blue-500" />
                  <span className="text-sm font-medium">Load Time</span>
                </div>
                <div className="flex items-center gap-2">
                  {getTrendIcon(metrics.loadTime, previousMetrics?.loadTime)}
                  <Badge 
                    className={`text-xs ${getStatusColor(metrics.loadTime, { good: 1000, warning: 3000 })}`}
                  >
                    {metrics.loadTime}ms
                  </Badge>
                </div>
              </div>

              {/* Memory Usage */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <HardDrive className="w-4 h-4 text-green-500" />
                  <span className="text-sm font-medium">Memory</span>
                </div>
                <div className="flex items-center gap-2">
                  {getTrendIcon(metrics.memoryUsage || 0, previousMetrics?.memoryUsage)}
                  <Badge 
                    className={`text-xs ${getStatusColor(metrics.memoryUsage || 0, { good: 50, warning: 100 })}`}
                  >
                    {metrics.memoryUsage?.toFixed(1)}MB
                  </Badge>
                </div>
              </div>

              {/* Network Requests */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Network className="w-4 h-4 text-purple-500" />
                  <span className="text-sm font-medium">Requests</span>
                </div>
                <div className="flex items-center gap-2">
                  {getTrendIcon(metrics.networkRequests, previousMetrics?.networkRequests)}
                  <Badge variant="outline" className="text-xs">
                    {metrics.networkRequests}
                  </Badge>
                </div>
              </div>

              {/* Errors */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-500" />
                  <span className="text-sm font-medium">Errors</span>
                </div>
                <div className="flex items-center gap-2">
                  {getTrendIcon(metrics.errors, previousMetrics?.errors)}
                  <Badge 
                    className={`text-xs ${metrics.errors > 0 ? 'bg-red-500' : 'bg-green-500'}`}
                  >
                    {metrics.errors}
                  </Badge>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="details" className="space-y-3 mt-3">
              <div className="text-xs text-gray-600 space-y-2">
                <div>
                  <strong>Render Time:</strong> {metrics.renderTime}ms
                </div>
                <div>
                  <strong>Load Time:</strong> {metrics.loadTime}ms
                </div>
                <div>
                  <strong>Memory Usage:</strong> {metrics.memoryUsage?.toFixed(2)}MB
                </div>
                <div>
                  <strong>Network Requests:</strong> {metrics.networkRequests}
                </div>
                <div>
                  <strong>Errors:</strong> {metrics.errors}
                </div>
                <div className="pt-2 border-t">
                  <strong>Last Updated:</strong> {new Date().toLocaleTimeString()}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default PerformanceDashboard;
