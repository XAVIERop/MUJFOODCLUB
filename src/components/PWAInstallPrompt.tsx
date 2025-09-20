import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Download, X } from 'lucide-react';
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
    <div className={`fixed bottom-6 right-6 z-50 ${className}`}>
      {/* Small floating install button */}
      <Button
        onClick={handleInstall}
        disabled={isInstalling}
        className="h-12 w-12 rounded-full bg-orange-500 hover:bg-orange-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 border-0"
        size="sm"
        title="Install MUJ Food Club App"
      >
        {isInstalling ? (
          <Download className="w-5 h-5 animate-pulse" />
        ) : (
          <Download className="w-5 h-5" />
        )}
      </Button>
      
      {/* Dismiss button (small X) */}
      <Button
        variant="ghost"
        size="sm"
        onClick={handleDismiss}
        className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-gray-200 hover:bg-gray-300 text-gray-600 p-0 border-0 shadow-md"
        title="Dismiss"
      >
        <X className="w-3 h-3" />
      </Button>
    </div>
  );
};

export default PWAInstallPrompt;

