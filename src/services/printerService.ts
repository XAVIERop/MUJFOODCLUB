// Universal Printer Service for Epson TM-T82
// Supports both USB/Serial and Network connections

interface PrinterConfig {
  connectionType: 'usb' | 'network';
  printerIP?: string;
  printerPort?: number;
  comPort?: string;
  baudRate?: number;
}

interface PrintJob {
  type: 'kot' | 'customer';
  orderData: any;
  orderItems: any[];
}

class PrinterService {
  private config: PrinterConfig;
  private isConnected: boolean = false;

  constructor(config: PrinterConfig) {
    this.config = config;
  }

  // Initialize connection based on type
  async initialize(): Promise<boolean> {
    try {
      if (this.config.connectionType === 'usb') {
        return await this.initializeUSB();
      } else {
        return await this.initializeNetwork();
      }
    } catch (error) {
      console.error('Printer initialization failed:', error);
      return false;
    }
  }

  // USB/Serial connection
  private async initializeUSB(): Promise<boolean> {
    try {
      // For USB connections, we'll use browser printing as the primary method
      // since Web Serial API requires user permission and may not be available
      console.log('Initializing USB connection - using browser printing method');
      this.isConnected = true;
      return true;
    } catch (error) {
      console.error('USB connection failed:', error);
      return false;
    }
  }

  // Network connection
  private async initializeNetwork(): Promise<boolean> {
    try {
      const response = await fetch(`http://${this.config.printerIP}:${this.config.printerPort}/api/status`, {
        method: 'GET',
        timeout: 5000
      });
      
      if (response.ok) {
        this.isConnected = true;
        return true;
      }
      return false;
    } catch (error) {
      console.error('Network connection failed:', error);
      return false;
    }
  }

  // Print receipt
  async printReceipt(job: PrintJob): Promise<boolean> {
    try {
      if (this.config.connectionType === 'usb') {
        return await this.printViaUSB(job);
      } else {
        return await this.printViaNetwork(job);
      }
    } catch (error) {
      console.error('Print failed:', error);
      return false;
    }
  }

