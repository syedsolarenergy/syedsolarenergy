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
    
    // Simulate API call
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

  // Responsive styles
  const containerStyle = {
    background: "linear-gradient(135deg,#fff6ec 70%,#fff0d7 100%)",
    minHeight: "100vh",
    padding: 0,
    position: 'relative',
    overflowX: 'hidden'
  };

  const headerCardStyle = {
    maxWidth: isMobile ? '95%' : isTablet ? '85%' : '630px',
    margin: `${isMobile ? '20px' : '35px'} auto ${isMobile ? '15px' : '20px'} auto`,
    padding: isMobile ? "20px 15px" : isTablet ? "25px 20px" : "35px 30px 25px 30px",
    textAlign: "center"
  };

  const logoStyle = {
    width: isMobile ? 70 : isTablet ? 80 : 95,
    height: "auto",
    margin: "0 auto 8px auto",
    borderRadius: isMobile ? 12 : 16,
    boxShadow: "0 2px 14px #ffe0b240"
  };

  const mainTitleStyle = {
    color: "#FF9800",
    fontWeight: 900,
    fontSize: isMobile ? "1.5rem" : isTablet ? "1.8rem" : "2.1rem",
    marginBottom: 7,
    lineHeight: 1.2
  };

  const warningBoxStyle = {
    background: "#ffe8c7",
    borderRadius: isMobile ? 8 : 12,
    padding: isMobile ? "8px 10px" : "12px 15px",
    margin: "15px 0",
    fontWeight: 700,
    color: "#e65100",
    fontSize: isMobile ? "0.9rem" : "1.1rem",
    lineHeight: 1.4
  };

  const diversityTextStyle = {
    fontSize: isMobile ? 14 : isTablet ? 16 : 18,
    color: "#444",
    fontWeight: 500,
    margin: "12px 0 0 0",
    lineHeight: 1.5
  };

  const descriptionStyle = {
    color: "#222",
    fontSize: isMobile ? 14 : isTablet ? 15 : 16.5,
    margin: "17px 0 0 0",
    lineHeight: 1.7,
    fontWeight: 500,
  };

  const jobGridStyle = {
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
  };

  const jobCardStyle = {
    background: "#fff",
    borderRadius: isMobile ? 10 : 13,
    padding: isMobile ? "18px 15px" : "25px 21px 21px 21px",
    textAlign: "left",
    display: "flex",
    flexDirection: "column",
    gap: 9,
    height: "100%"
  };

  const jobTitleStyle = {
    color: "#FF9800",
    fontWeight: 800,
    fontSize: isMobile ? 16 : 18,
    margin: "0 0 6px 0"
  };

  const jobContactStyle = {
    color: "#ba2d0b",
    fontWeight: 600,
    fontSize: isMobile ? 12 : 14,
    marginTop: "auto",
    paddingTop: 10,
    wordBreak: 'break-word'
  };

  const formCardStyle = {
    maxWidth: isMobile ? '95%' : isTablet ? '85%' : '630px',
    margin: "0 auto 35px auto",
    padding: isMobile ? "20px 15px" : "25px 28px 20px 28px",
    textAlign: "center"
  };

  const formTitleStyle = {
    color: "#FF9800",
    fontWeight: 800,
    fontSize: isMobile ? 18 : 21,
    margin: "0 0 13px 0"
  };

  const inputStyle = {
    width: "100%",
    margin: "7px 0 13px 0",
    padding: isMobile ? "10px 12px" : "12px 15px",
    fontSize: isMobile ? 14 : 15,
    borderRadius: 7,
    border: "1.5px solid #ffe8c7",
    background: "#fff",
    transition: "all 0.3s ease",
    boxSizing: "border-box"
  };

  const submitButtonStyle = {
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
    width: isMobile ? "100%" : "auto"
  };

  // Affiliate popup responsive styles
  const affiliatePopupStyle = {
    position: 'fixed',
    right: isOfferOpen ? (isMobile ? '50%' : '50%') : '-100%',
    top: '50%',
    transform: isOfferOpen 
      ? (isMobile ? 'translate(50%, -50%)' : 'translate(50%, -50%)') 
      : 'translateY(-50%)',
    zIndex: 1000,
    transition: 'all 0.5s ease-out',
  };

  const affiliateCardStyle = {
    background: 'linear-gradient(135deg, #FF6B35, #F7931E)',
    padding: isOfferOpen ? (isMobile ? '25px' : '40px') : '20px',
    borderRadius: isMobile ? '15px' : '20px',
    boxShadow: '0 10px 30px rgba(255, 107, 53, 0.3)',
    width: isOfferOpen ? (isMobile ? '320px' : isTablet ? '400px' : '500px') : '80px',
    height: isOfferOpen ? 'auto' : (isMobile ? '80px' : '100px'),
    cursor: 'pointer',
    position: 'relative',
    transition: 'all 0.4s ease-out',
    maxWidth: isMobile ? '90vw' : 'none'
  };

  const affiliateTitleStyle = {
    margin: '0 0 15px 0',
    fontSize: isMobile ? '20px' : isTablet ? '24px' : '28px',
    fontWeight: 'bold',
    textShadow: '2px 2px 4px rgba(0,0,0,0.1)'
  };

  const affiliateTextStyle = {
    fontSize: isMobile ? '16px' : '20px',
    lineHeight: 1.6,
    margin: '0 0 25px 0',
    padding: '0 10px'
  };

  const affiliateEarningsStyle = {
    fontSize: isMobile ? '18px' : '24px',
    fontWeight: 'bold',
    margin: '10px 0',
    padding: '10px',
    background: 'rgba(255,255,255,0.1)',
    borderRadius: '10px',
    animation: 'pulse 2s infinite'
  };

  const affiliateButtonStyle = {
    background: 'white',
    color: '#FF6B35',
    border: 'none',
    padding: isMobile ? '12px 20px' : '15px 30px',
    borderRadius: '30px',
    fontWeight: 'bold',
    cursor: 'pointer',
    fontSize: isMobile ? '14px' : '18px',
    transition: 'all 0.3s ease',
    boxShadow: '0 5px 15px rgba(0,0,0,0.1)'
  };
}