import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient"; // <--- Make sure to import this

function ChangePassword() {
  const navigate = useNavigate();
  const username = localStorage.getItem("loggedInUser");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isButtonHovered, setIsButtonHovered] = useState(false);

  const handleChangePassword = async (e) => {
    e.preventDefault();
    // Local users array for offline use
    const users = JSON.parse(localStorage.getItem("users")) || [];
    const userIndex = users.findIndex(
      (u) => u.username === username && u.password === oldPassword
    );

    if (userIndex === -1) {
      alert("❌ Old password is incorrect.");
      return;
    }

    if (newPassword !== confirmPassword) {
      alert("❌ New passwords do not match.");
      return;
    }

    // --- Log password change in Supabase ---
    await supabase.from("password_changes").insert([
      {
        username,
        old_password: oldPassword,
        new_password: newPassword,
        changed_at: new Date().toISOString(),
      },
    ]);

    // --- Update Supabase users table ---
    await supabase
      .from("users")
      .update({ password: newPassword })
      .eq("username", username);

    // --- Update localStorage as before ---
    users[userIndex].password = newPassword;
    localStorage.setItem("users", JSON.stringify(users));

    alert("✅ Password changed successfully.");
    navigate("/");
  };

  // --- Styles (same as before) ---
  const containerStyle = {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
    padding: "20px",
  };

  const formContainerStyle = {
    background: "rgba(255, 255, 255, 0.9)",
    padding: "40px",
    borderRadius: "15px",
    boxShadow: "0 10px 25px rgba(0, 0, 0, 0.2)",
    width: "100%",
    maxWidth: "400px",
    textAlign: "center",
  };

  const titleStyle = {
    fontSize: "2rem",
    marginBottom: "20px",
    color: "#e67e22",
    fontWeight: "700",
  };

  const inputStyle = {
    width: "100%",
    padding: "15px",
    margin: "10px 0",
    border: "1px solid #ddd",
    borderRadius: "8px",
    fontSize: "16px",
    boxSizing: "border-box",
  };

  const buttonStyle = {
    width: "100%",
    padding: "15px",
    background: "linear-gradient(135deg, #e67e22, #d35400)",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontSize: "16px",
    cursor: "pointer",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
    transition: "transform 0.2s, box-shadow 0.2s",
  };

  const buttonHoverStyle = {
    transform: "translateY(-2px)",
    boxShadow: "0 6px 12px rgba(0, 0, 0, 0.15)",
  };

  return (
    <div style={containerStyle}>
      <div style={formContainerStyle}>
        <h2 style={titleStyle}>🔑 Change Password</h2>
        <form onSubmit={handleChangePassword}>
          <input
            type="password"
            placeholder="🔒 Old Password"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            required
            style={inputStyle}
          />
          <input
            type="password"
            placeholder="🔐 New Password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            style={inputStyle}
          />
          <input
            type="password"
            placeholder="🔐 Confirm New Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            style={inputStyle}
          />
          <button
            type="submit"
            style={{ ...buttonStyle, ...(isButtonHovered ? buttonHoverStyle : {}) }}
            onMouseOver={() => setIsButtonHovered(true)}
            onMouseOut={() => setIsButtonHovered(false)}
          >
            Update Password
          </button>
        </form>
      </div>
    </div>
  );
}

export default ChangePassword;
