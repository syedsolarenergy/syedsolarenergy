import React, { useState, useEffect } from "react";
import Footer from "../components/Footer";
import { FiSettings, FiBatteryCharging, FiSun, FiRefreshCw, FiShoppingBag, FiTool } from "react-icons/fi";
import { supabase } from "../supabaseClient";

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

// Enhanced Service Card Component
const ServiceCard = ({ service, index }) => {
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

    const element = document.getElementById(`service-${index}`);
    if (element) observer.observe(element);

    return () => observer.disconnect();
  }, [index]);

  const getServiceColor = (title) => {
    if (title.includes("Solar System")) return "#ff9800";
    if (title.includes("Daytime")) return "#1db954";
    if (title.includes("Hybrid")) return "#2176ae";
    if (title.includes("Inverter Sales")) return "#c0392b";
    if (title.includes("Repairs")) return "#e67e22";
    if (title.includes("Upgrades")) return "#8d48e3";
    return "#ff9800";
  };

  const serviceColor = getServiceColor(service.title);

  return (
    <Card3D
      id={`service-${index}`}
      style={{
        background: `linear-gradient(145deg, ${service.bg}, #ffffff)`,
        padding: "40px 30px 35px 30px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        minHeight: 280,
        textAlign: "center",
        position: 'relative',
        animation: isVisible ? `fadeInUp 0.8s ease-out ${index * 0.1}s both` : 'none'
      }}
    >
      {/* Background decoration */}
      <div style={{
        position: 'absolute',
        top: '15px',
        right: '15px',
        width: '60px',
        height: '60px',
        background: `linear-gradient(45deg, ${serviceColor}20, transparent)`,
        borderRadius: '50%',
        animation: 'pulse 3s ease-in-out infinite'
      }}></div>

      {/* Icon container with enhanced styling */}
      <div style={{
        width: '80px',
        height: '80px',
        background: `linear-gradient(135deg, ${serviceColor}15, ${serviceColor}25)`,
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '25px',
        border: `3px solid ${serviceColor}`,
        boxShadow: `0 10px 30px ${serviceColor}30`,
        transition: 'all 0.3s ease',
        position: 'relative',
        overflow: 'hidden'
      }}
      onMouseEnter={(e) => {
        e.target.style.transform = 'scale(1.1) rotate(5deg)';
        e.target.style.boxShadow = `0 15px 40px ${serviceColor}40`;
      }}
      onMouseLeave={(e) => {
        e.target.style.transform = 'scale(1) rotate(0deg)';
        e.target.style.boxShadow = `0 10px 30px ${serviceColor}30`;
      }}
      >
        {/* Shimmer effect */}
        <div style={{
          position: 'absolute',
          top: '0',
          left: '0',
          right: '0',
          bottom: '0',
          background: 'linear-gradient(45deg, transparent, rgba(255,255,255,0.4), transparent)',
          transform: 'translateX(-100%)',
          animation: 'shimmer 3s ease-in-out infinite'
        }}></div>
        <div style={{ fontSize: '42px', zIndex: 1 }}>
          {service.icon}
        </div>
      </div>

      <h3 style={{
        background: `linear-gradient(45deg, ${serviceColor}, #F7931E)`,
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
        fontWeight: 800,
        fontSize: 22,
        margin: "0 0 15px 0",
        letterSpacing: ".01em",
        lineHeight: '1.3'
      }}>
        {service.title}
      </h3>

      <p style={{
        color: "#333",
        fontWeight: 500,
        fontSize: 16,
        lineHeight: '1.6',
        margin: 0,
        opacity: 0.9
      }}>
        {service.desc}
      </p>

      {/* Service badge */}
      <div style={{
        position: 'absolute',
        bottom: '15px',
        left: '50%',
        transform: 'translateX(-50%)',
        background: `linear-gradient(45deg, ${serviceColor}, #F7931E)`,
        color: 'white',
        padding: '6px 16px',
        borderRadius: '15px',
        fontSize: '12px',
        fontWeight: 'bold',
        textTransform: 'uppercase',
        letterSpacing: '1px'
      }}>
        Professional Service
      </div>
    </Card3D>
  );
};

