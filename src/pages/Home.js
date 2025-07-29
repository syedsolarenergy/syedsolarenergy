import React, { useEffect, useState, useCallback } from "react";
import Footer from "../components/Footer";
import Slider from "react-slick";
import { supabase } from "../supabaseClient";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "../styles/Responsive.css";

// Animated Solar Energy Flow Component
const SolarEnergyFlow = () => {
  return (
    <div style={{
      position: 'relative',
      width: '100%',
      height: '400px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: '40px'
    }}>
      {/* Animated Sun */}
      <div style={{
        position: 'absolute',
        top: '20px',
        left: '10%',
        width: '80px',
        height: '80px',
        background: 'radial-gradient(circle, #FFD700, #FFA500)',
        borderRadius: '50%',
        animation: 'sunPulse 3s ease-in-out infinite',
        boxShadow: '0 0 30px rgba(255, 215, 0, 0.6)',
        zIndex: 3
      }}>
        {/* Sun Rays */}
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              width: '4px',
              height: '25px',
              background: 'linear-gradient(transparent, #FFD700, transparent)',
              transformOrigin: '2px 0px',
              transform: `translate(-50%, -100%) rotate(${i * 45}deg)`,
              animation: `sunRays 2s ease-in-out infinite ${i * 0.1}s`
            }}
          />
        ))}
      </div>

      {/* Energy Rays from Sun to Solar Panel */}
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            top: '80px',
            left: `${15 + i * 2}%`,
            width: '3px',
            height: '100px',
            background: 'linear-gradient(to bottom, #FFD700, transparent)',
            transform: 'rotate(15deg)',
            animation: `energyRays 1.5s ease-in-out infinite ${i * 0.2}s`,
            opacity: 0.8
          }}
        />
      ))}

      {/* Solar Panel */}
      <div style={{
        position: 'absolute',
        top: '180px',
        left: '20%',
        width: '120px',
        height: '80px',
        background: 'linear-gradient(145deg, #1a237e, #3949ab)',
        borderRadius: '8px',
        border: '3px solid #0d47a1',
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gridTemplateRows: 'repeat(3, 1fr)',
        gap: '2px',
        padding: '4px',
        animation: 'panelGlow 2s ease-in-out infinite',
        zIndex: 2
      }}>
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            style={{
              background: 'linear-gradient(145deg, #283593, #1a237e)',
              borderRadius: '2px',
              animation: `panelCell 2s ease-in-out infinite ${i * 0.1}s`
            }}
          />
        ))}
      </div>

      {/* Electricity Flow Line */}
      <svg
        style={{
          position: 'absolute',
          top: '0',
          left: '0',
          width: '100%',
          height: '100%',
          zIndex: 1,
          pointerEvents: 'none'
        }}
        viewBox="0 0 800 400"
      >
        <defs>
          <linearGradient id="electricFlow" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#00e5ff" stopOpacity="0"/>
            <stop offset="50%" stopColor="#00e5ff" stopOpacity="1"/>
            <stop offset="100%" stopColor="#00e5ff" stopOpacity="0"/>
          </linearGradient>
        </defs>
        
        {/* Curved path from solar panel to inverter */}
        <path
          d="M 280 220 Q 400 180 520 240"
          stroke="url(#electricFlow)"
          strokeWidth="4"
          fill="none"
          strokeDasharray="10,5"
          style={{
            animation: 'electricFlow 2s linear infinite'
          }}
        />
        
        {/* Path from inverter to bulb */}
        <path
          d="M 600 240 Q 680 200 720 160"
          stroke="url(#electricFlow)"
          strokeWidth="4"
          fill="none"
          strokeDasharray="10,5"
          style={{
            animation: 'electricFlow 2s linear infinite 0.5s'
          }}
        />
        
        {/* Electric sparks */}
        {[...Array(3)].map((_, i) => (
          <circle
            key={i}
            cx={350 + i * 100}
            cy={200 + Math.sin(i) * 20}
            r="3"
            fill="#00e5ff"
            style={{
              animation: `electricSpark 1s ease-in-out infinite ${i * 0.3}s`
            }}
          />
        ))}
      </svg>

      {/* Inverter */}
      <div style={{
        position: 'absolute',
        top: '200px',
        left: '65%',
        width: '80px',
        height: '60px',
        background: 'linear-gradient(145deg, #424242, #616161)',
        borderRadius: '8px',
        border: '2px solid #212121',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        animation: 'inverterHum 3s ease-in-out infinite',
        zIndex: 2
      }}>
        <div style={{
          width: '50px',
          height: '8px',
          background: 'linear-gradient(90deg, #4caf50, #8bc34a)',
          borderRadius: '4px',
          marginBottom: '4px',
          animation: 'statusLight 1s ease-in-out infinite alternate'
        }} />
        <div style={{
          fontSize: '10px',
          color: '#fff',
          fontWeight: 'bold'
        }}>
          INVERTER
        </div>
        {/* Cooling vents */}
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            style={{
              width: '60px',
              height: '2px',
              background: '#333',
              margin: '1px 0'
            }}
          />
        ))}
      </div>

      {/* Light Bulb */}
      <div style={{
        position: 'absolute',
        top: '120px',
        right: '10%',
        width: '50px',
        height: '70px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        animation: 'bulbGlow 2s ease-in-out infinite',
        zIndex: 2
      }}>
        {/* Bulb Glass */}
        <div style={{
          width: '40px',
          height: '40px',
          background: 'radial-gradient(circle, #fff9c4, #fff176)',
          borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%',
          border: '2px solid #fbc02d',
          position: 'relative',
          animation: 'lightFlicker 3s ease-in-out infinite'
        }}>
          {/* Filament */}
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '20px',
            height: '20px',
            background: 'none',
            border: '1px solid #f57f17',
            borderRadius: '50%'
          }} />
          <div style={{
            position: 'absolute',
            top: '40%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '12px',
            height: '1px',
            background: '#f57f17'
          }} />
        </div>
        
        {/* Bulb Base */}
        <div style={{
          width: '30px',
          height: '20px',
          background: 'linear-gradient(145deg, #666, #999)',
          borderRadius: '0 0 8px 8px',
          position: 'relative'
        }}>
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              style={{
                width: '100%',
                height: '2px',
                background: '#444',
                marginTop: '2px'
              }}
            />
          ))}
        </div>

        {/* Light Rays */}
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              top: '20px',
              left: '50%',
              width: '2px',
              height: '20px',
              background: 'linear-gradient(transparent, #fff9c4, transparent)',
              transformOrigin: '1px 0px',
              transform: `translate(-50%, -100%) rotate(${i * 30}deg)`,
              animation: `lightRays 2s ease-in-out infinite ${i * 0.1}s`,
              opacity: 0.7
            }}
          />
        ))}
      </div>

      {/* Energy Flow Particles */}
      {[...Array(8)].map((_, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            width: '4px',
            height: '4px',
            background: '#00e5ff',
            borderRadius: '50%',
            animation: `flowParticles 3s linear infinite ${i * 0.3}s`,
            opacity: 0.8
          }}
        />
      ))}
    </div>
  );
};

