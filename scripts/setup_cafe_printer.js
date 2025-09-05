#!/usr/bin/env node

/**
 * MUJFOODCLUB Cafe Printer Setup Script
 * This script helps cafe owners set up their thermal printer for MUJFOODCLUB
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🏪 MUJFOODCLUB Cafe Printer Setup');
console.log('=====================================\n');

// Check if Node.js is installed
try {
  const nodeVersion = execSync('node --version', { encoding: 'utf8' });
  console.log(`✅ Node.js detected: ${nodeVersion.trim()}`);
} catch (error) {
  console.log('❌ Node.js not found. Please install Node.js first.');
  console.log('   Download from: https://nodejs.org/');
  process.exit(1);
}

// Check if npm is installed
try {
  const npmVersion = execSync('npm --version', { encoding: 'utf8' });
  console.log(`✅ npm detected: ${npmVersion.trim()}`);
} catch (error) {
  console.log('❌ npm not found. Please install npm first.');
  process.exit(1);
}

// Create print service directory
const printServiceDir = path.join(process.cwd(), 'mujfoodclub-print-service');
if (!fs.existsSync(printServiceDir)) {
  fs.mkdirSync(printServiceDir);
  console.log('✅ Created print service directory');
} else {
  console.log('✅ Print service directory already exists');
}

// Create package.json
const packageJson = {
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
};

fs.writeFileSync(
  path.join(printServiceDir, 'package.json'),
  JSON.stringify(packageJson, null, 2)
);
console.log('✅ Created package.json');

// Create server.js
const serverJs = `const express = require('express');
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
    const testReceipt = \`MUJ FOOD CLUB
Test Print
========================
This is a test print from
MUJFOODCLUB Print Service
========================
Date: \${new Date().toLocaleDateString()}
Time: \${new Date().toLocaleTimeString()}
========================
If you can see this,
the print service is working!
========================\`;

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
  
  let receipt = \`MUJ FOOD CLUB
\${cafe_name}
========================
Order: \${order_number}
Customer: \${customer_name}
========================\`;

  items.forEach(item => {
    receipt += \`\${item.name} x\${item.quantity}
  ₹\${item.total_price}
\`;
  });

  receipt += \`========================
Total: ₹\${final_amount}
========================
Thank you for ordering!
MUJFOODCLUB\`;

  return receipt;
}

const PORT = 8080;
app.listen(PORT, () => {
  console.log(\`🚀 MUJFOODCLUB Print Service running on port \${PORT}\`);
  console.log(\`📋 Health check: http://localhost:\${PORT}/health\`);
  console.log(\`🧪 Test print: http://localhost:\${PORT}/test\`);
  console.log(\`📄 Print receipt: http://localhost:\${PORT}/print\`);
});

module.exports = app;`;

fs.writeFileSync(path.join(printServiceDir, 'server.js'), serverJs);
console.log('✅ Created server.js');

// Create README.md
const readme = `# MUJFOODCLUB Print Service

This is the local print service for MUJFOODCLUB thermal receipts.

## Quick Start

1. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`

2. Configure your printer in server.js:
   - Update the \`interface\` path for your printer
   - Change \`type\` to \`PrinterTypes.STAR\` for Pixel printers

3. Start the service:
   \`\`\`bash
   npm start
   \`\`\`

4. Test the setup:
   \`\`\`bash
   npm test
   \`\`\`

## Configuration

### For Epson Printers
\`\`\`javascript
const printer = new ThermalPrinter({
  type: PrinterTypes.EPSON,
  interface: 'usb:///dev/usb/lp0',
  characterSet: 'SLOVENIA',
  removeSpecialCharacters: false,
  lineCharacter: '='
});
\`\`\`

### For Pixel Printers
\`\`\`javascript
const printer = new ThermalPrinter({
  type: PrinterTypes.STAR,
  interface: 'usb:///dev/usb/lp0',
  characterSet: 'SLOVENIA',
  removeSpecialCharacters: false,
  lineCharacter: '='
});
\`\`\`

## Endpoints

- \`GET /health\` - Health check
- \`GET /config\` - Get printer configuration
- \`POST /print\` - Print receipt
- \`POST /test\` - Test print

## Troubleshooting

1. Check printer is connected and powered on
2. Verify printer path in configuration
3. Test with: \`curl -X POST http://localhost:8080/test\`
4. Check logs in terminal where you ran \`npm start\`

## Support

For support, check the main MUJFOODCLUB documentation or contact the development team.`;

fs.writeFileSync(path.join(printServiceDir, 'README.md'), readme);
console.log('✅ Created README.md');

console.log('\n🎉 Setup Complete!');
console.log('==================');
console.log('Next steps:');
console.log('1. cd mujfoodclub-print-service');
console.log('2. npm install');
console.log('3. Edit server.js to configure your printer');
console.log('4. npm start');
console.log('5. Test with: npm test');
console.log('\n📋 See CAFE_PRINTER_SETUP_GUIDE.md for detailed instructions');
