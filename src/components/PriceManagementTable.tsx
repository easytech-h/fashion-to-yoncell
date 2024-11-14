import React from 'react';
import { Info } from 'lucide-react';

interface PriceManagementTableProps {
  products: Array<{
    id: string;
    name: string;
    description?: string;
    quantity: number;
    price: number;
    category: string;
  }>;
  pricingData: Array<{
    productId: string;
    purchasePrice: number;
    sellingPrice: number;
    quantity: number;
    supplier: string;
  }>;
  searchTerm: string;
  stockFilter: string;
  sales: Array<{
    items: Array<{
      productId: string;
      quantity: number;
      price: number;
    }>;
  }>;
  onPricingChange: (productId: string, field: string, value: any) => void;
}

const PriceManagementTable: React.FC<PriceManagementTableProps> = ({
  products,
  pricingData,
  searchTerm,
  stockFilter,
  sales,
  onPricingChange
}) => {
  const [selectedProductId, setSelectedProductId] = React.useState<string | null>(null);

  const calculateTotalPurchasePrice = (item: any) => {
    return (item.purchasePrice || 0) * (item.quantity || 0);
  };

  const calculateTotalSellingPrice = (item: any) => {
    return (item.sellingPrice || 0) * (item.quantity || 0);
  };

  const calculateNetProfit = (item: any) => {
    return calculateTotalSellingPrice(item) - calculateTotalPurchasePrice(item);
  };

  const calculateRealProfit = (productId: string) => {
    const productSales = sales.filter(sale =>
      sale.items.some(item => item.productId === productId)
    );
    return productSales.reduce((total, sale) => {
      const item = sale.items.find(i => i.productId === productId);
      if (!item) return total;
      const pricingItem = pricingData.find(p => p.productId === productId);
      if (!pricingItem) return total;
      return total + ((item.price - pricingItem.purchasePrice) * item.quantity);
    }, 0);
  };

  const filteredProducts = products.filter(product => {
    const nameMatch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                     (product.description?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    let stockMatch = true;

    switch (stockFilter) {
      case 'low':
        stockMatch = product.quantity < 5 && product.quantity > 0;
        break;
      case 'out':
        stockMatch = product.quantity === 0;
        break;
      case 'in':
        stockMatch = product.quantity >= 5;
        break;
    }

    return nameMatch && stockMatch;
  });

  return (
    <div className="bg-white rounded-lg shadow overflow-x-auto">
      <table className="min-w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Purchase Price</th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total Purchase</th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Selling Price</th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total Selling</th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Quantity</th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Net Profit</th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Real Profit</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {filteredProducts.map(product => {
            const pricingItem = pricingData.find(item => item.productId === product.id) || {
              purchasePrice: 0,
              sellingPrice: product.price,
              quantity: product.quantity
            };
            
            return (
              <React.Fragment key={product.id}>
                <tr>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div>
                        <div className="font-medium">{product.name}</div>
                        <div className="text-sm text-gray-500">{product.category}</div>
                      </div>
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
                    <input
                      type="number"
                      value={pricingItem.purchasePrice}
                      onChange={(e) => onPricingChange(product.id, 'purchasePrice', parseFloat(e.target.value) || 0)}
                      className="w-full p-2 border rounded text-right"
                      min="0"
                      step="0.01"
                    />
                  </td>
                  <td className="px-6 py-4 text-right">
                    HTG {calculateTotalPurchasePrice(pricingItem).toFixed(2)}
                  </td>
                  <td className="px-6 py-4">
                    <input
                      type="number"
                      value={pricingItem.sellingPrice}
                      onChange={(e) => onPricingChange(product.id, 'sellingPrice', parseFloat(e.target.value) || 0)}
                      className="w-full p-2 border rounded text-right"
                      min="0"
                      step="0.01"
                    />
                  </td>
                  <td className="px-6 py-4 text-right">
                    HTG {calculateTotalSellingPrice(pricingItem).toFixed(2)}
                  </td>
                  <td className="px-6 py-4">
                    <input
                      type="number"
                      value={pricingItem.quantity}
                      onChange={(e) => onPricingChange(product.id, 'quantity', parseInt(e.target.value) || 0)}
                      className="w-full p-2 border rounded text-right"
                      min="0"
                    />
                  </td>
                  <td className="px-6 py-4 text-right">
                    HTG {calculateNetProfit(pricingItem).toFixed(2)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    HTG {calculateRealProfit(product.id).toFixed(2)}
                  </td>
                </tr>
                {selectedProductId === product.id && product.description && (
                  <tr className="bg-gray-50">
                    <td colSpan={8} className="px-6 py-4 text-sm text-gray-600">
                      {product.description}
                    </td>
                  </tr>
                )}
              </React.Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default PriceManagementTable;