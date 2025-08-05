import React, { useState, useEffect } from "react";
import Footer from "../components/Footer";
import { FiSettings, FiBatteryCharging, FiSun, FiRefreshCw, FiShoppingBag, FiTool } from "react-icons/fi";
import { supabase } from "../supabaseClient";

// Enhanced CSS Variables for Universal Screen Support
const cssVariables = `
  :root {
    --primary-orange: #FF6B35;
    --secondary-orange: #F7931E;
    --font-size-base: clamp(14px, 2.5vw, 18px);
    --padding-base: clamp(12px, 4vw, 40px);
    --section-padding: clamp(30px, 6vw, 80px);
    --card-padding: clamp(20px, 4vw, 40px);
    --heading-1: clamp(2rem, 5vw, 3.5rem);
    --heading-2: clamp(1.5rem, 4vw, 2.8rem);
    --heading-3: clamp(1.25rem, 3vw, 1.8rem);
    --text-base: clamp(0.875rem, 2.2vw, 1.125rem);
    --text-small: clamp(0.75rem, 2vw, 1rem);
    --border-radius: clamp(12px, 2.5vw, 20px);
    --container-max: min(1400px, 95vw);
    --grid-gap: clamp(20px, 4vw, 40px);
    --card-min-width: min(320px, 90vw);
    --icon-size: clamp(60px, 10vw, 80px);
    --form-input-height: clamp(48px, 8vw, 56px);
  }

  /* Universal Container System */
  .universal-container {
    width: 100%;
    max-width: var(--container-max);
    margin: 0 auto;
    padding: 0 var(--padding-base);
  }

  /* Enhanced Grid Systems */
  .services-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(var(--card-min-width), 1fr));
    gap: var(--grid-gap);
    width: 100%;
  }

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(min(180px, 100%), 1fr));
    gap: clamp(16px, 3vw, 25px);
    width: 100%;
  }

  .form-grid {
    display: grid;
    gap: clamp(16px, 3vw, 20px);
    width: 100%;
  }

  /* Icon Container System */
  .icon-container {
    width: var(--icon-size);
    height: var(--icon-size);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    overflow: hidden;
    margin: 0 auto clamp(20px, 4vw, 25px);
    flex-shrink: 0;
  }

  /* Input Container System */
  .input-container {
    position: relative;
    width: 100%;
  }

  .input-icon {
    position: absolute;
    left: clamp(12px, 2.5vw, 15px);
    top: 50%;
    transform: translateY(-50%);
    font-size: clamp(16px, 3vw, 18px);
    color: var(--primary-orange);
    z-index: 2;
    pointer-events: none;
  }

  .textarea-icon {
    position: absolute;
    left: clamp(12px, 2.5vw, 15px);
    top: clamp(12px, 2.5vw, 15px);
    font-size: clamp(16px, 3vw, 18px);
    color: var(--primary-orange);
    z-index: 2;
    pointer-events: none;
  }

  /* Mobile Optimizations */
  @media (max-width: 640px) {
    :root {
      --card-min-width: 100%;
      --grid-gap: clamp(16px, 4vw, 24px);
      --icon-size: clamp(70px, 12vw, 80px);
    }
    
    .services-grid {
      grid-template-columns: 1fr;
    }
    
    .stats-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  @media (max-width: 480px) {
    .stats-grid {
      grid-template-columns: 1fr;
    }
  }

  @media (min-width: 641px) and (max-width: 1024px) {
    .services-grid {
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    }
  }

  /* Ultra-wide screen support */
  @media (min-width: 1920px) {
    :root {
      --container-max: 1600px;
    }
  }
`;

// Enhanced Card Component with better mobile support
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

