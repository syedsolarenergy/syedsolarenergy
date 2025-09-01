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
import { supabase } from '../supabaseClient';

const InternshipVerification = () => {
  const { certificateId } = useParams();
  const [verificationData, setVerificationData] = useState(null);
  const [companyInfo, setCompanyInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchId, setSearchId] = useState(certificateId || '');
  const [verificationStatus, setVerificationStatus] = useState(null);
  const [verificationAttempts, setVerificationAttempts] = useState(0);

  // Enhanced CSS styles
  const styles = {
    pageContainer: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #fff7ed 0%, #fed7aa 50%, #fb923c 100%)',
      position: 'relative',
      overflow: 'hidden'
    },
    backgroundOrb1: {
      position: 'absolute',
      top: '-200px',
      right: '-200px',
      width: '400px',
      height: '400px',
      background: 'radial-gradient(circle, rgba(251, 146, 60, 0.15) 0%, transparent 70%)',
      borderRadius: '50%',
      animation: 'float 6s ease-in-out infinite',
      pointerEvents: 'none'
    },
    backgroundOrb2: {
      position: 'absolute',
      bottom: '-200px',
      left: '-200px',
      width: '500px',
      height: '500px',
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
      backdropFilter: 'blur(10px)'
    },
    headerContent: {
      maxWidth: '1280px',
      margin: '0 auto',
      padding: '24px 16px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      gap: '16px'
    },
    logo: {
      width: '64px',
      height: '64px',
      background: 'rgba(255, 255, 255, 0.2)',
      backdropFilter: 'blur(10px)',
      borderRadius: '16px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white',
      fontWeight: 'bold',
      fontSize: '20px',
      marginRight: '16px',
      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      transition: 'transform 0.3s ease',
      position: 'relative'
    },
    logoText: {
      transform: 'rotate(3deg)',
      position: 'relative',
      zIndex: 10
    },
    headerTitle: {
      fontSize: '36px',
      fontWeight: '900',
      color: 'white',
      lineHeight: '1.2',
      background: 'linear-gradient(to right, #ffffff, #fed7aa)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text'
    },
    headerSubtitle: {
      fontSize: '14px',
      color: 'rgba(254, 215, 170, 0.9)',
      marginTop: '4px',
      fontWeight: '500'
    },
    backButton: {
      display: 'flex',
      alignItems: 'center',
      padding: '12px 20px',
      background: 'rgba(255, 255, 255, 0.2)',
      color: 'white',
      borderRadius: '16px',
      border: '1px solid rgba(255, 255, 255, 0.3)',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      backdropFilter: 'blur(10px)',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
      fontSize: '14px',
      fontWeight: '600',
      textDecoration: 'none'
    },
    searchSection: {
      maxWidth: '1024px',
      margin: '0 auto',
      padding: '32px 16px',
      position: 'relative'
    },
    searchCard: {
      background: 'rgba(255, 255, 255, 0.9)',
      backdropFilter: 'blur(20px)',
      borderRadius: '24px',
      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
      padding: '48px',
      border: '1px solid rgba(255, 255, 255, 0.5)',
      marginBottom: '32px',
      position: 'relative',
      overflow: 'hidden'
    },
    searchTitle: {
      textAlign: 'center',
      marginBottom: '32px'
    },
    searchIcon: {
      width: '64px',
      height: '64px',
      background: 'linear-gradient(135deg, #ea580c, #f97316)',
      borderRadius: '16px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      margin: '0 auto 16px',
      boxShadow: '0 20px 25px -5px rgba(234, 88, 12, 0.4)'
    },
    searchTitleText: {
      fontSize: '32px',
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
      padding: '16px 24px',
      fontSize: '18px',
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
      padding: '16px 24px',
      background: 'linear-gradient(135deg, #ea580c, #f97316)',
      color: 'white',
      border: 'none',
      borderRadius: '16px',
      fontSize: '16px',
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
      padding: '16px 32px',
      background: 'linear-gradient(135deg, #10b981, #059669)',
      color: 'white',
      borderRadius: '16px',
      fontWeight: 'bold',
      fontSize: '18px',
      boxShadow: '0 20px 25px -5px rgba(16, 185, 129, 0.4)',
      animation: 'pulse 2s infinite',
      gap: '12px'
    },
    statusBadgeInvalid: {
      display: 'inline-flex',
      alignItems: 'center',
      padding: '16px 32px',
      background: 'linear-gradient(135deg, #ef4444, #dc2626)',
      color: 'white',
      borderRadius: '16px',
      fontWeight: 'bold',
      fontSize: '18px',
      boxShadow: '0 20px 25px -5px rgba(239, 68, 68, 0.4)',
      gap: '12px'
    },
    resultsCard: {
      background: 'rgba(255, 255, 255, 0.95)',
      backdropFilter: 'blur(20px)',
      borderRadius: '24px',
      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
      padding: '48px',
      border: '1px solid rgba(255, 255, 255, 0.5)',
      marginBottom: '32px'
    },
    infoCard: {
      background: 'linear-gradient(135deg, #fff7ed, #fed7aa)',
      borderRadius: '16px',
      padding: '24px',
      border: '1px solid rgba(251, 146, 60, 0.2)',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      marginBottom: '24px'
    },
    infoCardHeader: {
      display: 'flex',
      alignItems: 'center',
      marginBottom: '20px',
      gap: '12px'
    },
    infoCardIcon: {
      padding: '12px',
      background: 'linear-gradient(135deg, #ea580c, #f97316)',
      borderRadius: '12px',
      color: 'white',
      boxShadow: '0 4px 6px -1px rgba(234, 88, 12, 0.4)'
    },
    infoCardTitle: {
      fontSize: '20px',
      fontWeight: 'bold',
      color: '#1f2937'
    },
    infoCardSubtitle: {
      fontSize: '14px',
      color: '#ea580c'
    },
    infoItem: {
      display: 'flex',
      alignItems: 'flex-start',
      padding: '12px',
      background: 'rgba(255, 255, 255, 0.8)',
      borderRadius: '12px',
      marginBottom: '12px',
      transition: 'all 0.2s ease',
      gap: '12px'
    },
    infoItemIcon: {
      padding: '8px',
      background: 'linear-gradient(135deg, #fed7aa, #fb923c)',
      borderRadius: '8px',
      color: '#ea580c',
      flexShrink: 0
    },
    loadingCard: {
      background: 'rgba(255, 255, 255, 0.9)',
      backdropFilter: 'blur(20px)',
      borderRadius: '24px',
      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)',
      padding: '64px',
      textAlign: 'center',
      border: '1px solid rgba(255, 255, 255, 0.5)',
      marginBottom: '32px'
    },
    loadingSpinner: {
      width: '80px',
      height: '80px',
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
      .logo:hover {
        transform: scale(1.1);
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
        .from('internship_certificates')
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
        .from('internship_certificates')
        .update({ 
          verified_at: new Date().toISOString(),
          verification_count: (certificateData.verification_count || 0) + 1 
        })
        .eq('certificate_id', id);
      
      const { error: verificationError } = await supabase
        .from('internship_verifications')
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
      window.location.href = `/verify-internship/${searchId.trim()}`;
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
            <CheckCircle size={24} />
            <div>
              <div style={{ fontSize: '18px', fontWeight: 'bold' }}>Verified & Valid</div>
              <div style={{ fontSize: '12px', opacity: 0.9 }}>Certificate Authenticated</div>
            </div>
          </div>
        );
      case 'invalid':
        return (
          <div style={styles.statusBadgeInvalid}>
            <XCircle size={24} />
            <div>
              <div style={{ fontSize: '18px', fontWeight: 'bold' }}>Invalid Certificate</div>
              <div style={{ fontSize: '12px', opacity: 0.9 }}>ID Not Found</div>
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
          <div style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
            <div style={styles.logo} className="logo">
              <div style={styles.logoText}>SSE</div>
            </div>
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
            <ArrowLeft size={18} style={{ marginRight: '8px' }} />
            Back to Home
          </button>
        </div>
      </div>

      <div style={styles.searchSection}>
        {/* Search Section */}
        <div style={styles.searchCard}>
          <div style={styles.searchTitle}>
            <div style={styles.searchIcon}>
              <Search size={24} color="white" />
            </div>
            <h2 style={styles.searchTitleText}>Verify Certificate</h2>
            <p style={{ color: '#6b7280' }}>Enter your certificate ID to verify authenticity</p>
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
                  <Loader size={20} style={{ animation: 'spin 1s linear infinite' }} />
                  <span>Verifying...</span>
                </>
              ) : (
                <>
                  <Search size={20} />
                  <span>Verify Certificate</span>
                </>
              )}
            </button>
          </div>
          
          <div style={{ marginTop: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', color: '#f59e0b' }}>
            <ChevronRight size={16} style={{ marginRight: '4px' }} />
            <span>Secure verification powered by blockchain technology</span>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div style={styles.loadingCard}>
            <div style={styles.loadingSpinner}></div>
            <h3 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1f2937', marginBottom: '8px' }}>
              Verifying Certificate
            </h3>
            <p style={{ color: '#6b7280' }}>Please wait while we authenticate your certificate...</p>
          </div>
        )}

        {/* Verification Results */}
        {!loading && verificationStatus && (
          <div style={styles.resultsCard}>
            <div style={{ textAlign: 'center', marginBottom: '48px' }}>
              {getStatusBadge()}
            </div>

            {verificationStatus === 'invalid' && (
              <div style={{ textAlign: 'center', padding: '48px 0' }}>
                <XCircle size={60} color="#ef4444" style={{ margin: '0 auto 24px' }} />
                <h3 style={{ fontSize: '32px', fontWeight: 'bold', color: '#1f2937', marginBottom: '16px' }}>
                  Certificate Not Found
                </h3>
                <p style={{ fontSize: '16px', color: '#6b7280', marginBottom: '32px', maxWidth: '400px', margin: '0 auto 32px' }}>
                  The certificate ID you entered could not be found in our database. Please check the ID and try again.
                </p>
              </div>
            )}

            {verificationStatus === 'valid' && verificationData && (
              <div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '32px' }}>
                  {/* Candidate Information */}
                  <div>
                    <div style={styles.infoCard}>
                      <div style={styles.infoCardHeader}>
                        <div style={styles.infoCardIcon}>
                          <User size={20} />
                        </div>
                        <div>
                          <h3 style={styles.infoCardTitle}>Candidate Information</h3>
                          <p style={styles.infoCardSubtitle}>Personal Details</p>
                        </div>
                      </div>
                      <div>
                        <div style={styles.infoItem} className="info-item">
                          <div style={styles.infoItemIcon}>
                            <User size={16} />
                          </div>
                          <div>
                            <p style={{ fontSize: '12px', color: '#6b7280', fontWeight: '500' }}>Full Name</p>
                            <p style={{ fontWeight: '600', color: '#1f2937' }}>{verificationData.candidate_name}</p>
                          </div>
                        </div>
                        <div style={styles.infoItem} className="info-item">
                          <div style={styles.infoItemIcon}>
                            <User size={16} />
                          </div>
                          <div>
                            <p style={{ fontSize: '12px', color: '#6b7280', fontWeight: '500' }}>Father's Name</p>
                            <p style={{ fontWeight: '600', color: '#1f2937' }}>{verificationData.father_name}</p>
                          </div>
                        </div>
                        <div style={styles.infoItem} className="info-item">
                          <div style={styles.infoItemIcon}>
                            <Calendar size={16} />
                          </div>
                          <div>
                            <p style={{ fontSize: '12px', color: '#6b7280', fontWeight: '500' }}>Date of Birth</p>
                            <p style={{ fontWeight: '600', color: '#1f2937' }}>{formatDate(verificationData.dob)}</p>
                          </div>
                        </div>
                        <div style={styles.infoItem} className="info-item">
                          <div style={styles.infoItemIcon}>
                            <Mail size={16} />
                          </div>
                          <div>
                            <p style={{ fontSize: '12px', color: '#6b7280', fontWeight: '500' }}>Email</p>
                            <p style={{ fontWeight: '600', color: '#1f2937', wordBreak: 'break-all' }}>{verificationData.email}</p>
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
                          <FileText size={20} />
                        </div>
                        <div>
                          <h3 style={styles.infoCardTitle}>Certificate Details</h3>
                          <p style={styles.infoCardSubtitle}>Official Information</p>
                        </div>
                      </div>
                      <div>
                        <div style={styles.infoItem} className="info-item">
                          <div style={styles.infoItemIcon}>
                            <Shield size={16} />
                          </div>
                          <div>
                            <p style={{ fontSize: '12px', color: '#6b7280', fontWeight: '500' }}>Certificate ID</p>
                            <p style={{ fontWeight: '600', color: '#1f2937', fontFamily: 'monospace', fontSize: '14px' }}>{verificationData.certificate_id}</p>
                          </div>
                        </div>
                        <div style={styles.infoItem} className="info-item">
                          <div style={styles.infoItemIcon}>
                            <Calendar size={16} />
                          </div>
                          <div>
                            <p style={{ fontSize: '12px', color: '#6b7280', fontWeight: '500' }}>Issue Date</p>
                            <p style={{ fontWeight: '600', color: '#1f2937' }}>{formatDate(verificationData.issue_date)}</p>
                          </div>
                        </div>
                        <div style={styles.infoItem} className="info-item">
                          <div style={styles.infoItemIcon}>
                            <Calendar size={16} />
                          </div>
                          <div>
                            <p style={{ fontSize: '12px', color: '#6b7280', fontWeight: '500' }}>Duration</p>
                            <p style={{ fontWeight: '600', color: '#1f2937' }}>
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
                <div style={{
                  marginTop: '32px',
                  background: 'linear-gradient(135deg, #ea580c, #f97316)',
                  color: 'white',
                  borderRadius: '24px',
                  padding: '32px',
                  boxShadow: '0 20px 25px -5px rgba(234, 88, 12, 0.4)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '24px' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
                        <Building size={24} style={{ marginRight: '12px' }} />
                        <div>
                          <h3 style={{ fontSize: '24px', fontWeight: 'bold' }}>{companyInfo?.company_name || 'Syed Solar Energy'}</h3>
                          <p style={{ color: 'rgba(254, 215, 170, 0.9)' }}>Certificate Issuing Authority</p>
                        </div>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', opacity: 0.9 }}>
                        <div style={{ display: 'flex', alignItems: 'center', fontSize: '14px', background: 'rgba(255, 255, 255, 0.1)', borderRadius: '8px', padding: '12px', backdropFilter: 'blur(10px)' }}>
                          <MapPin size={16} style={{ marginRight: '8px', flexShrink: 0 }} />
                          <span style={{ wordBreak: 'break-word' }}>{companyInfo?.company_address || 'Jalil Market Umar Gull Chowck, Bara Road, Peshawar'}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', fontSize: '14px', background: 'rgba(255, 255, 255, 0.1)', borderRadius: '8px', padding: '12px', backdropFilter: 'blur(10px)' }}>
                          <Mail size={16} style={{ marginRight: '8px', flexShrink: 0 }} />
                          <span style={{ wordBreak: 'break-all' }}>{companyInfo?.company_email || 'sales@syedsolarenergy.com'}</span>
                        </div>
                      </div>
                    </div>
                    <div style={{ textAlign: 'center', background: 'rgba(255, 255, 255, 0.2)', padding: '24px', borderRadius: '16px', backdropFilter: 'blur(10px)', border: '1px solid rgba(255, 255, 255, 0.3)' }}>
                      <p style={{ fontSize: '14px', opacity: 0.9, marginBottom: '8px' }}>Verified on</p>
                      <p style={{ fontWeight: 'bold', fontSize: '18px' }}>{new Date().toLocaleDateString()}</p>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '8px', color: 'rgba(254, 215, 170, 0.9)' }}>
                        <span style={{ fontSize: '14px' }}>Verification #{verificationData.verification_count || 1}</span>
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
            <div style={{ textAlign: 'center', padding: '48px 0' }}>
              <div style={{ position: 'relative', display: 'inline-block', marginBottom: '32px' }}>
                <Search size={60} color="#f97316" />
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
              <h3 style={{ fontSize: '32px', fontWeight: 'bold', color: '#1f2937', marginBottom: '16px' }}>
                Enter Certificate ID to Verify
              </h3>
              <p style={{ fontSize: '16px', color: '#6b7280', marginBottom: '32px', maxWidth: '400px', margin: '0 auto 32px' }}>
                Please enter a valid internship certificate ID to verify its authenticity and view details.
              </p>
              <div style={{
                background: 'linear-gradient(135deg, #fff7ed, #fed7aa)',
                border: '1px solid #fed7aa',
                borderRadius: '16px',
                padding: '24px',
                textAlign: 'left',
                maxWidth: '400px',
                margin: '0 auto'
              }}>
                <h4 style={{ fontWeight: '600', color: '#ea580c', marginBottom: '12px', display: 'flex', alignItems: 'center' }}>
                  <Shield size={16} style={{ marginRight: '8px' }} />
                  Certificate ID Format:
                </h4>
                <p style={{ color: '#ea580c', fontSize: '16px', fontFamily: 'monospace' }}>SSE-IC-YYYYMMDD-XXXX</p>
                <p style={{ color: '#ea580c', fontSize: '14px', marginTop: '8px' }}>Example: SSE-IC-20250901-1234</p>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div style={{ marginTop: '64px', textAlign: 'center' }}>
          <div style={{
            display: 'inline-block',
            background: 'rgba(255, 255, 255, 0.8)',
            backdropFilter: 'blur(10px)',
            borderRadius: '16px',
            padding: '24px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.5)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
              <Shield size={20} color="#ea580c" style={{ marginRight: '8px' }} />
              <span style={{ fontWeight: '600', color: '#1f2937' }}>Secured by SSE Technology</span>
            </div>
            <p style={{ color: '#6b7280', fontSize: '14px', maxWidth: '500px' }}>
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