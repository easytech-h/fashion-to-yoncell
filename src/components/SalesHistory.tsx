import React, { useState, useMemo } from 'react';
import { useSales } from '../context/SalesContext';
import { useInventory } from '../context/InventoryContext';
import { useAuth } from '../context/AuthContext';
import { Search, Filter, Calendar, Download } from 'lucide-react';

const SalesHistory: React.FC = () => {
  const { sales } = useSales();
  const { products } = useInventory();
  const { user, isAdmin } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Deduplicate sales using a Map
  const uniqueSales = useMemo(() => {
    const salesMap = new Map();
    sales.forEach(sale => {
      if (!salesMap.has(sale.id)) {
        salesMap.set(sale.id, sale);
      }
    });
    return Array.from(salesMap.values());
  }, [sales]);

  const filteredSales = useMemo(() => {
    let filtered = uniqueSales;

    // Filter by user if not admin
    if (!isAdmin && user) {
      filtered = filtered.filter((sale) => sale.cashier === user.fullName);
    }

    // Apply search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter((sale) => {
        const matchesSaleId = sale.id.toLowerCase().includes(searchLower);
        const matchesCashier = sale.cashier.toLowerCase().includes(searchLower);
        const matchesProducts = sale.items.some((item) => {
          const product = products.find((p) => p.id === item.productId);
          return product?.name.toLowerCase().includes(searchLower);
        });
        return matchesSaleId || matchesCashier || matchesProducts;
      });
    }

    // Apply date range filter
    if (startDate) {
      filtered = filtered.filter(
        (sale) => new Date(sale.date) >= new Date(startDate)
      );
    }
    if (endDate) {
      const endDateTime = new Date(endDate);
      endDateTime.setHours(23, 59, 59, 999);
      filtered = filtered.filter((sale) => new Date(sale.date) <= endDateTime);
    }

    // Sort by date (newest first)
    return filtered.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }, [uniqueSales, searchTerm, startDate, endDate, products, isAdmin, user]);

  const getTotalAmount = () => {
    return filteredSales.reduce((sum, sale) => sum + sale.total, 0);
  };

  const getTotalItems = () => {
    return filteredSales.reduce(
      (sum, sale) =>
        sum + sale.items.reduce((itemSum, item) => itemSum + item.quantity, 0),
      0
    );
  };

  const handleExport = () => {
    const headers = [
      'Date',
      'Sale ID',
      'Cashier',
      'Products',
      'Subtotal',
      'Discount',
      'Total',
      'Payment',
      'Change',
    ];

    const rows = filteredSales.map((sale) => [
      new Date(sale.date).toLocaleString('fr-FR'),
      sale.id,
      sale.cashier,
      sale.items
        .map((item) => {
          const product = products.find((p) => p.id === item.productId);
          return `${product?.name} (x${item.quantity})`;
        })
        .join('; '),
      sale.subtotal.toFixed(2),
      sale.discount.toFixed(2),
      sale.total.toFixed(2),
      sale.paymentReceived.toFixed(2),
      sale.change.toFixed(2),
    ]);

    const csvContent = [
      'UP2DATE FASHION - Sales History',
      `Generated: ${new Date().toLocaleString('fr-FR')}`,
      `User: ${user?.fullName || 'N/A'}`,
      '',
      headers.join(','),
      ...rows.map((row) => row.join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `sales_history_${
      new Date().toISOString().split('T')[0]
    }.csv`;
    link.click();
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p className="font-bold">Error:</p>
          <p>You must be logged in to view sales history.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Sales History</h1>
        <button
          onClick={handleExport}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        >
          <Download className="inline-block mr-2" size={18} />
          Export CSV
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search sales..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded focus:ring-2 focus:ring-blue-500"
            />
            <Search
              className="absolute left-3 top-2.5 text-gray-400"
              size={18}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Calendar className="text-gray-400" size={18} />
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="flex-1 p-2 border rounded"
            />
            <span>to</span>
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
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="flex-1 p-2 border rounded"
            >
              <option value="all">All Categories</option>
              {/* Add categories if needed */}
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-2">Total Sales</h3>
          <p className="text-3xl font-bold text-green-600">
            HTG {getTotalAmount().toFixed(2)}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-2">Items Sold</h3>
          <p className="text-3xl font-bold text-blue-600">{getTotalItems()}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-2">Number of Sales</h3>
          <p className="text-3xl font-bold text-purple-600">
            {filteredSales.length}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sale ID
                </th>
                {isAdmin && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cashier
                  </th>
                )}
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Products
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Discount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Net Paid
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredSales.map((sale) => (
                <tr key={`${sale.id}-${sale.date}`}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {new Date(sale.date).toLocaleString('fr-FR')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{sale.id}</td>
                  {isAdmin && (
                    <td className="px-6 py-4 whitespace-nowrap">
                      {sale.cashier}
                    </td>
                  )}
                  <td className="px-6 py-4">
                    <ul className="list-disc list-inside">
                      {sale.items.map((item, index) => {
                        const product = products.find(
                          (p) => p.id === item.productId
                        );
                        return (
                          <li key={`${sale.id}-item-${index}`}>
                            {product?.name} (x{item.quantity})
                          </li>
                        );
                      })}
                    </ul>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    HTG {sale.total.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    HTG {sale.discount.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    HTG {(sale.total - sale.discount).toFixed(2)}
                  </td>
                </tr>
              ))}
              {filteredSales.length === 0 && (
                <tr>
                  <td
                    colSpan={isAdmin ? 7 : 6}
                    className="px-6 py-4 text-center text-gray-500"
                  >
                    No sales found
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

export default SalesHistory;