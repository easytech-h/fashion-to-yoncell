import React, { useState } from 'react';
import { useInventory } from '../context/InventoryContext';
import { Plus, Trash2, Edit, History, Search, Filter, X } from 'lucide-react';

const Inventory: React.FC = () => {
  const { products, categories, addProduct, updateProduct, deleteProduct, addCategory } = useInventory();
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    quantity: 0,
    price: 0,
    category: categories[0] || 'General'
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [newCategory, setNewCategory] = useState('');
  const [showNewCategoryInput, setShowNewCategoryInput] = useState(false);

  const handleAddProduct = () => {
    if (newProduct.name && newProduct.quantity >= 0 && newProduct.price >= 0) {
      addProduct(newProduct);
      setNewProduct({
        name: '',
        description: '',
        quantity: 0,
        price: 0,
        category: categories[0] || 'General'
      });
    }
  };

  const handleAddCategory = () => {
    if (newCategory.trim()) {
      addCategory(newCategory.trim());
      setNewProduct(prev => ({ ...prev, category: newCategory.trim() }));
      setNewCategory('');
      setShowNewCategoryInput(false);
    }
  };

  const handleUpdateProduct = (id: string) => {
    const product = products.find(p => p.id === id);
    if (product) {
      updateProduct(id, product);
      setEditingId(null);
    }
  };

  const handleQuantityChange = (id: string, newQuantity: number) => {
    const product = products.find(p => p.id === id);
    if (product) {
      updateProduct(id, { ...product, quantity: newQuantity });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getRowColor = (quantity: number) => {
    if (quantity === 0) return 'bg-red-50';
    if (quantity < 3) return 'bg-orange-200';
    if (quantity < 5) return 'bg-orange-50';
    return '';
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = (product.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                         (product.description?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Inventory Management</h1>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-xl font-semibold mb-4">Add New Product</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Product Name"
            className="w-full p-2 border rounded"
            value={newProduct.name}
            onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
          />
          <input
            type="text"
            placeholder="Description"
            className="w-full p-2 border rounded"
            value={newProduct.description}
            onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
          />
          <input
            type="number"
            placeholder="Quantity"
            className="w-full p-2 border rounded"
            value={newProduct.quantity}
            onChange={(e) => setNewProduct({ ...newProduct, quantity: parseInt(e.target.value) || 0 })}
          />
          <input
            type="number"
            step="0.01"
            placeholder="Price"
            className="w-full p-2 border rounded"
            value={newProduct.price}
            onChange={(e) => setNewProduct({ ...newProduct, price: parseFloat(e.target.value) || 0 })}
          />
          <div className="relative">
            {showNewCategoryInput ? (
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="New Category Name"
                  className="flex-1 p-2 border rounded"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  autoFocus
                />
                <button
                  onClick={handleAddCategory}
                  className="px-3 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                >
                  Add
                </button>
                <button
                  onClick={() => setShowNewCategoryInput(false)}
                  className="px-3 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                >
                  <X size={18} />
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <select
                  className="flex-1 p-2 border rounded"
                  value={newProduct.category}
                  onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                >
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
                <button
                  onClick={() => setShowNewCategoryInput(true)}
                  className="px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  New
                </button>
              </div>
            )}
          </div>
        </div>
        <button
          onClick={handleAddProduct}
          className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          <Plus className="inline-block mr-2" size={18} />
          Add Product
        </button>
      </div>

      <div className="mb-4 flex flex-wrap gap-4">
        <div className="flex-1">
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
        <div className="w-48">
          <div className="flex items-center">
            <Filter className="text-gray-400 mr-2" size={18} />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full p-2 border rounded"
            >
              <option value="all">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Updated</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredProducts.map((product) => (
              <React.Fragment key={product.id}>
                <tr className={getRowColor(product.quantity)}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {editingId === product.id ? (
                      <input
                        type="text"
                        value={product.name}
                        onChange={(e) => updateProduct(product.id, { ...product, name: e.target.value })}
                        className="w-full p-1 border rounded"
                      />
                    ) : (
                      product.name
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {editingId === product.id ? (
                      <input
                        type="text"
                        value={product.description}
                        onChange={(e) => updateProduct(product.id, { ...product, description: e.target.value })}
                        className="w-full p-1 border rounded"
                      />
                    ) : (
                      product.description
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {editingId === product.id ? (
                      <select
                        value={product.category}
                        onChange={(e) => updateProduct(product.id, { ...product, category: e.target.value })}
                        className="w-full p-1 border rounded"
                      >
                        {categories.map(category => (
                          <option key={category} value={category}>{category}</option>
                        ))}
                      </select>
                    ) : (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        {product.category}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {editingId === product.id ? (
                        <input
                          type="number"
                          value={product.quantity}
                          onChange={(e) => handleQuantityChange(product.id, parseInt(e.target.value) || 0)}
                          className="w-20 p-1 border rounded"
                        />
                      ) : (
                        <>
                          <span className={product.quantity < 5 ? 'font-semibold' : ''}>
                            {product.quantity}
                          </span>
                          <button
                            onClick={() => setShowHistory(showHistory === product.id ? null : product.id)}
                            className="ml-2 text-gray-500 hover:text-gray-700"
                          >
                            <History size={16} />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {editingId === product.id ? (
                      <input
                        type="number"
                        step="0.01"
                        value={product.price}
                        onChange={(e) => updateProduct(product.id, { ...product, price: parseFloat(e.target.value) || 0 })}
                        className="w-24 p-1 border rounded"
                      />
                    ) : (
                      `HTG ${product.price.toFixed(2)}`
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {product.lastUpdated ? formatDate(product.lastUpdated) : 'Never'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {editingId === product.id ? (
                      <button
                        onClick={() => handleUpdateProduct(product.id)}
                        className="text-green-600 hover:text-green-900"
                      >
                        Save
                      </button>
                    ) : (
                      <button
                        onClick={() => setEditingId(product.id)}
                        className="text-blue-600 hover:text-blue-900 mr-2"
                      >
                        <Edit size={18} />
                      </button>
                    )}
                    <button
                      onClick={() => deleteProduct(product.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
                {showHistory === product.id && product.quantityHistory && (
                  <tr>
                    <td colSpan={7} className="px-6 py-4 bg-gray-50">
                      <div className="text-sm">
                        <h4 className="font-semibold mb-2">Quantity History</h4>
                        <div className="space-y-2">
                          {product.quantityHistory.slice().reverse().map((record, idx) => (
                            <div key={idx} className="flex justify-between items-center">
                              <span>{formatDate(record.timestamp)}</span>
                              <span className="text-gray-600">
                                {record.oldQuantity} → {record.newQuantity}
                                {record.reason && ` (${record.reason})`}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Inventory;