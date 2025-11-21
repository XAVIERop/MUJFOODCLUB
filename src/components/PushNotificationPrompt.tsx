import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Bell, X, CheckCircle } from 'lucide-react';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { useAuth } from '@/hooks/useAuth';

interface PushNotificationPromptProps {
  onDismiss?: () => void;
  autoShow?: boolean; // Auto-show if permission is default
}

const PushNotificationPrompt: React.FC<PushNotificationPromptProps> = ({
  onDismiss,
  autoShow = true,
}) => {
  const { user } = useAuth();
  const { isSupported, permission, isSubscribed, subscribe, isLoading } = usePushNotifications();
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Check if user has dismissed before
    const dismissed = localStorage.getItem('push_notification_dismissed');
    if (dismissed === 'true') {
      setIsDismissed(true);
      return;
    }

    // Auto-show if permission is default and user is logged in
    if (autoShow && user && isSupported && permission === 'default' && !isSubscribed) {
      setIsVisible(true);
    }
  }, [user, isSupported, permission, isSubscribed, autoShow]);

  const handleEnable = async () => {
    const success = await subscribe();
    if (success) {
      setIsVisible(false);
      if (onDismiss) {
        onDismiss();
      }
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
    setIsDismissed(true);
    localStorage.setItem('push_notification_dismissed', 'true');
    if (onDismiss) {
      onDismiss();
    }
  };

  // Don't show if not supported, already subscribed, dismissed, or not visible
  if (!isSupported || isSubscribed || isDismissed || !isVisible || !user) {
    return null;
  }

  return (
    <Card className="fixed bottom-4 right-4 z-50 w-full max-w-md shadow-lg border-2 border-primary/20">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-full">
              <Bell className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">Enable Push Notifications</CardTitle>
              <CardDescription className="text-sm mt-1">
                Get instant updates about your orders
              </CardDescription>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
            onClick={handleDismiss}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          <div className="text-sm text-muted-foreground space-y-1">
            <p className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              Order status updates
            </p>
            <p className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              Delivery notifications
            </p>
            <p className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              Special offers & promotions
            </p>
          </div>
          {permission === 'denied' ? (
            <div className="space-y-2">
              <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                <p className="text-sm text-destructive font-medium">
                  Notifications Blocked
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Notifications were blocked. To enable them:
                </p>
                <ol className="text-xs text-muted-foreground mt-2 ml-4 list-decimal space-y-1">
                  <li>Click the lock icon (🔒) in the address bar</li>
                  <li>Go to "Site settings" → "Notifications"</li>
                  <li>Change from "Block" to "Allow"</li>
                  <li>Refresh this page</li>
                </ol>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => window.location.reload()}
                  className="flex-1"
                >
                  Refresh Page
                </Button>
                <Button
                  variant="outline"
                  onClick={handleDismiss}
                >
                  Dismiss
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex gap-2">
              <Button
                onClick={handleEnable}
                disabled={isLoading}
                className="flex-1"
              >
                {isLoading ? 'Enabling...' : 'Enable Notifications'}
              </Button>
              <Button
                variant="outline"
                onClick={handleDismiss}
                disabled={isLoading}
              >
                Maybe Later
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default PushNotificationPrompt;

