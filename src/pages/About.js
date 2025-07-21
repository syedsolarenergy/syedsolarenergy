import React, { useEffect, useState } from "react";
import logo from "../assets/logo.png";
import aqibImg from "../assets/aqib.png";
import zubairImg from "../assets/zubair.png";
import Footer from "../components/Footer";

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

// Animated Timeline Component
const TimelineItem = ({ year, title, description, icon, delay = 0 }) => (
  <div style={{
    display: 'flex',
    alignItems: 'center',
    marginBottom: '40px',
    animation: `fadeInLeft 0.8s ease-out ${delay}s both`
  }}>
    <div style={{
      width: '80px',
      height: '80px',
      background: 'linear-gradient(135deg, #FF6B35, #F7931E)',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '24px',
      marginRight: '30px',
      boxShadow: '0 10px 30px rgba(255, 107, 53, 0.3)',
      animation: 'pulse 3s ease-in-out infinite'
    }}>
      {icon}
    </div>
    <div style={{ flex: 1 }}>
      <div style={{
        background: 'linear-gradient(135deg, #ffffff, #fff8f0)',
        padding: '25px',
        borderRadius: '15px',
        boxShadow: '0 5px 20px rgba(255, 107, 53, 0.1)',
        border: '1px solid rgba(255, 107, 53, 0.1)'
      }}>
        <div style={{
          color: '#FF6B35',
          fontWeight: 'bold',
          fontSize: '18px',
          marginBottom: '5px'
        }}>
          {year}
        </div>
        <h4 style={{
          color: '#333',
          fontSize: '20px',
          fontWeight: 'bold',
          marginBottom: '10px',
          margin: 0
        }}>
          {title}
        </h4>
        <p style={{
          color: '#666',
          fontSize: '16px',
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
      style={{
        textAlign: 'center',
        padding: '30px 20px',
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
        fontSize: '40px',
        marginBottom: '15px',
        animation: 'bounce 2s ease-in-out infinite'
      }}>
        {icon}
      </div>
      <div style={{
        fontSize: '36px',
        fontWeight: 'bold',
        color: color,
        marginBottom: '10px',
        background: `linear-gradient(45deg, ${color}, #F7931E)`,
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text'
      }}>
        {count}+
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

export default function About() {
  return (
    <>
      <section style={{
        background: `
          radial-gradient(circle at 20% 50%, rgba(255, 107, 53, 0.1) 0%, transparent 50%),
          radial-gradient(circle at 80% 20%, rgba(247, 147, 30, 0.1) 0%, transparent 50%),
          radial-gradient(circle at 40% 80%, rgba(255, 152, 0, 0.1) 0%, transparent 50%),
          linear-gradient(135deg, #f8faff 0%, #fff3e0 25%, #ffe0b2 50%, #ffcc80 75%, #ffb74d 100%)
        `,
        minHeight: "100vh",
        padding: "40px 20px 60px 20px",
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Animated background particles */}
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
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

        {/* Enhanced Logo and Title Section */}
        <Card3D style={{
          maxWidth: 700,
          margin: "0 auto 50px auto",
          padding: "50px 40px 40px 40px",
          textAlign: "center",
          position: 'relative',
          overflow: 'visible',
          animation: 'fadeInUp 0.8s ease-out'
        }}>
          {/* Decorative elements */}
          <div style={{
            position: 'absolute',
            top: '-20px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '60px',
            height: '60px',
            background: 'linear-gradient(45deg, #FF6B35, #F7931E)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '24px',
            boxShadow: '0 10px 30px rgba(255, 107, 53, 0.3)'
          }}>
            ⚡
          </div>

          <img
            src={logo}
            alt="Syed Solar Energy Logo"
            style={{
              width: 120,
              height: "auto",
              margin: "20px auto 15px auto",
              borderRadius: 20,
              boxShadow: "0 15px 40px rgba(255, 107, 53, 0.2)",
              border: '3px solid #FF6B35',
              transition: 'all 0.3s ease',
              animation: 'pulse 3s ease-in-out infinite'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'scale(1.05) rotate(3deg)';
              e.target.style.boxShadow = '0 20px 50px rgba(255, 107, 53, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'scale(1) rotate(0deg)';
              e.target.style.boxShadow = '0 15px 40px rgba(255, 107, 53, 0.2)';
            }}
          />
          <h1 style={{
            background: 'linear-gradient(45deg, #FF6B35, #F7931E)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            fontWeight: 900,
            fontSize: "2.5rem",
            marginBottom: 15,
            textShadow: '0 4px 8px rgba(255, 107, 53, 0.1)'
          }}>
            About Syed Solar Energy
          </h1>
          <div style={{ 
            fontSize: 22, 
            color: "#333", 
            marginBottom: 15,
            fontWeight: '600',
            background: 'linear-gradient(135deg, #fff7e6, #ffffff)',
            padding: '15px 25px',
            borderRadius: '15px',
            border: '2px solid #F7931E',
            boxShadow: '0 5px 15px rgba(247, 147, 30, 0.2)'
          }}>
            صاف توانائی کے سفر کا روشن راستہ
          </div>
          <p style={{
            fontSize: 18,
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
          maxWidth: 1000,
          margin: "0 auto 60px auto"
        }}>
          <h2 style={{
            textAlign: 'center',
            fontSize: '42px',
            fontWeight: 'bold',
            marginBottom: '50px',
            background: 'linear-gradient(45deg, #FF6B35, #F7931E)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            position: 'relative'
          }}>
            Our Journey
            <div style={{
              position: 'absolute',
              bottom: '-15px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '120px',
              height: '4px',
              background: 'linear-gradient(45deg, #FF6B35, #F7931E)',
              borderRadius: '2px'
            }}></div>
          </h2>

          <div style={{ padding: '0 20px' }}>
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
          maxWidth: 1100,
          margin: "0 auto 60px auto",
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '40px',
          padding: '0 20px'
        }}>
          <Card3D style={{
            padding: "40px 35px",
            textAlign: 'center',
            position: 'relative',
            animation: 'fadeInUp 0.8s ease-out 0.2s both'
          }}>
            <div style={{
              position: 'absolute',
              top: '-25px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '50px',
              height: '50px',
              background: 'linear-gradient(45deg, #FF6B35, #F7931E)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '20px',
              boxShadow: '0 8px 25px rgba(255, 107, 53, 0.3)'
            }}>
              🎯
            </div>
            <h3 style={{
              color: "#FF6B35",
              fontWeight: 800,
              fontSize: 26,
              marginTop: 35,
              marginBottom: 20,
              letterSpacing: ".01em"
            }}>
              Our Mission
            </h3>
            <p style={{
              color: "#333",
              fontSize: 17,
              fontWeight: 500,
              lineHeight: 1.7,
              margin: 0
            }}>
              To empower every household and business with reliable, clean, and sustainable solar energy solutions tailored for the future.
            </p>
          </Card3D>

          <Card3D style={{
            padding: "40px 35px",
            textAlign: 'center',
            position: 'relative',
            animation: 'fadeInUp 0.8s ease-out 0.4s both'
          }}>
            <div style={{
              position: 'absolute',
              top: '-25px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '50px',
              height: '50px',
              background: 'linear-gradient(45deg, #FF6B35, #F7931E)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '20px',
              boxShadow: '0 8px 25px rgba(255, 107, 53, 0.3)'
            }}>
              🔮
            </div>
            <h3 style={{
              color: "#FF6B35",
              fontWeight: 800,
              fontSize: 26,
              marginTop: 35,
              marginBottom: 20,
              letterSpacing: ".01em"
            }}>
              Our Vision
            </h3>
            <p style={{
              color: "#333",
              fontSize: 17,
              fontWeight: 500,
              lineHeight: 1.7,
              margin: 0
            }}>
              To be the leading solar energy provider in Pakistan, driving innovation, energy independence, and environmental sustainability through excellence in service and technology.
            </p>
          </Card3D>

          <Card3D style={{
            padding: "40px 35px",
            textAlign: 'center',
            position: 'relative',
            animation: 'fadeInUp 0.8s ease-out 0.6s both'
          }}>
            <div style={{
              position: 'absolute',
              top: '-25px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '50px',
              height: '50px',
              background: 'linear-gradient(45deg, #FF6B35, #F7931E)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '20px',
              boxShadow: '0 8px 25px rgba(255, 107, 53, 0.3)'
            }}>
              💎
            </div>
            <h3 style={{
              color: "#FF6B35",
              fontWeight: 800,
              fontSize: 26,
              marginTop: 35,
              marginBottom: 20,
              letterSpacing: ".01em"
            }}>
              Our Values
            </h3>
            <div style={{
              color: "#333",
              fontSize: 16,
              fontWeight: 500,
              lineHeight: 1.6,
              textAlign: 'left'
            }}>
              <div style={{ marginBottom: '10px', display: 'flex', alignItems: 'center' }}>
                <span style={{ marginRight: '10px', fontSize: '18px' }}>✨</span>
                <strong>Quality:</strong> Premium products and services
              </div>
              <div style={{ marginBottom: '10px', display: 'flex', alignItems: 'center' }}>
                <span style={{ marginRight: '10px', fontSize: '18px' }}>🤝</span>
                <strong>Trust:</strong> Transparent and honest dealings
              </div>
              <div style={{ marginBottom: '10px', display: 'flex', alignItems: 'center' }}>
                <span style={{ marginRight: '10px', fontSize: '18px' }}>🚀</span>
                <strong>Innovation:</strong> Cutting-edge solar technology
              </div>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <span style={{ marginRight: '10px', fontSize: '18px' }}>🌱</span>
                <strong>Sustainability:</strong> Protecting our environment
              </div>
            </div>
          </Card3D>
        </div>

        {/* Enhanced Stats Section */}
        <div style={{
          maxWidth: 1000,
          margin: "0 auto 60px auto",
          padding: '0 20px'
        }}>
          <h2 style={{
            textAlign: 'center',
            fontSize: '42px',
            fontWeight: 'bold',
            marginBottom: '50px',
            background: 'linear-gradient(45deg, #FF6B35, #F7931E)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            position: 'relative'
          }}>
            Our Impact in Numbers
            <div style={{
              position: 'absolute',
              bottom: '-15px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '150px',
              height: '4px',
              background: 'linear-gradient(45deg, #FF6B35, #F7931E)',
              borderRadius: '2px'
            }}></div>
          </h2>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '30px'
          }}>
            <StatCard number="26" label="Years Experience" icon="📅" color="#FF6B35" />
            <StatCard number="1500" label="Happy Customers" icon="😊" color="#F7931E" />
            <StatCard number="2000" label="Projects Completed" icon="✅" color="#FF9800" />
            <StatCard number="50" label="Expert Technicians" icon="👷" color="#FF6600" />
          </div>
        </div>

        {/* Enhanced Leadership Cards */}
        <div style={{
          maxWidth: 1100,
          margin: "0 auto 40px auto",
          padding: '0 20px'
        }}>
          <h2 style={{
            textAlign: 'center',
            fontSize: '42px',
            fontWeight: 'bold',
            marginBottom: '50px',
            background: 'linear-gradient(45deg, #FF6B35, #F7931E)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            position: 'relative'
          }}>
            Meet Our Leadership
            <div style={{
              position: 'absolute',
              bottom: '-15px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '140px',
              height: '4px',
              background: 'linear-gradient(45deg, #FF6B35, #F7931E)',
              borderRadius: '2px'
            }}></div>
          </h2>

          <div style={{
            display: "flex",
            gap: 50,
            flexWrap: "wrap",
            justifyContent: "center",
            alignItems: "stretch"
          }}>
            {/* Enhanced Aqib Card */}
            <Card3D style={{
              padding: "40px 35px 30px 35px",
              flex: "1 1 400px",
              maxWidth: 450,
              minWidth: 350,
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
                top: '20px',
                right: '20px',
                width: '60px',
                height: '60px',
                background: 'linear-gradient(45deg, rgba(255, 107, 53, 0.1), rgba(247, 147, 30, 0.1))',
                borderRadius: '50%',
                animation: 'pulse 3s ease-in-out infinite'
              }}></div>

              <div style={{
                position: 'relative',
                marginBottom: '25px'
              }}>
                <img
                  src={aqibImg}
                  alt="Engr. Muhammad Aqib Afridi"
                  style={{
                    width: 140,
                    height: 160,
                    objectFit: "cover",
                    borderRadius: 20,
                    border: "4px solid #FF6B35",
                    background: "#fff6ec",
                    boxShadow: "0 15px 40px rgba(255, 107, 53, 0.2)",
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'scale(1.05)';
                    e.target.style.boxShadow = '0 20px 50px rgba(255, 107, 53, 0.3)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'scale(1)';
                    e.target.style.boxShadow = '0 15px 40px rgba(255, 107, 53, 0.2)';
                  }}
                />
                <div style={{
                  position: 'absolute',
                  bottom: '-10px',
                  right: '-10px',
                  width: '40px',
                  height: '40px',
                  background: 'linear-gradient(45deg, #FF6B35, #F7931E)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '18px',
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
                fontSize: 22, 
                margin: "0 0 8px 0" 
              }}>
                Engr. Muhammad Aqib Afridi
              </h4>
              <div style={{ 
                fontSize: 16, 
                fontWeight: 600, 
                color: "#444",
                marginBottom: '20px'
              }}>
                <div style={{
                  background: 'linear-gradient(135deg, #fff7e6, #ffffff)',
                  padding: '10px 20px',
                  borderRadius: '10px',
                  border: '2px solid #F7931E',
                  marginBottom: '10px'
                }}>
                  <strong>Founder</strong>
                </div>
                <span style={{ fontWeight: 500, color: "#666", fontSize: 14 }}>
                  BSc Electrical Engineering, SUIT Peshawar
                </span>
              </div>
              
              <div style={{
                marginTop: 20,
                background: "linear-gradient(135deg, #fff6ec, #ffffff)",
                borderLeft: "6px solid #FF6B35",
                borderRadius: 15,
                boxShadow: "0 8px 25px rgba(255, 107, 53, 0.1)",
                padding: "25px 25px 20px 20px",
                textAlign: "left",
                position: 'relative'
              }}>
                <div style={{
                  position: 'absolute',
                  top: '-10px',
                  left: '20px',
                  background: '#FF6B35',
                  color: 'white',
                  padding: '5px 15px',
                  borderRadius: '15px',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  textTransform: 'uppercase'
                }}>
                  Founder's Message
                </div>
                <p style={{
                  color: "#333",
                  fontSize: 16,
                  fontWeight: 500,
                  margin: '15px 0 0 0',
                  lineHeight: 1.6,
                  fontStyle: 'italic'
                }}>
                  "With every project, my goal is to deliver not just energy but peace of mind. Syed Solar Energy was founded to serve every home and business with honesty, quality, and true after-sales support. I thank all our customers for trusting us with their energy needs—your belief in us keeps us moving forward."
                </p>
              </div>
            </Card3D>

            {/* Enhanced Zubair Card */}
            <Card3D style={{
              padding: "40px 35px 30px 35px",
              flex: "1 1 400px",
              maxWidth: 450,
              minWidth: 350,
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
                top: '20px',
                left: '20px',
                width: '60px',
                height: '60px',
                background: 'linear-gradient(45deg, rgba(247, 147, 30, 0.1), rgba(255, 152, 0, 0.1))',
                borderRadius: '50%',
                animation: 'pulse 3s ease-in-out infinite 1s'
              }}></div>

              <div style={{
                position: 'relative',
                marginBottom: '25px'
              }}>
                <img
                  src={zubairImg}
                  alt="Engr. M Zubair Afridi"
                  style={{
                    width: 140,
                    height: 160,
                    objectFit: "cover",
                    borderRadius: 20,
                    border: "4px solid #FF6B35",
                    background: "#fff6ec",
                    boxShadow: "0 15px 40px rgba(255, 107, 53, 0.2)",
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'scale(1.05)';
                    e.target.style.boxShadow = '0 20px 50px rgba(255, 107, 53, 0.3)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'scale(1)';
                    e.target.style.boxShadow = '0 15px 40px rgba(255, 107, 53, 0.2)';
                  }}
                />
                <div style={{
                  position: 'absolute',
                  bottom: '-10px',
                  right: '-10px',
                  width: '40px',
                  height: '40px',
                  background: 'linear-gradient(45deg, #FFD700, #FFA500)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '18px',
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
                fontSize: 22, 
                margin: "0 0 5px 0",
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexWrap: 'wrap',
                gap: '10px'
              }}>
                Engr. M Zubair Afridi 
                <span style={{ 
                  background: 'linear-gradient(45deg, #FFD700, #FFA500)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  fontSize: 14,
                  fontWeight: 'bold',
                  border: '2px solid #FFD700',
                  borderRadius: '15px',
                  padding: '4px 8px',
                  animation: 'pulse 2s ease-in-out infinite'
                }}>
                  Gold Medalist
                </span>
              </h4>
              
              <div style={{ 
                fontSize: 16, 
                fontWeight: 600, 
                color: "#444",
                marginBottom: '20px'
              }}>
                <div style={{
                  background: 'linear-gradient(135deg, #fff7e6, #ffffff)',
                  padding: '10px 20px',
                  borderRadius: '10px',
                  border: '2px solid #F7931E',
                  marginBottom: '10px'
                }}>
                  <strong>CEO</strong>
                </div>
                <span style={{ fontWeight: 500, color: "#666", fontSize: 14 }}>
                  BSc Electrical Engineering, SUIT Peshawar
                </span>
              </div>
              
              <div style={{
                marginTop: 20,
                background: "linear-gradient(135deg, #fff6ec, #ffffff)",
                borderLeft: "6px solid #FF6B35",
                borderRadius: 15,
                boxShadow: "0 8px 25px rgba(255, 107, 53, 0.1)",
                padding: "25px 25px 20px 20px",
                textAlign: "left",
                position: 'relative'
              }}>
                <div style={{
                  position: 'absolute',
                  top: '-10px',
                  left: '20px',
                  background: '#FF6B35',
                  color: 'white',
                  padding: '5px 15px',
                  borderRadius: '15px',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  textTransform: 'uppercase'
                }}>
                  CEO's Message
                </div>
                <p style={{
                  color: "#333",
                  fontSize: 16,
                  fontWeight: 500,
                  margin: '15px 0 0 0',
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
          margin: "0 auto 40px auto",
          padding: "50px 40px",
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
            top: '20px',
            right: '20px',
            width: '80px',
            height: '80px',
            background: 'rgba(255,255,255,0.1)',
            borderRadius: '50%',
            animation: 'float 6s ease-in-out infinite'
          }}></div>
          <div style={{
            position: 'absolute',
            bottom: '20px',
            left: '20px',
            width: '60px',
            height: '60px',
            background: 'rgba(255,255,255,0.1)',
            borderRadius: '50%',
            animation: 'float 8s ease-in-out infinite reverse'
          }}></div>

          <h2 style={{
            fontSize: '36px',
            fontWeight: 'bold',
            marginBottom: '20px',
            textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
          }}>
            Ready to Go Solar?
          </h2>
          <p style={{
            fontSize: '20px',
            marginBottom: '30px',
            opacity: 0.95,
            lineHeight: '1.6'
          }}>
            Join thousands of satisfied customers who have made the switch to clean, renewable energy. 
            Get your free consultation today!
          </p>
          <div style={{
            display: 'flex',
            gap: '20px',
            justifyContent: 'center',
            flexWrap: 'wrap'
          }}>
            <button
              onClick={() => window.location.href = '/quotation'}
              style={{
                background: 'rgba(255,255,255,0.9)',
                color: '#FF6600',
                border: 'none',
                padding: '15px 30px',
                borderRadius: '25px',
                fontSize: '16px',
                fontWeight: 'bold',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                textTransform: 'uppercase',
                letterSpacing: '1px'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'scale(1.05)';
                e.target.style.boxShadow = '0 8px 25px rgba(0,0,0,0.3)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'scale(1)';
                e.target.style.boxShadow = 'none';
              }}
            >
              🚀 Get Free Quote
            </button>
            <button
              onClick={() => window.open('https://wa.me/923075596695?text=Hi! I would like to learn more about Syed Solar Energy and your services.', '_blank')}
              style={{
                background: 'transparent',
                color: 'white',
                border: '2px solid rgba(255,255,255,0.8)',
                padding: '13px 28px',
                borderRadius: '25px',
                fontSize: '16px',
                fontWeight: 'bold',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
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
              📞 Contact Us
            </button>
          </div>
        </Card3D>
      </section>

      {/* Enhanced Footer */}
      <Footer />

      {/* Enhanced CSS Animations */}
      <style>
        {`
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

          @keyframes shimmer {
            0% { 
              transform: translateX(-100%) skewX(-15deg); 
            }
            100% { 
              transform: translateX(100%) skewX(-15deg); 
            }
          }

          /* Smooth scrolling */
          html {
            scroll-behavior: smooth;
          }
          
          /* Custom scrollbar */
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
          }
        `}
      </style>
    </>
  );
}