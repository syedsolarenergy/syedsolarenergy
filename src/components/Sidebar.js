// src/components/Sidebar.js
import React, { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  MdDashboard, MdInventory, MdBuild, MdReceipt, MdBarChart, MdStore,
  MdAdminPanelSettings, MdHistory, MdPeople, MdLockReset, MdMenu,
  MdMenuOpen, MdLogout, MdSettings
} from "react-icons/md";
import { FaTools, FaFileInvoice, FaUserCircle, FaCrown } from "react-icons/fa";
import { TbReportMoney } from "react-icons/tb";

// List of sidebar links and their permissions
const sidebarLinks = [
  {
    to: "/dashboard",
    label: "Dashboard",
    icon: <MdDashboard size={22} color="#FF9800" />,
    permission: { category: "dashboard", key: "view" },
    description: "Main dashboard overview"
  },
  {
    to: "/inventory",
    label: "Inventory",
    icon: <MdInventory size={22} color="#FFD600" />,
    permission: { category: "inventory", key: "view" },
    description: "Manage product inventory"
  },
  {
    to: "/repairs",
    label: "Repairs",
    icon: <FaTools size={21} color="#FF6B35" />,
    permission: { category: "repairs", key: "view" },
    description: "Handle repair requests"
  },
  {
    to: "/expenses",
    label: "Expenses",
    icon: <TbReportMoney size={21} color="#1E88E5" />,
    permission: { category: "expenses", key: "view" },
    description: "Track business expenses"
  },
  {
    to: "/reports",
    label: "Reports",
    icon: <MdBarChart size={22} color="#43A047" />,
    permission: { category: "reports", key: "view" },
    description: "View analytics and reports"
  },
  {
    to: "/productspage",
    label: "Products",
    icon: <MdStore size={22} color="#F44336" />,
    permission: { category: "products", key: "view" },
    description: "Manage product catalog"
  },
  {
    to: "/admin",
    label: "Admin",
    icon: <MdAdminPanelSettings size={22} color="#AB47BC" />,
    permission: { category: "userManagement", key: "view" },
    adminOnly: true,
    description: "System administration"
  },
  {
    to: "/followups",
    label: "Follow Ups",
    icon: <MdHistory size={22} color="#795548" />,
    permission: { category: "followups", key: "view" },
    description: "Track customer follow-ups"
  },
  {
    to: "/staff",
    label: "Staff",
    icon: <MdPeople size={22} color="#0288D1" />,
    permission: { category: "staff", key: "view" },
    description: "Manage staff members"
  },
  {
    to: "/quotationsoftware",
    label: "Quotation SW",
    icon: <FaFileInvoice size={19} color="#00BFAE" />,
    permission: { category: "quotations", key: "view" },
    description: "Generate quotations"
  },
  {
    to: "/changepassword",
    label: "Change Password",
    icon: <MdLockReset size={22} color="#C62828" />,
    permission: { category: "profile", key: "edit" },
    description: "Update your password"
  },
];

// Helper to get current user from localStorage
function getCurrentUser() {
  try {
    const loggedInUser = localStorage.getItem("loggedInUser");
    if (!loggedInUser) return null;
    
    const users = JSON.parse(localStorage.getItem("users") || "[]");
    const user = users.find(u => u.username === loggedInUser);
    
    // Return user with default permissions if not found
    return user || {
      username: loggedInUser,
      role: "user",
      fullName: loggedInUser,
      permissions: {
        dashboard: { view: true },
        inventory: { view: true },
        repairs: { view: true },
        expenses: { view: true },
        products: { view: true },
        followups: { view: true },
        staff: { view: true },
        quotations: { view: true },
        profile: { view: true, edit: true }
      }
    };
  } catch (error) {
    console.error("Error getting current user:", error);
    return null;
  }
}

