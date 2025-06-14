import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requireAdmin = false }) => {
  const location = useLocation();
  const token = localStorage.getItem('token');
  const isAdmin = localStorage.getItem('is_admin') === 'true';

  useEffect(() => {
    if (!token) {
      // Store the attempted URL to redirect back after login
      localStorage.setItem('redirectUrl', location.pathname);
    }
  }, [token, location]);

  if (!token) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (requireAdmin && !isAdmin) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <>{children}</>;
}; 