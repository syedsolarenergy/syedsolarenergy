import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import logo from "../assets/logo.png";

export default function Navbar() {
  const isLoggedIn = !!localStorage.getItem("loggedInUser");
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

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
        {/* Logo & Tagline */}
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "15px",
          background: "linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
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
            <div>
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

          {/* Hamburger for Mobile */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            style={{
              background: "transparent",
              border: "none",
              color: "#fff",
              fontSize: "28px",
              cursor: "pointer",
              display: "none"
            }}
            className="menu-toggle"
          >
            ☰
          </button>
        </div>

        {/* Navigation Links */}
        <div className={`menu-container ${menuOpen ? "open" : ""}`}>
          {links.map((link) => {
            const isActive = location.pathname === link.to;
            return (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMenuOpen(false)}
                style={{
                  color: isActive ? "#ff6b35" : "#fff",
                  fontWeight: isActive ? 800 : 600,
                  textDecoration: "none",
                  display: "inline-block",
                  padding: "10px 14px",
                  fontSize: "14px",
                  borderRadius: "10px",
                  textAlign: "center"
                }}
              >
                {link.label}
              </Link>
            );
          })}

          {isLoggedIn && (
            <button
              onClick={logout}
              style={{
                color: "#fff",
                background: "#d32f2f",
                padding: "8px 15px",
                borderRadius: "8px",
                border: "none",
                cursor: "pointer",
                fontSize: "13px"
              }}
            >
              Logout
            </button>
          )}
        </div>
      </nav>

      {/* Mobile menu styles */}
      <style jsx>{`
        .menu-toggle {
          display: none;
        }

        @media (max-width: 768px) {
          .menu-toggle {
            display: block;
          }
          .menu-container {
            position: fixed;
            top: 0;
            left: -100%;
            width: 70%;
            height: 100%;
            background: linear-gradient(135deg, #ff6b35, #ff9800);
            flex-direction: column;
            padding: 40px 20px;
            transition: left 0.3s ease;
            z-index: 200;
          }
          .menu-container.open {
            left: 0;
          }
          .menu-container a, .menu-container button {
            display: block;
            margin-bottom: 15px;
          }
        }
      `}</style>
    </>
  );
}
