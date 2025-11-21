import { supabase } from '@/integrations/supabase/client';
import { PrintNodeService, PrintNodeConfig } from './printNodeService';

interface CafePrinterConfig {
  id: string;
  cafe_id: string;
  printer_name: string;
  printer_type: string;
  connection_type: string;
  printnode_printer_id?: number; // PrintNode printer ID for shared account
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
  cafes?: {
    name: string;
  };
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

export class CafeSpecificPrintService {
  private cafeId: string;
  private printNodeService: PrintNodeService | null = null;
  private cafePrinterConfig: CafePrinterConfig | null = null;

  constructor(cafeId: string) {
    this.cafeId = cafeId;
  }

  /**
   * Initialize the print service for a specific cafe
   */
  async initialize(): Promise<boolean> {
    try {
      console.log(`🔍 Initializing print service for cafe ${this.cafeId}...`);
      
      // Fetch cafe-specific printer configuration with cafe name
      console.log(`🔍 Fetching printer config for cafe_id: ${this.cafeId}`);
      const { data: printerConfig, error } = await supabase
        .from('cafe_printer_configs')
        .select(`
          *,
          cafes!inner(name)
        `)
        .eq('cafe_id', this.cafeId)
        .eq('is_active', true)
        .eq('is_default', true)
        .single();

      console.log(`🔍 Printer config query result:`, { printerConfig, error });

      if (error) {
        console.error(`Error fetching printer config for cafe ${this.cafeId}:`, error);
        return false;
      }

      this.cafePrinterConfig = printerConfig;

      // Initialize PrintNode service for all printer types (cafe-specific accounts)
      const apiKey = await this.getCafePrintNodeApiKey(printerConfig.cafe_id);
      if (apiKey) {
        // For each cafe, use their own PrintNode account
        const printNodeConfig: PrintNodeConfig = {
          apiKey: apiKey,
          baseUrl: 'https://api.printnode.com'
        };
        
        this.printNodeService = new PrintNodeService(printNodeConfig);
        console.log(`🖨️ PrintNode service initialized for cafe ${this.cafeId} with cafe-specific API key`);
      }

      console.log(`✅ Print service initialized for cafe ${this.cafeId}:`, {
        printerName: printerConfig.printer_name,
        printerType: printerConfig.printer_type,
        connectionType: printerConfig.connection_type,
        printnodePrinterId: printerConfig.printnode_printer_id
      });

      return true;
    } catch (error) {
      console.error(`Error initializing print service for cafe ${this.cafeId}:`, error);
      return false;
    }
  }

