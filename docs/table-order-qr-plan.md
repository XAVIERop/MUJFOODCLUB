# Table QR Ordering Plan

## Goals
- Allow diners to scan a table-specific QR and place orders without logging in.
- Orders should automatically appear in the POS dashboard with table context.
- Keep existing logged-in checkout untouched to avoid regressions.

## Scope (Phase 1)
1. **Routing**: `/table-order/:cafeSlug/:tableNumber`
2. **Order Type**: introduce `table_order` to distinguish in DB/POS.
3. **Fields Collected**: guest name, phone, optional notes, auto table number.
4. **Menu Access**: load same menu data filtered by cafe.
5. **Payment**: assume pay-at-counter/cash-on-delivery for now.
6. **Notifications**: reuse existing order notification channel (WhatsApp/push) but tag as table order.

## Backend Tasks
- [ ] Confirm `orders.table_number` usage; ensure it stores numeric string (e.g., `"7"`).
- [ ] Add `order_type` value `table_order` (enum or constrained string).
- [ ] Optional `table_order_code` column for QR verification.
- [ ] Create dedicated insert policy:
  ```sql
  CREATE POLICY "table_orders_insert" ON public.orders
  FOR INSERT TO anon
  WITH CHECK (
    order_type = 'table_order' AND user_id IS NULL AND table_number IS NOT NULL
  );
  ```
- [ ] Limit other policies so table orders bypass user_id checks but stay scoped to specific cafe/table params (e.g., require `cafe_id` in allowed list).
- [ ] Consider storing `guest_phone` separately if `phone_number` already used.

## Frontend Tasks
- [ ] New route + page component (`src/pages/TableOrder.tsx`).
- [ ] Parse `cafeSlug` + `tableNumber` from URL and fetch cafe/menu.
- [ ] Simple cart state (local `useReducer` or reuse `useCart` with scoped provider).
- [ ] Form validation (name required, 10-digit phone, table locked).
- [ ] Submit via Supabase `orders` insert with `order_type = 'table_order'`, `user_id = null`, `table_number` from URL.
- [ ] Show confirmation with order number + instructions.

## QR/Deployment Tasks
- [ ] Define QR URL format and generate list per cafe.
- [ ] Provide downloadable PDFs/PNGs for printing (future script).
- [ ] Security: include short token in QR to prevent table spoofing? (Optional phase 2).

## POS Updates
- [ ] Highlight `table_order` entries (badge "QR" or "Table").
- [ ] Filter/notify by table number for staff.
- [ ] Ensure receipts include guest name/phone/table.

## Testing Checklist
1. Table QR order from multiple cafes.
2. POS dashboard receives order instantly.
3. Cancellation/refund flows unaffected.
4. Logged-in checkout unaffected.
5. RLS validated via Supabase SQL tests.

## Open Questions
- Multiple orders per table simultaneously allowed?
- Should table session expire or be rate-limited?
- Do we need OTP/phone verification?
- How to handle menu availability per table (shared kitchen vs exclusive)?

## Next Steps
1. Finalize backend schema + RLS changes.
2. Scaffold TableOrder page and route.
3. Implement minimal cart + submission.
4. Hook into POS dashboard.

