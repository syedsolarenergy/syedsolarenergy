import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import syedSolarLogo from "../assets/logo.png";

// Permission templates for different roles
const permissionTemplates = {
  admin: {
    dashboard: { view: true, export: true },
    userManagement: { view: true, add: true, edit: true, delete: true },
    reports: { view: true, generate: true },
    settings: { view: true, modify: true },
    dataExport: { customer: true, system: true },
    systemConfig: { view: true, modify: true },
  },
  manager: {
    dashboard: { view: true, export: true },
    userManagement: { view: true, add: true, edit: true, delete: false },
    reports: { view: true, generate: true },
    settings: { view: true, modify: false },
    dataExport: { customer: true, system: false },
    systemConfig: { view: true, modify: false },
  },
  user: {
    dashboard: { view: true, export: false },
    userManagement: { view: false, add: false, edit: false, delete: false },
    reports: { view: true, generate: false },
    settings: { view: false, modify: false },
    dataExport: { customer: false, system: false },
    systemConfig: { view: false, modify: false },
  },
  viewer: {
    dashboard: { view: true, export: false },
    userManagement: { view: false, add: false, edit: false, delete: false },
    reports: { view: true, generate: false },
    settings: { view: false, modify: false },
    dataExport: { customer: false, system: false },
    systemConfig: { view: false, modify: false },
  },
};

// Utility functions for permissions
const flattenPermissions = (permissions) => {
  const flattened = {};
  Object.entries(permissions).forEach(([category, perms]) => {
    Object.entries(perms).forEach(([action, value]) => {
      const key = `${category.toLowerCase().replace(/([A-Z])/g, '_$1')}_${action}`;
      flattened[key] = value;
    });
  });
  return flattened;
};

const unflattenPermissions = (flatPerms) => {
  const unflattened = {};
  Object.entries(flatPerms || {}).forEach(([key, value]) => {
    if (key.includes('_')) {
      const parts = key.split('_');
      const action = parts.pop();
      const category = parts.join('_').replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
      
      if (!unflattened[category]) unflattened[category] = {};
      unflattened[category][action] = value;
    }
  });
  return unflattened;
};

// Password hashing utilities (simple for demo - use bcrypt in production)
const hashPassword = async (password) => {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
};

// Toast notification component
const Toast = ({ message, type, onClose }) => (
  <div style={{
    position: 'fixed',
    top: '20px',
    right: '20px',
    background: type === 'error' ? '#ff4444' : type === 'success' ? '#44ff44' : '#4444ff',
    color: 'white',
    padding: '12px 20px',
    borderRadius: '8px',
    zIndex: 10000,
    boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
    fontSize: '14px',
    fontWeight: '600'
  }}>
    {message}
    <button 
      onClick={onClose}
      style={{
        background: 'none',
        border: 'none',
        color: 'white',
        marginLeft: '10px',
        cursor: 'pointer',
        fontSize: '16px'
      }}
    >
      ×
    </button>
  </div>
);

