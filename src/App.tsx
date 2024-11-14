import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Login from './components/Login';
import ForgotPassword from './components/ForgotPassword';
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import Sales from './pages/Sales';
import OrderManagement from './components/OrderManagement';
import PriceManagement from './components/PriceManagement';
import Reports from './components/Reports';
import SalesHistory from './components/SalesHistory';
import OrderHistory from './components/OrderHistory';
import Settings from './components/Settings';
import People from './components/People';
import AdminDashboard from './components/AdminDashboard';
import PrivateRoute from './components/PrivateRoute';

const App: React.FC = () => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <main className="container mx-auto px-4 py-8 flex-grow">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route
            path="/inventory"
            element={
              <PrivateRoute requiredPermission="canManageInventory">
                <Inventory />
              </PrivateRoute>
            }
          />
          <Route
            path="/sales"
            element={
              <PrivateRoute requiredPermission="canProcessSales">
                <Sales />
              </PrivateRoute>
            }
          />
          <Route
            path="/orders"
            element={
              <PrivateRoute requiredPermission="canProcessSales">
                <OrderManagement />
              </PrivateRoute>
            }
          />
          <Route
            path="/order-history"
            element={
              <PrivateRoute requiredPermission="canViewAllSales">
                <OrderHistory />
              </PrivateRoute>
            }
          />
          <Route
            path="/sales-history"
            element={
              <PrivateRoute requiredPermission="canViewAllSales">
                <SalesHistory />
              </PrivateRoute>
            }
          />
          <Route
            path="/price-management"
            element={
              <PrivateRoute requiredPermission="canManagePrices">
                <PriceManagement />
              </PrivateRoute>
            }
          />
          <Route
            path="/reports"
            element={
              <PrivateRoute requiredPermission="canViewReports">
                <Reports />
              </PrivateRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <PrivateRoute requiredPermission="canManageSettings">
                <Settings />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <PrivateRoute adminOnly>
                <AdminDashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/people"
            element={
              <PrivateRoute adminOnly>
                <People />
              </PrivateRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
};

export default App;