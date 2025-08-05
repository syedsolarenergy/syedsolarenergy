import React, { useEffect, useState, useCallback } from "react";
import Slider from "react-slick";
import { supabase } from "../supabaseClient";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

// Enhanced CSS Variables for Universal Screen Support
const cssVariables = `
  :root {
    --primary-orange: #FF6B35;
    --secondary-orange: #F7931E;
    --font-size-base: clamp(14px, 2.5vw, 18px);
    --padding-base: clamp(12px, 4vw, 40px);
    --section-padding: clamp(40px, 8vw, 100px);
    --card-padding: clamp(16px, 4vw, 40px);
    --heading-1: clamp(2rem, 6vw, 4rem);
    --heading-2: clamp(1.5rem, 4.5vw, 2.8rem);
    --heading-3: clamp(1.25rem, 3.5vw, 2rem);
    --text-base: clamp(0.875rem, 2.2vw, 1.125rem);
    --text-small: clamp(0.75rem, 2vw, 1rem);
    --stat-number: clamp(1.5rem, 6vw, 3rem);
    --border-radius: clamp(12px, 2.5vw, 20px);
    --container-max: min(1400px, 95vw);
    --grid-gap: clamp(16px, 4vw, 40px);
    --card-min-width: min(280px, 90vw);
    --hero-height: clamp(500px, 70vh, 800px);
  }

  /* Mobile overflow prevention */
  html, body {
    overflow-x: hidden;
    max-width: 100%;
  }

  /* Universal Container System */
  .universal-container {
    width: 100%;
    max-width: var(--container-max);
    margin: 0 auto;
    padding: 0 var(--padding-base);
  }

  /* Enhanced Grid Systems */
  .grid-auto {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(var(--card-min-width), 1fr));
    gap: var(--grid-gap);
    width: 100%;
  }

  .grid-stats {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(min(200px, 100%), 1fr));
    gap: var(--grid-gap);
    width: 100%;
  }

  .grid-reviews {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(min(320px, 100%), 1fr));
    gap: var(--grid-gap);
    width: 100%;
  }

  .grid-features {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(min(300px, 100%), 1fr));
    gap: clamp(20px, 5vw, 50px);
    width: 100%;
  }

  /* Hero Layout */
  .hero-content {
    display: flex;
    align-items: center;
    gap: clamp(30px, 8vw, 80px);
    flex-wrap: wrap-reverse;
    min-height: var(--hero-height);
  }

  .hero-text {
    flex: 1 1 min(400px, 100%);
    min-width: min(350px, 100%);
  }

  .hero-image {
    flex: 1 1 min(350px, 100%);
    min-width: min(300px, 100%);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .hero-image img {
    width: 100%;
    max-width: min(550px, 100%);
    height: auto;
    border-radius: var(--border-radius);
    box-shadow: 0 20px 60px rgba(0,0,0,0.25);
    object-fit: cover;
  }

  /* Mobile Optimizations */
  @media (max-width: 768px) {
    :root {
      --card-min-width: 100%;
      --grid-gap: clamp(12px, 4vw, 20px);
      --hero-height: auto;
    }

    .hero-content {
      flex-direction: column;
      justify-content: center;
      align-items: center;
      text-align: center;
      gap: clamp(20px, 6vw, 40px);
    }

    .hero-image,
    .hero-text {
      min-width: auto;
      width: 100%;
      margin: 0 auto;
    }

    .hero-image {
      order: -1;
    }
  }

  @media (min-width: 641px) and (max-width: 1024px) {
    .grid-features {
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    }
  }

  /* Ultra-wide screen support */
  @media (min-width: 1920px) {
    :root {
      --container-max: 1600px;
    }
  }
`;

