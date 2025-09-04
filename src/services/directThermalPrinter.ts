// Direct Thermal Printer Service - Bypasses browser completely
// Uses system printing APIs to send directly to printer

interface PrintJob {
  type: 'kot' | 'customer';
  orderData: any;
  orderItems: any[];
}

class DirectThermalPrinterService {
  private isConnected: boolean = false;

  constructor() {
    this.initialize();
  }

  private async initialize(): Promise<void> {
    // Check if we can access system printing
    try {
      if (navigator && 'serviceWorker' in navigator) {
        this.isConnected = true;
        console.log('Direct thermal printer service initialized');
      }
    } catch (error) {
      console.error('Direct thermal printer initialization failed:', error);
    }
  }

  // Print using system printer without browser dialog
  async printReceipt(job: PrintJob): Promise<boolean> {
    try {
      // Generate ESC/POS commands for direct thermal printing
      const escPosCommands = this.generateESCPOSCommands(job);
      
      // Try multiple methods to print directly
      return await this.printDirectly(escPosCommands);
    } catch (error) {
      console.error('Direct thermal print failed:', error);
      return false;
    }
  }

  // Generate ESC/POS commands for thermal printer
  private generateESCPOSCommands(job: PrintJob): string {
    const { orderData, orderItems } = job;
    const isFoodCourt = orderData.cafe_id === '3e5955ba-9b90-48ce-9d07-cc686678a10e';
    
    let commands = '';
    
    // Initialize printer
    commands += '\x1B\x40'; // ESC @ - Initialize printer
    
    if (job.type === 'kot') {
      commands += this.generateKOTCommands(orderData, orderItems, isFoodCourt);
    } else {
      commands += this.generateCustomerReceiptCommands(orderData, orderItems, isFoodCourt);
    }
    
    // Cut paper
    commands += '\n\n\n';
    commands += '\x1D\x56\x00'; // GS V 0 - Full cut
    
    return commands;
  }

  // Generate KOT ESC/POS commands
  private generateKOTCommands(orderData: any, orderItems: any[], isFoodCourt: boolean): string {
    const date = new Date(orderData.created_at);
    const dateStr = date.toLocaleDateString();
    const timeStr = date.toLocaleTimeString();

    let commands = '';
    
    // Center align header
    commands += '\x1B\x61\x01'; // ESC a 1 - Center align
    commands += '\x1B\x45\x01'; // ESC E 1 - Bold on
    commands += `${isFoodCourt ? 'THE FOOD COURT CO' : 'MUJ FOOD CLUB'}\n`;
    commands += 'KITCHEN ORDER TICKET\n';
    commands += '========================\n';
    
    // Left align content
    commands += '\x1B\x61\x00'; // ESC a 0 - Left align
    commands += '\x1B\x45\x00'; // ESC E 0 - Bold off
    
    // Order info
    commands += `Order #: ${orderData.order_number}\n`;
    commands += `Date: ${dateStr}\n`;
    commands += `Time: ${timeStr}\n`;
    commands += `Customer: ${orderData.user?.full_name || 'Walk-in'}\n`;
    commands += '========================\n';
    
    // Items
    commands += 'Item\t\tQty\n';
    commands += '------------------------\n';
    
    orderItems.forEach(item => {
      const itemName = item.menu_item.name.length > 20 ? 
        item.menu_item.name.substring(0, 17) + '...' : 
        item.menu_item.name;
      commands += `${itemName}\t\t${item.quantity}\n`;
    });
    
    commands += '------------------------\n';
    commands += `Total Items: ${orderItems.reduce((sum, item) => sum + item.quantity, 0)}\n`;
    commands += `Total: ₹${orderData.total_amount}\n`;
    
    return commands;
  }

