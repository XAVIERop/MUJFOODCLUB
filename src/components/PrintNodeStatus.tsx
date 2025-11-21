import React from 'react';
import { usePrintNode } from '@/hooks/usePrintNode';
import { Printer, WifiOff, Loader2, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface PrintNodeStatusProps {
  cafeId?: string;
}

const PrintNodeStatus: React.FC<PrintNodeStatusProps> = ({ cafeId }) => {
  const { 
    isAvailable, 
    isConnected, 
    printers, 
    isPrinting, 
    refreshPrinters, 
    accountInfo, 
    error,
    isConfigured
  } = usePrintNode(cafeId);

  const getStatusIcon = () => {
    if (isPrinting) return <Loader2 className="h-4 w-4 animate-spin" />;
    if (isConnected) return <CheckCircle className="h-4 w-4 text-green-500" />;
    if (isAvailable) return <Printer className="h-4 w-4 text-yellow-500" />;
    return <XCircle className="h-4 w-4 text-red-500" />;
  };

  const getStatusText = () => {
    if (isPrinting) return 'Printing...';
    if (isConnected) return 'Connected';
    if (isAvailable) return 'Available';
    return 'Offline';
  };

  const getStatusColor = () => {
    if (isPrinting) return 'bg-blue-100 text-blue-800';
    if (isConnected) return 'bg-green-100 text-green-800';
    if (isAvailable) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Printer className="h-5 w-5" />
            <CardTitle className="text-lg">PrintNode Status</CardTitle>
          </div>
          <Badge className={getStatusColor()}>
            <div className="flex items-center space-x-1">
              {getStatusIcon()}
              <span>{getStatusText()}</span>
            </div>
          </Badge>
        </div>
        <CardDescription>
          Cloud-based thermal printing service
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Account Info */}
        {accountInfo && (
          <div className="text-sm text-gray-600">
            <p><strong>Account:</strong> {accountInfo.firstname} {accountInfo.lastname}</p>
            <p><strong>Email:</strong> {accountInfo.email}</p>
          </div>
        )}

        {/* Printers List */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium">Available Printers</h4>
            <Button
              variant="outline"
              size="sm"
              onClick={refreshPrinters}
              disabled={!isAvailable || isPrinting}
            >
              <RefreshCw className="h-3 w-3 mr-1" />
              Refresh
            </Button>
          </div>
          
          {printers.length > 0 ? (
            <div className="space-y-2">
              {printers.map((printer) => (
                <div
                  key={printer.id}
                  className="flex items-center justify-between p-2 bg-gray-50 rounded-md"
                >
                  <div>
                    <p className="text-sm font-medium">{printer.name}</p>
                    <p className="text-xs text-gray-500">
                      {printer.computer.name} • {printer.state}
                    </p>
                  </div>
                  {printer.default && (
                    <Badge variant="secondary" className="text-xs">
                      Default
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4 text-gray-500">
              {isAvailable ? (
                <div>
                  <WifiOff className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No printers found</p>
                  <p className="text-xs">Install PrintNode Agent on cafe computers</p>
                </div>
              ) : (
                <div>
                  <XCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">PrintNode not configured</p>
                  <p className="text-xs">Set VITE_PRINTNODE_API_KEY</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Error Display */}
        {error && (
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Setup Instructions */}
        {!isConfigured && (
          <Alert>
            <Printer className="h-4 w-4" />
            <AlertDescription>
              <p className="font-medium mb-1">Setup Required:</p>
              <ol className="text-sm space-y-1 list-decimal list-inside">
                <li>Get PrintNode API key from printnode.com</li>
                <li>Set VITE_PRINTNODE_API_KEY in environment</li>
                <li>Install PrintNode Agent on cafe computers</li>
              </ol>
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};

export default PrintNodeStatus;