// Enhanced Service Card Component with fixed icons
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
        padding: 'var(--card-padding)',
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        minHeight: 'clamp(280px, 40vw, 320px)',
        textAlign: "center",
        position: 'relative',
        animation: isVisible ? `fadeInUp 0.8s ease-out ${index * 0.1}s both` : 'none'
      }}
    >
      {/* Background decoration */}
      <div style={{
        position: 'absolute',
        top: 'clamp(12px, 2.5vw, 15px)',
        right: 'clamp(12px, 2.5vw, 15px)',
        width: 'clamp(40px, 8vw, 60px)',
        height: 'clamp(40px, 8vw, 60px)',
        background: `linear-gradient(45deg, ${serviceColor}20, transparent)`,
        borderRadius: '50%',
        animation: 'pulse 3s ease-in-out infinite'
      }}></div>

      {/* Enhanced Icon container with fixed positioning */}
      <div 
        className="icon-container"
        style={{
          background: `linear-gradient(135deg, ${serviceColor}15, ${serviceColor}25)`,
          border: `3px solid ${serviceColor}`,
          boxShadow: `0 8px 24px ${serviceColor}30`,
          transition: 'all 0.3s ease'
        }}
        onMouseEnter={(e) => {
          if (window.innerWidth > 768) {
            e.currentTarget.style.transform = 'scale(1.05) rotate(3deg)';
            e.currentTarget.style.boxShadow = `0 12px 32px ${serviceColor}40`;
          }
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1) rotate(0deg)';
          e.currentTarget.style.boxShadow = `0 8px 24px ${serviceColor}30`;
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
        
        {/* Icon with proper sizing */}
        <div style={{ 
          fontSize: 'clamp(32px, 6vw, 42px)', 
          zIndex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          height: '100%'
        }}>
          {React.cloneElement(service.icon, {
            size: undefined, // Remove fixed size
            style: { 
              width: 'clamp(32px, 6vw, 42px)', 
              height: 'clamp(32px, 6vw, 42px)',
              color: serviceColor
            }
          })}
        </div>
      </div>

      <h3 style={{
        background: `linear-gradient(45deg, ${serviceColor}, #F7931E)`,
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
        fontWeight: 800,
        fontSize: 'var(--heading-3)',
        margin: "0 0 clamp(12px, 2.5vw, 15px) 0",
        letterSpacing: ".01em",
        lineHeight: '1.3'
      }}>
        {service.title}
      </h3>

      <p style={{
        color: "#333",
        fontWeight: 500,
        fontSize: 'var(--text-base)',
        lineHeight: '1.6',
        margin: '0 0 clamp(25px, 4vw, 35px) 0',
        opacity: 0.9,
        flex: 1
      }}>
        {service.desc}
      </p>

      {/* Service badge */}
      <div style={{
        position: 'absolute',
        bottom: 'clamp(12px, 2.5vw, 15px)',
        left: '50%',
        transform: 'translateX(-50%)',
        background: `linear-gradient(45deg, ${serviceColor}, #F7931E)`,
        color: 'white',
        padding: 'clamp(6px, 1.2vw, 8px) clamp(12px, 2.5vw, 16px)',
        borderRadius: 'clamp(12px, 2.5vw, 15px)',
        fontSize: 'clamp(10px, 2vw, 12px)',
        fontWeight: 'bold',
        textTransform: 'uppercase',
        letterSpacing: '1px',
        whiteSpace: 'nowrap'
      }}>
        Professional Service
      </div>
    </Card3D>
  );
};

