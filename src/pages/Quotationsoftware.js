import React, { useState, useEffect, useRef } from 'react';

// Mock Supabase client for demo purposes
const supabase = {
  from: (table) => ({
    insert: (data) => ({ 
      select: () => Promise.resolve({ 
        data: data.map((item, index) => ({ ...item, id: Date.now() + index })), 
        error: null 
      }) 
    }),
    select: (fields) => ({
      order: (field, options) => Promise.resolve({ 
        data: [], 
        error: null 
      })
    }),
    delete: () => ({
      eq: (field, value) => Promise.resolve({ error: null })
    })
  })
};

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
  const [deletingQuotationId, setDeletingQuotationId] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  
  // Ref for PDF generation
  const quotationRef = useRef();
  
  // Equipment options
  const inverterCompanies = ['Inverex', 'Ziewnic', 'Growatt', 'Goodwe', '1On', 'Solax', 'Sunlife', 'longlife'];
  const inverterKW = ['1.2', '3.2', '3.6', '4.2', '5.5', '6.2', '8.0', '10', '12', '15'];
  const batteryTypes = ['Lithium', 'Tubular'];
  const lithium24 = ['Itell 2.56kWh', 'Ziewnic 2.56kWh'];
  const lithium48 = ['Itell 5.12kWh', 'Ziewnic 5.12kWh', 'Solax 5.12kWh', '1On 5.12kWh'];
  const tubular = ['Osaka 1800Ah', 'Osaka 2500Ah', 'Phoenix 1800Ah','Phoenix 2500Ah','Hawk 1800Ah','Hawk 2500Ah'];
  const panelCompanies = ['JA Solar', 'Canadian', 'Longi'];
  const panelWatts = ['585', '590', '605'];
  const standTypes = ['16 Gauge', '18 Gauge', 'Girder', 'L2 (2 panels)'];

// Replace your existing function with this one _verbatim_:
async function saveQuotationToSupabase(quotationData) {
  try {
    setIsSavingToDatabase(true);

    // 1) Build payload exactly matching your table schema
    const supabaseData = {
      customer_name:   quotationData.customer.name,
      customer_contact:quotationData.customer.contact,
      customer_email:  quotationData.customer.email || null,
      customer_address:quotationData.customer.address,
      system_type:     quotationData.systemType,
      panel_brand:     quotationData.solarPanel.company,
      panel_watt:      quotationData.solarPanel.watts,
      panel_quantity:  quotationData.solarPanel.quantity,
      panel_total:     getPanelPrice() * quotationData.solarPanel.quantity,
      inverter_type:   quotationData.inverter.company || null,
      inverter_size:   `${quotationData.inverter.kw}kW` || null,
      inverter_total:  quotationData.inverter.quantity * quotationData.inverter.pricePerUnit,
      battery_type:    batteryType || null,
      battery_model:   quotationData.batteryModel || null,
      battery_quantity:quotationData.batteryQuantity || null,
      battery_total:   (quotationData.batteryQuantity || 0) * (quotationData.batteryPrice || 0),
      stand_type:      quotationData.stand.type,
      stand_quantity:  getStandQty(),
      stand_total:     getStandQty() * quotationData.stand.pricePerStand,
      safety_charges:  quotationData.safety,
      transport_charges:quotationData.transport,
      installation_charges:quotationData.labour,
      green_meter:     isGreenmeterIncluded,
      green_meter_charges:quotationData.Greenmeter || 0,
      total_amount:    quotationData.total,
      quotation_date:  new Date().toISOString(),
      staff_name:      quotationData.staff || null,
      location:        quotationData.location || null,
      quotation_id:    quotationData.id,
      engineer_charges:quotationData.engineer || 0,
      follow_up_status:'Pending'       // ← must match your CHECK constraint!
    };

    console.log("🔀 Supabase payload:", supabaseData);

    // 2) Send to Supabase
    const { data, error } = await supabase
      .from("quotations")
      .insert([supabaseData])
      .select();

    // 3) Handle any error
    if (error) {
      console.error("❌ Supabase insert error:", error);
      alert(`Supabase error: ${error.message}`);
      return null;
    }

    return data[0];
  } catch (err) {
    console.error("⚠️ Unexpected error:", err);
    alert(`Unexpected error: ${err.message}`);
    return null;
  } finally {
    setIsSavingToDatabase(false);
  }
}

