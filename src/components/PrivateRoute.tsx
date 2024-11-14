import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { usePermissions } from '../hooks/usePermissions';
import { UserPermissions } from '../types/user';
import Unauthorized from './Unauthorized';

interface PrivateRouteProps {
  children: React.ReactNode;
  requiredPermission?: keyof UserPermissions;
  adminOnly?: boolean;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ 
  children, 
  requiredPermission,
  adminOnly = false 
}) => {
  const { isAuthenticated, isAdmin } = useAuth();
  const permissions = usePermissions();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (adminOnly && !isAdmin) {
    return <Unauthorized />;
  }

  if (requiredPermission && !permissions[requiredPermission]) {
    return <Unauthorized />;
  }

  return <>{children}</>;
};

export default PrivateRoute;