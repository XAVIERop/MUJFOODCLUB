import { useState, useEffect, useCallback } from 'react';
import { PrintNodeService, PrintNodePrinter, PrintJobResult } from '@/services/printNodeService';
import { ReceiptData } from '@/components/ReceiptGenerator';
import { supabase } from '@/integrations/supabase/client';

interface UsePrintNodeReturn {
  isAvailable: boolean;
  isConnected: boolean;
  printers: PrintNodePrinter[];
  isPrinting: boolean;
  printReceipt: (receiptData: ReceiptData, printerId?: number) => Promise<PrintJobResult>;
  printKOT: (receiptData: ReceiptData, printerId?: number) => Promise<PrintJobResult>;
  printOrderReceipt: (receiptData: ReceiptData, printerId?: number) => Promise<PrintJobResult>;
  testPrint: (printerId?: number) => Promise<PrintJobResult>;
  refreshPrinters: () => Promise<void>;
  accountInfo: any;
  error: string | null;
  isConfigured: boolean;
}

export const usePrintNode = (cafeId?: string): UsePrintNodeReturn => {
  const [isAvailable, setIsAvailable] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [printers, setPrinters] = useState<PrintNodePrinter[]>([]);
  const [isPrinting, setIsPrinting] = useState(false);
  const [accountInfo, setAccountInfo] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [isConfigured, setIsConfigured] = useState(false);

  // Initialize PrintNode service
  const [printNodeService, setPrintNodeService] = useState<PrintNodeService | null>(null);

  // Get cafe-specific API key
  const getCafeApiKey = useCallback(async (cafeId?: string): Promise<string> => {
    if (!cafeId) {
      // Fallback to general API key
      const apiKey =
        import.meta.env.VITE_PRINTNODE_API_KEY ||
        import.meta.env.VITE_SHARED_PRINTNODE_API_KEY;
      if (!apiKey || apiKey === 'your-shared-printnode-api-key') {
        console.error('PrintNode fallback API key not configured');
        return '';
      }
      return apiKey;
    }

    try {
      // Get cafe name from database
      const { data: cafe } = await supabase
        .from('cafes')
        .select('name')
        .eq('id', cafeId)
        .single();

      if (!cafe) {
        console.warn('Cafe not found, using fallback API key');
        const apiKey = import.meta.env.VITE_PRINTNODE_API_KEY;
        if (!apiKey) {
          console.error('VITE_PRINTNODE_API_KEY environment variable is not set');
          return '';
        }
        return apiKey;
      }

      console.log('🔍 usePrintNode - Cafe name from database:', cafe.name);
      console.log('🔍 usePrintNode - Cafe name lowercase:', cafe.name.toLowerCase());
      console.log('🔍 usePrintNode - Contains punjabi:', cafe.name.toLowerCase().includes('punjabi'));
      console.log('🔍 usePrintNode - Contains tadka:', cafe.name.toLowerCase().includes('tadka'));

      // Return cafe-specific API key
      if (cafe.name.toLowerCase().includes('chatkara')) {
        console.log('Using Chatkara API key');
        const apiKey = import.meta.env.VITE_CHATKARA_PRINTNODE_API_KEY;
        if (!apiKey || apiKey === 'your-chatkara-printnode-api-key') {
          console.warn('VITE_CHATKARA_PRINTNODE_API_KEY not set, using main API key');
          const fallbackKey = import.meta.env.VITE_PRINTNODE_API_KEY;
          if (!fallbackKey) {
            console.error('VITE_PRINTNODE_API_KEY environment variable is not set');
            return '';
          }
          return fallbackKey;
        }
        return apiKey;
      } else if (cafe.name.toLowerCase().includes('cook house')) {
        console.log('Using Cook House API key');
        const apiKey = import.meta.env.VITE_COOKHOUSE_PRINTNODE_API_KEY;
        if (!apiKey || apiKey === 'your-cookhouse-printnode-api-key') {
          console.warn('VITE_COOKHOUSE_PRINTNODE_API_KEY not set, using main API key');
          const fallbackKey = import.meta.env.VITE_PRINTNODE_API_KEY;
          if (!fallbackKey) {
            console.error('VITE_PRINTNODE_API_KEY environment variable is not set');
            return '';
          }
          return fallbackKey;
        }
        return apiKey;
      } else if (cafe.name.toLowerCase().includes('food court')) {
        console.log('Using Food Court API key');
        const apiKey = import.meta.env.VITE_FOODCOURT_PRINTNODE_API_KEY;
        if (!apiKey || apiKey === 'your-foodcourt-printnode-api-key') {
          console.warn('VITE_FOODCOURT_PRINTNODE_API_KEY not set, using main API key');
          const fallbackKey = import.meta.env.VITE_PRINTNODE_API_KEY;
          if (!fallbackKey) {
            console.error('VITE_PRINTNODE_API_KEY environment variable is not set');
            return '';
          }
          return fallbackKey;
        }
        return apiKey;
      } else if (cafe.name.toLowerCase().includes('mini meals')) {
        console.log('Using Mini Meals API key');
        const apiKey = import.meta.env.VITE_MINI_MEALS_PRINTNODE_API_KEY;
        if (!apiKey || apiKey === 'your-mini-meals-printnode-api-key') {
          console.warn('VITE_MINI_MEALS_PRINTNODE_API_KEY not set, using main API key');
          const fallbackKey = import.meta.env.VITE_PRINTNODE_API_KEY;
          if (!fallbackKey) {
            console.error('VITE_PRINTNODE_API_KEY environment variable is not set');
            return '';
          }
          return fallbackKey;
        }
        return apiKey;
      } else if (cafe.name.toLowerCase().includes('punjabi') && cafe.name.toLowerCase().includes('tadka')) {
        console.log('✅ usePrintNode - Using Punjabi Tadka API key');
        console.log('✅ usePrintNode - Punjabi Tadka API key value:', import.meta.env.VITE_PUNJABI_TADKA_PRINTNODE_API_KEY);
        const apiKey = import.meta.env.VITE_PUNJABI_TADKA_PRINTNODE_API_KEY;
        if (!apiKey || apiKey === 'your-punjabi-tadka-printnode-api-key') {
          console.warn('VITE_PUNJABI_TADKA_PRINTNODE_API_KEY not set, using main API key');
          const fallbackKey = import.meta.env.VITE_PRINTNODE_API_KEY;
          if (!fallbackKey) {
            console.error('VITE_PRINTNODE_API_KEY environment variable is not set');
            return '';
          }
          return fallbackKey;
        }
        return apiKey;
      } else if (cafe.name.toLowerCase().includes('pizza') && cafe.name.toLowerCase().includes('bakers')) {
        console.log('✅ usePrintNode - Using Pizza Bakers API key');
        console.log('✅ usePrintNode - Pizza Bakers API key value:', import.meta.env.VITE_PIZZA_BAKERS_PRINTNODE_API_KEY);
        console.log('✅ usePrintNode - Pizza Bakers API key length:', import.meta.env.VITE_PIZZA_BAKERS_PRINTNODE_API_KEY?.length);
        console.log('✅ usePrintNode - Pizza Bakers API key type:', typeof import.meta.env.VITE_PIZZA_BAKERS_PRINTNODE_API_KEY);
        const apiKey = import.meta.env.VITE_PIZZA_BAKERS_PRINTNODE_API_KEY;
        if (!apiKey || apiKey === 'your-pizza-bakers-printnode-api-key') {
          console.warn('❌ VITE_PIZZA_BAKERS_PRINTNODE_API_KEY not set or invalid, using main API key');
          console.warn('❌ API Key value:', apiKey);
          console.warn('❌ API Key is undefined:', apiKey === undefined);
          console.warn('❌ API Key is null:', apiKey === null);
          console.warn('❌ API Key is empty string:', apiKey === '');
          const fallbackKey = import.meta.env.VITE_PRINTNODE_API_KEY;
          if (!fallbackKey) {
            console.error('VITE_PRINTNODE_API_KEY environment variable is not set');
            return '';
          }
          return fallbackKey;
        }
        console.log('✅ usePrintNode - Pizza Bakers API key is valid, using it');
        return apiKey;
      } else if (cafe.name.toLowerCase().includes('munch') && cafe.name.toLowerCase().includes('box')) {
        console.log('✅ usePrintNode - Using Munch Box API key');
        console.log('✅ usePrintNode - Munch Box API key value:', import.meta.env.VITE_MUNCHBOX_PRINTNODE_API_KEY);
        const apiKey = import.meta.env.VITE_MUNCHBOX_PRINTNODE_API_KEY;
        if (!apiKey || apiKey === 'your-munchbox-printnode-api-key') {
          console.warn('VITE_MUNCHBOX_PRINTNODE_API_KEY not set, using main API key');
          const fallbackKey = import.meta.env.VITE_PRINTNODE_API_KEY;
          if (!fallbackKey) {
            console.error('VITE_PRINTNODE_API_KEY environment variable is not set');
            return '';
          }
          return fallbackKey;
        }
        console.log('✅ usePrintNode - Munch Box API key is valid, using it');
        return apiKey;
      } else if (cafe.name.toLowerCase().includes('grabit')) {
        console.log('✅ usePrintNode - Using Grabit API key');
        const apiKey =
          import.meta.env.VITE_GRABIT_PRINTNODE_API_KEY ||
          import.meta.env.VITE_24_SEVEN_MART_PRINTNODE_API_KEY ||
          import.meta.env.VITE_SHARED_PRINTNODE_API_KEY;

        if (!apiKey || apiKey === 'your-grabit-printnode-api-key' || apiKey === 'your-shared-printnode-api-key') {
          console.warn('VITE_GRABIT_PRINTNODE_API_KEY not set, trying fallback');
          const fallbackKey =
            import.meta.env.VITE_24_SEVEN_MART_PRINTNODE_API_KEY ||
            import.meta.env.VITE_SHARED_PRINTNODE_API_KEY ||
            import.meta.env.VITE_PRINTNODE_API_KEY;
          if (!fallbackKey || fallbackKey === 'your-shared-printnode-api-key') {
            console.error('VITE_PRINTNODE_API_KEY environment variable is not set');
            return '';
          }
          console.log('✅ usePrintNode - Using fallback PrintNode API key for Grabit');
          return fallbackKey;
        }
        console.log('✅ usePrintNode - Grabit API key is valid, using it');
        return apiKey;
      } else if (cafe.name.toLowerCase().includes('banna')) {
        console.log('✅ usePrintNode - Using Banna\'s Chowki API key');
        const apiKey = import.meta.env.VITE_BANNAS_CHOWKI_PRINTNODE_API_KEY;
        if (!apiKey || apiKey === 'your-bannas-chowki-printnode-api-key') {
          console.warn('VITE_BANNAS_CHOWKI_PRINTNODE_API_KEY not set, using main API key');
          const fallbackKey =
            import.meta.env.VITE_PRINTNODE_API_KEY ||
            import.meta.env.VITE_SHARED_PRINTNODE_API_KEY;
          if (!fallbackKey || fallbackKey === 'your-shared-printnode-api-key') {
            console.error('VITE_PRINTNODE_API_KEY environment variable is not set');
            return '';
          }
          return fallbackKey;
        }
        console.log('✅ usePrintNode - Banna\'s Chowki API key is valid, using it');
        return apiKey;
      } else if (cafe.name.toLowerCase().includes('amor')) {
        console.log('✅ usePrintNode - Using Amor API key');
        const apiKey = import.meta.env.VITE_AMOR_PRINTNODE_API_KEY;
        if (!apiKey || apiKey === 'your-amor-printnode-api-key') {
          console.warn('VITE_AMOR_PRINTNODE_API_KEY not set, using main API key');
          const fallbackKey =
            import.meta.env.VITE_PRINTNODE_API_KEY ||
            import.meta.env.VITE_SHARED_PRINTNODE_API_KEY;
          if (!fallbackKey || fallbackKey === 'your-shared-printnode-api-key') {
            console.error('VITE_PRINTNODE_API_KEY environment variable is not set');
            return '';
          }
          return fallbackKey;
        }
        console.log('✅ usePrintNode - Amor API key is valid, using it');
        return apiKey;
      } else if (cafe.name.toLowerCase().includes('stardom')) {
        console.log('✅ usePrintNode - Using Stardom API key');
        console.log('✅ usePrintNode - Stardom API key value:', import.meta.env.VITE_STARDOM_PRINTNODE_API_KEY ? 'Found' : 'Not found');
        const apiKey = import.meta.env.VITE_STARDOM_PRINTNODE_API_KEY;
        if (!apiKey || apiKey === 'your-stardom-printnode-api-key') {
          console.warn('⚠️ VITE_STARDOM_PRINTNODE_API_KEY not set, using main API key');
          console.warn('⚠️ This will show the wrong PrintNode account!');
          const fallbackKey =
            import.meta.env.VITE_PRINTNODE_API_KEY ||
            import.meta.env.VITE_SHARED_PRINTNODE_API_KEY;
          if (!fallbackKey || fallbackKey === 'your-shared-printnode-api-key') {
            console.error('VITE_PRINTNODE_API_KEY environment variable is not set');
            return '';
          }
          return fallbackKey;
        }
        console.log('✅ usePrintNode - Stardom API key is valid, using it');
        return apiKey;
      }

      // Fallback to general API key
      const apiKey =
        import.meta.env.VITE_PRINTNODE_API_KEY ||
        import.meta.env.VITE_SHARED_PRINTNODE_API_KEY;
      if (!apiKey || apiKey === 'your-shared-printnode-api-key') {
        console.error('PrintNode fallback API key not configured');
        return '';
      }
      return apiKey;
    } catch (error) {
      console.error('Error fetching cafe info:', error);
      const apiKey = import.meta.env.VITE_PRINTNODE_API_KEY;
      if (!apiKey) {
        console.error('VITE_PRINTNODE_API_KEY environment variable is not set');
        return '';
      }
      return apiKey;
    }
  }, []);

  useEffect(() => {
    const initializeService = async () => {
      const apiKey = await getCafeApiKey(cafeId);
      
      console.log('PrintNode API Key:', apiKey ? 'Found' : 'Not found');
      console.log('Cafe ID:', cafeId);
      
      if (apiKey) {
        const service = new PrintNodeService({ apiKey });
        setPrintNodeService(service);
        console.log('PrintNode service initialized with API key:', apiKey.substring(0, 10) + '...');
        setError(null);
        setIsConfigured(true);
      } else {
        setIsConfigured(false);
        if (cafeId) {
          console.warn('PrintNode API key not found for this cafe. Check cafe-specific environment variables.');
          setError('PrintNode API key not configured');
        } else {
          console.log('PrintNode fallback key not provided. Waiting for cafe-specific key.');
        }
      }
    };

    initializeService();
  }, [cafeId, getCafeApiKey]);

  // Check PrintNode availability
  const checkAvailability = useCallback(async () => {
    if (!printNodeService) {
      console.log('PrintNode service not initialized yet');
      return;
    }

    try {
      setError(null);
      console.log('Checking PrintNode availability...');
      const available = await printNodeService.isAvailable();
      console.log('PrintNode available:', available);
      setIsAvailable(available);
      setIsConnected(available);

      if (available) {
        // Get account info
        const info = await printNodeService.getAccountInfo();
        setAccountInfo(info);
        console.log('PrintNode account info:', info);
      }
    } catch (error) {
      console.error('PrintNode availability check failed:', error);
      setIsAvailable(false);
      setIsConnected(false);
      setError(error instanceof Error ? error.message : 'PrintNode service unavailable');
    }
  }, [printNodeService]);

  // Refresh available printers
  const refreshPrinters = useCallback(async () => {
    if (!printNodeService || !isAvailable) return;

    try {
      setError(null);
      const availablePrinters = await printNodeService.getAvailablePrinters();
      setPrinters(availablePrinters);
    } catch (error) {
      console.error('Failed to refresh printers:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch printers');
    }
  }, [printNodeService, isAvailable]);

  // Print receipt (both KOT and Order Receipt)
  const printReceipt = useCallback(async (receiptData: ReceiptData, printerId?: number): Promise<PrintJobResult> => {
    if (!printNodeService || !isAvailable) {
      return {
        success: false,
        error: 'PrintNode service not available'
      };
    }

    setIsPrinting(true);
    setError(null);

    try {
      const result = await printNodeService.printReceipt(receiptData, printerId);
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Print failed';
      setError(errorMessage);
      return {
        success: false,
        error: errorMessage
      };
    } finally {
      setIsPrinting(false);
    }
  }, [printNodeService, isAvailable]);

  // Print KOT only
  const printKOT = useCallback(async (receiptData: ReceiptData, printerId?: number): Promise<PrintJobResult> => {
    if (!printNodeService || !isAvailable) {
      return {
        success: false,
        error: 'PrintNode service not available'
      };
    }

    setIsPrinting(true);
    setError(null);

    try {
      // If no printer ID specified, use cafe-specific printer
      let targetPrinterId = printerId;
      if (!targetPrinterId && cafeId) {
        try {
          const { data: cafe } = await supabase
            .from('cafes')
            .select('name')
            .eq('id', cafeId)
            .single();

          if (cafe) {
            if (cafe.name.toLowerCase().includes('chatkara')) {
              targetPrinterId = 74698272; // Chatkara POS-80-Series
            } else if (cafe.name.toLowerCase().includes('food court')) {
              targetPrinterId = 74692682; // Food Court EPSON TM-T82 Receipt
            } else if (cafe.name.toLowerCase().includes('mini meals')) {
              targetPrinterId = 74756354; // Mini Meals Printer
            } else if (cafe.name.toLowerCase().includes('punjabi') && cafe.name.toLowerCase().includes('tadka')) {
              targetPrinterId = 74782622; // Punjabi Tadka Printer (POS-60C)
            } else if (cafe.name.toLowerCase().includes('stardom')) {
              targetPrinterId = 74910967; // Stardom THERMAL Receipt Printer
            }
          }
        } catch (error) {
          console.error('Error fetching cafe info for printer selection:', error);
        }
      }

      const result = await printNodeService.printKOT(receiptData, targetPrinterId);
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'KOT print failed';
      setError(errorMessage);
      return {
        success: false,
        error: errorMessage
      };
    } finally {
      setIsPrinting(false);
    }
  }, [printNodeService, isAvailable, cafeId]);

  // Print Order Receipt only
  const printOrderReceipt = useCallback(async (receiptData: ReceiptData, printerId?: number): Promise<PrintJobResult> => {
    if (!printNodeService || !isAvailable) {
      return {
        success: false,
        error: 'PrintNode service not available'
      };
    }

    setIsPrinting(true);
    setError(null);

    try {
      // If no printer ID specified, use cafe-specific printer
      let targetPrinterId = printerId;
      if (!targetPrinterId && cafeId) {
        try {
          const { data: cafe } = await supabase
            .from('cafes')
            .select('name')
            .eq('id', cafeId)
            .single();

          if (cafe) {
            if (cafe.name.toLowerCase().includes('chatkara')) {
              targetPrinterId = 74698272; // Chatkara POS-80-Series
            } else if (cafe.name.toLowerCase().includes('food court')) {
              targetPrinterId = 74692682; // Food Court EPSON TM-T82 Receipt
            } else if (cafe.name.toLowerCase().includes('mini meals')) {
              targetPrinterId = 74756354; // Mini Meals Printer
            } else if (cafe.name.toLowerCase().includes('punjabi') && cafe.name.toLowerCase().includes('tadka')) {
              targetPrinterId = 74782622; // Punjabi Tadka Printer (POS-60C)
            } else if (cafe.name.toLowerCase().includes('stardom')) {
              targetPrinterId = 74910967; // Stardom THERMAL Receipt Printer
            }
          }
        } catch (error) {
          console.error('Error fetching cafe info for printer selection:', error);
        }
      }

      const result = await printNodeService.printOrderReceipt(receiptData, targetPrinterId);
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Order receipt print failed';
      setError(errorMessage);
      return {
        success: false,
        error: errorMessage
      };
    } finally {
      setIsPrinting(false);
    }
  }, [printNodeService, isAvailable, cafeId]);

  // Test print
  const testPrint = useCallback(async (printerId?: number): Promise<PrintJobResult> => {
    if (!printNodeService || !isAvailable) {
      return {
        success: false,
        error: 'PrintNode service not available'
      };
    }

    setIsPrinting(true);
    setError(null);

    try {
      const result = await printNodeService.testPrint(printerId);
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Test print failed';
      setError(errorMessage);
      return {
        success: false,
        error: errorMessage
      };
    } finally {
      setIsPrinting(false);
    }
  }, [printNodeService, isAvailable]);

  // Initial setup
  useEffect(() => {
    if (printNodeService) {
      checkAvailability();
    }
  }, [printNodeService, checkAvailability]);

  // Refresh printers when service becomes available
  useEffect(() => {
    if (isAvailable) {
      refreshPrinters();
    }
  }, [isAvailable, refreshPrinters]);

  return {
    isAvailable,
    isConnected,
    printers,
    isPrinting,
    printReceipt,
    printKOT,
    printOrderReceipt,
    testPrint,
    refreshPrinters,
    accountInfo,
    error,
    isConfigured
  };
};