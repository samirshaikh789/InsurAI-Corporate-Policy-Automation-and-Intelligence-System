import React from "react";
import { Navigate } from "react-router-dom";

/**
 * PrivateRoute Component
 * Protects routes based on authentication and role
 * Supports: admin, employee, agent, hr
 */
const PrivateRoute = ({ children, role }) => {
  const token = localStorage.getItem("token");
  const userRole = localStorage.getItem("role");
  const isAdminLoggedIn = localStorage.getItem("adminLoggedIn");

  // Helper to check valid token
  const hasValidToken = token && typeof token === "string" && token.trim() !== "";

  // Role-based authentication checks
  switch (role) {
    case "admin":
      if (!isAdminLoggedIn && !hasValidToken) {
        return <Navigate to="/admin/login" replace />;
      }
      break;

    case "employee":
      if (!hasValidToken) {
        return <Navigate to="/employee/login" replace />;
      }
      break;

    case "agent":
      if (!hasValidToken) {
        return <Navigate to="/agent/login" replace />;
      }
      break;

    case "hr":
      if (!hasValidToken) {
        return <Navigate to="/hr/login" replace />;
      }
      break;

    default:
      // Unknown role - redirect to home
      return <Navigate to="/" replace />;
  }

  // Verify user has the correct role
  if (role && userRole && userRole.toLowerCase() !== role.toLowerCase()) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default PrivateRoute;
