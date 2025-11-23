import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { pushNotificationService, PushNotificationPreferences } from '@/services/pushNotificationService';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export const usePushNotifications = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [preferences, setPreferences] = useState<PushNotificationPreferences | null>(null);

  // Check support and permission on mount
  useEffect(() => {
    const checkSupport = async () => {
      const supported = pushNotificationService.isSupported();
      setIsSupported(supported);

      if (supported) {
        const currentPermission = await pushNotificationService.getPermissionStatus();
        setPermission(currentPermission);
      }
    };

    checkSupport();
  }, []);

  // DISABLED: OneSignal initialization - will be replaced with Web Push API
  // Initialize OneSignal when user is logged in (only once)
  // useEffect(() => {
  //   let isMounted = true;
  //   let initAttempted = false;

  //   const initOneSignal = async () => {
  //     // Prevent multiple initialization attempts
  //     if (initAttempted || !user || !isSupported) return;
  //     initAttempted = true;

  //     const appId = import.meta.env.VITE_ONESIGNAL_APP_ID;
  //     if (!appId) {
  //       console.warn('OneSignal App ID not configured');
  //       return;
  //     }

  //     try {
  //       const initialized = await pushNotificationService.initialize(appId);
  //       if (!initialized || !isMounted) return;
        
  //       // Wait for OneSignal to fully initialize
  //       await new Promise(resolve => setTimeout(resolve, 1500));
        
  //       // Check current permission status
  //       const currentPermission = await pushNotificationService.getPermissionStatus();
  //       if (!isMounted) return;
  //       setPermission(currentPermission);
        
  //       // If permission is granted, check if user is subscribed
  //       if (currentPermission === 'granted') {
  //         // Wait for player ID to be available
  //         await new Promise(resolve => setTimeout(resolve, 1000));
          
  //         const playerId = await pushNotificationService.getPlayerId();
  //         if (playerId && isMounted) {
  //           // Check if subscription exists in database
  //           const { data: subscription, error } = await supabase
  //             .from('push_subscriptions')
  //             .select('*')
  //             .eq('player_id', playerId)
  //             .eq('is_active', true)
  //             .maybeSingle();
            
  //           if (error) {
  //             console.error('Error checking subscription:', error);
  //           } else if (subscription && isMounted) {
  //             setIsSubscribed(true);
  //             setPreferences(subscription.preferences);
  //           } else if (isMounted) {
  //             // Permission granted but no subscription - try to subscribe
  //             console.log('Permission granted but no subscription found, creating subscription...');
  //             const newSubscription = await pushNotificationService.subscribe(user.id);
  //             if (newSubscription && isMounted) {
  //               setIsSubscribed(true);
  //               setPreferences(newSubscription.preferences);
  //             }
  //           }
  //         }
  //       }
  //     } catch (error) {
  //       console.error('Failed to initialize push notifications:', error);
  //       initAttempted = false; // Allow retry on error
  //     }
  //   };

  //   // Only initialize once when user and support are available
  //   if (user && isSupported) {
  //     initOneSignal();
  //   }

  //   return () => {
  //     isMounted = false;
  //   };
  // }, [user, isSupported]);

  /**
   * Request notification permission and subscribe
   */
  const subscribe = useCallback(async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to enable push notifications",
        variant: "destructive",
      });
      return false;
    }

    setIsLoading(true);
    try {
      // Request permission - this will show the browser's native popup
      const newPermission = await pushNotificationService.requestPermission();
      setPermission(newPermission);

      if (newPermission === 'denied') {
        toast({
          title: "Notifications Blocked",
          description: "Please enable notifications in your browser settings and refresh the page",
          variant: "destructive",
        });
        setIsLoading(false);
        return false;
      }

      if (newPermission !== 'granted') {
        // User dismissed the prompt
        setIsLoading(false);
        return false;
      }

      // Subscribe
      const subscription = await pushNotificationService.subscribe(user.id);
      
      if (subscription) {
        setIsSubscribed(true);
        setPreferences(subscription.preferences);
        toast({
          title: "Notifications Enabled",
          description: "You'll now receive push notifications for your orders",
        });
        setIsLoading(false);
        return true;
      } else {
        throw new Error('Failed to create subscription');
      }
    } catch (error) {
      console.error('Error subscribing to push notifications:', error);
      toast({
        title: "Subscription Failed",
        description: "Failed to enable push notifications. Please try again.",
        variant: "destructive",
      });
      setIsLoading(false);
      return false;
    }
  }, [user, toast]);

  /**
   * Unsubscribe from push notifications
   */
  const unsubscribe = useCallback(async () => {
    setIsLoading(true);
    try {
      const success = await pushNotificationService.unsubscribe();
      
      if (success) {
        setIsSubscribed(false);
        toast({
          title: "Notifications Disabled",
          description: "You've been unsubscribed from push notifications",
        });
        setIsLoading(false);
        return true;
      } else {
        throw new Error('Failed to unsubscribe');
      }
    } catch (error) {
      console.error('Error unsubscribing from push notifications:', error);
      toast({
        title: "Unsubscribe Failed",
        description: "Failed to disable push notifications. Please try again.",
        variant: "destructive",
      });
      setIsLoading(false);
      return false;
    }
  }, [toast]);

  /**
   * Update notification preferences
   */
  const updatePreferences = useCallback(async (
    newPreferences: Partial<PushNotificationPreferences>
  ) => {
    setIsLoading(true);
    try {
      const success = await pushNotificationService.updatePreferences(newPreferences);
      
      if (success) {
        // Reload preferences
        const updated = await pushNotificationService.getPreferences();
        if (updated) {
          setPreferences(updated);
        }
        toast({
          title: "Preferences Updated",
          description: "Your notification preferences have been saved",
        });
        setIsLoading(false);
        return true;
      } else {
        throw new Error('Failed to update preferences');
      }
    } catch (error) {
      console.error('Error updating preferences:', error);
      toast({
        title: "Update Failed",
        description: "Failed to update preferences. Please try again.",
        variant: "destructive",
      });
      setIsLoading(false);
      return false;
    }
  }, [toast]);

  return {
    isSupported,
    permission,
    isSubscribed,
    isLoading,
    preferences,
    subscribe,
    unsubscribe,
    updatePreferences,
  };
};

