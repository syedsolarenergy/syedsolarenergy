import React, { useState, useEffect, useRef } from 'react';
import { supabase } from "../supabaseClient";

const QuotationForm = () => {
  // State variables
  const [customer, setCustomer] = useState({ name: '', contact: '', email: '', address: '' });
  const [staffList] = useState(['Engr. Zubair', 'Engr. Aqib', 'Ahmed Khan', 'Ali Hassan']);
  const [staffName, setStaffName] = useState('');
  const [systemType, setSystemType] = useState('');
  const [location, setLocation] = useState('peshawar');
  const [quotationDate] = useState(new Date().toLocaleDateString('en-PK', { year: 'numeric', month: 'long', day: 'numeric' }));
  
  // Equipment states
  const [inverter, setInverter] = useState({ company: '', kw: '', quantity: 1, pricePerUnit: 0 });
  const [batteryType, setBatteryType] = useState('');
  const [batteryModel, setBatteryModel] = useState('');
  const [batteryQuantity, setBatteryQuantity] = useState(1);
  const [batteryPrice, setBatteryPrice] = useState(0);
  const [solarPanel, setSolarPanel] = useState({ company: '', watts: '', pricePerWatt: 0, quantity: 1 });
  const [stand, setStand] = useState({ type: '', pricePerStand: 0 });
  
  // Additional costs
  const [safety, setSafety] = useState(0);
  const [transport, setTransport] = useState(5000);
  const [isGreenmeterIncluded, setIsGreenmeterIncluded] = useState(false);
  const [isEngineerIncluded, setIsEngineerIncluded] = useState(false);
  const [labour, setLabour] = useState(20000);
  const [engineer, setEngineer] = useState(10000);
  const [Greenmeter, setGreenmeter] = useState(10000);
  
  // UI states
  const [savedQuotations, setSavedQuotations] = useState([]);
  const [showPreview, setShowPreview] = useState(false);
  const [showQuotationsList, setShowQuotationsList] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [currentQuotation, setCurrentQuotation] = useState(null);
  const [isSavingToDatabase, setIsSavingToDatabase] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Ref for PDF generation
  const quotationRef = useRef();
  
  // Equipment options
  const inverterCompanies = ['Inverex', 'Ziewnic', 'Growatt', 'Goodwe', '1On', 'Solax', 'Sunlife', 'longlife'];
  const inverterKW = ['1.2', '3.2', '3.6', '4.2', '5.5', '6.2', '8.0', '10', '12', '15'];
  const batteryTypes = ['Lithium', 'Tubular'];
  const lithium24 = ['Itell 2.56kWh', 'Ziewnic 2.56kWh'];
  const lithium48 = ['Itell 5.12kWh', 'Ziewnic 5.12kWh', 'Solax 5.12kWh', '1On 5.12kWh'];
  const tubular = ['Osaka 1800Ah', 'Osaka 2500Ah', 'Phoenix 1800Ah','Phoenix 2500Ah','Hawk 1800Ah','Hawk 2500Ah',];
  const panelCompanies = ['JA Solar', 'Canadian', 'Longi'];
  const panelWatts = ['585', '590', '605'];
  const standTypes = ['16 Gauge', '18 Gauge', 'Girder', 'L2 (2 panels)'];

  // --- SUPABASE INTEGRATION ---
  async function saveQuotationToSupabase(quotationData) {
    try {
      setIsSavingToDatabase(true);
      
      const supabaseData = {
        customer_name: quotationData.customer.name,
        customer_contact: quotationData.customer.contact,
        customer_email: quotationData.customer.email || null,
        customer_address: quotationData.customer.address,
        system_type: quotationData.systemType,
        panel_brand: quotationData.solarPanel.company,
        panel_watt: quotationData.solarPanel.watts,
        panel_quantity: quotationData.solarPanel.quantity,
        panel_total: getPanelPrice() * quotationData.solarPanel.quantity,
        inverter_type: quotationData.inverter.company,
        inverter_size: `${quotationData.inverter.kw}kW`,
        inverter_total: quotationData.inverter.quantity * quotationData.inverter.pricePerUnit,
        battery_type: batteryType || null,
        battery_model: quotationData.batteryModel || null,
        battery_quantity: quotationData.batteryQuantity || null,
        battery_total: (quotationData.batteryQuantity || 0) * (quotationData.batteryPrice || 0),
        stand_type: quotationData.stand.type,
        stand_quantity: getStandQty(),
        stand_total: getStandQty() * quotationData.stand.pricePerStand,
        safety_charges: quotationData.safety,
        transport_charges: quotationData.transport,
        installation_charges: quotationData.labour,
        green_meter: isGreenmeterIncluded,
        green_meter_charges: quotationData.Greenmeter || 0,
        total_amount: quotationData.total,
        quotation_date: new Date().toISOString(),
        created_at: new Date().toISOString(),
        staff_name: quotationData.staff,
        location: quotationData.location,
        quotation_id: quotationData.id,
        engineer_charges: quotationData.engineer || 0,
        follow_up_status: quotationData.followUpStatus || 'Pending'
      };

      const { data, error } = await supabase
        .from("quotations")
        .insert([supabaseData])
        .select();

      if (error) {
        console.error("Supabase error:", error);
        let errorMessage = "Quotation generated successfully, but couldn't save to database.\n\n";
        
        if (error.code === '42P01') {
          errorMessage += "Issue: Table 'quotations' doesn't exist. Please create the table first.";
        } else if (error.code === '42501') {
          errorMessage += "Issue: Permission denied. Please check Row Level Security policies.";
        } else if (error.message?.includes('violates not-null constraint')) {
          errorMessage += "Issue: Missing required field. Please check all required fields are filled.";
        } else if (error.message?.includes('column') && error.message?.includes('does not exist')) {
          errorMessage += "Issue: Database column mismatch. Please update table structure.";
        } else {
          errorMessage += `Issue: ${error.message}`;
        }
        
        alert(errorMessage);
        return null;
      } else {
        console.log("✅ Quotation saved to Supabase successfully:", data);
        return data[0];
      }
    } catch (err) {
      console.error("Unexpected Supabase error:", err);
      let errorMessage = "Quotation generated successfully, but couldn't save to database.\n\n";
      
      if (err.message?.includes('supabase')) {
        errorMessage += "Issue: Supabase configuration problem. Please check your setup.";
      } else if (err.message?.includes('fetch')) {
        errorMessage += "Issue: Network connection problem.";
      } else {
        errorMessage += `Issue: ${err.message}`;
      }
      
      alert(errorMessage);
      return null;
    } finally {
      setIsSavingToDatabase(false);
    }
  }

  // Load quotations on component mount
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("quotations")) || [];
    setSavedQuotations(saved);
  }, []);
  
  // Effects for dynamic cost adjustments
  useEffect(() => {
    if (systemType === 'Hybrid') setSafety(45000);
    else if (systemType === 'Daytime') setSafety(25000);
    else setSafety(0);
  }, [systemType]);
  
  useEffect(() => {
    setTransport(location === 'peshawar' ? 5000 : 10000);
  }, [location]);
  
  useEffect(() => {
    setLabour(isEngineerIncluded ? 15000 : 20000);
  }, [isEngineerIncluded]);
  
  // Helper functions
  const getBatteryOptions = () => {
    const kw = parseFloat(inverter.kw);
    if (batteryType === 'Lithium') return kw <= 4.2 ? lithium24 : lithium48;
    if (batteryType === 'Tubular') return tubular;
    return [];
  };
  
  const getPanelPrice = () => parseFloat(solarPanel.pricePerWatt) * parseInt(solarPanel.watts || 0);
  const getStandQty = () => stand.type === 'L2 (2 panels)' ? Math.ceil(solarPanel.quantity / 2) : solarPanel.quantity;
  const getTotal = () =>
    inverter.quantity * inverter.pricePerUnit +
    batteryQuantity * batteryPrice +
    getPanelPrice() * solarPanel.quantity +
    getStandQty() * stand.pricePerStand +
    safety + transport + labour + (isEngineerIncluded ? engineer : 0) +
    (isGreenmeterIncluded ? Greenmeter : 0);
  
  // Generate quotation ID
  const generateQuotationId = () => {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `SE-${year}${month}-${random}`;
  };
  
  // Generate quotation and show preview
  const generateQuotation = async () => {
    if (!customer.name || !customer.contact || !staffName || !systemType) {
      alert("Please fill in all required fields (Customer Name, Contact, Staff, System Type)");
      return;
    }
    
    setIsGeneratingPDF(true);
    
    const quotationId = generateQuotationId();
    const newQuotation = {
      id: quotationId,
      customer,
      staff: staffName,
      systemType,
      location,
      inverter,
      batteryModel,
      batteryQuantity,
      batteryPrice,
      solarPanel,
      stand,
      Greenmeter: isGreenmeterIncluded ? Greenmeter : 0,
      safety,
      transport,
      labour,
      engineer: isEngineerIncluded ? engineer : 0,
      total: getTotal(),
      date: new Date().toLocaleString(),
      followUpDate: "",
      followUpStatus: "Pending",
      remarks: "",
      quotationDate
    };

    // Save to Supabase
    const savedToSupabase = await saveQuotationToSupabase(newQuotation);
    
    // Save to localStorage
    const updatedQuotations = [...savedQuotations, newQuotation];
    setSavedQuotations(updatedQuotations);
    localStorage.setItem("quotations", JSON.stringify(updatedQuotations));
    
    setCurrentQuotation(newQuotation);
    setShowPreview(true);
    setIsGeneratingPDF(false);
    
    if (savedToSupabase) {
      alert("✅ Quotation generated and saved to database successfully! You can now print or save it as PDF using your browser.");
    } else {
      alert("✅ Quotation generated successfully! You can now print or save it as PDF using your browser.\n\nNote: Quotation was saved locally but couldn't sync to database.");
    }
  };
  
  // Print/Save quotation
  const printQuotation = () => {
    if (!quotationRef.current || !currentQuotation) {
      alert("❌ Please generate a quotation first before printing.");
      return;
    }
    
    try {
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        alert("❌ Please allow pop-ups for this site to print quotations.");
        return;
      }
      
      const quotationHTML = quotationRef.current.innerHTML;
      
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="UTF-8">
            <title>Quotation - ${currentQuotation?.customer.name}</title>
            <style>
              body { 
                font-family: 'Segoe UI', Arial, sans-serif; 
                margin: 0; 
                padding: 15px;
                line-height: 1.3;
                color: #333;
                background: white;
              }
              @media print {
                body { margin: 0; padding: 10px; }
                .no-print { display: none !important; }
                @page { size: A4; margin: 0.5in; }
              }
              table { 
                border-collapse: collapse; 
                width: 100%; 
                margin: 8px 0; 
                page-break-inside: avoid;
              }
              th, td { 
                border: 1px solid #ddd; 
                padding: 6px; 
                text-align: left; 
                font-size: 11px;
              }
              th { 
                background-color: #FF6B35 !important; 
                color: white !important;
                font-weight: bold; 
              }
              .header { margin-bottom: 15px; }
              .total-section { 
                margin-top: 15px; 
                padding: 12px; 
                background-color: #f8f9fa; 
                border-radius: 8px; 
                border: 2px solid #FF6B35;
              }
              .terms-section { margin-top: 15px; }
              .footer { 
                margin-top: 25px; 
                border-top: 2px solid #FF6B35; 
                padding-top: 15px; 
              }
              h1, h2, h3 { color: #FF6B35; }
              .logo-icon { color: #FF6B35; }
              .page-break { page-break-before: always; }
            </style>
          </head>
          <body>
            ${quotationHTML}
            <script>
              window.onload = function() {
                setTimeout(function() {
                  window.print();
                  window.onafterprint = function() {
                    window.close();
                  }
                }, 500);
              }
            </script>
          </body>
        </html>
      `);
      
      printWindow.document.close();
    } catch (error) {
      console.error("Error printing quotation:", error);
      alert("❌ Error printing quotation. Please try again.");
    }
  };
  
  // Reset form
  const resetForm = () => {
    setCustomer({ name: '', contact: '', email: '', address: '' });
    setStaffName('');
    setSystemType('');
    setInverter({ company: '', kw: '', quantity: 1, pricePerUnit: 0 });
    setBatteryType('');
    setBatteryModel('');
    setBatteryQuantity(1);
    setBatteryPrice(0);
    setSolarPanel({ company: '', watts: '', pricePerWatt: 0, quantity: 1 });
    setStand({ type: '', pricePerStand: 0 });
    setIsGreenmeterIncluded(false);
    setSafety(0);
    setTransport(5000);
    setIsEngineerIncluded(false);
    setLabour(20000);
    setEngineer(10000);
    setShowPreview(false);
    setCurrentQuotation(null);
  };
  
  // Delete quotation
  const deleteQuotation = async (id) => {
    if (!window.confirm("Are you sure you want to delete this quotation? This action cannot be undone.")) {
      return;
    }

    setIsDeleting(true);
    
    try {
      // Remove from localStorage
      const updatedQuotations = savedQuotations.filter(q => q.id !== id);
      setSavedQuotations(updatedQuotations);
      localStorage.setItem("quotations", JSON.stringify(updatedQuotations));
      
      // Delete from database
      const { error } = await supabase
        .from('quotations')
        .delete()
        .or(`quotation_id.eq.${id},id.eq.${id}`);
      
      if (error) {
        console.error('Delete error:', error);
        alert('Quotation deleted locally but failed to delete from database');
      } else {
        alert('Quotation deleted successfully!');
      }
      
      if (currentQuotation?.id === id) {
        setShowPreview(false);
        setCurrentQuotation(null);
      }
      
      if (showQuotationsList && updatedQuotations.length === 0) {
        setShowQuotationsList(false);
      }
    } catch (err) {
      console.error('Delete error:', err);
      alert('Failed to delete quotation');
    } finally {
      setIsDeleting(false);
    }
  };

  // Quotation Preview Component
  const QuotationPreview = () => (
    <div style={pdfStyles.container}>
      {/* ... (same as before) ... */}
    </div>
  );
  
  // Main component render
  if (showQuotationsList) {
    return (
      <div style={styles.container}>
        <div style={styles.header}>
          <div style={styles.headerContent}>
            <div>
              <h1 style={styles.title}>📋 Saved Quotations</h1>
              <p style={styles.subtitle}>Manage and track all your quotations</p>
            </div>
            <button
              onClick={() => setShowQuotationsList(false)}
              style={styles.backButton}
            >
              ← Back to Generator
            </button>
          </div>
        </div>
        <div style={styles.quotationsGrid}>
          {savedQuotations.map((quotation, index) => (
            <div key={index} style={styles.quotationCard}>
              <div style={styles.quotationHeader}>
                <h3>{quotation.customer.name}</h3>
                <span style={styles.quotationId}>#{quotation.id}</span>
              </div>
              <div style={styles.quotationDetails}>
                <p><strong>System:</strong> {quotation.systemType}</p>
                <p><strong>Total:</strong> Rs {quotation.total.toLocaleString()}</p>
                <p><strong>Date:</strong> {new Date(quotation.date).toLocaleDateString()}</p>
                <p><strong>Status:</strong> 
                  <span style={{
                    ...styles.statusBadge,
                    backgroundColor: quotation.followUpStatus === 'Pending' ? '#ff9800' : 
                                   quotation.followUpStatus === 'Contacted' ? '#2196f3' : '#4caf50'
                  }}>
                    {quotation.followUpStatus}
                  </span>
                </p>
              </div>
              <div style={styles.quotationActions}>
                <button
                  onClick={() => {
                    setCurrentQuotation(quotation);
                    setShowPreview(true);
                    setShowQuotationsList(false);
                  }}
                  style={styles.viewButton}
                >
                  👁️ View
                </button>
                <button
                  onClick={() => {
                    setCurrentQuotation(quotation);
                    setShowPreview(true);
                    setShowQuotationsList(false);
                    setTimeout(() => printQuotation(), 100);
                  }}
                  style={styles.downloadButton}
                >
                  🖨️ Print
                </button>
                <button
                  onClick={() => deleteQuotation(quotation.id)}
                  style={styles.deleteButton}
                  disabled={isDeleting}
                >
                  {isDeleting ? "⏳ Deleting..." : "🗑️ Delete"}
                </button>
              </div>
            </div>
          ))}
        </div>
        {savedQuotations.length === 0 && (
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}>📋</div>
            <h3>No quotations yet</h3>
            <p>Create your first quotation to get started</p>
          </div>
        )}
      </div>
    );
  }
  
  if (showPreview && currentQuotation) {
    return (
      <div style={styles.previewContainer}>
        <div style={styles.previewHeader}>
          <h1 style={styles.previewTitle}>📋 Quotation Preview</h1>
          <div style={styles.previewActions}>
            <button
              onClick={() => setShowPreview(false)}
              style={styles.backButton}
            >
              ← Back to Form
            </button>
            <button
              onClick={() => printQuotation()}
              style={styles.downloadButton}
              disabled={isGeneratingPDF}
            >
              {isGeneratingPDF ? "⏳ Generating..." : "🖨️ Print/Save PDF"}
            </button>
            <button
              onClick={() => deleteQuotation(currentQuotation.id)}
              style={styles.deleteButton}
              disabled={isDeleting}
            >
              {isDeleting ? "⏳ Deleting..." : "🗑️ Delete"}
            </button>
            <button
              onClick={resetForm}
              style={styles.newQuotationButton}
            >
              ➕ New Quotation
            </button>
          </div>
        </div>
        
        <div ref={quotationRef}>
          <QuotationPreview />
        </div>
      </div>
    );
  }
  
  return (
    <div style={styles.container}>
      <style>
        {`
          input[type=number]::-webkit-inner-spin-button,
          input[type=number]::-webkit-outer-spin-button {
            -webkit-appearance: none;
            margin: 0;
          }
          input[type=number] {
            -moz-appearance: textfield;
          }
        `}
      </style>
      
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerContent}>
          <div>
            <h1 style={styles.title}>🧾 Quotation Generator</h1>
            <p style={styles.subtitle}>Create quotations with automatic database sync and follow-up integration</p>
            {isSavingToDatabase && (
              <p style={{ color: '#FFE0B2', fontSize: '0.9rem', margin: '5px 0 0 0' }}>
                💾 Syncing to database...
              </p>
            )}
          </div>
          <div style={styles.headerActions}>
            <button
              onClick={() => setShowQuotationsList(true)}
              style={styles.viewQuotationsButton}
            >
              📋 View Quotations ({savedQuotations.length})
            </button>
          </div>
        </div>
      </div>
      
      {/* Analytics Cards */}
      <div style={styles.analyticsGrid}>
        <div style={styles.analyticsCard}>
          <div style={styles.analyticsIcon}>📊</div>
          <div style={styles.analyticsContent}>
            <div style={styles.analyticsValue}>{savedQuotations.length}</div>
            <div style={styles.analyticsTitle}>Total Quotations</div>
          </div>
        </div>
        <div style={styles.analyticsCard}>
          <div style={styles.analyticsIcon}>💰</div>
          <div style={styles.analyticsContent}>
            <div style={styles.analyticsValue}>
              Rs {savedQuotations.reduce((sum, q) => sum + q.total, 0).toLocaleString()}
            </div>
            <div style={styles.analyticsTitle}>Total Value</div>
          </div>
        </div>
        <div style={styles.analyticsCard}>
          <div style={styles.analyticsIcon}>📞</div>
          <div style={styles.analyticsContent}>
            <div style={styles.analyticsValue}>
              {savedQuotations.filter(q => q.followUpStatus === 'Pending').length}
            </div>
            <div style={styles.analyticsTitle}>Pending Follow-ups</div>
          </div>
        </div>
        <div style={styles.analyticsCard}>
          <div style={styles.analyticsIcon}>✅</div>
          <div style={styles.analyticsContent}>
            <div style={styles.analyticsValue}>
              {savedQuotations.filter(q => q.followUpStatus === 'Closed').length}
            </div>
            <div style={styles.analyticsTitle}>Closed Deals</div>
          </div>
        </div>
      </div>
      
      {/* Quotation Form */}
      <div style={styles.formContainer}>
        <div style={styles.formHeader}>
          <h2 style={styles.formTitle}>💼 Create New Quotation</h2>
          <p style={styles.formSubtitle}>Fill in the details to generate a professional quotation</p>
        </div>
        <div style={styles.formSections}>
          {/* Customer Information */}
          <div style={styles.formSection}>
            <h3 style={styles.sectionTitle}>👤 Customer Information</h3>
            <div style={styles.formGrid}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Customer Name *</label>
                <input
                  type="text"
                  placeholder="Ahmed Khan"
                  value={customer.name}
                  onChange={(e) => setCustomer({...customer, name: e.target.value})}
                  style={styles.input}
                />
              </div>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Contact Number *</label>
                <input
                  type="text"
                  placeholder="+92 300 1234567"
                  value={customer.contact}
                  onChange={(e) => setCustomer({...customer, contact: e.target.value})}
                  style={styles.input}
                />
              </div>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Email Address</label>
                <input
                  type="email"
                  placeholder="customer@email.com"
                  value={customer.email}
                  onChange={(e) => setCustomer({...customer, email: e.target.value})}
                  style={styles.input}
                />
              </div>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Complete Address *</label>
                <input
                  type="text"
                  placeholder="House # 123, Street Name, Area, City"
                  value={customer.address}
                  onChange={(e) => setCustomer({...customer, address: e.target.value})}
                  style={styles.input}
                />
              </div>
            </div>
          </div>
          
          {/* Project Setup */}
          <div style={styles.formSection}>
            <h3 style={styles.sectionTitle}>⚙️ Project Configuration</h3>
            <div style={styles.formGrid}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Prepared By *</label>
                <select
                  value={staffName}
                  onChange={(e) => setStaffName(e.target.value)}
                  style={styles.input}
                >
                  <option value="">Select Staff Member</option>
                  {staffList.map(staff => (
                    <option key={staff} value={staff}>{staff}</option>
                  ))}
                </select>
              </div>
              <div style={styles.inputGroup}>
                <label style={styles.label}>System Type *</label>
                <select
                  value={systemType}
                  onChange={(e) => setSystemType(e.target.value)}
                  style={styles.input}
                >
                  <option value="">Select System Type</option>
                  <option value="Hybrid">Hybrid System</option>
                  <option value="Daytime">Daytime System</option>
                  <option value="Grid-Tie">Grid-Tie System</option>
                </select>
              </div>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Installation Location</label>
                <select
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  style={styles.input}
                >
                  <option value="peshawar">Peshawar</option>
                  <option value="other">Other Location</option>
                </select>
              </div>
            </div>
          </div>
          
          {/* Equipment Configuration */}
          <div style={styles.formSection}>
            <h3 style={styles.sectionTitle}>🔌 Inverter Selection</h3>
            <div style={styles.formGrid}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Inverter Company</label>
                <select
                  value={inverter.company}
                  onChange={(e) => setInverter({...inverter, company: e.target.value})}
                  style={styles.input}
                >
                  <option value="">Select Company</option>
                  {inverterCompanies.map(company => (
                    <option key={company} value={company}>{company}</option>
                  ))}
                </select>
              </div>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Capacity (kW)</label>
                <select
                  value={inverter.kw}
                  onChange={(e) => setInverter({...inverter, kw: e.target.value})}
                  style={styles.input}
                >
                  <option value="">Select Capacity</option>
                  {inverterKW.map(kw => (
                    <option key={kw} value={kw} >{kw} kW</option>
                  ))}
                </select>
              </div>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Quantity</label>
                <input
                  type="number"
                  value={inverter.quantity}
                  onChange={(e) => setInverter({...inverter, quantity: parseInt(e.target.value) || 1})}
                  style={styles.input}
                  min="1"
                />
              </div>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Price per Unit (Rs)</label>
                <input
                  type="number"
                  value={inverter.pricePerUnit}
                  onChange={(e) => setInverter({...inverter, pricePerUnit: parseInt(e.target.value) || 0})}
                  style={styles.input}
                  placeholder="120000"
                />
              </div>
            </div>
          </div>
          
          {/* Battery Configuration */}
          <div style={styles.formSection}>
            <h3 style={styles.sectionTitle}>🔋 Battery Configuration</h3>
            <div style={styles.formGrid}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Battery Type</label>
                <select
                  value={batteryType}
                  onChange={(e) => setBatteryType(e.target.value)}
                  style={styles.input}
                >
                  <option value="">Select Type</option>
                  {batteryTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Battery Model</label>
                <select
                  value={batteryModel}
                  onChange={(e) => setBatteryModel(e.target.value)}
                  style={styles.input}
                >
                  <option value="">Select Model</option>
                  {getBatteryOptions().map(model => (
                    <option key={model} value={model}>{model}</option>
                  ))}
                </select>
              </div>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Quantity</label>
                <input
                  type="number"
                  value={batteryQuantity}
                  onChange={(e) => setBatteryQuantity(parseInt(e.target.value) || 1)}
                  style={styles.input}
                  min="1"
                />
              </div>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Price per Unit (Rs)</label>
                <input
                  type="number"
                  value={batteryPrice}
                  onChange={(e) => setBatteryPrice(parseInt(e.target.value) || 0)}
                  style={styles.input}
                  placeholder="230000"
                />
              </div>
            </div>
          </div>
          
          {/* Solar Panel Configuration */}
          <div style={styles.formSection}>
            <h3 style={styles.sectionTitle}>☀️ Solar Panel Configuration</h3>
            <div style={styles.formGrid}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Panel Company</label>
                <select
                  value={solarPanel.company}
                  onChange={(e) => setSolarPanel({...solarPanel, company: e.target.value})}
                  style={styles.input}
                >
                  <option value="">Select Company</option>
                  {panelCompanies.map(company => (
                    <option key={company} value={company}>{company}</option>
                  ))}
                </select>
              </div>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Wattage</label>
                <select
                  value={solarPanel.watts}
                  onChange={(e) => setSolarPanel({...solarPanel, watts: e.target.value})}
                  style={styles.input}
                >
                  <option value="">Select Wattage</option>
                  {panelWatts.map(watt => (
                    <option key={watt} value={watt}>{watt}W</option>
                  ))}
                </select>
              </div>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Quantity</label>
                <input
                  type="number"
                  value={solarPanel.quantity}
                  onChange={(e) => setSolarPanel({...solarPanel, quantity: parseInt(e.target.value) || 1})}
                  style={styles.input}
                  min="1"
                />
              </div>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Price per Watt (Rs)</label>
                <input
                  type="number"
                  step="0.1"
                  value={solarPanel.pricePerWatt}
                  onChange={(e) => setSolarPanel({...solarPanel, pricePerWatt: parseFloat(e.target.value) || 0})}
                  style={styles.input}
                  placeholder="32.5"
                />
              </div>
            </div>
          </div>
          
          {/* Mounting Structure */}
          <div style={styles.formSection}>
            <h3 style={styles.sectionTitle}>🏗️ Mounting Structure</h3>
            <div style={styles.formGrid}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Stand Type</label>
                <select
                  value={stand.type}
                  onChange={(e) => setStand({...stand, type: e.target.value})}
                  style={styles.input}
                >
                  <option value="">Select Type</option>
                  {standTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Price per Stand (Rs)</label>
                <input
                  type="number"
                  value={stand.pricePerStand}
                  onChange={(e) => setStand({...stand, pricePerStand: parseInt(e.target.value) || 0})}
                  style={styles.input}
                  placeholder="8000"
                />
              </div>
            </div>
          </div>
          
          {/* Additional Services */}
          <div style={styles.formSection}>
            <h3 style={styles.sectionTitle}>⚙️ Additional Services & Costs</h3>
            <div style={styles.formGrid}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Safety Equipment (Rs)</label>
                <input
                  type="number"
                  value={safety}
                  onChange={(e) => setSafety(parseInt(e.target.value) || 0)}
                  style={styles.input}
                />
              </div>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Transportation (Rs)</label>
                <input
                  type="number"
                  value={transport}
                  onChange={(e) => setTransport(parseInt(e.target.value) || 0)}
                  style={styles.input}
                />
              </div>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Labour Cost (Rs)</label>
                <input
                  type="number"
                  value={labour}
                  onChange={(e) => setLabour(parseInt(e.target.value) || 0)}
                  style={styles.input}
                />
              </div>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Engineering Cost (Rs)</label>
                <input
                  type="number"
                  value={engineer}
                  onChange={(e) => setEngineer(parseInt(e.target.value) || 0)}
                  style={styles.input}
                />
              </div>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Greenmeter Cost (Rs)</label>
                <input
                  type="number"
                  value={Greenmeter}
                  onChange={(e) => setGreenmeter(parseInt(e.target.value) || 0)}
                  style={styles.input}
                />
              </div>
            </div>
            
            <div style={styles.checkboxGroup}>
              <label style={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={isEngineerIncluded}
                  onChange={(e) => setIsEngineerIncluded(e.target.checked)}
                  style={styles.checkbox}
                />
                Include Engineering Supervision Cost
              </label>
              <label style={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={isGreenmeterIncluded}
                  onChange={(e) => setIsGreenmeterIncluded(e.target.checked)}
                  style={styles.checkbox}
                />
                Include Greenmeter Cost
              </label>
            </div>
          </div>
          
          {/* Total and Actions */}
          <div style={styles.totalSection}>
            <div style={styles.totalDisplay}>
              <h2 style={styles.totalTitle}>Total System Cost</h2>
              <div style={styles.totalAmount}>Rs. {getTotal().toLocaleString()}</div>
              {isSavingToDatabase && (
                <p style={{ color: '#FF6B35', fontSize: '0.9rem', margin: '10px 0 0 0' }}>
                  💾 Saving to database...
                </p>
              )}
            </div>
            
            <div style={styles.actionButtons}>
              <button
                onClick={resetForm}
                style={styles.resetButton}
              >
                🔄 Reset Form
              </button>
              <button
                onClick={generateQuotation}
                style={{
                  ...styles.generateButton,
                  opacity: (isGeneratingPDF || isSavingToDatabase) ? 0.7 : 1,
                  cursor: (isGeneratingPDF || isSavingToDatabase) ? 'not-allowed' : 'pointer'
                }}
                disabled={isGeneratingPDF || isSavingToDatabase}
              >
                {isGeneratingPDF ? "⏳ Generating..." : isSavingToDatabase ? "💾 Saving..." : "📋 Generate Quotation"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// PDF Styles for the quotation preview - OPTIMIZED FOR 2 PAGES
const pdfStyles = {
  container: {
    fontFamily: "'Segoe UI', Arial, sans-serif",
    maxWidth: '800px',
    margin: '0 auto',
    padding: '15px',
    lineHeight: '1.3',
    color: '#333',
    backgroundColor: 'white',
  },
  header: {
    borderBottom: '3px solid #FF6B35',
    paddingBottom: '15px',
    marginBottom: '20px',
  },
  logoSection: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '15px',
  },
  logoContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  logoIcon: {
    fontSize: '2.5rem',
    color: '#FF6B35',
  },
  logoText: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  companyName: {
    fontSize: '1.3rem',
    fontWeight: '900',
    color: '#FF6B35',
    margin: '0',
  },
  solarText: {
    fontSize: '0.8rem',
    color: '#F7931E',
    fontWeight: '600',
    margin: '0',
  },
  companyDetails: {
    flex: 1,
    marginLeft: '15px',
  },
  mainTitle: {
    fontSize: '1.6rem',
    fontWeight: '700',
    color: '#FF6B35',
    margin: '0 0 5px 0',
  },
  tagline: {
    fontSize: '0.9rem',
    color: '#666',
    margin: '0 0 12px 0',
    fontStyle: 'italic',
  },
  contactInfo: {
    fontSize: '0.85rem',
    color: '#555',
  },
  quotationInfo: {
    textAlign: 'right',
    backgroundColor: '#FFF8F0',
    padding: '12px',
    borderRadius: '8px',
    border: '1px solid #FFE0CC',
  },
  quotationTitle: {
    fontSize: '1.8rem',
    fontWeight: '700',
    color: '#FF6B35',
    margin: '0 0 8px 0',
  },
  quotationDetails: {
    fontSize: '0.85rem',
    color: '#555',
  },
  infoSection: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '15px',
    marginBottom: '20px',
  },
  customerInfo: {
    backgroundColor: '#F8F9FA',
    padding: '15px',
    borderRadius: '8px',
    border: '1px solid #E9ECEF',
  },
  projectInfo: {
    backgroundColor: '#FFF3E0',
    padding: '15px',
    borderRadius: '8px',
    border: '1px solid #FFE0B2',
  },
  sectionTitle: {
    fontSize: '1rem',
    fontWeight: '700',
    color: '#FF6B35',
    margin: '0 0 12px 0',
    borderBottom: '2px solid #FF6B35',
    paddingBottom: '5px',
  },
  infoCard: {
    fontSize: '0.85rem',
    lineHeight: '1.5',
  },
  equipmentSection: {
    marginBottom: '20px',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    marginTop: '10px',
    fontSize: '10px',
  },
  tableHeader: {
    backgroundColor: '#FF6B35',
  },
  th: {
    padding: '6px',
    textAlign: 'left',
    color: 'white',
    fontWeight: 'bold',
    border: '1px solid #FF6B35',
  },
  tableRow: {
    borderBottom: '1px solid #ddd',
  },
  td: {
    padding: '5px',
    border: '1px solid #ddd',
    fontSize: '10px',
  },
  totalSection: {
    backgroundColor: '#FFF8F0',
    padding: '12px',
    borderRadius: '8px',
    border: '2px solid #FF6B35',
    textAlign: 'center',
    marginBottom: '20px',
  },
  totalBox: {
    display: 'inline-block',
  },
  totalTitle: {
    fontSize: '1.3rem',
    fontWeight: '700',
    color: '#FF6B35',
    margin: '0 0 8px 0',
  },
  totalAmount: {
    fontSize: '2rem',
    fontWeight: '900',
    color: '#E65100',
    margin: '0 0 8px 0',
  },
  totalNote: {
    fontSize: '0.8rem',
    color: '#666',
    fontStyle: 'italic',
    margin: '0',
  },
  termsSection: {
    marginBottom: '15px',
  },
  termsList: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '15px',
    fontSize: '0.8rem',
  },
  termsColumn: {
    backgroundColor: '#F8F9FA',
    padding: '12px',
    borderRadius: '8px',
  },
  footer: {
    borderTop: '2px solid #FF6B35',
    paddingTop: '15px',
  },
  footerContent: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '15px',
  },
  footerLeft: {
    flex: 1,
    fontSize: '0.8rem',
  },
  footerRight: {
    textAlign: 'center',
  },
  signature: {
    textAlign: 'center',
  },
  signatureLine: {
    width: '180px',
    height: '2px',
    backgroundColor: '#333',
    margin: '30px auto 8px auto',
  },
  footerBottom: {
    textAlign: 'center',
    fontSize: '0.7rem',
    color: '#666',
    fontStyle: 'italic',
    paddingTop: '12px',
    borderTop: '1px solid #ddd',
  },
  pageBreak: {
    pageBreakBefore: 'always',
    height: '0',
    margin: '0',
  }
};

// Main component styles
const styles = {
  container: {
    padding: '20px',
    background: 'linear-gradient(135deg, #FFF8F0 0%, #FFEBDD 100%)',
    minHeight: '100vh',
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
  },
  header: {
    background: 'linear-gradient(135deg, #FF6B35, #F7931E)',
    borderRadius: '20px',
    padding: '30px',
    marginBottom: '30px',
    color: 'white',
    boxShadow: '0 10px 30px rgba(255, 107, 53, 0.3)',
  },
  headerContent: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '20px',
  },
  title: {
    fontSize: '2.5rem',
    fontWeight: '700',
    margin: '0 0 10px 0',
    textShadow: '0 2px 10px rgba(0,0,0,0.2)',
  },
  subtitle: {
    fontSize: '1.1rem',
    opacity: '0.9',
    margin: 0,
    fontWeight: '300',
  },
  headerActions: {
    display: 'flex',
    gap: '15px',
  },
  viewQuotationsButton: {
    background: 'rgba(255, 255, 255, 0.2)',
    color: 'white',
    border: '2px solid rgba(255, 255, 255, 0.3)',
    borderRadius: '12px',
    padding: '12px 20px',
    cursor: 'pointer',
    fontSize: '0.9rem',
    fontWeight: '600',
    transition: 'all 0.3s ease',
    backdropFilter: 'blur(10px)',
  },
  analyticsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '20px',
    marginBottom: '30px',
  },
  analyticsCard: {
    background: 'linear-gradient(135deg, #FF6B35, #F7931E)',
    borderRadius: '15px',
    padding: '20px',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
    boxShadow: '0 8px 25px rgba(255, 107, 53, 0.3)',
  },
  analyticsIcon: {
    fontSize: '2rem',
  },
  analyticsContent: {
    flex: 1,
  },
  analyticsValue: {
    fontSize: '1.5rem',
    fontWeight: '700',
    marginBottom: '5px',
  },
  analyticsTitle: {
    fontSize: '0.85rem',
    opacity: '0.9',
  },
  formContainer: {
    background: 'white',
    borderRadius: '20px',
    padding: '30px',
    boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
  },
  formHeader: {
    textAlign: 'center',
    marginBottom: '30px',
  },
  formTitle: {
    fontSize: '1.8rem',
    fontWeight: '700',
    color: '#FF6B35',
    margin: '0 0 10px 0',
  },
  formSubtitle: {
    fontSize: '1rem',
    color: '#666',
    margin: '0',
  },
  formSections: {
    display: 'flex',
    flexDirection: 'column',
    gap: '25px',
  },
  formSection: {
    background: '#f9f9f9',
    padding: '25px',
    borderRadius: '15px',
    border: '1px solid #e0e0e0',
  },
  sectionTitle: {
    fontSize: '1.3rem',
    fontWeight: '600',
    color: '#FF6B35',
    marginBottom: '20px',
    borderBottom: '2px solid #FFE0CC',
    paddingBottom: '10px',
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '20px',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
  },
  label: {
    fontWeight: '600',
    marginBottom: '8px',
    color: '#333',
  },
  input: {
    padding: '12px 16px',
    border: '2px solid #e0e0e0',
    borderRadius: '10px',
    fontSize: '1rem',
    transition: 'border-color 0.3s ease',
  },
  checkboxGroup: {
    marginTop: '15px',
  },
  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    fontSize: '1rem',
    fontWeight: '500',
    color: '#333',
    cursor: 'pointer',
  },
  checkbox: {
    width: '18px',
    height: '18px',
    accentColor: '#FF6B35',
  },
  totalSection: {
    background: 'linear-gradient(135deg, #FFF3E0, #FFE0B2)',
    padding: '30px',
    borderRadius: '20px',
    border: '2px solid #FF6B35',
    textAlign: 'center',
  },
  totalDisplay: {
    marginBottom: '25px',
  },
  totalTitle: {
    fontSize: '1.8rem',
    fontWeight: '700',
    color: '#FF6B35',
    margin: '0 0 15px 0',
  },
  totalAmount: {
    fontSize: '3rem',
    fontWeight: '900',
    color: '#E65100',
    margin: '0',
    textShadow: '0 2px 5px rgba(0,0,0,0.1)',
  },
  actionButtons: {
    display: 'flex',
    gap: '20px',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  resetButton: {
    background: 'linear-gradient(135deg, #9e9e9e, #757575)',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    padding: '15px 30px',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  },
  generateButton: {
    background: 'linear-gradient(135deg, #FF6B35, #F7931E)',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    padding: '15px 30px',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 8px 25px rgba(255, 107, 53, 0.3)',
  },
  // Preview Container Styles
  previewContainer: {
    padding: '20px',
    background: 'linear-gradient(135deg, #FFF8F0 0%, #FFEBDD 100%)',
    minHeight: '100vh',
  },
  previewHeader: {
    background: 'white',
    borderRadius: '15px',
    padding: '20px',
    marginBottom: '20px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    boxShadow: '0 5px 15px rgba(0,0,0,0.1)',
    flexWrap: 'wrap',
    gap: '20px',
  },
  previewTitle: {
    fontSize: '1.8rem',
    fontWeight: '700',
    color: '#FF6B35',
    margin: '0',
  },
  previewActions: {
    display: 'flex',
    gap: '15px',
    flexWrap: 'wrap',
  },
  // Quotations List Styles
  quotationsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
    gap: '25px',
    marginTop: '20px',
  },
  quotationCard: {
    background: 'white',
    borderRadius: '15px',
    padding: '25px',
    border: '2px solid #FFE0CC',
    boxShadow: '0 8px 25px rgba(0,0,0,0.1)',
    transition: 'all 0.3s ease',
  },
  quotationHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '15px',
  },
  quotationId: {
    background: 'linear-gradient(135deg, #FF6B35, #F7931E)',
    color: 'white',
    padding: '5px 12px',
    borderRadius: '20px',
    fontSize: '0.8rem',
    fontWeight: '600',
  },
  quotationDetails: {
    marginBottom: '20px',
    lineHeight: '1.6',
  },
  statusBadge: {
    color: 'white',
    padding: '4px 8px',
    borderRadius: '12px',
    fontSize: '0.75rem',
    fontWeight: '600',
    marginLeft: '5px',
  },
  quotationActions: {
    display: 'flex',
    gap: '10px',
  },
  viewButton: {
    background: 'linear-gradient(135deg, #2196f3, #1976d2)',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    padding: '8px 15px',
    cursor: 'pointer',
    fontSize: '0.85rem',
    fontWeight: '600',
    flex: 1,
  },
  downloadButton: {
    background: 'linear-gradient(135deg, #4caf50, #45a049)',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    padding: '8px 15px',
    cursor: 'pointer',
    fontSize: '0.85rem',
    fontWeight: '600',
  },
  emptyState: {
    textAlign: 'center',
    padding: '60px 20px',
    color: '#666',
  },
  emptyIcon: {
    fontSize: '4rem',
    marginBottom: '20px',
  },
  backButton: {
    background: 'linear-gradient(135deg, #757575, #616161)',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    padding: '8px 15px',
    cursor: 'pointer',
    fontSize: '0.85rem',
    fontWeight: '600',
  },
  newQuotationButton: {
    background: 'linear-gradient(135deg, #FF6B35, #F7931E)',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    padding: '8px 15px',
    cursor: 'pointer',
    fontSize: '0.85rem',
    fontWeight: '600',
  },
  deleteButton: {
    background: 'linear-gradient(135deg, #f44336, #d32f2f)',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    padding: '8px 15px',
    cursor: 'pointer',
    fontSize: '0.85rem',
    fontWeight: '600',
    flex: 1,
  },
};

export default QuotationForm;