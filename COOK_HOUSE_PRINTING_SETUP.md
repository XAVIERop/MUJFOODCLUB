# 🖨️ Cook House Printing Setup Guide

## Simple Thermal Printing for Windows 7

This guide will set up direct thermal printing for Cook House that works perfectly on Windows 7 without any complex cloud services.

---

## 📋 **What You Need**

- ✅ **Cook House Windows 7 computer**
- ✅ **Xprinter connected** (USB or network)
- ✅ **Internet connection** (for POS dashboard)

---

## 🚀 **Step 1: Install Node.js on Windows 7**

1. **Download Node.js for Windows 7**:
   - Go to: https://nodejs.org/dist/v14.21.3/node-v14.21.3-x86.msi
   - Download the **Windows 7 compatible version**

2. **Install Node.js**:
   - Run the downloaded MSI file
   - Follow the installation wizard
   - **Make sure to check "Add to PATH"** during installation

3. **Verify Installation**:
   - Open Command Prompt
   - Type: `node --version`
   - You should see: `v14.21.3` (or similar)

---

## 🖨️ **Step 2: Set Up Print Server**

1. **Copy the print server file**:
   - Copy `local-print-server-cookhouse.js` to the Cook House computer
   - Place it in a folder like `C:\CookHousePrintServer\`

2. **Install required packages**:
   - Open Command Prompt in the folder
   - Run: `npm init -y`
   - Run: `npm install express cors`

3. **Start the print server**:
   - Run: `node local-print-server-cookhouse.js`
   - You should see: `🚀 Print server running on http://localhost:3001`

4. **Keep this running** while using the POS dashboard

---

## ⚙️ **Step 3: Configure Database**

Run this command on your main computer to configure Cook House for direct thermal printing:

```bash
node scripts/setup_direct_thermal_cookhouse.js
```

---

## 🧪 **Step 4: Test Printing**

1. **Open Cook House POS dashboard**
2. **Place a test order**
3. **Click KOT or Receipt buttons**
4. **Check if your Xprinter prints**

---

## 🎯 **How It Works**

1. **POS dashboard** sends print job to local server
2. **Local server** formats content for thermal printer
3. **Windows print dialog** opens with formatted content
4. **Xprinter** receives and prints the job

---

## 🔧 **Troubleshooting**

### **Print Server Not Starting**
- Check if Node.js is installed: `node --version`
- Check if port 3001 is free
- Try running as Administrator

### **Printing Not Working**
- Make sure Xprinter is set as default printer
- Check if Xprinter is connected and powered on
- Verify print server is running

### **Wrong Print Format**
- The server automatically formats for thermal printers
- If format is wrong, check Xprinter paper size settings

---

## 📞 **Support**

If you need help:
1. **Check the console output** in the print server
2. **Verify Xprinter connection**
3. **Test with a simple print job**

---

## 🎉 **Benefits of This Solution**

- ✅ **Works on Windows 7** (no compatibility issues)
- ✅ **No cloud services** (completely local)
- ✅ **No monthly fees** (free to use)
- ✅ **Perfect thermal formatting** (optimized for Xprinter)
- ✅ **Simple setup** (just Node.js + one file)
- ✅ **Reliable printing** (direct communication)

---

**Ready to set up? Follow the steps above and you'll have perfect thermal printing for Cook House!**


