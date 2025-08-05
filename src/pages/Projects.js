import React, { useState, useEffect } from "react";
import Footer from "../components/Footer";
import logo from "../assets/logo.png";

// Enhanced CSS Variables for Universal Screen Support
const cssVariables = `
  :root {
    --primary-orange: #FF6B35;
    --secondary-orange: #F7931E;
    --font-size-base: clamp(14px, 2.5vw, 18px);
    --padding-base: clamp(12px, 4vw, 40px);
    --section-padding: clamp(30px, 6vw, 80px);
    --card-padding: clamp(20px, 4vw, 40px);
    --heading-1: clamp(2.2rem, 6vw, 4rem);
    --heading-2: clamp(1.5rem, 4vw, 2.8rem);
    --heading-3: clamp(1.25rem, 3.5vw, 1.8rem);
    --text-base: clamp(0.875rem, 2.2vw, 1.125rem);
    --text-small: clamp(0.75rem, 2vw, 1rem);
    --border-radius: clamp(12px, 2.5vw, 20px);
    --container-max: min(1400px, 95vw);
    --grid-gap: clamp(20px, 4vw, 40px);
    --logo-size: clamp(80px, 15vw, 120px);
    --project-logo-size: clamp(100px, 18vw, 150px);
    --sidebar-width: clamp(200px, 35vw, 250px);
  }

  /* Universal Container System */
  .universal-container {
    width: 100%;
    max-width: var(--container-max);
    margin: 0 auto;
    padding: 0 var(--padding-base);
  }

  /* Project Card Layout System */
  .project-card {
    display: flex;
    flex-direction: row;
    overflow: hidden;
    max-width: min(1000px, 95vw);
    margin: 0 auto;
  }

  .project-sidebar {
    width: var(--sidebar-width);
    min-width: var(--sidebar-width);
    flex-shrink: 0;
  }

  .project-content {
    flex: 1;
    min-width: 0; /* Allows content to shrink */
  }

  /* Mobile Layout */
  @media (max-width: 768px) {
    :root {
      --sidebar-width: 100%;
      --project-logo-size: clamp(80px, 20vw, 100px);
    }
    
    .project-card {
      flex-direction: column;
      max-width: 100%;
    }
    
    .project-sidebar {
      width: 100%;
      min-width: auto;
      min-height: auto;
    }
    
    .project-content {
      width: 100%;
    }
  }

  /* Tablet adjustments */
  @media (min-width: 769px) and (max-width: 1024px) {
    :root {
      --sidebar-width: clamp(180px, 30vw, 220px);
    }
  }

  /* Large screen optimizations */
  @media (min-width: 1440px) {
    :root {
      --container-max: 1600px;
    }
  }
`;

// Enhanced Card3D Component with better mobile support
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
        e.currentTarget.style.transform = 'translateY(-8px) scale(1.01)';
        e.currentTarget.style.boxShadow = '0 16px 40px rgba(255, 107, 53, 0.18)';
      }
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = 'translateY(0) scale(1)';
      e.currentTarget.style.boxShadow = '0 8px 24px rgba(255, 107, 53, 0.12)';
    }}
    className={className}
  >
    {children}
  </div>
);

