import React from 'react';
import { Edit, Trash2 } from 'lucide-react';

interface OrderTableProps {
  orders: Array<{
    id: string;
    orderDate: string;
    customerName: string;
    items: Array<{
      productId: string;
      quantity: number;
      price: number;
    }>;
    totalAmount: number;
    status: string;
    paymentMethod: string;
  }>;
  onEdit: (orderId: string) => void;
  onDelete: (orderId: string) => void;
  onStatusChange: (orderId: string, newStatus: string) => void;
}

const OrderTable: React.FC<OrderTableProps> = ({
  orders,
  onEdit,
  onDelete,
  onStatusChange,
}) => {
  const orderStatuses = ['pending', 'processing', 'completed', 'cancelled'];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100';
      case 'cancelled':
        return 'bg-red-100';
      case 'processing':
        return 'bg-yellow-100';
      default:
        return 'bg-gray-100';
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {orders.map((order) => (
            <tr key={order.id}>
              <td className="px-6 py-4 whitespace-nowrap text-sm">{order.id}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">
                {new Date(order.orderDate).toLocaleDateString()}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">{order.customerName}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">
                HTG {order.totalAmount.toFixed(2)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">
                <select
                  value={order.status}
                  onChange={(e) => onStatusChange(order.id, e.target.value)}
                  className={`rounded p-1 ${getStatusColor(order.status)}`}
                >
                  {orderStatuses.map((status) => (
                    <option key={status} value={status}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </option>
                  ))}
                </select>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">{order.paymentMethod}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">
                <button
                  onClick={() => onEdit(order.id)}
                  className="text-blue-600 hover:text-blue-900 mr-2"
                >
                  <Edit size={18} />
                </button>
                <button
                  onClick={() => onDelete(order.id)}
                  className="text-red-600 hover:text-red-900"
                >
                  <Trash2 size={18} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default OrderTable;