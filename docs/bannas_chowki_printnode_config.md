# Banna's Chowki PrintNode Configuration

## Current Printer Assignments (Updated)

### KOT Printing (Split by Vegetarian Status)
- **Veg KOT** → Printer ID: `74916694` (VEG PRINTER BANNA)
- **Non-Veg KOT** → Printer ID: `74981237` (NONVEG BANNA)

### Receipt Printing
- **Receipt** → Printer ID: `74916694` (VEG PRINTER BANNA)

## PrintNode Account Details
- **Account Name:** Bannas Chowki
- **Email:** bannaschowki.foodclub@yahoo.com
- **Computer Name:** BANNA
- **Computer ID:** 702348

## Active Printers
1. **VEG PRINTER BANNA** - ID: `74916694`
   - Used for: Veg KOTs and Receipts
   
2. **NONVEG BANNA** - ID: `74981237`
   - Used for: Non-Veg KOTs

## Code Implementation
The configuration is hardcoded in:
- File: `src/services/unifiedPrintService.ts`
- Lines: 376-422 (KOT printing)
- Lines: 599-607 (Receipt printing)

## Removing LAPTOP-ABKKFN5T Device

### Why it exists:
The `LAPTOP-ABKKFN5T` (Computer ID: 702026) is an old/unused device that was previously connected to the PrintNode account. It has 4 printers attached:
- POS58(4) - 74912495 (Default)
- POS58(3) - 74912496
- POS58(8) - 74912585
- POS58(9) - 74912586

### How to Remove:

1. **Via PrintNode Dashboard:**
   - Go to: https://api.printnode.com/app/devices
   - Find the computer "LAPTOP-ABKKFN5T" (ID: 702026)
   - Click the **delete icon** (trash/bin icon) next to the computer name
   - Confirm deletion

2. **Via PrintNode Client (if still installed):**
   - Open PrintNode client on that laptop
   - Go to "Printers" tab
   - Uncheck all printers to prevent them from appearing
   - Uninstall PrintNode client from the laptop

3. **If the laptop is no longer accessible:**
   - The device will automatically be removed from PrintNode after 30 days of inactivity
   - Or manually delete it from the dashboard as described above

### Important Notes:
- Removing the computer will also remove all associated printers
- Make sure you're not using any of those printer IDs (74912495, 74912496, 74912585, 74912586) in your code
- The current active printers (74916694 and 74981237) are on the "BANNA" computer, which should remain

