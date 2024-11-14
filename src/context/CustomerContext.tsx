import React, { createContext, useState, useContext, useEffect } from 'react';

interface Customer {
  id: string;
  name: string;
  email: string;
  loyaltyPoints: number;
}

interface CustomerContextType {
  customers: Customer[];
  getCustomer: (id: string) => Customer | undefined;
  addCustomer: (customer: Omit<Customer, 'id'>) => void;
  addLoyaltyPoints: (id: string, points: number) => void;
}

const CustomerContext = createContext<CustomerContextType | undefined>(undefined);

export const CustomerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [customers, setCustomers] = useState<Customer[]>([]);

  useEffect(() => {
    const storedCustomers = localStorage.getItem('customers');
    if (storedCustomers) {
      setCustomers(JSON.parse(storedCustomers));
    }
  }, []);

  const saveCustomers = (updatedCustomers: Customer[]) => {
    setCustomers(updatedCustomers);
    localStorage.setItem('customers', JSON.stringify(updatedCustomers));
  };

  const getCustomer = (id: string) => {
    return customers.find(customer => customer.id === id);
  };

  const addCustomer = (customer: Omit<Customer, 'id'>) => {
    const newCustomer = { ...customer, id: `CUST-${Date.now()}` };
    saveCustomers([...customers, newCustomer]);
  };

  const addLoyaltyPoints = (id: string, points: number) => {
    const updatedCustomers = customers.map(customer =>
      customer.id === id
        ? { ...customer, loyaltyPoints: customer.loyaltyPoints + points }
        : customer
    );
    saveCustomers(updatedCustomers);
  };

  return (
    <CustomerContext.Provider value={{ customers, getCustomer, addCustomer, addLoyaltyPoints }}>
      {children}
    </CustomerContext.Provider>
  );
};

export const useCustomer = () => {
  const context = useContext(CustomerContext);
  if (context === undefined) {
    throw new Error('useCustomer must be used within a CustomerProvider');
  }
  return context;
};