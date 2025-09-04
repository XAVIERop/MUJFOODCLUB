// Epson ePOS-Print Service for TM-T82 Thermal Printer
// This service handles direct communication with Epson TM-T82 printer

interface EpsonEposConfig {
  printerIP: string;
  printerPort: number;
  timeout: number;
}

interface PrintJob {
  type: 'kot' | 'customer';
  orderData: any;
  orderItems: any[];
}

class EpsonEposService {
  private config: EpsonEposConfig;
  private isConnected: boolean = false;

  constructor(config: EpsonEposConfig) {
    this.config = config;
  }

  // Initialize connection to printer
  async initialize(): Promise<boolean> {
    try {
      console.log(`Attempting to connect to Epson TM-T82 at ${this.config.printerIP}:${this.config.printerPort}`);
      
      // Try to connect to the printer via HTTP (ePOS-Print uses HTTP)
      const response = await fetch(`http://${this.config.printerIP}:${this.config.printerPort}/api/status`, {
        method: 'GET',
        timeout: 5000
      });
      
      if (response.ok) {
        this.isConnected = true;
        console.log('Epson TM-T82 connected successfully');
        return true;
      } else {
        throw new Error(`Printer responded with status: ${response.status}`);
      }
    } catch (error) {
      console.error('Failed to connect to Epson TM-T82:', error);
      console.log('Falling back to browser printing mode');
      this.isConnected = false;
      return false;
    }
  }

