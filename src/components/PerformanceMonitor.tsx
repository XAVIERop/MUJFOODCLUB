import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { usePerformance } from '@/hooks/usePerformance';

export const PerformanceMonitor = () => {
  const metrics = usePerformance();
  const [isVisible, setIsVisible] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  useEffect(() => {
    // Only show in development
    if (process.env.NODE_ENV === 'development') {
      setIsVisible(true);
      // Set initial position to top-left to avoid blocking checkout buttons
      setPosition({ x: 20, y: 20 });
    }
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;
    
    const newX = e.clientX - dragStart.x;
    const newY = e.clientY - dragStart.y;
    
    // Keep within viewport bounds
    const maxX = window.innerWidth - 300; // Card width
    const maxY = window.innerHeight - 200; // Card height
    
    setPosition({
      x: Math.max(0, Math.min(newX, maxX)),
      y: Math.max(0, Math.min(newY, maxY))
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, dragStart]);

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
    <div 
      className="fixed z-50 max-w-sm select-none"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        cursor: isDragging ? 'grabbing' : 'grab'
      }}
    >
      <Card className="bg-black/90 text-white border-gray-700 shadow-lg">
        <CardHeader 
          className="pb-2 cursor-grab active:cursor-grabbing"
          onMouseDown={handleMouseDown}
        >
          <CardTitle className="text-sm flex items-center justify-between">
            <div className="flex items-center gap-2">
              🚀 Performance Monitor
              <Badge variant="outline" className="text-xs">
                DEV
              </Badge>
            </div>
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="text-gray-400 hover:text-white transition-colors"
              title={isMinimized ? "Expand" : "Minimize"}
            >
              {isMinimized ? '▲' : '▼'}
            </button>
          </CardTitle>
        </CardHeader>
        
        {!isMinimized && (
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
        )}
      </Card>
    </div>
  );
};
