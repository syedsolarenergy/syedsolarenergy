// src/components/Sidebar.js
import React, { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  MdDashboard, MdInventory, MdBuild, MdReceipt, MdBarChart, MdStore,
  MdAdminPanelSettings, MdHistory, MdPeople, MdLockReset, MdMenu,
  MdMenuOpen, MdLogout
} from "react-icons/md";
import { FaTools, FaFileInvoice, FaUserCircle, FaCrown } from "react-icons/fa";
import { TbReportMoney } from "react-icons/tb";

// Compact sidebar links
const sidebarLinks = [
  {
    to: "/dashboard",
    label: "Dashboard",
    icon: <MdDashboard size={18} />,
    permission: { category: "dashboard", key: "view" }
  },
  {
    to: "/inventory",
    label: "Inventory",
    icon: <MdInventory size={18} />,
    permission: { category: "inventory", key: "view" }
  },
  {
    to: "/repairs",
    label: "Repairs",
    icon: <FaTools size={17} />,
    permission: { category: "repairs", key: "view" }
  },
  {
    to: "/expenses",
    label: "Expenses",
    icon: <TbReportMoney size={17} />,
    permission: { category: "expenses", key: "view" }
  },
  {
    to: "/reports",
    label: "Reports",
    icon: <MdBarChart size={18} />,
    permission: { category: "reports", key: "view" }
  },
  {
    to: "/productspage",
    label: "Products",
    icon: <MdStore size={18} />,
    permission: { category: "products", key: "view" }
  },
  {
    to: "/admin",
    label: "Admin",
    icon: <MdAdminPanelSettings size={18} />,
    permission: { category: "userManagement", key: "view" },
    adminOnly: true
  },
  {
    to: "/followups",
    label: "Follow Ups",
    icon: <MdHistory size={18} />,
    permission: { category: "followups", key: "view" }
  },
  {
    to: "/staff",
    label: "Staff",
    icon: <MdPeople size={18} />,
    permission: { category: "staff", key: "view" }
  },
  {
    to: "/quotationsoftware",
    label: "Quotations",
    icon: <FaFileInvoice size={16} />,
    permission: { category: "quotations", key: "view" }
  }
];

