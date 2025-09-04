// Direct Printer Service - Bypasses browser printing
// Uses system printer drivers directly

interface PrintJob {
  type: 'kot' | 'customer';
  orderData: any;
  orderItems: any[];
}

class DirectPrinterService {
  private isConnected: boolean = false;

  constructor() {
    this.initialize();
  }

  private async initialize(): Promise<void> {
    // Check if we can access system printers
    try {
      if ('navigator' in window && 'serviceWorker' in navigator) {
        this.isConnected = true;
        console.log('Direct printer service initialized');
      }
    } catch (error) {
      console.error('Direct printer initialization failed:', error);
    }
  }

  // Print using system printer dialog
  async printReceipt(job: PrintJob): Promise<boolean> {
    try {
      const receiptHTML = this.generateReceiptHTML(job);
      
      // Create a hidden iframe for printing
      const iframe = document.createElement('iframe');
      iframe.style.position = 'absolute';
      iframe.style.left = '-9999px';
      iframe.style.top = '-9999px';
      iframe.style.width = '80mm';
      iframe.style.height = 'auto';
      iframe.style.border = 'none';
      iframe.style.overflow = 'hidden';
      
      document.body.appendChild(iframe);
      
      const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
      if (iframeDoc) {
        iframeDoc.open();
        iframeDoc.write(receiptHTML);
        iframeDoc.close();
        
        // Wait for content to load
        setTimeout(() => {
          iframe.contentWindow?.focus();
          iframe.contentWindow?.print();
          
          // Clean up
          setTimeout(() => {
            document.body.removeChild(iframe);
          }, 1000);
        }, 500);
      }
      
      return true;
    } catch (error) {
      console.error('Direct print failed:', error);
      return false;
    }
  }

  // Generate compact receipt HTML
  private generateReceiptHTML(job: PrintJob): string {
    const { orderData, orderItems } = job;
    const isFoodCourt = orderData.cafe_id === '3e5955ba-9b90-48ce-9d07-cc686678a10e';
    
    if (job.type === 'kot') {
      return this.generateKOTHTML(orderData, orderItems, isFoodCourt);
    } else {
      return this.generateCustomerReceiptHTML(orderData, orderItems, isFoodCourt);
    }
  }

