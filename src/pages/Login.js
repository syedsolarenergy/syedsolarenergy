// src/pages/Login.js
import React, { useState, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";

// Mock logo component
const logo = "logo.png"; // Adjust path as needed

// --- Ensure default users in localStorage ---
if (!localStorage.getItem("users")) {
  const defaultUsers = [
    { username: "admin", password: "Zub@12345", email: "sales@syedsolarenergy.com", role: "admin" },
    { username: "zubair", password: "Zub@12345", email: "zkafridi317@gmail.com", role: "user" },
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
  
  // Default landing page set to dashboard
  const from = location.state?.from?.pathname || "https://syedsolarenergy.com/dashboard";
  
  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);
  
  // Clear previous login data and hide navbar
  useEffect(() => {
    localStorage.removeItem("loggedIn");
    localStorage.removeItem("loggedInUser");
    localStorage.removeItem("userRole");
    
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
        
        // Show sidebar and hide navbar after successful login
        setTimeout(() => {
          const sidebar = document.querySelector('.sidebar, [class*="sidebar"]');
          const navbar = document.querySelector('.navbar, .nav, [class*="nav"]');
          
          if (sidebar) sidebar.style.display = 'block';
          if (navbar) navbar.style.display = 'none';
        }, 100);
        
        // Navigate to dashboard or intended page
        if (from.startsWith('http')) {
          window.location.href = from;
        } else {
          navigate(from, { replace: true });
        }
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
      minWidth: "100vw",
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
      padding: "clamp(10px, 2vh, 20px) clamp(10px, 2vw, 20px)",
      zIndex: "9999"
    }}>
      
      {/* Responsive Floating Background Elements */}
      <div style={{
        position: "absolute",
        top: "10%",
        left: "5%",
        width: "clamp(60px, 8vw, 120px)",
        height: "clamp(60px, 8vw, 120px)",
        background: "rgba(255, 255, 255, 0.08)",
        borderRadius: "50%",
        animation: "float 8s ease-in-out infinite"
      }} />
      <div style={{
        position: "absolute",
        top: "60%",
        right: "8%",
        width: "clamp(50px, 6vw, 100px)",
        height: "clamp(50px, 6vw, 100px)",
        background: "rgba(255, 255, 255, 0.06)",
        borderRadius: "50%",
        animation: "float 10s ease-in-out infinite reverse"
      }} />
      <div style={{
        position: "absolute",
        bottom: "15%",
        left: "15%",
        width: "clamp(40px, 5vw, 80px)",
        height: "clamp(40px, 5vw, 80px)",
        background: "rgba(255, 255, 255, 0.05)",
        borderRadius: "50%",
        animation: "float 12s ease-in-out infinite"
      }} />
      
      <div style={{
        background: "rgba(255, 255, 255, 0.95)",
        borderRadius: "clamp(15px, 3vw, 30px)",
        padding: "clamp(15px, 3vw, 45px) clamp(12px, 2.5vw, 40px)",
        width: "100%",
        maxWidth: "clamp(320px, 90vw, 550px)",
        minWidth: "280px",
        boxShadow: `
          0 25px 80px rgba(255, 171, 0, 0.4),
          0 15px 40px rgba(0, 0, 0, 0.1),
          inset 0 1px 0 rgba(255, 255, 255, 0.8)
        `,
        zIndex: 2,
        position: "relative",
        backdropFilter: "blur(20px)",
        border: "1px solid rgba(255, 171, 0, 0.3)",
        margin: "auto"
      }}>
        
        {/* Enhanced Header */}
        <div style={{ textAlign: "center", marginBottom: "clamp(8px, 2vw, 15px)" }}>
          
          {/* Live Time Display - Responsive */}
          <div style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: "clamp(6px, 2vw, 12px)",
            marginBottom: "clamp(10px, 2.5vw, 20px)",
            flexWrap: "wrap"
          }}>
            <div style={{
              background: "linear-gradient(135deg, #FF6B35, #F7931E)",
              color: "#FFF",
              padding: "clamp(4px, 1vw, 8px) clamp(8px, 2vw, 16px)",
              borderRadius: "clamp(8px, 2vw, 15px)",
              fontSize: "clamp(10px, 2vw, 14px)",
              fontWeight: "700",
              textShadow: "0 1px 3px rgba(0,0,0,0.3)",
              boxShadow: "0 4px 15px rgba(247, 147, 30, 0.3)",
              whiteSpace: "nowrap"
            }}>
              {formatTime(currentTime)}
            </div>
            <div style={{
              background: "linear-gradient(135deg, #FF6B35, #F7931E)",
              color: "#FFF",
              padding: "clamp(4px, 1vw, 8px) clamp(8px, 2vw, 16px)",
              borderRadius: "clamp(8px, 2vw, 15px)",
              fontSize: "clamp(8px, 1.8vw, 12px)",
              fontWeight: "600",
              textShadow: "0 1px 3px rgba(0,0,0,0.3)",
              boxShadow: "0 4px 15px rgba(247, 147, 30, 0.3)",
              whiteSpace: "nowrap"
            }}>
              {formatDate(currentTime)}
            </div>
          </div>
          
          {/* Enhanced Logo - Ultra Responsive */}
          <div style={{
            position: "relative",
            display: "inline-block",
            marginBottom: "clamp(8px, 2vw, 15px)"
          }}>
            <div style={{
              padding: "clamp(5px, 1.5vw, 12px)",
              borderRadius: "clamp(10px, 2.5vw, 20px)",
              background: "rgba(255, 255, 255, 0.9)",
              boxShadow: "0 10px 30px rgba(255, 171, 0, 0.4), inset 0 2px 8px rgba(255,255,255,0.8)",
              border: "clamp(1px, 0.3vw, 3px) solid rgba(255, 171, 0, 0.3)",
              display: "inline-block"
            }}>
              <img
                src={logo}
                alt="Syed Solar Logo"
                style={{
                  width: "clamp(50px, 12vw, 100px)",
                  height: "auto",
                  borderRadius: "clamp(8px, 2vw, 16px)",
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
              width: "clamp(70px, 15vw, 140px)",
              height: "clamp(70px, 15vw, 140px)",
              borderRadius: "50%",
              background: "radial-gradient(circle, rgba(247, 147, 30, 0.2) 0%, transparent 70%)",
              animation: "pulse 3s ease-in-out infinite",
              zIndex: -1
            }} />
          </div>
          
          {/* Enhanced Company Title - Ultra Responsive */}
          <h2 style={{
            fontWeight: 900,
            margin: "0 0 clamp(3px, 1vw, 8px) 0",
            background: "linear-gradient(135deg, #FF6B35, #F7931E)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            fontSize: "clamp(1.2rem, 4vw, 2.5rem)",
            textShadow: "0 4px 12px rgba(247, 147, 30, 0.3)",
            letterSpacing: "-0.5px",
            lineHeight: "1.1"
          }}>
            Syed Solar Energy
          </h2>
          
          <div style={{
            color: "#F7931E",
            fontWeight: 600,
            letterSpacing: "0.02em",
            fontSize: "clamp(12px, 2.5vw, 18px)",
            marginBottom: "clamp(6px, 1.5vw, 12px)",
            opacity: 0.9
          }}>
            Pvt Ltd
          </div>
          
          {/* Urdu Tagline - Responsive */}
          <div style={{
            background: "linear-gradient(135deg, rgba(247, 147, 30, 0.1), rgba(255, 171, 0, 0.1))",
            padding: "clamp(8px, 2vw, 15px) clamp(10px, 2.5vw, 20px)",
            borderRadius: "clamp(8px, 2vw, 15px)",
            border: "clamp(1px, 0.2vw, 2px) solid rgba(247, 147, 30, 0.2)",
            marginBottom: "clamp(4px, 1vw, 8px)",
            backdropFilter: "blur(10px)"
          }}>
            <p style={{
              color: "#FF6B35",
              fontWeight: 700,
              fontSize: "clamp(12px, 2.5vw, 17px)",
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
              fontSize: "clamp(8px, 1.8vw, 12px)",
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
            fontSize: "clamp(12px, 2.5vw, 17px)",
            marginBottom: "clamp(8px, 2vw, 15px)"
          }}>
            Solar Energy Management Login
          </div>
          
          {/* Welcome Messages - Responsive */}
          <div style={{ marginBottom: "clamp(6px, 1.5vw, 10px)" }}>
            <h3 style={{
              fontSize: "clamp(1rem, 3.5vw, 1.5rem)",
              fontWeight: 800,
              color: "#F7931E",
              marginBottom: "5px",
              fontFamily: "'Noto Nastaliq Urdu', serif"
            }}>
              خوش آمدید
            </h3>
            <h4 style={{
              fontSize: "clamp(0.9rem, 3vw, 1.2rem)",
              fontWeight: 700,
              color: "#333",
              margin: "0 0 clamp(3px, 1vw, 8px) 0"
            }}>
              Welcome Back!
            </h4>
            <p style={{
              fontSize: "clamp(10px, 2vw, 14px)",
              color: "#666",
              lineHeight: "1.5",
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
            gap: "clamp(4px, 1vw, 8px)",
            width: "100%",
            margin: "0 auto clamp(10px, 2.5vw, 20px) auto",
            background: "linear-gradient(135deg, #FF6B35, #F7931E)",
            color: "#fff",
            border: "none",
            borderRadius: "clamp(8px, 2vw, 15px)",
            padding: "clamp(8px, 2vw, 14px) clamp(15px, 3vw, 30px)",
            fontWeight: 700,
            fontSize: "clamp(12px, 2.5vw, 16px)",
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
          <span style={{ fontSize: "clamp(12px, 2.5vw, 18px)" }}>←</span>
          <span>واپس | Back</span>
        </button>
        
        {/* Enhanced Error message - Responsive */}
        {error && (
          <div style={{
            background: "linear-gradient(135deg, #FFEBEE 0%, #FFCDD2 100%)",
            border: "clamp(1px, 0.2vw, 2px) solid #f44336",
            borderRadius: "clamp(8px, 2vw, 15px)",
            color: "#c62828",
            padding: "clamp(10px, 2.5vw, 18px)",
            marginBottom: "clamp(10px, 2.5vw, 18px)",
            fontWeight: 600,
            fontSize: "clamp(10px, 2vw, 14px)",
            boxShadow: "0 6px 20px rgba(244, 67, 54, 0.2)",
            textAlign: "center",
            whiteSpace: "pre-line",
            lineHeight: "1.5"
          }}>
            {error}
          </div>
        )}
        
        {/* Enhanced Login Form - Ultra Responsive */}
        <form onSubmit={handleLogin} autoComplete="off">
          <div style={{ marginBottom: "clamp(12px, 3vw, 18px)", position: "relative" }}>
            <div style={{
              position: "absolute",
              left: "clamp(8px, 2vw, 15px)",
              top: "50%",
              transform: "translateY(-50%)",
              color: "#F7931E",
              fontSize: "clamp(14px, 2.5vw, 18px)",
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
                padding: "clamp(10px, 2.5vw, 16px) clamp(10px, 2.5vw, 16px) clamp(10px, 2.5vw, 16px) clamp(35px, 7vw, 50px)",
                borderRadius: "clamp(8px, 2vw, 15px)",
                border: "clamp(1px, 0.2vw, 2px) solid #ffe0b2",
                fontSize: "clamp(12px, 2.5vw, 16px)",
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
          
          <div style={{ marginBottom: "clamp(15px, 4vw, 25px)", position: "relative" }}>
            <div style={{
              position: "absolute",
              left: "clamp(8px, 2vw, 15px)",
              top: "50%",
              transform: "translateY(-50%)",
              color: "#F7931E",
              fontSize: "clamp(14px, 2.5vw, 18px)",
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
                padding: "clamp(10px, 2.5vw, 16px) clamp(45px, 9vw, 65px) clamp(10px, 2.5vw, 16px) clamp(35px, 7vw, 50px)",
                borderRadius: "clamp(8px, 2vw, 15px)",
                border: "clamp(1px, 0.2vw, 2px) solid #ffe0b2",
                fontSize: "clamp(12px, 2.5vw, 16px)",
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
                right: "clamp(8px, 2vw, 15px)",
                top: "50%",
                transform: "translateY(-50%)",
                fontSize: "clamp(14px, 2.5vw, 18px)",
                cursor: "pointer",
                color: "#999",
                transition: "all 0.3s ease",
                padding: "clamp(6px, 1.5vw, 12px)",
                zIndex: 10,
                borderRadius: "6px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "clamp(28px, 6vw, 35px)",
                height: "clamp(28px, 6vw, 35px)",
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
              padding: "clamp(12px, 3vw, 18px)",
              fontSize: "clamp(13px, 3vw, 18px)",
              background: isLoading 
                ? "linear-gradient(135deg, #FFB74D 0%, #FFCC80 100%)"
                : "linear-gradient(135deg, #FF6B35 0%, #F7931E 100%)",
              color: "white",
              border: "none",
              borderRadius: "clamp(8px, 2vw, 15px)",
              fontWeight: 800,
              marginBottom: "clamp(10px, 2.5vw, 18px)",
              cursor: isLoading ? "not-allowed" : "pointer",
              opacity: isLoading ? 0.85 : 1,
              boxShadow: "0 8px 25px rgba(247, 147, 30, 0.4), 0 4px 15px rgba(0,0,0,0.1)",
              transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
              textShadow: "0 2px 4px rgba(0,0,0,0.3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "clamp(6px, 1.5vw, 12px)"
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
                  width: "clamp(14px, 3vw, 20px)",
                  height: "clamp(14px, 3vw, 20px)",
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
        <div style={{ textAlign: "center", marginTop: "clamp(6px, 1.5vw, 12px)", marginBottom: "clamp(12px, 3vw, 20px)" }}>
          <button 
            onClick={() => console.log('Forgot password clicked')}
            style={{
              color: "#F7931E",
              fontWeight: 600,
              textDecoration: "none",
              fontSize: "clamp(11px, 2.2vw, 15px)",
              transition: "all 0.3s ease",
              padding: "clamp(4px, 1vw, 8px) clamp(8px, 2vw, 15px)",
              borderRadius: "clamp(6px, 1.5vw, 10px)",
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
        
        {/* Enhanced Footer - Ultra Responsive */}
        <div style={{
          textAlign: "center",
          marginTop: "clamp(12px, 3vw, 20px)",
          paddingTop: "clamp(8px, 2vw, 15px)",
          borderTop: "clamp(1px, 0.2vw, 2px) solid rgba(247, 147, 30, 0.1)"
        }}>
          <div style={{
            width: "clamp(30px, 8vw, 60px)",
            height: "clamp(2px, 0.5vw, 4px)",
            background: "linear-gradient(90deg, #FF6B35, #F7931E)",
            borderRadius: "2px",
            margin: "0 auto clamp(6px, 1.5vw, 12px)"
          }} />
          <p style={{
            fontSize: "clamp(9px, 2vw, 13px)",
            color: "#666",
            fontWeight: 600,
            marginBottom: "clamp(6px, 1.5vw, 10px)"
          }}>
            محفوظ اور قابل اعتماد | Secure & Trusted
          </p>
          <div style={{
            fontSize: "clamp(8px, 1.8vw, 12px)",
            color: "#999",
            lineHeight: "1.4"
          }}>
            <div style={{ marginBottom: "3px" }}>📧 sales@syedsolarenergy.com</div>
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
            .login-container {
              padding: 8px !important;
            }
          }
          
          /* Small Screens (phones) */
          @media screen and (max-width: 480px) {
            .login-container {
              padding: 10px !important;
            }
          }
          
          /* Medium Screens (tablets) */
          @media screen and (min-width: 481px) and (max-width: 768px) {
            .login-container {
              padding: 15px !important;
            }
          }
          
          /* Large Screens (laptops) */
          @media screen and (min-width: 769px) and (max-width: 1024px) {
            .login-container {
              padding: 20px !important;
            }
          }
          
          /* Extra Large Screens (desktops) */
          @media screen and (min-width: 1025px) and (max-width: 1440px) {
            .login-container {
              padding: 25px !important;
            }
          }
          
          /* Ultra Large Screens (4K monitors) */
          @media screen and (min-width: 1441px) {
            .login-container {
              padding: 30px !important;
            }
          }
          
          /* Landscape Mobile Phones */
          @media screen and (max-height: 500px) and (orientation: landscape) {
            .login-container {
              padding: 5px !important;
              overflow-y: auto;
            }
          }
          
          /* High DPI Displays */
          @media screen and (-webkit-min-device-pixel-ratio: 2) {
            .login-container {
              -webkit-font-smoothing: antialiased;
              -moz-osx-font-smoothing: grayscale;
            }
          }
          
          /* Dark Mode Support */
          @media (prefers-color-scheme: dark) {
            .login-container {
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
            .login-form-input {
              border-width: 3px !important;
            }
          }
          
          /* Print Styles */
          @media print {
            .login-container {
              background: white !important;
              box-shadow: none !important;
            }
          }
          
          /* Universal Input Accessibility */
          input:focus {
            outline: 3px solid rgba(247, 147, 30, 0.5) !important;
            outline-offset: 2px !important;
          }
          
          /* Touch Device Optimizations */
          @media (hover: none) and (pointer: coarse) {
            button, input {
              min-height: 44px !important; /* Apple's minimum touch target */
            }
          }
          
          /* Keyboard Navigation */
          *:focus-visible {
            outline: 3px solid #F7931E !important;
            outline-offset: 2px !important;
          }
          
          /* Container Class for Media Queries */
          .login-container {
            transition: all 0.3s ease !important;
          }
        `}
      </style>
    </div>
  );
}

export default Login;