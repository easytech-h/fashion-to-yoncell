import React, { createContext, useState, useContext, useEffect } from 'react';

interface Product {
  id: string;
  name: string;
  description: string;
  quantity: number;
  price: number;
  category: string;
  lastUpdated?: string;
  quantityHistory?: {
    timestamp: string;
    oldQuantity: number;
    newQuantity: number;
    reason?: string;
  }[];
}

interface InventoryContextType {
  products: Product[];
  categories: string[];
  addProduct: (product: Omit<Product, 'id' | 'lastUpdated' | 'quantityHistory'>) => void;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  updateProductQuantity: (id: string, quantityChange: number, reason?: string) => void;
  addCategory: (category: string) => void;
}

const DEFAULT_CATEGORIES = ['Electronics', 'Accessories', 'Components', 'Other'];

const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

export const InventoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>(() => {
    const savedProducts = localStorage.getItem('products');
    return savedProducts ? JSON.parse(savedProducts) : [];
  });

  const [categories, setCategories] = useState<string[]>(() => {
    const savedCategories = localStorage.getItem('categories');
    return savedCategories ? JSON.parse(savedCategories) : DEFAULT_CATEGORIES;
  });

  useEffect(() => {
    localStorage.setItem('products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('categories', JSON.stringify(categories));
  }, [categories]);

  const addProduct = (product: Omit<Product, 'id' | 'lastUpdated' | 'quantityHistory'>) => {
    const newProduct: Product = {
      ...product,
      id: `PROD-${Date.now()}`,
      lastUpdated: new Date().toISOString(),
      quantityHistory: [{
        timestamp: new Date().toISOString(),
        oldQuantity: 0,
        newQuantity: product.quantity,
        reason: 'Initial stock'
      }]
    };
    setProducts(prev => [...prev, newProduct]);
  };

  const updateProduct = (id: string, updates: Partial<Product>) => {
    setProducts(prev => prev.map(product => {
      if (product.id === id) {
        const updatedProduct = { ...product, ...updates };
        
        if (updates.quantity !== undefined && updates.quantity !== product.quantity) {
          const quantityHistory = product.quantityHistory || [];
          quantityHistory.push({
            timestamp: new Date().toISOString(),
            oldQuantity: product.quantity,
            newQuantity: updates.quantity,
            reason: 'Manual update'
          });
          updatedProduct.quantityHistory = quantityHistory;
        }
        
        updatedProduct.lastUpdated = new Date().toISOString();
        return updatedProduct;
      }
      return product;
    }));
  };

  const deleteProduct = (id: string) => {
    setProducts(prev => prev.filter(product => product.id !== id));
  };

  const updateProductQuantity = (id: string, quantityChange: number, reason?: string) => {
    setProducts(prev => prev.map(product => {
      if (product.id === id) {
        const newQuantity = Math.max(0, product.quantity - quantityChange);
        const quantityHistory = product.quantityHistory || [];
        quantityHistory.push({
          timestamp: new Date().toISOString(),
          oldQuantity: product.quantity,
          newQuantity,
          reason: reason || (quantityChange > 0 ? 'Sale' : 'Restock')
        });
        
        return {
          ...product,
          quantity: newQuantity,
          lastUpdated: new Date().toISOString(),
          quantityHistory
        };
      }
      return product;
    }));
  };

  const addCategory = (category: string) => {
    if (!categories.includes(category)) {
      setCategories(prev => [...prev, category]);
    }
  };

  return (
    <InventoryContext.Provider value={{
      products,
      categories,
      addProduct,
      updateProduct,
      deleteProduct,
      updateProductQuantity,
      addCategory
    }}>
      {children}
    </InventoryContext.Provider>
  );
};

export const useInventory = () => {
  const context = useContext(InventoryContext);
  if (context === undefined) {
    throw new Error('useInventory must be used within an InventoryProvider');
  }
  return context;
};