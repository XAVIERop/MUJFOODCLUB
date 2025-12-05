# Create New Aisensy Template with 4 Parameters

## Step 1: Create New Template

1. Go to Aisensy Dashboard → **Template Message**
2. Click **+ Create Template** or **New Template**
3. Fill in the details:

   **Template Name:** `order_notification_v2` (or any name you prefer)
   
   **Template Type:** Text Message
   
   **Category:** UTILITY (or MARKETING if UTILITY not available)
   
   **Language:** English
   
   **Template Content:**
   ```
   MUJ Food Club - New Order Alert!
   
   {{1}}
   
   {{2}}
   
   {{3}}
   
   {{4}}
   
   View full details in dashboard
   Food Club
   ```

4. **Submit for approval**
5. Wait for approval (usually takes a few minutes to hours)

## Step 2: Update Campaign to Use New Template

1. Go to Aisensy Dashboard → **Campaigns**
2. Click on **"Order Notification"** campaign
3. Click **Edit** or the edit icon
4. Change **Template** from `order_notification` to `order_notification_v2` (or your new template name)
5. **Save** the campaign
6. Make sure status is still **"Live"**

## Step 3: Update Code (if needed)

If you used a different template name, you can either:
- Keep using campaign name "Order Notification" (it will use whatever template is linked)
- Or update the campaign name in code if you create a new campaign

## Template Structure Explained

- **{{1}}** = Order number, customer name, phone
- **{{2}}** = Block, time  
- **{{3}}** = Items list
- **{{4}}** = Total and notes

Each parameter will appear on a separate line in WhatsApp!

