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
}

export const usePrintNode = (cafeId?: string): UsePrintNodeReturn => {
  const [isAvailable, setIsAvailable] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [printers, setPrinters] = useState<PrintNodePrinter[]>([]);
  const [isPrinting, setIsPrinting] = useState(false);
  const [accountInfo, setAccountInfo] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // Initialize PrintNode service
  const [printNodeService, setPrintNodeService] = useState<PrintNodeService | null>(null);

  // Get cafe-specific API key
  const getCafeApiKey = useCallback(async (cafeId?: string): Promise<string> => {
    if (!cafeId) {
      // Fallback to general API key
      const apiKey = import.meta.env.VITE_PRINTNODE_API_KEY;
      if (!apiKey) {
        console.error('VITE_PRINTNODE_API_KEY environment variable is not set');
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

      // Return cafe-specific API key
      if (cafe.name.toLowerCase().includes('chatkara')) {
        console.log('Using Chatkara API key');
        const apiKey = import.meta.env.VITE_CHATKARA_PRINTNODE_API_KEY;
        if (!apiKey) {
          console.error('VITE_CHATKARA_PRINTNODE_API_KEY environment variable is not set');
          return '';
        }
        return apiKey;
      } else if (cafe.name.toLowerCase().includes('food court')) {
        console.log('Using Food Court API key');
        const apiKey = import.meta.env.VITE_FOODCOURT_PRINTNODE_API_KEY;
        if (!apiKey) {
          console.error('VITE_FOODCOURT_PRINTNODE_API_KEY environment variable is not set');
          return '';
        }
        return apiKey;
      }

      // Fallback to general API key
      const apiKey = import.meta.env.VITE_PRINTNODE_API_KEY;
      if (!apiKey) {
        console.error('VITE_PRINTNODE_API_KEY environment variable is not set');
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
      } else {
        console.warn('PrintNode API key not found. Set VITE_PRINTNODE_API_KEY in your environment variables.');
        setError('PrintNode API key not configured');
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
    error
  };
};