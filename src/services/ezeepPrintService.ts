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
  method: string;
}

interface CafePrinterConfig {
  id: string;
  cafe_id: string;
  printer_name: string;
  printer_type: string;
  connection_type: string;
  ezeep_printer_id?: string;
  ezeep_api_key?: string;
  is_active: boolean;
  is_default: boolean;
}

/**
 * Ezeep Print Service - Cloud-based printing solution
 * This service integrates with Ezeep for hassle-free thermal printing
 */
class EzeepPrintService {
  private cafeConfigs: Map<string, CafePrinterConfig> = new Map();

  /**
   * Get cafe printer configuration from database
   */
  private async getCafePrinterConfig(cafeId: string): Promise<CafePrinterConfig | null> {
    if (this.cafeConfigs.has(cafeId)) {
      return this.cafeConfigs.get(cafeId)!;
    }

    try {
      const { data, error } = await supabase
        .from('cafe_printer_configs')
        .select('*')
        .eq('cafe_id', cafeId)
        .eq('is_active', true)
        .eq('is_default', true)
        .single();

      if (error) {
        console.error(`Error fetching printer config for cafe ${cafeId}:`, error);
        return null;
      }

      const config: CafePrinterConfig = {
        id: data.id,
        cafe_id: data.cafe_id,
        printer_name: data.printer_name,
        printer_type: data.printer_type,
        connection_type: data.connection_type,
        ezeep_printer_id: data.ezeep_printer_id,
        ezeep_api_key: data.ezeep_api_key,
        is_active: data.is_active,
        is_default: data.is_default
      };

      this.cafeConfigs.set(cafeId, config);
      return config;
    } catch (error) {
      console.error(`Error getting cafe printer config for ${cafeId}:`, error);
      return null;
    }
  }

  /**
   * Get cafe name for proper receipt formatting
   */
  private async getCafeName(cafeId: string): Promise<string> {
    try {
      const { data, error } = await supabase
        .from('cafes')
        .select('name')
        .eq('id', cafeId)
        .single();

      if (error) {
        console.error(`Error fetching cafe name for ${cafeId}:`, error);
        return 'Unknown Cafe';
      }

      return data.name || 'Unknown Cafe';
    } catch (error) {
      console.error(`Error getting cafe name for ${cafeId}:`, error);
      return 'Unknown Cafe';
    }
  }

  /**
   * Print KOT for a specific cafe using Ezeep
   */
  async printKOT(receiptData: ReceiptData, cafeId: string): Promise<PrintResult> {
    console.log(`🖨️ Ezeep Print: Printing KOT for cafe ${cafeId}`);
    
    try {
      const config = await this.getCafePrinterConfig(cafeId);
      if (!config) {
        return { 
          success: false, 
          error: 'No printer configuration found for this cafe',
          method: 'none'
        };
      }

      if (!config.ezeep_api_key || !config.ezeep_printer_id) {
        return { 
          success: false, 
          error: 'Ezeep configuration not found. Please set up Ezeep for this cafe.',
          method: 'ezeep_missing'
        };
      }

      const cafeName = await this.getCafeName(cafeId);
      const formattedReceiptData = { ...receiptData, cafe_name: cafeName };

      const content = this.formatKOTForEzeep(formattedReceiptData);
      
      const result = await this.sendToEzeep(content, config, 'KOT');
      return result;

    } catch (error) {
      console.error(`Error printing KOT for cafe ${cafeId}:`, error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error',
        method: 'error'
      };
    }
  }

  /**
   * Print Receipt for a specific cafe using Ezeep
   */
  async printReceipt(receiptData: ReceiptData, cafeId: string): Promise<PrintResult> {
    console.log(`🖨️ Ezeep Print: Printing Receipt for cafe ${cafeId}`);
    
    try {
      const config = await this.getCafePrinterConfig(cafeId);
      if (!config) {
        return { 
          success: false, 
          error: 'No printer configuration found for this cafe',
          method: 'none'
        };
      }

      if (!config.ezeep_api_key || !config.ezeep_printer_id) {
        return { 
          success: false, 
          error: 'Ezeep configuration not found. Please set up Ezeep for this cafe.',
          method: 'ezeep_missing'
        };
      }

      const cafeName = await this.getCafeName(cafeId);
      const formattedReceiptData = { ...receiptData, cafe_name: cafeName };

      const content = this.formatReceiptForEzeep(formattedReceiptData);
      
      const result = await this.sendToEzeep(content, config, 'RECEIPT');
      return result;

    } catch (error) {
      console.error(`Error printing receipt for cafe ${cafeId}:`, error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error',
        method: 'error'
      };
    }
  }

  /**
   * Print both KOT and Receipt for a specific cafe
   */
  async printBoth(receiptData: ReceiptData, cafeId: string): Promise<PrintResult> {
    console.log(`🖨️ Ezeep Print: Printing both KOT and Receipt for cafe ${cafeId}`);
    
    try {
      const kotResult = await this.printKOT(receiptData, cafeId);
      const receiptResult = await this.printReceipt(receiptData, cafeId);

      if (kotResult.success && receiptResult.success) {
        return {
          success: true,
          method: `ezeep_kot+receipt`,
        };
      } else {
        return {
          success: false,
          error: `KOT: ${kotResult.error || 'success'}, Receipt: ${receiptResult.error || 'success'}`,
          method: 'ezeep_partial'
        };
      }
    } catch (error) {
      console.error(`Error printing both for cafe ${cafeId}:`, error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error',
        method: 'error'
      };
    }
  }

