const express = require('express');
const cors = require('cors');
const { ThermalPrinter, PrinterTypes } = require('node-thermal-printer');
const net = require('net');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Thermal Printer Server is running',
    timestamp: new Date().toISOString(),
    methods: [
      'Local Print Server',
      'Direct Network Printing',
      'USB Printing',
      'File Generation'
    ]
  });
});

// Configuration endpoint
app.get('/config', (req, res) => {
  res.json({
    server: 'Thermal Printer Server',
    version: '2.0.0',
    endpoints: {
      health: '/health',
      config: '/config',
      print: '/print',
      test: '/test',
      printers: '/printers'
    },
    supportedPrinters: [
      'EPSON TM-T82 (Network/USB)',
      'Pixel Thermal (USB)',
      'Star TSP143 (USB)',
      'Citizen CTS310 (USB)',
      'Any ESC/POS compatible printer'
    ],
    features: [
      'Direct thermal printing',
      'No browser dependencies',
      'Raw ESC/POS commands',
      'Auto paper cutting',
      'Cafe-specific formatting'
    ]
  });
});

// List available printers
app.get('/printers', async (req, res) => {
  try {
    const printers = [];
    
    // Check for network printers (common IPs)
    const commonIPs = [
      '192.168.1.100',
      '192.168.1.101',
      '192.168.0.100',
      '192.168.0.101',
      '10.0.0.100',
      '10.0.0.101'
    ];

    for (const ip of commonIPs) {
      try {
        const isConnected = await checkNetworkPrinter(ip, 9100);
        if (isConnected) {
          printers.push({
            type: 'network',
            ip: ip,
            port: 9100,
            status: 'connected'
          });
        }
      } catch (error) {
        // Printer not available at this IP
      }
    }

    res.json({
      success: true,
      printers: printers,
      message: `Found ${printers.length} network printers`
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
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

    let result;

    // Try different printing methods
    if (printer_ip) {
      // Method 1: Network printing
      result = await printViaNetwork(content, printer_ip, printer_port || 9100);
    } else if (com_port) {
      // Method 2: USB/Serial printing
      result = await printViaUSB(content, com_port, baud_rate || 9600);
    } else {
      // Method 3: Direct raw printing
      result = await printViaRaw(content);
    }

    if (result.success) {
      console.log('✅ Print job completed successfully');
      res.json({ 
        success: true, 
        message: `${type || 'Document'} printed successfully`,
        method: result.method,
        timestamp: new Date().toISOString()
      });
    } else {
      throw new Error(result.error);
    }

  } catch (error) {
    console.error('❌ Print error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message,
      fallback: 'Try using file download method'
    });
  }
});

// Test print endpoint
app.post('/test', async (req, res) => {
  try {
    const testContent = generateTestContent();
    const { printer_ip, printer_port, com_port, baud_rate } = req.body;
    
    let result;

    if (printer_ip) {
      result = await printViaNetwork(testContent, printer_ip, printer_port || 9100);
    } else if (com_port) {
      result = await printViaUSB(testContent, com_port, baud_rate || 9600);
    } else {
      result = await printViaRaw(testContent);
    }

    if (result.success) {
      res.json({ 
        success: true, 
        message: 'Test print completed successfully',
        method: result.method,
        timestamp: new Date().toISOString()
      });
    } else {
      throw new Error(result.error);
    }

  } catch (error) {
    console.error('❌ Test print error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message,
      message: 'Test print failed. Check printer connection.'
    });
  }
});

// Generate print file endpoint (fallback)
app.post('/generate-file', async (req, res) => {
  try {
    const { content, filename } = req.body;
    
    if (!content) {
      return res.status(400).json({ 
        success: false, 
        error: 'Content is required' 
      });
    }

    // Set headers for file download
    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Content-Disposition', `attachment; filename="${filename || 'receipt.prn'}"`);
    
    // Send the content as a file
    res.send(content);
    
    console.log('✅ Print file generated successfully');

  } catch (error) {
    console.error('❌ File generation error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message
    });
  }
});

// Network printing function
async function printViaNetwork(content, ip, port) {
  try {
    console.log(`🌐 Printing via network: ${ip}:${port}`);
    
    const printer = new ThermalPrinter({
      type: PrinterTypes.EPSON,
      interface: `tcp://${ip}:${port}`,
      characterSet: 'SLOVENIA',
      removeSpecialCharacters: false,
      lineCharacter: '='
    });

    const isConnected = await printer.isPrinterConnected();
    if (!isConnected) {
      throw new Error('Printer not connected');
    }

    await printer.print(content);
    await printer.cut();
    
    return { success: true, method: 'network' };
  } catch (error) {
    console.log('Network printing failed:', error.message);
    return { success: false, error: error.message, method: 'network' };
  }
}

