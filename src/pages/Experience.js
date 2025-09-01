import React, { useState, useEffect } from 'react';
import { FileDown, Trash2, CheckCircle, Loader, Building, MapPin, Phone, Mail, Globe, Calendar, User, Plus, X } from 'lucide-react';
import { supabase } from '../supabaseClient';
import logo from "../assets/logo.png";

// Helper functions
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
  return `SSE-EC-${out}`;
};

const buildSignatureMeta = async (certificateId, signer, formData) => {
  // Use the issueDate provided or fallback to today (ISO date)
  const issueDateISO = formData?.issueDate || new Date().toISOString().split('T')[0];

  // Use a fixed midday UTC time to avoid timezone surprises when converting to local strings
  const signedAt = new Date(issueDateISO + 'T12:00:00Z').toISOString();

  const payload = JSON.stringify({
    certificateId,
    signerName: signer.name,
    signerTitle: signer.title,
    signerEmail: signer.email,
    signedAt,
    candidateName: formData.candidateName,
    fatherName: formData.fatherName,
    issueDate: issueDateISO,
    projects: formData.projects || []
  });

  const signatureHash = await computeSHA256Str(payload);
  const verificationUrl = `${window.location.origin}/verify-experience/${certificateId}?h=${signatureHash}`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(verificationUrl)}`;
  return { signedAt, signatureHash, verificationUrl, qrUrl };
};


const Experience = () => {
  const [formData, setFormData] = useState({
    issueDate: new Date().toISOString().split('T')[0],
    candidateName: '',
    fatherName: '',
    email: '',
    contact: '',
    address: '',
    projects: [
      {
        projectName: '',
        projectDetails: '',
        candidateRole: '',
        performance: ''
      }
    ]
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
        .from('experience_certificates')
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

  const handleProjectChange = (index, field, value) => {
    const updatedProjects = [...formData.projects];
    updatedProjects[index][field] = value;
    setFormData(prev => ({
      ...prev,
      projects: updatedProjects
    }));
  };

  const addProject = () => {
    setFormData(prev => ({
      ...prev,
      projects: [
        ...prev.projects,
        {
          projectName: '',
          projectDetails: '',
          candidateRole: '',
          performance: ''
        }
      ]
    }));
  };

  const removeProject = (index) => {
    if (formData.projects.length > 1) {
      const updatedProjects = [...formData.projects];
      updatedProjects.splice(index, 1);
      setFormData(prev => ({
        ...prev,
        projects: updatedProjects
      }));
    }
  };

  const generateCertificateId = () => {
    const date = new Date();
    return `SSE-EC-${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}-${Math.floor(1000 + Math.random() * 9000)}`;
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
    const requiredFields = ['candidateName', 'fatherName', 'email'];
    const missingFields = requiredFields.filter(field => !formData[field]);
    
    // Check if all projects have required fields
    const incompleteProjects = formData.projects.some(project => 
      !project.projectName || !project.candidateRole
    );
    
    if (missingFields.length > 0 || incompleteProjects) {
      setSaveStatus(`Please fill in all required fields${incompleteProjects ? ' and complete all projects' : ''}`);
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
        candidate_name: formData.candidateName,
        father_name: formData.fatherName,
        email: formData.email,
        contact: formData.contact || null,
        address: formData.address || null,
        projects: formData.projects,
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
        .from('experience_certificates')
        .insert([certificateData])
        .select()
        .single();

      if (error) {
        console.error('Supabase error:', error);
        setSaveStatus(`Error saving to database: ${error.message}`);
        setTimeout(() => setSaveStatus(''), 5000);
        return null;
      }

      setSaveStatus('Experience certificate saved successfully!');
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
    if (!window.confirm('Are you sure you want to delete this experience certificate?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('experience_certificates')
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
  const eSignCode = generateElectronicSignCode();

  // Determine issue date (ISO) and display string
  const issueDateISO = certificateData?.issue_date || formData.issueDate || new Date().toISOString().split('T')[0];
  const displayIssueDate = formatDate(issueDateISO);

  // Signature date shown — prefer stored signature time, else use issue date
  const signatureDate = certificateData?.signature_signed_at
    ? formatDate(certificateData.signature_signed_at)
    : displayIssueDate;

  // Projects list (from saved certificate or current form)
  const projects = (certificateData?.projects || formData.projects || []);
  const projectColumns = projects.length > 2 ? 2 : 1;

  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="UTF-8">
    <title>Experience Certificate - ${certificateData?.candidate_name || formData.candidateName}</title>
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }

      @page { size: A4; margin: 18mm; }
      html, body { height: 100%; margin: 0; padding: 0; -webkit-print-color-adjust: exact; }
      body {
        font-family: 'Inter', Arial, sans-serif;
        font-size: 12px;
        line-height: 1.5;
        color: #1a1a1a;
        background: white;
      }

      .container {
        max-width: 800px;
        margin: 0 auto;
        padding: 16px;
        background: white;
      }

      /* Header */
      .letterhead {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 16px;
        padding-bottom: 8px;
        border-bottom: 2px solid #ff6b35;
      }

      .company-info {
        display: flex;
        align-items: center;
      }

      .logo {
        width: 70px;
        height: 70px;
        margin-right: 18px;
        background: url('${logo}') no-repeat center center;
        background-size: contain;
        border-radius: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .company-details h1 {
        font-size: 24px;
        font-weight: 700;
        color: #1a1a1a;
        margin-bottom: 3px;
      }

      .company-details .tagline {
        font-size: 12px;
        color: #6b7280;
        font-weight: 500;
      }

      .contact-info {
        text-align: right;
        font-size: 11px;
        color: #6b7280;
        line-height: 1.5;
      }

      .contact-info div {
        margin-bottom: 1px;
      }

      .document-info {
        text-align: right;
        margin-bottom: 20px;
        font-size: 12px;
        color: #6b7280;
      }

      /* Title */
      .title {
        text-align: center;
        font-size: 28px;
        font-weight: 700;
        color: #1a1a1a;
        margin-bottom: 16px;
        text-transform: uppercase;
        letter-spacing: 1px;
        position: relative;
      }

      .title::after {
        content: '';
        display: block;
        width: 100px;
        height: 3px;
        background: linear-gradient(90deg, #ff6b35, #f7931e);
        margin: 8px auto 0;
        border-radius: 2px;
      }

      /* Content */
      .content {
        font-size: 12px;
        line-height: 1.4;
        margin-bottom: 12px;
        text-align: justify;
      }

      .candidate-details {
        background: #f8fafc;
        padding: 12px;
        border-radius: 8px;
        margin: 12px 0;
        border-left: 3px solid #ff6b35;
      }

      .candidate-details h3 {
        font-size: 16px;
        font-weight: 600;
        color: #1a1a1a;
        margin-bottom: 12px;
      }

      .details-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 10px;
        font-size: 12px;
      }

      .details-grid div {
        padding: 5px 0;
      }

      .details-grid strong {
        color: #1a1a1a;
        font-weight: 600;
      }

      /* Projects */
      .projects-section { 
        margin: 12px 0; 
      }
      
      .projects-section h3 { 
        font-size: 16px; 
        font-weight: 600;
        color: #1a1a1a;
        margin-bottom: 10px; 
        padding-bottom: 5px; 
        border-bottom: 2px solid #ff6b35;
      }

      .projects-grid {
        display: grid;
        grid-template-columns: repeat(${projectColumns}, 1fr);
        gap: 10px;
      }

      .project-item {
        padding: 10px;
        border-radius: 8px;
        background: #f8fafc;
        border-left: 3px solid #ff6b35;
        border: 1px solid #e5e7eb;
        transition: all 0.2s ease;
      }

      .project-item:hover {
        transform: translateY(-1px);
        box-shadow: 0 3px 8px rgba(255, 107, 53, 0.1);
      }

      .project-name { 
        font-weight: 600; 
        color: #1a1a1a; 
        font-size: 13px; 
        margin-bottom: 6px;
      }

      .project-details, .project-performance {
        color: #4b5563;
        font-size: 12px;
        margin-bottom: 6px;
        line-height: 1.3;
      }

      .project-role { 
        font-style: italic; 
        color: #6b7280; 
        font-size: 12px; 
        margin-bottom: 6px;
      }

      .project-details strong,
      .project-performance strong,
      .project-role strong {
        color: #ff6b35;
        font-weight: 600;
      }

      /* Signature */
      .signature-section {
        margin-top: 40px;
        display: flex;
        justify-content: space-between;
        align-items: flex-end;
      }

      .electronic-signature {
        color: #555;
        font-style: italic;
        margin-bottom: 4px;
        font-size: 12px;
      }

      .electronic-signature span {
        color: #ff6b35;
        font-weight: 600;
        font-family: 'Inter', monospace;
      }

      .signature-label {
        border-top: 2px solid #6b7280;
        padding-top: 6px;
        font-size: 11px;
        color: #6b7280;
        width: 200px;
      }

      .signature-label strong {
        color: #1a1a1a;
        display: block;
        margin-bottom: 3px;
      }

      .qr-section {
        text-align: center;
      }

      .qr-code {
        width: 70px;
        height: 70px;
        margin-bottom: 6px;
        border: 2px solid #e5e7eb;
        border-radius: 8px;
      }

      .qr-label {
        font-size: 10px;
        color: #6b7280;
        line-height: 1.3;
      }

      .signature-hash {
        font-size: 9px;
        color: #6b7280;
        margin-top: 4px;
        word-break: break-all;
      }

      .highlight {
        color: #ff6b35;
        font-weight: 600;
      }

      .footer { 
        margin-top: 20px; 
        text-align: center; 
        font-size: 9px; 
        color: #9ca3af; 
        border-top: 1px solid #e5e7eb;
        padding-top: 10px;
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

      <h1 class="title">Experience Certificate</h1>

      <div class="content">
        This is to certify that <strong>${certificateData?.candidate_name || formData.candidateName || '[Candidate Name]'}</strong>,
        S/O <strong>${certificateData?.father_name || formData.fatherName || '[Father Name]'}</strong>,
        has worked with <strong>${companyInfo?.company_name || 'Syed Solar Energy'}</strong> and has contributed to the projects below.
      </div>

      <div class="candidate-details">
        <h3>Candidate Details</h3>
        <div class="details-grid">
          <div><strong>Name:</strong> ${certificateData?.candidate_name || formData.candidateName || '[Candidate Name]'}</div>
          <div><strong>Father's Name:</strong> ${certificateData?.father_name || formData.fatherName || '[Father Name]'}</div>
          <div><strong>Email:</strong> ${certificateData?.email || formData.email || '[Email]'}</div>
          ${(certificateData?.contact || formData.contact) ? `<div><strong>Contact:</strong> ${certificateData?.contact || formData.contact}</div>` : ''}
          ${(certificateData?.address || formData.address) ? `<div style="grid-column:1 / -1;"><strong>Address:</strong> ${certificateData?.address || formData.address}</div>` : ''}
        </div>
      </div>

      <div class="projects-section">
        <h3>Project Contributions</h3>
        <div class="projects-grid">
          ${projects.map(project => `
            <div class="project-item">
              <div class="project-name">${project.projectName || '[Project Name]'}</div>
              ${project.projectDetails ? `<div class="project-details">${project.projectDetails}</div>` : ''}
              <div class="project-role"><strong>Role:</strong> ${project.candidateRole || '[Role]'}</div>
              ${project.performance ? `<div class="project-performance"><strong>Performance:</strong> ${project.performance}</div>` : ''}
            </div>
          `).join('')}
        </div>
      </div>

      <div class="content">
        During ${certificateData?.candidate_name?.split(' ')[0] || 'the candidate'}'s tenure with our organization,
        ${certificateData?.candidate_name?.split(' ')[0] || 'they'} demonstrated professionalism and valuable expertise.
        We appreciate ${certificateData?.candidate_name?.split(' ')[0] || 'their'} contributions and wish ${certificateData?.candidate_name?.split(' ')[0] || 'them'} the best.
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
            ${companyInfo?.company_name || 'Syed Solar Energy'}
            <div class="signature-hash">Signed at: ${signatureDate}</div>
          </div>
        </div>

        <!-- Right Side: QR Code -->
        <div class="signature-right">
          <img src="${certificateData?.signature_qr_url || `https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(`${window.location.origin}/verify-experience/${certificateId}`)}`}" alt="Verification QR Code" class="qr-code" />
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
      issueDate: new Date().toISOString().split('T')[0],
      candidateName: '',
      fatherName: '',
      email: '',
      contact: '',
      address: '',
      projects: [
        {
          projectName: '',
          projectDetails: '',
          candidateRole: '',
          performance: ''
        }
      ]
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

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Issue Date
        </label>
        <input
          type="date"
          name="issueDate"
          value={formData.issueDate}
          onChange={handleInputChange}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
        />
      </div>

      {/* Projects Section */}
      <div className="border-t pt-6 mt-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Projects</h3>
          <button
            type="button"
            onClick={addProject}
            className="flex items-center text-blue-600 hover:text-blue-800"
          >
            <Plus size={16} className="mr-1" />
            Add Project
          </button>
        </div>

        {formData.projects.map((project, index) => (
          <div key={index} className="bg-gray-50 p-4 rounded-lg mb-4 relative">
            {formData.projects.length > 1 && (
              <button
                type="button"
                onClick={() => removeProject(index)}
                className="absolute top-3 right-3 text-red-500 hover:text-red-700"
              >
                <X size={16} />
              </button>
            )}
            
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Project Name *
                </label>
                <input
                  type="text"
                  value={project.projectName}
                  onChange={(e) => handleProjectChange(index, 'projectName', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="Project name"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Candidate Role *
                </label>
                <input
                  type="text"
                  value={project.candidateRole}
                  onChange={(e) => handleProjectChange(index, 'candidateRole', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="Role in project"
                  required
                />
              </div>
            </div>
            
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Project Details
              </label>
              <textarea
                value={project.projectDetails}
                onChange={(e) => handleProjectChange(index, 'projectDetails', e.target.value)}
                rows="2"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                placeholder="Brief description of the project"
              />
            </div>
            
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Performance Evaluation
              </label>
              <textarea
                value={project.performance}
                onChange={(e) => handleProjectChange(index, 'performance', e.target.value)}
                rows="2"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                placeholder="Candidate's performance on this project"
              />
            </div>
          </div>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 pt-6">
        <button
          onClick={() => handleGeneratePDF()}
          disabled={isGenerating || isSaving || !formData.candidateName || !formData.fatherName || !formData.email || formData.projects.some(p => !p.projectName || !p.candidateRole)}
          className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center"
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
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Previous Experience Certificates</h3>
        
        {loadingCertificates ? (
          <div className="flex items-center justify-center py-8">
            <Loader className="animate-spin mr-2" size={20} />
            Loading certificates...
          </div>
        ) : certificates.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No experience certificates found. Create your first one above!
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
                      Projects
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Issue Date
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
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {certificate.projects?.length || 0} project(s)
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-900">
                          <Calendar className="mr-2 text-gray-400" size={16} />
                          {formatDate(certificate.issue_date)}
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

export default Experience;