// Enhanced WhatsApp Popup Component
const WhatsAppPopup = () => {
  const [isVisible, setIsVisible] = useState(true);
  
  if (!isVisible) return null;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 'clamp(15px, 3vw, 20px)',
        right: 'clamp(15px, 3vw, 20px)',
        background: 'linear-gradient(135deg, #25D366, #128C7E)',
        borderRadius: 'clamp(20px, 4vw, 25px)',
        padding: 'clamp(12px, 2.5vw, 15px) clamp(15px, 3vw, 20px)',
        boxShadow: '0 8px 30px rgba(37, 211, 102, 0.4)',
        zIndex: 1000,
        cursor: 'pointer',
        transform: 'translateY(0)',
        transition: 'all 0.3s ease',
        animation: 'bounce 2s infinite',
        maxWidth: 'clamp(250px, 40vw, 280px)',
        minWidth: 'min(220px, 90vw)'
      }}
      onClick={() => window.open('https://wa.me/923044678929?text=Hello! I need help with solar energy solutions.', '_blank')}
      onMouseEnter={(e) => {
        if (window.innerWidth > 768) {
          e.currentTarget.style.transform = 'translateY(-5px)';
          e.currentTarget.style.boxShadow = '0 12px 35px rgba(37, 211, 102, 0.6)';
        }
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
          top: 'clamp(-8px, -1.5vw, -5px)',
          right: 'clamp(-8px, -1.5vw, -5px)',
          background: 'rgba(255,255,255,0.9)',
          border: 'none',
          borderRadius: '50%',
          width: 'clamp(18px, 3.5vw, 20px)',
          height: 'clamp(18px, 3.5vw, 20px)',
          fontSize: 'clamp(10px, 2vw, 12px)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#666'
        }}
      >
        ×
      </button>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'clamp(8px, 2vw, 12px)' }}>
        <div style={{
          fontSize: 'clamp(20px, 4vw, 24px)',
          animation: 'pulse 1.5s infinite'
        }}>
          📞
        </div>
        <div>
          <div style={{
            color: 'white',
            fontWeight: 'bold',
            fontSize: 'clamp(12px, 2.5vw, 14px)',
            marginBottom: '2px'
          }}>
            Need Help?
          </div>
          <div style={{
            color: 'rgba(255,255,255,0.9)',
            fontSize: 'clamp(10px, 2vw, 12px)'
          }}>
            Contact us on WhatsApp
          </div>
        </div>
      </div>
    </div>
  );
};

// Enhanced Counter Component
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
      { threshold: 0.3 }
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
        padding: 'var(--card-padding)',
        background: 'linear-gradient(145deg, #ffffff, #fff8f0)',
        borderRadius: 'var(--border-radius)',
        boxShadow: '0 12px 32px rgba(255, 107, 53, 0.12)',
        transition: 'all 0.4s ease',
        transform: 'translateY(0)',
        cursor: 'pointer',
        border: '2px solid rgba(255, 107, 53, 0.1)',
        position: 'relative',
        overflow: 'hidden',
        minHeight: 'clamp(140px, 20vw, 180px)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center'
      }}
      onMouseEnter={(e) => {
        if (window.innerWidth > 768) {
          e.currentTarget.style.transform = 'translateY(-12px)';
          e.currentTarget.style.boxShadow = '0 20px 48px rgba(255, 107, 53, 0.2)';
          e.currentTarget.style.borderColor = 'rgba(255, 107, 53, 0.3)';
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 12px 32px rgba(255, 107, 53, 0.12)';
        e.currentTarget.style.borderColor = 'rgba(255, 107, 53, 0.1)';
      }}
    >
      {/* Background decoration */}
      <div style={{
        position: 'absolute',
        top: 'clamp(8px, 2vw, 10px)',
        right: 'clamp(8px, 2vw, 10px)',
        width: 'clamp(40px, 8vw, 50px)',
        height: 'clamp(40px, 8vw, 50px)',
        background: `linear-gradient(45deg, ${color}20, transparent)`,
        borderRadius: '50%',
        opacity: 0.3
      }}></div>
      
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 'clamp(8px, 2vw, 10px)'
      }}>
        <div
          style={{
            fontSize: 'var(--stat-number)',
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
            fontSize: 'clamp(24px, 5vw, 32px)',
            fontWeight: 'bold',
            color: color,
            marginLeft: 'clamp(4px, 1vw, 5px)',
            animation: 'bounce 2s ease-in-out infinite',
            textShadow: '1px 1px 2px rgba(255, 107, 53, 0.3)'
          }}
        >
          +
        </div>
      </div>
      <p style={{ 
        color: '#666', 
        fontSize: 'var(--text-base)', 
        fontWeight: '600',
        margin: 0,
        textTransform: 'uppercase',
        letterSpacing: '0.5px'
      }}>
        {label}
      </p>
    </div>
  );
};

