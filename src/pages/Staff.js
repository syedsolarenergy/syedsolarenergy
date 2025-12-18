// src/pages/Staff.jsx
import React, { useState, useEffect } from "react";
import jsPDF from "jspdf";
import QRCode from "qrcode";
import { supabase } from "../supabaseClient";

// ✅ Import images from assets
import logo from "../assets/logo.png";   // your company logo
import stamp from "../assets/stamp.png"; // transparent digital stamp
import background from "../assets/background.png";   // backgorund

function Staff() {
  const [staffList, setStaffList] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDepartment, setFilterDepartment] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortBy, setSortBy] = useState("name");
  const [viewMode, setViewMode] = useState("grid");
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [loading, setLoading] = useState(true);

  // ✅ Company settings used on the certificate
  const COMPANY = {
    name: "Syed Solar Energy Pvt Ltd",
    email: "sales@syedsolarenergy.com",
    phone: "+92 307 5596695",
    address: "Market Umar Gull Chowck Bara Road, Peshawar",
    brand: {
      primary: "#FF6B35",
      primaryDark: "#E85F2F",
      greyText: "#333333",
      lightGrey: "#666666",
    },
  };

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    position: "",
    department: "",
    salary: "",
    join_date: "",
    leaving_date: "",
    photo: "",
    emergency_contact: "",
    skills: "",
    education: "",
    experience: "",
    employee_id: "",
    status: "active",
  });

  const departments = ["Technical", "Sales", "Administration", "Management", "Support"];
  const positions = [ "Technical Support Engineer", "SITE Supervisor", "Trainee Engineer", "Technician", "Senior Technician", "Sales Manager", "Admin", "CEO", "Assistant"];
  const statusOptions = ["active", "inactive", "on_leave", "Left"];

  useEffect(() => {
    loadStaffData();
  }, []);

  const loadStaffData = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.from("staff").select("*").order("name");
      if (error) throw error;

      if (data && data.length > 0) {
        setStaffList(data);
      } else {
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
            leaving_date: "",
            photo: "",
            emergency_contact: "+92 300 7654321",
            skills: "Solar Installation, Electrical Work, Troubleshooting",
            education: "Electrical Engineering",
            experience: "3 years",
            employee_id: "SE001",
            status: "active",
            salary_history: [
              { date: "2023-01-15", amount: 30000, reason: "Initial Salary" },
              { date: "2023-07-15", amount: 35000, reason: "Performance Raise" },
            ],
            performance: { rating: 4.5, projects: 25, attendance: 95 },
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
            leaving_date: "",
            photo: "",
            emergency_contact: "+92 301 8765432",
            skills: "Solar Maintenance, Customer Service",
            education: "Electrical Diploma",
            experience: "2 years",
            employee_id: "SE002",
            status: "active",
            salary_history: [
              { date: "2023-03-01", amount: 22000, reason: "Initial Salary" },
              { date: "2023-09-01", amount: 25000, reason: "Experience Raise" },
            ],
            performance: { rating: 4.2, projects: 18, attendance: 92 },
          },
        ];

        for (const employee of defaultStaff) {
          const { error: insErr } = await supabase.from("staff").insert([employee]);
          if (insErr) console.error("Error inserting default staff:", insErr);
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
        join_date: formData.join_date || new Date().toISOString().split("T")[0],
        // Ensure leaving_date is null if empty
        leaving_date: formData.leaving_date || null,
        employee_id: formData.employee_id || `SE${String(staffList.length + 1).padStart(3, "0")}`,
        salary_history: [
          {
            date: formData.join_date || new Date().toISOString().split("T")[0],
            amount: parseFloat(formData.salary),
            reason: "Initial Salary",
          },
        ],
        performance: { rating: 0, projects: 0, attendance: 100 },
      };

      const { data, error } = await supabase.from("staff").insert([newEmployee]).select();
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
        id: editingEmployee.id,
        // Ensure leaving_date is null if empty
        leaving_date: formData.leaving_date || null
      };

      if (editingEmployee.salary !== parseFloat(formData.salary)) {
        updatedEmployee.salary_history = [
          ...(editingEmployee.salary_history || []),
          {
            date: new Date().toISOString().split("T")[0],
            amount: parseFloat(formData.salary),
            reason: "Salary Update",
          },
        ];
      }

      const { error } = await supabase.from("staff").update(updatedEmployee).eq("id", editingEmployee.id);
      if (error) throw error;

      const updatedList = staffList.map((emp) => (emp.id === editingEmployee.id ? { ...emp, ...updatedEmployee } : emp));
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
        const { error } = await supabase.from("staff").delete().eq("id", employee.id);
        if (error) throw error;

        const updatedList = staffList.filter((emp) => emp.id !== employee.id);
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
      name: "",
      email: "",
      phone: "",
      address: "",
      position: "",
      department: "",
      salary: "",
      join_date: "",
      leaving_date: "",
      photo: "",
      emergency_contact: "",
      skills: "",
      education: "",
      experience: "",
      employee_id: "",
      status: "active",
    });
  };

  const startEditing = (employee) => {
    setFormData({ ...employee });
    setEditingEmployee(employee);
    setShowAddForm(true);
  };
//===============================================================================================
function generateSignatureCode(text) {
  const data = text + "-" + new Date().toISOString();
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    hash = (hash << 5) - hash + data.charCodeAt(i);
    hash |= 0; // Convert to 32-bit int
  }
  return "ES-" + Math.abs(hash).toString(36).toUpperCase(); 
}

