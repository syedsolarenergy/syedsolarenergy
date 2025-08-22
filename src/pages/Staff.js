import React, { useState, useEffect } from "react";
import jsPDF from "jspdf";
import QRCode from "qrcode";

function Staff() {
  const [staffList, setStaffList] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDepartment, setFilterDepartment] = useState("all");
  const [sortBy, setSortBy] = useState("name");
  const [viewMode, setViewMode] = useState("grid"); // grid or table
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  // Form states
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    position: "",
    department: "",
    salary: "",
    joinDate: "",
    photo: "",
    emergencyContact: "",
    skills: "",
    education: "",
    experience: "",
    employeeId: "",
    status: "active"
  });

  const departments = ["Technical", "Sales", "Administration", "Management", "Support"];
  const positions = ["Technician", "Senior Technician", "Sales Manager", "Admin", "CEO", "Assistant"];

  useEffect(() => {
    loadStaffData();
  }, []);

  const loadStaffData = () => {
    const saved = JSON.parse(localStorage.getItem("staffList")) || [];
    // Add default employees if none exist
    if (saved.length === 0) {
      const defaultStaff = [
        {
          id: Date.now(),
          name: "Engr. Zubair",
          email: "zubair@syedsolar.com",
          phone: "+92 300 1234567",
          address: "Peshawar, KPK",
          position: "Senior Technician",
          department: "Technical",
          salary: 35000,
          joinDate: "2023-01-15",
          photo: "",
          emergencyContact: "+92 300 7654321",
          skills: "Solar Installation, Electrical Work, Troubleshooting",
          education: "Electrical Engineering",
          experience: "3 years",
          employeeId: "SE001",
          status: "active",
          salaryHistory: [
            { date: "2023-01-15", amount: 30000, reason: "Initial Salary" },
            { date: "2023-07-15", amount: 35000, reason: "Performance Raise" }
          ],
          performance: { rating: 4.5, projects: 25, attendance: 95 }
        },
        {
          id: Date.now() + 1,
          name: "Engr. Aqib",
          email: "aqib@syedsolar.com", 
          phone: "+92 301 2345678",
          address: "Peshawar, KPK",
          position: "Assistant",
          department: "Technical",
          salary: 25000,
          joinDate: "2023-03-01",
          photo: "",
          emergencyContact: "+92 301 8765432",
          skills: "Solar Maintenance, Customer Service",
          education: "Electrical Diploma",
          experience: "2 years",
          employeeId: "SE002",
          status: "active",
          salaryHistory: [
            { date: "2023-03-01", amount: 22000, reason: "Initial Salary" },
            { date: "2023-09-01", amount: 25000, reason: "Experience Raise" }
          ],
          performance: { rating: 4.2, projects: 18, attendance: 92 }
        }
      ];
      setStaffList(defaultStaff);
      localStorage.setItem("staffList", JSON.stringify(defaultStaff));
    } else {
      setStaffList(saved);
    }
  };

  const saveStaffData = (newStaffList) => {
    setStaffList(newStaffList);
    localStorage.setItem("staffList", JSON.stringify(newStaffList));
  };

  const handleAddEmployee = () => {
    if (!formData.name || !formData.position || !formData.salary) {
      alert("Please fill in all required fields (Name, Position, Salary)");
      return;
    }

    const newEmployee = {
      ...formData,
      id: Date.now(),
      salary: parseFloat(formData.salary),
      joinDate: formData.joinDate || new Date().toISOString().split('T')[0],
      employeeId: formData.employeeId || `SE${String(staffList.length + 1).padStart(3, '0')}`,
      salaryHistory: [
        { 
          date: formData.joinDate || new Date().toISOString().split('T')[0], 
          amount: parseFloat(formData.salary), 
          reason: "Initial Salary" 
        }
      ],
      performance: { rating: 0, projects: 0, attendance: 100 }
    };

    const updatedList = [...staffList, newEmployee];
    saveStaffData(updatedList);
    resetForm();
    setShowAddForm(false);
    alert("✅ Employee added successfully!");
  };

  const handleUpdateEmployee = () => {
    if (!formData.name || !formData.position || !formData.salary) {
      alert("Please fill in all required fields");
      return;
    }

    const updatedList = staffList.map(emp => {
      if (emp.id === editingEmployee.id) {
        const updatedEmployee = { ...emp, ...formData, salary: parseFloat(formData.salary) };
        
        // Add salary history if salary changed
        if (emp.salary !== parseFloat(formData.salary)) {
          updatedEmployee.salaryHistory = [
            ...(emp.salaryHistory || []),
            {
              date: new Date().toISOString().split('T')[0],
              amount: parseFloat(formData.salary),
              reason: "Salary Update"
            }
          ];
        }
        
        return updatedEmployee;
      }
      return emp;
    });

    saveStaffData(updatedList);
    resetForm();
    setEditingEmployee(null);
    alert("✅ Employee updated successfully!");
  };

  const handleDeleteEmployee = (employee) => {
    if (window.confirm(`Are you sure you want to remove ${employee.name} from the staff?`)) {
      const updatedList = staffList.filter(emp => emp.id !== employee.id);
      saveStaffData(updatedList);
      alert(`✅ ${employee.name} has been removed from staff`);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "", email: "", phone: "", address: "", position: "", department: "",
      salary: "", joinDate: "", photo: "", emergencyContact: "", skills: "",
      education: "", experience: "", employeeId: "", status: "active"
    });
  };

  const startEditing = (employee) => {
    setFormData({ ...employee });
    setEditingEmployee(employee);
    setShowAddForm(true);
  };