async function loadQuotationsFromSupabase() {
  try {
    const { data, error } = await supabase
      .from("quotations")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("❌ Error loading from Supabase:", error);
      alert(`Load error: ${error.message}`);
      return [];
    }

    console.log("✅ Supabase returned:", data);

    // Map to your UI shape
    return data.map(item => ({
      id:               item.quotation_id || item.id.toString(),
      customer: {
        name:           item.customer_name,
        contact:        item.customer_contact,
        email:          item.customer_email,
        address:        item.customer_address
      },
      staff:            item.staff_name,
      systemType:       item.system_type,
      location:         item.location,
      inverter: {
        company:        item.inverter_type,
        kw:             item.inverter_size?.replace('kW','') || '0',
        quantity:       1,
        pricePerUnit:   item.inverter_total || 0
      },
      batteryModel:     item.battery_model,
      batteryQuantity:  item.battery_quantity || 0,
      batteryPrice:     item.battery_quantity > 0
                        ? (item.battery_total / item.battery_quantity)
                        : 0,
      solarPanel: {
        company:        item.panel_brand,
        watts:          item.panel_watt,
        quantity:       item.panel_quantity,
        pricePerWatt:   item.panel_quantity > 0
                        ? (item.panel_total / (item.panel_quantity * parseInt(item.panel_watt)))
                        : 0
      },
      stand: {
        type:           item.stand_type,
        pricePerStand:  item.stand_total / (item.stand_quantity || 1)
      },
      safety:           item.safety_charges,
      transport:        item.transport_charges,
      labour:           item.installation_charges,
      engineer:         item.engineer_charges || 0,
      Greenmeter:       item.green_meter_charges || 0,
      total:            item.total_amount,
      date:             item.created_at,
      followUpStatus:   item.follow_up_status,   // “Pending”, “Contacted”, etc.
      quotationDate:    item.quotation_date
    }));
  } catch (err) {
    console.error("⚠️ Unexpected load error:", err);
    alert(`Unexpected load error: ${err.message}`);
    return [];
  }
}

  // Delete quotation from both localStorage and Supabase
  async function deleteQuotation(quotationId) {
    try {
      setDeletingQuotationId(quotationId);

      const { error } = await supabase
        .from("quotations")
        .delete()
        .eq("quotation_id", quotationId);

      if (error) {
        console.error("Error deleting from Supabase:", error);
      }

      const updatedQuotations = savedQuotations.filter(q => q.id !== quotationId);
      setSavedQuotations(updatedQuotations);
      localStorage.setItem("quotations", JSON.stringify(updatedQuotations));

      alert("✅ Quotation deleted successfully!");
      setConfirmDeleteId(null);

    } catch (err) {
      console.error("Unexpected error deleting quotation:", err);
      alert("❌ Failed to delete quotation: " + err.message);
    } finally {
      setDeletingQuotationId(null);
    }
  }

  const handleDeleteClick = (quotationId) => {
    setConfirmDeleteId(quotationId);
  };

  const cancelDelete = () => {
    setConfirmDeleteId(null);
  };

  // Load quotations on component mount
  useEffect(() => {
    const loadAllQuotations = async () => {
      try {
        const supabaseQuotations = await loadQuotationsFromSupabase();
        const localQuotations = JSON.parse(localStorage.getItem("quotations")) || [];
        
        // Create a map for faster lookup
        const supabaseMap = new Map();
        supabaseQuotations.forEach(q => {
          supabaseMap.set(q.id, q);
        });
        
        // Merge quotations, prioritizing Supabase data
        const mergedQuotations = [...supabaseQuotations];
        
        localQuotations.forEach(localQuote => {
          if (!supabaseMap.has(localQuote.id)) {
            mergedQuotations.push(localQuote);
          }
        });

        setSavedQuotations(mergedQuotations);
        localStorage.setItem("quotations", JSON.stringify(mergedQuotations));
        
      } catch (err) {
        console.error("Error loading quotations:", err);
        const localQuotations = JSON.parse(localStorage.getItem("quotations")) || [];
        setSavedQuotations(localQuotations);
      }
    };

    loadAllQuotations();
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
      followUpStatus: "pending",
      remarks: "",
      quotationDate
    };

    const savedToSupabase = await saveQuotationToSupabase(newQuotation);
    
    const updatedQuotations = [...savedQuotations, newQuotation];
    setSavedQuotations(updatedQuotations);
    localStorage.setItem("quotations", JSON.stringify(updatedQuotations));
    
    setCurrentQuotation(newQuotation);
    setIsGeneratingPDF(false);
    
    if (savedToSupabase) {
      alert("✅ Quotation generated and saved to database successfully!");
    } else {
      alert("✅ Quotation generated successfully! (Saved locally)");
    }
  };
  
  // Enhanced print function with performance improvements
  const printQuotationData = (quotationData) => {
    try {
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        alert("❌ Please allow pop-ups for this site to print quotations.");
        return;
      }
      
      // Create temporary quotation HTML
      const quotationHTML = generateQuotationHTML(quotationData);
      
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="UTF-8">
            <title>Quotation - ${quotationData?.customer.name}</title>
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
              .info-section { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 20px; }
              .customer-info, .project-info { background: #f8f9fa; padding: 15px; border-radius: 8px; }
              .project-info { background: #fff3e0; }
              .equipment-section { margin-bottom: 20px; }
              .total-section-print { background: #fff8f0; padding: 12px; border-radius: 8px; border: 2px solid #FF6B35; text-align: center; margin: 20px 0; }
              .terms-list { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; font-size: 0.8rem; }
              .terms-column { background: #f8f9fa; padding: 12px; border-radius: 8px; }
              .footer-content { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 15px; }
              .signature { text-align: center; }
              .signature-line { width: 180px; height: 2px; background: #333; margin: 30px auto 8px auto; }
              .footer-bottom { text-align: center; font-size: 0.7rem; color: #666; font-style: italic; padding-top: 12px; border-top: 1px solid #ddd; }
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

  // Generate HTML for quotation
  const generateQuotationHTML = (quotationData) => {
    const panelPrice = parseFloat(quotationData.solarPanel.pricePerWatt) * parseInt(quotationData.solarPanel.watts || 0);
    const standQty = quotationData.stand.type === 'L2 (2 panels)' ? Math.ceil(quotationData.solarPanel.quantity / 2) : quotationData.solarPanel.quantity;
    
    return `
      <div>
        <!-- Header with Logo and Company Info -->
        <div class="header">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 15px;">
            <div style="display: flex; align-items: center; gap: 10px;">
              <div style="display: flex; align-items: center; gap: 8px;">
                <div style="font-size: 2.5rem; color: #FF6B35;">☀️</div>
                <div style="display: flex; flex-direction: column; align-items: center;">
                  <div style="font-size: 1.3rem; font-weight: 900; color: #FF6B35; margin: 0;">SYED</div>
                  <div style="font-size: 0.8rem; color: #F7931E; font-weight: 600; margin: 0;">SOLAR ENERGY</div>
                </div>
              </div>
              <div style="margin-left: 15px;">
                <h1 style="font-size: 1.6rem; font-weight: 700; color: #FF6B35; margin: 0 0 5px 0;">SYED SOLAR ENERGY PVT LTD</h1>
                <p style="font-size: 0.9rem; color: #666; margin: 0 0 12px 0; font-style: italic;">Your Partner in Sustainable Energy Solutions</p>
                <div style="font-size: 0.85rem; color: #555;">
                  <p>📍 Office #23 Mustafa Plaza Ring Road Near Imtiaz Mega Center, Peshawar</p>
                  <p>📞 0307-5596695/03044678929 | 📧 sales@syedsolarenergy.com</p>
                  <p>🌐 www.syedsolarenergy.com</p>
                </div>
              </div>
            </div>
            <div style="text-align: right; background: #FFF8F0; padding: 12px; border-radius: 8px; border: 1px solid #FFE0CC;">
              <div style="font-size: 1.8rem; font-weight: 700; color: #FF6B35; margin: 0 0 8px 0;">QUOTATION</div>
              <div style="font-size: 0.85rem; color: #555;">
                <p><strong>Quotation #:</strong> ${quotationData?.id}</p>
                <p><strong>Date:</strong> ${quotationData?.quotationDate || new Date().toLocaleDateString()}</p>
                <p><strong>Valid Until:</strong> ${new Date(Date.now() + 7*24*60*60*1000).toLocaleDateString()}</p>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Customer and Project Info -->
        <div class="info-section">
          <div class="customer-info">
            <h3 style="font-size: 1rem; font-weight: 700; color: #FF6B35; margin: 0 0 12px 0; border-bottom: 2px solid #FF6B35; padding-bottom: 5px;">📋 CUSTOMER INFORMATION</h3>
            <div style="font-size: 0.85rem; line-height: 1.5;">
              <p><strong>Name:</strong> ${quotationData.customer.name}</p>
              <p><strong>Contact:</strong> ${quotationData.customer.contact}</p>
              <p><strong>Email:</strong> ${quotationData.customer.email}</p>
              <p><strong>Address:</strong> ${quotationData.customer.address}</p>
            </div>
          </div>
          <div class="project-info">
            <h3 style="font-size: 1rem; font-weight: 700; color: #FF6B35; margin: 0 0 12px 0; border-bottom: 2px solid #FF6B35; padding-bottom: 5px;">⚡ PROJECT DETAILS</h3>
            <div style="font-size: 0.85rem; line-height: 1.5;">
              <p><strong>Prepared By:</strong> ${quotationData.staff}</p>
              <p><strong>System Type:</strong> ${quotationData.systemType}</p>
              <p><strong>Location:</strong> ${quotationData.location}</p>
              <p><strong>Total Capacity:</strong> ${parseFloat(quotationData.inverter.kw) || 0} kW</p>
            </div>
          </div>
        </div>
        
        <!-- Equipment Details Table -->
        <div class="equipment-section">
          <h3 style="font-size: 1rem; font-weight: 700; color: #FF6B35; margin: 0 0 12px 0; border-bottom: 2px solid #FF6B35; padding-bottom: 5px;">🔧 EQUIPMENT & PRICING BREAKDOWN</h3>
          <table>
            <thead>
              <tr style="background-color: #FF6B35;">
                <th>S.No</th>
                <th>Item Description</th>
                <th>Brand/Model</th>
                <th>Qty</th>
                <th>Unit Price (Rs)</th>
                <th>Total (Rs)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>1</td>
                <td>Solar Inverter (${quotationData.inverter.kw}kW)</td>
                <td>${quotationData.inverter.company} ${quotationData.inverter.kw}kW</td>
                <td>${quotationData.inverter.quantity}</td>
                <td>${quotationData.inverter.pricePerUnit.toLocaleString()}</td>
                <td>${(quotationData.inverter.quantity * quotationData.inverter.pricePerUnit).toLocaleString()}</td>
              </tr>
              <tr>
                <td>2</td>
                <td>Battery Storage System</td>
                <td>${quotationData.batteryModel}</td>
                <td>${quotationData.batteryQuantity}</td>
                <td>${quotationData.batteryPrice.toLocaleString()}</td>
                <td>${(quotationData.batteryQuantity * quotationData.batteryPrice).toLocaleString()}</td>
              </tr>
              <tr>
                <td>3</td>
                <td>Solar Panels (${quotationData.solarPanel.watts}W)</td>
                <td>${quotationData.solarPanel.company} ${quotationData.solarPanel.watts}W</td>
                <td>${quotationData.solarPanel.quantity}</td>
                <td>${panelPrice.toLocaleString()}</td>
                <td>${(panelPrice * quotationData.solarPanel.quantity).toLocaleString()}</td>
              </tr>
              <tr>
                <td>4</td>
                <td>Mounting Structure</td>
                <td>${quotationData.stand.type}</td>
                <td>${standQty}</td>
                <td>${quotationData.stand.pricePerStand.toLocaleString()}</td>
                <td>${(standQty * quotationData.stand.pricePerStand).toLocaleString()}</td>
              </tr>
              <tr>
                <td>5</td>
                <td>Safety Equipment</td>
                <td>DC/AC Breakers, Surge Protectors</td>
                <td>1 Set</td>
                <td>${quotationData.safety.toLocaleString()}</td>
                <td>${quotationData.safety.toLocaleString()}</td>
              </tr>
              <tr>
                <td>6</td>
                <td>Transportation</td>
                <td>Delivery to ${quotationData.location}</td>
                <td>1</td>
                <td>${quotationData.transport.toLocaleString()}</td>
                <td>${quotationData.transport.toLocaleString()}</td>
              </tr>
              <tr>
                <td>7</td>
                <td>Installation & Commissioning</td>
                <td>Professional Installation</td>
                <td>1</td>
                <td>${quotationData.labour.toLocaleString()}</td>
                <td>${quotationData.labour.toLocaleString()}</td>
              </tr>
              ${quotationData.engineer > 0 ? `<tr>
                <td>8</td>
                <td>Engineering Supervision</td>
                <td>Technical Oversight</td>
                <td>1</td>
                <td>${quotationData.engineer.toLocaleString()}</td>
                <td>${quotationData.engineer.toLocaleString()}</td>
              </tr>` : ''}
              ${quotationData.Greenmeter > 0 ? `<tr>
                <td>9</td>
                <td>Green meter</td>
                <td>Net Metering Setup</td>
                <td>1</td>
                <td>${quotationData.Greenmeter.toLocaleString()}</td>
                <td>${quotationData.Greenmeter.toLocaleString()}</td>
              </tr>` : ''}
            </tbody>
          </table>
        </div>
        
        <!-- Total Section -->
        <div class="total-section-print">
          <h2 style="font-size: 1.3rem; font-weight: 700; color: #FF6B35; margin: 0 0 8px 0;">TOTAL SYSTEM COST</h2>
          <div style="font-size: 2rem; font-weight: 900; color: #E65100; margin: 0 0 8px 0;">Rs. ${quotationData.total.toLocaleString()}</div>
          <p style="font-size: 0.8rem; color: #666; font-style: italic; margin: 0;">*All prices are inclusive of installation and commissioning</p>
        </div>
        
        <!-- Terms and Conditions -->
        <div class="terms-section">
          <h3 style="font-size: 1rem; font-weight: 700; color: #FF6B35; margin: 0 0 12px 0; border-bottom: 2px solid #FF6B35; padding-bottom: 5px;">📋 TERMS & CONDITIONS</h3>
          <div class="terms-list">
            <div class="terms-column">
              <h4>Payment Terms:</h4>
              <ul>
                <li>05% advance payment required</li>
                <li>70% on material delivery</li>
                <li>25% on successful commissioning</li>
              </ul>
              <h4>Warranty:</h4>
              <ul>
                <li>Solar Panels will be A-Grade</li>
                <li>Daytime Inverter 5-Years(1Year Replace & 4 Years Service</li>
                <li>Hybrid Inverter Depends on Company Policy</li>
                <li>Batteries Depends On Company Policy</li>
                <li>1 year on installation work</li>
              </ul>
            </div>
            <div class="terms-column">
              <h4>Delivery Timeline:</h4>
              <ul>
                <li>1-2 working days from advance</li>
                <li>Installation: 2-3 working days</li>
                <li>Net metering assistance included</li>
              </ul>
              <h4>Additional Services:</h4>
              <ul>
                <li>Free system monitoring setup</li>
                <li>Annual maintenance available</li>
                <li>24/7 technical support</li>
                <li>Performance guarantee</li>
              </ul>
            </div>
          </div>
        </div>
        
        <!-- Footer -->
        <div class="footer">
          <div class="footer-content">
            <div style="flex: 1; font-size: 0.8rem;">
              <p><strong>Thank you for choosing Syed Solar Energy!</strong></p>
              <p>For any queries, please contact us at:</p>
              <p>📞 0307-5596695/03044678929 | 📧 sales@syedsolarenergy.com</p>
            </div>
            <div>
              <div class="signature">
                <div class="signature-line"></div>
                <p><strong>Authorized Signature</strong></p>
                <p>Syed Solar Energy Pvt Ltd</p>
              </div>
            </div>
          </div>
          <div class="footer-bottom">
            <p>This quotation is valid for 3 days from the date of issue & Solar Panels Price may Vary. | Generated on ${new Date().toLocaleString()}</p>
          </div>
        </div>
      </div>
    `;
  };
  
  // Print quotation using browser's print functionality
  const printQuotation = () => {
    if (!currentQuotation) {
      alert("❌ Please generate a quotation first before printing.");
      return;
    }
    printQuotationData(currentQuotation);
  };

  // Print from quotations list
  const printFromList = (quotation) => {
    printQuotationData(quotation);
  };
  
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
  
  // Simple Quotation Preview Component
  const QuotationPreview = ({ quotation }) => {
    if (!quotation) return null;
    
    return (
      <div style={previewStyles.container}>
        <div style={previewStyles.header}>
          <h2 style={previewStyles.title}>Quotation Preview</h2>
          <div style={previewStyles.id}>#{quotation.id}</div>
        </div>
        
        <div style={previewStyles.section}>
          <h3 style={previewStyles.sectionTitle}>Customer Information</h3>
          <p><strong>Name:</strong> {quotation.customer.name}</p>
          <p><strong>Contact:</strong> {quotation.customer.contact}</p>
          <p><strong>Email:</strong> {quotation.customer.email || '-'}</p>
          <p><strong>Address:</strong> {quotation.customer.address}</p>
        </div>
        
        <div style={previewStyles.section}>
          <h3 style={previewStyles.sectionTitle}>System Details</h3>
          <p><strong>Type:</strong> {quotation.systemType}</p>
          <p><strong>Location:</strong> {quotation.location}</p>
          <p><strong>Staff:</strong> {quotation.staff}</p>
        </div>
        
        <div style={previewStyles.section}>
          <h3 style={previewStyles.sectionTitle}>Equipment Summary</h3>
          <p><strong>Inverter:</strong> {quotation.inverter.company} {quotation.inverter.kw}kW</p>
          <p><strong>Battery:</strong> {quotation.batteryModel || 'None'}</p>
          <p><strong>Solar Panels:</strong> {quotation.solarPanel.company} {quotation.solarPanel.watts}W</p>
        </div>
        
        <div style={previewStyles.totalSection}>
          <h2 style={previewStyles.totalTitle}>Total Cost</h2>
          <div style={previewStyles.totalAmount}>Rs. {quotation.total.toLocaleString()}</div>
        </div>
      </div>
    );
  };
  
  // Main component render
  if (showQuotationsList) {
    return (
      <div style={styles.container} data-quotation-app="true">
        <div style={styles.header}>
          <div style={styles.headerContent}>
            <div>
              <h1 style={styles.title}>📋 All Quotations</h1>
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
                <h3 style={styles.quotationTitle}>{quotation.customer.name}</h3>
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
                                   quotation.followUpStatus === 'Contacted' ? '#2196f3' : 
                                   quotation.followUpStatus === 'Completed' ? '#4caf50' :
                                   quotation.followUpStatus === 'Closed' ? '#4caf50' : '#9e9e9e'
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
                  }}
                  style={styles.viewButton}
                >
                  👁️ View
                </button>
                <button
                  onClick={() => printFromList(quotation)}
                  style={styles.downloadButton}
                >
                  🖨️ Print
                </button>
                <button
                  onClick={() => handleDeleteClick(quotation.id)}
                  disabled={deletingQuotationId === quotation.id}
                  style={{
                    ...styles.deleteButton,
                    opacity: deletingQuotationId === quotation.id ? 0.7 : 1,
                    cursor: deletingQuotationId === quotation.id ? 'not-allowed' : 'pointer'
                  }}
                >
                  {deletingQuotationId === quotation.id ? '⏳' : '🗑️'} Delete
                </button>
              </div>
              
              {/* Delete Confirmation Modal */}
              {confirmDeleteId === quotation.id && (
                <div style={styles.confirmModal}>
                  <div style={styles.confirmContent}>
                    <h4 style={{ color: '#d32f2f', margin: '0 0 10px 0' }}>⚠️ Confirm Delete</h4>
                    <p style={{ margin: '0 0 15px 0' }}>
                      Are you sure you want to delete this quotation? This action cannot be undone.
                    </p>
                    <div style={styles.confirmButtons}>
                      <button
                        onClick={cancelDelete}
                        style={styles.cancelButton}
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => deleteQuotation(quotation.id)}
                        style={styles.confirmDeleteButton}
                        disabled={deletingQuotationId === quotation.id}
                      >
                        {deletingQuotationId === quotation.id ? 'Deleting...' : 'Delete'}
                      </button>
                    </div>
                  </div>
                </div>
              )}
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
      <div style={styles.previewContainer} data-quotation-app="true">
        <div style={styles.previewHeader}>
          <h1 style={styles.previewTitle}>📋 Quotation Preview</h1>
          <div style={styles.previewActions}>
            <button
              onClick={() => setShowPreview(false)}
              style={styles.backButton}
            >
              ← Back to List
            </button>
            <button
              onClick={() => printQuotation()}
              style={styles.downloadButton}
              disabled={isGeneratingPDF}
            >
              {isGeneratingPDF ? "⏳ Generating..." : "🖨️ Print/Save PDF"}
            </button>
            <button
              onClick={resetForm}
              style={styles.newQuotationButton}
            >
              ➕ New Quotation
            </button>
          </div>
        </div>
        
        <QuotationPreview quotation={currentQuotation} />
      </div>
    );
  }
  
  return (
    <div style={styles.container} data-quotation-app="true">
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
              📋 View All Quotations ({savedQuotations.length})
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
              {savedQuotations.filter(q => ['pending', 'contacted'].includes(q.followUpStatus?.toLowerCase() || 'pending')).length}
            </div>
            <div style={styles.analyticsTitle}>Needs Follow-up</div>
          </div>
        </div>
        <div style={styles.analyticsCard}>
          <div style={styles.analyticsIcon}>✅</div>
          <div style={styles.analyticsContent}>
            <div style={styles.analyticsValue}>
              {savedQuotations.filter(q => ['Closed', 'Completed'].includes(q.followUpStatus || 'Pending')).length}
            </div>
            <div style={styles.analyticsTitle}>Completed Deals</div>
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
                  style={styles.numberInput}
                  min="1"
                />
              </div>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Price per Unit (Rs)</label>
                <input
                  type="text"
                  value={inverter.pricePerUnit}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^0-9]/g, '');
                    setInverter({...inverter, pricePerUnit: parseInt(value) || 0});
                  }}
                  style={styles.numberInput}
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
                  style={styles.numberInput}
                  min="1"
                />
              </div>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Price per Unit (Rs)</label>
                <input
                  type="text"
                  value={batteryPrice}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^0-9]/g, '');
                    setBatteryPrice(parseInt(value) || 0);
                  }}
                  style={styles.numberInput}
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
                  style={styles.numberInput}
                  min="1"
                />
              </div>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Price per Watt (Rs)</label>
                <input
                  type="text"
                  value={solarPanel.pricePerWatt}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^0-9.]/g, '');
                    setSolarPanel({...solarPanel, pricePerWatt: parseFloat(value) || 0});
                  }}
                  style={styles.numberInput}
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
                  type="text"
                  value={stand.pricePerStand}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^0-9]/g, '');
                    setStand({...stand, pricePerStand: parseInt(value) || 0});
                  }}
                  style={styles.numberInput}
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
                  type="text"
                  value={safety}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^0-9]/g, '');
                    setSafety(parseInt(value) || 0);
                  }}
                  style={styles.numberInput}
                />
              </div>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Transportation (Rs)</label>
                <input
                  type="text"
                  value={transport}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^0-9]/g, '');
                    setTransport(parseInt(value) || 0);
                  }}
                  style={styles.numberInput}
                />
              </div>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Labour Cost (Rs)</label>
                <input
                  type="text"
                  value={labour}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^0-9]/g, '');
                    setLabour(parseInt(value) || 0);
                  }}
                  style={styles.numberInput}
                />
              </div>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Engineering Cost (Rs)</label>
                <input
                  type="text"
                  value={engineer}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^0-9]/g, '');
                    setEngineer(parseInt(value) || 0);
                  }}
                  style={styles.numberInput}
                />
              </div>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Greenmeter Cost (Rs)</label>
                <input
                  type="text"
                  value={Greenmeter}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^0-9]/g, '');
                    setGreenmeter(parseInt(value) || 0);
                  }}
                  style={styles.numberInput}
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

