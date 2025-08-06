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
    window.open(`https://syedsolarenergy.com/quotation`,);
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
        padding: 'clamp(20px, 4vw, 40px)',
        maxWidth: 'min(500px, 90vw)',
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
            top: 'clamp(10px, 2vw, 15px)',
            right: 'clamp(10px, 2vw, 15px)',
            background: 'rgba(255, 107, 53, 0.1)',
            border: 'none',
            borderRadius: '50%',
            width: 'clamp(30px, 4vw, 35px)',
            height: 'clamp(30px, 4vw, 35px)',
            fontSize: 'clamp(16px, 2vw, 18px)',
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
          fontSize: 'clamp(36px, 6vw, 48px)',
          marginBottom: 'clamp(15px, 2vw, 20px)',
          animation: 'pulse 2s infinite'
        }}>
          ☀️
        </div>
        
        <h2 style={{
          margin: '0 0 clamp(10px, 1.5vw, 15px) 0',
          fontSize: 'clamp(20px, 4vw, 28px)',
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
          padding: 'clamp(15px, 3vw, 20px)',
          marginBottom: 'clamp(15px, 3vw, 25px)'
        }}>
          <p style={{ 
            fontSize: 'clamp(14px, 2.5vw, 18px)', 
            margin: '0 0 clamp(8px, 1.5vw, 15px) 0' 
          }}>
            Your calculated load: <span style={{ fontWeight: 'bold' }}>{totalLoad} Watts</span>
          </p>
          <p style={{ 
            fontSize: 'clamp(16px, 3vw, 20px)', 
            fontWeight: 'bold', 
            margin: '0' 
          }}>
            We recommend: <span style={{ color: '#FF6B35' }}>{suggestedSystem}kW Solar System</span>
          </p>
        </div>

        <div style={{
          background: 'linear-gradient(135deg, #FF6B35, #F7931E)',
          borderRadius: '15px',
          padding: 'clamp(15px, 3vw, 20px)',
          marginBottom: 'clamp(15px, 3vw, 25px)',
          color: 'white'
        }}>
          <h3 style={{ 
            fontSize: 'clamp(18px, 3.5vw, 22px)', 
            margin: '0 0 clamp(8px, 1.5vw, 10px) 0',
            textShadow: '1px 1px 2px rgba(0,0,0,0.3)'
          }}>
            Special Installation Offer!
          </h3>
          <p style={{ 
            fontSize: 'clamp(14px, 2.5vw, 18px)', 
            margin: '0',
            textShadow: '1px 1px 2px rgba(0,0,0,0.2)'
          }}>
            Get <span style={{ fontWeight: 'bold', fontSize: 'clamp(18px, 3.5vw, 22px)' }}>Rs. 5,000 OFF</span> when you install today!
          </p>
        </div>

        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 'clamp(10px, 2vw, 15px)',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <button
            onClick={handleClaimClick}
            style={{
              background: 'linear-gradient(135deg, #25D366, #128C7E)',
              color: 'white',
              border: 'none',
              padding: 'clamp(12px, 2vw, 15px) clamp(20px, 3vw, 25px)',
              borderRadius: '25px',
              fontWeight: 'bold',
              cursor: 'pointer',
              fontSize: 'clamp(14px, 2vw, 16px)',
              transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              gap: 'clamp(5px, 1vw, 8px)',
              boxShadow: '0 5px 15px rgba(0,0,0,0.1)',
              width: '100%',
              maxWidth: '300px'
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
              padding: 'clamp(12px, 2vw, 15px) clamp(20px, 3vw, 25px)',
              borderRadius: '25px',
              fontWeight: 'bold',
              cursor: 'pointer',
              fontSize: 'clamp(14px, 2vw, 16px)',
              transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              gap: 'clamp(5px, 1vw, 8px)',
              boxShadow: '0 5px 15px rgba(0,0,0,0.1)',
              width: '100%',
              maxWidth: '300px'
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
    fan: "",
    light: "",
    tv: "",
    lcd: "",
    laptop: "",
    pc: "",
    noninvTon: 0,
    noninvQty: "",
    invTon: 0,
    invQty: "",
    fridge: "",
    invfridge: "",
    dcfan: "",
    microwave: "",
    washing: "",
    waterpump: "",
    iron: "",
    other: "",
    otherWatt: "",
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
    other: parseInt(fields.otherWatt) || 0,
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
      (parseInt(fan) || 0) * ratings.fan +
      (parseInt(light) || 0) * ratings.light +
      (parseInt(tv) || 0) * ratings.tv +
      (parseInt(lcd) || 0) * ratings.lcd +
      (parseInt(laptop) || 0) * ratings.laptop +
      (parseInt(pc) || 0) * ratings.pc +
      noninvTon * (parseInt(noninvQty) || 0) * ratings.noninv +
      invTon * (parseInt(invQty) || 0) * ratings.inv +
      (parseInt(fridge) || 0) * ratings.fridge +
      (parseInt(invfridge) || 0) * ratings.invfridge +
      (parseInt(dcfan) || 0) * ratings.dcfan +
      (parseInt(microwave) || 0) * ratings.microwave +
      (parseInt(washing) || 0) * ratings.washing +
      (parseInt(waterpump) || 0) * ratings.waterpump +
      (parseInt(iron) || 0) * ratings.iron +
      (parseInt(other) || 0) * (parseInt(otherWatt) || 0)
    );
  };

  // Handler
  const handleChange = (e) => {
    const { id, value } = e.target;
    
    // Allow only numbers and empty string
    const sanitizedValue = value === "" ? "" : value.replace(/\D/g, "");
    
    setFields((prev) => ({
      ...prev,
      [id]: id === "noninvTon" || id === "invTon" ? parseFloat(value) : sanitizedValue,
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
        width: 'clamp(60px, 12vw, 120px)',
        height: 'clamp(60px, 12vw, 120px)',
        background: 'linear-gradient(135deg, rgba(255, 107, 53, 0.1), rgba(247, 147, 30, 0.1))',
        borderRadius: '50%',
        animation: 'float 8s ease-in-out infinite'
      }}></div>
      
      <div style={{
        position: 'absolute',
        bottom: '15%',
        left: '7%',
        width: 'clamp(40px, 8vw, 80px)',
        height: 'clamp(40px, 8vw, 80px)',
        background: 'linear-gradient(135deg, rgba(247, 147, 30, 0.1), rgba(255, 152, 0, 0.1))',
        borderRadius: '50%',
        animation: 'float 10s ease-in-out infinite reverse'
      }}></div>

      <div ref={formRef} style={{
        maxWidth: 'min(800px, 90vw)',
        margin: "clamp(20px, 4vw, 40px) auto clamp(15px, 2vw, 22px) auto",
        background: "#fff",
        borderRadius: '20px',
        boxShadow: "0 15px 40px rgba(255, 152, 0, 0.15)",
        padding: "clamp(20px, 3vw, 40px) clamp(15px, 3vw, 30px)",
        textAlign: "center",
        position: 'relative',
        zIndex: 2,
        animation: 'fadeInUp 0.8s ease-out'
      }}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          marginBottom: 'clamp(15px, 3vw, 25px)'
        }}>
          <img
            src={logo}
            alt="Syed Solar Logo"
            style={{
              width: 'clamp(80px, 12vw, 120px)', 
              height: "auto",
              marginBottom: 'clamp(10px, 1.5vw, 15px)',
              borderRadius: '14px',
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
            fontSize: "clamp(1.8rem, 4vw, 2.5rem)",
            marginBottom: 'clamp(5px, 0.8vw, 8px)',
            letterSpacing: ".03em"
          }}>
            Solar Load Calculator
          </h2>
          <p style={{
            color: "#222", 
            fontSize: 'clamp(14px, 2.2vw, 18px)', 
            margin: "0 0 clamp(8px, 1.2vw, 10px) 0", 
            fontWeight: 500,
            lineHeight: 1.6,
            maxWidth: 'min(600px, 90vw)'
          }}>
            Enter the quantity of appliances to calculate the <span style={{ color: "#f57c00", fontWeight: 700 }}>total solar load (Watts)</span> required for your setup.
          </p>
          <div style={{
            color: '#FF6B35',
            fontWeight: 'bold',
            fontSize: 'clamp(14px, 2.2vw, 18px)',
            fontStyle: 'italic',
            marginTop: 'clamp(10px, 2vw, 15px)',
            borderTop: '2px solid #FF6B35',
            paddingTop: 'clamp(8px, 1.2vw, 10px)',
            fontFamily: "'Noto Nastaliq Urdu', serif"
          }}>
            صاف توانائی، روشن مستقبل
          </div>
          <p style={{ 
            color: '#777', 
            marginTop: 'clamp(3px, 0.8vw, 5px)',
            fontSize: 'clamp(12px, 1.8vw, 16px)'
          }}>
            Clean Energy, Bright Future
          </p>
        </div>
        
        <form onSubmit={handleSubmit} style={{
          maxWidth: 600, 
          margin: "0 auto", 
          display: "grid", 
          gap: 'clamp(10px, 1.8vw, 18px)',
          padding: 'clamp(10px, 2vw, 20px) 0'
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
              <select 
                id="noninvTon" 
                value={fields.noninvTon} 
                onChange={handleChange} 
                style={{ ...applianceInputStyle, width: '100%' }}
              >
                {acOptions.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
              <input 
                type="text" 
                inputMode="numeric"
                id="noninvQty" 
                value={fields.noninvQty} 
                onChange={handleChange} 
                placeholder="Qty" 
                style={{ ...applianceInputStyle, width: '100%', marginTop: '8px' }} 
              />
            </span>
          </div>
          
          {/* Inverter AC */}
          <div style={applianceRowStyle}>
            <span style={applianceLabelStyle}>Inverter AC</span>
            <span style={applianceWattStyle}>{fields.invTon * 800 || 0}</span>
            <span>
              <select 
                id="invTon" 
                value={fields.invTon} 
                onChange={handleChange} 
                style={{ ...applianceInputStyle, width: '100%' }}
              >
                {acOptions.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
              <input 
                type="text" 
                inputMode="numeric"
                id="invQty" 
                value={fields.invQty} 
                onChange={handleChange} 
                placeholder="Qty" 
                style={{ ...applianceInputStyle, width: '100%', marginTop: '8px' }} 
              />
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
              type="text"
              inputMode="numeric"
              id="otherWatt"
              value={fields.otherWatt}
              onChange={handleChange}
              placeholder="Watt"
              style={{ ...applianceInputStyle, width: '100%' }}
            />
            <input
              type="text"
              inputMode="numeric"
              id="other"
              value={fields.other}
              onChange={handleChange}
              placeholder="Qty"
              style={{ ...applianceInputStyle, width: '100%' }}
            />
          </div>
          
          {/* Calculate Button */}
          <button
            type="submit"
            style={{
              background: 'linear-gradient(135deg, #FF6B35, #F7931E)',
              color: 'white',
              border: 'none',
              padding: 'clamp(12px, 2vw, 16px) 0',
              borderRadius: '15px',
              fontWeight: 'bold',
              cursor: 'pointer',
              fontSize: 'clamp(16px, 2.5vw, 18px)',
              transition: 'all 0.3s ease',
              marginTop: 'clamp(15px, 2.5vw, 20px)',
              boxShadow: '0 5px 15px rgba(255, 107, 53, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 'clamp(5px, 1.2vw, 10px)'
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
            marginTop: 'clamp(15px, 2.5vw, 26px)', 
            background: "linear-gradient(135deg, #fff8e1, #fff3e0)",
            border: "2px solid #ff9800", 
            borderRadius: '15px',
            fontWeight: 800, 
            fontSize: 'clamp(18px, 3vw, 24px)', 
            color: "#e65100",
            padding: "clamp(12px, 2vw, 18px) 0",
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
              Total Load: <span style={{ fontSize: 'clamp(20px, 3.5vw, 28px)' }}>{totalLoad}</span> Watts
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
          
          /* Hide spinner for number inputs */
          input[type=number]::-webkit-inner-spin-button, 
          input[type=number]::-webkit-outer-spin-button { 
            -webkit-appearance: none; 
            margin: 0; 
          }
          
          input[type=number] {
            -moz-appearance: textfield;
          }
          
          /* Responsive adjustments */
          @media (max-width: 600px) {
            .appliance-row {
              grid-template-columns: 1fr;
              gap: 8px;
              padding: 10px;
            }
            
            .appliance-label, .appliance-watt {
              text-align: left;
            }
            
            .appliance-input {
              width: 100%;
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
    <div className="appliance-row" style={applianceRowStyle}>
      <span className="appliance-label" style={applianceLabelStyle}>{label}</span>
      <span className="appliance-watt" style={applianceWattStyle}>{watt}W</span>
      <input
        type="text"
        inputMode="numeric"
        id={id}
        value={val}
        onChange={onChange}
        className="appliance-input"
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
  gap: 'clamp(8px, 1.2vw, 12px)',
  background: "#fffdf9",
  borderRadius: '10px',
  padding: "clamp(8px, 1.2vw, 12px) clamp(8px, 1vw, 10px)",
  marginBottom: 'clamp(3px, 0.8vw, 5px)',
  border: "1px solid #ffe8c7",
  boxShadow: "0 2px 8px rgba(255, 152, 0, 0.05)",
  transition: 'all 0.3s ease'
};
const applianceLabelStyle = { 
  fontWeight: 600, 
  fontSize: 'clamp(14px, 2vw, 16px)', 
  color: "#232323" 
};
const applianceWattStyle = { 
  fontWeight: 600, 
  fontSize: 'clamp(13px, 1.8vw, 15px)', 
  color: "#ff9800" 
};
const applianceInputStyle = {
  fontSize: 'clamp(14px, 2vw, 16px)', 
  borderRadius: '8px', 
  padding: "clamp(6px, 1vw, 8px) clamp(8px, 1.2vw, 12px)",
  border: "1.5px solid #ffe8c7", 
  background: "#fff",
  boxShadow: "inset 0 1px 3px rgba(0,0,0,0.05)",
  transition: 'all 0.3s ease',
  width: '100%'
};