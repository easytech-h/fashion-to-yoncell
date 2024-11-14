import React, { useState, useEffect } from 'react';
import { useInventory } from '../context/InventoryContext';
import { useOrders } from '../context/OrderContext';
import { useUser } from '../context/UserContext';
import { Package, Plus, Minus, Search, Save, X } from 'lucide-react';
import { z } from 'zod';

// Validation schema
const orderSchema = z.object({
  customerName: z.string().min(2, 'Customer name is required'),
  contactNumber: z.string().min(8, 'Valid contact number is required'),
  email: z.string().email().optional().or(z.literal('')),
  deliveryAddress: z.string().min(5, 'Delivery address is required'),
  items: z.array(z.object({
    productId: z.string(),
    quantity: z.number().min(1),
    price: z.number().min(0)
  })).min(1, 'At least one product is required'),
  status: z.enum(['pending', 'processing', 'completed', 'cancelled']),
  paymentMethod: z.enum(['cash', 'card', 'mobile', 'bank_transfer']),
  notes: z.string().optional(),
  discount: z.number().min(0).optional(),
  advancePayment: z.number().min(0).optional()
});

interface OrderFormProps {
  orderId?: string;
  onClose: () => void;
}

const OrderForm: React.FC<OrderFormProps> = ({ orderId, onClose }) => {
  const { products } = useInventory();
  const { orders, addOrder, updateOrder } = useOrders();
  const { currentUser } = useUser();
  const [searchTerm, setSearchTerm] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({
    customerName: '',
    contactNumber: '',
    email: '',
    deliveryAddress: '',
    items: [] as Array<{ productId: string; quantity: number; price: number }>,
    status: 'pending' as const,
    paymentMethod: 'cash' as const,
    notes: '',
    discount: 0,
    advancePayment: 0
  });

  useEffect(() => {
    if (orderId) {
      const order = orders.find(o => o.id === orderId);
      if (order) {
        setFormData({
          ...order,
          discount: order.discount || 0,
          advancePayment: order.advancePayment || 0
        });
      }
    }
  }, [orderId, orders]);

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
    product.quantity > 0
  );

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleAddProduct = (product: any) => {
    const existingItem = formData.items.find(item => item.productId === product.id);
    if (existingItem) {
      if (existingItem.quantity >= product.quantity) {
        setErrors(prev => ({
          ...prev,
          items: `Not enough stock for ${product.name}`
        }));
        return;
      }
      setFormData(prev => ({
        ...prev,
        items: prev.items.map(item =>
          item.productId === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        items: [...prev.items, { productId: product.id, quantity: 1, price: product.price }]
      }));
    }
    setErrors(prev => ({ ...prev, items: '' }));
  };

  const handleRemoveProduct = (productId: string) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter(item => item.productId !== productId)
    }));
  };

  const handleQuantityChange = (productId: string, quantity: number) => {
    const product = products.find(p => p.id === productId);
    if (!product || quantity > product.quantity) {
      setErrors(prev => ({
        ...prev,
        items: `Not enough stock for ${product?.name || 'this product'}`
      }));
      return;
    }

    setFormData(prev => ({
      ...prev,
      items: prev.items.map(item =>
        item.productId === productId ? { ...item, quantity } : item
      )
    }));
    setErrors(prev => ({ ...prev, items: '' }));
  };

  const calculateTotals = () => {
    const subtotal = formData.items.reduce((sum, item) => {
      return sum + (item.price * item.quantity);
    }, 0);
    const total = subtotal - (formData.discount || 0);
    const balance = total - (formData.advancePayment || 0);
    return { subtotal, total, balance };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Validate form data
      const validatedData = orderSchema.parse(formData);
      
      const { subtotal, total } = calculateTotals();
      const orderData = {
        ...validatedData,
        id: orderId || `ORD-${Date.now()}`,
        orderDate: new Date().toISOString(),
        createdBy: currentUser?.id,
        totalAmount: subtotal,
        finalAmount: total
      };

      if (orderId) {
        await updateOrder(orderId, orderData);
      } else {
        await addOrder(orderData);
      }
      onClose();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach(err => {
          const path = err.path.join('.');
          newErrors[path] = err.message;
        });
        setErrors(newErrors);
      } else {
        console.error('Error saving order:', error);
        setErrors({ submit: 'Failed to save order' });
      }
    }
  };

  const { subtotal, total, balance } = calculateTotals();

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
      <div className="relative top-20 mx-auto p-5 border w-full max-w-4xl shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">
            {orderId ? 'Edit Order' : 'New Order'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Customer Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Customer Name *
              </label>
              <input
                type="text"
                value={formData.customerName}
                onChange={e => handleInputChange('customerName', e.target.value)}
                className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 ${
                  errors.customerName ? 'border-red-500' : ''
                }`}
              />
              {errors.customerName && (
                <p className="mt-1 text-sm text-red-500">{errors.customerName}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Contact Number *
              </label>
              <input
                type="tel"
                value={formData.contactNumber}
                onChange={e => handleInputChange('contactNumber', e.target.value)}
                className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 ${
                  errors.contactNumber ? 'border-red-500' : ''
                }`}
              />
              {errors.contactNumber && (
                <p className="mt-1 text-sm text-red-500">{errors.contactNumber}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={e => handleInputChange('email', e.target.value)}
                className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 ${
                  errors.email ? 'border-red-500' : ''
                }`}
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-500">{errors.email}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Delivery Address *
              </label>
              <textarea
                value={formData.deliveryAddress}
                onChange={e => handleInputChange('deliveryAddress', e.target.value)}
                className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 ${
                  errors.deliveryAddress ? 'border-red-500' : ''
                }`}
                rows={3}
              />
              {errors.deliveryAddress && (
                <p className="mt-1 text-sm text-red-500">{errors.deliveryAddress}</p>
              )}
            </div>
          </div>

          {/* Product Selection */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium">Products *</h3>
              <div className="relative w-64">
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border rounded-md"
                />
                <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Available Products */}
              <div className="border rounded-md p-4">
                <h4 className="font-medium mb-2">Available Products</h4>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {filteredProducts.map(product => (
                    <div
                      key={product.id}
                      className="flex items-center justify-between p-2 hover:bg-gray-50 rounded"
                    >
                      <div>
                        <p className="font-medium">{product.name}</p>
                        <p className="text-sm text-gray-500">
                          Stock: {product.quantity} | HTG {product.price.toFixed(2)}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleAddProduct(product)}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        <Plus size={18} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Selected Products */}
              <div className="border rounded-md p-4">
                <h4 className="font-medium mb-2">Selected Products</h4>
                {errors.items && (
                  <p className="text-sm text-red-500 mb-2">{errors.items}</p>
                )}
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {formData.items.map(item => {
                    const product = products.find(p => p.id === item.productId);
                    return (
                      <div
                        key={item.productId}
                        className="flex items-center justify-between p-2 hover:bg-gray-50 rounded"
                      >
                        <div>
                          <p className="font-medium">{product?.name}</p>
                          <p className="text-sm text-gray-500">
                            HTG {(item.price * item.quantity).toFixed(2)}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={e => handleQuantityChange(
                              item.productId,
                              parseInt(e.target.value) || 1
                            )}
                            className="w-16 p-1 border rounded"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveProduct(item.productId)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <Minus size={18} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Order Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Status</label>
              <select
                value={formData.status}
                onChange={e => handleInputChange('status', e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              >
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Payment Method
              </label>
              <select
                value={formData.paymentMethod}
                onChange={e => handleInputChange('paymentMethod', e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              >
                <option value="cash">Cash</option>
                <option value="card">Card</option>
                <option value="mobile">Mobile Payment</option>
                <option value="bank_transfer">Bank Transfer</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Discount (HTG)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.discount}
                onChange={e => handleInputChange('discount', parseFloat(e.target.value) || 0)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Advance Payment (HTG)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.advancePayment}
                onChange={e => handleInputChange('advancePayment', parseFloat(e.target.value) || 0)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Notes</label>
            <textarea
              value={formData.notes}
              onChange={e => handleInputChange('notes', e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              rows={3}
            />
          </div>

          {/* Order Summary */}
          <div className="border-t pt-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>HTG {subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Discount:</span>
                <span>HTG {formData.discount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Advance Payment:</span>
                <span>HTG {formData.advancePayment.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold">
                <span>Total:</span>
                <span>HTG {total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>Balance Due:</span>
                <span>HTG {balance.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {errors.submit && (
            <p className="text-sm text-red-500">{errors.submit}</p>
          )}

          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded-md text-gray-600 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              <Save className="inline-block mr-2" size={18} />
              {orderId ? 'Update Order' : 'Create Order'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OrderForm;