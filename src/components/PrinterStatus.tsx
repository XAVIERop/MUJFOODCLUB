import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Printer, Wifi, WifiOff, Loader2 } from 'lucide-react';
import { useEpsonEpos } from '@/hooks/useEpsonEpos';

const PrinterStatus: React.FC = () => {
  const { isConnected, isPrinting, initialize, disconnect } = useEpsonEpos();

  const handleReconnect = async () => {
    await initialize();
  };

  const handleDisconnect = async () => {
    await disconnect();
  };

  return (
    <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg border">
      <Printer className="w-4 h-4 text-gray-600" />
      
      {isPrinting ? (
        <div className="flex items-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
          <span className="text-sm text-blue-600">Printing...</span>
        </div>
      ) : isConnected ? (
        <div className="flex items-center gap-2">
          <Wifi className="w-4 h-4 text-green-600" />
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            Epson TM-T82 Connected
          </Badge>
          <Button
            size="sm"
            variant="outline"
            onClick={handleDisconnect}
            className="h-6 px-2 text-xs"
          >
            Disconnect
          </Button>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <WifiOff className="w-4 h-4 text-red-600" />
          <Badge variant="secondary" className="bg-red-100 text-red-800">
            Printer Offline
          </Badge>
          <Button
            size="sm"
            variant="outline"
            onClick={handleReconnect}
            className="h-6 px-2 text-xs"
          >
            Connect
          </Button>
        </div>
      )}
    </div>
  );
};

export default PrinterStatus;
