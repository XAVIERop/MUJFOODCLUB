import { supabase } from '@/integrations/supabase/client';
import OneSignal from 'react-onesignal';

export interface PushNotificationPreferences {
  order_received: boolean;
  order_confirmed: boolean;
  order_preparing: boolean;
  order_on_the_way: boolean;
  order_completed: boolean;
  order_cancelled: boolean;
  new_order_for_cafe: boolean;
}

export interface PushSubscription {
  id: string;
  player_id: string;
  device_type?: string;
  browser?: string;
  preferences: PushNotificationPreferences;
  is_active: boolean;
}

class PushNotificationService {
  private static instance: PushNotificationService;
  private isInitialized = false;
  private playerId: string | null = null;

  private constructor() {}

  static getInstance(): PushNotificationService {
    if (!PushNotificationService.instance) {
      PushNotificationService.instance = new PushNotificationService();
    }
    return PushNotificationService.instance;
  }

  /**
   * Initialize OneSignal
   */
  async initialize(appId: string): Promise<boolean> {
    if (this.isInitialized) {
      return true;
    }

    try {
      // Check if OneSignal is already initialized globally
      if (typeof window !== 'undefined') {
        const globalOneSignal = (window as any).OneSignal;
        if (globalOneSignal) {
          try {
            // Check if it's already initialized by trying to get user ID
            const existingUserId = await globalOneSignal.getUserId();
            if (existingUserId !== null && existingUserId !== undefined) {
              this.isInitialized = true;
              this.playerId = existingUserId;
              console.log('OneSignal already initialized, using existing instance');
              return true;
            }
          } catch (e) {
            // If getUserId fails, it might not be fully initialized
            // Check if init was called
            if (globalOneSignal._isInitialized) {
              this.isInitialized = true;
              console.log('OneSignal init detected, waiting for full initialization');
              // Wait and try to get player ID
              setTimeout(async () => {
                try {
                  const userId = await globalOneSignal.getUserId();
                  if (userId) {
                    this.playerId = userId;
                  }
                } catch (err) {
                  console.warn('Could not get player ID from existing OneSignal instance:', err);
                }
              }, 1000);
              return true;
            }
          }
        }
      }

      // Initialize OneSignal
      await OneSignal.init({
        appId: appId,
        allowLocalhostAsSecureOrigin: true,
        notifyButton: {
          enable: false,
        },
        autoResubscribe: true,
        serviceWorkerParam: {
          scope: '/',
        },
        serviceWorkerPath: 'OneSignalSDKWorker.js',
      });

      this.isInitialized = true;
      
      // Wait for OneSignal to fully initialize
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Get player ID
      try {
        const userId = await OneSignal.getUserId();
        if (userId) {
          this.playerId = userId;
        }
      } catch (error) {
        console.warn('Could not get player ID immediately:', error);
        // Try again after a delay
        setTimeout(async () => {
          try {
            const userId = await OneSignal.getUserId();
            if (userId) {
              this.playerId = userId;
            }
          } catch (e) {
            console.error('Error getting player ID:', e);
          }
        }, 2000);
      }

      // Listen for notification opened events
      try {
        OneSignal.addListenerForNotificationOpened((notification) => {
          console.log('Notification opened:', notification);
          this.handleNotificationClick(notification);
        });
      } catch (error) {
        console.warn('Could not add notification opened listener:', error);
      }

      // Listen for subscription changes
      try {
        OneSignal.addListenerForSubscriptionChange((isSubscribed) => {
          console.log('Subscription changed:', isSubscribed);
          if (isSubscribed) {
            OneSignal.getUserId().then((id) => {
              this.playerId = id || null;
            }).catch((e) => {
              console.error('Error getting player ID on subscription change:', e);
            });
          }
        });
      } catch (error) {
        console.warn('Could not add subscription change listener:', error);
      }

      return true;
    } catch (error) {
      console.error('Failed to initialize OneSignal:', error);
      
      // If it's "already initialized" error, mark as initialized
      if (error instanceof Error && error.message.includes('already initialized')) {
        console.log('OneSignal was already initialized, continuing...');
        this.isInitialized = true;
        // Try to get player ID
        setTimeout(async () => {
          try {
            const userId = await OneSignal.getUserId();
            if (userId) {
              this.playerId = userId;
            }
          } catch (e) {
            console.warn('Could not get player ID:', e);
          }
        }, 1000);
        return true;
      }
      
      // If it's a domain restriction error, log a helpful message
      if (error instanceof Error && error.message.includes('Can only be used on')) {
        console.warn('OneSignal domain restriction detected. Make sure localhost is enabled in OneSignal dashboard.');
      }
      return false;
    }
  }

  /**
   * Check if notifications are supported
   */
  isSupported(): boolean {
    return 'Notification' in window && 'serviceWorker' in navigator;
  }

  /**
   * Check current permission status
   */
  async getPermissionStatus(): Promise<NotificationPermission> {
    if (!this.isSupported()) {
      return 'denied';
    }
    return Notification.permission;
  }

