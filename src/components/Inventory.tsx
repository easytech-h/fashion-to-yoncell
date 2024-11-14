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
    category: 'General'
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [newCategory, setNewCategory] = useState('');
  const [showNewCategoryInput, setShowNewCategoryInput] = useState(false);

  const handleAddProduct = () => {
    if (newProduct.name && newProduct.quantity >= 0 && newProduct.price >= 0) {
      addProduct({
        ...newProduct,
        lastUpdated: new Date().toISOString(),
        quantityHistory: [{
          timestamp: new Date().toISOString(),
          oldQuantity: 0,
          newQuantity: newProduct.quantity,
          reason: 'Initial stock'
        }]
      });
      setNewProduct({
        name: '',
        description: '',
        quantity: 0,
        price: 0,
        category: 'General'
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

  // Rest of the component remains the same until the category select in the form

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

      {/* Rest of the component remains the same */}
    </div>
  );
};

export default Inventory;