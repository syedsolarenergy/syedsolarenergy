import React, { useEffect, useState } from "react";
import logo from "../assets/logo.png";
import aqibImg from "../assets/aqib.png";
import zubairImg from "../assets/zubair.png";
import Footer from "../components/Footer";
import "../styles/Responsive.css";

// Enhanced CSS Variables for Universal Screen Support
const cssVariables = `
  :root {
    --primary-orange: #FF6B35;
    --secondary-orange: #F7931E;
    --font-size-base: clamp(14px, 2.5vw, 18px);
    --padding-base: clamp(12px, 4vw, 40px);
    --section-padding: clamp(20px, 6vw, 80px);
    --card-padding: clamp(16px, 4vw, 40px);
    --heading-1: clamp(1.75rem, 5vw, 3rem);
    --heading-2: clamp(1.5rem, 4vw, 2.5rem);
    --heading-3: clamp(1.25rem, 3.5vw, 2rem);
    --text-base: clamp(0.875rem, 2.2vw, 1.125rem);
    --text-small: clamp(0.75rem, 2vw, 1rem);
    --stat-number: clamp(1.5rem, 6vw, 2.8rem);
    --border-radius: clamp(12px, 2.5vw, 20px);
    --container-max: min(1400px, 95vw);
    --grid-gap: clamp(16px, 3vw, 32px);
    --card-min-width: min(280px, 90vw);
  }

  /* Container System */
  .universal-container {
    width: 100%;
    max-width: var(--container-max);
    margin: 0 auto;
    padding: 0 clamp(12px, 3vw, 24px);
  }

  /* Universal Grid System */
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

  .grid-leadership {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(min(350px, 100%), 1fr));
    gap: var(--grid-gap);
    width: 100%;
    place-items: center;
  }

  .grid-values {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(min(140px, 100%), 1fr));
    gap: clamp(8px, 2vw, 16px);
  }

  /* Responsive Typography */
  .responsive-text {
    font-size: var(--text-base);
    line-height: 1.6;
  }

  .responsive-text-small {
    font-size: var(--text-small);
    line-height: 1.5;
  }

  /* Mobile-First Approach */
  @media (max-width: 480px) {
    :root {
      --card-min-width: 100%;
      --grid-gap: clamp(12px, 4vw, 20px);
    }
    
    .grid-leadership {
      grid-template-columns: 1fr;
    }
    
    .grid-values {
      grid-template-columns: 1fr;
    }
  }

  @media (min-width: 481px) and (max-width: 768px) {
    .grid-values {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  @media (min-width: 769px) {
    .grid-values {
      grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
    }
  }

  /* Ultra-wide screen support */
  @media (min-width: 1920px) {
    :root {
      --container-max: 1600px;
    }
  }
`;

// Enhanced Card Component with better mobile support
const Card3D = ({ children, className = "", style = {}, mobileFullWidth = false }) => (
  <div
    style={{
      background: 'linear-gradient(145deg, #ffffff, #fff8f0)',
      borderRadius: 'var(--border-radius)',
      boxShadow: '0 8px 32px rgba(255, 107, 53, 0.12)',
      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
      transform: 'translateY(0)',
      cursor: 'pointer',
      overflow: 'hidden',
      border: '1px solid rgba(255, 107, 53, 0.1)',
      width: mobileFullWidth ? '100%' : 'auto',
      ...style,
    }}
    onMouseEnter={(e) => {
      if (window.innerWidth > 768) {
        e.currentTarget.style.transform = 'translateY(-8px)';
        e.currentTarget.style.boxShadow = '0 16px 48px rgba(255, 107, 53, 0.18)';
        e.currentTarget.style.borderColor = 'rgba(255, 107, 53, 0.25)';
      }
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = 'translateY(0)';
      e.currentTarget.style.boxShadow = '0 8px 32px rgba(255, 107, 53, 0.12)';
      e.currentTarget.style.borderColor = 'rgba(255, 107, 53, 0.1)';
    }}
    className={`responsive-card ${className}`}
  >
    {children}
  </div>
);

