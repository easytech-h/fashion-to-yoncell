import React, { useState } from 'react';
import { useInventory } from '../context/InventoryContext';
import { useSales } from '../context/SalesContext';
import { ShoppingCart, Printer, Download, Search, X } from 'lucide-react';
import { jsPDF } from "jspdf";
import 'jspdf-autotable';

const Sales: React.FC = () => {
  // ... (keep existing state and functions)

  return (
    <div className="container mx-auto px-4 py-4 sm:py-8">
      <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-8">Sales System</h1>
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-3 py-2 sm:px-4 sm:py-3 rounded relative mb-4" role="alert">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      )}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8">
        <div>
          <h2 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-4">Available Products</h2>
          <div className="mb-2 sm:mb-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search products..."
                className="w-full p-2 pl-8 border rounded text-sm sm:text-base"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Search className="absolute left-2 top-2.5 text-gray-400" size={18} />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-3 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-3 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                  <th className="px-3 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                  <th className="px-3 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredProducts.map((product) => (
                  <tr key={product.id}>
                    <td className="px-3 py-2 sm:px-6 sm:py-4 whitespace-nowrap text-sm">{product.name}</td>
                    <td className="px-3 py-2 sm:px-6 sm:py-4 whitespace-nowrap text-sm">HTG {product.price.toFixed(2)}</td>
                    <td className="px-3 py-2 sm:px-6 sm:py-4 whitespace-nowrap text-sm">{product.quantity}</td>
                    <td className="px-3 py-2 sm:px-6 sm:py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => handleProductSelect(product)}
                        className="text-indigo-600 hover:text-indigo-900 text-sm"
                        disabled={product.quantity === 0}
                      >
                        Add to Sale
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div>
          <h2 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-4">Current Sale</h2>
          <div className="bg-white rounded-lg shadow p-3 sm:p-6">
            <div className="overflow-x-auto">
              <table className="min-w-full mb-2 sm:mb-4">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-3 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                    <th className="px-3 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                    <th className="px-3 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                    <th className="px-3 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                    <th className="px-3 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {selectedProducts.map((product) => (
                    <tr key={product.id}>
                      <td className="px-3 py-2 sm:px-6 sm:py-4 whitespace-nowrap text-sm">{product.name}</td>
                      <td className="px-3 py-2 sm:px-6 sm:py-4 whitespace-nowrap text-sm">
                        <input
                          type="number"
                          min="1"
                          value={product.quantity}
                          onChange={(e) => handleQuantityChange(product.id, parseInt(e.target.value))}
                          className="w-16 p-1 border rounded text-sm"
                        />
                      </td>
                      <td className="px-3 py-2 sm:px-6 sm:py-4 whitespace-nowrap text-sm">HTG {product.price.toFixed(2)}</td>
                      <td className="px-3 py-2 sm:px-6 sm:py-4 whitespace-nowrap text-sm">HTG {(product.price * product.quantity).toFixed(2)}</td>
                      <td className="px-3 py-2 sm:px-6 sm:py-4 whitespace-nowrap text-sm">
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
            <div className="space-y-2 sm:space-y-4">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-sm sm:text-base">Subtotal:</span>
                <span className="text-sm sm:text-base">HTG {subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-semibold text-sm sm:text-base">Discount:</span>
                <input
                  type="number"
                  min="0"
                  value={discount}
                  onChange={(e) => setDiscount(parseFloat(e.target.value))}
                  className="w-20 sm:w-24 p-1 border rounded text-sm"
                />
              </div>
              <div className="flex justify-between items-center">
                <span className="font-semibold text-sm sm:text-base">Total:</span>
                <span className="text-lg sm:text-xl font-bold">HTG {total.toFixed(2)}</span>
              </div>
              <div>
                <label className="block mb-1 sm:mb-2 text-sm sm:text-base">Payment Received:</label>
                <input
                  type="number"
                  min="0"
                  value={paymentReceived}
                  onChange={(e) => setPaymentReceived(parseFloat(e.target.value))}
                  className="w-full p-2 border rounded text-sm sm:text-base"
                />
              </div>
              <div className="flex justify-between items-center">
                <span className="font-semibold text-sm sm:text-base">Change:</span>
                <span className="text-sm sm:text-base">HTG {change.toFixed(2)}</span>
              </div>
              <button
                onClick={handleCompleteSale}
                className="w-full bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 text-sm sm:text-base"
                disabled={selectedProducts.length === 0}
              >
                <ShoppingCart className="inline-block mr-2" size={18} />
                Complete Sale
              </button>
            </div>
          </div>
        </div>
      </div>
      {showTicket && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full" id="my-modal">
          <div className="relative top-20 mx-auto p-3 sm:p-5 border w-full sm:w-3/4 md:w-2/3 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 text-center mb-2 sm:mb-4">Sales Ticket</h3>
              <div className="border p-2 sm:p-4 mb-2 sm:mb-4">
                <h4 className="text-lg sm:text-xl font-bold text-center mb-2">EASYTECH MASTER STOCK</h4>
                <p className="text-center mb-2 sm:mb-4 text-sm sm:text-base">{currentSale.storeLocation}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4 mb-2 sm:mb-4">
                  <div>
                    <p className="text-sm sm:text-base"><strong>Transaction ID:</strong> {currentSale.id}</p>
                    <p className="text-sm sm:text-base"><strong>Date:</strong> {currentSale.date.toLocaleString()}</p>
                    <p className="text-sm sm:text-base"><strong>Cashier:</strong> {currentSale.cashier}</p>
                  </div>
                </div>
                <table className="w-full mb-2 sm:mb-4 text-sm sm:text-base">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left">Product</th>
                      <th className="text-right">Quantity</th>
                      <th className="text-right">Price</th>
                      <th className="text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentSale.items.map((item: any, index: number) => {
                      const product = products.find(p => p.id === item.productId);
                      return (
                        <tr key={index} className="border-b">
                          <td>{product?.name}</td>
                          <td className="text-right">{item.quantity}</td>
                          <td className="text-right">HTG {item.price.toFixed(2)}</td>
                          <td className="text-right">HTG {(item.quantity * item.price).toFixed(2)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                <div className="space-y-1 sm:space-y-2 text-sm sm:text-base">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>HTG {currentSale.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Discount:</span>
                    <span>HTG {currentSale.discount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold">
                    <span>Total:</span>
                    <span>HTG {currentSale.total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Payment Received:</span>
                    <span>HTG {currentSale.paymentReceived.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold">
                    <span>Change:</span>
                    <span>HTG {currentSale.change.toFixed(2)}</span>
                  </div>
                </div>
              </div>
              <p className="text-xs sm:text-sm mb-2 sm:mb-4">Return Policy: Items can be returned within 30 days with receipt.</p>
              <div className="flex flex-col sm:flex-row justify-center space-y-2 sm:space-y-0 sm:space-x-4">
                <button
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm sm:text-base"
                  onClick={handlePrintTicket}
                >
                  <Printer className="inline-block mr-2" size={18} />
                  Print Ticket
                </button>
                <button
                  className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 text-sm sm:text-base"
                  onClick={handleDownloadTicket}
                >
                  <Download className="inline-block mr-2" size={18} />
                  Download Ticket
                </button>
                <button
                  className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 text-sm sm:text-base"
                  onClick={() => setShowTicket(false)}
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