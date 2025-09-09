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
            <iframe
              src={menuPdfUrl}
              className="w-full h-full border-0"
              title={`${cafeName} Menu`}
            />
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
