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
          <div className="inline-flex items-center px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg sm:rounded-xl font-bold shadow-lg shadow-green-500/30 transform transition-transform hover:scale-105 text-sm sm:text-base">
            <CheckCircle className="mr-2" size={18} />
            Verified & Valid
          </div>
        );
      case 'invalid':
        return (
          <div className="inline-flex items-center px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-lg sm:rounded-xl font-bold shadow-lg shadow-red-500/30 transform transition-transform hover:scale-105 text-sm sm:text-base">
            <XCircle className="mr-2" size={18} />
            Invalid Certificate ID
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 shadow-2xl shadow-blue-500/20 border-b border-blue-400">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
            <div className="flex items-center w-full sm:w-auto">
              <div className="w-10 sm:w-12 lg:w-14 h-10 sm:h-12 lg:h-14 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg sm:rounded-xl flex items-center justify-center text-white font-bold text-sm sm:text-base lg:text-lg mr-3 sm:mr-4 shadow-lg shadow-blue-500/50 flex-shrink-0">
                <div className="transform rotate-3">SSE</div>
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-white leading-tight">Experience Certificate Verification</h1>
                <p className="text-xs sm:text-sm text-blue-100 mt-1 truncate sm:whitespace-normal">Syed Solar Energy - Certificate Verification System</p>
              </div>
            </div>
            <button
              onClick={() => window.location.href = '/'}
              className="flex items-center px-3 sm:px-4 lg:px-5 py-2 sm:py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg sm:rounded-xl transition-all duration-300 backdrop-blur-sm border border-white/20 shadow-lg text-sm sm:text-base whitespace-nowrap flex-shrink-0"
            >
              <ArrowLeft className="mr-1 sm:mr-2" size={16} />
              Back to Home
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8">
        {/* Search Section */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl sm:shadow-2xl p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8 border border-blue-200 transform transition-transform hover:translate-y-[-2px] sm:hover:translate-y-[-5px]">
          <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800 mb-4 sm:mb-6 flex items-center">
            <div className="p-1.5 sm:p-2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg mr-2 sm:mr-3 shadow-md flex-shrink-0">
              <Search className="text-white" size={18} />
            </div>
            <span className="min-w-0">Verify Experience Certificate</span>
          </h2>
          
          <div className="flex flex-col gap-3 sm:gap-4">
            <input
              type="text"
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Enter Certificate ID (e.g., SSE-EC-20250901-123)"
              className="w-full px-4 sm:px-5 py-3 sm:py-4 border border-blue-200 rounded-lg sm:rounded-xl focus:ring-2 sm:focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 shadow-sm text-sm sm:text-base"
            />
            <button
              onClick={handleSearch}
              disabled={loading || !searchId.trim()}
              className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 sm:px-6 py-3 sm:py-4 rounded-lg sm:rounded-xl font-bold transition-all duration-300 flex items-center justify-center shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 transform hover:-translate-y-1 text-sm sm:text-base"
            >
              {loading ? <Loader className="animate-spin mr-2" size={18} /> : <Search className="mr-2" size={18} />}
              {loading ? 'Verifying...' : 'Verify Certificate'}
            </button>
          </div>
          
          <div className="mt-4 sm:mt-6 flex items-center text-xs sm:text-sm text-blue-600">
            <ChevronRight size={14} className="mr-1 flex-shrink-0" />
            <span>Example: SSE-EC-20250901-1234</span>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg sm:shadow-xl p-6 sm:p-8 text-center border border-blue-100">
            <div className="animate-spin w-10 sm:w-12 lg:w-14 h-10 sm:h-12 lg:h-14 border-3 sm:border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-3 sm:mb-4"></div>
            <p className="text-gray-600 text-base sm:text-lg">Verifying certificate...</p>
          </div>
        )}

        {/* Verification Results */}
        {!loading && verificationStatus && (
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl sm:shadow-2xl p-4 sm:p-6 lg:p-8 border border-blue-200">
            <div className="text-center mb-6 sm:mb-8">
              {getStatusBadge()}
            </div>

            {verificationStatus === 'invalid' && (
              <div className="text-center py-8 sm:py-12">
                <div className="relative inline-block mb-4 sm:mb-6">
                  <XCircle className="mx-auto text-red-500 mb-3 sm:mb-4 relative z-10" size={60} />
                  <div className="absolute -inset-3 sm:-inset-4 bg-red-100 rounded-full blur-lg opacity-50 z-0"></div>
                </div>
                <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800 mb-3 sm:mb-4">Certificate Not Found</h3>
                <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6 max-w-md mx-auto px-4">
                  The certificate ID you entered could not be found in our database. 
                  Please check the ID and try again.
                </p>
                <div className="bg-red-50 border border-red-200 rounded-lg sm:rounded-xl p-4 sm:p-5 text-left max-w-md mx-auto">
                  <h4 className="font-semibold text-red-800 mb-3 flex items-center text-sm sm:text-base">
                    <Shield className="mr-2 flex-shrink-0" size={16} />
                    Common Issues:
                  </h4>
                  <ul className="text-red-700 text-xs sm:text-sm space-y-2">
                    <li className="flex items-start">
                      <span className="bg-red-100 text-red-700 rounded-full w-2 h-2 mt-2 mr-3 flex-shrink-0"></span>
                      <span>Double-check the Certificate ID format (SSE-EC-YYYYMMDD-XXXX)</span>
                    </li>
                    <li className="flex items-start">
                      <span className="bg-red-100 text-red-700 rounded-full w-2 h-2 mt-2 mr-3 flex-shrink-0"></span>
                      <span>Ensure there are no extra spaces or special characters</span>
                    </li>
                    <li className="flex items-start">
                      <span className="bg-red-100 text-red-700 rounded-full w-2 h-2 mt-2 mr-3 flex-shrink-0"></span>
                      <span>Contact HR if you believe this is an error</span>
                    </li>
                  </ul>
                </div>
              </div>
            )}

            {verificationStatus === 'valid' && verificationData && (
              <div>
                <div className="grid lg:grid-cols-2 gap-4 sm:gap-6">
                  {/* Candidate Information */}
                  <div className="space-y-4 sm:space-y-6">
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-blue-100 shadow-sm">
                      <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-3 sm:mb-4 flex items-center">
                        <div className="p-1.5 sm:p-2 bg-blue-500 rounded-lg mr-2 sm:mr-3 flex-shrink-0">
                          <User className="text-white" size={16} />
                        </div>
                        <span className="min-w-0">Candidate Information</span>
                      </h3>
                      <div className="space-y-3 sm:space-y-4">
                        <div className="flex items-start">
                          <User className="mr-3 text-blue-600 mt-1 flex-shrink-0" size={16} />
                          <div className="min-w-0 flex-1">
                            <p className="text-xs sm:text-sm text-gray-500">Full Name</p>
                            <p className="font-semibold text-gray-800 text-sm sm:text-base break-words">{verificationData.candidate_name}</p>
                          </div>
                        </div>
                        <div className="flex items-start">
                          <User className="mr-3 text-blue-600 mt-1 flex-shrink-0" size={16} />
                          <div className="min-w-0 flex-1">
                            <p className="text-xs sm:text-sm text-gray-500">Father's Name</p>
                            <p className="font-semibold text-gray-800 text-sm sm:text-base break-words">{verificationData.father_name}</p>
                          </div>
                        </div>
                        <div className="flex items-start">
                          <Mail className="mr-3 text-blue-600 mt-1 flex-shrink-0" size={16} />
                          <div className="min-w-0 flex-1">
                            <p className="text-xs sm:text-sm text-gray-500">Email</p>
                            <p className="font-semibold text-gray-800 text-sm sm:text-base break-all">{verificationData.email}</p>
                          </div>
                        </div>
                        {verificationData.contact && (
                          <div className="flex items-start">
                            <Phone className="mr-3 text-blue-600 mt-1 flex-shrink-0" size={16} />
                            <div className="min-w-0 flex-1">
                              <p className="text-xs sm:text-sm text-gray-500">Contact</p>
                              <p className="font-semibold text-gray-800 text-sm sm:text-base">{verificationData.contact}</p>
                            </div>
                          </div>
                        )}
                        {verificationData.address && (
                          <div className="flex items-start">
                            <MapPin className="mr-3 text-blue-600 mt-1 flex-shrink-0" size={16} />
                            <div className="min-w-0 flex-1">
                              <p className="text-xs sm:text-sm text-gray-500">Address</p>
                              <p className="font-semibold text-gray-800 text-sm sm:text-base break-words">{verificationData.address}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Certificate Details */}
                    <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-indigo-100 shadow-sm">
                      <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-3 sm:mb-4 flex items-center">
                        <div className="p-1.5 sm:p-2 bg-indigo-500 rounded-lg mr-2 sm:mr-3 flex-shrink-0">
                          <FileText className="text-white" size={16} />
                        </div>
                        <span className="min-w-0">Certificate Details</span>
                      </h3>
                      <div className="space-y-3 sm:space-y-4">
                        <div className="flex items-start">
                          <Shield className="mr-3 text-indigo-600 mt-1 flex-shrink-0" size={16} />
                          <div className="min-w-0 flex-1">
                            <p className="text-xs sm:text-sm text-gray-500">Certificate ID</p>
                            <p className="font-semibold text-gray-800 font-mono text-sm sm:text-base break-all">{verificationData.certificate_id}</p>
                          </div>
                        </div>
                        <div className="flex items-start">
                          <Calendar className="mr-3 text-indigo-600 mt-1 flex-shrink-0" size={16} />
                          <div className="min-w-0 flex-1">
                            <p className="text-xs sm:text-sm text-gray-500">Issue Date</p>
                            <p className="font-semibold text-gray-800 text-sm sm:text-base">{formatDate(verificationData.issue_date)}</p>
                          </div>
                        </div>
                        <div className="flex items-start">
                          <Briefcase className="mr-3 text-indigo-600 mt-1 flex-shrink-0" size={16} />
                          <div className="min-w-0 flex-1">
                            <p className="text-xs sm:text-sm text-gray-500">Projects</p>
                            <p className="font-semibold text-gray-800 text-sm sm:text-base">{verificationData.projects?.length || 0}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Projects Information */}
                  <div className="space-y-4 sm:space-y-6">
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-blue-100 shadow-sm">
                      <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-3 sm:mb-4 flex items-center">
                        <div className="p-1.5 sm:p-2 bg-blue-500 rounded-lg mr-2 sm:mr-3 flex-shrink-0">
                          <Briefcase className="text-white" size={16} />
                        </div>
                        <span className="min-w-0">Project Experience</span>
                      </h3>
                      <div className="space-y-4 sm:space-y-6 max-h-64 sm:max-h-80 overflow-y-auto">
                        {verificationData.projects?.map((project, index) => (
                          <div key={index} className="border-l-4 border-blue-300 pl-3 sm:pl-4 py-2">
                            <h4 className="font-semibold text-gray-800 text-sm sm:text-base break-words">{project.projectName}</h4>
                            {project.projectDetails && (
                              <p className="text-xs sm:text-sm text-gray-600 mt-1 break-words">{project.projectDetails}</p>
                            )}
                            <div className="mt-2">
                              <p className="text-xs sm:text-sm text-gray-700"><span className="font-medium">Role:</span> {project.candidateRole}</p>
                              {project.performance && (
                                <p className="text-xs sm:text-sm text-gray-700 mt-1 break-words"><span className="font-medium">Performance:</span> {project.performance}</p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Electronic Signature Verification */}
                    <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-indigo-100 shadow-sm">
                      <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-3 sm:mb-4 flex items-center">
                        <div className="p-1.5 sm:p-2 bg-indigo-500 rounded-lg mr-2 sm:mr-3 flex-shrink-0">
                          <Shield className="text-white" size={16} />
                        </div>
                        <span className="min-w-0">Electronic Verification</span>
                      </h3>
                      <div className="space-y-3 sm:space-y-4">
                        <div className="flex items-center">
                          <div className="bg-white p-2 rounded-lg mr-3 border border-blue-200 flex-shrink-0">
                            <img 
                              src={verificationData.signature_qr_url} 
                              alt="Verification QR Code" 
                              className="w-12 h-12 sm:w-16 sm:h-16"
                            />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs sm:text-sm text-gray-500">Scan to Verify</p>
                            <p className="font-semibold text-gray-800 text-xs break-all">{verificationData.certificate_id}</p>
                          </div>
                        </div>
                        <div>
                          <p className="text-xs sm:text-sm text-gray-500">Signed By</p>
                          <p className="font-semibold text-gray-800 text-sm sm:text-base break-words">{verificationData.signature_signer_name}</p>
                          <p className="text-xs sm:text-sm text-gray-600 break-words">{verificationData.signature_signer_title}</p>
                        </div>
                        <div>
                          <p className="text-xs sm:text-sm text-gray-500">Signed At</p>
                          <p className="font-semibold text-gray-800 text-sm sm:text-base">
                            {new Date(verificationData.signature_signed_at).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Company Info */}
                <div className="mt-6 sm:mt-8 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg">
                  <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 sm:gap-6">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg sm:text-xl font-bold mb-3 flex items-center">
                        <Building className="mr-2 flex-shrink-0" size={18} />
                        <span className="break-words">{companyInfo?.company_name || 'Syed Solar Energy'}</span>
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 opacity-90 text-xs sm:text-sm">
                        <div className="flex items-start">
                          <MapPin size={14} className="mr-2 flex-shrink-0 mt-0.5" />
                          <span className="break-words">{companyInfo?.company_address || 'Jalil Market Umar Gull Chowck, Bara Road, Peshawar'}</span>
                        </div>
                        <div className="flex items-center">
                          <Mail size={14} className="mr-2 flex-shrink-0" />
                          <span className="break-all">{companyInfo?.company_email || 'sales@syedsolarenergy.com'}</span>
                        </div>
                        <div className="flex items-center">
                          <Phone size={14} className="mr-2 flex-shrink-0" />
                          <span>{companyInfo?.company_phone || '03075596695'}</span>
                        </div>
                        <div className="flex items-center">
                          <Globe size={14} className="mr-2 flex-shrink-0" />
                          <span className="break-all">{companyInfo?.company_website || 'www.syedsolarenergy.com'}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-center sm:text-right bg-white/10 p-3 sm:p-4 rounded-lg sm:rounded-xl backdrop-blur-sm flex-shrink-0">
                      <p className="text-xs sm:text-sm opacity-90">Verified on</p>
                      <p className="font-semibold text-sm sm:text-base">{new Date().toLocaleString()}</p>
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
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg sm:shadow-xl p-6 sm:p-8 text-center border border-blue-100">
            <div className="relative inline-block mb-4 sm:mb-6">
              <Search className="mx-auto text-blue-400 mb-3 sm:mb-4 relative z-10" size={50} />
              <div className="absolute -inset-3 sm:-inset-4 bg-blue-100 rounded-full blur-lg opacity-50 z-0"></div>
            </div>
            <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800 mb-3 sm:mb-4">Enter Certificate ID to Verify</h3>
            <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6 max-w-md mx-auto px-4">
              Please enter a valid experience certificate ID to verify its authenticity and view details.
            </p>
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg sm:rounded-xl p-4 sm:p-5 text-left max-w-md mx-auto">
              <h4 className="font-semibold text-blue-800 mb-3 flex items-center text-sm sm:text-base">
                <Shield className="mr-2 flex-shrink-0" size={16} />
                Certificate ID Format:
              </h4>
              <p className="text-blue-700 text-sm font-mono">SSE-EC-YYYYMMDD-XXXX</p>
              <p className="text-blue-700 text-xs mt-2">Example: SSE-EC-20250901-1234</p>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 sm:mt-12 text-center text-gray-500 text-xs sm:text-sm px-4">
          <p>© {new Date().getFullYear()} Syed Solar Energy. All rights reserved.</p>
          <p className="mt-2">
            This verification system ensures the authenticity of experience certificates issued by Syed Solar Energy.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ExperienceVerification;