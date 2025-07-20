import React, { useState, useRef, useEffect } from "react";
import logo from "../assets/logo.png";
import Footer from "../components/Footer";

const acOptions = [
  { value: 0, label: "Select" },
  { value: 0.75, label: "0.75 Ton" },
  { value: 1, label: "1 Ton" },
  { value: 1.5, label: "1.5 Ton" },
  { value: 2, label: "2 Ton" },
];

// Popup Component
const SystemSuggestionPopup = ({ totalLoad, onClose }) => {
  const suggestedSystem = Math.ceil(totalLoad / 1000) + 1;
  
  const handleClaimClick = () => {
    const message = encodeURIComponent(
      `Hi Syed Solar! I just calculated my load (${totalLoad} Watts) and I want to claim the Rs. 5,000 discount for installing a ${suggestedSystem}kW system.`
    );
    window.open(`https://wa.me/923075596695?text=${message}`, '_blank');
  };

  const handleQuoteClick = () => {
    const message = encodeURIComponent(
      `Hi Syed Solar! I calculated my load (${totalLoad} Watts) and need a quote for a ${suggestedSystem}kW solar system.`
    );
    window.open(`https://wa.me/923075596695?text=${message}`, '_blank');
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.7)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      animation: 'fadeIn 0.5s ease-out'
    }}>
      <div style={{
        background: 'linear-gradient(135deg, #fff6ec, #ffffff)',
        borderRadius: '20px',
        padding: '40px',
        maxWidth: '500px',
        width: '90%',
        textAlign: 'center',
        position: 'relative',
        boxShadow: '0 20px 60px rgba(255, 152, 0, 0.4)',
        animation: 'scaleIn 0.5s ease-out'
      }}>
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '15px',
            right: '15px',
            background: 'rgba(255, 107, 53, 0.1)',
            border: 'none',
            borderRadius: '50%',
            width: '35px',
            height: '35px',
            fontSize: '18px',
            cursor: 'pointer',
            color: '#FF6B35',
            fontWeight: 'bold',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.target.style.background = 'rgba(255, 107, 53, 0.2)';
            e.target.style.transform = 'rotate(90deg)';
          }}
          onMouseLeave={(e) => {
            e.target.style.background = 'rgba(255, 107, 53, 0.1)';
            e.target.style.transform = 'rotate(0)';
          }}
        >
          ×
        </button>

        <div style={{
          fontSize: '48px',
          marginBottom: '20px',
          animation: 'pulse 2s infinite'
        }}>
          ☀️
        </div>
        
        <h2 style={{
          margin: '0 0 15px 0',
          fontSize: '28px',
          fontWeight: 'bold',
          background: 'linear-gradient(45deg, #FF6B35, #F7931E)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}>
          System Recommendation
        </h2>
        
        <div style={{
          background: 'rgba(255, 152, 0, 0.1)',
          borderRadius: '15px',
          padding: '20px',
          marginBottom: '25px'
        }}>
          <p style={{ fontSize: '18px', margin: '0 0 15px 0' }}>
            Your calculated load: <span style={{ fontWeight: 'bold' }}>{totalLoad} Watts</span>
          </p>
          <p style={{ fontSize: '20px', fontWeight: 'bold', margin: '0' }}>
            We recommend: <span style={{ color: '#FF6B35' }}>{suggestedSystem}kW Solar System</span>
          </p>
        </div>

        <div style={{
          background: 'linear-gradient(135deg, #FF6B35, #F7931E)',
          borderRadius: '15px',
          padding: '20px',
          marginBottom: '25px',
          color: 'white'
        }}>
          <h3 style={{ 
            fontSize: '22px', 
            margin: '0 0 10px 0',
            textShadow: '1px 1px 2px rgba(0,0,0,0.3)'
          }}>
            Special Installation Offer!
          </h3>
          <p style={{ 
            fontSize: '18px', 
            margin: '0',
            textShadow: '1px 1px 2px rgba(0,0,0,0.2)'
          }}>
            Get <span style={{ fontWeight: 'bold', fontSize: '22px' }}>Rs. 5,000 OFF</span> when you install today!
          </p>
        </div>

        <div style={{
          display: 'flex',
          gap: '15px',
          justifyContent: 'center',
          flexWrap: 'wrap'
        }}>
          <button
            onClick={handleClaimClick}
            style={{
              background: 'linear-gradient(135deg, #25D366, #128C7E)',
              color: 'white',
              border: 'none',
              padding: '15px 25px',
              borderRadius: '25px',
              fontWeight: 'bold',
              cursor: 'pointer',
              fontSize: '16px',
              transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
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
            <span>📱</span> Claim Offer on WhatsApp
          </button>
          
          <button
            onClick={handleQuoteClick}
            style={{
              background: 'linear-gradient(135deg, #FF6B35, #F7931E)',
              color: 'white',
              border: 'none',
              padding: '15px 25px',
              borderRadius: '25px',
              fontWeight: 'bold',
              cursor: 'pointer',
              fontSize: '16px',
              transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
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
            <span>📝</span> Get Detailed Quote
          </button>
        </div>
      </div>
    </div>
  );
};

export default function LoadCalculator() {
  const [fields, setFields] = useState({
    fan: 0,
    light: 0,
    tv: 0,
    lcd: 0,
    laptop: 0,
    pc: 0,
    noninvTon: 0,
    noninvQty: 0,
    invTon: 0,
    invQty: 0,
    fridge: 0,
    invfridge: 0,
    dcfan: 0,
    microwave: 0,
    washing: 0,
    waterpump: 0,
    iron: 0,
    other: 0,
    otherWatt: 0,
  });

  const [totalLoad, setTotalLoad] = useState(0);
  const [showPopup, setShowPopup] = useState(false);
  const formRef = useRef(null);

  // Power ratings (W)
  const ratings = {
    fan: 80,
    light: 20,
    tv: 100,
    lcd: 60,
    laptop: 50,
    pc: 250,
    fridge: 300,
    invfridge: 150,
    dcfan: 50,
    microwave: 1000,
    washing: 500,
    waterpump: 750,
    iron: 1000,
    other: fields.otherWatt,
    noninv: 1500,
    inv: 800,
  };

  // Calculate total load
  const calculateLoad = () => {
    const {
      fan, light, tv, lcd, laptop, pc, noninvTon, noninvQty,
      invTon, invQty, fridge, invfridge, dcfan, microwave, 
      washing, waterpump, iron, other, otherWatt
    } = fields;
    
    return (
      fan * ratings.fan +
      light * ratings.light +
      tv * ratings.tv +
      lcd * ratings.lcd +
      laptop * ratings.laptop +
      pc * ratings.pc +
      noninvTon * noninvQty * ratings.noninv +
      invTon * invQty * ratings.inv +
      fridge * ratings.fridge +
      invfridge * ratings.invfridge +
      dcfan * ratings.dcfan +
      microwave * ratings.microwave +
      washing * ratings.washing +
      waterpump * ratings.waterpump +
      iron * ratings.iron +
      other * (otherWatt || 0)
    );
  };

  // Handler
  const handleChange = (e) => {
    const { id, value } = e.target;
    setFields((prev) => ({
      ...prev,
      [id]:
        id === "noninvTon" || id === "invTon"
          ? parseFloat(value)
          : parseInt(value) || 0,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const load = calculateLoad();
    setTotalLoad(load);
    setShowPopup(true);
  };

  useEffect(() => {
    if (formRef.current) {
      formRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [totalLoad]);

  return (
    <section style={{
      background: "linear-gradient(135deg, #fff6ec 0%, #fff3e0 100%)",
      minHeight: "100vh",
      padding: "0",
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Decorative elements */}
      <div style={{
        position: 'absolute',
        top: '10%',
        right: '5%',
        width: '120px',
        height: '120px',
        background: 'linear-gradient(135deg, rgba(255, 107, 53, 0.1), rgba(247, 147, 30, 0.1))',
        borderRadius: '50%',
        animation: 'float 8s ease-in-out infinite'
      }}></div>
      
      <div style={{
        position: 'absolute',
        bottom: '15%',
        left: '7%',
        width: '80px',
        height: '80px',
        background: 'linear-gradient(135deg, rgba(247, 147, 30, 0.1), rgba(255, 152, 0, 0.1))',
        borderRadius: '50%',
        animation: 'float 10s ease-in-out infinite reverse'
      }}></div>

      <div ref={formRef} style={{
        maxWidth: 800,
        margin: "40px auto 22px auto",
        background: "#fff",
        borderRadius: 20,
        boxShadow: "0 15px 40px rgba(255, 152, 0, 0.15)",
        padding: "40px 30px",
        textAlign: "center",
        position: 'relative',
        zIndex: 2,
        animation: 'fadeInUp 0.8s ease-out'
      }}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          marginBottom: '25px'
        }}>
          <img
            src={logo}
            alt="Syed Solar Logo"
            style={{
              width: 120, 
              height: "auto",
              marginBottom: 15,
              borderRadius: 14,
              boxShadow: "0 5px 20px rgba(255, 152, 0, 0.2)",
              animation: 'pulse 3s infinite'
            }}
          />
          <h2 style={{
            background: 'linear-gradient(45deg, #FF6B35, #F7931E)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            fontWeight: 900, 
            fontSize: "2.5rem",
            marginBottom: 8,
            letterSpacing: ".03em"
          }}>
            Solar Load Calculator
          </h2>
          <p style={{
            color: "#222", 
            fontSize: 18, 
            margin: "0 0 10px 0", 
            fontWeight: 500,
            lineHeight: 1.6,
            maxWidth: '600px'
          }}>
            Enter the quantity of appliances to calculate the <span style={{ color: "#f57c00", fontWeight: 700 }}>total solar load (Watts)</span> required for your setup.
          </p>
          <div style={{
            color: '#FF6B35',
            fontWeight: 'bold',
            fontSize: '18px',
            fontStyle: 'italic',
            marginTop: '15px',
            borderTop: '2px solid #FF6B35',
            paddingTop: '10px',
            fontFamily: "'Noto Nastaliq Urdu', serif"
          }}>
            صاف توانائی، روشن مستقبل
          </div>
          <p style={{ color: '#777', marginTop: '5px' }}>Clean Energy, Bright Future</p>
        </div>
        
        <form onSubmit={handleSubmit} style={{
          maxWidth: 600, 
          margin: "0 auto", 
          display: "grid", 
          gap: 18,
          padding: '20px 0'
        }}>
          {/* APPLIANCE ROWS */}
          <ApplianceRow label="Fan" watt={80} id="fan" val={fields.fan} onChange={handleChange} />
          <ApplianceRow label="Light" watt={20} id="light" val={fields.light} onChange={handleChange} />
          <ApplianceRow label="TV" watt={100} id="tv" val={fields.tv} onChange={handleChange} />
          <ApplianceRow label="LCD/LED" watt={60} id="lcd" val={fields.lcd} onChange={handleChange} />
          <ApplianceRow label="Laptop" watt={50} id="laptop" val={fields.laptop} onChange={handleChange} />
          <ApplianceRow label="PC/Desktop" watt={250} id="pc" val={fields.pc} onChange={handleChange} />
          
          {/* Non-Inverter AC */}
          <div style={applianceRowStyle}>
            <span style={applianceLabelStyle}>Non-Inverter AC</span>
            <span style={applianceWattStyle}>{fields.noninvTon * 1500 || 0}</span>
            <span>
              <select id="noninvTon" value={fields.noninvTon} onChange={handleChange} style={applianceInputStyle}>
                {acOptions.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
              <input type="number" id="noninvQty" value={fields.noninvQty} onChange={handleChange} min={0} placeholder="Qty" style={{ ...applianceInputStyle, width: 60, marginLeft: 8 }} />
            </span>
          </div>
          
          {/* Inverter AC */}
          <div style={applianceRowStyle}>
            <span style={applianceLabelStyle}>Inverter AC</span>
            <span style={applianceWattStyle}>{fields.invTon * 800 || 0}</span>
            <span>
              <select id="invTon" value={fields.invTon} onChange={handleChange} style={applianceInputStyle}>
                {acOptions.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
              <input type="number" id="invQty" value={fields.invQty} onChange={handleChange} min={0} placeholder="Qty" style={{ ...applianceInputStyle, width: 60, marginLeft: 8 }} />
            </span>
          </div>
          
          <ApplianceRow label="Fridge (Normal)" watt={300} id="fridge" val={fields.fridge} onChange={handleChange} />
          <ApplianceRow label="Fridge (Inverter)" watt={150} id="invfridge" val={fields.invfridge} onChange={handleChange} />
          <ApplianceRow label="AC/DC Fan" watt={50} id="dcfan" val={fields.dcfan} onChange={handleChange} />
          <ApplianceRow label="Microwave" watt={1000} id="microwave" val={fields.microwave} onChange={handleChange} />
          <ApplianceRow label="Washing Machine" watt={500} id="washing" val={fields.washing} onChange={handleChange} />
          <ApplianceRow label="Water Pump" watt={750} id="waterpump" val={fields.waterpump} onChange={handleChange} />
          <ApplianceRow label="Iron" watt={1000} id="iron" val={fields.iron} onChange={handleChange} />
          
          {/* Other Appliance */}
          <div style={applianceRowStyle}>
            <span style={applianceLabelStyle}>Other Appliance</span>
            <input
              type="number"
              id="otherWatt"
              value={fields.otherWatt}
              onChange={handleChange}
              placeholder="Watt"
              style={{ ...applianceInputStyle, width: 70, marginRight: 7 }}
            />
            <input
              type="number"
              id="other"
              value={fields.other}
              onChange={handleChange}
              placeholder="Qty"
              style={{ ...applianceInputStyle, width: 60 }}
            />
          </div>
          
          {/* Calculate Button */}
          <button
            type="submit"
            style={{
              background: 'linear-gradient(135deg, #FF6B35, #F7931E)',
              color: 'white',
              border: 'none',
              padding: '16px 0',
              borderRadius: '15px',
              fontWeight: 'bold',
              cursor: 'pointer',
              fontSize: '18px',
              transition: 'all 0.3s ease',
              marginTop: '20px',
              boxShadow: '0 5px 15px rgba(255, 107, 53, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-3px) scale(1.02)';
              e.target.style.boxShadow = '0 8px 20px rgba(255, 107, 53, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0) scale(1)';
              e.target.style.boxShadow = '0 5px 15px rgba(255, 107, 53, 0.3)';
            }}
          >
            <span>🧮</span> Calculate Solar Load
          </button>
        </form>
        
        {/* Result */}
        {totalLoad > 0 && (
          <div style={{
            marginTop: 26, 
            background: "linear-gradient(135deg, #fff8e1, #fff3e0)",
            border: "2px solid #ff9800", 
            borderRadius: 15,
            fontWeight: 800, 
            fontSize: 24, 
            color: "#e65100",
            padding: "18px 0",
            animation: 'fadeIn 0.5s ease-out',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'linear-gradient(45deg, transparent, rgba(255, 152, 0, 0.1), transparent)',
              animation: 'shimmer 3s linear infinite'
            }}></div>
            <span style={{ position: 'relative', zIndex: 2 }}>
              Total Load: <span style={{ fontSize: '28px' }}>{totalLoad}</span> Watts
            </span>
          </div>
        )}
      </div>
      
      {/* Popup for system suggestion */}
      {showPopup && (
        <SystemSuggestionPopup 
          totalLoad={totalLoad} 
          onClose={() => setShowPopup(false)} 
        />
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
          
          @keyframes fadeIn {
            from {
              opacity: 0;
            }
            to {
              opacity: 1;
            }
          }
          
          @keyframes scaleIn {
            0% {
              transform: scale(0.8);
              opacity: 0;
            }
            100% {
              transform: scale(1);
              opacity: 1;
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
          
          @keyframes shimmer {
            0% { 
              transform: translateX(-100%) skewX(-15deg); 
            }
            100% { 
              transform: translateX(100%) skewX(-15deg); 
            }
          }
        `}
      </style>
    </section>
  );
}

// ApplianceRow reusable component
function ApplianceRow({ label, watt, id, val, onChange }) {
  return (
    <div style={applianceRowStyle}>
      <span style={applianceLabelStyle}>{label}</span>
      <span style={applianceWattStyle}>{watt}W</span>
      <input
        type="number"
        id={id}
        value={val}
        onChange={onChange}
        min={0}
        style={applianceInputStyle}
        placeholder="Qty"
      />
    </div>
  );
}

// --- Inline Styles ---
const applianceRowStyle = {
  display: "grid",
  gridTemplateColumns: "1.6fr 0.7fr 1fr",
  alignItems: "center",
  gap: 12,
  background: "#fffdf9",
  borderRadius: 10,
  padding: "12px 10px",
  marginBottom: 5,
  border: "1px solid #ffe8c7",
  boxShadow: "0 2px 8px rgba(255, 152, 0, 0.05)",
  transition: 'all 0.3s ease'
};
const applianceLabelStyle = { 
  fontWeight: 600, 
  fontSize: 16, 
  color: "#232323" 
};
const applianceWattStyle = { 
  fontWeight: 600, 
  fontSize: 15, 
  color: "#ff9800" 
};
const applianceInputStyle = {
  fontSize: 16, 
  borderRadius: 8, 
  padding: "8px 12px",
  border: "1.5px solid #ffe8c7", 
  width: 70, 
  background: "#fff",
  boxShadow: "inset 0 1px 3px rgba(0,0,0,0.05)",
  transition: 'all 0.3s ease'
};