  /**
   * Get cafe-specific PrintNode API key
   * Each cafe has their own PrintNode account
   */
  private async getCafePrintNodeApiKey(cafeId: string): Promise<string> {
    // Get cafe name from database to determine which API key to use
    let cafeName = this.cafePrinterConfig?.cafes?.name || '';
    
    // If no printer config, fetch cafe name directly
    if (!cafeName) {
      try {
        const { data: cafe } = await supabase
          .from('cafes')
          .select('name')
          .eq('id', cafeId)
          .single();
        cafeName = cafe?.name || '';
      } catch (error) {
        console.error('Error fetching cafe name:', error);
      }
    }
    
    console.log(`🔍 Getting API key for cafe: ${cafeName} (ID: ${cafeId})`);
    
    // Return cafe-specific API key
    const normalizedCafeName = cafeName.toLowerCase();

    if (normalizedCafeName.includes('chatkara')) {
      console.log('✅ Using Chatkara API key');
      return import.meta.env.VITE_CHATKARA_PRINTNODE_API_KEY || '';
    } else if (normalizedCafeName.includes('food court')) {
      console.log('✅ Using Food Court API key');
      return import.meta.env.VITE_FOODCOURT_PRINTNODE_API_KEY || '';
    } else if (normalizedCafeName.includes('punjabi') && normalizedCafeName.includes('tadka')) {
      console.log('✅ Using Punjabi Tadka API key');
      return import.meta.env.VITE_PUNJABI_TADKA_PRINTNODE_API_KEY || '';
    } else if (normalizedCafeName.includes('munch') && normalizedCafeName.includes('box')) {
      console.log('✅ Using Munch Box API key');
      return import.meta.env.VITE_MUNCHBOX_PRINTNODE_API_KEY || '';
    } else if (normalizedCafeName.includes('pizza') && normalizedCafeName.includes('bakers')) {
      console.log('✅ Using Pizza Bakers API key');
      return import.meta.env.VITE_PIZZA_BAKERS_PRINTNODE_API_KEY || '';
    } else if (normalizedCafeName.includes('grabit')) {
      console.log('✅ Using Grabit API key');
      const apiKey = import.meta.env.VITE_GRABIT_PRINTNODE_API_KEY || import.meta.env.VITE_24_SEVEN_MART_PRINTNODE_API_KEY || '';
      if (!apiKey) {
        console.warn('⚠️ VITE_GRABIT_PRINTNODE_API_KEY not set, using fallback');
        return import.meta.env.VITE_PRINTNODE_API_KEY || '';
      }
      return apiKey;
    } else if (normalizedCafeName.includes('banna')) {
      console.log('✅ Using Banna\'s Chowki API key');
      const apiKey = import.meta.env.VITE_BANNAS_CHOWKI_PRINTNODE_API_KEY || '';
      if (!apiKey) {
        console.warn('⚠️ VITE_BANNAS_CHOWKI_PRINTNODE_API_KEY not set, using fallback');
        return import.meta.env.VITE_PRINTNODE_API_KEY || '';
      }
      return apiKey;
    } else if (normalizedCafeName.includes('amor')) {
      console.log('✅ Using Amor API key');
      const apiKey = import.meta.env.VITE_AMOR_PRINTNODE_API_KEY || '';
      if (!apiKey) {
        console.warn('⚠️ VITE_AMOR_PRINTNODE_API_KEY not set, using fallback');
        return import.meta.env.VITE_PRINTNODE_API_KEY || '';
      }
      return apiKey;
    } else if (normalizedCafeName.includes('stardom')) {
      console.log('✅ Using Stardom API key');
      const apiKey = import.meta.env.VITE_STARDOM_PRINTNODE_API_KEY || '';
      if (!apiKey) {
        console.warn('⚠️ VITE_STARDOM_PRINTNODE_API_KEY not set, using fallback');
        return import.meta.env.VITE_PRINTNODE_API_KEY || '';
      }
      return apiKey;
    }
    
    // Fallback to general API key
    console.log('⚠️ Using fallback API key');
    return import.meta.env.VITE_PRINTNODE_API_KEY || '';
  }

