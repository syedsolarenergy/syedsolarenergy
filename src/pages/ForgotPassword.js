import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
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

// Generate secure token
const generateResetToken = () => {
  return crypto.randomUUID() + '-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
};

// Toast notification component
const Toast = ({ message, type, onClose }) => (
  <div style={styles.toast}>
    <div style={{
      ...styles.toastContent,
      background: type === 'error' ? '#dc3545' : type === 'success' ? '#28a745' : '#007bff'
    }}>
      {message}
      <button onClick={onClose} style={styles.toastClose}>×</button>
    </div>
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
  const [foundUser, setFoundUser] = useState(null);
  const [securityQuestion, setSecurityQuestion] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [toast, setToast] = useState(null);
  const [showPasswords, setShowPasswords] = useState({
    new: false,
    confirm: false
  });
  const navigate = useNavigate();

  // Show toast notification
  const showToast = (message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), type === 'error' ? 5000 : 3000);
  };

  // Log activity helper
  const logActivity = async (userId, action, details = null) => {
    try {
      await supabase.from('admin_activity_log').insert({
        user_id: userId,
        action,
        resource: 'password_reset',
        details,
        ip_address: '127.0.0.1',
        user_agent: navigator.userAgent
      });
    } catch (error) {
      console.error('Failed to log activity:', error);
    }
  };

  // Step 1: Find user by username
  const handleStep1Submit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setIsLoading(true);

    try {
      const { data: users, error: fetchError } = await supabase
        .from('admin_users')
        .select(`
          id, username, email, is_active,
          admin_security_questions (question, answer_hash)
        `)
        .eq('username', formData.username.trim().toLowerCase())
        .eq('is_active', true)
        .limit(1);

      if (fetchError) throw fetchError;

      const user = users?.[0];

      if (user && user.admin_security_questions?.length > 0) {
        setFoundUser(user);
        setSecurityQuestion(user.admin_security_questions[0].question);
        setMessage(`User found! Please answer the security question.`);
        setStep(2);

        await logActivity(user.id, 'PASSWORD_RESET_INITIATED', {
          username: user.username,
          step: 'security_question'
        });
      } else if (user && !user.admin_security_questions?.length) {
        setError("No security question found for this user. Please contact administrator.");
        await logActivity(user.id, 'PASSWORD_RESET_FAILED', {
          username: user.username,
          reason: 'no_security_question'
        });
      } else {
        setError("Username not found! Please check your username and try again.");
        await logActivity(null, 'PASSWORD_RESET_FAILED', {
          username: formData.username,
          reason: 'user_not_found'
        });
      }
    } catch (error) {
      console.error('Error finding user:', error);
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Verify security answer
  const handleStep2Submit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setIsLoading(true);

    try {
      const answerHash = await hashPassword(formData.securityAnswer.toLowerCase().trim());
      const correctAnswerHash = foundUser.admin_security_questions[0].answer_hash;
      
      if (answerHash === correctAnswerHash) {
        const token = generateResetToken();
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 1);

        const { error: tokenError } = await supabase
          .from('admin_password_reset_tokens')
          .insert({
            user_id: foundUser.id,
            token,
            expires_at: expiresAt.toISOString(),
            ip_address: '127.0.0.1'
          });

        if (tokenError) throw tokenError;

        setResetToken(token);
        setMessage("Security question answered correctly! Now set your new password.");
        setStep(3);

        await logActivity(foundUser.id, 'PASSWORD_RESET_VERIFIED', {
          username: foundUser.username,
          step: 'new_password'
        });
      } else {
        setError("Incorrect answer. Please try again or contact support.");
        await logActivity(foundUser.id, 'PASSWORD_RESET_FAILED', {
          username: foundUser.username,
          reason: 'incorrect_security_answer'
        });
      }
    } catch (error) {
      console.error('Error verifying security answer:', error);
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Step 3: Reset password
  const handleStep3Submit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setIsLoading(true);

    try {
      if (formData.newPassword.length < 6) {
        setError("Password must be at least 6 characters long.");
        setIsLoading(false);
        return;
      }

      if (formData.newPassword !== formData.confirmPassword) {
        setError("Passwords do not match. Please try again.");
        setIsLoading(false);
        return;
      }

      const { data: tokenData, error: tokenError } = await supabase
        .from('admin_password_reset_tokens')
        .select('*')
        .eq('token', resetToken)
        .eq('user_id', foundUser.id)
        .is('used_at', null)
        .gt('expires_at', new Date().toISOString())
        .single();

      if (tokenError || !tokenData) {
        setError("Reset token is invalid or expired. Please start over.");
        setStep(1);
        resetForm();
        return;
      }

      const newPasswordHash = await hashPassword(formData.newPassword);

      const { data: currentUserData } = await supabase
        .from('admin_users')
        .select('password')
        .eq('id', foundUser.id)
        .single();

      try {
        const { error: updateError } = await supabase
          .from('admin_users')
          .update({
            password: newPasswordHash,
            updated_at: new Date().toISOString()
          })
          .eq('id', foundUser.id);

        if (updateError) throw updateError;

        await supabase
          .from('admin_password_reset_tokens')
          .update({ used_at: new Date().toISOString() })
          .eq('id', tokenData.id);

        await supabase.from('admin_password_changes').insert({
          user_id: foundUser.id,
          old_password_hash: currentUserData?.password || null,
          new_password_hash: newPasswordHash,
          changed_by: foundUser.id,
          ip_address: '127.0.0.1',
          user_agent: navigator.userAgent
        });

        await supabase
          .from('admin_sessions')
          .update({ is_active: false })
          .eq('user_id', foundUser.id);

        await logActivity(foundUser.id, 'PASSWORD_RESET_COMPLETED', {
          username: foundUser.username
        });

        setMessage("Password reset successful! You can now login with your new password.");
        showToast("Password reset successful! Redirecting to login...", 'success');
        
        setTimeout(() => {
          navigate("/login");
        }, 3000);

      } catch (transactionError) {
        console.error('Password reset transaction error:', transactionError);
        throw transactionError;
      }

    } catch (error) {
      console.error('Error resetting password:', error);
      setError("Failed to reset password. Please try again.");
      await logActivity(foundUser?.id, 'PASSWORD_RESET_FAILED', {
        username: foundUser?.username,
        reason: 'system_error',
        error: error.message
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Reset form to initial state
  const resetForm = () => {
    setStep(1);
    setFormData({
      username: "",
      securityAnswer: "",
      newPassword: "",
      confirmPassword: ""
    });
    setMessage("");
    setError("");
    setFoundUser(null);
    setSecurityQuestion("");
    setResetToken("");
    setShowPasswords({ new: false, confirm: false });
  };

  // Handle input changes
  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Toggle password visibility
  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
  };

  // Clear any existing sessions on component mount
  useEffect(() => {
    localStorage.removeItem("loggedIn");
    localStorage.removeItem("loggedInUser");
    localStorage.removeItem("userRole");
    localStorage.removeItem("sessionToken");
  }, []);

  return (
    <div style={styles.container}>
      {/* Toast Notification */}
      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast(null)} 
        />
      )}

      {/* Background Animation */}
      <div style={styles.backgroundAnimation}>
        <div style={styles.circle1}></div>
        <div style={styles.circle2}></div>
        <div style={styles.circle3}></div>
      </div>

      {/* Main Card */}
      <div style={styles.card}>
        {/* Header */}
        <div style={styles.header}>
          <img src={syedSolarLogo} alt="Syed Solar Logo" style={styles.logo} />
          <h1 style={styles.title}>🔑 Reset Password</h1>
          <div style={styles.progressContainer}>
            <div style={styles.progressBar}>
              <div style={{
                ...styles.progressFill,
                width: `${(step / 3) * 100}%`
              }}></div>
            </div>
            <span style={styles.progressText}>Step {step} of 3</span>
          </div>
        </div>

        {/* Alerts */}
        {message && (
          <div style={styles.successAlert}>
            <span>✅</span>
            <span>{message}</span>
          </div>
        )}

        {error && (
          <div style={styles.errorAlert}>
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {/* Forms */}
        <div style={styles.formContainer}>
          {/* Step 1: Enter Username */}
          {step === 1 && (
            <form onSubmit={handleStep1Submit} style={styles.form}>
              <div style={styles.inputGroup}>
                <input
                  type="text"
                  placeholder="👤 Enter your username"
                  value={formData.username}
                  onChange={(e) => handleInputChange('username', e.target.value)}
                  style={styles.input}
                  required
                  disabled={isLoading}
                  autoFocus
                />
              </div>

              <button
                type="submit"
                style={{
                  ...styles.primaryButton,
                  ...(isLoading ? styles.buttonLoading : {})
                }}
                disabled={isLoading || !formData.username.trim()}
              >
                {isLoading ? (
                  <><span style={styles.spinner}>⏳</span> Searching...</>
                ) : (
                  <><span>🔍</span> Find Account</>
                )}
              </button>
            </form>
          )}

          {/* Step 2: Security Question */}
          {step === 2 && foundUser && (
            <form onSubmit={handleStep2Submit} style={styles.form}>
              <div style={styles.userInfoBox}>
                <strong>{foundUser.username}</strong>
                <small>{foundUser.email}</small>
              </div>
              
              <div style={styles.questionBox}>
                <span style={styles.questionLabel}>🛡️ Security Question:</span>
                <p style={styles.questionText}>{securityQuestion}</p>
              </div>
              
              <div style={styles.inputGroup}>
                <input
                  type="text"
                  placeholder="💬 Enter your answer"
                  value={formData.securityAnswer}
                  onChange={(e) => handleInputChange('securityAnswer', e.target.value)}
                  style={styles.input}
                  required
                  disabled={isLoading}
                  autoFocus
                />
              </div>

              <div style={styles.buttonRow}>
                <button
                  type="button"
                  onClick={resetForm}
                  style={styles.secondaryButton}
                  disabled={isLoading}
                >
                  ← Back
                </button>
                
                <button
                  type="submit"
                  style={{
                    ...styles.primaryButton,
                    ...(isLoading ? styles.buttonLoading : {}),
                    flex: 1
                  }}
                  disabled={isLoading || !formData.securityAnswer.trim()}
                >
                  {isLoading ? (
                    <><span style={styles.spinner}>⏳</span> Verifying...</>
                  ) : (
                    <><span>✅</span> Verify Answer</>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* Step 3: Reset Password */}
          {step === 3 && (
            <form onSubmit={handleStep3Submit} style={styles.form}>
              <div style={styles.inputGroup}>
                <div style={styles.passwordContainer}>
                  <input
                    type={showPasswords.new ? "text" : "password"}
                    placeholder="🔐 New password (min 6 characters)"
                    value={formData.newPassword}
                    onChange={(e) => handleInputChange('newPassword', e.target.value)}
                    style={styles.passwordInput}
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
                    title={showPasswords.new ? "Hide password" : "Show password"}
                  >
                    {showPasswords.new ? "🙈" : "👁️"}
                  </button>
                </div>
              </div>

              <div style={styles.inputGroup}>
                <div style={styles.passwordContainer}>
                  <input
                    type={showPasswords.confirm ? "text" : "password"}
                    placeholder="🔐 Confirm new password"
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    style={{
                      ...styles.passwordInput,
                      borderColor: formData.confirmPassword && formData.newPassword !== formData.confirmPassword 
                        ? '#dc3545' : styles.passwordInput.borderColor
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
                    title={showPasswords.confirm ? "Hide password" : "Show password"}
                  >
                    {showPasswords.confirm ? "🙈" : "👁️"}
                  </button>
                </div>
                {formData.confirmPassword && formData.newPassword !== formData.confirmPassword && (
                  <span style={styles.errorText}>❌ Passwords do not match</span>
                )}
              </div>

              <div style={styles.passwordRequirements}>
                <div style={{
                  color: formData.newPassword.length >= 6 ? '#28a745' : '#6c757d',
                  fontSize: '0.85rem'
                }}>
                  {formData.newPassword.length >= 6 ? '✅' : '⭕'} At least 6 characters
                </div>
                <div style={{
                  color: formData.newPassword === formData.confirmPassword && formData.newPassword ? '#28a745' : '#6c757d',
                  fontSize: '0.85rem'
                }}>
                  {formData.newPassword === formData.confirmPassword && formData.newPassword ? '✅' : '⭕'} Passwords match
                </div>
              </div>

              <div style={styles.buttonRow}>
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  style={styles.secondaryButton}
                  disabled={isLoading}
                >
                  ← Back
                </button>
                
                <button
                  type="submit"
                  style={{
                    ...styles.primaryButton,
                    ...(isLoading ? styles.buttonLoading : {}),
                    flex: 1
                  }}
                  disabled={isLoading || !formData.newPassword || !formData.confirmPassword || formData.newPassword !== formData.confirmPassword}
                >
                  {isLoading ? (
                    <><span style={styles.spinner}>⏳</span> Resetting...</>
                  ) : (
                    <><span>🔄</span> Reset Password</>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Footer */}
        <div style={styles.footer}>
          <Link to="/login" style={styles.loginLink}>
            ← Back to Login
          </Link>
          <div style={styles.helpText}>
            Need help? Contact: <strong>+92 304-4678929</strong>
          </div>
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
          
          input:focus {
            outline: none !important;
            border-color: #FF6B35 !important;
            box-shadow: 0 0 0 3px rgba(255, 107, 53, 0.1) !important;
          }

          button:hover:not(:disabled) {
            transform: translateY(-1px);
          }

          button:active:not(:disabled) {
            transform: translateY(0px);
          }
        `}
      </style>
    </div>
  );
}

// Responsive and optimized styles
const styles = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #FF6B35 0%, #F7931E 50%, #FFAB00 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '10px',
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
    width: '200px',
    height: '200px',
    borderRadius: '50%',
    background: 'rgba(255, 255, 255, 0.08)',
    top: '-100px',
    right: '-100px',
    animation: 'float 8s ease-in-out infinite',
  },

  circle2: {
    position: 'absolute',
    width: '150px',
    height: '150px',
    borderRadius: '50%',
    background: 'rgba(255, 255, 255, 0.05)',
    bottom: '-75px',
    left: '-75px',
    animation: 'float 6s ease-in-out infinite reverse',
  },

  circle3: {
    position: 'absolute',
    width: '100px',
    height: '100px',
    borderRadius: '50%',
    background: 'rgba(255, 255, 255, 0.06)',
    top: '20%',
    left: '10%',
    animation: 'float 7s ease-in-out infinite',
  },

  card: {
    background: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(20px)',
    borderRadius: '20px',
    padding: '25px',
    width: '100%',
    maxWidth: '400px',
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    position: 'relative',
    zIndex: 2,
    maxHeight: '95vh',
    overflow: 'auto',
  },

  header: {
    textAlign: 'center',
    marginBottom: '20px',
  },

  logo: {
    width: '50px',
    height: 'auto',
    borderRadius: '8px',
    marginBottom: '10px',
    filter: 'brightness(1.1)'
  },

  title: {
    fontSize: '1.5rem',
    fontWeight: '700',
    margin: '0 0 15px 0',
    background: 'linear-gradient(135deg, #FF6B35, #F7931E)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  },

  progressContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },

  progressBar: {
    flex: 1,
    height: '4px',
    background: '#e0e0e0',
    borderRadius: '2px',
    overflow: 'hidden',
  },

  progressFill: {
    height: '100%',
    background: 'linear-gradient(135deg, #FF6B35, #F7931E)',
    borderRadius: '2px',
    transition: 'width 0.5s ease',
  },

  progressText: {
    fontSize: '0.8rem',
    color: '#666',
    fontWeight: '500',
    whiteSpace: 'nowrap',
  },

  successAlert: {
    background: 'linear-gradient(135deg, #d4edda, #c3e6cb)',
    border: '1px solid #28a745',
    borderRadius: '10px',
    padding: '12px',
    marginBottom: '15px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    color: '#155724',
    fontSize: '0.85rem',
    fontWeight: '500',
  },

  errorAlert: {
    background: 'linear-gradient(135deg, #f8d7da, #f5c6cb)',
    border: '1px solid #dc3545',
    borderRadius: '10px',
    padding: '12px',
    marginBottom: '15px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    color: '#721c24',
    fontSize: '0.85rem',
    fontWeight: '500',
  },

  formContainer: {
    marginBottom: '20px',
  },

  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
  },

  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '5px',
  },

  input: {
    width: '100%',
    padding: '12px 15px',
    border: '2px solid #e0e0e0',
    borderRadius: '10px',
    fontSize: '0.95rem',
    transition: 'all 0.3s ease',
    background: 'white',
    boxSizing: 'border-box',
  },

  passwordContainer: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },

  passwordInput: {
    width: '100%',
    padding: '12px 45px 12px 15px',
    border: '2px solid #e0e0e0',
    borderRadius: '10px',
    fontSize: '0.95rem',
    transition: 'all 0.3s ease',
    background: 'white',
    boxSizing: 'border-box',
  },

  passwordToggle: {
    position: 'absolute',
    right: '12px',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: '16px',
    color: '#666',
    padding: '4px',
    borderRadius: '4px',
    transition: 'all 0.2s ease',
    zIndex: 1,
  },

  userInfoBox: {
    background: 'linear-gradient(135deg, #e3f2fd, #bbdefb)',
    padding: '10px 12px',
    borderRadius: '8px',
    color: '#1565c0',
    fontSize: '0.85rem',
    border: '1px solid #2196f3',
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },

  questionBox: {
    background: '#f8f9fa',
    padding: '12px',
    borderRadius: '8px',
    border: '1px solid #dee2e6',
  },

  questionLabel: {
    fontSize: '0.85rem',
    fontWeight: '600',
    color: '#495057',
  },

  questionText: {
    margin: '5px 0 0 0',
    fontSize: '0.9rem',
    color: '#212529',
    fontStyle: 'italic',
  },

  passwordRequirements: {
    background: '#f8f9fa',
    padding: '10px 12px',
    borderRadius: '8px',
    border: '1px solid #dee2e6',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },

  errorText: {
    fontSize: '0.8rem',
    color: '#dc3545',
    fontWeight: '500'
  },

  buttonRow: {
    display: 'flex',
    gap: '10px',
    alignItems: 'center',
  },

  primaryButton: {
    background: 'linear-gradient(135deg, #FF6B35, #F7931E)',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    padding: '12px 20px',
    fontSize: '0.9rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    boxShadow: '0 4px 15px rgba(255, 107, 53, 0.3)',
  },

  secondaryButton: {
    background: 'linear-gradient(135deg, #6c757d, #495057)',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    padding: '12px 16px',
    fontSize: '0.9rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    whiteSpace: 'nowrap',
  },

  buttonLoading: {
    background: 'linear-gradient(135deg, #999, #666)',
    cursor: 'not-allowed',
    transform: 'scale(0.98)',
  },

  spinner: {
    animation: 'spin 1s linear infinite',
  },

  footer: {
    textAlign: 'center',
    paddingTop: '15px',
    borderTop: '1px solid #e0e0e0',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },

  loginLink: {
    color: '#F7931E',
    textDecoration: 'none',
    fontWeight: '600',
    fontSize: '0.9rem',
    transition: 'color 0.3s ease',
  },

  helpText: {
    fontSize: '0.8rem',
    color: '#666',
    lineHeight: '1.4',
  },

  toast: {
    position: 'fixed',
    top: '20px',
    right: '20px',
    zIndex: 10000,
    maxWidth: '90vw',
  },

  toastContent: {
    color: 'white',
    padding: '10px 15px',
    borderRadius: '8px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
    fontSize: '0.85rem',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '10px',
  },

  toastClose: {
    background: 'none',
    border: 'none',
    color: 'white',
    cursor: 'pointer',
    fontSize: '18px',
    padding: '0',
    marginLeft: '5px',
  },
};

export default ForgotPassword;