export default function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [hoveredLink, setHoveredLink] = useState(null);
  const location = useLocation();

  // Auto-collapse on mobile
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsCollapsed(true);
      }
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Always show sidebar with fallback user if needed
  const currentUser = getCurrentUser() || {
    username: "guest",
    role: "user",
    fullName: "Guest User",
    permissions: {
      dashboard: { view: true },
      inventory: { view: true },
      repairs: { view: true },
      expenses: { view: true },
      products: { view: true },
      followups: { view: true },
      staff: { view: true },
      quotations: { view: true },
      profile: { view: true, edit: true }
    }
  };
  
  const isAdmin = currentUser?.role === "admin";
  const userName = currentUser?.fullName || currentUser?.username || "User";
  const userRole = currentUser?.role || "user";

  // Check permission for each link - more permissive approach
  const canAccess = (link) => {
    // Admin sees everything
    if (isAdmin) return true;
    
    // Admin-only links are restricted
    if (link.adminOnly && !isAdmin) return false;
    
    // For regular users, check permissions or default to true for basic navigation
    const { category, key } = link.permission;
    const hasPermission = currentUser?.permissions?.[category]?.[key];
    
    // If permission is explicitly false, deny access
    if (hasPermission === false) return false;
    
    // If no permission is set, allow access for basic navigation (default true)
    return hasPermission !== undefined ? hasPermission : true;
  };

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const handleLogout = () => {
    localStorage.removeItem("loggedInUser");
    localStorage.removeItem("authToken");
    window.location.href = "/login";
  };

  return (
    <>
      <aside
        style={{
          width: isCollapsed ? 85 : 320,
          background: "linear-gradient(180deg, #fff8f0 0%, #ffe0b2 50%, #ffcc80 100%)",
          color: "#222",
          height: "100vh",
          position: "fixed",
          left: 0,
          top: 0,
          overflowY: "auto",
          overflowX: "hidden",
          zIndex: 200,
          boxShadow: isCollapsed 
            ? "4px 0 20px rgba(255, 152, 0, 0.3)"
            : "8px 0 35px rgba(255, 152, 0, 0.35)",
          display: "flex",
          flexDirection: "column",
          transition: "all 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
          borderRight: "4px solid rgba(255, 152, 0, 0.2)",
          backdropFilter: "blur(10px)"
        }}
        className="professional-sidebar"
      >
        {/* Spacer for top margin */}
        <div style={{ height: "25px" }} />

        {/* Enhanced User Profile Section */}
        {!isCollapsed && currentUser && (
          <div
            style={{
              padding: "25px 20px",
              background: "linear-gradient(135deg, #fff9f0 0%, #ffe0b2 100%)",
              borderBottom: "3px solid rgba(255, 225, 188, 0.7)",
              margin: "15px 15px 20px 15px",
              borderRadius: "16px",
              boxShadow: "0 8px 25px rgba(255, 152, 0, 0.15), 0 4px 12px rgba(0,0,0,0.05)"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
              <div style={{ position: "relative" }}>
                <FaUserCircle size={45} color="#FF9800" />
                {isAdmin && (
                  <FaCrown 
                    size={16} 
                    color="#FFD700" 
                    style={{
                      position: "absolute",
                      top: -5,
                      right: -5,
                      filter: "drop-shadow(0 2px 4px rgba(255, 215, 0, 0.6))"
                    }}
                  />
                )}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ 
                  fontWeight: 800, 
                  fontSize: "18px", 
                  color: "#333",
                  marginBottom: "6px",
                  textShadow: "0 1px 3px rgba(0,0,0,0.1)"
                }}>
                  {userName}
                </div>
                <div style={{ 
                  fontSize: "14px", 
                  color: "#fff",
                  textTransform: "capitalize",
                  background: isAdmin 
                    ? "linear-gradient(135deg, #FF9800 0%, #ff6b35 100%)"
                    : "linear-gradient(135deg, #43A047 0%, #2e7d32 100%)",
                  padding: "4px 12px",
                  borderRadius: "12px",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  fontWeight: 700,
                  boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
                  textShadow: "0 1px 2px rgba(0,0,0,0.3)"
                }}>
                  {isAdmin && <FaCrown size={12} />}
                  {userRole}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Enhanced Nav Links */}
        <nav style={{ 
          flex: 1, 
          display: "flex", 
          flexDirection: "column", 
          padding: isCollapsed ? "20px 10px" : "20px 15px",
          transition: "padding 0.5s ease",
          gap: "8px"
        }}>
          {sidebarLinks
            .filter(link => canAccess(link))
            .map((link, index) => {
              const isActive = location.pathname === link.to;
              return (
                <NavLink
                  key={link.to}
                  to={link.to}
                  onMouseEnter={() => setHoveredLink(link.to)}
                  onMouseLeave={() => setHoveredLink(null)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: isCollapsed ? 0 : 20,
                    padding: isCollapsed ? "16px 10px" : "18px 25px",
                    color: isActive ? "#ff6b35" : "#333",
                    background: isActive
                      ? "linear-gradient(135deg, #fffde4 0%, #ffe0b2 50%, #fff3e0 100%)"
                      : hoveredLink === link.to 
                        ? "linear-gradient(135deg, #fff8f0 0%, #ffe0b2 100%)"
                        : "linear-gradient(135deg, #fff 0%, #fffbf7 100%)",
                    fontWeight: isActive ? 900 : 700,
                    textDecoration: "none",
                    borderRadius: isCollapsed ? 16 : 18,
                    fontSize: isCollapsed ? 0 : 17,
                    boxShadow: isActive
                      ? "0 12px 35px rgba(255, 208, 128, 0.6), 0 6px 18px rgba(255, 152, 0, 0.3), inset 0 2px 6px rgba(255,255,255,0.9)"
                      : hoveredLink === link.to
                        ? "0 10px 30px rgba(255, 152, 0, 0.4), 0 5px 15px rgba(0,0,0,0.1)"
                        : "0 6px 20px rgba(255, 208, 128, 0.25), 0 3px 8px rgba(0,0,0,0.05)",
                    border: isActive
                      ? "3px solid #ff9800"
                      : hoveredLink === link.to
                        ? "3px solid rgba(255, 152, 0, 0.5)"
                        : "3px solid rgba(255, 236, 179, 0.7)",
                    transform: isActive 
                      ? "translateY(-4px) scale(1.08)" 
                      : hoveredLink === link.to 
                        ? "translateY(-2px) scale(1.04)" 
                        : "none",
                    transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                    cursor: "pointer",
                    position: "relative",
                    overflow: "hidden",
                    justifyContent: isCollapsed ? "center" : "flex-start",
                    minHeight: isCollapsed ? 56 : "auto",
                    animationDelay: `${index * 0.08}s`
                  }}
                  className="professional-sidebar-link"
                  title={isCollapsed ? `${link.label} - ${link.description}` : ""}
                >
                  <span style={{
                    filter: "drop-shadow(0 3px 8px rgba(255, 247, 247, 0.7))",
                    minWidth: 36,
                    display: "inline-flex",
                    justifyContent: "center",
                    position: "relative",
                    zIndex: 1,
                    fontSize: isCollapsed ? "24px" : "26px",
                    transition: "font-size 0.5s ease"
                  }}>
                    {link.icon}
                  </span>
                  {!isCollapsed && (
                    <span style={{
                      opacity: isCollapsed ? 0 : 1,
                      transform: isCollapsed ? "translateX(-20px)" : "translateX(0)",
                      transition: "all 0.5s ease",
                      whiteSpace: "nowrap",
                      position: "relative",
                      zIndex: 1,
                      fontFamily: "Poppins, Arial, sans-serif",
                      letterSpacing: "0.3px"
                    }}>
                      {link.label}
                    </span>
                  )}
                </NavLink>
              );
            })}
        </nav>

        {/* Enhanced Logout Button */}
        <div style={{ 
          padding: isCollapsed ? "20px 10px 25px" : "20px 15px 25px",
          borderTop: "3px solid rgba(255, 225, 188, 0.6)"
        }}>
          <button
            onClick={handleLogout}
            style={{
              display: "flex",
              alignItems: "center",
              gap: isCollapsed ? 0 : 18,
              padding: isCollapsed ? "16px 10px" : "18px 25px",
              width: "100%",
              background: "linear-gradient(135deg, #f44336 0%, #d32f2f 100%)",
              color: "#fff",
              border: "3px solid rgba(255,255,255,0.3)",
              borderRadius: isCollapsed ? 16 : 18,
              fontSize: isCollapsed ? 0 : 17,
              fontWeight: 800,
              cursor: "pointer",
              boxShadow: "0 8px 25px rgba(244, 67, 54, 0.4), 0 4px 15px rgba(0,0,0,0.15)",
              transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
              justifyContent: isCollapsed ? "center" : "flex-start",
              textShadow: "0 2px 4px rgba(0,0,0,0.3)",
              letterSpacing: "0.3px"
            }}
            className="professional-logout-btn"
            title={isCollapsed ? "Logout" : ""}
          >
            <MdLogout size={isCollapsed ? 24 : 26} />
            {!isCollapsed && <span>Logout</span>}
          </button>
        </div>

        {/* Enhanced decorative bottom */}
        <div style={{
          height: "20px",
          background: "linear-gradient(180deg, transparent 0%, rgba(255, 152, 0, 0.1) 100%)",
          borderTop: "2px solid rgba(255, 225, 188, 0.5)"
        }} />
      </aside>

      {/* Toggle Button at Middle Edge */}
      <button
        onClick={toggleSidebar}
        style={{
          position: "fixed",
          top: "50%",
          left: isCollapsed ? 65 : 300,
          transform: "translateY(-50%)",
          width: 40,
          height: 60,
          borderRadius: "0 12px 12px 0",
          background: "linear-gradient(135deg, #ff9800 0%, #ff6b35 100%)",
          border: "none",
          color: "#fff",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "2px 0 15px rgba(255, 152, 0, 0.4), 0 4px 20px rgba(0,0,0,0.15)",
          zIndex: 210,
          transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
          fontSize: "18px",
          borderLeft: "3px solid rgba(255,255,255,0.3)"
        }}
        className="sidebar-toggle-edge"
        title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
      >
        {isCollapsed ? <MdMenuOpen size={20} /> : <MdMenu size={20} />}
      </button>

      {/* Professional Enhanced Styles */}
      <style>
        {`
          .professional-sidebar::-webkit-scrollbar {
            width: 10px;
          }
          
          .professional-sidebar::-webkit-scrollbar-track {
            background: rgba(255, 225, 188, 0.4);
            border-radius: 6px;
          }
          
          .professional-sidebar::-webkit-scrollbar-thumb {
            background: linear-gradient(180deg, #ff9800, #ff6b35);
            border-radius: 6px;
            border: 2px solid rgba(255, 255, 255, 0.3);
          }
          
          .professional-sidebar::-webkit-scrollbar-thumb:hover {
            background: linear-gradient(180deg, #f57c00, #e64a19);
          }
          
          .professional-sidebar-link::before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255, 152, 0, 0.2), transparent);
            transition: left 1s ease;
            z-index: 0;
          }
          
          .professional-sidebar-link:hover::before {
            left: 100%;
          }
          
          .sidebar-toggle-edge:hover {
            left: ${isCollapsed ? 70 : 305}px;
            transform: translateY(-50%) scale(1.1);
            box-shadow: 4px 0 25px rgba(255, 152, 0, 0.6), 0 6px 30px rgba(0,0,0,0.2);
            background: linear-gradient(135deg, #f57c00 0%, #e64a19 100%);
          }
          
          .sidebar-toggle-edge:active {
            transform: translateY(-50%) scale(0.95);
          }
          
          .professional-logout-btn:hover {
            transform: translateY(-3px) scale(1.05);
            box-shadow: 0 12px 35px rgba(244, 67, 54, 0.5), 0 6px 20px rgba(0,0,0,0.2);
            background: linear-gradient(135deg, #e53935 0%, #c62828 100%);
          }
          
          .professional-logout-btn:active {
            transform: translateY(-1px) scale(1.02);
          }
          
          @keyframes slideInLeft {
            0% {
              opacity: 0;
              transform: translateX(-30px) scale(0.9);
            }
            100% {
              opacity: 1;
              transform: translateX(0) scale(1);
            }
          }
          
          .professional-sidebar-link {
            animation: slideInLeft 0.6s ease-out both;
          }
          
          /* Enhanced tooltip for collapsed state */
          .professional-sidebar-link[title]:hover::after {
            content: attr(title);
            position: absolute;
            left: 100%;
            top: 50%;
            transform: translateY(-50%);
            background: linear-gradient(135deg, rgba(51, 51, 51, 0.95) 0%, rgba(0,0,0,0.9) 100%);
            color: white;
            padding: 12px 18px;
            border-radius: 12px;
            font-size: 14px;
            font-weight: 600;
            white-space: nowrap;
            z-index: 1000;
            margin-left: 20px;
            box-shadow: 0 8px 25px rgba(0,0,0,0.5), 0 4px 12px rgba(255, 152, 0, 0.3);
            pointer-events: none;
            opacity: 0;
            animation: fadeInTooltip 0.5s ease-out 0.7s both;
            max-width: 250px;
            border: 2px solid rgba(255, 152, 0, 0.3);
          }
          
          @keyframes fadeInTooltip {
            0% {
              opacity: 0;
              transform: translateY(-50%) translateX(-15px) scale(0.9);
            }
            100% {
              opacity: 1;
              transform: translateY(-50%) translateX(0) scale(1);
            }
          }
          
          /* Responsive design */
          @media (max-width: 768px) {
            .professional-sidebar {
              width: 85px !important;
            }
            .sidebar-toggle-edge {
              left: 65px !important;
            }
          }
          
          @media (max-width: 480px) {
            .professional-sidebar {
              width: 75px !important;
            }
            .sidebar-toggle-edge {
              left: 55px !important;
            }
          }
          
          /* Professional gradient animations */
          .professional-sidebar::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 5px;
            background: linear-gradient(90deg, #ff9800, #ff6b35, #f57c00, #ff9800);
            background-size: 200% 100%;
            animation: shimmer 3s ease-in-out infinite;
            z-index: 1;
          }
          
          @keyframes shimmer {
            0% { background-position: -200% 0; }
            100% { background-position: 200% 0; }
          }
          
          /* Smooth transitions for all elements */
          * {
            transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
          }
          
          /* Professional focus states */
          .professional-sidebar-link:focus,
          .professional-logout-btn:focus,
          .sidebar-toggle-edge:focus {
            outline: 3px solid rgba(255, 152, 0, 0.5);
            outline-offset: 2px;
          }
        `}
      </style>
    </>
  );
}