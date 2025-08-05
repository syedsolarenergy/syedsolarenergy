// src/App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import PrivateRoute from "./components/PrivateRoute";
import "./styles/Responsive.css";

// Public Pages
import Home from "./pages/Home";
import About from "./pages/About";
import Services from "./pages/Services";
import Projects from "./pages/Projects";
import LoadCalculator from "./pages/LoadCalculator";
import Quotation from "./pages/Quotation";
import Careers from "./pages/Careers";
import Contact from "./pages/Contact";

// Auth Pages
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";

// Software (Protected) Pages
import Dashboard from "./pages/Dashboard";
import Inventory from "./pages/Inventory";
import Repairs from "./pages/Repairs";
import Expenses from "./pages/Expenses";
import Reports from "./pages/Reports";
import ProductsPage from "./pages/ProductsPage";
import Admin from "./pages/Admin";
import FollowUps from "./pages/FollowUps";
import Staff from "./pages/Staff";
import Quotationsoftware from "./pages/Quotationsoftware";
import ChangePassword from "./pages/ChangePassword";

// New Admin Panel (public login)
import AdminPanel from "./pages/AdminPanel";
import EmailVerified from "./pages/email-verified";


function AppContent() {
  const location = useLocation();
  const isLoggedIn = !!localStorage.getItem("loggedInUser");
  const hideNavbarOrSidebar = ["/login", "/forgotpassword"].includes(location.pathname.toLowerCase());

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      {/* Sidebar only for logged-in software users */}
      {isLoggedIn && !hideNavbarOrSidebar && <Sidebar />}
      <div style={{ flex: 1, marginLeft: isLoggedIn && !hideNavbarOrSidebar ? 220 : 0 }}>
        {/* Navbar on all pages except login/forgot */}
        {!hideNavbarOrSidebar && <Navbar />}
        <Routes>
          {/* Public Website Pages */}
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/services" element={<Services />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/loadcalculator" element={<LoadCalculator />} />
          <Route path="/quotation" element={<Quotation />} />
          <Route path="/careers" element={<Careers />} />
          <Route path="/contact" element={<Contact />} />

          {/* Public Admin Panel (new) */}
          <Route path="/adminpanel" element={<AdminPanel />} />
          <Route path="/email-verified" element={<EmailVerified />} />


          {/* Auth Pages */}
          <Route path="/login" element={<Login />} />
          <Route path="/forgotpassword" element={<ForgotPassword />} />

          {/* Protected Software Pages */}
          <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/inventory" element={<PrivateRoute><Inventory /></PrivateRoute>} />
          <Route path="/repairs" element={<PrivateRoute><Repairs /></PrivateRoute>} />
          <Route path="/expenses" element={<PrivateRoute><Expenses /></PrivateRoute>} />
          <Route path="/reports" element={<PrivateRoute><Reports /></PrivateRoute>} />
          <Route path="/productspage" element={<PrivateRoute><ProductsPage /></PrivateRoute>} />
          <Route path="/admin" element={<PrivateRoute><Admin /></PrivateRoute>} />
          <Route path="/followups" element={<PrivateRoute><FollowUps /></PrivateRoute>} />
          <Route path="/staff" element={<PrivateRoute><Staff /></PrivateRoute>} />
          <Route path="/quotationsoftware" element={<PrivateRoute><Quotationsoftware /></PrivateRoute>} />
          <Route path="/changepassword" element={<PrivateRoute><ChangePassword /></PrivateRoute>} />

          {/* Fallback Route */}
          <Route path="*" element={<div style={{ padding: 40 }}>404 - Page Not Found</div>} />
        </Routes>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}
