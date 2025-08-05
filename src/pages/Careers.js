import React, { useState, useEffect } from "react";

// Mock Footer component
const Footer = () => (
  <div style={{
    padding: '20px',
    textAlign: 'center',
    background: 'rgba(255, 107, 53, 0.1)',
    color: '#666',
    fontSize: '14px'
  }}>
    © 2025 Syed Solar Energy. All rights reserved.
  </div>
);

// Enhanced Card3D Component with responsive styling
const Card3D = ({ children, className = "", style = {} }) => (
  <div
    style={{
      background: 'linear-gradient(145deg, #ffffff, #fff8f0)',
      borderRadius: 'clamp(12px, 2vw, 20px)',
      boxShadow: '0 10px 30px rgba(255, 107, 53, 0.1)',
      transition: 'all 0.4s ease',
      transform: 'translateY(0)',
      cursor: 'pointer',
      overflow: 'hidden',
      border: '1px solid rgba(255, 107, 53, 0.1)',
      ...style,
    }}
    onMouseEnter={(e) => {
      if (window.innerWidth > 768) {
        e.currentTarget.style.transform = 'translateY(-10px) scale(1.02)';
        e.currentTarget.style.boxShadow = '0 20px 40px rgba(255, 107, 53, 0.15)';
      }
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

export default function Careers() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    field: "",
    message: ""
  });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showOffer, setShowOffer] = useState(false);
  const [isOfferOpen, setIsOfferOpen] = useState(false);
  const [screenSize, setScreenSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1200,
    height: typeof window !== 'undefined' ? window.innerHeight : 800
  });

  useEffect(() => {
    const handleResize = () => {
      setScreenSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    window.addEventListener('resize', handleResize);
    
    // Show affiliate popup after 3 seconds
    const offerTimer = setTimeout(() => {
      setShowOffer(true);
      setTimeout(() => setIsOfferOpen(true), 100);
    }, 3000);

    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(offerTimer);
    };
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    // Simulate API call - replace with actual Supabase call
    setTimeout(() => {
      setSubmitted(true);
      setForm({ name: "", email: "", phone: "", field: "", message: "" });
      setTimeout(() => setSubmitted(false), 4500);
      setSubmitting(false);
    }, 1000);
  };

  const closeOffer = () => {
    setIsOfferOpen(false);
    setTimeout(() => setShowOffer(false), 500);
  };

  const handleAffiliateClick = () => {
    const message = encodeURIComponent("Hi! I'm interested in joining your affiliate program.");
    window.open(`https://wa.me/923075596695?text=${message}`, '_blank');
  };

  // Responsive calculations
  const isMobile = screenSize.width <= 768;
  const isTablet = screenSize.width > 768 && screenSize.width <= 1024;
  const isDesktop = screenSize.width > 1024;

  return (
    <section style={{
      background: "linear-gradient(135deg,#fff6ec 70%,#fff0d7 100%)",
      minHeight: "100vh",
      padding: 0,
      position: 'relative',
      overflowX: 'hidden'
    }}>
      {/* Affiliate Program Pop-up */}
      {showOffer && (
        <div style={{
          position: 'fixed',
          right: isOfferOpen ? '50%' : '-100%',
          top: '50%',
          transform: isOfferOpen ? 'translate(50%, -50%)' : 'translateY(-50%)',
          zIndex: 1000,
          transition: 'all 0.5s ease-out',
        }}>
          <Card3D style={{
            background: 'linear-gradient(135deg, #FF6B35, #F7931E)',
            padding: isOfferOpen ? (isMobile ? '25px' : '40px') : '20px',
            borderRadius: isMobile ? '15px' : '20px',
            boxShadow: '0 10px 30px rgba(255, 107, 53, 0.3)',
            width: isOfferOpen ? (isMobile ? '90vw' : isTablet ? '400px' : '500px') : '80px',
            maxWidth: isMobile ? '350px' : 'none',
            height: isOfferOpen ? 'auto' : (isMobile ? '80px' : '100px'),
            cursor: 'pointer',
            position: 'relative',
            transition: 'all 0.4s ease-out'
          }}>
            {!isOfferOpen ? (
              <div style={{ 
                fontSize: isMobile ? '30px' : '50px', 
                textAlign: 'center',
                lineHeight: 1
              }}>💰</div>
            ) : (
              <div style={{ color: 'white', textAlign: 'center' }}>
                <button
                  onClick={closeOffer}
                  style={{
                    position: 'absolute',
                    top: '10px',
                    right: '10px',
                    background: 'rgba(255,255,255,0.2)',
                    border: 'none',
                    color: 'white',
                    width: isMobile ? '25px' : '30px',
                    height: isMobile ? '25px' : '30px',
                    borderRadius: '50%',
                    cursor: 'pointer',
                    fontSize: isMobile ? '14px' : '18px',
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
                  fontSize: isMobile ? '25px' : '40px', 
                  marginBottom: isMobile ? '15px' : '20px' 
                }}>
                  💰
                </div>
                
                <h3 style={{
                  margin: '0 0 15px 0',
                  fontSize: isMobile ? '18px' : isTablet ? '24px' : '28px',
                  fontWeight: 'bold',
                  textShadow: '2px 2px 4px rgba(0,0,0,0.1)'
                }}>
                  Join Our Affiliate Program!
                </h3>
                
                <p style={{
                  fontSize: isMobile ? '14px' : '18px',
                  lineHeight: 1.6,
                  margin: '0 0 20px 0',
                  padding: '0 5px'
                }}>
                  Earn up to 
                  <div style={{
                    fontSize: isMobile ? '16px' : '22px',
                    fontWeight: 'bold',
                    margin: '8px 0',
                    padding: '8px',
                    background: 'rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    animation: 'pulse 2s infinite'
                  }}>
                    Rs 2 Lacs per month
                  </div>
                  Refer customers and earn Rs 10,000 per installation! 🌟
                </p>
                
                <button
                  onClick={handleAffiliateClick}
                  style={{
                    background: 'white',
                    color: '#FF6B35',
                    border: 'none',
                    padding: isMobile ? '10px 20px' : '15px 30px',
                    borderRadius: '30px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    fontSize: isMobile ? '14px' : '18px',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 5px 15px rgba(0,0,0,0.1)'
                  }}
                  onMouseEnter={(e) => {
                    if (window.innerWidth > 768) {
                      e.target.style.transform = 'translateY(-3px) scale(1.05)';
                      e.target.style.boxShadow = '0 8px 20px rgba(0,0,0,0.15)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'translateY(0) scale(1)';
                    e.target.style.boxShadow = '0 5px 15px rgba(0,0,0,0.1)';
                  }}
                >
                  🤝 Join Program Now
                </button>
              </div>
            )}
          </Card3D>
        </div>
      )}

      {/* Header */}
      <Card3D style={{
        maxWidth: isMobile ? '95%' : isTablet ? '85%' : '630px',
        margin: `${isMobile ? '20px' : '35px'} auto ${isMobile ? '15px' : '20px'} auto`,
        padding: isMobile ? "20px 15px" : isTablet ? "25px 20px" : "35px 30px 25px 30px",
        textAlign: "center"
      }}>
        <img
          src="logo.png"
          alt="Syed Solar Energy Logo"
          style={{
            width: isMobile ? 70 : isTablet ? 80 : 95,
            height: "auto",
            margin: "0 auto 8px auto",
            borderRadius: isMobile ? 12 : 16,
            boxShadow: "0 2px 14px #ffe0b240"
          }}
        />
        
        <h2 style={{
          color: "#FF9800",
          fontWeight: 900,
          fontSize: isMobile ? "1.5rem" : isTablet ? "1.8rem" : "2.1rem",
          marginBottom: 7,
          lineHeight: 1.2
        }}>
          Careers at Syed Solar Energy
        </h2>
        
        <div style={{
          background: "#ffe8c7",
          borderRadius: isMobile ? 8 : 12,
          padding: isMobile ? "8px 10px" : "12px 15px",
          margin: "15px 0",
          fontWeight: 700,
          color: "#e65100",
          fontSize: isMobile ? "0.9rem" : "1.1rem",
          lineHeight: 1.4
        }}>
          ⚠️ Currently we are not hiring, but accepting applications for future opportunities
        </div>
        
        <div style={{
          fontSize: isMobile ? 14 : isTablet ? 16 : 18,
          color: "#444",
          fontWeight: 500,
          margin: "12px 0 0 0",
          lineHeight: 1.5
        }}>
          At <b>Syed Solar Energy</b>, we champion diversity and inclusion. <br />
          <span style={{ color: "#E65100", fontWeight: 700 }}>We're Race-Free, Religion-Free, Gender-Free, Geography-Free.</span>
        </div>
        
        <p style={{
          color: "#222",
          fontSize: isMobile ? 14 : isTablet ? 15 : 16.5,
          margin: "17px 0 0 0",
          lineHeight: 1.7,
          fontWeight: 500,
        }}>
          We're building a team where every voice matters. Join our mission to transform Pakistan's energy future. 
          Submit your application to be part of our talent community - we'll contact you when positions matching 
          your skills become available.
        </p>
      </Card3D>

      {/* Job Cards */}
      <div style={{
        maxWidth: isMobile ? '95%' : isTablet ? '90%' : '880px',
        margin: "0 auto",
        display: "grid",
        gridTemplateColumns: isMobile 
          ? "1fr" 
          : isTablet 
            ? "repeat(2, 1fr)" 
            : "repeat(auto-fit, minmax(270px, 1fr))",
        gap: isMobile ? 16 : isTablet ? 20 : 26,
        padding: isMobile ? "0 10px 20px 10px" : "0 18px 28px 18px"
      }}>
        <Card3D style={{
          background: "#fff",
          borderRadius: isMobile ? 10 : 13,
          padding: isMobile ? "18px 15px" : "25px 21px 21px 21px",
          textAlign: "left",
          display: "flex",
          flexDirection: "column",
          gap: 9,
          height: "100%"
        }}>
          <h4 style={{
            color: "#FF9800",
            fontWeight: 800,
            fontSize: isMobile ? 16 : 18,
            margin: "0 0 6px 0"
          }}>Intern Electrical Engineer</h4>
          <p style={{ fontSize: isMobile ? '14px' : '16px', lineHeight: 1.5 }}>
            Gain practical experience with our engineering and installation teams. Ideal for recent graduates seeking hands-on learning.
          </p>
          <div style={{
            color: "#ba2d0b",
            fontWeight: 600,
            fontSize: isMobile ? 12 : 14,
            marginTop: "auto",
            paddingTop: 10,
            wordBreak: 'break-word'
          }}>Email: sales@syedsolarenergy.com</div>
        </Card3D>
        
        <Card3D style={{
          background: "#fff",
          borderRadius: isMobile ? 10 : 13,
          padding: isMobile ? "18px 15px" : "25px 21px 21px 21px",
          textAlign: "left",
          display: "flex",
          flexDirection: "column",
          gap: 9,
          height: "100%"
        }}>
          <h4 style={{
            color: "#FF9800",
            fontWeight: 800,
            fontSize: isMobile ? 16 : 18,
            margin: "0 0 6px 0"
          }}>Solar Sales Executive</h4>
          <p style={{ fontSize: isMobile ? '14px' : '16px', lineHeight: 1.5 }}>
            Drive renewable energy adoption through building and managing client relationships. We seek confident communicators passionate about sustainability.
          </p>
          <div style={{
            color: "#ba2d0b",
            fontWeight: 600,
            fontSize: isMobile ? 12 : 14,
            marginTop: "auto",
            paddingTop: 10,
            wordBreak: 'break-word'
          }}>Email: sales@syedsolarenergy.com</div>
        </Card3D>
        
        <Card3D style={{
          background: "#fff",
          borderRadius: isMobile ? 10 : 13,
          padding: isMobile ? "18px 15px" : "25px 21px 21px 21px",
          textAlign: "left",
          display: "flex",
          flexDirection: "column",
          gap: 9,
          height: "100%"
        }}>
          <h4 style={{
            color: "#FF9800",
            fontWeight: 800,
            fontSize: isMobile ? 16 : 18,
            margin: "0 0 6px 0"
          }}>Solar Technician</h4>
          <p style={{ fontSize: isMobile ? '14px' : '16px', lineHeight: 1.5 }}>
            Field-based role for skilled technicians. Responsibilities include installation, maintenance, and troubleshooting of solar systems.
          </p>
          <div style={{
            color: "#ba2d0b",
            fontWeight: 600,
            fontSize: isMobile ? 12 : 14,
            marginTop: "auto",
            paddingTop: 10,
            wordBreak: 'break-word'
          }}>Email: sales@syedsolarenergy.com</div>
        </Card3D>
        
        <Card3D style={{
          background: "#fff",
          borderRadius: isMobile ? 10 : 13,
          padding: isMobile ? "18px 15px" : "25px 21px 21px 21px",
          textAlign: "left",
          display: "flex",
          flexDirection: "column",
          gap: 9,
          height: "100%"
        }}>
          <h4 style={{
            color: "#FF9800",
            fontWeight: 800,
            fontSize: isMobile ? 16 : 18,
            margin: "0 0 6px 0"
          }}>Customer Support Officer</h4>
          <p style={{ fontSize: isMobile ? '14px' : '16px', lineHeight: 1.5 }}>
            Provide exceptional customer service, addressing inquiries and offering after-sales support. We seek friendly, solution-oriented individuals.
          </p>
          <div style={{
            color: "#ba2d0b",
            fontWeight: 600,
            fontSize: isMobile ? 12 : 14,
            marginTop: "auto",
            paddingTop: 10,
            wordBreak: 'break-word'
          }}>Email: sales@syedsolarenergy.com</div>
        </Card3D>
      </div>

      {/* Talent Community Form */}
      <Card3D style={{
        maxWidth: isMobile ? '95%' : isTablet ? '85%' : '630px',
        margin: "0 auto 35px auto",
        padding: isMobile ? "20px 15px" : "25px 28px 20px 28px",
        textAlign: "center"
      }}>
        <h3 style={{
          color: "#FF9800",
          fontWeight: 800,
          fontSize: isMobile ? 18 : 21,
          margin: "0 0 13px 0"
        }}>
          Join Our Talent Community
        </h3>
        
        <p style={{ 
          color: "#444", 
          fontSize: isMobile ? 14 : 15.5, 
          marginBottom: 9,
          lineHeight: 1.5
        }}>
          Submit your details for future opportunities. We'll reach out when matching roles open!
        </p>
        
        <div style={{ 
          maxWidth: isMobile ? '100%' : '400px', 
          margin: "0 auto", 
          textAlign: "left" 
        }}>
          <label style={{ 
            fontSize: isMobile ? '14px' : '16px', 
            fontWeight: '600',
            display: 'block',
            marginBottom: '5px'
          }}>Full Name</label>
          <input 
            name="name" 
            required 
            value={form.name} 
            onChange={handleChange} 
            style={{
              width: "100%",
              margin: "7px 0 13px 0",
              padding: isMobile ? "10px 12px" : "12px 15px",
              fontSize: 16, // Prevents zoom on iOS
              borderRadius: 7,
              border: "1.5px solid #ffe8c7",
              background: "#fff",
              transition: "all 0.3s ease",
              boxSizing: "border-box"
            }}
            placeholder="Your Name" 
          />
          
          <label style={{ 
            fontSize: isMobile ? '14px' : '16px', 
            fontWeight: '600',
            display: 'block',
            marginBottom: '5px'
          }}>Email</label>
          <input 
            name="email" 
            required 
            type="email" 
            value={form.email} 
            onChange={handleChange} 
            style={{
              width: "100%",
              margin: "7px 0 13px 0",
              padding: isMobile ? "10px 12px" : "12px 15px",
              fontSize: 16,
              borderRadius: 7,
              border: "1.5px solid #ffe8c7",
              background: "#fff",
              transition: "all 0.3s ease",
              boxSizing: "border-box"
            }}
            placeholder="Your Email" 
          />
          
          <label style={{ 
            fontSize: isMobile ? '14px' : '16px', 
            fontWeight: '600',
            display: 'block',
            marginBottom: '5px'
          }}>Phone Number</label>
          <input 
            name="phone" 
            required 
            value={form.phone} 
            onChange={handleChange} 
            style={{
              width: "100%",
              margin: "7px 0 13px 0",
              padding: isMobile ? "10px 12px" : "12px 15px",
              fontSize: 16,
              borderRadius: 7,
              border: "1.5px solid #ffe8c7",
              background: "#fff",
              transition: "all 0.3s ease",
              boxSizing: "border-box"
            }}
            placeholder="03XXXXXXXXX" 
          />
          
          <label style={{ 
            fontSize: isMobile ? '14px' : '16px', 
            fontWeight: '600',
            display: 'block',
            marginBottom: '5px'
          }}>Field of Interest</label>
          <select 
            name="field" 
            required 
            value={form.field} 
            onChange={handleChange} 
            style={{
              width: "100%",
              margin: "7px 0 13px 0",
              padding: isMobile ? "10px 12px" : "12px 15px",
              fontSize: 16,
              borderRadius: 7,
              border: "1.5px solid #ffe8c7",
              background: "#fff",
              transition: "all 0.3s ease",
              boxSizing: "border-box"
            }}
          >
            <option value="">Select...</option>
            <option>Engineering</option>
            <option>Technician</option>
            <option>Sales & Marketing</option>
            <option>Customer Support</option>
            <option>Administration</option>
            <option>Other</option>
          </select>
          
          <label style={{ 
            fontSize: isMobile ? '14px' : '16px', 
            fontWeight: '600',
            display: 'block',
            marginBottom: '5px'
          }}>Briefly Tell Us About Yourself</label>
          <textarea 
            name="message" 
            required 
            value={form.message} 
            onChange={handleChange} 
            style={{
              width: "100%",
              margin: "7px 0 13px 0",
              padding: isMobile ? "10px 12px" : "12px 15px",
              fontSize: 16,
              borderRadius: 7,
              border: "1.5px solid #ffe8c7",
              background: "#fff",
              transition: "all 0.3s ease",
              boxSizing: "border-box",
              minHeight: isMobile ? '80px' : '90px',
              resize: 'vertical'
            }}
            placeholder="Your message..." 
            rows={3} 
          />
          
          <button 
            type="button"
            onClick={handleSubmit}
            style={{
              marginTop: 16,
              background: "linear-gradient(90deg, #ff9800, #ff6b35)",
              color: "#fff",
              fontWeight: 800,
              border: "none",
              borderRadius: 10,
              fontSize: isMobile ? "1rem" : "1.17rem",
              padding: isMobile ? "12px 25px" : "10px 30px",
              cursor: "pointer",
              boxShadow: "0 2px 10px #ffb10021",
              transition: "all 0.3s ease",
              width: isMobile ? "100%" : "auto",
              minHeight: '44px'
            }}
            onMouseEnter={(e) => {
              if (window.innerWidth > 768) {
                e.target.style.transform = "translateY(-2px)";
                e.target.style.boxShadow = "0 4px 15px #ffb10055";
              }
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = "translateY(0)";
              e.target.style.boxShadow = "0 2px 10px #ffb10021";
            }}
            disabled={submitting}
          >
            {submitting ? "Submitting..." : "Submit"}
          </button>
          
          {submitted && (
            <div style={{
              marginTop: 18, 
              color: "#2e7d32", 
              fontWeight: 700, 
              background: "#eafbe9",
              borderRadius: 8, 
              padding: "10px",
              animation: "fadeIn 0.5s ease-out",
              textAlign: 'center',
              fontSize: isMobile ? '14px' : '16px'
            }}>
              ✅ We have received your application. Thank you!
            </div>
          )}
        </div>
      </Card3D>

      {/* Footer */}
      <Footer />

      <style>
        {`
          * {
            box-sizing: border-box;
          }
          
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          
          @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.05); }
            100% { transform: scale(1); }
          }

          /* Responsive typography */
          html {
            scroll-behavior: smooth;
            -webkit-text-size-adjust: 100%;
          }

          body {
            overflow-x: hidden;
            margin: 0;
            padding: 0;
          }

          /* Better touch targets for mobile */
          @media (max-width: 768px) {
            button, input, select, textarea {
              min-height: 44px;
            }
          }

          /* Prevent zoom on iOS */
          input, select, textarea {
            font-size: 16px !important;
            -webkit-appearance: none;
            -moz-appearance: none;
            appearance: none;
          }

          /* Safe area support for modern devices */
          @supports (padding: max(0px)) {
            section {
              padding-left: max(0px, env(safe-area-inset-left));
              padding-right: max(0px, env(safe-area-inset-right));
            }
          }

          /* Improved focus states */
          input:focus, select:focus, textarea:focus, button:focus {
            outline: 2px solid #FF6B35;
            outline-offset: 2px;
          }

          /* Smooth transitions */
          * {
            transition: color 0.3s ease, background-color 0.3s ease, border-color 0.3s ease;
          }

          /* Print styles */
          @media print {
            .affiliate-popup {
              display: none !important;
            }
          }
        `}
      </style>
    </section>
  );
}