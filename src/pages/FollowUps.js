import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

// Status color mapping
const statusColors = {
  Pending: "#ffe0b2",
  Contacted: "#e3f2fd",
  Closed: "#c8e6c9",
  "Not Interested": "#ffcdd2"
};

function FollowUps() {
  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState(null);
  const [showDebugPanel, setShowDebugPanel] = useState(false);
  const [debugInfo, setDebugInfo] = useState(null);
  const [unsyncedCount, setUnsyncedCount] = useState(0);
  const [nullQuotationIdCount, setNullQuotationIdCount] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch quotations from Supabase
  async function fetchQuotationsFromSupabase() {
    try {
      console.log("Fetching quotations from Supabase...");
      
      const { data, error } = await supabase
        .from("quotations")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching from Supabase:", error);
        return null;
      }

      console.log("✅ Fetched quotations from Supabase:", data?.length || 0);
      return data || [];
    } catch (err) {
      console.error("Unexpected error fetching from Supabase:", err);
      return null;
    }
  }

  // Update follow-up data in Supabase
  async function updateFollowUpInSupabase(quotationId, field, value) {
    try {
      setSyncing(true);
      console.log(`🔄 Updating ${field} for quotation ${quotationId} in Supabase...`);

      const fieldMapping = {
        followUpDate: 'follow_up_date',
        followUpStatus: 'follow_up_status', 
        remarks: 'remarks'
      };

      const dbField = fieldMapping[field] || field;
      
      // Enhanced ID matching
      let existingRecord = null;
      let matchField = null;
      let matchValue = null;
      
      // Strategy 1: Try quotation_id field
      const { data: byQuotationId, error: error1 } = await supabase
        .from("quotations")
        .select("*")
        .eq("quotation_id", quotationId)
        .not("quotation_id", "is", null)
        .maybeSingle();
      
      if (!error1 && byQuotationId) {
        existingRecord = byQuotationId;
        matchField = "quotation_id";
        matchValue = quotationId;
      } else {
        // Strategy 2: Try id field
        if (!isNaN(quotationId)) {
          const { data: byId, error: error2 } = await supabase
            .from("quotations")
            .select("*")
            .eq("id", parseInt(quotationId))
            .maybeSingle();
          
          if (!error2 && byId) {
            existingRecord = byId;
            matchField = "id";
            matchValue = parseInt(quotationId);
          }
        }
        
        // Strategy 3: Find by customer name from localStorage
        if (!existingRecord) {
          const localData = JSON.parse(localStorage.getItem("quotations")) || [];
          const localRecord = localData.find(r => r.id === quotationId);
          
          if (localRecord && localRecord.customer?.name) {
            const { data: byCustomer, error: error3 } = await supabase
              .from("quotations")
              .select("*")
              .eq("customer_name", localRecord.customer.name)
              .maybeSingle();
            
            if (!error3 && byCustomer) {
              existingRecord = byCustomer;
              matchField = "customer_name";
              matchValue = localRecord.customer.name;
            }
          }
        }
      }
      
      if (!existingRecord) {
        console.error(`❌ No record found for: ${quotationId}`);
        setDebugInfo(prev => (prev || "") + `❌ Could not find record for ID: ${quotationId}\n`);
        return false;
      }

      // Prepare update data
      const updateData = { 
        [dbField]: value, 
        updated_at: new Date().toISOString() 
      };
      
      // If updating via customer_name but quotation_id is null, set quotation_id
      if (matchField === "customer_name" && !existingRecord.quotation_id) {
        updateData.quotation_id = quotationId;
      }
      
      // Perform the update
      const { data, error } = await supabase
        .from("quotations")
        .update(updateData)
        .eq(matchField, matchValue)
        .select(`id, quotation_id, customer_name, ${dbField}, updated_at`);

      if (error) {
        console.error("❌ Supabase update error:", error);
        setDebugInfo(prev => (prev || "") + `❌ Update failed: ${error.message}\n`);
        return false;
      }

      if (data && data.length > 0) {
        console.log("✅ Successfully updated in Supabase:", data[0]);
        setDebugInfo(prev => (prev || "") + `✅ Updated ${field} to "${value}" for ${data[0].customer_name}\n`);
        return true;
      } else {
        console.warn("⚠️ Update executed but no data returned");
        setDebugInfo(prev => (prev || "") + `⚠️ Update executed but no confirmation received\n`);
        return false;
      }
      
    } catch (err) {
      console.error("💥 Unexpected error updating Supabase:", err);
      setDebugInfo(prev => (prev || "") + `💥 Unexpected error: ${err.message}\n`);
      return false;
    } finally {
      setSyncing(false);
    }
  }

  // Convert Supabase data to localStorage format
  function convertSupabaseToLocalStorage(supabaseData) {
    return supabaseData.map(item => ({
      id: item.quotation_id || item.id,
      customer: {
        name: item.customer_name,
        contact: item.customer_contact,
        email: item.customer_email,
        address: item.customer_address
      },
      systemType: item.system_type,
      total: item.total_amount,
      date: item.created_at,
      followUpDate: item.follow_up_date || "",
      followUpStatus: item.follow_up_status || "Pending", 
      remarks: item.remarks || "",
      quotationDate: item.quotation_date
    }));
  }

  // Load and sync quotations from both sources
  async function loadQuotations() {
    try {
      setLoading(true);
      
      // Load from localStorage
      const localQuotations = JSON.parse(localStorage.getItem("quotations")) || [];
      
      // If we have local data, show it immediately
      if (localQuotations.length > 0) {
        setQuotations(localQuotations);
      }

      const supabaseQuotations = await fetchQuotationsFromSupabase();
      
      if (supabaseQuotations) {
        const convertedSupabaseData = convertSupabaseToLocalStorage(supabaseQuotations);
        
        // Create a set of all identifiers from Supabase
        const supabaseIds = new Set();
        supabaseQuotations.forEach(item => {
          if (item.id) supabaseIds.add(item.id.toString());
          if (item.quotation_id) supabaseIds.add(item.quotation_id);
        });
        
        // Merge data
        const mergedData = [...convertedSupabaseData];
        
        // Add local items that are not in the database and not deleted
        localQuotations.forEach(localItem => {
          if (localItem.quotation_id) {
            if (supabaseIds.has(localItem.quotation_id)) {
              return;
            } else {
              return;
            }
          }
          
          if (!supabaseIds.has(localItem.id)) {
            mergedData.push(localItem);
          }
        });
        
        // Update state and localStorage
        setQuotations(mergedData);
        localStorage.setItem("quotations", JSON.stringify(mergedData));
        
        // Update unsynced count
        const unsyncedRecords = localQuotations.filter(localItem => 
          !supabaseIds.has(localItem.id) && !localItem.quotation_id
        );
        setUnsyncedCount(unsyncedRecords.length);
        
        // Check for null quotation_id records
        const nullQuotationIdCount = supabaseQuotations.filter(r => !r.quotation_id).length;
        setNullQuotationIdCount(nullQuotationIdCount);
        
        setLastSyncTime(new Date());
        console.log("✅ Data synchronized successfully");
      } else {
        // If Supabase fails, just use localStorage
        console.log("Using localStorage data only");
        setQuotations(localQuotations);
        setUnsyncedCount(localQuotations.filter(item => !item.quotation_id).length);
      }
    } catch (err) {
      console.error("Error loading quotations:", err);
      const localQuotations = JSON.parse(localStorage.getItem("quotations")) || [];
      setQuotations(localQuotations);
      setUnsyncedCount(localQuotations.filter(item => !item.quotation_id).length);
    } finally {
      setLoading(false);
    }
  }

  // Load quotations on component mount
  useEffect(() => {
    loadQuotations();
  }, []);

  // Update field with dual storage
  const updateField = async (id, field, value) => {
    // Update localStorage immediately
    const updated = quotations.map((q) =>
      q.id === id ? { ...q, [field]: value } : q
    );
    setQuotations(updated);
    localStorage.setItem("quotations", JSON.stringify(updated));

    // Update Supabase in background
    const success = await updateFollowUpInSupabase(id, field, value);
    
    if (success) {
      setLastSyncTime(new Date());
    }
  };

  // Delete quotation
  const deleteQuotation = async (id) => {
    if (!window.confirm("Are you sure you want to delete this quotation? This action cannot be undone.")) {
      return;
    }

    setIsDeleting(true);
    
    try {
      // Remove from localStorage
      const updatedQuotations = quotations.filter(q => q.id !== id);
      setQuotations(updatedQuotations);
      localStorage.setItem("quotations", JSON.stringify(updatedQuotations));
      
      // Delete from database
      const { error } = await supabase
        .from('quotations')
        .delete()
        .or(`quotation_id.eq.${id},id.eq.${id}`);
      
      if (error) {
        console.error('Delete error:', error);
        alert('Quotation deleted locally but failed to delete from database');
      } else {
        alert('Quotation deleted successfully!');
      }
    } catch (err) {
      console.error('Delete error:', err);
      alert('Failed to delete quotation');
    } finally {
      setIsDeleting(false);
    }
  };

  // Manual sync function
  const manualSync = async () => {
    await loadQuotations();
  };

  // Filter to show only Pending and Contacted
  const filteredQuotations = quotations.filter(q => 
    (q.followUpStatus || "Pending") === "Pending" || 
    (q.followUpStatus || "Pending") === "Contacted"
  );

  return (
    <div className="followups-container" style={containerStyle}>
      {/* Header with sync status */}
      <div style={headerStyle}>
        <div>
          <h2 style={headerTitleStyle}>📅 Customer Follow-ups</h2>
          <div style={syncInfoStyle}>
            <span style={syncTextStyle}>
              {loading ? "Loading..." : `${filteredQuotations.length} follow-ups loaded`}
            </span>
            {lastSyncTime && (
              <span style={lastSyncStyle}>
                ✅ Last synced: {lastSyncTime.toLocaleTimeString()}
              </span>
            )}
            {syncing && (
              <span style={syncingStyle}>
                🔄 Syncing...
              </span>
            )}
          </div>
        </div>
        
        <div style={buttonGroupStyle}>
          <button
            onClick={manualSync}
            disabled={loading || syncing}
            style={syncButtonStyle}
          >
            {loading || syncing ? "🔄 Syncing..." : "🔄 Sync Now"}
          </button>
        </div>
      </div>

      {/* Follow-ups table */}
      {!loading || filteredQuotations.length > 0 ? (
        <div style={{ overflowX: "auto" }}>
          <table style={tableStyle}>
            <thead>
              <tr style={tableHeaderStyle}>
                <th style={thStyle}>Customer</th>
                <th style={thStyle}>Contact</th>
                <th style={thStyle}>System Type</th>
                <th style={thStyle}>Total Amount</th>
                <th style={thStyle}>Follow-Up Date</th>
                <th style={thStyle}>Status</th>
                <th style={thStyle}>Remarks</th>
                <th style={thStyle}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredQuotations.map((q, index) => {
                const viewOnly = isViewOnly(q.followUpStatus || "Pending");
                return (
                  <tr
                    key={q.id || index}
                    style={{
                      background: statusColors[q.followUpStatus || "Pending"] || "#fff",
                      opacity: syncing ? 0.8 : 1,
                      transition: "opacity 0.3s ease"
                    }}
                  >
                    <td style={tdStyle}>
                      <div style={{ fontWeight: "700", color: "#333" }}>
                        {q.customer.name}
                      </div>
                      <div style={{ fontSize: "12px", color: "#666" }}>
                        ID: {q.id}
                      </div>
                    </td>
                    <td style={tdStyle}>
                      <div>{q.customer.contact}</div>
                      {q.customer.email && (
                        <div style={{ fontSize: "12px", color: "#666" }}>
                          {q.customer.email}
                        </div>
                      )}
                    </td>
                    <td style={tdStyle}>{q.systemType}</td>
                    <td style={tdStyle}>
                      <div style={{ fontWeight: "700", color: "#FF9800" }}>
                        Rs. {(q.total || 0).toLocaleString()}
                      </div>
                    </td>
                    <td style={tdStyle}>
                      <input
                        type="date"
                        value={q.followUpDate || ""}
                        disabled={viewOnly}
                        style={inputStyle}
                        onChange={(e) =>
                          updateField(q.id, "followUpDate", e.target.value)
                        }
                      />
                    </td>
                    <td style={tdStyle}>
                      <select
                        value={q.followUpStatus || "Pending"}
                        disabled={viewOnly}
                        style={selectStyle}
                        onChange={(e) => {
                          updateField(q.id, "followUpStatus", e.target.value);
                        }}
                      >
                        <option>Pending</option>
                        <option>Contacted</option>
                        <option>Closed</option>
                        <option>Not Interested</option>
                      </select>
                    </td>
                    <td style={tdStyle}>
                      <input
                        type="text"
                        placeholder="Add remarks..."
                        value={q.remarks || ""}
                        disabled={viewOnly}
                        style={inputStyle}
                        onChange={(e) =>
                          updateField(q.id, "remarks", e.target.value)
                        }
                      />
                    </td>
                    <td style={tdStyle}>
                      <button 
                        onClick={() => deleteQuotation(q.id)} 
                        disabled={isDeleting}
                        style={deleteButtonStyle}
                      >
                        {isDeleting ? "⏳" : "🗑️"}
                      </button>
                    </td>
                  </tr>
                );
              })}
              {filteredQuotations.length === 0 && !loading && (
                <tr>
                  <td
                    colSpan="8"
                    style={noQuotationsStyle}
                  >
                    <div style={{ fontSize: "3rem", marginBottom: "15px" }}>📋</div>
                    <div style={{ marginBottom: "10px" }}>No follow-ups found</div>
                    <span style={{ color: "#ff9800", fontWeight: 700 }}>
                      All quotations are closed or not interested
                    </span>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      ) : null}

      {/* Summary stats */}
      {filteredQuotations.length > 0 && (
        <div style={summaryStyle}>
          <h3 style={summaryTitleStyle}>📊 Follow-up Summary</h3>
          <div style={statsGridStyle}>
            {Object.keys(statusColors).map(status => {
              if (status === "Closed" || status === "Not Interested") return null;
              
              const count = filteredQuotations.filter(q => (q.followUpStatus || "Pending") === status).length;
              const total = filteredQuotations.reduce((sum, q) => 
                (q.followUpStatus || "Pending") === status ? sum + (q.total || 0) : sum, 0
              );
              return (
                <div key={status} style={statCardStyle(statusColors[status])}>
                  <div style={statValueStyle}>{count}</div>
                  <div style={statTitleStyle}>{status}</div>
                  <div style={statAmountStyle}>
                    Rs. {total.toLocaleString()}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Sync status footer */}
      <div style={footerStyle}>
        💡 <strong>Dual Storage:</strong> All changes are saved both locally and in the cloud database for maximum reliability.
        {lastSyncTime && (
          <span> Last synchronized at {lastSyncTime.toLocaleString()}.</span>
        )}
      </div>
    </div>
  );
}

// --- Styling ---
const containerStyle = {
  maxWidth: 1200,
  margin: "40px auto",
  background: "#fff",
  borderRadius: 13,
  boxShadow: "0 6px 32px #ffab0022",
  padding: "32px 18px"
};

const headerStyle = {
  display: "flex", 
  justifyContent: "space-between", 
  alignItems: "center", 
  marginBottom: 30,
  flexWrap: "wrap",
  gap: "15px"
};

const headerTitleStyle = {
  color: "#FF9800", 
  fontWeight: 900, 
  margin: "0 0 5px 0"
};

const syncInfoStyle = {
  display: "flex", 
  alignItems: "center", 
  gap: "15px", 
  flexWrap: "wrap"
};

const syncTextStyle = {
  color: "#666", 
  fontSize: "14px"
};

const lastSyncStyle = {
  color: "#4caf50", 
  fontSize: "12px"
};

const syncingStyle = {
  color: "#ff9800", 
  fontSize: "12px"
};

const buttonGroupStyle = {
  display: "flex", 
  gap: "10px", 
  flexWrap: "wrap"
};

const syncButtonStyle = {
  background: "linear-gradient(135deg, #4caf50, #45a049)",
  color: "white",
  border: "none",
  borderRadius: "8px",
  padding: "10px 20px",
  cursor: "pointer",
  fontSize: "14px",
  fontWeight: "600",
  transition: "all 0.3s ease"
};

const tableStyle = {
  width: "100%",
  borderCollapse: "collapse",
  background: "#fff",
  borderRadius: 12,
  overflow: "hidden",
  fontSize: 16
};

const tableHeaderStyle = {
  background: "#fff3e0"
};

const thStyle = {
  color: "#e65100",
  fontWeight: 900,
  fontSize: 16,
  padding: "15px 8px",
  textAlign: "center"
};

const tdStyle = {
  padding: "12px 8px",
  textAlign: "center",
  fontWeight: 600,
  background: "#fffaf4",
  verticalAlign: "middle"
};

const inputStyle = {
  border: "1.5px solid #ffe0b2",
  borderRadius: 8,
  padding: "8px 10px",
  fontSize: 14,
  width: "95%",
  outline: "none",
  transition: "border-color 0.3s ease"
};

const selectStyle = {
  ...inputStyle,
  fontWeight: "bold",
};

const noQuotationsStyle = {
  textAlign: "center",
  padding: "40px 20px",
  color: "#aaa",
  fontSize: 17,
  background: "#fffbe9"
};

const summaryStyle = {
  marginTop: "30px",
  padding: "20px",
  background: "linear-gradient(135deg, #FFF3E0, #FFE0B2)",
  borderRadius: "12px",
  border: "2px solid #FF9800"
};

const summaryTitleStyle = {
  color: "#FF9800", 
  margin: "0 0 15px 0"
};

const statsGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
  gap: "15px"
};

const statCardStyle = (bgColor) => ({
  background: bgColor,
  padding: "15px",
  borderRadius: "10px",
  textAlign: "center",
  border: "1px solid rgba(0,0,0,0.1)"
});

const statValueStyle = {
  fontWeight: "700", 
  fontSize: "18px", 
  marginBottom: "5px"
};

const statTitleStyle = {
  fontSize: "14px", 
  fontWeight: "600", 
  marginBottom: "5px"
};

const statAmountStyle = {
  fontSize: "12px", 
  color: "#666"
};

const footerStyle = {
  marginTop: "20px",
  padding: "15px",
  background: "#f8f9fa",
  borderRadius: "8px",
  fontSize: "12px",
  color: "#666",
  textAlign: "center"
};

const deleteButtonStyle = {
  background: "#f44336",
  color: "white",
  border: "none",
  borderRadius: "50%",
  width: "32px",
  height: "32px",
  cursor: "pointer",
  fontSize: "16px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center"
};

const isViewOnly = (status) =>
  status === "Closed" || status === "Not Interested";

export default FollowUps;