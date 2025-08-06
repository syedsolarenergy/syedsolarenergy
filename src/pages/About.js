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
    --section-padding: clamp(40px, 8vw, 100px);
    --card-padding: clamp(16px, 4vw, 40px);
    --heading-1: clamp(2rem, 6vw, 4rem);
    --heading-2: clamp(1.5rem, 4.5vw, 2.8rem);
    --heading-3: clamp(1.25rem, 3.5vw, 2rem);
    --text-base: clamp(0.875rem, 2.2vw, 1.125rem);
    --text-small: clamp(0.75rem, 2vw, 1rem);
    --text-tiny: clamp(0.65rem, 1.8vw, 0.9rem);
    --stat-number: clamp(1.5rem, 6vw, 3rem);
    --border-radius: clamp(12px, 2.5vw, 20px);
    --container-max: min(1400px, 95vw);
    --grid-gap: clamp(16px, 4vw, 40px);
    --card-min-width: min(280px, 90vw);
    --timeline-icon-size: clamp(70px, 12vw, 90px);
    --leadership-card-width: min(350px, 100%);
    --values-card-min: min(160px, 100%);
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

  .grid-leadership {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(var(--leadership-card-width), 1fr));
    gap: var(--grid-gap);
    width: 100%;
    place-items: center;
  }

  .grid-values {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(var(--values-card-min), 1fr));
    gap: clamp(12px, 3vw, 20px);
  }

  /* Timeline Responsive Layout */
  .timeline-container {
    max-width: min(1200px, 95vw);
    margin: 0 auto;
  }

  .timeline-item {
    display: flex;
    align-items: flex-start;
    marginBottom: clamp(20px, 4vw, 40px);
    gap: clamp(15px, 3vw, 25px);
  }

  .timeline-icon {
    width: var(--timeline-icon-size);
    height: var(--timeline-icon-size);
    background: linear-gradient(135deg, #FF6B35 0%, #F7931E 50%, #FF9800 100%);
    borderRadius: 50%;
    display: flex;
    alignItems: center;
    justifyContent: center;
    fontSize: clamp(20px, 4.5vw, 28px);
    boxShadow: 0 12px 32px rgba(255, 107, 53, 0.4), 0 0 0 3px rgba(255, 255, 255, 0.9), 0 0 0 6px rgba(255, 107, 53, 0.2);
    flexShrink: 0;
    position: relative;
    overflow: hidden;
  }

  .timeline-icon::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.3) 0%, transparent 60%);
    borderRadius: 50%;
  }

  .timeline-icon::after {
    content: '';
    position: absolute;
    top: 2px;
    left: 2px;
    right: 2px;
    bottom: 2px;
    background: linear-gradient(145deg, rgba(255, 255, 255, 0.1), transparent);
    borderRadius: 50%;
    border: 1px solid rgba(255, 255, 255, 0.2);
  }

  .timeline-content {
    flex: 1;
    background: linear-gradient(135deg, #ffffff, #fff8f0);
    padding: var(--card-padding);
    borderRadius: var(--border-radius);
    boxShadow: 0 4px 16px rgba(255, 107, 53, 0.1);
    border: 1px solid rgba(255, 107, 53, 0.1);
  }

  /* Mobile Optimizations */
  @media (max-width: 768px) {
    :root {
      --card-min-width: 100%;
      --grid-gap: clamp(12px, 4vw, 20px);
      --timeline-icon-size: clamp(60px, 10vw, 75px);
      --leadership-card-width: 100%;
      --values-card-min: 100%;
    }

    .timeline-item {
      flex-direction: column;
      text-align: center;
      align-items: center;
    }

    .grid-leadership {
      grid-template-columns: 1fr;
    }

    .grid-values {
      grid-template-columns: 1fr;
    }
  }

  @media (min-width: 641px) and (max-width: 1024px) {
    .grid-values {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  @media (min-width: 1025px) {
    .grid-values {
      grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
    }
  }

  /* Ultra-wide screen support */
  @media (min-width: 1920px) {
    :root {
      --container-max: 1600px;
    }
  }

  /* Very small screens */
  @media (max-width: 480px) {
    :root {
      --text-tiny: clamp(0.6rem, 1.6vw, 0.8rem);
    }
  }
`;

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

// Enhanced Timeline Component
const TimelineItem = ({ year, title, description, icon, delay = 0 }) => (
  <div className="timeline-item" style={{
    animation: `fadeInLeft 0.8s ease-out ${delay}s both`
  }}>
    <div className="timeline-icon" style={{
      animation: 'pulse 3s ease-in-out infinite, float 6s ease-in-out infinite'
    }}>
      <span style={{
        position: 'relative',
        zIndex: 2,
        filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))',
        transform: 'scale(1.1)'
      }}>
        {icon}
      </span>
    </div>
    <div className="timeline-content">
      <div style={{
        color: '#FF6B35',
        fontWeight: 'bold',
        fontSize: 'clamp(14px, 2.5vw, 16px)',
        marginBottom: 'clamp(6px, 1.5vw, 8px)'
      }}>
        {year}
      </div>
      <h4 style={{
        color: '#333',
        fontSize: 'clamp(16px, 3vw, 20px)',
        fontWeight: 'bold',
        marginBottom: 'clamp(8px, 2vw, 12px)',
        margin: 0
      }}>
        {title}
      </h4>
      <p style={{
        color: '#666',
        margin: 0,
        fontSize: 'var(--text-base)',
        lineHeight: '1.6'
      }}>
        {description}
      </p>
    </div>
  </div>
);

// Enhanced Stats Counter
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
      style={{
        textAlign: 'center',
        padding: 'var(--card-padding)',
        background: 'linear-gradient(145deg, #ffffff, #fff8f0)',
        borderRadius: 'var(--border-radius)',
        boxShadow: '0 8px 24px rgba(255, 107, 53, 0.12)',
        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        border: '1px solid rgba(255, 107, 53, 0.1)',
        cursor: 'pointer',
        minHeight: 'clamp(140px, 20vw, 180px)',
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
      <p style={{
        color: '#666',
        fontWeight: '600',
        margin: 0,
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
        fontSize: 'var(--text-base)'
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
        {/* Clean animated background particles */}
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              width: `${Math.random() * 4 + 2}px`,
              height: `${Math.random() * 4 + 2}px`,
              background: 'rgba(255,107,53,0.2)',
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
          }}>
            <img
              src={logo}
              alt="Syed Solar Energy Logo"
              style={{
                width: 'clamp(80px, 15vw, 120px)',
                height: "auto",
                margin: "clamp(20px, 3vw, 25px) auto clamp(15px, 2vw, 20px) auto",
                borderRadius: 'var(--border-radius)',
                boxShadow: "0 12px 32px rgba(255, 107, 53, 0.2)",
                border: '3px solid #FF6B35',
                transition: 'all 0.3s ease',
                animation: 'pulse 3s ease-in-out infinite'
              }}
              onMouseEnter={(e) => {
                if (window.innerWidth > 768) {
                  e.target.style.transform = 'scale(1.05)';
                  e.target.style.boxShadow = '0 16px 40px rgba(255, 107, 53, 0.3)';
                }
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'scale(1)';
                e.target.style.boxShadow = '0 12px 32px rgba(255, 107, 53, 0.2)';
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
            <p style={{
              color: '#666',
              margin: 0,
              fontStyle: 'italic',
              fontSize: 'var(--text-base)'
            }}>
              "Illuminating the bright path of clean energy journey"
            </p>
          </Card3D>

          {/* Company Journey Timeline */}
          <div style={{ marginBottom: 'var(--section-padding)' }}>
            <SectionHeader title="Our Journey" />

            <div className="timeline-container">
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

            <div className="grid-auto" style={{ gap: 'clamp(20px, 4vw, 30px)' }}>
              {[{
                key: 'mission',
                title: 'Our Mission',
                text: 'To empower every household and business with reliable, clean, and sustainable solar energy solutions tailored for the future.',
                delay: '0.2s'
              },{
                key: 'vision',
                title: 'Our Vision',
                text: 'To be the leading solar energy provider in Pakistan, driving innovation, energy independence, and environmental sustainability through excellence in service and technology.',
                delay: '0.4s'
              },{
                key: 'values',
                title: 'Our Values',
                isValues: true,
                valuesList: [
                  { title: 'Quality', desc: 'Premium products and services' },
                  { title: 'Trust', desc: 'Transparent and honest dealings' },
                  { title: 'Innovation', desc: 'Cutting-edge solar technology' },
                  { title: 'Sustainability', desc: 'Protecting our environment' }
                ],
                delay: '0.6s'
              }].map(({ key, title, text, isValues, valuesList, delay }) => (
                <Card3D key={key} style={{
                  padding: 'var(--card-padding)',
                  textAlign: 'center',
                  animation: `fadeInUp 0.8s ease-out ${delay} both`,
                  minHeight: 'clamp(280px, 35vw, 350px)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center'
                }}>
                  <h3 style={{
                    color: "#FF6B35",
                    fontWeight: 800,
                    fontSize: 'var(--heading-3)',
                    margin: 0,
                    marginBottom: 'clamp(16px, 2.5vw, 20px)'
                  }}>
                    {title}
                  </h3>

                  {isValues
                    ? <div className="grid-values">
                        {valuesList.map((v, i) => (
                          <div key={i} style={{
                            background: 'rgba(255, 107, 53, 0.05)',
                            padding: 'clamp(12px, 2.5vw, 16px)',
                            borderRadius: 'clamp(8px, 1.5vw, 12px)',
                            border: '1px solid rgba(255, 107, 53, 0.1)',
                            textAlign: 'left'
                          }}>
                            <div style={{
                              color: '#FF6B35',
                              fontWeight: 'bold',
                              fontSize: 'clamp(14px, 2.5vw, 16px)',
                              marginBottom: 'clamp(4px, 1vw, 6px)'
                            }}>
                              {v.title}
                            </div>
                            <p style={{
                              color: "#333",
                              margin: 0,
                              lineHeight: 1.4,
                              fontSize: 'var(--text-small)'
                            }}>
                              {v.desc}
                            </p>
                          </div>
                        ))}
                      </div>
                    : <p style={{
                        color: "#333",
                        fontWeight: 500,
                        margin: 0,
                        lineHeight: 1.6,
                        fontSize: 'var(--text-base)'
                      }}>
                        {text}
                      </p>
                  }
                </Card3D>
              ))}
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
                animation: 'fadeInLeft 0.8s ease-out 0.2s both',
                maxWidth: '100%',
                width: '100%'
              }}>
                <div style={{
                  position: 'relative',
                  marginBottom: 'clamp(16px, 3vw, 24px)'
                }}>
                  <img
                    src={aqibImg}
                    alt="Engr. Muhammad Aqib Afridi"
                    style={{
                      width: 'clamp(100px, 18vw, 140px)',
                      height: 'clamp(120px, 22vw, 160px)',
                      objectFit: "cover",
                      borderRadius: 'var(--border-radius)',
                      border: "3px solid #FF6B35",
                      background: "#fff6ec",
                      boxShadow: "0 12px 32px rgba(255, 107, 53, 0.2)",
                      transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                      if (window.innerWidth > 768) {
                        e.target.style.transform = 'scale(1.03)';
                        e.target.style.boxShadow = '0 16px 40px rgba(255, 107, 53, 0.3)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = 'scale(1)';
                      e.target.style.boxShadow = '0 12px 32px rgba(255, 107, 53, 0.2)';
                    }}
                  />
                </div>

                <h4 style={{ 
                  background: 'linear-gradient(45deg, #FF6B35, #F7931E)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  fontWeight: 800, 
                  fontSize: 'clamp(18px, 3.5vw, 22px)', 
                  margin: "0 0 clamp(8px, 2vw, 12px) 0",
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
                    borderRadius: 'var(--border-radius)',
                    border: '2px solid #F7931E',
                    marginBottom: 'clamp(8px, 1.5vw, 12px)'
                  }}>
                    <strong>Founder</strong>
                  </div>
                  <span style={{ 
                    fontWeight: 500, 
                    color: "#666",
                    fontSize: 'var(--text-small)'
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
                  <p style={{
                    color: "#333",
                    fontWeight: 500,
                    margin: 'clamp(12px, 2vw, 16px) 0 0 0',
                    fontStyle: 'italic',
                    fontSize: 'var(--text-base)',
                    lineHeight: '1.6'
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
                animation: 'fadeInRight 0.8s ease-out 0.4s both',
                maxWidth: '100%',
                width: '100%'
              }}>
                <div style={{
                  position: 'relative',
                  marginBottom: 'clamp(16px, 3vw, 24px)'
                }}>
                  <img
                    src={zubairImg}
                    alt="Engr. M Zubair Afridi"
                    style={{
                      width: 'clamp(100px, 18vw, 140px)',
                      height: 'clamp(120px, 22vw, 160px)',
                      objectFit: "cover",
                      borderRadius: 'var(--border-radius)',
                      border: "3px solid #FF6B35",
                      background: "#fff6ec",
                      boxShadow: "0 12px 32px rgba(255, 107, 53, 0.2)",
                      transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                      if (window.innerWidth > 768) {
                        e.target.style.transform = 'scale(1.03)';
                        e.target.style.boxShadow = '0 16px 40px rgba(255, 107, 53, 0.3)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = 'scale(1)';
                      e.target.style.boxShadow = '0 12px 32px rgba(255, 107, 53, 0.2)';
                    }}
                  />
                </div>

                <h4 style={{ 
                  background: 'linear-gradient(45deg, #FF6B35, #F7931E)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  fontWeight: 800, 
                  fontSize: 'clamp(18px, 3.5vw, 22px)', 
                  margin: "0 0 clamp(8px, 2vw, 12px) 0",
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
                    fontSize: 'clamp(10px, 2vw, 12px)',
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
                    borderRadius: 'var(--border-radius)',
                    border: '2px solid #F7931E',
                    marginBottom: 'clamp(8px, 1.5vw, 12px)'
                  }}>
                    <strong>CEO</strong>
                  </div>
                  <span style={{ 
                    fontWeight: 500, 
                    color: "#666",
                    fontSize: 'var(--text-small)'
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
                  <p style={{
                    color: "#333",
                    fontWeight: 500,
                    margin: 'clamp(12px, 2vw, 16px) 0 0 0',
                    fontStyle: 'italic',
                    fontSize: 'var(--text-base)',
                    lineHeight: '1.6'
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
          }}>
            {/* Clean animated background elements */}
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
                style={{
                  background: 'rgba(255,255,255,0.9)',
                  color: '#FF6600',
                  border: 'none',
                  padding: 'clamp(12px, 2.5vw, 16px) clamp(20px, 4vw, 28px)',
                  borderRadius: 'clamp(20px, 4vw, 30px)',
                  fontSize: 'var(--text-base)',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  minWidth: 'clamp(160px, 35vw, 200px)',
                  flexShrink: 0
                }}
                onMouseEnter={(e) => {
                  if (window.innerWidth > 768) {
                    e.target.style.transform = 'scale(1.03)';
                    e.target.style.boxShadow = '0 6px 20px rgba(0,0,0,0.3)';
                  }
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'scale(1)';
                  e.target.style.boxShadow = 'none';
                }}
              >
                🚀 Get Free Quote
              </button>
              <button
                onClick={() => window.open('https://wa.me/923075506695?text=Hi! I would like to learn more about Syed Solar Energy and your services.', '_blank')}
                style={{
                  background: 'transparent',
                  color: 'white',
                  border: '2px solid rgba(255,255,255,0.8)',
                  padding: 'clamp(10px, 2.2vw, 14px) clamp(20px, 4vw, 26px)',
                  borderRadius: 'clamp(20px, 4vw, 30px)',
                  fontSize: 'var(--text-base)',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  minWidth: 'clamp(160px, 35vw, 200px)',
                  flexShrink: 0
                }}
                onMouseEnter={(e) => {
                  if (window.innerWidth > 768) {
                    e.target.style.background = 'rgba(255,255,255,0.1)';
                    e.target.style.borderColor = 'white';
                  }
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'transparent';
                  e.target.style.borderColor = 'rgba(255,255,255,0.8)';
                }}
              >
                📞 Contact Us
              </button>
            </div>
          </Card3D>
        </div>
      </section>

      {/* Use imported Footer component */}
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
              opacity: 0.8; 
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
              transform: translateY(clamp(-8px, -1.5vw, -10px)); 
            }
          }

          /* Enhanced Mobile Support */
          @media (max-width: 480px) {
            .timeline-item {
              margin-bottom: clamp(16px, 4vw, 24px) !important;
            }
            
            .grid-leadership {
              gap: clamp(16px, 4vw, 24px) !important;
            }
            
            .grid-values {
              gap: clamp(8px, 2vw, 12px) !important;
            }
          }

          @media (min-width: 481px) and (max-width: 768px) {
            .timeline-item {
              margin-bottom: clamp(24px, 5vw, 32px);
            }
          }

          /* High contrast mode support */
          @media (prefers-contrast: high) {
            .timeline-content,
            .grid-values > div {
              border: 2px solid #333 !important;
            }
          }

          /* Reduced motion support */
          @media (prefers-reduced-motion: reduce) {
            * {
              animation-duration: 0.01ms !important;
              animation-iteration-count: 1 !important;
              transition-duration: 0.01ms !important;
              scroll-behavior: auto !important;
            }
          }

          /* Focus management for accessibility */
          button:focus-visible {
            outline: 3px solid #FF6B35;
            outline-offset: 2px;
          }

          .timeline-content:focus-visible,
          img:focus-visible {
            outline: 2px solid #FF6B35;
            outline-offset: 2px;
          }

          /* Print styles */
          @media print {
            .floating-particle {
              display: none !important;
            }
            
            .timeline-content,
            .grid-values > div {
              box-shadow: none !important;
              border: 1px solid #333 !important;
            }
          }

          /* Dark mode support */
          @media (prefers-color-scheme: dark) {
            :root {
              --text-color: #e0e0e0;
              --bg-color: #1a1a1a;
            }
          }

          /* Smooth scrolling */
          html {
            scroll-behavior: smooth;
          }

          /* High DPI display optimizations */
          @media (-webkit-min-device-pixel-ratio: 2), (min-resolution: 2dppx) {
            img {
              image-rendering: -webkit-optimize-contrast;
              image-rendering: crisp-edges;
            }
          }
        `}
      </style>
    </>
  );
}