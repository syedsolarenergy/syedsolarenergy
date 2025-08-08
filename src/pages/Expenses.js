import React, { useEffect, useMemo, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell } from "recharts";
import { supabase } from "../supabaseClient";

// Constants
const types = [
  { value: "credit", label: "Credit (Received)" },
  { value: "debit", label: "Debit (Expense)" },
];

const sources = [
  { value: "inverterRepairs", label: "Inverter Repairs" },
  { value: "project", label: "Project" },
  { value: "solarPanels", label: "Solar Panels" },
  { value: "batteries", label: "Batteries" },
  { value: "wiring", label: "Wiring & Components" },
  { value: "labor", label: "Labor Costs" },
  { value: "transportation", label: "Transportation" },
  { value: "other", label: "Other" },
];

// Enhanced styles with better responsive design
const sectionBg = { 
  background: "linear-gradient(135deg, #fff6ec 0%, #ffecd1 100%)", 
  minHeight: "100vh", 
  padding: "20px",
  fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
};

const inputStyle = {
  padding: "12px 16px",
  borderRadius: "8px",
  border: "2px solid #ffe2bd",
  marginBottom: "8px",
  minWidth: "140px",
  fontSize: "14px",
  background: "#fffbe7",
  color: "#333",
  fontWeight: "500",
  transition: "all 0.2s ease",
  outline: "none",
};

const buttonPrimary = {
  background: "linear-gradient(135deg, #ff9800 0%, #ff6b35 100%)",
  color: "#fff",
  padding: "12px 24px",
  border: "none",
  borderRadius: "8px",
  fontWeight: "600",
  fontSize: "14px",
  cursor: "pointer",
  boxShadow: "0 4px 15px rgba(255, 152, 0, 0.3)",
  transition: "all 0.2s ease",
  textTransform: "uppercase",
  letterSpacing: "0.5px",
};

const cardStyle = {
  background: "#fff",
  borderRadius: "16px",
  padding: "24px",
  margin: "16px 0",
  boxShadow: "0 8px 32px rgba(255, 152, 0, 0.1)",
  border: "1px solid rgba(255, 152, 0, 0.1)",
};

function formatPKR(val = 0) {
  const num = Number(val) || 0;
  return `Rs ${num.toLocaleString("en-PK", { maximumFractionDigits: 0 })}`;
}

function Widget({ title, value, color, icon }) {
  return (
    <div style={{
      background: "#fff",
      borderRadius: "16px",
      padding: "24px",
      minWidth: "200px",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      boxShadow: "0 8px 32px rgba(255, 152, 0, 0.15)",
      border: `2px solid ${color}22`,
      transition: "transform 0.2s ease",
      cursor: "default",
    }}>
      <div style={{ fontSize: "32px", marginBottom: "8px" }}>{icon}</div>
      <div style={{ 
        fontWeight: "600", 
        color: "#666", 
        fontSize: "14px", 
        textAlign: "center",
        marginBottom: "8px",
        textTransform: "uppercase",
        letterSpacing: "0.5px"
      }}>{title}</div>
      <div style={{ 
        fontWeight: "800", 
        color, 
        fontSize: "24px",
        textAlign: "center"
      }}>{formatPKR(value)}</div>
    </div>
  );
}

