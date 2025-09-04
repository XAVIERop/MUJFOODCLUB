// PrintNode Service for Thermal Printer Integration
// Handles thermal printing with proper page sizing

interface PrintNodeConfig {
  apiKey: string;
  printerId: string;
  baseUrl: string;
}

interface PrintJob {
  type: 'kot' | 'customer';
  orderData: any;
  orderItems: any[];
}

class PrintNodeService {
  private config: PrintNodeConfig;
  private isConnected: boolean = false;

  constructor() {
    this.config = {
      apiKey: '', // Will be set by user
      printerId: '', // Will be set by user
      baseUrl: 'https://api.printnode.com'
    };
  }

  // Set configuration
  setConfig(apiKey: string, printerId: string) {
    this.config.apiKey = apiKey;
    this.config.printerId = printerId;
  }

  // Test connection
  async testConnection(): Promise<boolean> {
    try {
      const response = await fetch(`${this.config.baseUrl}/printers`, {
        headers: {
          'Authorization': `Basic ${btoa(this.config.apiKey + ':')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        this.isConnected = true;
        return true;
      }
      return false;
    } catch (error) {
      console.error('PrintNode connection test failed:', error);
      return false;
    }
  }

  // Print receipt
  async printReceipt(job: PrintJob): Promise<boolean> {
    try {
      const receiptText = this.generateReceiptText(job);
      
      const printJob = {
        printer: this.config.printerId,
        title: `${job.type.toUpperCase()} - ${job.orderData.order_number}`,
        content: receiptText,
        contentType: 'raw_base64',
        source: 'muj-food-club-pos'
      };

      const response = await fetch(`${this.config.baseUrl}/printjobs`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${btoa(this.config.apiKey + ':')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(printJob)
      });

      return response.ok;
    } catch (error) {
      console.error('PrintNode print failed:', error);
      return false;
    }
  }

  // Generate compact receipt text
  private generateReceiptText(job: PrintJob): string {
    const { orderData, orderItems } = job;
    const isFoodCourt = orderData.cafe_id === '3e5955ba-9b90-48ce-9d07-cc686678a10e';
    
    if (job.type === 'kot') {
      return this.generateKOTText(orderData, orderItems, isFoodCourt);
    } else {
      return this.generateCustomerReceiptText(orderData, orderItems, isFoodCourt);
    }
  }

  // Generate KOT Text - Ultra compact
  private generateKOTText(orderData: any, orderItems: any[], isFoodCourt: boolean): string {
    const date = new Date(orderData.created_at);
    const dateStr = date.toLocaleDateString();
    const timeStr = date.toLocaleTimeString();

    let text = '';
    
    // ESC/POS commands for thermal printer
    text += '\x1B\x40'; // Initialize printer
    text += '\x1B\x61\x01'; // Center align
    
    // Header
    text += `${isFoodCourt ? 'THE FOOD COURT CO' : 'MUJ FOOD CLUB'}\n`;
    text += 'KITCHEN ORDER TICKET\n';
    text += '========================\n';
    
    text += '\x1B\x61\x00'; // Left align
    
    // Order info
    text += `Order #: ${orderData.order_number}\n`;
    text += `Date: ${dateStr}\n`;
    text += `Time: ${timeStr}\n`;
    text += `Customer: ${orderData.user?.full_name || 'Walk-in'}\n`;
    text += '========================\n';
    
    // Items
    text += 'Item\t\tQty\n';
    text += '------------------------\n';
    
    orderItems.forEach(item => {
      const itemName = item.menu_item.name.length > 20 ? 
        item.menu_item.name.substring(0, 17) + '...' : 
        item.menu_item.name;
      text += `${itemName}\t\t${item.quantity}\n`;
    });
    
    text += '------------------------\n';
    text += `Total Items: ${orderItems.reduce((sum, item) => sum + item.quantity, 0)}\n`;
    text += `Total: ₹${orderData.total_amount}\n`;
    
    // Cut paper
    text += '\n\n\n';
    text += '\x1D\x56\x00'; // Full cut
    
    return btoa(text);
  }

  // Generate Customer Receipt Text - Ultra compact
  private generateCustomerReceiptText(orderData: any, orderItems: any[], isFoodCourt: boolean): string {
    const date = new Date(orderData.created_at);
    const dateStr = date.toLocaleDateString();
    const timeStr = date.toLocaleTimeString();

    let text = '';
    
    // ESC/POS commands for thermal printer
    text += '\x1B\x40'; // Initialize printer
    text += '\x1B\x61\x01'; // Center align
    
    if (isFoodCourt) {
      // Food Court Receipt
      text += 'The Food Court Co\n';
      text += '(MOMO STREET, GOBBLERS, KRISPP, TATA MYBRISTO)\n';
      text += 'GSTIN: 08ADNPG4024A1Z2\n';
      text += '========================\n';
      
      text += '\x1B\x61\x00'; // Left align
      
      text += `Name: ${orderData.user?.full_name || 'Walk-in Customer'}\n`;
      text += `Phone: ${orderData.user?.phone || orderData.phone_number || 'N/A'}\n`;
      text += `Date: ${dateStr}\n`;
      text += `Time: ${timeStr}\n`;
      text += `Bill No.: ${orderData.order_number.replace(/[^\d]/g, '')}\n`;
      text += `Token No.: ${Math.floor(Math.random() * 10) + 1}\n`;
      text += '========================\n';
      
      // Items
      text += 'Item\t\tQty\tPrice\tAmount\n';
      text += '------------------------\n';
      
      orderItems.forEach(item => {
        const itemName = item.menu_item.name.length > 15 ? 
          item.menu_item.name.substring(0, 12) + '...' : 
          item.menu_item.name;
        text += `${itemName}\t\t${item.quantity}\t${item.unit_price}\t${item.total_price}\n`;
      });
      
      text += '------------------------\n';
      text += `Total Qty: ${orderItems.reduce((sum, item) => sum + item.quantity, 0)}\n`;
      text += `Sub Total: ₹${orderData.subtotal}\n`;
      text += `CGST@2.5%: ₹${(orderData.tax_amount / 2).toFixed(2)}\n`;
      text += `SGST@2.5%: ₹${(orderData.tax_amount / 2).toFixed(2)}\n`;
      text += `Grand Total: ₹${orderData.total_amount}\n`;
      text += '========================\n';
      text += 'Paid via: UPI\n';
      text += 'Thanks For Visit!!\n';
      
    } else {
      // MUJ Food Club Receipt
      text += 'MUJ FOOD CLUB\n';
      text += 'Delicious Food, Great Service\n';
      text += 'www.mujfoodclub.in\n';
      text += '========================\n';
      
      text += '\x1B\x61\x00'; // Left align
      
      text += `Receipt #: ${orderData.order_number}\n`;
      text += `Date: ${dateStr}\n`;
      text += `Time: ${timeStr}\n`;
      text += `Customer: ${orderData.user?.full_name || 'Walk-in Customer'}\n`;
      text += `Phone: ${orderData.user?.phone || orderData.phone_number || 'N/A'}\n`;
      text += `Block: ${orderData.user?.block || orderData.delivery_block || 'N/A'}\n`;
      text += '========================\n';
      
      // Items
      text += 'Item\t\tQty × Price\tTotal\n';
      text += '------------------------\n';
      
      orderItems.forEach(item => {
        const itemName = item.menu_item.name.length > 15 ? 
          item.menu_item.name.substring(0, 12) + '...' : 
          item.menu_item.name;
        text += `${itemName}\t\t${item.quantity} × ₹${item.unit_price}\t₹${item.total_price}\n`;
      });
      
      text += '------------------------\n';
      text += `Subtotal: ₹${orderData.subtotal}\n`;
      text += `Tax (5%): ₹${orderData.tax_amount}\n`;
      text += `TOTAL: ₹${orderData.total_amount}\n`;
      text += '========================\n';
      text += 'Thank you for your order!\n';
      text += 'Please collect your receipt\n';
      text += 'For support: support@mujfoodclub.in\n';
    }
    
    // Cut paper
    text += '\n\n\n';
    text += '\x1D\x56\x00'; // Full cut
    
    return btoa(text);
  }

  getConnectionStatus(): boolean {
    return this.isConnected;
  }
}

export const printNodeService = new PrintNodeService();
export default printNodeService;
