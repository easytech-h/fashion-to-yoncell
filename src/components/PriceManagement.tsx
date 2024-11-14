import React, { useState, useEffect } from 'react';
import { useInventory } from '../context/InventoryContext';
import { useSales } from '../context/SalesContext';
import { useExpenses } from '../context/ExpensesContext';
import { Save, Search, Filter, Printer, Download } from 'lucide-react';
import ExpensesSection from './ExpensesSection';
import PriceManagementTable from './PriceManagementTable';
import ProfitSummaryCards from './ProfitSummaryCards';

const PriceManagement: React.FC = () => {
  const { products, updateProduct } = useInventory();
  const { sales } = useSales();
  const { getTotalExpenses, expenses } = useExpenses();
  const [searchTerm, setSearchTerm] = useState('');
  const [stockFilter, setStockFilter] = useState('all');
  const [pricingData, setPricingData] = useState<any[]>([]);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  useEffect(() => {
    const initialPricingData = products.map(product => ({
      productId: product.id,
      purchasePrice: product.purchasePrice || 0,
      sellingPrice: product.price,
      quantity: product.quantity,
      supplier: product.supplier || ''
    }));
    setPricingData(initialPricingData);
  }, [products]);

  const handlePricingChange = (productId: string, field: string, value: any) => {
    setPricingData(prevData =>
      prevData.map(item =>
        item.productId === productId ? { ...item, [field]: value } : item
      )
    );
    setHasUnsavedChanges(true);
  };

  const calculateTotalNetProfit = () => {
    return pricingData.reduce((total, item) => {
      const netProfit = (item.sellingPrice - item.purchasePrice) * item.quantity;
      return total + netProfit;
    }, 0);
  };

  const calculateTotalRealProfit = () => {
    return sales.reduce((total, sale) => {
      const saleProfit = sale.items.reduce((itemTotal, item) => {
        const pricingItem = pricingData.find(p => p.productId === item.productId);
        if (pricingItem) {
          const itemProfit = (item.price - pricingItem.purchasePrice) * item.quantity;
          return itemTotal + itemProfit;
        }
        return itemTotal;
      }, 0);
      return total + saleProfit;
    }, 0);
  };

  const handleSaveChanges = async () => {
    try {
      for (const item of pricingData) {
        await updateProduct(item.productId, {
          price: item.sellingPrice,
          purchasePrice: item.purchasePrice,
          quantity: item.quantity,
          supplier: item.supplier
        });
      }
      setHasUnsavedChanges(false);
      alert('Pricing changes saved successfully!');
    } catch (error) {
      console.error('Error saving pricing changes:', error);
      alert('Failed to save pricing changes. Please try again.');
    }
  };

  const handlePrint = () => {
    const style = document.createElement('style');
    style.innerHTML = `
      @media print {
        body * {
          visibility: hidden;
        }
        .print-section, .print-section * {
          visibility: visible;
        }
        .print-section {
          position: absolute;
          left: 0;
          top: 0;
          width: 100%;
        }
        .no-print {
          display: none !important;
        }
        .page-break {
          page-break-before: always;
        }
      }
    `;
    document.head.appendChild(style);
    window.print();
    document.head.removeChild(style);
  };

  const handleExport = () => {
    // Prepare pricing data
    const pricingHeaders = [
      'Product Name',
      'Purchase Price',
      'Selling Price',
      'Quantity',
      'Total Purchase',
      'Total Selling',
      'Net Profit',
      'Real Profit'
    ];

    const pricingRows = pricingData.map(item => {
      const product = products.find(p => p.id === item.productId);
      const totalPurchase = item.purchasePrice * item.quantity;
      const totalSelling = item.sellingPrice * item.quantity;
      const netProfit = totalSelling - totalPurchase;
      const realProfit = sales.reduce((total, sale) => {
        const saleItem = sale.items.find(i => i.productId === item.productId);
        if (saleItem) {
          return total + ((saleItem.price - item.purchasePrice) * saleItem.quantity);
        }
        return total;
      }, 0);

      return [
        product?.name || item.productId,
        item.purchasePrice.toFixed(2),
        item.sellingPrice.toFixed(2),
        item.quantity,
        totalPurchase.toFixed(2),
        totalSelling.toFixed(2),
        netProfit.toFixed(2),
        realProfit.toFixed(2)
      ];
    });

    // Prepare summary data
    const totalNetProfit = calculateTotalNetProfit();
    const totalRealProfit = calculateTotalRealProfit();
    const totalExpenses = getTotalExpenses();
    const finalNetProfit = totalRealProfit - totalExpenses;

    const summaryData = [
      ['Summary'],
      ['Total Net Profit', totalNetProfit.toFixed(2)],
      ['Total Real Profit', totalRealProfit.toFixed(2)],
      ['Total Expenses', totalExpenses.toFixed(2)],
      ['Final Net Profit', finalNetProfit.toFixed(2)],
      []  // Empty row for spacing
    ];

    // Prepare expenses data
    const expensesHeaders = [
      'Date',
      'Description',
      'Category',
      'Amount',
      'Supplier'
    ];

    const expensesRows = expenses.map(expense => [
      new Date(expense.date).toLocaleDateString(),
      expense.description,
      expense.category,
      expense.amount.toFixed(2),
      expense.supplier
    ]);

    // Combine all data
    const csvContent = [
      // Pricing Section
      ['Products'],
      pricingHeaders,
      ...pricingRows,
      [''],
      // Summary Section
      ...summaryData,
      // Expenses Section
      ['Expenses'],
      expensesHeaders,
      ...expensesRows
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `price_management_report_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const totalNetProfit = calculateTotalNetProfit();
  const totalRealProfit = calculateTotalRealProfit();
  const totalExpenses = getTotalExpenses();
  const finalNetProfit = totalRealProfit - totalExpenses;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Price Management</h1>
        <div className="flex space-x-2">
          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            <Printer className="inline-block mr-2" size={18} />
            Print Report
          </button>
          <button
            onClick={handleExport}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            <Download className="inline-block mr-2" size={18} />
            Export Report
          </button>
          <button
            onClick={handleSaveChanges}
            disabled={!hasUnsavedChanges}
            className={`px-4 py-2 rounded ${
              hasUnsavedChanges
                ? 'bg-indigo-500 text-white hover:bg-indigo-600'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            <Save className="inline-block mr-2" size={18} />
            Save Changes
          </button>
        </div>
      </div>

      <div className="print-section">
        <ProfitSummaryCards
          totalNetProfit={totalNetProfit}
          totalRealProfit={totalRealProfit}
          finalNetProfit={finalNetProfit}
        />

        <div className="mb-4 flex flex-wrap items-center gap-4 no-print">
          <div className="relative flex-grow">
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-2 pl-10 border rounded"
            />
            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
          </div>
          <div className="flex items-center">
            <Filter className="text-gray-400 mr-2" size={18} />
            <select
              value={stockFilter}
              onChange={(e) => setStockFilter(e.target.value)}
              className="p-2 border rounded"
            >
              <option value="all">All Stock</option>
              <option value="in">In Stock</option>
              <option value="low">Low Stock</option>
              <option value="out">Out of Stock</option>
            </select>
          </div>
        </div>

        <PriceManagementTable
          products={products}
          pricingData={pricingData}
          searchTerm={searchTerm}
          stockFilter={stockFilter}
          sales={sales}
          onPricingChange={handlePricingChange}
        />

        <div className="page-break" />
        
        <ExpensesSection />
      </div>
    </div>
  );
};

export default PriceManagement;