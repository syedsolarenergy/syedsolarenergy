import React, { useState, useEffect } from 'react';
import { FileDown, Trash2, CheckCircle, Loader, Building, MapPin, Phone, Mail, Globe, Calendar, User, BookOpen } from 'lucide-react';
import { supabase } from '../supabaseClient';
import logo from "../assets/logo.png";

// Helper functions (same as offer letter)
const toHex = (buffer) =>
  Array.from(new Uint8Array(buffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');

const computeSHA256Str = async (str) => {
  const enc = new TextEncoder().encode(str);
  const buf = await crypto.subtle.digest('SHA-256', enc);
  return toHex(buf);
};

const generateElectronicSignCode = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let out = '';
  for (let i = 0; i < 10; i++) {
    out += chars[Math.floor(Math.random() * chars.length)];
  }
  return `SSE-IC-${out}`;
};

const buildSignatureMeta = async (certificateId, signer, formLike) => {
  // Accepts either formData (issueDate) or a saved certificate (issue_date)
  const issueDateISO =
    formLike?.issue_date ||
    formLike?.issueDate ||
    new Date().toISOString().split('T')[0];

  // Lock the signature timestamp to the Issue Date (avoid timezone weirdness with noon UTC)
  const signedAt = new Date(issueDateISO + 'T12:00:00Z').toISOString();

  const payload = JSON.stringify({
    certificateId,
    signerName: signer.name,
    signerTitle: signer.title,
    signerEmail: signer.email,
    signedAt,
    candidateName: formLike.candidateName,
    fatherName: formLike.fatherName,
    dob: formLike.dob,
    joiningDate: formLike.joiningDate,
    leavingDate: formLike.leavingDate
  });

  const signatureHash = await computeSHA256Str(payload);
  const verificationUrl = `${window.location.origin}/verify-internship/${certificateId}?h=${signatureHash}`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(verificationUrl)}`;

  return { signedAt, signatureHash, verificationUrl, qrUrl };
};


const Internship = () => {
  const [formData, setFormData] = useState({
    issueDate: '',
    joiningDate: '',
    leavingDate: '',
    candidateName: '',
    fatherName: '',
    dob: '',
    email: '',
    contact: '',
    address: '',
    universityName: ''
  });

  const [companyInfo, setCompanyInfo] = useState(null);
  const [certificates, setCertificates] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState('');
  const [loadingCertificates, setLoadingCertificates] = useState(true);
  const [signer, setSigner] = useState({
    name: 'Authorized Signatory',
    title: 'HR Manager',
    email: '',
    id: null
  });

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
          
          setSigner(prev => ({
            ...prev,
            name: companyData.authorized_signatory_name || prev.name,
            title: companyData.authorized_signatory_title || prev.title,
            email: companyData.authorized_signatory_email || companyData.company_email || prev.email
          }));
        }

        await fetchCertificates();
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    
    fetchData();
  }, []);

  const fetchCertificates = async () => {
    try {
      setLoadingCertificates(true);
      const { data, error } = await supabase
        .from('internship_certificates')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching certificates:', error);
      } else if (data) {
        setCertificates(data);
      }
    } catch (error) {
      console.error('Exception fetching certificates:', error);
    } finally {
      setLoadingCertificates(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const generateCertificateId = () => {
    const date = new Date();
    return `SSE-IC-${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}-${Math.floor(1000 + Math.random() * 9000)}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  const handleSaveToDatabase = async () => {
    const requiredFields = ['candidateName', 'fatherName', 'dob', 'email', 'joiningDate', 'leavingDate', 'issueDate'];
    const missingFields = requiredFields.filter(field => !formData[field]);
    
    if (missingFields.length > 0) {
      setSaveStatus(`Please fill in required fields: ${missingFields.join(', ')}`);
      setTimeout(() => setSaveStatus(''), 3000);
      return null;
    }

    setIsSaving(true);
    const certificateId = generateCertificateId();
    
    try {
      const { signedAt, signatureHash, verificationUrl, qrUrl } = 
        await buildSignatureMeta(certificateId, signer, formData);

      const certificateData = {
        certificate_id: certificateId,
        issue_date: formData.issueDate,
        joining_date: formData.joiningDate,
        leaving_date: formData.leavingDate,
        candidate_name: formData.candidateName,
        father_name: formData.fatherName,
        dob: formData.dob || null,
        email: formData.email,
        contact: formData.contact || null,
        address: formData.address || null,
        university_name: formData.universityName || null,
        status: 'active',
        signature_hash: signatureHash,
        signature_signed_at: signedAt,
        signature_signer_name: signer.name,
        signature_signer_title: signer.title,
        signature_method: 'sha256',
        signature_verification_url: verificationUrl,
        signature_qr_url: qrUrl,
        signed_by: signer.id || null
      };

      const { data, error } = await supabase
        .from('internship_certificates')
        .insert([certificateData])
        .select()
        .single();

      if (error) {
        console.error('Supabase error:', error);
        setSaveStatus(`Error saving to database: ${error.message}`);
        setTimeout(() => setSaveStatus(''), 5000);
        return null;
      }

      setSaveStatus('Internship certificate saved successfully!');
      setTimeout(() => setSaveStatus(''), 3000);
      
      await fetchCertificates();
      
      return data;
    } catch (error) {
      console.error('Exception saving to database:', error);
      setSaveStatus(`Error saving certificate: ${error.message}`);
      setTimeout(() => setSaveStatus(''), 5000);
      return null;
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteCertificate = async (certificateId) => {
    if (!window.confirm('Are you sure you want to delete this internship certificate?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('internship_certificates')
        .delete()
        .eq('certificate_id', certificateId);

      if (error) {
        console.error('Delete error:', error);
        setSaveStatus(`Error deleting certificate: ${error.message}`);
      } else {
        setSaveStatus('Certificate deleted successfully');
        await fetchCertificates();
      }
      setTimeout(() => setSaveStatus(''), 3000);
    } catch (error) {
      console.error('Exception deleting certificate:', error);
      setSaveStatus(`Error deleting certificate: ${error.message}`);
      setTimeout(() => setSaveStatus(''), 3000);
    }
  };

  const generateProfessionalPDF = (certificateData) => {
    const certificateId = certificateData?.certificate_id || generateCertificateId();
    const issueDateISO = certificateData?.issue_date || formData.issueDate || new Date().toISOString().split('T')[0];
    const displayIssueDate = formatDate(issueDateISO);

    const eSignCode = generateElectronicSignCode();

    return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Internship Certificate - ${certificateData?.candidate_name || formData.candidateName}</title>
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
        
        html, body {
        font-size: 13px; /* Reduced from default ~16px */
         }

        
.container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px; /* Reduced padding */
  background: white;
}

        
        .letterhead {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 20px;
          padding-bottom: 10px;
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
          margin-bottom: 20px;
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
        
        .content {
          font-size: 13px;
          line-height: 1.5;
          margin-bottom: 15px;
          text-align: justify;
        }
        
.candidate-details {
  background: #f8fafc;
  padding: 15px;
  border-radius: 10px;
  margin: 15px 0;
  border-left: 3px solid #ffa12eff;
}

        
        .candidate-details h3 {
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
        
        .internship-dates {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
          margin: 15px 0;
        }
        
        .date-card {
          background: #f8fafc;
          padding: 12px;
          border-radius: 12px;
          text-align: center;
          border-left: 4px solid #ffa12eff;
        }
        
        .date-card h4 {
          font-size: 16px;
          font-weight: 600;
          color: #1a1a1a;
          margin-bottom: 10px;
        }
        
        .date-card p {
          font-size: 18px;
          font-weight: 700;
          color: #059669;
        }
        
        .signature-section {
          margin-top: 60px;
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
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
          width: 80px;
          height: 80px;
          margin-bottom: 8px;
          border: 2px solid #e5e7eb;
          border-radius: 8px;
        }
        
        .qr-label {
          font-size: 10px;
          color: #6b7280;
          line-height: 1.4;
        }
        
        .signature-hash {
          font-size: 10px;
          color: #6b7280;
          margin-top: 6px;
          word-break: break-all;
        }
        
        .highlight {
          color: #ffa12eff;
          font-weight: 600;
        }
        
        @media print {
          body { print-color-adjust: exact; }
          .container { padding: 20px; }
          @page {
  size: A4;
  margin: 20mm;
}

body {
  margin: 0;
}

.container {
  page-break-inside: avoid;
}

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
        
        <div class="document-info">
          <div><strong>Date:</strong> ${displayIssueDate}</div>
        <div><strong>Certificate ID:</strong> <span class="highlight">${certificateId}</span></div>
       </div>

        
        <!-- Title -->
        <h1 class="title">Internship Certificate</h1>
        
        <!-- Content -->
        <div class="content">
          This is to certify that <strong>${certificateData?.candidate_name || formData.candidateName || '[Candidate Name]'}</strong>, 
          S/O <strong>${certificateData?.father_name || formData.fatherName || '[Father Name]'}</strong>,
          has successfully completed an internship program at <strong>Syed Solar Energy</strong>.
        </div>
        
        <!-- Candidate Details -->
        <div class="candidate-details">
          <h3>Candidate Details</h3>
          <div class="details-grid">
            <div><strong>Name:</strong> ${certificateData?.candidate_name || formData.candidateName || '[Candidate Name]'}</div>
            <div><strong>Father's Name:</strong> ${certificateData?.father_name || formData.fatherName || '[Father Name]'}</div>
            <div><strong>Date of Birth:</strong> ${formatDate(certificateData?.dob || formData.dob) || '[DOB]'}</div>
            <div><strong>Email:</strong> ${certificateData?.email || formData.email || '[Email]'}</div>
            ${(certificateData?.contact || formData.contact) ? `<div><strong>Contact:</strong> ${certificateData?.contact || formData.contact}</div>` : ''}
            ${(certificateData?.university_name || formData.universityName) ? `<div><strong>University:</strong> ${certificateData?.university_name || formData.universityName}</div>` : ''}
          </div>
        </div>
        
        <!-- Internship Dates -->
        <div class="internship-dates">
          <div class="date-card">
            <h4>Issue Date</h4>
            <p>${displayIssueDate}</p>
          </div>
          <div class="date-card">
            <h4>Joining Date</h4>
            <p>${formatDate(certificateData?.joining_date || formData.joiningDate)}</p>
          </div>
          <div class="date-card">
            <h4>Leaving Date</h4>
            <p>${formatDate(certificateData?.leaving_date || formData.leavingDate)}</p>
          </div>
          <div class="date-card">
            <h4>Duration</h4>
            <p>
              ${
                (certificateData?.joining_date && certificateData?.leaving_date) || 
                (formData.joiningDate && formData.leavingDate) 
                  ? Math.ceil(Math.abs(
                      new Date(certificateData?.leaving_date || formData.leavingDate) - 
                      new Date(certificateData?.joining_date || formData.joiningDate)
                    ) / (1000 * 60 * 60 * 24 * 7)) + ' weeks'
                  : '[Duration]'
              }
            </p>
          </div>
        </div>
        
        <div class="content">
          During the internship period, ${certificateData?.candidate_name || formData.candidateName || 'the candidate'} 
          demonstrated dedication, professionalism, and a strong willingness to learn. ${certificateData?.candidate_name?.split(' ')[0] || 'The candidate'} 
          actively participated in various projects and contributed significantly to our team's efforts in the renewable energy sector.
        </div>
        
        <div class="content">
          We appreciate ${certificateData?.candidate_name?.split(' ')[0] || 'the candidate'}'s hard work and commitment during 
          ${certificateData?.candidate_name?.split(' ')[0] || 'their'} time with us and wish ${certificateData?.candidate_name?.split(' ')[0] || 'them'} 
          the very best in ${certificateData?.candidate_name?.split(' ')[0] || 'their'} future endeavors.
        </div>
        
        <!-- Signature Section -->
        <div class="signature-section">
          <!-- Left Side: Electronic Signature & Signer Info -->
          <div class="signature-left">
            <div class="electronic-signature">
              <span class="highlight">${eSignCode}</span> — Electronically Signed
            </div>
            <div class="signature-label">
              <strong>${certificateData?.signature_signer_name || signer.name}</strong>
              ${certificateData?.signature_signer_title || signer.title}<br/>
              Syed Solar Energy
             <div class="signature-hash">
  Signed at: ${displayIssueDate}
</div>

            </div>
          </div>

          <!-- Right Side: QR Code -->
          <div class="signature-right">
            <img src="${certificateData?.signature_qr_url || `https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(`${window.location.origin}/verify-internship/${certificateId}`)}`}" alt="Verification QR Code" class="qr-code" />
            <div class="qr-label">
              Scan for verification<br/>
              <strong>ID: ${certificateId}</strong>
            </div>
          </div>
        </div>
              <div class="footer">
        This certificate was issued electronically and is verifiable through the QR code or at ${companyInfo?.company_website || 'www.syedsolarenergy.com'}.
      </div>

      </div>
    </body>
    </html>
    `;
  };

  const handleGeneratePDF = async (existingCertificateData = null) => {
    let certificateData = null;
    
    if (existingCertificateData) {
      certificateData = existingCertificateData;
    } else {
      certificateData = await handleSaveToDatabase();
      if (!certificateData) {
        return;
      }
    }
    
    setIsGenerating(true);
    
    try {
      const htmlContent = generateProfessionalPDF(certificateData);
      
      const printWindow = window.open('', '_blank', 'width=800,height=600');
      if (!printWindow) {
        throw new Error('Unable to open print window. Please allow popups for this site.');
      }
      
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      
      printWindow.onload = () => {
        setTimeout(() => {
          printWindow.print();
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
      issueDate: '',
      joiningDate: '',
      leavingDate: '',
      candidateName: '',
      fatherName: '',
      dob: '',
      email: '',
      contact: '',
      address: '',
      universityName: ''
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
            Candidate Name *
          </label>
          <input
            type="text"
            name="candidateName"
            value={formData.candidateName}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            placeholder="Enter full name"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Father's Name *
          </label>
          <input
            type="text"
            name="fatherName"
            value={formData.fatherName}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            placeholder="Enter father's name"
            required
          />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Date of Birth 
          </label>
          <input
            type="date"
            name="dob"
            value={formData.dob}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email Address *
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            placeholder="candidate@email.com"
            required
          />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Contact Number
          </label>
          <input
            type="tel"
            name="contact"
            value={formData.contact}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            placeholder="03XX-XXXXXXX"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            University Name
          </label>
          <input
            type="text"
            name="universityName"
            value={formData.universityName}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            placeholder="University name (if applicable)"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Address
        </label>
        <textarea
          name="address"
          value={formData.address}
          onChange={handleInputChange}
          rows="3"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
          placeholder="Complete address"
        />
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Issue Date *
          </label>
          <input
            type="date"
            name="issueDate"
            value={formData.issueDate}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            required 
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Joining Date *
          </label>
          <input
            type="date"
            name="joiningDate"
            value={formData.joiningDate}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Leaving Date *
          </label>
          <input
            type="date"
            name="leavingDate"
            value={formData.leavingDate}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            required
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 pt-6">
        <button
          onClick={() => handleGeneratePDF()}
          disabled={isGenerating || isSaving || !formData.candidateName || !formData.fatherName || !formData.dob || !formData.email || !formData.joiningDate || !formData.leavingDate}
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
              Generate Certificate
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

      {/* Saved Certificates List */}
      <div className="mt-12">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Previous Internship Certificates</h3>
        
        {loadingCertificates ? (
          <div className="flex items-center justify-center py-8">
            <Loader className="animate-spin mr-2" size={20} />
            Loading certificates...
          </div>
        ) : certificates.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No internship certificates found. Create your first one above!
          </div>
        ) : (
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Candidate
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Father's Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      University
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Joining Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Leaving Date
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
                  {certificates.map((certificate) => (
                    <tr key={certificate.certificate_id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <User className="mr-2 text-gray-400" size={16} />
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {certificate.candidate_name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {certificate.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {certificate.father_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {certificate.university_name || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-900">
                          <Calendar className="mr-2 text-gray-400" size={16} />
                          {formatDate(certificate.joining_date)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-900">
                          <Calendar className="mr-2 text-gray-400" size={16} />
                          {formatDate(certificate.leaving_date)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          certificate.status === 'active' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {certificate.status || 'Active'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleGeneratePDF(certificate)}
                            className="text-blue-600 hover:text-blue-900 flex items-center"
                            title="Generate PDF"
                          >
                            <FileDown size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteCertificate(certificate.certificate_id)}
                            className="text-red-600 hover:text-red-900 flex items-center ml-4"
                            title="Delete Certificate"
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

export default Internship;