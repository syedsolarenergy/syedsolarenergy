import React, { useState, useEffect } from "react";
import jsPDF from "jspdf";
import QRCode from "qrcode";
import { supabase } from '../supabaseClient';

function Staff() {
  const [staffList, setStaffList] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDepartment, setFilterDepartment] = useState("all");
  const [sortBy, setSortBy] = useState("name");
  const [viewMode, setViewMode] = useState("grid");
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [loading, setLoading] = useState(true);

  // Form states
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    position: "",
    department: "",
    salary: "",
    join_date: "",
    photo: "",
    emergency_contact: "",
    skills: "",
    education: "",
    experience: "",
    employee_id: "",
    status: "active"
  });

  const departments = ["Technical", "Sales", "Administration", "Management", "Support"];
  const positions = ["Technician", "Senior Technician", "Sales Manager", "Admin", "CEO", "Assistant"];

  useEffect(() => {
    loadStaffData();
  }, []);

  const loadStaffData = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('staff')
        .select('*')
        .order('name');
      
      if (error) throw error;
      
      if (data && data.length > 0) {
        setStaffList(data);
      } else {
        // Add default employees if none exist
        const defaultStaff = [
          {
            name: "Engr. Zubair",
            email: "zubair@syedsolar.com",
            phone: "+92 300 1234567",
            address: "Peshawar, KPK",
            position: "Senior Technician",
            department: "Technical",
            salary: 35000,
            join_date: "2023-01-15",
            photo: "",
            emergency_contact: "+92 300 7654321",
            skills: "Solar Installation, Electrical Work, Troubleshooting",
            education: "Electrical Engineering",
            experience: "3 years",
            employee_id: "SE001",
            status: "active",
            salary_history: [
              { date: "2023-01-15", amount: 30000, reason: "Initial Salary" },
              { date: "2023-07-15", amount: 35000, reason: "Performance Raise" }
            ],
            performance: { rating: 4.5, projects: 25, attendance: 95 }
          },
          {
            name: "Engr. Aqib",
            email: "aqib@syedsolar.com", 
            phone: "+92 301 2345678",
            address: "Peshawar, KPK",
            position: "Assistant",
            department: "Technical",
            salary: 25000,
            join_date: "2023-03-01",
            photo: "",
            emergency_contact: "+92 301 8765432",
            skills: "Solar Maintenance, Customer Service",
            education: "Electrical Diploma",
            experience: "2 years",
            employee_id: "SE002",
            status: "active",
            salary_history: [
              { date: "2023-03-01", amount: 22000, reason: "Initial Salary" },
              { date: "2023-09-01", amount: 25000, reason: "Experience Raise" }
            ],
            performance: { rating: 4.2, projects: 18, attendance: 92 }
          }
        ];
        
        // Insert default staff
        for (const employee of defaultStaff) {
          const { error } = await supabase
            .from('staff')
            .insert([employee]);
          
          if (error) console.error("Error inserting default staff:", error);
        }
        
        setStaffList(defaultStaff);
      }
    } catch (error) {
      console.error("Error loading staff data:", error);
      alert("Failed to load staff data");
    } finally {
      setLoading(false);
    }
  };

  const handleAddEmployee = async () => {
    if (!formData.name || !formData.position || !formData.salary) {
      alert("Please fill in all required fields (Name, Position, Salary)");
      return;
    }

    try {
      const newEmployee = {
        ...formData,
        salary: parseFloat(formData.salary),
        join_date: formData.join_date || new Date().toISOString().split('T')[0],
        employee_id: formData.employee_id || `SE${String(staffList.length + 1).padStart(3, '0')}`,
        salary_history: [
          { 
            date: formData.join_date || new Date().toISOString().split('T')[0], 
            amount: parseFloat(formData.salary), 
            reason: "Initial Salary" 
          }
        ],
        performance: { rating: 0, projects: 0, attendance: 100 }
      };

      const { data, error } = await supabase
        .from('staff')
        .insert([newEmployee])
        .select();
      
      if (error) throw error;
      
      setStaffList([...staffList, data[0]]);
      resetForm();
      setShowAddForm(false);
      alert("✅ Employee added successfully!");
    } catch (error) {
      console.error("Error adding employee:", error);
      alert("Failed to add employee");
    }
  };

  const handleUpdateEmployee = async () => {
    if (!formData.name || !formData.position || !formData.salary) {
      alert("Please fill in all required fields");
      return;
    }

    try {
      const updatedEmployee = { 
        ...formData, 
        salary: parseFloat(formData.salary),
        id: editingEmployee.id
      };
      
      // Add salary history if salary changed
      if (editingEmployee.salary !== parseFloat(formData.salary)) {
        updatedEmployee.salary_history = [
          ...(editingEmployee.salary_history || []),
          {
            date: new Date().toISOString().split('T')[0],
            amount: parseFloat(formData.salary),
            reason: "Salary Update"
          }
        ];
      }
      
      const { error } = await supabase
        .from('staff')
        .update(updatedEmployee)
        .eq('id', editingEmployee.id);
      
      if (error) throw error;
      
      // Update local state
      const updatedList = staffList.map(emp => 
        emp.id === editingEmployee.id ? {...emp, ...updatedEmployee} : emp
      );
      
      setStaffList(updatedList);
      resetForm();
      setEditingEmployee(null);
      alert("✅ Employee updated successfully!");
    } catch (error) {
      console.error("Error updating employee:", error);
      alert("Failed to update employee");
    }
  };

  const handleDeleteEmployee = async (employee) => {
    if (window.confirm(`Are you sure you want to remove ${employee.name} from the staff?`)) {
      try {
        const { error } = await supabase
          .from('staff')
          .delete()
          .eq('id', employee.id);
        
        if (error) throw error;
        
        const updatedList = staffList.filter(emp => emp.id !== employee.id);
        setStaffList(updatedList);
        alert(`✅ ${employee.name} has been removed from staff`);
      } catch (error) {
        console.error("Error deleting employee:", error);
        alert("Failed to delete employee");
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: "", email: "", phone: "", address: "", position: "", department: "",
      salary: "", join_date: "", photo: "", emergency_contact: "", skills: "",
      education: "", experience: "", employee_id: "", status: "active"
    });
  };

  const startEditing = (employee) => {
    setFormData({ ...employee });
    setEditingEmployee(employee);
    setShowAddForm(true);
  };

  const generateExperienceCertificate = async (employee) => {
    try {
      const pdf = new jsPDF();
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      
      // Add background with company colors
      pdf.setFillColor(255, 107, 53); // Orange
      pdf.rect(0, 0, pageWidth, pageHeight, 'F');
      
      // White content area
      pdf.setFillColor(255, 255, 255);
      pdf.rect(10, 10, pageWidth - 20, pageHeight - 20, 'F');
      
      // Add company logo
      try {
        const logoImg = new Image();
        logoImg.src = '/logo.png';
        
        await new Promise((resolve) => {
          logoImg.onload = resolve;
        });
        
        pdf.addImage(logoImg, 'PNG', 20, 15, 40, 40);
      } catch (error) {
        console.log("Logo not found, using text fallback");
        pdf.setFontSize(16);
        pdf.setFont("helvetica", "bold");
        pdf.setTextColor(255, 107, 53);
        pdf.text("SYED SOLAR ENERGY", 20, 30);
      }
      
      // Certificate Title
      pdf.setFontSize(24);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(40, 40, 40);
      pdf.text("CERTIFICATE OF EXPERIENCE", pageWidth / 2, 30, { align: "center" });
      
      // Content
      pdf.setFontSize(12);
      pdf.setFont("helvetica", "normal");
      
      const joinDate = new Date(employee.join_date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      
      const currentDate = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      
      const workingPeriod = calculateWorkingPeriod(employee.join_date);
      
      const certificateText = [
        "TO WHOM IT MAY CONCERN",
        "",
        `This is to certify that ${employee.name} (Employee ID: ${employee.employee_id}) has been employed with`,
        "Syed Solar Energy Pvt Ltd from " + joinDate + " to " + currentDate + ".",
        "",
        `During this period, ${employee.name.split(' ')[0]} served as ${employee.position} in the ${employee.department} department`,
        "and performed duties with dedication, professionalism, and integrity.",
        "",
        `${employee.name.split(' ')[0]}'s key responsibilities included:`,
        "• Installation and maintenance of solar energy systems",
        "• Technical troubleshooting and problem resolution",
        "• Customer service and support",
        "• Quality assurance and compliance with industry standards",
        "",
        `Throughout ${employee.name.split(' ')[0]}'s employment, he demonstrated:`,
        "• Exceptional technical skills and knowledge",
        "• Strong work ethic and reliability",
        "• Excellent teamwork and communication abilities",
        "• Commitment to company values and customer satisfaction",
        "",
        `${employee.name.split(' ')[0]}'s last drawn salary was Rs. ${employee.salary.toLocaleString()} per month.`,
        "",
        `We wish ${employee.name.split(' ')[0]} the very best in his future endeavors and`,
        "have no doubt that he will be a valuable asset to any organization.",
        "",
        "This certificate is issued upon request and for official purposes.",
      ];
      
      let yPosition = 60;
      certificateText.forEach(line => {
        if (line === "TO WHOM IT MAY CONCERN") {
          pdf.setFont("helvetica", "bold");
          pdf.setTextColor(255, 107, 53);
          pdf.text(line, pageWidth / 2, yPosition, { align: "center" });
          pdf.setFont("helvetica", "normal");
          pdf.setTextColor(40, 40, 40);
        } else {
          pdf.text(line, 20, yPosition);
        }
        yPosition += 6;
      });
      
      // Generate verification QR code
      const verificationUrl = `${window.location.origin}/verify-certificate?id=${employee.employee_id}`;
      const qrCodeDataUrl = await QRCode.toDataURL(verificationUrl, {
        width: 80,
        margin: 1,
        color: {
          dark: '#FF6B35',
          light: '#FFFFFF'
        }
      });
      
      // Add QR code to PDF
      pdf.addImage(qrCodeDataUrl, 'PNG', pageWidth - 50, pageHeight - 60, 40, 40);
      pdf.setFontSize(8);
      pdf.setTextColor(100, 100, 100);
      pdf.text("Scan to verify authenticity", pageWidth - 30, pageHeight - 65, { align: "center" });
      
      // Add digital stamp
      pdf.setDrawColor(255, 107, 53);
      pdf.setFillColor(255, 236, 179);
      pdf.circle(50, pageHeight - 50, 20, 'FD');
      
      pdf.setFontSize(10);
      pdf.setTextColor(255, 107, 53);
      pdf.setFont("helvetica", "bold");
      pdf.text("VERIFIED", 50, pageHeight - 52, { align: "center" });
      pdf.text("DIGITAL", 50, pageHeight - 47, { align: "center" });
      pdf.text("STAMP", 50, pageHeight - 42, { align: "center" });
      
      // Add signature area
      pdf.setDrawColor(200, 200, 200);
      pdf.line(pageWidth - 100, pageHeight - 80, pageWidth - 20, pageHeight - 80);
      
      pdf.setFontSize(10);
      pdf.setTextColor(40, 40, 40);
      pdf.text("Authorized Signatory", pageWidth - 60, pageHeight - 70, { align: "center" });
      pdf.text("Syed Solar Energy Pvt Ltd", pageWidth - 60, pageHeight - 65, { align: "center" });
      
      // Certificate number and issue date
      const certNumber = `SSE-${employee.employee_id}-${new Date().getFullYear()}`;
      pdf.setFontSize(8);
      pdf.setTextColor(100, 100, 100);
      pdf.text(`Certificate ID: ${certNumber}`, 20, pageHeight - 20);
      pdf.text(`Issue Date: ${new Date().toLocaleDateString()}`, 20, pageHeight - 15);
      
      // Save PDF
      pdf.save(`Experience_Certificate_${employee.name.replace(/\s+/g, '_')}.pdf`);
    } catch (error) {
      console.error("Error generating certificate:", error);
      alert("Failed to generate certificate. Please try again.");
    }
  };

  const calculateWorkingPeriod = (joinDate) => {
    const join = new Date(joinDate);
    const now = new Date();
    const diffTime = Math.abs(now - join);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const years = Math.floor(diffDays / 365);
    const months = Math.floor((diffDays % 365) / 30);
    
    if (years > 0) {
      return `${years} year${years > 1 ? 's' : ''} and ${months} month${months > 1 ? 's' : ''}`;
    } else {
      return `${months} month${months > 1 ? 's' : ''}`;
    }
  };

  const filteredStaff = staffList
    .filter(emp => {
      const matchesSearch = emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          emp.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          emp.employee_id.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesDepartment = filterDepartment === "all" || emp.department === filterDepartment;
      return matchesSearch && matchesDepartment;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "name": return a.name.localeCompare(b.name);
        case "salary": return b.salary - a.salary;
        case "joinDate": return new Date(b.join_date) - new Date(a.join_date);
        default: return 0;
      }
    });

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerContent}>
          <div>
            <h1 style={styles.title}>👷 Staff Management System</h1>
            <p style={styles.subtitle}>
              Complete HR solution for your solar energy team
            </p>
          </div>
          <div style={styles.statsCards}>
            <div style={styles.statCard}>
              <div style={styles.statNumber}>{staffList.length}</div>
              <div style={styles.statLabel}>Total Staff</div>
            </div>
            <div style={styles.statCard}>
              <div style={styles.statNumber}>
                {staffList.filter(emp => emp.status === "active").length}
              </div>
              <div style={styles.statLabel}>Active</div>
            </div>
            <div style={styles.statCard}>
              <div style={styles.statNumber}>
                Rs {staffList.reduce((total, emp) => total + emp.salary, 0).toLocaleString()}
              </div>
              <div style={styles.statLabel}>Monthly Payroll</div>
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div style={styles.controls}>
        <div style={styles.searchSection}>
          <input
            type="text"
            placeholder="🔍 Search employees..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={styles.searchInput}
          />
          <select
            value={filterDepartment}
            onChange={(e) => setFilterDepartment(e.target.value)}
            style={styles.filterSelect}
          >
            <option value="all">All Departments</option>
            {departments.map(dept => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            style={styles.filterSelect}
          >
            <option value="name">Sort by Name</option>
            <option value="salary">Sort by Salary</option>
            <option value="joinDate">Sort by Join Date</option>
          </select>
        </div>

        <div style={styles.actionButtons}>
          <button
            onClick={() => setViewMode(viewMode === "grid" ? "table" : "grid")}
            style={styles.viewToggle}
          >
            {viewMode === "grid" ? "📋" : "🎯"} {viewMode === "grid" ? "Table View" : "Grid View"}
          </button>
          <button
            onClick={() => {
              resetForm();
              setEditingEmployee(null);
              setShowAddForm(true);
            }}
            style={styles.addButton}
          >
            ➕ Add Employee
          </button>
        </div>
      </div>

      {/* Add/Edit Form Modal */}
      {showAddForm && (
        <div style={styles.modal}>
          <div style={styles.modalContent}>
            <h3 style={styles.modalTitle}>
              {editingEmployee ? "✏️ Edit Employee" : "➕ Add New Employee"}
            </h3>
            
            <div style={styles.formGrid}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>👤 Full Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  style={styles.input}
                  placeholder="Enter full name"
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>🆔 Employee ID</label>
                <input
                  type="text"
                  value={formData.employeeId}
                  onChange={(e) => setFormData({...formData, employeeId: e.target.value})}
                  style={styles.input}
                  placeholder="Auto-generated if empty"
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>📧 Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  style={styles.input}
                  placeholder="employee@syedsolar.com"
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>📱 Phone</label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  style={styles.input}
                  placeholder="+92 300 1234567"
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>🏠 Address</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  style={styles.input}
                  placeholder="Complete address"
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>💼 Position *</label>
                <select
                  value={formData.position}
                  onChange={(e) => setFormData({...formData, position: e.target.value})}
                  style={styles.input}
                >
                  <option value="">Select Position</option>
                  {positions.map(pos => (
                    <option key={pos} value={pos}>{pos}</option>
                  ))}
                </select>
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>🏢 Department</label>
                <select
                  value={formData.department}
                  onChange={(e) => setFormData({...formData, department: e.target.value})}
                  style={styles.input}
                >
                  <option value="">Select Department</option>
                  {departments.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>💰 Monthly Salary (Rs) *</label>
                <input
                  type="number"
                  value={formData.salary}
                  onChange={(e) => setFormData({...formData, salary: e.target.value})}
                  style={styles.input}
                  placeholder="25000"
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>📅 Join Date</label>
                <input
                  type="date"
                  value={formData.joinDate}
                  onChange={(e) => setFormData({...formData, joinDate: e.target.value})}
                  style={styles.input}
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>🚨 Emergency Contact</label>
                <input
                  type="text"
                  value={formData.emergencyContact}
                  onChange={(e) => setFormData({...formData, emergencyContact: e.target.value})}
                  style={styles.input}
                  placeholder="+92 300 7654321"
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>🎓 Education</label>
                <input
                  type="text"
                  value={formData.education}
                  onChange={(e) => setFormData({...formData, education: e.target.value})}
                  style={styles.input}
                  placeholder="Electrical Engineering"
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>⏰ Experience</label>
                <input
                  type="text"
                  value={formData.experience}
                  onChange={(e) => setFormData({...formData, experience: e.target.value})}
                  style={styles.input}
                  placeholder="3 years"
                />
              </div>

              <div style={{...styles.inputGroup, gridColumn: "1 / -1"}}>
                <label style={styles.label}>🛠️ Skills</label>
                <textarea
                  value={formData.skills}
                  onChange={(e) => setFormData({...formData, skills: e.target.value})}
                  style={{...styles.input, height: "80px", resize: "vertical"}}
                  placeholder="Solar Installation, Electrical Work, Troubleshooting"
                />
              </div>
            </div>

            <div style={styles.modalButtons}>
              <button
                onClick={() => {
                  setShowAddForm(false);
                  setEditingEmployee(null);
                  resetForm();
                }}
                style={styles.cancelButton}
              >
                ❌ Cancel
              </button>
              <button
                onClick={editingEmployee ? handleUpdateEmployee : handleAddEmployee}
                style={styles.saveButton}
              >
                {editingEmployee ? "💾 Update Employee" : "➕ Add Employee"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Employee Details Modal */}
      {selectedEmployee && (
        <div style={styles.modal}>
          <div style={styles.modalContent}>
            <h3 style={styles.modalTitle}>👤 Employee Details</h3>
            
            <div style={styles.employeeDetails}>
              <div style={styles.employeeHeader}>
                <div style={styles.employeeAvatar}>
                  {selectedEmployee.name.charAt(0).toUpperCase()}
                </div>
                <div style={styles.employeeInfo}>
                  <h2 style={styles.employeeName}>{selectedEmployee.name}</h2>
                  <p style={styles.employeeTitle}>{selectedEmployee.position}</p>
                  <p style={styles.employeeDept}>{selectedEmployee.department}</p>
                </div>
              </div>

              <div style={styles.detailsGrid}>
                <div style={styles.detailItem}>
                  <strong>Employee ID:</strong> {selectedEmployee.employeeId}
                </div>
                <div style={styles.detailItem}>
                  <strong>Email:</strong> {selectedEmployee.email}
                </div>
                <div style={styles.detailItem}>
                  <strong>Phone:</strong> {selectedEmployee.phone}
                </div>
                <div style={styles.detailItem}>
                  <strong>Join Date:</strong> {new Date(selectedEmployee.joinDate).toLocaleDateString()}
                </div>
                <div style={styles.detailItem}>
                  <strong>Current Salary:</strong> Rs {selectedEmployee.salary.toLocaleString()}
                </div>
                <div style={styles.detailItem}>
                  <strong>Experience:</strong> {calculateWorkingPeriod(selectedEmployee.joinDate)}
                </div>
              </div>

              {selectedEmployee.salaryHistory && selectedEmployee.salaryHistory.length > 0 && (
                <div style={styles.salaryHistory}>
                  <h4>💰 Salary History</h4>
                  {selectedEmployee.salaryHistory.map((history, index) => (
                    <div key={index} style={styles.historyItem}>
                      <span>{new Date(history.date).toLocaleDateString()}</span>
                      <span>Rs {history.amount.toLocaleString()}</span>
                      <span>{history.reason}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div style={styles.modalButtons}>
              <button
                onClick={() => setSelectedEmployee(null)}
                style={styles.cancelButton}
              >
                ❌ Close
              </button>
              <button
                onClick={() => generateExperienceCertificate(selectedEmployee)}
                style={styles.certificateButton}
              >
                📜 Generate Certificate
              </button>
              <button
                onClick={() => {
                  setSelectedEmployee(null);
                  startEditing(selectedEmployee);
                }}
                style={styles.editButton}
              >
                ✏️ Edit Employee
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Staff List */}
      <div style={styles.staffSection}>
        {viewMode === "grid" ? (
          <div style={styles.staffGrid}>
            {filteredStaff.map(employee => (
              <div key={employee.id} style={styles.employeeCard}>
                <div style={styles.cardHeader}>
                  <div style={styles.avatar}>
                    {employee.name.charAt(0).toUpperCase()}
                  </div>
                  <div style={styles.cardActions}>
                    <button
                      onClick={() => setSelectedEmployee(employee)}
                      style={styles.viewButton}
                      title="View Details"
                    >
                      👁️
                    </button>
                    <button
                      onClick={() => startEditing(employee)}
                      style={styles.editButtonSmall}
                      title="Edit Employee"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => handleDeleteEmployee(employee)}
                      style={styles.deleteButton}
                      title="Remove Employee"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
                
                <div style={styles.cardContent}>
                  <h3 style={styles.cardName}>{employee.name}</h3>
                  <p style={styles.cardPosition}>{employee.position}</p>
                  <p style={styles.cardDepartment}>{employee.department}</p>
                  <p style={styles.cardSalary}>Rs {employee.salary.toLocaleString()}/month</p>
                  <p style={styles.cardJoinDate}>
                    Joined: {new Date(employee.joinDate).toLocaleDateString()}
                  </p>
                </div>

                <div style={styles.cardFooter}>
                  <button
                    onClick={() => generateExperienceCertificate(employee)}
                    style={styles.certificateButtonSmall}
                  >
                    📜 Certificate
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={styles.tableContainer}>
            <table style={styles.table}>
              <thead>
                <tr style={styles.tableHeader}>
                  <th style={styles.th}>Employee</th>
                  <th style={styles.th}>Position</th>
                  <th style={styles.th}>Department</th>
                  <th style={styles.th}>Salary</th>
                  <th style={styles.th}>Join Date</th>
                  <th style={styles.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredStaff.map(employee => (
                  <tr key={employee.id} style={styles.tableRow}>
                    <td style={styles.td}>
                      <div style={styles.employeeTableCell}>
                        <div style={styles.tableAvatar}>
                          {employee.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div style={styles.tableName}>{employee.name}</div>
                          <div style={styles.tableId}>{employee.employeeId}</div>
                        </div>
                      </div>
                    </td>
                    <td style={styles.td}>{employee.position}</td>
                    <td style={styles.td}>{employee.department}</td>
                    <td style={styles.td}>Rs {employee.salary.toLocaleString()}</td>
                    <td style={styles.td}>{new Date(employee.joinDate).toLocaleDateString()}</td>
                    <td style={styles.td}>
                      <div style={styles.tableActions}>
                        <button
                          onClick={() => setSelectedEmployee(employee)}
                          style={styles.actionBtn}
                          title="View"
                        >
                          👁️
                        </button>
                        <button
                          onClick={() => startEditing(employee)}
                          style={styles.actionBtn}
                          title="Edit"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => generateExperienceCertificate(employee)}
                          style={styles.actionBtn}
                          title="Certificate"
                        >
                          📜
                        </button>
                        <button
                          onClick={() => handleDeleteEmployee(employee)}
                          style={styles.actionBtnDanger}
                          title="Delete"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {filteredStaff.length === 0 && (
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}>👥</div>
            <h3>No employees found</h3>
            <p>
              {searchTerm || filterDepartment !== "all" 
                ? "Try adjusting your search or filters"
                : "Add your first employee to get started"
              }
            </p>
            <button
              onClick={() => {
                resetForm();
                setShowAddForm(true);
              }}
              style={styles.addButton}
            >
              ➕ Add First Employee
            </button>
          </div>
        )}
      </div>
    </div>
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

  statsCards: {
    display: 'flex',
    gap: '20px',
    flexWrap: 'wrap',
  },

  statCard: {
    background: 'rgba(255, 255, 255, 0.2)',
    borderRadius: '15px',
    padding: '20px',
    textAlign: 'center',
    backdropFilter: 'blur(10px)',
    minWidth: '120px',
  },

  statNumber: {
    fontSize: '2rem',
    fontWeight: '700',
    marginBottom: '5px',
  },

  statLabel: {
    fontSize: '0.9rem',
    opacity: '0.9',
  },

  controls: {
    background: 'white',
    borderRadius: '15px',
    padding: '25px',
    marginBottom: '30px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '20px',
    boxShadow: '0 5px 15px rgba(0,0,0,0.1)',
  },

  searchSection: {
    display: 'flex',
    gap: '15px',
    flexWrap: 'wrap',
  },

  searchInput: {
    padding: '12px 16px',
    border: '2px solid #e0e0e0',
    borderRadius: '10px',
    fontSize: '1rem',
    minWidth: '250px',
    transition: 'border-color 0.3s ease',
  },

  filterSelect: {
    padding: '12px 16px',
    border: '2px solid #e0e0e0',
    borderRadius: '10px',
    fontSize: '1rem',
    background: 'white',
    cursor: 'pointer',
  },

  actionButtons: {
    display: 'flex',
    gap: '15px',
  },

  viewToggle: {
    background: 'linear-gradient(135deg, #9e9e9e, #757575)',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    padding: '12px 20px',
    cursor: 'pointer',
    fontSize: '0.9rem',
    fontWeight: '600',
    transition: 'all 0.3s ease',
  },

  addButton: {
    background: 'linear-gradient(135deg, #FF6B35, #F7931E)',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    padding: '12px 24px',
    cursor: 'pointer',
    fontSize: '1rem',
    fontWeight: '600',
    transition: 'all 0.3s ease',
    boxShadow: '0 5px 15px rgba(255, 107, 53, 0.3)',
  },

  modal: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '20px',
  },

  modalContent: {
    background: 'white',
    borderRadius: '20px',
    padding: '30px',
    maxWidth: '800px',
    width: '100%',
    maxHeight: '90vh',
    overflowY: 'auto',
    boxShadow: '0 25px 50px rgba(0, 0, 0, 0.3)',
  },

  modalTitle: {
    fontSize: '1.8rem',
    fontWeight: '700',
    marginBottom: '25px',
    background: 'linear-gradient(135deg, #FF6B35, #F7931E)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  },

  formGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '20px',
    marginBottom: '30px',
  },

  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
  },

  label: {
    fontWeight: '600',
    marginBottom: '8px',
    color: '#333',
  },

  input: {
    padding: '12px 16px',
    border: '2px solid #e0e0e0',
    borderRadius: '10px',
    fontSize: '1rem',
    transition: 'border-color 0.3s ease',
  },

  modalButtons: {
    display: 'flex',
    gap: '15px',
    justifyContent: 'flex-end',
    flexWrap: 'wrap',
  },

  cancelButton: {
    background: 'linear-gradient(135deg, #9e9e9e, #757575)',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    padding: '12px 24px',
    cursor: 'pointer',
    fontSize: '1rem',
    fontWeight: '600',
  },

  saveButton: {
    background: 'linear-gradient(135deg, #4caf50, #45a049)',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    padding: '12px 24px',
    cursor: 'pointer',
    fontSize: '1rem',
    fontWeight: '600',
  },

  editButton: {
    background: 'linear-gradient(135deg, #2196f3, #1976d2)',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    padding: '12px 24px',
    cursor: 'pointer',
    fontSize: '1rem',
    fontWeight: '600',
  },

  certificateButton: {
    background: 'linear-gradient(135deg, #ff9800, #f57c00)',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    padding: '12px 24px',
    cursor: 'pointer',
    fontSize: '1rem',
    fontWeight: '600',
  },

  employeeDetails: {
    marginBottom: '30px',
  },

  employeeHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
    marginBottom: '30px',
    padding: '20px',
    background: 'linear-gradient(135deg, #FFF3E0, #FFE0B2)',
    borderRadius: '15px',
  },

  employeeAvatar: {
    width: '80px',
    height: '80px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #FF6B35, #F7931E)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '2rem',
    fontWeight: '700',
    color: 'white',
  },

  employeeInfo: {
    flex: 1,
  },

  employeeName: {
    fontSize: '2rem',
    fontWeight: '700',
    margin: '0 0 5px 0',
    color: '#333',
  },

  employeeTitle: {
    fontSize: '1.2rem',
    color: '#666',
    margin: '0 0 5px 0',
  },

  employeeDept: {
    fontSize: '1rem',
    color: '#999',
    margin: '0',
  },

  detailsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '15px',
    marginBottom: '30px',
  },

  detailItem: {
    padding: '15px',
    background: '#f9f9f9',
    borderRadius: '10px',
    border: '1px solid #e0e0e0',
  },

  salaryHistory: {
    background: '#f5f5f5',
    padding: '20px',
    borderRadius: '15px',
  },

  historyItem: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '10px 0',
    borderBottom: '1px solid #e0e0e0',
  },

  staffSection: {
    background: 'white',
    borderRadius: '20px',
    padding: '30px',
    boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
  },

  staffGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
    gap: '25px',
  },

  employeeCard: {
    background: 'linear-gradient(135deg, #ffffff, #f8f9fa)',
    borderRadius: '20px',
    padding: '25px',
    border: '2px solid #FFE0CC',
    transition: 'all 0.3s ease',
    position: 'relative',
    boxShadow: '0 8px 25px rgba(0,0,0,0.1)',
  },

  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
  },

  avatar: {
    width: '60px',
    height: '60px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #FF6B35, #F7931E)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.5rem',
    fontWeight: '700',
    color: 'white',
  },

  cardActions: {
    display: 'flex',
    gap: '8px',
  },

  viewButton: {
    background: 'linear-gradient(135deg, #2196f3, #1976d2)',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    padding: '8px',
    cursor: 'pointer',
    fontSize: '0.9rem',
  },

  editButtonSmall: {
    background: 'linear-gradient(135deg, #ff9800, #f57c00)',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    padding: '8px',
    cursor: 'pointer',
    fontSize: '0.9rem',
  },

  deleteButton: {
    background: 'linear-gradient(135deg, #f44336, #d32f2f)',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    padding: '8px',
    cursor: 'pointer',
    fontSize: '0.9rem',
  },

  cardContent: {
    marginBottom: '20px',
  },

  cardName: {
    fontSize: '1.4rem',
    fontWeight: '700',
    margin: '0 0 8px 0',
    color: '#333',
  },

  cardPosition: {
    fontSize: '1.1rem',
    color: '#666',
    margin: '0 0 5px 0',
    fontWeight: '600',
  },

  cardDepartment: {
    fontSize: '0.9rem',
    color: '#999',
    margin: '0 0 10px 0',
  },

  cardSalary: {
    fontSize: '1.2rem',
    fontWeight: '700',
    color: '#FF6B35',
    margin: '0 0 8px 0',
  },

  cardJoinDate: {
    fontSize: '0.85rem',
    color: '#666',
    margin: '0',
  },

  cardFooter: {
    borderTop: '1px solid #e0e0e0',
    paddingTop: '15px',
  },

  certificateButtonSmall: {
    background: 'linear-gradient(135deg, #9c27b0, #7b1fa2)',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    padding: '8px 16px',
    cursor: 'pointer',
    fontSize: '0.85rem',
    fontWeight: '600',
    width: '100%',
  },

  tableContainer: {
    overflowX: 'auto',
    borderRadius: '15px',
    boxShadow: '0 5px 15px rgba(0,0,0,0.1)',
  },

  table: {
    width: '100%',
    borderCollapse: 'collapse',
    background: 'white',
  },

  tableHeader: {
    background: 'linear-gradient(135deg, #FF6B35, #F7931E)',
  },

  th: {
    padding: '20px 15px',
    textAlign: 'left',
    color: 'white',
    fontWeight: '600',
    fontSize: '1rem',
  },

  tableRow: {
    borderBottom: '1px solid #e0e0e0',
    transition: 'background-color 0.3s ease',
  },

  td: {
    padding: '15px',
    verticalAlign: 'middle',
  },

  employeeTableCell: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
  },

  tableAvatar: {
    width: '45px',
    height: '45px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #FF6B35, #F7931E)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.2rem',
    fontWeight: '700',
    color: 'white',
  },

  tableName: {
    fontWeight: '600',
    color: '#333',
    marginBottom: '3px',
  },

  tableId: {
    fontSize: '0.85rem',
    color: '#666',
  },

  tableActions: {
    display: 'flex',
    gap: '8px',
  },

  actionBtn: {
    background: 'linear-gradient(135deg, #2196f3, #1976d2)',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    padding: '6px 8px',
    cursor: 'pointer',
    fontSize: '0.8rem',
  },

  actionBtnDanger: {
    background: 'linear-gradient(135deg, #f44336, #d32f2f)',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    padding: '6px 8px',
    cursor: 'pointer',
    fontSize: '0.8rem',
  },

  emptyState: {
    textAlign: 'center',
    padding: '60px 20px',
    color: '#666',
  },

  emptyIcon: {
    fontSize: '4rem',
    marginBottom: '20px',
  },
};

export default Staff;