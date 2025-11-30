import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings, Wifi, Usb, CheckCircle, XCircle } from 'lucide-react';
import { usePrinter } from '@/hooks/usePrinter';
import { useToast } from '@/hooks/use-toast';

const SimplePrinterConfig: React.FC = () => {
  const { isConnected, connectionType, switchConnectionType, testConnection } = usePrinter();
  const { toast } = useToast();
  
  console.log('SimplePrinterConfig rendering, isConnected:', isConnected, 'connectionType:', connectionType);

  const handleConnectionTypeChange = (type: 'usb' | 'network') => {
    switchConnectionType(type);
    toast({
      title: "Connection Type Changed",
      description: `Switched to ${type.toUpperCase()} connection`,
      variant: "default",
    });
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Settings className="w-5 h-5 mr-2" />
          Printer Configuration
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Connection Type Selection */}
        <div>
          <label className="text-sm font-medium mb-2 block">Connection Type</label>
          <div className="flex space-x-2">
            <Button
              variant={connectionType === 'usb' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleConnectionTypeChange('usb')}
              className="flex items-center"
            >
              <Usb className="w-4 h-4 mr-1" />
              USB (Wired)
            </Button>
            <Button
              variant={connectionType === 'network' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleConnectionTypeChange('network')}
              className="flex items-center"
            >
              <Wifi className="w-4 h-4 mr-1" />
              Network
            </Button>
          </div>
        </div>

        {/* Connection Status */}
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium">Status:</span>
          {isConnected ? (
            <div className="flex items-center text-green-600">
              <CheckCircle className="w-4 h-4 mr-1" />
              <span className="text-sm">Connected via {connectionType.toUpperCase()}</span>
            </div>
          ) : (
            <div className="flex items-center text-yellow-600">
              <XCircle className="w-4 h-4 mr-1" />
              <span className="text-sm">
                {connectionType === 'usb' 
                  ? 'Browser Printing Available' 
                  : 'Not Connected'}
              </span>
            </div>
          )}
        </div>

        {/* Test Connection Button */}
        <Button
          onClick={testConnection}
          variant="outline"
          size="sm"
          className="w-full"
        >
          Test Connection
        </Button>

        {/* Help Text */}
        <div className="text-xs text-gray-600 space-y-1">
          <p><strong>USB (Wired):</strong> Uses browser printing. Click "Test Connection" to verify your printer works. Physical connection cannot be automatically detected.</p>
          <p><strong>Network:</strong> Your printer is connected via WiFi/Ethernet. You'll need the IP address.</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default SimplePrinterConfig;
