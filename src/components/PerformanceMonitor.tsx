import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Activity, 
  Zap, 
  Clock, 
  Database, 
  Wifi, 
  AlertTriangle,
  CheckCircle,
  X
} from 'lucide-react';

interface PerformanceMetrics {
  fcp: number; // First Contentful Paint
  lcp: number; // Largest Contentful Paint
  fid: number; // First Input Delay
  cls: number; // Cumulative Layout Shift
  ttfb: number; // Time to First Byte
  bundleSize: number;
  imageCount: number;
  queryCount: number;
  renderTime: number;
}

interface PerformanceMonitorProps {
  showDetails?: boolean;
  onClose?: () => void;
}

export const PerformanceMonitor: React.FC<PerformanceMonitorProps> = ({
  showDetails = false,
  onClose
}) => {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [isVisible, setIsVisible] = useState(showDetails);

  useEffect(() => {
    if (!isVisible) return;

    const collectMetrics = () => {
      const newMetrics: PerformanceMetrics = {
        fcp: 0,
        lcp: 0,
        fid: 0,
        cls: 0,
        ttfb: 0,
        bundleSize: 0,
        imageCount: 0,
        queryCount: 0,
        renderTime: 0,
      };

      // Get Web Vitals
      if ('performance' in window) {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        newMetrics.ttfb = navigation.responseStart - navigation.requestStart;

        // Get FCP
        const fcpEntry = performance.getEntriesByName('first-contentful-paint')[0];
        if (fcpEntry) {
          newMetrics.fcp = fcpEntry.startTime;
        }

        // Get LCP
        const lcpEntries = performance.getEntriesByType('largest-contentful-paint');
        if (lcpEntries.length > 0) {
          newMetrics.lcp = lcpEntries[lcpEntries.length - 1].startTime;
        }
      }

      // Count images
      newMetrics.imageCount = document.querySelectorAll('img').length;

      // Estimate bundle size (rough calculation)
      const scripts = document.querySelectorAll('script[src]');
      let totalSize = 0;
      scripts.forEach(script => {
        const src = script.getAttribute('src');
        if (src && !src.includes('node_modules')) {
          totalSize += 50; // Rough estimate
        }
      });
      newMetrics.bundleSize = totalSize;

      // Count network requests
      const resources = performance.getEntriesByType('resource');
      newMetrics.queryCount = resources.filter(r => 
        r.name.includes('supabase') || r.name.includes('api')
      ).length;

      setMetrics(newMetrics);
    };

    // Collect metrics after page load
    if (document.readyState === 'complete') {
      collectMetrics();
    } else {
      window.addEventListener('load', collectMetrics);
    }

    return () => {
      window.removeEventListener('load', collectMetrics);
    };
  }, [isVisible]);

  const getPerformanceScore = (metric: number, thresholds: [number, number]) => {
    if (metric <= thresholds[0]) return { score: 'Good', color: 'green' };
    if (metric <= thresholds[1]) return { score: 'Needs Improvement', color: 'yellow' };
    return { score: 'Poor', color: 'red' };
  };

  const getFCPScore = (fcp: number) => getPerformanceScore(fcp, [1800, 3000]);
  const getLCPScore = (lcp: number) => getPerformanceScore(lcp, [2500, 4000]);
  const getTTFBScore = (ttfb: number) => getPerformanceScore(ttfb, [800, 1800]);

  if (!isVisible || !metrics) return null;

  return (
    <Card className="fixed bottom-4 right-4 w-80 z-50 bg-white/95 backdrop-blur-sm border shadow-lg">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <Activity className="w-4 h-4" />
            Performance Monitor
          </CardTitle>
          {onClose && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-6 w-6 p-0"
            >
              <X className="w-3 h-3" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Core Web Vitals */}
        <div className="space-y-2">
          <h4 className="text-xs font-semibold text-gray-600">Core Web Vitals</h4>
          
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center justify-between">
              <span>FCP:</span>
              <Badge 
                variant={getFCPScore(metrics.fcp).color === 'green' ? 'default' : 'destructive'}
                className="text-xs"
              >
                {Math.round(metrics.fcp)}ms
              </Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <span>LCP:</span>
              <Badge 
                variant={getLCPScore(metrics.lcp).color === 'green' ? 'default' : 'destructive'}
                className="text-xs"
              >
                {Math.round(metrics.lcp)}ms
              </Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <span>TTFB:</span>
              <Badge 
                variant={getTTFBScore(metrics.ttfb).color === 'green' ? 'default' : 'destructive'}
                className="text-xs"
              >
                {Math.round(metrics.ttfb)}ms
              </Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <span>Images:</span>
              <Badge variant="outline" className="text-xs">
                {metrics.imageCount}
              </Badge>
            </div>
          </div>
        </div>

        {/* Resource Analysis */}
        <div className="space-y-2">
          <h4 className="text-xs font-semibold text-gray-600">Resources</h4>
          
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center justify-between">
              <span>Queries:</span>
              <Badge variant="outline" className="text-xs">
                {metrics.queryCount}
              </Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <span>Bundle:</span>
              <Badge variant="outline" className="text-xs">
                ~{metrics.bundleSize}KB
              </Badge>
            </div>
          </div>
        </div>

        {/* Performance Tips */}
        <div className="space-y-1">
          <h4 className="text-xs font-semibold text-gray-600">Optimization Tips</h4>
          <div className="text-xs text-gray-500 space-y-1">
            {metrics.fcp > 1800 && (
              <div className="flex items-center gap-1">
                <AlertTriangle className="w-3 h-3 text-yellow-500" />
                <span>Optimize FCP - reduce render blocking</span>
              </div>
            )}
            {metrics.lcp > 2500 && (
              <div className="flex items-center gap-1">
                <AlertTriangle className="w-3 h-3 text-yellow-500" />
                <span>Optimize LCP - compress images</span>
              </div>
            )}
            {metrics.imageCount > 20 && (
              <div className="flex items-center gap-1">
                <AlertTriangle className="w-3 h-3 text-yellow-500" />
                <span>Too many images - implement lazy loading</span>
              </div>
            )}
            {metrics.queryCount > 10 && (
              <div className="flex items-center gap-1">
                <AlertTriangle className="w-3 h-3 text-yellow-500" />
                <span>Too many queries - add caching</span>
              </div>
            )}
            {metrics.fcp <= 1800 && metrics.lcp <= 2500 && metrics.imageCount <= 20 && (
              <div className="flex items-center gap-1">
                <CheckCircle className="w-3 h-3 text-green-500" />
                <span>Performance looks good!</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Hook for performance monitoring
export const usePerformanceMonitor = () => {
  const [isEnabled, setIsEnabled] = useState(false);

  useEffect(() => {
    // Enable in development or when performance monitoring is requested
    const shouldEnable = import.meta.env.DEV || 
      localStorage.getItem('performance-monitor') === 'true';
    setIsEnabled(shouldEnable);
  }, []);

  const toggleMonitor = () => {
    const newState = !isEnabled;
    setIsEnabled(newState);
    localStorage.setItem('performance-monitor', newState.toString());
  };

  return { isEnabled, toggleMonitor };
};