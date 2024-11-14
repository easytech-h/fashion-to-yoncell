import React, { createContext, useState, useContext } from 'react';

interface SaleItem {
  productId: string;
  quantity: number;
  price: number;
}

interface Sale {
  id: string;
  items: SaleItem[];
  subtotal: number;
  total: number;
  discount: number;
  paymentReceived: number;
  change: number;
  date: string;
  cashier: string;
  storeLocation: string;
}

interface SalesContextType {
  sales: Sale[];
  addSale: (sale: Omit<Sale, 'id' | 'date'>) => void;
  getSaleById: (id: string) => Sale | undefined;
  clearSales: () => void;
}

const SalesContext = createContext<SalesContextType | undefined>(undefined);

export const SalesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sales, setSales] = useState<Sale[]>(() => {
    try {
      const savedSales = localStorage.getItem('sales');
      return savedSales ? JSON.parse(savedSales) : [];
    } catch (error) {
      console.error('Error loading sales from localStorage:', error);
      return [];
    }
  });

  const addSale = (saleData: Omit<Sale, 'id' | 'date'>) => {
    try {
      // Ensure all required numeric fields have default values
      const newSale: Sale = {
        ...saleData,
        id: `SALE-${Date.now()}`,
        date: new Date().toISOString(),
        subtotal: saleData.subtotal || 0,
        total: saleData.total || 0,
        discount: saleData.discount || 0,
        paymentReceived: saleData.paymentReceived || 0,
        change: saleData.change || 0,
        items: saleData.items.map(item => ({
          ...item,
          quantity: item.quantity || 0,
          price: item.price || 0
        }))
      };

      setSales(prevSales => {
        const updatedSales = [...prevSales, newSale];
        try {
          localStorage.setItem('sales', JSON.stringify(updatedSales));
        } catch (error) {
          console.error('Error saving sales to localStorage:', error);
        }
        return updatedSales;
      });
    } catch (error) {
      console.error('Error adding sale:', error);
    }
  };

  const getSaleById = (id: string) => {
    return sales.find(sale => sale.id === id);
  };

  const clearSales = () => {
    try {
      setSales([]);
      localStorage.removeItem('sales');
    } catch (error) {
      console.error('Error clearing sales:', error);
    }
  };

  return (
    <SalesContext.Provider value={{ sales, addSale, getSaleById, clearSales }}>
      {children}
    </SalesContext.Provider>
  );
};

export const useSales = () => {
  const context = useContext(SalesContext);
  if (context === undefined) {
    throw new Error('useSales must be used within a SalesProvider');
  }
  return context;
};

export type { Sale, SaleItem };