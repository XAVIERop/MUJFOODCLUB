// Error Tracking and Monitoring Utilities
// Production-ready error handling and logging

import React from 'react';

interface ErrorContext {
  userId?: string;
  sessionId?: string;
  userAgent?: string;
  url?: string;
  timestamp?: string;
  component?: string;
  action?: string;
  metadata?: Record<string, any>;
}

interface PerformanceMetrics {
  loadTime: number;
  renderTime: number;
  memoryUsage?: number;
  networkRequests: number;
  errors: number;
  timestamp: string;
}

class ErrorTracker {
  private isProduction: boolean;
  private sentryDsn: string | null;
  private errorQueue: Array<{ error: Error; context: ErrorContext }> = [];
  private performanceMetrics: PerformanceMetrics[] = [];

  constructor() {
    this.isProduction = import.meta.env.VITE_APP_ENV === 'production';
    this.sentryDsn = import.meta.env.VITE_SENTRY_DSN || null;
    
    this.initializeErrorTracking();
    this.initializePerformanceMonitoring();
  }

  private initializeErrorTracking() {
    // Global error handler
    window.addEventListener('error', (event) => {
      this.captureError(event.error, {
        component: 'Global',
        action: 'Unhandled Error',
        url: window.location.href,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString(),
      });
    });

    // Unhandled promise rejection handler
    window.addEventListener('unhandledrejection', (event) => {
      this.captureError(new Error(event.reason), {
        component: 'Global',
        action: 'Unhandled Promise Rejection',
        url: window.location.href,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString(),
      });
    });
  }

  private initializePerformanceMonitoring() {
    // Monitor performance metrics
    if ('performance' in window) {
      setInterval(() => {
        this.collectPerformanceMetrics();
      }, 30000); // Every 30 seconds
    }
  }

  public captureError(error: Error, context: ErrorContext = {}) {
    const errorData = {
      error,
      context: {
        ...context,
        timestamp: context.timestamp || new Date().toISOString(),
        url: context.url || window.location.href,
        userAgent: context.userAgent || navigator.userAgent,
      },
    };

    // Add to queue
    this.errorQueue.push(errorData);

    // Log to console in development
    if (!this.isProduction) {
      console.error('Error captured:', error, context);
    }

    // Send to external service in production
    if (this.isProduction) {
      this.sendErrorToService(errorData);
    }

    // Keep only last 100 errors in memory
    if (this.errorQueue.length > 100) {
      this.errorQueue = this.errorQueue.slice(-100);
    }
  }

  public capturePerformanceMetrics(metrics: Partial<PerformanceMetrics>) {
    const fullMetrics: PerformanceMetrics = {
      loadTime: 0,
      renderTime: 0,
      networkRequests: 0,
      errors: 0,
      timestamp: new Date().toISOString(),
      ...metrics,
    };

    this.performanceMetrics.push(fullMetrics);

    // Keep only last 1000 metrics
    if (this.performanceMetrics.length > 1000) {
      this.performanceMetrics = this.performanceMetrics.slice(-1000);
    }

    // Send to external service in production
    if (this.isProduction) {
      this.sendMetricsToService(fullMetrics);
    }
  }

  private collectPerformanceMetrics() {
    if (!('performance' in window)) return;

    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    const memory = (performance as any).memory;

    const metrics: Partial<PerformanceMetrics> = {
      loadTime: navigation ? navigation.loadEventEnd - navigation.navigationStart : 0,
      memoryUsage: memory ? memory.usedJSHeapSize / 1024 / 1024 : undefined, // MB
      networkRequests: performance.getEntriesByType('resource').length,
      errors: this.errorQueue.length,
    };

    this.capturePerformanceMetrics(metrics);
  }

