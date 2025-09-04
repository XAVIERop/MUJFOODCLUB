import { useState, useEffect, useCallback } from 'react';
import { epsonEposService } from '@/services/epsonEposService';
import { useToast } from '@/hooks/use-toast';

interface UseEpsonEposReturn {
  isConnected: boolean;
  isPrinting: boolean;
  printKOT: (orderData: any, orderItems: any[]) => Promise<boolean>;
  printCustomerReceipt: (orderData: any, orderItems: any[]) => Promise<boolean>;
  printBothReceipts: (orderData: any, orderItems: any[]) => Promise<boolean>;
  initialize: () => Promise<boolean>;
  disconnect: () => Promise<void>;
}

export const useEpsonEpos = (): UseEpsonEposReturn => {
  const [isConnected, setIsConnected] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const { toast } = useToast();

  // Initialize connection on mount
  useEffect(() => {
    initialize();
  }, []);

  const initialize = useCallback(async (): Promise<boolean> => {
    try {
      const success = await epsonEposService.initialize();
      setIsConnected(success);
      
      if (success) {
        toast({
          title: "Printer Connected",
          description: "Epson TM-T82 thermal printer is ready",
        });
      } else {
        toast({
          title: "Printer Connection Failed",
          description: "Could not connect to Epson TM-T82 printer",
          variant: "destructive",
        });
      }
      
      return success;
    } catch (error) {
      console.error('Failed to initialize ePOS service:', error);
      setIsConnected(false);
      toast({
        title: "Printer Error",
        description: "Failed to initialize printer service",
        variant: "destructive",
      });
      return false;
    }
  }, [toast]);

  const printKOT = useCallback(async (orderData: any, orderItems: any[]): Promise<boolean> => {
    if (!isConnected) {
      toast({
        title: "Printer Not Connected",
        description: "Please connect to the printer first",
        variant: "destructive",
      });
      return false;
    }

    setIsPrinting(true);
    try {
      const success = await epsonEposService.printKOT(orderData, orderItems);
      
      if (success) {
        toast({
          title: "KOT Printed",
          description: `Kitchen Order Ticket for order #${orderData.order_number} printed successfully`,
        });
      } else {
        toast({
          title: "Print Failed",
          description: "Failed to print KOT",
          variant: "destructive",
        });
      }
      
      return success;
    } catch (error) {
      console.error('Failed to print KOT:', error);
      toast({
        title: "Print Error",
        description: "An error occurred while printing KOT",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsPrinting(false);
    }
  }, [isConnected, toast]);

  const printCustomerReceipt = useCallback(async (orderData: any, orderItems: any[]): Promise<boolean> => {
    if (!isConnected) {
      toast({
        title: "Printer Not Connected",
        description: "Please connect to the printer first",
        variant: "destructive",
      });
      return false;
    }

    setIsPrinting(true);
    try {
      const success = await epsonEposService.printCustomerReceipt(orderData, orderItems);
      
      if (success) {
        toast({
          title: "Receipt Printed",
          description: `Customer receipt for order #${orderData.order_number} printed successfully`,
        });
      } else {
        toast({
          title: "Print Failed",
          description: "Failed to print customer receipt",
          variant: "destructive",
        });
      }
      
      return success;
    } catch (error) {
      console.error('Failed to print customer receipt:', error);
      toast({
        title: "Print Error",
        description: "An error occurred while printing customer receipt",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsPrinting(false);
    }
  }, [isConnected, toast]);

  const printBothReceipts = useCallback(async (orderData: any, orderItems: any[]): Promise<boolean> => {
    if (!isConnected) {
      toast({
        title: "Printer Not Connected",
        description: "Please connect to the printer first",
        variant: "destructive",
      });
      return false;
    }

    setIsPrinting(true);
    try {
      const success = await epsonEposService.printBothReceipts(orderData, orderItems);
      
      if (success) {
        toast({
          title: "Receipts Printed",
          description: `Both receipts for order #${orderData.order_number} printed successfully`,
        });
      } else {
        toast({
          title: "Print Failed",
          description: "Failed to print receipts",
          variant: "destructive",
        });
      }
      
      return success;
    } catch (error) {
      console.error('Failed to print both receipts:', error);
      toast({
        title: "Print Error",
        description: "An error occurred while printing receipts",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsPrinting(false);
    }
  }, [isConnected, toast]);

  const disconnect = useCallback(async (): Promise<void> => {
    try {
      await epsonEposService.disconnect();
      setIsConnected(false);
      toast({
        title: "Printer Disconnected",
        description: "Disconnected from Epson TM-T82 printer",
      });
    } catch (error) {
      console.error('Failed to disconnect from printer:', error);
      toast({
        title: "Disconnect Error",
        description: "Failed to disconnect from printer",
        variant: "destructive",
      });
    }
  }, [toast]);

  return {
    isConnected,
    isPrinting,
    printKOT,
    printCustomerReceipt,
    printBothReceipts,
    initialize,
    disconnect,
  };
};
