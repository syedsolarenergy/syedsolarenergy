// src/pages/Login.js
import React, { useState, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";

// Mock logo component
const logo = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiByeD0iMTAiIGZpbGw9InVybCgjZ3JhZGllbnQpIi8+CjxkZWZzPgo8bGluZWFyR3JhZGllbnQgaWQ9ImdyYWRpZW50IiB4MT0iMCUiIHkxPSIwJSIgeDI9IjEwMCUiIHkyPSIxMDAlIj4KPHN0b3Agb2Zmc2V0PSIwJSIgc3RvcC1jb2xvcj0iI0ZGNkIzNSIvPgo8c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiNGNzkzMUUiLz4KPC9saW5lYXJHcmFkaWVudD4KPC9kZWZzPgo8dGV4dCB4PSI1MCIgeT0iNTUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIyMCIgZm9udC13ZWlnaHQ9ImJvbGQiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5MT0dPPC90ZXh0Pgo8L3N2Zz4=";

// --- Ensure default users in localStorage ---
if (!localStorage.getItem("users")) {
  const defaultUsers = [
    { username: "admin", password: "admin123", email: "admin@syedsolar.com", role: "admin" },
    { username: "zubair", password: "12345", email: "zubair@syedsolar.com", role: "user" },
  ];
  localStorage.setItem("users", JSON.stringify(defaultUsers));
}

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";
  
  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);
  
  useEffect(() => {
    localStorage.removeItem("loggedIn");
    localStorage.removeItem("loggedInUser");
    localStorage.removeItem("userRole");
  }, []);
  
  const handleLogin = async (e) => {
    e.preventDefault();
    
    if (!username || !password) {
      setError("❌ خرابی | براہ کرم تمام فیلڈز بھریں\nPlease fill all fields");
      return;
    }
    
    setError("");
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    try {
      const users = JSON.parse(localStorage.getItem("users")) || [];
      const user = users.find(
        (u) =>
          u.username.trim().toLowerCase() === username.trim().toLowerCase() &&
          u.password === password
      );
      if (user) {
        localStorage.setItem("loggedIn", "true");
        localStorage.setItem("loggedInUser", user.username);
        localStorage.setItem("userRole", user.role || "user");
        localStorage.setItem("loginTime", new Date().toISOString());
        navigate(from, { replace: true });
      } else {
        setError("❌ غلط صارف نام یا پاس ورڈ | Invalid username or password");
      }
    } catch (error) {
      setError("❌ لاگ ان نہیں ہو سکا | Login failed. Please try again.");
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

  // Handle password visibility toggle - COMPLETELY FIXED VERSION
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
    // Maintain focus on password input after toggle
    setTimeout(() => {
      const passwordInput = document.querySelector('input[name="password"]');
      if (passwordInput) {
        passwordInput.focus();
        // Keep cursor at the end
        passwordInput.setSelectionRange(passwordInput.value.length, passwordInput.value.length);
      }
    }, 10);
  };
  
  return (
    <div style={{
      minHeight: "100vh",
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
      position: "relative",
      overflow: "hidden",
      padding: "20px 15px"
    }}>
      
      {/* Floating Background Elements */}
      <div style={{
        position: "absolute",
        top: "15%",
        left: "10%",
        width: "100px",
        height: "100px",
        background: "rgba(255, 255, 255, 0.08)",
        borderRadius: "50%",
        animation: "float 8s ease-in-out infinite"
      }} />
      <div style={{
        position: "absolute",
        top: "70%",
        right: "15%",
        width: "80px",
        height: "80px",
        background: "rgba(255, 255, 255, 0.06)",
        borderRadius: "50%",
        animation: "float 10s ease-in-out infinite reverse"
      }} />
      <div style={{
        position: "absolute",
        bottom: "20%",
        left: "20%",
        width: "60px",
        height: "60px",
        background: "rgba(255, 255, 255, 0.05)",
        borderRadius: "50%",
        animation: "float 12s ease-in-out infinite"
      }} />
      
      <div style={{
        background: "rgba(255, 255, 255, 0.95)",
        borderRadius: "25px",
        padding: "clamp(20px, 5vw, 45px) clamp(15px, 4vw, 40px)",
        width: "100%",
        maxWidth: "500px",
        boxShadow: `
          0 25px 80px rgba(255, 171, 0, 0.4),
          0 15px 40px rgba(0, 0, 0, 0.1),
          inset 0 1px 0 rgba(255, 255, 255, 0.8)
        `,
        zIndex: 2,
        position: "relative",
        backdropFilter: "blur(20px)",
        border: "1px solid rgba(255, 171, 0, 0.3)"
      }}>
        
        {/* Enhanced Header */}
        <div style={{ textAlign: "center", marginBottom: "clamp(10px, 3vw, 15px)" }}>
          
          {/* Live Time Display */}
          <div style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: "12px",
            marginBottom: "clamp(15px, 4vw, 20px)"
          }}>
            <div style={{
              background: "linear-gradient(135deg, #FF6B35, #F7931E)",
              color: "#FFF",
              padding: "6px 14px",
              borderRadius: "15px",
              fontSize: "clamp(12px, 2.5vw, 13px)",
              fontWeight: "700",
              textShadow: "0 1px 3px rgba(0,0,0,0.3)",
              boxShadow: "0 4px 15px rgba(247, 147, 30, 0.3)"
            }}>
              {formatTime(currentTime)}
            </div>
            <div style={{
              background: "linear-gradient(135deg, #FF6B35, #F7931E)",
              color: "#FFF",
              padding: "6px 14px",
              borderRadius: "15px",
              fontSize: "clamp(10px, 2vw, 11px)",
              fontWeight: "600",
              textShadow: "0 1px 3px rgba(0,0,0,0.3)",
              boxShadow: "0 4px 15px rgba(247, 147, 30, 0.3)"
            }}>
              {formatDate(currentTime)}
            </div>
          </div>
          
          {/* Enhanced Logo */}
          <div style={{
            position: "relative",
            display: "inline-block",
            marginBottom: "clamp(10px, 3vw, 15px)"
          }}>
            <div style={{
              padding: "10px",
              borderRadius: "20px",
              background: "rgba(255, 255, 255, 0.9)",
              boxShadow: "0 10px 30px rgba(255, 171, 0, 0.4), inset 0 2px 8px rgba(255,255,255,0.8)",
              border: "3px solid rgba(255, 171, 0, 0.3)",
              display: "inline-block"
            }}>
              <img
                src={logo}
                alt="Syed Solar Logo"
                style={{
                  width: "clamp(70px, 15vw, 90px)",
                  height: "auto",
                  borderRadius: "16px",
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
              width: "clamp(100px, 20vw, 130px)",
              height: "clamp(100px, 20vw, 130px)",
              borderRadius: "50%",
              background: "radial-gradient(circle, rgba(247, 147, 30, 0.2) 0%, transparent 70%)",
              animation: "pulse 3s ease-in-out infinite",
              zIndex: -1
            }} />
          </div>
          
          {/* Enhanced Company Title */}
          <h2 style={{
            fontWeight: 900,
            margin: "0 0 clamp(5px, 2vw, 8px) 0",
            background: "linear-gradient(135deg, #FF6B35, #F7931E)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            fontSize: "clamp(1.5rem, 5vw, 2.2rem)",
            textShadow: "0 4px 12px rgba(247, 147, 30, 0.3)",
            letterSpacing: "-0.5px"
          }}>
            Syed Solar Energy
          </h2>
          
          <div style={{
            color: "#F7931E",
            fontWeight: 600,
            letterSpacing: "0.02em",
            fontSize: "clamp(14px, 3vw, 17px)",
            marginBottom: "clamp(8px, 2vw, 12px)",
            opacity: 0.9
          }}>
            Pvt Ltd
          </div>
          
          {/* Urdu Tagline */}
          <div style={{
            background: "linear-gradient(135deg, rgba(247, 147, 30, 0.1), rgba(255, 171, 0, 0.1))",
            padding: "12px 18px",
            borderRadius: "15px",
            border: "2px solid rgba(247, 147, 30, 0.2)",
            marginBottom: "clamp(5px, 2vw, 8px)",
            backdropFilter: "blur(10px)"
          }}>
            <p style={{
              color: "#FF6B35",
              fontWeight: 700,
              fontSize: "clamp(14px, 3vw, 16px)",
              fontFamily: "'Noto Nastaliq Urdu', serif",
              margin: "0",
              textShadow: "0 2px 6px rgba(255, 107, 53, 0.3)",
              lineHeight: "1.4"
            }}>
              صاف توانائی کے سفر کا روشن راستہ
            </p>
            <p style={{
              color: "#F7931E",
              fontWeight: 500,
              fontSize: "clamp(10px, 2vw, 12px)",
              margin: "5px 0 0 0",
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
            fontSize: "clamp(14px, 3vw, 16px)",
            marginBottom: "clamp(10px, 3vw, 15px)"
          }}>
            Solar Energy Management Login
          </div>
          
          {/* Welcome Messages */}
          <div style={{ marginBottom: "clamp(8px, 2vw, 10px)" }}>
            <h3 style={{
              fontSize: "clamp(1.2rem, 4vw, 1.4rem)",
              fontWeight: 800,
              color: "#F7931E",
              marginBottom: "5px",
              fontFamily: "'Noto Nastaliq Urdu', serif"
            }}>
              خوش آمدید
            </h3>
            <h4 style={{
              fontSize: "clamp(1rem, 3.5vw, 1.1rem)",
              fontWeight: 700,
              color: "#333",
              marginBottom: "clamp(5px, 2vw, 8px)",
              margin: "0 0 clamp(5px, 2vw, 8px) 0"
            }}>
              Welcome Back!
            </h4>
            <p style={{
              fontSize: "clamp(12px, 2.5vw, 13px)",
              color: "#666",
              lineHeight: "1.5",
              marginBottom: "0"
            }}>
              Sign in to access your solar energy management system
            </p>
          </div>
        </div>
        
        {/* Enhanced BACK BUTTON */}
        <button
          type="button"
          onClick={() => navigate(-1)}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            width: "100%",
            margin: "0 auto clamp(15px, 4vw, 20px) auto",
            background: "linear-gradient(135deg, #FF6B35, #F7931E)",
            color: "#fff",
            border: "none",
            borderRadius: "12px",
            padding: "clamp(10px, 2.5vw, 12px) 28px",
            fontWeight: 700,
            fontSize: "clamp(14px, 3vw, 15px)",
            letterSpacing: "0.03em",
            boxShadow: "0 6px 20px rgba(255, 171, 0, 0.35), 0 3px 10px rgba(0,0,0,0.1)",
            cursor: "pointer",
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            textShadow: "0 2px 4px rgba(0,0,0,0.3)"
          }}
          onMouseOver={(e) => {
            e.target.style.transform = "translateY(-2px) scale(1.02)";
            e.target.style.boxShadow = "0 8px 25px rgba(255, 171, 0, 0.45), 0 4px 15px rgba(0,0,0,0.15)";
          }}
          onMouseOut={(e) => {
            e.target.style.transform = "translateY(0) scale(1)";
            e.target.style.boxShadow = "0 6px 20px rgba(255, 171, 0, 0.35), 0 3px 10px rgba(0,0,0,0.1)";
          }}
        >
          <span style={{ fontSize: "16px" }}>←</span>
          <span>واپس | Back</span>
        </button>
        
        {/* Enhanced Error message */}
        {error && (
          <div style={{
            background: "linear-gradient(135deg, #FFEBEE 0%, #FFCDD2 100%)",
            border: "2px solid #f44336",
            borderRadius: "12px",
            color: "#c62828",
            padding: "16px",
            marginBottom: "clamp(15px, 4vw, 18px)",
            fontWeight: 600,
            fontSize: "clamp(12px, 2.5vw, 14px)",
            boxShadow: "0 6px 20px rgba(244, 67, 54, 0.2)",
            textAlign: "center",
            whiteSpace: "pre-line",
            lineHeight: "1.5"
          }}>
            {error}
          </div>
        )}
        
        {/* Enhanced Login Form */}
        <form onSubmit={handleLogin} autoComplete="off">
          <div style={{ marginBottom: "clamp(15px, 4vw, 18px)", position: "relative" }}>
            <div style={{
              position: "absolute",
              left: "15px",
              top: "50%",
              transform: "translateY(-50%)",
              color: "#F7931E",
              fontSize: "clamp(16px, 3vw, 18px)",
              zIndex: 1,
              pointerEvents: "none" // FIXED: Prevent icon from interfering with input
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
                padding: "clamp(12px, 3vw, 14px) clamp(12px, 3vw, 14px) clamp(12px, 3vw, 14px) clamp(40px, 8vw, 45px)",
                borderRadius: "12px",
                border: "2px solid #ffe0b2",
                fontSize: "clamp(14px, 3vw, 15px)",
                marginBottom: "6px",
                fontWeight: "500",
                background: "#FFF",
                boxShadow: "0 4px 15px rgba(255, 171, 0, 0.1), inset 0 2px 4px rgba(255,255,255,0.8)",
                transition: "all 0.3s ease",
                boxSizing: "border-box"
              }}
              onFocus={(e) => {
                e.target.style.borderColor = "#F7931E";
                e.target.style.boxShadow = "0 6px 20px rgba(247, 147, 30, 0.25), inset 0 2px 4px rgba(255,255,255,0.8)";
                e.target.style.transform = "translateY(-2px)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "#ffe0b2";
                e.target.style.boxShadow = "0 4px 15px rgba(255, 171, 0, 0.1), inset 0 2px 4px rgba(255,255,255,0.8)";
                e.target.style.transform = "translateY(0)";
              }}
            />
          </div>
          
          <div style={{ marginBottom: "clamp(18px, 5vw, 22px)", position: "relative" }}>
            <div style={{
              position: "absolute",
              left: "15px",
              top: "50%",
              transform: "translateY(-50%)",
              color: "#F7931E",
              fontSize: "clamp(16px, 3vw, 18px)",
              zIndex: 1,
              pointerEvents: "none" // Prevent icon from interfering with input
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
                padding: "clamp(12px, 3vw, 14px) clamp(55px, 11vw, 60px) clamp(12px, 3vw, 14px) clamp(40px, 8vw, 45px)", // More right padding
                borderRadius: "12px",
                border: "2px solid #ffe0b2",
                fontSize: "clamp(14px, 3vw, 15px)",
                fontWeight: "500",
                background: "#FFF",
                boxShadow: "0 4px 15px rgba(255, 171, 0, 0.1), inset 0 2px 4px rgba(255,255,255,0.8)",
                transition: "all 0.3s ease",
                boxSizing: "border-box"
              }}
              onFocus={(e) => {
                e.target.style.borderColor = "#F7931E";
                e.target.style.boxShadow = "0 6px 20px rgba(247, 147, 30, 0.25), inset 0 2px 4px rgba(255,255,255,0.8)";
                e.target.style.transform = "translateY(-2px)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "#ffe0b2";
                e.target.style.boxShadow = "0 4px 15px rgba(255, 171, 0, 0.1), inset 0 2px 4px rgba(255,255,255,0.8)";
                e.target.style.transform = "translateY(0)";
              }}
            />
            <div
              onClick={togglePasswordVisibility}
              style={{
                position: "absolute",
                right: "15px",
                top: "50%",
                transform: "translateY(-50%)",
                fontSize: "clamp(16px, 3vw, 18px)",
                cursor: "pointer",
                color: "#999",
                transition: "all 0.3s ease",
                padding: "10px", // Better touch target
                zIndex: 10,
                borderRadius: "6px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "32px",
                height: "32px",
                userSelect: "none" // Prevent text selection
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
          
          {/* Enhanced Login Button */}
          <button
            type="submit"
            disabled={isLoading}
            style={{
              width: "100%",
              padding: "clamp(14px, 3.5vw, 16px)",
              fontSize: "clamp(15px, 3.5vw, 17px)",
              background: isLoading 
                ? "linear-gradient(135deg, #FFB74D 0%, #FFCC80 100%)"
                : "linear-gradient(135deg, #FF6B35 0%, #F7931E 100%)",
              color: "white",
              border: "none",
              borderRadius: "12px",
              fontWeight: 800,
              marginBottom: "clamp(12px, 3vw, 16px)",
              cursor: isLoading ? "not-allowed" : "pointer",
              opacity: isLoading ? 0.85 : 1,
              boxShadow: "0 8px 25px rgba(247, 147, 30, 0.4), 0 4px 15px rgba(0,0,0,0.1)",
              transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
              textShadow: "0 2px 4px rgba(0,0,0,0.3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "10px"
            }}
            onMouseOver={(e) => {
              if (!isLoading) {
                e.target.style.transform = "translateY(-3px) scale(1.02)";
                e.target.style.boxShadow = "0 12px 35px rgba(247, 147, 30, 0.5), 0 6px 20px rgba(0,0,0,0.15)";
              }
            }}
            onMouseOut={(e) => {
              if (!isLoading) {
                e.target.style.transform = "translateY(0) scale(1)";
                e.target.style.boxShadow = "0 8px 25px rgba(247, 147, 30, 0.4), 0 4px 15px rgba(0,0,0,0.1)";
              }
            }}
          >
            {isLoading ? (
              <>
                <div style={{
                  width: "18px",
                  height: "18px",
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
        
        {/* Enhanced Forgot Password */}
        <div style={{ textAlign: "center", marginTop: "clamp(8px, 2vw, 12px)", marginBottom: "clamp(15px, 4vw, 20px)" }}>
          <button 
            onClick={() => console.log('Forgot password clicked')}
            style={{
              color: "#F7931E",
              fontWeight: 600,
              textDecoration: "none",
              fontSize: "clamp(13px, 2.8vw, 14px)",
              transition: "all 0.3s ease",
              padding: "6px 12px",
              borderRadius: "8px",
              background: "none",
              border: "none",
              cursor: "pointer"
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
          </button>
        </div>
        
        {/* Enhanced Footer */}
        <div style={{
          textAlign: "center",
          marginTop: "clamp(15px, 4vw, 20px)",
          paddingTop: "clamp(12px, 3vw, 15px)",
          borderTop: "2px solid rgba(247, 147, 30, 0.1)"
        }}>
          <div style={{
            width: "50px",
            height: "3px",
            background: "linear-gradient(90deg, #FF6B35, #F7931E)",
            borderRadius: "2px",
            margin: "0 auto clamp(8px, 2vw, 12px)"
          }} />
          <p style={{
            fontSize: "clamp(11px, 2.5vw, 12px)",
            color: "#666",
            fontWeight: 600,
            marginBottom: "clamp(8px, 2vw, 10px)"
          }}>
            محفوظ اور قابل اعتماد | Secure & Trusted
          </p>
          <div style={{
            fontSize: "clamp(10px, 2vw, 11px)",
            color: "#999",
            lineHeight: "1.4"
          }}>
            <div style={{ marginBottom: "3px" }}>📧 sales@syedsolarenergy.com</div>
            <div>📱 03044678929</div>
          </div>
        </div>
      </div>
      
      {/* Enhanced Animations */}
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
        `}
      </style>
    </div>
  );
}

export default Login;