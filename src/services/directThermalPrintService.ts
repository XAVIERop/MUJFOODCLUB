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
  printer_name: string;
  printer_type: string;
  connection_type: string;
  printer_ip?: string;
  printer_port?: number;
  com_port?: string;
  baud_rate?: number;
  paper_width: number;
  print_density: number;
  auto_cut: boolean;
}

/**
 * Direct Thermal Print Service - No browser printing, direct printer communication
 * This service uses multiple methods to print directly to thermal printers
 * without relying on browser printing limitations
 */
class DirectThermalPrintService {
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
        printer_name: data.printer_name,
        printer_type: data.printer_type,
        connection_type: data.connection_type,
        printer_ip: data.printer_ip,
        printer_port: data.printer_port,
        com_port: data.com_port,
        baud_rate: data.baud_rate,
        paper_width: data.paper_width,
        print_density: data.print_density,
        auto_cut: data.auto_cut
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
   * Print KOT for a specific cafe using direct thermal printing
   */
  async printKOT(receiptData: ReceiptData, cafeId: string): Promise<PrintResult> {
    console.log(`🖨️ Direct Thermal Print: Printing KOT for cafe ${cafeId}`);
    
    try {
      const config = await this.getCafePrinterConfig(cafeId);
      if (!config) {
        return { 
          success: false, 
          error: 'No printer configuration found for this cafe',
          method: 'none'
        };
      }

      const cafeName = await this.getCafeName(cafeId);
      const formattedReceiptData = { ...receiptData, cafe_name: cafeName };

      // Try different printing methods in order of preference
      const methods = [
        () => this.printViaLocalServer(formattedReceiptData, config, 'KOT'),
        () => this.printViaWebUSB(formattedReceiptData, config, 'KOT'),
        () => this.printViaNetworkAPI(formattedReceiptData, config, 'KOT'),
        () => this.printViaFileDownload(formattedReceiptData, config, 'KOT')
      ];

      for (const method of methods) {
        try {
          const result = await method();
          if (result.success) {
            return result;
          }
        } catch (error) {
          console.log(`Method failed, trying next:`, error);
        }
      }

      return { 
        success: false, 
        error: 'All printing methods failed',
        method: 'all_failed'
      };

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
   * Print Receipt for a specific cafe using direct thermal printing
   */
  async printReceipt(receiptData: ReceiptData, cafeId: string): Promise<PrintResult> {
    console.log(`🖨️ Direct Thermal Print: Printing Receipt for cafe ${cafeId}`);
    
    try {
      const config = await this.getCafePrinterConfig(cafeId);
      if (!config) {
        return { 
          success: false, 
          error: 'No printer configuration found for this cafe',
          method: 'none'
        };
      }

      const cafeName = await this.getCafeName(cafeId);
      const formattedReceiptData = { ...receiptData, cafe_name: cafeName };

      // Try different printing methods in order of preference
      const methods = [
        () => this.printViaLocalServer(formattedReceiptData, config, 'RECEIPT'),
        () => this.printViaWebUSB(formattedReceiptData, config, 'RECEIPT'),
        () => this.printViaNetworkAPI(formattedReceiptData, config, 'RECEIPT'),
        () => this.printViaFileDownload(formattedReceiptData, config, 'RECEIPT')
      ];

      for (const method of methods) {
        try {
          const result = await method();
          if (result.success) {
            return result;
          }
        } catch (error) {
          console.log(`Method failed, trying next:`, error);
        }
      }

      return { 
        success: false, 
        error: 'All printing methods failed',
        method: 'all_failed'
      };

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
    console.log(`🖨️ Direct Thermal Print: Printing both KOT and Receipt for cafe ${cafeId}`);
    
    try {
      const kotResult = await this.printKOT(receiptData, cafeId);
      const receiptResult = await this.printReceipt(receiptData, cafeId);

      if (kotResult.success && receiptResult.success) {
        return {
          success: true,
          method: `${kotResult.method}+${receiptResult.method}`,
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
   * Method 1: Print via Local Print Server (Best option)
   */
  private async printViaLocalServer(receiptData: ReceiptData, config: CafePrinterConfig, type: 'KOT' | 'RECEIPT'): Promise<PrintResult> {
    try {
      const printServerUrl = `http://localhost:8080/print`;
      const content = type === 'KOT' 
        ? this.formatKOTForThermal(receiptData)
        : this.formatReceiptForThermal(receiptData);

      const response = await fetch(printServerUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: content,
          printer_ip: config.printer_ip,
          printer_port: config.printer_port || 9100,
          com_port: config.com_port,
          baud_rate: config.baud_rate || 9600,
          type: type
        })
      });

      if (response.ok) {
        return { success: true, method: 'local_server' };
      } else {
        throw new Error(`Local server print failed: ${response.statusText}`);
      }
    } catch (error) {
      console.log('Local print server not available');
      return { success: false, error: 'Local server not available', method: 'local_server' };
    }
  }

  /**
   * Method 2: Print via WebUSB (Modern browsers)
   */
  private async printViaWebUSB(receiptData: ReceiptData, config: CafePrinterConfig, type: 'KOT' | 'RECEIPT'): Promise<PrintResult> {
    try {
      // Check if WebUSB is supported
      if (!('usb' in navigator)) {
        throw new Error('WebUSB not supported');
      }

      const content = type === 'KOT' 
        ? this.formatKOTForThermal(receiptData)
        : this.formatReceiptForThermal(receiptData);

      // Request USB device
      const device = await (navigator as any).usb.requestDevice({
        filters: [
          { classCode: 7 }, // Printer class
          { vendorId: 0x04b8 }, // Epson
          { vendorId: 0x0519 }, // Star Micronics
        ]
      });

      await device.open();
      await device.selectConfiguration(1);
      await device.claimInterface(0);

      // Send print data
      const encoder = new TextEncoder();
      const data = encoder.encode(content);
      await device.transferOut(1, data);

      await device.close();
      return { success: true, method: 'webusb' };

    } catch (error) {
      console.log('WebUSB printing not available:', error);
      return { success: false, error: 'WebUSB not available', method: 'webusb' };
    }
  }

  /**
   * Method 3: Print via Network API (Direct to printer)
   */
  private async printViaNetworkAPI(receiptData: ReceiptData, config: CafePrinterConfig, type: 'KOT' | 'RECEIPT'): Promise<PrintResult> {
    try {
      if (!config.printer_ip) {
        throw new Error('No printer IP configured');
      }

      const content = type === 'KOT' 
        ? this.formatKOTForThermal(receiptData)
        : this.formatReceiptForThermal(receiptData);

      // Direct network printing (if CORS allows)
      const printerUrl = `http://${config.printer_ip}:${config.printer_port || 9100}`;
      
      const response = await fetch(printerUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain',
        },
        body: content,
        mode: 'no-cors' // Bypass CORS for direct printer communication
      });

      // no-cors mode doesn't allow reading response, so assume success
      return { success: true, method: 'network_api' };

    } catch (error) {
      console.log('Network API printing not available:', error);
      return { success: false, error: 'Network API not available', method: 'network_api' };
    }
  }

  /**
   * Method 4: Print via File Download (Fallback)
   */
  private async printViaFileDownload(receiptData: ReceiptData, config: CafePrinterConfig, type: 'KOT' | 'RECEIPT'): Promise<PrintResult> {
    try {
      const content = type === 'KOT' 
        ? this.formatKOTForThermal(receiptData)
        : this.formatReceiptForThermal(receiptData);

      // Create and download a .prn file that can be sent to printer
      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `${type.toLowerCase()}_${receiptData.order_number}.prn`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      return { 
        success: true, 
        method: 'file_download',
        error: 'File downloaded - manually send to printer'
      };

    } catch (error) {
      console.log('File download printing failed:', error);
      return { success: false, error: 'File download failed', method: 'file_download' };
    }
  }

  /**
   * Format KOT for thermal printing (raw ESC/POS commands)
   */
  private formatKOTForThermal(data: ReceiptData): string {
    const isChatkara = data.cafe_name?.toLowerCase().includes('chatkara');
    const now = new Date();
    const dateStr = now.toLocaleDateString('en-GB');
    const timeStr = now.toLocaleTimeString('en-GB', { hour12: false }).substring(0, 5);
    
    // ESC/POS commands for thermal printing
    let kot = '\x1B\x40'; // Initialize printer
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
   * Format Receipt for thermal printing (raw ESC/POS commands)
   */
  private formatReceiptForThermal(data: ReceiptData): string {
    const isChatkara = data.cafe_name?.toLowerCase().includes('chatkara');
    const isFoodCourt = data.cafe_name?.toLowerCase().includes('food court');
    
    const now = new Date();
    const dateStr = now.toLocaleDateString('en-GB');
    const timeStr = now.toLocaleTimeString('en-GB', { hour12: false }).substring(0, 5);
    
    // ESC/POS commands for thermal printing
    let receipt = '\x1B\x40'; // Initialize printer
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
export const directThermalPrintService = new DirectThermalPrintService();
export default directThermalPrintService;
