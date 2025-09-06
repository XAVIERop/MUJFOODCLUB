# 🎯 Rewards/Points System Testing Guide

## 📍 **All Locations Where Rewards/Points System is Implemented**

### **1. 🛒 CHECKOUT PAGE** (`src/pages/Checkout.tsx`)
**What to Test:**
- [ ] **Points Calculation Display**: Shows "Points to Earn: +X pts" 
- [ ] **Points Redemption**: Input field to redeem points (max 10% of order value)
- [ ] **First Order Bonus**: Should only apply to actual first order from each cafe
- [ ] **Tier Discount**: Shows 5% discount for Foodie tier
- [ ] **Final Amount Calculation**: Includes points discount and tier discount

**Test Scenarios:**
1. **First Order from New Cafe**: Should show base points + 50 bonus (if ≥ ₹249)
2. **Subsequent Orders**: Should show only base points (5% of order amount)
3. **Points Redemption**: Try redeeming different amounts (1, 10, max allowed)
4. **Food Court Orders**: Should include CGST, SGST, and delivery fee

---

### **2. 📱 ORDER CONFIRMATION PAGE** (`src/pages/OrderConfirmation.tsx`)
**What to Test:**
- [ ] **Points Earned Display**: Shows "+X pts" in order details
- [ ] **Real-time Updates**: Points should update when order is completed
- [ ] **Status Changes**: Should refresh profile when order status changes to "completed"

**Test Scenarios:**
1. **Order Placed**: Check if correct points are shown
2. **Order Completed**: Verify points are credited to user profile
3. **Real-time Updates**: Check if points update without page refresh

---

### **3. 🏆 REWARDS PAGE** (`src/pages/CafeRewards.tsx`)
**What to Test:**
- [ ] **Cafe-Specific Cards**: Each cafe shows independent points and tier
- [ ] **Tier Display**: Shows Foodie/Gourmet/Connoisseur with correct colors
- [ ] **Points Balance**: Shows points earned at each cafe
- [ ] **Discount Percentage**: Shows tier-based discount (5%/7.5%/10%)
- [ ] **Monthly Spend Progress**: Progress bar towards next tier
- [ ] **Transaction History**: Shows recent transactions per cafe

**Test Scenarios:**
1. **Multiple Cafes**: Order from different cafes and check independent tracking
2. **Tier Progression**: Check if tiers update based on monthly spend
3. **Empty State**: Test with no orders (should show "Start Earning Rewards")

---

### **4. 🏠 HOMEPAGE REWARDS SECTION** (`src/pages/Index.tsx`)
**What to Test:**
- [ ] **Rewards Section**: Shows top 3 cafe rewards or empty state
- [ ] **Call-to-Action**: "Sign In to Start Earning" for non-authenticated users
- [ ] **View All Rewards Button**: Links to full rewards page

**Test Scenarios:**
1. **Not Signed In**: Should show sign-in prompt
2. **No Rewards**: Should show "Start Earning Rewards" message
3. **With Rewards**: Should show top 3 cafe cards

---

### **5. 📊 POS DASHBOARD** (`src/pages/POSDashboard.tsx`)
**What to Test:**
- [ ] **Order Completion**: When marking order as "completed", points should be credited
- [ ] **Points Crediting Function**: `creditPointsToUser()` should update user profile
- [ ] **Real-time Updates**: Dashboard should refresh when orders are updated

**Test Scenarios:**
1. **Complete Order**: Mark order as completed and verify points are credited
2. **Multiple Orders**: Complete multiple orders and check points accumulation

---

### **6. 🏪 CAFE DASHBOARD** (`src/pages/CafeDashboard.tsx`)
**What to Test:**
- [ ] **Order Completion**: Same as POS Dashboard
- [ ] **Points Crediting**: Should credit points when order is completed

---

