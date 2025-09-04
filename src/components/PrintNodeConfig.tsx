import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings, CheckCircle, XCircle, ExternalLink } from 'lucide-react';
import { printNodeService } from '@/services/printNodeService';
import { useToast } from '@/hooks/use-toast';

const PrintNodeConfig: React.FC = () => {
  const [apiKey, setApiKey] = useState('');
  const [printerId, setPrinterId] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const { toast } = useToast();

  // Load saved config
  React.useEffect(() => {
    const savedApiKey = localStorage.getItem('printnode_api_key');
    const savedPrinterId = localStorage.getItem('printnode_printer_id');
    
    if (savedApiKey) setApiKey(savedApiKey);
    if (savedPrinterId) setPrinterId(savedPrinterId);
  }, []);

  const handleTestConnection = async () => {
    if (!apiKey || !printerId) {
      toast({
        title: "Missing Configuration",
        description: "Please enter both API Key and Printer ID",
        variant: "destructive",
      });
      return;
    }

    setIsTesting(true);
    
    try {
      printNodeService.setConfig(apiKey, printerId);
      const connected = await printNodeService.testConnection();
      setIsConnected(connected);
      
      if (connected) {
        toast({
          title: "Connection Successful",
          description: "PrintNode service connected successfully",
          variant: "default",
        });
      } else {
        toast({
          title: "Connection Failed",
          description: "Could not connect to PrintNode service",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Connection test error:', error);
      toast({
        title: "Connection Error",
        description: "Error testing PrintNode connection",
        variant: "destructive",
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSaveConfig = () => {
    if (!apiKey || !printerId) {
      toast({
        title: "Missing Configuration",
        description: "Please enter both API Key and Printer ID",
        variant: "destructive",
      });
      return;
    }

    localStorage.setItem('printnode_api_key', apiKey);
    localStorage.setItem('printnode_printer_id', printerId);
    
    printNodeService.setConfig(apiKey, printerId);
    
    toast({
      title: "Configuration Saved",
      description: "PrintNode configuration saved successfully",
      variant: "default",
    });
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Settings className="w-5 h-5 mr-2" />
          PrintNode Service Configuration
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* API Key */}
        <div>
          <Label htmlFor="apiKey">PrintNode API Key</Label>
          <Input
            id="apiKey"
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="Enter your PrintNode API key"
            className="mt-1"
          />
        </div>

        {/* Printer ID */}
        <div>
          <Label htmlFor="printerId">Printer ID</Label>
          <Input
            id="printerId"
            value={printerId}
            onChange={(e) => setPrinterId(e.target.value)}
            placeholder="Enter your printer ID"
            className="mt-1"
          />
        </div>

        {/* Connection Status */}
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium">Status:</span>
          {isConnected ? (
            <div className="flex items-center text-green-600">
              <CheckCircle className="w-4 h-4 mr-1" />
              <span className="text-sm">Connected to PrintNode</span>
            </div>
          ) : (
            <div className="flex items-center text-red-600">
              <XCircle className="w-4 h-4 mr-1" />
              <span className="text-sm">Not Connected</span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-2">
          <Button
            onClick={handleTestConnection}
            disabled={isTesting || !apiKey || !printerId}
            variant="outline"
            size="sm"
            className="flex-1"
          >
            {isTesting ? 'Testing...' : 'Test Connection'}
          </Button>
          <Button
            onClick={handleSaveConfig}
            disabled={!apiKey || !printerId}
            size="sm"
            className="flex-1"
          >
            Save Config
          </Button>
        </div>

        {/* Help Text */}
        <div className="text-xs text-gray-600 space-y-2">
          <p><strong>PrintNode Setup:</strong></p>
          <ol className="list-decimal list-inside space-y-1 ml-2">
            <li>Sign up at <a href="https://www.printnode.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">printnode.com</a></li>
            <li>Download and install PrintNode client on your computer</li>
            <li>Connect your Epson TM-T82 printer</li>
            <li>Get your API key from PrintNode dashboard</li>
            <li>Find your printer ID in the PrintNode client</li>
          </ol>
          <p className="text-green-600 font-medium">✅ Handles thermal printer page sizing automatically</p>
          <p className="text-green-600 font-medium">✅ No browser printing issues</p>
          <p className="text-green-600 font-medium">✅ Professional thermal receipt output</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default PrintNodeConfig;
