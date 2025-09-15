import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, Download, X, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

interface PWAUpdateManagerProps {
  className?: string;
}

interface UpdateInfo {
  available: boolean;
  version?: string;
  message?: string;
}

const PWAUpdateManager: React.FC<PWAUpdateManagerProps> = ({ className }) => {
  const [updateInfo, setUpdateInfo] = useState<UpdateInfo>({ available: false });
  const [isUpdating, setIsUpdating] = useState(false);
  const [currentVersion, setCurrentVersion] = useState<string>('1.0.0');
  const [newVersion, setNewVersion] = useState<string>('');
  const [showUpdateBanner, setShowUpdateBanner] = useState(false);

  useEffect(() => {
    // Register service worker and listen for updates
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('Service Worker registered successfully');

          // Check for updates immediately
          registration.update();

          // Listen for service worker updates
          registration.addEventListener('updatefound', () => {
            console.log('New service worker found, installing...');
            const newWorker = registration.installing;
            
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed') {
                  if (navigator.serviceWorker.controller) {
                    // New version available
                    setUpdateInfo({
                      available: true,
                      version: '1.2.0', // This should match the service worker version
                      message: 'New version available!'
                    });
                    setNewVersion('1.2.0');
                    setShowUpdateBanner(true);
                    
                    toast.info('New version available!', {
                      description: 'Click to update your app',
                      action: {
                        label: 'Update',
                        onClick: () => handleUpdate()
                      }
                    });
                  }
                }
              });
            }
          });

          // Listen for messages from service worker
          navigator.serviceWorker.addEventListener('message', (event) => {
            if (event.data.type === 'SW_UPDATE') {
              setUpdateInfo({
                available: true,
                version: event.data.version,
                message: event.data.message
              });
              setNewVersion(event.data.version);
              setShowUpdateBanner(true);
            }
          });

          // Get current version
          if (registration.active) {
            const messageChannel = new MessageChannel();
            messageChannel.port1.onmessage = (event) => {
              if (event.data.type === 'VERSION_RESPONSE') {
                setCurrentVersion(event.data.version);
              }
            };
            registration.active.postMessage(
              { type: 'GET_VERSION' },
              [messageChannel.port2]
            );
          }
        })
        .catch((error) => {
          console.error('Service Worker registration failed:', error);
        });
    }

    // Check for updates every 5 minutes
    const updateInterval = setInterval(() => {
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistration().then((registration) => {
          if (registration) {
            registration.update();
          }
        });
      }
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(updateInterval);
  }, []);

  const handleUpdate = async () => {
    setIsUpdating(true);
    
    try {
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.getRegistration();
        
        if (registration && registration.waiting) {
          // Tell the waiting service worker to skip waiting and become active
          registration.waiting.postMessage({ type: 'SKIP_WAITING' });
          
          // Reload the page to use the new service worker
          setTimeout(() => {
            window.location.reload();
          }, 1000);
        } else {
          // Force reload to get the latest version
          window.location.reload();
        }
      }
    } catch (error) {
      console.error('Update failed:', error);
      toast.error('Update failed. Please refresh the page manually.');
      setIsUpdating(false);
    }
  };

  const dismissUpdate = () => {
    setShowUpdateBanner(false);
    setUpdateInfo({ available: false });
  };

  if (!showUpdateBanner || !updateInfo.available) {
    return null;
  }

  return (
    <div className={`fixed top-4 right-4 z-50 max-w-sm ${className}`}>
      <Card className="border-blue-200 bg-blue-50 shadow-lg">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                <Download className="w-3 h-3 mr-1" />
                Update Available
              </Badge>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={dismissUpdate}
              className="h-6 w-6 p-0 hover:bg-blue-100"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          <CardTitle className="text-lg text-blue-900">
            New Version Available
          </CardTitle>
          <CardDescription className="text-blue-700">
            Version {newVersion} is ready with new features and improvements.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex gap-2">
            <Button
              onClick={handleUpdate}
              disabled={isUpdating}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
              size="sm"
            >
              {isUpdating ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Update Now
                </>
              )}
            </Button>
            <Button
              variant="outline"
              onClick={dismissUpdate}
              className="border-blue-200 text-blue-700 hover:bg-blue-100"
              size="sm"
            >
              Later
            </Button>
          </div>
          <p className="text-xs text-blue-600 mt-2">
            Current: v{currentVersion} → New: v{newVersion}
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default PWAUpdateManager;
