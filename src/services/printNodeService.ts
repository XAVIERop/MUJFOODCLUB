// Define ReceiptData interface locally since it's not exported
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
        printer: targetPrinterId,
        content: this.unicodeToBase64(kotContent),
        contentType: 'raw_base64',
        source: 'MUJFOODCLUB',
        title: `KOT ${receiptData.order_number}`
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
      const receiptJob = {
        printer: targetPrinterId,
        content: this.unicodeToBase64(receiptContent),
        contentType: 'raw_base64',
        source: 'MUJFOODCLUB',
        title: `Receipt ${receiptData.order_number}`
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
   * Print both KOT and Order Receipt using PrintNode
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

      // Print KOT first with paper cut commands
      const kotContent = this.formatKOTForThermal(receiptData) + '\n\n\x1D\x56\x00';
      const kotJob = {
        printer: targetPrinterId,
        content: this.unicodeToBase64(kotContent),
        contentType: 'raw_base64',
        source: 'MUJFOODCLUB',
        title: `KOT ${receiptData.order_number}`
      };

      const kotResponse = await this.makeRequest('/printjobs', {
        method: 'POST',
        body: JSON.stringify(kotJob)
      });

      if (!kotResponse.ok) {
        throw new Error(`KOT print failed: HTTP ${kotResponse.status}: ${kotResponse.statusText}`);
      }

      // Add a small delay to ensure separate printing
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Print Order Receipt with paper cut commands
      const receiptContent = this.formatReceiptForThermal(receiptData) + '\n\n\x1D\x56\x00';
      const receiptJob = {
        printer: targetPrinterId,
        content: this.unicodeToBase64(receiptContent),
        contentType: 'raw_base64',
        source: 'MUJFOODCLUB',
        title: `Receipt ${receiptData.order_number}`
      };

      const receiptResponse = await this.makeRequest('/printjobs', {
        method: 'POST',
        body: JSON.stringify(receiptJob)
      });

      if (!receiptResponse.ok) {
        throw new Error(`Receipt print failed: HTTP ${receiptResponse.status}: ${receiptResponse.statusText}`);
      }

      const kotResult = await kotResponse.json();
      const receiptResult = await receiptResponse.json();

      return {
        success: true,
        jobId: receiptResult.id // Return the receipt job ID as primary
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
        printer: targetPrinterId,
        content: this.unicodeToBase64(testReceipt + '\n\n\x1D\x56\x00'),
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
    
    // Determine cafe-specific format (Chatkara first, then Mini Meals, then Food Court)
    const isChatkara = cafe_name?.toLowerCase().includes('chatkara') || 
                       cafe_name === 'CHATKARA' ||
                       cafe_name?.toLowerCase() === 'chatkara';
    const isCookHouse = cafe_name?.toLowerCase().includes('cook house') || 
                        cafe_name === 'COOK HOUSE' ||
                        cafe_name?.toLowerCase() === 'cook house';
    const isMiniMeals = cafe_name?.toLowerCase().includes('mini meals') || 
                        cafe_name === 'MINI MEALS' ||
                        cafe_name?.toLowerCase() === 'mini meals';
    const isFoodCourt = cafe_name?.toLowerCase().includes('food court') || 
                        cafe_name === 'FOOD COURT' ||
                        cafe_name?.toLowerCase() === 'food court';
    
    // Calculate MUJ FOOD CLUB discount (different rates for different cafes)
    const isEligibleForDiscount = isChatkara || isCookHouse || isMiniMeals || isFoodCourt;
    let discountRate = 0;
    if (isChatkara || isCookHouse || isMiniMeals) {
      discountRate = 0.10; // 10% for Chatkara, Cook House, and Mini Meals
    } else if (isFoodCourt) {
      discountRate = 0.05; // 5% for Food Court
    }
    const mujFoodClubDiscount = isEligibleForDiscount ? subtotal * discountRate : 0;
    
    console.log('🔍 PrintNode Service - Cafe name:', cafe_name);
    console.log('🔍 PrintNode Service - Is Chatkara:', isChatkara);
    console.log('🔍 PrintNode Service - Is Cook House:', isCookHouse);
    console.log('🔍 PrintNode Service - Is Mini Meals:', isMiniMeals);
    console.log('🔍 PrintNode Service - Is Food Court:', isFoodCourt);
    console.log('🔍 PrintNode Service - Using format:', isChatkara ? 'CHATKARA' : isCookHouse ? 'COOK HOUSE' : isMiniMeals ? 'MINI MEALS' : isFoodCourt ? 'FOOD COURT' : 'MUJ FOOD CLUB');
    
    let receipt;
    
    if (isChatkara) {
      // Chatkara format (compact, thermal printer optimized with bold text)
      receipt = `\x1B\x21\x30        ${cafe_name?.toUpperCase() || 'CHATKARA'}\x1B\x21\x00
    ----------------------------------------
    \x1B\x21\x30${customer_phone || '9999999999'} ${data.delivery_block || 'N/A'}\x1B\x21\x00
    \x1B\x21\x30Token No.: ${order_number}\x1B\x21\x00
    \x1B\x21\x08Name: ${customer_name || 'Customer'}\x1B\x21\x00
    \x1B\x21\x08Date: ${dateStr} ${timeStr}\x1B\x21\x00
    \x1B\x21\x08Delivery    Cashier: biller\x1B\x21\x00
    \x1B\x21\x08Bill No.: ${order_number}\x1B\x21\x00
    ----------------------------------------
    \x1B\x21\x08Item                    Qty. Price Amount\x1B\x21\x00
    ----------------------------------------`;
    } else if (isMiniMeals) {
      // Mini Meals format (using Chatkara template with Mini Meals branding)
      receipt = `\x1B\x21\x30        ${cafe_name?.toUpperCase() || 'MINI MEALS'}\x1B\x21\x00
    ----------------------------------------
    \x1B\x21\x30${customer_phone || '9999999999'} ${data.delivery_block || 'N/A'}\x1B\x21\x00
    \x1B\x21\x30Token No.: ${order_number}\x1B\x21\x00
    \x1B\x21\x08Name: ${customer_name || 'Customer'}\x1B\x21\x00
    \x1B\x21\x08Date: ${dateStr} ${timeStr}\x1B\x21\x00
    \x1B\x21\x08Delivery    Cashier: biller\x1B\x21\x00
    \x1B\x21\x08Bill No.: ${order_number}\x1B\x21\x00
    ----------------------------------------
    \x1B\x21\x08Item                    Qty. Price Amount\x1B\x21\x00
    ----------------------------------------`;
    } else if (isFoodCourt) {
      // Food Court format (using Chatkara template with Food Court branding)
      receipt = `\x1B\x21\x30        ${cafe_name?.toUpperCase() || 'FOOD COURT'}\x1B\x21\x00
    ----------------------------------------
    \x1B\x21\x30${customer_phone || '9999999999'} ${data.delivery_block || 'N/A'}\x1B\x21\x00
    \x1B\x21\x30Token No.: ${order_number}\x1B\x21\x00
    \x1B\x21\x08Name: ${customer_name || 'Customer'}\x1B\x21\x00
    \x1B\x21\x08Date: ${dateStr} ${timeStr}\x1B\x21\x00
    \x1B\x21\x08Delivery    Cashier: biller\x1B\x21\x00
    \x1B\x21\x08Bill No.: ${order_number}\x1B\x21\x00
    ----------------------------------------
    \x1B\x21\x08Item                    Qty. Price Amount\x1B\x21\x00
    ----------------------------------------`;
    } else if (isCookHouse) {
      // Cook House format (using Chatkara template with Cook House branding)
      receipt = `\x1B\x21\x30        ${cafe_name?.toUpperCase() || 'COOK HOUSE'}\x1B\x21\x00
    ----------------------------------------
    \x1B\x21\x30${customer_phone || '9999999999'} ${data.delivery_block || 'N/A'}\x1B\x21\x00
    \x1B\x21\x30Token No.: ${order_number}\x1B\x21\x00
    \x1B\x21\x08Name: ${customer_name || 'Customer'}\x1B\x21\x00
    \x1B\x21\x08Date: ${dateStr} ${timeStr}\x1B\x21\x00
    \x1B\x21\x08Delivery    Cashier: biller\x1B\x21\x00
    \x1B\x21\x08Bill No.: ${order_number}\x1B\x21\x00
    ----------------------------------------
    \x1B\x21\x08Item                    Qty. Price Amount\x1B\x21\x00
    ----------------------------------------`;
    } else {
      // Default MUJ Food Club format with bold formatting
      receipt = `\x1B\x21\x30        MUJ FOOD CLUB\x1B\x21\x00
    ----------------------------------------
    \x1B\x21\x08Name: ${customer_name || 'WALK-IN'} (M: ${customer_phone || '9999999999'})\x1B\x21\x00
    Date: ${dateStr}    ${timeStr}    ${payment_method?.toUpperCase() === 'COD' ? 'Pick Up' : 'Delivery'}
    Cashier: biller    \x1B\x21\x08Bill No.: ${order_number}\x1B\x21\x00
    \x1B\x21\x08Token No.: ${order_number.slice(-2)}\x1B\x21\x00
    ----------------------------------------
    \x1B\x21\x08Item                    Qty. Price Amount\x1B\x21\x00
    ----------------------------------------`;
    }

    // Add items with proper center-aligned formatting
    items.forEach(item => {
      const itemName = item.name.toUpperCase().substring(0, 20).padEnd(20);
      const qty = item.quantity.toString().padStart(2);
      
      // Use different format for Chatkara, Mini Meals, and Cook House vs others
      let price, amount;
      if (isChatkara || isMiniMeals || isCookHouse) {
        price = item.unit_price.toFixed(0).padStart(4);
        amount = item.total_price.toFixed(0).padStart(5);
      } else {
        price = item.unit_price.toFixed(0).padStart(4);
        amount = item.total_price.toFixed(0).padStart(5);
      }
      
      if (isChatkara || isMiniMeals || isCookHouse) {
        // Keep normal size for item names in receipt
        receipt += `\n    \x1B\x21\x08${itemName}\x1B\x21\x00 ${qty}    ${price}    ${amount}`;
      } else {
        receipt += `\n    ${itemName} ${qty}    ${price}    ${amount}`;
      }
    });

    // Add cafe-specific footer
    if (isChatkara) {
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
    
    // Determine cafe-specific format (Chatkara first, then Mini Meals, then Cook House, then Food Court)
    const isChatkara = cafe_name?.toLowerCase().includes('chatkara') || 
                       cafe_name === 'CHATKARA' ||
                       cafe_name?.toLowerCase() === 'chatkara';
    const isMiniMeals = cafe_name?.toLowerCase().includes('mini meals') || 
                        cafe_name === 'MINI MEALS' ||
                        cafe_name?.toLowerCase() === 'mini meals';
    const isCookHouse = cafe_name?.toLowerCase().includes('cook house') || 
                        cafe_name === 'COOK HOUSE' ||
                        cafe_name?.toLowerCase() === 'cook house';
    const isFoodCourt = cafe_name?.toLowerCase().includes('food court') || 
                        cafe_name === 'FOOD COURT' ||
                        cafe_name?.toLowerCase() === 'food court';
    
    console.log('🔍 PrintNode KOT - Cafe name:', cafe_name);
    console.log('🔍 PrintNode KOT - Is Chatkara:', isChatkara);
    console.log('🔍 PrintNode KOT - Is Mini Meals:', isMiniMeals);
    console.log('🔍 PrintNode KOT - Is Cook House:', isCookHouse);
    console.log('🔍 PrintNode KOT - Is Food Court:', isFoodCourt);
    console.log('🔍 PrintNode KOT - Using format:', isChatkara ? 'CHATKARA' : isMiniMeals ? 'MINI MEALS' : isCookHouse ? 'COOK HOUSE' : isFoodCourt ? 'FOOD COURT' : 'MUJ FOOD CLUB');
    
    // Proper center-aligned KOT format with bold formatting
    let kot = `    ----------------------------------------
    ${dateStr} ${timeStr}
    \x1B\x21\x30KOT - ${order_number}\x1B\x21\x00
    \x1B\x21\x08${isChatkara || isCookHouse || isFoodCourt ? 'DELIVERY' : 'PICK UP'}\x1B\x21\x00
    ----------------------------------------
    \x1B\x21\x08ITEM                              QTY\x1B\x21\x00
    ----------------------------------------`;

    // Add items with proper two-column layout
    items.forEach(item => {
      const itemName = item.name.toUpperCase();
      const qty = item.quantity.toString();
      
      if (isChatkara || isMiniMeals || isCookHouse || isFoodCourt) {
        // Create proper two-column layout: item name (left) and quantity (right)
        const totalWidth = 40; // Total width of the line
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
      } else {
        kot += `\n    ${itemName} ${qty}`;
      }
    });

    // Add cafe-specific footer
    if (isChatkara) {
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
   * Unicode-safe base64 encoding
   */
  private unicodeToBase64(str: string): string {
    try {
      // First encode to UTF-8 bytes, then to base64
      const utf8Bytes = new TextEncoder().encode(str);
      const base64 = btoa(String.fromCharCode(...utf8Bytes));
      return base64;
    } catch (error) {
      console.error('Base64 encoding error:', error);
      // Fallback: remove non-ASCII characters and encode
      const asciiStr = str.replace(/[^\x00-\x7F]/g, '?');
      return btoa(asciiStr);
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