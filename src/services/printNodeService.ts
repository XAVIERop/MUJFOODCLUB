import { ReceiptData } from '@/components/ReceiptGenerator';

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
   * Print a receipt using PrintNode
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

      // Format receipt for thermal printing
      const receiptContent = this.formatReceiptForThermal(receiptData);

      // Create print job
      const printJob = {
        printer: targetPrinterId,
        content: receiptContent,
        contentType: 'raw_base64',
        source: 'MUJFOODCLUB',
        title: `Receipt ${receiptData.order_number}`
      };

      // Send print job
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
      const testReceipt = `MUJ FOOD CLUB
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
MUJFOODCLUB!`;

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
        content: testReceipt,
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
   * Format receipt data for thermal printing
   */
  private formatReceiptForThermal(data: ReceiptData): string {
    const { order_number, cafe_name, customer_name, items, final_amount, payment_method } = data;
    
    let receipt = `MUJ FOOD CLUB
${cafe_name}
========================
Order: ${order_number}
Customer: ${customer_name}
========================`;

    // Add items
    items.forEach(item => {
      receipt += `\n${item.name} x${item.quantity}`;
      if (item.special_instructions) {
        receipt += `\n  Note: ${item.special_instructions}`;
      }
      receipt += `\n  ₹${item.total_price}`;
    });

    receipt += `\n========================
Total: ₹${final_amount}
Payment: ${payment_method?.toUpperCase() || 'COD'}
========================
Thank you for ordering!
MUJFOODCLUB
========================
${new Date().toLocaleString()}`;

    // Convert to base64 for PrintNode
    return btoa(receipt);
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