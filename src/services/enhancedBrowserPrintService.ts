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
 * Enhanced Browser Print Service - Free alternative to PrintNode
 * This service provides professional thermal printing using browser APIs
 * with fallbacks to local print servers and direct printer access
 */
class EnhancedBrowserPrintService {
  private cafeConfigs: Map<string, CafePrinterConfig> = new Map();

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
   * Print KOT for a specific cafe using enhanced browser printing
   */
  async printKOT(receiptData: ReceiptData, cafeId: string): Promise<PrintResult> {
    console.log(`🖨️ Enhanced Browser Print: Printing KOT for cafe ${cafeId}`);
    
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

      // Try different printing methods based on configuration
      if (config.connection_type === 'network' && config.printer_ip) {
        // Try network printing first
        const networkResult = await this.printViaNetwork(formattedReceiptData, config, 'KOT');
        if (networkResult.success) return networkResult;
      }

      if (config.connection_type === 'usb' && config.com_port) {
        // Try USB printing
        const usbResult = await this.printViaUSB(formattedReceiptData, config, 'KOT');
        if (usbResult.success) return usbResult;
      }

      // Fallback to enhanced browser printing
      return await this.printViaEnhancedBrowser(formattedReceiptData, config, 'KOT');

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
   * Print Receipt for a specific cafe using enhanced browser printing
   */
  async printReceipt(receiptData: ReceiptData, cafeId: string): Promise<PrintResult> {
    console.log(`🖨️ Enhanced Browser Print: Printing Receipt for cafe ${cafeId}`);
    
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

      // Try different printing methods based on configuration
      if (config.connection_type === 'network' && config.printer_ip) {
        // Try network printing first
        const networkResult = await this.printViaNetwork(formattedReceiptData, config, 'RECEIPT');
        if (networkResult.success) return networkResult;
      }

      if (config.connection_type === 'usb' && config.com_port) {
        // Try USB printing
        const usbResult = await this.printViaUSB(formattedReceiptData, config, 'RECEIPT');
        if (usbResult.success) return usbResult;
      }

      // Fallback to enhanced browser printing
      return await this.printViaEnhancedBrowser(formattedReceiptData, config, 'RECEIPT');

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
    console.log(`🖨️ Enhanced Browser Print: Printing both KOT and Receipt for cafe ${cafeId}`);
    
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
   * Print via network printer (if local print server is available)
   */
  private async printViaNetwork(receiptData: ReceiptData, config: CafePrinterConfig, type: 'KOT' | 'RECEIPT'): Promise<PrintResult> {
    try {
      // Try to connect to local print server
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
          type: type
        })
      });

