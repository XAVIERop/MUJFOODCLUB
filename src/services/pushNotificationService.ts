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
   * Get the native OneSignal SDK instance
   * react-onesignal may expose it differently, so we check multiple paths
   */
  private getNativeOneSignal(): any {
    if (typeof window === 'undefined') return null;
    
    // Check multiple possible locations
    const possiblePaths = [
      (window as any).OneSignal,
      (window as any).OneSignal?.User,
      (window as any).OneSignalSDK,
      OneSignal, // Direct import from react-onesignal
    ];
    
    for (const sdk of possiblePaths) {
      if (sdk && typeof sdk === 'object') {
        // Check if it has OneSignal methods (might be nested)
        if (sdk.getUserId || sdk.User?.getUserId || sdk.getPlayerId) {
          return sdk;
        }
      }
    }
    
    return (window as any).OneSignal || null;
  }

  /**
   * Check if OneSignal method exists
   */
  private hasMethod(obj: any, method: string): boolean {
    return obj && typeof obj[method] === 'function';
  }

  /**
   * Initialize OneSignal
   * DISABLED: This function is currently disabled. OneSignal will be replaced with Web Push API.
   */
  async initialize(appId: string): Promise<boolean> {
    // Early return - OneSignal is disabled
    console.log('⚠️ OneSignal initialization is disabled. Will be replaced with Web Push API.');
    return false;
    if (this.isInitialized) {
      return true;
    }

    try {
      // Check if native OneSignal SDK is available
      const nativeOneSignal = this.getNativeOneSignal();
      
      // If native SDK exists and is initialized, use it
      if (nativeOneSignal && this.hasMethod(nativeOneSignal, 'getUserId')) {
        try {
          const existingUserId = await nativeOneSignal.getUserId();
          if (existingUserId) {
              this.isInitialized = true;
              this.playerId = existingUserId;
            console.log('✅ OneSignal already initialized, using existing instance');
              return true;
            }
          } catch (e) {
          console.log('OneSignal SDK exists but not fully initialized yet');
        }
      }

      // Initialize OneSignal via react-onesignal
      // Note: Service worker errors in dev are common - OneSignal will work without explicit path
      // The SDK will try to auto-detect or use CDN-hosted service worker
      try {
      await OneSignal.init({
        appId: appId,
        allowLocalhostAsSecureOrigin: true,
        notifyButton: {
          enable: false,
        },
        autoResubscribe: true,
          // Don't specify serviceWorkerPath - let OneSignal handle it automatically
          // This avoids MIME type issues in Vite dev server
        });
      } catch (swError: any) {
        // If service worker registration fails, try without explicit path
        if (swError?.message?.includes('ServiceWorker') || swError?.message?.includes('MIME')) {
          console.warn('⚠️ Service worker registration issue in dev mode, continuing without explicit path...');
          // OneSignal might still work with CDN-hosted service worker
          await OneSignal.init({
            appId: appId,
            allowLocalhostAsSecureOrigin: true,
            notifyButton: {
              enable: false,
            },
            autoResubscribe: true,
      });
        } else {
          throw swError;
        }
      }

      this.isInitialized = true;
      console.log('✅ OneSignal initialized via react-onesignal');
      
      // Wait for OneSignal to fully initialize and SDK to be available
      let attempts = 0;
      const maxAttempts = 10;
      
      while (attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const nativeSDK = this.getNativeOneSignal();
        
        // Try different methods to get user ID
        let userId: string | null = null;
        
        if (nativeSDK) {
          // Method 1: Direct getUserId
          if (this.hasMethod(nativeSDK, 'getUserId')) {
            try {
              userId = await nativeSDK.getUserId();
            } catch (e) {
              console.log('getUserId failed, trying alternatives...');
            }
          }
          
          // Method 2: User.getUserId (nested)
          if (!userId && nativeSDK.User && this.hasMethod(nativeSDK.User, 'getUserId')) {
            try {
              userId = await nativeSDK.User.getUserId();
            } catch (e) {
              console.log('User.getUserId failed, trying alternatives...');
            }
          }
          
          // Method 3: getPlayerId (alternative method name)
          if (!userId && this.hasMethod(nativeSDK, 'getPlayerId')) {
            try {
              userId = await nativeSDK.getPlayerId();
            } catch (e) {
              console.log('getPlayerId failed');
            }
          }
          
          // Method 4: Check if User object has pushSubscription
          if (!userId && nativeSDK.User) {
            try {
              const pushSubscription = await nativeSDK.User.pushSubscription;
              if (pushSubscription && pushSubscription.id) {
                userId = pushSubscription.id;
              }
            } catch (e) {
              // Continue
            }
          }
        }
        
        if (userId) {
          this.playerId = userId;
          console.log('✅ OneSignal player ID obtained:', userId);
          break;
        }
        
        attempts++;
      }
      
      if (!this.playerId) {
        console.warn('⚠️ Could not obtain OneSignal player ID after initialization');
        console.log('OneSignal SDK object:', this.getNativeOneSignal());
        console.log('Available methods:', Object.keys(this.getNativeOneSignal() || {}));
            }

      // Set up listeners using native SDK if available
      const nativeSDK = this.getNativeOneSignal();
      if (nativeSDK) {
      // Listen for notification opened events
        if (this.hasMethod(nativeSDK, 'addListenerForNotificationOpened')) {
      try {
            nativeSDK.addListenerForNotificationOpened((notification: any) => {
              console.log('📬 Notification opened:', notification);
          this.handleNotificationClick(notification);
        });
            console.log('✅ Notification opened listener added');
      } catch (error) {
            console.warn('⚠️ Could not add notification opened listener:', error);
          }
      }

      // Listen for subscription changes
        if (this.hasMethod(nativeSDK, 'addListenerForSubscriptionChange')) {
      try {
            nativeSDK.addListenerForSubscriptionChange((isSubscribed: boolean) => {
              console.log('📱 Subscription changed:', isSubscribed);
          if (isSubscribed) {
                nativeSDK.getUserId().then((id: string | null) => {
                  if (id) {
                    this.playerId = id;
                  }
                }).catch((e: any) => {
              console.error('Error getting player ID on subscription change:', e);
            });
          }
        });
            console.log('✅ Subscription change listener added');
      } catch (error) {
            console.warn('⚠️ Could not add subscription change listener:', error);
          }
        }
      } else {
        console.warn('⚠️ Native OneSignal SDK not available for listeners');
      }

      return true;
    } catch (error) {
      console.error('❌ Failed to initialize OneSignal:', error);
      
      // If it's "already initialized" error, mark as initialized
      if (error instanceof Error && error.message.includes('already initialized')) {
        console.log('ℹ️ OneSignal was already initialized, continuing...');
        this.isInitialized = true;
        // Try to get player ID from native SDK
        setTimeout(async () => {
          const nativeSDK = this.getNativeOneSignal();
          if (nativeSDK && this.hasMethod(nativeSDK, 'getUserId')) {
          try {
              const userId = await nativeSDK.getUserId();
            if (userId) {
              this.playerId = userId;
            }
          } catch (e) {
            console.warn('Could not get player ID:', e);
            }
          }
        }, 1000);
        return true;
      }
      
      // If it's a domain restriction error, log a helpful message
      if (error instanceof Error && error.message.includes('Can only be used on')) {
        console.warn('⚠️ OneSignal domain restriction detected. Make sure localhost is enabled in OneSignal dashboard.');
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
          // Now register with OneSignal using native SDK if available
          const nativeSDK = this.getNativeOneSignal();
          if (nativeSDK && this.hasMethod(nativeSDK, 'registerForPushNotifications')) {
            await nativeSDK.registerForPushNotifications();
          } else {
            // Fallback to react-onesignal
          await OneSignal.registerForPushNotifications();
          }
          return 'granted';
        }
        return permission;
      }

      // Fallback to OneSignal's method
      const nativeSDK = this.getNativeOneSignal();
      if (nativeSDK && this.hasMethod(nativeSDK, 'registerForPushNotifications')) {
        await nativeSDK.registerForPushNotifications();
      } else {
      await OneSignal.registerForPushNotifications();
      }
      
      // Check the actual permission status
      const finalPermission = await this.getPermissionStatus();
      return finalPermission;
    } catch (error) {
      console.error('❌ Error requesting permission:', error);
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
      console.warn('⚠️ OneSignal not initialized yet');
      return null;
    }

    try {
      const nativeSDK = this.getNativeOneSignal();
      if (!nativeSDK) {
        return null;
      }
      
      // Try multiple methods to get user ID
      let userId: string | null = null;
      
      // Method 1: Direct getUserId
      if (this.hasMethod(nativeSDK, 'getUserId')) {
        try {
          userId = await nativeSDK.getUserId();
        } catch (e) {
          // Continue to next method
        }
      }
      
      // Method 2: User.getUserId (nested)
      if (!userId && nativeSDK.User && this.hasMethod(nativeSDK.User, 'getUserId')) {
        try {
          userId = await nativeSDK.User.getUserId();
        } catch (e) {
          // Continue
        }
      }
      
      // Method 3: getPlayerId (alternative)
      if (!userId && this.hasMethod(nativeSDK, 'getPlayerId')) {
        try {
          userId = await nativeSDK.getPlayerId();
        } catch (e) {
          // Continue
        }
      }
      
      // Method 4: Check pushSubscription
      if (!userId && nativeSDK.User) {
        try {
          const pushSubscription = await nativeSDK.User.pushSubscription;
          if (pushSubscription && pushSubscription.id) {
            userId = pushSubscription.id;
          }
        } catch (e) {
          // Continue
        }
      }
      
      if (userId) {
        this.playerId = userId;
        return userId;
      }
      
      return null;
    } catch (error) {
      console.error('❌ Error getting player ID:', error);
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
      const nativeSDK = this.getNativeOneSignal();
      if (nativeSDK && this.hasMethod(nativeSDK, 'setSubscription')) {
        await nativeSDK.setSubscription(false);
      } else {
      await OneSignal.setSubscription(false);
      }
      
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

