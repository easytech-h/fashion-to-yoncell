import React, { createContext, useState, useContext, useEffect } from 'react';

export interface Expense {
  id: string;
  description: string;
  amount: number;
  date: string;
  category: string;
  supplier: string;
  attachmentUrl?: string;
  productId?: string;
}

interface ExpensesContextType {
  expenses: Expense[];
  addExpense: (expense: Omit<Expense, 'id'>) => Promise<void>;
  updateExpense: (id: string, updates: Partial<Expense>) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;
  getExpensesByProduct: (productId: string) => Expense[];
  getTotalExpenses: () => number;
  getExpensesByCategory: () => Record<string, number>;
  isLoading: boolean;
  error: string | null;
}

const ExpensesContext = createContext<ExpensesContextType | undefined>(undefined);

export const ExpensesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [expenses, setExpenses] = useState<Expense[]>(() => {
    const savedExpenses = localStorage.getItem('expenses');
    return savedExpenses ? JSON.parse(savedExpenses) : [];
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem('expenses', JSON.stringify(expenses));
  }, [expenses]);

  const addExpense = async (expense: Omit<Expense, 'id'>) => {
    try {
      setIsLoading(true);
      const newExpense: Expense = {
        ...expense,
        id: `EXP-${Date.now()}`
      };
      setExpenses(prev => [...prev, newExpense]);
      setError(null);
    } catch (err) {
      console.error('Error adding expense:', err);
      setError('Failed to add expense');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updateExpense = async (id: string, updates: Partial<Expense>) => {
    try {
      setIsLoading(true);
      setExpenses(prev => prev.map(expense =>
        expense.id === id ? { ...expense, ...updates } : expense
      ));
      setError(null);
    } catch (err) {
      console.error('Error updating expense:', err);
      setError('Failed to update expense');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteExpense = async (id: string) => {
    try {
      setIsLoading(true);
      setExpenses(prev => prev.filter(expense => expense.id !== id));
      setError(null);
    } catch (err) {
      console.error('Error deleting expense:', err);
      setError('Failed to delete expense');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const getExpensesByProduct = (productId: string) => {
    return expenses.filter(expense => expense.productId === productId);
  };

  const getTotalExpenses = () => {
    return expenses.reduce((total, expense) => total + expense.amount, 0);
  };

  const getExpensesByCategory = () => {
    return expenses.reduce((acc, expense) => {
      const { category, amount } = expense;
      acc[category] = (acc[category] || 0) + amount;
      return acc;
    }, {} as Record<string, number>);
  };

  return (
    <ExpensesContext.Provider value={{
      expenses,
      addExpense,
      updateExpense,
      deleteExpense,
      getExpensesByProduct,
      getTotalExpenses,
      getExpensesByCategory,
      isLoading,
      error
    }}>
      {children}
    </ExpensesContext.Provider>
  );
};

export const useExpenses = () => {
  const context = useContext(ExpensesContext);
  if (context === undefined) {
    throw new Error('useExpenses must be used within an ExpensesProvider');
  }
  return context;
};