// Preview styles
const previewStyles = {
  container: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '20px',
    margin: '20px auto',
    maxWidth: '800px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    fontFamily: "'Segoe UI', Arial, sans-serif",
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
    paddingBottom: '15px',
    borderBottom: '2px solid #FF6B35',
  },
  title: {
    fontSize: '1.8rem',
    fontWeight: '700',
    color: '#FF6B35',
    margin: 0,
  },
  id: {
    backgroundColor: '#FF6B35',
    color: 'white',
    padding: '5px 10px',
    borderRadius: '15px',
    fontWeight: '600',
  },
  section: {
    marginBottom: '25px',
    padding: '15px',
    backgroundColor: '#f8f9fa',
    borderRadius: '8px',
  },
  sectionTitle: {
    fontSize: '1.2rem',
    fontWeight: '600',
    color: '#FF6B35',
    margin: '0 0 12px 0',
  },
  totalSection: {
    backgroundColor: '#FFF8F0',
    padding: '20px',
    borderRadius: '8px',
    border: '2px solid #FF6B35',
    textAlign: 'center',
    marginTop: '20px',
  },
  totalTitle: {
    fontSize: '1.4rem',
    fontWeight: '700',
    color: '#FF6B35',
    margin: '0 0 8px 0',
  },
  totalAmount: {
    fontSize: '2.2rem',
    fontWeight: '900',
    color: '#E65100',
    margin: 0,
  },
};

