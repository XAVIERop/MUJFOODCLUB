// Define ReceiptData interface locally since it's not exported
interface ReceiptData {
  order_id: string;
  order_number: string;
  cafe_name: string;
  customer_name: string;
  customer_phone: string;
  delivery_block: string;
  items: {
    id: string;
    name: string;
    quantity: number;
    unit_price: number;
    total_price: number;
    special_instructions?: string;
  }[];
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

export interface PrintNodeConfig {
  apiKey: string;
  baseUrl?: string;
}

export interface PrintNodePrinter {
  id: number;
  name: string;
  description: string;
  default: boolean;
  state: string;
  computer: {
    id: number;
    name: string;
  };
}

export interface PrintJobResult {
  success: boolean;
  jobId?: number;
  error?: string;
}

export class PrintNodeService {
  private apiKey: string;
  private baseUrl: string;

  constructor(config: PrintNodeConfig) {
    this.apiKey = config.apiKey;
    this.baseUrl = config.baseUrl || 'https://api.printnode.com';
  }

  /**
   * Make authenticated HTTP request to PrintNode API
   */
  private async makeRequest(endpoint: string, options: RequestInit = {}): Promise<Response> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = {
      'Authorization': `Basic ${btoa(this.apiKey + ':')}`,
      'Content-Type': 'application/json',
      ...options.headers
    };

    return fetch(url, {
      ...options,
      headers
    });
  }

  /**
   * Check if PrintNode service is available
   */
  async isAvailable(): Promise<boolean> {
    try {
      const response = await this.makeRequest('/whoami');
      return response.ok;
    } catch (error) {
      console.error('PrintNode service unavailable:', error);
      return false;
    }
  }

  /**
   * Get all available printers
   */
  async getAvailablePrinters(): Promise<PrintNodePrinter[]> {
    try {
      const response = await this.makeRequest('/printers');
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const printers = await response.json();
      return printers.map((printer: any) => ({
        id: printer.id,
        name: printer.name,
        description: printer.description,
        default: printer.default,
        state: printer.state,
        computer: {
          id: printer.computer.id,
          name: printer.computer.name
        }
      }));
    } catch (error) {
      console.error('Error fetching printers:', error);
      return [];
    }
  }

  /**
   * Get default printer for a specific computer
   */
  async getDefaultPrinter(computerId?: number): Promise<PrintNodePrinter | null> {
    try {
      const printers = await this.getAvailablePrinters();
      
      if (computerId) {
        // Find default printer for specific computer
        return printers.find(p => p.computer.id === computerId && p.default) || null;
      } else {
        // Find any default printer
        return printers.find(p => p.default) || printers[0] || null;
      }
    } catch (error) {
      console.error('Error getting default printer:', error);
      return null;
    }
  }