  /**
   * Request notification permission
   */
  async requestPermission(): Promise<NotificationPermission> {
    if (!this.isSupported()) {
      throw new Error('Push notifications are not supported in this browser');
    }

    // Check current permission first
    const currentPermission = await this.getPermissionStatus();
    
    // If already granted, return immediately
    if (currentPermission === 'granted') {
      return 'granted';
    }

    // If denied, we can't show the prompt again - user must enable in settings
    if (currentPermission === 'denied') {
      return 'denied';
    }

    // If default, try to request permission
    try {
      // First, try the native browser API (this shows the browser popup)
      if ('Notification' in window && Notification.permission === 'default') {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          // Now initialize OneSignal with the granted permission
          await OneSignal.registerForPushNotifications();
          return 'granted';
        }
        return permission;
      }

      // Fallback to OneSignal's method
      await OneSignal.registerForPushNotifications();
      
      // Check the actual permission status
      const finalPermission = await this.getPermissionStatus();
      return finalPermission;
    } catch (error) {
      console.error('Error requesting permission:', error);
      return 'denied';
    }
  }

  /**
   * Get current player ID
   */
  async getPlayerId(): Promise<string | null> {
    if (this.playerId) {
      return this.playerId;
    }

    if (!this.isInitialized) {
      console.warn('OneSignal not initialized yet');
      return null;
    }

    try {
      // Check if OneSignal is available
      if (typeof window !== 'undefined' && (window as any).OneSignal) {
        const userId = await OneSignal.getUserId();
        this.playerId = userId || null;
        return this.playerId;
      }
      return null;
    } catch (error) {
      console.error('Error getting player ID:', error);
      return null;
    }
  }

  /**
   * Subscribe user to push notifications
   */
  async subscribe(userId: string): Promise<PushSubscription | null> {
    try {
      const playerId = await this.getPlayerId();
      if (!playerId) {
        throw new Error('Failed to get player ID');
      }

      // Get device info
      const deviceInfo = this.getDeviceInfo();

      // Default preferences
      const defaultPreferences: PushNotificationPreferences = {
        order_received: true,
        order_confirmed: true,
        order_preparing: true,
        order_on_the_way: true,
        order_completed: true,
        order_cancelled: true,
        new_order_for_cafe: true,
      };

      // Check if subscription already exists
      const { data: existing } = await supabase
        .from('push_subscriptions')
        .select('*')
        .eq('player_id', playerId)
        .single();

      if (existing) {
        // Update existing subscription
        const { data, error } = await supabase
          .from('push_subscriptions')
          .update({
            user_id: userId,
            device_type: deviceInfo.deviceType,
            browser: deviceInfo.browser,
            user_agent: navigator.userAgent,
            is_active: true,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existing.id)
          .select()
          .single();

        if (error) throw error;
        return data as PushSubscription;
      } else {
        // Create new subscription
        const { data, error } = await supabase
          .from('push_subscriptions')
          .insert({
            user_id: userId,
            player_id: playerId,
            device_type: deviceInfo.deviceType,
            browser: deviceInfo.browser,
            user_agent: navigator.userAgent,
            preferences: defaultPreferences,
            is_active: true,
          })
          .select()
          .single();

        if (error) throw error;
        return data as PushSubscription;
      }
    } catch (error) {
      console.error('Error subscribing to push notifications:', error);
      return null;
    }
  }

  /**
   * Unsubscribe user from push notifications
   */
  async unsubscribe(): Promise<boolean> {
    try {
      const playerId = await this.getPlayerId();
      if (!playerId) {
        return false;
      }

      const { error } = await supabase
        .from('push_subscriptions')
        .update({ is_active: false })
        .eq('player_id', playerId);

      if (error) throw error;

      // Unsubscribe from OneSignal
      await OneSignal.setSubscription(false);
      
      return true;
    } catch (error) {
      console.error('Error unsubscribing from push notifications:', error);
      return false;
    }
  }

  /**
   * Update notification preferences
   */
  async updatePreferences(
    preferences: Partial<PushNotificationPreferences>
  ): Promise<boolean> {
    try {
      const playerId = await this.getPlayerId();
      if (!playerId) {
        return false;
      }

      // Get current preferences
      const { data: current } = await supabase
        .from('push_subscriptions')
        .select('preferences')
        .eq('player_id', playerId)
        .single();

      if (!current) {
        return false;
      }

      // Merge preferences
      const updatedPreferences = {
        ...(current.preferences as PushNotificationPreferences),
        ...preferences,
      };

      const { error } = await supabase
        .from('push_subscriptions')
        .update({ preferences: updatedPreferences })
        .eq('player_id', playerId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error updating preferences:', error);
      return false;
    }
  }

  /**
   * Get user's notification preferences
   */
  async getPreferences(): Promise<PushNotificationPreferences | null> {
    try {
      const playerId = await this.getPlayerId();
      if (!playerId) {
        return null;
      }

      const { data, error } = await supabase
        .from('push_subscriptions')
        .select('preferences')
        .eq('player_id', playerId)
        .single();

      if (error || !data) {
        return null;
      }

      return data.preferences as PushNotificationPreferences;
    } catch (error) {
      console.error('Error getting preferences:', error);
      return null;
    }
  }

  /**
   * Get device information
   */
  private getDeviceInfo(): { deviceType: string; browser: string } {
    const userAgent = navigator.userAgent.toLowerCase();
    
    let browser = 'unknown';
    if (userAgent.includes('chrome')) browser = 'chrome';
    else if (userAgent.includes('firefox')) browser = 'firefox';
    else if (userAgent.includes('safari')) browser = 'safari';
    else if (userAgent.includes('edge')) browser = 'edge';
    else if (userAgent.includes('opera')) browser = 'opera';

    let deviceType = 'web';
    if (/iphone|ipad|ipod/.test(userAgent)) deviceType = 'ios';
    else if (/android/.test(userAgent)) deviceType = 'android';

    return { deviceType, browser };
  }

  /**
   * Handle notification click
   */
  private handleNotificationClick(notification: any): void {
    // Handle navigation based on notification data
    if (notification?.data?.url) {
      window.location.href = notification.data.url;
    } else if (notification?.data?.order_id) {
      // Navigate to order details
      window.location.href = `/order-tracking/${notification.data.order_id}`;
    }
  }
}

export const pushNotificationService = PushNotificationService.getInstance();

