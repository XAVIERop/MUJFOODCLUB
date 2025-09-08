import { supabase } from '@/integrations/supabase/client';
import { PrintNodeService, PrintNodeConfig } from './printNodeService';
import { ezeepPrintService } from './ezeepPrintService';

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
  method?: string;
}

interface CafePrinterConfig {
  id: string;
  printer_name: string;
  printer_type: string;
  connection_type: string;
  printnode_printer_id?: number;
  ezeep_api_key?: string;
  ezeep_printer_id?: string;
  printer_ip?: string;
  printer_port?: number;
  com_port?: string;
  baud_rate?: number;
  paper_width: number;
  print_density: number;
  auto_cut: boolean;
}

/**
 * Unified Print Service - Single source of truth for all printing operations
 * This service handles cafe-specific printing with proper isolation and fallbacks
 */
class UnifiedPrintService {
  private printNodeService: PrintNodeService | null = null;
  private cafeConfigs: Map<string, CafePrinterConfig> = new Map();

  constructor() {
    this.initializePrintNode();
  }

  /**
   * Initialize PrintNode service with proper API key management
   */
  private initializePrintNode() {
    // Use the main PrintNode API key for all cafes
    const apiKey = import.meta.env.VITE_PRINTNODE_API_KEY || '';
    
    if (apiKey) {
      this.printNodeService = new PrintNodeService({
        apiKey: apiKey,
        baseUrl: 'https://api.printnode.com'
      });
      console.log('✅ Unified Print Service: PrintNode initialized with main API key');
    } else {
      console.log('⚠️ Unified Print Service: No PrintNode API key found');
    }
  }

  /**
   * Get cafe printer configuration from database
   */
  private async getCafePrinterConfig(cafeId: string): Promise<CafePrinterConfig | null> {
    // Check cache first
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
        printer_name: data.printer_name,
        printer_type: data.printer_type,
        connection_type: data.connection_type,
        printnode_printer_id: data.printnode_printer_id,
        printer_ip: data.printer_ip,
        printer_port: data.printer_port,
        com_port: data.com_port,
        baud_rate: data.baud_rate,
        paper_width: data.paper_width,
        print_density: data.print_density,
        auto_cut: data.auto_cut
      };

