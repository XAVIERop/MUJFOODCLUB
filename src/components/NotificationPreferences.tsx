import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Bell, Save, Loader2 } from 'lucide-react';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { useToast } from '@/hooks/use-toast';

const NotificationPreferences: React.FC = () => {
  const { isSubscribed, preferences, updatePreferences, isLoading, subscribe } = usePushNotifications();
  const { toast } = useToast();
  const [localPreferences, setLocalPreferences] = useState(preferences || {
    order_received: true,
    order_confirmed: true,
    order_preparing: true,
    order_on_the_way: true,
    order_completed: true,
    order_cancelled: true,
    new_order_for_cafe: true,
  });
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (preferences) {
      setLocalPreferences(preferences);
    }
  }, [preferences]);

  const handleToggle = (key: keyof typeof localPreferences) => {
    setLocalPreferences(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    const success = await updatePreferences(localPreferences);
    if (success) {
      setHasChanges(false);
    }
  };

  if (!isSubscribed) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Push Notifications
          </CardTitle>
          <CardDescription>
            Enable push notifications to manage your preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Push notifications are not enabled. Click the button below to enable them.
          </p>
          <Button
            onClick={async () => {
              const success = await subscribe();
              if (success) {
                // Component will re-render and show preferences
              }
            }}
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Enabling...
              </>
            ) : (
              <>
                <Bell className="h-4 w-4 mr-2" />
                Enable Push Notifications
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Notification Preferences
        </CardTitle>
        <CardDescription>
          Choose which notifications you want to receive
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Order Notifications */}
        <div className="space-y-4">
          <h3 className="font-semibold text-sm">Order Updates</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="order_received" className="text-sm font-normal">
                  Order Received
                </Label>
                <p className="text-xs text-muted-foreground">
                  When your order is received by the cafe
                </p>
              </div>
              <Switch
                id="order_received"
                checked={localPreferences.order_received}
                onCheckedChange={() => handleToggle('order_received')}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="order_confirmed" className="text-sm font-normal">
                  Order Confirmed
                </Label>
                <p className="text-xs text-muted-foreground">
                  When the cafe confirms your order
                </p>
              </div>
              <Switch
                id="order_confirmed"
                checked={localPreferences.order_confirmed}
                onCheckedChange={() => handleToggle('order_confirmed')}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="order_preparing" className="text-sm font-normal">
                  Order Preparing
                </Label>
                <p className="text-xs text-muted-foreground">
                  When the cafe starts preparing your order
                </p>
              </div>
              <Switch
                id="order_preparing"
                checked={localPreferences.order_preparing}
                onCheckedChange={() => handleToggle('order_preparing')}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="order_on_the_way" className="text-sm font-normal">
                  Out for Delivery
                </Label>
                <p className="text-xs text-muted-foreground">
                  When your order is out for delivery
                </p>
              </div>
              <Switch
                id="order_on_the_way"
                checked={localPreferences.order_on_the_way}
                onCheckedChange={() => handleToggle('order_on_the_way')}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="order_completed" className="text-sm font-normal">
                  Order Completed
                </Label>
                <p className="text-xs text-muted-foreground">
                  When your order is delivered
                </p>
              </div>
              <Switch
                id="order_completed"
                checked={localPreferences.order_completed}
                onCheckedChange={() => handleToggle('order_completed')}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="order_cancelled" className="text-sm font-normal">
                  Order Cancelled
                </Label>
                <p className="text-xs text-muted-foreground">
                  When your order is cancelled
                </p>
              </div>
              <Switch
                id="order_cancelled"
                checked={localPreferences.order_cancelled}
                onCheckedChange={() => handleToggle('order_cancelled')}
              />
            </div>
          </div>
        </div>

        {/* Cafe Notifications */}
        <div className="space-y-4 border-t pt-4">
          <h3 className="font-semibold text-sm">Cafe Notifications</h3>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="new_order_for_cafe" className="text-sm font-normal">
                New Orders
              </Label>
              <p className="text-xs text-muted-foreground">
                When a new order is received at your cafe
              </p>
            </div>
            <Switch
              id="new_order_for_cafe"
              checked={localPreferences.new_order_for_cafe}
              onCheckedChange={() => handleToggle('new_order_for_cafe')}
            />
          </div>
        </div>

        {/* Save Button */}
        {hasChanges && (
          <div className="flex justify-end pt-4 border-t">
            <Button
              onClick={handleSave}
              disabled={isLoading}
              className="gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Save Preferences
                </>
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default NotificationPreferences;

