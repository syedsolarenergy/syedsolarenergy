import React from "react";

const EmailVerifiedPage = () => {
  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>🎉 Email Verified</h1>
        <p style={styles.text}>
          Your email has been successfully verified.
        </p>
        <a href="/" style={styles.button}>Go to Home</a>
      </div>
    </div>
  );
};

const styles = {
  container: {
    background: "linear-gradient(135deg, #FFA726, #FB8C00)",
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontFamily: "Arial, sans-serif"
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: "20px",
    padding: "40px",
    textAlign: "center",
    boxShadow: "0 8px 16px rgba(0,0,0,0.2)"
  },
  title: {
    fontSize: "30px",
    marginBottom: "10px",
    color: "#E65100"
  },
  text: {
    fontSize: "18px",
    marginBottom: "20px"
  },
  button: {
    textDecoration: "none",
    padding: "12px 24px",
    backgroundColor: "#E65100",
    color: "#fff",
    borderRadius: "8px",
    fontWeight: "bold"
  }
};

export default EmailVerifiedPage;
