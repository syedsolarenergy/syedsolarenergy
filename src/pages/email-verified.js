import React from "react";
import logo from "../assets/logo.png";

const EmailVerified = () => {
  return (
    <div
      style={{
        background: "linear-gradient(to bottom, #ff9800, #e65100)",
        height: "100vh",
        width: "100vw",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
        margin: 0,
        padding: 0,
        overflow: "hidden",
        position: "fixed",
        top: 0,
        left: 0,
        zIndex: 9999,
      }}
    >
      <img src={logo} alt="Solar Olagawa Logo" style={{ width: 100, height: 100, marginBottom: 20 }} />

      <h1 style={{ color: "#fff", fontSize: 28, marginBottom: 10 }}>🎉 Email Verified</h1>
      <p style={{ color: "#fff", fontSize: 18, textAlign: "center", maxWidth: 400 }}>
        Congratulations! Your Email has been successfully verified for <strong>Solar Olagawa App</strong>.
        <br />اب آپ سولا اولگاوا ایپ میں لاگ ان کر سکتے ہیں۔<br /> اوسے تاسو کولای شۍ چی اوس سولا اولگاوا ایپ ته لوگ ان شی
      </p>
    </div>
  );
};

export default EmailVerified;
