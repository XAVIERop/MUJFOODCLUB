import { supabase } from '@/integrations/supabase/client';
import { WHATSAPP_CONFIG, META_WHATSAPP_CONFIG } from '@/config/whatsapp';

export interface OrderData {
  id: string;
  order_number: string;
  customer_name: string;
  phone_number: string;
  delivery_block: string;
  total_amount: number;
  created_at: string;
  delivery_notes?: string;
  order_items: Array<{
    quantity: number;
    menu_item: {
      name: string;
      price: number;
    };
    total_price: number;
  }>;
}

export interface CafeWhatsAppSettings {
  whatsapp_phone: string | null;
  whatsapp_enabled: boolean;
  whatsapp_notifications: boolean;
  name: string;
}

export class WhatsAppService {
  private static instance: WhatsAppService;
  
  public static getInstance(): WhatsAppService {
    if (!WhatsAppService.instance) {
      WhatsAppService.instance = new WhatsAppService();
    }
    return WhatsAppService.instance;
  }

  /**
   * Send WhatsApp notification to cafe owner for new order
   */
  async sendOrderNotification(cafeId: string, orderData: OrderData): Promise<boolean> {
    try {
      console.log('📱 WhatsApp Service: Sending order notification for cafe:', cafeId);
      console.log('📱 WhatsApp Service: Order data:', orderData);
      
      // Get cafe WhatsApp settings
      const cafeSettings = await this.getCafeWhatsAppSettings(cafeId);
      console.log('📱 WhatsApp Service: Cafe settings:', cafeSettings);
      
      if (!cafeSettings) {
        console.log('❌ WhatsApp Service: Cafe not found');
        return false;
      }
      
      if (!cafeSettings.whatsapp_enabled || !cafeSettings.whatsapp_notifications) {
        console.log('❌ WhatsApp Service: WhatsApp notifications disabled for cafe:', cafeSettings.name);
        return false;
      }
      
      if (!cafeSettings.whatsapp_phone) {
        console.log('❌ WhatsApp Service: No WhatsApp phone number configured for cafe:', cafeSettings.name);
        return false;
      }
      
      // Format the message
      const message = this.formatOrderMessage(orderData, cafeSettings.name);
      
      // Send the notification
      const success = await this.sendMessage(cafeSettings.whatsapp_phone, message);
      
      if (success) {
        console.log('✅ WhatsApp Service: Notification sent successfully to:', cafeSettings.whatsapp_phone);
      } else {
        console.log('❌ WhatsApp Service: Failed to send notification');
      }
      
      return success;
      
    } catch (error) {
      console.error('❌ WhatsApp Service: Error sending notification:', error);
      return false;
    }
  }

  /**
   * Get cafe WhatsApp settings from database
   */
  private async getCafeWhatsAppSettings(cafeId: string): Promise<CafeWhatsAppSettings | null> {
    try {
      const { data, error } = await supabase
        .from('cafes')
        .select('whatsapp_phone, whatsapp_enabled, whatsapp_notifications, name')
        .eq('id', cafeId)
        .single();

      if (error) {
        console.error('Error fetching cafe WhatsApp settings:', error);
        return null;
      }

      // Temporary override for Cook House to use test number
      if (data.name === 'COOK HOUSE') {
        console.log('📱 Overriding Cook House WhatsApp number to test number');
        data.whatsapp_phone = '+91 8383080140';
        data.whatsapp_enabled = true;
        data.whatsapp_notifications = true;
      }

      return data;
    } catch (error) {
      console.error('Error in getCafeWhatsAppSettings:', error);
      return null;
    }
  }

