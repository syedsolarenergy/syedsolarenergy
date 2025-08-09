import React, { useState, useEffect, useRef } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
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

// Generate secure session token
const generateSessionToken = () => {
  return crypto.randomUUID() + '-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
};

// Toast notification component
const Toast = ({ message, type, onClose }) => (
  <div className={`toast-notification ${type}`}>
    {message}
    <button onClick={onClose} className="toast-close-btn">×</button>
  </div>
);

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [toast, setToast] = useState(null);
  const [rememberMe, setRememberMe] = useState(false);
  const [isFocused, setIsFocused] = useState({ username: false, password: false });
  const navigate = useNavigate();
  const location = useLocation();
  const passwordRef = useRef(null);
  
  // Default landing page set to dashboard
  const from = location.state?.from?.pathname || "/dashboard";
  
  // Show toast notification
  const showToast = (message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), type === 'error' ? 5000 : 3000);
  };
  
  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);
  
  // Clear previous login data and hide navbar
  useEffect(() => {
    // Check if remember me was enabled
    const rememberedUsername = localStorage.getItem("rememberedUsername");
    if (rememberedUsername) {
      setUsername(rememberedUsername);
      setRememberMe(true);
    }
    
    // Clear any existing session data
    localStorage.removeItem("loggedIn");
    localStorage.removeItem("loggedInUser");
    localStorage.removeItem("userRole");
    localStorage.removeItem("sessionToken");
    
    // Hide navbar when on login page
    const navbar = document.querySelector('.navbar, .nav, [class*="nav"]');
    if (navbar) {
      navbar.style.display = 'none';
    }
    
    // Cleanup function to show navbar when leaving login
    return () => {
      const navbar = document.querySelector('.navbar, .nav, [class*="nav"]');
      if (navbar) {
        navbar.style.display = 'block';
      }
    };
  }, []);

  // Log activity helper
  const logActivity = async (userId, action, details = null) => {
    try {
      await supabase.from('admin_activity_log').insert({
        user_id: userId,
        action,
        resource: 'authentication',
        details,
        ip_address: '127.0.0.1',
        user_agent: navigator.userAgent
      });
    } catch (error) {
      console.error('Failed to log activity:', error);
    }
  };

  // Create session in database
  const createSession = async (userId) => {
    try {
      const sessionToken = generateSessionToken();
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24); // 24 hours expiry
      
      const { error } = await supabase
        .from('admin_sessions')
        .insert({
          user_id: userId,
          session_token: sessionToken,
          ip_address: '127.0.0.1',
          user_agent: navigator.userAgent,
          expires_at: expiresAt.toISOString(),
          is_active: true
        });
        
      if (error) throw error;
      return sessionToken;
    } catch (error) {
      console.error('Error creating session:', error);
      throw error;
    }
  };

  // Handle login
  const handleLogin = async (e) => {
    e.preventDefault();
    
    if (!username || !password) {
      setError("Please fill all fields");
      return;
    }
    
    setError("");
    setIsLoading(true);
    
    try {
      // Hash the password
      const passwordHash = await hashPassword(password);
      
      // Find user in Supabase
      const { data: users, error: fetchError } = await supabase
        .from('admin_users')
        .select(`
          id, username, email, role, is_active, password,
          admin_permissions (*)
        `)
        .eq('username', username.trim().toLowerCase())
        .eq('is_active', true)
        .limit(1);
        
      if (fetchError) throw fetchError;
      
      const user = users?.[0];
      
      if (user && user.password === passwordHash) {
        try {
          // Create session
          const sessionToken = await createSession(user.id);
          
          // Update last login
          await supabase
            .from('admin_users')
            .update({ last_login: new Date().toISOString() })
            .eq('id', user.id);
            
          // Log successful login
          await logActivity(user.id, 'LOGIN', {
            username: user.username,
            role: user.role
          });
          
          // Store session data
          localStorage.setItem("loggedIn", "true");
          localStorage.setItem("loggedInUser", user.username);
          localStorage.setItem("userRole", user.role || "user");
          localStorage.setItem("sessionToken", sessionToken);
          localStorage.setItem("loginTime", new Date().toISOString());
          
          // Handle remember me functionality
          if (rememberMe) {
            localStorage.setItem("rememberedUsername", user.username);
          } else {
            localStorage.removeItem("rememberedUsername");
          }
          
          showToast("Login successful! Welcome back.", 'success');
          
          // Show sidebar and hide navbar after successful login
          setTimeout(() => {
            const sidebar = document.querySelector('.sidebar, [class*="sidebar"]');
            const navbar = document.querySelector('.navbar, .nav, [class*="nav"]');
            
            if (sidebar) sidebar.style.display = 'block';
            if (navbar) navbar.style.display = 'none';
          }, 100);
          
          // Navigate to dashboard or intended page
          setTimeout(() => {
            if (from.startsWith('http')) {
              window.location.href = from;
            } else {
              navigate(from, { replace: true });
            }
          }, 1000);
        } catch (sessionError) {
          console.error('Session creation error:', sessionError);
          setError("Login failed. Please try again.");
          
          await logActivity(user.id, 'LOGIN_FAILED', {
            username: user.username,
            reason: 'session_creation_error',
            error: sessionError.message
          });
        }
      } else {
        setError("Invalid username or password");
        
        await logActivity(user?.id || null, 'LOGIN_FAILED', {
          username: username.trim().toLowerCase(),
          reason: user ? 'invalid_password' : 'user_not_found'
        });
      }
    } catch (error) {
      console.error('Login error:', error);
      setError("Login failed. Please try again.");
      
      await logActivity(null, 'LOGIN_FAILED', {
        username: username.trim().toLowerCase(),
        reason: 'system_error',
        error: error.message
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };
  
  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  // Handle password visibility toggle
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
    setTimeout(() => {
      if (passwordRef.current) {
        passwordRef.current.focus();
        const length = passwordRef.current.value.length;
        passwordRef.current.setSelectionRange(length, length);
      }
    }, 10);
  };
  
  // Handle input focus
  const handleFocus = (field) => {
    setIsFocused(prev => ({ ...prev, [field]: true }));
  };
  
  // Handle input blur
  const handleBlur = (field) => {
    setIsFocused(prev => ({ ...prev, [field]: false }));
  };
  
  // Handle key press (Enter to submit)
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !isLoading) {
      handleLogin(e);
    }
  };

  return (
    <div className="login-container">
      {/* Toast Notification */}
      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast(null)} 
        />
      )}
      
      {/* Back Button - Top Right */}
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="back-button"
      >
        ← Back
      </button>
      
      <div className="login-card">
        {/* Header with Logo and Time */}
        <div className="login-header">
          <div className="time-display">
            <div className="time">{formatTime(currentTime)}</div>
            <div className="date">{formatDate(currentTime)}</div>
          </div>
          
          <div className="logo-container">
            <img
              src={syedSolarLogo}
              alt="Syed Solar Logo"
              className="logo"
            />
          </div>
          
          <h1 className="company-title">Syed Solar Energy</h1>
          <p className="company-subtitle">Solar Energy Management System</p>
        </div>
        
        {/* Error message */}
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}
        
        {/* Login Form */}
        <form onSubmit={handleLogin} autoComplete="off">
          <div className="input-group">
            <div className="input-icon">👤</div>
            <input
              type="text"
              name="username"
              placeholder="Username"
              value={username}
              onChange={e => setUsername(e.target.value)}
              required
              disabled={isLoading}
              className={`login-input ${isFocused.username ? 'focused' : ''}`}
              onFocus={() => handleFocus('username')}
              onBlur={() => handleBlur('username')}
              onKeyPress={handleKeyPress}
            />
          </div>
          
          <div className="input-group">
            <div className="input-icon">🔒</div>
            <input
              ref={passwordRef}
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              disabled={isLoading}
              className={`login-input ${isFocused.password ? 'focused' : ''}`}
              onFocus={() => handleFocus('password')}
              onBlur={() => handleBlur('password')}
              onKeyPress={handleKeyPress}
            />
            <div
              onClick={togglePasswordVisibility}
              className="password-toggle"
              title={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? "🙈" : "👁️"}
            </div>
          </div>
          
          {/* Remember Me Checkbox */}
          <div className="remember-me">
            <input
              type="checkbox"
              id="rememberMe"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              disabled={isLoading}
            />
            <label htmlFor="rememberMe">Remember me</label>
          </div>
          
          {/* Login Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="login-button"
          >
            {isLoading ? (
              <>
                <div className="spinner" />
                <span>Signing In...</span>
              </>
            ) : (
              <span>Sign In</span>
            )}
          </button>
        </form>
        
        {/* Forgot Password */}
        <div className="forgot-password">
          <Link to="/forgot-password" className="forgot-link">
            Forgot Password?
          </Link>
        </div>
        
        {/* Footer */}
        <div className="login-footer">
          <div className="footer-divider" />
          <p className="footer-text">Secure & Trusted</p>
          <div className="contact-info">
            <div>📧 sales@syedsolarenergy.com</div>
            <div>📱 03044678929</div>
          </div>
        </div>
      </div>
      
      <style jsx>{`
        .login-container {
          min-height: 100vh;
          width: 100vw;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #FF6B35 0%, #F7931E 100%);
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          position: fixed;
          top: 0;
          left: 0;
          overflow: hidden;
          padding: 0;
          z-index: 9999;
          box-sizing: border-box;
        }
        
        .back-button {
          position: absolute;
          top: 20px;
          right: 20px;
          z-index: 10001;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(255, 255, 255, 0.2);
          color: #fff;
          border: none;
          border-radius: 8px;
          padding: 8px 16px;
          font-weight: 600;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s ease;
          backdrop-filter: blur(10px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }
        
        .back-button:hover {
          background: rgba(255, 255, 255, 0.3);
          transform: translateY(-2px);
        }
        
        .login-card {
          background: rgba(255, 255, 255, 0.95);
          border-radius: 16px;
          padding: 24px;
          width: 100%;
          max-width: 400px;
          box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
          z-index: 2;
          position: relative;
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.3);
          margin: auto;
          box-sizing: border-box;
          max-height: 90vh;
          overflow-y: auto;
        }
        
        .login-header {
          text-align: center;
          margin-bottom: 24px;
        }
        
        .time-display {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 10px;
          margin-bottom: 16px;
        }
        
        .time, .date {
          background: linear-gradient(135deg, #FF6B35, #F7931E);
          color: #FFF;
          padding: 6px 12px;
          border-radius: 8px;
          font-weight: 600;
          font-size: 14px;
          box-shadow: 0 2px 8px rgba(247, 147, 30, 0.3);
        }
        
        .logo-container {
          margin-bottom: 16px;
        }
        
        .logo {
          width: 60px;
          height: auto;
          border-radius: 8px;
        }
        
        .company-title {
          font-weight: 800;
          margin: 0 0 4px 0;
          color: #333;
          font-size: 24px;
        }
        
        .company-subtitle {
          color: #666;
          font-weight: 500;
          font-size: 14px;
          margin-bottom: 8px;
        }
        
        .error-message {
          background: #ffebee;
          border: 1px solid #f44336;
          border-radius: 8px;
          color: #c62828;
          padding: 12px;
          margin-bottom: 20px;
          font-weight: 500;
          font-size: 14px;
          text-align: center;
        }
        
        .input-group {
          margin-bottom: 16px;
          position: relative;
        }
        
        .input-icon {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          color: #F7931E;
          font-size: 18px;
          z-index: 1;
        }
        
        .login-input {
          width: 100%;
          padding: 14px 14px 14px 40px;
          border-radius: 8px;
          border: 1px solid #e0e0e0;
          font-size: 16px;
          font-weight: 500;
          background: #FFF;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
          transition: all 0.2s ease;
          box-sizing: border-box;
        }
        
        .login-input.focused {
          border-color: #F7931E;
          box-shadow: 0 0 0 3px rgba(247, 147, 30, 0.2);
        }
        
        .password-toggle {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          font-size: 18px;
          cursor: pointer;
          color: #999;
          transition: all 0.2s ease;
          padding: 4px;
          border-radius: 4px;
        }
        
        .password-toggle:hover {
          color: #F7931E;
          background: rgba(247, 147, 30, 0.1);
        }
        
        .remember-me {
          display: flex;
          align-items: center;
          margin-bottom: 20px;
          font-size: 14px;
          color: #666;
        }
        
        .remember-me input {
          margin-right: 8px;
          accent-color: #F7931E;
        }
        
        .remember-me label {
          cursor: pointer;
        }
        
        .login-button {
          width: 100%;
          padding: 14px;
          font-size: 16px;
          background: linear-gradient(135deg, #FF6B35 0%, #F7931E 100%);
          color: white;
          border: none;
          border-radius: 8px;
          font-weight: 700;
          margin-bottom: 16px;
          cursor: pointer;
          box-shadow: 0 4px 12px rgba(247, 147, 30, 0.3);
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }
        
        .login-button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(247, 147, 30, 0.4);
        }
        
        .login-button:disabled {
          background: #FFB74D;
          cursor: not-allowed;
          opacity: 0.8;
        }
        
        .spinner {
          width: 18px;
          height: 18px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top: 2px solid white;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        
        .forgot-password {
          text-align: center;
          margin-top: 8px;
          margin-bottom: 24px;
        }
        
        .forgot-link {
          color: #F7931E;
          font-weight: 600;
          text-decoration: none;
          font-size: 14px;
          transition: all 0.2s ease;
        }
        
        .forgot-link:hover {
          color: #FF6B35;
          text-decoration: underline;
        }
        
        .login-footer {
          text-align: center;
          margin-top: 16px;
          padding-top: 16px;
          border-top: 1px solid rgba(0, 0, 0, 0.1);
        }
        
        .footer-divider {
          width: 40px;
          height: 2px;
          background: linear-gradient(90deg, #FF6B35, #F7931E);
          border-radius: 1px;
          margin: 0 auto 12px;
        }
        
        .footer-text {
          font-size: 14px;
          color: #666;
          font-weight: 600;
          margin-bottom: 12px;
        }
        
        .contact-info {
          font-size: 12px;
          color: #999;
          line-height: 1.5;
        }
        
        .toast-notification {
          position: fixed;
          top: 20px;
          right: 20px;
          color: white;
          padding: 12px 20px;
          border-radius: 8px;
          z-index: 10000;
          box-shadow: 0 4px 12px rgba(0,0,0,0.3);
          font-size: 14px;
          font-weight: 600;
          max-width: 300px;
          display: flex;
          align-items: center;
        }
        
        .toast-notification.error {
          background: #f44336;
        }
        
        .toast-notification.success {
          background: #4caf50;
        }
        
        .toast-notification.info {
          background: #2196f3;
        }
        
        .toast-close-btn {
          background: none;
          border: none;
          color: white;
          margin-left: 10px;
          cursor: pointer;
          font-size: 16px;
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        /* Responsive adjustments */
        @media screen and (max-width: 480px) {
          .login-card {
            max-width: 90%;
            padding: 20px;
          }
          
          .back-button {
            top: 15px;
            right: 15px;
            padding: 6px 12px;
            font-size: 12px;
          }
          
          .company-title {
            font-size: 20px;
          }
          
          .login-input {
            font-size: 14px;
            padding: 12px 12px 12px 36px;
          }
          
          .login-button {
            padding: 12px;
            font-size: 14px;
          }
        }
        
        @media screen and (max-height: 600px) {
          .login-card {
            max-height: 95vh;
            padding: 16px;
          }
          
          .login-header {
            margin-bottom: 16px;
          }
          
          .time-display {
            margin-bottom: 12px;
          }
          
          .logo {
            width: 50px;
          }
          
          .company-title {
            font-size: 20px;
          }
          
          .input-group {
            margin-bottom: 12px;
          }
          
          .login-input {
            padding: 10px 10px 10px 36px;
          }
          
          .remember-me {
            margin-bottom: 16px;
          }
          
          .login-button {
            margin-bottom: 12px;
            padding: 12px;
          }
          
          .forgot-password {
            margin-bottom: 16px;
          }
        }
      `}</style>
    </div>
  );
}

export default Login;