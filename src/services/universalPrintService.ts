import { PrintNodeService } from './printNodeService';
import { supabase } from '@/integrations/supabase/client';

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
  jobId?: string;
}

class UniversalPrintService {
  private printNodeService: PrintNodeService | null = null;

  constructor() {
    this.initializePrintNode();
  }

  private initializePrintNode() {
    // Try Chatkara API key first, then fallback to general
    const apiKey = import.meta.env.VITE_CHATKARA_PRINTNODE_API_KEY || 
                   import.meta.env.VITE_PRINTNODE_API_KEY || '';
    
    if (apiKey) {
      this.printNodeService = new PrintNodeService({
        apiKey: apiKey,
        baseUrl: 'https://api.printnode.com'
      });
      console.log('✅ Universal Print Service: PrintNode initialized');
    } else {
      console.log('⚠️ Universal Print Service: No PrintNode API key found');
    }
  }

  async printReceipt(receiptData: ReceiptData): Promise<PrintResult> {
    console.log('🔄 Universal Print Service: Printing receipt');
    console.log('🔄 Universal Print Service: Cafe name:', receiptData.cafe_name);
    
    if (this.printNodeService) {
      try {
        // Use PrintNode service with cafe-specific formatting
        const result = await this.printNodeService.printOrderReceipt(receiptData);
        console.log('✅ Universal Print Service: PrintNode result:', result);
        return result;
      } catch (error) {
        console.error('❌ Universal Print Service: PrintNode failed:', error);
        return { success: false, error: error instanceof Error ? error.message : 'PrintNode failed' };
      }
    }

    // Fallback: Browser printing with cafe-specific HTML
    return this.printViaBrowser(receiptData);
  }

  async printKOT(receiptData: ReceiptData): Promise<PrintResult> {
    console.log('🔄 Universal Print Service: Printing KOT');
    console.log('🔄 Universal Print Service: Cafe name:', receiptData.cafe_name);
    
    if (this.printNodeService) {
      try {
        // Use PrintNode service with cafe-specific formatting
        const result = await this.printNodeService.printKOT(receiptData);
        console.log('✅ Universal Print Service: PrintNode KOT result:', result);
        return result;
      } catch (error) {
        console.error('❌ Universal Print Service: PrintNode KOT failed:', error);
        return { success: false, error: error instanceof Error ? error.message : 'PrintNode KOT failed' };
      }
    }

    // Fallback: Browser printing with cafe-specific HTML
    return this.printKOTViaBrowser(receiptData);
  }

  private async printViaBrowser(receiptData: ReceiptData): Promise<PrintResult> {
    try {
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        return { success: false, error: 'Could not open print window' };
      }

      const receiptHTML = this.generateReceiptHTML(receiptData);
      printWindow.document.write(receiptHTML);
      printWindow.document.close();
      
      // Auto-print after a short delay
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 500);