function MiniDashboard({ entries, showDetailed = false }) {
  const { credit, debit, profit, stats } = useMemo(() => {
    const credit = entries.filter(e => e.type === "credit").reduce((s, e) => s + (e.amount || 0), 0);
    const debit = entries.filter(e => e.type === "debit").reduce((s, e) => s + (e.amount || 0), 0);
    
    const stats = {
      totalEntries: entries.length,
      avgTransaction: entries.length > 0 ? (credit + debit) / entries.length : 0,
      creditCount: entries.filter(e => e.type === "credit").length,
      debitCount: entries.filter(e => e.type === "debit").length,
    };
    
    return { credit, debit, profit: credit - debit, stats };
  }, [entries]);

  const widgets = [
    { title: "Total Credits", value: credit, color: "#2e7d32", icon: "💰" },
    { title: "Total Debits", value: debit, color: "#d32f2f", icon: "💸" },
    { title: "Net Profit", value: profit, color: profit >= 0 ? "#ff9800" : "#d32f2f", icon: profit >= 0 ? "📈" : "📉" },
  ];

  if (showDetailed) {
    widgets.push(
      { title: "Transactions", value: stats.totalEntries, color: "#1976d2", icon: "📊" },
      { title: "Average", value: stats.avgTransaction, color: "#7b1fa2", icon: "📊" }
    );
  }

  return (
    <div style={{
      display: "flex",
      justifyContent: "center",
      gap: "20px",
      margin: "20px auto",
      flexWrap: "wrap",
      maxWidth: "1200px"
    }}>
      {widgets.map((widget, idx) => (
        <Widget key={idx} {...widget} />
      ))}
    </div>
  );
}

