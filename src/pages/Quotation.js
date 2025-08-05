import React, { useState, useRef, useEffect } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import logo from "../assets/logo.png";
import Footer from "../components/Footer";
import { supabase } from "../supabaseClient";

export default function Quotation() {
  const [systemType, setSystemType] = useState("");
  const [autoType, setAutoType] = useState("daytime");
  const [kwAuto, setKwAuto] = useState(5);
  const [panelBrand, setPanelBrand] = useState("");
  const [panelWatt, setPanelWatt] = useState("");
  // ── Add this right after panelBrand/panelWatt
const handlePanelBrandChange = (e) => {
  const newBrand = e.target.value;
  setPanelBrand(newBrand);
  // get all wattages for the new brand, pick the first or blank
  const watts = Object.keys(panelPrices[newBrand] || {});
  setPanelWatt(watts[0] || "");
};

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

  // Fetch pricing data from Supabase
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

  // Enhanced Supabase save function
  async function saveQuotationToSupabase(quotationData) {
    try {
      setSaving(true);
      
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

  // Enhanced PDF generation with better layout
  const pdfRef = useRef();
  async function handleGenerateQuotation(e) {
    e.preventDefault();
    
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
      battery_type: sysType === "hybrid" 
        ? (systemType === "auto" ? previewConfig.batteryType : batteryType)
        : null,
      battery_model: sysType === "hybrid" 
        ? (quotationData.selectedBattery?.model || "")
        : null,
      battery_voltage: sysType === "hybrid" 
        ? (quotationData.selectedBattery?.voltage || "")
        : null,
      battery_quantity: sysType === "hybrid" 
        ? (systemType === "auto" ? previewConfig.batteryQty : batteryQty)
        : null,
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
    await saveQuotationToSupabase(supabaseData);

    // Generate PDF and WhatsApp redirect
    setTimeout(async () => {
      try {
        // Generate enhanced PDF
        const input = pdfRef.current;
        const canvas = await html2canvas(input, {
          scale: 2,
          useCORS: true,
          allowTaint: true,
          backgroundColor: '#ffffff',
          logging: false
        });
        
    // ——— One-page, full-width PDF using px units ———
    const imgData = canvas.toDataURL("image/png", 1.0);

    // Change unit from pt to px so pdf page and canvas match pixel-for-pixel
    const pdf = new jsPDF("p", "px", "a4");

    // PDF page size in px
    const pdfWidth  = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    // Get the actual image (canvas) dimensions
    const imgProps = pdf.getImageProperties(imgData);
    const imgWidth  = imgProps.width;
    const imgHeight = imgProps.height;

    // Scale to fit both width & height
    const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
    const finalWidth  = imgWidth  * ratio;
    const finalHeight = imgHeight * ratio;

    // Center on page
    const x = (pdfWidth  - finalWidth)  / 2;
    const y = (pdfHeight - finalHeight) / 2;

    // Draw and save
    pdf.addImage(imgData, "PNG", x, y, finalWidth, finalHeight);
    pdf.save(
      `SyedSolarQuotation-${customer.name || "Customer"}-${new Date().toLocaleDateString()}.pdf`
    );
    // ——————————————————————————————————————



        
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

  // Enhanced preview rendering
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

    // Enhanced warranty section
    const warrantyBox = (
      <div style={{
        background: "linear-gradient(135deg, #fffde6 0%, #fff9c4 100%)",
        borderLeft: "8px solid #ff9800",
        borderRadius: 10,
        margin: "20px 0",
        padding: "20px",
        fontWeight: 600,
        fontSize: 15,
        color: "#3b2400",
        boxShadow: "0 4px 15px rgba(255, 152, 0, 0.15)"
      }}>
        <div style={{ display: "flex", alignItems: "center", marginBottom: 12 }}>
          <span style={{ fontSize: 20, marginRight: 8 }}>🛡️</span>
          <b style={{ fontSize: 16 }}>Warranty & Quality Assurance</b>
        </div>
        <ul style={{ marginTop: 10, paddingLeft: 20, marginBottom: 10, lineHeight: 1.6 }}>
          <li>All solar panels are <b>A-Grade, Tier-1</b> with <b>12 years product warranty</b> and <b>25 years performance warranty</b></li>
          <li>Inverters include comprehensive warranty: <b>Daytime (5 years)</b>, <b>Hybrid (as per brand policy)</b></li>
          <li>Lithium batteries: <b>5-10 years warranty</b> | Tubular batteries: <b>2-3 years warranty</b></li>
          <li>Professional installation with <b>6 months after-sales service warranty</b></li>
          <li>Site visit charges: <b>Rs. 2,000/-</b> (Peshawar city) - <b>Adjustable in final bill</b></li>
          <li><b>Free system monitoring</b> and maintenance guidance for first year</li>
        </ul>
      </div>
    );

    return (
      <div ref={pdfRef} style={{
        background: "#fff", 
        width: 595, 
        minHeight: 842, 
        padding: "30px", 
        margin: "20px auto",
        borderRadius: 12, 
        boxShadow: "0 10px 40px rgba(255, 152, 0, 0.15)", 
        fontFamily: "'Segoe UI', 'Roboto', sans-serif", 
        position: "relative",
        fontSize: 14
      }}>
        {/* Enhanced Header */}
        <div style={{ 
          background: "linear-gradient(135deg, #ff9800 0%, #ff6600 100%)",
          margin: "-30px -30px 25px -30px",
          padding: "25px 30px",
          borderRadius: "12px 12px 0 0",
          color: "white"
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <img 
                src={logo} 
                alt="Syed Solar Logo" 
                style={{ width: 80, height: "auto", marginBottom: 10 }} 
              />
              <div style={{ fontSize: 24, fontWeight: 900 }}>
                Syed Solar Energy Pvt Ltd
              </div>
              <div style={{ fontSize: 13, opacity: 0.9, marginTop: 5 }}>
                📍 Office #23, Mustafa Plaza, Ring Road, Peshawar
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>
                {sysLabel} Quotation
              </div>
              <div style={{ fontSize: 13, opacity: 0.9 }}>
                📅 Date: {new Date().toLocaleDateString()}
              </div>
              <div style={{ fontSize: 16, fontWeight: 700, marginTop: 8 }}>
                ⚡ {totalKW}kW Solar System
              </div>
            </div>
          </div>
        </div>

        {/* Customer Details */}
        <div style={{
          background: "linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)",
          borderRadius: 8,
          padding: "15px 20px",
          marginBottom: 20,
          border: "1px solid #dee2e6"
        }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: "#495057", marginBottom: 10 }}>
            👤 Customer Information
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", fontSize: 14 }}>
            <div><b>Name:</b> {customer.name || "-"}</div>
            <div><b>Contact:</b> {customer.contact || "-"}</div>
            <div><b>Email:</b> {customer.email || "-"}</div>
            <div><b>Address:</b> {customer.address || "-"}</div>
          </div>
        </div>

        {/* Enhanced System Configuration */}
        <div style={{
          background: "linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%)",
          borderRadius: 10,
          padding: "20px",
          marginBottom: 20,
          border: "2px solid #ffcc02"
        }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: "#ef6c00", marginBottom: 15 }}>
            ⚙️ System Configuration & Pricing
          </div>
          
          <table style={{
            width: "100%",
            borderCollapse: "collapse",
            fontSize: 14,
            backgroundColor: "white",
            borderRadius: 8,
            overflow: "hidden",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
          }}>
            <tbody>
              {/* Solar Panels */}
              <tr style={{ backgroundColor: "#f8f9fa" }}>
                <td style={{ padding: "12px 15px", fontWeight: 600, borderBottom: "1px solid #dee2e6" }}>
                  🔆 Solar Panels:
                </td>
                <td style={{ padding: "12px 15px", borderBottom: "1px solid #dee2e6" }}>
                  <div><b>{(systemType === "auto" ? previewConfig.panelQty : panelQty)} panels</b> × {systemType === "auto" ? previewConfig.panelBrand : panelBrand} ({systemType === "auto" ? previewConfig.panelWatt : panelWatt}W)</div>
                  <div style={{ fontSize: 13, color: "#666", marginTop: 4 }}>
                    Unit Price: Rs. {(data.panelUnitPrice || 0).toLocaleString()} | 
                    Price/Watt: Rs. {(panelPrices[systemType === "auto" ? previewConfig.panelBrand : panelBrand]?.[systemType === "auto" ? previewConfig.panelWatt : panelWatt]?.pricePerWatt || 0)}
                  </div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: "#ff6600", marginTop: 5 }}>
                    Total: Rs. {data.panelTotal.toLocaleString()}
                  </div>
                </td>
              </tr>
              
              {/* Inverter */}
              <tr style={{ backgroundColor: "white" }}>
                <td style={{ padding: "12px 15px", fontWeight: 600, borderBottom: "1px solid #dee2e6" }}>
                  🔄 {sysType === "daytime" ? "Daytime" : "Hybrid"} Inverter:
                </td>
                <td style={{ padding: "12px 15px", borderBottom: "1px solid #dee2e6" }}>
                  <div><b>{systemType === "auto" ? previewConfig.inverterQty : inverterQty} unit(s)</b> × {data.selectedInverter?.brand || ""} {data.selectedInverter?.capacity || ""}</div>
                  <div style={{ fontSize: 13, color: "#666", marginTop: 4 }}>
                    Model: {data.selectedInverter?.model || ""} | Unit Price: Rs. {(data.selectedInverter?.price || 0).toLocaleString()}
                  </div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: "#ff6600", marginTop: 5 }}>
                    Total: Rs. {data.invTotal.toLocaleString()}
                  </div>
                </td>
              </tr>
              
              {/* Battery (for hybrid only) */}
              {sysType === "hybrid" && (
                <tr style={{ backgroundColor: "#f8f9fa" }}>
                  <td style={{ padding: "12px 15px", fontWeight: 600, borderBottom: "1px solid #dee2e6" }}>
                    🔋 Batteries:
                  </td>
                  <td style={{ padding: "12px 15px", borderBottom: "1px solid #dee2e6" }}>
                    <div><b>{(systemType === "auto" ? previewConfig.batteryQty : batteryQty)} units</b> × {data.selectedBattery?.model || ""}</div>
                    <div style={{ fontSize: 13, color: "#666", marginTop: 4 }}>
                      Type: {data.selectedBattery?.type || ""} | Voltage: {data.selectedBattery?.voltage || ""} | 
                      Capacity: {data.selectedBattery?.capacity || ""}
                    </div>
                    <div style={{ fontSize: 13, color: "#666" }}>
                      Unit Price: Rs. {(data.battUnit || 0).toLocaleString()}
                    </div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: "#ff6600", marginTop: 5 }}>
                      Total: Rs. {(data.battTotal || 0).toLocaleString()}
                    </div>
                  </td>
                </tr>
              )}
              
              {/* Mounting Structure */}
              <tr style={{ backgroundColor: "white" }}>
                <td style={{ padding: "12px 15px", fontWeight: 600, borderBottom: "1px solid #dee2e6" }}>
                  🔧 Mounting Structure:
                </td>
                <td style={{ padding: "12px 15px", borderBottom: "1px solid #dee2e6" }}>
                  <div><b>{data.standQty} sets</b> × {systemType === "auto" ? previewConfig.standType : standType}</div>
                  <div style={{ fontSize: 13, color: "#666", marginTop: 4 }}>
                    Unit Price: Rs. {(data.standUnit || 0).toLocaleString()}
                  </div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: "#ff6600", marginTop: 5 }}>
                    Total: Rs. {data.standTotal.toLocaleString()}
                  </div>
                </td>
              </tr>
              
              {/* Service Charges */}
              <tr style={{ backgroundColor: "#f8f9fa" }}>
                <td style={{ padding: "12px 15px", fontWeight: 600, borderBottom: "1px solid #dee2e6" }}>
                  🛠️ Installation & Services:
                </td>
                <td style={{ padding: "12px 15px", borderBottom: "1px solid #dee2e6" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", fontSize: 13 }}>
                    <div>Safety Materials: Rs. {data.safety.toLocaleString()}</div>
                    <div>Transportation: Rs. {data.transport.toLocaleString()}</div>
                    <div>Installation: Rs. {data.install.toLocaleString()}</div>
                    {greenMeter && <div style={{ color: "#28a745", fontWeight: 600 }}>Net Metering: Rs. {greenMeterCharges.toLocaleString()}</div>}
                  </div>
                </td>
              </tr>
              
              {/* Grand Total */}
              <tr style={{ backgroundColor: "#ff6600", color: "white" }}>
                <td style={{ padding: "15px", fontWeight: 700, fontSize: 16 }}>
                  💰 TOTAL AMOUNT:
                </td>
                <td style={{ padding: "15px", fontSize: 20, fontWeight: 900 }}>
                  Rs. {data.grandTotal.toLocaleString()}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Warranty Box */}
        {warrantyBox}

        {/* Enhanced Terms & Payment */}
        <div style={{
          background: "linear-gradient(135deg, #e8f5e8 0%, #c8e6c9 100%)",
          padding: "18px",
          borderRadius: 10,
          marginBottom: 20,
          border: "2px solid #4caf50"
        }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: "#2e7d32", marginBottom: 12 }}>
            💳 Payment Terms & Conditions
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px", fontSize: 14 }}>
            <div>
              <b>Payment Schedule:</b>
              <ul style={{ marginTop: 8, paddingLeft: 20, lineHeight: 1.6 }}>
                <li><b>5%</b> advance for booking</li>
                <li><b>70%</b> on material delivery</li>
                <li><b>25%</b> after installation</li>
              </ul>
            </div>
            <div>
              <b>Important Notes:</b>
              <ul style={{ marginTop: 8, paddingLeft: 20, lineHeight: 1.6 }}>
                <li>Quotation valid for <b>7 days</b></li>
                <li>Prices subject to market changes</li>
                <li>Installation within 15-20 days</li>
                <li>1-year maintenance support</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Enhanced Footer */}
        <div style={{
          background: "linear-gradient(135deg, #1976d2 0%, #1565c0 100%)",
          color: "#fff",
          fontWeight: 600,
          textAlign: "center",
          padding: "15px 20px",
          borderRadius: 8,
          fontSize: 13,
          marginTop: 15
        }}>
          <div style={{ marginBottom: 8 }}>
            📧 sales@syedsolarenergy.com | 📱 WhatsApp: 0304-467-8929 | ☎️ Office: 091-5844567
          </div>
          <div style={{ fontSize: 12, opacity: 0.9 }}>
            🏢 Office #23, Mustafa Plaza, Ring Road, Peshawar | 🌐 www.syedsolarenergy.com
          </div>
        </div>
      </div>
    );
  }

  // Enhanced form UI
  return (
    <main style={{ 
      background: "linear-gradient(135deg, #fff8e1 0%, #fff3e0 50%, #ffe0b2 100%)", 
      minHeight: "100vh", 
      paddingBottom: 30 
    }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "30px 20px" }}>
        {/* Enhanced Header */}
        <div style={{
          background: "linear-gradient(135deg, #ff9800 0%, #ff6600 100%)",
          color: "white",
          padding: "30px",
          borderRadius: 16,
          textAlign: "center",
          marginBottom: 30,
          boxShadow: "0 8px 32px rgba(255, 152, 0, 0.3)"
        }}>
          <h1 style={{ margin: "0 0 10px 0", fontSize: 32, fontWeight: 900 }}>
            ⚡ Solar Quotation Generator
          </h1>
          <p style={{ margin: 0, fontSize: 16, opacity: 0.9 }}>
            Get instant pricing for your solar energy system
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: showPreview ? "1fr 1fr" : "1fr", gap: 30 }}>
          {/* Form Section */}
          <form onSubmit={handleGenerateQuotation} style={{ 
            background: "#fff", 
            borderRadius: 16, 
            boxShadow: "0 8px 32px rgba(255, 152, 0, 0.1)", 
            padding: "30px" 
          }}>
            <h2 style={{ color: "#ff9800", textAlign: "center", fontWeight: 900, marginBottom: 25, fontSize: 24 }}>
              📋 System Configuration
            </h2>
            
            {/* System Type Selection */}
            <div style={{ marginBottom: 25 }}>
              <label style={{ display: "block", fontWeight: 600, marginBottom: 10, color: "#333" }}>
                Choose System Type
              </label>
              <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
                <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
                  <input 
                    type="radio" 
                    name="systemType" 
                    value="daytime" 
                    checked={systemType === "daytime"} 
                    onChange={e => setSystemType(e.target.value)} 
                  /> 
                  <span style={{ fontWeight: 500 }}>🌞 Daytime (Grid-Tied)</span>
                </label>
                <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
                  <input 
                    type="radio" 
                    name="systemType" 
                    value="hybrid" 
                    checked={systemType === "hybrid"} 
                    onChange={e => setSystemType(e.target.value)} 
                  /> 
                  <span style={{ fontWeight: 500 }}>🔋 Hybrid (Battery Backup)</span>
                </label>
                <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
                  <input 
                    type="radio" 
                    name="systemType" 
                    value="auto" 
                    checked={systemType === "auto"} 
                    onChange={e => setSystemType(e.target.value)} 
                  /> 
                  <span style={{ fontWeight: 500 }}>🤖 Auto Suggest</span>
                </label>
              </div>
            </div>

            {/* Auto Suggest Section */}
            {systemType === "auto" && (
              <div style={sectionBox}>
                <h3 style={sectionTitle}>🤖 Auto Configuration</h3>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 15 }}>
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
                <div style={{ fontSize: 14, color: "#666", marginTop: 10 }}>
                  ✨ All components will be automatically selected based on your requirements
                </div>
                <div style={{ marginTop: 15 }}>
                  <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
                    <input type="checkbox" checked={greenMeter} onChange={handleGreenMeter} />
                    <span>🌿 Add Net Metering (Rs. {greenMeterCharges.toLocaleString()})</span>
                  </label>
                </div>
              </div>
            )}

            {/* Customer Information */}
            <div style={sectionBox}>
              <h3 style={sectionTitle}>👤 Customer Information</h3>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 15 }}>
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
                    style={{ ...inputStyle, resize: "vertical", height: 60 }} 
                    required 
                  />
                </div>
              </div>
            </div>

            {/* Daytime System Configuration */}
            {systemType === "daytime" && (
              <div style={sectionBox}>
                <h3 style={sectionTitle}>🌞 Daytime System Configuration</h3>
                
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 15, marginBottom: 15 }}>
                  <div>
                    <label style={labelStyle}>Panel Brand</label>
                    <select value={panelBrand} onChange={handlePanelBrandChange} style={inputStyle}>
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

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 15, marginBottom: 15 }}>
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
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 10 }}>
                    <div>Safety: Rs. {safetyCharges.daytime.toLocaleString()}</div>
                    <div>Transport: Rs. {transportCharges.toLocaleString()}</div>
                    <div>Installation: Rs. {installCharges.daytime.toLocaleString()}</div>
                  </div>
                </div>

                <div style={{ marginTop: 15 }}>
                  <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
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
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 15, marginBottom: 15 }}>
                  <div>
                    <label style={labelStyle}>Panel Brand</label>
                    <select value={panelBrand} onChange={handlePanelBrandChange} style={inputStyle}>
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
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 15, marginBottom: 15 }}>
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
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 15, marginBottom: 15 }}>
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
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 10 }}>
                    <div>Safety: Rs. {(panelQty <= 16 ? safetyCharges.hybrid : safetyCharges.hybridHigh).toLocaleString()}</div>
                    <div>Transport: Rs. {transportCharges.toLocaleString()}</div>
                    <div>Installation: Rs. {installCharges.hybrid.toLocaleString()}</div>
                  </div>
                </div>

                <div style={{ marginTop: 15 }}>
                  <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
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
                marginTop: 30,
                background: saving 
                  ? "linear-gradient(90deg, #ccc, #999)" 
                  : "linear-gradient(135deg, #ff9800 0%, #ff6600 100%)",
                color: "#fff",
                fontWeight: 800,
                border: "none",
                borderRadius: 12,
                fontSize: 18,
                padding: "15px 40px",
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
                fontSize: 14,
                fontWeight: 600
              }}>
                📊 Saving quotation to database...
              </div>
            )}
          </form>

          {/* Live Preview Section */}
          {showPreview && (
            <div style={{ background: "#fff", borderRadius: 16, padding: 20, boxShadow: "0 8px 32px rgba(255, 152, 0, 0.1)" }}>
              <h3 style={{ 
                color: "#ff6600", 
                textAlign: "center", 
                fontWeight: 800, 
                marginBottom: 20,
                fontSize: 20
              }}>
                📋 Live Preview
              </h3>
              <div style={{ 
                maxHeight: "80vh", 
                overflowY: "auto", 
                border: "2px dashed #ff9800", 
                borderRadius: 12,
                padding: 10
              }}>
                {renderQuotationPreview()}
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </main>
  );
}

