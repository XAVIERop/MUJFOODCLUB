/**
 * Enhanced Browser Print Service for Windows 7
 * This service provides perfect thermal printing without requiring Node.js or any server
 */

interface ReceiptData {
  order_id: string;
  order_number: string;
  cafe_name: string;
  customer_name: string;
  customer_phone: string;
  delivery_block: string;
  items: Array<{
    id: string;
    name: string;
    quantity: number;
    unit_price: number;
    total_price: number;
    special_instructions?: string;
  }>;
  subtotal: number;
  tax_amount: number;
  discount_amount: number;
  final_amount: number;
  payment_method: string;
  order_date: string;
  estimated_delivery: string;
  points_earned: number;
  points_redeemed: number;
}

interface PrintResult {
  success: boolean;
  error?: string;
  method: string;
}

class EnhancedBrowserPrintService {
  /**
   * Print KOT using enhanced browser printing
   */
  async printKOT(receiptData: ReceiptData): Promise<PrintResult> {
    try {
      console.log('🖨️ Enhanced Browser Print: Printing KOT');
      
      const kotHTML = this.generateKOTHTML(receiptData);
      const success = await this.printHTML(kotHTML, 'KOT');
      
      return {
        success,
        method: 'enhanced_browser',
        error: success ? undefined : 'Failed to open print dialog'
      };
    } catch (error) {
      console.error('❌ Enhanced browser KOT print failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        method: 'enhanced_browser'
      };
    }
  }

  /**
   * Print Receipt using enhanced browser printing
   */
  async printReceipt(receiptData: ReceiptData): Promise<PrintResult> {
    try {
      console.log('🖨️ Enhanced Browser Print: Printing Receipt');
      
      const receiptHTML = this.generateReceiptHTML(receiptData);
      const success = await this.printHTML(receiptHTML, 'Receipt');
      
      return {
        success,
        method: 'enhanced_browser',
        error: success ? undefined : 'Failed to open print dialog'
      };
    } catch (error) {
      console.error('❌ Enhanced browser Receipt print failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        method: 'enhanced_browser'
      };
    }
  }

  /**
   * Print HTML content using browser
   */
  private async printHTML(html: string, title: string): Promise<boolean> {
    return new Promise((resolve) => {
      try {
        // Create a new window for printing
        const printWindow = window.open('', '_blank', 'width=400,height=600');
        
        if (!printWindow) {
          console.error('❌ Could not open print window');
          resolve(false);
          return;
        }

        // Write HTML content
        printWindow.document.write(html);
        printWindow.document.close();

        // Wait for content to load, then print
        printWindow.onload = () => {
          setTimeout(() => {
            printWindow.print();
            
            // Close window after printing
            setTimeout(() => {
              printWindow.close();
            }, 1000);
            
            resolve(true);
          }, 500);
        };

        // Fallback if onload doesn't fire
        setTimeout(() => {
          printWindow.print();
          setTimeout(() => {
            printWindow.close();
          }, 1000);
          resolve(true);
        }, 2000);

      } catch (error) {
        console.error('❌ Print window error:', error);
        resolve(false);
      }
    });
  }