  /**
   * Format order data into WhatsApp message
   */
  private formatOrderMessage(orderData: OrderData, cafeName: string): string {
    const orderTime = new Date(orderData.created_at).toLocaleString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });

    const itemsText = orderData.order_items
      .map(item => `• *${item.menu_item.name}* x${item.quantity} - ₹${item.total_price}`)
      .join('\n');

    const notesText = orderData.delivery_notes && orderData.delivery_notes.trim() 
      ? `\n📋 *Notes:* ${orderData.delivery_notes}` 
      : '';

    return `🍽️ *MUJ Food Club* - New Order Alert!

📋 *Order:* #${orderData.order_number}
👤 *Customer:* ${orderData.customer_name}
📱 *Phone:* ${orderData.phone_number}
📍 *Block:* ${orderData.delivery_block}
💰 *Total:* ₹${orderData.total_amount}
⏰ *Time:* ${orderTime}

📝 *Items:*
${itemsText}${notesText}

🔗 *Full Dashboard:* ${window.location.origin}/pos-dashboard`;
  }

  /**
   * Send WhatsApp message using real APIs
   * Supports both Twilio and Meta WhatsApp Business API
   */
  private async sendMessage(phoneNumber: string, message: string): Promise<boolean> {
    try {
      console.log('📱 WhatsApp Service: Sending message to:', phoneNumber);
      console.log('📱 WhatsApp Service: Message:', message);
      
      // Debug: Check environment variables
      console.log('🔍 Environment Variables Debug:');
      console.log('TWILIO_ACCOUNT_SID:', WHATSAPP_CONFIG.TWILIO_ACCOUNT_SID ? '✅ Set' : '❌ Missing');
      console.log('TWILIO_AUTH_TOKEN:', WHATSAPP_CONFIG.TWILIO_AUTH_TOKEN ? '✅ Set' : '❌ Missing');
      console.log('TWILIO_WHATSAPP_FROM:', WHATSAPP_CONFIG.TWILIO_WHATSAPP_FROM || '❌ Missing');
      
      // Try Twilio first, then fallback to WhatsApp Web
      if (WHATSAPP_CONFIG.TWILIO_ACCOUNT_SID && WHATSAPP_CONFIG.TWILIO_AUTH_TOKEN) {
        console.log('✅ Using Twilio API');
        return await this.sendViaTwilio(phoneNumber, message);
      } else if (META_WHATSAPP_CONFIG.ACCESS_TOKEN && META_WHATSAPP_CONFIG.PHONE_NUMBER_ID) {
        console.log('✅ Using Meta API');
        return await this.sendViaMeta(phoneNumber, message);
      } else {
        console.warn('⚠️ No WhatsApp API credentials configured. Falling back to WhatsApp Web.');
        return await this.sendViaWhatsAppWeb(phoneNumber, message);
      }
      
    } catch (error) {
      console.error('Error sending WhatsApp message:', error);
      return false;
    }
  }

  /**
   * Send message via Twilio WhatsApp API
   */
  private async sendViaTwilio(phoneNumber: string, message: string): Promise<boolean> {
    try {
      // Format phone number for Twilio (remove + and spaces)
      const cleanNumber = phoneNumber.replace(/[^0-9]/g, '');
      const toNumber = `whatsapp:${cleanNumber}`;
      
      console.log('📱 Sending via Twilio to:', toNumber);
      console.log('📱 From:', WHATSAPP_CONFIG.TWILIO_WHATSAPP_FROM);
      console.log('📱 Sandbox Mode:', WHATSAPP_CONFIG.SANDBOX_MODE);
      
      // For sandbox mode, we need to use a template or simple text
      // The sandbox requires the recipient to first send "join <sandbox-code>" to start the conversation
      const finalMessage = message;
      
      // For now, we'll use a direct approach since we're in development
      // In production, you should use a backend API
      
      if (!WHATSAPP_CONFIG.TWILIO_ACCOUNT_SID || !WHATSAPP_CONFIG.TWILIO_AUTH_TOKEN) {
        console.error('❌ Twilio credentials not configured');
        return false;
      }
      
      // Create the Twilio API URL
      const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${WHATSAPP_CONFIG.TWILIO_ACCOUNT_SID}/Messages.json`;
      
      // Create form data for Twilio API
      const formData = new FormData();
      formData.append('To', toNumber);
      formData.append('From', WHATSAPP_CONFIG.TWILIO_WHATSAPP_FROM);
      formData.append('Body', finalMessage);
      
      // Make the API call
      const response = await fetch(twilioUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${btoa(`${WHATSAPP_CONFIG.TWILIO_ACCOUNT_SID}:${WHATSAPP_CONFIG.TWILIO_AUTH_TOKEN}`)}`
        },
        body: formData
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log('✅ Message sent via Twilio successfully:', result.sid);
        return true;
      } else {
        const error = await response.text();
        console.error('❌ Twilio API error:', error);
        return false;
      }
      
    } catch (error) {
      console.error('Error sending via Twilio:', error);
      return false;
    }
  }

  /**
   * Send message via Meta WhatsApp Business API
   */
  private async sendViaMeta(phoneNumber: string, message: string): Promise<boolean> {
    try {
      // Format phone number for Meta API
      const formattedNumber = phoneNumber.replace(/[^0-9]/g, '');
      
      console.log('📱 Sending via Meta API to:', formattedNumber);
      
      const response = await fetch(`https://graph.facebook.com/v17.0/${META_WHATSAPP_CONFIG.PHONE_NUMBER_ID}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${META_WHATSAPP_CONFIG.ACCESS_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: formattedNumber,
          type: 'text',
          text: { body: message }
        })
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log('✅ Message sent via Meta API successfully:', result);
        return true;
      } else {
        const error = await response.text();
        console.error('❌ Meta API error:', error);
        return false;
      }
      
    } catch (error) {
      console.error('Error sending via Meta API:', error);
      return false;
    }
  }

  /**
   * Send via WhatsApp Web (opens in new tab with pre-filled message)
   */
  private async sendViaWhatsAppWeb(phoneNumber: string, message: string): Promise<boolean> {
    try {
      const cleanNumber = phoneNumber.replace(/[^0-9]/g, '');
      const encodedMessage = encodeURIComponent(message);
      const whatsappUrl = `https://wa.me/${cleanNumber}?text=${encodedMessage}`;
      
      console.log('📱 Opening WhatsApp Web:', whatsappUrl);
      console.log('📱 Phone Number:', cleanNumber);
      console.log('📱 Message Preview:', message.substring(0, 100) + '...');
      
      // Open WhatsApp Web in new tab
      window.open(whatsappUrl, '_blank');
      
      // Show a notification to the user
      if (typeof window !== 'undefined' && window.alert) {
        setTimeout(() => {
          alert(`📱 WhatsApp notification ready!\n\nPhone: ${phoneNumber}\n\nWhatsApp Web has opened with the order details pre-filled. Just click send!`);
        }, 1000);
      }
      
      return true;
    } catch (error) {
      console.error('Error opening WhatsApp Web:', error);
      return false;
    }
  }

  /**
   * Send order status update notification
   */
  async sendStatusUpdateNotification(cafeId: string, orderData: OrderData, newStatus: string): Promise<boolean> {
    try {
      const cafeSettings = await this.getCafeWhatsAppSettings(cafeId);
      
      if (!cafeSettings?.whatsapp_enabled || !cafeSettings.whatsapp_phone) {
        return false;
      }
      
      const statusEmoji = this.getStatusEmoji(newStatus);
      const message = `🔄 *Order Status Update*

📋 *Order:* #${orderData.order_number}
📊 *Status:* ${statusEmoji} ${newStatus}
⏰ *Updated:* ${new Date().toLocaleString('en-IN')}

💰 *Total:* ₹${orderData.total_amount}
👤 *Customer:* ${orderData.customer_name} (${orderData.delivery_block})

🔄 *Next Actions:*
${this.getNextStatusActions(orderData.order_number, newStatus)}

🔗 *Full Dashboard:* ${window.location.origin}/pos-dashboard`;
      
      return await this.sendMessage(cafeSettings.whatsapp_phone, message);
      
    } catch (error) {
      console.error('Error sending status update notification:', error);
      return false;
    }
  }

  /**
   * Get emoji for order status
   */
  private getStatusEmoji(status: string): string {
    switch (status.toLowerCase()) {
      case 'received': return '📥';
      case 'confirmed': return '✅';
      case 'preparing': return '👨‍🍳';
      case 'on_the_way': return '🚚';
      case 'completed': return '🎉';
      case 'cancelled': return '❌';
      default: return '📋';
    }
  }

  /**
   * Get next status actions based on current status
   */
  private getNextStatusActions(orderNumber: string, currentStatus: string): string {
    switch (currentStatus.toLowerCase()) {
      case 'received':
        return `• Reply "CONFIRM ${orderNumber}" to confirm order
• Reply "PREPARING ${orderNumber}" to start preparing`;
      case 'confirmed':
        return `• Reply "PREPARING ${orderNumber}" to start preparing
• Reply "READY ${orderNumber}" when order is ready`;
      case 'preparing':
        return `• Reply "READY ${orderNumber}" when order is ready
• Reply "DELIVERED ${orderNumber}" when delivered`;
      case 'ready':
        return `• Reply "DELIVERED ${orderNumber}" when delivered
• Reply "CANCELLED ${orderNumber}" to cancel order`;
      case 'delivered':
        return `• Order completed! 🎉
• Reply "CANCELLED ${orderNumber}" if there was an issue`;
      case 'cancelled':
        return `• Order cancelled ❌
• Contact customer if needed`;
      default:
        return `• Reply "CONFIRM ${orderNumber}" to confirm order
• Reply "PREPARING ${orderNumber}" to start preparing`;
    }
  }
}

// Export singleton instance
export const whatsappService = WhatsAppService.getInstance();
