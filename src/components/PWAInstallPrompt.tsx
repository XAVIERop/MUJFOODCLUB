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
    const checkIfInstalled = () => {
      // Check if running in standalone mode (installed)
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
        
        // Show again after 7 days
        if (daysSinceDismissed < 7) {
          setDismissed(true);
        }
      }
    };

    checkIfInstalled();

    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      
      // Stash the event so it can be triggered later
      setDeferredPrompt(e as InstallPromptEvent);
      
      // Show our custom install prompt
      if (!isInstalled && !dismissed) {
        setShowInstallPrompt(true);
        
        toast.info('Install MUJ Food Club', {
          description: 'Add to your home screen for quick access',
          action: {
            label: 'Install',
            onClick: () => handleInstall()
          }
        });
      }
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

    // Cleanup
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [isInstalled, dismissed]);

  const handleInstall = async () => {
    if (!deferredPrompt) {
      return;
    }

    setIsInstalling(true);

    try {
      // Show the install prompt
      await deferredPrompt.prompt();
      
      // Wait for the user to respond to the prompt
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        console.log('User accepted the install prompt');
      } else {
        console.log('User dismissed the install prompt');
      }
      
      // Clear the deferredPrompt
      setDeferredPrompt(null);
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

  // DEBUG MODE: Always show for testing
  const DEBUG_MODE = true;
  
  if (DEBUG_MODE) {
    console.log('PWA Install Debug:', {
      isInstalled,
      dismissed,
      showInstallPrompt,
      hasDeferredPrompt: !!deferredPrompt,
      windowWidth: window.innerWidth,
      userAgent: navigator.userAgent
    });
  }

  // Don't show if already installed, dismissed, or no prompt available (unless debug mode)
  if (!DEBUG_MODE && (isInstalled || dismissed || !showInstallPrompt || !deferredPrompt)) {
    return null;
  }

  // Don't show on desktop (only mobile/tablet) unless debug mode
  if (!DEBUG_MODE && window.innerWidth > 768) {
    return null;
  }

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
            Install MUJ Food Club {DEBUG_MODE && "(DEBUG MODE)"}
          </CardTitle>
          <CardDescription className="text-orange-700">
            Add to your home screen for quick access and offline ordering.
            {DEBUG_MODE && (
              <div className="mt-2 text-xs text-orange-600">
                Debug: {deferredPrompt ? 'Prompt Available' : 'No Prompt'} | 
                Width: {window.innerWidth}px
              </div>
            )}
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

