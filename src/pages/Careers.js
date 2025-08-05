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
  // ... existing state and functions remain the same ...

  return (
    <section style={{
      background: "linear-gradient(135deg,#fff6ec 70%,#fff0d7 100%)",
      minHeight: "100vh",
      padding: 0,
      position: 'relative'
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
          width: 'clamp(300px, 90vw, 500px)'
        }}>
          <Card3D style={{
            background: 'linear-gradient(135deg, #FF6B35, #F7931E)',
            padding: isOfferOpen ? 'clamp(20px, 4vw, 40px)' : '30px',
            borderRadius: '20px',
            boxShadow: '0 10px 30px rgba(255, 107, 53, 0.3)',
            width: '100%',
            height: isOfferOpen ? 'auto' : '100px',
            cursor: 'pointer',
            position: 'relative',
            transition: 'all 0.4s ease-out'
          }}>
            {/* ... popup content remains the same ... */}
          </Card3D>
        </div>
      )}

      {/* Header */}
      <div style={{ padding: 'clamp(15px, 3vw, 35px) clamp(15px, 4vw, 30px)' }}>
        <Card3D style={{
          maxWidth: 630,
          margin: "clamp(15px, 3vw, 35px) auto clamp(10px, 2vw, 20px) auto",
          padding: "clamp(20px, 3vw, 35px) clamp(15px, 3vw, 30px)",
          textAlign: "center"
        }}>
          <img
            src={logo}
            alt="Syed Solar Energy Logo"
            style={{
              width: 'clamp(70px, 10vw, 95px)',
              height: "auto",
              margin: "0 auto clamp(5px, 1vw, 8px) auto",
              borderRadius: 16,
              boxShadow: "0 2px 14px #ffe0b240"
            }}
          />
          <h2 style={{
            color: "#FF9800",
            fontWeight: 900,
            fontSize: "clamp(1.5rem, 4vw, 2.1rem)",
            marginBottom: 'clamp(5px, 1vw, 7px)'
          }}>
            Careers at Syed Solar Energy
          </h2>
          
          <div style={{
            background: "#ffe8c7",
            borderRadius: 12,
            padding: "clamp(8px, 2vw, 12px) clamp(10px, 2vw, 15px)",
            margin: "clamp(10px, 2vw, 15px) 0",
            fontWeight: 700,
            color: "#e65100",
            fontSize: "clamp(0.9rem, 2.5vw, 1.1rem)"
          }}>
            ⚠️ Currently we are not hiring, but accepting applications for future opportunities
          </div>
          
          <div style={{
            fontSize: "clamp(1rem, 2.5vw, 1.125rem)",
            color: "#444",
            fontWeight: 500,
            margin: "clamp(8px, 2vw, 12px) 0 0 0"
          }}>
            At <b>Syed Solar Energy</b>, we champion diversity and inclusion. <br />
            <span style={{ color: "#E65100", fontWeight: 700 }}>We're Race-Free, Religion-Free, Gender-Free, Geography-Free.</span>
          </div>
          
          <p style={{
            color: "#222",
            fontSize: "clamp(0.9rem, 2.5vw, 1.03rem)",
            margin: "clamp(10px, 2vw, 17px) 0 0 0",
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
        maxWidth: 880,
        margin: "0 auto",
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(clamp(270px, 40vw, 300px), 1fr))",
        gap: "clamp(15px, 3vw, 26px)",
        padding: "0 clamp(10px, 3vw, 18px) clamp(15px, 3vw, 28px) clamp(10px, 3vw, 18px)"
      }}>
        <Card3D style={jobCardStyle}>
          <h4 style={jobTitleStyle}>Intern Electrical Engineer</h4>
          <p style={{ fontSize: "clamp(0.85rem, 2vw, 1rem)" }}>Gain practical experience with our engineering and installation teams. Ideal for recent graduates seeking hands-on learning.</p>
          <div style={jobContactStyle}>Email: sales@syedsolarenergy.com</div>
        </Card3D>
        
        <Card3D style={jobCardStyle}>
          <h4 style={jobTitleStyle}>Solar Sales Executive</h4>
          <p style={{ fontSize: "clamp(0.85rem, 2vw, 1rem)" }}>Drive renewable energy adoption through building and managing client relationships. We seek confident communicators passionate about sustainability.</p>
          <div style={jobContactStyle}>Email: sales@syedsolarenergy.com</div>
        </Card3D>
        
        <Card3D style={jobCardStyle}>
          <h4 style={jobTitleStyle}>Solar Technician</h4>
          <p style={{ fontSize: "clamp(0.85rem, 2vw, 1rem)" }}>Field-based role for skilled technicians. Responsibilities include installation, maintenance, and troubleshooting of solar systems.</p>
          <div style={jobContactStyle}>Email: sales@syedsolarenergy.com</div>
        </Card3D>
        
        <Card3D style={jobCardStyle}>
          <h4 style={jobTitleStyle}>Customer Support Officer</h4>
          <p style={{ fontSize: "clamp(0.85rem, 2vw, 1rem)" }}>Provide exceptional customer service, addressing inquiries and offering after-sales support. We seek friendly, solution-oriented individuals.</p>
          <div style={jobContactStyle}>Email: sales@syedsolarenergy.com</div>
        </Card3D>
      </div>

      {/* Talent Community Form */}
      <div style={{ padding: '0 clamp(15px, 4vw, 30px) clamp(20px, 4vw, 35px)' }}>
        <Card3D style={{
          maxWidth: 630,
          margin: "0 auto",
          padding: "clamp(15px, 3vw, 25px) clamp(15px, 3vw, 28px)",
          textAlign: "center"
        }}>
          <h3 style={{
            color: "#FF9800",
            fontWeight: 800,
            fontSize: "clamp(1.1rem, 3vw, 1.3rem)",
            margin: "0 0 clamp(8px, 2vw, 13px) 0"
          }}>
            Join Our Talent Community
          </h3>
          
          <p style={{ 
            color: "#444", 
            fontSize: "clamp(0.85rem, 2.5vw, 0.97rem)", 
            marginBottom: "clamp(5px, 1.5vw, 9px)" 
          }}>
            Submit your details for future opportunities. We'll reach out when matching roles open!
          </p>
          
          <form onSubmit={handleSubmit} style={{ 
            maxWidth: 400, 
            margin: "0 auto", 
            textAlign: "left" 
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
            <textarea name="message" required value={form.message} onChange={handleChange} style={inputStyle} placeholder="Your message..." rows={3} />
            
            <button type="submit" style={{
              marginTop: "clamp(10px, 2vw, 16px)",
              background: "linear-gradient(90deg, #ff9800, #ff6b35)",
              color: "#fff",
              fontWeight: 800,
              border: "none",
              borderRadius: 10,
              fontSize: "clamp(1rem, 2.5vw, 1.17rem)",
              padding: "clamp(8px, 1.5vw, 10px) clamp(20px, 3vw, 30px)",
              cursor: "pointer",
              boxShadow: "0 2px 10px #ffb10021",
              transition: "all 0.3s ease",
              width: '100%'
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
            
            {submitted && (
              <div style={{
                marginTop: "clamp(12px, 2vw, 18px)", 
                color: "#2e7d32", 
                fontWeight: 700, 
                background: "#eafbe9",
                borderRadius: 8, 
                padding: "clamp(8px, 1.5vw, 10px) 0",
                animation: "fadeIn 0.5s ease-out",
                fontSize: "clamp(0.85rem, 2.5vw, 1rem)"
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
            .job-card {
              min-height: auto !important;
            }
          }
          
          @media (max-width: 480px) {
            .affiliate-popup {
              width: 90% !important;
              left: 5% !important;
              right: 5% !important;
              transform: ${isOfferOpen ? 'translateY(-50%)' : 'translateY(-50%)'} !important;
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
  borderRadius: 13,
  padding: "clamp(15px, 2.5vw, 25px) clamp(15px, 2.5vw, 21px)",
  textAlign: "left",
  display: "flex",
  flexDirection: "column",
  gap: "clamp(6px, 1.5vw, 9px)",
  minHeight: 220,
  className: "job-card"
};

const jobTitleStyle = {
  color: "#FF9800",
  fontWeight: 800,
  fontSize: "clamp(1rem, 2.5vw, 1.125rem)",
  margin: "0 0 clamp(4px, 1vw, 6px) 0"
};

const jobContactStyle = {
  color: "#ba2d0b",
  fontWeight: 600,
  fontSize: "clamp(0.8rem, 2vw, 0.875rem)",
  marginTop: "auto",
  paddingTop: "clamp(8px, 1.5vw, 10px)"
};

const inputStyle = {
  width: "100%",
  margin: "clamp(5px, 1vw, 7px) 0 clamp(8px, 2vw, 13px) 0",
  padding: "clamp(10px, 2vw, 12px) clamp(10px, 2vw, 15px)",
  fontSize: "clamp(0.85rem, 2.5vw, 0.94rem)",
  borderRadius: 7,
  border: "1.5px solid #ffe8c7",
  background: "#fff",
  transition: "all 0.3s ease",
  boxSizing: "border-box"
};

const labelStyle = {
  fontSize: "clamp(0.85rem, 2.5vw, 0.94rem)",
  fontWeight: 600
};