// Enhanced Stats Component with better mobile support
const ServiceStats = () => {
  const stats = [
    { number: "500+", label: "Systems Installed", icon: "⚡", color: "#FF6B35" },
    { number: "24/7", label: "Support Available", icon: "🛠️", color: "#1db954" },
    { number: "5+", label: "Years Warranty", icon: "🛡️", color: "#2176ae" },
    { number: "100%", label: "Satisfaction Rate", icon: "⭐", color: "#e67e22" }
  ];

  return (
    <div className="stats-grid">
      {stats.map((stat, index) => (
        <Card3D key={stat.label} style={{
          padding: 'clamp(25px, 4vw, 30px) clamp(15px, 3vw, 20px)',
          textAlign: 'center',
          animation: `fadeInUp 0.8s ease-out ${index * 0.1}s both`,
          minHeight: 'clamp(140px, 20vw, 160px)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center'
        }}>
          <div style={{
            fontSize: 'clamp(28px, 6vw, 36px)',
            marginBottom: 'clamp(12px, 2.5vw, 15px)',
            animation: 'bounce 2s ease-in-out infinite'
          }}>
            {stat.icon}
          </div>
          <div style={{
            fontSize: 'clamp(24px, 5vw, 32px)',
            fontWeight: 'bold',
            color: stat.color,
            marginBottom: 'clamp(6px, 1.5vw, 8px)',
            background: `linear-gradient(45deg, ${stat.color}, #F7931E)`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            {stat.number}
          </div>
          <p style={{
            color: '#666',
            fontSize: 'var(--text-small)',
            fontWeight: '600',
            margin: 0,
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}>
            {stat.label}
          </p>
        </Card3D>
      ))}
    </div>
  );
};

// Enhanced Section Header Component
const SectionHeader = ({ title, subtitle = "", icon = "" }) => (
  <div style={{
    textAlign: 'center',
    marginBottom: 'clamp(40px, 8vw, 60px)',
    position: 'relative'
  }}>
    {icon && (
      <div style={{
        fontSize: 'clamp(40px, 8vw, 60px)',
        marginBottom: 'clamp(16px, 3vw, 20px)',
        animation: 'bounce 2s ease-in-out infinite'
      }}>
        {icon}
      </div>
    )}
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
        lineHeight: '1.6',
        maxWidth: 'min(600px, 90vw)',
        marginLeft: 'auto',
        marginRight: 'auto'
      }}>
        {subtitle}
      </p>
    )}
    <div style={{
      position: 'absolute',
      bottom: subtitle ? 'clamp(-12px, -2vw, -16px)' : 'clamp(-16px, -2.5vw, -20px)',
      left: '50%',
      transform: 'translateX(-50%)',
      width: 'clamp(100px, 15vw, 140px)',
      height: '4px',
      background: 'linear-gradient(45deg, #FF6B35, #F7931E)',
      borderRadius: '2px'
    }}></div>
  </div>
);

