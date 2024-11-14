import React, { createContext, useState, useContext, useEffect, useCallback, useRef } from 'react';
import { useSales } from './SalesContext';
import { useUser } from './UserContext';

interface OrderItem {
  productId: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  customerName: string;
  contactNumber: string;
  email: string;
  deliveryAddress: string;
  items: OrderItem[];
  subtotal: number;
  total: number;
  discount: number;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  paymentMethod: 'cash' | 'card' | 'mobile' | 'bank_transfer';
  orderDate: string;
  notes?: string;
  createdBy?: string;
  finalAmount: number;
  advancePayment: number;
  saleCreated?: boolean;
}

interface OrderContextType {
  orders: Order[];
  addOrder: (order: Omit<Order, 'id' | 'orderDate'>) => void;
  updateOrder: (id: string, updates: Partial<Order>) => void;
  deleteOrder: (id: string) => void;
  getOrderById: (id: string) => Order | undefined;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export const OrderProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { logActivity } = useUser();
  const { addSale } = useSales();
  const [orders, setOrders] = useState<Order[]>(() => {
    const savedOrders = localStorage.getItem('orders');
    return savedOrders ? JSON.parse(savedOrders) : [];
  });

  // Use ref to track if sale creation is in progress
  const saleCreationInProgress = useRef<Set<string>>(new Set());

  useEffect(() => {
    localStorage.setItem('orders', JSON.stringify(orders));
  }, [orders]);

  const addOrder = useCallback((orderData: Omit<Order, 'id' | 'orderDate'>) => {
    const newOrder: Order = {
      ...orderData,
      id: `ORD-${Date.now()}`,
      orderDate: new Date().toISOString(),
      saleCreated: false
    };
    setOrders(prev => [...prev, newOrder]);
    logActivity(newOrder.createdBy || 'system', 'ORDER_CREATED', `Nouvelle commande ${newOrder.id} créée`);
  }, [logActivity]);

  const createSaleFromOrder = useCallback((order: Order) => {
    if (saleCreationInProgress.current.has(order.id)) {
      return;
    }

    saleCreationInProgress.current.add(order.id);
    
    const sale = {
      items: order.items,
      subtotal: order.total,
      total: order.finalAmount,
      discount: order.discount || 0,
      paymentReceived: order.advancePayment || order.finalAmount,
      change: 0,
      cashier: order.createdBy || 'System',
      storeLocation: 'UP2DATE FASHION',
      date: new Date().toISOString()
    };
    
    addSale(sale);
    
    logActivity(
      order.createdBy || 'system',
      'SALE_CREATED_FROM_ORDER',
      `Vente créée à partir de la commande ${order.id}`
    );

    setOrders(prev => prev.map(o => 
      o.id === order.id ? { ...o, saleCreated: true } : o
    ));

    saleCreationInProgress.current.delete(order.id);
  }, [addSale, logActivity]);

  const updateOrder = useCallback((id: string, updates: Partial<Order>) => {
    setOrders(prev => {
      const updatedOrders = prev.map(order => {
        if (order.id === id) {
          const updatedOrder = { ...order, ...updates };
          
          // Log status change if status is updated
          if (updates.status && updates.status !== order.status) {
            logActivity(
              order.createdBy || 'system',
              'ORDER_STATUS_UPDATED',
              `Statut de la commande ${order.id} mis à jour: ${order.status} → ${updates.status}`
            );

            // Schedule sale creation if needed
            if (updates.status === 'completed' && !order.saleCreated) {
              // Use setTimeout to avoid state updates during render
              setTimeout(() => {
                createSaleFromOrder(updatedOrder);
              }, 0);
            }
          }

          return updatedOrder;
        }
        return order;
      });

      return updatedOrders;
    });
  }, [logActivity, createSaleFromOrder]);

  const deleteOrder = useCallback((id: string) => {
    const order = orders.find(o => o.id === id);
    if (order) {
      logActivity(
        order.createdBy || 'system',
        'ORDER_DELETED',
        `Commande ${order.id} supprimée`
      );
    }
    setOrders(prev => prev.filter(order => order.id !== id));
  }, [orders, logActivity]);

  const getOrderById = useCallback((id: string) => {
    return orders.find(order => order.id === id);
  }, [orders]);

  return (
    <OrderContext.Provider value={{
      orders,
      addOrder,
      updateOrder,
      deleteOrder,
      getOrderById
    }}>
      {children}
    </OrderContext.Provider>
  );
};

export const useOrders = () => {
  const context = useContext(OrderContext);
  if (context === undefined) {
    throw new Error('useOrders must be used within an OrderProvider');
  }
  return context;
};