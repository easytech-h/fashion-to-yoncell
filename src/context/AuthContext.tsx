import React, { createContext, useState, useContext, useEffect } from 'react';
import { hashPassword, verifyPassword } from '../utils/auth';
import { User, UserRole, getDefaultPermissions } from '../types/types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  updateSession: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const INITIAL_ADMIN: User = {
  id: 'admin-1',
  username: 'admin',
  password: hashPassword('admin'),
  role: 'admin',
  fullName: 'System Administrator',
  email: 'admin@system.com',
  active: true,
  createdAt: new Date().toISOString(),
  lastLogin: null,
  permissions: getDefaultPermissions('admin')
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const savedSession = localStorage.getItem('session');
    return savedSession ? JSON.parse(savedSession) : null;
  });

  // Initialize users in localStorage if not exists
  useEffect(() => {
    const savedUsers = localStorage.getItem('users');
    if (!savedUsers) {
      localStorage.setItem('users', JSON.stringify([INITIAL_ADMIN]));
    } else {
      // Ensure admin user exists
      const users = JSON.parse(savedUsers);
      const adminExists = users.some((u: User) => u.username === 'admin');
      if (!adminExists) {
        users.push(INITIAL_ADMIN);
        localStorage.setItem('users', JSON.stringify(users));
      }
    }
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      // Clear any existing session
      localStorage.removeItem('session');
      setUser(null);

      // Get users from localStorage
      const savedUsers = localStorage.getItem('users');
      const users: User[] = savedUsers ? JSON.parse(savedUsers) : [INITIAL_ADMIN];
      
      // Find active user with matching username
      const user = users.find(u => u.username === username && u.active);
      if (!user) {
        console.log('User not found or inactive:', username);
        return false;
      }

      // Special handling for admin user
      if (username === 'admin' && password === 'admin') {
        const adminUser = { 
          ...INITIAL_ADMIN, 
          lastLogin: new Date().toISOString(),
          permissions: getDefaultPermissions('admin')
        };
        localStorage.setItem('session', JSON.stringify(adminUser));
        setUser(adminUser);
        return true;
      }

      // Verify password for non-admin users
      const isValidPassword = verifyPassword(password, user.password);
      if (!isValidPassword) {
        console.log('Invalid password for user:', username);
        return false;
      }

      // Update user's last login and ensure permissions are set
      const updatedUser = {
        ...user,
        lastLogin: new Date().toISOString(),
        permissions: user.permissions || getDefaultPermissions(user.role)
      };

      // Update user in users array
      const updatedUsers = users.map(u => 
        u.id === user.id ? updatedUser : u
      );
      localStorage.setItem('users', JSON.stringify(updatedUsers));

      // Set session
      localStorage.setItem('session', JSON.stringify(updatedUser));
      setUser(updatedUser);

      return true;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('session');
    setUser(null);
  };

  const updateSession = () => {
    if (user) {
      const savedUsers = localStorage.getItem('users');
      const users: User[] = savedUsers ? JSON.parse(savedUsers) : [];
      const currentUser = users.find(u => u.id === user.id);
      
      if (currentUser) {
        localStorage.setItem('session', JSON.stringify(currentUser));
        setUser(currentUser);
      } else {
        logout();
      }
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      isAdmin: user?.role === 'admin',
      login,
      logout,
      updateSession
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};