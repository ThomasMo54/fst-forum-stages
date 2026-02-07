import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import user_roles from "../../constants/user_roles.ts";

const AdminRoute: React.FC = () => {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated || !user!.roles.includes(user_roles.ADMIN)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default AdminRoute;