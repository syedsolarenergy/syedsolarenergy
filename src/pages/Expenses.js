import React, { useEffect, useMemo, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { supabase } from "../supabaseClient";

// ---------- Constants ----------
const types = [
  { value: "credit", label: "Credit (Received)" },
  { value: "debit", label: "Debit (Expense)" },
];

const sources = [
  { value: "inverterRepairs", label: "Inverter Repairs" },
  { value: "project", label: "Project" },
  { value: "other", label: "Other" },
];

// ---------- Styles ----------
const sectionBg = { background: "#fff6ec", minHeight: "100vh", padding: "0 0 30px 0" };
const cardStyle = {
  background: "#fff",
  padding: 23,
  borderRadius: 12,
  boxShadow: "0 2px 15px #ff980018",
};
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
const buttonPrimary = {
  background: "linear-gradient(90deg,#ff9800,#ff6b35)",
  color: "#fff",
  padding: "10px 32px",
  border: "none",
  borderRadius: 9,
  fontWeight: 700,
  fontSize: 16,
  cursor: "pointer",
  boxShadow: "0 2px 11px #ff980032",
};

// ---------- Helpers ----------
function formatPKR(val = 0) {
  const num = Number(val) || 0;
  return `${num.toLocaleString("en-PK", { maximumFractionDigits: 0 })} Rs`;
}

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
        {formatPKR(value)}
      </div>
    </div>
  );
}

function SectionCard({ title, children, style }) {
  return (
    <div style={{ ...cardStyle, ...style }}>
      {title && <h4 style={{ color: "#ff9800", fontWeight: 800, marginBottom: 9 }}>{title}</h4>}
      {children}
    </div>
  );
}

function MiniDashboard({ entries }) {
  const { credit, debit, profit } = useMemo(() => {
    const credit = entries.filter(e => e.type === "credit").reduce((s, e) => s + (e.amount || 0), 0);
    const debit = entries.filter(e => e.type === "debit").reduce((s, e) => s + (e.amount || 0), 0);
    return { credit, debit, profit: credit - debit };
  }, [entries]);

  return (
    <div style={{
      display: "flex", justifyContent: "center", gap: 30, margin: "0 auto 18px auto", flexWrap: "wrap"
    }}>
      <Widget title="Total Credits" value={credit} color="#43a047" />
      <Widget title="Total Debits" value={debit} color="#e65100" />
      <Widget title="Total Profit" value={profit} color="#ff9800" />
    </div>
  );
}

