import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertTriangle, Eye, EyeOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CafeCancellationDialogProps {
  orderId: string;
  orderNumber: string;
  onCancel: () => void;
  trigger: React.ReactNode;
}

const CafeCancellationDialog: React.FC<CafeCancellationDialogProps> = ({
  orderId,
  orderNumber,
  onCancel,
  trigger
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [password, setPassword] = useState('');
  const [reason, setReason] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const { toast } = useToast();

  // Cafe cancellation password - in a real app, this should be configurable per cafe
  const CAFE_CANCELLATION_PASSWORD = 'cafe123';

  const handleCancel = async () => {
    if (!password.trim()) {
      toast({
        title: "Password Required",
        description: "Please enter the cancellation password",
        variant: "destructive"
      });
      return;
    }

    if (password !== CAFE_CANCELLATION_PASSWORD) {
      toast({
        title: "Invalid Password",
        description: "The cancellation password is incorrect",
        variant: "destructive"
      });
      return;
    }

    if (!reason.trim()) {
      toast({
        title: "Reason Required",
        description: "Please provide a reason for cancellation",
        variant: "destructive"
      });
      return;
    }

    setIsCancelling(true);
    try {
      // Import supabase here to avoid circular dependencies
      const { supabase } = await import('@/integrations/supabase/client');
      const { user } = await import('@/hooks/useAuth').then(module => module.useAuth());
      
      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      const { error } = await supabase.rpc('cancel_order_with_reason', {
        p_order_id: orderId,
        p_cancelled_by: user.id,
        p_cancellation_reason: `Cafe cancellation: ${reason}`
      });

      if (error) throw error;

      toast({
        title: "Order Cancelled",
        description: `Order #${orderNumber} has been cancelled successfully`,
      });

      // Reset form
      setPassword('');
      setReason('');
      setIsOpen(false);
      
      // Call parent callback
      onCancel();
    } catch (error) {
      console.error('Error cancelling order:', error);
      toast({
        title: "Cancellation Failed",
        description: "Failed to cancel order. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsCancelling(false);
    }
  };

  const handleClose = () => {
    if (!isCancelling) {
      setPassword('');
      setReason('');
      setIsOpen(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="w-5 h-5" />
            Cancel Order #{orderNumber}
          </DialogTitle>
          <DialogDescription>
            This action will permanently cancel the order. Please provide the required authentication and reason.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Password Field */}
          <div className="space-y-2">
            <Label htmlFor="cancellation-password">Cancellation Password</Label>
            <div className="relative">
              <Input
                id="cancellation-password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter cancellation password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isCancelling}
                className="pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isCancelling}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-gray-400" />
                ) : (
                  <Eye className="h-4 w-4 text-gray-400" />
                )}
              </Button>
            </div>
          </div>

          {/* Reason Field */}
          <div className="space-y-2">
            <Label htmlFor="cancellation-reason">Cancellation Reason *</Label>
            <Textarea
              id="cancellation-reason"
              placeholder="Please provide a reason for cancelling this order..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              disabled={isCancelling}
              rows={3}
              className="resize-none"
            />
          </div>

          {/* Warning */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-red-800">
                <p className="font-medium">Warning:</p>
                <p>This action cannot be undone. The order will be permanently cancelled and the customer will be notified.</p>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isCancelling}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleCancel}
            disabled={isCancelling || !password.trim() || !reason.trim()}
          >
            {isCancelling ? 'Cancelling...' : 'Cancel Order'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CafeCancellationDialog;
