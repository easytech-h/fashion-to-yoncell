import { UserRole } from './types';

export interface User {
  id: string;
  username: string;
  password: string;
  role: UserRole;
  fullName: string;
  email: string;
  active: boolean;
  createdAt: string;
  lastLogin: string | null;
}

export interface UserActivity {
  id: string;
  userId: string;
  action: string;
  details: string;
  timestamp: string;
}

export interface UserPermissions {
  canManageUsers: boolean;
  canManageInventory: boolean;
  canManagePrices: boolean;
  canViewReports: boolean;
  canProcessSales: boolean;
  canViewAllSales: boolean;
  canManageSettings: boolean;
}

export const getDefaultPermissions = (role: UserRole): UserPermissions => {
  switch (role) {
    case 'admin':
      return {
        canManageUsers: true,
        canManageInventory: true,
        canManagePrices: true,
        canViewReports: true,
        canProcessSales: true,
        canViewAllSales: true,
        canManageSettings: true
      };
    case 'user':
      return {
        canManageUsers: false,
        canManageInventory: false,
        canManagePrices: false,
        canViewReports: true, // Allow regular users to view reports
        canProcessSales: true,
        canViewAllSales: true, // Allow regular users to view all sales
        canManageSettings: false
      };
    default:
      return {
        canManageUsers: false,
        canManageInventory: false,
        canManagePrices: false,
        canViewReports: false,
        canProcessSales: false,
        canViewAllSales: false,
        canManageSettings: false
      };
  }
};