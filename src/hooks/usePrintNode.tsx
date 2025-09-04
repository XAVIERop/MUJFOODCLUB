import { useState, useEffect } from 'react';
import { printNodeService } from '@/services/printNodeService';
import { useToast } from '@/hooks/use-toast';

export const usePrintNode = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const { toast } = useToast();

  // Initialize PrintNode service
  useEffect(() => {
    const initializePrintNode = async () => {
      try {
        const savedApiKey = localStorage.getItem('printnode_api_key');
        const savedPrinterId = localStorage.getItem('printnode_printer_id');
        
        if (savedApiKey && savedPrinterId) {
          printNodeService.setConfig(savedApiKey, savedPrinterId);
          const connected = await printNodeService.testConnection();
          setIsConnected(connected);
          
          if (connected) {
            toast({
              title: "PrintNode Connected",
              description: "PrintNode service connected successfully",
              variant: "default",
            });
          }
        }
      } catch (error) {
        console.error('PrintNode initialization error:', error);
      }
    };

    initializePrintNode();
  }, [toast]);

  // Print both receipts
  const printBothReceipts = async (orderData: any, orderItems: any[]) => {
    if (isPrinting) return;

    setIsPrinting(true);
    
    try {
      // Print KOT first
      const kotSuccess = await printNodeService.printReceipt({
        type: 'kot',
        orderData,
        orderItems
      });

      if (kotSuccess) {
        toast({
          title: "KOT Printed",
          description: "Kitchen Order Ticket sent to PrintNode",
          variant: "default",
        });
      }

      // Wait a moment then print customer receipt
      setTimeout(async () => {
        const customerSuccess = await printNodeService.printReceipt({
          type: 'customer',
          orderData,
          orderItems
        });

        if (customerSuccess) {
          toast({
            title: "Customer Receipt Printed",
            description: "Customer receipt sent to PrintNode",
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
      console.error('PrintNode print error:', error);
      toast({
        title: "Print Error",
        description: "Error printing receipts via PrintNode",
        variant: "destructive",
      });
      setIsPrinting(false);
    }
  };

  // Test connection
  const testConnection = async () => {
    try {
      const connected = await printNodeService.testConnection();
      setIsConnected(connected);
      
      if (connected) {
        toast({
          title: "Connection Test Successful",
          description: "PrintNode service is working",
          variant: "default",
        });
      } else {
        toast({
          title: "Connection Test Failed",
          description: "Could not connect to PrintNode service",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Connection test error:', error);
      toast({
        title: "Connection Test Error",
        description: "Error testing PrintNode connection",
        variant: "destructive",
      });
    }
  };

  return {
    isConnected,
    isPrinting,
    printBothReceipts,
    testConnection
  };
};
