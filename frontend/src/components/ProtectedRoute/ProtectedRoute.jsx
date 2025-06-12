import React from 'react';
import { Navigate } from 'react-router-dom';
import './ProtectedRoute.css';

const ProtectedRoute = ({ children }) => {
  const isLoggedIn = localStorage.getItem('isLoggedIn'); // Or use context/state

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
