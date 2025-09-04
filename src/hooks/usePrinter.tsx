import { useState, useEffect } from 'react';
import { printerService } from '@/services/printerService';
import { useToast } from '@/hooks/use-toast';

export const usePrinter = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const [connectionType, setConnectionType] = useState<'usb' | 'network'>('usb');
  const { toast } = useToast();

  // Initialize printer service
  useEffect(() => {
    const initializePrinter = async () => {
      try {
        const connected = await printerService.initialize();
        setIsConnected(connected);
        
        if (connected) {
          toast({
            title: "Printer Connected",
            description: `Connected via ${connectionType.toUpperCase()}`,
            variant: "default",
          });
        } else {
          toast({
            title: "Printer Connection Failed",
            description: "Could not connect to printer. Using browser printing as fallback.",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error('Printer initialization error:', error);
        toast({
          title: "Printer Error",
          description: "Error initializing printer. Using browser printing as fallback.",
          variant: "destructive",
        });
      }
    };

    initializePrinter();
  }, [connectionType, toast]);

  // Print both receipts
  const printBothReceipts = async (orderData: any, orderItems: any[]) => {
    if (isPrinting) return;

    setIsPrinting(true);
    
    try {
      // Print KOT first
      const kotSuccess = await printerService.printReceipt({
        type: 'kot',
        orderData,
        orderItems
      });

      if (kotSuccess) {
        toast({
          title: "KOT Printed",
          description: "Kitchen Order Ticket printed successfully",
          variant: "default",
        });
      }

      // Wait a moment then print customer receipt
      setTimeout(async () => {
        const customerSuccess = await printerService.printReceipt({
          type: 'customer',
          orderData,
          orderItems
        });

        if (customerSuccess) {
          toast({
            title: "Customer Receipt Printed",
            description: "Customer receipt printed successfully",
            variant: "default",
          });
        } else {
          toast({
            title: "Print Failed",
            description: "Could not print customer receipt",
            variant: "destructive",
          });
        }
        
        setIsPrinting(false);
      }, 1000);

    } catch (error) {
      console.error('Print error:', error);
      toast({
        title: "Print Error",
        description: "Error printing receipts",
        variant: "destructive",
      });
      setIsPrinting(false);
    }
  };

  // Switch connection type
  const switchConnectionType = (type: 'usb' | 'network') => {
    setConnectionType(type);
    setIsConnected(false);
  };

  // Test connection
  const testConnection = async () => {
    try {
      const connected = await printerService.initialize();
      setIsConnected(connected);
      
      if (connected) {
        toast({
          title: "Connection Test Successful",
          description: `Printer connected via ${connectionType.toUpperCase()}`,
          variant: "default",
        });
      } else {
        toast({
          title: "Connection Test Failed",
          description: "Could not connect to printer",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Connection test error:', error);
      toast({
        title: "Connection Test Error",
        description: "Error testing printer connection",
        variant: "destructive",
      });
    }
  };

  return {
    isConnected,
    isPrinting,
    connectionType,
    printBothReceipts,
    switchConnectionType,
    testConnection
  };
};