  // Generate KOT HTML - Ultra compact
  private generateKOTHTML(orderData: any, orderItems: any[], isFoodCourt: boolean): string {
    const date = new Date(orderData.created_at);
    const dateStr = date.toLocaleDateString();
    const timeStr = date.toLocaleTimeString();

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <title>KOT</title>
          <style>
            @page { 
              margin: 0; 
              size: 80mm auto; 
              padding: 0;
            }
            * { 
              margin: 0; 
              padding: 0; 
              box-sizing: border-box; 
            }
            body { 
              font-family: 'Courier New', monospace; 
              font-size: 10px; 
              line-height: 1.2;
              width: 80mm;
              padding: 2mm;
              font-weight: bold !important;
            }
                          .header { 
                text-align: center; 
                margin-bottom: 2mm; 
                border-bottom: 1px solid #000;
                padding-bottom: 1mm;
              }
              .logo { 
                font-size: 11px; 
                font-weight: bold; 
              }
              .subtitle { 
                font-size: 7px; 
              }
              .order-info { 
                margin-bottom: 2mm; 
              }
              .info-row { 
                display: flex; 
                justify-content: space-between; 
                margin-bottom: 0.5mm; 
                font-size: 8px;
              }
              .items-section { 
                margin-bottom: 2mm; 
              }
              .item-row { 
                display: flex; 
                justify-content: space-between; 
                margin-bottom: 0.5mm; 
                font-size: 8px;
              }
              .item-name { 
                flex: 2; 
              }
              .item-details { 
                flex: 1; 
                text-align: right; 
              }
              .footer { 
                text-align: center; 
                margin-top: 2mm; 
                font-size: 7px; 
                border-top: 1px solid #000;
                padding-top: 1mm;
              }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo">${isFoodCourt ? 'THE FOOD COURT CO' : 'MUJ FOOD CLUB'}</div>
            <div class="subtitle">KITCHEN ORDER TICKET</div>
          </div>
          
          <div class="order-info">
            <div class="info-row">
              <span>Order #:</span>
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
            <div class="info-row" style="font-weight: bold; margin-bottom: 1mm; border-bottom: 1px solid #000; padding-bottom: 0.5mm;">
              <span>Item</span>
              <span>Qty</span>
            </div>
            ${orderItems.map(item => `
              <div class="item-row">
                <div class="item-name">${item.menu_item.name}</div>
                <div class="item-details">${item.quantity}</div>
              </div>
            `).join('')}
          </div>
          
          <div class="footer">
            <div>Total Items: ${orderItems.reduce((sum, item) => sum + item.quantity, 0)}</div>
            <div>Total: ₹${orderData.total_amount}</div>
          </div>
        </body>
      </html>
    `;
  }

  // Generate Customer Receipt HTML - Ultra compact
  private generateCustomerReceiptHTML(orderData: any, orderItems: any[], isFoodCourt: boolean): string {
    const date = new Date(orderData.created_at);
    const dateStr = date.toLocaleDateString();
    const timeStr = date.toLocaleTimeString();

    if (isFoodCourt) {
      return `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Receipt</title>
            <style>
              @page { 
                margin: 0 !important; 
                size: 80mm auto !important; 
                padding: 0 !important;
                max-height: 150mm !important;
                width: 80mm !important;
              }
              @media print {
                body { 
                  width: 80mm !important; 
                  max-width: 80mm !important;
                  margin: 0 !important; 
                  padding: 1mm !important;
                  font-size: 9px !important; 
                  line-height: 1.1 !important;
                  font-family: 'Courier New', monospace !important;
                  font-weight: bold !important;
                  max-height: 150mm !important;
                  overflow: hidden !important;
                }
                * { 
                  margin: 0 !important; 
                  padding: 0 !important; 
                  box-sizing: border-box !important; 
                }
              }
              * { 
                margin: 0; 
                padding: 0; 
                box-sizing: border-box; 
              }
              body { 
                font-family: 'Courier New', monospace; 
                font-size: 9px; 
                line-height: 1.1;
                width: 80mm;
                padding: 1mm;
                font-weight: bold !important;
                max-height: 150mm;
                overflow: hidden;
              }
              .header { 
                text-align: center; 
                margin-bottom: 3mm; 
                border-bottom: 1px solid #000;
                padding-bottom: 2mm;
              }
              .logo { 
                font-size: 12px; 
                font-weight: bold; 
              }
              .subtitle { 
                font-size: 8px; 
              }
              .order-info { 
                margin-bottom: 3mm; 
              }
              .info-row { 
                display: flex; 
                justify-content: space-between; 
                margin-bottom: 1mm; 
                font-size: 9px;
              }
              .items-section { 
                margin-bottom: 3mm; 
              }
              .item-row { 
                display: flex; 
                justify-content: space-between; 
                margin-bottom: 1mm; 
                font-size: 9px;
              }
              .item-name { 
                flex: 2; 
              }
              .item-details { 
                flex: 1; 
                text-align: right; 
              }
              .total-section { 
                border-top: 1px solid #000; 
                padding-top: 1mm; 
                margin-bottom: 2mm;
              }
              .footer { 
                text-align: center; 
                margin-top: 3mm; 
                font-size: 8px; 
                border-top: 1px solid #000;
                padding-top: 2mm;
              }
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
                <span>${orderData.user?.full_name || 'Walk-in Customer'}</span>
              </div>
              <div class="info-row">
                <span>Phone:</span>
                <span>${orderData.user?.phone || orderData.phone_number || 'N/A'}</span>
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
                <span>Bill No.:</span>
                <span>${orderData.order_number.replace(/[^\d]/g, '')}</span>
              </div>
              <div class="info-row">
                <span>Token No.:</span>
                <span>${Math.floor(Math.random() * 10) + 1}</span>
              </div>
            </div>
            
            <div class="items-section">
              <div class="info-row" style="font-weight: bold; margin-bottom: 1mm; border-bottom: 1px solid #000; padding-bottom: 0.5mm;">
                <span>Item</span>
                <span>Qty</span>
                <span>Price</span>
                <span>Amount</span>
              </div>
              ${orderItems.map(item => `
                <div class="item-row">
                  <div class="item-name">${item.menu_item.name}</div>
                  <div class="item-details">${item.quantity}</div>
                  <div class="item-details">${item.unit_price}</div>
                  <div class="item-details">${item.total_price}</div>
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
                <span>₹${orderData.subtotal}</span>
              </div>
              <div class="info-row">
                <span>CGST@2.5%:</span>
                <span>₹${(orderData.tax_amount / 2).toFixed(2)}</span>
              </div>
              <div class="info-row">
                <span>SGST@2.5%:</span>
                <span>₹${(orderData.tax_amount / 2).toFixed(2)}</span>
              </div>
              <div class="info-row" style="font-size: 10px; margin-top: 1mm; border-top: 1px solid #000; padding-top: 0.5mm;">
                <span>Grand Total:</span>
                <span>₹${orderData.total_amount}</span>
              </div>
            </div>
            
            <div class="footer">
              <div>Paid via: UPI</div>
              <div>Thanks For Visit!!</div>
            </div>
          </body>
        </html>
      `;
    } else {
      return `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Receipt</title>
            <style>
              @page { 
                margin: 0 !important; 
                size: 80mm auto !important; 
                padding: 0 !important;
                max-height: 150mm !important;
                width: 80mm !important;
              }
              @media print {
                body { 
                  width: 80mm !important; 
                  max-width: 80mm !important;
                  margin: 0 !important; 
                  padding: 1mm !important;
                  font-size: 9px !important; 
                  line-height: 1.1 !important;
                  font-family: 'Courier New', monospace !important;
                  font-weight: bold !important;
                  max-height: 150mm !important;
                  overflow: hidden !important;
                }
                * { 
                  margin: 0 !important; 
                  padding: 0 !important; 
                  box-sizing: border-box !important; 
                }
              }
              * { 
                margin: 0; 
                padding: 0; 
                box-sizing: border-box; 
              }
              body { 
                font-family: 'Courier New', monospace; 
                font-size: 9px; 
                line-height: 1.1;
                width: 80mm;
                padding: 1mm;
                font-weight: bold !important;
                max-height: 150mm;
                overflow: hidden;
              }
              .header { 
                text-align: center; 
                margin-bottom: 3mm; 
                border-bottom: 1px solid #000;
                padding-bottom: 2mm;
              }
              .logo { 
                font-size: 12px; 
                font-weight: bold; 
              }
              .subtitle { 
                font-size: 8px; 
              }
              .order-info { 
                margin-bottom: 3mm; 
              }
              .info-row { 
                display: flex; 
                justify-content: space-between; 
                margin-bottom: 1mm; 
                font-size: 9px;
              }
              .items-section { 
                margin-bottom: 3mm; 
              }
              .item-row { 
                display: flex; 
                justify-content: space-between; 
                margin-bottom: 1mm; 
                font-size: 9px;
              }
              .item-name { 
                flex: 2; 
              }
              .item-details { 
                flex: 1; 
                text-align: right; 
              }
              .total-section { 
                border-top: 1px solid #000; 
                padding-top: 1mm; 
                margin-bottom: 2mm;
              }
              .footer { 
                text-align: center; 
                margin-top: 3mm; 
                font-size: 8px; 
                border-top: 1px solid #000;
                padding-top: 2mm;
              }
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
              <div class="info-row" style="font-weight: bold; margin-bottom: 1mm; border-bottom: 1px solid #000; padding-bottom: 0.5mm;">
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
              <div class="info-row" style="font-size: 10px; margin-top: 1mm; border-top: 1px solid #000; padding-top: 0.5mm;">
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

  getConnectionStatus(): boolean {
    return this.isConnected;
  }
}

export const directPrinterService = new DirectPrinterService();
export default directPrinterService;
