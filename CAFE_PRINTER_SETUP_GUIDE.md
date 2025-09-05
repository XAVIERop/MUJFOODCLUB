# 🏪 Cafe Printer Setup Guide

## Overview
This guide helps cafe owners set up professional thermal printing for MUJFOODCLUB orders.

## Prerequisites
- Windows/Mac/Linux computer
- Thermal printer (Epson, Pixel, Star, etc.)
- Internet connection
- Node.js installed

## Step 1: Download Print Service

### Option A: Download from GitHub
```bash
git clone https://github.com/your-repo/mujfoodclub-print-service.git
cd mujfoodclub-print-service
```

### Option B: Manual Setup
1. Create folder: `mujfoodclub-print-service`
2. Download these files:
   - `package.json`
   - `server.js`
   - `README.md`

## Step 2: Install Dependencies
```bash
npm install
```

## Step 3: Configure Your Printer

### For Epson Printers (Food Court, etc.)
Edit `server.js` and update the printer configuration:
```javascript
const printer = new ThermalPrinter({
  type: PrinterTypes.EPSON,
  interface: 'usb:///dev/usb/lp0', // Update this path
  characterSet: 'SLOVENIA',
  removeSpecialCharacters: false,
  lineCharacter: '='
});
```

### For Pixel Printers (Chatkara, etc.)
```javascript
const printer = new ThermalPrinter({
  type: PrinterTypes.STAR,
  interface: 'usb:///dev/usb/lp0', // Update this path
  characterSet: 'SLOVENIA',
  removeSpecialCharacters: false,
  lineCharacter: '='
});
```

### For Network Printers
```javascript
const printer = new ThermalPrinter({
  type: PrinterTypes.EPSON,
  interface: 'tcp://192.168.1.100:9100', // Your printer's IP
  characterSet: 'SLOVENIA',
  removeSpecialCharacters: false,
  lineCharacter: '='
});
```

## Step 4: Find Your Printer Path

### Windows
```bash
# List available printers
wmic printer list brief

# Common paths:
# USB: usb:///dev/usb/lp0
# Network: tcp://192.168.1.100:9100
```

### Mac
```bash
# List available printers
lpstat -p

# Common paths:
# USB: usb:///dev/usb/lp0
# Network: tcp://192.168.1.100:9100
```

### Linux
```bash
# List available printers
lpstat -p

# Common paths:
# USB: usb:///dev/usb/lp0
# Network: tcp://192.168.1.100:9100
```

## Step 5: Test the Setup

### Start the Print Service
```bash
node server.js
```

### Test Print
```bash
curl -X POST http://localhost:8080/test
```

### Check Status
```bash
curl -X GET http://localhost:8080/health
```

## Step 6: Configure MUJFOODCLUB

### For Same Computer Setup
No changes needed - MUJFOODCLUB will automatically connect to `localhost:8080`

### For Network Setup
Update the print service URL in MUJFOODCLUB:
```typescript
// In src/services/localPrintService.ts
private baseUrl = 'http://YOUR_PRINT_SERVICE_IP:8080';
```

## Step 7: Auto-Start (Optional)

### Windows (Task Scheduler)
1. Open Task Scheduler
2. Create Basic Task
3. Set trigger: "When computer starts"
4. Action: Start program
5. Program: `node`
6. Arguments: `C:\path\to\mujfoodclub-print-service\server.js`

### Mac (LaunchAgent)
Create `~/Library/LaunchAgents/com.mujfoodclub.printservice.plist`:
```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.mujfoodclub.printservice</string>
    <key>ProgramArguments</key>
    <array>
        <string>node</string>
        <string>/path/to/mujfoodclub-print-service/server.js</string>
    </array>
    <key>RunAtLoad</key>
    <true/>
</dict>
</plist>
```

### Linux (systemd)
Create `/etc/systemd/system/mujfoodclub-print.service`:
```ini
[Unit]
Description=MUJFOODCLUB Print Service
After=network.target

[Service]
Type=simple
User=your-username
WorkingDirectory=/path/to/mujfoodclub-print-service
ExecStart=/usr/bin/node server.js
Restart=always

[Install]
WantedBy=multi-user.target
```

## Troubleshooting

### Printer Not Found
1. Check printer is connected and powered on
2. Verify printer path in configuration
3. Test with: `curl -X GET http://localhost:8080/config`

### Print Service Not Starting
1. Check port 8080 is not in use
2. Verify Node.js is installed
3. Check dependencies: `npm install`

### Receipts Not Printing
1. Check printer has paper
2. Verify printer is online
3. Test with: `curl -X POST http://localhost:8080/test`

## Support
- Check logs in terminal where you ran `node server.js`
- Test endpoints: `/health`, `/config`, `/test`
- Verify MUJFOODCLUB can reach print service

## Security Notes
- Print service runs on local network only
- No external access required
- All communication is local (localhost or LAN)
