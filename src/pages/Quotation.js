import React, { useState, useRef, useEffect } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import logo from "../assets/logo.png";
import Footer from "../components/Footer";
import { supabase } from "../supabaseClient";

export default function Quotation() {
  // State variables
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
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [quotationId, setQuotationId] = useState("");
  
  // Pricing data from Supabase
  const [panelPrices, setPanelPrices] = useState({});
  const [daytimeInverters, setDaytimeInverters] = useState([]);
  const [hybridInverters, setHybridInverters] = useState([]);
  const [batteryPrices, setBatteryPrices] = useState({});
  const [standPrices, setStandPrices] = useState({});
  const [charges, setCharges] = useState({});
  
  // Generate quotation ID
  const generateQuotationId = () => {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `SSE-${year}${month}-${random}`;
  };
  
  // Initialize quotation ID on component mount
  useEffect(() => {
    setQuotationId(generateQuotationId());
  }, []);
  
  // Handle window resize for responsiveness
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
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
  
  // Handle panel brand change
  const handlePanelBrandChange = (e) => {
    const newBrand = e.target.value;
    setPanelBrand(newBrand);
    const watts = Object.keys(panelPrices[newBrand] || {});
    setPanelWatt(watts[0] || "");
  };
  
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
  
  // Save quotation to Supabase
  async function saveQuotationToSupabase(quotationData) {
    try {
      const supabaseData = {
        customer_name: quotationData.customer_name,
        customer_contact: quotationData.customer_contact,
        customer_email: quotationData.customer_email || null,
        customer_address: quotationData.customer_address,
        system_type: quotationData.system_type,
        panel_brand: quotationData.panel_brand,
        panel_watt: quotationData.panel_watt,
        panel_quantity: quotationData.panel_quantity,
        panel_total: quotationData.panel_total,
        inverter_type: quotationData.inverter_brand || null,
        inverter_size: quotationData.inverter_capacity || null,
        inverter_total: quotationData.inverter_total,
        inverter_brand: quotationData.inverter_brand || null,
        inverter_model: quotationData.inverter_model || null,
        inverter_capacity: quotationData.inverter_capacity || null,
        inverter_quantity: quotationData.inverter_quantity?.toString() || null,
        battery_type: quotationData.battery_type || null,
        battery_model: quotationData.battery_model || null,
        battery_voltage: quotationData.battery_voltage || null,
        battery_quantity: quotationData.battery_quantity || null,
        battery_total: quotationData.battery_total || 0,
        stand_type: quotationData.stand_type,
        stand_quantity: quotationData.stand_quantity,
        stand_total: quotationData.stand_total,
        safety_charges: quotationData.safety_charges,
        transport_charges: quotationData.transport_charges,
        installation_charges: quotationData.installation_charges,
        engineer_charges: quotationData.engineer_charges || 0,
        green_meter: quotationData.green_meter,
        green_meter_charges: quotationData.green_meter_charges || 0,
        total_amount: quotationData.total_amount,
        quotation_date: new Date().toISOString(),
        created_at: new Date().toISOString(),
        quotation_id: quotationData.quotation_id,
        follow_up_status: 'Pending' // Match the default value in the table
      };
      
      const { data, error } = await supabase
        .from("quotations")
        .insert([supabaseData])
        .select();
        
      if (error) {
        console.error("Supabase error:", error);
        return null;
      }
      return data[0];
    } catch (err) {
      console.error("Unexpected Supabase error:", err);
      return null;
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
      engineer_charges: 0,
      green_meter: greenMeter,
      green_meter_charges: quotationData.green,
      total_amount: quotationData.grandTotal,
      quotation_date: new Date().toISOString(),
      created_at: new Date().toISOString(),
      quotation_id: quotationId
    };
    
    // Save to Supabase
    const savedQuotation = await saveQuotationToSupabase(supabaseData);
    
    if (!savedQuotation) {
      alert("Failed to save quotation to database. Please try again.");
      return;
    }
    
    // Generate PDF and WhatsApp redirect
    setTimeout(async () => {
      try {
        // Generate enhanced PDF
        const input = pdfRef.current;
        const canvas = await html2canvas(input, {
          scale: 3,
          useCORS: true,
          allowTaint: true,
          backgroundColor: '#ffffff',
          logging: false,
          width: input.scrollWidth,
          height: input.scrollHeight
        });
        
        // Professional PDF, max 2 pages
        const imgData = canvas.toDataURL("image/png", 1.0);
        const pdf = new jsPDF("p", "pt", "a4");
        
        // 20pt margins
        const M = 20;
        const pageW = pdf.internal.pageSize.getWidth();
        const pageH = pdf.internal.pageSize.getHeight();
        const usableW = pageW - M*2;
        const usableH = pageH - M*2;
        
        // actual image size
        const props = pdf.getImageProperties(imgData);
        let imgW = usableW;
        let imgH = (props.height * usableW) / props.width;
        
        // if it would take >2 pages, shrink to fit exactly 2
        const pagesNeeded = Math.ceil(imgH / usableH);
        if (pagesNeeded > 2) {
          const scale = (usableH * 2) / imgH;
          imgW *= scale;
          imgH *= scale;
        }
        
        // draw in up to two pages
        let yOffset = M;
        let remaining = imgH;
        let pageNum = 1;
        while (remaining > 0) {
          // position the correct slice
          const sliceY = M - (imgH - remaining);
          pdf.addImage(imgData, "PNG", M, sliceY, imgW, imgH);
          
          // page number in 8pt font
          pdf.setFontSize(8);
          pdf.text(
            `Page ${pageNum}`,
            pageW / 2,
            pageH - M / 2,
            { align: "center" }
          );
          
          remaining -= usableH;
          if (remaining > 0 && pageNum < 2) {
            pdf.addPage();
            pageNum++;
          } else {
            break; // Don't create more than 2 pages
          }
        }
        
        // save with customer name and date
        pdf.save(
          `SSE-Quotation-${quotationId}-${customer.name || "Customer"}-${new Date()
            .toISOString()
            .split("T")[0]}.pdf`
        );
        
        // Enhanced WhatsApp message
        const whatsappNumber = "923044678929";
        const totalKW = systemType === "auto" ? kwAuto : 
                       (parseInt(panelWatt) * panelQty / 1000).toFixed(1);
        
        const msg = encodeURIComponent(
          `🌞 Assalam-o-Alaikum! I have generated my solar quotation from Syed Solar Energy website.
📋 Quotation Details:
• Name: ${customer.name}
• Contact: ${customer.contact}
• Quotation ID: #${quotationId}
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
        
        // Generate new ID for next quotation
        setQuotationId(generateQuotationId());
        
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
          <li>All solar panels are <b>A-Grade, Tier-1</b></li>
          <li>Inverters include comprehensive warranty: <b>Daytime (5 years)</b>, <b>Hybrid (as per brand policy)</b></li>
          <li>Lithium batteries: <b>5-10 years as per company policy</b> | Tubular batteries: <b>as per company policy</b></li>
          <li>Professional installation with <b>6 months after-sales service warranty</b></li>
          <li>Site visit charges: <b>Rs. 2,000/-</b> (Peshawar city)</li>
          <li><b>Free system monitoring</b> and maintenance guidance for first month</li>
        </ul>
      </div>
    );
    
    return (
      <div ref={pdfRef} style={{
        background: "#fff", 
        width: "100%", 
        maxWidth: "595px", 
        minHeight: "842px", 
        padding: "20px", 
        margin: "0 auto",
        borderRadius: 12, 
        boxShadow: "0 10px 40px rgba(255, 152, 0, 0.15)", 
        fontFamily: "'Segoe UI', 'Roboto', sans-serif", 
        position: "relative",
        fontSize: 14,
        overflow: "hidden"
      }}>
        {/* Enhanced Header */}
        <div style={{ 
          background: "linear-gradient(135deg, #ff9800 0%, #ff6600 100%)",
          margin: "-20px -20px 20px -20px",
          padding: "20px",
          borderRadius: "12px 12px 0 0",
          color: "white"
        }}>
          <div style={{ display: "flex", flexDirection: isMobile ? "column" : "row", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ marginBottom: isMobile ? 15 : 0 }}>
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
            <div style={{ textAlign: isMobile ? "center" : "right" }}>
              <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>
                {sysLabel} Quotation
              </div>
              <div style={{ fontSize: 13, opacity: 0.9 }}>
                📅 Date: {new Date().toLocaleDateString()}
              </div>
              <div style={{ fontSize: 16, fontWeight: 700, marginTop: 8 }}>
                ⚡ {totalKW}kW Solar System
              </div>
              <div style={{ fontSize: 13, opacity: 0.9, marginTop: 5 }}>
                📋 Quotation ID: #{quotationId}
              </div>
            </div>
          </div>
        </div>
        
        {/* Customer Details */}
        <div style={{
          background: "linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)",
          borderRadius: 8,
          padding: "15px",
          marginBottom: 20,
          border: "1px solid #dee2e6"
        }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: "#495057", marginBottom: 10 }}>
            👤 Customer Information
          </div>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "10px", fontSize: 14 }}>
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
          padding: "15px",
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
            <thead>
              <tr style={{ backgroundColor: "#ff9800", color: "white" }}>
                <th style={{ padding: "12px", textAlign: "left" }}>Item</th>
                <th style={{ padding: "12px", textAlign: "left" }}>Details</th>
                <th style={{ padding: "12px", textAlign: "right" }}>Amount (PKR)</th>
              </tr>
            </thead>
            <tbody>
              {/* Solar Panels */}
              <tr style={{ backgroundColor: "#f8f9fa" }}>
                <td style={{ padding: "12px", fontWeight: 600, borderBottom: "1px solid #dee2e6" }}>
                  🔆 Solar Panels
                </td>
                <td style={{ padding: "12px", borderBottom: "1px solid #dee2e6" }}>
                  <div><b>{(systemType === "auto" ? previewConfig.panelQty : panelQty)} panels</b> × {systemType === "auto" ? previewConfig.panelBrand : panelBrand} ({systemType === "auto" ? previewConfig.panelWatt : panelWatt}W)</div>
                  <div style={{ fontSize: 13, color: "#666", marginTop: 4 }}>
                    Unit Price: Rs. {(data.panelUnitPrice || 0).toLocaleString()} | 
                    Price/Watt: Rs. {(panelPrices[systemType === "auto" ? previewConfig.panelBrand : panelBrand]?.[systemType === "auto" ? previewConfig.panelWatt : panelWatt]?.pricePerWatt || 0)}
                  </div>
                </td>
                <td style={{ padding: "12px", borderBottom: "1px solid #dee2e6", textAlign: "right", fontWeight: 700, color: "#ff6600" }}>
                  Rs. {data.panelTotal.toLocaleString()}
                </td>
              </tr>
              
              {/* Inverter */}
              <tr style={{ backgroundColor: "white" }}>
                <td style={{ padding: "12px", fontWeight: 600, borderBottom: "1px solid #dee2e6" }}>
                  🔄 {sysType === "daytime" ? "Daytime" : "Hybrid"} Inverter
                </td>
                <td style={{ padding: "12px", borderBottom: "1px solid #dee2e6" }}>
                  <div><b>{systemType === "auto" ? previewConfig.inverterQty : inverterQty} unit(s)</b> × {data.selectedInverter?.brand || ""} {data.selectedInverter?.capacity || ""}</div>
                  <div style={{ fontSize: 13, color: "#666", marginTop: 4 }}>
                    Model: {data.selectedInverter?.model || ""} | Unit Price: Rs. {(data.selectedInverter?.price || 0).toLocaleString()}
                  </div>
                </td>
                <td style={{ padding: "12px", borderBottom: "1px solid #dee2e6", textAlign: "right", fontWeight: 700, color: "#ff6600" }}>
                  Rs. {data.invTotal.toLocaleString()}
                </td>
              </tr>
              
              {/* Battery (for hybrid only) */}
              {sysType === "hybrid" && (
                <tr style={{ backgroundColor: "#f8f9fa" }}>
                  <td style={{ padding: "12px", fontWeight: 600, borderBottom: "1px solid #dee2e6" }}>
                    🔋 Batteries
                  </td>
                  <td style={{ padding: "12px", borderBottom: "1px solid #dee2e6" }}>
                    <div><b>{(systemType === "auto" ? previewConfig.batteryQty : batteryQty)} units</b> × {data.selectedBattery?.model || ""}</div>
                    <div style={{ fontSize: 13, color: "#666", marginTop: 4 }}>
                      Type: {data.selectedBattery?.type || ""} | Voltage: {data.selectedBattery?.voltage || ""} | 
                      Capacity: {data.selectedBattery?.capacity || ""}
                    </div>
                    <div style={{ fontSize: 13, color: "#666" }}>
                      Unit Price: Rs. {(data.battUnit || 0).toLocaleString()}
                    </div>
                  </td>
                  <td style={{ padding: "12px", borderBottom: "1px solid #dee2e6", textAlign: "right", fontWeight: 700, color: "#ff6600" }}>
                    Rs. {(data.battTotal || 0).toLocaleString()}
                  </td>
                </tr>
              )}
              
              {/* Mounting Structure */}
              <tr style={{ backgroundColor: "white" }}>
                <td style={{ padding: "12px", fontWeight: 600, borderBottom: "1px solid #dee2e6" }}>
                  🔧 Mounting Structure
                </td>
                <td style={{ padding: "12px", borderBottom: "1px solid #dee2e6" }}>
                  <div><b>{data.standQty} sets</b> × {systemType === "auto" ? previewConfig.standType : standType}</div>
                  <div style={{ fontSize: 13, color: "#666", marginTop: 4 }}>
                    Unit Price: Rs. {(data.standUnit || 0).toLocaleString()}
                  </div>
                </td>
                <td style={{ padding: "12px", borderBottom: "1px solid #dee2e6", textAlign: "right", fontWeight: 700, color: "#ff6600" }}>
                  Rs. {data.standTotal.toLocaleString()}
                </td>
              </tr>
              
              {/* Service Charges */}
              <tr style={{ backgroundColor: "#f8f9fa" }}>
                <td style={{ padding: "12px", fontWeight: 600, borderBottom: "1px solid #dee2e6" }}>
                  🛠️ Installation & Services
                </td>
                <td style={{ padding: "12px", borderBottom: "1px solid #dee2e6" }}>
                  <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fit, minmax(150px, 1fr))", gap: "8px", fontSize: 13 }}>
                    <div>Safety Materials: Rs. {data.safety.toLocaleString()}</div>
                    <div>Transportation: Rs. {data.transport.toLocaleString()}</div>
                    <div>Installation: Rs. {data.install.toLocaleString()}</div>
                    {greenMeter && <div style={{ color: "#28a745", fontWeight: 600 }}>Net Metering: Rs. {greenMeterCharges.toLocaleString()}</div>}
                  </div>
                </td>
                <td style={{ padding: "12px", borderBottom: "1px solid #dee2e6", textAlign: "right", fontWeight: 700, color: "#ff6600" }}>
                  Rs. {(data.safety + data.transport + data.install + (greenMeter ? greenMeterCharges : 0)).toLocaleString()}
                </td>
              </tr>
              
              {/* Grand Total */}
              <tr style={{ backgroundColor: "#ff6600", color: "white" }}>
                <td colSpan={2} style={{ padding: "15px", fontWeight: 700, fontSize: 16, textAlign: "right" }}>
                  💰 TOTAL AMOUNT:
                </td>
                <td style={{ padding: "15px", fontSize: 20, fontWeight: 900, textAlign: "right" }}>
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
          padding: "15px",
          borderRadius: 10,
          marginBottom: 20,
          border: "2px solid #4caf50"
        }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: "#2e7d32", marginBottom: 12 }}>
            💳 Payment Terms & Conditions
          </div>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "15px", fontSize: 14 }}>
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
                <li>Quotation valid for <b>3 days</b></li>
                <li>Prices subject to market changes</li>
                <li>Installation within 1-2 days</li>
                <li>After sales services included</li>
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
          padding: "15px",
          borderRadius: 8,
          fontSize: 13,
          marginTop: 15
        }}>
          <div style={{ marginBottom: 8 }}>
            📧 sales@syedsolarenergy.com | 📱 WhatsApp: 0304-4678929/0307-5596695
          </div>
          <div style={{ fontSize: 12, opacity: 0.9 }}>
            🏢 Office #23, Mustafa Plaza, Ring Road, Peshawar | 🌐 www.syedsolarenergy.com
          </div>
        </div>
      </div>
    );
  }
  
  // Responsive layout adjustments
  const isSmallScreen = window.innerWidth < 992;
  
  // Enhanced form UI with responsive layout
  return (
    <main style={{ 
      background: "linear-gradient(135deg, #fff8e1 0%, #fff3e0 50%, #ffe0b2 100%)", 
      minHeight: "100vh", 
      paddingBottom: 30,
      overflowX: "hidden"
    }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "20px" }}>
        {/* Enhanced Header */}
        <div style={{
          background: "linear-gradient(135deg, #ff9800 0%, #ff6600 100%)",
          color: "white",
          padding: isMobile ? "15px" : "25px",
          borderRadius: 16,
          textAlign: "center",
          marginBottom: 20,
          boxShadow: "0 8px 32px rgba(255, 152, 0, 0.3)"
        }}>
          <h1 style={{ 
            margin: "0 0 10px 0", 
            fontSize: isMobile ? "24px" : "32px", 
            fontWeight: 900 
          }}>
            ⚡ Solar Quotation Generator
          </h1>
          <p style={{ margin: 0, fontSize: isMobile ? "14px" : "16px", opacity: 0.9 }}>
            Get instant pricing for your solar energy system
          </p>
        </div>
        
        <div style={{ 
          display: "grid", 
          gridTemplateColumns: showPreview && !isMobile ? "1fr 1fr" : "1fr", 
          gap: "20px"
        }}>
          {/* Form Section */}
          <form onSubmit={handleGenerateQuotation} style={{ 
            background: "#fff", 
            borderRadius: 16, 
            boxShadow: "0 8px 32px rgba(255, 152, 0, 0.1)", 
            padding: isMobile ? "15px" : "25px",
            overflow: "hidden",
            maxWidth: "100%"
          }}>
            <h2 style={{ 
              color: "#ff9800", 
              textAlign: "center", 
              fontWeight: 900, 
              marginBottom: 25, 
              fontSize: isMobile ? "20px" : "24px"
            }}>
              📋 System Configuration
            </h2>
            
            {/* System Type Selection */}
            <div style={{ marginBottom: 25 }}>
              <label style={{ display: "block", fontWeight: 600, marginBottom: 10, color: "#333" }}>
                Choose System Type
              </label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 15 }}>
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
                <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 15 }}>
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
              <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 15 }}>
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
                
                <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr 1fr", gap: 15, marginBottom: 15 }}>
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
                
                <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 15, marginBottom: 15 }}>
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
                  <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fit, minmax(150px, 1fr))", gap: 10 }}>
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
                <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr 1fr", gap: 15, marginBottom: 15 }}>
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
                <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr 1fr", gap: 15, marginBottom: 15 }}>
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
                <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr 1fr", gap: 15, marginBottom: 15 }}>
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
                  <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fit, minmax(150px, 1fr))", gap: 10 }}>
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
            <div style={{ 
              background: "#fff", 
              borderRadius: 16, 
              padding: "15px", 
              boxShadow: "0 8px 32px rgba(255, 152, 0, 0.1)",
              display: "flex",
              flexDirection: "column",
              maxWidth: "100%",
              overflow: "hidden"
            }}>
              <h3 style={{ 
                color: "#ff6600", 
                textAlign: "center", 
                fontWeight: 800, 
                marginBottom: "15px",
                fontSize: "18px"
              }}>
                📋 Live Preview
              </h3>
              <div style={{ 
                flex: 1,
                overflow: "auto",
                border: "2px dashed #ff9800", 
                borderRadius: 12,
                padding: "10px",
                maxHeight: isMobile ? "60vh" : "70vh",
                display: "flex",
                justifyContent: "center",
                alignItems: "flex-start"
              }}>
                <div style={{ 
                  width: "100%", 
                  maxWidth: "595px",
                  transform: isMobile ? "scale(0.8)" : "scale(1)",
                  transformOrigin: "top center",
                  margin: isMobile ? "-20px 0" : "0"
                }}>
                  {renderQuotationPreview()}
                </div>
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
  padding: 15, 
  margin: "15px 0", 
  boxShadow: "0 4px 15px rgba(255, 152, 0, 0.1)",
  border: "1px solid #ffe0b2"
};

const sectionTitle = { 
  color: "#FF9800", 
  fontWeight: 800, 
  fontSize: "16px", 
  margin: "0 0 12px 0",
  paddingBottom: "8px",
  borderBottom: "2px solid #ffcc02"
};

const labelStyle = {
  display: "block",
  fontWeight: 600,
  marginBottom: "5px",
  color: "#333",
  fontSize: "14px"
};

const inputStyle = { 
  width: "100%", 
  padding: "10px 12px", 
  fontSize: "14px", 
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
  padding: "10px",
  margin: "8px 0",
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
  gap: "8px",
  fontSize: "13px",
  color: "#2e7d32"
};

const chargesBox = {
  background: "linear-gradient(135deg, #e3f2fd 0%, #f1f8e9 100%)",
  border: "2px solid #bbdefb",
  borderRadius: 8,
  padding: "12px",
  margin: "12px 0",
  fontSize: "13px",
  color: "#1565c0"
};