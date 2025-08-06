// src/components/QuotationForm.js
import React, { useState, useCallback } from 'react';
import { supabase } from '../supabaseClient';
import { v4 as uuidv4 } from 'uuid';

// Helper function to safely escape HTML
const escapeHtml = (str) => {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};

const initialCustomer = { name: '', contact: '', email: '', address: '' };
const initialEquipment = {
  inverter: { company: '', kw: '', quantity: 1, pricePerUnit: 0 },
  battery: { type: '', model: '', quantity: 1, price: 0 },
  solarPanel: { company: '', watts: '', quantity: 1, pricePerWatt: 0 },
  stand: { type: '', price: 0 },
  safety: 0,
  transport: 0,
  labour: 0,
  engineer: 0,
  greenMeter: 0,
};

export default function QuotationForm() {
  // Form state
  const [customer, setCustomer] = useState(initialCustomer);
  const [staff, setStaff] = useState('');
  const [systemType, setSystemType] = useState('');
  const [location, setLocation] = useState('peshawar');
  const [equipment, setEquipment] = useState(initialEquipment);
  const [includeEngineer, setIncludeEngineer] = useState(false);
  const [includeGreenMeter, setIncludeGreenMeter] = useState(false);

  // Control state
  const [currentQuotation, setCurrentQuotation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [printing, setPrinting] = useState(false);
  const [error, setError] = useState('');

  // Generate a new quotation object from form
  const buildQuotation = useCallback(() => {
    const id = uuidv4();
    const date = new Date();
    const quotationDate = date.toLocaleDateString('en-PK', {
      year: 'numeric', month: 'long', day: 'numeric'
    });
    
    const {
      inverter, battery, solarPanel, stand,
      safety, transport, labour, engineer, greenMeter
    } = equipment;

    const panelUnitPrice = parseFloat(solarPanel.pricePerWatt) * parseInt(solarPanel.watts, 10);
    const standQty = stand.type === 'L2 (2 panels)'
      ? Math.ceil(solarPanel.quantity / 2)
      : solarPanel.quantity;

    const total = 
      inverter.quantity * inverter.pricePerUnit +
      battery.quantity * battery.price +
      panelUnitPrice * solarPanel.quantity +
      standQty * stand.price +
      safety + transport + labour +
      (includeEngineer ? engineer : 0) +
      (includeGreenMeter ? greenMeter : 0);

    return {
      id, date: date.toISOString(), quotationDate,
      customer, staff, systemType, location,
      inverter, battery, solarPanel, stand,
      includeEngineer, includeGreenMeter,
      safety, transport, labour, engineer, greenMeter,
      panelUnitPrice, standQty, total, followUpStatus: 'Pending'
    };
  }, [customer, staff, systemType, location, equipment, includeEngineer, includeGreenMeter]);

  // Form validation
  const isValid = () => {
    if (!customer.name.trim()) {
      setError('Customer name is required');
      return false;
    }
    if (!customer.contact.trim()) {
      setError('Customer contact is required');
      return false;
    }
    if (!staff.trim()) {
      setError('Staff name is required');
      return false;
    }
    if (!systemType.trim()) {
      setError('System type is required');
      return false;
    }
    setError('');
    return true;
  };

  // Save to Supabase
  const saveToSupabase = async (q) => {
    setSaving(true);
    const {
      id, date, customer, staff, systemType, location,
      inverter, battery, solarPanel, stand,
      includeEngineer, includeGreenMeter,
      safety, transport, labour, engineer, greenMeter,
      panelUnitPrice, standQty, total
    } = q;

    const payload = {
      quotation_id: id,
      created_at: date,
      customer_name: customer.name,
      customer_contact: customer.contact,
      customer_email: customer.email || null,
      customer_address: customer.address,
      staff_name: staff,
      system_type: systemType,
      location,
      inverter_type: inverter.company,
      inverter_size: `${inverter.kw}kW`,
      inverter_qty: inverter.quantity,
      inverter_total: inverter.quantity * inverter.pricePerUnit,
      battery_type: battery.type || null,
      battery_model: battery.model || null,
      battery_qty: battery.quantity,
      battery_total: battery.quantity * battery.price,
      panel_brand: solarPanel.company,
      panel_watt: solarPanel.watts,
      panel_qty: solarPanel.quantity,
      panel_unit_price: solarPanel.pricePerWatt,
      panel_total: solarPanel.quantity * panelUnitPrice,
      stand_type: stand.type,
      stand_qty: standQty,
      stand_total: standQty * stand.price,
      safety_charges: safety,
      transport_charges: transport,
      labour_charges: labour,
      engineer_charges: includeEngineer ? engineer : 0,
      greenmeter_charges: includeGreenMeter ? greenMeter : 0,
      total_amount: total,
      follow_up_status: 'Pending'
    };

    const { error } = await supabase
      .from('quotations')
      .insert([payload]);

    setSaving(false);
    if (error) throw error;
  };

  // Generate + preview
  const handleGenerate = async () => {
    if (!isValid()) return;
    
    setLoading(true);
    const q = buildQuotation();
    try {
      await saveToSupabase(q);
      setCurrentQuotation(q);
    } catch (err) {
      console.error(err);
      setError('Failed to save to database. Previewing locally.');
      setCurrentQuotation(q);
    } finally {
      setLoading(false);
    }
  };

  // Print logic
  const handlePrint = () => {
    if (!currentQuotation) return;
    
    setPrinting(true);
    const win = window.open('', '_blank');
    if (!win) {
      setError('Please enable pop-ups to print');
      setPrinting(false);
      return;
    }

    const q = currentQuotation;
    const esc = escapeHtml;
    const includeGM = q.includeGreenMeter;
    const includeEng = q.includeEngineer;

    win.document.write(`
      <html>
        <head>
          <meta charset="utf-8" />
          <title>Quotation ${esc(q.id)}</title>
          <style>
            body { 
              font-family: sans-serif; 
              padding: 20px; 
              background-color: #f0f0f0;
              position: relative;
            }
            .watermark {
              position: absolute;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%) rotate(-45deg);
              font-size: 80px;
              font-weight: bold;
              color: rgba(255, 107, 53, 0.2);
              z-index: -1;
              pointer-events: none;
              white-space: nowrap;
            }
            h1, h2, h3 { color: #FF6B35; }
            table { width: 100%; border-collapse: collapse; margin: 15px 0; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background: #FF6B35; color: white; }
            .total-row { font-weight: bold; }
            .header { 
              display: flex; 
              justify-content: space-between; 
              align-items: center;
              margin-bottom: 20px;
            }
            .company-info { text-align: right; }
          </style>
        </head>
        <body>
          <div class="watermark">SAMPLE QUOTATION</div>
          
          <div class="header">
            <div>
              <h1>Quotation: ${esc(q.id)}</h1>
              <p><strong>Date:</strong> ${esc(q.quotationDate)}</p>
            </div>
            <div class="company-info">
              <h2>Solar Solutions Ltd</h2>
              <p>123 Green Energy Road, Peshawar</p>
              <p>Phone: (091) 123-4567</p>
            </div>
          </div>
          
          <div style="display: flex; justify-content: space-between;">
            <div>
              <h2>Customer Info</h2>
              <p>
                <strong>${esc(q.customer.name)}</strong><br/>
                ${esc(q.customer.contact)}<br/>
                ${esc(q.customer.email || '')}<br/>
                ${esc(q.customer.address)}
              </p>
            </div>
            <div>
              <h2>Project Details</h2>
              <p>
                <strong>System Type:</strong> ${esc(q.systemType)}<br/>
                <strong>Location:</strong> ${esc(q.location)}<br/>
                <strong>Prepared By:</strong> ${esc(q.staff)}
              </p>
            </div>
          </div>
          
          <h2>Equipment Breakdown</h2>
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Description</th>
                <th>Qty</th>
                <th>Unit Price (Rs)</th>
                <th>Total (Rs)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>1</td>
                <td>Inverter (${esc(q.inverter.company)} ${esc(q.inverter.kw)}kW)</td>
                <td>${esc(q.inverter.quantity)}</td>
                <td>${q.inverter.pricePerUnit.toLocaleString()}</td>
                <td>${(q.inverter.quantity * q.inverter.pricePerUnit).toLocaleString()}</td>
              </tr>
              <tr>
                <td>2</td>
                <td>Battery (${esc(q.battery.model)})</td>
                <td>${esc(q.battery.quantity)}</td>
                <td>${q.battery.price.toLocaleString()}</td>
                <td>${(q.battery.quantity * q.battery.price).toLocaleString()}</td>
              </tr>
              <tr>
                <td>3</td>
                <td>Solar Panels (${esc(q.solarPanel.company)} ${esc(q.solarPanel.watts)}W)</td>
                <td>${esc(q.solarPanel.quantity)}</td>
                <td>${q.solarPanel.pricePerWatt.toLocaleString()}/W</td>
                <td>${(q.solarPanel.quantity * q.panelUnitPrice).toLocaleString()}</td>
              </tr>
              <tr>
                <td>4</td>
                <td>Stand (${esc(q.stand.type)})</td>
                <td>${q.standQty}</td>
                <td>${q.stand.price.toLocaleString()}</td>
                <td>${(q.standQty * q.stand.price).toLocaleString()}</td>
              </tr>
              ${includeGM ? `
              <tr>
                <td>5</td>
                <td>Green Meter</td>
                <td>1</td>
                <td>${q.greenMeter.toLocaleString()}</td>
                <td>${q.greenMeter.toLocaleString()}</td>
              </tr>` : ''}
              <tr>
                <td>${includeGM ? '6' : '5'}</td>
                <td>Safety Equipment</td>
                <td>1</td>
                <td>${q.safety.toLocaleString()}</td>
                <td>${q.safety.toLocaleString()}</td>
              </tr>
              <tr>
                <td>${includeGM ? '7' : '6'}</td>
                <td>Transport (${esc(q.location)})</td>
                <td>1</td>
                <td>${q.transport.toLocaleString()}</td>
                <td>${q.transport.toLocaleString()}</td>
              </tr>
              <tr>
                <td>${includeGM ? '8' : '7'}</td>
                <td>Labour</td>
                <td>1</td>
                <td>${q.labour.toLocaleString()}</td>
                <td>${q.labour.toLocaleString()}</td>
              </tr>
              ${includeEng ? `
              <tr>
                <td>${includeGM ? '9' : '8'}</td>
                <td>Engineering Supervision</td>
                <td>1</td>
                <td>${q.engineer.toLocaleString()}</td>
                <td>${q.engineer.toLocaleString()}</td>
              </tr>` : ''}
              <tr class="total-row">
                <td colspan="4" style="text-align: right;">TOTAL:</td>
                <td>Rs. ${q.total.toLocaleString()}</td>
              </tr>
            </tbody>
          </table>
          
          <div style="margin-top: 30px;">
            <p><strong>Terms & Conditions:</strong></p>
            <ul>
              <li>Prices valid for 7 days from quotation date</li>
              <li>Installation timeline: 2-3 weeks after confirmation</li>
              <li>Payment: 50% advance, 50% on completion</li>
              <li>Warranty: 5 years on equipment, 2 years on installation</li>
            </ul>
            <p style="margin-top: 20px; text-align: center;">
              <em>This is a sample quotation for demonstration purposes only</em>
            </p>
          </div>
        </body>
      </html>
    `);

    win.document.close();
    win.focus();
    win.print();
    win.close();
    setPrinting(false);
  };

  // Reset form
  const resetForm = () => {
    setCustomer(initialCustomer);
    setStaff('');
    setSystemType('');
    setEquipment(initialEquipment);
    setIncludeEngineer(false);
    setIncludeGreenMeter(false);
    setCurrentQuotation(null);
    setError('');
  };

  // Form input component
  const FormInput = ({ label, value, onChange, type = 'text', required = false, ...props }) => (
    <div style={styles.inputGroup}>
      {label && <label style={styles.label}>{label}{required && ' *'}</label>}
      <input
        type={type}
        value={value}
        onChange={onChange}
        style={styles.input}
        required={required}
        {...props}
      />
    </div>
  );

  // Equipment section component
  const EquipmentSection = ({ title, fields }) => (
    <div style={styles.equipmentSection}>
      <h3>{title}</h3>
      <div style={styles.equipmentGrid}>
        {fields.map((field, index) => (
          <FormInput
            key={index}
            label={field.label}
            value={field.value}
            onChange={field.onChange}
            type={field.type}
            placeholder={field.placeholder}
          />
        ))}
      </div>
    </div>
  );

  return (
    <div style={styles.container}>
      {!currentQuotation ? (
        <>
          <h1 style={styles.title}>📋 Quotation Generator</h1>
          
          {error && <div style={styles.error}>{error}</div>}
          
          {/* Customer Section */}
          <section style={styles.section}>
            <h2 style={styles.sectionTitle}>👤 Customer Info</h2>
            <div style={styles.formGrid}>
              <FormInput
                label="Name"
                value={customer.name}
                onChange={e => setCustomer(c => ({ ...c, name: e.target.value }))}
                required
              />
              <FormInput
                label="Contact"
                value={customer.contact}
                onChange={e => setCustomer(c => ({ ...c, contact: e.target.value }))}
                required
              />
              <FormInput
                label="Email"
                value={customer.email}
                onChange={e => setCustomer(c => ({ ...c, email: e.target.value }))}
                type="email"
              />
              <FormInput
                label="Address"
                value={customer.address}
                onChange={e => setCustomer(c => ({ ...c, address: e.target.value }))}
              />
            </div>
          </section>

          {/* Project Section */}
          <section style={styles.section}>
            <h2 style={styles.sectionTitle}>⚙️ Project Details</h2>
            <div style={styles.formGrid}>
              <FormInput
                label="Prepared By"
                value={staff}
                onChange={e => setStaff(e.target.value)}
                required
              />
              <FormInput
                label="System Type"
                value={systemType}
                onChange={e => setSystemType(e.target.value)}
                required
              />
              <div style={styles.inputGroup}>
                <label style={styles.label}>Location *</label>
                <select
                  value={location}
                  onChange={e => setLocation(e.target.value)}
                  style={styles.input}
                >
                  <option value="peshawar">Peshawar</option>
                  <option value="islamabad">Islamabad</option>
                  <option value="lahore">Lahore</option>
                  <option value="karachi">Karachi</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
          </section>

          {/* Equipment Section */}
          <section style={styles.section}>
            <h2 style={styles.sectionTitle}>🔌 Equipment Details</h2>
            
            <EquipmentSection
              title="Inverter"
              fields={[
                {
                  label: "Company",
                  value: equipment.inverter.company,
                  onChange: e => setEquipment(eq => ({
                    ...eq, inverter: { ...eq.inverter, company: e.target.value }
                  })),
                  placeholder: "e.g., Huawei, Growatt"
                },
                {
                  label: "kW",
                  value: equipment.inverter.kw,
                  onChange: e => setEquipment(eq => ({
                    ...eq, inverter: { ...eq.inverter, kw: e.target.value }
                  })),
                  type: "number",
                  placeholder: "e.g., 5, 10"
                },
                {
                  label: "Quantity",
                  value: equipment.inverter.quantity,
                  onChange: e => setEquipment(eq => ({
                    ...eq, inverter: { 
                      ...eq.inverter, 
                      quantity: parseInt(e.target.value, 10) || 1 
                    }
                  })),
                  type: "number"
                },
                {
                  label: "Price/Unit (Rs)",
                  value: equipment.inverter.pricePerUnit,
                  onChange: e => setEquipment(eq => ({
                    ...eq, inverter: { 
                      ...eq.inverter, 
                      pricePerUnit: parseInt(e.target.value, 10) || 0 
                    }
                  })),
                  type: "number"
                }
              ]}
            />
            
            <EquipmentSection
              title="Battery"
              fields={[
                {
                  label: "Type",
                  value: equipment.battery.type,
                  onChange: e => setEquipment(eq => ({
                    ...eq, battery: { ...eq.battery, type: e.target.value }
                  })),
                  placeholder: "e.g., Lithium, Lead Acid"
                },
                {
                  label: "Model",
                  value: equipment.battery.model,
                  onChange: e => setEquipment(eq => ({
                    ...eq, battery: { ...eq.battery, model: e.target.value }
                  })),
                  placeholder: "e.g., LFP 5kWh"
                },
                {
                  label: "Quantity",
                  value: equipment.battery.quantity,
                  onChange: e => setEquipment(eq => ({
                    ...eq, battery: { 
                      ...eq.battery, 
                      quantity: parseInt(e.target.value, 10) || 1 
                    }
                  })),
                  type: "number"
                },
                {
                  label: "Price (Rs)",
                  value: equipment.battery.price,
                  onChange: e => setEquipment(eq => ({
                    ...eq, battery: { 
                      ...eq.battery, 
                      price: parseInt(e.target.value, 10) || 0 
                    }
                  })),
                  type: "number"
                }
              ]}
            />
            
            <EquipmentSection
              title="Solar Panel"
              fields={[
                {
                  label: "Company",
                  value: equipment.solarPanel.company,
                  onChange: e => setEquipment(eq => ({
                    ...eq, solarPanel: { ...eq.solarPanel, company: e.target.value }
                  })),
                  placeholder: "e.g., Jinko, Longi"
                },
                {
                  label: "Watts",
                  value: equipment.solarPanel.watts,
                  onChange: e => setEquipment(eq => ({
                    ...eq, solarPanel: { ...eq.solarPanel, watts: e.target.value }
                  })),
                  type: "number",
                  placeholder: "e.g., 550, 600"
                },
                {
                  label: "Quantity",
                  value: equipment.solarPanel.quantity,
                  onChange: e => setEquipment(eq => ({
                    ...eq, solarPanel: { 
                      ...eq.solarPanel, 
                      quantity: parseInt(e.target.value, 10) || 1 
                    }
                  })),
                  type: "number"
                },
                {
                  label: "Price/Watt (Rs)",
                  value: equipment.solarPanel.pricePerWatt,
                  onChange: e => setEquipment(eq => ({
                    ...eq, solarPanel: { 
                      ...eq.solarPanel, 
                      pricePerWatt: parseFloat(e.target.value) || 0 
                    }
                  })),
                  type: "number",
                  step: "0.01"
                }
              ]}
            />
            
            <EquipmentSection
              title="Stand"
              fields={[
                {
                  label: "Type",
                  value: equipment.stand.type,
                  onChange: e => setEquipment(eq => ({
                    ...eq, stand: { ...eq.stand, type: e.target.value }
                  })),
                  placeholder: "e.g., L1, L2"
                },
                {
                  label: "Price (Rs)",
                  value: equipment.stand.price,
                  onChange: e => setEquipment(eq => ({
                    ...eq, stand: { 
                      ...eq.stand, 
                      price: parseInt(e.target.value, 10) || 0 
                    }
                  })),
                  type: "number"
                }
              ]}
            />
            
            <div style={styles.costSection}>
              <h3 style={styles.sectionTitle}>Additional Costs</h3>
              <div style={styles.costGrid}>
                <FormInput
                  label="Safety Equipment (Rs)"
                  value={equipment.safety}
                  onChange={e => setEquipment(eq => ({ 
                    ...eq, safety: parseInt(e.target.value, 10) || 0 
                  }))}
                  type="number"
                />
                <FormInput
                  label="Transport (Rs)"
                  value={equipment.transport}
                  onChange={e => setEquipment(eq => ({ 
                    ...eq, transport: parseInt(e.target.value, 10) || 0 
                  }))}
                  type="number"
                />
                <FormInput
                  label="Labour (Rs)"
                  value={equipment.labour}
                  onChange={e => setEquipment(eq => ({ 
                    ...eq, labour: parseInt(e.target.value, 10) || 0 
                  }))}
                  type="number"
                />
              </div>
            </div>
            
            <div style={styles.checkboxGroup}>
              <label style={styles.checkbox}>
                <input
                  type="checkbox"
                  checked={includeEngineer}
                  onChange={e => setIncludeEngineer(e.target.checked)}
                />
                Include Engineering Supervision (Rs {equipment.engineer})
              </label>
              <label style={styles.checkbox}>
                <input
                  type="checkbox"
                  checked={includeGreenMeter}
                  onChange={e => setIncludeGreenMeter(e.target.checked)}
                />
                Include Green Meter (Rs {equipment.greenMeter})
              </label>
            </div>
          </section>

          <div style={styles.buttonGroup}>
            <button
              onClick={handleGenerate}
              disabled={loading || saving}
              style={{
                ...styles.primaryButton,
                opacity: (loading || saving) ? 0.7 : 1
              }}
            >
              {loading ? '⏳ Generating…' : 
               saving ? '💾 Saving…' : '📋 Generate Quotation'}
            </button>
            <button
              onClick={resetForm}
              style={styles.secondaryButton}
            >
              🗑️ Clear Form
            </button>
          </div>
        </>
      ) : (
        <>
          <h1 style={styles.title}>📑 Quotation Preview</h1>
          
          <div style={styles.previewContainer}>
            <div style={styles.previewHeader}>
              <h2>Quotation #{currentQuotation.id.slice(0, 8)}</h2>
              <p style={styles.previewMeta}>
                <strong>Date:</strong> {currentQuotation.quotationDate} | 
                <strong> Total:</strong> Rs. {currentQuotation.total.toLocaleString()}
              </p>
            </div>
            
            <div style={styles.previewContent}>
              <div>
                <h3>Customer</h3>
                <p>{currentQuotation.customer.name}</p>
                <p>{currentQuotation.customer.contact}</p>
              </div>
              
              <div>
                <h3>System Details</h3>
                <p>{currentQuotation.systemType}</p>
                <p>{currentQuotation.location}</p>
              </div>
            </div>
            
            <div style={styles.previewNote}>
              <p>This quotation has been saved and is ready for printing.</p>
            </div>
          </div>
          
          <div style={styles.buttonGroup}>
            <button 
              onClick={() => setCurrentQuotation(null)} 
              style={styles.secondaryButton}
            >
              ← Edit Quotation
            </button>
            <button 
              onClick={handlePrint} 
              disabled={printing}
              style={{
                ...styles.primaryButton,
                opacity: printing ? 0.7 : 1
              }}
            >
              {printing ? '🖨️ Printing...' : '🖨️ Print / Save PDF'}
            </button>
            <button 
              onClick={resetForm}
              style={styles.secondaryButton}
            >
              ➕ Create New
            </button>
          </div>
        </>
      )}
    </div>
  );
}

const styles = {
  container: { 
    padding: 20, 
    fontFamily: 'sans-serif',
    maxWidth: 1200,
    margin: '0 auto'
  },
  title: {
    color: '#FF6B35',
    borderBottom: '2px solid #FF6B35',
    paddingBottom: 10,
    marginBottom: 20
  },
  section: { 
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 20,
    margin: '20px 0',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  },
  sectionTitle: {
    color: '#FF6B35',
    marginTop: 0
  },
  error: {
    backgroundColor: '#ffebee',
    color: '#d32f2f',
    padding: '10px 15px',
    borderRadius: 4,
    marginBottom: 20
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
    gap: 15
  },
  inputGroup: {
    marginBottom: 15
  },
  label: {
    display: 'block',
    marginBottom: 5,
    fontWeight: 500,
    fontSize: 14
  },
  input: {
    width: '100%',
    padding: '10px 12px',
    fontSize: 14,
    borderRadius: 4,
    border: '1px solid #ddd',
    boxSizing: 'border-box',
    transition: 'border 0.3s',
  },
  equipmentSection: {
    backgroundColor: '#fff',
    borderRadius: 6,
    padding: 15,
    marginBottom: 20,
    border: '1px solid #eee'
  },
  equipmentGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
    gap: 15
  },
  costSection: {
    marginTop: 20
  },
  costGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
    gap: 15
  },
  checkboxGroup: {
    marginTop: 20,
    paddingTop: 15,
    borderTop: '1px solid #eee'
  },
  checkbox: {
    display: 'flex',
    alignItems: 'center',
    margin: '10px 0',
    fontSize: 14,
    cursor: 'pointer',
  },
  buttonGroup: {
    display: 'flex',
    gap: 10,
    marginTop: 20,
    flexWrap: 'wrap'
  },
  primaryButton: {
    padding: '12px 25px',
    background: '#FF6B35',
    color: 'white',
    border: 'none',
    borderRadius: 4,
    cursor: 'pointer',
    fontSize: 16,
    fontWeight: 600,
    display: 'flex',
    alignItems: 'center',
    gap: 8
  },
  secondaryButton: {
    padding: '12px 25px',
    background: '#f0f0f0',
    color: '#333',
    border: 'none',
    borderRadius: 4,
    cursor: 'pointer',
    fontSize: 16,
    display: 'flex',
    alignItems: 'center',
    gap: 8
  },
  previewContainer: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 20,
    margin: '20px 0',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  },
  previewHeader: {
    borderBottom: '1px solid #ddd',
    paddingBottom: 15,
    marginBottom: 20
  },
  previewMeta: {
    color: '#666',
    fontSize: 14
  },
  previewContent: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 30
  },
  previewNote: {
    marginTop: 20,
    paddingTop: 15,
    borderTop: '1px solid #eee',
    fontStyle: 'italic',
    color: '#666'
  }
};