import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

// Status color mapping
const statusColors = {
  Pending: "#ffe0b2",
  Contacted: "#e3f2fd"
};

function FollowUps() {
  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState(null);
  const [showDebugPanel, setShowDebugPanel] = useState(false);
  const [debugInfo, setDebugInfo] = useState(null);

  // --- SUPABASE INTEGRATION ---
  
  // Fetch quotations from Supabase (only pending and contacted)
  async function fetchFollowUpQuotationsFromSupabase() {
    try {
      console.log("Fetching follow-up quotations from Supabase...");
      
      const { data, error } = await supabase
        .from("quotations")
        .select("*")
        .in("follow_up_status", ["Pending", "Contacted"])
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching from Supabase:", error);
        return null;
      }

      console.log("✅ Fetched follow-up quotations from Supabase:", data?.length || 0);
      return data || [];
    } catch (err) {
      console.error("Unexpected error fetching from Supabase:", err);
      return null;
    }
  }

  // Update follow-up data in Supabase with improved ID matching
  async function updateFollowUpInSupabase(quotationId, field, value) {
    try {
      setSyncing(true);
      console.log(`🔄 Updating ${field} = "${value}" for quotation ${quotationId} in Supabase...`);

      // Map the field names to database column names
      const fieldMapping = {
        followUpDate: 'follow_up_date',
        followUpStatus: 'follow_up_status', 
        remarks: 'remarks'
      };

      const dbField = fieldMapping[field] || field;
      console.log(`📝 Mapped field "${field}" to database column "${dbField}"`);
      
      // Enhanced ID matching - try multiple strategies
      console.log(`🔍 Searching for quotation with ID: ${quotationId}`);
      
      let existingRecord = null;
      let matchField = null;
      let matchValue = null;
      
      // Strategy 1: Try quotation_id field (if not null)
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
        console.log(`✅ Found record using quotation_id: ${quotationId}`, existingRecord);
      } else {
        console.log(`❌ No record found with quotation_id: ${quotationId} (or quotation_id is null)`);
        
        // Strategy 2: Try id field (for numeric IDs)
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
            console.log(`✅ Found record using id: ${quotationId}`, existingRecord);
          } else {
            console.log(`❌ No record found with id: ${quotationId}`);
          }
        }
        
        // Strategy 3: If still not found, try finding by customer name from localStorage
        if (!existingRecord) {
          const localData = JSON.parse(localStorage.getItem("quotations")) || [];
          const localRecord = localData.find(r => r.id === quotationId);
          
          if (localRecord && localRecord.customer?.name) {
            console.log(`🔍 Trying to find by customer name: ${localRecord.customer.name}`);
            
            const { data: byCustomer, error: error3 } = await supabase
              .from("quotations")
              .select("*")
              .eq("customer_name", localRecord.customer.name)
              .maybeSingle();
            
            if (!error3 && byCustomer) {
              existingRecord = byCustomer;
              matchField = "customer_name";
              matchValue = localRecord.customer.name;
              console.log(`✅ Found record using customer_name: ${localRecord.customer.name}`, existingRecord);
            }
          }
        }
      }
      
      if (!existingRecord) {
        console.error(`❌ No record found with any ID strategy for: ${quotationId}`);
        
        // Show what records we DO have
        const { data: sampleRecords } = await supabase
          .from("quotations")
          .select("id, quotation_id, customer_name, follow_up_status")
          .limit(5);
        
        console.log("📋 Available records sample:", sampleRecords);
        
        setDebugInfo(prev => (prev || "") + `❌ Could not find record for ID: ${quotationId}\n`);
        setDebugInfo(prev => prev + `📋 Available records: ${sampleRecords?.map(r => `ID:${r.id}|QID:${r.quotation_id}|${r.customer_name}`).join(", ")}\n`);
        
        alert(`❌ Could not find quotation in database with ID: ${quotationId}\n\nAvailable records:\n${sampleRecords?.map(r => `• ID: ${r.id}, Quotation ID: ${r.quotation_id || 'null'}, Customer: ${r.customer_name}`).join('\n')}\n\n💡 This might be an ID mismatch issue.`);
        return false;
      }

      // Show current value vs new value
      console.log(`📊 Current ${dbField}: "${existingRecord[dbField]}" → New: "${value}"`);
      console.log(`🎯 Will update using ${matchField} = ${matchValue}`);
      
      // Prepare update data
      const updateData = { 
        [dbField]: value, 
        updated_at: new Date().toISOString() 
      };
      
      // If we're updating via customer_name but the quotation_id is null, also set the quotation_id
      if (matchField === "customer_name" && !existingRecord.quotation_id) {
        updateData.quotation_id = quotationId;
        console.log(`🔧 Also setting quotation_id to: ${quotationId}`);
      }
      
      console.log(`📝 Update payload:`, updateData);
      
      // Perform the update with detailed logging
      const { data, error, count } = await supabase
        .from("quotations")
        .update(updateData)
        .eq(matchField, matchValue)
        .select(`id, quotation_id, customer_name, ${dbField}, updated_at`);

      // Enhanced error handling
      if (error) {
        console.error("❌ Supabase update error:", error);
        console.error("Error details:", {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        });
        
        // Show specific error message to user
        let errorMsg = `❌ Database update failed: ${error.message}`;
        
        if (error.code === '42703') {
          errorMsg += `\n\nColumn '${dbField}' doesn't exist in database.`;
        } else if (error.code === '42501') {
          errorMsg += "\n\nPermission denied. Please check database permissions.";
        } else if (error.code === '23502') {
          errorMsg += "\n\nRequired field is missing.";
        } else if (error.message?.includes('RLS')) {
          errorMsg += "\n\nRow Level Security is blocking this update.";
        }
        
        setDebugInfo(prev => (prev || "") + `❌ Update failed: ${error.message}\n`);
        alert(errorMsg);
        return false;
      }

      // Check if update was successful
      if (data && data.length > 0) {
        console.log("✅ Successfully updated in Supabase:", data[0]);
        console.log(`🔍 Verification - ${dbField} is now: "${data[0][dbField]}"`);
        
        // Add success to debug log
        setDebugInfo(prev => (prev || "") + `✅ Updated ${field} to "${value}" for ${data[0].customer_name} (${matchField}: ${matchValue})\n`);
        
        return true;
      } else {
        console.warn("⚠️ Update executed but no data returned");
        console.log("Response count:", count);
        setDebugInfo(prev => (prev || "") + `⚠️ Update executed but no confirmation received\n`);
        return false;
      }
      
    } catch (err) {
      console.error("💥 Unexpected error updating Supabase:", err);
      setDebugInfo(prev => (prev || "") + `💥 Unexpected error: ${err.message}\n`);
      alert(`❌ Unexpected error: ${err.message}\n\nOnly localStorage will be updated.`);
      return false;
    } finally {
      setSyncing(false);
    }
  }

  // Convert Supabase data to localStorage format
  function convertSupabaseToLocalStorage(supabaseData) {
    return supabaseData.map(item => ({
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
      followUpStatus: item.follow_up_status || "Pending", 
      remarks: item.remarks || "",
      quotationDate: item.quotation_date
    }));
  }

  // Merge localStorage and Supabase data (filter out completed/closed)
  function mergeQuotationData(localData, supabaseData) {
    // Filter local data to only include pending and contacted
    const filteredLocalData = localData.filter(item => 
      ['Pending', 'Contacted'].includes(item.followUpStatus || 'Pending')
    );
    
    const merged = [...filteredLocalData];
    
    // Add any Supabase entries not found in localStorage (already filtered by query)
    supabaseData.forEach(supabaseItem => {
      const existsInLocal = filteredLocalData.find(localItem => 
        localItem.id === supabaseItem.id || 
        (localItem.customer.name === supabaseItem.customer.name && 
         localItem.customer.contact === supabaseItem.customer.contact)
      );
      
      if (!existsInLocal) {
        merged.push(supabaseItem);
      }
    });

    return merged;
  }

  // Load and sync quotations from both sources (filtered for follow-ups only)
  async function loadFollowUpQuotations() {
    try {
      setLoading(true);
      
      // Load from localStorage first (immediate) and filter for follow-ups only
      const localQuotations = JSON.parse(localStorage.getItem("quotations")) || [];
      const localFollowUps = localQuotations.filter(q => 
        ['Pending', 'Contacted'].includes(q.followUpStatus || 'Pending')
      );
      console.log("Loaded follow-up quotations from localStorage:", localFollowUps.length);
      
      // If we have local data, show it immediately
      if (localFollowUps.length > 0) {
        setQuotations(localFollowUps);
      }

      const supabaseQuotations = await fetchFollowUpQuotationsFromSupabase();
      
      if (supabaseQuotations) {
        const convertedSupabaseData = convertSupabaseToLocalStorage(supabaseQuotations);
        const mergedData = mergeQuotationData(localQuotations, convertedSupabaseData);
        
        // Update state with merged follow-up data
        setQuotations(mergedData);
        
        // Update localStorage with all quotations (not just follow-ups)
        // But merge the follow-up updates back into the full list
        const updatedAllQuotations = [...localQuotations];
        mergedData.forEach(followUpQuote => {
          const index = updatedAllQuotations.findIndex(q => q.id === followUpQuote.id);
          if (index !== -1) {
            updatedAllQuotations[index] = followUpQuote;
          } else {
            updatedAllQuotations.push(followUpQuote);
          }
        });
        
        localStorage.setItem("quotations", JSON.stringify(updatedAllQuotations));
        
        setLastSyncTime(new Date());
        console.log("✅ Follow-up data synchronized successfully");
      } else {
        // If Supabase fails, just use localStorage filtered data
        console.log("Using localStorage follow-up data only");
        setQuotations(localFollowUps);
      }
    } catch (err) {
      console.error("Error loading follow-up quotations:", err);
      // Fallback to localStorage only
      const localQuotations = JSON.parse(localStorage.getItem("quotations")) || [];
      const localFollowUps = localQuotations.filter(q => 
        ['Pending', 'Contacted'].includes(q.followUpStatus || 'Pending')
      );
      setQuotations(localFollowUps);
    } finally {
      setLoading(false);
    }
  }

  // Load quotations on component mount
  useEffect(() => {
    loadFollowUpQuotations();
  }, []);

  // Update field with dual storage (localStorage + Supabase)
  const updateField = async (id, field, value) => {
    // Update localStorage immediately (for responsive UI)
    const updated = quotations.map((q) =>
      q.id === id ? { ...q, [field]: value } : q
    );
    
    // If status is changed to Completed or Closed, remove from follow-ups
    if (field === 'followUpStatus' && ['Completed', 'Closed'].includes(value)) {
      const filteredQuotations = updated.filter(q => q.id !== id);
      setQuotations(filteredQuotations);
      
      // Update full localStorage data
      const allQuotations = JSON.parse(localStorage.getItem("quotations")) || [];
      const updatedAllQuotations = allQuotations.map(q =>
        q.id === id ? { ...q, [field]: value } : q
      );
      localStorage.setItem("quotations", JSON.stringify(updatedAllQuotations));
      
      // Show success message
      setTimeout(() => {
        alert(`✅ Quotation marked as ${value} and removed from follow-ups!`);
      }, 100);
    } else {
      setQuotations(updated);
      
      // Update full localStorage data
      const allQuotations = JSON.parse(localStorage.getItem("quotations")) || [];
      const updatedAllQuotations = allQuotations.map(q =>
        q.id === id ? { ...q, [field]: value } : q
      );
      localStorage.setItem("quotations", JSON.stringify(updatedAllQuotations));
    }

    // Update Supabase in background
    const success = await updateFollowUpInSupabase(id, field, value);
    
    if (success) {
      setLastSyncTime(new Date());
      console.log("✅ Follow-up field updated successfully in database");
    } else {
      console.log("⚠️ Follow-up field updated in localStorage only");
    }
  };

  // Manual sync function
  const manualSync = async () => {
    await loadFollowUpQuotations();
  };

  // Fix null quotation_id records in Supabase
  const fixNullQuotationIds = async () => {
    try {
      setSyncing(true);
      setDebugInfo(prev => (prev || "") + "\n🔧 Fixing null quotation_id records...\n");

      // Get all records with null quotation_id (only pending/contacted)
      const { data: nullRecords, error: fetchError } = await supabase
        .from("quotations")
        .select("id, customer_name, quotation_id")
        .is("quotation_id", null)
        .in("follow_up_status", ["Pending", "Contacted"]);

      if (fetchError) {
        setDebugInfo(prev => prev + `❌ Error fetching null records: ${fetchError.message}\n`);
        return;
      }

      if (!nullRecords || nullRecords.length === 0) {
        setDebugInfo(prev => prev + "✅ No null quotation_id records found in follow-ups\n");
        alert("✅ All follow-up records already have proper quotation_id values!");
        return;
      }

      setDebugInfo(prev => prev + `📊 Found ${nullRecords.length} follow-up records with null quotation_id\n`);

      // Get localStorage data to match with database records
      const localData = JSON.parse(localStorage.getItem("quotations")) || [];
      
      let fixedCount = 0;
      let failedCount = 0;

      for (const dbRecord of nullRecords) {
        try {
          // Try to find matching localStorage record
          const matchingLocal = localData.find(local => 
            local.customer?.name === dbRecord.customer_name
          );

          let newQuotationId;
          if (matchingLocal && matchingLocal.id) {
            newQuotationId = matchingLocal.id;
          } else {
            // Generate a new quotation ID if no localStorage match
            const date = new Date();
            const year = date.getFullYear().toString().slice(-2);
            const month = (date.getMonth() + 1).toString().padStart(2, '0');
            const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
            newQuotationId = `SE-${year}${month}-${random}`;
          }

          setDebugInfo(prev => prev + `🔧 Fixing ${dbRecord.customer_name}: ID ${dbRecord.id} → quotation_id: ${newQuotationId}\n`);

          // Update the record
          const { error: updateError } = await supabase
            .from("quotations")
            .update({ quotation_id: newQuotationId })
            .eq("id", dbRecord.id);

          if (updateError) {
            setDebugInfo(prev => prev + `❌ Failed to fix ${dbRecord.customer_name}: ${updateError.message}\n`);
            failedCount++;
          } else {
            setDebugInfo(prev => prev + `✅ Fixed ${dbRecord.customer_name}\n`);
            fixedCount++;

            // Update localStorage record if it exists
            if (matchingLocal && matchingLocal.id !== newQuotationId) {
              matchingLocal.id = newQuotationId;
              localStorage.setItem("quotations", JSON.stringify(localData));
            }
          }

        } catch (err) {
          setDebugInfo(prev => prev + `💥 Error fixing ${dbRecord.customer_name}: ${err.message}\n`);
          failedCount++;
        }
      }

      setDebugInfo(prev => prev + `\n📊 Fix completed: ${fixedCount} successful, ${failedCount} failed\n`);
      
      if (fixedCount > 0) {
        alert(`✅ Successfully fixed ${fixedCount} quotation_id records!\n\nFollow-up updates should now work properly. Try updating a status.`);
        await loadFollowUpQuotations(); // Refresh the data
      } else {
        alert(`❌ Failed to fix quotation_id records. Check the debug log for details.`);
      }

    } catch (err) {
      setDebugInfo(prev => (prev || "") + `💥 Fix error: ${err.message}\n`);
      alert(`❌ Fix failed: ${err.message}`);
    } finally {
      setSyncing(false);
    }
  };

  // Debug functions
  const runDatabaseDiagnostics = async () => {
    try {
      setDebugInfo("🔍 Running follow-up database diagnostics...\n");
      
      // Check table structure
      const { data: tableData, error: tableError } = await supabase
        .from("quotations")
        .select("*")
        .limit(1);
      
      if (tableError) {
        setDebugInfo(prev => prev + `❌ Table access error: ${tableError.message}\n`);
        return;
      }
      
      // Check available columns
      if (tableData && tableData.length > 0) {
        const columns = Object.keys(tableData[0]);
        setDebugInfo(prev => prev + `✅ Available columns: ${columns.join(", ")}\n\n`);
        
        // Check specifically for follow-up columns
        const requiredColumns = ['follow_up_date', 'follow_up_status', 'remarks'];
        const missingColumns = requiredColumns.filter(col => !columns.includes(col));
        
        if (missingColumns.length > 0) {
          setDebugInfo(prev => prev + `❌ Missing follow-up columns: ${missingColumns.join(", ")}\n`);
          setDebugInfo(prev => prev + `💡 Run this SQL to add missing columns:\n`);
          missingColumns.forEach(col => {
            if (col === 'follow_up_date') {
              setDebugInfo(prev => prev + `ALTER TABLE quotations ADD COLUMN ${col} DATE;\n`);
            } else if (col === 'follow_up_status') {
              setDebugInfo(prev => prev + `ALTER TABLE quotations ADD COLUMN ${col} TEXT DEFAULT 'Pending';\n`);
            } else {
              setDebugInfo(prev => prev + `ALTER TABLE quotations ADD COLUMN ${col} TEXT;\n`);
            }
          });
          setDebugInfo(prev => prev + "\n");
        } else {
          setDebugInfo(prev => prev + `✅ All required follow-up columns exist\n\n`);
        }
      }
      
      // Check follow-up records specifically
      const { data: followUpData, error: followUpError } = await supabase
        .from("quotations")
        .select("id, quotation_id, customer_name, follow_up_status, follow_up_date, remarks")
        .in("follow_up_status", ["Pending", "Contacted"])
        .limit(10);
      
      if (followUpError) {
        setDebugInfo(prev => prev + `❌ Follow-up query error: ${followUpError.message}\n`);
      } else {
        setDebugInfo(prev => prev + `📊 Follow-up records: ${followUpData?.length || 0}\n`);
        setDebugInfo(prev => prev + `📋 Sample follow-up records:\n`);
        
        followUpData?.forEach((record, index) => {
          setDebugInfo(prev => prev + `  ${index + 1}. ID: ${record.id}, Quotation ID: ${record.quotation_id}, Customer: ${record.customer_name}\n`);
          setDebugInfo(prev => prev + `     Status: ${record.follow_up_status || 'null'}, Date: ${record.follow_up_date || 'null'}, Remarks: ${record.remarks || 'null'}\n`);
        });
      }
      
      // Check localStorage follow-up data
      const localData = JSON.parse(localStorage.getItem("quotations")) || [];
      const localFollowUps = localData.filter(q => 
        ['Pending', 'Contacted'].includes(q.followUpStatus || 'Pending')
      );
      setDebugInfo(prev => prev + `\n💾 localStorage follow-up records: ${localFollowUps.length}\n`);
      
      localFollowUps.slice(0, 3).forEach((record, index) => {
        setDebugInfo(prev => prev + `  ${index + 1}. Local ID: ${record.id}, Customer: ${record.customer?.name}\n`);
        setDebugInfo(prev => prev + `     Status: ${record.followUpStatus || 'null'}, Date: ${record.followUpDate || 'null'}, Remarks: ${record.remarks || 'null'}\n`);
      });
      
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
    setDebugInfo(prev => (prev || "") + `\n🧪 Testing direct update for: ${testQuotation.customer.name} (ID: ${testQuotation.id})\n`);
    
    const success = await updateFollowUpInSupabase(testQuotation.id, "remarks", `Test update at ${new Date().toLocaleTimeString()}`);
    
    setDebugInfo(prev => prev + `${success ? "✅" : "❌"} Test update result: ${success ? "SUCCESS" : "FAILED"}\n`);
  };

  return (
    <div
      className="followups-container"
      style={{
        maxWidth: 1200,
        margin: "40px auto",
        background: "#fff",
        borderRadius: 13,
        boxShadow: "0 6px 32px #ffab0022",
        padding: "32px 18px"
      }}
    >
      {/* Header with sync status */}
      <div style={{ 
        display: "flex", 
        justifyContent: "space-between", 
        alignItems: "center", 
        marginBottom: 30,
        flexWrap: "wrap",
        gap: "15px"
      }}>
        <div>
          <h2 style={{ color: "#FF9800", fontWeight: 900, margin: "0 0 5px 0" }}>
            📅 Customer Follow-ups
          </h2>
          <div style={{ display: "flex", alignItems: "center", gap: "15px", flexWrap: "wrap" }}>
            <span style={{ color: "#666", fontSize: "14px" }}>
              {loading ? "Loading..." : `${quotations.length} pending follow-ups`}
            </span>
            {lastSyncTime && (
              <span style={{ color: "#4caf50", fontSize: "12px" }}>
                ✅ Last synced: {lastSyncTime.toLocaleTimeString()}
              </span>
            )}
            {syncing && (
              <span style={{ color: "#ff9800", fontSize: "12px" }}>
                🔄 Syncing...
              </span>
            )}
          </div>

          {/* Info Panel */}
          <div style={{
            background: "linear-gradient(135deg, #e3f2fd, #bbdefb)",
            border: "2px solid #2196f3",
            borderRadius: "12px",
            padding: "15px",
            marginTop: "15px",
            display: "flex",
            alignItems: "center",
            gap: "15px"
          }}>
            <div style={{ fontSize: "2rem" }}>ℹ️</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: "700", color: "#1976d2", marginBottom: "5px" }}>
                Follow-up Management
              </div>
              <div style={{ fontSize: "14px", color: "#0d47a1" }}>
                This page shows only <strong>Pending</strong> and <strong>Contacted</strong> quotations. When you mark a quotation as <strong>Completed</strong> or <strong>Closed</strong>, it will be automatically removed from this follow-up list.
              </div>
            </div>
          </div>

          {/* Debug Panel */}
          {showDebugPanel && (
            <div style={{
              background: "#f8f9fa",
              border: "2px solid #e9ecef",
              borderRadius: "12px",
              padding: "20px",
              marginTop: "20px"
            }}>
              <h3 style={{ color: "#2196f3", margin: "0 0 15px 0" }}>🔧 Follow-up Debug Panel</h3>
              
              <div style={{ display: "flex", gap: "10px", marginBottom: "15px", flexWrap: "wrap" }}>
                <button
                  onClick={runDatabaseDiagnostics}
                  style={{
                    background: "#2196f3",
                    color: "white",
                    border: "none",
                    borderRadius: "6px",
                    padding: "8px 16px",
                    cursor: "pointer",
                    fontSize: "13px",
                    fontWeight: "600"
                  }}
                >
                  🔍 Check Follow-up Structure
                </button>

                <button
                  onClick={fixNullQuotationIds}
                  disabled={syncing}
                  style={{
                    background: syncing ? "#ccc" : "#e91e63",
                    color: "white",
                    border: "none",
                    borderRadius: "6px",
                    padding: "8px 16px",
                    cursor: syncing ? "not-allowed" : "pointer",
                    fontSize: "13px",
                    fontWeight: "600"
                  }}
                >
                  🔧 Fix Follow-up IDs
                </button>
                
                <button
                  onClick={testDirectUpdate}
                  disabled={quotations.length === 0 || syncing}
                  style={{
                    background: (quotations.length === 0 || syncing) ? "#ccc" : "#ff9800",
                    color: "white",
                    border: "none",
                    borderRadius: "6px",
                    padding: "8px 16px",
                    cursor: (quotations.length === 0 || syncing) ? "not-allowed" : "pointer",
                    fontSize: "13px",
                    fontWeight: "600"
                  }}
                >
                  🧪 Test Follow-up Update
                </button>
                
                <button
                  onClick={() => setDebugInfo("")}
                  style={{
                    background: "#6c757d",
                    color: "white",
                    border: "none",
                    borderRadius: "6px",
                    padding: "8px 16px",
                    cursor: "pointer",
                    fontSize: "13px",
                    fontWeight: "600"
                  }}
                >
                  🗑️ Clear Log
                </button>
              </div>
              
              {debugInfo && (
                <div style={{
                  background: "#000",
                  color: "#00ff00",
                  padding: "15px",
                  borderRadius: "8px",
                  fontFamily: "monospace",
                  fontSize: "12px",
                  whiteSpace: "pre-wrap",
                  maxHeight: "300px",
                  overflowY: "auto",
                  border: "1px solid #333"
                }}>
                  {debugInfo}
                </div>
              )}
              
              <div style={{
                marginTop: "15px",
                padding: "10px",
                background: "#fff3cd",
                borderRadius: "6px",
                fontSize: "12px",
                color: "#856404"
              }}>
                💡 <strong>Follow-up Update Issues?</strong>
                <br />• <strong>🔧 Fix Follow-up IDs:</strong> Fixes missing quotation_id values for pending/contacted records
                <br />• <strong>🔍 Check Follow-up Structure:</strong> Verify follow-up columns exist and data integrity
                <br />• <strong>🧪 Test Follow-up Update:</strong> Test a real follow-up field update
                <br />• <strong>Remember:</strong> Completed/Closed quotations are automatically hidden from this view
              </div>
            </div>
          )}
        </div>
        
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <button
            onClick={manualSync}
            disabled={loading || syncing}
            style={{
              background: "linear-gradient(135deg, #4caf50, #45a049)",
              color: "white",
              border: "none",
              borderRadius: "8px",
              padding: "10px 20px",
              cursor: loading || syncing ? "not-allowed" : "pointer",
              fontSize: "14px",
              fontWeight: "600",
              opacity: loading || syncing ? 0.7 : 1,
              transition: "all 0.3s ease"
            }}
          >
            {loading || syncing ? "🔄 Syncing..." : "🔄 Sync Follow-ups"}
          </button>
          
          <button
            onClick={() => setShowDebugPanel(!showDebugPanel)}
            style={{
              background: "linear-gradient(135deg, #2196f3, #1976d2)",
              color: "white",
              border: "none",
              borderRadius: "8px",
              padding: "10px 20px",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: "600",
              transition: "all 0.3s ease"
            }}
          >
            🔧 Debug Panel
          </button>
        </div>
      </div>

      {/* Loading state */}
      {loading && quotations.length === 0 && (
        <div style={{
          textAlign: "center",
          padding: "60px 20px",
          color: "#666"
        }}>
          <div style={{ fontSize: "2rem", marginBottom: "15px" }}>⏳</div>
          <h3>Loading Follow-ups...</h3>
          <p>Fetching pending and contacted quotations</p>
        </div>
      )}

      {/* Follow-ups table */}
      {!loading || quotations.length > 0 ? (
        <div style={{ overflowX: "auto" }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              background: "#fff",
              borderRadius: 12,
              overflow: "hidden",
              fontSize: 16
            }}
          >
            <thead>
              <tr style={{ background: "#fff3e0" }}>
                <th style={th}>Customer</th>
                <th style={th}>Contact</th>
                <th style={th}>System Type</th>
                <th style={th}>Total Amount</th>
                <th style={th}>Follow-Up Date</th>
                <th style={th}>Status</th>
                <th style={th}>Remarks</th>
                <th style={th}>Action</th>
              </tr>
            </thead>
            <tbody>
              {quotations.map((q, index) => (
                <tr
                  key={q.id || index}
                  style={{
                    background:
                      statusColors[q.followUpStatus || "Pending"] || "#fff",
                    opacity: syncing ? 0.8 : 1,
                    transition: "opacity 0.3s ease"
                  }}
                >
                  <td style={td}>
                    <div style={{ fontWeight: "700", color: "#333" }}>
                      {q.customer.name}
                    </div>
                    <div style={{ fontSize: "12px", color: "#666" }}>
                      ID: {q.id}
                    </div>
                  </td>
                  <td style={td}>
                    <div>{q.customer.contact}</div>
                    {q.customer.email && (
                      <div style={{ fontSize: "12px", color: "#666" }}>
                        {q.customer.email}
                      </div>
                    )}
                  </td>
                  <td style={td}>{q.systemType}</td>
                  <td style={td}>
                    <div style={{ fontWeight: "700", color: "#FF9800" }}>
                      Rs. {(q.total || 0).toLocaleString()}
                    </div>
                  </td>
                  <td style={td}>
                    <input
                      type="date"
                      value={q.followUpDate || ""}
                      style={inputStyle}
                      onChange={(e) =>
                        updateField(q.id, "followUpDate", e.target.value)
                      }
                    />
                  </td>
                  <td style={td}>
                    <select
                      value={q.followUpStatus || "Pending"}
                      style={{
                        ...inputStyle,
                        fontWeight: "bold",
                        color:
                          q.followUpStatus === "Contacted"
                            ? "#1976d2"
                            : "#333"
                      }}
                      onChange={(e) => {
                        updateField(q.id, "followUpStatus", e.target.value);
                      }}
                    >
                      <option value="Pending">Pending</option>
                      <option value="Contacted">Contacted</option>
                      <option value="Completed">Completed</option>
                      <option value="Closed">Closed</option>
                    </select>
                  </td>
                  <td style={td}>
                    <input
                      type="text"
                      placeholder={q.followUpStatus === 'Contacted' ? "Add contact details..." : "Add remarks..."}
                      value={q.remarks || ""}
                      style={inputStyle}
                      onChange={(e) =>
                        updateField(q.id, "remarks", e.target.value)
                      }
                    />
                  </td>
                  <td style={td}>
                    <div style={{ display: "flex", gap: "5px", flexDirection: "column" }}>
                      <button
                        onClick={() => updateField(q.id, "followUpStatus", "Completed")}
                        style={{
                          background: "#4caf50",
                          color: "white",
                          border: "none",
                          borderRadius: "4px",
                          padding: "4px 8px",
                          cursor: "pointer",
                          fontSize: "11px",
                          fontWeight: "600"
                        }}
                      >
                        ✅ Complete
                      </button>
                      <button
                        onClick={() => updateField(q.id, "followUpStatus", "Closed")}
                        style={{
                          background: "#f44336",
                          color: "white",
                          border: "none",
                          borderRadius: "4px",
                          padding: "4px 8px",
                          cursor: "pointer",
                          fontSize: "11px",
                          fontWeight: "600"
                        }}
                      >
                        ❌ Close
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {quotations.length === 0 && !loading && (
                <tr>
                  <td
                    colSpan="8"
                    style={{
                      textAlign: "center",
                      padding: "40px 20px",
                      color: "#aaa",
                      fontSize: 17,
                      background: "#fffbe9"
                    }}
                  >
                    <div style={{ fontSize: "3rem", marginBottom: "15px" }}>🎉</div>
                    <div style={{ marginBottom: "10px" }}>No pending follow-ups!</div>
                    <span style={{ color: "#4caf50", fontWeight: 700 }}>
                      All quotations have been completed or closed
                    </span>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      ) : null}

      {/* Summary stats for follow-ups only */}
      {quotations.length > 0 && (
        <div style={{
          marginTop: "30px",
          padding: "20px",
          background: "linear-gradient(135deg, #FFF3E0, #FFE0B2)",
          borderRadius: "12px",
          border: "2px solid #FF9800"
        }}>
          <h3 style={{ color: "#FF9800", margin: "0 0 15px 0" }}>📊 Follow-up Summary</h3>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
            gap: "15px"
          }}>
            {['Pending', 'Contacted'].map(status => {
              const count = quotations.filter(q => (q.followUpStatus || "Pending") === status).length;
              const total = quotations.reduce((sum, q) => 
                (q.followUpStatus || "Pending") === status ? sum + (q.total || 0) : sum, 0
              );
              return (
                <div key={status} style={{
                  background: statusColors[status],
                  padding: "15px",
                  borderRadius: "10px",
                  textAlign: "center",
                  border: "1px solid rgba(0,0,0,0.1)"
                }}>
                  <div style={{ fontWeight: "700", fontSize: "18px", marginBottom: "5px" }}>
                    {count}
                  </div>
                  <div style={{ fontSize: "14px", fontWeight: "600", marginBottom: "5px" }}>
                    {status}
                  </div>
                  <div style={{ fontSize: "12px", color: "#666" }}>
                    Rs. {total.toLocaleString()}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Sync status footer */}
      <div style={{
        marginTop: "20px",
        padding: "15px",
        background: "#f8f9fa",
        borderRadius: "8px",
        fontSize: "12px",
        color: "#666",
        textAlign: "center"
      }}>
        💡 <strong>Follow-up Management:</strong> Only pending and contacted quotations are shown here. 
        Completed/Closed quotations are automatically removed from follow-ups but preserved in the main quotation list.
        {lastSyncTime && (
          <span> Last synchronized at {lastSyncTime.toLocaleString()}.</span>
        )}
      </div>
    </div>
  );
}

// --- Styling ---
const th = {
  color: "#e65100",
  fontWeight: 900,
  fontSize: 16,
  padding: "15px 8px",
  textAlign: "center"
};

const td = {
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
  transition: "border-color 0.3s ease",
  "&:focus": {
    borderColor: "#FF9800"
  }
};

export default FollowUps;