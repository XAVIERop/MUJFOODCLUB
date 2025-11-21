/**
 * OneSignal Notification Service
 * Handles sending push notifications via OneSignal REST API
 * 
 * This service is called from Supabase Edge Functions or backend services
 * to send push notifications to users and cafes.
 */

export interface OneSignalNotification {
  headings: { en: string };
  contents: { en: string };
  data?: Record<string, any>;
  url?: string;
  include_player_ids?: string[];
  include_external_user_ids?: string[];
  filters?: Array<Record<string, any>>;
}

export interface SendNotificationOptions {
  userId?: string;
  playerIds?: string[];
  heading: string;
  content: string;
  data?: Record<string, any>;
  url?: string;
}

class OneSignalNotificationService {
  private static instance: OneSignalNotificationService;
  private appId: string;
  private apiKey: string;
  private apiUrl = 'https://onesignal.com/api/v1/notifications';

  private constructor() {
    // These should be set from environment variables on the backend
    this.appId = process.env.ONESIGNAL_APP_ID || '';
    this.apiKey = process.env.ONESIGNAL_REST_API_KEY || '';
  }

  static getInstance(): OneSignalNotificationService {
    if (!OneSignalNotificationService.instance) {
      OneSignalNotificationService.instance = new OneSignalNotificationService();
    }
    return OneSignalNotificationService.instance;
  }

  /**
   * Send notification to specific player IDs
   */
  async sendToPlayers(
    playerIds: string[],
    heading: string,
    content: string,
    data?: Record<string, any>,
    url?: string
  ): Promise<boolean> {
    if (!this.appId || !this.apiKey) {
      console.error('OneSignal credentials not configured');
      return false;
    }

    if (playerIds.length === 0) {
      return false;
    }

    const notification: OneSignalNotification = {
      headings: { en: heading },
      contents: { en: content },
      include_player_ids: playerIds,
    };

    if (data) {
      notification.data = data;
    }

    if (url) {
      notification.url = url;
    }

    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${this.apiKey}`,
        },
        body: JSON.stringify({
          app_id: this.appId,
          ...notification,
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        console.error('OneSignal API error:', error);
        return false;
      }

      const result = await response.json();
      console.log('OneSignal notification sent:', result);
      return true;
    } catch (error) {
      console.error('Error sending OneSignal notification:', error);
      return false;
    }
  }

  /**
   * Send notification to a user (by user ID)
   * This requires fetching player IDs from the database first
   */
  async sendToUser(
    userId: string,
    heading: string,
    content: string,
    data?: Record<string, any>,
    url?: string
  ): Promise<boolean> {
    // This function should be called from a Supabase Edge Function
    // which can query the database for player IDs
    // For now, we'll return false and log a message
    console.log('sendToUser should be called from backend/Edge Function');
    return false;
  }

  /**
   * Send order status notification to customer
   */
  async sendOrderStatusNotification(
    playerIds: string[],
    orderNumber: string,
    status: string,
    orderId: string,
    preferences?: { [key: string]: boolean }
  ): Promise<boolean> {
    // Check if user wants this type of notification
    const statusKey = `order_${status.toLowerCase().replace('_', '_')}`;
    if (preferences && preferences[statusKey] === false) {
      return false; // User has disabled this notification type
    }

    const statusMessages: Record<string, { heading: string; content: string }> = {
      received: {
        heading: 'Order Received! 🎉',
        content: `Your order #${orderNumber} has been received and is being processed.`,
      },
      confirmed: {
        heading: 'Order Confirmed! ✅',
        content: `Your order #${orderNumber} has been confirmed by the cafe.`,
      },
      preparing: {
        heading: 'Order Being Prepared! 👨‍🍳',
        content: `Your order #${orderNumber} is now being prepared.`,
      },
      on_the_way: {
        heading: 'Order Out for Delivery! 🚚',
        content: `Your order #${orderNumber} is on its way to you.`,
      },
      completed: {
        heading: 'Order Delivered! 🎊',
        content: `Your order #${orderNumber} has been delivered. Enjoy your meal!`,
      },
      cancelled: {
        heading: 'Order Cancelled',
        content: `Your order #${orderNumber} has been cancelled.`,
      },
    };

    const message = statusMessages[status] || {
      heading: 'Order Update',
      content: `Your order #${orderNumber} status has been updated to ${status}.`,
    };

    return await this.sendToPlayers(
      playerIds,
      message.heading,
      message.content,
      {
        type: 'order_status_update',
        order_id: orderId,
        order_number: orderNumber,
        status: status,
      },
      `/order-tracking/${orderId}`
    );
  }

  /**
   * Send new order notification to cafe staff
   */
  async sendNewOrderNotificationToCafe(
    playerIds: string[],
    orderNumber: string,
    orderId: string,
    totalAmount: number,
    customerName: string
  ): Promise<boolean> {
    return await this.sendToPlayers(
      playerIds,
      'New Order Received! 📦',
      `Order #${orderNumber} for ₹${totalAmount} from ${customerName}`,
      {
        type: 'new_order',
        order_id: orderId,
        order_number: orderNumber,
        total_amount: totalAmount,
      },
      `/pos-dashboard?order=${orderId}`
    );
  }
}

export const oneSignalNotificationService = OneSignalNotificationService.getInstance();

