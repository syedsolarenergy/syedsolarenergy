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
  Briefcase,
  Clock,
  Shield,
  ArrowLeft,
  Loader,
  Building,
  Globe,
  ChevronRight
} from 'lucide-react';
import { supabase } from '../supabaseClient';

const ExperienceVerification = () => {
  const { certificateId } = useParams();
  const [verificationData, setVerificationData] = useState(null);
  const [companyInfo, setCompanyInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchId, setSearchId] = useState(certificateId || '');
  const [verificationStatus, setVerificationStatus] = useState(null);
  const [verificationAttempts, setVerificationAttempts] = useState(0);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  // Handle window resize for responsive adjustments
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Responsive CSS styles
  const isMobile = windowWidth < 768;
  const isTablet = windowWidth >= 768 && windowWidth < 1024;

  const styles = {
    pageContainer: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #fff7ed 0%, #fed7aa 50%, #fb923c 100%)',
      position: 'relative',
      overflow: 'hidden',
      padding: isMobile ? '0 12px' : '0 20px'
    },
    backgroundOrb1: {
      position: 'absolute',
      top: isMobile ? '-100px' : '-200px',
      right: isMobile ? '-100px' : '-200px',
      width: isMobile ? '200px' : '400px',
      height: isMobile ? '200px' : '400px',
      background: 'radial-gradient(circle, rgba(251, 146, 60, 0.15) 0%, transparent 70%)',
      borderRadius: '50%',
      animation: 'float 6s ease-in-out infinite',
      pointerEvents: 'none'
    },
    backgroundOrb2: {
      position: 'absolute',
      bottom: isMobile ? '-100px' : '-200px',
      left: isMobile ? '-100px' : '-200px',
      width: isMobile ? '250px' : '500px',
      height: isMobile ? '250px' : '500px',
      background: 'radial-gradient(circle, rgba(245, 101, 101, 0.15) 0%, transparent 70%)',
      borderRadius: '50%',
      animation: 'float 8s ease-in-out infinite reverse',
      pointerEvents: 'none'
    },
    header: {
      background: 'linear-gradient(135deg, #ea580c 0%, #f97316 50%, #fb923c 100%)',
      boxShadow: '0 25px 50px -12px rgba(234, 88, 12, 0.25)',
      borderBottom: '1px solid rgba(251, 146, 60, 0.3)',
      position: 'relative',
      backdropFilter: 'blur(10px)',
      margin: isMobile ? '0 -12px' : '0 -20px',
      padding: isMobile ? '0 12px' : '0 20px'
    },
    headerContent: {
      maxWidth: '1280px',
      margin: '0 auto',
      padding: isMobile ? '16px' : '24px 16px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      gap: '16px'
    },
    headerTitle: {
      fontSize: isMobile ? '24px' : '36px',
      fontWeight: '900',
      color: 'white',
      lineHeight: '1.2',
      background: 'linear-gradient(to right, #ffffff, #fed7aa)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text'
    },
    headerSubtitle: {
      fontSize: isMobile ? '12px' : '14px',
      color: 'rgba(254, 215, 170, 0.9)',
      marginTop: '4px',
      fontWeight: '500'
    },
    backButton: {
      display: 'flex',
      alignItems: 'center',
      padding: isMobile ? '10px 16px' : '12px 20px',
      background: 'rgba(255, 255, 255, 0.2)',
      color: 'white',
      borderRadius: '16px',
      border: '1px solid rgba(255, 255, 255, 0.3)',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      backdropFilter: 'blur(10px)',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
      fontSize: isMobile ? '12px' : '14px',
      fontWeight: '600',
      textDecoration: 'none'
    },
    searchSection: {
      maxWidth: '1024px',
      margin: '0 auto',
      padding: isMobile ? '24px 0' : '32px 0'
    },
    searchCard: {
      background: 'rgba(255, 255, 255, 0.9)',
      backdropFilter: 'blur(20px)',
      borderRadius: isMobile ? '16px' : '24px',
      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
      padding: isMobile ? '24px' : '48px',
      border: '1px solid rgba(255, 255, 255, 0.5)',
      marginBottom: isMobile ? '24px' : '32px',
      position: 'relative',
      overflow: 'hidden'
    },
    searchTitle: {
      textAlign: 'center',
      marginBottom: isMobile ? '24px' : '32px'
    },
    searchIcon: {
      width: isMobile ? '48px' : '64px',
      height: isMobile ? '48px' : '64px',
      background: 'linear-gradient(135deg, #ea580c, #f97316)',
      borderRadius: '16px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      margin: '0 auto 16px',
      boxShadow: '0 20px 25px -5px rgba(234, 88, 12, 0.4)'
    },
    searchTitleText: {
      fontSize: isMobile ? '24px' : '32px',
      fontWeight: 'bold',
      background: 'linear-gradient(135deg, #ea580c, #f97316)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
      marginBottom: '8px'
    },
    searchInput: {
      width: '100%',
      maxWidth: '400px',
      margin: '0 auto',
      padding: isMobile ? '12px 16px' : '16px 24px',
      fontSize: isMobile ? '16px' : '18px',
      textAlign: 'center',
      fontFamily: 'monospace',
      background: 'white',
      border: '2px solid #fed7aa',
      borderRadius: '16px',
      boxShadow: '0 10px 25px -3px rgba(0, 0, 0, 0.1)',
      transition: 'all 0.3s ease',
      marginBottom: '16px'
    },
    searchButton: {
      width: '100%',
      maxWidth: '400px',
      margin: '0 auto',
      padding: isMobile ? '14px 20px' : '16px 24px',
      background: 'linear-gradient(135deg, #ea580c, #f97316)',
      color: 'white',
      border: 'none',
      borderRadius: '16px',
      fontSize: isMobile ? '14px' : '16px',
      fontWeight: 'bold',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      boxShadow: '0 10px 25px -3px rgba(234, 88, 12, 0.4)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px'
    },
    statusBadgeValid: {
      display: 'inline-flex',
      alignItems: 'center',
      padding: isMobile ? '12px 20px' : '16px 32px',
      background: 'linear-gradient(135deg, #10b981, #059669)',
      color: 'white',
      borderRadius: '16px',
      fontWeight: 'bold',
      fontSize: isMobile ? '16px' : '18px',
      boxShadow: '0 20px 25px -5px rgba(16, 185, 129, 0.4)',
      animation: 'pulse 2s infinite',
      gap: '12px'
    },
    statusBadgeInvalid: {
      display: 'inline-flex',
      alignItems: 'center',
      padding: isMobile ? '12px 20px' : '16px 32px',
      background: 'linear-gradient(135deg, #ef4444, #dc2626)',
      color: 'white',
      borderRadius: '16px',
      fontWeight: 'bold',
      fontSize: isMobile ? '16px' : '18px',
      boxShadow: '0 20px 25px -5px rgba(239, 68, 68, 0.4)',
      gap: '12px'
    },
    resultsCard: {
      background: 'rgba(255, 255, 255, 0.95)',
      backdropFilter: 'blur(20px)',
      borderRadius: isMobile ? '16px' : '24px',
      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
      padding: isMobile ? '24px' : '48px',
      border: '1px solid rgba(255, 255, 255, 0.5)',
      marginBottom: isMobile ? '24px' : '32px'
    },
    infoCard: {
      background: 'linear-gradient(135deg, #fff7ed, #fed7aa)',
      borderRadius: '16px',
      padding: isMobile ? '16px' : '24px',
      border: '1px solid rgba(251, 146, 60, 0.2)',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      marginBottom: isMobile ? '16px' : '24px'
    },
    infoCardHeader: {
      display: 'flex',
      alignItems: 'center',
      marginBottom: isMobile ? '16px' : '20px',
      gap: '12px'
    },
    infoCardIcon: {
      padding: isMobile ? '8px' : '12px',
      background: 'linear-gradient(135deg, #ea580c, #f97316)',
      borderRadius: '12px',
      color: 'white',
      boxShadow: '0 4px 6px -1px rgba(234, 88, 12, 0.4)'
    },
    infoCardTitle: {
      fontSize: isMobile ? '18px' : '20px',
      fontWeight: 'bold',
      color: '#1f2937'
    },
    infoCardSubtitle: {
      fontSize: isMobile ? '12px' : '14px',
      color: '#ea580c'
    },
    infoItem: {
      display: 'flex',
      alignItems: 'flex-start',
      padding: isMobile ? '8px' : '12px',
      background: 'rgba(255, 255, 255, 0.8)',
      borderRadius: '12px',
      marginBottom: isMobile ? '8px' : '12px',
      transition: 'all 0.2s ease',
      gap: '12px'
    },
    infoItemIcon: {
      padding: isMobile ? '6px' : '8px',
      background: 'linear-gradient(135deg, #fed7aa, #fb923c)',
      borderRadius: '8px',
      color: '#ea580c',
      flexShrink: 0
    },
    projectCard: {
      background: 'rgba(255, 255, 255, 0.9)',
      backdropFilter: 'blur(10px)',
      borderRadius: '16px',
      padding: isMobile ? '16px' : '20px',
      marginBottom: isMobile ? '12px' : '16px',
      borderLeft: '4px solid #fb923c',
      transition: 'all 0.3s ease',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
    },
    loadingCard: {
      background: 'rgba(255, 255, 255, 0.9)',
      backdropFilter: 'blur(20px)',
      borderRadius: isMobile ? '16px' : '24px',
      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)',
      padding: isMobile ? '32px' : '64px',
      textAlign: 'center',
      border: '1px solid rgba(255, 255, 255, 0.5)',
      marginBottom: isMobile ? '24px' : '32px'
    },
    loadingSpinner: {
      width: isMobile ? '60px' : '80px',
      height: isMobile ? '60px' : '80px',
      border: '4px solid #fed7aa',
      borderTop: '4px solid #ea580c',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite',
      margin: '0 auto 24px'
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
        box-shadow: 0 15px 35px -3px rgba(234, 88, 12, 0.5);
      }
      .back-button:hover {
        background: rgba(255, 255, 255, 0.3);
      }
      .info-item:hover {
        background: rgba(255, 255, 255, 0.95);
        transform: translateY(-1px);
      }
      .project-card:hover {
        transform: translateY(-2px);
        box-shadow: 0 10px 25px -3px rgba(0, 0, 0, 0.15);
        background: rgba(255, 255, 255, 0.95);
      }
      
      /* Responsive adjustments */
      @media (max-width: 768px) {
        .header-content {
          flex-direction: column;
          text-align: center;
        }
        
        .results-grid {
          grid-template-columns: 1fr !important;
          gap: 16px !important;
        }
        
        .company-info-grid {
          grid-template-columns: 1fr !important;
          gap: 12px !important;
        }
        
        .signature-grid {
          grid-template-columns: 1fr !important;
        }
      }
      
      @media (max-width: 480px) {
        .search-card {
          padding: 16px !important;
        }
        
        .results-card {
          padding: 16px !important;
        }
        
        .info-card {
          padding: 12px !important;
        }
        
        .search-input, .search-button {
          font-size: 14px !important;
        }
      }
      
      /* Improve touch targets for mobile */
      @media (max-width: 768px) {
        button, .info-item, .project-card {
          min-height: 44px; /* Minimum touch target size */
        }
        
        input {
          font-size: 16px; /* Prevents zoom on iOS */
        }
      }
    `;
    document.head.appendChild(styleSheet);
    return () => document.head.removeChild(styleSheet);
  }, []);

  useEffect(() => {
    const fetchCompanyInfo = async () => {
      const { data, error } = await supabase
        .from('company_settings')
        .select('*')
        .single();
      
      if (!error && data) {
        setCompanyInfo(data);
      }
    };
    
    fetchCompanyInfo();
  }, []);

  const verifyCertificate = async (id) => {
    setLoading(true);
    setVerificationStatus(null);
    
    try {
      const { data: certificateData, error: certificateError } = await supabase
        .from('experience_certificates')
        .select('*')
        .eq('certificate_id', id)
        .single();
      
      if (certificateError || !certificateData) {
        setVerificationStatus('invalid');
        setVerificationData(null);
        setLoading(false);
        return;
      }
      
      setVerificationStatus('valid');
      setVerificationData({ ...certificateData, isExpired: false });
      
      await supabase
        .from('experience_certificates')
        .update({ 
          verified_at: new Date().toISOString(),
          verification_count: (certificateData.verification_count || 0) + 1 
        })
        .eq('certificate_id', id);
      
      const { error: verificationError } = await supabase
        .from('experience_verifications')
        .insert([
          {
            certificate_id: id,
            ip_address: null,
            user_agent: navigator.userAgent,
            status: 'valid'
          }
        ]);
      
      if (!verificationError) {
        setVerificationAttempts(prev => prev + 1);
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
      window.location.href = `/verify-experience/${searchId.trim()}`;
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
            <CheckCircle size={isMobile ? 20 : 24} />
            <div>
              <div style={{ fontSize: isMobile ? '16px' : '18px', fontWeight: 'bold' }}>Verified & Valid</div>
              <div style={{ fontSize: isMobile ? '10px' : '12px', opacity: 0.9 }}>Experience Certificate Authenticated</div>
            </div>
          </div>
        );
      case 'invalid':
        return (
          <div style={styles.statusBadgeInvalid}>
            <XCircle size={isMobile ? 20 : 24} />
            <div>
              <div style={{ fontSize: isMobile ? '16px' : '18px', fontWeight: 'bold' }}>Invalid Certificate</div>
              <div style={{ fontSize: isMobile ? '10px' : '12px', opacity: 0.9 }}>ID Not Found</div>
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
        <div style={styles.headerContent} className="header-content">
          <div style={{ minWidth: 0, flex: 1 }}>
            <h1 style={styles.headerTitle}>Experience Verification</h1>
            <p style={styles.headerSubtitle}>🏆 Professional • ⚡ Validated • ✅ Certified</p>
          </div>
          <button 
            style={styles.backButton} 
            className="back-button"
            onClick={() => window.location.href = '/'}
          >
            <ArrowLeft size={isMobile ? 16 : 18} style={{ marginRight: '8px' }} />
            Back to Home
          </button>
        </div>
      </div>

      <div style={styles.searchSection}>
        {/* Search Section */}
        <div style={styles.searchCard} className="search-card">
          <div style={styles.searchTitle}>
            <div style={styles.searchIcon}>
              <Search size={isMobile ? 20 : 24} color="white" />
            </div>
            <h2 style={styles.searchTitleText}>Verify Experience Certificate</h2>
            <p style={{ color: '#6b7280', fontSize: isMobile ? '14px' : '16px' }}>Enter your certificate ID to validate professional experience</p>
          </div>
          
          <div style={{ maxWidth: '400px', margin: '0 auto' }}>
            <input
              type="text"
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="SSE-EC-20250901-5678"
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
                  <Loader size={isMobile ? 18 : 20} style={{ animation: 'spin 1s linear infinite' }} />
                  <span>Verifying...</span>
                </>
              ) : (
                <>
                  <Search size={isMobile ? 18 : 20} />
                  <span>Verify Experience</span>
                </>
              )}
            </button>
          </div>
          
          <div style={{ 
            marginTop: isMobile ? '16px' : '24px', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            fontSize: isMobile ? '12px' : '14px', 
            color: '#f59e0b' 
          }}>
            <ChevronRight size={isMobile ? 14 : 16} style={{ marginRight: '4px' }} />
            <span>Secure verification powered by blockchain technology</span>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div style={styles.loadingCard}>
            <div style={styles.loadingSpinner}></div>
            <h3 style={{ fontSize: isMobile ? '20px' : '24px', fontWeight: 'bold', color: '#1f2937', marginBottom: '8px' }}>
              Validating Experience Certificate
            </h3>
            <p style={{ color: '#6b7280', fontSize: isMobile ? '14px' : '16px' }}>Verifying professional credentials and project history...</p>
          </div>
        )}

        {/* Verification Results */}
        {!loading && verificationStatus && (
          <div style={styles.resultsCard} className="results-card">
            <div style={{ textAlign: 'center', marginBottom: isMobile ? '32px' : '48px' }}>
              {getStatusBadge()}
            </div>

            {verificationStatus === 'invalid' && (
              <div style={{ textAlign: 'center', padding: isMobile ? '32px 0' : '48px 0' }}>
                <XCircle size={isMobile ? 48 : 60} color="#ef4444" style={{ margin: '0 auto 24px' }} />
                <h3 style={{ fontSize: isMobile ? '24px' : '32px', fontWeight: 'bold', color: '#1f2937', marginBottom: '16px' }}>
                  Certificate Not Found
                </h3>
                <p style={{ fontSize: isMobile ? '14px' : '16px', color: '#6b7280', marginBottom: '32px', maxWidth: '400px', margin: '0 auto 32px' }}>
                  The certificate ID you entered could not be found in our database. Please check the ID and try again.
                </p>
                <div style={{
                  background: '#fef2f2',
                  border: '1px solid #fecaca',
                  borderRadius: '16px',
                  padding: isMobile ? '16px' : '24px',
                  textAlign: 'left',
                  maxWidth: '400px',
                  margin: '0 auto'
                }}>
                  <h4 style={{ fontWeight: '600', color: '#dc2626', marginBottom: '12px', display: 'flex', alignItems: 'center' }}>
                    <Shield size={isMobile ? 14 : 16} style={{ marginRight: '8px' }} />
                    Common Issues:
                  </h4>
                  <ul style={{ color: '#dc2626', fontSize: isMobile ? '12px' : '14px', margin: 0, paddingLeft: '20px' }}>
                    <li>Double-check the Certificate ID format (SSE-EC-YYYYMMDD-XXXX)</li>
                    <li>Ensure there are no extra spaces or special characters</li>
                    <li>Contact HR if you believe this is an error</li>
                  </ul>
                </div>
              </div>
            )}

            {verificationStatus === 'valid' && verificationData && (
              <div>
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(400px, 1fr))', 
                  gap: isMobile ? '24px' : '32px'
                }} className="results-grid">
                  {/* Candidate Information */}
                  <div>
                    <div style={styles.infoCard} className="info-card">
                      <div style={styles.infoCardHeader}>
                        <div style={styles.infoCardIcon}>
                          <User size={isMobile ? 18 : 20} />
                        </div>
                        <div>
                          <h3 style={styles.infoCardTitle}>Professional Information</h3>
                          <p style={styles.infoCardSubtitle}>Candidate Details</p>
                        </div>
                      </div>
                      <div>
                        <div style={styles.infoItem} className="info-item">
                          <div style={styles.infoItemIcon}>
                            <User size={isMobile ? 14 : 16} />
                          </div>
                          <div>
                            <p style={{ fontSize: isMobile ? '11px' : '12px', color: '#6b7280', fontWeight: '500' }}>Full Name</p>
                            <p style={{ fontWeight: '600', color: '#1f2937', fontSize: isMobile ? '14px' : '16px' }}>{verificationData.candidate_name}</p>
                          </div>
                        </div>
                        <div style={styles.infoItem} className="info-item">
                          <div style={styles.infoItemIcon}>
                            <User size={isMobile ? 14 : 16} />
                          </div>
                          <div>
                            <p style={{ fontSize: isMobile ? '11px' : '12px', color: '#6b7280', fontWeight: '500' }}>Father's Name</p>
                            <p style={{ fontWeight: '600', color: '#1f2937', fontSize: isMobile ? '14px' : '16px' }}>{verificationData.father_name}</p>
                          </div>
                        </div>
                        <div style={styles.infoItem} className="info-item">
                          <div style={styles.infoItemIcon}>
                            <Mail size={isMobile ? 14 : 16} />
                          </div>
                          <div>
                            <p style={{ fontSize: isMobile ? '11px' : '12px', color: '#6b7280', fontWeight: '500' }}>Email</p>
                            <p style={{ fontWeight: '600', color: '#1f2937', wordBreak: 'break-all', fontSize: isMobile ? '14px' : '16px' }}>{verificationData.email}</p>
                          </div>
                        </div>
                        {verificationData.contact && (
                          <div style={styles.infoItem} className="info-item">
                            <div style={styles.infoItemIcon}>
                              <Phone size={isMobile ? 14 : 16} />
                            </div>
                            <div>
                              <p style={{ fontSize: isMobile ? '11px' : '12px', color: '#6b7280', fontWeight: '500' }}>Contact</p>
                              <p style={{ fontWeight: '600', color: '#1f2937', fontSize: isMobile ? '14px' : '16px' }}>{verificationData.contact}</p>
                            </div>
                          </div>
                        )}
                        {verificationData.address && (
                          <div style={styles.infoItem} className="info-item">
                            <div style={styles.infoItemIcon}>
                              <MapPin size={isMobile ? 14 : 16} />
                            </div>
                            <div>
                              <p style={{ fontSize: isMobile ? '11px' : '12px', color: '#6b7280', fontWeight: '500' }}>Address</p>
                              <p style={{ fontWeight: '600', color: '#1f2937', wordBreak: 'break-word', fontSize: isMobile ? '14px' : '16px' }}>{verificationData.address}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Certificate Details */}
                    <div style={styles.infoCard} className="info-card">
                      <div style={styles.infoCardHeader}>
                        <div style={styles.infoCardIcon}>
                          <FileText size={isMobile ? 18 : 20} />
                        </div>
                        <div>
                          <h3 style={styles.infoCardTitle}>Certificate Details</h3>
                          <p style={styles.infoCardSubtitle}>Official Information</p>
                        </div>
                      </div>
                      <div>
                        <div style={styles.infoItem} className="info-item">
                          <div style={styles.infoItemIcon}>
                            <Shield size={isMobile ? 14 : 16} />
                          </div>
                          <div>
                            <p style={{ fontSize: isMobile? '11px' : '12px', color: '#6b7280', fontWeight: '500' }}>Certificate ID</p>
                            <p style={{ fontWeight: '600', color: '#1f2937', fontFamily: 'monospace', fontSize: isMobile ? '14px' : '16px', wordBreak: 'break-all' }}>{verificationData.certificate_id}</p>
                          </div>
                        </div>
                        <div style={styles.infoItem} className="info-item">
                          <div style={styles.infoItemIcon}>
                            <Calendar size={isMobile ? 14 : 16} />
                          </div>
                          <div>
                            <p style={{ fontSize: isMobile ? '11px' : '12px', color: '#6b7280', fontWeight: '500' }}>Issue Date</p>
                            <p style={{ fontWeight: '600', color: '#1f2937', fontSize: isMobile ? '14px' : '16px' }}>{formatDate(verificationData.issue_date)}</p>
                          </div>
                        </div>
                        <div style={styles.infoItem} className="info-item">
                          <div style={styles.infoItemIcon}>
                            <Briefcase size={isMobile ? 14 : 16} />
                          </div>
                          <div>
                            <p style={{ fontSize: isMobile ? '11px' : '12px', color: '#6b7280', fontWeight: '500' }}>Total Projects</p>
                            <p style={{ fontWeight: '600', color: '#1f2937', fontSize: isMobile ? '14px' : '16px' }}>{verificationData.projects?.length || 0} Projects</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Projects Information */}
                  <div>
                    <div style={{
                      ...styles.infoCard,
                      background: 'linear-gradient(135deg, #ffedd5, #fed7aa)',
                      border: '1px solid rgba(251, 146, 60, 0.2)',
                      maxHeight: isMobile ? 'none' : '500px',
                      display: 'flex',
                      flexDirection: 'column'
                    }} className="info-card">
                      <div style={styles.infoCardHeader}>
                        <div style={{
                          ...styles.infoCardIcon,
                          background: 'linear-gradient(135deg, #ea580c, #f97316)'
                        }}>
                          <Briefcase size={isMobile ? 18 : 20} />
                        </div>
                        <div>
                          <h3 style={styles.infoCardTitle}>Project Portfolio</h3>
                          <p style={{ fontSize: isMobile ? '12px' : '14px', color: '#ea580c' }}>Professional Experience</p>
                        </div>
                      </div>
                      <div style={{ 
                        flex: 1, 
                        overflowY: 'auto', 
                        paddingRight: '8px',
                        maxHeight: isMobile ? 'none' : '350px'
                      }}>
                        {verificationData.projects?.map((project, index) => (
                          <div key={index} style={styles.projectCard} className="project-card">
                            <div style={{ display: 'flex', alignItems: 'flex-start', marginBottom: '12px' }}>
                              <div style={{
                                padding: '8px',
                                background: 'linear-gradient(135deg, #fed7aa, #ea580c)',
                                borderRadius: '8px',
                                marginRight: '12px',
                                flexShrink: 0
                              }}>
                                <Briefcase size={isMobile ? 14 : 16} color="#ea580c" />
                              </div>
                              <div style={{ flex: 1 }}>
                                <h4 style={{ fontWeight: 'bold', color: '#1f2937', fontSize: isMobile ? '14px' : '16px', marginBottom: '4px', wordBreak: 'break-word' }}>
                                  {project.projectName}
                                </h4>
                                <div style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  padding: '4px 8px',
                                  background: 'linear-gradient(135deg, #ffedd5, #fed7aa)',
                                  color: '#9a3412',
                                  borderRadius: '8px',
                                  fontSize: isMobile ? '11px' : '12px',
                                  fontWeight: '600'
                                }}>
                                  {project.candidateRole}
                                </div>
                              </div>
                            </div>
                            
                            {project.projectDetails && (
                              <div style={{
                                background: 'linear-gradient(135deg, #fff7ed, #fed7aa)',
                                borderRadius: '8px',
                                padding: '12px',
                                marginBottom: '12px',
                                border: '1px solid rgba(251, 146, 60, 0.1)'
                              }}>
                                <p style={{ fontSize: isMobile ? '12px' : '13px', color: '#374151', lineHeight: '1.5', wordBreak: 'break-word' }}>
                                  {project.projectDetails}
                                </p>
                              </div>
                            )}
                            
                            {project.performance && (
                              <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                                <div style={{
                                  padding: '4px',
                                  background: 'linear-gradient(135deg, #fef3c7, #f59e0b)',
                                  borderRadius: '4px',
                                  marginRight: '8px',
                                  flexShrink: 0
                                }}>
                                  <CheckCircle size={isMobile ? 10 : 12} color="#d97706" />
                                </div>
                                <div>
                                  <p style={{ fontSize: isMobile ? '11px' : '12px', color: '#6b7280', fontWeight: '500' }}>Performance Rating</p>
                                  <p style={{ fontSize: isMobile ? '12px' : '13px', color: '#374151', fontWeight: '600', wordBreak: 'break-word' }}>
                                    {project.performance}
                                  </p>
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Electronic Signature Verification */}
                    <div style={{
                      ...styles.infoCard,
                      background: 'linear-gradient(135deg, #fef3c7, #f59e0b)',
                      border: '1px solid rgba(245, 158, 11, 0.2)'
                    }} className="info-card">
                      <div style={styles.infoCardHeader}>
                        <div style={{
                          ...styles.infoCardIcon,
                          background: 'linear-gradient(135deg, #d97706, #f59e0b)'
                        }}>
                          <Shield size={isMobile ? 18 : 20} />
                        </div>
                        <div>
                          <h3 style={styles.infoCardTitle}>Digital Authentication</h3>
                          <p style={{ fontSize: isMobile ? '12px' : '14px', color: '#d97706' }}>Cryptographic Verification</p>
                        </div>
                      </div>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', padding: '12px', background: 'rgba(255, 255, 255, 0.8)', borderRadius: '12px', marginBottom: '16px' }}>
                          <div style={{
                            background: 'white',
                            padding: '12px',
                            borderRadius: '12px',
                            marginRight: '16px',
                            border: '2px solid #f59e0b',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                          }}>
                            <div style={{
                              width: isMobile ? '48px' : '64px',
                              height: isMobile ? '48px' : '64px',
                              background: 'linear-gradient(135deg, #fef3c7, #f59e0b)',
                              borderRadius: '8px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}>
                              <Shield size={isMobile ? 20 : 24} color="#d97706" />
                            </div>
                          </div>
                          <div>
                            <p style={{ fontSize: isMobile ? '11px' : '12px', color: '#6b7280', fontWeight: '500' }}>Authentication Code</p>
                            <p style={{ fontFamily: 'monospace', fontSize: isMobile ? '12px' : '14px', fontWeight: 'bold', color: '#d97706' }}>
                              #{verificationData.certificate_id}
                            </p>
                          </div>
                        </div>
                        <div style={{ 
                          display: 'grid', 
                          gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', 
                          gap: isMobile ? '8px' : '12px' 
                        }} className="signature-grid">
                          <div style={{ padding: '12px', background: 'rgba(255, 255, 255, 0.8)', borderRadius: '12px' }}>
                            <p style={{ fontSize: isMobile ? '11px' : '12px', color: '#6b7280', fontWeight: '500' }}>Authorized By</p>
                            <p style={{ fontWeight: '600', color: '#1f2937', fontSize: isMobile ? '14px' : '16px' }}>{verificationData.signature_signer_name}</p>
                            <p style={{ fontSize: isMobile ? '11px' : '12px', color: '#6b7280' }}>{verificationData.signature_signer_title}</p>
                          </div>
                          <div style={{ padding: '12px', background: 'rgba(255, 255, 255, 0.8)', borderRadius: '12px' }}>
                            <p style={{ fontSize: isMobile ? '11px' : '12px', color: '#6b7280', fontWeight: '500' }}>Total Verifications</p>
                            <p style={{ fontWeight: 'bold', fontSize: isMobile ? '20px' : '24px', color: '#d97706' }}>#{verificationData.verification_count || 1}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Company Info */}
                <div style={{
                  marginTop: isMobile ? '24px' : '32px',
                  background: 'linear-gradient(135deg, #ea580c, #f97316, #fb923c)',
                  color: 'white',
                  borderRadius: isMobile ? '16px' : '24px',
                  padding: isMobile ? '24px' : '32px',
                  boxShadow: '0 20px 25px -5px rgba(234, 88, 12, 0.4)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '24px' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
                        <Building size={isMobile ? 20 : 24} style={{ marginRight: '12px' }} />
                        <div>
                          <h3 style={{ fontSize: isMobile ? '20px' : '24px', fontWeight: 'bold' }}>{companyInfo?.company_name || 'Syed Solar Energy'}</h3>
                          <p style={{ color: 'rgba(254, 215, 170, 0.9)', fontSize: isMobile ? '12px' : '14px' }}>Professional Certification Authority</p>
                        </div>
                      </div>
                      <div style={{ 
                        display: 'grid', 
                        gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(200px, 1fr))', 
                        gap: isMobile ? '12px' : '16px', 
                        opacity: 0.9 
                      }} className="company-info-grid">
                        <div style={{ display: 'flex', alignItems: 'center', fontSize: isMobile ? '12px' : '14px', background: 'rgba(255, 255, 255, 0.1)', borderRadius: '8px', padding: '12px', backdropFilter: 'blur(10px)' }}>
                          <MapPin size={isMobile ? 14 : 16} style={{ marginRight: '8px', flexShrink: 0 }} />
                          <span style={{ wordBreak: 'break-word' }}>{companyInfo?.company_address || 'Office B5, Mustafa Plaza, near Imtiaz Mart Ring Road Peshawar'}</span>
                        </div>
                       
                        <div style={{ display: 'flex', alignItems: 'center', fontSize: isMobile ? '12px' : '14px', background: 'rgba(255, 255, 255, 0.1)', borderRadius: '8px', padding: '12px', backdropFilter: 'blur(10px)' }}>
                          <Globe size={isMobile ? 14 : 16} style={{ marginRight: '8px', flexShrink: 0 }} />
                          <span style={{ wordBreak: 'break-all' }}>{companyInfo?.company_website || 'www.syedsolarenergy.com'}</span>
                        </div>
                      </div>
                    </div>
                    <div style={{ textAlign: 'center', background: 'rgba(255, 255, 255, 0.2)', padding: isMobile ? '16px' : '24px', borderRadius: '16px', backdropFilter: 'blur(10px)', border: '1px solid rgba(255, 255, 255, 0.3)' }}>
                      <p style={{ fontSize: isMobile ? '12px' : '14px', opacity: 0.9, marginBottom: '8px' }}>Verified on</p>
                      <p style={{ fontWeight: 'bold', fontSize: isMobile ? '16px' : '18px' }}>{new Date().toLocaleDateString()}</p>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '8px', color: 'rgba(254, 215, 170, 0.9)' }}>
                        <span style={{ fontSize: isMobile ? '12px' : '14px' }}>Verification #{verificationData.verification_count || 1}</span>
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
          <div style={styles.resultsCard} className="results-card">
            <div style={{ textAlign: 'center', padding: isMobile ? '32px 0' : '48px 0' }}>
              <div style={{ position: 'relative', display: 'inline-block', marginBottom: isMobile ? '24px' : '32px' }}>
                <Search size={isMobile ? 48 : 60} color="#f97316" />
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
              <h3 style={{ fontSize: isMobile ? '24px' : '32px', fontWeight: 'bold', color: '#1f2937', marginBottom: '16px' }}>
                Enter Certificate ID to Verify
              </h3>
              <p style={{ fontSize: isMobile ? '14px' : '16px', color: '#6b7280', marginBottom: '32px', maxWidth: '400px', margin: '0 auto 32px' }}>
                Please enter a valid experience certificate ID to verify its authenticity and view professional details.
              </p>
              <div style={{
                background: 'linear-gradient(135deg, #fff7ed, #fed7aa)',
                border: '1px solid #fed7aa',
                borderRadius: '16px',
                padding: isMobile ? '16px' : '24px',
                textAlign: 'left',
                maxWidth: '400px',
                margin: '0 auto'
              }}>
                <h4 style={{ fontWeight: '600', color: '#ea580c', marginBottom: '12px', display: 'flex', alignItems: 'center' }}>
                  <Shield size={isMobile ? 14 : 16} style={{ marginRight: '8px' }} />
                  Certificate ID Format:
                </h4>
                <p style={{ color: '#ea580c', fontSize: isMobile ? '14px' : '16px', fontFamily: 'monospace' }}>SSE-EC-YYYYMMDD-XXXX</p>
                <p style={{ color: '#ea580c', fontSize: isMobile ? '12px' : '14px', marginTop: '8px' }}>Example: SSE-EC-20250901-5678</p>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div style={{ marginTop: isMobile ? '48px' : '64px', textAlign: 'center' }}>
          <div style={{
            display: 'inline-block',
            background: 'rgba(255, 255, 255, 0.8)',
            backdropFilter: 'blur(10px)',
            borderRadius: '16px',
            padding: isMobile ? '16px' : '24px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.5)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
              <Shield size={isMobile ? 16 : 20} color="#ea580c" style={{ marginRight: '8px' }} />
              <span style={{ fontWeight: '600', color: '#1f2937', fontSize: isMobile ? '14px' : '16px' }}>Secured by SSE Technology</span>
            </div>
            <p style={{ color: '#6b7280', fontSize: isMobile ? '12px' : '14px', maxWidth: '500px' }}>
              © {new Date().getFullYear()} Syed Solar Energy. This verification system ensures the authenticity 
              of experience certificates using advanced security protocols and blockchain technology.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExperienceVerification;