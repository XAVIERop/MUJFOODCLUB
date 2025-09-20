import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Download, X, Smartphone, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

interface PWAInstallPromptProps {
  className?: string;
}

interface InstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const PWAInstallPrompt: React.FC<PWAInstallPromptProps> = ({ className }) => {
  const [deferredPrompt, setDeferredPrompt] = useState<InstallPromptEvent | null>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Check if app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches || 
        (window.navigator as any).standalone === true) {
      setIsInstalled(true);
      return;
    }
    
    // Check localStorage for dismissed state
    const dismissedState = localStorage.getItem('pwa-install-dismissed');
    if (dismissedState) {
      const dismissedTime = parseInt(dismissedState);
      const daysSinceDismissed = (Date.now() - dismissedTime) / (1000 * 60 * 60 * 24);
      
      if (daysSinceDismissed < 7) {
        setDismissed(true);
      }
    }

    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as InstallPromptEvent);
      
      // Show toast notification
      toast.info('Install MUJ Food Club', {
        description: 'Add to your home screen for quick access',
        action: {
          label: 'Install',
          onClick: () => handleInstall()
        }
      });
    };

    // Listen for app installed event
    const handleAppInstalled = () => {
      console.log('PWA was installed');
      setIsInstalled(true);
      setShowInstallPrompt(false);
      setDeferredPrompt(null);
      
      toast.success('App installed successfully!', {
        description: 'MUJ Food Club is now on your home screen'
      });
    };

    // Add event listeners
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // Show the prompt after a short delay (for better UX)
    const timer = setTimeout(() => {
      if (!isInstalled && !dismissed && window.innerWidth <= 768) {
        setShowInstallPrompt(true);
      }
    }, 2000);

    // Cleanup
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      clearTimeout(timer);
    };
  }, [isInstalled, dismissed]);

  const handleInstall = async () => {
    setIsInstalling(true);

    try {
      if (deferredPrompt) {
        // Use the native install prompt if available
        await deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        
        if (outcome === 'accepted') {
          console.log('User accepted the install prompt');
        } else {
          console.log('User dismissed the install prompt');
        }
        
        setDeferredPrompt(null);
      } else {
        // Fallback: Show instructions for manual installation
        toast.info('Manual Installation', {
          description: 'Tap the share button and select "Add to Home Screen"',
          duration: 5000
        });
      }
      
      setShowInstallPrompt(false);
      
    } catch (error) {
      console.error('Error during installation:', error);
      toast.error('Installation failed. Please try again.');
    } finally {
      setIsInstalling(false);
    }
  };

  const handleDismiss = () => {
    setShowInstallPrompt(false);
    setDismissed(true);
    
    // Store dismissal timestamp
    localStorage.setItem('pwa-install-dismissed', Date.now().toString());
  };

  // Check if PWA is installable (more reliable method)
  const isPWAInstallable = () => {
    // Check if running in standalone mode (already installed)
    if (window.matchMedia('(display-mode: standalone)').matches || 
        (window.navigator as any).standalone === true) {
      return false;
    }
    
    // Check if user has dismissed recently (7 days)
    const dismissedState = localStorage.getItem('pwa-install-dismissed');
    if (dismissedState) {
      const dismissedTime = parseInt(dismissedState);
      const daysSinceDismissed = (Date.now() - dismissedTime) / (1000 * 60 * 60 * 24);
      if (daysSinceDismissed < 7) {
        return false;
      }
    }
    
    return true;
  };

  // Don't show if PWA is not installable
  if (!isPWAInstallable()) {
    return null;
  }

  // Don't show on desktop (only mobile/tablet)
  if (window.innerWidth > 768) {
    return null;
  }

  // Show the prompt (even without beforeinstallprompt event for better UX)
  // The actual install will work if the browser supports it

  return (
    <div className={`fixed bottom-4 right-4 z-50 max-w-sm ${className}`}>
      <Card className="border-orange-200 bg-orange-50 shadow-lg">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-orange-100 text-orange-700">
                <Smartphone className="w-3 h-3 mr-1" />
                Install App
              </Badge>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDismiss}
              className="h-6 w-6 p-0 hover:bg-orange-100"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          <CardTitle className="text-lg text-orange-900">
            Install MUJ Food Club
          </CardTitle>
          <CardDescription className="text-orange-700">
            Add to your home screen for quick access and offline ordering.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex gap-2">
            <Button
              onClick={handleInstall}
              disabled={isInstalling}
              className="flex-1 bg-orange-600 hover:bg-orange-700 text-white"
              size="sm"
            >
              {isInstalling ? (
                <>
                  <Download className="w-4 h-4 mr-2 animate-pulse" />
                  Installing...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Install Now
                </>
              )}
            </Button>
            <Button
              variant="outline"
              onClick={handleDismiss}
              className="border-orange-200 text-orange-700 hover:bg-orange-100"
              size="sm"
            >
              Later
            </Button>
          </div>
          <p className="text-xs text-orange-600 mt-2">
            Quick access • Offline ordering • Push notifications
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default PWAInstallPrompt;

