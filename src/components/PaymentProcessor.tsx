import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  CreditCard, 
  Smartphone, 
  Wallet, 
  Banknote, 
  CheckCircle, 
  AlertCircle,
  Receipt,
  QrCode,
  Coins,
  Lock
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PaymentItem {
  id: string;
  name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

interface PaymentData {
  items: PaymentItem[];
  subtotal: number;
  tax_amount: number;
  discount_amount: number;
  final_amount: number;
  customer_phone: string;
  customer_name: string;
  delivery_block: string;
}

interface PaymentProcessorProps {
  paymentData: PaymentData;
  onPaymentComplete: (paymentResult: PaymentResult) => void;
  onCancel: () => void;
}

interface PaymentResult {
  success: boolean;
  payment_method: string;
  transaction_id?: string;
  amount_paid: number;
  change_amount?: number;
  receipt_data?: any;
  error_message?: string;
}

const PaymentProcessor: React.FC<PaymentProcessorProps> = ({
  paymentData,
  onPaymentComplete,
  onCancel
}) => {
  const { toast } = useToast();
  const [selectedMethod, setSelectedMethod] = useState<string>('cod');
  const [processing, setProcessing] = useState(false);
  const [paymentDetails, setPaymentDetails] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    upiId: '',
    walletType: '',
    cashAmount: '',
    splitAmount: '',
    splitCount: 1
  });

  const [splitPayment, setSplitPayment] = useState(false);

  const paymentMethods = [
    {
      id: 'cod',
      name: 'Cash on Delivery',
      icon: Banknote,
      description: 'Pay when you receive your order',
      color: 'bg-green-500'
    },
    {
      id: 'card',
      name: 'Credit/Debit Card',
      icon: CreditCard,
      description: 'Secure card payment',
      color: 'bg-blue-500'
    },
    {
      id: 'upi',
      name: 'UPI Payment',
      icon: Smartphone,
      description: 'Quick UPI transfer',
      color: 'bg-purple-500'
    },
    {
      id: 'wallet',
      name: 'Digital Wallet',
      icon: Wallet,
      description: 'Paytm, PhonePe, etc.',
      color: 'bg-orange-500'
    },
    {
      id: 'split',
      name: 'Split Payment',
      icon: Receipt,
      description: 'Split bill among customers',
      color: 'bg-indigo-500'
    }
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const handlePaymentMethodSelect = (method: string) => {
    setSelectedMethod(method);
    setPaymentDetails({
      cardNumber: '',
      expiryDate: '',
      cvv: '',
      upiId: '',
      walletType: '',
      cashAmount: '',
      splitAmount: '',
      splitCount: 1
    });
    setSplitPayment(false);
  };

  const validatePaymentDetails = (): boolean => {
    switch (selectedMethod) {
      case 'card':
        if (!paymentDetails.cardNumber || !paymentDetails.expiryDate || !paymentDetails.cvv) {
          toast({
            title: "Invalid Card Details",
            description: "Please fill in all card information",
            variant: "destructive"
          });
          return false;
        }
        break;
      case 'upi':
        if (!paymentDetails.upiId) {
          toast({
            title: "Invalid UPI ID",
            description: "Please enter a valid UPI ID",
            variant: "destructive"
          });
          return false;
        }
        break;
      case 'wallet':
        if (!paymentDetails.walletType) {
          toast({
            title: "Invalid Wallet",
            description: "Please select a wallet type",
            variant: "destructive"
          });
          return false;
        }
        break;
      case 'split':
        if (splitPayment && (!paymentDetails.splitAmount || paymentDetails.splitCount < 2)) {
          toast({
            title: "Invalid Split Payment",
            description: "Please enter valid split details",
            variant: "destructive"
          });
          return false;
        }
        break;
    }
    return true;
  };

  const processPayment = async () => {
    if (!validatePaymentDetails()) return;

    setProcessing(true);
    
    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));

      let paymentResult: PaymentResult;

      switch (selectedMethod) {
        case 'cod':
          paymentResult = {
            success: true,
            payment_method: 'cod',
            amount_paid: paymentData.final_amount,
            receipt_data: {
              method: 'Cash on Delivery',
              status: 'Pending',
              note: 'Payment due on delivery'
            }
          };
          break;

        case 'card':
          paymentResult = {
            success: true,
            payment_method: 'card',
            transaction_id: `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            amount_paid: paymentData.final_amount,
            receipt_data: {
              method: 'Credit/Debit Card',
              status: 'Completed',
              card_last4: paymentDetails.cardNumber.slice(-4),
              transaction_id: `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
            }
          };
          break;

        case 'upi':
          paymentResult = {
            success: true,
            payment_method: 'upi',
            transaction_id: `UPI_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            amount_paid: paymentData.final_amount,
            receipt_data: {
              method: 'UPI Payment',
              status: 'Completed',
              upi_id: paymentDetails.upiId,
              transaction_id: `UPI_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
            }
          };
          break;

        case 'wallet':
          paymentResult = {
            success: true,
            payment_method: 'wallet',
            transaction_id: `WLT_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            amount_paid: paymentData.final_amount,
            receipt_data: {
              method: `${paymentDetails.walletType} Wallet`,
              status: 'Completed',
              wallet_type: paymentDetails.walletType,
              transaction_id: `WLT_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
            }
          };
          break;

        case 'split':
          const splitAmount = parseFloat(paymentDetails.splitAmount) || 0;
          const changeAmount = splitAmount - paymentData.final_amount;
          
          paymentResult = {
            success: true,
            payment_method: 'split',
            amount_paid: splitAmount,
            change_amount: changeAmount > 0 ? changeAmount : 0,
            receipt_data: {
              method: 'Split Payment',
              status: 'Completed',
              split_count: paymentDetails.splitCount,
              split_amount: splitAmount,
              change_amount: changeAmount > 0 ? changeAmount : 0
            }
          };
          break;

        default:
          throw new Error('Invalid payment method');
      }

      toast({
        title: "Payment Successful!",
        description: `Payment of ${formatCurrency(paymentResult.amount_paid)} processed successfully`,
      });

      onPaymentComplete(paymentResult);

    } catch (error) {
      console.error('Payment processing error:', error);
      
      const paymentResult: PaymentResult = {
        success: false,
        payment_method: selectedMethod,
        amount_paid: 0,
        error_message: error.message || 'Payment processing failed'
      };

      toast({
        title: "Payment Failed",
        description: error.message || 'Payment processing failed. Please try again.',
        variant: "destructive"
      });

      onPaymentComplete(paymentResult);
    } finally {
      setProcessing(false);
    }
  };

  const calculateSplitAmount = () => {
    if (paymentDetails.splitCount < 2) return paymentData.final_amount;
    return Math.ceil(paymentData.final_amount / paymentDetails.splitCount);
  };

  return (
    <div className="payment-processor">
      <Card className="payment-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Payment Processing
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Select payment method and complete your transaction
          </p>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Order Summary */}
          <div className="bg-muted/30 rounded-lg p-4">
            <h3 className="font-semibold mb-3">Order Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>{formatCurrency(paymentData.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax:</span>
                <span>{formatCurrency(paymentData.tax_amount)}</span>
              </div>
              <div className="flex justify-between">
                <span>Discount:</span>
                <span className="text-green-600">
                  -{formatCurrency(paymentData.discount_amount)}
                </span>
              </div>
              <Separator />
              <div className="flex justify-between font-bold text-lg">
                <span>Total Amount:</span>
                <span className="text-primary">{formatCurrency(paymentData.final_amount)}</span>
              </div>
            </div>
          </div>

          {/* Payment Methods */}
          <div>
            <h3 className="font-semibold mb-3">Select Payment Method</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {paymentMethods.map((method) => {
                const Icon = method.icon;
                return (
                  <Button
                    key={method.id}
                    variant={selectedMethod === method.id ? "default" : "outline"}
                    className={`h-auto p-4 flex flex-col items-center gap-2 ${
                      selectedMethod === method.id ? 'ring-2 ring-primary' : ''
                    }`}
                    onClick={() => handlePaymentMethodSelect(method.id)}
                  >
                    <Icon className={`w-6 h-6 ${method.color.replace('bg-', 'text-')}`} />
                    <div className="text-center">
                      <div className="font-medium text-sm">{method.name}</div>
                      <div className="text-xs text-muted-foreground">{method.description}</div>
                    </div>
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Payment Details Form */}
          <div>
            <h3 className="font-semibold mb-3">Payment Details</h3>
            
            {selectedMethod === 'card' && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="cardNumber">Card Number</Label>
                  <Input
                    id="cardNumber"
                    placeholder="1234 5678 9012 3456"
                    value={paymentDetails.cardNumber}
                    onChange={(e) => setPaymentDetails(prev => ({ ...prev, cardNumber: e.target.value }))}
                    maxLength={19}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="expiryDate">Expiry Date</Label>
                    <Input
                      id="expiryDate"
                      placeholder="MM/YY"
                      value={paymentDetails.expiryDate}
                      onChange={(e) => setPaymentDetails(prev => ({ ...prev, expiryDate: e.target.value }))}
                      maxLength={5}
                    />
                  </div>
                  <div>
                    <Label htmlFor="cvv">CVV</Label>
                    <Input
                      id="cvv"
                      placeholder="123"
                      value={paymentDetails.cvv}
                      onChange={(e) => setPaymentDetails(prev => ({ ...prev, cvv: e.target.value }))}
                      maxLength={4}
                    />
                  </div>
                </div>
              </div>
            )}

            {selectedMethod === 'upi' && (
              <div>
                <Label htmlFor="upiId">UPI ID</Label>
                <Input
                  id="upiId"
                  placeholder="username@upi"
                  value={paymentDetails.upiId}
                  onChange={(e) => setPaymentDetails(prev => ({ ...prev, upiId: e.target.value }))}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Enter your UPI ID (e.g., username@upi, username@paytm)
                </p>
              </div>
            )}

            {selectedMethod === 'wallet' && (
              <div>
                <Label htmlFor="walletType">Select Wallet</Label>
                <select
                  id="walletType"
                  className="w-full p-2 border rounded-md"
                  value={paymentDetails.walletType}
                  onChange={(e) => setPaymentDetails(prev => ({ ...prev, walletType: e.target.value }))}
                >
                  <option value="">Choose wallet...</option>
                  <option value="paytm">Paytm</option>
                  <option value="phonepe">PhonePe</option>
                  <option value="gpay">Google Pay</option>
                  <option value="amazonpay">Amazon Pay</option>
                </select>
              </div>
            )}

            {selectedMethod === 'split' && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="splitPayment"
                    checked={splitPayment}
                    onChange={(e) => setSplitPayment(e.target.checked)}
                  />
                  <Label htmlFor="splitPayment">Enable split payment</Label>
                </div>
                
                {splitPayment && (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="splitCount">Number of people</Label>
                      <Input
                        id="splitCount"
                        type="number"
                        min="2"
                        max="10"
                        value={paymentDetails.splitCount}
                        onChange={(e) => setPaymentDetails(prev => ({ ...prev, splitCount: parseInt(e.target.value) || 1 }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="splitAmount">Amount per person</Label>
                      <Input
                        id="splitAmount"
                        type="number"
                        value={calculateSplitAmount()}
                        disabled
                        className="bg-muted"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Each person pays: {formatCurrency(calculateSplitAmount())}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {selectedMethod === 'cod' && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-2 text-green-800">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-medium">Cash on Delivery</span>
                </div>
                <p className="text-sm text-green-700 mt-1">
                  Pay ₹{formatCurrency(paymentData.final_amount)} when you receive your order
                </p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              onClick={onCancel}
              variant="outline"
              className="flex-1"
              disabled={processing}
            >
              Cancel
            </Button>
            <Button
              onClick={processPayment}
              className="flex-1"
              disabled={processing}
            >
              {processing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Processing...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Complete Payment
                </>
              )}
            </Button>
          </div>

          {/* Security Notice */}
          <div className="text-center text-xs text-muted-foreground">
            <Lock className="w-3 h-3 inline mr-1" />
            All payments are processed securely
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentProcessor;