export default function Admin() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [activeTab, setActiveTab] = useState("users");
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [newUser, setNewUser] = useState({
    username: "",
    password: "",
    email: "",
    phone: "",
    department: "",
    role: "user",
    permissions: { ...permissionTemplates.user },
  });

  // Show toast notification
  const showToast = useCallback((message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), type === 'error' ? 5000 : 3000);
  }, []);

  // Check authentication and authorization
  const checkAuth = useCallback(async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error || !session) {
        navigate("/login", { replace: true });
        return false;
      }

      // Get user details and permissions
      const { data: userData, error: userError } = await supabase
        .from('admin_users')
        .select(`
          *,
          admin_permissions (*)
        `)
        .eq('id', session.user.id)
        .eq('is_active', true)
        .single();

      if (userError || !userData || userData.role !== 'admin') {
        showToast("Access denied. Admin privileges required.", 'error');
        navigate("/", { replace: true });
        return false;
      }

      setCurrentUser(userData);
      return true;
    } catch (error) {
      console.error('Auth check error:', error);
      navigate("/login", { replace: true });
      return false;
    }
  }, [navigate, showToast]);

  // Log admin activity
  const logActivity = useCallback(async (action, resource = null, resourceId = null, details = null) => {
    try {
      if (currentUser) {
        await supabase.from('admin_activity_log').insert({
          user_id: currentUser.id,
          action,
          resource,
          resource_id: resourceId,
          details,
          ip_address: '127.0.0.1', // In production, get real IP
          user_agent: navigator.userAgent
        });
      }
    } catch (error) {
      console.error('Failed to log activity:', error);
    }
  }, [currentUser]);

  // Load users from Supabase
  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('admin_users')
        .select(`
          *,
          admin_permissions (*),
          created_by:admin_users!admin_users_created_by_fkey (username)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Transform permissions back to nested structure
      const transformedUsers = data.map(user => ({
        ...user,
        permissions: user.admin_permissions?.length > 0 
          ? unflattenPermissions(user.admin_permissions[0]) 
          : {}
      }));

      setUsers(transformedUsers);
      await logActivity('VIEW_USERS', 'admin_users');
    } catch (error) {
      console.error('Error loading users:', error);
      showToast('Failed to load users: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  }, [logActivity, showToast]);

  // Add new user
  const addUser = async () => {
    try {
      // Validation
      if (!newUser.username?.trim() || !newUser.password?.trim() || !newUser.email?.trim()) {
        showToast("Please fill all required fields", 'error');
        return;
      }

      // Check if username or email already exists
      const { data: existingUser } = await supabase
        .from('admin_users')
        .select('username, email')
        .or(`username.eq.${newUser.username},email.eq.${newUser.email}`)
        .limit(1);

      if (existingUser?.length > 0) {
        showToast("Username or email already exists", 'error');
        return;
      }

      setLoading(true);

      // Hash password
      const hashedPassword = await hashPassword(newUser.password);

      // Insert user
      const { data: userData, error: userError } = await supabase
        .from('admin_users')
        .insert({
          username: newUser.username.trim(),
          password: hashedPassword,
          email: newUser.email.trim(),
          phone: newUser.phone?.trim() || null,
          department: newUser.department?.trim() || null,
          role: newUser.role,
          created_by: currentUser.id,
          is_active: true
        })
        .select()
        .single();

      if (userError) throw userError;

      // Insert permissions
      const flatPermissions = flattenPermissions(newUser.permissions);
      const { error: permError } = await supabase
        .from('admin_permissions')
        .insert({
          user_id: userData.id,
          ...flatPermissions
        });

      if (permError) throw permError;

      // Log activity
      await logActivity('CREATE_USER', 'admin_users', userData.id, {
        username: userData.username,
        role: userData.role
      });

      showToast("User added successfully!", 'success');
      
      // Reset form
      setNewUser({
        username: "",
        password: "",
        email: "",
        phone: "",
        department: "",
        role: "user",
        permissions: { ...permissionTemplates.user },
      });

      // Reload users
      await loadUsers();
    } catch (error) {
      console.error('Error adding user:', error);
      showToast('Failed to add user: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Toggle permission for a user
  const togglePermission = async (userId, category, permission, value) => {
    try {
      const flatKey = `${category.toLowerCase().replace(/([A-Z])/g, '_$1')}_${permission}`;
      
      const { error } = await supabase
        .from('admin_permissions')
        .update({ [flatKey]: value })
        .eq('user_id', userId);

      if (error) throw error;

      // Update local state
      setUsers(prevUsers => 
        prevUsers.map(user => {
          if (user.id === userId) {
            const updatedPermissions = { ...user.permissions };
            if (!updatedPermissions[category]) updatedPermissions[category] = {};
            updatedPermissions[category][permission] = value;
            return { ...user, permissions: updatedPermissions };
          }
          return user;
        })
      );

      // Log activity
      await logActivity('UPDATE_PERMISSION', 'admin_permissions', userId, {
        permission: flatKey,
        value
      });

      showToast(`Permission ${value ? 'granted' : 'revoked'} successfully`, 'success');
    } catch (error) {
      console.error('Error updating permission:', error);
      showToast('Failed to update permission: ' + error.message, 'error');
    }
  };

  // Update user role and permissions
  const updateUserRole = async (userId, newRole) => {
    try {
      // Update user role
      const { error: roleError } = await supabase
        .from('admin_users')
        .update({ role: newRole })
        .eq('id', userId);

      if (roleError) throw roleError;

      // Update permissions based on role template
      const rolePermissions = flattenPermissions(permissionTemplates[newRole]);
      const { error: permError } = await supabase
        .from('admin_permissions')
        .update(rolePermissions)
        .eq('user_id', userId);

      if (permError) throw permError;

      // Log activity
      await logActivity('UPDATE_USER_ROLE', 'admin_users', userId, {
        newRole,
        permissions: Object.keys(rolePermissions).length
      });

      showToast(`User role updated to ${newRole}`, 'success');
      await loadUsers();
    } catch (error) {
      console.error('Error updating user role:', error);
      showToast('Failed to update user role: ' + error.message, 'error');
    }
  };

  // Deactivate user
  const deactivateUser = async (userId, username) => {
    if (username === 'admin') {
      showToast("Cannot deactivate main admin user", 'error');
      return;
    }

    if (window.confirm(`Are you sure you want to deactivate user: ${username}?`)) {
      try {
        const { error } = await supabase
          .from('admin_users')
          .update({ is_active: false })
          .eq('id', userId);

        if (error) throw error;

        await logActivity('DEACTIVATE_USER', 'admin_users', userId, { username });
        showToast(`User ${username} deactivated successfully`, 'success');
        await loadUsers();
      } catch (error) {
        console.error('Error deactivating user:', error);
        showToast('Failed to deactivate user: ' + error.message, 'error');
      }
    }
  };

  // Get role badge color
  const getRoleBadgeColor = (role) => {
    const colors = {
      admin: '#ff6b6b',
      manager: '#4ecdc4',
      user: '#45b7d1',
      viewer: '#96ceb4'
    };
    return colors[role] || '#ddd';
  };

  // Permission field labels
  const permissionLabels = {
    dashboard: "Dashboard",
    userManagement: "User Management",
    reports: "Reports",
    settings: "Settings",
    dataExport: "Data Export",
    systemConfig: "System Config",
  };

  const permSubFields = {
    view: "View", export: "Export", add: "Add", edit: "Edit", delete: "Delete",
    generate: "Generate", modify: "Modify", customer: "Customer", system: "System",
  };

  // Initialize component
  useEffect(() => {
    const initComponent = async () => {
      const isAuthorized = await checkAuth();
      if (isAuthorized) {
        await loadUsers();
      }
    };
    initComponent();
  }, [checkAuth, loadUsers]);

  // Handle role change for new user
  const handleNewUserRoleChange = (role) => {
    setNewUser({
      ...newUser,
      role,
      permissions: { ...permissionTemplates[role] }
    });
  };

  if (loading && !currentUser) {
    return (
      <div style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "linear-gradient(135deg, #f5f7fa 0%, #ffe1bc 100%)"
      }}>
        <div style={{
          background: "white",
          padding: "30px",
          borderRadius: "15px",
          boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
          textAlign: "center"
        }}>
          <div style={{
            width: "40px",
            height: "40px",
            border: "4px solid #e67e22",
            borderTop: "4px solid transparent",
            borderRadius: "50%",
            animation: "spin 1s linear infinite",
            margin: "0 auto 15px"
          }}></div>
          <p style={{ color: "#e67e22", fontSize: "16px", fontWeight: "600" }}>
            Loading Admin Panel...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      minHeight: "100vh", 
      padding: "20px", 
      background: "linear-gradient(135deg, #f5f7fa 0%, #ffe1bc 100%)" 
    }}>
      {/* Toast Notification */}
      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast(null)} 
        />
      )}

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: "30px" }}>
        <button
          onClick={() => navigate(-1)}
          style={{
            padding: "10px 20px",
            border: "none",
            borderRadius: "10px",
            background: "linear-gradient(145deg, #555, #333)",
            color: "white",
            fontWeight: "bold",
            cursor: "pointer",
            boxShadow: "0 4px 15px rgba(0,0,0,0.2)",
            marginRight: "20px",
            transition: "transform 0.2s",
          }}
          onMouseOver={(e) => e.target.style.transform = "translateY(-2px)"}
          onMouseOut={(e) => e.target.style.transform = "translateY(0)"}
        >
          ← Back
        </button>
        
        <img src={syedSolarLogo} alt="logo" style={{ width: "50px", marginRight: "15px" }} />
        
        <div>
          <h1 style={{ fontSize: "1.8rem", color: "#e67e22", margin: "0", fontWeight: "800" }}>
            Syed Solar Admin
          </h1>
          <p style={{ fontSize: "0.9rem", color: "#666", margin: "5px 0 0 0" }}>
            Welcome back, {currentUser?.username} | Role: {currentUser?.role}
          </p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div style={{ marginBottom: "20px", display: "flex", gap: "15px" }}>
        {["users", "permissions", "activity"].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              fontWeight: "700",
              fontSize: "16px",
              border: "none",
              borderRadius: "10px",
              background: activeTab === tab 
                ? "linear-gradient(145deg, #e67e22, #d35400)" 
                : "linear-gradient(145deg, #fff, #f8f9fa)",
              color: activeTab === tab ? "#fff" : "#e67e22",
              boxShadow: activeTab === tab 
                ? "0 5px 20px rgba(230, 126, 34, 0.4)" 
                : "0 3px 10px rgba(0,0,0,0.1)",
              padding: "12px 25px",
              cursor: "pointer",
              transition: "all 0.3s ease",
              textTransform: "capitalize"
            }}
            onMouseOver={(e) => {
              if (activeTab !== tab) {
                e.target.style.transform = "translateY(-2px)";
                e.target.style.boxShadow = "0 5px 15px rgba(0,0,0,0.15)";
              }
            }}
            onMouseOut={(e) => {
              if (activeTab !== tab) {
                e.target.style.transform = "translateY(0)";
                e.target.style.boxShadow = "0 3px 10px rgba(0,0,0,0.1)";
              }
            }}
          >
            {tab === "users" ? "👥 Users" : tab === "permissions" ? "🔐 Permissions" : "📊 Activity"}
          </button>
        ))}
      </div>

      {/* User Management Tab */}
      {activeTab === "users" && (
        <div style={{
          background: "#fff",
          padding: "30px",
          borderRadius: "15px",
          boxShadow: "0 10px 30px rgba(230, 126, 34, 0.1)",
          border: "1px solid #ffe8d1"
        }}>
          <h2 style={{ color: "#e67e22", marginBottom: "25px", fontSize: "1.5rem", fontWeight: "700" }}>
            👥 User Management
          </h2>

          {/* Add New User Form */}
          <div style={{
            background: "linear-gradient(135deg, #fff8f0 0%, #fff4e6 100%)",
            padding: "25px",
            borderRadius: "12px",
            marginBottom: "30px",
            border: "2px solid #ffe8d1"
          }}>
            <h3 style={{ color: "#d35400", marginBottom: "20px", fontSize: "1.2rem" }}>
              ➕ Add New User
            </h3>
            
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "15px",
              marginBottom: "20px"
            }}>
              <input
                placeholder="👤 Username *"
                value={newUser.username}
                onChange={e => setNewUser({ ...newUser, username: e.target.value })}
                style={inputStyle}
                required
              />
              <input
                placeholder="🔒 Password *"
                type="password"
                value={newUser.password}
                onChange={e => setNewUser({ ...newUser, password: e.target.value })}
                style={inputStyle}
                required
              />
              <input
                placeholder="📧 Email *"
                type="email"
                value={newUser.email}
                onChange={e => setNewUser({ ...newUser, email: e.target.value })}
                style={inputStyle}
                required
              />
              <input
                placeholder="📱 Phone"
                value={newUser.phone}
                onChange={e => setNewUser({ ...newUser, phone: e.target.value })}
                style={inputStyle}
              />
              <input
                placeholder="🏢 Department"
                value={newUser.department}
                onChange={e => setNewUser({ ...newUser, department: e.target.value })}
                style={inputStyle}
              />
              <select
                value={newUser.role}
                onChange={e => handleNewUserRoleChange(e.target.value)}
                style={inputStyle}
              >
                <option value="viewer">👁️ Viewer</option>
                <option value="user">👤 User</option>
                <option value="manager">👨‍💼 Manager</option>
                <option value="admin">👑 Admin</option>
              </select>
            </div>

            <button
              onClick={addUser}
              disabled={loading}
              style={{
                ...buttonStyle,
                background: loading 
                  ? "linear-gradient(135deg, #ccc, #999)" 
                  : "linear-gradient(135deg, #27ae60, #229954)",
                cursor: loading ? "not-allowed" : "pointer",
                opacity: loading ? 0.7 : 1
              }}
            >
              {loading ? "⏳ Adding..." : "✅ Add User"}
            </button>
          </div>

          {/* Users Table */}
          <div style={{ overflowX: "auto" }}>
            <table style={{
              width: "100%",
              borderCollapse: "collapse",
              background: "#fff",
              borderRadius: "10px",
              overflow: "hidden",
              boxShadow: "0 5px 15px rgba(0,0,0,0.1)"
            }}>
              <thead>
                <tr style={{ background: "linear-gradient(135deg, #e67e22, #d35400)" }}>
                  <th style={{ ...thStyle, color: "white" }}>User</th>
                  <th style={{ ...thStyle, color: "white" }}>Contact</th>
                  <th style={{ ...thStyle, color: "white" }}>Role</th>
                  <th style={{ ...thStyle, color: "white" }}>Status</th>
                  <th style={{ ...thStyle, color: "white" }}>Last Login</th>
                  <th style={{ ...thStyle, color: "white" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user, index) => (
                  <tr key={user.id} style={{
                    background: index % 2 === 0 ? "#f8f9fa" : "white",
                    transition: "background 0.3s ease"
                  }}>
                    <td style={tdStyle}>
                      <div>
                        <div style={{ fontWeight: "600", color: "#333" }}>{user.username}</div>
                        <div style={{ fontSize: "12px", color: "#666" }}>{user.department}</div>
                      </div>
                    </td>
                    <td style={tdStyle}>
                      <div>
                        <div style={{ fontSize: "13px" }}>{user.email}</div>
                        <div style={{ fontSize: "12px", color: "#666" }}>{user.phone}</div>
                      </div>
                    </td>
                    <td style={tdStyle}>
                      <select
                        value={user.role}
                        onChange={e => updateUserRole(user.id, e.target.value)}
                        style={{
                          background: getRoleBadgeColor(user.role),
                          border: "none",
                          borderRadius: "15px",
                          padding: "5px 10px",
                          fontSize: "12px",
                          fontWeight: "600",
                          cursor: "pointer"
                        }}
                        disabled={user.username === 'admin'}
                      >
                        <option value="viewer">Viewer</option>
                        <option value="user">User</option>
                        <option value="manager">Manager</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td style={tdStyle}>
                      <span style={{
                        background: user.is_active ? "#d4edda" : "#f8d7da",
                        color: user.is_active ? "#155724" : "#721c24",
                        padding: "3px 8px",
                        borderRadius: "10px",
                        fontSize: "11px",
                        fontWeight: "600"
                      }}>
                        {user.is_active ? "🟢 Active" : "🔴 Inactive"}
                      </span>
                    </td>
                    <td style={tdStyle}>
                      {user.last_login 
                        ? new Date(user.last_login).toLocaleDateString()
                        : "Never"
                      }
                    </td>
                    <td style={tdStyle}>
                      <button
                        onClick={() => deactivateUser(user.id, user.username)}
                        disabled={user.username === 'admin'}
                        style={{
                          background: user.username === 'admin' 
                            ? "#ccc" 
                            : "linear-gradient(135deg, #e74c3c, #c0392b)",
                          color: "white",
                          border: "none",
                          borderRadius: "5px",
                          padding: "5px 10px",
                          fontSize: "11px",
                          cursor: user.username === 'admin' ? "not-allowed" : "pointer",
                          fontWeight: "600"
                        }}
                      >
                        {user.username === 'admin' ? "🔒 Protected" : "🗑️ Deactivate"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Permissions Management Tab */}
      {activeTab === "permissions" && (
        <div style={{
          background: "#fff",
          padding: "30px",
          borderRadius: "15px",
          boxShadow: "0 10px 30px rgba(230, 126, 34, 0.1)"
        }}>
          <h2 style={{ color: "#e67e22", marginBottom: "25px", fontSize: "1.5rem", fontWeight: "700" }}>
            🔐 Permission Management
          </h2>

          <div style={{ overflowX: "auto" }}>
            <table style={{
              minWidth: "1000px",
              width: "100%",
              borderCollapse: "collapse",
              background: "#fff",
              borderRadius: "10px",
              overflow: "hidden",
              boxShadow: "0 5px 15px rgba(0,0,0,0.1)"
            }}>
              <thead>
                <tr style={{ background: "linear-gradient(135deg, #e67e22, #d35400)" }}>
                  <th style={{ ...thStyle, color: "white", minWidth: "150px" }}>User</th>
                  {Object.keys(permissionTemplates.admin).map(category => (
                    <th key={category} style={{ ...thStyle, color: "white", minWidth: "120px" }}>
                      {permissionLabels[category]}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.filter(user => user.is_active).map((user, userIndex) => (
                  <tr key={user.id} style={{
                    background: userIndex % 2 === 0 ? "#f8f9fa" : "white"
                  }}>
                    <td style={{ ...tdStyle, fontWeight: "600" }}>
                      <div>
                        {user.username}
                        <span style={{
                          background: getRoleBadgeColor(user.role),
                          borderRadius: "10px",
                          padding: "2px 8px",
                          marginLeft: "8px",
                          fontSize: "10px",
                          fontWeight: "600"
                        }}>
                          {user.role}
                        </span>
                      </div>
                    </td>
                    
                    {Object.entries(permissionTemplates.admin).map(([category, permissions]) => (
                      <td key={category} style={tdStyle}>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "5px" }}>
                          {Object.keys(permissions).map(permission => (
                            <label key={permission} style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "3px",
                              fontSize: "11px",
                              cursor: "pointer",
                              padding: "2px 5px",
                              borderRadius: "5px",
                              background: user.permissions?.[category]?.[permission] 
                                ? "#d4edda" 
                                : "#f8d7da"
                            }}>
                              <input
                                type="checkbox"
                                checked={!!user.permissions?.[category]?.[permission]}
                                onChange={e => togglePermission(
                                  user.id, 
                                  category, 
                                  permission, 
                                  e.target.checked
                                )}
                                disabled={
                                  user.role === "admin" && 
                                  user.username === "admin" && 
                                  category === "userManagement" && 
                                  permission === "delete"
                                }
                                style={{ margin: 0 }}
                              />
                              <span style={{
                                color: user.permissions?.[category]?.[permission] 
                                  ? "#155724" 
                                  : "#721c24",
                                fontWeight: "600"
                              }}>
                                {permSubFields[permission] || permission}
                              </span>
                            </label>
                          ))}
                        </div>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{
            background: "linear-gradient(135deg, #fff3cd, #ffeaa7)",
            border: "1px solid #ffc107",
            borderRadius: "10px",
            padding: "15px",
            marginTop: "20px",
            fontSize: "13px",
            color: "#856404"
          }}>
            <div style={{ fontWeight: "700", marginBottom: "8px" }}>
              ⚠️ Important Notes:
            </div>
            <ul style={{ margin: "0", paddingLeft: "20px", lineHeight: "1.6" }}>
              <li>Permission changes are saved automatically and take effect immediately</li>
              <li>Main admin user's delete permissions cannot be revoked for security</li>
              <li>Role changes will reset permissions to role defaults</li>
              <li>All permission changes are logged for audit purposes</li>
            </ul>
          </div>
        </div>
      )}

      {/* Activity Log Tab */}
      {activeTab === "activity" && (
        <ActivityLog 
          currentUser={currentUser} 
          showToast={showToast}
        />
      )}

      {/* CSS Animations */}
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          
          table tr:hover {
            background: #e8f4f8 !important;
          }
          
          button:hover {
            transform: translateY(-1px);
          }
          
          input:focus, select:focus {
            outline: 2px solid #e67e22;
            outline-offset: 2px;
          }
        `}
      </style>
    </div>
  );
}