  /**
   * Print KOT only using PrintNode
   */
  async printKOT(receiptData: ReceiptData, printerId?: number): Promise<PrintJobResult> {
    try {
      // Get printer ID
      let targetPrinterId = printerId;
      
      if (!targetPrinterId) {
        const defaultPrinter = await this.getDefaultPrinter();
        if (!defaultPrinter) {
          return {
            success: false,
            error: 'No printer available'
          };
        }
        targetPrinterId = defaultPrinter.id;
      }

      // Print KOT only
      const kotContent = this.formatKOTForThermal(receiptData);
      const kotJob = {
        printer: targetPrinterId,
        content: this.unicodeToBase64(kotContent),
        contentType: 'raw_base64',
        source: 'MUJFOODCLUB',
        title: `KOT ${receiptData.order_number}`
      };

      const kotResponse = await this.makeRequest('/printjobs', {
        method: 'POST',
        body: JSON.stringify(kotJob)
      });

      if (!kotResponse.ok) {
        throw new Error(`KOT print failed: HTTP ${kotResponse.status}: ${kotResponse.statusText}`);
      }

      const kotResult = await kotResponse.json();

      return {
        success: true,
        jobId: kotResult.id
      };

    } catch (error) {
      console.error('PrintNode KOT print error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Print Order Receipt only using PrintNode
   */
  async printOrderReceipt(receiptData: ReceiptData, printerId?: number): Promise<PrintJobResult> {
    try {
      // Get printer ID
      let targetPrinterId = printerId;
      
      if (!targetPrinterId) {
        const defaultPrinter = await this.getDefaultPrinter();
        if (!defaultPrinter) {
          return {
            success: false,
            error: 'No printer available'
          };
        }
        targetPrinterId = defaultPrinter.id;
      }

      // Print Order Receipt only
      const receiptContent = this.formatReceiptForThermal(receiptData);
      const receiptJob = {
        printer: targetPrinterId,
        content: this.unicodeToBase64(receiptContent),
        contentType: 'raw_base64',
        source: 'MUJFOODCLUB',
        title: `Receipt ${receiptData.order_number}`
      };

      const receiptResponse = await this.makeRequest('/printjobs', {
        method: 'POST',
        body: JSON.stringify(receiptJob)
      });

      if (!receiptResponse.ok) {
        throw new Error(`Receipt print failed: HTTP ${receiptResponse.status}: ${receiptResponse.statusText}`);
      }

      const receiptResult = await receiptResponse.json();

      return {
        success: true,
        jobId: receiptResult.id
      };

    } catch (error) {
      console.error('PrintNode Order Receipt print error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Print both KOT and Order Receipt using PrintNode
   */
  async printReceipt(receiptData: ReceiptData, printerId?: number): Promise<PrintJobResult> {
    try {
      // Get printer ID
      let targetPrinterId = printerId;
      
      if (!targetPrinterId) {
        const defaultPrinter = await this.getDefaultPrinter();
        if (!defaultPrinter) {
          return {
            success: false,
            error: 'No printer available'
          };
        }
        targetPrinterId = defaultPrinter.id;
      }

      // Print KOT first
      const kotContent = this.formatKOTForThermal(receiptData);
      const kotJob = {
        printer: targetPrinterId,
        content: this.unicodeToBase64(kotContent),
        contentType: 'raw_base64',
        source: 'MUJFOODCLUB',
        title: `KOT ${receiptData.order_number}`
      };

      const kotResponse = await this.makeRequest('/printjobs', {
        method: 'POST',
        body: JSON.stringify(kotJob)
      });

      if (!kotResponse.ok) {
        throw new Error(`KOT print failed: HTTP ${kotResponse.status}: ${kotResponse.statusText}`);
      }

      // Add a small delay to ensure separate printing
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Print Order Receipt
      const receiptContent = this.formatReceiptForThermal(receiptData);
      const receiptJob = {
        printer: targetPrinterId,
        content: this.unicodeToBase64(receiptContent),
        contentType: 'raw_base64',
        source: 'MUJFOODCLUB',
        title: `Receipt ${receiptData.order_number}`
      };

      const receiptResponse = await this.makeRequest('/printjobs', {
        method: 'POST',
        body: JSON.stringify(receiptJob)
      });

      if (!receiptResponse.ok) {
        throw new Error(`Receipt print failed: HTTP ${receiptResponse.status}: ${receiptResponse.statusText}`);
      }

      const kotResult = await kotResponse.json();
      const receiptResult = await receiptResponse.json();

      return {
        success: true,
        jobId: receiptResult.id // Return the receipt job ID as primary
      };

    } catch (error) {
      console.error('PrintNode print error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Test print to verify setup
   */
  async testPrint(printerId?: number): Promise<PrintJobResult> {
    try {
      // ESC/POS commands
      const ESC = '\x1B';
      const BOLD_ON = ESC + '\x45\x01';  // Turn on bold
      const BOLD_OFF = ESC + '\x45\x00'; // Turn off bold
      const CUT_PAPER = '\x1D\x56\x00';  // Full cut
      const FEED_PAPER = '\x0A';         // Line feed
      
      const testReceipt = `${BOLD_ON}MUJ FOOD CLUB${BOLD_OFF}
Test Print
========================
This is a test print from
MUJFOODCLUB PrintNode Service
========================
Date: ${new Date().toLocaleDateString()}
Time: ${new Date().toLocaleTimeString()}
========================
If you can see this,
PrintNode is working!
========================
Thank you for using
MUJFOODCLUB!
${FEED_PAPER}${FEED_PAPER}${CUT_PAPER}`;

      // Get printer ID
      let targetPrinterId = printerId;
      
      if (!targetPrinterId) {
        const defaultPrinter = await this.getDefaultPrinter();
        if (!defaultPrinter) {
          return {
            success: false,
            error: 'No printer available for test'
          };
        }
        targetPrinterId = defaultPrinter.id;
      }

      // Create test print job
      const printJob = {
        printer: targetPrinterId,
        content: this.unicodeToBase64(testReceipt),
        contentType: 'raw_base64',
        source: 'MUJFOODCLUB',
        title: 'Test Print'
      };

      // Send test print job
      const response = await this.makeRequest('/printjobs', {
        method: 'POST',
        body: JSON.stringify(printJob)
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();

      return {
        success: true,
        jobId: result.id
      };

    } catch (error) {
      console.error('PrintNode test print error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Test print failed'
      };
    }
  }

  /**
   * Format customer receipt for thermal printing with ESC/POS commands
   */
  private formatReceiptForThermal(data: ReceiptData): string {
    const { order_number, cafe_name, customer_name, customer_phone, items, final_amount, payment_method } = data;
    
    // Calculate totals
    const subtotal = items.reduce((sum, item) => sum + item.total_price, 0);
    const cgst = subtotal * 0.025;
    const sgst = subtotal * 0.025;
    const totalTax = cgst + sgst;
    const discount = final_amount - (subtotal + totalTax);
    const totalQty = items.reduce((sum, item) => sum + item.quantity, 0);
    
    // Format date and time
    const now = new Date();
    const dateStr = now.toLocaleDateString('en-GB').replace(/\//g, '/');
    const timeStr = now.toLocaleTimeString('en-GB', { hour12: false }).substring(0, 5);
    
    // ESC/POS commands
    const ESC = '\x1B';
    const BOLD_ON = ESC + '\x45\x01';  // Turn on bold
    const BOLD_OFF = ESC + '\x45\x00'; // Turn off bold
    const CUT_PAPER = '\x1D\x56\x00';  // Full cut
    const FEED_PAPER = '\x0A';         // Line feed
    
    let receipt = `${BOLD_ON}        THE FOOD COURT CO${BOLD_OFF}
(MOMO STREET, GOBBLERS, KRISPP, TATA MYBRISTO)
        GSTIN : 08ADNPG4024A1Z2
--------------------------------
NAME: ${customer_name || 'WALK-IN CUSTOMER'} (M: ${customer_phone || 'N/A'})
DATE: ${dateStr}            ${payment_method?.toUpperCase() === 'COD' ? 'PICK UP' : 'DELIVERY'}
        ${timeStr}
CASHIER: BILLER
${BOLD_ON}BILL NO.: ${order_number}    TOKEN NO.: ${order_number.slice(-2)}${BOLD_OFF}
--------------------------------
ITEM                QTY    PRICE    AMOUNT
--------------------------------`;

    // Add items with bold formatting for item names
    items.forEach(item => {
      const itemName = item.name.toUpperCase().padEnd(20);
      const qty = item.quantity.toString().padStart(3);
      const price = item.unit_price.toFixed(2).padStart(6);
      const amount = item.total_price.toFixed(2).padStart(6);
      receipt += `\n${BOLD_ON}${itemName}${BOLD_OFF} ${qty}    ${price}    ${amount}`;
      
      if (item.special_instructions) {
        receipt += `\n  NOTE: ${item.special_instructions.toUpperCase()}`;
      }
    });

    receipt += `\n--------------------------------
TOTAL QTY: ${totalQty}
SUB TOTAL                    ${subtotal.toFixed(2)}
CGST@2.5 2.5%                ${cgst.toFixed(2)}
SGST@2.5 2.5%                ${sgst.toFixed(2)}
MUJFOODCLUB DISCOUNT        ${discount >= 0 ? '+' : ''}${discount.toFixed(2)}
--------------------------------
${BOLD_ON}        GRAND TOTAL    RS ${final_amount.toFixed(2)}${BOLD_OFF}
PAID VIA ${payment_method?.toUpperCase() || 'COD'} [UPI]
--------------------------------
        THANKS FOR VISIT!!
        MUJFOODCLUB
${FEED_PAPER}${FEED_PAPER}${CUT_PAPER}`;

    return receipt;
  }

  /**
   * Format KOT (Kitchen Order Ticket) for thermal printing with ESC/POS commands
   */
  private formatKOTForThermal(data: ReceiptData): string {
    const { order_number, cafe_name, items } = data;
    
    // Format date and time
    const now = new Date();
    const dateStr = now.toLocaleDateString('en-GB').replace(/\//g, '/');
    const timeStr = now.toLocaleTimeString('en-GB', { hour12: false }).substring(0, 5);
    
    // ESC/POS commands
    const ESC = '\x1B';
    const BOLD_ON = ESC + '\x45\x01';  // Turn on bold
    const BOLD_OFF = ESC + '\x45\x00'; // Turn off bold
    const CUT_PAPER = '\x1D\x56\x00';  // Full cut
    const FEED_PAPER = '\x0A';         // Line feed
    
    let kot = `${BOLD_ON}        THE FOOD COURT CO${BOLD_OFF}
--------------------------------
        ${dateStr} ${timeStr}
${BOLD_ON}        KOT - ${order_number.slice(-2)}${BOLD_OFF}
        PICK UP
--------------------------------
ITEM                SPECIAL NOTE QTY
--------------------------------`;

    // Add items with bold formatting for item names
    items.forEach(item => {
      const itemName = item.name.toUpperCase().padEnd(20);
      const specialNote = item.special_instructions ? item.special_instructions.substring(0, 10).toUpperCase() : '--';
      const qty = item.quantity.toString().padStart(3);
      kot += `\n${BOLD_ON}${itemName}${BOLD_OFF} ${specialNote.padEnd(15)} ${qty}`;
    });

    kot += `\n--------------------------------
${FEED_PAPER}${FEED_PAPER}${CUT_PAPER}`;

    return kot;
  }

  /**
   * Unicode-safe base64 encoding
   */
  private unicodeToBase64(str: string): string {
    try {
      // First encode to UTF-8 bytes, then to base64
      const utf8Bytes = new TextEncoder().encode(str);
      const base64 = btoa(String.fromCharCode(...utf8Bytes));
      return base64;
    } catch (error) {
      console.error('Base64 encoding error:', error);
      // Fallback: remove non-ASCII characters and encode
      const asciiStr = str.replace(/[^\x00-\x7F]/g, '?');
      return btoa(asciiStr);
    }
  }

  /**
   * Get account information
   */
  async getAccountInfo(): Promise<any> {
    try {
      const response = await this.makeRequest('/whoami');
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error getting account info:', error);
      return null;
    }
  }
}

// Create singleton instance
let printNodeService: PrintNodeService | null = null;

export const getPrintNodeService = (): PrintNodeService | null => {
  return printNodeService;
};

export const initializePrintNodeService = (config: PrintNodeConfig): PrintNodeService => {
  printNodeService = new PrintNodeService(config);
  return printNodeService;
};

export default PrintNodeService;