### **7. 📱 QR CODE DISPLAY** (`src/components/QRCodeDisplay.tsx`)
**What to Test:**
- [ ] **Points Display**: Shows `profile.loyalty_points` in stats section
- [ ] **Total Spent**: Shows total amount spent
- [ ] **Orders Count**: Shows total number of orders

**Note**: This still shows unified points (legacy system)

---

### **8. 🔧 BACKEND FUNCTIONS**

#### **Points Crediting** (`src/pages/POSDashboard.tsx` & `src/pages/CafeDashboard.tsx`)
- [ ] **`creditPointsToUser()`**: Credits points when order is completed
- [ ] **Profile Update**: Updates `loyalty_points` in profiles table
- [ ] **Transaction Record**: Creates entry in `loyalty_transactions` table

#### **Points Calculation** (`src/lib/constants.ts`)
- [ ] **`calculatePointsEarned()`**: Base points (5%) + first order bonus (50)
- [ ] **`getTierByMonthlySpend()`**: Determines tier based on monthly spend
- [ ] **`getTierDiscount()`**: Returns discount percentage for tier

---

### **9. 🗄️ DATABASE TABLES**

#### **`profiles` Table**
- [ ] **`loyalty_points`**: Total accumulated points (legacy, still used)
- [ ] **`loyalty_tier`**: Current tier (legacy)
- [ ] **`total_orders`**: Total number of orders
- [ ] **`total_spent`**: Total amount spent

#### **`orders` Table**
- [ ] **`points_earned`**: Points earned for this specific order
- [ ] **`points_credited`**: Boolean flag when points are credited

#### **`loyalty_transactions` Table**
- [ ] **Transaction Records**: All point earning and redemption transactions

---

## 🧪 **COMPREHENSIVE TESTING CHECKLIST**

### **Phase 1: Basic Points System**
- [ ] Place first order from new cafe (should get bonus)
- [ ] Place second order from same cafe (no bonus)
- [ ] Place order from different cafe (should get bonus again)
- [ ] Verify points calculation: 5% of order amount + 50 bonus (first order only)

### **Phase 2: Points Redemption**
- [ ] Try redeeming 1 point
- [ ] Try redeeming maximum allowed points (10% of order)
- [ ] Try redeeming more than allowed (should show error)
- [ ] Verify final amount calculation includes points discount

### **Phase 3: Real-time Updates**
- [ ] Place order and check confirmation page
- [ ] Complete order from POS/Cafe dashboard
- [ ] Verify points appear in rewards section immediately
- [ ] Check if navbar updates (should be removed now)

### **Phase 4: Cafe-Specific System**
- [ ] Order from multiple cafes
- [ ] Check rewards page shows separate cards for each cafe
- [ ] Verify tier progression is independent per cafe
- [ ] Test monthly spend calculation per cafe

### **Phase 5: Edge Cases**
- [ ] Order amount exactly ₹249 (should get bonus)
- [ ] Order amount ₹248 (should not get bonus)
- [ ] Very small orders (₹10-50)
- [ ] Large orders (₹1000+)
- [ ] Multiple orders in same day
- [ ] Orders across different months

---

## 🚨 **KNOWN ISSUES TO WATCH FOR**

1. **QR Code Display**: Still shows unified points (legacy system)
2. **Profile Table**: Still has `loyalty_points` field (used by QR code)
3. **Real-time Updates**: May need hard refresh in some cases
4. **First Order Detection**: Relies on database query, may be slow

---

## 📝 **TESTING ACCOUNTS**

Use these test accounts for different scenarios:
- **New User**: No previous orders
- **Existing User**: Has orders from some cafes
- **High Spender**: Has orders from multiple cafes with high amounts

---

## 🔍 **DEBUGGING TIPS**

1. **Check Console Logs**: Look for points calculation logs
2. **Database Queries**: Verify `points_earned` in orders table
3. **Profile Updates**: Check `loyalty_points` in profiles table
4. **Real-time Subscriptions**: Check if subscriptions are active
5. **Network Tab**: Monitor API calls for points updates

---

**Happy Testing! 🎉**
