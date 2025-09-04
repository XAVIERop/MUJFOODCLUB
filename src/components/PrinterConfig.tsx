import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings, Wifi, CheckCircle, XCircle } from 'lucide-react';
import { epsonEposService } from '@/services/epsonEposService';
import { useToast } from '@/hooks/use-toast';

const PrinterConfig: React.FC = () => {
  const [printerIP, setPrinterIP] = useState('192.168.1.100');
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<'success' | 'error' | null>(null);
  const { toast } = useToast();

  const testConnection = async () => {
    setIsTesting(true);
    setTestResult(null);
    
    try {
      // Test connection to the specified IP
      const response = await fetch(`http://${printerIP}:8008/api/status`, {
        method: 'GET',
        timeout: 5000
      });
      
      if (response.ok) {
        setTestResult('success');
        toast({
          title: "Connection Successful",
          description: `Epson TM-T82 found at ${printerIP}`,
        });
      } else {
        setTestResult('error');
        toast({
          title: "Connection Failed",
          description: `Printer not found at ${printerIP}`,
          variant: "destructive",
        });
      }
    } catch (error) {
      setTestResult('error');
      toast({
        title: "Connection Failed",
        description: `Cannot connect to ${printerIP}. Check IP address and network.`,
        variant: "destructive",
      });
    } finally {
      setIsTesting(false);
    }
  };

  const saveConfiguration = () => {
    // Update the service configuration
    (epsonEposService as any).config.printerIP = printerIP;
    
    toast({
      title: "Configuration Saved",
      description: `Printer IP updated to ${printerIP}`,
    });
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="w-5 h-5" />
          Printer Configuration
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="printer-ip">Printer IP Address</Label>
          <Input
            id="printer-ip"
            type="text"
            placeholder="192.168.1.100"
            value={printerIP}
            onChange={(e) => setPrinterIP(e.target.value)}
          />
          <p className="text-sm text-gray-600">
            Find your printer's IP in the printer settings or network configuration.
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button
            onClick={testConnection}
            disabled={isTesting}
            variant="outline"
            className="flex-1"
          >
            {isTesting ? (
              <Wifi className="w-4 h-4 animate-pulse" />
            ) : testResult === 'success' ? (
              <CheckCircle className="w-4 h-4 text-green-600" />
            ) : testResult === 'error' ? (
              <XCircle className="w-4 h-4 text-red-600" />
            ) : (
              <Wifi className="w-4 h-4" />
            )}
            {isTesting ? 'Testing...' : 'Test Connection'}
          </Button>
          
          <Button
            onClick={saveConfiguration}
            disabled={testResult !== 'success'}
            className="flex-1"
          >
            Save Config
          </Button>
        </div>
        
        {testResult === 'success' && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-800">
              ✅ Printer found and ready to use!
            </p>
          </div>
        )}
        
        {testResult === 'error' && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800">
              ❌ Cannot connect to printer. Please check:
            </p>
            <ul className="text-sm text-red-700 mt-2 list-disc list-inside">
              <li>Printer is powered on</li>
              <li>Printer is connected to network</li>
              <li>IP address is correct</li>
              <li>ePOS-Print is enabled on printer</li>
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PrinterConfig;
