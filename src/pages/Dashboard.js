import React, { useContext, useState, useEffect } from "react";
import { useGlobalContext } from "../context/GlobalContext";
import { Link } from "react-router-dom";

function Dashboard() {
  const { inventoryList, staffList } = useGlobalContext();
  const [projects, setProjects] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [repairs, setRepairs] = useState([]);
  const [quotations, setQuotations] = useState([]);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Load all data from localStorage
  useEffect(() => {
    const loadData = () => {
      setProjects(JSON.parse(localStorage.getItem("projects")) || []);
      setExpenses(JSON.parse(localStorage.getItem("expenses")) || []);
      setRepairs(JSON.parse(localStorage.getItem("repairs")) || []);
      setQuotations(JSON.parse(localStorage.getItem("quotations")) || []);
    };
    
    loadData();
    
    // Update time every minute
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  // Calculate metrics
  const totalProjects = projects.length;
  const completedProjects = projects.filter(p => 
    Array.isArray(p.progress) && 
    p.progress.some(prog => prog.stage === "Final payment received")
  ).length;
  const ongoingProjects = totalProjects - completedProjects;
  
  const totalExpenses = expenses.reduce((total, exp) => total + (exp.amount || 0), 0);
  
  const totalInventoryValue = inventoryList.reduce(
    (total, item) => total + (item.quantity * item.price), 0
  );

  const pendingRepairs = repairs.filter(r => r.status === "Pending").length;
  const pendingQuotations = quotations.filter(q => 
    !q.followUpStatus || q.followUpStatus === "Pending"
  ).length;

  // Calculate total revenue from completed projects
  const totalRevenue = projects
    .filter(p => Array.isArray(p.progress) && 
      p.progress.some(prog => prog.stage === "Final payment received"))
    .reduce((total, p) => total + (parseFloat(p.dealAmount) || 0), 0);

  // Get recent activities
  const recentProjects = projects
    .sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0))
    .slice(0, 3);

  const upcomingFollowUps = quotations
    .filter(q => q.followUpDate && new Date(q.followUpDate) >= new Date())
    .sort((a, b) => new Date(a.followUpDate) - new Date(b.followUpDate))
    .slice(0, 3);

  return (
    <div style={styles.container}>
      {/* Header Section */}
      <div style={styles.header}>
        <div style={styles.headerContent}>
          <div>
            <h1 style={styles.title}>☀️ Syed Solar Energy Dashboard</h1>
            <p style={styles.subtitle}>
              Welcome back! Here's what's happening with your solar business today.
            </p>
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

      {/* Main Stats Grid */}
      <div style={styles.statsGrid}>
        <StatCard 
          icon="🏗️" 
          title="Total Projects" 
          value={totalProjects}
          subtitle={`${completedProjects} completed, ${ongoingProjects} ongoing`}
          color="linear-gradient(135deg, #FF6B35, #F7931E)"
          link="/projects"
        />
        
        <StatCard 
          icon="💰" 
          title="Total Revenue" 
          value={`Rs ${totalRevenue.toLocaleString()}`}
          subtitle="From completed projects"
          color="linear-gradient(135deg, #F7931E, #FFAB00)"
          link="/projects"
        />
        
        <StatCard 
          icon="📦" 
          title="Inventory Value" 
          value={`Rs ${totalInventoryValue.toLocaleString()}`}
          subtitle={`${inventoryList.length} items in stock`}
          color="linear-gradient(135deg, #FFAB00, #FFC107)"
          link="/inventory"
        />
        
        <StatCard 
          icon="👷" 
          title="Staff Members" 
          value={staffList.length}
          subtitle="Active team members"
          color="linear-gradient(135deg, #FF6B35, #E65100)"
          link="/staff"
        />
        
        <StatCard 
          icon="💸" 
          title="Total Expenses" 
          value={`Rs ${totalExpenses.toLocaleString()}`}
          subtitle="Monthly expenses"
          color="linear-gradient(135deg, #F7931E, #FF6B35)"
          link="/expenses"
        />
        
        <StatCard 
          icon="🛠️" 
          title="Pending Repairs" 
          value={pendingRepairs}
          subtitle="Repairs awaiting attention"
          color="linear-gradient(135deg, #E65100, #D84315)"
          link="/repairs"
        />
        
        <StatCard 
          icon="📋" 
          title="Pending Quotations" 
          value={pendingQuotations}
          subtitle="Follow-ups needed"
          color="linear-gradient(135deg, #FFAB00, #FF8F00)"
          link="/followups"
        />
        
        <StatCard 
          icon="📊" 
          title="Success Rate" 
          value={`${totalProjects > 0 ? Math.round((completedProjects / totalProjects) * 100) : 0}%`}
          subtitle="Project completion rate"
          color="linear-gradient(135deg, #FFC107, #F57C00)"
          link="/reports"
        />
      </div>

      {/* Quick Actions */}
      <div style={styles.quickActions}>
        <h3 style={styles.sectionTitle}>⚡ Quick Actions</h3>
        <div style={styles.actionGrid}>
          <QuickActionButton 
            icon="➕" 
            label="Add Project" 
            to="/add-project"
            color="#FF6B35"
          />
          <QuickActionButton 
            icon="🧾" 
            label="New Quotation" 
            to="/quotation"
            color="#F7931E"
          />
          <QuickActionButton 
            icon="📦" 
            label="Update Inventory" 
            to="/inventory"
            color="#FFAB00"
          />
          <QuickActionButton 
            icon="📊" 
            label="View Reports" 
            to="/reports"
            color="#E65100"
          />
        </div>
      </div>

      {/* Recent Activities & Upcoming Tasks */}
      <div style={styles.bottomSection}>
        <div style={styles.activityCard}>
          <h3 style={styles.sectionTitle}>🔥 Recent Projects</h3>
          {recentProjects.length > 0 ? (
            <div style={styles.activityList}>
              {recentProjects.map((project, index) => (
                <div key={index} style={styles.activityItem}>
                  <div style={styles.activityIcon}>🏗️</div>
                  <div style={styles.activityContent}>
                    <div style={styles.activityTitle}>{project.customer?.name}</div>
                    <div style={styles.activitySubtitle}>
                      {project.capacity}kW System - Rs {parseFloat(project.dealAmount || 0).toLocaleString()}
                    </div>
                  </div>
                  <Link to={`/projects/${project.id}`} style={styles.activityLink}>
                    View →
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <p style={styles.emptyState}>No recent projects. <Link to="/add-project" style={styles.link}>Add your first project!</Link></p>
          )}
        </div>

        <div style={styles.activityCard}>
          <h3 style={styles.sectionTitle}>📅 Upcoming Follow-ups</h3>
          {upcomingFollowUps.length > 0 ? (
            <div style={styles.activityList}>
              {upcomingFollowUps.map((quotation, index) => (
                <div key={index} style={styles.activityItem}>
                  <div style={styles.activityIcon}>📞</div>
                  <div style={styles.activityContent}>
                    <div style={styles.activityTitle}>{quotation.customer?.name}</div>
                    <div style={styles.activitySubtitle}>
                      Follow-up on {new Date(quotation.followUpDate).toLocaleDateString()}
                    </div>
                  </div>
                  <Link to="/followups" style={styles.activityLink}>
                    View →
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <p style={styles.emptyState}>No upcoming follow-ups. <Link to="/quotation" style={styles.link}>Create a quotation!</Link></p>
          )}
        </div>
      </div>
    </div>
  );
}

// Reusable StatCard Component
function StatCard({ icon, title, value, subtitle, color, link }) {
  return (
    <Link to={link} style={{ textDecoration: 'none' }}>
      <div style={{
        ...styles.statCard,
        background: color,
      }}>
        <div style={styles.statIcon}>{icon}</div>
        <div style={styles.statContent}>
          <div style={styles.statValue}>{value}</div>
          <div style={styles.statTitle}>{title}</div>
          <div style={styles.statSubtitle}>{subtitle}</div>
        </div>
        <div style={styles.statArrow}>→</div>
      </div>
    </Link>
  );
}

// Quick Action Button Component
function QuickActionButton({ icon, label, to, color }) {
  return (
    <Link to={to} style={{ textDecoration: 'none' }}>
      <div style={{
        ...styles.actionButton,
        borderColor: color,
      }}>
        <div style={{ ...styles.actionIcon, color }}>{icon}</div>
        <div style={styles.actionLabel}>{label}</div>
      </div>
    </Link>
  );
}

// Styles object
const styles = {
  container: {
    padding: '20px',
    background: 'linear-gradient(135deg, #FFF8F0 0%, #FFEBDD 100%)',
    minHeight: '100vh',
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
  },
  
  header: {
    background: 'linear-gradient(135deg, #FF6B35, #F7931E)',
    borderRadius: '20px',
    padding: '30px',
    marginBottom: '30px',
    color: 'white',
    boxShadow: '0 10px 30px rgba(255, 107, 53, 0.3)',
  },
  
  headerContent: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '20px',
  },
  
  title: {
    fontSize: '2.5rem',
    fontWeight: '700',
    margin: '0 0 10px 0',
    textShadow: '0 2px 10px rgba(0,0,0,0.2)',
  },
  
  subtitle: {
    fontSize: '1.1rem',
    opacity: '0.9',
    margin: 0,
    fontWeight: '300',
  },
  
  timeWidget: {
    textAlign: 'right',
    background: 'rgba(255,255,255,0.1)',
    padding: '15px 20px',
    borderRadius: '15px',
    backdropFilter: 'blur(10px)',
  },
  
  time: {
    fontSize: '2rem',
    fontWeight: '700',
    marginBottom: '5px',
  },
  
  date: {
    fontSize: '0.9rem',
    opacity: '0.8',
  },
  
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '20px',
    marginBottom: '40px',
  },
  
  statCard: {
    padding: '25px',
    borderRadius: '20px',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
    transition: 'all 0.3s ease',
    cursor: 'pointer',
    boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
    position: 'relative',
    overflow: 'hidden',
  },
  
  statIcon: {
    fontSize: '3rem',
    opacity: '0.9',
  },
  
  statContent: {
    flex: 1,
  },
  
  statValue: {
    fontSize: '2rem',
    fontWeight: '700',
    marginBottom: '5px',
    textShadow: '0 2px 5px rgba(0,0,0,0.2)',
  },
  
  statTitle: {
    fontSize: '1rem',
    fontWeight: '600',
    marginBottom: '3px',
    opacity: '0.9',
  },
  
  statSubtitle: {
    fontSize: '0.85rem',
    opacity: '0.7',
  },
  
  statArrow: {
    fontSize: '1.5rem',
    opacity: '0.6',
    transition: 'transform 0.3s ease',
  },
  
  quickActions: {
    marginBottom: '40px',
  },
  
  sectionTitle: {
    fontSize: '1.5rem',
    fontWeight: '700',
    marginBottom: '20px',
    color: '#E65100',
    background: 'linear-gradient(135deg, #FF6B35, #F7931E)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  },
  
  actionGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '15px',
  },
  
  actionButton: {
    background: 'white',
    border: '2px solid',
    borderRadius: '15px',
    padding: '20px',
    textAlign: 'center',
    transition: 'all 0.3s ease',
    cursor: 'pointer',
    boxShadow: '0 5px 15px rgba(0,0,0,0.1)',
  },
  
  actionIcon: {
    fontSize: '2rem',
    marginBottom: '10px',
  },
  
  actionLabel: {
    fontWeight: '600',
    color: '#333',
  },
  
  bottomSection: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
    gap: '30px',
  },
  
  activityCard: {
    background: 'white',
    borderRadius: '20px',
    padding: '25px',
    boxShadow: '0 8px 25px rgba(0,0,0,0.1)',
    border: '1px solid #FFE0CC',
  },
  
  activityList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
  },
  
  activityItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
    padding: '15px',
    background: '#FFF8F0',
    borderRadius: '12px',
    border: '1px solid #FFE0CC',
  },
  
  activityIcon: {
    fontSize: '1.5rem',
  },
  
  activityContent: {
    flex: 1,
  },
  
  activityTitle: {
    fontWeight: '600',
    color: '#333',
    marginBottom: '3px',
  },
  
  activitySubtitle: {
    fontSize: '0.9rem',
    color: '#666',
  },
  
  activityLink: {
    color: '#F7931E',
    textDecoration: 'none',
    fontWeight: '600',
    fontSize: '0.9rem',
  },
  
  emptyState: {
    textAlign: 'center',
    color: '#666',
    fontStyle: 'italic',
    padding: '20px',
  },
  
  link: {
    color: '#F7931E',
    textDecoration: 'none',
    fontWeight: '600',
  },
};

export default Dashboard;