// Activity Log Component
const ActivityLog = ({ currentUser, showToast }) => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    action: '',
    dateFrom: '',
    dateTo: '',
    limit: 50
  });

  const loadActivities = useCallback(async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('admin_activity_log')
        .select(`
          *,
          admin_users!admin_activity_log_user_id_fkey (username, role)
        `)
        .order('created_at', { ascending: false })
        .limit(filters.limit);

      if (filters.action) {
        query = query.eq('action', filters.action);
      }
      
      if (filters.dateFrom) {
        query = query.gte('created_at', filters.dateFrom);
      }
      
      if (filters.dateTo) {
        query = query.lte('created_at', filters.dateTo + 'T23:59:59');
      }

      const { data, error } = await query;
      
      if (error) throw error;
      setActivities(data || []);
    } catch (error) {
      console.error('Error loading activities:', error);
      showToast('Failed to load activity log: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  }, [filters, showToast]);

  useEffect(() => {
    loadActivities();
  }, [loadActivities]);

  const getActionIcon = (action) => {
    const icons = {
      'LOGIN': '🔐',
      'LOGOUT': '🚪',
      'CREATE_USER': '👤➕',
      'UPDATE_USER': '👤✏️',
      'DEACTIVATE_USER': '👤❌',
      'UPDATE_PERMISSION': '🔐✏️',
      'UPDATE_USER_ROLE': '👑',
      'VIEW_USERS': '👥👁️',
      'VIEW_ACTIVITY': '📊👁️'
    };
    return icons[action] || '📝';
  };

  const formatActionName = (action) => {
    return action.replace(/_/g, ' ').toLowerCase()
      .replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <div style={{
      background: "#fff",
      padding: "30px",
      borderRadius: "15px",
      boxShadow: "0 10px 30px rgba(230, 126, 34, 0.1)"
    }}>
      <h2 style={{ color: "#e67e22", marginBottom: "25px", fontSize: "1.5rem", fontWeight: "700" }}>
        📊 Activity Log
      </h2>

      {/* Filters */}
      <div style={{
        background: "#f8f9fa",
        padding: "20px",
        borderRadius: "10px",
        marginBottom: "25px",
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
        gap: "15px"
      }}>
        <select
          value={filters.action}
          onChange={e => setFilters({...filters, action: e.target.value})}
          style={inputStyle}
        >
          <option value="">All Actions</option>
          <option value="LOGIN">Login</option>
          <option value="CREATE_USER">Create User</option>
          <option value="UPDATE_USER">Update User</option>
          <option value="DEACTIVATE_USER">Deactivate User</option>
          <option value="UPDATE_PERMISSION">Update Permission</option>
          <option value="UPDATE_USER_ROLE">Update Role</option>
        </select>

        <input
          type="date"
          value={filters.dateFrom}
          onChange={e => setFilters({...filters, dateFrom: e.target.value})}
          style={inputStyle}
          placeholder="From Date"
        />

        <input
          type="date"
          value={filters.dateTo}
          onChange={e => setFilters({...filters, dateTo: e.target.value})}
          style={inputStyle}
          placeholder="To Date"
        />

        <select
          value={filters.limit}
          onChange={e => setFilters({...filters, limit: parseInt(e.target.value)})}
          style={inputStyle}
        >
          <option value={25}>25 Records</option>
          <option value={50}>50 Records</option>
          <option value={100}>100 Records</option>
          <option value={200}>200 Records</option>
        </select>
      </div>

      {/* Activity Table */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "40px" }}>
          <div style={{
            width: "40px",
            height: "40px",
            border: "4px solid #e67e22",
            borderTop: "4px solid transparent",
            borderRadius: "50%",
            animation: "spin 1s linear infinite",
            margin: "0 auto 15px"
          }}></div>
          <p>Loading activities...</p>
        </div>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={{
            width: "100%",
            borderCollapse: "collapse",
            background: "#fff",
            borderRadius: "10px",
            overflow: "hidden",
            boxShadow: "0 5px 15px rgba(0,0,0,0.1)"
          }}>
            <thead>
              <tr style={{ background: "linear-gradient(135deg, #e67e22, #d35400)" }}>
                <th style={{ ...thStyle, color: "white" }}>Time</th>
                <th style={{ ...thStyle, color: "white" }}>User</th>
                <th style={{ ...thStyle, color: "white" }}>Action</th>
                <th style={{ ...thStyle, color: "white" }}>Resource</th>
                <th style={{ ...thStyle, color: "white" }}>Details</th>
                <th style={{ ...thStyle, color: "white" }}>IP Address</th>
              </tr>
            </thead>
            <tbody>
              {activities.map((activity, index) => (
                <tr key={activity.id} style={{
                  background: index % 2 === 0 ? "#f8f9fa" : "white"
                }}>
                  <td style={tdStyle}>
                    <div style={{ fontSize: "12px" }}>
                      {new Date(activity.created_at).toLocaleString()}
                    </div>
                  </td>
                  <td style={tdStyle}>
                    <div>
                      <div style={{ fontWeight: "600" }}>
                        {activity.admin_users?.username || 'System'}
                      </div>
                      <div style={{ fontSize: "11px", color: "#666" }}>
                        {activity.admin_users?.role}
                      </div>
                    </div>
                  </td>
                  <td style={tdStyle}>
                    <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                      <span>{getActionIcon(activity.action)}</span>
                      <span style={{ fontSize: "12px", fontWeight: "600" }}>
                        {formatActionName(activity.action)}
                      </span>
                    </div>
                  </td>
                  <td style={tdStyle}>
                    <span style={{ fontSize: "12px" }}>
                      {activity.resource || '-'}
                    </span>
                  </td>
                  <td style={tdStyle}>
                    <div style={{ fontSize: "11px", maxWidth: "200px" }}>
                      {activity.details ? (
                        <details>
                          <summary style={{ cursor: "pointer", color: "#e67e22" }}>
                            View Details
                          </summary>
                          <pre style={{ 
                            background: "#f8f9fa", 
                            padding: "8px", 
                            borderRadius: "5px",
                            fontSize: "10px",
                            overflow: "auto",
                            marginTop: "5px"
                          }}>
                            {JSON.stringify(activity.details, null, 2)}
                          </pre>
                        </details>
                      ) : '-'}
                    </div>
                  </td>
                  <td style={tdStyle}>
                    <span style={{ fontSize: "11px", fontFamily: "monospace" }}>
                      {activity.ip_address || '-'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activities.length === 0 && !loading && (
        <div style={{
          textAlign: "center",
          padding: "40px",
          color: "#666",
          fontSize: "16px"
        }}>
          📝 No activity records found for the selected filters.
        </div>
      )}
    </div>
  );
};

// Styles
const inputStyle = {
  padding: "12px 15px",
  border: "2px solid #ffe8d1",
  borderRadius: "8px",
  fontSize: "14px",
  transition: "border-color 0.3s ease",
  background: "#fff",
  boxSizing: "border-box"
};

const buttonStyle = {
  padding: "12px 25px",
  border: "none",
  borderRadius: "8px",
  fontSize: "14px",
  fontWeight: "600",
  cursor: "pointer",
  transition: "all 0.3s ease",
  boxShadow: "0 4px 15px rgba(0,0,0,0.1)"
};

const thStyle = {
  padding: "15px 12px",
  textAlign: "left",
  fontWeight: "700",
  fontSize: "13px",
  borderBottom: "2px solid #e67e22"
};

const tdStyle = {
  padding: "12px",
  borderBottom: "1px solid #f1f3f4",
  fontSize: "13px",
  verticalAlign: "top"
};