// WhatsApp Popup Component
const WhatsAppPopup = () => {
  const [isVisible, setIsVisible] = useState(true);
  
  if (!isVisible) return null;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        background: 'linear-gradient(135deg, #25D366, #128C7E)',
        borderRadius: '25px',
        padding: '15px 20px',
        boxShadow: '0 8px 30px rgba(37, 211, 102, 0.4)',
        zIndex: 1000,
        cursor: 'pointer',
        transform: 'translateY(0)',
        transition: 'all 0.3s ease',
        animation: 'bounce 2s infinite',
        maxWidth: '280px'
      }}
      onClick={() => window.open('https://wa.me/923044678929?text=Hello! I need help with solar energy solutions.', '_blank')}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-5px)';
        e.currentTarget.style.boxShadow = '0 12px 35px rgba(37, 211, 102, 0.6)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 8px 30px rgba(37, 211, 102, 0.4)';
      }}
    >
      <button
        onClick={(e) => {
          e.stopPropagation();
          setIsVisible(false);
        }}
        style={{
          position: 'absolute',
          top: '-5px',
          right: '-5px',
          background: 'rgba(255,255,255,0.9)',
          border: 'none',
          borderRadius: '50%',
          width: '20px',
          height: '20px',
          fontSize: '12px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#666'
        }}
      >
        ×
      </button>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{
          fontSize: '24px',
          animation: 'pulse 1.5s infinite'
        }}>
          📞
        </div>
        <div>
          <div style={{
            color: 'white',
            fontWeight: 'bold',
            fontSize: '14px',
            marginBottom: '2px'
          }}>
            Need Help?
          </div>
          <div style={{
            color: 'rgba(255,255,255,0.9)',
            fontSize: '12px'
          }}>
            Contact us on WhatsApp
          </div>
        </div>
      </div>
    </div>
  );
};

// Enhanced Special Offer Popup Component
const SpecialOfferPopup = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [timeLeft, setTimeLeft] = useState({
    hours: 23,
    minutes: 59,
    seconds: 59
  });

  useEffect(() => {
    const autoHideTimer = setTimeout(() => {
      setIsVisible(false);
    }, 15000);

    const countdownTimer = setInterval(() => {
      setTimeLeft(prev => {
        let newSeconds = prev.seconds - 1;
        let newMinutes = prev.minutes;
        let newHours = prev.hours;

        if (newSeconds < 0) {
          newSeconds = 59;
          newMinutes -= 1;
        }
        if (newMinutes < 0) {
          newMinutes = 59;
          newHours -= 1;
        }
        if (newHours < 0) {
          newHours = 23;
          newMinutes = 59;
          newSeconds = 59;
        }

        return {
          hours: newHours,
          minutes: newMinutes,
          seconds: newSeconds
        };
      });
    }, 1000);

    return () => {
      clearTimeout(autoHideTimer);
      clearInterval(countdownTimer);
    };
  }, []);

  if (!isVisible) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.85)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2000,
        padding: '20px',
        animation: 'fadeIn 0.5s ease-out'
      }}
    >
      <div
        style={{
          background: `
            linear-gradient(135deg, #FF6B35 0%, #F7931E 25%, #FF9800 50%, #FFB74D 75%, #FFCC02 100%),
            radial-gradient(circle at 30% 30%, rgba(255,255,255,0.2) 0%, transparent 50%),
            radial-gradient(circle at 70% 70%, rgba(255,255,255,0.1) 0%, transparent 50%)
          `,
          backgroundSize: '300% 300%, 100% 100%, 100% 100%',
          animation: 'gradientShift 4s ease infinite, popupEntrance 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
          borderRadius: '20px',
          padding: '30px',
          maxWidth: '450px',
          maxHeight: '85vh',
          width: '100%',
          textAlign: 'center',
          position: 'relative',
          boxShadow: `
            0 25px 80px rgba(0,0,0,0.4),
            0 0 0 1px rgba(255,255,255,0.2),
            inset 0 1px 0 rgba(255,255,255,0.3)
          `,
          color: 'white',
          border: '2px solid rgba(255,255,255,0.2)',
          overflow: 'auto'
        }}
      >
        {/* Enhanced close button - positioned outside the main content */}
        <button
          onClick={() => setIsVisible(false)}
          style={{
            position: 'absolute',
            top: '-10px',
            right: '-10px',
            background: 'rgba(255,255,255,0.9)',
            backdropFilter: 'blur(10px)',
            border: '2px solid #FF6B35',
            borderRadius: '50%',
            width: '35px',
            height: '35px',
            fontSize: '18px',
            cursor: 'pointer',
            color: '#FF6B35',
            fontWeight: 'bold',
            transition: 'all 0.3s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10,
            boxShadow: '0 4px 15px rgba(0,0,0,0.3)'
          }}
          onMouseEnter={(e) => {
            e.target.style.background = '#FF6B35';
            e.target.style.color = 'white';
            e.target.style.transform = 'scale(1.1) rotate(90deg)';
          }}
          onMouseLeave={(e) => {
            e.target.style.background = 'rgba(255,255,255,0.9)';
            e.target.style.color = '#FF6B35';
            e.target.style.transform = 'scale(1) rotate(0deg)';
          }}
        >
          ×
        </button>

        {/* Header with emojis */}
        <div style={{ 
          fontSize: '40px', 
          marginBottom: '15px',
          display: 'flex',
          justifyContent: 'center',
          gap: '10px',
          animation: 'bounce 2s ease-in-out infinite'
        }}>
          <span style={{ animation: 'pulse 2s ease-in-out infinite' }}>🔥</span>
          <span style={{ animation: 'pulse 2s ease-in-out infinite 0.3s' }}>⚡</span>
        </div>
        
        <h2 style={{
          margin: '0 0 8px 0',
          fontSize: '26px',
          fontWeight: 'bold',
          textShadow: '3px 3px 6px rgba(0,0,0,0.4)',
          background: 'linear-gradient(45deg, #ffffff, #fff9c4)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}>
          MEGA SOLAR DEAL!
        </h2>

        <div style={{
          background: 'rgba(255,255,255,0.2)',
          borderRadius: '12px',
          padding: '10px',
          marginBottom: '12px',
          border: '1px solid rgba(255,255,255,0.3)'
        }}>
          <p style={{
            fontSize: '16px',
            margin: '0',
            fontWeight: 'bold',
            textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
          }}>
            🎯 30% OFF + FREE Installation
          </p>
        </div>

        {/* Compact countdown timer */}
        <div style={{
          background: 'rgba(0,0,0,0.3)',
          borderRadius: '15px',
          padding: '15px',
          marginBottom: '20px',
          border: '2px solid rgba(255,255,255,0.2)',
          backdropFilter: 'blur(10px)'
        }}>
          <div style={{ 
            fontSize: '12px', 
            marginBottom: '10px', 
            opacity: 0.9,
            fontWeight: 'bold',
            textTransform: 'uppercase'
          }}>
            ⏰ Expires in:
          </div>
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '12px',
            fontSize: '20px',
            fontWeight: 'bold'
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{
                background: 'linear-gradient(145deg, rgba(255,255,255,0.25), rgba(255,255,255,0.1))',
                borderRadius: '8px',
                padding: '8px 10px',
                minWidth: '40px',
                border: '1px solid rgba(255,255,255,0.3)'
              }}>
                {String(timeLeft.hours).padStart(2, '0')}
              </div>
              <div style={{ fontSize: '10px', marginTop: '4px' }}>HRS</div>
            </div>
            <div style={{ fontSize: '24px', alignSelf: 'center', opacity: 0.7 }}>:</div>
            <div style={{ textAlign: 'center' }}>
              <div style={{
                background: 'linear-gradient(145deg, rgba(255,255,255,0.25), rgba(255,255,255,0.1))',
                borderRadius: '8px',
                padding: '8px 10px',
                minWidth: '40px',
                border: '1px solid rgba(255,255,255,0.3)'
              }}>
                {String(timeLeft.minutes).padStart(2, '0')}
              </div>
              <div style={{ fontSize: '10px', marginTop: '4px' }}>MIN</div>
            </div>
            <div style={{ fontSize: '24px', alignSelf: 'center', opacity: 0.7 }}>:</div>
            <div style={{ textAlign: 'center' }}>
              <div style={{
                background: 'linear-gradient(145deg, rgba(255,255,255,0.25), rgba(255,255,255,0.1))',
                borderRadius: '8px',
                padding: '8px 10px',
                minWidth: '40px',
                border: '1px solid rgba(255,255,255,0.3)',
                animation: 'pulse 1s ease-in-out infinite'
              }}>
                {String(timeLeft.seconds).padStart(2, '0')}
              </div>
              <div style={{ fontSize: '10px', marginTop: '4px' }}>SEC</div>
            </div>
          </div>
        </div>

        {/* Compact action buttons */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          alignItems: 'center'
        }}>
          {/* Primary CTA Button */}
          <button
            onClick={() => window.open('https://wa.me/923075506695?text=Hi! I am interested in the 30% OFF solar installation offer. Please provide more details.', '_blank')}
            style={{
              background: 'linear-gradient(145deg, #ffffff, #f0f0f0)',
              color: '#FF6600',
              border: 'none',
              padding: '14px 28px',
              borderRadius: '25px',
              fontSize: '14px',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
              boxShadow: '0 6px 20px rgba(0,0,0,0.3)',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'scale(1.05) translateY(-2px)';
              e.target.style.boxShadow = '0 8px 25px rgba(0,0,0,0.4)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'scale(1) translateY(0)';
              e.target.style.boxShadow = '0 6px 20px rgba(0,0,0,0.3)';
            }}
          >
            🚀 Claim via WhatsApp
          </button>

          {/* Secondary action buttons */}
          <div style={{
            display: 'flex',
            gap: '8px',
            justifyContent: 'center'
          }}>
            <button
              onClick={() => window.location.href = '/quotation'}
              style={{
                background: 'rgba(255,255,255,0.2)',
                color: 'white',
                border: '1px solid rgba(255,255,255,0.4)',
                padding: '8px 16px',
                borderRadius: '20px',
                fontSize: '12px',
                fontWeight: 'bold',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                backdropFilter: 'blur(10px)'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = 'rgba(255,255,255,0.3)';
                e.target.style.transform = 'scale(1.05)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'rgba(255,255,255,0.2)';
                e.target.style.transform = 'scale(1)';
              }}
            >
              📋 Quote
            </button>
            
            <button
              onClick={() => window.location.href = '/loadcalculator'}
              style={{
                background: 'rgba(255,255,255,0.2)',
                color: 'white',
                border: '1px solid rgba(255,255,255,0.4)',
                padding: '8px 16px',
                borderRadius: '20px',
                fontSize: '12px',
                fontWeight: 'bold',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                backdropFilter: 'blur(10px)'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = 'rgba(255,255,255,0.3)';
                e.target.style.transform = 'scale(1.05)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'rgba(255,255,255,0.2)';
                e.target.style.transform = 'scale(1)';
              }}
            >
              🧮 Calculator
            </button>
          </div>

          {/* Compact trust indicators */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginTop: '8px',
            fontSize: '10px',
            opacity: 0.9,
            flexWrap: 'wrap',
            justifyContent: 'center'
          }}>
            <span>✅ Free Consultation</span>
            <span>🛡️ 25-Yr Warranty</span>
            <span>⭐ 1000+ Customers</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Enhanced Counter Component with + icons