function CreateEntityForm({ onCreate, placeholder = "Name", title = "Add", extraFields = [] }) {
  const [form, setForm] = useState({ 
    name: "", 
    ...Object.fromEntries(extraFields.map(f => [f.name, ""])) 
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return alert("Please enter a name.");
    
    setLoading(true);
    try {
      await onCreate({ ...form, created_at: new Date().toISOString() });
      setForm({ name: "", ...Object.fromEntries(extraFields.map(f => [f.name, ""])) });
    } catch (error) {
      alert("Error creating entry: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={cardStyle}>
      <h3 style={{ margin: "0 0 16px 0", color: "#ff9800", fontSize: "18px" }}>🆕 {title}</h3>
      <form onSubmit={submit} style={{ 
        display: "flex", 
        flexWrap: "wrap", 
        gap: "12px", 
        alignItems: "flex-end" 
      }}>
        <input 
          name="name" 
          value={form.name} 
          onChange={handleChange} 
          style={inputStyle} 
          placeholder={placeholder}
          disabled={loading}
        />
        {extraFields.map(f => (
          <input 
            key={f.name} 
            name={f.name} 
            value={form[f.name]} 
            onChange={handleChange} 
            style={inputStyle} 
            placeholder={f.placeholder}
            disabled={loading}
          />
        ))}
        <button 
          type="submit" 
          style={{
            ...buttonPrimary,
            opacity: loading ? 0.7 : 1,
            cursor: loading ? "not-allowed" : "pointer"
          }}
          disabled={loading}
        >
          {loading ? "Adding..." : title}
        </button>
      </form>
    </div>
  );
}

function EntryForm({ 
  onSubmit, 
  defaults = {}, 
  showEntitySelect = false, 
  entities = [], 
  entityLabel = "Select", 
  entityKey = "entity_id" 
}) {
  const [form, setForm] = useState({
    type: "debit",
    name: "",
    amount: "",
    source: "",
    details: "",
    date: new Date().toISOString().split('T')[0],
    time: new Date().toTimeString().slice(0, 5),
    remarks: "",
    [entityKey]: "",
    ...defaults,
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.amount || !form.type || !form.date || !form.time) {
      alert("Please fill all required fields.");
      return;
    }
    if (showEntitySelect && !form[entityKey]) {
      alert(`Please choose ${entityLabel}.`);
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...form,
        amount: parseFloat(form.amount),
        created_at: new Date().toISOString(),
      };
      await onSubmit(payload);
      setForm({
        type: "debit",
        name: "",
        amount: "",
        source: "",
        details: "",
        date: new Date().toISOString().split('T')[0],
        time: new Date().toTimeString().slice(0, 5),
        remarks: "",
        [entityKey]: form[entityKey] || "",
      });
    } catch (error) {
      alert("Error adding entry: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={cardStyle}>
      <h3 style={{ margin: "0 0 16px 0", color: "#ff9800", fontSize: "18px" }}>➕ Add New Entry</h3>
      <form onSubmit={submit} style={{ 
        display: "grid", 
        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
        gap: "12px",
        alignItems: "end"
      }}>
        <select name="type" value={form.type} onChange={handleChange} style={inputStyle} disabled={loading}>
          {types.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
        </select>
        
        <input 
          name="name" 
          value={form.name} 
          onChange={handleChange} 
          style={inputStyle} 
          placeholder="Title (e.g. Cash Received)" 
          required 
          disabled={loading}
        />
        
        <input 
          name="amount" 
          value={form.amount} 
          onChange={handleChange} 
          type="number" 
          min="1" 
          step="0.01"
          style={inputStyle} 
          placeholder="Amount (Rs)" 
          required 
          disabled={loading}
        />
        
        {showEntitySelect && (
          <select name={entityKey} value={form[entityKey]} onChange={handleChange} style={inputStyle} required disabled={loading}>
            <option value="">{entityLabel}</option>
            {entities.map(opt => <option key={opt.id} value={opt.id}>{opt.name}</option>)}
          </select>
        )}
        
        <select name="source" value={form.source} onChange={handleChange} style={inputStyle} disabled={loading}>
          <option value="">Source / Category</option>
          {sources.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
        </select>
        
        <input 
          name="details" 
          value={form.details} 
          onChange={handleChange} 
          style={inputStyle} 
          placeholder="Project/Item Details" 
          disabled={loading}
        />
        
        <input 
          name="date" 
          value={form.date} 
          onChange={handleChange} 
          type="date" 
          style={inputStyle} 
          required 
          disabled={loading}
        />
        
        <input 
          name="time" 
          value={form.time} 
          onChange={handleChange} 
          type="time" 
          style={inputStyle} 
          required 
          disabled={loading}
        />
        
        <input 
          name="remarks" 
          value={form.remarks} 
          onChange={handleChange} 
          style={inputStyle} 
          placeholder="Additional notes" 
          disabled={loading}
        />
        
        <button 
          type="submit" 
          style={{
            ...buttonPrimary,
            gridColumn: "span 2",
            opacity: loading ? 0.7 : 1,
            cursor: loading ? "not-allowed" : "pointer"
          }}
          disabled={loading}
        >
          {loading ? "Adding..." : "Add Entry"}
        </button>
      </form>
    </div>
  );
}

function LedgerTable({ entries, entitiesMap, entityKey = "entity_id", maxEntries = 50 }) {
  const [sortField, setSortField] = useState("created_at");
  const [sortDirection, setSortDirection] = useState("desc");
  const [searchTerm, setSearchTerm] = useState("");

  const sortedEntries = useMemo(() => {
    let filtered = entries.filter(entry =>
      entry.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.details?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.remarks?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return filtered.sort((a, b) => {
      const aVal = a[sortField] || "";
      const bVal = b[sortField] || "";
      const direction = sortDirection === "asc" ? 1 : -1;
      
      if (sortField === "amount") {
        return direction * ((aVal || 0) - (bVal || 0));
      }
      return direction * aVal.toString().localeCompare(bVal.toString());
    }).slice(0, maxEntries);
  }, [entries, sortField, sortDirection, searchTerm, maxEntries]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  return (
    <div style={cardStyle}>
      <div style={{ 
        display: "flex", 
        justifyContent: "space-between", 
        alignItems: "center", 
        marginBottom: "16px",
        flexWrap: "wrap",
        gap: "12px"
      }}>
        <h3 style={{ margin: 0, color: "#ff9800", fontSize: "18px" }}>📋 Transaction Ledger</h3>
        <input
          type="text"
          placeholder="Search transactions..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            ...inputStyle,
            minWidth: "250px",
            marginBottom: 0
          }}
        />
      </div>
      
      <div style={{ overflowX: "auto" }}>
        <table style={{
          width: "100%",
          borderCollapse: "collapse",
          fontSize: "14px"
        }}>
          <thead>
            <tr style={{ background: "#f5f5f5" }}>
              <th style={headerStyle}>#</th>
              <th style={headerStyle} onClick={() => handleSort("type")}>
                Type {sortField === "type" && (sortDirection === "asc" ? "↑" : "↓")}
              </th>
              {entitiesMap && <th style={headerStyle}>Account</th>}
              <th style={headerStyle} onClick={() => handleSort("name")}>
                Title {sortField === "name" && (sortDirection === "asc" ? "↑" : "↓")}
              </th>
              <th style={headerStyle} onClick={() => handleSort("amount")}>
                Amount {sortField === "amount" && (sortDirection === "asc" ? "↑" : "↓")}
              </th>
              <th style={headerStyle}>Source</th>
              <th style={headerStyle}>Details</th>
              <th style={headerStyle} onClick={() => handleSort("date")}>
                Date {sortField === "date" && (sortDirection === "asc" ? "↑" : "↓")}
              </th>
              <th style={headerStyle}>Time</th>
              <th style={headerStyle}>Remarks</th>
            </tr>
          </thead>
          <tbody>
            {sortedEntries.length === 0 ? (
              <tr>
                <td colSpan={entitiesMap ? 10 : 9} style={{ 
                  textAlign: "center", 
                  color: "#999", 
                  padding: "40px",
                  fontSize: "16px"
                }}>
                  {searchTerm ? "No transactions match your search." : "No transactions yet."}
                </td>
              </tr>
            ) : sortedEntries.map((entry, idx) => (
              <tr key={entry.id || idx} style={{
                borderBottom: "1px solid #eee",
                "&:hover": { background: "#f9f9f9" }
              }}>
                <td style={cellStyle}>{entry.id || idx + 1}</td>
                <td style={{
                  ...cellStyle,
                  color: entry.type === "credit" ? "#2e7d32" : "#d32f2f",
                  fontWeight: "600"
                }}>
                  {entry.type === "credit" ? "💰 Credit" : "💸 Debit"}
                </td>
                {entitiesMap && (
                  <td style={cellStyle}>{entitiesMap.get(entry[entityKey])?.name || "-"}</td>
                )}
                <td style={{ ...cellStyle, fontWeight: "500" }}>{entry.name}</td>
                <td style={{ 
                  ...cellStyle, 
                  fontWeight: "600",
                  color: entry.type === "credit" ? "#2e7d32" : "#d32f2f"
                }}>
                  {formatPKR(entry.amount)}
                </td>
                <td style={cellStyle}>
                  {sources.find(s => s.value === entry.source)?.label || entry.source || "-"}
                </td>
                <td style={cellStyle}>{entry.details || "-"}</td>
                <td style={cellStyle}>{entry.date || "-"}</td>
                <td style={cellStyle}>{entry.time || "-"}</td>
                <td style={cellStyle}>{entry.remarks || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {entries.length > maxEntries && (
        <div style={{ 
          textAlign: "center", 
          marginTop: "16px", 
          color: "#666",
          fontSize: "14px"
        }}>
          Showing {Math.min(sortedEntries.length, maxEntries)} of {entries.length} entries
        </div>
      )}
    </div>
  );
}

const headerStyle = {
  padding: "12px 8px",
  textAlign: "left",
  fontWeight: "600",
  color: "#333",
  cursor: "pointer",
  borderBottom: "2px solid #ddd",
  fontSize: "12px",
  textTransform: "uppercase",
  letterSpacing: "0.5px"
};

const cellStyle = {
  padding: "12px 8px",
  borderBottom: "1px solid #f0f0f0",
  color: "#555"
};

function TabNav({ active, setActive, tabs }) {
  return (
    <div style={{ 
      display: "flex", 
      justifyContent: "center", 
      gap: "8px", 
      margin: "20px auto 30px auto", 
      flexWrap: "wrap",
      maxWidth: "800px"
    }}>
      {tabs.map(t => (
        <button
          key={t.key}
          onClick={() => setActive(t.key)}
          style={{
            padding: "12px 20px",
            borderRadius: "25px",
            border: active === t.key ? "2px solid #ff9800" : "2px solid transparent",
            background: active === t.key ? "#fff3e0" : "#fff",
            color: active === t.key ? "#ff9800" : "#666",
            fontWeight: active === t.key ? "700" : "500",
            cursor: "pointer",
            fontSize: "14px",
            transition: "all 0.2s ease",
            boxShadow: active === t.key ? "0 4px 15px rgba(255, 152, 0, 0.2)" : "0 2px 8px rgba(0,0,0,0.1)",
            minWidth: "120px"
          }}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}

function MonthlyChart({ entries }) {
  const chartData = useMemo(() => {
    const monthly = {};
    entries.forEach(e => {
      if (!e.date) return;
      const [y, m] = (e.date.length === 10 ? e.date.split("-") : ["", ""]);
      const monthKey = y && m ? `${y}-${m}` : "N/A";
      if (!monthly[monthKey]) {
        monthly[monthKey] = { 
          month: monthKey, 
          Credit: 0, 
          Debit: 0,
          monthName: new Date(y, m - 1).toLocaleString('default', { month: 'short', year: 'numeric' })
        };
      }
      if (e.type === "credit") monthly[monthKey].Credit += e.amount || 0;
      else monthly[monthKey].Debit += e.amount || 0;
    });
    return Object.values(monthly)
      .sort((a, b) => a.month.localeCompare(b.month))
      .slice(-12); // Show last 12 months
  }, [entries]);

  const sourceData = useMemo(() => {
    const sourceTotals = {};
    entries.forEach(e => {
      const source = sources.find(s => s.value === e.source)?.label || e.source || "Other";
      sourceTotals[source] = (sourceTotals[source] || 0) + (e.amount || 0);
    });
    return Object.entries(sourceTotals)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);
  }, [entries]);

  const COLORS = ['#FF9800', '#2E7D32', '#D32F2F', '#1976D2', '#7B1FA2', '#00796B', '#F57C00', '#5D4037'];

  return (
    <div style={{ 
      display: "grid", 
      gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))",
      gap: "20px",
      margin: "20px auto",
      maxWidth: "1400px"
    }}>
      <div style={cardStyle}>
        <h4 style={{ color: "#FF9800", marginBottom: "20px", fontSize: "18px", textAlign: "center" }}>
          📊 Monthly Credit vs Debit Trend
        </h4>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <XAxis 
              dataKey="monthName" 
              tick={{ fontSize: 12 }}
              angle={-45}
              textAnchor="end"
            />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip 
              formatter={(value) => [formatPKR(value), '']}
              labelStyle={{ color: '#333' }}
            />
            <Legend />
            <Bar dataKey="Credit" fill="#2e7d32" radius={[4, 4, 0, 0]} name="Credits" />
            <Bar dataKey="Debit" fill="#d32f2f" radius={[4, 4, 0, 0]} name="Debits" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {sourceData.length > 0 && (
        <div style={cardStyle}>
          <h4 style={{ color: "#FF9800", marginBottom: "20px", fontSize: "18px", textAlign: "center" }}>
            🎯 Expenses by Category
          </h4>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={sourceData}
                cx="50%"
                cy="50%"
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                labelLine={false}
              >
                {sourceData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => formatPKR(value)} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

export default function Expenses() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [loading, setLoading] = useState(true);

  // Real Supabase state
  const [projects, setProjects] = useState([]);
  const [repairs, setRepairs] = useState([]);
  const [people, setPeople] = useState([]);

  const [projectEntries, setProjectEntries] = useState([]);
  const [repairEntries, setRepairEntries] = useState([]);
  const [peopleEntries, setPeopleEntries] = useState([]);
  const [generalEntries, setGeneralEntries] = useState([]);

  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [selectedRepairId, setSelectedRepairId] = useState("");
  const [selectedPersonId, setSelectedPersonId] = useState("");

  // Fetch all data on mount
  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      // Fetch entities
      const [
        { data: projectsData, error: projectsError },
        { data: repairsData, error: repairsError },
        { data: peopleData, error: peopleError }
      ] = await Promise.all([
        supabase.from("expenses_projects").select("*").order("created_at", { ascending: false }),
        supabase.from("expenses_repairs").select("*").order("created_at", { ascending: false }),
        supabase.from("expenses_people").select("*").order("created_at", { ascending: false }),
      ]);

      if (projectsError) console.error("Projects fetch error:", projectsError);
      if (repairsError) console.error("Repairs fetch error:", repairsError);
      if (peopleError) console.error("People fetch error:", peopleError);

      setProjects(projectsData || []);
      setRepairs(repairsData || []);
      setPeople(peopleData || []);

      // Fetch entries
      const [
        { data: projectEntriesData, error: projectEntriesError },
        { data: repairEntriesData, error: repairEntriesError },
        { data: peopleEntriesData, error: peopleEntriesError },
        { data: generalEntriesData, error: generalEntriesError }
      ] = await Promise.all([
        supabase.from("expenses_project_entries").select("*").order("created_at", { ascending: false }),
        supabase.from("expenses_repair_entries").select("*").order("created_at", { ascending: false }),
        supabase.from("expenses_people_entries").select("*").order("created_at", { ascending: false }),
        supabase.from("expenses_general_entries").select("*").order("created_at", { ascending: false }),
      ]);

      if (projectEntriesError) console.error("Project entries fetch error:", projectEntriesError);
      if (repairEntriesError) console.error("Repair entries fetch error:", repairEntriesError);
      if (peopleEntriesError) console.error("People entries fetch error:", peopleEntriesError);
      if (generalEntriesError) console.error("General entries fetch error:", generalEntriesError);

      setProjectEntries(projectEntriesData || []);
      setRepairEntries(repairEntriesData || []);
      setPeopleEntries(peopleEntriesData || []);
      setGeneralEntries(generalEntriesData || []);

    } catch (error) {
      console.error("Error fetching data:", error);
      alert("Error loading data. Please refresh the page.");
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { key: "dashboard", label: "📊 Dashboard" },
    { key: "projects", label: "📁 Projects" },
    { key: "repairs", label: "🔧 Repairs" },
    { key: "people", label: "👤 People" },
    { key: "general", label: "💼 General" },
  ];

  const allEntries = useMemo(() => [
    ...projectEntries,
    ...repairEntries,
    ...peopleEntries,
    ...generalEntries
  ], [projectEntries, repairEntries, peopleEntries, generalEntries]);

  const projectsMap = useMemo(() => new Map(projects.map(p => [p.id, p])), [projects]);
  const repairsMap = useMemo(() => new Map(repairs.map(r => [r.id, r])), [repairs]);
  const peopleMap = useMemo(() => new Map(people.map(p => [p.id, p])), [people]);

  const scopedProjectEntries = useMemo(() =>
    selectedProjectId ? projectEntries.filter(e => e.project_id === Number(selectedProjectId)) : projectEntries,
    [projectEntries, selectedProjectId]
  );

  const scopedRepairEntries = useMemo(() =>
    selectedRepairId ? repairEntries.filter(e => e.repair_id === Number(selectedRepairId)) : repairEntries,
    [repairEntries, selectedRepairId]
  );

  const scopedPeopleEntries = useMemo(() =>
    selectedPersonId ? peopleEntries.filter(e => e.person_id === Number(selectedPersonId)) : peopleEntries,
    [peopleEntries, selectedPersonId]
  );

  // Enhanced mutation functions with Supabase integration
  const createProject = async (payload) => {
    try {
      const { data, error } = await supabase
        .from("expenses_projects")
        .insert([payload])
        .select();
      
      if (error) throw error;
      
      setProjects(prev => [data[0], ...prev]);
      alert("Project created successfully!");
    } catch (error) {
      console.error("Error creating project:", error);
      alert("Could not add project: " + error.message);
    }
  };

  const createRepair = async (payload) => {
    try {
      const { data, error } = await supabase
        .from("expenses_repairs")
        .insert([payload])
        .select();
      
      if (error) throw error;
      
      setRepairs(prev => [data[0], ...prev]);
      alert("Repair item created successfully!");
    } catch (error) {
      console.error("Error creating repair:", error);
      alert("Could not add repair: " + error.message);
    }
  };

  const createPerson = async (payload) => {
    try {
      const { data, error } = await supabase
        .from("expenses_people")
        .insert([payload])
        .select();
      
      if (error) throw error;
      
      setPeople(prev => [data[0], ...prev]);
      alert("Person added successfully!");
    } catch (error) {
      console.error("Error creating person:", error);
      alert("Could not add person: " + error.message);
    }
  };

  const addProjectEntry = async (entry) => {
    try {
      const { data, error } = await supabase
        .from("expenses_project_entries")
        .insert([entry])
        .select();
      
      if (error) throw error;
      
      setProjectEntries(prev => [data[0], ...prev]);
      alert("Project entry added successfully!");
    } catch (error) {
      console.error("Error adding project entry:", error);
      alert("Could not add entry: " + error.message);
    }
  };

  const addRepairEntry = async (entry) => {
    try {
      const { data, error } = await supabase
        .from("expenses_repair_entries")
        .insert([entry])
        .select();
      
      if (error) throw error;
      
      setRepairEntries(prev => [data[0], ...prev]);
      alert("Repair entry added successfully!");
    } catch (error) {
      console.error("Error adding repair entry:", error);
      alert("Could not add entry: " + error.message);
    }
  };

  const addPeopleEntry = async (entry) => {
    try {
      const { data, error } = await supabase
        .from("expenses_people_entries")
        .insert([entry])
        .select();
      
      if (error) throw error;
      
      setPeopleEntries(prev => [data[0], ...prev]);
      alert("People entry added successfully!");
    } catch (error) {
      console.error("Error adding people entry:", error);
      alert("Could not add entry: " + error.message);
    }
  };

  const addGeneralEntry = async (entry) => {
    try {
      const { data, error } = await supabase
        .from("expenses_general_entries")
        .insert([entry])
        .select();
      
      if (error) throw error;
      
      setGeneralEntries(prev => [data[0], ...prev]);
      alert("General entry added successfully!");
    } catch (error) {
      console.error("Error adding general entry:", error);
      alert("Could not add entry: " + error.message);
    }
  };

  // Filter component for better UX
  const FilterSelect = ({ value, onChange, options, placeholder, style }) => (
    <select 
      value={value} 
      onChange={onChange} 
      style={{
        ...inputStyle,
        minWidth: "200px",
        marginBottom: "20px",
        ...style
      }}
    >
      <option value="">{placeholder}</option>
      {options.map(opt => (
        <option key={opt.id} value={opt.id}>{opt.name}</option>
      ))}
    </select>
  );

  return (
    <section style={sectionBg}>
      <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
        <h1 style={{ 
          textAlign: "center", 
          color: "#ff9800", 
          margin: "0 0 10px 0", 
          fontWeight: "900",
          fontSize: "2.5rem",
          textShadow: "0 2px 4px rgba(255, 152, 0, 0.2)"
        }}>
          💰 Easy Khata
        </h1>
        <p style={{
          textAlign: "center",
          color: "#666",
          fontSize: "1.1rem",
          margin: "0 0 20px 0",
          fontWeight: "400"
        }}>
          Complete Expense & Profit Management System
        </p>
        
        <TabNav active={activeTab} setActive={setActiveTab} tabs={tabs} />

        {loading ? (
          <div style={{ 
            textAlign: "center", 
            color: "#666", 
            marginTop: "60px",
            fontSize: "18px"
          }}>
            <div style={{ fontSize: "48px", marginBottom: "16px" }}>⏳</div>
            Loading your financial data...
            <div style={{ fontSize: "14px", marginTop: "8px", color: "#999" }}>
              Fetching from Supabase database...
            </div>
          </div>
        ) : (
          <>
            {activeTab === "dashboard" && (
              <div>
                <MiniDashboard entries={allEntries} showDetailed={true} />
                <MonthlyChart entries={allEntries} />
                <LedgerTable entries={allEntries} maxEntries={25} />
                {allEntries.length === 0 && (
                  <div style={{
                    textAlign: "center",
                    padding: "60px 20px",
                    color: "#666"
                  }}>
                    <div style={{ fontSize: "64px", marginBottom: "20px" }}>📊</div>
                    <h3 style={{ color: "#ff9800", marginBottom: "12px" }}>Welcome to Easy Khata!</h3>
                    <p style={{ fontSize: "16px", maxWidth: "400px", margin: "0 auto" }}>
                      Start by adding projects, repairs, people, or general entries to see your financial dashboard come to life.
                    </p>
                  </div>
                )}
              </div>
            )}

            {activeTab === "projects" && (
              <div>
                <MiniDashboard entries={scopedProjectEntries} />
                <CreateEntityForm 
                  onCreate={createProject} 
                  placeholder="Project name (e.g., Solar Installation - Site A)" 
                  title="Add New Project" 
                />
                <EntryForm
                  onSubmit={(p) => addProjectEntry({ ...p, project_id: Number(p.project_id) })}
                  showEntitySelect
                  entities={projects}
                  entityLabel="Select Project"
                  entityKey="project_id"
                />
                <div style={{ margin: "20px 0" }}>
                  <FilterSelect
                    value={selectedProjectId}
                    onChange={e => setSelectedProjectId(e.target.value)}
                    options={projects}
                    placeholder="🔍 Filter by Project (All Projects)"
                  />
                </div>
                <LedgerTable 
                  entries={scopedProjectEntries} 
                  entitiesMap={projectsMap} 
                  entityKey="project_id" 
                />
              </div>
            )}

            {activeTab === "repairs" && (
              <div>
                <MiniDashboard entries={scopedRepairEntries} />
                <CreateEntityForm 
                  onCreate={createRepair} 
                  placeholder="Repair description (e.g., Inverter Model XYZ - Capacitor Issue)" 
                  title="Add New Repair" 
                />
                <EntryForm
                  onSubmit={(r) => addRepairEntry({ ...r, repair_id: Number(r.repair_id) })}
                  showEntitySelect
                  entities={repairs}
                  entityLabel="Select Repair Item"
                  entityKey="repair_id"
                />
                <div style={{ margin: "20px 0" }}>
                  <FilterSelect
                    value={selectedRepairId}
                    onChange={e => setSelectedRepairId(e.target.value)}
                    options={repairs}
                    placeholder="🔍 Filter by Repair (All Repairs)"
                  />
                </div>
                <LedgerTable 
                  entries={scopedRepairEntries} 
                  entitiesMap={repairsMap} 
                  entityKey="repair_id" 
                />
              </div>
            )}

            {activeTab === "people" && (
              <div>
                <MiniDashboard entries={scopedPeopleEntries} />
                <CreateEntityForm
                  onCreate={createPerson}
                  placeholder="Person name (e.g., Ahmad Khan)"
                  title="Add New Person"
                  extraFields={[{ 
                    name: "phone", 
                    placeholder: "Phone number (optional)" 
                  }]}
                />
                <EntryForm
                  onSubmit={(p) => addPeopleEntry({ ...p, person_id: Number(p.person_id) })}
                  showEntitySelect
                  entities={people}
                  entityLabel="Select Person"
                  entityKey="person_id"
                />
                <div style={{ margin: "20px 0" }}>
                  <FilterSelect
                    value={selectedPersonId}
                    onChange={e => setSelectedPersonId(e.target.value)}
                    options={people}
                    placeholder="🔍 Filter by Person (All People)"
                  />
                </div>
                <LedgerTable 
                  entries={scopedPeopleEntries} 
                  entitiesMap={peopleMap} 
                  entityKey="person_id" 
                />
              </div>
            )}

            {activeTab === "general" && (
              <div>
                <MiniDashboard entries={generalEntries} />
                <EntryForm onSubmit={addGeneralEntry} />
                <LedgerTable entries={generalEntries} />
              </div>
            )}
          </>
        )}
      </div>
      
      {/* Footer */}
      <div style={{
        textAlign: "center",
        margin: "60px 0 20px 0",
        padding: "20px",
        color: "#999",
        fontSize: "14px",
        borderTop: "1px solid #eee"
      }}>
        <p style={{ margin: 0 }}>
          💡 Easy Khata - Your complete financial tracking solution
        </p>
        <p style={{ margin: "8px 0 0 0", fontSize: "12px" }}>
          Track projects, repairs, people accounts, and general expenses all in one place
        </p>
      </div>
    </section>
  );
}