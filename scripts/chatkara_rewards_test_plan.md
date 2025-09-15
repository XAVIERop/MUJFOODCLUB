# 🧪 Chatkara Rewards System Testing Plan

## **🎯 TESTING OBJECTIVES**
- Verify rewards system is working correctly for Chatkara
- Test minimum order amount (₹89)
- Test delivery charge (₹10)
- Test WhatsApp notifications
- Test tier-based discounts
- Test points earning and redemption

## **📋 PRE-TEST CHECKLIST**

### **1. Run Database Status Check**
```sql
-- Run in Supabase Dashboard → SQL Editor
-- File: scripts/chatkara_testing_preparation.sql
```

### **2. Verify Chatkara Configuration**
- ✅ Cafe is active and accepting orders
- ✅ WhatsApp phone number configured: `+91 8905962406`
- ✅ Owner account exists and can login
- ✅ Menu items are available

## **🧪 TEST SCENARIOS**

### **SCENARIO 1: Minimum Order Amount Test**
**Objective**: Verify ₹89 minimum order requirement

**Steps**:
1. Add items totaling less than ₹89 (e.g., ₹50)
2. Go to checkout
3. **Expected**: Button shows "Minimum Order ₹89 Required"
4. **Expected**: Red warning message appears
5. Add more items to reach ₹89+
6. **Expected**: Button changes to "Place Order - ₹[amount]"

### **SCENARIO 2: Delivery Charge Test**
**Objective**: Verify ₹10 delivery charge is added

**Steps**:
1. Add items totaling ₹100
2. Go to checkout
3. **Expected**: Order summary shows:
   - Subtotal: ₹100
   - Delivery Charge: +₹10
   - Final Amount: ₹110

### **SCENARIO 3: Rewards System Test**
**Objective**: Verify points earning and tier discounts

**Test Cases**:

#### **Case A: First Order (₹100)**
- **Expected Points**: 5 points (5% of ₹100)
- **Expected Tier**: Foodie (0% discount)
- **Expected WhatsApp**: Owner receives notification

#### **Case B: Second Order (₹200)**
- **Expected Points**: 10 points (5% of ₹200)
- **Expected Tier**: Foodie (0% discount)
- **Expected Total Points**: 15 points

#### **Case C: Large Order (₹500)**
- **Expected Points**: 25 points (5% of ₹500)
- **Expected Tier**: Foodie (0% discount)
- **Expected Total Points**: 40 points

### **SCENARIO 4: Points Redemption Test**
**Objective**: Verify points can be redeemed correctly

**Steps**:
1. Place orders to earn points (e.g., 50 points)
2. Go to checkout with ₹200 order
3. Try to redeem points
4. **Expected**: Max redeemable = 20 points (10% of ₹200)
5. **Expected**: 1 point = ₹1 discount
6. **Expected**: Final amount = ₹200 - 20 + 10 (delivery) = ₹190

### **SCENARIO 5: WhatsApp Notification Test**
**Objective**: Verify owner receives WhatsApp notifications

**Steps**:
1. Place an order
2. Check WhatsApp number: `+91 8905962406`
3. **Expected**: Message format:
```
🍽️ MUJ Food Club - New Order Alert!

📋 Order: #ORD-1234567890
👤 Customer: [Customer Name]
📱 Phone: [Phone Number]
📍 Block: [Block]
💰 Total: ₹[Amount]
⏰ Time: [Timestamp]

📝 Items:
• [Item Name] x[Quantity] - ₹[Price]

🔗 Full Dashboard: https://mujfoodclub.in/pos-dashboard
```

## **🔍 VERIFICATION QUERIES**

### **Check Recent Orders**
```sql
SELECT 
    o.order_number,
    o.total_amount,
    o.status,
    o.created_at,
    p.full_name as customer,
    clp.points_earned,
    clp.current_tier
FROM public.orders o
JOIN public.profiles p ON o.user_id = p.id
JOIN public.cafes c ON o.cafe_id = c.id
LEFT JOIN public.cafe_loyalty_points clp ON o.user_id = clp.user_id AND o.cafe_id = clp.cafe_id
WHERE c.name = 'CHATKARA'
ORDER BY o.created_at DESC
LIMIT 5;
```

### **Check Points Transactions**
```sql
SELECT 
    user_id,
    order_id,
    points_change,
    transaction_type,
    description,
    created_at
FROM public.cafe_loyalty_transactions
WHERE cafe_id = (SELECT id FROM public.cafes WHERE name = 'CHATKARA')
ORDER BY created_at DESC
LIMIT 10;
```

### **Check Tier Calculations**
```sql
SELECT 
    p.full_name,
    clp.points,
    clp.total_spent,
    clp.current_tier,
    clp.monthly_spend_30_days,
    get_tier_discount(clp.current_tier) as discount_percentage
FROM public.cafe_loyalty_points clp
JOIN public.profiles p ON clp.user_id = p.id
WHERE clp.cafe_id = (SELECT id FROM public.cafes WHERE name = 'CHATKARA')
ORDER BY clp.total_spent DESC;
```

## **🚨 EXPECTED ISSUES & SOLUTIONS**

### **Issue 1: Points Not Calculating**
**Solution**: Check if `new_rewards_order_completion_trigger` is active
```sql
SELECT trigger_name FROM information_schema.triggers 
WHERE event_object_table = 'orders' 
AND trigger_name = 'new_rewards_order_completion_trigger';
```

### **Issue 2: Wrong Discount Percentage**
**Solution**: Check `get_tier_discount` function
```sql
SELECT get_tier_discount('foodie'), get_tier_discount('gourmet'), get_tier_discount('connoisseur');
```

### **Issue 3: WhatsApp Not Working**
**Solution**: Check browser console for errors and verify phone number

### **Issue 4: Minimum Order Not Enforced**
**Solution**: Check if `isMinimumOrderMet` validation is working

## **✅ SUCCESS CRITERIA**

- [ ] Minimum order amount (₹89) is enforced
- [ ] Delivery charge (₹10) is added to all orders
- [ ] Points are earned correctly (5% of order amount)
- [ ] Tier discounts work (Foodie: 0%, Gourmet: 7%, Connoisseur: 10%)
- [ ] Points redemption works (max 10% of order)
- [ ] WhatsApp notifications are sent to owner
- [ ] Order completion triggers work correctly
- [ ] Database records are accurate

## **📱 TESTING ACCOUNTS**

### **Test Customer Account**
- Email: `test@muj.manipal.edu`
- Password: `Test123!@#`

### **Chatkara Owner Account**
- Email: `chatkara.owner@mujfoodclub.in`
- Password: `Chatkara1203!@#`
- WhatsApp: `+91 8905962406`

## **🎉 COMPLETION CHECKLIST**

- [ ] All test scenarios completed
- [ ] No errors in browser console
- [ ] Database queries return expected results
- [ ] WhatsApp notifications received
- [ ] Points and discounts calculated correctly
- [ ] Ready for production rollout

---

**🚀 Once all tests pass, Chatkara is ready for student testing!**
