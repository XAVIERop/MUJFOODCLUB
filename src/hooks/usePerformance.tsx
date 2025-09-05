import { useEffect, useState, useCallback } from 'react';

// Hook for measuring and optimizing performance
export const usePerformance = () => {
  const [metrics, setMetrics] = useState({
    loadTime: 0,
    renderTime: 0,
    memoryUsage: 0,
    isSlowConnection: false
  });

  useEffect(() => {
    // Measure page load time
    const measureLoadTime = () => {
      if (performance.timing) {
        const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
        setMetrics(prev => ({ ...prev, loadTime }));
      }
    };

    // Measure memory usage (if available)
    const measureMemory = () => {
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        setMetrics(prev => ({ 
          ...prev, 
          memoryUsage: memory.usedJSHeapSize / 1024 / 1024 // MB
        }));
      }
    };

    // Detect slow connection
    const detectConnection = () => {
      if ('connection' in navigator) {
        const connection = (navigator as any).connection;
        const isSlow = connection.effectiveType === 'slow-2g' || 
                      connection.effectiveType === '2g' ||
                      connection.downlink < 1;
        setMetrics(prev => ({ ...prev, isSlowConnection: isSlow }));
      }
    };

    // Initial measurements
    measureLoadTime();
    measureMemory();
    detectConnection();

    // Set up performance observer
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry) => {
        if (entry.entryType === 'measure') {
          setMetrics(prev => ({ 
            ...prev, 
            renderTime: entry.duration 
          }));
        }
      });
    });

    observer.observe({ entryTypes: ['measure'] });

    return () => observer.disconnect();
  }, []);

  return metrics;
};

// Hook for debouncing expensive operations
export const useDebounce = <T,>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// Hook for throttling function calls
export const useThrottle = <T extends (...args: any[]) => any,>(
  callback: T,
  delay: number
): T => {
  const [lastCall, setLastCall] = useState(0);

  return useCallback(
    ((...args: Parameters<T>) => {
      const now = Date.now();
      if (now - lastCall >= delay) {
        setLastCall(now);
        return callback(...args);
      }
    }) as T,
    [callback, delay, lastCall]
  );
};

// Hook for lazy loading components
export const useLazyLoad = (threshold = 0.1) => {
  const [isVisible, setIsVisible] = useState(false);
  const [ref, setRef] = useState<HTMLElement | null>(null);

  useEffect(() => {
    if (!ref) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold }
    );

    observer.observe(ref);

    return () => observer.disconnect();
  }, [ref, threshold]);

  return [setRef, isVisible] as const;
};

// Hook for preloading resources
export const usePreload = () => {
  const [preloadedResources, setPreloadedResources] = useState<Set<string>>(new Set());

  const preloadImage = useCallback((src: string) => {
    if (preloadedResources.has(src)) return Promise.resolve();

    return new Promise<void>((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        setPreloadedResources(prev => new Set([...prev, src]));
        resolve();
      };
      img.onerror = reject;
      img.src = src;
    });
  }, [preloadedResources]);

  const preloadImages = useCallback(async (srcs: string[]) => {
    const promises = srcs.map(src => preloadImage(src));
    await Promise.allSettled(promises);
  }, [preloadImage]);

  return { preloadImage, preloadImages, preloadedResources };
};

// Hook for monitoring component render performance
export const useRenderPerformance = (componentName: string) => {
  useEffect(() => {
    const startTime = performance.now();
    
    return () => {
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      if (renderTime > 16) { // More than one frame (16ms)
        console.warn(`Slow render detected in ${componentName}: ${renderTime.toFixed(2)}ms`);
      }
    };
  }, [componentName]);
};

// Hook for optimizing list rendering
export const useVirtualization = <T,>(
  items: T[],
  itemHeight: number,
  containerHeight: number
) => {
  const [scrollTop, setScrollTop] = useState(0);

  const visibleStart = Math.floor(scrollTop / itemHeight);
  const visibleEnd = Math.min(
    visibleStart + Math.ceil(containerHeight / itemHeight) + 1,
    items.length
  );

  const visibleItems = items.slice(visibleStart, visibleEnd);
  const totalHeight = items.length * itemHeight;
  const offsetY = visibleStart * itemHeight;

  return {
    visibleItems,
    totalHeight,
    offsetY,
    setScrollTop
  };
};

// Hook for managing loading states efficiently
export const useLoadingStates = () => {
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});

  const setLoading = useCallback((key: string, loading: boolean) => {
    setLoadingStates(prev => ({
      ...prev,
      [key]: loading
    }));
  }, []);

  const isLoading = useCallback((key: string) => {
    return loadingStates[key] || false;
  }, [loadingStates]);

  const clearLoading = useCallback((key: string) => {
    setLoadingStates(prev => {
      const newStates = { ...prev };
      delete newStates[key];
      return newStates;
    });
  }, []);

  return { setLoading, isLoading, clearLoading };
};