// Enhanced Stats Component
const ServiceStats = () => {
  const stats = [
    { number: "500+", label: "Systems Installed", icon: "⚡", color: "#FF6B35" },
    { number: "24/7", label: "Support Available", icon: "🛠️", color: "#1db954" },
    { number: "5+", label: "Years Warranty", icon: "🛡️", color: "#2176ae" },
    { number: "100%", label: "Satisfaction Rate", icon: "⭐", color: "#e67e22" }
  ];

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '25px',
      marginBottom: '60px'
    }}>
      {stats.map((stat, index) => (
        <Card3D key={stat.label} style={{
          padding: '30px 20px',
          textAlign: 'center',
          animation: `fadeInUp 0.8s ease-out ${index * 0.1}s both`
        }}>
          <div style={{
            fontSize: '36px',
            marginBottom: '15px',
            animation: 'bounce 2s ease-in-out infinite'
          }}>
            {stat.icon}
          </div>
          <div style={{
            fontSize: '32px',
            fontWeight: 'bold',
            color: stat.color,
            marginBottom: '8px',
            background: `linear-gradient(45deg, ${stat.color}, #F7931E)`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            {stat.number}
          </div>
          <p style={{
            color: '#666',
            fontSize: '14px',
            fontWeight: '600',
            margin: 0,
            textTransform: 'uppercase',
            letterSpacing: '1px'
          }}>
            {stat.label}
          </p>
        </Card3D>
      ))}
    </div>
  );
};

const serviceList = [
  {
    icon: <FiSun size={36} color="#ff9800" />,
    title: "Complete Solar System Installation",
    desc: "We deliver turnkey solar solutions—site survey, system design, top-tier panels, branded inverters, professional wiring, net metering, and safety equipment. Every installation comes with full commissioning and training, so you enjoy peace of mind from day one.",
    bg: "#fff6ec"
  },
  {
    icon: <FiBatteryCharging size={36} color="#1db954" />,
    title: "Daytime Systems (5kVA, 7kVA, 10kVA)",
    desc: "Perfect for homes and shops needing maximum solar benefit during sunlight hours. Our daytime systems are optimized for grid savings and can be scaled for growing energy needs, with sturdy hardware and 5-year inverter warranty.",
    bg: "#f3fff3"
  },
  {
    icon: <FiSettings size={36} color="#2176ae" />,
    title: "Hybrid Systems (3kW and Above)",
    desc: "Hybrid solutions integrate solar, battery, and grid so your property has energy day and night. High-efficiency lithium or tubular batteries, seamless switching, and monitoring apps—ideal for areas with frequent outages or backup needs.",
    bg: "#e8f3ff"
  },
  {
    icon: <FiShoppingBag size={36} color="#c0392b" />,
    title: "Inverter Sales (All Brands)",
    desc: "We stock and recommend only reliable, high-performing inverters: Inverex, Growatt, Ziewnic, Solis, Tesla, and more. Full support for installation and after-sales, competitive pricing, and warranty claims managed by our experts.",
    bg: "#fff0f0"
  },
  {
    icon: <FiTool size={36} color="#e67e22" />,
    title: "Inverter Repairs & Maintenance",
    desc: "Our skilled engineers offer rapid troubleshooting, board-level repairs, software updates, and preventive maintenance for all major inverter brands. We use genuine parts for lasting results and minimum downtime.",
    bg: "#fff8ee"
  },
  {
    icon: <FiRefreshCw size={36} color="#8d48e3" />,
    title: "System Upgrades & AMC",
    desc: "From adding batteries to scaling up your panels or upgrading inverters, we ensure your solar system always meets your needs. Ask about our Annual Maintenance Contracts (AMC) for ongoing performance and savings.",
    bg: "#f6f1ff"
  }
];

