import React, { useState, useEffect, useCallback, useMemo } from "react";
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

const syncStatusConfig = {
  checking: { text: "Checking...", color: "bg-blue-100 text-blue-800" },
  syncing: { text: "🔄 Syncing...", color: "bg-orange-100 text-orange-800" },
  synced: { text: "✅ Synced", color: "bg-green-100 text-green-800" },
  offline: { text: "❌ Offline", color: "bg-red-100 text-red-800" }
};

export default function Inventory() {
  const [inventory, setInventory] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [syncStatus, setSyncStatus] = useState("checking");
  const [filter, setFilter] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState(null);

  const loadInventory = useCallback(async () => {
    setLoading(true);
    setSyncStatus("checking");
    try {
      const { data, error } = await supabase
        .from("inventory")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      setInventory(data);
      setSyncStatus("synced");
    } catch (err) {
      setError("Failed to load inventory: " + err.message);
      setSyncStatus("offline");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadInventory();
    const invChannel = supabase
      .channel("inventory_changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "inventory" }, loadInventory)
      .subscribe();
    return () => { supabase.removeChannel(invChannel); };
  }, [loadInventory]);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    if (!form.name || !form.category) {
      setError("Please fill all required fields (name, category)");
      return;
    }
    try {
      setSyncStatus("syncing");
      let res;
      if (!editing) {
        const insertData = { ...form, quantity: Number(form.quantity) };
        delete insertData.id;
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
      setInventory(prev => editing 
        ? prev.map(i => (i.id === res.id ? res : i))
        : [res, ...prev]
      );
      setForm(initialForm);
      setEditing(false);
      setShowForm(false);
      setSyncStatus("synced");
      setError(null);
    } catch (error) {
      setError("Error saving: " + error.message);
      setSyncStatus("offline");
    }
  }, [form, editing]);

  const handleDelete = useCallback(async (id) => {
    if (!window.confirm("Delete this item?")) return;
    try {
      setSyncStatus("syncing");
      await supabase.from("inventory").delete().eq("id", id);
      setInventory(prev => prev.filter(i => i.id !== id));
      setSyncStatus("synced");
      setError(null);
    } catch (error) {
      setError("Error deleting: " + error.message);
      setSyncStatus("offline");
    }
  }, []);

  const handleEdit = useCallback((item) => {
    setForm({
      ...item,
      expiry_date: item.expiry_date ? item.expiry_date.split("T")[0] : "",
    });
    setEditing(true);
    setShowForm(true);
    setError(null);
  }, []);

  const adjustStock = useCallback(async (item, change) => {
    let qty = Number(prompt(`Enter quantity to ${change > 0 ? "add" : "subtract"}:`, 1));
    if (!qty || qty <= 0) return;
    if (change < 0 && qty > item.quantity) {
      setError("Cannot subtract more than available stock.");
      return;
    }
    try {
      setSyncStatus("syncing");
      const updatedQty = item.quantity + change * qty;
      const { data, error } = await supabase
        .from("inventory")
        .update({ quantity: updatedQty })
        .eq("id", item.id)
        .select();
      if (error) throw error;
      setInventory(prev => prev.map(i => i.id === item.id ? { ...i, quantity: updatedQty } : i));
      setSyncStatus("synced");
      setError(null);
    } catch (error) {
      setError("Error updating quantity: " + error.message);
      setSyncStatus("offline");
    }
  }, []);

  const filteredInventory = useMemo(() => 
    inventory.filter(item =>
      filter === "" ||
      item.name?.toLowerCase().includes(filter.toLowerCase()) ||
      item.brand?.toLowerCase().includes(filter.toLowerCase()) ||
      item.model?.toLowerCase().includes(filter.toLowerCase()) ||
      item.category?.toLowerCase().includes(filter.toLowerCase())
    ),
    [inventory, filter]
  );

  const lowStock = useCallback((item) => 
    item.quantity <= (item.reorder_point || item.min_quantity),
    []
  );

  return (
    <div className="min-h-screen bg-amber-50 p-6">
      <div className="container mx-auto max-w-7xl">
        {/* Sync Status and Actions */}
        <div className="flex items-center justify-between mb-6">
          <span className={`inline-block px-4 py-2 rounded-lg font-semibold ${syncStatusConfig[syncStatus].color}`}>
            {syncStatusConfig[syncStatus].text}
          </span>
          <button 
            onClick={loadInventory}
            className="px-4 py-2 bg-gradient-to-r from-amber-500 to-yellow-500 text-white rounded-lg font-semibold hover:from-amber-600 hover:to-yellow-600 transition"
          >
            Refresh
          </button>
        </div>

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-amber-600 flex items-center">
            <img src={logo} alt="logo" className="h-12 mr-2" />
            Inventory Management
          </h1>
          <button 
            onClick={() => { setForm(initialForm); setShowForm(true); setEditing(false); setError(null); }}
            className="px-6 py-3 bg-gradient-to-r from-amber-500 to-yellow-500 text-white rounded-lg font-bold text-lg hover:from-amber-600 hover:to-yellow-600 transition shadow-lg"
          >
            + Add New Item
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-4 bg-red-100 text-red-800 rounded-lg">
            {error}
            <button 
              onClick={() => setError(null)} 
              className="ml-4 text-sm underline"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Search Bar */}
        <input
          type="text"
          placeholder="Search inventory by name, model, brand, category..."
          value={filter}
          onChange={e => setFilter(e.target.value)}
          className="w-full max-w-md mb-6 p-3 border-2 border-amber-200 rounded-lg bg-white focus:outline-none focus:border-amber-400"
        />

        {/* Add/Edit Form */}
        {showForm && (
          <form 
            onSubmit={handleSubmit}
            className="bg-white rounded-xl shadow-lg p-6 mb-6 max-w-3xl mx-auto"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <input
                  placeholder="Component Name *"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  required
                  className="w-full p-3 border-2 border-amber-200 rounded-lg focus:outline-none focus:border-amber-400 mb-3"
                />
                <select
                  value={form.category}
                  onChange={e => setForm({ ...form, category: e.target.value })}
                  required
                  className="w-full p-3 border-2 border-amber-200 rounded-lg focus:outline-none focus:border-amber-400 mb-3"
                >
                  <option value="">Select Category *</option>
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <input
                  placeholder="Brand"
                  value={form.brand}
                  onChange={e => setForm({ ...form, brand: e.target.value })}
                  className="w-full p-3 border-2 border-amber-200 rounded-lg focus:outline-none focus:border-amber-400 mb-3"
                />
                <input
                  placeholder="Model"
                  value={form.model}
                  onChange={e => setForm({ ...form, model: e.target.value })}
                  className="w-full p-3 border-2 border-amber-200 rounded-lg focus:outline-none focus:border-amber-400 mb-3"
                />
                <textarea
                  placeholder="Description"
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  className="w-full p-3 border-2 border-amber-200 rounded-lg focus:outline-none focus:border-amber-400 mb-3 min-h-[80px]"
                />
                <input
                  placeholder="Location"
                  value={form.location}
                  onChange={e => setForm({ ...form, location: e.target.value })}
                  className="w-full p-3 border-2 border-amber-200 rounded-lg focus:outline-none focus:border-amber-400 mb-3"
                />
                <input
                  placeholder="Supplier"
                  value={form.supplier}
                  onChange={e => setForm({ ...form, supplier: e.target.value })}
                  className="w-full p-3 border-2 border-amber-200 rounded-lg focus:outline-none focus:border-amber-400 mb-3"
                />
                <input
                  placeholder="SKU"
                  value={form.sku}
                  onChange={e => setForm({ ...form, sku: e.target.value })}
                  className="w-full p-3 border-2 border-amber-200 rounded-lg focus:outline-none focus:border-amber-400 mb-3"
                />
                <input
                  placeholder="Barcode"
                  value={form.barcode}
                  onChange={e => setForm({ ...form, barcode: e.target.value })}
                  className="w-full p-3 border-2 border-amber-200 rounded-lg focus:outline-none focus:border-amber-400 mb-3"
                />
              </div>
              <div>
                <input
                  type="number"
                  placeholder="Quantity"
                  value={form.quantity}
                  onChange={e => setForm({ ...form, quantity: Number(e.target.value) })}
                  required
                  min={0}
                  className="w-full p-3 border-2 border-amber-200 rounded-lg focus:outline-none focus:border-amber-400 mb-3"
                />
                <input
                  type="number"
                  placeholder="Min. Quantity (Alert)"
                  value={form.min_quantity}
                  onChange={e => setForm({ ...form, min_quantity: Number(e.target.value) })}
                  min={0}
                  className="w-full p-3 border-2 border-amber-200 rounded-lg focus:outline-none focus:border-amber-400 mb-3"
                />
                <input
                  type="number"
                  placeholder="Max. Quantity"
                  value={form.max_quantity}
                  onChange={e => setForm({ ...form, max_quantity: Number(e.target.value) })}
                  min={0}
                  className="w-full p-3 border-2 border-amber-200 rounded-lg focus:outline-none focus:border-amber-400 mb-3"
                />
                <input
                  type="number"
                  placeholder="Reorder Point"
                  value={form.reorder_point}
                  onChange={e => setForm({ ...form, reorder_point: Number(e.target.value) })}
                  min={0}
                  className="w-full p-3 border-2 border-amber-200 rounded-lg focus:outline-none focus:border-amber-400 mb-3"
                />
                <input
                  type="number"
                  placeholder="Unit Price"
                  value={form.unit_price}
                  onChange={e => setForm({ ...form, unit_price: Number(e.target.value) })}
                  min={0}
                  className="w-full p-3 border-2 border-amber-200 rounded-lg focus:outline-none focus:border-amber-400 mb-3"
                />
                <input
                  type="number"
                  placeholder="Selling Price"
                  value={form.selling_price}
                  onChange={e => setForm({ ...form, selling_price: Number(e.target.value) })}
                  min={0}
                  className="w-full p-3 border-2 border-amber-200 rounded-lg focus:outline-none focus:border-amber-400 mb-3"
                />
                <textarea
                  placeholder="Specifications"
                  value={form.specifications}
                  onChange={e => setForm({ ...form, specifications: e.target.value })}
                  className="w-full p-3 border-2 border-amber-200 rounded-lg focus:outline-none focus:border-amber-400 mb-3 min-h-[80px]"
                />
                <input
                  placeholder="Voltage Rating"
                  value={form.voltage_rating}
                  onChange={e => setForm({ ...form, voltage_rating: e.target.value })}
                  className="w-full p-3 border-2 border-amber-200 rounded-lg focus:outline-none focus:border-amber-400 mb-3"
                />
                <input
                  placeholder="Current Rating"
                  value={form.current_rating}
                  onChange={e => setForm({ ...form, current_rating: e.target.value })}
                  className="w-full p-3 border-2 border-amber-200 rounded-lg focus:outline-none focus:border-amber-400 mb-3"
                />
                <input
                  placeholder="Storage Temp"
                  value={form.storage_temp}
                  onChange={e => setForm({ ...form, storage_temp: e.target.value })}
                  className="w-full p-3 border-2 border-amber-200 rounded-lg focus:outline-none focus:border-amber-400 mb-3"
                />
                <input
                  placeholder="Lead Time"
                  value={form.lead_time}
                  onChange={e => setForm({ ...form, lead_time: e.target.value })}
                  className="w-full p-3 border-2 border-amber-200 rounded-lg focus:outline-none focus:border-amber-400 mb-3"
                />
                <input
                  placeholder="Warranty"
                  value={form.warranty}
                  onChange={e => setForm({ ...form, warranty: e.target.value })}
                  className="w-full p-3 border-2 border-amber-200 rounded-lg focus:outline-none focus:border-amber-400 mb-3"
                />
                <input
                  type="date"
                  placeholder="Expiry Date"
                  value={form.expiry_date}
                  onChange={e => setForm({ ...form, expiry_date: e.target.value })}
                  className="w-full p-3 border-2 border-amber-200 rounded-lg focus:outline-none focus:border-amber-400 mb-3"
                />
                <textarea
                  placeholder="Notes"
                  value={form.notes}
                  onChange={e => setForm({ ...form, notes: e.target.value })}
                  className="w-full p-3 border-2 border-amber-200 rounded-lg focus:outline-none focus:border-amber-400 mb-3 min-h-[60px]"
                />
              </div>
            </div>
            <div className="mt-4 flex gap-3">
              <button 
                type="submit"
                className="px-6 py-3 bg-gradient-to-r from-amber-500 to-yellow-500 text-white rounded-lg font-bold text-lg hover:from-amber-600 hover:to-yellow-600 transition shadow-md"
              >
                {editing ? "Update Item" : "Add Item"}
              </button>
              <button 
                type="button"
                onClick={() => { setForm(initialForm); setShowForm(false); setEditing(false); setError(null); }}
                className="px-6 py-3 bg-amber-100 text-amber-600 border-2 border-amber-300 rounded-lg font-semibold hover:bg-amber-200 transition"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {/* Inventory Table */}
        <div className="overflow-x-auto">
          <table className="w-full bg-white rounded-xl shadow-lg border-collapse min-w-[1100px]">
            <thead>
              <tr className="bg-gradient-to-r from-amber-500 to-yellow-500 text-white">
                <th className="p-4 font-bold text-left">Name</th>
                <th className="p-4 font-bold text-left">Category</th>
                <th className="p-4 font-bold text-left">Brand</th>
                <th className="p-4 font-bold text-left">Model</th>
                <th className="p-4 font-bold text-left">Quantity</th>
                <th className="p-4 font-bold text-left">Unit Price</th>
                <th className="p-4 font-bold text-left">Selling Price</th>
                <th className="p-4 font-bold text-left">Location</th>
                <th className="p-4 font-bold text-left">Supplier</th>
                <th className="p-4 font-bold text-left">SKU</th>
                <th className="p-4 font-bold text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={12} className="text-center p-12 text-gray-600">
                    Loading inventory...
                  </td>
                </tr>
              ) : filteredInventory.length === 0 ? (
                <tr>
                  <td colSpan={12} className="text-center p-12 text-gray-600">
                    No items found
                  </td>
                </tr>
              ) : (
                filteredInventory.map(item => (
                  <tr key={item.id} className="border-b-2 border-amber-100 hover:bg-amber-50">
                    <td className="p-4">
                      {item.name}
                      {lowStock(item) && (
                        <span className="ml-2 text-red-700 font-bold">⚠️ Low!</span>
                      )}
                    </td>
                    <td className="p-4">{item.category}</td>
                    <td className="p-4">{item.brand}</td>
                    <td className="p-4">{item.model}</td>
                    <td className={`p-4 font-semibold ${item.quantity <= item.reorder_point ? 'text-red-600' : 'text-blue-600'}`}>
                      {item.quantity}
                      <button 
                        onClick={() => adjustStock(item, -1)} 
                        title="Subtract stock"
                        className="ml-2 px-2 py-1 bg-red-100 text-red-600 rounded hover:bg-red-200"
                      >
                        ➖
                      </button>
                      <button 
                        onClick={() => adjustStock(item, 1)} 
                        title="Add stock"
                        className="ml-1 px-2 py-1 bg-green-100 text-green-600 rounded hover:bg-green-200"
                      >
                        ➕
                      </button>
                    </td>
                    <td className="p-4">Rs. {Number(item.unit_price).toLocaleString()}</td>
                    <td className="p-4">Rs. {Number(item.selling_price).toLocaleString()}</td>
                    <td className="p-4">{item.location}</td>
                    <td className="p-4">{item.supplier}</td>
                    <td className="p-4">{item.sku}</td>
                    <td className="p-4">
                      <button 
                        onClick={() => handleEdit(item)}
                        className="px-3 py-1 bg-teal-100 text-teal-800 border border-teal-300 rounded mr-2 hover:bg-teal-200 transition"
                      >
                        ✏️ Edit
                      </button>
                      <button 
                        onClick={() => handleDelete(item.id)}
                        className="px-3 py-1 bg-red-100 text-red-800 border border-red-300 rounded hover:bg-red-200 transition"
                      >
                        🗑️ Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}