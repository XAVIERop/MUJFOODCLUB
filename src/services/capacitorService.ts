/**
 * Capacitor Native Services
 * Wraps Capacitor plugins for easy use throughout the app
 */

import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Network, NetworkStatus } from '@capacitor/network';
import { App } from '@capacitor/app';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { Share } from '@capacitor/share';
import { StatusBar, Style } from '@capacitor/status-bar';
import { Capacitor } from '@capacitor/core';

/**
 * Check if running on native platform
 */
export const isNative = (): boolean => {
  return Capacitor.isNativePlatform();
};

/**
 * Check if running on iOS
 */
export const isIOS = (): boolean => {
  return Capacitor.getPlatform() === 'ios';
};

/**
 * Check if running on Android
 */
export const isAndroid = (): boolean => {
  return Capacitor.getPlatform() === 'android';
};

/**
 * Camera Service
 */
export class CameraService {
  /**
   * Take a photo using device camera
   */
  static async takePhoto(options?: {
    quality?: number;
    allowEditing?: boolean;
    source?: CameraSource;
  }): Promise<string | null> {
    try {
      if (!isNative()) {
        // Fallback to file input on web
        return new Promise((resolve) => {
          const input = document.createElement('input');
          input.type = 'file';
          input.accept = 'image/*';
          input.onchange = (e: any) => {
            const file = e.target.files[0];
            if (file) {
              const reader = new FileReader();
              reader.onload = (event) => {
                resolve(event.target?.result as string);
              };
              reader.readAsDataURL(file);
            } else {
              resolve(null);
            }
          };
          input.click();
        });
      }

      const image = await Camera.getPhoto({
        quality: options?.quality || 90,
        allowEditing: options?.allowEditing || false,
        resultType: CameraResultType.DataUrl,
        source: options?.source || CameraSource.Camera,
      });

      return image.dataUrl || null;
    } catch (error) {
      console.error('Camera error:', error);
      return null;
    }
  }

  /**
   * Pick photo from gallery
   */
  static async pickPhoto(quality: number = 90): Promise<string | null> {
    return this.takePhoto({
      quality,
      allowEditing: false,
      source: CameraSource.Photos,
    });
  }
}

/**
 * Network Service
 */
export class NetworkService {
  private static networkStatus: NetworkStatus | null = null;
  private static listeners: Array<(status: NetworkStatus) => void> = [];

  /**
   * Initialize network monitoring
   */
  static async initialize(): Promise<void> {
    if (!isNative()) {
      // Web fallback
      window.addEventListener('online', () => {
        this.networkStatus = { connected: true, connectionType: 'wifi' };
        this.notifyListeners();
      });
      window.addEventListener('offline', () => {
        this.networkStatus = { connected: false, connectionType: 'none' };
        this.notifyListeners();
      });
      this.networkStatus = {
        connected: navigator.onLine,
        connectionType: navigator.onLine ? 'wifi' : 'none',
      };
      return;
    }

    // Get initial status
    this.networkStatus = await Network.getStatus();

    // Listen for changes
    Network.addListener('networkStatusChange', (status) => {
      this.networkStatus = status;
      this.notifyListeners();
    });
  }

  /**
   * Get current network status
   */
  static async getStatus(): Promise<NetworkStatus> {
    if (!isNative()) {
      return {
        connected: navigator.onLine,
        connectionType: navigator.onLine ? 'wifi' : 'none',
      };
    }

    if (!this.networkStatus) {
      this.networkStatus = await Network.getStatus();
    }
    return this.networkStatus;
  }

  /**
   * Check if device is online
   */
  static async isOnline(): Promise<boolean> {
    const status = await this.getStatus();
    return status.connected;
  }

  /**
   * Subscribe to network status changes
   */
  static onStatusChange(callback: (status: NetworkStatus) => void): () => void {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter((cb) => cb !== callback);
    };
  }

  private static notifyListeners(): void {
    if (this.networkStatus) {
      this.listeners.forEach((callback) => callback(this.networkStatus!));
    }
  }
}

/**
 * Haptics Service (Vibration/Feedback)
 */
export class HapticsService {
  /**
   * Light impact feedback
   */
  static async lightImpact(): Promise<void> {
    if (isNative()) {
      await Haptics.impact({ style: ImpactStyle.Light });
    }
  }

  /**
   * Medium impact feedback
   */
  static async mediumImpact(): Promise<void> {
    if (isNative()) {
      await Haptics.impact({ style: ImpactStyle.Medium });
    }
  }

  /**
   * Heavy impact feedback
   */
  static async heavyImpact(): Promise<void> {
    if (isNative()) {
      await Haptics.impact({ style: ImpactStyle.Heavy });
    }
  }

  /**
   * Success notification
   */
  static async notificationSuccess(): Promise<void> {
    if (isNative()) {
      await Haptics.notification({ type: 'success' });
    }
  }

  /**
   * Error notification
   */
  static async notificationError(): Promise<void> {
    if (isNative()) {
      await Haptics.notification({ type: 'error' });
    }
  }
}

/**
 * Share Service
 */
export class ShareService {
  /**
   * Share content (text, URL, etc.)
   */
  static async share(options: {
    title?: string;
    text?: string;
    url?: string;
    dialogTitle?: string;
  }): Promise<boolean> {
    try {
      if (!isNative()) {
        // Web fallback - use Web Share API if available
        if (navigator.share) {
          await navigator.share({
            title: options.title,
            text: options.text,
            url: options.url,
          });
          return true;
        }
        // Fallback: copy to clipboard
        if (options.url) {
          await navigator.clipboard.writeText(options.url);
          alert('Link copied to clipboard!');
          return true;
        }
        return false;
      }

      await Share.share({
        title: options.title,
        text: options.text,
        url: options.url,
        dialogTitle: options.dialogTitle || 'Share',
      });
      return true;
    } catch (error) {
      console.error('Share error:', error);
      return false;
    }
  }
}

/**
 * Status Bar Service
 */
export class StatusBarService {
  /**
   * Set status bar style
   */
  static async setStyle(style: 'dark' | 'light' = 'dark'): Promise<void> {
    if (isNative()) {
      await StatusBar.setStyle({
        style: style === 'dark' ? Style.Dark : Style.Light,
      });
    }
  }

  /**
   * Set status bar background color
   */
  static async setBackgroundColor(color: string): Promise<void> {
    if (isNative() && isAndroid()) {
      await StatusBar.setBackgroundColor({ color });
    }
  }
}

/**
 * App Lifecycle Service
 */
export class AppService {
  /**
   * Listen for app state changes (foreground/background)
   */
  static onAppStateChange(
    callback: (state: { isActive: boolean }) => void
  ): () => void {
    if (!isNative()) {
      // Web fallback
      const handleVisibilityChange = () => {
        callback({ isActive: !document.hidden });
      };
      document.addEventListener('visibilitychange', handleVisibilityChange);
      return () => {
        document.removeEventListener('visibilitychange', handleVisibilityChange);
      };
    }

    const listener = App.addListener('appStateChange', callback);
    return () => {
      listener.remove();
    };
  }

  /**
   * Get app info
   */
  static async getInfo(): Promise<{ name: string; id: string; version: string }> {
    if (!isNative()) {
      return {
        name: 'MUJ Food Club',
        id: 'in.mujfoodclub.app',
        version: '1.0.0',
      };
    }

    return await App.getInfo();
  }
}

// Initialize network monitoring on import
if (typeof window !== 'undefined') {
  NetworkService.initialize();
}

