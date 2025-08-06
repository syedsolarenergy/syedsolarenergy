import React, { useEffect, useState, useCallback } from "react";
import { supabase } from "../supabaseClient";

export default function AdminPanel() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  // Data states
  const [sections, setSections] = useState([]);
  const [events, setEvents] = useState([]);
  const [partners, setPartners] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [features, setFeatures] = useState([]);
  const [displaySettings, setDisplaySettings] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [counters, setCounters] = useState([]);

  // Solar products
  const [solarPanels, setSolarPanels] = useState([]);
  const [inverters, setInverters] = useState([]);
  const [batteries, setBatteries] = useState([]);
  const [stands, setStands] = useState([]);
  const [charges, setCharges] = useState([]);

  // Form states with separate preview states for each section
  const [previewStates, setPreviewStates] = useState({});
  const [addPreviewStates, setAddPreviewStates] = useState({});
  
  const [editingItem, setEditingItem] = useState(null);

  // New item states
  const [newSection, setNewSection] = useState({
    section_name: '',
    title: '',
    subtitle: '',
    content_text: '',
    background_color: '#ffffff',
    text_color: '#333333',
    button_text: '',
    button_link: ''
  });
  
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    date: '',
    image_url: '',
    link: ''
  });
  
  const [newPartner, setNewPartner] = useState({
    name: '',
    logo_url: '',
    website_link: '',
    description: ''
  });
  
  const [newCustomer, setNewCustomer] = useState({
    name: '',
    logo_url: '',
    testimonial: '',
    website_link: ''
  });
  
  const [newFeature, setNewFeature] = useState({
    title: '',
    description: '',
    icon_url: ''
  });
  
  const [newReview, setNewReview] = useState({
    name: '',
    review: '',
    stars: 5,
    avatar_url: '',
    designation: ''
  });
  
  const [newCounter, setNewCounter] = useState({
    label: '',
    value: 0,
    color: '#FF3C00'
  });

  // Enhanced Solar product forms
  const [newSolarPanel, setNewSolarPanel] = useState({ 
    brand: "", 
    wattage: "", 
    price: "",
    price_per_watt: ""
  });
  
  const [newInverter, setNewInverter] = useState({ 
    type: "", 
    brand: "",
    model: "", 
    capacity: "", 
    price: "" 
  });
  
  const [newBattery, setNewBattery] = useState({ 
    type: "", 
    voltage: "",
    capacity: "",
    model: "", 
    price: "" 
  });
  
  const [newStand, setNewStand] = useState({ 
    type: "", 
    price: "" 
  });
  
  const [newCharge, setNewCharge] = useState({ 
    name: "", 
    amount: "" 
  });

  // Login function
  const login = () => {
    if (username === "admin" && password === "Zub@12345") {
      setLoggedIn(true);
    } else {
      alert("Invalid credentials!");
    }
  };

  // Real-time subscription setup
  const setupRealtimeSubscription = useCallback(() => {
    const tables = [
      'homepage_sections', 'homepage_events', 'homepage_partners',
      'homepage_customers', 'homepage_features', 'homepage_reviews',
      'homepage_counters', 'display_settings',
      'solar_panels', 'inverters', 'batteries', 'stands', 'charges'
    ];

    tables.forEach(table => {
      supabase
        .channel(`${table}_changes`)
        .on('postgres_changes', 
          { event: '*', schema: 'public', table },
          () => {
            fetchData();
            fetchSolarProducts();
          }
        )
        .subscribe();
    });
  }, []);

  // Fetch Data function
  const fetchData = async () => {
    try {
      const [
        { data: sec },
        { data: ev },
        { data: pr },
        { data: cu },
        { data: ft },
        { data: display },
        { data: rev },
        { data: cnt }
      ] = await Promise.all([
        supabase.from("homepage_sections").select("*").order("display_order"),
        supabase.from("homepage_events").select("*").order("date", { ascending: false }),
        supabase.from("homepage_partners").select("*").order("name"),
        supabase.from("homepage_customers").select("*").order("name"),
        supabase.from("homepage_features").select("*").order("display_order"),
        supabase.from("display_settings").select("*").order("section_name"),
        supabase.from("homepage_reviews").select("*").order("id"),
        supabase.from("homepage_counters").select("*").order("display_order")
      ]);

      setSections(sec || []);
      setEvents(ev || []);
      setPartners(pr || []);
      setCustomers(cu || []);
      setFeatures(ft || []);
      setDisplaySettings(display || []);
      setReviews(rev || []);
      setCounters(cnt || []);
    } catch (err) {
      console.error("Fetch error:", err);
    }
  };

  // Fetch solar products
  const fetchSolarProducts = async () => {
    try {
      const [
        { data: panels },
        { data: invs },
        { data: bats },
        { data: stds },
        { data: chgs }
      ] = await Promise.all([
        supabase.from('solar_panels').select('*').order('brand'),
        supabase.from('inverters').select('*').order('type', 'brand'),
        supabase.from('batteries').select('*').order('type', 'voltage'),
        supabase.from('stands').select('*').order('type'),
        supabase.from('charges').select('*').order('name')
      ]);
      
      setSolarPanels(panels || []);
      setInverters(invs || []);
      setBatteries(bats || []);
      setStands(stds || []);
      setCharges(chgs || []);
    } catch (err) {
      console.error("Error fetching solar products:", err);
    }
  };

  // useEffect hook
  useEffect(() => {
    if (loggedIn) {
      fetchData();
      fetchSolarProducts();
      setupRealtimeSubscription();
    }
  }, [loggedIn, setupRealtimeSubscription]);

  // Enhanced CRUD operations with proper validation
  const addItem = async (table, item) => {
    try {
      // Validate solar panel price per watt calculation
      if (table === 'solar_panels' && item.wattage && item.price) {
        item.price_per_watt = (parseFloat(item.price) / parseFloat(item.wattage)).toFixed(2);
      }

      const { error } = await supabase.from(table).insert([item]);
      if (error) {
        alert(`Error: ${error.message}`);
        return;
      }

      // Refresh data
      if (table.startsWith('homepage')) {
        fetchData();
      } else {
        fetchSolarProducts();
      }

      // Reset forms
      resetForm(table);
      setAddPreviewStates({ ...addPreviewStates, [table]: false });
      
    } catch (err) {
      alert(`Error adding item: ${err.message}`);
    }
  };

  const updateItem = async (table, id, updates) => {
    try {
      const { id: _, ...data } = updates;
      
      // Validate solar panel price per watt calculation
      if (table === 'solar_panels' && data.wattage && data.price) {
        data.price_per_watt = (parseFloat(data.price) / parseFloat(data.wattage)).toFixed(2);
      }

      const { error } = await supabase.from(table).update(data).eq("id", id);
      if (error) {
        alert(`Error: ${error.message}`);
        return;
      }

      if (table.startsWith('homepage')) {
        fetchData();
      } else {
        fetchSolarProducts();
      }
      setEditingItem(null);
      
    } catch (err) {
      alert(`Error updating item: ${err.message}`);
    }
  };

  const deleteItem = async (table, id) => {
    if (window.confirm("Are you sure you want to delete this item?")) {
      try {
        const { error } = await supabase.from(table).delete().eq("id", id);
        if (error) {
          alert(`Error: ${error.message}`);
          return;
        }

        if (table.startsWith('homepage')) {
          fetchData();
        } else {
          fetchSolarProducts();
        }
        
      } catch (err) {
        alert(`Error deleting item: ${err.message}`);
      }
    }
  };

  // Reset form helper
  const resetForm = (table) => {
    switch(table) {
      case 'homepage_sections':
        setNewSection({
          section_name: '', title: '', subtitle: '', content_text: '',
          background_color: '#ffffff', text_color: '#333333',
          button_text: '', button_link: ''
        });
        break;
      case 'homepage_events':
        setNewEvent({ title: '', description: '', date: '', image_url: '', link: '' });
        break;
      case 'homepage_partners':
        setNewPartner({ name: '', logo_url: '', website_link: '', description: '' });
        break;
      case 'homepage_customers':
        setNewCustomer({ name: '', logo_url: '', testimonial: '', website_link: '' });
        break;
      case 'homepage_features':
        setNewFeature({ title: '', description: '', icon_url: '' });
        break;
      case 'homepage_reviews':
        setNewReview({ name: '', review: '', stars: 5, avatar_url: '', designation: '' });
        break;
      case 'homepage_counters':
        setNewCounter({ label: '', value: 0, color: '#FF3C00' });
        break;
      case 'solar_panels':
        setNewSolarPanel({ brand: '', wattage: '', price: '', price_per_watt: '' });
        break;
      case 'inverters':
        setNewInverter({ type: '', brand: '', model: '', capacity: '', price: '' });
        break;
      case 'batteries':
        setNewBattery({ type: '', voltage: '', capacity: '', model: '', price: '' });
        break;
      case 'stands':
        setNewStand({ type: '', price: '' });
        break;
      case 'charges':
        setNewCharge({ name: '', amount: '' });
        break;
      default:
        break;
    }
  };

  // Display Mode helpers
  const getCurrentDisplayMode = section => {
    const setting = displaySettings.find(s => s.section_name === section);
    return setting ? setting.display_mode : "grid";
  };

  const handleDisplayModeChange = async (section, mode) => {
    const { error } = await supabase.from("display_settings")
      .update({ display_mode: mode })
      .eq("section_name", section);
    if (error) {
      alert(error.message);
    } else {
      fetchData();
    }
  };

  // Enhanced preview toggle with unique keys
  const togglePreview = (itemId, sectionKey) => {
    const key = `${sectionKey}_${itemId}`;
    setPreviewStates({ ...previewStates, [key]: !previewStates[key] });
  };

  const toggleAddPreview = (sectionKey) => {
    setAddPreviewStates({ ...addPreviewStates, [sectionKey]: !addPreviewStates[sectionKey] });
  };

  // Enhanced field rendering function
  const renderField = (field, value, onChange, table) => {
    const inputStyle = {
      width: '100%',
      padding: '8px 12px',
      border: '1px solid #ddd',
      borderRadius: '6px',
      fontSize: '14px'
    };

    switch(field) {
      case 'type':
        if (table === 'inverters') {
          return (
            <select value={value || ""} onChange={onChange} style={inputStyle}>
              <option value="">Select Inverter Type</option>
              <option value="daytime">Daytime</option>
              <option value="hybrid">Hybrid</option>
            </select>
          );
        } else if (table === 'batteries') {
          return (
            <select value={value || ""} onChange={onChange} style={inputStyle}>
              <option value="">Select Battery Type</option>
              <option value="lithium">Lithium</option>
              <option value="tubular">Tubular</option>
            </select>
          );
        } else if (table === 'stands') {
          return (
            <input
              type="text"
              value={value || ""}
              onChange={onChange}
              placeholder="e.g., Elevated 16G, Ground Mount, Roof Top"
              style={inputStyle}
            />
          );
        }
        break;
      case 'voltage':
        if (table === 'batteries') {
          return (
            <select value={value || ""} onChange={onChange} style={inputStyle}>
              <option value="">Select Voltage</option>
              <option value="25.6V">25.6V</option>
              <option value="51.2V">51.2V</option>
            </select>
          );
        }
        break;
      case 'content_text':
      case 'description':
      case 'review':
      case 'testimonial':
        return (
          <textarea
            value={value || ""}
            onChange={onChange}
            rows={3}
            placeholder={`Enter ${field.replace('_', ' ')}`}
            style={{ ...inputStyle, fontFamily: 'inherit', resize: 'vertical' }}
          />
        );
      case 'brand':
        return (
          <input
            type="text"
            value={value || ""}
            onChange={onChange}
            placeholder="e.g., Longi, Jinko, Canadian Solar"
            style={inputStyle}
          />
        );
      case 'model':
        return (
          <input
            type="text"
            value={value || ""}
            onChange={onChange}
            placeholder="e.g., Hi-MO 5, Tiger Neo, BiHiKu"
            style={inputStyle}
          />
        );
      case 'capacity':
        return (
          <input
            type="text"
            value={value || ""}
            onChange={onChange}
            placeholder={table === 'inverters' ? "e.g., 5kW, 10kW, 15kW" : "e.g., 100Ah, 200Ah"}
            style={inputStyle}
          />
        );
      case 'wattage':
        return (
          <input
            type="number"
            value={value || ""}
            onChange={onChange}
            placeholder="e.g., 540, 575, 590"
            style={inputStyle}
            min="100"
            max="1000"
          />
        );
      case 'price':
      case 'amount':
        return (
          <input
            type="number"
            value={value || ""}
            onChange={onChange}
            placeholder="Enter amount in PKR"
            style={inputStyle}
            min="0"
          />
        );
      case 'name':
        if (table === 'charges') {
          return (
            <input
              type="text"
              value={value || ""}
              onChange={onChange}
              placeholder="e.g., safety_daytime, installation_hybrid"
              style={inputStyle}
            />
          );
        } else {
          return (
            <input
              type="text"
              value={value || ""}
              onChange={onChange}
              placeholder="Enter name"
              style={inputStyle}
            />
          );
        }
      default:
        return (
          <input
            type={['stars', 'value', 'price', 'amount', 'wattage', 'price_per_watt'].includes(field) ? "number" : 
                  field === 'date' ? "date" : 
                  field.includes('color') ? "color" : "text"}
            value={value || ""}
            onChange={onChange}
            placeholder={`Enter ${field.replace('_', ' ')}`}
            style={inputStyle}
            step={field === 'price_per_watt' ? "0.01" : undefined}
            readOnly={field === 'price_per_watt'}
          />
        );
    }
    return null;
  };

  // Enhanced preview components
  const renderItemPreview = (item, type, sectionKey) => {
    const previewStyle = {
      border: "2px dashed #FF9800",
      padding: "20px",
      marginTop: "15px",
      borderRadius: "12px",
      background: "linear-gradient(145deg, #fff3e0, #ffffff)",
      boxShadow: "4px 4px 8px rgba(0,0,0,0.1)"
    };

    switch(type) {
      case 'solar_panel':
        return (
          <div style={previewStyle}>
            <div style={{
              background: 'white',
              borderRadius: '12px',
              padding: '25px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
            }}>
              <h4 style={{ color: '#FF6600', fontSize: '18px', fontWeight: 'bold', marginBottom: '15px' }}>
                {item.brand || "Solar Panel"} - {item.wattage}W
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', color: '#666', lineHeight: '1.5' }}>
                <div><b>Wattage:</b> {item.wattage}W</div>
                <div><b>Price:</b> Rs. {parseInt(item.price || 0).toLocaleString()}</div>
                <div><b>Price/Watt:</b> Rs. {(parseFloat(item.price || 0) / parseFloat(item.wattage || 1)).toFixed(2)}</div>
                <div><b>Brand:</b> {item.brand}</div>
              </div>
            </div>
          </div>
        );
        
      case 'inverter':
        return (
          <div style={previewStyle}>
            <div style={{
              background: 'white',
              borderRadius: '12px',
              padding: '25px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
            }}>
              <h4 style={{ color: '#FF6600', fontSize: '18px', fontWeight: 'bold', marginBottom: '15px' }}>
                {item.type === 'daytime' ? 'Daytime' : 'Hybrid'} Inverter
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', color: '#666', lineHeight: '1.5' }}>
                <div><b>Brand:</b> {item.brand}</div>
                <div><b>Model:</b> {item.model}</div>
                <div><b>Capacity:</b> {item.capacity}</div>
                <div><b>Price:</b> Rs. {parseInt(item.price || 0).toLocaleString()}</div>
              </div>
            </div>
          </div>
        );
        
      case 'battery':
        return (
          <div style={previewStyle}>
            <div style={{
              background: 'white',
              borderRadius: '12px',
              padding: '25px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
            }}>
              <h4 style={{ color: '#FF6600', fontSize: '18px', fontWeight: 'bold', marginBottom: '15px' }}>
                {item.type === 'tubular' ? 'Tubular' : 'Lithium'} Battery
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', color: '#666', lineHeight: '1.5' }}>
                <div><b>Model:</b> {item.model}</div>
                <div><b>Voltage:</b> {item.voltage}</div>
                <div><b>Capacity:</b> {item.capacity}</div>
                <div><b>Price:</b> Rs. {parseInt(item.price || 0).toLocaleString()}</div>
              </div>
            </div>
          </div>
        );
        
      case 'stand':
        return (
          <div style={previewStyle}>
            <div style={{
              background: 'white',
              borderRadius: '12px',
              padding: '25px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
            }}>
              <h4 style={{ color: '#FF6600', fontSize: '18px', fontWeight: 'bold', marginBottom: '15px' }}>
                Solar Stand
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', color: '#666', lineHeight: '1.5' }}>
                <div><b>Type:</b> {item.type}</div>
                <div><b>Price:</b> Rs. {parseInt(item.price || 0).toLocaleString()}</div>
              </div>
            </div>
          </div>
        );
        
      case 'charge':
        return (
          <div style={previewStyle}>
            <div style={{
              background: 'white',
              borderRadius: '12px',
              padding: '25px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
            }}>
              <h4 style={{ color: '#FF6600', fontSize: '18px', fontWeight: 'bold', marginBottom: '15px' }}>
                Service Charge
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', color: '#666', lineHeight: '1.5' }}>
                <div><b>Name:</b> {item.name}</div>
                <div><b>Amount:</b> Rs. {parseInt(item.amount || 0).toLocaleString()}</div>
              </div>
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };

  // Enhanced Display Toggle Component
  const renderDisplayToggle = (section, label) => (
    <div style={{
      background: 'white',
      border: '1px solid #e0e0e0',
      borderRadius: '12px',
      padding: '20px',
      marginBottom: '20px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h3 style={{ margin: 0, color: '#333', fontSize: '16px', fontWeight: 'bold' }}>
            {label} Display Mode
          </h3>
          <p style={{ margin: '5px 0 0 0', color: '#666', fontSize: '14px' }}>
            Choose how this section appears on the homepage
          </p>
        </div>
        <select
          value={getCurrentDisplayMode(section)}
          onChange={e => handleDisplayModeChange(section, e.target.value)}
          style={{
            padding: '8px 12px',
            border: '1px solid #ddd',
            borderRadius: '6px',
            fontSize: '14px',
            background: 'white',
            color: '#333',
            cursor: 'pointer'
          }}
        >
          <option value="grid">Grid Layout</option>
          <option value="slider">Slider Layout</option>
        </select>
      </div>
    </div>
  );

  // Enhanced Editable List Component
  const renderEditableList = (title, list, fields, table, newItem, setNewItem, type, sectionKey) => {
    return (
      <div style={{ marginBottom: '40px' }}>
        <div style={{
          background: '#fff',
          borderRadius: '12px',
          padding: '30px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          border: '1px solid #e0e0e0'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '25px',
            paddingBottom: '15px',
            borderBottom: '2px solid #FF6600'
          }}>
            <h2 style={{
              margin: 0,
              color: '#FF6600',
              fontSize: '24px',
              fontWeight: 'bold'
            }}>
              {title}
            </h2>
            <div style={{
              background: '#f0f0f0',
              padding: '5px 12px',
              borderRadius: '20px',
              fontSize: '14px',
              color: '#666'
            }}>
              {list.length} items
            </div>
          </div>

          {/* Existing Items */}
          <div style={{ marginBottom: '30px' }}>
            {list.map(item => (
              <div key={item.id} style={{
                background: '#f8f9fa',
                border: '1px solid #e9ecef',
                borderRadius: '8px',
                padding: '20px',
                marginBottom: '15px'
              }}>
                {editingItem?.id === item.id ? (
                  <div>
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                      gap: '15px',
                      marginBottom: '20px'
                    }}>
                      {fields.map(field => (
                        <div key={field}>
                          <label style={{
                            display: 'block',
                            marginBottom: '5px',
                            fontSize: '14px',
                            fontWeight: '500',
                            color: '#333',
                            textTransform: 'capitalize'
                          }}>
                            {field.replace('_', ' ')}
                          </label>
                          {renderField(field, editingItem[field], (e) => {
                            const updatedItem = { ...editingItem, [field]: e.target.value };
                            
                            // Auto-calculate price per watt for solar panels
                            if (table === 'solar_panels' && (field === 'price' || field === 'wattage')) {
                              if (updatedItem.price && updatedItem.wattage) {
                                updatedItem.price_per_watt = (parseFloat(updatedItem.price) / parseFloat(updatedItem.wattage)).toFixed(2);
                              }
                            }
                            
                            setEditingItem(updatedItem);
                          }, table)}
                        </div>
                      ))}
                    </div>
                    
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                      <button
                        onClick={() => updateItem(table, item.id, editingItem)}
                        style={{
                          background: '#28a745',
                          color: 'white',
                          border: 'none',
                          padding: '8px 16px',
                          borderRadius: '6px',
                          fontSize: '14px',
                          cursor: 'pointer',
                          fontWeight: '500'
                        }}
                      >
                        💾 Save Changes
                      </button>
                      <button
                        onClick={() => setEditingItem(null)}
                        style={{
                          background: '#6c757d',
                          color: 'white',
                          border: 'none',
                          padding: '8px 16px',
                          borderRadius: '6px',
                          fontSize: '14px',
                          cursor: 'pointer',
                          fontWeight: '500'
                        }}
                      >
                        ❌ Cancel
                      </button>
                      <button
                        onClick={() => togglePreview(item.id, sectionKey)}
                        style={{
                          background: '#007bff',
                          color: 'white',
                          border: 'none',
                          padding: '8px 16px',
                          borderRadius: '6px',
                          fontSize: '14px',
                          cursor: 'pointer',
                          fontWeight: '500'
                        }}
                      >
                        {previewStates[`${sectionKey}_${item.id}`] ? "🙈 Hide Preview" : "👁️ Show Preview"}
                      </button>
                    </div>
                    
                    {previewStates[`${sectionKey}_${item.id}`] && renderItemPreview(editingItem, type, sectionKey)}
                  </div>
                ) : (
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                      <div style={{ flex: 1 }}>
                        <h3 style={{
                          margin: '0 0 8px 0',
                          color: '#333',
                          fontSize: '18px',
                          fontWeight: 'bold'
                        }}>
                          {item.title || item.name || item.label || item.section_name || item.brand || item.type || item.model}
                          {item.capacity && ` - ${item.capacity}`}
                          {item.wattage && ` - ${item.wattage}W`}
                        </h3>
                        
                        {/* Enhanced product info display */}
                        {table === 'solar_panels' && (
                          <div style={{ margin: '8px 0', fontSize: '14px', color: '#666' }}>
                            <div><b>Price:</b> Rs. {parseInt(item.price || 0).toLocaleString()}</div>
                            <div><b>Price per Watt:</b> Rs. {(parseFloat(item.price || 0) / parseFloat(item.wattage || 1)).toFixed(2)}</div>
                          </div>
                        )}
                        
                        {table === 'inverters' && (
                          <div style={{ margin: '8px 0', fontSize: '14px', color: '#666' }}>
                            <div><b>Type:</b> {item.type}</div>
                            <div><b>Brand:</b> {item.brand}</div>
                            <div><b>Price:</b> Rs. {parseInt(item.price || 0).toLocaleString()}</div>
                          </div>
                        )}
                        
                        {table === 'batteries' && (
                          <div style={{ margin: '8px 0', fontSize: '14px', color: '#666' }}>
                            <div><b>Type:</b> {item.type}</div>
                            <div><b>Voltage:</b> {item.voltage}</div>
                            <div><b>Capacity:</b> {item.capacity}</div>
                            <div><b>Price:</b> Rs. {parseInt(item.price || 0).toLocaleString()}</div>
                          </div>
                        )}
                        
                        {table === 'stands' && (
                          <div style={{ margin: '8px 0', fontSize: '14px', color: '#666' }}>
                            <div><b>Type:</b> {item.type}</div>
                            <div><b>Price:</b> Rs. {parseInt(item.price || 0).toLocaleString()}</div>
                          </div>
                        )}
                        
                        {table === 'charges' && (
                          <div style={{ margin: '8px 0', fontSize: '14px', color: '#666' }}>
                            <div><b>Name:</b> {item.name}</div>
                            <div><b>Amount:</b> Rs. {parseInt(item.amount || 0).toLocaleString()}</div>
                          </div>
                        )}

                        {/* Display for other tables */}
                        {(table === 'homepage_sections' || table === 'homepage_events' || 
                          table === 'homepage_partners' || table === 'homepage_customers' ||
                          table === 'homepage_features' || table === 'homepage_reviews' ||
                          table === 'homepage_counters') && (
                          <div style={{ margin: '8px 0', fontSize: '14px', color: '#666' }}>
                            {item.description && <div><b>Description:</b> {item.description.length > 100 ? item.description.substring(0, 100) + '...' : item.description}</div>}
                            {item.review && <div><b>Review:</b> "{item.review.length > 100 ? item.review.substring(0, 100) + '...' : item.review}"</div>}
                            {item.testimonial && <div><b>Testimonial:</b> "{item.testimonial.length > 100 ? item.testimonial.substring(0, 100) + '...' : item.testimonial}"</div>}
                            {item.stars && (
                              <div style={{ margin: '8px 0', color: '#FFD700', fontSize: '16px' }}>
                                {"★".repeat(item.stars)}{"☆".repeat(5 - item.stars)}
                              </div>
                            )}
                            {(item.value || item.price || item.amount) && (
                              <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#FF6600' }}>
                                Rs. {(item.value || item.price || item.amount).toLocaleString()}
                              </div>
                            )}
                            {item.date && <div><b>Date:</b> {item.date}</div>}
                          </div>
                        )}
                      </div>
                      
                      <div style={{ display: 'flex', gap: '8px', marginLeft: '15px' }}>
                        <button
                          onClick={() => setEditingItem(item)}
                          style={{
                            background: '#007bff',
                            color: 'white',
                            border: 'none',
                            padding: '6px 12px',
                            borderRadius: '4px',
                            fontSize: '12px',
                            cursor: 'pointer',
                            fontWeight: '500'
                          }}
                        >
                          ✏️ Edit
                        </button>
                        <button
                          onClick={() => deleteItem(table, item.id)}
                          style={{
                            background: '#dc3545',
                            color: 'white',
                            border: 'none',
                            padding: '6px 12px',
                            borderRadius: '4px',
                            fontSize: '12px',
                            cursor: 'pointer',
                            fontWeight: '500'
                          }}
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    </div>

                    {/* Display images */}
                    {(item.image_url || item.logo_url || item.avatar_url || item.icon_url) && (
                      <div style={{ marginTop: '15px' }}>
                        <img 
                          src={item.image_url || item.logo_url || item.avatar_url || item.icon_url} 
                          alt={item.title || item.name} 
                          style={{
                            height: '60px',
                            width: 'auto',
                            objectFit: 'contain',
                            borderRadius: '6px',
                            border: '1px solid #e0e0e0'
                          }}
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Add New Item */}
          <div style={{
            background: 'linear-gradient(145deg, #f0f8ff, #ffffff)',
            border: '2px dashed #007bff',
            borderRadius: '12px',
            padding: '25px'
          }}>
            <h3 style={{
              margin: '0 0 20px 0',
              color: '#007bff',
              fontSize: '18px',
              fontWeight: 'bold'
            }}>
              ➕ Add New {title.replace(/s$/, "")}
            </h3>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '15px',
              marginBottom: '20px'
            }}>
              {fields.map(field => (
                <div key={field}>
                  <label style={{
                    display: 'block',
                    marginBottom: '5px',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#333',
                    textTransform: 'capitalize'
                  }}>
                    {field.replace('_', ' ')}
                  </label>
                  {renderField(field, newItem[field], (e) => {
                    const updatedItem = { ...newItem, [field]: e.target.value };
                    
                    // Auto-calculate price per watt for solar panels
                    if (table === 'solar_panels' && (field === 'price' || field === 'wattage')) {
                      if (updatedItem.price && updatedItem.wattage) {
                        updatedItem.price_per_watt = (parseFloat(updatedItem.price) / parseFloat(updatedItem.wattage)).toFixed(2);
                      }
                    }
                    
                    setNewItem(updatedItem);
                  }, table)}
                </div>
              ))}
            </div>
            
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <button
                onClick={() => addItem(table, newItem)}
                style={{
                  background: '#28a745',
                  color: 'white',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '6px',
                  fontSize: '14px',
                  cursor: 'pointer',
                  fontWeight: '500'
                }}
              >
                ✅ Add {title.replace(/s$/, "")}
              </button>
              <button
                onClick={() => toggleAddPreview(sectionKey)}
                style={{
                  background: '#007bff',
                  color: 'white',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '6px',
                  fontSize: '14px',
                  cursor: 'pointer',
                  fontWeight: '500'
                }}
              >
                {addPreviewStates[sectionKey] ? "🙈 Hide Preview" : "👁️ Show Preview"}
              </button>
            </div>
            
            {addPreviewStates[sectionKey] && renderItemPreview(newItem, type, sectionKey)}
          </div>
        </div>
      </div>
    );
  };

  // Login Screen
  if (!loggedIn) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}>
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '40px',
          boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
          width: '100%',
          maxWidth: '400px'
        }}>
          <div style={{ textAlign: 'center', marginBottom: '30px' }}>
            <div style={{
              width: '60px',
              height: '60px',
              background: 'linear-gradient(45deg, #FF6600, #FF9800)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px',
              fontSize: '24px'
            }}>
              🔐
            </div>
            <h2 style={{
              margin: 0,
              color: '#333',
              fontSize: '24px',
              fontWeight: 'bold'
            }}>
              Admin Panel
            </h2>
            <p style={{ margin: '10px 0 0 0', color: '#666', fontSize: '14px' }}>
              Please login to continue
            </p>
          </div>
          
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              marginBottom: '5px',
              fontSize: '14px',
              fontWeight: '500',
              color: '#333'
            }}>
              Username
            </label>
            <input
              type="text"
              placeholder="Enter username"
              value={username}
              onChange={e => setUsername(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #ddd',
                borderRadius: '8px',
                fontSize: '14px',
                boxSizing: 'border-box'
              }}
            />
          </div>
          
          <div style={{ marginBottom: '25px' }}>
            <label style={{
              display: 'block',
              marginBottom: '5px',
              fontSize: '14px',
              fontWeight: '500',
              color: '#333'
            }}>
              Password
            </label>
            <input
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #ddd',
                borderRadius: '8px',
                fontSize: '14px',
                boxSizing: 'border-box'
              }}
            />
          </div>
          
          <button
            onClick={login}
            style={{
              width: '100%',
              background: 'linear-gradient(45deg, #FF6600, #FF9800)',
              color: 'white',
              border: 'none',
              padding: '12px',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'transform 0.2s ease'
            }}
            onMouseEnter={e => e.target.style.transform = 'translateY(-2px)'}
            onMouseLeave={e => e.target.style.transform = 'translateY(0)'}
          >
            🚀 Login to Dashboard
          </button>
          
          <div style={{
            marginTop: '20px',
            textAlign: 'center',
            fontSize: '12px',
            color: '#999'
          }}>
            Demo credentials: admin / admin123
          </div>
        </div>
      </div>
    );
  }

  // Main Admin Dashboard
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)'
    }}>
      {/* Admin Dashboard Header */}
      <div style={{
        background: 'white',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        borderBottom: '1px solid #e0e0e0',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 20px'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            height: '70px'
          }}>
            <div style={{
              fontSize: '24px',
              fontWeight: 'bold',
              background: 'linear-gradient(45deg, #FF6600, #FF9800)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
              Solar Admin Dashboard
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <span style={{ color: '#666', fontSize: '14px' }}>
                Welcome, Admin
              </span>
              <button
                onClick={() => setLoggedIn(false)}
                style={{
                  background: '#f8f9fa',
                  border: '1px solid #ddd',
                  color: '#666',
                  padding: '8px 16px',
                  borderRadius: '6px',
                  fontSize: '14px',
                  cursor: 'pointer',
                  fontWeight: '500'
                }}
              >
                🚪 Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '30px 20px' }}>
        {/* Hero Banner */}
        <div style={{
          background: 'linear-gradient(135deg, #FFD54F 0%, #FF9800 50%, #FF3C00 100%)',
          color: 'white',
          padding: '40px',
          borderRadius: '16px',
          textAlign: 'center',
          marginBottom: '30px',
          boxShadow: '0 10px 30px rgba(255, 102, 0, 0.3)'
        }}>
          <h1 style={{ margin: '0 0 10px 0', fontSize: '28px', fontWeight: 'bold' }}>
            🌟 Solar Products Management System
          </h1>
          <p style={{ margin: 0, fontSize: '16px', opacity: 0.9 }}>
            Manage your solar products, pricing, and website content with real-time updates
          </p>
        </div>

        {/* Display Settings */}
        <div style={{ marginBottom: '40px' }}>
          <h2 style={{
            margin: '0 0 20px 0',
            color: '#333',
            fontSize: '22px',
            fontWeight: 'bold'
          }}>
            ⚙️ Display Settings
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '20px'
          }}>
            {renderDisplayToggle("homepage_events", "Events")}
            {renderDisplayToggle("homepage_partners", "Partners")}
            {renderDisplayToggle("homepage_customers", "Customers")}
          </div>
        </div>

        {/* Content Sections */}
        {renderEditableList(
          "Homepage Sections", 
          sections, 
          ["section_name", "title", "subtitle", "content_text", "background_color", "text_color", "button_text", "button_link"], 
          "homepage_sections", 
          newSection, 
          setNewSection, 
          "section",
          "sections"
        )}

        {renderEditableList(
          "Events", 
          events, 
          ["title", "description", "date", "image_url", "link"], 
          "homepage_events", 
          newEvent, 
          setNewEvent, 
          "event",
          "events"
        )}

        {renderEditableList(
          "Partners", 
          partners, 
          ["name", "logo_url", "website_link", "description"], 
          "homepage_partners", 
          newPartner, 
          setNewPartner, 
          "partner",
          "partners"
        )}

        {renderEditableList(
          "Customers", 
          customers, 
          ["name", "logo_url", "testimonial", "website_link"], 
          "homepage_customers", 
          newCustomer, 
          setNewCustomer, 
          "customer",
          "customers"
        )}

        {renderEditableList(
          "Features", 
          features, 
          ["title", "description", "icon_url"], 
          "homepage_features", 
          newFeature, 
          setNewFeature, 
          "feature",
          "features"
        )}

        {renderEditableList(
          "Customer Reviews", 
          reviews, 
          ["name", "review", "stars", "avatar_url", "designation"], 
          "homepage_reviews", 
          newReview, 
          setNewReview, 
          "review",
          "reviews"
        )}

        {renderEditableList(
          "Counters", 
          counters, 
          ["label", "value", "color"], 
          "homepage_counters", 
          newCounter, 
          setNewCounter, 
          "counter",
          "counters"
        )}

        {/* Enhanced Solar Products Management */}
        <div style={{ marginBottom: '40px' }}>
          <h2 style={{ 
            color: '#FF6600', 
            fontSize: '28px', 
            fontWeight: 'bold', 
            marginBottom: '20px',
            textAlign: 'center',
            textShadow: '2px 2px 4px rgba(0,0,0,0.1)'
          }}>
            ⚡ Solar Products Management
          </h2>

          {renderEditableList(
            "Solar Panels",
            solarPanels,
            ["brand", "wattage", "price", "price_per_watt"],
            "solar_panels",
            newSolarPanel,
            setNewSolarPanel,
            "solar_panel",
            "solar_panels"
          )}

          {renderEditableList(
            "Inverters",
            inverters,
            ["type", "brand", "model", "capacity", "price"],
            "inverters",
            newInverter,
            setNewInverter,
            "inverter",
            "inverters"
          )}

          {renderEditableList(
            "Batteries",
            batteries,
            ["type", "voltage", "capacity", "model", "price"],
            "batteries",
            newBattery,
            setNewBattery,
            "battery",
            "batteries"
          )}

          {renderEditableList(
            "Stands",
            stands,
            ["type", "price"],
            "stands",
            newStand,
            setNewStand,
            "stand",
            "stands"
          )}

          {renderEditableList(
            "Service Charges",
            charges,
            ["name", "amount"],
            "charges",
            newCharge,
            setNewCharge,
            "charge",
            "charges"
          )}
        </div>

        {/* Database Schema Info */}
        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '25px',
          marginTop: '40px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ color: '#FF6600', marginBottom: '15px' }}>📋 Required Database Schema</h3>
          <div style={{ fontSize: '14px', color: '#666', lineHeight: '1.6' }}>
            <p><strong>Ensure your database tables have these columns:</strong></p>
            <ul style={{ marginLeft: '20px' }}>
              <li><strong>solar_panels:</strong> id, brand, wattage, price, price_per_watt, created_at</li>
              <li><strong>inverters:</strong> id, type, brand, model, capacity, price, created_at</li>
              <li><strong>batteries:</strong> id, type, voltage, capacity, model, price, created_at</li>
              <li><strong>stands:</strong> id, type, price, created_at</li>
              <li><strong>charges:</strong> id, name, amount, created_at</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}