import { supabase } from '@/integrations/supabase/client';
import { PrintNodeService, PrintNodeConfig } from './printNodeService';
import { ezeepPrintService } from './ezeepPrintService';
import { enhancedBrowserPrintService } from './enhancedBrowserPrintService';

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
    is_vegetarian?: boolean; // Added for Banna's Chowki split printing
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
   * Initialize PrintNode service with cafe-specific API key
   * NO FALLBACKS - Each cafe must have its own configuration
   */
  private async initializePrintNode(cafeId?: string) {
    if (!cafeId) {
      console.error('❌ Unified Print Service: No cafeId provided - cannot initialize PrintNode');
      this.printNodeService = null;
      return;
    }

    try {
      // Get cafe name to determine which API key to use
      const { data: cafe } = await supabase
        .from('cafes')
        .select('name')
        .eq('id', cafeId)
        .single();

      if (!cafe) {
        console.error('❌ Unified Print Service: Cafe not found in database');
        this.printNodeService = null;
        return;
      }

      // Get cafe-specific API key
      let apiKey: string;
      if (cafe.name.toLowerCase().includes('chatkara')) {
        apiKey = import.meta.env.VITE_CHATKARA_PRINTNODE_API_KEY || '';
        if (!apiKey || apiKey === 'your-chatkara-printnode-api-key') {
          console.error('❌ Unified Print Service: VITE_CHATKARA_PRINTNODE_API_KEY not configured');
          this.printNodeService = null;
          return;
        } else {
          console.log('✅ Unified Print Service: Using Chatkara API key');
        }
      } else if (cafe.name.toLowerCase().includes('cook house')) {
        apiKey = import.meta.env.VITE_COOKHOUSE_PRINTNODE_API_KEY || '';
        if (!apiKey || apiKey === 'your-cookhouse-printnode-api-key') {
          console.error('❌ Unified Print Service: VITE_COOKHOUSE_PRINTNODE_API_KEY not configured');
          this.printNodeService = null;
          return;
        } else {
          console.log('✅ Unified Print Service: Using Cook House API key');
        }
      } else if (cafe.name.toLowerCase().includes('food court')) {
        apiKey = import.meta.env.VITE_FOODCOURT_PRINTNODE_API_KEY || '';
        if (!apiKey || apiKey === 'your-foodcourt-printnode-api-key') {
          console.error('❌ Unified Print Service: VITE_FOODCOURT_PRINTNODE_API_KEY not configured');
          this.printNodeService = null;
          return;
        } else {
          console.log('✅ Unified Print Service: Using Food Court API key');
        }
      } else if (cafe.name.toLowerCase().includes('punjabi') && cafe.name.toLowerCase().includes('tadka')) {
        apiKey = import.meta.env.VITE_PUNJABI_TADKA_PRINTNODE_API_KEY || '';
        if (!apiKey || apiKey === 'your-punjabi-tadka-printnode-api-key') {
          console.error('❌ Unified Print Service: VITE_PUNJABI_TADKA_PRINTNODE_API_KEY not configured');
          this.printNodeService = null;
          return;
        } else {
          console.log('✅ Unified Print Service: Using Punjabi Tadka API key');
        }
      } else if (cafe.name.toLowerCase().includes('pizza') && cafe.name.toLowerCase().includes('bakers')) {
        apiKey = import.meta.env.VITE_PIZZA_BAKERS_PRINTNODE_API_KEY || '';
        if (!apiKey || apiKey === 'your-pizza-bakers-printnode-api-key') {
          console.error('❌ Unified Print Service: VITE_PIZZA_BAKERS_PRINTNODE_API_KEY not configured');
          this.printNodeService = null;
          return;
        } else {
          console.log('✅ Unified Print Service: Using Pizza Bakers API key');
        }
      } else if (cafe.name.toLowerCase().includes('munch') && cafe.name.toLowerCase().includes('box')) {
        apiKey = import.meta.env.VITE_MUNCHBOX_PRINTNODE_API_KEY || '';
        if (!apiKey || apiKey === 'your-munchbox-printnode-api-key') {
          console.error('❌ Unified Print Service: VITE_MUNCHBOX_PRINTNODE_API_KEY not configured');
          this.printNodeService = null;
          return;
        } else {
          console.log('✅ Unified Print Service: Using Munch Box API key');
        }
      } else if (cafe.name.toLowerCase().includes('grabit')) {
        apiKey = import.meta.env.VITE_GRABIT_PRINTNODE_API_KEY || import.meta.env.VITE_24_SEVEN_MART_PRINTNODE_API_KEY || '';
        if (!apiKey || apiKey === 'your-grabit-printnode-api-key') {
          console.error('❌ Unified Print Service: VITE_GRABIT_PRINTNODE_API_KEY not configured');
          this.printNodeService = null;
          return;
        } else {
          console.log('✅ Unified Print Service: Using Grabit API key');
        }
      } else if (cafe.name.toLowerCase().includes('banna')) {
        apiKey = import.meta.env.VITE_BANNAS_CHOWKI_PRINTNODE_API_KEY || '';
        if (!apiKey || apiKey === 'your-bannas-chowki-printnode-api-key') {
          console.error('❌ Unified Print Service: VITE_BANNAS_CHOWKI_PRINTNODE_API_KEY not configured');
          this.printNodeService = null;
          return;
        } else {
          console.log('✅ Unified Print Service: Using Banna\'s Chowki API key');
        }
      } else if (cafe.name.toLowerCase().includes('amor')) {
        apiKey = import.meta.env.VITE_AMOR_PRINTNODE_API_KEY || '';
        if (!apiKey || apiKey === 'your-amor-printnode-api-key') {
          console.error('❌ Unified Print Service: VITE_AMOR_PRINTNODE_API_KEY not configured');
          this.printNodeService = null;
          return;
        } else {
          console.log('✅ Unified Print Service: Using Amor API key');
        }
      } else if (cafe.name.toLowerCase().includes('stardom')) {
        apiKey = import.meta.env.VITE_STARDOM_PRINTNODE_API_KEY 
          || import.meta.env.VITE_PRINTNODE_API_KEY 
          || import.meta.env.VITE_SHARED_PRINTNODE_API_KEY 
          || '';
        if (!apiKey || apiKey === 'your-stardom-printnode-api-key') {
          console.error('❌ Unified Print Service: VITE_STARDOM_PRINTNODE_API_KEY not configured');
          this.printNodeService = null;
          return;
        } else {
          console.log('✅ Unified Print Service: Using Stardom API key');
        }
      } else if (cafe.name.toLowerCase().includes('taste') && cafe.name.toLowerCase().includes('india')) {
        // Taste of India: PrintNode service disabled
        console.log('🚫 Unified Print Service: PrintNode service disabled for Taste of India');
        return {
          success: false,
          error: 'PrintNode service is disabled for Taste of India',
          method: 'disabled'
        };
      } else {
        console.error(`❌ Unified Print Service: No API key configured for cafe: ${cafe.name}`);
        this.printNodeService = null;
        return;
      }

      if (apiKey) {
        this.printNodeService = new PrintNodeService({
          apiKey: apiKey,
          baseUrl: 'https://api.printnode.com'
        });
        console.log(`✅ Unified Print Service: PrintNode initialized for ${cafe.name}`);
      } else {
        console.error('❌ Unified Print Service: No valid API key found for cafe');
        this.printNodeService = null;
      }
    } catch (error) {
      console.error('❌ Unified Print Service: Error fetching cafe info:', error);
      this.printNodeService = null;
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
   * Resolve cafe ID from a cafe name (case-insensitive)
   */
  private async getCafeIdByName(cafeName: string): Promise<string | null> {
    try {
      const { data, error } = await supabase
        .from('cafes')
        .select('id')
        .ilike('name', cafeName)
        .limit(1)
        .single();

      if (error) {
        console.error(`Error resolving cafe ID for name "${cafeName}":`, error);
        return null;
      }

      return data?.id || null;
    } catch (error) {
      console.error(`Unexpected error resolving cafe ID for name "${cafeName}":`, error);
      return null;
    }
  }

  /**
   * Print KOT for a specific cafe
   * For Banna's Chowki: Splits items by vegetarian status and prints to separate printers
   */
  async printKOT(receiptData: ReceiptData, cafeId: string): Promise<PrintResult> {
    console.log(`🔄 Unified Print Service: Printing KOT for cafe ${cafeId}`);
    
    try {
      // Get proper cafe name for formatting
      let cafeName = await this.getCafeName(cafeId);
      let normalizedCafeName = cafeName.toLowerCase();
      let isBannasChowki = normalizedCafeName.includes('banna');
      
      // Taste of India: PrintNode service disabled
      if (normalizedCafeName.includes('taste') && normalizedCafeName.includes('india')) {
        console.log('🚫 Unified Print Service: PrintNode service disabled for Taste of India');
        return {
          success: false,
          error: 'PrintNode service is disabled for Taste of India',
          method: 'disabled'
        };
      }
      
      // Reinitialize PrintNode service with cafe-specific API key
      await this.initializePrintNode(cafeId);
      
      // Banna's Chowki: Split KOT printing by vegetarian status
      if (isBannasChowki && this.printNodeService) {
        console.log('🥬 Banna\'s Chowki detected - splitting KOT by vegetarian status');
        
        // Debug: Log all items and their special instructions before splitting
        console.log('📝 All items before splitting:');
        receiptData.items.forEach((item, index) => {
          console.log(`  Item ${index + 1}: ${item.name}, Special Instructions: "${item.special_instructions || 'NONE'}"`);
        });
        
        // Split items into veg and non-veg
        // IMPORTANT: Use spread operator to ensure all properties (including special_instructions) are preserved
        const vegItems = receiptData.items
          .filter(item => item.is_vegetarian !== false)
          .map(item => ({ ...item })); // Explicitly preserve all properties
        const nonVegItems = receiptData.items
          .filter(item => item.is_vegetarian === false)
          .map(item => ({ ...item })); // Explicitly preserve all properties
        
        console.log(`🥬 Veg items: ${vegItems.length}, Non-Veg items: ${nonVegItems.length}`);
        
        // Debug: Verify special instructions are preserved after filtering
        console.log('📝 Veg items after filtering:');
        vegItems.forEach((item, index) => {
          const hasInstructions = item.special_instructions && item.special_instructions.trim() !== '';
          console.log(`  Veg Item ${index + 1}: ${item.name}, Special Instructions: "${item.special_instructions || 'NONE'}" (has: ${hasInstructions})`);
        });
        console.log('📝 Non-Veg items after filtering:');
        nonVegItems.forEach((item, index) => {
          const hasInstructions = item.special_instructions && item.special_instructions.trim() !== '';
          console.log(`  Non-Veg Item ${index + 1}: ${item.name}, Special Instructions: "${item.special_instructions || 'NONE'}" (has: ${hasInstructions})`);
        });
        
        const results: PrintResult[] = [];
        let allSuccess = true;
        const errors: string[] = [];
        
        // Print Veg KOT to VEG PRINTER (74916694)
        if (vegItems.length > 0) {
          const vegReceiptData: ReceiptData = {
            ...receiptData,
            items: vegItems,
            // Recalculate totals for veg items only
            subtotal: vegItems.reduce((sum, item) => sum + item.total_price, 0),
            final_amount: vegItems.reduce((sum, item) => sum + item.total_price, 0)
          };
          
          console.log('🥬 Printing Veg KOT to printer 74916694 (VEG PRINTER)');
          const vegResult = await this.printNodeService.printKOT(vegReceiptData, 74916694);
          results.push(vegResult);
          
          if (!vegResult.success) {
            allSuccess = false;
            errors.push(`Veg KOT: ${vegResult.error || 'Failed'}`);
          } else {
            console.log('✅ Veg KOT printed successfully');
          }
        } else {
          console.log('⚠️ No veg items to print');
        }
        
        // Print Non-Veg KOT to CASH NONVEGE (74916599)
        if (nonVegItems.length > 0) {
          const nonVegReceiptData: ReceiptData = {
            ...receiptData,
            items: nonVegItems,
            // Recalculate totals for non-veg items only
            subtotal: nonVegItems.reduce((sum, item) => sum + item.total_price, 0),
            final_amount: nonVegItems.reduce((sum, item) => sum + item.total_price, 0)
          };
          
          console.log('🍗 Printing Non-Veg KOT to printer 74916599 (CASH NONVEGE)');
          const nonVegResult = await this.printNodeService.printKOT(nonVegReceiptData, 74916599);
          results.push(nonVegResult);
          
          if (!nonVegResult.success) {
            allSuccess = false;
            errors.push(`Non-Veg KOT: ${nonVegResult.error || 'Failed'}`);
          } else {
            console.log('✅ Non-Veg KOT printed successfully');
          }
        } else {
          console.log('⚠️ No non-veg items to print');
        }
        
        // Return combined result
        if (allSuccess && results.length > 0) {
          return {
            success: true,
            method: 'printnode-split',
            jobId: results.map(r => r.jobId?.toString() || '').join('+')
          };
        } else {
          return {
            success: false,
            error: errors.join('; ') || 'Failed to print KOTs',
            method: 'printnode-split-failed'
          };
        }
      }
      
      // For other cafes, use normal single KOT printing
      const formattedReceiptData = { ...receiptData, cafe_name: cafeName };

      // Stardom: always print KOT to same printer as receipt (THERMAL Receipt Printer – 74910967)
      if (normalizedCafeName.includes('stardom') && this.printNodeService) {
        const stardomPrinterId = 74910967;
        console.log(`🖨️ Stardom KOT: Using dedicated printer ${stardomPrinterId}`);
        const stardomResult = await this.printNodeService.printKOT(formattedReceiptData, stardomPrinterId);
        if (stardomResult.success) {
          return { ...stardomResult, method: 'printnode-stardom', jobId: stardomResult.jobId?.toString() };
        }
        console.error('❌ Stardom KOT: Dedicated printer attempt failed, falling back to generic logic');
      }
      
      // Get cafe printer configuration
      let config = await this.getCafePrinterConfig(cafeId);

      // If no config found, try to resolve by cafe name from receipt data
      if (!config && receiptData?.cafe_name) {
        console.warn(`⚠️ Unified Print Service: No config for ${cafeId}. Trying receipt cafe name "${receiptData.cafe_name}"`);
        const resolvedCafeId = await this.getCafeIdByName(receiptData.cafe_name);
        if (resolvedCafeId && resolvedCafeId !== cafeId) {
          console.log(`✅ Resolved cafe ID ${resolvedCafeId} from receipt data. Retrying config lookup.`);
          cafeId = resolvedCafeId;
          cafeName = await this.getCafeName(cafeId);
          normalizedCafeName = cafeName.toLowerCase();
          isBannasChowki = normalizedCafeName.includes('banna');
          await this.initializePrintNode(cafeId);
          config = await this.getCafePrinterConfig(cafeId);
        }
      }
      
      // If no config found, try to use hardcoded printer IDs as fallback (same as receipt printing)
      if (!config) {
        console.warn('⚠️ Unified Print Service: No printer configuration found, trying hardcoded fallback');
        
        // Try to get printer ID from hardcoded fallback (same logic as usePrintNode hook)
        let fallbackPrinterId: number | null = null;
        const normalizedCafeName = cafeName.toLowerCase();
        
        if (normalizedCafeName.includes('chatkara')) {
          fallbackPrinterId = 74698272; // Chatkara POS-80-Series
        } else if (normalizedCafeName.includes('amor')) {
          fallbackPrinterId = 74902516; // Amor POS80 Printer
        } else if (normalizedCafeName.includes('food court')) {
          fallbackPrinterId = 74692682; // Food Court EPSON TM-T82 Receipt
        } else if (normalizedCafeName.includes('mini meals')) {
          fallbackPrinterId = 74756354; // Mini Meals Printer
        } else if (normalizedCafeName.includes('punjabi') && normalizedCafeName.includes('tadka')) {
          fallbackPrinterId = 74782622; // Punjabi Tadka Printer (POS-60C)
        } else if (normalizedCafeName.includes('stardom')) {
          fallbackPrinterId = 74910967; // Stardom THERMAL Receipt Printer
        }
        
        // If we have a fallback printer ID, use PrintNode directly
        if (fallbackPrinterId && this.printNodeService) {
          console.log(`🖨️ Using hardcoded fallback printer ID ${fallbackPrinterId} for ${cafeName}`);
          const result = await this.printNodeService.printKOT(formattedReceiptData, fallbackPrinterId);
          if (result.success) {
            return { ...result, method: 'printnode-fallback', jobId: result.jobId?.toString() };
          }
          console.error('❌ Hardcoded fallback PrintNode KOT failed');
        }
        
        // If no fallback available, return error
        console.error('❌ Unified Print Service: No printer configuration found for this cafe and no fallback available');
        return { 
          success: false, 
          error: 'No printer configuration found for this cafe',
          method: 'none'
        };
      }

      // Try local print server first if configured
      if (config.connection_type === 'browser' && config.printer_ip === 'localhost' && config.printer_port) {
        console.log(`🖨️ Using Local Print Server for KOT (Port: ${config.printer_port})`);
        
        const result = await this.printViaLocalServer(formattedReceiptData, config, 'KOT');
        if (result.success) {
          return result;
        }
        console.log('⚠️ Local print server KOT failed, falling back to browser');
      }

      // Try Ezeep if configured
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
          return { ...result, method: 'printnode', jobId: result.jobId?.toString() };
        }
        console.error('❌ PrintNode KOT failed - no fallback available');
        return { 
          success: false, 
          error: 'PrintNode printing failed for this cafe',
          method: 'printnode-failed'
        };
      }

      // NO FALLBACK - PrintNode is the only method
      console.error('❌ Unified Print Service: No valid printing method available for this cafe');
      return { 
        success: false, 
        error: 'No valid printing method configured for this cafe',
        method: 'none'
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
   * Print Receipt for a specific cafe
   */
  async printReceipt(receiptData: ReceiptData, cafeId: string): Promise<PrintResult> {
    console.log(`🔄 Unified Print Service: Printing Receipt for cafe ${cafeId}`);
    
    try {
      // Get proper cafe name for formatting
      const cafeName = await this.getCafeName(cafeId);
      
      // Taste of India: PrintNode service disabled
      if (cafeName.toLowerCase().includes('taste') && cafeName.toLowerCase().includes('india')) {
        console.log('🚫 Unified Print Service: PrintNode service disabled for Taste of India');
        return {
          success: false,
          error: 'PrintNode service is disabled for Taste of India',
          method: 'disabled'
        };
      }
      
      // Reinitialize PrintNode service with cafe-specific API key
      await this.initializePrintNode(cafeId);
      
      const formattedReceiptData = { ...receiptData, cafe_name: cafeName };
      
      // Get cafe printer configuration
      const config = await this.getCafePrinterConfig(cafeId);
      if (!config) {
        console.error('❌ Unified Print Service: No printer configuration found for this cafe');
        return { 
          success: false, 
          error: 'No printer configuration found for this cafe',
          method: 'none'
        };
      }

      // Try local print server first if configured
      if (config.connection_type === 'browser' && config.printer_ip === 'localhost' && config.printer_port) {
        console.log(`🖨️ Using Local Print Server for Receipt (Port: ${config.printer_port})`);
        
        const result = await this.printViaLocalServer(formattedReceiptData, config, 'RECEIPT');
        if (result.success) {
          return result;
        }
        console.log('⚠️ Local print server Receipt failed, falling back to browser');
      }

      // Try Ezeep if configured
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
          return { ...result, method: 'printnode', jobId: result.jobId?.toString() };
        }
        console.error('❌ PrintNode Receipt failed - no fallback available');
        return { 
          success: false, 
          error: 'PrintNode printing failed for this cafe',
          method: 'printnode-failed'
        };
      }

      // NO FALLBACK - PrintNode is the only method
      console.error('❌ Unified Print Service: No valid printing method available for this cafe');
      return { 
        success: false, 
        error: 'No valid printing method configured for this cafe',
        method: 'none'
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
   * Print via local print server
   */
  private async printViaLocalServer(receiptData: ReceiptData, config: CafePrinterConfig, type: 'KOT' | 'RECEIPT'): Promise<PrintResult> {
    try {
      const serverUrl = `http://${config.printer_ip}:${config.printer_port}/print`;
      
      const response = await fetch(serverUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type,
          content: receiptData,
          orderNumber: receiptData.order_number
        })
      });

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Local print server job sent successfully:', result);
        return { 
          success: true, 
          method: 'local_server',
          jobId: result.jobId
        };
      } else {
        throw new Error(`Local server error: ${response.statusText}`);
      }
    } catch (error) {
      console.error('❌ Local print server failed:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Local print server failed',
        method: 'local_server'
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
