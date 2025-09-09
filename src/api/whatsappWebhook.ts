// WhatsApp Webhook Handler
// This handles incoming WhatsApp messages and processes quick actions

import { supabase } from '@/integrations/supabase/client';

export interface WhatsAppWebhookMessage {
  MessageSid: string;
  From: string;
  To: string;
  Body: string;
  MessageStatus: string;
}

export class WhatsAppWebhookHandler {
  /**
   * Process incoming WhatsApp message
   */
  static async processMessage(message: WhatsAppWebhookMessage): Promise<{ success: boolean; response?: string }> {
    try {
      console.log('📱 WhatsApp Webhook: Processing message:', message);
      
      const { From, Body } = message;
      
      // Extract phone number (remove whatsapp: prefix)
      const phoneNumber = From.replace('whatsapp:', '');
      
      // Find cafe by phone number
      const cafe = await this.findCafeByPhone(phoneNumber);
      if (!cafe) {
        console.log('❌ WhatsApp Webhook: Cafe not found for phone:', phoneNumber);
        return { success: false, response: 'Cafe not found. Please contact support.' };
      }
      
      // Parse the command
      const command = this.parseCommand(Body);
      if (!command) {
        console.log('❌ WhatsApp Webhook: Invalid command:', Body);
        return { success: false, response: 'Invalid command. Please use: CONFIRM, PREPARING, READY, or DELIVERED followed by order number.' };
      }
      
      // Update order status
      const result = await this.updateOrderStatus(command.orderNumber, command.status, cafe.id);
      
      if (result.success) {
        const response = `✅ Order #${command.orderNumber} status updated to: ${command.status.toUpperCase()}`;
        console.log('✅ WhatsApp Webhook: Order updated successfully');
        return { success: true, response };
      } else {
        console.log('❌ WhatsApp Webhook: Failed to update order');
        return { success: false, response: 'Failed to update order. Please try again or contact support.' };
      }
      
    } catch (error) {
      console.error('❌ WhatsApp Webhook: Error processing message:', error);
      return { success: false, response: 'An error occurred. Please try again.' };
    }
  }
  
  /**
   * Find cafe by phone number
   */
  private static async findCafeByPhone(phoneNumber: string) {
    try {
      const { data, error } = await supabase
        .from('cafes')
        .select('id, name, whatsapp_phone')
        .eq('whatsapp_phone', `+${phoneNumber}`)
        .single();
      
      if (error) {
        console.error('Error finding cafe:', error);
        return null;
      }
      
      return data;
    } catch (error) {
      console.error('Error in findCafeByPhone:', error);
      return null;
    }
  }
  
  /**
   * Parse command from message body
   */
  private static parseCommand(messageBody: string): { orderNumber: string; status: string } | null {
    const body = messageBody.trim().toUpperCase();
    
    // Match patterns like: CONFIRM CHA000113, PREPARING CHA000113, etc.
    const patterns = [
      /^(CONFIRM|PREPARING|READY|DELIVERED|CANCELLED)\s+([A-Z0-9]+)$/,
      /^(CONFIRM|PREPARING|READY|DELIVERED|CANCELLED)\s+([A-Z]+[0-9]+)$/
    ];
    
    for (const pattern of patterns) {
      const match = body.match(pattern);
      if (match) {
        return {
          status: match[1].toLowerCase(),
          orderNumber: match[2]
        };
      }
    }
    
    return null;
  }
  
  /**
   * Update order status in database
   */
  private static async updateOrderStatus(orderNumber: string, status: string, cafeId: string): Promise<{ success: boolean }> {
    try {
      // Map status to database values
      const statusMap: { [key: string]: string } = {
        'confirm': 'confirmed',
        'preparing': 'preparing',
        'ready': 'ready',
        'delivered': 'completed',
        'cancelled': 'cancelled'
      };
      
      const dbStatus = statusMap[status] || status;
      
      // Update order status
      const { error } = await supabase
        .from('orders')
        .update({ 
          status: dbStatus,
          updated_at: new Date().toISOString()
        })
        .eq('order_number', orderNumber)
        .eq('cafe_id', cafeId);
      
      if (error) {
        console.error('Error updating order status:', error);
        return { success: false };
      }
      
      return { success: true };
    } catch (error) {
      console.error('Error in updateOrderStatus:', error);
      return { success: false };
    }
  }
}

// Example webhook endpoint (this would be in your backend)
export const whatsappWebhookEndpoint = async (req: any, res: any) => {
  try {
    const message: WhatsAppWebhookMessage = {
      MessageSid: req.body.MessageSid,
      From: req.body.From,
      To: req.body.To,
      Body: req.body.Body,
      MessageStatus: req.body.MessageStatus
    };
    
    const result = await WhatsAppWebhookHandler.processMessage(message);
    
    if (result.success) {
      res.status(200).json({ success: true, message: result.response });
    } else {
      res.status(400).json({ success: false, message: result.response });
    }
  } catch (error) {
    console.error('Webhook endpoint error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