  private async sendErrorToService(errorData: { error: Error; context: ErrorContext }) {
    try {
      // In production, you would send to Sentry, LogRocket, or similar service
      if (this.sentryDsn) {
        // Sentry integration would go here
        console.log('Sending error to Sentry:', errorData);
      }

      // Fallback: send to your own logging endpoint
      await fetch('/api/logs/error', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: errorData.error.message,
          stack: errorData.error.stack,
          context: errorData.context,
        }),
      });
    } catch (sendError) {
      console.error('Failed to send error to service:', sendError);
    }
  }

  private async sendMetricsToService(metrics: PerformanceMetrics) {
    try {
      // Send to analytics service
      await fetch('/api/analytics/performance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(metrics),
      });
    } catch (error) {
      console.error('Failed to send metrics to service:', error);
    }
  }

  public getErrorSummary() {
    const errorCounts = this.errorQueue.reduce((acc, { error, context }) => {
      const key = `${context.component || 'Unknown'}:${error.message}`;
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalErrors: this.errorQueue.length,
      errorCounts,
      recentErrors: this.errorQueue.slice(-10),
    };
  }

  public getPerformanceSummary() {
    if (this.performanceMetrics.length === 0) {
      return null;
    }

    const latest = this.performanceMetrics[this.performanceMetrics.length - 1];
    const avgLoadTime = this.performanceMetrics.reduce((sum, m) => sum + m.loadTime, 0) / this.performanceMetrics.length;
    const avgMemoryUsage = this.performanceMetrics
      .filter(m => m.memoryUsage)
      .reduce((sum, m) => sum + (m.memoryUsage || 0), 0) / this.performanceMetrics.filter(m => m.memoryUsage).length;

    return {
      latest,
      averageLoadTime: avgLoadTime,
      averageMemoryUsage: avgMemoryUsage,
      totalMetrics: this.performanceMetrics.length,
    };
  }

  public clearData() {
    this.errorQueue = [];
    this.performanceMetrics = [];
  }
}

// Create singleton instance
export const errorTracker = new ErrorTracker();

// React Error Boundary integration
export const withErrorTracking = (Component: React.ComponentType<Record<string, unknown>>) => {
  return class extends React.Component {
    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
      errorTracker.captureError(error, {
        component: Component.name || 'Unknown',
        action: 'Component Error',
        metadata: {
          componentStack: errorInfo.componentStack,
        },
      });
    }

    render() {
      return <Component {...this.props} />;
    }
  };
};

// Hook for error tracking in functional components
export const useErrorTracking = () => {
  const captureError = React.useCallback((error: Error, context?: ErrorContext) => {
    errorTracker.captureError(error, context);
  }, []);

  const capturePerformanceMetrics = React.useCallback((metrics: Partial<PerformanceMetrics>) => {
    errorTracker.capturePerformanceMetrics(metrics);
  }, []);

  return {
    captureError,
    capturePerformanceMetrics,
    getErrorSummary: () => errorTracker.getErrorSummary(),
    getPerformanceSummary: () => errorTracker.getPerformanceSummary(),
  };
};

// Utility functions for common error scenarios
export const trackApiError = (error: any, endpoint: string, method: string) => {
  errorTracker.captureError(
    error instanceof Error ? error : new Error(String(error)),
    {
      component: 'API',
      action: `${method} ${endpoint}`,
      metadata: {
        endpoint,
        method,
        status: error.status,
        response: error.response,
      },
    }
  );
};

export const trackUserAction = (action: string, component: string, metadata?: Record<string, any>) => {
  // Track user actions for analytics
  if (import.meta.env.VITE_ENABLE_ANALYTICS === 'true') {
    errorTracker.capturePerformanceMetrics({
      metadata: {
        action,
        component,
        ...metadata,
      },
    });
  }
};

export const trackPageView = (page: string) => {
  trackUserAction('page_view', 'Router', { page });
};

export const trackOrderEvent = (event: string, orderId: string, metadata?: Record<string, any>) => {
  trackUserAction(event, 'Order', { orderId, ...metadata });
};

export const trackCafeEvent = (event: string, cafeId: string, metadata?: Record<string, any>) => {
  trackUserAction(event, 'Cafe', { cafeId, ...metadata });
};

export default errorTracker;
