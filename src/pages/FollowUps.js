import React, { useEffect, useState } from "react";

// Mock Supabase client for demo purposes
const supabase = {
  from: (table) => ({
    insert: (data) => ({ 
      select: () => Promise.resolve({ 
        data: data.map((item, index) => ({ ...item, id: Date.now() + index })), 
        error: null 
      }) 
    }),
    select: (fields) => ({
      order: (field, options) => ({
        in: (field, values) => Promise.resolve({ 
          data: [], 
          error: null 
        })
      }),
      eq: (field, value) => ({
        single: () => Promise.resolve({ data: null, error: null })
      }),
      order: (field, options) => Promise.resolve({ 
        data: [], 
        error: null 
      })
    }),
    update: (data) => ({
      eq: (field, value) => ({
        select: () => Promise.resolve({ data: [], error: null })
      })
    }),
    delete: () => ({
      eq: (field, value) => Promise.resolve({ error: null })
    })
  })
};

// Status color mapping
const statusColors = {
  pending: "#ffe0b2",
  contacted: "#e3f2fd",
  completed: "#e8f5e8",
  cancelled: "#ffebee"
};

function FollowUps() {
  const [quotations, setQuotations] = useState([]);
  const [historyQuotations, setHistoryQuotations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState(null);
  const [activeTab, setActiveTab] = useState('followups'); // 'followups' or 'history'
  const [showDebugPanel, setShowDebugPanel] = useState(false);
  const [debugInfo, setDebugInfo] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedQuotation, setSelectedQuotation] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);

  // --- SUPABASE INTEGRATION ---
  
  // Fetch quotations from Supabase
  async function fetchQuotationsFromSupabase() {
    try {
      console.log("Fetching quotations from Supabase...");
      
      const { data, error } = await supabase
        .from("quotations")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Supabase fetch error:", error);
        throw new Error(error.message);
      }

      return (data || []).map(item => ({
        id: item.quotation_id || item.id.toString(),
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
        followUpStatus: (item.follow_up_status || 'pending').toLowerCase(),
        remarks: item.remarks || "",
        quotationDate: item.quotation_date,
        staff: item.staff_name,
        location: item.location,
        // Equipment details
        solarPanel: {
          company: item.panel_brand,
          watts: item.panel_watt,
          quantity: item.panel_quantity
        },
        inverter: {
          company: item.inverter_type,
          kw: item.inverter_size?.replace('kW','') || '0'
        },
        batteryModel: item.battery_model,
        batteryQuantity: item.battery_quantity || 0
      }));

    } catch (err) {
      console.error("Unexpected error fetching from Supabase:", err);
      throw err;
    }
  }

  // Update follow-up data in Supabase
  async function updateFollowUpInSupabase(quotationId, field, value) {
    try {
      setSyncing(true);
      console.log(`Updating ${field} = "${value}" for quotation ${quotationId}`);

      // Map the field names to database column names
      const fieldMapping = {
        followUpDate: 'follow_up_date',
        followUpStatus: 'follow_up_status', 
        remarks: 'remarks'
      };

      const dbField = fieldMapping[field] || field;
      
      // Try multiple ID matching strategies
      let matchField = "quotation_id";
      let matchValue = quotationId;
      
      // First try quotation_id
      let { data, error } = await supabase
        .from("quotations")
        .update({ 
          [dbField]: value, 
          updated_at: new Date().toISOString() 
        })
        .eq(matchField, matchValue)
        .select();

      // If no match with quotation_id, try with id field
      if ((!data || data.length === 0) && !isNaN(quotationId)) {
        matchField = "id";
        matchValue = parseInt(quotationId);
        
        const result = await supabase
          .from("quotations")
          .update({ 
            [dbField]: value, 
            updated_at: new Date().toISOString() 
          })
          .eq(matchField, matchValue)
          .select();
          
        data = result.data;
        error = result.error;
      }

      if (error) {
        console.error("Supabase update error:", error);
        throw new Error(error.message);
      }

      if (data && data.length > 0) {
        console.log("Successfully updated in Supabase:", data[0]);
        return true;
      } else {
        console.warn("Update executed but no data returned");
        return false;
      }
      
    } catch (err) {
      console.error("Update Supabase error:", err);
      throw err;
    } finally {
      setSyncing(false);
    }
  }

  // Load quotations from both sources
  async function loadAllQuotations() {
    try {
      setLoading(true);
      
      // Load from localStorage first for immediate display
      const localQuotations = JSON.parse(localStorage.getItem("quotations")) || [];
      console.log("Loaded from localStorage:", localQuotations.length);
      
      // Separate active follow-ups and history
      const activeFollowUps = localQuotations.filter(q => 
        ['pending', 'contacted'].includes((q.followUpStatus || 'pending').toLowerCase())
      );
      const historyItems = localQuotations.filter(q => 
        ['completed', 'cancelled'].includes((q.followUpStatus || 'pending').toLowerCase())
      );
      
      setQuotations(activeFollowUps);
      setHistoryQuotations(historyItems);

      // Then sync with Supabase
      try {
        const supabaseQuotations = await fetchQuotationsFromSupabase();
        console.log("Loaded from Supabase:", supabaseQuotations.length);
        
        // Merge data (prioritize Supabase)
        const mergedQuotations = [...supabaseQuotations];
        
        // Add local-only quotations
        localQuotations.forEach(localQuote => {
          const existsInSupabase = supabaseQuotations.find(sq => sq.id === localQuote.id);
          if (!existsInSupabase) {
            mergedQuotations.push({ ...localQuote, localOnly: true });
          }
        });

        // Separate merged data
        const mergedActiveFollowUps = mergedQuotations.filter(q => 
          ['pending', 'contacted'].includes((q.followUpStatus || 'pending').toLowerCase())
        );
        const mergedHistoryItems = mergedQuotations.filter(q => 
          ['completed', 'cancelled'].includes((q.followUpStatus || 'pending').toLowerCase())
        );
        
        setQuotations(mergedActiveFollowUps);
        setHistoryQuotations(mergedHistoryItems);
        
        // Update localStorage with all merged data
        localStorage.setItem("quotations", JSON.stringify(mergedQuotations));
        
        setLastSyncTime(new Date());
        console.log("✅ Data synchronized successfully");
        
      } catch (supabaseError) {
        console.warn("Supabase sync failed, using local data only:", supabaseError);
      }
      
    } catch (err) {
      console.error("Error loading quotations:", err);
      // Fallback to localStorage only
      const localQuotations = JSON.parse(localStorage.getItem("quotations")) || [];
      const activeFollowUps = localQuotations.filter(q => 
        ['pending', 'contacted'].includes((q.followUpStatus || 'pending').toLowerCase())
      );
      const historyItems = localQuotations.filter(q => 
        ['completed', 'cancelled'].includes((q.followUpStatus || 'pending').toLowerCase())
      );
      setQuotations(activeFollowUps);
      setHistoryQuotations(historyItems);
    } finally {
      setLoading(false);
    }
  }

  // Load quotations on component mount
  useEffect(() => {
    loadAllQuotations();
  }, []);

  // Update field with dual storage (localStorage + Supabase)
  const updateField = async (id, field, value) => {
    try {
      // Update localStorage immediately (for responsive UI)
      const allQuotations = JSON.parse(localStorage.getItem("quotations")) || [];
      const updatedAllQuotations = allQuotations.map(q =>
        q.id === id ? { ...q, [field]: value } : q
      );
      localStorage.setItem("quotations", JSON.stringify(updatedAllQuotations));

      // Update UI state immediately
      if (['completed', 'cancelled'].includes(value) && field === 'followUpStatus') {
        // Move from follow-ups to history
        const updatedFollowUps = quotations.filter(q => q.id !== id);
        const movedItem = quotations.find(q => q.id === id);
        if (movedItem) {
          const updatedItem = { ...movedItem, [field]: value };
          setHistoryQuotations(prev => [updatedItem, ...prev]);
        }
        setQuotations(updatedFollowUps);
        
        // Show success message
        setTimeout(() => {
          alert(`✅ Quotation marked as ${value} and moved to history!`);
        }, 100);
      } else if (['pending', 'contacted'].includes(value) && field === 'followUpStatus') {
        // Move from history to follow-ups (if applicable)
        const updatedHistory = historyQuotations.filter(q => q.id !== id);
        const movedItem = historyQuotations.find(q => q.id === id);
        if (movedItem) {
          const updatedItem = { ...movedItem, [field]: value };
          setQuotations(prev => [updatedItem, ...prev]);
          setHistoryQuotations(updatedHistory);
        } else {
          // Update in follow-ups
          const updatedFollowUps = quotations.map(q =>
            q.id === id ? { ...q, [field]: value } : q
          );
          setQuotations(updatedFollowUps);
        }
      } else {
        // Regular update
        const updatedFollowUps = quotations.map(q =>
          q.id === id ? { ...q, [field]: value } : q
        );
        const updatedHistory = historyQuotations.map(q =>
          q.id === id ? { ...q, [field]: value } : q
        );
        setQuotations(updatedFollowUps);
        setHistoryQuotations(updatedHistory);
      }

      // Update Supabase in background
      try {
        const success = await updateFollowUpInSupabase(id, field, value);
        if (success) {
          setLastSyncTime(new Date());
          console.log("✅ Field updated successfully in database");
        } else {
          console.log("⚠️ Field updated in localStorage only");
        }
      } catch (supabaseError) {
        console.warn("Failed to update in Supabase:", supabaseError);
        // Still show success since localStorage was updated
      }
      
    } catch (err) {
      console.error("Error updating field:", err);
      alert("❌ Error updating field: " + err.message);
    }
  };

  // Manual sync function
  const manualSync = async () => {
    setSyncing(true);
    try {
      await loadAllQuotations();
    } finally {
      setSyncing(false);
    }
  };

  // Filter quotations based on search and status
  const getFilteredQuotations = (quotationsList) => {
    let filtered = quotationsList;

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(q =>
        q.customer.name.toLowerCase().includes(term) ||
        q.customer.contact.toLowerCase().includes(term) ||
        q.systemType.toLowerCase().includes(term) ||
        q.id.toLowerCase().includes(term)
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(q => 
        (q.followUpStatus || 'pending').toLowerCase() === statusFilter
      );
    }

    return filtered;
  };

  // View quotation details
  const viewQuotation = (quotation) => {
    setSelectedQuotation(quotation);
    setShowViewModal(true);
  };

  // Print quotation
  const printQuotation = (quotationData) => {
    try {
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        alert("Please allow pop-ups to print quotations.");
        return;
      }
      
      const quotationHTML = generateQuotationHTML(quotationData);
      
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="UTF-8">
            <title>Quotation - ${quotationData?.customer.name}</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 0; padding: 15px; }
              table { border-collapse: collapse; width: 100%; margin: 8px 0; }
              th, td { border: 1px solid #ddd; padding: 6px; text-align: left; font-size: 11px; }
              th { background-color: #FF6B35 !important; color: white !important; }
              .header { margin-bottom: 15px; }
              .total-section { margin-top: 15px; padding: 12px; background-color: #f8f9fa; }
              @media print { body { margin: 0; padding: 10px; } }
            </style>
          </head>
          <body>
            ${quotationHTML}
            <script>
              window.onload = function() {
                setTimeout(function() {
                  window.print();
                  window.onafterprint = function() { window.close(); }
                }, 500);
              }
            </script>
          </body>
        </html>
      `);
      
      printWindow.document.close();
    } catch (error) {
      console.error("Error printing quotation:", error);
      alert("❌ Error printing quotation. Please try again.");
    }
  };

  const generateQuotationHTML = (quotationData) => {
    return `
      <div>
        <div class="header">
          <h1>SYED SOLAR ENERGY PVT LTD</h1>
          <p>📍 Office #23 Mustafa Plaza Ring Road, Peshawar</p>
          <p>📞 0307-5596695 | 📧 sales@syedsolarenergy.com</p>
          <h2>QUOTATION #${quotationData.id}</h2>
          <p><strong>Date:</strong> ${quotationData.quotationDate || new Date().toLocaleDateString()}</p>
        </div>
        
        <div>
          <h3>Customer Information</h3>
          <p><strong>Name:</strong> ${quotationData.customer.name}</p>
          <p><strong>Contact:</strong> ${quotationData.customer.contact}</p>
          <p><strong>Email:</strong> ${quotationData.customer.email || '-'}</p>
          <p><strong>Address:</strong> ${quotationData.customer.address}</p>
        </div>
        
        <div>
          <h3>System Details</h3>
          <p><strong>Type:</strong> ${quotationData.systemType}</p>
          <p><strong>Total Amount:</strong> Rs. ${quotationData.total.toLocaleString()}</p>
          <p><strong>Status:</strong> ${quotationData.followUpStatus || 'pending'}</p>
        </div>
        
        <div class="total-section">
          <h3>Terms & Conditions</h3>
          <ul>
            <li>5% advance payment required</li>
            <li>70% on material delivery</li>
            <li>25% on completion</li>
            <li>Quotation valid for 3 days</li>
          </ul>
        </div>
      </div>
    `;
  };

  // Debug functions
  const runDatabaseDiagnostics = async () => {
    try {
      setDebugInfo("🔍 Running database diagnostics...\n");
      
      const localData = JSON.parse(localStorage.getItem("quotations")) || [];
      setDebugInfo(prev => prev + `💾 localStorage quotations: ${localData.length}\n`);
      
      try {
        const supabaseQuotations = await fetchQuotationsFromSupabase();
        setDebugInfo(prev => prev + `☁️ Supabase quotations: ${supabaseQuotations.length}\n`);
        
        // Check for sync issues
        const localIds = new Set(localData.map(q => q.id));
        const supabaseIds = new Set(supabaseQuotations.map(q => q.id));
        
        const localOnly = localData.filter(q => !supabaseIds.has(q.id));
        const supabaseOnly = supabaseQuotations.filter(q => !localIds.has(q.id));
        
        setDebugInfo(prev => prev + `📱 Local only: ${localOnly.length}\n`);
        setDebugInfo(prev => prev + `☁️ Supabase only: ${supabaseOnly.length}\n`);
        
        if (localOnly.length > 0) {
          setDebugInfo(prev => prev + "📱 Local only quotations:\n");
          localOnly.forEach(q => {
            setDebugInfo(prev => prev + `  - ${q.id}: ${q.customer.name}\n`);
          });
        }
        
      } catch (supabaseError) {
        setDebugInfo(prev => prev + `❌ Supabase connection failed: ${supabaseError.message}\n`);
      }
      
      setDebugInfo(prev => prev + "\n✅ Diagnostics complete\n");
      
    } catch (err) {
      setDebugInfo(prev => prev + `💥 Diagnostic error: ${err.message}\n`);
    }
  };

  const testDirectUpdate = async () => {
    if (quotations.length === 0) {
      alert("No follow-up quotations available to test");
      return;
    }
    
    const testQuotation = quotations[0];
    setDebugInfo(prev => prev + `\n🧪 Testing direct update for: ${testQuotation.customer.name} (ID: ${testQuotation.id})\n`);
    
    try {
      const success = await updateFollowUpInSupabase(
        testQuotation.id, 
        "remarks", 
        `Test update at ${new Date().toLocaleTimeString()}`
      );
      setDebugInfo(prev => prev + `${success ? "✅" : "❌"} Test update result: ${success ? "SUCCESS" : "FAILED"}\n`);
    } catch (err) {
      setDebugInfo(prev => prev + `❌ Test update failed: ${err.message}\n`);
    }
  };

  // Get current tab data
  const getCurrentTabData = () => {
    if (activeTab === 'followups') {
      return getFilteredQuotations(quotations);
    } else {
      return getFilteredQuotations(historyQuotations);
    }
  };

  const currentTabData = getCurrentTabData();

  return (
    <div style={styles.container}>
      {/* Header with sync status */}
      <div style={styles.header}>
        <div style={styles.headerContent}>
          <div>
            <h2 style={styles.title}>📅 Customer Follow-ups</h2>
            <div style={styles.statusInfo}>
              <span style={styles.statusText}>
                {loading ? "Loading..." : 
                 activeTab === 'followups' ? 
                   `${quotations.length} active follow-ups` : 
                   `${historyQuotations.length} completed/cancelled`
                }
              </span>
              {lastSyncTime && (
                <span style={styles.syncTime}>
                  ✅ Last synced: {lastSyncTime.toLocaleTimeString()}
                </span>
              )}
              {syncing && (
                <span style={styles.syncingText}>
                  🔄 Syncing...
                </span>
              )}
            </div>
          </div>
          
          <div style={styles.headerActions}>
            <button
              onClick={manualSync}
              disabled={loading || syncing}
              style={styles.syncButton}
            >
              {loading || syncing ? "🔄 Syncing..." : "🔄 Sync Now"}
            </button>
            
            <button
              onClick={() => setShowDebugPanel(!showDebugPanel)}
              style={styles.debugButton}
            >
              🔧 Debug Panel
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={styles.tabsContainer}>
        <button
          onClick={() => setActiveTab('followups')}
          style={{
            ...styles.tab,
            ...(activeTab === 'followups' ? styles.activeTab : {})
          }}
        >
          📞 Active Follow-ups ({quotations.length})
        </button>
        <button
          onClick={() => setActiveTab('history')}
          style={{
            ...styles.tab,
            ...(activeTab === 'history' ? styles.activeTab : {})
          }}
        >
          📋 History ({historyQuotations.length})
        </button>
      </div>

      {/* Search and Filter */}
      <div style={styles.filtersContainer}>
        <div style={styles.searchContainer}>
          <input
            type="text"
            placeholder="🔍 Search by name, contact, or quotation ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={styles.searchInput}
          />
        </div>
        
        <div style={styles.statusFilters}>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={styles.filterSelect}
          >
            <option value="all">All Status</option>
            {activeTab === 'followups' ? (
              <>
                <option value="pending">Pending</option>
                <option value="contacted">Contacted</option>
              </>
            ) : (
              <>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </>
            )}
          </select>
        </div>
      </div>

      {/* Info Panel */}
      <div style={styles.infoPanel}>
        <div style={styles.infoIcon}>ℹ️</div>
        <div style={styles.infoContent}>
          <div style={styles.infoTitle}>Follow-up Management</div>
          <div style={styles.infoText}>
            {activeTab === 'followups' ? 
              "Manage pending and contacted quotations. Update status to move items to history." :
              "View completed and cancelled quotations. Change status back to pending/contacted to reactivate."
            }
          </div>
        </div>
      </div>

      {/* Debug Panel */}
      {showDebugPanel && (
        <div style={styles.debugPanel}>
          <h3 style={styles.debugTitle}>🔧 Debug Panel</h3>
          
          <div style={styles.debugActions}>
            <button onClick={runDatabaseDiagnostics} style={styles.debugActionButton}>
              🔍 Run Diagnostics
            </button>
            <button onClick={testDirectUpdate} disabled={quotations.length === 0 || syncing} style={styles.debugActionButton}>
              🧪 Test Update
            </button>
            <button onClick={() => setDebugInfo("")} style={styles.debugActionButton}>
              🗑️ Clear Log
            </button>
          </div>
          
          {debugInfo && (
            <div style={styles.debugLog}>
              {debugInfo}
            </div>
          )}
        </div>
      )}

      {/* Loading state */}
      {loading && currentTabData.length === 0 && (
        <div style={styles.loadingContainer}>
          <div style={styles.loadingIcon}>⏳</div>
          <h3>Loading Follow-ups...</h3>
          <p>Fetching quotation data from database</p>
        </div>
      )}

      {/* Quotations table */}
      {!loading || currentTabData.length > 0 ? (
        <div style={styles.tableContainer}>
          <table style={styles.table}>
            <thead>
              <tr style={styles.tableHeader}>
                <th style={styles.th}>Customer</th>
                <th style={styles.th}>Contact</th>
                <th style={styles.th}>System Type</th>
                <th style={styles.th}>Total Amount</th>
                <th style={styles.th}>Follow-Up Date</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Remarks</th>
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentTabData.map((q, index) => (
                <tr
                  key={q.id || index}
                  style={{
                    ...styles.tableRow,
                    background: statusColors[q.followUpStatus || "pending"] || "#fff",
                    opacity: syncing ? 0.8 : 1
                  }}
                >
                  <td style={styles.td}>
                    <div style={styles.customerName}>{q.customer.name}</div>
                    <div style={styles.quotationId}>ID: {q.id}</div>
                    {q.localOnly && (
                      <div style={styles.localOnlyBadge}>📱 Local</div>
                    )}
                  </td>
                  <td style={styles.td}>
                    <div>{q.customer.contact}</div>
                    {q.customer.email && (
                      <div style={styles.emailText}>{q.customer.email}</div>
                    )}
                  </td>
                  <td style={styles.td}>{q.systemType}</td>
                  <td style={styles.td}>
                    <div style={styles.totalAmount}>Rs. {(q.total || 0).toLocaleString()}</div>
                  </td>
                  <td style={styles.td}>
                    <input
                      type="date"
                      value={q.followUpDate || ""}
                      style={styles.dateInput}
                      onChange={(e) => updateField(q.id, "followUpDate", e.target.value)}
                      disabled={syncing}
                    />
                  </td>
                  <td style={styles.td}>
                    <select
                      value={q.followUpStatus || "pending"}
                      style={styles.statusSelect}
                      onChange={(e) => updateField(q.id, "followUpStatus", e.target.value)}
                      disabled={syncing}
                    >
                      <option value="pending">Pending</option>
                      <option value="contacted">Contacted</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </td>
                  <td style={styles.td}>
                    <input
                      type="text"
                      placeholder={q.followUpStatus === 'contacted' ? "Add contact details..." : "Add remarks..."}
                      value={q.remarks || ""}
                      style={styles.remarksInput}
                      onChange={(e) => updateField(q.id, "remarks", e.target.value)}
                      disabled={syncing}
                    />
                  </td>
                  <td style={styles.td}>
                    <div style={styles.actionButtons}>
                      <button
                        onClick={() => viewQuotation(q)}
                        style={styles.viewButton}
                        title="View Details"
                      >
                        👁️
                      </button>
                      <button
                        onClick={() => printQuotation(q)}
                        style={styles.printButton}
                        title="Print Quotation"
                      >
                        🖨️
                      </button>
                      {activeTab === 'followups' && (
                        <>
                          <button
                            onClick={() => updateField(q.id, "followUpStatus", "completed")}
                            style={styles.completeButton}
                            title="Mark as Completed"
                            disabled={syncing}
                          >
                            ✅
                          </button>
                          <button
                            onClick={() => updateField(q.id, "followUpStatus", "cancelled")}
                            style={styles.cancelButton}
                            title="Mark as Cancelled"
                            disabled={syncing}
                          >
                            ❌
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              
              {currentTabData.length === 0 && !loading && (
                <tr>
                  <td colSpan="8" style={styles.emptyState}>
                    <div style={styles.emptyIcon}>
                      {activeTab === 'followups' ? '🎉' : '📋'}
                    </div>
                    <div style={styles.emptyTitle}>
                      {activeTab === 'followups' ? 'No pending follow-ups!' : 'No history items found'}
                    </div>
                    <div style={styles.emptySubtitle}>
                      {activeTab === 'followups' ? 
                        'All quotations have been completed or cancelled' :
                        'No completed or cancelled quotations yet'
                      }
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      ) : null}

      {/* Summary stats */}
      {currentTabData.length > 0 && (
        <div style={styles.summarySection}>
          <h3 style={styles.summaryTitle}>📊 Summary</h3>
          <div style={styles.summaryGrid}>
            {(activeTab === 'followups' ? ['pending', 'contacted'] : ['completed', 'cancelled']).map(status => {
              const count = currentTabData.filter(q => (q.followUpStatus || "pending") === status).length;
              const total = currentTabData.reduce((sum, q) => 
                (q.followUpStatus || "pending") === status ? sum + (q.total || 0) : sum, 0
              );
              return (
                <div key={status} style={styles.summaryCard}>
                  <div style={styles.summaryCount}>{count}</div>
                  <div style={styles.summaryLabel}>{status}</div>
                  <div style={styles.summaryAmount}>Rs. {total.toLocaleString()}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* View Modal */}
      {showViewModal && selectedQuotation && (
        <div style={styles.modal}>
          <div style={styles.modalContent}>
            <div style={styles.modalHeader}>
              <h2>📋 Quotation Details</h2>
              <button 
                onClick={() => setShowViewModal(false)} 
                style={styles.closeButton}
              >
                ✕
              </button>
            </div>
            
            <div style={styles.modalBody}>
              <div style={styles.detailsGrid}>
                <div>
                  <h3>Customer Information</h3>
                  <p><strong>Name:</strong> {selectedQuotation.customer.name}</p>
                  <p><strong>Contact:</strong> {selectedQuotation.customer.contact}</p>
                  <p><strong>Email:</strong> {selectedQuotation.customer.email || '-'}</p>
                  <p><strong>Address:</strong> {selectedQuotation.customer.address}</p>
                </div>
                
                <div>
                  <h3>System Details</h3>
                  <p><strong>Type:</strong> {selectedQuotation.systemType}</p>
                  <p><strong>Total:</strong> Rs. {selectedQuotation.total.toLocaleString()}</p>
                  <p><strong>Status:</strong> {selectedQuotation.followUpStatus || 'pending'}</p>
                  <p><strong>Staff:</strong> {selectedQuotation.staff || '-'}</p>
                </div>
              </div>
              
              <div style={styles.followUpDetails}>
                <h3>Follow-up Information</h3>
                <p><strong>Follow-up Date:</strong> {selectedQuotation.followUpDate || 'Not set'}</p>
                <p><strong>Remarks:</strong> {selectedQuotation.remarks || 'No remarks'}</p>
                <p><strong>Created:</strong> {new Date(selectedQuotation.date).toLocaleDateString()}</p>
              </div>
            </div>
            
            <div style={styles.modalActions}>
              <button 
                onClick={() => printQuotation(selectedQuotation)}
                style={styles.printButton}
              >
                🖨️ Print
              </button>
              <button 
                onClick={() => setShowViewModal(false)}
                style={styles.closeModalButton}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sync status footer */}
      <div style={styles.footer}>
        💡 <strong>Follow-up Management:</strong> Active follow-ups are automatically synced with the database. 
        Completed/cancelled quotations are preserved in history but can be reactivated if needed.
        {lastSyncTime && (
          <span> Last synchronized at {lastSyncTime.toLocaleString()}.</span>
        )}
      </div>
    </div>
  );
}

// Comprehensive styles object
const styles = {
  container: {
    maxWidth: '1200px',
    margin: '40px auto',
    background: '#fff',
    borderRadius: '13px',
    boxShadow: '0 6px 32px #ffab0022',
    padding: '32px 18px',
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
  },
  
  header: {
    marginBottom: '30px',
  },
  
  headerContent: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '15px',
  },
  
  title: {
    color: '#FF9800',
    fontWeight: '900',
    margin: '0 0 5px 0',
    fontSize: '1.8rem',
  },
  
  statusInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
    flexWrap: 'wrap',
  },
  
  statusText: {
    color: '#666',
    fontSize: '14px',
  },
  
  syncTime: {
    color: '#4caf50',
    fontSize: '12px',
  },
  
  syncingText: {
    color: '#ff9800',
    fontSize: '12px',
  },
  
  headerActions: {
    display: 'flex',
    gap: '10px',
    flexWrap: 'wrap',
  },
  
  syncButton: {
    background: 'linear-gradient(135deg, #4caf50, #45a049)',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    padding: '10px 20px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
    transition: 'all 0.3s ease',
  },
  
  debugButton: {
    background: 'linear-gradient(135deg, #2196f3, #1976d2)',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    padding: '10px 20px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
    transition: 'all 0.3s ease',
  },
  
  tabsContainer: {
    display: 'flex',
    marginBottom: '20px',
    borderBottom: '2px solid #f0f0f0',
    gap: '5px',
  },
  
  tab: {
    background: 'transparent',
    border: 'none',
    padding: '12px 20px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    borderRadius: '8px 8px 0 0',
    transition: 'all 0.3s ease',
    color: '#666',
  },
  
  activeTab: {
    background: '#FF9800',
    color: 'white',
  },
  
  filtersContainer: {
    display: 'flex',
    gap: '15px',
    marginBottom: '20px',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  
  searchContainer: {
    flex: 1,
    minWidth: '250px',
  },
  
  searchInput: {
    width: '100%',
    padding: '10px 15px',
    border: '2px solid #e0e0e0',
    borderRadius: '8px',
    fontSize: '14px',
    boxSizing: 'border-box',
    transition: 'border-color 0.3s ease',
  },
  
  statusFilters: {
    minWidth: '150px',
  },
  
  filterSelect: {
    width: '100%',
    padding: '10px 15px',
    border: '2px solid #e0e0e0',
    borderRadius: '8px',
    fontSize: '14px',
    background: 'white',
    cursor: 'pointer',
  },
  
  infoPanel: {
    background: 'linear-gradient(135deg, #e3f2fd, #bbdefb)',
    border: '2px solid #2196f3',
    borderRadius: '12px',
    padding: '15px',
    marginBottom: '15px',
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
  },
  
  infoIcon: {
    fontSize: '2rem',
  },
  
  infoContent: {
    flex: 1,
  },
  
  infoTitle: {
    fontWeight: '700',
    color: '#1976d2',
    marginBottom: '5px',
  },
  
  infoText: {
    fontSize: '14px',
    color: '#0d47a1',
  },
  
  debugPanel: {
    background: '#f8f9fa',
    border: '2px solid #e9ecef',
    borderRadius: '12px',
    padding: '20px',
    marginBottom: '20px',
  },
  
  debugTitle: {
    color: '#2196f3',
    margin: '0 0 15px 0',
  },
  
  debugActions: {
    display: 'flex',
    gap: '10px',
    marginBottom: '15px',
    flexWrap: 'wrap',
  },
  
  debugActionButton: {
    background: '#6c757d',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    padding: '8px 16px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '600',
  },
  
  debugLog: {
    background: '#000',
    color: '#00ff00',
    padding: '15px',
    borderRadius: '8px',
    fontFamily: 'monospace',
    fontSize: '12px',
    whiteSpace: 'pre-wrap',
    maxHeight: '300px',
    overflowY: 'auto',
    border: '1px solid #333',
  },
  
  loadingContainer: {
    textAlign: 'center',
    padding: '60px 20px',
    color: '#666',
  },
  
  loadingIcon: {
    fontSize: '2rem',
    marginBottom: '15px',
  },
  
  tableContainer: {
    overflowX: 'auto',
    marginBottom: '20px',
  },
  
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    background: '#fff',
    borderRadius: '12px',
    overflow: 'hidden',
    fontSize: '14px',
  },
  
  tableHeader: {
    background: '#fff3e0',
  },
  
  th: {
    color: '#e65100',
    fontWeight: '900',
    fontSize: '14px',
    padding: '15px 8px',
    textAlign: 'center',
    borderBottom: '2px solid #FFE0B2',
  },
  
  tableRow: {
    transition: 'opacity 0.3s ease',
  },
  
  td: {
    padding: '12px 8px',
    textAlign: 'center',
    fontWeight: '600',
    background: '#fffaf4',
    verticalAlign: 'middle',
    borderBottom: '1px solid #f0f0f0',
  },
  
  customerName: {
    fontWeight: '700',
    color: '#333',
    marginBottom: '3px',
  },
  
  quotationId: {
    fontSize: '12px',
    color: '#666',
  },
  
  localOnlyBadge: {
    background: '#ffc107',
    color: 'white',
    padding: '2px 6px',
    borderRadius: '8px',
    fontSize: '10px',
    fontWeight: '600',
    marginTop: '3px',
    display: 'inline-block',
  },
  
  emailText: {
    fontSize: '12px',
    color: '#666',
    marginTop: '3px',
  },
  
  totalAmount: {
    fontWeight: '700',
    color: '#FF9800',
  },
  
  dateInput: {
    border: '1.5px solid #ffe0b2',
    borderRadius: '8px',
    padding: '6px 8px',
    fontSize: '12px',
    width: '100%',
    outline: 'none',
    transition: 'border-color 0.3s ease',
  },
  
  statusSelect: {
    border: '1.5px solid #ffe0b2',
    borderRadius: '8px',
    padding: '6px 8px',
    fontSize: '12px',
    width: '100%',
    outline: 'none',
    fontWeight: 'bold',
    background: 'white',
    cursor: 'pointer',
  },
  
  remarksInput: {
    border: '1.5px solid #ffe0b2',
    borderRadius: '8px',
    padding: '6px 8px',
    fontSize: '12px',
    width: '100%',
    outline: 'none',
    transition: 'border-color 0.3s ease',
  },
  
  actionButtons: {
    display: 'flex',
    gap: '5px',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  
  viewButton: {
    background: '#2196f3',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    padding: '6px 8px',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: '600',
    minWidth: '30px',
    transition: 'all 0.3s ease',
  },
  
  printButton: {
    background: '#4caf50',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    padding: '6px 8px',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: '600',
    minWidth: '30px',
    transition: 'all 0.3s ease',
  },
  
  completeButton: {
    background: '#4caf50',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    padding: '6px 8px',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: '600',
    minWidth: '30px',
    transition: 'all 0.3s ease',
  },
  
  cancelButton: {
    background: '#f44336',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    padding: '6px 8px',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: '600',
    minWidth: '30px',
    transition: 'all 0.3s ease',
  },
  
  emptyState: {
    textAlign: 'center',
    padding: '40px 20px',
    color: '#aaa',
    fontSize: '16px',
    background: '#fffbe9',
  },
  
  emptyIcon: {
    fontSize: '3rem',
    marginBottom: '15px',
  },
  
  emptyTitle: {
    marginBottom: '10px',
    fontWeight: '600',
  },
  
  emptySubtitle: {
    color: '#4caf50',
    fontWeight: '700',
  },
  
  summarySection: {
    marginTop: '30px',
    padding: '20px',
    background: 'linear-gradient(135deg, #FFF3E0, #FFE0B2)',
    borderRadius: '12px',
    border: '2px solid #FF9800',
  },
  
  summaryTitle: {
    color: '#FF9800',
    margin: '0 0 15px 0',
  },
  
  summaryGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
    gap: '15px',
  },
  
  summaryCard: {
    background: '#fff',
    padding: '15px',
    borderRadius: '10px',
    textAlign: 'center',
    border: '1px solid rgba(0,0,0,0.1)',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  },
  
  summaryCount: {
    fontWeight: '700',
    fontSize: '18px',
    marginBottom: '5px',
    color: '#333',
  },
  
  summaryLabel: {
    fontSize: '14px',
    fontWeight: '600',
    marginBottom: '5px',
    textTransform: 'capitalize',
    color: '#666',
  },
  
  summaryAmount: {
    fontSize: '12px',
    color: '#666',
  },
  
  modal: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '20px',
  },
  
  modalContent: {
    background: 'white',
    borderRadius: '15px',
    maxWidth: '800px',
    width: '100%',
    maxHeight: '90vh',
    overflow: 'auto',
    boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
  },
  
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px',
    borderBottom: '2px solid #f0f0f0',
    background: 'linear-gradient(135deg, #FF9800, #F7931E)',
    color: 'white',
    borderRadius: '15px 15px 0 0',
  },
  
  modalBody: {
    padding: '20px',
  },
  
  modalActions: {
    display: 'flex',
    gap: '10px',
    justifyContent: 'flex-end',
    padding: '20px',
    borderTop: '2px solid #f0f0f0',
  },
  
  closeButton: {
    background: 'transparent',
    border: 'none',
    color: 'white',
    fontSize: '1.5rem',
    cursor: 'pointer',
    padding: '5px',
    borderRadius: '5px',
    transition: 'background 0.3s ease',
  },
  
  closeModalButton: {
    background: '#6c757d',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    padding: '8px 16px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
  },
  
  detailsGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '20px',
    marginBottom: '20px',
  },
  
  followUpDetails: {
    background: '#f8f9fa',
    padding: '15px',
    borderRadius: '8px',
    border: '1px solid #e9ecef',
  },
  
  footer: {
    marginTop: '20px',
    padding: '15px',
    background: '#f8f9fa',
    borderRadius: '8px',
    fontSize: '12px',
    color: '#666',
    textAlign: 'center',
    lineHeight: '1.5',
  },
  
  // Responsive styles
  '@media (max-width: 768px)': {
    container: {
      margin: '20px auto',
      padding: '20px 15px',
    },
    
    headerContent: {
      flexDirection: 'column',
      alignItems: 'flex-start',
    },
    
    title: {
      fontSize: '1.5rem',
    },
    
    filtersContainer: {
      flexDirection: 'column',
      alignItems: 'stretch',
    },
    
    searchContainer: {
      minWidth: 'auto',
    },
    
    statusFilters: {
      minWidth: 'auto',
    },
    
    detailsGrid: {
      gridTemplateColumns: '1fr',
    },
    
    summaryGrid: {
      gridTemplateColumns: '1fr 1fr',
    },
    
    actionButtons: {
      flexDirection: 'column',
      gap: '3px',
    },
    
    th: {
      padding: '10px 5px',
      fontSize: '12px',
    },
    
    td: {
      padding: '8px 5px',
      fontSize: '12px',
    },
  },
  
  '@media (max-width: 480px)': {
    summaryGrid: {
      gridTemplateColumns: '1fr',
    },
    
    tabsContainer: {
      flexDirection: 'column',
    },
    
    tab: {
      textAlign: 'center',
      borderRadius: '8px',
      marginBottom: '5px',
    },
    
    activeTab: {
      borderRadius: '8px',
    },
  },
};

export default FollowUps;