  /**
   * Send content to Ezeep for printing
   */
  private async sendToEzeep(content: string, config: CafePrinterConfig, type: 'KOT' | 'RECEIPT'): Promise<PrintResult> {
    try {
      const ezeepUrl = 'https://api.ezeep.com/print';
      
      const response = await fetch(ezeepUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${config.ezeep_api_key}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          printer_id: config.ezeep_printer_id,
          content: content,
          format: 'raw',
          title: `${type} - ${new Date().toISOString()}`,
          options: {
            copies: 1,
            color: false,
            duplex: false
          }
        })
      });

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Ezeep print job sent successfully:', result);
        return { 
          success: true, 
          method: 'ezeep',
          error: `Print job ID: ${result.job_id || 'unknown'}`
        };
      } else {
        const errorData = await response.json();
        throw new Error(`Ezeep API error: ${errorData.message || response.statusText}`);
      }
    } catch (error) {
      console.error('❌ Ezeep printing failed:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Ezeep printing failed',
        method: 'ezeep'
      };
    }
  }

  /**
   * Format KOT for Ezeep printing (raw text format)
   */
  private formatKOTForEzeep(data: ReceiptData): string {
    const isChatkara = data.cafe_name?.toLowerCase().includes('chatkara');
    const now = new Date();
    const dateStr = now.toLocaleDateString('en-GB');
    const timeStr = now.toLocaleTimeString('en-GB', { hour12: false }).substring(0, 5);
    
    let kot = '';
    kot += '\x1B\x40'; // Initialize printer
    kot += '\x1B\x61\x01'; // Center align
    kot += '\x1B\x21\x30'; // Double height
    kot += `KOT - ${data.order_number.slice(-2)}\n`;
    kot += '\x1B\x21\x00'; // Normal height
    kot += '\x1B\x61\x01'; // Center align
    kot += `\x1B\x21\x08${isChatkara ? 'DELIVERY' : 'PICK UP'}\x1B\x21\x00\n`;
    kot += '\x1B\x61\x00'; // Left align
    kot += `${dateStr} ${timeStr}\n`;
    kot += '----------------------------------------\n';
    kot += '\x1B\x21\x08ITEM            QTY\x1B\x21\x00\n';
    kot += '----------------------------------------\n';

    data.items.forEach(item => {
      const itemName = item.name.toUpperCase().substring(0, 18).padEnd(18);
      const qty = item.quantity.toString().padStart(2);
      kot += `${itemName} ${qty}\n`;
    });

    kot += '----------------------------------------\n';
    kot += '\x1B\x61\x01'; // Center align
    kot += '\x1B\x21\x08THANKS FOR VISIT!!\x1B\x21\x00\n';
    kot += `\x1B\x21\x30${data.cafe_name?.toUpperCase() || 'MUJFOODCLUB'}\x1B\x21\x00\n`;
    kot += '\x1B\x61\x00'; // Left align
    kot += '\n\n\n'; // Feed paper
    kot += '\x1D\x56\x00'; // Cut paper

    return kot;
  }

  /**
   * Format Receipt for Ezeep printing (raw text format)
   */
  private formatReceiptForEzeep(data: ReceiptData): string {
    const isChatkara = data.cafe_name?.toLowerCase().includes('chatkara');
    const isFoodCourt = data.cafe_name?.toLowerCase().includes('food court');
    
    const now = new Date();
    const dateStr = now.toLocaleDateString('en-GB');
    const timeStr = now.toLocaleTimeString('en-GB', { hour12: false }).substring(0, 5);
    
    let receipt = '';
    receipt += '\x1B\x40'; // Initialize printer
    receipt += '\x1B\x61\x01'; // Center align
    receipt += '\x1B\x21\x30'; // Double height
    receipt += `${data.cafe_name?.toUpperCase() || 'MUJ FOOD CLUB'}\n`;
    receipt += '\x1B\x21\x00'; // Normal height
    receipt += '----------------------------------------\n';
    receipt += '\x1B\x61\x00'; // Left align
    receipt += `Name: ${data.customer_name} (M: ${data.customer_phone})\n`;
    receipt += `Block: ${data.delivery_block}\n`;
    receipt += `Date: ${dateStr} ${timeStr}\n`;
    receipt += `Order: ${data.order_number}\n`;
    receipt += '----------------------------------------\n';
    receipt += '\x1B\x21\x08Item                    Qty. Price Amount\x1B\x21\x00\n';
    receipt += '----------------------------------------\n';

    data.items.forEach(item => {
      const itemName = item.name.toUpperCase().substring(0, 20).padEnd(20);
      const qty = item.quantity.toString().padStart(2);
      const price = item.unit_price.toFixed(0).padStart(4);
      const amount = item.total_price.toFixed(0).padStart(5);
      receipt += `${itemName} ${qty}    ${price}    ${amount}\n`;
    });

    receipt += '----------------------------------------\n';
    receipt += `Total: ₹${data.final_amount.toFixed(2)}\n`;
    receipt += `Payment: ${data.payment_method.toUpperCase()}\n`;
    receipt += '----------------------------------------\n';
    receipt += '\x1B\x61\x01'; // Center align
    receipt += 'Thank you for your order!\n';
    receipt += '\x1B\x61\x00'; // Left align
    receipt += '\n\n\n'; // Feed paper
    receipt += '\x1D\x56\x00'; // Cut paper

    return receipt;
  }

  /**
   * Test print for a specific cafe
   */
  async testPrint(cafeId: string): Promise<PrintResult> {
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

    return await this.printKOT(testData, cafeId);
  }

  /**
   * Clear cached configurations
   */
  clearCache(): void {
    this.cafeConfigs.clear();
  }
}

// Export singleton instance
export const ezeepPrintService = new EzeepPrintService();
export default ezeepPrintService;


