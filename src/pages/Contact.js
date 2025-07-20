import React, { useState } from "react";
import { supabase } from "../supabaseClient";
import Footer from "../components/Footer";
import logo from "../assets/logo.png"; // Import logo

export default function Contact() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    // Save to Supabase
    const { error } = await supabase.from("contacts").insert([form]);
    
    if (error) {
      alert("❌ Could not submit: " + error.message);
      setSubmitting(false);
      return;
    }
    
    setSubmitted(true);
    setForm({ name: "", email: "", phone: "", message: "" });
    setSubmitting(false);
    
    // Auto-hide success message after 5 seconds
    setTimeout(() => setSubmitted(false), 5000);
  };

  // Updated social media icons with fixed TikTok icon
  const icons = [
    {
      href: "https://www.facebook.com/profile.php?id=61572382944649",
      img: "https://cdn-icons-png.flaticon.com/512/733/733547.png",
      alt: "Facebook",
      bg: "#1877f3"
    },
    {
      href: "https://www.linkedin.com/company/syed-solar-energy-pvt-ltd",
      img: "https://cdn-icons-png.flaticon.com/512/145/145807.png",
      alt: "LinkedIn",
      bg: "#0A66C2"
    },
    {
      href: "https://wa.me/923044678929",
      img: "https://cdn-icons-png.flaticon.com/512/733/733585.png",
      alt: "WhatsApp",
      bg: "#25D366"
    },
    {
      href: "https://www.instagram.com/syed.solar.energy",
      img: "https://cdn-icons-png.flaticon.com/512/2111/2111463.png",
      alt: "Instagram",
      bg: "#E4405F"
    },
    {
      // Fixed TikTok icon with white version
      href: "https://www.tiktok.com/@syed_solar_energy",
      img: "https://cdn-icons-png.flaticon.com/512/3046/3046127.png", // White TikTok icon
      alt: "TikTok",
      bg: "#000"
    }
  ];

  return (
    <section style={{ 
      background: "#fff6ec", 
      minHeight: "100vh", 
      padding: 0,
      position: 'relative'
    }}>
      {/* Success Message */}
      {submitted && (
        <div style={{
          position: 'fixed',
          top: 20,
          left: '50%',
          transform: 'translateX(-50%)',
          background: '#e8f5e9',
          color: '#2e7d32',
          padding: '15px 30px',
          borderRadius: 8,
          fontWeight: 700,
          zIndex: 1000,
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          animation: 'slideDown 0.5s ease-out',
          border: '1px solid #a5d6a7',
          display: 'flex',
          alignItems: 'center',
          gap: 10
        }}>
          <span style={{ fontSize: 24 }}>✓</span>
          <div>
            <div style={{ fontWeight: 800 }}>Message Received!</div>
            We have received your message and will contact you soon.<br />
            Thanks for contacting Syed Solar Energy.
          </div>
        </div>
      )}

      <div style={{
        maxWidth: 520,
        margin: "36px auto 18px auto",
        background: "#fff",
        borderRadius: 16,
        boxShadow: "0 12px 30px rgba(255, 152, 0, 0.15)",
        padding: "40px 32px 30px 32px",
        position: 'relative',
        overflow: 'hidden',
        border: '1px solid #ffeedd'
      }}>
        {/* Logo and Urdu Tagline */}
        <div style={{ 
          textAlign: 'center', 
          marginBottom: 25,
          position: 'relative',
          zIndex: 1
        }}>
          <img 
            src={logo} 
            alt="Syed Solar Energy" 
            style={{ 
              width: 100, 
              height: 'auto',
              margin: '0 auto 12px',
              borderRadius: 12,
              boxShadow: '0 4px 12px rgba(255, 152, 0, 0.15)'
            }} 
          />
          <div style={{
            fontFamily: "'Noto Nastaliq Urdu', serif",
            fontSize: '1.5rem',
            color: '#FF9800',
            fontWeight: 600,
            lineHeight: 1.4,
            margin: '10px 0 0',
            textShadow: '0 2px 4px rgba(0,0,0,0.05)'
          }}>
            صاف توانائی کے سفر کا روشن راستہ
          </div>
        </div>

        {/* Decorative elements */}
        <div style={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: 120,
          height: 120,
          background: 'linear-gradient(135deg, #ff6b35, #ff9800)',
          borderRadius: '0 0 0 100%',
          opacity: 0.08
        }}></div>
        
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          width: 100,
          height: 100,
          background: 'linear-gradient(135deg, #ff9800, #ff6b35)',
          borderRadius: '0 100% 0 0',
          opacity: 0.08
        }}></div>

        <h2 style={{
          textAlign: "center",
          color: "#FF9800",
          fontSize: 32,
          fontWeight: 800,
          letterSpacing: ".5px",
          marginBottom: 24,
          position: 'relative',
          zIndex: 1
        }}>
          Get in Touch
        </h2>
        
        <p style={{
          textAlign: 'center',
          color: '#555',
          margin: '0 auto 28px auto',
          maxWidth: '90%',
          lineHeight: 1.6,
          position: 'relative',
          zIndex: 1
        }}>
          Have questions about solar solutions? Our team is ready to assist you with expert advice.
        </p>

        <form onSubmit={handleSubmit} autoComplete="off" style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ marginBottom: 20 }}>
            <label htmlFor="name" style={labelStyle}>Full Name</label>
            <input
              name="name" id="name" type="text" value={form.name}
              onChange={handleChange} placeholder="Enter your name"
              style={inputStyle} required
            />
          </div>
          
          <div style={{ marginBottom: 20 }}>
            <label htmlFor="email" style={labelStyle}>Email Address</label>
            <input
              name="email" id="email" type="email" value={form.email}
              onChange={handleChange} placeholder="Enter your email"
              style={inputStyle} required
            />
          </div>
          
          <div style={{ marginBottom: 20 }}>
            <label htmlFor="phone" style={labelStyle}>Phone Number</label>
            <input
              name="phone" id="phone" type="text" value={form.phone}
              onChange={handleChange} placeholder="03XXXXXXXXX"
              style={inputStyle} required
            />
          </div>
          
          <div style={{ marginBottom: 28 }}>
            <label htmlFor="message" style={labelStyle}>Your Message</label>
            <textarea
              name="message" id="message" rows={4} value={form.message}
              onChange={handleChange} placeholder="Write your message..."
              style={{ ...inputStyle, resize: "vertical", minHeight: 120 }} required
            />
          </div>
          
          <button 
            type="submit" 
            style={buttonStyle} 
            disabled={submitting}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = "0 6px 16px rgba(255, 107, 53, 0.35)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 4px 12px rgba(255, 152, 0, 0.3)";
            }}
          >
            {submitting ? "Sending..." : "Send Message"}
          </button>
        </form>
        
        {/* Social section */}
        <div style={{ marginTop: 40, position: 'relative', zIndex: 1 }}>
          <h3 style={{
            fontWeight: 700,
            textAlign: "center",
            fontSize: 20,
            color: "#222",
            marginBottom: 20,
            letterSpacing: ".1px",
            position: 'relative'
          }}>
            Connect With Us
            <div style={{
              position: 'absolute',
              bottom: -8,
              left: '50%',
              transform: 'translateX(-50%)',
              width: 50,
              height: 3,
              background: 'linear-gradient(90deg, #ff9800, #ff6b35)',
              borderRadius: 3
            }}></div>
          </h3>
          
          <div style={{
            display: "flex",
            justifyContent: "center",
            gap: 20,
            marginBottom: 22,
            flexWrap: "wrap"
          }}>
            {icons.map((icon, i) => (
              <a
                key={i}
                href={icon.href}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: icon.bg,
                  borderRadius: "50%",
                  width: 46,
                  height: 46,
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                  transition: "all 0.3s ease",
                  border: "2px solid #fff"
                }}
                title={icon.alt}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-5px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                <img 
                  src={icon.img} 
                  alt={icon.alt} 
                  style={{ 
                    width: 22, 
                    height: 22,
                    filter: icon.alt === "TikTok" ? "invert(1)" : "none"
                  }} 
                />
              </a>
            ))}
          </div>
          
          <div style={{ textAlign: "center", marginBottom: 8 }}>
            <a
              href="https://g.co/kgs/oN8oztk"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: "#E65100",
                fontWeight: 700,
                textDecoration: "none",
                fontSize: 16,
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: '10px 20px',
                background: '#fff9e6',
                borderRadius: 30,
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#fff0cc';
                e.currentTarget.style.transform = "scale(1.05)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#fff9e6';
                e.currentTarget.style.transform = "scale(1)";
              }}
            >
              <span style={{
                fontSize: 19,
                color: "#FFD600",
                marginRight: 1,
                marginTop: 1,
              }}>★</span>
              Give us a 5-Star Google Review
            </a>
          </div>
        </div>
      </div>

      {/* Use imported Footer component */}
      <Footer />
      
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Noto+Nastaliq+Urdu&display=swap');
          
          @keyframes slideDown {
            0% {
              opacity: 0;
              transform: translate(-50%, -30px);
            }
            100% {
              opacity: 1;
              transform: translate(-50%, 0);
            }
          }
        `}
      </style>
    </section>
  );
}

// Styles
const labelStyle = {
  fontWeight: 600,
  color: "#333",
  display: "block",
  marginBottom: 8,
  fontSize: 15.5,
  letterSpacing: ".03em",
  marginLeft: 3
};

const inputStyle = {
  width: "100%",
  padding: "12px 16px",
  fontSize: "1rem",
  border: "2px solid #ffdabd",
  borderRadius: 10,
  background: "#fff",
  outline: "none",
  marginBottom: 0,
  transition: "all 0.3s ease",
  boxSizing: "border-box"
};

const buttonStyle = {
  width: "100%",
  background: "linear-gradient(90deg, #ff9800, #ff6b35)",
  color: "#fff",
  padding: "14px",
  border: "none",
  borderRadius: 10,
  fontWeight: 700,
  fontSize: "1.1rem",
  letterSpacing: ".03em",
  boxShadow: "0 4px 12px rgba(255, 152, 0, 0.3)",
  cursor: "pointer",
  transition: "all 0.3s ease",
  position: "relative",
  overflow: "hidden"
};