import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from '../supabaseClient';

function CertificateVerification() {
  const [searchParams] = useSearchParams();
  const employeeId = searchParams.get('id');
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [certificateData, setCertificateData] = useState(null);
  const [verificationStatus, setVerificationStatus] = useState("pending");

  useEffect(() => {
    verifyCertificate();
  }, [employeeId]);

  const verifyCertificate = async () => {
    try {
      if (!employeeId) {
        setVerificationStatus("invalid");
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('staff')
        .select('*')
        .eq('employee_id', employeeId)
        .single();
      
      if (error || !data) {
        setVerificationStatus("invalid");
      } else {
        setEmployee(data);
        setCertificateData({
          issueDate: new Date().toLocaleDateString(),
          certificateId: `SSE-${data.employee_id}-${new Date().getFullYear()}`,
          status: "Verified",
          verificationDate: new Date().toLocaleDateString()
        });
        setVerificationStatus("verified");
      }
    } catch (error) {
      console.error("Error verifying certificate:", error);
      setVerificationStatus("error");
    } finally {
      setLoading(false);
    }
  };

  const calculateWorkingPeriod = (joinDate, leavingDate) => {
    const join = new Date(joinDate);
    const end = leavingDate ? new Date(leavingDate) : new Date();
    const diffTime = Math.abs(end - join);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const years = Math.floor(diffDays / 365);
    const months = Math.floor((diffDays % 365) / 30);
    
    if (years > 0) {
      return `${years} year${years > 1 ? 's' : ''} and ${months} month${months > 1 ? 's' : ''}`;
    } else {
      return `${months} month${months > 1 ? 's' : ''}`;
    }
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.header}>
          <h1>Verifying Certificate...</h1>
          <div style={styles.loadingSpinner}></div>
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
        {verificationStatus === "verified" ? (
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
                    <p style={styles.employeeStatus}>
                      Status: <span style={{
                        color: employee.status === 'active' ? '#4caf50' : 
                               employee.status === 'inactive' ? '#f44336' : '#ff9800'
                      }}>{employee.status}</span>
                    </p>
                  </div>
                </div>

                <div style={styles.detailsGrid}>
                  <div style={styles.detailItem}>
                    <strong>Employee ID:</strong> {employee.employee_id}
                  </div>
                  <div style={styles.detailItem}>
                    <strong>Employment Period:</strong> {new Date(employee.join_date).toLocaleDateString()} to {employee.leaving_date ? new Date(employee.leaving_date).toLocaleDateString() : 'Present'}
                  </div>
                  <div style={styles.detailItem}>
                    <strong>Experience:</strong> {calculateWorkingPeriod(employee.join_date, employee.leaving_date)}
                  </div>
                  <div style={styles.detailItem}>
                    <strong>Last Position:</strong> {employee.position}
                  </div>
                  <div style={styles.detailItem}>
                    <strong>Last Salary:</strong> Rs {employee.salary.toLocaleString()}
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
                <li>The employee record has been removed from our system</li>
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

const styles = {
  container: {
    padding: '20px',
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    maxWidth: '800px',
    margin: '0 auto',
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #FFF8F0 0%, #FFEBDD 100%)',
  },
  header: {
    textAlign: 'center',
    marginBottom: '30px',
    padding: '30px',
    background: 'linear-gradient(135deg, #FF6B35, #F7931E)',
    borderRadius: '20px',
    color: 'white',
    boxShadow: '0 10px 30px rgba(255, 107, 53, 0.3)',
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
  content: {
    background: 'white',
    borderRadius: '20px',
    padding: '30px',
    boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
    marginBottom: '30px',
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
    maxWidth: '600px',
    margin: '0 auto',
  },
  detailsCard: {
    background: '#f9f9f9',
    borderRadius: '15px',
    padding: '25px',
    marginBottom: '25px',
    textAlign: 'left',
    border: '1px solid #e0e0e0',
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
    padding: '15px',
    background: 'white',
    borderRadius: '10px',
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
    borderRadius: '15px',
    padding: '25px',
    marginBottom: '25px',
    textAlign: 'left',
    border: '1px solid #e0e0e0',
  },
  employeeDetails: {
    marginTop: '15px',
  },
  employeeHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
    marginBottom: '20px',
    padding: '20px',
    background: 'white',
    borderRadius: '15px',
    border: '1px solid #e0e0e0',
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
    margin: '0 0 5px 0',
  },
  employeeStatus: {
    fontSize: '1rem',
    color: '#666',
    margin: '0',
  },
  actions: {
    marginTop: '30px',
  },
  printButton: {
    background: 'linear-gradient(135deg, #2196f3, #1976d2)',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    padding: '12px 24px',
    cursor: 'pointer',
    fontSize: '1rem',
    fontWeight: '600',
    boxShadow: '0 5px 15px rgba(33, 150, 243, 0.3)',
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
  loadingSpinner: {
    border: '4px solid rgba(255, 255, 255, 0.3)',
    borderTop: '4px solid white',
    borderRadius: '50%',
    width: '40px',
    height: '40px',
    animation: 'spin 1s linear infinite',
    margin: '20px auto',
  },
};

export default CertificateVerification;