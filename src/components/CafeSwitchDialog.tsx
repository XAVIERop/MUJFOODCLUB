import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle, ShoppingCart } from "lucide-react";

interface CafeSwitchDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  currentCafeName: string;
  newCafeName: string;
  currentCartItems: number;
}

export const CafeSwitchDialog: React.FC<CafeSwitchDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  currentCafeName,
  newCafeName,
  currentCartItems
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-full">
              <AlertTriangle className="h-6 w-6 text-orange-600" />
            </div>
            <DialogTitle className="text-xl font-semibold">
              Switch Cafe?
            </DialogTitle>
          </div>
          <DialogDescription className="text-gray-600 pt-2">
            Your cart contains {currentCartItems} item{currentCartItems !== 1 ? 's' : ''} from{' '}
            <span className="font-semibold text-gray-900">{currentCafeName}</span>.
            <br /><br />
            Adding items from{' '}
            <span className="font-semibold text-orange-600">{newCafeName}</span> will clear 
            your current cart and start fresh.
            <br /><br />
            Do you want to continue?
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
          <ShoppingCart className="h-4 w-4 text-gray-500" />
          <span className="text-sm text-gray-600">
            Your current cart will be cleared
          </span>
        </div>
        
        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            className="flex-1 bg-orange-600 hover:bg-orange-700 text-white"
          >
            Clear Cart & Continue
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
