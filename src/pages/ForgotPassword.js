import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import syedSolarLogo from "../assets/logo.png";

// Toast
const Toast = ({ message, type, onClose }) => (
  <div style={{
    position: 'fixed', top: 20, right: 20,
    background: type === 'error' ? '#ff4444' : type === 'success' ? '#44aa44' : '#4444ff',
    color: '#fff', padding: '12px 20px', borderRadius: 8, zIndex: 10000
  }}>
    {message}
    <button onClick={onClose} style={{ marginLeft: 10, color: '#fff', background: 'none', border: 0, cursor: 'pointer' }}>×</button>
  </div>
);

function ForgotPassword() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    username: "",
    securityAnswer: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [foundUser, setFoundUser] = useState(null); // { user_id, username, email }
  const [securityQuestion, setSecurityQuestion] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [toast, setToast] = useState(null);
  const [showPasswords, setShowPasswords] = useState({ new: false, confirm: false });
  const navigate = useNavigate();

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), type === 'error' ? 5000 : 3000);
  };

  const logActivity = async (userId, action, details = null) => {
    try {
      await supabase.from('admin_activity_log').insert({
        user_id: userId || null,
        action,
        resource: 'password_reset',
        details,
        ip_address: '127.0.0.1',
        user_agent: navigator.userAgent
      });
    } catch (_) {}
  };

  useEffect(() => {
    localStorage.removeItem("loggedIn");
    localStorage.removeItem("loggedInUser");
    localStorage.removeItem("userRole");
    localStorage.removeItem("sessionToken");
  }, []);

  const handleStep1Submit = async (e) => {
    e.preventDefault();
    setError(""); setMessage(""); setIsLoading(true);
    try {
      // 🔐 RPC to fetch question
      const { data, error: rpcError } = await supabase.rpc('get_security_question', {
        p_username: formData.username.trim()
      });
      if (rpcError) throw rpcError;

      const row = (data && data[0]) || null;
      if (!row) {
        setError("❌ Username not found or no security question set.");
        await logActivity(null, 'PASSWORD_RESET_FAILED', { username: formData.username.trim(), reason: 'user_or_question_missing' });
      } else {
        setFoundUser({ id: row.user_id, username: row.username, email: row.email });
        setSecurityQuestion(row.question);
        setMessage("✅ User found! Please answer the security question.");
        setStep(2);
        await logActivity(row.user_id, 'PASSWORD_RESET_INITIATED', { username: row.username, step: 'security_question' });
      }
    } catch (err) {
      console.error('Step1 error:', err);
      setError("❌ Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleStep2Submit = async (e) => {
    e.preventDefault();
    setError(""); setMessage(""); setIsLoading(true);
    try {
      // 🔐 RPC to verify answer + create token
      const { data, error: rpcError } = await supabase.rpc('begin_password_reset', {
        p_username: formData.username.trim(),
        p_answer: formData.securityAnswer  // NOTE: exact answer, no forced lowercase
      });
      if (rpcError) throw rpcError;

      const row = (data && data[0]) || null;
      if (!row) {
        setError("❌ Incorrect answer. Please try again.");
        await logActivity(foundUser?.id || null, 'PASSWORD_RESET_FAILED', {
          username: foundUser?.username || formData.username.trim(),
          reason: 'incorrect_security_answer'
        });
      } else {
        setResetToken(row.reset_token);
        setMessage("✅ Security answer correct! Please set your new password.");
        setStep(3);
        await logActivity(row.user_id, 'PASSWORD_RESET_VERIFIED', { username: foundUser?.username, step: 'new_password' });
      }
    } catch (err) {
      console.error('Step2 error:', err);
      setError("❌ Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleStep3Submit = async (e) => {
    e.preventDefault();
    setError(""); setMessage(""); setIsLoading(true);
    try {
      if (formData.newPassword.length < 6) {
        setError("❌ Password must be at least 6 characters long.");
        setIsLoading(false);
        return;
      }
      if (formData.newPassword !== formData.confirmPassword) {
        setError("❌ Passwords do not match. Please try again.");
        setIsLoading(false);
        return;
      }

      // 🔐 RPC to reset password with token (bcrypt inside DB)
      const { data, error: rpcError } = await supabase.rpc('reset_password_with_token', {
        p_token: resetToken,
        p_new_password: formData.newPassword
      });
      if (rpcError) throw rpcError;

      const ok = data === true || data?.[0] === true;
      if (!ok) {
        setError("❌ Reset token is invalid or expired. Please start over.");
        setStep(1);
        return;
      }

      setMessage("🎉 Password reset successful! You can now login.");
      showToast("Password reset successful! Redirecting to login...", "success");

      await logActivity(foundUser?.id || null, 'PASSWORD_RESET_COMPLETED', { username: foundUser?.username });

      setTimeout(() => navigate("/login"), 2000);

    } catch (err) {
      console.error('Step3 error:', err);
      setError("❌ Failed to reset password. Please try again.");
      await logActivity(foundUser?.id || null, 'PASSWORD_RESET_FAILED', {
        username: foundUser?.username || formData.username.trim(),
        reason: 'system_error',
        error: err.message
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setStep(1);
    setFormData({ username: "", securityAnswer: "", newPassword: "", confirmPassword: "" });
    setMessage(""); setError("");
    setFoundUser(null);
    setSecurityQuestion("");
    setResetToken("");
    setShowPasswords({ new: false, confirm: false });
  };

  const handleInputChange = (field, v) => setFormData(prev => ({ ...prev, [field]: v }));
  const togglePasswordVisibility = (field) => setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));

  // Clear any existing sessions on component mount
  useEffect(() => {
    // Clear any existing login data
    localStorage.removeItem("loggedIn");
    localStorage.removeItem("loggedInUser");
    localStorage.removeItem("userRole");
    localStorage.removeItem("sessionToken");
  }, []);

  return (
    <div style={styles.container}>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Background Animation */}
      <div style={styles.backgroundAnimation}>
        <div style={styles.circle1}></div>
        <div style={styles.circle2}></div>
        <div style={styles.circle3}></div>
      </div>

      {/* Forgot Password Card */}
      <div style={styles.card}>
        {/* Header */}
        <div style={styles.header}>
          <div style={styles.logoSection}>
            <img src={syedSolarLogo} alt="Syed Solar Logo" style={styles.logo} />
            <div style={styles.logoGlow}></div>
          </div>
          
          <div style={styles.headerText}>
            <h1 style={styles.title}>🔑 Reset Password</h1>
            <p style={styles.subtitle}>
              {step === 1 && "Enter your username to begin password reset"}
              {step === 2 && "Answer the security question"}
              {step === 3 && "Create your new password"}
            </p>
          </div>
        </div>

        {/* Progress Indicator */}
        <div style={styles.progressContainer}>
          <div style={styles.progressBar}>
            <div style={{
              ...styles.progressFill,
              width: `${(step / 3) * 100}%`
            }}></div>
          </div>
          <div style={styles.progressText}>
            Step {step} of 3
          </div>
        </div>

        {/* Success Message */}
        {message && (
          <div style={styles.successAlert}>
            <span style={styles.alertIcon}>✅</span>
            <span>{message}</span>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div style={styles.errorAlert}>
            <span style={styles.alertIcon}>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {/* Step 1: Enter Username */}
        {step === 1 && (
          <form onSubmit={handleStep1Submit} style={styles.form}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>👤 Username</label>
              <div style={styles.inputContainer}>
                <input
                  type="text"
                  placeholder="Enter your username"
                  value={formData.username}
                  onChange={(e) => handleInputChange('username', e.target.value)}
                  style={styles.input}
                  required
                  disabled={isLoading}
                  autoFocus
                />
              </div>
            </div>

            <button
              type="submit"
              style={{
                ...styles.submitButton,
                ...(isLoading ? styles.submitButtonLoading : {})
              }}
              disabled={isLoading || !formData.username.trim()}
            >
              {isLoading ? (
                <>
                  <span style={styles.spinner}>⏳</span>
                  Searching...
                </>
              ) : (
                <>
                  <span>🔍</span>
                  Find Account
                </>
              )}
            </button>
          </form>
        )}

        {/* Step 2: Security Question */}
        {step === 2 && foundUser && (
          <form onSubmit={handleStep2Submit} style={styles.form}>
            <div style={styles.securitySection}>
              <div style={styles.userInfo}>
                <strong>Account Found:</strong> {foundUser.username}
                <br />
                <small style={styles.userEmail}>{foundUser.email}</small>
              </div>
              
              <div style={styles.inputGroup}>
                <label style={styles.label}>🛡️ Security Question</label>
                <div style={styles.questionBox}>
                  {securityQuestion}
                </div>
                
                <div style={styles.inputContainer}>
                  <input
                    type="text"
                    placeholder="Enter your answer"
                    value={formData.securityAnswer}
                    onChange={(e) => handleInputChange('securityAnswer', e.target.value)}
                    style={styles.input}
                    required
                    disabled={isLoading}
                    autoFocus
                  />
                </div>
              </div>
            </div>

            <div style={styles.buttonRow}>
              <button
                type="button"
                onClick={resetForm}
                style={styles.backButton}
                disabled={isLoading}
              >
                ← Back
              </button>
              
              <button
                type="submit"
                style={{
                  ...styles.submitButton,
                  ...(isLoading ? styles.submitButtonLoading : {}),
                  flex: 1
                }}
                disabled={isLoading || !formData.securityAnswer.trim()}
              >
                {isLoading ? (
                  <>
                    <span style={styles.spinner}>⏳</span>
                    Verifying...
                  </>
                ) : (
                  <>
                    <span>✅</span>
                    Verify Answer
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* Step 3: Reset Password */}
        {step === 3 && (
          <form onSubmit={handleStep3Submit} style={styles.form}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>🔐 New Password</label>
              <div style={styles.inputContainer}>
                <input
                  type={showPasswords.new ? "text" : "password"}
                  placeholder="Enter new password"
                  value={formData.newPassword}
                  onChange={(e) => handleInputChange('newPassword', e.target.value)}
                  style={styles.input}
                  required
                  minLength={6}
                  disabled={isLoading}
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('new')}
                  style={styles.passwordToggle}
                  disabled={isLoading}
                >
                  {showPasswords.new ? "🙈" : "👁️"}
                </button>
              </div>
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>🔐 Confirm Password</label>
              <div style={styles.inputContainer}>
                <input
                  type={showPasswords.confirm ? "text" : "password"}
                  placeholder="Confirm new password"
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  style={{
                    ...styles.input,
                    borderColor: formData.confirmPassword && formData.newPassword !== formData.confirmPassword 
                      ? '#f44336' : styles.input.borderColor
                  }}
                  required
                  minLength={6}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('confirm')}
                  style={styles.passwordToggle}
                  disabled={isLoading}
                >
                  {showPasswords.confirm ? "🙈" : "👁️"}
                </button>
              </div>
              {formData.confirmPassword && formData.newPassword !== formData.confirmPassword && (
                <div style={styles.errorText}>
                  ❌ Passwords do not match
                </div>
              )}
            </div>

            <div style={styles.passwordRequirements}>
              <h4 style={styles.requirementsTitle}>Password Requirements:</h4>
              <ul style={styles.requirementsList}>
                <li style={{
                  ...styles.requirement,
                  color: formData.newPassword.length >= 6 ? '#4caf50' : '#666'
                }}>
                  ✓ At least 6 characters long
                </li>
                <li style={{
                  ...styles.requirement,
                  color: formData.newPassword === formData.confirmPassword && formData.newPassword ? '#4caf50' : '#666'
                }}>
                  ✓ Passwords match
                </li>
              </ul>
            </div>

            <div style={styles.buttonRow}>
              <button
                type="button"
                onClick={() => setStep(2)}
                style={styles.backButton}
                disabled={isLoading}
              >
                ← Back
              </button>
              
              <button
                type="submit"
                style={{
                  ...styles.submitButton,
                  ...(isLoading ? styles.submitButtonLoading : {}),
                  flex: 1
                }}
                disabled={isLoading || !formData.newPassword || !formData.confirmPassword || formData.newPassword !== formData.confirmPassword}
              >
                {isLoading ? (
                  <>
                    <span style={styles.spinner}>⏳</span>
                    Resetting...
                  </>
                ) : (
                  <>
                    <span>🔄</span>
                    Reset Password
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* Footer */}
        <div style={styles.footer}>
          <Link to="/login" style={styles.loginLink}>
            ← Back to Login
          </Link>
        </div>

        {/* Help Section */}
        <div style={styles.helpSection}>
          <h4 style={styles.helpTitle}>🆘 Need Help?</h4>
          <p style={styles.helpText}>
            If you can't remember your security answer, please contact your system administrator
            or call <strong>+92 304-4678929</strong> for assistance.
          </p>
        </div>
      </div>

      {/* CSS Animations */}
      <style>
        {`
          @keyframes float {
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            50% { transform: translateY(-20px) rotate(5deg); }
          }
          
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
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
            outline: 2px solid rgba(255, 107, 53, 0.5) !important;
            outline-offset: 1px !important;
          }
        `}
      </style>
    </div>
  );
}

// Comprehensive Styles
const styles = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #FF6B35 0%, #F7931E 50%, #FFAB00 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    position: 'relative',
    overflow: 'hidden',
  },

  backgroundAnimation: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: 'hidden',
    zIndex: 1,
  },

  circle1: {
    position: 'absolute',
    width: '250px',
    height: '250px',
    borderRadius: '50%',
    background: 'rgba(255, 255, 255, 0.1)',
    top: '-125px',
    right: '-125px',
    animation: 'float 8s ease-in-out infinite',
  },

  circle2: {
    position: 'absolute',
    width: '180px',
    height: '180px',
    borderRadius: '50%',
    background: 'rgba(255, 255, 255, 0.05)',
    bottom: '-90px',
    left: '-90px',
    animation: 'float 6s ease-in-out infinite reverse',
  },

  circle3: {
    position: 'absolute',
    width: '120px',
    height: '120px',
    borderRadius: '50%',
    background: 'rgba(255, 255, 255, 0.08)',
    top: '30%',
    left: '15%',
    animation: 'float 7s ease-in-out infinite',
  },

  card: {
    background: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(20px)',
    borderRadius: '25px',
    padding: '40px',
    width: '100%',
    maxWidth: '500px',
    boxShadow: '0 25px 50px rgba(0, 0, 0, 0.2)',
    border: '1px solid rgba(255, 255, 255, 0.3)',
    position: 'relative',
    zIndex: 2,
  },

  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '30px',
    gap: '15px',
    flexDirection: 'column'
  },

  logoSection: {
    position: 'relative',
    display: 'inline-block'
  },

  logo: {
    width: '60px',
    height: 'auto',
    borderRadius: '10px',
    filter: 'brightness(1.1)'
  },

  logoGlow: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '80px',
    height: '80px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(255, 107, 53, 0.2) 0%, transparent 70%)',
    animation: 'pulse 3s ease-in-out infinite',
    zIndex: -1
  },

  headerText: {
    textAlign: 'center',
  },

  title: {
    fontSize: '1.8rem',
    fontWeight: '700',
    margin: '0',
    background: 'linear-gradient(135deg, #FF6B35, #F7931E)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  },

  subtitle: {
    fontSize: '0.95rem',
    color: '#666',
    margin: '8px 0 0 0',
  },

  progressContainer: {
    marginBottom: '25px',
  },

  progressBar: {
    width: '100%',
    height: '6px',
    background: '#e0e0e0',
    borderRadius: '3px',
    overflow: 'hidden',
    marginBottom: '8px',
  },

  progressFill: {
    height: '100%',
    background: 'linear-gradient(135deg, #FF6B35, #F7931E)',
    borderRadius: '3px',
    transition: 'width 0.5s ease',
  },

  progressText: {
    textAlign: 'center',
    fontSize: '0.85rem',
    color: '#666',
    fontWeight: '500',
  },

  successAlert: {
    background: 'linear-gradient(135deg, #e8f5e8, #c8e6c9)',
    border: '1px solid #4caf50',
    borderRadius: '12px',
    padding: '15px',
    marginBottom: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    color: '#2e7d32',
    fontSize: '0.9rem',
    fontWeight: '500',
  },

  errorAlert: {
    background: 'linear-gradient(135deg, #ffebee, #ffcdd2)',
    border: '1px solid #f44336',
    borderRadius: '12px',
    padding: '15px',
    marginBottom: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    color: '#d32f2f',
    fontSize: '0.9rem',
    fontWeight: '500',
  },

  alertIcon: {
    fontSize: '1.2rem',
  },

  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },

  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },

  label: {
    fontWeight: '600',
    color: '#333',
    fontSize: '0.95rem',
  },

  inputContainer: {
    position: 'relative',
  },

  input: {
    width: '100%',
    padding: '15px',
    paddingRight: '50px',
    border: '2px solid #e0e0e0',
    borderRadius: '12px',
    fontSize: '1rem',
    transition: 'all 0.3s ease',
    background: 'white',
    boxSizing: 'border-box',
  },

  passwordToggle: {
    position: 'absolute',
    right: '15px',
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: '16px',
    color: '#666',
    padding: '5px',
    borderRadius: '5px',
    transition: 'all 0.3s ease'
  },

  securitySection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
  },

  userInfo: {
    background: 'linear-gradient(135deg, #e3f2fd, #bbdefb)',
    padding: '12px 15px',
    borderRadius: '10px',
    color: '#1565c0',
    fontSize: '0.9rem',
    border: '1px solid #2196f3',
  },

  userEmail: {
    color: '#1976d2',
    opacity: 0.8
  },

  questionBox: {
    background: '#f5f5f5',
    padding: '15px',
    borderRadius: '10px',
    color: '#333',
    fontWeight: '500',
    fontSize: '0.95rem',
    border: '1px solid #ddd',
    fontStyle: 'italic',
  },

  passwordRequirements: {
    background: '#f9f9f9',
    padding: '15px',
    borderRadius: '10px',
    border: '1px solid #e0e0e0',
  },

  requirementsTitle: {
    margin: '0 0 10px 0',
    fontSize: '0.9rem',
    color: '#333',
  },

  requirementsList: {
    margin: '0',
    paddingLeft: '0',
    listStyle: 'none',
  },

  requirement: {
    fontSize: '0.85rem',
    marginBottom: '5px',
    fontWeight: '500',
  },

  errorText: {
    fontSize: '12px',
    color: '#dc3545',
    marginTop: '5px',
    fontWeight: '500'
  },

  buttonRow: {
    display: 'flex',
    gap: '15px',
    justifyContent: 'space-between',
  },

  backButton: {
    background: 'linear-gradient(135deg, #9e9e9e, #757575)',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    padding: '15px 25px',
    fontSize: '0.95rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    flex: '0 0 auto',
  },

  submitButton: {
    background: 'linear-gradient(135deg, #FF6B35, #F7931E)',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    padding: '15px 25px',
    fontSize: '1rem',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    boxShadow: '0 8px 20px rgba(255, 107, 53, 0.3)',
    flex: '1',
  },

  submitButtonLoading: {
    background: 'linear-gradient(135deg, #999, #666)',
    cursor: 'not-allowed',
    transform: 'scale(0.98)',
  },

  spinner: {
    animation: 'spin 1s linear infinite',
  },

  footer: {
    textAlign: 'center',
    marginTop: '30px',
    paddingTop: '20px',
    borderTop: '1px solid #e0e0e0',
  },

  loginLink: {
    color: '#F7931E',
    textDecoration: 'none',
    fontWeight: '600',
    fontSize: '0.95rem',
    transition: 'color 0.3s ease',
  },

  helpSection: {
    marginTop: '25px',
    padding: '20px',
    background: 'linear-gradient(135deg, #fff3e0, #ffe0b2)',
    borderRadius: '15px',
    border: '1px solid #ffb74d',
  },

  helpTitle: {
    margin: '0 0 10px 0',
    color: '#E65100',
    fontSize: '1rem',
  },

  helpText: {
    fontSize: '0.85rem',
    color: '#BF360C',
    lineHeight: '1.5',
    margin: '0'
  }
};

export default ForgotPassword;