import React, { useState, useMemo } from 'react';
import { useOrders } from '../context/OrderContext';
import { useSales } from '../context/SalesContext';
import { useUser } from '../context/UserContext';
import { Calendar, Download, Filter, Activity } from 'lucide-react';

interface UserReportProps {
  userId: string;
  username: string;
}

const UserReports: React.FC<UserReportProps> = ({ userId, username }) => {
  const { orders } = useOrders();
  const { sales } = useSales();
  const { activities } = useUser();
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reportType, setReportType] = useState<'all' | 'orders' | 'sales' | 'activities'>('all');

  // Filter and deduplicate activities
  const userActivities = useMemo(() => {
    let filteredActivities = activities.filter(activity => 
      activity.userId === userId &&
      (!startDate || new Date(activity.timestamp) >= new Date(startDate)) &&
      (!endDate || new Date(activity.timestamp) <= new Date(endDate))
    );

    // Create a Map to store unique activities based on their action and normalized details
    const uniqueActivities = new Map();
    
    filteredActivities.forEach(activity => {
      // Normalize the details by removing variable data like timestamps and IDs
      const normalizedDetails = activity.details
        .replace(/\d{2}:\d{2}:\d{2}/g, '') // Remove times
        .replace(/\d{4}-\d{2}-\d{2}/g, '') // Remove dates
        .replace(/[A-Z]+-\d+/g, '') // Remove IDs like ORD-123456
        .trim();

      const key = `${activity.action}-${normalizedDetails}`;

      // For completed commands, only keep the most recent one
      if (!uniqueActivities.has(key) || 
          new Date(activity.timestamp) > new Date(uniqueActivities.get(key).timestamp)) {
        uniqueActivities.set(key, activity);
      }
    });

    return Array.from(uniqueActivities.values())
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [activities, userId, startDate, endDate]);

  // Filter orders and sales, ensuring no duplicates
  const userOrders = useMemo(() => {
    const uniqueOrders = new Map();
    
    orders
      .filter(order => 
        order.createdBy === userId && 
        order.status === 'completed' &&
        (!startDate || new Date(order.orderDate) >= new Date(startDate)) &&
        (!endDate || new Date(order.orderDate) <= new Date(endDate))
      )
      .forEach(order => {
        if (!uniqueOrders.has(order.id)) {
          uniqueOrders.set(order.id, order);
        }
      });

    return Array.from(uniqueOrders.values())
      .sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime());
  }, [orders, userId, startDate, endDate]);

  const userSales = useMemo(() => {
    const uniqueSales = new Map();
    
    sales
      .filter(sale => 
        sale.cashier === username &&
        (!startDate || new Date(sale.date) >= new Date(startDate)) &&
        (!endDate || new Date(sale.date) <= new Date(endDate))
      )
      .forEach(sale => {
        if (!uniqueSales.has(sale.id)) {
          uniqueSales.set(sale.id, sale);
        }
      });

    return Array.from(uniqueSales.values())
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [sales, username, startDate, endDate]);

  const { orderTotal, salesTotal, totalTransactions, totalActivities } = useMemo(() => ({
    orderTotal: userOrders.reduce((sum, order) => sum + order.finalAmount, 0),
    salesTotal: userSales.reduce((sum, sale) => sum + sale.total, 0),
    totalTransactions: userOrders.length + userSales.length,
    totalActivities: userActivities.length
  }), [userOrders, userSales, userActivities]);

  const handleExport = () => {
    const headers = [
      'Date',
      'Type',
      'ID/Action',
      'Details',
      'Amount/Status'
    ];

    const rows = [
      ...userOrders.map(order => [
        new Date(order.orderDate).toLocaleDateString(),
        'Order',
        order.id,
        `Customer: ${order.customerName}`,
        `HTG ${order.finalAmount.toFixed(2)}`
      ]),
      ...userSales.map(sale => [
        new Date(sale.date).toLocaleDateString(),
        'Sale',
        sale.id,
        `Items: ${sale.items.length}`,
        `HTG ${sale.total.toFixed(2)}`
      ]),
      ...userActivities.map(activity => [
        new Date(activity.timestamp).toLocaleDateString(),
        'Activity',
        activity.action,
        activity.details,
        '-'
      ])
    ];

    const csvContent = [
      `User Report - ${username}`,
      `Generated: ${new Date().toLocaleString()}`,
      '',
      'Summary',
      `Total Orders: HTG ${orderTotal.toFixed(2)}`,
      `Total Sales: HTG ${salesTotal.toFixed(2)}`,
      `Total Transactions: ${totalTransactions}`,
      `Total Unique Activities: ${totalActivities}`,
      '',
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `user_report_${username}_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Report for {username}</h2>
        <button
          onClick={handleExport}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        >
          <Download className="inline-block mr-2" size={18} />
          Export Report
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
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
            value={reportType}
            onChange={(e) => setReportType(e.target.value as 'all' | 'orders' | 'sales' | 'activities')}
            className="flex-1 p-2 border rounded"
          >
            <option value="all">All Activities</option>
            <option value="orders">Orders Only</option>
            <option value="sales">Sales Only</option>
            <option value="activities">System Activities</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Total Orders</h3>
          <p className="text-2xl font-bold text-blue-600">HTG {orderTotal.toFixed(2)}</p>
          <p className="text-sm text-gray-600">{userOrders.length} orders completed</p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Total Sales</h3>
          <p className="text-2xl font-bold text-green-600">HTG {salesTotal.toFixed(2)}</p>
          <p className="text-sm text-gray-600">{userSales.length} sales processed</p>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Total Transactions</h3>
          <p className="text-2xl font-bold text-purple-600">{totalTransactions}</p>
          <p className="text-sm text-gray-600">Combined orders and sales</p>
        </div>
        <div className="bg-orange-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Unique Activities</h3>
          <p className="text-2xl font-bold text-orange-600">{totalActivities}</p>
          <p className="text-sm text-gray-600">Distinct recorded actions</p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID/Action</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount/Status</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {(reportType === 'all' || reportType === 'orders') &&
              userOrders.map(order => (
                <tr key={order.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {new Date(order.orderDate).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                      Order
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{order.id}</td>
                  <td className="px-6 py-4 text-sm">Customer: {order.customerName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">HTG {order.finalAmount.toFixed(2)}</td>
                </tr>
              ))}
            {(reportType === 'all' || reportType === 'sales') &&
              userSales.map(sale => (
                <tr key={sale.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {new Date(sale.date).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      Sale
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{sale.id}</td>
                  <td className="px-6 py-4 text-sm">Items: {sale.items.length}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">HTG {sale.total.toFixed(2)}</td>
                </tr>
              ))}
            {(reportType === 'all' || reportType === 'activities') &&
              userActivities.map(activity => (
                <tr key={`${activity.id}-${activity.timestamp}`}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {new Date(activity.timestamp).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-orange-100 text-orange-800">
                      Activity
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{activity.action}</td>
                  <td className="px-6 py-4 text-sm">{activity.details}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">-</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserReports;