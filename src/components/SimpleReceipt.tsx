import React from 'react';

interface OrderItem {
  id: string;
  menu_item_id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  special_instructions?: string;
  menu_item: {
    name: string;
    description: string;
  };
}

interface Order {
  id: string;
  order_number: string;
  status: string;
  total_amount: number;
  created_at: string;
  delivery_block: string;
  customer_name?: string;
  phone_number?: string;
  cafes?: {
    id: string;
    name: string;
    type: string;
  };
}

interface SimpleReceiptProps {
  order: Order;
  orderItems: OrderItem[];
  onClose?: () => void;
}

const SimpleReceipt: React.FC<SimpleReceiptProps> = ({ order, orderItems, onClose }) => {
  
  const printBothReceipts = () => {
    // Print KOT Receipt first
    const kotHTML = generateKOTReceipt();
    const kotWindow = window.open('', '_blank', 'width=300,height=400');
    if (kotWindow) {
      kotWindow.document.write(kotHTML);
      kotWindow.document.close();
      
      // Wait for content to load, then print
      kotWindow.onload = () => {
        setTimeout(() => {
          kotWindow.print();
          
          // Print Customer Receipt after KOT is done
          setTimeout(() => {
            kotWindow.close();
            const customerHTML = generateCustomerReceipt();
            const customerWindow = window.open('', '_blank', 'width=300,height=400');
            if (customerWindow) {
              customerWindow.document.write(customerHTML);
              customerWindow.document.close();
              customerWindow.onload = () => {
                setTimeout(() => {
                  customerWindow.print();
                  setTimeout(() => customerWindow.close(), 1000);
                }, 500);
              };
            }
          }, 2000);
        }, 1000);
      };
    }
  };

  const generateKOTReceipt = () => {
    const currentDate = new Date();
    const dateStr = currentDate.toLocaleDateString('en-GB', { 
      day: '2-digit', 
      month: '2-digit', 
      year: '2-digit' 
    });
    const timeStr = currentDate.toLocaleTimeString('en-GB', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>KOT Receipt</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { margin: 0; padding: 0; font-family: 'Courier New', monospace; }
          @media print {
            body { margin: 0; padding: 0; }
            .receipt { width: 80mm !important; font-family: 'Courier New', monospace !important; font-size: 11px !important; font-weight: bold !important; }
            @page { margin: 0; size: 80mm auto; }
          }
          .receipt { width: 80mm; font-family: 'Courier New', monospace; font-size: 11px; font-weight: bold; padding: 2px; }
          .center { text-align: center; font-weight: bold; }
          .right { text-align: right; font-weight: bold; }
          .separator { border-top: 1px dashed #000; margin: 2px 0; }
          .item-row { display: flex; justify-content: space-between; margin: 1px 0; font-weight: bold; }
          .item-name { flex: 1; font-weight: bold; }
          .item-qty { width: 20px; text-align: right; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="receipt">
          <div class="center">${dateStr} ${timeStr}</div>
          <div class="center">KOT - ${order.order_number.slice(-2)}</div>
          <div class="center">Pick Up</div>
          <div class="separator"></div>
          <div class="item-row">
            <span class="item-name">Item</span>
            <span class="item-qty">Qty.</span>
          </div>
          <div class="separator"></div>
          ${orderItems.map(item => `
            <div class="item-row">
              <span class="item-name">${item.menu_item.name}</span>
              <span class="item-qty">${item.quantity}</span>
            </div>
          `).join('')}
        </div>
      </body>
      </html>
    `;
  };

  const generateCustomerReceipt = () => {
    const currentDate = new Date();
    const dateStr = currentDate.toLocaleDateString('en-GB', { 
      day: '2-digit', 
      month: '2-digit', 
      year: '2-digit' 
    });
    const timeStr = currentDate.toLocaleTimeString('en-GB', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });

    const subtotal = order.total_amount;
    const cgst = (subtotal * 0.025).toFixed(2);
    const sgst = (subtotal * 0.025).toFixed(2);
    const grandTotal = (subtotal * 1.05).toFixed(2);
    const roundOff = (parseFloat(grandTotal) - (subtotal + parseFloat(cgst) + parseFloat(sgst))).toFixed(2);

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Customer Receipt</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { margin: 0; padding: 0; font-family: 'Courier New', monospace; }
          @media print {
            body { margin: 0; padding: 0; }
            .receipt { width: 80mm !important; font-family: 'Courier New', monospace !important; font-size: 10px !important; font-weight: bold !important; }
            @page { margin: 0; size: 80mm auto; }
          }
          .receipt { width: 80mm; font-family: 'Courier New', monospace; font-size: 10px; font-weight: bold; padding: 2px; }
          .center { text-align: center; font-weight: bold; }
          .right { text-align: right; font-weight: bold; }
          .separator { border-top: 1px solid #000; margin: 2px 0; }
          .item-row { display: flex; justify-content: space-between; margin: 1px 0; font-weight: bold; }
          .item-name { flex: 1; font-weight: bold; }
          .item-qty { width: 20px; text-align: center; font-weight: bold; }
          .item-price { width: 35px; text-align: right; font-weight: bold; }
          .item-amount { width: 45px; text-align: right; font-weight: bold; }
          .total-row { display: flex; justify-content: space-between; margin: 1px 0; font-weight: bold; }
          .grand-total { font-weight: bold; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="receipt">
          <div class="center">The Food Court Co</div>
          <div class="center">(MOMO STREET, GOBBLERS, KRISPP, TATA MYBRISTO)</div>
          <div class="center">GSTIN: 08ADNPG4024A1Z2</div>
          <div class="separator"></div>
          <div>Name: ${order.customer_name || order.delivery_block}</div>
          <div>M: ${order.phone_number || 'N/A'}</div>
          <div class="separator"></div>
          <div class="item-row">
            <span>${dateStr} ${timeStr}</span>
            <span class="right">Pick Up</span>
          </div>
          <div class="item-row">
            <span>Cashier: biller</span>
            <span class="right">Bill No.: ${order.order_number}</span>
          </div>
          <div class="center">Token No.: ${order.order_number.slice(-1)}</div>
          <div class="separator"></div>
          <div class="item-row">
            <span class="item-name">Item</span>
            <span class="item-qty">Qty.</span>
            <span class="item-price">Price</span>
            <span class="item-amount">Amount</span>
          </div>
          <div class="separator"></div>
          ${orderItems.map(item => `
            <div class="item-row">
              <span class="item-name">${item.menu_item.name}</span>
              <span class="item-qty">${item.quantity}</span>
              <span class="item-price">${item.unit_price.toFixed(2)}</span>
              <span class="item-amount">${item.total_price.toFixed(2)}</span>
            </div>
          `).join('')}
          <div class="separator"></div>
          <div class="total-row">
            <span>Total Qty: ${orderItems.reduce((sum, item) => sum + item.quantity, 0)}</span>
          </div>
          <div class="total-row">
            <span>Sub Total:</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          <div class="total-row">
            <span>CGST@2.5 2.5%:</span>
            <span>${cgst}</span>
          </div>
          <div class="total-row">
            <span>SGST@2.5 2.5%:</span>
            <span>${sgst}</span>
          </div>
          <div class="total-row">
            <span>Round off:</span>
            <span>+${roundOff}</span>
          </div>
          <div class="separator"></div>
          <div class="total-row grand-total">
            <span>Grand Total:</span>
            <span>₹${grandTotal}</span>
          </div>
          <div class="separator"></div>
          <div>Paid via: Other [UPI]</div>
          <div class="separator"></div>
          <div class="center">Thanks For Visit!!</div>
        </div>
      </body>
      </html>
    `;
  };

  // Auto-print both receipts when component mounts
  React.useEffect(() => {
    printBothReceipts();
    
    // Close the component after printing
    setTimeout(() => {
      if (onClose) {
        onClose();
      }
    }, 3000);
  }, [onClose]);

  return null; // This component doesn't render anything, it just prints
};

export default SimpleReceipt;
