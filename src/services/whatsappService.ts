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
      console.log('📱 [WHATSAPP SERVICE] Starting notification process...');
      console.log('📱 [WHATSAPP SERVICE] Cafe ID:', cafeId);
      console.log('📱 [WHATSAPP SERVICE] Order data:', JSON.stringify(orderData, null, 2));
      
      // Get cafe WhatsApp settings
      console.log('📱 [WHATSAPP SERVICE] Fetching cafe settings...');
      const cafeSettings = await this.getCafeWhatsAppSettings(cafeId);
      console.log('📱 [WHATSAPP SERVICE] Cafe settings:', JSON.stringify(cafeSettings, null, 2));
      
      if (!cafeSettings) {
        console.log('❌ [WHATSAPP SERVICE] Cafe not found');
        return false;
      }
      
      if (!cafeSettings.whatsapp_enabled || !cafeSettings.whatsapp_notifications) {
        console.log('❌ [WHATSAPP SERVICE] WhatsApp notifications disabled for cafe:', cafeSettings.name);
        console.log('   whatsapp_enabled:', cafeSettings.whatsapp_enabled);
        console.log('   whatsapp_notifications:', cafeSettings.whatsapp_notifications);
        return false;
      }
      
      if (!cafeSettings.whatsapp_phone) {
        console.log('❌ [WHATSAPP SERVICE] No WhatsApp phone number configured for cafe:', cafeSettings.name);
        return false;
      }
      
      console.log('📱 [WHATSAPP SERVICE] All checks passed, formatting message...');
      
      // Format the message
      const message = this.formatOrderMessage(orderData, cafeSettings.name);
      console.log('📱 [WHATSAPP SERVICE] Message formatted:', message);
      
      // Send the notification
      console.log('📱 [WHATSAPP SERVICE] Sending message to:', cafeSettings.whatsapp_phone);
      const success = await this.sendMessage(cafeSettings.whatsapp_phone, message);
      
      if (success) {
        console.log('✅ [WHATSAPP SERVICE] Notification sent successfully to:', cafeSettings.whatsapp_phone);
      } else {
        console.log('❌ [WHATSAPP SERVICE] Failed to send notification');
      }
      
      return success;
      
    } catch (error) {
      console.error('❌ [WHATSAPP SERVICE] Error sending notification:', error);
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
        data.whatsapp_phone = '+91 9116966635';
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
   * Send WhatsApp message using Aisensy WhatsApp Business API
   * Falls back to Meta API if Aisensy is not configured
   */
  private async sendMessage(phoneNumber: string, message: string): Promise<boolean> {
    try {
      console.log('📱 WhatsApp Service: Sending message to:', phoneNumber);
      console.log('📱 WhatsApp Service: Message:', message);
      
      // Debug: Check environment variables
      console.log('🔍 Environment Variables Debug (Aisensy):');
      console.log('AISENSY_API_KEY:', WHATSAPP_CONFIG.AISENSY_API_KEY ? '✅ Set' : '❌ Missing');
      console.log('AISENSY_PHONE_NUMBER:', WHATSAPP_CONFIG.AISENSY_PHONE_NUMBER || '❌ Missing');
      console.log('AISENSY_API_BASE_URL:', WHATSAPP_CONFIG.AISENSY_API_BASE_URL || '❌ Missing');
      
      // Use Aisensy API
      if (WHATSAPP_CONFIG.AISENSY_API_KEY) {
        console.log('✅ Using Aisensy API');
        return await this.sendViaAisensy(phoneNumber, message);
      } else if (META_WHATSAPP_CONFIG.ACCESS_TOKEN && META_WHATSAPP_CONFIG.PHONE_NUMBER_ID) {
        console.log('✅ Using Meta API (fallback)');
        return await this.sendViaMeta(phoneNumber, message);
      } else {
        console.warn('⚠️ No WhatsApp API credentials configured. Notification not sent.');
        return false;
      }
      
    } catch (error) {
      console.error('Error sending WhatsApp message:', error);
      return false;
    }
  }

  /**
   * Send message via Aisensy WhatsApp Business API
   * Uses Supabase Edge Function to avoid CORS issues
   */
  private async sendViaAisensy(phoneNumber: string, message: string): Promise<boolean> {
    try {
      // Format phone number for Aisensy (remove + and spaces, keep only digits)
      let cleanNumber = phoneNumber.replace(/[^0-9]/g, '');
      
      // If number doesn't start with country code and is 10 digits, assume it's Indian (+91)
      if (cleanNumber.length === 10 && !cleanNumber.startsWith('91')) {
        console.log('📱 Phone number missing country code, adding +91 prefix');
        cleanNumber = '91' + cleanNumber;
      }
      
      console.log('📱 Sending via Aisensy to:', cleanNumber);
      console.log('📱 Original phone number:', phoneNumber);
      console.log('📱 From:', WHATSAPP_CONFIG.AISENSY_PHONE_NUMBER);
      
      if (!WHATSAPP_CONFIG.AISENSY_API_KEY) {
        console.error('❌ Aisensy API key not configured');
        return false;
      }

      // Get Supabase URL and anon key for Edge Function call
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      if (!supabaseUrl || !supabaseAnonKey) {
        console.error('❌ Supabase URL or Anon Key not configured');
        console.error('   Supabase URL:', supabaseUrl ? '✅ Set' : '❌ Missing');
        console.error('   Supabase Anon Key:', supabaseAnonKey ? '✅ Set' : '❌ Missing');
        return false;
      }

      // Call Supabase Edge Function to send WhatsApp message
      // This avoids CORS issues by making the API call server-side
      const edgeFunctionUrl = `${supabaseUrl}/functions/v1/send-whatsapp`;
      
      console.log('📱 Calling Supabase Edge Function:', edgeFunctionUrl);
      console.log('📱 Request payload:', {
        phoneNumber: cleanNumber,
        messageLength: message.length,
        messagePreview: message.substring(0, 100) + '...'
      });
      
      const response = await fetch(edgeFunctionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseAnonKey}`,
          'apikey': supabaseAnonKey,
        },
        body: JSON.stringify({
          phoneNumber: cleanNumber,
          message: message
        })
      });

      // Handle non-JSON responses (like 404 HTML pages)
      let responseData;
      const responseText = await response.text();
      
      try {
        responseData = JSON.parse(responseText);
      } catch (parseError) {
        console.error('❌ Edge Function returned non-JSON response:', responseText.substring(0, 200));
        if (response.status === 404) {
          console.error('❌ Edge Function not found (404). Deploy it first!');
          console.error('   Run: supabase functions deploy send-whatsapp');
        }
        return false;
      }

      console.log('📱 Edge Function Response Status:', response.status);
      console.log('📱 Edge Function Response:', JSON.stringify(responseData, null, 2));

      if (response.ok && responseData.success) {
        console.log('✅ Message sent via Aisensy successfully');
        if (responseData.endpoint) {
          console.log('📡 Working endpoint:', responseData.endpoint);
        }
        return true;
      } else {
        console.error('❌ Aisensy API error:', responseData.error || 'Unknown error');
        if (response.status === 404) {
          console.error('💡 Edge Function not deployed. Deploy it using:');
          console.error('   supabase functions deploy send-whatsapp');
        } else if (response.status === 500) {
          console.error('💡 Edge Function error. Check Supabase logs for details.');
        }
        return false;
      }
      
    } catch (error) {
      console.error('❌ Error sending via Aisensy:', error);
      if (error instanceof TypeError && error.message.includes('fetch')) {
        console.error('💡 Network error. Check if Edge Function is deployed.');
      }
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
   * NOTE: This should not be used in production - it opens dialogs for customers
   * This is disabled to prevent customer-facing dialogs
   */
  private async sendViaWhatsAppWeb(phoneNumber: string, message: string): Promise<boolean> {
    try {
      const cleanNumber = phoneNumber.replace(/[^0-9]/g, '');
      const encodedMessage = encodeURIComponent(message);
      const whatsappUrl = `https://wa.me/${cleanNumber}?text=${encodedMessage}`;
      
      console.log('📱 WhatsApp Web fallback (disabled for customer experience):', whatsappUrl);
      console.log('📱 Phone Number:', cleanNumber);
      console.log('📱 Message Preview:', message.substring(0, 100) + '...');
      console.warn('⚠️ WhatsApp API credentials not configured. Notification not sent. Please configure Aisensy or Meta WhatsApp API.');
      
      // DO NOT open WhatsApp Web for customers - this creates a poor UX
      // Instead, just log that the notification would have been sent
      // The cafe will receive the order in their POS dashboard
      
      return false; // Return false to indicate notification was not sent
    } catch (error) {
      console.error('Error in WhatsApp Web fallback:', error);
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
