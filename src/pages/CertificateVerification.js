import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";

function CertificateVerification() {
  const [searchParams] = useSearchParams();
  const employeeId = searchParams.get('id');
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [certificateData, setCertificateData] = useState(null);

  useEffect(() => {
    verifyCertificate();
  }, [employeeId]);

  const verifyCertificate = () => {
    // In a real application, this would verify against a backend database
    // For this demo, we'll check against localStorage
    const staffList = JSON.parse(localStorage.getItem("staffList")) || [];
    const foundEmployee = staffList.find(emp => emp.employeeId === employeeId);
    
    if (foundEmployee) {
      setEmployee(foundEmployee);
      setCertificateData({
        issueDate: new Date().toLocaleDateString(),
        certificateId: `SSE-${foundEmployee.employeeId}-${new Date().getFullYear()}`,
        status: "Verified",
        verificationDate: new Date().toLocaleDateString()
      });
    }
    
    setLoading(false);
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.header}>
          <h1>Verifying Certificate...</h1>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Certificate Verification</h1>
        <p style={styles.subtitle}>
          Verify the authenticity of Syed Solar Energy experience certificates
        </p>
      </div>

      <div style={styles.content}>
        {employee ? (
          <div style={styles.verificationSuccess}>
            <div style={styles.statusHeader}>
              <div style={styles.statusIcon}>✅</div>
              <h2 style={styles.statusTitle}>Certificate Verified</h2>
              <p style={styles.statusText}>
                This certificate has been verified as authentic and was issued by Syed Solar Energy Pvt Ltd.
              </p>
            </div>

            <div style={styles.detailsCard}>
              <h3 style={styles.detailsTitle}>Certificate Details</h3>
              
              <div style={styles.detailsGrid}>
                <div style={styles.detailItem}>
                  <strong>Certificate ID:</strong> {certificateData.certificateId}
                </div>
                <div style={styles.detailItem}>
                  <strong>Verification Status:</strong> 
                  <span style={styles.verifiedBadge}>Verified</span>
                </div>
                <div style={styles.detailItem}>
                  <strong>Issue Date:</strong> {certificateData.issueDate}
                </div>
                <div style={styles.detailItem}>
                  <strong>Verification Date:</strong> {certificateData.verificationDate}
                </div>
              </div>
            </div>

            <div style={styles.employeeCard}>
              <h3 style={styles.detailsTitle}>Employee Information</h3>
              
              <div style={styles.employeeDetails}>
                <div style={styles.employeeHeader}>
                  <div style={styles.employeeAvatar}>
                    {employee.name.charAt(0).toUpperCase()}
                  </div>
                  <div style={styles.employeeInfo}>
                    <h2 style={styles.employeeName}>{employee.name}</h2>
                    <p style={styles.employeeTitle}>{employee.position}</p>
                    <p style={styles.employeeDept}>{employee.department} Department</p>
                  </div>
                </div>

                <div style={styles.detailsGrid}>
                  <div style={styles.detailItem}>
                    <strong>Employee ID:</strong> {employee.employeeId}
                  </div>
                  <div style={styles.detailItem}>
                    <strong>Employment Period:</strong> {new Date(employee.joinDate).toLocaleDateString()} to Present
                  </div>
                  <div style={styles.detailItem}>
                    <strong>Experience:</strong> {calculateWorkingPeriod(employee.joinDate)}
                  </div>
                  <div style={styles.detailItem}>
                    <strong>Last Position:</strong> {employee.position}
                  </div>
                </div>
              </div>
            </div>

            <div style={styles.actions}>
              <button style={styles.printButton} onClick={() => window.print()}>
                🖨️ Print Verification Report
              </button>
            </div>
          </div>
        ) : (
          <div style={styles.verificationError}>
            <div style={styles.statusHeader}>
              <div style={{...styles.statusIcon, background: '#ffebee'}}>❌</div>
              <h2 style={styles.statusTitle}>Certificate Not Verified</h2>
              <p style={styles.statusText}>
                We couldn't verify this certificate. This may be because:
              </p>
              <ul style={styles.errorList}>
                <li>The certificate ID is invalid or expired</li>
                <li>The certificate has been altered or tampered with</li>
                <li>The QR code was scanned incorrectly</li>
              </ul>
              <p style={styles.statusText}>
                Please contact Syed Solar Energy HR department for assistance.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Helper function to calculate working period
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

const styles = {
  container: {
    padding: '20px',
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    maxWidth: '800px',
    margin: '0 auto',
  },
  header: {
    textAlign: 'center',
    marginBottom: '30px',
    padding: '20px',
    background: 'linear-gradient(135deg, #FF6B35, #F7931E)',
    borderRadius: '15px',
    color: 'white',
  },
  title: {
    fontSize: '2.2rem',
    margin: '0 0 10px 0',
  },
  subtitle: {
    fontSize: '1.1rem',
    opacity: '0.9',
    margin: 0,
  },
  content: {
    background: 'white',
    borderRadius: '15px',
    padding: '25px',
    boxShadow: '0 5px 15px rgba(0,0,0,0.1)',
  },
  verificationSuccess: {
    textAlign: 'center',
  },
  statusHeader: {
    marginBottom: '30px',
  },
  statusIcon: {
    fontSize: '4rem',
    marginBottom: '15px',
  },
  statusTitle: {
    fontSize: '1.8rem',
    color: '#4caf50',
    margin: '0 0 10px 0',
  },
  statusText: {
    fontSize: '1rem',
    color: '#666',
    lineHeight: '1.6',
  },
  detailsCard: {
    background: '#f9f9f9',
    borderRadius: '10px',
    padding: '20px',
    marginBottom: '20px',
    textAlign: 'left',
  },
  detailsTitle: {
    fontSize: '1.4rem',
    margin: '0 0 20px 0',
    color: '#333',
    borderBottom: '2px solid #FF6B35',
    paddingBottom: '10px',
  },
  detailsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '15px',
  },
  detailItem: {
    padding: '10px',
    background: 'white',
    borderRadius: '8px',
    border: '1px solid #e0e0e0',
  },
  verifiedBadge: {
    background: '#4caf50',
    color: 'white',
    padding: '4px 8px',
    borderRadius: '4px',
    fontSize: '0.9rem',
    marginLeft: '10px',
  },
  employeeCard: {
    background: '#f9f9f9',
    borderRadius: '10px',
    padding: '20px',
    marginBottom: '20px',
    textAlign: 'left',
  },
  employeeDetails: {
    marginTop: '15px',
  },
  employeeHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
    marginBottom: '20px',
    padding: '15px',
    background: 'white',
    borderRadius: '10px',
  },
  employeeAvatar: {
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
  employeeInfo: {
    flex: 1,
  },
  employeeName: {
    fontSize: '1.5rem',
    fontWeight: '700',
    margin: '0 0 5px 0',
    color: '#333',
  },
  employeeTitle: {
    fontSize: '1.1rem',
    color: '#666',
    margin: '0 0 5px 0',
  },
  employeeDept: {
    fontSize: '1rem',
    color: '#999',
    margin: '0',
  },
  actions: {
    marginTop: '30px',
  },
  printButton: {
    background: 'linear-gradient(135deg, #2196f3, #1976d2)',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    padding: '12px 24px',
    cursor: 'pointer',
    fontSize: '1rem',
    fontWeight: '600',
  },
  verificationError: {
    textAlign: 'center',
  },
  errorList: {
    textAlign: 'left',
    display: 'inline-block',
    margin: '15px 0',
    color: '#d32f2f',
  },
};

export default CertificateVerification;