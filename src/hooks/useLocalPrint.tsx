// Local Print Service Hook - DISABLED
// This hook is disabled in favor of cafe-specific PrintNode service

import { useState, useCallback } from 'react';

// Mock types since we're not using the actual service
type Printer = any;
type PrintResponse = any;
type ReceiptData = any;

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
  // Mock values since local print service is disabled
  const [isAvailable] = useState(false);
  const [printers] = useState<Printer[]>([]);
  const [isLoading] = useState(false);
  const [isPrinting] = useState(false);
  const [lastPrintResult] = useState<PrintResponse | null>(null);
  const [serviceInfo] = useState<any>(null);

  // Mock functions since local print service is disabled
  const checkAvailability = useCallback(async (): Promise<boolean> => {
    console.log('Local print service is disabled - using cafe-specific PrintNode service');
    return false;
  }, []);

  const refreshStatus = useCallback(async (): Promise<void> => {
    console.log('Local print service is disabled - using cafe-specific PrintNode service');
  }, []);

  const printReceipt = useCallback(async (
    receiptData: ReceiptData, 
    printerId?: string
  ): Promise<PrintResponse> => {
    console.log('Local print service is disabled - using cafe-specific PrintNode service');
    return {
      success: false,
      error: 'Local print service is disabled - using cafe-specific PrintNode service',
    };
  }, []);

  const testPrint = useCallback(async (): Promise<PrintResponse> => {
    console.log('Local print service is disabled - using cafe-specific PrintNode service');
    return {
      success: false,
      error: 'Local print service is disabled - using cafe-specific PrintNode service',
    };
  }, []);

  return {
    isAvailable,
    printers,
    isLoading,
    isPrinting,
    lastPrintResult,
    serviceInfo,
    printReceipt,
    testPrint,
    refreshStatus,
    checkAvailability,
  };
};