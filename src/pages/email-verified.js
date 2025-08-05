import React, { useState, useEffect } from "react";
import logo from "../assets/logo.png";

const EmailVerified = () => {
  const [showConfetti, setShowConfetti] = useState(true);
  const [animateElements, setAnimateElements] = useState(false);

  useEffect(() => {
    setAnimateElements(true);
    const timer = setTimeout(() => setShowConfetti(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  const ConfettiPiece = ({ delay, color, size, left, animationDuration }) => (
    <div
      className="confetti-piece"
      style={{
        position: 'absolute',
        width: size,
        height: size,
        backgroundColor: color,
        left: `${left}%`,
        top: '-10px',
        opacity: showConfetti ? 1 : 0,
        animation: `confetti-fall ${animationDuration}s ease-in ${delay}s infinite`,
        borderRadius: Math.random() > 0.5 ? '50%' : '2px',
        transform: `rotate(${Math.random() * 360}deg)`,
      }}
    />
  );

  const confettiColors = ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8'];
  const confettiPieces = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    delay: Math.random() * 3,
    color: confettiColors[Math.floor(Math.random() * confettiColors.length)],
    size: Math.random() * 8 + 4,
    left: Math.random() * 100,
    animationDuration: Math.random() * 3 + 2,
  }));

  return (
    <div
      style={{
        background: "linear-gradient(135deg, #ff9800 0%, #ff5722 50%, #e65100 100%)",
        height: "100vh",
        width: "100vw",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
        margin: 0,
        padding: "20px",
        overflow: "hidden",
        position: "fixed",
        top: 0,
        left: 0,
        zIndex: 9999,
        textAlign: "center",
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        boxSizing: "border-box",
      }}
    >
      <style>
        {`
          * {
            box-sizing: border-box;
          }
          
          @keyframes confetti-fall {
            0% {
              transform: translateY(-10px) rotate(0deg);
              opacity: 1;
            }
            100% {
              transform: translateY(100vh) rotate(720deg);
              opacity: 0;
            }
          }
          
          @keyframes bounce-in {
            0% {
              transform: scale(0.3) translateY(-50px);
              opacity: 0;
            }
            50% {
              transform: scale(1.05);
            }
            70% {
              transform: scale(0.9);
            }
            100% {
              transform: scale(1) translateY(0);
              opacity: 1;
            }
          }
          
          @keyframes slide-up {
            0% {
              transform: translateY(30px);
              opacity: 0;
            }
            100% {
              transform: translateY(0);
              opacity: 1;
            }
          }
          
          @keyframes pulse {
            0% {
              transform: scale(1);
            }
            50% {
              transform: scale(1.05);
            }
            100% {
              transform: scale(1);
            }
          }
          
          @keyframes glow {
            0% {
              box-shadow: 0 0 20px rgba(255, 255, 255, 0.3);
            }
            50% {
              box-shadow: 0 0 30px rgba(255, 255, 255, 0.5), 0 0 40px rgba(255, 152, 0, 0.3);
            }
            100% {
              box-shadow: 0 0 20px rgba(255, 255, 255, 0.3);
            }
          }
          
          /* Mobile responsiveness */
          @media (max-width: 768px) {
            .main-container {
              padding: 20px !important;
              margin: 10px !important;
              max-width: calc(100vw - 20px) !important;
            }
            .main-heading {
              font-size: 28px !important;
            }
            .welcome-text {
              font-size: 18px !important;
            }
            .status-text {
              font-size: 16px !important;
            }
            .logo-img {
              width: 100px !important;
              height: 100px !important;
            }
            .success-icon {
              font-size: 60px !important;
            }
          }
          
          @media (max-width: 480px) {
            .main-container {
              padding: 15px !important;
              margin: 5px !important;
            }
            .main-heading {
              font-size: 24px !important;
            }
            .welcome-text {
              font-size: 16px !important;
            }
            .status-text {
              font-size: 14px !important;
            }
            .logo-img {
              width: 80px !important;
              height: 80px !important;
            }
            .success-icon {
              font-size: 50px !important;
            }
            .action-button {
              padding: 12px 24px !important;
              font-size: 16px !important;
            }
          }
          
          /* Tablet responsiveness */
          @media (min-width: 769px) and (max-width: 1024px) {
            .main-container {
              max-width: 80% !important;
            }
          }
          
          /* Large screen responsiveness */
          @media (min-width: 1200px) {
            .main-container {
              max-width: 700px !important;
            }
          }
        `}
      </style>

      {/* Confetti */}
      {confettiPieces.map((piece) => (
        <ConfettiPiece key={piece.id} {...piece} />
      ))}

      {/* Background decoration circles */}
      <div
        style={{
          position: 'absolute',
          width: '300px',
          height: '300px',
          borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.1)',
          top: '10%',
          right: '10%',
          animation: 'pulse 4s ease-in-out infinite',
        }}
      />
      <div
        style={{
          position: 'absolute',
          width: '200px',
          height: '200px',
          borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.05)',
          bottom: '15%',
          left: '5%',
          animation: 'pulse 3s ease-in-out infinite 1s',
        }}
      />

      {/* Main content container */}
      <div
        className="main-container"
        style={{
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
          borderRadius: '20px',
          padding: '40px',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          maxWidth: '600px',
          width: '90%',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
          animation: animateElements ? 'slide-up 0.8s ease-out' : 'none',
          boxSizing: 'border-box',
        }}
      >
        {/* Logo */}
        <div
          style={{
            animation: animateElements ? 'bounce-in 1s ease-out 0.2s both' : 'none',
          }}
        >
          <img
            src={logo}
            alt="Solar Olagawa Logo"
            className="logo-img"
            style={{
              width: '120px',
              height: '120px',
              borderRadius: '50%',
              border: '6px solid white',
              objectFit: 'cover',
              margin: '0 auto 30px',
              display: 'block',
              animation: 'glow 2s ease-in-out infinite',
            }}
          />
        </div>

        {/* Success Icon */}
        <div
          className="success-icon"
          style={{
            fontSize: '80px',
            animation: animateElements ? 'bounce-in 1s ease-out 0.4s both' : 'none',
            marginBottom: '20px',
          }}
        >
          ✅
        </div>

        {/* Main heading */}
        <h1
          className="main-heading"
          style={{
            color: "#fff",
            fontSize: '36px',
            marginBottom: '20px',
            fontWeight: '700',
            textShadow: '2px 2px 4px rgba(0, 0, 0, 0.3)',
            animation: animateElements ? 'slide-up 0.8s ease-out 0.6s both' : 'none',
          }}
        >
          🎉 Email Verified Successfully!
        </h1>

        {/* Welcome message */}
        <div
          style={{
            animation: animateElements ? 'slide-up 0.8s ease-out 0.8s both' : 'none',
          }}
        >
          <p
            className="welcome-text"
            style={{
              color: "#fff",
              fontSize: '22px',
              marginBottom: '25px',
              fontWeight: '500',
              textShadow: '1px 1px 2px rgba(0, 0, 0, 0.3)',
              lineHeight: '1.6',
            }}
          >
            Welcome to <strong style={{ color: '#FFD700' }}>Solar Olagawa App</strong>!<br />
            <span style={{ fontSize: '20px', opacity: '0.9' }}>
              خوش آمدید سولا اولگاوا ایپ میں!<br />
              سولا اولگاوا ایپ ته ښه راغلاست!
            </span>
          </p>
        </div>

        {/* Status message */}
        <div
          style={{
            background: 'rgba(76, 175, 80, 0.2)',
            borderLeft: '4px solid #4CAF50',
            padding: '20px',
            borderRadius: '10px',
            marginBottom: '25px',
            animation: animateElements ? 'slide-up 0.8s ease-out 1s both' : 'none',
          }}
        >
          <p
            className="status-text"
            style={{
              color: "#fff",
              fontSize: '18px',
              margin: 0,
              textShadow: '1px 1px 2px rgba(0, 0, 0, 0.3)',
              lineHeight: '1.7',
            }}
          >
            🚀 Your account is now active and ready to use!<br />
            <span style={{ fontSize: '16px', opacity: '0.9' }}>
              اب آپ سولا اولگاوا ایپ میں لاگ ان کر سکتے ہیں۔<br />
              اوسے تاسو کولای شۍ چی اوس سولا اولگاوا ایپ ته لوگ ان شی
            </span>
          </p>
        </div>

        {/* Action button */}
        <div
          style={{
            animation: animateElements ? 'slide-up 0.8s ease-out 1.2s both' : 'none',
          }}
        >
          <button
            className="action-button"
            style={{
              background: 'linear-gradient(45deg, #4CAF50, #45a049)',
              color: 'white',
              border: 'none',
              padding: '15px 30px',
              fontSize: '18px',
              fontWeight: '600',
              borderRadius: '50px',
              cursor: 'pointer',
              boxShadow: '0 4px 15px rgba(76, 175, 80, 0.4)',
              transition: 'all 0.3s ease',
              textShadow: '1px 1px 2px rgba(0, 0, 0, 0.2)',
            }}
            onMouseOver={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 6px 20px rgba(76, 175, 80, 0.6)';
            }}
            onMouseOut={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 4px 15px rgba(76, 175, 80, 0.4)';
            }}
            onClick={() => {
              solarolagawa://login
              console.log('Proceed to app');
            }}
          >
            ⚡ Continue to App
          </button>
        </div>

        {/* Footer note */}
        <div
          style={{
            marginTop: '30px',
            animation: animateElements ? 'slide-up 0.8s ease-out 1.4s both' : 'none',
          }}
        >
          <p
            style={{
              color: 'rgba(255, 255, 255, 0.8)',
              fontSize: '14px',
              margin: 0,
              fontStyle: 'italic',
            }}
          >
            Thank you for joining Solar Olagawa! 🌟
          </p>
        </div>
      </div>
    </div>
  );
};

export default EmailVerified;