import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import logo from './logo.svg';
import './App.css';
import Login from './components/Login/Login';
import Dashboard from './components/Dashboard/Dashboard';
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute';

import MainLayout from './layouts/MainLayout';
import AuthLayout from './layouts/AuthLayout';

function App() {
  const [msg, setMsg] = useState('');

  useEffect(() => {
    fetch("http://localhost:8080/api/hello")
      .then(res => res.text())
      .then(data => setMsg(data))
      .catch(err => console.error("Fetch error:", err));
  }, []);

  return (
      <Routes>
        {/* Default redirect to /login */}
      <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Auth pages - without Header */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
        </Route>

        {/* Protected main layout routes */}
        <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
          <Route path="/dashboard" element={<Dashboard />} />
          {/* Add more protected routes here */}
        </Route>

        {/* Catch-all redirect to login */}
      <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
  );
}

export default App;