// Enhanced Timeline with better mobile layout
const TimelineItem = ({ year, title, description, icon, delay = 0 }) => (
  <div className="timeline-item" style={{
    display: 'flex',
    alignItems: 'flex-start',
    marginBottom: 'clamp(20px, 4vw, 40px)',
    animation: `fadeInLeft 0.8s ease-out ${delay}s both`,
    flexDirection: window.innerWidth <= 640 ? 'column' : 'row',
    textAlign: window.innerWidth <= 640 ? 'center' : 'left'
  }}>
    <div className="timeline-icon" style={{
      width: 'clamp(50px, 8vw, 70px)',
      height: 'clamp(50px, 8vw, 70px)',
      background: 'linear-gradient(135deg, #FF6B35, #F7931E)',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: 'clamp(16px, 3.5vw, 22px)',
      marginRight: window.innerWidth <= 640 ? '0' : 'clamp(15px, 3vw, 25px)',
      marginBottom: window.innerWidth <= 640 ? 'clamp(15px, 3vw, 20px)' : '0',
      boxShadow: '0 8px 24px rgba(255, 107, 53, 0.3)',
      animation: 'pulse 3s ease-in-out infinite',
      flexShrink: 0
    }}>
      {icon}
    </div>
    <div style={{ flex: 1, width: '100%' }}>
      <div style={{
        background: 'linear-gradient(135deg, #ffffff, #fff8f0)',
        padding: 'clamp(16px, 3.5vw, 28px)',
        borderRadius: 'var(--border-radius)',
        boxShadow: '0 4px 16px rgba(255, 107, 53, 0.1)',
        border: '1px solid rgba(255, 107, 53, 0.1)'
      }}>
        <div style={{
          color: '#FF6B35',
          fontWeight: 'bold',
          fontSize: 'clamp(14px, 2.5vw, 16px)',
          marginBottom: '8px'
        }}>
          {year}
        </div>
        <h4 style={{
          color: '#333',
          fontSize: 'clamp(16px, 3vw, 20px)',
          fontWeight: 'bold',
          marginBottom: '12px',
          margin: 0
        }}>
          {title}
        </h4>
        <p className="responsive-text" style={{
          color: '#666',
          margin: 0
        }}>
          {description}
        </p>
      </div>
    </div>
  </div>
);

