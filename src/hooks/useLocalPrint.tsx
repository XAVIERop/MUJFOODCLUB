import { useState, useEffect, useCallback } from 'react';
import { localPrintService, type Printer, type PrintResponse, type ReceiptData } from '@/services/localPrintService';

interface UseLocalPrintReturn {
  // State
  isAvailable: boolean;
  printers: Printer[];
  isLoading: boolean;
  isPrinting: boolean;
  lastPrintResult: PrintResponse | null;
  serviceInfo: any;
  
  // Actions
  printReceipt: (receiptData: ReceiptData, printerId?: string) => Promise<PrintResponse>;
  testPrint: () => Promise<PrintResponse>;
  refreshStatus: () => Promise<void>;
  checkAvailability: () => Promise<boolean>;
}

export const useLocalPrint = (): UseLocalPrintReturn => {
  const [isAvailable, setIsAvailable] = useState(false);
  const [printers, setPrinters] = useState<Printer[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const [lastPrintResult, setLastPrintResult] = useState<PrintResponse | null>(null);
  const [serviceInfo, setServiceInfo] = useState<any>(null);

  // Check availability and get printers
  const checkAvailability = useCallback(async (): Promise<boolean> => {
    try {
      setIsLoading(true);
      const available = await localPrintService.isAvailable();
      setIsAvailable(available);
      
      if (available) {
        const printers = await localPrintService.getAvailablePrinters();
        setPrinters(printers);
      } else {
        setPrinters([]);
      }
      
      return available;
    } catch (error) {
      console.error('Error checking local print availability:', error);
      setIsAvailable(false);
      setPrinters([]);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Get full service status
  const refreshStatus = useCallback(async (): Promise<void> => {
    try {
      setIsLoading(true);
      const status = await localPrintService.getServiceStatus();
      
      setIsAvailable(status.available);
      setPrinters(status.printers);
      setServiceInfo(status.serviceInfo);
    } catch (error) {
      console.error('Error refreshing local print status:', error);
      setIsAvailable(false);
      setPrinters([]);
      setServiceInfo(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Print receipt
  const printReceipt = useCallback(async (
    receiptData: ReceiptData, 
    printerId?: string
  ): Promise<PrintResponse> => {
    if (!isAvailable) {
      const errorResult: PrintResponse = {
        success: false,
        error: 'Local print service not available',
      };
      setLastPrintResult(errorResult);
      return errorResult;
    }

    try {
      setIsPrinting(true);
      const result = await localPrintService.printReceipt(receiptData, printerId);
      setLastPrintResult(result);
      return result;
    } catch (error) {
      const errorResult: PrintResponse = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
      setLastPrintResult(errorResult);
      return errorResult;
    } finally {
      setIsPrinting(false);
    }
  }, [isAvailable]);

  // Test print
  const testPrint = useCallback(async (): Promise<PrintResponse> => {
    if (!isAvailable) {
      const errorResult: PrintResponse = {
        success: false,
        error: 'Local print service not available',
      };
      setLastPrintResult(errorResult);
      return errorResult;
    }

    try {
      setIsPrinting(true);
      const result = await localPrintService.testPrint();
      setLastPrintResult(result);
      return result;
    } catch (error) {
      const errorResult: PrintResponse = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
      setLastPrintResult(errorResult);
      return errorResult;
    } finally {
      setIsPrinting(false);
    }
  }, [isAvailable]);

  // Check availability on mount
  useEffect(() => {
    checkAvailability();
  }, [checkAvailability]);

  // Auto-refresh status every 30 seconds
  useEffect(() => {
    if (!isAvailable) return;

    const interval = setInterval(() => {
      refreshStatus();
    }, 30000);

    return () => clearInterval(interval);
  }, [isAvailable, refreshStatus]);

  return {
    // State
    isAvailable,
    printers,
    isLoading,
    isPrinting,
    lastPrintResult,
    serviceInfo,
    
    // Actions
    printReceipt,
    testPrint,
    refreshStatus,
    checkAvailability,
  };
};
