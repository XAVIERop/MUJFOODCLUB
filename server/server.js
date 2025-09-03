const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));

// PIXEL DP80 Configuration
const PIXEL_DP80_CONFIG = {
  type: 'epson',
  interface: process.env.PRINTER_INTERFACE || 'USB001',
  options: {
    timeout: 3000,
    width: 48,
    characterSet: 'USA',
    removeSpecialCharacters: false,
    lineCharacter: '-'
  }
};

// Printer Manager Class
class PixelDP80Manager {
  constructor() {
    this.printer = null;
    this.isConnected = false;
    this.printQueue = [];
    this.isProcessing = false;
    this.connectionRetries = 0;
    this.maxRetries = 3;
  }

  // Initialize printer connection
  async initialize() {
    try {
      console.log('🔌 Initializing PIXEL DP80 connection...');
      
      // For now, simulate connection (will be replaced with actual printer code)
      this.isConnected = true;
      console.log('✅ PIXEL DP80 connected successfully!');
      
    } catch (error) {
      console.error('Error initializing printer:', error);
      this.scheduleReconnection();
    }
  }

  // Get printer status
  getStatus() {
    return {
      isConnected: this.isConnected,
      isReady: this.isConnected && !this.isProcessing,
      paperStatus: this.isConnected ? 'ok' : 'empty',
      errorMessage: this.isConnected ? null : 'Printer not connected',
      queueLength: this.printQueue.length,
      connectionRetries: this.connectionRetries
    };
  }