// Enhanced Stats Counter with better mobile sizing
const StatCard = ({ number, label, icon, color = "#FF6B35" }) => {
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

    const element = document.getElementById(`stat-${label}`);
    if (element) observer.observe(element);

    return () => observer.disconnect();
  }, [label]);

  useEffect(() => {
    if (!isVisible) return;
    
    let start = 0;
    const end = parseInt(number);
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
  }, [number, isVisible]);

  return (
    <div
      id={`stat-${label}`}
      className="stat-card"
      style={{
        textAlign: 'center',
        padding: 'var(--card-padding)',
        background: 'linear-gradient(145deg, #ffffff, #fff8f0)',
        borderRadius: 'var(--border-radius)',
        boxShadow: '0 8px 24px rgba(255, 107, 53, 0.12)',
        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        border: '1px solid rgba(255, 107, 53, 0.1)',
        cursor: 'pointer',
        minHeight: 'clamp(120px, 15vw, 160px)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center'
      }}
      onMouseEnter={(e) => {
        if (window.innerWidth > 768) {
          e.currentTarget.style.transform = 'translateY(-8px)';
          e.currentTarget.style.boxShadow = '0 16px 40px rgba(255, 107, 53, 0.2)';
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 8px 24px rgba(255, 107, 53, 0.12)';
      }}
    >
      <div style={{
        fontSize: 'clamp(24px, 5vw, 32px)',
        marginBottom: 'clamp(8px, 2vw, 12px)',
        animation: 'bounce 2s ease-in-out infinite'
      }}>
        {icon}
      </div>
      <div style={{
        fontSize: 'var(--stat-number)',
        fontWeight: 'bold',
        color: color,
        marginBottom: 'clamp(6px, 1.5vw, 10px)',
        background: `linear-gradient(45deg, ${color}, #F7931E)`,
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text'
      }}>
        {count}+
      </div>
      <p className="responsive-text-small" style={{
        color: '#666',
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

// Enhanced Section Header Component
const SectionHeader = ({ title, subtitle = "" }) => (
  <div style={{
    textAlign: 'center',
    marginBottom: 'clamp(30px, 6vw, 60px)',
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
      <p className="responsive-text" style={{
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
      width: 'clamp(60px, 12vw, 120px)',
      height: '3px',
      background: 'linear-gradient(45deg, #FF6B35, #F7931E)',
      borderRadius: '2px'
    }}></div>
  </div>
);

export default function About() {
  return (
    <>
      <style>{cssVariables}</style>
      
      <section style={{
        background: `
          radial-gradient(circle at 20% 50%, rgba(255, 107, 53, 0.08) 0%, transparent 50%),
          radial-gradient(circle at 80% 20%, rgba(247, 147, 30, 0.08) 0%, transparent 50%),
          radial-gradient(circle at 40% 80%, rgba(255, 152, 0, 0.08) 0%, transparent 50%),
          linear-gradient(135deg, #f8faff 0%, #fff3e0 25%, #ffe0b2 50%, #ffcc80 75%, #ffb74d 100%)
        `,
        minHeight: "100vh",
        padding: "var(--section-padding) 0",
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Enhanced animated background particles */}
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="floating-particle"
            style={{
              position: 'absolute',
              width: `${Math.random() * 6 + 3}px`,
              height: `${Math.random() * 6 + 3}px`,
              background: 'rgba(255,107,53,0.25)',
              borderRadius: '50%',
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animation: `floatingParticles ${Math.random() * 20 + 15}s linear infinite ${Math.random() * 5}s`,
              zIndex: 0
            }}
          />
        ))}

        <div className="universal-container" style={{ position: 'relative', zIndex: 1 }}>
          {/* Enhanced Logo and Title Section */}
          <Card3D style={{
            maxWidth: 'min(800px, 95vw)',
            margin: "0 auto clamp(40px, 6vw, 60px) auto",
            padding: "clamp(32px, 5vw, 60px) var(--card-padding)",
            textAlign: "center",
            position: 'relative',
            overflow: 'visible',
            animation: 'fadeInUp 0.8s ease-out'
          }} mobileFullWidth>
            {/* Decorative top element */}
            <div style={{
              position: 'absolute',
              top: 'clamp(-20px, -3vw, -25px)',
              left: '50%',
              transform: 'translateX(-50%)',
              width: 'clamp(40px, 6vw, 50px)',
              height: 'clamp(40px, 6vw, 50px)',
              background: 'linear-gradient(45deg, #FF6B35, #F7931E)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 'clamp(16px, 3vw, 20px)',
              boxShadow: '0 8px 24px rgba(255, 107, 53, 0.3)'
            }}>
              ⚡
            </div>

            <img
              src={logo}
              alt="Syed Solar Energy Logo"
              className="logo-hover"
              style={{
                width: 'clamp(70px, 12vw, 100px)',
                height: "auto",
                margin: "clamp(20px, 3vw, 25px) auto clamp(15px, 2vw, 20px) auto",
                borderRadius: 'var(--border-radius)',
                boxShadow: "0 12px 32px rgba(255, 107, 53, 0.2)",
                border: '2px solid #FF6B35',
                transition: 'all 0.3s ease',
                animation: 'pulse 3s ease-in-out infinite'
              }}
            />
            <h1 style={{
              background: 'linear-gradient(45deg, #FF6B35, #F7931E)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              fontWeight: 900,
              fontSize: "var(--heading-1)",
              marginBottom: 'clamp(12px, 2vw, 16px)',
              textShadow: '0 2px 4px rgba(255, 107, 53, 0.1)'
            }}>
              About Syed Solar Energy
            </h1>
            <div style={{ 
              fontSize: 'clamp(16px, 3vw, 20px)', 
              color: "#333", 
              marginBottom: 'clamp(12px, 2vw, 16px)',
              fontWeight: '600',
              background: 'linear-gradient(135deg, #fff7e6, #ffffff)',
              padding: 'clamp(12px, 2.5vw, 16px) clamp(16px, 3vw, 20px)',
              borderRadius: 'var(--border-radius)',
              border: '2px solid #F7931E',
              boxShadow: '0 4px 12px rgba(247, 147, 30, 0.2)'
            }}>
              صاف توانائی کے سفر کا روشن راستہ
            </div>
            <p className="responsive-text" style={{
              color: '#666',
              margin: 0,
              fontStyle: 'italic'
            }}>
              "Illuminating the bright path of clean energy journey"
            </p>
          </Card3D>

          {/* Company Journey Timeline */}
          <div style={{ marginBottom: 'var(--section-padding)' }}>
            <SectionHeader title="Our Journey" />

            <div style={{ maxWidth: 'min(1200px, 95vw)', margin: '0 auto' }}>
              <TimelineItem
                year="1998"
                title="Humble Beginnings"
                description="Started our journey with home appliance repairs, building trust in our community one customer at a time."
                icon="🔧"
                delay={0.2}
              />
              <TimelineItem
                year="2005"
                title="Expanding Horizons"
                description="Grew into transformer repairs and electrical solutions, establishing ourselves as electrical experts."
                icon="⚡"
                delay={0.4}
              />
              <TimelineItem
                year="2012"
                title="UPS Systems Era"
                description="Ventured into UPS system development and servicing, providing backup power solutions."
                icon="🔋"
                delay={0.6}
              />
              <TimelineItem
                year="2018"
                title="Solar Revolution"
                description="Embraced the future with solar energy solutions, becoming pioneers in renewable energy."
                icon="☀️"
                delay={0.8}
              />
              <TimelineItem
                year="2024"
                title="Industry Leaders"
                description="Today we stand as Pakistan's trusted solar energy provider, serving homes, businesses, and industries."
                icon="🏆"
                delay={1.0}
              />
            </div>
          </div>

          {/* Enhanced Mission, Vision, Values */}
          <div style={{ marginBottom: 'var(--section-padding)' }}>
            <SectionHeader title="Our Foundation" />
            
            <div className="grid-auto">
              <Card3D style={{
                padding: "var(--card-padding)",
                textAlign: 'center',
                position: 'relative',
                overflow: 'visible',
                animation: 'fadeInUp 0.8s ease-out 0.2s both',
                minHeight: 'clamp(280px, 35vw, 350px)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center'
              }}>
                <div style={{
                  position: 'absolute',
                  top: 'clamp(-15px, -2.5vw, -20px)',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: 'clamp(32px, 5vw, 40px)',
                  height: 'clamp(32px, 5vw, 40px)',
                  background: 'linear-gradient(45deg, #FF6B35, #F7931E)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 'clamp(12px, 2.5vw, 16px)',
                  boxShadow: '0 6px 20px rgba(255, 107, 53, 0.3)'
                }}>
                  🎯
                </div>
                <h3 style={{
                  color: "#FF6B35",
                  fontWeight: 800,
                  fontSize: 'var(--heading-3)',
                  marginTop: 'clamp(28px, 4vw, 35px)',
                  marginBottom: 'clamp(16px, 2.5vw, 20px)',
                  letterSpacing: ".01em"
                }}>
                  Our Mission
                </h3>
                <p className="responsive-text" style={{
                  color: "#333",
                  fontWeight: 500,
                  margin: 0
                }}>
                  To empower every household and business with reliable, clean, and sustainable solar energy solutions tailored for the future.
                </p>
              </Card3D>

              <Card3D style={{
                padding: "var(--card-padding)",
                textAlign: 'center',
                position: 'relative',
                overflow: 'visible',
                animation: 'fadeInUp 0.8s ease-out 0.4s both',
                minHeight: 'clamp(280px, 35vw, 350px)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center'
              }}>
                <div style={{
                  position: 'absolute',
                  top: 'clamp(-15px, -2.5vw, -20px)',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: 'clamp(32px, 5vw, 40px)',
                  height: 'clamp(32px, 5vw, 40px)',
                  background: 'linear-gradient(45deg, #FF6B35, #F7931E)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 'clamp(12px, 2.5vw, 16px)',
                  boxShadow: '0 6px 20px rgba(255, 107, 53, 0.3)'
                }}>
                  🔮
                </div>
                <h3 style={{
                  color: "#FF6B35",
                  fontWeight: 800,
                  fontSize: 'var(--heading-3)',
                  marginTop: 'clamp(28px, 4vw, 35px)',
                  marginBottom: 'clamp(16px, 2.5vw, 20px)',
                  letterSpacing: ".01em"
                }}>
                  Our Vision
                </h3>
                <p className="responsive-text" style={{
                  color: "#333",
                  fontWeight: 500,
                  margin: 0
                }}>
                  To be the leading solar energy provider in Pakistan, driving innovation, energy independence, and environmental sustainability through excellence in service and technology.
                </p>
              </Card3D>

              <Card3D style={{
                padding: "var(--card-padding)",
                textAlign: 'center',
                position: 'relative',
                overflow: 'visible',
                animation: 'fadeInUp 0.8s ease-out 0.6s both',
                minHeight: 'clamp(280px, 35vw, 350px)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center'
              }}>
                <div style={{
                  position: 'absolute',
                  top: 'clamp(-15px, -2.5vw, -20px)',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: 'clamp(32px, 5vw, 40px)',
                  height: 'clamp(32px, 5vw, 40px)',
                  background: 'linear-gradient(45deg, #FF6B35, #F7931E)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 'clamp(12px, 2.5vw, 16px)',
                  boxShadow: '0 6px 20px rgba(255, 107, 53, 0.3)'
                }}>
                  💎
                </div>
                <h3 style={{
                  color: "#FF6B35",
                  fontWeight: 800,
                  fontSize: 'var(--heading-3)',
                  marginTop: 'clamp(28px, 4vw, 35px)',
                  marginBottom: 'clamp(16px, 2.5vw, 20px)',
                  letterSpacing: ".01em"
                }}>
                  Our Values
                </h3>
                <div className="grid-values">
                  {[
                    { title: 'Quality', desc: 'Premium products and services' },
                    { title: 'Trust', desc: 'Transparent and honest dealings' },
                    { title: 'Innovation', desc: 'Cutting-edge solar technology' },
                    { title: 'Sustainability', desc: 'Protecting our environment' }
                  ].map((value, index) => (
                    <div key={index} style={{
                      background: 'rgba(255, 107, 53, 0.05)',
                      padding: 'clamp(10px, 2vw, 14px)',
                      borderRadius: 'clamp(8px, 1.5vw, 12px)',
                      border: '1px solid rgba(255, 107, 53, 0.1)',
                      textAlign: 'left'
                    }}>
                      <div style={{
                        color: '#FF6B35',
                        fontWeight: 'bold',
                        fontSize: 'clamp(0.875rem, 2vw, 1rem)',
                        marginBottom: '4px'
                      }}>
                        {value.title}
                      </div>
                      <p className="responsive-text-small" style={{
                        color: "#333",
                        margin: 0,
                        lineHeight: 1.4
                      }}>
                        {value.desc}
                      </p>
                    </div>
                  ))}
                </div>
              </Card3D>
            </div>
          </div>

          {/* Enhanced Stats Section */}
          <div style={{ marginBottom: 'var(--section-padding)' }}>
            <SectionHeader title="Our Impact in Numbers" />

            <div className="grid-stats">
              <StatCard number="26" label="Years Experience" icon="📅" color="#FF6B35" />
              <StatCard number="1500" label="Happy Customers" icon="😊" color="#F7931E" />
              <StatCard number="2000" label="Projects Completed" icon="✅" color="#FF9800" />
              <StatCard number="50" label="Expert Technicians" icon="👷" color="#FF6600" />
            </div>
          </div>

          {/* Enhanced Leadership Cards */}
          <div style={{ marginBottom: 'var(--section-padding)' }}>
            <SectionHeader title="Meet Our Leadership" />

            <div className="grid-leadership">
              {/* Enhanced Aqib Card */}
              <Card3D style={{
                padding: "var(--card-padding)",
                textAlign: "center",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                position: 'relative',
                animation: 'fadeInLeft 0.8s ease-out 0.2s both',
                maxWidth: '100%',
                width: '100%'
              }}>
                {/* Background decoration */}
                <div style={{
                  position: 'absolute',
                  top: 'clamp(12px, 2vw, 16px)',
                  right: 'clamp(12px, 2vw, 16px)',
                  width: 'clamp(32px, 5vw, 48px)',
                  height: 'clamp(32px, 5vw, 48px)',
                  background: 'linear-gradient(45deg, rgba(255, 107, 53, 0.1), rgba(247, 147, 30, 0.1))',
                  borderRadius: '50%',
                  animation: 'pulse 3s ease-in-out infinite'
                }}></div>

                <div style={{
                  position: 'relative',
                  marginBottom: 'clamp(16px, 3vw, 24px)'
                }}>
                  <img
                    src={aqibImg}
                    alt="Engr. Muhammad Aqib Afridi"
                    className="profile-hover"
                    style={{
                      width: 'clamp(90px, 15vw, 130px)',
                      height: 'clamp(110px, 18vw, 150px)',
                      objectFit: "cover",
                      borderRadius: 'var(--border-radius)',
                      border: "3px solid #FF6B35",
                      background: "#fff6ec",
                      boxShadow: "0 12px 32px rgba(255, 107, 53, 0.2)",
                      transition: 'all 0.3s ease'
                    }}
                  />
                  <div style={{
                    position: 'absolute',
                    bottom: 'clamp(-6px, -1vw, -8px)',
                    right: 'clamp(-6px, -1vw, -8px)',
                    width: 'clamp(24px, 4vw, 32px)',
                    height: 'clamp(24px, 4vw, 32px)',
                    background: 'linear-gradient(45deg, #FF6B35, #F7931E)',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 'clamp(12px, 2vw, 16px)',
                    boxShadow: '0 4px 12px rgba(255, 107, 53, 0.3)'
                  }}>
                    👑
                  </div>
                </div>

                <h4 style={{ 
                  background: 'linear-gradient(45deg, #FF6B35, #F7931E)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  fontWeight: 800, 
                  fontSize: 'clamp(16px, 3vw, 20px)', 
                  margin: "0 0 clamp(6px, 1.5vw, 10px) 0",
                  textAlign: 'center'
                }}>
                  Engr. Muhammad Aqib Afridi
                </h4>
                <div style={{ 
                  fontSize: 'var(--text-base)', 
                  fontWeight: 600, 
                  color: "#444",
                  marginBottom: 'clamp(16px, 2.5vw, 20px)',
                  width: '100%'
                }}>
                  <div style={{
                    background: 'linear-gradient(135deg, #fff7e6, #ffffff)',
                    padding: 'clamp(8px, 1.5vw, 12px) clamp(12px, 2vw, 16px)',
                    borderRadius: 'clamp(8px, 1.5vw, 12px)',
                    border: '2px solid #F7931E',
                    marginBottom: 'clamp(8px, 1.5vw, 12px)'
                  }}>
                    <strong>Founder</strong>
                  </div>
                  <span className="responsive-text-small" style={{ 
                    fontWeight: 500, 
                    color: "#666"
                  }}>
                    BSc Electrical Engineering, SUIT Peshawar
                  </span>
                </div>
                
                <div style={{
                  marginTop: 'clamp(16px, 2.5vw, 20px)',
                  background: "linear-gradient(135deg, #fff6ec, #ffffff)",
                  borderLeft: "4px solid #FF6B35",
                  borderRadius: 'var(--border-radius)',
                  boxShadow: "0 6px 20px rgba(255, 107, 53, 0.1)",
                  padding: "clamp(16px, 2.5vw, 20px)",
                  textAlign: "left",
                  position: 'relative',
                  width: '100%'
                }}>
                  <div style={{
                    position: 'absolute',
                    top: 'clamp(-8px, -1.5vw, -10px)',
                    left: 'clamp(12px, 2vw, 16px)',
                    background: '#FF6B35',
                    color: 'white',
                    padding: 'clamp(3px, 0.8vw, 4px) clamp(8px, 1.5vw, 12px)',
                    borderRadius: 'clamp(10px, 2vw, 15px)',
                    fontSize: 'clamp(9px, 1.5vw, 11px)',
                    fontWeight: 'bold',
                    textTransform: 'uppercase'
                  }}>
                    Founder's Message
                  </div>
                  <p className="responsive-text" style={{
                    color: "#333",
                    fontWeight: 500,
                    margin: 'clamp(12px, 2vw, 16px) 0 0 0',
                    fontStyle: 'italic'
                  }}>
                    "With every project, my goal is to deliver not just energy but peace of mind. Syed Solar Energy was founded to serve every home and business with honesty, quality, and true after-sales support. I thank all our customers for trusting us with their energy needs—your belief in us keeps us moving forward."
                  </p>
                </div>
              </Card3D>

              {/* Enhanced Zubair Card */}
              <Card3D style={{
                padding: "var(--card-padding)",
                textAlign: "center",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                position: 'relative',
                animation: 'fadeInRight 0.8s ease-out 0.4s both',
                maxWidth: '100%',
                width: '100%'
              }}>
                {/* Background decoration */}
                <div style={{
                  position: 'absolute',
                  top: 'clamp(12px, 2vw, 16px)',
                  left: 'clamp(12px, 2vw, 16px)',
                  width: 'clamp(32px, 5vw, 48px)',
                  height: 'clamp(32px, 5vw, 48px)',
                  background: 'linear-gradient(45deg, rgba(247, 147, 30, 0.1), rgba(255, 152, 0, 0.1))',
                  borderRadius: '50%',
                  animation: 'pulse 3s ease-in-out infinite 1s'
                }}></div>

                <div style={{
                  position: 'relative',
                  marginBottom: 'clamp(16px, 3vw, 24px)'
                }}>
                  <img
                    src={zubairImg}
                    alt="Engr. M Zubair Afridi"
                    className="profile-hover"
                    style={{
                      width: 'clamp(90px, 15vw, 130px)',
                      height: 'clamp(110px, 18vw, 150px)',
                      objectFit: "cover",
                      borderRadius: 'var(--border-radius)',
                      border: "3px solid #FF6B35",
                      background: "#fff6ec",
                      boxShadow: "0 12px 32px rgba(255, 107, 53, 0.2)",
                      transition: 'all 0.3s ease'
                    }}
                  />
                  <div style={{
                    position: 'absolute',
                    bottom: 'clamp(-6px, -1vw, -8px)',
                    right: 'clamp(-6px, -1vw, -8px)',
                    width: 'clamp(24px, 4vw, 32px)',
                    height: 'clamp(24px, 4vw, 32px)',
                    background: 'linear-gradient(45deg, #FFD700, #FFA500)',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 'clamp(12px, 2vw, 16px)',
                    boxShadow: '0 4px 12px rgba(255, 215, 0, 0.3)',
                    animation: 'bounce 2s ease-in-out infinite'
                  }}>
                    🏅
                  </div>
                </div>

                <h4 style={{ 
                  background: 'linear-gradient(45deg, #FF6B35, #F7931E)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  fontWeight: 800, 
                  fontSize: 'clamp(16px, 3vw, 20px)', 
                  margin: "0 0 clamp(6px, 1.5vw, 10px) 0",
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexWrap: 'wrap',
                  gap: 'clamp(6px, 1.5vw, 10px)',
                  textAlign: 'center'
                }}>
                  <span>Engr. M Zubair Afridi</span>
                  <span style={{ 
                    background: 'linear-gradient(45deg, #FFD700, #FFA500)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    fontSize: 'clamp(10px, 1.8vw, 12px)',
                    fontWeight: 'bold',
                    border: '1px solid #FFD700',
                    borderRadius: 'clamp(8px, 1.5vw, 12px)',
                    padding: 'clamp(2px, 0.5vw, 3px) clamp(4px, 1vw, 6px)',
                    animation: 'pulse 2s ease-in-out infinite',
                    whiteSpace: 'nowrap'
                  }}>
                    Gold Medalist
                  </span>
                </h4>
                
                <div style={{ 
                  fontSize: 'var(--text-base)', 
                  fontWeight: 600, 
                  color: "#444",
                  marginBottom: 'clamp(16px, 2.5vw, 20px)',
                  width: '100%'
                }}>
                  <div style={{
                    background: 'linear-gradient(135deg, #fff7e6, #ffffff)',
                    padding: 'clamp(8px, 1.5vw, 12px) clamp(12px, 2vw, 16px)',
                    borderRadius: 'clamp(8px, 1.5vw, 12px)',
                    border: '2px solid #F7931E',
                    marginBottom: 'clamp(8px, 1.5vw, 12px)'
                  }}>
                    <strong>CEO</strong>
                  </div>
                  <span className="responsive-text-small" style={{ 
                    fontWeight: 500, 
                    color: "#666"
                  }}>
                    BSc Electrical Engineering, SUIT Peshawar
                  </span>
                </div>
                
                <div style={{
                  marginTop: 'clamp(16px, 2.5vw, 20px)',
                  background: "linear-gradient(135deg, #fff6ec, #ffffff)",
                  borderLeft: "4px solid #FF6B35",
                  borderRadius: 'var(--border-radius)',
                  boxShadow: "0 6px 20px rgba(255, 107, 53, 0.1)",
                  padding: "clamp(16px, 2.5vw, 20px)",
                  textAlign: "left",
                  position: 'relative',
                  width: '100%'
                }}>
                  <div style={{
                    position: 'absolute',
                    top: 'clamp(-8px, -1.5vw, -10px)',
                    left: 'clamp(12px, 2vw, 16px)',
                    background: '#FF6B35',
                    color: 'white',
                    padding: 'clamp(3px, 0.8vw, 4px) clamp(8px, 1.5vw, 12px)',
                    borderRadius: 'clamp(10px, 2vw, 15px)',
                    fontSize: 'clamp(9px, 1.5vw, 11px)',
                    fontWeight: 'bold',
                    textTransform: 'uppercase'
                  }}>
                    CEO's Message
                  </div>
                  <p className="responsive-text" style={{
                    color: "#333",
                    fontWeight: 500,
                    margin: 'clamp(12px, 2vw, 16px) 0 0 0',
                    fontStyle: 'italic'
                  }}>
                    "At Syed Solar Energy, our promise is reliability, transparency, and value for every customer. We are on a mission to make solar energy accessible, affordable, and easy for everyone in Pakistan. Thank you for your support—together, we are lighting the path to a cleaner, brighter future!"
                  </p>
                </div>
              </Card3D>
            </div>
          </div>

          {/* Enhanced Call to Action Section */}
          <Card3D style={{
            maxWidth: 'min(900px, 95vw)',
            margin: "0 auto",
            padding: "clamp(32px, 5vw, 50px) var(--card-padding)",
            textAlign: "center",
            background: "linear-gradient(135deg, #FF6B35, #F7931E, #FF9800)",
            color: 'white',
            position: 'relative',
            overflow: 'hidden',
            animation: 'fadeInUp 0.8s ease-out 0.8s both'
          }} mobileFullWidth>
            {/* Animated background elements */}
            <div style={{
              position: 'absolute',
              top: 'clamp(12px, 2vw, 16px)',
              right: 'clamp(12px, 2vw, 16px)',
              width: 'clamp(40px, 6vw, 60px)',
              height: 'clamp(40px, 6vw, 60px)',
              background: 'rgba(255,255,255,0.1)',
              borderRadius: '50%',
              animation: 'float 6s ease-in-out infinite'
            }}></div>
            <div style={{
              position: 'absolute',
              bottom: 'clamp(12px, 2vw, 16px)',
              left: 'clamp(12px, 2vw, 16px)',
              width: 'clamp(32px, 5vw, 48px)',
              height: 'clamp(32px, 5vw, 48px)',
              background: 'rgba(255,255,255,0.1)',
              borderRadius: '50%',
              animation: 'float 8s ease-in-out infinite reverse'
            }}></div>

            <h2 style={{
              fontSize: 'var(--heading-2)',
              fontWeight: 'bold',
              marginBottom: 'clamp(16px, 2.5vw, 20px)',
              textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
            }}>
              Ready to Go Solar?
            </h2>
            <p style={{
              fontSize: 'clamp(14px, 2.5vw, 18px)',
              marginBottom: 'clamp(24px, 4vw, 32px)',
              opacity: 0.95,
              lineHeight: '1.6'
            }}>
              Join thousands of satisfied customers who have made the switch to clean, renewable energy. 
              Get your free consultation today!
            </p>
            <div style={{
              display: 'flex',
              gap: 'clamp(12px, 2.5vw, 16px)',
              justifyContent: 'center',
              flexWrap: 'wrap'
            }}>
              <button
                onClick={() => window.location.href = '/quotation'}
                className="cta-button"
                style={{
                  background: 'rgba(255,255,255,0.9)',
                  color: '#FF6600',
                  border: 'none',
                  padding: 'clamp(10px, 2vw, 14px) clamp(16px, 3vw, 24px)',
                  borderRadius: 'clamp(16px, 3vw, 25px)',
                  fontSize: 'var(--text-base)',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  minWidth: 'clamp(160px, 35vw, 200px)',
                  flexShrink: 0
                }}
              >
                🚀 Get Free Quote
              </button>
              <button
                onClick={() => window.open('https://wa.me/923075596695?text=Hi! I would like to learn more about Syed Solar Energy and your services.', '_blank')}
                className="cta-button"
                style={{
                  background: 'transparent',
                  color: 'white',
                  border: '2px solid rgba(255,255,255,0.8)',
                  padding: 'clamp(8px, 1.8vw, 12px) clamp(16px, 3vw, 22px)',
                  borderRadius: 'clamp(16px, 3vw, 25px)',
                  fontSize: 'var(--text-base)',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  minWidth: 'clamp(160px, 35vw, 200px)',
                  flexShrink: 0
                }}
              >
                📞 Contact Us
              </button>
            </div>
          </Card3D>
        </div>
      </section>

      {/* Enhanced Footer */}
      <Footer />

      {/* Enhanced CSS Animations and Responsive Design */}
      <style>
        {`
          /* Enhanced Animations */
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

          @keyframes fadeInLeft {
            0% {
              opacity: 0;
              transform: translateX(clamp(-30px, -5vw, -50px));
            }
            100% {
              opacity: 1;
              transform: translateX(0);
            }
          }

          @keyframes fadeInRight {
            0% {
              opacity: 0;
              transform: translateX(clamp(30px, 5vw, 50px));
            }
            100% {
              opacity: 1;
              transform: translateX(0);
            }
          }

          @keyframes floatingParticles {
            0% { 
              transform: translateY(0px) translateX(0px) rotate(0deg); 
              opacity: 0.2;
            }
            33% { 
              transform: translateY(clamp(-20px, -3vw, -30px)) translateX(clamp(15px, 2vw, 20px)) rotate(120deg); 
              opacity: 0.5;
            }
            66% { 
              transform: translateY(clamp(-8px, -1.5vw, -10px)) translateX(clamp(-10px, -2vw, -15px)) rotate(240deg); 
              opacity: 0.7;
            }
            100% { 
              transform: translateY(0px) translateX(0px) rotate(360deg); 
              opacity: 0.2;
            }
          }

          @keyframes float {
            0%, 100% { 
              transform: translateY(0px) rotate(0deg); 
            }
            33% { 
              transform: translateY(clamp(-15px, -2vw, -20px)) rotate(3deg); 
            }
            66% { 
              transform: translateY(clamp(-8px, -1vw, -10px)) rotate(-2deg); 
            }
          }

          @keyframes pulse {
            0%, 100% { 
              transform: scale(1); 
              opacity: 0.7; 
            }
            50% { 
              transform: scale(1.05); 
              opacity: 1; 
            }
          }

          @keyframes bounce {
            0%, 100% { 
              transform: translateY(0px); 
            }
            50% { 
              transform: translateY(clamp(-6px, -1vw, -8px)); 
            }
          }

          /* Enhanced Responsive Design */
          @media (max-width: 480px) {
            .timeline-item {
              flex-direction: column !important;
              text-align: center !important;
            }
            
            .timeline-icon {
              margin-right: 0 !important;
              margin-bottom: clamp(12px, 3vw, 16px) !important;
            }
            
            .cta-button {
              width: 100% !important;
              min-width: auto !important;
            }

            .grid-leadership {
              gap: clamp(20px, 5vw, 30px) !important;
            }
          }
          
          @media (min-width: 481px) and (max-width: 768px) {
            .timeline-item {
              align-items: flex-start;
            }
          }
          
          @media (max-width: 640px) {
            .timeline-item {
              flex-direction: column;
              text-align: center;
            }
            
            .timeline-icon {
              margin-right: 0;
              margin-bottom: clamp(15px, 3vw, 20px);
            }
          }
          
          /* Touch-friendly interactions */
          @media (hover: none) and (pointer: coarse) {
            .responsive-card:active {
              transform: scale(0.98);
            }
            
            .cta-button:active {
              transform: scale(0.95);
            }
          }
          
          /* Enhanced hover effects for desktop */
          @media (min-width: 769px) {
            .logo-hover:hover {
              transform: scale(1.05) rotate(2deg) !important;
              box-shadow: 0 16px 40px rgba(255, 107, 53, 0.3) !important;
            }
            
            .profile-hover:hover {
              transform: scale(1.03) !important;
              box-shadow: 0 16px 40px rgba(255, 107, 53, 0.3) !important;
            }
            
            .cta-button:hover {
              transform: scale(1.03);
              box-shadow: 0 6px 20px rgba(0,0,0,0.3);
            }
          }

          /* Dark mode support */
          @media (prefers-color-scheme: dark) {
            :root {
              --text-color: #e0e0e0;
              --bg-color: #1a1a1a;
            }
          }

          /* High contrast mode support */
          @media (prefers-contrast: high) {
            .responsive-card {
              border: 2px solid #333 !important;
            }
          }

          /* Reduced motion support */
          @media (prefers-reduced-motion: reduce) {
            * {
              animation-duration: 0.01ms !important;
              animation-iteration-count: 1 !important;
              transition-duration: 0.01ms !important;
            }
          }

          /* Print styles */
          @media print {
            .floating-particle,
            .cta-button {
              display: none !important;
            }
            
            .responsive-card {
              box-shadow: none !important;
              border: 1px solid #333 !important;
            }
          }
          
          /* Focus management for accessibility */
          .cta-button:focus-visible {
            outline: 2px solid #FF6B35;
            outline-offset: 2px;
          }
          
          .responsive-card:focus-visible {
            outline: 2px solid #FF6B35;
            outline-offset: 2px;
          }
        `}
      </style>
    </>
  );
}