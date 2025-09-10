import { useState } from 'react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Download, FileText, ExternalLink, Loader2 } from 'lucide-react';
import { useToast } from '../hooks/use-toast';

interface DirectPdfViewerProps {
  cafeName: string;
  menuPdfUrl: string;
  children?: React.ReactNode;
}

const DirectPdfViewer = ({ cafeName, menuPdfUrl, children }: DirectPdfViewerProps) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);

  const getFileSize = () => {
    const fileName = menuPdfUrl.split('/').pop()?.toLowerCase() || '';
    if (fileName.includes('chatkara')) return '2.4 MB';
    if (fileName.includes('cookhouse')) return '1.1 MB';
    if (fileName.includes('foodcourt')) return '0.5 MB';
    if (fileName.includes('havmor')) return '0.4 MB';
    return 'Optimized';
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = menuPdfUrl;
    link.download = `${cafeName}_Menu.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Download Started",
      description: `${cafeName} menu is being downloaded`,
    });
  };

  const handleOpenInNewTab = () => {
    window.open(menuPdfUrl, '_blank');
  };

  const handleLoad = () => {
    setIsLoading(false);
    setHasError(false);
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
    toast({
      title: "Error",
      description: "Failed to load PDF menu. Please try downloading instead.",
      variant: "destructive"
    });
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        {children || (
          <Button variant="outline" size="sm" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            View Menu
          </Button>
        )}
      </DialogTrigger>
      
      <DialogContent className="max-w-6xl max-h-[90vh] p-0">
        <DialogHeader className="p-6 pb-4 border-b">
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            {cafeName} Menu
            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
              {getFileSize()}
            </span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 overflow-hidden">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-96">
              <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
              <p className="text-muted-foreground">Loading PDF menu...</p>
            </div>
          ) : hasError ? (
            <div className="flex flex-col items-center justify-center h-96 p-6">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto bg-red-100 rounded-full flex items-center justify-center mb-4">
                  <FileText className="w-8 h-8 text-red-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Unable to load PDF
                </h3>
                <p className="text-gray-600 mb-6">
                  The PDF menu couldn't be loaded. You can still download it or open it in a new tab.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button onClick={handleOpenInNewTab} className="flex items-center gap-2">
                    <ExternalLink className="w-4 h-4" />
                    Open in New Tab
                  </Button>
                  <Button variant="outline" onClick={handleDownload} className="flex items-center gap-2">
                    <Download className="w-4 h-4" />
                    Download PDF
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-[70vh] w-full">
              <object
                data={menuPdfUrl}
                type="application/pdf"
                className="w-full h-full border-0"
                onLoad={handleLoad}
                onError={handleError}
              >
                <div className="flex flex-col items-center justify-center h-full p-6">
                  <div className="text-center">
                    <div className="w-16 h-16 mx-auto bg-blue-100 rounded-full flex items-center justify-center mb-4">
                      <FileText className="w-8 h-8 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {cafeName} Menu PDF
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Optimized for fast loading ({getFileSize()})
                    </p>
                    <p className="text-sm text-gray-500 mb-6">
                      Your browser doesn't support PDF viewing. Choose an option below:
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <Button onClick={handleOpenInNewTab} className="flex items-center gap-2">
                        <ExternalLink className="w-4 h-4" />
                        Open in New Tab
                      </Button>
                      <Button variant="outline" onClick={handleDownload} className="flex items-center gap-2">
                        <Download className="w-4 h-4" />
                        Download PDF
                      </Button>
                    </div>
                  </div>
                </div>
              </object>
            </div>
          )}
        </div>
        
        <div className="p-4 border-t bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              <p>File size: {getFileSize()} • Format: PDF • Optimized for web</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleOpenInNewTab}>
                <ExternalLink className="w-4 h-4 mr-1" />
                New Tab
              </Button>
              <Button variant="outline" size="sm" onClick={handleDownload}>
                <Download className="w-4 h-4 mr-1" />
                Download
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DirectPdfViewer;
