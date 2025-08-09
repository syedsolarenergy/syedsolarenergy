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
      .upsert(
        {
          user_id: userId,
          session_token: sessionToken,
          ip_address: '127.0.0.1',
          user_agent: navigator.userAgent,
          expires_at: expiresAt.toISOString(),
          is_active: true
        },
        { onConflict: 'user_id' }  // Add this conflict resolution
      );

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
      // Use plaintext password
    const { data: users, error: fetchError } = await supabase
      .from('admin_users')
      .select(`...`)
      .eq('username', username.trim())
      .eq('is_active', true)
      .limit(1);

    // Compare plaintext password
    if (user && user.password === password) {
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
      overflow: "auto",
      overflowX: "hidden",
      padding: "clamp(5px, 1vh, 15px) clamp(5px, 1vw, 15px)",
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
      
      {/* Responsive Floating Background Elements */}
      <div style={{
        position: "absolute",
        top: "8%",
        left: "3%",
        width: "clamp(40px, 6vw, 80px)",
        height: "clamp(40px, 6vw, 80px)",
        background: "rgba(255, 255, 255, 0.08)",
        borderRadius: "50%",
        animation: "float 8s ease-in-out infinite"
      }} />
      <div style={{
        position: "absolute",
        top: "70%",
        right: "5%",
        width: "clamp(35px, 5vw, 70px)",
        height: "clamp(35px, 5vw, 70px)",
        background: "rgba(255, 255, 255, 0.06)",
        borderRadius: "50%",
        animation: "float 10s ease-in-out infinite reverse"
      }} />
      <div style={{
        position: "absolute",
        bottom: "10%",
        left: "10%",
        width: "clamp(30px, 4vw, 60px)",
        height: "clamp(30px, 4vw, 60px)",
        background: "rgba(255, 255, 255, 0.05)",
        borderRadius: "50%",
        animation: "float 12s ease-in-out infinite"
      }} />
      
      <div style={{
        background: "rgba(255, 255, 255, 0.95)",
        borderRadius: "clamp(12px, 2vw, 25px)",
        padding: "clamp(12px, 2vh, 30px) clamp(10px, 2vw, 25px)",
        width: "100%",
        maxWidth: "clamp(280px, 85vw, 480px)",
        minWidth: "260px",
        maxHeight: "95vh",
        overflowY: "auto",
        boxShadow: `
          0 20px 60px rgba(255, 171, 0, 0.3),
          0 10px 30px rgba(0, 0, 0, 0.1),
          inset 0 1px 0 rgba(255, 255, 255, 0.8)
        `,
        zIndex: 2,
        position: "relative",
        backdropFilter: "blur(20px)",
        border: "1px solid rgba(255, 171, 0, 0.3)",
        margin: "auto",
        boxSizing: "border-box"
      }}>
        
        {/* Enhanced Header */}
        <div style={{ textAlign: "center", marginBottom: "clamp(6px, 1.5vh, 12px)" }}>
          
          {/* Live Time Display - Responsive */}
          <div style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: "clamp(4px, 1vw, 8px)",
            marginBottom: "clamp(8px, 2vh, 15px)",
            flexWrap: "wrap"
          }}>
            <div style={{
              background: "linear-gradient(135deg, #FF6B35, #F7931E)",
              color: "#FFF",
              padding: "clamp(3px, 0.8vh, 6px) clamp(6px, 1.5vw, 12px)",
              borderRadius: "clamp(6px, 1.5vw, 12px)",
              fontSize: "clamp(9px, 1.8vw, 12px)",
              fontWeight: "700",
              textShadow: "0 1px 3px rgba(0,0,0,0.3)",
              boxShadow: "0 3px 12px rgba(247, 147, 30, 0.3)",
              whiteSpace: "nowrap"
            }}>
              {formatTime(currentTime)}
            </div>
            <div style={{
              background: "linear-gradient(135deg, #FF6B35, #F7931E)",
              color: "#FFF",
              padding: "clamp(3px, 0.8vh, 6px) clamp(6px, 1.5vw, 12px)",
              borderRadius: "clamp(6px, 1.5vw, 12px)",
              fontSize: "clamp(8px, 1.5vw, 10px)",
              fontWeight: "600",
              textShadow: "0 1px 3px rgba(0,0,0,0.3)",
              boxShadow: "0 3px 12px rgba(247, 147, 30, 0.3)",
              whiteSpace: "nowrap"
            }}>
              {formatDate(currentTime)}
            </div>
          </div>
          
          {/* Enhanced Logo - Ultra Responsive */}
          <div style={{
            position: "relative",
            display: "inline-block",
            marginBottom: "clamp(6px, 1.5vh, 10px)"
          }}>
            <div style={{
              padding: "clamp(4px, 1vh, 8px)",
              borderRadius: "clamp(8px, 2vw, 15px)",
              background: "rgba(255, 255, 255, 0.9)",
              boxShadow: "0 8px 25px rgba(255, 171, 0, 0.3), inset 0 2px 6px rgba(255,255,255,0.8)",
              border: "clamp(1px, 0.2vw, 2px) solid rgba(255, 171, 0, 0.3)",
              display: "inline-block"
            }}>
              <img
                src={syedSolarLogo}
                alt="Syed Solar Logo"
                style={{
                  width: "clamp(40px, 10vw, 70px)",
                  height: "auto",
                  borderRadius: "clamp(6px, 1.5vw, 12px)",
                  filter: "brightness(1.1) contrast(1.05) saturate(1.1)",
                  transition: "transform 0.3s ease"
                }}
                onMouseOver={(e) => e.target.style.transform = "scale(1.05)"}
                onMouseOut={(e) => e.target.style.transform = "scale(1)"}
              />
            </div>
            
            {/* Logo Glow Effect */}
            <div style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: "clamp(60px, 12vw, 100px)",
              height: "clamp(60px, 12vw, 100px)",
              borderRadius: "50%",
              background: "radial-gradient(circle, rgba(247, 147, 30, 0.2) 0%, transparent 70%)",
              animation: "pulse 3s ease-in-out infinite",
              zIndex: -1
            }} />
          </div>
          
          {/* Enhanced Company Title - Ultra Responsive */}
          <h2 style={{
            fontWeight: 900,
            margin: "0 0 clamp(2px, 0.8vh, 6px) 0",
            background: "linear-gradient(135deg, #FF6B35, #F7931E)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            fontSize: "clamp(1rem, 3.5vw, 1.8rem)",
            textShadow: "0 4px 12px rgba(247, 147, 30, 0.3)",
            letterSpacing: "-0.3px",
            lineHeight: "1.1"
          }}>
            Syed Solar Energy
          </h2>
          
          <div style={{
            color: "#F7931E",
            fontWeight: 600,
            letterSpacing: "0.02em",
            fontSize: "clamp(10px, 2vw, 14px)",
            marginBottom: "clamp(4px, 1vh, 8px)",
            opacity: 0.9
          }}>
            Pvt Ltd
          </div>
          
          {/* Urdu Tagline - Responsive */}
          <div style={{
            background: "linear-gradient(135deg, rgba(247, 147, 30, 0.1), rgba(255, 171, 0, 0.1))",
            padding: "clamp(6px, 1.5vh, 12px) clamp(8px, 2vw, 15px)",
            borderRadius: "clamp(6px, 1.5vw, 12px)",
            border: "clamp(1px, 0.2vw, 2px) solid rgba(247, 147, 30, 0.2)",
            marginBottom: "clamp(3px, 0.8vh, 6px)",
            backdropFilter: "blur(10px)"
          }}>
            <p style={{
              color: "#FF6B35",
              fontWeight: 700,
              fontSize: "clamp(10px, 2vw, 14px)",
              fontFamily: "'Noto Nastaliq Urdu', serif",
              margin: "0",
              textShadow: "0 2px 6px rgba(255, 107, 53, 0.3)",
              lineHeight: "1.3"
            }}>
              صاف توانائی کے سفر کا روشن راستہ
            </p>
            <p style={{
              color: "#F7931E",
              fontWeight: 500,
              fontSize: "clamp(7px, 1.5vw, 10px)",
              margin: "3px 0 0 0",
              opacity: "0.8",
              fontStyle: "italic"
            }}>
              "Bright Path to Clean Energy Journey"
            </p>
          </div>
          
          <div style={{
            color: "#F7931E",
            fontWeight: 600,
            letterSpacing: "0.02em",
            fontSize: "clamp(10px, 2vw, 14px)",
            marginBottom: "clamp(6px, 1.5vh, 12px)"
          }}>
            Solar Energy Management Login
          </div>
          
          {/* Welcome Messages - Responsive */}
          <div style={{ marginBottom: "clamp(4px, 1vh, 8px)" }}>
            <h3 style={{
              fontSize: "clamp(0.9rem, 3vw, 1.2rem)",
              fontWeight: 800,
              color: "#F7931E",
              marginBottom: "3px",
              fontFamily: "'Noto Nastaliq Urdu', serif"
            }}>
              خوش آمدید
            </h3>
            <h4 style={{
              fontSize: "clamp(0.8rem, 2.5vw, 1rem)",
              fontWeight: 700,
              color: "#333",
              margin: "0 0 clamp(2px, 0.8vh, 6px) 0"
            }}>
              Welcome Back!
            </h4>
            <p style={{
              fontSize: "clamp(9px, 1.8vw, 12px)",
              color: "#666",
              lineHeight: "1.4",
              marginBottom: "0"
            }}>
              Sign in to access your solar energy management system
            </p>
          </div>
        </div>
        
        {/* Enhanced BACK BUTTON - Ultra Responsive */}
        <button
          type="button"
          onClick={() => navigate(-1)}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "clamp(3px, 0.8vw, 6px)",
            width: "100%",
            margin: "0 auto clamp(8px, 2vh, 15px) auto",
            background: "linear-gradient(135deg, #FF6B35, #F7931E)",
            color: "#fff",
            border: "none",
            borderRadius: "clamp(6px, 1.5vw, 12px)",
            padding: "clamp(6px, 1.5vh, 10px) clamp(12px, 2.5vw, 20px)",
            fontWeight: 700,
            fontSize: "clamp(10px, 2vw, 13px)",
            letterSpacing: "0.03em",
            boxShadow: "0 5px 15px rgba(255, 171, 0, 0.3), 0 2px 8px rgba(0,0,0,0.1)",
            cursor: "pointer",
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            textShadow: "0 1px 3px rgba(0,0,0,0.3)"
          }}
          onMouseOver={(e) => {
            e.target.style.transform = "translateY(-2px) scale(1.02)";
            e.target.style.boxShadow = "0 7px 20px rgba(255, 171, 0, 0.4), 0 3px 12px rgba(0,0,0,0.15)";
          }}
          onMouseOut={(e) => {
            e.target.style.transform = "translateY(0) scale(1)";
            e.target.style.boxShadow = "0 5px 15px rgba(255, 171, 0, 0.3), 0 2px 8px rgba(0,0,0,0.1)";
          }}
        >
          <span style={{ fontSize: "clamp(10px, 2vw, 14px)" }}>←</span>
          <span>واپس | Back</span>
        </button>
        
        {/* Enhanced Error message - Responsive */}
        {error && (
          <div style={{
            background: "linear-gradient(135deg, #FFEBEE 0%, #FFCDD2 100%)",
            border: "clamp(1px, 0.2vw, 2px) solid #f44336",
            borderRadius: "clamp(6px, 1.5vw, 12px)",
            color: "#c62828",
            padding: "clamp(8px, 2vh, 14px)",
            marginBottom: "clamp(8px, 2vh, 14px)",
            fontWeight: 600,
            fontSize: "clamp(9px, 1.8vw, 12px)",
            boxShadow: "0 4px 15px rgba(244, 67, 54, 0.2)",
            textAlign: "center",
            whiteSpace: "pre-line",
            lineHeight: "1.4"
          }}>
            {error}
          </div>
        )}
        
        {/* Enhanced Login Form - Ultra Responsive */}
        <form onSubmit={handleLogin} autoComplete="off">
          <div style={{ marginBottom: "clamp(10px, 2.5vh, 15px)", position: "relative" }}>
            <div style={{
              position: "absolute",
              left: "clamp(6px, 1.5vw, 12px)",
              top: "50%",
              transform: "translateY(-50%)",
              color: "#F7931E",
              fontSize: "clamp(12px, 2vw, 16px)",
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
                padding: "clamp(8px, 2vh, 12px) clamp(8px, 2vw, 12px) clamp(8px, 2vh, 12px) clamp(30px, 6vw, 40px)",
                borderRadius: "clamp(6px, 1.5vw, 12px)",
                border: "clamp(1px, 0.2vw, 2px) solid #ffe0b2",
                fontSize: "clamp(10px, 2vw, 14px)",
                marginBottom: "4px",
                fontWeight: "500",
                background: "#FFF",
                boxShadow: "0 3px 12px rgba(255, 171, 0, 0.1), inset 0 1px 3px rgba(255,255,255,0.8)",
                transition: "all 0.3s ease",
                boxSizing: "border-box"
              }}
              onFocus={(e) => {
                e.target.style.borderColor = "#F7931E";
                e.target.style.boxShadow = "0 5px 15px rgba(247, 147, 30, 0.25), inset 0 1px 3px rgba(255,255,255,0.8)";
                e.target.style.transform = "translateY(-1px)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "#ffe0b2";
                e.target.style.boxShadow = "0 3px 12px rgba(255, 171, 0, 0.1), inset 0 1px 3px rgba(255,255,255,0.8)";
                e.target.style.transform = "translateY(0)";
              }}
            />
          </div>
          
          <div style={{ marginBottom: "clamp(12px, 3vh, 20px)", position: "relative" }}>
            <div style={{
              position: "absolute",
              left: "clamp(6px, 1.5vw, 12px)",
              top: "50%",
              transform: "translateY(-50%)",
              color: "#F7931E",
              fontSize: "clamp(12px, 2vw, 16px)",
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
                padding: "clamp(8px, 2vh, 12px) clamp(35px, 7vw, 50px) clamp(8px, 2vh, 12px) clamp(30px, 6vw, 40px)",
                borderRadius: "clamp(6px, 1.5vw, 12px)",
                border: "clamp(1px, 0.2vw, 2px) solid #ffe0b2",
                fontSize: "clamp(10px, 2vw, 14px)",
                fontWeight: "500",
                background: "#FFF",
                boxShadow: "0 3px 12px rgba(255, 171, 0, 0.1), inset 0 1px 3px rgba(255,255,255,0.8)",
                transition: "all 0.3s ease",
                boxSizing: "border-box"
              }}
              onFocus={(e) => {
                e.target.style.borderColor = "#F7931E";
                e.target.style.boxShadow = "0 5px 15px rgba(247, 147, 30, 0.25), inset 0 1px 3px rgba(255,255,255,0.8)";
                e.target.style.transform = "translateY(-1px)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "#ffe0b2";
                e.target.style.boxShadow = "0 3px 12px rgba(255, 171, 0, 0.1), inset 0 1px 3px rgba(255,255,255,0.8)";
                e.target.style.transform = "translateY(0)";
              }}
            />
            <div
              onClick={togglePasswordVisibility}
              style={{
                position: "absolute",
                right: "clamp(6px, 1.5vw, 12px)",
                top: "50%",
                transform: "translateY(-50%)",
                fontSize: "clamp(12px, 2vw, 16px)",
                cursor: "pointer",
                color: "#999",
                transition: "all 0.3s ease",
                padding: "clamp(5px, 1.2vw, 10px)",
                zIndex: 10,
                borderRadius: "4px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "clamp(24px, 5vw, 30px)",
                height: "clamp(24px, 5vw, 30px)",
                userSelect: "none"
              }}
              title={showPassword ? "Hide password" : "Show password"}
              onMouseOver={(e) => {
                e.target.style.color = "#F7931E";
                e.target.style.background = "rgba(247, 147, 30, 0.1)";
                e.target.style.transform = "translateY(-50%) scale(1.1)";
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
          
          {/* Enhanced Login Button - Ultra Responsive */}
          <button
            type="submit"
            disabled={isLoading}
            style={{
              width: "100%",
              padding: "clamp(10px, 2.5vh, 15px)",
              fontSize: "clamp(11px, 2.5vw, 15px)",
              background: isLoading 
                ? "linear-gradient(135deg, #FFB74D 0%, #FFCC80 100%)"
                : "linear-gradient(135deg, #FF6B35 0%, #F7931E 100%)",
              color: "white",
              border: "none",
              borderRadius: "clamp(6px, 1.5vw, 12px)",
              fontWeight: 800,
              marginBottom: "clamp(8px, 2vh, 15px)",
              cursor: isLoading ? "not-allowed" : "pointer",
              opacity: isLoading ? 0.85 : 1,
              boxShadow: "0 6px 20px rgba(247, 147, 30, 0.35), 0 3px 12px rgba(0,0,0,0.1)",
              transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
              textShadow: "0 1px 3px rgba(0,0,0,0.3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "clamp(4px, 1vw, 8px)"
            }}
            onMouseOver={(e) => {
              if (!isLoading) {
                e.target.style.transform = "translateY(-2px) scale(1.02)";
                e.target.style.boxShadow = "0 8px 25px rgba(247, 147, 30, 0.45), 0 4px 15px rgba(0,0,0,0.15)";
              }
            }}
            onMouseOut={(e) => {
              if (!isLoading) {
                e.target.style.transform = "translateY(0) scale(1)";
                e.target.style.boxShadow = "0 6px 20px rgba(247, 147, 30, 0.35), 0 3px 12px rgba(0,0,0,0.1)";
              }
            }}
          >
            {isLoading ? (
              <>
                <div style={{
                  width: "clamp(12px, 2.5vw, 18px)",
                  height: "clamp(12px, 2.5vw, 18px)",
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
        
        {/* Enhanced Forgot Password - Responsive */}
        <div style={{ textAlign: "center", marginTop: "clamp(4px, 1vh, 8px)", marginBottom: "clamp(8px, 2vh, 15px)" }}>
          <Link 
            to="/forgot-password"
            style={{
              color: "#F7931E",
              fontWeight: 600,
              textDecoration: "none",
              fontSize: "clamp(9px, 1.8vw, 12px)",
              transition: "all 0.3s ease",
              padding: "clamp(3px, 0.8vh, 6px) clamp(6px, 1.5vw, 12px)",
              borderRadius: "clamp(4px, 1vw, 8px)",
              display: "inline-block"
            }}
            onMouseOver={(e) => {
              e.target.style.color = "#FF6B35";
              e.target.style.background = "rgba(247, 147, 30, 0.1)";
            }}
            onMouseOut={(e) => {
              e.target.style.color = "#F7931E";
              e.target.style.background = "transparent";
            }}
          >
            پاس ورڈ بھول گئے؟ | Forgot Password?
          </Link>
        </div>
        
        {/* Enhanced Footer - Ultra Responsive */}
        <div style={{
          textAlign: "center",
          marginTop: "clamp(8px, 2vh, 15px)",
          paddingTop: "clamp(6px, 1.5vh, 12px)",
          borderTop: "clamp(1px, 0.2vw, 2px) solid rgba(247, 147, 30, 0.1)"
        }}>
          <div style={{
            width: "clamp(25px, 6vw, 50px)",
            height: "clamp(2px, 0.4vh, 3px)",
            background: "linear-gradient(90deg, #FF6B35, #F7931E)",
            borderRadius: "2px",
            margin: "0 auto clamp(4px, 1vh, 8px)"
          }} />
          <p style={{
            fontSize: "clamp(8px, 1.6vw, 11px)",
            color: "#666",
            fontWeight: 600,
            marginBottom: "clamp(4px, 1vh, 8px)"
          }}>
            محفوظ اور قابل اعتماد | Secure & Trusted
          </p>
          <div style={{
            fontSize: "clamp(7px, 1.4vw, 10px)",
            color: "#999",
            lineHeight: "1.3"
          }}>
            <div style={{ marginBottom: "2px" }}>📧 sales@syedsolarenergy.com</div>
            <div>📱 03044678929</div>
          </div>
        </div>
      </div>
      
      {/* Enhanced Animations & Media Queries */}
      <style>
        {`
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
          
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          
          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-12px); }
          }
          
          @import url('https://fonts.googleapis.com/css2?family=Noto+Nastaliq+Urdu:wght@400;500;600;700;800;900&display=swap');
          
          /* Ultra Small Screens (phones in portrait) */
          @media screen and (max-width: 320px) {
            body { font-size: 12px !important; }
          }
          
          /* Small Screens (phones) */
          @media screen and (max-width: 480px) {
            body { font-size: 13px !important; }
          }
          
          /* Medium Screens (tablets) */
          @media screen and (min-width: 481px) and (max-width: 768px) {
            body { font-size: 14px !important; }
          }
          
          /* Large Screens (laptops) */
          @media screen and (min-width: 769px) and (max-width: 1024px) {
            body { font-size: 15px !important; }
          }
          
          /* Extra Large Screens (desktops) */
          @media screen and (min-width: 1025px) and (max-width: 1440px) {
            body { font-size: 16px !important; }
          }
          
          /* Ultra Large Screens (4K monitors) */
          @media screen and (min-width: 1441px) {
            body { font-size: 17px !important; }
          }
          
          /* Landscape Mobile Phones - Critical Fix */
          @media screen and (max-height: 500px) and (orientation: landscape) {
            body {
              overflow-y: auto !important;
              padding: 2px !important;
            }
            .login-form {
              max-height: 90vh !important;
              overflow-y: auto !important;
              padding: 8px !important;
              margin: 5px auto !important;
            }
          }
          
          /* Very Small Heights - Enable Scrolling */
          @media screen and (max-height: 600px) {
            body {
              overflow-y: auto !important;
              padding: 3px !important;
            }
            .login-form {
              max-height: 95vh !important;
              overflow-y: auto !important;
              margin: 3px auto !important;
            }
          }
          
          /* High DPI Displays */
          @media screen and (-webkit-min-device-pixel-ratio: 2) {
            * {
              -webkit-font-smoothing: antialiased;
              -moz-osx-font-smoothing: grayscale;
            }
          }
          
          /* Dark Mode Support */
          @media (prefers-color-scheme: dark) {
            body {
              background: linear-gradient(135deg, #FF6B35 0%, #F7931E 45%, #FFAB00 100%) !important;
            }
          }
          
          /* Reduced Motion for Accessibility */
          @media (prefers-reduced-motion: reduce) {
            * {
              animation-duration: 0.01ms !important;
              animation-iteration-count: 1 !important;
              transition-duration: 0.01ms !important;
            }
          }
          
          /* High Contrast Mode */
          @media (prefers-contrast: high) {
            input {
              border-width: 3px !important;
            }
          }
          
          /* Print Styles */
          @media print {
            body {
              background: white !important;
              box-shadow: none !important;
            }
          }
          
          /* Universal Input Accessibility */
          input:focus {
            outline: 2px solid rgba(247, 147, 30, 0.5) !important;
            outline-offset: 1px !important;
          }
          
          /* Touch Device Optimizations */
          @media (hover: none) and (pointer: coarse) {
            button, input {
              min-height: 36px !important;
            }
          }
          
          /* Keyboard Navigation */
          *:focus-visible {
            outline: 2px solid #F7931E !important;
            outline-offset: 1px !important;
          }
          
          /* Force Scrolling When Needed */
          html, body {
            overflow-x: hidden !important;
            overflow-y: auto !important;
          }
          
          /* Container Responsiveness */
          .login-container {
            transition: all 0.3s ease !important;
            max-height: 100vh !important;
            overflow-y: auto !important;
          }
        `}
      </style>
    </div>
  );
}

export default Login;