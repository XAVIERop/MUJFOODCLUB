# Epson ePOS-Print Integration Setup Guide

## Overview
This guide will help you set up the Epson ePOS-Print integration for your Food Court thermal printer (EPSON TM-T82).

## Prerequisites
- EPSON TM-T82 thermal printer
- Network connection (WiFi or Ethernet)
- Windows/Mac/Linux computer

## Step 1: Download ePOS SDK

1. Go to [Epson ePOS SDK Downloads](https://www.epson-biz.com/modules/pos/index.php?page=sdk_js)
2. Download the **ePOS-Print JavaScript SDK**
3. Extract the files to your project directory

## Step 2: Install ePOS SDK

```bash
# Copy the ePOS SDK files to your project
cp -r epos-print-js-sdk/ src/lib/epson/
```

## Step 3: Configure Printer Network

1. **Connect printer to network:**
   - Connect EPSON TM-T82 to WiFi or Ethernet
   - Note the printer's IP address (usually 192.168.1.xxx)

2. **Test printer connection:**
   ```bash
   ping 192.168.1.100  # Replace with your printer's IP
   ```

## Step 4: Update Configuration

Update the printer IP in `src/services/epsonEposService.ts`:

```typescript
export const epsonEposService = new EpsonEposService({
  printerIP: '192.168.1.100', // Replace with your printer's IP
  printerPort: 8008,
  timeout: 10000
});
```

## Step 5: Install ePOS SDK Dependencies

```bash
npm install --save epson-pos-sdk
```

## Step 6: Update Service Implementation

Replace the mock implementation in `src/services/epsonEposService.ts` with the actual ePOS SDK:

```typescript
import { ePOSPrint } from 'epson-pos-sdk';

class EpsonEposService {
  private printer: any;

  async initialize(): Promise<boolean> {
    try {
      this.printer = new ePOSPrint();
      await this.printer.connect(this.config.printerIP, this.config.printerPort);
      this.isConnected = true;
      return true;
    } catch (error) {
      console.error('Failed to connect to printer:', error);
      return false;
    }
  }

  private async sendToPrinter(content: string): Promise<void> {
    if (!this.printer) throw new Error('Printer not connected');
    
    // Send text to printer
    await this.printer.addText(content);
    await this.printer.addCut();
    await this.printer.send();
  }
}
```

## Step 7: Test the Integration

1. **Start your application:**
   ```bash
   npm run dev
   ```

2. **Check printer status:**
   - Look for "Epson TM-T82 Connected" in the dashboard
   - If offline, click "Connect" button

3. **Test printing:**
   - Create a test order
   - Click the receipt button
   - Both KOT and Customer receipts should print

## Troubleshooting

### Printer Not Connecting
- Check printer IP address
- Ensure printer is on the same network
- Verify printer is powered on
- Check firewall settings

### Print Jobs Not Working
- Verify printer has paper
- Check printer status (online/offline)
- Restart printer if needed
- Check network connectivity

### Receipt Format Issues
- Adjust font sizes in `epsonEposService.ts`
- Modify column widths for better fit
- Test with different paper sizes

## Production Deployment

### For High-Volume Printing:
1. **Use dedicated print server** for better reliability
2. **Implement print queue** for handling multiple orders
3. **Add error handling** for network issues
4. **Monitor printer status** continuously

### Performance Optimization:
```typescript
// Add print queue for high volume
class PrintQueue {
  private queue: PrintJob[] = [];
  private isProcessing = false;

  async addJob(job: PrintJob) {
    this.queue.push(job);
    if (!this.isProcessing) {
      this.processQueue();
    }
  }

  private async processQueue() {
    this.isProcessing = true;
    while (this.queue.length > 0) {
      const job = this.queue.shift();
      await this.printJob(job);
      await new Promise(resolve => setTimeout(resolve, 500)); // Delay between prints
    }
    this.isProcessing = false;
  }
}
```

## Support

- **Epson Support:** https://www.epson-biz.com/modules/pos/
- **Documentation:** https://www.epson-biz.com/modules/pos/index.php?page=sdk_js
- **Community:** Epson Developer Forums

## Benefits of ePOS Integration

✅ **Direct thermal printing** - No browser dependencies
✅ **Perfect formatting** - Optimized for 80mm thermal paper
✅ **High reliability** - Built for commercial use
✅ **Fast printing** - Optimized for high-volume orders
✅ **No paper waste** - Precise paper cutting
✅ **Professional quality** - Commercial-grade output

This integration will handle hundreds of orders per day efficiently!