// Enhanced Card Component
const Card3D = ({ children, className = "", style = {} }) => (
  <div
    style={{
      background: 'linear-gradient(145deg, #ffffff, #fff8f0)',
      borderRadius: 'var(--border-radius)',
      boxShadow: '0 8px 24px rgba(255, 107, 53, 0.12)',
      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
      transform: 'translateY(0)',
      cursor: 'pointer',
      overflow: 'hidden',
      border: '1px solid rgba(255, 107, 53, 0.1)',
      ...style,
    }}
    onMouseEnter={(e) => {
      if (window.innerWidth > 768) {
        e.currentTarget.style.transform = 'translateY(-8px)';
        e.currentTarget.style.boxShadow = '0 16px 40px rgba(255, 107, 53, 0.18)';
        e.currentTarget.style.borderColor = 'rgba(255, 107, 53, 0.25)';
      }
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = 'translateY(0)';
      e.currentTarget.style.boxShadow = '0 8px 24px rgba(255, 107, 53, 0.12)';
      e.currentTarget.style.borderColor = 'rgba(255, 107, 53, 0.1)';
    }}
    className={className}
  >
    {children}
  </div>
);

// Enhanced Section Header Component
const SectionHeader = ({ title, subtitle = "" }) => (
  <div style={{
    textAlign: 'center',
    marginBottom: 'clamp(40px, 8vw, 60px)',
    position: 'relative'
  }}>
    <h2 style={{
      fontSize: 'var(--heading-2)',
      fontWeight: 'bold',
      marginBottom: subtitle ? 'clamp(12px, 2vw, 16px)' : 'clamp(20px, 3vw, 24px)',
      background: 'linear-gradient(45deg, #FF6B35, #F7931E)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
      position: 'relative'
    }}>
      {title}
    </h2>
    {subtitle && (
      <p style={{
        fontSize: 'var(--text-base)',
        color: '#666',
        margin: 0,
        fontStyle: 'italic'
      }}>
        {subtitle}
      </p>
    )}
    <div style={{
      position: 'absolute',
      bottom: subtitle ? 'clamp(-12px, -2vw, -16px)' : 'clamp(-16px, -2.5vw, -20px)',
      left: '50%',
      transform: 'translateX(-50%)',
      width: 'clamp(80px, 15vw, 120px)',
      height: '3px',
      background: 'linear-gradient(45deg, #FF6B35, #F7931E)',
      borderRadius: '2px'
    }}></div>
  </div>
);

// Enhanced Footer Component
const Footer = () => (
  <footer style={{
    background: 'linear-gradient(145deg, #1a1a1a, #2a2a2a)',
    color: 'white',
    padding: 'clamp(40px, 8vw, 60px) 0',
    position: 'relative',
    overflow: 'hidden'
  }}>
    <div className="universal-container">
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(min(300px, 100%), 1fr))',
        gap: 'clamp(30px, 6vw, 50px)'
      }}>
        <div>
          <h3 style={{ 
            color: '#FF6B35', 
            fontSize: 'clamp(1.5rem, 4vw, 2rem)',
            marginBottom: 'clamp(20px, 3vw, 25px)'
          }}>
            Syed Solar Energy
          </h3>
          <p style={{ 
            lineHeight: '1.8', 
            maxWidth: '400px',
            opacity: 0.85
          }}>
            Providing cutting-edge solar energy solutions for homes and businesses across Pakistan since 2010.
          </p>
        </div>
        
        <div>
          <h4 style={{ 
            color: '#F7931E', 
            fontSize: 'clamp(1.2rem, 3vw, 1.5rem)',
            marginBottom: 'clamp(15px, 2.5vw, 20px)'
          }}>
            Quick Links
          </h4>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {['Home', 'About Us', 'Services', 'Projects', 'Contact'].map(item => (
              <li key={item} style={{ marginBottom: 'clamp(10px, 2vw, 15px)' }}>
                <a href="#" style={{
                  color: 'white',
                  textDecoration: 'none',
                  fontSize: 'var(--text-base)',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}>
                  <span style={{ color: '#FF6B35' }}>›</span> {item}
                </a>
              </li>
            ))}
          </ul>
        </div>
        
        <div>
          <h4 style={{ 
            color: '#F7931E', 
            fontSize: 'clamp(1.2rem, 3vw, 1.5rem)',
            marginBottom: 'clamp(15px, 2.5vw, 20px)'
          }}>
            Contact Us
          </h4>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            <li style={{ marginBottom: 'clamp(10px, 2vw, 15px)', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ fontSize: 'clamp(20px, 3vw, 24px)', color: '#FF6B35' }}>📍</div>
              <span>123 Solar Avenue, Energy City, Pakistan</span>
            </li>
            <li style={{ marginBottom: 'clamp(10px, 2vw, 15px)', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ fontSize: 'clamp(20px, 3vw, 24px)', color: '#FF6B35' }}>📞</div>
              <span>+92 307 550 6695</span>
            </li>
            <li style={{ marginBottom: 'clamp(10px, 2vw, 15px)', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ fontSize: 'clamp(20px, 3vw, 24px)', color: '#FF6B35' }}>✉️</div>
              <span>info@syedsolarenergy.com</span>
            </li>
          </ul>
        </div>
      </div>
      
      <div style={{ 
        borderTop: '1px solid rgba(255,255,255,0.1)', 
        marginTop: 'clamp(40px, 8vw, 60px)',
        paddingTop: 'clamp(20px, 4vw, 30px)',
        textAlign: 'center',
        fontSize: 'var(--text-small)',
        opacity: 0.7
      }}>
        © {new Date().getFullYear()} Syed Solar Energy. All rights reserved.
      </div>
    </div>
  </footer>
);

