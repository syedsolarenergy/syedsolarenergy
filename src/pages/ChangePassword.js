import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import syedSolarLogo from "../assets/logo.png";

// Password hashing utility
const hashPassword = async (password) => {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
};

// Password strength checker
const checkPasswordStrength = (password) => {
  const checks = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /\d/.test(password),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
  };
  
  const score = Object.values(checks).filter(Boolean).length;
  let strength = 'Very Weak';
  let color = '#ff4444';
  
  if (score >= 4) {
    strength = 'Strong';
    color = '#44ff44';
  } else if (score >= 3) {
    strength = 'Medium';
    color = '#ffaa44';
  } else if (score >= 2) {
    strength = 'Weak';
    color = '#ff8844';
  }
  
  return { checks, score, strength, color };
};

// Toast notification component
const ToastComponent = ({ message, type, onClose }) => (
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
    fontWeight: '600',
    maxWidth: '300px'
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

function ChangePassword() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [formData, setFormData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [showPasswords, setShowPasswords] = useState({
    old: false,
    new: false,
    confirm: false
  });
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const [toast, setToast] = useState(null);
  const [passwordStrength, setPasswordStrength] = useState(null);

  // Show toast notification
  const showToast = (message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), type === 'error' ? 5000 : 3000);
  };

  // Check authentication
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Get session token from localStorage
        const sessionToken = localStorage.getItem("sessionToken");
        
        if (!sessionToken) {
          showToast("Please log in to access this page", 'error');
          navigate("/login", { replace: true });
          return;
        }

        // Verify session token in Supabase
        const { data: sessionData, error: sessionError } = await supabase
          .from('admin_sessions')
          .select(`
            *,
            admin_users!inner (
              id, username, email, role, is_active, password
            )
          `)
          .eq('session_token', sessionToken)
          .eq('is_active', true)
          .gt('expires_at', new Date().toISOString())
          .single();

        if (sessionError || !sessionData) {
          showToast("Session expired. Please log in again.", 'error');
          localStorage.clear();
          navigate("/login", { replace: true });
          return;
        }

        const userData = sessionData.admin_users;
        
        if (!userData.is_active) {
          showToast("Account is inactive", 'error');
          navigate("/login", { replace: true });
          return;
        }

        // Update last activity
        await supabase
          .from('admin_sessions')
          .update({ last_activity: new Date().toISOString() })
          .eq('id', sessionData.id);

        setCurrentUser(userData);
      } catch (error) {
        console.error('Auth check error:', error);
        showToast("Authentication error occurred", 'error');
        navigate("/login", { replace: true });
      } finally {
        setInitializing(false);
      }
    };

    checkAuth();
  }, [navigate]);

  // Log activity helper
  const logActivity = async (action, details = null) => {
    try {
      if (currentUser) {
        await supabase.from('admin_activity_log').insert({
          user_id: currentUser.id,
          action,
          resource: 'password_change',
          details,
          ip_address: '127.0.0.1',
          user_agent: navigator.userAgent
        });
      }
    } catch (error) {
      console.error('Failed to log activity:', error);
    }
  };

  // Handle input changes
  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Check password strength for new password
    if (field === 'newPassword') {
      if (value) {
        setPasswordStrength(checkPasswordStrength(value));
      } else {
        setPasswordStrength(null);
      }
    }
  };

  // Toggle password visibility
  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
  };

  // Handle form submission
  const handleChangePassword = async (e) => {
    e.preventDefault();
    
    if (!currentUser) {
      showToast("User session not found", 'error');
      return;
    }

    // Validation
    if (!formData.oldPassword || !formData.newPassword || !formData.confirmPassword) {
      showToast("Please fill all fields", 'error');
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      showToast("New passwords do not match", 'error');
      return;
    }

    if (formData.newPassword.length < 6) {
      showToast("New password must be at least 6 characters long", 'error');
      return;
    }

    if (formData.oldPassword === formData.newPassword) {
      showToast("New password must be different from current password", 'error');
      return;
    }

    setLoading(true);

    try {
      // Verify old password
      const oldPasswordHash = await hashPassword(formData.oldPassword);
      
      if (currentUser.password !== oldPasswordHash) {
        showToast("Current password is incorrect", 'error');
        await logActivity('FAILED_PASSWORD_CHANGE', {
          reason: 'incorrect_old_password',
          username: currentUser.username
        });
        return;
      }

      // Hash new password
      const newPasswordHash = await hashPassword(formData.newPassword);

      // Start transaction-like operations
      try {
        // Log password change
        await supabase.from('admin_password_changes').insert({
          user_id: currentUser.id,
          old_password_hash: oldPasswordHash,
          new_password_hash: newPasswordHash,
          changed_by: currentUser.id,
          ip_address: '127.0.0.1',
          user_agent: navigator.userAgent
        });

        // Update password in admin_users table
        const { error: updateError } = await supabase
          .from('admin_users')
          .update({ 
            password: newPasswordHash,
            updated_at: new Date().toISOString()
          })
          .eq('id', currentUser.id);

        if (updateError) throw updateError;

        // Invalidate all existing sessions for this user except current session
        const currentSessionToken = localStorage.getItem("sessionToken");
        await supabase
          .from('admin_sessions')
          .update({ is_active: false })
          .eq('user_id', currentUser.id)
          .neq('session_token', currentSessionToken);

        // Log successful password change
        await logActivity('PASSWORD_CHANGE', {
          username: currentUser.username,
          changed_by: currentUser.username
        });

        showToast("Password changed successfully!", 'success');

        // Clear form
        setFormData({
          oldPassword: "",
          newPassword: "",
          confirmPassword: ""
        });
        setPasswordStrength(null);

        // Redirect to dashboard after 2 seconds
        setTimeout(() => {
          navigate("/dashboard", { replace: true });
        }, 2000);

      } catch (transactionError) {
        // If any part of the transaction fails, attempt rollback
        console.error('Transaction error:', transactionError);
        throw transactionError;
      }

    } catch (error) {
      console.error('Error changing password:', error);
      showToast('Failed to change password: ' + error.message, 'error');
      
      await logActivity('FAILED_PASSWORD_CHANGE', {
        reason: 'system_error',
        error: error.message,
        username: currentUser.username
      });
    } finally {
      setLoading(false);
    }
  };

  // Loading state
  if (initializing) {
    return (
      <div style={componentStyles.loadingContainer}>
        <div style={componentStyles.loadingCard}>
          <div style={componentStyles.spinner}></div>
          <p style={componentStyles.loadingText}>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={componentStyles.container}>
      {/* Toast Notification */}
      {toast && (
        <ToastComponent 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast(null)} 
        />
      )}

      {/* Background Animation */}
      <div style={componentStyles.backgroundAnimation}>
        <div style={componentStyles.circle1}></div>
        <div style={componentStyles.circle2}></div>
        <div style={componentStyles.circle3}></div>
      </div>

      <div style={componentStyles.formContainer}>
        {/* Header */}
        <div style={componentStyles.header}>
          <div style={componentStyles.logoSection}>
            <img src={syedSolarLogo} alt="Syed Solar Logo" style={componentStyles.logo} />
            <div style={componentStyles.logoGlow}></div>
          </div>
          
          <h2 style={componentStyles.title}>🔑 Change Password</h2>
          
          <div style={componentStyles.userInfo}>
            <div style={componentStyles.userDetails}>
              <span style={componentStyles.username}>👤 {currentUser?.username}</span>
              <span style={componentStyles.role}>
                Role: <span style={componentStyles.roleBadge}>{currentUser?.role}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div style={componentStyles.navigation}>
          <button
            onClick={() => navigate(-1)}
            style={componentStyles.backButton}
            onMouseOver={(e) => {
              e.target.style.transform = "translateY(-2px)";
              e.target.style.boxShadow = "0 6px 20px rgba(0,0,0,0.15)";
            }}
            onMouseOut={(e) => {
              e.target.style.transform = "translateY(0)";
              e.target.style.boxShadow = "0 4px 15px rgba(0,0,0,0.1)";
            }}
          >
            ← Back to Dashboard
          </button>
        </div>

        {/* Password Change Form */}
        <form onSubmit={handleChangePassword} style={componentStyles.form}>
          {/* Current Password */}
          <div style={componentStyles.inputGroup}>
            <label style={componentStyles.label}>🔒 Current Password</label>
            <div style={componentStyles.inputContainer}>
              <input
                type={showPasswords.old ? "text" : "password"}
                placeholder="Enter your current password"
                value={formData.oldPassword}
                onChange={(e) => handleInputChange('oldPassword', e.target.value)}
                required
                disabled={loading}
                style={componentStyles.input}
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility('old')}
                style={componentStyles.passwordToggle}
                disabled={loading}
              >
                {showPasswords.old ? "🙈" : "👁️"}
              </button>
            </div>
          </div>

          {/* New Password */}
          <div style={componentStyles.inputGroup}>
            <label style={componentStyles.label}>🔐 New Password</label>
            <div style={componentStyles.inputContainer}>
              <input
                type={showPasswords.new ? "text" : "password"}
                placeholder="Enter your new password"
                value={formData.newPassword}
                onChange={(e) => handleInputChange('newPassword', e.target.value)}
                required
                disabled={loading}
                style={componentStyles.input}
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility('new')}
                style={componentStyles.passwordToggle}
                disabled={loading}
              >
                {showPasswords.new ? "🙈" : "👁️"}
              </button>
            </div>
            
            {/* Password Strength Indicator */}
            {passwordStrength && (
              <div style={componentStyles.strengthContainer}>
                <div style={componentStyles.strengthHeader}>
                  <span>Password Strength: </span>
                  <span style={{ color: passwordStrength.color, fontWeight: 'bold' }}>
                    {passwordStrength.strength}
                  </span>
                </div>
                <div style={componentStyles.strengthBar}>
                  <div 
                    style={{
                      ...componentStyles.strengthFill,
                      width: `${(passwordStrength.score / 5) * 100}%`,
                      background: passwordStrength.color
                    }}
                  ></div>
                </div>
                <div style={componentStyles.strengthChecks}>
                  {Object.entries({
                    length: '8+ characters',
                    uppercase: 'Uppercase letter',
                    lowercase: 'Lowercase letter',
                    number: 'Number',
                    special: 'Special character'
                  }).map(([key, label]) => (
                    <div key={key} style={{
                      ...componentStyles.strengthCheck,
                      color: passwordStrength.checks[key] ? '#44ff44' : '#ff4444'
                    }}>
                      {passwordStrength.checks[key] ? '✓' : '✗'} {label}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Confirm New Password */}
          <div style={componentStyles.inputGroup}>
            <label style={componentStyles.label}>🔐 Confirm New Password</label>
            <div style={componentStyles.inputContainer}>
              <input
                type={showPasswords.confirm ? "text" : "password"}
                placeholder="Confirm your new password"
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                required
                disabled={loading}
                style={{
                  ...componentStyles.input,
                  borderColor: formData.confirmPassword && formData.newPassword !== formData.confirmPassword 
                    ? '#ff4444' : componentStyles.input.borderColor
                }}
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility('confirm')}
                style={componentStyles.passwordToggle}
                disabled={loading}
              >
                {showPasswords.confirm ? "🙈" : "👁️"}
              </button>
            </div>
            {formData.confirmPassword && formData.newPassword !== formData.confirmPassword && (
              <div style={componentStyles.errorText}>
                ❌ Passwords do not match
              </div>
            )}
          </div>

          {/* Security Notice */}
          <div style={componentStyles.securityNotice}>
            <div style={componentStyles.noticeHeader}>🛡️ Security Notice</div>
            <ul style={componentStyles.noticeList}>
              <li>Your password will be updated immediately</li>
              <li>Other sessions will remain active (except for security)</li>
              <li>Use a strong password with a mix of characters</li>
              <li>Don't reuse passwords from other accounts</li>
              <li>All password changes are logged for security</li>
            </ul>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || !formData.oldPassword || !formData.newPassword || !formData.confirmPassword || formData.newPassword !== formData.confirmPassword}
            style={{
              ...componentStyles.submitButton,
              opacity: loading || !formData.oldPassword || !formData.newPassword || !formData.confirmPassword || formData.newPassword !== formData.confirmPassword ? 0.6 : 1,
              cursor: loading || !formData.oldPassword || !formData.newPassword || !formData.confirmPassword || formData.newPassword !== formData.confirmPassword ? 'not-allowed' : 'pointer'
            }}
            onMouseOver={(e) => {
              if (!loading && formData.oldPassword && formData.newPassword && formData.confirmPassword && formData.newPassword === formData.confirmPassword) {
                e.target.style.transform = "translateY(-2px) scale(1.02)";
                e.target.style.boxShadow = "0 8px 25px rgba(230, 126, 34, 0.4)";
              }
            }}
            onMouseOut={(e) => {
              if (!loading) {
                e.target.style.transform = "translateY(0) scale(1)";
                e.target.style.boxShadow = "0 6px 20px rgba(230, 126, 34, 0.3)";
              }
            }}
          >
            {loading ? (
              <>
                <div style={componentStyles.buttonSpinner}></div>
                <span>Updating Password...</span>
              </>
            ) : (
              <>
                <span>🔄</span>
                <span>Update Password</span>
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <div style={componentStyles.footer}>
          <div style={componentStyles.footerDivider}></div>
          <p style={componentStyles.footerText}>
            🔐 Secure Password Management | Syed Solar Energy
          </p>
        </div>
      </div>

      {/* CSS Animations */}
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          
          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-15px); }
          }
          
          @keyframes pulse {
            0%, 100% { 
              opacity: 0.3;
              transform: translate(-50%, -50%) scale(1);
            }
            50% { 
              opacity: 0.6;
              transform: translate(-50%, -50%) scale(1.1);
            }
          }
          
          input:focus {
            outline: 2px solid rgba(230, 126, 34, 0.5) !important;
            outline-offset: 1px !important;
          }
        `}
      </style>
    </div>
  );
}

// Comprehensive Styles
const componentStyles = {
  container: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "linear-gradient(135deg, #FF6B35 0%, #F7931E 45%, #FFAB00 100%)",
    padding: "20px",
    position: "relative",
    overflow: "hidden"
  },

  loadingContainer: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "linear-gradient(135deg, #FF6B35 0%, #F7931E 45%, #FFAB00 100%)"
  },

  loadingCard: {
    background: "white",
    padding: "30px",
    borderRadius: "15px",
    boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
    textAlign: "center"
  },

  loadingText: {
    color: "#e67e22",
    fontSize: "16px",
    fontWeight: "600",
    marginTop: "15px",
    margin: "15px 0 0 0"
  },

  backgroundAnimation: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: "hidden",
    zIndex: 1
  },

  circle1: {
    position: "absolute",
    width: "200px",
    height: "200px",
    borderRadius: "50%",
    background: "rgba(255, 255, 255, 0.1)",
    top: "-100px",
    right: "-100px",
    animation: "float 8s ease-in-out infinite"
  },

  circle2: {
    position: "absolute",
    width: "150px",
    height: "150px",
    borderRadius: "50%",
    background: "rgba(255, 255, 255, 0.08)",
    bottom: "-75px",
    left: "-75px",
    animation: "float 6s ease-in-out infinite reverse"
  },

  circle3: {
    position: "absolute",
    width: "100px",
    height: "100px",
    borderRadius: "50%",
    background: "rgba(255, 255, 255, 0.05)",
    top: "30%",
    left: "20%",
    animation: "float 7s ease-in-out infinite"
  },

  formContainer: {
    background: "rgba(255, 255, 255, 0.95)",
    padding: "40px",
    borderRadius: "20px",
    boxShadow: "0 20px 60px rgba(0, 0, 0, 0.15)",
    width: "100%",
    maxWidth: "500px",
    backdropFilter: "blur(20px)",
    border: "1px solid rgba(255, 255, 255, 0.3)",
    zIndex: 2,
    position: "relative"
  },

  header: {
    textAlign: "center",
    marginBottom: "30px"
  },

  logoSection: {
    position: "relative",
    display: "inline-block",
    marginBottom: "20px"
  },

  logo: {
    width: "60px",
    height: "auto",
    borderRadius: "10px",
    filter: "brightness(1.1)"
  },

  logoGlow: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: "80px",
    height: "80px",
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(230, 126, 34, 0.2) 0%, transparent 70%)",
    animation: "pulse 3s ease-in-out infinite",
    zIndex: -1
  },

  title: {
    fontSize: "2rem",
    marginBottom: "15px",
    color: "#e67e22",
    fontWeight: "700",
    textShadow: "0 2px 4px rgba(0,0,0,0.1)"
  },

  userInfo: {
    background: "linear-gradient(135deg, #f8f9fa, #e9ecef)",
    padding: "15px",
    borderRadius: "12px",
    border: "1px solid #dee2e6"
  },

  userDetails: {
    display: "flex",
    flexDirection: "column",
    gap: "5px"
  },

  username: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#333"
  },

  role: {
    fontSize: "12px",
    color: "#666"
  },

  roleBadge: {
    background: "#e67e22",
    color: "white",
    padding: "2px 8px",
    borderRadius: "10px",
    fontSize: "10px",
    fontWeight: "600"
  },

  navigation: {
    marginBottom: "25px"
  },

  backButton: {
    background: "linear-gradient(135deg, #6c757d, #495057)",
    color: "white",
    border: "none",
    borderRadius: "10px",
    padding: "12px 20px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.3s ease",
    boxShadow: "0 4px 15px rgba(0,0,0,0.1)"
  },

  form: {
    display: "flex",
    flexDirection: "column",
    gap: "20px"
  },

  inputGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "8px"
  },

  label: {
    fontWeight: "600",
    color: "#333",
    fontSize: "14px"
  },

  inputContainer: {
    position: "relative"
  },

  input: {
    width: "100%",
    padding: "15px",
    paddingRight: "50px",
    border: "2px solid #ddd",
    borderRadius: "10px",
    fontSize: "16px",
    transition: "all 0.3s ease",
    background: "white",
    boxSizing: "border-box"
  },

  passwordToggle: {
    position: "absolute",
    right: "15px",
    top: "50%",
    transform: "translateY(-50%)",
    background: "none",
    border: "none",
    cursor: "pointer",
    fontSize: "16px",
    color: "#666",
    padding: "5px",
    borderRadius: "5px",
    transition: "all 0.3s ease"
  },

  strengthContainer: {
    marginTop: "10px",
    padding: "12px",
    background: "#f8f9fa",
    borderRadius: "8px",
    border: "1px solid #e9ecef"
  },

  strengthHeader: {
    fontSize: "12px",
    marginBottom: "8px",
    fontWeight: "600"
  },

  strengthBar: {
    width: "100%",
    height: "6px",
    background: "#e9ecef",
    borderRadius: "3px",
    overflow: "hidden",
    marginBottom: "10px"
  },

  strengthFill: {
    height: "100%",
    transition: "all 0.3s ease",
    borderRadius: "3px"
  },

  strengthChecks: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
    gap: "5px"
  },

  strengthCheck: {
    fontSize: "11px",
    fontWeight: "500"
  },

  errorText: {
    fontSize: "12px",
    color: "#dc3545",
    marginTop: "5px",
    fontWeight: "500"
  },

  securityNotice: {
    background: "linear-gradient(135deg, #fff3cd, #ffeaa7)",
    border: "1px solid #ffc107",
    borderRadius: "10px",
    padding: "15px"
  },

  noticeHeader: {
    fontWeight: "700",
    color: "#856404",
    marginBottom: "10px",
    fontSize: "14px"
  },

  noticeList: {
    margin: "0",
    paddingLeft: "20px",
    color: "#856404",
    fontSize: "12px",
    lineHeight: "1.5"
  },

  submitButton: {
    background: "linear-gradient(135deg, #e67e22, #d35400)",
    color: "white",
    border: "none",
    borderRadius: "12px",
    padding: "15px",
    fontSize: "16px",
    fontWeight: "700",
    cursor: "pointer",
    transition: "all 0.3s ease",
    boxShadow: "0 6px 20px rgba(230, 126, 34, 0.3)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px"
  },

  buttonSpinner: {
    width: "16px",
    height: "16px",
    border: "2px solid rgba(255,255,255,0.3)",
    borderTop: "2px solid white",
    borderRadius: "50%",
    animation: "spin 1s linear infinite"
  },

  spinner: {
    width: "40px",
    height: "40px",
    border: "4px solid #e67e22",
    borderTop: "4px solid transparent",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
    margin: "0 auto 15px"
  },

  footer: {
    textAlign: "center",
    marginTop: "30px",
    paddingTop: "20px",
    borderTop: "1px solid #e9ecef"
  },

  footerDivider: {
    width: "50px",
    height: "3px",
    background: "linear-gradient(90deg, #e67e22, #d35400)",
    borderRadius: "2px",
    margin: "0 auto 10px"
  },

  footerText: {
    fontSize: "12px",
    color: "#666",
    margin: "0",
    fontWeight: "500"
  }
};

export default ChangePassword;