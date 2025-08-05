import React, { useEffect, useState } from "react";
import logo from "../assets/logo.png";
import aqibImg from "../assets/aqib.png";
import zubairImg from "../assets/zubair.png";
import Footer from "../components/Footer";
import "../styles/Responsive.css";

// CSS Variables
const cssVariables = `
  :root {
    --primary-orange: #FF6B35;
    --secondary-orange: #F7931E;
    --font-size-base: clamp(14px, 1.8vw, 18px);
    --padding-base: clamp(10px, 3vw, 40px);
    --section-padding: clamp(30px, 5vw, 60px);
    --card-padding: clamp(20px, 3vw, 40px);
    --heading-1: clamp(1.8rem, 4vw, 2.5rem);
    --heading-2: clamp(1.5rem, 3.5vw, 2.2rem);
    --heading-3: clamp(1.2rem, 3vw, 1.8rem);
    --text-base: clamp(0.9rem, 1.8vw, 1.1rem);
    --stat-number: clamp(1.8rem, 5vw, 2.5rem);
  }
`;

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
    className={`responsive-card ${className}`}
  >
    {children}
  </div>
);

// Animated Timeline Component
const TimelineItem = ({ year, title, description, icon, delay = 0 }) => (
  <div className="timeline-item" style={{
    display: 'flex',
    alignItems: 'center',
    marginBottom: 'clamp(20px, 3vw, 40px)',
    animation: `fadeInLeft 0.8s ease-out ${delay}s both`
  }}>
    <div className="timeline-icon" style={{
      width: 'clamp(60px, 8vw, 80px)',
      height: 'clamp(60px, 8vw, 80px)',
      background: 'linear-gradient(135deg, #FF6B35, #F7931E)',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: 'clamp(18px, 3vw, 24px)',
      marginRight: 'clamp(15px, 3vw, 30px)',
      boxShadow: '0 10px 30px rgba(255, 107, 53, 0.3)',
      animation: 'pulse 3s ease-in-out infinite'
    }}>
      {icon}
    </div>
    <div style={{ flex: 1 }}>
      <div style={{
        background: 'linear-gradient(135deg, #ffffff, #fff8f0)',
        padding: 'clamp(15px, 3vw, 25px)',
        borderRadius: '15px',
        boxShadow: '0 5px 20px rgba(255, 107, 53, 0.1)',
        border: '1px solid rgba(255, 107, 53, 0.1)'
      }}>
        <div style={{
          color: '#FF6B35',
          fontWeight: 'bold',
          fontSize: 'clamp(16px, 2vw, 18px)',
          marginBottom: '5px'
        }}>
          {year}
        </div>
        <h4 style={{
          color: '#333',
          fontSize: 'clamp(18px, 2.5vw, 20px)',
          fontWeight: 'bold',
          marginBottom: '10px',
          margin: 0
        }}>
          {title}
        </h4>
        <p style={{
          color: '#666',
          fontSize: 'clamp(14px, 1.8vw, 16px)',
          margin: 0,
          lineHeight: '1.6'
        }}>
          {description}
        </p>
      </div>
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
      { threshold: 0.5 }
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
        padding: 'clamp(20px, 2.5vw, 30px) clamp(15px, 2vw, 20px)',
        background: 'linear-gradient(145deg, #ffffff, #fff8f0)',
        borderRadius: '20px',
        boxShadow: '0 10px 25px rgba(255, 107, 53, 0.1)',
        transition: 'all 0.4s ease',
        border: '1px solid rgba(255, 107, 53, 0.1)',
        cursor: 'pointer'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-10px)';
        e.currentTarget.style.boxShadow = '0 20px 40px rgba(255, 107, 53, 0.2)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 10px 25px rgba(255, 107, 53, 0.1)';
      }}
    >
      <div style={{
        fontSize: 'clamp(30px, 5vw, 40px)',
        marginBottom: 'clamp(10px, 2vw, 15px)',
        animation: 'bounce 2s ease-in-out infinite'
      }}>
        {icon}
      </div>
      <div style={{
        fontSize: 'var(--stat-number)',
        fontWeight: 'bold',
        color: color,
        marginBottom: 'clamp(5px, 1.5vw, 10px)',
        background: `linear-gradient(45deg, ${color}, #F7931E)`,
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text'
      }}>
        {count}+
      </div>
      <p style={{
        color: '#666',
        fontSize: 'clamp(14px, 1.8vw, 16px)',
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

export default function About() {
  return (
    <>
      <style>{cssVariables}</style>
      
      <section style={{
        background: `
          radial-gradient(circle at 20% 50%, rgba(255, 107, 53, 0.1) 0%, transparent 50%),
          radial-gradient(circle at 80% 20%, rgba(247, 147, 30, 0.1) 0%, transparent 50%),
          radial-gradient(circle at 40% 80%, rgba(255, 152, 0, 0.1) 0%, transparent 50%),
          linear-gradient(135deg, #f8faff 0%, #fff3e0 25%, #ffe0b2 50%, #ffcc80 75%, #ffb74d 100%)
        `,
        minHeight: "100vh",
        padding: "var(--padding-base)",
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Animated background particles */}
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="floating-particle"
            style={{
              position: 'absolute',
              width: `${Math.random() * 8 + 4}px`,
              height: `${Math.random() * 8 + 4}px`,
              background: 'rgba(255,107,53,0.3)',
              borderRadius: '50%',
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animation: `floatingParticles ${Math.random() * 15 + 10}s linear infinite ${Math.random() * 5}s`
            }}
          />
        ))}

        <div className="container" style={{
          maxWidth: 1200,
          margin: "0 auto",
          position: 'relative',
          zIndex: 1
        }}>
          {/* Enhanced Logo and Title Section */}
          <Card3D style={{
            maxWidth: 700,
            margin: "0 auto clamp(30px, 5vw, 50px) auto",
            padding: "clamp(30px, 4vw, 50px) clamp(25px, 3vw, 40px)",
            textAlign: "center",
            position: 'relative',
            overflow: 'visible',
            animation: 'fadeInUp 0.8s ease-out'
          }}>
            {/* Decorative elements */}
            <div style={{
              position: 'absolute',
              top: 'clamp(-15px, -2vw, -20px)',
              left: '50%',
              transform: 'translateX(-50%)',
              width: 'clamp(45px, 6vw, 60px)',
              height: 'clamp(45px, 6vw, 60px)',
              background: 'linear-gradient(45deg, #FF6B35, #F7931E)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 'clamp(18px, 3vw, 24px)',
              boxShadow: '0 10px 30px rgba(255, 107, 53, 0.3)'
            }}>
              ⚡
            </div>

            <img
              src={logo}
              alt="Syed Solar Energy Logo"
              className="logo-hover"
              style={{
                width: 'clamp(80px, 12vw, 120px)',
                height: "auto",
                margin: "clamp(15px, 2vw, 20px) auto clamp(10px, 1.5vw, 15px) auto",
                borderRadius: 20,
                boxShadow: "0 15px 40px rgba(255, 107, 53, 0.2)",
                border: '3px solid #FF6B35',
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
              marginBottom: 'clamp(10px, 1.5vw, 15px)',
              textShadow: '0 4px 8px rgba(255, 107, 53, 0.1)'
            }}>
              About Syed Solar Energy
            </h1>
            <div style={{ 
              fontSize: 'clamp(18px, 2.5vw, 22px)', 
              color: "#333", 
              marginBottom: 'clamp(10px, 1.5vw, 15px)',
              fontWeight: '600',
              background: 'linear-gradient(135deg, #fff7e6, #ffffff)',
              padding: 'clamp(10px, 2vw, 15px) clamp(20px, 3vw, 25px)',
              borderRadius: '15px',
              border: '2px solid #F7931E',
              boxShadow: '0 5px 15px rgba(247, 147, 30, 0.2)'
            }}>
              صاف توانائی کے سفر کا روشن راستہ
            </div>
            <p style={{
              fontSize: 'var(--text-base)',
              color: '#666',
              lineHeight: '1.6',
              margin: 0,
              fontStyle: 'italic'
            }}>
              "Illuminating the bright path of clean energy journey"
            </p>
          </Card3D>

          {/* Company Journey Timeline */}
          <div style={{
            margin: "0 auto clamp(40px, 6vw, 60px) auto",
            maxWidth: 1000
          }}>
            <h2 style={{
              textAlign: 'center',
              fontSize: 'var(--heading-2)',
              fontWeight: 'bold',
              marginBottom: 'clamp(30px, 5vw, 50px)',
              background: 'linear-gradient(45deg, #FF6B35, #F7931E)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              position: 'relative'
            }}>
              Our Journey
              <div style={{
                position: 'absolute',
                bottom: 'clamp(-10px, -1.5vw, -15px)',
                left: '50%',
                transform: 'translateX(-50%)',
                width: 'clamp(80px, 12vw, 120px)',
                height: '4px',
                background: 'linear-gradient(45deg, #FF6B35, #F7931E)',
                borderRadius: '2px'
              }}></div>
            </h2>

            <div style={{ padding: '0 clamp(10px, 2vw, 20px)' }}>
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
          <div style={{
            margin: "0 auto clamp(40px, 6vw, 60px) auto",
            maxWidth: 1100,
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(300px, 100%), 1fr))',
            gap: 'clamp(20px, 3vw, 40px)',
            padding: '0 clamp(10px, 2vw, 20px)'
          }}>
            <Card3D style={{
              padding: "var(--card-padding)",
              textAlign: 'center',
              position: 'relative',
              animation: 'fadeInUp 0.8s ease-out 0.2s both'
            }}>
              <div style={{
                position: 'absolute',
                top: 'clamp(-20px, -2.5vw, -25px)',
                left: '50%',
                transform: 'translateX(-50%)',
                width: 'clamp(40px, 5vw, 50px)',
                height: 'clamp(40px, 5vw, 50px)',
                background: 'linear-gradient(45deg, #FF6B35, #F7931E)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 'clamp(16px, 2.5vw, 20px)',
                boxShadow: '0 8px 25px rgba(255, 107, 53, 0.3)'
              }}>
                🎯
              </div>
              <h3 style={{
                color: "#FF6B35",
                fontWeight: 800,
                fontSize: 'var(--heading-3)',
                marginTop: 'clamp(25px, 3.5vw, 35px)',
                marginBottom: 'clamp(15px, 2vw, 20px)',
                letterSpacing: ".01em"
              }}>
                Our Mission
              </h3>
              <p style={{
                color: "#333",
                fontSize: 'var(--text-base)',
                fontWeight: 500,
                lineHeight: 1.7,
                margin: 0
              }}>
                To empower every household and business with reliable, clean, and sustainable solar energy solutions tailored for the future.
              </p>
            </Card3D>

            <Card3D style={{
              padding: "var(--card-padding)",
              textAlign: 'center',
              position: 'relative',
              animation: 'fadeInUp 0.8s ease-out 0.4s both'
            }}>
              <div style={{
                position: 'absolute',
                top: 'clamp(-20px, -2.5vw, -25px)',
                left: '50%',
                transform: 'translateX(-50%)',
                width: 'clamp(40px, 5vw, 50px)',
                height: 'clamp(40px, 5vw, 50px)',
                background: 'linear-gradient(45deg, #FF6B35, #F7931E)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 'clamp(16px, 2.5vw, 20px)',
                boxShadow: '0 8px 25px rgba(255, 107, 53, 0.3)'
              }}>
                🔮
              </div>
              <h3 style={{
                color: "#FF6B35",
                fontWeight: 800,
                fontSize: 'var(--heading-3)',
                marginTop: 'clamp(25px, 3.5vw, 35px)',
                marginBottom: 'clamp(15px, 2vw, 20px)',
                letterSpacing: ".01em"
              }}>
                Our Vision
              </h3>
              <p style={{
                color: "#333",
                fontSize: 'var(--text-base)',
                fontWeight: 500,
                lineHeight: 1.7,
                margin: 0
              }}>
                To be the leading solar energy provider in Pakistan, driving innovation, energy independence, and environmental sustainability through excellence in service and technology.
              </p>
            </Card3D>

            <Card3D style={{
              padding: "var(--card-padding)",
              textAlign: 'center',
              position: 'relative',
              animation: 'fadeInUp 0.8s ease-out 0.6s both'
            }}>
              <div style={{
                position: 'absolute',
                top: 'clamp(-20px, -2.5vw, -25px)',
                left: '50%',
                transform: 'translateX(-50%)',
                width: 'clamp(40px, 5vw, 50px)',
                height: 'clamp(40px, 5vw, 50px)',
                background: 'linear-gradient(45deg, #FF6B35, #F7931E)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 'clamp(16px, 2.5vw, 20px)',
                boxShadow: '0 8px 25px rgba(255, 107, 53, 0.3)'
              }}>
                💎
              </div>
              <h3 style={{
                color: "#FF6B35",
                fontWeight: 800,
                fontSize: 'var(--heading-3)',
                marginTop: 'clamp(25px, 3.5vw, 35px)',
                marginBottom: 'clamp(15px, 2vw, 20px)',
                letterSpacing: ".01em"
              }}>
                Our Values
              </h3>
              <div style={{
                color: "#333",
                fontSize: 'var(--text-base)',
                fontWeight: 500,
                lineHeight: 1.6,
                textAlign: 'left'
              }}>
                <div style={{ marginBottom: 'clamp(8px, 1.5vw, 10px)', display: 'flex', alignItems: 'center' }}>
                  <span style={{ marginRight: '10px', fontSize: 'clamp(16px, 2vw, 18px)' }}>✨</span>
                  <strong>Quality:</strong> Premium products and services
                </div>
                <div style={{ marginBottom: 'clamp(8px, 1.5vw, 10px)', display: 'flex', alignItems: 'center' }}>
                  <span style={{ marginRight: '10px', fontSize: 'clamp(16px, 2vw, 18px)' }}>🤝</span>
                  <strong>Trust:</strong> Transparent and honest dealings
                </div>
                <div style={{ marginBottom: 'clamp(8px, 1.5vw, 10px)', display: 'flex', alignItems: 'center' }}>
                  <span style={{ marginRight: '10px', fontSize: 'clamp(16px, 2vw, 18px)' }}>🚀</span>
                  <strong>Innovation:</strong> Cutting-edge solar technology
                </div>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <span style={{ marginRight: '10px', fontSize: 'clamp(16px, 2vw, 18px)' }}>🌱</span>
                  <strong>Sustainability:</strong> Protecting our environment
                </div>
              </div>
            </Card3D>
          </div>

          {/* Enhanced Stats Section */}
          <div style={{
            margin: "0 auto clamp(40px, 6vw, 60px) auto",
            maxWidth: 1000,
            padding: '0 clamp(10px, 2vw, 20px)'
          }}>
            <h2 style={{
              textAlign: 'center',
              fontSize: 'var(--heading-2)',
              fontWeight: 'bold',
              marginBottom: 'clamp(30px, 5vw, 50px)',
              background: 'linear-gradient(45deg, #FF6B35, #F7931E)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              position: 'relative'
            }}>
              Our Impact in Numbers
              <div style={{
                position: 'absolute',
                bottom: 'clamp(-10px, -1.5vw, -15px)',
                left: '50%',
                transform: 'translateX(-50%)',
                width: 'clamp(120px, 15vw, 150px)',
                height: '4px',
                background: 'linear-gradient(45deg, #FF6B35, #F7931E)',
                borderRadius: '2px'
              }}></div>
            </h2>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(180px, 100%), 1fr))',
              gap: 'clamp(20px, 3vw, 30px)'
            }}>
              <StatCard number="26" label="Years Experience" icon="📅" color="#FF6B35" />
              <StatCard number="1500" label="Happy Customers" icon="😊" color="#F7931E" />
              <StatCard number="2000" label="Projects Completed" icon="✅" color="#FF9800" />
              <StatCard number="50" label="Expert Technicians" icon="👷" color="#FF6600" />
            </div>
          </div>

          {/* Enhanced Leadership Cards */}
          <div style={{
            margin: "0 auto clamp(30px, 5vw, 40px) auto",
            maxWidth: 1100,
            padding: '0 clamp(10px, 2vw, 20px)'
          }}>
            <h2 style={{
              textAlign: 'center',
              fontSize: 'var(--heading-2)',
              fontWeight: 'bold',
              marginBottom: 'clamp(30px, 5vw, 50px)',
              background: 'linear-gradient(45deg, #FF6B35, #F7931E)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              position: 'relative'
            }}>
              Meet Our Leadership
              <div style={{
                position: 'absolute',
                bottom: 'clamp(-10px, -1.5vw, -15px)',
                left: '50%',
                transform: 'translateX(-50%)',
                width: 'clamp(110px, 14vw, 140px)',
                height: '4px',
                background: 'linear-gradient(45deg, #FF6B35, #F7931E)',
                borderRadius: '2px'
              }}></div>
            </h2>

            <div style={{
              display: "flex",
              gap: 'clamp(20px, 4vw, 50px)',
              flexWrap: "wrap",
              justifyContent: "center",
              alignItems: "stretch"
            }}>
              {/* Enhanced Aqib Card */}
              <Card3D style={{
                padding: "clamp(25px, 3.5vw, 40px) clamp(20px, 3vw, 35px) clamp(20px, 2.5vw, 30px)",
                flex: "1 1 min(400px, 100%)",
                minWidth: 'min(300px, 100%)',
                textAlign: "center",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                position: 'relative',
                animation: 'fadeInLeft 0.8s ease-out 0.2s both'
              }}>
                {/* Background decoration */}
                <div style={{
                  position: 'absolute',
                  top: 'clamp(15px, 2vw, 20px)',
                  right: 'clamp(15px, 2vw, 20px)',
                  width: 'clamp(40px, 6vw, 60px)',
                  height: 'clamp(40px, 6vw, 60px)',
                  background: 'linear-gradient(45deg, rgba(255, 107, 53, 0.1), rgba(247, 147, 30, 0.1))',
                  borderRadius: '50%',
                  animation: 'pulse 3s ease-in-out infinite'
                }}></div>

                <div style={{
                  position: 'relative',
                  marginBottom: 'clamp(15px, 2.5vw, 25px)'
                }}>
                  <img
                    src={aqibImg}
                    alt="Engr. Muhammad Aqib Afridi"
                    className="profile-hover"
                    style={{
                      width: 'clamp(100px, 14vw, 140px)',
                      height: 'clamp(120px, 16vw, 160px)',
                      objectFit: "cover",
                      borderRadius: 20,
                      border: "4px solid #FF6B35",
                      background: "#fff6ec",
                      boxShadow: "0 15px 40px rgba(255, 107, 53, 0.2)",
                      transition: 'all 0.3s ease'
                    }}
                  />
                  <div style={{
                    position: 'absolute',
                    bottom: 'clamp(-8px, -1vw, -10px)',
                    right: 'clamp(-8px, -1vw, -10px)',
                    width: 'clamp(30px, 4vw, 40px)',
                    height: 'clamp(30px, 4vw, 40px)',
                    background: 'linear-gradient(45deg, #FF6B35, #F7931E)',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 'clamp(14px, 2vw, 18px)',
                    boxShadow: '0 5px 15px rgba(255, 107, 53, 0.3)'
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
                  fontSize: 'clamp(18px, 2.5vw, 22px)', 
                  margin: "0 0 clamp(5px, 1vw, 8px) 0" 
                }}>
                  Engr. Muhammad Aqib Afridi
                </h4>
                <div style={{ 
                  fontSize: 'var(--text-base)', 
                  fontWeight: 600, 
                  color: "#444",
                  marginBottom: 'clamp(15px, 2vw, 20px)'
                }}>
                  <div style={{
                    background: 'linear-gradient(135deg, #fff7e6, #ffffff)',
                    padding: 'clamp(8px, 1.5vw, 10px) clamp(15px, 2vw, 20px)',
                    borderRadius: '10px',
                    border: '2px solid #F7931E',
                    marginBottom: 'clamp(8px, 1.5vw, 10px)'
                  }}>
                    <strong>Founder</strong>
                  </div>
                  <span style={{ fontWeight: 500, color: "#666", fontSize: 'clamp(12px, 1.5vw, 14px)' }}>
                    BSc Electrical Engineering, SUIT Peshawar
                  </span>
                </div>
                
                <div style={{
                  marginTop: 'clamp(15px, 2.5vw, 20px)',
                  background: "linear-gradient(135deg, #fff6ec, #ffffff)",
                  borderLeft: "6px solid #FF6B35",
                  borderRadius: 15,
                  boxShadow: "0 8px 25px rgba(255, 107, 53, 0.1)",
                  padding: "clamp(20px, 2.5vw, 25px) clamp(20px, 2.5vw, 25px) clamp(15px, 2vw, 20px)",
                  textAlign: "left",
                  position: 'relative'
                }}>
                  <div style={{
                    position: 'absolute',
                    top: 'clamp(-8px, -1vw, -10px)',
                    left: 'clamp(15px, 2vw, 20px)',
                    background: '#FF6B35',
                    color: 'white',
                    padding: 'clamp(4px, 0.8vw, 5px) clamp(10px, 1.5vw, 15px)',
                    borderRadius: '15px',
                    fontSize: 'clamp(10px, 1.5vw, 12px)',
                    fontWeight: 'bold',
                    textTransform: 'uppercase'
                  }}>
                    Founder's Message
                  </div>
                  <p style={{
                    color: "#333",
                    fontSize: 'var(--text-base)',
                    fontWeight: 500,
                    margin: 'clamp(10px, 2vw, 15px) 0 0 0',
                    lineHeight: 1.6,
                    fontStyle: 'italic'
                  }}>
                    "With every project, my goal is to deliver not just energy but peace of mind. Syed Solar Energy was founded to serve every home and business with honesty, quality, and true after-sales support. I thank all our customers for trusting us with their energy needs—your belief in us keeps us moving forward."
                  </p>
                </div>
              </Card3D>

              {/* Enhanced Zubair Card */}
              <Card3D style={{
                padding: "clamp(25px, 3.5vw, 40px) clamp(20px, 3vw, 35px) clamp(20px, 2.5vw, 30px)",
                flex: "1 1 min(400px, 100%)",
                minWidth: 'min(300px, 100%)',
                textAlign: "center",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                position: 'relative',
                animation: 'fadeInRight 0.8s ease-out 0.4s both'
              }}>
                {/* Background decoration */}
                <div style={{
                  position: 'absolute',
                  top: 'clamp(15px, 2vw, 20px)',
                  left: 'clamp(15px, 2vw, 20px)',
                  width: 'clamp(40px, 6vw, 60px)',
                  height: 'clamp(40px, 6vw, 60px)',
                  background: 'linear-gradient(45deg, rgba(247, 147, 30, 0.1), rgba(255, 152, 0, 0.1))',
                  borderRadius: '50%',
                  animation: 'pulse 3s ease-in-out infinite 1s'
                }}></div>

                <div style={{
                  position: 'relative',
                  marginBottom: 'clamp(15px, 2.5vw, 25px)'
                }}>
                  <img
                    src={zubairImg}
                    alt="Engr. M Zubair Afridi"
                    className="profile-hover"
                    style={{
                      width: 'clamp(100px, 14vw, 140px)',
                      height: 'clamp(120px, 16vw, 160px)',
                      objectFit: "cover",
                      borderRadius: 20,
                      border: "4px solid #FF6B35",
                      background: "#fff6ec",
                      boxShadow: "0 15px 40px rgba(255, 107, 53, 0.2)",
                      transition: 'all 0.3s ease'
                    }}
                  />
                  <div style={{
                    position: 'absolute',
                    bottom: 'clamp(-8px, -1vw, -10px)',
                    right: 'clamp(-8px, -1vw, -10px)',
                    width: 'clamp(30px, 4vw, 40px)',
                    height: 'clamp(30px, 4vw, 40px)',
                    background: 'linear-gradient(45deg, #FFD700, #FFA500)',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 'clamp(14px, 2vw, 18px)',
                    boxShadow: '0 5px 15px rgba(255, 215, 0, 0.3)',
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
                  fontSize: 'clamp(18px, 2.5vw, 22px)', 
                  margin: "0 0 clamp(5px, 1vw, 8px) 0",
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexWrap: 'wrap',
                  gap: 'clamp(5px, 1.5vw, 10px)'
                }}>
                  Engr. M Zubair Afridi 
                  <span style={{ 
                    background: 'linear-gradient(45deg, #FFD700, #FFA500)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    fontSize: 'clamp(12px, 1.8vw, 14px)',
                    fontWeight: 'bold',
                    border: '2px solid #FFD700',
                    borderRadius: '15px',
                    padding: 'clamp(3px, 0.8vw, 4px) clamp(5px, 1.2vw, 8px)',
                    animation: 'pulse 2s ease-in-out infinite'
                  }}>
                    Gold Medalist
                  </span>
                </h4>
                
                <div style={{ 
                  fontSize: 'var(--text-base)', 
                  fontWeight: 600, 
                  color: "#444",
                  marginBottom: 'clamp(15px, 2vw, 20px)'
                }}>
                  <div style={{
                    background: 'linear-gradient(135deg, #fff7e6, #ffffff)',
                    padding: 'clamp(8px, 1.5vw, 10px) clamp(15px, 2vw, 20px)',
                    borderRadius: '10px',
                    border: '2px solid #F7931E',
                    marginBottom: 'clamp(8px, 1.5vw, 10px)'
                  }}>
                    <strong>CEO</strong>
                  </div>
                  <span style={{ fontWeight: 500, color: "#666", fontSize: 'clamp(12px, 1.5vw, 14px)' }}>
                    BSc Electrical Engineering, SUIT Peshawar
                  </span>
                </div>
                
                <div style={{
                  marginTop: 'clamp(15px, 2.5vw, 20px)',
                  background: "linear-gradient(135deg, #fff6ec, #ffffff)",
                  borderLeft: "6px solid #FF6B35",
                  borderRadius: 15,
                  boxShadow: "0 8px 25px rgba(255, 107, 53, 0.1)",
                  padding: "clamp(20px, 2.5vw, 25px) clamp(20px, 2.5vw, 25px) clamp(15px, 2vw, 20px)",
                  textAlign: "left",
                  position: 'relative'
                }}>
                  <div style={{
                    position: 'absolute',
                    top: 'clamp(-8px, -1vw, -10px)',
                    left: 'clamp(15px, 2vw, 20px)',
                    background: '#FF6B35',
                    color: 'white',
                    padding: 'clamp(4px, 0.8vw, 5px) clamp(10px, 1.5vw, 15px)',
                    borderRadius: '15px',
                    fontSize: 'clamp(10px, 1.5vw, 12px)',
                    fontWeight: 'bold',
                    textTransform: 'uppercase'
                  }}>
                    CEO's Message
                  </div>
                  <p style={{
                    color: "#333",
                    fontSize: 'var(--text-base)',
                    fontWeight: 500,
                    margin: 'clamp(10px, 2vw, 15px) 0 0 0',
                    lineHeight: 1.6,
                    fontStyle: 'italic'
                  }}>
                    "At Syed Solar Energy, our promise is reliability, transparency, and value for every customer. We are on a mission to make solar energy accessible, affordable, and easy for everyone in Pakistan. Thank you for your support—together, we are lighting the path to a cleaner, brighter future!"
                  </p>
                </div>
              </Card3D>
            </div>
          </div>

          {/* Call to Action Section */}
          <Card3D style={{
            maxWidth: 800,
            margin: "0 auto clamp(30px, 5vw, 40px) auto",
            padding: "clamp(30px, 4vw, 50px) clamp(25px, 3vw, 40px)",
            textAlign: "center",
            background: "linear-gradient(135deg, #FF6B35, #F7931E, #FF9800)",
            color: 'white',
            position: 'relative',
            overflow: 'hidden',
            animation: 'fadeInUp 0.8s ease-out 0.8s both'
          }}>
            {/* Animated background elements */}
            <div style={{
              position: 'absolute',
              top: 'clamp(15px, 2vw, 20px)',
              right: 'clamp(15px, 2vw, 20px)',
              width: 'clamp(50px, 8vw, 80px)',
              height: 'clamp(50px, 8vw, 80px)',
              background: 'rgba(255,255,255,0.1)',
              borderRadius: '50%',
              animation: 'float 6s ease-in-out infinite'
            }}></div>
            <div style={{
              position: 'absolute',
              bottom: 'clamp(15px, 2vw, 20px)',
              left: 'clamp(15px, 2vw, 20px)',
              width: 'clamp(40px, 6vw, 60px)',
              height: 'clamp(40px, 6vw, 60px)',
              background: 'rgba(255,255,255,0.1)',
              borderRadius: '50%',
              animation: 'float 8s ease-in-out infinite reverse'
            }}></div>

            <h2 style={{
              fontSize: 'var(--heading-2)',
              fontWeight: 'bold',
              marginBottom: 'clamp(15px, 2.5vw, 20px)',
              textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
            }}>
              Ready to Go Solar?
            </h2>
            <p style={{
              fontSize: 'clamp(16px, 2.5vw, 20px)',
              marginBottom: 'clamp(20px, 3vw, 30px)',
              opacity: 0.95,
              lineHeight: '1.6'
            }}>
              Join thousands of satisfied customers who have made the switch to clean, renewable energy. 
              Get your free consultation today!
            </p>
            <div style={{
              display: 'flex',
              gap: 'clamp(15px, 2.5vw, 20px)',
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
                  padding: 'clamp(12px, 2vw, 15px) clamp(20px, 3vw, 30px)',
                  borderRadius: '25px',
                  fontSize: 'var(--text-base)',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  minWidth: 'clamp(180px, 30vw, 220px)'
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
                  padding: 'clamp(10px, 1.8vw, 13px) clamp(20px, 3vw, 28px)',
                  borderRadius: '25px',
                  fontSize: 'var(--text-base)',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  minWidth: 'clamp(180px, 30vw, 220px)'
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

      {/* Enhanced CSS Animations */}
      <style>
        {`
          ${cssVariables}
          
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

          @keyframes fadeInLeft {
            0% {
              opacity: 0;
              transform: translateX(-50px);
            }
            100% {
              opacity: 1;
              transform: translateX(0);
            }
          }

          @keyframes fadeInRight {
            0% {
              opacity: 0;
              transform: translateX(50px);
            }
            100% {
              opacity: 1;
              transform: translateX(0);
            }
          }

          @keyframes floatingParticles {
            0% { 
              transform: translateY(0px) translateX(0px) rotate(0deg); 
              opacity: 0.3;
            }
            33% { 
              transform: translateY(-30px) translateX(20px) rotate(120deg); 
              opacity: 0.6;
            }
            66% { 
              transform: translateY(-10px) translateX(-15px) rotate(240deg); 
              opacity: 0.8;
            }
            100% { 
              transform: translateY(0px) translateX(0px) rotate(360deg); 
              opacity: 0.3;
            }
          }

          @keyframes float {
            0%, 100% { 
              transform: translateY(0px) rotate(0deg); 
            }
            33% { 
              transform: translateY(-20px) rotate(5deg); 
            }
            66% { 
              transform: translateY(-10px) rotate(-3deg); 
            }
          }

          @keyframes pulse {
            0%, 100% { 
              transform: scale(1); 
              opacity: 0.8; 
            }
            50% { 
              transform: scale(1.1); 
              opacity: 1; 
            }
          }

          @keyframes bounce {
            0%, 100% { 
              transform: translateY(0px); 
            }
            50% { 
              transform: translateY(-10px); 
            }
          }

          /* Responsive design */
          @media (max-width: 768px) {
            .timeline-item {
              flex-direction: column;
              text-align: center;
            }
            
            .timeline-icon {
              margin-right: 0;
              margin-bottom: 20px;
            }
            
            .cta-button {
              width: 100%;
            }
          }
          
          @media (max-width: 480px) {
            .stat-card {
              min-width: 100%;
            }
            
            .leadership-card {
              min-width: 100%;
            }
          }
          
          /* Hover effects */
          .logo-hover:hover {
            transform: scale(1.05) rotate(3deg) !important;
            box-shadow: 0 20px 50px rgba(255, 107, 53, 0.3) !important;
          }
          
          .profile-hover:hover {
            transform: scale(1.05) !important;
            box-shadow: 0 20px 50px rgba(255, 107, 53, 0.3) !important;
          }
          
          .cta-button:hover {
            transform: scale(1.05);
            box-shadow: 0 8px 25px rgba(0,0,0,0.3);
          }
        `}
      </style>
    </>
  );
}