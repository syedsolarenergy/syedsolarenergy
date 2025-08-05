import React, { useState, useRef, useEffect } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import logo from "../assets/logo.png";
import Footer from "../components/Footer";
import { supabase } from "../supabaseClient";

// CSS Variables for responsive design
const cssVariables = `
  :root {
    --font-size-base: clamp(12px, 1.8vw, 16px);
    --padding-base: clamp(10px, 3vw, 20px);
    --section-padding: clamp(15px, 2.5vw, 25px);
    --card-padding: clamp(15px, 2vw, 20px);
    --heading-1: clamp(1.5rem, 3.5vw, 2rem);
    --heading-2: clamp(1.2rem, 3vw, 1.6rem);
    --heading-3: clamp(1rem, 2.5vw, 1.3rem);
    --text-base: clamp(0.9rem, 1.6vw, 1rem);
  }
  
  /* Remove number input spinners for mobile */
  input[type=number]::-webkit-inner-spin-button,
  input[type=number]::-webkit-outer-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
  
  input[type=number] {
    -moz-appearance: textfield;
  }
  
  @media (max-width: 768px) {
    .preview-container {
      transform: scale(0.85);
      transform-origin: top left;
      width: 120%;
    }
  }
  
  @media (max-width: 480px) {
    .preview-container {
      transform: scale(0.75);
    }
  }
`;

