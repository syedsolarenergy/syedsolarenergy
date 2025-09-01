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
          <div className="inline-flex items-center px-4 py-2 md:px-6 md:py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-bold shadow-lg shadow-green-500/30">
            <CheckCircle className="mr-2" size={20} />
            Verified & Valid
          </div>
        );
      case 'invalid':
        return (
          <div className="inline-flex items-center px-4 py-2 md:px-6 md:py-3 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-xl font-bold shadow-lg shadow-red-500/30">
            <XCircle className="mr-2" size={20} />
            Invalid Certificate ID
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-amber-600 shadow-2xl shadow-orange-500/20 border-b border-orange-400">
        <div className="max-w-7xl mx-auto px-4 py-4 md:py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center">
              <div className="w-12 h-12 md:w-14 md:h-14 bg-gradient-to-br from-orange-600 to-amber-600 rounded-xl flex items-center justify-center text-white font-bold text-lg mr-3 md:mr-4 shadow-lg shadow-orange-500/50">
                <div className="transform rotate-3">SSE</div>
              </div>
              <div>
                <h1 className="text-xl md:text-3xl font-bold text-white">Internship Certificate Verification</h1>
                <p className="text-amber-100 text-sm md:text-base">Syed Solar Energy - Certificate Verification System</p>
              </div>
            </div>
            <button
              onClick={() => window.location.href = '/'}
              className="flex items-center px-4 py-2 md:px-5 md:py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all duration-300 backdrop-blur-sm border border-white/20 shadow-lg text-sm md:text-base"
            >
              <ArrowLeft className="mr-2" size={16} />
              Back to Home
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 md:py-8">
        {/* Search Section */}
        <div className="bg-white rounded-2xl shadow-xl md:shadow-2xl p-4 md:p-8 mb-6 md:mb-8 border border-orange-200">
          <h2 className="text-lg md:text-2xl font-bold text-gray-800 mb-4 md:mb-6 flex items-center">
            <div className="p-2 bg-gradient-to-r from-orange-500 to-amber-500 rounded-lg mr-3 shadow-md">
              <Search className="text-white" size={20} />
            </div>
            Verify Internship Certificate
          </h2>
          
          <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
            <input
              type="text"
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Enter Certificate ID (e.g., SSE-IC-20250901-123)"
              className="flex-1 px-4 py-3 md:px-5 md:py-4 border border-orange-200 rounded-xl focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 transition-all duration-300 shadow-sm text-sm md:text-base"
            />
            <button
              onClick={handleSearch}
              disabled={loading || !searchId.trim()}
              className="bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-3 md:px-6 md:py-4 rounded-xl font-bold transition-all duration-300 flex items-center justify-center shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 text-sm md:text-base"
            >
              {loading ? <Loader className="animate-spin mr-2" size={18} /> : <Search className="mr-2" size={18} />}
              {loading ? 'Verifying...' : 'Verify'}
            </button>
          </div>
          
          <div className="mt-4 md:mt-6 flex items-center text-xs md:text-sm text-amber-600">
            <ChevronRight size={14} className="mr-1" />
            <span>Example: SSE-IC-20250901-1234</span>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 text-center border border-orange-100">
            <div className="animate-spin w-12 h-12 md:w-14 md:h-14 border-4 border-orange-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-600 md:text-lg">Verifying certificate...</p>
          </div>
        )}

        {/* Verification Results */}
        {!loading && verificationStatus && (
          <div className="bg-white rounded-2xl shadow-xl md:shadow-2xl p-4 md:p-8 border border-orange-200">
            <div className="text-center mb-6 md:mb-8">
              {getStatusBadge()}
            </div>

            {verificationStatus === 'invalid' && (
              <div className="text-center py-8 md:py-12">
                <div className="relative inline-block mb-4 md:mb-6">
                  <XCircle className="mx-auto text-red-500 mb-4 relative z-10" size={60} />
                  <div className="absolute -inset-4 bg-red-100 rounded-full blur-lg opacity-50 z-0"></div>
                </div>
                <h3 className="text-xl md:text-3xl font-bold text-gray-800 mb-3 md:mb-4">Certificate Not Found</h3>
                <p className="text-gray-600 mb-4 md:mb-6 max-w-md mx-auto text-sm md:text-base">
                  The certificate ID you entered could not be found in our database. 
                  Please check the ID and try again.
                </p>
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-left max-w-md mx-auto">
                  <h4 className="font-semibold text-red-800 mb-2 md:mb-3 flex items-center text-sm md:text-base">
                    <Shield className="mr-2" size={16} />
                    Common Issues:
                  </h4>
                  <ul className="text-red-700 text-xs md:text-sm space-y-1 md:space-y-2">
                    <li className="flex items-start">
                      <span className="bg-red-100 text-red-700 rounded-full p-1 mr-2">•</span>
                      <span>Double-check the Certificate ID format (SSE-IC-YYYYMMDD-XXXX)</span>
                    </li>
                    <li className="flex items-start">
                      <span className="bg-red-100 text-red-700 rounded-full p-1 mr-2">•</span>
                      <span>Ensure there are no extra spaces or special characters</span>
                    </li>
                    <li className="flex items-start">
                      <span className="bg-red-100 text-red-700 rounded-full p-1 mr-2">•</span>
                      <span>Contact HR if you believe this is an error</span>
                    </li>
                  </ul>
                </div>
              </div>
            )}

            {verificationStatus === 'valid' && verificationData && (
              <div>
                <div className="grid md:grid-cols-2 gap-4 md:gap-6">
                  {/* Candidate Information */}
                  <div className="space-y-4 md:space-y-6">
                    <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl p-4 md:p-6 border border-orange-100 shadow-sm">
                      <h3 className="text-lg md:text-xl font-bold text-gray-800 mb-3 md:mb-4 flex items-center">
                        <div className="p-2 bg-orange-500 rounded-lg mr-3">
                          <User className="text-white" size={16} />
                        </div>
                        Candidate Information
                      </h3>
                      <div className="space-y-3 md:space-y-4">
                        <div className="flex items-center">
                          <User className="mr-3 text-amber-600" size={16} />
                          <div>
                            <p className="text-xs md:text-sm text-gray-500">Full Name</p>
                            <p className="font-semibold text-gray-800 text-sm md:text-base">{verificationData.candidate_name}</p>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <User className="mr-3 text-amber-600" size={16} />
                          <div>
                            <p className="text-xs md:text-sm text-gray-500">Father's Name</p>
                            <p className="font-semibold text-gray-800 text-sm md:text-base">{verificationData.father_name}</p>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <Calendar className="mr-3 text-amber-600" size={16} />
                          <div>
                            <p className="text-xs md:text-sm text-gray-500">Date of Birth</p>
                            <p className="font-semibold text-gray-800 text-sm md:text-base">{formatDate(verificationData.dob)}</p>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <Mail className="mr-3 text-amber-600" size={16} />
                          <div>
                            <p className="text-xs md:text-sm text-gray-500">Email</p>
                            <p className="font-semibold text-gray-800 text-sm md:text-base">{verificationData.email}</p>
                          </div>
                        </div>
                        {verificationData.contact && (
                          <div className="flex items-center">
                            <Phone className="mr-3 text-amber-600" size={16} />
                            <div>
                              <p className="text-xs md:text-sm text-gray-500">Contact</p>
                              <p className="font-semibold text-gray-800 text-sm md:text-base">{verificationData.contact}</p>
                            </div>
                          </div>
                        )}
                        {verificationData.address && (
                          <div className="flex items-start">
                            <MapPin className="mr-3 text-amber-600 mt-1" size={16} />
                            <div>
                              <p className="text-xs md:text-sm text-gray-500">Address</p>
                              <p className="font-semibold text-gray-800 text-sm md:text-base">{verificationData.address}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {verificationData.university_name && (
                      <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-4 md:p-6 border border-amber-100 shadow-sm">
                        <h3 className="text-lg md:text-xl font-bold text-gray-800 mb-3 md:mb-4 flex items-center">
                          <div className="p-2 bg-amber-500 rounded-lg mr-3">
                            <BookOpen className="text-white" size={16} />
                          </div>
                          University Information
                        </h3>
                        <div className="flex items-center">
                          <BookOpen className="mr-3 text-amber-600" size={16} />
                          <div>
                            <p className="text-xs md:text-sm text-gray-500">University Name</p>
                            <p className="font-semibold text-gray-800 text-sm md:text-base">{verificationData.university_name}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Certificate Details */}
                  <div className="space-y-4 md:space-y-6">
                    <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl p-4 md:p-6 border border-orange-100 shadow-sm">
                      <h3 className="text-lg md:text-xl font-bold text-gray-800 mb-3 md:mb-4 flex items-center">
                        <div className="p-2 bg-orange-500 rounded-lg mr-3">
                          <FileText className="text-white" size={16} />
                        </div>
                        Certificate Details
                      </h3>
                      <div className="space-y-3 md:space-y-4">
                        <div className="flex items-center">
                          <Shield className="mr-3 text-amber-600" size={16} />
                          <div>
                            <p className="text-xs md:text-sm text-gray-500">Certificate ID</p>
                            <p className="font-semibold text-gray-800 text-sm md:text-base font-mono">{verificationData.certificate_id}</p>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <Calendar className="mr-3 text-amber-600" size={16} />
                          <div>
                            <p className="text-xs md:text-sm text-gray-500">Issue Date</p>
                            <p className="font-semibold text-gray-800 text-sm md:text-base">{formatDate(verificationData.issue_date)}</p>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <Calendar className="mr-3 text-amber-600" size={16} />
                          <div>
                            <p className="text-xs md:text-sm text-gray-500">Joining Date</p>
                            <p className="font-semibold text-gray-800 text-sm md:text-base">{formatDate(verificationData.joining_date)}</p>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <Calendar className="mr-3 text-amber-600" size={16} />
                          <div>
                            <p className="text-xs md:text-sm text-gray-500">Leaving Date</p>
                            <p className="font-semibold text-gray-800 text-sm md:text-base">{formatDate(verificationData.leaving_date)}</p>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <Clock className="mr-3 text-amber-600" size={16} />
                          <div>
                            <p className="text-xs md:text-sm text-gray-500">Duration</p>
                            <p className="font-semibold text-gray-800 text-sm md:text-base">
                              {Math.ceil(Math.abs(
                                new Date(verificationData.leaving_date) - 
                                new Date(verificationData.joining_date)
                              ) / (1000 * 60 * 60 * 24 * 7))} weeks
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Electronic Signature Verification */}
                    <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-4 md:p-6 border border-amber-100 shadow-sm">
                      <h3 className="text-lg md:text-xl font-bold text-gray-800 mb-3 md:mb-4 flex items-center">
                        <div className="p-2 bg-amber-500 rounded-lg mr-3">
                          <Shield className="text-white" size={16} />
                        </div>
                        Electronic Verification
                      </h3>
                      <div className="space-y-3 md:space-y-4">
                        <div className="flex items-center">
                          <div className="bg-white p-2 rounded-lg mr-3 border border-amber-200">
                            <img 
                              src={verificationData.signature_qr_url} 
                              alt="Verification QR Code" 
                              className="w-12 h-12 md:w-16 md:h-16"
                            />
                          </div>
                          <div>
                            <p className="text-xs md:text-sm text-gray-500">Scan to Verify</p>
                            <p className="font-semibold text-gray-800 text-xs">{verificationData.certificate_id}</p>
                          </div>
                        </div>
                        <div>
                          <p className="text-xs md:text-sm text-gray-500">Signed By</p>
                          <p className="font-semibold text-gray-800 text-sm md:text-base">{verificationData.signature_signer_name}</p>
                          <p className="text-xs md:text-sm text-gray-600">{verificationData.signature_signer_title}</p>
                        </div>
                        <div>
                          <p className="text-xs md:text-sm text-gray-500">Signed At</p>
                          <p className="font-semibold text-gray-800 text-sm md:text-base">
                            {new Date(verificationData.signature_signed_at).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Company Info */}
                <div className="mt-6 md:mt-8 bg-gradient-to-r from-orange-600 to-amber-600 text-white rounded-2xl p-4 md:p-6 shadow-lg">
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 md:gap-6">
                    <div className="flex-1">
                      <h3 className="text-lg md:text-xl font-bold mb-2 md:mb-3 flex items-center">
                        <Building className="mr-2" size={18} />
                        {companyInfo?.company_name || 'Syed Solar Energy'}
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-3 opacity-90 text-xs md:text-sm">
                        <div className="flex items-center">
                          <MapPin size={14} className="mr-2 flex-shrink-0" />
                          <span>{companyInfo?.company_address || 'Jalil Market Umar Gull Chowck, Bara Road, Peshawar'}</span>
                        </div>
                        <div className="flex items-center">
                          <Mail size={14} className="mr-2 flex-shrink-0" />
                          <span>{companyInfo?.company_email || 'sales@syedsolarenergy.com'}</span>
                        </div>
                        <div className="flex items-center">
                          <Phone size={14} className="mr-2 flex-shrink-0" />
                          <span>{companyInfo?.company_phone || '03075596695'}</span>
                        </div>
                        <div className="flex items-center">
                          <Globe size={14} className="mr-2 flex-shrink-0" />
                          <span>{companyInfo?.company_website || 'www.syedsolarenergy.com'}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right bg-white/10 p-3 md:p-4 rounded-xl backdrop-blur-sm w-full md:w-auto">
                      <p className="text-xs md:text-sm opacity-90">Verified on</p>
                      <p className="font-semibold text-sm md:text-base">{new Date().toLocaleString()}</p>
                      <p className="text-xs opacity-90 mt-1">
                        Verification #{verificationData.verification_count || 1}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* No Search Results */}
        {!loading && !verificationStatus && !certificateId && (
          <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 text-center border border-orange-100">
            <div className="relative inline-block mb-4 md:mb-6">
              <Search className="mx-auto text-orange-400 mb-4 relative z-10" size={50} />
              <div className="absolute -inset-4 bg-orange-100 rounded-full blur-lg opacity-50 z-0"></div>
            </div>
            <h3 className="text-xl md:text-3xl font-bold text-gray-800 mb-3 md:mb-4">Enter Certificate ID to Verify</h3>
            <p className="text-gray-600 mb-4 md:mb-6 max-w-md mx-auto text-sm md:text-base">
              Please enter a valid internship certificate ID to verify its authenticity and view details.
            </p>
            <div className="bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 rounded-xl p-4 text-left max-w-md mx-auto">
              <h4 className="font-semibold text-orange-800 mb-2 md:mb-3 flex items-center text-sm md:text-base">
                <Shield className="mr-2" size={16} />
                Certificate ID Format:
              </h4>
              <p className="text-orange-700 text-xs md:text-sm font-mono">SSE-IC-YYYYMMDD-XXXX</p>
              <p className="text-orange-700 text-xs mt-2">Example: SSE-IC-20250901-1234</p>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 md:mt-12 text-center text-gray-500 text-xs md:text-sm">
          <p>© {new Date().getFullYear()} Syed Solar Energy. All rights reserved.</p>
          <p className="mt-2">
            This verification system ensures the authenticity of internship certificates issued by Syed Solar Energy.
          </p>
        </div>
      </div>
    </div>
  );
};

export default InternshipVerification;