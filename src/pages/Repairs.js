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

const statusOptions = [
  "Pending Approval", 
  "In Progress", 
  "Completed", 
  "Delivered"
];

const priorityOptions = [
  "Normal", 
  "High", 
  "Urgent"
];

export default function Repairs() {
  const [repairs, setRepairs] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [form, setForm] = useState(initialRepairForm);
  const [editing, setEditing] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [syncStatus, setSyncStatus] = useState("loading");
  const [partToAdd, setPartToAdd] = useState({ id: "", qty: 1 });
  const [filter, setFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [sortBy, setSortBy] = useState("date");
  const [sortOrder, setSortOrder] = useState("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Load inventory and repairs
  useEffect(() => {
    loadData();
    
    // Set up real-time subscription
    const channel = supabase
      .channel('repairs_inventory_sync')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'repairs' 
      }, (payload) => {
        console.log('Real-time update for repairs:', payload);
        loadData();
      })
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'inventory' 
      }, (payload) => {
        console.log('Real-time update for inventory:', payload);
        loadData();
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  async function loadData() {
    setLoading(true);
    setSyncStatus("loading");
    
    try {
      // Load inventory
      let { data: inventoryData, error: inventoryError } = await supabase
        .from("inventory")
        .select("*");
      
      if (inventoryError) throw inventoryError;
      setInventory(inventoryData || []);
      
      // Load repairs
      let { data: repairsData, error: repairsError } = await supabase
        .from("repairs")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (repairsError) throw repairsError;
      setRepairs(repairsData || []);
      
      setSyncStatus("synced");
    } catch (err) {
      console.error("Error loading data:", err);
      setSyncStatus("error");
      setInventory([]);
      setRepairs([]);
    } finally {
      setLoading(false);
    }
  }

  // Add or update repair
  async function handleSubmit(e) {
    e.preventDefault();
    
    if (!form.customer_name || !form.parts_used.length) {
      alert("Customer name and at least one part used are required.");
      return;
    }
    
    setSyncStatus("syncing");
    
    try {
      let result;
      
      if (!form.id) {
        // Insert new repair
        const insertRepair = { 
          ...form, 
          date: form.date || new Date().toISOString().slice(0, 10) 
        };
        delete insertRepair.id;
        
        const { data, error } = await supabase
          .from("repairs")
          .insert([insertRepair])
          .select();
        
        if (error) throw error;
        result = data[0];
        
        // Update local state immediately
        setRepairs(prev => [result, ...prev]);
      } else {
        // Update existing repair
        const { data, error } = await supabase
          .from("repairs")
          .update({ ...form })
          .eq("id", form.id)
          .select();
        
        if (error) throw error;
        result = data[0];
        
        // Update local state immediately
        setRepairs(prev => prev.map(repair => 
          repair.id === result.id ? result : repair
        ));
      }
      
      // Reset form and close
      setForm(initialRepairForm);
      setEditing(false);
      setShowForm(false);
      setSyncStatus("synced");
      
      alert(`✅ Repair ${editing ? 'updated' : 'added'} successfully!`);
      
    } catch (error) {
      console.error("Error saving repair:", error);
      setSyncStatus("error");
      alert(`❌ Error ${editing ? 'updating' : 'adding'} repair: ${error.message}`);
    }
  }

  // Edit repair
  function handleEdit(item) {
    setForm({ 
      ...item, 
      date: item.date?.slice(0, 10),
      return_date: item.return_date?.slice(0, 10) || ""
    });
    setEditing(true);
    setShowForm(true);
  }

  // Delete repair
  async function handleDelete(id) {
    if (!window.confirm("Delete this repair? This action cannot be undone.")) return;
    
    setSyncStatus("syncing");
    
    try {
      const { error } = await supabase
        .from("repairs")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
      
      // Update local state immediately
      setRepairs(prev => prev.filter(repair => repair.id !== id));
      setSyncStatus("synced");
      alert("✅ Repair deleted successfully!");
      
    } catch (error) {
      console.error("Error deleting repair:", error);
      setSyncStatus("error");
      alert(`❌ Error deleting repair: ${error.message}`);
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
    return item.quantity <= (item.reorder_point || item.min_quantity || 5);
  };

  // Calculate total cost of parts used
  const calculatePartsTotal = () => {
    return form.parts_used.reduce((total, part) => {
      return total + (part.price * part.qty);
    }, 0);
  };

  // Update total when parts or repair charges change
  useEffect(() => {
    const partsTotal = calculatePartsTotal();
    const total = partsTotal + (form.repair_charges || 0);
    setForm(prev => ({ ...prev, total }));
  }, [form.parts_used, form.repair_charges]);

  // Enhanced filtering and sorting
  const getFilteredAndSortedRepairs = () => {
    let filtered = repairs.filter(item => {
      const matchesSearch = filter === "" ||
        item.customer_name?.toLowerCase().includes(filter.toLowerCase()) ||
        item.inverter_model?.toLowerCase().includes(filter.toLowerCase()) ||
        item.serial_number?.toLowerCase().includes(filter.toLowerCase()) ||
        item.repaired_by?.toLowerCase().includes(filter.toLowerCase());
      
      const matchesStatus = statusFilter === "all" || item.status === statusFilter;
      const matchesPriority = priorityFilter === "all" || item.priority === priorityFilter;
      
      return matchesSearch && matchesStatus && matchesPriority;
    });
    
    // Sort items
    filtered.sort((a, b) => {
      let aVal = a[sortBy] || "";
      let bVal = b[sortBy] || "";
      
      if (typeof aVal === "string") {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
      }
      
      if (sortOrder === "asc") {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });
    
    return filtered;
  };

  // Get statistics
  const getRepairStats = () => {
    const totalRepairs = repairs.length;
    const pendingRepairs = repairs.filter(r => r.status === "Pending Approval").length;
    const inProgressRepairs = repairs.filter(r => r.status === "In Progress").length;
    const completedRepairs = repairs.filter(r => r.status === "Completed").length;
    const totalRevenue = repairs.reduce((sum, repair) => sum + (repair.total || 0), 0);
    
    return { 
      totalRepairs, 
      pendingRepairs, 
      inProgressRepairs, 
      completedRepairs,
      totalRevenue
    };
  };

  const stats = getRepairStats();
  const filteredRepairs = getFilteredAndSortedRepairs();
  
  // Pagination
  const totalPages = Math.ceil(filteredRepairs.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedRepairs = filteredRepairs.slice(startIndex, startIndex + itemsPerPage);

  // Status badge styling
  const getStatusBadgeStyle = (status) => {
    switch(status) {
      case "Pending Approval":
        return { background: "#fff3cd", color: "#856404", border: "1px solid #ffeaa7" };
      case "In Progress":
        return { background: "#cce5ff", color: "#004085", border: "1px solid #99d6ff" };
      case "Completed":
        return { background: "#d4edda", color: "#155724", border: "1px solid #c3e6cb" };
      case "Delivered":
        return { background: "#e2e3e5", color: "#383d41", border: "1px solid #d6d8db" };
      default:
        return { background: "#f8f9fa", color: "#383d41", border: "1px solid #d6d8db" };
    }
  };

  // Priority badge styling
  const getPriorityBadgeStyle = (priority) => {
    switch(priority) {
      case "Normal":
        return { background: "#e3f2fd", color: "#1976d2", border: "1px solid #bbdefb" };
      case "High":
        return { background: "#fff3e0", color: "#e65100", border: "1px solid #ffe0b2" };
      case "Urgent":
        return { background: "#ffebee", color: "#c62828", border: "1px solid #ffcdd2" };
      default:
        return { background: "#f8f9fa", color: "#383d41", border: "1px solid #d6d8db" };
    }
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerContent}>
          <div>
            <h1 style={styles.title}>
              <img src={logo} alt="logo" style={{ height: 48, marginRight: 12, verticalAlign: "middle" }} />
              Inverter Repairs
            </h1>
            <p style={styles.subtitle}>
              Manage all inverter repair jobs and track progress
            </p>
            <div style={styles.syncStatus}>
              <span style={{
                color: syncStatus === "synced" ? "#4caf50" : 
                       syncStatus === "loading" ? "#ff9800" : 
                       syncStatus === "syncing" ? "#2196f3" : "#f44336"
              }}>
                {syncStatus === "synced" ? "✅ Database synced" : 
                 syncStatus === "loading" ? "🔄 Loading repairs..." : 
                 syncStatus === "syncing" ? "🔄 Syncing changes..." : "❌ Sync error"}
              </span>
            </div>
          </div>
          
          <div style={styles.headerActions}>
            <button
              onClick={loadData}
              disabled={loading}
              style={styles.refreshButton}
            >
              {loading ? "🔄 Loading..." : "🔄 Refresh"}
            </button>
            <button
              onClick={() => {
                setForm(initialRepairForm);
                setEditing(false);
                setShowForm(true);
              }}
              style={styles.addButton}
            >
              ➕ Add New Repair
            </button>
          </div>
        </div>
      </div>
      
      {/* Statistics Cards */}
      <div style={styles.statsGrid}>
        <StatCard 
          icon="🔧" 
          title="Total Repairs" 
          value={stats.totalRepairs}
          subtitle="All repair jobs"
          color="#2196f3"
        />
        <StatCard 
          icon="⏳" 
          title="Pending" 
          value={stats.pendingRepairs}
          subtitle="Awaiting approval"
          color="#ff9800"
        />
        <StatCard 
          icon="🔨" 
          title="In Progress" 
          value={stats.inProgressRepairs}
          subtitle="Currently being repaired"
          color="#f44336"
        />
        <StatCard 
          icon="✅" 
          title="Completed" 
          value={stats.completedRepairs}
          subtitle="Finished repairs"
          color="#4caf50"
        />
        <StatCard 
          icon="💰" 
          title="Total Revenue" 
          value={`Rs ${stats.totalRevenue.toLocaleString()}`}
          subtitle="From all repairs"
          color="#9c27b0"
        />
      </div>
      
      {/* Filters and Controls */}
      <div style={styles.controlsSection}>
        <div style={styles.filtersContainer}>
          <input
            type="text"
            placeholder="🔍 Search repairs..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            style={styles.searchInput}
          />
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={styles.filterSelect}
          >
            <option value="all">All Statuses</option>
            {statusOptions.map(status => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
          
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            style={styles.filterSelect}
          >
            <option value="all">All Priorities</option>
            {priorityOptions.map(priority => (
              <option key={priority} value={priority}>{priority}</option>
            ))}
          </select>
          
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            style={styles.filterSelect}
          >
            <option value="date">Sort by Date</option>
            <option value="customer_name">Sort by Customer</option>
            <option value="status">Sort by Status</option>
            <option value="priority">Sort by Priority</option>
            <option value="total">Sort by Total</option>
          </select>
          
          <button
            onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
            style={styles.sortButton}
            title={`Sort ${sortOrder === "asc" ? "Descending" : "Ascending"}`}
          >
            {sortOrder === "asc" ? "↑" : "↓"}
          </button>
        </div>
        
        <div style={styles.resultsInfo}>
          Showing {paginatedRepairs.length} of {filteredRepairs.length} repairs
        </div>
      </div>
      
      {/* Add/Edit Form Modal */}
      {showForm && (
        <div style={styles.modal}>
          <div style={styles.modalContent}>
            <div style={styles.modalHeader}>
              <h2>{editing ? "✏️ Edit Repair" : "➕ Add New Repair"}</h2>
              <button 
                onClick={() => {
                  setForm(initialRepairForm);
                  setShowForm(false);
                  setEditing(false);
                }}
                style={styles.closeButton}
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handleSubmit} style={styles.form}>
              <div style={styles.formGrid}>
                {/* Customer Information */}
                <div style={styles.formSection}>
                  <h3 style={styles.sectionTitle}>👤 Customer Information</h3>
                  <input
                    placeholder="Customer Name *"
                    value={form.customer_name}
                    onChange={(e) => setForm({ ...form, customer_name: e.target.value })}
                    required
                    style={styles.input}
                  />
                  <input
                    placeholder="Phone Number"
                    value={form.customer_phone}
                    onChange={(e) => setForm({ ...form, customer_phone: e.target.value })}
                    style={styles.input}
                  />
                  <input
                    placeholder="Email Address"
                    type="email"
                    value={form.customer_email}
                    onChange={(e) => setForm({ ...form, customer_email: e.target.value })}
                    style={styles.input}
                  />
                  <input
                    placeholder="Address"
                    value={form.customer_address}
                    onChange={(e) => setForm({ ...form, customer_address: e.target.value })}
                    style={styles.input}
                  />
                </div>
                
                {/* Inverter Details */}
                <div style={styles.formSection}>
                  <h3 style={styles.sectionTitle}>⚡ Inverter Details</h3>
                  <input
                    placeholder="Inverter Brand"
                    value={form.inverter_brand}
                    onChange={(e) => setForm({ ...form, inverter_brand: e.target.value })}
                    style={styles.input}
                  />
                  <input
                    placeholder="Inverter Model"
                    value={form.inverter_model}
                    onChange={(e) => setForm({ ...form, inverter_model: e.target.value })}
                    style={styles.input}
                  />
                  <input
                    placeholder="Serial Number"
                    value={form.serial_number}
                    onChange={(e) => setForm({ ...form, serial_number: e.target.value })}
                    style={styles.input}
                  />
                  <input
                    placeholder="Accessories"
                    value={form.accessories}
                    onChange={(e) => setForm({ ...form, accessories: e.target.value })}
                    style={styles.input}
                  />
                </div>
                
                {/* Repair Details */}
                <div style={styles.formSection}>
                  <h3 style={styles.sectionTitle}>🔧 Repair Details</h3>
                  <input
                    type="date"
                    placeholder="Date Received"
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                    style={styles.input}
                  />
                  <input
                    type="date"
                    placeholder="Expected Return Date"
                    value={form.return_date}
                    onChange={(e) => setForm({ ...form, return_date: e.target.value })}
                    style={styles.input}
                  />
                  <textarea
                    placeholder="Faults/Issues"
                    value={form.faults}
                    onChange={(e) => setForm({ ...form, faults: e.target.value })}
                    style={styles.textarea}
                    rows="3"
                  />
                  <input
                    placeholder="Repaired By"
                    value={form.repaired_by}
                    onChange={(e) => setForm({ ...form, repaired_by: e.target.value })}
                    style={styles.input}
                  />
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                    style={styles.input}
                  >
                    {statusOptions.map(status => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                  <select
                    value={form.priority}
                    onChange={(e) => setForm({ ...form, priority: e.target.value })}
                    style={styles.input}
                  >
                    {priorityOptions.map(priority => (
                      <option key={priority} value={priority}>{priority}</option>
                    ))}
                  </select>
                </div>
                
                {/* Parts and Pricing */}
                <div style={styles.formSection}>
                  <h3 style={styles.sectionTitle}>🔩 Parts and Pricing</h3>
                  
                  <div style={{ marginBottom: 16 }}>
                    <label style={{ fontWeight: 600, marginBottom: 8, display: 'block' }}>Parts Used</label>
                    <div style={{ display: "flex", alignItems: "center", marginBottom: 8 }}>
                      <select value={partToAdd.id}
                        style={{ ...styles.input, width: 210, marginRight: 8, marginBottom: 0 }}
                        onChange={e => setPartToAdd({ ...partToAdd, id: e.target.value })}>
                        <option value="">Select Part</option>
                        {inventory.filter(i => i.quantity > 0).map(i => (
                          <option key={i.id} value={i.id}>
                            {i.name} ({i.quantity} available){isLowStock(i.id) && " ⚠️Low"}
                          </option>
                        ))}
                      </select>
                      <input type="number" min={1} style={{ ...styles.input, width: 80, marginRight: 8, marginBottom: 0 }}
                        value={partToAdd.qty}
                        onChange={e => setPartToAdd({ ...partToAdd, qty: Math.max(1, Number(e.target.value)) })} />
                      <button type="button" onClick={addPart}
                        style={{
                          background: "#ff9800", color: "#fff", fontWeight: 600,
                          border: "none", borderRadius: 6, padding: "8px 12px", cursor: "pointer"
                        }}>
                        Add
                      </button>
                    </div>
                    
                    <ul style={{ paddingLeft: 20, marginTop: 8 }}>
                      {form.parts_used.map(p => {
                        const partObj = inventory.find(i => i.id === p.id);
                        return (
                          <li key={p.id} style={{ marginTop: 6, display: 'flex', justifyContent: 'space-between' }}>
                            <div>
                              <span style={{ fontWeight: 600 }}>{p.name}</span>
                              {" - Qty: "}
                              <span style={{ fontWeight: 600 }}>{p.qty}</span>
                              {" @ Rs "}
                              <span style={{ fontWeight: 600 }}>{p.price}</span>
                              {" "}
                              <span style={{ color: "#c62828", fontWeight: 600 }}>
                                {partObj && isLowStock(p.id) && "⚠️ Low Stock"}
                              </span>
                            </div>
                            <button type="button" onClick={() => removePart(p.id)} 
                              style={{ color: "#b71c1c", fontWeight: 600, background: "none", border: "none", cursor: "pointer" }}>
                              Remove
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                    
                    <div style={{ marginTop: 8, fontSize: '0.9rem', color: '#666' }}>
                      Parts Total: Rs {calculatePartsTotal().toLocaleString()}
                    </div>
                  </div>
                  
                  <input
                    type="number"
                    placeholder="Repair Charges"
                    value={form.repair_charges}
                    onChange={(e) => setForm({ ...form, repair_charges: Number(e.target.value) })}
                    min="0"
                    step="0.01"
                    style={styles.input}
                  />
                  
                  <div style={{ 
                    padding: '12px', 
                    background: '#f5f5f5', 
                    borderRadius: '8px', 
                    marginTop: '8px',
                    fontWeight: 600,
                    fontSize: '1.1rem'
                  }}>
                    Total: Rs {form.total.toLocaleString()}
                  </div>
                  
                  <input
                    placeholder="Warranty (Days)"
                    value={form.warranty}
                    onChange={(e) => setForm({ ...form, warranty: e.target.value })}
                    style={styles.input}
                  />
                </div>
                
                {/* Additional Information */}
                <div style={styles.formSection}>
                  <h3 style={styles.sectionTitle}>📝 Additional Information</h3>
                  <textarea
                    placeholder="Remarks/Notes"
                    value={form.remarks}
                    onChange={(e) => setForm({ ...form, remarks: e.target.value })}
                    style={styles.textarea}
                    rows="4"
                  />
                </div>
              </div>
              
              <div style={styles.formActions}>
                <button
                  type="button"
                  onClick={() => {
                    setForm(initialRepairForm);
                    setShowForm(false);
                    setEditing(false);
                  }}
                  style={styles.cancelButton}
                >
                  ❌ Cancel
                </button>
                <button
                  type="submit"
                  style={styles.submitButton}
                  disabled={syncStatus === "syncing"}
                >
                  {syncStatus === "syncing" ? "⏳ Saving..." : 
                   editing ? "💾 Update Repair" : "➕ Add Repair"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Repairs Table */}
      <div style={styles.tableContainer}>
        {loading ? (
          <div style={styles.loadingContainer}>
            <div style={styles.loadingSpinner}>⏳</div>
            <h3>Loading Repairs...</h3>
            <p>Fetching latest repair information...</p>
          </div>
        ) : paginatedRepairs.length === 0 ? (
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}>🔧</div>
            <h3>No repairs found</h3>
            <p>
              {filter || statusFilter !== "all" || priorityFilter !== "all"
                ? "Try adjusting your search filters"
                : "Add your first repair job to get started"
              }
            </p>
            <button
              onClick={() => {
                setForm(initialRepairForm);
                setEditing(false);
                setShowForm(true);
              }}
              style={styles.addButton}
            >
              ➕ Add First Repair
            </button>
          </div>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr style={styles.tableHeader}>
                <th style={styles.th}>Customer & Inverter</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Parts Used</th>
                <th style={styles.th}>Pricing</th>
                <th style={styles.th}>Dates</th>
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedRepairs.map((item) => (
                <tr key={item.id} style={styles.tableRow}>
                  <td style={styles.td}>
                    <div style={styles.itemDetails}>
                      <div style={styles.itemName}>
                        {item.customer_name}
                        <span style={{...getPriorityBadgeStyle(item.priority), fontSize: '0.7rem', marginLeft: '8px'}}>
                          {item.priority}
                        </span>
                      </div>
                      <div style={styles.itemMeta}>
                        {item.inverter_brand && <span>{item.inverter_brand}</span>}
                        {item.inverter_model && <span> • {item.inverter_model}</span>}
                        {item.serial_number && <span> • S/N: {item.serial_number}</span>}
                      </div>
                      <div style={styles.itemMeta}>
                        {item.repaired_by && <span>👨‍🔧 {item.repaired_by}</span>}
                      </div>
                    </div>
                  </td>
                  <td style={styles.td}>
                    <span style={{
                      ...getStatusBadgeStyle(item.status),
                      padding: '4px 12px',
                      borderRadius: '16px',
                      fontSize: '0.85rem',
                      fontWeight: '500',
                      display: 'inline-block'
                    }}>
                      {item.status}
                    </span>
                  </td>
                  <td style={styles.td}>
                    <div>
                      {item.parts_used?.length > 0 ? (
                        <ul style={{ paddingLeft: 16, margin: 0 }}>
                          {item.parts_used.map(p => (
                            <li key={p.id} style={{ 
                              marginBottom: 4, 
                              fontSize: '0.9rem',
                              fontWeight: isLowStock(p.id) ? 600 : 400,
                              color: isLowStock(p.id) ? '#b71c1c' : undefined
                            }}>
                              {p.name} x {p.qty} {isLowStock(p.id) && "⚠️"}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <span style={{ color: '#999', fontStyle: 'italic' }}>No parts listed</span>
                      )}
                    </div>
                  </td>
                  <td style={styles.td}>
                    <div style={styles.priceInfo}>
                      <div>Parts: Rs {item.parts_used?.reduce((sum, part) => sum + (part.price * part.qty), 0).toLocaleString() || 0}</div>
                      <div>Labor: Rs {(item.repair_charges || 0).toLocaleString()}</div>
                      <div style={styles.totalValue}>
                        Total: Rs {(item.total || 0).toLocaleString()}
                      </div>
                    </div>
                  </td>
                  <td style={styles.td}>
                    <div>
                      <div style={{ fontWeight: 600 }}>Received:</div>
                      <div>{item.date}</div>
                      {item.return_date && (
                        <>
                          <div style={{ fontWeight: 600, marginTop: 8 }}>Expected:</div>
                          <div>{item.return_date}</div>
                        </>
                      )}
                    </div>
                  </td>
                  <td style={styles.td}>
                    <div style={styles.actionButtons}>
                      <button
                        onClick={() => handleEdit(item)}
                        style={styles.editButton}
                        title="Edit repair"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        style={styles.deleteButton}
                        title="Delete repair"
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      
      {/* Pagination */}
      {totalPages > 1 && (
        <div style={styles.pagination}>
          <button
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            style={styles.pageButton}
          >
            ← Previous
          </button>
          
          <span style={styles.pageInfo}>
            Page {currentPage} of {totalPages}
          </span>
          
          <button
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
            style={styles.pageButton}
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}

// Statistics Card Component
function StatCard({ icon, title, value, subtitle, color }) {
  return (
    <div style={{
      ...styles.statCard,
      borderLeftColor: color,
    }}>
      <div style={styles.statIcon}>{icon}</div>
      <div style={styles.statContent}>
        <div style={styles.statValue}>{value}</div>
        <div style={styles.statTitle}>{title}</div>
        <div style={styles.statSubtitle}>{subtitle}</div>
      </div>
    </div>
  );
}

// Comprehensive Styles
const styles = {
  container: {
    padding: '24px',
    background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
    minHeight: '100vh',
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif'",
  },
  header: {
    background: 'linear-gradient(135deg, #ff9800, #ffb74d)',
    borderRadius: '16px',
    padding: '32px',
    marginBottom: '32px',
    color: 'white',
    boxShadow: '0 10px 40px rgba(255, 152, 0, 0.3)',
  },
  headerContent: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '24px',
  },
  title: {
    fontSize: '2.2rem',
    fontWeight: '700',
    margin: '0 0 12px 0',
    textShadow: '0 2px 10px rgba(0,0,0,0.2)',
    display: 'flex',
    alignItems: 'center',
  },
  subtitle: {
    fontSize: '1.1rem',
    opacity: '0.9',
    margin: '0 0 8px 0',
    fontWeight: '400',
  },
  syncStatus: {
    fontSize: '0.9rem',
    opacity: '0.8',
  },
  headerActions: {
    display: 'flex',
    gap: '16px',
    alignItems: 'center',
  },
  refreshButton: {
    background: 'rgba(255, 255, 255, 0.2)',
    color: 'white',
    border: '2px solid rgba(255, 255, 255, 0.3)',
    borderRadius: '12px',
    padding: '12px 20px',
    cursor: 'pointer',
    fontSize: '0.9rem',
    fontWeight: '600',
    transition: 'all 0.3s ease',
    backdropFilter: 'blur(10px)',
  },
  addButton: {
    background: 'rgba(255, 255, 255, 0.9)',
    color: '#ff9800',
    border: 'none',
    borderRadius: '12px',
    padding: '12px 24px',
    cursor: 'pointer',
    fontSize: '0.9rem',
    fontWeight: '700',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '20px',
    marginBottom: '32px',
  },
  statCard: {
    background: 'white',
    borderRadius: '12px',
    padding: '24px',
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
    borderLeft: '4px solid',
    transition: 'transform 0.2s ease',
  },
  statIcon: {
    fontSize: '2rem',
  },
  statContent: {
    flex: 1,
  },
  statValue: {
    fontSize: '1.8rem',
    fontWeight: '700',
    color: '#2c3e50',
    marginBottom: '4px',
  },
  statTitle: {
    fontSize: '1rem',
    fontWeight: '600',
    color: '#6c757d',
    marginBottom: '2px',
  },
  statSubtitle: {
    fontSize: '0.85rem',
    color: '#adb5bd',
  },
  controlsSection: {
    background: 'white',
    borderRadius: '12px',
    padding: '24px',
    marginBottom: '24px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
  },
  filtersContainer: {
    display: 'flex',
    gap: '16px',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginBottom: '16px',
  },
  searchInput: {
    flex: 1,
    minWidth: '250px',
    padding: '12px 16px',
    border: '2px solid #e9ecef',
    borderRadius: '8px',
    fontSize: '1rem',
    transition: 'border-color 0.3s ease',
  },
  filterSelect: {
    padding: '12px 16px',
    border: '2px solid #e9ecef',
    borderRadius: '8px',
    fontSize: '1rem',
    background: 'white',
    cursor: 'pointer',
    minWidth: '150px',
  },
  sortButton: {
    padding: '12px 16px',
    border: '2px solid #e9ecef',
    borderRadius: '8px',
    background: 'white',
    cursor: 'pointer',
    fontSize: '1.2rem',
    width: '48px',
  },
  resultsInfo: {
    color: '#6c757d',
    fontSize: '0.9rem',
    fontWeight: '500',
  },
  modal: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '20px',
  },
  modalContent: {
    background: 'white',
    borderRadius: '16px',
    maxWidth: '900px',
    width: '100%',
    maxHeight: '90vh',
    overflow: 'auto',
    boxShadow: '0 25px 50px rgba(0, 0, 0, 0.3)',
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '24px',
    borderBottom: '2px solid #f0f0f0',
    background: 'linear-gradient(135deg, #ff9800, #ffb74d)',
    color: 'white',
    borderRadius: '16px 16px 0 0',
  },
  closeButton: {
    background: 'transparent',
    border: 'none',
    color: 'white',
    fontSize: '1.5rem',
    cursor: 'pointer',
    padding: '8px',
    borderRadius: '8px',
    transition: 'background 0.3s ease',
  },
  form: {
    padding: '24px',
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '24px',
    marginBottom: '32px',
  },
  formSection: {
    background: '#f8f9fa',
    padding: '20px',
    borderRadius: '12px',
    border: '1px solid #e9ecef',
  },
  sectionTitle: {
    fontSize: '1.1rem',
    fontWeight: '700',
    color: '#ff9800',
    marginBottom: '16px',
    paddingBottom: '8px',
    borderBottom: '2px solid #ffe0b2',
  },
  input: {
    width: '100%',
    padding: '12px 16px',
    border: '2px solid #e9ecef',
    borderRadius: '8px',
    fontSize: '1rem',
    marginBottom: '12px',
    transition: 'border-color 0.3s ease',
    boxSizing: 'border-box',
  },
  textarea: {
    width: '100%',
    padding: '12px 16px',
    border: '2px solid #e9ecef',
    borderRadius: '8px',
    fontSize: '1rem',
    marginBottom: '12px',
    transition: 'border-color 0.3s ease',
    resize: 'vertical',
    boxSizing: 'border-box',
  },
  formActions: {
    display: 'flex',
    gap: '16px',
    justifyContent: 'flex-end',
    flexWrap: 'wrap',
  },
  cancelButton: {
    background: 'linear-gradient(135deg, #9e9e9e, #757575)',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    padding: '12px 24px',
    cursor: 'pointer',
    fontSize: '1rem',
    fontWeight: '600',
    transition: 'all 0.3s ease',
  },
  submitButton: {
    background: 'linear-gradient(135deg, #4caf50, #45a049)',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    padding: '12px 24px',
    cursor: 'pointer',
    fontSize: '1rem',
    fontWeight: '600',
    transition: 'all 0.3s ease',
  },
  tableContainer: {
    background: 'white',
    borderRadius: '12px',
    overflow: 'hidden',
    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
    marginBottom: '24px',
  },
  loadingContainer: {
    textAlign: 'center',
    padding: '80px 20px',
    color: '#666',
  },
  loadingSpinner: {
    fontSize: '3rem',
    marginBottom: '20px',
  },
  emptyState: {
    textAlign: 'center',
    padding: '80px 20px',
    color: '#666',
  },
  emptyIcon: {
    fontSize: '4rem',
    marginBottom: '20px',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  tableHeader: {
    background: 'linear-gradient(135deg, #ff9800, #ffb74d)',
  },
  th: {
    padding: '20px 16px',
    textAlign: 'left',
    color: 'white',
    fontWeight: '600',
    fontSize: '1rem',
  },
  tableRow: {
    borderBottom: '1px solid #e9ecef',
    transition: 'background-color 0.2s ease',
  },
  td: {
    padding: '16px',
    verticalAlign: 'top',
  },
  itemDetails: {
    minWidth: '200px',
  },
  itemName: {
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: '4px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    flexWrap: 'wrap',
  },
  itemMeta: {
    fontSize: '0.85rem',
    color: '#6c757d',
    marginBottom: '4px',
  },
  stockInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  stockLevel: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '1.1rem',
  },
  reorderPoint: {
    fontSize: '0.8rem',
    color: '#6c757d',
  },
  priceInfo: {
    fontSize: '0.9rem',
    lineHeight: '1.4',
  },
  totalValue: {
    fontWeight: '600',
    color: '#ff9800',
    marginTop: '4px',
  },
  actionButtons: {
    display: 'flex',
    gap: '8px',
  },
  editButton: {
    background: 'linear-gradient(135deg, #2196f3, #1976d2)',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    padding: '8px 12px',
    cursor: 'pointer',
    fontSize: '0.85rem',
    fontWeight: '600',
    transition: 'all 0.3s ease',
  },
  deleteButton: {
    background: 'linear-gradient(135deg, #f44336, #d32f2f)',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    padding: '8px 12px',
    cursor: 'pointer',
    fontSize: '0.85rem',
    fontWeight: '600',
    transition: 'all 0.3s ease',
  },
  pagination: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '16px',
    padding: '20px',
    background: 'white',
    borderRadius: '12px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
  },
  pageButton: {
    background: 'linear-gradient(135deg, #ff9800, #ffb74d)',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    padding: '10px 20px',
    cursor: 'pointer',
    fontSize: '0.9rem',
    fontWeight: '600',
    transition: 'all 0.3s ease',
  },
  pageInfo: {
    color: '#6c757d',
    fontWeight: '500',
  },
};