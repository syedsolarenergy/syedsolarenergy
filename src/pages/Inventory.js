import React, { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";

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
  "Solar Panels", "Inverters", "Batteries", "Mounting Systems", "Cables & Wires", 
  "Monitoring Systems", "Electrical Components", "Safety Equipment", "Tools",
  "Transistors", "Capacitors", "Diodes", "Fuses", "Contactors", "Heat Sinks",
  "Connectors", "Relays", "Breakers", "Controllers", "Others"
];

export default function Inventory() {
  const [inventory, setInventory] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [syncStatus, setSyncStatus] = useState("loading");
  const [filter, setFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);
  const [showLowStockOnly, setShowLowStockOnly] = useState(false);

  // Real-time subscription
  useEffect(() => {
    loadInventory();
    
    // Set up real-time subscription
    const channel = supabase
      .channel('inventory_changes')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'inventory' 
      }, (payload) => {
        console.log('Real-time update:', payload);
        loadInventory(); // Reload data on any change
      })
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Load inventory from Supabase only
  async function loadInventory() {
    setLoading(true);
    setSyncStatus("loading");
    
    try {
      const { data, error } = await supabase
        .from("inventory")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      
      setInventory(data || []);
      setSyncStatus("synced");
      
    } catch (err) {
      console.error("Error loading inventory:", err);
      setSyncStatus("error");
      
      // Don't fall back to localStorage - keep current state
      if (inventory.length === 0) {
        setInventory([]);
      }
    } finally {
      setLoading(false);
    }
  }

  // Add or update item
  async function handleSubmit(e) {
    e.preventDefault();
    
    if (!form.name || !form.category) {
      alert("Please fill all required fields (name, category)");
      return;
    }
    
    setSyncStatus("syncing");
    
    try {
      const formData = {
        ...form,
        quantity: Number(form.quantity) || 0,
        min_quantity: Number(form.min_quantity) || 0,
        max_quantity: Number(form.max_quantity) || 999,
        reorder_point: Number(form.reorder_point) || 0,
        unit_price: Number(form.unit_price) || 0,
        selling_price: Number(form.selling_price) || 0,
        updated_at: new Date().toISOString()
      };
      
      let result;
      
      if (!editing) {
        // Insert new item
        delete formData.id; // Remove id for insert
        const { data, error } = await supabase
          .from("inventory")
          .insert([formData])
          .select();
        
        if (error) throw error;
        result = data[0];
        
      } else {
        // Update existing item - exclude id from update object
        const { id, ...updateData } = formData;
        
        const { data, error } = await supabase
          .from("inventory")
          .update(updateData)
          .eq("id", id)
          .select();
        
        if (error) throw error;
        result = data[0];
      }
      
      // Update local state immediately for better UX
      if (!editing) {
        setInventory(prev => [result, ...prev]);
      } else {
        setInventory(prev => prev.map(item => 
          item.id === result.id ? result : item
        ));
      }
      
      // Reset form and close
      setForm(initialForm);
      setEditing(false);
      setShowForm(false);
      setSyncStatus("synced");
      
      alert(`✅ Item ${editing ? 'updated' : 'added'} successfully!`);
      
    } catch (error) {
      console.error("Error saving item:", error);
      setSyncStatus("error");
      alert(`❌ Error ${editing ? 'updating' : 'adding'} item: ${error.message}`);
    }
  }

  // Delete item
  async function handleDelete(id) {
    if (!window.confirm("Are you sure you want to delete this item? This action cannot be undone.")) {
      return;
    }
    
    setSyncStatus("syncing");
    
    try {
      const { error } = await supabase
        .from("inventory")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
      
      // Update local state immediately
      setInventory(prev => prev.filter(item => item.id !== id));
      setSyncStatus("synced");
      alert("✅ Item deleted successfully!");
      
    } catch (error) {
      console.error("Error deleting item:", error);
      setSyncStatus("error");
      alert(`❌ Error deleting item: ${error.message}`);
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

  // Quick stock adjustment
  async function adjustStock(item, change) {
    const qty = Number(prompt(`Enter quantity to ${change > 0 ? "add" : "subtract"}:`, 1));
    
    if (!qty || qty <= 0) return;
    
    if (change < 0 && qty > item.quantity) {
      alert("Cannot subtract more than available stock.");
      return;
    }
    
    const updatedQty = Math.max(0, item.quantity + (change * qty));
    
    setSyncStatus("syncing");
    
    try {
      const { data, error } = await supabase
        .from("inventory")
        .update({ 
          quantity: updatedQty,
          updated_at: new Date().toISOString()
        })
        .eq("id", item.id)
        .select();
      
      if (error) throw error;
      
      // Update local state
      setInventory(prev => prev.map(inv => 
        inv.id === item.id ? { ...inv, quantity: updatedQty } : inv
      ));
      
      setSyncStatus("synced");
      
    } catch (error) {
      console.error("Error updating stock:", error);
      setSyncStatus("error");
      alert(`❌ Error updating stock: ${error.message}`);
    }
  }

  // Bulk operations
  async function handleBulkDelete(selectedIds) {
    if (!window.confirm(`Delete ${selectedIds.length} selected items?`)) return;
    
    setSyncStatus("syncing");
    
    try {
      const { error } = await supabase
        .from("inventory")
        .delete()
        .in("id", selectedIds);
      
      if (error) throw error;
      
      setInventory(prev => prev.filter(item => !selectedIds.includes(item.id)));
      setSyncStatus("synced");
      alert("✅ Items deleted successfully!");
      
    } catch (error) {
      console.error("Error bulk deleting:", error);
      setSyncStatus("error");
      alert(`❌ Error deleting items: ${error.message}`);
    }
  }

  // Enhanced filtering and sorting
  const getFilteredAndSortedInventory = () => {
    let filtered = inventory.filter(item => {
      const matchesSearch = filter === "" ||
        item.name?.toLowerCase().includes(filter.toLowerCase()) ||
        item.brand?.toLowerCase().includes(filter.toLowerCase()) ||
        item.model?.toLowerCase().includes(filter.toLowerCase()) ||
        item.sku?.toLowerCase().includes(filter.toLowerCase()) ||
        item.supplier?.toLowerCase().includes(filter.toLowerCase());
      
      const matchesCategory = categoryFilter === "all" || item.category === categoryFilter;
      
      const matchesLowStock = !showLowStockOnly || isLowStock(item);
      
      return matchesSearch && matchesCategory && matchesLowStock;
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

  // Check if item is low stock
  const isLowStock = (item) => {
    const threshold = item.reorder_point || item.min_quantity || 5;
    return item.quantity <= threshold;
  };

  // Get statistics
  const getInventoryStats = () => {
    const totalItems = inventory.length;
    const totalValue = inventory.reduce((sum, item) => 
      sum + (item.quantity * item.unit_price), 0);
    const lowStockCount = inventory.filter(isLowStock).length;
    const outOfStockCount = inventory.filter(item => item.quantity === 0).length;
    
    return { totalItems, totalValue, lowStockCount, outOfStockCount };
  };

  const stats = getInventoryStats();
  const filteredInventory = getFilteredAndSortedInventory();
  
  // Pagination
  const totalPages = Math.ceil(filteredInventory.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedInventory = filteredInventory.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerContent}>
          <div>
            <h1 style={styles.title}>📦 Inventory Management</h1>
            <p style={styles.subtitle}>
              Comprehensive stock management for your solar business
            </p>
            <div style={styles.syncStatus}>
              <span style={{
                color: syncStatus === "synced" ? "#4caf50" : 
                       syncStatus === "loading" ? "#ff9800" : 
                       syncStatus === "syncing" ? "#2196f3" : "#f44336"
              }}>
                {syncStatus === "synced" ? "✅ Database synced" : 
                 syncStatus === "loading" ? "🔄 Loading inventory..." : 
                 syncStatus === "syncing" ? "🔄 Syncing changes..." : "❌ Sync error"}
              </span>
            </div>
          </div>
          
          <div style={styles.headerActions}>
            <button
              onClick={loadInventory}
              disabled={loading}
              style={styles.refreshButton}
            >
              {loading ? "🔄 Loading..." : "🔄 Refresh"}
            </button>
            <button
              onClick={() => {
                setForm(initialForm);
                setEditing(false);
                setShowForm(true);
              }}
              style={styles.addButton}
            >
              ➕ Add New Item
            </button>
          </div>
        </div>
      </div>
      
      {/* Statistics Cards */}
      <div style={styles.statsGrid}>
        <StatCard 
          icon="📦" 
          title="Total Items" 
          value={stats.totalItems}
          subtitle="In inventory"
          color="#2196f3"
        />
        <StatCard 
          icon="💰" 
          title="Total Value" 
          value={`Rs ${stats.totalValue.toLocaleString()}`}
          subtitle="Inventory worth"
          color="#4caf50"
        />
        <StatCard 
          icon="⚠️" 
          title="Low Stock" 
          value={stats.lowStockCount}
          subtitle="Items need reorder"
          color="#ff9800"
        />
        <StatCard 
          icon="❌" 
          title="Out of Stock" 
          value={stats.outOfStockCount}
          subtitle="Items unavailable"
          color="#f44336"
        />
      </div>
      
      {/* Filters and Controls */}
      <div style={styles.controlsSection}>
        <div style={styles.filtersContainer}>
          <input
            type="text"
            placeholder="🔍 Search inventory..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            style={styles.searchInput}
          />
          
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            style={styles.filterSelect}
          >
            <option value="all">All Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            style={styles.filterSelect}
          >
            <option value="name">Sort by Name</option>
            <option value="category">Sort by Category</option>
            <option value="quantity">Sort by Quantity</option>
            <option value="unit_price">Sort by Price</option>
            <option value="created_at">Sort by Date Added</option>
          </select>
          
          <button
            onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
            style={styles.sortButton}
            title={`Sort ${sortOrder === "asc" ? "Descending" : "Ascending"}`}
          >
            {sortOrder === "asc" ? "↑" : "↓"}
          </button>
          
          <label style={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={showLowStockOnly}
              onChange={(e) => setShowLowStockOnly(e.target.checked)}
              style={styles.checkbox}
            />
            Low Stock Only
          </label>
        </div>
        
        <div style={styles.resultsInfo}>
          Showing {paginatedInventory.length} of {filteredInventory.length} items
        </div>
      </div>
      
      {/* Add/Edit Form Modal */}
      {showForm && (
        <div style={styles.modal}>
          <div style={styles.modalContent}>
            <div style={styles.modalHeader}>
              <h2>{editing ? "✏️ Edit Item" : "➕ Add New Item"}</h2>
              <button 
                onClick={() => {
                  setForm(initialForm);
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
                {/* Basic Information */}
                <div style={styles.formSection}>
                  <h3 style={styles.sectionTitle}>📋 Basic Information</h3>
                  <input
                    placeholder="Item Name *"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                    style={styles.input}
                  />
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    required
                    style={styles.input}
                  >
                    <option value="">Select Category *</option>
                    {categories.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                  <input
                    placeholder="Brand"
                    value={form.brand}
                    onChange={(e) => setForm({ ...form, brand: e.target.value })}
                    style={styles.input}
                  />
                  <input
                    placeholder="Model"
                    value={form.model}
                    onChange={(e) => setForm({ ...form, model: e.target.value })}
                    style={styles.input}
                  />
                  <textarea
                    placeholder="Description"
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    style={styles.textarea}
                    rows="3"
                  />
                </div>
                
                {/* Inventory Details */}
                <div style={styles.formSection}>
                  <h3 style={styles.sectionTitle}>📊 Inventory Details</h3>
                  <input
                    type="number"
                    placeholder="Current Quantity *"
                    value={form.quantity}
                    onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) })}
                    required
                    min="0"
                    style={styles.input}
                  />
                  <input
                    type="number"
                    placeholder="Minimum Quantity"
                    value={form.min_quantity}
                    onChange={(e) => setForm({ ...form, min_quantity: Number(e.target.value) })}
                    min="0"
                    style={styles.input}
                  />
                  <input
                    type="number"
                    placeholder="Reorder Point"
                    value={form.reorder_point}
                    onChange={(e) => setForm({ ...form, reorder_point: Number(e.target.value) })}
                    min="0"
                    style={styles.input}
                  />
                  <input
                    type="number"
                    placeholder="Maximum Quantity"
                    value={form.max_quantity}
                    onChange={(e) => setForm({ ...form, max_quantity: Number(e.target.value) })}
                    min="0"
                    style={styles.input}
                  />
                </div>
                
                {/* Pricing */}
                <div style={styles.formSection}>
                  <h3 style={styles.sectionTitle}>💰 Pricing</h3>
                  <input
                    type="number"
                    placeholder="Unit Price (Rs)"
                    value={form.unit_price}
                    onChange={(e) => setForm({ ...form, unit_price: Number(e.target.value) })}
                    min="0"
                    step="0.01"
                    style={styles.input}
                  />
                  <input
                    type="number"
                    placeholder="Selling Price (Rs)"
                    value={form.selling_price}
                    onChange={(e) => setForm({ ...form, selling_price: Number(e.target.value) })}
                    min="0"
                    step="0.01"
                    style={styles.input}
                  />
                </div>
                
                {/* Additional Details */}
                <div style={styles.formSection}>
                  <h3 style={styles.sectionTitle}>📝 Additional Details</h3>
                  <input
                    placeholder="Storage Location"
                    value={form.location}
                    onChange={(e) => setForm({ ...form, location: e.target.value })}
                    style={styles.input}
                  />
                  <input
                    placeholder="Supplier"
                    value={form.supplier}
                    onChange={(e) => setForm({ ...form, supplier: e.target.value })}
                    style={styles.input}
                  />
                  <input
                    placeholder="SKU"
                    value={form.sku}
                    onChange={(e) => setForm({ ...form, sku: e.target.value })}
                    style={styles.input}
                  />
                  <input
                    placeholder="Barcode"
                    value={form.barcode}
                    onChange={(e) => setForm({ ...form, barcode: e.target.value })}
                    style={styles.input}
                  />
                  <input
                    type="date"
                    placeholder="Expiry Date"
                    value={form.expiry_date}
                    onChange={(e) => setForm({ ...form, expiry_date: e.target.value })}
                    style={styles.input}
                  />
                  <textarea
                    placeholder="Additional Notes"
                    value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                    style={styles.textarea}
                    rows="2"
                  />
                </div>
              </div>
              
              <div style={styles.formActions}>
                <button
                  type="button"
                  onClick={() => {
                    setForm(initialForm);
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
                   editing ? "💾 Update Item" : "➕ Add Item"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Inventory Table */}
      <div style={styles.tableContainer}>
        {loading ? (
          <div style={styles.loadingContainer}>
            <div style={styles.loadingSpinner}>⏳</div>
            <h3>Loading Inventory...</h3>
            <p>Fetching latest stock information...</p>
          </div>
        ) : paginatedInventory.length === 0 ? (
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}>📦</div>
            <h3>No items found</h3>
            <p>
              {filter || categoryFilter !== "all" || showLowStockOnly
                ? "Try adjusting your search filters"
                : "Add your first inventory item to get started"
              }
            </p>
            <button
              onClick={() => {
                setForm(initialForm);
                setEditing(false);
                setShowForm(true);
              }}
              style={styles.addButton}
            >
              ➕ Add First Item
            </button>
          </div>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr style={styles.tableHeader}>
                <th style={styles.th}>Item Details</th>
                <th style={styles.th}>Category</th>
                <th style={styles.th}>Stock Level</th>
                <th style={styles.th}>Pricing</th>
                <th style={styles.th}>Location</th>
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedInventory.map((item) => (
                <tr key={item.id} style={styles.tableRow}>
                  <td style={styles.td}>
                    <div style={styles.itemDetails}>
                      <div style={styles.itemName}>
                        {item.name}
                        {isLowStock(item) && (
                          <span style={styles.lowStockBadge}>⚠️ Low</span>
                        )}
                        {item.quantity === 0 && (
                          <span style={styles.outOfStockBadge}>❌ Out</span>
                        )}
                      </div>
                      <div style={styles.itemMeta}>
                        {item.brand && <span>{item.brand}</span>}
                        {item.model && <span> • {item.model}</span>}
                        {item.sku && <span> • SKU: {item.sku}</span>}
                      </div>
                    </div>
                  </td>
                  <td style={styles.td}>
                    <span style={styles.categoryBadge}>{item.category}</span>
                  </td>
                  <td style={styles.td}>
                    <div style={styles.stockInfo}>
                      <div style={styles.stockLevel}>
                        <span style={{
                          fontWeight: 'bold',
                          color: item.quantity === 0 ? '#f44336' : 
                                 isLowStock(item) ? '#ff9800' : '#4caf50'
                        }}>
                          {item.quantity}
                        </span>
                        {item.reorder_point > 0 && (
                          <span style={styles.reorderPoint}>
                            (Min: {item.reorder_point})
                          </span>
                        )}
                      </div>
                      <div style={styles.stockActions}>
                        <button
                          onClick={() => adjustStock(item, -1)}
                          style={styles.stockButton}
                          title="Remove stock"
                          disabled={item.quantity === 0}
                        >
                          ➖
                        </button>
                        <button
                          onClick={() => adjustStock(item, 1)}
                          style={styles.stockButton}
                          title="Add stock"
                        >
                          ➕
                        </button>
                      </div>
                    </div>
                  </td>
                  <td style={styles.td}>
                    <div style={styles.priceInfo}>
                      <div>Cost: Rs {item.unit_price?.toLocaleString() || 0}</div>
                      <div>Sell: Rs {item.selling_price?.toLocaleString() || 0}</div>
                      <div style={styles.totalValue}>
                        Total: Rs {((item.quantity || 0) * (item.unit_price || 0)).toLocaleString()}
                      </div>
                    </div>
                  </td>
                  <td style={styles.td}>
                    <div>{item.location || 'Not specified'}</div>
                    {item.supplier && (
                      <div style={styles.supplier}>Supplier: {item.supplier}</div>
                    )}
                  </td>
                  <td style={styles.td}>
                    <div style={styles.actionButtons}>
                      <button
                        onClick={() => handleEdit(item)}
                        style={styles.editButton}
                        title="Edit item"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        style={styles.deleteButton}
                        title="Delete item"
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
    background: 'linear-gradient(135deg, #FF6B35, #F7931E)',
    borderRadius: '16px',
    padding: '32px',
    marginBottom: '32px',
    color: 'white',
    boxShadow: '0 10px 40px rgba(255, 107, 53, 0.3)',
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
    color: '#FF6B35',
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
  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '0.9rem',
    fontWeight: '500',
    cursor: 'pointer',
  },
  checkbox: {
    width: '16px',
    height: '16px',
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
    background: 'linear-gradient(135deg, #FF6B35, #F7931E)',
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
    color: '#FF6B35',
    marginBottom: '16px',
    paddingBottom: '8px',
    borderBottom: '2px solid #FFE0CC',
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
    background: 'linear-gradient(135deg, #FF6B35, #F7931E)',
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
  },
  lowStockBadge: {
    background: '#fff3cd',
    color: '#856404',
    padding: '2px 8px',
    borderRadius: '12px',
    fontSize: '0.75rem',
    fontWeight: '600',
    border: '1px solid #ffeaa7',
  },
  outOfStockBadge: {
    background: '#f8d7da',
    color: '#721c24',
    padding: '2px 8px',
    borderRadius: '12px',
    fontSize: '0.75rem',
    fontWeight: '600',
    border: '1px solid #f5c6cb',
  },
  categoryBadge: {
    background: '#e3f2fd',
    color: '#1976d2',
    padding: '4px 12px',
    borderRadius: '16px',
    fontSize: '0.85rem',
    fontWeight: '500',
    display: 'inline-block',
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
  stockActions: {
    display: 'flex',
    gap: '4px',
  },
  stockButton: {
    background: '#f8f9fa',
    border: '1px solid #dee2e6',
    borderRadius: '6px',
    padding: '4px 8px',
    cursor: 'pointer',
    fontSize: '0.8rem',
    transition: 'all 0.2s ease',
  },
  priceInfo: {
    fontSize: '0.9rem',
    lineHeight: '1.4',
  },
  totalValue: {
    fontWeight: '600',
    color: '#FF6B35',
    marginTop: '4px',
  },
  supplier: {
    fontSize: '0.8rem',
    color: '#6c757d',
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
    background: 'linear-gradient(135deg, #FF6B35, #F7931E)',
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