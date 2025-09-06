import { useEffect, useRef } from 'react';

interface PerformanceMetrics {
  loadTime: number;
  renderTime: number;
  memoryUsage?: number;
  networkRequests: number;
  errors: number;
}

interface PerformanceMonitorOptions {
  enabled?: boolean;
  logToConsole?: boolean;
  reportInterval?: number;
  onMetricsUpdate?: (metrics: PerformanceMetrics) => void;
}

export const usePerformanceMonitor = (options: PerformanceMonitorOptions = {}) => {
  const {
    enabled = true,
    logToConsole = process.env.NODE_ENV === 'development',
    reportInterval = 30000, // 30 seconds
    onMetricsUpdate
  } = options;

  const metricsRef = useRef<PerformanceMetrics>({
    loadTime: 0,
    renderTime: 0,
    memoryUsage: 0,
    networkRequests: 0,
    errors: 0
  });

  const startTimeRef = useRef<number>(Date.now());
  const renderStartRef = useRef<number>(0);

  useEffect(() => {
    if (!enabled) return;

    // Measure initial load time
    const measureLoadTime = () => {
      if (performance.timing) {
        const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
        metricsRef.current.loadTime = loadTime;
      } else {
        // Fallback for browsers without performance.timing
        metricsRef.current.loadTime = Date.now() - startTimeRef.current;
      }
    };

    // Measure memory usage (if available)
    const measureMemoryUsage = () => {
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        metricsRef.current.memoryUsage = memory.usedJSHeapSize / 1024 / 1024; // MB
      }
    };

    // Monitor network requests
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      metricsRef.current.networkRequests++;
      try {
        const response = await originalFetch(...args);
        return response;
      } catch (error) {
        metricsRef.current.errors++;
        throw error;
      }
    };

    // Monitor errors
    const handleError = (event: ErrorEvent) => {
      metricsRef.current.errors++;
      if (logToConsole) {
        console.error('Performance Monitor - Error detected:', event.error);
      }
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      metricsRef.current.errors++;
      if (logToConsole) {
        console.error('Performance Monitor - Unhandled promise rejection:', event.reason);
      }
    };

    // Set up event listeners
    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    window.addEventListener('load', measureLoadTime);

    // Initial measurements
    measureMemoryUsage();

    // Report metrics periodically
    const intervalId = setInterval(() => {
      measureMemoryUsage();
      
      if (logToConsole) {
        console.log('📊 Performance Metrics:', {
          ...metricsRef.current,
          timestamp: new Date().toISOString()
        });
      }

      if (onMetricsUpdate) {
        onMetricsUpdate({ ...metricsRef.current });
      }
    }, reportInterval);

    // Cleanup
    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      window.removeEventListener('load', measureLoadTime);
      window.fetch = originalFetch;
      clearInterval(intervalId);
    };
  }, [enabled, logToConsole, reportInterval, onMetricsUpdate]);

  // Function to measure render time
  const measureRender = (componentName: string) => {
    if (!enabled) return () => {};

    return () => {
      const renderTime = Date.now() - renderStartRef.current;
      metricsRef.current.renderTime = renderTime;
      
      if (logToConsole) {
        console.log(`🎨 ${componentName} render time: ${renderTime}ms`);
      }
    };
  };

  // Function to start render measurement
  const startRenderMeasure = () => {
    renderStartRef.current = Date.now();
  };

  // Function to get current metrics
  const getMetrics = (): PerformanceMetrics => {
    return { ...metricsRef.current };
  };

  // Function to reset metrics
  const resetMetrics = () => {
    metricsRef.current = {
      loadTime: 0,
      renderTime: 0,
      memoryUsage: 0,
      networkRequests: 0,
      errors: 0
    };
    startTimeRef.current = Date.now();
  };

  return {
    measureRender,
    startRenderMeasure,
    getMetrics,
    resetMetrics
  };
};

// Hook for measuring component render performance
export const useRenderPerformance = (componentName: string) => {
  const { measureRender, startRenderMeasure } = usePerformanceMonitor();

  useEffect(() => {
    startRenderMeasure();
    const endMeasure = measureRender(componentName);
    
    return endMeasure;
  }, [componentName, measureRender, startRenderMeasure]);
};

export default usePerformanceMonitor;
