import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient"; // Add Supabase integration

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

  const testDirectUpdate = async () => {
    if (quotations.length === 0) {
      alert("No quotations available to test");
      return;
    }
    
    const testQuotation = quotations[0];
    setDebugInfo(prev => (prev || "") + `\n🧪 Testing direct update for: ${testQuotation.customer.name} (ID: ${testQuotation.id})\n`);
    
    const success = await updateFollowUpInSupabase(testQuotation.id, "remarks", `Test update at ${new Date().toLocaleTimeString()}`);
    
    setDebugInfo(prev => prev + `${success ? "✅" : "❌"} Test update result: ${success ? "SUCCESS" : "FAILED"}\n`);
  };

  // Fix null quotation_id records in Supabase
  const fixNullQuotationIds = async () => {
    try {
      setSyncing(true);
      setDebugInfo(prev => (prev || "") + "\n🔧 Fixing null quotation_id records...\n");

      // Get all records with null quotation_id
      const { data: nullRecords, error: fetchError } = await supabase
        .from("quotations")
        .select("id, customer_name, quotation_id")
        .is("quotation_id", null);

      if (fetchError) {
        setDebugInfo(prev => prev + `❌ Error fetching null records: ${fetchError.message}\n`);
        return;
      }

      if (!nullRecords || nullRecords.length === 0) {
        setDebugInfo(prev => prev + "✅ No null quotation_id records found\n");
        alert("✅ All records already have proper quotation_id values!");
        return;
      }

      setDebugInfo(prev => prev + `📊 Found ${nullRecords.length} records with null quotation_id\n`);

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
        setNullQuotationIdCount(Math.max(0, nullQuotationIdCount - fixedCount)); // Update count
        alert(`✅ Successfully fixed ${fixedCount} quotation_id records!\n\nFollow-up updates should now work properly. Try updating a status.`);
        await loadQuotations(); // Refresh the data
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

  // Merge localStorage and Supabase data (localStorage takes precedence for conflicts)
  function mergeQuotationData(localData, supabaseData) {
    const merged = [...localData];
    
    // Add any Supabase entries not found in localStorage
    supabaseData.forEach(supabaseItem => {
      const existsInLocal = localData.find(localItem => 
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

  // Load and sync quotations from both sources
  async function loadQuotations() {
    try {
      setLoading(true);
      
      // Load from localStorage first (immediate)
      const localQuotations = JSON.parse(localStorage.getItem("quotations")) || [];
      console.log("Loaded from localStorage:", localQuotations.length);
      
      // If we have local data, show it immediately
      if (localQuotations.length > 0) {
        setQuotations(localQuotations);
      }

      const supabaseQuotations = await fetchQuotationsFromSupabase();
      
      if (supabaseQuotations) {
        const convertedSupabaseData = convertSupabaseToLocalStorage(supabaseQuotations);
        const mergedData = mergeQuotationData(localQuotations, convertedSupabaseData);
        
        // Calculate unsynced records (exist in localStorage but not in Supabase)
        const existingSupabaseIds = new Set([
          ...supabaseQuotations.map(r => r.quotation_id),
          ...supabaseQuotations.map(r => r.id)
        ]);
        
        const unsyncedRecords = localQuotations.filter(local => 
          !existingSupabaseIds.has(local.id) && 
          !supabaseQuotations.some(db => db.customer_name === local.customer?.name)
        );
        
        setUnsyncedCount(unsyncedRecords.length);
        
        // Check for null quotation_id records
        const nullQuotationIdCount = supabaseQuotations.filter(r => !r.quotation_id).length;
        setNullQuotationIdCount(nullQuotationIdCount);
        
        // Update state and localStorage with merged data
        setQuotations(mergedData);
        localStorage.setItem("quotations", JSON.stringify(mergedData));
        
        setLastSyncTime(new Date());
        console.log("✅ Data synchronized successfully");
      } else {
        // If Supabase fails, just use localStorage
        console.log("Using localStorage data only");
        setQuotations(localQuotations);
        setUnsyncedCount(localQuotations.length); // Assume all are unsynced if Supabase fails
      }
    } catch (err) {
      console.error("Error loading quotations:", err);
      // Fallback to localStorage only
      const localQuotations = JSON.parse(localStorage.getItem("quotations")) || [];
      setQuotations(localQuotations);
    } finally {
      setLoading(false);
    }
  }

  // Load quotations on component mount
  useEffect(() => {
    loadQuotations();
  }, []);

  // Update field with dual storage (localStorage + Supabase)
  const updateField = async (id, field, value) => {
    // Update localStorage immediately (for responsive UI)
    const updated = quotations.map((q) =>
      q.id === id ? { ...q, [field]: value } : q
    );
    setQuotations(updated);
    localStorage.setItem("quotations", JSON.stringify(updated));

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
    await loadQuotations();
  };

  // Debug functions
  const runDatabaseDiagnostics = async () => {
    try {
      setDebugInfo("🔍 Running database diagnostics...\n");
      
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
      
      // Check total records
      const { data: allData, error: countError } = await supabase
        .from("quotations")
        .select("id, quotation_id, customer_name, follow_up_status, follow_up_date, remarks")
        .limit(10);
      
      if (countError) {
        setDebugInfo(prev => prev + `❌ Count error: ${countError.message}\n`);
      } else {
        setDebugInfo(prev => prev + `📊 Total sample records: ${allData?.length || 0}\n`);
        setDebugInfo(prev => prev + `📋 Sample records:\n`);
        
        allData?.forEach((record, index) => {
          setDebugInfo(prev => prev + `  ${index + 1}. ID: ${record.id}, Quotation ID: ${record.quotation_id}, Customer: ${record.customer_name}\n`);
          setDebugInfo(prev => prev + `     Status: ${record.follow_up_status || 'null'}, Date: ${record.follow_up_date || 'null'}, Remarks: ${record.remarks || 'null'}\n`);
        });
      }
      
      // Check localStorage data
      const localData = JSON.parse(localStorage.getItem("quotations")) || [];
      setDebugInfo(prev => prev + `\n💾 localStorage records: ${localData.length}\n`);
      
      localData.slice(0, 3).forEach((record, index) => {
        setDebugInfo(prev => prev + `  ${index + 1}. Local ID: ${record.id}, Customer: ${record.customer?.name}\n`);
        setDebugInfo(prev => prev + `     Status: ${record.followUpStatus || 'null'}, Date: ${record.followUpDate || 'null'}, Remarks: ${record.remarks || 'null'}\n`);
      });
      
    } catch (err) {
      setDebugInfo(prev => prev + `💥 Diagnostic error: ${err.message}\n`);
    }
  };

  const testColumnUpdate = async () => {
    try {
      setDebugInfo(prev => (prev || "") + "\n🧪 Testing column updates...\n");

      // Test each follow-up column individually
      const testColumns = [
        { field: 'follow_up_status', value: 'Pending', testValue: 'Contacted' },
        { field: 'follow_up_date', value: null, testValue: new Date().toISOString().split('T')[0] },
        { field: 'remarks', value: null, testValue: 'Test remark' }
      ];

      // Get a test record
      const { data: testRecord } = await supabase
        .from("quotations")
        .select("id, quotation_id, customer_name")
        .limit(1)
        .single();

      if (!testRecord) {
        setDebugInfo(prev => prev + "❌ No test record available\n");
        return;
      }

      setDebugInfo(prev => prev + `📝 Using test record: ${testRecord.customer_name} (${testRecord.quotation_id})\n`);

      for (const col of testColumns) {
        setDebugInfo(prev => prev + `\n🔍 Testing ${col.field} column...\n`);
        
        const { data, error } = await supabase
          .from("quotations")
          .update({ [col.field]: col.testValue })
          .eq("quotation_id", testRecord.quotation_id)
          .select(`${col.field}`);

        if (error) {
          setDebugInfo(prev => prev + `❌ ${col.field} update failed: ${error.message}\n`);
          if (error.code === '42703') {
            setDebugInfo(prev => prev + `💡 Column ${col.field} doesn't exist - needs to be added\n`);
          }
        } else if (data && data.length > 0) {
          setDebugInfo(prev => prev + `✅ ${col.field} updated successfully to: ${data[0][col.field]}\n`);
        } else {
          setDebugInfo(prev => prev + `⚠️ ${col.field} update returned no data\n`);
        }
      }

      // Reset test record
      await supabase
        .from("quotations")
        .update({ 
          follow_up_status: 'Pending', 
          follow_up_date: null, 
          remarks: null 
        })
        .eq("quotation_id", testRecord.quotation_id);

      setDebugInfo(prev => prev + "\n✅ Column testing completed\n");

    } catch (err) {
      setDebugInfo(prev => (prev || "") + `💥 Column test error: ${err.message}\n`);
    }
  };

  // Sync missing localStorage records to Supabase
  async function syncMissingRecordsToSupabase() {
    try {
      setSyncing(true);
      setDebugInfo(prev => (prev || "") + "\n🔄 Starting sync of missing records to Supabase...\n");

      const localQuotations = JSON.parse(localStorage.getItem("quotations")) || [];
      
      if (localQuotations.length === 0) {
        setDebugInfo(prev => prev + "❌ No local quotations found to sync\n");
        return;
      }

      // Get existing Supabase records
      const { data: existingRecords } = await supabase
        .from("quotations")
        .select("quotation_id, id, customer_name");

      const existingIds = new Set([
        ...(existingRecords?.map(r => r.quotation_id) || []),
        ...(existingRecords?.map(r => r.id) || [])
      ]);

      // Find records that exist in localStorage but not in Supabase
      const missingRecords = localQuotations.filter(local => 
        !existingIds.has(local.id) && 
        !existingRecords?.some(db => db.customer_name === local.customer?.name)
      );

      setDebugInfo(prev => prev + `📊 Found ${missingRecords.length} records to sync\n`);

      if (missingRecords.length === 0) {
        setDebugInfo(prev => prev + "✅ All records already exist in database\n");
        alert("✅ All quotations are already synced to the database!");
        return;
      }

      let successCount = 0;
      let errorCount = 0;

      // Sync each missing record
      for (const record of missingRecords) {
        try {
          setDebugInfo(prev => prev + `📝 Syncing: ${record.customer?.name} (${record.id})\n`);

          const supabaseData = {
            customer_name: record.customer?.name,
            customer_contact: record.customer?.contact,
            customer_email: record.customer?.email || null,
            customer_address: record.customer?.address,
            system_type: record.systemType || "Unknown",
            panel_brand: record.solarPanel?.company || record.panelBrand || "Unknown",
            panel_watt: record.solarPanel?.watts || record.panelWatt || "0",
            panel_quantity: record.solarPanel?.quantity || record.panelQty || 0,
            panel_total: record.solarPanel ? (record.solarPanel.quantity * record.solarPanel.pricePerWatt * parseInt(record.solarPanel.watts)) : 0,
            inverter_type: record.inverter?.company || record.dayInverter || "Unknown",
            inverter_size: record.inverter?.kw ? `${record.inverter.kw}kW` : "Unknown",
            inverter_total: record.inverter ? (record.inverter.quantity * record.inverter.pricePerUnit) : 0,
            battery_type: record.batteryType || null,
            battery_model: record.batteryModel || null,
            battery_quantity: record.batteryQuantity || 0,
            battery_total: record.batteryQuantity && record.batteryPrice ? (record.batteryQuantity * record.batteryPrice) : 0,
            stand_type: record.stand?.type || record.standType || "Unknown",
            stand_quantity: 1,
            stand_total: record.stand?.pricePerStand || 0,
            safety_charges: record.safety || 0,
            transport_charges: record.transport || 0,
            installation_charges: record.labour || 0,
            green_meter: record.greenMeter || false,
            green_meter_charges: record.Greenmeter || 0,
            total_amount: record.total || 0,
            quotation_date: record.quotationDate || record.date || new Date().toISOString(),
            created_at: record.date || new Date().toISOString(),
            quotation_id: record.id,
            staff_name: record.staff || "Unknown",
            location: record.location || "Unknown",
            follow_up_date: record.followUpDate || null,
            follow_up_status: record.followUpStatus || "Pending",
            remarks: record.remarks || null,
            updated_at: new Date().toISOString()
          };

          const { data, error } = await supabase
            .from("quotations")
            .insert([supabaseData])
            .select();

          if (error) {
            setDebugInfo(prev => prev + `❌ Error syncing ${record.customer?.name}: ${error.message}\n`);
            errorCount++;
          } else {
            setDebugInfo(prev => prev + `✅ Synced ${record.customer?.name} successfully\n`);
            successCount++;
          }

        } catch (err) {
          setDebugInfo(prev => prev + `💥 Unexpected error syncing ${record.customer?.name}: ${err.message}\n`);
          errorCount++;
        }
      }

      setDebugInfo(prev => prev + `\n📊 Sync completed: ${successCount} successful, ${errorCount} failed\n`);
      
      if (successCount > 0) {
        setUnsyncedCount(Math.max(0, unsyncedCount - successCount)); // Update unsynced count
        alert(`✅ Successfully synced ${successCount} quotations to the database!\n\nYou can now update follow-up status for all records.`);
        await loadQuotations(); // Refresh the data
      } else {
        alert(`❌ Failed to sync quotations. Check the debug log for details.`);
      }

    } catch (err) {
      setDebugInfo(prev => (prev || "") + `💥 Sync error: ${err.message}\n`);
      alert(`❌ Sync failed: ${err.message}`);
    } finally {
      setSyncing(false);
    }
  }

  // Helper: Disable fields for Closed/Not Interested
  const isViewOnly = (status) =>
    status === "Closed" || status === "Not Interested";

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
              {loading ? "Loading..." : `${quotations.length} quotations loaded`}
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

      {/* Null Quotation ID Warning */}
      {nullQuotationIdCount > 0 && (
        <div style={{
          background: "linear-gradient(135deg, #ffebee, #ffcdd2)",
          border: "2px solid #e53935",
          borderRadius: "12px",
          padding: "15px",
          marginBottom: "20px",
          display: "flex",
          alignItems: "center",
          gap: "15px"
        }}>
          <div style={{ fontSize: "2rem" }}>🚨</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: "700", color: "#c62828", marginBottom: "5px" }}>
              ID Mismatch Issue Detected ({nullQuotationIdCount} records)
            </div>
            <div style={{ fontSize: "14px", color: "#b71c1c" }}>
              Some database records have missing quotation_id values, causing follow-up updates to fail. This is the reason your status changes aren't saving to the database.
            </div>
          </div>
          <button
            onClick={fixNullQuotationIds}
            disabled={syncing}
            style={{
              background: "#e53935",
              color: "white",
              border: "none",
              borderRadius: "8px",
              padding: "10px 15px",
              cursor: syncing ? "not-allowed" : "pointer",
              fontSize: "13px",
              fontWeight: "600",
              whiteSpace: "nowrap"
            }}
          >
            {syncing ? "⏳ Fixing..." : "🔧 Fix Now"}
          </button>
        </div>
      )}

      {/* Unsynced Records Warning */}
      {unsyncedCount > 0 && (
        <div style={{
          background: "linear-gradient(135deg, #fff3cd, #ffeaa7)",
          border: "2px solid #ff9800",
          borderRadius: "12px",
          padding: "15px",
          marginBottom: "20px",
          display: "flex",
          alignItems: "center",
          gap: "15px"
        }}>
          <div style={{ fontSize: "2rem" }}>⚠️</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: "700", color: "#e65100", marginBottom: "5px" }}>
              {unsyncedCount} Quotation{unsyncedCount > 1 ? 's' : ''} Not Synced to Database
            </div>
            <div style={{ fontSize: "14px", color: "#bf360c" }}>
              These quotations exist only in local storage. Click "Sync Missing to DB" to backup them to the cloud database.
            </div>
          </div>
          <button
            onClick={syncMissingRecordsToSupabase}
            disabled={syncing}
            style={{
              background: "#ff9800",
              color: "white",
              border: "none",
              borderRadius: "8px",
              padding: "10px 15px",
              cursor: syncing ? "not-allowed" : "pointer",
              fontSize: "13px",
              fontWeight: "600",
              whiteSpace: "nowrap"
            }}
          >
            {syncing ? "⏳ Syncing..." : "📤 Sync Now"}
          </button>
        </div>
      )}

      {/* Debug Panel */}
      {showDebugPanel && (
        <div style={{
          background: "#f8f9fa",
          border: "2px solid #e9ecef",
          borderRadius: "12px",
          padding: "20px",
          marginBottom: "20px"
        }}>
          <h3 style={{ color: "#2196f3", margin: "0 0 15px 0" }}>🔧 Database Debug Panel</h3>
          
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
              🔍 Check Database Structure
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
              🔧 Fix Null IDs
            </button>

            <button
              onClick={testColumnUpdate}
              disabled={syncing}
              style={{
                background: syncing ? "#ccc" : "#9c27b0",
                color: "white",
                border: "none",
                borderRadius: "6px",
                padding: "8px 16px",
                cursor: syncing ? "not-allowed" : "pointer",
                fontSize: "13px",
                fontWeight: "600"
              }}
            >
              🧪 Test Column Updates
            </button>
            
            <button
              onClick={syncMissingRecordsToSupabase}
              disabled={syncing}
              style={{
                background: syncing ? "#ccc" : "#4caf50",
                color: "white",
                border: "none",
                borderRadius: "6px",
                padding: "8px 16px",
                cursor: syncing ? "not-allowed" : "pointer",
                fontSize: "13px",
                fontWeight: "600"
              }}
            >
              🔄 Sync Missing Records
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
              🧪 Test Live Update
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
            💡 <strong>Follow-up Update Issues? Try these in order:</strong>
            <br />• <strong>🔧 Fix Null IDs:</strong> Fixes missing quotation_id values (main cause of update failures)
            <br />• <strong>🔍 Check Database Structure:</strong> Verify follow-up columns exist
            <br />• <strong>🧪 Test Column Updates:</strong> Test if database columns can be updated
            <br />• <strong>🧪 Test Live Update:</strong> Test a real follow-up update
            <br />• <strong>Common Issues:</strong> Missing quotation_id, RLS policies, or permission errors
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
            {loading || syncing ? "🔄 Syncing..." : "🔄 Sync Now"}
          </button>

          <button
            onClick={syncMissingRecordsToSupabase}
            disabled={loading || syncing}
            style={{
              background: "linear-gradient(135deg, #ff9800, #f57c00)",
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
            {syncing ? "⏳ Syncing..." : "📤 Sync Missing to DB"}
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
          <p>Fetching data from database and local storage</p>
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
              </tr>
            </thead>
            <tbody>
              {quotations.map((q, index) => {
                const viewOnly = isViewOnly(q.followUpStatus || "Pending");
                return (
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
                        disabled={viewOnly}
                        style={{
                          ...inputStyle,
                          background: viewOnly ? "#f5f5f5" : "#fff"
                        }}
                        onChange={(e) =>
                          updateField(q.id, "followUpDate", e.target.value)
                        }
                      />
                    </td>
                    <td style={td}>
                      <select
                        value={q.followUpStatus || "Pending"}
                        disabled={viewOnly}
                        style={{
                          ...inputStyle,
                          background: viewOnly ? "#f5f5f5" : "#fff",
                          fontWeight: "bold",
                          color:
                            q.followUpStatus === "Closed"
                              ? "#388e3c"
                              : q.followUpStatus === "Not Interested"
                              ? "#d32f2f"
                              : q.followUpStatus === "Contacted"
                              ? "#1976d2"
                              : "#333"
                        }}
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
                    <td style={td}>
                      <input
                        type="text"
                        placeholder="Add remarks..."
                        value={q.remarks || ""}
                        disabled={viewOnly}
                        style={{
                          ...inputStyle,
                          background: viewOnly ? "#f5f5f5" : "#fff"
                        }}
                        onChange={(e) =>
                          updateField(q.id, "remarks", e.target.value)
                        }
                      />
                    </td>
                  </tr>
                );
              })}
              {quotations.length === 0 && !loading && (
                <tr>
                  <td
                    colSpan="7"
                    style={{
                      textAlign: "center",
                      padding: "40px 20px",
                      color: "#aaa",
                      fontSize: 17,
                      background: "#fffbe9"
                    }}
                  >
                    <div style={{ fontSize: "3rem", marginBottom: "15px" }}>📋</div>
                    <div style={{ marginBottom: "10px" }}>No quotations found</div>
                    <span style={{ color: "#ff9800", fontWeight: 700 }}>
                      Please generate a quotation first to start follow-ups
                    </span>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      ) : null}

      {/* Summary stats */}
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
            {Object.keys(statusColors).map(status => {
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
        💡 <strong>Dual Storage:</strong> All changes are saved both locally and in the cloud database for maximum reliability.
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