//====================================================================================================
  // ----------------------------
  // ✅ UPDATED: Professional PDF Generator with Stamp Background and QR Code
  // ----------------------------
//------------------------------------------------------------------------------------------------------

const generateExperienceCertificate = async (employee) => {
    try {
      // Helpers
      const loadImage = (src) =>
        new Promise((resolve, reject) => {
          const img = new Image();
          img.crossOrigin = "anonymous";
          img.onload = () => resolve(img);
          img.onerror = reject;
          img.src = src;
        });

      const pdf = new jsPDF("p", "mm", "a4"); // A4 portrait
      const pageWidth = pdf.internal.pageSize.getWidth(); // 210
      const pageHeight = pdf.internal.pageSize.getHeight(); // 297

      // Layout constants
      const margin = 16;
      const contentWidth = pageWidth - margin * 2;
      const lineH = 6;
      const titleH = 10;
      const sectionGap = 4;
      const primary = COMPANY.brand.primary;
      const primaryDark = COMPANY.brand.primaryDark;
      const grey = COMPANY.brand.greyText;
      const lightGrey = COMPANY.brand.lightGrey;

      // ✅ STAMP BACKGROUND SETTINGS - Adjust these values as needed
      const STAMP_OPACITY = 0.15; // Change this value (0-1) to adjust stamp transparency
      const STAMP_WIDTH = 120; // Width of stamp in mm
      const STAMP_HEIGHT = 120; // Height of stamp in mm
      const STAMP_X = (pageWidth - STAMP_WIDTH) / 2; // Center stamp horizontally
      const STAMP_Y = (pageHeight - STAMP_HEIGHT) / 2; // Center stamp vertically

      // Background accents (VIP)
      pdf.setFillColor(primary);
      pdf.rect(0, 0, pageWidth, 8, "F"); // top ribbon
      pdf.rect(0, pageHeight - 8, pageWidth, 8, "F"); // bottom ribbon
      pdf.setDrawColor(primary);
      pdf.setLineWidth(0.6);
      pdf.rect(margin - 2, margin - 2, contentWidth + 4, pageHeight - (margin - 2) * 2); // elegant border

      // ✅ ADD STAMP AS BACKGROUND WITH TRANSPARENCY
      try {
        const stampImg = await loadImage(background);
        
        // Create a temporary canvas to adjust opacity
        const canvas = document.createElement('canvas');
        canvas.width = stampImg.width;
        canvas.height = stampImg.height;
        const ctx = canvas.getContext('2d');
        
        // Set transparency
        ctx.globalAlpha = STAMP_OPACITY;
        ctx.drawImage(stampImg, 0, 0);
        
        // Convert canvas to data URL
        const stampWithOpacity = canvas.toDataURL('image/png');
        
        // Add the stamp to the PDF
        pdf.addImage(
          stampWithOpacity, 
          'PNG', 
          STAMP_X, 
          STAMP_Y, 
          STAMP_WIDTH, 
          STAMP_HEIGHT
        );
      } catch (error) {
        console.error("Error adding stamp background:", error);
        // Continue without the stamp if there's an error
      }

      let y = margin;

      // Header: logo + company block
try {
    const logoImg = await loadImage(logo);
    const logoW = 26;
    const logoH = (logoImg.height / logoImg.width) * logoW;
    pdf.addImage(logoImg, "PNG", margin, y, logoW, logoH);
} catch {
    // text fallback
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(primary);
    pdf.setFontSize(14);
    pdf.text("SYED SOLAR ENERGY", margin, y + 10);
}

// Company details
pdf.setFont("helvetica", "bold");
pdf.setTextColor(grey);
pdf.setFontSize(16);
pdf.text(COMPANY.name, margin + 32, y + 6);

pdf.setFont("helvetica", "normal");
pdf.setTextColor(grey);
pdf.setFontSize(10);
pdf.text(COMPANY.address, margin + 32, y + 12 ); // Address on its own line
pdf.text(COMPANY.phone, margin + 32, y + 18); // Phone on the next line
pdf.text(COMPANY.email, margin + 32, y + 24); // Email on the last line

y += 32; // Adjust the Y-coordinate to accommodate the new height of the block

// ---
// Title
pdf.setFont("helvetica", "bold");
pdf.setTextColor(grey);
pdf.setFontSize(22);
pdf.text("CERTIFICATE OF EXPERIENCE", pageWidth / 2, y, { align: "center" });
y += titleH;

// Sub-title (To Whom It May Concern)
pdf.setFontSize(12);
pdf.setTextColor(primaryDark);
pdf.text("TO WHOM IT MAY CONCERN", pageWidth / 2, y, { align: "center" });
y += titleH;

      // Content utilities (wrap + page-break)
      const addWrapped = (text, x = margin, fontSize = 12, color = grey, weight = "normal") => {
        pdf.setFont("helvetica", weight);
        pdf.setFontSize(fontSize);
        pdf.setTextColor(color);
        const lines = pdf.splitTextToSize(text, contentWidth);
        lines.forEach((ln) => {
          if (y + lineH > pageHeight - margin - 40) {
            // reserve bottom space for signature/stamp/qr
            pdf.addPage();
            // redraw top ribbon + border for new page
            pdf.setFillColor(primary);
            pdf.rect(0, 0, pageWidth, 8, "F");
            pdf.setDrawColor(primary);
            pdf.setLineWidth(0.6);
            pdf.rect(margin - 2, margin - 2, contentWidth + 4, pageHeight - (margin - 2) * 2);
            y = margin;
          }
          pdf.text(ln, x, y);
          y += lineH;
        });
        y += sectionGap;
      };

      const addBullets = (items) => {
        items.forEach((item) => {
          addWrapped(`• ${item}`);
        });
      };

      // Dates
      const joinDate = new Date(employee.join_date);
      const leaving = employee.leaving_date ? new Date(employee.leaving_date) : new Date();
      const joinStr = joinDate.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
      const endStr = leaving.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

      const workingPeriod = calculateWorkingPeriod(employee.join_date, employee.leaving_date);

      // Main paragraphs
      addWrapped(
        `This is to certify that ${employee.name} (Employee ID: ${employee.employee_id}) was employed with ${COMPANY.name} from ${joinStr} to ${endStr}.`
      );
      addWrapped(
        `During this period, ${firstName(employee.name)} served as ${employee.position} in the ${employee.department} Department and performed duties with dedication, professionalism, and integrity.`
      );

      addWrapped(`${firstName(employee.name)}’s key responsibilities included:`, margin, 12, grey, "bold");
      addBullets([
        "Installation and maintenance of solar energy systems",
        "Technical troubleshooting and problem resolution",
        "Customer service and support",
        "Quality assurance and compliance with industry standards",
      ]);

      addWrapped(`Throughout the employment, ${firstName(employee.name)} demonstrated:`, margin, 12, grey, "bold");
      addBullets([
        "Exceptional technical skills and knowledge",
        "Strong work ethic and reliability",
        "Excellent teamwork and communication abilities",
        "Commitment to company values and customer satisfaction",
      ]);

      const salaryNumber = Number(employee.salary) || 0;
      addWrapped(`${firstName(employee.name)}’s last drawn salary was Rs. ${salaryNumber.toLocaleString()} per month.`);

      addWrapped(
        `Total experience with ${COMPANY.name}: ${workingPeriod}. We wish ${firstName(
          employee.name
        )} the very best in future endeavors and have no doubt that they will be a valuable asset to any organization.`
      );

      addWrapped("This certificate is issued upon request and for official purposes.");

      // Reserve space for footer elements
      if (y < pageHeight - 70) y = pageHeight - 70;
//0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000


// Generate electronic signature code
const eSignature = generateSignatureCode(COMPANY.name);

// --- Positioning variables ---
// Use pageHeight to force bottom placement
const sigX = pageWidth - 55;    // X-position (increase to move left, decrease to move right)
const sigY = pageHeight - 40;   // Baseline for signature line (increase to move up, decrease to move down)

// Signature line (under the signature code)
pdf.setDrawColor(50, 50, 50); // Darker line color
pdf.setLineWidth(0.6);
pdf.line(sigX - 40, sigY, sigX + 40, sigY); 
// Horizontal line at bottom-right (adjust X range to extend line width)

// Print the e-signature code above the line (barcode style)
pdf.setFont("courier", "bold"); // Monospace font for barcode look
pdf.setFontSize(12);
pdf.setTextColor(30);
pdf.text(eSignature, sigX, sigY - 4, { align: "center" });

// Add "Electronically signed" note just above code
pdf.setFont("helvetica", "italic");
pdf.setFontSize(8);
pdf.setTextColor(100);
pdf.text("Electronically signed", sigX, sigY - 12, { align: "center" });

// Add "No physical signature required" just below line
pdf.setFont("helvetica", "italic");
pdf.setFontSize(8);
pdf.setTextColor(150);
pdf.text("No physical signature required", sigX, sigY + 18, { align: "center" });

// Labels under the line (unchanged)
pdf.setFont("helvetica", "bold");
pdf.setFontSize(11);
pdf.setTextColor(grey);
pdf.text("Authorized Signatory", sigX, sigY + 6, { align: "center" });

pdf.setFont("helvetica", "normal");
pdf.setFontSize(10);
pdf.setTextColor(lightGrey);
pdf.text(COMPANY.name, sigX, sigY + 12, { align: "center" });




//00000000000000000000000000000000000000000000000000000000000000000000000000000000000000

      // ✅ IMPROVED QR CODE (verification)
      try {
        const verificationUrl = `${window.location.origin}/verify-certificate?id=${employee.employee_id}&cert_id=SSE-SEC03-2025`;
        const qrCodeDataUrl = await QRCode.toDataURL(verificationUrl, {
          width: 100,
          margin: 1,
          color: {
            dark: "#252020ff", // Black dots
            light: "#FFFFFF", // White background
          },
        });
        
// Add border around QR code for better visibility
pdf.setDrawColor(50, 50, 50);  // Darker border color
pdf.setLineWidth(0.8);         // Thicker border line

// Adjust position here: first value (X) moves left/right, second (Y) moves up/down
pdf.rect(pageWidth - 42, 18, 24, 24); // Border around QR (move left by increasing first number, move down by increasing second number)

// Add QR code to PDF, perfectly centered and fit
pdf.addImage(
  qrCodeDataUrl,
  'PNG',
  pageWidth - 40, // X-position of QR (increase to move left, decrease to move right)
  20,             // Y-position of QR (increase to move down, decrease to move up)
  20,             // Size of QR code (increase to make bigger)
  20
);

// Add text below QR code
pdf.setFontSize(7);                  // QR label font size
pdf.setTextColor(80, 80, 80);        // Dark grey text
pdf.text(
  "Scan to verify", 
  pageWidth - 30, 45,                // X adjusts left/right, Y adjusts up/down
  { align: "center" }
);

} catch (error) {
  console.error("Error generating QR code:", error);
  // Continue without QR code if there's an error
}



      // Digital Stamp (logo-based)
      try {
        const stampImg = await loadImage(stamp);
        const stampSize = 42; // mm
        const stampX = margin;
        const stampY = pageHeight - stampSize - 35;
        
        // Add stamp with full opacity
        pdf.addImage(
          stampImg, 
          'PNG', 
          stampX, 
          stampY, 
          stampSize, 
          stampSize
        );
        
        // Add text over the stamp
        const midX = stampX + stampSize / 2;
        const textYStart = pageHeight-33;
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(10);
        pdf.setTextColor(primaryDark);
        pdf.text("VERIFIED", midX, textYStart, { align: "center" });

        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(8);
        pdf.setTextColor(grey);
        pdf.text(COMPANY.name, midX, textYStart + 5, { align: "center" });
        pdf.text(COMPANY.email, midX, textYStart + 9.5, { align: "center" });

        const issueDateStr = new Date().toLocaleDateString();
        pdf.text(`Issue: ${issueDateStr}`, midX, textYStart + 14, { align: "center" });
      } catch {
        // Simple circular fallback if image not found
        const r = 30;
        const cx = margin + r;
        const cy = pageHeight - 25 - r;
        pdf.setDrawColor(primary);
        pdf.setFillColor(255, 247, 240);
        pdf.circle(cx, cy, r, "FD");
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(10);
        pdf.setTextColor(primaryDark);
        pdf.text("VERIFIED", cx, cy - 3, { align: "center" });
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(8);
        pdf.setTextColor(grey);
        pdf.text(COMPANY.name, cx, cy + 2, { align: "center" });
        pdf.text(COMPANY.email, cx, cy + 6.5, { align: "center" });
        pdf.text(`Issue: ${new Date().toLocaleDateString()}`, cx, cy + 11, { align: "center" });
      }

      // Certificate ID + Issue date (footer-left under content)
      const certNumber = `SSE-SEC03-2025`; // Using the specific certificate ID from the example
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(9);
      pdf.setTextColor(grey);
      pdf.text(`Certificate ID: ${certNumber}`, margin, pageHeight - 15);

      // Save PDF
      pdf.save(`Experience_Certificate_${employee.name.replace(/\s+/g, "_")}.pdf`);
    } catch (error) {
      console.error("Error generating certificate:", error);
      alert("Failed to generate certificate. Please try again.");
    }
  };




