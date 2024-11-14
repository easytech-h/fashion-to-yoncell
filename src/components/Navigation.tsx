import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { useAuth } from '../context/AuthContext';
import {
  Package,
  LayoutDashboard,
  Box,
  DollarSign,
  FileText,
  History,
  LogOut,
  Settings,
  Menu,
  PieChart,
  ClipboardList,
  Users,
  User
} from 'lucide-react';
import UserSwitcher from './UserSwitcher';

const Navigation: React.FC = () => {
  const { currentUser } = useUser();
  const { user, logout: authLogout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const handleLogout = () => {
    authLogout();
    navigate('/login');
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };

  const NavLink: React.FC<{ to: string; icon: React.ReactNode; children: React.ReactNode }> = ({ to, icon, children }) => (
    <Link
      to={to}
      className={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${
        location.pathname === to
          ? 'bg-indigo-700 text-white'
          : 'text-gray-300 hover:bg-indigo-500 hover:text-white'
      }`}
      onClick={() => setIsMobileMenuOpen(false)}
    >
      {icon}
      <span className="ml-2">{children}</span>
    </Link>
  );

  const navigationItems = [
    { to: "/dashboard", icon: <LayoutDashboard size={20} />, label: "Dashboard" },
    { to: "/inventory", icon: <Box size={20} />, label: "Inventory" },
    { to: "/sales", icon: <DollarSign size={20} />, label: "Sales" },
    { to: "/orders", icon: <ClipboardList size={20} />, label: "Orders" },
    { to: "/reports", icon: <FileText size={20} />, label: "Reports" },
    { to: "/price-management", icon: <PieChart size={20} />, label: "Price Management" },
    { to: "/sales-history", icon: <History size={20} />, label: "Sales History" },
    { to: "/settings", icon: <Settings size={20} />, label: "Settings" },
    // { to: "/people", icon: <Users size={20} />, label: "People" }
  ];

  const activeUser = currentUser || user;
  if (!activeUser) {
    return null;
  }

  return (
    <nav className="bg-indigo-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Package className="h-8 w-8 text-white" />
            </div>
            <div className="hidden md:block ml-4">
              <div className="flex items-center space-x-4">
                {navigationItems.map((item) => (
                  <NavLink key={item.to} to={item.to} icon={item.icon}>
                    {item.label}
                  </NavLink>
                ))}
              </div>
            </div>
          </div>
          <div className="hidden md:block">
            <div className="flex items-center space-x-4">
              <UserSwitcher />
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center space-x-2 text-white hover:bg-indigo-500 px-3 py-2 rounded-md"
                >
                  <div className="w-8 h-8 bg-indigo-700 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium">
                      {getInitials(activeUser.username)}
                    </span>
                  </div>
                  <span className="text-sm">{activeUser.username}</span>
                </button>
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
                    <div className="py-1">
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <LogOut className="inline-block mr-2" size={16} />
                        Log out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-300 hover:text-white hover:bg-indigo-500 focus:outline-none"
            >
              <Menu size={24} />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navigationItems.map((item) => (
              <NavLink key={item.to} to={item.to} icon={item.icon}>
                {item.label}
              </NavLink>
            ))}
            <div className="border-t border-indigo-700 pt-2">
              <UserSwitcher />
              <button
                onClick={handleLogout}
                className="w-full flex items-center px-3 py-2 rounded-md text-sm font-medium text-gray-300 hover:bg-indigo-500 hover:text-white"
              >
                <LogOut size={20} />
                <span className="ml-2">Log out</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navigation;