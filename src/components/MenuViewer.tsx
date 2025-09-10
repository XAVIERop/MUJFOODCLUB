import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Download, Share2, X, FileText, Eye } from 'lucide-react';
import { useToast } from '../hooks/use-toast';

interface MenuViewerProps {
  cafeName: string;
  menuPdfUrl: string;
  children?: React.ReactNode;
}

const MenuViewer = ({ cafeName, menuPdfUrl, children }: MenuViewerProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [viewMode, setViewMode] = useState<'google' | 'direct' | 'mozilla'>('direct'); // Start with direct mode
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Initialize state based on view mode
  useEffect(() => {
    if (viewMode === 'direct') {
      setIsLoading(false);
      setHasError(false);
    }
  }, [viewMode]);

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

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${cafeName} Menu`,
          text: `Check out ${cafeName}'s menu`,
          url: window.location.origin + menuPdfUrl,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.origin + menuPdfUrl);
      toast({
        title: "Link Copied",
        description: "Menu link copied to clipboard",
      });
    }
  };

  const getViewerUrl = () => {
    const fullUrl = window.location.origin + menuPdfUrl;
    switch (viewMode) {
      case 'google':
        return `https://docs.google.com/gview?url=${encodeURIComponent(fullUrl)}&embedded=true`;
      case 'mozilla':
        return `https://mozilla.github.io/pdf.js/web/viewer.html?file=${encodeURIComponent(fullUrl)}`;
      case 'direct':
      default:
        // For direct viewing, we'll use a data URL approach or open in new tab
        return fullUrl;
    }
  };

  const getFileSize = () => {
    // This would ideally be fetched from the server or calculated
    // For now, we'll estimate based on common compressed sizes
    const fileName = menuPdfUrl.split('/').pop()?.toLowerCase() || '';
    if (fileName.includes('chatkara')) return '2.4 MB';
    if (fileName.includes('cookhouse')) return '1.1 MB';
    if (fileName.includes('foodcourt')) return '0.5 MB';
    if (fileName.includes('havmor')) return '0.4 MB';
    return 'Optimized';
  };

  const handleViewModeChange = (mode: 'google' | 'direct' | 'mozilla') => {
    setViewMode(mode);
    setHasError(false);
    setIsLoading(true);
    
    // For direct mode, don't show loading since we're not using iframe
    if (mode === 'direct') {
      setIsLoading(false);
      return;
    }
    
    // Set a timeout to detect if iframe fails to load
    setTimeout(() => {
      if (isLoading) {
        console.warn('Iframe loading timeout, showing error');
        setHasError(true);
        setIsLoading(false);
      }
    }, 10000); // 10 second timeout
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      setIsOpen(open);
      if (open) {
        setHasError(false);
        // For direct mode, don't show loading
        if (viewMode === 'direct') {
          setIsLoading(false);
        } else {
          setIsLoading(true);
        }
      }
    }}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="outline" size="sm" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            View Menu
          </Button>
        )}
      </DialogTrigger>
      
      <DialogContent className="max-w-4xl max-h-[90vh] p-0">
        <DialogHeader className="p-6 pb-4 border-b">
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5" />
              {cafeName} Menu
              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full ml-2">
                {getFileSize()}
              </span>
            </DialogTitle>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 mr-2">
                <Button
                  variant={viewMode === 'google' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleViewModeChange('google')}
                  className="text-xs px-2"
                >
                  Google
                </Button>
                <Button
                  variant={viewMode === 'mozilla' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleViewModeChange('mozilla')}
                  className="text-xs px-2"
                >
                  PDF.js
                </Button>
                <Button
                  variant={viewMode === 'direct' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleViewModeChange('direct')}
                  className="text-xs px-2"
                >
                  Direct
                </Button>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownload}
                className="flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Download
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleShare}
                className="flex items-center gap-2"
              >
                <Share2 className="w-4 h-4" />
                Share
              </Button>
            </div>
          </div>
        </DialogHeader>
        
        <div className="flex-1 overflow-hidden">
          <div className="h-[70vh] w-full">
            {hasError ? (
              <div className="flex flex-col items-center justify-center h-full bg-muted/50">
                <div className="text-center">
                  <div className="text-6xl font-bold text-muted-foreground mb-4">⚠️</div>
                  <h3 className="text-xl font-semibold mb-2">Unable to load PDF viewer</h3>
                  <p className="text-muted-foreground mb-4">
                    The PDF menu couldn't be displayed in the viewer. This might be due to browser restrictions or network issues.
                  </p>
                  <div className="space-y-2">
                    <Button
                      onClick={() => window.open(getViewerUrl(), '_blank')}
                      className="flex items-center gap-2 w-full"
                    >
                      <FileText className="w-4 h-4" />
                      Open PDF in New Tab
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleDownload}
                      className="flex items-center gap-2 w-full"
                    >
                      <Download className="w-4 h-4" />
                      Download PDF
                    </Button>
                  </div>
                </div>
              </div>
            ) : isLoading ? (
              <div className="flex flex-col items-center justify-center h-full bg-muted/50">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                  <h3 className="text-xl font-semibold mb-2">Loading Menu...</h3>
                  <p className="text-muted-foreground mb-2">
                    Optimized for fast loading ({getFileSize()})
                  </p>
                  <div className="w-64 bg-gray-200 rounded-full h-2">
                    <div className="bg-primary h-2 rounded-full animate-pulse" style={{width: '60%'}}></div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="w-full h-full">
                {viewMode === 'direct' ? (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-muted/50">
                    <div className="text-center mb-4">
                      <h3 className="text-lg font-semibold mb-2">PDF Menu ({getFileSize()})</h3>
                      <p className="text-muted-foreground mb-4">
                        Click below to open the PDF in a new tab for best viewing experience
                      </p>
                      <div className="space-y-2">
                        <Button 
                          onClick={() => window.open(getViewerUrl(), '_blank')}
                          className="w-full"
                        >
                          <FileText className="w-4 h-4 mr-2" />
                          Open PDF in New Tab
                        </Button>
                        <Button 
                          variant="outline"
                          onClick={handleDownload}
                          className="w-full"
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Download PDF
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <iframe
                    src={getViewerUrl()}
                    className="w-full h-full border-0"
                    title={`${cafeName} Menu`}
                    onError={() => {
                      console.error('Iframe failed to load:', getViewerUrl());
                      setHasError(true);
                    }}
                    onLoad={() => {
                      console.log('Iframe loaded successfully:', getViewerUrl());
                      setHasError(false);
                      setIsLoading(false);
                    }}
                    sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
                    allow="fullscreen"
                  />
                )}
              </div>
            )}
          </div>
        </div>
        
        <div className="p-4 border-t bg-muted/50">
          <p className="text-sm text-muted-foreground text-center">
            Having trouble viewing the menu? 
            <Button
              variant="link"
              size="sm"
              onClick={handleDownload}
              className="p-0 h-auto ml-1"
            >
              Download the PDF
            </Button>
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MenuViewer;
