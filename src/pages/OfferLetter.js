import React, { useState, useRef, useEffect } from 'react';
import { FileDown, Trash2, CheckCircle, Loader, Building, MapPin, Phone, Mail, Globe, Calendar, User, DollarSign, Briefcase } from 'lucide-react';
import { supabase } from '../supabaseClient';
import logo from "../assets/logo.png";

// --- Helper: SHA-256 hashing ---
const toHex = (buffer) =>
  Array.from(new Uint8Array(buffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');

const computeSHA256Str = async (str) => {
  const enc = new TextEncoder().encode(str);
  const buf = await crypto.subtle.digest('SHA-256', enc);
  return toHex(buf);
};

// --- Helper: random electronic sign code (e.g., SSE-ES-7XK4N9Q2TD) ---
const generateElectronicSignCode = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no confusing O/0/I/1
  let out = '';
  for (let i = 0; i < 10; i++) {
    out += chars[Math.floor(Math.random() * chars.length)];
  }
  return `SSE-ES-${out}`;
};

// --- Helper: build signature metadata ---
const buildSignatureMeta = async (offerId, signer, formData) => {
  const signedAt = new Date().toISOString();
  const payload = JSON.stringify({
    offerId,
    signerName: signer.name,
    signerTitle: signer.title,
    signerEmail: signer.email,
    signedAt,
    employeeName: formData.employeeName,
    position: formData.position,
    salary: formData.salary,
    startDate: formData.startDate
  });




  const signatureHash = await computeSHA256Str(payload);
  const verificationUrl = `${window.location.origin}/verify-offer/${offerId}?h=${signatureHash}`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(verificationUrl)}`;
  return { signedAt, signatureHash, verificationUrl, qrUrl };
};

const OfferLetter = () => {
  const [formData, setFormData] = useState({
    employeeName: '',
    employeeEmail: '',
    employeePhone: '',
    employeeAddress: '',
    position: '',
    department: '',
    salary: '',
    startDate: '',
    joiningDate: '',
    benefits: '',
    workingHours: '',
    probationPeriod: '3 months',
    reportingManager: '',
    additionalTerms: ''
  });

  const [companyInfo, setCompanyInfo] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [offerLetters, setOfferLetters] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState('');
  const [loadingOffers, setLoadingOffers] = useState(true);
  const [signer, setSigner] = useState({
    name: 'Authorized Signatory',
    title: 'HR Manager',
    email: '',
    id: null
  });
  
  const pdfRef = useRef(null);

  // Load company info, departments, and offer letters from Supabase
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch company settings
        const { data: companyData, error: companyError } = await supabase
          .from('company_settings')
          .select('*')
          .single();
        
        if (companyError) {
          console.error('Company settings error:', companyError);
        } else if (companyData) {
          setCompanyInfo(companyData);
          
          // Set signer info from company settings if available
          setSigner(prev => ({
            ...prev,
            name: companyData.authorized_signatory_name || prev.name,
            title: companyData.authorized_signatory_title || prev.title,
            email: companyData.authorized_signatory_email || companyData.company_email || prev.email
          }));
        }
        
        // Fetch departments
        const { data: deptData, error: deptError } = await supabase
          .from('departments')
          .select('*')
          .eq('is_active', true)
          .order('name');
        
        if (deptError) {
          console.error('Departments error:', deptError);
        } else if (deptData) {
          setDepartments(deptData);
        }

        // Fetch offer letters
        await fetchOfferLetters();
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    
    fetchData();
  }, []);

  const fetchOfferLetters = async () => {
    try {
      setLoadingOffers(true);
      const { data, error } = await supabase
        .from('offer_letters')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching offer letters:', error);
      } else if (data) {
        setOfferLetters(data);
      }
    } catch (error) {
      console.error('Exception fetching offer letters:', error);
    } finally {
      setLoadingOffers(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const generateOfferLetterId = () => {
    const date = new Date();
    return `SSE-OL-${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}-${Math.floor(1000 + Math.random() * 9000)}`;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  const calculateExpiryDate = () => {
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 7); // 7 days from now
    return expiryDate.toISOString().split('T')[0];
  };

  const handleSaveToDatabase = async () => {
    // Validate required fields
    const requiredFields = ['employeeName', 'employeeEmail', 'position', 'salary', 'startDate'];
    const missingFields = requiredFields.filter(field => !formData[field]);
    
    if (missingFields.length > 0) {
      setSaveStatus(`Please fill in required fields: ${missingFields.join(', ')}`);
      setTimeout(() => setSaveStatus(''), 3000);
      return null;
    }

    setIsSaving(true);
    const offerId = generateOfferLetterId();
    
    try {
      // Build signature metadata
      const { signedAt, signatureHash, verificationUrl, qrUrl } = 
        await buildSignatureMeta(offerId, signer, formData);

      const offerData = {
        offer_id: offerId,
        employee_name: formData.employeeName,
        employee_email: formData.employeeEmail,
        employee_phone: formData.employeePhone || null,
        employee_address: formData.employeeAddress || null,
        position: formData.position,
        department: formData.department || null,
        salary: parseFloat(formData.salary),
        start_date: formData.startDate,
        joining_date: formData.joiningDate || null,
        benefits: formData.benefits || null,
        working_hours: formData.workingHours || null,
        probation_period: formData.probationPeriod,
        reporting_manager: formData.reportingManager || null,
        additional_terms: formData.additionalTerms || null,
        expiry_date: calculateExpiryDate(),
        status: 'active',
        // Electronic signature fields
        signature_hash: signatureHash,
        signature_signed_at: signedAt,
        signature_signer_name: signer.name,
        signature_signer_title: signer.title,
        signature_method: 'sha256',
        signature_verification_url: verificationUrl,
        signature_qr_url: qrUrl,
        signed_by: signer.id || null
      };

      console.log('Attempting to save:', offerData);

      const { data, error } = await supabase
        .from('offer_letters')
        .insert([offerData])
        .select()
        .single();

      if (error) {
        console.error('Supabase error:', error);
        setSaveStatus(`Error saving to database: ${error.message}`);
        setTimeout(() => setSaveStatus(''), 5000);
        return null;
      }

      console.log('Successfully saved:', data);
      setSaveStatus('Offer letter saved successfully!');
      setTimeout(() => setSaveStatus(''), 3000);
      
      // Refresh the list
      await fetchOfferLetters();
      
      return data;
    } catch (error) {
      console.error('Exception saving to database:', error);
      setSaveStatus(`Error saving offer letter: ${error.message}`);
      setTimeout(() => setSaveStatus(''), 5000);
      return null;
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteOffer = async (offerId) => {
    if (!window.confirm('Are you sure you want to delete this offer letter?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('offer_letters')
        .delete()
        .eq('offer_id', offerId);

      if (error) {
        console.error('Delete error:', error);
        setSaveStatus(`Error deleting offer letter: ${error.message}`);
      } else {
        setSaveStatus('Offer letter deleted successfully');
        await fetchOfferLetters(); // Refresh the list
      }
      setTimeout(() => setSaveStatus(''), 3000);
    } catch (error) {
      console.error('Exception deleting offer:', error);
      setSaveStatus(`Error deleting offer letter: ${error.message}`);
      setTimeout(() => setSaveStatus(''), 3000);
    }
  };

  const generateProfessionalPDF = (offerData) => {
    const offerId = offerData?.offer_id || generateOfferLetterId();
    const currentDate = new Date().toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
    const eSignCode = generateElectronicSignCode();


    // Format signature date if available
    const signatureDate = offerData?.signature_signed_at 
      ? new Date(offerData.signature_signed_at).toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'long',
          year: 'numeric'
        })
      : currentDate;

    return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Offer Letter - ${offerData?.employee_name || formData.employeeName}</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: 'Inter', Arial, sans-serif;
          line-height: 1.6;
          color: #1a1a1a;
          background: white;
        }
        
        .container {
          max-width: 800px;
          margin: 0 auto;
          padding: 40px;
          background: white;
        }
        
        .letterhead {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 40px;
          padding-bottom: 20px;
          border-bottom: 3px solid #ffa12eff;
        }
        
        .company-info {
          display: flex;
          align-items: center;
        }
        
        .logo {
          width: 80px;
          height: 80px;
          margin-right: 20px;
          background: url('${logo}') no-repeat center center;
          background-size: contain;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        
        .company-details h1 {
          font-size: 28px;
          font-weight: 700;
          color: #1a1a1a;
          margin-bottom: 4px;
        }
        
        .company-details .tagline {
          font-size: 14px;
          color: #6b7280;
          font-weight: 500;
        }
        
        .contact-info {
          text-align: right;
          font-size: 12px;
          color: #6b7280;
          line-height: 1.8;
        }
        
        .contact-info div {
          margin-bottom: 2px;
        }
        
        .document-info {
          text-align: right;
          margin-bottom: 30px;
          font-size: 14px;
          color: #6b7280;
        }
        
        .title {
          text-align: center;
          font-size: 32px;
          font-weight: 700;
          color: #1a1a1a;
          margin-bottom: 40px;
          text-transform: uppercase;
          letter-spacing: 1px;
          position: relative;
        }
        
        .title::after {
          content: '';
          display: block;
          width: 120px;
          height: 4px;
          background: linear-gradient(90deg, #ffa12eff, #ffa12eff);
          margin: 12px auto 0;
          border-radius: 2px;
        }
        
        .greeting {
          font-size: 16px;
          margin-bottom: 30px;
          font-weight: 500;
        }
        
        .content {
          font-size: 14px;
          line-height: 1.8;
          margin-bottom: 30px;
          text-align: justify;
        }
        
        .position-details {
          background: #f8fafc;
          padding: 25px;
          border-radius: 12px;
          margin: 30px 0;
          border-left: 4px solid #ffa12eff;
        }
        
        .position-details h3 {
          font-size: 18px;
          font-weight: 600;
          color: #1a1a1a;
          margin-bottom: 20px;
        }
        
        .details-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 15px;
          font-size: 14px;
        }
        
        .details-grid div {
          padding: 8px 0;
        }
        
        .details-grid strong {
          color: #1a1a1a;
          font-weight: 600;
        }
        
        .section-title {
          font-size: 16px;
          font-weight: 600;
          color: #1a1a1a;
          margin-bottom: 12px;
          margin-top: 25px;
        }
        
        .terms-list {
          list-style: none;
          padding-left: 0;
        }
        
        .terms-list li {
          position: relative;
          padding-left: 20px;
          margin-bottom: 8px;
          font-size: 14px;
          line-height: 1.6;
        }
        
        .terms-list li::before {
          content: '•';
          color: #ffa12eff;
          font-size: 16px;
          position: absolute;
          left: 0;
          top: 0;
        }
        
        .signature-section {
          margin-top: 60px;
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
        }
        
        .signature-block {
          text-align: center;
        }
        
        .electronic-signature {
          color: #555;
          font-style: italic;
          margin-bottom: 5px;
          font-size: 14px;
        }
        
        .signature-label {
          border-top: 2px solid #6b7280;
          padding-top: 8px;
          font-size: 12px;
          color: #6b7280;
          width: 200px;
        }
        
        .signature-label strong {
          color: #1a1a1a;
          display: block;
          margin-bottom: 4px;
        }
        
        .qr-section {
          text-align: center;
        }
        
        .qr-code {
          width: 100px;
          height: 100px;
          margin-bottom: 8px;
          border: 2px solid #e5e7eb;
          border-radius: 8px;
        }
        
        .qr-label {
          font-size: 10px;
          color: #6b7280;
          line-height: 1.4;
        }
        
        .acceptance-section {
          margin-top: 50px;
          padding-top: 30px;
          border-top: 2px solid #e5e7eb;
          text-align: center;
        }
        
        .acceptance-title {
          font-size: 18px;
          font-weight: 600;
          color: #1a1a1a;
          margin-bottom: 20px;
        }
        
        .acceptance-text {
          font-size: 14px;
          color: #6b7280;
          margin-bottom: 30px;
        }
        
        .signature-lines {
          display: flex;
          justify-content: center;
          gap: 60px;
        }
        
        .signature-line {
          text-align: center;
        }
        
        .line {
          width: 150px;
          height: 2px;
          background: #6b7280;
          margin-bottom: 8px;
        }
        
        .line-label {
          font-size: 12px;
          color: #6b7280;
        }
        
        .highlight {
          color: #ffa12eff;
          font-weight: 600;
        }
        
        .amount {
          color: #059669;
          font-weight: 600;
        }
        
        .signature-hash {
          font-size: 10px;
          color: #6b7280;
          margin-top: 6px;
          word-break: break-all;
        }
        
        @media print {
          body { print-color-adjust: exact; }
          .container { padding: 20px; }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <!-- Letterhead -->
        <div class="letterhead">
          <div class="company-info">
            <div class="logo"></div>
            <div class="company-details">
              <h1>${companyInfo?.company_name || 'Syed Solar Energy'}</h1>
              <div class="tagline">صاف توانائی کے سفر کا روشن راستہ</div>

            </div>
          </div>
          <div class="contact-info">
            <div><strong>Address:</strong> ${companyInfo?.company_address || 'Jalil Market Umar Gull Chowck, Bara Road, Peshawar'}</div>
            <div><strong>Email:</strong> ${companyInfo?.company_email || 'sales@syedsolarenergy.com'}</div>
            <div><strong>Phone:</strong> ${companyInfo?.company_phone || '03075596695'}</div>
            <div><strong>Website:</strong> ${companyInfo?.company_website || 'www.syedsolarenergy.com'}</div>
          </div>
        </div>
        
        <!-- Document Info -->
        <div class="document-info">
          <div><strong>Date:</strong> ${currentDate}</div>
          <div><strong>Offer ID:</strong> <span class="highlight">${offerId}</span></div>
        </div>
        
        <!-- Title -->
        <h1 class="title">Employment Offer Letter</h1>
        
        <!-- Greeting -->
        <div class="greeting">
          Dear <strong>${offerData?.employee_name || formData.employeeName || '[Employee Name]'}</strong>,
        </div>
        
        <!-- Content -->
        <div class="content">
          We are delighted to extend this formal offer of employment with <strong>Syed Solar Energy</strong>. 
          After thorough evaluation of your qualifications, experience, and potential contribution to our organization, 
          we are confident that you will be an excellent addition to our growing team in the renewable energy sector.
        </div>
        
        <!-- Position Details -->
        <div class="position-details">
          <h3>Position Details & Compensation</h3>
          <div class="details-grid">
            <div><strong>Position:</strong> ${offerData?.position || formData.position || '[Position]'}</div>
            <div><strong>Department:</strong> ${offerData?.department || formData.department || '[Department]'}</div>
            <div><strong>Start Date:</strong> ${formatDate(offerData?.start_date || formData.startDate) || '[Start Date]'}</div>
            <div><strong>Reporting Manager:</strong> ${offerData?.reporting_manager || formData.reportingManager || '[Manager]'}</div>
            <div><strong>Monthly Salary:</strong> <span class="amount">${offerData?.salary ? formatCurrency(offerData.salary) : (formData.salary ? formatCurrency(formData.salary) : '[Salary]')}</span></div>
            <div><strong>Probation Period:</strong> ${offerData?.probation_period || formData.probationPeriod}</div>
          </div>
        </div>
        
        ${(offerData?.working_hours || formData.workingHours) ? `
        <div class="content">
          <strong>Working Hours:</strong> ${offerData?.working_hours || formData.workingHours}
        </div>
        ` : ''}
        
        ${(offerData?.benefits || formData.benefits) ? `
        <div class="section-title">Benefits & Compensation Package</div>
        <div class="content">
          ${offerData?.benefits || formData.benefits}
        </div>
        ` : ''}
        
        <div class="section-title">Terms & Conditions</div>
        <ul class="terms-list">
          <li>This employment offer is contingent upon successful completion of background verification and reference checks</li>
          <li>Your employment will be governed by company policies, procedures, and the employee handbook</li>
          <li>You will be required to sign confidentiality and non-disclosure agreements to protect company information</li>
          <li>Your performance will be evaluated during and after the probationary period as outlined above</li>
          <li>This position is subject to applicable labor laws and regulations of Pakistan</li>
          ${(offerData?.additional_terms || formData.additionalTerms) ? `<li>${offerData?.additional_terms || formData.additionalTerms}</li>` : ''}
        </ul>
        
        <div class="content">
          Please confirm your acceptance of this offer by signing and returning a copy of this letter by 
          <strong class="highlight">${new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'long',
            year: 'numeric'
          })}</strong>. Upon your acceptance, we will proceed with the onboarding process and provide you with all necessary documentation.
        </div>
        
        <div class="content">
          We are excited about the prospect of you joining our team and contributing to our mission of providing 
          sustainable energy solutions. We look forward to a successful and mutually beneficial working relationship.
        </div>
        
<!-- Signature Section -->
<div class="signature-section">
  <!-- Left Side: Electronic Signature & Signer Info -->
  <div class="signature-left">
    <div class="electronic-signature">
<span class="highlight">${eSignCode}</span> — Electronically Signed
    </div>
    <div class="signature-label">
      <strong>${offerData?.signature_signer_name || signer.name}</strong>
      ${offerData?.signature_signer_title || signer.title}<br/>
      Syed Solar Energy
      <div class="signature-hash">
        Signed at: ${offerData?.signature_signed_at ? new Date(offerData.signature_signed_at).toLocaleString() : signatureDate}
      </div>
    </div>
  </div>

  <!-- Right Side: QR Code -->
  <div class="signature-right">
    <img src="${offerData?.signature_qr_url || `https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(`${window.location.origin}/verify-offer/${offerId}`)}`}" alt="Verification QR Code" class="qr-code" />
    <div class="qr-label">
      Scan for verification<br/>
      <strong>ID: ${offerId}</strong>
    </div>
  </div>
</div>

        
        <!-- Employee Acceptance -->
        <div class="acceptance-section">
          <div class="acceptance-title">Employee Acceptance</div>
          <div class="acceptance-text">
            I, <strong>${offerData?.employee_name || formData.employeeName || '________________'}</strong>, 
            hereby accept the terms and conditions outlined in this employment offer letter.
          </div>
          <div class="signature-lines">
            <div class="signature-line">
              <div class="line"></div>
              <div class="line-label">Employee Signature</div>
            </div>
            <div class="signature-line">
              <div class="line"></div>
              <div class="line-label">Date</div>
            </div>
          </div>
        </div>
      </div>
    </body>
    </html>
    `;
  };

  const handleGeneratePDF = async (existingOfferData = null) => {
    let offerData = null;
    
    if (existingOfferData) {
      // Use existing offer data
      offerData = existingOfferData;
    } else {
      // Save new offer to database first
      offerData = await handleSaveToDatabase();
      if (!offerData) {
        return; // Save failed, error message already shown
      }
    }
    
    setIsGenerating(true);
    
    try {
      // Generate HTML content
      const htmlContent = generateProfessionalPDF(offerData);
      
      // Create a new window for PDF generation
      const printWindow = window.open('', '_blank', 'width=800,height=600');
      if (!printWindow) {
        throw new Error('Unable to open print window. Please allow popups for this site.');
      }
      
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      
      // Wait for content to load then trigger print
      printWindow.onload = () => {
        setTimeout(() => {
          printWindow.print();
          // Note: Don't close the window automatically as user might want to save as PDF
        }, 1000);
      };
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      setSaveStatus(`Error generating PDF: ${error.message}`);
      setTimeout(() => setSaveStatus(''), 5000);
    } finally {
      setIsGenerating(false);
    }
  };

  const clearForm = () => {
    setFormData({
      employeeName: '',
      employeeEmail: '',
      employeePhone: '',
      employeeAddress: '',
      position: '',
      department: '',
      salary: '',
      startDate: '',
      joiningDate: '',
      benefits: '',
      workingHours: '',
      probationPeriod: '3 months',
      reportingManager: '',
      additionalTerms: ''
    });
    setSaveStatus('');
  };

  return (
    <div className="space-y-6">
      {/* Status Messages */}
      {saveStatus && (
        <div className={`p-4 rounded-lg ${
          saveStatus.includes('Error') || saveStatus.includes('error') 
            ? 'bg-red-50 text-red-700 border border-red-200' 
            : 'bg-green-50 text-green-700 border border-green-200'
        }`}>
          <div className="flex items-center">
            {saveStatus.includes('Error') || saveStatus.includes('error') ? (
              <span className="mr-2">⚠️</span>
            ) : (
              <CheckCircle className="mr-2" size={16} />
            )}
            {saveStatus}
          </div>
        </div>
      )}

      {/* Form Fields */}
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Employee Name *
          </label>
          <input
            type="text"
            name="employeeName"
            value={formData.employeeName}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            placeholder="Enter full name"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email Address *
          </label>
          <input
            type="email"
            name="employeeEmail"
            value={formData.employeeEmail}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            placeholder="employee@email.com"
            required
          />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Phone Number
          </label>
          <input
            type="tel"
            name="employeePhone"
            value={formData.employeePhone}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            placeholder="03XX-XXXXXXX"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Position *
          </label>
          <input
            type="text"
            name="position"
            value={formData.position}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            placeholder="e.g., Sales Manager"
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Address
        </label>
        <textarea
          name="employeeAddress"
          value={formData.employeeAddress}
          onChange={handleInputChange}
          rows="3"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
          placeholder="Complete address"
        />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Department
          </label>
          <select
            name="department"
            value={formData.department}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
          >
            <option value="">Select Department</option>
            {departments.map(dept => (
              <option key={dept.id} value={dept.name}>{dept.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Monthly Salary (PKR) *
          </label>
          <input
            type="number"
            name="salary"
            value={formData.salary}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            placeholder="50000"
            required
          />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Start Date *
          </label>
          <input
            type="date"
            name="startDate"
            value={formData.startDate}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Reporting Manager
          </label>
          <input
            type="text"
            name="reportingManager"
            value={formData.reportingManager}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            placeholder="Manager Name"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Benefits & Perks
        </label>
        <textarea
          name="benefits"
          value={formData.benefits}
          onChange={handleInputChange}
          rows="3"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
          placeholder="Health insurance, provident fund, annual bonuses, etc."
        />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Working Hours
          </label>
          <input
            type="text"
            name="workingHours"
            value={formData.workingHours}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            placeholder="9:00 AM - 5:00 PM"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Probation Period
          </label>
          <select
            name="probationPeriod"
            value={formData.probationPeriod}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
          >
            <option value="1 month">1 Month</option>
            <option value="2 months">2 Months</option>
            <option value="3 months">3 Months</option>
            <option value="6 months">6 Months</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Additional Terms & Conditions
        </label>
        <textarea
          name="additionalTerms"
          value={formData.additionalTerms}
          onChange={handleInputChange}
          rows="4"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
          placeholder="Any additional terms, policies, or conditions..."
        />
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 pt-6">
        <button
          onClick={() => handleGeneratePDF()}
          disabled={isGenerating || isSaving || !formData.employeeName || !formData.position || !formData.salary || !formData.startDate}
          className="flex-1 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center"
        >
          {isGenerating || isSaving ? (
            <>
              <Loader className="mr-2 animate-spin" size={20} />
              {isSaving ? 'Saving...' : 'Generating...'}
            </>
          ) : (
            <>
              <FileDown className="mr-2" size={20} />
              Generate PDF
            </>
          )}
        </button>
        <button
          onClick={clearForm}
          disabled={isGenerating || isSaving}
          className="flex-1 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 disabled:opacity-50 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center"
        >
          Clear Form
        </button>
      </div>

      {/* Saved Offers List */}
      <div className="mt-12">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Previous Offer Letters</h3>
        
        {loadingOffers ? (
          <div className="flex items-center justify-center py-8">
            <Loader className="animate-spin mr-2" size={20} />
            Loading offers...
          </div>
        ) : offerLetters.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No offer letters found. Create your first one above!
          </div>
        ) : (
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Employee
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Position
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Department
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Salary
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Start Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {offerLetters.map((offer) => (
                    <tr key={offer.offer_id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <User className="mr-2 text-gray-400" size={16} />
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {offer.employee_name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {offer.employee_email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-900">
                          <Briefcase className="mr-2 text-gray-400" size={16} />
                          {offer.position}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-900">
                          <Building className="mr-2 text-gray-400" size={16} />
                          {offer.department || 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-900">
                          <DollarSign className="mr-2 text-gray-400" size={16} />
                          {formatCurrency(offer.salary)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-900">
                          <Calendar className="mr-2 text-gray-400" size={16} />
                          {formatDate(offer.start_date)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          offer.status === 'active' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {offer.status || 'Active'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleGeneratePDF(offer)}
                            className="text-blue-600 hover:text-blue-900 flex items-center"
                            title="Generate PDF"
                          >
                            <FileDown size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteOffer(offer.offer_id)}
                            className="text-red-600 hover:text-red-900 flex items-center ml-4"
                            title="Delete Offer"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OfferLetter;