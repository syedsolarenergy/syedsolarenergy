import React, { useEffect, useState } from "react";
import { Line, Bar, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

function Reports() {
  const [projects, setProjects] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [staff, setStaff] = useState([]);
  const [selectedPeriod, setSelectedPeriod] = useState("all");
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  // Analytics states
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [totalProfit, setTotalProfit] = useState(0);
  const [completedProjects, setCompletedProjects] = useState(0);
  const [monthlyData, setMonthlyData] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    calculateAnalytics();
  }, [projects, expenses, selectedPeriod, selectedYear]);

  const loadData = () => {
    const storedProjects = JSON.parse(localStorage.getItem("projects")) || [];
    const storedInventory = JSON.parse(localStorage.getItem("inventory")) || [];
    const storedExpenses = JSON.parse(localStorage.getItem("expenses")) || [];
    const storedStaff = JSON.parse(localStorage.getItem("staffList")) || [];

    setProjects(storedProjects);
    setInventory(storedInventory);
    setExpenses(storedExpenses);
    setStaff(storedStaff);
  };

  const calculateAnalytics = () => {
    // Filter data based on selected period
    const filteredProjects = filterByPeriod(projects);
    const filteredExpenses = filterByPeriod(expenses);

    // Calculate revenue from completed projects
    const revenue = filteredProjects
      .filter(p => isProjectCompleted(p))
      .reduce((total, p) => total + (parseFloat(p.dealAmount) || 0), 0);

    // Calculate total expenses
    const expenseTotal = filteredExpenses.reduce((total, exp) => total + (exp.amount || 0), 0);

    // Calculate project expenses
    const projectExpenses = filteredProjects.reduce((total, p) => {
      const projectExp = (p.expenses || []).reduce((sum, exp) => sum + (exp.amount || 0), 0);
      return total + projectExp;
    }, 0);

    const totalExp = expenseTotal + projectExpenses;
    const profit = revenue - totalExp;
    const completed = filteredProjects.filter(p => isProjectCompleted(p)).length;

    setTotalRevenue(revenue);
    setTotalExpenses(totalExp);
    setTotalProfit(profit);
    setCompletedProjects(completed);

    // Calculate monthly data for charts
    calculateMonthlyData(filteredProjects, filteredExpenses);
  };

  const filterByPeriod = (data) => {
    if (selectedPeriod === "all") return data;
    
    const now = new Date();
    const filterDate = new Date();

    switch (selectedPeriod) {
      case "thisMonth":
        filterDate.setMonth(now.getMonth(), 1);
        break;
      case "lastMonth":
        filterDate.setMonth(now.getMonth() - 1, 1);
        break;
      case "thisYear":
        filterDate.setFullYear(selectedYear, 0, 1);
        break;
      case "lastYear":
        filterDate.setFullYear(selectedYear - 1, 0, 1);
        break;
      default:
        return data;
    }

    return data.filter(item => {
      const itemDate = new Date(item.date || item.created || Date.now());
      return itemDate >= filterDate;
    });
  };

  const isProjectCompleted = (project) => {
    return Array.isArray(project.progress) && 
           project.progress.some(p => p.stage === "Final payment received");
  };

  const calculateMonthlyData = (projects, expenses) => {
    const monthlyStats = {};
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", 
                   "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    // Initialize months
    months.forEach((month, index) => {
      monthlyStats[month] = { revenue: 0, expenses: 0, projects: 0 };
    });

    // Calculate project revenue by month
    projects.forEach(project => {
      if (isProjectCompleted(project)) {
        const date = new Date(project.date || Date.now());
        const month = months[date.getMonth()];
        monthlyStats[month].revenue += parseFloat(project.dealAmount) || 0;
        monthlyStats[month].projects += 1;
      }
    });

    // Calculate expenses by month
    expenses.forEach(expense => {
      const date = new Date(expense.date || Date.now());
      const month = months[date.getMonth()];
      monthlyStats[month].expenses += expense.amount || 0;
    });

    setMonthlyData(Object.values(monthlyStats));
  };

  const downloadPDF = async () => {
    setIsGeneratingPDF(true);
    
    try {
      const input = document.getElementById("report-section");
      const canvas = await html2canvas(input, {
        scale: 2,
        useCORS: true,
        logging: false,
      });
      
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pageWidth - 20;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      let heightLeft = imgHeight;
      let position = 10;

      // Add first page
      pdf.addImage(imgData, "PNG", 10, position, imgWidth, imgHeight);
      heightLeft -= pageHeight - 20;

      // Add additional pages if needed
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight + 10;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 10, position, imgWidth, imgHeight);
        heightLeft -= pageHeight - 20;
      }

      pdf.save(`Syed_Solar_Reports_${new Date().toLocaleDateString()}.pdf`);
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Error generating PDF. Please try again.");
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  // Chart configurations
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
        labels: {
          usePointStyle: true,
          padding: 20,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: "rgba(255, 171, 0, 0.1)",
        },
        ticks: {
          callback: function(value) {
            return "Rs " + value.toLocaleString();
          },
        },
      },
      x: {
        grid: {
          color: "rgba(255, 171, 0, 0.1)",
        },
      },
    },
  };

  const revenueExpenseData = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
    datasets: [
      {
        label: "Revenue",
        data: monthlyData.map(d => d.revenue),
        borderColor: "#FF6B35",
        backgroundColor: "rgba(255, 107, 53, 0.1)",
        fill: true,
        tension: 0.4,
        pointBackgroundColor: "#FF6B35",
        pointBorderColor: "#ffffff",
        pointBorderWidth: 2,
        pointRadius: 6,
      },
      {
        label: "Expenses",
        data: monthlyData.map(d => d.expenses),
        borderColor: "#F7931E",
        backgroundColor: "rgba(247, 147, 30, 0.1)",
        fill: true,
        tension: 0.4,
        pointBackgroundColor: "#F7931E",
        pointBorderColor: "#ffffff",
        pointBorderWidth: 2,
        pointRadius: 6,
      },
    ],
  };

  const projectsData = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
    datasets: [
      {
        label: "Completed Projects",
        data: monthlyData.map(d => d.projects),
        backgroundColor: "linear-gradient(135deg, #FF6B35, #FFAB00)",
        borderColor: "#FF6B35",
        borderWidth: 2,
        borderRadius: 8,
      },
    ],
  };

  const profitData = {
    labels: ["Revenue", "Expenses", "Profit"],
    datasets: [
      {
        data: [totalRevenue, totalExpenses, totalProfit],
        backgroundColor: [
          "#FF6B35",
          "#F7931E", 
          "#FFAB00",
        ],
        borderColor: [
          "#FF6B35",
          "#F7931E",
          "#FFAB00",
        ],
        borderWidth: 2,
      },
    ],
  };

  return (
    <div style={styles.container}>
      {/* Header Section */}
      <div style={styles.header}>
        <div style={styles.headerContent}>
          <div>
            <h1 style={styles.title}>📊 Business Analytics & Reports</h1>
            <p style={styles.subtitle}>
              Comprehensive insights into your solar energy business performance
            </p>
          </div>
          <div style={styles.headerActions}>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              style={styles.periodSelect}
            >
              <option value="all">All Time</option>
              <option value="thisMonth">This Month</option>
              <option value="lastMonth">Last Month</option>
              <option value="thisYear">This Year</option>
              <option value="lastYear">Last Year</option>
            </select>
            <button
              onClick={downloadPDF}
              disabled={isGeneratingPDF}
              style={{
                ...styles.downloadBtn,
                ...(isGeneratingPDF ? styles.downloadBtnLoading : {})
              }}
            >
              {isGeneratingPDF ? (
                <>
                  <span style={styles.spinner}>⏳</span>
                  Generating...
                </>
              ) : (
                <>
                  <span>📥</span>
                  Download PDF
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Report Content */}
      <div id="report-section" style={styles.reportSection}>
        {/* Company Header for PDF */}
        <div style={styles.companyHeader}>
          <div style={styles.logoSection}>
            <div style={styles.logoIcon}>☀️</div>
            <div style={styles.companyInfo}>
              <h2 style={styles.companyName}>Syed Solar Energy Pvt Ltd</h2>
              <p style={styles.companyAddress}>
                Office #23 Mustafa Plaza Ring Road Near Imtiaz Mega Center, Peshawar
              </p>
              <p style={styles.companyContact}>
                📞 0304-4678929 | 📧 sales@syedsolarenergy.com
              </p>
            </div>
          </div>
          <div style={styles.reportDate}>
            <strong>Report Generated:</strong><br />
            {new Date().toLocaleDateString('en-PK', { 
              weekday: 'long',
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </div>
        </div>

        {/* KPI Cards */}
        <div style={styles.kpiGrid}>
          <KPICard
            icon="💰"
            title="Total Revenue"
            value={`Rs ${totalRevenue.toLocaleString()}`}
            change="+12.5%"
            changeType="positive"
            color="linear-gradient(135deg, #FF6B35, #F7931E)"
          />
          <KPICard
            icon="💸"
            title="Total Expenses"
            value={`Rs ${totalExpenses.toLocaleString()}`}
            change="-5.2%"
            changeType="negative"
            color="linear-gradient(135deg, #F7931E, #FFAB00)"
          />
          <KPICard
            icon="📈"
            title="Net Profit"
            value={`Rs ${totalProfit.toLocaleString()}`}
            change="+18.7%"
            changeType="positive"
            color="linear-gradient(135deg, #FFAB00, #FFC107)"
          />
          <KPICard
            icon="🏗️"
            title="Completed Projects"
            value={completedProjects}
            change="+3"
            changeType="positive"
            color="linear-gradient(135deg, #FF6B35, #E65100)"
          />
        </div>

        {/* Charts Section */}
        <div style={styles.chartsGrid}>
          {/* Revenue vs Expenses Chart */}
          <div style={styles.chartCard}>
            <h3 style={styles.chartTitle}>📈 Revenue vs Expenses Trend</h3>
            <div style={styles.chartContainer}>
              <Line data={revenueExpenseData} options={chartOptions} />
            </div>
          </div>

          {/* Projects Chart */}
          <div style={styles.chartCard}>
            <h3 style={styles.chartTitle}>🏗️ Monthly Project Completions</h3>
            <div style={styles.chartContainer}>
              <Bar data={projectsData} options={chartOptions} />
            </div>
          </div>

          {/* Profit Distribution */}
          <div style={styles.chartCard}>
            <h3 style={styles.chartTitle}>💼 Financial Overview</h3>
            <div style={styles.chartContainer}>
              <Doughnut 
                data={profitData} 
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: "bottom",
                      labels: {
                        usePointStyle: true,
                        padding: 20,
                      },
                    },
                  },
                }}
              />
            </div>
          </div>

          {/* Business Summary */}
          <div style={styles.summaryCard}>
            <h3 style={styles.chartTitle}>📋 Business Summary</h3>
            <div style={styles.summaryContent}>
              <div style={styles.summaryItem}>
                <span style={styles.summaryLabel}>Total Projects:</span>
                <span style={styles.summaryValue}>{projects.length}</span>
              </div>
              <div style={styles.summaryItem}>
                <span style={styles.summaryLabel}>Active Staff:</span>
                <span style={styles.summaryValue}>{staff.length}</span>
              </div>
              <div style={styles.summaryItem}>
                <span style={styles.summaryLabel}>Inventory Items:</span>
                <span style={styles.summaryValue}>{inventory.length}</span>
              </div>
              <div style={styles.summaryItem}>
                <span style={styles.summaryLabel}>Success Rate:</span>
                <span style={styles.summaryValue}>
                  {projects.length > 0 ? Math.round((completedProjects / projects.length) * 100) : 0}%
                </span>
              </div>
              <div style={styles.summaryItem}>
                <span style={styles.summaryLabel}>Avg Project Value:</span>
                <span style={styles.summaryValue}>
                  Rs {completedProjects > 0 ? Math.round(totalRevenue / completedProjects).toLocaleString() : 0}
                </span>
              </div>
              <div style={styles.summaryItem}>
                <span style={styles.summaryLabel}>Profit Margin:</span>
                <span style={styles.summaryValue}>
                  {totalRevenue > 0 ? Math.round((totalProfit / totalRevenue) * 100) : 0}%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={styles.reportFooter}>
          <p style={styles.footerText}>
            This report was generated automatically by Syed Solar Energy Management System.
            For any queries, please contact us at sales@syedsolarenergy.com
          </p>
        </div>
      </div>
    </div>
  );
}

