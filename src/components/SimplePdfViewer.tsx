import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Download, FileText, ExternalLink } from 'lucide-react';
import { useToast } from '../hooks/use-toast';

interface SimplePdfViewerProps {
  cafeName: string;
  menuPdfUrl: string;
  children?: React.ReactNode;
}

const SimplePdfViewer = ({ cafeName, menuPdfUrl, children }: SimplePdfViewerProps) => {
  const { toast } = useToast();

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

  const getFileSize = () => {
    const fileName = menuPdfUrl.split('/').pop()?.toLowerCase() || '';
    if (fileName.includes('chatkara')) return '2.4 MB';
    if (fileName.includes('cookhouse')) return '1.1 MB';
    if (fileName.includes('foodcourt')) return '0.5 MB';
    if (fileName.includes('havmor')) return '0.4 MB';
    return 'Optimized';
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
      
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            {cafeName} Menu
            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
              {getFileSize()}
            </span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* PDF Preview Area */}
          <div className="border-2 border-dashed border-gray-200 rounded-lg p-8 text-center">
            <div className="space-y-4">
              <div className="w-16 h-16 mx-auto bg-blue-100 rounded-full flex items-center justify-center">
                <FileText className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {cafeName} Menu PDF
                </h3>
                <p className="text-gray-600 mb-4">
                  Optimized for fast loading ({getFileSize()})
                </p>
                <p className="text-sm text-gray-500">
                  Click below to view the menu in a new tab for the best experience
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button 
              onClick={handleOpenInNewTab}
              className="flex-1 flex items-center justify-center gap-2"
            >
              <ExternalLink className="w-4 h-4" />
              Open PDF in New Tab
            </Button>
            <Button 
              variant="outline"
              onClick={handleDownload}
              className="flex-1 flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              Download PDF
            </Button>
          </div>

          {/* Additional Info */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">About this menu:</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• File size: {getFileSize()} (optimized for fast loading)</li>
              <li>• Format: PDF (works on all devices)</li>
              <li>• Viewing: Opens in new tab for best experience</li>
              <li>• Download: Save to device for offline viewing</li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SimplePdfViewer;
