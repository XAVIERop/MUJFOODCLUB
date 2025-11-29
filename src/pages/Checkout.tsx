import { useState, useEffect } from 'react';
import { useNavigate, useLocation as useRouterLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ArrowLeft, MapPin, Clock, Banknote, AlertCircle, Plus, Minus, Gift, User } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useCart } from '@/hooks/useCart';
import { useLocation } from '@/contexts/LocationContext';
import { useToast } from '@/hooks/use-toast';
import { ORDER_CONSTANTS } from '@/lib/constants';
// Timing checks now come from database cafe configuration
import { generateDailyOrderNumber } from '@/utils/orderNumberGenerator';
import { getCafeTableOptions } from '@/utils/tableMapping';
import { WhatsAppService } from '@/services/whatsappService';
import { orderPushNotificationService } from '@/services/orderPushNotificationService';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ReferralCodeInput from '@/components/ReferralCodeInput';
import { ReferralValidation } from '@/services/referralService';
import { getUserResidency, shouldUserOrderFromCafe, isOffCampusUser } from '@/utils/residencyUtils';
import LocationPicker from '@/components/LocationPicker';
import { SavedAddressList } from '@/components/SavedAddressList';
import { SavedAddress, savedAddressService } from '@/services/savedAddressService';

// Helper function to get dropdown options based on order type and cafe
const getLocationOptions = (orderType: string, cafeName: string, residencyScope: 'ghs' | 'off_campus') => {
  if (orderType === 'dine_in') {
    // For dine-in, show table numbers
    const tableOptions = getCafeTableOptions(cafeName);
    return tableOptions.map(table => ({
      value: table.label, // "Table 1", "Table 2", etc.
      label: table.label
    }));
  } else if (orderType === 'delivery') {
    // For delivery, show blocks
    if (residencyScope === 'ghs') {
      return [
        { value: 'B1', label: 'B1' },
        { value: 'B2', label: 'B2' },
        { value: 'B3', label: 'B3' },
        { value: 'B4', label: 'B4' },
        { value: 'B5', label: 'B5' },
        { value: 'B6', label: 'B6' },
        { value: 'B7', label: 'B7' },
        { value: 'B8', label: 'B8' },
        { value: 'B9', label: 'B9' },
        { value: 'B10', label: 'B10' },
        { value: 'B11', label: 'B11' },
        { value: 'B12', label: 'B12' },
        { value: 'G1', label: 'G1' },
        { value: 'G2', label: 'G2' },
        { value: 'G3', label: 'G3' },
        { value: 'G4', label: 'G4' },
        { value: 'G5', label: 'G5' },
        { value: 'G6', label: 'G6' },
        { value: 'G7', label: 'G7' },
        { value: 'G8', label: 'G8' }
      ];
    }

    return [
      { value: 'OFF_CAMPUS', label: 'Off Campus / PG' },
      { value: 'GHS_GATE', label: 'Deliver to GHS Gate' },
      { value: 'PG', label: 'PG / Hostel Outside' }
    ];
  } else if (orderType === 'takeaway') {
    // For takeaway, show takeaway option
    return [{ value: 'TAKEAWAY', label: 'Takeaway' }];
  }
  return [];
};

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  preparation_time: number;
  is_available: boolean;
}

interface Cafe {
  id: string;
  name: string;
  slug?: string | null;
  type: string;
  description: string;
  location: string;
  phone: string;
  hours: string;
  rating: number;
  total_reviews: number;
  accepting_orders: boolean;
  location_scope?: string | null;
  // Timing configuration
  delivery_enabled?: boolean;
  delivery_start_time?: string;
  delivery_end_time?: string;
  delivery_crosses_midnight?: boolean;
  dine_in_enabled?: boolean;
  dine_in_start_time?: string;
  dine_in_end_time?: string;
  takeaway_enabled?: boolean;
  takeaway_start_time?: string;
  takeaway_end_time?: string;
}

interface CartItem {
  item: MenuItem;
  quantity: number;
  notes: string;
}