export default function Services() {
  // --- Service Request Form State ---
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    service: "",
    details: "",
  });
  const [sent, setSent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setIsSubmitting(true);

    // --- Save to Supabase ---
    const { data, error } = await supabase.from("service_requests").insert([{
      name: form.name,
      phone: form.phone,
      email: form.email,
      service: form.service,
      details: form.details,
      created_at: new Date().toISOString(),
    }]);
    
    setIsSubmitting(false);

    if (error) {
      alert("❌ Could not submit: " + error.message);
      return;
    }

    setSent(true);
    setTimeout(() => setSent(false), 4000);
    setForm({
      name: "",
      phone: "",
      email: "",
      service: "",
      details: "",
    });
  };

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
        {[...Array(10)].map((_, i) => (
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

        {/* Enhanced Heading Section */}
        <Card3D style={{
          maxWidth: 800,
          margin: "0 auto 50px auto",
          padding: "50px 40px 40px 40px",
          textAlign: "center",
          position: 'relative',
          overflow: 'visible',
          animation: 'fadeInUp 0.8s ease-out'
        }}>
          {/* Decorative element */}
          <div style={{
            position: 'absolute',
            top: '-25px',
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
            boxShadow: '0 10px 30px rgba(255, 107, 53, 0.3)',
            animation: 'bounce 2s ease-in-out infinite'
          }}>
            🔧
          </div>

          <h1 style={{
            background: 'linear-gradient(45deg, #FF6B35, #F7931E)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            fontWeight: 900,
            fontSize: "2.8rem",
            marginBottom: 20,
            marginTop: 25
          }}>
            Our Services
          </h1>
          <p style={{
            color: "#333",
            fontWeight: 500,
            fontSize: 20,
            margin: 0,
            lineHeight: '1.6',
            maxWidth: '600px',
            marginLeft: 'auto',
            marginRight: 'auto'
          }}>
            Everything you need for solar—from new installations to repair and after-sales care.
          </p>
          
          {/* Enhanced tagline */}
          <div style={{
            marginTop: '25px',
            padding: '15px 25px',
            background: 'linear-gradient(135deg, #fff7e6, #ffffff)',
            borderRadius: '15px',
            border: '2px solid #F7931E',
            display: 'inline-block'
          }}>
            <span style={{
              fontSize: '16px',
              color: '#FF6B35',
              fontWeight: 'bold',
              textTransform: 'uppercase',
              letterSpacing: '1px'
            }}>
              ⚡ Professional • Reliable • Guaranteed
            </span>
          </div>
        </Card3D>

        {/* Enhanced Stats Section */}
        <div style={{
          maxWidth: 1100,
          margin: "0 auto 60px auto"
        }}>
          <ServiceStats />
        </div>

        {/* Enhanced Services Grid */}
        <div style={{
          maxWidth: 1200,
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
            Our Expert Services
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
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))",
            gap: 40
          }}>
            {serviceList.map((service, index) => (
              <ServiceCard key={service.title} service={service} index={index} />
            ))}
          </div>
        </div>

        {/* Enhanced Service Request Form */}
        <Card3D style={{
          maxWidth: 600,
          margin: "0 auto 40px auto",
          padding: "50px 40px 40px 40px",
          textAlign: "center",
          position: 'relative',
          animation: 'fadeInUp 0.8s ease-out 0.6s both'
        }}>
          {/* Form header decoration */}
          <div style={{
            position: 'absolute',
            top: '-25px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '60px',
            height: '60px',
            background: 'linear-gradient(45deg, #e65100, #ff9800)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '24px',
            boxShadow: '0 10px 30px rgba(230, 81, 0, 0.3)',
            animation: 'pulse 3s ease-in-out infinite'
          }}>
            📋
          </div>

          <h3 style={{
            background: 'linear-gradient(45deg, #e65100, #ff9800)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            fontWeight: 800,
            fontSize: 28,
            marginBottom: 25,
            marginTop: 25
          }}>
            Request a Service
          </h3>

          <p style={{
            color: '#666',
            fontSize: '16px',
            marginBottom: '30px',
            lineHeight: '1.6'
          }}>
            Get a free consultation and quote for your solar energy needs
          </p>

          {sent && (
            <div style={{
              background: "linear-gradient(135deg, #e9fbe7, #f0fff0)",
              color: "#12b500",
              padding: "20px 25px",
              borderRadius: 15,
              marginBottom: 25,
              fontWeight: 700,
              fontSize: '16px',
              border: '2px solid #12b500',
              boxShadow: '0 8px 25px rgba(18, 181, 0, 0.2)',
              animation: 'fadeInUp 0.5s ease-out'
            }}>
              ✅ Thank you! Your request has been submitted successfully.
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: "grid", gap: 20 }}>
            <div style={{ position: 'relative' }}>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Full Name"
                required
                style={{
                  ...enhancedInputStyle,
                  paddingLeft: '50px'
                }}
                autoComplete="off"
              />
              <span style={{
                position: 'absolute',
                left: '15px',
                top: '50%',
                transform: 'translateY(-50%)',
                fontSize: '18px',
                color: '#FF6B35'
              }}>👤</span>
            </div>

            <div style={{ position: 'relative' }}>
              <input
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="Phone Number"
                required
                style={{
                  ...enhancedInputStyle,
                  paddingLeft: '50px'
                }}
                autoComplete="off"
                pattern="[0-9+ ]*"
                maxLength={16}
              />
              <span style={{
                position: 'absolute',
                left: '15px',
                top: '50%',
                transform: 'translateY(-50%)',
                fontSize: '18px',
                color: '#FF6B35'
              }}>📞</span>
            </div>

            <div style={{ position: 'relative' }}>
              <input
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="Email Address"
                required
                style={{
                  ...enhancedInputStyle,
                  paddingLeft: '50px'
                }}
                type="email"
                autoComplete="off"
              />
              <span style={{
                position: 'absolute',
                left: '15px',
                top: '50%',
                transform: 'translateY(-50%)',
                fontSize: '18px',
                color: '#FF6B35'
              }}>📧</span>
            </div>

            <div style={{ position: 'relative' }}>
              <select
                name="service"
                value={form.service}
                onChange={handleChange}
                required
                style={{ 
                  ...enhancedInputStyle, 
                  fontWeight: 600, 
                  color: form.service ? "#333" : "#aaa",
                  paddingLeft: '50px'
                }}
              >
                <option value="">Select Service</option>
                {serviceList.map(svc =>
                  <option key={svc.title} value={svc.title}>{svc.title}</option>
                )}
              </select>
              <span style={{
                position: 'absolute',
                left: '15px',
                top: '50%',
                transform: 'translateY(-50%)',
                fontSize: '18px',
                color: '#FF6B35'
              }}>⚙️</span>
            </div>

            <div style={{ position: 'relative' }}>
              <textarea
                name="details"
                value={form.details}
                onChange={handleChange}
                placeholder="Describe your requirements (site address, system size, issue, etc.)"
                required
                rows={4}
                style={{ 
                  ...enhancedInputStyle, 
                  minHeight: 100, 
                  fontFamily: "inherit",
                  paddingLeft: '50px',
                  paddingTop: '15px'
                }}
              />
              <span style={{
                position: 'absolute',
                left: '15px',
                top: '15px',
                fontSize: '18px',
                color: '#FF6B35'
              }}>📝</span>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                background: isSubmitting 
                  ? "linear-gradient(90deg, #ccc, #aaa)"
                  : "linear-gradient(90deg, #ff9800, #ff6b35)",
                color: "#fff",
                fontWeight: 700,
                fontSize: 18,
                border: "none",
                borderRadius: 15,
                padding: "18px 0",
                marginTop: 10,
                cursor: isSubmitting ? "not-allowed" : "pointer",
                boxShadow: isSubmitting 
                  ? "none"
                  : "0 8px 25px rgba(255, 152, 0, 0.3)",
                letterSpacing: ".02em",
                textTransform: 'uppercase',
                transition: 'all 0.3s ease',
                position: 'relative',
                overflow: 'hidden'
              }}
              onMouseEnter={(e) => {
                if (!isSubmitting) {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 12px 35px rgba(255, 152, 0, 0.4)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isSubmitting) {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 8px 25px rgba(255, 152, 0, 0.3)';
                }
              }}
            >
              {isSubmitting ? "⏳ Submitting..." : "🚀 Submit Request"}
            </button>
          </form>

          {/* Trust indicators */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '30px',
            marginTop: '25px',
            fontSize: '14px',
            color: '#666',
            flexWrap: 'wrap'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <span>✅</span>
              <span>Free Consultation</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <span>⚡</span>
              <span>Quick Response</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <span>🛡️</span>
              <span>Guaranteed Quality</span>
            </div>
          </div>
        </Card3D>

        {/* Call to Action Section */}
        <Card3D style={{
          maxWidth: 800,
          margin: "0 auto 40px auto",
          padding: "40px 35px",
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
            top: '15px',
            right: '15px',
            width: '70px',
            height: '70px',
            background: 'rgba(255,255,255,0.1)',
            borderRadius: '50%',
            animation: 'float 6s ease-in-out infinite'
          }}></div>

          <h2 style={{
            fontSize: '32px',
            fontWeight: 'bold',
            marginBottom: '15px',
            textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
          }}>
            Need Immediate Support?
          </h2>
          <p style={{
            fontSize: '18px',
            marginBottom: '25px',
            opacity: 0.95,
            lineHeight: '1.6'
          }}>
            Our expert team is ready to help you with emergency repairs, installations, or consultations.
          </p>
          <div style={{
            display: 'flex',
            gap: '15px',
            justifyContent: 'center',
            flexWrap: 'wrap'
          }}>
            <button
              onClick={() => window.open('https://wa.me/923075506695?text=Hi! I need immediate solar energy support. Please help me.', '_blank')}
              style={{
                background: 'rgba(255,255,255,0.9)',
                color: '#FF6600',
                border: 'none',
                padding: '12px 25px',
                borderRadius: '25px',
                fontSize: '14px',
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
              📱 WhatsApp Support
            </button>
            <button
              onClick={() => window.location.href = 'tel:+923075506695'}
              style={{
                background: 'transparent',
                color: 'white',
                border: '2px solid rgba(255,255,255,0.8)',
                padding: '10px 23px',
                borderRadius: '25px',
                fontSize: '14px',
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
              📞 Call Now
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
              transform: translateY(-15px); 
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

          /* Input focus effects */
          input:focus, select:focus, textarea:focus {
            border-color: #FF6B35 !important;
            box-shadow: 0 0 0 3px rgba(255, 107, 53, 0.1) !important;
            transform: translateY(-2px) !important;
          }

          /* Custom placeholder styling */
          ::placeholder {
            color: #999 !important;
            opacity: 1;
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

          /* Button ripple effect */
          @keyframes ripple {
            0% {
              transform: scale(0);
              opacity: 1;
            }
            100% {
              transform: scale(4);
              opacity: 0;
            }
          }

          /* Loading animation */
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }

          /* Gradient animation */
          @keyframes gradientShift {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }

          /* Responsive design */
          @media (max-width: 768px) {
            .service-grid {
              grid-template-columns: 1fr !important;
              gap: 25px !important;
            }
            
            .stats-grid {
              grid-template-columns: repeat(2, 1fr) !important;
            }
            
            h1 {
              font-size: 2.2rem !important;
            }
            
            h2 {
              font-size: 1.8rem !important;
            }
          }

          @media (max-width: 480px) {
            .stats-grid {
              grid-template-columns: 1fr !important;
            }
            
            .form-buttons {
              flex-direction: column !important;
              gap: 10px !important;
            }
            
            .cta-buttons {
              flex-direction: column !important;
              align-items: center !important;
            }
          }
        `}
      </style>
    </>
  );
}

// Enhanced Input Styling
const enhancedInputStyle = {
  padding: "16px 18px",
  border: "2px solid rgba(255, 107, 53, 0.2)",
  borderRadius: 15,
  fontSize: 16,
  fontWeight: 500,
  background: "linear-gradient(135deg, #fff8f0, #ffffff)",
  outline: "none",
  transition: "all 0.3s ease",
  boxShadow: "0 4px 15px rgba(255, 107, 53, 0.1)",
  width: "100%",
  boxSizing: "border-box"
};