#!/bin/bash

# MUJFOODCLUB Cafe Printer Installation Script
# This script sets up the thermal printer service for cafe owners

echo "🏪 MUJFOODCLUB Cafe Printer Setup"
echo "=================================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Please install Node.js first."
    echo "   Download from: https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js detected: $(node --version)"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm not found. Please install npm first."
    exit 1
fi

echo "✅ npm detected: $(npm --version)"

# Create print service directory
PRINT_SERVICE_DIR="mujfoodclub-print-service"

if [ ! -d "$PRINT_SERVICE_DIR" ]; then
    mkdir "$PRINT_SERVICE_DIR"
    echo "✅ Created print service directory"
else
    echo "✅ Print service directory already exists"
fi

cd "$PRINT_SERVICE_DIR"

# Create package.json
cat > package.json << 'EOF'
{
  "name": "mujfoodclub-print-service",
  "version": "1.0.0",
  "description": "Local print service for MUJFOODCLUB thermal receipts",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "test": "curl -X POST http://localhost:8080/test"
  },
  "dependencies": {
    "express": "^4.18.2",
    "node-thermal-printer": "^4.4.4"
  },
  "keywords": ["thermal", "printer", "receipt", "mujfoodclub"],
  "author": "MUJFOODCLUB",
  "license": "MIT"
}
EOF

echo "✅ Created package.json"

# Create server.js
cat > server.js << 'EOF'
const express = require('express');
const ThermalPrinter = require('node-thermal-printer').printer;
const PrinterTypes = require('node-thermal-printer').types;

const app = express();
app.use(express.json());

// Configure your printer here
const printer = new ThermalPrinter({
  type: PrinterTypes.EPSON, // Change to PrinterTypes.STAR for Pixel printers
  interface: 'usb:///dev/usb/lp0', // Update this path for your printer
  characterSet: 'SLOVENIA',
  removeSpecialCharacters: false,
  lineCharacter: '='
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'MUJFOODCLUB Print Service',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Get available printers
app.get('/config', async (req, res) => {
  try {
    const printers = [{
      id: 'default-thermal',
      name: 'Default Thermal Printer',
      type: 'thermal',
      connection: 'usb',
      isDefault: true
    }];
    
    res.json({ printers, count: printers.length });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Print receipt endpoint
app.post('/print', async (req, res) => {
  try {
    const { receiptData } = req.body;
    
    if (!receiptData) {
      return res.status(400).json({ error: 'Receipt data required' });
    }

    // Format receipt for thermal printing
    const receipt = formatReceipt(receiptData);
    
    // Send to printer
    await printer.print(receipt);
    await printer.cut();
    
    res.json({ success: true, message: 'Receipt printed successfully' });
  } catch (error) {
    console.error('Print error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Test print endpoint
app.post('/test', async (req, res) => {
  try {
    const testReceipt = `MUJ FOOD CLUB
Test Print
========================
This is a test print from
MUJFOODCLUB Print Service
========================
Date: ${new Date().toLocaleDateString()}
Time: ${new Date().toLocaleTimeString()}
========================
If you can see this,
the print service is working!
========================`;

    await printer.print(testReceipt);
    await printer.cut();
    
    res.json({ 
      success: true, 
      message: 'Test print completed',
      content: testReceipt
    });
  } catch (error) {
    console.error('Test print error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Format receipt for thermal printing
function formatReceipt(data) {
  const { order_number, cafe_name, customer_name, items, final_amount } = data;
  
  let receipt = `MUJ FOOD CLUB
${cafe_name}
========================
Order: ${order_number}
Customer: ${customer_name}
========================`;

  items.forEach(item => {
    receipt += `${item.name} x${item.quantity}
  ₹${item.total_price}
`;
  });

  receipt += `========================
Total: ₹${final_amount}
========================
Thank you for ordering!
MUJFOODCLUB`;

  return receipt;
}

const PORT = 8080;
app.listen(PORT, () => {
  console.log(`🚀 MUJFOODCLUB Print Service running on port ${PORT}`);
  console.log(`📋 Health check: http://localhost:${PORT}/health`);
  console.log(`🧪 Test print: http://localhost:${PORT}/test`);
  console.log(`📄 Print receipt: http://localhost:${PORT}/print`);
});

module.exports = app;
EOF

echo "✅ Created server.js"

# Create README.md
cat > README.md << 'EOF'
# MUJFOODCLUB Print Service

This is the local print service for MUJFOODCLUB thermal receipts.

## Quick Start

1. Install dependencies:
   ```bash
   npm install
   ```

2. Configure your printer in server.js:
   - Update the `interface` path for your printer
   - Change `type` to `PrinterTypes.STAR` for Pixel printers

3. Start the service:
   ```bash
   npm start
   ```

4. Test the setup:
   ```bash
   npm test
   ```

## Configuration

### For Epson Printers
```javascript
const printer = new ThermalPrinter({
  type: PrinterTypes.EPSON,
  interface: 'usb:///dev/usb/lp0',
  characterSet: 'SLOVENIA',
  removeSpecialCharacters: false,
  lineCharacter: '='
});
```

### For Pixel Printers
```javascript
const printer = new ThermalPrinter({
  type: PrinterTypes.STAR,
  interface: 'usb:///dev/usb/lp0',
  characterSet: 'SLOVENIA',
  removeSpecialCharacters: false,
  lineCharacter: '='
});
```

## Endpoints

- `GET /health` - Health check
- `GET /config` - Get printer configuration
- `POST /print` - Print receipt
- `POST /test` - Test print

## Troubleshooting

1. Check printer is connected and powered on
2. Verify printer path in configuration
3. Test with: `curl -X POST http://localhost:8080/test`
4. Check logs in terminal where you ran `npm start`

## Support

For support, check the main MUJFOODCLUB documentation or contact the development team.
EOF

echo "✅ Created README.md"

echo ""
echo "🎉 Setup Complete!"
echo "=================="
echo "Next steps:"
echo "1. npm install"
echo "2. Edit server.js to configure your printer"
echo "3. npm start"
echo "4. Test with: npm test"
echo ""
echo "📋 See CAFE_PRINTER_SETUP_GUIDE.md for detailed instructions"
