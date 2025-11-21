# Table QR Ordering - Next Steps

## ✅ Completed (Phase 1)
- [x] Backend RLS policies for table orders
- [x] Frontend TableOrder page with cart
- [x] Guest form (name, phone, notes)
- [x] Order submission with `order_type = 'table_order'`
- [x] Fixed notification triggers for NULL user_id
- [x] Success confirmation screen
- [x] Route registered in App.tsx

## 🔧 Improvements Needed

### High Priority
1. **POS Dashboard Integration**
   - Highlight table orders with special badge/color
   - Filter by table number
   - Show guest name/phone prominently
   - Test that orders appear in real-time

2. **QR Code Generation**
   - Script to generate QR codes for all cafe tables
   - Format: `/table-order/:cafeSlug/:tableNumber`
   - Downloadable PDFs for printing
   - Include cafe name + table number on QR printout

3. **Order Validation**
   - Verify cafe is accepting orders before showing menu
   - Check table number is valid for that cafe
   - Minimum order amount (if applicable)

### Medium Priority
4. **UI/UX Polish**
   - Loading states for menu fetch
   - Better error messages
   - Disable order button if cafe closed
   - Add item images to menu
   - Category grouping for menu items

5. **Guest Experience**
   - Remember guest details in localStorage (optional)
   - Order tracking page for guests (by order number + phone)
   - SMS/WhatsApp confirmation (if applicable)

6. **Security**
   - Rate limiting on order creation
   - Optional: Add short token to QR to prevent table spoofing
   - Validate table number against cafe's table list

### Low Priority
7. **Analytics**
   - Track table order metrics
   - Popular items per table
   - Average order value for table orders

8. **Staff Features**
   - Mark table as "occupied" when order placed
   - Clear table when order completed
   - Table session management

9. **Multi-order Handling**
   - Allow multiple orders per table
   - Merge orders from same table (optional)
   - Split bills (future)

## Testing Checklist
- [ ] Place order from different cafes
- [ ] Test with invalid cafe slug
- [ ] Test with invalid table number
- [ ] Verify POS dashboard shows table orders
- [ ] Test order status updates
- [ ] Verify receipts include guest info
- [ ] Test cancellation flow
- [ ] Ensure logged-in checkout still works

## Questions to Resolve
- Should we allow multiple simultaneous orders per table?
- Do we need OTP verification for phone numbers?
- Should table orders have different pricing/discounts?
- How to handle tips/service charges?
- Payment integration needed or cash-only for now?