      // Cache the configuration
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
   * Print KOT for a specific cafe
   */
  async printKOT(receiptData: ReceiptData, cafeId: string): Promise<PrintResult> {
    console.log(`🔄 Unified Print Service: Printing KOT for cafe ${cafeId}`);
    
    try {
      // Get cafe printer configuration
      const config = await this.getCafePrinterConfig(cafeId);
      if (!config) {
        return { 
          success: false, 
          error: 'No printer configuration found for this cafe',
          method: 'none'
        };
      }

      // Get proper cafe name for formatting
      const cafeName = await this.getCafeName(cafeId);
      const formattedReceiptData = { ...receiptData, cafe_name: cafeName };

      // Try Ezeep first if configured
      if (config.ezeep_api_key && config.ezeep_printer_id) {
        console.log(`🖨️ Using Ezeep for KOT (Printer ID: ${config.ezeep_printer_id})`);
        
        const result = await ezeepPrintService.printKOT(formattedReceiptData, cafeId);
        if (result.success) {
          return {
            success: true,
            method: 'ezeep',
            jobId: result.error // Ezeep returns job ID in error field
          };
        }
        console.log('⚠️ Ezeep KOT failed, falling back to PrintNode');
      }

      // Try PrintNode if configured
      if (this.printNodeService && config.printnode_printer_id) {
        console.log(`🖨️ Using PrintNode for KOT (Printer ID: ${config.printnode_printer_id})`);
        const result = await this.printNodeService.printKOT(formattedReceiptData, config.printnode_printer_id);
        if (result.success) {
          return { ...result, method: 'printnode' };
        }
        console.log('⚠️ PrintNode KOT failed, falling back to browser printing');
      }

      // Fallback to browser printing
      console.log('🌐 Using browser printing for KOT');
      return await this.printKOTViaBrowser(formattedReceiptData, config);

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
   * Print Receipt for a specific cafe
   */
  async printReceipt(receiptData: ReceiptData, cafeId: string): Promise<PrintResult> {
    console.log(`🔄 Unified Print Service: Printing Receipt for cafe ${cafeId}`);
    
    try {
      // Get cafe printer configuration
      const config = await this.getCafePrinterConfig(cafeId);
      if (!config) {
        return { 
          success: false, 
          error: 'No printer configuration found for this cafe',
          method: 'none'
        };
      }

      // Get proper cafe name for formatting
      const cafeName = await this.getCafeName(cafeId);
      const formattedReceiptData = { ...receiptData, cafe_name: cafeName };

      // Try Ezeep first if configured
      if (config.ezeep_api_key && config.ezeep_printer_id) {
        console.log(`🖨️ Using Ezeep for Receipt (Printer ID: ${config.ezeep_printer_id})`);
        
        const result = await ezeepPrintService.printReceipt(formattedReceiptData, cafeId);
        if (result.success) {
          return {
            success: true,
            method: 'ezeep',
            jobId: result.error // Ezeep returns job ID in error field
          };
        }
        console.log('⚠️ Ezeep Receipt failed, falling back to PrintNode');
      }

      // Try PrintNode if configured
      if (this.printNodeService && config.printnode_printer_id) {
        console.log(`🖨️ Using PrintNode for Receipt (Printer ID: ${config.printnode_printer_id})`);
        const result = await this.printNodeService.printOrderReceipt(formattedReceiptData, config.printnode_printer_id);
        if (result.success) {
          return { ...result, method: 'printnode' };
        }
        console.log('⚠️ PrintNode Receipt failed, falling back to browser printing');
      }

      // Fallback to browser printing
      console.log('🌐 Using browser printing for Receipt');
      return await this.printReceiptViaBrowser(formattedReceiptData, config);

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
    console.log(`🔄 Unified Print Service: Printing both KOT and Receipt for cafe ${cafeId}`);
    
    try {
      const kotResult = await this.printKOT(receiptData, cafeId);
      const receiptResult = await this.printReceipt(receiptData, cafeId);

      if (kotResult.success && receiptResult.success) {
        return {
          success: true,
          method: `${kotResult.method}+${receiptResult.method}`,
          jobId: `${kotResult.jobId || 'kot'}+${receiptResult.jobId || 'receipt'}`
        };
      } else {
        return {
          success: false,
          error: `KOT: ${kotResult.error || 'success'}, Receipt: ${receiptResult.error || 'success'}`,
          method: 'partial'
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
   * Print KOT via browser (fallback method)
   */
  private async printKOTViaBrowser(receiptData: ReceiptData, config: CafePrinterConfig): Promise<PrintResult> {
    try {
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        return { success: false, error: 'Could not open print window', method: 'browser' };
      }

      const kotHTML = this.generateKOTHTML(receiptData);
      printWindow.document.write(kotHTML);
      printWindow.document.close();
      
      // Auto-print after a short delay
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 500);

      return { success: true, method: 'browser' };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Browser print failed',
        method: 'browser'
      };
    }
  }

  /**
   * Print Receipt via browser (fallback method)
   */
  private async printReceiptViaBrowser(receiptData: ReceiptData, config: CafePrinterConfig): Promise<PrintResult> {
    try {
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        return { success: false, error: 'Could not open print window', method: 'browser' };
      }

      const receiptHTML = this.generateReceiptHTML(receiptData);
      printWindow.document.write(receiptHTML);
      printWindow.document.close();
      
      // Auto-print after a short delay
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 500);

      return { success: true, method: 'browser' };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Browser print failed',
        method: 'browser'
      };
    }
  }

  /**
   * Generate KOT HTML with cafe-specific formatting
   */
  private generateKOTHTML(data: ReceiptData): string {
    const isChatkara = data.cafe_name?.toLowerCase().includes('chatkara');
    const isFoodCourt = data.cafe_name?.toLowerCase().includes('food court');
    
    const now = new Date();
    const dateStr = now.toLocaleDateString('en-GB');
    const timeStr = now.toLocaleTimeString('en-GB', { hour12: false }).substring(0, 5);
    
    let kot = `<!DOCTYPE html>
<html>
<head>
    <title>KOT - ${data.order_number}</title>
    <style>
        body { font-family: monospace; font-size: 12px; margin: 0; padding: 10px; }
        .header { text-align: center; font-weight: bold; font-size: 16px; margin-bottom: 10px; }
        .items { margin: 10px 0; }
        .item { display: flex; justify-content: space-between; margin: 3px 0; }
        .footer { text-align: center; font-weight: bold; margin-top: 15px; }
        @media print { body { margin: 0; } }
    </style>
</head>
<body>
    <div class="header">KOT - ${data.order_number.slice(-2)}</div>
    <div class="header"><strong>${isChatkara ? 'DELIVERY' : 'PICK UP'}</strong></div>
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
    <div class="footer">${data.cafe_name?.toUpperCase() || 'MUJFOODCLUB'}</div>
</body>
</html>`;

    return kot;
  }

  /**
   * Generate Receipt HTML with cafe-specific formatting
   */
  private generateReceiptHTML(data: ReceiptData): string {
    const isChatkara = data.cafe_name?.toLowerCase().includes('chatkara');
    const isFoodCourt = data.cafe_name?.toLowerCase().includes('food court');
    
    const now = new Date();
    const dateStr = now.toLocaleDateString('en-GB');
    const timeStr = now.toLocaleTimeString('en-GB', { hour12: false }).substring(0, 5);
    
    let receipt = `<!DOCTYPE html>
<html>
<head>
    <title>Receipt - ${data.order_number}</title>
    <style>
        body { font-family: monospace; font-size: 12px; margin: 0; padding: 10px; }
        .header { text-align: center; font-weight: bold; font-size: 16px; margin-bottom: 10px; }
        .info { margin: 5px 0; }
        .items { margin: 10px 0; }
        .item { display: flex; justify-content: space-between; margin: 3px 0; }
        .total { font-weight: bold; font-size: 14px; text-align: center; margin: 10px 0; }
        .footer { text-align: center; font-weight: bold; margin-top: 15px; }
        @media print { body { margin: 0; } }
    </style>
</head>
<body>
    <div class="header">${data.cafe_name?.toUpperCase() || 'MUJ FOOD CLUB'}</div>
    <div class="info">Order: ${data.order_number}</div>
    <div class="info">Customer: ${data.customer_name}</div>
    <div class="info">Phone: ${data.customer_phone}</div>
    <div class="info">Block: ${data.delivery_block}</div>
    <div class="info">Date: ${dateStr} ${timeStr}</div>
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
   * Clear cached configurations (useful for testing)
   */
  clearCache(): void {
    this.cafeConfigs.clear();
  }
}

// Export singleton instance
export const unifiedPrintService = new UnifiedPrintService();
export default unifiedPrintService;