// Enhanced Styles
const sectionBox = { 
  background: "linear-gradient(135deg, #fff8e8 0%, #fff3e0 100%)", 
  borderRadius: 12, 
  padding: 20, 
  margin: "20px 0", 
  boxShadow: "0 4px 15px rgba(255, 152, 0, 0.1)",
  border: "1px solid #ffe0b2"
};

const sectionTitle = { 
  color: "#FF9800", 
  fontWeight: 800, 
  fontSize: 18, 
  margin: "0 0 15px 0",
  paddingBottom: 10,
  borderBottom: "2px solid #ffcc02"
};

const labelStyle = {
  display: "block",
  fontWeight: 600,
  marginBottom: 5,
  color: "#333",
  fontSize: 14
};

const inputStyle = { 
  width: "100%", 
  padding: "10px 12px", 
  fontSize: 14, 
  borderRadius: 8, 
  border: "2px solid #ffe8c7", 
  background: "#fff",
  transition: "border-color 0.3s ease",
  boxSizing: "border-box"
};

const priceInfoBox = {
  background: "linear-gradient(135deg, #e8f5e8 0%, #f1f8e9 100%)",
  border: "2px solid #c8e6c9",
  borderRadius: 8,
  padding: 12,
  margin: "10px 0",
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
  gap: 8,
  fontSize: 13,
  color: "#2e7d32"
};

const chargesBox = {
  background: "linear-gradient(135deg, #e3f2fd 0%, #f1f8e9 100%)",
  border: "2px solid #bbdefb",
  borderRadius: 8,
  padding: 15,
  margin: "15px 0",
  fontSize: 13,
  color: "#1565c0"
};