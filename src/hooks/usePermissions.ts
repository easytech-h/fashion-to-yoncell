import { useAuth } from '../context/AuthContext';
import { getDefaultPermissions, UserPermissions } from '../types/user';

export const usePermissions = (): UserPermissions => {
  const { user } = useAuth();
  return user ? getDefaultPermissions(user.role) : getDefaultPermissions('user');
};