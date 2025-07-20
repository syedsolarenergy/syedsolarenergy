import React, { useState, useEffect } from "react";
import syedSolarLogo from "../assets/logo.png";
import { useNavigate } from "react-router-dom";

// Permission templates (unchanged)
const permissionTemplates = {
  admin: {
    dashboard: { view: true, export: true },
    userManagement: { view: true, add: true, edit: true, delete: true },
    reports: { view: true, generate: true },
    settings: { view: true, modify: true },
    dataExport: { customer: true, system: true },
    systemConfig: { view: true, modify: true },
  },
  user: {
    dashboard: { view: true, export: false },
    userManagement: { view: false, add: false, edit: false, delete: false },
    reports: { view: true, generate: false },
    settings: { view: false, modify: false },
    dataExport: { customer: false, system: false },
    systemConfig: { view: false, modify: false },
  },
  manager: {
    dashboard: { view: true, export: true },
    userManagement: { view: true, add: true, edit: true, delete: false },
    reports: { view: true, generate: true },
    settings: { view: true, modify: false },
    dataExport: { customer: true, system: false },
    systemConfig: { view: true, modify: false },
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

// ----- MAIN COMPONENT -----
export default function Admin() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [activeTab, setActiveTab] = useState("users");
  const [newUser, setNewUser] = useState({
    username: "",
    password: "",
    email: "",
    role: "user",
    permissions: { ...permissionTemplates.user },
  });
  const [hoveredButton, setHoveredButton] = useState(null);

  // Permission field names for display
  const permissionLabels = {
    dashboard: "Dashboard",
    userManagement: "User Mgmt",
    reports: "Reports",
    settings: "Settings",
    dataExport: "Data Export",
    systemConfig: "System Config",
  };
  const permSubFields = {
    view: "View", export: "Export", add: "Add", edit: "Edit", delete: "Delete",
    generate: "Generate", modify: "Modify", customer: "Customer Data", system: "System Data",
  };

  // Redirect if not admin
  useEffect(() => {
    const currentUser = localStorage.getItem("loggedInUser");
    const allUsers = JSON.parse(localStorage.getItem("users") || "[]");
    const thisUser = allUsers.find(u => u.username === currentUser);
    if (!thisUser || thisUser.role !== "admin") {
      navigate("/", { replace: true });
    }
  }, [navigate]);

  // Load users
  useEffect(() => {
    let savedUsers = JSON.parse(localStorage.getItem("users") || "[]");
    setUsers(savedUsers);
  }, []);

  // Add or update users in localStorage
  const updateUsers = (nextUsers) => {
    setUsers(nextUsers);
    localStorage.setItem("users", JSON.stringify(nextUsers));
  };

  // Add User Handler
  const addUser = () => {
    if (!newUser.username || !newUser.password || !newUser.email) return alert("Fill all fields");
    if (users.some(u => u.username === newUser.username)) return alert("Username exists!");
    if (users.some(u => u.email === newUser.email)) return alert("Email exists!");
    const userToAdd = {
      ...newUser,
      id: Math.max(...users.map(u => u.id || 0), 0) + 1,
      permissions: { ...newUser.permissions },
      createdAt: new Date().toISOString(),
      lastActive: new Date().toISOString(),
    };
    updateUsers([...users, userToAdd]);
    setNewUser({
      username: "",
      password: "",
      email: "",
      role: "user",
      permissions: { ...permissionTemplates.user },
    });
    alert("User Added!");
  };

  // Permission toggle per user
  const togglePermission = (userIndex, category, perm, value) => {
    const nextUsers = [...users];
    nextUsers[userIndex].permissions[category][perm] = value;
    updateUsers(nextUsers);
  };

  // Role badge
  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'admin': return '#ffbdb5';
      case 'manager': return '#add8ff';
      case 'user': return '#a8ffe3';
      case 'viewer': return '#e5e6ff';
      default: return '#ddd';
    }
  };

  return (
    <div style={{ minHeight: "100vh", padding: 18, background: "linear-gradient(135deg, #f5f7fa 0%, #ffe1bc 100%)" }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 24 }}>
        <button
          onClick={() => navigate(-1)}
          style={{
            padding: "7px 14px",
            border: "none",
            borderRadius: 8,
            background: "linear-gradient(145deg, #555, #333)",
            color: "white", fontWeight: "bold", cursor: "pointer",
            boxShadow: "0 4px 8px #0002", marginRight: 20,
            transition: ".15s"
          }}
        >← Back</button>
        <img src={syedSolarLogo} alt="logo" style={{ width: 46, marginRight: 15 }} />
        <h1 style={{ fontSize: "1.5rem", color: "#e67e22", margin: 0 }}>Syed Solar Admin</h1>
      </div>

      {/* Tabs */}
      <div style={{ marginBottom: 16, display: "flex", gap: 10 }}>
        {["users", "permissions"].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              fontWeight: "bold", fontSize: 17, border: "none", borderRadius: 7,
              background: activeTab === tab ? "linear-gradient(145deg, #e67e22, #b83b00)" : "#fff",
              color: activeTab === tab ? "#fff" : "#e67e22",
              boxShadow: activeTab === tab ? "0 3px 14px #e67e2260" : "0 2px 5px #ff980022",
              padding: "7px 22px", cursor: "pointer", transition: ".18s"
            }}
          >{tab === "users" ? "Users" : "Permissions"}</button>
        ))}
      </div>

      {/* User Management Tab */}
      {activeTab === "users" && (
        <div style={{ background: "#fff", padding: 22, borderRadius: 9, boxShadow: "0 3px 18px #ffab0022" }}>
          <h2 style={{ color: "#e67e22", marginBottom: 18 }}>Add New User</h2>
          <div style={{ display: "flex", gap: 15, flexWrap: "wrap", marginBottom: 18 }}>
            <input placeholder="Username" value={newUser.username}
              onChange={e => setNewUser({ ...newUser, username: e.target.value })}
              style={inputStyle} />
            <input placeholder="Password" type="password" value={newUser.password}
              onChange={e => setNewUser({ ...newUser, password: e.target.value })}
              style={inputStyle} />
            <input placeholder="Email" type="email" value={newUser.email}
              onChange={e => setNewUser({ ...newUser, email: e.target.value })}
              style={inputStyle} />
            <select value={newUser.role}
              onChange={e => setNewUser({
                ...newUser,
                role: e.target.value,
                permissions: { ...permissionTemplates[e.target.value] }
              })}
              style={inputStyle}>
              <option value="user">User</option>
              <option value="manager">Manager</option>
              <option value="admin">Admin</option>
              <option value="viewer">Viewer</option>
            </select>
            <button onClick={addUser}
              style={{ ...inputStyle, background: "#ff9800", color: "#fff", cursor: "pointer", fontWeight: "bold" }}>
              Add
            </button>
          </div>
          {/* Users Table */}
          <table style={{ width: "100%", borderCollapse: "collapse", background: "#fff" }}>
            <thead>
              <tr>
                <th style={thStyle}>Username</th>
                <th style={thStyle}>Email</th>
                <th style={thStyle}>Role</th>
                <th style={thStyle}>Last Active</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u, i) => (
                <tr key={u.id}>
                  <td style={tdStyle}>{u.username}</td>
                  <td style={tdStyle}>{u.email}</td>
                  <td style={{ ...tdStyle, background: getRoleBadgeColor(u.role) }}>{u.role}</td>
                  <td style={tdStyle}>{u.lastActive ? new Date(u.lastActive).toLocaleString() : "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Permission Control Tab */}
      {activeTab === "permissions" && (
        <div style={{ background: "#fff", padding: 22, borderRadius: 9, boxShadow: "0 3px 18px #ffab0022" }}>
          <h2 style={{ color: "#e67e22", marginBottom: 18 }}>Edit User Permissions</h2>
          <div style={{ overflowX: "auto" }}>
            <table style={{ minWidth: 880, width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th style={thStyle}>User</th>
                  {Object.keys(permissionTemplates.admin).map(cat => (
                    <th key={cat} style={thStyle}>{permissionLabels[cat] || cat}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map((user, userIdx) => (
                  <tr key={user.id}>
                    <td style={tdStyle}>{user.username} <span style={{
                      background: getRoleBadgeColor(user.role),
                      borderRadius: 6,
                      padding: "2px 9px",
                      marginLeft: 9,
                      fontSize: 12
                    }}>{user.role}</span></td>
                    {Object.entries(permissionTemplates.admin).map(([cat, perms]) => (
                      <td key={cat} style={tdStyle}>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                          {Object.keys(perms).map(subPerm => (
                            <label key={subPerm} style={{ marginRight: 7, fontSize: 13 }}>
                              <input
                                type="checkbox"
                                checked={!!user.permissions?.[cat]?.[subPerm]}
                                onChange={e =>
                                  togglePermission(userIdx, cat, subPerm, e.target.checked)
                                }
                                style={{ marginRight: 3 }}
                                disabled={user.role === "admin" && user.username === "admin" && cat === "userManagement" && subPerm === "delete"}
                              />
                              {permSubFields[subPerm] || subPerm}
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
          <div style={{ color: "#b83b00", fontSize: 14, marginTop: 10 }}>
            <b>Note:</b> Any change is instantly saved and active.<br />
            (You cannot remove delete rights from the main admin.)
          </div>
        </div>
      )}
    </div>
  );
}

// --- styling helpers ---
const inputStyle = {
  padding: "7px 13px",
  border: "1.5px solid #ddd",
  borderRadius: 7,
  marginRight: 3,
  fontSize: 15,
  minWidth: 120
};
const thStyle = {
  padding: "9px 15px",
  background: "#ffedcd",
  color: "#b83b00",
  fontWeight: 700,
  borderBottom: "2px solid #ff9800",
  fontSize: 15
};
const tdStyle = {
  padding: "7px 10px",
  borderBottom: "1px solid #f7c882",
  fontSize: 15
};
