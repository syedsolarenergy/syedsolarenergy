import React from "react";
import { Navigate } from "react-router-dom";

export default function PrivateRoute({ children }) {
  const isLoggedIn = !!localStorage.getItem("loggedInUser"); // Or your auth logic
  return isLoggedIn ? children : <Navigate to="/login" />;
}