const Checkout = () => {
  const navigate = useNavigate();
  const location = useRouterLocation();
  const { user, profile, refreshProfile } = useAuth();
  const { cart, cafe, getTotalAmount, addToCart, removeFromCart, clearCart } = useCart();
  const { selectedBlock, setSelectedBlock } = useLocation();
  const { toast } = useToast();
  const { scope: userResidency } = getUserResidency(profile);
  const isOffCampusResident = userResidency === 'off_campus';
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [cafeAcceptingOrders, setCafeAcceptingOrders] = useState<boolean | null>(null);
  const [isCheckingCafeStatus, setIsCheckingCafeStatus] = useState(false);
  
  // Calculate total amount from global cart
  const totalAmount = getTotalAmount();

  // Helper function to get cart's cafe name
  const getCartCafeName = () => {
    const cartItems = Object.values(cart);
    if (cartItems.length === 0) return '';
    
    // Get the first item's cafe name (assuming all items are from same cafe)
    const firstItem = cartItems[0] as any;
    return firstItem.item.cafe_name || '';
  };

  // Helper function to get cart's cafe ID (CRITICAL: Use this instead of cart context cafe.id)
  const getCartCafeId = () => {
    const cartItems = Object.values(cart);
    if (cartItems.length === 0) return null;
    
    // Get the first item's cafe_id (assuming all items are from same cafe)
    const firstItem = cartItems[0] as any;
    return firstItem.item.cafe_id || null;
  };

  // Check if this is a grocery order (24 Seven Mart only - Grabit is now a regular cafe)
  const isGroceryOrder = () => {
    const cartCafeName = getCartCafeName();
    return cartCafeName?.toLowerCase().includes('24 seven') || 
           cartCafeName?.toLowerCase().includes('grocery') ||
           cafe?.name?.toLowerCase().includes('24 seven') ||
           cafe?.name?.toLowerCase().includes('grocery') ||
           cafe?.type === 'grocery';
  };

  // Check if this is a Grabit order (to hide takeaway/dine-in options)
  const isGrabitOrder = () => {
    const cartCafeName = getCartCafeName();
    return cartCafeName?.toLowerCase().includes('grabit') ||
           cafe?.name?.toLowerCase().includes('grabit') ||
           cafe?.slug === 'grabit';
  };

  // Check if this is Banna's Chowki cafe
  const isBannasChowki = () => {
    const cartCafeName = getCartCafeName();
    return cartCafeName?.toLowerCase().includes('banna') ||
           cafe?.name?.toLowerCase().includes('banna') ||
           cafe?.slug === 'bannaschowki';
  };

  // Check if guest ordering is allowed (Banna's Chowki dine-in only)
  const isGuestOrderingAllowed = () => {
    return isBannasChowki() && deliveryDetails.orderType === 'dine_in';
  };

  // Check if an order type is allowed based on current time and cafe configuration
  const isOrderTypeAllowed = (orderType: 'delivery' | 'dine_in' | 'takeaway'): boolean => {
    console.log('🔍 isOrderTypeAllowed called:', { orderType, cafe });
    if (!cafe) return false;

    // Check if this order type is enabled for this cafe
    if (orderType === 'delivery' && !cafe.delivery_enabled) return false;
    if (orderType === 'dine_in' && !cafe.dine_in_enabled) return false;
    if (orderType === 'takeaway' && !cafe.takeaway_enabled) return false;

    // Get timing configuration from cafe
    let startTime: string | null = null;
    let endTime: string | null = null;
    let crossesMidnight = false;

    if (orderType === 'delivery') {
      startTime = cafe.delivery_start_time;
      endTime = cafe.delivery_end_time;
      crossesMidnight = cafe.delivery_crosses_midnight ?? false;
    } else if (orderType === 'dine_in') {
      startTime = cafe.dine_in_start_time;
      endTime = cafe.dine_in_end_time;
    } else if (orderType === 'takeaway') {
      startTime = cafe.takeaway_start_time;
      endTime = cafe.takeaway_end_time;
    }

    // If no timing configured, allow it
    if (!startTime || !endTime) return true;

    // Get current time in minutes since midnight
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    // Parse start and end times (format: "HH:MM:SS" or "HH:MM")
    const parseTime = (timeStr: string): number => {
      const parts = timeStr.split(':');
      return parseInt(parts[0]) * 60 + parseInt(parts[1]);
    };

    const startMinutes = parseTime(startTime);
    const endMinutes = parseTime(endTime);

    // Check if current time is within allowed window
    if (crossesMidnight) {
      // Time window crosses midnight (e.g., 11 PM to 2 AM)
      return currentMinutes >= startMinutes || currentMinutes <= endMinutes;
    } else {
      // Normal time window (e.g., 11 AM to 11 PM)
      return currentMinutes >= startMinutes && currentMinutes <= endMinutes;
    }
  };

  // Check if cafe is outside campus (for delivery address requirement)
  const isOutsideCafe = () => {
    return cafe?.location_scope === 'off_campus';
  };

  // Saved address state
  const [selectedSavedAddress, setSelectedSavedAddress] = useState<SavedAddress | null>(null);
  const [showManualAddress, setShowManualAddress] = useState(false);

  // Handle saved address selection
  const handleSelectSavedAddress = (address: SavedAddress) => {
    setSelectedSavedAddress(address);
    
    // Pre-fill delivery details with saved address
    const formattedAddress = savedAddressService.formatAddress(address);
    
    setDeliveryDetails(prev => ({
      ...prev,
      orderType: 'delivery', // Saved addresses are for delivery
      deliveryAddress: formattedAddress,
      deliveryCoordinates: {
        lat: address.latitude,
        lng: address.longitude
      },
      block: isOffCampusResident ? 'OFF_CAMPUS' : prev.block
    }));
    
    toast({
      title: 'Address selected',
      description: `Delivering to ${address.label}`,
    });
  };

  // Form states
  const [deliveryDetails, setDeliveryDetails] = useState({
    orderType: 'delivery', // 'delivery', 'takeaway', or 'dine_in'
    block: isOffCampusResident ? 'OFF_CAMPUS' : selectedBlock,
    deliveryNotes: '',
    deliveryAddress: '', // For outside cafe delivery orders
    deliveryCoordinates: null as { lat: number; lng: number } | null, // GPS coordinates
    paymentMethod: 'cod',
    phoneNumber: profile?.phone || ''
  });

  // Force delivery for grocery orders and Grabit
  useEffect(() => {
    if (isGroceryOrder() || isGrabitOrder()) {
      // Force delivery order type
      if (deliveryDetails.orderType !== 'delivery') {
        setDeliveryDetails(prev => ({ ...prev, orderType: 'delivery' }));
      }
    }
  }, [isGroceryOrder(), isGrabitOrder(), deliveryDetails.orderType]);

  // Calculate final amount
  const [finalAmount, setFinalAmount] = useState(totalAmount);
  
  // Tax and delivery charges
  const [cgst, setCgst] = useState(0);
  const [sgst, setSgst] = useState(0);
  const [deliveryFee, setDeliveryFee] = useState(0);
  
  // MUJ FOOD CLUB discount
  const [discountAmount, setDiscountAmount] = useState(0);
  const isEligibleForDiscount = cafe?.name === 'CHATKARA' || cafe?.name === 'COOK HOUSE' || 
                                cafe?.name?.toLowerCase().includes('mini meals') || 
                                cafe?.name === 'MINI MEALS' ||
                                cafe?.name?.toLowerCase().includes('taste of india') ||
                                cafe?.name?.toLowerCase().includes('food court') || 
                                cafe?.name === 'FOOD COURT';

  // Referral system states
  const [referralCode, setReferralCode] = useState('');
  const [referralDiscount, setReferralDiscount] = useState(0);
  const [referralValidation, setReferralValidation] = useState<ReferralValidation | null>(null);
  
  // Guest ordering states (for Banna's Chowki dine-in)
  const [guestName, setGuestName] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  
  // Check if user is verified (email confirmed)
  const isUserVerified = user?.email_confirmed_at !== null;

  // Minimum order amount validation
  const isMinimumOrderMet = totalAmount >= ORDER_CONSTANTS.MINIMUM_ORDER_AMOUNT;

  // Redirect if no cart data
  useEffect(() => {
    console.log('🛒 Checkout cart data:', cart);
    console.log('🏪 Cafe data:', cafe);
    console.log('💰 Total amount:', totalAmount);
    
    if (!cart || Object.keys(cart).length === 0 || !cafe) {
      console.log('❌ No cart data or cafe, redirecting to cafes');
      navigate('/cafes');
      return;
    }

    // Skip residency check for guest orders (Banna's Chowki dine-in when not logged in)
    const isGuestOrder = isBannasChowki() && (!user || !profile);
    
    // Only check residency for logged-in users (skip for guest orders)
    if (!isGuestOrder && !shouldUserOrderFromCafe(profile, cafe)) {
      toast({
        title: 'Unavailable Cafe',
        description: 'This cafe is available only for GHS residents.',
        variant: 'destructive'
      });
      navigate('/cafes');
      return;
    }
  }, [cart, cafe, navigate, totalAmount, profile, toast, user]);

  // Update phone number when profile changes
  useEffect(() => {
    if (profile?.phone) {
      setDeliveryDetails(prev => ({ ...prev, phoneNumber: profile.phone }));
    }
  }, [profile?.phone]);
  // Always fetch latest accepting_orders state from Supabase to avoid stale cached data
  useEffect(() => {
    const fetchLatestCafeStatus = async () => {
      const cafeId = getCartCafeId();
      if (!cafeId) {
        setCafeAcceptingOrders(null);
        return;
      }

      try {
        setIsCheckingCafeStatus(true);
        const { data, error: cafeStatusError } = await supabase
          .from('cafes')
          .select('accepting_orders')
          .eq('id', cafeId)
          .single();

        if (cafeStatusError) {
          console.warn('⚠️ Failed to fetch latest cafe status:', cafeStatusError);
          setCafeAcceptingOrders(null);
          return;
        }

        setCafeAcceptingOrders(data?.accepting_orders ?? null);
      } catch (statusError) {
        console.warn('⚠️ Unexpected error while fetching cafe status:', statusError);
        setCafeAcceptingOrders(null);
      } finally {
        setIsCheckingCafeStatus(false);
      }
    };

    fetchLatestCafeStatus();
    // We intentionally depend on cart and cafe?.id to refresh status when the cart or cafe changes
  }, [cart, cafe?.id]);


  useEffect(() => {
    if (isOffCampusResident) {
      setDeliveryDetails(prev => {
        const current = prev.block;
        if (current === 'OFF_CAMPUS' || current === 'GHS_GATE' || current === 'PG') {
          return prev;
        }
        return { ...prev, block: 'OFF_CAMPUS' };
      });
      if (selectedBlock !== 'OFF_CAMPUS') {
        setSelectedBlock('OFF_CAMPUS');
      }
    }
  }, [isOffCampusResident, selectedBlock, setSelectedBlock]);

  // Calculate delivery charges and discount
  useEffect(() => {
    const subtotal = totalAmount;
    const deliveryCharge = deliveryDetails.orderType === 'delivery' ? ORDER_CONSTANTS.DELIVERY_CHARGE : 0;
    
    // Calculate MUJ FOOD CLUB discount (different rates for different cafes and order types)
    let discountRate = 0;
    if (cafe?.name === 'CHATKARA') {
      discountRate = 0.10; // 10% for Chatkara (all order types)
    } else if (cafe?.name === 'COOK HOUSE') {
      // Cook House: Different rates based on order type
      if (deliveryDetails.orderType === 'delivery') {
        discountRate = 0.10; // 10% for delivery
      } else if (deliveryDetails.orderType === 'dine_in' || deliveryDetails.orderType === 'takeaway') {
        discountRate = 0.05; // 5% for dine-in and takeaway
      }
    } else if (cafe?.name?.toLowerCase().includes('mini meals') || cafe?.name === 'MINI MEALS') {
      discountRate = 0.10; // 10% for Mini Meals
    } else if (cafe?.name?.toLowerCase().includes('taste of india')) {
      discountRate = 0.10; // 10% for Taste of India
    } else if (cafe?.name?.toLowerCase().includes('food court') || cafe?.name === 'FOOD COURT') {
      discountRate = 0.05; // 5% for Food Court
    }
    const discount = isEligibleForDiscount ? subtotal * discountRate : 0;
    
    // Check if this is Food Court, Pizza Bakers, or Taste of India order for GST calculation
    const isFoodCourt = cafe?.name?.toLowerCase().includes('food court') || 
                       cafe?.name === 'FOOD COURT' ||
                       cafe?.name?.toLowerCase() === 'food court';
    
    const isPizzaBakers = cafe?.name?.toLowerCase().includes('pizza bakers') || 
                         cafe?.name?.toLowerCase().includes('crazy chef');
    
    const isTasteOfIndia = cafe?.name?.toLowerCase().includes('taste of india') || 
                          cafe?.name === 'TASTE OF INDIA';
    
    
    // Calculate GST for Food Court, Pizza Bakers, and Taste of India orders
    let cgstAmount = 0;
    let sgstAmount = 0;
    
    if (isFoodCourt || isPizzaBakers || isTasteOfIndia) {
      // GST is calculated on subtotal (before discount and delivery)
      cgstAmount = subtotal * 0.025; // 2.5% CGST
      sgstAmount = subtotal * 0.025; // 2.5% SGST
    }
    
    const finalAmountWithDelivery = subtotal + cgstAmount + sgstAmount + deliveryCharge - discount - referralDiscount;
    
    setCgst(cgstAmount);
    setSgst(sgstAmount);
    setDeliveryFee(deliveryCharge);
    setDiscountAmount(discount);
    setFinalAmount(Math.max(0, finalAmountWithDelivery));
  }, [totalAmount, deliveryDetails.orderType, isEligibleForDiscount, cafe?.name, referralDiscount]);

  // Handle referral code validation
  const handleReferralValidation = async (validation: ReferralValidation | null) => {
    setReferralValidation(validation);

    // Only allow referral discount for verified users
    if (validation?.isValid && isUserVerified) {
      setReferralDiscount(5); // Apply ₹5 referral discount
    } else {
      setReferralDiscount(0);
    }
  };

  const handlePlaceOrder = async () => {
    // Allow guest ordering for Banna's Chowki dine-in orders
    const isGuestOrder = isGuestOrderingAllowed() && (!user || !profile);
    
    if (!isGuestOrder && (!user || !profile)) {
      setError('Please sign in to place an order');
      return;
    }

    // Validate guest information if it's a guest order
    if (isGuestOrder) {
      if (!guestName || guestName.trim().length === 0) {
        setError('Please enter your name');
        return;
      }
      if (!guestPhone || guestPhone.length !== 10) {
        setError('Please enter a valid 10-digit phone number');
        return;
      }
    }

    const isCafeCurrentlyAcceptingOrders =
      cafeAcceptingOrders ?? cafe?.accepting_orders ?? true;

    // Check if cafe is accepting orders from database (latest status)
    // This check applies to ALL cafes including Grabit
    if (cafe && !isCafeCurrentlyAcceptingOrders) {
      setError('This cafe is temporarily not accepting orders. They will resume service in the next 2 days.');
      return;
    }

    // Check if the selected order type is currently available
    // Skip time restrictions for grocery orders and Grabit
    // Note: Time restriction messages removed - orders will be blocked silently if not available
    if (!isGroceryOrder() && !isGrabitOrder()) {
      if (deliveryDetails.orderType === 'delivery' && !isOrderTypeAllowed('delivery')) {
        return;
      }
      
      if (deliveryDetails.orderType === 'dine_in' && !isOrderTypeAllowed('dine_in')) {
        return;
      }
      
      if (deliveryDetails.orderType === 'takeaway' && !isOrderTypeAllowed('takeaway')) {
        return;
      }
    }

    // Validate phone number (use guest phone for guest orders, otherwise use delivery details)
    const phoneNumberToUse = isGuestOrder ? guestPhone : deliveryDetails.phoneNumber;
    // Strip out non-digit characters for validation
    const cleanPhone = phoneNumberToUse?.replace(/\D/g, '');
    // Accept 10 digits or 12 digits (with country code 91)
    if (!cleanPhone || (cleanPhone.length !== 10 && cleanPhone.length !== 12)) {
      setError('Please enter a valid 10-digit phone number');
      return;
    }

    // Validate location selection for all order types (except outside cafe delivery)
    // For outside cafe delivery, we use the delivery address instead
    if (!deliveryDetails.block && !(isOutsideCafe() && deliveryDetails.orderType === 'delivery')) {
      if (deliveryDetails.orderType === 'dine_in') {
        setError('Please select a table number for dine-in orders');
        return;
      } else if (deliveryDetails.orderType === 'delivery') {
        setError('Please select a block for delivery orders');
        return;
      } else if (deliveryDetails.orderType === 'takeaway') {
        setError('Please select a location for takeaway orders');
        return;
      }
    }

    // Validate delivery address for outside cafe delivery orders
    if (isOutsideCafe() && deliveryDetails.orderType === 'delivery') {
      if (!deliveryDetails.deliveryAddress || deliveryDetails.deliveryAddress.trim() === '') {
        setError('Please provide your delivery address');
        return;
      }
    }

    if (!isMinimumOrderMet) {
      setError(`Minimum order amount is ₹${ORDER_CONSTANTS.MINIMUM_ORDER_AMOUNT}`);
      return;
    }


    setIsLoading(true);
    setError('');

    // CRITICAL FIX: Get cafe_id from cart items, not from cart context
    // This ensures orders go to the correct cafe even if cart context is stale
    const cartCafeId = getCartCafeId();
    if (!cartCafeId) {
      setError('Cafe information is missing from cart items. Please try again.');
      setIsLoading(false);
      return;
    }

    // Validate cafe exists (still check cart context for other info, but use cart item's cafe_id)
    if (!cafe || !cafe.id) {
      setError('Cafe information is missing. Please try again.');
      setIsLoading(false);
      return;
    }

    // Verify that cart context cafe matches cart items cafe (safety check)
    if (cafe.id !== cartCafeId) {
      console.warn('⚠️ WARNING: Cart context cafe.id does not match cart items cafe_id!', {
        contextCafeId: cafe.id,
        contextCafeName: cafe.name,
        cartItemsCafeId: cartCafeId,
        cartItemsCafeName: getCartCafeName()
      });
      // Use the cart items cafe_id (more reliable)
    }

    try {
      console.log('🛒 Starting order creation...');
      console.log('🛒 Order data:', {
        user_id: isGuestOrder ? null : user?.id,
        is_guest_order: isGuestOrder,
        cafe_id: cartCafeId, // Use cart items cafe_id, not context cafe.id
        cafe_id_from_context: cafe.id,
        cafe_name: getCartCafeName() || cafe.name,
        cafe_type: cafe.type,
        cafe_slug: cafe.slug,
        is_grocery_order: isGroceryOrder(),
        total_amount: finalAmount,
        order_type: deliveryDetails.orderType,
        delivery_block: deliveryDetails.block,
        items_count: Object.values(cart).length
      });

      // Generate order number using new daily reset system
      console.log('🔄 Generating order number for cafe:', cartCafeId);
      let orderNumber: string;
      
      try {
        orderNumber = await generateDailyOrderNumber(cartCafeId); // Use cart items cafe_id
        console.log('✅ Generated daily order number:', orderNumber);
      } catch (error) {
        console.error('❌ Failed to generate daily order number, using fallback:', error);
        // Fallback to old system
        const timestamp = Date.now();
        const random = Math.random().toString(36).substr(2, 8).toUpperCase();
        const userSuffix = isGuestOrder ? 'GUEST' : (user?.id?.substr(-4).toUpperCase() || 'USER');
        orderNumber = `ONLINE-${timestamp}-${random}-${userSuffix}`;
      }

      // Handle delivery_block based on order type
      let deliveryBlock;
      let tableNumber = null;
      
      if (deliveryDetails.orderType === 'dine_in') {
        // For dine-in, store table number separately and use 'DINE_IN' for delivery_block
        tableNumber = deliveryDetails.block.replace('Table ', ''); // Extract "1" from "Table 1"
        deliveryBlock = 'DINE_IN';
      } else if (deliveryDetails.orderType === 'takeaway') {
        deliveryBlock = 'TAKEAWAY';
      } else {
        // For delivery, use the block directly (B1, B2, etc.)
        // For outside cafes, use 'OFF_CAMPUS' since they don't have block selection
        deliveryBlock = isOutsideCafe() ? 'OFF_CAMPUS' : deliveryDetails.block;
      }

      const orderData = {
        user_id: isGuestOrder ? null : user.id, // NULL for guest orders
        cafe_id: cartCafeId, // CRITICAL FIX: Use cafe_id from cart items, not context
        order_number: orderNumber,
        total_amount: finalAmount,
        order_type: deliveryDetails.orderType,
        delivery_block: deliveryBlock,
        table_number: tableNumber,
        delivery_notes: deliveryDetails.deliveryNotes || '',
        delivery_address: isOutsideCafe() && deliveryDetails.orderType === 'delivery' 
          ? deliveryDetails.deliveryAddress.trim() 
          : null,
        delivery_latitude: isOutsideCafe() && deliveryDetails.orderType === 'delivery' && deliveryDetails.deliveryCoordinates
          ? deliveryDetails.deliveryCoordinates.lat
          : null,
        delivery_longitude: isOutsideCafe() && deliveryDetails.orderType === 'delivery' && deliveryDetails.deliveryCoordinates
          ? deliveryDetails.deliveryCoordinates.lng
          : null,
        payment_method: deliveryDetails.paymentMethod,
        phone_number: phoneNumberToUse, // Use guest phone or delivery details phone
        customer_name: isGuestOrder ? guestName.trim() : (profile?.full_name || ''),
        points_earned: 0, // No points in simplified version
        status: 'received',
        estimated_delivery: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
        referral_code_used: isGuestOrder ? null : (referralCode || null), // No referral codes for guest orders
        discount_amount: isGuestOrder ? 0 : referralDiscount, // No referral discount for guest orders
        team_member_credit: 0 // No team member credit for guest orders
      };

      console.log('🛒 Inserting order into database...');
      console.log('🛒 Order data being inserted:', JSON.stringify(orderData, null, 2));
      console.log('🛒 isGuestOrder:', isGuestOrder);
      console.log('🛒 user_id value:', orderData.user_id);
      console.log('🛒 user_id type:', typeof orderData.user_id);
      console.log('🛒 user_id === null:', orderData.user_id === null);
      
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert(orderData)
        .select(`
          id,
          order_number,
          status,
          total_amount,
          created_at
        `)
        .single();

      if (orderError) {
        console.error('❌ Order creation error:', orderError);
        console.error('❌ Order error details:', {
          message: orderError.message,
          details: orderError.details,
          hint: orderError.hint,
          code: orderError.code
        });
        throw new Error(`Failed to create order: ${orderError.message || 'Unknown database error'}`);
      }

      if (!order || !order.id) {
        console.error('❌ Order was not created - no order data returned');
        throw new Error('Order creation failed - no order data returned from database');
      }

      console.log('✅ Order created successfully:', order.order_number, 'ID:', order.id);

      // Create order items (using the exact same pattern as the working CafeScanner)
      const orderItems = Object.values(cart).map((cartItem) => {
        if (!cartItem.item.id) {
          console.error('❌ Missing menu_item_id for item:', cartItem.item);
          throw new Error(`Missing menu item ID for "${cartItem.item.name}". Please remove this item and try again.`);
        }
        return {
          order_id: order.id,
          menu_item_id: cartItem.item.id,
          quantity: cartItem.quantity,
          unit_price: cartItem.item.price,
          total_price: cartItem.item.price * cartItem.quantity,
          special_instructions: cartItem.notes
        };
      });

      console.log('🛒 Creating order items:', orderItems.length, 'items');
      console.log('🛒 Order items data:', orderItems);

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) {
        console.error('❌ Order items creation error:', itemsError);
        console.error('❌ Order items error details:', {
          message: itemsError.message,
          details: itemsError.details,
          hint: itemsError.hint,
          code: itemsError.code
        });
        throw new Error(`Failed to create order items: ${itemsError.message || 'Unknown error'}`);
      }
      
      console.log('✅ Order items created successfully');

      // Track referral usage if referral code was used (skip for guest orders)
      if (!isGuestOrder && user?.id && referralCode && referralValidation?.isValid) {
        try {
          const { referralService } = await import('@/services/referralService');

          await referralService.trackReferralUsage({
            user_id: user.id,
            referral_code_used: referralCode,
            usage_type: 'checkout',
            order_id: order.id,
            discount_applied: referralDiscount,
            team_member_credit: 0.50 // ₹0.50 per order for team member
          });

          console.log('Referral usage tracked successfully:', referralCode);
        } catch (error) {
          console.error('Error tracking referral usage:', error);
          // Don't throw error - referral tracking is optional
        }
      }

      toast({
        title: "Order Placed Successfully!",
        description: `Your order #${order.order_number} has been confirmed. Estimated delivery: 30 minutes.`,
      });

      // Send WhatsApp notification to cafe
      try {
        console.log('📱 [CHECKOUT] Starting WhatsApp notification process...');
        console.log('📱 [CHECKOUT] Order:', order.order_number);
        console.log('📱 [CHECKOUT] Cafe ID:', cafe?.id);
        console.log('📱 [CHECKOUT] Cafe Name:', cafe?.name);
        
        const whatsappService = WhatsAppService.getInstance();
        console.log('📱 [CHECKOUT] WhatsApp service instance created');
        
        // Format order data for WhatsApp
        const orderData = {
          id: order.id,
          order_number: order.order_number,
          customer_name: isGuestOrder ? guestName.trim() : (profile?.full_name || 'Customer'),
          phone_number: phoneNumberToUse || '+91 0000000000',
          delivery_block: deliveryDetails.block || 'N/A',
          total_amount: order.total_amount.toString(),
          created_at: order.created_at,
          items_text: Object.values(cart).map(item => 
            `• ${item.item.name} x${item.quantity} - ₹${(item.item.price * item.quantity).toFixed(2)}`
          ).join('\n'),
          delivery_notes: deliveryDetails.deliveryNotes || '',
          frontend_url: window.location.origin,
          order_items: Object.values(cart).map(item => ({
            quantity: item.quantity,
            menu_item: {
              name: item.item.name,
              price: item.item.price
            },
            total_price: item.item.price * item.quantity
          }))
        };
        
        console.log('📱 [CHECKOUT] Order data formatted:', JSON.stringify(orderData, null, 2));
        console.log('📱 [CHECKOUT] Calling WhatsApp service...');
        
        const whatsappSuccess = await whatsappService.sendOrderNotification(cafe?.id || '', orderData);
        
        console.log('📱 [CHECKOUT] WhatsApp service result:', whatsappSuccess);
        
        if (whatsappSuccess) {
          console.log('✅ [CHECKOUT] WhatsApp notification sent successfully');
        } else {
          console.log('❌ [CHECKOUT] WhatsApp notification failed');
        }
      } catch (whatsappError) {
        console.error('❌ [CHECKOUT] WhatsApp notification error:', whatsappError);
        // Don't fail the order if WhatsApp fails
      }

      // Send push notification to cafe staff (new order) - skip for guest orders
      if (!isGuestOrder && user?.id) {
        try {
          if (import.meta.env.VITE_ENABLE_PUSH_NOTIFICATIONS === 'true') {
            await orderPushNotificationService.sendNewOrderNotificationToCafe({
              orderId: order.id,
              orderNumber: order.order_number,
              userId: user.id,
              cafeId: cartCafeId,
              status: 'received',
              totalAmount: order.total_amount,
              customerName: profile?.full_name || 'Customer',
            });
            console.log('✅ Push notification sent to cafe staff');
          }
        } catch (pushError) {
          console.error('❌ Push notification error:', pushError);
          // Don't fail the order if push notification fails
        }

        // Send push notification to customer (order received) - skip for guest orders
        try {
          if (import.meta.env.VITE_ENABLE_PUSH_NOTIFICATIONS === 'true') {
            await orderPushNotificationService.sendOrderStatusNotification({
              orderId: order.id,
              orderNumber: order.order_number,
              userId: user.id,
              cafeId: cartCafeId,
              status: 'received',
            });
            console.log('✅ Push notification sent to customer');
          }
        } catch (pushError) {
          console.error('❌ Push notification error:', pushError);
          // Don't fail the order if push notification fails
        }
      }

      // Clear the cart after successful order placement
      clearCart();
      console.log('🛒 Cart cleared after successful order placement');

      // Navigate to order confirmation
      navigate(`/order-confirmation/${order.id}`);
          
      } catch (error) {
      console.error('❌ Order placement error:', error);
      console.error('❌ Error details:', {
        error,
        errorType: typeof error,
        errorMessage: error instanceof Error ? error.message : String(error),
        errorStack: error instanceof Error ? error.stack : undefined
      });
      
      // Extract more detailed error message
      let errorMessage = 'Failed to place order';
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'object' && error !== null) {
        // Handle Supabase errors
        if ('message' in error) {
          errorMessage = String(error.message);
        } else if ('details' in error) {
          errorMessage = String(error.details) || errorMessage;
        } else if ('hint' in error) {
          errorMessage = String(error.hint) || errorMessage;
        }
      }
      
      setError(errorMessage || 'Failed to place order. Please check the console for details.');
    } finally {
      setIsLoading(false);
    }
  };


  if (!cart || Object.keys(cart).length === 0 || !cafe) {
  return (
    <div className="min-h-screen bg-background pt-16 pb-24 lg:pb-8">
      <Header />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <AlertCircle className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-foreground mb-2">No Items in Cart</h2>
            <p className="text-muted-foreground mb-4">Please add items to your cart before checkout</p>
            <Button onClick={() => navigate('/cafes')}>
              Browse Cafes
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-16 pb-24 lg:pb-8">
      <Header />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center mb-6">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => {
                // Go back to previous page in browser history
                // This will take user back to where they came from (grocery, cafe menu, home, etc.)
                if (window.history.length > 1) {
                  navigate(-1);
                } else {
                  // Fallback: if no history, go to appropriate page based on cart context
                  const cartCafeName = getCartCafeName();
                  if (cartCafeName?.toLowerCase().includes('24 seven') || cartCafeName?.toLowerCase().includes('grocery')) {
                    navigate('/grabit');
                  } else if (cafe?.slug || cafe?.id) {
                    navigate(`/menu/${cafe.slug || cafe.id}`);
                  } else {
                    navigate('/');
                  }
                }
              }}
              className="mr-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Menu
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Checkout</h1>
              <p className="text-muted-foreground">{cafe.name}</p>
            </div>
          </div>

          {/* Cafe Closed Warning */}
          {cafe?.accepting_orders === false && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Cafe is Closed</AlertTitle>
              <AlertDescription className="flex flex-col gap-3">
                <span>
                  {cafe.name} is currently not accepting orders. You cannot proceed with checkout.
                </span>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      clearCart();
                      navigate('/cafes');
                    }}
                    className="bg-white hover:bg-gray-50"
                  >
                    Clear Cart & Browse Cafes
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => navigate(-1)}
                    className="bg-white hover:bg-gray-50"
                  >
                    Go Back
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Saved Addresses Section - Only show for authenticated users, delivery orders, and non-GHS cafes */}
          {user && !isGuestOrderingAllowed() && cafe?.location_scope !== 'ghs' && (
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Select Delivery Address</h2>
                {selectedSavedAddress && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedSavedAddress(null);
                      setShowManualAddress(true);
                    }}
                  >
                    Enter New Address
                  </Button>
                )}
              </div>
              
              {!showManualAddress ? (
                <>
                  <SavedAddressList 
                    onSelectAddress={handleSelectSavedAddress}
                    selectedAddressId={selectedSavedAddress?.id}
                  />
                  {isOutsideCafe() && deliveryDetails.orderType === 'delivery' && userResidency === 'ghs' && (
                    <>
                      <div className="flex items-center my-4">
                        <div className="flex-grow border-t border-dashed border-gray-300"></div>
                        <span className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">OR</span>
                        <div className="flex-grow border-t border-dashed border-gray-300"></div>
                      </div>
                      <Card 
                        className={`transition-all ${
                          deliveryDetails.deliveryAddress === 'GHS' || deliveryDetails.deliveryAddress === 'GHS Gate'
                            ? 'border-2 border-orange-500 shadow-md' 
                            : 'hover:border-gray-300'
                        }`}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="bg-orange-100 p-2 rounded-full">
                              <MapPin className="h-5 w-5 text-orange-600" />
                            </div>
                            <div className="flex-1">
                              <div className="font-medium text-gray-900">GHS</div>
                              <div className="text-sm text-gray-500">Manipal University Jaipur, GHS</div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                size="sm"
                                onClick={() => {
                                  const isSelected = deliveryDetails.deliveryAddress === 'GHS' || deliveryDetails.deliveryAddress === 'GHS Gate';
                                  if (isSelected) {
                                    // Unselect GHS
                                    setDeliveryDetails(prev => ({
                                      ...prev,
                                      deliveryAddress: '',
                                      deliveryCoordinates: null
                                    }));
                                    toast({
                                      title: 'GHS location unselected',
                                      description: 'Please select or enter a delivery address',
                                    });
                                  } else {
                                    // Select GHS
                                    setDeliveryDetails(prev => ({
                                      ...prev,
                                      deliveryAddress: 'GHS',
                                      deliveryCoordinates: {
                                        lat: 26.8432, // MUJ center coordinates
                                        lng: 75.5659
                                      }
                                    }));
                                    setSelectedSavedAddress(null);
                                    toast({
                                      title: 'GHS location selected',
                                      description: 'Delivering to GHS',
                                    });
                                  }
                                }}
                                className={
                                  (deliveryDetails.deliveryAddress === 'GHS' || deliveryDetails.deliveryAddress === 'GHS Gate')
                                    ? 'bg-gray-400 hover:bg-gray-500'
                                    : 'bg-orange-200 hover:bg-orange-300 text-orange-700'
                                }
                              >
                                {(deliveryDetails.deliveryAddress === 'GHS' || deliveryDetails.deliveryAddress === 'GHS Gate') ? 'Unselect' : 'Select'}
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </>
                  )}
                </>
              ) : (
                <Button
                  variant="outline"
                  onClick={() => setShowManualAddress(false)}
                  className="w-full mb-4"
                >
                  ← Back to Saved Addresses
                </Button>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Order Details */}
            <div className="space-y-6">
              {/* Order Type */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Clock className="w-5 h-5 mr-2" />
                    Order Type
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 gap-4">
                      <div className="flex items-center space-x-2">
                        <input
                          type="radio"
                          id="delivery"
                          name="orderType"
                          value="delivery"
                          checked={deliveryDetails.orderType === 'delivery'}
                          onChange={(e) => setDeliveryDetails(prev => ({ ...prev, orderType: e.target.value, block: '' }))}
                          disabled={!isGroceryOrder() && !isGrabitOrder() && !isOrderTypeAllowed('delivery')}
                        />
                        <Label htmlFor="delivery" className="flex items-center">
                          <MapPin className="w-4 h-4 mr-2" />
                          Delivery
                          {!isGroceryOrder() && !isGrabitOrder() && !isOrderTypeAllowed('delivery') && (
                            <Badge variant="secondary" className="ml-2">Not Available</Badge>
                          )}
                        </Label>
                  </div>

                      {/* Hide takeaway and dine-in for grocery orders and Grabit */}
                      {!isGroceryOrder() && !isGrabitOrder() && (
                        <>
                      <div className="flex items-center space-x-2">
                        <input
                          type="radio"
                          id="takeaway"
                          name="orderType"
                          value="takeaway"
                          checked={deliveryDetails.orderType === 'takeaway'}
                          onChange={(e) => setDeliveryDetails(prev => ({ ...prev, orderType: e.target.value, block: '' }))}
                          disabled={!isOrderTypeAllowed('takeaway')}
                        />
                        <Label htmlFor="takeaway" className="flex items-center">
                          <Clock className="w-4 h-4 mr-2" />
                          Takeaway
                          {!isOrderTypeAllowed('takeaway') && (
                            <Badge variant="secondary" className="ml-2">Not Available</Badge>
                          )}
                        </Label>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <input
                          type="radio"
                          id="dine_in"
                          name="orderType"
                          value="dine_in"
                          checked={deliveryDetails.orderType === 'dine_in'}
                          onChange={(e) => setDeliveryDetails(prev => ({ ...prev, orderType: e.target.value, block: '' }))}
                          disabled={!isOrderTypeAllowed('dine_in')}
                        />
                        <Label htmlFor="dine_in" className="flex items-center">
                          <Clock className="w-4 h-4 mr-2" />
                          Dine In
                          {!isOrderTypeAllowed('dine_in') && (
                            <Badge variant="secondary" className="ml-2">Not Available</Badge>
                          )}
                        </Label>
                      </div>
                        </>
                      )}
                        </div>
                    
                    {/* Time restriction alerts removed - no longer showing delivery/takeaway unavailable messages */}
                  </div>
                </CardContent>
              </Card>

              {/* Guest Order Form - Only for Banna's Chowki dine-in when not logged in */}
              {isGuestOrderingAllowed() && (!user || !profile) && (
                <Card className="border-2 border-orange-200 bg-orange-50/50">
                  <CardHeader>
                    <CardTitle className="flex items-center text-orange-800">
                      <User className="w-5 h-5 mr-2" />
                      Guest Order Information
                    </CardTitle>
                    <p className="text-sm text-orange-700 mt-1">
                      Enter your details to place a dine-in order
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="guestName">Your Name *</Label>
                      <Input
                        id="guestName"
                        type="text"
                        value={guestName}
                        onChange={(e) => setGuestName(e.target.value)}
                        placeholder="Enter your full name"
                        required
                        className="bg-white"
                      />
                      {guestName && guestName.trim().length === 0 && (
                        <p className="text-red-500 text-sm mt-1">Name is required</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="guestPhone">Phone Number *</Label>
                      <Input
                        id="guestPhone"
                        type="tel"
                        value={guestPhone}
                        onChange={(e) => setGuestPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                        placeholder="Enter your 10-digit phone number"
                        required
                        minLength={10}
                        maxLength={10}
                        className="bg-white"
                      />
                      {guestPhone && (() => {
                        const cleanPhone = guestPhone.replace(/\D/g, '');
                        return cleanPhone.length !== 10 && cleanPhone.length !== 12;
                      })() && (
                        <p className="text-red-500 text-sm mt-1">Phone number must be 10 digits</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Order Details - Block/Table, Phone, Notes */}
              {(deliveryDetails.orderType === 'delivery' || deliveryDetails.orderType === 'dine_in' || deliveryDetails.orderType === 'takeaway') && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <MapPin className="w-5 h-5 mr-2" />
                      Order Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Block/Table/Location dropdown - Hide for outside cafe delivery orders */}
                    {!(isOutsideCafe() && deliveryDetails.orderType === 'delivery') && (
                      <div>
                        <Label htmlFor="location">
                          {deliveryDetails.orderType === 'delivery' ? 'Block' : 
                           deliveryDetails.orderType === 'dine_in' ? 'Table Number *' : 
                           'Location'}
                        </Label>
                        <Select 
                          value={deliveryDetails.block} 
                          onValueChange={(value) => setDeliveryDetails(prev => ({ ...prev, block: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder={
                              deliveryDetails.orderType === 'delivery' ? 'Select your block' :
                              deliveryDetails.orderType === 'dine_in' ? 'Select table number' :
                              'Select location'
                            } />
                          </SelectTrigger>
                          <SelectContent>
                            {getLocationOptions(
                              deliveryDetails.orderType,
                              cafe.name,
                              userResidency
                            ).map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    {/* Phone Number - Only show if not a guest order */}
                    {!(isGuestOrderingAllowed() && (!user || !profile)) && (
                      <div>
                        <Label htmlFor="phoneNumber">Phone Number *</Label>
                        <div className="relative">
                          <Input
                            id="phoneNumber"
                            type="tel"
                            value={deliveryDetails.phoneNumber}
                            onChange={(e) => setDeliveryDetails(prev => ({ ...prev, phoneNumber: e.target.value }))}
                            placeholder="Enter your phone number"
                            required
                            minLength={10}
                            maxLength={10}
                          />
                        </div>
                        {deliveryDetails.phoneNumber && (() => {
                          const cleanPhone = deliveryDetails.phoneNumber.replace(/\D/g, '');
                          return cleanPhone.length !== 10 && cleanPhone.length !== 12;
                        })() && (
                          <p className="text-red-500 text-sm mt-1">Phone number must be 10 digits</p>
                        )}
                      </div>
                    )}

                    <div>
                      <Label htmlFor="deliveryNotes">Delivery Notes (Optional)</Label>
                      <Textarea
                        id="deliveryNotes"
                        value={deliveryDetails.deliveryNotes}
                        onChange={(e) => setDeliveryDetails(prev => ({ ...prev, deliveryNotes: e.target.value }))}
                        placeholder="Any special instructions for delivery"
                        rows={3}
                      />
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Referral Code Input - Hidden for guest orders */}
              {!(isGuestOrderingAllowed() && (!user || !profile)) && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Gift className="w-5 h-5 mr-2" />
                      Referral Code
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <Label htmlFor="referral-code" className="text-sm font-medium text-gray-700">
                        Referral Code (Optional)
                      </Label>
                      <ReferralCodeInput
                        value={referralCode}
                        onChange={setReferralCode}
                        onValidation={handleReferralValidation}
                        placeholder="Enter referral code (e.g., TEAM123)"
                        className="w-full"
                      />
                      {referralValidation?.isValid && (
                        <div className="text-sm text-green-600 flex items-center gap-1">
                          <span>✅</span>
                          Valid code! You'll get ₹5 off your order
                        </div>
                      )}
                      {!isUserVerified && referralCode && (
                        <div className="text-sm text-orange-600 flex items-center gap-1">
                          <span>⚠️</span>
                          Please verify your email to use referral codes
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}


              {/* Payment Method */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Banknote className="w-5 h-5 mr-2" />
                    Payment Method
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id="cod"
                        name="paymentMethod"
                        value="cod"
                        checked={deliveryDetails.paymentMethod === 'cod'}
                        onChange={(e) => setDeliveryDetails(prev => ({ ...prev, paymentMethod: e.target.value }))}
                      />
                      <Label htmlFor="cod">Cash on Delivery</Label>
                      </div>
                    </div>
                </CardContent>
              </Card>
            </div>


            {/* Order Summary */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Order Items */}
                  <div className="space-y-3">
                    {Object.values(cart).map((cartItem) => {
                      const isFreeBogoItem = cartItem.item.name.startsWith('FREE ') && cartItem.item.price === 0;
                      
                      return (
           <div 
             key={cartItem.item.id} 
             className={`flex justify-between items-start p-3 rounded-lg border ${
               isFreeBogoItem 
                 ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 shadow-sm' 
                 : 'bg-gray-50 border-gray-200'
             }`}
           >
             <div className="flex-1">
               <div className="flex items-center gap-2">
                 <p className={`font-medium ${isFreeBogoItem ? 'text-green-800' : 'text-gray-900'}`}>
                   {cartItem.item.name}
                 </p>
                 {/* Removed FREE BOGO Badge */}
               </div>
               <div className="flex items-center gap-2 mt-1">
                 <p className="text-sm text-muted-foreground">Qty:</p>
                 <div className="flex items-center gap-1">
                  <Button
                    size="sm"
                    variant="outline"
                    className={`h-6 w-6 p-0 ${isFreeBogoItem ? 'opacity-40 cursor-not-allowed' : ''}`}
                    onClick={
                      isFreeBogoItem
                        ? undefined
                        : () => removeFromCart(cartItem.item.id)
                    }
                    disabled={isFreeBogoItem}
                  >
                     <Minus className="h-3 w-3" />
                   </Button>
                   <span className="text-sm font-medium min-w-[20px] text-center">
                     {cartItem.quantity}
                   </span>
                  <Button
                    size="sm"
                    variant="outline"
                    className={`h-6 w-6 p-0 ${isFreeBogoItem ? 'opacity-40 cursor-not-allowed' : ''}`}
                    onClick={
                      isFreeBogoItem
                        ? undefined
                        : () => addToCart(cartItem.item, 1, cartItem.notes)
                    }
                    disabled={isFreeBogoItem}
                  >
                     <Plus className="h-3 w-3" />
                   </Button>
                 </div>
               </div>
              {isFreeBogoItem && (
                <p className="text-xs text-green-700 mt-1">
                  Quantity is linked to your paid pizza (BOGO offer).
                </p>
              )}
               {cartItem.notes && (
                 <p className="text-xs text-muted-foreground mt-1">Note: {cartItem.notes}</p>
               )}
             </div>
             <div className="text-right">
               <p className={`font-medium ${isFreeBogoItem ? 'text-green-600' : 'text-gray-900'}`}>
                 {isFreeBogoItem ? 'FREE' : `₹${(cartItem.item.price * cartItem.quantity).toFixed(2)}`}
               </p>
               {!isFreeBogoItem && (
                 <p className="text-xs text-muted-foreground">₹{cartItem.item.price} each</p>
               )}
             </div>
           </div>
                      );
                    })}
                  </div>

                  <div className="border-t pt-4 space-y-2">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span>₹{totalAmount}</span>
                    </div>
                    
                    {/* CGST and SGST for Food Court, Pizza Bakers, and Taste of India orders */}
                    {((cafe?.name?.toLowerCase().includes('food court') || 
                      cafe?.name === 'FOOD COURT' ||
                      cafe?.name?.toLowerCase() === 'food court') ||
                      cafe?.name?.toLowerCase().includes('pizza bakers') ||
                      cafe?.name?.toLowerCase().includes('crazy chef') ||
                      cafe?.name?.toLowerCase().includes('taste of india') ||
                      cafe?.name === 'TASTE OF INDIA') && (
                      <>
                        {cgst > 0 && (
                          <div className="flex justify-between items-center text-black">
                            <span>CGST @2.5%</span>
                            <span>+₹{cgst.toFixed(2)}</span>
                          </div>
                        )}
                        {sgst > 0 && (
                          <div className="flex justify-between items-center text-black">
                            <span>SGST @2.5%</span>
                            <span>+₹{sgst.toFixed(2)}</span>
                          </div>
                        )}
                      </>
                    )}
                    
                    {deliveryDetails.orderType === 'delivery' && (
                      <div className="flex justify-between items-center text-black">
                        <span>Delivery Charge</span>
                        <span>+₹{ORDER_CONSTANTS.DELIVERY_CHARGE}</span>
                      </div>
                    )}
                    
                    {/* MUJ FOOD CLUB Discount */}
                    {isEligibleForDiscount && discountAmount > 0 && (
                      <div className="flex justify-between items-center text-green-600">
                        <span className="font-bold">
                          MUJ FOOD CLUB DISCOUNT ({cafe?.name?.toLowerCase().includes('food court') || cafe?.name === 'FOOD COURT' ? '5%' : 
                            cafe?.name === 'COOK HOUSE' ? (deliveryDetails.orderType === 'delivery' ? '10%' : '5%') : 
                            cafe?.name?.toLowerCase().includes('taste of india') ? '10%' : '10%'})
                        </span>
                        <span className="font-bold">-₹{discountAmount.toFixed(2)}</span>
                      </div>
                    )}

                    {/* Referral Discount Display */}
                    {referralDiscount > 0 && (
                      <div className="flex justify-between items-center text-green-600">
                        <span className="font-bold">Referral Discount</span>
                        <span className="font-bold">-₹{referralDiscount.toFixed(2)}</span>
                      </div>
                    )}
                    
                    <div className="border-t pt-2">
                      <div className="flex justify-between text-lg font-bold">
                        <span>Total</span>
                        <span>₹{finalAmount.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Minimum Order Notice */}
                  {!isMinimumOrderMet && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        Minimum order amount is ₹{ORDER_CONSTANTS.MINIMUM_ORDER_AMOUNT}
                      </AlertDescription>
                </Alert>
              )}

                  {/* Order Confirmation Notice */}
                  {deliveryDetails.orderType === 'delivery' && (
                    <div className="mt-2 p-2 bg-green-50 rounded text-xs text-green-700">
                      <strong>Please double-check your order and address details.</strong>
                    </div>
                  )}
                  
                  {/* Takeaway Notice */}
                  {deliveryDetails.orderType === 'takeaway' && (
                    <div className="mt-2 p-2 bg-blue-50 rounded text-xs text-blue-700">
                      <strong>Takeaway:</strong> No delivery charge for takeaway orders
                    </div>
                  )}
                  
                  {/* Dine In Notice */}
                  {deliveryDetails.orderType === 'dine_in' && (
                    <div className="mt-2 p-2 bg-purple-50 rounded text-xs text-purple-700">
                      <strong>Dine In:</strong> No delivery charge for dine-in orders
                    </div>
                  )}

                  {/* Place Order Button */}
              <Button 
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handlePlaceOrder();
                }}
                disabled={isLoading || isCheckingCafeStatus || !isMinimumOrderMet || 
                  cafe?.accepting_orders === false ||
                  (!isGroceryOrder() && !isGrabitOrder() && deliveryDetails.orderType === 'delivery' && !isOrderTypeAllowed('delivery')) ||
                  (!isGroceryOrder() && !isGrabitOrder() && deliveryDetails.orderType === 'dine_in' && !isOrderTypeAllowed('dine_in')) ||
                  (!isGroceryOrder() && !isGrabitOrder() && deliveryDetails.orderType === 'takeaway' && !isOrderTypeAllowed('takeaway'))
                }
                className="w-full"
                size="lg"
                variant="hero"
                type="button"
              >
                    {cafe?.accepting_orders === false ? 'Cafe is Closed - Cannot Place Order' :
                     isCheckingCafeStatus ? 'Checking cafe status...' :
                     isLoading ? 'Placing Order...' :
                     !isMinimumOrderMet ? `Minimum Order ₹${ORDER_CONSTANTS.MINIMUM_ORDER_AMOUNT} Required` :
                     `Place Order - ₹${finalAmount.toFixed(2)}`}
              </Button>

                  {/* Show all errors including accepting_orders errors */}
                  {error && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
      
      {/* Footer - Desktop only (mobile has bottom nav) */}
      <div className="hidden lg:block">
        <Footer />
      </div>
    </div>
  );
};

export default Checkout;
