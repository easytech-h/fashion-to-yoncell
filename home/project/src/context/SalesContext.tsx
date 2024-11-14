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
  date: Date;
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
  const [sales, setSales] = useState<Sale[]>([
    {
      id: 'SALE-1620000000000',
      items: [
        { productId: '1', quantity: 2, price: 999.99 },
        { productId: '2', quantity: 1, price: 699.99 }
      ],
      subtotal: 2699.97,
      total: 2699.97,
      discount: 100,
      paymentReceived: 2599.97,
      change: 0,
      date: new Date('2023-05-01T10:30:00'),
      cashier: 'Jane Smith',
      storeLocation: 'Main Street Store'
    },
    {
      id: 'SALE-1620100000000',
      items: [
        { productId: '3', quantity: 3, price: 49.99 },
        { productId: '4', quantity: 1, price: 299.99 }
      ],
      subtotal: 449.96,
      total: 449.96,
      discount: 0,
      paymentReceived: 450,
      change: 0.04,
      date: new Date('2023-05-02T14:45:00'),
      cashier: 'Bob Williams',
      storeLocation: 'Downtown Branch'
    }
  ]);

  const addSale = (sale: Omit<Sale, 'id' | 'date'>) => {
    const newSale = {
      ...sale,
      id: `SALE-${Date.now()}`,
      date: new Date(),
    };
    setSales([...sales, newSale]);
  };

  const getSaleById = (id: string) => {
    return sales.find(sale => sale.id === id);
  };

  const clearSales = () => {
    setSales([]);
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