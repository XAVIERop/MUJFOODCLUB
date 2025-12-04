# Create New Aisensy Campaign with New Template

## Step 1: Create New Template (if not done yet)

1. Go to Aisensy Dashboard → **Template Message**
2. Click **+ Create Template**
3. Fill in:
   - **Template Name:** `order_notification_v2`
   - **Template Type:** Text Message
   - **Category:** UTILITY
   - **Template Content:**
     ```
     MUJ Food Club - New Order Alert!
     
     {{1}}
     
     {{2}}
     
     {{3}}
     
     {{4}}
     
     View full details in dashboard
     Food Club
     ```
4. Fill in **Sample Values:**
   - {{1}}: `Order: BAN000123 | Customer: John Doe | Phone: +919876543210`
   - {{2}}: `Block: B1 | Time: 12:30 PM, 01 Dec, 2025`
   - {{3}}: `Items: Burger x1 - Rs 150, Fries x2 - Rs 100`
   - {{4}}: `Total: Rs 250`
5. **Submit for approval**
6. Wait for approval

## Step 2: Create New API Campaign

1. Go to Aisensy Dashboard → **Campaigns**
2. Click **+Launch** or **Create Campaign**
3. Select **API Campaign**
4. Fill in:
   - **Campaign Name:** `Order Notification V2` (must be different from existing "Order Notification")
   - **Template:** Select your new template `order_notification_v2`
   - **Status:** Set to **Live** (important!)
5. **Save/Deploy** the campaign

## Step 3: Update Code (Optional)

If you used a different campaign name, you can either:
- **Option A:** Keep using "Order Notification" as campaign name in code (if Aisensy allows duplicate names)
- **Option B:** Update the code to use the new campaign name

The code currently uses: `'Order Notification'` as the default campaign name. If your new campaign has a different name, we'll need to update it.

## Step 4: Test

1. Place a test order to Banna's Chowki
2. Check WhatsApp - should see message with 4 separate lines
3. Verify formatting looks good