const Counter = ({ value, label, color = "#FF6B35" }) => {
  const [count, setCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.5 }
    );

    const element = document.getElementById(`counter-${label}`);
    if (element) observer.observe(element);

    return () => observer.disconnect();
  }, [label]);

  useEffect(() => {
    if (!isVisible) return;
    
    let start = 0;
    const end = parseInt(value);
    if (start === end) return;
    
    const duration = 2000;
    const incrementTime = 20;
    const step = Math.ceil(end / (duration / incrementTime));
    
    const timer = setInterval(() => {
      start += step;
      if (start >= end) {
        start = end;
        clearInterval(timer);
      }
      setCount(start);
    }, incrementTime);
    
    return () => clearInterval(timer);
  }, [value, isVisible]);

  return (
    <div
      id={`counter-${label}`}
      style={{
        textAlign: 'center',
        padding: '40px 20px',
        background: 'linear-gradient(145deg, #ffffff, #fff8f0)',
        borderRadius: '20px',
        boxShadow: '0 15px 35px rgba(255, 107, 53, 0.1)',
        transition: 'all 0.4s ease',
        transform: 'translateY(0)',
        cursor: 'pointer',
        border: '2px solid rgba(255, 107, 53, 0.1)',
        position: 'relative',
        overflow: 'hidden'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-15px)';
        e.currentTarget.style.boxShadow = '0 25px 50px rgba(255, 107, 53, 0.2)';
        e.currentTarget.style.borderColor = 'rgba(255, 107, 53, 0.3)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 15px 35px rgba(255, 107, 53, 0.1)';
        e.currentTarget.style.borderColor = 'rgba(255, 107, 53, 0.1)';
      }}
    >
      {/* Background decoration */}
      <div style={{
        position: 'absolute',
        top: '10px',
        right: '10px',
        width: '50px',
        height: '50px',
        background: `linear-gradient(45deg, ${color}20, transparent)`,
        borderRadius: '50%',
        opacity: 0.3
      }}></div>
      
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '10px'
      }}>
        <div
          style={{
            fontSize: '48px',
            fontWeight: 'bold',
            color: color,
            textShadow: '2px 2px 4px rgba(255, 107, 53, 0.1)',
            background: `linear-gradient(45deg, ${color}, #F7931E)`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          {count.toLocaleString()}
        </div>
        <div
          style={{
            fontSize: '32px',
            fontWeight: 'bold',
            color: color,
            marginLeft: '5px',
            animation: 'bounce 2s ease-in-out infinite',
            textShadow: '1px 1px 2px rgba(255, 107, 53, 0.3)'
          }}
        >
          +
        </div>
      </div>
      <p style={{ 
        color: '#666', 
        fontSize: '16px', 
        fontWeight: '600',
        margin: 0,
        textTransform: 'uppercase',
        letterSpacing: '1px'
      }}>
        {label}
      </p>
    </div>
  );
};

