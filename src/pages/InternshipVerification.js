import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { 
  CheckCircle, 
  XCircle, 
  Search, 
  FileText, 
  Calendar, 
  MapPin, 
  Phone, 
  Mail,
  User,
  BookOpen,
  Clock,
  Shield,
  ArrowLeft,
  Loader,
  Building,
  Globe,
  ChevronRight
} from 'lucide-react';

const InternshipVerification = () => {
  const { certificateId } = useParams();
  const [verificationData, setVerificationData] = useState(null);
  const [companyInfo, setCompanyInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchId, setSearchId] = useState(certificateId || '');
  const [verificationStatus, setVerificationStatus] = useState(null);
  const [verificationAttempts, setVerificationAttempts] = useState(0);

  // Enhanced responsive CSS styles
  const styles = {
    pageContainer: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #fff7ed 0%, #fed7aa 50%, #fb923c 100%)',
      position: 'relative',
      overflow: 'hidden'
    },
    backgroundOrb1: {
      position: 'absolute',
      top: '-100px',
      right: '-100px',
      width: '200px',
      height: '200px',
      background: 'radial-gradient(circle, rgba(251, 146, 60, 0.15) 0%, transparent 70%)',
      borderRadius: '50%',
      animation: 'float 6s ease-in-out infinite',
      pointerEvents: 'none',
      '@media (min-width: 768px)': {
        top: '-200px',
        right: '-200px',
        width: '400px',
        height: '400px'
      }
    },
    backgroundOrb2: {
      position: 'absolute',
      bottom: '-100px',
      left: '-100px',
      width: '250px',
      height: '250px',
      background: 'radial-gradient(circle, rgba(245, 101, 101, 0.15) 0%, transparent 70%)',
      borderRadius: '50%',
      animation: 'float 8s ease-in-out infinite reverse',
      pointerEvents: 'none',
      '@media (min-width: 768px)': {
        bottom: '-200px',
        left: '-200px',
        width: '500px',
        height: '500px'
      }
    },
    header: {
      background: 'linear-gradient(135deg, #ea580c 0%, #f97316 50%, #fb923c 100%)',
      boxShadow: '0 10px 25px -5px rgba(234, 88, 12, 0.25)',
      borderBottom: '1px solid rgba(251, 146, 60, 0.3)',
      position: 'relative',
      backdropFilter: 'blur(10px)',
      '@media (min-width: 768px)': {
        boxShadow: '0 25px 50px -12px rgba(234, 88, 12, 0.25)'
      }
    },
    headerContent: {
      maxWidth: '1280px',
      margin: '0 auto',
      padding: '16px 12px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      gap: '12px',
      '@media (min-width: 768px)': {
        padding: '24px 16px',
        gap: '16px'
      }
    },
    logo: {
      width: '48px',
      height: '48px',
      background: 'rgba(255, 255, 255, 0.2)',
      backdropFilter: 'blur(10px)',
      borderRadius: '12px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white',
      fontWeight: 'bold',
      fontSize: '16px',
      marginRight: '12px',
      boxShadow: '0 8px 16px -2px rgba(0, 0, 0, 0.1)',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      transition: 'transform 0.3s ease',
      position: 'relative',
      '@media (min-width: 768px)': {
        width: '64px',
        height: '64px',
        borderRadius: '16px',
        fontSize: '20px',
        marginRight: '16px',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
      }
    },
    logoText: {
      transform: 'rotate(3deg)',
      position: 'relative',
      zIndex: 10
    },
    headerTitle: {
      fontSize: '24px',
      fontWeight: '900',
      color: 'white',
      lineHeight: '1.2',
      background: 'linear-gradient(to right, #ffffff, #fed7aa)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
      '@media (min-width: 768px)': {
        fontSize: '36px'
      }
    },
    headerSubtitle: {
      fontSize: '12px',
      color: 'rgba(254, 215, 170, 0.9)',
      marginTop: '4px',
      fontWeight: '500',
      '@media (min-width: 768px)': {
        fontSize: '14px'
      }
    },
    backButton: {
      display: 'flex',
      alignItems: 'center',
      padding: '8px 16px',
      background: 'rgba(255, 255, 255, 0.2)',
      color: 'white',
      borderRadius: '12px',
      border: '1px solid rgba(255, 255, 255, 0.3)',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      backdropFilter: 'blur(10px)',
      boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
      fontSize: '12px',
      fontWeight: '600',
      textDecoration: 'none',
      '@media (min-width: 768px)': {
        padding: '12px 20px',
        borderRadius: '16px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
        fontSize: '14px'
      }
    },
    searchSection: {
      maxWidth: '1024px',
      margin: '0 auto',
      padding: '16px 12px',
      position: 'relative',
      '@media (min-width: 768px)': {
        padding: '32px 16px'
      }
    },
    searchCard: {
      background: 'rgba(255, 255, 255, 0.9)',
      backdropFilter: 'blur(20px)',
      borderRadius: '16px',
      boxShadow: '0 10px 25px -3px rgba(0, 0, 0, 0.15)',
      padding: '24px 16px',
      border: '1px solid rgba(255, 255, 255, 0.5)',
      marginBottom: '16px',
      position: 'relative',
      overflow: 'hidden',
      '@media (min-width: 768px)': {
        borderRadius: '24px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        padding: '48px',
        marginBottom: '32px'
      }
    },
    searchTitle: {
      textAlign: 'center',
      marginBottom: '24px',
      '@media (min-width: 768px)': {
        marginBottom: '32px'
      }
    },
    searchIcon: {
      width: '48px',
      height: '48px',
      background: 'linear-gradient(135deg, #ea580c, #f97316)',
      borderRadius: '12px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      margin: '0 auto 12px',
      boxShadow: '0 8px 16px -2px rgba(234, 88, 12, 0.4)',
      '@media (min-width: 768px)': {
        width: '64px',
        height: '64px',
        borderRadius: '16px',
        marginBottom: '16px',
        boxShadow: '0 20px 25px -5px rgba(234, 88, 12, 0.4)'
      }
    },
    searchTitleText: {
      fontSize: '24px',
      fontWeight: 'bold',
      background: 'linear-gradient(135deg, #ea580c, #f97316)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
      marginBottom: '8px',
      '@media (min-width: 768px)': {
        fontSize: '32px'
      }
    },
    searchInput: {
      width: '100%',
      maxWidth: '400px',
      margin: '0 auto',
      padding: '12px 16px',
      fontSize: '16px',
      textAlign: 'center',
      fontFamily: 'monospace',
      background: 'white',
      border: '2px solid #fed7aa',
      borderRadius: '12px',
      boxShadow: '0 4px 12px -1px rgba(0, 0, 0, 0.1)',
      transition: 'all 0.3s ease',
      marginBottom: '12px',
      '@media (min-width: 768px)': {
        padding: '16px 24px',
        fontSize: '18px',
        borderRadius: '16px',
        boxShadow: '0 10px 25px -3px rgba(0, 0, 0, 0.1)',
        marginBottom: '16px'
      }
    },
    searchButton: {
      width: '100%',
      maxWidth: '400px',
      margin: '0 auto',
      padding: '12px 20px',
      background: 'linear-gradient(135deg, #ea580c, #f97316)',
      color: 'white',
      border: 'none',
      borderRadius: '12px',
      fontSize: '14px',
      fontWeight: 'bold',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      boxShadow: '0 4px 12px -1px rgba(234, 88, 12, 0.4)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
      '@media (min-width: 768px)': {
        padding: '16px 24px',
        borderRadius: '16px',
        fontSize: '16px',
        boxShadow: '0 10px 25px -3px rgba(234, 88, 12, 0.4)'
      }
    },
    statusBadgeValid: {
      display: 'inline-flex',
      alignItems: 'center',
      padding: '12px 20px',
      background: 'linear-gradient(135deg, #10b981, #059669)',
      color: 'white',
      borderRadius: '12px',
      fontWeight: 'bold',
      fontSize: '14px',
      boxShadow: '0 8px 16px -2px rgba(16, 185, 129, 0.4)',
      animation: 'pulse 2s infinite',
      gap: '8px',
      '@media (min-width: 768px)': {
        padding: '16px 32px',
        borderRadius: '16px',
        fontSize: '18px',
        boxShadow: '0 20px 25px -5px rgba(16, 185, 129, 0.4)',
        gap: '12px'
      }
    },
    statusBadgeInvalid: {
      display: 'inline-flex',
      alignItems: 'center',
      padding: '12px 20px',
      background: 'linear-gradient(135deg, #ef4444, #dc2626)',
      color: 'white',
      borderRadius: '12px',
      fontWeight: 'bold',
      fontSize: '14px',
      boxShadow: '0 8px 16px -2px rgba(239, 68, 68, 0.4)',
      gap: '8px',
      '@media (min-width: 768px)': {
        padding: '16px 32px',
        borderRadius: '16px',
        fontSize: '18px',
        boxShadow: '0 20px 25px -5px rgba(239, 68, 68, 0.4)',
        gap: '12px'
      }
    },
    resultsCard: {
      background: 'rgba(255, 255, 255, 0.95)',
      backdropFilter: 'blur(20px)',
      borderRadius: '16px',
      boxShadow: '0 10px 25px -3px rgba(0, 0, 0, 0.15)',
      padding: '24px 16px',
      border: '1px solid rgba(255, 255, 255, 0.5)',
      marginBottom: '16px',
      '@media (min-width: 768px)': {
        borderRadius: '24px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        padding: '48px',
        marginBottom: '32px'
      }
    },
    infoCard: {
      background: 'linear-gradient(135deg, #fff7ed, #fed7aa)',
      borderRadius: '12px',
      padding: '16px',
      border: '1px solid rgba(251, 146, 60, 0.2)',
      boxShadow: '0 2px 4px -1px rgba(0, 0, 0, 0.1)',
      marginBottom: '16px',
      '@media (min-width: 768px)': {
        borderRadius: '16px',
        padding: '24px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        marginBottom: '24px'
      }
    },
    infoCardHeader: {
      display: 'flex',
      alignItems: 'center',
      marginBottom: '16px',
      gap: '8px',
      '@media (min-width: 768px)': {
        marginBottom: '20px',
        gap: '12px'
      }
    },
    infoCardIcon: {
      padding: '8px',
      background: 'linear-gradient(135deg, #ea580c, #f97316)',
      borderRadius: '8px',
      color: 'white',
      boxShadow: '0 2px 4px -1px rgba(234, 88, 12, 0.4)',
      '@media (min-width: 768px)': {
        padding: '12px',
        borderRadius: '12px',
        boxShadow: '0 4px 6px -1px rgba(234, 88, 12, 0.4)'
      }
    },
    infoCardTitle: {
      fontSize: '16px',
      fontWeight: 'bold',
      color: '#1f2937',
      '@media (min-width: 768px)': {
        fontSize: '20px'
      }
    },
    infoCardSubtitle: {
      fontSize: '12px',
      color: '#ea580c',
      '@media (min-width: 768px)': {
        fontSize: '14px'
      }
    },
    infoItem: {
      display: 'flex',
      alignItems: 'flex-start',
      padding: '8px',
      background: 'rgba(255, 255, 255, 0.8)',
      borderRadius: '8px',
      marginBottom: '8px',
      transition: 'all 0.2s ease',
      gap: '8px',
      '@media (min-width: 768px)': {
        padding: '12px',
        borderRadius: '12px',
        marginBottom: '12px',
        gap: '12px'
      }
    },
    infoItemIcon: {
      padding: '6px',
      background: 'linear-gradient(135deg, #fed7aa, #fb923c)',
      borderRadius: '6px',
      color: '#ea580c',
      flexShrink: 0,
      '@media (min-width: 768px)': {
        padding: '8px',
        borderRadius: '8px'
      }
    },
    loadingCard: {
      background: 'rgba(255, 255, 255, 0.9)',
      backdropFilter: 'blur(20px)',
      borderRadius: '16px',
      boxShadow: '0 10px 25px -3px rgba(0, 0, 0, 0.15)',
      padding: '32px 16px',
      textAlign: 'center',
      border: '1px solid rgba(255, 255, 255, 0.5)',
      marginBottom: '16px',
      '@media (min-width: 768px)': {
        borderRadius: '24px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)',
        padding: '64px',
        marginBottom: '32px'
      }
    },
    loadingSpinner: {
      width: '60px',
      height: '60px',
      border: '3px solid #fed7aa',
      borderTop: '3px solid #ea580c',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite',
      margin: '0 auto 16px',
      '@media (min-width: 768px)': {
        width: '80px',
        height: '80px',
        border: '4px solid #fed7aa',
        borderTop: '4px solid #ea580c',
        margin: '0 auto 24px'
      }
    },
    gridContainer: {
      display: 'grid',
      gridTemplateColumns: '1fr',
      gap: '16px',
      '@media (min-width: 768px)': {
        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
        gap: '32px'
      }
    },
    companyInfoCard: {
      marginTop: '24px',
      background: 'linear-gradient(135deg, #ea580c, #f97316)',
      color: 'white',
      borderRadius: '16px',
      padding: '20px',
      boxShadow: '0 8px 16px -2px rgba(234, 88, 12, 0.4)',
      '@media (min-width: 768px)': {
        marginTop: '32px',
        borderRadius: '24px',
        padding: '32px',
        boxShadow: '0 20px 25px -5px rgba(234, 88, 12, 0.4)'
      }
    },
    companyInfoGrid: {
      display: 'grid',
      gridTemplateColumns: '1fr',
      gap: '12px',
      opacity: 0.9,
      '@media (min-width: 768px)': {
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px'
      }
    },
    companyInfoItem: {
      display: 'flex',
      alignItems: 'center',
      fontSize: '12px',
      background: 'rgba(255, 255, 255, 0.1)',
      borderRadius: '6px',
      padding: '8px',
      backdropFilter: 'blur(10px)',
      '@media (min-width: 768px)': {
        fontSize: '14px',
        borderRadius: '8px',
        padding: '12px'
      }
    }
  };

  // Add keyframes for animations
  useEffect(() => {
    const styleSheet = document.createElement('style');
    styleSheet.type = 'text/css';
    styleSheet.innerText = `
      @keyframes float {
        0%, 100% { transform: translateY(0px); }
        50% { transform: translateY(-20px); }
      }
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
      @keyframes pulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.05); }
      }
      .search-input:focus {
        outline: none;
        border-color: #ea580c;
        box-shadow: 0 0 0 3px rgba(234, 88, 12, 0.1);
      }
      .search-button:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 20px -2px rgba(234, 88, 12, 0.5);
      }
      @media (min-width: 768px) {
        .search-button:hover {
          box-shadow: 0 15px 35px -3px rgba(234, 88, 12, 0.5);
        }
      }
      .back-button:hover {
        background: rgba(255, 255, 255, 0.3);
      }
      .info-item:hover {
        background: rgba(255, 255, 255, 0.95);
        transform: translateY(-1px);
      }
      .logo:hover {
        transform: scale(1.1);
      }
    `;
    document.head.appendChild(styleSheet);
    return () => document.head.removeChild(styleSheet);
  }, []);

  useEffect(() => {
    const fetchCompanyInfo = async () => {
      // Mock data for demonstration
      setCompanyInfo({
        company_name: 'Syed Solar Energy',
        company_address: 'Jalil Market Umar Gull Chowck, Bara Road, Peshawar',
        company_email: 'sales@syedsolarenergy.com'
      });
    };
    
    fetchCompanyInfo();
  }, []);

  const verifyCertificate = async (id) => {
    setLoading(true);
    setVerificationStatus(null);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock verification result
      if (id === 'SSE-IC-20250901-1234' || id.includes('SSE-IC')) {
        setVerificationStatus('valid');
        setVerificationData({
          certificate_id: id,
          candidate_name: 'John Doe',
          father_name: 'Robert Doe',
          dob: '1995-05-15',
          email: 'john.doe@email.com',
          issue_date: '2025-01-15',
          joining_date: '2024-12-01',
          leaving_date: '2025-01-15',
          verification_count: 5
        });
      } else {
        setVerificationStatus('invalid');
        setVerificationData(null);
      }
    } catch (error) {
      console.error('Verification error:', error);
      setVerificationStatus('invalid');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (certificateId) {
      verifyCertificate(certificateId);
    } else {
      setLoading(false);
    }
  }, [certificateId]);

  const handleSearch = () => {
    if (searchId.trim()) {
      verifyCertificate(searchId.trim());
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not specified';
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  const getStatusBadge = () => {
    switch (verificationStatus) {
      case 'valid':
        return (
          <div style={styles.statusBadgeValid}>
            <CheckCircle size={window.innerWidth >= 768 ? 24 : 20} />
            <div>
              <div style={{ fontSize: window.innerWidth >= 768 ? '18px' : '14px', fontWeight: 'bold' }}>Verified & Valid</div>
              <div style={{ fontSize: window.innerWidth >= 768 ? '12px' : '10px', opacity: 0.9 }}>Certificate Authenticated</div>
            </div>
          </div>
        );
      case 'invalid':
        return (
          <div style={styles.statusBadgeInvalid}>
            <XCircle size={window.innerWidth >= 768 ? 24 : 20} />
            <div>
              <div style={{ fontSize: window.innerWidth >= 768 ? '18px' : '14px', fontWeight: 'bold' }}>Invalid Certificate</div>
              <div style={{ fontSize: window.innerWidth >= 768 ? '12px' : '10px', opacity: 0.9 }}>ID Not Found</div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div style={styles.pageContainer}>
      {/* Background Elements */}
      <div style={styles.backgroundOrb1}></div>
      <div style={styles.backgroundOrb2}></div>

      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerContent}>
          <div style={{ display: 'flex', alignItems: 'center', flex: 1, minWidth: 0 }}>
            <div style={{ minWidth: 0, flex: 1 }}>
              <h1 style={styles.headerTitle}>Certificate Verification</h1>
              <p style={styles.headerSubtitle}>🔐 Secure • ⚡ Instant • ✅ Verified</p>
            </div>
          </div>
          <button 
            style={styles.backButton} 
            className="back-button"
            onClick={() => window.location.href = '/'}
          >
            <ArrowLeft size={16} style={{ marginRight: '6px' }} />
            <span style={{ display: window.innerWidth >= 480 ? 'inline' : 'none' }}>Back to Home</span>
            <span style={{ display: window.innerWidth < 480 ? 'inline' : 'none' }}>Back</span>
          </button>
        </div>
      </div>

      <div style={styles.searchSection}>
        {/* Search Section */}
        <div style={styles.searchCard}>
          <div style={styles.searchTitle}>
            <div style={styles.searchIcon}>
              <Search size={window.innerWidth >= 768 ? 24 : 20} color="white" />
            </div>
            <h2 style={styles.searchTitleText}>Verify Certificate</h2>
            <p style={{ color: '#6b7280', fontSize: window.innerWidth >= 768 ? '16px' : '14px' }}>Enter your certificate ID to verify authenticity</p>
          </div>
          
          <div style={{ maxWidth: '400px', margin: '0 auto' }}>
            <input
              type="text"
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="SSE-IC-20250901-1234"
              style={styles.searchInput}
              className="search-input"
            />
            <button
              onClick={handleSearch}
              disabled={loading || !searchId.trim()}
              style={styles.searchButton}
              className="search-button"
            >
              {loading ? (
                <>
                  <Loader size={16} style={{ animation: 'spin 1s linear infinite' }} />
                  <span>Verifying...</span>
                </>
              ) : (
                <>
                  <Search size={16} />
                  <span>Verify Certificate</span>
                </>
              )}
            </button>
          </div>
          
          <div style={{ 
            marginTop: '16px', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            fontSize: window.innerWidth >= 768 ? '14px' : '12px', 
            color: '#f59e0b',
            textAlign: 'center'
          }}>
            <ChevronRight size={14} style={{ marginRight: '4px', flexShrink: 0 }} />
            <span>Secure verification powered by blockchain technology</span>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div style={styles.loadingCard}>
            <div style={styles.loadingSpinner}></div>
            <h3 style={{ 
              fontSize: window.innerWidth >= 768 ? '24px' : '20px', 
              fontWeight: 'bold', 
              color: '#1f2937', 
              marginBottom: '8px' 
            }}>
              Verifying Certificate
            </h3>
            <p style={{ color: '#6b7280', fontSize: window.innerWidth >= 768 ? '16px' : '14px' }}>
              Please wait while we authenticate your certificate...
            </p>
          </div>
        )}

        {/* Verification Results */}
        {!loading && verificationStatus && (
          <div style={styles.resultsCard}>
            <div style={{ textAlign: 'center', marginBottom: window.innerWidth >= 768 ? '48px' : '32px' }}>
              {getStatusBadge()}
            </div>

            {verificationStatus === 'invalid' && (
              <div style={{ textAlign: 'center', padding: window.innerWidth >= 768 ? '48px 0' : '32px 0' }}>
                <XCircle size={window.innerWidth >= 768 ? 60 : 40} color="#ef4444" style={{ margin: '0 auto 24px' }} />
                <h3 style={{ 
                  fontSize: window.innerWidth >= 768 ? '32px' : '24px', 
                  fontWeight: 'bold', 
                  color: '#1f2937', 
                  marginBottom: '16px' 
                }}>
                  Certificate Not Found
                </h3>
                <p style={{ 
                  fontSize: window.innerWidth >= 768 ? '16px' : '14px', 
                  color: '#6b7280', 
                  marginBottom: '32px', 
                  maxWidth: '400px', 
                  margin: '0 auto 32px' 
                }}>
                  The certificate ID you entered could not be found in our database. Please check the ID and try again.
                </p>
              </div>
            )}

            {verificationStatus === 'valid' && verificationData && (
              <div>
                <div style={styles.gridContainer}>
                  {/* Candidate Information */}
                  <div>
                    <div style={styles.infoCard}>
                      <div style={styles.infoCardHeader}>
                        <div style={styles.infoCardIcon}>
                          <User size={window.innerWidth >= 768 ? 20 : 16} />
                        </div>
                        <div>
                          <h3 style={styles.infoCardTitle}>Candidate Information</h3>
                          <p style={styles.infoCardSubtitle}>Personal Details</p>
                        </div>
                      </div>
                      <div>
                        <div style={styles.infoItem} className="info-item">
                          <div style={styles.infoItemIcon}>
                            <User size={14} />
                          </div>
                          <div>
                            <p style={{ fontSize: '11px', color: '#6b7280', fontWeight: '500' }}>Full Name</p>
                            <p style={{ fontWeight: '600', color: '#1f2937', fontSize: window.innerWidth >= 768 ? '14px' : '13px' }}>
                              {verificationData.candidate_name}
                            </p>
                          </div>
                        </div>
                        <div style={styles.infoItem} className="info-item">
                          <div style={styles.infoItemIcon}>
                            <User size={14} />
                          </div>
                          <div>
                            <p style={{ fontSize: '11px', color: '#6b7280', fontWeight: '500' }}>Father's Name</p>
                            <p style={{ fontWeight: '600', color: '#1f2937', fontSize: window.innerWidth >= 768 ? '14px' : '13px' }}>
                              {verificationData.father_name}
                            </p>
                          </div>
                        </div>
                        <div style={styles.infoItem} className="info-item">
                          <div style={styles.infoItemIcon}>
                            <Calendar size={14} />
                          </div>
                          <div>
                            <p style={{ fontSize: '11px', color: '#6b7280', fontWeight: '500' }}>Date of Birth</p>
                            <p style={{ fontWeight: '600', color: '#1f2937', fontSize: window.innerWidth >= 768 ? '14px' : '13px' }}>
                              {formatDate(verificationData.dob)}
                            </p>
                          </div>
                        </div>
                        <div style={styles.infoItem} className="info-item">
                          <div style={styles.infoItemIcon}>
                            <Mail size={14} />
                          </div>
                          <div>
                            <p style={{ fontSize: '11px', color: '#6b7280', fontWeight: '500' }}>Email</p>
                            <p style={{ 
                              fontWeight: '600', 
                              color: '#1f2937', 
                              wordBreak: 'break-all',
                              fontSize: window.innerWidth >= 768 ? '14px' : '12px'
                            }}>
                              {verificationData.email}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Certificate Details */}
                  <div>
                    <div style={styles.infoCard}>
                      <div style={styles.infoCardHeader}>
                        <div style={styles.infoCardIcon}>
                          <FileText size={window.innerWidth >= 768 ? 20 : 16} />
                        </div>
                        <div>
                          <h3 style={styles.infoCardTitle}>Certificate Details</h3>
                          <p style={styles.infoCardSubtitle}>Official Information</p>
                        </div>
                      </div>
                      <div>
                        <div style={styles.infoItem} className="info-item">
                          <div style={styles.infoItemIcon}>
                            <Shield size={14} />
                          </div>
                          <div>
                            <p style={{ fontSize: '11px', color: '#6b7280', fontWeight: '500' }}>Certificate ID</p>
                            <p style={{ 
                              fontWeight: '600', 
                              color: '#1f2937', 
                              fontFamily: 'monospace', 
                              fontSize: window.innerWidth >= 768 ? '14px' : '12px',
                              wordBreak: 'break-all'
                            }}>
                              {verificationData.certificate_id}
                            </p>
                          </div>
                        </div>
                        <div style={styles.infoItem} className="info-item">
                          <div style={styles.infoItemIcon}>
                            <Calendar size={14} />
                          </div>
                          <div>
                            <p style={{ fontSize: '11px', color: '#6b7280', fontWeight: '500' }}>Issue Date</p>
                            <p style={{ fontWeight: '600', color: '#1f2937', fontSize: window.innerWidth >= 768 ? '14px' : '13px' }}>
                              {formatDate(verificationData.issue_date)}
                            </p>
                          </div>
                        </div>
                        <div style={styles.infoItem} className="info-item">
                          <div style={styles.infoItemIcon}>
                            <Calendar size={14} />
                          </div>
                          <div>
                            <p style={{ fontSize: '11px', color: '#6b7280', fontWeight: '500' }}>Duration</p>
                            <p style={{ fontWeight: '600', color: '#1f2937', fontSize: window.innerWidth >= 768 ? '14px' : '13px' }}>
                              {Math.ceil(Math.abs(
                                new Date(verificationData.leaving_date) - 
                                new Date(verificationData.joining_date)
                              ) / (1000 * 60 * 60 * 24 * 7))} weeks
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Company Info */}
                <div style={styles.companyInfoCard}>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'flex-start', 
                    justifyContent: 'space-between', 
                    flexWrap: 'wrap', 
                    gap: '16px'
                  }}>
                    <div style={{ flex: 1, minWidth: '250px' }}>
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        marginBottom: '12px',
                        flexWrap: 'wrap',
                        gap: '8px'
                      }}>
                        <Building size={window.innerWidth >= 768 ? 24 : 20} style={{ marginRight: '8px', flexShrink: 0 }} />
                        <div>
                          <h3 style={{ 
                            fontSize: window.innerWidth >= 768 ? '24px' : '18px', 
                            fontWeight: 'bold',
                            lineHeight: '1.2'
                          }}>
                            {companyInfo?.company_name || 'Syed Solar Energy'}
                          </h3>
                          <p style={{ 
                            color: 'rgba(254, 215, 170, 0.9)', 
                            fontSize: window.innerWidth >= 768 ? '14px' : '12px'
                          }}>
                            Certificate Issuing Authority
                          </p>
                        </div>
                      </div>
                      <div style={styles.companyInfoGrid}>
                        <div style={styles.companyInfoItem}>
                          <MapPin size={14} style={{ marginRight: '6px', flexShrink: 0 }} />
                          <span style={{ wordBreak: 'break-word' }}>
                            {companyInfo?.company_address || 'Jalil Market Umar Gull Chowck, Bara Road, Peshawar'}
                          </span>
                        </div>
                        <div style={styles.companyInfoItem}>
                          <Mail size={14} style={{ marginRight: '6px', flexShrink: 0 }} />
                          <span style={{ wordBreak: 'break-all' }}>
                            {companyInfo?.company_email || 'sales@syedsolarenergy.com'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div style={{ 
                      textAlign: 'center', 
                      background: 'rgba(255, 255, 255, 0.2)', 
                      padding: window.innerWidth >= 768 ? '24px' : '16px', 
                      borderRadius: '12px', 
                      backdropFilter: 'blur(10px)', 
                      border: '1px solid rgba(255, 255, 255, 0.3)',
                      minWidth: '150px'
                    }}>
                      <p style={{ 
                        fontSize: '12px', 
                        opacity: 0.9, 
                        marginBottom: '8px' 
                      }}>
                        Verified on
                      </p>
                      <p style={{ 
                        fontWeight: 'bold', 
                        fontSize: window.innerWidth >= 768 ? '18px' : '16px'
                      }}>
                        {new Date().toLocaleDateString()}
                      </p>
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        marginTop: '8px', 
                        color: 'rgba(254, 215, 170, 0.9)' 
                      }}>
                        <span style={{ fontSize: '12px' }}>
                          Verification #{verificationData.verification_count || 1}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* No Search Results */}
        {!loading && !verificationStatus && !certificateId && (
          <div style={styles.resultsCard}>
            <div style={{ textAlign: 'center', padding: window.innerWidth >= 768 ? '48px 0' : '32px 0' }}>
              <div style={{ position: 'relative', display: 'inline-block', marginBottom: '24px' }}>
                <Search size={window.innerWidth >= 768 ? 60 : 40} color="#f97316" />
                <div style={{
                  position: 'absolute',
                  top: '-16px',
                  left: '-16px',
                  right: '-16px',
                  bottom: '-16px',
                  background: 'radial-gradient(circle, rgba(249, 115, 22, 0.1) 0%, transparent 70%)',
                  borderRadius: '50%',
                  zIndex: -1
                }}></div>
              </div>
              <h3 style={{ 
                fontSize: window.innerWidth >= 768 ? '32px' : '24px', 
                fontWeight: 'bold', 
                color: '#1f2937', 
                marginBottom: '16px' 
              }}>
                Enter Certificate ID to Verify
              </h3>
              <p style={{ 
                fontSize: window.innerWidth >= 768 ? '16px' : '14px', 
                color: '#6b7280', 
                marginBottom: '24px', 
                maxWidth: '400px', 
                margin: '0 auto 24px',
                padding: '0 16px'
              }}>
                Please enter a valid internship certificate ID to verify its authenticity and view details.
              </p>
              <div style={{
                background: 'linear-gradient(135deg, #fff7ed, #fed7aa)',
                border: '1px solid #fed7aa',
                borderRadius: '12px',
                padding: window.innerWidth >= 768 ? '24px' : '16px',
                textAlign: 'left',
                maxWidth: '400px',
                margin: '0 auto'
              }}>
                <h4 style={{ 
                  fontWeight: '600', 
                  color: '#ea580c', 
                  marginBottom: '12px', 
                  display: 'flex', 
                  alignItems: 'center',
                  fontSize: window.innerWidth >= 768 ? '16px' : '14px'
                }}>
                  <Shield size={14} style={{ marginRight: '6px', flexShrink: 0 }} />
                  Certificate ID Format:
                </h4>
                <p style={{ 
                  color: '#ea580c', 
                  fontSize: window.innerWidth >= 768 ? '16px' : '14px', 
                  fontFamily: 'monospace',
                  wordBreak: 'break-all'
                }}>
                  SSE-IC-YYYYMMDD-XXXX
                </p>
                <p style={{ 
                  color: '#ea580c', 
                  fontSize: window.innerWidth >= 768 ? '14px' : '12px', 
                  marginTop: '8px',
                  fontFamily: 'monospace'
                }}>
                  Example: SSE-IC-20250901-1234
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div style={{ marginTop: window.innerWidth >= 768 ? '64px' : '48px', textAlign: 'center' }}>
          <div style={{
            display: 'inline-block',
            background: 'rgba(255, 255, 255, 0.8)',
            backdropFilter: 'blur(10px)',
            borderRadius: '12px',
            padding: window.innerWidth >= 768 ? '24px' : '16px',
            boxShadow: '0 8px 16px -2px rgba(0, 0, 0, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.5)',
            margin: '0 12px',
            maxWidth: '500px'
          }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              marginBottom: '12px',
              flexWrap: 'wrap',
              gap: '4px'
            }}>
              <Shield size={18} color="#ea580c" style={{ marginRight: '6px', flexShrink: 0 }} />
              <span style={{ 
                fontWeight: '600', 
                color: '#1f2937',
                fontSize: window.innerWidth >= 768 ? '16px' : '14px'
              }}>
                Secured by SSE Technology
              </span>
            </div>
            <p style={{ 
              color: '#6b7280', 
              fontSize: window.innerWidth >= 768 ? '14px' : '12px',
              lineHeight: '1.5'
            }}>
              © {new Date().getFullYear()} Syed Solar Energy. This verification system ensures the authenticity 
              of internship certificates using advanced security protocols.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InternshipVerification;