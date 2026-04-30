import React from 'react';
import { Navigate } from 'react-router-dom';
import { isAndroid } from '../config/ApiConfig';

const AdminRoute = ({ children }) => {
  // On Android, redirect unauthorized users to main login (/) not admin-login
  // because mobile admins authenticate via MobileStartPage (MongoDB/port 4000)
  const loginRedirect = isAndroid() ? '/' : '/admin-login';
  try {
    const raw = localStorage.getItem('authUser');
    const adminSession = localStorage.getItem('adminSession');
    const user = raw ? JSON.parse(raw) : null;
    
    // Verify admin role (case-insensitive to support both Spring Boot ADMIN and MongoDB admin)
    const isAdmin = user?.role?.toLowerCase() === 'admin';
    const hasSession = adminSession === 'true';
    
    if (!user || !isAdmin || !hasSession) {
      return <Navigate to={loginRedirect} replace />;
    }
    return children;
  } catch (e) {
    return <Navigate to={loginRedirect} replace />;
  }
};

export default AdminRoute;
