
import React, { useState, useRef, useEffect } from "react";
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
  
  // Generate quotation HTML (copied from QuotationSoftware and adapted)
  const generateQuotationHTML = (quotationData) => {
    return `
      <div class="container">
        <div class="header">
          <div class="logo-container">
            <img src="${logo}" alt="Syed Solar Energy Logo" class="logo" />
          </div>
          <div class="company-info">
            <h1>Syed Solar Energy Pvt Ltd</h1>
            <p>Office #23, Mustafa Plaza, Ring Road Near Imtiaz Mega Center, Peshawar</p>
            <p><strong>Phone:</strong> 0304-4678929 | <strong>Email:</strong> sales@syedsolarenergy.com</p>
            <p><strong>Website:</strong> www.syedsolarenergy.com</p>
          </div>
        </div>
        <div class="quotation-title">
          🌞 Solar Energy Quotation
        </div>
        <div class="quotation-meta">
          <div>
            <p><strong>Quotation ID:</strong> #${quotationData.id}</p>
            <p><strong>Date:</strong> ${quotationData.quotationDate || new Date().toLocaleDateString()}</p>
          </div>
          <div>
            <p><strong>Valid Until:</strong> ${new Date(Date.now() + 3*24*60*60*1000).toLocaleDateString()}</p>
            <p><strong>System Type:</strong> ${quotationData.systemType}</p>
          </div>
        </div>
        <div class="customer-section">
          <h3>Customer Information</h3>
          <p><strong>Name:</strong> ${quotationData.customer.name}</p>
          <p><strong>Contact:</strong> ${quotationData.customer.contact}</p>
          <p><strong>Email:</strong> ${quotationData.customer.email || 'Not provided'}</p>
          <p><strong>Address:</strong> ${quotationData.customer.address}</p>
        </div>
        <h3 style="color: #e65100; margin: 15px 0 10px 0;">System Configuration & Pricing</h3>
        
        <table class="details-table">
          <thead>
            <tr>
              <th style="width: 50%;">Item Description</th>
              <th style="width: 20%; text-align: center;">Quantity</th>
              <th style="width: 30%; text-align: right;">Amount (PKR)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <div class="item-name">Solar Panels</div>
                <div class="item-desc">${quotationData.solarPanel.company} ${quotationData.solarPanel.watts}W Premium Grade</div>
              </td>
              <td style="text-align: center;">${quotationData.solarPanel.quantity} pcs</td>
              <td class="price">Rs. ${(quotationData.solarPanel.pricePerWatt * quotationData.solarPanel.watts * quotationData.solarPanel.quantity).toLocaleString()}</td>
            </tr>
            
            <tr>
              <td>
                <div class="item-name">${quotationData.systemType.includes('Daytime') ? 'Grid-Tie' : 'Hybrid'} Inverter</div>
                <div class="item-desc">${quotationData.inverter.company} ${quotationData.inverter.kw}kW</div>
              </td>
              <td style="text-align: center;">${quotationData.inverter.quantity} unit</td>
              <td class="price">Rs. ${(quotationData.inverter.quantity * quotationData.inverter.pricePerUnit).toLocaleString()}</td>
            </tr>
            
            ${quotationData.batteryQuantity > 0 ? `
            <tr>
              <td>
                <div class="item-name">Battery Bank</div>
                <div class="item-desc">${quotationData.batteryModel} (${quotationData.batteryType})</div>
              </td>
              <td style="text-align: center;">${quotationData.batteryQuantity} units</td>
              <td class="price">Rs. ${(quotationData.batteryQuantity * quotationData.batteryPrice).toLocaleString()}</td>
            </tr>
            ` : ''}
            
            <tr>
              <td>
                <div class="item-name">Mounting Structure</div>
                <div class="item-desc">${quotationData.stand.type} Grade</div>
              </td>
              <td style="text-align: center;">${quotationData.stand.quantity} sets</td>
              <td class="price">Rs. ${(quotationData.stand.quantity * quotationData.stand.pricePerStand).toLocaleString()}</td>
            </tr>
            
            <tr>
              <td>
                <div class="item-name">Safety & Protection Equipment</div>
                <div class="item-desc">Complete safety kit</div>
              </td>
              <td style="text-align: center;">1 set</td>
              <td class="price">Rs. ${quotationData.safety.toLocaleString()}</td>
            </tr>
            
            <tr>
              <td>
                <div class="item-name">Transportation</div>
                <div class="item-desc">Within Peshawar</div>
              </td>
              <td style="text-align: center;">-</td>
              <td class="price">Rs. ${quotationData.transport.toLocaleString()}</td>
            </tr>
            
            <tr>
              <td>
                <div class="item-name">Professional Installation</div>
                <div class="item-desc">By certified technicians</div>
              </td>
              <td style="text-align: center;">-</td>
              <td class="price">Rs. ${quotationData.labour.toLocaleString()}</td>
            </tr>
            
            ${quotationData.isGreenmeterIncluded ? `
            <tr>
              <td>
                <div class="item-name">Net Metering (Green Meter)</div>
                <div class="item-desc">Government documentation</div>
              </td>
              <td style="text-align: center;">1 unit</td>
              <td class="price">Rs. ${quotationData.greenmeter.toLocaleString()}</td>
            </tr>
            ` : ''}
            
            <tr class="total-row">
              <td colspan="2" style="text-align: right; font-size: 16px;">
                <strong>TOTAL INVESTMENT</strong>
              </td>
              <td class="price" style="font-size: 18px;">
                <strong>Rs. ${quotationData.total.toLocaleString()}</strong>
              </td>
            </tr>
          </tbody>
        </table>
        <div class="warranty-section">
          <h4>🛡️ Warranty & Quality Assurance</h4>
          <ul>
            <li>Solar Panels: 12 years product + 25 years performance warranty</li>
            <li>Inverters: 5 years comprehensive warranty</li>
            <li>Batteries: As per manufacturer's warranty policy</li>
            <li>Installation: 3 months after-sales service warranty</li>
            <li>Site Survey: Rs. 2,000/- for Peshawar city</li>
          </ul>
        </div>
        <div class="terms-section">
          <h4>📋 Terms & Payment Schedule</h4>
          <ul>
            <li><strong>Booking:</strong> 5% advance payment</li>
            <li><strong>Material Arrival:</strong> 70% payment</li>
            <li><strong>Completion:</strong> 25% final payment</li>
            <li><strong>Validity:</strong> 3 days only</li>
            <li><strong>Note:</strong> Prices subject to market changes</li>
          </ul>
        </div>
        <div class="footer">
          Thank you for choosing Syed Solar Energy<br/>
          📧 sales@syedsolarenergy.com | 📱 03044678929<br/>
          📍 Office #23, Mustafa Plaza, Ring Road, Peshawar
        </div>
      </div>
    `;
  };

  // Print quotation function (copied from QuotationSoftware)
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
              }
              .header { 
                display: flex; 
                align-items: center; 
                margin-bottom: 20px; 
                border-bottom: 3px solid #ff9800; 
                padding-bottom: 15px; 
              }
              .logo-container {
                flex: 0 0 100px;
                padding-right: 20px;
              }
              .logo {
                width: 100px;
                height: 100px;
                border-radius: 10px;
              }
              .company-info { 
                padding-left: 20px;
                flex: 1;
              }
              .company-info h1 { 
                color: #ff9800; 
                font-size: 28px; 
                margin-bottom: 8px; 
                font-weight: bold; 
                letter-spacing: 1px;
              }
              .company-info p { 
                margin: 5px 0;
                font-size: 13px;
                color: #666;
              }
              .quotation-title { 
                background: linear-gradient(135deg, #ff9800, #ff6b35); 
                color: white; 
                padding: 20px 15px; 
                text-align: center; 
                font-size: 24px; 
                font-weight: bold;
                letter-spacing: 1.5px;
                text-transform: uppercase;
                margin: 15px 0;
                border-radius: 8px;
              }
              .quotation-meta {
                display: flex;
                justify-content: space-between;
                padding: 10px;
                background: #f0f8ff;
                border-radius: 8px;
                border-left: 4px solid #2196f3;
                margin: 15px 0;
              }
              .customer-section { 
                background: #fffbe8;
                border-radius: 8px;
                padding: 15px;
                margin: 15px 0;
                border-left: 4px solid #ff9800;
              }
              .customer-section h3 { 
                color: #e65100; 
                margin-bottom: 8px; 
                font-size: 16px; 
              }
              .details-table { 
                width: 100%; 
                border-collapse: collapse; 
                margin: 15px 0;
                background: #fff;
              }
              .details-table th { 
                background: #ff9800; 
                color: white; 
                padding: 10px; 
                text-align: left; 
                font-weight: bold; 
              }
              .details-table td { 
                padding: 8px 10px; 
                border-bottom: 1px solid #eee; 
              }
              .details-table tr:nth-child(even) { 
                background: #f9f9f9; 
              }
              .item-name { 
                font-weight: bold; 
                color: #333; 
              }
              .item-desc {
                font-size: 13px;
                color: #666;
                display: block;
                margin-top: 3px;
              }
              .price { 
                font-weight: bold; 
                color: #e65100; 
                text-align: right; 
              }
              .total-row { 
                background: #ffe0b2 !important; 
                font-weight: bold; 
                font-size: 16px; 
              }
              .total-row td { 
                border-top: 2px solid #ff9800; 
                color: #e65100; 
                font-weight: bold;
                padding: 20px;
                font-size: 18px;
              }
              .warranty-section { 
                background: #f0f8f0; 
                border-left: 4px solid #28a745; 
                border-radius: 6px; 
                padding: 15px; 
                margin: 20px 0; 
              }
              .warranty-section h4 { 
                color: #28a745; 
                margin-bottom: 10px; 
                font-size: 14px; 
              }
              .warranty-section ul { 
                list-style: none; 
                padding-left: 0; 
              }
              .warranty-section li { 
                padding: 3px 0; 
                font-size: 12px; 
                position: relative; 
                padding-left: 15px; 
              }
              .warranty-section li:before { 
                content: "✓"; 
                color: #28a745; 
                font-weight: bold; 
                position: absolute; 
                left: 0; 
              }
              .terms-section { 
                background: #fff8e1; 
                border-left: 4px solid #ffc107; 
                border-radius: 6px; 
                padding: 15px; 
                margin: 20px 0; 
              }
              .terms-section h4 { 
                color: #f57c00; 
                margin-bottom: 10px; 
                font-size: 14px; 
              }
              .terms-section ul { 
                list-style: disc; 
                padding-left: 15px; 
              }
              .terms-section li { 
                padding: 2px 0; 
                font-size: 12px; 
              }
              .footer { 
                text-align: center; 
                padding: 20px;
                background: #ff9800; 
                color: white; 
                font-size: 14px; 
                border-radius: 8px;
                margin-top: 20px;
              }
              @media print { 
                body { margin: 0; padding: 0; -webkit-print-color-adjust: exact; } 
                .container { max-width: none; }
              }
            </style>
          </head>
          <body>
            ${quotationHTML}
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

  // Modified handleGenerateQuotation function
  async function handleGenerateQuotation(e) {
    e.preventDefault();
    setSaving(true);
    
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
      setSaving(false);
      return;
    }
    
    // Prepare data for printing
    const printData = {
      id: quotationId,
      customer: {
        name: customer.name,
        contact: customer.contact,
        email: customer.email,
        address: customer.address
      },
      systemType: systemLabel,
      quotationDate: new Date().toLocaleDateString(),
      solarPanel: {
        company: systemType === "auto" ? previewConfig.panelBrand : panelBrand,
        watts: systemType === "auto" ? previewConfig.panelWatt : panelWatt,
        quantity: systemType === "auto" ? previewConfig.panelQty : panelQty,
        pricePerWatt: systemType === "auto" 
          ? (panelPrices[previewConfig.panelBrand]?.[previewConfig.panelWatt]?.pricePerWatt || 0)
          : (panelPrices[panelBrand]?.[panelWatt]?.pricePerWatt || 0)
      },
      inverter: {
        company: quotationData.selectedInverter?.brand || "",
        kw: quotationData.selectedInverter?.capacity || "",
        quantity: systemType === "auto" ? previewConfig.inverterQty : inverterQty,
        pricePerUnit: quotationData.selectedInverter?.price || 0
      },
      batteryType: sysType === "hybrid" 
        ? (systemType === "auto" ? previewConfig.batteryType : batteryType)
        : "",
      batteryModel: sysType === "hybrid" 
        ? (quotationData.selectedBattery?.model || "")
        : "",
      batteryQuantity: sysType === "hybrid" 
        ? (systemType === "auto" ? previewConfig.batteryQty : batteryQty)
        : 0,
      batteryPrice: sysType === "hybrid" 
        ? (quotationData.selectedBattery?.price || 0)
        : 0,
      stand: {
        type: systemType === "auto" ? previewConfig.standType : standType,
        quantity: quotationData.standQty,
        pricePerStand: standPrices[systemType === "auto" ? previewConfig.standType : standType] || 0
      },
      safety: quotationData.safety,
      transport: quotationData.transport,
      labour: quotationData.install,
      isGreenmeterIncluded: greenMeter,
      greenmeter: quotationData.green,
      total: quotationData.grandTotal
    };
    
    // Print quotation using the new method
    printQuotation(printData);
    
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
    setSaving(false);
  }
  
  // Enhanced preview rendering with same design as QuotationScreen
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
      <div style={{
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
        {/* Header with same design as QuotationScreen */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          marginBottom: '20px',
          borderBottom: '3px solid #ff9800',
          paddingBottom: '15px'
        }}>
          <div style={{
            flex: '0 0 100px',
            paddingRight: '20px'
          }}>
            <img 
              src={logo} 
              alt="Syed Solar Energy Logo" 
              style={{
                width: '100px',
                height: '100px',
                borderRadius: '10px'
              }} 
            />
          </div>
          <div style={{ paddingLeft: '20px', flex: 1 }}>
            <h1 style={{
              color: '#ff9800',
              fontSize: '28px',
              fontWeight: 'bold',
              marginBottom: '8px',
              letterSpacing: '1px'
            }}>
              Syed Solar Energy Pvt Ltd
            </h1>
            <p style={{
              color: '#666',
              fontSize: '13px',
              margin: '5px 0'
            }}>
              Office #23, Mustafa Plaza, Ring Road Near Imtiaz Mega Center, Peshawar
            </p>
            <p style={{
              color: '#666',
              fontSize: '13px',
              margin: '5px 0'
            }}>
              <strong>Phone:</strong> 0304-4678929 | <strong>Email:</strong> sales@syedsolarenergy.com
            </p>
          </div>
        </div>
        {/* Quotation Title */}
        <div style={{
          background: 'linear-gradient(135deg, #ff9800, #ff6b35)',
          color: 'white',
          padding: '20px 15px',
          borderRadius: '8px',
          fontSize: '24px',
          fontWeight: 'bold',
          textAlign: 'center',
          margin: '15px 0',
          letterSpacing: '1.5px',
          textTransform: 'uppercase'
        }}>
          🌞 Solar Energy Quotation
        </div>
        {/* Quotation Meta */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          margin: '15px 0',
          padding: '10px',
          background: '#f0f8ff',
          borderRadius: '8px',
          borderLeft: '4px solid #2196f3'
        }}>
          <div>
            <p style={{ margin: '0', fontSize: '14px' }}><strong>Quotation ID:</strong> #{quotationId}</p>
            <p style={{ margin: '0', fontSize: '14px' }}><strong>Date:</strong> {new Date().toLocaleDateString()}</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ margin: '0', fontSize: '14px' }}><strong>Valid Until:</strong> {new Date(Date.now() + 3*24*60*60*1000).toLocaleDateString()}</p>
            <p style={{ margin: '0', fontSize: '14px' }}><strong>System Type:</strong> {sysLabel}</p>
          </div>
        </div>
        {/* Customer Section */}
        <div style={{
          background: '#fffbe8',
          borderRadius: '8px',
          padding: '15px',
          margin: '15px 0',
          borderLeft: '4px solid #ff9800'
        }}>
          <h3 style={{
            color: '#e65100',
            marginBottom: '8px',
            fontSize: '16px'
          }}>
            Customer Information
          </h3>
          <p style={{ margin: '0', fontSize: '14px' }}><strong>Name:</strong> {customer.name}</p>
          <p style={{ margin: '0', fontSize: '14px' }}><strong>Contact:</strong> {customer.contact}</p>
          <p style={{ margin: '0', fontSize: '14px' }}><strong>Email:</strong> {customer.email || 'Not provided'}</p>
          <p style={{ margin: '0', fontSize: '14px' }}><strong>Address:</strong> {customer.address}</p>
        </div>
        {/* System Configuration Table */}
        <h3 style={{
          color: '#e65100',
          margin: '15px 0 10px 0'
        }}>
          System Configuration & Pricing
        </h3>
        <table style={{
          width: '100%',
          borderCollapse: 'collapse',
          margin: '15px 0',
          background: '#fff'
        }}>
          <thead>
            <tr>
              <th style={{
                background: '#ff9800',
                color: 'white',
                padding: '10px',
                textAlign: 'left',
                fontWeight: 'bold',
                width: '50%'
              }}>
                Item Description
              </th>
              <th style={{
                background: '#ff9800',
                color: 'white',
                padding: '10px',
                textAlign: 'center',
                fontWeight: 'bold',
                width: '20%'
              }}>
                Quantity
              </th>
              <th style={{
                background: '#ff9800',
                color: 'white',
                padding: '10px',
                textAlign: 'right',
                fontWeight: 'bold',
                width: '30%'
              }}>
                Amount (PKR)
              </th>
            </tr>
          </thead>
          <tbody>
            {/* Solar Panels */}
            <tr>
              <td style={{
                padding: '8px 10px',
                borderBottom: '1px solid #eee'
              }}>
                <div style={{ fontWeight: 'bold', color: '#333' }}>
                  Solar Panels
                </div>
                <div style={{ fontSize: '13px', color: '#666' }}>
                  {systemType === "auto" ? previewConfig.panelBrand : panelBrand} {systemType === "auto" ? previewConfig.panelWatt : panelWatt}W Premium Grade
                </div>
              </td>
              <td style={{
                padding: '8px 10px',
                borderBottom: '1px solid #eee',
                textAlign: 'center'
              }}>
                {systemType === "auto" ? previewConfig.panelQty : panelQty} pcs
              </td>
              <td style={{
                padding: '8px 10px',
                borderBottom: '1px solid #eee',
                textAlign: 'right',
                fontWeight: 'bold',
                color: '#e65100'
              }}>
                Rs. {data.panelTotal.toLocaleString()}
              </td>
            </tr>
            {/* Inverter */}
            <tr style={{ background: '#f9f9f9' }}>
              <td style={{
                padding: '8px 10px',
                borderBottom: '1px solid #eee'
              }}>
                <div style={{ fontWeight: 'bold', color: '#333' }}>
                  {sysType === "daytime" ? 'Grid-Tie' : 'Hybrid'} Inverter
                </div>
                <div style={{ fontSize: '13px', color: '#666' }}>
                  {data.selectedInverter?.brand || ""} {data.selectedInverter?.capacity || ""}
                </div>
              </td>
              <td style={{
                padding: '8px 10px',
                borderBottom: '1px solid #eee',
                textAlign: 'center'
              }}>
                {systemType === "auto" ? previewConfig.inverterQty : inverterQty} unit
              </td>
              <td style={{
                padding: '8px 10px',
                borderBottom: '1px solid #eee',
                textAlign: 'right',
                fontWeight: 'bold',
                color: '#e65100'
              }}>
                Rs. {data.invTotal.toLocaleString()}
              </td>
            </tr>
            {/* Battery (for hybrid only) */}
            {sysType === "hybrid" && data.battTotal > 0 && (
              <tr>
                <td style={{
                  padding: '8px 10px',
                  borderBottom: '1px solid #eee'
                }}>
                  <div style={{ fontWeight: 'bold', color: '#333' }}>
                    Battery Bank
                  </div>
                  <div style={{ fontSize: '13px', color: '#666' }}>
                    {data.selectedBattery?.model || ""} ({data.selectedBattery?.type || ""})
                  </div>
                </td>
                <td style={{
                  padding: '8px 10px',
                  borderBottom: '1px solid #eee',
                  textAlign: 'center'
                }}>
                  {systemType === "auto" ? previewConfig.batteryQty : batteryQty} units
                </td>
                <td style={{
                  padding: '8px 10px',
                  borderBottom: '1px solid #eee',
                  textAlign: 'right',
                  fontWeight: 'bold',
                  color: '#e65100'
                }}>
                  Rs. {data.battTotal.toLocaleString()}
                </td>
              </tr>
            )}
            {/* Mounting Structure */}
            <tr style={{ background: '#f9f9f9' }}>
              <td style={{
                padding: '8px 10px',
                borderBottom: '1px solid #eee'
              }}>
                <div style={{ fontWeight: 'bold', color: '#333' }}>
                  Mounting Structure
                </div>
                <div style={{ fontSize: '13px', color: '#666' }}>
                  {systemType === "auto" ? previewConfig.standType : standType} Grade
                </div>
              </td>
              <td style={{
                padding: '8px 10px',
                borderBottom: '1px solid #eee',
                textAlign: 'center'
              }}>
                {data.standQty} sets
              </td>
              <td style={{
                padding: '8px 10px',
                borderBottom: '1px solid #eee',
                textAlign: 'right',
                fontWeight: 'bold',
                color: '#e65100'
              }}>
                Rs. {data.standTotal.toLocaleString()}
              </td>
            </tr>
            {/* Safety & Protection */}
            <tr>
              <td style={{
                padding: '8px 10px',
                borderBottom: '1px solid #eee'
              }}>
                <div style={{ fontWeight: 'bold', color: '#333' }}>
                  Safety & Protection Equipment
                </div>
              </td>
              <td style={{
                padding: '8px 10px',
                borderBottom: '1px solid #eee',
                textAlign: 'center'
              }}>
                1 set
              </td>
              <td style={{
                padding: '8px 10px',
                borderBottom: '1px solid #eee',
                textAlign: 'right',
                fontWeight: 'bold',
                color: '#e65100'
              }}>
                Rs. {data.safety.toLocaleString()}
              </td>
            </tr>
            {/* Transportation */}
            <tr style={{ background: '#f9f9f9' }}>
              <td style={{
                padding: '8px 10px',
                borderBottom: '1px solid #eee'
              }}>
                <div style={{ fontWeight: 'bold', color: '#333' }}>
                  Transportation
                </div>
              </td>
              <td style={{
                padding: '8px 10px',
                borderBottom: '1px solid #eee',
                textAlign: 'center'
              }}>
                -
              </td>
              <td style={{
                padding: '8px 10px',
                borderBottom: '1px solid #eee',
                textAlign: 'right',
                fontWeight: 'bold',
                color: '#e65100'
              }}>
                Rs. {data.transport.toLocaleString()}
              </td>
            </tr>
            {/* Installation */}
            <tr>
              <td style={{
                padding: '8px 10px',
                borderBottom: '1px solid #eee'
              }}>
                <div style={{ fontWeight: 'bold', color: '#333' }}>
                  Professional Installation
                </div>
              </td>
              <td style={{
                padding: '8px 10px',
                borderBottom: '1px solid #eee',
                textAlign: 'center'
              }}>
                -
              </td>
              <td style={{
                padding: '8px 10px',
                borderBottom: '1px solid #eee',
                textAlign: 'right',
                fontWeight: 'bold',
                color: '#e65100'
              }}>
                Rs. {data.install.toLocaleString()}
              </td>
            </tr>
            {/* Green Meter (if included) */}
            {greenMeter && (
              <tr style={{ background: '#f9f9f9' }}>
                <td style={{
                  padding: '8px 10px',
                  borderBottom: '1px solid #eee'
                }}>
                  <div style={{ fontWeight: 'bold', color: '#333' }}>
                    Net Metering (Green Meter)
                  </div>
                </td>
                <td style={{
                  padding: '8px 10px',
                  borderBottom: '1px solid #eee',
                  textAlign: 'center'
                }}>
                  1 unit
                </td>
                <td style={{
                  padding: '8px 10px',
                  borderBottom: '1px solid #eee',
                  textAlign: 'right',
                  fontWeight: 'bold',
                  color: '#e65100'
                }}>
                  Rs. {data.green.toLocaleString()}
                </td>
              </tr>
            )}
            {/* Total */}
            <tr style={{
              background: '#ffe0b2',
              fontWeight: 'bold',
              fontSize: '16px'
            }}>
              <td colSpan="2" style={{
                borderTop: '2px solid #ff9800',
                color: '#e65100',
                fontWeight: 'bold',
                padding: '20px',
                fontSize: '16px',
                textAlign: 'right'
              }}>
                <strong>TOTAL INVESTMENT</strong>
              </td>
              <td style={{
                borderTop: '2px solid #ff9800',
                color: '#e65100',
                fontWeight: 'bold',
                padding: '20px',
                fontSize: '18px',
                textAlign: 'right'
              }}>
                <strong>Rs. {data.grandTotal.toLocaleString()}</strong>
              </td>
            </tr>
          </tbody>
        </table>
        {/* Warranty Section */}
        <div style={{
          background: '#f0f8f0',
          borderLeft: '4px solid #28a745',
          borderRadius: '6px',
          padding: '15px',
          margin: '20px 0'
        }}>
          <h4 style={{
            color: '#28a745',
            marginBottom: '10px',
            fontSize: '14px'
          }}>
            🛡️ Warranty & Quality Assurance
          </h4>
          <ul style={{
            listStyle: 'none',
            paddingLeft: '0'
          }}>
            <li style={{
              padding: '3px 0',
              fontSize: '12px',
              position: 'relative',
              paddingLeft: '15px'
            }}>
              <span style={{
                content: "✓",
                color: '#28a745',
                fontWeight: 'bold',
                position: 'absolute',
                left: '0'
              }}>✓</span>
              Solar Panels: 12 years product + 25 years performance warranty
            </li>
            <li style={{
              padding: '3px 0',
              fontSize: '12px',
              position: 'relative',
              paddingLeft: '15px'
            }}>
              <span style={{
                content: "✓",
                color: '#28a745',
                fontWeight: 'bold',
                position: 'absolute',
                left: '0'
              }}>✓</span>
              Inverters: 5 years comprehensive warranty
            </li>
            <li style={{
              padding: '3px 0',
              fontSize: '12px',
              position: 'relative',
              paddingLeft: '15px'
            }}>
              <span style={{
                content: "✓",
                color: '#28a745',
                fontWeight: 'bold',
                position: 'absolute',
                left: '0'
              }}>✓</span>
              Batteries: As per manufacturer's warranty policy
            </li>
            <li style={{
              padding: '3px 0',
              fontSize: '12px',
              position: 'relative',
              paddingLeft: '15px'
            }}>
              <span style={{
                content: "✓",
                color: '#28a745',
                fontWeight: 'bold',
                position: 'absolute',
                left: '0'
              }}>✓</span>
              Installation: 3 months after-sales service warranty
            </li>
            <li style={{
              padding: '3px 0',
              fontSize: '12px',
              position: 'relative',
              paddingLeft: '15px'
            }}>
              <span style={{
                content: "✓",
                color: '#28a745',
                fontWeight: 'bold',
                position: 'absolute',
                left: '0'
              }}>✓</span>
              Site Survey: Rs. 2,000/- for Peshawar city
            </li>
          </ul>
        </div>
        {/* Terms Section */}
        <div style={{
          background: '#fff8e1',
          borderLeft: '4px solid #ffc107',
          borderRadius: '6px',
          padding: '15px',
          margin: '20px 0'
        }}>
          <h4 style={{
            color: '#f57c00',
            marginBottom: '10px',
            fontSize: '14px'
          }}>
            📋 Terms & Payment Schedule
          </h4>
          <ul style={{
            listStyle: 'disc',
            paddingLeft: '15px'
          }}>
            <li style={{
              padding: '2px 0',
              fontSize: '12px'
            }}>
              <strong>Booking:</strong> 5% advance payment
            </li>
            <li style={{
              padding: '2px 0',
              fontSize: '12px'
            }}>
              <strong>Material Arrival:</strong> 70% payment
            </li>
            <li style={{
              padding: '2px 0',
              fontSize: '12px'
            }}>
              <strong>Completion:</strong> 25% final payment
            </li>
            <li style={{
              padding: '2px 0',
              fontSize: '12px'
            }}>
              <strong>Validity:</strong> 3 days only
            </li>
            <li style={{
              padding: '2px 0',
              fontSize: '12px'
            }}>
              <strong>Note:</strong> Prices subject to market changes
            </li>
          </ul>
        </div>
        {/* Footer */}
        <div style={{
          textAlign: 'center',
          padding: '20px',
          background: '#ff9800',
          color: 'white',
          borderRadius: '8px',
          fontSize: '14px'
        }}>
          Thank you for choosing Syed Solar Energy<br/>
          📧 sales@syedsolarenergy.com | 📱 03044678929<br/>
          📍 Office #23, Mustafa Plaza, Ring Road, Peshawar
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