  // Add print job to queue
  addToQueue(printJob) {
    const job = {
      id: `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      printJob,
      status: 'queued',
      createdAt: new Date(),
      attempts: 0,
      maxAttempts: 3
    };
    
    this.printQueue.push(job);
    console.log(`📋 Print job added to queue: ${job.id}`);
    
    // Process queue if not already processing
    if (!this.isProcessing) {
      this.processQueue();
    }
    
    return job;
  }

  // Process print queue
  async processQueue() {
    if (this.isProcessing || this.printQueue.length === 0) return;
    
    this.isProcessing = true;
    
    while (this.printQueue.length > 0) {
      const job = this.printQueue[0];
      
      try {
        console.log(`🖨️ Processing print job: ${job.id}`);
        job.status = 'printing';
        job.attempts++;
        
        await this.printReceipt(job.printJob);
        
        job.status = 'completed';
        job.completedAt = new Date();
        console.log(`✅ Print job completed: ${job.id}`);
        
        // Remove completed job
        this.printQueue.shift();
        
      } catch (error) {
        console.error(`❌ Print job failed: ${job.id}`, error);
        job.status = 'failed';
        job.error = error.message;
        
        if (job.attempts < job.maxAttempts) {
          // Move to end of queue for retry
          this.printQueue.push(this.printQueue.shift());
          console.log(`🔄 Job ${job.id} queued for retry (attempt ${job.attempts + 1})`);
        } else {
          // Remove failed job after max attempts
          this.printQueue.shift();
          console.log(`💀 Job ${job.id} failed after ${job.maxAttempts} attempts`);
        }
      }
      
      // Small delay between jobs
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    this.isProcessing = false;
    console.log('📋 Print queue processing completed');
  }

  // Print receipt (simulated for now)
  async printReceipt(printJob) {
    if (!this.isConnected) {
      throw new Error('Printer not connected');
    }
    
    try {
      console.log(`🖨️ Printing receipt for order: ${printJob.orderNumber}`);
      console.log(`Customer: ${printJob.customerName}`);
      console.log(`Items: ${printJob.items.length}`);
      console.log(`Total: ₹${printJob.totalAmount}`);
      
      // Simulate printing delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      console.log(`✅ Receipt printed successfully: ${printJob.orderNumber}`);
      
    } catch (error) {
      console.error('Error printing receipt:', error);
      throw new Error(`Print failed: ${error.message}`);
    }
  }

  // Clear print queue
  clearQueue() {
    const clearedCount = this.printQueue.length;
    this.printQueue = [];
    console.log(`🗑️ Print queue cleared: ${clearedCount} jobs removed`);
    return clearedCount;
  }

  // Get queue status
  getQueueStatus() {
    return {
      queueLength: this.printQueue.length,
      isProcessing: this.isProcessing,
      jobs: this.printQueue.map(job => ({
        id: job.id,
        orderNumber: job.printJob.orderNumber,
        status: job.status,
        createdAt: job.createdAt,
        attempts: job.attempts,
        error: job.error
      }))
    };
  }
}

// Initialize printer manager
const pixelDP80Manager = new PixelDP80Manager();

// API Routes

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    service: 'MUJ Food Club Thermal Printer Service'
  });
});

// Get printer status
app.get('/api/thermal-printer/status/:printerId', (req, res) => {
  if (req.params.printerId === 'pixel-dp80-chatkara') {
    res.json(pixelDP80Manager.getStatus());
  } else {
    res.status(404).json({ error: 'Printer not found' });
  }
});

// Print receipt
app.post('/api/thermal-printer/print', async (req, res) => {
  try {
    const { printerId, printJob, options } = req.body;
    
    if (printerId !== 'pixel-dp80-chatkara') {
      return res.status(404).json({ error: 'Printer not found' });
    }
    
    if (!printJob) {
      return res.status(400).json({ error: 'Print job data required' });
    }
    
    // Add to print queue
    const job = pixelDP80Manager.addToQueue(printJob);
    
    res.json({
      success: true,
      jobId: job.id,
      message: 'Print job added to queue',
      timestamp: new Date().toISOString(),
      queuePosition: pixelDP80Manager.printQueue.length
    });
    
  } catch (error) {
    console.error('Error adding print job:', error);
    res.status(500).json({ 
      error: 'Failed to add print job',
      message: error.message 
    });
  }
});

// Get print queue
app.get('/api/thermal-printer/queue/:printerId', (req, res) => {
  if (req.params.printerId === 'pixel-dp80-chatkara') {
    res.json(pixelDP80Manager.getQueueStatus());
  } else {
    res.status(404).json({ error: 'Printer not found' });
  }
});

// Clear print queue
app.delete('/api/thermal-printer/queue/:printerId/clear', (req, res) => {
  if (req.params.printerId === 'pixel-dp80-chatkara') {
    const clearedCount = pixelDP80Manager.clearQueue();
    res.json({ 
      success: true, 
      message: `Queue cleared: ${clearedCount} jobs removed`,
      timestamp: new Date().toISOString()
    });
  } else {
    res.status(404).json({ error: 'Printer not found' });
  }
});

// Test print endpoint
app.post('/api/thermal-printer/test', async (req, res) => {
  try {
    const testJob = {
      orderId: 'test-001',
      orderNumber: 'TEST001',
      customerName: 'Test Customer',
      customerPhone: '+91 98765 43210',
      customerBlock: 'B1',
      items: [
        { name: 'Test Item 1', quantity: 2, unitPrice: 150, totalPrice: 300 },
        { name: 'Test Item 2', quantity: 1, unitPrice: 200, totalPrice: 200 }
      ],
      totalAmount: 500,
      paymentMethod: 'TEST',
      orderTime: new Date().toISOString(),
      status: 'test'
    };
    
    const job = pixelDP80Manager.addToQueue(testJob);
    
    res.json({
      success: true,
      jobId: job.id,
      message: 'Test print job added to queue',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error creating test print job:', error);
    res.status(500).json({ 
      error: 'Failed to create test print job',
      message: error.message 
    });
  }
});

// Start server
app.listen(PORT, async () => {
  console.log(`🚀 Thermal Printer Server running on port ${PORT}`);
  console.log(`🔌 Initializing PIXEL DP80 connection...`);
  
  // Initialize printer connection
  await pixelDP80Manager.initialize();
  
  console.log(`📋 Server ready to handle print jobs`);
  console.log(`🌐 Health check: http://localhost:${PORT}/health`);
  console.log(`🖨️ Test print: POST http://localhost:${PORT}/api/thermal-printer/test`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🔄 SIGTERM received, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🔄 SIGINT received, shutting down gracefully...');
  process.exit(0);
});
