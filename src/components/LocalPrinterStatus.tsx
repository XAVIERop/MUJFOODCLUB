import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Printer, 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  TestTube
} from 'lucide-react';
// import { useLocalPrint } from '@/hooks/useLocalPrint'; // Disabled - using cafe-specific PrintNode service
import { useToast } from '@/hooks/use-toast';

interface LocalPrinterStatusProps {
  className?: string;
}

export const LocalPrinterStatus: React.FC<LocalPrinterStatusProps> = ({ className }) => {
  // const { 
  //   isAvailable, 
  //   printers, 
  //   isLoading, 
  //   isPrinting, 
  //   lastPrintResult, 
  //   serviceInfo,
  //   testPrint,
  //   refreshStatus 
  // } = useLocalPrint(); // Disabled - using cafe-specific PrintNode service
  
  // Mock values since local print service is disabled
  const isAvailable = false;
  const printers: any[] = [];
  const isLoading = false;
  const isPrinting = false;
  const lastPrintResult = null;
  const serviceInfo = null;
  const testPrint = () => Promise.resolve({ success: false, error: 'Local print service disabled' });
  const refreshStatus = () => Promise.resolve();
  
  const { toast } = useToast();

  const handleTestPrint = async () => {
    const result = await testPrint();
    
    if (result.success) {
      toast({
        title: "Test Print Successful",
        description: "Test receipt sent to printer successfully",
      });
    } else {
      toast({
        title: "Test Print Failed",
        description: result.error || "Could not send test print",
        variant: "destructive",
      });
    }
  };

  const handleRefresh = async () => {
    await refreshStatus();
    toast({
      title: "Status Refreshed",
      description: "Local print service status updated",
    });
  };

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Printer className="w-5 h-5" />
            Local Print Service
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isLoading}
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleTestPrint}
              disabled={!isAvailable || isPrinting}
            >
              <TestTube className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Service Status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isAvailable ? (
              <Wifi className="w-4 h-4 text-green-500" />
            ) : (
              <WifiOff className="w-4 h-4 text-red-500" />
            )}
            <span className="font-medium">Service Status</span>
          </div>
          <Badge variant={isAvailable ? "default" : "destructive"}>
            {isAvailable ? "Connected" : "Disconnected"}
          </Badge>
        </div>

        {/* Service Info */}
        {isAvailable && serviceInfo && (
          <div className="text-sm text-muted-foreground">
            <div>Version: {serviceInfo.version}</div>
            <div>Service: {serviceInfo.service}</div>
          </div>
        )}

        <Separator />

        {/* Available Printers */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Printer className="w-4 h-4" />
            <span className="font-medium">Available Printers</span>
            <Badge variant="outline">{printers.length}</Badge>
          </div>
          
          {printers.length > 0 ? (
            <div className="space-y-2">
              {printers.map((printer) => (
                <div
                  key={printer.id}
                  className="flex items-center justify-between p-2 bg-muted/30 rounded border"
                >
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <div>
                      <div className="font-medium text-sm">{printer.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {printer.type} • {printer.connection}
                      </div>
                    </div>
                  </div>
                  {printer.isDefault && (
                    <Badge variant="secondary" className="text-xs">
                      Default
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center gap-2 p-2 bg-muted/30 rounded border">
              <XCircle className="w-4 h-4 text-red-500" />
              <span className="text-sm text-muted-foreground">
                No printers detected
              </span>
            </div>
          )}
        </div>

        {/* Last Print Result */}
        {lastPrintResult && (
          <>
            <Separator />
            <div>
              <div className="flex items-center gap-2 mb-2">
                {lastPrintResult.success ? (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-red-500" />
                )}
                <span className="font-medium">Last Print Result</span>
              </div>
              <div className="text-sm">
                {lastPrintResult.success ? (
                  <div className="text-green-600">
                    ✅ {lastPrintResult.message || "Print successful"}
                    {lastPrintResult.printer && (
                      <div className="text-xs text-muted-foreground mt-1">
                        Printer: {lastPrintResult.printer}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-red-600">
                    ❌ {lastPrintResult.error || "Print failed"}
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* Instructions */}
        {!isAvailable && (
          <>
            <Separator />
            <div className="text-sm text-muted-foreground">
              <div className="font-medium mb-2">To enable local printing:</div>
              <ol className="list-decimal list-inside space-y-1 text-xs">
                <li>Install MUJFOODCLUB Print Service on this computer</li>
                <li>Start the print service</li>
                <li>Ensure thermal printer is connected</li>
                <li>Refresh this status</li>
              </ol>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};
