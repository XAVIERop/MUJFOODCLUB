import { useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface SubscriptionConfig {
  table: string;
  event: 'INSERT' | 'UPDATE' | 'DELETE' | '*';
  filter?: string;
  callback: (payload: any) => void;
}

interface SubscriptionManager {
  subscribe: (key: string, config: SubscriptionConfig) => void;
  unsubscribe: (key: string) => void;
  unsubscribeAll: () => void;
  getActiveSubscriptions: () => string[];
}

// Global subscription manager instance
let globalSubscriptionManager: SubscriptionManager | null = null;

// Create the subscription manager
const createSubscriptionManager = (): SubscriptionManager => {
  const subscriptions = new Map<string, any>();
  
  const subscribe = (key: string, config: SubscriptionConfig) => {
    // Unsubscribe existing subscription with same key
    if (subscriptions.has(key)) {
      console.log(`🔄 Replacing existing subscription: ${key}`);
      subscriptions.get(key).unsubscribe();
    }
    
    console.log(`📡 Creating new subscription: ${key}`);
    
    const channel = supabase
      .channel(key)
      .on('postgres_changes', 
        { 
          event: config.event, 
          schema: 'public', 
          table: config.table,
          filter: config.filter
        }, 
        config.callback
      )
      .subscribe();
    
    subscriptions.set(key, channel);
  };
  
  const unsubscribe = (key: string) => {
    if (subscriptions.has(key)) {
      console.log(`🔌 Unsubscribing: ${key}`);
      subscriptions.get(key).unsubscribe();
      subscriptions.delete(key);
    }
  };
  
  const unsubscribeAll = () => {
    console.log(`🔌 Unsubscribing all ${subscriptions.size} subscriptions`);
    subscriptions.forEach((channel, key) => {
      console.log(`🔌 Unsubscribing: ${key}`);
      channel.unsubscribe();
    });
    subscriptions.clear();
  };
  
  const getActiveSubscriptions = () => {
    return Array.from(subscriptions.keys());
  };
  
  return {
    subscribe,
    unsubscribe,
    unsubscribeAll,
    getActiveSubscriptions
  };
};

// Get or create global subscription manager
const getSubscriptionManager = (): SubscriptionManager => {
  if (!globalSubscriptionManager) {
    globalSubscriptionManager = createSubscriptionManager();
  }
  return globalSubscriptionManager;
};

// Hook for managing subscriptions
export const useSubscriptionManager = () => {
  const manager = getSubscriptionManager();
  const componentSubscriptions = useRef<Set<string>>(new Set());
  
  // Cleanup component subscriptions on unmount
  useEffect(() => {
    return () => {
      console.log(`🧹 Cleaning up ${componentSubscriptions.current.size} component subscriptions`);
      componentSubscriptions.current.forEach(key => {
        manager.unsubscribe(key);
      });
      componentSubscriptions.current.clear();
    };
  }, [manager]);
  
  const subscribe = useCallback((key: string, config: SubscriptionConfig) => {
    componentSubscriptions.current.add(key);
    manager.subscribe(key, config);
  }, [manager]);
  
  const unsubscribe = useCallback((key: string) => {
    componentSubscriptions.current.delete(key);
    manager.unsubscribe(key);
  }, [manager]);
  
  return {
    subscribe,
    unsubscribe,
    getActiveSubscriptions: manager.getActiveSubscriptions
  };
};

// Hook for specific subscription types
export const useOrderSubscriptions = (cafeId: string | null, onNewOrder?: (order: any) => void, onOrderUpdate?: (order: any) => void) => {
  const { subscribe, unsubscribe } = useSubscriptionManager();
  
  useEffect(() => {
    if (!cafeId) return;
    
    const orderKey = `orders-${cafeId}`;
    
    // Subscribe to new orders
    if (onNewOrder) {
      subscribe(`${orderKey}-insert`, {
        table: 'orders',
        event: 'INSERT',
        filter: `cafe_id=eq.${cafeId}`,
        callback: (payload) => {
          console.log('📦 New order received:', payload.new);
          onNewOrder(payload.new);
        }
      });
    }
    
    // Subscribe to order updates
    if (onOrderUpdate) {
      subscribe(`${orderKey}-update`, {
        table: 'orders',
        event: 'UPDATE',
        filter: `cafe_id=eq.${cafeId}`,
        callback: (payload) => {
          console.log('🔄 Order updated:', payload.new);
          onOrderUpdate(payload.new);
        }
      });
    }
    
    return () => {
      if (onNewOrder) unsubscribe(`${orderKey}-insert`);
      if (onOrderUpdate) unsubscribe(`${orderKey}-update`);
    };
  }, [cafeId, onNewOrder, onOrderUpdate, subscribe, unsubscribe]);
};

export const useNotificationSubscriptions = (userId: string | null, cafeId: string | null, onNewNotification?: (notification: any) => void) => {
  const { subscribe, unsubscribe } = useSubscriptionManager();
  
  useEffect(() => {
    if (!userId && !cafeId) return;
    
    const notificationKey = userId ? `notifications-user-${userId}` : `notifications-cafe-${cafeId}`;
    const filter = userId ? `user_id=eq.${userId}` : `cafe_id=eq.${cafeId}`;
    
    if (onNewNotification) {
      subscribe(notificationKey, {
        table: 'order_notifications',
        event: 'INSERT',
        filter,
        callback: (payload) => {
          try {
            console.log('🔔 New notification received:', payload.new);
            onNewNotification(payload.new);
          } catch (error) {
            console.error('Error handling notification:', error);
          }
        }
      });
    }
    
    return () => {
      unsubscribe(notificationKey);
    };
  }, [userId, cafeId, onNewNotification, subscribe, unsubscribe]);
};

export const useProfileSubscriptions = (userId: string | null, onProfileUpdate?: (profile: any) => void) => {
  const { subscribe, unsubscribe } = useSubscriptionManager();
  
  useEffect(() => {
    if (!userId) return;
    
    const profileKey = `profile-${userId}`;
    
    if (onProfileUpdate) {
      subscribe(profileKey, {
        table: 'profiles',
        event: 'UPDATE',
        filter: `id=eq.${userId}`,
        callback: (payload) => {
          console.log('👤 Profile updated:', payload.new);
          onProfileUpdate(payload.new);
        }
      });
    }
    
    return () => {
      unsubscribe(profileKey);
    };
  }, [userId, onProfileUpdate, subscribe, unsubscribe]);
};

// Debug hook to monitor active subscriptions
export const useSubscriptionDebugger = () => {
  const manager = getSubscriptionManager();
  
  useEffect(() => {
    const interval = setInterval(() => {
      const active = manager.getActiveSubscriptions();
      if (active.length > 0) {
        console.log(`📊 Active subscriptions (${active.length}):`, active);
      }
    }, 10000); // Log every 10 seconds
    
    return () => clearInterval(interval);
  }, [manager]);
  
  return manager.getActiveSubscriptions();
};

export default useSubscriptionManager;