export default function Quotation() {
  // State declarations (same as before)
  const [systemType, setSystemType] = useState("");
  const [autoType, setAutoType] = useState("daytime");
  const [kwAuto, setKwAuto] = useState(5);
  const [panelBrand, setPanelBrand] = useState("");
  const [panelWatt, setPanelWatt] = useState("");
  const [panelQty, setPanelQty] = useState(6);
  const [dayInverter, setDayInverter] = useState("");
  const [hybridInverterBrand, setHybridInverterBrand] = useState("");
  const [hybridInverterCapacity, setHybridInverterCapacity] = useState("");
  const [inverterQty, setInverterQty] = useState(1);
  const [standType, setStandType] = useState("");
  const [batteryType, setBatteryType] = useState("");
  const [batteryModels, setBatteryModels] = useState([]);
  const [selectedBattery, setSelectedBattery] = useState("");
  const [batteryQty, setBatteryQty] = useState(1);
  const [greenMeter, setGreenMeter] = useState(false);
  const [customer, setCustomer] = useState({ name: "", contact: "", email: "", address: "" });
  const [showPreview, setShowPreview] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // Pricing data from Supabase
  const [panelPrices, setPanelPrices] = useState({});
  const [daytimeInverters, setDaytimeInverters] = useState([]);
  const [hybridInverters, setHybridInverters] = useState([]);
  const [batteryPrices, setBatteryPrices] = useState({});
  const [standPrices, setStandPrices] = useState({});
  const [charges, setCharges] = useState({});
  
  // Fetch pricing data from Supabase (same as before)
  useEffect(() => {
    const fetchPricingData = async () => {
      try {
        // Fetch solar panels
        const { data: panels } = await supabase.from("solar_panels").select("*").order('brand, wattage');
        const panelMap = {};
        panels?.forEach(panel => {
          if (!panelMap[panel.brand]) panelMap[panel.brand] = {};
          panelMap[panel.brand][panel.wattage] = {
            price: panel.price,
            pricePerWatt: panel.price_per_watt || (panel.price / panel.wattage).toFixed(2)
          };
        });
        setPanelPrices(panelMap);
        
        // Set initial panel values
        if (panels?.length > 0) {
          setPanelBrand(panels[0].brand);
          setPanelWatt(panels[0].wattage.toString());
        }
        
        // Fetch inverters separately by type
        const { data: inverters } = await supabase.from("inverters").select("*").order('type, capacity');
        const daytimeInvs = inverters?.filter(inv => inv.type === "daytime") || [];
        const hybridInvs = inverters?.filter(inv => inv.type === "hybrid") || [];
        
        setDaytimeInverters(daytimeInvs);
        setHybridInverters(hybridInvs);
        
        // Set initial inverter values
        if (daytimeInvs.length > 0) {
          setDayInverter(daytimeInvs[0].id.toString());
        }
        if (hybridInvs.length > 0) {
          setHybridInverterBrand(hybridInvs[0].brand);
          setHybridInverterCapacity(hybridInvs[0].id.toString());
        }
        
        // Fetch batteries
        const { data: batteries } = await supabase.from("batteries").select("*").order('type, voltage');
        const batteryMap = {};
        batteries?.forEach(batt => {
          batteryMap[batt.id] = {
            ...batt,
            price: batt.price
          };
        });
        setBatteryPrices(batteryMap);
        
        // Set initial battery values
        if (batteries?.length > 0) {
          setBatteryType(batteries[0].type);
          setSelectedBattery(batteries[0].id.toString());
          updateBatteryModels(batteries[0].type, batteries);
        }
        
        // Fetch stands
        const { data: stands } = await supabase.from("stands").select("*").order('type');
        const standMap = {};
        stands?.forEach(stand => {
          standMap[stand.type] = stand.price;
        });
        setStandPrices(standMap);
        
        if (stands?.length > 0) {
          setStandType(stands[0].type);
        }
        
        // Fetch charges
        const { data: chargeData } = await supabase.from("charges").select("*");
        const chargeMap = {};
        chargeData?.forEach(charge => {
          chargeMap[charge.name] = charge.amount;
        });
        setCharges(chargeMap);
      } catch (err) {
        console.error("Error fetching pricing data:", err);
        alert("Error loading pricing data. Please refresh the page.");
      }
    };
    fetchPricingData();
  }, []);
  
  // Auto-update preview when form values change
  useEffect(() => {
    if (systemType && customer.name) {
      setShowPreview(true);
    }
  }, [systemType, customer.name, panelQty, panelBrand, panelWatt, batteryQty, batteryType, selectedBattery, inverterQty]);
  
  // Derived charge values
  const safetyCharges = { 
    daytime: charges.safety_daytime || 25000,
    hybrid: charges.safety_hybrid || 40000,
    hybridHigh: charges.safety_hybrid_high || 45000
  };
  
  const installCharges = {
    daytime: charges.installation_daytime || 15000,
    hybrid: charges.installation_hybrid || 20000
  };
  
  const transportCharges = charges.transport || 5000;
  const greenMeterCharges = charges.green_meter || 140000;
  const siteVisitCharges = charges.site_visit || 2000;
  
  // Enhanced battery filtering logic
  const updateBatteryModels = (type, allBatteries = null) => {
    const batteries = allBatteries || Object.values(batteryPrices);
    
    if (type === "lithium") {
      // Get current inverter capacity for filtering
      const selectedInverter = hybridInverters.find(inv => inv.id.toString() === hybridInverterCapacity);
      const systemCapacity = selectedInverter ? parseFloat(selectedInverter.capacity) : 0;
      
      // For system 4.2kW or less, show 25.6V batteries
      // For system greater than 4.2kW, show 51.2V batteries
      const voltage = systemCapacity <= 4.2 ? "25.6V" : "51.2V";
      const filtered = batteries.filter(batt => batt.type === "lithium" && batt.voltage === voltage);
      setBatteryModels(filtered);
      setBatteryQty(1); // Default quantity for lithium
    } else if (type === "tubular") {
      const filtered = batteries.filter(batt => batt.type === "tubular");
      setBatteryModels(filtered);
      
      // Default quantity based on system capacity
      const selectedInverter = hybridInverters.find(inv => inv.id.toString() === hybridInverterCapacity);
      const systemCapacity = selectedInverter ? parseFloat(selectedInverter.capacity) : 0;
      setBatteryQty(systemCapacity <= 4.2 ? 2 : 4);
    }
  };
  
  // Stand quantity logic
  function getStandQty(qty, stand) {
    if (stand === "L2") return Math.ceil(qty / 2) || 0;
    return qty || 0;
  }
  
  // Enhanced auto suggestion logic
  function getAutoSuggestion() {
    if (autoType === "daytime") {
      const availablePanels = Object.keys(panelPrices);
      const defaultBrand = availablePanels[0] || "Longi";
      const availableWatts = Object.keys(panelPrices[defaultBrand] || {});
      const defaultWatt = availableWatts[0] || "590";
      const qty = Math.ceil((kwAuto * 1000) / parseInt(defaultWatt));
      
      return {
        type: "Daytime",
        panelBrand: defaultBrand,
        panelWatt: defaultWatt,
        panelQty: qty,
        dayInverter: daytimeInverters.find(inv => parseFloat(inv.capacity) >= kwAuto)?.id || daytimeInverters[0]?.id,
        standType: Object.keys(standPrices)[0] || "Elevated 18G",
        inverterQty: 1
      };
    } else {
      const availablePanels = Object.keys(panelPrices);
      const defaultBrand = availablePanels[0] || "Jinko";
      const availableWatts = Object.keys(panelPrices[defaultBrand] || {});
      const defaultWatt = availableWatts[0] || "605";
      const qty = Math.ceil((kwAuto * 1000) / parseInt(defaultWatt));
      
      return {
        type: "Hybrid",
        panelBrand: defaultBrand,
        panelWatt: defaultWatt,
        panelQty: qty,
        hybridInverterBrand: hybridInverters[0]?.brand || "Growatt",
        hybridInverterCapacity: hybridInverters.find(inv => parseFloat(inv.capacity) >= kwAuto)?.id || hybridInverters[0]?.id,
        batteryType: "lithium",
        selectedBattery: Object.values(batteryPrices).find(b => b.type === "lithium")?.id || "",
        batteryQty: kwAuto <= 4.2 ? 1 : 1,
        standType: Object.keys(standPrices)[0] || "Elevated 16G",
        inverterQty: 1
      };
    }
  }
  
  // Handle battery type change with enhanced logic
  const handleBatteryType = (e) => {
    const val = e.target.value;
    setBatteryType(val);
    updateBatteryModels(val);
    setSelectedBattery("");
  };
  
  // Handle hybrid inverter capacity change
  const handleHybridInverterCapacityChange = (e) => {
    const selectedId = e.target.value;
    setHybridInverterCapacity(selectedId);
    
    // Update battery models based on new capacity
    if (batteryType) {
      updateBatteryModels(batteryType);
    }
  };
  
  const handleCustomerChange = (e) => {
    const { name, value } = e.target;
    setCustomer((prev) => ({ ...prev, [name]: value }));
  };
  
  const handleGreenMeter = e => setGreenMeter(e.target.checked);
  
  // Enhanced cost calculations
  function getDaytimeCost(qty, stand, invQty = 1) {
    const panelUnitPrice = panelPrices[panelBrand]?.[panelWatt]?.price || 0;
    const panelTotal = qty * panelUnitPrice;
    const selectedInverter = daytimeInverters.find(inv => inv.id.toString() === dayInverter);
    const invTotal = (selectedInverter?.price || 0) * invQty;
    const standQty = getStandQty(qty, stand);
    const standUnit = standPrices[stand] || 0;
    const standTotal = standUnit * standQty;
    const safety = safetyCharges.daytime;
    const transport = transportCharges;
    const install = installCharges.daytime;
    const green = greenMeter ? greenMeterCharges : 0;
    
    return {
      panelTotal, panelUnitPrice, invTotal, standQty, standUnit, standTotal, 
      safety, transport, install, green,
      selectedInverter,
      grandTotal: panelTotal + invTotal + standTotal + safety + transport + install + green
    };
  }
  
  function getHybridCost(qty, stand, bQty, battModel, invQty = 1) {
    const panelUnitPrice = panelPrices[panelBrand]?.[panelWatt]?.price || 0;
    const panelTotal = qty * panelUnitPrice;
    const selectedInverter = hybridInverters.find(inv => inv.id.toString() === hybridInverterCapacity);
    const invTotal = (selectedInverter?.price || 0) * invQty;
    const selectedBattery = batteryPrices[battModel];
    const battUnit = selectedBattery?.price || 0;
    const battTotal = battUnit * bQty;
    const standQty = getStandQty(qty, stand);
    const standUnit = standPrices[stand] || 0;
    const standTotal = standUnit * standQty;
    const safety = qty <= 16 ? safetyCharges.hybrid : safetyCharges.hybridHigh;
    const transport = transportCharges;
    const install = installCharges.hybrid;
    const green = greenMeter ? greenMeterCharges : 0;
    
    return {
      panelTotal, panelUnitPrice, invTotal, battUnit, battTotal, standQty, standUnit, standTotal,
      safety, transport, install, green, selectedInverter, selectedBattery,
      grandTotal: panelTotal + invTotal + battTotal + standTotal + safety + transport + install + green
    };
  }
  
  // Enhanced Supabase save function with error handling
  async function saveQuotationToSupabase(quotationData) {
    try {
      setSaving(true);
      
      // Log the data for debugging
      console.log("Attempting to save to Supabase:", quotationData);
      
      const { data, error } = await supabase
        .from("quotations")
        .insert([quotationData])
        .select();
        
      if (error) {
        console.error("Supabase error:", error);
        let errorMessage = "Note: Quotation generated successfully, but couldn't save to database.\n\n";
        
        if (error.code === '42P01') {
          errorMessage += "Issue: Table 'quotations' doesn't exist. Please create the table first.";
        } else if (error.code === '42501') {
          errorMessage += "Issue: Permission denied. Please check Row Level Security policies.";
        } else if (error.message?.includes('violates not-null constraint')) {
          errorMessage += "Issue: Missing required field. Please check all required fields are filled.";
          
          // Try to identify the missing field
          const fieldMatch = error.message.match(/column "(.+?)" of relation/);
          if (fieldMatch && fieldMatch[1]) {
            errorMessage += `\nMissing field: ${fieldMatch[1]}`;
          }
        } else if (error.message?.includes('column') && error.message?.includes('does not exist')) {
          errorMessage += "Issue: Database column mismatch. Please check table structure.";
        } else {
          errorMessage += `Issue: ${error.message}\nCode: ${error.code}`;
        }
        
        errorMessage += "\n\nPlease contact support if this persists.";
        alert(errorMessage);
        return null;
      } else {
        return data[0];
      }
    } catch (err) {
      console.error("Unexpected error:", err);
      let errorMessage = "Note: Quotation generated successfully, but couldn't save to database.\n\n";
      
      if (err.name === 'TypeError' && err.message.includes('fetch')) {
        errorMessage += "Issue: Network connection problem. Please check your internet connection.";
      } else if (err.message?.includes('supabase')) {
        errorMessage += "Issue: Supabase configuration problem. Please check your API keys.";
      } else {
        errorMessage += `Issue: ${err.message}`;
      }
      
      errorMessage += "\n\nPlease contact support if this persists.";
      alert(errorMessage);
      return null;
    } finally {
      setSaving(false);
    }
  }
  
  // Enhanced PDF generation with high-quality output
  const pdfRef = useRef();
  async function handleGenerateQuotation(e) {
    e.preventDefault();
    
    // Validate required fields
    if (!customer.name || !customer.contact || !customer.address) {
      alert("Please fill all required customer information fields (*)");
      return;
    }
    
    // Prepare quotation data for Supabase
    let quotationData, sysType, previewConfig, systemLabel;
    
    if (systemType === "auto") {
      previewConfig = getAutoSuggestion();
      sysType = previewConfig.type.toLowerCase();
      systemLabel = "Auto Suggested";
      if (sysType === "daytime") {
        quotationData = getDaytimeCost(previewConfig.panelQty, previewConfig.standType, previewConfig.inverterQty);
      } else {
        quotationData = getHybridCost(
          previewConfig.panelQty,
          previewConfig.standType,
          previewConfig.batteryQty,
          previewConfig.selectedBattery,
          previewConfig.inverterQty
        );
      }
    } else if (systemType === "daytime") {
      sysType = "daytime";
      systemLabel = "Daytime";
      quotationData = getDaytimeCost(panelQty, standType, inverterQty);
    } else if (systemType === "hybrid") {
      sysType = "hybrid";
      systemLabel = "Hybrid";
      quotationData = getHybridCost(panelQty, standType, batteryQty, selectedBattery, inverterQty);
    }
    
    // Enhanced Supabase data preparation
    const supabaseData = {
      customer_name: customer.name,
      customer_contact: customer.contact,
      customer_email: customer.email || null,
      customer_address: customer.address,
      system_type: systemType === "auto" ? `${previewConfig.type} (Auto-Suggested)` : systemType,
      panel_brand: systemType === "auto" ? previewConfig.panelBrand : panelBrand,
      panel_watt: systemType === "auto" ? previewConfig.panelWatt : panelWatt,
      panel_quantity: systemType === "auto" ? previewConfig.panelQty : panelQty,
      panel_total: quotationData.panelTotal,
      inverter_brand: quotationData.selectedInverter?.brand || "",
      inverter_model: quotationData.selectedInverter?.model || "",
      inverter_capacity: quotationData.selectedInverter?.capacity || "",
      inverter_quantity: systemType === "auto" ? previewConfig.inverterQty : inverterQty,
      inverter_total: quotationData.invTotal,
      // Fixed: Set battery fields to empty strings instead of null for non-hybrid systems
      battery_type: sysType === "hybrid" 
        ? (systemType === "auto" ? previewConfig.batteryType : batteryType)
        : "",
      battery_model: sysType === "hybrid" 
        ? (quotationData.selectedBattery?.model || "")
        : "",
      battery_voltage: sysType === "hybrid" 
        ? (quotationData.selectedBattery?.voltage || "")
        : "",
      battery_quantity: sysType === "hybrid" 
        ? (systemType === "auto" ? previewConfig.batteryQty : batteryQty)
        : 0,
      battery_total: quotationData.battTotal || 0,
      stand_type: systemType === "auto" ? previewConfig.standType : standType,
      stand_quantity: quotationData.standQty,
      stand_total: quotationData.standTotal,
      safety_charges: quotationData.safety,
      transport_charges: quotationData.transport,
      installation_charges: quotationData.install,
      green_meter: greenMeter,
      green_meter_charges: quotationData.green,
      total_amount: quotationData.grandTotal,
      quotation_date: new Date().toISOString(),
      created_at: new Date().toISOString()
    };
    
    // Save to Supabase
    const savedData = await saveQuotationToSupabase(supabaseData);
    if (!savedData) return;
    
    // Generate enhanced PDF
    setTimeout(async () => {
      try {
        const input = pdfRef.current;
        const canvas = await html2canvas(input, {
          scale: 3, // Increased scale for better quality
          useCORS: true,
          allowTaint: true,
          backgroundColor: '#ffffff',
          logging: false,
          width: 595, // A4 width in pixels (595pt)
          height: input.scrollHeight
        });
        
        const imgData = canvas.toDataURL("image/png", 1.0);
        const pdf = new jsPDF("p", "pt", "a4");
        
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        const imgWidth = canvas.width;
        const imgHeight = canvas.height;
        
        // Calculate scaling to fit the entire content on one page
        const ratio = Math.min(pdfWidth / imgWidth, (pdfHeight - 40) / imgHeight);
        const imgX = (pdfWidth - imgWidth * ratio) / 2;
        const imgY = 20; // Top margin
        
        // Add the image to the PDF with proper scaling
        pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
        
        pdf.save(`SyedSolarQuotation-${customer.name || "Customer"}-${new Date().toLocaleDateString()}.pdf`);
        
        // Enhanced WhatsApp message
        const whatsappNumber = "923044678929";
        const totalKW = systemType === "auto" ? kwAuto : 
                       (parseInt(panelWatt) * panelQty / 1000).toFixed(1);
        
        const msg = encodeURIComponent(
          `🌞 Assalam-o-Alaikum! I have generated my solar quotation from Syed Solar Energy website.
📋 Quotation Details:
• Name: ${customer.name}
• Contact: ${customer.contact}
• System: ${systemLabel} (${totalKW}kW)
• Total Amount: Rs. ${quotationData.grandTotal.toLocaleString()}
📍 Installation Address:
${customer.address}
🔋 System Specifications:
• Panels: ${systemType === "auto" ? previewConfig.panelQty : panelQty} x ${systemType === "auto" ? previewConfig.panelBrand : panelBrand} (${systemType === "auto" ? previewConfig.panelWatt : panelWatt}W)
• Inverter: ${quotationData.selectedInverter?.brand || ""} ${quotationData.selectedInverter?.capacity || ""} x ${systemType === "auto" ? previewConfig.inverterQty : inverterQty}
${sysType === "hybrid" ? `• Battery: ${quotationData.selectedBattery?.model || ""} x ${systemType === "auto" ? previewConfig.batteryQty : batteryQty}` : ""}
I am interested in installing this solar system. Please review my quotation and contact me to discuss further details, site visit, and installation timeline.
JazakAllah! 🤝`
        );
        
        // Open WhatsApp
        const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${msg}`;
        const opened = window.open(whatsappUrl, "_blank");
        
        if (!opened || opened.closed || typeof opened.closed == "undefined") {
          alert("📱 WhatsApp redirect was blocked. Please allow popups or manually contact: 0304-467-8929");
          window.location.href = whatsappUrl;
        }
        
      } catch (error) {
        console.error("Error generating PDF:", error);
        alert("PDF generated successfully! However, there was an issue with WhatsApp redirect. Please manually contact: 0304-467-8929");
      }
    }, 1000);
  }
  
  // Enhanced preview rendering with responsive design
  function renderQuotationPreview() {
    let data, sysType, sysLabel, previewConfig;
    if (systemType === "auto") {
      previewConfig = getAutoSuggestion();
      sysType = previewConfig.type.toLowerCase();
      sysLabel = previewConfig.type + " (Auto-Suggested)";
      if (sysType === "daytime") {
        data = getDaytimeCost(previewConfig.panelQty, previewConfig.standType, previewConfig.inverterQty);
      } else {
        data = getHybridCost(
          previewConfig.panelQty,
          previewConfig.standType,
          previewConfig.batteryQty,
          previewConfig.selectedBattery,
          previewConfig.inverterQty
        );
      }
    } else if (systemType === "daytime") {
      sysType = "daytime";
      sysLabel = "Daytime (Grid-Tied)";
      data = getDaytimeCost(panelQty, standType, inverterQty);
    } else if (systemType === "hybrid") {
      sysType = "hybrid";
      sysLabel = "Hybrid (Solar + Battery)";
      data = getHybridCost(panelQty, standType, batteryQty, selectedBattery, inverterQty);
    }
    if (!data) return null;
    const totalKW = systemType === "auto" ? kwAuto : 
                   (parseInt(panelWatt) * panelQty / 1000).toFixed(1);
    return (
      <div 
        ref={pdfRef} 
        className="preview-container"
        style={{
          background: "#fff", 
          width: 595, 
          minHeight: 842, 
          padding: "20px", 
          margin: "0 auto",
          fontFamily: "'Segoe UI', 'Roboto', sans-serif", 
          position: "relative",
          fontSize: 12,
          boxSizing: "border-box",
          overflow: "hidden" // Prevent content overflow
        }}
      >
        {/* Header */}
        <div style={{ 
          marginBottom: 15,
          textAlign: "center",
          borderBottom: "2px solid #ff9800",
          paddingBottom: 15
        }}>
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
            <img 
              src={logo} 
              alt="Syed Solar Logo" 
              style={{ width: 60, height: "auto", marginRight: 15 }} 
            />
            <div>
              <div style={{ fontSize: 18, fontWeight: 900, color: "#ff6600" }}>
                Syed Solar Energy Pvt Ltd
              </div>
              <div style={{ fontSize: 11, color: "#666", marginTop: 3 }}>
                📍 Office #23, Mustafa Plaza, Ring Road, Peshawar
              </div>
            </div>
          </div>
          <div style={{ marginTop: 10 }}>
            <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 5 }}>
              {sysLabel} Quotation
            </div>
            <div style={{ fontSize: 12, color: "#666" }}>
              📅 Date: {new Date().toLocaleDateString()} | ⚡ System Size: {totalKW}kW
            </div>
          </div>
        </div>
        
        {/* Customer Details */}
        <div style={{
          background: "#f8f9fa",
          borderRadius: 5,
          padding: "10px 15px",
          marginBottom: 15,
          border: "1px solid #dee2e6",
          fontSize: 11
        }}>
          <div style={{ fontWeight: 700, marginBottom: 5, color: "#495057" }}>
            👤 Customer Information
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "5px" }}>
            <div><b>Name:</b> {customer.name || "-"}</div>
            <div><b>Contact:</b> {customer.contact || "-"}</div>
            <div><b>Email:</b> {customer.email || "-"}</div>
            <div><b>Address:</b> {customer.address || "-"}</div>
          </div>
        </div>
        
        {/* System Configuration */}
        <table style={{
          width: "100%",
          borderCollapse: "collapse",
          fontSize: 11,
          backgroundColor: "white",
          marginBottom: 15
        }}>
          <thead>
            <tr style={{ backgroundColor: "#ff9800", color: "white" }}>
              <th style={{ padding: "8px 10px", textAlign: "left" }}>Component</th>
              <th style={{ padding: "8px 10px", textAlign: "left" }}>Details</th>
              <th style={{ padding: "8px 10px", textAlign: "right" }}>Amount (Rs)</th>
            </tr>
          </thead>
          <tbody>
            {/* Solar Panels */}
            <tr>
              <td style={{ padding: "8px 10px", borderBottom: "1px solid #eee" }}>
                <b>Solar Panels</b>
              </td>
              <td style={{ padding: "8px 10px", borderBottom: "1px solid #eee" }}>
                {systemType === "auto" ? previewConfig.panelQty : panelQty} × {systemType === "auto" ? previewConfig.panelBrand : panelBrand} ({systemType === "auto" ? previewConfig.panelWatt : panelWatt}W)
                <div style={{ fontSize: 10, color: "#666", marginTop: 3 }}>
                  Unit: Rs. {(data.panelUnitPrice || 0).toLocaleString()} | Watt: Rs. {(panelPrices[systemType === "auto" ? previewConfig.panelBrand : panelBrand]?.[systemType === "auto" ? previewConfig.panelWatt : panelWatt]?.pricePerWatt || 0)}
                </div>
              </td>
              <td style={{ padding: "8px 10px", borderBottom: "1px solid #eee", textAlign: "right" }}>
                {data.panelTotal.toLocaleString()}
              </td>
            </tr>
            
            {/* Inverter */}
            <tr>
              <td style={{ padding: "8px 10px", borderBottom: "1px solid #eee" }}>
                <b>{sysType === "daytime" ? "Daytime" : "Hybrid"} Inverter</b>
              </td>
              <td style={{ padding: "8px 10px", borderBottom: "1px solid #eee" }}>
                {systemType === "auto" ? previewConfig.inverterQty : inverterQty} × {data.selectedInverter?.brand || ""} {data.selectedInverter?.capacity || ""}
                <div style={{ fontSize: 10, color: "#666", marginTop: 3 }}>
                  Model: {data.selectedInverter?.model || ""}
                </div>
              </td>
              <td style={{ padding: "8px 10px", borderBottom: "1px solid #eee", textAlign: "right" }}>
                {data.invTotal.toLocaleString()}
              </td>
            </tr>
            
            {/* Battery (for hybrid only) */}
            {sysType === "hybrid" && (
              <tr>
                <td style={{ padding: "8px 10px", borderBottom: "1px solid #eee" }}>
                  <b>Batteries</b>
                </td>
                <td style={{ padding: "8px 10px", borderBottom: "1px solid #eee" }}>
                  {systemType === "auto" ? previewConfig.batteryQty : batteryQty} × {data.selectedBattery?.model || ""}
                  <div style={{ fontSize: 10, color: "#666", marginTop: 3 }}>
                    Type: {data.selectedBattery?.type || ""} | Voltage: {data.selectedBattery?.voltage || ""}
                  </div>
                </td>
                <td style={{ padding: "8px 10px", borderBottom: "1px solid #eee", textAlign: "right" }}>
                  {(data.battTotal || 0).toLocaleString()}
                </td>
              </tr>
            )}
            
            {/* Mounting Structure */}
            <tr>
              <td style={{ padding: "8px 10px", borderBottom: "1px solid #eee" }}>
                <b>Mounting Structure</b>
              </td>
              <td style={{ padding: "8px 10px", borderBottom: "1px solid #eee" }}>
                {data.standQty} × {systemType === "auto" ? previewConfig.standType : standType}
              </td>
              <td style={{ padding: "8px 10px", borderBottom: "1px solid #eee", textAlign: "right" }}>
                {data.standTotal.toLocaleString()}
              </td>
            </tr>
            
            {/* Service Charges */}
            <tr>
              <td style={{ padding: "8px 10px", borderBottom: "1px solid #eee" }}>
                <b>Installation & Services</b>
              </td>
              <td style={{ padding: "8px 10px", borderBottom: "1px solid #eee" }}>
                <div style={{ fontSize: 10, color: "#666" }}>
                  <div>Safety Materials</div>
                  <div>Transportation</div>
                  <div>Installation</div>
                  {greenMeter && <div style={{ color: "#28a745" }}>Net Metering</div>}
                </div>
              </td>
              <td style={{ padding: "8px 10px", borderBottom: "1px solid #eee", textAlign: "right" }}>
                <div>{data.safety.toLocaleString()}</div>
                <div>{data.transport.toLocaleString()}</div>
                <div>{data.install.toLocaleString()}</div>
                {greenMeter && <div>{greenMeterCharges.toLocaleString()}</div>}
              </td>
            </tr>
            
            {/* Grand Total */}
            <tr style={{ backgroundColor: "#ff6600", color: "white" }}>
              <td style={{ padding: "10px", fontWeight: 700, fontSize: 12 }}>
                TOTAL AMOUNT
              </td>
              <td></td>
              <td style={{ padding: "10px", fontSize: 16, fontWeight: 900, textAlign: "right" }}>
                Rs. {data.grandTotal.toLocaleString()}
              </td>
            </tr>
          </tbody>
        </table>
        
        {/* Terms & Payment */}
        <div style={{
          padding: "15px",
          borderRadius: 5,
          marginBottom: 15,
          border: "1px solid #dee2e6",
          fontSize: 11
        }}>
          <div style={{ fontWeight: 700, marginBottom: 8, color: "#2e7d32" }}>
            💳 Payment Terms & Conditions
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", fontSize: 10 }}>
            <div>
              <b>Payment Schedule:</b>
              <ul style={{ marginTop: 5, paddingLeft: 15, lineHeight: 1.5 }}>
                <li><b>5%</b> advance for booking</li>
                <li><b>70%</b> on material delivery</li>
                <li><b>25%</b> after installation</li>
              </ul>
            </div>
            <div>
              <b>Important Notes:</b>
              <ul style={{ marginTop: 5, paddingLeft: 15, lineHeight: 1.5 }}>
                <li>Quotation valid for <b>7 days</b></li>
                <li>Prices subject to market changes</li>
                <li>Installation within 15-20 days</li>
              </ul>
            </div>
          </div>
        </div>
        
        {/* Warranty */}
        <div style={{
          background: "#fffde7",
          padding: "15px",
          borderRadius: 5,
          marginBottom: 15,
          border: "1px solid #ffecb3",
          fontSize: 11
        }}>
          <div style={{ fontWeight: 700, marginBottom: 5, color: "#3b2400" }}>
            🛡️ Warranty & Quality Assurance
          </div>
          <ul style={{ marginTop: 5, paddingLeft: 15, lineHeight: 1.5, fontSize: 10 }}>
            <li>Solar panels: <b>12 years product, 25 years performance</b></li>
            <li>Inverters: <b>5 years warranty</b></li>
            <li>Lithium batteries: <b>5-10 years warranty</b></li>
            <li>Professional installation with <b>6 months service warranty</b></li>
          </ul>
        </div>
        
        {/* Footer */}
        <div style={{
          background: "#1976d2",
          color: "#fff",
          fontWeight: 600,
          textAlign: "center",
          padding: "10px 15px",
          borderRadius: 5,
          fontSize: 10,
          marginTop: 10
        }}>
          <div style={{ marginBottom: 5 }}>
            📧 sales@syedsolarenergy.com | 📱 WhatsApp: 0304-467-8929 | ☎️ Office: 091-5844567
          </div>
          <div>
            🏢 Office #23, Mustafa Plaza, Ring Road, Peshawar | 🌐 www.syedsolarenergy.com
          </div>
        </div>
      </div>
    );
  }
  
  // Enhanced form UI with responsive improvements
  return (
    <>
      <style>{cssVariables}</style>
      
      <main style={{ 
        background: "linear-gradient(135deg, #fff8e1 0%, #fff3e0 50%, #ffe0b2 100%)", 
        minHeight: "100vh", 
        paddingBottom: 30 
      }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "var(--padding-base)" }}>
          {/* Enhanced Header */}
          <div style={{
            background: "linear-gradient(135deg, #ff9800 0%, #ff6600 100%)",
            color: "white",
            padding: "var(--section-padding)",
            borderRadius: "16px",
            textAlign: "center",
            marginBottom: "30px",
            boxShadow: "0 8px 32px rgba(255, 152, 0, 0.3)"
          }}>
            <h1 style={{ margin: "0 0 10px 0", fontSize: "var(--heading-1)", fontWeight: 900 }}>
              ⚡ Solar Quotation Generator
            </h1>
            <p style={{ margin: 0, fontSize: "var(--text-base)", opacity: 0.9 }}>
              Get instant pricing for your solar energy system
            </p>
          </div>
          
          <div style={{ 
            display: "grid", 
            gridTemplateColumns: "1fr", 
            gap: "30px",
            '@media (min-width: 992px)': {
              gridTemplateColumns: showPreview ? "1fr 1fr" : "1fr"
            }
          }}>
            {/* Form Section */}
            <form onSubmit={handleGenerateQuotation} style={{ 
              background: "#fff", 
              borderRadius: "16px", 
              boxShadow: "0 8px 32px rgba(255, 152, 0, 0.1)", 
              padding: "var(--section-padding)" 
            }}>
              <h2 style={{ 
                color: "#ff9800", 
                textAlign: "center", 
                fontWeight: 900, 
                marginBottom: "25px", 
                fontSize: "var(--heading-2)"
              }}>
                📋 System Configuration
              </h2>
              
              {/* System Type Selection */}
              <div style={{ marginBottom: 25 }}>
                <label style={{ display: "block", fontWeight: 600, marginBottom: 10, color: "#333", fontSize: "var(--text-base)" }}>
                  Choose System Type
                </label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
                  <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: "var(--text-base)" }}>
                    <input 
                      type="radio" 
                      name="systemType" 
                      value="daytime" 
                      checked={systemType === "daytime"} 
                      onChange={e => setSystemType(e.target.value)} 
                    /> 
                    <span>🌞 Daytime</span>
                  </label>
                  <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: "var(--text-base)" }}>
                    <input 
                      type="radio" 
                      name="systemType" 
                      value="hybrid" 
                      checked={systemType === "hybrid"} 
                      onChange={e => setSystemType(e.target.value)} 
                    /> 
                    <span>🔋 Hybrid</span>
                  </label>
                  <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: "var(--text-base)" }}>
                    <input 
                      type="radio" 
                      name="systemType" 
                      value="auto" 
                      checked={systemType === "auto"} 
                      onChange={e => setSystemType(e.target.value)} 
                    /> 
                    <span>🤖 Auto Suggest</span>
                  </label>
                </div>
              </div>
              
              {/* Auto Suggest Section */}
              {systemType === "auto" && (
                <div style={sectionBox}>
                  <h3 style={sectionTitle}>🤖 Auto Configuration</h3>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "15px", '@media (min-width: 768px)': { gridTemplateColumns: "1fr 1fr" } }}>
                    <div>
                      <label style={labelStyle}>System Type</label>
                      <select value={autoType} onChange={e => setAutoType(e.target.value)} style={inputStyle}>
                        <option value="daytime">Daytime (Grid-Tied)</option>
                        <option value="hybrid">Hybrid (Battery Backup)</option>
                      </select>
                    </div>
                    <div>
                      <label style={labelStyle}>Required System Size (kW)</label>
                      <input 
                        type="number" 
                        min={3} 
                        max={25} 
                        step={0.5}
                        value={kwAuto} 
                        onChange={e => setKwAuto(Number(e.target.value))} 
                        style={inputStyle} 
                      />
                    </div>
                  </div>
                  <div style={{ fontSize: "var(--text-base)", color: "#666", marginTop: "10px" }}>
                    ✨ Components will be auto-selected based on your requirements
                  </div>
                  <div style={{ marginTop: 15 }}>
                    <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: "var(--text-base)" }}>
                      <input type="checkbox" checked={greenMeter} onChange={handleGreenMeter} />
                      <span>🌿 Add Net Metering (Rs. {greenMeterCharges.toLocaleString()})</span>
                    </label>
                  </div>
                </div>
              )}
              
              {/* Customer Information */}
              <div style={sectionBox}>
                <h3 style={sectionTitle}>👤 Customer Information</h3>
                <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "15px", '@media (min-width: 768px)': { gridTemplateColumns: "1fr 1fr" } }}>
                  <div>
                    <label style={labelStyle}>Full Name *</label>
                    <input 
                      name="name" 
                      type="text" 
                      value={customer.name} 
                      onChange={handleCustomerChange} 
                      placeholder="Enter your full name" 
                      required 
                      style={inputStyle} 
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Contact Number *</label>
                    <input 
                      name="contact" 
                      type="text" 
                      value={customer.contact} 
                      onChange={handleCustomerChange} 
                      placeholder="03XX-XXXXXXX" 
                      required 
                      style={inputStyle} 
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Email Address</label>
                    <input 
                      name="email" 
                      type="email" 
                      value={customer.email} 
                      onChange={handleCustomerChange} 
                      placeholder="you@example.com" 
                      style={inputStyle} 
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Installation Address *</label>
                    <textarea 
                      name="address" 
                      value={customer.address} 
                      onChange={handleCustomerChange} 
                      placeholder="Complete address with city" 
                      style={{ ...inputStyle, resize: "vertical", minHeight: "60px" }} 
                      required 
                    />
                  </div>
                </div>
              </div>
              
              {/* Daytime System Configuration */}
              {systemType === "daytime" && (
                <div style={sectionBox}>
                  <h3 style={sectionTitle}>🌞 Daytime System Configuration</h3>
                  
                  <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "15px", marginBottom: 15, '@media (min-width: 768px)': { gridTemplateColumns: "1fr 1fr 1fr" } }}>
                    <div>
                      <label style={labelStyle}>Panel Brand</label>
                      <select value={panelBrand} onChange={e => setPanelBrand(e.target.value)} style={inputStyle}>
                        {Object.keys(panelPrices).map((brand) => <option key={brand} value={brand}>{brand}</option>)}
                      </select>
                    </div>
                    <div>
                      <label style={labelStyle}>Panel Wattage</label>
                      <select value={panelWatt} onChange={e => setPanelWatt(e.target.value)} style={inputStyle}>
                        {panelBrand && Object.keys(panelPrices[panelBrand] || {}).map((watt) => 
                          <option key={watt} value={watt}>{watt}W</option>
                        )}
                      </select>
                    </div>
                    <div>
                      <label style={labelStyle}>Number of Panels</label>
                      <input 
                        type="number" 
                        min={1} 
                        max={40} 
                        value={panelQty} 
                        onChange={e => setPanelQty(Number(e.target.value))} 
                        style={inputStyle} 
                      />
                    </div>
                  </div>
                  
                  {/* Panel Pricing Info */}
                  {panelBrand && panelWatt && (
                    <div style={priceInfoBox}>
                      <div><b>Per Panel:</b> Rs. {(panelPrices[panelBrand]?.[panelWatt]?.price || 0).toLocaleString()}</div>
                      <div><b>Per Watt:</b> Rs. {panelPrices[panelBrand]?.[panelWatt]?.pricePerWatt || 0}</div>
                      <div><b>Total Panels:</b> Rs. {((panelPrices[panelBrand]?.[panelWatt]?.price || 0) * panelQty).toLocaleString()}</div>
                      <div><b>System Size:</b> {(panelWatt * panelQty / 1000).toFixed(1)}kW</div>
                    </div>
                  )}
                  
                  <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "15px", marginBottom: 15, '@media (min-width: 768px)': { gridTemplateColumns: "1fr 1fr" } }}>
                    <div>
                      <label style={labelStyle}>Daytime Inverter</label>
                      <select value={dayInverter} onChange={e => setDayInverter(e.target.value)} style={inputStyle}>
                        {daytimeInverters.map((inv) => 
                          <option key={inv.id} value={inv.id}>
                            {inv.brand} - {inv.capacity} - Rs. {inv.price.toLocaleString()}
                          </option>
                        )}
                      </select>
                    </div>
                    <div>
                      <label style={labelStyle}>Inverter Quantity</label>
                      <input 
                        type="number" 
                        min={1} 
                        max={5} 
                        value={inverterQty} 
                        onChange={e => setInverterQty(Number(e.target.value))} 
                        style={inputStyle} 
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label style={labelStyle}>Mounting Structure</label>
                    <select value={standType} onChange={e => setStandType(e.target.value)} style={inputStyle}>
                      {Object.keys(standPrices).map((s) => 
                        <option key={s} value={s}>{s} - Rs. {standPrices[s].toLocaleString()}</option>
                      )}
                    </select>
                  </div>
                  
                  {/* Stand Info */}
                  <div style={priceInfoBox}>
                    <div><b>Stand Quantity:</b> {getStandQty(panelQty, standType)} sets</div>
                    <div><b>Total Stands:</b> Rs. {(standPrices[standType] * getStandQty(panelQty, standType)).toLocaleString()}</div>
                  </div>
                  
                  {/* Service Charges */}
                  <div style={chargesBox}>
                    <h4>📋 Service Charges</h4>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 10, '@media (min-width: 480px)': { gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))" } }}>
                      <div>Safety: Rs. {safetyCharges.daytime.toLocaleString()}</div>
                      <div>Transport: Rs. {transportCharges.toLocaleString()}</div>
                      <div>Installation: Rs. {installCharges.daytime.toLocaleString()}</div>
                    </div>
                  </div>
                  
                  <div style={{ marginTop: 15 }}>
                    <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: "var(--text-base)" }}>
                      <input type="checkbox" checked={greenMeter} onChange={handleGreenMeter} />
                      <span>🌿 Add Net Metering (Rs. {greenMeterCharges.toLocaleString()})</span>
                    </label>
                  </div>
                </div>
              )}
              
              {/* Hybrid System Configuration */}
              {systemType === "hybrid" && (
                <div style={sectionBox}>
                  <h3 style={sectionTitle}>🔋 Hybrid System Configuration</h3>
                  
                  {/* Panel Configuration */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "15px", marginBottom: 15, '@media (min-width: 768px)': { gridTemplateColumns: "1fr 1fr 1fr" } }}>
                    <div>
                      <label style={labelStyle}>Panel Brand</label>
                      <select value={panelBrand} onChange={e => setPanelBrand(e.target.value)} style={inputStyle}>
                        {Object.keys(panelPrices).map((brand) => <option key={brand} value={brand}>{brand}</option>)}
                      </select>
                    </div>
                    <div>
                      <label style={labelStyle}>Panel Wattage</label>
                      <select value={panelWatt} onChange={e => setPanelWatt(e.target.value)} style={inputStyle}>
                        {panelBrand && Object.keys(panelPrices[panelBrand] || {}).map((watt) => 
                          <option key={watt} value={watt}>{watt}W</option>
                        )}
                      </select>
                    </div>
                    <div>
                      <label style={labelStyle}>Number of Panels</label>
                      <input 
                        type="number" 
                        min={1} 
                        max={40} 
                        value={panelQty} 
                        onChange={e => setPanelQty(Number(e.target.value))} 
                        style={inputStyle} 
                      />
                    </div>
                  </div>
                  
                  {/* Panel Pricing Info */}
                  {panelBrand && panelWatt && (
                    <div style={priceInfoBox}>
                      <div><b>Per Panel:</b> Rs. {(panelPrices[panelBrand]?.[panelWatt]?.price || 0).toLocaleString()}</div>
                      <div><b>Per Watt:</b> Rs. {panelPrices[panelBrand]?.[panelWatt]?.pricePerWatt || 0}</div>
                      <div><b>Total Panels:</b> Rs. {((panelPrices[panelBrand]?.[panelWatt]?.price || 0) * panelQty).toLocaleString()}</div>
                      <div><b>System Size:</b> {(panelWatt * panelQty / 1000).toFixed(1)}kW</div>
                    </div>
                  )}
                  
                  {/* Inverter Configuration */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "15px", marginBottom: 15, '@media (min-width: 768px)': { gridTemplateColumns: "1fr 1fr 1fr" } }}>
                    <div>
                      <label style={labelStyle}>Inverter Brand</label>
                      <select 
                        value={hybridInverterBrand} 
                        onChange={e => {
                          setHybridInverterBrand(e.target.value);
                          // Set first available capacity for selected brand
                          const brandInverters = hybridInverters.filter(inv => inv.brand === e.target.value);
                          if (brandInverters.length > 0) {
                            setHybridInverterCapacity(brandInverters[0].id.toString());
                          }
                        }} 
                        style={inputStyle}
                      >
                        {[...new Set(hybridInverters.map(inv => inv.brand))].map((brand) => 
                          <option key={brand} value={brand}>{brand}</option>
                        )}
                      </select>
                    </div>
                    <div>
                      <label style={labelStyle}>Inverter Capacity</label>
                      <select 
                        value={hybridInverterCapacity} 
                        onChange={handleHybridInverterCapacityChange} 
                        style={inputStyle}
                      >
                        {hybridInverters
                          .filter(inv => inv.brand === hybridInverterBrand)
                          .map((inv) => 
                            <option key={inv.id} value={inv.id}>
                              {inv.capacity} - Rs. {inv.price.toLocaleString()}
                            </option>
                          )}
                      </select>
                    </div>
                    <div>
                      <label style={labelStyle}>Inverter Quantity</label>
                      <input 
                        type="number" 
                        min={1} 
                        max={3} 
                        value={inverterQty} 
                        onChange={e => setInverterQty(Number(e.target.value))} 
                        style={inputStyle} 
                      />
                    </div>
                  </div>
                  
                  {/* Battery Configuration */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "15px", marginBottom: 15, '@media (min-width: 768px)': { gridTemplateColumns: "1fr 1fr 1fr" } }}>
                    <div>
                      <label style={labelStyle}>Battery Type</label>
                      <select value={batteryType} onChange={handleBatteryType} style={inputStyle}>
                        <option value="">Select Type</option>
                        <option value="lithium">Lithium-Ion</option>
                        <option value="tubular">Tubular</option>
                      </select>
                    </div>
                    <div>
                      <label style={labelStyle}>Battery Model</label>
                      <select 
                        value={selectedBattery} 
                        onChange={e => setSelectedBattery(e.target.value)} 
                        style={inputStyle} 
                        required
                      >
                        <option value="">Select Model</option>
                        {batteryModels.map((batt) => 
                          <option key={batt.id} value={batt.id}>
                            {batt.model} ({batt.voltage}) - Rs. {batt.price.toLocaleString()}
                          </option>
                        )}
                      </select>
                    </div>
                    <div>
                      <label style={labelStyle}>Battery Quantity</label>
                      <input 
                        type="number" 
                        min={1} 
                        max={12} 
                        value={batteryQty} 
                        onChange={e => setBatteryQty(Number(e.target.value))} 
                        style={inputStyle} 
                      />
                    </div>
                  </div>
                  
                  {/* Battery Info */}
                  {selectedBattery && batteryPrices[selectedBattery] && (
                    <div style={priceInfoBox}>
                      <div><b>Per Battery:</b> Rs. {batteryPrices[selectedBattery].price.toLocaleString()}</div>
                      <div><b>Total Batteries:</b> Rs. {(batteryPrices[selectedBattery].price * batteryQty).toLocaleString()}</div>
                      <div><b>Voltage:</b> {batteryPrices[selectedBattery].voltage}</div>
                      <div><b>Capacity:</b> {batteryPrices[selectedBattery].capacity}</div>
                    </div>
                  )}
                  
                  {/* Stand Configuration */}
                  <div>
                    <label style={labelStyle}>Mounting Structure</label>
                    <select value={standType} onChange={e => setStandType(e.target.value)} style={inputStyle}>
                      {Object.keys(standPrices).map((s) => 
                        <option key={s} value={s}>{s} - Rs. {standPrices[s].toLocaleString()}</option>
                      )}
                    </select>
                  </div>
                  
                  {/* Stand Info */}
                  <div style={priceInfoBox}>
                    <div><b>Stand Quantity:</b> {getStandQty(panelQty, standType)} sets</div>
                    <div><b>Total Stands:</b> Rs. {(standPrices[standType] * getStandQty(panelQty, standType)).toLocaleString()}</div>
                  </div>
                  
                  {/* Service Charges */}
                  <div style={chargesBox}>
                    <h4>📋 Service Charges</h4>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 10, '@media (min-width: 480px)': { gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))" } }}>
                      <div>Safety: Rs. {(panelQty <= 16 ? safetyCharges.hybrid : safetyCharges.hybridHigh).toLocaleString()}</div>
                      <div>Transport: Rs. {transportCharges.toLocaleString()}</div>
                      <div>Installation: Rs. {installCharges.hybrid.toLocaleString()}</div>
                    </div>
                  </div>
                  
                  <div style={{ marginTop: 15 }}>
                    <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: "var(--text-base)" }}>
                      <input type="checkbox" checked={greenMeter} onChange={handleGreenMeter} />
                      <span>🌿 Add Net Metering (Rs. {greenMeterCharges.toLocaleString()})</span>
                    </label>
                  </div>
                </div>
              )}
              
              {/* Generate Button */}
              <button
                type="submit"
                disabled={saving || !systemType || !customer.name}
                style={{
                  width: "100%",
                  marginTop: "30px",
                  background: saving 
                    ? "linear-gradient(90deg, #ccc, #999)" 
                    : "linear-gradient(135deg, #ff9800 0%, #ff6600 100%)",
                  color: "#fff",
                  fontWeight: 800,
                  border: "none",
                  borderRadius: "12px",
                  fontSize: "var(--heading-3)",
                  padding: "12px 20px",
                  cursor: saving || !systemType || !customer.name ? "not-allowed" : "pointer",
                  boxShadow: "0 4px 15px rgba(255, 152, 0, 0.3)",
                  transition: "all 0.3s ease",
                  opacity: saving || !systemType || !customer.name ? 0.6 : 1
                }}
              >
                {saving ? "🔄 Generating..." : "📄 Generate PDF & Send WhatsApp"}
              </button>
              
              {saving && (
                <div style={{
                  marginTop: 15,
                  textAlign: "center",
                  color: "#ff9800",
                  fontSize: "var(--text-base)",
                  fontWeight: 600
                }}>
                  📊 Saving quotation to database...
                </div>
              )}
            </form>
            
            {/* Live Preview Section */}
            {showPreview && (
              <div style={{ 
                background: "#fff", 
                borderRadius: "16px", 
                padding: "var(--card-padding)", 
                boxShadow: "0 8px 32px rgba(255, 152, 0, 0.1)",
                overflow: "auto"
              }}>
                <h3 style={{ 
                  color: "#ff6600", 
                  textAlign: "center", 
                  fontWeight: 800, 
                  marginBottom: "20px",
                  fontSize: "var(--heading-2)"
                }}>
                  📋 Live Preview
                </h3>
                <div style={{ 
                  maxHeight: "70vh", 
                  overflowY: "auto", 
                  border: "2px dashed #ff9800", 
                  borderRadius: "12px",
                  padding: "10px",
                  display: "flex",
                  justifyContent: "center",
                  overflowX: "auto"
                }}>
                  {renderQuotationPreview()}
                </div>
              </div>
            )}
          </div>
        </div>
        <Footer />
      </main>
    </>
  );
}

// Enhanced Styles
const sectionBox = { 
  background: "linear-gradient(135deg, #fff8e8 0%, #fff3e0 100%)", 
  borderRadius: "12px", 
  padding: "var(--card-padding)", 
  margin: "20px 0", 
  boxShadow: "0 4px 15px rgba(255, 152, 0, 0.1)",
  border: "1px solid #ffe0b2"
};

const sectionTitle = { 
  color: "#FF9800", 
  fontWeight: 800, 
  fontSize: "var(--heading-3)", 
  margin: "0 0 15px 0",
  paddingBottom: "10px",
  borderBottom: "2px solid #ffcc02"
};

const labelStyle = {
  display: "block",
  fontWeight: 600,
  marginBottom: "5px",
  color: "#333",
  fontSize: "var(--text-base)"
};

const inputStyle = { 
  width: "100%", 
  padding: "10px 12px", 
  fontSize: "var(--text-base)", 
  borderRadius: "8px", 
  border: "2px solid #ffe8c7", 
  background: "#fff",
  transition: "border-color 0.3s ease",
  boxSizing: "border-box"
};

const priceInfoBox = {
  background: "linear-gradient(135deg, #e8f5e8 0%, #f1f8e9 100%)",
  border: "2px solid #c8e6c9",
  borderRadius: "8px",
  padding: "12px",
  margin: "10px 0",
  display: "grid",
  gridTemplateColumns: "1fr",
  gap: "8px",
  fontSize: "var(--text-base)",
  color: "#2e7d32",
  '@media (min-width: 480px)': {
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))"
  }
};

const chargesBox = {
  background: "linear-gradient(135deg, #e3f2fd 0%, #f1f8e9 100%)",
  border: "2px solid #bbdefb",
  borderRadius: "8px",
  padding: "15px",
  margin: "15px 0",
  fontSize: "var(--text-base)",
  color: "#1565c0"
};