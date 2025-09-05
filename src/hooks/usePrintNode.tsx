import { useState, useEffect, useCallback } from 'react';
import { PrintNodeService, PrintNodePrinter, PrintJobResult } from '@/services/printNodeService';
import { ReceiptData } from '@/components/ReceiptGenerator';

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

export const usePrintNode = (): UsePrintNodeReturn => {
  const [isAvailable, setIsAvailable] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [printers, setPrinters] = useState<PrintNodePrinter[]>([]);
  const [isPrinting, setIsPrinting] = useState(false);
  const [accountInfo, setAccountInfo] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // Initialize PrintNode service
  const [printNodeService, setPrintNodeService] = useState<PrintNodeService | null>(null);

  useEffect(() => {
    // Initialize PrintNode service with API key from environment
    const apiKey = import.meta.env.VITE_PRINTNODE_API_KEY || 'TYqkDtkjFvRAfg5_zcR1nUE00Ou2zenJHG-9LpGqkkg';
    
    console.log('PrintNode API Key:', apiKey ? 'Found' : 'Not found');
    console.log('Environment API Key:', import.meta.env.VITE_PRINTNODE_API_KEY);
    
    if (apiKey) {
      const service = new PrintNodeService({ apiKey });
      setPrintNodeService(service);
      console.log('PrintNode service initialized with API key:', apiKey.substring(0, 10) + '...');
    } else {
      console.warn('PrintNode API key not found. Set VITE_PRINTNODE_API_KEY in your environment variables.');
      setError('PrintNode API key not configured');
    }
  }, []);

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
      const result = await printNodeService.printKOT(receiptData, printerId);
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
  }, [printNodeService, isAvailable]);

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
      const result = await printNodeService.printOrderReceipt(receiptData, printerId);
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
  }, [printNodeService, isAvailable]);

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