// USB printing function
async function printViaUSB(content, comPort, baudRate) {
  try {
    console.log(`🔌 Printing via USB: ${comPort}@${baudRate}`);
    
    const printer = new ThermalPrinter({
      type: PrinterTypes.STAR,
      interface: `usb://${comPort}`,
      characterSet: 'SLOVENIA',
      removeSpecialCharacters: false,
      lineCharacter: '='
    });

    const isConnected = await printer.isPrinterConnected();
    if (!isConnected) {
      throw new Error('USB printer not connected');
    }

    await printer.print(content);
    await printer.cut();
    
    return { success: true, method: 'usb' };
  } catch (error) {
    console.log('USB printing failed:', error.message);
    return { success: false, error: error.message, method: 'usb' };
  }
}

// Raw printing function (direct socket connection)
async function printViaRaw(content) {
  try {
    console.log(`📄 Printing via raw socket`);
    
    // Try common printer IPs
    const commonIPs = ['192.168.1.100', '192.168.1.101', '192.168.0.100'];
    
    for (const ip of commonIPs) {
      try {
        const isConnected = await checkNetworkPrinter(ip, 9100);
        if (isConnected) {
          await sendRawToPrinter(content, ip, 9100);
          return { success: true, method: 'raw_socket' };
        }
      } catch (error) {
        // Try next IP
      }
    }
    
    throw new Error('No network printers found');
  } catch (error) {
    console.log('Raw printing failed:', error.message);
    return { success: false, error: error.message, method: 'raw_socket' };
  }
}

// Check if network printer is available
function checkNetworkPrinter(ip, port) {
  return new Promise((resolve, reject) => {
    const socket = new net.Socket();
    const timeout = 2000;

    socket.setTimeout(timeout);
    socket.on('connect', () => {
      socket.destroy();
      resolve(true);
    });
    socket.on('timeout', () => {
      socket.destroy();
      reject(new Error('Connection timeout'));
    });
    socket.on('error', (err) => {
      reject(err);
    });

    socket.connect(port, ip);
  });
}

// Send raw data to printer
function sendRawToPrinter(content, ip, port) {
  return new Promise((resolve, reject) => {
    const socket = new net.Socket();
    const timeout = 5000;

    socket.setTimeout(timeout);
    socket.on('connect', () => {
      socket.write(content, 'utf8', () => {
        socket.destroy();
        resolve(true);
      });
    });
    socket.on('timeout', () => {
      socket.destroy();
      reject(new Error('Print timeout'));
    });
    socket.on('error', (err) => {
      reject(err);
    });

    socket.connect(port, ip);
  });
}

// Generate test content
function generateTestContent() {
  const now = new Date();
  return `MUJ FOOD CLUB
Thermal Printer Test
========================
This is a test print from
MUJFOODCLUB Thermal Server
========================
Date: ${now.toLocaleDateString()}
Time: ${now.toLocaleTimeString()}
========================
If you can see this,
Thermal printing is working!
========================
Thank you for using
MUJFOODCLUB!
========================
`;
}

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
  console.log(`🚀 Thermal Printer Server running on port ${PORT}`);
  console.log(`📡 Health check: http://localhost:${PORT}/health`);
  console.log(`⚙️  Configuration: http://localhost:${PORT}/config`);
  console.log(`🖨️  Print endpoint: http://localhost:${PORT}/print`);
  console.log(`🧪 Test endpoint: http://localhost:${PORT}/test`);
  console.log(`📋 Printers list: http://localhost:${PORT}/printers`);
  console.log(`📄 File generation: http://localhost:${PORT}/generate-file`);
  console.log('');
  console.log('💡 Features:');
  console.log('  ✅ Direct thermal printing (no browser)');
  console.log('  ✅ Network printer support');
  console.log('  ✅ USB printer support');
  console.log('  ✅ Raw ESC/POS commands');
  console.log('  ✅ Auto paper cutting');
  console.log('  ✅ Cafe-specific formatting');
  console.log('');
  console.log('🔧 Supported Printers:');
  console.log('  - EPSON TM-T82 (Network/USB)');
  console.log('  - Pixel Thermal (USB)');
  console.log('  - Star TSP143 (USB)');
  console.log('  - Any ESC/POS compatible printer');
});

module.exports = app;
