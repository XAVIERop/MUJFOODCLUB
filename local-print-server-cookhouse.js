#!/usr/bin/env node

/**
 * Local Print Server for Cook House
 * Simple Node.js server that handles thermal printing on Windows 7
 * 
 * Installation:
 * 1. Install Node.js on Windows 7 computer
 * 2. Copy this file to the computer
 * 3. Run: node local-print-server-cookhouse.js
 * 4. Keep this running while using POS dashboard
 */

const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Store print jobs
let printQueue = [];
let isPrinting = false;

console.log('🖨️ Cook House Local Print Server Starting...');
console.log('=' .repeat(50));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'running', 
    timestamp: new Date().toISOString(),
    queue: printQueue.length,
    printing: isPrinting
  });
});

// Print endpoint
app.post('/print', async (req, res) => {
  try {
    const { type, content, orderNumber } = req.body;
    
    console.log(`📄 Received print job: ${type} for order ${orderNumber}`);
    
    // Add to queue
    const printJob = {
      id: Date.now(),
      type,
      content,
      orderNumber,
      timestamp: new Date().toISOString()
    };
    
    printQueue.push(printJob);
    
    // Process queue
    await processPrintQueue();
    
    res.json({ 
      success: true, 
      message: 'Print job queued successfully',
      jobId: printJob.id
    });
    
  } catch (error) {
    console.error('❌ Print error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Process print queue
async function processPrintQueue() {
  if (isPrinting || printQueue.length === 0) return;
  
  isPrinting = true;
  
  while (printQueue.length > 0) {
    const job = printQueue.shift();
    await printJob(job);
  }
  
  isPrinting = false;
}

// Print a single job
async function printJob(job) {
  try {
    console.log(`🖨️ Printing ${job.type} for order ${job.orderNumber}...`);
    
    // For Windows 7, we'll use a simple approach
    // This will open the content in the default printer dialog
    const { spawn } = require('child_process');
    
    // Create a temporary file with the print content
    const fs = require('fs');
    const tempFile = path.join(__dirname, `temp_print_${job.id}.txt`);
    
    // Format content for thermal printer
    const formattedContent = formatForThermalPrinter(job.content, job.type);
    
    fs.writeFileSync(tempFile, formattedContent, 'utf8');
    
    // Use Windows print command
    const printCommand = spawn('notepad', ['/p', tempFile], {
      detached: true,
      stdio: 'ignore'
    });
    
    printCommand.unref();
    
    // Clean up temp file after a delay
    setTimeout(() => {
      try {
        fs.unlinkSync(tempFile);
      } catch (e) {
        console.log('Could not delete temp file:', tempFile);
      }
    }, 5000);
    
    console.log(`✅ ${job.type} printed successfully for order ${job.orderNumber}`);
    
  } catch (error) {
    console.error(`❌ Failed to print ${job.type} for order ${job.orderNumber}:`, error);
  }
}

// Format content for thermal printer
function formatForThermalPrinter(content, type) {
  let formatted = '';
  
  if (type === 'KOT') {
    formatted = formatKOT(content);
  } else if (type === 'RECEIPT') {
    formatted = formatReceipt(content);
  } else {
    formatted = content;
  }
  
  return formatted;
}

// Format KOT for thermal printing
function formatKOT(data) {
  const isChatkara = data.cafe_name?.toLowerCase().includes('chatkara');
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-GB');
  const timeStr = now.toLocaleTimeString('en-GB', { hour12: false }).substring(0, 5);
  
  let kot = '';
  kot += '========================================\n';
  kot += '           KOT - ' + data.order_number.slice(-2) + '\n';
  kot += '========================================\n';
  kot += (isChatkara ? '           DELIVERY' : '           PICK UP') + '\n';
  kot += '========================================\n';
  kot += `Date: ${dateStr} ${timeStr}\n`;
  kot += '----------------------------------------\n';
  kot += 'ITEM                    QTY\n';
  kot += '----------------------------------------\n';

  data.items.forEach(item => {
    const itemName = item.name.toUpperCase().substring(0, 20).padEnd(20);
    const qty = item.quantity.toString().padStart(2);
    kot += `${itemName} ${qty}\n`;
  });

  kot += '----------------------------------------\n';
  kot += '           THANKS FOR VISIT!!\n';
  kot += `        ${data.cafe_name?.toUpperCase() || 'MUJFOODCLUB'}\n`;
  kot += '========================================\n';
  kot += '\n\n\n'; // Feed paper

  return kot;
}

// Format Receipt for thermal printing
function formatReceipt(data) {
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-GB');
  const timeStr = now.toLocaleTimeString('en-GB', { hour12: false }).substring(0, 5);
  
  let receipt = '';
  receipt += '========================================\n';
  receipt += `        ${data.cafe_name?.toUpperCase() || 'MUJ FOOD CLUB'}\n`;
  receipt += '========================================\n';
  receipt += `Name: ${data.customer_name} (M: ${data.customer_phone})\n`;
  receipt += `Block: ${data.delivery_block}\n`;
  receipt += `Date: ${dateStr} ${timeStr}\n`;
  receipt += `Order: ${data.order_number}\n`;
  receipt += '----------------------------------------\n';
  receipt += 'Item                Qty. Price Amount\n';
  receipt += '----------------------------------------\n';

  data.items.forEach(item => {
    const itemName = item.name.toUpperCase().substring(0, 18).padEnd(18);
    const qty = item.quantity.toString().padStart(2);
    const price = item.unit_price.toFixed(0).padStart(4);
    const amount = item.total_price.toFixed(0).padStart(5);
    receipt += `${itemName} ${qty}    ${price}    ${amount}\n`;
  });

  receipt += '----------------------------------------\n';
  receipt += `Total: ₹${data.final_amount.toFixed(2)}\n`;
  receipt += `Payment: ${data.payment_method.toUpperCase()}\n`;
  receipt += '----------------------------------------\n';
  receipt += '        Thank you for your order!\n';
  receipt += '========================================\n';
  receipt += '\n\n\n'; // Feed paper

  return receipt;
}

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Print server running on http://localhost:${PORT}`);
  console.log(`📡 Ready to receive print jobs from POS dashboard`);
  console.log(`🖨️ Make sure your Xprinter is connected and set as default`);
  console.log('');
  console.log('To test:');
  console.log(`curl -X POST http://localhost:${PORT}/print \\`);
  console.log('  -H "Content-Type: application/json" \\');
  console.log('  -d \'{"type":"KOT","content":{"order_number":"TEST-001","cafe_name":"Cook House","items":[]},"orderNumber":"TEST-001"}\'');
  console.log('');
  console.log('Press Ctrl+C to stop the server');
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down print server...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Shutting down print server...');
  process.exit(0);
});











