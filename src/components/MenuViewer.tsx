import { useState } from 'react';
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
  const [viewMode, setViewMode] = useState<'google' | 'direct' | 'mozilla'>('google');
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
        return fullUrl;
    }
  };

  const handleViewModeChange = (mode: 'google' | 'direct' | 'mozilla') => {
    setViewMode(mode);
    setHasError(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
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
                  <div className="text-6xl font-bold text-muted-foreground mb-4">404</div>
                  <h3 className="text-xl font-semibold mb-2">Oops! Page not found</h3>
                  <p className="text-muted-foreground mb-4">
                    Unable to load the PDF menu. This might be due to browser restrictions.
                  </p>
                  <Button
                    onClick={handleDownload}
                    className="flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Download PDF Instead
                  </Button>
                </div>
              </div>
            ) : (
              <iframe
                src={getViewerUrl()}
                className="w-full h-full border-0"
                title={`${cafeName} Menu`}
                onError={() => setHasError(true)}
                onLoad={() => setHasError(false)}
              />
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
