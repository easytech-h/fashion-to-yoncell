export type UserRole = 'admin' | 'user';

export interface UserPermissions {
  canManageUsers: boolean;
  canManageInventory: boolean;
  canManagePrices: boolean;
  canViewReports: boolean;
  canProcessSales: boolean;
  canViewAllSales: boolean;
  canManageSettings: boolean;
}

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
  permissions?: UserPermissions;
}

export interface UserActivity {
  id: string;
  userId: string;
  action: string;
  details: string;
  timestamp: string;
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
        canManageInventory: true,
        canManagePrices: false,
        canViewReports: true,
        canProcessSales: true,
        canViewAllSales: true,
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