//------------------------------------------------------------------------------------------------------
  const calculateWorkingPeriod = (joinDate, leavingDate) => {
    const join = new Date(joinDate);
    const end = leavingDate ? new Date(leavingDate) : new Date();
    const diffTime = Math.max(0, end - join);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const years = Math.floor(diffDays / 365);
    const months = Math.floor((diffDays % 365) / 30);
    const yPart = years > 0 ? `${years} year${years > 1 ? "s" : ""}` : "";
    const mPart = months > 0 ? `${months} month${months > 1 ? "s" : ""}` : "";
    return [yPart, mPart].filter(Boolean).join(" and ") || "Less than a month";
  };

  const filteredStaff = staffList
    .filter((emp) => {
      const matchesSearch =
        emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.employee_id.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesDepartment = filterDepartment === "all" || emp.department === filterDepartment;
      const matchesStatus = filterStatus === "all" || emp.status === filterStatus;
      return matchesSearch && matchesDepartment && matchesStatus;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name);
        case "salary":
          return (Number(b.salary) || 0) - (Number(a.salary) || 0);
        case "joinDate":
          return new Date(b.join_date) - new Date(a.join_date);
        default:
          return 0;
      }
    });

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerContent}>
          <div>
            <h1 style={styles.title}>👷 Staff Management System</h1>
            <p style={styles.subtitle}>Complete HR solution for your solar energy team</p>
          </div>
          <div style={styles.statsCards}>
            <div style={styles.statCard}>
              <div style={styles.statNumber}>{staffList.length}</div>
              <div style={styles.statLabel}>Total Staff</div>
            </div>
            <div style={styles.statCard}>
              <div style={styles.statNumber}>{staffList.filter((emp) => emp.status === "active").length}</div>
              <div style={styles.statLabel}>Active</div>
            </div>
            <div style={styles.statCard}>
              <div style={styles.statNumber}>
                Rs {staffList.reduce((total, emp) => total + (Number(emp.salary) || 0), 0).toLocaleString()}
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
          <select value={filterDepartment} onChange={(e) => setFilterDepartment(e.target.value)} style={styles.filterSelect}>
            <option value="all">All Departments</option>
            {departments.map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} style={styles.filterSelect}>
            <option value="all">All Status</option>
            {statusOptions.map((status) => (
              <option key={status} value={status}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </option>
            ))}
          </select>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} style={styles.filterSelect}>
            <option value="name">Sort by Name</option>
            <option value="salary">Sort by Salary</option>
            <option value="joinDate">Sort by Join Date</option>
          </select>
        </div>

        <div style={styles.actionButtons}>
          <button onClick={() => setViewMode(viewMode === "grid" ? "table" : "grid")} style={styles.viewToggle}>
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
            <h3 style={styles.modalTitle}>{editingEmployee ? "✏️ Edit Employee" : "➕ Add New Employee"}</h3>

            <div style={styles.formGrid}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>👤 Full Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  style={styles.input}
                  placeholder="Enter full name"
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>🆔 Employee ID</label>
                <input
                  type="text"
                  value={formData.employee_id}
                  onChange={(e) => setFormData({ ...formData, employee_id: e.target.value })}
                  style={styles.input}
                  placeholder="Auto-generated if empty"
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>📧 Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  style={styles.input}
                  placeholder="employee@syedsolar.com"
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>📱 Phone</label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  style={styles.input}
                  placeholder="+92 300 1234567"
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>🏠 Address</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  style={styles.input}
                  placeholder="Complete address"
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>💼 Position *</label>
                <select
                  value={formData.position}
                  onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                  style={styles.input}
                >
                  <option value="">Select Position</option>
                  {positions.map((pos) => (
                    <option key={pos} value={pos}>
                      {pos}
                    </option>
                  ))}
                </select>
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>🏢 Department</label>
                <select
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  style={styles.input}
                >
                  <option value="">Select Department</option>
                  {departments.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>💰 Monthly Salary (Rs) *</label>
                <input
                  type="number"
                  value={formData.salary}
                  onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                  style={styles.input}
                  placeholder="25000"
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>📅 Join Date</label>
                <input
                  type="date"
                  value={formData.join_date}
                  onChange={(e) => setFormData({ ...formData, join_date: e.target.value })}
                  style={styles.input}
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>📅 Leaving Date</label>
                <input
                  type="date"
                  value={formData.leaving_date}
                  onChange={(e) => setFormData({ ...formData, leaving_date: e.target.value })}
                  style={styles.input}
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>📊 Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  style={styles.input}
                >
                  {statusOptions.map((status) => (
                    <option key={status} value={status}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>🚨 Emergency Contact</label>
                <input
                  type="text"
                  value={formData.emergency_contact}
                  onChange={(e) => setFormData({ ...formData, emergency_contact: e.target.value })}
                  style={styles.input}
                  placeholder="+92 300 7654321"
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>🎓 Education</label>
                <input
                  type="text"
                  value={formData.education}
                  onChange={(e) => setFormData({ ...formData, education: e.target.value })}
                  style={styles.input}
                  placeholder="Electrical Engineering"
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>⏰ Experience</label>
                <input
                  type="text"
                  value={formData.experience}
                  onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                  style={styles.input}
                  placeholder="3 years"
                />
              </div>

              <div style={{ ...styles.inputGroup, gridColumn: "1 / -1" }}>
                <label style={styles.label}>🛠️ Skills</label>
                <textarea
                  value={formData.skills}
                  onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                  style={{ ...styles.input, height: "80px", resize: "vertical" }}
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
              <button onClick={editingEmployee ? handleUpdateEmployee : handleAddEmployee} style={styles.saveButton}>
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
                <div style={styles.employeeAvatar}>{selectedEmployee.name.charAt(0).toUpperCase()}</div>
                <div style={styles.employeeInfo}>
                  <h2 style={styles.employeeName}>{selectedEmployee.name}</h2>
                  <p style={styles.employeeTitle}>{selectedEmployee.position}</p>
                  <p style={styles.employeeDept}>{selectedEmployee.department}</p>
                  <p style={styles.employeeStatus}>
                    Status:{" "}
                    <span
                      style={{
                        color:
                          selectedEmployee.status === "active"
                            ? "#4caf50"
                            : selectedEmployee.status === "inactive"
                            ? "#f44336"
                            : "#ff9800",
                      }}
                    >
                      {selectedEmployee.status}
                    </span>
                  </p>
                </div>
              </div>

              <div style={styles.detailsGrid}>
                <div style={styles.detailItem}>
                  <strong>Employee ID:</strong> {selectedEmployee.employee_id}
                </div>
                <div style={styles.detailItem}>
                  <strong>Email:</strong> {selectedEmployee.email}
                </div>
                <div style={styles.detailItem}>
                  <strong>Phone:</strong> {selectedEmployee.phone}
                </div>
                <div style={styles.detailItem}>
                  <strong>Join Date:</strong> {new Date(selectedEmployee.join_date).toLocaleDateString()}
                </div>
                {selectedEmployee.leaving_date && (
                  <div style={styles.detailItem}>
                    <strong>Leaving Date:</strong> {new Date(selectedEmployee.leaving_date).toLocaleDateString()}
                  </div>
                )}
                <div style={styles.detailItem}>
                  <strong>Current Salary:</strong> Rs {(Number(selectedEmployee.salary) || 0).toLocaleString()}
                </div>
                <div style={styles.detailItem}>
                  <strong>Experience:</strong>{" "}
                  {calculateWorkingPeriod(selectedEmployee.join_date, selectedEmployee.leaving_date)}
                </div>
              </div>

              {selectedEmployee.salary_history && selectedEmployee.salary_history.length > 0 && (
                <div style={styles.salaryHistory}>
                  <h4>💰 Salary History</h4>
                  {selectedEmployee.salary_history.map((history, index) => (
                    <div key={index} style={styles.historyItem}>
                      <span>{new Date(history.date).toLocaleDateString()}</span>
                      <span>Rs {Number(history.amount).toLocaleString()}</span>
                      <span>{history.reason}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div style={styles.modalButtons}>
              <button onClick={() => setSelectedEmployee(null)} style={styles.cancelButton}>
                ❌ Close
              </button>
              <button onClick={() => generateExperienceCertificate(selectedEmployee)} style={styles.certificateButton}>
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
        {loading ? (
          <div style={styles.loadingState}>
            <div style={styles.loadingSpinner}></div>
            <p>Loading staff data...</p>
          </div>
        ) : viewMode === "grid" ? (
          <div style={styles.staffGrid}>
            {filteredStaff.map((employee) => (
              <div
                key={employee.id}
                style={{
                  ...styles.employeeCard,
                  borderLeft: `5px solid ${
                    employee.status === "active" ? "#4caf50" : employee.status === "inactive" ? "#f44336" : "#ff9800"
                  }`,
                }}
              >
                <div style={styles.cardHeader}>
                  <div style={styles.avatar}>{employee.name.charAt(0).toUpperCase()}</div>
                  <div style={styles.cardActions}>
                    <button onClick={() => setSelectedEmployee(employee)} style={styles.viewButton} title="View Details">
                      👁️
                    </button>
                    <button onClick={() => startEditing(employee)} style={styles.editButtonSmall} title="Edit Employee">
                      ✏️
                    </button>
                    <button onClick={() => handleDeleteEmployee(employee)} style={styles.deleteButton} title="Remove Employee">
                      🗑️
                    </button>
                  </div>
                </div>

                <div style={styles.cardContent}>
                  <h3 style={styles.cardName}>{employee.name}</h3>
                  <p style={styles.cardPosition}>{employee.position}</p>
                  <p style={styles.cardDepartment}>{employee.department}</p>
                  <p style={styles.cardSalary}>Rs {(Number(employee.salary) || 0).toLocaleString()}/month</p>
                  <p style={styles.cardJoinDate}>Joined: {new Date(employee.join_date).toLocaleDateString()}</p>
                  {employee.leaving_date && (
                    <p style={styles.cardLeavingDate}>Left: {new Date(employee.leaving_date).toLocaleDateString()}</p>
                  )}
                  <p style={styles.cardStatus}>
                    Status:{" "}
                    <span
                      style={{
                        color:
                          employee.status === "active" ? "#4caf50" : employee.status === "inactive" ? "#f44336" : "#ff9800",
                      }}
                    >
                      {employee.status}
                    </span>
                  </p>
                </div>

                <div style={styles.cardFooter}>
                  <button onClick={() => generateExperienceCertificate(employee)} style={styles.certificateButtonSmall}>
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
                  <th style={styles.th}>Status</th>
                  <th style={styles.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredStaff.map((employee) => (
                  <tr key={employee.id} style={styles.tableRow}>
                    <td style={styles.td}>
                      <div style={styles.employeeTableCell}>
                        <div style={styles.tableAvatar}>{employee.name.charAt(0).toUpperCase()}</div>
                        <div>
                          <div style={styles.tableName}>{employee.name}</div>
                          <div style={styles.tableId}>{employee.employee_id}</div>
                        </div>
                      </div>
                    </td>
                    <td style={styles.td}>{employee.position}</td>
                    <td style={styles.td}>{employee.department}</td>
                    <td style={styles.td}>Rs {(Number(employee.salary) || 0).toLocaleString()}</td>
                    <td style={styles.td}>{new Date(employee.join_date).toLocaleDateString()}</td>
                    <td style={styles.td}>
                      <span
                        style={{
                          padding: "4px 8px",
                          borderRadius: "4px",
                          fontSize: "0.85rem",
                          backgroundColor:
                            employee.status === "active" ? "#e8f5e9" : employee.status === "inactive" ? "#ffebee" : "#fff8e1",
                          color: employee.status === "active" ? "#4caf50" : employee.status === "inactive" ? "#f44336" : "#ff9800",
                        }}
                      >
                        {employee.status}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <div style={styles.tableActions}>
                        <button onClick={() => setSelectedEmployee(employee)} style={styles.actionBtn} title="View">
                          👁️
                        </button>
                        <button onClick={() => startEditing(employee)} style={styles.actionBtn} title="Edit">
                          ✏️
                        </button>
                        <button onClick={() => generateExperienceCertificate(employee)} style={styles.actionBtn} title="Certificate">
                          📜
                        </button>
                        <button onClick={() => handleDeleteEmployee(employee)} style={styles.actionBtnDanger} title="Delete">
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

        {!loading && filteredStaff.length === 0 && (
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}>👥</div>
            <h3>No employees found</h3>
            <p>{searchTerm || filterDepartment !== "all" || filterStatus !== "all" ? "Try adjusting your search or filters" : "Add your first employee to get started"}</p>
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

// ------------ Utilities -------------
const firstName = (full) => (full || "").trim().split(" ")[0] || "";

// Styles
const styles = {
  container: {
    padding: "20px",
    background: "linear-gradient(135deg, #FFF8F0 0%, #FFEBDD 100%)",
    minHeight: "100vh",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
  },
  header: {
    background: "linear-gradient(135deg, #FF6B35, #F7931E)",
    borderRadius: "20px",
    padding: "30px",
    marginBottom: "30px",
    color: "white",
    boxShadow: "0 10px 30px rgba(255, 107, 53, 0.3)",
  },
  headerContent: { display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "20px" },
  title: { fontSize: "2.5rem", fontWeight: "700", margin: "0 0 10px 0", textShadow: "0 2px 10px rgba(0,0,0,0.2)" },
  subtitle: { fontSize: "1.1rem", opacity: "0.9", margin: 0, fontWeight: "300" },
  statsCards: { display: "flex", gap: "20px", flexWrap: "wrap" },
  statCard: {
    background: "rgba(255, 255, 255, 0.2)",
    borderRadius: "15px",
    padding: "20px",
    textAlign: "center",
    backdropFilter: "blur(10px)",
    minWidth: "120px",
  },
  statNumber: { fontSize: "2rem", fontWeight: "700", marginBottom: "5px" },
  statLabel: { fontSize: "0.9rem", opacity: "0.9" },
  controls: {
    background: "white",
    borderRadius: "15px",
    padding: "25px",
    marginBottom: "30px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "20px",
    boxShadow: "0 5px 15px rgba(0,0,0,0.1)",
  },
  searchSection: { display: "flex", gap: "15px", flexWrap: "wrap" },
  searchInput: { padding: "12px 16px", border: "2px solid #e0e0e0", borderRadius: "10px", fontSize: "1rem", minWidth: "250px", transition: "border-color 0.3s ease" },
  filterSelect: { padding: "12px 16px", border: "2px solid #e0e0e0", borderRadius: "10px", fontSize: "1rem", background: "white", cursor: "pointer" },
  actionButtons: { display: "flex", gap: "15px" },
  viewToggle: {
    background: "linear-gradient(135deg, #9e9e9e, #757575)",
    color: "white",
    border: "none",
    borderRadius: "10px",
    padding: "12px 20px",
    cursor: "pointer",
    fontSize: "0.9rem",
    fontWeight: "600",
    transition: "all 0.3s ease",
  },
  addButton: {
    background: "linear-gradient(135deg, #FF6B35, #F7931E)",
    color: "white",
    border: "none",
    borderRadius: "10px",
    padding: "12px 24px",
    cursor: "pointer",
    fontSize: "1rem",
    fontWeight: "600",
    transition: "all 0.3s ease",
    boxShadow: "0 5px 15px rgba(255, 107, 53, 0.3)",
  },
  modal: { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0, 0, 0, 0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "20px" },
  modalContent: {
    background: "white",
    borderRadius: "20px",
    padding: "30px",
    maxWidth: "800px",
    width: "100%",
    maxHeight: "90vh",
    overflowY: "auto",
    boxShadow: "0 25px 50px rgba(0, 0, 0, 0.3)",
  },
  modalTitle: {
    fontSize: "1.8rem",
    fontWeight: "700",
    marginBottom: "25px",
    background: "linear-gradient(135deg, #FF6B35, #F7931E)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
  },
  formGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "20px", marginBottom: "30px" },
  inputGroup: { display: "flex", flexDirection: "column" },
  label: { fontWeight: "600", marginBottom: "8px", color: "#333" },
  input: { padding: "12px 16px", border: "2px solid #e0e0e0", borderRadius: "10px", fontSize: "1rem", transition: "border-color 0.3s ease" },
  modalButtons: { display: "flex", gap: "15px", justifyContent: "flex-end", flexWrap: "wrap" },
  cancelButton: { background: "linear-gradient(135deg, #9e9e9e, #757575)", color: "white", border: "none", borderRadius: "10px", padding: "12px 24px", cursor: "pointer", fontSize: "1rem", fontWeight: "600" },
  saveButton: { background: "linear-gradient(135deg, #4caf50, #45a049)", color: "white", border: "none", borderRadius: "10px", padding: "12px 24px", cursor: "pointer", fontSize: "1rem", fontWeight: "600" },
  editButton: { background: "linear-gradient(135deg, #2196f3, #1976d2)", color: "white", border: "none", borderRadius: "10px", padding: "12px 24px", cursor: "pointer", fontSize: "1rem", fontWeight: "600" },
  certificateButton: { background: "linear-gradient(135deg, #ff9800, #f57c00)", color: "white", border: "none", borderRadius: "10px", padding: "12px 24px", cursor: "pointer", fontSize: "1rem", fontWeight: "600" },
  employeeDetails: { marginBottom: "30px" },
  employeeHeader: {
    display: "flex",
    alignItems: "center",
    gap: "20px",
    marginBottom: "30px",
    padding: "20px",
    background: "linear-gradient(135deg, #FFF3E0, #FFE0B2)",
    borderRadius: "15px",
  },
  employeeAvatar: {
    width: "80px",
    height: "80px",
    borderRadius: "50%",
    background: "linear-gradient(135deg, #FF6B35, #F7931E)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "2rem",
    fontWeight: "700",
    color: "white",
  },
  employeeInfo: { flex: 1 },
  employeeName: { fontSize: "2rem", fontWeight: "700", margin: "0 0 5px 0", color: "#333" },
  employeeTitle: { fontSize: "1.2rem", color: "#666", margin: "0 0 5px 0" },
  employeeDept: { fontSize: "1rem", color: "#999", margin: "0" },
  detailsGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "15px", marginBottom: "30px" },
  detailItem: { padding: "15px", background: "#f9f9f9", borderRadius: "10px", border: "1px solid #e0e0e0" },
  salaryHistory: { background: "#f5f5f5", padding: "20px", borderRadius: "15px" },
  historyItem: { display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid #e0e0e0" },
  staffSection: { background: "white", borderRadius: "20px", padding: "30px", boxShadow: "0 10px 30px rgba(0,0,0,0.1)" },
  staffGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "25px" },
  employeeCard: {
    background: "linear-gradient(135deg, #ffffff, #f8f9fa)",
    borderRadius: "20px",
    padding: "25px",
    border: "2px solid #FFE0CC",
    transition: "all 0.3s ease",
    position: "relative",
    boxShadow: "0 8px 25px rgba(0,0,0,0.1)",
  },
  cardHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" },
  avatar: {
    width: "60px",
    height: "60px",
    borderRadius: "50%",
    background: "linear-gradient(135deg, #FF6B35, #F7931E)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "1.5rem",
    fontWeight: "700",
    color: "white",
  },
  cardActions: { display: "flex", gap: "8px" },
  viewButton: { background: "linear-gradient(135deg, #2196f3, #1976d2)", color: "white", border: "none", borderRadius: "8px", padding: "8px", cursor: "pointer", fontSize: "0.9rem" },
  editButtonSmall: { background: "linear-gradient(135deg, #ff9800, #f57c00)", color: "white", border: "none", borderRadius: "8px", padding: "8px", cursor: "pointer", fontSize: "0.9rem" },
  deleteButton: { background: "linear-gradient(135deg, #f44336, #d32f2f)", color: "white", border: "none", borderRadius: "8px", padding: "8px", cursor: "pointer", fontSize: "0.9rem" },
  cardContent: { marginBottom: "20px" },
  cardName: { fontSize: "1.4rem", fontWeight: "700", margin: "0 0 8px 0", color: "#333" },
  cardPosition: { fontSize: "1.1rem", color: "#666", margin: "0 极速5px 0", fontWeight: "600" },
  cardDepartment: { fontSize: "0.9rem", color: "#999", margin: "0 0 10px 0" },
  cardSalary: { fontSize: "1.2rem", fontWeight: "700", color: "#FF6B35", margin: "0 0 8px 0" },
  cardJoinDate: { fontSize: "0.85rem", color: "#666", margin: "0" },
  cardFooter: { borderTop: "1px solid #e0e0e0", paddingTop: "15px" },
  certificateButtonSmall: {
    background: "linear-gradient(135deg, #9c27b0, #7b1fa2)",
    color: "white",
    border: "none",
    borderRadius: "10px",
    padding: "8px 16px",
    cursor: "pointer",
    fontSize: "极速0.85rem",
    fontWeight: "600",
    width: "100%",
  },
  tableContainer: { overflowX: "auto", borderRadius: "15px", boxShadow: "极速0 5px 15px rgba(0,0,0,0.1)" },
  table: { width: "100%", borderCollapse: "collapse", background: "white" },
  tableHeader: { background: "linear-gradient(135deg, #FF6B35, #F793极速1E)" },
  th: { padding: "20px 15px", textAlign: "left", color: "white", fontWeight: "600", fontSize: "1rem" },
  table极速Row: { borderBottom: "1px solid #e0e0e0", transition: "background-color 0.3s ease" },
  td: { padding: "15px", verticalAlign: "middle" },
  employeeTableCell: { display: "flex", alignItems: "center", gap: "15px" },
  tableAvatar: {
    width: "45px",
    height: "45px",
    borderRadius: "50%",
    background: "linear-gradient(135deg, #FF6B35, #F7931E)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "1.2rem",
    fontWeight: "700",
    color: "white",
  },
  tableName: { fontWeight: "600", color: "#333", marginBottom: "3px" },
  tableId: { fontSize: "0.85rem", color: "#666" },
  tableActions: { display: "flex", gap: "8px" },
  actionBtn: { background: "linear-gradient(135deg, #2196f3, #1976d2)", color: "white", border: "none", borderRadius: "6px", padding: "6px 8极速px", cursor: "极速pointer", fontSize: "0.8rem" },
  actionBtnDanger: { background: "linear-gradient(135deg, #f44336, #d32f2f)", color: "white", border: "none", borderRadius: "6px", padding: "6px 8px", cursor: "pointer", fontSize: "0.8rem" },
  emptyState: { textAlign: "center", padding: "60px 20px", color: "#666" },
  emptyIcon: { fontSize: "4rem", marginBottom: "20px" },
  loadingState: { textAlign: "center", padding: "40px" },
  loadingSpinner: {
    border: "4px solid #f3f3f3",
    borderTop: "4px solid #FF6B35",
    borderRadius: "50%",
    width: "40px",
    height: "40极速px",
    animation: "spin 1s linear infinite",
    margin: "0 auto 20px",
  },
  cardLeavingDate: { fontSize: "0.85rem", color: "#f44336", margin: "5px 0" },
  cardStatus: { fontSize: "0.85rem", color: "#666", margin: "5px 0" },
  employeeStatus: { fontSize: "0.9rem", color: "#666", margin: "5px 0" },
};

// Safe insert of spinner keyframes
if (typeof document !== "undefined" && document.styleSheets && document.styleSheets.length) {
  try {
    const styleSheet = document.styleSheets[0];
    styleSheet.insertRule(
      `
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }`,
      styleSheet.cssRules.length
    );
  } catch {}
}

export default Staff;