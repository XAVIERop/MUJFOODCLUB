// =====================================================
// 🛡️ SECURITY PROVIDER COMPONENT
// =====================================================

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { securityMonitor, rateLimiter } from '@/utils/validation';
import { supabase } from '@/integrations/supabase/client';

// =====================================================
// TYPES
// =====================================================

interface SecurityContextType {
  isSecure: boolean;
  securityScore: number;
  recentSecurityEvents: Array<{
    timestamp: Date;
    event: string;
    details: any;
  }>;
  logSecurityEvent: (event: string, details?: any) => void;
  checkRateLimit: (action: string) => boolean;
  validateAndLogAction: (action: string, data: any) => boolean;
}

// =====================================================
// CONTEXT
// =====================================================

const SecurityContext = createContext<SecurityContextType | null>(null);

// =====================================================
// SECURITY PROVIDER COMPONENT
// =====================================================

export const SecurityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [isSecure, setIsSecure] = useState(true);
  const [securityScore, setSecurityScore] = useState(100);
  const [recentSecurityEvents, setRecentSecurityEvents] = useState<Array<{
    timestamp: Date;
    event: string;
    details: any;
  }>>([]);

  // =====================================================
  // SECURITY MONITORING
  // =====================================================

  useEffect(() => {
    if (!user) return;

    // Monitor user activity
    const monitorActivity = () => {
      securityMonitor.detectAnomalies(user.id, 'page_visit', { page: window.location.pathname });
    };

    // Set up activity monitoring
    const interval = setInterval(monitorActivity, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, [user]);

  // =====================================================
  // SECURITY FUNCTIONS
  // =====================================================

  const logSecurityEvent = (event: string, details: any = {}) => {
    const eventData = {
      ...details,
      userId: user?.id,
      userEmail: user?.email,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    };

    securityMonitor.logSecurityEvent(event, eventData);
    
    // Update local state
    setRecentSecurityEvents(prev => [
      ...prev.slice(-9), // Keep only last 10 events
      {
        timestamp: new Date(),
        event,
        details: eventData
      }
    ]);

    // Update security score
    updateSecurityScore(event);
  };

  const updateSecurityScore = (event: string) => {
    setSecurityScore(prev => {
      let newScore = prev;
      
      switch (event) {
        case 'SUSPICIOUS_INPUT':
          newScore -= 10;
          break;
        case 'EXCESSIVE_ACTIVITY':
          newScore -= 15;
          break;
        case 'RATE_LIMIT_EXCEEDED':
          newScore -= 5;
          break;
        case 'VALIDATION_FAILED':
          newScore -= 3;
          break;
        default:
          // Gradual recovery
          newScore = Math.min(100, newScore + 1);
      }
      
      return Math.max(0, newScore);
    });
  };

  const checkRateLimit = (action: string): boolean => {
    const identifier = user?.id || 'anonymous';
    const isAllowed = rateLimiter.isAllowed(identifier);
    
    if (!isAllowed) {
      logSecurityEvent('RATE_LIMIT_EXCEEDED', { action, identifier });
    }
    
    return isAllowed;
  };

  const validateAndLogAction = (action: string, data: any): boolean => {
    // Check rate limit first
    if (!checkRateLimit(action)) {
      return false;
    }

    // Log the action
    logSecurityEvent('USER_ACTION', { action, data });

    // Detect anomalies
    if (user) {
      securityMonitor.detectAnomalies(user.id, action, data);
    }

    return true;
  };

  // =====================================================
  // SECURITY STATUS CHECK
  // =====================================================

  useEffect(() => {
    const checkSecurityStatus = async () => {
      try {
        // Check if user has suspicious activity
        const events = securityMonitor.getRecentEvents(60);
        const suspiciousEvents = events.filter(e => 
          e.event.includes('SUSPICIOUS') || e.event.includes('EXCESSIVE')
        );

        if (suspiciousEvents.length > 5) {
          setIsSecure(false);
          logSecurityEvent('SECURITY_ALERT', {
            reason: 'Multiple suspicious events detected',
            eventCount: suspiciousEvents.length
          });
        } else {
          setIsSecure(true);
        }
      } catch (error) {
        console.error('Security status check failed:', error);
      }
    };

    checkSecurityStatus();
    const interval = setInterval(checkSecurityStatus, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [user]);

  // =====================================================
  // CONTEXT VALUE
  // =====================================================

  const contextValue: SecurityContextType = {
    isSecure,
    securityScore,
    recentSecurityEvents,
    logSecurityEvent,
    checkRateLimit,
    validateAndLogAction
  };

  return (
    <SecurityContext.Provider value={contextValue}>
      {children}
    </SecurityContext.Provider>
  );
};

// =====================================================
// HOOK
// =====================================================

export const useSecurity = (): SecurityContextType => {
  const context = useContext(SecurityContext);
  if (!context) {
    throw new Error('useSecurity must be used within a SecurityProvider');
  }
  return context;
};

// =====================================================
// SECURITY INDICATOR COMPONENT
// =====================================================

export const SecurityIndicator: React.FC = () => {
  const { securityScore, isSecure } = useSecurity();

  const getSecurityColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getSecurityIcon = (score: number) => {
    if (score >= 90) return '🛡️';
    if (score >= 70) return '⚠️';
    return '🚨';
  };

  if (import.meta.env.PROD) return null; // Hide in production

  return (
    <div className="fixed bottom-4 right-4 bg-white border rounded-lg shadow-lg p-3 z-50">
      <div className="flex items-center gap-2">
        <span className="text-lg">{getSecurityIcon(securityScore)}</span>
        <div>
          <div className={`text-sm font-medium ${getSecurityColor(securityScore)}`}>
            Security Score: {securityScore}%
          </div>
          <div className="text-xs text-gray-500">
            Status: {isSecure ? 'Secure' : 'Alert'}
          </div>
        </div>
      </div>
    </div>
  );
};
