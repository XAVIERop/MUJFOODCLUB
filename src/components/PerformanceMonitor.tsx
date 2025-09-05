import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { usePerformance } from '@/hooks/usePerformance';

export const PerformanceMonitor = () => {
  const metrics = usePerformance();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Only show in development
    if (process.env.NODE_ENV === 'development') {
      setIsVisible(true);
    }
  }, []);

  if (!isVisible) return null;

  const getPerformanceColor = (value: number, thresholds: { good: number; warning: number }) => {
    if (value <= thresholds.good) return 'bg-green-500';
    if (value <= thresholds.warning) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm">
      <Card className="bg-black/90 text-white border-gray-700">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            🚀 Performance Monitor
            <Badge variant="outline" className="text-xs">
              DEV
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-xs">
          <div className="flex justify-between items-center">
            <span>Load Time:</span>
            <div className="flex items-center gap-2">
              <div 
                className={`w-2 h-2 rounded-full ${getPerformanceColor(metrics.loadTime, { good: 2000, warning: 4000 })}`}
              />
              <span>{metrics.loadTime}ms</span>
            </div>
          </div>
          
          <div className="flex justify-between items-center">
            <span>Memory:</span>
            <div className="flex items-center gap-2">
              <div 
                className={`w-2 h-2 rounded-full ${getPerformanceColor(metrics.memoryUsage, { good: 50, warning: 100 })}`}
              />
              <span>{metrics.memoryUsage.toFixed(1)}MB</span>
            </div>
          </div>
          
          <div className="flex justify-between items-center">
            <span>Connection:</span>
            <Badge 
              variant={metrics.isSlowConnection ? "destructive" : "default"}
              className="text-xs"
            >
              {metrics.isSlowConnection ? 'Slow' : 'Fast'}
            </Badge>
          </div>
          
          <div className="flex justify-between items-center">
            <span>Render Time:</span>
            <div className="flex items-center gap-2">
              <div 
                className={`w-2 h-2 rounded-full ${getPerformanceColor(metrics.renderTime, { good: 16, warning: 32 })}`}
              />
              <span>{metrics.renderTime.toFixed(1)}ms</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
