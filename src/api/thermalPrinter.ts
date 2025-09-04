// Thermal Printer API Service for PIXEL DP80
// This service handles direct communication with thermal printers

export interface PrintJob {
  orderId: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  customerBlock: string;
  items: Array<{
    name: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }>;
  totalAmount: number;
  paymentMethod: string;
  orderTime: string;
  status: string;
}

export interface PrinterStatus {
  isConnected: boolean;
  isReady: boolean;
  paperStatus: 'ok' | 'low' | 'empty';
  errorMessage?: string;
}

export interface PrintResult {
  success: boolean;
  jobId: string;
  message: string;
  timestamp: string;
}

class ThermalPrinterService {
  private baseUrl: string;
  private printerId: string;

  constructor() {
    this.baseUrl = process.env.NODE_ENV === 'production' 
      ? 'https://mujfoodclub.in/api' 
      : 'http://localhost:3001/api';
    this.printerId = 'epson-tm-t82-foodcourt';
  }

  // Check printer connection status
  async getPrinterStatus(): Promise<PrinterStatus> {
    try {
      const response = await fetch(`${this.baseUrl}/thermal-printer/status/${this.printerId}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error checking printer status:', error);
      return {
        isConnected: false,
        isReady: false,
        paperStatus: 'empty',
        errorMessage: 'Failed to connect to printer service'
      };
    }
  }

  // Print receipt directly to PIXEL DP80
  async printReceipt(printJob: PrintJob): Promise<PrintResult> {
    try {
      const response = await fetch(`${this.baseUrl}/thermal-printer/print`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          printerId: this.printerId,
          printJob,
          options: {
            paperWidth: '80mm',
            autoCut: true,
            printDensity: 'high',
            printSpeed: 'normal'
          }
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      // Log successful print job
      console.log(`Receipt printed successfully: ${printJob.orderNumber}`, result);
      
      return result;
    } catch (error) {
      console.error('Error printing receipt:', error);
      throw new Error(`Failed to print receipt: ${error.message}`);
    }
  }

  // Print test page
  async printTestPage(): Promise<PrintResult> {
    const testJob: PrintJob = {
      orderId: 'test-001',
      orderNumber: 'TEST001',
      customerName: 'Test Customer',
      customerPhone: '+91 98765 43210',
      customerBlock: 'B1',
      items: [
        { name: 'Test Item 1', quantity: 2, unitPrice: 150, totalPrice: 300 },
        { name: 'Test Item 2', quantity: 1, unitPrice: 200, totalPrice: 200 }
      ],
      totalAmount: 500,
      paymentMethod: 'TEST',
      orderTime: new Date().toISOString(),
      status: 'test'
    };

    return this.printReceipt(testJob);
  }

  // Get print queue status
  async getPrintQueue(): Promise<Array<PrintJob>> {
    try {
      const response = await fetch(`${this.baseUrl}/thermal-printer/queue/${this.printerId}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error getting print queue:', error);
      return [];
    }
  }

  // Clear print queue
  async clearPrintQueue(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/thermal-printer/queue/${this.printerId}/clear`, {
        method: 'DELETE',
      });
      return response.ok;
    } catch (error) {
      console.error('Error clearing print queue:', error);
      return false;
    }
  }

  // Retry failed print job
  async retryPrintJob(jobId: string): Promise<PrintResult> {
    try {
      const response = await fetch(`${this.baseUrl}/thermal-printer/retry/${jobId}`, {
        method: 'POST',
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error retrying print job:', error);
      throw new Error(`Failed to retry print job: ${error.message}`);
    }
  }
}

// Export singleton instance
export const thermalPrinterService = new ThermalPrinterService();

// Helper function to format print job from order data
export const formatOrderForPrinting = (order: any, orderItems: any[]): PrintJob => {
  return {
    orderId: order.id,
    orderNumber: order.order_number,
    customerName: order.user?.full_name || order.customer_name || 'Walk-in Customer',
    customerPhone: order.user?.phone || order.phone_number || 'N/A',
    customerBlock: order.user?.block || order.delivery_block || 'N/A',
    items: orderItems.map(item => ({
      name: item.menu_item.name,
      quantity: item.quantity,
      unitPrice: item.unit_price,
      totalPrice: item.total_price
    })),
    totalAmount: order.total_amount,
    paymentMethod: order.payment_method || 'COD',
    orderTime: order.created_at,
    status: order.status
  };
};
