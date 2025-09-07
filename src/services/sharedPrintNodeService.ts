import { supabase } from '@/integrations/supabase/client';
import { PrintNodeService, PrintNodeConfig } from './printNodeService';

interface CafePrinterConfig {
  id: string;
  cafe_id: string;
  printer_name: string;
  printer_type: string;
  connection_type: string;
  printnode_printer_id?: number; // Add this field to store PrintNode printer ID
  printer_ip?: string;
  printer_port?: number;
  com_port?: string;
  baud_rate?: number;
  bluetooth_address?: string;
  paper_width: number;
  print_density: number;
  auto_cut: boolean;
  is_active: boolean;
  is_default: boolean;
}

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

export class SharedPrintNodeService {
  private printNodeService: PrintNodeService;
  private cafeId: string;
  private cafePrinterConfig: CafePrinterConfig | null = null;

  constructor(cafeId: string) {
    this.cafeId = cafeId;
    
    // Use shared PrintNode account
    const printNodeConfig: PrintNodeConfig = {
      apiKey: import.meta.env.VITE_SHARED_PRINTNODE_API_KEY || '',
      baseUrl: 'https://api.printnode.com'
    };
    
    this.printNodeService = new PrintNodeService(printNodeConfig);
  }

  /**
   * Initialize the print service for a specific cafe
   */
  async initialize(): Promise<boolean> {
    try {
      // Fetch cafe-specific printer configuration
      const { data: printerConfig, error } = await supabase
        .from('cafe_printer_configs')
        .select('*')
        .eq('cafe_id', this.cafeId)
        .eq('is_active', true)
        .eq('is_default', true)
        .single();

      if (error) {
        console.error(`Error fetching printer config for cafe ${this.cafeId}:`, error);
        return false;
      }

      this.cafePrinterConfig = printerConfig;

      console.log(`✅ Shared PrintNode service initialized for cafe ${this.cafeId}:`, {
        printerName: printerConfig.printer_name,
        printerType: printerConfig.printer_type,
        printnodePrinterId: printerConfig.printnode_printer_id
      });

      return true;
    } catch (error) {
      console.error(`Error initializing shared print service for cafe ${this.cafeId}:`, error);
      return false;
    }
  }

  /**
   * Print KOT for this specific cafe using their assigned printer ID
   */
  async printKOT(receiptData: ReceiptData): Promise<{ success: boolean; error?: string }> {
    try {
      if (!this.cafePrinterConfig) {
        await this.initialize();
      }

      if (!this.cafePrinterConfig) {
        return { success: false, error: 'No printer configuration found for this cafe' };
      }

      // Use cafe-specific printer ID from database
      const printerId = this.cafePrinterConfig.printnode_printer_id;
      
      if (!printerId) {
        return { success: false, error: 'No PrintNode printer ID configured for this cafe' };
      }

      console.log(`Printing KOT to printer ID ${printerId} for cafe ${this.cafeId}`);

      const result = await this.printNodeService.printKOT(receiptData, printerId);
      
      return { success: result.success, error: result.error };
    } catch (error) {
      console.error(`Error printing KOT for cafe ${this.cafeId}:`, error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Print Receipt for this specific cafe using their assigned printer ID
   */
  async printReceipt(receiptData: ReceiptData): Promise<{ success: boolean; error?: string }> {
    try {
      if (!this.cafePrinterConfig) {
        await this.initialize();
      }

      if (!this.cafePrinterConfig) {
        return { success: false, error: 'No printer configuration found for this cafe' };
      }

      // Use cafe-specific printer ID from database
      const printerId = this.cafePrinterConfig.printnode_printer_id;
      
      if (!printerId) {
        return { success: false, error: 'No PrintNode printer ID configured for this cafe' };
      }

      console.log(`Printing Receipt to printer ID ${printerId} for cafe ${this.cafeId}`);

      const result = await this.printNodeService.printOrderReceipt(receiptData, printerId);
      
      return { success: result.success, error: result.error };
    } catch (error) {
      console.error(`Error printing receipt for cafe ${this.cafeId}:`, error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Get cafe printer configuration
   */
  getCafePrinterConfig(): CafePrinterConfig | null {
    return this.cafePrinterConfig;
  }

  /**
   * Test print for this cafe
   */
  async testPrint(): Promise<{ success: boolean; error?: string }> {
    try {
      const testData: ReceiptData = {
        order_id: 'test',
        order_number: 'TEST-001',
        cafe_name: 'Test Cafe',
        customer_name: 'Test Customer',
        customer_phone: '9999999999',
        delivery_block: 'B1',
        items: [{
          id: '1',
          name: 'Test Item',
          quantity: 1,
          unit_price: 100,
          total_price: 100
        }],
        subtotal: 100,
        tax_amount: 5,
        discount_amount: 0,
        final_amount: 105,
        payment_method: 'COD',
        order_date: new Date().toISOString(),
        estimated_delivery: '30 min',
        points_earned: 5,
        points_redeemed: 0
      };

      return await this.printKOT(testData);
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Test print failed' };
    }
  }
}

// Factory function to create shared print service
export const createSharedPrintService = (cafeId: string): SharedPrintNodeService => {
  return new SharedPrintNodeService(cafeId);
};