      return { success: true };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Browser print failed' };
    }
  }

  private async printKOTViaBrowser(receiptData: ReceiptData): Promise<PrintResult> {
    try {
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        return { success: false, error: 'Could not open print window' };
      }

      const kotHTML = this.generateKOTHTML(receiptData);
      printWindow.document.write(kotHTML);
      printWindow.document.close();
      
      // Auto-print after a short delay
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 500);

      return { success: true };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Browser KOT print failed' };
    }
  }

  private generateReceiptHTML(receiptData: ReceiptData): string {
    const isChatkara = receiptData.cafe_name?.toLowerCase().includes('chatkara') || 
                       receiptData.cafe_name === 'CHATKARA' ||
                       receiptData.cafe_name?.toLowerCase() === 'chatkara';
    
    if (isChatkara) {
      return this.generateChatkaraReceiptHTML(receiptData);
    } else {
      return this.generateDefaultReceiptHTML(receiptData);
    }
  }

  private generateKOTHTML(receiptData: ReceiptData): string {
    const isChatkara = receiptData.cafe_name?.toLowerCase().includes('chatkara') || 
                       receiptData.cafe_name === 'CHATKARA' ||
                       receiptData.cafe_name?.toLowerCase() === 'chatkara';
    
    if (isChatkara) {
      return this.generateChatkaraKOTHTML(receiptData);
    } else {
      return this.generateDefaultKOTHTML(receiptData);
    }
  }

  private generateChatkaraReceiptHTML(data: ReceiptData): string {
    const now = new Date();
    const dateStr = now.toLocaleDateString('en-GB').replace(/\//g, '/');
    const timeStr = now.toLocaleTimeString('en-GB', { hour12: false }).substring(0, 5);
    
    return `
<!DOCTYPE html>
<html>
<head>
    <title>Chatkara Receipt</title>
    <style>
        body { font-family: monospace; font-size: 12px; margin: 0; padding: 10px; }
        .header { text-align: center; font-weight: bold; font-size: 16px; margin-bottom: 10px; }
        .info { margin: 5px 0; }
        .items { margin: 10px 0; }
        .item { display: flex; justify-content: space-between; margin: 3px 0; }
        .total { font-weight: bold; font-size: 14px; text-align: center; margin: 10px 0; }
        .footer { text-align: center; font-weight: bold; margin-top: 15px; }
    </style>
</head>
<body>
    <div class="header">CHATKARA</div>
    <div class="info">Name: ${data.customer_name} (M: ${data.customer_phone})</div>
    <div class="info">Adr: ${data.delivery_block}</div>
    <div class="info">Date: ${dateStr}</div>
    <div class="info">${timeStr}</div>
    <div class="info"><strong>Delivery</strong></div>
    <div class="info">Cashier: biller</div>
    <div class="info"><strong>Bill No.: ${data.order_number}</strong></div>
    <div class="info"><strong>Token No.: ${data.order_number}</strong></div>
    <hr>
    <div class="items">
        <div class="item"><strong>Item</strong><strong>Qty. Price Amount</strong></div>
        ${data.items.map(item => `
            <div class="item">
                <span>${item.name}</span>
                <span>${item.quantity} ${item.unit_price} ${item.total_price}</span>
            </div>
        `).join('')}
    </div>
    <hr>
    <div class="total">Grand Total: ₹${data.final_amount}</div>
    <div class="footer">THANKS FOR VISIT!!</div>
    <div class="footer">CHATKARA</div>
</body>
</html>`;
  }

  private generateChatkaraKOTHTML(data: ReceiptData): string {
    const now = new Date();
    const dateStr = now.toLocaleDateString('en-GB').replace(/\//g, '/');
    const timeStr = now.toLocaleTimeString('en-GB', { hour12: false }).substring(0, 5);
    
    return `
<!DOCTYPE html>
<html>
<head>
    <title>Chatkara KOT</title>
    <style>
        body { font-family: monospace; font-size: 12px; margin: 0; padding: 10px; }
        .header { text-align: center; font-weight: bold; font-size: 16px; margin-bottom: 10px; }
        .items { margin: 10px 0; }
        .item { display: flex; justify-content: space-between; margin: 3px 0; }
        .footer { text-align: center; font-weight: bold; margin-top: 15px; }
    </style>
</head>
<body>
    <div class="header">KOT - ${data.order_number.slice(-2)}</div>
    <div class="header"><strong>DELIVERY</strong></div>
    <div class="info">${dateStr} ${timeStr}</div>
    <hr>
    <div class="items">
        <div class="item"><strong>ITEM</strong><strong>QTY</strong></div>
        ${data.items.map(item => `
            <div class="item">
                <span>${item.name.toUpperCase()}</span>
                <span>${item.quantity}</span>
            </div>
        `).join('')}
    </div>
    <hr>
    <div class="footer">THANKS FOR VISIT!!</div>
    <div class="footer">CHATKARA</div>
</body>
</html>`;
  }

  private generateDefaultReceiptHTML(data: ReceiptData): string {
    // Default MUJ Food Club format
    return `
<!DOCTYPE html>
<html>
<head>
    <title>Receipt</title>
    <style>
        body { font-family: monospace; font-size: 12px; margin: 0; padding: 10px; }
        .header { text-align: center; font-weight: bold; font-size: 16px; margin-bottom: 10px; }
        .info { margin: 5px 0; }
        .items { margin: 10px 0; }
        .item { display: flex; justify-content: space-between; margin: 3px 0; }
        .total { font-weight: bold; font-size: 14px; text-align: center; margin: 10px 0; }
        .footer { text-align: center; font-weight: bold; margin-top: 15px; }
    </style>
</head>
<body>
    <div class="header">MUJ FOOD CLUB</div>
    <div class="info">Order: ${data.order_number}</div>
    <div class="info">Customer: ${data.customer_name}</div>
    <div class="info">Phone: ${data.customer_phone}</div>
    <div class="info">Block: ${data.delivery_block}</div>
    <hr>
    <div class="items">
        ${data.items.map(item => `
            <div class="item">
                <span>${item.name} x${item.quantity}</span>
                <span>₹${item.total_price}</span>
            </div>
        `).join('')}
    </div>
    <hr>
    <div class="total">Total: ₹${data.final_amount}</div>
    <div class="footer">Thank you for your order!</div>
</body>
</html>`;
  }

  private generateDefaultKOTHTML(data: ReceiptData): string {
    // Default MUJ Food Club KOT format
    return `
<!DOCTYPE html>
<html>
<head>
    <title>KOT</title>
    <style>
        body { font-family: monospace; font-size: 12px; margin: 0; padding: 10px; }
        .header { text-align: center; font-weight: bold; font-size: 16px; margin-bottom: 10px; }
        .items { margin: 10px 0; }
        .item { display: flex; justify-content: space-between; margin: 3px 0; }
        .footer { text-align: center; font-weight: bold; margin-top: 15px; }
    </style>
</head>
<body>
    <div class="header">KOT - ${data.order_number}</div>
    <div class="header"><strong>PICK UP</strong></div>
    <hr>
    <div class="items">
        <div class="item"><strong>ITEM</strong><strong>QTY</strong></div>
        ${data.items.map(item => `
            <div class="item">
                <span>${item.name.toUpperCase()}</span>
                <span>${item.quantity}</span>
            </div>
        `).join('')}
    </div>
    <hr>
    <div class="footer">MUJ FOOD CLUB</div>
</body>
</html>`;
  }
}

// Export singleton instance
export const universalPrintService = new UniversalPrintService();