// Helper to get current user from localStorage
function getCurrentUser() {
  try {
    const loggedInUser = localStorage.getItem("loggedInUser");
    if (!loggedInUser) return null;
    
    const users = JSON.parse(localStorage.getItem("users") || "[]");
    const user = users.find(u => u.username === loggedInUser);
    
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

  // Check permission for each link
  const canAccess = (link) => {
    if (isAdmin) return true;
    if (link.adminOnly && !isAdmin) return false;
    
    const { category, key } = link.permission;
    const hasPermission = currentUser?.permissions?.[category]?.[key];
    
    if (hasPermission === false) return false;
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
          width: isCollapsed ? 60 : 220,
          background: "linear-gradient(180deg, #fff 0%, #f8f9fa 100%)",
          color: "#333",
          height: "100vh",
          position: "fixed",
          left: 0,
          top: 0,
          overflowY: "hidden",
          overflowX: "hidden",
          zIndex: 200,
          boxShadow: "4px 0 15px rgba(0, 0, 0, 0.1)",
          display: "flex",
          flexDirection: "column",
          transition: "all 0.3s ease",
          borderRight: "1px solid #e0e0e0"
        }}
      >
        {/* Compact Header */}
        <div style={{
          padding: isCollapsed ? "12px 8px" : "15px 12px",
          background: "linear-gradient(135deg, #FF6B35, #F7931E)",
          color: "white",
          borderBottom: "1px solid rgba(255,255,255,0.2)"
        }}>
          {!isCollapsed ? (
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <FaUserCircle size={28} />
              <div>
                <div style={{ 
                  fontWeight: 700, 
                  fontSize: "13px",
                  marginBottom: "1px"
                }}>
                  {userName.split(' ')[0]}
                </div>
                <div style={{ 
                  fontSize: "10px", 
                  opacity: 0.9,
                  textTransform: "capitalize",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px"
                }}>
                  {isAdmin && <FaCrown size={9} />}
                  {userRole}
                </div>
              </div>
            </div>
          ) : (
            <div style={{ textAlign: "center" }}>
              <FaUserCircle size={24} />
            </div>
          )}
        </div>

        {/* Compact Navigation */}
        <nav style={{ 
          flex: 1, 
          display: "flex", 
          flexDirection: "column",
          padding: "8px 6px",
          gap: "1px"
        }}>
          {sidebarLinks
            .filter(link => canAccess(link))
            .map((link) => {
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
                    gap: isCollapsed ? 0 : 10,
                    padding: isCollapsed ? "8px" : "8px 12px",
                    color: isActive ? "#FF6B35" : "#555",
                    background: isActive
                      ? "linear-gradient(90deg, #fff3e0, #ffe0b2)"
                      : hoveredLink === link.to 
                        ? "#f5f5f5"
                        : "transparent",
                    fontWeight: isActive ? 600 : 500,
                    textDecoration: "none",
                    borderRadius: 6,
                    fontSize: 12,
                    boxShadow: isActive
                      ? "0 2px 8px rgba(255, 107, 53, 0.2)"
                      : "none",
                    border: isActive
                      ? "1px solid rgba(255, 107, 53, 0.3)"
                      : "1px solid transparent",
                    transition: "all 0.2s ease",
                    cursor: "pointer",
                    justifyContent: isCollapsed ? "center" : "flex-start",
                    minHeight: 32
                  }}
                  title={isCollapsed ? link.label : ""}
                >
                  <span style={{
                    color: isActive ? "#FF6B35" : "#666",
                    minWidth: 20,
                    display: "flex",
                    justifyContent: "center"
                  }}>
                    {link.icon}
                  </span>
                  {!isCollapsed && (
                    <span style={{
                      whiteSpace: "nowrap",
                      fontSize: "12px",
                      fontWeight: isActive ? 600 : 500
                    }}>
                      {link.label}
                    </span>
                  )}
                </NavLink>
              );
            })}
        </nav>

        {/* Compact Bottom Section */}
        <div style={{ padding: "8px 6px" }}>
          {/* Change Password Button */}
          <NavLink
            to="/changepassword"
            style={{
              display: "flex",
              alignItems: "center",
              gap: isCollapsed ? 0 : 10,
              padding: isCollapsed ? "8px" : "8px 12px",
              color: "#666",
              background: "transparent",
              fontWeight: 500,
              textDecoration: "none",
              borderRadius: 6,
              fontSize: 12,
              transition: "all 0.2s ease",
              cursor: "pointer",
              justifyContent: isCollapsed ? "center" : "flex-start",
              minHeight: 32,
              marginBottom: "6px"
            }}
            title={isCollapsed ? "Change Password" : ""}
          >
            <span style={{
              color: "#666",
              minWidth: 20,
              display: "flex",
              justifyContent: "center"
            }}>
              <MdLockReset size={18} />
            </span>
            {!isCollapsed && (
              <span style={{
                whiteSpace: "nowrap",
                fontSize: "12px"
              }}>
                Change Password
              </span>
            )}
          </NavLink>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            style={{
              display: "flex",
              alignItems: "center",
              gap: isCollapsed ? 0 : 10,
              padding: isCollapsed ? "8px" : "8px 12px",
              width: "100%",
              background: "linear-gradient(135deg, #dc3545, #c82333)",
              color: "#fff",
              border: "none",
              borderRadius: 6,
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer",
              transition: "all 0.2s ease",
              justifyContent: isCollapsed ? "center" : "flex-start",
              minHeight: 32
            }}
            title={isCollapsed ? "Logout" : ""}
            onMouseOver={(e) => {
              e.target.style.background = "linear-gradient(135deg, #c82333, #bd2130)";
              e.target.style.transform = "translateY(-1px)";
            }}
            onMouseOut={(e) => {
              e.target.style.background = "linear-gradient(135deg, #dc3545, #c82333)";
              e.target.style.transform = "translateY(0)";
            }}
          >
            <MdLogout size={18} />
            {!isCollapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Toggle Button */}
      <button
        onClick={toggleSidebar}
        style={{
          position: "fixed",
          top: "50%",
          left: isCollapsed ? 50 : 200,
          transform: "translateY(-50%)",
          width: 28,
          height: 42,
          borderRadius: "0 8px 8px 0",
          background: "linear-gradient(135deg, #FF6B35, #F7931E)",
          border: "none",
          color: "#fff",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "2px 0 10px rgba(0,0,0,0.1)",
          zIndex: 210,
          transition: "all 0.3s ease",
          fontSize: "14px"
        }}
        title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        onMouseOver={(e) => {
          e.target.style.transform = "translateY(-50%) scale(1.1)";
          e.target.style.boxShadow = "2px 0 15px rgba(255, 107, 53, 0.3)";
        }}
        onMouseOut={(e) => {
          e.target.style.transform = "translateY(-50%) scale(1)";
          e.target.style.boxShadow = "2px 0 10px rgba(0,0,0,0.1)";
        }}
      >
        {isCollapsed ? <MdMenuOpen size={14} /> : <MdMenu size={14} />}
      </button>

      {/* Enhanced Styles */}
      <style>
        {`
          /* Tooltip for collapsed state */
          .collapsed-tooltip {
            position: relative;
          }
          
          .collapsed-tooltip:hover::after {
            content: attr(title);
            position: absolute;
            left: 100%;
            top: 50%;
            transform: translateY(-50%);
            background: rgba(0, 0, 0, 0.9);
            color: white;
            padding: 8px 12px;
            border-radius: 6px;
            font-size: 12px;
            font-weight: 500;
            white-space: nowrap;
            z-index: 1000;
            margin-left: 12px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            pointer-events: none;
            opacity: 0;
            animation: fadeInTooltip 0.3s ease-out 0.5s both;
          }
          
          @keyframes fadeInTooltip {
            0% {
              opacity: 0;
              transform: translateY(-50%) translateX(-10px);
            }
            100% {
              opacity: 1;
              transform: translateY(-50%) translateX(0);
            }
          }
          
          /* Smooth transitions */
          * {
            transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
          }
          
          /* Focus states for accessibility */
          a:focus,
          button:focus {
            outline: 2px solid rgba(255, 107, 53, 0.5);
            outline-offset: 2px;
          }
          
          /* Responsive design */
          @media (max-width: 768px) {
            aside {
              width: 60px !important;
            }
            .toggle-button {
              left: 50px !important;
            }
          }
          
          /* Improved scrollbar for larger screens */
          aside::-webkit-scrollbar {
            width: 4px;
          }
          
          aside::-webkit-scrollbar-track {
            background: transparent;
          }
          
          aside::-webkit-scrollbar-thumb {
            background: rgba(255, 107, 53, 0.3);
            border-radius: 2px;
          }
          
          aside::-webkit-scrollbar-thumb:hover {
            background: rgba(255, 107, 53, 0.5);
          }
        `}
      </style>
    </>
  );
}