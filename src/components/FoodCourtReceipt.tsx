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

interface FoodCourtReceiptProps {
  order: Order;
  orderItems: OrderItem[];
  onClose: () => void;
}

const FoodCourtReceipt: React.FC<FoodCourtReceiptProps> = ({ order, orderItems, onClose }) => {
  
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
          @media print {
            body { margin: 0; padding: 0; }
            .receipt { width: 80mm; font-family: monospace; font-size: 12px; }
          }
          .receipt { width: 80mm; font-family: monospace; font-size: 12px; padding: 5px; }
          .center { text-align: center; }
          .right { text-align: right; }
          .separator { border-top: 1px dashed #000; margin: 5px 0; }
          .item-row { display: flex; justify-content: space-between; margin: 2px 0; }
          .item-name { flex: 1; font-size: 14px; font-weight: bold; }
          .item-qty { width: 20px; text-align: right; }
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
          @media print {
            body { margin: 0; padding: 0; }
            .receipt { width: 80mm; font-family: monospace; font-size: 12px; }
          }
          .receipt { width: 80mm; font-family: monospace; font-size: 12px; padding: 5px; }
          .center { text-align: center; }
          .right { text-align: right; }
          .separator { border-top: 1px solid #000; margin: 5px 0; }
          .item-row { display: flex; justify-content: space-between; margin: 2px 0; }
          .item-name { flex: 1; font-size: 14px; font-weight: bold; }
          .item-qty { width: 20px; text-align: center; }
          .item-price { width: 40px; text-align: right; }
          .item-amount { width: 50px; text-align: right; }
          .total-row { display: flex; justify-content: space-between; margin: 2px 0; }
          .grand-total { font-weight: bold; font-size: 14px; }
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
              <span class="item-price">rs${item.unit_price.toFixed(2)}</span>
              <span class="item-amount">rs${item.total_price.toFixed(2)}</span>
            </div>
          `).join('')}
          <div class="separator"></div>
          <div class="total-row">
            <span>Total Qty: ${orderItems.reduce((sum, item) => sum + item.quantity, 0)}</span>
          </div>
          <div class="total-row">
            <span>Sub Total:</span>
            <span>rs${subtotal.toFixed(2)}</span>
          </div>
          <div class="total-row">
            <span>CGST@2.5 2.5%:</span>
            <span>rs${cgst}</span>
          </div>
          <div class="total-row">
            <span>SGST@2.5 2.5%:</span>
            <span>rs${sgst}</span>
          </div>
          <div class="total-row">
            <span>Round off:</span>
            <span>+rs${roundOff}</span>
          </div>
          <div class="separator"></div>
          <div class="total-row grand-total">
            <span>Grand Total:</span>
            <span>rs${grandTotal}</span>
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

  const printBothReceipts = () => {
    // Print KOT Receipt
    const kotHTML = generateKOTReceipt();
    const kotWindow = window.open('', '_blank', 'width=300,height=400');
    if (kotWindow) {
      kotWindow.document.write(kotHTML);
      kotWindow.document.close();
      setTimeout(() => {
        kotWindow.print();
        kotWindow.close();
      }, 500);
    }

    // Print Customer Receipt after a short delay
    setTimeout(() => {
      const customerHTML = generateCustomerReceipt();
      const customerWindow = window.open('', '_blank', 'width=300,height=400');
      if (customerWindow) {
        customerWindow.document.write(customerHTML);
        customerWindow.document.close();
        setTimeout(() => {
          customerWindow.print();
          customerWindow.close();
        }, 500);
      }
    }, 1000);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full mx-4">
        <h2 className="text-xl font-bold mb-4">Print Receipts</h2>
        <p className="text-gray-600 mb-4">
          This will print both receipts for order #{order.order_number}:
        </p>
        <ul className="list-disc list-inside mb-4 text-sm text-gray-600">
          <li>Kitchen Order Ticket (KOT)</li>
          <li>Customer Receipt with GST details</li>
        </ul>
        <div className="flex space-x-3">
          <button
            onClick={printBothReceipts}
            className="flex-1 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Print Both Receipts
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default FoodCourtReceipt;