const serviceList = [
  {
    icon: <FiSun />,
    title: "Complete Solar System Installation",
    desc: "We deliver turnkey solar solutions—site survey, system design, top-tier panels, branded inverters, professional wiring, net metering, and safety equipment. Every installation comes with full commissioning and training, so you enjoy peace of mind from day one.",
    bg: "#fff6ec"
  },
  {
    icon: <FiBatteryCharging />,
    title: "Daytime Systems (5kVA, 7kVA, 10kVA)",
    desc: "Perfect for homes and shops needing maximum solar benefit during sunlight hours. Our daytime systems are optimized for grid savings and can be scaled for growing energy needs, with sturdy hardware and 5-year inverter warranty.",
    bg: "#f3fff3"
  },
  {
    icon: <FiSettings />,
    title: "Hybrid Systems (3kW and Above)",
    desc: "Hybrid solutions integrate solar, battery, and grid so your property has energy day and night. High-efficiency lithium or tubular batteries, seamless switching, and monitoring apps—ideal for areas with frequent outages or backup needs.",
    bg: "#e8f3ff"
  },
  {
    icon: <FiShoppingBag />,
    title: "Inverter Sales (All Brands)",
    desc: "We stock and recommend only reliable, high-performing inverters: Inverex, Growatt, Ziewnic, Solis, Tesla, and more. Full support for installation and after-sales, competitive pricing, and warranty claims managed by our experts.",
    bg: "#fff0f0"
  },
  {
    icon: <FiTool />,
    title: "Inverter Repairs & Maintenance",
    desc: "Our skilled engineers offer rapid troubleshooting, board-level repairs, software updates, and preventive maintenance for all major inverter brands. We use genuine parts for lasting results and minimum downtime.",
    bg: "#fff8ee"
  },
  {
    icon: <FiRefreshCw />,
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
        {/* Animated background particles */}
        {[...Array(window.innerWidth <= 768 ? 6 : 10)].map((_, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              width: `clamp(3px, 1vw, ${Math.random() * 8 + 4}px)`,
              height: `clamp(3px, 1vw, ${Math.random() * 8 + 4}px)`,
              background: 'rgba(255,107,53,0.3)',
              borderRadius: '50%',
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animation: `floatingParticles ${Math.random() * 20 + 15}s linear infinite ${Math.random() * 5}s`
            }}
          />
        ))}

        <div className="universal-container">
          {/* Enhanced Heading Section */}
          <Card3D style={{
            maxWidth: 'min(800px, 95vw)',
            margin: "0 auto clamp(40px, 6vw, 50px) auto",
            padding: "clamp(40px, 6vw, 50px) var(--card-padding)",
            textAlign: "center",
            position: 'relative',
            overflow: 'visible',
            animation: 'fadeInUp 0.8s ease-out'
          }}>
            {/* Decorative element */}
            <div style={{
              position: 'absolute',
              top: 'clamp(-20px, -3vw, -25px)',
              left: '50%',
              transform: 'translateX(-50%)',
              width: 'clamp(50px, 8vw, 60px)',
              height: 'clamp(50px, 8vw, 60px)',
              background: 'linear-gradient(45deg, #FF6B35, #F7931E)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 'clamp(20px, 4vw, 24px)',
              boxShadow: '0 8px 24px rgba(255, 107, 53, 0.3)',
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
              fontSize: "var(--heading-1)",
              marginBottom: 'clamp(16px, 3vw, 20px)',
              marginTop: 'clamp(20px, 4vw, 25px)'
            }}>
              Our Services
            </h1>
            <p style={{
              color: "#333",
              fontWeight: 500,
              fontSize: 'var(--text-base)',
              margin: '0 0 clamp(20px, 4vw, 25px) 0',
              lineHeight: '1.6',
              maxWidth: 'min(600px, 90vw)',
              marginLeft: 'auto',
              marginRight: 'auto'
            }}>
              Everything you need for solar—from new installations to repair and after-sales care.
            </p>
            
            {/* Enhanced tagline */}
            <div style={{
              padding: 'clamp(12px, 2.5vw, 15px) clamp(20px, 4vw, 25px)',
              background: 'linear-gradient(135deg, #fff7e6, #ffffff)',
              borderRadius: 'clamp(12px, 2.5vw, 15px)',
              border: '2px solid #F7931E',
              display: 'inline-block'
            }}>
              <span style={{
                fontSize: 'var(--text-base)',
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
          <div style={{ marginBottom: 'clamp(50px, 8vw, 60px)' }}>
            <ServiceStats />
          </div>

          {/* Enhanced Services Grid */}
          <div style={{ marginBottom: 'clamp(50px, 8vw, 60px)' }}>
            <SectionHeader 
              title="Our Expert Services"
              subtitle="Professional solar solutions tailored to your needs"
            />

            <div className="services-grid">
              {serviceList.map((service, index) => (
                <ServiceCard key={service.title} service={service} index={index} />
              ))}
            </div>
          </div>

          {/* Enhanced Service Request Form */}
          <Card3D style={{
            maxWidth: 'min(600px, 95vw)',
            margin: "0 auto clamp(30px, 5vw, 40px) auto",
            padding: "clamp(40px, 6vw, 50px) var(--card-padding)",
            textAlign: "center",
            position: 'relative',
            animation: 'fadeInUp 0.8s ease-out 0.6s both'
          }}>
            {/* Form header decoration */}
            <div style={{
              position: 'absolute',
              top: 'clamp(-20px, -3vw, -25px)',
              left: '50%',
              transform: 'translateX(-50%)',
              width: 'clamp(50px, 8vw, 60px)',
              height: 'clamp(50px, 8vw, 60px)',
              background: 'linear-gradient(45deg, #e65100, #ff9800)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 'clamp(20px, 4vw, 24px)',
              boxShadow: '0 8px 24px rgba(230, 81, 0, 0.3)',
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
              fontSize: 'var(--heading-3)',
              marginBottom: 'clamp(20px, 4vw, 25px)',
              marginTop: 'clamp(20px, 4vw, 25px)'
            }}>
              Request a Service
            </h3>

            <p style={{
              color: '#666',
              fontSize: 'var(--text-base)',
              marginBottom: 'clamp(25px, 5vw, 30px)',
              lineHeight: '1.6'
            }}>
              Get a free consultation and quote for your solar energy needs
            </p>

            {sent && (
              <div style={{
                background: "linear-gradient(135deg, #e9fbe7, #f0fff0)",
                color: "#12b500",
                padding: "clamp(16px, 3vw, 20px) clamp(20px, 4vw, 25px)",
                borderRadius: 'var(--border-radius)',
                marginBottom: 'clamp(20px, 4vw, 25px)',
                fontWeight: 700,
                fontSize: 'var(--text-base)',
                border: '2px solid #12b500',
                boxShadow: '0 8px 25px rgba(18, 181, 0, 0.2)',
                animation: 'fadeInUp 0.5s ease-out'
              }}>
                ✅ Thank you! Your request has been submitted successfully.
              </div>
            )}

            <form onSubmit={handleSubmit} className="form-grid">
              <div className="input-container">
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Full Name"
                  required
                  style={{
                    ...enhancedInputStyle,
                    paddingLeft: 'clamp(45px, 8vw, 50px)'
                  }}
                  autoComplete="off"
                />
                <span className="input-icon">👤</span>
              </div>

              <div className="input-container">
                <input
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="Phone Number"
                  required
                  style={{
                    ...enhancedInputStyle,
                    paddingLeft: 'clamp(45px, 8vw, 50px)'
                  }}
                  autoComplete="off"
                  pattern="[0-9+ ]*"
                  maxLength={16}
                />
                <span className="input-icon">📞</span>
              </div>

              <div className="input-container">
                <input
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="Email Address"
                  required
                  style={{
                    ...enhancedInputStyle,
                    paddingLeft: 'clamp(45px, 8vw, 50px)'
                  }}
                  type="email"
                  autoComplete="off"
                />
                <span className="input-icon">📧</span>
              </div>

              <div className="input-container">
                <select
                  name="service"
                  value={form.service}
                  onChange={handleChange}
                  required
                  style={{ 
                    ...enhancedInputStyle, 
                    fontWeight: 600, 
                    color: form.service ? "#333" : "#aaa",
                    paddingLeft: 'clamp(45px, 8vw, 50px)'
                  }}
                >
                  <option value="">Select Service</option>
                  {serviceList.map(svc =>
                    <option key={svc.title} value={svc.title}>{svc.title}</option>
                  )}
                </select>
                <span className="input-icon">⚙️</span>
              </div>

              <div className="input-container">
                <textarea
                  name="details"
                  value={form.details}
                  onChange={handleChange}
                  placeholder="Describe your requirements (site address, system size, issue, etc.)"
                  required
                  rows={4}
                  style={{ 
                    ...enhancedInputStyle, 
                    minHeight: 'clamp(100px, 15vw, 120px)', 
                    fontFamily: "inherit",
                    paddingLeft: 'clamp(45px, 8vw, 50px)',
                    paddingTop: 'clamp(12px, 2.5vw, 15px)',
                    resize: 'vertical'
                  }}
                />
                <span className="textarea-icon">📝</span>
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
                  fontSize: 'var(--text-base)',
                  border: "none",
                  borderRadius: 'var(--border-radius)',
                  padding: "clamp(14px, 3vw, 18px) 0",
                  marginTop: 'clamp(8px, 2vw, 10px)',
                  cursor: isSubmitting ? "not-allowed" : "pointer",
                  boxShadow: isSubmitting 
                    ? "none"
                    : "0 8px 25px rgba(255, 152, 0, 0.3)",
                  letterSpacing: ".02em",
                  textTransform: 'uppercase',
                  transition: 'all 0.3s ease',
                  position: 'relative',
                  overflow: 'hidden',
                  minHeight: 'var(--form-input-height)',
                  width: '100%'
                }}
                onMouseEnter={(e) => {
                  if (!isSubmitting && window.innerWidth > 768) {
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
              gap: 'clamp(20px, 4vw, 30px)',
              marginTop: 'clamp(20px, 4vw, 25px)',
              fontSize: 'var(--text-small)',
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
            maxWidth: 'min(800px, 95vw)',
            margin: "0 auto clamp(30px, 5vw, 40px) auto",
            padding: "var(--card-padding)",
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
              top: 'clamp(12px, 2.5vw, 15px)',
              right: 'clamp(12px, 2.5vw, 15px)',
              width: 'clamp(50px, 10vw, 70px)',
              height: 'clamp(50px, 10vw, 70px)',
              background: 'rgba(255,255,255,0.1)',
              borderRadius: '50%',
              animation: 'float 6s ease-in-out infinite'
            }}></div>

            <h2 style={{
              fontSize: 'clamp(24px, 5vw, 32px)',
              fontWeight: 'bold',
              marginBottom: 'clamp(12px, 2.5vw, 15px)',
              textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
            }}>
              Need Immediate Support?
            </h2>
            <p style={{
              fontSize: 'var(--text-base)',
              marginBottom: 'clamp(20px, 4vw, 25px)',
              opacity: 0.95,
              lineHeight: '1.6',
              maxWidth: 'min(600px, 90vw)',
              margin: '0 auto clamp(20px, 4vw, 25px) auto'
            }}>
              Our expert team is ready to help you with emergency repairs, installations, or consultations.
            </p>
            <div style={{
              display: 'flex',
              gap: 'clamp(12px, 2.5vw, 15px)',
              justifyContent: 'center',
              flexWrap: 'wrap'
            }}>
              <button
                onClick={() => window.open('https://wa.me/923075596695?text=Hi! I need immediate solar energy support. Please help me.', '_blank')}
                style={{
                  background: 'rgba(255,255,255,0.9)',
                  color: '#FF6600',
                  border: 'none',
                  padding: 'clamp(10px, 2vw, 12px) clamp(20px, 4vw, 25px)',
                  borderRadius: 'clamp(20px, 4vw, 25px)',
                  fontSize: 'var(--text-small)',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  minWidth: 'clamp(140px, 25vw, 180px)'
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
                📱 WhatsApp Support
              </button>
              <button
                onClick={() => window.location.href = 'tel:+923075596695'}
                style={{
                  background: 'transparent',
                  color: 'white',
                  border: '2px solid rgba(255,255,255,0.8)',
                  padding: 'clamp(8px, 1.8vw, 10px) clamp(18px, 3.8vw, 23px)',
                  borderRadius: 'clamp(20px, 4vw, 25px)',
                  fontSize: 'var(--text-small)',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  minWidth: 'clamp(120px, 22vw, 160px)'
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
                📞 Call Now
              </button>
            </div>
          </Card3D>
        </div>
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
              opacity: 0.7; 
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
              transform: translateY(clamp(-10px, -2vw, -15px)); 
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

          /* Enhanced Input Focus Effects */
          input:focus, 
          select:focus, 
          textarea:focus {
            border-color: var(--primary-orange) !important;
            box-shadow: 0 0 0 3px rgba(255, 107, 53, 0.1) !important;
            transform: translateY(-2px) !important;
            outline: none !important;
          }

          /* Custom Placeholder Styling */
          ::placeholder {
            color: #999 !important;
            opacity: 1;
          }

          /* Improved Select Styling */
          select {
            appearance: none;
            background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23FF6B35' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6,9 12,15 18,9'%3e%3c/polyline%3e%3c/svg%3e");
            background-repeat: no-repeat;
            background-position: right clamp(12px, 2.5vw, 15px) center;
            background-size: clamp(16px, 3vw, 20px);
            padding-right: clamp(40px, 8vw, 45px) !important;
          }

          /* Mobile-specific optimizations */
          @media (max-width: 640px) {
            .services-grid {
              grid-template-columns: 1fr !important;
              gap: clamp(20px, 5vw, 30px) !important;
            }
            
            .stats-grid {
              grid-template-columns: repeat(2, 1fr) !important;
              gap: clamp(15px, 3vw, 20px) !important;
            }
            
            .form-grid {
              gap: clamp(15px, 3vw, 18px) !important;
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

          @media (max-width: 480px) {
            .stats-grid {
              grid-template-columns: 1fr !important;
            }
            
            /* Stack CTA buttons on very small screens */
            .cta-buttons {
              flex-direction: column !important;
              align-items: center !important;
              gap: clamp(10px, 2vw, 12px) !important;
            }
            
            .cta-buttons button {
              width: 100% !important;
              max-width: 250px !important;
            }
          }

          /* Tablet optimizations */
          @media (min-width: 641px) and (max-width: 1024px) {
            .services-grid {
              grid-template-columns: repeat(2, 1fr) !important;
            }
            
            .stats-grid {
              grid-template-columns: repeat(4, 1fr) !important;
            }
          }

          /* Large screen optimizations */
          @media (min-width: 1440px) {
            .services-grid {
              grid-template-columns: repeat(3, 1fr) !important;
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
            button, input, select, textarea {
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
            .floating-particle {
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
          button:focus-visible,
          input:focus-visible,
          select:focus-visible,
          textarea:focus-visible {
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

          /* Button hover effects enhancement */
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

          /* Enhanced gradient animations */
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

          /* Card entrance animations */
          .card-entrance {
            animation: cardEntrance 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          }

          @keyframes cardEntrance {
            0% {
              opacity: 0;
              transform: scale(0.8) rotateY(-30deg);
            }
            100% {
              opacity: 1;
              transform: scale(1) rotateY(0deg);
            }
          }

          /* Text glow effect for headers */
          .glow-text {
            text-shadow: 
              0 0 5px rgba(255, 107, 53, 0.3),
              0 0 10px rgba(255, 107, 53, 0.2),
              0 0 20px rgba(255, 107, 53, 0.1);
          }

          /* Ripple effect for buttons */
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

          .ripple-effect {
            position: relative;
            overflow: hidden;
          }

          .ripple-effect::after {
            content: '';
            position: absolute;
            top: 50%;
            left: 50%;
            width: 5px;
            height: 5px;
            background: rgba(255, 255, 255, 0.3);
            border-radius: 50%;
            transform: scale(0);
            animation: ripple 0.6s linear;
          }
        `}
      </style>
    </>
  );
}

// Enhanced Input Styling with better responsive support
const enhancedInputStyle = {
  padding: "clamp(12px, 2.5vw, 16px) clamp(15px, 3vw, 18px)",
  border: "2px solid rgba(255, 107, 53, 0.2)",
  borderRadius: 'clamp(12px, 2.5vw, 15px)',
  fontSize: 'var(--text-base)',
  fontWeight: 500,
  background: "linear-gradient(135deg, #fff8f0, #ffffff)",
  outline: "none",
  transition: "all 0.3s ease",
  boxShadow: "0 4px 15px rgba(255, 107, 53, 0.1)",
  width: "100%",
  boxSizing: "border-box",
  minHeight: 'var(--form-input-height)',
  color: '#333'
};