// Enhanced Card Component with 3D hover effects
const Card3D = ({ children, className = "", style = {} }) => (
  <div
    style={{
      background: 'linear-gradient(145deg, #ffffff, #fff8f0)',
      borderRadius: '20px',
      boxShadow: '0 10px 30px rgba(255, 107, 53, 0.1)',
      transition: 'all 0.4s ease',
      transform: 'translateY(0)',
      cursor: 'pointer',
      overflow: 'hidden',
      border: '1px solid rgba(255, 107, 53, 0.1)',
      ...style,
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.transform = 'translateY(-10px)';
      e.currentTarget.style.boxShadow = '0 20px 40px rgba(255, 107, 53, 0.15)';
      e.currentTarget.style.borderColor = 'rgba(255, 107, 53, 0.2)';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = 'translateY(0)';
      e.currentTarget.style.boxShadow = '0 10px 30px rgba(255, 107, 53, 0.1)';
      e.currentTarget.style.borderColor = 'rgba(255, 107, 53, 0.1)';
    }}
    className={className}
  >
    {children}
  </div>
);

export default function Home() {
  const [trendingOffers, setTrendingOffers] = useState([]);
  const [events, setEvents] = useState([]);
  const [partners, setPartners] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [features, setFeatures] = useState([]);
  const [sections, setSections] = useState([]);
  const [counters, setCounters] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [displaySettings, setDisplaySettings] = useState([]);

  const [eventsMode, setEventsMode] = useState("grid");
  const [partnersMode, setPartnersMode] = useState("grid");
  const [customersMode, setCustomersMode] = useState("grid");

  // Real-time subscription setup
  const setupRealtimeSubscription = useCallback(() => {
    const tables = [
      'homepage_sections', 'homepage_events', 'homepage_partners',
      'homepage_customers', 'homepage_features', 'homepage_reviews',
      'homepage_counters', 'display_settings'
    ];

    tables.forEach(table => {
      supabase
        .channel(`${table}_changes`)
        .on('postgres_changes', 
          { event: '*', schema: 'public', table },
          () => {
            console.log(`${table} updated, refreshing data...`);
            fetchData();
          }
        )
        .subscribe();
    });
  }, []);

  const fetchData = async () => {
    try {
      const [
        { data: offers },
        { data: ev },
        { data: pr },
        { data: cu },
        { data: ft },
        { data: sec },
        { data: cnt },
        { data: rev },
        { data: displaySettingsData }
      ] = await Promise.all([
        supabase.from("trending_offers").select("*").order("created_at", { ascending: false }),
        supabase.from("homepage_events").select("*").order("date", { ascending: false }),
        supabase.from("homepage_partners").select("*").order("name", { ascending: true }),
        supabase.from("homepage_customers").select("*").order("name", { ascending: true }),
        supabase.from("homepage_features").select("*").order("display_order", { ascending: true }),
        supabase.from("homepage_sections").select("*").order("display_order", { ascending: true }),
        supabase.from("homepage_counters").select("*").order("display_order", { ascending: true }),
        supabase.from("homepage_reviews").select("*").order("id", { ascending: true }),
        supabase.from("display_settings").select("*")
      ]);

      setTrendingOffers(offers?.filter(o => o.is_active !== false) || []);
      setEvents(ev?.filter(e => e.is_active !== false) || []);
      setPartners(pr?.filter(p => p.is_active !== false) || []);
      setCustomers(cu?.filter(c => c.is_active !== false) || []);
      setFeatures(ft?.filter(f => f.is_active !== false) || []);
      setSections(sec?.filter(s => s.is_active !== false) || []);
      setCounters(cnt?.filter(c => c.is_active !== false) || []);
      setReviews(rev?.filter(r => r.is_active !== false) || []);
      setDisplaySettings(displaySettingsData || []);

      // Set display modes
      if (displaySettingsData) {
        const eventsSettings = displaySettingsData.find(s => s.section_name === "homepage_events");
        const partnersSettings = displaySettingsData.find(s => s.section_name === "homepage_partners");
        const customersSettings = displaySettingsData.find(s => s.section_name === "homepage_customers");

        setEventsMode(eventsSettings?.display_mode || "grid");
        setPartnersMode(partnersSettings?.display_mode || "grid");
        setCustomersMode(customersSettings?.display_mode || "grid");
      }
    } catch (error) {
      console.error("Error fetching homepage data:", error);
    }
  };

  useEffect(() => {
    fetchData();
    setupRealtimeSubscription();
  }, [setupRealtimeSubscription]);

  // Enhanced slider settings
  const sliderSettings = {
    dots: true,
    infinite: true,
    autoplay: true,
    autoplaySpeed: 4000,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    pauseOnHover: true,
    responsive: [
      { breakpoint: 1024, settings: { slidesToShow: 2 } },
      { breakpoint: 768, settings: { slidesToShow: 1 } }
    ]
  };

  const renderSection = (items, title, mode, renderItem) => {
    if (!items || items.length === 0) return null;
    
    return (
      <section style={{ 
        padding: '80px 20px', 
        background: 'linear-gradient(135deg, rgba(255, 107, 53, 0.05) 0%, rgba(247, 147, 30, 0.05) 50%, rgba(255, 152, 0, 0.05) 100%)',
        position: 'relative'
      }}>
        {/* Floating decorative elements */}
        <div style={{
          position: 'absolute',
          top: '10%',
          left: '5%',
          width: '100px',
          height: '100px',
          background: 'linear-gradient(45deg, rgba(255, 107, 53, 0.1), rgba(247, 147, 30, 0.1))',
          borderRadius: '50%',
          animation: 'float 6s ease-in-out infinite'
        }}></div>
        <div style={{
          position: 'absolute',
          bottom: '15%',
          right: '10%',
          width: '80px',
          height: '80px',
          background: 'linear-gradient(45deg, rgba(247, 147, 30, 0.1), rgba(255, 152, 0, 0.1))',
          borderRadius: '50%',
          animation: 'float 8s ease-in-out infinite reverse'
        }}></div>

        <div style={{ maxWidth: '1200px', margin: '0 auto', position: 'relative' }}>
          <h2 style={{ 
            textAlign: 'center', 
            fontSize: '40px', 
            fontWeight: 'bold', 
            marginBottom: '50px',
            background: 'linear-gradient(45deg, #FF6B35, #F7931E)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            textShadow: '0 4px 8px rgba(255, 107, 53, 0.1)',
            position: 'relative'
          }}>
            {title}
            <div style={{
              position: 'absolute',
              bottom: '-10px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '100px',
              height: '4px',
              background: 'linear-gradient(45deg, #FF6B35, #F7931E)',
              borderRadius: '2px'
            }}></div>
          </h2>
          {mode === "slider" ? (
            <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
              <Slider {...sliderSettings}>{items.map(renderItem)}</Slider>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '40px'
            }}>
              {items.map(renderItem)}
            </div>
          )}
        </div>
      </section>
    );
  };

  const heroSection = sections.find(s => s.section_name === "hero_section");

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: `
        radial-gradient(circle at 20% 50%, rgba(255, 107, 53, 0.1) 0%, transparent 50%),
        radial-gradient(circle at 80% 20%, rgba(247, 147, 30, 0.1) 0%, transparent 50%),
        radial-gradient(circle at 40% 80%, rgba(255, 152, 0, 0.1) 0%, transparent 50%),
        linear-gradient(135deg, #f8faff 0%, #fff3e0 25%, #ffe0b2 50%, #ffcc80 75%, #ffb74d 100%)
      `
    }}>

      {/* Enhanced Hero Section with Solar Animation */}
      <section
        style={{
          minHeight: '700px',
          background: heroSection?.background_color || 
            `linear-gradient(135deg, 
              rgba(255, 107, 53, 0.95) 0%, 
              rgba(247, 147, 30, 0.95) 30%, 
              rgba(255, 152, 0, 0.95) 60%, 
              rgba(255, 193, 7, 0.95) 100%),
            url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse"><path d="M 10 0 L 0 0 0 10" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="0.5"/></pattern></defs><rect width="100" height="100" fill="url(%23grid)"/></svg>')`,
          color: heroSection?.text_color || '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '50px 20px',
          margin: '20px',
          borderRadius: '30px',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: `
            0 30px 60px rgba(255, 107, 53, 0.3),
            inset 0 1px 0 rgba(255, 255, 255, 0.2),
            inset 0 -1px 0 rgba(0, 0, 0, 0.1)
          `,
          border: '2px solid rgba(255,255,255,0.2)'
        }}
      >
        {/* Animated background particles */}
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              width: `${Math.random() * 8 + 4}px`,
              height: `${Math.random() * 8 + 4}px`,
              background: 'rgba(255,255,255,0.3)',
              borderRadius: '50%',
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animation: `floatingParticles ${Math.random() * 10 + 10}s linear infinite ${Math.random() * 5}s`
            }}
          />
        ))}

        {/* Content Container */}
        <div style={{ 
          position: 'relative', 
          zIndex: 2, 
          maxWidth: '1100px',
          display: 'flex',
          alignItems: 'center',
          gap: '60px',
          flexWrap: 'wrap'
        }}>
          
          {/* Text Content */}
          <div style={{ flex: '1 1 500px', textAlign: 'left', minWidth: '400px' }}>
            <h1 style={{ 
              fontSize: '64px', 
              fontWeight: 'bold', 
              marginBottom: '25px',
              textShadow: '3px 3px 6px rgba(0,0,0,0.3)',
              lineHeight: '1.1',
              background: 'linear-gradient(45deg, #ffffff, #fff9c4)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
              {heroSection?.title || "Power Your Future with Solar Energy"}
            </h1>
            <p style={{ 
              fontSize: '28px', 
              marginBottom: '20px', 
              opacity: 0.95,
              fontWeight: '300',
              textShadow: '1px 1px 2px rgba(0,0,0,0.2)'
            }}>
              {heroSection?.subtitle || "Clean • Efficient • Sustainable"}
            </p>
            <p style={{ 
              fontSize: '20px', 
              marginBottom: '40px', 
              opacity: 0.9,
              lineHeight: '1.7',
              maxWidth: '600px'
            }}>
              {heroSection?.content_text || "Transform your home and business with our premium solar energy systems. Join thousands of satisfied customers who have made the switch to renewable energy."}
            </p>
            
            <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
              <button
                onClick={() => window.location.href = '/quotation'}
                style={{
                  background: 'linear-gradient(45deg, #ffffff, #f0f0f0)',
                  color: '#FF6600',
                  border: 'none',
                  padding: '20px 45px',
                  borderRadius: '50px',
                  fontSize: '20px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  boxShadow: '0 15px 35px rgba(0,0,0,0.2)',
                  transition: 'all 0.4s ease',
                  transform: 'translateY(0) scale(1)',
                  textTransform: 'uppercase',
                  letterSpacing: '1px'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-5px) scale(1.05)';
                  e.target.style.boxShadow = '0 20px 40px rgba(0,0,0,0.3)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0) scale(1)';
                  e.target.style.boxShadow = '0 15px 35px rgba(0,0,0,0.2)';
                }}
              >
                {heroSection?.button_text || "Get Started"} 🚀
              </button>
              
              <button
                onClick={() => window.open('https://wa.me/923075506695?text=Hi! I would like to learn more about your solar energy solutions. Can you provide more information?', '_blank')}
                style={{
                  background: 'transparent',
                  color: '#ffffff',
                  border: '2px solid rgba(255,255,255,0.8)',
                  padding: '18px 40px',
                  borderRadius: '50px',
                  fontSize: '18px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  transition: 'all 0.4s ease',
                  textTransform: 'uppercase',
                  letterSpacing: '1px'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = 'rgba(255,255,255,0.2)';
                  e.target.style.transform = 'scale(1.05)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'transparent';
                  e.target.style.transform = 'scale(1)';
                }}
              >
                Learn More 📚
              </button>
            </div>
          </div>

          {/* Solar Energy Flow Animation */}
          <div style={{ flex: '1 1 400px', minWidth: '400px' }}>
            <SolarEnergyFlow />
          </div>
        </div>
      </section>

      {/* Enhanced Counters Section */}
      <section style={{ 
        padding: '80px 20px', 
        background: `
          linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 248, 240, 0.95) 100%),
          url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 60"><defs><pattern id="dots" width="20" height="20" patternUnits="userSpaceOnUse"><circle cx="10" cy="10" r="1" fill="rgba(255,107,53,0.1)"/></pattern></defs><rect width="60" height="60" fill="url(%23dots)"/></svg>')
        `,
        position: 'relative'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', position: 'relative', zIndex: 2 }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '40px'
          }}>
            {counters.map(counter => (
              <Counter
                key={counter.id}
                value={counter.value}
                label={counter.label}
                color={counter.color}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced Customer Reviews */}
      <section style={{ 
        padding: '80px 20px', 
        background: `
          linear-gradient(135deg, rgba(255, 107, 53, 0.08) 0%, rgba(247, 147, 30, 0.08) 50%, rgba(255, 152, 0, 0.08) 100%),
          url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="waves" width="100" height="20" patternUnits="userSpaceOnUse"><path d="M0 10 Q25 0 50 10 T100 10 V20 H0 Z" fill="rgba(255,107,53,0.05)"/></pattern></defs><rect width="100" height="100" fill="url(%23waves)"/></svg>')
        `,
        position: 'relative'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', position: 'relative', zIndex: 2 }}>
          <h2 style={{ 
            textAlign: 'center', 
            fontSize: '40px', 
            fontWeight: 'bold', 
            marginBottom: '50px',
            background: 'linear-gradient(45deg, #FF6B35, #F7931E)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            position: 'relative'
          }}>
            What Our Customers Say
            <div style={{
              position: 'absolute',
              bottom: '-10px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '120px',
              height: '4px',
              background: 'linear-gradient(45deg, #FF6B35, #F7931E)',
              borderRadius: '2px'
            }}></div>
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
            gap: '40px'
          }}>
            {reviews.map(review => (
              <Card3D key={review.id}>
                <div style={{ padding: '30px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
                    {review.avatar_url && (
                      <img 
                        src={review.avatar_url} 
                        alt={review.name}
                        style={{
                          width: '60px',
                          height: '60px',
                          borderRadius: '50%',
                          marginRight: '15px',
                          objectFit: 'cover',
                          border: '3px solid #FF6B35'
                        }}
                      />
                    )}
                    <div>
                      <h4 style={{ 
                        margin: 0, 
                        color: '#FF6B35', 
                        fontSize: '20px',
                        fontWeight: 'bold'
                      }}>
                        {review.name}
                      </h4>
                      {review.designation && (
                        <p style={{ 
                          margin: 0, 
                          color: '#666', 
                          fontSize: '14px',
                          fontWeight: '500'
                        }}>
                          {review.designation}
                        </p>
                      )}
                    </div>
                  </div>
                  <p style={{ 
                    color: '#333', 
                    lineHeight: '1.7', 
                    marginBottom: '20px',
                    fontSize: '16px',
                    fontStyle: 'italic'
                  }}>
                    "{review.review}"
                  </p>
                  <div style={{ 
                    display: 'flex', 
                    color: '#FFD700', 
                    fontSize: '20px',
                    filter: 'drop-shadow(1px 1px 1px rgba(0,0,0,0.1))'
                  }}>
                    {"★".repeat(review.stars)}{"☆".repeat(5 - review.stars)}
                  </div>
                </div>
              </Card3D>
            ))}
          </div>
        </div>
      </section>

      {/* Dynamic Sections */}
      {renderSection(events, "Latest Events", eventsMode, event => (
        <Card3D key={event.id}>
          {event.image_url && (
            <div style={{ position: 'relative', overflow: 'hidden' }}>
              <img 
                src={event.image_url} 
                alt={event.title} 
                style={{
                  width: '100%',
                  height: '220px',
                  objectFit: 'cover',
                  transition: 'transform 0.4s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'scale(1.1)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'scale(1)';
                }}
              />
              <div style={{
                position: 'absolute',
                top: '15px',
                right: '15px',
                background: 'linear-gradient(45deg, #FF6B35, #F7931E)',
                color: 'white',
                padding: '8px 15px',
                borderRadius: '20px',
                fontSize: '12px',
                fontWeight: 'bold',
                textTransform: 'uppercase',
                letterSpacing: '1px'
              }}>
                Event
              </div>
              <div style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                background: 'linear-gradient(transparent, rgba(0,0,0,0.7))',
                height: '80px'
              }}></div>
            </div>
          )}
          <div style={{ padding: '30px' }}>
            <h3 style={{ 
              color: '#FF6B35', 
              fontSize: '22px', 
              fontWeight: 'bold',
              marginBottom: '15px',
              lineHeight: '1.3'
            }}>
              {event.title}
            </h3>
            <p style={{ 
              color: '#666', 
              lineHeight: '1.6',
              marginBottom: '20px',
              fontSize: '15px'
            }}>
              {event.description}
            </p>
            {event.date && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                color: '#999',
                fontSize: '14px',
                background: '#fff8f0',
                padding: '10px 15px',
                borderRadius: '10px',
                border: '1px solid rgba(255, 107, 53, 0.1)'
              }}>
                <span style={{ marginRight: '8px', fontSize: '16px' }}>📅</span>
                {new Date(event.date).toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </div>
            )}
          </div>
        </Card3D>
      ))}

      {renderSection(partners, "Our Partners", partnersMode, partner => (
        <Card3D key={partner.id}>
          <div style={{ padding: '30px', textAlign: 'center', minHeight: '200px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div style={{
              height: '100px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '20px',
              background: 'linear-gradient(135deg, #fff8f0, #ffffff)',
              borderRadius: '15px',
              padding: '20px'
            }}>
              <img 
                src={partner.logo_url} 
                alt={partner.name} 
                style={{
                  maxHeight: '80px',
                  maxWidth: '100%',
                  objectFit: 'contain',
                  transition: 'all 0.3s ease',
                  filter: 'grayscale(20%)'
                }}
                onMouseEnter={(e) => {
                  e.target.style.filter = 'grayscale(0%) brightness(1.1)';
                  e.target.style.transform = 'scale(1.05)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.filter = 'grayscale(20%)';
                  e.target.style.transform = 'scale(1)';
                }}
              />
            </div>
            <h4 style={{ 
              color: '#333', 
              fontSize: '18px',
              fontWeight: 'bold',
              margin: '0 0 10px 0'
            }}>
              {partner.name}
            </h4>
            {partner.description && (
              <p style={{ 
                color: '#666', 
                fontSize: '14px', 
                margin: 0,
                lineHeight: '1.5'
              }}>
                {partner.description}
              </p>
            )}
          </div>
        </Card3D>
      ))}

      {renderSection(customers, "Our Platinum Customers", customersMode, customer => (
        <Card3D key={customer.id}>
          <div style={{ padding: '30px', textAlign: 'center', minHeight: '200px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div style={{
              height: '100px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '20px',
              background: 'linear-gradient(135deg, #fff7e6, #ffffff)',
              borderRadius: '15px',
              padding: '20px',
              border: '2px solid #F7931E'
            }}>
              <img 
                src={customer.logo_url} 
                alt={customer.name} 
                style={{
                  maxHeight: '80px',
                  maxWidth: '100%',
                  objectFit: 'contain',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.filter = 'brightness(1.1)';
                  e.target.style.transform = 'scale(1.05)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.filter = 'brightness(1)';
                  e.target.style.transform = 'scale(1)';
                }}
              />
            </div>
            <h4 style={{ 
              color: '#333', 
              fontSize: '18px',
              fontWeight: 'bold',
              marginBottom: '10px'
            }}>
              {customer.name}
            </h4>
            {customer.testimonial && (
              <p style={{ 
                color: '#666', 
                fontSize: '14px', 
                fontStyle: 'italic',
                margin: 0,
                lineHeight: '1.5'
              }}>
                "{customer.testimonial}"
              </p>
            )}
          </div>
        </Card3D>
      ))}

      {/* Enhanced Features Section with parallax effect */}
      {features.length > 0 && (
        <section style={{ 
          padding: '100px 20px', 
          background: `
            linear-gradient(135deg, rgba(255, 107, 53, 0.06) 0%, rgba(247, 147, 30, 0.06) 100%),
            url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80"><defs><pattern id="hexagon" width="40" height="35" patternUnits="userSpaceOnUse"><polygon points="20,5 35,15 35,25 20,35 5,25 5,15" fill="none" stroke="rgba(255,107,53,0.1)" stroke-width="1"/></pattern></defs><rect width="80" height="80" fill="url(%23hexagon)"/></svg>')
          `,
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Animated background elements */}
          <div style={{
            position: 'absolute',
            top: '0',
            left: '0',
            right: '0',
            bottom: '0',
            background: 'radial-gradient(circle at 25% 25%, rgba(255, 107, 53, 0.1) 0%, transparent 50%)',
            animation: 'float 20s ease-in-out infinite'
          }}></div>
          <div style={{
            position: 'absolute',
            top: '0',
            left: '0',
            right: '0',
            bottom: '0',
            background: 'radial-gradient(circle at 75% 75%, rgba(247, 147, 30, 0.1) 0%, transparent 50%)',
            animation: 'float 25s ease-in-out infinite reverse'
          }}></div>

          <div style={{ maxWidth: '1200px', margin: '0 auto', position: 'relative', zIndex: 2 }}>
            <div style={{ textAlign: 'center', marginBottom: '80px' }}>
              <h2 style={{ 
                fontSize: '48px', 
                fontWeight: 'bold', 
                marginBottom: '20px',
                background: 'linear-gradient(45deg, #FF6B35, #F7931E)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                position: 'relative'
              }}>
                Why Choose Syed Solar Energy?
                <div style={{
                  position: 'absolute',
                  bottom: '-15px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: '150px',
                  height: '5px',
                  background: 'linear-gradient(45deg, #FF6B35, #F7931E)',
                  borderRadius: '3px'
                }}></div>
              </h2>
              <p style={{
                fontSize: '20px',
                color: '#666',
                maxWidth: '600px',
                margin: '0 auto',
                lineHeight: '1.6'
              }}>
                Experience the difference with Pakistan's leading solar energy provider
              </p>
            </div>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '50px'
            }}>
              {features.map((feature, index) => (
                <Card3D key={feature.id} style={{
                  animation: `fadeInUp 0.8s ease-out ${index * 0.2}s both`
                }}>
                  <div style={{ 
                    padding: '50px 30px', 
                    textAlign: 'center', 
                    minHeight: '320px', 
                    display: 'flex', 
                    flexDirection: 'column', 
                    justifyContent: 'center',
                    position: 'relative'
                  }}>
                    {/* Background decoration */}
                    <div style={{
                      position: 'absolute',
                      top: '20px',
                      right: '20px',
                      width: '60px',
                      height: '60px',
                      background: 'linear-gradient(45deg, rgba(255, 107, 53, 0.1), rgba(247, 147, 30, 0.1))',
                      borderRadius: '50%',
                      animation: 'pulse 3s ease-in-out infinite'
                    }}></div>

                    {feature.icon_url && (
                      <div style={{ 
                        marginBottom: '30px',
                        background: 'linear-gradient(135deg, #fff7e6, #f0f8ff)',
                        borderRadius: '50%',
                        width: '100px',
                        height: '100px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 30px',
                        border: '4px solid #FF6B35',
                        boxShadow: '0 10px 30px rgba(255, 107, 53, 0.2)',
                        position: 'relative',
                        overflow: 'hidden'
                      }}>
                        <div style={{
                          position: 'absolute',
                          top: '0',
                          left: '0',
                          right: '0',
                          bottom: '0',
                          background: 'linear-gradient(45deg, transparent, rgba(255,255,255,0.3), transparent)',
                          transform: 'translateX(-100%)',
                          animation: 'shimmer 3s ease-in-out infinite'
                        }}></div>
                        <img 
                          src={feature.icon_url} 
                          alt={feature.title}
                          style={{
                            width: '60px',
                            height: '60px',
                            objectFit: 'contain',
                            transition: 'all 0.3s ease',
                            position: 'relative',
                            zIndex: 1
                          }}
                          onMouseEnter={(e) => {
                            e.target.style.filter = 'brightness(1.2)';
                            e.target.style.transform = 'scale(1.1) rotate(5deg)';
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.filter = 'brightness(1)';
                            e.target.style.transform = 'scale(1) rotate(0deg)';
                          }}
                        />
                      </div>
                    )}
                    <h4 style={{ 
                      color: '#FF6B35', 
                      fontSize: '26px',
                      fontWeight: 'bold',
                      marginBottom: '20px',
                      lineHeight: '1.3'
                    }}>
                      {feature.title}
                    </h4>
                    <p style={{ 
                      color: '#666', 
                      lineHeight: '1.8',
                      fontSize: '16px',
                      margin: 0
                    }}>
                      {feature.description}
                    </p>
                    
                    {/* Achievement badge */}
                    <div style={{
                      position: 'absolute',
                      bottom: '20px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      background: 'linear-gradient(45deg, #FF6B35, #F7931E)',
                      color: 'white',
                      padding: '8px 16px',
                      borderRadius: '20px',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      textTransform: 'uppercase',
                      letterSpacing: '1px'
                    }}>
                      ✓ Certified
                    </div>
                  </div>
                </Card3D>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Use imported Footer */}
      <Footer />

      {/* Popups */}
      <WhatsAppPopup />
      <SpecialOfferPopup />

      {/* Enhanced animations and styles */}
      <style>
        {`
          @keyframes gradientShift {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
          
          @keyframes float {
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            33% { transform: translateY(-20px) rotate(5deg); }
            66% { transform: translateY(-10px) rotate(-3deg); }
          }
          
          @keyframes bounce {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-25px); }
          }
          
          @keyframes pulse {
            0%, 100% { transform: scale(1); opacity: 0.8; }
            50% { transform: scale(1.1); opacity: 1; }
          }

          /* Solar Animation Keyframes */
          @keyframes sunPulse {
            0%, 100% { transform: scale(1); box-shadow: 0 0 30px rgba(255, 215, 0, 0.6); }
            50% { transform: scale(1.1); box-shadow: 0 0 50px rgba(255, 215, 0, 0.8); }
          }

          @keyframes sunRays {
            0%, 100% { opacity: 0.5; transform: translate(-50%, -100%) rotate(var(--rotation)) scale(1); }
            50% { opacity: 1; transform: translate(-50%, -100%) rotate(var(--rotation)) scale(1.2); }
          }

          @keyframes energyRays {
            0% { opacity: 0; height: 50px; }
            50% { opacity: 1; height: 100px; }
            100% { opacity: 0; height: 150px; }
          }

          @keyframes panelGlow {
            0%, 100% { box-shadow: 0 0 20px rgba(26, 35, 126, 0.3); }
            50% { box-shadow: 0 0 30px rgba(26, 35, 126, 0.6); }
          }

          @keyframes panelCell {
            0%, 100% { background: linear-gradient(145deg, #283593, #1a237e); }
            50% { background: linear-gradient(145deg, #3949ab, #283593); }
          }

          @keyframes electricFlow {
            0% { stroke-dashoffset: 100; }
            100% { stroke-dashoffset: 0; }
          }

          @keyframes electricSpark {
            0%, 100% { opacity: 0; r: 1; }
            50% { opacity: 1; r: 4; }
          }

          @keyframes inverterHum {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-2px); }
          }

          @keyframes statusLight {
            0% { background: linear-gradient(90deg, #4caf50, #8bc34a); }
            100% { background: linear-gradient(90deg, #8bc34a, #4caf50); }
          }

          @keyframes bulbGlow {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.05); }
          }

          @keyframes lightFlicker {
            0%, 100% { 
              background: radial-gradient(circle, #fff9c4, #fff176);
              box-shadow: 0 0 20px rgba(255, 249, 196, 0.8);
            }
            50% { 
              background: radial-gradient(circle, #ffffff, #fff9c4);
              box-shadow: 0 0 30px rgba(255, 249, 196, 1);
            }
          }

          @keyframes lightRays {
            0%, 100% { opacity: 0.4; height: 15px; }
            50% { opacity: 0.8; height: 25px; }
          }

          @keyframes flowParticles {
            0% {
              left: 20%;
              top: 55%;
              opacity: 0;
            }
            25% {
              left: 40%;
              top: 45%;
              opacity: 1;
            }
            50% {
              left: 65%;
              top: 60%;
              opacity: 1;
            }
            75% {
              left: 85%;
              top: 40%;
              opacity: 1;
            }
            100% {
              left: 90%;
              top: 30%;
              opacity: 0;
            }
          }

          @keyframes floatingParticles {
            0% { transform: translateY(0px) translateX(0px) rotate(0deg); }
            33% { transform: translateY(-30px) translateX(20px) rotate(120deg); }
            66% { transform: translateY(-10px) translateX(-15px) rotate(240deg); }
            100% { transform: translateY(0px) translateX(0px) rotate(360deg); }
          }
          
          /* Smooth scrolling */
          html {
            scroll-behavior: smooth;
          }
          
          /* Custom scrollbar matching theme */
          ::-webkit-scrollbar {
            width: 12px;
          }
          
          ::-webkit-scrollbar-track {
            background: linear-gradient(45deg, #fff8f0, #f0f8ff);
            border-radius: 6px;
          }
          
          ::-webkit-scrollbar-thumb {
            background: linear-gradient(45deg, #FF6B35, #F7931E);
            border-radius: 6px;
            border: 2px solid #fff8f0;
          }
          
          ::-webkit-scrollbar-thumb:hover {
            background: linear-gradient(45deg, #F7931E, #FF6B35);
            box-shadow: 0 0 10px rgba(255, 107, 53, 0.3);
          }

          /* Responsive animations */
          @media (max-width: 768px) {
            @keyframes sunPulse {
              0%, 100% { transform: scale(0.8); }
              50% { transform: scale(0.9); }
            }
            
            @keyframes floatingParticles {
              0% { transform: translateY(0px) translateX(0px) rotate(0deg) scale(0.5); }
              50% { transform: translateY(-20px) translateX(10px) rotate(180deg) scale(0.7); }
              100% { transform: translateY(0px) translateX(0px) rotate(360deg) scale(0.5); }
            }
          }

          /* Enhanced popup animations */
          @keyframes fadeIn {
            0% { opacity: 0; }
            100% { opacity: 1; }
          }

          @keyframes popupEntrance {
            0% {
              opacity: 0;
              transform: scale(0.3) translateY(-50px) rotate(-10deg);
              filter: blur(10px);
            }
            50% {
              opacity: 0.8;
              transform: scale(1.05) translateY(10px) rotate(2deg);
              filter: blur(2px);
            }
            100% {
              opacity: 1;
              transform: scale(1) translateY(0) rotate(0deg);
              filter: blur(0);
            }
          }
          .card-hover {
            transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          }

          .card-hover:hover {
            transform: translateY(-15px) scale(1.02);
            box-shadow: 0 25px 50px rgba(255, 107, 53, 0.2);
          }

          /* Glowing text effect */
          .glow-text {
            text-shadow: 
              0 0 5px rgba(255, 255, 255, 0.8),
              0 0 10px rgba(255, 255, 255, 0.6),
              0 0 20px rgba(255, 107, 53, 0.4),
              0 0 40px rgba(255, 107, 53, 0.2);
          }

          /* Animated gradient backgrounds */
          .animated-gradient {
            background: linear-gradient(-45deg, #FF6B35, #F7931E, #FF9800, #FFB74D);
            background-size: 400% 400%;
            animation: gradientShift 15s ease infinite;
          }

          /* Pulse effect for important elements */
          .pulse-glow {
            animation: pulse 3s ease-in-out infinite;
            box-shadow: 0 0 20px rgba(255, 107, 53, 0.3);
          }

          /* Loading shimmer effect */
          @keyframes shimmer {
            0% { background-position: -1000px 0; }
            100% { background-position: 1000px 0; }
          }

          .shimmer {
            background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
            background-size: 1000px 100%;
            animation: shimmer 2s infinite;
          }

          /* Fade in animations */
          @keyframes shimmer {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(100%); }
          }

          @keyframes fadeInUp {
            0% {
              opacity: 0;
              transform: translateY(50px);
            }
            100% {
              opacity: 1;
              transform: translateY(0);
            }
          }

          .fade-in-up {
            animation: fadeInUp 0.8s ease-out;
          }

          /* Scale in animation */
          @keyframes scaleIn {
            0% {
              opacity: 0;
              transform: scale(0.8);
            }
            100% {
              opacity: 1;
              transform: scale(1);
            }
          }

          .scale-in {
            animation: scaleIn 0.6s ease-out;
          }

          /* Rotation animation for icons */
          @keyframes rotateIn {
            0% {
              opacity: 0;
              transform: rotate(-180deg) scale(0.5);
            }
            100% {
              opacity: 1;
              transform: rotate(0deg) scale(1);
            }
          }

          .rotate-in {
            animation: rotateIn 0.8s ease-out;
          }

          /* Text typing effect */
          @keyframes typing {
            from { width: 0; }
            to { width: 100%; }
          }

          .typing-effect {
            overflow: hidden;
            border-right: 2px solid #FF6B35;
            white-space: nowrap;
            animation: typing 3s steps(40, end), blink-caret 0.75s step-end infinite;
          }

          @keyframes blink-caret {
            from, to { border-color: transparent; }
            50% { border-color: #FF6B35; }
          }

          /* Glitch effect for special elements */
          @keyframes glitch {
            0%, 100% { transform: translate(0); }
            20% { transform: translate(-2px, 2px); }
            40% { transform: translate(-2px, -2px); }
            60% { transform: translate(2px, 2px); }
            80% { transform: translate(2px, -2px); }
          }

          .glitch-effect {
            animation: glitch 0.3s ease-in-out infinite;
          }

          /* Breathing animation */
          @keyframes breathe {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.05); }
          }

          .breathe {
            animation: breathe 4s ease-in-out infinite;
          }

          /* Rainbow text effect */
          @keyframes rainbow {
            0% { color: #FF6B35; }
            16.66% { color: #F7931E; }
            33.33% { color: #FF9800; }
            50% { color: #FFB74D; }
            66.66% { color: #FF9800; }
            83.33% { color: #F7931E; }
            100% { color: #FF6B35; }
          }

          .rainbow-text {
            animation: rainbow 3s ease-in-out infinite;
          }

          /* Particle system */
          .particle {
            position: absolute;
            background: radial-gradient(circle, rgba(255, 107, 53, 0.8), transparent);
            border-radius: 50%;
            pointer-events: none;
            animation: particleFloat 8s linear infinite;
          }

          @keyframes particleFloat {
            0% {
              transform: translateY(100vh) rotate(0deg);
              opacity: 0;
            }
            10% {
              opacity: 1;
            }
            90% {
              opacity: 1;
            }
            100% {
              transform: translateY(-100px) rotate(360deg);
              opacity: 0;
            }
          }

          /* Energy waves */
          @keyframes energyWave {
            0% {
              transform: scaleX(0);
              opacity: 1;
            }
            100% {
              transform: scaleX(1);
              opacity: 0;
            }
          }

          .energy-wave {
            animation: energyWave 2s ease-out infinite;
          }
        `}
      </style>
    </div>
  );
}