import React from "react";
import { Link, useLocation } from "react-router-dom";
import logo from "../assets/logo.png";

export default function Navbar() {
  const isLoggedIn = !!localStorage.getItem("loggedInUser");
  const location = useLocation();
  const logout = () => {
    localStorage.removeItem("loggedInUser");
    localStorage.removeItem("authToken");
    window.location.href = "/";
  };

  const links = [
    { to: "/", label: "Home" },
    { to: "/about", label: "About" },
    { to: "/services", label: "Services" },
    { to: "/projects", label: "Projects" },
    { to: "/loadcalculator", label: "Load Calculator" },
    { to: "/quotation", label: "Quotation" },
    { to: "/careers", label: "Careers" },
    { to: "/contact", label: "Contact" },
    ...(!isLoggedIn ? [{ to: "/login", label: "Login" }] : [])
  ];

  return (
    <>
      <nav
        style={{
          background: "linear-gradient(135deg, #ff9800 0%, #ff6b35 50%, #f57c00 100%)",
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
          position: "sticky",
          top: 0,
          zIndex: 150,
          width: "100%",
          padding: "0",
          margin: 0,
          borderBottom: "3px solid rgba(255, 255, 255, 0.2)"
        }}
        className="professional-navbar"
      >
        {/* Logo and Tagline Section */}
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "15px 0 10px 0",
          borderBottom: "2px solid rgba(255, 255, 255, 0.15)",
          background: "linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)"
        }}>
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "12px"
          }}>
            <img
              src={logo}
              alt="Syed Solar Energy Logo"
              style={{
                height: 50,
                width: 50,
                objectFit: "contain",
                borderRadius: "12px",
                boxShadow: "0 4px 15px rgba(255, 255, 255, 0.3)",
                background: "#fff",
                padding: "6px",
                border: "2px solid rgba(255, 255, 255, 0.3)"
              }}
            />
            <div style={{ textAlign: "center" }}>
              <h1 style={{
                color: "#fff",
                fontWeight: 900,
                fontSize: "24px",
                letterSpacing: "1px",
                fontFamily: "Poppins, Arial, sans-serif",
                textShadow: "0 2px 4px rgba(0,0,0,0.2)",
                margin: 0,
                lineHeight: 1.2
              }}>
                Syed Solar Energy
              </h1>
              <p style={{
                color: "#fffbe9",
                fontWeight: 500,
                fontSize: "13px",
                fontFamily: "Noto Nastaliq Urdu, 'Jameel Noori Nastaleeq', serif",
                margin: "3px 0 0 0",
                textShadow: "0 1px 3px rgba(0,0,0,0.2)",
                opacity: 0.95,
                letterSpacing: "0.5px"
              }}>
                صاف توانائی کے سفر کا روشن راستہ
              </p>
            </div>
          </div>
        </div>
        {/* Navigation Tabs Section */}
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "10px 15px",
          gap: "5px",
          flexWrap: "wrap",
          maxWidth: "100%"
        }}>
          {/* Navigation Links */}
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "4px",
            flexWrap: "wrap",
            flex: 1,
            maxWidth: isLoggedIn ? "calc(100% - 100px)" : "100%"
          }}>
            {links.map((link, index) => {
              const isActive = location.pathname === link.to;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  style={{
                    color: isActive ? "#ff6b35" : "#fff",
                    fontWeight: isActive ? 800 : 600,
                    textDecoration: "none",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "10px 14px",
                    fontSize: "13px",
                    letterSpacing: "0.3px",
                    borderRadius: "10px",
                    background: isActive 
                      ? "linear-gradient(135deg, #fff 0%, #fffbf7 100%)"
                      : "linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.05) 100%)",
                    border: isActive 
                      ? "2px solid rgba(255, 107, 53, 0.3)"
                      : "2px solid rgba(255,255,255,0.2)",
                    boxShadow: isActive
                      ? "0 6px 20px rgba(255, 255, 255, 0.3), 0 3px 10px rgba(255, 107, 53, 0.2), inset 0 1px 2px rgba(255,255,255,0.8)"
                      : "0 3px 10px rgba(0,0,0,0.1), inset 0 1px 2px rgba(255,255,255,0.2)",
                    cursor: "pointer",
                    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                    textShadow: isActive 
                      ? "0 1px 2px rgba(255, 107, 53, 0.3)"
                      : "0 1px 3px rgba(0,0,0,0.3)",
                    whiteSpace: "nowrap",
                    minWidth: "fit-content",
                    position: "relative",
                    overflow: "hidden",
                    transform: isActive ? "translateY(-2px)" : "none",
                    animationDelay: `${index * 0.05}s`
                  }}
                  className="professional-tab"
                >
                  <span style={{ position: "relative", zIndex: 1 }}>
                    {link.label}
                  </span>
                </Link>
              );
            })}
          </div>
          {/* Logout Button */}
          {isLoggedIn && (
            <button
              onClick={logout}
              style={{
                color: "#fff",
                background: "linear-gradient(135deg, #f44336 0%, #d32f2f 100%)",
                border: "2px solid rgba(255,255,255,0.3)",
                borderRadius: "10px",
                padding: "10px 18px",
                fontWeight: 700,
                fontSize: "13px",
                boxShadow: "0 5px 15px rgba(244, 67, 54, 0.4), 0 3px 8px rgba(0,0,0,0.2)",
                cursor: "pointer",
                letterSpacing: "0.3px",
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                textShadow: "0 1px 3px rgba(0,0,0,0.3)",
                whiteSpace: "nowrap",
                position: "relative",
                overflow: "hidden"
              }}
              className="professional-logout"
            >
              <span style={{ position: "relative", zIndex: 1 }}>Logout</span>
            </button>
          )}
        </div>
      </nav>
      {/* Professional Styles */}
      <style jsx>{`
        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }
        
        body {
          overflow-x: hidden;
        }
        
        .professional-navbar {
          width: 100vw;
          margin-left: calc(-50vw + 50%);
        }
        
        .professional-tab {
          animation: slideInDown 0.6s ease-out both;
        }
        
        .professional-tab::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
          transition: left 0.5s ease;
          z-index: 0;
        }
        
        .professional-tab:hover::before {
          left: 100%;
        }
        
        .professional-tab:hover {
          transform: translateY(-3px) scale(1.05);
          box-shadow: 0 8px 25px rgba(255, 255, 255, 0.4), 0 4px 15px rgba(255, 107, 53, 0.3);
          background: linear-gradient(135deg, #fff 0%, #fff8f0 100%);
          color: #ff6b35 !important;
          border-color: rgba(255, 107, 53, 0.5);
        }
        
        .professional-tab:active {
          transform: translateY(-1px) scale(1.02);
          transition: all 0.1s ease;
        }
        
        .professional-logout::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
          transition: left 0.5s ease;
          z-index: 0;
        }
        
        .professional-logout:hover::before {
          left: 100%;
        }
        
        .professional-logout:hover {
          transform: translateY(-3px) scale(1.05);
          box-shadow: 0 6px 20px rgba(244, 67, 54, 0.5), 0 3px 12px rgba(0,0,0,0.3);
          background: linear-gradient(135deg, #e53935 0%, #c62828 100%);
        }
        
        .professional-logout:active {
          transform: translateY(-1px) scale(1.02);
        }
        
        @keyframes slideInDown {
          0% {
            opacity: 0;
            transform: translateY(-20px) scale(0.9);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        
        /* Responsive Design */
        @media (max-width: 1200px) {
          .professional-tab {
            padding: 8px 10px !important;
            font-size: 12px !important;
          }
        }
        
        @media (max-width: 992px) {
          .professional-navbar h1 {
            font-size: 22px !important;
          }
          
          .professional-navbar p {
            font-size: 11px !important;
          }
        }
        
        @media (max-width: 768px) {
          .professional-navbar > div:first-child {
            padding: 12px 0 8px 0 !important;
          }
          
          .professional-navbar > div:last-child {
            padding: 8px 12px !important;
            gap: 3px !important;
          }
          
          .professional-navbar h1 {
            font-size: 20px !important;
          }
          
          .professional-navbar p {
            font-size: 10px !important;
          }
          
          .professional-tab {
            padding: 5px 7px !important;
            font-size: 10px !important;
          }
          
          .professional-logout {
            padding: 5px 10px !important;
            font-size: 10px !important;
          }
        }
        
        @media (max-width: 576px) {
          .professional-navbar img {
            height: 40px !important;
            width: 40px !important;
          }
          
          .professional-navbar h1 {
            font-size: 18px !important;
          }
          
          .professional-navbar p {
            font-size: 9px !important;
          }
          
          .professional-tab {
            padding: 4px 5px !important;
            font-size: 9px !important;
          }
          
          .professional-logout {
            padding: 4px 8px !important;
            font-size: 9px !important;
          }
        }
        
        /* Ensure no horizontal scroll */
        html, body {
          max-width: 100%;
          overflow-x: hidden;
        }
        
        .professional-navbar * {
          max-width: 100%;
        }
      `}</style>
    </>
  );
}