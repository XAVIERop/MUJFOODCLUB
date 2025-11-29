// Define ReceiptData interface locally since it's not exported
interface ReceiptData {
  order_id: string;
  order_number: string;
  cafe_name: string;
  customer_name: string;
  customer_phone: string;
  delivery_block: string;
  table_number?: string;
  delivery_address?: string;
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

    console.log('🔍 PrintNode API Request:', {
      url,
      method: options.method || 'GET',
      apiKeyLength: this.apiKey.length,
      apiKeyPrefix: this.apiKey.substring(0, 8) + '...',
      bodyLength: options.body ? JSON.stringify(options.body).length : 0
    });

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

      // Print KOT only with paper cut commands
      const kotContent = this.formatKOTForThermal(receiptData) + '\n\n\x1D\x56\x00';
      const kotJob = {
        printer: {
          id: targetPrinterId
        },
        content: this.unicodeToBase64(kotContent),
        contentType: 'raw_base64',
        source: 'MUJFOODCLUB'
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

      // Print Order Receipt only with paper cut commands
      const receiptContent = this.formatReceiptForThermal(receiptData) + '\n\n\x1D\x56\x00';
      
      // Debug: Log receipt content length and preview for Grabit/Banna's Chowki
      const normalizedCafeName = receiptData.cafe_name?.toLowerCase() || '';
      const isGrabit = normalizedCafeName.includes('grabit');
      const isBannasChowki = normalizedCafeName.includes('banna');
      if (isGrabit || isBannasChowki) {
        console.log(`🔍 ${isGrabit ? 'Grabit' : "Banna's Chowki"} Receipt Debug:`);
        console.log('  - Receipt content length:', receiptContent.length);
        console.log('  - Receipt content preview (first 200 chars):', receiptContent.substring(0, 200));
        console.log('  - Receipt content preview (last 200 chars):', receiptContent.substring(Math.max(0, receiptContent.length - 200)));
      }
      
      if (!receiptContent || receiptContent.trim().length === 0) {
        console.error('❌ Receipt content is empty!');
        return {
          success: false,
          error: 'Receipt content is empty'
        };
      }
      
      const base64Content = this.unicodeToBase64(receiptContent);
      if (isGrabit || isBannasChowki) {
        console.log('  - Base64 content length:', base64Content.length);
        console.log('  - Base64 content preview (first 100 chars):', base64Content.substring(0, 100));
      }
      
      const receiptJob = {
        printer: {
          id: targetPrinterId
        },
        content: base64Content,
        contentType: 'raw_base64',
        source: 'MUJFOODCLUB',
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
   * Print Order Receipt only using PrintNode
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

      // Print Order Receipt only with paper cut commands
      const receiptContent = this.formatReceiptForThermal(receiptData) + '\n\n\x1D\x56\x00';
      
      // Debug: Log receipt content length and preview for Grabit/Banna's Chowki
      const normalizedCafeName = receiptData.cafe_name?.toLowerCase() || '';
      const isGrabit = normalizedCafeName.includes('grabit');
      const isBannasChowki = normalizedCafeName.includes('banna');
      if (isGrabit || isBannasChowki) {
        console.log(`🔍 ${(isGrabit ? 'Grabit' : "Banna's Chowki")} Receipt Debug (printReceipt):`);
        console.log('  - Receipt content length:', receiptContent.length);
        console.log('  - Receipt content preview (first 200 chars):', receiptContent.substring(0, 200));
        console.log('  - Receipt content preview (last 200 chars):', receiptContent.substring(Math.max(0, receiptContent.length - 200)));
      }
      
      if (!receiptContent || receiptContent.trim().length === 0) {
        console.error('❌ Receipt content is empty!');
        return {
          success: false,
          error: 'Receipt content is empty'
        };
      }
      
      const base64Content = this.unicodeToBase64(receiptContent);
      if (isGrabit || isBannasChowki) {
        console.log('  - Base64 content length:', base64Content.length);
        console.log('  - Base64 content preview (first 100 chars):', base64Content.substring(0, 100));
      }
      
      const receiptJob = {
        printer: {
          id: targetPrinterId
        },
        content: base64Content,
        contentType: 'raw_base64',
        source: 'MUJFOODCLUB',
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

      // Create test print job with paper cut commands
      const printJob = {
        printer: {
          id: targetPrinterId
        },
        content: this.unicodeToBase64(testReceipt + '\n\n\x1D\x56\x00'),
        contentType: 'raw_base64',
        source: 'MUJFOODCLUB',
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
   * Format customer receipt for thermal printing with simple formatting
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
    
    // Determine cafe-specific format (Chatkara first, then Mini Meals, then Food Court, then Punjabi Tadka)
    const isChatkara = cafe_name?.toLowerCase().includes('chatkara') || 
                       cafe_name === 'CHATKARA' ||
                       cafe_name?.toLowerCase() === 'chatkara';
    const isBannasChowki = cafe_name?.toLowerCase().includes('banna') ||
                           cafe_name === 'BANNA\'S CHOWKI' ||
                           cafe_name?.toLowerCase() === 'banna\'s chowki';
    const isGrabit = cafe_name?.toLowerCase().includes('grabit') || 
                     cafe_name === 'GRABIT' ||
                     cafe_name?.toLowerCase() === 'grabit';
    const isCookHouse = cafe_name?.toLowerCase().includes('cook house') || 
                        cafe_name === 'COOK HOUSE' ||
                        cafe_name?.toLowerCase() === 'cook house';
    const isMiniMeals = cafe_name?.toLowerCase().includes('mini meals') || 
                        cafe_name === 'MINI MEALS' ||
                        cafe_name?.toLowerCase() === 'mini meals';
    const isFoodCourt = cafe_name?.toLowerCase().includes('food court') || 
                        cafe_name === 'FOOD COURT' ||
                        cafe_name?.toLowerCase() === 'food court';
    const isPunjabiTadka = cafe_name?.toLowerCase().includes('punjabi tadka') || 
                           cafe_name === 'PUNJABI TADKA' ||
                           cafe_name?.toLowerCase() === 'punjabi tadka' ||
                           cafe_name?.toLowerCase().includes('punjabi') ||
                           cafe_name?.toLowerCase().includes('tadka');
    const isMunchBox = cafe_name?.toLowerCase().includes('munch box') || 
                       cafe_name === 'MUNCH BOX' ||
                       cafe_name?.toLowerCase() === 'munch box' ||
                       cafe_name?.toLowerCase().includes('munch') ||
                       cafe_name?.toLowerCase().includes('box');
    const isAmor = cafe_name?.toLowerCase().includes('amor') || 
                  cafe_name === 'AMOR' ||
                  cafe_name?.toLowerCase() === 'amor';
    const isStardom = cafe_name?.toLowerCase().includes('stardom') || 
                      cafe_name === 'STARDOM' ||
                      cafe_name?.toLowerCase() === 'stardom' ||
                      cafe_name?.toLowerCase().includes('stardom café');
    const stardomIndent = '   ';
    const stardomHeading = `${stardomIndent}\x1B\x21\x30${'Stardom'.padStart(10)}\x1B\x21\x00`;
    
    // Helper function to determine location/table display
    const getLocationDisplay = (useShortFormat: boolean = false): string => {
      // PRIORITY 1: If table_number exists and is not empty, always show it (for table orders)
      // Check for table_number first, regardless of delivery_block value
      const tableNum = data.table_number?.toString().trim();
      if (tableNum && tableNum !== '') {
        console.log('📍 Receipt: Using table_number:', tableNum);
        return useShortFormat ? `T${tableNum}` : `Table ${tableNum}`;
      }
      // PRIORITY 2: For off-campus delivery, show delivery address
      if (data.delivery_block === 'OFF_CAMPUS' && data.delivery_address && data.delivery_address.trim() !== '') {
        // Truncate address if too long (max 30 chars for receipts, 20 for KOT)
        const maxLength = useShortFormat ? 20 : 30;
        const address = data.delivery_address.length > maxLength 
          ? data.delivery_address.substring(0, maxLength - 3) + '...' 
          : data.delivery_address;
        console.log('📍 Receipt: Using delivery_address:', address);
        return address;
      }
      // PRIORITY 3: For other cases, show delivery_block (B1, B2, etc.) or default
      console.log('📍 Receipt: Using delivery_block:', data.delivery_block);
      return data.delivery_block || 'N/A';
    };
    
    const locationDisplay = getLocationDisplay();
    const locationDisplayShort = getLocationDisplay(true);
    
    // Debug logging
    console.log('🔍 Receipt Data Debug:', {
      table_number: data.table_number,
      delivery_block: data.delivery_block,
      delivery_address: data.delivery_address,
      locationDisplay: locationDisplay,
      locationDisplayShort: locationDisplayShort
    });
    
    // Calculate MUJ FOOD CLUB discount (different rates for different cafes and order types)
    // Note: Grabit does NOT get discount
    const isEligibleForDiscount = isChatkara || isCookHouse || isMiniMeals || isFoodCourt || isPunjabiTadka || isMunchBox;
    let discountRate = 0;
    if (isChatkara || isMiniMeals || isPunjabiTadka || isMunchBox) {
      discountRate = 0.10; // 10% for Chatkara, Mini Meals, Punjabi Tadka, and Munch Box (NOT Grabit)
    } else if (isCookHouse) {
      // Cook House: Different rates based on order type
      const orderType = data.delivery_block === 'DINE_IN' ? 'dine_in' : 
                       data.delivery_block === 'TAKEAWAY' ? 'takeaway' : 'delivery';
      if (orderType === 'delivery') {
        discountRate = 0.10; // 10% for delivery
      } else if (orderType === 'dine_in' || orderType === 'takeaway') {
        discountRate = 0.05; // 5% for dine-in and takeaway
      }
    } else if (isFoodCourt) {
      discountRate = 0.05; // 5% for Food Court
    }
    const mujFoodClubDiscount = isEligibleForDiscount ? subtotal * discountRate : 0;
    
    console.log('🔍 PrintNode Service - Cafe name:', cafe_name);
    console.log('🔍 PrintNode Service - Is Chatkara:', isChatkara);
    console.log('🔍 PrintNode Service - Is Grabit:', isGrabit);
    console.log('🔍 PrintNode Service - Is Banna\'s Chowki:', isBannasChowki);
    console.log('🔍 PrintNode Service - Is Cook House:', isCookHouse);
    console.log('🔍 PrintNode Service - Is Mini Meals:', isMiniMeals);
    console.log('🔍 PrintNode Service - Is Food Court:', isFoodCourt);
    console.log('🔍 PrintNode Service - Is Punjabi Tadka:', isPunjabiTadka);
    console.log('🔍 PrintNode Service - Is Stardom:', isStardom);
    console.log('🔍 PrintNode Service - Cafe name exact:', `"${cafe_name}"`);
    console.log('🔍 PrintNode Service - Cafe name length:', cafe_name?.length);
    console.log('🔍 PrintNode Service - Using format:', isBannasChowki ? 'BANNA\'S CHOWKI (58mm)' : (isChatkara || isGrabit || isStardom || isAmor) ? 'CHATKARA' : isCookHouse ? 'COOK HOUSE' : isMiniMeals ? 'MINI MEALS' : isFoodCourt ? 'FOOD COURT' : isPunjabiTadka ? 'PUNJABI TADKA' : 'MUJ FOOD CLUB');
    
    let receipt;
    
    if (isBannasChowki) {
      // Banna's Chowki format (58mm/2 inch printer - narrower format)
      // ALL text is normal size (not bold/large) for Banna's Chowki to fit small paper
      receipt = `\x1B\x21\x00  ${cafe_name?.toUpperCase() || 'BANNA\'S CHOWKI'}\x1B\x21\x00
    ---------------------------
  \x1B\x21\x00${customer_phone || '9999999999'} ${locationDisplayShort}\x1B\x21\x00
  \x1B\x21\x00Token: ${order_number}\x1B\x21\x00
  \x1B\x21\x00Name: ${customer_name || 'Customer'}\x1B\x21\x00
  \x1B\x21\x00Date: ${dateStr} ${timeStr}\x1B\x21\x00
  \x1B\x21\x00Delivery    Cashier: biller\x1B\x21\x00
  \x1B\x21\x00Bill: ${order_number}\x1B\x21\x00
    ---------------------------
  \x1B\x21\x00Item          Qty Price\x1B\x21\x00
    ---------------------------`;
    } else if (isStardom) {
      // Stardom format: 80mm paper with regular content but emphasized heading/contact/grand total
      const stardomBold = '\x1B\x21\x30';
      const stardomNormal = '\x1B\x21\x00';
      receipt = `${stardomHeading}
${stardomIndent}---------------------------------------
${stardomIndent}${stardomBold}${customer_phone || '9999999999'} ${locationDisplay}${stardomNormal}
${stardomIndent}${stardomNormal}Order No.: ${order_number}
${stardomIndent}${stardomNormal}Name: ${customer_name || 'Customer'}
${stardomIndent}${stardomNormal}Date: ${dateStr} ${timeStr}
${stardomIndent}${stardomNormal}Delivery    Cashier: biller
${stardomIndent}${stardomNormal}Bill No.: ${order_number}
${stardomIndent}---------------------------------------
${stardomIndent}${stardomNormal}S.No Item                 Qty Price
${stardomIndent}---------------------------------------`;
    } else if (isChatkara || isGrabit || isAmor) {
      // Chatkara/Grabit/Amor format (80mm, thermal printer optimized with bold text)
      const defaultCafeName = isGrabit ? 'GRABIT' : isAmor ? 'AMOR' : 'CHATKARA';
      receipt = `\x1B\x21\x30        ${cafe_name?.toUpperCase() || defaultCafeName}\x1B\x21\x00
    ---------------------------------------
    \x1B\x21\x30${customer_phone || '9999999999'} ${locationDisplay}\x1B\x21\x00
    \x1B\x21\x30Token No.: ${order_number}\x1B\x21\x00
    \x1B\x21\x08Name: ${customer_name || 'Customer'}\x1B\x21\x00
    \x1B\x21\x08Date: ${dateStr} \x1B\x21\x30${timeStr}\x1B\x21\x00
    \x1B\x21\x08Delivery    Cashier: biller\x1B\x21\x00
    \x1B\x21\x08Bill No.: ${order_number}\x1B\x21\x00
    ---------------------------------------
    \x1B\x21\x08Item                    Qty. Price Amount\x1B\x21\x00
    ---------------------------------------`;
    } else if (isMiniMeals) {
      // Mini Meals format (using Chatkara template with Mini Meals branding)
      receipt = `\x1B\x21\x30        ${cafe_name?.toUpperCase() || 'MINI MEALS'}\x1B\x21\x00
    ---------------------------------------
    \x1B\x21\x30${customer_phone || '9999999999'} ${locationDisplay}\x1B\x21\x00
    \x1B\x21\x30Token No.: ${order_number}\x1B\x21\x00
    \x1B\x21\x08Name: ${customer_name || 'Customer'}\x1B\x21\x00
    \x1B\x21\x08Date: ${dateStr} \x1B\x21\x30${timeStr}\x1B\x21\x00
    \x1B\x21\x08Delivery    Cashier: biller\x1B\x21\x00
    \x1B\x21\x08Bill No.: ${order_number}\x1B\x21\x00
    ---------------------------------------
    \x1B\x21\x08Item                    Qty. Price Amount\x1B\x21\x00
    ---------------------------------------`;
    } else if (isFoodCourt) {
      // Food Court format (using Chatkara template with Food Court branding)
      receipt = `\x1B\x21\x30        ${cafe_name?.toUpperCase() || 'FOOD COURT'}\x1B\x21\x00
    ---------------------------------------
    \x1B\x21\x30${customer_phone || '9999999999'} ${locationDisplay}\x1B\x21\x00
    \x1B\x21\x30Token No.: ${order_number}\x1B\x21\x00
    \x1B\x21\x08Name: ${customer_name || 'Customer'}\x1B\x21\x00
    \x1B\x21\x08Date: ${dateStr} \x1B\x21\x30${timeStr}\x1B\x21\x00
    \x1B\x21\x08Delivery    Cashier: biller\x1B\x21\x00
    \x1B\x21\x08Bill No.: ${order_number}\x1B\x21\x00
    ---------------------------------------
    \x1B\x21\x08Item                    Qty. Price Amount\x1B\x21\x00
    ---------------------------------------`;
    } else if (isCookHouse) {
      // Cook House format (using Chatkara template with Cook House branding)
      receipt = `\x1B\x21\x30        ${cafe_name?.toUpperCase() || 'COOK HOUSE'}\x1B\x21\x00
    ---------------------------------------
    \x1B\x21\x30${customer_phone || '9999999999'} ${locationDisplay}\x1B\x21\x00
    \x1B\x21\x30Token No.: ${order_number}\x1B\x21\x00
    \x1B\x21\x08Name: ${customer_name || 'Customer'}\x1B\x21\x00
    \x1B\x21\x08Date: ${dateStr} \x1B\x21\x30${timeStr}\x1B\x21\x00
    \x1B\x21\x08Delivery    Cashier: biller\x1B\x21\x00
    \x1B\x21\x08Bill No.: ${order_number}\x1B\x21\x00
    ---------------------------------------
    \x1B\x21\x08Item                    Qty. Price Amount\x1B\x21\x00
    ---------------------------------------`;
    } else if (isPunjabiTadka || isMunchBox) {
      // Punjabi Tadka and Munch Box format (POS-60C - 60mm paper width)
      const cafeDisplayName = isMunchBox ? (cafe_name?.toUpperCase() || 'MUNCH BOX') : (cafe_name?.toUpperCase() || 'PUNJABI TADKA');
      receipt = `\x1B\x21\x30    ${cafeDisplayName}\x1B\x21\x00
    ------------------------------
    \x1B\x21\x30${customer_phone || '9999999999'} ${locationDisplay}\x1B\x21\x00
    \x1B\x21\x30Token: ${order_number}\x1B\x21\x00
    \x1B\x21\x08Name: ${customer_name || 'Customer'}\x1B\x21\x00
    \x1B\x21\x08Date: ${dateStr} \x1B\x21\x30${timeStr}\x1B\x21\x00
    \x1B\x21\x08Delivery    Cashier: biller\x1B\x21\x00
    \x1B\x21\x08Bill: ${order_number}\x1B\x21\x00
    ------------------------------
    \x1B\x21\x08Item            Qty Price\x1B\x21\x00
    ------------------------------`;
    } else {
      // Default MUJ Food Club format with bold formatting
      receipt = `\x1B\x21\x30        MUJ FOOD CLUB\x1B\x21\x00
    ---------------------------------------
    \x1B\x21\x08Name: ${customer_name || 'WALK-IN'} (M: ${customer_phone || '9999999999'})\x1B\x21\x00
    Date: ${dateStr}    ${timeStr}    ${payment_method?.toUpperCase() === 'COD' ? 'Pick Up' : 'Delivery'}
    Cashier: biller    \x1B\x21\x08Bill No.: ${order_number}\x1B\x21\x00
    \x1B\x21\x08Token No.: ${order_number.slice(-2)}\x1B\x21\x00
    ---------------------------------------
    \x1B\x21\x08Item                    Qty. Price Amount\x1B\x21\x00
    ---------------------------------------`;
    }

    // Add items with proper center-aligned formatting
    items.forEach((item, itemIndex) => {
      let itemName, qty, price, amount;
      
      if (isBannasChowki) {
        // 58mm printer format for Banna's Chowki (narrower paper)
        // Allow full item names to wrap to multiple lines instead of truncating
        const fullItemName = item.name.toUpperCase();
        const itemNameWidth = 14; // Width for item name column
        const qtyWidth = 2;
        const priceWidth = 4;
        const amountWidth = 5;
        
        // Split long item names into multiple lines
        const words = fullItemName.split(' ');
        let currentLine = '';
        let lines = [];
        
        for (const word of words) {
          if ((currentLine + ' ' + word).length <= itemNameWidth) {
            currentLine = currentLine ? currentLine + ' ' + word : word;
          } else {
            if (currentLine) lines.push(currentLine);
            currentLine = word;
          }
        }
        if (currentLine) lines.push(currentLine);
        
        // Add each line with proper spacing (normal size for Banna's Chowki)
        lines.forEach((line, index) => {
          const paddedLine = line.padEnd(itemNameWidth);
          const paddedQty = index === 0 ? item.quantity.toString().padStart(qtyWidth) : ' '.repeat(qtyWidth);
          const paddedPrice = index === 0 ? item.unit_price.toFixed(0).padStart(priceWidth) : ' '.repeat(priceWidth);
          const paddedAmount = index === 0 ? item.total_price.toFixed(0).padStart(amountWidth) : ' '.repeat(amountWidth);
          receipt += `\n  \x1B\x21\x00${paddedLine}\x1B\x21\x00 ${paddedQty}  ${paddedPrice}  ${paddedAmount}`;
        });
      } else if (isPunjabiTadka || isMunchBox) {
        // POS-60C formatting for Punjabi Tadka and Munch Box (narrower paper)
        itemName = item.name.toUpperCase().substring(0, 12).padEnd(12);
        qty = item.quantity.toString().padStart(2);
        price = item.unit_price.toFixed(0).padStart(4);
        amount = item.total_price.toFixed(0).padStart(5);
        receipt += `\n    \x1B\x21\x08${itemName}\x1B\x21\x00 ${qty}  ${price}  ${amount}`;
      } else if (isChatkara || isGrabit || isMiniMeals || isCookHouse || isAmor || isStardom) {
        // 80mm printer format for Chatkara, Grabit, Mini Meals, Cook House, Amor
        // Allow full item names to wrap to multiple lines instead of truncating
        const fullItemName = item.name.toUpperCase();
        const qtyWidth = 2;
        const priceWidth = 4;
        const amountWidth = isStardom ? 7 : 5;
        const linePrefix = isStardom ? stardomIndent : '    ';
        const spacing = isStardom ? '  ' : '    ';
        const fontCmd = isStardom ? '\x1B\x21\x00' : '\x1B\x21\x08';
        const serialPrefix = isStardom ? `${(itemIndex + 1).toString().padStart(2)}. ` : '';
        const itemNameWidth = isStardom ? 16 : 20;
        
        // Split long item names into multiple lines
        const words = fullItemName.split(' ');
        let currentLine = '';
        let lines = [];
        
        for (const word of words) {
          if ((currentLine + ' ' + word).length <= itemNameWidth) {
            currentLine = currentLine ? currentLine + ' ' + word : word;
          } else {
            if (currentLine) lines.push(currentLine);
            currentLine = word;
          }
        }
        if (currentLine) lines.push(currentLine);
        
        // Add each line with proper spacing
        lines.forEach((line, lineIndex) => {
          const paddedLine = line.padEnd(itemNameWidth);
          const paddedQty = lineIndex === 0 ? item.quantity.toString().padStart(qtyWidth) : ' '.repeat(qtyWidth);
          const paddedPrice = lineIndex === 0 ? item.unit_price.toFixed(0).padStart(priceWidth) : ' '.repeat(priceWidth);
          const paddedAmount = lineIndex === 0 ? item.total_price.toFixed(0).padStart(amountWidth) : ' '.repeat(amountWidth);
          const itemLabel = lineIndex === 0 ? `${serialPrefix}${paddedLine}` : `   ${paddedLine}`;
          receipt += `\n${linePrefix}${fontCmd}${itemLabel}\x1B\x21\x00 ${paddedQty}${spacing}${paddedPrice}${spacing}${paddedAmount}`;
        });
      } else {
        // 80mm printer format for other cafes
        itemName = item.name.toUpperCase().substring(0, 20).padEnd(20);
        qty = item.quantity.toString().padStart(2);
        price = item.unit_price.toFixed(0).padStart(4);
        amount = item.total_price.toFixed(0).padStart(5);
        receipt += `\n    ${itemName} ${qty}    ${price}    ${amount}`;
      }
    });

    // Add cafe-specific footer
    if (isBannasChowki) {
      // Banna's Chowki footer (58mm paper width)
      const isDelivery = data.delivery_block && !['DINE_IN', 'TAKEAWAY'].includes(data.delivery_block);
      const deliveryCharge = isDelivery ? 10 : 0;
      const finalTotal = final_amount; // Use actual final amount from database
      
      receipt += `\n  ---------------------------
  \x1B\x21\x00Total Qty: ${totalQty}\x1B\x21\x00
  \x1B\x21\x00Sub Total: ${subtotal.toFixed(0)}\x1B\x21\x00`;
      
      // Only show delivery charge if it's a delivery order
      if (deliveryCharge > 0) {
        receipt += `\n  \x1B\x21\x00Delivery: +${deliveryCharge}\x1B\x21\x00`;
      }
      
      receipt += `\n  \x1B\x21\x00Grand Total: ${finalTotal.toFixed(0)}rs\x1B\x21\x00
    ---------------------------
  \x1B\x21\x00Thanks Order Again\x1B\x21\x00
  \x1B\x21\x00mujfoodclub.in\x1B\x21\x00
    ---------------------------
    ---------------------------`;
    } else if (isStardom) {
      const isDelivery = data.delivery_block && !['DINE_IN', 'TAKEAWAY'].includes(data.delivery_block);
      const deliveryCharge = isDelivery ? 10 : 0;
      const finalTotal = final_amount;
      
      receipt += `\n${stardomIndent}---------------------------------------
${stardomIndent}\x1B\x21\x00Total Qty: ${totalQty}\x1B\x21\x00
${stardomIndent}\x1B\x21\x00Sub Total: ${subtotal.toFixed(0)}\x1B\x21\x00`;
      
      if (deliveryCharge > 0) {
        receipt += `\n${stardomIndent}\x1B\x21\x00Delivery Charge: +${deliveryCharge}\x1B\x21\x00`;
      }
      
      receipt += `\n${stardomIndent}\x1B\x21\x30Grand Total: ${finalTotal.toFixed(0)}rs\x1B\x21\x00
${stardomIndent}---------------------------------------
${stardomIndent}\x1B\x21\x00Thanks Order Again\x1B\x21\x00
${stardomIndent}\x1B\x21\x00mujfoodclub.in\x1B\x21\x00
${stardomIndent}---------------------------------------
${stardomIndent}---------------------------------------
${stardomIndent}---------------------------------------`;
    } else if (isChatkara || isGrabit || isAmor) {
      // Determine if it's a delivery order based on delivery_block
      const isDelivery = data.delivery_block && !['DINE_IN', 'TAKEAWAY'].includes(data.delivery_block);
      const deliveryCharge = isDelivery ? 10 : 0;
      const finalTotal = final_amount; // Use actual final amount from database
      
      receipt += `\n    ----------------------------------------
    \x1B\x21\x08Total Qty: ${totalQty}\x1B\x21\x00
    \x1B\x21\x08Sub Total: ${subtotal.toFixed(0)}\x1B\x21\x00`;
      
      // Only show delivery charge if it's a delivery order
      if (deliveryCharge > 0) {
        receipt += `\n    \x1B\x21\x08Delivery Charge: +${deliveryCharge}\x1B\x21\x00`;
      }
      
      // Show MUJ FOOD CLUB discount if applicable (but NOT for Grabit)
      if (mujFoodClubDiscount > 0 && !isGrabit && !isAmor) {
        receipt += `\n    \x1B\x21\x08MUJ FOOD CLUB DISCOUNT (${(discountRate * 100).toFixed(0)}%): -${mujFoodClubDiscount.toFixed(0)}\x1B\x21\x00`;
      }
      
      receipt += `\n    \x1B\x21\x30Grand Total: ${finalTotal.toFixed(0)}rs\x1B\x21\x00
    ----------------------------------------
    \x1B\x21\x08Thanks Order Again\x1B\x21\x00
    \x1B\x21\x08mujfoodclub.in\x1B\x21\x00
    ----------------------------------------
    ----------------------------------------
    ----------------------------------------`;
    } else if (isMiniMeals) {
      // Mini Meals footer (using Chatkara template)
      const isDelivery = data.delivery_block && !['DINE_IN', 'TAKEAWAY'].includes(data.delivery_block);
      const deliveryCharge = isDelivery ? 10 : 0;
      const finalTotal = subtotal + deliveryCharge - mujFoodClubDiscount; // Calculate correct total with discount
      
      receipt += `\n    ----------------------------------------
    \x1B\x21\x08Total Qty: ${totalQty}\x1B\x21\x00
    \x1B\x21\x08Sub Total: ${subtotal.toFixed(0)}\x1B\x21\x00`;
      
      // Only show delivery charge if it's a delivery order
      if (deliveryCharge > 0) {
        receipt += `\n    \x1B\x21\x08Delivery Charge: +${deliveryCharge}\x1B\x21\x00`;
      }
      
      // Show MUJ FOOD CLUB discount if applicable
      if (mujFoodClubDiscount > 0) {
        receipt += `\n    \x1B\x21\x08MUJ FOOD CLUB DISCOUNT (${(discountRate * 100).toFixed(0)}%): -${mujFoodClubDiscount.toFixed(0)}\x1B\x21\x00`;
      }
      
      receipt += `\n    \x1B\x21\x30Grand Total: ${finalTotal.toFixed(0)}rs\x1B\x21\x00
    ----------------------------------------
    \x1B\x21\x08Thanks Order Again\x1B\x21\x00
    \x1B\x21\x08mujfoodclub.in\x1B\x21\x00
    ----------------------------------------
    ----------------------------------------
    ----------------------------------------`;
    } else if (isCookHouse) {
      // Cook House footer (using Chatkara template)
      const isDelivery = data.delivery_block && !['DINE_IN', 'TAKEAWAY'].includes(data.delivery_block);
      const deliveryCharge = isDelivery ? 10 : 0;
      const finalTotal = final_amount; // Use actual final amount from database
      
      receipt += `\n    ----------------------------------------
    \x1B\x21\x08Total Qty: ${totalQty}\x1B\x21\x00
    \x1B\x21\x08Sub Total: ${subtotal.toFixed(0)}\x1B\x21\x00`;
      
      // Only show delivery charge if it's a delivery order
      if (deliveryCharge > 0) {
        receipt += `\n    \x1B\x21\x08Delivery Charge: +${deliveryCharge}\x1B\x21\x00`;
      }
      
      // Show MUJ FOOD CLUB discount if applicable
      if (mujFoodClubDiscount > 0) {
        receipt += `\n    \x1B\x21\x08MUJ FOOD CLUB DISCOUNT (${(discountRate * 100).toFixed(0)}%): -${mujFoodClubDiscount.toFixed(0)}\x1B\x21\x00`;
      }
      
      receipt += `\n    \x1B\x21\x30Grand Total: ${finalTotal.toFixed(0)}rs\x1B\x21\x00
    ----------------------------------------
    \x1B\x21\x08Thanks Order Again\x1B\x21\x00
    \x1B\x21\x08mujfoodclub.in\x1B\x21\x00
    ----------------------------------------
    ----------------------------------------
    ----------------------------------------`;
    } else if (isFoodCourt) {
      // Food Court receipt with GST and delivery charge
      const isDelivery = data.delivery_block && !['DINE_IN', 'TAKEAWAY'].includes(data.delivery_block);
      const deliveryCharge = isDelivery ? 10 : 0;
      const finalTotal = subtotal + cgst + sgst + deliveryCharge - mujFoodClubDiscount;
      
      receipt += `\n    ----------------------------------------
    Total Qty: ${totalQty}
    Sub Total                         ${subtotal.toFixed(0)}
    CGST@2.5 2.5%                     ${cgst.toFixed(0)}
    SGST@2.5 2.5%                     ${sgst.toFixed(0)}`;
      
      // Only show delivery charge if it's a delivery order
      if (deliveryCharge > 0) {
        receipt += `\n    Delivery Charge                 ${deliveryCharge}`;
      }
      
      // Show MUJ FOOD CLUB discount if applicable
      if (mujFoodClubDiscount > 0) {
        receipt += `\n    \x1B\x21\x08MUJ FOOD CLUB DISCOUNT (${(discountRate * 100).toFixed(0)}%)             -${mujFoodClubDiscount.toFixed(0)}\x1B\x21\x00`;
      }
      
      receipt += `\n    ----------------------------------------
    \x1B\x21\x30Grand Total: ${finalTotal.toFixed(0)}\x1B\x21\x00
    Paid via ${payment_method?.toUpperCase() || 'COD'}
    ----------------------------------------
    \x1B\x21\x08Thanks For Visit!!\x1B\x21\x00
    ----------------------------------------
    ----------------------------------------
    ----------------------------------------`;
    } else if (isPunjabiTadka || isMunchBox) {
      // Punjabi Tadka and Munch Box footer (POS-60C - 60mm paper width)
      const isDelivery = data.delivery_block && !['DINE_IN', 'TAKEAWAY'].includes(data.delivery_block);
      const deliveryCharge = isDelivery ? 10 : 0;
      const finalTotal = final_amount; // Use actual final amount from database
      
      receipt += `\n    ------------------------------
      \x1B\x21\x08Total Qty: ${totalQty}\x1B\x21\x00
      \x1B\x21\x08Sub Total: ${subtotal.toFixed(0)}\x1B\x21\x00`;
      
      // Only show delivery charge if it's a delivery order
      if (deliveryCharge > 0) {
        receipt += `\n    \x1B\x21\x08Delivery: +${deliveryCharge}\x1B\x21\x00`;
      }
      
      // Show MUJ FOOD CLUB discount if applicable
      if (mujFoodClubDiscount > 0) {
        receipt += `\n    \x1B\x21\x08MUJ FOOD CLUB (${(discountRate * 100).toFixed(0)}%): -${mujFoodClubDiscount.toFixed(0)}\x1B\x21\x00`;
      }
      
      receipt += `\n    \x1B\x21\x30Grand Total: ${finalTotal.toFixed(0)}rs\x1B\x21\x00
    ------------------------------
    \x1B\x21\x08Thanks Order Again\x1B\x21\x00
    \x1B\x21\x08mujfoodclub.in\x1B\x21\x00
    ------------------------------
    ------------------------------
    ------------------------------`;
    } else {
      receipt += `\n    ----------------------------------------
    Total Qty: ${totalQty}
    Sub Total: ${subtotal.toFixed(2)}
    \x1B\x21\x30Grand Total: ₹${final_amount.toFixed(2)}\x1B\x21\x00
    ----------------------------------------
    \x1B\x21\x08Thanks For Visit!!\x1B\x21\x00
    ----------------------------------------
    ----------------------------------------
    ----------------------------------------`;
    }

    return receipt;
  }

  /**
   * Format KOT (Kitchen Order Ticket) for thermal printing with simple formatting
   */
  private formatKOTForThermal(data: ReceiptData): string {
    const { order_number, cafe_name, items } = data;
    
    // Format date and time
    const now = new Date();
    const dateStr = now.toLocaleDateString('en-GB').replace(/\//g, '/');
    const timeStr = now.toLocaleTimeString('en-GB', { hour12: false }).substring(0, 5);
    
    // Determine cafe-specific format (Chatkara first, then Mini Meals, then Cook House, then Food Court, then Punjabi Tadka, then Banna's Chowki)
    const isChatkara = cafe_name?.toLowerCase().includes('chatkara') || 
                       cafe_name === 'CHATKARA' ||
                       cafe_name?.toLowerCase() === 'chatkara';
    const isBannasChowki = cafe_name?.toLowerCase().includes('banna') ||
                           cafe_name === 'BANNA\'S CHOWKI' ||
                           cafe_name?.toLowerCase() === 'banna\'s chowki';
    const isMiniMeals = cafe_name?.toLowerCase().includes('mini meals') || 
                        cafe_name === 'MINI MEALS' ||
                        cafe_name?.toLowerCase() === 'mini meals';
    const isCookHouse = cafe_name?.toLowerCase().includes('cook house') || 
                        cafe_name === 'COOK HOUSE' ||
                        cafe_name?.toLowerCase() === 'cook house';
    const isFoodCourt = cafe_name?.toLowerCase().includes('food court') || 
                        cafe_name === 'FOOD COURT' ||
                        cafe_name?.toLowerCase() === 'food court';
    const isPunjabiTadka = cafe_name?.toLowerCase().includes('punjabi tadka') || 
                           cafe_name === 'PUNJABI TADKA' ||
                           cafe_name?.toLowerCase() === 'punjabi tadka' ||
                           cafe_name?.toLowerCase().includes('punjabi') ||
                           cafe_name?.toLowerCase().includes('tadka');
    const isMunchBox = cafe_name?.toLowerCase().includes('munch box') || 
                       cafe_name === 'MUNCH BOX' ||
                       cafe_name?.toLowerCase() === 'munch box' ||
                       cafe_name?.toLowerCase().includes('munch') ||
                       cafe_name?.toLowerCase().includes('box');
    const isAmor = cafe_name?.toLowerCase().includes('amor') || 
                  cafe_name === 'AMOR' ||
                  cafe_name?.toLowerCase() === 'amor';
    const isStardom = cafe_name?.toLowerCase().includes('stardom') || 
                      cafe_name === 'STARDOM' ||
                      cafe_name?.toLowerCase() === 'stardom' ||
                      cafe_name?.toLowerCase().includes('stardom café');
    const stardomIndent = '   ';
    console.log('🔍 PrintNode KOT - Cafe name:', cafe_name);
    console.log('🔍 PrintNode KOT - Is Chatkara:', isChatkara);
    console.log('🔍 PrintNode KOT - Is Banna\'s Chowki:', isBannasChowki);
    console.log('🔍 PrintNode KOT - Is Mini Meals:', isMiniMeals);
    console.log('🔍 PrintNode KOT - Is Cook House:', isCookHouse);
    console.log('🔍 PrintNode KOT - Is Food Court:', isFoodCourt);
    console.log('🔍 PrintNode KOT - Is Punjabi Tadka:', isPunjabiTadka);
    console.log('🔍 PrintNode KOT - Is Munch Box:', isMunchBox);
    console.log('🔍 PrintNode KOT - Is Stardom:', isStardom);
    console.log('🔍 PrintNode KOT - Using format:', (isChatkara || isStardom) ? 'CHATKARA/STARDOM (80mm)' : isBannasChowki ? 'BANNA\'S CHOWKI (58mm)' : isMiniMeals ? 'MINI MEALS' : isCookHouse ? 'COOK HOUSE' : isFoodCourt ? 'FOOD COURT' : isPunjabiTadka ? 'PUNJABI TADKA' : isMunchBox ? 'MUNCH BOX' : 'MUJ FOOD CLUB');
    
    // Determine location display for KOT using helper function
    const getKOTLocationDisplay = (): string => {
      // PRIORITY 1: If table_number exists and is not empty, always show it (for table orders)
      // Check for table_number first, regardless of delivery_block value
      const tableNum = data.table_number?.toString().trim();
      if (tableNum && tableNum !== '') {
        console.log('📍 KOT: Using table_number:', tableNum);
        return `Table ${tableNum}`;
      }
      // PRIORITY 2: For off-campus delivery, show delivery address (truncated for KOT)
      if (data.delivery_block === 'OFF_CAMPUS' && data.delivery_address && data.delivery_address.trim() !== '') {
        // Truncate address if too long (max 25 chars for KOT)
        const address = data.delivery_address.length > 25 
          ? data.delivery_address.substring(0, 22) + '...' 
          : data.delivery_address;
        console.log('📍 KOT: Using delivery_address:', address);
        return address;
      }
      // PRIORITY 3: For takeaway
      if (data.delivery_block === 'TAKEAWAY') {
        console.log('📍 KOT: Using TAKEAWAY');
        return 'TAKEAWAY';
      }
      // PRIORITY 4: For GHS delivery blocks (B1, B2, etc.)
      if (data.delivery_block && !['DINE_IN', 'TAKEAWAY'].includes(data.delivery_block)) {
        console.log('📍 KOT: Using delivery_block:', data.delivery_block);
        return data.delivery_block;
      }
      // PRIORITY 5: Default based on cafe type
      const defaultDisplay = isChatkara || isCookHouse || isFoodCourt || isPunjabiTadka || isAmor || isStardom ? 'DELIVERY' : 'PICK UP';
      console.log('📍 KOT: Using default:', defaultDisplay);
      return defaultDisplay;
    };
    
    const locationDisplay = getKOTLocationDisplay();
    
    // Debug logging
    console.log('🔍 KOT Data Debug:', {
      table_number: data.table_number,
      delivery_block: data.delivery_block,
      delivery_address: data.delivery_address,
      locationDisplay: locationDisplay
    });

    // Proper center-aligned KOT format with bold formatting
    let kot;
    if (isBannasChowki) {
      // 58mm KOT format for Banna's Chowki
      // Order number is smaller (bold but normal size) for Banna's Chowki
      kot = `${dateStr} \x1B\x21\x30${timeStr}\x1B\x21\x00
    \x1B\x21\x08KOT - ${order_number}\x1B\x21\x00
    \x1B\x21\x08${locationDisplay}\x1B\x21\x00
    ---------------------------
    \x1B\x21\x08ITEM          QTY\x1B\x21\x00
    ---------------------------`;
    } else if (isStardom) {
      kot = `${stardomIndent}${dateStr} ${timeStr}
${stardomIndent}Order No.: ${order_number}
${stardomIndent}${locationDisplay}
${stardomIndent}---------------------------------------
${stardomIndent}ITEM                              QTY
${stardomIndent}---------------------------------------`;
    } else if (isPunjabiTadka || isMunchBox) {
      // POS-60C KOT format for Punjabi Tadka and Munch Box
      kot = `${dateStr} \x1B\x21\x30${timeStr}\x1B\x21\x00
    \x1B\x21\x30KOT - ${order_number}\x1B\x21\x00
    \x1B\x21\x08${locationDisplay}\x1B\x21\x00
    ------------------------------
    \x1B\x21\x08ITEM                    QTY\x1B\x21\x00
    ------------------------------`;
    } else {
      // 80mm KOT format for other cafes
      kot = `${dateStr} \x1B\x21\x30${timeStr}\x1B\x21\x00
    \x1B\x21\x30KOT - ${order_number}\x1B\x21\x00
    \x1B\x21\x08${locationDisplay}\x1B\x21\x00
    ---------------------------------------
    \x1B\x21\x08ITEM                              QTY\x1B\x21\x00
    ---------------------------------------`;
    }

    // Add items with proper two-column layout
    items.forEach((item, itemIndex) => {
      const itemName = item.name.toUpperCase();
      const qty = item.quantity.toString();
      
      if (isBannasChowki) {
        // 58mm KOT formatting for Banna's Chowki
        const totalWidth = 26; // Total width for 58mm paper (slightly narrower than 60mm)
        const qtyWidth = 4; // Width for quantity column
        const itemWidth = totalWidth - qtyWidth - 1; // Width for item name column (minus 1 for space)
        
        // Debug: Log special instructions for Banna's Chowki
        if (item.special_instructions) {
          console.log(`📝 Banna's Chowki KOT - Item ${itemIndex + 1} (${itemName}): Special instructions found: "${item.special_instructions}"`);
        } else {
          console.log(`📝 Banna's Chowki KOT - Item ${itemIndex + 1} (${itemName}): No special instructions`);
        }
        
        // Don't truncate - allow full item names to wrap to multiple lines
        // Split long item names into multiple lines
        const words = itemName.split(' ');
        let currentLine = '';
        let lines = [];
        
        for (const word of words) {
          if ((currentLine + ' ' + word).length <= itemWidth) {
            currentLine = currentLine ? currentLine + ' ' + word : word;
          } else {
            if (currentLine) lines.push(currentLine);
            currentLine = word;
          }
        }
        if (currentLine) lines.push(currentLine);
        
        // Add each line with proper spacing
        lines.forEach((line, index) => {
          const paddedLine = line.padEnd(itemWidth);
          const paddedQty = index === 0 ? qty.padStart(qtyWidth) : ' '.repeat(qtyWidth);
          kot += `\n    \x1B\x21\x08${paddedLine} ${paddedQty}\x1B\x21\x00`;
        });
        
        // Add special instructions if they exist (for table orders especially)
        if (item.special_instructions && item.special_instructions.trim() !== '') {
          const instructions = item.special_instructions.trim();
          console.log(`✅ Adding special instructions to KOT: "${instructions}"`);
          
          // Wrap long instructions to fit the width (use full width for instructions)
          const maxWidth = totalWidth - 2; // Use almost full width for instructions
          const instructionWords = instructions.split(' ');
          let currentLine = '';
          let instructionLines = [];
          
          for (const word of instructionWords) {
            if ((currentLine + ' ' + word).length <= maxWidth) {
              currentLine = currentLine ? currentLine + ' ' + word : word;
            } else {
              if (currentLine) instructionLines.push(currentLine);
              currentLine = word;
            }
          }
          if (currentLine) instructionLines.push(currentLine);
          
          // Add instruction lines with clear formatting (bold "NOTE:" prefix)
          instructionLines.forEach((instructionLine, lineIndex) => {
            const prefix = lineIndex === 0 ? '\x1B\x21\x30NOTE:\x1B\x21\x00 ' : '      '; // Bold "NOTE:" on first line
            kot += `\n    ${prefix}${instructionLine}`;
          });
        } else {
          console.log(`⚠️ Banna's Chowki KOT - Item ${itemIndex + 1}: No special instructions to add`);
        }
      } else if (isStardom) {
        const totalWidth = 40;
        const qtyWidth = 4;
        const itemWidth = totalWidth - qtyWidth - 1;
        const words = itemName.split(' ');
        let currentLine = '';
        let lines: string[] = [];
        
        for (const word of words) {
          if ((currentLine + ' ' + word).length <= itemWidth) {
            currentLine = currentLine ? currentLine + ' ' + word : word;
          } else {
            if (currentLine) lines.push(currentLine);
            currentLine = word;
          }
        }
        if (currentLine) lines.push(currentLine);
        
        lines.forEach((line, index) => {
          const paddedLine = line.padEnd(itemWidth);
          const paddedQty = index === 0 ? qty.padStart(qtyWidth) : ' '.repeat(qtyWidth);
          kot += `\n${stardomIndent}${paddedLine} ${paddedQty}`;
        });
        
        if (item.special_instructions && item.special_instructions.trim() !== '') {
          const instructions = item.special_instructions.trim();
          const maxWidth = itemWidth;
          const instructionWords = instructions.split(' ');
          let currentInstr = '';
          let instructionLines: string[] = [];
          
          for (const word of instructionWords) {
            if ((currentInstr + ' ' + word).length <= maxWidth) {
              currentInstr = currentInstr ? currentInstr + ' ' + word : word;
            } else {
              if (currentInstr) instructionLines.push(currentInstr);
              currentInstr = word;
            }
          }
          if (currentInstr) instructionLines.push(currentInstr);
          
          instructionLines.forEach(line => {
            kot += `\n${stardomIndent}Note: ${line}`;
          });
        }
      } else if (isPunjabiTadka || isMunchBox) {
        // POS-60C KOT formatting for Punjabi Tadka and Munch Box
        const totalWidth = 28; // Total width for 60mm paper
        const qtyWidth = 4; // Width for quantity column
        const itemWidth = totalWidth - qtyWidth - 1; // Width for item name column (minus 1 for space)
        
        // Truncate very long item names to prevent excessive wrapping
        const truncatedName = itemName.length > itemWidth ? itemName.substring(0, itemWidth - 3) + '...' : itemName;
        
        // Split long item names into multiple lines
        const words = truncatedName.split(' ');
        let currentLine = '';
        let lines = [];
        
        for (const word of words) {
          if ((currentLine + ' ' + word).length <= itemWidth) {
            currentLine = currentLine ? currentLine + ' ' + word : word;
          } else {
            if (currentLine) lines.push(currentLine);
            currentLine = word;
          }
        }
        if (currentLine) lines.push(currentLine);
        
        // Add each line with proper spacing
        lines.forEach((line, index) => {
          const paddedLine = line.padEnd(itemWidth);
          const paddedQty = index === 0 ? qty.padStart(qtyWidth) : ' '.repeat(qtyWidth);
          kot += `\n    \x1B\x21\x08${paddedLine} ${paddedQty}\x1B\x21\x00`;
        });
        
        // Add special instructions if they exist (for table orders especially)
        if (item.special_instructions && item.special_instructions.trim() !== '') {
          const instructions = item.special_instructions.trim();
          // Wrap long instructions to fit the width (28mm for Punjabi Tadka/Munch Box)
          const maxWidth = 28;
          const instructionWords = instructions.split(' ');
          let currentLine = '';
          let instructionLines = [];
          
          for (const word of instructionWords) {
            if ((currentLine + ' ' + word).length <= maxWidth) {
              currentLine = currentLine ? currentLine + ' ' + word : word;
            } else {
              if (currentLine) instructionLines.push(currentLine);
              currentLine = word;
            }
          }
          if (currentLine) instructionLines.push(currentLine);
          
          // Add instruction lines with indentation
          instructionLines.forEach(instructionLine => {
            kot += `\n    \x1B\x21\x00  Note: ${instructionLine}\x1B\x21\x00`;
          });
        }
      } else if (isChatkara || isGrabit || isMiniMeals || isCookHouse || isFoodCourt || isAmor || isStardom) {
        // Create proper two-column layout: item name (left) and quantity (right)
        const totalWidth = 40; // Total width of the line
        const qtyWidth = 4; // Width for quantity column
        const itemWidth = totalWidth - qtyWidth - 1; // Width for item name column (minus 1 for space)
        
        // Don't truncate - allow full item names to wrap to multiple lines
        // Split long item names into multiple lines
        const words = itemName.split(' ');
        let currentLine = '';
        let lines = [];
        
        for (const word of words) {
          if ((currentLine + ' ' + word).length <= itemWidth) {
            currentLine = currentLine ? currentLine + ' ' + word : word;
          } else {
            if (currentLine) lines.push(currentLine);
            currentLine = word;
          }
        }
        if (currentLine) lines.push(currentLine);
        
        // Print each line with proper column alignment
        lines.forEach((line, index) => {
          if (index === 0) {
            // First line: item name (left) and quantity (right)
            const paddedItemName = line.padEnd(itemWidth);
            const paddedQty = qty.padStart(qtyWidth);
            kot += `\n    \x1B\x21\x30${paddedItemName} ${paddedQty}\x1B\x21\x00`;
          } else {
            // Subsequent lines: just item name (left aligned)
            const paddedItemName = line.padEnd(itemWidth);
            kot += `\n    \x1B\x21\x30${paddedItemName}\x1B\x21\x00`;
          }
        });
        
        // Add special instructions if they exist (for table orders especially)
        if (item.special_instructions && item.special_instructions.trim() !== '') {
          const instructions = item.special_instructions.trim();
          // Wrap long instructions to fit the width (40mm for 80mm format)
          const maxWidth = itemWidth;
          const instructionWords = instructions.split(' ');
          let currentLine = '';
          let instructionLines = [];
          
          for (const word of instructionWords) {
            if ((currentLine + ' ' + word).length <= maxWidth) {
              currentLine = currentLine ? currentLine + ' ' + word : word;
            } else {
              if (currentLine) instructionLines.push(currentLine);
              currentLine = word;
            }
          }
          if (currentLine) instructionLines.push(currentLine);
          
          // Add instruction lines with indentation
          instructionLines.forEach(instructionLine => {
            kot += `\n    \x1B\x21\x00  Note: ${instructionLine}\x1B\x21\x00`;
          });
        }
      } else {
        kot += `\n    ${itemName} ${qty}`;
      }
    });

    // Add cafe-specific footer
    if (isBannasChowki) {
      // 58mm KOT footer for Banna's Chowki
      kot += `\n    ---------------------------
    \x1B\x21\x08Thanks\x1B\x21\x00
    ---------------------------`;
    } else if (isPunjabiTadka || isMunchBox) {
      // POS-60C KOT footer for Punjabi Tadka and Munch Box
      kot += `\n    ------------------------------
    \x1B\x21\x08Thanks\x1B\x21\x00
    ------------------------------
    ------------------------------
    ------------------------------`;
    } else if (isStardom) {
      kot += `\n${stardomIndent}---------------------------------------
${stardomIndent}THANKS
${stardomIndent}---------------------------------------`;
    } else if (isChatkara || isAmor) {
      kot += `\n    ----------------------------------------
    \x1B\x21\x08Thanks\x1B\x21\x00
    ----------------------------------------
    ----------------------------------------
    ----------------------------------------`;
    } else if (isMiniMeals) {
      kot += `\n    ----------------------------------------
    \x1B\x21\x08Thanks\x1B\x21\x00
    ----------------------------------------
    ----------------------------------------
    ----------------------------------------`;
    } else if (isFoodCourt) {
      kot += `\n    ----------------------------------------
    \x1B\x21\x08Thanks\x1B\x21\x00
    ----------------------------------------
    ----------------------------------------
    ----------------------------------------`;
    } else {
      kot += `\n    ----------------------------------------
    \x1B\x21\x08THANKS FOR VISIT!!\x1B\x21\x00
    \x1B\x21\x30MUJFOODCLUB\x1B\x21\x00
    ----------------------------------------
    ----------------------------------------
    ----------------------------------------`;
    }

    return kot;
  }

  /**
   * Unicode-safe base64 encoding for ESC/POS commands
   * Converts string to bytes first, then base64 encodes
   * This ensures ESC/POS control characters are properly encoded
   */
  private unicodeToBase64(str: string): string {
    try {
      // Convert string to Uint8Array (byte array) using Latin-1 encoding
      // This preserves ESC/POS control characters (0x00-0xFF) correctly
      const bytes = new Uint8Array(str.length);
      for (let i = 0; i < str.length; i++) {
        const charCode = str.charCodeAt(i);
        // For characters > 255, use '?' as fallback, otherwise use the byte value
        bytes[i] = charCode > 255 ? 63 : charCode;
      }
      
      // Convert byte array to base64
      let binary = '';
      for (let i = 0; i < bytes.length; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      return btoa(binary);
    } catch (error) {
      console.error('Base64 encoding error:', error);
      // Fallback: try standard btoa
      try {
        return btoa(str);
      } catch (fallbackError) {
        console.error('Fallback base64 encoding also failed:', fallbackError);
        // Last resort: remove non-ASCII characters and encode
        const asciiStr = str.replace(/[^\x00-\x7F]/g, '?');
        return btoa(asciiStr);
      }
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