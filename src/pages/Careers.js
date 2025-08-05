import React, { useState, useEffect } from "react";
import Footer from "../components/Footer";
import logo from "../assets/logo.png";
import { supabase } from "../supabaseClient";

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

  useEffect(() => {
    // Show affiliate popup after 3 seconds
    const offerTimer = setTimeout(() => {
      setShowOffer(true);
      setTimeout(() => setIsOfferOpen(true), 100);
    }, 3000);

    return () => clearTimeout(offerTimer);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    // Save to Supabase
    const { error } = await supabase.from("careers").insert([form]);
    
    if (error) {
      alert("❌ Could not submit: " + error.message);
      setSubmitting(false);
      return;
    }
    
    setSubmitted(true);
    setForm({ name: "", email: "", phone: "", field: "", message: "" });
    setTimeout(() => setSubmitted(false), 4500);
    setSubmitting(false);
  };

  const closeOffer = () => {
    setIsOfferOpen(false);
    setTimeout(() => setShowOffer(false), 500);
  };

  const handleAffiliateClick = () => {
    const message = encodeURIComponent("Hi! I'm interested in joining your affiliate program.");
    window.open(`https://wa.me/923075596695?text=${message}`, '_blank');
  };

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
          left: '50%',
          top: '50%',
          transform: isOfferOpen ? 'translate(-50%, -50%)' : 'translate(-50%, -200vh)',
          zIndex: 1000,
          transition: 'all 0.5s ease-out',
          width: '90%',
          maxWidth: '500px'
        }}>
          <Card3D style={{
            background: 'linear-gradient(135deg, #FF6B35, #F7931E)',
            padding: isOfferOpen ? '30px 20px' : '30px',
            borderRadius: '20px',
            boxShadow: '0 10px 30px rgba(255, 107, 53, 0.3)',
            cursor: 'pointer',
            position: 'relative',
            transition: 'all 0.4s ease-out'
          }}>
            {!isOfferOpen ? (
              <div style={{ fontSize: '50px', textAlign: 'center' }}>💰</div>
            ) : (
              <div style={{ color: 'white', textAlign: 'center' }}>
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
                
                <div style={{ fontSize: '40px', marginBottom: '15px' }}>
                  💰
                </div>
                
                <h3 style={{
                  margin: '0 0 15px 0',
                  fontSize: 'clamp(20px, 5vw, 28px)',
                  fontWeight: 'bold',
                  textShadow: '2px 2px 4px rgba(0,0,0,0.1)'
                }}>
                  Join Our Affiliate Program!
                </h3>
                
                <p style={{
                  fontSize: 'clamp(16px, 4vw, 20px)',
                  lineHeight: 1.6,
                  margin: '0 0 20px 0',
                }}>
                  Earn up to 
                  <div style={{
                    fontSize: 'clamp(18px, 4.5vw, 24px)',
                    fontWeight: 'bold',
                    margin: '10px 0',
                    padding: '8px',
                    background: 'rgba(255,255,255,0.1)',
                    borderRadius: '10px',
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
                    padding: '12px 25px',
                    borderRadius: '30px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    fontSize: 'clamp(16px, 4vw, 18px)',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 5px 15px rgba(0,0,0,0.1)',
                    marginTop: '10px'
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
                  🤝 Join Program Now
                </button>
              </div>
            )}
          </Card3D>
        </div>
      )}

      {/* Header */}
      <div style={{
        maxWidth: '630px',
        width: '90%',
        margin: "25px auto 20px auto",
      }}>
        <Card3D style={{
          padding: "25px 20px",
          textAlign: "center"
        }}>
          <img
            src={logo}
            alt="Syed Solar Energy Logo"
            style={{
              width: '75px',
              height: "auto",
              margin: "0 auto 8px auto",
              borderRadius: '16px',
              boxShadow: "0 2px 14px #ffe0b240"
            }}
          />
          <h2 style={{
            color: "#FF9800",
            fontWeight: 900,
            fontSize: "clamp(1.6rem, 5vw, 2.1rem)",
            marginBottom: '7px'
          }}>
            Careers at Syed Solar Energy
          </h2>
          
          <div style={{
            background: "#ffe8c7",
            borderRadius: '12px',
            padding: "10px 12px",
            margin: "12px 0",
            fontWeight: 700,
            color: "#e65100",
            fontSize: "clamp(0.9rem, 3.5vw, 1.1rem)"
          }}>
            ⚠️ Currently we are not hiring, but accepting applications for future opportunities
          </div>
          
          <div style={{
            fontSize: 'clamp(0.95rem, 3.5vw, 1.125rem)',
            color: "#444",
            fontWeight: 500,
            margin: "10px 0 0 0"
          }}>
            At <b>Syed Solar Energy</b>, we champion diversity and inclusion. <br />
            <span style={{ color: "#E65100", fontWeight: 700 }}>We're Race-Free, Religion-Free, Gender-Free, Geography-Free.</span>
          </div>
          
          <p style={{
            color: "#222",
            fontSize: 'clamp(0.9rem, 3.5vw, 1.03rem)',
            margin: "15px 0 0 0",
            lineHeight: 1.7,
            fontWeight: 500,
          }}>
            We're building a team where every voice matters. Join our mission to transform Pakistan's energy future. 
            Submit your application to be part of our talent community - we'll contact you when positions matching 
            your skills become available.
          </p>
        </Card3D>
      </div>

      {/* Job Cards */}
      <div style={{
        maxWidth: '880px',
        width: '90%',
        margin: "0 auto",
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(270px, 1fr))",
        gap: "20px",
        padding: "0 0 25px 0"
      }}>
        <Card3D style={jobCardStyle}>
          <h4 style={jobTitleStyle}>Intern Electrical Engineer</h4>
          <p style={jobDescriptionStyle}>Gain practical experience with our engineering and installation teams. Ideal for recent graduates seeking hands-on learning.</p>
          <div style={jobContactStyle}>Email: sales@syedsolarenergy.com</div>
        </Card3D>
        
        <Card3D style={jobCardStyle}>
          <h4 style={jobTitleStyle}>Solar Sales Executive</h4>
          <p style={jobDescriptionStyle}>Drive renewable energy adoption through building and managing client relationships. We seek confident communicators passionate about sustainability.</p>
          <div style={jobContactStyle}>Email: sales@syedsolarenergy.com</div>
        </Card3D>
        
        <Card3D style={jobCardStyle}>
          <h4 style={jobTitleStyle}>Solar Technician</h4>
          <p style={jobDescriptionStyle}>Field-based role for skilled technicians. Responsibilities include installation, maintenance, and troubleshooting of solar systems.</p>
          <div style={jobContactStyle}>Email: sales@syedsolarenergy.com</div>
        </Card3D>
        
        <Card3D style={jobCardStyle}>
          <h4 style={jobTitleStyle}>Customer Support Officer</h4>
          <p style={jobDescriptionStyle}>Provide exceptional customer service, addressing inquiries and offering after-sales support. We seek friendly, solution-oriented individuals.</p>
          <div style={jobContactStyle}>Email: sales@syedsolarenergy.com</div>
        </Card3D>
      </div>

      {/* Talent Community Form */}
      <div style={{
        maxWidth: '630px',
        width: '90%',
        margin: "0 auto 30px auto",
      }}>
        <Card3D style={{
          padding: "20px 18px",
          textAlign: "center"
        }}>
          <h3 style={{
            color: "#FF9800",
            fontWeight: 800,
            fontSize: 'clamp(1.1rem, 4vw, 1.3rem)',
            margin: "0 0 12px 0"
          }}>
            Join Our Talent Community
          </h3>
          
          <p style={{ 
            color: "#444", 
            fontSize: 'clamp(0.85rem, 3.5vw, 0.97rem)', 
            marginBottom: '10px' 
          }}>
            Submit your details for future opportunities. We'll reach out when matching roles open!
          </p>
          
          <form onSubmit={handleSubmit} style={{ 
            maxWidth: '400px', 
            margin: "0 auto", 
            textAlign: "left",
            width: '100%' 
          }}>
            <label style={labelStyle}>Full Name</label>
            <input name="name" required value={form.name} onChange={handleChange} style={inputStyle} placeholder="Your Name" />
            
            <label style={labelStyle}>Email</label>
            <input name="email" required type="email" value={form.email} onChange={handleChange} style={inputStyle} placeholder="Your Email" />
            
            <label style={labelStyle}>Phone Number</label>
            <input name="phone" required value={form.phone} onChange={handleChange} style={inputStyle} placeholder="03XXXXXXXXX" />
            
            <label style={labelStyle}>Field of Interest</label>
            <select name="field" required value={form.field} onChange={handleChange} style={inputStyle}>
              <option value="">Select...</option>
              <option>Engineering</option>
              <option>Technician</option>
              <option>Sales & Marketing</option>
              <option>Customer Support</option>
              <option>Administration</option>
              <option>Other</option>
            </select>
            
            <label style={labelStyle}>Briefly Tell Us About Yourself</label>
            <textarea name="message" required value={form.message} onChange={handleChange} style={{...inputStyle, minHeight: '90px'}} placeholder="Your message..." />
            
            <div style={{ textAlign: 'center' }}>
              <button type="submit" style={{
                marginTop: '15px',
                background: "linear-gradient(90deg, #ff9800, #ff6b35)",
                color: "#fff",
                fontWeight: 800,
                border: "none",
                borderRadius: '10px',
                fontSize: 'clamp(1rem, 4vw, 1.17rem)',
                padding: "10px 25px",
                cursor: "pointer",
                boxShadow: "0 2px 10px #ffb10021",
                transition: "all 0.3s ease",
                width: '100%',
                maxWidth: '250px'
              }} 
              onMouseEnter={(e) => {
                e.target.style.transform = "translateY(-2px)";
                e.target.style.boxShadow = "0 4px 15px #ffb10055";
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = "translateY(0)";
                e.target.style.boxShadow = "0 2px 10px #ffb10021";
              }}
              disabled={submitting}>
                {submitting ? "Submitting..." : "Submit"}
              </button>
            </div>
            
            {submitted && (
              <div style={{
                marginTop: '15px', 
                color: "#2e7d32", 
                fontWeight: 700, 
                background: "#eafbe9",
                borderRadius: '8px', 
                padding: "10px 0",
                animation: "fadeIn 0.5s ease-out",
                fontSize: 'clamp(0.9rem, 3.5vw, 1rem)'
              }}>
                ✅ We have received your application. Thank you!
              </div>
            )}
          </form>
        </Card3D>
      </div>

      {/* Footer */}
      <Footer />

      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          
          @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.05); }
            100% { transform: scale(1); }
          }
          
          @media (max-width: 768px) {
            .job-cards-container {
              grid-template-columns: 1fr;
            }
          }
          
          @media (max-width: 480px) {
            input, select, textarea {
              font-size: 14px !important;
              padding: 10px 12px !important;
            }
            
            button[type="submit"] {
              padding: 8px 20px !important;
            }
          }
        `}
      </style>
    </section>
  );
}

// --- Styles ---
const jobCardStyle = {
  background: "#fff",
  borderRadius: '13px',
  padding: "20px 18px",
  textAlign: "left",
  display: "flex",
  flexDirection: "column",
  gap: '8px',
  height: "100%"
};

const jobTitleStyle = {
  color: "#FF9800",
  fontWeight: 800,
  fontSize: 'clamp(16px, 4vw, 18px)',
  margin: "0 0 5px 0"
};

const jobDescriptionStyle = {
  fontSize: 'clamp(0.85rem, 3.5vw, 0.95rem)',
  lineHeight: 1.6,
  flexGrow: 1
};

const jobContactStyle = {
  color: "#ba2d0b",
  fontWeight: 600,
  fontSize: 'clamp(0.8rem, 3.5vw, 0.9rem)',
  marginTop: "auto",
  paddingTop: '8px'
};

const inputStyle = {
  width: "100%",
  margin: "5px 0 12px 0",
  padding: "12px 14px",
  fontSize: 'clamp(0.9rem, 3.5vw, 1rem)',
  borderRadius: '7px',
  border: "1.5px solid #ffe8c7",
  background: "#fff",
  transition: "all 0.3s ease",
  boxSizing: "border-box"
};

const labelStyle = {
  fontSize: 'clamp(0.9rem, 3.5vw, 1rem)',
  fontWeight: 600,
  color: '#555'
};