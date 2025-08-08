import React, { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell } from "recharts";
import { supabase } from "../supabaseClient";

const sources = [
  { value: "project", label: "Project" },
  { value: "repair", label: "Repair" },
  { value: "customer", label: "Customer" },
  { value: "general", label: "General" },
];

const types = [
  { value: "credit", label: "Credit (Received)" },
  { value: "debit", label: "Debit (Expense)" },
];

const COLORS = ['#43a047', '#e65100', '#2196f3', '#9c27b0'];

export default function Expenses() {
  // -- State --
  const [expenses, setExpenses] = useState([]);
  const [activeTab, setActiveTab] = useState("general");
  const [form, setForm] = useState({
    type: "debit",
    name: "",
    amount: "",
    source: "general",
    details: "",
    date: "",
    time: "",
    remarks: "",
  });
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [syncStatus, setSyncStatus] = useState("synced");

  // -- Fetch Expenses on Mount --
  useEffect(() => {
    fetchExpenses();
    
    // Set up real-time subscription
    const channel = supabase
      .channel('expenses-changes')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'expenses' 
      }, (payload) => {
        console.log('Real-time update:', payload);
        fetchExpenses();
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  async function fetchExpenses() {
    setLoading(true);
    setSyncStatus("loading");
    
    try {
      const { data, error } = await supabase
        .from("expenses")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      setExpenses(data || []);
      setSyncStatus("synced");
    } catch (err) {
      console.error("Error fetching expenses:", err);
      setSyncStatus("error");
    } finally {
      setLoading(false);
    }
  }

  // --- Calculations for Dashboard ---
  const totalCredit = expenses.filter(e => e.type === "credit").reduce((sum, e) => sum + (e.amount || 0), 0);
  const totalDebit = expenses.filter(e => e.type === "debit").reduce((sum, e) => sum + (e.amount || 0), 0);
  const totalProfit = totalCredit - totalDebit;

  // Tab-specific calculations
  const getTabData = (tab) => {
    const tabExpenses = expenses.filter(e => e.source === tab);
    const credit = tabExpenses.filter(e => e.type === "credit").reduce((sum, e) => sum + (e.amount || 0), 0);
    const debit = tabExpenses.filter(e => e.type === "debit").reduce((sum, e) => sum + (e.amount || 0), 0);
    const profit = credit - debit;
    return { credit, debit, profit, expenses: tabExpenses };
  };

  const projectData = getTabData("project");
  const repairData = getTabData("repair");
  const customerData = getTabData("customer");
  const generalData = getTabData("general");

  // Chart Data by Month
  const chartData = [];
  const monthly = {};
  expenses.forEach(e => {
    if (!e.date) return;
    const [y, m] = (e.date.length === 10 ? e.date.split("-") : ["", ""]);
    const month = y && m ? `${y}-${m}` : "N/A";
    if (!monthly[month]) monthly[month] = { month, Credit: 0, Debit: 0 };
    if (e.type === "credit") monthly[month].Credit += e.amount || 0;
    else monthly[month].Debit += e.amount || 0;
  });
  Object.values(monthly).forEach(m => chartData.push(m));

  // Pie chart data for sources
  const pieData = sources.map(source => {
    const sourceExpenses = expenses.filter(e => e.source === source.value);
    const total = sourceExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);
    return { name: source.label, value: total };
  });

  // --- Handlers ---
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setForm(prev => ({ ...prev, source: tab }));
  };

  // --- Submit (Add New Expense to Supabase) ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.amount || !form.type || !form.source || !form.date || !form.time)
      return alert("Please fill all required fields.");
    
    setSyncStatus("syncing");
    
    try {
      const newExpense = {
        ...form,
        amount: parseFloat(form.amount),
        created_at: new Date().toISOString(),
      };
      
      const { data, error } = await supabase.from("expenses").insert([newExpense]).select();
      if (error) throw error;
      
      setExpenses([data[0], ...expenses]);
      setForm({
        type: "debit",
        name: "",
        amount: "",
        source: activeTab,
        details: "",
        date: "",
        time: "",
        remarks: "",
      });
      setSyncStatus("synced");
    } catch (error) {
      console.error("Error adding expense:", error);
      setSyncStatus("error");
      alert("❌ Could not add: " + error.message);
    }
  };

  // --- Delete Expense ---
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this entry?")) return;
    
    setSyncStatus("syncing");
    
    try {
      const { error } = await supabase.from("expenses").delete().eq("id", id);
      if (error) throw error;
      
      setExpenses(prev => prev.filter(e => e.id !== id));
      setSyncStatus("synced");
    } catch (error) {
      console.error("Error deleting expense:", error);
      setSyncStatus("error");
      alert("❌ Could not delete: " + error.message);
    }
  };

  // --- Edit Expense ---
  const startEditing = (expense) => {
    setEditingId(expense.id);
    setEditForm(expense);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({ ...prev, [name]: value }));
  };

  const saveEditing = async () => {
    if (!editForm.name || !editForm.amount || !editForm.type || !editForm.source || !editForm.date || !editForm.time)
      return alert("Please fill all required fields.");
    
    setSyncStatus("syncing");
    
    try {
      const { id, ...updateData } = editForm;
      updateData.amount = parseFloat(updateData.amount);
      
      const { error } = await supabase
        .from("expenses")
        .update(updateData)
        .eq("id", id);
      
      if (error) throw error;
      
      setExpenses(prev => prev.map(e => e.id === id ? { ...e, ...updateData } : e));
      setEditingId(null);
      setSyncStatus("synced");
    } catch (error) {
      console.error("Error updating expense:", error);
      setSyncStatus("error");
      alert("❌ Could not update: " + error.message);
    }
  };

  const cancelEditing = () => {
    setEditingId(null);
  };

  // Current tab data
  const currentTabData = getTabData(activeTab);

  return (
    <div style={{ background: "#fff6ec", minHeight: "100vh", padding: "0 0 30px 0" }}>
      {/* Sync Status Bar */}
      <div style={{ 
        padding: "8px 20px", 
        background: syncStatus === "synced" ? "#e8f5e9" : 
                   syncStatus === "syncing" ? "#fff3e0" : 
                   syncStatus === "error" ? "#ffebee" : "#f5f5f5",
        color: syncStatus === "synced" ? "#2e7d32" : 
               syncStatus === "syncing" ? "#e65100" : 
               syncStatus === "error" ? "#c62828" : "#757575",
        fontWeight: 600,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center"
      }}>
        <span>
          {syncStatus === "synced" ? "✅ All changes saved" : 
           syncStatus === "syncing" ? "🔄 Syncing..." : 
           syncStatus === "error" ? "❌ Sync error" : "⏳ Loading..."}
        </span>
        <button 
          onClick={fetchExpenses}
          style={{
            background: "none",
            border: "none",
            color: syncStatus === "synced" ? "#2e7d32" : 
                   syncStatus === "syncing" ? "#e65100" : 
                   syncStatus === "error" ? "#c62828" : "#757575",
            cursor: "pointer",
            fontWeight: 600,
          }}
        >
          Refresh
        </button>
      </div>

      <h2 style={{ textAlign: "center", color: "#ff9800", margin: "25px 0 10px 0", fontWeight: 900 }}>💰 Expense & Profit Dashboard</h2>
      
      {/* Main Dashboard */}
      <div style={{
        display: "flex",
        justifyContent: "center",
        gap: 30,
        margin: "0 auto 26px auto",
        flexWrap: "wrap"
      }}>
        <Widget title="Total Credits" value={totalCredit} color="#43a047" />
        <Widget title="Total Expenses" value={totalDebit} color="#e65100" />
        <Widget title="Total Profit" value={totalProfit} color="#ff9800" />
      </div>

      {/* Charts */}
      <div style={{
        display: "flex",
        gap: 20,
        margin: "0 auto 30px auto",
        flexWrap: "wrap",
        justifyContent: "center"
      }}>
        <div style={{ 
          width: "98%", 
          maxWidth: 620, 
          background: "#fff", 
          borderRadius: 13, 
          boxShadow: "0 4px 22px #ff980016", 
          padding: "20px 18px" 
        }}>
          <h4 style={{ color: "#FF9800", marginBottom: 0, fontWeight: 800 }}>Monthly Credit vs Expense</h4>
          <ResponsiveContainer width="100%" height={230}>
            <BarChart data={chartData}>
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => [`Rs ${value}`, '']} />
              <Legend />
              <Bar dataKey="Credit" fill="#43a047" radius={6} />
              <Bar dataKey="Debit" fill="#e65100" radius={6} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div style={{ 
          width: "98%", 
          maxWidth: 400, 
          background: "#fff", 
          borderRadius: 13, 
          boxShadow: "0 4px 22px #ff980016", 
          padding: "20px 18px" 
        }}>
          <h4 style={{ color: "#FF9800", marginBottom: 0, fontWeight: 800 }}>Expenses by Source</h4>
          <ResponsiveContainer width="100%" height={230}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [`Rs ${value}`, '']} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ 
        display: "flex", 
        justifyContent: "center", 
        gap: 10, 
        margin: "0 auto 20px auto",
        flexWrap: "wrap"
      }}>
        {sources.map(source => (
          <button
            key={source.value}
            onClick={() => handleTabChange(source.value)}
            style={{
              background: activeTab === source.value ? "#ff9800" : "#fff",
              color: activeTab === source.value ? "#fff" : "#ff9800",
              border: "2px solid #ff9800",
              borderRadius: "8px",
              padding: "10px 20px",
              fontWeight: 700,
              cursor: "pointer",
              transition: "all 0.3s ease",
            }}
          >
            {source.label}
          </button>
        ))}
      </div>

      {/* Tab-specific Mini Dashboard */}
      <div style={{
        display: "flex",
        justifyContent: "center",
        gap: 20,
        margin: "0 auto 20px auto",
        flexWrap: "wrap"
      }}>
        <Widget title={`${sources.find(s => s.value === activeTab)?.label} Credits`} value={currentTabData.credit} color="#43a047" />
        <Widget title={`${sources.find(s => s.value === activeTab)?.label} Expenses`} value={currentTabData.debit} color="#e65100" />
        <Widget title={`${sources.find(s => s.value === activeTab)?.label} Profit`} value={currentTabData.profit} color="#ff9800" />
      </div>

      {/* Add Money Form */}
      <div style={{ 
        background: "#fff", 
        padding: 23, 
        borderRadius: 12, 
        maxWidth: 530, 
        margin: "0 auto 18px auto", 
        boxShadow: "0 2px 15px #ff980018" 
      }}>
        <h4 style={{ color: "#ff9800", fontWeight: 800, marginBottom: 9 }}>
          Add {activeTab === "credit" ? "Income" : "Expense"} for {sources.find(s => s.value === activeTab)?.label}
        </h4>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexWrap: "wrap", gap: 14 }}>
          <select name="type" value={form.type} onChange={handleChange} style={inputStyle}>
            {types.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
          </select>
          <input 
            name="name" 
            value={form.name} 
            onChange={handleChange} 
            style={inputStyle} 
            placeholder="Title" 
            required 
          />
          <input 
            name="amount" 
            value={form.amount} 
            onChange={handleChange} 
            type="number" 
            min="1" 
            style={inputStyle} 
            placeholder="Amount (Rs)" 
            required 
          />
          <input 
            name="details" 
            value={form.details} 
            onChange={handleChange} 
            style={inputStyle} 
            placeholder="Details" 
          />
          <input 
            name="date" 
            value={form.date} 
            onChange={handleChange} 
            type="date" 
            style={inputStyle} 
            required 
          />
          <input 
            name="time" 
            value={form.time} 
            onChange={handleChange} 
            type="time" 
            style={inputStyle} 
            required 
          />
          <input 
            name="remarks" 
            value={form.remarks} 
            onChange={handleChange} 
            style={inputStyle} 
            placeholder="Remarks" 
          />
          <button 
            type="submit" 
            style={{
              background: "linear-gradient(90deg,#ff9800,#ff6b35)",
              color: "#fff", 
              padding: "10px 32px",
              border: "none", 
              borderRadius: 9, 
              fontWeight: 700, 
              fontSize: 16, 
              cursor: "pointer", 
              boxShadow: "0 2px 11px #ff980032"
            }}
          >
            Add
          </button>
        </form>
      </div>

      {/* Expense Table */}
      <div style={{ maxWidth: 980, margin: "0 auto", overflowX: "auto" }}>
        <table style={{
          width: "100%",
          background: "#fff",
          borderCollapse: "collapse",
          boxShadow: "0 1px 7px #ff980011",
          borderRadius: 9,
          overflow: "hidden"
        }}>
          <thead style={{ background: "#fffde4" }}>
            <tr>
              <th>#</th>
              <th>Type</th>
              <th>Title</th>
              <th>Amount (Rs)</th>
              <th>Details</th>
              <th>Date</th>
              <th>Time</th>
              <th>Remarks</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={9} style={{ textAlign: "center", color: "#aaa" }}>Loading...</td></tr>
            ) : currentTabData.expenses.length === 0 ? (
              <tr><td colSpan={9} style={{ textAlign: "center", color: "#aaa" }}>No data yet for {sources.find(s => s.value === activeTab)?.label}.</td></tr>
            ) : currentTabData.expenses.map((exp) => (
              <tr key={exp.id}>
                {editingId === exp.id ? (
                  <>
                    <td>{exp.id}</td>
                    <td>
                      <select 
                        name="type" 
                        value={editForm.type} 
                        onChange={handleEditChange} 
                        style={inputStyle}
                      >
                        {types.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                      </select>
                    </td>
                    <td>
                      <input 
                        name="name" 
                        value={editForm.name} 
                        onChange={handleEditChange} 
                        style={inputStyle} 
                        required 
                      />
                    </td>
                    <td>
                      <input 
                        name="amount" 
                        value={editForm.amount} 
                        onChange={handleEditChange} 
                        type="number" 
                        min="1" 
                        style={inputStyle} 
                        required 
                      />
                    </td>
                    <td>
                      <input 
                        name="details" 
                        value={editForm.details} 
                        onChange={handleEditChange} 
                        style={inputStyle} 
                      />
                    </td>
                    <td>
                      <input 
                        name="date" 
                        value={editForm.date} 
                        onChange={handleEditChange} 
                        type="date" 
                        style={inputStyle} 
                        required 
                      />
                    </td>
                    <td>
                      <input 
                        name="time" 
                        value={editForm.time} 
                        onChange={handleEditChange} 
                        type="time" 
                        style={inputStyle} 
                        required 
                      />
                    </td>
                    <td>
                      <input 
                        name="remarks" 
                        value={editForm.remarks} 
                        onChange={handleEditChange} 
                        style={inputStyle} 
                      />
                    </td>
                    <td>
                      <button 
                        onClick={saveEditing} 
                        style={{ 
                          background: "#4caf50", 
                          color: "white", 
                          border: "none", 
                          borderRadius: "4px", 
                          padding: "4px 8px", 
                          marginRight: "5px",
                          cursor: "pointer"
                        }}
                      >
                        Save
                      </button>
                      <button 
                        onClick={cancelEditing} 
                        style={{ 
                          background: "#f44336", 
                          color: "white", 
                          border: "none", 
                          borderRadius: "4px", 
                          padding: "4px 8px",
                          cursor: "pointer"
                        }}
                      >
                        Cancel
                      </button>
                    </td>
                  </>
                ) : (
                  <>
                    <td>{exp.id}</td>
                    <td style={{ 
                      color: exp.type === "credit" ? "#43a047" : "#e65100", 
                      fontWeight: 700 
                    }}>
                      {exp.type === "credit" ? "Credit" : "Debit"}
                    </td>
                    <td>{exp.name}</td>
                    <td>{exp.amount}</td>
                    <td>{exp.details}</td>
                    <td>{exp.date}</td>
                    <td>{exp.time}</td>
                    <td>{exp.remarks}</td>
                    <td>
                      <button 
                        onClick={() => startEditing(exp)} 
                        style={{ 
                          background: "#2196f3", 
                          color: "white", 
                          border: "none", 
                          borderRadius: "4px", 
                          padding: "4px 8px", 
                          marginRight: "5px",
                          cursor: "pointer"
                        }}
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => handleDelete(exp.id)} 
                        style={{ 
                          background: "#f44336", 
                          color: "white", 
                          border: "none", 
                          borderRadius: "4px", 
                          padding: "4px 8px",
                          cursor: "pointer"
                        }}
                      >
                        Delete
                      </button>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// --- Helper: Widget Card ---
function Widget({ title, value, color }) {
  return (
    <div style={{
      background: "#fff",
      borderRadius: 13,
      padding: "19px 28px",
      minWidth: 168,
      minHeight: 78,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      boxShadow: "0 3px 12px #ff98002a",
      border: `2.2px solid ${color}33`
    }}>
      <div style={{
        fontWeight: 900, color, fontSize: 18, letterSpacing: ".04em",
        marginBottom: 7, textAlign: "center"
      }}>{title}</div>
      <div style={{
        fontWeight: 800, color, fontSize: 23, letterSpacing: ".02em",
        textShadow: "0 2px 5px #ff980027"
      }}>
        {value.toLocaleString("en-PK", { maximumFractionDigits: 0 })} Rs
      </div>
    </div>
  );
}

const inputStyle = {
  padding: "10px",
  borderRadius: "7px",
  border: "1.5px solid #ffe2bd",
  marginBottom: 7,
  minWidth: 128,
  fontSize: 15,
  background: "#fffbe7",
  color: "#222",
  fontWeight: 600,
};