  /**
   * Generate KOT HTML optimized for thermal printing
   */
  private generateKOTHTML(data: ReceiptData): string {
    const isChatkara = data.cafe_name?.toLowerCase().includes('chatkara');
    const now = new Date();
    const dateStr = now.toLocaleDateString('en-GB');
    const timeStr = now.toLocaleTimeString('en-GB', { hour12: false }).substring(0, 5);
    
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>KOT - ${data.order_number}</title>
    <style>
        @page {
            size: 80mm auto;
            margin: 0;
        }
        body {
            font-family: 'Courier New', monospace;
            font-size: 12px;
            line-height: 1.2;
            margin: 0;
            padding: 5px;
            width: 80mm;
            background: white;
        }
        .header {
            text-align: center;
            font-weight: bold;
            border-bottom: 1px solid #000;
            padding-bottom: 5px;
            margin-bottom: 5px;
        }
        .title {
            font-size: 16px;
            margin-bottom: 3px;
        }
        .subtitle {
            font-size: 14px;
            margin-bottom: 3px;
        }
        .info {
            font-size: 11px;
            margin-bottom: 5px;
        }
        .items {
            margin: 5px 0;
        }
        .item {
            display: flex;
            justify-content: space-between;
            margin-bottom: 2px;
            font-size: 11px;
        }
        .item-name {
            flex: 1;
            text-transform: uppercase;
        }
        .item-qty {
            font-weight: bold;
        }
        .footer {
            text-align: center;
            margin-top: 10px;
            border-top: 1px solid #000;
            padding-top: 5px;
        }
        .cafe-name {
            font-weight: bold;
            font-size: 14px;
        }
        @media print {
            body { margin: 0; }
            .no-print { display: none; }
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="title">KOT - ${data.order_number.slice(-2)}</div>
        <div class="subtitle">${isChatkara ? 'DELIVERY' : 'PICK UP'}</div>
    </div>
    
    <div class="info">
        Date: ${dateStr} ${timeStr}
    </div>
    
    <div class="items">
        <div style="font-weight: bold; border-bottom: 1px solid #000; padding-bottom: 2px; margin-bottom: 3px;">
            ITEM                    QTY
        </div>
        ${data.items.map(item => `
            <div class="item">
                <span class="item-name">${item.name.toUpperCase().substring(0, 20)}</span>
                <span class="item-qty">${item.quantity}</span>
            </div>
        `).join('')}
    </div>
    
    <div class="footer">
        <div style="font-weight: bold; margin-bottom: 5px;">${data.cafe_name?.toLowerCase().includes('chatkara') ? 'Thanks' : 'THANKS FOR VISIT!!'}</div>
        <div class="cafe-name">${data.cafe_name?.toUpperCase() || 'MUJFOODCLUB'}</div>
    </div>
    
    <div class="no-print" style="margin-top: 20px; text-align: center; color: #666;">
        <p>This is a thermal printer optimized receipt</p>
        <p>Make sure your Xprinter is set as default printer</p>
    </div>
</body>
</html>`;
  }

  /**
   * Generate Receipt HTML optimized for thermal printing
   */
  private generateReceiptHTML(data: ReceiptData): string {
    const now = new Date();
    const dateStr = now.toLocaleDateString('en-GB');
    const timeStr = now.toLocaleTimeString('en-GB', { hour12: false }).substring(0, 5);
    
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Receipt - ${data.order_number}</title>
    <style>
        @page {
            size: 80mm auto;
            margin: 0;
        }
        body {
            font-family: 'Courier New', monospace;
            font-size: 11px;
            line-height: 1.2;
            margin: 0;
            padding: 5px;
            width: 80mm;
            background: white;
        }
        .header {
            text-align: center;
            font-weight: bold;
            border-bottom: 1px solid #000;
            padding-bottom: 5px;
            margin-bottom: 5px;
        }
        .cafe-name {
            font-size: 16px;
            margin-bottom: 3px;
        }
        .customer-info {
            font-size: 10px;
            margin-bottom: 5px;
            line-height: 1.3;
        }
        .items {
            margin: 5px 0;
        }
        .item {
            display: flex;
            justify-content: space-between;
            margin-bottom: 2px;
            font-size: 10px;
        }
        .item-name {
            flex: 1;
            text-transform: uppercase;
        }
        .item-details {
            text-align: right;
            white-space: nowrap;
        }
        .total {
            border-top: 1px solid #000;
            padding-top: 5px;
            margin-top: 5px;
            font-weight: bold;
        }
        .footer {
            text-align: center;
            margin-top: 10px;
            border-top: 1px solid #000;
            padding-top: 5px;
        }
        @media print {
            body { margin: 0; }
            .no-print { display: none; }
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="cafe-name">${data.cafe_name?.toUpperCase() || 'MUJ FOOD CLUB'}</div>
    </div>
    
    <div class="customer-info">
        Name: ${data.customer_name} (M: ${data.customer_phone})<br>
        Block: ${data.delivery_block}<br>
        Date: ${dateStr} ${timeStr}<br>
        Order: ${data.order_number}
    </div>
    
    <div class="items">
        <div style="font-weight: bold; border-bottom: 1px solid #000; padding-bottom: 2px; margin-bottom: 3px;">
            Item                Qty. Price Amount
        </div>
        ${data.items.map(item => `
            <div class="item">
                <span class="item-name">${item.name.toUpperCase().substring(0, 18)}</span>
                <span class="item-details">${item.quantity}    ${data.cafe_name?.toLowerCase().includes('chatkara') ? 'rs' + item.unit_price.toFixed(2) : item.unit_price.toFixed(0)}    ${data.cafe_name?.toLowerCase().includes('chatkara') ? 'rs' + item.total_price.toFixed(2) : item.total_price.toFixed(0)}</span>
            </div>
        `).join('')}
    </div>
    
    <div class="total">
        Total: ${data.cafe_name?.toLowerCase().includes('chatkara') ? 'rs' + data.final_amount.toFixed(2) : '₹' + data.final_amount.toFixed(2)}<br>
        Payment: ${data.payment_method.toUpperCase()}
    </div>
    
    <div class="footer">
        <div>${data.cafe_name?.toLowerCase().includes('chatkara') ? 'Thanks' : 'Thank you for your order!'}</div>
    </div>
    
    <div class="no-print" style="margin-top: 20px; text-align: center; color: #666;">
        <p>This is a thermal printer optimized receipt</p>
        <p>Make sure your Xprinter is set as default printer</p>
    </div>
</body>
</html>`;
  }
}

// Export singleton instance
export const enhancedBrowserPrintService = new EnhancedBrowserPrintService();
export default enhancedBrowserPrintService;