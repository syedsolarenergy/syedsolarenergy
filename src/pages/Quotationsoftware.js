import React, { useState, useEffect, useRef } from 'react';
import { supabase } from "../supabaseClient";

const QuotationSoftware = () => {
  // State variables
  const [customer, setCustomer] = useState({ name: '', contact: '', email: '', address: '' });
  const [staffList] = useState(['Engr. Zubair', 'Engr. Aqib', 'Ahmed Khan', 'Ali Hassan']);
  const [staffName, setStaffName] = useState('');
  const [systemType, setSystemType] = useState('');
  const [location, setLocation] = useState('peshawar');
  const [quotationDate] = useState(new Date().toLocaleDateString('en-PK'));
  
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
  const [greenmeter, setGreenmeter] = useState(140000);
  
  // UI states
  const [quotations, setQuotations] = useState([]);
  const [showPreview, setShowPreview] = useState(false);
  const [showQuotationsList, setShowQuotationsList] = useState(false);
  const [currentQuotation, setCurrentQuotation] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [selectedQuotation, setSelectedQuotation] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [filter, setFilter] = useState('all');
  const [editingQuotation, setEditingQuotation] = useState(null);
  
  // Ref for PDF generation
  const quotationRef = useRef();
  
  // Equipment options
  const inverterCompanies = ['Inverex', 'Ziewnic', 'Growatt', 'Goodwe', '1On', 'Solax', 'Sunlife', 'Longlife'];
  const inverterKW = ['1.2', '3.2', '3.6', '4.2', '5.5', '6.2', '8.0', '10', '12', '15'];
  const batteryTypes = ['Lithium', 'Tubular'];
  const lithium24 = ['Itell 2.56kWh', 'Ziewnic 2.56kWh'];
  const lithium48 = ['Itell 5.12kWh', 'Ziewnic 5.12kWh', 'Solax 5.12kWh', '1On 5.12kWh'];
  const tubular = ['Osaka 1800Ah', 'Osaka 2500Ah', 'Phoenix 1800Ah', 'Phoenix 2500Ah', 'Hawk 1800Ah', 'Hawk 2500Ah'];
  const panelCompanies = ['JA Solar', 'Canadian', 'Longi'];
  const panelWatts = ['585', '590', '605'];
  const standTypes = ['16 Gauge', '18 Gauge', 'Girder', 'L2 (2 panels)'];

  // Load quotations on component mount
  useEffect(() => {
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

  // Database operations
  async function saveQuotationToSupabase(quotationData) {
    const VALID_STATUSES = ['pending', 'contacted', 'completed', 'cancelled'];
    const status = VALID_STATUSES.includes(quotationData.followUpStatus) ? quotationData.followUpStatus : 'pending';

    const supabaseData = {
      quotation_date: quotationData.quotationDate,
      quotation_id: quotationData.id,
      customer_name: quotationData.customer.name,
      customer_contact: quotationData.customer.contact,
      customer_email: quotationData.customer.email || null,
      customer_address: quotationData.customer.address,
      system_type: quotationData.systemType,
      panel_brand: quotationData.solarPanel.company,
      panel_watt: quotationData.solarPanel.watts,
      panel_quantity: quotationData.solarPanel.quantity,
      panel_total: getPanelPrice(quotationData.solarPanel) * quotationData.solarPanel.quantity,
      inverter_type: quotationData.inverter.company || null,
      inverter_size: `${quotationData.inverter.kw}kW` || null,
      inverter_total: quotationData.inverter.quantity * quotationData.inverter.pricePerUnit,
      battery_type: quotationData.batteryType || null,
      battery_model: quotationData.batteryModel || null,
      battery_quantity: quotationData.batteryQuantity || 0,
      battery_total: quotationData.batteryQuantity * quotationData.batteryPrice,
      stand_type: quotationData.stand.type,
      stand_quantity: getStandQty(quotationData.solarPanel.quantity, quotationData.stand.type),
      stand_total: getStandQty(quotationData.solarPanel.quantity, quotationData.stand.type) * quotationData.stand.pricePerStand,
      safety_charges: quotationData.safety,
      transport_charges: quotationData.transport,
      installation_charges: quotationData.labour,
      engineer_charges: quotationData.isEngineerIncluded ? quotationData.engineer : 0,
      green_meter: quotationData.isGreenmeterIncluded,
      green_meter_charges: quotationData.isGreenmeterIncluded ? quotationData.greenmeter : 0,
      total_amount: quotationData.total,
      staff_name: quotationData.staff || null,
      location: quotationData.location || null,
      follow_up_status: status,
      created_at: new Date().toISOString()
    };

    try {
      const { data, error } = await supabase
        .from("quotations")
        .insert([supabaseData])
        .select();
      if (error) throw error;
      return data[0];
    } catch (err) {
      console.error("Save to Supabase error:", err);
      throw err;
    }
  }

  async function loadQuotationsFromSupabase() {
    try {
      const { data, error } = await supabase
        .from("quotations")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;

      return data.map(item => ({
        id: item.quotation_id,
        customer: {
          name: item.customer_name,
          contact: item.customer_contact,
          email: item.customer_email,
          address: item.customer_address
        },
        staff: item.staff_name,
        systemType: item.system_type,
        location: item.location,
        inverter: {
          company: item.inverter_type,
          kw: item.inverter_size?.replace('kW', '') || '0',
          quantity: 1,
          pricePerUnit: item.inverter_total
        },
        batteryType: item.battery_type || '',
        batteryModel: item.battery_model || '',
        batteryQuantity: item.battery_quantity,
        batteryPrice: item.battery_quantity > 0 ? (item.battery_total / item.battery_quantity) : 0,
        solarPanel: {
          company: item.panel_brand,
          watts: item.panel_watt,
          quantity: item.panel_quantity,
          pricePerWatt: item.panel_quantity > 0 ? (item.panel_total / (item.panel_quantity * parseInt(item.panel_watt))) : 0
        },
        stand: {
          type: item.stand_type,
          pricePerStand: item.stand_total / (item.stand_quantity || 1)
        },
        safety: item.safety_charges,
        transport: item.transport_charges,
        labour: item.installation_charges,
        engineer: item.engineer_charges || 0,
        greenmeter: item.green_meter_charges || 0,
        total: item.total_amount,
        followUpStatus: item.follow_up_status || 'pending',
        quotationDate: item.created_at,
        isGreenmeterIncluded: item.green_meter,
        isEngineerIncluded: item.engineer_charges > 0
      }));
    } catch (err) {
      console.error("Load from Supabase error:", err);
      return [];
    }
  }

  async function updateQuotationInSupabase(quotationId, updatedData) {
    const VALID_STATUSES = ['pending', 'contacted', 'completed', 'cancelled'];
    const status = VALID_STATUSES.includes(updatedData.followUpStatus) ? updatedData.followUpStatus : 'pending';

    const supabaseData = {
      quotation_id: updatedData.id,
      customer_name: updatedData.customer.name,
      customer_contact: updatedData.customer.contact,
      customer_email: updatedData.customer.email || null,
      customer_address: updatedData.customer.address,
      system_type: updatedData.systemType,
      panel_brand: updatedData.solarPanel.company,
      panel_watt: updatedData.solarPanel.watts,
      panel_quantity: updatedData.solarPanel.quantity,
      panel_total: updatedData.solarPanel.pricePerWatt * updatedData.solarPanel.quantity * parseInt(updatedData.solarPanel.watts),
      inverter_type: updatedData.inverter.company || null,
      inverter_size: `${updatedData.inverter.kw}kW` || null,
      inverter_total: updatedData.inverter.quantity * updatedData.inverter.pricePerUnit,
      battery_type: updatedData.batteryType || null,
      battery_model: updatedData.batteryModel || null,
      battery_quantity: updatedData.batteryQuantity || 0,
      battery_total: updatedData.batteryQuantity * updatedData.batteryPrice,
      stand_type: updatedData.stand.type,
      stand_quantity: getStandQty(updatedData.solarPanel.quantity, updatedData.stand.type),
      stand_total: getStandQty(updatedData.solarPanel.quantity, updatedData.stand.type) * updatedData.stand.pricePerStand,
      safety_charges: updatedData.safety,
      transport_charges: updatedData.transport,
      installation_charges: updatedData.labour,
      engineer_charges: updatedData.isEngineerIncluded ? updatedData.engineer : 0,
      green_meter: updatedData.isGreenmeterIncluded,
      green_meter_charges: updatedData.isGreenmeterIncluded ? updatedData.greenmeter : 0,
      total_amount: updatedData.total,
      staff_name: updatedData.staff || null,
      location: updatedData.location || null,
      follow_up_status: status,
      updated_at: new Date().toISOString()
    };

    try {
      const { data, error } = await supabase
        .from("quotations")
        .update(supabaseData)
        .eq("quotation_id", quotationId)
        .select();
      if (error) throw error;
      return data[0];
    } catch (err) {
      console.error("Update in Supabase error:", err);
      throw err;
    }
  }

  async function deleteQuotationFromSupabase(quotationId) {
    try {
      const { error } = await supabase
        .from("quotations")
        .delete()
        .eq("quotation_id", quotationId);
      if (error) throw error;
      return true;
    } catch (err) {
      console.error("Delete from Supabase error:", err);
      throw err;
    }
  }

  // Sync operations
  async function loadAllQuotations() {
    setIsLoading(true);
    try {
      const supabaseQuotations = await loadQuotationsFromSupabase();
      setQuotations(supabaseQuotations);
    } catch (err) {
      console.error("Error loading quotations:", err);
      alert("Failed to load quotations from database.");
      setQuotations([]);
    } finally {
      setIsLoading(false);
    }
  }

  async function syncQuotations() {
    setIsSyncing(true);
    try {
      await loadAllQuotations();
    } finally {
      setIsSyncing(false);
    }
  }

  // Helper functions
  const getBatteryOptions = () => {
    const kw = parseFloat(inverter.kw);
    if (batteryType === 'Lithium') return kw <= 4.2 ? lithium24 : lithium48;
    if (batteryType === 'Tubular') return tubular;
    return [];
  };
  
  const getPanelPrice = (panel = solarPanel) => parseFloat(panel.pricePerWatt) * parseInt(panel.watts || 0);
  const getStandQty = (qty = solarPanel.quantity, type = stand.type) => 
    type === 'L2 (2 panels)' ? Math.ceil(qty / 2) : qty;
  
  const getTotal = () =>
    inverter.quantity * inverter.pricePerUnit +
    batteryQuantity * batteryPrice +
    getPanelPrice() * solarPanel.quantity +
    getStandQty() * stand.pricePerStand +
    safety + transport + labour + (isEngineerIncluded ? engineer : 0) +
    (isGreenmeterIncluded ? greenmeter : 0);

  // Generate quotation ID
  const generateQuotationId = () => {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `SE-${year}${month}-${random}`;
  };

  // CRUD operations
  const saveQuotation = async () => {
    if (!customer.name || !customer.contact || !staffName || !systemType) {
      alert("Please fill in all required fields: Customer Name, Contact, Staff Name, and System Type");
      return;
    }
    
    setIsSaving(true);
    
    try {
      const quotationId = editingQuotation?.id || generateQuotationId();
      const newQuotation = {
        id: quotationId,
        customer,
        staff: staffName,
        systemType,
        location,
        inverter,
        batteryType,
        batteryModel,
        batteryQuantity,
        batteryPrice,
        solarPanel,
        stand,
        isGreenmeterIncluded,
        greenmeter,
        safety,
        transport,
        labour,
        isEngineerIncluded,
        engineer,
        total: getTotal(),
        date: new Date().toISOString(),
        followUpStatus: editingQuotation?.followUpStatus || "pending",
        quotationDate
      };

      if (editingQuotation) {
        await updateQuotationInSupabase(quotationId, newQuotation);
      } else {
        await saveQuotationToSupabase(newQuotation);
      }

      await loadAllQuotations();
      setCurrentQuotation(newQuotation);
      alert(`✅ Quotation ${editingQuotation ? 'updated' : 'saved'} successfully!`);
      resetForm();
    } catch (err) {
      console.error("Error saving quotation:", err);
      alert(`❌ Error ${editingQuotation ? 'updating' : 'saving'} quotation: ` + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const deleteQuotation = async (quotationId) => {
    try {
      await deleteQuotationFromSupabase(quotationId);
      await loadAllQuotations();
      alert("✅ Quotation deleted successfully!");
      setConfirmDeleteId(null);
    } catch (err) {
      console.error("Error deleting quotation:", err);
      alert("❌ Error deleting quotation: " + err.message);
    }
  };

  // Enhanced print quotation with professional design
  const printQuotation = (quotationData) => {
    try {
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        alert("Please allow pop-ups to print quotations.");
        return;
      }
      
      const quotationHTML = generateQuotationHTML(quotationData);
      
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="UTF-8">
            <title>Quotation - ${quotationData?.customer.name}</title>
            <style>
              * { margin: 0; padding: 0; box-sizing: border-box; }
              body { 
                font-family: 'Arial', sans-serif; 
                background: #fff; 
                color: #333; 
                line-height: 1.6; 
                font-size: 14px;
                margin: 0;
                padding: 20px;
              }
              .container { 
                max-width: 800px; 
                margin: 0 auto; 
                border: 1px solid #ddd;
                border-radius: 10px;
                overflow: hidden;
                box-shadow: 0 0 20px rgba(0,0,0,0.1);
              }
              .header { 
                display: flex; 
                align-items: center; 
                padding: 30px;
                background: linear-gradient(135deg, #FF6B35, #F7931E);
                color: white;
              }
              .logo-container {
                flex: 0 0 100px;
                padding-right: 20px;
              }
              .logo {
                width: 100px;
                height: 100px;
              }
              .company-info { 
                padding-left: 20px;
                flex: 1;
              }
              .company-info h1 { 
                font-size: 28px; 
                margin-bottom: 8px; 
                color: white;
                letter-spacing: 1px;
              }
              .company-info p { 
                margin: 5px 0;
                font-size: 13px;
                opacity: 0.9;
              }
              .quotation-title { 
                background: linear-gradient(135deg, #e65100, #ff9800); 
                color: white; 
                padding: 20px; 
                text-align: center; 
                font-size: 24px; 
                font-weight: bold;
                letter-spacing: 1.5px;
                text-transform: uppercase;
              }
              .quotation-meta {
                display: flex;
                justify-content: space-between;
                padding: 20px;
                background: #f8f9fa;
                border-bottom: 1px solid #eee;
              }
              .customer-section { 
                padding: 30px;
                background: #fff;
                border: 1px solid #ffe0b2;
                border-radius: 10px;
                margin: 20px;
              }
              .customer-section h3 { 
                color: #ff6b35; 
                margin-bottom: 15px; 
                font-size: 18px; 
                border-bottom: 2px solid #ff9800;
                padding-bottom: 8px;
                display: inline-block;
              }
              .customer-details {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                gap: 15px;
              }
              .customer-detail {
                margin-bottom: 10px;
              }
              .customer-detail strong {
                display: inline-block;
                width: 120px;
                color: #4a5568;
              }
              .details-table { 
                width: 100%; 
                border-collapse: collapse; 
                margin: 20px 0;
              }
              .details-table th { 
                background: #ff9800; 
                color: white; 
                padding: 12px 15px; 
                text-align: left; 
                font-weight: bold; 
                font-size: 14px;
              }
              .details-table td { 
                padding: 12px 15px; 
                border-bottom: 1px solid #eee; 
              }
              .details-table tr:nth-child(even) { 
                background: #fff8f0; 
              }
              .item-name { 
                font-weight: bold; 
                color: #2d3748; 
              }
              .item-desc {
                font-size: 13px;
                color: #718096;
                display: block;
                margin-top: 3px;
              }
              .price { 
                font-weight: bold; 
                color: #e65100; 
                text-align: right; 
              }
              .total-row { 
                background: #fff3e0 !important; 
                font-weight: bold; 
                font-size: 16px; 
              }
              .total-row td { 
                border-top: 3px solid #ff9800; 
                color: #e65100; 
                font-weight: bold;
                padding: 20px;
                font-size: 18px;
              }
              .notes-section { 
                padding: 25px;
                background: #fff8f0;
                border-top: 1px solid #eee;
              }
              .notes-section h4 { 
                color: #ff6b35; 
                margin-bottom: 15px; 
                font-size: 16px; 
              }
              .notes-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                gap: 30px;
              }
              .note-block {
                background: white;
                border-radius: 8px;
                padding: 15px;
                box-shadow: 0 3px 10px rgba(0,0,0,0.08);
              }
              .note-block h5 {
                color: #ff6b35;
                margin: 0 0 10px 0;
                padding-bottom: 5px;
                border-bottom: 1px dashed #ffe0b2;
              }
              .note-block ul { 
                padding-left: 20px; 
              }
              .note-block li { 
                padding: 5px 0; 
                font-size: 13px; 
              }
              .footer { 
                text-align: center; 
                padding: 20px;
                background: #ff9800; 
                color: white; 
                font-size: 14px; 
              }
              .signature {
                margin-top: 40px;
                padding-top: 10px;
                border-top: 1px solid #ffe0b2;
                text-align: right;
              }
              .signature p {
                margin: 5px 0;
                font-style: italic;
                color: #4a5568;
              }
              .thank-you {
                text-align: center;
                padding: 20px;
                font-style: italic;
                color: #666;
                border-top: 1px solid #eee;
                margin-top: 20px;
              }
              @media print { 
                body { margin: 0; padding: 0; -webkit-print-color-adjust: exact; } 
                .container { max-width: none; box-shadow: none; border: none; }
                * { color: inherit !important; background: inherit !important; }
              }
            </style>
          </head>
          <body>
            ${quotationHTML}
            <div class="thank-you">
              <p>Thank you for considering Syed Solar Energy for your solar needs. We look forward to serving you!</p>
            </div>
            <script>
              window.onload = function() {
                setTimeout(function() {
                  window.print();
                  window.onafterprint = function() { window.close(); }
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

  const generateQuotationHTML = (quotationData) => {
    return `
      <div class="container">
        <div class="header">
          <div class="logo-container">
            <img src="/logo.png" alt="Syed Solar Energy Logo" class="logo" />
          </div>
          <div class="company-info">
            <h1>Syed Solar Energy Pvt Ltd</h1>
            <p>Office #23, Mustafa Plaza, Ring Road Near Imtiaz Mega Center, Peshawar</p>
            <p><strong>Phone:</strong> 0304-4678929 | <strong>Email:</strong> sales@syedsolarenergy.com</p>
            <p><strong>Website:</strong> www.syedsolarenergy.com</p>
          </div>
        </div>

        <div class="quotation-title">
          SOLAR ENERGY QUOTATION
        </div>

        <div class="quotation-meta">
          <div>
            <p><strong>Quotation ID:</strong> #${quotationData.id}</p>
            <p><strong>Date:</strong> ${quotationData.quotationDate || new Date().toLocaleDateString()}</p>
            <p><strong>Prepared By:</strong> ${quotationData.staff}</p>
          </div>
          <div>
            <p><strong>Customer ID:</strong> C-${quotationData.id.split('-')[2]}</p>
            <p><strong>Valid Until:</strong> ${new Date(Date.now() + 3*24*60*60*1000).toLocaleDateString()}</p>
            <p><strong>Location:</strong> ${quotationData.location}</p>
          </div>
        </div>

        <div class="customer-section">
          <h3>CUSTOMER DETAILS</h3>
          <div class="customer-details">
            <div class="customer-detail"><strong>Name:</strong> ${quotationData.customer.name}</div>
            <div class="customer-detail"><strong>Contact:</strong> ${quotationData.customer.contact}</div>
            <div class="customer-detail"><strong>Email:</strong> ${quotationData.customer.email || 'Not provided'}</div>
            <div class="customer-detail"><strong>Address:</strong> ${quotationData.customer.address}</div>
          </div>
        </div>

        <table class="details-table">
          <thead>
            <tr>
              <th style="width: 45%;">Item Description</th>
              <th style="width: 15%; text-align: center;">Qty</th>
              <th style="width: 20%; text-align: right;">Unit Price</th>
              <th style="width: 20%; text-align: right;">Amount (PKR)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <div class="item-name">Solar Panels</div>
                <div class="item-desc">${quotationData.solarPanel.company} ${quotationData.solarPanel.watts}W Premium Grade</div>
              </td>
              <td style="text-align: center;">${quotationData.solarPanel.quantity}</td>
              <td class="price">Rs. ${quotationData.solarPanel.pricePerWatt.toFixed(2)}/W</td>
              <td class="price">Rs. ${(quotationData.solarPanel.pricePerWatt * quotationData.solarPanel.watts * quotationData.solarPanel.quantity).toLocaleString()}</td>
            </tr>
            
            <tr>
              <td>
                <div class="item-name">${quotationData.systemType.includes('Daytime') ? 'Grid-Tie' : 'Hybrid'} Inverter</div>
                <div class="item-desc">${quotationData.inverter.company} ${quotationData.inverter.kw}kW</div>
              </td>
              <td style="text-align: center;">${quotationData.inverter.quantity}</td>
              <td class="price">Rs. ${quotationData.inverter.pricePerUnit.toLocaleString()}</td>
              <td class="price">Rs. ${(quotationData.inverter.quantity * quotationData.inverter.pricePerUnit).toLocaleString()}</td>
            </tr>
            
            ${quotationData.batteryQuantity > 0 ? `
            <tr>
              <td>
                <div class="item-name">Battery Bank</div>
                <div class="item-desc">${quotationData.batteryModel} (${quotationData.batteryType})</div>
              </td>
              <td style="text-align: center;">${quotationData.batteryQuantity}</td>
              <td class="price">Rs. ${quotationData.batteryPrice.toLocaleString()}</td>
              <td class="price">Rs. ${(quotationData.batteryQuantity * quotationData.batteryPrice).toLocaleString()}</td>
            </tr>
            ` : ''}
            
            <tr>
              <td>
                <div class="item-name">Mounting Structure</div>
                <div class="item-desc">${quotationData.stand.type} Grade</div>
              </td>
              <td style="text-align: center;">${getStandQty(quotationData.solarPanel.quantity, quotationData.stand.type)}</td>
              <td class="price">Rs. ${quotationData.stand.pricePerStand.toLocaleString()}</td>
              <td class="price">Rs. ${(getStandQty(quotationData.solarPanel.quantity, quotationData.stand.type) * quotationData.stand.pricePerStand).toLocaleString()}</td>
            </tr>
            
            <tr>
              <td>
                <div class="item-name">Safety & Protection Equipment</div>
                <div class="item-desc">Complete safety kit</div>
              </td>
              <td style="text-align: center;">1</td>
              <td class="price">Rs. ${quotationData.safety.toLocaleString()}</td>
              <td class="price">Rs. ${quotationData.safety.toLocaleString()}</td>
            </tr>
            
            <tr>
              <td>
                <div class="item-name">Transportation Charges</div>
                <div class="item-desc">${quotationData.location === 'peshawar' ? 'Within Peshawar' : 'Outside Peshawar'}</div>
              </td>
              <td style="text-align: center;">-</td>
              <td>-</td>
              <td class="price">Rs. ${quotationData.transport.toLocaleString()}</td>
            </tr>
            
            <tr>
              <td>
                <div class="item-name">Professional Installation</div>
                <div class="item-desc">By certified technicians</div>
              </td>
              <td style="text-align: center;">-</td>
              <td>-</td>
              <td class="price">Rs. ${quotationData.labour.toLocaleString()}</td>
            </tr>
            
            ${quotationData.isEngineerIncluded ? `
            <tr>
              <td>
                <div class="item-name">Engineering Supervision</div>
                <div class="item-desc">Professional oversight</div>
              </td>
              <td style="text-align: center;">-</td>
              <td>-</td>
              <td class="price">Rs. ${quotationData.engineer.toLocaleString()}</td>
            </tr>
            ` : ''}
            
            ${quotationData.isGreenmeterIncluded ? `
            <tr>
              <td>
                <div class="item-name">Net Metering (Green Meter)</div>
                <div class="item-desc">Government documentation</div>
              </td>
              <td style="text-align: center;">1</td>
              <td class="price">Rs. ${quotationData.greenmeter.toLocaleString()}</td>
              <td class="price">Rs. ${quotationData.greenmeter.toLocaleString()}</td>
            </tr>
            ` : ''}
            
            <tr class="total-row">
              <td colspan="3" style="text-align: right; font-size: 16px;">
                <strong>GRAND TOTAL</strong>
              </td>
              <td class="price" style="font-size: 18px;">
                <strong>Rs. ${quotationData.total.toLocaleString()}</strong>
              </td>
            </tr>
          </tbody>
        </table>

        <div class="notes-section">
          <h4>TERMS & CONDITIONS</h4>
          <div class="notes-grid">
            <div class="note-block">
              <h5>🛡️ WARRANTY INFORMATION</h5>
              <ul>
                <li>Solar Panels: A-Grade warranty</li>
                <li>Inverters: 5 years comprehensive warranty</li>
                <li>Batteries: Manufacturer warranty terms apply</li>
                <li>Installation: 3 months service warranty</li>
              </ul>
            </div>
            
            <div class="note-block">
              <h5>💳 PAYMENT TERMS</h5>
              <ul>
                <li>Booking: 5% advance payment</li>
                <li>Material Delivery: 70% payment</li>
                <li>Completion: 25% final payment</li>
                <li>Validity: 3 days from quotation date</li>
              </ul>
            </div>
            
            <div class="note-block">
              <h5>📝 IMPORTANT NOTES</h5>
              <ul>
                <li>Prices subject to change without notice</li>
                <li>Installation timeline: 1-2 days after payment</li>
                <li>Site survey required before installation</li>
                <li>Taxes not included in pricing</li>
              </ul>
            </div>
          </div>
        </div>
        
        <div class="signature">
          <p>For Syed Solar Energy Pvt Ltd</p>
          <p>_________________________</p>
          <p>Authorized Signature</p>
        </div>

        <div class="footer">
          Thank you for choosing Syed Solar Energy | Powering a Sustainable Future
        </div>
      </div>
    `;
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
    setIsEngineerIncluded(false);
    setCurrentQuotation(null);
    setShowPreview(false);
    setEditingQuotation(null);
  };

  const loadQuotationForEditing = (quotation) => {
    setCustomer(quotation.customer);
    setStaffName(quotation.staff);
    setSystemType(quotation.systemType);
    setLocation(quotation.location || 'peshawar');
    setInverter(quotation.inverter);
    setBatteryType(quotation.batteryType || '');
    setBatteryModel(quotation.batteryModel || '');
    setBatteryQuantity(quotation.batteryQuantity || 1);
    setBatteryPrice(quotation.batteryPrice || 0);
    setSolarPanel(quotation.solarPanel);
    setStand(quotation.stand);
    setIsGreenmeterIncluded(quotation.isGreenmeterIncluded || false);
    setSafety(quotation.safety);
    setTransport(quotation.transport);
    setIsEngineerIncluded(quotation.isEngineerIncluded || false);
    setLabour(quotation.labour);
    setEngineer(quotation.engineer || 10000);
    setGreenmeter(quotation.greenmeter || 140000);
    setEditingQuotation(quotation);
    setShowQuotationsList(false);
  };

  // Filter quotations based on status
  const getFilteredQuotations = () => {
    if (filter === 'all') return quotations;
    return quotations.filter(q => {
      const status = q.followUpStatus || 'pending';
      if (filter === 'pending') return ['pending', 'contacted'].includes(status);
      if (filter === 'completed') return status === 'completed';
      if (filter === 'cancelled') return status === 'cancelled';
      return true;
    });
  };

  // Render quotations list
  if (showQuotationsList) {
    const filteredQuotations = getFilteredQuotations();
    
    return (
      <div style={styles.container}>
        <div style={styles.header}>
          <div style={styles.headerContent}>
            <div>
              <h1 style={styles.title}>📋 All Quotations</h1>
              <p style={styles.subtitle}>Manage and track all your quotations</p>
              <div style={styles.syncStatus}>
                {isSyncing ? "🔄 Syncing..." : `📊 ${quotations.length} total quotations`}
              </div>
            </div>
            <div style={styles.headerActions}>
              <button onClick={syncQuotations} disabled={isSyncing} style={styles.syncButton}>
                {isSyncing ? "🔄 Syncing..." : "🔄 Sync Now"}
              </button>
              <button onClick={() => setShowQuotationsList(false)} style={styles.backButton}>
                ← Back to Generator
              </button>
            </div>
          </div>
        </div>

        {/* Filter buttons */}
        <div style={styles.filterContainer}>
          <button 
            onClick={() => setFilter('all')} 
            style={{...styles.filterButton, ...(filter === 'all' ? styles.filterButtonActive : {})}}
          >
            All ({quotations.length})
          </button>
          <button 
            onClick={() => setFilter('pending')} 
            style={{...styles.filterButton, ...(filter === 'pending' ? styles.filterButtonActive : {})}}
          >
            Pending ({quotations.filter(q => ['pending', 'contacted'].includes(q.followUpStatus || 'pending')).length})
          </button>
          <button 
            onClick={() => setFilter('completed')} 
            style={{...styles.filterButton, ...(filter === 'completed' ? styles.filterButtonActive : {})}}
          >
            Completed ({quotations.filter(q => q.followUpStatus === 'completed').length})
          </button>
          <button 
            onClick={() => setFilter('cancelled')} 
            style={{...styles.filterButton, ...(filter === 'cancelled' ? styles.filterButtonActive : {})}}
          >
            Cancelled ({quotations.filter(q => q.followUpStatus === 'cancelled').length})
          </button>
        </div>

        {isLoading ? (
          <div style={styles.loadingContainer}>
            <div style={styles.loadingSpinner}>⏳</div>
            <p>Loading quotations...</p>
          </div>
        ) : (
          <div style={styles.quotationsGrid}>
            {filteredQuotations.map((quotation, index) => (
              <div key={quotation.id || index} style={styles.quotationCard}>
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
                      backgroundColor: 
                        quotation.followUpStatus === 'pending' ? '#ff9800' :
                        quotation.followUpStatus === 'contacted' ? '#2196f3' :
                        quotation.followUpStatus === 'completed' ? '#4caf50' :
                        quotation.followUpStatus === 'cancelled' ? '#f44336' : '#9e9e9e'
                    }}>
                      {quotation.followUpStatus || 'pending'}
                    </span>
                  </p>
                </div>
                
                <div style={styles.quotationActions}>
                  <button 
                    onClick={() => setSelectedQuotation(quotation)}
                    style={styles.viewButton}
                  >
                    👁️ View
                  </button>
                  <button 
                    onClick={() => loadQuotationForEditing(quotation)}
                    style={styles.editButton}
                  >
                    ✏️ Edit
                  </button>
                  <button 
                    onClick={() => printQuotation(quotation)}
                    style={styles.printButton}
                  >
                    🖨️ Print
                  </button>
                  <button 
                    onClick={() => setConfirmDeleteId(quotation.id)}
                    style={styles.deleteButton}
                  >
                    🗑️ Delete
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
                          onClick={() => setConfirmDeleteId(null)}
                          style={styles.cancelButton}
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => deleteQuotation(quotation.id)}
                          style={styles.confirmDeleteButton}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
            
            {filteredQuotations.length === 0 && (
              <div style={styles.emptyState}>
                <div style={styles.emptyIcon}>📋</div>
                <h3>No quotations found</h3>
                <p>No quotations match the selected filter</p>
              </div>
            )}
          </div>
        )}

        {/* View Quotation Modal */}
        {selectedQuotation && (
          <div style={styles.modal}>
            <div style={styles.modalContent}>
              <div style={styles.modalHeader}>
                <h2>📋 Quotation Details</h2>
                <button onClick={() => setSelectedQuotation(null)} style={styles.closeButton}>
                  ✕
                </button>
              </div>
              
              <div style={styles.modalBody}>
                <div style={styles.detailsGrid}>
                  <div>
                    <h3>Customer Information</h3>
                    <p><strong>Name:</strong> {selectedQuotation.customer.name}</p>
                    <p><strong>Contact:</strong> {selectedQuotation.customer.contact}</p>
                    <p><strong>Email:</strong> {selectedQuotation.customer.email || '-'}</p>
                    <p><strong>Address:</strong> {selectedQuotation.customer.address}</p>
                  </div>
                  
                  <div>
                    <h3>System Details</h3>
                    <p><strong>Type:</strong> {selectedQuotation.systemType}</p>
                    <p><strong>Location:</strong> {selectedQuotation.location}</p>
                    <p><strong>Staff:</strong> {selectedQuotation.staff}</p>
                    <p><strong>Status:</strong> {selectedQuotation.followUpStatus || 'pending'}</p>
                  </div>
                </div>
                
                <div style={styles.equipmentSummary}>
                  <h3>Equipment Summary</h3>
                  <p><strong>Solar Panels:</strong> {selectedQuotation.solarPanel.quantity}x {selectedQuotation.solarPanel.company} {selectedQuotation.solarPanel.watts}W</p>
                  <p><strong>Inverter:</strong> {selectedQuotation.inverter.company} {selectedQuotation.inverter.kw}kW</p>
                  {selectedQuotation.batteryQuantity > 0 && (
                    <p><strong>Battery:</strong> {selectedQuotation.batteryQuantity}x {selectedQuotation.batteryModel}</p>
                  )}
                  <p><strong>Total Cost:</strong> Rs. {selectedQuotation.total.toLocaleString()}</p>
                </div>
              </div>
              
              <div style={styles.modalActions}>
                <button 
                  onClick={() => printQuotation(selectedQuotation)}
                  style={styles.printButton}
                >
                  🖨️ Print
                </button>
                <button 
                  onClick={() => loadQuotationForEditing(selectedQuotation)}
                  style={styles.editButton}
                >
                  ✏️ Edit
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Main quotation form
  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.headerContent}>
          <div>
            <h1 style={styles.title}>
              {editingQuotation ? '✏️ Edit Quotation' : '🧾 Quotation Generator'}
            </h1>
            <p style={styles.subtitle}>
              {editingQuotation ? `Editing #${editingQuotation.id}` : 'Create quotations with automatic database sync'}
            </p>
            <div style={styles.syncStatus}>
              {isSyncing ? "🔄 Syncing..." : `📊 ${quotations.length} total quotations`}
            </div>
          </div>
          <div style={styles.headerActions}>
            <button onClick={syncQuotations} disabled={isSyncing} style={styles.syncButton}>
              {isSyncing ? "🔄 Syncing..." : "🔄 Sync"}
            </button>
            <button onClick={() => setShowQuotationsList(true)} style={styles.viewQuotationsButton}>
              📋 View All ({quotations.length})
            </button>
            {editingQuotation && (
              <button 
                onClick={resetForm}
                style={styles.cancelEditButton}
              >
                Cancel Edit
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Analytics Cards */}
      <div style={styles.analyticsGrid}>
        <div style={styles.analyticsCard}>
          <div style={styles.analyticsIcon}>📊</div>
          <div style={styles.analyticsContent}>
            <div style={styles.analyticsValue}>{quotations.length}</div>
            <div style={styles.analyticsTitle}>Total Quotations</div>
          </div>
        </div>
        <div style={styles.analyticsCard}>
          <div style={styles.analyticsIcon}>💰</div>
          <div style={styles.analyticsContent}>
            <div style={styles.analyticsValue}>
              Rs {quotations.reduce((sum, q) => sum + (q.total || 0), 0).toLocaleString()}
            </div>
            <div style={styles.analyticsTitle}>Total Value</div>
          </div>
        </div>
        <div style={styles.analyticsCard}>
          <div style={styles.analyticsIcon}>📞</div>
          <div style={styles.analyticsContent}>
            <div style={styles.analyticsValue}>
              {quotations.filter(q => ['pending', 'contacted'].includes(q.followUpStatus || 'pending')).length}
            </div>
            <div style={styles.analyticsTitle}>Needs Follow-up</div>
          </div>
        </div>
        <div style={styles.analyticsCard}>
          <div style={styles.analyticsIcon}>✅</div>
          <div style={styles.analyticsContent}>
            <div style={styles.analyticsValue}>
              {quotations.filter(q => q.followUpStatus === 'completed').length}
            </div>
            <div style={styles.analyticsTitle}>Completed</div>
          </div>
        </div>
      </div>

      {/* Quotation Form */}
      <div style={styles.formContainer}>
        <div style={styles.formHeader}>
          <h2 style={styles.formTitle}>
            {editingQuotation ? `✏️ Editing Quotation #${editingQuotation.id}` : '💼 Create New Quotation'}
          </h2>
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
                <textarea
                  placeholder="House # 123, Street Name, Area, City"
                  value={customer.address}
                  onChange={(e) => setCustomer({...customer, address: e.target.value})}
                  style={styles.textarea}
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
                  style={styles.select}
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
                  style={styles.select}
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
                  style={styles.select}
                >
                  <option value="peshawar">Peshawar</option>
                  <option value="other">Other Location</option>
                </select>
              </div>
            </div>
          </div>

          {/* Equipment Configuration */}
          <div style={styles.formSection}>
            <h3 style={styles.sectionTitle}>🔌 Equipment Configuration</h3>
            
            {/* Solar Panels */}
            <div style={styles.subsection}>
              <h4>☀️ Solar Panels</h4>
              <div style={styles.formGrid}>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Panel Company</label>
                  <select
                    value={solarPanel.company}
                    onChange={(e) => setSolarPanel({...solarPanel, company: e.target.value})}
                    style={styles.select}
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
                    style={styles.select}
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
                    value={solarPanel.pricePerWatt}
                    onChange={(e) => setSolarPanel({...solarPanel, pricePerWatt: parseFloat(e.target.value) || 0})}
                    style={styles.input}
                    step="0.1"
                  />
                </div>
              </div>
            </div>

            {/* Inverter */}
            <div style={styles.subsection}>
              <h4>🔌 Inverter</h4>
              <div style={styles.formGrid}>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Inverter Company</label>
                  <select
                    value={inverter.company}
                    onChange={(e) => setInverter({...inverter, company: e.target.value})}
                    style={styles.select}
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
                    style={styles.select}
                  >
                    <option value="">Select Capacity</option>
                    {inverterKW.map(kw => (
                      <option key={kw} value={kw}>{kw} kW</option>
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
                  />
                </div>
              </div>
            </div>

            {/* Battery Configuration */}
            {systemType === 'Hybrid' && (
              <div style={styles.subsection}>
                <h4>🔋 Battery Configuration</h4>
                <div style={styles.formGrid}>
                  <div style={styles.inputGroup}>
                    <label style={styles.label}>Battery Type</label>
                    <select
                      value={batteryType}
                      onChange={(e) => setBatteryType(e.target.value)}
                      style={styles.select}
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
                      style={styles.select}
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
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Mounting Structure */}
            <div style={styles.subsection}>
              <h4>🏗️ Mounting Structure</h4>
              <div style={styles.formGrid}>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Stand Type</label>
                  <select
                    value={stand.type}
                    onChange={(e) => setStand({...stand, type: e.target.value})}
                    style={styles.select}
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
                  />
                </div>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Required Quantity</label>
                  <input
                    type="number"
                    value={getStandQty()}
                    readOnly
                    style={{...styles.input, backgroundColor: '#f0f0f0'}}
                  />
                </div>
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
                Include Greenmeter Cost (Rs. {greenmeter.toLocaleString()})
              </label>
            </div>
          </div>

          {/* Total and Actions */}
          <div style={styles.totalSection}>
            <div style={styles.totalDisplay}>
              <h2 style={styles.totalTitle}>Total System Cost</h2>
              <div style={styles.totalAmount}>Rs. {getTotal().toLocaleString()}</div>
              {isSaving && (
                <p style={{ color: '#FF6B35', fontSize: '0.9rem', margin: '10px 0 0 0' }}>
                  💾 {editingQuotation ? 'Updating...' : 'Saving to database...'}
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
                onClick={saveQuotation}
                style={{
                  ...styles.generateButton,
                  opacity: isSaving ? 0.7 : 1,
                  cursor: isSaving ? 'not-allowed' : 'pointer'
                }}
                disabled={isSaving}
              >
                {isSaving ? (
                  editingQuotation ? "⏳ Updating..." : "⏳ Saving..."
                ) : (
                  editingQuotation ? "💾 Update Quotation" : "💾 Save Quotation"
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Comprehensive styles object
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
    fontSize: '2.5rem',
    fontWeight: '700',
    margin: '0 0 8px 0',
    textShadow: '0 2px 10px rgba(0,0,0,0.2)',
  },
  
  subtitle: {
    fontSize: '1.1rem',
    opacity: '0.9',
    margin: 0,
    fontWeight: '300',
  },
  
  syncStatus: {
    fontSize: '0.9rem',
    opacity: '0.8',
    margin: '5px 0 0 0',
  },
  
  headerActions: {
    display: 'flex',
    gap: '10px',
    flexWrap: 'wrap',
  },
  
  syncButton: {
    background: 'rgba(255, 255, 255, 0.2)',
    color: 'white',
    border: '2px solid rgba(255, 255, 255, 0.3)',
    borderRadius: '12px',
    padding: '10px 16px',
    cursor: 'pointer',
    fontSize: '0.9rem',
    fontWeight: '600',
    transition: 'all 0.3s ease',
    backdropFilter: 'blur(10px)',
  },
  
  viewQuotationsButton: {
    background: 'rgba(255, 255, 255, 0.2)',
    color: 'white',
    border: '2px solid rgba(255, 255, 255, 0.3)',
    borderRadius: '12px',
    padding: '10px 16px',
    cursor: 'pointer',
    fontSize: '0.9rem',
    fontWeight: '600',
    transition: 'all 0.3s ease',
    backdropFilter: 'blur(10px)',
  },
  
  cancelEditButton: {
    background: 'rgba(255, 255, 255, 0.2)',
    color: 'white',
    border: '2px solid rgba(255, 255, 0.3)',
    borderRadius: '12px',
    padding: '10px 16px',
    cursor: 'pointer',
    fontSize: '0.9rem',
    fontWeight: '600',
    transition: 'all 0.3s ease',
    backdropFilter: 'blur(10px)',
  },
  
  backButton: {
    background: 'linear-gradient(135deg, #757575, #616161)',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    padding: '8px 12px',
    cursor: 'pointer',
    fontSize: '0.85rem',
    fontWeight: '600',
    transition: 'all 0.3s ease',
    minWidth: '120px',
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
    fontSize: '2rem',
  },
  
  analyticsContent: {
    flex: 1,
  },
  
  analyticsValue: {
    fontSize: '1.5rem',
    fontWeight: '700',
    marginBottom: '3px',
    wordBreak: 'break-word',
  },
  
  analyticsTitle: {
    fontSize: '0.85rem',
    opacity: '0.9',
  },
  
  filterContainer: {
    display: 'flex',
    gap: '10px',
    marginBottom: '20px',
    flexWrap: 'wrap',
  },
  
  filterButton: {
    background: '#f8f9fa',
    border: '2px solid #e9ecef',
    borderRadius: '8px',
    padding: '8px 16px',
    cursor: 'pointer',
    fontSize: '0.9rem',
    fontWeight: '600',
    transition: 'all 0.3s ease',
  },
  
  filterButtonActive: {
    background: '#FF6B35',
    borderColor: '#FF6B35',
    color: 'white',
  },
  
  loadingContainer: {
    textAlign: 'center',
    padding: '60px 20px',
    color: '#666',
  },
  
  loadingSpinner: {
    fontSize: '2rem',
    marginBottom: '15px',
  },
  
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
    fontSize: '1.3rem',
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
    fontSize: '0.8rem',
    fontWeight: '600',
    flexShrink: 0,
  },
  
  quotationDetails: {
    marginBottom: '15px',
    lineHeight: '1.5',
    fontSize: '0.95rem',
  },
  
  statusBadge: {
    color: 'white',
    padding: '3px 8px',
    borderRadius: '10px',
    fontSize: '0.75rem',
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
    fontSize: '0.85rem',
    fontWeight: '600',
    flex: 1,
    minWidth: '70px',
    transition: 'all 0.3s ease',
  },
  
  editButton: {
    background: 'linear-gradient(135deg, #ff9800, #f57c00)',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    padding: '8px 12px',
    cursor: 'pointer',
    fontSize: '0.85rem',
    fontWeight: '600',
    minWidth: '70px',
    transition: 'all 0.3s ease',
  },
  
  printButton: {
    background: 'linear-gradient(135deg, #4caf50, #45a049)',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    padding: '8px 12px',
    cursor: 'pointer',
    fontSize: '0.85rem',
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
    fontSize: '0.85rem',
    fontWeight: '600',
    minWidth: '70px',
    transition: 'all 0.3s ease',
  },
  
  emptyState: {
    textAlign: 'center',
    padding: '60px 20px',
    color: '#666',
    gridColumn: '1 / -1',
  },
  
  emptyIcon: {
    fontSize: '4rem',
    marginBottom: '15px',
  },
  
  modal: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '20px',
  },
  
  modalContent: {
    background: 'white',
    borderRadius: '15px',
    maxWidth: '800px',
    width: '100%',
    maxHeight: '90vh',
    overflow: 'auto',
    boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
  },
  
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px',
    borderBottom: '2px solid #f0f0f0',
    background: 'linear-gradient(135deg, #FF6B35, #F7931E)',
    color: 'white',
    borderRadius: '15px 15px 0 0',
  },
  
  modalBody: {
    padding: '20px',
  },
  
  modalActions: {
    display: 'flex',
    gap: '10px',
    justifyContent: 'flex-end',
    padding: '20px',
    borderTop: '2px solid #f0f0f0',
  },
  
  closeButton: {
    background: 'transparent',
    border: 'none',
    color: 'white',
    fontSize: '1.5rem',
    cursor: 'pointer',
    padding: '5px',
    borderRadius: '5px',
    transition: 'background 0.3s ease',
  },
  
  detailsGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '20px',
    marginBottom: '20px',
  },
  
  equipmentSummary: {
    background: '#f8f9fa',
    padding: '15px',
    borderRadius: '8px',
    border: '1px solid #e9ecef',
  },
  
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
    fontSize: '0.85rem',
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
    fontSize: '0.85rem',
    fontWeight: '600',
    transition: 'all 0.3s ease',
  },
  
  formContainer: {
    background: 'white',
    borderRadius: '20px',
    padding: '30px',
    boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
  },
  
  formHeader: {
    textAlign: 'center',
    marginBottom: '25px',
  },
  
  formTitle: {
    fontSize: '1.8rem',
    fontWeight: '700',
    color: '#FF6B35',
    margin: '0 0 8px 0',
  },
  
  formSections: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
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
    marginBottom: '15px',
    borderBottom: '2px solid #FFE0CC',
    paddingBottom: '8px',
    display: 'inline-block',
  },
  
  subsection: {
    marginBottom: '20px',
    padding: '15px',
    background: '#fff',
    borderRadius: '8px',
    border: '1px solid #eee',
  },
  
  formGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '20px',
  },
  
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
  },
  
  label: {
    fontWeight: '600',
    marginBottom: '6px',
    color: '#333',
    fontSize: '1rem',
  },
  
  input: {
    padding: '10px 14px',
    border: '2px solid #e0e0e0',
    borderRadius: '10px',
    fontSize: '1rem',
    transition: 'border-color 0.3s ease',
    width: '100%',
    boxSizing: 'border-box',
  },
  
  select: {
    padding: '10px 14px',
    border: '2px solid #e0e0e0',
    borderRadius: '10px',
    fontSize: '1rem',
    transition: 'border-color 0.3s ease',
    width: '100%',
    boxSizing: 'border-box',
    background: 'white',
  },
  
  textarea: {
    padding: '10px 14px',
    border: '2px solid #e0e0e0',
    borderRadius: '10px',
    fontSize: '1rem',
    transition: 'border-color 0.3s ease',
    width: '100%',
    boxSizing: 'border-box',
    minHeight: '80px',
    resize: 'vertical',
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
    fontSize: '1rem',
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
    padding: '30px',
    borderRadius: '20px',
    border: '2px solid #FF6B35',
    textAlign: 'center',
  },
  
  totalDisplay: {
    marginBottom: '20px',
  },
  
  totalTitle: {
    fontSize: '1.8rem',
    fontWeight: '700',
    color: '#FF6B35',
    margin: '0 0 12px 0',
  },
  
  totalAmount: {
    fontSize: '3rem',
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
    fontSize: '1rem',
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
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 8px 25px rgba(255, 107, 53, 0.3)',
    minWidth: '150px',
  },
  
  '@media (max-width: 768px)': {
    container: {
      padding: '10px',
    },
    header: {
      padding: '15px 20px',
    },
    headerContent: {
      flexDirection: 'column',
      alignItems: 'flex-start',
    },
    title: {
      fontSize: '2rem',
    },
    formGrid: {
      gridTemplateColumns: '1fr',
    },
    detailsGrid: {
      gridTemplateColumns: '1fr',
    },
    quotationsGrid: {
      gridTemplateColumns: '1fr',
    },
    quotationActions: {
      flexDirection: 'column',
    },
    actionButtons: {
      flexDirection: 'column',
      alignItems: 'center',
    },
  },
};

export default QuotationSoftware;