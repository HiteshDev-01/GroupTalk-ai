import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Home from "../screens/Home.jsx";
import Register from "../screens/Register.jsx";
import Login from "../screens/Login.jsx";
import Project from "../screens/Project.jsx";
import { UserContext, userTheme } from "../context/user.context.jsx";
import { isTokenExpired } from "../helper/checkTokenExp.js";

const AppRoutes = () => {
  const [loading, setLoading] = useState(false);
  const { user, token, setToken } = userTheme(UserContext);

  const ProtectedRoute = ({ children }) => {
    const token = localStorage.getItem('token');

    // Redirect to login if token is missing or expired
    if (!token || isTokenExpired(token)) {
      return <Navigate to="/login" />;
    }

    return <>{children}</>;
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    setToken(token);

    // Token validation logic is only for app initialization, not for specific routes.
    if (token && !isTokenExpired(token)) {
      setLoading(false);
    } else {
      setLoading(false);
    }
  }, [token]);

  if (loading) {
    return (<div>
      Loading...
    </div>)
  }

  return (
    <Routes>
      <Route path="/" element={
        <ProtectedRoute>
          <Home />
        </ProtectedRoute>}
      />
      <Route path="/register" element={<Register />}
      />
      <Route path="/login" element={<Login />} />
      <Route path="/project" element={
        <ProtectedRoute>
          <Project />
        </ProtectedRoute>}
      />
    </Routes>
  );
};

export default AppRoutes;