export default function Home() {
  const [counters] = useState([
    { id: 1, value: "2500", label: "Installations", color: "#FF6B35" },
    { id: 2, value: "98", label: "Satisfaction Rate", color: "#F7931E" },
    { id: 3, value: "15", label: "Years Experience", color: "#4CAF50" },
    { id: 4, value: "500", label: "Commercial Projects", color: "#2196F3" }
  ]);

  const [reviews] = useState([
    { 
      id: 1, 
      name: "Ahmed Khan", 
      designation: "Homeowner", 
      review: "Switching to solar with Syed Solar was the best decision I made. My electricity bills have reduced by 80% and the installation was seamless.", 
      stars: 5 
    },
    { 
      id: 2, 
      name: "Fatima Ali", 
      designation: "Business Owner", 
      review: "The team was professional and knowledgeable. They helped us design a custom solution that perfectly fits our factory's energy needs.", 
      stars: 5 
    },
    { 
      id: 3, 
      name: "Bilal Hassan", 
      designation: "School Administrator", 
      review: "Our school has been running on solar power for 2 years now. The system is reliable and we've saved thousands on energy costs.", 
      stars: 4 
    }
  ]);

  const [features] = useState([
    { 
      id: 1, 
      title: "Premium Quality Panels", 
      description: "We use only the highest efficiency solar panels with 25-year performance warranties to ensure maximum energy production." 
    },
    { 
      id: 2, 
      title: "Custom Solutions", 
      description: "Every system is designed specifically for your property and energy needs to maximize efficiency and savings." 
    },
    { 
      id: 3, 
      title: "Professional Installation", 
      description: "Our certified technicians ensure flawless installation with minimal disruption to your daily routine." 
    },
    { 
      id: 4, 
      title: "Maintenance Support", 
      description: "Comprehensive maintenance packages to keep your system running at peak efficiency for decades." 
    }
  ]);

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
    adaptiveHeight: true,
    responsive: [
      { 
        breakpoint: 1200, 
        settings: { 
          slidesToShow: 2,
          slidesToScroll: 1
        } 
      },
      { 
        breakpoint: 768, 
        settings: { 
          slidesToShow: 1,
          slidesToScroll: 1,
          dots: true,
          arrows: false
        } 
      },
      { 
        breakpoint: 480, 
        settings: { 
          slidesToShow: 1,
          slidesToScroll: 1,
          dots: false,
          arrows: false,
          autoplay: true
        } 
      }
    ]
  };

  return (
    <>
      <style>{cssVariables}</style>
      
      <div style={{ 
        minHeight: '100vh', 
        background: `
          radial-gradient(circle at 20% 50%, rgba(255, 107, 53, 0.08) 0%, transparent 50%),
          radial-gradient(circle at 80% 20%, rgba(247, 147, 30, 0.08) 0%, transparent 50%),
          radial-gradient(circle at 40% 80%, rgba(255, 152, 0, 0.08) 0%, transparent 50%),
          linear-gradient(135deg, #f8faff 0%, #fff3e0 25%, #ffe0b2 50%, #ffcc80 75%, #ffb74d 100%)
        `,
        overflowX: 'hidden'
      }}>
        {/* Enhanced Hero Section with Professional Image */}
        <section style={{ 
          padding: 'var(--section-padding) 0', 
          margin: 0,
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Decorative elements */}
          <div style={{
            position: 'absolute',
            top: '10%',
            left: '5%',
            width: 'clamp(60px, 12vw, 100px)',
            height: 'clamp(60px, 12vw, 100px)',
            background: 'linear-gradient(45deg, rgba(255, 107, 53, 0.1), rgba(247, 147, 30, 0.1))',
            borderRadius: '50%',
            animation: 'float 6s ease-in-out infinite'
          }}></div>
          
          <div style={{
            position: 'absolute',
            bottom: '15%',
            right: '10%',
            width: 'clamp(50px, 10vw, 80px)',
            height: 'clamp(50px, 10vw, 80px)',
            background: 'linear-gradient(45deg, rgba(247, 147, 30, 0.1), rgba(255, 152, 0, 0.1))',
            borderRadius: '50%',
            animation: 'float 8s ease-in-out infinite reverse'
          }}></div>

          {/* Content Container */}
          <div className="universal-container">
            <div className="hero-content">
              {/* Text Content */}
              <div className="hero-text">
                <div style={{ 
                  background: 'linear-gradient(45deg, #FF6B35, #F7931E)',
                  color: 'white',
                  display: 'inline-block',
                  padding: 'clamp(6px, 1.5vw, 8px) clamp(12px, 2.5vw, 16px)',
                  borderRadius: 'clamp(30px, 6vw, 45px)',
                  fontSize: 'clamp(0.75rem, 2.5vw, 1rem)',
                  fontWeight: 'bold',
                  marginBottom: 'clamp(12px, 2.5vw, 18px)'
                }}>
                  PAKISTAN'S LEADING SOLAR PROVIDER
                </div>
                
                <h1 style={{ 
                  fontSize: 'clamp(1.8rem, 6vw, 3.5rem)',
                  fontWeight: 'bold', 
                  marginBottom: 'clamp(15px, 3vw, 20px)',
                  textShadow: '3px 3px 6px rgba(0,0,0,0.3)',
                  lineHeight: '1.1',
                  background: 'linear-gradient(45deg, #FF6B35, #F7931E)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}>
                  Power Your Future with Solar Energy
                </h1>
                
                <p style={{ 
                  fontSize: 'clamp(1rem, 3.5vw, 1.4rem)', 
                  marginBottom: 'clamp(12px, 2.5vw, 18px)', 
                  opacity: 0.95,
                  fontWeight: '300',
                  textShadow: '1px 1px 2px rgba(0,0,0,0.2)',
                  maxWidth: 'min(600px, 90vw)'
                }}>
                  Clean • Efficient • Sustainable
                </p>
                
                <p style={{ 
                  fontSize: 'clamp(0.9rem, 2.8vw, 1.1rem)', 
                  marginBottom: 'clamp(20px, 5vw, 30px)', 
                  opacity: 0.9,
                  lineHeight: '1.7',
                  maxWidth: 'min(600px, 90vw)'
                }}>
                  Transform your home and business with our premium solar energy systems. Join thousands of satisfied customers who have made the switch to renewable energy.
                </p>
                
                <div style={{ 
                  display: 'flex', 
                  gap: 'clamp(12px, 2.5vw, 18px)', 
                  flexWrap: 'wrap'
                }}>
                  <button
                    onClick={() => window.location.href = '/quotation'}
                    style={{
                      background: 'linear-gradient(45deg, #FF6B35, #F7931E)',
                      color: 'white',
                      border: 'none',
                      padding: 'clamp(12px, 2.5vw, 16px) clamp(25px, 6vw, 35px)',
                      borderRadius: 'clamp(30px, 6vw, 45px)',
                      fontSize: 'clamp(0.9rem, 3vw, 1.1rem)',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      boxShadow: '0 12px 32px rgba(255, 107, 53, 0.3)',
                      transition: 'all 0.4s ease',
                      textTransform: 'uppercase',
                      letterSpacing: '0.8px',
                      minWidth: 'clamp(180px, 35vw, 220px)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px'
                    }}
                    onMouseEnter={(e) => {
                      if (window.innerWidth > 768) {
                        e.target.style.transform = 'translateY(-3px)';
                        e.target.style.boxShadow = '0 15px 40px rgba(255, 107, 53, 0.4)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = 'translateY(0)';
                      e.target.style.boxShadow = '0 12px 32px rgba(255, 107, 53, 0.3)';
                    }}
                  >
                    <span>Get Started</span> 🚀
                  </button>
                  
                  <button
                    onClick={() => window.open('https://wa.me/923075506695?text=Hi! I would like to learn more about your solar energy solutions. Can you provide more information?', '_blank')}
                    style={{
                      background: 'transparent',
                      color: '#FF6B35',
                      border: '2px solid #FF6B35',
                      padding: 'clamp(10px, 2.5vw, 14px) clamp(22px, 5vw, 32px)',
                      borderRadius: 'clamp(30px, 6vw, 45px)',
                      fontSize: 'clamp(0.85rem, 2.8vw, 1rem)',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      transition: 'all 0.4s ease',
                      minWidth: 'clamp(160px, 32vw, 200px)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px'
                    }}
                    onMouseEnter={(e) => {
                      if (window.innerWidth > 768) {
                        e.target.style.background = 'rgba(255, 107, 53, 0.1)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = 'transparent';
                    }}
                  >
                    <span>Learn More</span> 📚
                  </button>
                </div>
              </div>
              
              {/* Professional Solar Image */}
              <div className="hero-image">
                <img 
                  src="https://images.unsplash.com/photo-1509391366360-2e959784a276?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80" 
                  alt="Professional Solar Energy Solutions"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Enhanced Counters Section */}
        <section style={{ 
          padding: 'var(--section-padding) 0', 
          background: `
            linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 248, 240, 0.95) 100%),
            url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 60"><defs><pattern id="dots" width="20" height="20" patternUnits="userSpaceOnUse"><circle cx="10" cy="10" r="1" fill="rgba(255,107,53,0.1)"/></pattern></defs><rect width="60" height="60" fill="url(%23dots)"/></svg>')
          `,
          position: 'relative'
        }}>
          <div className="universal-container" style={{ position: 'relative', zIndex: 2 }}>
            <SectionHeader 
              title="Our Impact in Numbers" 
              subtitle="Transforming Pakistan's energy landscape one installation at a time" 
            />
            <div className="grid-stats">
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

        {/* Enhanced Customer Reviews - Universal Screen Support */}
        <section style={{ 
          padding: 'var(--section-padding) 0', 
          background: `
            linear-gradient(135deg, rgba(255, 107, 53, 0.06) 0%, rgba(247, 147, 30, 0.06) 50%, rgba(255, 152, 0, 0.06) 100%),
            url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="waves" width="100" height="20" patternUnits="userSpaceOnUse"><path d="M0 10 Q25 0 50 10 T100 10 V20 H0 Z" fill="rgba(255,107,53,0.05)"/></pattern></defs><rect width="100" height="100" fill="url(%23waves)"/></svg>')
          `,
          position: 'relative'
        }}>
          <div className="universal-container" style={{ position: 'relative', zIndex: 2 }}>
            <SectionHeader 
              title="What Our Customers Say" 
              subtitle="Real experiences from our valued clients across Pakistan" 
            />
            
            <div className="grid-reviews">
              {reviews.map(review => (
                <Card3D key={review.id}>
                  <div style={{ padding: 'var(--card-padding)' }}>
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      marginBottom: 'clamp(16px, 3vw, 20px)',
                      flexWrap: 'wrap',
                      gap: 'clamp(12px, 2vw, 15px)'
                    }}>
                      <div style={{
                        width: 'clamp(50px, 10vw, 60px)',
                        height: 'clamp(50px, 10vw, 60px)',
                        borderRadius: '50%',
                        background: 'linear-gradient(45deg, #FF6B35, #F7931E)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontWeight: 'bold',
                        fontSize: 'clamp(1.2rem, 3vw, 1.5rem)'
                      }}>
                        {review.name.charAt(0)}
                      </div>
                      <div style={{ flex: 1, minWidth: 'min(150px, 100%)' }}>
                        <h4 style={{ 
                          margin: 0, 
                          color: '#FF6B35', 
                          fontSize: 'clamp(16px, 3vw, 20px)',
                          fontWeight: 'bold'
                        }}>
                          {review.name}
                        </h4>
                        {review.designation && (
                          <p style={{ 
                            margin: 0, 
                            color: '#666', 
                            fontSize: 'clamp(12px, 2.5vw, 14px)',
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
                      marginBottom: 'clamp(16px, 3vw, 20px)',
                      fontSize: 'var(--text-base)',
                      fontStyle: 'italic',
                      minHeight: 'clamp(100px, 15vw, 120px)'
                    }}>
                      "{review.review}"
                    </p>
                    <div style={{ 
                      display: 'flex', 
                      color: '#FFD700', 
                      fontSize: 'clamp(16px, 3vw, 20px)',
                      filter: 'drop-shadow(1px 1px 1px rgba(0,0,0,0.1))',
                      justifyContent: 'center'
                    }}>
                      {"★".repeat(review.stars)}{"☆".repeat(5 - review.stars)}
                    </div>
                  </div>
                </Card3D>
              ))}
            </div>
          </div>
        </section>

        {/* Enhanced Features Section */}
        <section style={{ 
          padding: 'var(--section-padding) 0', 
          background: `
            linear-gradient(135deg, rgba(255, 107, 53, 0.06) 0%, rgba(247, 147, 30, 0.06) 100%),
            url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80"><defs><pattern id="hexagon" width="40" height="35" patternUnits="userSpaceOnUse"><polygon points="20,5 35,15 35,25 20,35 5,25 5,15" fill="none" stroke="rgba(255,107,53,0.1)" stroke-width="1"/></pattern></defs><rect width="80" height="80" fill="url(%23hexagon)"/></svg>')
          `,
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div className="universal-container" style={{ position: 'relative', zIndex: 2 }}>
            <div style={{ textAlign: 'center', marginBottom: 'clamp(60px, 10vw, 80px)' }}>
              <h2 style={{ 
                fontSize: 'clamp(32px, 6vw, 48px)', 
                fontWeight: 'bold', 
                marginBottom: 'clamp(16px, 3vw, 20px)',
                background: 'linear-gradient(45deg, #FF6B35, #F7931E)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                position: 'relative'
              }}>
                Why Choose Syed Solar Energy?
                <div style={{
                  position: 'absolute',
                  bottom: 'clamp(-12px, -2vw, -15px)',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: 'clamp(120px, 20vw, 150px)',
                  height: 'clamp(4px, 0.8vw, 5px)',
                  background: 'linear-gradient(45deg, #FF6B35, #F7931E)',
                  borderRadius: '3px'
                }}></div>
              </h2>
              <p style={{
                fontSize: 'clamp(16px, 3vw, 20px)',
                color: '#666',
                maxWidth: 'min(600px, 90vw)',
                margin: '0 auto',
                lineHeight: '1.6'
              }}>
                Experience the difference with Pakistan's leading solar energy provider
              </p>
            </div>
            
            <div className="grid-features">
              {features.map((feature, index) => (
                <Card3D key={feature.id} style={{
                  animation: `fadeInUp 0.8s ease-out ${index * 0.2}s both`
                }}>
                  <div style={{ 
                    padding: 'clamp(40px, 6vw, 50px) var(--card-padding)', 
                    textAlign: 'center', 
                    minHeight: 'clamp(280px, 35vw, 320px)', 
                    display: 'flex', 
                    flexDirection: 'column', 
                    justifyContent: 'center',
                    position: 'relative'
                  }}>
                    <div style={{
                      position: 'absolute',
                      top: 'clamp(16px, 3vw, 20px)',
                      right: 'clamp(16px, 3vw, 20px)',
                      width: 'clamp(40px, 8vw, 60px)',
                      height: 'clamp(40px, 8vw, 60px)',
                      background: 'linear-gradient(45deg, rgba(255, 107, 53, 0.1), rgba(247, 147, 30, 0.1))',
                      borderRadius: '50%',
                      animation: 'pulse 3s ease-in-out infinite'
                    }}></div>

                    <div style={{ 
                      marginBottom: 'clamp(24px, 4vw, 30px)',
                      background: 'linear-gradient(135deg, #fff7e6, #f0f8ff)',
                      borderRadius: '50%',
                      width: 'clamp(80px, 12vw, 100px)',
                      height: 'clamp(80px, 12vw, 100px)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto clamp(24px, 4vw, 30px)',
                      border: '3px solid #FF6B35',
                      boxShadow: '0 8px 24px rgba(255, 107, 53, 0.2)',
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
                      <div style={{
                        fontSize: 'clamp(32px, 6vw, 40px)',
                        color: '#FF6B35'
                      }}>
                        {index === 0 && '☀️'}
                        {index === 1 && '🔧'}
                        {index === 2 && '👷‍♂️'}
                        {index === 3 && '🔧'}
                      </div>
                    </div>
                    <h4 style={{ 
                      color: '#FF6B35', 
                      fontSize: 'clamp(20px, 4vw, 26px)',
                      fontWeight: 'bold',
                      marginBottom: 'clamp(16px, 3vw, 20px)',
                      lineHeight: '1.3'
                    }}>
                      {feature.title}
                    </h4>
                    <p style={{ 
                      color: '#666', 
                      lineHeight: '1.8',
                      fontSize: 'var(--text-base)',
                      margin: 0
                    }}>
                      {feature.description}
                    </p>
                    
                    {/* Achievement badge */}
                    <div style={{
                      position: 'absolute',
                      bottom: 'clamp(16px, 3vw, 20px)',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      background: 'linear-gradient(45deg, #FF6B35, #F7931E)',
                      color: 'white',
                      padding: 'clamp(6px, 1.5vw, 8px) clamp(12px, 2.5vw, 16px)',
                      borderRadius: 'clamp(16px, 3vw, 20px)',
                      fontSize: 'clamp(10px, 2vw, 12px)',
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

        {/* Enhanced Footer */}
        <Footer />

        {/* Popups */}
        <WhatsAppPopup />

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
              33% { transform: translateY(clamp(-15px, -2vw, -20px)) rotate(3deg); }
              66% { transform: translateY(clamp(-8px, -1vw, -10px)) rotate(-2deg); }
            }
            
            @keyframes bounce {
              0%, 100% { transform: translateY(0px); }
              50% { transform: translateY(clamp(-20px, -3vw, -25px)); }
            }
            
            @keyframes pulse {
              0%, 100% { transform: scale(1); opacity: 0.8; }
              50% { transform: scale(1.05); opacity: 1; }
            }

            @keyframes fadeIn {
              0% { opacity: 0; backdrop-filter: blur(0px); }
              100% { opacity: 1; backdrop-filter: blur(8px); }
            }

            @keyframes shimmer {
              0% { transform: translateX(-100%); }
              100% { transform: translateX(100%); }
            }

            @keyframes fadeInUp {
              0% {
                opacity: 0;
                transform: translateY(clamp(30px, 5vw, 50px));
              }
              100% {
                opacity: 1;
                transform: translateY(0);
              }
            }

            /* Responsive optimizations */
            @media (max-width: 480px) {
              .hero-content {
                padding: clamp(20px, 5vw, 30px) 0;
              }
              
              .grid-stats {
                grid-template-columns: repeat(auto-fit, minmax(min(160px, 100%), 1fr));
              }
              
              .slick-dots {
                bottom: -30px !important;
              }
              
              .slick-dots li button:before {
                font-size: 8px !important;
              }
            }

            @media (min-width: 481px) and (max-width: 768px) {
              .hero-content {
                gap: clamp(25px, 6vw, 40px);
              }
              
              .grid-stats {
                grid-template-columns: repeat(auto-fit, minmax(min(180px, 100%), 1fr));
              }
            }

            @media (min-width: 769px) and (max-width: 1024px) {
              .grid-features {
                grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
              }
            }

            /* Large screen optimizations */
            @media (min-width: 1440px) {
              .universal-container {
                max-width: 1400px;
              }
              
              .hero-content {
                gap: clamp(60px, 8vw, 100px);
              }
            }

            /* Ultra-wide screen support */
            @media (min-width: 1920px) {
              .universal-container {
                max-width: 1600px;
              }
            }

            /* Focus management for accessibility */
            button:focus-visible,
            .card3d:focus-visible {
              outline: 3px solid #FF6B35;
              outline-offset: 2px;
            }

            /* Smooth scrolling */
            html {
              scroll-behavior: smooth;
            }
          `}
        </style>
      </div>
    </>
  );
}