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
//new pages
import FAQ from './pages/FAQ'; // 
import BlogList from "./pages/BlogList";
import BlogPost from "./pages/BlogPost";
import OfferVerification from "./pages/OfferVerification";
import InternshipVerification from "./pages/InternshipVerification";

// Enhanced Auth Pages (with Supabase integration)
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";

// Software (Protected) Pages
import Dashboard from "./pages/Dashboard";
import Inventory from "./pages/Inventory";
import Repairs from "./pages/Repairs";
import Expenses from "./pages/Expenses";
import Reports from "./pages/Reports";
import ProductsPage from "./pages/ProductsPage";
import FollowUps from "./pages/FollowUps";
import Staff from "./pages/Staff";
import Quotationsoftware from "./pages/Quotationsoftware";
import OfferLetter from "./pages/OfferLetter";
import Internship from "./pages/Internship";

// Enhanced Admin & Security Pages (with Supabase integration)
import Admin from "./pages/Admin";
import ChangePassword from "./pages/ChangePassword";

// Legacy Admin Panel (keeping for backward compatibility)
import AdminPanel from "./pages/AdminPanel";
import EmailVerified from "./pages/email-verified";
import CertificateVerification from './pages/CertificateVerification';


function AppContent() {
  const location = useLocation();
  const isLoggedIn = !!localStorage.getItem("loggedInUser");
  const sessionToken = localStorage.getItem("sessionToken");
  
  // Check if user has valid session (enhanced security)
  const hasValidSession = isLoggedIn && sessionToken;
  
  // Define routes where navbar should be hidden
  const authRoutes = ["/login", "/forgot-password", "/forgotpassword"];
  
  // Define software/protected routes where navbar should be hidden
  const softwareRoutes = [
    "/dashboard", 
    "/inventory", 
    "/repairs", 
    "/expenses", 
    "/reports", 
    "/productspage", 
    "/admin", 
    "/followups", 
    "/staff", 
    "/quotationsoftware", 
    "/change-password",
    "/changepassword",
    "/offer-generator",
    "/Internship",
  ];
  
  // Hide navbar on auth pages OR when logged in and on software pages
  const hideNavbar = authRoutes.includes(location.pathname.toLowerCase()) || 
                   (hasValidSession && softwareRoutes.includes(location.pathname.toLowerCase()));
  
  // Hide sidebar on auth pages only
  const hideSidebar = authRoutes.includes(location.pathname.toLowerCase());

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      {/* Sidebar only for logged-in software users (not on auth pages) */}
      {hasValidSession && !hideSidebar && <Sidebar />}
      
      <div style={{ 
        flex: 1, 
        marginLeft: hasValidSession && !hideSidebar ? 220 : 0,
        transition: "margin-left 0.3s ease"
      }}>
        {/* Navbar on public pages only (not on auth pages or software pages when logged in) */}
        {!hideNavbar && <Navbar />}
        
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
          //new routes
          <Route path="/faq" element={<FAQ />} />
          <Route path="/blog" element={<BlogList />} />
          <Route path="/blog/:slug" element={<BlogPost />} />
          <Route path="/verify-offer" element={<OfferVerification />} />
          <Route path="/verify-offer/:offerId" element={<OfferVerification />} />
          <Route path="/InternshipVerification" element={<InternshipVerification />} />
          <Route path="/verify-internship/:certificateId" element={<InternshipVerification />} />

          {/* Legacy Admin Panel (keeping for backward compatibility) */}
          <Route path="/adminpanel" element={<AdminPanel />} />
          <Route path="/email-verified" element={<EmailVerified />} />
          <Route path="/verify-certificate" element={<CertificateVerification />} />

          {/* Enhanced Auth Pages with Supabase Integration */}
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          {/* Legacy route for backward compatibility */}
          <Route path="/forgotpassword" element={<ForgotPassword />} />

          {/* Protected Software Pages */}
          <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/inventory" element={<PrivateRoute><Inventory /></PrivateRoute>} />
          <Route path="/repairs" element={<PrivateRoute><Repairs /></PrivateRoute>} />
          <Route path="/expenses" element={<PrivateRoute><Expenses /></PrivateRoute>} />
          <Route path="/reports" element={<PrivateRoute><Reports /></PrivateRoute>} />
          <Route path="/productspage" element={<PrivateRoute><ProductsPage /></PrivateRoute>} />
          <Route path="/followups" element={<PrivateRoute><FollowUps /></PrivateRoute>} />
          <Route path="/staff" element={<PrivateRoute><Staff /></PrivateRoute>} />
          <Route path="/quotationsoftware" element={<PrivateRoute><Quotationsoftware /></PrivateRoute>} />
          <Route path="/offer-generator" element={<PrivateRoute><OfferLetter /></PrivateRoute>} />
          <Route path="/Internship" element={<PrivateRoute><Internship /></PrivateRoute>} />

          {/* Enhanced Admin & Security Pages with Supabase Integration */}
          <Route path="/admin" element={<PrivateRoute><Admin /></PrivateRoute>} />
          <Route path="/change-password" element={<PrivateRoute><ChangePassword /></PrivateRoute>} />
          {/* Legacy route for backward compatibility */}
          <Route path="/changepassword" element={<PrivateRoute><ChangePassword /></PrivateRoute>} />

          {/* Fallback Route */}
          <Route path="*" element={
            <div style={{ 
              padding: 40, 
              textAlign: "center",
              color: "#666",
              fontSize: "18px",
              fontWeight: "600",
              minHeight: "50vh",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center"
            }}>
              <h2 style={{ 
                color: "#ff6600", 
                marginBottom: "20px",
                fontSize: "2.5rem",
                fontWeight: "800"
              }}>
                404 - Page Not Found
              </h2>
              <p style={{ 
                marginBottom: "30px",
                maxWidth: "500px",
                lineHeight: "1.6"
              }}>
                The page you're looking for doesn't exist or has been moved.
              </p>
              <button
                onClick={() => window.location.href = '/'}
                style={{
                  background: "linear-gradient(135deg, #FF6B35, #F7931E)",
                  color: "white",
                  border: "none",
                  borderRadius: "10px",
                  padding: "12px 25px",
                  fontSize: "16px",
                  fontWeight: "600",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                  boxShadow: "0 4px 15px rgba(255, 107, 53, 0.3)"
                }}
                onMouseOver={(e) => {
                  e.target.style.transform = "translateY(-2px)";
                  e.target.style.boxShadow = "0 6px 20px rgba(255, 107, 53, 0.4)";
                }}
                onMouseOut={(e) => {
                  e.target.style.transform = "translateY(0)";
                  e.target.style.boxShadow = "0 4px 15px rgba(255, 107, 53, 0.3)";
                }}
              >
                🏠 Back to Home
              </button>
            </div>
          } />
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