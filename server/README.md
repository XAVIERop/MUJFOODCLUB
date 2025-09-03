# 🖨️ MUJ Food Club - PIXEL DP80 Thermal Printer Server

This backend service provides direct integration with the PIXEL DP80 thermal receipt printer for automatic receipt generation and printing.

## 🚀 Features

- **Direct PIXEL DP80 Integration**: USB, Serial, and Network connectivity
- **Automatic Receipt Printing**: Queue-based printing system
- **Real-time Status Monitoring**: Printer connection and queue status
- **Error Handling & Retry Logic**: Robust error handling with automatic retries
- **Print Queue Management**: View, clear, and manage print jobs
- **Test Print Support**: Built-in test printing functionality

## 📋 Prerequisites

- **Node.js**: Version 16.0.0 or higher
- **PIXEL DP80 Thermal Printer**: Connected via USB, Serial, or Network
- **Printer Drivers**: Installed and configured on your system
- **Network Access**: If using network connectivity

## 🛠️ Installation

### 1. Clone and Setup
```bash
cd server
npm install
```

### 2. Environment Configuration
```bash
cp env.example .env
# Edit .env with your printer settings
```

### 3. Install Dependencies
```bash
npm install
```

## ⚙️ Configuration

### Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `PORT` | Server port | 3001 | No |
| `NODE_ENV` | Environment mode | development | No |
| `PRINTER_INTERFACE` | Printer interface (USB001, COM1, etc.) | USB001 | Yes |
| `PRINTER_IP` | Network printer IP address | - | If using network |
| `PRINTER_PORT` | Network printer port | 9100 | If using network |

### PIXEL DP80 Connection Methods

#### USB Connection (Recommended)
```bash
PRINTER_INTERFACE=USB001
```

#### Serial Connection
```bash
PRINTER_INTERFACE=COM1  # Windows
PRINTER_INTERFACE=/dev/ttyUSB0  # Linux
PRINTER_INTERFACE=/dev/tty.usbserial  # macOS
```

#### Network Connection
```bash
PRINTER_IP=192.168.1.100
PRINTER_PORT=9100
```

## 🚀 Running the Server

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

### Health Check
```bash
curl http://localhost:3001/health
```

## 📡 API Endpoints

### Health Check
```
GET /health
```

### Printer Status
```
GET /api/thermal-printer/status/:printerId
```

### Print Receipt
```
POST /api/thermal-printer/print
```

### Get Print Queue
```
GET /api/thermal-printer/queue/:printerId
```

### Clear Print Queue
```
DELETE /api/thermal-printer/queue/:printerId/clear
```

### Test Print
```
POST /api/thermal-printer/test
```

## 🔌 PIXEL DP80 Setup

### 1. Physical Connection
- **USB**: Connect via USB cable to your computer
- **Serial**: Connect via RS-232 serial cable
- **Network**: Connect to your network via Ethernet

### 2. Driver Installation
- Download PIXEL DP80 drivers from manufacturer website
- Install drivers for your operating system
- Verify printer appears in system devices

### 3. Test Connection
```bash
# Test print endpoint
curl -X POST http://localhost:3001/api/thermal-printer/test
```

### 4. Verify Status
```bash
# Check printer status
curl http://localhost:3001/api/thermal-printer/status/pixel-dp80-chatkara
```

## 🖨️ Receipt Format

The service generates professional receipts with:

- **Header**: CHATKARA branding and company info
- **Order Details**: Receipt number, date, time, customer info
- **Items List**: Product name, quantity, price, total
- **Totals**: Subtotal, tax (5%), final total
- **Footer**: Thank you message, support info, order status

## 📊 Print Queue Management

### Queue Status
- **Queued**: Job waiting to be processed
- **Printing**: Currently being printed
- **Completed**: Successfully printed
- **Failed**: Failed to print (with retry logic)

### Queue Operations
- **View Queue**: See all pending and completed jobs
- **Clear Queue**: Remove all pending jobs
- **Retry Failed**: Retry failed print jobs
- **Job History**: Track all print attempts

## 🚨 Troubleshooting

### Common Issues

#### Printer Not Connected
```bash
# Check printer status
curl http://localhost:3001/api/thermal-printer/status/pixel-dp80-chatkara

# Verify physical connection
# Check driver installation
# Test with system print test
```

#### Print Jobs Not Processing
```bash
# Check queue status
curl http://localhost:3001/api/thermal-printer/queue/pixel-dp80-chatkara

# Clear queue if stuck
curl -X DELETE http://localhost:3001/api/thermal-printer/queue/pixel-dp80-chatkara/clear
```

#### Network Connection Issues
```bash
# Verify network connectivity
ping <PRINTER_IP>

# Check firewall settings
# Verify port accessibility
```

### Debug Mode
```bash
# Enable debug logging
DEBUG=* npm run dev

# Check server logs for detailed error information
```

## 🔒 Security Considerations

- **API Key Protection**: Use environment variables for sensitive data
- **CORS Configuration**: Restrict access to authorized domains
- **Input Validation**: Validate all print job data
- **Rate Limiting**: Implement rate limiting for print requests
- **Network Security**: Use HTTPS in production

## 📈 Performance Optimization

- **Queue Management**: Efficient job processing
- **Connection Pooling**: Reuse printer connections
- **Error Recovery**: Automatic reconnection and retry
- **Memory Management**: Clean up completed jobs
- **Monitoring**: Track performance metrics

## 🚀 Production Deployment

### 1. Environment Setup
```bash
NODE_ENV=production
PORT=3001
PRINTER_INTERFACE=USB001
```

### 2. Process Management
```bash
# Using PM2
npm install -g pm2
pm2 start server.js --name "thermal-printer"

# Using systemd
sudo systemctl enable thermal-printer
sudo systemctl start thermal-printer
```

### 3. Monitoring
```bash
# Health checks
curl https://yourdomain.com/api/thermal-printer/health

# Log monitoring
tail -f /var/log/thermal-printer.log
```

## 🤝 Integration with Frontend

The frontend automatically detects when this service is available and switches from browser-based printing to direct thermal printer integration.

### Frontend Configuration
```typescript
// The frontend will automatically use this service when available
const thermalPrinterService = new ThermalPrinterService();
await thermalPrinterService.printReceipt(orderData);
```

## 📞 Support

For technical support:
- **Email**: support@mujfoodclub.in
- **Documentation**: Check this README and API endpoints
- **Logs**: Review server logs for detailed error information
- **Testing**: Use test endpoints to verify functionality

## 🔄 Updates and Maintenance

### Regular Maintenance
- **Driver Updates**: Keep printer drivers current
- **Firmware Updates**: Update PIXEL DP80 firmware
- **Paper Management**: Monitor paper levels
- **Connection Testing**: Regular connectivity tests

### Version Updates
```bash
git pull origin main
npm install
npm restart
```

---

**Happy Printing! 🖨️✨**
