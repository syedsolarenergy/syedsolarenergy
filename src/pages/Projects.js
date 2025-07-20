import React, { useState, useEffect } from "react";
import Footer from "../components/Footer";
import logo from "../assets/logo.png";

// Enhanced Card3D Component
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
      e.currentTarget.style.transform = 'translateY(-10px) scale(1.02)';
      e.currentTarget.style.boxShadow = '0 20px 40px rgba(255, 107, 53, 0.15)';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = 'translateY(0) scale(1)';
      e.currentTarget.style.boxShadow = '0 10px 30px rgba(255, 107, 53, 0.1)';
    }}
    className={className}
  >
    {children}
  </div>
);

// Enhanced Project Card Component
const ProjectCard = ({ project, index }) => {
  const [showDetails, setShowDetails] = useState(false);
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

    const element = document.getElementById(`project-${index}`);
    if (element) observer.observe(element);

    return () => observer.disconnect();
  }, [index]);

  return (
    <Card3D
      id={`project-${index}`}
      style={{
        background: '#fff',
        margin: '0 auto',
        transform: 'translateY(0)',
        transition: 'all 0.3s ease',
        animation: isVisible ? `slideInFromRight 0.8s ease-out ${index * 0.1}s both` : 'none',
        maxWidth: '1000px',
        display: 'flex',
        flexDirection: 'row',
        overflow: 'hidden'
      }}
    >
      {/* Project Logo and Title */}
      <div style={{
        background: 'linear-gradient(135deg, #FF6B35, #F7931E)',
        width: '250px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '30px',
        position: 'relative',
        minHeight: '400px'
      }}>
        <div style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          background: 'rgba(255,255,255,0.2)',
          padding: '5px 10px',
          borderRadius: '15px',
          color: 'white',
          fontSize: '14px',
          fontWeight: 'bold'
        }}>
          {project.name.split('-')[0].trim()}
        </div>
        
        <div style={{
          width: '150px',
          height: '150px',
          background: 'white',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '30px',
          padding: '15px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
          border: '5px solid rgba(255,255,255,0.3)'
        }}>
          <img 
            src={logo} 
            alt="Syed Solar Logo" 
            style={{ 
              width: '100%', 
              height: '100%', 
              objectFit: 'contain',
              filter: 'drop-shadow(0 5px 10px rgba(0,0,0,0.2))'
            }} 
          />
        </div>
        
        <h3 style={{
          margin: '0 0 15px 0',
          fontSize: '1.8rem',
          color: 'white',
          fontWeight: 'bold',
          textAlign: 'center',
          textShadow: '2px 2px 4px rgba(0,0,0,0.2)'
        }}>
          {project.name}
        </h3>
        
        <div style={{
          background: 'rgba(255,255,255,0.2)',
          padding: '15px',
          borderRadius: '15px',
          marginTop: '20px',
          width: '100%'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            marginBottom: '15px'
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: 'white',
              color: '#FF6B35',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.2rem',
              fontWeight: 'bold'
            }}>
              {project.customer[0]}
            </div>
            <span style={{
              fontWeight: 'bold',
              color: 'white'
            }}>
              {project.customer}
            </span>
          </div>
          
          <div style={{
            color: '#ffd700',
            fontSize: '1.2rem',
            textAlign: 'center',
            marginBottom: '15px'
          }}>
            {'★'.repeat(project.stars)}
            {'☆'.repeat(5 - project.stars)}
          </div>
          
          <p style={{
            color: 'white',
            fontStyle: 'italic',
            textAlign: 'center',
            margin: 0,
            fontSize: '1.1rem'
          }}>
            "{project.review}"
          </p>
        </div>
      </div>
      
      {/* Project Details */}
      <div style={{ 
        flex: 1, 
        padding: '30px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between'
      }}>
        <div>
          <p style={{
            color: '#666',
            lineHeight: '1.6',
            margin: '0 0 20px 0',
            fontSize: '1.1rem'
          }}>
            {project.desc}
          </p>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '15px',
            marginBottom: '20px'
          }}>
            {projectDetails.specifications.map((spec, i) => (
              <div key={i} style={{
                background: 'linear-gradient(145deg, #fff8f0, #ffffff)',
                padding: '15px',
                borderRadius: '15px',
                border: '1px solid rgba(255, 107, 53, 0.1)'
              }}>
                <div style={{ color: '#666', fontSize: '0.9rem' }}>{spec.label}</div>
                <div style={{ fontWeight: 'bold', color: '#333', fontSize: '1.1rem' }}>{spec.value}</div>
              </div>
            ))}
          </div>
          
          {showDetails && (
            <div style={{
              animation: 'fadeIn 0.5s ease-out',
              background: '#f8f9fa',
              borderRadius: '15px',
              padding: '20px',
              marginBottom: '20px'
            }}>
              <h4 style={{
                fontSize: '1.2rem',
                color: '#FF6B35',
                marginBottom: '15px',
                fontWeight: 'bold'
              }}>Key Features</h4>
              
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '10px'
              }}>
                {projectDetails.features.map((feature, i) => (
                  <div key={i} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    color: '#444',
                    fontSize: '1rem'
                  }}>
                    <span style={{ 
                      color: '#FF6B35', 
                      fontWeight: 'bold',
                      fontSize: '1.2rem'
                    }}>✓</span>
                    {feature}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        
        <button
          onClick={() => setShowDetails(!showDetails)}
          style={{
            background: 'linear-gradient(135deg, #FF6B35, #F7931E)',
            color: 'white',
            border: 'none',
            padding: '15px 25px',
            borderRadius: '25px',
            fontWeight: 'bold',
            cursor: 'pointer',
            width: '100%',
            fontSize: '1.1rem',
            transition: 'all 0.3s ease',
            marginTop: '20px',
            boxShadow: '0 5px 15px rgba(255, 107, 53, 0.2)'
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'translateY(-2px)';
            e.target.style.boxShadow = '0 8px 20px rgba(255, 107, 53, 0.3)';
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = '0 5px 15px rgba(255, 107, 53, 0.2)';
          }}
        >
          {showDetails ? 'Hide Details' : 'View Full Specifications'}
        </button>
      </div>
    </Card3D>
  );
};