  // Generate Customer Receipt ESC/POS commands
  private generateCustomerReceiptCommands(orderData: any, orderItems: any[], isFoodCourt: boolean): string {
    const date = new Date(orderData.created_at);
    const dateStr = date.toLocaleDateString();
    const timeStr = date.toLocaleTimeString();

    let commands = '';
    
    // Center align header
    commands += '\x1B\x61\x01'; // ESC a 1 - Center align
    commands += '\x1B\x45\x01'; // ESC E 1 - Bold on
    
    if (isFoodCourt) {
      // Food Court Receipt
      commands += 'The Food Court Co\n';
      commands += '(MOMO STREET, GOBBLERS, KRISPP, TATA MYBRISTO)\n';
      commands += 'GSTIN: 08ADNPG4024A1Z2\n';
      commands += '========================\n';
      
      // Left align content
      commands += '\x1B\x61\x00'; // ESC a 0 - Left align
      commands += '\x1B\x45\x00'; // ESC E 0 - Bold off
      
      commands += `Name: ${orderData.user?.full_name || 'Walk-in Customer'}\n`;
      commands += `Phone: ${orderData.user?.phone || orderData.phone_number || 'N/A'}\n`;
      commands += `Date: ${dateStr}\n`;
      commands += `Time: ${timeStr}\n`;
      commands += `Bill No.: ${orderData.order_number.replace(/[^\d]/g, '')}\n`;
      commands += `Token No.: ${Math.floor(Math.random() * 10) + 1}\n`;
      commands += '========================\n';
      
      // Items
      commands += 'Item\t\tQty\tPrice\tAmount\n';
      commands += '------------------------\n';
      
      orderItems.forEach(item => {
        const itemName = item.menu_item.name.length > 15 ? 
          item.menu_item.name.substring(0, 12) + '...' : 
          item.menu_item.name;
        commands += `${itemName}\t\t${item.quantity}\t${item.unit_price}\t${item.total_price}\n`;
      });
      
      commands += '------------------------\n';
      commands += `Total Qty: ${orderItems.reduce((sum, item) => sum + item.quantity, 0)}\n`;
      commands += `Sub Total: ₹${orderData.subtotal}\n`;
      commands += `CGST@2.5%: ₹${(orderData.tax_amount / 2).toFixed(2)}\n`;
      commands += `SGST@2.5%: ₹${(orderData.tax_amount / 2).toFixed(2)}\n`;
      commands += `Grand Total: ₹${orderData.total_amount}\n`;
      commands += '========================\n';
      commands += 'Paid via: UPI\n';
      commands += 'Thanks For Visit!!\n';
      
    } else {
      // MUJ Food Club Receipt
      commands += 'MUJ FOOD CLUB\n';
      commands += 'Delicious Food, Great Service\n';
      commands += 'www.mujfoodclub.in\n';
      commands += '========================\n';
      
      // Left align content
      commands += '\x1B\x61\x00'; // ESC a 0 - Left align
      commands += '\x1B\x45\x00'; // ESC E 0 - Bold off
      
      commands += `Receipt #: ${orderData.order_number}\n`;
      commands += `Date: ${dateStr}\n`;
      commands += `Time: ${timeStr}\n`;
      commands += `Customer: ${orderData.user?.full_name || 'Walk-in Customer'}\n`;
      commands += `Phone: ${orderData.user?.phone || orderData.phone_number || 'N/A'}\n`;
      commands += `Block: ${orderData.user?.block || orderData.delivery_block || 'N/A'}\n`;
      commands += '========================\n';
      
      // Items
      commands += 'Item\t\tQty × Price\tTotal\n';
      commands += '------------------------\n';
      
      orderItems.forEach(item => {
        const itemName = item.menu_item.name.length > 15 ? 
          item.menu_item.name.substring(0, 12) + '...' : 
          item.menu_item.name;
        commands += `${itemName}\t\t${item.quantity} × ₹${item.unit_price}\t₹${item.total_price}\n`;
      });
      
      commands += '------------------------\n';
      commands += `Subtotal: ₹${orderData.subtotal}\n`;
      commands += `Tax (5%): ₹${orderData.tax_amount}\n`;
      commands += `TOTAL: ₹${orderData.total_amount}\n`;
      commands += '========================\n';
      commands += 'Thank you for your order!\n';
      commands += 'Please collect your receipt\n';
      commands += 'For support: support@mujfoodclub.in\n';
    }
    
    return commands;
  }

  // Try multiple methods to print directly
  private async printDirectly(commands: string): Promise<boolean> {
    try {
      // Method 1: Try Web Serial API (if available)
      if ('serial' in navigator) {
        return await this.printViaWebSerial(commands);
      }
      
      // Method 2: Try WebUSB API (if available)
      if ('usb' in navigator) {
        return await this.printViaWebUSB(commands);
      }
      
      // Method 3: Try direct file download (user can print manually)
      return await this.downloadPrintFile(commands);
      
    } catch (error) {
      console.error('All direct print methods failed:', error);
      return false;
    }
  }

  // Print via Web Serial API
  private async printViaWebSerial(commands: string): Promise<boolean> {
    try {
      const port = await (navigator as any).serial.requestPort();
      await port.open({ baudRate: 9600 });
      
      const writer = port.writable.getWriter();
      const encoder = new TextEncoder();
      await writer.write(encoder.encode(commands));
      writer.releaseLock();
      
      await port.close();
      return true;
    } catch (error) {
      console.error('Web Serial print failed:', error);
      return false;
    }
  }

  // Print via WebUSB API
  private async printViaWebUSB(commands: string): Promise<boolean> {
    try {
      const device = await (navigator as any).usb.requestDevice({
        filters: [{ vendorId: 0x04b8 }] // Epson vendor ID
      });
      
      await device.open();
      await device.selectConfiguration(1);
      await device.claimInterface(0);
      
      const encoder = new TextEncoder();
      const data = encoder.encode(commands);
      
      await device.transferOut(1, data);
      await device.close();
      
      return true;
    } catch (error) {
      console.error('WebUSB print failed:', error);
      return false;
    }
  }

  // Download print file for manual printing
  private async downloadPrintFile(commands: string): Promise<boolean> {
    try {
      const blob = new Blob([commands], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `receipt_${Date.now()}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      URL.revokeObjectURL(url);
      
      // Show instruction to user
      alert('Receipt file downloaded! Please:\n1. Open the downloaded file\n2. Print it to your Epson TM-T82 printer\n3. Make sure to select "Raw" or "Text" mode');
      
      return true;
    } catch (error) {
      console.error('Download print file failed:', error);
      return false;
    }
  }

  getConnectionStatus(): boolean {
    return this.isConnected;
  }
}

export const directThermalPrinterService = new DirectThermalPrinterService();
export default directThermalPrinterService;
