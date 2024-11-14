import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  FileText, 
  History, 
  Settings, 
  Users, 
  LogOut,
  Menu,
  X,
  ClipboardList,
  DollarSign,
  Shield,
  ChevronDown
} from 'lucide-react';

const Navbar: React.FC = () => {
  const location = useLocation();
  const { logout, isAdmin, user } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const navItems = [
    { path: "/", icon: <LayoutDashboard size={20} />, label: "Tableau de Bord", permission: null },
    { path: "/inventory", icon: <Package size={20} />, label: "Inventaire", permission: "canManageInventory" },
    { path: "/sales", icon: <ShoppingCart size={20} />, label: "Ventes", permission: "canProcessSales" },
    { path: "/orders", icon: <ClipboardList size={20} />, label: "Commandes", permission: "canProcessSales" },
    { path: "/order-history", icon: <History size={20} />, label: "Historique Commandes", permission: "canViewAllSales" },
    { path: "/sales-history", icon: <History size={20} />, label: "Historique Ventes", permission: "canViewAllSales" },
    { path: "/price-management", icon: <DollarSign size={20} />, label: "Prix", permission: "canManagePrices" },
    { path: "/reports", icon: <FileText size={20} />, label: "Rapports", permission: "canViewReports" },
    { path: "/settings", icon: <Settings size={20} />, label: "Paramètres", permission: "canManageSettings" },
    { path: "/admin", icon: <Shield size={20} />, label: "Administration", adminOnly: true },
  ];

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };

  return (
    <nav className="bg-blue-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Package className="h-8 w-8 text-white" />
            </div>
            <div className="hidden md:block ml-10">
              <div className="flex items-baseline space-x-4">
                {navItems.map((item) => {
                  if (item.adminOnly && !isAdmin) return null;
                  
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                        isActive(item.path)
                          ? 'bg-blue-700 text-white'
                          : 'text-white hover:bg-blue-500'
                      }`}
                    >
                      {item.icon}
                      <span className="ml-2">{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="hidden md:flex items-center">
            {user && (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center space-x-3 px-4 py-2 rounded-lg bg-blue-700 hover:bg-blue-600 transition-colors duration-200"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                      <span className="text-sm font-semibold text-blue-600">
                        {getInitials(user.fullName)}
                      </span>
                    </div>
                    <div className="flex flex-col items-start">
                      <span className="text-sm font-medium text-white">{user.fullName}</span>
                      <span className="text-xs text-blue-200">{user.role === 'admin' ? 'Administrateur' : 'Utilisateur'}</span>
                    </div>
                  </div>
                  <ChevronDown size={16} className="text-blue-200" />
                </button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
                    <div className="py-1">
                      <button
                        onClick={logout}
                        className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <LogOut size={16} className="mr-2" />
                        Déconnexion
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-white hover:bg-blue-500"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {user && (
              <div className="px-3 py-2 text-white border-b border-blue-500 mb-2">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                    <span className="text-lg font-semibold text-blue-600">
                      {getInitials(user.fullName)}
                    </span>
                  </div>
                  <div>
                    <div className="font-medium">{user.fullName}</div>
                    <div className="text-sm text-blue-200">
                      {user.role === 'admin' ? 'Administrateur' : 'Utilisateur'}
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {navItems.map((item) => {
              if (item.adminOnly && !isAdmin) return null;
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                    isActive(item.path)
                      ? 'bg-blue-700 text-white'
                      : 'text-white hover:bg-blue-500'
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.icon}
                  <span className="ml-2">{item.label}</span>
                </Link>
              );
            })}
            
            <button
              onClick={logout}
              className="w-full flex items-center px-3 py-2 rounded-md text-sm font-medium text-white hover:bg-blue-500"
            >
              <LogOut size={20} className="mr-2" />
              Déconnexion
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;