const projects = [
  {
    name: "5kW Daytime System - Ring Road",
    desc: "Installed with elevated structure and safety gear. This system powers a 3-bedroom home with all modern appliances including AC units. The installation was completed in just 2 days with minimal disruption.",
    review: "Very satisfied with the setup and execution. My electricity bills have reduced by 80%!",
    customer: "Mr. Junaid",
    stars: 5,
  },
  {
    name: "7kVA Hybrid - University Town",
    desc: "Hybrid with lithium battery for full-day usage. This system features smart monitoring and can seamlessly switch between solar, battery, and grid power. The lithium battery provides backup for up to 8 hours.",
    review: "Stable energy even in load shedding. The system has paid for itself in just 18 months!",
    customer: "Ms. Nida",
    stars: 4,
  },
  {
    name: "10kW Commercial - Board Bazar",
    desc: "Full commercial net-metered setup for a local business. This system powers a medium-sized shop with refrigeration, lighting, and point-of-sale systems. It features remote monitoring and automatic grid synchronization.",
    review: "Installation was smooth, great savings on bills. We've reduced our operational costs significantly.",
    customer: "Al-Huda Store",
    stars: 5,
  },
  {
    name: "3kW Home Hybrid - Hayatabad",
    desc: "Entry-level hybrid system for apartment. Compact design perfect for urban living. Features silent operation and automatic switching between power sources. Includes mobile app for real-time monitoring.",
    review: "Perfect solution for my flat's energy needs. The system is virtually maintenance-free!",
    customer: "Mr. Arsalan",
    stars: 5,
  },
  {
    name: "15kW Industrial - Small Industrial Estate",
    desc: "Heavy-duty industrial plant with surge protection. Powers machinery and lighting for a small factory. Features industrial-grade components and lightning protection. System includes remote diagnostics for quick troubleshooting.",
    review: "Running machines day and night, reliable power! Our production has increased by 15% with consistent power supply.",
    customer: "Silver Engineering",
    stars: 5,
  },
  {
    name: "20kW Solar for School - Gulbahar",
    desc: "Solar system for a local school; net metering included. Powers classrooms, computer lab, and administrative offices. The system includes educational displays to teach students about renewable energy.",
    review: "Students and staff very happy with zero load shedding. We've become a model for green schools in the region.",
    customer: "Bright Future School",
    stars: 4,
  },
  {
    name: "8kW Hybrid - Warsak Road",
    desc: "Smart inverter, lithium battery, and elevated mount. Designed for a large family home with high energy demands. Features weather-resistant components and automatic dust-cleaning system for panels.",
    review: "Great service, clean installation. The mobile app lets me track energy production in real-time.",
    customer: "Dr. Shakir",
    stars: 5,
  },
  {
    name: "25kW Commercial Plant - Karkhano",
    desc: "Biggest project this month! Complete monitoring. Powers a large showroom and warehouse. Features dual inverters for redundancy and a comprehensive monitoring system with daily reports.",
    review: "Professional work. Solar is now our main supply. We've completely eliminated diesel generator usage.",
    customer: "Sunrise Traders",
    stars: 5,
  },
  {
    name: "12kW Hybrid - University Campus",
    desc: "High performance for campus labs and offices. Powers sensitive equipment with pure sine wave output. Features battery backup for critical systems and automatic generator start during extended outages.",
    review: "Syed Solar delivered exactly as promised. Our research labs now have uninterrupted power 24/7.",
    customer: "Ms. Sameera",
    stars: 5,
  },
  {
    name: "6kW Home Daytime - City Homes",
    desc: "Entry-level daytime, easy install and maintenance. Perfect for budget-conscious homeowners. Simple design with high-efficiency panels and user-friendly interface. Payback period estimated at just 3 years.",
    review: "My family loves the non-stop fan/AC now. The system was installed in a single day with no mess.",
    customer: "Mr. Waleed",
    stars: 5,
  },
];

