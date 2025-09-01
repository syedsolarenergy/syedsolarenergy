import React, { useState, useEffect } from 'react';
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
  ChevronRight,
  Star,
  Award,
  Sparkles
} from 'lucide-react';

const InternshipVerification = () => {
  // Mock params since we don't have react-router in this environment
  const certificateId = 'SSE-IC-20250901-1234';
  
  const [verificationData, setVerificationData] = useState(null);
  const [companyInfo, setCompanyInfo] = useState({
    company_name: 'Syed Solar Energy',
    company_address: 'Jalil Market Umar Gull Chowck, Bara Road, Peshawar',
    company_email: 'sales@syedsolarenergy.com',
    company_phone: '03075596695',
    company_website: 'www.syedsolarenergy.com'
  });
  const [loading, setLoading] = useState(false);
  const [searchId, setSearchId] = useState(certificateId || '');
  const [verificationStatus, setVerificationStatus] = useState('valid');
  const [verificationAttempts, setVerificationAttempts] = useState(1);
  
  // Mock data for demonstration
  const mockVerificationData = {
    certificate_id: 'SSE-IC-20250901-1234',
    candidate_name: 'Zain ul Abideen',
    father_name: 'Zaki ud Din',
    dob: '2001-01-01',
    email: 'zain1522004@gmail.com',
    contact: '03137630214',
    address: '123 Main Street, Peshawar',
    university_name: 'Sarhad University of Science and IT Peshawar',
    issue_date: '2025-10-31',
    joining_date: '2025-08-01',
    leaving_date: '2025-10-30',
    signature_qr_url: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==',
    signature_signer_name: 'HR Manager',
    signature_signer_title: 'Human Resources',
    signature_signed_at: '2025-10-31T10:00:00Z',
    verification_count: 5,
    verified_at: new Date().toISOString()
  };

  useEffect(() => {
    if (certificateId) {
      setTimeout(() => {
        setVerificationData(mockVerificationData);
        setVerificationStatus('valid');
        setLoading(false);
      }, 1000);
    }
  }, [certificateId]);

  const formatDate = (dateString) => {
    if (!dateString) return 'Not specified';
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  const handleSearch = () => {
    if (searchId.trim()) {
      setLoading(true);
      setTimeout(() => {
        setVerificationData(mockVerificationData);
        setVerificationStatus('valid');
        setLoading(false);
      }, 2000);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const getStatusBadge = () => {
    switch (verificationStatus) {
      case 'valid':
        return (
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-green-400 via-emerald-500 to-teal-500 rounded-2xl blur-lg opacity-30 group-hover:opacity-50 animate-pulse"></div>
            <div className="relative inline-flex items-center px-6 py-4 bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 text-white rounded-2xl font-bold shadow-2xl transform transition-all duration-500 hover:scale-105 hover:shadow-green-500/40">
              <div className="flex items-center">
                <div className="relative mr-3">
                  <CheckCircle size={24} className="relative z-10" />
                  <div className="absolute -inset-1 bg-white/30 rounded-full animate-ping"></div>
                </div>
                <div>
                  <div className="text-lg font-extrabold">Verified & Valid</div>
                  <div className="text-xs opacity-90 font-medium">Certificate Authenticated</div>
                </div>
              </div>
              <Sparkles size={20} className="ml-3 animate-bounce" />
            </div>
          </div>
        );
      case 'invalid':
        return (
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-red-400 via-rose-500 to-pink-500 rounded-2xl blur-lg opacity-30 group-hover:opacity-50"></div>
            <div className="relative inline-flex items-center px-6 py-4 bg-gradient-to-r from-red-500 via-rose-500 to-pink-500 text-white rounded-2xl font-bold shadow-2xl transform transition-all duration-300 hover:scale-105">
              <XCircle className="mr-3" size={24} />
              <div>
                <div className="text-lg font-extrabold">Invalid Certificate</div>
                <div className="text-xs opacity-90">ID Not Found</div>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 via-rose-50 to-pink-50 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-orange-200/30 to-amber-200/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-pink-200/30 to-rose-200/30 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-amber-200/20 to-orange-200/20 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      {/* Enhanced Header */}
      <div className="relative bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 shadow-2xl border-b border-orange-400/50 backdrop-blur-sm">
        <div className="absolute inset-0 bg-gradient-to-r from-orange-600/10 via-transparent to-amber-600/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 lg:px-6 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center w-full sm:w-auto group">
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-white/20 to-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center text-white font-bold text-xl mr-4 shadow-2xl border border-white/20 group-hover:scale-110 transition-transform duration-300">
                  <div className="transform rotate-3 relative">
                    <span className="relative z-10">SSE</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-amber-400 opacity-50 blur-sm rounded"></div>
                  </div>
                </div>
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-400 rounded-full flex items-center justify-center shadow-lg animate-bounce">
                  <Star size={12} className="text-white" />
                </div>
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-2xl md:text-3xl lg:text-4xl font-extrabold text-white leading-tight bg-gradient-to-r from-white to-amber-100 bg-clip-text text-transparent">
                  Certificate Verification
                </h1>
                <p className="text-sm text-amber-100/90 mt-1 font-medium">
                  🔐 Secure • ⚡ Instant • ✅ Verified
                </p>
              </div>
            </div>
            <button
              onClick={() => window.location.href = '/'}
              className="group flex items-center px-5 py-3 bg-white/20 hover:bg-white/30 text-white rounded-2xl transition-all duration-300 backdrop-blur-sm border border-white/30 shadow-2xl hover:shadow-white/20 text-sm font-semibold"
            >
              <ArrowLeft className="mr-2 group-hover:-translate-x-1 transition-transform duration-300" size={18} />
              Back to Home
            </button>
          </div>
        </div>
      </div>

      <div className="relative max-w-5xl mx-auto px-4 lg:px-6 py-8">
        {/* Enhanced Search Section */}
        <div className="relative group mb-8">
          <div className="absolute -inset-1 bg-gradient-to-r from-orange-400 to-amber-400 rounded-3xl blur-xl opacity-20 group-hover:opacity-30 transition-opacity duration-500"></div>
          <div className="relative bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/50">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-orange-500 to-amber-500 rounded-2xl mb-4 shadow-xl">
                <Search className="text-white" size={24} />
              </div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent mb-2">
                Verify Certificate
              </h2>
              <p className="text-gray-600">Enter your certificate ID to verify authenticity</p>
            </div>
            
            <div className="max-w-md mx-auto space-y-4">
              <div className="relative group">
                <input
                  type="text"
                  value={searchId}
                  onChange={(e) => setSearchId(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="SSE-IC-20250901-1234"
                  className="w-full px-6 py-4 bg-white border-2 border-orange-200 rounded-2xl focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 transition-all duration-300 shadow-lg font-mono text-center text-lg group-hover:shadow-xl"
                />
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                  <Shield className="text-orange-400" size={20} />
                </div>
              </div>
              <button
                onClick={handleSearch}
                disabled={loading || !searchId.trim()}
                className="w-full group relative overflow-hidden bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-4 rounded-2xl font-bold transition-all duration-300 shadow-xl hover:shadow-2xl hover:shadow-orange-500/30 transform hover:-translate-y-1"
              >
                <div className="relative flex items-center justify-center">
                  {loading ? (
                    <>
                      <Loader className="animate-spin mr-2" size={20} />
                      <span>Verifying...</span>
                    </>
                  ) : (
                    <>
                      <Search className="mr-2 group-hover:scale-110 transition-transform duration-300" size={20} />
                      <span>Verify Certificate</span>
                    </>
                  )}
                </div>
                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </button>
            </div>
            
            <div className="mt-6 flex items-center justify-center text-sm text-amber-700">
              <ChevronRight size={16} className="mr-1" />
              <span>Secure verification powered by blockchain technology</span>
            </div>
          </div>
        </div>

        {/* Enhanced Loading State */}
        {loading && (
          <div className="relative group mb-8">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-400 to-purple-400 rounded-3xl blur-xl opacity-20 animate-pulse"></div>
            <div className="relative bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-12 text-center border border-white/50">
              <div className="relative inline-block mb-6">
                <div className="w-20 h-20 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin"></div>
                <div className="absolute inset-0 w-20 h-20 border-4 border-amber-500/20 border-r-amber-500 rounded-full animate-spin animate-reverse delay-150"></div>
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">Verifying Certificate</h3>
              <p className="text-gray-600">Please wait while we authenticate your certificate...</p>
              <div className="flex items-center justify-center mt-4 space-x-2">
                <div className="w-2 h-2 bg-orange-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-amber-400 rounded-full animate-bounce delay-100"></div>
                <div className="w-2 h-2 bg-orange-400 rounded-full animate-bounce delay-200"></div>
              </div>
            </div>
          </div>
        )}

        {/* Enhanced Verification Results */}
        {!loading && verificationStatus && (
          <div className="relative group mb-8">
            <div className="absolute -inset-1 bg-gradient-to-r from-green-400 to-emerald-400 rounded-3xl blur-xl opacity-20"></div>
            <div className="relative bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/50">
              <div className="text-center mb-8">
                {getStatusBadge()}
              </div>

              {verificationStatus === 'valid' && verificationData && (
                <div>
                  <div className="grid lg:grid-cols-2 gap-8">
                    {/* Enhanced Candidate Information */}
                    <div className="space-y-6">
                      <div className="relative group">
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-orange-400 to-amber-400 rounded-2xl blur opacity-20 group-hover:opacity-30 transition-opacity duration-300"></div>
                        <div className="relative bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl p-6 border border-orange-100/50 shadow-xl backdrop-blur-sm">
                          <div className="flex items-center mb-6">
                            <div className="p-3 bg-gradient-to-r from-orange-500 to-amber-500 rounded-xl mr-3 shadow-lg">
                              <User className="text-white" size={20} />
                            </div>
                            <div>
                              <h3 className="text-xl font-bold text-gray-800">Candidate Information</h3>
                              <p className="text-sm text-orange-600">Personal Details</p>
                            </div>
                            <Award className="ml-auto text-amber-500" size={24} />
                          </div>
                          <div className="space-y-4">
                            {[
                              { icon: User, label: 'Full Name', value: verificationData.candidate_name },
                              { icon: User, label: "Father's Name", value: verificationData.father_name },
                              { icon: Calendar, label: 'Date of Birth', value: formatDate(verificationData.dob) },
                              { icon: Mail, label: 'Email', value: verificationData.email },
                              { icon: Phone, label: 'Contact', value: verificationData.contact },
                            ].map((item, index) => (
                              <div key={index} className="flex items-start p-3 bg-white/70 rounded-xl hover:bg-white/90 transition-colors duration-200 group">
                                <div className="p-2 bg-gradient-to-r from-amber-100 to-orange-100 rounded-lg mr-3 group-hover:scale-110 transition-transform duration-200">
                                  <item.icon className="text-amber-600" size={16} />
                                </div>
                                <div className="flex-1">
                                  <p className="text-sm text-gray-500 font-medium">{item.label}</p>
                                  <p className="font-semibold text-gray-800 break-words">{item.value}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {verificationData.university_name && (
                        <div className="relative group">
                          <div className="absolute -inset-0.5 bg-gradient-to-r from-amber-400 to-orange-400 rounded-2xl blur opacity-20 group-hover:opacity-30 transition-opacity duration-300"></div>
                          <div className="relative bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-6 border border-amber-100/50 shadow-xl">
                            <div className="flex items-center mb-4">
                              <div className="p-3 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl mr-3 shadow-lg">
                                <BookOpen className="text-white" size={20} />
                              </div>
                              <div>
                                <h3 className="text-xl font-bold text-gray-800">University</h3>
                                <p className="text-sm text-amber-600">Educational Institution</p>
                              </div>
                            </div>
                            <div className="p-3 bg-white/70 rounded-xl">
                              <p className="text-sm text-gray-500 font-medium">University Name</p>
                              <p className="font-semibold text-gray-800">{verificationData.university_name}</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Enhanced Certificate Details */}
                    <div className="space-y-6">
                      <div className="relative group">
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-400 to-purple-400 rounded-2xl blur opacity-20 group-hover:opacity-30 transition-opacity duration-300"></div>
                        <div className="relative bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-6 border border-blue-100/50 shadow-xl">
                          <div className="flex items-center mb-6">
                            <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl mr-3 shadow-lg">
                              <FileText className="text-white" size={20} />
                            </div>
                            <div>
                              <h3 className="text-xl font-bold text-gray-800">Certificate Details</h3>
                              <p className="text-sm text-blue-600">Official Information</p>
                            </div>
                            <Shield className="ml-auto text-blue-500" size={24} />
                          </div>
                          <div className="space-y-4">
                            {[
                              { icon: Shield, label: 'Certificate ID', value: verificationData.certificate_id, mono: true },
                              { icon: Calendar, label: 'Issue Date', value: formatDate(verificationData.issue_date) },
                              { icon: Calendar, label: 'Joining Date', value: formatDate(verificationData.joining_date) },
                              { icon: Calendar, label: 'Leaving Date', value: formatDate(verificationData.leaving_date) },
                              { 
                                icon: Clock, 
                                label: 'Duration', 
                                value: `${Math.ceil(Math.abs(new Date(verificationData.leaving_date) - new Date(verificationData.joining_date)) / (1000 * 60 * 60 * 24 * 7))} weeks` 
                              },
                            ].map((item, index) => (
                              <div key={index} className="flex items-start p-3 bg-white/70 rounded-xl hover:bg-white/90 transition-colors duration-200 group">
                                <div className="p-2 bg-gradient-to-r from-blue-100 to-purple-100 rounded-lg mr-3 group-hover:scale-110 transition-transform duration-200">
                                  <item.icon className="text-blue-600" size={16} />
                                </div>
                                <div className="flex-1">
                                  <p className="text-sm text-gray-500 font-medium">{item.label}</p>
                                  <p className={`font-semibold text-gray-800 ${item.mono ? 'font-mono text-sm' : ''} break-words`}>{item.value}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Enhanced Electronic Signature */}
                      <div className="relative group">
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-green-400 to-teal-400 rounded-2xl blur opacity-20 group-hover:opacity-30 transition-opacity duration-300"></div>
                        <div className="relative bg-gradient-to-br from-green-50 to-teal-50 rounded-2xl p-6 border border-green-100/50 shadow-xl">
                          <div className="flex items-center mb-6">
                            <div className="p-3 bg-gradient-to-r from-green-500 to-teal-500 rounded-xl mr-3 shadow-lg">
                              <Shield className="text-white" size={20} />
                            </div>
                            <div>
                              <h3 className="text-xl font-bold text-gray-800">Digital Signature</h3>
                              <p className="text-sm text-green-600">Blockchain Verified</p>
                            </div>
                            <Sparkles className="ml-auto text-green-500 animate-pulse" size={24} />
                          </div>
                          <div className="space-y-4">
                            <div className="flex items-center p-3 bg-white/70 rounded-xl">
                              <div className="bg-white p-3 rounded-xl mr-4 border-2 border-green-200 shadow-lg">
                                <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-teal-100 rounded-lg flex items-center justify-center">
                                  <Shield className="text-green-600" size={24} />
                                </div>
                              </div>
                              <div>
                                <p className="text-sm text-gray-500 font-medium">Verification Code</p>
                                <p className="font-mono text-sm font-bold text-green-600">#{verificationData.certificate_id}</p>
                              </div>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <div className="p-3 bg-white/70 rounded-xl">
                                <p className="text-sm text-gray-500 font-medium">Signed By</p>
                                <p className="font-semibold text-gray-800">{verificationData.signature_signer_name}</p>
                                <p className="text-sm text-gray-600">{verificationData.signature_signer_title}</p>
                              </div>
                              <div className="p-3 bg-white/70 rounded-xl">
                                <p className="text-sm text-gray-500 font-medium">Verification Count</p>
                                <p className="font-bold text-2xl text-green-600">#{verificationData.verification_count}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Enhanced Company Info */}
                  <div className="mt-8 relative group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-orange-400 via-amber-400 to-orange-400 rounded-3xl blur-xl opacity-20"></div>
                    <div className="relative bg-gradient-to-r from-orange-600 via-amber-500 to-orange-600 text-white rounded-3xl p-8 shadow-2xl backdrop-blur-sm">
                      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                        <div className="flex-1">
                          <div className="flex items-center mb-4">
                            <div className="p-3 bg-white/20 rounded-xl mr-3 backdrop-blur-sm">
                              <Building size={24} />
                            </div>
                            <div>
                              <h3 className="text-2xl font-bold">{companyInfo?.company_name}</h3>
                              <p className="text-amber-100">Certificate Issuing Authority</p>
                            </div>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 opacity-90">
                            {[
                              { icon: MapPin, value: companyInfo?.company_address },
                              { icon: Mail, value: companyInfo?.company_email },
                              { icon: Phone, value: companyInfo?.company_phone },
                              { icon: Globe, value: companyInfo?.company_website },
                            ].map((item, index) => (
                              <div key={index} className="flex items-center text-sm bg-white/10 rounded-lg p-3 backdrop-blur-sm">
                                <item.icon size={16} className="mr-2 flex-shrink-0" />
                                <span className="break-all">{item.value}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="text-center bg-white/20 p-6 rounded-2xl backdrop-blur-sm border border-white/30">
                          <p className="text-sm opacity-90 mb-2">Verified on</p>
                          <p className="font-bold text-lg">{new Date().toLocaleDateString()}</p>
                          <div className="flex items-center justify-center mt-2 text-amber-200">
                            <Star size={16} className="mr-1" />
                            <span className="text-sm">Verification #{verificationData.verification_count}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Enhanced Footer */}
        <div className="mt-12 text-center">
          <div className="inline-block bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/50">
            <div className="flex items-center justify-center mb-3">
              <Shield className="text-orange-500 mr-2" size={20} />
              <span className="font-semibold text-gray-800">Secured by SSE Technology</span>
            </div>
            <p className="text-gray-600 text-sm max-w-2xl">
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