// Enhanced responsive styles for universal screen fitting
const styles = {
  container: {
    padding: '15px',
    background: 'linear-gradient(135deg, #FFF8F0 0%, #FFEBDD 100%)',
    minHeight: '100vh',
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
  },
  header: {
    background: 'linear-gradient(135deg, #FF6B35, #F7931E)',
    borderRadius: '20px',
    padding: '20px 30px',
    marginBottom: '25px',
    color: 'white',
    boxShadow: '0 10px 30px rgba(255, 107, 53, 0.3)',
  },
  headerContent: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '15px',
  },
  title: {
    fontSize: 'clamp(1.8rem, 4vw, 2.5rem)',
    fontWeight: '700',
    margin: '0 0 8px 0',
    textShadow: '0 2px 10px rgba(0,0,0,0.2)',
  },
  subtitle: {
    fontSize: 'clamp(0.9rem, 2vw, 1.1rem)',
    opacity: '0.9',
    margin: 0,
    fontWeight: '300',
  },
  headerActions: {
    display: 'flex',
    gap: '10px',
    flexWrap: 'wrap',
  },
  viewQuotationsButton: {
    background: 'rgba(255, 255, 255, 0.2)',
    color: 'white',
    border: '2px solid rgba(255, 255, 255, 0.3)',
    borderRadius: '12px',
    padding: '10px 16px',
    cursor: 'pointer',
    fontSize: 'clamp(0.8rem, 1.5vw, 0.9rem)',
    fontWeight: '600',
    transition: 'all 0.3s ease',
    backdropFilter: 'blur(10px)',
    whiteSpace: 'nowrap',
  },
  analyticsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: '15px',
    marginBottom: '25px',
  },
  analyticsCard: {
    background: 'linear-gradient(135deg, #FF6B35, #F7931E)',
    borderRadius: '15px',
    padding: '15px',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    boxShadow: '0 8px 25px rgba(255, 107, 53, 0.3)',
  },
  analyticsIcon: {
    fontSize: 'clamp(1.5rem, 3vw, 2rem)',
  },
  analyticsContent: {
    flex: 1,
  },
  analyticsValue: {
    fontSize: 'clamp(1.2rem, 2.5vw, 1.5rem)',
    fontWeight: '700',
    marginBottom: '3px',
    wordBreak: 'break-word',
  },
  analyticsTitle: {
    fontSize: 'clamp(0.75rem, 1.5vw, 0.85rem)',
    opacity: '0.9',
  },
  formContainer: {
    background: 'white',
    borderRadius: '20px',
    padding: 'clamp(20px, 4vw, 30px)',
    boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
  },
  formHeader: {
    textAlign: 'center',
    marginBottom: '25px',
  },
  formTitle: {
    fontSize: 'clamp(1.5rem, 3vw, 1.8rem)',
    fontWeight: '700',
    color: '#FF6B35',
    margin: '0 0 8px 0',
  },
  formSubtitle: {
    fontSize: 'clamp(0.9rem, 2vw, 1rem)',
    color: '#666',
    margin: '0',
  },
  formSections: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  formSection: {
    background: '#f9f9f9',
    padding: 'clamp(15px, 3vw, 25px)',
    borderRadius: '15px',
    border: '1px solid #e0e0e0',
  },
  sectionTitle: {
    fontSize: 'clamp(1.1rem, 2.5vw, 1.3rem)',
    fontWeight: '600',
    color: '#FF6B35',
    marginBottom: '15px',
    borderBottom: '2px solid #FFE0CC',
    paddingBottom: '8px',
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: 'clamp(12px, 2vw, 20px)',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
  },
  label: {
    fontWeight: '600',
    marginBottom: '6px',
    color: '#333',
    fontSize: 'clamp(0.85rem, 1.5vw, 1rem)',
  },
  input: {
    padding: '10px 14px',
    border: '2px solid #e0e0e0',
    borderRadius: '10px',
    fontSize: 'clamp(0.9rem, 1.5vw, 1rem)',
    transition: 'border-color 0.3s ease',
    width: '100%',
    boxSizing: 'border-box',
  },
  numberInput: {
    padding: '10px 14px',
    border: '2px solid #e0e0e0',
    borderRadius: '10px',
    fontSize: 'clamp(0.9rem, 1.5vw, 1rem)',
    transition: 'border-color 0.3s ease',
    width: '100%',
    boxSizing: 'border-box',
    MozAppearance: 'textfield',
    WebkitAppearance: 'none',
  },
  checkboxGroup: {
    marginTop: '15px',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: 'clamp(0.9rem, 1.5vw, 1rem)',
    fontWeight: '500',
    color: '#333',
    cursor: 'pointer',
  },
  checkbox: {
    width: '16px',
    height: '16px',
    accentColor: '#FF6B35',
    flexShrink: 0,
  },
  totalSection: {
    background: 'linear-gradient(135deg, #FFF3E0, #FFE0B2)',
    padding: 'clamp(20px, 4vw, 30px)',
    borderRadius: '20px',
    border: '2px solid #FF6B35',
    textAlign: 'center',
  },
  totalDisplay: {
    marginBottom: '20px',
  },
  totalTitle: {
    fontSize: 'clamp(1.4rem, 3vw, 1.8rem)',
    fontWeight: '700',
    color: '#FF6B35',
    margin: '0 0 12px 0',
  },
  totalAmount: {
    fontSize: 'clamp(2rem, 5vw, 3rem)',
    fontWeight: '900',
    color: '#E65100',
    margin: '0',
    textShadow: '0 2px 5px rgba(0,0,0,0.1)',
    wordBreak: 'break-word',
  },
  actionButtons: {
    display: 'flex',
    gap: '15px',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  resetButton: {
    background: 'linear-gradient(135deg, #9e9e9e, #757575)',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    padding: '12px 24px',
    fontSize: 'clamp(0.9rem, 1.5vw, 1rem)',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    minWidth: '120px',
  },
  generateButton: {
    background: 'linear-gradient(135deg, #FF6B35, #F7931E)',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    padding: '12px 24px',
    fontSize: 'clamp(0.9rem, 1.5vw, 1rem)',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 8px 25px rgba(255, 107, 53, 0.3)',
    minWidth: '150px',
  },
  // Preview Container Styles
  previewContainer: {
    padding: '15px',
    background: 'linear-gradient(135deg, #FFF8F0 0%, #FFEBDD 100%)',
    minHeight: '100vh',
  },
  previewHeader: {
    background: 'white',
    borderRadius: '15px',
    padding: '15px',
    marginBottom: '15px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    boxShadow: '0 5px 15px rgba(0,0,0,0.1)',
    flexWrap: 'wrap',
    gap: '15px',
  },
  previewTitle: {
    fontSize: 'clamp(1.4rem, 3vw, 1.8rem)',
    fontWeight: '700',
    color: '#FF6B35',
    margin: '0',
  },
  previewActions: {
    display: 'flex',
    gap: '10px',
    flexWrap: 'wrap',
  },
  // Quotations List Styles
  quotationsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '20px',
    marginTop: '20px',
  },
  quotationCard: {
    background: 'white',
    borderRadius: '15px',
    padding: '20px',
    border: '2px solid #FFE0CC',
    boxShadow: '0 8px 25px rgba(0,0,0,0.1)',
    transition: 'all 0.3s ease',
    position: 'relative',
  },
  quotationHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '12px',
    flexWrap: 'wrap',
    gap: '10px',
  },
  quotationTitle: {
    fontSize: 'clamp(1.1rem, 2.5vw, 1.3rem)',
    fontWeight: '600',
    color: '#333',
    margin: '0',
    wordBreak: 'break-word',
  },
  quotationId: {
    background: 'linear-gradient(135deg, #FF6B35, #F7931E)',
    color: 'white',
    padding: '4px 10px',
    borderRadius: '15px',
    fontSize: 'clamp(0.7rem, 1.5vw, 0.8rem)',
    fontWeight: '600',
    flexShrink: 0,
  },
  quotationDetails: {
    marginBottom: '15px',
    lineHeight: '1.5',
    fontSize: 'clamp(0.85rem, 1.5vw, 0.95rem)',
  },
  statusBadge: {
    color: 'white',
    padding: '3px 8px',
    borderRadius: '10px',
    fontSize: 'clamp(0.7rem, 1.3vw, 0.75rem)',
    fontWeight: '600',
    marginLeft: '5px',
  },
  quotationActions: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap',
  },
  viewButton: {
    background: 'linear-gradient(135deg, #2196f3, #1976d2)',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    padding: '8px 12px',
    cursor: 'pointer',
    fontSize: 'clamp(0.8rem, 1.3vw, 0.85rem)',
    fontWeight: '600',
    flex: 1,
    minWidth: '70px',
    transition: 'all 0.3s ease',
  },
  downloadButton: {
    background: 'linear-gradient(135deg, #4caf50, #45a049)',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    padding: '8px 12px',
    cursor: 'pointer',
    fontSize: 'clamp(0.8rem, 1.3vw, 0.85rem)',
    fontWeight: '600',
    minWidth: '70px',
    transition: 'all 0.3s ease',
  },
  deleteButton: {
    background: 'linear-gradient(135deg, #f44336, #d32f2f)',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    padding: '8px 12px',
    cursor: 'pointer',
    fontSize: 'clamp(0.8rem, 1.3vw, 0.85rem)',
    fontWeight: '600',
    minWidth: '70px',
    transition: 'all 0.3s ease',
  },
  emptyState: {
    textAlign: 'center',
    padding: 'clamp(40px, 8vw, 60px) 20px',
    color: '#666',
  },
  emptyIcon: {
    fontSize: 'clamp(3rem, 6vw, 4rem)',
    marginBottom: '15px',
  },
  backButton: {
    background: 'linear-gradient(135deg, #757575, #616161)',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    padding: '8px 12px',
    cursor: 'pointer',
    fontSize: 'clamp(0.8rem, 1.3vw, 0.85rem)',
    fontWeight: '600',
    transition: 'all 0.3s ease',
    minWidth: '120px',
  },
  newQuotationButton: {
    background: 'linear-gradient(135deg, #FF6B35, #F7931E)',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    padding: '8px 12px',
    cursor: 'pointer',
    fontSize: 'clamp(0.8rem, 1.3vw, 0.85rem)',
    fontWeight: '600',
    transition: 'all 0.3s ease',
    minWidth: '130px',
  },
  // Confirmation Modal Styles
  confirmModal: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '15px',
    zIndex: 1000,
  },
  confirmContent: {
    background: 'white',
    padding: '20px',
    borderRadius: '12px',
    boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
    textAlign: 'center',
    maxWidth: '90vw',
    width: '300px',
    margin: '0 10px',
  },
  confirmButtons: {
    display: 'flex',
    gap: '10px',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  cancelButton: {
    background: '#9e9e9e',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    padding: '8px 16px',
    cursor: 'pointer',
    fontSize: 'clamp(0.8rem, 1.3vw, 0.85rem)',
    fontWeight: '600',
    transition: 'all 0.3s ease',
  },
  confirmDeleteButton: {
    background: '#f44336',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    padding: '8px 16px',
    cursor: 'pointer',
    fontSize: 'clamp(0.8rem, 1.3vw, 0.85rem)',
    fontWeight: '600',
    transition: 'all 0.3s ease',
  },
  
  // Media queries for better responsive behavior
  '@media (max-width: 768px)': {
    container: {
      padding: '10px',
    },
    header: {
      padding: '15px 20px',
      marginBottom: '20px',
    },
    headerContent: {
      flexDirection: 'column',
      alignItems: 'flex-start',
      gap: '10px',
    },
    analyticsGrid: {
      gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
      gap: '10px',
    },
    analyticsCard: {
      padding: '12px',
      flexDirection: 'column',
      textAlign: 'center',
      gap: '8px',
    },
    formContainer: {
      padding: '15px',
    },
    formGrid: {
      gridTemplateColumns: '1fr',
      gap: '12px',
    },
    quotationsGrid: {
      gridTemplateColumns: '1fr',
      gap: '15px',
    },
    quotationActions: {
      flexDirection: 'column',
      gap: '8px',
    },
    viewButton: {
      flex: 'none',
    },
    actionButtons: {
      flexDirection: 'column',
      alignItems: 'center',
    },
    resetButton: {
      minWidth: '200px',
    },
    generateButton: {
      minWidth: '200px',
    },
  },
  
  '@media (max-width: 480px)': {
    title: {
      fontSize: '1.5rem',
    },
    subtitle: {
      fontSize: '0.85rem',
    },
    formTitle: {
      fontSize: '1.3rem',
    },
    totalAmount: {
      fontSize: '1.8rem',
    },
    sectionTitle: {
      fontSize: '1rem',
    },
    quotationCard: {
      padding: '15px',
    },
    quotationHeader: {
      flexDirection: 'column',
      alignItems: 'flex-start',
      gap: '8px',
    },
  },
  
  // Hover effects for better interactivity
  '@media (hover: hover)': {
    'viewQuotationsButton:hover': {
      background: 'rgba(255, 255, 255, 0.3)',
      transform: 'translateY(-2px)',
    },
    'generateButton:hover': {
      transform: 'translateY(-2px)',
      boxShadow: '0 12px 35px rgba(255, 107, 53, 0.4)',
    },
    'resetButton:hover': {
      transform: 'translateY(-2px)',
    },
    'quotationCard:hover': {
      transform: 'translateY(-5px)',
      boxShadow: '0 15px 35px rgba(0,0,0,0.15)',
    },
    'viewButton:hover': {
      transform: 'translateY(-1px)',
      boxShadow: '0 4px 12px rgba(33, 150, 243, 0.3)',
    },
    'downloadButton:hover': {
      transform: 'translateY(-1px)',
      boxShadow: '0 4px 12px rgba(76, 175, 80, 0.3)',
    },
    'deleteButton:hover': {
      transform: 'translateY(-1px)',
      boxShadow: '0 4px 12px rgba(244, 67, 54, 0.3)',
    },
  }
};

export default QuotationForm;