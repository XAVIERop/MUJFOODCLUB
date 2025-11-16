/**
 * Order Push Notification Service
 * Integrates push notifications with order status updates
 */

import { supabase } from '@/integrations/supabase/client';

export interface OrderStatusNotificationData {
  orderId: string;
  orderNumber: string;
  userId: string;
  cafeId: string;
  status: string;
  totalAmount?: number;
  customerName?: string;
}

class OrderPushNotificationService {
  private static instance: OrderPushNotificationService;

  private constructor() {}

  static getInstance(): OrderPushNotificationService {
    if (!OrderPushNotificationService.instance) {
      OrderPushNotificationService.instance = new OrderPushNotificationService();
    }
    return OrderPushNotificationService.instance;
  }

  /**
   * Send order status notification to customer
   */
  async sendOrderStatusNotification(data: OrderStatusNotificationData): Promise<boolean> {
    try {
      const statusMessages: Record<string, { heading: string; content: string }> = {
        received: {
          heading: 'Order Received! 🎉',
          content: `Your order #${data.orderNumber} has been received and is being processed.`,
        },
        confirmed: {
          heading: 'Order Confirmed! ✅',
          content: `Your order #${data.orderNumber} has been confirmed by the cafe.`,
        },
        preparing: {
          heading: 'Order Being Prepared! 👨‍🍳',
          content: `Your order #${data.orderNumber} is now being prepared.`,
        },
        on_the_way: {
          heading: 'Order Out for Delivery! 🚚',
          content: `Your order #${data.orderNumber} is on its way to you.`,
        },
        completed: {
          heading: 'Order Delivered! 🎊',
          content: `Your order #${data.orderNumber} has been delivered. Enjoy your meal!`,
        },
        cancelled: {
          heading: 'Order Cancelled',
          content: `Your order #${data.orderNumber} has been cancelled.`,
        },
      };

      const message = statusMessages[data.status] || {
        heading: 'Order Update',
        content: `Your order #${data.orderNumber} status has been updated to ${data.status}.`,
      };

      // Call Supabase Edge Function to send notification
      const { error } = await supabase.functions.invoke('send-push-notification', {
        body: {
          userId: data.userId,
          heading: message.heading,
          content: message.content,
          data: {
            type: 'order_status_update',
            order_id: data.orderId,
            order_number: data.orderNumber,
            status: data.status,
          },
          url: `/order-tracking/${data.orderId}`,
          notificationType: `order_${data.status}`,
        },
      });

      if (error) {
        console.error('Error sending order status notification:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in sendOrderStatusNotification:', error);
      return false;
    }
  }

  /**
   * Send new order notification to cafe staff
   */
  async sendNewOrderNotificationToCafe(data: OrderStatusNotificationData): Promise<boolean> {
    try {
      // Call Supabase Edge Function to send notification
      const { error } = await supabase.functions.invoke('send-push-notification', {
        body: {
          cafeId: data.cafeId,
          heading: 'New Order Received! 📦',
          content: `Order #${data.orderNumber} for ₹${data.totalAmount || 0} from ${data.customerName || 'Customer'}`,
          data: {
            type: 'new_order',
            order_id: data.orderId,
            order_number: data.orderNumber,
            total_amount: data.totalAmount,
          },
          url: `/pos-dashboard?order=${data.orderId}`,
          notificationType: 'new_order_for_cafe',
        },
      });

      if (error) {
        console.error('Error sending new order notification to cafe:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in sendNewOrderNotificationToCafe:', error);
      return false;
    }
  }
}

export const orderPushNotificationService = OrderPushNotificationService.getInstance();