// Enhanced Project Card Component with perfect logo fitting
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
        animation: isVisible ? `slideInFromRight 0.8s ease-out ${index * 0.1}s both` : 'none'
      }}
    >
      <div className="project-card">
        {/* Enhanced Project Sidebar */}
        <div 
          className="project-sidebar"
          style={{
            background: 'linear-gradient(135deg, #FF6B35, #F7931E)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 'var(--card-padding)',
            position: 'relative',
            minHeight: 'clamp(350px, 50vw, 400px)'
          }}
        >
          {/* Project type badge */}
          <div style={{
            position: 'absolute',
            top: 'clamp(12px, 2.5vw, 20px)',
            right: 'clamp(12px, 2.5vw, 20px)',
            background: 'rgba(255,255,255,0.2)',
            padding: 'clamp(4px, 1vw, 6px) clamp(8px, 2vw, 12px)',
            borderRadius: 'clamp(10px, 2vw, 15px)',
            color: 'white',
            fontSize: 'clamp(10px, 2vw, 14px)',
            fontWeight: 'bold',
            backdropFilter: 'blur(10px)'
          }}>
            {project.name.split('-')[0].trim()}
          </div>
          
          {/* Enhanced Logo Container with Perfect Circular Fit */}
          <div style={{
            width: 'var(--project-logo-size)',
            height: 'var(--project-logo-size)',
            background: 'white',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 'clamp(20px, 4vw, 30px)',
            padding: 'clamp(12px, 2.5vw, 15px)',
            boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
            border: 'clamp(3px, 1vw, 5px) solid rgba(255,255,255,0.3)',
            position: 'relative',
            overflow: 'hidden'
          }}>
            {/* Perfect circular logo fitting */}
            <div style={{
              width: '100%',
              height: '100%',
              borderRadius: '50%',
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'white'
            }}>
              <img 
                src={logo} 
                alt="Syed Solar Logo" 
                style={{ 
                  width: '85%',
                  height: '85%',
                  objectFit: 'contain',
                  objectPosition: 'center',
                  filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.1))',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  if (window.innerWidth > 768) {
                    e.target.style.transform = 'scale(1.05) rotate(5deg)';
                  }
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'scale(1) rotate(0deg)';
                }}
              />
            </div>
            
            {/* Subtle shine effect */}
            <div style={{
              position: 'absolute',
              top: '10%',
              left: '10%',
              width: '30%',
              height: '30%',
              background: 'linear-gradient(45deg, rgba(255,255,255,0.3), transparent)',
              borderRadius: '50%',
              animation: 'logoShine 3s ease-in-out infinite'
            }}></div>
          </div>
          
          {/* Project Title */}
          <h3 style={{
            margin: '0 0 clamp(12px, 2.5vw, 15px) 0',
            fontSize: 'var(--heading-3)',
            color: 'white',
            fontWeight: 'bold',
            textAlign: 'center',
            textShadow: '2px 2px 4px rgba(0,0,0,0.2)',
            lineHeight: '1.2'
          }}>
            {project.name}
          </h3>
          
          {/* Enhanced Customer Review Section */}
          <div style={{
            background: 'rgba(255,255,255,0.15)',
            backdropFilter: 'blur(10px)',
            padding: 'clamp(12px, 2.5vw, 15px)',
            borderRadius: 'var(--border-radius)',
            marginTop: 'clamp(15px, 3vw, 20px)',
            width: '100%',
            border: '1px solid rgba(255,255,255,0.2)'
          }}>
            {/* Customer info */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'clamp(8px, 2vw, 10px)',
              marginBottom: 'clamp(12px, 2.5vw, 15px)'
            }}>
              <div style={{
                width: 'clamp(32px, 6vw, 40px)',
                height: 'clamp(32px, 6vw, 40px)',
                borderRadius: '50%',
                background: 'white',
                color: '#FF6B35',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 'clamp(14px, 2.5vw, 18px)',
                fontWeight: 'bold',
                flexShrink: 0
              }}>
                {project.customer[0]}
              </div>
              <span style={{
                fontWeight: 'bold',
                color: 'white',
                fontSize: 'var(--text-base)'
              }}>
                {project.customer}
              </span>
            </div>
            
            {/* Star rating */}
            <div style={{
              color: '#ffd700',
              fontSize: 'clamp(16px, 3vw, 20px)',
              textAlign: 'center',
              marginBottom: 'clamp(12px, 2.5vw, 15px)',
              filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))'
            }}>
              {'★'.repeat(project.stars)}
              {'☆'.repeat(5 - project.stars)}
            </div>
            
            {/* Customer review */}
            <p style={{
              color: 'white',
              fontStyle: 'italic',
              textAlign: 'center',
              margin: 0,
              fontSize: 'var(--text-small)',
              lineHeight: '1.4'
            }}>
              "{project.review}"
            </p>
          </div>
        </div>
        
        {/* Enhanced Project Content */}
        <div 
          className="project-content"
          style={{ 
            padding: 'var(--card-padding)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}
        >
          <div>
            {/* Project description */}
            <p style={{
              color: '#666',
              lineHeight: '1.6',
              margin: '0 0 clamp(16px, 3vw, 20px) 0',
              fontSize: 'var(--text-base)'
            }}>
              {project.desc}
            </p>
            
            {/* Enhanced specifications grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(140px, 100%), 1fr))',
              gap: 'clamp(12px, 2.5vw, 15px)',
              marginBottom: 'clamp(16px, 3vw, 20px)'
            }}>
              {projectDetails.specifications.slice(0, 6).map((spec, i) => (
                <div key={i} style={{
                  background: 'linear-gradient(145deg, #fff8f0, #ffffff)',
                  padding: 'clamp(12px, 2.5vw, 15px)',
                  borderRadius: 'clamp(10px, 2vw, 15px)',
                  border: '1px solid rgba(255, 107, 53, 0.1)',
                  textAlign: 'center'
                }}>
                  <div style={{ 
                    color: '#666', 
                    fontSize: 'clamp(10px, 1.8vw, 12px)',
                    marginBottom: '4px'
                  }}>
                    {spec.label}
                  </div>
                  <div style={{ 
                    fontWeight: 'bold', 
                    color: '#333', 
                    fontSize: 'var(--text-small)'
                  }}>
                    {spec.value}
                  </div>
                </div>
              ))}
            </div>
            
            {/* Expandable details section */}
            {showDetails && (
              <div style={{
                animation: 'fadeIn 0.5s ease-out',
                background: 'linear-gradient(145deg, #f8f9fa, #ffffff)',
                borderRadius: 'var(--border-radius)',
                padding: 'var(--card-padding)',
                marginBottom: 'clamp(16px, 3vw, 20px)',
                border: '1px solid rgba(255, 107, 53, 0.1)'
              }}>
                <h4 style={{
                  fontSize: 'var(--heading-3)',
                  color: '#FF6B35',
                  marginBottom: 'clamp(12px, 2.5vw, 15px)',
                  fontWeight: 'bold'
                }}>
                  Key Features
                </h4>
                
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(min(200px, 100%), 1fr))',
                  gap: 'clamp(8px, 2vw, 10px)'
                }}>
                  {projectDetails.features.map((feature, i) => (
                    <div key={i} style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 'clamp(6px, 1.5vw, 8px)',
                      color: '#444',
                      fontSize: 'var(--text-small)'
                    }}>
                      <span style={{ 
                        color: '#FF6B35', 
                        fontWeight: 'bold',
                        fontSize: 'clamp(14px, 2.5vw, 16px)',
                        flexShrink: 0
                      }}>✓</span>
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          {/* Enhanced action button */}
          <button
            onClick={() => setShowDetails(!showDetails)}
            style={{
              background: 'linear-gradient(135deg, #FF6B35, #F7931E)',
              color: 'white',
              border: 'none',
              padding: 'clamp(12px, 2.5vw, 15px) clamp(20px, 4vw, 25px)',
              borderRadius: 'clamp(20px, 4vw, 25px)',
              fontWeight: 'bold',
              cursor: 'pointer',
              width: '100%',
              fontSize: 'var(--text-base)',
              transition: 'all 0.3s ease',
              marginTop: 'clamp(16px, 3vw, 20px)',
              boxShadow: '0 4px 12px rgba(255, 107, 53, 0.2)',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}
            onMouseEnter={(e) => {
              if (window.innerWidth > 768) {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 6px 16px rgba(255, 107, 53, 0.3)';
              }
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 4px 12px rgba(255, 107, 53, 0.2)';
            }}
          >
            {showDetails ? '📋 Hide Details' : '🔍 View Full Specifications'}
          </button>
        </div>
      </div>
    </Card3D>
  );
};

// Enhanced Offer Popup Component
const OfferPopup = ({ showOffer, isOfferOpen, onClose, onClaim }) => {
  if (!showOffer) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.5)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: 'var(--padding-base)',
      opacity: isOfferOpen ? 1 : 0,
      transition: 'opacity 0.5s ease-out'
    }}>
      <div style={{
        background: 'linear-gradient(135deg, #FF6B35, #F7931E)',
        padding: 'var(--card-padding)',
        borderRadius: 'var(--border-radius)',
        boxShadow: '0 20px 60px rgba(255, 107, 53, 0.4)',
        maxWidth: 'min(500px, 90vw)',
        width: '100%',
        position: 'relative',
        transform: isOfferOpen ? 'scale(1)' : 'scale(0.8)',
        transition: 'transform 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        color: 'white',
        textAlign: 'center'
      }}>
        {/* Close button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: 'clamp(10px, 2vw, 15px)',
            right: 'clamp(10px, 2vw, 15px)',
            background: 'rgba(255,255,255,0.2)',
            border: 'none',
            color: 'white',
            width: 'clamp(28px, 5vw, 32px)',
            height: 'clamp(28px, 5vw, 32px)',
            borderRadius: '50%',
            cursor: 'pointer',
            fontSize: 'clamp(16px, 3vw, 18px)',
            transition: 'all 0.3s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          onMouseEnter={(e) => {
            if (window.innerWidth > 768) {
              e.target.style.background = 'rgba(255,255,255,0.3)';
              e.target.style.transform = 'rotate(90deg)';
            }
          }}
          onMouseLeave={(e) => {
            e.target.style.background = 'rgba(255,255,255,0.2)';
            e.target.style.transform = 'rotate(0)';
          }}
        >
          ×
        </button>

        {/* Celebration icon */}
        <div style={{
          fontSize: 'clamp(32px, 8vw, 48px)',
          marginBottom: 'clamp(16px, 3vw, 20px)',
          animation: 'tada 1s infinite'
        }}>
          🎊
        </div>

        {/* Offer content */}
        <h3 style={{
          margin: '0 0 clamp(12px, 2.5vw, 15px) 0',
          fontSize: 'clamp(20px, 5vw, 28px)',
          fontWeight: 'bold',
          textShadow: '2px 2px 4px rgba(0,0,0,0.1)'
        }}>
          Special Offer!
        </h3>

        <p style={{
          fontSize: 'var(--text-base)',
          lineHeight: 1.6,
          margin: '0 0 clamp(20px, 4vw, 25px) 0'
        }}>
          Install any solar system and get an amazing
        </p>

        <div style={{
          fontSize: 'clamp(20px, 5vw, 24px)',
          fontWeight: 'bold',
          margin: 'clamp(8px, 2vw, 10px) 0',
          padding: 'clamp(8px, 2vw, 10px)',
          background: 'rgba(255,255,255,0.15)',
          borderRadius: 'clamp(8px, 2vw, 10px)',
          animation: 'pulse 2s infinite',
          backdropFilter: 'blur(10px)'
        }}>
          Rs. 7,000 Cashback
        </div>

        <p style={{
          fontSize: 'var(--text-base)',
          margin: '0 0 clamp(20px, 4vw, 25px) 0'
        }}>
          within 7 days of installation! 🌟
        </p>

        {/* CTA button */}
        <button
          onClick={onClaim}
          style={{
            background: 'white',
            color: '#FF6B35',
            border: 'none',
            padding: 'clamp(12px, 2.5vw, 15px) clamp(24px, 5vw, 30px)',
            borderRadius: 'clamp(24px, 5vw, 30px)',
            fontWeight: 'bold',
            cursor: 'pointer',
            fontSize: 'var(--text-base)',
            transition: 'all 0.3s ease',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            width: '100%',
            maxWidth: 'min(300px, 90vw)'
          }}
          onMouseEnter={(e) => {
            if (window.innerWidth > 768) {
              e.target.style.transform = 'translateY(-2px) scale(1.02)';
              e.target.style.boxShadow = '0 6px 16px rgba(0,0,0,0.15)';
            }
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'translateY(0) scale(1)';
            e.target.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
          }}
        >
          🎯 Claim Now on WhatsApp
        </button>
      </div>
    </div>
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
    closeOffer();
  };

  const closeOffer = () => {
    setIsOfferOpen(false);
    setTimeout(() => setShowOffer(false), 500);
  };

  return (
    <>
      <style>{cssVariables}</style>
      
      <section style={{
        background: `
          linear-gradient(135deg, #fff6ec 0%, #fff3e0 25%, #ffe0b2 50%, #ffcc80 100%),
          url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 60"><defs><pattern id="dots" width="20" height="20" patternUnits="userSpaceOnUse"><circle cx="10" cy="10" r="1" fill="rgba(255,107,53,0.1)"/></pattern></defs><rect width="60" height="60" fill="url(%23dots)"/></svg>')
        `,
        minHeight: '100vh',
        padding: 'var(--section-padding) 0',
        overflow: 'hidden',
        position: 'relative'
      }}>
        {/* Animated background particles */}
        {[...Array(window.innerWidth <= 768 ? 6 : 10)].map((_, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              width: `clamp(3px, 1vw, ${Math.random() * 6 + 3}px)`,
              height: `clamp(3px, 1vw, ${Math.random() * 6 + 3}px)`,
              background: 'rgba(255,107,53,0.3)',
              borderRadius: '50%',
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animation: `floatingParticles ${Math.random() * 20 + 15}s linear infinite ${Math.random() * 5}s`
            }}
          />
        ))}

        <div 
          id="projects-container"
          className="universal-container"
          style={{
            animation: isVisible ? 'fadeIn 1s ease-out' : 'none',
            position: 'relative',
            zIndex: 1
          }}
        >
          {/* Enhanced Header Section */}
          <Card3D style={{
            maxWidth: 'min(1000px, 95vw)',
            margin: '0 auto clamp(40px, 6vw, 50px) auto',
            padding: 'var(--card-padding)',
            textAlign: 'center',
            position: 'relative',
            animation: 'fadeInUp 0.8s ease-out'
          }}>
            {/* Header content with responsive layout */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 'clamp(20px, 4vw, 30px)',
              marginBottom: 'clamp(25px, 4vw, 30px)',
              flexWrap: 'wrap'
            }}>
              {/* Enhanced logo container */}
              <div style={{
                position: 'relative',
                flexShrink: 0
              }}>
                <div style={{
                  width: 'var(--logo-size)',
                  height: 'var(--logo-size)',
                  borderRadius: '50%',
                  background: 'linear-gradient(145deg, #ffffff, #fff8f0)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: 'clamp(8px, 2vw, 12px)',
                  boxShadow: '0 8px 24px rgba(255, 107, 53, 0.2)',
                  border: '2px solid rgba(255, 107, 53, 0.1)',
                  animation: 'pulse 3s infinite'
                }}>
                  <img 
                    src={logo} 
                    alt="Syed Solar Logo" 
                    style={{ 
                      width: '85%',
                      height: '85%',
                      objectFit: 'contain',
                      filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.1))'
                    }} 
                  />
                </div>
                
                {/* Decorative ring */}
                <div style={{
                  position: 'absolute',
                  top: '-5px',
                  left: '-5px',
                  right: '-5px',
                  bottom: '-5px',
                  border: '2px solid rgba(255, 107, 53, 0.3)',
                  borderRadius: '50%',
                  animation: 'spin 10s linear infinite'
                }}></div>
              </div>

              {/* Title section */}
              <div style={{ flex: 1, minWidth: 'min(300px, 100%)' }}>
                <h1 style={{
                  fontSize: 'var(--heading-1)',
                  fontWeight: 'bold',
                  background: 'linear-gradient(45deg, #FF6B35, #F7931E)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  margin: 0,
                  textShadow: '0 2px 4px rgba(0,0,0,0.1)',
                  lineHeight: '1.2'
                }}>
                  Our Solar Projects
                </h1>
              </div>
            </div>

            {/* Enhanced description */}
            <p style={{
              color: '#666',
              fontSize: 'var(--text-base)',
              maxWidth: 'min(800px, 95vw)',
              margin: '0 auto',
              lineHeight: '1.6'
            }}>
              Discover our latest solar installations across Pakistan with detailed specifications and customer reviews
            </p>

            {/* Stats bar */}
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              gap: 'clamp(20px, 4vw, 40px)',
              marginTop: 'clamp(25px, 4vw, 30px)',
              flexWrap: 'wrap'
            }}>
              {[
                { number: '2000+', label: 'Projects' },
                { number: '99.9%', label: 'Satisfaction' },
                { number: '10+', label: 'Years Installation Warranty' }
              ].map((stat, index) => (
                <div key={index} style={{
                  textAlign: 'center',
                  padding: 'clamp(12px, 2.5vw, 16px)',
                  background: 'rgba(255, 107, 53, 0.1)',
                  borderRadius: 'var(--border-radius)',
                  minWidth: 'clamp(80px, 15vw, 120px)'
                }}>
                  <div style={{
                    fontSize: 'clamp(20px, 4vw, 24px)',
                    fontWeight: 'bold',
                    color: '#FF6B35',
                    marginBottom: '4px'
                  }}>
                    {stat.number}
                  </div>
                  <div style={{
                    fontSize: 'var(--text-small)',
                    color: '#666',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </Card3D>

          {/* Enhanced Projects Grid */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--grid-gap)'
          }}>
            {projects.map((project, index) => (
              <ProjectCard key={index} project={project} index={index} />
            ))}
          </div>

          {/* Enhanced Call to Action Section */}
          <Card3D style={{
            maxWidth: 'min(800px, 95vw)',
            margin: 'clamp(50px, 8vw, 60px) auto 0 auto',
            padding: 'var(--card-padding)',
            textAlign: 'center',
            background: 'linear-gradient(135deg, #FF6B35, #F7931E, #FF9800)',
            color: 'white',
            position: 'relative',
            overflow: 'hidden',
            animation: 'fadeInUp 0.8s ease-out 1s both'
          }}>
            {/* Background decoration */}
            <div style={{
              position: 'absolute',
              top: 'clamp(12px, 2.5vw, 15px)',
              right: 'clamp(12px, 2.5vw, 15px)',
              width: 'clamp(40px, 8vw, 60px)',
              height: 'clamp(40px, 8vw, 60px)',
              background: 'rgba(255,255,255,0.1)',
              borderRadius: '50%',
              animation: 'float 6s ease-in-out infinite'
            }}></div>

            <h2 style={{
              fontSize: 'var(--heading-2)',
              fontWeight: 'bold',
              marginBottom: 'clamp(12px, 2.5vw, 15px)',
              textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
            }}>
              Ready to Join Our Success Stories?
            </h2>

            <p style={{
              fontSize: 'var(--text-base)',
              marginBottom: 'clamp(25px, 4vw, 30px)',
              opacity: 0.95,
              lineHeight: '1.6',
              maxWidth: 'min(600px, 90vw)',
              margin: '0 auto clamp(25px, 4vw, 30px) auto'
            }}>
              Get your free consultation and become our next satisfied customer with guaranteed quality and performance.
            </p>

            {/* CTA buttons */}
            <div style={{
              display: 'flex',
              gap: 'clamp(12px, 2.5vw, 15px)',
              justifyContent: 'center',
              flexWrap: 'wrap'
            }}>
              <button
                onClick={() => window.open('https://wa.me/923075596695?text=Hi! I would like to get a free consultation for solar installation. Please provide more details.', '_blank')}
                style={{
                  background: 'rgba(255,255,255,0.9)',
                  color: '#FF6600',
                  border: 'none',
                  padding: 'clamp(10px, 2vw, 12px) clamp(20px, 4vw, 25px)',
                  borderRadius: 'clamp(20px, 4vw, 25px)',
                  fontSize: 'var(--text-base)',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  minWidth: 'clamp(160px, 30vw, 200px)',
                  flexShrink: 0
                }}
                onMouseEnter={(e) => {
                  if (window.innerWidth > 768) {
                    e.target.style.transform = 'scale(1.05)';
                    e.target.style.boxShadow = '0 8px 25px rgba(0,0,0,0.3)';
                  }
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'scale(1)';
                  e.target.style.boxShadow = 'none';
                }}
              >
                📱 Free Consultation
              </button>

              <button
                onClick={() => window.location.href = '/quotation'}
                style={{
                  background: 'transparent',
                  color: 'white',
                  border: '2px solid rgba(255,255,255,0.8)',
                  padding: 'clamp(8px, 1.8vw, 10px) clamp(18px, 3.8vw, 23px)',
                  borderRadius: 'clamp(20px, 4vw, 25px)',
                  fontSize: 'var(--text-base)',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  minWidth: 'clamp(140px, 28vw, 180px)',
                  flexShrink: 0
                }}
                onMouseEnter={(e) => {
                  if (window.innerWidth > 768) {
                    e.target.style.background = 'rgba(255,255,255,0.2)';
                    e.target.style.transform = 'scale(1.05)';
                  }
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'transparent';
                  e.target.style.transform = 'scale(1)';
                }}
              >
                📋 Get Quote
              </button>
            </div>
          </Card3D>
        </div>

        {/* Enhanced Offer Popup */}
        <OfferPopup 
          showOffer={showOffer}
          isOfferOpen={isOfferOpen}
          onClose={closeOffer}
          onClaim={handleClaimClick}
        />
      </section>

      {/* Enhanced Footer */}
      <Footer />

      {/* Enhanced CSS Animations and Responsive Design */}
      <style>
        {`
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

          @keyframes slideInFromRight {
            0% {
              opacity: 0;
              transform: translateX(clamp(50px, 8vw, 100px));
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

          @keyframes floatingParticles {
            0% { 
              transform: translateY(0px) translateX(0px) rotate(0deg) scale(1); 
              opacity: 0.2;
            }
            33% { 
              transform: translateY(clamp(-20px, -3vw, -30px)) translateX(clamp(15px, 2vw, 20px)) rotate(120deg) scale(1.1); 
              opacity: 0.6;
            }
            66% { 
              transform: translateY(clamp(-8px, -1.5vw, -10px)) translateX(clamp(-10px, -2vw, -15px)) rotate(240deg) scale(0.9); 
              opacity: 0.8;
            }
            100% { 
              transform: translateY(0px) translateX(0px) rotate(360deg) scale(1); 
              opacity: 0.2;
            }
          }

          @keyframes tada {
            0% { transform: scale(1); }
            10%, 20% { transform: scale(0.9) rotate(-3deg); }
            30%, 50%, 70%, 90% { transform: scale(1.1) rotate(3deg); }
            40%, 60%, 80% { transform: scale(1.1) rotate(-3deg); }
            100% { transform: scale(1) rotate(0); }
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

          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
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

          @keyframes logoShine {
            0%, 100% { 
              opacity: 0.3; 
              transform: scale(1); 
            }
            50% { 
              opacity: 0.7; 
              transform: scale(1.1); 
            }
          }

          /* Mobile-specific optimizations */
          @media (max-width: 768px) {
            .project-card {
              flex-direction: column !important;
            }
            
            .project-sidebar {
              width: 100% !important;
              min-width: auto !important;
              min-height: clamp(280px, 40vw, 320px) !important;
            }
            
            .project-content {
              width: 100% !important;
            }
            
            /* Reduce animation intensity on mobile */
            @keyframes floatingParticles {
              0% { 
                transform: translateY(0px) translateX(0px) rotate(0deg) scale(0.7); 
                opacity: 0.15;
              }
              50% { 
                transform: translateY(-12px) translateX(8px) rotate(180deg) scale(0.8); 
                opacity: 0.4;
              }
              100% { 
                transform: translateY(0px) translateX(0px) rotate(360deg) scale(0.7); 
                opacity: 0.15;
              }
            }
          }

          @media (max-width: 640px) {
            .project-sidebar {
              text-align: center !important;
              padding: clamp(20px, 5vw, 30px) !important;
            }
          }

          @media (max-width: 480px) {
            /* Stack CTA buttons vertically on very small screens */
            .cta-buttons {
              flex-direction: column !important;
              align-items: center !important;
              gap: clamp(10px, 2vw, 12px) !important;
            }
            
            .cta-buttons button {
              width: 100% !important;
              max-width: 280px !important;
            }
          }

          /* Tablet optimizations */
          @media (min-width: 769px) and (max-width: 1024px) {
            .project-card {
              flex-direction: row !important;
            }
          }

          /* Large screen optimizations */
          @media (min-width: 1440px) {
            .universal-container {
              max-width: 1600px !important;
            }
          }

          /* Touch device optimizations */
          @media (hover: none) and (pointer: coarse) {
            .card3d:active {
              transform: scale(0.98) !important;
            }
            
            button:active {
              transform: scale(0.95) !important;
            }
            
            /* Ensure touch targets are at least 44px */
            button {
              min-height: 44px;
            }
          }

          /* High contrast mode support */
          @media (prefers-contrast: high) {
            .card3d {
              border: 2px solid #000 !important;
            }
            
            button {
              border: 2px solid #000 !important;
            }
          }

          /* Reduced motion preferences */
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
            .offer-popup {
              display: none !important;
            }
            
            .universal-container {
              max-width: 100% !important;
              padding: 10px !important;
            }
            
            .card3d {
              box-shadow: none !important;
              border: 1px solid #333 !important;
            }
          }

          /* Focus management for accessibility */
          button:focus-visible {
            outline: 3px solid var(--primary-orange);
            outline-offset: 2px;
          }

          /* Smooth scrolling */
          html {
            scroll-behavior: smooth;
          }

          /* Custom scrollbar with responsive sizing */
          ::-webkit-scrollbar {
            width: clamp(8px, 1.5vw, 12px);
          }
          
          ::-webkit-scrollbar-track {
            background: linear-gradient(45deg, #fff8f0, #f0f8ff);
            border-radius: clamp(3px, 0.8vw, 6px);
          }
          
          ::-webkit-scrollbar-thumb {
            background: linear-gradient(45deg, #FF6B35, #F7931E);
            border-radius: clamp(3px, 0.8vw, 6px);
            border: 1px solid #fff8f0;
          }
          
          ::-webkit-scrollbar-thumb:hover {
            background: linear-gradient(45deg, #F7931E, #FF6B35);
            box-shadow: 0 0 8px rgba(255, 107, 53, 0.3);
          }

          /* Enhanced button effects */
          button {
            position: relative;
            overflow: hidden;
          }

          button::before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
            transition: left 0.5s;
          }

          button:hover::before {
            left: 100%;
          }

          /* Loading states */
          .shimmer-loading {
            background: linear-gradient(90deg, 
              #f0f0f0 25%, 
              #e0e0e0 50%, 
              #f0f0f0 75%
            );
            background-size: 200% 100%;
            animation: shimmer 1.5s infinite;
          }

          @keyframes shimmer {
            0% { background-position: -200% 0; }
            100% { background-position: 200% 0; }
          }

          /* Gradient animation for backgrounds */
          @keyframes gradientShift {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }

          .animated-gradient {
            background: linear-gradient(-45deg, #FF6B35, #F7931E, #FF9800, #FFB74D);
            background-size: 400% 400%;
            animation: gradientShift 8s ease infinite;
          }

          /* Enhanced card entrance animations */
          .card-entrance {
            animation: cardEntrance 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          }

          @keyframes cardEntrance {
            0% {
              opacity: 0;
              transform: scale(0.8) rotateY(-20deg);
            }
            100% {
              opacity: 1;
              transform: scale(1) rotateY(0deg);
            }
          }

          /* Text glow effects */
          .glow-text {
            text-shadow: 
              0 0 5px rgba(255, 107, 53, 0.3),
              0 0 10px rgba(255, 107, 53, 0.2),
              0 0 20px rgba(255, 107, 53, 0.1);
          }

          /* Celebration particles for popup */
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
            50% { transform: translateY(clamp(-15px, -2vw, -20px)) rotate(5deg); }
          }
        `}
      </style>
    </>
  );
}