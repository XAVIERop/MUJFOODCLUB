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
      console.log('beforeinstallprompt event fired!');
      e.preventDefault();
      setDeferredPrompt(e as InstallPromptEvent);
      
      // Show toast notification with install action
      toast.info('Install MUJ Food Club', {
        description: 'Tap the floating button to install',
        action: {
          label: 'Install Now',
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
        
        // Try to trigger install prompt by simulating user engagement
        // This can help trigger the beforeinstallprompt event
        const triggerEngagement = () => {
          // Simulate user interaction to help trigger install prompt
          const fakeEvent = new Event('click');
          document.dispatchEvent(fakeEvent);
          
          // Try to focus on the install button to show engagement
          setTimeout(() => {
            const installBtn = document.querySelector('[title="Install MUJ Food Club App"]');
            if (installBtn) {
              (installBtn as HTMLElement).focus();
            }
          }, 1000);
        };
        
        // Trigger engagement after showing the button
        setTimeout(triggerEngagement, 500);
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
      // Method 1: Try native install prompt first
      if (deferredPrompt) {
        console.log('Using native install prompt');
        await deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        
        if (outcome === 'accepted') {
          console.log('User accepted the install prompt');
          toast.success('Installing app...', {
            description: 'MUJ Food Club will be added to your home screen'
          });
        } else {
          console.log('User dismissed the install prompt');
        }
        
        setDeferredPrompt(null);
        setShowInstallPrompt(false);
        return;
      }

      // Method 2: Try to trigger install programmatically
      console.log('No deferred prompt available, trying alternative methods');
      
      // Check if we can trigger install through other means
      const userAgent = navigator.userAgent.toLowerCase();
      const isIOS = /iphone|ipad|ipod/.test(userAgent);
      const isAndroid = /android/.test(userAgent);
      const isChrome = /chrome/.test(userAgent) && !/edge/.test(userAgent);
      const isSafari = /safari/.test(userAgent) && !/chrome/.test(userAgent);

      if (isIOS && isSafari) {
        // iOS Safari - Show specific instructions
        toast.info('Add to Home Screen', {
          description: 'Tap the share button (□↗) and select "Add to Home Screen"',
          duration: 8000,
          action: {
            label: 'Got it',
            onClick: () => setShowInstallPrompt(false)
          }
        });
      } else if (isAndroid && isChrome) {
        // Android Chrome - Try to trigger install banner
        toast.info('Install App', {
          description: 'Look for the install banner at the bottom of your screen, or tap the menu (⋮) and select "Install app"',
          duration: 8000,
          action: {
            label: 'Got it',
            onClick: () => setShowInstallPrompt(false)
          }
        });
      } else {
        // Generic fallback
        toast.info('Install MUJ Food Club', {
          description: 'Look for "Add to Home Screen" or "Install" option in your browser menu',
          duration: 6000,
          action: {
            label: 'Got it',
            onClick: () => setShowInstallPrompt(false)
          }
        });
      }

      // Hide the floating button after showing instructions
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

