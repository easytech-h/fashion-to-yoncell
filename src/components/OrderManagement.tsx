import React, { useState } from 'react';
import { useOrders } from '../context/OrderContext';
import { useSales } from '../context/SalesContext';
import { useUser } from '../context/UserContext';
import { Loader2, Search, Plus, Filter, Printer } from 'lucide-react';
import OrderForm from './OrderForm';
import OrderTable from './OrderTable';
import OrderReceipt from './OrderReceipt';

const OrderManagement: React.FC = () => {
  const { orders = [], addOrder, updateOrder, deleteOrder, isLoading } = useOrders();
  const { addSale } = useSales();
  const { currentUser } = useUser();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);
  const [showReceipt, setShowReceipt] = useState(false);
  const [currentOrderReceipt, setCurrentOrderReceipt] = useState<any>(null);

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      await updateOrder(orderId, { status: newStatus });
      
      // If status changed to completed, register as sale
      if (newStatus === 'completed') {
        const order = orders.find(o => o.id === orderId);
        if (order) {
          const sale = {
            items: order.items,
            subtotal: order.totalAmount,
            total: order.finalAmount,
            discount: order.discount || 0,
            paymentReceived: order.advancePayment || 0,
            change: 0,
            cashier: currentUser?.username || 'System',
            storeLocation: 'Main Store'
          };
          
          await addSale(sale);
          setCurrentOrderReceipt(order);
          setShowReceipt(true);
        }
      }
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    if (window.confirm('Are you sure you want to delete this order?')) {
      try {
        await deleteOrder(orderId);
      } catch (error) {
        console.error('Error deleting order:', error);
      }
    }
  };

  const handleEditOrder = (orderId: string) => {
    setSelectedOrder(orderId);
    setShowOrderForm(true);
  };

  const handlePrintReceipt = () => {
    window.print();
  };

  const filteredOrders = orders.filter(order => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = (
      (order.customerName?.toLowerCase() || '').includes(searchLower) ||
      (order.id?.toLowerCase() || '').includes(searchLower)
    );
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin h-8 w-8 text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Order Management</h1>
        <button
          onClick={() => {
            setSelectedOrder(null);
            setShowOrderForm(true);
          }}
          className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
        >
          <Plus className="inline-block mr-2" size={18} />
          New Order
        </button>
      </div>

      <div className="mb-6 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-grow">
            <input
              type="text"
              placeholder="Search orders..."
              className="w-full p-2 pl-10 border rounded"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
          </div>
          
          <div className="flex items-center sm:w-64">
            <Filter className="text-gray-400 mr-2" size={18} />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full p-2 border rounded"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Total Orders</h3>
            <p className="text-2xl font-bold text-gray-900">{orders.length}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Pending Orders</h3>
            <p className="text-2xl font-bold text-yellow-600">
              {orders.filter(o => o.status === 'pending').length}
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Processing Orders</h3>
            <p className="text-2xl font-bold text-blue-600">
              {orders.filter(o => o.status === 'processing').length}
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Completed Orders</h3>
            <p className="text-2xl font-bold text-green-600">
              {orders.filter(o => o.status === 'completed').length}
            </p>
          </div>
        </div>
      </div>

      {filteredOrders.length === 0 ? (
        <div className="text-center py-8 bg-white rounded-lg shadow">
          <p className="text-gray-500">No orders found matching your criteria</p>
        </div>
      ) : (
        <OrderTable
          orders={filteredOrders}
          onEdit={handleEditOrder}
          onDelete={handleDeleteOrder}
          onStatusChange={handleStatusChange}
        />
      )}

      {showOrderForm && (
        <OrderForm
          orderId={selectedOrder || undefined}
          onClose={() => {
            setShowOrderForm(false);
            setSelectedOrder(null);
          }}
        />
      )}

      {showReceipt && currentOrderReceipt && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <OrderReceipt order={currentOrderReceipt} />
            <div className="mt-4 flex justify-center space-x-4">
              <button
                onClick={handlePrintReceipt}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                <Printer className="inline-block mr-2" size={18} />
                Print Receipt
              </button>
              <button
                onClick={() => setShowReceipt(false)}
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderManagement;