import React, { useState, useMemo } from 'react';
import { useOrders } from '../context/OrderContext';
import { useInventory } from '../context/InventoryContext';
import { Search, Filter, Calendar, Download } from 'lucide-react';

const OrderHistory: React.FC = () => {
  const { orders } = useOrders();
  const { products } = useInventory();
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      // Search by customer name, order ID, or product names
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = 
        order.customerName.toLowerCase().includes(searchLower) ||
        order.id.toLowerCase().includes(searchLower) ||
        order.items.some(item => {
          const product = products.find(p => p.id === item.productId);
          return product?.name.toLowerCase().includes(searchLower);
        });

      // Date range filter
      const orderDate = new Date(order.orderDate);
      const afterStartDate = !startDate || orderDate >= new Date(startDate);
      const beforeEndDate = !endDate || orderDate <= new Date(endDate);

      // Status filter
      const matchesStatus = statusFilter === 'all' || order.status === statusFilter;

      return matchesSearch && afterStartDate && beforeEndDate && matchesStatus;
    });
  }, [orders, searchTerm, startDate, endDate, statusFilter, products]);

  const getTotalAmount = () => {
    return filteredOrders.reduce((sum, order) => sum + order.totalAmount, 0);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'processing':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleExport = () => {
    const headers = [
      'Order ID',
      'Date',
      'Customer',
      'Products',
      'Total Amount',
      'Status',
      'Payment Method'
    ];

    const rows = filteredOrders.map(order => [
      order.id,
      new Date(order.orderDate).toLocaleDateString(),
      order.customerName,
      order.items.map(item => {
        const product = products.find(p => p.id === item.productId);
        return `${product?.name} (x${item.quantity})`;
      }).join('; '),
      order.totalAmount.toFixed(2),
      order.status,
      order.paymentMethod
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `order_history_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Order History</h1>
        <button
          onClick={handleExport}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        >
          <Download className="inline-block mr-2" size={18} />
          Export CSV
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search orders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded focus:ring-2 focus:ring-blue-500"
            />
            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
          </div>

          <div className="flex items-center space-x-2">
            <Calendar className="text-gray-400" size={18} />
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="flex-1 p-2 border rounded"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Calendar className="text-gray-400" size={18} />
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="flex-1 p-2 border rounded"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Filter className="text-gray-400" size={18} />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="flex-1 p-2 border rounded"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md mb-6">
        <div className="p-4 border-b">
          <div className="flex justify-between items-center">
            <span className="font-semibold">Total Orders: {filteredOrders.length}</span>
            <span className="font-semibold">
              Total Amount: HTG {getTotalAmount().toFixed(2)}
            </span>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Products</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredOrders.map((order) => (
                <tr key={order.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{order.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {new Date(order.orderDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{order.customerName}</td>
                  <td className="px-6 py-4 text-sm">
                    <ul className="list-disc list-inside">
                      {order.items.map((item, index) => {
                        const product = products.find(p => p.id === item.productId);
                        return (
                          <li key={index}>
                            {product?.name} (x{item.quantity})
                          </li>
                        );
                      })}
                    </ul>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    HTG {order.totalAmount.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {order.paymentMethod}
                  </td>
                </tr>
              ))}
              {filteredOrders.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                    No orders found matching your criteria
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default OrderHistory;