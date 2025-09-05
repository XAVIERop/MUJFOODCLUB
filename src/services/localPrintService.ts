// Local Print Service Integration for MUJFOODCLUB
// This service communicates with the local print service running on cafe computers

interface Printer {
  id: string;
  name: string;
  type: string;
  connection: string;
  isDefault: boolean;
}

interface PrintResponse {
  success: boolean;
  message?: string;
  error?: string;
  printer?: string;
  timestamp?: string;
}

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

export class LocalPrintService {
  private baseUrl = 'http://localhost:8080';
  private timeout = 5000; // 5 seconds timeout

  /**
   * Check if the local print service is available
   */
  async isAvailable(): Promise<boolean> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const response = await fetch(`${this.baseUrl}/health`, {
        method: 'GET',
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
        },
      });

      clearTimeout(timeoutId);
      return response.ok;
    } catch (error) {
      console.log('Local print service not available:', error);
      return false;
    }
  }

  /**
   * Get available printers from the local print service
   */
  async getAvailablePrinters(): Promise<Printer[]> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const response = await fetch(`${this.baseUrl}/config`, {
        method: 'GET',
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
        },
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data.printers || [];
    } catch (error) {
      console.error('Failed to get available printers:', error);
      return [];
    }
  }

  /**
   * Print a receipt using the local print service
   */
  async printReceipt(receiptData: ReceiptData, printerId?: string): Promise<PrintResponse> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      // Get available printers to find the default if no printerId specified
      const printers = await this.getAvailablePrinters();
      const selectedPrinterId = printerId || printers.find(p => p.isDefault)?.id || 'default-thermal';

      const response = await fetch(`${this.baseUrl}/print`, {
        method: 'POST',
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          printerId: selectedPrinterId,
          orderData: receiptData,
        }),
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result: PrintResponse = await response.json();
      return result;
    } catch (error) {
      console.error('Failed to print receipt:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  /**
   * Test the local print service
   */
  async testPrint(): Promise<PrintResponse> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const response = await fetch(`${this.baseUrl}/test`, {
        method: 'POST',
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
        },
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result: PrintResponse = await response.json();
      return result;
    } catch (error) {
      console.error('Failed to test print:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  /**
   * Get service status and information
   */
  async getServiceStatus(): Promise<{
    available: boolean;
    printers: Printer[];
    serviceInfo?: any;
  }> {
    const available = await this.isAvailable();
    const printers = available ? await this.getAvailablePrinters() : [];

    let serviceInfo = null;
    if (available) {
      try {
        const response = await fetch(`${this.baseUrl}/health`);
        serviceInfo = await response.json();
      } catch (error) {
        console.error('Failed to get service info:', error);
      }
    }

    return {
      available,
      printers,
      serviceInfo,
    };
  }
}

// Export singleton instance
export const localPrintService = new LocalPrintService();

// Export types for use in components
export type { Printer, PrintResponse, ReceiptData };
