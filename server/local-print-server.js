const express = require('express');
const cors = require('cors');
const { ThermalPrinter, PrinterTypes } = require('node-thermal-printer');

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Local Print Server is running',
    timestamp: new Date().toISOString()
  });
});

// Configuration endpoint
app.get('/config', (req, res) => {
  res.json({
    server: 'Local Print Server',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      config: '/config',
      print: '/print',
      test: '/test'
    },
    supportedPrinters: [
      'EPSON TM-T82',
      'Pixel Thermal',
      'Star TSP143',
      'Citizen CTS310'
    ]
  });
});

// Main print endpoint
app.post('/print', async (req, res) => {
  try {
    const { content, printer_ip, printer_port, com_port, baud_rate, type } = req.body;
    
    if (!content) {
      return res.status(400).json({ 
        success: false, 
        error: 'Content is required' 
      });
    }

    console.log(`🖨️ Printing ${type || 'document'}...`);
    console.log(`📄 Content length: ${content.length} characters`);

    let printer;
    
    // Configure printer based on connection type
    if (printer_ip) {
      // Network printer
      console.log(`🌐 Using network printer: ${printer_ip}:${printer_port || 9100}`);
      printer = new ThermalPrinter({
        type: PrinterTypes.EPSON,
        interface: `tcp://${printer_ip}:${printer_port || 9100}`,
        characterSet: 'SLOVENIA',
        removeSpecialCharacters: false,
        lineCharacter: '='
      });
    } else if (com_port) {
      // USB/Serial printer
      console.log(`🔌 Using USB printer: ${com_port}@${baud_rate || 9600}`);
      printer = new ThermalPrinter({
        type: PrinterTypes.STAR,
        interface: `usb://${com_port}`,
        characterSet: 'SLOVENIA',
        removeSpecialCharacters: false,
        lineCharacter: '='
      });
    } else {
      // Default printer (system default)
      console.log(`🖨️ Using system default printer`);
      printer = new ThermalPrinter({
        type: PrinterTypes.EPSON,
        interface: 'usb:///dev/usb/lp0', // Linux default
        characterSet: 'SLOVENIA',
        removeSpecialCharacters: false,
        lineCharacter: '='
      });
    }

    // Check if printer is connected
    const isConnected = await printer.isPrinterConnected();
    if (!isConnected) {
      console.log('⚠️ Printer not connected, using fallback');
      return res.json({ 
        success: false, 
        error: 'Printer not connected',
        fallback: 'Use browser printing instead'
      });
    }

    // Print the content
    await printer.print(content);
    
    // Cut paper if supported
    await printer.cut();
    
    console.log('✅ Print job completed successfully');
    
    res.json({ 
      success: true, 
      message: `${type || 'Document'} printed successfully`,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Print error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message,
      fallback: 'Use browser printing instead'
    });
  }
});

// Test print endpoint
app.post('/test', async (req, res) => {
  try {
    const testContent = `MUJ FOOD CLUB
Local Print Server Test
========================
This is a test print from
MUJFOODCLUB Local Print Server
========================
Date: ${new Date().toLocaleDateString()}
Time: ${new Date().toLocaleTimeString()}
========================
If you can see this,
Local Print Server is working!
========================
Thank you for using
MUJFOODCLUB!
========================`;

    const { printer_ip, printer_port, com_port, baud_rate } = req.body;
    
    let printer;
    
    if (printer_ip) {
      printer = new ThermalPrinter({
        type: PrinterTypes.EPSON,
        interface: `tcp://${printer_ip}:${printer_port || 9100}`,
        characterSet: 'SLOVENIA',
        removeSpecialCharacters: false,
        lineCharacter: '='
      });
    } else if (com_port) {
      printer = new ThermalPrinter({
        type: PrinterTypes.STAR,
        interface: `usb://${com_port}`,
        characterSet: 'SLOVENIA',
        removeSpecialCharacters: false,
        lineCharacter: '='
      });
    } else {
      printer = new ThermalPrinter({
        type: PrinterTypes.EPSON,
        interface: 'usb:///dev/usb/lp0',
        characterSet: 'SLOVENIA',
        removeSpecialCharacters: false,
        lineCharacter: '='
      });
    }

    const isConnected = await printer.isPrinterConnected();
    if (!isConnected) {
      return res.json({ 
        success: false, 
        error: 'Printer not connected',
        message: 'Please check printer connection and try again'
      });
    }

    await printer.print(testContent);
    await printer.cut();
    
    res.json({ 
      success: true, 
      message: 'Test print completed successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Test print error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message,
      message: 'Test print failed. Check printer connection.'
    });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Server error:', error);
  res.status(500).json({ 
    success: false, 
    error: 'Internal server error' 
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Local Print Server running on port ${PORT}`);
  console.log(`📡 Health check: http://localhost:${PORT}/health`);
  console.log(`⚙️  Configuration: http://localhost:${PORT}/config`);
  console.log(`🖨️  Print endpoint: http://localhost:${PORT}/print`);
  console.log(`🧪 Test endpoint: http://localhost:${PORT}/test`);
  console.log('');
  console.log('💡 Usage:');
  console.log('  - Install: npm install express cors node-thermal-printer');
  console.log('  - Start: node local-print-server.js');
  console.log('  - Test: curl -X POST http://localhost:8080/test');
  console.log('');
  console.log('🔧 Supported Printers:');
  console.log('  - EPSON TM-T82 (Network/USB)');
  console.log('  - Pixel Thermal (USB)');
  console.log('  - Star TSP143 (USB)');
  console.log('  - Citizen CTS310 (USB)');
});

module.exports = app;