  // USB printing
  private async printViaUSB(job: PrintJob): Promise<boolean> {
    try {
      // Generate receipt HTML
      const receiptHTML = this.generateReceiptHTML(job);
      
      // Open in new window and print
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(receiptHTML);
        printWindow.document.close();
        printWindow.focus();
        
        // Wait for content to load then print
        setTimeout(() => {
          printWindow.print();
          printWindow.close();
        }, 500);
        
        return true;
      }
      return false;
    } catch (error) {
      console.error('USB print failed:', error);
      return false;
    }
  }

  // Network printing
  private async printViaNetwork(job: PrintJob): Promise<boolean> {
    try {
      const receiptText = this.generateReceiptText(job);
      
      const response = await fetch(`http://${this.config.printerIP}:${this.config.printerPort}/api/print`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: receiptText,
          cut: true
        })
      });
      
      return response.ok;
    } catch (error) {
      console.error('Network print failed:', error);
      return false;
    }
  }

  // Generate receipt HTML for browser printing
  private generateReceiptHTML(job: PrintJob): string {
    const { orderData, orderItems } = job;
    const cafeName = orderData.cafe?.name || orderData.cafe_name || '';
    const isFoodCourt = cafeName.toLowerCase().includes('food court');
    const isChatkara = cafeName.toLowerCase().includes('chatkara');
    
    if (job.type === 'kot') {
      return this.generateKOTHTML(orderData, orderItems, isFoodCourt, isChatkara);
    } else {
      return this.generateCustomerReceiptHTML(orderData, orderItems, isFoodCourt, isChatkara);
    }
  }

  // Generate receipt text for network printing
  private generateReceiptText(job: PrintJob): string {
    const { orderData, orderItems } = job;
    const cafeName = orderData.cafe?.name || orderData.cafe_name || '';
    const isFoodCourt = cafeName.toLowerCase().includes('food court');
    const isChatkara = cafeName.toLowerCase().includes('chatkara');
    
    if (job.type === 'kot') {
      return this.generateKOTText(orderData, orderItems, isFoodCourt, isChatkara);
    } else {
      return this.generateCustomerReceiptText(orderData, orderItems, isFoodCourt, isChatkara);
    }
  }

  // Generate KOT HTML
  private generateKOTHTML(orderData: any, orderItems: any[], isFoodCourt: boolean, isChatkara: boolean): string {
    const date = new Date(orderData.created_at);
    const dateStr = date.toLocaleDateString();
    const timeStr = date.toLocaleTimeString();

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <title>KOT Receipt</title>
          <style>
            @page { margin: 0; size: 80mm auto; }
            body { 
              font-family: 'Courier New', monospace; 
              font-size: 12px; 
              margin: 0; 
              padding: 10px; 
              font-weight: bold !important;
            }
            .header { text-align: center; margin-bottom: 10px; }
            .logo { font-size: 16px; font-weight: bold; }
            .subtitle { font-size: 10px; }
            .order-info { margin-bottom: 10px; }
            .info-row { display: flex; justify-content: space-between; margin-bottom: 2px; }
            .items-section { margin-bottom: 10px; }
            .item-row { display: flex; justify-content: space-between; margin-bottom: 2px; }
            .item-name { flex: 2; }
            .item-details { flex: 1; text-align: right; }
            .total-section { border-top: 1px solid #000; padding-top: 5px; }
            .footer { text-align: center; margin-top: 10px; font-size: 10px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo">${isFoodCourt ? 'THE FOOD COURT CO' : isChatkara ? 'CHATKARA' : 'MUJ FOOD CLUB'}</div>
            <div class="subtitle">KITCHEN ORDER TICKET</div>
          </div>
          
          <div class="order-info">
            <div class="info-row">
              <span>KOT #:</span>
              <span>${orderData.order_number}</span>
            </div>
            <div class="info-row">
              <span>Date:</span>
              <span>${dateStr}</span>
            </div>
            <div class="info-row">
              <span>Time:</span>
              <span>${timeStr}</span>
            </div>
            <div class="info-row">
              <span>Customer:</span>
              <span>${orderData.user?.full_name || 'Walk-in'}</span>
            </div>
          </div>
          
          <div class="items-section">
            <div class="info-row" style="font-weight: bold; margin-bottom: 8px;">
              <span>Item</span>
              <span>Qty</span>
            </div>
            ${orderItems.map(item => {
              const itemName = item.menu_item.name.length > 25 ? item.menu_item.name.substring(0, 25) + '...' : item.menu_item.name;
              return `
              <div class="item-row" style="display: flex; align-items: flex-start;">
                <div class="item-name" style="font-size: 17.5px; font-weight: bold; flex: 1; word-wrap: break-word; line-height: 1.2;">${itemName}</div>
                <div class="item-details" style="font-size: 16px; font-weight: bold; margin-left: 10px; min-width: 30px; text-align: right;">${item.quantity}</div>
              </div>
            `;
            }).join('')}
          </div>
          
          <div class="footer">
            <div>Total Items: ${orderItems.reduce((sum, item) => sum + item.quantity, 0)}</div>
            <div>Total Amount: ${isChatkara ? 'rs' + orderData.total_amount.toFixed(2) : '₹' + orderData.total_amount}</div>
            ${isChatkara ? '<div style="margin-top: 5px; font-weight: bold;">Thanks</div>' : ''}
          </div>
        </body>
      </html>
    `;
  }

  // Generate Customer Receipt HTML
  private generateCustomerReceiptHTML(orderData: any, orderItems: any[], isFoodCourt: boolean, isChatkara: boolean): string {
    const date = new Date(orderData.created_at);
    const dateStr = date.toLocaleDateString();
    const timeStr = date.toLocaleTimeString();

    if (isFoodCourt) {
      return `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Customer Receipt</title>
            <style>
              @page { margin: 0; size: 80mm auto; }
              body { 
                font-family: 'Courier New', monospace; 
                font-size: 12px; 
                margin: 0; 
                padding: 10px; 
                font-weight: bold !important;
              }
              .header { text-align: center; margin-bottom: 10px; }
              .logo { font-size: 16px; font-weight: bold; }
              .subtitle { font-size: 10px; }
              .order-info { margin-bottom: 10px; }
              .info-row { display: flex; justify-content: space-between; margin-bottom: 2px; }
              .items-section { margin-bottom: 10px; }
              .item-row { display: flex; justify-content: space-between; margin-bottom: 2px; }
              .item-name { flex: 2; }
              .item-details { flex: 1; text-align: right; }
              .total-section { border-top: 1px solid #000; padding-top: 5px; }
              .footer { text-align: center; margin-top: 10px; font-size: 10px; }
            </style>
          </head>
          <body>
            <div class="header">
              <div class="logo">The Food Court Co</div>
              <div class="subtitle">(MOMO STREET, GOBBLERS, KRISPP, TATA MYBRISTO)</div>
              <div class="subtitle">GSTIN: 08ADNPG4024A1Z2</div>
            </div>
            
            <div class="order-info">
              <div class="info-row">
                <span>Name:</span>
                <span>${orderData.user?.full_name || 'Walk-in Customer'} (M: ${orderData.user?.phone || orderData.phone_number || 'N/A'})</span>
              </div>
              <div class="info-row">
                <span>Date:</span>
                <span>${dateStr}</span>
              </div>
              <div class="info-row">
                <span>Time:</span>
                <span>${timeStr}</span>
              </div>
              <div class="info-row">
                <span>Order Type:</span>
                <span>Pick Up</span>
              </div>
              <div class="info-row">
                <span>Cashier:</span>
                <span>biller</span>
              </div>
              <div class="info-row">
                <span>Bill No.:</span>
                <span>${orderData.order_number.replace(/[^\d]/g, '')}</span>
              </div>
              <div class="info-row">
                <span>Token No.:</span>
                <span>${Math.floor(Math.random() * 10) + 1}</span>
              </div>
            </div>
            
            <div class="items-section">
              <div class="info-row" style="font-weight: bold; margin-bottom: 8px;">
                <span>Item</span>
                <span>Qty.</span>
                <span>Price</span>
                <span>Amount</span>
              </div>
              ${orderItems.map(item => `
                <div class="item-row">
                  <div class="item-name">${item.menu_item.name}</div>
                  <div class="item-details">${item.quantity}</div>
                  <div class="item-details">${item.unit_price}.00</div>
                  <div class="item-details">${item.total_price}.00</div>
                </div>
              `).join('')}
            </div>
            
            <div class="total-section">
              <div class="info-row">
                <span>Total Qty:</span>
                <span>${orderItems.reduce((sum, item) => sum + item.quantity, 0)}</span>
              </div>
              <div class="info-row">
                <span>Sub Total:</span>
                <span>${orderData.subtotal}.00</span>
              </div>
              <div class="info-row">
                <span>CGST@2.5 2.5%:</span>
                <span>${(orderData.tax_amount / 2).toFixed(2)}</span>
              </div>
              <div class="info-row">
                <span>SGST@2.5 2.5%:</span>
                <span>${(orderData.tax_amount / 2).toFixed(2)}</span>
              </div>
              <div class="info-row">
                <span>Round off:</span>
                <span>+0.04</span>
              </div>
              <div class="info-row" style="font-size: 16px; margin-top: 8px;">
                <span>Grand Total:</span>
                <span>₹${orderData.total_amount}.00</span>
              </div>
            </div>
            
            <div class="footer">
              <div>Paid via: Other [UPI]</div>
              <div style="margin-top: 10px;">Thanks For Visit!!</div>
            </div>
          </body>
        </html>
      `;
    } else if (isChatkara) {
      return `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Customer Receipt</title>
            <style>
              @page { margin: 0; size: 80mm auto; }
              body { 
                font-family: 'Courier New', monospace; 
                font-size: 12px; 
                margin: 0; 
                padding: 10px; 
                font-weight: bold !important;
              }
              .header { text-align: center; margin-bottom: 10px; }
              .logo { font-size: 16px; font-weight: bold; }
              .subtitle { font-size: 10px; }
              .order-info { margin-bottom: 10px; }
              .info-row { display: flex; justify-content: space-between; margin-bottom: 2px; }
              .items-section { margin-bottom: 10px; }
              .item-row { display: flex; justify-content: space-between; margin-bottom: 2px; }
              .item-name { flex: 2; font-size: 14px; font-weight: bold; }
              .item-details { flex: 1; text-align: right; }
              .total-section { border-top: 1px solid #000; padding-top: 5px; }
              .footer { text-align: center; margin-top: 10px; font-size: 10px; }
            </style>
          </head>
          <body>
            <div class="header">
              <div class="logo">CHATKARA</div>
              <div class="subtitle" style="font-size: 16px; font-weight: bold;">${orderData.user?.phone || orderData.phone_number || 'N/A'} ${orderData.user?.block || orderData.delivery_block || 'N/A'}</div>
              <div class="subtitle" style="font-size: 16px; font-weight: bold;">Token No.: ${orderData.order_number}</div>
            </div>
            
            <div class="order-info">
              <div class="info-row">
                <span>Name:</span>
                <span>${orderData.user?.full_name || orderData.customer_name || 'Customer'}</span>
              </div>
              <div class="info-row">
                <span>Date:</span>
                <span>${dateStr} ${timeStr}</span>
              </div>
              <div class="info-row">
                <span>Delivery</span>
                <span>Cashier: biller</span>
              </div>
              <div class="info-row">
                <span>Bill No.:</span>
                <span>${orderData.order_number.replace(/[^\d]/g, '')}</span>
              </div>
            </div>
            
            <div class="items-section">
              <div class="info-row" style="font-weight: bold; margin-bottom: 8px;">
                <span>Item</span>
                <span>Qty.</span>
                <span>Price</span>
                <span>Amount</span>
              </div>
              ${orderItems.map(item => `
                <div class="item-row">
                  <div class="item-name" style="font-weight: bold; font-size: 16px;">${item.menu_item.name}</div>
                  <div class="item-details" style="font-weight: bold;">${item.quantity}</div>
                  <div class="item-details" style="font-weight: bold;">${item.unit_price.toFixed(0)}</div>
                  <div class="item-details" style="font-weight: bold;">${item.total_price.toFixed(0)}</div>
                </div>
              `).join('')}
            </div>
            
            <div class="total-section">
              <div class="info-row" style="font-weight: bold;">
                <span>Total Qty:</span>
                <span>${orderItems.reduce((sum, item) => sum + item.quantity, 0)}</span>
              </div>
              <div class="info-row" style="font-weight: bold;">
                <span>Sub Total:</span>
                <span>${orderData.subtotal.toFixed(0)}</span>
              </div>
              <div class="info-row" style="font-weight: bold;">
                <span>Delivery Charge:</span>
                <span>+10</span>
              </div>
              <div class="info-row" style="font-weight: bold;">
                <span>MUJ Food Club Discount:</span>
                <span>-${(orderData.subtotal * 0.10).toFixed(0)}</span>
              </div>
              <div class="info-row" style="font-size: 16px; margin-top: 8px; font-weight: bold;">
                <span>Grand Total:</span>
                <span>${(orderData.subtotal + 10 - orderData.subtotal * 0.10).toFixed(0)}rs</span>
              </div>
            </div>
            
            <div class="footer">
              <div style="font-weight: bold;">Thanks Order Again</div>
              <div style="font-weight: bold;">mujfoodclub.in</div>
            </div>
          </body>
        </html>
      `;
    } else {
      return `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Customer Receipt</title>
            <style>
              @page { margin: 0; size: 80mm auto; }
              body { 
                font-family: 'Courier New', monospace; 
                font-size: 12px; 
                margin: 0; 
                padding: 10px; 
                font-weight: bold !important;
              }
              .header { text-align: center; margin-bottom: 10px; }
              .logo { font-size: 16px; font-weight: bold; }
              .subtitle { font-size: 10px; }
              .order-info { margin-bottom: 10px; }
              .info-row { display: flex; justify-content: space-between; margin-bottom: 2px; }
              .items-section { margin-bottom: 10px; }
              .item-row { display: flex; justify-content: space-between; margin-bottom: 2px; }
              .item-name { flex: 2; }
              .item-details { flex: 1; text-align: right; }
              .total-section { border-top: 1px solid #000; padding-top: 5px; }
              .footer { text-align: center; margin-top: 10px; font-size: 10px; }
            </style>
          </head>
          <body>
            <div class="header">
              <div class="logo">MUJ FOOD CLUB</div>
              <div class="subtitle">Delicious Food, Great Service</div>
              <div class="subtitle">www.mujfoodclub.in</div>
            </div>
            
            <div class="order-info">
              <div class="info-row">
                <span>Receipt #:</span>
                <span>${orderData.order_number}</span>
              </div>
              <div class="info-row">
                <span>Date:</span>
                <span>${dateStr}</span>
              </div>
              <div class="info-row">
                <span>Time:</span>
                <span>${timeStr}</span>
              </div>
              <div class="info-row">
                <span>Customer:</span>
                <span>${orderData.user?.full_name || 'Walk-in Customer'}</span>
              </div>
              <div class="info-row">
                <span>Phone:</span>
                <span>${orderData.user?.phone || orderData.phone_number || 'N/A'}</span>
              </div>
              <div class="info-row">
                <span>Block:</span>
                <span>${orderData.user?.block || orderData.delivery_block || 'N/A'}</span>
              </div>
            </div>
            
            <div class="items-section">
              <div class="info-row" style="font-weight: bold; margin-bottom: 8px;">
                <span>Item</span>
                <span>Qty × Price</span>
                <span>Total</span>
              </div>
              ${orderItems.map(item => `
                <div class="item-row">
                  <div class="item-name">${item.menu_item.name}</div>
                  <div class="item-details">${item.quantity} × ₹${item.unit_price}</div>
                  <div class="item-details">₹${item.total_price}</div>
                </div>
              `).join('')}
            </div>
            
            <div class="total-section">
              <div class="info-row">
                <span>Subtotal:</span>
                <span>₹${orderData.subtotal}</span>
              </div>
              <div class="info-row">
                <span>Tax (5%):</span>
                <span>₹${orderData.tax_amount}</span>
              </div>
              <div class="info-row" style="font-size: 16px; margin-top: 8px;">
                <span>TOTAL:</span>
                <span>₹${orderData.total_amount}</span>
              </div>
            </div>
            
            <div class="footer">
              <div>Thank you for your order!</div>
              <div>Please collect your receipt</div>
              <div>For support: support@mujfoodclub.in</div>
            </div>
          </body>
        </html>
      `;
    }
  }

  // Generate KOT Text (for network printing)
  private generateKOTText(orderData: any, orderItems: any[], isFoodCourt: boolean, isChatkara: boolean): string {
    const date = new Date(orderData.created_at);
    const dateStr = date.toLocaleDateString();
    const timeStr = date.toLocaleTimeString();

    let text = `${isFoodCourt ? 'THE FOOD COURT CO' : isChatkara ? 'CHATKARA' : 'MUJ FOOD CLUB'}\n`;
    text += `KITCHEN ORDER TICKET\n`;
    text += `========================\n`;
    text += `Order #: ${orderData.order_number}\n`;
    text += `Date: ${dateStr}\n`;
    text += `Time: ${timeStr}\n`;
    text += `Customer: ${orderData.user?.full_name || 'Walk-in'}\n`;
    text += `========================\n`;
    text += `Item                              Qty\n`;
    text += `----------------------------------------\n`;
    
    orderItems.forEach(item => {
      const itemName = item.menu_item.name.toUpperCase();
      const qty = item.quantity.toString();
      const paddedItemName = itemName.padEnd(35);
      const paddedQty = qty.padStart(4);
      text += `${paddedItemName} ${paddedQty}\n`;
    });
    
    text += `------------------------\n`;
    text += `Total Items: ${orderItems.reduce((sum, item) => sum + item.quantity, 0)}\n`;
    text += `Total Amount: ${isChatkara ? 'rs' + orderData.total_amount.toFixed(2) : '₹' + orderData.total_amount}\n`;
    text += `========================\n`;
    text += `${isChatkara ? 'Thanks' : 'Thank you for your order!'}\n`;
    
    return text;
  }

  // Generate Customer Receipt Text (for network printing)
  private generateCustomerReceiptText(orderData: any, orderItems: any[], isFoodCourt: boolean, isChatkara: boolean): string {
    const date = new Date(orderData.created_at);
    const dateStr = date.toLocaleDateString();
    const timeStr = date.toLocaleTimeString();

    if (isFoodCourt) {
      let text = `The Food Court Co\n`;
      text += `(MOMO STREET, GOBBLERS, KRISPP, TATA MYBRISTO)\n`;
      text += `GSTIN: 08ADNPG4024A1Z2\n`;
      text += `========================\n`;
      text += `Name: ${orderData.user?.full_name || 'Walk-in Customer'} (M: ${orderData.user?.phone || orderData.phone_number || 'N/A'})\n`;
      text += `Date: ${dateStr}\n`;
      text += `Time: ${timeStr}\n`;
      text += `Order Type: Pick Up\n`;
      text += `Cashier: biller\n`;
      text += `Bill No.: ${orderData.order_number.replace(/[^\d]/g, '')}\n`;
      text += `Token No.: ${Math.floor(Math.random() * 10) + 1}\n`;
      text += `========================\n`;
      text += `Item\t\tQty\tPrice\tAmount\n`;
      text += `------------------------\n`;
      
      orderItems.forEach(item => {
        text += `${item.menu_item.name}\t\t${item.quantity}\t${item.unit_price}.00\t${item.total_price}.00\n`;
      });
      
      text += `------------------------\n`;
      text += `Total Qty: ${orderItems.reduce((sum, item) => sum + item.quantity, 0)}\n`;
      text += `Sub Total: ${orderData.subtotal}.00\n`;
      text += `CGST@2.5 2.5%: ${(orderData.tax_amount / 2).toFixed(2)}\n`;
      text += `SGST@2.5 2.5%: ${(orderData.tax_amount / 2).toFixed(2)}\n`;
      text += `Round off: +0.04\n`;
      text += `Grand Total: ₹${orderData.total_amount}.00\n`;
      text += `========================\n`;
      text += `Paid via: Other [UPI]\n`;
      text += `Thanks For Visit!!\n`;
      
      return text;
    } else if (isChatkara) {
      const deliveryCharge = 10;
      const discountAmount = orderData.subtotal * 0.10; // 10% discount
      const finalTotal = orderData.subtotal + deliveryCharge - discountAmount;
      
      let text = `CHATKARA\n`;
      text += `${orderData.user?.phone || orderData.phone_number || 'N/A'} ${orderData.user?.block || orderData.delivery_block || 'N/A'}\n`;
      text += `Token No.: ${orderData.order_number}\n`;
      text += `Name: ${orderData.user?.full_name || orderData.customer_name || 'Customer'}\n`;
      text += `Date: ${dateStr}\n`;
      text += `${timeStr} Delivery\n`;
      text += `Cashier: biller\n`;
      text += `Bill No.: ${orderData.order_number.replace(/[^\d]/g, '')}\n`;
      text += `========================\n`;
      text += `Item\t\tQty\tPrice\tAmount\n`;
      text += `------------------------\n`;
      
      orderItems.forEach(item => {
        text += `${item.menu_item.name}\t\t${item.quantity}\t${item.unit_price.toFixed(0)}\t${item.total_price.toFixed(0)}\n`;
      });
      
      text += `------------------------\n`;
      text += `Total Qty: ${orderItems.reduce((sum, item) => sum + item.quantity, 0)}\n`;
      text += `Sub Total: ${orderData.subtotal.toFixed(0)}\n`;
      text += `Delivery Charge: +${deliveryCharge}\n`;
      text += `MUJ Food Club Discount: -${discountAmount.toFixed(0)}\n`;
      text += `Grand Total: ${finalTotal.toFixed(0)}rs\n`;
      text += `========================\n`;
      text += `Thanks Order Again\n`;
      text += `mujfoodclub.in\n`;
      
      return text;
    } else {
      let text = `MUJ FOOD CLUB\n`;
      text += `Delicious Food, Great Service\n`;
      text += `www.mujfoodclub.in\n`;
      text += `========================\n`;
      text += `Receipt #: ${orderData.order_number}\n`;
      text += `Date: ${dateStr}\n`;
      text += `Time: ${timeStr}\n`;
      text += `Customer: ${orderData.user?.full_name || 'Walk-in Customer'}\n`;
      text += `Phone: ${orderData.user?.phone || orderData.phone_number || 'N/A'}\n`;
      text += `Block: ${orderData.user?.block || orderData.delivery_block || 'N/A'}\n`;
      text += `========================\n`;
      text += `Item\t\tQty × Price\tTotal\n`;
      text += `------------------------\n`;
      
      orderItems.forEach(item => {
        text += `${item.menu_item.name}\t\t${item.quantity} × ₹${item.unit_price}\t₹${item.total_price}\n`;
      });
      
      text += `------------------------\n`;
      text += `Subtotal: ₹${orderData.subtotal}\n`;
      text += `Tax (5%): ₹${orderData.tax_amount}\n`;
      text += `TOTAL: ₹${orderData.total_amount}\n`;
      text += `========================\n`;
      text += `Thank you for your order!\n`;
      text += `Please collect your receipt\n`;
      text += `For support: support@mujfoodclub.in\n`;
      
      return text;
    }
  }

  // Disconnect
  async disconnect(): Promise<void> {
    this.isConnected = false;
  }

  // Get connection status
  getConnectionStatus(): boolean {
    return this.isConnected;
  }
}

export const printerService = new PrinterService({
  connectionType: 'usb', // Default to USB since it's wired
  baudRate: 9600
});

export default printerService;
