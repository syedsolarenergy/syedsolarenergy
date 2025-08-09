import React, { useState, useEffect } from "react";
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

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [toast, setToast] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  
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
      const passwordInput = document.querySelector('input[name="password"]');
      if (passwordInput) {
        passwordInput.focus();
        passwordInput.setSelectionRange(passwordInput.value.length, passwordInput.value.length);
      }
    }, 10);
  };
  
  return (
    <div style={{
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

      {/* Compact Back Button - Top Right */}
      <button
        type="button"
        onClick={() => navigate(-1)}
        style={{
          position: "fixed",
          top: "clamp(8px, 1vh, 15px)",
          right: "clamp(8px, 1vw, 15px)",
          zIndex: 10001,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "clamp(2px, 0.5vw, 4px)",
          background: "linear-gradient(135deg, #FF6B35, #F7931E)",
          color: "#fff",
          border: "none",
          borderRadius: "clamp(4px, 1vw, 8px)",
          padding: "clamp(4px, 1vh, 8px) clamp(6px, 1.5vw, 12px)",
          fontWeight: 700,
          fontSize: "clamp(8px, 1.5vw, 11px)",
          letterSpacing: "0.02em",
          boxShadow: "0 3px 10px rgba(255, 171, 0, 0.3), 0 1px 5px rgba(0,0,0,0.1)",
          cursor: "pointer",
          transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
          textShadow: "0 1px 2px rgba(0,0,0,0.3)",
          minHeight: "clamp(24px, 4vh, 32px)",
          minWidth: "clamp(50px, 8vw, 70px)"
        }}
        onMouseOver={(e) => {
          e.target.style.transform = "scale(1.05)";
          e.target.style.boxShadow = "0 4px 12px rgba(255, 171, 0, 0.4), 0 2px 8px rgba(0,0,0,0.15)";
        }}
        onMouseOut={(e) => {
          e.target.style.transform = "scale(1)";
          e.target.style.boxShadow = "0 3px 10px rgba(255, 171, 0, 0.3), 0 1px 5px rgba(0,0,0,0.1)";
        }}
      >
        <span style={{ fontSize: "clamp(8px, 1.5vw, 12px)" }}>←</span>
        <span>Back</span>
      </button>
      
      {/* Floating Background Elements - Reduced */}
      <div style={{
        position: "absolute",
        top: "8%",
        left: "3%",
        width: "clamp(30px, 4vw, 50px)",
        height: "clamp(30px, 4vw, 50px)",
        background: "rgba(255, 255, 255, 0.08)",
        borderRadius: "50%",
        animation: "float 8s ease-in-out infinite"
      }} />
      <div style={{
        position: "absolute",
        top: "70%",
        right: "5%",
        width: "clamp(25px, 3.5vw, 45px)",
        height: "clamp(25px, 3.5vw, 45px)",
        background: "rgba(255, 255, 255, 0.06)",
        borderRadius: "50%",
        animation: "float 10s ease-in-out infinite reverse"
      }} />
      
      <div style={{
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
        
        {/* Compact Header */}
        <div style={{ textAlign: "center", marginBottom: "clamp(4px, 1vh, 8px)" }}>
          
          {/* Compact Live Time Display */}
          <div style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: "clamp(3px, 0.8vw, 6px)",
            marginBottom: "clamp(6px, 1.2vh, 10px)",
            flexWrap: "wrap"
          }}>
            <div style={{
              background: "linear-gradient(135deg, #FF6B35, #F7931E)",
              color: "#FFF",
              padding: "clamp(2px, 0.5vh, 4px) clamp(4px, 1vw, 8px)",
              borderRadius: "clamp(4px, 1vw, 8px)",
              fontSize: "clamp(8px, 1.5vw, 11px)",
              fontWeight: "700",
              textShadow: "0 1px 2px rgba(0,0,0,0.3)",
              boxShadow: "0 2px 8px rgba(247, 147, 30, 0.25)",
              whiteSpace: "nowrap"
            }}>
              {formatTime(currentTime)}
            </div>
            <div style={{
              background: "linear-gradient(135deg, #FF6B35, #F7931E)",
              color: "#FFF",
              padding: "clamp(2px, 0.5vh, 4px) clamp(4px, 1vw, 8px)",
              borderRadius: "clamp(4px, 1vw, 8px)",
              fontSize: "clamp(7px, 1.2vw, 9px)",
              fontWeight: "600",
              textShadow: "0 1px 2px rgba(0,0,0,0.3)",
              boxShadow: "0 2px 8px rgba(247, 147, 30, 0.25)",
              whiteSpace: "nowrap"
            }}>
              {formatDate(currentTime)}
            </div>
          </div>
          
          {/* Compact Logo */}
          <div style={{
            position: "relative",
            display: "inline-block",
            marginBottom: "clamp(4px, 1vh, 8px)"
          }}>
            <div style={{
              padding: "clamp(3px, 0.8vh, 6px)",
              borderRadius: "clamp(6px, 1.5vw, 12px)",
              background: "rgba(255, 255, 255, 0.9)",
              boxShadow: "0 6px 18px rgba(255, 171, 0, 0.25), inset 0 1px 4px rgba(255,255,255,0.8)",
              border: "clamp(1px, 0.2vw, 2px) solid rgba(255, 171, 0, 0.3)",
              display: "inline-block"
            }}>
              <img
                src={syedSolarLogo}
                alt="Syed Solar Logo"
                style={{
                  width: "clamp(30px, 7vw, 50px)",
                  height: "auto",
                  borderRadius: "clamp(4px, 1vw, 8px)",
                  filter: "brightness(1.1) contrast(1.05) saturate(1.1)",
                  transition: "transform 0.2s ease"
                }}
                onMouseOver={(e) => e.target.style.transform = "scale(1.03)"}
                onMouseOut={(e) => e.target.style.transform = "scale(1)"}
              />
            </div>
            
            {/* Compact Logo Glow */}
            <div style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: "clamp(45px, 9vw, 70px)",
              height: "clamp(45px, 9vw, 70px)",
              borderRadius: "50%",
              background: "radial-gradient(circle, rgba(247, 147, 30, 0.15) 0%, transparent 70%)",
              animation: "pulse 3s ease-in-out infinite",
              zIndex: -1
            }} />
          </div>
          
          {/* Compact Company Title */}
          <h2 style={{
            fontWeight: 900,
            margin: "0 0 clamp(1px, 0.5vh, 3px) 0",
            background: "linear-gradient(135deg, #FF6B35, #F7931E)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            fontSize: "clamp(0.8rem, 3vw, 1.4rem)",
            textShadow: "0 3px 8px rgba(247, 147, 30, 0.25)",
            letterSpacing: "-0.2px",
            lineHeight: "1.1"
          }}>
            Syed Solar Energy
          </h2>
          
          <div style={{
            color: "#F7931E",
            fontWeight: 600,
            letterSpacing: "0.01em",
            fontSize: "clamp(8px, 1.8vw, 12px)",
            marginBottom: "clamp(3px, 0.8vh, 6px)",
            opacity: 0.9
          }}>
            Pvt Ltd
          </div>
          
          {/* Compact Urdu Tagline */}
          <div style={{
            background: "linear-gradient(135deg, rgba(247, 147, 30, 0.08), rgba(255, 171, 0, 0.08))",
            padding: "clamp(4px, 1vh, 8px) clamp(6px, 1.5vw, 12px)",
            borderRadius: "clamp(4px, 1vw, 8px)",
            border: "clamp(1px, 0.2vw, 2px) solid rgba(247, 147, 30, 0.15)",
            marginBottom: "clamp(2px, 0.5vh, 4px)",
            backdropFilter: "blur(10px)"
          }}>
            <p style={{
              color: "#FF6B35",
              fontWeight: 700,
              fontSize: "clamp(8px, 1.8vw, 12px)",
              fontFamily: "'Noto Nastaliq Urdu', serif",
              margin: "0",
              textShadow: "0 1px 4px rgba(255, 107, 53, 0.25)",
              lineHeight: "1.2"
            }}>
              صاف توانائی کے سفر کا روشن راستہ
            </p>
            <p style={{
              color: "#F7931E",
              fontWeight: 500,
              fontSize: "clamp(6px, 1.2vw, 8px)",
              margin: "2px 0 0 0",
              opacity: "0.8",
              fontStyle: "italic"
            }}>
              "Bright Path to Clean Energy Journey"
            </p>
          </div>
          
          <div style={{
            color: "#F7931E",
            fontWeight: 600,
            letterSpacing: "0.01em",
            fontSize: "clamp(8px, 1.8vw, 12px)",
            marginBottom: "clamp(4px, 1vh, 8px)"
          }}>
            Solar Energy Management Login
          </div>
          
          {/* Compact Welcome Messages */}
          <div style={{ marginBottom: "clamp(3px, 0.8vh, 6px)" }}>
            <h3 style={{
              fontSize: "clamp(0.8rem, 2.5vw, 1rem)",
              fontWeight: 800,
              color: "#F7931E",
              marginBottom: "2px",
              fontFamily: "'Noto Nastaliq Urdu', serif"
            }}>
              خوش آمدید
            </h3>
            <h4 style={{
              fontSize: "clamp(0.7rem, 2vw, 0.9rem)",
              fontWeight: 700,
              color: "#333",
              margin: "0 0 clamp(1px, 0.5vh, 3px) 0"
            }}>
              Welcome Back!
            </h4>
            <p style={{
              fontSize: "clamp(7px, 1.5vw, 10px)",
              color: "#666",
              lineHeight: "1.3",
              marginBottom: "0"
            }}>
              Sign in to access your solar energy management system
            </p>
          </div>
        </div>
        
        {/* Compact Error message */}
        {error && (
          <div style={{
            background: "linear-gradient(135deg, #FFEBEE 0%, #FFCDD2 100%)",
            border: "clamp(1px, 0.2vw, 2px) solid #f44336",
            borderRadius: "clamp(4px, 1vw, 8px)",
            color: "#c62828",
            padding: "clamp(6px, 1.5vh, 10px)",
            marginBottom: "clamp(6px, 1.5vh, 10px)",
            fontWeight: 600,
            fontSize: "clamp(8px, 1.5vw, 10px)",
            boxShadow: "0 3px 10px rgba(244, 67, 54, 0.15)",
            textAlign: "center",
            whiteSpace: "pre-line",
            lineHeight: "1.3"
          }}>
            {error}
          </div>
        )}
        
        {/* Compact Login Form */}
        <form onSubmit={handleLogin} autoComplete="off">
          <div style={{ marginBottom: "clamp(6px, 1.5vh, 10px)", position: "relative" }}>
            <div style={{
              position: "absolute",
              left: "clamp(5px, 1vw, 8px)",
              top: "50%",
              transform: "translateY(-50%)",
              color: "#F7931E",
              fontSize: "clamp(10px, 1.8vw, 14px)",
              zIndex: 1,
              pointerEvents: "none"
            }}>
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
              style={{
                width: "100%",
                padding: "clamp(6px, 1.5vh, 10px) clamp(6px, 1.5vw, 10px) clamp(6px, 1.5vh, 10px) clamp(24px, 5vw, 32px)",
                borderRadius: "clamp(4px, 1vw, 8px)",
                border: "clamp(1px, 0.2vw, 2px) solid #ffe0b2",
                fontSize: "clamp(9px, 1.8vw, 12px)",
                marginBottom: "3px",
                fontWeight: "500",
                background: "#FFF",
                boxShadow: "0 2px 8px rgba(255, 171, 0, 0.08), inset 0 1px 2px rgba(255,255,255,0.8)",
                transition: "all 0.2s ease",
                boxSizing: "border-box"
              }}
              onFocus={(e) => {
                e.target.style.borderColor = "#F7931E";
                e.target.style.boxShadow = "0 3px 12px rgba(247, 147, 30, 0.2), inset 0 1px 2px rgba(255,255,255,0.8)";
                e.target.style.transform = "translateY(-1px)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "#ffe0b2";
                e.target.style.boxShadow = "0 2px 8px rgba(255, 171, 0, 0.08), inset 0 1px 2px rgba(255,255,255,0.8)";
                e.target.style.transform = "translateY(0)";
              }}
            />
          </div>
          
          <div style={{ marginBottom: "clamp(8px, 2vh, 12px)", position: "relative" }}>
            <div style={{
              position: "absolute",
              left: "clamp(5px, 1vw, 8px)",
              top: "50%",
              transform: "translateY(-50%)",
              color: "#F7931E",
              fontSize: "clamp(10px, 1.8vw, 14px)",
              zIndex: 1,
              pointerEvents: "none"
            }}>
              🔒
            </div>
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Enter password | پاس ورڈ"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              disabled={isLoading}
              style={{
                width: "100%",
                padding: "clamp(6px, 1.5vh, 10px) clamp(28px, 6vw, 40px) clamp(6px, 1.5vh, 10px) clamp(24px, 5vw, 32px)",
                borderRadius: "clamp(4px, 1vw, 8px)",
                border: "clamp(1px, 0.2vw, 2px) solid #ffe0b2",
                fontSize: "clamp(9px, 1.8vw, 12px)",
                fontWeight: "500",
                background: "#FFF",
                boxShadow: "0 2px 8px rgba(255, 171, 0, 0.08), inset 0 1px 2px rgba(255,255,255,0.8)",
                transition: "all 0.2s ease",
                boxSizing: "border-box"
              }}
              onFocus={(e) => {
                e.target.style.borderColor = "#F7931E";
                e.target.style.boxShadow = "0 3px 12px rgba(247, 147, 30, 0.2), inset 0 1px 2px rgba(255,255,255,0.8)";
                e.target.style.transform = "translateY(-1px)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "#ffe0b2";
                e.target.style.boxShadow = "0 2px 8px rgba(255, 171, 0, 0.08), inset 0 1px 2px rgba(255,255,255,0.8)";
                e.target.style.transform = "translateY(0)";
              }}
            />
            <div
              onClick={togglePasswordVisibility}
              style={{
                position: "absolute",
                right: "clamp(5px, 1vw, 8px)",
                top: "50%",
                transform: "translateY(-50%)",
                fontSize: "clamp(10px, 1.8vw, 14px)",
                cursor: "pointer",
                color: "#999",
                transition: "all 0.2s ease",
                padding: "clamp(3px, 0.8vw, 6px)",
                zIndex: 10,
                borderRadius: "3px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "clamp(18px, 4vw, 24px)",
                height: "clamp(18px, 4vw, 24px)",
                userSelect: "none"
              }}
              title={showPassword ? "Hide password" : "Show password"}
              onMouseOver={(e) => {
                e.target.style.color = "#F7931E";
                e.target.style.background = "rgba(247, 147, 30, 0.08)";
                e.target.style.transform = "translateY(-50%) scale(1.05)";
              }}
              onMouseOut={(e) => {
                e.target.style.color = "#999";
                e.target.style.background = "transparent";
                e.target.style.transform = "translateY(-50%) scale(1)";
              }}
            >
              {showPassword ? "🙈" : "👁️"}
            </div>
          </div>
          
          {/* Compact Login Button */}
          <button
            type="submit"
            disabled={isLoading}
            style={{
              width: "100%",
              padding: "clamp(8px, 2vh, 12px)",
              fontSize: "clamp(10px, 2vw, 13px)",
              background: isLoading 
                ? "linear-gradient(135deg, #FFB74D 0%, #FFCC80 100%)"
                : "linear-gradient(135deg, #FF6B35 0%, #F7931E 100%)",
              color: "white",
              border: "none",
              borderRadius: "clamp(4px, 1vw, 8px)",
              fontWeight: 800,
              marginBottom: "clamp(6px, 1.5vh, 10px)",
              cursor: isLoading ? "not-allowed" : "pointer",
              opacity: isLoading ? 0.85 : 1,
              boxShadow: "0 4px 15px rgba(247, 147, 30, 0.3), 0 2px 8px rgba(0,0,0,0.08)",
              transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
              textShadow: "0 1px 2px rgba(0,0,0,0.3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "clamp(3px, 0.8vw, 6px)"
            }}
            onMouseOver={(e) => {
              if (!isLoading) {
                e.target.style.transform = "translateY(-1px) scale(1.01)";
                e.target.style.boxShadow = "0 6px 18px rgba(247, 147, 30, 0.4), 0 3px 10px rgba(0,0,0,0.12)";
              }
            }}
            onMouseOut={(e) => {
              if (!isLoading) {
                e.target.style.transform = "translateY(0) scale(1)";
                e.target.style.boxShadow = "0 4px 15px rgba(247, 147, 30, 0.3), 0 2px 8px rgba(0,0,0,0.08)";
              }
            }}
          >
            {isLoading ? (
              <>
                <div style={{
                  width: "clamp(10px, 2vw, 14px)",
                  height: "clamp(10px, 2vw, 14px)",
                  border: "2px solid rgba(255,255,255,0.3)",
                  borderTop: "2px solid white",
                  borderRadius: "50%",
                  animation: "spin 1s linear infinite"
                }} />
                <span>دخول ہو رہا ہے... | Signing In...</span>
              </>
            ) : (
              <span>دخول | Sign In</span>
            )}
          </button>
        </form>
        
        {/* Compact Forgot Password */}
        <div style={{ textAlign: "center", marginTop: "clamp(3px, 0.8vh, 6px)", marginBottom: "clamp(6px, 1.5vh, 10px)" }}>
          <Link 
            to="/forgot-password"
            style={{
              color: "#F7931E",
              fontWeight: 600,
              textDecoration: "none",
              fontSize: "clamp(8px, 1.5vw, 10px)",
              transition: "all 0.2s ease",
              padding: "clamp(2px, 0.5vh, 4px) clamp(4px, 1vw, 8px)",
              borderRadius: "clamp(3px, 0.8vw, 6px)",
              display: "inline-block"
            }}
            onMouseOver={(e) => {
              e.target.style.color = "#FF6B35";
              e.target.style.background = "rgba(247, 147, 30, 0.08)";
            }}
            onMouseOut={(e) => {
              e.target.style.color = "#F7931E";
              e.target.style.background = "transparent";
            }}
          >
            پاس ورڈ بھول گئے؟ | Forgot Password?
          </Link>
        </div>
        
        {/* Compact Footer */}
        <div style={{
          textAlign: "center",
          marginTop: "clamp(6px, 1.5vh, 10px)",
          paddingTop: "clamp(4px, 1vh, 8px)",
          borderTop: "clamp(1px, 0.2vw, 2px) solid rgba(247, 147, 30, 0.1)"
        }}>
          <div style={{
            width: "clamp(20px, 5vw, 35px)",
            height: "clamp(1px, 0.3vh, 2px)",
            background: "linear-gradient(90deg, #FF6B35, #F7931E)",
            borderRadius: "1px",
            margin: "0 auto clamp(3px, 0.8vh, 6px)"
          }} />
          <p style={{
            fontSize: "clamp(7px, 1.4vw, 9px)",
            color: "#666",
            fontWeight: 600,
            marginBottom: "clamp(3px, 0.8vh, 6px)"
          }}>
            محفوظ اور قابل اعتماد | Secure & Trusted
          </p>
          <div style={{
            fontSize: "clamp(6px, 1.2vw, 8px)",
            color: "#999",
            lineHeight: "1.2"
          }}>
            <div style={{ marginBottom: "1px" }}>📧 sales@syedsolarenergy.com</div>
            <div>📱 03044678929</div>
          </div>
        </div>
      </div>
      
      {/* Enhanced Universal Responsive Styles */}
      <style>
        {`
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
        `}
      </style>
    </div>
  );
}

export default Login;