// src/pages/Repairs.js
import React, { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import logo from "../assets/logo.png";

const initialRepairForm = {
  id: null,
  customer_name: "",
  customer_phone: "",
  customer_email: "",
  customer_address: "",
  inverter_brand: "",
  inverter_model: "",
  serial_number: "",
  accessories: "",
  date: new Date().toISOString().slice(0, 10),
  return_date: "",
  faults: "",
  repaired_by: "",
  status: "Pending Approval",
  parts_used: [],
  repair_charges: 0,
  total: 0,
  warranty: "30",
  priority: "Normal",
  remarks: "",
};

export default function Repairs() {
  const [repairs, setRepairs] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [form, setForm] = useState(initialRepairForm);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [syncStatus, setSyncStatus] = useState("checking");
  const [partToAdd, setPartToAdd] = useState({ id: "", qty: 1 });
  const [filter, setFilter] = useState("");

  // Load inventory and repairs
  useEffect(() => {
    loadData();
    const invChannel = supabase
      .channel("repair_inventory_sync")
      .on("postgres_changes", { event: "*", schema: "public", table: "repairs" }, () => loadData())
      .on("postgres_changes", { event: "*", schema: "public", table: "inventory" }, () => loadData())
      .subscribe();
    return () => { supabase.removeChannel(invChannel); };
    // eslint-disable-next-line
  }, []);

  async function loadData() {
    setLoading(true);
    setSyncStatus("checking");
    try {
      let { data: inventoryData, error: inventoryError } = await supabase.from("inventory").select("*");
      if (inventoryError) throw inventoryError;
      setInventory(inventoryData);
      localStorage.setItem("inventory", JSON.stringify(inventoryData));

      let { data: repairsData, error: repairsError } = await supabase.from("repairs").select("*").order("created_at", { ascending: false });
      if (repairsError) throw repairsError;
      setRepairs(repairsData);
      localStorage.setItem("repairs", JSON.stringify(repairsData));
      setSyncStatus("synced");
    } catch (err) {
      setInventory(JSON.parse(localStorage.getItem("inventory") || "[]"));
      setRepairs(JSON.parse(localStorage.getItem("repairs") || "[]"));
      setSyncStatus("offline");
    }
    setLoading(false);
  }

  // Add or update repair
  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.customer_name || !form.parts_used.length) {
      alert("Customer name and at least one part used are required.");
      return;
    }
    try {
      setSyncStatus("syncing");
      let res;
      if (!form.id) {
  // Remove id field before insert
  const insertRepair = { ...form, date: form.date || new Date().toISOString().slice(0, 10) };
  delete insertRepair.id;
  const { data, error } = await supabase
    .from("repairs")
    .insert([insertRepair])
    .select();
  if (error) throw error;
  res = data[0];
}
 else {
        const { data, error } = await supabase
          .from("repairs")
          .update({ ...form })
          .eq("id", form.id)
          .select();
        if (error) throw error;
        res = data[0];
      }
      // Repairs saved, inventory auto-adjusted via trigger
      await loadData();
      setForm(initialRepairForm);
      setShowForm(false);
      setSyncStatus("synced");
    } catch (error) {
      setSyncStatus("offline");
      alert("Error saving repair: " + error.message);
    }
  }

  // Edit
  function handleEdit(item) {
    setForm({ ...item, date: item.date?.slice(0, 10) });
    setShowForm(true);
  }

  // Delete
  async function handleDelete(id) {
    if (!window.confirm("Delete this repair?")) return;
    try {
      setSyncStatus("syncing");
      await supabase.from("repairs").delete().eq("id", id);
      await loadData();
      setSyncStatus("synced");
    } catch (error) {
      setSyncStatus("offline");
      alert("Error deleting: " + error.message);
    }
  }

  // Add part to repair
  function addPart() {
    const partObj = inventory.find(i => i.id === Number(partToAdd.id));
    if (!partObj || partToAdd.qty <= 0) return;
    if (partObj.quantity < partToAdd.qty) {
      alert("Insufficient stock!");
      return;
    }
    // If part already added, just update qty
    const existing = form.parts_used.find(p => p.id === partObj.id);
    let updatedParts;
    if (existing) {
      updatedParts = form.parts_used.map(p =>
        p.id === partObj.id ? { ...p, qty: p.qty + Number(partToAdd.qty) } : p
      );
    } else {
      updatedParts = [
        ...form.parts_used,
        {
          id: partObj.id,
          name: partObj.name,
          qty: Number(partToAdd.qty),
          price: partObj.unit_price,
        },
      ];
    }
    setForm({ ...form, parts_used: updatedParts });
    setPartToAdd({ id: "", qty: 1 });
  }

  function removePart(pid) {
    setForm({ ...form, parts_used: form.parts_used.filter(p => p.id !== pid) });
  }

  // Stock alert for selected components
  const isLowStock = iid => {
    const item = inventory.find(i => i.id === iid);
    if (!item) return false;
    return item.quantity <= (item.reorder_point || item.min_quantity);
  };

  // Render
  return (
    <div style={{ background: "#f6f8fc", minHeight: "100vh", padding: 24 }}>
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
        <button onClick={loadData} style={{
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
        Inverter Repairs
      </h1>

      <button onClick={() => { setForm(initialRepairForm); setShowForm(true); }} style={{
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
      }}>+ Add New Repair</button>

      <input
        type="text"
        placeholder="Search by customer, model, serial, etc."
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
          maxWidth: 900,
        }}>
          <div style={{ display: "flex", gap: 15 }}>
            <div style={{ flex: 1 }}>
              <input placeholder="Customer Name *" value={form.customer_name} required style={inputStyle}
                onChange={e => setForm({ ...form, customer_name: e.target.value })} />
              <input placeholder="Phone" value={form.customer_phone} style={inputStyle}
                onChange={e => setForm({ ...form, customer_phone: e.target.value })} />
              <input placeholder="Email" value={form.customer_email} style={inputStyle}
                onChange={e => setForm({ ...form, customer_email: e.target.value })} />
              <input placeholder="Address" value={form.customer_address} style={inputStyle}
                onChange={e => setForm({ ...form, customer_address: e.target.value })} />
              <input placeholder="Inverter Brand" value={form.inverter_brand} style={inputStyle}
                onChange={e => setForm({ ...form, inverter_brand: e.target.value })} />
              <input placeholder="Inverter Model" value={form.inverter_model} style={inputStyle}
                onChange={e => setForm({ ...form, inverter_model: e.target.value })} />
              <input placeholder="Serial Number" value={form.serial_number} style={inputStyle}
                onChange={e => setForm({ ...form, serial_number: e.target.value })} />
              <input placeholder="Accessories" value={form.accessories} style={inputStyle}
                onChange={e => setForm({ ...form, accessories: e.target.value })} />
              <input type="date" placeholder="Date" value={form.date} style={inputStyle}
                onChange={e => setForm({ ...form, date: e.target.value })} />
              <input type="date" placeholder="Return Date" value={form.return_date} style={inputStyle}
                onChange={e => setForm({ ...form, return_date: e.target.value })} />
              <textarea placeholder="Faults" value={form.faults} style={{ ...inputStyle, minHeight: 32 }}
                onChange={e => setForm({ ...form, faults: e.target.value })} />
              <input placeholder="Repaired By" value={form.repaired_by} style={inputStyle}
                onChange={e => setForm({ ...form, repaired_by: e.target.value })} />
              <select value={form.status} style={inputStyle}
                onChange={e => setForm({ ...form, status: e.target.value })}>
                <option value="Pending Approval">Pending Approval</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
                <option value="Delivered">Delivered</option>
              </select>
              <select value={form.priority} style={inputStyle}
                onChange={e => setForm({ ...form, priority: e.target.value })}>
                <option value="Normal">Normal</option>
                <option value="High">High</option>
                <option value="Urgent">Urgent</option>
              </select>
              <textarea placeholder="Remarks" value={form.remarks} style={{ ...inputStyle, minHeight: 32 }}
                onChange={e => setForm({ ...form, remarks: e.target.value })} />
            </div>
            <div style={{ flex: 1 }}>
              {/* Parts Used Table */}
              <div style={{ marginBottom: 16 }}>
                <label style={{ fontWeight: 800, color: "#e65100" }}>Parts Used</label>
                <div style={{ display: "flex", alignItems: "center", marginTop: 4 }}>
                  <select value={partToAdd.id}
                    style={{ ...inputStyle, width: 210, marginRight: 8, marginBottom: 0 }}
                    onChange={e => setPartToAdd({ ...partToAdd, id: e.target.value })}>
                    <option value="">Select Part</option>
                    {inventory.filter(i => i.quantity > 0).map(i => (
                      <option key={i.id} value={i.id}>
                        {i.name} ({i.quantity} available){isLowStock(i.id) && " ⚠️Low"}
                      </option>
                    ))}
                  </select>
                  <input type="number" min={1} style={{ ...inputStyle, width: 80, marginRight: 8, marginBottom: 0 }}
                    value={partToAdd.qty}
                    onChange={e => setPartToAdd({ ...partToAdd, qty: Math.max(1, Number(e.target.value)) })} />
                  <button type="button" onClick={addPart}
                    style={{
                      background: "#ff9800", color: "#fff", fontWeight: 800,
                      border: "none", borderRadius: 7, padding: "8px 16px", cursor: "pointer"
                    }}>
                    Add
                  </button>
                </div>
                <ul>
                  {form.parts_used.map(p => {
                    const partObj = inventory.find(i => i.id === p.id);
                    return (
                      <li key={p.id} style={{ marginTop: 6 }}>
                        <span style={{ fontWeight: 600 }}>{p.name}</span>
                        {" - Qty: "}
                        <span style={{ fontWeight: 600 }}>{p.qty}</span>
                        {" "}
                        <span style={{ color: "#c62828", fontWeight: 800 }}>
                          {partObj && isLowStock(p.id) && "⚠️ Low Stock"}
                        </span>
                        <button type="button" onClick={() => removePart(p.id)} style={{ marginLeft: 10, color: "#b71c1c", fontWeight: 800, background: "none", border: "none", cursor: "pointer" }}>Remove</button>
                      </li>
                    );
                  })}
                </ul>
              </div>
              <input type="number" placeholder="Repair Charges" value={form.repair_charges} style={inputStyle}
                onChange={e => setForm({ ...form, repair_charges: Number(e.target.value) })} />
              <input type="number" placeholder="Total (Auto)" value={form.total} style={inputStyle}
                onChange={e => setForm({ ...form, total: Number(e.target.value) })} />
              <input placeholder="Warranty (Days)" value={form.warranty} style={inputStyle}
                onChange={e => setForm({ ...form, warranty: e.target.value })} />
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
            }}>{form.id ? "Update Repair" : "Add Repair"}</button>
            <button type="button" onClick={() => { setForm(initialRepairForm); setShowForm(false); }} style={{
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

      {/* Repairs Table */}
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
              <th style={thMain}>Customer Name</th>
              <th style={thMain}>Model</th>
              <th style={thMain}>Serial</th>
              <th style={thMain}>Date</th>
              <th style={thMain}>Parts Used</th>
              <th style={thMain}>Repair Charges</th>
              <th style={thMain}>Status</th>
              <th style={thMain}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8} style={{ textAlign: "center", padding: 50 }}>Loading repairs...</td>
              </tr>
            ) : (
              repairs.filter(item =>
                filter === "" ||
                item.customer_name?.toLowerCase().includes(filter.toLowerCase()) ||
                item.inverter_model?.toLowerCase().includes(filter.toLowerCase()) ||
                item.serial_number?.toLowerCase().includes(filter.toLowerCase())
              ).map(item => (
                <tr key={item.id}>
                  <td style={tdMain}>{item.customer_name}</td>
                  <td style={tdMain}>{item.inverter_model}</td>
                  <td style={tdMain}>{item.serial_number}</td>
                  <td style={tdMain}>{item.date}</td>
                  <td style={tdMain}>
                    <ul>
                      {item.parts_used?.map?.(p =>
                        <li key={p.id} style={{ fontWeight: isLowStock(p.id) ? 900 : 500, color: isLowStock(p.id) ? "#b71c1c" : undefined }}>
                          {p.name} x {p.qty} {isLowStock(p.id) && "⚠️"}
                        </li>
                      )}
                    </ul>
                  </td>
                  <td style={tdMain}>Rs. {item.repair_charges}</td>
                  <td style={tdMain}>{item.status}</td>
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