      if (response.ok) {
        return { success: true, method: 'network' };
      } else {
        throw new Error(`Network print failed: ${response.statusText}`);
      }
    } catch (error) {
      console.log('Network printing not available, falling back to browser printing');
      return { success: false, error: 'Network printing not available', method: 'network' };
    }
  }

  /**
   * Print via USB printer (if local print server is available)
   */
  private async printViaUSB(receiptData: ReceiptData, config: CafePrinterConfig, type: 'KOT' | 'RECEIPT'): Promise<PrintResult> {
    try {
      // Try to connect to local print server
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
          com_port: config.com_port,
          baud_rate: config.baud_rate || 9600,
          type: type
        })
      });

      if (response.ok) {
        return { success: true, method: 'usb' };
      } else {
        throw new Error(`USB print failed: ${response.statusText}`);
      }
    } catch (error) {
      console.log('USB printing not available, falling back to browser printing');
      return { success: false, error: 'USB printing not available', method: 'usb' };
    }
  }

  /**
   * Enhanced browser printing with thermal printer optimization
   */
  private async printViaEnhancedBrowser(receiptData: ReceiptData, config: CafePrinterConfig, type: 'KOT' | 'RECEIPT'): Promise<PrintResult> {
    try {
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        return { success: false, error: 'Could not open print window', method: 'browser' };
      }

      const content = type === 'KOT' 
        ? this.generateKOTHTML(receiptData, config)
        : this.generateReceiptHTML(receiptData, config);

      printWindow.document.write(content);
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
   * Generate KOT HTML optimized for thermal printing
   */
  private generateKOTHTML(data: ReceiptData, config: CafePrinterConfig): string {
    const isChatkara = data.cafe_name?.toLowerCase().includes('chatkara');
    const isFoodCourt = data.cafe_name?.toLowerCase().includes('food court');
    
    const now = new Date();
    const dateStr = now.toLocaleDateString('en-GB');
    const timeStr = now.toLocaleTimeString('en-GB', { hour12: false }).substring(0, 5);
    
    return `<!DOCTYPE html>
<html>
<head>
    <title>KOT - ${data.order_number}</title>
    <style>
        @page {
            size: ${config.paper_width}mm auto;
            margin: 0;
        }
        
        @media print {
            * {
                -webkit-print-color-adjust: exact !important;
                color-adjust: exact !important;
            }
            
            body { 
                width: ${config.paper_width}mm !important;
                max-width: ${config.paper_width}mm !important;
                margin: 0 !important; 
                padding: 3mm !important;
                font-family: 'Courier New', monospace !important;
                font-size: ${config.print_density + 3}px !important;
                line-height: 1.1 !important;
                color: #000 !important;
                background: #fff !important;
            }
            .no-print { display: none !important; }
        }
        
        body {
            font-family: 'Courier New', monospace;
            font-size: ${config.print_density + 3}px;
            line-height: 1.1;
            color: #000;
            background: #fff;
            width: ${config.paper_width}mm;
            max-width: ${config.paper_width}mm;
            margin: 0;
            padding: 3mm;
        }
        
        .receipt {
            width: 100%;
        }
        
        .cafe-name {
            font-size: ${config.print_density + 5}px;
            font-weight: bold;
            text-align: center;
            margin-bottom: 8px;
            text-transform: uppercase;
        }
        
        .items-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 6px;
            font-size: ${config.print_density + 1}px;
        }
        
        .items-table th {
            text-align: left;
            border-bottom: 1px solid #000;
            padding: 1px 0;
            font-weight: normal;
        }
        
        .items-table td {
            padding: 1px 0;
        }
        
        .footer {
            text-align: center;
            margin-top: 8px;
            font-size: ${config.print_density + 2}px;
            font-weight: bold;
        }
    </style>
</head>
<body>
    <div class="receipt">
        <div class="cafe-name">KOT - ${data.order_number.slice(-2)}</div>
        <div class="cafe-name"><strong>${isChatkara ? 'DELIVERY' : 'PICK UP'}</strong></div>
        <div class="info">${dateStr} ${timeStr}</div>
        <hr>
        <table class="items-table">
            <thead>
                <tr>
                    <th>ITEM</th>
                    <th>QTY</th>
                </tr>
            </thead>
            <tbody>
                ${data.items.map(item => `
                    <tr>
                        <td>${item.name.toUpperCase()}</td>
                        <td>${item.quantity}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
        <hr>
        <div class="footer">THANKS FOR VISIT!!</div>
        <div class="footer">${data.cafe_name?.toUpperCase() || 'MUJFOODCLUB'}</div>
    </div>
</body>
</html>`;
  }

  /**
   * Generate Receipt HTML optimized for thermal printing
   */
  private generateReceiptHTML(data: ReceiptData, config: CafePrinterConfig): string {
    const isChatkara = data.cafe_name?.toLowerCase().includes('chatkara');
    const isFoodCourt = data.cafe_name?.toLowerCase().includes('food court');
    
    const now = new Date();
    const dateStr = now.toLocaleDateString('en-GB');
    const timeStr = now.toLocaleTimeString('en-GB', { hour12: false }).substring(0, 5);
    
    return `<!DOCTYPE html>
<html>
<head>
    <title>Receipt - ${data.order_number}</title>
    <style>
        @page {
            size: ${config.paper_width}mm auto;
            margin: 0;
        }
        
        @media print {
            * {
                -webkit-print-color-adjust: exact !important;
                color-adjust: exact !important;
            }
            
            body { 
                width: ${config.paper_width}mm !important;
                max-width: ${config.paper_width}mm !important;
                margin: 0 !important; 
                padding: 3mm !important;
                font-family: 'Courier New', monospace !important;
                font-size: ${config.print_density + 3}px !important;
                line-height: 1.1 !important;
                color: #000 !important;
                background: #fff !important;
            }
            .no-print { display: none !important; }
        }
        
        body {
            font-family: 'Courier New', monospace;
            font-size: ${config.print_density + 3}px;
            line-height: 1.1;
            color: #000;
            background: #fff;
            width: ${config.paper_width}mm;
            max-width: ${config.paper_width}mm;
            margin: 0;
            padding: 3mm;
        }
        
        .receipt {
            width: 100%;
        }
        
        .cafe-name {
            font-size: ${config.print_density + 5}px;
            font-weight: bold;
            text-align: center;
            margin-bottom: 8px;
            text-transform: uppercase;
        }
        
        .customer-info {
            margin-bottom: 6px;
            font-size: ${config.print_density + 1}px;
        }
        
        .items-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 6px;
            font-size: ${config.print_density + 1}px;
        }
        
        .items-table th {
            text-align: left;
            border-bottom: 1px solid #000;
            padding: 1px 0;
            font-weight: normal;
        }
        
        .items-table td {
            padding: 1px 0;
        }
        
        .summary {
            margin-top: 6px;
            font-size: ${config.print_density + 1}px;
        }
        
        .footer {
            text-align: center;
            margin-top: 8px;
            font-size: ${config.print_density + 2}px;
            font-weight: bold;
        }
    </style>
</head>
<body>
    <div class="receipt">
        <div class="cafe-name">${data.cafe_name?.toUpperCase() || 'MUJ FOOD CLUB'}</div>
        
        <div class="customer-info">
            <div>Name: ${data.customer_name} (M: ${data.customer_phone})</div>
            <div>Block: ${data.delivery_block}</div>
        </div>
        
        <div class="order-details">
            <div>Date: ${dateStr}</div>
            <div>Time: ${timeStr}</div>
            <div>Order: ${data.order_number}</div>
        </div>
        
        <table class="items-table">
            <thead>
                <tr>
                    <th>Item</th>
                    <th>Qty.</th>
                    <th>Price</th>
                    <th>Amount</th>
                </tr>
            </thead>
            <tbody>
                ${data.items.map(item => `
                    <tr>
                        <td>${item.name}</td>
                        <td>${item.quantity}</td>
                        <td>${item.unit_price.toFixed(2)}</td>
                        <td>${item.total_price.toFixed(2)}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
        
        <div class="summary">
            <div>Total: ₹${data.final_amount.toFixed(2)}</div>
            <div>Payment: ${data.payment_method.toUpperCase()}</div>
        </div>
        
        <div class="footer">Thank you for your order!</div>
    </div>
</body>
</html>`;
  }

  /**
   * Format KOT for thermal printing (raw format)
   */
  private formatKOTForThermal(data: ReceiptData): string {
    const isChatkara = data.cafe_name?.toLowerCase().includes('chatkara');
    const now = new Date();
    const dateStr = now.toLocaleDateString('en-GB');
    const timeStr = now.toLocaleTimeString('en-GB', { hour12: false }).substring(0, 5);
    
    let kot = `----------------------------------------
${dateStr} ${timeStr}
KOT - ${data.order_number.slice(-2)}
${isChatkara ? 'DELIVERY' : 'PICK UP'}
----------------------------------------
ITEM            QTY
----------------------------------------`;

    data.items.forEach(item => {
      const itemName = item.name.toUpperCase().substring(0, 18).padEnd(18);
      const qty = item.quantity.toString().padStart(2);
      kot += `\n${itemName} ${qty}`;
    });

    kot += `\n----------------------------------------
THANKS FOR VISIT!!
${data.cafe_name?.toUpperCase() || 'MUJFOODCLUB'}
----------------------------------------`;

    return kot;
  }

  /**
   * Format Receipt for thermal printing (raw format)
   */
  private formatReceiptForThermal(data: ReceiptData): string {
    const isChatkara = data.cafe_name?.toLowerCase().includes('chatkara');
    const isFoodCourt = data.cafe_name?.toLowerCase().includes('food court');
    
    const now = new Date();
    const dateStr = now.toLocaleDateString('en-GB');
    const timeStr = now.toLocaleTimeString('en-GB', { hour12: false }).substring(0, 5);
    
    let receipt = `        ${data.cafe_name?.toUpperCase() || 'MUJ FOOD CLUB'}
    ----------------------------------------
    Name: ${data.customer_name} (M: ${data.customer_phone})
    Block: ${data.delivery_block}
    Date: ${dateStr} ${timeStr}
    Order: ${data.order_number}
    ----------------------------------------
    Item                    Qty. Price Amount
    ----------------------------------------`;

    data.items.forEach(item => {
      const itemName = item.name.toUpperCase().substring(0, 20).padEnd(20);
      const qty = item.quantity.toString().padStart(2);
      const price = item.unit_price.toFixed(0).padStart(4);
      const amount = item.total_price.toFixed(0).padStart(5);
      receipt += `\n    ${itemName} ${qty}    ${price}    ${amount}`;
    });

    receipt += `\n    ----------------------------------------
    Total: ₹${data.final_amount.toFixed(2)}
    Payment: ${data.payment_method.toUpperCase()}
    ----------------------------------------
    Thank you for your order!
    ----------------------------------------`;

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
export const enhancedBrowserPrintService = new EnhancedBrowserPrintService();
export default enhancedBrowserPrintService;
