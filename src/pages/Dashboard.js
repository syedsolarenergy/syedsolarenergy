import React, { useContext, useState, useEffect } from "react";
import { useGlobalContext } from "../context/GlobalContext";
import { Link } from "react-router-dom";
import { supabase } from "../supabaseClient";

function Dashboard() {
  const { inventoryList, staffList } = useGlobalContext();
  const [projects, setProjects] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [repairs, setRepairs] = useState([]);
  const [quotations, setQuotations] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [syncStatus, setSyncStatus] = useState("loading");

  // Load all data from Supabase
  useEffect(() => {
    loadAllData();
    
    // Update time every minute
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    setSyncStatus("loading");
    
    try {
      // Load data from multiple Supabase tables concurrently
      const [
        quotationsResult,
        expensesResult,
        repairsResult,
        inventoryResult
      ] = await Promise.allSettled([
        supabase.from("quotations").select("*").order("created_at", { ascending: false }),
        supabase.from("expenses").select("*").order("created_at", { ascending: false }),
        supabase.from("repairs").select("*").order("created_at", { ascending: false }),
        supabase.from("inventory").select("*").order("created_at", { ascending: false })
      ]);

      // Process quotations
      if (quotationsResult.status === "fulfilled" && quotationsResult.value.data) {
        const quotationsData = quotationsResult.value.data.map(item => ({
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
          dealAmount: item.total_amount,
          capacity: calculateSystemCapacity(item),
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
          batteryQuantity: item.battery_quantity || 0,
          // Add progress based on follow-up status
          progress: item.follow_up_status === 'completed' ? 
            [{ stage: "Final payment received", date: item.updated_at }] : []
        }));
        setQuotations(quotationsData);
        
        // Convert completed quotations to projects
        const completedProjects = quotationsData
          .filter(q => q.followUpStatus === 'completed')
          .map(q => ({
            ...q,
            progress: [{ stage: "Final payment received", date: q.date }]
          }));
        setProjects(completedProjects);
      }

      // Process expenses
      if (expensesResult.status === "fulfilled" && expensesResult.value.data) {
        const expensesData = expensesResult.value.data.map(item => ({
          id: item.id,
          amount: item.amount || 0,
          type: item.type,
          name: item.name,
          source: item.source,
          date: item.date,
          details: item.details,
          remarks: item.remarks
        }));
        setExpenses(expensesData);
      }

      // Process repairs
      if (repairsResult.status === "fulfilled" && repairsResult.value.data) {
        const repairsData = repairsResult.value.data.map(item => ({
          id: item.id,
          customer_name: item.customer_name,
          inverter_brand: item.inverter_brand,
          inverter_model: item.inverter_model,
          status: item.status,
          priority: item.priority,
          date: item.date,
          repair_charges: item.repair_charges || 0,
          parts_used: item.parts_used || []
        }));
        setRepairs(repairsData);
      }

      // Process inventory
      if (inventoryResult.status === "fulfilled" && inventoryResult.value.data) {
        const inventoryData = inventoryResult.value.data.map(item => ({
          id: item.id,
          name: item.name,
          quantity: item.quantity || 0,
          unit_price: item.unit_price || 0,
          min_quantity: item.min_quantity || 0,
          reorder_point: item.reorder_point || 0,
          category: item.category,
          brand: item.brand
        }));
        setInventory(inventoryData);
      }

      setSyncStatus("synced");
    } catch (error) {
      console.error("Error loading data:", error);
      setSyncStatus("error");
    } finally {
      setLoading(false);
    }
  };

  // Helper function to calculate system capacity from quotation data
  const calculateSystemCapacity = (item) => {
    if (item.panel_watt && item.panel_quantity) {
      return (parseInt(item.panel_watt) * parseInt(item.panel_quantity)) / 1000; // Convert to kW
    }
    return 0;
  };

  // Calculate comprehensive metrics
  const totalProjects = projects.length;
  const completedProjects = projects.filter(p => 
    Array.isArray(p.progress) && 
    p.progress.some(prog => prog.stage === "Final payment received")
  ).length;
  const ongoingProjects = quotations.filter(q => 
    ['pending', 'contacted'].includes(q.followUpStatus)
  ).length;
  
  // Calculate expenses (only debit/expense type)
  const totalExpenses = expenses
    .filter(exp => exp.type === 'debit')
    .reduce((total, exp) => total + (parseFloat(exp.amount) || 0), 0);
  
  // Calculate revenue (credit type expenses + completed project values)
  const creditRevenue = expenses
    .filter(exp => exp.type === 'credit')
    .reduce((total, exp) => total + (parseFloat(exp.amount) || 0), 0);
  
  const projectRevenue = projects
    .filter(p => Array.isArray(p.progress) && 
      p.progress.some(prog => prog.stage === "Final payment received"))
    .reduce((total, p) => total + (parseFloat(p.dealAmount) || 0), 0);
  
  const totalRevenue = creditRevenue + projectRevenue;
  
  const totalInventoryValue = inventory.reduce(
    (total, item) => total + (parseFloat(item.quantity) * parseFloat(item.unit_price)), 0
  );

  const pendingRepairs = repairs.filter(r => 
    r.status === "Pending Approval" || r.status === "In Progress"
  ).length;
  const completedRepairs = repairs.filter(r => 
    r.status === "Completed" || r.status === "Delivered"
  ).length;
  
  const pendingQuotations = quotations.filter(q => 
    ['pending', 'contacted'].includes(q.followUpStatus)
  ).length;

  // Calculate total capacity installed
  const totalCapacityInstalled = projects
    .filter(p => Array.isArray(p.progress) && 
      p.progress.some(prog => prog.stage === "Final payment received"))
    .reduce((total, p) => total + (parseFloat(p.capacity) || 0), 0);

  // Get recent activities
  const recentProjects = projects
    .sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0))
    .slice(0, 4);

  const upcomingFollowUps = quotations
    .filter(q => q.followUpDate && new Date(q.followUpDate) >= new Date())
    .sort((a, b) => new Date(a.followUpDate) - new Date(b.followUpDate))
    .slice(0, 4);

  // Recent repairs that need attention
  const urgentRepairs = repairs
    .filter(r => r.priority === "High" || r.priority === "Urgent" || r.status === "Pending Approval")
    .slice(0, 3);

  // Low stock items
  const lowStockItems = inventory.filter(item => 
    parseFloat(item.quantity) <= (parseFloat(item.reorder_point) || parseFloat(item.min_quantity) || 5)
  );

  const currentUser = JSON.parse(localStorage.getItem("loggedInUser") || "{}");

  const manualSync = async () => {
    await loadAllData();
  };

  return (
    <div style={styles.container}>
      {/* Professional Header */}
      <div style={styles.header}>
        <div style={styles.headerContent}>
          <div style={styles.welcomeSection}>
            <h1 style={styles.title}>
              ⚡ Solar Management Dashboard
            </h1>
            <p style={styles.subtitle}>
              Welcome back, {currentUser.name || 'User'}! Here's your business overview for today.
            </p>
            <div style={styles.syncStatus}>
              <span style={{
                color: syncStatus === "synced" ? "#4caf50" : 
                       syncStatus === "loading" ? "#ff9800" : "#f44336"
              }}>
                {syncStatus === "synced" ? "✅ Data synced" : 
                 syncStatus === "loading" ? "🔄 Loading..." : "❌ Sync error"}
              </span>
            </div>
          </div>
          <div style={styles.headerActions}>
            <button
              onClick={manualSync}
              disabled={loading}
              style={styles.syncButton}
            >
              {loading ? "🔄 Syncing..." : "🔄 Refresh Data"}
            </button>
          </div>
          <div style={styles.timeWidget}>
            <div style={styles.time}>
              {currentTime.toLocaleTimeString('en-PK', { 
                hour: '2-digit', 
                minute: '2-digit',
                hour12: true 
              })}
            </div>
            <div style={styles.date}>
              {currentTime.toLocaleDateString('en-PK', { 
                weekday: 'long',
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div style={styles.loadingContainer}>
          <div style={styles.loadingSpinner}>⏳</div>
          <h3>Loading Dashboard Data...</h3>
          <p>Fetching latest information from database...</p>
        </div>
      ) : (
        <>
          {/* Key Performance Indicators */}
          <div style={styles.kpiSection}>
            <h2 style={styles.sectionTitle}>📊 Key Performance Indicators</h2>
            <div style={styles.kpiGrid}>
              <KPICard 
                icon="💰" 
                title="Total Revenue" 
                value={`Rs ${totalRevenue.toLocaleString()}`}
                subtitle={`From ${completedProjects} completed projects`}
                color="linear-gradient(135deg, #28a745, #20c997)"
                link="/reports"
              />
              
              <KPICard 
                icon="⚡" 
                title="Capacity Installed" 
                value={`${totalCapacityInstalled.toFixed(1)} kW`}
                subtitle="Total solar capacity deployed"
                color="linear-gradient(135deg, #fd7e14, #ffc107)"
                link="/reports"
              />
              
              <KPICard 
                icon="🏗️" 
                title="Active Quotations" 
                value={ongoingProjects}
                subtitle={`${totalProjects} total projects`}
                color="linear-gradient(135deg, #007bff, #0056b3)"
                link="/quotationsoftware"
              />
              
              <KPICard 
                icon="📈" 
                title="Success Rate" 
                value={`${totalProjects > 0 ? Math.round((completedProjects / totalProjects) * 100) : 0}%`}
                subtitle="Project completion rate"
                color="linear-gradient(135deg, #17a2b8, #138496)"
                link="/reports"
              />
            </div>
          </div>

          {/* Main Management Grid */}
          <div style={styles.managementSection}>
            <h2 style={styles.sectionTitle}>🏢 Business Management</h2>
            <div style={styles.statsGrid}>
              <ManagementCard 
                icon="📦" 
                title="Inventory Management" 
                value={`Rs ${totalInventoryValue.toLocaleString()}`}
                subtitle={`${inventory.length} items • ${lowStockItems.length} low stock`}
                color="linear-gradient(135deg, #6610f2, #563d7c)"
                link="/inventory"
                alert={lowStockItems.length > 0}
              />
              
              <ManagementCard 
                icon="👥" 
                title="Staff Management" 
                value={staffList.length}
                subtitle="Active team members"
                color="linear-gradient(135deg, #e83e8c, #d63384)"
                link="/staff"
              />
              
              <ManagementCard 
                icon="💸" 
                title="Expense Tracking" 
                value={`Rs ${totalExpenses.toLocaleString()}`}
                subtitle="Total business expenses"
                color="linear-gradient(135deg, #dc3545, #c82333)"
                link="/expenses"
              />
              
              <ManagementCard 
                icon="🛠️" 
                title="Repair Services" 
                value={`${pendingRepairs} Pending`}
                subtitle={`${completedRepairs} completed repairs`}
                color="linear-gradient(135deg, #fd7e14, #e55a00)"
                link="/repairs"
                alert={pendingRepairs > 0}
              />
              
              <ManagementCard 
                icon="📋" 
                title="Quotation Management" 
                value={`${pendingQuotations} Pending`}
                subtitle={`${quotations.length} total quotations`}
                color="linear-gradient(135deg, #20c997, #17a2b8)"
                link="/quotationsoftware"
                alert={pendingQuotations > 0}
              />
              
              <ManagementCard 
                icon="📞" 
                title="Follow-up Center" 
                value={upcomingFollowUps.length}
                subtitle="Upcoming customer follow-ups"
                color="linear-gradient(135deg, #ffc107, #e0a800)"
                link="/followups"
                alert={upcomingFollowUps.length > 0}
              />
            </div>
          </div>

          {/* Quick Actions */}
          <div style={styles.quickActions}>
            <h2 style={styles.sectionTitle}>⚡ Quick Actions</h2>
            <div style={styles.actionGrid}>
              <QuickActionButton 
                icon="📋" 
                label="Create Quotation" 
                to="/quotationsoftware"
                color="#28a745"
                description="Generate customer quote"
              />
              <QuickActionButton 
                icon="📦" 
                label="Manage Inventory" 
                to="/inventory"
                color="#6610f2"
                description="Update stock levels"
              />
              <QuickActionButton 
                icon="🛠️" 
                label="Add Repair" 
                to="/repairs"
                color="#fd7e14"
                description="Register new repair"
              />
              <QuickActionButton 
                icon="📊" 
                label="View Reports" 
                to="/reports"
                color="#fd7e14"
                description="Business analytics"
              />
              <QuickActionButton 
                icon="💸" 
                label="Add Expense" 
                to="/expenses"
                color="#17a2b8"
                description="Record new expense"
              />
              <QuickActionButton 
                icon="📞" 
                label="Follow-ups" 
                to="/followups"
                color="#ffc107"
                description="Manage follow-ups"
              />
            </div>
          </div>

          {/* Activity Dashboard */}
          <div style={styles.activitySection}>
            <div style={styles.activityCard}>
              <h3 style={styles.activityTitle}>🚀 Recent Projects</h3>
              {recentProjects.length > 0 ? (
                <div style={styles.activityList}>
                  {recentProjects.map((project, index) => (
                    <div key={index} style={styles.activityItem}>
                      <div style={styles.activityIcon}>🏗️</div>
                      <div style={styles.activityContent}>
                        <div style={styles.activityItemTitle}>{project.customer?.name || 'Unknown Customer'}</div>
                        <div style={styles.activitySubtitle}>
                          {project.capacity}kW System • Rs {parseFloat(project.dealAmount || 0).toLocaleString()}
                        </div>
                        <div style={styles.activityDate}>
                          {project.date ? new Date(project.date).toLocaleDateString() : 'No date'}
                        </div>
                      </div>
                      <Link to="/quotationsoftware" style={styles.activityLink}>
                        Manage →
                      </Link>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={styles.emptyState}>
                  <p>No projects found.</p>
                  <Link to="/quotationsoftware" style={styles.link}>Create your first quotation!</Link>
                </div>
              )}
            </div>

            <div style={styles.activityCard}>
              <h3 style={styles.activityTitle}>📅 Upcoming Follow-ups</h3>
              {upcomingFollowUps.length > 0 ? (
                <div style={styles.activityList}>
                  {upcomingFollowUps.map((quotation, index) => (
                    <div key={index} style={styles.activityItem}>
                      <div style={styles.activityIcon}>📞</div>
                      <div style={styles.activityContent}>
                        <div style={styles.activityItemTitle}>{quotation.customer?.name || 'Unknown Customer'}</div>
                        <div style={styles.activitySubtitle}>
                          {quotation.capacity}kW Quote • Rs {parseFloat(quotation.total || 0).toLocaleString()}
                        </div>
                        <div style={styles.activityDate}>
                          Follow-up: {new Date(quotation.followUpDate).toLocaleDateString()}
                        </div>
                      </div>
                      <Link to="/followups" style={styles.activityLink}>
                        Follow →
                      </Link>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={styles.emptyState}>
                  <p>No upcoming follow-ups.</p>
                  <Link to="/quotationsoftware" style={styles.link}>Create a quotation!</Link>
                </div>
              )}
            </div>

            {/* Alerts Section */}
            <div style={styles.alertsCard}>
              <h3 style={styles.alertTitle}>🔔 System Alerts</h3>
              <div style={styles.alertsList}>
                {lowStockItems.length > 0 && (
                  <div style={styles.alertItem}>
                    <span style={styles.alertIcon}>⚠️</span>
                    <div>
                      <strong>{lowStockItems.length} items low in stock</strong>
                      <div style={styles.alertSubtext}>
                        {lowStockItems.slice(0, 3).map(item => item.name).join(', ')}
                        {lowStockItems.length > 3 && ` and ${lowStockItems.length - 3} more`}
                      </div>
                    </div>
                    <Link to="/inventory" style={styles.alertLink}>View</Link>
                  </div>
                )}
                
                {urgentRepairs.length > 0 && (
                  <div style={styles.alertItem}>
                    <span style={styles.alertIcon}>🛠️</span>
                    <div>
                      <strong>{urgentRepairs.length} urgent repairs</strong>
                      <div style={styles.alertSubtext}>
                        {urgentRepairs.slice(0, 2).map(repair => repair.customer_name).join(', ')}
                        {urgentRepairs.length > 2 && ` and ${urgentRepairs.length - 2} more`}
                      </div>
                    </div>
                    <Link to="/repairs" style={styles.alertLink}>View</Link>
                  </div>
                )}
                
                {pendingQuotations > 0 && (
                  <div style={styles.alertItem}>
                    <span style={styles.alertIcon}>📋</span>
                    <div>
                      <strong>{pendingQuotations} pending quotations</strong>
                      <div style={styles.alertSubtext}>Follow-up required</div>
                    </div>
                    <Link to="/followups" style={styles.alertLink}>View</Link>
                  </div>
                )}
                
                {lowStockItems.length === 0 && urgentRepairs.length === 0 && pendingQuotations === 0 && (
                  <div style={styles.noAlerts}>
                    <span style={styles.alertIcon}>✅</span>
                    All systems running smoothly!
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// Reusable KPI Card Component
function KPICard({ icon, title, value, subtitle, color, link }) {
  return (
    <Link to={link} style={{ textDecoration: 'none' }}>
      <div style={{
        ...styles.kpiCard,
        background: color,
      }}>
        <div style={styles.kpiIcon}>{icon}</div>
        <div style={styles.kpiContent}>
          <div style={styles.kpiValue}>{value}</div>
          <div style={styles.kpiTitle}>{title}</div>
          <div style={styles.kpiSubtitle}>{subtitle}</div>
        </div>
        <div style={styles.kpiArrow}>→</div>
      </div>
    </Link>
  );
}

// Management Card Component
function ManagementCard({ icon, title, value, subtitle, color, link, alert }) {
  return (
    <Link to={link} style={{ textDecoration: 'none' }}>
      <div style={{
        ...styles.managementCard,
        background: color,
        boxShadow: alert ? '0 0 20px rgba(255, 193, 7, 0.4)' : styles.managementCard.boxShadow
      }}>
        {alert && <div style={styles.alertBadge}>!</div>}
        <div style={styles.managementIcon}>{icon}</div>
        <div style={styles.managementContent}>
          <div style={styles.managementValue}>{value}</div>
          <div style={styles.managementTitle}>{title}</div>
          <div style={styles.managementSubtitle}>{subtitle}</div>
        </div>
        <div style={styles.managementArrow}>→</div>
      </div>
    </Link>
  );
}

// Quick Action Button Component
function QuickActionButton({ icon, label, to, color, description }) {
  return (
    <Link to={to} style={{ textDecoration: 'none' }}>
      <div style={{
        ...styles.actionButton,
        borderColor: color,
      }}>
        <div style={{ ...styles.actionIcon, color }}>{icon}</div>
        <div style={styles.actionLabel}>{label}</div>
        <div style={styles.actionDescription}>{description}</div>
      </div>
    </Link>
  );
}

// Professional Styles
const styles = {
  container: {
    padding: '24px',
    background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
    minHeight: '100vh',
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  },
  
  header: {
    background: 'linear-gradient(135deg, #2c3e50, #34495e)',
    borderRadius: '16px',
    padding: '32px',
    marginBottom: '32px',
    color: 'white',
    boxShadow: '0 10px 40px rgba(44, 62, 80, 0.3)',
  },
  
  headerContent: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '24px',
  },
  
  welcomeSection: {
    flex: 1,
  },
  
  title: {
    fontSize: '2.2rem',
    fontWeight: '700',
    margin: '0 0 12px 0',
    textShadow: '0 2px 10px rgba(0,0,0,0.2)',
    letterSpacing: '-0.025em',
  },
  
  subtitle: {
    fontSize: '1.1rem',
    opacity: '0.9',
    margin: '0 0 8px 0',
    fontWeight: '400',
    lineHeight: 1.5,
  },
  
  syncStatus: {
    fontSize: '0.9rem',
    opacity: '0.8',
  },
  
  headerActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  
  syncButton: {
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
  
  timeWidget: {
    textAlign: 'right',
    background: 'rgba(255,255,255,0.1)',
    padding: '20px 24px',
    borderRadius: '12px',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255,255,255,0.1)',
  },
  
  time: {
    fontSize: '2rem',
    fontWeight: '600',
    marginBottom: '4px',
  },
  
  date: {
    fontSize: '0.9rem',
    opacity: '0.8',
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
  
  sectionTitle: {
    fontSize: '1.4rem',
    fontWeight: '700',
    marginBottom: '20px',
    color: '#2c3e50',
    letterSpacing: '-0.025em',
  },
  
  kpiSection: {
    marginBottom: '40px',
  },
  
  kpiGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '20px',
  },
  
  kpiCard: {
    padding: '24px',
    borderRadius: '16px',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
    transition: 'all 0.3s ease',
    cursor: 'pointer',
    boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
    border: '1px solid rgba(255,255,255,0.1)',
  },
  
  kpiIcon: {
    fontSize: '2.5rem',
    opacity: '0.9',
  },
  
  kpiContent: {
    flex: 1,
  },
  
  kpiValue: {
    fontSize: '1.8rem',
    fontWeight: '700',
    marginBottom: '4px',
    textShadow: '0 2px 5px rgba(0,0,0,0.2)',
  },
  
  kpiTitle: {
    fontSize: '1rem',
    fontWeight: '600',
    marginBottom: '2px',
    opacity: '0.95',
  },
  
  kpiSubtitle: {
    fontSize: '0.85rem',
    opacity: '0.75',
  },
  
  kpiArrow: {
    fontSize: '1.5rem',
    opacity: '0.7',
    transition: 'transform 0.3s ease',
  },
  
  managementSection: {
    marginBottom: '40px',
  },
  
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
    gap: '20px',
  },
  
  managementCard: {
    padding: '24px',
    borderRadius: '16px',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
    transition: 'all 0.3s ease',
    cursor: 'pointer',
    boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
    position: 'relative',
    border: '1px solid rgba(255,255,255,0.1)',
  },
  
  managementIcon: {
    fontSize: '2.5rem',
    opacity: '0.9',
  },
  
  managementContent: {
    flex: 1,
  },
  
  managementValue: {
    fontSize: '1.6rem',
    fontWeight: '700',
    marginBottom: '4px',
    textShadow: '0 2px 5px rgba(0,0,0,0.2)',
  },
  
  managementTitle: {
    fontSize: '1rem',
    fontWeight: '600',
    marginBottom: '2px',
    opacity: '0.95',
  },
  
  managementSubtitle: {
    fontSize: '0.85rem',
    opacity: '0.75',
  },
  
  managementArrow: {
    fontSize: '1.5rem',
    opacity: '0.7',
    transition: 'transform 0.3s ease',
  },
  
  alertBadge: {
    position: 'absolute',
    top: '12px',
    right: '12px',
    background: '#ffc107',
    color: '#000',
    borderRadius: '50%',
    width: '24px',
    height: '24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.8rem',
    fontWeight: 'bold',
    animation: 'pulse 2s infinite',
  },
  
  quickActions: {
    marginBottom: '40px',
  },
  
  actionGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '16px',
  },
  
  actionButton: {
    background: 'white',
    border: '2px solid',
    borderRadius: '12px',
    padding: '20px',
    textAlign: 'center',
    transition: 'all 0.3s ease',
    cursor: 'pointer',
    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
  },
  
  actionIcon: {
    fontSize: '2rem',
    marginBottom: '12px',
    display: 'block',
  },
  
  actionLabel: {
    fontWeight: '600',
    color: '#2c3e50',
    fontSize: '1rem',
    marginBottom: '4px',
  },
  
  actionDescription: {
    fontSize: '0.85rem',
    color: '#6c757d',
  },
  
  activitySection: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
    gap: '24px',
    marginBottom: '40px',
  },
  
  activityCard: {
    background: 'white',
    borderRadius: '16px',
    padding: '24px',
    boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
    border: '1px solid #e9ecef',
  },
  
  activityTitle: {
    fontSize: '1.2rem',
    fontWeight: '700',
    marginBottom: '20px',
    color: '#2c3e50',
  },
  
  activityList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  
  activityItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    padding: '16px',
    background: '#f8f9fa',
    borderRadius: '10px',
    border: '1px solid #e9ecef',
    transition: 'all 0.2s ease',
  },
  
  activityIcon: {
    fontSize: '1.5rem',
  },
  
  activityContent: {
    flex: 1,
  },
  
  activityItemTitle: {
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: '2px',
    fontSize: '0.95rem',
  },
  
  activitySubtitle: {
    fontSize: '0.85rem',
    color: '#6c757d',
    marginBottom: '2px',
  },
  
  activityDate: {
    fontSize: '0.75rem',
    color: '#adb5bd',
  },
  
  activityLink: {
    color: '#007bff',
    textDecoration: 'none',
    fontWeight: '600',
    fontSize: '0.9rem',
    whiteSpace: 'nowrap',
  },
  
  alertsCard: {
    background: 'white',
    borderRadius: '16px',
    padding: '24px',
    boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
    border: '1px solid #e9ecef',
    gridColumn: '1 / -1',
  },
  
  alertTitle: {
    fontSize: '1.2rem',
    fontWeight: '700',
    marginBottom: '20px',
    color: '#2c3e50',
  },
  
  alertsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  
  alertItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    padding: '16px',
    background: '#fff3cd',
    borderRadius: '10px',
    border: '1px solid #ffeaa7',
  },
  
  alertIcon: {
    fontSize: '1.2rem',
  },
  
  alertSubtext: {
    fontSize: '0.8rem',
    color: '#856404',
    marginTop: '2px',
  },
  
  alertLink: {
    color: '#856404',
    textDecoration: 'none',
    fontWeight: '600',
    fontSize: '0.9rem',
    marginLeft: 'auto',
  },
  
  noAlerts: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '20px',
    background: '#d1ecf1',
    borderRadius: '10px',
    border: '1px solid #bee5eb',
    color: '#0c5460',
    fontWeight: '500',
    justifyContent: 'center',
  },
  
  emptyState: {
    textAlign: 'center',
    color: '#6c757d',
    padding: '32px 20px',
    background: '#f8f9fa',
    borderRadius: '10px',
    border: '1px solid #e9ecef',
  },
  
  link: {
    color: '#007bff',
    textDecoration: 'none',
    fontWeight: '600',
  },
};