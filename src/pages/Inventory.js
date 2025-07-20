// src/pages/Inventory.js
import React, { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import logo from "../assets/logo.png";

const initialForm = {
  id: null,
  name: "",
  category: "",
  brand: "",
  model: "",
  description: "",
  quantity: 0,
  min_quantity: 0,
  max_quantity: 999,
  reorder_point: 0,
  unit_price: 0,
  selling_price: 0,
  location: "",
  supplier: "",
  sku: "",
  barcode: "",
  specifications: "",
  voltage_rating: "",
  current_rating: "",
  storage_temp: "",
  lead_time: "",
  warranty: "",
  expiry_date: "",
  notes: "",
};

const categories = [
  "Transistors", "Capacitors", "Diodes", "Fuses", "Contactors", "Heat Sinks",
  "Connectors", "Wires", "Relays", "Batteries", "Breakers", "Controllers", "Others"
];

export default function Inventory() {
  const [inventory, setInventory] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [syncStatus, setSyncStatus] = useState("checking");
  const [filter, setFilter] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [suppliers, setSuppliers] = useState([]);

  useEffect(() => {
    loadInventory();
    // Real-time sync (optional, can remove if not needed)
    const invChannel = supabase
      .channel("inventory_changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "inventory" }, () => loadInventory())
      .subscribe();
    return () => { supabase.removeChannel(invChannel); };
    // eslint-disable-next-line
  }, []);

  async function loadInventory() {
    setLoading(true);
    setSyncStatus("checking");
    try {
      // Try online fetch
      let { data, error } = await supabase
        .from("inventory")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      setInventory(data);
      localStorage.setItem("inventory", JSON.stringify(data));
      setSyncStatus("synced");
    } catch (err) {
      // Fallback: LocalStorage
      const local = JSON.parse(localStorage.getItem("inventory") || "[]");
      setInventory(local);
      setSyncStatus("offline");
    }
    setLoading(false);
  }

  // Add or update item
  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.name || !form.category) {
      alert("Please fill all required fields (name, category)");
      return;
    }
    try {
      setSyncStatus("syncing");
      let res;
      if (!editing) {
        const insertData = { ...form, quantity: Number(form.quantity) };
delete insertData.id; // Remove id field if present

const { data, error } = await supabase
  .from("inventory")
  .insert([insertData])
  .select();

        if (error) throw error;
        res = data[0];
      } else {
        const { data, error } = await supabase
          .from("inventory")
          .update({ ...form, quantity: Number(form.quantity) })
          .eq("id", form.id)
          .select();
        if (error) throw error;
        res = data[0];
      }
      let updatedList;
      if (!editing) updatedList = [res, ...inventory];
      else updatedList = inventory.map(i => (i.id === res.id ? res : i));
      setInventory(updatedList);
      localStorage.setItem("inventory", JSON.stringify(updatedList));
      setForm(initialForm);
      setEditing(false);
      setShowForm(false);
      setSyncStatus("synced");
    } catch (error) {
      setSyncStatus("offline");
      alert("Error saving: " + error.message);
    }
  }

  // Delete item
  async function handleDelete(id) {
    if (!window.confirm("Delete this item?")) return;
    try {
      setSyncStatus("syncing");
      await supabase.from("inventory").delete().eq("id", id);
      const updated = inventory.filter(i => i.id !== id);
      setInventory(updated);
      localStorage.setItem("inventory", JSON.stringify(updated));
      setSyncStatus("synced");
    } catch (error) {
      setSyncStatus("offline");
      alert("Error deleting: " + error.message);
    }
  }

  // Edit item
  function handleEdit(item) {
    setForm({
      ...item,
      expiry_date: item.expiry_date ? item.expiry_date.split("T")[0] : "",
    });
    setEditing(true);
    setShowForm(true);
  }

  // Manual sync button
  async function manualSync() {
    await loadInventory();
  }

  // Add or subtract stock
  async function adjustStock(item, change) {
    let qty = Number(prompt(`Enter quantity to ${change > 0 ? "add" : "subtract"}:`, 1));
    if (!qty || qty <= 0) return;
    if (change < 0 && qty > item.quantity) {
      alert("Cannot subtract more than available stock.");
      return;
    }
    const updatedQty = item.quantity + change * qty;
    try {
      setSyncStatus("syncing");
      const { data, error } = await supabase
        .from("inventory")
        .update({ quantity: updatedQty })
        .eq("id", item.id)
        .select();
      if (error) throw error;
      loadInventory();
      setSyncStatus("synced");
    } catch (error) {
      alert("Error updating quantity: " + error.message);
      setSyncStatus("offline");
    }
  }

  // Styling
  const lowStock = i => i.quantity <= (i.reorder_point || i.min_quantity);

  // Render
  return (
    <div style={{ background: "#fff6ec", minHeight: "100vh", padding: 24 }}>
      {/* Sync status bar */}
      <div style={{ marginBottom: 14 }}>
        <span style={{
          background: syncStatus === "synced" ? "#c8e6c9"
            : syncStatus === "syncing" ? "#fff3e0"
              : syncStatus === "offline" ? "#ffcdd2"
                : "#e3f2fd",
          color: syncStatus === "synced" ? "#2e7d32"
            : syncStatus === "syncing" ? "#f57c00"
              : syncStatus === "offline" ? "#c62828"
                : "#1976d2",
          padding: "8px 14px",
          borderRadius: 7,
          fontWeight: 700,
          marginRight: 15,
        }}>
          {syncStatus === "synced" ? "✅ Synced"
            : syncStatus === "syncing" ? "🔄 Syncing..."
              : syncStatus === "offline" ? "❌ Offline (Local Data)"
                : "Checking..."}
        </span>
        <button onClick={manualSync} style={{
          padding: "8px 16px", border: "none", borderRadius: 6,
          background: "linear-gradient(90deg,#ff9800,#ffab00)", color: "#fff",
          fontWeight: 700, cursor: "pointer"
        }}>Refresh</button>
      </div>

      <h1 style={{
        color: "#ff9800",
        fontWeight: 900,
        textShadow: "0 1px 6px #fff3e0",
        marginBottom: 8
      }}>
        <img src={logo} alt="logo" style={{ height: 48, marginRight: 8, verticalAlign: "middle" }} />
        Inventory Management
      </h1>

      <button onClick={() => { setForm(initialForm); setShowForm(true); setEditing(false); }} style={{
        background: "linear-gradient(90deg,#ff9800,#ffab00)",
        color: "#fff",
        padding: "10px 26px",
        borderRadius: 8,
        border: "none",
        fontWeight: 800,
        fontSize: "1.08rem",
        marginBottom: 18,
        boxShadow: "0 2px 11px #ffab0022",
        cursor: "pointer",
      }}>+ Add New Item</button>

      <input
        type="text"
        placeholder="Search inventory by name, model, brand, category..."
        value={filter}
        onChange={e => setFilter(e.target.value)}
        style={{
          width: 350, maxWidth: "100%", margin: "0 0 16px 12px",
          borderRadius: 7, padding: 8, border: "2px solid #ffecb3"
        }}
      />

      {/* Add/Edit Form */}
      {showForm && (
        <form onSubmit={handleSubmit} style={{
          background: "#fff",
          borderRadius: 14,
          boxShadow: "0 3px 16px #ff980018",
          padding: "22px 20px",
          margin: "0 0 22px 0",
          maxWidth: 700,
        }}>
          <div style={{ display: "flex", gap: 15 }}>
            <div style={{ flex: 1 }}>
              <input
                placeholder="Component Name *"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                required
                style={inputStyle}
              />
              <select
                value={form.category}
                onChange={e => setForm({ ...form, category: e.target.value })}
                required
                style={inputStyle}
              >
                <option value="">Select Category *</option>
                {categories.map(c => <option key={c}>{c}</option>)}
              </select>
              <input
                placeholder="Brand"
                value={form.brand}
                onChange={e => setForm({ ...form, brand: e.target.value })}
                style={inputStyle}
              />
              <input
                placeholder="Model"
                value={form.model}
                onChange={e => setForm({ ...form, model: e.target.value })}
                style={inputStyle}
              />
              <textarea
                placeholder="Description"
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
                style={{ ...inputStyle, minHeight: 40 }}
              />
              <input
                placeholder="Location"
                value={form.location}
                onChange={e => setForm({ ...form, location: e.target.value })}
                style={inputStyle}
              />
              <input
                placeholder="Supplier"
                value={form.supplier}
                onChange={e => setForm({ ...form, supplier: e.target.value })}
                style={inputStyle}
              />
              <input
                placeholder="SKU"
                value={form.sku}
                onChange={e => setForm({ ...form, sku: e.target.value })}
                style={inputStyle}
              />
              <input
                placeholder="Barcode"
                value={form.barcode}
                onChange={e => setForm({ ...form, barcode: e.target.value })}
                style={inputStyle}
              />
            </div>
            <div style={{ flex: 1 }}>
              <input
                type="number"
                placeholder="Quantity"
                value={form.quantity}
                onChange={e => setForm({ ...form, quantity: Number(e.target.value) })}
                required
                min={0}
                style={inputStyle}
              />
              <input
                type="number"
                placeholder="Min. Quantity (Alert)"
                value={form.min_quantity}
                onChange={e => setForm({ ...form, min_quantity: Number(e.target.value) })}
                min={0}
                style={inputStyle}
              />
              <input
                type="number"
                placeholder="Max. Quantity"
                value={form.max_quantity}
                onChange={e => setForm({ ...form, max_quantity: Number(e.target.value) })}
                min={0}
                style={inputStyle}
              />
              <input
                type="number"
                placeholder="Reorder Point"
                value={form.reorder_point}
                onChange={e => setForm({ ...form, reorder_point: Number(e.target.value) })}
                min={0}
                style={inputStyle}
              />
              <input
                type="number"
                placeholder="Unit Price"
                value={form.unit_price}
                onChange={e => setForm({ ...form, unit_price: Number(e.target.value) })}
                min={0}
                style={inputStyle}
              />
              <input
                type="number"
                placeholder="Selling Price"
                value={form.selling_price}
                onChange={e => setForm({ ...form, selling_price: Number(e.target.value) })}
                min={0}
                style={inputStyle}
              />
              <textarea
                placeholder="Specifications"
                value={form.specifications}
                onChange={e => setForm({ ...form, specifications: e.target.value })}
                style={{ ...inputStyle, minHeight: 40 }}
              />
              <input
                placeholder="Voltage Rating"
                value={form.voltage_rating}
                onChange={e => setForm({ ...form, voltage_rating: e.target.value })}
                style={inputStyle}
              />
              <input
                placeholder="Current Rating"
                value={form.current_rating}
                onChange={e => setForm({ ...form, current_rating: e.target.value })}
                style={inputStyle}
              />
              <input
                placeholder="Storage Temp"
                value={form.storage_temp}
                onChange={e => setForm({ ...form, storage_temp: e.target.value })}
                style={inputStyle}
              />
              <input
                placeholder="Lead Time"
                value={form.lead_time}
                onChange={e => setForm({ ...form, lead_time: e.target.value })}
                style={inputStyle}
              />
              <input
                placeholder="Warranty"
                value={form.warranty}
                onChange={e => setForm({ ...form, warranty: e.target.value })}
                style={inputStyle}
              />
              <input
                type="date"
                placeholder="Expiry Date"
                value={form.expiry_date}
                onChange={e => setForm({ ...form, expiry_date: e.target.value })}
                style={inputStyle}
              />
              <textarea
                placeholder="Notes"
                value={form.notes}
                onChange={e => setForm({ ...form, notes: e.target.value })}
                style={{ ...inputStyle, minHeight: 30 }}
              />
            </div>
          </div>
          <div style={{ marginTop: 12, display: "flex", gap: 10 }}>
            <button type="submit" style={{
              background: "linear-gradient(90deg,#ff9800,#ffab00)",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              padding: "12px 30px",
              fontWeight: 900,
              fontSize: "1.1rem",
              cursor: "pointer",
              boxShadow: "0 4px 12px rgba(255, 152, 0, 0.3)"
            }}>{editing ? "Update Item" : "Add Item"}</button>
            <button type="button" onClick={() => { setForm(initialForm); setShowForm(false); setEditing(false); }} style={{
              background: "#fff3e0",
              color: "#ff9800",
              border: "2px solid #ffcc02",
              borderRadius: 8,
              padding: "12px 20px",
              fontWeight: 700,
              fontSize: "1rem",
              cursor: "pointer",
            }}>Cancel</button>
          </div>
        </form>
      )}

      {/* Inventory Table */}
      <div style={{ overflowX: "auto" }}>
        <table style={{
          width: "100%",
          margin: "14px 0 0 0",
          borderCollapse: "collapse",
          boxShadow: "0 4px 20px rgba(255, 152, 0, 0.15)",
          background: "#fff",
          borderRadius: "12px",
          overflow: "hidden",
          minWidth: "1100px"
        }}>
          <thead>
            <tr>
              <th style={thMain}>Name</th>
              <th style={thMain}>Category</th>
              <th style={thMain}>Brand</th>
              <th style={thMain}>Model</th>
              <th style={thMain}>Quantity</th>
              <th style={thMain}>Unit Price</th>
              <th style={thMain}>Selling Price</th>
              <th style={thMain}>Location</th>
              <th style={thMain}>Supplier</th>
              <th style={thMain}>SKU</th>
              <th style={thMain}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={12} style={{ textAlign: "center", padding: 50 }}>Loading inventory...</td>
              </tr>
            ) : (
              inventory.filter(item =>
                filter === "" ||
                item.name?.toLowerCase().includes(filter.toLowerCase()) ||
                item.brand?.toLowerCase().includes(filter.toLowerCase()) ||
                item.model?.toLowerCase().includes(filter.toLowerCase()) ||
                item.category?.toLowerCase().includes(filter.toLowerCase())
              ).map(item => (
                <tr key={item.id}>
                  <td style={tdMain}>{item.name}
                    {lowStock(item) && (
                      <span style={{ color: "#b71c1c", fontWeight: 800, marginLeft: 8 }}>⚠️ Low!</span>
                    )}
                  </td>
                  <td style={tdMain}>{item.category}</td>
                  <td style={tdMain}>{item.brand}</td>
                  <td style={tdMain}>{item.model}</td>
                  <td style={{ ...tdMain, fontWeight: item.quantity <= item.reorder_point ? "bold" : 600, color: item.quantity <= item.reorder_point ? "#c62828" : "#1976d2" }}>
                    {item.quantity}
                    <button style={{ marginLeft: 6 }} onClick={() => adjustStock(item, -1)} title="Subtract stock">➖</button>
                    <button style={{ marginLeft: 2 }} onClick={() => adjustStock(item, 1)} title="Add stock">➕</button>
                  </td>
                  <td style={tdMain}>Rs. {Number(item.unit_price).toLocaleString()}</td>
                  <td style={tdMain}>Rs. {Number(item.selling_price).toLocaleString()}</td>
                  <td style={tdMain}>{item.location}</td>
                  <td style={tdMain}>{item.supplier}</td>
                  <td style={tdMain}>{item.sku}</td>
                  <td style={tdMain}>
                    <button onClick={() => handleEdit(item)} style={actionBtn}>✏️ Edit</button>
                    <button onClick={() => handleDelete(item.id)} style={actionBtnRed}>🗑️ Delete</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const inputStyle = {
  display: "block",
  width: "100%",
  padding: "10px 12px",
  borderRadius: 8,
  border: "2px solid #ffecb3",
  margin: "0 0 12px 0",
  fontSize: "1rem",
  fontWeight: 500,
  backgroundColor: "#fffef7",
  transition: "border-color 0.3s ease",
  outline: "none"
};

const thMain = {
  background: "linear-gradient(135deg, #ff9800, #ffb74d)",
  color: "#fff",
  fontWeight: 800,
  padding: "14px 12px",
  border: "none",
  fontSize: 15,
  textShadow: "0 1px 3px rgba(0,0,0,0.3)"
};

const tdMain = {
  padding: "12px 12px",
  borderBottom: "2px solid #ffe0b2",
  background: "#fffef7",
  fontSize: 14,
  fontWeight: 500
};

const actionBtn = {
  background: "linear-gradient(135deg, #e0f2f1, #b2dfdb)",
  color: "#00695c",
  border: "1px solid #4db6ac",
  borderRadius: 6,
  padding: "6px 10px",
  fontWeight: 600,
  fontSize: 12,
  cursor: "pointer",
  marginRight: 5,
  transition: "all 0.3s ease"
};
const actionBtnRed = {
  ...actionBtn,
  background: "linear-gradient(135deg, #ffcdd2, #ef9a9a)",
  color: "#c62828",
  border: "1px solid #e57373"
};