const generateExperienceCertificate = async (employee) => {
  try {
    const pdf = new jsPDF('portrait', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    
    // Company colors
    const primaryColor = [255, 107, 53]; // Orange
    const secondaryColor = [40, 40, 40]; // Dark gray
    const lightGray = [245, 245, 245];
    
    // Add elegant background
    pdf.setFillColor(...lightGray);
    pdf.rect(0, 0, pageWidth, pageHeight, 'F');
    
    // Main content area with white background
    pdf.setFillColor(255, 255, 255);
    pdf.roundedRect(10, 10, pageWidth - 20, pageHeight - 20, 3, 3, 'F');
    
    // Decorative header background
    pdf.setFillColor(...primaryColor);
    pdf.roundedRect(15, 15, pageWidth - 30, 25, 2, 2, 'F');
    
    // Company logo and header
    let logoYPosition = 45;
    try {
      const logoResponse = await fetch('/logo.png');
      if (logoResponse.ok) {
        const logoBlob = await logoResponse.blob();
        const logoDataUrl = await new Promise(resolve => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.readAsDataURL(logoBlob);
        });
        
        // Add logo
        pdf.addImage(logoDataUrl, 'PNG', pageWidth/2 - 15, 25, 30, 30);
        logoYPosition = 65;
      } else {
        throw new Error('Logo not found');
      }
    } catch (error) {
      console.log("Logo not found, using company name");
      pdf.setFontSize(16);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(255, 255, 255);
      pdf.text("SYED SOLAR ENERGY", pageWidth / 2, 30, { align: "center" });
      logoYPosition = 45;
    }
    
    // Company name and details
    pdf.setFontSize(22);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(...primaryColor);
    pdf.text("SYED SOLAR ENERGY PVT LTD", pageWidth / 2, logoYPosition, { align: "center" });
    
    pdf.setFontSize(10);
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(...secondaryColor);
    pdf.text("Renewable Energy Solutions | Solar Installation & Maintenance", pageWidth / 2, logoYPosition + 6, { align: "center" });
    pdf.text("Email: info@syedsolarenergy.com | Phone: +92-XXX-XXXXXXX", pageWidth / 2, logoYPosition + 11, { align: "center" });
    pdf.text("Address: [Company Address], Pakistan", pageWidth / 2, logoYPosition + 16, { align: "center" });
    
    // Decorative line
    pdf.setDrawColor(...primaryColor);
    pdf.setLineWidth(0.5);
    pdf.line(30, logoYPosition + 22, pageWidth - 30, logoYPosition + 22);
    
    // Certificate title with elegant styling
    const titleY = logoYPosition + 35;
    pdf.setFillColor(250, 250, 250);
    pdf.roundedRect(25, titleY - 8, pageWidth - 50, 16, 2, 2, 'F');
    
    pdf.setFontSize(24);
    pdf.setFont("times", "bold");
    pdf.setTextColor(...primaryColor);
    pdf.text("EXPERIENCE CERTIFICATE", pageWidth / 2, titleY, { align: "center" });
    
    // Certificate number and date (top right)
    const certNumber = `SSE-EXP-${employee.employeeId}-${new Date().getFullYear()}`;
    pdf.setFontSize(8);
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(100, 100, 100);
    pdf.text(`Certificate No: ${certNumber}`, pageWidth - 20, 25, { align: "right" });
    pdf.text(`Date: ${new Date().toLocaleDateString('en-GB')}`, pageWidth - 20, 30, { align: "right" });
    
    // Main content area
    const contentStartY = titleY + 25;
    pdf.setFontSize(12);
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(...secondaryColor);
    
    // Calculate dates and period
    const joinDate = new Date(employee.joinDate);
    const currentDate = new Date();
    const workingPeriod = calculateWorkingPeriod(employee.joinDate);
    
    const joinDateStr = joinDate.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    const currentDateStr = currentDate.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    // Content with proper spacing
    let yPos = contentStartY;
    const lineHeight = 6;
    const marginLeft = 25;
    const marginRight = 25;
    const contentWidth = pageWidth - marginLeft - marginRight;
    
    // TO WHOM IT MAY CONCERN
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(...primaryColor);
    pdf.text("TO WHOM IT MAY CONCERN", pageWidth / 2, yPos, { align: "center" });
    yPos += lineHeight * 2;
    
    // Main certificate text
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(...secondaryColor);
    
    const paragraphs = [
      `This is to certify that Mr./Ms. ${employee.name} (Employee ID: ${employee.employeeId}) was employed with Syed Solar Energy Pvt Ltd as ${employee.position} in the ${employee.department} Department from ${joinDateStr} to ${currentDateStr}.`,
      
      `During this employment period of ${workingPeriod}, ${employee.name.split(' ')[0]} has served the organization with utmost dedication, professionalism, and integrity. ${employee.gender === 'female' ? 'She' : 'He'} consistently demonstrated exceptional performance in ${employee.gender === 'female' ? 'her' : 'his'} assigned duties and responsibilities.`,
      
      `${employee.name.split(' ')[0]}'s primary responsibilities included:
      • Planning, installation, and commissioning of solar PV systems
      • Conducting site assessments and technical feasibility studies
      • Maintenance and troubleshooting of solar energy installations
      • Quality control and compliance with safety standards
      • Customer relationship management and technical support
      • Training and mentoring junior technical staff`,
      
      `Throughout ${employee.gender === 'female' ? 'her' : 'his'} tenure, ${employee.name.split(' ')[0]} consistently exhibited:
      • Outstanding technical competency and problem-solving skills
      • Strong leadership qualities and team collaboration
      • Commitment to workplace safety and environmental standards
      • Professional conduct and excellent communication abilities
      • Innovation in sustainable energy solutions`,
      
      `${employee.name.split(' ')[0]}'s last drawn gross monthly salary was Rs. ${employee.salary.toLocaleString()}/- (Rupees ${numberToWords(employee.salary)} only).`,
      
      `We found ${employee.gender === 'female' ? 'her' : 'him'} to be honest, hardworking, and reliable during ${employee.gender === 'female' ? 'her' : 'his'} association with our organization. ${employee.gender === 'female' ? 'She' : 'He'} is leaving the organization on ${employee.gender === 'female' ? 'her' : 'his'} own accord for career advancement.`,
      
      `We wish ${employee.name.split(' ')[0]} all the best in ${employee.gender === 'female' ? 'her' : 'his'} future endeavors and strongly recommend ${employee.gender === 'female' ? 'her' : 'him'} for any suitable position in ${employee.gender === 'female' ? 'her' : 'his'} field of expertise.`,
      
      `This certificate is issued upon request and is valid for all official purposes without any alteration.`
    ];
    
    paragraphs.forEach((paragraph, index) => {
      const lines = pdf.splitTextToSize(paragraph, contentWidth);
      lines.forEach(line => {
        if (yPos > pageHeight - 80) { // Reserve space for footer elements
          // Add new page if needed
          pdf.addPage();
          yPos = 30;
        }
        pdf.text(line, marginLeft, yPos);
        yPos += lineHeight;
      });
      yPos += lineHeight * 0.5; // Extra space between paragraphs
    });
    
    // Ensure we have space for signature and footer
    if (yPos > pageHeight - 70) {
      pdf.addPage();
      yPos = 30;
    }
    
    // Signature section
    yPos = Math.max(yPos + 10, pageHeight - 60);
    
    // Digital stamp (left side)
    const stampX = 40;
    const stampY = yPos - 5;
    pdf.setDrawColor(...primaryColor);
    pdf.setFillColor(255, 248, 240);
    pdf.circle(stampX, stampY, 18, 'FD');
    
    pdf.setFontSize(10);
    pdf.setTextColor(...primaryColor);
    pdf.setFont("helvetica", "bold");
    pdf.text("DIGITALLY", stampX, stampY - 8, { align: "center" });
    pdf.text("VERIFIED", stampX, stampY - 3, { align: "center" });
    pdf.text("AUTHENTIC", stampX, stampY + 2, { align: "center" });
    
    const currentYear = new Date().getFullYear();
    pdf.setFontSize(8);
    pdf.text(currentYear.toString(), stampX, stampY + 8, { align: "center" });
    
    // Signature area (right side)
    const signatureX = pageWidth - 60;
    pdf.setDrawColor(150, 150, 150);
    pdf.setLineWidth(0.5);
    pdf.line(signatureX - 30, yPos + 5, signatureX + 10, yPos + 5);
    
    pdf.setFontSize(11);
    pdf.setTextColor(...secondaryColor);
    pdf.setFont("helvetica", "bold");
    pdf.text("Authorized Signatory", signatureX - 10, yPos + 12, { align: "center" });
    
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(10);
    pdf.text("Human Resources Department", signatureX - 10, yPos + 17, { align: "center" });
    pdf.text("Syed Solar Energy Pvt Ltd", signatureX - 10, yPos + 22, { align: "center" });
    
    // Generate verification QR code with proper error correction
    const verificationData = {
      certificateId: certNumber,
      employeeId: employee.employeeId,
      employeeName: employee.name,
      issueDate: new Date().toISOString(),
      department: employee.department,
      position: employee.position,
      companyName: "Syed Solar Energy Pvt Ltd"
    };
    
    const verificationUrl = `${window.location.origin}/verify-certificate?data=${btoa(JSON.stringify(verificationData))}`;
    
    try {
      const qrCodeDataUrl = await QRCode.toDataURL(verificationUrl, {
        width: 200,
        margin: 2,
        errorCorrectionLevel: 'M',
        type: 'image/png',
        quality: 1,
        color: {
          dark: '#FF6B35',
          light: '#FFFFFF'
        }
      });
      
      // Add QR code (bottom right corner with proper spacing)
      const qrSize = 35;
      const qrX = pageWidth - qrSize - 15;
      const qrY = pageHeight - qrSize - 15;
      
      // QR code background
      pdf.setFillColor(255, 255, 255);
      pdf.roundedRect(qrX - 2, qrY - 2, qrSize + 4, qrSize + 4, 1, 1, 'F');
      
      pdf.addImage(qrCodeDataUrl, 'PNG', qrX, qrY, qrSize, qrSize);
      
      pdf.setFontSize(7);
      pdf.setTextColor(100, 100, 100);
      pdf.text("Scan to verify", qrX + (qrSize/2), qrY + qrSize + 5, { align: "center" });
      pdf.text("certificate authenticity", qrX + (qrSize/2), qrY + qrSize + 8, { align: "center" });
    } catch (error) {
      console.error("Error generating QR code:", error);
    }
    
    // Footer with certificate details
    pdf.setFontSize(7);
    pdf.setTextColor(120, 120, 120);
    pdf.text(`Certificate ID: ${certNumber} | Generated on: ${new Date().toLocaleString()}`, 15, pageHeight - 8);
    pdf.text("This is a computer generated certificate and does not require physical signature.", 15, pageHeight - 5);
    
    // Border
    pdf.setDrawColor(...primaryColor);
    pdf.setLineWidth(0.8);
    pdf.roundedRect(12, 12, pageWidth - 24, pageHeight - 24, 2, 2);
    
    // Save PDF
    const fileName = `Experience_Certificate_${employee.name.replace(/\s+/g, '_')}_${certNumber}.pdf`;
    pdf.save(fileName);
    
    // Store certificate data for verification
    const certificateRecord = {
      ...verificationData,
      fileName: fileName,
      generatedAt: new Date().toISOString()
    };
    
    // Save to localStorage for verification
    const existingCertificates = JSON.parse(localStorage.getItem("issuedCertificates") || "[]");
    existingCertificates.push(certificateRecord);
    localStorage.setItem("issuedCertificates", JSON.stringify(existingCertificates));
    
    return certificateRecord;
    
  } catch (error) {
    console.error("Error generating certificate:", error);
    throw new Error("Failed to generate certificate. Please try again.");
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
                          emp.employeeId.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesDepartment = filterDepartment === "all" || emp.department === filterDepartment;
      return matchesSearch && matchesDepartment;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "name": return a.name.localeCompare(b.name);
        case "salary": return b.salary - a.salary;
        case "joinDate": return new Date(b.joinDate) - new Date(a.joinDate);
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