const projectDetails = {
  specifications: [
    { label: "System Size", value: "Based on project" },
    { label: "Installation Date", value: "2025" },
    { label: "Location", value: "Peshawar, PK" },
    { label: "Energy Production", value: "25-30 kWh/day" },
    { label: "CO2 Offset", value: "~15 tons/year" },
    { label: "Warranty", value: "25 Years" },
    { label: "Panel Type", value: "Monocrystalline" },
    { label: "Inverter Brand", value: "Growatt/Inverex" }
  ],
  features: [
    "Premium Tier-1 Solar Panels",
    "Smart Inverter Technology",
    "Remote Monitoring System",
    "Net Metering Ready",
    "25 Years Performance Warranty",
    "Surge Protection Device",
    "Weather-Proof Mounting",
    "Professional Installation",
    "Automatic Transfer Switch",
    "Lightning Protection",
    "Mobile App Integration",
    "Energy Production Reports"
  ]
};

export default function Projects() {
  const [showOffer, setShowOffer] = useState(false);
  const [isOfferOpen, setIsOfferOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Observer for main container
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    const element = document.getElementById('projects-container');
    if (element) observer.observe(element);

    // Show popup after 3 seconds
    const offerTimer = setTimeout(() => {
      setShowOffer(true);
      setTimeout(() => setIsOfferOpen(true), 100);
    }, 3000);

    return () => {
      observer.disconnect();
      clearTimeout(offerTimer);
    };
  }, []);

  const handleClaimClick = () => {
    const message = encodeURIComponent("Hi! I'm interested in the Rs. 7,000 cashback offer for solar installation.");
    window.open(`https://wa.me/923075596695?text=${message}`, '_blank');
  };

  const closeOffer = () => {
    setIsOfferOpen(false);
    setTimeout(() => setShowOffer(false), 500);
  };

  return (
    <section style={{
      background: '#fff6ec',
      minHeight: '100vh',
      padding: '40px 20px',
      overflow: 'hidden'
    }}>
      <div 
        id="projects-container"
        style={{
          maxWidth: '1400px',
          margin: '0 auto',
          animation: isVisible ? 'fadeIn 1s ease-out' : 'none'
        }}
      >
        <Card3D style={{
          maxWidth: '1000px',
          margin: '0 auto 50px auto',
          padding: '40px',
          textAlign: 'center',
          position: 'relative',
          animation: 'fadeInUp 0.8s ease-out'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '30px',
            marginBottom: '30px'
          }}>
            <img 
              src={logo} 
              alt="Syed Solar Logo" 
              style={{ 
                width: '120px', 
                height: '120px',
                objectFit: 'contain',
                animation: 'pulse 2s infinite'
              }} 
            />
            <h1 style={{
              fontSize: '3.2rem',
              fontWeight: 'bold',
              background: 'linear-gradient(45deg, #FF6B35, #F7931E)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              margin: 0,
              textShadow: '0 4px 8px rgba(0,0,0,0.1)'
            }}>
              Our Solar Projects
            </h1>
          </div>
          <p style={{
            color: '#666',
            fontSize: '1.3rem',
            maxWidth: '800px',
            margin: '0 auto',
            lineHeight: '1.6'
          }}>
            Discover our latest solar installations across Pakistan with detailed specifications and customer reviews
          </p>
        </Card3D>

        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '60px',
          padding: '0 20px'
        }}>
          {projects.map((project, index) => (
            <ProjectCard key={index} project={project} index={index} />
          ))}
        </div>
      </div>

      {showOffer && (
        <div style={{
          position: 'fixed',
          right: isOfferOpen ? '50%' : '-100%',
          top: '50%',
          transform: isOfferOpen ? 'translate(50%, -50%)' : 'translateY(-50%)',
          zIndex: 1000,
          transition: 'all 0.5s ease-out',
        }}>
          <div 
            style={{
              background: 'linear-gradient(135deg, #FF6B35, #F7931E)',
              padding: isOfferOpen ? '40px' : '30px',
              borderRadius: '20px',
              boxShadow: '0 10px 30px rgba(255, 107, 53, 0.3)',
              width: isOfferOpen ? '500px' : '100px',
              height: isOfferOpen ? 'auto' : '100px',
              cursor: 'pointer',
              position: 'relative',
              transition: 'all 0.4s ease-out'
            }}
          >
            {!isOfferOpen ? (
              <div style={{
                fontSize: '50px',
                textAlign: 'center'
              }}>
                🎁
              </div>
            ) : (
              <div style={{ color: 'white', textAlign: 'center' }}>
                <div className="celebration-particles" />
                <button
                  onClick={closeOffer}
                  style={{
                    position: 'absolute',
                    top: '15px',
                    right: '15px',
                    background: 'rgba(255,255,255,0.2)',
                    border: 'none',
                    color: 'white',
                    width: '30px',
                    height: '30px',
                    borderRadius: '50%',
                    cursor: 'pointer',
                    fontSize: '18px',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = 'rgba(255,255,255,0.3)';
                    e.target.style.transform = 'rotate(90deg)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = 'rgba(255,255,255,0.2)';
                    e.target.style.transform = 'rotate(0)';
                  }}
                >
                  ×
                </button>
                <div style={{
                  fontSize: '40px',
                  marginBottom: '20px',
                  animation: 'tada 1s infinite'
                }}>
                  🎊
                </div>
                <h3 style={{
                  margin: '0 0 15px 0',
                  fontSize: '28px',
                  fontWeight: 'bold',
                  textShadow: '2px 2px 4px rgba(0,0,0,0.1)'
                }}>
                  Special Offer!
                </h3>
                <p style={{
                  fontSize: '20px',
                  lineHeight: 1.6,
                  margin: '0 0 25px 0',
                  padding: '0 20px'
                }}>
                  Install any solar system and get an amazing
                  <div style={{
                    fontSize: '24px',
                    fontWeight: 'bold',
                    margin: '10px 0',
                    padding: '10px',
                    background: 'rgba(255,255,255,0.1)',
                    borderRadius: '10px',
                    animation: 'pulse 2s infinite'
                  }}>
                    Rs. 7,000 Cashback
                  </div>
                  within 7 days of installation! 🌟
                </p>
                <button
                  onClick={handleClaimClick}
                  style={{
                    background: 'white',
                    color: '#FF6B35',
                    border: 'none',
                    padding: '15px 30px',
                    borderRadius: '30px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    fontSize: '18px',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 5px 15px rgba(0,0,0,0.1)'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'translateY(-3px) scale(1.05)';
                    e.target.style.boxShadow = '0 8px 20px rgba(0,0,0,0.15)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'translateY(0) scale(1)';
                    e.target.style.boxShadow = '0 5px 15px rgba(0,0,0,0.1)';
                  }}
                >
                  🎯 Claim Now on WhatsApp
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <Footer />

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

          @keyframes slideInFromRight {
            0% {
              opacity: 0;
              transform: translateX(100px);
            }
            100% {
              opacity: 1;
              transform: translateX(0);
            }
          }

          @keyframes fadeIn {
            from {
              opacity: 0;
            }
            to {
              opacity: 1;
            }
          }

          @keyframes slideInFromBottom {
            0% {
              opacity: 0;
              transform: translateY(100px);
            }
            100% {
              opacity: 1;
              transform: translateY(0);
            }
          }

          @keyframes tada {
            0% { transform: scale(1); }
            10%, 20% { transform: scale(0.9) rotate(-3deg); }
            30%, 50%, 70%, 90% { transform: scale(1.1) rotate(3deg); }
            40%, 60%, 80% { transform: scale(1.1) rotate(-3deg); }
            100% { transform: scale(1) rotate(0); }
          }

          @keyframes bounce {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-10px); }
          }

          @keyframes pulse {
            0% {
              transform: scale(1);
              opacity: 1;
            }
            50% {
              transform: scale(1.05);
              opacity: 0.8;
            }
            100% {
              transform: scale(1);
              opacity: 1;
            }
          }

          .celebration-particles {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            background: 
              radial-gradient(circle at 20% 35%, rgba(255, 255, 0, 0.2) 0%, transparent 50%),
              radial-gradient(circle at 75% 44%, rgba(255, 192, 203, 0.2) 0%, transparent 50%),
              radial-gradient(circle at 46% 52%, rgba(255, 255, 255, 0.2) 0%, transparent 50%);
            animation: particleFloat 4s ease-in-out infinite;
          }

          @keyframes particleFloat {
            0%, 100% { transform: translateY(0) rotate(0); }
            50% { transform: translateY(-20px) rotate(5deg); }
          }

          .project-card-exit {
            animation: slideOutLeft 0.5s ease-out forwards;
          }
        `}
      </style>
    </section>
  );
}