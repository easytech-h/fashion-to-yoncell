import React, { useState, useMemo } from 'react';
import { useInventory } from '../context/InventoryContext';
import { useSales } from '../context/SalesContext';
import { useAuth } from '../context/AuthContext';
import { ShoppingCart, Printer, Download, Search, X, Info } from 'lucide-react';
import { jsPDF } from "jspdf";
import 'jspdf-autotable';
import PrintableReceipt from '../components/PrintableReceipt';

const Sales: React.FC = () => {
  const { products, updateProductQuantity } = useInventory();
  const { addSale } = useSales();
  const { user } = useAuth();
  const [selectedProducts, setSelectedProducts] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [discount, setDiscount] = useState(0);
  const [paymentReceived, setPaymentReceived] = useState(0);
  const [error, setError] = useState('');
  const [showTicket, setShowTicket] = useState(false);
  const [currentSale, setCurrentSale] = useState<any>(null);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);

  const filteredProducts = useMemo(() => {
    return products.filter(product =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [products, searchTerm]);

  const subtotal = useMemo(() => {
    return selectedProducts.reduce((sum, product) => sum + product.price * product.quantity, 0);
  }, [selectedProducts]);

  const total = useMemo(() => {
    return subtotal - discount;
  }, [subtotal, discount]);

  const change = useMemo(() => {
    return Math.max(0, paymentReceived - total);
  }, [paymentReceived, total]);

  const handleProductSelect = (product: any) => {
    const existingProduct = selectedProducts.find(p => p.id === product.id);
    if (existingProduct) {
      if (existingProduct.quantity >= product.quantity) {
        setError(`Maximum available quantity for ${product.name} is ${product.quantity}`);
        return;
      }
      setSelectedProducts(selectedProducts.map(p =>
        p.id === product.id ? { ...p, quantity: p.quantity + 1 } : p
      ));
    } else {
      setSelectedProducts([...selectedProducts, { ...product, quantity: 1 }]);
    }
    setError('');
  };

  const handleQuantityChange = (id: string, quantity: number) => {
    const product = products.find(p => p.id === id);
    if (product && quantity > product.quantity) {
      setError(`Maximum available quantity for ${product.name} is ${product.quantity}`);
      return;
    }
    setSelectedProducts(selectedProducts.map(p =>
      p.id === id ? { ...p, quantity: Math.max(1, quantity) } : p
    ));
    setError('');
  };

  const handleRemoveProduct = (id: string) => {
    setSelectedProducts(selectedProducts.filter(p => p.id !== id));
    setError('');
  };

  const handleCompleteSale = () => {
    if (!user) {
      setError('User not authenticated');
      return;
    }

    if (selectedProducts.length === 0) {
      setError('No products selected');
      return;
    }

    if (paymentReceived < total) {
      setError('Insufficient payment');
      return;
    }

    const saleItems = selectedProducts.map(product => ({
      productId: product.id,
      quantity: product.quantity,
      price: product.price
    }));

    const sale = {
      items: saleItems,
      subtotal,
      total,
      discount,
      paymentReceived,
      change,
      cashier: user.fullName,
      storeLocation: 'YONCELL MULTI SERVICES'
    };

    addSale(sale);
    const newSale = { ...sale, id: `SALE-${Date.now()}`, date: new Date().toISOString() };
    setCurrentSale(newSale);
    setShowTicket(true);

    selectedProducts.forEach(product => {
      updateProductQuantity(product.id, product.quantity, 'Sale');
    });

    setSelectedProducts([]);
    setDiscount(0);
    setPaymentReceived(0);
    setError('');
  };

  const handlePrintTicket = () => {
    window.print();
  };

  const handleDownloadTicket = () => {
    const doc = new jsPDF();
    doc.text("Sales Receipt", 20, 10);
    doc.save("receipt.pdf");
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p className="font-bold">Error:</p>
          <p>You must be logged in to process sales.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Sales System</h1>
        <div className="text-sm text-gray-600 flex items-center">
          <span className="font-semibold mr-2">Cashier:</span>
          <span>{user.fullName}</span>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Available Products Section */}
        <div>
          <h2 className="text-lg font-semibold mb-4">Available Products</h2>
          <div className="mb-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search products..."
                className="w-full pl-10 pr-4 py-2 border rounded"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredProducts.map((product) => (
                  <React.Fragment key={product.id}>
                    <tr>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <span className="font-medium">{product.name}</span>
                          {product.description && (
                            <button
                              onClick={() => setSelectedProductId(selectedProductId === product.id ? null : product.id)}
                              className="ml-2 text-gray-400 hover:text-gray-600"
                            >
                              <Info size={16} />
                            </button>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                          {product.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">HTG {product.price.toFixed(2)}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`${product.quantity < 5 ? 'text-red-600 font-semibold' : ''}`}>
                          {product.quantity}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => handleProductSelect(product)}
                          className="text-indigo-600 hover:text-indigo-900 disabled:text-gray-400"
                          disabled={product.quantity === 0}
                        >
                          Add to Sale
                        </button>
                      </td>
                    </tr>
                    {selectedProductId === product.id && product.description && (
                      <tr className="bg-gray-50">
                        <td colSpan={5} className="px-6 py-4 text-sm text-gray-600">
                          {product.description}
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Current Sale Section */}
        <div>
          <h2 className="text-lg font-semibold mb-4">Current Sale</h2>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="overflow-x-auto">
              <table className="min-w-full mb-4">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {selectedProducts.map((product) => (
                    <tr key={product.id}>
                      <td className="px-6 py-4 whitespace-nowrap">{product.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="number"
                          min="1"
                          value={product.quantity}
                          onChange={(e) => handleQuantityChange(product.id, parseInt(e.target.value))}
                          className="w-16 p-1 border rounded"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">HTG {product.price.toFixed(2)}</td>
                      <td className="px-6 py-4 whitespace-nowrap">HTG {(product.price * product.quantity).toFixed(2)}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => handleRemoveProduct(product.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <X size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="font-semibold">Subtotal:</span>
                <span>HTG {subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-semibold">Discount:</span>
                <input
                  type="number"
                  min="0"
                  value={discount}
                  onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                  className="w-24 p-1 border rounded text-right"
                />
              </div>
              <div className="flex justify-between items-center">
                <span className="font-semibold">Total:</span>
                <span className="text-xl font-bold">HTG {total.toFixed(2)}</span>
              </div>
              <div>
                <label className="block mb-2">Payment Received:</label>
                <input
                  type="number"
                  min="0"
                  value={paymentReceived}
                  onChange={(e) => setPaymentReceived(parseFloat(e.target.value) || 0)}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div className="flex justify-between items-center">
                <span className="font-semibold">Change:</span>
                <span>HTG {change.toFixed(2)}</span>
              </div>
              <button
                onClick={handleCompleteSale}
                className="w-full bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 flex items-center justify-center"
                disabled={selectedProducts.length === 0}
              >
                <ShoppingCart className="mr-2" size={18} />
                Complete Sale
              </button>
            </div>
          </div>
        </div>
      </div>

      {showTicket && currentSale && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 text-center mb-4">Sales Receipt</h3>
              <div className="border p-4 mb-4">
                <PrintableReceipt sale={currentSale} />
              </div>
              <div className="flex justify-center space-x-4">
                <button
                  onClick={handlePrintTicket}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  <Printer className="inline-block mr-2" size={18} />
                  Print Receipt
                </button>
                <button
                  onClick={handleDownloadTicket}
                  className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                >
                  <Download className="inline-block mr-2" size={18} />
                  Download Receipt
                </button>
                <button
                  onClick={() => setShowTicket(false)}
                  className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sales;