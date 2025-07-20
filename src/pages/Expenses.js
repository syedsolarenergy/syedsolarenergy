import React, { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { supabase } from "../supabaseClient";

const sources = [
  { value: "inverterRepairs", label: "Inverter Repairs" },
  { value: "project", label: "Project" },
  { value: "other", label: "Other" },
];

const types = [
  { value: "credit", label: "Credit (Received)" },
  { value: "debit", label: "Debit (Expense)" },
];

export default function Expenses() {
  // -- State --
  const [expenses, setExpenses] = useState([]);
  const [form, setForm] = useState({
    type: "debit",
    name: "",
    amount: "",
    source: "",
    details: "",
    date: "",
    time: "",
    remarks: "",
  });
  const [loading, setLoading] = useState(true);

  // -- Fetch Expenses on Mount --
  useEffect(() => {
    async function fetchExpenses() {
      setLoading(true);
      const { data, error } = await supabase
        .from("expenses")
        .select("*")
        .order("created_at", { ascending: false });
      if (!error && data) setExpenses(data);
      setLoading(false);
    }
    fetchExpenses();
  }, []);

  // --- Calculations for Dashboard ---
  const totalCredit = expenses.filter(e => e.type === "credit").reduce((sum, e) => sum + (e.amount || 0), 0);
  const totalDebit = expenses.filter(e => e.type === "debit").reduce((sum, e) => sum + (e.amount || 0), 0);
  const totalProfit = totalCredit - totalDebit;

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

  // --- Handlers ---
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  // --- Submit (Add New Expense to Supabase) ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.amount || !form.type || !form.source || !form.date || !form.time)
      return alert("Please fill all required fields.");

    const newExpense = {
      ...form,
      amount: parseFloat(form.amount),
      created_at: new Date().toISOString(),
    };
    // Save to Supabase
    const { data, error } = await supabase.from("expenses").insert([newExpense]).select();
    if (error) return alert("❌ Could not add: " + error.message);

    // Inserted row (data[0]) gets unique id from Supabase
    setExpenses([data[0], ...expenses]);
    setForm({
      type: "debit",
      name: "",
      amount: "",
      source: "",
      details: "",
      date: "",
      time: "",
      remarks: "",
    });
  };

  return (
    <section style={{ background: "#fff6ec", minHeight: "100vh", padding: "0 0 30px 0" }}>
      <h2 style={{ textAlign: "center", color: "#ff9800", margin: "25px 0 10px 0", fontWeight: 900 }}>💰 Expense & Profit Dashboard</h2>
      
      {/* Mini Dashboard */}
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
      {/* Chart */}
      <div style={{ width: "98%", maxWidth: 620, margin: "0 auto 22px auto", background: "#fff", borderRadius: 13, boxShadow: "0 4px 22px #ff980016", padding: "20px 18px" }}>
        <h4 style={{ color: "#FF9800", marginBottom: 0, fontWeight: 800 }}>Monthly Credit vs Expense</h4>
        <ResponsiveContainer width="100%" height={230}>
          <BarChart data={chartData}>
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="Credit" fill="#43a047" radius={6} />
            <Bar dataKey="Debit" fill="#e65100" radius={6} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      {/* Add Money Form */}
      <div style={{ background: "#fff", padding: 23, borderRadius: 12, maxWidth: 530, margin: "0 auto 18px auto", boxShadow: "0 2px 15px #ff980018" }}>
        <h4 style={{ color: "#ff9800", fontWeight: 800, marginBottom: 9 }}>Add Money / Expense</h4>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexWrap: "wrap", gap: 14 }}>
          <select name="type" value={form.type} onChange={handleChange} style={inputStyle}>
            {types.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
          </select>
          <input name="name" value={form.name} onChange={handleChange} style={inputStyle} placeholder="Title (e.g. Cash Received)" required />
          <input name="amount" value={form.amount} onChange={handleChange} type="number" min="1" style={inputStyle} placeholder="Amount (Rs)" required />
          <select name="source" value={form.source} onChange={handleChange} style={inputStyle} required>
            <option value="">Source / Category</option>
            {sources.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
          </select>
          <input name="details" value={form.details} onChange={handleChange} style={inputStyle} placeholder="Which Project/Inverter?" />
          <input name="date" value={form.date} onChange={handleChange} type="date" style={inputStyle} required />
          <input name="time" value={form.time} onChange={handleChange} type="time" style={inputStyle} required />
          <input name="remarks" value={form.remarks} onChange={handleChange} style={inputStyle} placeholder="Remarks (if any)" />
          <button type="submit" style={{
            background: "linear-gradient(90deg,#ff9800,#ff6b35)",
            color: "#fff", padding: "10px 32px",
            border: "none", borderRadius: 9, fontWeight: 700, fontSize: 16, cursor: "pointer", boxShadow: "0 2px 11px #ff980032"
          }}>Add</button>
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
              <th>Source</th>
              <th>Details</th>
              <th>Date</th>
              <th>Time</th>
              <th>Remarks</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={9} style={{ textAlign: "center", color: "#aaa" }}>Loading...</td></tr>
            ) : expenses.length === 0 ? (
              <tr><td colSpan={9} style={{ textAlign: "center", color: "#aaa" }}>No data yet.</td></tr>
            ) : expenses.map((exp, idx) => (
              <tr key={exp.id || idx}>
                <td>{exp.id}</td>
                <td style={{ color: exp.type === "credit" ? "#43a047" : "#e65100", fontWeight: 700 }}>
                  {exp.type === "credit" ? "Credit" : "Debit"}
                </td>
                <td>{exp.name}</td>
                <td>{exp.amount}</td>
                <td>{sources.find(s => s.value === exp.source)?.label || exp.source}</td>
                <td>{exp.details}</td>
                <td>{exp.date}</td>
                <td>{exp.time}</td>
                <td>{exp.remarks}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
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
