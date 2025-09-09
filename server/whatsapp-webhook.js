// WhatsApp Webhook Endpoint for Twilio
// This handles incoming WhatsApp messages and processes quick actions

require('dotenv').config();
const express = require('express');
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

const app = express();

// Middleware to parse form data (Twilio sends form-encoded data)
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

/**
 * WhatsApp Webhook Handler
 */
class WhatsAppWebhookHandler {
  /**
   * Process incoming WhatsApp message
   */
  static async processMessage(message) {
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
        return { 
          success: false, 
          response: 'Invalid command. Please use: CONFIRM, PREPARING, READY, or DELIVERED followed by order number.\n\nExample: CONFIRM CHA000113' 
        };
      }
      
      // Update order status
      const result = await this.updateOrderStatus(command.orderNumber, command.status, cafe.id);
      
      if (result.success) {
        const response = `✅ Order #${command.orderNumber} status updated to: ${command.status.toUpperCase()}\n\n🔄 Next actions:\n${this.getNextActions(command.status, command.orderNumber)}`;
        console.log('✅ WhatsApp Webhook: Order updated successfully');
        return { success: true, response };
      } else {
        console.log('❌ WhatsApp Webhook: Failed to update order');
        return { success: false, response: 'Failed to update order. Please check the order number and try again.' };
      }
      
    } catch (error) {
      console.error('❌ WhatsApp Webhook: Error processing message:', error);
      return { success: false, response: 'An error occurred. Please try again or contact support.' };
    }
  }
  
  /**
   * Find cafe by phone number
   */
  static async findCafeByPhone(phoneNumber) {
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
  static parseCommand(messageBody) {
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
  static async updateOrderStatus(orderNumber, status, cafeId) {
    try {
      // Map status to database values
      const statusMap = {
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
  
  /**
   * Get next actions based on current status
   */
  static getNextActions(currentStatus, orderNumber) {
    switch (currentStatus.toLowerCase()) {
      case 'confirm':
        return `• Reply "PREPARING ${orderNumber}" to start preparing\n• Reply "READY ${orderNumber}" when order is ready`;
      case 'preparing':
        return `• Reply "READY ${orderNumber}" when order is ready\n• Reply "DELIVERED ${orderNumber}" when delivered`;
      case 'ready':
        return `• Reply "DELIVERED ${orderNumber}" when delivered\n• Reply "CANCELLED ${orderNumber}" to cancel order`;
      case 'delivered':
        return `• Order completed! 🎉\n• Reply "CANCELLED ${orderNumber}" if there was an issue`;
      case 'cancelled':
        return `• Order cancelled ❌\n• Contact customer if needed`;
      default:
        return `• Reply "CONFIRM ${orderNumber}" to confirm order\n• Reply "PREPARING ${orderNumber}" to start preparing`;
    }
  }
}

/**
 * Webhook endpoint for Twilio
 */
app.post('/whatsapp-webhook', async (req, res) => {
  try {
    console.log('📱 Webhook received:', req.body);
    
    const message = {
      MessageSid: req.body.MessageSid,
      From: req.body.From,
      To: req.body.To,
      Body: req.body.Body,
      MessageStatus: req.body.MessageStatus
    };
    
    const result = await WhatsAppWebhookHandler.processMessage(message);
    
    // Send response back to Twilio (this will be sent as WhatsApp message)
    if (result.success) {
      res.status(200).send(`<Response><Message>${result.response}</Message></Response>`);
    } else {
      res.status(200).send(`<Response><Message>${result.response}</Message></Response>`);
    }
    
  } catch (error) {
    console.error('Webhook endpoint error:', error);
    res.status(500).send('<Response><Message>An error occurred. Please try again.</Message></Response>');
  }
});

/**
 * Health check endpoint
 */
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

/**
 * Test endpoint
 */
app.get('/test', (req, res) => {
  res.status(200).json({ 
    message: 'WhatsApp Webhook Server is running!',
    endpoints: {
      webhook: 'POST /whatsapp-webhook',
      health: 'GET /health',
      test: 'GET /test'
    }
  });
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`🚀 WhatsApp Webhook Server running on port ${PORT}`);
  console.log(`📱 Webhook endpoint: http://localhost:${PORT}/whatsapp-webhook`);
  console.log(`🏥 Health check: http://localhost:${PORT}/health`);
  console.log(`🧪 Test endpoint: http://localhost:${PORT}/test`);
});

module.exports = app;
