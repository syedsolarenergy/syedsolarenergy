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
  <div className="toast-notification" style={{
    background: type === 'error' ? '#ff4444' : type === 'success' ? '#44ff44' : '#4444ff'
  }}>
    {message}
    <button onClick={onClose} className="toast-close-btn">
      ×
    </button>
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
      setError("❌ خرابی | براہ کرم تمام فیلڈز بھریں\nPlease fill all fields");
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
          setError("❌ لاگ ان نہیں ہو سکا | Login failed. Please try again.");
          
          await logActivity(user.id, 'LOGIN_FAILED', {
            username: user.username,
            reason: 'session_creation_error',
            error: sessionError.message
          });
        }
      } else {
        setError("❌ غلط صارف نام یا پاس ورڈ | Invalid username or password");
        
        await logActivity(user?.id || null, 'LOGIN_FAILED', {
          username: username.trim().toLowerCase(),
          reason: user ? 'invalid_password' : 'user_not_found'
        });
      }
    } catch (error) {
      console.error('Login error:', error);
      setError("❌ لاگ ان نہیں ہو سکا | Login failed. Please try again.");
      
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
      weekday: 'long',
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
    <div className="login-container" style={{
      minHeight: "100vh",
      width: "100vw",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: `
        linear-gradient(135deg, #FF6B35 0%, #F7931E 45%, #FFAB00 100%),
        radial-gradient(circle at 20% 30%, rgba(255,255,255,0.1) 2px, transparent 2px),
        radial-gradient(circle at 80% 70%, rgba(255,255,255,0.1) 2px, transparent 2px)
      `,
      backgroundSize: "100% 100%, 60px 60px, 80px 80px",
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      position: "fixed",
      top: "0",
      left: "0",
      overflow: "hidden",
      padding: "0",
      zIndex: "9999",
      boxSizing: "border-box"
    }}>
      {/* Toast Notification */}
      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast(null)} 
        />
      )}
      
      {/* Floating Background Elements */}
      <div className="login-floating-element top-left" />
      <div className="login-floating-element bottom-right" />
      
      <div className="login-card" style={{
        background: "rgba(255, 255, 255, 0.95)",
        borderRadius: "clamp(8px, 1.5vw, 18px)",
        padding: "clamp(8px, 1.5vh, 20px) clamp(8px, 1.5vw, 20px)",
        width: "100%",
        maxWidth: "clamp(260px, 90vw, 400px)",
        minWidth: "240px",
        maxHeight: "100vh",
        overflowY: "auto",
        boxShadow: `
          0 15px 40px rgba(255, 171, 0, 0.25),
          0 8px 20px rgba(0, 0, 0, 0.08),
          inset 0 1px 0 rgba(255, 255, 255, 0.8)
        `,
        zIndex: 2,
        position: "relative",
        backdropFilter: "blur(20px)",
        border: "1px solid rgba(255, 171, 0, 0.3)",
        margin: "auto",
        boxSizing: "border-box"
      }}>
        
        {/* Compact Header with Integrated Back Button */}
        <div className="login-header" style={{ textAlign: "center", marginBottom: "clamp(4px, 1vh, 8px)" }}>
          
          {/* Compact Live Time Display */}
          <div className="time-display">
            <div className="time-item">
              {formatTime(currentTime)}
            </div>
            <div className="time-item date">
              {formatDate(currentTime)}
            </div>
          </div>
          
          {/* Integrated Back Button */}
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="login-back-btn"
          >
            <span>←</span>
            <span>Back</span>
          </button>
          
          {/* Compact Logo */}
          <div className="logo-container">
            <div className="logo-border">
              <img
                src={syedSolarLogo}
                alt="Syed Solar Logo"
                className="logo-img"
              />
            </div>
            
            {/* Compact Logo Glow */}
            <div className="logo-glow" />
          </div>
          
          {/* Compact Company Title */}
          <h2 className="company-title">
            Syed Solar Energy
          </h2>
          
          <div className="company-subtitle">
            Pvt Ltd
          </div>
          
          {/* Compact Urdu Tagline */}
          <div className="urdu-tagline">
            <p className="urdu-text">
              صاف توانائی کے سفر کا روشن راستہ
            </p>
            <p className="tagline-translation">
              "Bright Path to Clean Energy Journey"
            </p>
          </div>
          
          <div className="login-subtitle">
            Solar Energy Management Login
          </div>
          
          {/* Compact Welcome Messages */}
          <div className="welcome-message">
            <h3 className="welcome-urdu">
              خوش آمدید
            </h3>
            <h4 className="welcome-english">
              Welcome Back!
            </h4>
            <p className="welcome-description">
              Sign in to access your solar energy management system
            </p>
          </div>
        </div>
        
        {/* Compact Error message */}
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}
        
        {/* Compact Login Form */}
        <form onSubmit={handleLogin} autoComplete="off">
          <div className="input-group" style={{ marginBottom: "clamp(6px, 1.5vh, 10px)", position: "relative" }}>
            <div className="input-icon">
              👤
            </div>
            <input
              type="text"
              name="username"
              placeholder="Enter username | صارف نام"
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
          
          <div className="input-group" style={{ marginBottom: "clamp(8px, 2vh, 12px)", position: "relative" }}>
            <div className="input-icon">
              🔒
            </div>
            <input
              ref={passwordRef}
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Enter password | پاس ورڈ"
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
          
          {/* Enhanced Remember Me Checkbox */}
          <div className="remember-me-container">
            <label className="remember-me-label">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                disabled={isLoading}
                className="remember-me-checkbox"
              />
              <div className="remember-me-custom-checkbox">
                <svg className="remember-me-checkmark" viewBox="0 0 24 24">
                  <path d="M5 12l5 5L20 7" />
                </svg>
              </div>
              <span className="remember-me-text">
                Remember me | یاد رکھیں
              </span>
            </label>
          </div>
          
          {/* Compact Login Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="login-btn"
          >
            {isLoading ? (
              <>
                <div className="login-spinner" />
                <span>دخول ہو رہا ہے... | Signing In...</span>
              </>
            ) : (
              <span>دخول | Sign In</span>
            )}
          </button>
        </form>
        
        {/* Compact Forgot Password */}
        <div className="forgot-password">
          <Link 
            to="/forgot-password"
            className="forgot-link"
          >
            پاس ورڈ بھول گئے؟ | Forgot Password?
          </Link>
        </div>
        
        {/* Compact Footer */}
        <div className="login-footer">
          <div className="footer-divider" />
          <p className="footer-tagline">
            محفوظ اور قابل اعتماد | Secure & Trusted
          </p>
          <div className="contact-info">
            <div>📧 sales@syedsolarenergy.com</div>
            <div>📱 03044678929</div>
          </div>
        </div>
      </div>
      
      {/* Enhanced Universal Responsive Styles */}
      <style jsx>{`
        .login-container {
          min-height: 100vh;
          width: 100vw;
          display: flex;
          align-items: center;
          justify-content: center;
          background: 
            linear-gradient(135deg, #FF6B35 0%, #F7931E 45%, #FFAB00 100%),
            radial-gradient(circle at 20% 30%, rgba(255,255,255,0.1) 2px, transparent 2px),
            radial-gradient(circle at 80% 70%, rgba(255,255,255,0.1) 2px, transparent 2px);
          background-size: 100% 100%, 60px 60px, 80px 80px;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          position: fixed;
          top: 0;
          left: 0;
          overflow: hidden;
          padding: 0;
          z-index: 9999;
          box-sizing: border-box;
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
        
        .toast-close-btn {
          background: none;
          border: none;
          color: white;
          margin-left: 10px;
          cursor: pointer;
          font-size: 16px;
        }
        
        .login-back-btn {
          position: absolute;
          top: clamp(8px, 1.5vh, 12px);
          right: clamp(8px, 1.5vw, 12px);
          z-index: 10;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: clamp(2px, 0.5vw, 4px);
          background: linear-gradient(135deg, #FF6B35, #F7931E);
          color: #fff;
          border: none;
          border-radius: clamp(4px, 1vw, 8px);
          padding: clamp(4px, 0.8vh, 8px) clamp(6px, 1.2vw, 10px);
          font-weight: 700;
          font-size: clamp(8px, 1.5vw, 11px);
          letter-spacing: 0.02em;
          box-shadow: 0 3px 10px rgba(255, 171, 0, 0.3), 0 1px 5px rgba(0,0,0,0.1);
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          text-shadow: 0 1px 2px rgba(0,0,0,0.3);
          min-height: clamp(24px, 4vh, 32px);
          min-width: clamp(50px, 8vw, 70px);
        }
        
        .login-back-btn:hover {
          transform: scale(1.05);
          box-shadow: 0 4px 12px rgba(255, 171, 0, 0.4), 0 2px 8px rgba(0,0,0,0.15);
        }
        
        .login-floating-element {
          position: absolute;
          background: rgba(255, 255, 255, 0.08);
          border-radius: 50%;
          animation: float 8s ease-in-out infinite;
        }
        
        .top-left {
          top: 8%;
          left: 3%;
          width: clamp(30px, 4vw, 50px);
          height: clamp(30px, 4vw, 50px);
        }
        
        .bottom-right {
          top: 70%;
          right: 5%;
          width: clamp(25px, 3.5vw, 45px);
          height: clamp(25px, 3.5vw, 45px);
          background: rgba(255, 255, 255, 0.06);
          animation: float 10s ease-in-out infinite reverse;
        }
        
        .login-card {
          background: rgba(255, 255, 255, 0.95);
          border-radius: clamp(8px, 1.5vw, 18px);
          padding: clamp(8px, 1.5vh, 20px) clamp(8px, 1.5vw, 20px);
          width: 100%;
          max-width: clamp(260px, 90vw, 400px);
          min-width: 240px;
          max-height: 100vh;
          overflow-y: auto;
          box-shadow: 
            0 15px 40px rgba(255, 171, 0, 0.25),
            0 8px 20px rgba(0, 0, 0, 0.08),
            inset 0 1px 0 rgba(255, 255, 255, 0.8);
          z-index: 2;
          position: relative;
          backdropFilter: "blur(20px)";
          border: "1px solid rgba(255, 171, 0, 0.3)";
          margin: "auto";
          boxSizing: "border-box";
        }
        
        .time-display {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: clamp(3px, 0.8vw, 6px);
          margin-bottom: clamp(6px, 1.2vh, 10px);
          flex-wrap: wrap;
        }
        
        .time-item {
          background: linear-gradient(135deg, #FF6B35, #F7931E);
          color: #FFF;
          padding: clamp(2px, 0.5vh, 4px) clamp(4px, 1vw, 8px);
          border-radius: clamp(4px, 1vw, 8px);
          font-weight: 700;
          text-shadow: 0 1px 2px rgba(0,0,0,0.3);
          box-shadow: 0 2px 8px rgba(247, 147, 30, 0.25);
          white-space: nowrap;
        }
        
        .time-item.date {
          font-size: clamp(7px, 1.2vw, 9px);
          font-weight: 600;
        }
        
        .logo-container {
          position: relative;
          display: inline-block;
          margin-bottom: clamp(4px, 1vh, 8px);
        }
        
        .logo-border {
          padding: clamp(3px, 0.8vh, 6px);
          border-radius: clamp(6px, 1.5vw, 12px);
          background: rgba(255, 255, 255, 0.9);
          box-shadow: 0 6px 18px rgba(255, 171, 0, 0.25), inset 0 1px 4px rgba(255,255,255,0.8);
          border: clamp(1px, 0.2vw, 2px) solid rgba(255, 171, 0, 0.3);
          display: inline-block;
        }
        
        .logo-img {
          width: clamp(30px, 7vw, 50px);
          height: auto;
          border-radius: clamp(4px, 1vw, 8px);
          filter: brightness(1.1) contrast(1.05) saturate(1.1);
          transition: transform 0.2s ease;
        }
        
        .logo-img:hover {
          transform: scale(1.03);
        }
        
        .logo-glow {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: clamp(45px, 9vw, 70px);
          height: clamp(45px, 9vw, 70px);
          border-radius: 50%;
          background: radial-gradient(circle, rgba(247, 147, 30, 0.15) 0%, transparent 70%);
          animation: pulse 3s ease-in-out infinite;
          z-index: -1;
        }
        
        .company-title {
          font-weight: 900;
          margin: 0 0 clamp(1px, 0.5vh, 3px) 0;
          background: linear-gradient(135deg, #FF6B35, #F7931E);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          font-size: clamp(0.8rem, 3vw, 1.4rem);
          text-shadow: 0 3px 8px rgba(247, 147, 30, 0.25);
          letter-spacing: -0.2px;
          line-height: 1.1;
        }
        
        .company-subtitle {
          color: #F7931E;
          font-weight: 600;
          letter-spacing: 0.01em;
          font-size: clamp(8px, 1.8vw, 12px);
          margin-bottom: clamp(3px, 0.8vh, 6px);
          opacity: 0.9;
        }
        
        .urdu-tagline {
          background: linear-gradient(135deg, rgba(247, 147, 30, 0.08), rgba(255, 171, 0, 0.08));
          padding: clamp(4px, 1vh, 8px) clamp(6px, 1.5vw, 12px);
          border-radius: clamp(4px, 1vw, 8px);
          border: clamp(1px, 0.2vw, 2px) solid rgba(247, 147, 30, 0.15);
          margin-bottom: clamp(2px, 0.5vh, 4px);
          backdrop-filter: blur(10px);
        }
        
        .urdu-text {
          color: #FF6B35;
          font-weight: 700;
          font-size: clamp(8px, 1.8vw, 12px);
          font-family: 'Noto Nastaliq Urdu', serif;
          margin: 0;
          text-shadow: 0 1px 4px rgba(255, 107, 53, 0.25);
          line-height: 1.2;
        }
        
        .tagline-translation {
          color: #F7931E;
          font-weight: 500;
          font-size: clamp(6px, 1.2vw, 8px);
          margin: 2px 0 0 0;
          opacity: 0.8;
          font-style: italic;
        }
        
        .login-subtitle {
          color: #F7931E;
          font-weight: 600;
          letter-spacing: 0.01em;
          font-size: clamp(8px, 1.8vw, 12px);
          margin-bottom: clamp(4px, 1vh, 8px);
        }
        
        .welcome-message {
          margin-bottom: clamp(3px, 0.8vh, 6px);
        }
        
        .welcome-urdu {
          font-size: clamp(0.8rem, 2.5vw, 1rem);
          font-weight: 800;
          color: #F7931E;
          margin-bottom: 2px;
          font-family: 'Noto Nastaliq Urdu', serif;
        }
        
        .welcome-english {
          font-size: clamp(0.7rem, 2vw, 0.9rem);
          font-weight: 700;
          color: #333;
          margin: 0 0 clamp(1px, 0.5vh, 3px) 0;
        }
        
        .welcome-description {
          font-size: clamp(7px, 1.5vw, 10px);
          color: #666;
          line-height: 1.3;
          margin-bottom: 0;
        }
        
        .error-message {
          background: linear-gradient(135deg, #FFEBEE 0%, #FFCDD2 100%);
          border: clamp(1px, 0.2vw, 2px) solid #f44336;
          border-radius: clamp(4px, 1vw, 8px);
          color: #c62828;
          padding: clamp(6px, 1.5vh, 10px);
          margin-bottom: clamp(6px, 1.5vh, 10px);
          font-weight: 600;
          font-size: clamp(8px, 1.5vw, 10px);
          box-shadow: 0 3px 10px rgba(244, 67, 54, 0.15);
          text-align: center;
          white-space: pre-line;
          line-height: 1.3;
        }
        
        .input-group {
          margin-bottom: clamp(6px, 1.5vh, 10px);
          position: relative;
        }
        
        .input-icon {
          position: absolute;
          left: clamp(5px, 1vw, 8px);
          top: 50%;
          transform: translateY(-50%);
          color: #F7931E;
          font-size: clamp(10px, 1.8vw, 14px);
          z-index: 1;
          pointer-events: none;
        }
        
        .login-input {
          width: 100%;
          padding: clamp(6px, 1.5vh, 10px) clamp(6px, 1.5vw, 10px) clamp(6px, 1.5vh, 10px) clamp(24px, 5vw, 32px);
          border-radius: clamp(4px, 1vw, 8px);
          border: clamp(1px, 0.2vw, 2px) solid #ffe0b2;
          font-size: clamp(9px, 1.8vw, 12px);
          margin-bottom: 3px;
          font-weight: 500;
          background: #FFF;
          box-shadow: 0 2px 8px rgba(255, 171, 0, 0.08), inset 0 1px 2px rgba(255,255,255,0.8);
          transition: all 0.2s ease;
          box-sizing: border-box;
        }
        
        .login-input.focused {
          border-color: #F7931E;
          box-shadow: 0 3px 12px rgba(247, 147, 30, 0.2), inset 0 1px 2px rgba(255,255,255,0.8);
          transform: translateY(-1px);
        }
        
        .password-toggle {
          position: absolute;
          right: clamp(5px, 1vw, 8px);
          top: 50%;
          transform: translateY(-50%);
          font-size: clamp(10px, 1.8vw, 14px);
          cursor: pointer;
          color: #999;
          transition: all 0.2s ease;
          padding: clamp(3px, 0.8vw, 6px);
          z-index: 10;
          border-radius: 3px;
          display: flex;
          align-items: center;
          justify-content: center;
          width: clamp(18px, 4vw, 24px);
          height: clamp(18px, 4vw, 24px);
          user-select: none;
        }
        
        .password-toggle:hover {
          color: #F7931E;
          background: rgba(247, 147, 30, 0.08);
          transform: translateY(-50%) scale(1.05);
        }
        
        .remember-me-container {
          display: flex;
          align-items: center;
          margin-bottom: clamp(8px, 2vh, 12px);
          padding: clamp(4px, 1vh, 6px) clamp(6px, 1.2vw, 10px);
          background: rgba(255, 171, 0, 0.05);
          border-radius: clamp(4px, 1vw, 8px);
          border: clamp(1px, 0.2vw, 2px) solid rgba(255, 171, 0, 0.15);
        }
        
        .remember-me-label {
          display: flex;
          align-items: center;
          cursor: pointer;
          font-size: clamp(8px, 1.6vw, 11px);
          color: #666;
          width: 100%;
        }
        
        .remember-me-checkbox {
          position: absolute;
          opacity: 0;
          cursor: pointer;
          height: 0;
          width: 0;
        }
        
        .remember-me-custom-checkbox {
          height: clamp(14px, 2.5vw, 18px);
          width: clamp(14px, 2.5vw, 18px);
          background-color: #fff;
          border: clamp(1px, 0.2vw, 2px) solid #F7931E;
          border-radius: clamp(2px, 0.5vw, 4px);
          margin-right: clamp(6px, 1.2vw, 10px);
          position: relative;
          transition: all 0.2s ease;
          flex-shrink: 0;
        }
        
        .remember-me-checkbox:checked ~ .remember-me-custom-checkbox {
          background-color: #F7931E;
          border-color: #F7931E;
          transform: scale(1.05);
        }
        
        .remember-me-checkmark {
          position: absolute;
          top: 0;
          left: 0;
          height: 100%;
          width: 100%;
          opacity: 0;
          transition: opacity 0.2s ease;
        }
        
        .remember-me-checkmark path {
          stroke: white;
          stroke-width: 3;
          stroke-dasharray: 20;
          stroke-dashoffset: 20;
          fill: none;
          transition: stroke-dashoffset 0.3s ease;
        }
        
        .remember-me-checkbox:checked ~ .remember-me-custom-checkbox .remember-me-checkmark {
          opacity: 1;
        }
        
        .remember-me-checkbox:checked ~ .remember-me-custom-checkbox .remember-me-checkmark path {
          stroke-dashoffset: 0;
        }
        
        .remember-me-text {
          font-weight: 500;
        }
        
        .login-btn {
          width: 100%;
          padding: clamp(8px, 2vh, 12px);
          font-size: clamp(10px, 2vw, 13px);
          background: linear-gradient(135deg, #FF6B35 0%, #F7931E 100%);
          color: white;
          border: none;
          border-radius: clamp(4px, 1vw, 8px);
          font-weight: 800;
          margin-bottom: clamp(6px, 1.5vh, 10px);
          cursor: pointer;
          opacity: 1;
          box-shadow: 0 4px 15px rgba(247, 147, 30, 0.3), 0 2px 8px rgba(0,0,0,0.08);
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          text-shadow: 0 1px 2px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: clamp(3px, 0.8vw, 6px);
        }
        
        .login-btn:hover:not(:disabled) {
          transform: translateY(-1px) scale(1.01);
          box-shadow: 0 6px 18px rgba(247, 147, 30, 0.4), 0 3px 10px rgba(0,0,0,0.12);
        }
        
        .login-btn:disabled {
          background: linear-gradient(135deg, #FFB74D 0%, #FFCC80 100%);
          cursor: not-allowed;
          opacity: 0.85;
        }
        
        .login-spinner {
          width: clamp(10px, 2vw, 14px);
          height: clamp(10px, 2vw, 14px);
          border: 2px solid rgba(255,255,255,0.3);
          border-top: 2px solid white;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        
        .forgot-password {
          text-align: center;
          margin-top: clamp(3px, 0.8vh, 6px);
          margin-bottom: clamp(6px, 1.5vh, 10px);
        }
        
        .forgot-link {
          color: #F7931E;
          font-weight: 600;
          text-decoration: none;
          font-size: clamp(8px, 1.5vw, 10px);
          transition: all 0.2s ease;
          padding: clamp(2px, 0.5vh, 4px) clamp(4px, 1vw, 8px);
          border-radius: clamp(3px, 0.8vw, 6px);
          display: inline-block;
        }
        
        .forgot-link:hover {
          color: #FF6B35;
          background: rgba(247, 147, 30, 0.08);
        }
        
        .login-footer {
          text-align: center;
          margin-top: clamp(6px, 1.5vh, 10px);
          padding-top: clamp(4px, 1vh, 8px);
          border-top: clamp(1px, 0.2vw, 2px) solid rgba(247, 147, 30, 0.1);
        }
        
        .footer-divider {
          width: clamp(20px, 5vw, 35px);
          height: clamp(1px, 0.3vh, 2px);
          background: linear-gradient(90deg, #FF6B35, #F7931E);
          border-radius: 1px;
          margin: 0 auto clamp(3px, 0.8vh, 6px);
        }
        
        .footer-tagline {
          font-size: clamp(7px, 1.4vw, 9px);
          color: #666;
          font-weight: 600;
          margin-bottom: clamp(3px, 0.8vh, 6px);
        }
        
        .contact-info {
          font-size: clamp(6px, 1.2vw, 8px);
          color: #999;
          line-height: 1.2;
        }
        
        @keyframes pulse {
          0%, 100% { 
            opacity: 0.2;
            transform: translate(-50%, -50%) scale(1);
          }
          50% { 
            opacity: 0.4;
            transform: translate(-50%, -50%) scale(1.05);
          }
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
        
        @import url('https://fonts.googleapis.com/css2?family=Noto+Nastaliq+Urdu:wght@400;500;600;700;800;900&display=swap');
        
        /* Universal Base Styles */
        * {
          box-sizing: border-box;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }
        
        html, body {
          margin: 0;
          padding: 0;
          overflow-x: hidden;
          overflow-y: hidden;
          height: 100vh;
          width: 100vw;
        }
        
        /* Ultra Small Mobile Phones (Portrait) */
        @media screen and (max-width: 280px) {
          body { font-size: 10px !important; }
          .login-container { padding: 4px !important; }
        }
        
        /* Small Mobile Phones (Portrait) */
        @media screen and (min-width: 281px) and (max-width: 360px) {
          body { font-size: 11px !important; }
          .login-container { padding: 5px !important; }
        }
        
        /* Standard Mobile Phones (Portrait) */
        @media screen and (min-width: 361px) and (max-width: 414px) {
          body { font-size: 12px !important; }
          .login-container { padding: 6px !important; }
        }
        
        /* Large Mobile Phones (Portrait) */
        @media screen and (min-width: 415px) and (max-width: 480px) {
          body { font-size: 13px !important; }
          .login-container { padding: 7px !important; }
        }
        
        /* Small Tablets (Portrait) */
        @media screen and (min-width: 481px) and (max-width: 768px) {
          body { font-size: 14px !important; }
          .login-container { padding: 8px !important; }
        }
        
        /* Large Tablets (Portrait/Landscape) */
        @media screen and (min-width: 769px) and (max-width: 1024px) {
          body { font-size: 15px !important; }
          .login-container { padding: 10px !important; }
        }
        
        /* Small Laptops */
        @media screen and (min-width: 1025px) and (max-width: 1366px) {
          body { font-size: 16px !important; }
          .login-container { padding: 12px !important; }
        }
        
        /* Large Laptops/Desktops */
        @media screen and (min-width: 1367px) and (max-width: 1920px) {
          body { font-size: 17px !important; }
          .login-container { padding: 15px !important; }
        }
        
        /* Ultra Large Screens (4K/8K) */
        @media screen and (min-width: 1921px) {
          body { font-size: 18px !important; }
          .login-container { padding: 18px !important; }
        }
        
        /* Critical Landscape Mobile Fixes */
        @media screen and (max-height: 450px) and (orientation: landscape) {
          .login-container {
            transform: scale(0.85) !important;
            transform-origin: center !important;
            max-height: 95vh !important;
            overflow-y: auto !important;
          }
        }
        
        /* Ultra Short Heights */
        @media screen and (max-height: 500px) {
          .login-container {
            transform: scale(0.9) !important;
            transform-origin: center !important;
            max-height: 98vh !important;
            overflow-y: auto !important;
          }
        }
        
        /* Very Short Heights */
        @media screen and (max-height: 600px) {
          .login-container {
            transform: scale(0.95) !important;
            transform-origin: center !important;
          }
        }
        
        /* iPhone SE and Similar Small Screens */
        @media screen and (max-width: 375px) and (max-height: 667px) {
          .login-container {
            transform: scale(0.88) !important;
            transform-origin: center !important;
          }
        }
        
        /* iPhone 12 mini and Similar */
        @media screen and (max-width: 360px) and (max-height: 780px) {
          .login-container {
            transform: scale(0.9) !important;
            transform-origin: center !important;
          }
        }
        
        /* Galaxy Fold and Ultra Narrow Screens */
        @media screen and (max-width: 280px) {
          .login-container {
            transform: scale(0.8) !important;
            transform-origin: center !important;
            max-width: 95vw !important;
          }
        }
        
        /* iPad Mini and Similar Tablets */
        @media screen and (min-width: 768px) and (max-width: 1024px) {
          .login-container {
            max-width: 450px !important;
            transform: scale(1.05) !important;
            transform-origin: center !important;
          }
        }
        
        /* Large Tablets in Landscape */
        @media screen and (min-width: 1024px) and (max-height: 768px) and (orientation: landscape) {
          .login-container {
            transform: scale(0.95) !important;
            transform-origin: center !important;
          }
        }
        
        /* High DPI/Retina Displays */
        @media screen and (-webkit-min-device-pixel-ratio: 2) {
          * {
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
          }
        }
        
        /* Touch Device Optimizations */
        @media (hover: none) and (pointer: coarse) {
          button, input, .clickable {
            min-height: 32px !important;
            min-width: 32px !important;
          }
        }
        
        /* Reduced Motion for Accessibility */
        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }
        
        /* High Contrast Mode Support */
        @media (prefers-contrast: high) {
          input, button {
            border-width: 2px !important;
            outline-width: 2px !important;
          }
        }
        
        /* Dark Mode Preference */
        @media (prefers-color-scheme: dark) {
          body {
            background: linear-gradient(135deg, #FF6B35 0%, #F7931E 45%, #FFAB00 100%) !important;
          }
        }
        
        /* Focus Styles for Accessibility */
        *:focus-visible {
          outline: 2px solid #F7931E !important;
          outline-offset: 1px !important;
        }
        
        /* Input Focus Enhancement */
        input:focus {
          outline: 2px solid rgba(247, 147, 30, 0.4) !important;
          outline-offset: 1px !important;
        }
        
        /* Universal Container Scaling */
        .login-container {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
        }
        
        /* Ultra Wide Screens (21:9, 32:9 monitors) */
        @media screen and (min-aspect-ratio: 21/9) {
          .login-container {
            max-width: 420px !important;
          }
        }
        
        /* Square Screens */
        @media screen and (aspect-ratio: 1/1) {
          .login-container {
            transform: scale(0.95) !important;
            transform-origin: center !important;
          }
        }
        
        /* Foldable Devices */
        @media screen and (min-width: 540px) and (max-width: 720px) and (max-height: 600px) {
          .login-container {
            transform: scale(0.9) !important;
            transform-origin: center !important;
          }
        }
        
        /* Critical Height Constraints - Final Fallback */
        @media screen and (max-height: 400px) {
          .login-container {
            transform: scale(0.75) !important;
            transform-origin: center !important;
            max-height: 95vh !important;
            overflow-y: auto !important;
          }
        }
      `}</style>
    </div>
  );
}
export default Login;