  /**
   * Print KOT for this specific cafe
   */
  async printKOT(receiptData: ReceiptData): Promise<{ success: boolean; error?: string }> {
    try {
      if (!this.cafePrinterConfig) {
        await this.initialize();
      }

      // If no printer config found, try direct PrintNode printing
      if (!this.cafePrinterConfig) {
        console.log(`No printer config found for cafe ${this.cafeId}, trying direct PrintNode printing...`);
        return await this.printDirectToPrintNode(receiptData, 'KOT');
      }

      // Use PrintNode with cafe-specific account and specific printer ID
      if (this.printNodeService && this.cafePrinterConfig.printnode_printer_id) {
        console.log(`Printing KOT using cafe-specific PrintNode account for cafe ${this.cafeId} to printer ID ${this.cafePrinterConfig.printnode_printer_id}`);
        const result = await this.printNodeService.printKOT(receiptData, this.cafePrinterConfig.printnode_printer_id);
        return { success: result.success, error: result.error };
      }

      // Fallback: Route to appropriate printer based on cafe configuration
      switch (this.cafePrinterConfig.printer_type) {
        case 'epson_tm_t82':
          return await this.printViaEpsonNetwork(receiptData, 'KOT');
        
        case 'pixel_thermal':
          return await this.printViaPixelThermal(receiptData, 'KOT');
        
        case 'browser_print':
        default:
          return await this.printViaBrowser(receiptData, 'KOT');
      }
    } catch (error) {
      console.error(`Error printing KOT for cafe ${this.cafeId}:`, error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Print directly to PrintNode when no database config exists
   */
  private async printDirectToPrintNode(receiptData: ReceiptData, type: 'KOT' | 'RECEIPT'): Promise<{ success: boolean; error?: string }> {
    try {
      // Get cafe-specific API key
      const apiKey = await this.getCafePrintNodeApiKey(this.cafeId);
      if (!apiKey) {
        return { success: false, error: 'No PrintNode API key found for this cafe' };
      }

      // Get cafe name to determine printer ID
      const { data: cafe } = await supabase
        .from('cafes')
        .select('name')
        .eq('id', this.cafeId)
        .single();

      if (!cafe) {
        return { success: false, error: 'Cafe not found' };
      }

      // Determine printer ID based on cafe
      let printerId: number;
      const normalizedCafeName = cafe.name.toLowerCase();

      if (normalizedCafeName.includes('chatkara')) {
        printerId = 74698272; // Chatkara POS-80-Series
      } else if (normalizedCafeName.includes('food court')) {
        printerId = 74692682; // Food Court EPSON TM-T82 Receipt
      } else if (normalizedCafeName.includes('punjabi') && normalizedCafeName.includes('tadka')) {
        printerId = 74782622; // Punjabi Tadka Printer (POS-60C)
      } else if (normalizedCafeName.includes('grabit')) {
        printerId = 74883417; // Grabit POS80 Printer
      } else if (normalizedCafeName.includes('banna')) {
        printerId = 74903987; // Banna's Chowki Printer
      } else if (normalizedCafeName.includes('amor')) {
        printerId = 74902514; // Amor POS80 Printer
      } else if (normalizedCafeName.includes('stardom')) {
        printerId = 74910967; // Stardom THERMAL Receipt Printer
      } else {
        return { success: false, error: 'No printer ID configured for this cafe' };
      }

      // Format content
      const content = type === 'KOT' 
        ? this.formatKOTForBrowser(receiptData)
        : this.formatReceiptForBrowser(receiptData);

      // Convert to base64
      const base64Content = btoa(content);

      // Send to PrintNode
      const response = await fetch('https://api.printnode.com/printjobs', {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${btoa(apiKey + ':')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          printer: { id: printerId },
          content: base64Content,
          contentType: 'raw_base64',
          source: `MUJ Food Club - ${cafe.name}`
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        return { success: false, error: `PrintNode API error: ${errorText}` };
      }

      const result = await response.json();
      console.log(`✅ ${type} sent to PrintNode successfully:`, result);
      return { success: true };

    } catch (error) {
      console.error(`Error printing ${type} directly to PrintNode:`, error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Print Receipt for this specific cafe
   */
  async printReceipt(receiptData: ReceiptData): Promise<{ success: boolean; error?: string }> {
    try {
      if (!this.cafePrinterConfig) {
        await this.initialize();
      }

      // If no printer config found, try direct PrintNode printing
      if (!this.cafePrinterConfig) {
        console.log(`No printer config found for cafe ${this.cafeId}, trying direct PrintNode printing...`);
        return await this.printDirectToPrintNode(receiptData, 'RECEIPT');
      }

      // Use PrintNode with cafe-specific account and specific printer ID
      if (this.printNodeService && this.cafePrinterConfig.printnode_printer_id) {
        console.log(`Printing Receipt using cafe-specific PrintNode account for cafe ${this.cafeId} to printer ID ${this.cafePrinterConfig.printnode_printer_id}`);
        const result = await this.printNodeService.printOrderReceipt(receiptData, this.cafePrinterConfig.printnode_printer_id);
        return { success: result.success, error: result.error };
      }

      // Fallback: Route to appropriate printer based on cafe configuration
      switch (this.cafePrinterConfig.printer_type) {
        case 'epson_tm_t82':
          return await this.printViaEpsonNetwork(receiptData, 'RECEIPT');
        
        case 'pixel_thermal':
          return await this.printViaPixelThermal(receiptData, 'RECEIPT');
        
        case 'browser_print':
        default:
          return await this.printViaBrowser(receiptData, 'RECEIPT');
      }
    } catch (error) {
      console.error(`Error printing receipt for cafe ${this.cafeId}:`, error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Print via Epson TM-T82 Network Printer
   */
  private async printViaEpsonNetwork(receiptData: ReceiptData, type: 'KOT' | 'RECEIPT'): Promise<{ success: boolean; error?: string }> {
    try {
      if (!this.cafePrinterConfig?.printer_ip) {
        return { success: false, error: 'Network printer IP not configured' };
      }

      // Use PrintNode service for network printing
      if (this.printNodeService) {
        const result = type === 'KOT' 
          ? await this.printNodeService.printKOT(receiptData)
          : await this.printNodeService.printOrderReceipt(receiptData);
        
        return { success: result.success, error: result.error };
      }

      // Fallback: Direct network printing (if PrintNode is not available)
      return await this.printViaDirectNetwork(receiptData, type);
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Network print failed' };
    }
  }

  /**
   * Print via Pixel Thermal USB Printer
   */
  private async printViaPixelThermal(receiptData: ReceiptData, type: 'KOT' | 'RECEIPT'): Promise<{ success: boolean; error?: string }> {
    try {
      // For USB printers, we'll use browser printing as fallback
      // In a real implementation, you'd use a USB printing library
      console.log(`Printing ${type} via Pixel Thermal USB for cafe ${this.cafeId}`);
      
      // For now, fallback to browser printing
      return await this.printViaBrowser(receiptData, type);
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'USB print failed' };
    }
  }

  /**
   * Print via Browser (Fallback)
   */
  private async printViaBrowser(receiptData: ReceiptData, type: 'KOT' | 'RECEIPT'): Promise<{ success: boolean; error?: string }> {
    try {
      const content = type === 'KOT' 
        ? this.formatKOTForBrowser(receiptData)
        : this.formatReceiptForBrowser(receiptData);

      // Open print dialog
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>${type} - ${receiptData.order_number}</title>
              <style>
                body { font-family: monospace; font-size: 12px; margin: 0; padding: 10px; }
                @media print { body { margin: 0; } }
              </style>
            </head>
            <body>
              <pre>${content}</pre>
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.print();
        printWindow.close();
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Browser print failed' };
    }
  }

  /**
   * Direct network printing (fallback when PrintNode is not available)
   */
  private async printViaDirectNetwork(receiptData: ReceiptData, type: 'KOT' | 'RECEIPT'): Promise<{ success: boolean; error?: string }> {
    try {
      // This would require a backend service to handle direct network printing
      // For now, we'll log and fallback to browser printing
      console.log(`Direct network printing ${type} to ${this.cafePrinterConfig?.printer_ip}:${this.cafePrinterConfig?.printer_port}`);
      
      // Fallback to browser printing
      return await this.printViaBrowser(receiptData, type);
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Direct network print failed' };
    }
  }

  /**
   * Format KOT for browser printing
   */
  private formatKOTForBrowser(data: ReceiptData): string {
    const { order_number, items, cafe_name } = data;
    
    const normalizedCafeName = cafe_name?.toLowerCase() || '';
    const isChatkara = normalizedCafeName.includes('chatkara');
    const isBannasChowki = normalizedCafeName.includes('banna');
    
    if (isChatkara || isBannasChowki) {
      return this.formatChatkaraKOT(data);
    } else {
      return this.formatGenericKOT(data);
    }
  }

  /**
   * Format Chatkara-specific KOT
   */
  private formatChatkaraKOT(data: ReceiptData): string {
    const { order_number, items } = data;
    const now = new Date();
    const dateStr = now.toLocaleDateString('en-GB');
    const timeStr = now.toLocaleTimeString('en-GB', { hour12: false }).substring(0, 5);
    
    let kot = `${dateStr} ${timeStr}
KOT - ${order_number.slice(-2)}
Pick Up

ITEM            QTY
----------------------------------------`;

    items.forEach(item => {
      const itemName = item.name.toUpperCase().substring(0, 18).padEnd(18);
      const qty = item.quantity.toString().padStart(2);
      kot += `\n${itemName} ${qty}`;
    });

    kot += `\n----------------------------------------
Thanks`;

    return kot;
  }

  /**
   * Format generic KOT (for non-Chatkara cafes)
   */
  private formatGenericKOT(data: ReceiptData): string {
    const { order_number, items } = data;
    const now = new Date();
    const dateStr = now.toLocaleDateString('en-GB');
    const timeStr = now.toLocaleTimeString('en-GB', { hour12: false }).substring(0, 5);
    
    let kot = `----------------------------------------
${dateStr} ${timeStr}
KOT - ${order_number.slice(-2)}
PICK UP
----------------------------------------
ITEM            QTY
----------------------------------------`;

    items.forEach(item => {
      const itemName = item.name.toUpperCase().substring(0, 18).padEnd(18);
      const qty = item.quantity.toString().padStart(2);
      kot += `\n${itemName} ${qty}`;
    });

    kot += `\n----------------------------------------
THANKS FOR VISIT!!
MUJFOODCLUB
----------------------------------------`;

    return kot;
  }

  /**
   * Format Receipt for browser printing
   */
  private formatReceiptForBrowser(data: ReceiptData): string {
    const { order_number, cafe_name, customer_name, customer_phone, items, final_amount, payment_method, delivery_block } = data;
    
    const normalizedCafeName = cafe_name?.toLowerCase() || '';
    const isChatkara = normalizedCafeName.includes('chatkara');
    const isGrabit = normalizedCafeName.includes('grabit');
    const isBannasChowki = normalizedCafeName.includes('banna');
    
    if (isChatkara || isGrabit || isBannasChowki) {
      return this.formatChatkaraReceipt(data);
    } else {
      return this.formatGenericReceipt(data);
    }
  }

  /**
   * Format Chatkara-specific receipt
   */
  private formatChatkaraReceipt(data: ReceiptData): string {
    const { order_number, cafe_name, customer_name, customer_phone, items, final_amount, delivery_block } = data;
    
    const subtotal = items.reduce((sum, item) => sum + item.total_price, 0);
    const totalQty = items.reduce((sum, item) => sum + item.quantity, 0);
    const deliveryCharge = final_amount - subtotal;
    
    const now = new Date();
    const dateStr = now.toLocaleDateString('en-GB');
    const timeStr = now.toLocaleTimeString('en-GB', { hour12: false }).substring(0, 5);
    
    let receipt = `${cafe_name.toUpperCase()}

Name: (M: ${customer_phone || '9999999999'})
Adr: ${delivery_block || 'N/A'}

Date: ${dateStr}
${timeStr}
Delivery
Cashier: biller
Bill No.: ${order_number}
Token No.: ${order_number}

Item                    Qty. Price Amount
----------------------------------------`;

    items.forEach(item => {
      const itemName = item.name.toUpperCase().substring(0, 20).padEnd(20);
      const qty = item.quantity.toString().padStart(2);
      const price = `rs${item.unit_price.toFixed(2)}`.padStart(8);
      const amount = `rs${item.total_price.toFixed(2)}`.padStart(8);
      receipt += `\n${itemName} ${qty}    ${price}    ${amount}`;
    });

    receipt += `
----------------------------------------
Total Qty: ${totalQty}
Sub Total: rs${subtotal.toFixed(2)}
Delivery Charge: rs${deliveryCharge.toFixed(2)}
Grand Total: rs${final_amount.toFixed(2)}

Thanks`;

    return receipt;
  }

  /**
   * Format generic receipt (for non-Chatkara cafes)
   */
  private formatGenericReceipt(data: ReceiptData): string {
    const { order_number, cafe_name, customer_name, customer_phone, items, final_amount, payment_method } = data;
    
    const subtotal = items.reduce((sum, item) => sum + item.total_price, 0);
    const cgst = subtotal * 0.025;
    const sgst = subtotal * 0.025;
    const totalTax = cgst + sgst;
    const discount = final_amount - (subtotal + totalTax);
    const totalQty = items.reduce((sum, item) => sum + item.quantity, 0);
    
    const now = new Date();
    const dateStr = now.toLocaleDateString('en-GB');
    const timeStr = now.toLocaleTimeString('en-GB', { hour12: false }).substring(0, 5);
    
    let receipt = `        ${cafe_name.toUpperCase()}
    GSTIN : 08ADNPG4024A1Z2
    ----------------------------------------
    Name: ${customer_name || 'WALK-IN'} (M: ${customer_phone || '9999999999'})
    Date: ${dateStr}    ${timeStr}    ${payment_method?.toUpperCase() === 'COD' ? 'Pick Up' : 'Delivery'}
    Cashier: biller    Bill No.: ${order_number}
    Token No.: ${order_number.slice(-2)}
    ----------------------------------------
    Item                    Qty. Price Amount
    ----------------------------------------`;

    items.forEach(item => {
      const itemName = item.name.toUpperCase().substring(0, 20).padEnd(20);
      const qty = item.quantity.toString().padStart(2);
      const price = `rs${item.unit_price.toFixed(0)}`.padStart(6);
      const amount = `rs${item.total_price.toFixed(0)}`.padStart(7);
      receipt += `\n    ${itemName} ${qty}    ${price}    ${amount}`;
    });

    receipt += `\n    ----------------------------------------
    Total Qty: ${totalQty}
    Sub                             rs${subtotal.toFixed(0)}
    Total                           rs${subtotal.toFixed(0)}
    CGST@2.5 2.5%                   rs${cgst.toFixed(0)}
    SGST@2.5 2.5%                   rs${sgst.toFixed(0)}
    MUJFOODCLUB Discount            rs${discount.toFixed(0)}
    ----------------------------------------
    Grand Total                     rs${final_amount.toFixed(0)}
    Paid via ${payment_method?.toUpperCase() || 'COD'}
    ----------------------------------------
    Thanks For Visit!!
    ----------------------------------------`;

    return receipt;
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

// Factory function to create cafe-specific print service
export const createCafePrintService = (cafeId: string): CafeSpecificPrintService => {
  return new CafeSpecificPrintService(cafeId);
};
  return new CafeSpecificPrintService(cafeId);
};

