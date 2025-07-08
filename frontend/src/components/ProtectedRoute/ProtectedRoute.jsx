import React, { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const [isChecking, setIsChecking] = useState(true);
  const [isValid, setIsValid] = useState(false);
  const API_BASE_URL = process.env.REACT_APP_API_BACKEND_URL;
  const navigate = useNavigate();

  useEffect(() => {
    const checkSession = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}api/auth/session`, {
          method: 'GET',
          credentials: 'include',
        });

        if (res.status === 200) {
          setIsValid(true);
        } else {
          localStorage.clear();
          setIsValid(false);
        }
      } catch (err) {
        localStorage.clear();
        setIsValid(false);
      } finally {
        setIsChecking(false);
      }
    };

    checkSession();
  }, [API_BASE_URL]);

  if (isChecking) return <div className="protected-loading">Loading...</div>;

  if (!isValid) return <Navigate to="/login" replace />;

  return children;
};

export default ProtectedRoute;
