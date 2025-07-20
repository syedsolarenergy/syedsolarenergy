// src/pages/ForgotPassword.js
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function ForgotPassword() {
  const [step, setStep] = useState(1); // 1: Enter Username, 2: Security Question, 3: Reset Password
  const [username, setUsername] = useState("");
  const [securityAnswer, setSecurityAnswer] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [foundUser, setFoundUser] = useState(null);
  const navigate = useNavigate();

  // Security questions for password reset
  const securityQuestions = {
    admin: "What is the name of your first solar project?",
    zubair: "What is your favorite solar panel brand?",
  };

  const securityAnswers = {
    admin: "peshawar commercial", // Case insensitive
    zubair: "ja solar",
  };

  const handleStep1Submit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setIsLoading(true);

    // Simulate loading
    await new Promise(resolve => setTimeout(resolve, 800));

    try {
      const users = JSON.parse(localStorage.getItem("users")) || [];
      const user = users.find((u) => u.username.toLowerCase() === username.toLowerCase());

      if (user) {
        setFoundUser(user);
        setMessage(`✅ User found! Please answer the security question to reset your password.`);
        setStep(2);
      } else {
        setError("❌ Username not found! Please check your username and try again.");
      }
    } catch (error) {
      setError("❌ Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleStep2Submit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setIsLoading(true);

    // Simulate loading
    await new Promise(resolve => setTimeout(resolve, 800));

    try {
      const correctAnswer = securityAnswers[foundUser.username.toLowerCase()];
      
      if (securityAnswer.toLowerCase().trim() === correctAnswer) {
        setMessage("✅ Security question answered correctly! Now set your new password.");
        setStep(3);
      } else {
        setError("❌ Incorrect answer. Please try again or contact support.");
      }
    } catch (error) {
      setError("❌ Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleStep3Submit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setIsLoading(true);

    // Simulate loading
    await new Promise(resolve => setTimeout(resolve, 1000));

    try {
      // Validate passwords
      if (newPassword.length < 4) {
        setError("❌ Password must be at least 4 characters long.");
        setIsLoading(false);
        return;
      }

      if (newPassword !== confirmPassword) {
        setError("❌ Passwords do not match. Please try again.");
        setIsLoading(false);
        return;
      }

      // Update password in localStorage
      const users = JSON.parse(localStorage.getItem("users")) || [];
      const updatedUsers = users.map(user => 
        user.username.toLowerCase() === foundUser.username.toLowerCase()
          ? { ...user, password: newPassword }
          : user
      );

      localStorage.setItem("users", JSON.stringify(updatedUsers));

      setMessage("🎉 Password reset successful! You can now login with your new password.");
      
      // Auto redirect to login after 3 seconds
      setTimeout(() => {
        navigate("/login");
      }, 3000);

    } catch (error) {
      setError("❌ Failed to reset password. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setStep(1);
    setUsername("");
    setSecurityAnswer("");
    setNewPassword("");
    setConfirmPassword("");
    setMessage("");
    setError("");
    setFoundUser(null);
  };

  return (
    <div style={styles.container}>
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
          <div style={styles.logoIcon}>🔑</div>
          <div style={styles.headerText}>
            <h1 style={styles.title}>Reset Password</h1>
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
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  style={styles.input}
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            <button
              type="submit"
              style={{
                ...styles.submitButton,
                ...(isLoading ? styles.submitButtonLoading : {})
              }}
              disabled={isLoading}
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
              </div>
              
              <div style={styles.inputGroup}>
                <label style={styles.label}>🛡️ Security Question</label>
                <div style={styles.questionBox}>
                  {securityQuestions[foundUser.username.toLowerCase()] || "What is your favorite color?"}
                </div>
                
                <div style={styles.inputContainer}>
                  <input
                    type="text"
                    placeholder="Enter your answer"
                    value={securityAnswer}
                    onChange={(e) => setSecurityAnswer(e.target.value)}
                    style={styles.input}
                    required
                    disabled={isLoading}
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
                  ...(isLoading ? styles.submitButtonLoading : {})
                }}
                disabled={isLoading}
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
                  type="password"
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  style={styles.input}
                  required
                  minLength={4}
                  disabled={isLoading}
                />
              </div>
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>🔐 Confirm Password</label>
              <div style={styles.inputContainer}>
                <input
                  type="password"
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  style={styles.input}
                  required
                  minLength={4}
                  disabled={isLoading}
                />
              </div>
            </div>

            <div style={styles.passwordRequirements}>
              <h4 style={styles.requirementsTitle}>Password Requirements:</h4>
              <ul style={styles.requirementsList}>
                <li style={{
                  ...styles.requirement,
                  color: newPassword.length >= 4 ? '#4caf50' : '#666'
                }}>
                  ✓ At least 4 characters long
                </li>
                <li style={{
                  ...styles.requirement,
                  color: newPassword === confirmPassword && newPassword ? '#4caf50' : '#666'
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
                  ...(isLoading ? styles.submitButtonLoading : {})
                }}
                disabled={isLoading}
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
    </div>
  );
}

// Beautiful Styles
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
  },

  logoIcon: {
    fontSize: '3.5rem',
    filter: 'drop-shadow(0 3px 6px rgba(255, 107, 53, 0.3))',
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
    border: '2px solid #e0e0e0',
    borderRadius: '12px',
    fontSize: '1rem',
    transition: 'all 0.3s ease',
    background: 'white',
    boxSizing: 'border-box',
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

};

// Add CSS animations
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  @keyframes float {
    0%, 100% { transform: translateY(0px) rotate(0deg); }
    50% { transform: translateY(-20px) rotate(5deg); }
  }
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;
document.head.appendChild(styleSheet);

export default ForgotPassword;