import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';
import { AuthProvider } from './context/AuthContext';
import { UserProvider } from './context/UserContext';
import { InventoryProvider } from './context/InventoryContext';
import { SalesProvider } from './context/SalesContext';
import { OrderProvider } from './context/OrderContext';
import { ExpensesProvider } from './context/ExpensesContext';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <UserProvider>
          <InventoryProvider>
            <SalesProvider>
              <OrderProvider>
                <ExpensesProvider>
                  <App />
                </ExpensesProvider>
              </OrderProvider>
            </SalesProvider>
          </InventoryProvider>
        </UserProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);