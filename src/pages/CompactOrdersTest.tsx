import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import CompactOrderGrid from '@/components/CompactOrderGrid';

// Mock data for testing
const mockOrders = [
  {
    id: '1',
    order_number: 'CHA000001',
    status: 'received' as const,
    total_amount: 250,
    created_at: new Date(Date.now() - 15 * 60 * 1000).toISOString(), // 15 minutes ago
    delivery_block: 'B1',
    customer_name: 'John Doe',
    phone_number: '9876543210'
  },
  {
    id: '2',
    order_number: 'CHA000002',
    status: 'confirmed' as const,
    total_amount: 180,
    created_at: new Date(Date.now() - 25 * 60 * 1000).toISOString(), // 25 minutes ago
    delivery_block: 'B2',
    customer_name: 'Jane Smith',
    phone_number: '9876543211'
  },
  {
    id: '3',
    order_number: 'CHA000003',
    status: 'preparing' as const,
    total_amount: 320,
    created_at: new Date(Date.now() - 35 * 60 * 1000).toISOString(), // 35 minutes ago
    delivery_block: 'B3',
    customer_name: 'Bob Johnson',
    phone_number: '9876543212'
  },
  {
    id: '4',
    order_number: 'CHA000004',
    status: 'on_the_way' as const,
    total_amount: 150,
    created_at: new Date(Date.now() - 45 * 60 * 1000).toISOString(), // 45 minutes ago
    delivery_block: 'B4',
    customer_name: 'Alice Brown',
    phone_number: '9876543213'
  },
  {
    id: '5',
    order_number: 'CHA000005',
    status: 'completed' as const,
    total_amount: 280,
    created_at: new Date(Date.now() - 120 * 60 * 1000).toISOString(), // 2 hours ago
    delivery_block: 'B5',
    customer_name: 'Charlie Wilson',
    phone_number: '9876543214'
  },
  {
    id: '6',
    order_number: 'CHA000006',
    status: 'received' as const,
    total_amount: 190,
    created_at: new Date(Date.now() - 5 * 60 * 1000).toISOString(), // 5 minutes ago
    delivery_block: 'B6',
    customer_name: 'Diana Davis',
    phone_number: '9876543215'
  },
  {
    id: '7',
    order_number: 'CHA000007',
    status: 'confirmed' as const,
    total_amount: 420,
    created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 minutes ago
    delivery_block: 'B7',
    customer_name: 'Eve Miller',
    phone_number: '9876543216'
  },
  {
    id: '8',
    order_number: 'CHA000008',
    status: 'preparing' as const,
    total_amount: 310,
    created_at: new Date(Date.now() - 40 * 60 * 1000).toISOString(), // 40 minutes ago
    delivery_block: 'B8',
    customer_name: 'Frank Garcia',
    phone_number: '9876543217'
  }
];

const CompactOrdersTest = () => {
  const [orders, setOrders] = useState(mockOrders);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  const handleOrderSelect = (order: any) => {
    setSelectedOrder(order);
    console.log('Selected order:', order);
  };

  const handleStatusUpdate = async (orderId: string, newStatus: any) => {
    console.log('Updating order status:', orderId, 'to', newStatus);
    
    // Update the order status in our mock data
    setOrders(prevOrders => 
      prevOrders.map(order => 
        order.id === orderId 
          ? { ...order, status: newStatus }
          : order
      )
    );

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    console.log('Order status updated successfully');
  };

  const addMockOrder = () => {
    const newOrder = {
      id: Date.now().toString(),
      order_number: `CHA${String(orders.length + 1).padStart(6, '0')}`,
      status: 'received' as const,
      total_amount: Math.floor(Math.random() * 300) + 100,
      created_at: new Date().toISOString(),
      delivery_block: `B${Math.floor(Math.random() * 10) + 1}`,
      customer_name: `Customer ${orders.length + 1}`,
      phone_number: `9876543${String(orders.length + 1).padStart(3, '0')}`
    };
    
    setOrders(prev => [newOrder, ...prev]);
  };

  const clearAllOrders = () => {
    setOrders([]);
    setSelectedOrder(null);
  };

  const resetToMockData = () => {
    setOrders(mockOrders);
    setSelectedOrder(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Compact Orders Test Page</h1>
              <p className="text-gray-600 mt-2">Testing the new CompactOrderGrid component with mock data</p>
            </div>
            <div className="flex items-center space-x-4">
              <Button onClick={addMockOrder} className="bg-green-600 hover:bg-green-700">
                + Add Mock Order
              </Button>
              <Button onClick={resetToMockData} variant="outline">
                Reset Data
              </Button>
              <Button onClick={clearAllOrders} variant="destructive">
                Clear All
              </Button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{orders.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                ₹{orders.reduce((sum, order) => sum + order.total_amount, 0)}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Pending Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {orders.filter(order => !['completed', 'cancelled'].includes(order.status)).length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Completed Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {orders.filter(order => order.status === 'completed').length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* CompactOrderGrid Component */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Compact Order Grid</h2>
          <CompactOrderGrid
            orders={orders}
            onOrderSelect={handleOrderSelect}
            onStatusUpdate={handleStatusUpdate}
            loading={false}
          />
        </div>

        {/* Selected Order Details */}
        {selectedOrder && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Selected Order Details</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <span className="text-sm font-medium text-gray-500">Order Number:</span>
                <p className="text-lg font-semibold">{selectedOrder.order_number}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">Status:</span>
                <p className="text-lg font-semibold capitalize">{selectedOrder.status}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">Amount:</span>
                <p className="text-lg font-semibold text-green-600">₹{selectedOrder.total_amount}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">Block:</span>
                <p className="text-lg font-semibold">{selectedOrder.delivery_block}</p>
              </div>
            </div>
            <div className="mt-4">
              <span className="text-sm font-medium text-gray-500">Customer:</span>
              <p className="text-lg">{selectedOrder.customer_name} - {selectedOrder.phone_number}</p>
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">How to Test:</h3>
          <ul className="text-blue-800 space-y-2">
            <li>• <strong>Click on any order card</strong> to select it and see details below</li>
            <li>• <strong>Use the search bar</strong> to filter orders by order number, customer name, or block</li>
            <li>• <strong>Use status filters</strong> to show only orders with specific statuses</li>
            <li>• <strong>Click the eye icon</strong> on any order to update its status</li>
            <li>• <strong>Add mock orders</strong> to test with more data</li>
            <li>• <strong>Switch between Compact Grid and Detailed List</strong> (if implemented)</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default CompactOrdersTest;
