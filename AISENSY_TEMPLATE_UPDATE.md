# Update Aisensy Template for Multiple Parameters

## Current Template (Single Parameter)
```
MUJ Food Club - New Order Alert!
{{1}}
View full details in dashboard
Food Club
```

## New Template (4 Parameters) - Copy This

Go to Aisensy Dashboard → **Template Message** → Edit `order_notification` template

Replace the template content with:

```
MUJ Food Club - New Order Alert!

{{1}}

{{2}}

{{3}}

{{4}}

View full details in dashboard
Food Club
```

## Template Structure

- **{{1}}** = Order number, customer name, phone
- **{{2}}** = Block, time
- **{{3}}** = Items list
- **{{4}}** = Total and notes

## Steps to Update

1. Go to Aisensy Dashboard → **Template Message**
2. Find the `order_notification` template
3. Click **Edit**
4. Replace the content with the new template above (with 4 parameters)
5. **Save** the template
6. **Submit for approval** (if required)
7. Wait for approval (usually instant for existing templates)

## After Template Update

Once the template is updated and approved:
- The code will automatically send 4 separate parameters
- Each parameter will appear on a separate line in WhatsApp
- Bold formatting will work correctly

## Testing

After updating the template:
1. Place a test order to Banna's Chowki
2. Check WhatsApp - you should see the message with separate lines
3. Verify all 4 parameters are displaying correctly