// KPI Card Component
function KPICard({ icon, title, value, change, changeType, color }) {
  return (
    <div style={{
      ...styles.kpiCard,
      background: color,
    }}>
      <div style={styles.kpiIcon}>{icon}</div>
      <div style={styles.kpiContent}>
        <div style={styles.kpiValue}>{value}</div>
        <div style={styles.kpiTitle}>{title}</div>
        <div style={{
          ...styles.kpiChange,
          color: changeType === 'positive' ? '#4caf50' : '#f44336'
        }}>
          {changeType === 'positive' ? '↗️' : '↘️'} {change}
        </div>
      </div>
    </div>
  );
}

// Styles
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

  headerActions: {
    display: 'flex',
    gap: '15px',
    alignItems: 'center',
    flexWrap: 'wrap',
  },

  periodSelect: {
    padding: '10px 15px',
    borderRadius: '10px',
    border: 'none',
    background: 'rgba(255, 255, 255, 0.9)',
    color: '#333',
    fontSize: '0.9rem',
    fontWeight: '500',
    cursor: 'pointer',
  },

  downloadBtn: {
    background: 'rgba(255, 255, 255, 0.2)',
    color: 'white',
    border: '2px solid rgba(255, 255, 255, 0.3)',
    borderRadius: '12px',
    padding: '12px 20px',
    cursor: 'pointer',
    fontSize: '0.9rem',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    transition: 'all 0.3s ease',
    backdropFilter: 'blur(10px)',
  },

  downloadBtnLoading: {
    opacity: '0.7',
    cursor: 'not-allowed',
  },

  spinner: {
    animation: 'spin 1s linear infinite',
  },

  reportSection: {
    background: 'white',
    borderRadius: '20px',
    padding: '30px',
    boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
  },

  companyHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '40px',
    paddingBottom: '20px',
    borderBottom: '2px solid #FFE0CC',
    flexWrap: 'wrap',
    gap: '20px',
  },

  logoSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
  },

  logoIcon: {
    fontSize: '4rem',
    filter: 'drop-shadow(0 3px 6px rgba(255, 107, 53, 0.3))',
  },

  companyInfo: {
    lineHeight: '1.5',
  },

  companyName: {
    fontSize: '2rem',
    fontWeight: '700',
    margin: '0 0 5px 0',
    background: 'linear-gradient(135deg, #FF6B35, #F7931E)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  },

  companyAddress: {
    fontSize: '0.9rem',
    color: '#666',
    margin: '0 0 5px 0',
  },

  companyContact: {
    fontSize: '0.9rem',
    color: '#666',
    margin: '0',
  },

  reportDate: {
    textAlign: 'right',
    color: '#666',
    fontSize: '0.9rem',
  },

  kpiGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '20px',
    marginBottom: '40px',
  },

  kpiCard: {
    padding: '25px',
    borderRadius: '15px',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
    boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
  },

  kpiIcon: {
    fontSize: '2.5rem',
  },

  kpiContent: {
    flex: 1,
  },

  kpiValue: {
    fontSize: '1.8rem',
    fontWeight: '700',
    marginBottom: '5px',
  },

  kpiTitle: {
    fontSize: '0.9rem',
    opacity: '0.9',
    marginBottom: '5px',
  },

  kpiChange: {
    fontSize: '0.8rem',
    fontWeight: '600',
  },

  chartsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
    gap: '30px',
    marginBottom: '40px',
  },

  chartCard: {
    background: '#fafafa',
    borderRadius: '15px',
    padding: '25px',
    border: '1px solid #FFE0CC',
  },

  chartTitle: {
    fontSize: '1.3rem',
    fontWeight: '600',
    marginBottom: '20px',
    color: '#333',
    background: 'linear-gradient(135deg, #FF6B35, #F7931E)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  },

  chartContainer: {
    height: '300px',
    position: 'relative',
  },

  summaryCard: {
    background: 'linear-gradient(135deg, #FFF3E0, #FFE0B2)',
    borderRadius: '15px',
    padding: '25px',
    border: '1px solid #FFCC02',
  },

  summaryContent: {
    display: 'grid',
    gap: '15px',
  },

  summaryItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px 0',
    borderBottom: '1px solid rgba(255, 107, 53, 0.2)',
  },

  summaryLabel: {
    color: '#666',
    fontWeight: '500',
  },

  summaryValue: {
    color: '#E65100',
    fontWeight: '700',
    fontSize: '1.1rem',
  },

  reportFooter: {
    textAlign: 'center',
    paddingTop: '30px',
    borderTop: '1px solid #e0e0e0',
    color: '#666',
  },

  footerText: {
    fontSize: '0.85rem',
    lineHeight: '1.5',
    margin: '0',
  },
};

// Add CSS animations
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;
document.head.appendChild(styleSheet);

export default Reports;