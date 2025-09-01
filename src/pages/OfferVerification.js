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
  DollarSign,
  Clock,
  Shield,
  ArrowLeft,
  Download,
  Eye,
  Loader,
  Building,
  Globe
} from 'lucide-react';
import { supabase } from '../supabaseClient';

const OfferVerification = () => {
  const { offerId } = useParams();
  const [verificationData, setVerificationData] = useState(null);
  const [companyInfo, setCompanyInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchId, setSearchId] = useState(offerId || '');
  const [verificationStatus, setVerificationStatus] = useState(null);
  const [verificationAttempts, setVerificationAttempts] = useState(0);

  // Load company info from Supabase
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

  const verifyOffer = async (id) => {
    setLoading(true);
    setVerificationStatus(null);
    
    try {
      // First, check if offer exists
      const { data: offerData, error: offerError } = await supabase
        .from('offer_letters')
        .select('*')
        .eq('offer_id', id)
        .single();
      
      if (offerError || !offerData) {
        setVerificationStatus('invalid');
        setVerificationData(null);
        setLoading(false);
        return;
      }
      
      // Check if offer is expired
      const currentDate = new Date();
      const expiryDate = new Date(offerData.expiry_date);
      
      if (currentDate > expiryDate) {
        // Update status to expired
        await supabase
          .from('offer_letters')
          .update({ status: 'expired' })
          .eq('offer_id', id);
        
        setVerificationStatus('expired');
        setVerificationData({ ...offerData, isExpired: true });
      } else {
        setVerificationStatus('valid');
        setVerificationData({ ...offerData, isExpired: false });
        
        // Update verification count and timestamp
        await supabase
          .from('offer_letters')
          .update({ 
            verified_at: new Date().toISOString(),
            verification_count: (offerData.verification_count || 0) + 1 
          })
          .eq('offer_id', id);
      }
      
      // Log verification attempt
      const { error: verificationError } = await supabase
        .from('offer_verifications')
        .insert([
          {
            offer_id: id,
            ip_address: null, // Would be captured in a real implementation
            user_agent: navigator.userAgent,
            status: currentDate > expiryDate ? 'expired' : 'valid'
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
    if (offerId) {
      verifyOffer(offerId);
    } else {
      setLoading(false);
    }
  }, [offerId]);

  const handleSearch = () => {
    if (searchId.trim()) {
      window.location.href = `/verify-offer/${searchId.trim()}`;
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR'
    }).format(amount);
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
          <div className="inline-flex items-center px-4 py-2 bg-green-100 text-green-800 rounded-full font-semibold">
            <CheckCircle className="mr-2" size={20} />
            Verified & Valid
          </div>
        );
      case 'expired':
        return (
          <div className="inline-flex items-center px-4 py-2 bg-yellow-100 text-yellow-800 rounded-full font-semibold">
            <Clock className="mr-2" size={20} />
            Expired
          </div>
        );
      case 'invalid':
        return (
          <div className="inline-flex items-center px-4 py-2 bg-red-100 text-red-800 rounded-full font-semibold">
            <XCircle className="mr-2" size={20} />
            Invalid Offer ID
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white shadow-lg border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-lg mr-4">
                SSE
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Offer Letter Verification</h1>
                <p className="text-gray-600">Syed Solar Energy - Employment Verification System</p>
              </div>
            </div>
            <button
              onClick={() => window.location.href = '/'}
              className="flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors duration-200"
            >
              <ArrowLeft className="mr-2" size={16} />
              Back to Home
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Search Section */}
        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 mb-8">
          <h2 className="text-xl md:text-2xl font-semibold text-gray-800 mb-6 flex items-center">
            <Search className="mr-3 text-blue-600" />
            Verify Offer Letter
          </h2>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <input
              type="text"
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Enter Offer ID (e.g., SSE-OL-20250901-123)"
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            />
            <button
              onClick={handleSearch}
              disabled={loading || !searchId.trim()}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center"
            >
              {loading ? <Loader className="animate-spin mr-2" size={20} /> : <Search className="mr-2" size={20} />}
              {loading ? 'Verifying...' : 'Verify'}
            </button>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-600 text-lg">Verifying offer letter...</p>
          </div>
        )}

        {/* Verification Results */}
        {!loading && verificationStatus && (
          <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
            <div className="text-center mb-8">
              {getStatusBadge()}
            </div>

            {verificationStatus === 'invalid' && (
              <div className="text-center py-12">
                <XCircle className="mx-auto text-red-500 mb-4" size={64} />
                <h3 className="text-2xl font-bold text-gray-800 mb-4">Offer Letter Not Found</h3>
                <p className="text-gray-600 mb-6">
                  The offer ID you entered could not be found in our database. 
                  Please check the ID and try again.
                </p>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-left max-w-md mx-auto">
                  <h4 className="font-semibold text-red-800 mb-2">Common Issues:</h4>
                  <ul className="text-red-700 text-sm space-y-1">
                    <li>• Double-check the Offer ID format (SSE-OL-YYYYMMDD-XXXX)</li>
                    <li>• Ensure there are no extra spaces or special characters</li>
                    <li>• Contact HR if you believe this is an error</li>
                  </ul>
                </div>
              </div>
            )}

            {(verificationStatus === 'valid' || verificationStatus === 'expired') && verificationData && (
              <div>
                <div className="grid md:grid-cols-2 gap-8">
                  {/* Employee Information */}
                  <div className="space-y-6">
                    <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6">
                      <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                        <User className="mr-2 text-blue-600" />
                        Employee Information
                      </h3>
                      <div className="space-y-3">
                        <div className="flex items-center">
                          <User className="mr-3 text-gray-500" size={16} />
                          <div>
                            <p className="text-sm text-gray-500">Full Name</p>
                            <p className="font-semibold">{verificationData.employee_name}</p>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <Mail className="mr-3 text-gray-500" size={16} />
                          <div>
                            <p className="text-sm text-gray-500">Email</p>
                            <p className="font-semibold">{verificationData.employee_email}</p>
                          </div>
                        </div>
                        {verificationData.employee_phone && (
                          <div className="flex items-center">
                            <Phone className="mr-3 text-gray-500" size={16} />
                            <div>
                              <p className="text-sm text-gray-500">Phone</p>
                              <p className="font-semibold">{verificationData.employee_phone}</p>
                            </div>
                          </div>
                        )}
                        {verificationData.employee_address && (
                          <div className="flex items-start">
                            <MapPin className="mr-3 text-gray-500 mt-1" size={16} />
                            <div>
                              <p className="text-sm text-gray-500">Address</p>
                              <p className="font-semibold">{verificationData.employee_address}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6">
                      <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                        <Briefcase className="mr-2 text-green-600" />
                        Position Details
                      </h3>
                      <div className="space-y-3">
                        <div className="flex items-center">
                          <Briefcase className="mr-3 text-gray-500" size={16} />
                          <div>
                            <p className="text-sm text-gray-500">Position</p>
                            <p className="font-semibold">{verificationData.position}</p>
                          </div>
                        </div>
                        {verificationData.department && (
                          <div className="flex items-center">
                            <FileText className="mr-3 text-gray-500" size={16} />
                            <div>
                              <p className="text-sm text-gray-500">Department</p>
                              <p className="font-semibold">{verificationData.department}</p>
                            </div>
                          </div>
                        )}
                        <div className="flex items-center">
                          <DollarSign className="mr-3 text-gray-500" size={16} />
                          <div>
                            <p className="text-sm text-gray-500">Monthly Salary</p>
                            <p className="font-semibold text-green-600 text-lg">
                              {formatCurrency(verificationData.salary)}
                            </p>
                          </div>
                        </div>
                        {verificationData.reporting_manager && (
                          <div className="flex items-center">
                            <User className="mr-3 text-gray-500" size={16} />
                            <div>
                              <p className="text-sm text-gray-500">Reporting Manager</p>
                              <p className="font-semibold">{verificationData.reporting_manager}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Offer Details */}
                  <div className="space-y-6">
                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6">
                      <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                        <FileText className="mr-2 text-purple-600" />
                        Offer Details
                      </h3>
                      <div className="space-y-3">
                        <div className="flex items-center">
                          <Shield className="mr-3 text-gray-500" size={16} />
                          <div>
                            <p className="text-sm text-gray-500">Offer ID</p>
                            <p className="font-semibold font-mono">{verificationData.offer_id}</p>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <Calendar className="mr-3 text-gray-500" size={16} />
                          <div>
                            <p className="text-sm text-gray-500">Issue Date</p>
                            <p className="font-semibold">{formatDate(verificationData.issue_date)}</p>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <Calendar className="mr-3 text-gray-500" size={16} />
                          <div>
                            <p className="text-sm text-gray-500">Start Date</p>
                            <p className="font-semibold">{formatDate(verificationData.start_date)}</p>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <Clock className="mr-3 text-gray-500" size={16} />
                          <div>
                            <p className="text-sm text-gray-500">Probation Period</p>
                            <p className="font-semibold">{verificationData.probation_period}</p>
                          </div>
                        </div>
                        {verificationData.working_hours && (
                          <div className="flex items-center">
                            <Clock className="mr-3 text-gray-500" size={16} />
                            <div>
                              <p className="text-sm text-gray-500">Working Hours</p>
                              <p className="font-semibold">{verificationData.working_hours}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {verificationData.benefits && (
                      <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-6">
                        <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                          <DollarSign className="mr-2 text-yellow-600" />
                          Benefits & Perks
                        </h3>
                        <p className="text-gray-700 leading-relaxed">{verificationData.benefits}</p>
                      </div>
                    )}

                    {verificationStatus === 'expired' && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
                        <div className="flex items-start">
                          <Clock className="mr-3 text-yellow-600 mt-1" size={20} />
                          <div>
                            <h4 className="font-semibold text-yellow-800 mb-2">Offer Expired</h4>
                            <p className="text-yellow-700 mb-2">
                              This offer expired on {formatDate(verificationData.expiry_date)}
                            </p>
                            <p className="text-yellow-600 text-sm">
                              Please contact HR for assistance or to request a new offer letter.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Additional Terms */}
                {verificationData.additional_terms && (
                  <div className="mt-8 bg-gray-50 rounded-xl p-6">
                    <h3 className="text-xl font-bold text-gray-800 mb-4">Additional Terms & Conditions</h3>
                    <p className="text-gray-700 leading-relaxed">{verificationData.additional_terms}</p>
                  </div>
                )}

                {/* Company Info */}
                <div className="mt-8 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl p-6">
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div>
                      <h3 className="text-xl font-bold mb-2 flex items-center">
                        <Building className="mr-2" size={20} />
                        {companyInfo?.company_name || 'Syed Solar Energy'}
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 opacity-90 text-sm">
                        <div className="flex items-center">
                          <MapPin size={14} className="mr-1" />
                          <span>{companyInfo?.company_address || 'Jalil Market Umar Gull Chowck, Bara Road, Peshawar'}</span>
                        </div>
                        <div className="flex items-center">
                          <Mail size={14} className="mr-1" />
                          <span>{companyInfo?.company_email || 'sales@syedsolarenergy.com'}</span>
                        </div>
                        <div className="flex items-center">
                          <Phone size={14} className="mr-1" />
                          <span>{companyInfo?.company_phone || '03075596695'}</span>
                        </div>
                        <div className="flex items-center">
                          <Globe size={14} className="mr-1" />
                          <span>{companyInfo?.company_website || 'www.syedsolarenergy.com'}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm opacity-75">Verified on</p>
                      <p className="font-semibold">{new Date().toLocaleString()}</p>
                      <p className="text-xs opacity-75 mt-1">
                        Verification #{verificationData.verification_count || 1}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                {verificationStatus === 'valid' && (
                  <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
                    <button className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center">
                      <Download className="mr-2" size={20} />
                      Download PDF
                    </button>
                    <button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center">
                      <Eye className="mr-2" size={20} />
                      View Full Letter
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* No Search Results */}
        {!loading && !verificationStatus && !offerId && (
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <Search className="mx-auto text-gray-400 mb-4" size={64} />
            <h3 className="text-2xl font-bold text-gray-800 mb-4">Enter Offer ID to Verify</h3>
            <p className="text-gray-600 mb-6">
              Please enter a valid offer letter ID to verify its authenticity and view details.
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left max-w-md mx-auto">
              <h4 className="font-semibold text-blue-800 mb-2">Offer ID Format:</h4>
              <p className="text-blue-700 text-sm font-mono">SSE-OL-YYYYMMDD-XXXX</p>
              <p className="text-blue-700 text-xs mt-2">Example: SSE-OL-20250901-1234</p>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-12 text-center text-gray-500 text-sm">
          <p>© {new Date().getFullYear()} Syed Solar Energy. All rights reserved.</p>
          <p className="mt-2">
            This verification system ensures the authenticity of employment offers issued by Syed Solar Energy.
          </p>
        </div>
      </div>
    </div>
  );
};

export default OfferVerification;