function LedgerTable({ entries, entitiesMap, entityKey = "entity_id" }) {
  return (
    <div style={{ overflowX: "auto" }}>
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
            {entitiesMap && <th>Account</th>}
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
          {entries.length === 0 ? (
            <tr><td colSpan={entitiesMap ? 10 : 9} style={{ textAlign: "center", color: "#aaa" }}>No data yet.</td></tr>
          ) : entries.map((exp, idx) => (
            <tr key={exp.id || idx}>
              <td>{exp.id || idx + 1}</td>
              <td style={{ color: exp.type === "credit" ? "#43a047" : "#e65100", fontWeight: 700 }}>
                {exp.type === "credit" ? "Credit" : "Debit"}
              </td>
              {entitiesMap && <td>{entitiesMap.get(exp[entityKey])?.name || "-"}</td>}
              <td>{exp.name}</td>
              <td>{formatPKR(exp.amount)}</td>
              <td>{sources.find(s => s.value === exp.source)?.label || exp.source || "-"}</td>
              <td>{exp.details || "-"}</td>
              <td>{exp.date || "-"}</td>
              <td>{exp.time || "-"}</td>
              <td>{exp.remarks || "-"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function EntryForm({ onSubmit, defaults = {}, showEntitySelect = false, entities = [], entityLabel = "Select", entityKey = "entity_id" }) {
  const [form, setForm] = useState({
    type: "debit",
    name: "",
    amount: "",
    source: "",
    details: "",
    date: "",
    time: "",
    remarks: "",
    [entityKey]: "",
    ...defaults,
  });

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
      date: "",
      time: "",
      remarks: "",
      [entityKey]: form[entityKey] || "",
    });
  };

  return (
    <form onSubmit={submit} style={{ display: "flex", flexWrap: "wrap", gap: 14 }}>
      <select name="type" value={form.type} onChange={handleChange} style={inputStyle}>
        {types.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
      </select>
      <input name="name" value={form.name} onChange={handleChange} style={inputStyle} placeholder="Title (e.g. Cash Received)" required />
      <input name="amount" value={form.amount} onChange={handleChange} type="number" min="1" style={inputStyle} placeholder="Amount (Rs)" required />
      {showEntitySelect && (
        <select name={entityKey} value={form[entityKey]} onChange={handleChange} style={inputStyle} required>
          <option value="">{entityLabel}</option>
          {entities.map(opt => <option key={opt.id} value={opt.id}>{opt.name}</option>)}
        </select>
      )}
      <select name="source" value={form.source} onChange={handleChange} style={inputStyle}>
        <option value="">Source / Category</option>
        {sources.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
      </select>
      <input name="details" value={form.details} onChange={handleChange} style={inputStyle} placeholder="Which Project/Inverter?" />
      <input name="date" value={form.date} onChange={handleChange} type="date" style={inputStyle} required />
      <input name="time" value={form.time} onChange={handleChange} type="time" style={inputStyle} required />
      <input name="remarks" value={form.remarks} onChange={handleChange} style={inputStyle} placeholder="Remarks (if any)" />
      <button type="submit" style={buttonPrimary}>Add</button>
    </form>
  );
}

function CreateEntityForm({ onCreate, placeholder = "Name", title = "Add", extraFields = [] }) {
  const [form, setForm] = useState({ name: "", ...Object.fromEntries(extraFields.map(f => [f.name, ""])) });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name) return alert("Please enter a name.");
    await onCreate({ ...form, created_at: new Date().toISOString() });
    setForm({ name: "", ...Object.fromEntries(extraFields.map(f => [f.name, ""])) });
  };

  return (
    <form onSubmit={submit} style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center" }}>
      <input name="name" value={form.name} onChange={handleChange} style={inputStyle} placeholder={placeholder} />
      {extraFields.map(f => (
        <input key={f.name} name={f.name} value={form[f.name]} onChange={handleChange} style={inputStyle} placeholder={f.placeholder} />
      ))}
      <button type="submit" style={buttonPrimary}>{title}</button>
    </form>
  );
}

function TabNav({ active, setActive, tabs }) {
  return (
    <div style={{ display: "flex", justifyContent: "center", gap: 10, margin: "10px auto 18px auto", flexWrap: "wrap" }}>
      {tabs.map(t => (
        <button
          key={t.key}
          onClick={() => setActive(t.key)}
          style={{
            padding: "10px 16px",
            borderRadius: 8,
            border: active === t.key ? "2px solid #ff9800" : "1px solid #ffd3a6",
            background: active === t.key ? "#fff3e0" : "#fff",
            color: "#ff6b35",
            fontWeight: 800,
            cursor: "pointer"
          }}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}

// ---------- Main Component ----------
export default function Expenses() {
  const [activeTab, setActiveTab] = useState("dashboard");

  // Entities
  const [projects, setProjects] = useState([]);
  const [repairs, setRepairs] = useState([]);
  const [people, setPeople] = useState([]);

  // Entries
  const [projectEntries, setProjectEntries] = useState([]);
  const [repairEntries, setRepairEntries] = useState([]);
  const [peopleEntries, setPeopleEntries] = useState([]);
  const [generalEntries, setGeneralEntries] = useState([]);

  const [loading, setLoading] = useState(true);

  // Selections for scoped views
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [selectedRepairId, setSelectedRepairId] = useState("");
  const [selectedPersonId, setSelectedPersonId] = useState("");

  // Fetch all on mount
  useEffect(() => {
    (async () => {
      setLoading(true);
      // Entities
      const [{ data: proj }, { data: rep }, { data: ppl }] = await Promise.all([
        supabase.from("expenses_projects").select("*").order("created_at", { ascending: false }),
        supabase.from("expenses_repairs").select("*").order("created_at", { ascending: false }),
        supabase.from("expenses_people").select("*").order("created_at", { ascending: false }),
      ]);

      setProjects(proj || []);
      setRepairs(rep || []);
      setPeople(ppl || []);

      // Entries across all ledgers
      const [
        { data: pe },
        { data: re },
        { data: ppe },
        { data: ge },
      ] = await Promise.all([
        supabase.from("expenses_project_entries").select("*").order("created_at", { ascending: false }),
        supabase.from("expenses_repair_entries").select("*").order("created_at", { ascending: false }),
        supabase.from("expenses_people_entries").select("*").order("created_at", { ascending: false }),
        supabase.from("expenses_general_entries").select("*").order("created_at", { ascending: false }),
      ]);

      setProjectEntries(pe || []);
      setRepairEntries(re || []);
      setPeopleEntries(ppe || []);
      setGeneralEntries(ge || []);
      setLoading(false);
    })();
  }, []);

  // Maps for display
  const projectsMap = useMemo(() => new Map(projects.map(p => [p.id, p])), [projects]);
  const repairsMap = useMemo(() => new Map(repairs.map(r => [r.id, r])), [repairs]);
  const peopleMap = useMemo(() => new Map(people.map(p => [p.id, p])), [people]);

  // Combined entries for global dashboard/chart
  const allEntries = useMemo(() => ([
    ...projectEntries,
    ...repairEntries,
    ...peopleEntries,
    ...generalEntries
  ]), [projectEntries, repairEntries, peopleEntries, generalEntries]);

  const globalTotals = useMemo(() => {
    const credit = allEntries.filter(e => e.type === "credit").reduce((s, e) => s + (e.amount || 0), 0);
    const debit = allEntries.filter(e => e.type === "debit").reduce((s, e) => s + (e.amount || 0), 0);
    return { credit, debit, profit: credit - debit };
  }, [allEntries]);

  // Monthly chart across all ledgers
  const chartData = useMemo(() => {
    const monthly = {};
    allEntries.forEach(e => {
      if (!e.date) return;
      const [y, m] = (e.date.length === 10 ? e.date.split("-") : ["", ""]);
      const month = y && m ? `${y}-${m}` : "N/A";
      if (!monthly[month]) monthly[month] = { month, Credit: 0, Debit: 0 };
      if (e.type === "credit") monthly[month].Credit += e.amount || 0;
      else monthly[month].Debit += e.amount || 0;
    });
    return Object.values(monthly).sort((a, b) => a.month.localeCompare(b.month));
  }, [allEntries]);

  // ---- Mutations: Entities ----
  const createProject = async (payload) => {
    const { data, error } = await supabase.from("expenses_projects").insert([payload]).select();
    if (error) return alert("Could not add project: " + error.message);
    setProjects(prev => [data[0], ...prev]);
  };

  const createRepair = async (payload) => {
    const { data, error } = await supabase.from("expenses_repairs").insert([payload]).select();
    if (error) return alert("Could not add repair: " + error.message);
    setRepairs(prev => [data[0], ...prev]);
  };

  const createPerson = async (payload) => {
    const { data, error } = await supabase.from("expenses_people").insert([payload]).select();
    if (error) return alert("Could not add person: " + error.message);
    setPeople(prev => [data[0], ...prev]);
  };

  // ---- Mutations: Entries ----
  const addProjectEntry = async (entry) => {
    const { data, error } = await supabase.from("expenses_project_entries").insert([entry]).select();
    if (error) return alert("Could not add: " + error.message);
    setProjectEntries(prev => [data[0], ...prev]);
  };

  const addRepairEntry = async (entry) => {
    const { data, error } = await supabase.from("expenses_repair_entries").insert([entry]).select();
    if (error) return alert("Could not add: " + error.message);
    setRepairEntries(prev => [data[0], ...prev]);
  };

  const addPeopleEntry = async (entry) => {
    const { data, error } = await supabase.from("expenses_people_entries").insert([entry]).select();
    if (error) return alert("Could not add: " + error.message);
    setPeopleEntries(prev => [data[0], ...prev]);
  };

  const addGeneralEntry = async (entry) => {
    const { data, error } = await supabase.from("expenses_general_entries").insert([entry]).select();
    if (error) return alert("Could not add: " + error.message);
    setGeneralEntries(prev => [data[0], ...prev]);
  };

  // ---- Scoped filtered entries per tab ----
  const scopedProjectEntries = useMemo(
    () => selectedProjectId ? projectEntries.filter(e => e.project_id === Number(selectedProjectId)) : projectEntries,
    [projectEntries, selectedProjectId]
  );

  const scopedRepairEntries = useMemo(
    () => selectedRepairId ? repairEntries.filter(e => e.repair_id === Number(selectedRepairId)) : repairEntries,
    [repairEntries, selectedRepairId]
  );

  const scopedPeopleEntries = useMemo(
    () => selectedPersonId ? peopleEntries.filter(e => e.person_id === Number(selectedPersonId)) : peopleEntries,
    [peopleEntries, selectedPersonId]
  );

  // ---- UI ----
  const tabs = [
    { key: "dashboard", label: "Dashboard" },
    { key: "projects", label: "Projects" },
    { key: "repairs", label: "Repairs" },
    { key: "people", label: "Customers / People" },
    { key: "general", label: "General" },
  ];

  return (
    <section style={sectionBg}>
      <h2 style={{ textAlign: "center", color: "#ff9800", margin: "25px 0 10px 0", fontWeight: 900 }}>
        💰 Easy Khata — Expense & Profit Manager
      </h2>

      <TabNav active={activeTab} setActive={setActiveTab} tabs={tabs} />

      {loading ? (
        <div style={{ textAlign: "center", color: "#888", marginTop: 20 }}>Loading...</div>
      ) : (
        <>
          {activeTab === "dashboard" && (
            <>
              <div style={{ display: "flex", justifyContent: "center", gap: 30, margin: "0 auto 26px auto", flexWrap: "wrap" }}>
                <Widget title="Total Credits (All)" value={globalTotals.credit} color="#43a047" />
                <Widget title="Total Debits (All)" value={globalTotals.debit} color="#e65100" />
                <Widget title="Total Profit (All)" value={globalTotals.profit} color="#ff9800" />
              </div>

              <div style={{ width: "98%", maxWidth: 820, margin: "0 auto 22px auto", background: "#fff", borderRadius: 13, boxShadow: "0 4px 22px #ff980016", padding: "20px 18px" }}>
                <h4 style={{ color: "#FF9800", marginBottom: 0, fontWeight: 800 }}>Monthly Credit vs Debit (All Ledgers)</h4>
                <ResponsiveContainer width="100%" height={270}>
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

              <SectionCard title="Recent Activity (All)">
                <LedgerTable entries={[...allEntries].slice(0, 25)} />
              </SectionCard>
            </>
          )}

          {activeTab === "projects" && (
            <>
              <SectionCard title="Add Project" style={{ maxWidth: 700, margin: "0 auto 16px auto" }}>
                <CreateEntityForm onCreate={createProject} placeholder="Project name" title="Add Project" />
              </SectionCard>

              <SectionCard title="Add Entry to Project" style={{ maxWidth: 900, margin: "0 auto 16px auto" }}>
                <EntryForm
                  onSubmit={(p) => addProjectEntry({ ...p, project_id: Number(p.project_id) })}
                  showEntitySelect
                  entities={projects}
                  entityLabel="Select Project"
                  entityKey="project_id"
                />
              </SectionCard>

              <SectionCard title="Project Ledger">
                <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 10 }}>
                  <select value={selectedProjectId} onChange={e => setSelectedProjectId(e.target.value)} style={inputStyle}>
                    <option value="">All Projects</option>
                    {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>

                <MiniDashboard entries={scopedProjectEntries} />
                <LedgerTable entries={scopedProjectEntries} entitiesMap={projectsMap} entityKey="project_id" />
              </SectionCard>
            </>
          )}

          {activeTab === "repairs" && (
            <>
              <SectionCard title="Add Repair Account" style={{ maxWidth: 700, margin: "0 auto 16px auto" }}>
                <CreateEntityForm onCreate={createRepair} placeholder="Repair name" title="Add Repair" />
              </SectionCard>

              <SectionCard title="Add Entry to Repair" style={{ maxWidth: 900, margin: "0 auto 16px auto" }}>
                <EntryForm
                  onSubmit={(p) => addRepairEntry({ ...p, repair_id: Number(p.repair_id) })}
                  showEntitySelect
                  entities={repairs}
                  entityLabel="Select Repair"
                  entityKey="repair_id"
                />
              </SectionCard>

              <SectionCard title="Repairs Ledger">
                <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 10 }}>
                  <select value={selectedRepairId} onChange={e => setSelectedRepairId(e.target.value)} style={inputStyle}>
                    <option value="">All Repairs</option>
                    {repairs.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                  </select>
                </div>

                <MiniDashboard entries={scopedRepairEntries} />
                <LedgerTable entries={scopedRepairEntries} entitiesMap={repairsMap} entityKey="repair_id" />
              </SectionCard>
            </>
          )}

          {activeTab === "people" && (
            <>
              <SectionCard title="Add Person / Customer" style={{ maxWidth: 700, margin: "0 auto 16px auto" }}>
                <CreateEntityForm
                  onCreate={createPerson}
                  placeholder="Full name"
                  title="Add Person"
                  extraFields={[{ name: "phone", placeholder: "Phone (optional)" }]}
                />
              </SectionCard>

              <SectionCard title="Add Entry to Person" style={{ maxWidth: 900, margin: "0 auto 16px auto" }}>
                <EntryForm
                  onSubmit={(p) => addPeopleEntry({ ...p, person_id: Number(p.person_id) })}
                  showEntitySelect
                  entities={people}
                  entityLabel="Select Person"
                  entityKey="person_id"
                />
              </SectionCard>

              <SectionCard title="People Ledger">
                <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 10 }}>
                  <select value={selectedPersonId} onChange={e => setSelectedPersonId(e.target.value)} style={inputStyle}>
                    <option value="">All People</option>
                    {people.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>

                <MiniDashboard entries={scopedPeopleEntries} />
                <LedgerTable entries={scopedPeopleEntries} entitiesMap={peopleMap} entityKey="person_id" />
              </SectionCard>
            </>
          )}

          {activeTab === "general" && (
            <>
              <SectionCard title="Add General Entry" style={{ maxWidth: 900, margin: "0 auto 16px auto" }}>
                <EntryForm onSubmit={addGeneralEntry} />
              </SectionCard>

              <SectionCard title="General Ledger">
                <MiniDashboard entries={generalEntries} />
                <LedgerTable entries={generalEntries} />
              </SectionCard>
            </>
          )}
        </>
      )}
    </section>
  );
}