  // Print KOT (Kitchen Order Ticket)
  async printKOT(orderData: any, orderItems: any[]): Promise<boolean> {
    if (!this.isConnected) {
      console.error('Printer not connected');
      return false;
    }

    try {
      const currentDate = new Date();
      const dateStr = currentDate.toLocaleDateString('en-GB', { 
        day: '2-digit', 
        month: '2-digit', 
        year: '2-digit' 
      });
      const timeStr = currentDate.toLocaleTimeString('en-GB', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false 
      });

      // Build KOT receipt content
      const kotContent = this.buildKOTContent(dateStr, timeStr, orderData, orderItems);
      
      // Send to printer
      await this.sendToPrinter(kotContent);
      
      console.log('KOT printed successfully');
      return true;
    } catch (error) {
      console.error('Failed to print KOT:', error);
      return false;
    }
  }

  // Print Customer Receipt
  async printCustomerReceipt(orderData: any, orderItems: any[]): Promise<boolean> {
    if (!this.isConnected) {
      console.error('Printer not connected');
      return false;
    }

    try {
      const currentDate = new Date();
      const dateStr = currentDate.toLocaleDateString('en-GB', { 
        day: '2-digit', 
        month: '2-digit', 
        year: '2-digit' 
      });
      const timeStr = currentDate.toLocaleTimeString('en-GB', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false 
      });

      // Build customer receipt content
      const customerContent = this.buildCustomerReceiptContent(dateStr, timeStr, orderData, orderItems);
      
      // Send to printer
      await this.sendToPrinter(customerContent);
      
      console.log('Customer receipt printed successfully');
      return true;
    } catch (error) {
      console.error('Failed to print customer receipt:', error);
      return false;
    }
  }

  // Print both receipts
  async printBothReceipts(orderData: any, orderItems: any[]): Promise<boolean> {
    try {
      // Print KOT first
      const kotSuccess = await this.printKOT(orderData, orderItems);
      if (!kotSuccess) {
        return false;
      }

      // Wait a moment between prints
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Print customer receipt
      const customerSuccess = await this.printCustomerReceipt(orderData, orderItems);
      
      return kotSuccess && customerSuccess;
    } catch (error) {
      console.error('Failed to print both receipts:', error);
      return false;
    }
  }

  // Build KOT content
  private buildKOTContent(dateStr: string, timeStr: string, orderData: any, orderItems: any[]): string {
    let content = '';
    
    // Header
    content += `${dateStr} ${timeStr}\n`;
    content += `KOT - ${orderData.order_number.slice(-2)}\n`;
    content += `Pick Up\n`;
    content += `--------------------------------\n`;
    
    // Items header
    content += `Item                    Qty.\n`;
    content += `--------------------------------\n`;
    
    // Items
    orderItems.forEach(item => {
      const itemName = item.menu_item.name.padEnd(20);
      const qty = item.quantity.toString().padStart(3);
      content += `${itemName} ${qty}\n`;
    });
    
    // Footer
    content += `\n\n\n`; // Cut paper
    
    return content;
  }

  // Build customer receipt content
  private buildCustomerReceiptContent(dateStr: string, timeStr: string, orderData: any, orderItems: any[]): string {
    let content = '';
    
    // Header
    content += `The Food Court Co\n`;
    content += `(MOMO STREET, GOBBLERS, KRISPP, TATA MYBRISTO)\n`;
    content += `GSTIN: 08ADNPG4024A1Z2\n`;
    content += `--------------------------------\n`;
    
    // Customer info
    content += `Name: ${orderData.customer_name || orderData.delivery_block}\n`;
    content += `M: ${orderData.phone_number || 'N/A'}\n`;
    content += `--------------------------------\n`;
    
    // Order details
    content += `${dateStr} ${timeStr}        Pick Up\n`;
    content += `Cashier: biller    Bill No.: ${orderData.order_number}\n`;
    content += `Token No.: ${orderData.order_number.slice(-1)}\n`;
    content += `--------------------------------\n`;
    
    // Items header
    content += `Item            Qty. Price Amount\n`;
    content += `--------------------------------\n`;
    
    // Items
    orderItems.forEach(item => {
      const itemName = item.menu_item.name.padEnd(15);
      const qty = item.quantity.toString().padStart(3);
      const price = item.unit_price.toFixed(2).padStart(5);
      const amount = item.total_price.toFixed(2).padStart(6);
      content += `${itemName} ${qty} ${price} ${amount}\n`;
    });
    
    // Totals
    const subtotal = orderData.total_amount;
    const cgst = (subtotal * 0.025).toFixed(2);
    const sgst = (subtotal * 0.025).toFixed(2);
    const grandTotal = (subtotal * 1.05).toFixed(2);
    const roundOff = (parseFloat(grandTotal) - (subtotal + parseFloat(cgst) + parseFloat(sgst))).toFixed(2);
    
    content += `--------------------------------\n`;
    content += `Total Qty: ${orderItems.reduce((sum, item) => sum + item.quantity, 0)}\n`;
    content += `Sub Total:        ${subtotal.toFixed(2)}\n`;
    content += `CGST@2.5 2.5%:   ${cgst}\n`;
    content += `SGST@2.5 2.5%:   ${sgst}\n`;
    content += `Round off:        +${roundOff}\n`;
    content += `--------------------------------\n`;
    content += `Grand Total:      ₹${grandTotal}\n`;
    content += `--------------------------------\n`;
    content += `Paid via: Other [UPI]\n`;
    content += `--------------------------------\n`;
    content += `Thanks For Visit!!\n`;
    content += `\n\n\n`; // Cut paper
    
    return content;
  }

  // Send content to printer
  private async sendToPrinter(content: string): Promise<void> {
    try {
      console.log('Sending to Epson TM-T82:');
      console.log(content);
      
      // Send print job to ePOS-Print via HTTP
      const printData = {
        method: 'addText',
        params: [content]
      };
      
      const response = await fetch(`http://${this.config.printerIP}:${this.config.printerPort}/api/print`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(printData)
      });
      
      if (!response.ok) {
        throw new Error(`Print job failed: ${response.status}`);
      }
      
      console.log('Print job sent successfully');
      
      // Send cut command
      const cutData = {
        method: 'addCut',
        params: []
      };
      
      await fetch(`http://${this.config.printerIP}:${this.config.printerPort}/api/print`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(cutData)
      });
      
    } catch (error) {
      console.error('Failed to send print job:', error);
      throw error;
    }
  }

  // Disconnect from printer
  async disconnect(): Promise<void> {
    this.isConnected = false;
    console.log('Disconnected from Epson TM-T82');
  }

  // Get connection status
  getConnectionStatus(): boolean {
    return this.isConnected;
  }
}

// Export singleton instance
export const epsonEposService = new EpsonEposService({
  printerIP: '192.168.1.100', // Replace with your printer's IP (check printer settings)
  printerPort: 8008, // Default ePOS-Print port
  timeout: 10000
});

export default EpsonEposService;
